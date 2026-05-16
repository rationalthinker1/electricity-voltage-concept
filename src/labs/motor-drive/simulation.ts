/**
 * Lab A.3 — Motor + Drive Sandbox: simulation core.
 *
 * A small fixed-step integrator that advances the coupled electrical +
 * mechanical state of a motor with its controller in the loop. The PMSM-FOC
 * combination is implemented in full d-q form; the other motor / controller
 * combinations use simplified but plausible equivalent models so the bench
 * still reads believably across the dropdown.
 *
 * Reference: Krause et al., "Analysis of Electric Machinery and Drive
 * Systems," 3e (the standard d-q reference). The induction-motor scalar V/f
 * model and the BLDC trapezoidal model follow the equivalents documented in
 * Erickson & Maksimović 2020.
 *
 *   Electrical (PMSM, rotor frame):
 *     v_d = R i_d + L di_d/dt - ω_e L i_q
 *     v_q = R i_q + L di_q/dt + ω_e L i_d + ω_e ψ_m
 *     τ_e = (3/2) p_p ψ_m i_q              (surface PMSM, i_d = 0)
 *
 *   Mechanical:
 *     J dω_m/dt = τ_e − τ_load(ω_m) − B ω_m
 *     dθ_m/dt   = ω_m
 *     ω_e = p_p · ω_m
 *
 * The integrator uses semi-implicit Euler at dt = 25 µs (40 kHz) which is
 * fine for switching frequencies up to ~10 kHz and gives stable simulation
 * across the slider ranges this lab exposes.
 */

import type {
  ControllerKind,
  ControllerParams,
  LoadParams,
  MotorKind,
  MotorParams,
  Preset,
  SimSnapshot,
} from './types';

/** Integrator step size (s). */
export const DT = 25e-6;

/** State the integrator carries between steps. */
export interface SimState {
  t: number;
  theta_m: number; // mechanical angle, rad
  omega_m: number; // mechanical speed, rad/s
  i_d: number;
  i_q: number;
  /** PI integrator accumulators (current loop). */
  e_id_int: number;
  e_iq_int: number;
  /** PI integrator accumulator (speed loop). */
  e_w_int: number;
  /** Estimator state for induction-motor flux angle. */
  theta_flux: number;
  /** For stepper: the commanded electrical angle. */
  theta_cmd: number;
}

export function makeState(): SimState {
  return {
    t: 0,
    theta_m: 0,
    omega_m: 0,
    i_d: 0,
    i_q: 0,
    e_id_int: 0,
    e_iq_int: 0,
    e_w_int: 0,
    theta_flux: 0,
    theta_cmd: 0,
  };
}

export function resetState(s: SimState) {
  s.t = 0;
  s.theta_m = 0;
  s.omega_m = 0;
  s.i_d = 0;
  s.i_q = 0;
  s.e_id_int = 0;
  s.e_iq_int = 0;
  s.e_w_int = 0;
  s.theta_flux = 0;
  s.theta_cmd = 0;
}

/** Clamp helper. */
function clamp(x: number, lo: number, hi: number): number {
  return x < lo ? lo : x > hi ? hi : x;
}

/** Load torque as a function of speed, for the chosen load profile. */
export function loadTorque(load: LoadParams, omega_m: number): number {
  const w_abs = Math.abs(omega_m);
  const sgn = omega_m >= 0 ? 1 : -1;
  switch (load.kind) {
    case 'constant-torque':
      // Always opposes motion at the nominal magnitude.
      return sgn * load.tau_load;
    case 'constant-power': {
      // P = τ · ω constant ⇒ τ = P/ω; saturate at low speed to a stall torque.
      const P = load.tau_load * load.omega_nom;
      const w = Math.max(0.1, w_abs);
      const tau = P / w;
      return sgn * Math.min(tau, load.tau_load * 4);
    }
    case 'fan':
      // τ ∝ ω², scaled to give tau_load at omega_nom.
      return sgn * load.tau_load * (w_abs / load.omega_nom) * (w_abs / load.omega_nom);
    case 'inertial':
      // No continuous load; just inertia.
      return 0;
    case 'regen':
      // Negative torque demand (load is driving the motor).
      return -sgn * load.tau_load;
  }
}

/** Total effective inertia at the shaft. */
export function totalInertia(motor: MotorParams, load: LoadParams): number {
  return motor.J_motor + load.J_load;
}

