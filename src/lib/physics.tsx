/**
 * Physical constants and material parameters.
 *
 * All values are SI. Constants come from CODATA 2018 / 2022 recommended values
 * via NIST; cite NIST_CODATA in any page that prints these numbers.
 * Material conductivities and electron densities follow CRC Handbook of
 * Chemistry & Physics (104th ed.) and Ashcroft & Mermin §1.1 for n.
 */

import type { ReactNode } from 'react';

export const PHYS = {
  /** Elementary charge, C. NIST CODATA exact since 2019 SI redefinition. */
  e: 1.602176634e-19,
  /** Coulomb constant, N·m²/C². 1/(4π ε₀). */
  // eslint-disable-next-line no-loss-of-precision
  k: 8.9875517873681764e9,
  /** Permeability of free space, T·m/A. Now a measured quantity post-2019;
   *  4π × 1e-7 is accurate to ~2e-10. */
  mu_0: 1.25663706212e-6,
  /** Permittivity of free space, F/m. ε₀ = 1/(μ₀ c²). */
  eps_0: 8.8541878128e-12,
  /** Speed of light in vacuum, m/s. Exact since 1983 SI redefinition. */
  c: 299792458,
  /** Electron rest mass, kg. CODATA 2018. */
  me: 9.1093837015e-31,
  /** Proton rest mass, kg. CODATA 2018. */
  mp: 1.67262192369e-27,
  /** Gravitational constant, N·m²/kg². CODATA 2018; ~2e-5 relative uncertainty. */
  G: 6.67430e-11,
  /** Stefan–Boltzmann constant, W/(m²·K⁴). Exact in new SI. */
  sigma_SB: 5.670374419e-8,
  /** Boltzmann constant, J/K. Exact in new SI. */
  k_B: 1.380649e-23,
} as const;

export interface Material {
  /** Display name */
  name: string;
  /** Conductivity σ at 20 °C, S/m */
  sigma: number;
  /** Free-electron density n, m⁻³ */
  n: number;
  /** Source ID (sources.ts key) — used for the per-page Sources section. */
  src: string;
}

/**
 * Conductivities: CRC Handbook of Chemistry & Physics, 104th ed. (2023),
 * Table "Electrical Resistivity of Pure Metals" at 20 °C.
 * Free-electron densities n: Ashcroft & Mermin, "Solid State Physics" (1976),
 * Table 1.1 — one conduction electron per atom assumed for monovalent metals.
 * Nichrome σ ≈ 9.09×10⁵ S/m from manufacturer datasheets (Kanthal A1 / Nichrome 80).
 */
export const MATERIALS: Record<string, Material> = {
  copper:   { name: 'Copper',                sigma: 5.96e7, n: 8.50e28, src: 'crc-resistivity' },
  silver:   { name: 'Silver',                sigma: 6.30e7, n: 5.86e28, src: 'crc-resistivity' },
  gold:     { name: 'Gold',                  sigma: 4.10e7, n: 5.90e28, src: 'crc-resistivity' },
  aluminum: { name: 'Aluminum',              sigma: 3.77e7, n: 6.00e28, src: 'crc-resistivity' },
  iron:     { name: 'Iron',                  sigma: 1.00e7, n: 1.70e29, src: 'crc-resistivity' },
  tungsten: { name: 'Tungsten (filament)',   sigma: 1.79e7, n: 6.30e28, src: 'crc-resistivity' },
  nichrome: { name: 'Nichrome (heater)',     sigma: 9.09e5, n: 9.00e28, src: 'kanthal' },
};

export type MaterialKey = keyof typeof MATERIALS;

/* ─── Formatters ─── */

/** Scientific notation, HTML string version. Use for canvas / plaintext only;
 *  for JSX prefer sciJsx(). The <sup> tag carries inline classes so consumers
 *  using dangerouslySetInnerHTML don't need a [&_sup]:… variant. */
export function sci(n: number, digits = 2): string {
  if (n === 0 || !isFinite(n)) return '0';
  const abs = Math.abs(n);
  if (abs >= 1e-2 && abs < 1e4) return n.toFixed(digits);
  const exp = Math.floor(Math.log10(abs));
  const mantissa = n / Math.pow(10, exp);
  return `${mantissa.toFixed(digits)}×10<sup class="text-[.7em] leading-none font-3 align-[.45em]">${exp}</sup>`;
}

/** Scientific notation, JSX version. Returns a fragment that renders as
 *  proper React JSX (no dangerouslySetInnerHTML required). */
export function sciJsx(n: number, digits = 2): ReactNode {
  if (n === 0 || !isFinite(n)) return '0';
  const abs = Math.abs(n);
  if (abs >= 1e-2 && abs < 1e4) return n.toFixed(digits);
  const exp = Math.floor(Math.log10(abs));
  const mantissa = n / Math.pow(10, exp);
  return (
    <>
      {mantissa.toFixed(digits)}×10
      <sup className="text-[.7em] leading-none font-3 align-[.45em]">{exp}</sup>
    </>
  );
}

/** Engineering notation with SI prefix. */
export function eng(n: number, digits = 3, unit = ''): string {
  if (n === 0 || !isFinite(n)) return `0${unit ? ' ' + unit : ''}`;
  const prefixes: Array<{ exp: number; sym: string }> = [
    { exp: -12, sym: 'p' }, { exp: -9, sym: 'n' }, { exp: -6, sym: 'µ' },
    { exp: -3, sym: 'm' },  { exp: 0,  sym: ''  }, { exp: 3,  sym: 'k' },
    { exp: 6,  sym: 'M' },  { exp: 9,  sym: 'G' }, { exp: 12, sym: 'T' },
  ];
  const log = Math.log10(Math.abs(n));
  let chosen = prefixes[4];
  for (let i = prefixes.length - 1; i >= 0; i--) {
    if (log >= prefixes[i].exp) { chosen = prefixes[i]; break; }
  }
  const val = n / Math.pow(10, chosen.exp);
  return `${val.toFixed(digits)} ${chosen.sym}${unit}`;
}

/** Auto-pick: fixed for normal ranges, scientific otherwise. Returns HTML. */
export function pretty(n: number, digits = 3): string {
  if (!isFinite(n)) return '—';
  const abs = Math.abs(n);
  if (abs === 0) return '0';
  if (abs >= 1e-3 && abs < 1e6) return n.toFixed(digits);
  return sci(n, digits);
}

/** JSX twin of pretty(). Use in `<Readout value={prettyJsx(x)} … />` etc. */
export function prettyJsx(n: number, digits = 3): ReactNode {
  if (!isFinite(n)) return '—';
  const abs = Math.abs(n);
  if (abs === 0) return '0';
  if (abs >= 1e-3 && abs < 1e6) return n.toFixed(digits);
  return sciJsx(n, digits);
}

/** JSX twin of eng(). Identical output to eng() — no <sup>/<sub> ever
 *  emitted, so this is just a plain string returned as a fragment. */
export function engJsx(n: number, digits = 3, unit = ''): ReactNode {
  return eng(n, digits, unit);
}

/** Format duration in seconds intelligently. */
export function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds <= 0) return '—';
  if (seconds < 60) return seconds.toFixed(1) + ' s';
  if (seconds < 3600) return (seconds / 60).toFixed(1) + ' min';
  if (seconds < 86400) return (seconds / 3600).toFixed(1) + ' hr';
  if (seconds < 86400 * 365) return (seconds / 86400).toFixed(1) + ' days';
  return (seconds / 86400 / 365).toFixed(1) + ' yr';
}
