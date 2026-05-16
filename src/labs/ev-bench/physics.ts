/**
 * EV Bench — physics and simulation.
 *
 * Models implemented:
 *
 *   Battery
 *   ───────
 *   Each cell has an open-circuit-voltage curve V_oc(SOC) plus a Thevenin
 *   internal resistance R_int. Terminal voltage under discharge current I is
 *       V_term = V_oc(SOC) - I · R_int
 *   SOC integrates Coulomb-counted current:
 *       SOC(t+dt) = SOC(t) - I · dt / Q
 *   The OCV curve is a piecewise-linear interpolation calibrated to
 *   manufacturer datasheets (a steep tail at both ends for NMC, very flat
 *   between 20-90% SOC for LFP).
 *
 *   Pack
 *   ────
 *   N_s cells in series, N_p strings in parallel. Pack voltage = N_s · V_cell;
 *   pack capacity = N_p · Q_cell; pack R = (N_s / N_p) · R_cell.
 *
 *   Thermal
 *   ───────
 *   I²R heating distributed over the pack mass:
 *       dT/dt = (I_pack² · R_pack) / (m · c_p) - h · A · (T - T_ambient)
 *   with a lumped convective term. No active cooling modelled, just a
 *   first-order soak toward ambient.
 *
 *   Vehicle dynamics
 *   ─────────────────
 *   Tractive force at the wheel = mass·a + ½ρ·CdA·v² + m·g·C_rr + m·g·sin(θ)
 *   Wheel torque = F · r_wheel.
 *   Motor torque = wheel torque / gearbox; motor speed ω = v/r_wheel · gearbox.
 *
 *   Powertrain losses
 *   ──────────────────
 *   Motor efficiency from a simplified Bonin-style map: peak in a torque-speed
 *   band, falling off at low torque (friction-dominated) and high speed
 *   (back-EMF, switching losses). Inverter efficiency similar but flatter.
 *
 *   Charging
 *   ────────
 *   Constant-current up to a chemistry-dependent SOC cutoff (~80% for NMC,
 *   ~90% for LFP), then constant-voltage with current tapering. AC charging
 *   adds OBC losses; DC fast charging bypasses the OBC but is still capped by
 *   pack thermal limit and chemistry charge-rate.
 */

import type {
  BenchConfig,
  BenchSample,
  CellFormat,
  CellSpec,
  Chemistry,
  DriveCycleId,
  ChargerKind,
} from './types';

/* ─── Physical constants ─── */

export const G = 9.80665;          // gravity, m/s²
export const RHO_AIR = 1.225;      // air density at sea level, kg/m³
export const T_AMBIENT_C = 25;     // ambient, °C
export const GASOLINE_KWH_PER_GAL = 33.7; // EPA MPGe conversion (EIA, 2011)

/* ─── Cell library ─── */

export const CELLS: Record<Chemistry, Omit<CellSpec, 'capacityAh' | 'massKg'>> = {
  NMC: {
    label: 'NMC',
    vNom: 3.70,
    vEmpty: 3.00,
    vFull: 4.20,
    rInt: 0.020,
    cp: 950,
    maxDischargeC: 3.0,
    maxChargeC: 1.5,
    calendarYears: 10,
    cycleLife: 1500,
  },
  LFP: {
    label: 'LFP',
    vNom: 3.20,
    vEmpty: 2.50,
    vFull: 3.65,
    rInt: 0.018,
    cp: 950,
    maxDischargeC: 3.0,
    maxChargeC: 1.0,
    calendarYears: 15,
    cycleLife: 4000,
  },
  NCA: {
    label: 'NCA',
    vNom: 3.65,
    vEmpty: 3.00,
    vFull: 4.20,
    rInt: 0.022,
    cp: 950,
    maxDischargeC: 3.0,
    maxChargeC: 1.2,
    calendarYears: 8,
    cycleLife: 1000,
  },
  LTO: {
    label: 'LTO',
    vNom: 2.30,
    vEmpty: 1.50,
    vFull: 2.80,
    rInt: 0.030,
    cp: 1000,
    maxDischargeC: 10.0,
    maxChargeC: 6.0,
    calendarYears: 20,
    cycleLife: 15000,
  },
};

