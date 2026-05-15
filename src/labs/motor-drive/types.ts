/**
 * Lab A.3 — Motor + Drive Sandbox
 *
 * Type declarations for the motor / controller / load configuration and the
 * simulation state. The simulation core lives in ./simulation.ts; the React
 * shell in ../MotorDriveLab.tsx wires those pieces together.
 */

export type MotorKind = 'brushed-dc' | 'bldc' | 'pmsm' | 'induction' | 'stepper';
export type ControllerKind = 'h-bridge-pwm' | 'bldc-trapezoid' | 'foc' | 'vf-scalar' | 'microstep';
export type LoadKind = 'constant-torque' | 'constant-power' | 'fan' | 'inertial' | 'regen';

/** Motor electrical + mechanical parameters. Units are SI. */
export interface MotorParams {
  kind: MotorKind;
  /** Stator-phase resistance, Ω. (For brushed DC: armature resistance.) */
  Rs: number;
  /** Stator-phase inductance, H. */
  Ls: number;
  /** Permanent-magnet flux linkage, Wb. (PMSM / BLDC only.) */
  psi_m: number;
  /** Pole pairs. */
  polePairs: number;
  /** Rotor + load inertia (motor side only — load adds its own), kg·m². */
  J_motor: number;
  /** Viscous friction coefficient, N·m·s/rad. */
  B_friction: number;
  /** Rated DC bus voltage at the motor terminals (informational), V. */
  V_rated: number;
  /** Rated continuous current, A_rms (or A for DC). */
  I_rated: number;
  /** Rated continuous torque, N·m. */
  tau_rated: number;
  /** Rated mechanical speed, rad/s. */
  omega_rated: number;
  /** Induction-motor rotor time constant, s. (Induction only.) */
  Tr?: number;
}

export interface ControllerParams {
  kind: ControllerKind;
  /** DC bus voltage, V. */
  Vdc: number;
  /** Switching / PWM frequency, Hz. */
  fsw: number;
  /** Current-loop proportional gain (V / A). */
  Kp_i: number;
  /** Current-loop integral gain (V / (A·s)). */
  Ki_i: number;
  /** Speed-loop proportional gain (A / (rad/s)). */
  Kp_w: number;
  /** Speed-loop integral gain (A / (rad/s · s)). */
  Ki_w: number;
  /** Inverter dead-time, s. (Informational; not modelled in the simple sim.) */
  deadtime: number;
  /** Speed reference, rad/s. */
  omega_ref: number;
  /** Torque-mode reference (used by inertial-load preset), N·m. */
  tau_ref?: number;
  /** V/f boost voltage (induction scalar control), V. */
  Vboost?: number;
  /** Micro-stepping resolution (stepper). */
  microsteps?: number;
}

export interface LoadParams {
  kind: LoadKind;
  /** Load-side inertia, kg·m². */
  J_load: number;
  /** Nominal load torque (constant-torque / fan / regen), N·m. */
  tau_load: number;
  /** Nominal speed at which the load magnitude is specified, rad/s. */
  omega_nom: number;
}

/** A live snapshot of the simulation, pushed to React ~30 Hz. */
export interface SimSnapshot {
  /** Sim time, s. */
  t: number;
  /** Rotor mechanical position, rad. */
  theta_m: number;
  /** Rotor mechanical speed, rad/s. */
  omega_m: number;
  /** Shaft torque (motor electromagnetic torque), N·m. */
  tau_e: number;
  /** Load torque seen at the shaft, N·m. */
  tau_load: number;
  /** Phase currents (a, b, c). For brushed DC, only a is used. A. */
  i_abc: [number, number, number];
  /** Direct- and quadrature-axis currents (rotor frame), A. */
  i_dq: [number, number];
  /** Phase reference currents (commanded). A. */
  i_dq_ref: [number, number];
  /** Stator voltage in the d-q frame (V). */
  v_dq: [number, number];
  /** Electrical input power (V·I sum across phases), W. */
  P_in: number;
  /** Mechanical output power τ_e · ω_m, W. */
  P_out: number;
  /** Instantaneous efficiency, dimensionless (0..1). */
  eta: number;
  /** DC bus current, A. */
  I_dc: number;
  /** Whether the controller is in current saturation. */
  saturated: boolean;
}

/** A rolling-buffer scope trace. */
export interface ScopeTrace {
  t: number[];
  /** One time-aligned channel per phase, A. */
  ia: number[];
  ib: number[];
  ic: number[];
  /** Shaft speed, rad/s. */
  omega: number[];
  /** Shaft torque, N·m. */
  tau: number[];
}

/** A canned configuration the reader can load with one click. */
export interface Preset {
  id: string;
  name: string;
  description: string;
  motor: MotorParams;
  controller: ControllerParams;
  load: LoadParams;
}
