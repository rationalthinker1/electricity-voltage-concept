/**
 * Sources registry.
 *
 * Every prose page renders a Sources section drawn from this catalog.
 * To cite a fact, add the source key to that page's `sources` array.
 * To add a new source, add an entry here — keys are stable across the codebase.
 *
 * Rule: every numerical constant, every quoted line, every historical
 * attribution, every order-of-magnitude claim must be backed by a primary
 * or canonical secondary source listed here. No claim from training data
 * without a citation.
 */

export interface Source {
  id: string;
  title: string;
  author: string;
  /** Publication year */
  year?: number;
  /** Journal / publisher */
  venue?: string;
  /** Volume, issue, page numbers if applicable */
  locator?: string;
  /** Public URL */
  url?: string;
  /** Optional note: what page/section was used and what claim it backs */
  note?: string;
}

export const SOURCES: Record<string, Source> = {
  /* ─── Primary textbooks ─── */
  'feynman-II-27': {
    id: 'feynman-II-27',
    title: 'The Feynman Lectures on Physics, Vol. II, Ch. 27 — Field Energy and Field Momentum',
    author: 'Richard P. Feynman, Robert B. Leighton, Matthew Sands',
    year: 1964,
    venue: 'Caltech / Addison-Wesley',
    url: 'https://www.feynmanlectures.caltech.edu/II_27.html',
    note: 'Source for the Poynting-vector treatment of resistive wires and the "flow of energy into the wire all around" quote.',
  },
  'feynman-II-2': {
    id: 'feynman-II-2',
    title: 'The Feynman Lectures on Physics, Vol. II, Ch. 2 — Differential Calculus of Vector Fields',
    author: 'Richard P. Feynman, Robert B. Leighton, Matthew Sands',
    year: 1964,
    venue: 'Caltech / Addison-Wesley',
    url: 'https://www.feynmanlectures.caltech.edu/II_02.html',
    note: 'Conservative-field / curl-free property of static E and its potential representation.',
  },
  'feynman-II-13': {
    id: 'feynman-II-13',
    title: 'The Feynman Lectures on Physics, Vol. II, Ch. 13 — Magnetostatics',
    author: 'Richard P. Feynman, Robert B. Leighton, Matthew Sands',
    year: 1964,
    venue: 'Caltech / Addison-Wesley',
    url: 'https://www.feynmanlectures.caltech.edu/II_13.html',
    note: 'Biot–Savart, Ampère, and the relativistic origin of magnetism.',
  },
  'feynman-II-17': {
    id: 'feynman-II-17',
    title: 'The Feynman Lectures on Physics, Vol. II, Ch. 17 — The Laws of Induction',
    author: 'Richard P. Feynman, Robert B. Leighton, Matthew Sands',
    year: 1964,
    venue: 'Caltech / Addison-Wesley',
    url: 'https://www.feynmanlectures.caltech.edu/II_17.html',
    note: "Faraday's law and Lenz's-law sign convention.",
  },
  'griffiths-2017': {
    id: 'griffiths-2017',
    title: 'Introduction to Electrodynamics, 4th ed.',
    author: 'David J. Griffiths',
    year: 2017,
    venue: 'Cambridge University Press',
    note: 'Standard undergraduate reference for derivations of Coulomb, Gauss, Ampère, Faraday, Poynting and the Drude model. Specific sections cited per-page.',
  },
  'jackson-1999': {
    id: 'jackson-1999',
    title: 'Classical Electrodynamics, 3rd ed.',
    author: 'John David Jackson',
    year: 1999,
    venue: 'Wiley',
    note: 'Graduate reference for displacement current, energy density, Poynting flux, and relativistic transformation of E and B.',
  },
  'ashcroft-mermin-1976': {
    id: 'ashcroft-mermin-1976',
    title: 'Solid State Physics',
    author: 'Neil W. Ashcroft, N. David Mermin',
    year: 1976,
    venue: 'Holt, Rinehart & Winston',
    note: 'Drude model (Ch. 1), Fermi velocity, and free-electron densities n for conducting metals.',
  },
  'kittel-2005': {
    id: 'kittel-2005',
    title: 'Introduction to Solid State Physics, 8th ed.',
    author: 'Charles Kittel',
    year: 2005,
    venue: 'Wiley',
    note: 'Fermi velocity of copper ~1.57×10⁶ m/s, electrical resistivity tables.',
  },

  /* ─── Reference data ─── */
  'codata-2018': {
    id: 'codata-2018',
    title: 'CODATA Recommended Values of the Fundamental Physical Constants: 2018',
    author: 'E. Tiesinga, P. J. Mohr, D. B. Newell, B. N. Taylor',
    year: 2021,
    venue: 'Rev. Mod. Phys. 93, 025010',
    url: 'https://physics.nist.gov/cuu/Constants/',
    note: 'Source for e, m_e, m_p, ε₀, μ₀ (post-2019 SI), c (exact), G, k_B, σ_SB used throughout.',
  },
  'crc-resistivity': {
    id: 'crc-resistivity',
    title: 'CRC Handbook of Chemistry and Physics, 104th ed., "Electrical Resistivity of Pure Metals" at 20 °C',
    author: 'John R. Rumble (ed.)',
    year: 2023,
    venue: 'CRC Press / Taylor & Francis',
    note: 'Conductivities of Cu, Ag, Au, Al, Fe, W at room temperature.',
  },
  'kanthal': {
    id: 'kanthal',
    title: 'Nichrome 80 / Kanthal A1 — manufacturer datasheet',
    author: 'Sandvik / Kanthal',
    year: 2024,
    venue: 'Materials data sheet',
    url: 'https://www.kanthal.com/en/products/material-datasheets/wire/resistance-heating-wire-and-resistance-wire/nikrothal-80/',
    note: 'Resistivity ρ ≈ 1.1×10⁻⁶ Ω·m (σ ≈ 9×10⁵ S/m) for the canonical heating alloy.',
  },
  'libretexts-conduction': {
    id: 'libretexts-conduction',
    title: 'University Physics II — §9.3 Model of Conduction in Metals',
    author: 'OpenStax / LibreTexts',
    year: 2023,
    url: 'https://phys.libretexts.org/Bookshelves/University_Physics/University_Physics_(OpenStax)/University_Physics_II_-_Thermodynamics_Electricity_and_Magnetism_(OpenStax)/09:_Current_and_Resistance/9.03:_Model_of_Conduction_in_Metals',
    note: 'Drift velocity of 0.02 mm/s for 12-gauge Cu @ 20 A; signal speed ~⅔ c in copper; collision time τ ~2×10⁻¹⁴ s.',
  },

  /* ─── Journal articles ─── */
  'davis-kaplan-2011': {
    id: 'davis-kaplan-2011',
    title: 'Poynting vector flow in a circular circuit',
    author: 'Basil S. Davis, Lev Kaplan',
    year: 2011,
    venue: 'American Journal of Physics 79, 1155–1162',
    url: 'https://pubs.aip.org/aapt/ajp/article/79/11/1155/1056381/Poynting-vector-flow-in-a-circular-circuit',
    note: 'Full 3D numerical treatment showing Poynting flux into a resistive ring-shaped wire equals the dissipated power. Confirms the 2D toy model generalizes.',
  },
  'morris-styer-2012': {
    id: 'morris-styer-2012',
    title: 'Visualizing Poynting vector energy flow in electric circuits',
    author: 'Daniel F. Styer (lecture notes)',
    year: 2012,
    venue: 'Oberlin College Electrodynamics course materials',
    url: 'https://www2.oberlin.edu/physics/dstyer/Electrodynamics/VisualizingZ.pdf',
    note: 'Practical visualization of Poynting flow, including the 2D infinite-parallel-rail toy in which the flow lines are exactly along equipotentials.',
  },
  'cavendish-1773': {
    id: 'cavendish-1773',
    title: 'Henry Cavendish, "Experiments on Electricity" (1771–1781 notes, esp. 1773 null-cavity test), in The Electrical Researches of the Honourable Henry Cavendish',
    author: 'James Clerk Maxwell (ed.)',
    year: 1879,
    venue: 'Cambridge University Press',
    note: 'Cavendish concluded in 1773 that the inverse-square exponent could differ from 2 by no more than ~1/50 (|deviation| < 0.02) — the first precision test. Maxwell & MacAlister refined the bound to ~1/21600 in 1877.',
  },
  'williams-faller-hill-1971': {
    id: 'williams-faller-hill-1971',
    title: "New Experimental Test of Coulomb's Law: A Laboratory Upper Limit on the Photon Rest Mass",
    author: 'E. R. Williams, J. E. Faller, H. A. Hill',
    year: 1971,
    venue: 'Physical Review Letters 26, 721',
    url: 'https://doi.org/10.1103/PhysRevLett.26.721',
    note: "Writing the deviation as 1/r^(2+q), the experiment bounded q = (2.7 ± 3.1)×10⁻¹⁶ — i.e., the exponent is 2 to within ~3×10⁻¹⁶.",
  },
  'coulomb-1785': {
    id: 'coulomb-1785',
    title: 'Premier mémoire sur l\'électricité et le magnétisme',
    author: 'Charles-Augustin de Coulomb',
    year: 1785,
    venue: 'Histoire de l\'Académie Royale des Sciences',
    note: 'Original torsion-balance experiment establishing the inverse-square law for electric force.',
  },
  'faraday-1832': {
    id: 'faraday-1832',
    title: 'Experimental Researches in Electricity. — First Series',
    author: 'Michael Faraday',
    year: 1832,
    venue: 'Philosophical Transactions of the Royal Society of London 122, 125–162',
    url: 'https://royalsocietypublishing.org/doi/10.1098/rstl.1832.0006',
    note: 'Discovery of electromagnetic induction.',
  },
  'maxwell-1865': {
    id: 'maxwell-1865',
    title: 'A Dynamical Theory of the Electromagnetic Field',
    author: 'James Clerk Maxwell',
    year: 1865,
    venue: 'Philosophical Transactions of the Royal Society of London 155, 459–512',
    url: 'https://royalsocietypublishing.org/doi/10.1098/rstl.1865.0008',
    note: 'Introduces displacement current and completes Ampère\'s law, predicting EM waves at speed c.',
  },
  'poynting-1884': {
    id: 'poynting-1884',
    title: 'On the Transfer of Energy in the Electromagnetic Field',
    author: 'John Henry Poynting',
    year: 1884,
    venue: 'Philosophical Transactions of the Royal Society of London 175, 343–361',
    url: 'https://royalsocietypublishing.org/doi/10.1098/rstl.1884.0016',
    note: 'Derivation of S = (1/μ₀)E×B and energy-conservation theorem for EM fields.',
  },
  'drude-1900': {
    id: 'drude-1900',
    title: 'Zur Elektronentheorie der Metalle',
    author: 'Paul Drude',
    year: 1900,
    venue: 'Annalen der Physik 306 (3), 566–613',
    note: 'Original classical free-electron model of metallic conduction.',
  },
  'biot-savart-1820': {
    id: 'biot-savart-1820',
    title: 'Note sur le magnétisme de la pile de Volta',
    author: 'Jean-Baptiste Biot, Félix Savart',
    year: 1820,
    venue: 'Annales de Chimie et de Physique 15, 222–223',
    note: 'Empirical 1/r² fall-off of magnetic field from a current element.',
  },
  'ampere-1826': {
    id: 'ampere-1826',
    title: 'Théorie mathématique des phénomènes électrodynamiques uniquement déduite de l\'expérience',
    author: 'André-Marie Ampère',
    year: 1826,
    venue: 'Académie des Sciences, Paris',
    note: 'Force law between current elements; what we now call Ampère\'s circuital law.',
  },
  'gauss-1813': {
    id: 'gauss-1813',
    title: 'Theoria attractionis corporum sphaeroidicorum ellipticorum',
    author: 'Carl Friedrich Gauss',
    year: 1813,
    venue: 'Commentationes societatis regiae scientiarum Gottingensis recentiores',
    note: 'Original divergence theorem (Gauss\'s theorem) — later applied to electrostatics.',
  },
  'hall-1879': {
    id: 'hall-1879',
    title: 'On a New Action of the Magnet on Electric Currents',
    author: 'Edwin Hall',
    year: 1879,
    venue: 'American Journal of Mathematics 2, 287',
    note: 'Discovery of the Hall effect — sign of charge carriers in conductors.',
  },
  'joule-1841': {
    id: 'joule-1841',
    title: 'On the Heat Evolved by Metallic Conductors of Electricity',
    author: 'James Prescott Joule',
    year: 1841,
    venue: 'Philosophical Magazine 19, 260',
    note: 'Original measurement of P = I²R heating in resistive wires.',
  },

  /* ─── Online references ─── */
  'hyperphysics-emag': {
    id: 'hyperphysics-emag',
    title: 'HyperPhysics — Electricity and Magnetism',
    author: 'Carl R. Nave, Georgia State University',
    year: 2020,
    url: 'http://hyperphysics.phy-astr.gsu.edu/hbase/electric/elecon.html',
    note: 'Cross-checked numerical examples and derivation summaries for undergraduate EM topics.',
  },
  'libretexts-univ-physics': {
    id: 'libretexts-univ-physics',
    title: 'OpenStax University Physics II — Electricity & Magnetism',
    author: 'OpenStax / LibreTexts',
    year: 2023,
    url: 'https://phys.libretexts.org/Bookshelves/University_Physics/University_Physics_(OpenStax)/University_Physics_II_-_Thermodynamics_Electricity_and_Magnetism_(OpenStax)',
    note: 'Open-access undergraduate text used as a cross-reference for numbers and worked examples.',
  },
  'nist-codata': {
    id: 'nist-codata',
    title: 'NIST Reference on Constants, Units, and Uncertainty',
    author: 'National Institute of Standards and Technology',
    year: 2022,
    url: 'https://physics.nist.gov/cuu/Constants/',
    note: 'Canonical source for SI fundamental constants used in src/lib/physics.ts.',
  },
};

export type SourceKey = keyof typeof SOURCES;

/** Get a citation's display string (used by inline <Cite/> component). */
export function citeLabel(key: SourceKey, ids: SourceKey[]): string {
  const idx = ids.indexOf(key);
  if (idx === -1) return '?';
  return String(idx + 1);
}
