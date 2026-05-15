/**
 * FORMULAS — registry of canonical named equations.
 *
 * Same pattern as CHAPTERS: a single source of truth keyed by stable id.
 * Each entry carries the LaTeX form, a plain-string fallback (used as
 * aria-label and for screen-reader / copy-paste accessibility), an optional
 * human name ("Coulomb's law"), and an optional source key from sources.ts.
 *
 * Use it via:
 *   <Formula id="coulomb-force" />            // block, looks up tex + plain
 *   <InlineMath id="coulomb-force" />         // inline, same lookup
 *   <Formula tex="..." />                     // one-off (worked problems)
 *   <InlineMath tex="..." />                  // one-off inline
 *
 * Worked-problem formulas (single substitutions inside TryIt answers) stay
 * inline as `tex`. The registry is for equations that appear by name across
 * the book — Maxwell's four, Coulomb, Ohm, Faraday, Poynting, etc.
 */
import type { SourceKey } from './sources';

export interface FormulaDef {
  /** Canonical KaTeX-compatible LaTeX source. */
  tex: string;
  /** Plain-text Unicode form for aria-label and copy-paste. */
  plain: string;
  /** Optional human name, e.g. "Coulomb's law". */
  name?: string;
  /** Optional source key — must exist in src/lib/sources.ts. */
  source?: SourceKey;
}

