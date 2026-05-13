/**
 * Textbook chapter manifest.
 *
 * The site's front door is now the textbook narrative — six chapters, each
 * a long-form prose essay with embedded interactive demos. The 16 equation
 * labs (src/labs/) live as an appendix at /reference for readers who want
 * to dig into the math behind a specific equation.
 *
 * Each chapter spec lists the demo IDs it embeds; the demos themselves
 * live in src/textbook/demos/ as small React components.
 */

import type { SourceKey } from '@/lib/sources';

export type ChapterSlug =
  | 'what-is-electricity'
  | 'voltage-and-current'
  | 'resistance-and-power'
  | 'capacitors'
  | 'magnetism'
  | 'induction'
  | 'energy-flow'
  | 'em-waves'
  | 'maxwell'
  | 'relativity'
  | 'circuits-and-ac'
  | 'materials';

export interface ChapterEntry {
  slug: ChapterSlug;
  /** "Chapter 1", "Chapter 2", ... */
  number: number;
  /** Display title */
  title: string;
  /** Italic em-tagged subtitle for the chapter card */
  subtitle: string;
  /** TOC blurb */
  blurb: string;
  /** Which lab pages this chapter naturally links to (for "go deeper" CTAs) */
  relatedLabs: string[];
  /** Sources cited across this chapter */
  sources: SourceKey[];
}

