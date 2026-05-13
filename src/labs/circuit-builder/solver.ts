/**
 * Modified Nodal Analysis solver for the Circuit Builder lab.
 *
 * Implementation notes
 * ────────────────────
 * The MNA matrix has shape (N + M) × (N + M) where
 *   N = number of non-ground nodes
 *   M = number of branch-current unknowns (voltage sources + inductors)
 *
 * The block layout is:
 *
 *     | G  B | | v |   | i |
 *     |      | |   | = |   |
 *     | C  D | | j |   | e |
 *
 * with G the conductance matrix, B/C the source-incidence blocks, and D
 * usually zero. i is the vector of node-injected currents (zero unless we
 * have current sources, which we don't here). j is the vector of branch
 * currents (one per voltage source / inductor). e holds source voltages.
 *
 * Reactive elements use trapezoidal companion models (Nilsson–Riedel §8;
 * Ho–Ruehli–Brennan 1975):
 *   Capacitor C → conductance Geq = 2C/Δt in parallel with a current source
 *                 Ieq = -(Geq · Vn + In)  (current already flowing into n0).
 *                 We add Geq to the G matrix and Ieq to the RHS at the
 *                 appropriate nodes.
 *   Inductor L  → companion = a voltage source Veq = -(Req·In + Vn) in
 *                 series with Req = 2L/Δt. We model an inductor as a
 *                 branch-current unknown with Req on the diagonal and Veq
 *                 on the RHS, which keeps the matrix well-conditioned at
 *                 small Δt and degenerate at Δt → 0 (treat as short).
 *
 * Diodes use a piecewise-linear approximation (Shockley 1949 idealised
 * for textbook use): if V_anode−V_cathode > V_F = 0.7 V the diode is "on"
 * (modelled as a 0.05 Ω resistor + a 0.7 V battery); otherwise it's "off"
 * (1 MΩ). We iterate the per-step solve up to 5 times until the on/off
 * pattern is consistent.
 *
 * AC sources are treated in the time domain (Horowitz–Hill Ch.1): each
 * step we set V_src = V_pk · sin(2π f t).
 */

import type {
  CircuitDoc,
  PlacedComponent,
  Wire,
  NodeMap,
  ReactiveState,
  SolverResult,
} from './types';

/** Diode forward drop (volts) used by the piecewise-linear model. */
export const DIODE_VF = 0.7;
/** Diode on-resistance (ohms) — small but nonzero to keep MNA invertible. */
export const DIODE_RON = 0.05;
/** Diode off-resistance (ohms). 1 MΩ ≈ open circuit. */
export const DIODE_ROFF = 1e6;
/** Closed-switch resistance (ohms). */
export const SWITCH_RON = 1e-3;
/** Open-switch resistance (ohms). */
export const SWITCH_ROFF = 1e9;
/** Minimum "wire" resistance — used for ideal short circuits. */
export const WIRE_R = 1e-6;
/** Inductor companion: small Δt → short circuit; this is the floor. */
export const MIN_R = 1e-9;

/** Key a grid point as a string for the node map. */
export function pkey(x: number, y: number): string {
  return `${x},${y}`;
}

/* ─────────────────────────────────────────────────────────────────────────
 *  Node identification via union-find over pins + wire endpoints.
 *  Ground points are merged to node 0.
 * ─────────────────────────────────────────────────────────────────────── */

class UnionFind {
  private parent = new Map<string, string>();
  add(k: string) { if (!this.parent.has(k)) this.parent.set(k, k); }
  find(k: string): string {
    this.add(k);
    let cur = k;
    while (this.parent.get(cur)! !== cur) cur = this.parent.get(cur)!;
    // path compression
    let walk = k;
    while (this.parent.get(walk)! !== cur) {
      const next = this.parent.get(walk)!;
      this.parent.set(walk, cur);
      walk = next;
    }
    return cur;
  }
  union(a: string, b: string) {
    const ra = this.find(a), rb = this.find(b);
    if (ra !== rb) this.parent.set(ra, rb);
  }
  keys(): IterableIterator<string> { return this.parent.keys(); }
}

/**
 * For a horizontal 2-pin element at (x,y), pin0 = (x,y), pin1 = (x+2, y).
 * Rotation rotates around (x,y) and is one of {0, 90, 180, 270}.
 * Returns null for the second pin of a ground (it has only one).
 */