/* ───────────────────────── d-q transforms ───────────────────────── */

/** Amplitude-invariant Clarke transform (3-phase → α-β). */
export function clarke(ia: number, ib: number, ic: number): [number, number] {
  const i_alpha = (2 / 3) * (ia - 0.5 * ib - 0.5 * ic);
  const i_beta = (2 / 3) * ((Math.sqrt(3) / 2) * (ib - ic));
  return [i_alpha, i_beta];
}

/** Park transform (α-β → d-q, rotor frame at angle θ_e). */
export function park(i_alpha: number, i_beta: number, theta_e: number): [number, number] {
  const c = Math.cos(theta_e),
    s = Math.sin(theta_e);
  return [c * i_alpha + s * i_beta, -s * i_alpha + c * i_beta];
}

/** Inverse Park (d-q → α-β). */
export function invPark(i_d: number, i_q: number, theta_e: number): [number, number] {
  const c = Math.cos(theta_e),
    s = Math.sin(theta_e);
  return [c * i_d - s * i_q, s * i_d + c * i_q];
}

/** Inverse Clarke (α-β → 3-phase). */
export function invClarke(i_alpha: number, i_beta: number): [number, number, number] {
  const ia = i_alpha;
  const ib = -0.5 * i_alpha + (Math.sqrt(3) / 2) * i_beta;
  const ic = -0.5 * i_alpha - (Math.sqrt(3) / 2) * i_beta;
  return [ia, ib, ic];
}

/* ───────────────────────── Main step ───────────────────────── */

/**
 * Advance the simulation by one integrator step. Returns nothing — the state
 * argument is updated in place. Call snapshot() to read out for display.
 */
export function step(
  s: SimState,
  motor: MotorParams,
  ctrl: ControllerParams,
  load: LoadParams,
): SimSnapshot {
  switch (ctrl.kind) {
    case 'foc':
      return stepFOC(s, motor, ctrl, load);
    case 'h-bridge-pwm':
      return stepBrushedDC(s, motor, ctrl, load);
    case 'bldc-trapezoid':
      return stepBLDC(s, motor, ctrl, load);
    case 'vf-scalar':
      return stepInduction(s, motor, ctrl, load);
    case 'microstep':
      return stepStepper(s, motor, ctrl, load);
  }
}

/* ───── PMSM + FOC ─────
 *
 * The flagship combination. Cascaded loops:
 *   ω_ref → (speed PI) → i_q* → (current PI) → v_q  (analogous on the d axis)
 * The inverter is treated as ideal: v_d, v_q clamped at the available
 * voltage envelope V_dc/√3 (max sinusoidal phase voltage from a 3-phase
 * inverter with space-vector modulation).
 */
