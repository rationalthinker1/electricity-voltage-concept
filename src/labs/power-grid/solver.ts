/**
 * Power-flow + frequency-dynamics solver for the Power Grid Simulator.
 *
 * Two coupled solvers run every tick:
 *
 *  1. Linearised DC power flow.
 *     For high-voltage networks where R ≪ X and |V| ≈ 1 pu, the real-power
 *     flow on a line between buses i and j is well-approximated by
 *
 *         P_ij  ≈  (θ_i − θ_j) / X_ij
 *
 *     (Grainger & Stevenson, "Power System Analysis", §9). This linearises
 *     the nodal balance ΣP_inj = 0 into a sparse linear system
 *
 *         B' θ = P_inj
 *
 *     where B' is the (N−1) × (N−1) susceptance matrix (slack-bus removed).
 *     We solve it with the same Gaussian elimination routine as the
 *     Circuit-Builder lab.
 *
 *  2. Swing equation for system frequency.
 *
 *         2H · df/dt  =  (P_mech − P_elec) / S_base  −  D · Δf
 *
 *     With H in seconds, this integrates with a 0.1 s Euler step. When a
 *     generator trips, the imbalance kicks df/dt negative; droop control
 *     on the surviving units arrests the fall (Kundur, "Power System
 *     Stability and Control", §11).
 *
 * A reactive-power pass approximates voltage magnitudes after the angles
 * are known. We do not run a full Newton-Raphson; the goal here is
 * pedagogical, and the DC + post-hoc-V approximation gives the right
 * intuition for ≤ 20-bus toy systems.
 */

import { solveLinear } from '../circuit-builder/solver';
import type {
  Bus,
  FrequencyState,
  Generator,
  GridDoc,
  Line,
  Load,
  PowerFlowResult,
  SystemSnapshot,
  Transformer,
} from './types';

/** System MVA base used for per-unit conversions. */
export const S_BASE_MVA = 100;
/** Frequency-droop damping constant D in per-unit-MW / Hz. */
export const FREQ_DAMPING = 1.0;
/** Under-frequency load-shed threshold in Hz. */
export const UFLS_THRESHOLD_HZ = 59.3;
/** Load-shed rate at which load is dropped once UFLS triggers (fraction/sec). */
export const UFLS_RATE = 0.10;
/** Time step for frequency integration. */
export const FREQ_DT = 0.1;

/* ─────────────────────────── Power flow ─────────────────────────── */

/**
 * Build the susceptance matrix B' for the DC flow.
 * Slack bus is bus index 0 (the bus with the largest active generator).
 * Returns also the bus index map (id → row in the reduced system).
 */
export function buildSusceptance(doc: GridDoc): {
  busIndex: Map<string, number>;
  slackBusId: string;
  B: number[][];
} {
  const buses = doc.buses;
  const N = buses.length;
  if (N === 0) {
    return { busIndex: new Map(), slackBusId: '', B: [] };
  }

  // Pick slack bus: the one with the largest (ratedMW × dispatch) of a
  // non-tripped generator. Falls back to first bus if none.
  let slackBusId = buses[0].id;
  let slackPower = -Infinity;
  for (const b of buses) {
    for (const g of b.generators) {
      if (g.tripped) continue;
      const p = g.ratedMW * Math.max(0.01, g.dispatch);
      if (p > slackPower) {
        slackPower = p;
        slackBusId = b.id;
      }
    }
  }

  const busIndex = new Map<string, number>();
  busIndex.set(slackBusId, 0);
  let next = 1;
  for (const b of buses) {
    if (b.id === slackBusId) continue;
    busIndex.set(b.id, next++);
  }

  // The reduced B' matrix has the slack-bus row removed.
  const dim = N - 1;
  const B: number[][] = [];
  for (let i = 0; i < dim; i++) B.push(new Array(dim).fill(0));

  // Stamp each line: contributes b_ij = 1/X to (i,i), (j,j), and -b to (i,j), (j,i).
  function stamp(fromId: string, toId: string, xPu: number) {
    const xx = Math.max(1e-4, xPu);
    const b = 1 / xx;
    const i = busIndex.get(fromId);
    const j = busIndex.get(toId);
    if (i === undefined || j === undefined) return;
    const ri = i - 1, rj = j - 1;
    if (ri >= 0) B[ri][ri] += b;
    if (rj >= 0) B[rj][rj] += b;
    if (ri >= 0 && rj >= 0) {
      B[ri][rj] -= b;
      B[rj][ri] -= b;
    }
  }
  for (const ln of doc.lines) stamp(ln.fromBusId, ln.toBusId, ln.xPu);
  for (const tx of doc.transformers) {
    // Transformer X is on its own MVA base; rescale to system base.
    const xSys = tx.xPu * (S_BASE_MVA / Math.max(1, tx.ratingMVA));
    stamp(tx.fromBusId, tx.toBusId, xSys);
  }

  // Diagonal regularisation against floating subnets.
  for (let i = 0; i < dim; i++) B[i][i] += 1e-9;

  return { busIndex, slackBusId, B };
}

