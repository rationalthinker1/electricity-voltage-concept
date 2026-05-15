/**
 * Lab A.3 — Motor + Drive Sandbox
 *
 *   V_dq = R i_dq + L d(i_dq)/dt + ω L i_dq + ω ψ
 *
 * A live bench for the complete motor + power-electronics chain. The reader
 * picks three blocks — motor, controller, load — and the bench advances a
 * coupled electrical + mechanical ODE every animation frame, displaying:
 *
 *   • a rolling phase-current scope (one line per phase)
 *   • a τ-ω operating point superimposed on the motor's torque-speed envelope
 *   • a η(τ, ω) efficiency heatmap with the operating point pinned
 *   • a panel of live readouts (ω, τ, P_in, P_out, η, I_dc)
 *
 * What the reader does
 * ────────────────────
 *   1. Pick a motor (PMSM is the educational core; the others use simplified
 *      but plausible models).
 *   2. Pick a controller (FOC for PMSM; H-bridge PWM for brushed DC; etc.).
 *   3. Pick a load (constant torque, fan, inertial, constant power, regen).
 *   4. Move the speed-reference slider, tune the PI gains, and watch the
 *      currents and torque respond.
 *   5. Click a preset to load a canonical setup.
 *
 * Architecture
 * ────────────
 *   /labs/MotorDriveLab.tsx               ← this file (UI + sim loop)
 *   /labs/motor-drive/types.ts            ← param + snapshot types
 *   /labs/motor-drive/simulation.ts       ← d-q model, integrator, presets
 *   /labs/motor-drive/plots.tsx           ← scope + τ-ω + η-map canvas plots
 *
 * The PMSM + FOC combination is implemented in full d-q form with cascaded
 * speed/current PI loops, decoupling feed-forward, voltage-envelope clamping,
 * and a simple field-weakening rule. The other motor/controller pairs run on
 * lighter equivalent models — see simulation.ts for details.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { LabShell } from '@/components/LabShell';
import { MathBlock, Pullout } from '@/components/Prose';
import { Cite } from '@/components/SourcesList';
import { BASE_LAB_SOURCES } from '@/labs/data/manifest';

import { EfficiencyMap, PhaseScope, TorqueSpeed } from './motor-drive/plots';
import {
  PRESETS, buildEfficiencyMap,
  defaultController, defaultControllerFor, defaultLoad, defaultMotor,
  makeState, resetState, step,
} from './motor-drive/simulation';
import type {
  ControllerKind, ControllerParams, LoadKind, LoadParams,
  MotorKind, MotorParams, ScopeTrace, SimSnapshot,
} from './motor-drive/types';

const SLUG = 'motor-drive';
const SOURCES = BASE_LAB_SOURCES[SLUG]!;

/** Integration steps per animation frame (≈40 sim-ms / frame). */
const STEPS_PER_FRAME = 600;
/** Scope rolling window, s. */
const SCOPE_WINDOW = 0.04;
/** Scope max samples retained. */
const SCOPE_MAX = 240;
/** History trail size in τ-ω space. */
const HISTORY_MAX = 200;

const MOTOR_LABELS: Record<MotorKind, string> = {
  'brushed-dc': 'Brushed DC',
  bldc: 'BLDC (trapezoidal)',
  pmsm: 'PMSM (sinusoidal)',
  induction: 'Induction (squirrel-cage)',
  stepper: 'Stepper (bipolar)',
};
const CONTROLLER_LABELS: Record<ControllerKind, string> = {
  'h-bridge-pwm': 'H-bridge PWM',
  'bldc-trapezoid': '3-phase trapezoidal',
  foc: 'FOC (Clarke + Park + PI)',
  'vf-scalar': 'Scalar V/f',
  microstep: 'Micro-stepping driver',
};
const LOAD_LABELS: Record<LoadKind, string> = {
  'constant-torque': 'Constant torque',
  'constant-power': 'Constant power',
  fan: 'Fan (τ ∝ ω²)',
  inertial: 'Inertial only',
  regen: 'Regenerative',
};

/* ───────────────────────── Component ───────────────────────── */