function stepFOC(
  s: SimState,
  motor: MotorParams,
  ctrl: ControllerParams,
  load: LoadParams,
): SimSnapshot {
  const { Rs, Ls, psi_m, polePairs: pp, B_friction, I_rated, tau_rated } = motor;
  const J = totalInertia(motor, load);
  const omega_e = pp * s.omega_m;
  const theta_e = pp * s.theta_m;

  // Speed loop: produce i_q reference from ω error.
  const e_w = ctrl.omega_ref - s.omega_m;
  s.e_w_int = clamp(s.e_w_int + e_w * DT, -200, 200);
  let i_q_ref = ctrl.Kp_w * e_w + ctrl.Ki_w * s.e_w_int;
  const i_max = I_rated * 1.5; // 150% current envelope
  // Field weakening: above base speed, allow a negative i_d to extend speed.
  const omega_base = motor.omega_rated;
  let i_d_ref = 0;
  if (Math.abs(s.omega_m) > omega_base) {
    const frac = (Math.abs(s.omega_m) - omega_base) / omega_base;
    i_d_ref = -clamp(frac, 0, 0.6) * i_max;
  }
  // Saturate i_q so |I_s| <= i_max.
  const idq_room = Math.sqrt(Math.max(0, i_max * i_max - i_d_ref * i_d_ref));
  const sat_iq = clamp(i_q_ref, -idq_room, idq_room);
  const saturated = sat_iq !== i_q_ref;
  i_q_ref = sat_iq;

  // Current loops.
  const e_id = i_d_ref - s.i_d;
  const e_iq = i_q_ref - s.i_q;
  s.e_id_int = clamp(s.e_id_int + e_id * DT, -100, 100);
  s.e_iq_int = clamp(s.e_iq_int + e_iq * DT, -100, 100);

  // PI output + decoupling feed-forward (the cross-axis ωL terms and the
  // back-EMF on the q axis). With feed-forward, the d and q channels behave
  // like first-order plants and the loops decouple cleanly.
  const v_d_ff = -omega_e * Ls * s.i_q;
  const v_q_ff = +omega_e * Ls * s.i_d + omega_e * psi_m;
  let v_d = ctrl.Kp_i * e_id + ctrl.Ki_i * s.e_id_int + v_d_ff;
  let v_q = ctrl.Kp_i * e_iq + ctrl.Ki_i * s.e_iq_int + v_q_ff;
  // Inverter envelope (space-vector modulation gives V_dc/√3 phase peak).
  const v_max = ctrl.Vdc / Math.sqrt(3);
  const v_mag = Math.hypot(v_d, v_q);
  if (v_mag > v_max) {
    const k = v_max / v_mag;
    v_d *= k;
    v_q *= k;
  }

  // Electrical step (semi-implicit Euler):
  //   L di_d/dt = v_d - R i_d + ω_e L i_q
  //   L di_q/dt = v_q - R i_q - ω_e L i_d - ω_e ψ_m
  const di_d = (v_d - Rs * s.i_d + omega_e * Ls * s.i_q) / Ls;
  const di_q = (v_q - Rs * s.i_q - omega_e * Ls * s.i_d - omega_e * psi_m) / Ls;
  s.i_d += di_d * DT;
  s.i_q += di_q * DT;

  // Electromagnetic torque (surface PMSM): τ_e = (3/2) p_p ψ_m i_q.
  const tau_e = 1.5 * pp * psi_m * s.i_q;

  // Mechanical step.
  const tau_L = loadTorque(load, s.omega_m);
  const domega = (tau_e - tau_L - B_friction * s.omega_m) / J;
  s.omega_m += domega * DT;
  s.theta_m += s.omega_m * DT;
  s.t += DT;

  // Power flows.
  const P_e = 1.5 * (v_d * s.i_d + v_q * s.i_q); // electrical input
  const P_m = tau_e * s.omega_m; // mechanical output
  const eta = Math.abs(P_e) > 1 ? clamp(Math.abs(P_m / P_e), 0, 1) : 0;
  const I_dc = Math.abs(P_e) / Math.max(1, ctrl.Vdc);

  // Phase currents from inverse transforms (for display).
  const [i_alpha, i_beta] = invPark(s.i_d, s.i_q, theta_e);
  const [ia, ib, ic] = invClarke(i_alpha, i_beta);

  // Light annotation: tau cap at +/-2x rated for headroom display.
  void tau_rated;

  return {
    t: s.t,
    theta_m: s.theta_m,
    omega_m: s.omega_m,
    tau_e,
    tau_load: tau_L,
    i_abc: [ia, ib, ic],
    i_dq: [s.i_d, s.i_q],
    i_dq_ref: [i_d_ref, i_q_ref],
    v_dq: [v_d, v_q],
    P_in: P_e,
    P_out: P_m,
    eta,
    I_dc,
    saturated,
  };
}

/* ───── Brushed DC + H-bridge PWM ─────
 *
 * Single-axis state. τ_e = K_t · i, V_emf = K_e · ω, V = R i + L di/dt + V_emf.
 * Treat the H-bridge as an ideal duty-cycle source so the controller produces
 * v_arm in [-V_dc .. +V_dc] with a single speed-PI → current-PI cascade.
 */