/** Format-dependent capacity (A·h) and mass (kg) per cell. */
const CELL_FORMAT: Record<CellFormat, { capacityAh: number; massKg: number; label: string }> = {
  '21700': { capacityAh: 4.8, massKg: 0.070, label: '21700 cylindrical' },
  '4680':  { capacityAh: 26.0, massKg: 0.355, label: '4680 cylindrical' },
  'pouch': { capacityAh: 60.0, massKg: 0.900, label: 'pouch' },
};

export function getCell(chem: Chemistry, format: CellFormat): CellSpec {
  const base = CELLS[chem];
  const fmt = CELL_FORMAT[format];
  return { ...base, capacityAh: fmt.capacityAh, massKg: fmt.massKg };
}

export function cellFormatLabel(f: CellFormat): string {
  return CELL_FORMAT[f].label;
}

/* ─── OCV-vs-SOC curves ─── */

/** NMC curve: standard sigmoidal with extra slope at top/bottom. */
function ocvNMC(soc: number, vEmpty: number, vFull: number): number {
  // Reference points (SOC, V) calibrated to a Panasonic / LG NMC datasheet.
  // Source-of-shape: roughly Linden's Handbook of Batteries, lithium chapter.
  const refs: Array<[number, number]> = [
    [0.00, 3.00],
    [0.05, 3.30],
    [0.10, 3.45],
    [0.20, 3.55],
    [0.40, 3.68],
    [0.60, 3.78],
    [0.80, 3.92],
    [0.90, 4.05],
    [1.00, 4.20],
  ];
  return remap(soc, refs, vEmpty, vFull);
}

/** LFP curve: very flat plateau, steep tails. */
function ocvLFP(soc: number, vEmpty: number, vFull: number): number {
  const refs: Array<[number, number]> = [
    [0.00, 2.50],
    [0.05, 3.05],
    [0.10, 3.20],
    [0.20, 3.25],
    [0.50, 3.28],
    [0.80, 3.30],
    [0.90, 3.35],
    [0.97, 3.50],
    [1.00, 3.65],
  ];
  return remap(soc, refs, vEmpty, vFull);
}

/** NCA curve: similar shape to NMC, slightly higher mid-band. */
function ocvNCA(soc: number, vEmpty: number, vFull: number): number {
  const refs: Array<[number, number]> = [
    [0.00, 3.00],
    [0.10, 3.50],
    [0.30, 3.65],
    [0.60, 3.75],
    [0.85, 3.95],
    [1.00, 4.20],
  ];
  return remap(soc, refs, vEmpty, vFull);
}

/** LTO curve: low voltage, fairly flat. */
function ocvLTO(soc: number, vEmpty: number, vFull: number): number {
  const refs: Array<[number, number]> = [
    [0.00, 1.50],
    [0.10, 2.10],
    [0.50, 2.25],
    [0.90, 2.45],
    [1.00, 2.80],
  ];
  return remap(soc, refs, vEmpty, vFull);
}

function remap(x: number, refs: Array<[number, number]>, vMin: number, vMax: number): number {
  const clamped = Math.max(0, Math.min(1, x));
  // Find bracketing pair.
  for (let i = 1; i < refs.length; i++) {
    const [x0, y0] = refs[i - 1]!;
    const [x1, y1] = refs[i]!;
    if (clamped <= x1) {
      const u = (clamped - x0) / Math.max(1e-9, x1 - x0);
      const y = y0 + u * (y1 - y0);
      // Renormalise so refs[0]=vMin, refs[last]=vMax (lets us preserve cell limits).
      const yMin = refs[0]![1];
      const yMax = refs[refs.length - 1]![1];
      return vMin + ((y - yMin) / (yMax - yMin)) * (vMax - vMin);
    }
  }
  return vMax;
}

export function cellOCV(chem: Chemistry, soc: number, cell: CellSpec): number {
  switch (chem) {
    case 'NMC': return ocvNMC(soc, cell.vEmpty, cell.vFull);
    case 'LFP': return ocvLFP(soc, cell.vEmpty, cell.vFull);
    case 'NCA': return ocvNCA(soc, cell.vEmpty, cell.vFull);
    case 'LTO': return ocvLTO(soc, cell.vEmpty, cell.vFull);
  }
}

/* ─── Pack-level helpers ─── */

