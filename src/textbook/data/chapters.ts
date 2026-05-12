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
  | 'magnetism'
  | 'induction'
  | 'energy-flow';

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
    ],
  },
  {
    slug: 'magnetism',
    number: 4,
    title: 'Magnetism',
    subtitle: 'The rotational half.',
    blurb:
      'Currents make magnetic fields. Magnetic fields steer moving charges. Two parallel wires attract or repel each other depending on whether their currents agree. None of this is a separate force — magnetism is what electricity looks like when you change reference frames.',
    relatedLabs: ['biot-savart', 'ampere', 'lorentz'],
    sources: [
      'biot-savart-1820', 'ampere-1826', 'feynman-II-13', 'griffiths-2017',
      'jackson-1999', 'hall-1879',
    ],
  },
  {
    slug: 'induction',
    number: 5,
    title: 'Induction',
    subtitle: 'Change is a voltage.',
    blurb:
      'A magnetic field that changes in time produces an electric field. Faraday discovered this in 1831 and the world started running on it: every generator, every transformer, every wireless charger. The minus sign in the formula is the universe insisting on energy conservation.',
    relatedLabs: ['faraday', 'inductance'],
    sources: [
      'faraday-1832', 'feynman-II-17', 'griffiths-2017', 'maxwell-1865',
      'jackson-1999',
    ],
  },
  {
    slug: 'energy-flow',
    number: 6,
    title: 'Where the energy actually flows',
    subtitle: 'Through the field. Not through the copper.',
    blurb:
      'The capstone. The energy that lights a bulb does not travel through the wire. It travels through the empty space around the wire, in the form of the electromagnetic field, and gets absorbed wherever there is resistance. Maxwell wrote it down, Poynting finished it, and Feynman called it "crazy" before teaching it anyway.',
    relatedLabs: ['poynting', 'energy-density', 'capacitance', 'inductance'],
    sources: [
      'poynting-1884', 'maxwell-1865', 'feynman-II-27', 'davis-kaplan-2011',
      'morris-styer-2012', 'griffiths-2017', 'jackson-1999',
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