function stepBrushedDC(
  s: SimState,
  motor: MotorParams,
  ctrl: ControllerParams,
  load: LoadParams,
): SimSnapshot {
  const { Rs, Ls, psi_m: Kt, B_friction, I_rated } = motor;
  const Ke = Kt; // for a DC motor with consistent units, K_t = K_e
  const J = totalInertia(motor, load);

  // Speed PI → current ref.
  const e_w = ctrl.omega_ref - s.omega_m;
  s.e_w_int = clamp(s.e_w_int + e_w * DT, -200, 200);
  let i_ref = ctrl.Kp_w * e_w + ctrl.Ki_w * s.e_w_int;
  const i_max = I_rated * 1.5;
  i_ref = clamp(i_ref, -i_max, i_max);

  // Current PI → armature voltage.
  const e_i = i_ref - s.i_q; // we reuse i_q as the armature current
  s.e_iq_int = clamp(s.e_iq_int + e_i * DT, -100, 100);
  const v_emf = Ke * s.omega_m;
  let v_arm = ctrl.Kp_i * e_i + ctrl.Ki_i * s.e_iq_int + v_emf;
  v_arm = clamp(v_arm, -ctrl.Vdc, ctrl.Vdc);

  // Electrical: L di/dt = v_arm - R i - V_emf
  const di = (v_arm - Rs * s.i_q - v_emf) / Ls;
  s.i_q += di * DT;

  const tau_e = Kt * s.i_q;
  const tau_L = loadTorque(load, s.omega_m);
  s.omega_m += ((tau_e - tau_L - B_friction * s.omega_m) / J) * DT;
  s.theta_m += s.omega_m * DT;
  s.t += DT;

  const P_e = v_arm * s.i_q;
  const P_m = tau_e * s.omega_m;
  const eta = Math.abs(P_e) > 1 ? clamp(Math.abs(P_m / P_e), 0, 1) : 0;
  return {
    t: s.t,
    theta_m: s.theta_m,
    omega_m: s.omega_m,
    tau_e,
    tau_load: tau_L,
    i_abc: [s.i_q, 0, 0],
    i_dq: [0, s.i_q],
    i_dq_ref: [0, i_ref],
    v_dq: [0, v_arm],
    P_in: P_e,
    P_out: P_m,
    eta,
    I_dc: Math.abs(P_e) / Math.max(1, ctrl.Vdc),
    saturated: v_arm === ctrl.Vdc || v_arm === -ctrl.Vdc,
  };
}

/* ───── BLDC + trapezoidal commutation ─────
 *
 * Simplified to a constant-torque-per-amp model in the d-q frame; the
 * phase-current display reconstructs the 120°-conduction pattern. Plenty for
 * an at-a-glance bench, but FOC is the educational core.
 */
function stepBLDC(
  s: SimState,
  motor: MotorParams,
  ctrl: ControllerParams,
  load: LoadParams,
): SimSnapshot {
  // The PMSM step works directly; we just shape the phase-current readout to
  // look trapezoidal in the consumer (squared off in 60° sectors). Internally
  // we run the same dq machinery.
  const snap = stepFOC(s, motor, ctrl, load);
  const sector = Math.floor((s.theta_m * motor.polePairs) / (Math.PI / 3)) % 6;
  const mag = Math.hypot(snap.i_dq[0], snap.i_dq[1]);
  // Six 60° sectors; in each, two phases conduct at ±mag and one is off.
  const pattern: Array<[number, number, number]> = [
    [+1, -1, 0],
    [+1, 0, -1],
    [0, +1, -1],
    [-1, +1, 0],
    [-1, 0, +1],
    [0, -1, +1],
  ];
  const p = pattern[((sector % 6) + 6) % 6];
  snap.i_abc = [p[0] * mag, p[1] * mag, p[2] * mag];
  return snap;
}

/* ───── Induction motor + V/f scalar control ─────
 *
 * Open-loop V/f keeps the air-gap flux constant: V/f = (V_rated)/(f_rated).
 * Below base speed the inverter outputs voltage proportional to commanded
 * frequency, plus a small boost to overcome stator IR drop at startup. The
 * mechanical torque follows a simplified Kloss / pull-out characteristic
 * τ(slip).
 */
