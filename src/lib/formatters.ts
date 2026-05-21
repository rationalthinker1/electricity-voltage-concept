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

/**
 * Generic SI formatter that rounds with `toPrecision` instead of `toFixed`.
 * Use this when the caller wants N significant figures regardless of
 * magnitude (component value pickers, datasheet-style labels). The
 * default-`fmt` version uses decimal-place rounding which gives prettier
 * round numbers but variable significant figures.
 *
 *   fmtSIPrecision(0.001, 'F', 3)   → "1.00 mF"
 *   fmtSIPrecision(1500, 'Ω', 3)    → "1.50 kΩ"
 *   fmtSIPrecision(1e-9, 'H', 3)    → "1.00 nH"
 */
export function fmtSIPrecision(value: number, unit: string, precision = 3): string {
  if (!Number.isFinite(value)) return `— ${unit}`;
  const prefix = pickPrefix(value);
  const scaled = value * prefix.scale;
  return `${scaled.toPrecision(precision)} ${prefix.symbol}${unit}`;
}

/** Compact percentage (0–100). */
export function fmtPercent(p: number, digits = 1): string {
  return `${p.toFixed(digits)}%`;
}

/** Time in seconds — switches to ms / µs for small values. */
export function fmtTime(t: number, digits?: number): string {
  return fmt(t, 's', digits);
}

/**
 * Short axis-label form for frequency: "1.5k" / "1.5M" / "1.5G" — no Hz.
 * Use this on canvas tick labels where space is tight; reach for
 * fmtFrequency() when the unit needs to be visible (prose / readouts).
 */
export function fmtFreqShort(f: number): string {
  if (!Number.isFinite(f) || f <= 0) return '—';
  if (f >= 1e9) return (f / 1e9).toFixed(0) + 'G';
  if (f >= 1e6) return (f / 1e6).toFixed(0) + 'M';
  if (f >= 1e3) return (f / 1e3).toFixed(0) + 'k';
  if (f >= 1) return f.toFixed(0);
  return f.toFixed(2);
}

/** Resistivity in Ω·m (always shown in exponential form). */
export function fmtResistivity(rho: number, digits = 2): string {
  if (!Number.isFinite(rho)) return '—';
  return rho.toExponential(digits) + ' Ω·m';
}

/**
 * Bare dimensionless ratio with adaptive precision.
 * Useful for things like R(T)/R(T₀) plots where the y-axis is a pure number.
 */
export function fmtRatio(r: number, digits = 2): string {
  if (!Number.isFinite(r)) return '—';
  if (Math.abs(r) >= 100) return r.toExponential(digits);
  if (Math.abs(r) >= 10) return r.toFixed(1);
  if (Math.abs(r) >= 0.1) return r.toFixed(digits);
  return r.toExponential(digits);
}

/**
 * Tolerance as a percentage. Input is a fraction (0.05 → "5%"), with
 * tighter tolerances getting one or two decimals.
 */
export function fmtTolerance(t: number): string {
  return (t * 100).toFixed(t < 0.01 ? 2 : t < 0.05 ? 1 : 0) + '%';
}

/** Decibels with explicit sign (so 0 dB renders as "+0.0 dB"). */
export function fmtDb(v: number, digits = 1): string {
  return `${v >= 0 ? '+' : ''}${v.toFixed(digits)} dB`;
}

/**
 * Wall-clock-style elapsed time: "30 s" / "5m 30s" / "2h 30m".
 * Different from fmtTime(), which uses SI prefixes (ms / µs / ns) and is
 * meant for sub-second physical times. Use this one for things like battery
 * runtime, charge duration, or other human-scale intervals.
 */
export function fmtClockTime(s: number): string {
  if (!Number.isFinite(s) || s < 0) return '—';
  if (s < 60) return `${s.toFixed(0)} s`;
  const m = Math.floor(s / 60);
  const sec = Math.round(s - m * 60);
  if (m < 60) return `${m}m ${sec}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${m - h * 60}m`;
}

/** Plain toFixed wrapper that returns "—" for non-finite values. */
export function fmtFloat(n: number, dp = 1): string {
  if (!Number.isFinite(n)) return '—';
  return n.toFixed(dp);
}