export default function MotorDriveLab() {
  const [motor, setMotor] = useState<MotorParams>(() => defaultMotor('pmsm'));
  const [controller, setController] = useState<ControllerParams>(() => defaultController('foc'));
  const [load, setLoad] = useState<LoadParams>(() => defaultLoad('fan'));
  const [running, setRunning] = useState(true);
  const [snap, setSnap] = useState<SimSnapshot | null>(null);
  const [trace, setTrace] = useState<ScopeTrace>(
    () => ({ t: [], ia: [], ib: [], ic: [], omega: [], tau: [] }),
  );
  const [history, setHistory] = useState<Array<{ omega: number; tau: number }>>([]);

  // Sim state lives in a ref to survive React's re-renders without restarting.
  const stateRef = useRef(makeState());
  const motorRef = useRef(motor);
  const controllerRef = useRef(controller);
  const loadRef = useRef(load);
  useEffect(() => { motorRef.current = motor; }, [motor]);
  useEffect(() => { controllerRef.current = controller; }, [controller]);
  useEffect(() => { loadRef.current = load; }, [load]);
  const runningRef = useRef(running);
  useEffect(() => { runningRef.current = running; }, [running]);

  // Resetting when motor type changes — the integrator carries axis-frame state.
  useEffect(() => {
    resetState(stateRef.current);
    setTrace({ t: [], ia: [], ib: [], ic: [], omega: [], tau: [] });
    setHistory([]);
  }, [motor.kind, controller.kind]);

  const efficiencyMap = useMemo(() => buildEfficiencyMap(motor), [motor]);

  /* ── Simulation loop ── */
  useEffect(() => {
    let raf = 0;
    const traceLocal: ScopeTrace = { t: [], ia: [], ib: [], ic: [], omega: [], tau: [] };
    const historyLocal: Array<{ omega: number; tau: number }> = [];
    let last: SimSnapshot | null = null;
    let lastSample = 0;
    let frame = 0;

    function tick() {
      if (runningRef.current) {
        for (let i = 0; i < STEPS_PER_FRAME; i++) {
          last = step(stateRef.current, motorRef.current, controllerRef.current, loadRef.current);
          // Numerical guard — if the speed diverges, clamp + reset integrators.
          if (!Number.isFinite(stateRef.current.omega_m) || Math.abs(stateRef.current.omega_m) > 5e3) {
            resetState(stateRef.current);
            break;
          }
          // Sample scope at ~600 µs intervals (≥ several per electrical cycle).
          if (last.t - lastSample >= SCOPE_WINDOW / SCOPE_MAX) {
            traceLocal.t.push(last.t);
            traceLocal.ia.push(last.i_abc[0]);
            traceLocal.ib.push(last.i_abc[1]);
            traceLocal.ic.push(last.i_abc[2]);
            traceLocal.omega.push(last.omega_m);
            traceLocal.tau.push(last.tau_e);
            while (traceLocal.t.length > 0 && last.t - traceLocal.t[0]! > SCOPE_WINDOW) {
              traceLocal.t.shift();
              traceLocal.ia.shift();
              traceLocal.ib.shift();
              traceLocal.ic.shift();
              traceLocal.omega.shift();
              traceLocal.tau.shift();
            }
            lastSample = last.t;
          }
        }
        if (last) {
          historyLocal.push({ omega: last.omega_m, tau: last.tau_e });
          if (historyLocal.length > HISTORY_MAX) historyLocal.shift();
        }
      }
      // Push to React no more than ~30 Hz.
      frame++;
      if (frame % 2 === 0 && last) {
        setSnap(last);
        setTrace({
          t: traceLocal.t.slice(),
          ia: traceLocal.ia.slice(),
          ib: traceLocal.ib.slice(),
          ic: traceLocal.ic.slice(),
          omega: traceLocal.omega.slice(),
          tau: traceLocal.tau.slice(),
        });
        setHistory(historyLocal.slice());
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  /* ── Dropdown handlers ── */

  const onChangeMotor = useCallback((kind: MotorKind) => {
    const m = defaultMotor(kind);
    setMotor(m);
    const cKind = defaultControllerFor(kind);
    setController(defaultController(cKind));
  }, []);

  const onChangeController = useCallback((kind: ControllerKind) => {
    setController(defaultController(kind));
  }, []);

  const onChangeLoad = useCallback((kind: LoadKind) => {
    setLoad(defaultLoad(kind));
  }, []);

  const loadPreset = useCallback((id: string) => {
    const p = PRESETS.find(pp => pp.id === id);
    if (!p) return;
    setMotor(p.motor);
    setController(p.controller);
    setLoad(p.load);
    resetState(stateRef.current);
    setTrace({ t: [], ia: [], ib: [], ic: [], omega: [], tau: [] });
    setHistory([]);
  }, []);

  const resetSim = useCallback(() => {
    resetState(stateRef.current);
    setTrace({ t: [], ia: [], ib: [], ic: [], omega: [], tau: [] });
    setHistory([]);
  }, []);

  /* ── Derived readouts ── */
  const readouts = useMemo(() => {
    if (!snap) {
      return {
        rpm: '0', omega: '0', tau: '0.00', Pin: '0', Pout: '0', eta: '—',
        Idc: '0', simT: '0',
      };
    }
    const rpm = (snap.omega_m * 60 / (2 * Math.PI)).toFixed(0);
    return {
      rpm,
      omega: snap.omega_m.toFixed(1),
      tau: snap.tau_e.toFixed(2),
      Pin: Math.abs(snap.P_in).toFixed(0),
      Pout: Math.abs(snap.P_out).toFixed(0),
      eta: (snap.eta * 100).toFixed(1) + '%',
      Idc: snap.I_dc.toFixed(2),
      simT: snap.t.toFixed(2),
    };
  }, [snap]);

  // Whether the current controller selection makes sense with the current motor.
  const compatibility = useMemo(() => {
    const c = controller.kind;
    const m = motor.kind;
    const good = (
      (m === 'brushed-dc' && c === 'h-bridge-pwm') ||
      (m === 'bldc' && (c === 'bldc-trapezoid' || c === 'foc')) ||
      (m === 'pmsm' && c === 'foc') ||
      (m === 'induction' && (c === 'vf-scalar' || c === 'foc')) ||
      (m === 'stepper' && c === 'microstep')
    );
    return good;
  }, [controller.kind, motor.kind]);

  /* ── Render ── */

  const labContent = (
    <div className="md-shell">
      <div className="md-toolbar">
        <div className="md-toolbar-group">
          <span className="md-toolbar-label">Presets:</span>
          {PRESETS.map(p => (
            <button
              key={p.id}
              type="button"
              className="md-preset-btn"
              onClick={() => loadPreset(p.id)}
              title={p.description}
            >{p.name}</button>
          ))}
        </div>
        <div className="md-toolbar-group">
          <button
            type="button"
            className={'md-toolbar-btn ' + (running ? 'on' : 'off')}
            onClick={() => setRunning(r => !r)}
          >{running ? 'Pause' : 'Run'}</button>
          <button
            type="button"
            className="md-toolbar-btn"
            onClick={resetSim}
          >Reset sim</button>
        </div>
      </div>

      <div className="md-body">
        <aside className="md-left">
          <div className="md-panel-title">Motor</div>
          <select
            className="md-select"
            value={motor.kind}
            onChange={e => onChangeMotor(e.target.value as MotorKind)}
          >
            {Object.entries(MOTOR_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <ParamRow label="R_s" unit="Ω" value={motor.Rs} digits={3} />
          <ParamRow label="L_s" unit="mH" value={motor.Ls * 1000} digits={2} />
          <ParamRow label="ψ_m" unit="Wb" value={motor.psi_m} digits={3} />
          <ParamRow label="pole pairs" unit="" value={motor.polePairs} digits={0} />
          <ParamRow label="V_rated" unit="V" value={motor.V_rated} digits={0} />
          <ParamRow label="I_rated" unit="A" value={motor.I_rated} digits={1} />
          <ParamRow label="τ_rated" unit="N·m" value={motor.tau_rated} digits={2} />
          <ParamRow label="ω_rated" unit="rad/s" value={motor.omega_rated} digits={0} />

          <div className="md-panel-title">Controller</div>
          <select
            className="md-select"
            value={controller.kind}
            onChange={e => onChangeController(e.target.value as ControllerKind)}
          >
            {Object.entries(CONTROLLER_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          {!compatibility && (
            <div className="md-warn">Controller doesn't match this motor type — simulation will diverge or stall.</div>
          )}

          <div className="md-panel-title">Load</div>
          <select
            className="md-select"
            value={load.kind}
            onChange={e => onChangeLoad(e.target.value as LoadKind)}
          >
            {Object.entries(LOAD_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <ParamRow label="J_load" unit="kg·m²" value={load.J_load * 1000} digits={2} suffix=" ×10⁻³" />
          <SliderRow
            label="τ_load magnitude"
            unit="N·m"
            value={load.tau_load}
            min={0} max={Math.max(motor.tau_rated * 2, 1)} step={0.1}
            onChange={v => setLoad(prev => ({ ...prev, tau_load: v }))}
          />
        </aside>

        <main className="md-main">
          <div className="md-plot-row">
            <PlotCard title="Phase currents (rolling 40 ms)">
              <PhaseScope trace={trace} />
            </PlotCard>
          </div>
          <div className="md-plot-row two">
            <PlotCard title="Torque vs speed">
              <TorqueSpeed motor={motor} Vdc={controller.Vdc} snap={snap} history={history} />
            </PlotCard>
            <PlotCard title="Efficiency map η(τ, ω)">
              <EfficiencyMap map={efficiencyMap} snap={snap} />
            </PlotCard>
          </div>

          <div className="md-readouts">
            <div className="md-readout-title">Live readouts</div>
            <div className="md-readout-grid">
              <Readout label="Shaft speed" value={readouts.rpm} unit="RPM" />
              <Readout label="(equivalent)" value={readouts.omega} unit="rad/s" />
              <Readout label="Shaft torque" value={readouts.tau} unit="N·m" />
              <Readout label="P_in (electrical)" value={readouts.Pin} unit="W" />
              <Readout label="P_out (mechanical)" value={readouts.Pout} unit="W" />
              <Readout label="Efficiency η" value={readouts.eta} unit="" highlight />
              <Readout label="I_dc (bus current)" value={readouts.Idc} unit="A" />
              <Readout label="Sim time" value={readouts.simT} unit="s" />
            </div>
          </div>
        </main>

        <aside className="md-right">
          <div className="md-panel-title">Reference</div>
          <SliderRow
            label="ω_ref (speed)"
            unit="rad/s"
            value={controller.omega_ref}
            min={0}
            max={motor.omega_rated * 2}
            step={1}
            onChange={v => setController(prev => ({ ...prev, omega_ref: v }))}
          />
          <ParamRow
            label="(equivalent)"
            unit="RPM"
            value={controller.omega_ref * 60 / (2 * Math.PI)}
            digits={0}
          />

          <div className="md-panel-title">Bus + switching</div>
          <SliderRow
            label="V_dc"
            unit="V"
            value={controller.Vdc}
            min={Math.max(6, motor.V_rated * 0.2)}
            max={Math.max(motor.V_rated * 1.5, 24)}
            step={1}
            onChange={v => setController(prev => ({ ...prev, Vdc: v }))}
          />
          <SliderRow
            label="f_sw"
            unit="kHz"
            value={controller.fsw / 1000}
            min={1} max={40} step={1}
            onChange={v => setController(prev => ({ ...prev, fsw: v * 1000 }))}
          />

          <div className="md-panel-title">Current loop</div>
          <SliderRow
            label="K_p (current)"
            unit="V/A"
            value={controller.Kp_i}
            min={0} max={20} step={0.1}
            onChange={v => setController(prev => ({ ...prev, Kp_i: v }))}
          />
          <SliderRow
            label="K_i (current)"
            unit="V/(A·s)"
            value={controller.Ki_i}
            min={0} max={3000} step={10}
            onChange={v => setController(prev => ({ ...prev, Ki_i: v }))}
          />

          <div className="md-panel-title">Speed loop</div>
          <SliderRow
            label="K_p (speed)"
            unit="A/(rad/s)"
            value={controller.Kp_w}
            min={0} max={10} step={0.05}
            onChange={v => setController(prev => ({ ...prev, Kp_w: v }))}
          />
          <SliderRow
            label="K_i (speed)"
            unit="A/(rad/s·s)"
            value={controller.Ki_w}
            min={0} max={100} step={1}
            onChange={v => setController(prev => ({ ...prev, Ki_w: v }))}
          />

          {snap?.saturated && (
            <div className="md-warn">Current loop in saturation — controller demand exceeds the i_max envelope.</div>
          )}
        </aside>
      </div>
    </div>
  );

  const prose = (
    <>
      <h3 className="font-2 font-normal italic text-9 leading-1 my-4xl mb-xl text-text tracking-1">What this bench wires together</h3>
      <p className="mb-prose-3">
        Four chapters meet in this lab. The MOSFETs and IGBTs of <strong className="text-text font-medium">Chapter 14</strong> are the
        switches in the three-phase inverter; <strong className="text-text font-medium">Chapter 16</strong> contributes the cascaded
        proportional-integral compensators that close the current and speed loops; <strong className="text-text font-medium">Chapter
        20</strong> supplies the electromechanical force law that turns those currents into shaft
        torque<Cite id="griffiths-2017" in={SOURCES} />; and <strong className="text-text font-medium">Chapter 24</strong> shapes the
        H-bridge and three-phase-bridge topologies the controller actually commands. The bench above
        runs the coupled differential equations for all of it at a 25 µs integration step, which is
        fast enough to see a current loop settle, slow enough to keep the math honest.
      </p>
      <p className="mb-prose-3">
        The flagship combination is the <strong className="text-text font-medium">permanent-magnet synchronous motor</strong> driven by{' '}
        <strong className="text-text font-medium">field-oriented control</strong>. Every modern electric vehicle, most industrial
        servomotors, and a growing number of e-bike and drone propulsion drives use this pair. The
        bench implements it in full d-q form; the other four motor/controller pairings use lighter
        equivalent models so the dropdown still tells a coherent story end-to-end<Cite id="erickson-maksimovic-2020" in={SOURCES} />.
      </p>

      <h3 className="font-2 font-normal italic text-9 leading-1 my-4xl mb-xl text-text tracking-1">The FOC reading flow, in one paragraph</h3>
      <p className="mb-prose-3">
        A PMSM has three stator phases <em className="italic text-text">a, b, c</em> wound 120° apart in space. Apply a balanced
        three-phase voltage and a field rotates around the rotor. Measure two of the three phase
        currents (the third follows from Kirchhoff's current law). The <strong className="text-text font-medium">Clarke transform</strong>
        rotates that three-phase reading into a two-axis stationary frame <em className="italic text-text">(α, β)</em>; the{' '}
        <strong className="text-text font-medium">Park transform</strong> then rotates again, this time by the rotor's electrical angle,
        into the rotor-fixed frame <em className="italic text-text">(d, q)</em>. In that frame the surface PMSM's torque equation
        collapses to
      </p>
      <MathBlock>τ_e = (3/2) p_p ψ_m i_q</MathBlock>
      <p className="mb-prose-3">
        which is to say: torque is just <em className="italic text-text">one number</em>, <em className="italic text-text">i_q</em>, multiplied by motor
        constants. The controller closes a PI loop on <em className="italic text-text">i_q</em> to a torque-reference output; a
        second PI loop on <em className="italic text-text">i_d</em> typically holds it at zero (for a surface PMSM) or drives it
        negative above base speed to weaken the field and extend the speed envelope. The PI outputs
        are commanded <em className="italic text-text">v_d, v_q</em> values. The <strong className="text-text font-medium">inverse Park</strong> and{' '}
        <strong className="text-text font-medium">inverse Clarke</strong> transforms turn those back into three-phase voltage commands,
        which space-vector PWM then translates into the gate signals for the six inverter switches.
        From the reader's point of view, a brushless AC machine has been turned into an
        externally-excited DC machine: one knob for torque, one for flux<Cite id="sedra-smith-2014" in={SOURCES} />.
      </p>
      <Pullout>
        Clarke and Park rotate a three-phase mess into two clean numbers. One you hold at zero. The
        other <em className="italic text-text">is</em> the torque.
      </Pullout>

      <h3 className="font-2 font-normal italic text-9 leading-1 my-4xl mb-xl text-text tracking-1">The torque-speed envelope, and why it has two regions</h3>
      <p className="mb-prose-3">
        Every motor has a curve in the τ-ω plane it cannot leave. Below <em className="italic text-text">base speed</em>{' '}
        <em className="italic text-text">ω_b</em> the limit is thermal: the windings can sustain a continuous current of <em className="italic text-text">I_rated</em>,
        which sets a maximum torque <em className="italic text-text">τ_rated</em> independent of speed. This is the
        <strong className="text-text font-medium"> constant-torque region</strong>. Above <em className="italic text-text">ω_b</em> the back-EMF
        <em className="italic text-text"> ω ψ_m</em> begins to exceed what the inverter can supply at its bus voltage; to push more
        current into the machine the controller would need more volts than it has. The available
        torque drops as <em className="italic text-text">τ ∝ 1/ω</em> — power held roughly constant — giving the{' '}
        <strong className="text-text font-medium">constant-power region</strong>. A clever trick called <strong className="text-text font-medium">field weakening</strong>{' '}
        extends the operating range further: drive a negative <em className="italic text-text">i_d</em>, deliberately fighting the
        rotor flux, to lower the effective back-EMF and free up voltage headroom for more <em className="italic text-text">i_q</em>{' '}
        (more torque). The bench's dashed teal curve shows the rated envelope; the amber curve sketches
        the voltage limit set by the chosen <em className="italic text-text">V_dc</em><Cite id="erickson-maksimovic-2020" in={SOURCES} />.
      </p>

      <h3 className="font-2 font-normal italic text-9 leading-1 my-4xl mb-xl text-text tracking-1">The efficiency map</h3>
      <p className="mb-prose-3">
        The η heatmap is a quick analytic estimate, not a re-run of the simulation across the grid.
        For each <em className="italic text-text">(τ, ω)</em> cell, we estimate the dominant loss mechanisms — copper loss <em className="italic text-text">1.5
        R_s i_s²</em>, an iron-loss term that scales with <em className="italic text-text">ω_e²</em>, and a viscous-friction term
        <em className="italic text-text"> B ω²</em> — then divide mechanical power by the sum of mechanical power and losses. The
        result lines up surprisingly well with measured motor maps for surface PMSMs: a high-efficiency
        plateau in the upper-middle of the envelope, falling off toward stall (where copper losses
        dominate) and toward the top-right corner (where iron and field-weakening losses do the same).
        The white circle is the bench's current operating point<Cite id="horowitz-hill-2015" in={SOURCES} />.
      </p>

      <h3 className="font-2 font-normal italic text-9 leading-1 my-4xl mb-xl text-text tracking-1">Reading the phase-current scope</h3>
      <p className="mb-prose-3">
        At a steady operating point on a PMSM-FOC drive, the three phase currents are sinusoids 120°
        apart in time, with frequency equal to <em className="italic text-text">p_p · ω_m / (2π)</em> Hz (the electrical
        frequency). A four-pole-pair motor at 3000 RPM runs at 200 Hz electrical. When you bump the
        speed reference, you'll see two transients overlap: a fast one where the current loop settles
        in milliseconds, and a slower one where the speed loop rides the operating point to its new
        target. The shape on the scope is the cleanest diagnostic of controller health: if it looks
        ragged or non-sinusoidal, the current loop is undertuned.
      </p>

      <h3 className="font-2 font-normal italic text-9 leading-1 my-4xl mb-xl text-text tracking-1">Five problems to try in the sandbox</h3>
      <ol>
        <li>
          <strong className="text-text font-medium">Tune the PMSM current loop to settle a torque step under 5 ms.</strong> Start from
          the <em className="italic text-text">PMSM at 3000 RPM cruise</em> preset. Pause, ramp <em className="italic text-text">K_p (current)</em> from 1 V/A
          upward; watch the τ-step response on the operating-point trail. The current loop's
          closed-loop bandwidth is roughly <em className="italic text-text">K_p / L_s</em> rad/s; 5 ms settling needs ~600 rad/s of
          bandwidth, so for this motor (<em className="italic text-text">L_s</em> = 0.9 mH) <em className="italic text-text">K_p</em> ≈ 0.5–1.0 V/A and
          <em className="italic text-text"> K_i</em> at least <em className="italic text-text">K_p R_s / L_s</em> ≈ 45–90 V/(A·s).
        </li>
        <li>
          <strong className="text-text font-medium">Find the induction motor's pull-out torque at slip = 0.15.</strong> Load the{' '}
          <em className="italic text-text">Induction V/f starting transient</em> preset. The Kloss approximation built into the
          simulation puts pull-out at slip ≈ 0.2 and τ_pullout ≈ 2.5×τ_rated; slip = 0.15 will read a
          torque close to but slightly below pull-out. Confirm by watching the τ readout while
          dragging the ω_ref slider to make <em className="italic text-text">(ω_sync − ω_m)/ω_sync</em> ≈ 0.15.
        </li>
        <li>
          <strong className="text-text font-medium">Make a brushed DC motor regenerate.</strong> Pick the brushed-DC + fan preset. Set
          <em className="italic text-text"> ω_ref</em> well below the current speed; the speed PI now demands negative <em className="italic text-text">i_q</em>,
          the controller flips the armature voltage, and the bus current goes negative — energy is
          flowing from rotor back to bus. The η readout becomes ambiguous in this regime: mechanical
          power is leaving the shaft, electrical power is entering the bus.
        </li>
        <li>
          <strong className="text-text font-medium">Stall the stepper.</strong> Pick the stepper preset. Push <em className="italic text-text">τ_load</em> upward
          until the rotor falls out of step with the commanded angle — you'll see the position error
          <em className="italic text-text"> θ_cmd − θ_e</em> grow past π/2 and the torque collapse. Bipolar steppers above their
          pull-in torque skip steps catastrophically; the bench shows exactly why.
        </li>
        <li>
          <strong className="text-text font-medium">Run the PMSM into field-weakening.</strong> From the cruise preset, drag <em className="italic text-text">ω_ref</em>
          above <em className="italic text-text">ω_rated</em>. Watch <em className="italic text-text">i_d_ref</em> in the d-q readout (the bench prints both
          axes' references) go negative as the controller borrows flux-axis current to free up voltage
          headroom. The operating point on the τ-ω plot crosses into the constant-power region.
        </li>
      </ol>

      <h3 className="font-2 font-normal italic text-9 leading-1 my-4xl mb-xl text-text tracking-1">Why this bench is the most demanding integration in the textbook</h3>
      <p className="mb-prose-3">
        Every chapter you've already read shows up here. The semiconductor switches throttle the bus
        (Ch.14). The PI compensators close the same kind of loops as Ch.16's op-amp circuits. The
        three-phase bridge is exactly the inverter of Ch.24, just clocked at 10 kHz instead of 50 Hz.
        The mechanical equation is Newton's second law for rotation, and the electrical equation is
        Faraday's law applied to a moving conductor in a magnetic field. The achievement of a modern
        traction drive is that all four pieces are designed together — and the dominant constraint at
        every operating point is one of: thermal (i² R loss in the copper), magnetic (saturation in
        the iron), or electrical (voltage envelope of the inverter). Whichever pushes back first is
        the one that sets the curve. The bench above pretends none of those are concerns; in a real
        machine they are all of the concerns. Holding all three at the edge, simultaneously, is what
        a good drive does<Cite id="codata-2018" in={SOURCES} />.
      </p>
    </>
  );

  return (
    <>
      <style>{CSS}</style>
      <LabShell
        slug={SLUG}
        labSubtitle="Motor + Controller + Load Sandbox"
        labId="motor-drive / V_dq = R i + L di/dt + ω L i + ω ψ"
        labContent={labContent}
        prose={prose}
      />
    </>
  );
}

/* ───────────────────────── Small subcomponents ───────────────────────── */

interface PlotCardProps {
  title: string;
  children: React.ReactNode;
}
function PlotCard({ title, children }: PlotCardProps) {
  return (
    <div className="md-plot-card">
      <div className="md-plot-title">{title}</div>
      {children}
    </div>
  );
}

interface ReadoutProps {
  label: string;
  value: string;
  unit: string;
  highlight?: boolean;
}
function Readout({ label, value, unit, highlight }: ReadoutProps) {
  return (
    <div className={'md-readout-cell' + (highlight ? ' highlight' : '')}>
      <div className="md-readout-label">{label}</div>
      <div className="md-readout-value">
        {value}
        {unit && <span className="md-readout-unit"> {unit}</span>}
      </div>
    </div>
  );
}

interface ParamRowProps {
  label: string;
  unit: string;
  value: number;
  digits: number;
  suffix?: string;
}
function ParamRow({ label, unit, value, digits, suffix }: ParamRowProps) {
  return (
    <div className="md-param-row">
      <span className="md-param-label">{label}</span>
      <span className="md-param-value">
        {value.toFixed(digits)}{suffix ? suffix : ''} <span className="md-param-unit">{unit}</span>
      </span>
    </div>
  );
}

interface SliderRowProps {
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}
function SliderRow({ label, unit, value, min, max, step, onChange }: SliderRowProps) {
  return (
    <div className="md-slider-row">
      <div className="md-slider-head">
        <span className="md-slider-label">{label}</span>
        <span className="md-slider-value">
          {value.toFixed(step < 1 ? (step < 0.1 ? 3 : 2) : 0)}
          <span className="md-param-unit"> {unit}</span>
        </span>
      </div>
      <input
        type="range"
        className="md-slider"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
      />
    </div>
  );
}

/* ───────────────────────── Inline CSS ───────────────────────── */

const CSS = `
.md-shell {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 12px;
}

.md-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}
.md-toolbar-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.md-toolbar-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: .2em;
  margin-right: 4px;
}
.md-preset-btn, .md-toolbar-btn {
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
.md-preset-btn:hover, .md-toolbar-btn:hover {
  color: var(--text);
  border-color: var(--text-dim);
  background: var(--bg-card-hover);
}
.md-toolbar-btn.on {
  color: var(--accent);
  border-color: var(--accent);
}
.md-toolbar-btn.off {
  color: var(--teal);
  border-color: var(--teal);
}

.md-body {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr) 260px;
  gap: 20px;
  align-items: start;
}
@media (max-width: 1200px) {
  .md-body { grid-template-columns: minmax(0, 1fr); }
}

.md-left, .md-right {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}
.md-main {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

.md-panel-title {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: .2em;
  margin-top: 6px;
}
.md-panel-title:first-child {
  margin-top: 0;
}

.md-select {
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  color: var(--text);
  font-family: 'DM Sans', system-ui, sans-serif;
  font-size: 12px;
  padding: 6px 8px;
  border-radius: 3px;
  width: 100%;
  cursor: pointer;
}
.md-select:focus {
  outline: none;
  border-color: var(--accent);
}

.md-param-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
  font-size: 11px;
  padding: 3px 0;
  border-bottom: 1px dashed var(--border);
}
.md-param-row:last-of-type { border-bottom: none; }
.md-param-label {
  font-family: 'DM Sans', sans-serif;
  color: var(--text-dim);
}
.md-param-value {
  font-family: 'JetBrains Mono', monospace;
  color: var(--text);
}
.md-param-unit {
  color: var(--text-muted);
  font-size: 10px;
}

.md-slider-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.md-slider-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 11px;
}
.md-slider-label {
  font-family: 'DM Sans', sans-serif;
  color: var(--text-dim);
}
.md-slider-value {
  font-family: 'JetBrains Mono', monospace;
  color: var(--text);
}
.md-slider {
  width: 100%;
  accent-color: var(--accent);
}

.md-warn {
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  color: var(--pink);
  background: rgba(255,59,110,0.07);
  border: 1px solid rgba(255,59,110,0.25);
  border-radius: 3px;
  padding: 6px 8px;
  line-height: 1.4;
}

.md-plot-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}
.md-plot-row.two {
  grid-template-columns: 1fr 1fr;
}
@media (max-width: 800px) {
  .md-plot-row.two { grid-template-columns: 1fr; }
}
.md-plot-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.md-plot-title {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: .2em;
}

.md-readouts {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 16px;
}
.md-readout-title {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: .2em;
  margin-bottom: 12px;
}
.md-readout-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
@media (max-width: 800px) {
  .md-readout-grid { grid-template-columns: repeat(2, 1fr); }
}
.md-readout-cell {
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 3px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.md-readout-cell.highlight {
  border-color: var(--accent);
}
.md-readout-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: .1em;
}
.md-readout-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 18px;
  color: var(--text);
  font-weight: 500;
}
.md-readout-cell.highlight .md-readout-value {
  color: var(--accent);
}
.md-readout-unit {
  font-size: 11px;
  color: var(--text-muted);
}
`;