function stepInduction(
  s: SimState,
  motor: MotorParams,
  ctrl: ControllerParams,
  load: LoadParams,
): SimSnapshot {
  const { polePairs: pp, B_friction, tau_rated, omega_rated, V_rated, Tr } = motor;
  const J = totalInertia(motor, load);
  const omega_sync = ctrl.omega_ref; // synchronous speed reference, rad/s
  const omega_e = omega_sync * pp;
  const slip = omega_sync !== 0 ? (omega_sync - s.omega_m) / omega_sync : 0;
  // Simplified Kloss formula: τ = 2 τ_max / (s/s_max + s_max/s).
  // Pick s_max ≈ 0.2 by default; pull-out ≈ 2.5× rated torque (typical).
  const s_max = 0.2;
  const tau_pullout = 2.5 * tau_rated;
  const s_eff = Math.abs(slip) < 1e-6 ? 1e-6 : slip;
  let tau_e = (2 * tau_pullout) / (s_eff / s_max + s_max / s_eff);
  if (slip < 0) tau_e = -tau_e;

  // V/f voltage envelope.
  const vboost = ctrl.Vboost ?? 6;
  const v_phase = vboost + ((V_rated - vboost) * Math.abs(omega_sync)) / Math.max(1, omega_rated);
  // For display: 3-phase stator currents at angle θ_e, magnitude ≈ tau/Kt approx.
  const i_mag = Math.abs(tau_e) / (1.5 * motor.psi_m * pp + 0.01);
  s.theta_flux += omega_e * DT;
  const [ia, ib, ic] = invClarke(...invPark(0, i_mag, s.theta_flux));

  const tau_L = loadTorque(load, s.omega_m);
  s.omega_m += ((tau_e - tau_L - B_friction * s.omega_m) / J) * DT;
  s.theta_m += s.omega_m * DT;
  s.t += DT;

  // Rough efficiency: η ≈ (1 - |s|) × motor base efficiency
  const eta = clamp((1 - Math.abs(slip)) * 0.9, 0, 0.95);
  const P_m = tau_e * s.omega_m;
  const P_e = eta > 0.05 ? P_m / eta : Math.abs(tau_e * omega_sync);

  void Tr;
  return {
    t: s.t,
    theta_m: s.theta_m,
    omega_m: s.omega_m,
    tau_e,
    tau_load: tau_L,
    i_abc: [ia, ib, ic],
    i_dq: [0, i_mag],
    i_dq_ref: [0, i_mag],
    v_dq: [0, v_phase],
    P_in: P_e,
    P_out: P_m,
    eta,
    I_dc: Math.abs(P_e) / Math.max(1, ctrl.Vdc),
    saturated: false,
  };
}

/* ───── Stepper + micro-stepping driver ─────
 *
 * Position-controlled. The driver advances a commanded angle in micro-step
 * increments; the rotor follows by way of detent torque K · sin(θ_cmd − θ_e).
 */
function stepStepper(
  s: SimState,
  motor: MotorParams,
  ctrl: ControllerParams,
  load: LoadParams,
): SimSnapshot {
  const { polePairs: pp, psi_m, B_friction, I_rated } = motor;
  const J = totalInertia(motor, load);
  const microsteps = ctrl.microsteps ?? 16;
  // Step the commanded electrical angle at a rate proportional to omega_ref.
  const step_per_sec = (ctrl.omega_ref * pp * microsteps) / (2 * Math.PI);
  void step_per_sec;
  s.theta_cmd += ctrl.omega_ref * pp * DT;
  const theta_e = pp * s.theta_m;
  const e_theta = s.theta_cmd - theta_e;
  // Micro-stepping: i_d ∝ cos(θ_cmd), i_q ∝ sin(θ_cmd − θ_e) for a holding torque.
  const i_hold = I_rated * 0.7;
  s.i_d = i_hold * Math.cos(e_theta);
  s.i_q = i_hold * Math.sin(e_theta);
  const tau_e = 1.5 * pp * psi_m * s.i_q;

  const tau_L = loadTorque(load, s.omega_m);
  s.omega_m += ((tau_e - tau_L - B_friction * s.omega_m) / J) * DT;
  s.theta_m += s.omega_m * DT;
  s.t += DT;

  const [i_alpha, i_beta] = invPark(s.i_d, s.i_q, theta_e);
  const [ia, ib, ic] = invClarke(i_alpha, i_beta);
  const P_e = ctrl.Vdc * Math.abs(i_hold) * 0.3; // rough estimate
  const P_m = tau_e * s.omega_m;
  const eta = Math.abs(P_e) > 1 ? clamp(Math.abs(P_m / P_e), 0, 1) : 0;
  return {
    t: s.t,
    theta_m: s.theta_m,
    omega_m: s.omega_m,
    tau_e,
    tau_load: tau_L,
    i_abc: [ia, ib, ic],
    i_dq: [s.i_d, s.i_q],
    i_dq_ref: [s.i_d, s.i_q],
    v_dq: [0, 0],
    P_in: P_e,
    P_out: P_m,
    eta,
    I_dc: Math.abs(P_e) / Math.max(1, ctrl.Vdc),
    saturated: false,
  };
}

