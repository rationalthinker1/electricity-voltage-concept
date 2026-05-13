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
  | 'how-a-resistor-works'
  | 'capacitors'
  | 'magnetism'
  | 'induction'
  | 'energy-flow'
  | 'em-waves'
  | 'maxwell'
  | 'relativity'
  | 'circuits-and-ac'
  | 'network-analysis'
  | 'semiconductors'
  | 'fourier-harmonics'
  | 'filters-op-amps-tlines'
  | 'materials'
  | 'optics'
  | 'antennas'
  | 'motors'
  | 'generators'
  | 'transformers'
  | 'rectifiers-and-inverters'
  | 'batteries'
  | 'modern-batteries';

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
    slug: 'how-a-resistor-works',
    number: 4,
    title: 'How a resistor works',
    subtitle: 'The component, not just the concept.',
    blurb:
      "Ch.3 was about resistance as a physical quantity. This chapter is about the physical part you can hold in your hand: the actual resistor, made of carbon film or metal oxide or wound wire, with a power rating, a tolerance band, a temperature coefficient, and a colour code. Plus the variable cousins — pots, thermistors, photoresistors — that change R on demand.",
    relatedLabs: ['resistance', 'ohms-law', 'joule', 'drift'],
    sources: [
      'griffiths-2017', 'crc-resistivity', 'kanthal', 'matthiessen-1864',
      'horowitz-hill-2015', 'iec-60062-2016', 'steinhart-hart-1968',
      'wiedemann-franz-1853', 'ashcroft-mermin-1976', 'codata-2018',
      'vishay-z-foil', 'vishay-csm-shunt',
    ],
  },
  {
    slug: 'capacitors',
    number: 5,
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
    number: 6,
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
    number: 7,
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
    number: 8,
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
    number: 9,
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
    number: 10,
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
    number: 11,
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
    number: 12,
    title: 'Circuits, AC, and impedance',
    subtitle: 'When the field gets compressed into a schematic.',
    blurb:
      "What happens when you stop thinking about fields and start thinking about wires, components, and nodes. Kirchhoff's two laws, the RC and RL transients, the LC oscillation, AC impedance, resonance and Q, the real-power / reactive-power split, and why the grid uses three-phase.",
    relatedLabs: ['ohms-law', 'capacitance', 'inductance', 'joule'],
    sources: [
      'kirchhoff-1845', 'griffiths-2017', 'irwin-circuit-analysis-2015',
      'grainger-power-systems-2003', 'horowitz-hill-2015', 'codata-2018',
      'ansi-c84-1-2020', 'erickson-maksimovic-2020', 'keysight-34465a-datasheet',
    ],
  },
  {
    slug: 'network-analysis',
    number: 13,
    title: 'Network analysis methods',
    subtitle: 'Mesh, nodal, superposition, Norton, Y-Δ, max-power.',
    blurb:
      "Kirchhoff in Ch.12 is enough in principle; this chapter gives you the systematic procedures every working engineer reaches for in practice. Mesh-current and nodal analysis turn any linear network into a small linear system. Superposition lets you handle multiple sources one at a time. Norton's theorem is the current-source twin of Thévenin's. Y-Δ transformations (Kennelly 1899) untangle bridge networks. The maximum-power-transfer theorem tells you when to match impedances.",
    relatedLabs: ['ohms-law', 'resistance'],
    sources: [
      'kirchhoff-1845', 'maxwell-1873', 'kennelly-1899', 'norton-1926',
      'irwin-circuit-analysis-2015', 'horowitz-hill-2015',
      'hayt-kemmerly-durbin-2018', 'griffiths-2017', 'codata-2018',
    ],
  },
  {
    slug: 'semiconductors',
    number: 14,
    title: 'Semiconductors and transistors',
    subtitle: 'p-n junctions, BJTs, and FETs — what is inside the chip.',
    blurb:
      "Until here every component has been a passive lump of metal or dielectric. This chapter opens the active devices: the silicon p-n junction (Shockley 1949), the bipolar junction transistor (Bardeen-Brattain-Shockley 1947), and the field-effect transistor (Kahng-Atalla MOSFET 1959). From single doped crystals through diodes, BJTs, JFETs, and MOSFETs to small-signal amplifiers, switches, and load-line analysis.",
    relatedLabs: ['ohms-law', 'capacitance'],
    sources: [
      'shockley-1949', 'bardeen-brattain-1948', 'kahng-atalla-1960',
      'shockley-1956-nobel', 'streetman-banerjee-2015', 'sedra-smith-2014',
      'razavi-2021', 'horowitz-hill-2015', 'griffiths-2017', 'codata-2018',
    ],
  },
  {
    slug: 'fourier-harmonics',
    number: 15,
    title: 'Fourier and harmonic analysis',
    subtitle: 'Every periodic signal is a sum of sines.',
    blurb:
      "Fourier 1822: any periodic function decomposes into a sum of sines and cosines at integer multiples of the fundamental frequency. That single fact rewrote signal processing, audio engineering, communications, and power electronics. We trace the Fourier series, harmonic synthesis, the RMS of a complex wave (Parseval), how harmonics propagate through linear filters, and how SMPS and motor drives inject harmonics back into the grid.",
    relatedLabs: ['ohms-law', 'capacitance'],
    sources: [
      'fourier-1822', 'oppenheim-willsky-1997', 'bracewell-2000',
      'cooley-tukey-1965', 'horowitz-hill-2015', 'griffiths-2017', 'codata-2018',
    ],
  },
  {
    slug: 'filters-op-amps-tlines',
    number: 16,
    title: 'Filters, op-amps, and transmission lines',
    subtitle: 'Frequency, gain, and the moment a wire stops being a single node.',
    blurb:
      "The frequency-domain and active-circuit sequel to Ch.12. Transfer functions and Bode plots compress a filter's behaviour to two straight lines; op-amps in negative feedback turn every linear gain block into a two-resistor problem; transmission lines hand off from lumped analysis when the line length crosses ~λ/10. Together: the working analog engineer's toolkit.",
    relatedLabs: ['capacitance', 'inductance', 'poynting'],
    sources: [
      'horowitz-hill-2015', 'oppenheim-willsky-1997', 'sedra-smith-2014',
      'widlar-1965', 'pozar-2011', 'johnson-graham-1993',
      'griffiths-2017', 'codata-2018',
    ],
  },
  {
    slug: 'materials',
    number: 17,
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
  {
    slug: 'optics',
    number: 18,
    title: 'Optics from electromagnetism',
    subtitle: 'Light is a wave. Materials slow it down.',
    blurb:
      "Drop Ch.9's plane wave onto a sheet of glass. Boundary conditions on E and B make Snell's law fall out for free. Frequency-dependent εᵣ makes prisms split white light. Brewster's angle, total internal reflection, thin-film interference, the laser — all of optics is what classical EM looks like at 10¹⁴ Hz.",
    relatedLabs: ['poynting', 'energy-density'],
    sources: [
      'maxwell-1865', 'feynman-II-21', 'griffiths-2017', 'jackson-1999',
      'codata-2018', 'hecht-2017', 'born-wolf-1999', 'young-1804',
      'maiman-1960', 'brewster-1815', 'fresnel-1823',
    ],
  },
  {
    slug: 'antennas',
    number: 19,
    title: 'Antennas and radiation',
    subtitle: 'How field becomes radio.',
    blurb:
      'Push current up and down a wire and the field around it propagates outward — that current carries information to anyone with a matching wire and a receiver. From the dipole pattern (sin²θ) through Yagis and parabolas to phased arrays and Friis transmission. Everything from your Wi-Fi to GPS to the Cosmic Microwave Background hangs on this physics.',
    relatedLabs: ['poynting', 'energy-density', 'biot-savart'],
    sources: [
      'maxwell-1865', 'hertz-1888', 'feynman-II-21', 'griffiths-2017',
      'jackson-1999', 'balanis-2016', 'friis-1946', 'yagi-1928',
      'kraus-marhefka-2002', 'codata-2018',
    ],
  },
  {
    slug: 'motors',
    number: 20,
    title: 'Motors',
    subtitle: 'How a current ends up as a torque.',
    blurb:
      "F = q v × B applied to the conduction electrons of a current-carrying coil gives a force on the coil; F·r is torque. Build that into a brushed DC motor, a brushless one, an AC induction (Tesla 1888) machine, a synchronous motor, a stepper. Same physics; six different commutation strategies.",
    relatedLabs: ['lorentz', 'biot-savart', 'ampere'],
    sources: [
      'feynman-II-13', 'griffiths-2017', 'jackson-1999', 'tesla-1888',
      'fitzgerald-kingsley-umans-2014', 'krishnan-2010-bldc', 'codata-2018',
    ],
  },
  {
    slug: 'generators',
    number: 21,
    title: 'Generators and the grid',
    subtitle: 'The same machine, run backwards.',
    blurb:
      "Spin a magnet past a coil and EMF appears. The synchronous generator that does this 3000 times a minute is sitting at the bottom of every dam, behind every turbine, on the shaft of every car alternator. Three of them on a shaft give you 3-phase; ten thousand of them tied together give you the continental grid.",
    relatedLabs: ['faraday', 'inductance'],
    sources: [
      'faraday-1832', 'feynman-II-17', 'griffiths-2017',
      'grainger-power-systems-2003', 'fitzgerald-kingsley-umans-2014',
      'kundur-1994-power-stability', 'codata-2018',
    ],
  },
  {
    slug: 'transformers',
    number: 22,
    title: 'Transformers',
    subtitle: 'Two coils, one core, a different voltage on the other side.',
    blurb:
      "Wrap two coils around the same iron ring and a changing current in one drives a proportional voltage in the other. Faraday discovered the principle in 1831; Stanley turned it into a working power-grid component in 1885; and from that moment, electricity could be sent across continents. Step up to 500 kV for transmission, step down to 240 V for your wall, step down again to 5 V for your phone — all the same physics.",
    relatedLabs: ['faraday', 'inductance'],
    sources: [
      'faraday-1832', 'stanley-1886', 'feynman-II-17', 'griffiths-2017',
      'mclyman-2004', 'fitzgerald-kingsley-umans-2014',
      'grainger-power-systems-2003', 'steinmetz-1893', 'codata-2018',
      'kundur-1994-power-stability', 'erickson-maksimovic-2020',
      'horowitz-hill-2015',
    ],
  },
  {
    slug: 'rectifiers-and-inverters',
    number: 23,
    title: 'Rectifiers and inverters',
    subtitle: 'AC to DC, DC to AC, and the silicon that makes the swap.',
    blurb:
      "Your wall outlet is AC. Every chip in your laptop wants DC. Your roof's solar panel produces DC; the grid wants AC. The two-way bridge between them is power electronics — diode rectifiers (1904 onward), SCRs (1957), the buck/boost/flyback topologies that hide inside every wall-wart, and the grid-tie inverter that pushes your panels onto the 60 Hz line. We trace the path of energy through each of these.",
    relatedLabs: ['rc-circuit', 'capacitance'],
    sources: [
      'fleming-1904', 'shockley-1949', 'moll-tanenbaum-goldey-holonyak-1956',
      'mohan-undeland-robbins-2003', 'erickson-maksimovic-2020',
      'horowitz-hill-2015', 'griffiths-2017', 'codata-2018',
    ],
  },
  {
    slug: 'batteries',
    number: 24,
    title: 'How a battery works',
    subtitle: 'Chemistry that keeps a voltage on the wires.',
    blurb:
      "Volta stacked discs of copper and zinc with cardboard soaked in brine in 1800 and produced a current that lasted. The chemistry inside a single cell — half-reactions, the Nernst equation, the role of the electrolyte — explains every battery that ever existed. We will build that cell from scratch and watch its voltage land on the predicted number.",
    relatedLabs: ['potential', 'ohms-law'],
    sources: [
      'volta-1800-pile', 'nernst-1889', 'daniell-1836',
      'bard-faulkner-2001', 'griffiths-2017', 'codata-2018',
    ],
  },
  {
    slug: 'modern-batteries',
    number: 25,
    title: 'Modern batteries',
    subtitle: 'From lead-acid to lithium-ion to the next thing.',
    blurb:
      "Lead-acid (1859) still starts your car. Lithium-ion (Whittingham 1976, Goodenough 1980, Yoshino 1985 — 2019 Nobel) starts your phone. Flow cells (vanadium redox), supercapacitors, solid-state cells, fuel cells (PEM, SOFC). The chemistry has changed; the principle hasn't. We catalogue what's actually in your stuff and what's coming next.",
    relatedLabs: ['capacitance', 'energy-density'],
    sources: [
      'whittingham-1976', 'goodenough-1980-licoo2', 'yoshino-1985',
      'plante-1859', 'larminie-dicks-2003-fuel-cells', 'bard-faulkner-2001',
      'griffiths-2017', 'codata-2018',
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