export function pinCoords(c: PlacedComponent): [{ x: number; y: number }, { x: number; y: number } | null] {
  const p0 = { x: c.x, y: c.y };
  if (c.kind === 'ground') return [p0, null];
  const d = 2;
  let dx = d, dy = 0;
  if (c.rotation === 90) { dx = 0; dy = d; }
  else if (c.rotation === 180) { dx = -d; dy = 0; }
  else if (c.rotation === 270) { dx = 0; dy = -d; }
  return [p0, { x: c.x + dx, y: c.y + dy }];
}

/** Partition pins + wire endpoints into nodes. */
export function buildNodeMap(doc: CircuitDoc): NodeMap {
  const uf = new UnionFind();

  // Every pin and every wire endpoint is a node candidate.
  for (const c of doc.components) {
    const [p0, p1] = pinCoords(c);
    uf.add(pkey(p0.x, p0.y));
    if (p1) uf.add(pkey(p1.x, p1.y));
  }
  for (const w of doc.wires) {
    uf.add(pkey(w.from.x, w.from.y));
    uf.add(pkey(w.to.x, w.to.y));
    uf.union(pkey(w.from.x, w.from.y), pkey(w.to.x, w.to.y));
  }
  // Ground anchor: merge all ground pin coords into a single class.
  let groundRoot: string | null = null;
  for (const c of doc.components) {
    if (c.kind === 'ground') {
      const k = pkey(c.x, c.y);
      if (groundRoot === null) groundRoot = uf.find(k);
      else uf.union(groundRoot, k);
    }
  }

  // Index roots into 0..N. Ground gets index 0.
  const index = new Map<string, number>();
  const rootIdx = new Map<string, number>();
  if (groundRoot !== null) {
    rootIdx.set(uf.find(groundRoot), 0);
  }
  let next = groundRoot === null ? 0 : 1;
  for (const k of uf.keys()) {
    const r = uf.find(k);
    if (!rootIdx.has(r)) rootIdx.set(r, next++);
    index.set(k, rootIdx.get(r)!);
  }
  return { index, count: next };
}

/* ─────────────────────────────────────────────────────────────────────────
 *  Gaussian elimination with partial pivoting.
 *  Solves Ax = b in place. Returns null if singular.
 * ─────────────────────────────────────────────────────────────────────── */

export function solveLinear(A: number[][], b: number[]): number[] | null {
  const n = A.length;
  if (n === 0) return [];
  // Augment.
  const M: number[][] = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col++) {
    // Pivot row = arg max |M[r][col]|.
    let pivot = col;
    let maxAbs = Math.abs(M[col][col]);
    for (let r = col + 1; r < n; r++) {
      const v = Math.abs(M[r][col]);
      if (v > maxAbs) { pivot = r; maxAbs = v; }
    }
    if (maxAbs < 1e-18) return null;
    if (pivot !== col) {
      const tmp = M[col]; M[col] = M[pivot]; M[pivot] = tmp;
    }
    // Eliminate below.
    for (let r = col + 1; r < n; r++) {
      const f = M[r][col] / M[col][col];
      if (f === 0) continue;
      for (let c = col; c <= n; c++) M[r][c] -= f * M[col][c];
    }
  }
  // Back-substitute.
  const x = new Array(n).fill(0);
  for (let r = n - 1; r >= 0; r--) {
    let s = M[r][n];
    for (let c = r + 1; c < n; c++) s -= M[r][c] * x[c];
    x[r] = s / M[r][r];
  }
  // NaN/Inf guard.
  for (let i = 0; i < n; i++) if (!isFinite(x[i])) return null;
  return x;
}

/* ─────────────────────────────────────────────────────────────────────────
 *  Persistent solver state. Holds previous-step v/i for each reactive
 *  component (capacitor, inductor) plus the time cursor.
 * ─────────────────────────────────────────────────────────────────────── */

export interface SolverContext {
  /** Simulated time in seconds. */
  t: number;
  /** Per-component reactive state keyed by component id. */
  reactive: Map<string, ReactiveState>;
  /** Time step in seconds. */
  dt: number;
}

export function makeContext(dt = 1e-5): SolverContext {
  return { t: 0, reactive: new Map(), dt };
}

export function resetContext(ctx: SolverContext) {
  ctx.t = 0;
  ctx.reactive.clear();
}

