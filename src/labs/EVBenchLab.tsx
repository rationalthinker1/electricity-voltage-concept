/**
 * Lab A.4 — EV / Battery / Charger Bench
 *
 *   P_wheel = P_battery × η_inv × η_motor × η_gearbox
 *
 * A complete EV powertrain on a single page. The user picks a battery pack
 * (chemistry, cell format, series × parallel topology), a drivetrain (motor,
 * inverter, OBC, DC-DC, gearbox), and a vehicle (mass, CdA, C_rr, drive cycle).
 * The simulation runs at ~0.1 s logical steps and streams live readouts of
 * speed, torque, current, SOC, temperature, and instantaneous power.
 *
 * Architecture
 * ────────────
 *   /labs/EVBenchLab.tsx           ← this file (UI + sim loop + plots)
 *   /labs/ev-bench/types.ts        ← config + telemetry types
 *   /labs/ev-bench/physics.ts      ← cell library, OCV curves, drive cycles,
 *                                    powertrain efficiency, charger taper, step()
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { LabShell } from '@/components/LabShell';
import { MathBlock, Pullout } from '@/components/Prose';
import { Cite } from '@/components/SourcesList';
import { BASE_LAB_SOURCES } from '@/labs/data/manifest';
import { getCanvasColors } from '@/lib/canvasTheme';

import {
  CELLS,
  CHARGERS,
  allCycles,
  cellFormatLabel,
  chargeSummary,
  getCell,
  initialState,
  packInfo,
  pmsmEfficiency,
  step,
  summarise,
} from './ev-bench/physics';
import type {
  BenchConfig,
  BenchSample,
  ChargerKind,
  Chemistry,
  CellFormat,
  DriveCycleId,
  MotorKind,
} from './ev-bench/types';

const SLUG = 'ev-bench';
const SOURCES = BASE_LAB_SOURCES[SLUG]!;

/** Logical sim timestep — EV dynamics are slow, 0.1 s is plenty. */
const DT_S = 0.1;
/** Sim steps per animation frame (≈ 6 → ~0.6 s of sim per real-second at 60 fps). */
const STEPS_PER_FRAME = 6;
/** How many seconds of telemetry the scrolling traces show. */
const TRACE_WINDOW_S = 120;
/** Max trace samples kept per channel. */
const TRACE_MAX = Math.ceil(TRACE_WINDOW_S / DT_S);

/* ──────────────────────────── defaults ──────────────────────────── */

const DEFAULT_CONFIG: BenchConfig = {
  pack: {
    chemistry: 'NMC',
    format: '21700',
    series: 96,
    parallel: 46,
  },
  drive: {
    motor: 'PMSM',
    peakTorqueNm: 350,
    peakPowerKW: 200,
    switchKHz: 12,
    inverterEtaPeak: 0.97,
    auxDcDcW: 2500,
    obcInput: '240V-1ph',
    obcPeakKW: 11.5,
    dcCoupler: 'CCS',
    gearbox: 9.0,
  },
  vehicle: {
    massKg: 2000,
    CdA: 0.65,
    Crr: 0.010,
    wheelRadius: 0.33,
    cycle: 'WLTC',
  },
  charger: 'NONE',
};

/* ──────────────────────────── component ──────────────────────────── */