export interface PackInfo {
  cell: CellSpec;
  cellCount: number;
  vNomPack: number;
  capacityAh: number;       // pack-level Q
  energyNomKWh: number;
  rPack: number;
  massKg: number;
}

export function packInfo(cfg: BenchConfig): PackInfo {
  const cell = getCell(cfg.pack.chemistry, cfg.pack.format);
  const cellCount = cfg.pack.series * cfg.pack.parallel;
  const vNomPack = cfg.pack.series * cell.vNom;
  const capacityAh = cfg.pack.parallel * cell.capacityAh;
  const energyNomKWh = (vNomPack * capacityAh) / 1000;
  const rPack = (cfg.pack.series / Math.max(1, cfg.pack.parallel)) * cell.rInt;
  const massKg = cellCount * cell.massKg * 1.15; // 15 % for module + cooling + pack
  return { cell, cellCount, vNomPack, capacityAh, energyNomKWh, rPack, massKg };
}

export function packVoltage(soc: number, iPack: number, info: PackInfo, chem: Chemistry): number {
  const vCell = cellOCV(chem, soc, info.cell) - (iPack / Math.max(1, packParallel(info))) * info.cell.rInt;
  return Math.max(0.01, vCell) * packSeries(info);
}

function packSeries(info: PackInfo): number {
  return Math.round(info.vNomPack / info.cell.vNom);
}
function packParallel(info: PackInfo): number {
  return Math.round(info.capacityAh / info.cell.capacityAh);
}

/* ─── Drive cycle generators ─── */

/** Sampled at 1 s; the simulator linearly interpolates between samples. */
export interface DriveCycle {
  id: DriveCycleId;
  label: string;
  description: string;
  /** Speed samples in m/s, one per second. */
  vMps: number[];
  /** Optional road grade in radians, same length. */
  gradeRad?: number[];
}

/** Synthesised UDDS-style urban cycle: 1370 s, lots of accel/decel. */
function buildUDDS(): DriveCycle {
  const v: number[] = [];
  // Coarse-grained UDDS: 5 stop-and-go bursts, each ~270 s.
  for (let burst = 0; burst < 5; burst++) {
    // Idle 15 s, accel 15 s to ~40 km/h, cruise 60 s, decel 15 s, idle 10 s,
    // accel 10 s to 60 km/h, cruise 70 s, decel 12 s, idle 60 s.
    appendRamp(v, 0, 0, 15);
    appendRamp(v, 0, 40 / 3.6, 15);
    appendRamp(v, 40 / 3.6, 42 / 3.6, 60);
    appendRamp(v, 42 / 3.6, 0, 15);
    appendRamp(v, 0, 0, 10);
    appendRamp(v, 0, 60 / 3.6, 10);
    appendRamp(v, 60 / 3.6, 58 / 3.6, 70);
    appendRamp(v, 58 / 3.6, 0, 12);
    appendRamp(v, 0, 0, 60);
  }
  return { id: 'UDDS', label: 'UDDS (urban)', description: 'EPA Urban Dynamometer Driving Schedule. Heavy stop-and-go, average ~32 km/h, peak ~60 km/h.', vMps: v };
}

/** Synthesised HWFET-style highway cycle: 765 s of cruising. */
function buildHWFET(): DriveCycle {
  const v: number[] = [];
  appendRamp(v, 0, 80 / 3.6, 30);
  appendRamp(v, 80 / 3.6, 95 / 3.6, 200);
  appendRamp(v, 95 / 3.6, 88 / 3.6, 150);
  appendRamp(v, 88 / 3.6, 96 / 3.6, 200);
  appendRamp(v, 96 / 3.6, 85 / 3.6, 100);
  appendRamp(v, 85 / 3.6, 0, 85);
  return { id: 'HWFET', label: 'HWFET (highway)', description: 'EPA Highway Fuel Economy Test. Steady cruise, average ~77 km/h, peak ~96 km/h.', vMps: v };
}