/**
 * Compute the real-power injection P_inj at each bus, in per-unit on
 * S_BASE_MVA. Generators are positive, loads negative.
 */
export function busInjections(doc: GridDoc, V: Map<string, number>): Map<string, number> {
  const out = new Map<string, number>();
  for (const b of doc.buses) {
    let p = 0;
    for (const g of b.generators) {
      if (g.tripped) continue;
      p += g.ratedMW * g.dispatch;
    }
    const vMag = V.get(b.id) ?? 1;
    for (const ld of b.loads) {
      p -= loadActualMW(ld, vMag);
    }
    out.set(b.id, p / S_BASE_MVA);
  }
  return out;
}

/** Effective MW drawn by a load given the actual bus voltage (per-unit). */
export function loadActualMW(ld: Load, vPu: number): number {
  const base = ld.ratedMW * ld.demandScale;
  switch (ld.kind) {
    case 'residential':
      // Constant impedance: P = V²/R, so scales with V².
      return base * vPu * vPu;
    case 'motor':
      // Constant current: P = V · I ⇒ scales with V.
      return base * vPu;
    case 'industrial':
    case 'ev':
      // Constant power: ignores voltage (within reason).
      return base;
  }
}

/**
 * Run the DC power flow. Returns angles, line flows, losses, and aggregate
 * generation / load totals.
 */
