/**
 * EV Bench — types
 *
 * The bench is organised around three configuration blocks (pack, drivetrain,
 * vehicle) plus a drive-cycle picker and an optional charger. The simulation
 * loop reads a flat `BenchConfig` and produces a streaming `BenchTelemetry`
 * sample each logical 0.1 s step.
 */

export type Chemistry = 'NMC' | 'LFP' | 'NCA' | 'LTO';

export type CellFormat = '21700' | '4680' | 'pouch';

export interface CellSpec {
  /** Display name */
  label: string;
  /** Nominal cell voltage, V */
  vNom: number;
  /** Empty-cell voltage (0% SOC), V */
  vEmpty: number;
  /** Full-cell voltage (100% SOC), V */
  vFull: number;
  /** Capacity per cell, A·h */
  capacityAh: number;
  /** Internal resistance per cell, Ω */
  rInt: number;
  /** Cell mass, kg (for thermal calcs) */
  massKg: number;
  /** Specific heat capacity of the cell, J/(kg·K) */
  cp: number;
  /** Maximum continuous discharge C-rate */
  maxDischargeC: number;
  /** Maximum continuous charge C-rate (above 20% / below 80% SOC) */
  maxChargeC: number;
  /** Calendar-life shape parameter (years to 80% SoH at 25 °C) */
  calendarYears: number;
  /** Cycle-life shape parameter (cycles to 80% SoH at 100% DoD, 25 °C) */
  cycleLife: number;
}

export interface PackConfig {
  chemistry: Chemistry;
  format: CellFormat;
  /** Cells in series */
  series: number;
  /** Parallel strings */
  parallel: number;
}

export type MotorKind = 'PMSM' | 'INDUCTION';

export interface DrivetrainConfig {
  motor: MotorKind;
  /** Peak motor torque, N·m */
  peakTorqueNm: number;
  /** Peak motor power, kW */
  peakPowerKW: number;
  /** Inverter switching frequency, kHz */
  switchKHz: number;
  /** Inverter peak efficiency, fraction (0–1) */
  inverterEtaPeak: number;
  /** DC-DC (12 V auxiliary) continuous power rating, W */
  auxDcDcW: number;
  /** OBC AC input — single phase 240 V or three phase 400 V */
  obcInput: '240V-1ph' | '400V-3ph';
  /** Peak OBC AC charging power, kW */
  obcPeakKW: number;
  /** DC fast coupler — null if absent */
  dcCoupler: 'CCS' | 'NACS' | null;
  /** Single-speed gearbox ratio (motor : wheel) */
  gearbox: number;
}

export type DriveCycleId = 'UDDS' | 'HWFET' | 'WLTC' | 'CONST_100' | 'GRADE_5' | 'HARD_ACCEL';

export interface VehicleConfig {
  massKg: number;
  /** CdA = drag coefficient × frontal area, m² */
  CdA: number;
  /** Rolling resistance coefficient (dimensionless) */
  Crr: number;
  /** Wheel radius, m */
  wheelRadius: number;
  cycle: DriveCycleId;
}

export type ChargerKind = 'NONE' | 'L1' | 'L2' | 'DCFC';

export interface BenchConfig {
  pack: PackConfig;
  drive: DrivetrainConfig;
  vehicle: VehicleConfig;
  charger: ChargerKind;
}

export interface BenchSample {
  /** Sim time, s */
  t: number;
  /** Vehicle speed, km/h */
  vKph: number;
  /** Wheel torque demand, N·m */
  wheelTorqueNm: number;
  /** Motor shaft torque, N·m */
  motorTorqueNm: number;
  /** Motor shaft speed, rad/s */
  omega: number;
  /** Battery terminal voltage, V */
  vPack: number;
  /** Battery current (positive = discharge), A */
  iPack: number;
  /** Instantaneous tractive / charging power, kW (positive = drive) */
  pKW: number;
  /** State of charge, 0..1 */
  soc: number;
  /** Pack temperature, °C */
  packTempC: number;
  /** Distance travelled this run, m */
  distanceM: number;
  /** Energy out of pack this run, J (negative if charging) */
  energyJ: number;
  /** Operating mode flag */
  mode: 'DRIVE' | 'COAST' | 'BRAKE' | 'IDLE' | 'CHARGE_CC' | 'CHARGE_CV' | 'CHARGE_DONE';
}

export interface BenchRunStats {
  /** Distance covered, km */
  distanceKm: number;
  /** Energy used out of pack, kWh */
  energyKWh: number;
  /** Average consumption, Wh/km */
  whPerKm: number;
  /** Predicted remaining range at current consumption, km */
  remainingRangeKm: number;
  /** Equivalent gasoline economy, MPGe */
  mpge: number;
  /** Peak charging power seen, kW */
  peakChargeKW: number;
  /** Wall-clock charging time, s (CC + CV) */
  chargeElapsedS: number;
  /** Estimated time-to-80%, s (NaN if not currently charging) */
  timeTo80S: number;
  /** Estimated time-to-100%, s */
  timeTo100S: number;
  /** Charging energy efficiency = E_pack / E_wall */
  chargeEfficiency: number;
}