export const CHAPTERS: ChapterEntry[] = [
  {
    slug: 'what-is-electricity',
    number: 1,
    title: 'Charge and field',
    subtitle: 'What "electricity" actually is, before anything moves.',
    blurb:
      'The bottom layer. Two kinds of charge, an inverse-square force between them, and the field that fills space around any charged thing. Before voltage, before current, before resistance — this.',
    relatedLabs: ['coulomb', 'e-field', 'gauss'],
    sources: [
      'coulomb-1785', 'cavendish-1773', 'williams-faller-hill-1971',
      'gauss-1813', 'griffiths-2017', 'feynman-II-2', 'codata-2018',
      'rakov-uman-2003', 'uman-2001',
    ],
  },
  {
    slug: 'voltage-and-current',
    number: 2,
    title: 'Voltage and current',
    subtitle: 'A difference, and a flow.',
    blurb:
      'Voltage is not pressure. Current is not water in a pipe. The signal that lights the bulb is not made of electrons. Three deeply non-obvious facts that every wall outlet quietly proves.',
    relatedLabs: ['potential', 'drift', 'ohms-law'],
    sources: [
      'feynman-II-2', 'griffiths-2017', 'drude-1900', 'ashcroft-mermin-1976',
      'kittel-2005', 'libretexts-conduction',
      'usb-pd-r3', 'catania-2015',
    ],
  },
  {
    slug: 'resistance-and-power',
    number: 3,
    title: 'Resistance and power',
    subtitle: 'Friction, and where the heat comes from.',
    blurb:
      'Why a long wire resists more than a short one. Why a thin wire resists more than a fat one. Why electrons crashing into a lattice means your toaster glows. The whole macroscopic story falls out of one microscopic picture.',
    relatedLabs: ['ohms-law', 'resistance', 'joule', 'drift'],
    sources: [
      'drude-1900', 'ashcroft-mermin-1976', 'crc-resistivity', 'kanthal',
      'joule-1841', 'griffiths-2017',
      'onnes-1911', 'bcs-1957', 'matthiessen-1864', 'nec-2017-aluminum',
      'grainger-power-systems-2003', 'irwin-circuit-analysis-2015',
      'coaton-marsden-1997',
    ],
  },
  {
    slug: 'capacitors',
    number: 4,
    title: 'Capacitors',
    subtitle: 'Storing charge across a gap.',
    blurb:
      "Put two metal plates close together, push charge onto one of them, and the second plate pulls equal-and-opposite charge to its near face. The gap between fills with an electric field. The field stores energy. The more charge you stack, the harder it gets to add the next bit — voltage rises linearly, work rises quadratically. That is the capacitor.",
    relatedLabs: ['capacitance', 'energy-density', 'potential'],
    sources: [
      'leyden-jar-1745', 'volta-1782', 'griffiths-2017', 'jackson-1999',
      'feynman-II-2', 'horowitz-hill-2015', 'codata-2018',
    ],
  },
  {
    slug: 'magnetism',
    number: 5,
    title: 'Magnetism',
    subtitle: 'The rotational half.',
    blurb:
      'Currents make magnetic fields. Magnetic fields steer moving charges. Two parallel wires attract or repel each other depending on whether their currents agree. None of this is a separate force — magnetism is what electricity looks like when you change reference frames.',
    relatedLabs: ['biot-savart', 'ampere', 'lorentz'],
    sources: [
      'biot-savart-1820', 'ampere-1826', 'feynman-II-13', 'griffiths-2017',
      'jackson-1999', 'hall-1879', 'codata-2018',
      'lauterbur-1973', 'bruning-lhc-2004', 'chulliat-wmm-2020', 'duncan-thompson-1992',
    ],
  },
  {
    slug: 'induction',
    number: 6,
    title: 'Induction',
    subtitle: 'Change is a voltage.',
    blurb:
      'A magnetic field that changes in time produces an electric field. Faraday discovered this in 1831 and the world started running on it: every generator, every transformer, every wireless charger. The minus sign in the formula is the universe insisting on energy conservation.',
    relatedLabs: ['faraday', 'inductance'],
    sources: [
      'faraday-1832', 'feynman-II-17', 'griffiths-2017', 'maxwell-1865',
      'jackson-1999',
      'wpc-qi-1.3', 'lucia-induction-2014', 'grainger-power-systems-2003',
    ],
  },
  {
    slug: 'energy-flow',
    number: 7,
    title: 'Where the energy actually flows',
    subtitle: 'Through the field. Not through the copper.',
    blurb:
      'The capstone. The energy that lights a bulb does not travel through the wire. It travels through the empty space around the wire, in the form of the electromagnetic field, and gets absorbed wherever there is resistance. Maxwell wrote it down, Poynting finished it, and Feynman called it "crazy" before teaching it anyway.',
    relatedLabs: ['poynting', 'energy-density', 'capacitance', 'inductance'],
    sources: [
      'poynting-1884', 'maxwell-1865', 'feynman-II-27', 'davis-kaplan-2011',
      'morris-styer-2012', 'griffiths-2017', 'jackson-1999',
      'pozar-2011', 'kopp-lean-2011', 'green-bohn-2015', 'codata-2018',
    ],
  },
  {
    slug: 'em-waves',
    number: 8,
    title: 'Electromagnetic waves',
    subtitle: 'Strip the wire. The field still moves.',
    blurb:
      "Take Ch.6's picture and remove the absorbing conductor. The field doesn't stop — it propagates outward at c, carrying energy and momentum through empty space. Maxwell predicted it in 1865; Hertz produced and detected it in 1887. Light, radio, X-rays — same physics, different wavelengths.",
    relatedLabs: ['poynting', 'energy-density'],
    sources: [
      'maxwell-1865', 'hertz-1888', 'feynman-II-21', 'griffiths-2017',
      'jackson-1999', 'codata-2018', 'poynting-1884',
      'ieee-80211', 'buffler-1993', 'tsuda-2013-ikaros', 'rontgen-1895',
      'rappaport-2013-mmwave', 'kopp-lean-2011',
    ],
  },
  {
    slug: 'maxwell',
    number: 9,
    title: "Maxwell's equations together",
    subtitle: 'Four laws. One field.',
    blurb:
      "Gauss for E. Gauss for B (no monopoles). Faraday. Ampère, plus Maxwell's displacement-current correction. Stacked on one page, they say: electric and magnetic fields are one thing, they propagate, and their propagation speed is c. The whole book up to here is the four lines of this chapter.",
    relatedLabs: ['gauss', 'ampere', 'faraday', 'poynting'],
    sources: [
      'maxwell-1865', 'gauss-1813', 'faraday-1832', 'ampere-1826',
      'hertz-1888', 'feynman-II-18', 'griffiths-2017', 'jackson-1999',
      'codata-2018',
      'hong-2001-wireless', 'kaplan-hegarty-2017', 'ewen-purcell-1951',
    ],
  },
  {
    slug: 'relativity',
    number: 10,
    title: 'Relativity and electromagnetism',
    subtitle: 'Magnetism is electricity, viewed from a moving train.',
    blurb:
      "Ch.4 promised it; here it pays off. A current-carrying wire is electrically neutral in its rest frame but appears charged in a frame moving along with the current — and that apparent charge is exactly the magnetic force the test charge feels in the original frame. E and B are not two fields; they are one tensor, viewed from different angles.",
    relatedLabs: ['lorentz', 'biot-savart'],
    sources: [
      'einstein-1905', 'feynman-II-13', 'griffiths-2017', 'jackson-1999',
      'purcell-morin-2013',
      'ashby-2003', 'kaplan-hegarty-2017', 'schwinger-1949', 'bruning-lhc-2004',
    ],
  },
  {
    slug: 'circuits-and-ac',
    number: 11,
    title: 'Circuits, AC, and impedance',
    subtitle: 'When the field gets compressed into a schematic.',
    blurb:
      "What happens when you stop thinking about fields and start thinking about wires, components, and nodes. Kirchhoff's two laws, the RC and RL transients, the LC oscillation, AC impedance, resonance and Q, the real-power / reactive-power split, and why the grid uses three-phase.",
    relatedLabs: ['ohms-law', 'capacitance', 'inductance', 'joule'],
    sources: [
      'kirchhoff-1845', 'griffiths-2017', 'irwin-circuit-analysis-2015',
      'grainger-power-systems-2003', 'horowitz-hill-2015', 'codata-2018',
      'ansi-c84-1-2020', 'erickson-maksimovic-2020',
    ],
  },
  {
    slug: 'materials',
    number: 12,
    title: 'Materials',
    subtitle: 'What ε and μ actually mean.',
    blurb:
      "Up to here, εᵣ and μᵣ have been sliders without a story. This chapter opens them up: bound charge and polarization, electric susceptibility, the molecular dipoles inside water, diamagnetism vs paramagnetism vs ferromagnetism, magnetic domains, hysteresis, and why iron concentrates magnetic flux while copper barely notices.",
    relatedLabs: ['potential', 'capacitance', 'inductance'],
    sources: [
      'clausius-1850', 'langevin-1905', 'weiss-1907', 'debye-1929',
      'griffiths-2017', 'jackson-1999', 'kittel-2005', 'codata-2018',
      'baibich-1988', 'binasch-grunberg-1989', 'moulson-herbert-2003',
    ],
  },
];

export function getChapter(slug: string): ChapterEntry | undefined {
  return CHAPTERS.find(c => c.slug === slug);
}

export function getChapterNeighbors(slug: string) {
  const idx = CHAPTERS.findIndex(c => c.slug === slug);
  return {
    prev: idx > 0 ? CHAPTERS[idx - 1] : null,
    next: idx >= 0 && idx < CHAPTERS.length - 1 ? CHAPTERS[idx + 1] : null,
  };
}