export function powerFlow(doc: GridDoc, prevV?: Map<string, number>): PowerFlowResult {
  const N = doc.buses.length;
  const empty: PowerFlowResult = {
    voltage: new Map(),
    theta: new Map(),
    flowMW: new Map(),
    lossMW: new Map(),
    totalGenMW: 0,
    totalLoadMW: 0,
    totalLossMW: 0,
    imbalanceMW: 0,
    ok: true,
  };
  if (N === 0) return empty;

  // Initial voltage guess: keep previous V, or default to 1 pu everywhere.
  const V = new Map<string, number>();
  for (const b of doc.buses) V.set(b.id, prevV?.get(b.id) ?? 1.0);

  // Build B' and solve B' θ = P_inj for the non-slack buses.
  const { busIndex, slackBusId, B } = buildSusceptance(doc);
  const Pinj = busInjections(doc, V);

  // Aggregate totals.
  let totalGenMW = 0;
  let totalLoadMW = 0;
  for (const b of doc.buses) {
    for (const g of b.generators) {
      if (g.tripped) continue;
      totalGenMW += g.ratedMW * g.dispatch;
    }
    for (const ld of b.loads) {
      totalLoadMW += loadActualMW(ld, V.get(b.id) ?? 1);
    }
  }

  const theta = new Map<string, number>();
  theta.set(slackBusId, 0);

  if (N > 1 && B.length > 0) {
    const rhs = new Array(B.length).fill(0);
    for (const b of doc.buses) {
      if (b.id === slackBusId) continue;
      const idx = busIndex.get(b.id);
      if (idx === undefined) continue;
      rhs[idx - 1] = Pinj.get(b.id) ?? 0;
    }
    const x = solveLinear(B, rhs);
    if (!x) {
      return { ...empty, voltage: V, ok: false };
    }
    for (const b of doc.buses) {
      if (b.id === slackBusId) continue;
      const idx = busIndex.get(b.id);
      if (idx === undefined) continue;
      theta.set(b.id, x[idx - 1]);
    }
  }

  // Voltage update: a one-shot reactive sag based on aggregated draw vs.
  // available capacity at each bus. This is not a full Q-V solve, but it
  // captures the dominant intuition: heavily-loaded buses sag below 1.0 pu.
  for (const b of doc.buses) {
    const draw = b.loads.reduce((s, ld) => s + ld.ratedMW * ld.demandScale * ld.pf, 0);
    const cap = b.generators.reduce(
      (s, g) => s + (g.tripped ? 0 : g.ratedMW),
      0,
    );
    // Simple bus-level voltage estimate: 1.00 nominal, drop 0.02 pu per 100 % over-draw.
    const slack = cap > 0 ? (cap - draw) / Math.max(cap, 1) : (draw > 0 ? -1 : 0);
    const vEst = 1.00 + 0.02 * Math.max(-1, Math.min(0.5, slack));
    V.set(b.id, clamp(vEst, 0.85, 1.10));
  }

  // Edge flows + losses.
  const flowMW = new Map<string, number>();
  const lossMW = new Map<string, number>();
  function edgeFlow(id: string, fromId: string, toId: string, rPu: number, xPu: number, xScale = 1) {
    const xx = Math.max(1e-4, xPu * xScale);
    const dTheta = (theta.get(fromId) ?? 0) - (theta.get(toId) ?? 0);
    const pPu = dTheta / xx;
    const pMW = pPu * S_BASE_MVA;
    flowMW.set(id, pMW);
    // Loss ≈ |I|² · R; in per-unit DC approx, |P|² R / V² ≈ |P|² R.
    const lossPu = pPu * pPu * rPu * xScale;
    lossMW.set(id, lossPu * S_BASE_MVA);
  }
  for (const ln of doc.lines) {
    edgeFlow(ln.id, ln.fromBusId, ln.toBusId, ln.rPu, ln.xPu);
  }
  for (const tx of doc.transformers) {
    // Transformer R is roughly 0.005 pu per unit X.
    edgeFlow(tx.id, tx.fromBusId, tx.toBusId, 0.005 * tx.xPu, tx.xPu,
      S_BASE_MVA / Math.max(1, tx.ratingMVA));
  }

  let totalLossMW = 0;
  for (const v of lossMW.values()) totalLossMW += v;

  // Imbalance: in DC flow this is identically 0 except for the slack-bus
  // dispatch deficiency, which we surface so the UI can warn the user.
  const imbalanceMW = totalGenMW - totalLoadMW - totalLossMW;

  return {
    voltage: V,
    theta,
    flowMW,
    lossMW,
    totalGenMW,
    totalLoadMW,
    totalLossMW,
    imbalanceMW,
    ok: true,
  };
}

/* ─────────────────────── Frequency dynamics ─────────────────────── */

/**
 * Integrate the swing equation by one Euler step of FREQ_DT seconds.
 *
 *     2 H_sys · df/dt  =  (P_gen − P_load) / S_base  −  D · Δf
 *
 * where H_sys is the system-aggregated inertia constant (Σ H_i × S_i / S_base)
 * and D is the load-damping coefficient. Generators with droop also adjust
 * their dispatch in response to Δf via primary control:
 *
 *     ΔP_g  =  −(1 / R_droop) · Δf  · P_rated
 *
 * Battery storage with H = 0.1 s acts as a fast-acting synthetic-inertia
 * source — H is low but droop is steep, so it injects fast and a lot.
 */
