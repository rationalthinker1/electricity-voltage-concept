/**
 * Lab A.5 — Power Grid Simulator
 *
 *     2H · df/dt  =  P_mech − P_elec   (swing equation)
 *     P_ij        =  (θ_i − θ_j) / X_ij   (DC power flow)
 *
 * A one-line-diagram editor for power systems. The reader drops buses,
 * wires them with transmission lines and transformers, hangs generators
 * (coal / CCGT / hydro / wind / solar / battery) and loads (residential /
 * industrial / motor / EV) off each bus, and watches a steady-state
 * power-flow + swing-equation solver evolve every tick.
 *
 * Architecture
 * ────────────
 *   /labs/PowerGridLab.tsx                 ← this file (UI + sim loop)
 *   /labs/power-grid/types.ts              ← document & solver types
 *   /labs/power-grid/solver.ts             ← DC flow + swing + dispatch
 *   /labs/power-grid/OneLineCanvas.tsx     ← canvas editor
 *   /labs/power-grid/Palette.tsx           ← left sidebar
 *   /labs/power-grid/Inspector.tsx         ← right sidebar
 *   /labs/power-grid/presets.ts            ← scenarios
 *
 * Simulation loop
 * ───────────────
 * Logical step ≈ 0.1 s of grid time per rAF tick (the swing equation
 * evolves over seconds, so we don't need microsecond integration). Each
 * step runs `snapshot(doc, freq)` which:
 *   1. Solves the DC power flow B' θ = P_inj.
 *   2. Estimates bus voltage magnitudes from a one-shot reactive balance.
 *   3. Integrates df/dt = (P_gen − P_load) / (2 H_sys) − D Δf.
 *   4. Applies primary droop response and (if needed) UFLS load shedding.
 *   5. Recomputes locational marginal price and CO₂ intensity.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { LabShell } from '@/components/LabShell';
import { MathBlock, Pullout } from '@/components/Prose';
import { Cite } from '@/components/SourcesList';
import { BASE_LAB_SOURCES } from '@/labs/data/manifest';

import { Inspector } from './power-grid/Inspector';
import { OneLineCanvas } from './power-grid/OneLineCanvas';
import { Palette } from './power-grid/Palette';
import { PRESETS, cloneDoc } from './power-grid/presets';
import {
  S_BASE_MVA, FREQ_DT,
  applyDroop, applyShedding, defaultGenerator, defaultLoad,
  dispatchMeritOrder, fmtHz, fmtMW, fmtPct,
  lineImpedancePerMile, lineRating, snapshot,
} from './power-grid/solver';
import type {
  ArmedTool, Bus, FrequencyState, Generator, GridDoc,
  Line, Load, Selection, SystemSnapshot, Transformer,
} from './power-grid/types';

const SLUG = 'power-grid';
const SOURCES = BASE_LAB_SOURCES[SLUG]!;

/** How many simulated seconds per real-time second when running. */
const SIM_SPEED = 1.0;
/** How many UI render frames between each logical step. */
const FRAMES_PER_STEP = 6;