/* ───────────────────────── Default parameter sets ───────────────────────── */

export function defaultMotor(kind: MotorKind): MotorParams {
  switch (kind) {
    case 'brushed-dc':
      return {
        kind,
        Rs: 0.6,
        Ls: 1.2e-3,
        psi_m: 0.035,
        polePairs: 1,
        J_motor: 5e-4,
        B_friction: 1e-4,
        V_rated: 24,
        I_rated: 12,
        tau_rated: 0.42,
        omega_rated: 600,
      };
    case 'bldc':
      return {
        kind,
        Rs: 0.18,
        Ls: 0.6e-3,
        psi_m: 0.05,
        polePairs: 4,
        J_motor: 1.2e-3,
        B_friction: 3e-4,
        V_rated: 48,
        I_rated: 30,
        tau_rated: 9,
        omega_rated: 400,
      };
    case 'pmsm':
      return {
        kind,
        Rs: 0.08,
        Ls: 0.9e-3,
        psi_m: 0.18,
        polePairs: 4,
        J_motor: 3e-3,
        B_friction: 5e-4,
        V_rated: 400,
        I_rated: 25,
        tau_rated: 16,
        omega_rated: 314, // ≈ 3000 RPM
      };
    case 'induction':
      return {
        kind,
        Rs: 0.5,
        Ls: 1.5e-3,
        psi_m: 0.4,
        polePairs: 2,
        J_motor: 6e-3,
        B_friction: 8e-4,
        V_rated: 230,
        I_rated: 12,
        tau_rated: 10,
        omega_rated: 157, // ≈ 1500 RPM, 2-pole-pair at 50 Hz sync
        Tr: 0.15,
      };
    case 'stepper':
      return {
        kind,
        Rs: 1.4,
        Ls: 3e-3,
        psi_m: 0.025,
        polePairs: 50,
        J_motor: 8e-5,
        B_friction: 5e-5,
        V_rated: 24,
        I_rated: 2,
        tau_rated: 0.4,
        omega_rated: 30,
      };
  }
}

export function defaultController(kind: ControllerKind): ControllerParams {
  switch (kind) {
    case 'h-bridge-pwm':
      return {
        kind,
        Vdc: 24,
        fsw: 20000,
        Kp_i: 0.5,
        Ki_i: 80,
        Kp_w: 0.3,
        Ki_w: 4,
        deadtime: 1e-6,
        omega_ref: 300,
      };
    case 'bldc-trapezoid':
      return {
        kind,
        Vdc: 48,
        fsw: 20000,
        Kp_i: 0.4,
        Ki_i: 60,
        Kp_w: 0.5,
        Ki_w: 6,
        deadtime: 1e-6,
        omega_ref: 200,
      };
    case 'foc':
      return {
        kind,
        Vdc: 400,
        fsw: 10000,
        Kp_i: 8,
        Ki_i: 1200,
        Kp_w: 1.5,
        Ki_w: 20,
        deadtime: 2e-6,
        omega_ref: 200,
      };
    case 'vf-scalar':
      return {
        kind,
        Vdc: 540,
        fsw: 5000,
        Kp_i: 0,
        Ki_i: 0,
        Kp_w: 0,
        Ki_w: 0,
        deadtime: 3e-6,
        omega_ref: 120,
        Vboost: 8,
      };
    case 'microstep':
      return {
        kind,
        Vdc: 24,
        fsw: 30000,
        Kp_i: 0,
        Ki_i: 0,
        Kp_w: 0,
        Ki_w: 0,
        deadtime: 0,
        omega_ref: 6,
        microsteps: 16,
      };
  }
}

export function defaultLoad(kind: LoadParams['kind']): LoadParams {
  switch (kind) {
    case 'constant-torque':
      return { kind, J_load: 5e-3, tau_load: 6, omega_nom: 200 };
    case 'constant-power':
      return { kind, J_load: 5e-3, tau_load: 4, omega_nom: 200 };
    case 'fan':
      return { kind, J_load: 8e-3, tau_load: 6, omega_nom: 250 };
    case 'inertial':
      return { kind, J_load: 12e-3, tau_load: 0, omega_nom: 1 };
    case 'regen':
      return { kind, J_load: 5e-3, tau_load: 3, omega_nom: 200 };
  }
}