export function stepFrequency(
  doc: GridDoc,
  freq: FrequencyState,
  pf: PowerFlowResult,
): FrequencyState {
  // Aggregate H weighted by generator MVA online.
  let Hsys = 0;
  let totalCap = 0;
  for (const b of doc.buses) {
    for (const g of b.generators) {
      if (g.tripped) continue;
      Hsys += g.H * g.ratedMW;
      totalCap += g.ratedMW;
    }
  }
  Hsys = totalCap > 0 ? Hsys / totalCap : 4.0;

  const fNom = doc.nominalHz;
  const dFraction = (freq.hz - fNom) / fNom;

  // Net mechanical-electrical imbalance from the steady-state flow.
  // In per-unit on S_BASE_MVA.
  const imbalPu = pf.imbalanceMW / S_BASE_MVA;
  const dampPu = FREQ_DAMPING * dFraction;
  const rocof = (imbalPu - dampPu) / (2 * Hsys) * fNom;

  let nextHz = freq.hz + rocof * FREQ_DT;
  // Clip to a sane physical range.
  nextHz = clamp(nextHz, 56, 63);

  // Apply primary droop response to all online generators with droop > 0.
  // This isn't done by mutating dispatch — the caller manages that. We
  // expose rocof so the caller can apply governor response cleanly.

  // Trigger under-frequency load shedding if we cross UFLS_THRESHOLD_HZ.
  let shedFrac = freq.shedFrac;
  if (nextHz < UFLS_THRESHOLD_HZ) {
    shedFrac = Math.min(0.5, shedFrac + UFLS_RATE * FREQ_DT);
  } else if (nextHz > 59.9) {
    // Slowly restore shed load once frequency recovers.
    shedFrac = Math.max(0, shedFrac - UFLS_RATE * 0.5 * FREQ_DT);
  }

  return { hz: nextHz, rocof, shedFrac };
}

/**
 * Apply primary droop response: every governor-equipped generator picks
 * up (or sheds) load in proportion to the frequency deviation.
 * Returns a copy of the doc with adjusted dispatches.
 */
export function applyDroop(doc: GridDoc, freq: FrequencyState): GridDoc {
  const fNom = doc.nominalHz;
  const dPu = (freq.hz - fNom) / fNom;
  const buses: Bus[] = doc.buses.map((b) => ({
    ...b,
    generators: b.generators.map((g) => {
      if (g.tripped || g.droop <= 0) return g;
      // Δdispatch = −Δf_pu / R_droop, clamped to [0, 1].
      const delta = -dPu / Math.max(0.01, g.droop);
      // Batteries can go negative (charging) in nominal conditions, but
      // we don't override their nominal dispatch from droop unless the
      // grid is in trouble — we just add the delta and clamp.
      const lower = g.kind === 'battery' ? -1 : 0;
      const next = clamp(g.dispatch + delta, lower, 1);
      return { ...g, dispatch: next };
    }),
  }));
  return { ...doc, buses };
}

/**
 * Apply UFLS to the doc: scale residential + EV loads by (1 − shedFrac).
 * (We don't shed industrial loads — they're typically on their own circuits
 * with their own protection.)
 */
export function applyShedding(doc: GridDoc, shedFrac: number): GridDoc {
  if (shedFrac <= 0.0001) return doc;
  const buses: Bus[] = doc.buses.map((b) => ({
    ...b,
    loads: b.loads.map((ld) => {
      if (ld.kind === 'industrial') return ld;
      return { ...ld, demandScale: ld.demandScale * (1 - shedFrac) };
    }),
  }));
  return { ...doc, buses };
}

/* ─────────────────────────── Dispatch & cost ─────────────────────────── */

/**
 * Economic dispatch: redistribute load across non-tripped generators in
 * merit order (cheapest first). Returns a new doc with each generator's
 * `dispatch` set so that:
 *   Σ (g.dispatch × g.ratedMW)  =  required gen
 * with the cheapest generators filled to capacity first.
 */