/** Synthesised WLTC-class-3 four-phase cycle: ~1800 s. */
function buildWLTC(): DriveCycle {
  const v: number[] = [];
  // Low phase ~590 s peak 56 km/h
  appendRamp(v, 0, 30 / 3.6, 30);
  appendRamp(v, 30 / 3.6, 50 / 3.6, 200);
  appendRamp(v, 50 / 3.6, 0, 60);
  appendRamp(v, 0, 56 / 3.6, 30);
  appendRamp(v, 56 / 3.6, 40 / 3.6, 200);
  appendRamp(v, 40 / 3.6, 0, 70);
  // Medium ~430 s peak 76 km/h
  appendRamp(v, 0, 50 / 3.6, 30);
  appendRamp(v, 50 / 3.6, 76 / 3.6, 200);
  appendRamp(v, 76 / 3.6, 60 / 3.6, 150);
  appendRamp(v, 60 / 3.6, 0, 50);
  // High ~455 s peak 97 km/h
  appendRamp(v, 0, 80 / 3.6, 40);
  appendRamp(v, 80 / 3.6, 97 / 3.6, 200);
  appendRamp(v, 97 / 3.6, 75 / 3.6, 165);
  appendRamp(v, 75 / 3.6, 0, 50);
  // Extra-high ~325 s peak 131 km/h
  appendRamp(v, 0, 100 / 3.6, 40);
  appendRamp(v, 100 / 3.6, 131 / 3.6, 200);
  appendRamp(v, 131 / 3.6, 0, 85);
  return { id: 'WLTC', label: 'WLTC class 3', description: 'Worldwide Harmonized Light Vehicles Test Cycle, four phases low/medium/high/extra-high.', vMps: v };
}

/** Constant 100 km/h flat. 600 s. */
function buildConst100(): DriveCycle {
  const v: number[] = [];
  appendRamp(v, 0, 100 / 3.6, 30);
  for (let i = 0; i < 570; i++) v.push(100 / 3.6);
  return { id: 'CONST_100', label: 'Constant 100 km/h flat', description: 'Steady highway cruise at 100 km/h.', vMps: v };
}

/** 100 km/h climbing 5 % grade. */
function buildGrade5(): DriveCycle {
  const v: number[] = [];
  appendRamp(v, 0, 100 / 3.6, 30);
  for (let i = 0; i < 570; i++) v.push(100 / 3.6);
  const grade: number[] = [];
  for (let i = 0; i < v.length; i++) {
    grade.push(i < 30 ? 0 : Math.atan(0.05));
  }
  return { id: 'GRADE_5', label: '100 km/h up 5 % grade', description: 'Sustained climb. Stress-tests motor continuous rating and pack discharge C-rate.', vMps: v, gradeRad: grade };
}

/** Hard accel to 100 km/h, brake to 0. Repeat 8x. */
function buildHardAccel(): DriveCycle {
  const v: number[] = [];
  for (let i = 0; i < 8; i++) {
    appendRamp(v, 0, 100 / 3.6, 6);       // 0-100 in 6 s
    appendRamp(v, 100 / 3.6, 0, 5);       // hard brake
    appendRamp(v, 0, 0, 10);              // rest
  }
  return { id: 'HARD_ACCEL', label: 'Hard accel 0-100-0', description: 'Sprint and brake. Stress-tests inverter peak current and regen capability.', vMps: v };
}

function appendRamp(v: number[], v0: number, v1: number, seconds: number) {
  for (let i = 0; i < seconds; i++) {
    const u = seconds <= 1 ? 1 : i / (seconds - 1);
    v.push(v0 + u * (v1 - v0));
  }
}

const CYCLES: Record<DriveCycleId, DriveCycle> = {
  UDDS: buildUDDS(),
  HWFET: buildHWFET(),
  WLTC: buildWLTC(),
  CONST_100: buildConst100(),
  GRADE_5: buildGrade5(),
  HARD_ACCEL: buildHardAccel(),
};

export function getCycle(id: DriveCycleId): DriveCycle {
  return CYCLES[id];
}

export function allCycles(): DriveCycle[] {
  return Object.values(CYCLES);
}

/** Sample the cycle at time t with linear interpolation, clamped at the end. */
export function sampleCycle(c: DriveCycle, t: number): { v: number; a: number; grade: number } {
  if (t < 0) return { v: 0, a: 0, grade: 0 };
  const last = c.vMps.length - 1;
  if (t >= last) return { v: c.vMps[last]!, a: 0, grade: c.gradeRad?.[last] ?? 0 };
  const i = Math.floor(t);
  const u = t - i;
  const v0 = c.vMps[i]!;
  const v1 = c.vMps[i + 1] ?? v0;
  const v = v0 + u * (v1 - v0);
  const a = (v1 - v0); // per-second derivative
  const g0 = c.gradeRad?.[i] ?? 0;
  const g1 = c.gradeRad?.[i + 1] ?? g0;
  const grade = g0 + u * (g1 - g0);
  return { v, a, grade };
}