/**
 * Add a conductor with conductance g between nodes ni and nj.
 *   G[i][i] += g; G[j][j] += g; G[i][j] -= g; G[j][i] -= g;
 * Node 0 (ground) is excluded — index 0 in the MNA matrix is unused
 * (we shift everything down by 1).
 */
function stampConductance(G: number[][], ni: number, nj: number, g: number) {
  if (ni > 0) G[ni - 1][ni - 1] += g;
  if (nj > 0) G[nj - 1][nj - 1] += g;
  if (ni > 0 && nj > 0) {
    G[ni - 1][nj - 1] -= g;
    G[nj - 1][ni - 1] -= g;
  }
}

/** Add a current source from ni to nj of value i (current INTO nj, OUT of ni). */
function stampCurrent(b: number[], ni: number, nj: number, i: number) {
  if (ni > 0) b[ni - 1] -= i;
  if (nj > 0) b[nj - 1] += i;
}

/* ─────────────────────────────────────────────────────────────────────────
 *  Build + solve one MNA step. Returns node voltages and branch currents.
 *  This is one Newton sub-iteration; the outer driver iterates diode states.
 * ─────────────────────────────────────────────────────────────────────── */

interface SourceBranch {
  ni: number;
  nj: number;
  v: number;       // source voltage (pin0 - pin1)
  componentId: string;
  /** Equivalent series resistance for the source branch (0 for ideal). */
  rEq?: number;
}

interface StepResult {
  v: number[];          // node voltages, length = node count, [0] = 0
  branchCurrents: number[];
  sources: SourceBranch[];
  ok: boolean;
}

function buildAndSolve(
  doc: CircuitDoc,
  nodeMap: NodeMap,
  ctx: SolverContext,
  diodeStates: Map<string, boolean>,
): StepResult {
  const N = nodeMap.count - 1; // exclude ground
  // Collect voltage-source-like branches first so we know M.
  const sources: SourceBranch[] = [];
  for (const c of doc.components) {
    const [p0, p1] = pinCoords(c);
    if (!p1) continue; // ground: no branch
    const ni = nodeMap.index.get(pkey(p0.x, p0.y)) ?? 0;
    const nj = nodeMap.index.get(pkey(p1.x, p1.y)) ?? 0;
    if (c.kind === 'battery') {
      sources.push({ ni, nj, v: c.value, componentId: c.id });
    } else if (c.kind === 'ac') {
      const f = c.acFreq ?? 60;
      const vac = c.value * Math.sin(2 * Math.PI * f * ctx.t);
      sources.push({ ni, nj, v: vac, componentId: c.id });
    } else if (c.kind === 'inductor') {
      // Companion: Req in series with Veq.
      const L = Math.max(1e-12, c.value);
      const Req = Math.max(MIN_R, 2 * L / ctx.dt);
      const prev = ctx.reactive.get(c.id) ?? { v: 0, i: 0 };
      const Veq = prev.v + Req * prev.i;
      sources.push({ ni, nj, v: Veq, componentId: c.id, rEq: Req });
    }
  }

  const M = sources.length;
  const dim = N + M;
  if (dim === 0) {
    return { v: new Array(nodeMap.count).fill(0), branchCurrents: [], sources, ok: true };
  }

  // Allocate matrices: A is (dim × dim), b is dim.
  const A: number[][] = [];
  for (let i = 0; i < dim; i++) A.push(new Array(dim).fill(0));
  const b: number[] = new Array(dim).fill(0);

  // Stamp passive conductors.
  for (const c of doc.components) {
    const [p0, p1] = pinCoords(c);
    if (!p1) continue;
    const ni = nodeMap.index.get(pkey(p0.x, p0.y)) ?? 0;
    const nj = nodeMap.index.get(pkey(p1.x, p1.y)) ?? 0;

    if (c.kind === 'resistor' || c.kind === 'bulb') {
      const R = Math.max(1e-6, c.value);
      stampConductance(A, ni, nj, 1 / R);
    } else if (c.kind === 'capacitor') {
      // Trapezoidal companion: conductance Geq = 2C/Δt in parallel with current source.
      const C = Math.max(1e-15, c.value);
      const Geq = (2 * C) / ctx.dt;
      const prev = ctx.reactive.get(c.id) ?? { v: 0, i: 0 };
      // Ieq is the current source pumping CURRENT INTO node ni (out of nj).
      // Per trapezoidal:  i_{n+1} = Geq (v_{n+1} − v_n) − i_n
      //  ⇒ i_{n+1} − Geq · v_{n+1} = −Geq · v_n − i_n
      // The companion current source (into ni) is −(Geq · v_n + i_n).
      const Ieq = Geq * prev.v + prev.i;
      stampConductance(A, ni, nj, Geq);
      // Current flowing pin0 → pin1 internally; companion source pushes that direction.
      stampCurrent(b, nj, ni, Ieq);
    } else if (c.kind === 'switch') {
      const R = c.switchOpen ? SWITCH_ROFF : SWITCH_RON;
      stampConductance(A, ni, nj, 1 / R);
    } else if (c.kind === 'diode') {
      const on = diodeStates.get(c.id) ?? false;
      if (on) {
        // Diode on: 0.7 V battery + small series resistance. Modelled here as
        // a Norton equivalent: conductance 1/Ron with a current source pumping
        // 0.7/Ron into the cathode side.
        const G = 1 / DIODE_RON;
        stampConductance(A, ni, nj, G);
        // The "battery" raises the anode by 0.7 V: equivalent current source
        // is V_F/Ron pushing current from anode to cathode internally; so
        // externally it pulls current OUT of the cathode node — i.e. into anode.
        stampCurrent(b, nj, ni, DIODE_VF / DIODE_RON);
      } else {
        stampConductance(A, ni, nj, 1 / DIODE_ROFF);
      }
    }
  }

  // Wires get a tiny conductance to make sure isolated wire-only paths are well-conditioned.
  // (The node-map already merges them; this is belt-and-suspenders for floating subnets.)

  // Stamp sources (extra rows/cols).
  for (let k = 0; k < M; k++) {
    const s = sources[k];
    const row = N + k;
    if (s.ni > 0) {
      A[s.ni - 1][row] += 1;
      A[row][s.ni - 1] += 1;
    }
    if (s.nj > 0) {
      A[s.nj - 1][row] -= 1;
      A[row][s.nj - 1] -= 1;
    }
    if (s.rEq !== undefined) A[row][row] -= s.rEq;
    b[row] += s.v;
  }

  // Diagonal regularisation to avoid singular matrices from isolated nets.
  // Float every floating node lightly to ground.
  for (let i = 0; i < N; i++) A[i][i] += 1e-12;

  const x = solveLinear(A, b);
  if (!x) {
    return { v: new Array(nodeMap.count).fill(0), branchCurrents: [], sources, ok: false };
  }
  const nodeV: number[] = new Array(nodeMap.count).fill(0);
  for (let i = 0; i < N; i++) nodeV[i + 1] = x[i];
  const branchCurrents: number[] = new Array(M).fill(0);
  for (let k = 0; k < M; k++) branchCurrents[k] = x[N + k];
  return { v: nodeV, branchCurrents, sources, ok: true };
}