export default function PowerGridLab() {
  const [doc, setDoc] = useState<GridDoc>(() => cloneDoc(PRESETS[0].doc));
  const [armed, setArmed] = useState<ArmedTool>({ kind: 'select' });
  const [selection, setSelection] = useState<Selection | null>(null);
  const [running, setRunning] = useState(true);
  const [snap, setSnap] = useState<SystemSnapshot | null>(null);
  const [autoDispatch, setAutoDispatch] = useState(true);
  const [activePresetId, setActivePresetId] = useState<string>(PRESETS[0].id);
  const [eventLog, setEventLog] = useState<{ t: number; description: string }[]>([]);

  // Refs so the rAF loop reads current state without restarting.
  const docRef = useRef(doc);
  useEffect(() => { docRef.current = doc; }, [doc]);
  const autoDispRef = useRef(autoDispatch);
  useEffect(() => { autoDispRef.current = autoDispatch; }, [autoDispatch]);
  const runningRef = useRef(running);
  useEffect(() => { runningRef.current = running; }, [running]);
  const freqRef = useRef<FrequencyState>({ hz: 60, rocof: 0, shedFrac: 0 });
  const tRef = useRef(0);
  const lastVRef = useRef<Map<string, number> | undefined>(undefined);

  // Schedule cursor — index of the next scheduled event to fire.
  const scheduleRef = useRef<{ idx: number; presetId: string }>({ idx: 0, presetId: PRESETS[0].id });

  /* ─────────── Simulation loop ─────────── */
  useEffect(() => {
    let raf = 0;
    let frame = 0;
    function tick() {
      frame++;
      if (runningRef.current && frame % FRAMES_PER_STEP === 0) {
        const stepSeconds = FREQ_DT * SIM_SPEED;
        let curDoc = docRef.current;

        // Dispatch reshuffle every step if auto-dispatch is on.
        if (autoDispRef.current) curDoc = dispatchMeritOrder(curDoc);

        // Apply UFLS shedding to the active doc.
        curDoc = applyShedding(curDoc, freqRef.current.shedFrac);

        const sn = snapshot(curDoc, freqRef.current, lastVRef.current);

        // Primary droop response — adjust dispatch on droop-equipped units.
        const afterDroop = applyDroop(curDoc, sn.freq);
        if (afterDroop !== curDoc) {
          curDoc = afterDroop;
          // Mutate doc state to reflect droop adjustment.
          docRef.current = curDoc;
          setDoc(curDoc);
        }

        freqRef.current = sn.freq;
        lastVRef.current = sn.pf.voltage;
        tRef.current += stepSeconds;

        // Fire schedule events whose `at` ≤ t.
        const preset = PRESETS.find((p) => p.id === scheduleRef.current.presetId);
        if (preset?.schedule) {
          while (
            scheduleRef.current.idx < preset.schedule.length &&
            preset.schedule[scheduleRef.current.idx].at <= tRef.current
          ) {
            const ev = preset.schedule[scheduleRef.current.idx];
            scheduleRef.current.idx++;
            // Apply to a clone so React state updates trigger renders.
            setDoc((prev) => {
              const next = cloneDoc(prev);
              ev.apply(next);
              return next;
            });
            setEventLog((log) => [...log.slice(-8), { t: tRef.current, description: ev.description }]);
          }
        }

        setSnap({ ...sn, t: tRef.current });
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  /* ─────────── Mutation helpers ─────────── */

  const placeBus = useCallback((x: number, y: number, kv: Bus['kv']) => {
    setDoc((prev) => ({
      ...prev,
      buses: [...prev.buses, {
        id: `bus-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
        x, y, kv, generators: [], loads: [],
        label: `Bus ${prev.buses.length + 1}`,
      }],
    }));
  }, []);

  const moveBus = useCallback((busId: string, x: number, y: number) => {
    setDoc((prev) => ({
      ...prev,
      buses: prev.buses.map((b) => (b.id === busId ? { ...b, x, y } : b)),
    }));
  }, []);

  const placeLine = useCallback((fromBusId: string, toBusId: string) => {
    setDoc((prev) => {
      const a = prev.buses.find((b) => b.id === fromBusId);
      const c = prev.buses.find((b) => b.id === toBusId);
      if (!a || !c) return prev;
      // Default length: pixel distance / GRID_PX, treat 1 cell = 5 mi.
      const len = Math.max(5, Math.round(Math.hypot(a.x - c.x, a.y - c.y) * 5));
      const kv = a.kv === c.kv ? a.kv : Math.max(a.kv, c.kv) as Bus['kv'];
      const z = lineImpedancePerMile(kv);
      return {
        ...prev,
        lines: [...prev.lines, {
          id: `ln-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
          fromBusId, toBusId,
          lengthMi: len,
          rPu: z.r * len,
          xPu: z.x * len,
          ratingMVA: lineRating(kv),
        }],
      };
    });
  }, []);

  const placeTransformer = useCallback((fromBusId: string, toBusId: string) => {
    setDoc((prev) => ({
      ...prev,
      transformers: [...prev.transformers, {
        id: `tx-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
        fromBusId, toBusId,
        ratingMVA: 200,
        xPu: 0.10,
      }],
    }));
  }, []);

  const attachGenerator = useCallback((busId: string, kind: Generator['kind']) => {
    setDoc((prev) => ({
      ...prev,
      buses: prev.buses.map((b) => {
        if (b.id !== busId) return b;
        return {
          ...b,
          generators: [...b.generators, {
            id: `gen-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
            ...defaultGenerator(kind),
          }],
        };
      }),
    }));
  }, []);

  const attachLoad = useCallback((busId: string, kind: Load['kind']) => {
    setDoc((prev) => ({
      ...prev,
      buses: prev.buses.map((b) => {
        if (b.id !== busId) return b;
        return {
          ...b,
          loads: [...b.loads, {
            id: `ld-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
            ...defaultLoad(kind),
          }],
        };
      }),
    }));
  }, []);

  const tripGenerator = useCallback((busId: string, genId: string) => {
    setDoc((prev) => ({
      ...prev,
      buses: prev.buses.map((b) => {
        if (b.id !== busId) return b;
        return {
          ...b,
          generators: b.generators.map((g) => g.id === genId ? { ...g, tripped: !g.tripped } : g),
        };
      }),
    }));
    setEventLog((log) => [...log.slice(-8), {
      t: tRef.current,
      description: 'Operator toggled generator state',
    }]);
  }, []);

  const updateBus = useCallback((nb: Bus) => {
    setDoc((prev) => ({ ...prev, buses: prev.buses.map((b) => b.id === nb.id ? nb : b) }));
  }, []);
  const updateGenerator = useCallback((busId: string, ng: Generator) => {
    setDoc((prev) => ({
      ...prev,
      buses: prev.buses.map((b) => {
        if (b.id !== busId) return b;
        return { ...b, generators: b.generators.map((g) => g.id === ng.id ? ng : g) };
      }),
    }));
  }, []);
  const updateLoad = useCallback((busId: string, nl: Load) => {
    setDoc((prev) => ({
      ...prev,
      buses: prev.buses.map((b) => {
        if (b.id !== busId) return b;
        return { ...b, loads: b.loads.map((l) => l.id === nl.id ? nl : l) };
      }),
    }));
  }, []);
  const updateLine = useCallback((nl: Line) => {
    setDoc((prev) => ({ ...prev, lines: prev.lines.map((l) => l.id === nl.id ? nl : l) }));
  }, []);
  const updateTransformer = useCallback((nt: Transformer) => {
    setDoc((prev) => ({
      ...prev,
      transformers: prev.transformers.map((t) => t.id === nt.id ? nt : t),
    }));
  }, []);

  const deleteSelected = useCallback(() => {
    if (!selection) return;
    setDoc((prev) => {
      switch (selection.kind) {
        case 'bus':
          return {
            ...prev,
            buses: prev.buses.filter((b) => b.id !== selection.id),
            lines: prev.lines.filter((l) => l.fromBusId !== selection.id && l.toBusId !== selection.id),
            transformers: prev.transformers.filter(
              (t) => t.fromBusId !== selection.id && t.toBusId !== selection.id,
            ),
          };
        case 'line':
          return { ...prev, lines: prev.lines.filter((l) => l.id !== selection.id) };
        case 'transformer':
          return { ...prev, transformers: prev.transformers.filter((t) => t.id !== selection.id) };
        case 'generator':
          return {
            ...prev,
            buses: prev.buses.map((b) => {
              if (b.id !== selection.parentBusId) return b;
              return { ...b, generators: b.generators.filter((g) => g.id !== selection.id) };
            }),
          };
        case 'load':
          return {
            ...prev,
            buses: prev.buses.map((b) => {
              if (b.id !== selection.parentBusId) return b;
              return { ...b, loads: b.loads.filter((l) => l.id !== selection.id) };
            }),
          };
      }
    });
    setSelection(null);
  }, [selection]);

  // Delete-key handler.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Delete' && e.key !== 'Backspace') return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if (selection) {
        e.preventDefault();
        deleteSelected();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [deleteSelected, selection]);

  const loadPreset = useCallback((presetId: string) => {
    const preset = PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setDoc(cloneDoc(preset.doc));
    setSelection(null);
    setArmed({ kind: 'select' });
    setActivePresetId(preset.id);
    scheduleRef.current = { idx: 0, presetId: preset.id };
    freqRef.current = { hz: 60, rocof: 0, shedFrac: 0 };
    tRef.current = 0;
    lastVRef.current = undefined;
    setEventLog([]);
  }, []);

  const reset = useCallback(() => {
    freqRef.current = { hz: 60, rocof: 0, shedFrac: 0 };
    tRef.current = 0;
    lastVRef.current = undefined;
    scheduleRef.current.idx = 0;
    setEventLog([]);
    // Reset trip state.
    setDoc((prev) => ({
      ...prev,
      buses: prev.buses.map((b) => ({
        ...b,
        generators: b.generators.map((g) => ({ ...g, tripped: false })),
      })),
    }));
  }, []);

  const dropBatteryAtSelection = useCallback(() => {
    if (!selection || selection.kind !== 'bus') return;
    attachGenerator(selection.id, 'battery');
    setEventLog((log) => [...log.slice(-8), {
      t: tRef.current,
      description: 'Operator dropped 100 MW / 200 MWh battery storage',
    }]);
  }, [selection, attachGenerator]);

  /* ─────────── Readouts ─────────── */

  const readouts = useMemo(() => {
    if (!snap) return null;
    const { pf, freq, lmpUSDPerMWh, co2Intensity, t } = snap;
    return {
      t,
      genMW: pf.totalGenMW,
      loadMW: pf.totalLoadMW,
      lossMW: pf.totalLossMW,
      imbalanceMW: pf.imbalanceMW,
      hz: freq.hz,
      rocof: freq.rocof,
      shedFrac: freq.shedFrac,
      lmp: lmpUSDPerMWh,
      co2: co2Intensity,
    };
  }, [snap]);

  /* ─────────── Render ─────────── */

  const labContent = (
    <div className="pg-shell">
      <div className="pg-toolbar">
        <div className="pg-toolbar-group">
          <span className="pg-toolbar-label">Scenarios:</span>
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={'pg-preset-btn' + (p.id === activePresetId ? ' active' : '')}
              onClick={() => loadPreset(p.id)}
              title={p.description}
            >
              {p.name}
            </button>
          ))}
        </div>
        <div className="pg-toolbar-group">
          <button
            type="button"
            className={'pg-toolbar-btn ' + (running ? 'on' : 'off')}
            onClick={() => setRunning((r) => !r)}
          >
            {running ? 'Pause' : 'Run'}
          </button>
          <button
            type="button"
            className={'pg-toolbar-btn ' + (autoDispatch ? 'on' : '')}
            onClick={() => setAutoDispatch((d) => !d)}
            title="When on, dispatch is reshuffled every step in merit order."
          >
            Merit-order dispatch
          </button>
          <button
            type="button"
            className="pg-toolbar-btn"
            onClick={dropBatteryAtSelection}
            disabled={!selection || selection.kind !== 'bus'}
            title="Add 100 MW / 200 MWh battery at the selected bus."
          >
            + Battery here
          </button>
          <button type="button" className="pg-toolbar-btn" onClick={reset}>Reset</button>
        </div>
      </div>

      <div className="pg-body">
        <aside className="pg-left">
          <Palette armed={armed} onArm={setArmed} />
        </aside>

        <main className="pg-main">
          <OneLineCanvas
            doc={doc}
            selection={selection}
            armed={armed}
            snapshot={snap}
            onSelect={setSelection}
            onPlaceBus={placeBus}
            onMoveBus={moveBus}
            onPlaceLine={placeLine}
            onPlaceTransformer={placeTransformer}
            onAttachGenerator={attachGenerator}
            onAttachLoad={attachLoad}
            onTripGenerator={tripGenerator}
          />

          <div className="pg-bottom">
            <div className="pg-bottom-row">
              <div className="pg-bottom-group">
                <div className="pg-bottom-title">System totals</div>
                <Row label="Sim time" value={readouts ? readouts.t.toFixed(1) + ' s' : '—'} />
                <Row label="Generation" value={readouts ? fmtMW(readouts.genMW) : '—'} />
                <Row label="Load" value={readouts ? fmtMW(readouts.loadMW) : '—'} />
                <Row
                  label="I²R losses"
                  value={readouts ? fmtMW(readouts.lossMW) : '—'}
                />
                <Row
                  label="Imbalance"
                  value={readouts ? fmtMW(readouts.imbalanceMW) : '—'}
                  warn={!!readouts && Math.abs(readouts.imbalanceMW) > 20}
                />
              </div>
              <div className="pg-bottom-group">
                <div className="pg-bottom-title">Frequency</div>
                <Row
                  label="System f"
                  value={readouts ? fmtHz(readouts.hz) : '—'}
                  warn={!!readouts && Math.abs(readouts.hz - 60) > 0.3}
                />
                <Row
                  label="df/dt"
                  value={readouts ? readouts.rocof.toFixed(2) + ' Hz/s' : '—'}
                />
                <Row
                  label="UFLS shed"
                  value={readouts ? fmtPct(readouts.shedFrac, 0) : '—'}
                  warn={!!readouts && readouts.shedFrac > 0.01}
                />
              </div>
              <div className="pg-bottom-group">
                <div className="pg-bottom-title">Market & emissions</div>
                <Row label="LMP" value={readouts ? '$' + readouts.lmp.toFixed(2) + '/MWh' : '—'} />
                <Row label="CO₂ intensity" value={readouts ? readouts.co2.toFixed(0) + ' kg/MWh' : '—'} />
                <Row
                  label="S base"
                  value={S_BASE_MVA + ' MVA'}
                />
                <Row label="Δt step" value={(FREQ_DT * SIM_SPEED).toFixed(2) + ' s'} />
              </div>
              <div className="pg-bottom-group" style={{ flex: 1.4 }}>
                <div className="pg-bottom-title">Event log</div>
                {eventLog.length === 0 && (
                  <div className="pg-bottom-empty">
                    Trip a generator (right-click on it) or load a scenario with a schedule to see events here.
                  </div>
                )}
                {eventLog.slice().reverse().map((e, i) => (
                  <div key={i} className="pg-log-row">
                    <span className="pg-log-t">{e.t.toFixed(1)}s</span>
                    <span className="pg-log-msg">{e.description}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>

        <aside className="pg-right">
          <Inspector
            doc={doc}
            selection={selection}
            onUpdateBus={updateBus}
            onUpdateGenerator={updateGenerator}
            onUpdateLoad={updateLoad}
            onUpdateLine={updateLine}
            onUpdateTransformer={updateTransformer}
            onDelete={deleteSelected}
            onTripGenerator={tripGenerator}
          />
        </aside>
      </div>
    </div>
  );

  const prose = (
    <>
      <h3 className="font-2 font-normal italic text-9 leading-1 my-4xl mb-xl text-text tracking-1">What this lab integrates</h3>
      <p className="mb-prose-3">
        A working power grid braids together every chapter from the second half of the textbook.
        AC voltage and impedance from Ch. 12. Generators and inertia from Ch. 21. Transformers from
        Ch. 23. Rectifiers and inverters from Ch. 24 — every solar farm and battery in this sandbox
        ties into the grid through a power-electronics interface that has no spinning mass behind it.
        Big loads from Ch. 31. The point of dropping a coal plant, two transmission lines, and a
        residential load on the canvas is to feel how those pieces couple — when one shifts, the
        others have to move to keep <strong className="text-text font-medium">Σ P_gen = Σ P_load + Σ P_loss</strong> alive at every
        instant of every day<Cite id="grainger-power-systems-2003" in={SOURCES} />.
      </p>

      <h3 className="font-2 font-normal italic text-9 leading-1 my-4xl mb-xl text-text tracking-1">The DC power-flow approximation</h3>
      <p className="mb-prose-3">
        A real grid carries both real power <em className="italic text-text">P</em> (megawatts that turn motors and heat resistors)
        and reactive power <em className="italic text-text">Q</em> (megavars that keep magnetising flux alive in every transformer
        and motor on the network). The full AC power-flow equations couple them through bus voltage
        magnitudes <em className="italic text-text">|V|</em> and angles <em className="italic text-text">θ</em> in a nonlinear system that has to be solved by
        Newton-Raphson iteration. For high-voltage transmission, though, three facts conspire to make
        a beautiful linear approximation work shockingly well:
      </p>
      <ol>
        <li>Line reactance dominates resistance — <strong className="text-text font-medium">X / R ≈ 5</strong> for a 230 kV line,
          <strong className="text-text font-medium"> 10</strong> for a 500 kV line<Cite id="grainger-power-systems-2003" in={SOURCES} />.</li>
        <li>Bus voltages stay close to 1 pu — operators arrange tap changers and shunt
          capacitors to keep |V| within ±5 %.</li>
        <li>Angle differences across a line are small — typically a few degrees.</li>
      </ol>
      <p className="mb-prose-3">
        Combine those and the real-power flow on a line between buses <em className="italic text-text">i</em> and <em className="italic text-text">j</em>
        collapses to a single linear term:
      </p>
      <MathBlock>P_ij  ≈  (θ_i − θ_j) / X_ij</MathBlock>
      <p className="mb-prose-3">
        Apply Kirchhoff's current law<Cite id="kirchhoff-1845" in={SOURCES} /> at every bus and the
        whole network becomes a sparse linear system <strong className="text-text font-medium">B' θ = P_inj</strong>, where <em className="italic text-text">B'</em>
        is the susceptance matrix with the slack-bus row removed. We solve it every step with the
        same Gaussian-elimination routine that powers the Circuit Builder lab one slot up
        <Cite id="horowitz-hill-2015" in={SOURCES} />. The DC approximation drops the moment we have
        voltage-collapse problems or heavy reactive flows — but for the toy networks in this
        sandbox, it nails the right intuition.
      </p>

      <h3 className="font-2 font-normal italic text-9 leading-1 my-4xl mb-xl text-text tracking-1">The swing equation, in detail</h3>
      <p className="mb-prose-3">
        Synchronous machines store kinetic energy in their rotor. A coal turbine spinning at 3600 rpm
        on a 1 GW shaft is keeping somewhere around 5 seconds × 1 GW = 5 GJ alive in its rotor at any
        instant — and that energy is what holds frequency steady through every flicker of load. The
        swing equation, normalised on rated MVA, comes out as
      </p>
      <MathBlock>2 H · df/dt  =  P_mech − P_elec  −  D · Δf</MathBlock>
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">H</strong> is the inertia constant in seconds (it's literally the stored
        kinetic energy at synchronous speed divided by the machine's MVA rating), <strong className="text-text font-medium">P_mech</strong>
        is the turbine torque commanded by the governor, <strong className="text-text font-medium">P_elec</strong> is the electrical
        power leaving the stator, and <strong className="text-text font-medium">D · Δf</strong> is the small load-damping term that
        captures how motor loads back off when frequency sags<Cite id="kundur-1994-power-stability" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        The grid-aggregated <strong className="text-text font-medium">H_sys</strong> is the MVA-weighted average of every spinning
        machine's H. A grid full of coal and hydro sits at <strong className="text-text font-medium">H_sys ≈ 4–5 s</strong>; a grid
        full of inverter-coupled wind and solar — with zero native inertia — sits at
        <strong className="text-text font-medium"> H_sys → 0</strong>. The same generator trip on those two grids produces wildly
        different rate-of-change-of-frequency (ROCOF) values. The high-inertia grid rides through;
        the low-inertia one trips loads on its way down<Cite id="kundur-1994-power-stability" in={SOURCES} />.
      </p>
      <Pullout>
        Inertia isn't a feature anyone designed into the grid. It's a side-effect of using big
        spinning machines to make electricity. Replace those machines with inverters and the
        feature evaporates — unless you put it back synthetically.
      </Pullout>

      <h3 className="font-2 font-normal italic text-9 leading-1 my-4xl mb-xl text-text tracking-1">Primary frequency control: droop</h3>
      <p className="mb-prose-3">
        Every governor on every steam, gas, or hydro unit is wired with a <strong className="text-text font-medium">droop characteristic</strong>:
        the unit picks up (or sheds) load in proportion to how far frequency has drifted from 60 Hz.
        A typical setting is <strong className="text-text font-medium">R = 5 %</strong>, which means a 5 % drop in frequency (60 → 57 Hz)
        commands the unit to swing from minimum to maximum dispatch. Mathematically:
      </p>
      <MathBlock>ΔP_gen  =  −(1 / R) · Δf_pu · P_rated</MathBlock>
      <p className="mb-prose-3">
        Watch the <strong className="text-text font-medium">Trip</strong> scenario in this sandbox: a 500 MW coal plant trips at
        <em className="italic text-text"> t = 4 s</em>. The surviving units feel frequency falling and ramp up — but with
        H ≈ 5 s, they can't move fast enough to prevent a dip. Add a 100 MW battery at any bus
        (H = 0.1 s, droop = 2 %) and the dip is arrested almost instantly, because the battery's
        inverter can swing from 0 to full output in milliseconds. That's why every modern grid is
        starting to lean on storage for fast-frequency response<Cite id="kundur-1994-power-stability" in={SOURCES} />.
      </p>

      <h3 className="font-2 font-normal italic text-9 leading-1 my-4xl mb-xl text-text tracking-1">The merit-order dispatch and locational marginal price</h3>
      <p className="mb-prose-3">
        With the <em className="italic text-text">Merit-order dispatch</em> toggle on, the sandbox sorts every online generator
        by its variable cost (in $/MWh) and fills them from cheapest first until total dispatch
        meets total load plus 3 % for losses. The unit that ends up <em className="italic text-text">partially</em> loaded —
        not zero, not at its cap — is the marginal unit, and its cost is what an economist would
        call the <strong className="text-text font-medium">locational marginal price</strong> (LMP). Every MWh delivered anywhere on
        that grid is priced at the marginal unit's cost, regardless of which physical generator
        actually delivered it<Cite id="grainger-power-systems-2003" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        In the 4-bus default scenario, hydro is the cheapest unit at $8/MWh, wind and solar are
        near-zero, and coal at $25/MWh sits between them and the $45/MWh gas peaker. As demand climbs
        through the day, the marginal unit walks rightward through the merit order: hydro → coal →
        gas. The LMP rises in steps every time we move from one technology to the next. Real
        markets clear in five-minute intervals with this exact logic on top of a full AC OPF; we're
        running a stripped-down version that captures the same intuition.
      </p>

      <h3 className="font-2 font-normal italic text-9 leading-1 my-4xl mb-xl text-text tracking-1">Why constant-impedance vs. constant-power loads matter</h3>
      <p className="mb-prose-3">
        Residential aggregate behaves like a giant constant impedance — incandescent bulbs and
        resistive heaters dominate, so when bus voltage sags, the load shrinks as <strong className="text-text font-medium">P ∝ V²</strong>.
        Industrial loads with regulated drives behave like constant power — they pull the same MW
        regardless of voltage, which is why they make voltage-stability harder. Motors fall in
        between, drawing constant current. Build a network where every load is constant-power, sag the
        voltage by tripping a key transmission line, and the loads refuse to back off — they pull
        harder, sagging voltage further, and the network is on its way to voltage collapse. Build the
        same network with mostly residential load and the same trip is recoverable, because the load
        self-corrects on the way down.
      </p>

      <h3 className="font-2 font-normal italic text-9 leading-1 my-4xl mb-xl text-text tracking-1">Try it — six problems in the sandbox</h3>
      <p className="mb-prose-3">
        Each of these is solvable in the sandbox. Load the indicated preset and start adjusting.
      </p>
      <ol>
        <li>
          <strong className="text-text font-medium">Marginal price during a ramp.</strong> Load the <em className="italic text-text">Afternoon ramp</em> scenario.
          Watch the residential load climb from 70 % to 110 % over ~20 sim seconds. At each plateau
          (70, 85, 100, 110 %), read the LMP off the bottom panel. Which generator is marginal at
          each? When does the gas peaker start dispatching?
        </li>
        <li>
          <strong className="text-text font-medium">Coal trip without storage.</strong> Load the <em className="italic text-text">Trip</em> scenario and let it run
          past t = 4 s. The 500 MW coal unit goes offline. How low does frequency dip? Does UFLS
          trigger (the shed counter starts climbing past 0 %)? At what frequency does the system
          finally restabilise?
        </li>
        <li>
          <strong className="text-text font-medium">Coal trip with storage.</strong> Reset, then select Bus 1 (North Gen) and click
          <em className="italic text-text"> + Battery here</em>. Now run the trip scenario again. How much shallower is the dip?
          What's the maximum ROCOF (df/dt) you observe? Does the battery state of charge change
          much in the first 10 s?
        </li>
        <li>
          <strong className="text-text font-medium">Build a 1 GW grid where the marginal price is exactly $25/MWh.</strong> Start from
          the <em className="italic text-text">Empty</em> scenario. Drop two 230 kV buses, connect them with one line. Add a
          500 MW coal generator at $25/MWh and a 400 MW hydro at $8/MWh on bus 1, and 700 MW of
          industrial load on bus 2 through a transformer. With merit-order dispatch on, hydro will
          fill to 400 and coal will fill the remaining 300 of headroom. Coal is marginal — the LMP
          is $25/MWh. Now bump residential load to 850 MW. What happens to LMP?
        </li>
        <li>
          <strong className="text-text font-medium">Locate the duck.</strong> Load the <em className="italic text-text">Duck curve</em> scenario. At t = 0, solar
          is at 95 % and net load is low — the famous "belly" of the duck. As the schedule fires
          (t = 6, t = 14), solar fades while residential climbs. What's the steepest ramp rate you
          measure (MW/s) on the gas peaker as the duck's neck rises into the evening?
        </li>
        <li>
          <strong className="text-text font-medium">Build a low-inertia grid.</strong> Empty the canvas, drop two buses, and stand up
          800 MW of capacity using only wind, solar, and battery (no coal, no gas, no hydro). With
          all three classes at H ≤ 0.1 s, the aggregated H_sys is near zero. Trip one of the units
          and watch ROCOF. Does the surviving inverter-based generation arrest the dip? At what
          droop setting on the battery (try 0.05, 0.02, 0.01) does the grid survive without UFLS?
        </li>
      </ol>
      <p className="mb-prose-3">
        Every reading on the bottom panel — frequency, dispatch, voltages, losses, LMP, CO₂ — is
        computed live from the topology you've built. The numbers come from CODATA constants
        baked into the per-unit formulas<Cite id="codata-2018" in={SOURCES} /> and from the
        canonical power-systems textbooks listed below. Nothing here is fabricated; the simulator
        is a faithful (if drastically simplified) miniature of what an ISO's day-ahead market
        clearing engine does every five minutes on the real grid.
      </p>
    </>
  );

  return (
    <>
      <style>{CSS}</style>
      <LabShell
        slug={SLUG}
        labSubtitle="Sandbox · Power System"
        labId="power-grid / B'θ = P"
        labContent={labContent}
        prose={prose}
      />
    </>
  );
}

/* ─────────────────────────── Readout row ─────────────────────────── */

function Row({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className="pg-readout-row">
      <span className="pg-readout-label">{label}</span>
      <span
        className="pg-readout-value"
        style={warn ? { color: 'var(--pink)' } : undefined}
      >
        {value}
      </span>
    </div>
  );
}

/* ─────────────────────────── Inline CSS ─────────────────────────── */

const CSS = `
.pg-shell {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 12px;
}

.pg-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}
.pg-toolbar-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.pg-toolbar-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: .2em;
  margin-right: 4px;
}
.pg-preset-btn, .pg-toolbar-btn {
  background: var(--bg-card);
  color: var(--text-dim);
  border: 1px solid var(--border);
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  padding: 6px 12px;
  border-radius: 3px;
  cursor: pointer;
  transition: all .15s ease;
}
.pg-preset-btn:hover, .pg-toolbar-btn:hover {
  color: var(--text);
  border-color: var(--text-dim);
  background: var(--bg-card-hover);
}
.pg-preset-btn.active {
  color: var(--accent);
  border-color: var(--accent);
  background: var(--accent-soft);
}
.pg-toolbar-btn.on {
  color: var(--accent);
  border-color: var(--accent);
}
.pg-toolbar-btn.off {
  color: var(--teal);
  border-color: var(--teal);
}
.pg-toolbar-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pg-body {
  display: grid;
  grid-template-columns: 220px 1fr 280px;
  gap: 20px;
  align-items: start;
}
@media (max-width: 1100px) {
  .pg-body { grid-template-columns: 1fr; }
}

.pg-left, .pg-right {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 16px;
}
.pg-main { display: flex; flex-direction: column; gap: 16px; }

.pg-palette {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.pg-palette-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.pg-palette-title {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: .2em;
  margin-bottom: 2px;
}
.pg-palette-row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.pg-palette-pill {
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  color: var(--text-dim);
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  padding: 4px 8px;
  border-radius: 12px;
  cursor: pointer;
  transition: all .15s ease;
}
.pg-palette-pill:hover {
  color: var(--text);
  border-color: var(--text-dim);
}
.pg-palette-pill.active {
  color: var(--accent);
  border-color: var(--accent);
  background: var(--accent-soft);
}
.pg-palette-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  color: var(--text-dim);
  font-family: 'DM Sans', system-ui, sans-serif;
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 3px;
  cursor: pointer;
  text-align: left;
  transition: all .15s ease;
}
.pg-palette-btn:hover {
  background: var(--bg-card-hover);
  color: var(--text);
  border-color: var(--text-dim);
}
.pg-palette-btn.active {
  background: var(--accent-soft);
  border-color: var(--accent);
  color: var(--text);
}
.pg-palette-label { flex: 1; }
.pg-palette-hint {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: var(--text-muted);
  line-height: 1.5;
  padding-top: 8px;
  border-top: 1px solid var(--border);
}

.pg-inspector { display: flex; flex-direction: column; gap: 10px; }
.pg-inspector-title {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: .2em;
}
.pg-inspector-kind {
  font-family: 'Fraunces', serif;
  font-style: italic;
  font-size: 18px;
  color: var(--text);
  margin-bottom: 4px;
}
.pg-inspector-empty {
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.5;
}
.pg-inspector-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}
.pg-inspector-btn {
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
.pg-inspector-btn:hover { color: var(--text); border-color: var(--text-dim); }
.pg-inspector-btn.danger:hover { color: var(--pink); border-color: var(--pink); }

.pg-field { display: flex; flex-direction: column; gap: 5px; }
.pg-field-label {
  display: flex;
  justify-content: space-between;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: .15em;
}
.pg-field-unit { color: var(--text-muted); }
.pg-field-input {
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  color: var(--text);
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  padding: 5px 8px;
  border-radius: 2px;
  width: 100%;
  box-sizing: border-box;
}
.pg-field-input:focus { outline: none; border-color: var(--accent); }
.pg-field-slider {
  width: 100%;
  accent-color: var(--accent);
}
.pg-field-static {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--text-muted);
  padding: 4px 0;
}
.pg-toggle {
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  color: var(--text);
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  padding: 6px 10px;
  border-radius: 3px;
  cursor: pointer;
  text-align: center;
  margin-top: 4px;
}
.pg-toggle.open  { color: var(--pink); border-color: var(--pink); }
.pg-toggle.closed { color: var(--teal); border-color: var(--teal); }

.pg-bottom {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 16px;
}
.pg-bottom-row {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}
.pg-bottom-group {
  flex: 1;
  min-width: 200px;
}
.pg-bottom-title {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: .2em;
  margin-bottom: 8px;
}
.pg-bottom-empty {
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.5;
}
.pg-readout-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 4px 0;
  border-bottom: 1px dashed var(--border);
  font-size: 12px;
}
.pg-readout-row:last-child { border-bottom: none; }
.pg-readout-label {
  color: var(--text-dim);
  font-family: 'DM Sans', sans-serif;
}
.pg-readout-value {
  color: var(--text);
  font-family: 'JetBrains Mono', monospace;
  font-weight: 500;
}
.pg-log-row {
  display: flex;
  gap: 10px;
  padding: 3px 0;
  font-size: 11px;
  border-bottom: 1px dashed var(--border);
}
.pg-log-row:last-child { border-bottom: none; }
.pg-log-t {
  color: var(--text-muted);
  font-family: 'JetBrains Mono', monospace;
  flex: 0 0 50px;
}
.pg-log-msg {
  color: var(--text);
  font-family: 'DM Sans', sans-serif;
  flex: 1;
}
`;