/* ─── Powertrain efficiency map ─── */

/**
 * PMSM efficiency as a function of (torque-fraction, speed-fraction).
 * Both args ∈ [0, ∞), normalised to peak ratings.
 *
 * Shape (from Krishnan, "Permanent Magnet Synchronous and Brushless DC
 * Motor Drives", 2010, fig. 4.20):
 *   - peak ~ 95% in the band 0.3–0.8 torque, 0.2–0.7 speed
 *   - drops to ~80% at very low torque (iron/friction losses dominate)
 *   - drops to ~85% at flux-weakening high speeds
 */
export function pmsmEfficiency(tFrac: number, sFrac: number): number {
  const t = Math.max(0.02, Math.min(1.4, Math.abs(tFrac)));
  const s = Math.max(0.05, Math.min(1.4, Math.abs(sFrac)));
  // Two-gaussian peak.
  const tPeak = 0.55;
  const sPeak = 0.45;
  const dt = (t - tPeak) / 0.5;
  const ds = (s - sPeak) / 0.45;
  const peakEta = 0.95;
  const lowFloor = 0.78;
  const eta = lowFloor + (peakEta - lowFloor) * Math.exp(-(dt * dt + ds * ds));
  return Math.max(0.6, Math.min(0.965, eta));
}

/** Inverter efficiency: relatively flat, peak ~98 % across a wide range. */
export function inverterEfficiency(loadFrac: number, peak: number): number {
  const l = Math.max(0.02, Math.min(1.3, Math.abs(loadFrac)));
  // Slight droop at very low and very high load.
  return Math.max(0.85, peak * (1 - 0.02 * Math.abs(Math.log(l)) - 0.04 * Math.max(0, l - 1)));
}

/* ─── Charging model ─── */

export interface ChargerSpec {
  kind: ChargerKind;
  /** AC input or DC delivered, kW */
  maxKW: number;
  /** Wall voltage, V (for AC) or coupler voltage (for DC; floats with pack) */
  wallV: number;
  /** Cable current limit, A */
  cableA: number;
  /** True if this is a DC source (bypasses OBC) */
  isDC: boolean;
  label: string;
}

export const CHARGERS: Record<ChargerKind, ChargerSpec> = {
  NONE: { kind: 'NONE', maxKW: 0, wallV: 0, cableA: 0, isDC: false, label: 'unplugged' },
  L1:   { kind: 'L1', maxKW: 1.4, wallV: 120, cableA: 12, isDC: false, label: 'Level 1 (120 V / 12 A)' },
  L2:   { kind: 'L2', maxKW: 11.5, wallV: 240, cableA: 48, isDC: false, label: 'Level 2 (240 V / 48 A)' },
  DCFC: { kind: 'DCFC', maxKW: 350, wallV: 800, cableA: 500, isDC: true, label: 'DC fast (350 kW)' },
};