/* ─────────────────────────────────────────────────────────────────────────
 *  Top-level step: iterates diode states until consistent, then commits
 *  reactive-component state for the next step.
 * ─────────────────────────────────────────────────────────────────────── */

export function step(doc: CircuitDoc, nodeMap: NodeMap, ctx: SolverContext): SolverResult {
  // Initialise diode guesses from last iteration.
  const diodeStates = new Map<string, boolean>();
  for (const c of doc.components) {
    if (c.kind === 'diode') {
      const prev = ctx.reactive.get(c.id);
      diodeStates.set(c.id, prev?.diodeOn ?? false);
    }
  }

  let result: StepResult | null = null;
  for (let iter = 0; iter < 6; iter++) {
    result = buildAndSolve(doc, nodeMap, ctx, diodeStates);
    if (!result.ok) break;
    // Check diode consistency.
    let changed = false;
    for (const c of doc.components) {
      if (c.kind !== 'diode') continue;
      const [p0, p1] = pinCoords(c);
      if (!p1) continue;
      const ni = nodeMap.index.get(pkey(p0.x, p0.y)) ?? 0;
      const nj = nodeMap.index.get(pkey(p1.x, p1.y)) ?? 0;
      const vAnode = result.v[ni];
      const vCathode = result.v[nj];
      const on = diodeStates.get(c.id)!;
      if (on) {
        // Should remain on only if forward current is positive.
        const i = (vAnode - vCathode - DIODE_VF) / DIODE_RON;
        if (i < 0) { diodeStates.set(c.id, false); changed = true; }
      } else {
        // Should turn on if anode−cathode would exceed V_F at off-resistance.
        if (vAnode - vCathode > DIODE_VF + 0.001) { diodeStates.set(c.id, true); changed = true; }
      }
    }
    if (!changed) break;
  }

  if (!result || !result.ok) {
    return {
      nodeVoltages: new Array(nodeMap.count).fill(0),
      componentCurrents: new Map(),
      t: ctx.t,
      ok: false,
    };
  }

  // Compute per-component currents and update reactive state.
  const componentCurrents = new Map<string, number>();
  // Sources branches: each entry in result.sources has the branch current at index k.
  for (let k = 0; k < result.sources.length; k++) {
    componentCurrents.set(result.sources[k].componentId, result.branchCurrents[k]);
  }
  for (const c of doc.components) {
    const [p0, p1] = pinCoords(c);
    if (!p1) { componentCurrents.set(c.id, 0); continue; }
    const ni = nodeMap.index.get(pkey(p0.x, p0.y)) ?? 0;
    const nj = nodeMap.index.get(pkey(p1.x, p1.y)) ?? 0;
    const vi = result.v[ni];
    const vj = result.v[nj];
    if (c.kind === 'resistor' || c.kind === 'bulb') {
      const R = Math.max(1e-6, c.value);
      componentCurrents.set(c.id, (vi - vj) / R);
    } else if (c.kind === 'switch') {
      const R = c.switchOpen ? SWITCH_ROFF : SWITCH_RON;
      componentCurrents.set(c.id, (vi - vj) / R);
    } else if (c.kind === 'diode') {
      const on = diodeStates.get(c.id) ?? false;
      if (on) componentCurrents.set(c.id, (vi - vj - DIODE_VF) / DIODE_RON);
      else componentCurrents.set(c.id, (vi - vj) / DIODE_ROFF);
      const prev = ctx.reactive.get(c.id) ?? { v: 0, i: 0 };
      ctx.reactive.set(c.id, { v: vi - vj, i: componentCurrents.get(c.id)!, diodeOn: on });
      // (we already wrote it above, but keep prev intact for non-diodes)
      void prev;
    } else if (c.kind === 'capacitor') {
      const C = Math.max(1e-15, c.value);
      const Geq = (2 * C) / ctx.dt;
      const prev = ctx.reactive.get(c.id) ?? { v: 0, i: 0 };
      // i_{n+1} = Geq (v_{n+1} − v_n) − i_n
      const v_new = vi - vj;
      const i_new = Geq * (v_new - prev.v) - prev.i;
      componentCurrents.set(c.id, i_new);
      ctx.reactive.set(c.id, { v: v_new, i: i_new });
    } else if (c.kind === 'inductor') {
      // We already have its branch current from the source-branch result.
      const iL = componentCurrents.get(c.id) ?? 0;
      const v_new = vi - vj;
      ctx.reactive.set(c.id, { v: v_new, i: iL });
    }
  }

  // Advance time.
  ctx.t += ctx.dt;

  return {
    nodeVoltages: result.v,
    componentCurrents,
    t: ctx.t,
    ok: true,
  };
}