export default function EVBenchLab() {
  const [cfg, setCfg] = useState<BenchConfig>(DEFAULT_CONFIG);
  const [running, setRunning] = useState(false);
  const [sample, setSample] = useState<BenchSample | null>(null);

  const info = useMemo(() => packInfo(cfg), [cfg]);

  // Persisted sim state lives in a ref so React re-renders don't reset it.
  const stateRef = useRef(initialState(cfg, 0.85));
  const cfgRef = useRef(cfg);
  useEffect(() => { cfgRef.current = cfg; }, [cfg]);
  const infoRef = useRef(info);
  useEffect(() => { infoRef.current = info; }, [info]);

  const runningRef = useRef(running);
  useEffect(() => { runningRef.current = running; }, [running]);

  // Streaming traces.
  const traceRef = useRef<{
    t: number[];
    vKph: number[];
    motorTorqueNm: number[];
    iPack: number[];
    soc: number[];
    packTempC: number[];
    pKW: number[];
  }>({
    t: [], vKph: [], motorTorqueNm: [], iPack: [], soc: [], packTempC: [], pKW: [],
  });

  // For charge summary book-keeping.
  const chargeStartSocRef = useRef<number | null>(null);

  /* ─── Main rAF loop ─── */
  useEffect(() => {
    let raf = 0;
    let frame = 0;
    function tick() {
      if (runningRef.current) {
        for (let i = 0; i < STEPS_PER_FRAME; i++) {
          const out = step(cfgRef.current, stateRef.current, DT_S, infoRef.current);
          stateRef.current = out.state;
          const s = out.sample;
          const tr = traceRef.current;
          tr.t.push(s.t);
          tr.vKph.push(s.vKph);
          tr.motorTorqueNm.push(s.motorTorqueNm);
          tr.iPack.push(s.iPack);
          tr.soc.push(s.soc);
          tr.packTempC.push(s.packTempC);
          tr.pKW.push(s.pKW);
          if (tr.t.length > TRACE_MAX) {
            tr.t.shift(); tr.vKph.shift(); tr.motorTorqueNm.shift();
            tr.iPack.shift(); tr.soc.shift(); tr.packTempC.shift(); tr.pKW.shift();
          }
        }
      }
      frame++;
      // Refresh React-rendered readouts every 3 frames to avoid storm.
      if (frame % 3 === 0) {
        const tr = traceRef.current;
        if (tr.t.length > 0) {
          const i = tr.t.length - 1;
          setSample({
            t: tr.t[i]!,
            vKph: tr.vKph[i]!,
            motorTorqueNm: tr.motorTorqueNm[i]!,
            wheelTorqueNm: 0,
            omega: 0,
            iPack: tr.iPack[i]!,
            vPack: 0,
            soc: tr.soc[i]!,
            packTempC: tr.packTempC[i]!,
            pKW: tr.pKW[i]!,
            distanceM: stateRef.current.distanceM,
            energyJ: stateRef.current.energyJ,
            mode: cfgRef.current.charger === 'NONE' ? 'DRIVE' : 'CHARGE_CC',
          });
        }
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  /* ─── Controls ─── */

  const handleReset = useCallback(() => {
    stateRef.current = initialState(cfgRef.current, 0.85);
    traceRef.current = { t: [], vKph: [], motorTorqueNm: [], iPack: [], soc: [], packTempC: [], pKW: [] };
    setSample(null);
    chargeStartSocRef.current = null;
  }, []);

  // Reset sim whenever pack topology or chemistry changes, since SOC and capacity
  // are tied to a particular pack.
  const packSig = `${cfg.pack.chemistry}|${cfg.pack.format}|${cfg.pack.series}|${cfg.pack.parallel}`;
  useEffect(() => {
    handleReset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packSig]);

  const handlePlug = useCallback((kind: ChargerKind) => {
    setCfg(prev => ({ ...prev, charger: kind }));
    if (kind !== 'NONE') {
      chargeStartSocRef.current = stateRef.current.soc;
    } else {
      chargeStartSocRef.current = null;
    }
  }, []);

  /* ─── Derived summaries ─── */

  const driveStats = useMemo(() => summarise(stateRef.current, info), [info, sample]);
  const chargeStats = useMemo(() => {
    if (cfg.charger === 'NONE') return null;
    return chargeSummary(stateRef.current, info, cfg, chargeStartSocRef.current ?? stateRef.current.soc);
  }, [cfg, info, sample]);

  /* ─── Render ─── */

  const labContent = (
    <div className="ev-shell">
      {/* Top toolbar */}
      <div className="ev-toolbar">
        <div className="ev-toolbar-group">
          <button
            type="button"
            className={'ev-btn ' + (running ? 'on' : 'primary')}
            onClick={() => setRunning(r => !r)}
          >{running ? 'Pause' : 'Drive'}</button>
          <button type="button" className="ev-btn" onClick={handleReset}>Reset</button>
        </div>
        <div className="ev-toolbar-group">
          <span className="ev-toolbar-label">Plug into:</span>
          {(['NONE', 'L1', 'L2', 'DCFC'] as ChargerKind[]).map(k => (
            <button
              key={k}
              type="button"
              className={'ev-btn small ' + (cfg.charger === k ? 'active' : '')}
              onClick={() => handlePlug(k)}
            >{plugLabel(k)}</button>
          ))}
        </div>
      </div>

      <div className="ev-body">
        {/* ── Left column: configuration palettes ── */}
        <aside className="ev-left">
          <PackPalette cfg={cfg} onChange={setCfg} info={info} />
          <DrivetrainPalette cfg={cfg} onChange={setCfg} />
          <VehiclePalette cfg={cfg} onChange={setCfg} />
        </aside>

        {/* ── Centre: live plots + efficiency map ── */}
        <main className="ev-main">
          <TracePanel traces={traceRef.current} />
          <EffMapPanel cfg={cfg} sample={sample} />
        </main>

        {/* ── Right column: readouts ── */}
        <aside className="ev-right">
          <LivePanel sample={sample} cfg={cfg} />
          {cfg.charger === 'NONE'
            ? <DriveSummaryPanel stats={driveStats} />
            : <ChargeSummaryPanel stats={chargeStats} sample={sample} />
          }
        </aside>
      </div>
    </div>
  );

  const prose = (
    <>
      <h3 className="lab-section-h3">One bench, the whole powertrain</h3>
      <p className="mb-prose-3">
        An electric vehicle is the longest causal chain in this textbook. Stored chemical energy in an
        intercalation lattice (Ch.25–26) is decoded by a cell into electrochemical potential; cells stack into
        a pack at 350 V or 800 V; a contactor and Battery Management System (BMS) gate the high-voltage bus;
        a three-phase inverter (Ch.24) chops DC into the time-varying voltage a permanent-magnet synchronous
        machine wants to see; the motor (Ch.20) turns that into shaft torque; a single-speed reduction gearbox
        multiplies it; the tyre contact patch turns torque into tractive force; and the car accelerates against
        the same drag and rolling friction that has plagued every vehicle since 1885. This bench integrates the
        whole loop.
      </p>

      <Pullout>
        Range is just energy divided by consumption. Consumption is just power divided by speed. The bench gives
        you both, integrated tenth-of-a-second by tenth-of-a-second.
      </Pullout>

      <h3 className="lab-section-h3">Battery pack — the model</h3>
      <p className="mb-prose-3">
        Each cell carries an open-circuit voltage that depends on its state of charge — V_oc(SOC). For NMC and
        NCA the curve slopes monotonically from about 3.0 V at empty to 4.2 V at full, with mild kinks at the
        ends; for LFP the curve is famously flat — within 0.05 V from 20 % to 90 % SOC — which is why a coulomb
        counter, not a voltmeter, is the only way to read an LFP pack's state. We approximate each curve with a
        small interpolation table shaped by manufacturer datasheets.
      </p>
      <MathBlock>V_term = V_oc(SOC) − I · R_int</MathBlock>
      <p className="mb-prose-3">
        On top of the OCV sits a series internal resistance R_int — the Thévenin equivalent of bulk ionic
        transport plus the SEI interphase. Discharge current pulls the terminal voltage down by I·R_int. The
        pack composes cells: N_s in series for voltage, N_p in parallel for capacity. A 96s × 46p NMC pack of
        21700 cells gives a nominal bus of 96 × 3.70 V ≈ 355 V at 46 × 4.8 A·h = 221 A·h, for an energy of about
        78 kWh — the order of magnitude of a Model 3 Long Range.
      </p>

      <h3 className="lab-section-h3">Vehicle — the back-of-envelope</h3>
      <p className="mb-prose-3">
        Tractive force at the contact patch breaks into four pieces:
      </p>
      <MathBlock>F = m·a + ½ ρ C<sub>d</sub>A · v² + m g C<sub>rr</sub> + m g sin θ</MathBlock>
      <p className="mb-prose-3">
        inertia, aero drag, rolling friction, and grade. Aero scales with the square of speed; rolling friction
        is roughly constant; grade dominates on a 5 % climb. Multiply by speed to get power, divide by drivetrain
        efficiency (motor × inverter ≈ 0.92 in the cruise band), and you have the DC current the pack must source.
        At 100 km/h on flat ground with C<sub>d</sub>A ≈ 0.65 m² and C<sub>rr</sub> = 0.010, a 2 000 kg sedan
        spends roughly 18 kW at the wheels; with an 0.92-efficient drive that's about 20 kW from the pack, or
        20 kWh per 100 km. Multiply by available battery energy and you have range. Try it in the bench: set
        the cycle to "Constant 100 km/h flat" and read the steady-state consumption directly off the bottom panel.
      </p>

      <h3 className="lab-section-h3">Motor + inverter — the efficiency map</h3>
      <p className="mb-prose-3">
        A permanent-magnet synchronous motor is most efficient in a band of moderate torque and moderate speed.
        At low torque, iron losses and friction dominate the small useful output; at high speed, flux weakening
        forces the controller to inject extra d-axis current, lifting copper losses. The map at right is the
        canonical Krishnan-Bonin shape<Cite id="sedra-smith-2014" in={SOURCES} /> — peak ≈ 95 % in the centre,
        dropping toward 80 % at the corners. The inverter is flatter — switching losses are small relative to
        copper losses, and the peak efficiency of a modern SiC three-phase bridge is ~98 %<Cite id="erickson-maksimovic-2020" in={SOURCES} />.
      </p>

      <h3 className="lab-section-h3">Charging — why DC fast charging tapers</h3>
      <p className="mb-prose-3">
        AC charging is bottlenecked by the on-board charger (OBC). The OBC is an isolated AC-DC converter sized
        for the connector standard it talks to: 1.4 kW for a Level-1 wall outlet (NEMA 5-15 at 12 A), up to
        11.5 kW for Level-2 on a 48 A J1772 cable<Cite id="sae-j1772" in={SOURCES} />, or 22 kW for European
        three-phase Type-2 / IEC 62196<Cite id="iec-62196" in={SOURCES} />. The vehicle and the EVSE negotiate
        the available current via the J1772 control pilot — a 1 kHz square wave whose duty cycle encodes the
        cable's ampacity to the car. Underwriters Laboratories certifies the in-cable Charge Circuit Interrupting
        Device (CCID, the 20 mA ground-fault detector) under UL 2231<Cite id="ul-2231" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        DC fast charging skips the OBC entirely. The off-board charger delivers a regulated DC current directly
        to the pack through the CCS or NACS coupler. Up to about 80 % SOC the limit is current — the pack
        chemistry can absorb 1-3 C of charge current without lithium plating on the anode, so a 78 kWh pack at
        2 C can sustain 156 kW of charging until the cells approach their voltage ceiling. Beyond ~80 % the
        chemistry rolls into constant-voltage mode: the charger holds the cell voltage at its full-charge
        setpoint (4.20 V for NMC, 3.65 V for LFP) and the current falls roughly exponentially as the cell's own
        OCV climbs to meet it. The familiar "20 minutes 10–80, another 30 minutes 80–100" curve falls directly
        out of this — try it in the bench by plugging into DCFC and watching the kW readout collapse as SOC
        crosses 80 %.
      </p>
      <MathBlock>I_CV(t) ≈ (V_target − V_oc(SOC)) / R_pack</MathBlock>
      <p className="mb-prose-3">
        Pack temperature gates the whole story: above 45 °C the BMS derates the charge current to protect cycle
        life; above 60 °C it pulls the contactor open. The bench's thermal model is a single lumped node — pack
        Joule heating I²R minus a convective term proportional to (T − T_ambient) — but it's enough to see why
        long DC-fast sessions in summer can throttle before the chemistry would.
      </p>

      <h3 className="lab-section-h3">Five exercises to run in the bench</h3>
      <p className="mb-prose-3"><strong className="text-text font-medium">1. Design a 500-km WLTP pack.</strong> Pick NMC + 21700. Set the cycle to WLTC. The pack delivers
      energy E = N_s × N_p × V_cell × Q_cell. Aim for about 75 kWh and a consumption around 150 Wh/km. What
      series-parallel topology gets you 500 km of range? Now read the C-rate at peak power (200 kW): C = I_peak
      / Q_pack. If you went thin and tall (high N_s, low N_p), your C-rate is dangerous; if you went wide and
      short, your pack voltage is low and the inverter currents skyrocket. The 96s × 46p default is a typical
      compromise.</p>

      <p className="mb-prose-3"><strong className="text-text font-medium">2. LFP at 100 % DoD vs NMC at 80 % DoD over 1 000 cycles.</strong> LFP's flat OCV and 4 000+
      cycle life let you cycle it deep without much capacity loss. NMC at 80 % DoD (charging only to 80 % SOC)
      degrades more slowly than NMC at 100 %, but still faster than LFP. Set up both packs in the bench, run
      a WLTC cycle on each, and compare the energy delivered per kWh of nameplate capacity. (The bench does
      not yet step calendar/cycle aging, but the readout shows you the C-rate, which drives degradation.)</p>

      <p className="mb-prose-3"><strong className="text-text font-medium">3. 100 km/h up a 5 % grade.</strong> Pick "100 km/h up 5 % grade" as the cycle. The motor
      power demand jumps from ~18 kW (flat) to ~45 kW (climb). Watch the motor operating point migrate on the
      efficiency map — moderate speed, much higher torque. Does the inverter stay in its peak-efficiency band?
      Does the pack temperature climb?</p>

      <p className="mb-prose-3"><strong className="text-text font-medium">4. Regen budget.</strong> Pick the "Hard accel 0-100-0" cycle. Each brake event tries to pump
      kinetic energy back into the pack. The bench caps regen at 60 % of peak power — a typical EV constraint
      from cold-pack acceptance, friction-brake blending, and one-pedal-driving tuning. What fraction of the
      kinetic energy each sprint puts in does the regen phase recover? (Hint: read the negative dips in the
      battery-current trace.)</p>

      <p className="mb-prose-3"><strong className="text-text font-medium">5. L2 vs DCFC charging time.</strong> Run the pack down to ~20 % SOC. Plug into Level-2 — watch
      the charge power sit near 11 kW indefinitely, all the way to 100 %. Now plug into DCFC — the power leaps
      to 150 kW+, climbs to 200+ kW between 30–60 % SOC depending on chemistry, then tapers. The Level-2
      session takes hours; the DCFC session takes about 25 minutes to 80 % and another 40 minutes to top off.
      That last 20 % is the slowest, not because the charger isn't capable, but because the cell chemistry
      cannot accept it.</p>

      <h3 className="lab-section-h3">What's not modelled</h3>
      <p className="mb-prose-3">
        Real packs have cell-to-cell variation that the BMS balances passively (bleed resistors on high cells)
        or actively (DC-DC shuttles); the bench treats every cell as identical. Real motors run field-oriented
        control with two PI loops on d- and q-axis currents; the bench uses an algebraic efficiency map. Real
        chargers negotiate via a CAN bus, with handshakes and isolation checks; the bench just clamps to the
        envelope. Real batteries age — SoH falls about 2 %/year calendar plus ~1 % per 100 full cycles —
        but the bench resets to nominal each run. These are deliberate omissions: the goal is to see how the
        macroscopic numbers — range, charge time, efficiency, temperature — emerge from the underlying physics,
        not to replicate a production-grade simulator. The fundamental constants used (e, k_B, ρ_air) are
        CODATA / standard atmosphere values<Cite id="codata-2018" in={SOURCES} />.
      </p>
    </>
  );

  return (
    <>
      <style>{CSS}</style>
      <LabShell
        slug={SLUG}
        labSubtitle="EV Powertrain Bench"
        labId="ev-bench / P_wheel = η·P_battery"
        labContent={labContent}
        prose={prose}
      />
    </>
  );
}

/* ──────────────────────────── helpers ──────────────────────────── */

function plugLabel(k: ChargerKind): string {
  switch (k) {
    case 'NONE': return 'Unplug';
    case 'L1': return 'L1 1.4 kW';
    case 'L2': return 'L2 11.5 kW';
    case 'DCFC': return 'DCFC 350';
  }
}

function fmt(n: number, dp = 1): string {
  if (!Number.isFinite(n)) return '—';
  return n.toFixed(dp);
}

function fmtTime(s: number): string {
  if (!Number.isFinite(s) || s < 0) return '—';
  if (s < 60) return `${s.toFixed(0)} s`;
  const m = Math.floor(s / 60);
  const sec = Math.round(s - m * 60);
  if (m < 60) return `${m}m ${sec}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${m - h * 60}m`;
}

/* ──────────────────────────── palettes ──────────────────────────── */

interface PaletteCommon {
  cfg: BenchConfig;
  onChange: (next: BenchConfig) => void;
}

function PackPalette({ cfg, onChange, info }: PaletteCommon & { info: ReturnType<typeof packInfo> }) {
  const cell = getCell(cfg.pack.chemistry, cfg.pack.format);
  return (
    <section className="ev-palette">
      <div className="ev-palette-title">Battery pack</div>
      <Row label="Chemistry">
        <select
          className="ev-input"
          value={cfg.pack.chemistry}
          onChange={e => onChange({ ...cfg, pack: { ...cfg.pack, chemistry: e.target.value as Chemistry } })}
        >
          {Object.keys(CELLS).map(k => (
            <option key={k} value={k}>{CELLS[k as Chemistry].label}</option>
          ))}
        </select>
      </Row>
      <Row label="Cell format">
        <select
          className="ev-input"
          value={cfg.pack.format}
          onChange={e => onChange({ ...cfg, pack: { ...cfg.pack, format: e.target.value as CellFormat } })}
        >
          {(['21700', '4680', 'pouch'] as CellFormat[]).map(f => (
            <option key={f} value={f}>{cellFormatLabel(f)}</option>
          ))}
        </select>
      </Row>
      <Row label={`Series (${cfg.pack.series})`}>
        <input
          type="range" min={24} max={144} step={1}
          className="ev-slider"
          value={cfg.pack.series}
          onChange={e => onChange({ ...cfg, pack: { ...cfg.pack, series: +e.target.value } })}
        />
      </Row>
      <Row label={`Parallel (${cfg.pack.parallel})`}>
        <input
          type="range" min={1} max={120} step={1}
          className="ev-slider"
          value={cfg.pack.parallel}
          onChange={e => onChange({ ...cfg, pack: { ...cfg.pack, parallel: +e.target.value } })}
        />
      </Row>
      <div className="ev-palette-readout">
        <div><span>cells</span><span>{cfg.pack.series * cfg.pack.parallel}</span></div>
        <div><span>V<sub>nom</sub></span><span>{fmt(info.vNomPack, 0)} V</span></div>
        <div><span>Q<sub>pack</sub></span><span>{fmt(info.capacityAh, 1)} A·h</span></div>
        <div><span>E<sub>nom</sub></span><span>{fmt(info.energyNomKWh, 1)} kWh</span></div>
        <div><span>R<sub>pack</sub></span><span>{fmt(info.rPack * 1000, 1)} mΩ</span></div>
        <div><span>m<sub>pack</sub></span><span>{fmt(info.massKg, 0)} kg</span></div>
        <div><span>cycle life</span><span>{cell.cycleLife}</span></div>
      </div>
    </section>
  );
}

function DrivetrainPalette({ cfg, onChange }: PaletteCommon) {
  const d = cfg.drive;
  return (
    <section className="ev-palette">
      <div className="ev-palette-title">Drivetrain</div>
      <Row label="Motor">
        <select
          className="ev-input"
          value={d.motor}
          onChange={e => onChange({ ...cfg, drive: { ...d, motor: e.target.value as MotorKind } })}
        >
          <option value="PMSM">PMSM</option>
          <option value="INDUCTION">Induction</option>
        </select>
      </Row>
      <Row label={`Peak torque (${d.peakTorqueNm} N·m)`}>
        <input
          type="range" min={100} max={800} step={10}
          className="ev-slider"
          value={d.peakTorqueNm}
          onChange={e => onChange({ ...cfg, drive: { ...d, peakTorqueNm: +e.target.value } })}
        />
      </Row>
      <Row label={`Peak power (${d.peakPowerKW} kW)`}>
        <input
          type="range" min={50} max={500} step={5}
          className="ev-slider"
          value={d.peakPowerKW}
          onChange={e => onChange({ ...cfg, drive: { ...d, peakPowerKW: +e.target.value } })}
        />
      </Row>
      <Row label={`Switching f (${d.switchKHz} kHz)`}>
        <input
          type="range" min={4} max={40} step={1}
          className="ev-slider"
          value={d.switchKHz}
          onChange={e => onChange({ ...cfg, drive: { ...d, switchKHz: +e.target.value } })}
        />
      </Row>
      <Row label={`Inverter η_peak (${(d.inverterEtaPeak * 100).toFixed(0)} %)`}>
        <input
          type="range" min={0.90} max={0.99} step={0.005}
          className="ev-slider"
          value={d.inverterEtaPeak}
          onChange={e => onChange({ ...cfg, drive: { ...d, inverterEtaPeak: +e.target.value } })}
        />
      </Row>
      <Row label={`Gearbox (${d.gearbox.toFixed(2)}:1)`}>
        <input
          type="range" min={5} max={14} step={0.1}
          className="ev-slider"
          value={d.gearbox}
          onChange={e => onChange({ ...cfg, drive: { ...d, gearbox: +e.target.value } })}
        />
      </Row>
      <Row label={`Aux DC-DC (${d.auxDcDcW} W)`}>
        <input
          type="range" min={500} max={5000} step={100}
          className="ev-slider"
          value={d.auxDcDcW}
          onChange={e => onChange({ ...cfg, drive: { ...d, auxDcDcW: +e.target.value } })}
        />
      </Row>
      <Row label="OBC input">
        <select
          className="ev-input"
          value={d.obcInput}
          onChange={e => onChange({ ...cfg, drive: { ...d, obcInput: e.target.value as '240V-1ph' | '400V-3ph' } })}
        >
          <option value="240V-1ph">240 V, 1-phase</option>
          <option value="400V-3ph">400 V, 3-phase</option>
        </select>
      </Row>
      <Row label={`OBC peak (${d.obcPeakKW.toFixed(1)} kW)`}>
        <input
          type="range" min={3} max={22} step={0.5}
          className="ev-slider"
          value={d.obcPeakKW}
          onChange={e => onChange({ ...cfg, drive: { ...d, obcPeakKW: +e.target.value } })}
        />
      </Row>
      <Row label="DC coupler">
        <select
          className="ev-input"
          value={d.dcCoupler ?? 'NONE'}
          onChange={e => onChange({ ...cfg, drive: { ...d, dcCoupler: e.target.value === 'NONE' ? null : (e.target.value as 'CCS' | 'NACS') } })}
        >
          <option value="CCS">CCS</option>
          <option value="NACS">NACS</option>
          <option value="NONE">none</option>
        </select>
      </Row>
    </section>
  );
}

function VehiclePalette({ cfg, onChange }: PaletteCommon) {
  const v = cfg.vehicle;
  return (
    <section className="ev-palette">
      <div className="ev-palette-title">Vehicle</div>
      <Row label={`Mass (${v.massKg} kg)`}>
        <input
          type="range" min={800} max={3500} step={50}
          className="ev-slider"
          value={v.massKg}
          onChange={e => onChange({ ...cfg, vehicle: { ...v, massKg: +e.target.value } })}
        />
      </Row>
      <Row label={`CdA (${v.CdA.toFixed(2)} m²)`}>
        <input
          type="range" min={0.30} max={1.20} step={0.01}
          className="ev-slider"
          value={v.CdA}
          onChange={e => onChange({ ...cfg, vehicle: { ...v, CdA: +e.target.value } })}
        />
      </Row>
      <Row label={`C_rr (${v.Crr.toFixed(3)})`}>
        <input
          type="range" min={0.006} max={0.020} step={0.001}
          className="ev-slider"
          value={v.Crr}
          onChange={e => onChange({ ...cfg, vehicle: { ...v, Crr: +e.target.value } })}
        />
      </Row>
      <Row label={`Wheel r (${(v.wheelRadius * 100).toFixed(0)} cm)`}>
        <input
          type="range" min={0.25} max={0.40} step={0.01}
          className="ev-slider"
          value={v.wheelRadius}
          onChange={e => onChange({ ...cfg, vehicle: { ...v, wheelRadius: +e.target.value } })}
        />
      </Row>
      <Row label="Drive cycle">
        <select
          className="ev-input"
          value={v.cycle}
          onChange={e => onChange({ ...cfg, vehicle: { ...v, cycle: e.target.value as DriveCycleId } })}
        >
          {allCycles().map(c => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
      </Row>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="ev-row">
      <span className="ev-row-label">{label}</span>
      <div className="ev-row-control">{children}</div>
    </div>
  );
}

/* ──────────────────────────── readouts ──────────────────────────── */

function LivePanel({ sample, cfg }: { sample: BenchSample | null; cfg: BenchConfig }) {
  if (!sample) {
    return (
      <section className="ev-readout">
        <div className="ev-readout-title">Live</div>
        <p className="ev-empty">Press "Drive" to begin the simulation.</p>
      </section>
    );
  }
  const ch = CHARGERS[cfg.charger];
  return (
    <section className="ev-readout">
      <div className="ev-readout-title">Live · t = {fmtTime(sample.t)}</div>
      <ReadRow label="Speed" value={`${fmt(sample.vKph, 1)} km/h`} />
      <ReadRow label="Motor torque" value={`${fmt(sample.motorTorqueNm, 0)} N·m`} />
      <ReadRow label="Battery I" value={`${fmt(sample.iPack, 1)} A`} accent={sample.iPack < 0 ? 'teal' : sample.iPack > 100 ? 'pink' : undefined} />
      <ReadRow label="Pack power" value={`${fmt(sample.pKW, 1)} kW`} />
      <ReadRow label="SOC" value={`${(sample.soc * 100).toFixed(1)} %`} accent={sample.soc < 0.10 ? 'pink' : sample.soc > 0.85 ? 'teal' : undefined} />
      <ReadRow label="Pack T" value={`${fmt(sample.packTempC, 1)} °C`} accent={sample.packTempC > 45 ? 'pink' : undefined} />
      <ReadRow label="Mode" value={modeLabel(sample.mode)} />
      {cfg.charger !== 'NONE' && (
        <ReadRow label="Plugged into" value={ch.label} />
      )}
    </section>
  );
}

function DriveSummaryPanel({ stats }: { stats: ReturnType<typeof summarise> }) {
  return (
    <section className="ev-readout">
      <div className="ev-readout-title">This drive</div>
      <ReadRow label="Distance" value={`${fmt(stats.distanceKm, 2)} km`} />
      <ReadRow label="Energy used" value={`${fmt(stats.energyKWh, 3)} kWh`} />
      <ReadRow label="Consumption" value={`${fmt(stats.whPerKm, 0)} Wh/km`} />
      <ReadRow label="Remaining range" value={`${fmt(stats.remainingRangeKm, 0)} km`} />
      <ReadRow label="MPGe" value={`${fmt(stats.mpge, 0)}`} />
    </section>
  );
}

function ChargeSummaryPanel({ stats, sample }: { stats: ReturnType<typeof chargeSummary> | null; sample: BenchSample | null }) {
  if (!stats || !sample) return null;
  const peakKW = Math.max(0, -sample.pKW);
  return (
    <section className="ev-readout">
      <div className="ev-readout-title">This charge</div>
      <ReadRow label="Peak charging" value={`${fmt(peakKW, 1)} kW`} />
      <ReadRow label="Time to 80 %" value={fmtTime(stats.timeTo80S)} />
      <ReadRow label="Time to 100 %" value={fmtTime(stats.timeTo100S)} />
      <ReadRow
        label="η_charge"
        value={Number.isFinite(stats.chargeEfficiency) ? `${(stats.chargeEfficiency * 100).toFixed(1)} %` : '—'}
      />
    </section>
  );
}

function ReadRow({ label, value, accent }: { label: string; value: string; accent?: 'teal' | 'pink' }) {
  return (
    <div className="ev-rd-row">
      <span className="ev-rd-label">{label}</span>
      <span
        className="ev-rd-value"
        style={{ color: accent === 'teal' ? 'var(--teal)' : accent === 'pink' ? 'var(--pink)' : undefined }}
      >{value}</span>
    </div>
  );
}

function modeLabel(m: BenchSample['mode']): string {
  switch (m) {
    case 'DRIVE': return 'driving';
    case 'COAST': return 'coasting';
    case 'BRAKE': return 'regen braking';
    case 'IDLE': return 'idle';
    case 'CHARGE_CC': return 'charge (CC)';
    case 'CHARGE_CV': return 'charge (CV)';
    case 'CHARGE_DONE': return 'charge complete';
  }
}

/* ──────────────────────────── plots ──────────────────────────── */

interface Traces {
  t: number[];
  vKph: number[];
  motorTorqueNm: number[];
  iPack: number[];
  soc: number[];
  packTempC: number[];
  pKW: number[];
}

function TracePanel({ traces }: { traces: Traces }) {
  return (
    <section className="ev-trace">
      <div className="ev-trace-title">Telemetry · last {TRACE_WINDOW_S}s</div>
      <TraceCanvas series={traces} channel="vKph"           label="Speed (km/h)"      color="#ff6b2a" />
      <TraceCanvas series={traces} channel="motorTorqueNm"  label="Motor τ (N·m)"     color="#6cc5c2" symmetric />
      <TraceCanvas series={traces} channel="iPack"          label="Battery I (A)"     color="#ff3b6e" symmetric />
      <TraceCanvas series={traces} channel="pKW"            label="Pack P (kW)"       color="#5baef8" symmetric />
      <TraceCanvas series={traces} channel="soc"            label="SOC (%)"           color="#ffcc55" scale={100} fixedMin={0} fixedMax={100} />
      <TraceCanvas series={traces} channel="packTempC"      label="Pack T (°C)"       color="#a09e95" fixedMin={20} fixedMax={70} />
    </section>
  );
}

interface TraceProps {
  series: Traces;
  channel: keyof Omit<Traces, 't'>;
  label: string;
  color: string;
  symmetric?: boolean;
  scale?: number;
  fixedMin?: number;
  fixedMax?: number;
}

function TraceCanvas({ series, channel, label, color, symmetric, scale, fixedMin, fixedMax }: TraceProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    let raf = 0;
    function draw() {
      if (!c) return;
      const parent = c.parentElement;
      const dpr = window.devicePixelRatio || 1;
      const w = c.clientWidth || parent?.clientWidth || 320;
      const h = 64;
      if (c.width !== Math.floor(w * dpr) || c.height !== Math.floor(h * dpr)) {
        c.width = Math.floor(w * dpr);
        c.height = Math.floor(h * dpr);
        c.style.height = h + 'px';
      }
      const ctx = c.getContext('2d');
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = getCanvasColors().bg;
      ctx.fillRect(0, 0, w, h);

      const ts = series.t;
      const vsRaw = series[channel];
      if (ts.length < 2) {
        ctx.fillStyle = getCanvasColors().textMuted;
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(label, 6, 14);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#3a3935';
        ctx.fillText('— no data —', w - 6, 14);
        raf = requestAnimationFrame(draw);
        return;
      }
      const tNow = ts[ts.length - 1]!;
      const tMin = tNow - TRACE_WINDOW_S;
      const vScale = scale ?? 1;

      // Find y range.
      let vMin = fixedMin ?? Infinity;
      let vMax = fixedMax ?? -Infinity;
      if (fixedMin === undefined || fixedMax === undefined) {
        for (let i = 0; i < vsRaw.length; i++) {
          const v = vsRaw[i]! * vScale;
          if (fixedMin === undefined && v < vMin) vMin = v;
          if (fixedMax === undefined && v > vMax) vMax = v;
        }
        if (symmetric) {
          const m = Math.max(Math.abs(vMin), Math.abs(vMax), 1e-3);
          vMin = -m; vMax = m;
        }
        if (vMin === vMax) { vMin -= 1; vMax += 1; }
        const pad = (vMax - vMin) * 0.1;
        if (fixedMin === undefined) vMin -= pad;
        if (fixedMax === undefined) vMax += pad;
      }

      // Axis line at y=0 if range straddles zero.
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, h - 0.5);
      ctx.lineTo(w, h - 0.5);
      ctx.stroke();
      if (vMin < 0 && vMax > 0) {
        const y0 = h - ((0 - vMin) / (vMax - vMin)) * h;
        ctx.strokeStyle = getCanvasColors().border;
        ctx.beginPath(); ctx.moveTo(0, y0); ctx.lineTo(w, y0); ctx.stroke();
      }

      // Trace.
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.4;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      let first = true;
      for (let i = 0; i < ts.length; i++) {
        const t = ts[i]!;
        if (t < tMin) continue;
        const x = ((t - tMin) / TRACE_WINDOW_S) * w;
        const v = vsRaw[i]! * vScale;
        const y = h - ((v - vMin) / (vMax - vMin)) * h;
        if (first) { ctx.moveTo(x, y); first = false; }
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Labels.
      ctx.fillStyle = getCanvasColors().textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(label, 6, 4);
      // Latest value.
      const latest = vsRaw[vsRaw.length - 1]! * vScale;
      ctx.textAlign = 'right';
      ctx.fillStyle = color;
      ctx.fillText(latest.toFixed(latest > 100 ? 0 : latest > 10 ? 1 : 2), w - 6, 4);
      // Y bounds.
      ctx.fillStyle = getCanvasColors().textMuted;
      ctx.textBaseline = 'bottom';
      ctx.fillText(vMax.toFixed(0), 6, 16);
      ctx.fillText(vMin.toFixed(0), 6, h - 2);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [series, channel, label, color, symmetric, scale, fixedMin, fixedMax]);
  return <canvas className="block w-full" ref={ref} style={{ display: 'block', width: '100%' }} />;
}

/* ──────────────────────────── efficiency map ──────────────────────────── */

function EffMapPanel({ cfg, sample }: { cfg: BenchConfig; sample: BenchSample | null }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const dpr = window.devicePixelRatio || 1;
    const w = c.clientWidth || c.parentElement?.clientWidth || 360;
    const h = 200;
    c.width = Math.floor(w * dpr);
    c.height = Math.floor(h * dpr);
    c.style.height = h + 'px';
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = getCanvasColors().bg;
    ctx.fillRect(0, 0, w, h);

    const padL = 36;
    const padR = 12;
    const padT = 22;
    const padB = 22;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;

    // Render heatmap of efficiency over (speed-fraction × torque-fraction).
    const cols = 60;
    const rows = 30;
    const cellW = plotW / cols;
    const cellH = plotH / rows;
    for (let r = 0; r < rows; r++) {
      const tFrac = 1.1 * (1 - r / rows); // top row = 1.1 (overload), bottom = 0
      for (let col = 0; col < cols; col++) {
        const sFrac = 1.3 * (col / cols);
        const eta = pmsmEfficiency(tFrac, sFrac);
        // Map eta ∈ [0.65, 0.96] to colour ramp.
        const u = Math.max(0, Math.min(1, (eta - 0.65) / 0.30));
        ctx.fillStyle = ramp(u);
        ctx.fillRect(padL + col * cellW, padT + r * cellH, cellW + 1, cellH + 1);
      }
    }

    // Title.
    ctx.fillStyle = getCanvasColors().textDim;
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`PMSM efficiency map — peak τ = ${cfg.drive.peakTorqueNm} N·m, peak P = ${cfg.drive.peakPowerKW} kW`, padL, 6);

    // Axes.
    ctx.strokeStyle = getCanvasColors().borderStrong;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, padT);
    ctx.lineTo(padL, padT + plotH);
    ctx.lineTo(padL + plotW, padT + plotH);
    ctx.stroke();

    // X ticks (speed-fraction).
    ctx.fillStyle = getCanvasColors().textMuted;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let i = 0; i <= 4; i++) {
      const x = padL + (plotW * i) / 4;
      const v = (1.3 * i / 4).toFixed(2);
      ctx.fillText(v, x, padT + plotH + 4);
    }
    ctx.fillText('ω / ω_peak →', padL + plotW / 2, padT + plotH + 16);

    // Y ticks (torque-fraction).
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let i = 0; i <= 4; i++) {
      const y = padT + (plotH * i) / 4;
      const v = (1.1 * (1 - i / 4)).toFixed(2);
      ctx.fillText(v, padL - 6, y);
    }
    ctx.save();
    ctx.translate(10, padT + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('τ / τ_peak', 0, 0);
    ctx.restore();

    // Operating point.
    if (sample) {
      const peakOmega = (cfg.drive.peakPowerKW * 1000) / Math.max(1, cfg.drive.peakTorqueNm);
      const sFrac = sample.omega > 0 ? sample.omega / peakOmega : Math.abs(sample.motorTorqueNm) / cfg.drive.peakTorqueNm * 0.5;
      const tFrac = sample.motorTorqueNm / cfg.drive.peakTorqueNm;
      const sf = Math.max(0, Math.min(1.3, sFrac));
      const tf = Math.max(-1.1, Math.min(1.1, tFrac));
      const x = padL + (sf / 1.3) * plotW;
      const y = padT + (1 - (tf + 1.1) / 2.2) * plotH;
      ctx.fillStyle = getCanvasColors().accent;
      ctx.strokeStyle = '#ecebe5';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }, [cfg, sample]);

  return (
    <section className="ev-effmap">
      <canvas className="block w-full" ref={ref} style={{ display: 'block', width: '100%' }} />
    </section>
  );
}

/** Eta colour ramp: dark blue (low) → teal → amber (high). */
function ramp(u: number): string {
  const c = Math.max(0, Math.min(1, u));
  // Three-stop gradient.
  if (c < 0.5) {
    const k = c / 0.5;
    const r = Math.round(20 + k * (108 - 20));
    const g = Math.round(30 + k * (197 - 30));
    const b = Math.round(70 + k * (194 - 70));
    return `rgb(${r},${g},${b})`;
  }
  const k = (c - 0.5) / 0.5;
  const r = Math.round(108 + k * (255 - 108));
  const g = Math.round(197 + k * (204 - 197));
  const b = Math.round(194 + k * (42 - 194));
  return `rgb(${r},${g},${b})`;
}

/* ──────────────────────────── CSS ──────────────────────────── */

const CSS = `
.ev-shell {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 12px;
}
.ev-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}
.ev-toolbar-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.ev-toolbar-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: .2em;
  margin-right: 4px;
}
.ev-btn {
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
.ev-btn:hover {
  color: var(--text);
  border-color: var(--text-dim);
  background: var(--bg-card-hover);
}
.ev-btn.primary {
  color: var(--accent);
  border-color: var(--accent);
}
.ev-btn.on {
  color: var(--teal);
  border-color: var(--teal);
}
.ev-btn.active {
  color: var(--accent);
  border-color: var(--accent);
  background: var(--accent-soft);
}
.ev-btn.small {
  font-size: 10px;
  padding: 5px 10px;
}

.ev-body {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr) 260px;
  gap: 16px;
  align-items: start;
}
@media (max-width: 1200px) {
  .ev-body { grid-template-columns: minmax(0, 1fr); }
}

.ev-left, .ev-right {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  width: 100%;
}

.ev-palette, .ev-readout, .ev-trace, .ev-effmap {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 12px;
}
.ev-palette-title, .ev-readout-title, .ev-trace-title {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: .2em;
  margin-bottom: 10px;
}

.ev-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 4px 0;
}
.ev-row-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  color: var(--text-dim);
  flex: 1;
}
.ev-row-control {
  flex: 0 0 auto;
  width: 130px;
}
.ev-input {
  width: 100%;
  background: var(--bg-elevated);
  color: var(--text);
  border: 1px solid var(--border);
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  padding: 4px 6px;
  border-radius: 2px;
  box-sizing: border-box;
}
.ev-input:focus { outline: none; border-color: var(--accent); }
.ev-slider {
  width: 100%;
  accent-color: var(--accent);
}

.ev-palette-readout {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed var(--border);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3px 12px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
}
.ev-palette-readout div {
  display: flex;
  justify-content: space-between;
  gap: 6px;
}
.ev-palette-readout span:first-child { color: var(--text-muted); }
.ev-palette-readout span:last-child { color: var(--text); }

.ev-rd-row {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 4px 0;
  border-bottom: 1px dashed var(--border);
  font-size: 12px;
}
.ev-rd-row:last-child { border-bottom: none; }
.ev-rd-label {
  color: var(--text-dim);
  font-family: 'DM Sans', sans-serif;
}
.ev-rd-value {
  color: var(--text);
  font-family: 'JetBrains Mono', monospace;
  font-weight: 500;
}
.ev-empty {
  color: var(--text-muted);
  font-size: 11px;
  line-height: 1.5;
}

.ev-main {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
  width: 100%;
}
.ev-trace {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}
.ev-effmap {
  padding: 0;
  overflow: hidden;
  width: 100%;
}
`;