export function dispatchMeritOrder(doc: GridDoc): GridDoc {
  // Collect all online generators in a single list with parent-bus index.
  const gens: { busIdx: number; genIdx: number; g: Generator }[] = [];
  doc.buses.forEach((b, bi) => {
    b.generators.forEach((g, gi) => {
      if (!g.tripped) gens.push({ busIdx: bi, genIdx: gi, g });
    });
  });
  // Sort by marginal cost ascending. Within the same cost, prefer renewables
  // (they have no fuel cost and would be curtailed first if we didn't).
  gens.sort((a, b) => a.g.cost - b.g.cost);

  // Compute total load (including losses estimate at 3 %).
  let totalLoad = 0;
  for (const b of doc.buses) {
    for (const ld of b.loads) totalLoad += ld.ratedMW * ld.demandScale;
  }
  let target = totalLoad * 1.03;

  // Fill cheapest generators to capacity.
  const dispatchMap = new Map<string, number>();
  for (const { g } of gens) {
    if (target <= 0) { dispatchMap.set(g.id, 0); continue; }
    const fill = Math.min(g.ratedMW, target);
    dispatchMap.set(g.id, fill / Math.max(1, g.ratedMW));
    target -= fill;
  }

  const buses: Bus[] = doc.buses.map((b) => ({
    ...b,
    generators: b.generators.map((g) => {
      if (g.tripped) return g;
      const d = dispatchMap.get(g.id);
      return d === undefined ? g : { ...g, dispatch: d };
    }),
  }));
  return { ...doc, buses };
}

/** Locational marginal price = marginal generator's cost. */
export function marginalCost(doc: GridDoc): number {
  // The marginal generator is the most expensive one that's partially loaded.
  let lmp = 0;
  for (const b of doc.buses) {
    for (const g of b.generators) {
      if (g.tripped) continue;
      if (g.dispatch > 0.001 && g.dispatch < 0.999) {
        if (g.cost > lmp) lmp = g.cost;
      }
    }
  }
  // If no generator is partially loaded, the LMP is the highest-cost online unit.
  if (lmp === 0) {
    for (const b of doc.buses) {
      for (const g of b.generators) {
        if (g.tripped || g.dispatch <= 0.001) continue;
        if (g.cost > lmp) lmp = g.cost;
      }
    }
  }
  return lmp;
}

/** System-average CO₂ intensity, weighted by actual MW dispatch. */
export function co2Intensity(doc: GridDoc): number {
  let totalMW = 0;
  let totalCO2 = 0;
  for (const b of doc.buses) {
    for (const g of b.generators) {
      if (g.tripped) continue;
      const mw = g.ratedMW * Math.max(0, g.dispatch);
      totalMW += mw;
      totalCO2 += mw * g.co2;
    }
  }
  return totalMW > 0 ? totalCO2 / totalMW : 0;
}

/* ─────────────────────────── Snapshot ─────────────────────────── */

/**
 * Run one full snapshot: power flow + frequency step + LMP + CO₂.
 * Mutates `freq` via return value; the caller is responsible for storing
 * the returned freq state for the next tick.
 */
export function snapshot(
  doc: GridDoc,
  freqPrev: FrequencyState,
  prevV?: Map<string, number>,
): SystemSnapshot {
  const pf = powerFlow(doc, prevV);
  const freq = stepFrequency(doc, freqPrev, pf);
  return {
    pf,
    freq,
    t: 0, // caller fills in
    lmpUSDPerMWh: marginalCost(doc),
    co2Intensity: co2Intensity(doc),
  };
}

/* ─────────────────────────── Helpers ─────────────────────────── */

export function clamp(x: number, lo: number, hi: number): number {
  return x < lo ? lo : x > hi ? hi : x;
}