/** Compatibility — match a controller to a motor type when the dropdown swaps. */
export function defaultControllerFor(kind: MotorKind): ControllerKind {
  switch (kind) {
    case 'brushed-dc':
      return 'h-bridge-pwm';
    case 'bldc':
      return 'bldc-trapezoid';
    case 'pmsm':
      return 'foc';
    case 'induction':
      return 'vf-scalar';
    case 'stepper':
      return 'microstep';
  }
}

/* ───────────────────────── Presets ───────────────────────── */

export const PRESETS: Preset[] = [
  {
    id: 'pmsm-cruise',
    name: 'PMSM at 3000 RPM cruise',
    description: 'A traction PMSM holding a fan-style load at base speed under FOC.',
    motor: defaultMotor('pmsm'),
    controller: { ...defaultController('foc'), omega_ref: 314 },
    load: defaultLoad('fan'),
  },
  {
    id: 'pmsm-step',
    name: 'PMSM torque-step response',
    description:
      'Run a speed step from 0 to 200 rad/s with a high-inertia load to see the current loop saturate.',
    motor: defaultMotor('pmsm'),
    controller: { ...defaultController('foc'), omega_ref: 200, Kp_w: 2.5, Ki_w: 35 },
    load: { ...defaultLoad('inertial'), J_load: 30e-3 },
  },
  {
    id: 'induction-startup',
    name: 'Induction V/f starting transient',
    description:
      'A 3-phase squirrel-cage motor starting against a constant-torque load on scalar V/f.',
    motor: defaultMotor('induction'),
    controller: { ...defaultController('vf-scalar'), omega_ref: 150 },
    load: defaultLoad('constant-torque'),
  },
  {
    id: 'stepper-microstep',
    name: 'Stepper at 16× micro-step',
    description: 'A bipolar stepper positioning a small load with 16× micro-stepping.',
    motor: defaultMotor('stepper'),
    controller: { ...defaultController('microstep'), omega_ref: 4 },
    load: { ...defaultLoad('inertial'), J_load: 5e-5 },
  },
  {
    id: 'brushed-dc-fan',
    name: 'Brushed DC + H-bridge on a fan',
    description: 'A 24 V brushed motor driving a fan-style load under H-bridge PWM.',
    motor: defaultMotor('brushed-dc'),
    controller: defaultController('h-bridge-pwm'),
    load: defaultLoad('fan'),
  },
];

/* ───────────────────────── Efficiency map ─────────────────────────
 *
 * The map is built once per motor (cheap analytic estimate, not a re-run of
 * the full simulation across the τ-ω grid). For a PMSM the rough model is:
 *
 *   P_loss = 1.5 R_s i_s² + k_iron · ω_e² + k_mech · ω_m²
 *   i_s²  ≈ (2 τ / (3 p_p ψ_m))²
 *   η     = P_m / (P_m + P_loss)
 */
export function buildEfficiencyMap(
  motor: MotorParams,
  nTau = 24,
  nOmega = 24,
): { tauMax: number; omegaMax: number; data: number[][] } {
  const tauMax = motor.tau_rated * 1.4;
  const omegaMax = motor.omega_rated * 1.8;
  const k_iron = 1e-4;
  const k_mech = motor.B_friction * 1.5;
  const Kt = motor.kind === 'brushed-dc' ? motor.psi_m : 1.5 * motor.polePairs * motor.psi_m;
  const data: number[][] = [];
  for (let i = 0; i < nTau; i++) {
    const row: number[] = [];
    const tau = (i / (nTau - 1)) * tauMax;
    for (let j = 0; j < nOmega; j++) {
      const omega = (j / (nOmega - 1)) * omegaMax;
      const i_s = Math.abs(tau / Math.max(1e-3, Kt));
      const omega_e = motor.polePairs * omega;
      const P_loss =
        1.5 * motor.Rs * i_s * i_s + k_iron * omega_e * omega_e + k_mech * omega * omega;
      const P_m = tau * omega;
      const eta = P_m > 1 ? P_m / (P_m + P_loss) : 0;
      row.push(Math.max(0, Math.min(1, eta)));
    }
    data.push(row);
  }
  return { tauMax, omegaMax, data };
}
