/**
 * Standard number formatters for electrical-engineering quantities.
 *
 * These replace the ad-hoc `formatR`, `formatHz`, etc. helpers duplicated
 * across individual demo files.
 */

/** SI prefixes from femto to tera. */
const SI_PREFIXES = [
  { limit: 1e-12, symbol: 'p', scale: 1e12 },
  { limit: 1e-9, symbol: 'n', scale: 1e9 },
  { limit: 1e-6, symbol: 'µ', scale: 1e6 },
  { limit: 1e-3, symbol: 'm', scale: 1e3 },
  { limit: 1, symbol: '', scale: 1 },
  { limit: 1e3, symbol: 'k', scale: 1e-3 },
  { limit: 1e6, symbol: 'M', scale: 1e-6 },
  { limit: 1e9, symbol: 'G', scale: 1e-9 },
  { limit: 1e12, symbol: 'T', scale: 1e-12 },
];

function pickPrefix(value: number) {
  const abs = Math.abs(value);
  for (let i = SI_PREFIXES.length - 1; i >= 0; i--) {
    if (abs >= SI_PREFIXES[i]!.limit) return SI_PREFIXES[i]!;
  }
  return SI_PREFIXES[4]!; // fallback to base
}

function fmt(value: number, unit: string, digits = 2): string {
  if (!Number.isFinite(value)) return `— ${unit}`;
  const prefix = pickPrefix(value);
  const scaled = value * prefix.scale;
  // Use fewer decimals for large integers, more for small fractions
  const str =
    Math.abs(scaled) >= 100
      ? scaled.toFixed(0)
      : Math.abs(scaled) >= 10
        ? scaled.toFixed(1)
        : scaled.toFixed(digits);
  return `${str} ${prefix.symbol}${unit}`;
}

/** Resistance in ohms. */
export function fmtResistance(R: number, digits?: number): string {
  return fmt(R, 'Ω', digits);
}

/** Voltage in volts. */
export function fmtVoltage(v: number, digits?: number): string {
  return fmt(v, 'V', digits);
}

/** Current in amperes. */
export function fmtCurrent(I: number, digits?: number): string {
  return fmt(I, 'A', digits);
}

/** Frequency in hertz. */
export function fmtFrequency(f: number, digits?: number): string {
  return fmt(f, 'Hz', digits);
}

/** Capacitance in farads. */
export function fmtCapacitance(C: number, digits?: number): string {
  return fmt(C, 'F', digits);
}

/** Inductance in henries. */
export function fmtInductance(L: number, digits?: number): string {
  return fmt(L, 'H', digits);
}

/** Power in watts. */
export function fmtPower(P: number, digits?: number): string {
  return fmt(P, 'W', digits);
}

/** Energy in joules. */
export function fmtEnergy(E: number, digits?: number): string {
  return fmt(E, 'J', digits);
}

/** Generic formatter when you just need a value + unit. */
export function fmtSI(value: number, unit: string, digits?: number): string {
  return fmt(value, unit, digits);
}

/** Compact percentage (0–100). */
export function fmtPercent(p: number, digits = 1): string {
  return `${p.toFixed(digits)}%`;
}

/** Time in seconds — switches to ms / µs for small values. */
export function fmtTime(t: number, digits?: number): string {
  return fmt(t, 's', digits);
}