export const FORMULAS = {
  /* ---------- Chapter 1: Charge and field ---------- */
  'coulomb-force': {
    tex: 'F = k\\, \\dfrac{Q_1 Q_2}{r^2}',
    plain: 'F = k Q₁Q₂/r²',
    name: "Coulomb's law (force between two point charges)",
    source: 'coulomb-1785',
  },
  'electric-field-def': {
    tex: '\\vec{E} = \\dfrac{\\vec{F}}{q_{\\text{test}}}',
    plain: 'E = F / q_test',
    name: 'Electric field — definition',
  },
  'electric-field-point': {
    tex: '|\\vec{E}| = \\dfrac{k\\, Q}{r^2}',
    plain: '|E| = kQ/r²',
    name: 'Electric field of a point charge',
  },
  'force-on-charge': {
    tex: '\\vec{F} = q\\vec{E}',
    plain: 'F = qE',
    name: 'Force on a charge in a field',
  },
  'potential-point-charge': {
    tex: 'V(r) = \\dfrac{k\\, Q}{r}',
    plain: 'V = kQ/r',
    name: 'Potential of a point charge (V → 0 at ∞)',
  },
  'gauss-law': {
    tex: '\\oint \\vec{E}\\cdot d\\vec{A} = \\dfrac{Q_{\\text{enc}}}{\\varepsilon_0}',
    plain: '∮ E·dA = Q_enc/ε₀',
    name: "Gauss's law",
    source: 'gauss-1813',
  },
  'field-energy-density': {
    tex: 'u = \\tfrac{1}{2}\\, \\varepsilon_0\\, |\\vec{E}|^2',
    plain: 'u = ½ ε₀ |E|²',
    name: 'Energy density of an electrostatic field',
  },
  'coulomb-constant': {
    tex: 'k = \\dfrac{1}{4\\pi\\varepsilon_0} \\approx 8.99\\times 10^{9}\\ \\text{N·m}^2/\\text{C}^2',
    plain: 'k = 1/(4πε₀) ≈ 8.99×10⁹ N·m²/C²',
    name: "Coulomb's constant in SI",
    source: 'codata-2018',
  },
  'elementary-charge': {
    tex: 'e = 1.602176634\\times 10^{-19}\\ \\text{C}',
    plain: 'e = 1.602176634×10⁻¹⁹ C',
    name: 'Elementary charge (exact, 2019 SI)',
    source: 'codata-2018',
  },

  /* ---------- Chapter 2: Voltage and current ---------- */
  'voltage-line-integral': {
    tex: 'V_{ab} = -\\int_a^b \\vec{E}\\cdot d\\vec{\\ell}',
    plain: 'V_ab = −∫_a^b E·dℓ',
    name: 'Voltage as line integral of E',
  },
  'voltage-energy-per-charge': {
    tex: 'V = \\dfrac{W}{q}',
    plain: 'V = W/q',
    name: 'Voltage = work per unit charge',
  },
  'voltage-uniform-field': {
    tex: 'V = E\\, d',
    plain: 'V = E·d',
    name: 'Voltage in a uniform field',
  },
  'work-charge-voltage': {
    tex: 'W = qV',
    plain: 'W = qV',
    name: 'Work to move a charge through V',
  },
  'current-def': {
    tex: 'I = \\dfrac{dQ}{dt}',
    plain: 'I = dQ/dt',
    name: 'Current — definition',
  },
  'current-microscopic': {
    tex: 'I = n\\, q\\, v_d\\, A',
    plain: 'I = n q v_d A',
    name: 'Current from carrier density',
  },
  'power-vi': {
    tex: 'P = VI',
    plain: 'P = VI',
    name: 'Electrical power',
  },

  /* ---------- Chapter 3: Resistance and power ---------- */
  'ohms-law': {
    tex: 'V = IR',
    plain: 'V = IR',
    name: "Ohm's law",
  },
  'power-i2r': {
    tex: 'P = I^2 R',
    plain: 'P = I²R',
    name: 'Power dissipated in a resistor (current form)',
  },
  'power-v2r': {
    tex: 'P = \\dfrac{V^2}{R}',
    plain: 'P = V²/R',
    name: 'Power dissipated in a resistor (voltage form)',
  },
  'resistance-resistivity': {
    tex: 'R = \\rho\\, \\dfrac{L}{A}',
    plain: 'R = ρL/A',
    name: 'Resistance from resistivity and geometry',
  },

  /* ---------- Chapter 5: Capacitors ---------- */
  'capacitance-def': {
    tex: 'C = \\dfrac{Q}{V}',
    plain: 'C = Q/V',
    name: 'Capacitance — definition',
  },
  'capacitance-parallel-plate': {
    tex: 'C = \\dfrac{\\varepsilon_0\\, \\varepsilon_r\\, A}{d}',
    plain: 'C = ε₀ε_r A/d',
    name: 'Parallel-plate capacitance',
  },
  'capacitor-energy': {
    tex: 'U = \\tfrac{1}{2}\\, C V^2',
    plain: 'U = ½CV²',
    name: 'Energy stored in a capacitor',
  },
  'rc-time-constant': {
    tex: '\\tau = RC',
    plain: 'τ = RC',
    name: 'RC time constant',
  },

  /* ---------- Chapter 6: Magnetism ---------- */
  'lorentz-force': {
    tex: '\\vec{F} = q\\vec{v}\\times\\vec{B}',
    plain: 'F = qv × B',
    name: 'Lorentz (magnetic) force on a moving charge',
  },
  'force-on-wire': {
    tex: '\\vec{F} = I\\vec{L}\\times\\vec{B}',
    plain: 'F = IL × B',
    name: 'Magnetic force on a current-carrying wire',
  },
  'b-around-wire': {
    tex: '|\\vec{B}| = \\dfrac{\\mu_0\\, I}{2\\pi r}',
    plain: '|B| = µ₀I/(2πr)',
    name: 'Magnetic field around a long straight wire',
  },
  'b-solenoid': {
    tex: 'B = \\mu_0\\, n\\, I',
    plain: 'B = µ₀nI',
    name: 'Magnetic field inside a long solenoid',
  },

  /* ---------- Chapter 7: Induction ---------- */
  'faraday-law': {
    tex: '\\varepsilon = -\\dfrac{d\\Phi_B}{dt}',
    plain: 'ε = −dΦ/dt',
    name: "Faraday's law of induction",
    source: 'faraday-1832',
  },
  'motional-emf': {
    tex: '\\varepsilon = B L v',
    plain: 'ε = BLv',
    name: 'Motional EMF',
  },
  'inductor-energy': {
    tex: 'U = \\tfrac{1}{2}\\, L I^2',
    plain: 'U = ½LI²',
    name: 'Energy stored in an inductor',
  },
  'inductance-solenoid': {
    tex: 'L = \\dfrac{\\mu_0\\, N^2\\, A}{\\ell}',
    plain: 'L = µ₀N²A/ℓ',
    name: 'Inductance of a long solenoid',
  },

  /* ---------- Chapter 8: Energy flow / Poynting ---------- */
  'poynting-vector': {
    tex: '\\vec{S} = \\dfrac{1}{\\mu_0}\\, \\vec{E}\\times\\vec{B}',
    plain: 'S = (1/µ₀) E × B',
    name: 'Poynting vector',
    source: 'poynting-1884',
  },

  /* ---------- Chapter 9-10: EM waves and Maxwell's synthesis ---------- */
  'speed-of-light': {
    tex: 'c = \\dfrac{1}{\\sqrt{\\mu_0\\, \\varepsilon_0}}',
    plain: 'c = 1/√(µ₀ε₀)',
    name: 'Speed of light from Maxwell',
  },
  'wave-c-lambda-f': {
    tex: 'c = \\lambda\\, f',
    plain: 'c = λf',
    name: 'Wavelength–frequency relation',
  },
  'maxwell-gauss-e': {
    tex: '\\nabla\\cdot\\vec{E} = \\dfrac{\\rho}{\\varepsilon_0}',
    plain: '∇·E = ρ/ε₀',
    name: "Gauss's law (differential)",
  },
  'maxwell-gauss-b': {
    tex: '\\nabla\\cdot\\vec{B} = 0',
    plain: '∇·B = 0',
    name: "Gauss's law for magnetism",
  },
  'maxwell-faraday': {
    tex: '\\nabla\\times\\vec{E} = -\\dfrac{\\partial \\vec{B}}{\\partial t}',
    plain: '∇×E = −∂B/∂t',
    name: "Faraday's law (differential)",
  },
  'maxwell-ampere': {
    tex: '\\nabla\\times\\vec{B} = \\mu_0\\vec{J} + \\mu_0\\varepsilon_0\\dfrac{\\partial \\vec{E}}{\\partial t}',
    plain: '∇×B = µ₀J + µ₀ε₀ ∂E/∂t',
    name: 'Ampère–Maxwell law',
    source: 'maxwell-1865',
  },

  /* ---------- Chapter 11: Relativity ---------- */
  'lorentz-factor': {
    tex: '\\gamma = \\dfrac{1}{\\sqrt{1 - v^2/c^2}}',
    plain: 'γ = 1/√(1−v²/c²)',
    name: 'Lorentz factor',
  },

  /* ---------- Chapter 12: AC circuits ---------- */
  'reactance-inductor': {
    tex: 'X_L = \\omega L',
    plain: 'X_L = ωL',
    name: 'Inductive reactance',
  },
  'reactance-capacitor': {
    tex: 'X_C = \\dfrac{1}{\\omega C}',
    plain: 'X_C = 1/(ωC)',
    name: 'Capacitive reactance',
  },
  'impedance-complex': {
    tex: 'Z = R + jX',
    plain: 'Z = R + jX',
    name: 'Complex impedance',
  },

  /* ---------- Chapter 18: Optics ---------- */
  'refractive-index': {
    tex: 'n = \\dfrac{c}{v}',
    plain: 'n = c/v',
    name: 'Refractive index',
  },
  'snells-law': {
    tex: 'n_1 \\sin\\theta_1 = n_2 \\sin\\theta_2',
    plain: 'n₁ sin θ₁ = n₂ sin θ₂',
    name: "Snell's law",
  },

  /* ---------- Chapter 23: Transformers ---------- */
  'transformer-ratio': {
    tex: '\\dfrac{V_p}{V_s} = \\dfrac{N_p}{N_s} = \\dfrac{I_s}{I_p}',
    plain: 'V_p/V_s = N_p/N_s = I_s/I_p',
    name: 'Ideal-transformer voltage / turns / current ratio',
  },
} as const satisfies Record<string, FormulaDef>;

export type FormulaId = keyof typeof FORMULAS;

export function getFormula(id: FormulaId): FormulaDef {
  return FORMULAS[id];
}