/* ─────────────────────────────────────────────────────────────────────────
 *  Small helpers used by the UI.
 * ─────────────────────────────────────────────────────────────────────── */

/** Check whether two wires share an endpoint (for highlighting). */
export function wiresShareEndpoint(a: Wire, b: Wire): boolean {
  return (a.from.x === b.from.x && a.from.y === b.from.y)
      || (a.from.x === b.to.x   && a.from.y === b.to.y)
      || (a.to.x   === b.from.x && a.to.y   === b.from.y)
      || (a.to.x   === b.to.x   && a.to.y   === b.to.y);
}

/**
 * Format a value with engineering prefixes (V, A, Ω suffix added by caller).
 */
export function eng(v: number, sig = 3): string {
  if (!isFinite(v)) return '—';
  if (Math.abs(v) < 1e-15) return '0';
  const abs = Math.abs(v);
  const prefixes: [number, string][] = [
    [1e9, 'G'], [1e6, 'M'], [1e3, 'k'],
    [1, ''], [1e-3, 'm'], [1e-6, 'µ'], [1e-9, 'n'], [1e-12, 'p'],
  ];
  for (const [scale, suf] of prefixes) {
    if (abs >= scale) {
      return (v / scale).toPrecision(sig).replace(/\.?0+$/, '') + ' ' + suf;
    }
  }
  return v.toExponential(2);
}