/** Returns the charging current draw on the pack, given pack state. */
export function chargerCurrent(
  cfg: BenchConfig,
  info: PackInfo,
  soc: number,
  packTempC: number,
): { iCharge: number; pWallKW: number; mode: 'CC' | 'CV' | 'DONE' | 'OFF' } {
  if (cfg.charger === 'NONE' || soc >= 0.999) {
    return { iCharge: 0, pWallKW: 0, mode: cfg.charger === 'NONE' ? 'OFF' : 'DONE' };
  }
  const ch = CHARGERS[cfg.charger];
  const chem = cfg.pack.chemistry;

  // Find the SOC at which CV phase starts. NMC/NCA roll over at ~80%, LFP at ~95%.
  const ccCutoff = chem === 'LFP' ? 0.95 : chem === 'LTO' ? 0.95 : 0.80;

  // Available source power.
  const maxKW = ch.isDC
    ? Math.min(ch.maxKW, (ch.cableA * info.vNomPack) / 1000)
    : Math.min(ch.maxKW, cfg.drive.obcPeakKW);

  // Chemistry max-charge C-rate, applied to pack capacity.
  const cRate = info.cell.maxChargeC;
  const maxAByChemistry = cRate * info.capacityAh;
  // Pack thermal derate: above 45 °C, linearly cut to zero by 60 °C.
  const tempDerate = packTempC > 45
    ? Math.max(0, 1 - (packTempC - 45) / 15)
    : 1;
  const maxAByThermal = maxAByChemistry * tempDerate;

  // Current the source can push at present pack voltage.
  const vPackEst = packVoltage(soc, 0, info, chem);
  const maxAByPower = (maxKW * 1000) / Math.max(1, vPackEst);

  let iCharge: number;
  let mode: 'CC' | 'CV' | 'DONE';

  if (soc < ccCutoff) {
    // Constant-current phase: pull the smallest of the three limits.
    iCharge = Math.min(maxAByPower, maxAByThermal);
    mode = 'CC';
  } else {
    // Constant-voltage taper: I falls roughly exponentially toward 0.
    // Model: target voltage = N_s · V_full; current set by (V_target - V_oc) / R_pack
    const vTarget = packSeries(info) * info.cell.vFull;
    const vOC = packSeries(info) * cellOCV(chem, soc, info.cell);
    const iByCV = Math.max(0, (vTarget - vOC) / Math.max(1e-3, info.rPack));
    iCharge = Math.min(iByCV, maxAByPower, maxAByThermal);
    mode = iCharge < 0.02 * maxAByChemistry ? 'DONE' : 'CV';
  }

  // Convert back to wall power. OBC efficiency ~93%, DC-fast handshake ~97% incl. cable.
  const pPackKW = (iCharge * vPackEst) / 1000;
  const eta = ch.isDC ? 0.97 : 0.93;
  const pWallKW = pPackKW / Math.max(0.5, eta);

  return { iCharge, pWallKW, mode };
}

/* ─── Simulation step ─── */

export interface SimState {
  soc: number;
  packTempC: number;
  distanceM: number;
  energyJ: number;
  /** Cumulative wall energy consumed during charging, J */
  wallEnergyJ: number;
  /** Peak charge power observed, kW */
  peakChargeKW: number;
  /** Elapsed time, s */
  t: number;
}

export function initialState(cfg: BenchConfig, startSoc = 0.85): SimState {
  void cfg;
  return {
    soc: startSoc,
    packTempC: T_AMBIENT_C,
    distanceM: 0,
    energyJ: 0,
    wallEnergyJ: 0,
    peakChargeKW: 0,
    t: 0,
  };
}

/**
 * Step the bench forward by dt seconds. Returns the new state and a telemetry sample.
 * Per-step physics:
 *   1. If unplugged, sample the drive cycle at t to get desired speed.
 *   2. Compute tractive force, wheel torque, motor torque + speed.
 *   3. Determine motor electrical power = mech / motor_eta (or × motor_eta if regen).
 *   4. Inverter losses on top of that to get battery DC power.
 *   5. Battery current = P / V_pack; update SOC = ∫ I dt / Q.
 *   6. Joule heating in pack updates pack temperature.
 *   7. If plugged in, override drive flow with charging current.
 */
