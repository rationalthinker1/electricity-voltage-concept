/**
 * Lab A.1 — Circuit Builder
 *
 *   G v = i   (Modified Nodal Analysis)
 *
 * An interactive schematic editor with a live time-domain MNA solver.
 *
 * What the user does
 * ──────────────────
 *   1. Pick a component kind in the left palette, then click the grid to drop it.
 *   2. Pick the Wire tool, click pin → pin to wire pieces together.
 *   3. Drop at least one Ground (the solver's reference node).
 *   4. The solver runs at ~16k integration steps/sec; readouts update live.
 *   5. Drop Voltmeter / Ammeter probes to inspect specific nodes / branches.
 *   6. Or click a Preset to load a worked example.
 *
 * Architecture
 * ────────────
 *   /labs/CircuitBuilderLab.tsx          ← this file (UI + simulation loop)
 *   /labs/circuit-builder/types.ts       ← document & solver types
 *   /labs/circuit-builder/solver.ts      ← MNA + trapezoidal companions
 *   /labs/circuit-builder/components.ts  ← canvas drawing for each kind
 *   /labs/circuit-builder/CanvasEditor   ← grid canvas + pointer handling
 *   /labs/circuit-builder/Palette        ← left sidebar
 *   /labs/circuit-builder/Inspector      ← right sidebar value editor
 *   /labs/circuit-builder/presets.ts     ← canned circuits
 *
 * Solver loop
 * ───────────
 * The solver is driven by an animation frame. Each frame steps the time
 * cursor by ~STEPS_PER_FRAME * dt. The reactive state of capacitors and
 * inductors persists between steps via the SolverContext; resetting the
 * sim wipes that state and zeroes time.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { LabShell } from '@/components/LabShell';
import { MathBlock, Pullout } from '@/components/Prose';
import { Cite } from '@/components/SourcesList';
import { BASE_LAB_SOURCES } from '@/labs/data/manifest';

import { CanvasEditor } from './circuit-builder/CanvasEditor';
import { Inspector } from './circuit-builder/Inspector';
import { Palette } from './circuit-builder/Palette';
import { defaultValue } from './circuit-builder/components';
import { getCanvasColors } from '@/lib/canvasTheme';
import { PRESETS, clonePresetDoc } from './circuit-builder/presets';
import type { CircuitPreset } from './circuit-builder/types';
import {
  buildNodeMap, eng, makeContext, pkey, resetContext, step,
} from './circuit-builder/solver';
import type {
  CircuitDoc, ComponentKind, GridPoint, PlacedComponent,
  SolverResult, NodeMap,
} from './circuit-builder/types';

const SLUG = 'circuit-builder';
const SOURCES = BASE_LAB_SOURCES[SLUG]!;

/** Default Δt for the integrator. Smaller = more accurate, more CPU. */
const DT = 5e-6;
/** Integration steps per animation frame. */
const STEPS_PER_FRAME = 8;
/** Sample window for the scope trace (seconds). */
const SCOPE_WINDOW = 0.05;

type ArmedTool = ComponentKind | 'wire' | 'voltmeter' | 'ammeter' | null;

/* ───────────────────────── Component ───────────────────────── */

