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
  | 'magnetically-coupled-circuits'
  | 'transformers'
  | 'rectifiers-and-inverters'
  | 'batteries'
  | 'modern-batteries'
  | 'house-grid-arrives'
  | 'house-panel'
  | 'house-branch-circuits'
  | 'house-switches-receptacles'
  | 'house-big-loads'
  | 'house-safety'
  | 'house-smart-meter'
  | 'house-plug-to-chip'
  | 'house-replacing-fixtures'
  | 'house-troubleshooting'
  | 'house-new-circuit'
  | 'house-smart-retrofits'
  | 'house-outdoor-wet'
  | 'house-surge-grounding';

export type TrackId = 'practical' | 'bench' | 'rigor';

export const TRACKS: Record<TrackId, { name: string; description: string; accent: string }> = {
  practical: { name: 'Practical electrician', description: 'For wiring a house and reading a panel safely.', accent: 'teal' },
  bench:     { name: 'Bench engineer',        description: 'For designing analog and digital electronics.', accent: 'accent' },
  rigor:     { name: 'Physics rigor',         description: 'For the full Maxwell-relativity-Poynting story.', accent: 'pink' },
};

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
  /** One-sentence thesis. Rendered at the top of the syllabus card. */
  punchline?: string;
  /** 3–5 short bullets of what the reader will be able to do after this chapter. */
  objectives?: string[];
  /** Approximate reading + demo time in minutes. */
  timeToRead?: number;
  /** Other chapters this one assumes you've read. Slugs. */
  prereqs?: ChapterSlug[];
  /** Which preset curriculum tracks include this chapter. */
  tracks?: TrackId[];
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
    punchline:
      'Two kinds of charge, an inverse-square law that is really a fact about 3D space, and a field that turns force-at-a-distance into a property of the empty space around a charge.',
    objectives: [
      'Compute the Coulomb force between two point charges and predict its direction.',
      'Explain why the inverse-square law is geometrically inevitable in three dimensions.',
      'Sketch the electric field of a point charge, a dipole, and a parallel-plate pair.',
      'Use Gauss’s law to find the field of a symmetric charge distribution.',
      'Distinguish between charge as a property of matter and the field it sources.',
    ],
    timeToRead: 30,
    prereqs: [],
    tracks: ['practical', 'bench', 'rigor'],
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
    punchline:
      'Voltage is energy per coulomb, current is charge per second, and the signal that lights the bulb travels in the field — not in the slow drift of the electrons themselves.',
    objectives: [
      'Convert between work, charge, and voltage using V = W/q.',
      'Compute drift velocity from current density and predict its (surprisingly small) magnitude.',
      'Explain why a switch lights a lamp at the speed of light despite millimetre-per-second drift.',
      'Distinguish electrostatic potential difference from EMF.',
      'Recognise three equivalent forms of voltage and pick the right one for a given problem.',
    ],
    timeToRead: 30,
    prereqs: ['what-is-electricity'],
    tracks: ['practical', 'bench', 'rigor'],
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
    punchline:
      'Resistance is electrons colliding with a lattice; power dissipated is the kinetic energy lost in each collision, summed across the wire and turned into heat.',
    objectives: [
      'Apply Ohm’s law (V = IR) and predict current, voltage, or resistance for a simple circuit.',
      'Compute resistance from geometry using R = ρL/A.',
      'Calculate dissipated power three ways (P = VI, I²R, V²/R) and pick the most convenient.',
      'Explain Joule heating microscopically as energy transferred from electrons to lattice phonons.',
      'Predict how temperature shifts resistance and why metals warm but superconductors do not.',
    ],
    timeToRead: 30,
    prereqs: ['voltage-and-current'],
    tracks: ['practical', 'bench', 'rigor'],
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
    punchline:
      'A resistor is a physically engineered chunk of material with a known R, a known power rating, a known tolerance, and a known temperature coefficient — and every choice in its design is a trade-off.',
    objectives: [
      'Read a four-band and five-band colour code and translate it to a resistance with tolerance.',
      'Select a resistor wattage given expected dissipation with adequate derating headroom.',
      'Recognise the right resistor technology (carbon film, metal film, wirewound, foil, shunt) for a given job.',
      'Predict how thermistors and photoresistors change R with temperature or light.',
      'Compute small-signal behaviour around a pot’s wiper position.',
    ],
    timeToRead: 25,
    prereqs: ['resistance-and-power'],
    tracks: ['bench', 'rigor'],
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
    punchline:
      'Two plates and a gap store energy in the electric field between them — voltage rises linearly with charge, energy quadratically, and the dielectric multiplies both.',
    objectives: [
      'Compute capacitance of a parallel-plate geometry from C = ε₀ε_r A/d.',
      'Predict charge, voltage, and stored energy using Q = CV and U = ½CV².',
      'Sketch the RC charging curve and identify the time constant τ = RC.',
      'Explain how a dielectric reduces field strength inside the gap.',
      'Pick between ceramic, electrolytic, film, and supercapacitor styles for a given application.',
    ],
    timeToRead: 30,
    prereqs: ['what-is-electricity', 'voltage-and-current'],
    tracks: ['bench', 'rigor'],
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
    punchline:
      'Moving charges make B-fields and B-fields push moving charges sideways — the rotational half of electromagnetism that nature has been holding back until you got the linear half right.',
    objectives: [
      'Apply the Biot–Savart law to compute B around a straight wire and a circular loop.',
      'Use Ampère’s law to find B inside a solenoid and a toroid.',
      'Predict the Lorentz force F = qv × B on a charged particle.',
      'Explain why two parallel currents attract and two anti-parallel currents repel.',
      'Trace the Hall voltage that distinguishes carrier sign in a conductor.',
    ],
    timeToRead: 35,
    prereqs: ['what-is-electricity', 'voltage-and-current'],
    tracks: ['bench', 'rigor'],
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
    punchline:
      'A magnetic flux that changes in time is a voltage — and the minus sign in Faraday’s law is energy conservation in disguise.',
    objectives: [
      'Compute EMF from a changing flux using ε = −dΦ/dt.',
      'Apply Lenz’s law to predict the direction of an induced current.',
      'Calculate self-inductance L for a solenoid and use V = L dI/dt for a coil.',
      'Recognise the RL transient and identify τ = L/R.',
      'Explain how a wireless charger transfers energy across an air gap.',
    ],
    timeToRead: 30,
    prereqs: ['magnetism'],
    tracks: ['bench', 'rigor'],
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
    punchline:
      'Energy flows through the field surrounding the wire, not through the copper — and the Poynting vector S = E × B / μ₀ tells you exactly where it goes.',
    objectives: [
      'Compute the Poynting vector S = E × B / μ₀ for a simple DC circuit.',
      'Trace the energy flow from a battery through the field into a resistor.',
      'Evaluate energy density u = ½ε₀E² + ½B²/μ₀ inside a capacitor or inductor.',
      'Explain why a coaxial cable carries energy outside the inner conductor.',
      'Identify the radiation regime where S becomes the intensity of an EM wave.',
    ],
    timeToRead: 35,
    prereqs: ['voltage-and-current', 'resistance-and-power', 'magnetism', 'induction'],
    tracks: ['bench', 'rigor'],
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
    punchline:
      'When you let the EM field detach from the source, it does not stop — it propagates outward at c, carrying energy and momentum through empty space.',
    objectives: [
      'Derive the plane-wave speed c = 1/√(ε₀μ₀) from Maxwell’s equations.',
      'Relate E, B, and propagation direction in a plane wave.',
      'Compute the intensity of a plane wave from its peak field strength.',
      'Recognise wavelength bands from radio through gamma rays on a single physical spectrum.',
      'Explain why an accelerating charge radiates while a steady current does not.',
    ],
    timeToRead: 30,
    prereqs: ['energy-flow'],
    tracks: ['rigor'],
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
    punchline:
      'Four equations — two divergences and two curls — say that E and B are a single propagating field whose speed in vacuum is exactly c.',
    objectives: [
      'State each of Maxwell’s four equations in both integral and differential form.',
      'Explain why Maxwell’s displacement-current term was required for consistency.',
      'Derive the wave equation for E and B in vacuum from Maxwell’s equations.',
      'Recognise which equation governs which physical setup (capacitor, solenoid, antenna, etc.).',
      'Use the equations to predict that the speed of light is a property of vacuum.',
    ],
    timeToRead: 30,
    prereqs: ['em-waves'],
    tracks: ['rigor'],
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
    punchline:
      'E and B are not two fields but one tensor — what looks magnetic in one frame is the electric force on length-contracted charge in another.',
    objectives: [
      'Apply the Lorentz transformation to the electric and magnetic field components.',
      'Show that a current-carrying wire appears charged to a moving observer.',
      'Explain why magnetic forces are a relativistic correction to electric ones, despite their everyday strength.',
      'Recognise invariants of the EM field (E·B and E² − c²B²).',
      'Predict frame-dependent observations for a test charge near a moving current.',
    ],
    timeToRead: 30,
    prereqs: ['magnetism', 'em-waves'],
    tracks: ['rigor'],
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
    punchline:
      'Kirchhoff’s two laws, plus complex impedance, collapse the entire EM field around a working circuit into a tractable algebra of nodes and loops.',
    objectives: [
      'Apply Kirchhoff’s voltage and current laws to a multi-loop circuit.',
      'Solve RC and RL transients and identify their time constants.',
      'Compute impedance Z = R + jX for series RLC at a given frequency.',
      'Identify resonance and quality factor Q in an RLC tank circuit.',
      'Distinguish real, reactive, and apparent power on an AC line.',
    ],
    timeToRead: 35,
    prereqs: ['resistance-and-power', 'capacitors', 'induction'],
    tracks: ['practical', 'bench', 'rigor'],
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
    punchline:
      'Any linear network reduces to a small system of linear equations — mesh, nodal, Thévenin, Norton, Y-Δ, and max-power are the standard tools for writing them.',
    objectives: [
      'Solve a multi-loop circuit by mesh-current analysis.',
      'Solve the same circuit by nodal analysis and check the two answers agree.',
      'Apply superposition to a network with multiple independent sources.',
      'Reduce a bridge network using a Y-Δ transformation.',
      'Apply the maximum-power-transfer theorem to choose a load resistance.',
    ],
    timeToRead: 30,
    prereqs: ['circuits-and-ac'],
    tracks: ['practical', 'bench', 'rigor'],
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
    punchline:
      'Doping silicon turns it from an inert crystal into a controllable charge carrier; pn-junctions, BJTs, and FETs are the three logical machines you can build from doped slabs.',
    objectives: [
      'Explain the role of n-type and p-type doping in establishing carrier concentrations.',
      'Predict diode behaviour using the Shockley diode equation.',
      'Identify the four BJT operating regions on a load line.',
      'Distinguish JFET and MOSFET operating principles and their gate-isolation differences.',
      'Apply small-signal models to a common-emitter or common-source amplifier.',
    ],
    timeToRead: 35,
    prereqs: ['resistance-and-power'],
    tracks: ['bench', 'rigor'],
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
      'grainger-power-systems-2003',
    ],
    punchline:
      'Any periodic waveform is exactly a sum of harmonic sines — and decomposing into that sum is the single move that drives signal processing, communications, and power-electronics analysis.',
    objectives: [
      'Compute the Fourier series of a simple periodic signal (square, triangle, sawtooth).',
      'Apply Parseval’s theorem to relate time-domain RMS to frequency-domain coefficients.',
      'Predict how a linear filter changes the amplitude of each harmonic.',
      'Recognise the THD of a distorted waveform and what causes it.',
      'Explain why grid harmonics from non-linear loads matter for transformers and motors.',
    ],
    timeToRead: 30,
    prereqs: ['circuits-and-ac'],
    tracks: ['bench', 'rigor'],
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
    punchline:
      'Transfer functions compress filters to two straight lines, op-amps with feedback turn gain into a resistor ratio, and transmission lines kick in the moment a wire is no longer a single node.',
    objectives: [
      'Sketch the Bode plot of a first-order RC or RL filter and identify the corner frequency.',
      'Design inverting and non-inverting op-amp gain stages with given resistor values.',
      'Recognise when feedback fails and an op-amp circuit oscillates or saturates.',
      'Compute the characteristic impedance Z₀ of a transmission line from L and C per unit length.',
      'Determine when lumped circuit analysis breaks down and a distributed model is required.',
    ],
    timeToRead: 35,
    prereqs: ['circuits-and-ac', 'semiconductors'],
    tracks: ['bench', 'rigor'],
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
    punchline:
      'εᵣ comes from bound charges shifting and aligning inside molecules; μᵣ comes from spin and orbital moments arranging themselves in domains.',
    objectives: [
      'Distinguish bound charge from free charge and predict polarization P in a dielectric.',
      'Relate susceptibility, permittivity, and dielectric constant.',
      'Classify a material as diamagnetic, paramagnetic, or ferromagnetic based on its response.',
      'Read a B–H hysteresis loop and identify coercivity and remanence.',
      'Predict how iron concentrates flux while copper does not.',
    ],
    timeToRead: 30,
    prereqs: ['capacitors', 'magnetism'],
    tracks: ['rigor'],
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
    punchline:
      'Optics is electromagnetism at 10¹⁴ Hz — boundary conditions on E and B at a glass surface generate Snell, Brewster, Fresnel, and the rest of classical optics for free.',
    objectives: [
      'Derive Snell’s law from boundary conditions on the EM field.',
      'Apply Fresnel equations to predict reflection and transmission coefficients.',
      'Identify Brewster’s angle and explain why polarized sunglasses reduce glare.',
      'Predict thin-film interference colours from wavelength and film thickness.',
      'Sketch the basic operation of a laser as stimulated emission in a resonator.',
    ],
    timeToRead: 30,
    prereqs: ['em-waves'],
    tracks: ['rigor'],
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
    punchline:
      'An antenna is a length of wire whose current pattern radiates a known field — pick the geometry to pick the beam.',
    objectives: [
      'Sketch the dipole radiation pattern (sin²θ) and identify its nulls and maxima.',
      'Apply the Friis transmission equation to compute received signal power.',
      'Predict antenna gain from aperture or array element count.',
      'Distinguish near-field from far-field regions around a transmitter.',
      'Recognise common antenna families (dipole, Yagi, parabolic, phased array).',
    ],
    timeToRead: 30,
    prereqs: ['em-waves'],
    tracks: ['rigor'],
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
    punchline:
      'The Lorentz force on a current-carrying coil in a B-field is a torque — commutation is the engineering art of keeping that torque pushing the same way as the coil rotates.',
    objectives: [
      'Compute the torque on a current loop in a uniform magnetic field.',
      'Distinguish the commutation strategies of brushed, brushless, induction, and synchronous motors.',
      'Predict back-EMF from rotor speed and recognise its role as a self-limiter.',
      'Read a torque–speed curve and identify the operating point under a given load.',
      'Recognise where each motor family is preferred in industry.',
    ],
    timeToRead: 30,
    prereqs: ['magnetism', 'induction'],
    tracks: ['rigor'],
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
    punchline:
      'Run a motor backwards and you have a generator — three of them on one shaft gives 3-phase, and tens of thousands of them in lockstep give the continental grid.',
    objectives: [
      'Predict the EMF of a coil rotating in a uniform magnetic field.',
      'Explain why a generator’s output is naturally sinusoidal.',
      'Trace the three-phase output of a synchronous machine and its 120° offsets.',
      'Recognise the role of governors and exciters in maintaining grid frequency and voltage.',
      'Identify the difference between a synchronous and an asynchronous generator.',
    ],
    timeToRead: 25,
    prereqs: ['induction', 'motors'],
    tracks: ['rigor'],
  },
  {
    slug: 'magnetically-coupled-circuits',
    number: 22,
    title: 'Magnetically coupled circuits',
    subtitle: 'When one coil makes another coil care.',
    blurb:
      "Ch.7 handled a single coil and its self-inductance. The grown-up version of induction lives in two coils sharing a magnetic field: mutual inductance M, the coupling coefficient k, the dot convention that keeps the signs honest, and the T-equivalent and reflected-impedance tricks that let you analyse coupled circuits without writing a flux integral. The math that transformers, wireless chargers, current probes, and RFID readers all rely on.",
    relatedLabs: ['faraday', 'inductance'],
    sources: [
      'henry-1832', 'faraday-1832', 'maxwell-1865', 'maxwell-1873',
      'griffiths-2017', 'jackson-1999', 'feynman-II-17',
      'hayt-kemmerly-durbin-2018', 'irwin-circuit-analysis-2015',
      'horowitz-hill-2015', 'codata-2018',
    ],
    punchline:
      'Two coils sharing flux are described by mutual inductance M and coupling coefficient k — the dot convention keeps signs honest, and reflected impedance handles everything else.',
    objectives: [
      'Compute mutual inductance M for a pair of coupled coils.',
      'Apply the dot convention to determine the polarity of induced voltage.',
      'Compute the coupling coefficient k = M/√(L₁L₂) for a coil pair.',
      'Reduce a coupled circuit using reflected impedance into the primary.',
      'Translate between physical coupling and the T-equivalent network.',
    ],
    timeToRead: 25,
    prereqs: ['induction'],
    tracks: ['bench', 'rigor'],
  },
  {
    slug: 'transformers',
    number: 23,
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
    punchline:
      'Two coils on a shared iron core trade voltage for current by the turns ratio — the device that made long-distance power transmission possible.',
    objectives: [
      'Apply the ideal transformer voltage and current ratios V₂/V₁ = N₂/N₁ and I₂/I₁ = N₁/N₂.',
      'Predict reflected impedance through a transformer.',
      'Identify core loss, copper loss, and leakage inductance in a real transformer.',
      'Sketch the equivalent circuit including magnetizing branch and series leakage.',
      'Explain why grid transmission uses step-up to hundreds of kV.',
    ],
    timeToRead: 30,
    prereqs: ['magnetically-coupled-circuits'],
    tracks: ['bench', 'rigor'],
  },
  {
    slug: 'rectifiers-and-inverters',
    number: 24,
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
    punchline:
      'Rectifiers fold AC down to DC, inverters shape DC back into AC, and switched-mode topologies use a fast switch plus an L or C to step voltage with almost no heat.',
    objectives: [
      'Sketch the output of a half-wave and full-wave bridge rectifier driving a capacitor.',
      'Compute ripple voltage for a given load current and reservoir capacitance.',
      'Identify buck, boost, and flyback topologies and predict their voltage conversion ratios.',
      'Explain how a grid-tie inverter synthesises a 60 Hz sine from PV-panel DC.',
      'Pick the right power-semiconductor family (diode, SCR, MOSFET, IGBT) for a given switching speed.',
    ],
    timeToRead: 30,
    prereqs: ['semiconductors', 'filters-op-amps-tlines'],
    tracks: ['bench', 'rigor'],
  },
  {
    slug: 'batteries',
    number: 25,
    title: 'How a battery works',
    subtitle: 'Chemistry that keeps a voltage on the wires.',
    blurb:
      "Volta stacked discs of copper and zinc with cardboard soaked in brine in 1800 and produced a current that lasted. The chemistry inside a single cell — half-reactions, the Nernst equation, the role of the electrolyte — explains every battery that ever existed. We will build that cell from scratch and watch its voltage land on the predicted number.",
    relatedLabs: ['potential', 'ohms-law'],
    sources: [
      'volta-1800-pile', 'nernst-1889', 'daniell-1836',
      'bard-faulkner-2001', 'griffiths-2017', 'codata-2018',
    ],
    punchline:
      'A battery is two half-reactions separated by an electrolyte — the energy difference between the two redox couples is the cell voltage, predicted exactly by the Nernst equation.',
    objectives: [
      'Identify the half-reactions at the anode and cathode of a galvanic cell.',
      'Compute open-circuit voltage from standard electrode potentials.',
      'Apply the Nernst equation to predict voltage at non-standard concentrations.',
      'Distinguish primary (non-rechargeable) from secondary (rechargeable) cells.',
      'Recognise the role of the electrolyte and separator in cell operation.',
    ],
    timeToRead: 25,
    prereqs: ['voltage-and-current'],
    tracks: ['rigor'],
  },
  {
    slug: 'modern-batteries',
    number: 26,
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
    punchline:
      'From lead-acid through Li-ion to solid-state, flow, and fuel cells, the chemistry varies but every cell still trades electron energy across two half-reactions.',
    objectives: [
      'Compare the energy density of lead-acid, NiMH, and Li-ion chemistries.',
      'Explain the intercalation mechanism that lets a Li-ion cell cycle thousands of times.',
      'Distinguish a battery from a supercapacitor by their charge-storage mechanisms.',
      'Recognise the architectural differences of a flow battery versus a sealed cell.',
      'Identify why solid-state cells promise higher energy density and improved safety.',
    ],
    timeToRead: 25,
    prereqs: ['batteries'],
    tracks: ['rigor'],
  },

  /* ─── Applied track: how your house actually works ─── */

  {
    slug: 'house-grid-arrives',
    number: 27,
    title: 'The grid arrives at your meter',
    subtitle: 'From substation to service drop to revenue meter.',
    blurb:
      "The last mile of the power grid: how three-phase transmission steps down through a distribution transformer on a pole or pad to the single-phase 240 V split that enters most North American homes, why neutral is bonded to ground at the service entrance, and what the rotating disk or LCD on your meter is actually measuring.",
    relatedLabs: ['ohms-law', 'joule'],
    sources: [
      'ansi-c84-1-2020', 'nec-2023', 'ieee-std-3001-2-2017',
      'grainger-power-systems-2003', 'codata-2018',
    ],
    punchline:
      'The three-phase grid steps down through one final transformer on a pole or pad into a 240 V split-phase service that lands at your meter base — that is the first piece of electricity you actually own.',
    objectives: [
      'Trace the path of power from a substation to your meter and name each step.',
      'Explain why North-American residential service is 240 V split-phase with a centre-tap neutral.',
      'Describe what a kilowatt-hour meter measures and how it computes accumulated energy.',
      'Predict the consequences of an open neutral on the service entrance.',
    ],
    timeToRead: 25,
    prereqs: ['voltage-and-current', 'transformers'],
    tracks: ['practical'],
  },
  {
    slug: 'house-panel',
    number: 28,
    title: 'Inside the panel',
    subtitle: 'Bus bars, breakers, and the geometry of safety.',
    blurb:
      'The main service panel is just two bus bars, a neutral bar, a ground bar, and a stack of breakers — yet it encodes every safety rule for the building. Why two hots are 180° out of phase, how a 240 V breaker straddles both bus stabs, what AFCI / GFCI / standard breakers detect, and the bonding/grounding logic that keeps fault current finding the panel rather than you.',
    relatedLabs: ['ohms-law', 'joule', 'resistance'],
    sources: [
      'nec-2023', 'nema-ab-1', 'ul-489', 'square-d-qo-datasheet',
      'eaton-br-datasheet', 'codata-2018',
    ],
    punchline:
      'Two bus bars, two phases, a neutral bar, a ground bar, and a stack of breakers — the whole geometry of household electrical safety is in there.',
    objectives: [
      'Identify every component inside a residential service panel.',
      'Explain why a 240 V breaker straddles both bus stabs.',
      'Distinguish the trip mechanisms of standard, GFCI, and AFCI breakers.',
      'Trace a fault current from a short-circuited appliance back to the panel and out through the ground rod.',
    ],
    timeToRead: 30,
    prereqs: ['house-grid-arrives'],
    tracks: ['practical'],
  },
  {
    slug: 'house-branch-circuits',
    number: 29,
    title: 'Branch circuits',
    subtitle: 'Wires sized to keep their copper from melting.',
    blurb:
      'A branch circuit is a length of wire from a breaker to a string of outlets and back. The breaker amperage, the conductor gauge, the conduit fill, and the wire insulation are all chosen together — pick one wrong and the wire melts before the breaker trips. The full chain: ampacity tables, NM-B/UF-B/THHN, voltage drop over a long run, and why kitchens want their own 20 A circuit.',
    relatedLabs: ['ohms-law', 'resistance', 'joule'],
    sources: [
      'nec-2023', 'nec-2017-aluminum', 'codata-2018',
      'awg-table-nec', 'nfpa-70e-2024',
    ],
    punchline:
      'A branch circuit is a length of wire that has to stay cool enough not to melt while the breaker stays slow enough not to nuisance-trip.',
    objectives: [
      'Pick the correct breaker size and wire gauge for a given load profile.',
      'Compute voltage drop over a long run and decide when to upsize the wire.',
      'Distinguish NM-B, UF-B, and THHN by jacket, environment, and ampacity rating.',
      'Explain why kitchens and bathrooms get dedicated 20 A circuits.',
    ],
    timeToRead: 30,
    prereqs: ['house-panel'],
    tracks: ['practical'],
  },
  {
    slug: 'house-switches-receptacles',
    number: 30,
    title: 'Receptacles, switches, and the three-way puzzle',
    subtitle: 'How the wire becomes a useable outlet — and why two switches confuse everyone.',
    blurb:
      'Inside a wall box: hot, neutral, ground, and the three brass / silver / green screw colours that make sense once you see them. Single-pole switches, three-way pairs, four-way mid-loop switches, dimmers, and smart switches. Plus the NEMA receptacle family — 5-15, 5-20, 6-15, 14-30, 14-50 — and how you can read which one to use from the device that needs power.',
    relatedLabs: ['ohms-law', 'circuit-builder'],
    sources: [
      'nec-2023', 'nema-wd-6', 'ul-498',
      'lutron-dimmer-app-note', 'codata-2018',
    ],
    punchline:
      'Two three-way switches at the top and bottom of a stairwell look impossible until you see the two travellers between them — then it is just a simple two-state machine.',
    objectives: [
      'Wire a single-pole, three-way, and four-way switch correctly given the box and load positions.',
      'Identify a NEMA receptacle pattern and predict what plug fits it.',
      'Explain how a leading-edge phase-cut dimmer dims an incandescent bulb without overheating.',
      'Trace the hot / neutral / ground path through a daisy-chained string of duplex receptacles.',
    ],
    timeToRead: 35,
    prereqs: ['house-branch-circuits'],
    tracks: ['practical'],
  },
  {
    slug: 'house-big-loads',
    number: 31,
    title: 'Big loads — dryers, ranges, EVs, heat pumps',
    subtitle: 'Why some outlets need both hots and no neutral.',
    blurb:
      'A 120 V circuit uses one hot and a neutral; a 240 V circuit uses two hots that are 180° out of phase and (sometimes) no neutral at all. Dryers, electric ranges, heat pumps, hot tubs, and EV chargers all live on this side of the panel. The cause-and-effect of demand-load calculations, why the panel may need an upgrade for an EV, and the difference between a 14-30 (dryer) and a 14-50 (range / level-2 EV).',
    relatedLabs: ['joule', 'circuit-builder'],
    sources: [
      'nec-2023', 'sae-j1772', 'ul-2231',
      'iec-62196', 'codata-2018', 'grainger-power-systems-2003',
    ],
    punchline:
      'A 240 V appliance taps the panel between two hots that are exactly out of phase — twice the voltage, half the current, no neutral required for the main load.',
    objectives: [
      'Compute the demand load for a residential panel given a fixed load profile.',
      'Explain why a heat-pump dryer can use a 120 V outlet while a resistive dryer cannot.',
      'Distinguish SAE J1772 (level 1 / 2 AC) from CCS (level 3 DC fast) EV charging.',
      'Decide whether a panel can host a new 14-50 EV outlet or needs a service upgrade.',
    ],
    timeToRead: 35,
    prereqs: ['house-panel', 'house-branch-circuits'],
    tracks: ['practical'],
  },
  {
    slug: 'house-safety',
    number: 32,
    title: 'Safety and what kills you',
    subtitle: 'Current, not voltage. And the milliseconds that matter.',
    blurb:
      "What current through a human body actually does, why GFCIs trip at 5 mA in 25 ms, what an arc-fault circuit interrupter listens for, why a bird on a single high-voltage line is fine but a squirrel that bridges two lines is not, and how PPE arc-flash ratings work. The Dalziel current-through-heart curves are the real safety standard; voltage is a proxy.",
    relatedLabs: ['ohms-law', 'joule'],
    sources: [
      'iec-60479-2018', 'dalziel-1956', 'nfpa-70e-2024',
      'nec-2023', 'osha-1910-269', 'codata-2018',
    ],
    punchline:
      'Voltage gets the headlines; current through the heart is what actually kills you. 100 mA at 60 Hz for one second is the canonical lethal dose.',
    objectives: [
      'Read the Dalziel current-vs-time threshold chart and locate the let-go, ventricular-fibrillation, and tissue-burn regions.',
      'Explain the trip mechanism of a GFCI and the 5 mA / 25 ms standard.',
      'Distinguish series-arc faults (AFCI domain) from parallel-arc faults.',
      'Decide what PPE arc-flash category is required for a given fault energy.',
    ],
    timeToRead: 30,
    prereqs: ['house-panel', 'house-branch-circuits'],
    tracks: ['practical'],
  },
  {
    slug: 'house-smart-meter',
    number: 33,
    title: 'The smart meter and the bill',
    subtitle: 'What is measured, what is billed, and how net metering works.',
    blurb:
      'Modern meters measure real energy (kWh), apparent energy (kVAh), reactive energy (kVARh), and demand peaks (kW max over a 15-min window). Time-of-use rates charge different prices at different hours. Net metering credits your solar exports at the prevailing rate or a fixed buyback. Power-factor penalties hit industrial customers but rarely residential ones.',
    relatedLabs: ['joule'],
    sources: [
      'ansi-c12-1-2014', 'ansi-c12-20-2015', 'ieee-1547-2018',
      'codata-2018', 'grainger-power-systems-2003',
    ],
    punchline:
      'Your meter measures four different "energies" at once; only one of them shows up on the bill — and which one depends on whether you are a house or a factory.',
    objectives: [
      'Distinguish real, reactive, and apparent power from a meter readout.',
      'Read a time-of-use schedule and predict which hours are most expensive.',
      'Explain how a bidirectional meter handles solar export and the difference between net metering and feed-in tariffs.',
      'Decide whether a residential customer pays for power-factor correction (almost never).',
    ],
    timeToRead: 25,
    prereqs: ['house-grid-arrives'],
    tracks: ['practical'],
  },
  {
    slug: 'house-plug-to-chip',
    number: 34,
    title: 'From plug to chip',
    subtitle: 'The seven conversions that get 1 V to your CPU.',
    blurb:
      "Follow the power inside your laptop charger and laptop. Wall AC → C13 → input filter → bridge rectifier → bulk cap → flyback transformer at ~100 kHz → secondary rectifier → 20 V DC → cable → power-delivery negotiation → buck converter to 5 V/3.3 V/1.8 V/1.1 V → on-die LDOs to 0.8 V at the CPU rail. Every chapter of this textbook converges on the inside of one cable.",
    relatedLabs: ['joule', 'capacitance', 'inductance', 'circuit-builder'],
    sources: [
      'erickson-maksimovic-2020', 'horowitz-hill-2015',
      'usb-pd-r3', 'sedra-smith-2014', 'codata-2018',
    ],
    punchline:
      'Your laptop runs at less than 1 V; the wall delivers 120 V AC. Seven separate power conversions sit between them — and each one is a chapter of this textbook.',
    objectives: [
      'Name and order the seven conversion stages from wall AC to CPU rail.',
      'Identify which stage causes which efficiency loss in a typical 90 W laptop charger.',
      'Explain how USB-PD negotiates a voltage between source and sink in milliseconds.',
      'Predict what happens to a CPU when the on-die LDO regulating its core voltage fails.',
    ],
    timeToRead: 35,
    prereqs: ['rectifiers-and-inverters', 'semiconductors'],
    tracks: ['practical', 'bench'],
  },
  {
    slug: 'house-replacing-fixtures',
    number: 35,
    title: 'Replacing outlets, switches, and fixtures',
    subtitle: 'The most common repair, done so it stays done.',
    blurb:
      "The first repair every DIYer does and most do wrong at least once. How to verify dead, undo a backstab without snapping the screw, distinguish a switch-leg from a hot-leg, ground a metal box, replace a 5-15 with a tamper-resistant or GFCI, swap a single-pole switch for a smart dimmer, hang a paddle fan without breaking the ceiling-box weight rating. Every step pinned to the theory you already have plus the NEC clauses that apply.",
    relatedLabs: ['ohms-law', 'resistance'],
    sources: [
      'nec-2023', 'nfpa-70e-2024', 'ul-498', 'nema-wd-6',
      'lutron-dimmer-app-note', 'iec-60479-2018', 'codata-2018',
    ],
    punchline:
      'A 9-V battery proves a circuit is dead better than your eyes do — and the right way to pigtail a daisy-chained outlet is the difference between a junction and a fire.',
    objectives: [
      'Verify a circuit is dead with a non-contact tester plus a two-pole probe.',
      'Identify a switch leg vs a hot leg from the box wiring alone.',
      'Replace a standard duplex, a GFCI, a smart switch, and a paddle fan without violating NEC 314 box-fill or 250 grounding.',
      'Decide when to pigtail vs daisy-chain, and why daisy-chaining loads through a device wears it out.',
      'Apply NEC 404.2(C) (neutral in every switch box) to a smart-switch retrofit.',
    ],
    timeToRead: 35,
    prereqs: ['house-switches-receptacles'],
    tracks: ['practical'],
  },
  {
    slug: 'house-troubleshooting',
    number: 36,
    title: 'Troubleshooting: the meter and the flowchart',
    subtitle: 'Why is this outlet dead? A diagnosis tree.',
    blurb:
      "A working multimeter is half the toolkit; the diagnostic flowchart is the other half. Non-contact voltage testers, two-pole probes, the DMM, and the clamp meter — what each one actually measures and the trap each one sets. Phantom voltage. The 'is it the breaker, the GFCI upstream, the loose neutral, or the burnt backstab?' branching tree. A whole chapter on not jumping to conclusions.",
    relatedLabs: ['ohms-law', 'circuit-builder'],
    sources: [
      'nec-2023', 'ul-498', 'horowitz-hill-2015',
      'keysight-34465a-datasheet', 'iec-60479-2018', 'codata-2018',
    ],
    punchline:
      'Half of every electrical bug looks like the breaker. The other half looks like the breaker, but isn\'t.',
    objectives: [
      'Choose the right meter (NCVT, two-pole, DMM, clamp) for the question at hand.',
      'Recognise phantom voltage and explain why a 1 MΩ DMM reads "120 V" on a dead floating wire.',
      'Apply the four-step diagnostic flow: panel → branch → device → load.',
      'Distinguish a tripped GFCI / AFCI / thermal-magnetic breaker from a true short.',
      'Read a clamp meter\'s amp reading and infer the load it represents.',
    ],
    timeToRead: 35,
    prereqs: ['house-switches-receptacles', 'house-panel'],
    tracks: ['practical'],
  },
  {
    slug: 'house-new-circuit',
    number: 37,
    title: 'Adding a new branch circuit',
    subtitle: 'Panel knockout to wall plate, in twelve steps.',
    blurb:
      "How a working electrician adds a 20 A circuit from the panel to a new receptacle: load calculation, breaker choice, wire size, NM-B vs MC vs conduit, drilling studs (NEC 300.4), stapling cable, ganging a new box (NEC 314), making up the connections, landing on the bus. Each step grounded in the theory chapter that proves why the rule exists.",
    relatedLabs: ['ohms-law', 'resistance', 'joule'],
    sources: [
      'nec-2023', 'ul-498', 'nfpa-70e-2024', 'nema-wd-6',
      'grainger-power-systems-2003', 'codata-2018',
    ],
    punchline:
      'A new circuit is sized backward: pick the device, the device picks the wire, the wire picks the breaker, the breaker picks the panel slot.',
    objectives: [
      'Run an NEC 220.82 demand calculation to confirm panel headroom for a new circuit.',
      'Size conductor and breaker for a known continuous + non-continuous load.',
      'Choose between NM-B (Romex), MC, or EMT for a given install path.',
      'Apply NEC 300.4 hole protection and NEC 314.16 box-fill calculations on a 4-conductor 12 AWG box.',
      'Land the new circuit at the panel without violating bus-bar ratings or AIC.',
    ],
    timeToRead: 40,
    prereqs: ['house-panel', 'house-branch-circuits'],
    tracks: ['practical'],
  },
  {
    slug: 'house-smart-retrofits',
    number: 38,
    title: 'Smart-switch retrofits',
    subtitle: 'Wi-Fi, Z-Wave, Matter, and the no-neutral problem.',
    blurb:
      "The retrofit market has its own ecology. Lutron Caséta (proprietary 434 MHz, works without a neutral via the bleeder). Z-Wave (sub-GHz mesh). Zigbee (2.4 GHz mesh). Matter over Thread (the new convergence). And the structural NEC 404.2(C) requirement of a neutral in every switch box that finally caught up with smart switches. Three-way smart pairs, dimmable-LED phase choice (leading vs trailing), and what 'companion' vs 'add-on' means.",
    relatedLabs: ['ohms-law', 'inductance'],
    sources: [
      'nec-2023', 'lutron-dimmer-app-note', 'ul-498',
      'nema-wd-6', 'horowitz-hill-2015', 'codata-2018',
    ],
    punchline:
      'A smart switch is a radio plus a triac plus a 30 mW microcontroller — and the most interesting design trade is how it stays powered when the load is off.',
    objectives: [
      'Identify a smart-switch family from its radio spec (Caséta / Z-Wave / Zigbee / Matter+Thread).',
      'Explain how a no-neutral smart switch steals power through the load and why it limits to LED loads above ~25 W.',
      'Wire a smart 3-way using the manufacturer\'s companion-switch traveler protocol rather than NEC 3-way conventions.',
      'Match a leading-edge vs trailing-edge dimmer to a given LED driver type.',
      'Diagnose the most common smart-switch failure modes: ghost light from leakage current, intermittent radio dropout from metal boxes.',
    ],
    timeToRead: 35,
    prereqs: ['house-switches-receptacles', 'house-replacing-fixtures'],
    tracks: ['practical'],
  },
  {
    slug: 'house-outdoor-wet',
    number: 39,
    title: 'Outdoor, wet locations, and EV chargers',
    subtitle: 'Where the code stops trusting humans entirely.',
    blurb:
      "Outdoor receptacles (WR-rated, in-use covers, GFCI), pool and hot-tub bonding (NEC 680 equipotential grid), landscape lighting (low-voltage transformers), and the modern centerpiece: the hardwired Level-2 EV charger on a NEMA 14-50 or dedicated 60 A run. Every wet-location rule is calibrated to keep current out of a human standing in damp soil — and the bonding grid around a pool is one of the most precise applications of equipotential physics you will ever install.",
    relatedLabs: ['ohms-law', 'joule'],
    sources: [
      'nec-2023', 'sae-j1772', 'ul-2231', 'iec-62196',
      'iec-60479-2018', 'codata-2018',
    ],
    punchline:
      'A pool\'s equipotential bonding grid is Ch.32 made literal: weld every metal surface within 1.5 m of the water to the same potential and the swimmer\'s body cannot become a parallel path.',
    objectives: [
      'Identify a WR / TR receptacle and the in-use vs flat-cover rules of NEC 406.9.',
      'Map a pool equipotential bonding grid per NEC 680.26 and explain the safety physics.',
      'Choose between hardwired vs NEMA 14-50 plug-in for a Level-2 EV charger; size the circuit and conduit.',
      'Apply NEC 210.8 GFCI requirements to every receptacle you can think of (kitchen, bath, outdoor, garage, basement, pool, laundry, dishwasher).',
      'Install landscape-lighting low-voltage transformers without violating NEC 411.',
    ],
    timeToRead: 35,
    prereqs: ['house-big-loads', 'house-safety'],
    tracks: ['practical'],
  },
  {
    slug: 'house-surge-grounding',
    number: 40,
    title: 'Surge protection and the grounding electrode system',
    subtitle: 'The two physical structures that keep the house alive in a strike.',
    blurb:
      "A lightning strike can put 10 kA on the service drop for 20 µs. The grounding electrode system (ground rod, Ufer, water bond), the bonding jumper, and the layered SPD installation (Type 1 ahead of the meter, Type 2 inside the panel, Type 3 at sensitive loads per UL 1449) divert that surge to dirt without letting it cook the wiring or the equipment. Plus generator interlocks, transfer switches, and what 'isolated ground' actually means.",
    relatedLabs: ['joule', 'ohms-law', 'capacitance'],
    sources: [
      'nec-2023', 'ul-1449', 'ieee-c62-41', 'nfpa-70e-2024',
      'iec-60479-2018', 'codata-2018',
    ],
    punchline:
      'A surge protector does not stop a lightning strike — it gives the strike a much cheaper path to ground than your refrigerator.',
    objectives: [
      'Distinguish Type 1, Type 2, and Type 3 SPDs and where each goes (UL 1449).',
      'Size the grounding electrode conductor per NEC 250.66 from the service-entrance ampacity.',
      'Explain why two ground rods 6 ft apart beat one ground rod for transient impedance, even if either alone tests at <25 Ω.',
      'Wire a generator interlock kit and identify the failure mode it prevents (back-feed to the line).',
      'Read an SPD\'s "let-through voltage" spec and predict the residual at the protected load.',
    ],
    timeToRead: 35,
    prereqs: ['house-safety', 'house-panel'],
    tracks: ['practical'],
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