export function step(
  cfg: BenchConfig,
  s: SimState,
  dt: number,
  info: PackInfo,
): { state: SimState; sample: BenchSample } {
  const next: SimState = { ...s, t: s.t + dt };

  // === Plugged in: ignore drive cycle, run charger ===
  if (cfg.charger !== 'NONE') {
    const cc = chargerCurrent(cfg, info, s.soc, s.packTempC);
    const vPack = packVoltage(s.soc, -cc.iCharge, info, cfg.pack.chemistry);
    // SOC up.
    const dSoc = (cc.iCharge * dt / 3600) / Math.max(1e-6, info.capacityAh);
    next.soc = Math.min(1, s.soc + dSoc);

    // Thermal: heating from I²R; cooling toward ambient.
    const heatW = cc.iCharge * cc.iCharge * info.rPack;
    const coolW = 18 * (s.packTempC - T_AMBIENT_C); // lumped cooling coefficient, W/K
    const dT = ((heatW - coolW) * dt) / (info.massKg * info.cell.cp);
    next.packTempC = s.packTempC + dT;

    next.energyJ = s.energyJ - cc.iCharge * vPack * dt; // negative = energy added
    next.wallEnergyJ = s.wallEnergyJ + cc.pWallKW * 1000 * dt;
    if (cc.pWallKW > s.peakChargeKW) next.peakChargeKW = cc.pWallKW;

    const mode = cc.mode === 'CC' ? 'CHARGE_CC' : cc.mode === 'CV' ? 'CHARGE_CV' : 'CHARGE_DONE';

    return {
      state: next,
      sample: {
        t: next.t,
        vKph: 0,
        wheelTorqueNm: 0,
        motorTorqueNm: 0,
        omega: 0,
        vPack,
        iPack: -cc.iCharge,
        pKW: -(cc.iCharge * vPack) / 1000,
        soc: next.soc,
        packTempC: next.packTempC,
        distanceM: s.distanceM,
        energyJ: next.energyJ,
        mode,
      },
    };
  }

  // === Driving: sample cycle ===
  const cyc = getCycle(cfg.vehicle.cycle);
  const sample = sampleCycle(cyc, s.t);
  const v = sample.v;                     // m/s
  const a = sample.a;                     // m/s² (per-second from cycle gradient)
  const grade = sample.grade;             // rad

  // Tractive force at the wheel.
  const fInertia = cfg.vehicle.massKg * a;
  const fGrade = cfg.vehicle.massKg * G * Math.sin(grade);
  const fRoll = cfg.vehicle.massKg * G * cfg.vehicle.Crr * (v > 0.05 ? 1 : 0);
  const fDrag = 0.5 * RHO_AIR * cfg.vehicle.CdA * v * v;
  const fWheel = fInertia + fGrade + fRoll + fDrag;

  const wheelTorque = fWheel * cfg.vehicle.wheelRadius; // N·m
  const wheelOmega = v / Math.max(1e-3, cfg.vehicle.wheelRadius); // rad/s

  // Reflect through gearbox to motor.
  const motorOmega = wheelOmega * cfg.drive.gearbox;
  let motorTorque = wheelTorque / Math.max(1e-3, cfg.drive.gearbox);

  // Clamp torque to peak rating ±.
  const peakT = cfg.drive.peakTorqueNm;
  motorTorque = Math.max(-peakT, Math.min(peakT, motorTorque));

  // Mechanical power at the motor shaft (W). Positive = drive; negative = regen.
  const pMechW = motorTorque * motorOmega;

  // Operating fractions for efficiency lookup.
  const peakOmega = (cfg.drive.peakPowerKW * 1000) / Math.max(1, peakT); // ω at peak P
  const sFrac = motorOmega / Math.max(1, peakOmega);
  const tFrac = motorTorque / Math.max(1, peakT);

  // Motor and inverter efficiency.
  const etaMot = pmsmEfficiency(tFrac, sFrac);
  const etaInv = inverterEfficiency(Math.abs(pMechW) / (cfg.drive.peakPowerKW * 1000), cfg.drive.inverterEtaPeak);

  // Electrical DC power into / out of the motor controller.
  // Driving: P_elec = P_mech / (eta_mot * eta_inv); regen: P_elec = P_mech * eta_mot * eta_inv
  let pElecW: number;
  let mode: BenchSample['mode'];
  if (pMechW > 1) {
    pElecW = pMechW / Math.max(0.2, etaMot * etaInv);
    mode = 'DRIVE';
  } else if (pMechW < -1) {
    // Regen, capped at ~75 kW or peak-power half for a typical EV.
    const regenCapW = cfg.drive.peakPowerKW * 1000 * 0.6;
    pElecW = Math.max(-regenCapW, pMechW * etaMot * etaInv);
    mode = 'BRAKE';
  } else {
    pElecW = 200; // 200 W parasitic / 12 V loads always on.
    mode = v > 0.5 ? 'COAST' : 'IDLE';
  }

  // Auxiliary 12 V load: always pull a fraction of the DC-DC rating.
  const auxW = Math.min(cfg.drive.auxDcDcW, 350);
  pElecW += auxW / 0.92; // ~92 % DC-DC efficiency

  // Battery side: solve P = I·V_pack with V_pack = V_oc - I·R.
  // I = (V_oc - sqrt(V_oc² - 4·R·P)) / (2·R), choosing the physical root.
  const vOC = packSeries(info) * cellOCV(cfg.pack.chemistry, s.soc, info.cell);
  const R = info.rPack;
  const disc = vOC * vOC - 4 * R * pElecW;
  let iPack: number;
  if (disc > 0 && pElecW >= 0) {
    iPack = (vOC - Math.sqrt(disc)) / (2 * R);
  } else if (disc > 0 && pElecW < 0) {
    // Regen → charging current
    iPack = (vOC - Math.sqrt(vOC * vOC - 4 * R * pElecW)) / (2 * R);
  } else {
    // Pack hit current limit; cap at chemistry max.
    const sign = pElecW >= 0 ? 1 : -1;
    iPack = sign * info.cell.maxDischargeC * info.capacityAh;
  }
  const vPack = vOC - iPack * R;

  // Update SOC, distance, energy.
  const dSoc = (iPack * dt / 3600) / Math.max(1e-6, info.capacityAh);
  next.soc = Math.max(0, Math.min(1, s.soc - dSoc));
  next.distanceM = s.distanceM + v * dt;
  next.energyJ = s.energyJ + iPack * vPack * dt;

  // Thermal.
  const heatW = iPack * iPack * R;
  const coolW = 18 * (s.packTempC - T_AMBIENT_C);
  next.packTempC = s.packTempC + ((heatW - coolW) * dt) / (info.massKg * info.cell.cp);

  return {
    state: next,
    sample: {
      t: next.t,
      vKph: v * 3.6,
      wheelTorqueNm: wheelTorque,
      motorTorqueNm: motorTorque,
      omega: motorOmega,
      vPack,
      iPack,
      pKW: (iPack * vPack) / 1000,
      soc: next.soc,
      packTempC: next.packTempC,
      distanceM: next.distanceM,
      energyJ: next.energyJ,
      mode,
    },
  };
}

