/**
 * Type definitions for the schematic editor and MNA solver.
 *
 * All positions live on an integer grid (one unit = GRID_PX pixels in the
 * canvas's CSS coords). A component occupies two grid cells along its long
 * axis (and so has two pins, one at each end). The pin coordinates are
 * derived from the component's anchor (x, y) plus rotation.
 *
 * Wires are line segments between two grid points. Two pins are considered
 * "connected" if either (a) they share grid coordinates, or (b) they're
 * joined by a chain of wires through coincident endpoints.
 */

export type ComponentKind =
  | 'battery'      // DC voltage source.   value = V (volts)
  | 'ac'           // AC voltage source.   value = V_pk (volts), acFreq = Hz
  | 'resistor'    // Ohms.                value = R (Ω)
  | 'capacitor'   // Farads.              value = C (F)
  | 'inductor'    // Henries.             value = L (H)
  | 'diode'       // PWL Shockley.        no value (V_F fixed at 0.7 V)
  | 'bulb'        // Resistor with glow.  value = R (Ω); brightness ∝ I²R
  | 'switch'      // Open/closed toggle.  switchOpen flag
  | 'ground';     // Reference node.      no value, one pin

export type Rotation = 0 | 90 | 180 | 270;

/** A point on the integer grid. */
export interface GridPoint {
  x: number;
  y: number;
}

/** Probe kinds. */
export type ProbeKind = 'voltmeter' | 'ammeter';

/** A placed two-pin (or one-pin, for ground) circuit element. */
export interface PlacedComponent {
  id: string;
  kind: ComponentKind;
  /** Anchor grid point — for a horizontal 2-pin element this is the left pin. */
  x: number;
  y: number;
  rotation: Rotation;
  /** Primary numeric value (V, Ω, F, H, etc.). For ground/diode, unused. */
  value: number;
  /** AC frequency in Hz, only for kind = 'ac'. */
  acFreq?: number;
  /** Switch state, only for kind = 'switch'. */
  switchOpen?: boolean;
}

/** A wire segment between two grid points (Manhattan: horiz or vert). */
export interface Wire {
  id: string;
  from: GridPoint;
  to: GridPoint;
}

/**
 * A probe pinned to a grid point (voltmeter) or to a wire id (ammeter).
 * Voltmeter shows node-to-ground voltage at its grid point.
 * Ammeter shows the current through its attached component / wire.
 */
export interface Probe {
  id: string;
  kind: ProbeKind;
  /** Grid point for voltmeter; ignored for ammeter. */
  at?: GridPoint;
  /** Component id whose current we report (ammeter only). */
  componentId?: string;
}

/** The full editable circuit document. */
export interface CircuitDoc {
  components: PlacedComponent[];
  wires: Wire[];
  probes: Probe[];
}

/** A preset (initial state + display name). */
export interface CircuitPreset {
  id: string;
  name: string;
  description: string;
  doc: CircuitDoc;
}

/* ───────────── Solver-side types ───────────── */

/** Node groups: pins/grid-points partitioned into nodes by wire connectivity. */
export interface NodeMap {
  /** node index by "x,y" key (after merging with wires). Ground = 0. */
  index: Map<string, number>;
  /** number of nodes including ground. */
  count: number;
}

/** Per-step state for reactive components (capacitor / inductor). */
export interface ReactiveState {
  /** Voltage across the element at last solved step. (cap/ind only) */
  v: number;
  /** Current through the element at last solved step. (cap/ind only) */
  i: number;
  /** Diode state from last sub-iteration: true if forward-biased. */
  diodeOn?: boolean;
}

/** Operating-point output of the solver. */
export interface SolverResult {
  /** Node voltages indexed by NodeMap node index. nodeVoltages[0] = 0 (ground). */
  nodeVoltages: number[];
  /** Per-component current (signed, conventional, pin0→pin1) keyed by component id. */
  componentCurrents: Map<string, number>;
  /** Simulated time in seconds. */
  t: number;
  /** Did the solver converge? */
  ok: boolean;
}
