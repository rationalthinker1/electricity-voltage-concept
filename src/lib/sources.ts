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
  'onnes-1911': {
    id: 'onnes-1911',
    title: 'Further experiments with liquid helium. C. On the change of electric resistance of pure metals at very low temperatures etc. IV. The resistance of pure mercury at helium temperatures',
    author: 'Heike Kamerlingh Onnes',
    year: 1911,
    venue: 'Communications from the Physical Laboratory of the University of Leiden, No. 120b / 122b',
    note: 'Discovery of superconductivity: mercury\'s resistance drops abruptly to zero at 4.2 K.',
  },
  'bcs-1957': {
    id: 'bcs-1957',
    title: 'Theory of Superconductivity',
    author: 'J. Bardeen, L. N. Cooper, J. R. Schrieffer',
    year: 1957,
    venue: 'Physical Review 108, 1175',
    url: 'https://doi.org/10.1103/PhysRev.108.1175',
    note: 'BCS theory: phonon-mediated electron pairing explains the gap and zero DC resistance of superconductors.',
  },
  'matthiessen-1864': {
    id: 'matthiessen-1864',
    title: 'On the influence of temperature on the electric conducting-power of alloys',
    author: 'Augustus Matthiessen, Charles Vogt',
    year: 1864,
    venue: 'Philosophical Transactions of the Royal Society of London 154, 167–200',
    note: 'Matthiessen\'s rule: ρ(T) = ρ_residual + ρ_phonon(T); resistivity of pure metals is roughly linear in T above the Debye temperature.',
  },
  'nec-2017-aluminum': {
    id: 'nec-2017-aluminum',
    title: 'CPSC Publication #516 — Repairing Aluminum Wiring',
    author: 'U.S. Consumer Product Safety Commission',
    year: 2011,
    url: 'https://www.cpsc.gov/safety-education/safety-guides/home/repairing-aluminum-wiring',
    note: 'Solid-aluminum branch-circuit wiring (15 A / 20 A) installed in U.S. homes 1965–1973 was implicated in connection-overheating fires; oxide layer and creep at terminations were the root causes.',
  },
  'grainger-power-systems-2003': {
    id: 'grainger-power-systems-2003',
    title: 'Power System Analysis',
    author: 'John J. Grainger, William D. Stevenson Jr.',
    year: 1994,
    venue: 'McGraw-Hill',
    note: 'Transmission-line losses scale as P_loss = (P_load/V)² R; raising V reduces I for a given delivered P, cutting I²R losses quadratically.',
  },
  'irwin-circuit-analysis-2015': {
    id: 'irwin-circuit-analysis-2015',
    title: 'Basic Engineering Circuit Analysis, 11th ed.',
    author: 'J. David Irwin, R. Mark Nelms',
    year: 2015,
    venue: 'Wiley',
    note: 'Impedance Z = R + jX as the AC generalization of resistance; reactive components store energy rather than dissipate it.',
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

  /* ─── New for Ch7–Ch11 ─── */
  'hertz-1888': {
    id: 'hertz-1888',
    title: 'Über elektromagnetische Wellen im Lufte und deren Reflexion (On Electromagnetic Waves in Air and Their Reflection)',
    author: 'Heinrich Hertz',
    year: 1888,
    venue: 'Annalen der Physik 270 (8), 609–623',
    note: 'First experimental detection of electromagnetic waves predicted by Maxwell; standing waves between parallel reflectors gave a propagation speed consistent with c.',
  },
  'feynman-II-18': {
    id: 'feynman-II-18',
    title: "The Feynman Lectures on Physics, Vol. II, Ch. 18 — The Maxwell Equations",
    author: 'Richard P. Feynman, Robert B. Leighton, Matthew Sands',
    year: 1964,
    venue: 'Caltech / Addison-Wesley',
    url: 'https://www.feynmanlectures.caltech.edu/II_18.html',
    note: "Compact synthesis of the four Maxwell equations and Maxwell's displacement-current addition to Ampère's law.",
  },
  'feynman-II-21': {
    id: 'feynman-II-21',
    title: 'The Feynman Lectures on Physics, Vol. II, Ch. 21 — Solutions of Maxwell\'s Equations with Currents and Charges',
    author: 'Richard P. Feynman, Robert B. Leighton, Matthew Sands',
    year: 1964,
    venue: 'Caltech / Addison-Wesley',
    url: 'https://www.feynmanlectures.caltech.edu/II_21.html',
    note: 'Radiation from accelerating charges; the formula for the far-field of an oscillating dipole.',
  },
  'einstein-1905': {
    id: 'einstein-1905',
    title: 'Zur Elektrodynamik bewegter Körper (On the Electrodynamics of Moving Bodies)',
    author: 'Albert Einstein',
    year: 1905,
    venue: 'Annalen der Physik 17 (10), 891–921',
    url: 'https://einsteinpapers.press.princeton.edu/vol2-trans/154',
    note: 'Special relativity, motivated explicitly by the electrodynamics of moving bodies. Section 9 shows how E and B transform between inertial frames.',
  },
  'purcell-morin-2013': {
    id: 'purcell-morin-2013',
    title: 'Electricity and Magnetism, 3rd ed.',
    author: 'Edward M. Purcell, David J. Morin',
    year: 2013,
    venue: 'Cambridge University Press',
    note: "Treats magnetism as the relativistic consequence of moving charge from the start — the textbook Feynman gestures at in Vol II Ch. 13. Ch. 5–6 derive B from a Lorentz-boosted Coulomb force.",
  },
  'kirchhoff-1845': {
    id: 'kirchhoff-1845',
    title: 'Über den Durchgang eines elektrischen Stromes durch eine Ebene, insbesondere durch eine kreisförmige (On the passage of an electric current through a plane, in particular a circular one)',
    author: 'Gustav Kirchhoff',
    year: 1845,
    venue: 'Annalen der Physik 140 (4), 497–514',
    note: "Kirchhoff's current and voltage laws for circuits.",
  },
  'horowitz-hill-2015': {
    id: 'horowitz-hill-2015',
    title: 'The Art of Electronics, 3rd ed.',
    author: 'Paul Horowitz, Winfield Hill',
    year: 2015,
    venue: 'Cambridge University Press',
    note: 'Working engineer\'s reference for practical AC, impedance, op-amps, and signal-handling; cross-checked numerical examples for Ch.10.',
  },
  'clausius-1850': {
    id: 'clausius-1850',
    title: 'Ueber die Art der Bewegung, welche wir Wärme nennen / Polarization in dielectrics (Clausius–Mossotti work, 1850s)',
    author: 'Rudolf Clausius (with O. F. Mossotti, 1846)',
    year: 1850,
    venue: 'Annalen der Physik (and later Mossotti, Mem. Soc. Ital. Sci. Modena 1846)',
    note: 'Clausius–Mossotti relation linking molecular polarizability to bulk permittivity εᵣ.',
  },
  'langevin-1905': {
    id: 'langevin-1905',
    title: 'Magnétisme et théorie des électrons (Magnetism and the Theory of Electrons)',
    author: 'Paul Langevin',
    year: 1905,
    venue: 'Annales de Chimie et de Physique 5, 70–127',
    note: 'Classical theory of dia- and paramagnetism; the Langevin function describes the equilibrium magnetization of independent magnetic dipoles.',
  },
  'weiss-1907': {
    id: 'weiss-1907',
    title: "L'hypothèse du champ moléculaire et la propriété ferromagnétique (Molecular Field Hypothesis and the Ferromagnetic Property)",
    author: 'Pierre Weiss',
    year: 1907,
    venue: 'Journal de Physique Théorique et Appliquée 6, 661–690',
    note: 'Weiss molecular-field theory and the magnetic-domain picture explaining hysteresis in ferromagnets.',
  },
  'debye-1929': {
    id: 'debye-1929',
    title: 'Polar Molecules',
    author: 'Peter Debye',
    year: 1929,
    venue: 'Chemical Catalog Company / Dover reprint',
    note: 'Frequency dependence of εᵣ in polar liquids (Debye relaxation); origin of the large static εᵣ ≈ 80 of water.',
  },
};

export type SourceKey = keyof typeof SOURCES;

/** Get a citation's display string (used by inline <Cite/> component). */
export function citeLabel(key: SourceKey, ids: SourceKey[]): string {
  const idx = ids.indexOf(key);
  if (idx === -1) return '?';
  return String(idx + 1);
}