export default function CircuitBuilderLab() {
  // The circuit document.
  const [doc, setDoc] = useState<CircuitDoc>(() => clonePresetDoc(PRESETS[0].doc));

  // Which preset is currently loaded (for showing educational info).
  const [activePresetId, setActivePresetId] = useState<string>(PRESETS[0]!.id);

  // UI state.
  const [armed, setArmed] = useState<ArmedTool>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedWireId, setSelectedWireId] = useState<string | null>(null);
  const [running, setRunning] = useState(true);
  const [solverResult, setSolverResult] = useState<SolverResult | null>(null);

  // Scope trace (rolling window of voltage at first voltmeter probe).
  const [scopeData, setScopeData] = useState<Array<{ t: number; v: number }>>([]);

  // Solver context lives in a ref so the rAF loop sees it without restarting.
  const ctxRef = useRef(makeContext(DT));
  const docRef = useRef(doc);
  useEffect(() => { docRef.current = doc; }, [doc]);

  // Node map: rebuilt whenever the document structure changes.
  const nodeMap: NodeMap = useMemo(() => buildNodeMap(doc), [doc]);
  const nodeMapRef = useRef(nodeMap);
  useEffect(() => { nodeMapRef.current = nodeMap; }, [nodeMap]);

  // Reset the solver whenever the topology meaningfully changes (any component or wire add/remove).
  // We reset on structural changes (id set) but not on value tweaks.
  const structureSig = useMemo(() => {
    return doc.components.map(c => c.id + ':' + c.kind + ':' + c.x + ',' + c.y + ':' + c.rotation).join('|')
      + '||' + doc.wires.map(w => w.id + ':' + w.from.x + ',' + w.from.y + '->' + w.to.x + ',' + w.to.y).join('|');
  }, [doc.components, doc.wires]);

  useEffect(() => {
    resetContext(ctxRef.current);
    setScopeData([]);
  }, [structureSig]);

  // Simulation loop.
  const runningRef = useRef(running);
  useEffect(() => { runningRef.current = running; }, [running]);

  useEffect(() => {
    let raf = 0;
    let lastSampleT = 0;
    const scope: Array<{ t: number; v: number }> = [];
    let resultLatest: SolverResult | null = null;
    let frameCounter = 0;

    function tick() {
      if (runningRef.current) {
        const d = docRef.current;
        const nm = nodeMapRef.current;
        for (let i = 0; i < STEPS_PER_FRAME; i++) {
          resultLatest = step(d, nm, ctxRef.current);
          if (!resultLatest.ok) break;
          // Sample for the scope at ~every 100 µs (200 samples / SCOPE_WINDOW).
          if (resultLatest.t - lastSampleT >= SCOPE_WINDOW / 200) {
            const probe = d.probes.find(p => p.kind === 'voltmeter');
            if (probe?.at) {
              const idx = nm.index.get(pkey(probe.at.x, probe.at.y));
              if (idx !== undefined) {
                scope.push({ t: resultLatest.t, v: resultLatest.nodeVoltages[idx] });
                while (scope.length > 0 && resultLatest.t - scope[0].t > SCOPE_WINDOW) scope.shift();
              }
            }
            lastSampleT = resultLatest.t;
          }
        }
      }
      // Push results to React no more than every other frame to avoid render storm.
      frameCounter++;
      if (frameCounter % 2 === 0 && resultLatest) {
        setSolverResult(resultLatest);
        setScopeData([...scope]);
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  /* ── Doc mutation helpers ── */

  const placeComponent = useCallback((kind: ComponentKind, at: GridPoint) => {
    const dv = defaultValue(kind);
    const id = `c${Date.now()}-${Math.floor(Math.random() * 9999)}`;
    setDoc(prev => ({
      ...prev,
      components: [...prev.components, {
        id, kind, x: at.x, y: at.y, rotation: 0,
        value: dv.value, acFreq: dv.acFreq, switchOpen: dv.switchOpen,
      }],
    }));
    setSelectedId(id);
    setArmed(null);
  }, []);

  const placeWire = useCallback((from: GridPoint, to: GridPoint) => {
    setDoc(prev => ({
      ...prev,
      wires: [...prev.wires, { id: `w${Date.now()}-${Math.floor(Math.random() * 9999)}`, from, to }],
    }));
  }, []);

  const moveComponent = useCallback((id: string, to: GridPoint) => {
    setDoc(prev => ({
      ...prev,
      components: prev.components.map(c => c.id === id ? { ...c, x: to.x, y: to.y } : c),
    }));
  }, []);

  const placeVoltProbe = useCallback((at: GridPoint) => {
    setDoc(prev => ({
      ...prev,
      probes: [...prev.probes, { id: `p${Date.now()}-${Math.floor(Math.random() * 9999)}`, kind: 'voltmeter', at }],
    }));
    setArmed(null);
  }, []);

  const placeAmmProbe = useCallback((componentId: string) => {
    setDoc(prev => ({
      ...prev,
      probes: [...prev.probes, { id: `p${Date.now()}-${Math.floor(Math.random() * 9999)}`, kind: 'ammeter', componentId }],
    }));
    setArmed(null);
  }, []);

  const deleteProbe = useCallback((id: string) => {
    setDoc(prev => ({ ...prev, probes: prev.probes.filter(p => p.id !== id) }));
  }, []);

  const updateSelected = useCallback((next: PlacedComponent) => {
    setDoc(prev => ({
      ...prev,
      components: prev.components.map(c => c.id === next.id ? next : c),
    }));
  }, []);

  const deleteSelected = useCallback(() => {
    if (selectedWireId) {
      setDoc(prev => ({ ...prev, wires: prev.wires.filter(w => w.id !== selectedWireId) }));
      setSelectedWireId(null);
      return;
    }
    if (!selectedId) return;
    setDoc(prev => ({
      ...prev,
      components: prev.components.filter(c => c.id !== selectedId),
      // Also drop any ammeter probes that referenced it.
      probes: prev.probes.filter(p => p.componentId !== selectedId),
    }));
    setSelectedId(null);
  }, [selectedId, selectedWireId]);

  // Delete / Backspace removes the current selection (wire or component).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Delete' && e.key !== 'Backspace') return;
      const t = e.target as HTMLElement | null;
      // Don't steal Backspace while the user is editing a value in the inspector.
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if (selectedWireId || selectedId) {
        e.preventDefault();
        deleteSelected();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [deleteSelected, selectedId, selectedWireId]);

  const rotateSelected = useCallback(() => {
    if (!selectedId) return;
    setDoc(prev => ({
      ...prev,
      components: prev.components.map(c => {
        if (c.id !== selectedId) return c;
        if (c.kind === 'ground') return c;
        const next: 0 | 90 | 180 | 270 = ((c.rotation + 90) % 360) as 0 | 90 | 180 | 270;
        return { ...c, rotation: next };
      }),
    }));
  }, [selectedId]);

  const loadPreset = useCallback((presetId: string) => {
    const preset = PRESETS.find(p => p.id === presetId);
    if (!preset) return;
    setDoc(clonePresetDoc(preset.doc));
    setActivePresetId(presetId);
    setSelectedId(null);
    setSelectedWireId(null);
    setArmed(null);
    resetContext(ctxRef.current);
  }, []);

  const clearAll = useCallback(() => {
    setDoc({ components: [], wires: [], probes: [] });
    setActivePresetId('');
    setSelectedId(null);
    setSelectedWireId(null);
    setArmed(null);
    resetContext(ctxRef.current);
  }, []);

  // Selecting a component clears the wire selection and vice versa.
  const selectComponent = useCallback((id: string | null) => {
    setSelectedId(id);
    if (id !== null) setSelectedWireId(null);
  }, []);
  const selectWire = useCallback((id: string | null) => {
    setSelectedWireId(id);
    if (id !== null) setSelectedId(null);
  }, []);

  const selected = useMemo(
    () => doc.components.find(c => c.id === selectedId) ?? null,
    [doc.components, selectedId],
  );

  /* ── Derived readouts ── */

  const readouts = useMemo(() => {
    if (!solverResult) return [];
    const out: Array<{ id: string; label: string; value: string; kind: string }> = [];
    for (const probe of doc.probes) {
      if (probe.kind === 'voltmeter' && probe.at) {
        const idx = nodeMap.index.get(pkey(probe.at.x, probe.at.y));
        const v = idx !== undefined ? solverResult.nodeVoltages[idx] : 0;
        out.push({
          id: probe.id,
          label: `V at (${probe.at.x}, ${probe.at.y})`,
          value: eng(v, 3) + 'V',
          kind: 'V',
        });
      } else if (probe.kind === 'ammeter' && probe.componentId) {
        const i = solverResult.componentCurrents.get(probe.componentId) ?? 0;
        const c = doc.components.find(cc => cc.id === probe.componentId);
        out.push({
          id: probe.id,
          label: `I through ${c?.kind ?? '?'}`,
          value: eng(i, 3) + 'A',
          kind: 'A',
        });
      }
    }
    return out;
  }, [solverResult, doc, nodeMap]);

  // Always-on summary: source current and component count.
  const summary = useMemo(() => {
    const totalNodes = nodeMap.count;
    const hasGround = doc.components.some(c => c.kind === 'ground');
    return {
      components: doc.components.length,
      wires: doc.wires.length,
      nodes: totalNodes,
      hasGround,
      t: solverResult?.t ?? 0,
      ok: solverResult?.ok ?? true,
    };
  }, [doc, nodeMap, solverResult]);

  /* ── Render ── */

  const labContent = (
    <div className="flex flex-col gap-lg mt-md">
      <div className="flex justify-between items-center gap-lg flex-wrap pb-md border-b border-border">
        <div className="flex items-center gap-sm flex-wrap">
          <span className="font-3 text-1 text-text-muted uppercase tracking-[.2em] mr-xs">Presets:</span>
          {PRESETS.map(p => (
            <button
              key={p.id}
              type="button"
              className="bg-bg-card text-text-dim border border-border font-3 text-2 py-[6px] px-md rounded-2 cursor-pointer transition-all duration-fast hover:text-text hover:border-text-dim hover:bg-bg-card-hover"
              onClick={() => loadPreset(p.id)}
              title={p.description}
            >{p.name}</button>
          ))}
        </div>
        <div className="flex items-center gap-sm flex-wrap">
          <button
            type="button"
            className={
              'border font-3 text-2 py-[6px] px-md rounded-2 cursor-pointer transition-all duration-fast bg-bg-card hover:bg-bg-card-hover ' +
              (running
                ? 'text-accent border-accent hover:text-accent hover:border-accent'
                : 'text-teal border-teal hover:text-teal hover:border-teal')
            }
            onClick={() => setRunning(r => !r)}
          >{running ? 'Pause' : 'Run'}</button>
          <button
            type="button"
            className="bg-bg-card text-text-dim border border-border font-3 text-2 py-[6px] px-md rounded-2 cursor-pointer transition-all duration-fast hover:text-text hover:border-text-dim hover:bg-bg-card-hover"
            onClick={() => {
              resetContext(ctxRef.current);
              setScopeData([]);
            }}
          >Reset sim</button>
          <button
            type="button"
            className="bg-bg-card text-text-muted border border-border font-3 text-2 py-[6px] px-md rounded-2 cursor-pointer transition-all duration-fast hover:text-pink hover:border-pink hover:bg-bg-card-hover"
            onClick={clearAll}
          >Clear</button>
        </div>
      </div>

      <div className="grid grid-cols-[220px_1fr_260px] gap-[20px] items-start max-xl:grid-cols-1">
        <aside className="bg-bg-card border border-border rounded-3 p-lg">
          <Palette armed={armed} onArm={setArmed} />
        </aside>

        <main className="flex flex-col gap-lg">
          <CanvasEditor
            components={doc.components}
            wires={doc.wires}
            probes={doc.probes}
            selectedId={selectedId}
            selectedWireId={selectedWireId}
            armed={armed}
            onPlaceComponent={placeComponent}
            onPlaceWire={placeWire}
            onSelect={selectComponent}
            onSelectWire={selectWire}
            onMoveComponent={moveComponent}
            onPlaceVoltProbe={placeVoltProbe}
            onPlaceAmmProbe={placeAmmProbe}
            onDeleteProbe={deleteProbe}
            solverResult={solverResult}
            nodeMap={nodeMap}
          />

          <div className="bg-bg-card border border-border rounded-3 p-lg">
            <div className="flex gap-xl flex-wrap">
              <div className="flex-1 min-w-[220px]">
                <div className="font-3 text-1 text-accent uppercase tracking-[.2em] mb-sm">Probes</div>
                {readouts.length === 0 && (
                  <div className="text-2 text-text-muted leading-[1.5]">
                    Drop a Voltmeter on a node or an Ammeter on a component to read it here.
                  </div>
                )}
                {readouts.map(r => (
                  <div key={r.id} className="flex justify-between gap-md py-[5px] border-b border-dashed border-border text-3 last:border-b-0">
                    <span className="text-text-dim font-1">{r.label}</span>
                    <span className="text-text font-3 font-medium">{r.value}</span>
                  </div>
                ))}
              </div>
              <div className="flex-1 min-w-[220px]">
                <div className="font-3 text-1 text-accent uppercase tracking-[.2em] mb-sm">Status</div>
                <div className="flex justify-between gap-md py-[5px] border-b border-dashed border-border text-3 last:border-b-0">
                  <span className="text-text-dim font-1">Components / wires</span>
                  <span className="text-text font-3 font-medium">{summary.components} / {summary.wires}</span>
                </div>
                <div className="flex justify-between gap-md py-[5px] border-b border-dashed border-border text-3 last:border-b-0">
                  <span className="text-text-dim font-1">Nodes</span>
                  <span className="text-text font-3 font-medium">{summary.nodes}</span>
                </div>
                <div className="flex justify-between gap-md py-[5px] border-b border-dashed border-border text-3 last:border-b-0">
                  <span className="text-text-dim font-1">Ground</span>
                  <span className="text-text font-3 font-medium" style={{ color: summary.hasGround ? 'var(--teal)' : 'var(--pink)' }}>
                    {summary.hasGround ? 'present' : 'missing'}
                  </span>
                </div>
                <div className="flex justify-between gap-md py-[5px] border-b border-dashed border-border text-3 last:border-b-0">
                  <span className="text-text-dim font-1">Sim time</span>
                  <span className="text-text font-3 font-medium">{eng(summary.t, 3)}s</span>
                </div>
                <div className="flex justify-between gap-md py-[5px] border-b border-dashed border-border text-3 last:border-b-0">
                  <span className="text-text-dim font-1">Solver</span>
                  <span className="text-text font-3 font-medium" style={{ color: summary.ok ? 'var(--teal)' : 'var(--pink)' }}>
                    {summary.ok ? 'OK' : 'singular'}
                  </span>
                </div>
              </div>
              <div className="flex-[2] min-w-[220px]">
                <div className="font-3 text-1 text-accent uppercase tracking-[.2em] mb-sm">Scope (first voltmeter)</div>
                <Scope data={scopeData} />
              </div>
            </div>
          </div>
        </main>

        <aside className="bg-bg-card border border-border rounded-3 p-lg">
          <Inspector
            selected={selected}
            onChange={updateSelected}
            onDelete={deleteSelected}
            onRotate={rotateSelected}
          />
          <PresetInfo preset={PRESETS.find(p => p.id === activePresetId) ?? null} />
        </aside>
      </div>
    </div>
  );

  const prose = (
    <>
      <h3 className="lab-section-h3">An MNA solver in your browser</h3>
      <p className="mb-prose-3">
        Everything left of this paragraph runs through the same machinery that powers SPICE — Modified Nodal Analysis,
        formulated in its current matrix-stamping form by Ho, Ruehli, and Brennan in 1975<Cite id="ho-ruehli-brennan-1975" in={SOURCES} />.
        The trick is to take Kirchhoff's current law<Cite id="kirchhoff-1845" in={SOURCES} /> — sum of currents into every node is zero —
        and write it as a matrix equation
      </p>
      <MathBlock>G · v = i</MathBlock>
      <p className="mb-prose-3">
        with one row per node. Each resistor of value <strong className="text-text font-medium">R</strong> contributes a conductance <strong className="text-text font-medium">1/R</strong> to four
        entries of <strong className="text-text font-medium">G</strong>: <em className="italic text-text">+1/R</em> on each diagonal at its two pin nodes, and <em className="italic text-text">−1/R</em> on the two
        off-diagonals between them. Stamp every passive component, solve, and you have the operating point.
      </p>

      <h3 className="lab-section-h3">Voltage sources need an extra unknown</h3>
      <p className="mb-prose-3">
        A battery between nodes <em className="italic text-text">i</em> and <em className="italic text-text">j</em> isn't a conductance — it commits to a voltage difference no matter what current flows.
        The MNA fix is to add a row and a column for the branch current through that source. The new row says
        <strong className="text-text font-medium"> v<sub>i</sub> − v<sub>j</sub> = V<sub>src</sub></strong>; the new column tells the other rows how that current
        enters and leaves the connected nodes. The matrix gets one entry larger per voltage source, which is why the technique is
        called <em className="italic text-text">modified</em> nodal analysis<Cite id="nilsson-riedel-2018" in={SOURCES} />.
      </p>
      <Pullout>
        Every passive component is a contribution to G. Every voltage source buys a new row and column.
        That is the whole secret.
      </Pullout>

      <h3 className="lab-section-h3">Capacitors and inductors: companion models</h3>
      <p className="mb-prose-3">
        At a single instant, a capacitor has whatever voltage it has — and lets through whatever current it pleases.
        The clever idea (trapezoidal rule, Nilsson–Riedel §8) is to discretise the time derivative and treat the cap
        as if it were a small resistor in parallel with an ideal current source whose value is set by the state at the
        previous step:
      </p>
      <MathBlock>i<sub>n+1</sub> = (2C/Δt) (v<sub>n+1</sub> − v<sub>n</sub>) − i<sub>n</sub></MathBlock>
      <p className="mb-prose-3">
        Rearranged to expose the linear part, the cap contributes a conductance <strong className="text-text font-medium">2C/Δt</strong> and the right-hand side
        gets a "memory" current of <strong className="text-text font-medium">2C v<sub>n</sub>/Δt + i<sub>n</sub></strong>. Inductors get the dual treatment: an
        effective resistance <strong className="text-text font-medium">2L/Δt</strong> in series with a voltage source <strong className="text-text font-medium">v<sub>n</sub> + (2L/Δt) i<sub>n</sub></strong>.
        Step the time index, restamp, resolve — and the RC and RLC curves come out for free.
      </p>

      <h3 className="lab-section-h3">Diodes: piecewise-linear Shockley</h3>
      <p className="mb-prose-3">
        The full Shockley equation <strong className="text-text font-medium">I = I<sub>s</sub>(e<sup>qV/kT</sup> − 1)</strong> is nonlinear and would require Newton–Raphson
        iteration<Cite id="shockley-1949" in={SOURCES} />. We use a textbook simplification: assume the diode is either fully on
        (<strong className="text-text font-medium">V<sub>F</sub> = 0.7 V</strong> drop in series with a tiny 0.05 Ω resistor) or fully off (~1 MΩ).
        Per step we solve assuming the previous state, check whether the answer is consistent (off diodes have V &lt; 0.7 V; on diodes
        carry positive current), and flip up to five times until it stabilises. For the half-wave rectifier preset that converges
        every step on the first or second try<Cite id="horowitz-hill-2015" in={SOURCES} />.
      </p>

      <h3 className="lab-section-h3">AC sources, switches, bulbs</h3>
      <p className="mb-prose-3">
        AC sources are just batteries whose value is recomputed each step as <strong className="text-text font-medium">V(t) = V<sub>pk</sub> sin(2π f t)</strong> —
        time-domain integration is enough; we don't need a separate phasor solver. Switches are resistors that swap between
        1 mΩ and 1 GΩ depending on state. Bulbs are resistors that glow at intensity proportional to <strong className="text-text font-medium">I²R</strong> — the
        same dissipation Joule measured in 1841 (Lab 3.4).
      </p>

      <h3 className="lab-section-h3">Try it</h3>
      <p className="mb-prose-3">
        Load the <strong className="text-text font-medium">RC Charging</strong> preset and watch the scope trace climb toward 5 V on a 1 ms time constant.
        Load <strong className="text-text font-medium">RLC Resonator</strong> and watch the loop voltage trade between L and C at the resonant frequency
        <strong className="text-text font-medium"> ω = 1/√(LC) ≈ 3.18 kHz</strong>. Load <strong className="text-text font-medium">Half-Wave Rectifier</strong> and see the negative half of the sine
        clipped off below the diode's forward drop.
      </p>
      <p className="mb-prose-3">
        Then build your own: drop a battery, two resistors, a ground, wire them in a divider, and confirm <strong className="text-text font-medium">V<sub>out</sub> = V<sub>in</sub> · R<sub>2</sub>/(R<sub>1</sub> + R<sub>2</sub>)</strong>.
        Every formula in this textbook becomes a circuit you can poke.
      </p>
    </>
  );

  return (
    <>
      <style>{CSS}</style>
      <LabShell
        slug={SLUG}
        labSubtitle="Schematic Editor + Live Solver"
        labId="circuit-builder / Gv = i"
        labContent={labContent}
        prose={prose}
      />
    </>
  );
}

/* ───────────────────────── Scope subcomponent ───────────────────────── */

interface ScopeProps {
  data: Array<{ t: number; v: number }>;
}

function Scope({ data }: ScopeProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const colors = getCanvasColors();
    const dpr = window.devicePixelRatio || 1;
    const w = c.clientWidth || c.parentElement?.clientWidth || 320;
    const h = 80;
    c.style.height = h + 'px';
    c.width = Math.floor(w * dpr);
    c.height = Math.floor(h * dpr);
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, w, h);
    // Axes.
    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2); ctx.stroke();
    if (data.length < 2) {
      ctx.fillStyle = colors.textMuted;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('— no probe data —', w / 2, h / 2 - 6);
      return;
    }
    const tMin = data[0].t;
    const tMax = data[data.length - 1].t;
    const tRange = Math.max(1e-6, tMax - tMin);
    let vMin = Infinity, vMax = -Infinity;
    for (const d of data) { if (d.v < vMin) vMin = d.v; if (d.v > vMax) vMax = d.v; }
    if (vMin === vMax) { vMin -= 1; vMax += 1; }
    const pad = (vMax - vMin) * 0.1;
    vMin -= pad; vMax += pad;
    // Trace.
    ctx.strokeStyle = colors.teal;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (let i = 0; i < data.length; i++) {
      const d = data[i];
      const x = ((d.t - tMin) / tRange) * w;
      const y = h - ((d.v - vMin) / (vMax - vMin)) * h;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    // Y range labels.
    ctx.fillStyle = colors.textDim;
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText(vMax.toFixed(2) + ' V', w - 4, 10);
    ctx.fillText(vMin.toFixed(2) + ' V', w - 4, h - 4);
    ctx.textAlign = 'left';
    ctx.fillText(eng(tRange, 2) + 's window', 4, h - 4);
  }, [data]);
  return <canvas className="block w-full" ref={ref} style={{ display: 'block', width: '100%' }} />;
}