/** Engineering-prefix formatter for MW / MWh / MVA values. */
export function fmtMW(mw: number, digits = 1): string {
  if (!isFinite(mw)) return '—';
  const abs = Math.abs(mw);
  if (abs >= 1000) return (mw / 1000).toFixed(digits) + ' GW';
  if (abs >= 1) return mw.toFixed(digits) + ' MW';
  if (abs >= 0.001) return (mw * 1000).toFixed(0) + ' kW';
  return mw.toExponential(1) + ' MW';
}

export function fmtPct(x: number, digits = 0): string {
  if (!isFinite(x)) return '—';
  return (x * 100).toFixed(digits) + ' %';
}

export function fmtHz(hz: number): string {
  return hz.toFixed(2) + ' Hz';
}

/** Default per-mile R + X for an overhead line at a given kV class. */
export function lineImpedancePerMile(kv: number): { r: number; x: number } {
  // Per-unit on a 100 MVA, kV-base. Numbers reflect typical overhead-line
  // X/R ratios at each voltage class (Grainger & Stevenson, App. A).
  if (kv >= 230) return { r: 0.00010, x: 0.00080 };
  if (kv >= 138) return { r: 0.00025, x: 0.00150 };
  if (kv >= 69)  return { r: 0.00050, x: 0.00250 };
  if (kv >= 25)  return { r: 0.00200, x: 0.00500 };
  if (kv >= 12)  return { r: 0.00800, x: 0.01200 };
  return { r: 0.02000, x: 0.02500 };
}

/** Default thermal rating in MVA for a single-circuit line at a given kV. */
export function lineRating(kv: number): number {
  if (kv >= 230) return 600;
  if (kv >= 138) return 300;
  if (kv >= 69)  return 150;
  if (kv >= 25)  return 50;
  if (kv >= 12)  return 20;
  return 5;
}

/** Default generator parameters for a given kind. */
export function defaultGenerator(kind: Generator['kind']): Omit<Generator, 'id'> {
  switch (kind) {
    case 'coal':
      return { kind, ratedMW: 500, dispatch: 0.7, H: 5.0, droop: 0.05, cost: 25, co2: 900 };
    case 'ccgt':
      return { kind, ratedMW: 300, dispatch: 0.5, H: 4.0, droop: 0.05, cost: 45, co2: 400 };
    case 'hydro':
      return { kind, ratedMW: 200, dispatch: 0.4, H: 3.5, droop: 0.04, cost: 8, co2: 5 };
    case 'wind':
      return { kind, ratedMW: 150, dispatch: 0.3, H: 0, droop: 0, cost: 1, co2: 12 };
    case 'solar':
      return { kind, ratedMW: 150, dispatch: 0.3, H: 0, droop: 0, cost: 1, co2: 40 };
    case 'battery':
      return { kind, ratedMW: 100, dispatch: 0, H: 0.1, droop: 0.02, cost: 30, co2: 0, soc: 0.6, energyMWh: 200 };
  }
}

/** Default load parameters for a given kind. */
export function defaultLoad(kind: Load['kind']): Omit<Load, 'id'> {
  switch (kind) {
    case 'residential': return { kind, ratedMW: 60, demandScale: 1.0, pf: 0.95 };
    case 'industrial':  return { kind, ratedMW: 80, demandScale: 1.0, pf: 0.90 };
    case 'motor':       return { kind, ratedMW: 40, demandScale: 1.0, pf: 0.85 };
    case 'ev':          return { kind, ratedMW: 30, demandScale: 1.0, pf: 0.99 };
  }
}

/** Wrap a doc so generators / lines / transformers each get a stable id-lookup. */
export function indexEdges(doc: GridDoc): {
  busById: Map<string, Bus>;
  lineById: Map<string, Line>;
  transformerById: Map<string, Transformer>;
} {
  const busById = new Map<string, Bus>();
  for (const b of doc.buses) busById.set(b.id, b);
  const lineById = new Map<string, Line>();
  for (const l of doc.lines) lineById.set(l.id, l);
  const transformerById = new Map<string, Transformer>();
  for (const t of doc.transformers) transformerById.set(t.id, t);
  return { busById, lineById, transformerById };
}
