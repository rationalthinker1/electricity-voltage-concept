/**
 * Type definitions for the Power Grid Simulator.
 *
 * A grid document is a one-line diagram: a collection of buses (electrical
 * nodes), edges (transmission lines or transformers) between buses, and
 * per-bus generators and loads. The simulation solves a DC power flow each
 * tick and integrates system frequency through the swing equation.
 *
 * Units (we keep everything in SI / per-unit-MW for clarity):
 *   Real power P:        MW   (signed: generators positive into the bus,
 *                              loads negative.)
 *   Reactive power Q:    MVAr
 *   Voltage V:           per-unit  (1.00 = nominal kV at that bus level)
 *   Line impedance R+jX: per-unit on a 100 MVA base
 *   Length:              miles
 *   Frequency:           Hz  (nominal 60 Hz)
 *   Inertia H:           seconds  (stored kinetic energy ÷ rated MVA)
 *   Droop R_droop:       % (per-unit Δf / per-unit Δ-power)
 *   Cost:                $/MWh
 *   Emissions:           kgCO2 / MWh
 */

/* ───── Generator types ───── */

export type GeneratorKind =
  | 'coal'        // Big thermal, slow, high inertia, dirtiest.
  | 'ccgt'        // Combined-cycle gas, medium inertia, medium cost.
  | 'hydro'       // Cheap, fast, high inertia.
  | 'wind'        // Variable, zero fuel cost, no native inertia.
  | 'solar'       // Variable, daytime, no native inertia.
  | 'battery';    // Storage; inverter-based. Can inject or absorb.

export interface Generator {
  id: string;
  kind: GeneratorKind;
  /** Rated real-power capacity in MW. */
  ratedMW: number;
  /** Current dispatch fraction 0–1 (battery: -1 to +1 for absorb→inject). */
  dispatch: number;
  /** Inertia constant in seconds (H = ½ J ω² / S_rated). */
  H: number;
  /** Droop coefficient as a fraction (0.05 = 5 % droop). */
  droop: number;
  /** Variable cost in $/MWh. */
  cost: number;
  /** CO₂ intensity in kgCO₂ / MWh. */
  co2: number;
  /** Battery: current state of charge 0–1 (ignored for other kinds). */
  soc?: number;
  /** Battery: total energy capacity in MWh. */
  energyMWh?: number;
  /** Has the operator tripped this unit offline? */
  tripped?: boolean;
}

/* ───── Load types ───── */

export type LoadKind =
  | 'residential'  // Constant impedance (V²/R) — load shrinks if V sags.
  | 'industrial'  // Constant power — draws fixed MW regardless of V.
  | 'motor'       // Constant current — draws fixed I regardless of V.
  | 'ev';         // Constant power, scaled by EV-cluster size.

export interface Load {
  id: string;
  kind: LoadKind;
  /** Rated real demand in MW at nominal voltage. */
  ratedMW: number;
  /** Demand multiplier 0–1.5 used by scenario timelines. */
  demandScale: number;
  /** Power factor (lagging) 0.7–1.0. */
  pf: number;
}

/* ───── Bus / Transformer / Line ───── */

/** Voltage class of a bus in kV. */
export type VoltageLevel = 230 | 138 | 69 | 25 | 12.47 | 0.48 | 0.24;

/** A bus is an electrical node — a substation, a generation plant tie, a
 *  feeder junction, or a load aggregation point. */
export interface Bus {
  id: string;
  /** Display position in canvas grid cells. */
  x: number;
  y: number;
  /** Nominal kV class at this bus. */
  kv: VoltageLevel;
  /** Generators attached to this bus. */
  generators: Generator[];
  /** Loads attached to this bus. */
  loads: Load[];
  /** Optional human label, e.g. "Bus 1 — North Sub". */
  label?: string;
}

/** A transmission line between two buses of the same voltage class. */
export interface Line {
  id: string;
  fromBusId: string;
  toBusId: string;
  /** Length in miles. */
  lengthMi: number;
  /** Per-unit resistance on 100 MVA base. */
  rPu: number;
  /** Per-unit reactance on 100 MVA base. */
  xPu: number;
  /** Thermal rating in MVA. */
  ratingMVA: number;
}

/** A transformer between two buses at different voltage classes. */
export interface Transformer {
  id: string;
  fromBusId: string;
  toBusId: string;
  /** Rated capacity in MVA. */
  ratingMVA: number;
  /** Per-unit leakage reactance on its own MVA base. */
  xPu: number;
}

/* ───── Document ───── */

export interface GridDoc {
  buses: Bus[];
  lines: Line[];
  transformers: Transformer[];
  /** System nominal frequency, Hz. Standard is 60 Hz in North America. */
  nominalHz: number;
}

/** A scenario preset (e.g. "afternoon ramp"). */
export interface GridPreset {
  id: string;
  name: string;
  description: string;
  /** Initial document. */
  doc: GridDoc;
  /** Optional time-varying overrides applied as t advances. */
  schedule?: ScheduleEvent[];
}

export interface ScheduleEvent {
  /** Seconds of sim-time when this event fires. */
  at: number;
  description: string;
  apply: (doc: GridDoc) => void;
}

/* ───── Solver outputs ───── */

export interface PowerFlowResult {
  /** Bus voltage magnitudes in per-unit, indexed by bus.id. */
  voltage: Map<string, number>;
  /** Bus voltage angles in radians, indexed by bus.id. */
  theta: Map<string, number>;
  /** Real-power flow on each edge in MW, in the from→to direction. */
  flowMW: Map<string, number>;
  /** I²R loss on each edge in MW. */
  lossMW: Map<string, number>;
  /** Aggregate stats. */
  totalGenMW: number;
  totalLoadMW: number;
  totalLossMW: number;
  /** Slack-bus imbalance — non-zero means the grid is short-on-generation. */
  imbalanceMW: number;
  /** True if the linear system was non-singular. */
  ok: boolean;
}

export interface FrequencyState {
  /** System frequency in Hz. */
  hz: number;
  /** Rate of change, Hz/s. */
  rocof: number;
  /** Cumulative under-frequency load shedding fraction (0–1). */
  shedFrac: number;
}

export interface SystemSnapshot {
  pf: PowerFlowResult;
  freq: FrequencyState;
  t: number;
  /** Locational marginal cost in $/MWh — derived from the marginal generator. */
  lmpUSDPerMWh: number;
  /** System-average CO₂ intensity, kgCO₂/MWh. */
  co2Intensity: number;
}

/* ───── UI selection ───── */

export type SelectionKind = 'bus' | 'line' | 'transformer' | 'generator' | 'load';

export interface Selection {
  kind: SelectionKind;
  id: string;
  /** For generator / load: the parent bus id. */
  parentBusId?: string;
}

/** A tool armed in the palette. */
export type ArmedTool =
  | { kind: 'select' }
  | { kind: 'bus'; kv: VoltageLevel }
  | { kind: 'line' }
  | { kind: 'transformer' }
  | { kind: 'generator'; genKind: GeneratorKind }
  | { kind: 'load'; loadKind: LoadKind };