/* ───────────────────────── Preset Info subcomponent ───────────────────────── */

function PresetInfo({ preset }: { preset: CircuitPreset | null }) {
  if (!preset) return null;
  return (
    <div className="mt-lg pt-lg border-t border-border flex flex-col gap-[14px] max-h-[520px] overflow-y-auto">
      <div className="font-3 text-[9px] text-accent uppercase tracking-[.25em]">{preset.topic}</div>
      <div className="font-2 italic text-[18px] text-text leading-2">{preset.name}</div>
      <div className="text-3 text-text-dim leading-[1.5] py-sm px-[10px] bg-bg-elevated rounded-2 border border-border">
        <strong>Goal:</strong> {preset.goal}
      </div>
      <div className="flex flex-col gap-sm">
        <div className="font-3 text-1 text-teal uppercase tracking-[.15em]">Theory</div>
        {preset.theory.split('\n\n').map((para, i) => (
          <p key={i} className="text-3 text-text-dim leading-[1.55] m-0">{para}</p>
        ))}
      </div>
      <div className="flex flex-col gap-sm">
        <div className="font-3 text-1 text-teal uppercase tracking-[.15em]">Formulas</div>
        {preset.formulas.map((f, i) => (
          <div key={i} className="font-4 italic text-4 text-text leading-[1.5] py-[6px] px-[10px] bg-bg-elevated rounded-2 border border-border">{f}</div>
        ))}
      </div>
      <div className="flex flex-col gap-sm">
        <div className="font-3 text-1 text-teal uppercase tracking-[.15em]">Calculation</div>
        <ol className="m-0 pl-[18px] text-2 text-text-dim leading-[1.55] [&>li]:mb-[5px] [&>li::marker]:text-accent">
          {preset.steps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      </div>
      <div className="flex flex-col gap-sm">
        <div className="font-3 text-1 text-teal uppercase tracking-[.15em]">Try It</div>
        <ul className="m-0 pl-[18px] text-2 text-text-dim leading-[1.55] [&>li]:mb-[5px] [&>li::marker]:text-accent">
          {preset.hints.map((h, i) => (
            <li key={i}>{h}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ───────────────────────── Inline CSS (Palette + Inspector children only) ───────────────────────── */

// These rules style classes referenced by ./circuit-builder/Palette.tsx and
// ./circuit-builder/Inspector.tsx, which we are not modifying in this pass.
const CSS = `
/* Palette */
.cb-palette {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.cb-palette-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.cb-palette-title {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: .2em;
}
.cb-palette-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 6px;
}
.cb-palette-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  color: var(--text-dim);
  font-family: 'DM Sans', system-ui, sans-serif;
  font-size: 12px;
  padding: 8px 10px;
  border-radius: 3px;
  cursor: pointer;
  text-align: left;
  transition: all .15s ease;
}
.cb-palette-btn:hover {
  background: var(--bg-card-hover);
  color: var(--text);
  border-color: var(--text-dim);
}
.cb-palette-btn.active {
  background: var(--accent-soft);
  border-color: var(--accent);
  color: var(--text);
}
.cb-palette-label {
  flex: 1;
}
.cb-palette-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-top: 10px;
  border-top: 1px solid var(--border);
  min-height: 110px;
}
.cb-palette-info-title {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--accent);
  font-weight: 500;
}
.cb-palette-info-desc {
  font-size: 11px;
  color: var(--text-dim);
  line-height: 1.45;
}
.cb-palette-info-formula {
  font-family: 'STIX Two Text', serif;
  font-style: italic;
  font-size: 13px;
  color: var(--text);
  line-height: 1.4;
  padding: 4px 8px;
  background: var(--bg-elevated);
  border-radius: 3px;
  border: 1px solid var(--border);
}
.cb-palette-info-behavior {
  font-size: 10px;
  color: var(--text-muted);
  line-height: 1.45;
  font-style: italic;
}

/* Inspector */
.cb-inspector {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.cb-inspector-title {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: .2em;
}
.cb-inspector-kind {
  font-family: 'Fraunces', serif;
  font-style: italic;
  font-size: 18px;
  color: var(--text);
}
.cb-inspector-empty {
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.5;
}
.cb-inspector-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}
.cb-inspector-btn {
  flex: 1;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  color: var(--text-dim);
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  padding: 6px 10px;
  border-radius: 3px;
  cursor: pointer;
  transition: all .15s ease;
}
.cb-inspector-btn:hover {
  color: var(--text);
  border-color: var(--text-dim);
}
.cb-inspector-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.cb-inspector-btn.danger:hover {
  color: var(--pink);
  border-color: var(--pink);
}

.cb-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.cb-field-static {
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.5;
  padding: 8px 0;
}
.cb-field-label {
  display: flex;
  justify-content: space-between;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: .15em;
}
.cb-field-unit {
  color: var(--text-muted);
}
.cb-field-input {
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  color: var(--text);
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  padding: 6px 8px;
  border-radius: 2px;
  width: 100%;
  box-sizing: border-box;
}
.cb-field-input:focus {
  outline: none;
  border-color: var(--accent);
}
.cb-field-slider {
  width: 100%;
  accent-color: var(--accent);
}
.cb-toggle {
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  color: var(--text);
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  padding: 8px;
  border-radius: 3px;
  cursor: pointer;
  text-align: center;
}
.cb-toggle.open { color: var(--pink); border-color: var(--pink); }
.cb-toggle.closed { color: var(--teal); border-color: var(--teal); }
`;