/* ─── Run-summary helpers ─── */

export function summarise(state: SimState, info: PackInfo): {
  distanceKm: number;
  energyKWh: number;
  whPerKm: number;
  remainingRangeKm: number;
  mpge: number;
} {
  const distanceKm = state.distanceM / 1000;
  const energyKWh = state.energyJ / 3.6e6;
  const whPerKm = distanceKm > 0.05 ? (energyKWh * 1000) / distanceKm : 0;
  // Remaining range = SOC · capacity / consumption.
  const remainingKWh = state.soc * info.energyNomKWh;
  const remainingRangeKm = whPerKm > 1 ? (remainingKWh * 1000) / whPerKm : 0;
  // MPGe: 33.7 kWh per gallon of gasoline equivalent.
  const milesPerKWh = whPerKm > 1 ? 1609.344 / whPerKm : 0;
  const mpge = milesPerKWh * GASOLINE_KWH_PER_GAL;
  return { distanceKm, energyKWh, whPerKm, remainingRangeKm, mpge };
}

export function chargeSummary(
  state: SimState,
  info: PackInfo,
  cfg: BenchConfig,
  startSocAtConnect: number,
): {
  timeTo80S: number;
  timeTo100S: number;
  chargeEfficiency: number;
} {
  void startSocAtConnect;
  // Estimate remaining time naively: at current rate, how long until 80/100?
  const cc = chargerCurrent(cfg, info, state.soc, state.packTempC);
  const aNow = cc.iCharge;
  if (aNow < 0.5) return { timeTo80S: NaN, timeTo100S: NaN, chargeEfficiency: NaN };
  const ahRemaining80 = Math.max(0, 0.80 - state.soc) * info.capacityAh;
  const ahRemaining100 = Math.max(0, 1.00 - state.soc) * info.capacityAh;
  const timeTo80S = (ahRemaining80 / aNow) * 3600;
  // CV-phase doubles the linear time-estimate for the last 20 % (rule of thumb).
  const timeTo100S = timeTo80S + 2 * ((ahRemaining100 - ahRemaining80) / aNow) * 3600;
  const chargeEfficiency = state.wallEnergyJ > 1 ? Math.min(0.99, -state.energyJ / state.wallEnergyJ) : NaN;
  return { timeTo80S, timeTo100S, chargeEfficiency };
}
