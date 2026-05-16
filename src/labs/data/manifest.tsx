/**
 * The textbook's table of contents.
 *
 * One entry per lab. Single source of truth for chapter ordering,
 * route slugs, equation text, hero headlines, and prev/next links.
 *
 * Each `slug` corresponds to a route at /labs/{slug}.
 */

import type { ReactNode } from 'react';
import { Formula } from '@/components/Formula';
import type { SourceKey } from '@/lib/sources';
import { FORMULAS } from '@/lib/formulas';

export type ChapterId = 'ch1' | 'ch2' | 'ch3' | 'ch4';

export interface LabManifestEntry {
  /** "1.1", "1.2", ..., "4.4" */
  number: string;
  /** URL slug, e.g. "coulomb" → /labs/coulomb */
  slug: string;
  /** Chapter the lab belongs to */
  chapter: ChapterId;
  /** Short title (used in TOC + nav titles) */
  title: string;
  /** Equation displayed in TOC and hero */
  formula: ReactNode;
  /** One-line blurb for the TOC */
  blurb: string;
  /** Hero label, e.g. "Chapter 1 · Lab 1.1 — Coulomb's Law" */
  heroLabel: string;
  /** Hero headline JSX. Use <em className="italic font-normal text-accent"> for accent italic. */
  heroHeadline: ReactNode;
  /** Deck (2–3 sentence positioning) */
  deck: string;
}

export const CHAPTER_META: Record<ChapterId, { title: string; eyebrow: string; blurb: string }> = {
  ch1: {
    eyebrow: 'Chapter I',
    title: 'Electric Field',
    blurb:
      "Static charges build a field that fills space. From Coulomb's force law to the line integral that defines voltage.",
  },
  ch2: {
    eyebrow: 'Chapter II',
    title: 'Magnetic Field',
    blurb:
      "Moving charges create circulation. From Biot–Savart to Faraday's law — the rotational half of electromagnetism.",
  },
  ch3: {
    eyebrow: 'Chapter III',
    title: 'Conduction',
    blurb:
      'What happens when fields drive charges through real materials. Drift, Ohm, resistance, and where the heat comes from.',
  },
  ch4: {
    eyebrow: 'Chapter IV',
    title: 'Energy & Fields',
    blurb:
      'Capacitors store E. Inductors store B. Fields carry joules per cubic meter. Poynting names the flow.',
  },
};

export const MANIFEST: LabManifestEntry[] = [
  // ─── Chapter 1 — Electric Field ───
  {
    number: '1.1',
    slug: 'coulomb',
    chapter: 'ch1',
    title: "Coulomb's Law",
    formula: FORMULAS['coulomb-force'].plain,
    blurb: 'Two charges. One inverse-square law that holds across every order of magnitude.',
    heroLabel: "Chapter 1 · Lab 1.1 — Coulomb's Law",
    heroHeadline: (
      <>
        Two charges. <em className="text-accent font-normal italic">One inverse-square law.</em>
      </>
    ),
    deck: "The original electric-force equation, established empirically by Coulomb in 1785 with a torsion balance. Same algebraic shape as Newton's gravity, but at unit charge, ~10⁴² times stronger.",
  },
  {
    number: '1.2',
    slug: 'e-field',
    chapter: 'ch1',
    title: 'Field of a Point Charge',
    formula: FORMULAS['electric-field-point'].plain,
    blurb:
      'Replace "force between two charges" with "field set up by one." Faraday\'s decisive move.',
    heroLabel: 'Chapter 1 · Lab 1.2 — Field of a Point Charge',
    heroHeadline: (
      <>
        Charge tells space to <em className="text-accent font-normal italic">push back</em>.
      </>
    ),
    deck: "Faraday's insight: the field exists whether or not a test charge is there to feel it. Bring one in, and the force on it is qE. The wire and the air and the empty space alike are filled with this assignment.",
  },
  {
    number: '1.3',
    slug: 'gauss',
    chapter: 'ch1',
    title: "Gauss's Law",
    formula: FORMULAS['gauss-law'].plain,
    blurb:
      'Wrap any imaginary surface around any charge. Total flux equals charge inside, divided by ε₀.',
    heroLabel: "Chapter 1 · Lab 1.3 — Gauss's Law",
    heroHeadline: (
      <>
        Total flux pays the <em className="text-accent font-normal italic">enclosed charge</em>,
        nothing else.
      </>
    ),
    deck: "The flux through any closed surface depends only on what's inside it. The surface doesn't have to be regular. Symmetry plus this law gives E for spheres, lines, and slabs in one step.",
  },
  {
    number: '1.4',
    slug: 'potential',
    chapter: 'ch1',
    title: 'Potential Difference',
    formula: FORMULAS['voltage-line-integral'].plain,
    blurb: 'Voltage is a line integral. A property of the path between two points in a field.',
    heroLabel: 'Chapter 1 · Lab 1.4 — Potential Difference',
    heroHeadline: (
      <>
        Voltage is the work you'd do to{' '}
        <em className="text-accent font-normal italic">move a charge</em>.
      </>
    ),
    deck: 'Drag two charges. Drag two probes labelled A and B. The voltage between them is the line integral of E from one to the other — and it equals the energy per coulomb that the field gives or takes from a charge moving along that path.',
  },

  // ─── Chapter 2 — Magnetic Field ───
  {
    number: '2.1',
    slug: 'biot-savart',
    chapter: 'ch2',
    title: 'Biot–Savart Law',
    formula: <>dB = (μ₀ I / 4π) (dℓ × r̂) / r²</>,
    blurb: 'Each segment of current paints its own contribution to B. Sum them.',
    heroLabel: 'Chapter 2 · Lab 2.1 — Biot–Savart Law',
    heroHeadline: (
      <>
        Moving charge <em className="text-accent font-normal italic">paints</em> magnetic field.
      </>
    ),
    deck: 'For every infinitesimal segment of current, an infinitesimal contribution to B at every point in space. The cross product means B circles the current. Sum the contributions to get the total B anywhere.',
  },
  {
    number: '2.2',
    slug: 'ampere',
    chapter: 'ch2',
    title: "Ampère's Law",
    formula: (
      <>
        ∮ B · dℓ = μ₀ I<sub>enc</sub>
      </>
    ),
    blurb: 'The magnetic analog of Gauss. Symmetry collapses the integral.',
    heroLabel: "Chapter 2 · Lab 2.2 — Ampère's Law",
    heroHeadline: (
      <>
        <em className="text-accent font-normal italic">Symmetry</em> hands you the field for free.
      </>
    ),
    deck: 'Wrap an imaginary closed loop around a current. The line integral of B along that loop equals the enclosed current times μ₀. When the geometry is symmetric, this single equation gives you B without any integration over the source.',
  },
  {
    number: '2.3',
    slug: 'lorentz',
    chapter: 'ch2',
    title: 'Lorentz Force',
    formula: <>F = q (E + v × B)</>,
    blurb: 'The single equation defining what E and B do to a moving charge.',
    heroLabel: 'Chapter 2 · Lab 2.3 — Lorentz Force',
    heroHeadline: (
      <>
        Field turns charge in <em className="text-accent font-normal italic">circles</em>.
      </>
    ),
    deck: 'The complete force law on a charged particle. v × B gives a force perpendicular to both: it steers but never speeds. Add an E and you have the engine of every electric motor, CRT, and mass spectrometer.',
  },
  {
    number: '2.4',
    slug: 'faraday',
    chapter: 'ch2',
    title: "Faraday's Law",
    formula: (
      <>
        EMF = − dΦ<sub>B</sub> / dt
      </>
    ),
    blurb: 'Changing flux conjures voltage. The basis of every generator and transformer.',
    heroLabel: "Chapter 2 · Lab 2.4 — Faraday's Law",
    heroHeadline: (
      <>
        Changing field <em className="text-accent font-normal italic">conjures</em> voltage.
      </>
    ),
    deck: 'A changing magnetic flux through a closed loop induces an EMF around that loop. Move the magnet, spin the coil, change the current upstream — the rule is the same. Every generator on Earth runs on this equation.',
  },

  // ─── Chapter 3 — Conduction ───
  {
    number: '3.1',
    slug: 'ohms-law',
    chapter: 'ch3',
    title: "Ohm's Law (microscopic)",
    formula: <>J = σ E</>,
    blurb: 'Current density is proportional to field. The constant is the material itself.',
    heroLabel: "Chapter 3 · Lab 3.1 — Ohm's Law",
    heroHeadline: (
      <>
        Field pushes charge. <em className="text-accent font-normal italic">Conductivity</em> is how
        easy the push is.
      </>
    ),
    deck: 'Inside a conductor, current density J is proportional to the electric field E driving the charges, with conductivity σ as the constant. Apply a voltage, change the material, change the geometry — watch field, current, and resistance fall out at once.',
  },
  {
    number: '3.2',
    slug: 'resistance',
    chapter: 'ch3',
    title: 'Resistance',
    formula: <>R = ρ L / A</>,
    blurb: 'The wire-level lump of the microscopic law. Length adds, area divides.',
    heroLabel: 'Chapter 3 · Lab 3.2 — Resistance',
    heroHeadline: (
      <>
        Length adds, <em className="text-accent font-normal italic">area divides</em>.
      </>
    ),
    deck: "The macroscopic Ohm's-law variable. Take a piece of any conductor; its resistance is what its length and cross-section conspire to be, weighted by the material's resistivity. J = σE is local; R is what that becomes after geometry.",
  },
  {
    number: '3.3',
    slug: 'drift',
    chapter: 'ch3',
    title: 'Drift Velocity',
    formula: (
      <>
        v<sub>d</sub> = I / (n q A)
      </>
    ),
    blurb: 'Electrons crawl while the signal flies. The arithmetic forces drift to be tiny.',
    heroLabel: 'Chapter 3 · Lab 3.3 — Drift Velocity',
    heroHeadline: (
      <>
        Electrons move at the pace of a <em className="text-accent font-normal italic">glacier</em>.
      </>
    ),
    deck: 'Current is huge. Electrons are everywhere. The arithmetic forces drift to be tiny. Pick a material, set a current, watch the actual electron drift — and find out how many hours an electron needs to walk a single meter.',
  },
  {
    number: '3.4',
    slug: 'joule',
    chapter: 'ch3',
    title: 'Joule Heating',
    formula: <>P = I² R = V I = V²/R</>,
    blurb: 'Where the energy from the field ends up: heat in the lattice.',
    heroLabel: 'Chapter 3 · Lab 3.4 — Joule Heating',
    heroHeadline: (
      <>
        Electrons crash, <em className="text-accent font-normal italic">metal warms</em>.
      </>
    ),
    deck: 'All resistance dissipates power. The energy comes from the electric field; the lattice receives it as heat. Joule (1841) measured this carefully and got the unit named after him. Every heater, filament, and CPU cooler runs on I²R.',
  },

  // ─── Chapter 4 — Energy & Fields ───
  {
    number: '4.1',
    slug: 'capacitance',
    chapter: 'ch4',
    title: 'Capacitance',
    formula: FORMULAS['capacitance-parallel-plate'].plain,
    blurb: 'Stored charge per applied volt. Energy held in the gap field.',
    heroLabel: 'Chapter 4 · Lab 4.1 — Capacitance',
    heroHeadline: (
      <>
        Plates hold <em className="text-accent font-normal italic">charge in waiting</em>.
      </>
    ),
    deck: 'A capacitor stores energy by separating charge across a gap. The field between the plates holds joules per cubic meter; integrated over the gap volume, the total stored energy is ½CV². Capacitance is just “how much charge can you stack at a given voltage.”',
  },
  {
    number: '4.2',
    slug: 'inductance',
    chapter: 'ch4',
    title: 'Inductance',
    formula: <>V = − L dI/dt</>,
    blurb: 'Coils resist change. Energy stored in the magnetic field.',
    heroLabel: 'Chapter 4 · Lab 4.2 — Inductance',
    heroHeadline: (
      <>
        Coils <em className="text-accent font-normal italic">resist</em> change.
      </>
    ),
    deck: 'An inductor stores energy in its magnetic field. Try to change the current, and the inductor produces a back-EMF that opposes the change. Faraday’s law applied to a coil’s own magnetic flux.',
  },
  {
    number: '4.3',
    slug: 'energy-density',
    chapter: 'ch4',
    title: 'Field Energy Density',
    formula: <Formula tex="u = \tfrac{1}{2}\, \varepsilon_0\, E^2 + \dfrac{B^2}{2\mu_0}" />,
    blurb: 'Joules per cubic meter, stored in the field itself.',
    heroLabel: 'Chapter 4 · Lab 4.3 — Field Energy Density',
    heroHeadline: (
      <>
        <em className="text-accent font-normal italic">Empty space</em> stores energy.
      </>
    ),
    deck: 'Every cubic meter with a field in it carries energy at a density proportional to the field squared. The fields are not bookkeeping devices — they are physical, energy-bearing entities. This is the foundation of Poynting in the next lab.',
  },
  {
    number: '4.4',
    slug: 'poynting',
    chapter: 'ch4',
    title: 'Poynting Vector',
    formula: <>S = E × B / μ₀</>,
    blurb: 'Energy flows through space, not through copper. The whole book leads here.',
    heroLabel: 'Chapter 4 · Lab 4.4 — Poynting Vector',
    heroHeadline: (
      <>
        Energy flows <em className="text-accent font-normal italic">through space</em>, not through
        copper.
      </>
    ),
    deck: 'Around a current-carrying wire, E points along the axis and B circles it. Their cross product points radially inward — energy enters the wire from every direction at once. Integrate that flux over the wire’s lateral surface and you get exactly VI.',
  },

  // ─── Appendix — Sandboxes ───
  {
    number: 'A.1',
    slug: 'circuit-builder',
    chapter: 'ch3',
    title: 'Circuit Builder',
    formula: <>G v = i (Modified Nodal Analysis)</>,
    blurb:
      'Drag, drop, wire. A live SPICE-lite solver in the browser. Build any of the circuits from the rest of the textbook.',
    heroLabel: 'Appendix · Lab A.1 — Circuit Builder',
    heroHeadline: (
      <>
        Drag, drop, <em className="text-accent font-normal italic">solve</em>.
      </>
    ),
    deck: "A schematic editor with a live Modified Nodal Analysis solver. Drop batteries, resistors, capacitors, inductors, diodes, switches, and bulbs on a grid; click pin-to-pin to wire them. The solver runs Kirchhoff's laws every frame, integrating reactive components with trapezoidal companion models. Load a preset to see RC charging, an RLC resonator, or a half-wave rectifier.",
  },
  {
    number: 'A.2',
    slug: 'house-wiring',
    chapter: 'ch3',
    title: 'House Wiring Sandbox',
    formula: <>NEC 220.82 demand + 240.4 ampacity + 314.16 box fill</>,
    blurb:
      'Wire an entire house from the panel to every receptacle. The sandbox runs a live NEC audit and lets you trip breakers, simulate loads, and find the violations.',
    heroLabel: 'Appendix · Lab A.2 — House Wiring Sandbox',
    heroHeadline: (
      <>
        Wire a whole <em className="text-accent font-normal italic">house</em>.
      </>
    ),
    deck: 'A floorplan editor. Drop receptacles, switches, light fixtures, appliances onto rooms. Pick a panel size. Run NM-B cable from panel to each device. Add breakers (15/20/30/50 A; AFCI/GFCI/dual-function). The sandbox tracks per-circuit demand, voltage drop, box fill, and NEC compliance live. Turn on a kettle and microwave on the same 20 A circuit — watch the breaker trip. Built to test the full practical track (Ch.27–40) in one playground.',
  },
  {
    number: 'A.3',
    slug: 'motor-drive',
    chapter: 'ch2',
    title: 'Motor + Drive Sandbox',
    formula: (
      <>
        V<sub>dq</sub> = R i<sub>dq</sub> + L di<sub>dq</sub>/dt + ω L i<sub>dq</sub> + ω ψ
      </>
    ),
    blurb:
      'Pick a motor, pick a controller, pick a load profile. The sandbox simulates the full electro-mechanical loop: phase currents, torque, speed, efficiency map.',
    heroLabel: 'Appendix · Lab A.3 — Motor + Drive Sandbox',
    heroHeadline: (
      <>
        Drive a <em className="text-accent font-normal italic">motor</em>.
      </>
    ),
    deck: 'A bench for the complete motor + power-electronics chain. Choose a motor (brushed DC, BLDC, induction, PMSM, stepper); pick a controller (full-bridge PWM, 3-phase inverter with FOC, ESC with Hall sensors, micro-stepping driver); pick a load (constant torque, constant power, fan, regenerative). Watch torque/speed curves, phase-current waveforms, efficiency map, and the live control response as you tune the PI gains. Integrates Ch.14 (semiconductors), Ch.16 (filters / op-amps), Ch.20 (motors), Ch.24 (rectifiers + inverters).',
  },
  {
    number: 'A.4',
    slug: 'ev-bench',
    chapter: 'ch4',
    title: 'EV / Battery / Charger Bench',
    formula: (
      <>
        P<sub>wheel</sub> = P<sub>battery</sub> × η<sub>inv</sub> × η<sub>motor</sub> × η
        <sub>gearbox</sub>
      </>
    ),
    blurb:
      'A complete EV powertrain. Battery pack, BMS, onboard charger, EVSE, inverter, traction motor. Pick a drive cycle and watch state-of-charge, temperature, regen, range.',
    heroLabel: 'Appendix · Lab A.4 — EV Bench',
    heroHeadline: (
      <>
        Power an <em className="text-accent font-normal italic">EV</em>.
      </>
    ),
    deck: 'A bench for the full EV chain. Build a battery pack (cells in series and parallel; pick chemistry: NMC, LFP, NCA); add a BMS (cell balancing, current limit, thermal cut-out); add an onboard charger or DC-fast coupler; add an inverter; add a traction motor; pick a regen strategy. Run a drive cycle (city, highway, mountain) and watch SoC, cell temperatures, charging behaviour, and range. Integrates Ch.5 (capacitors), Ch.22 (mutual coupling), Ch.23 (transformers), Ch.24 (inverters), Ch.25–26 (batteries), Ch.31 (big loads), and the new Ch.41 (EV powertrain).',
  },
  {
    number: 'A.5',
    slug: 'power-grid',
    chapter: 'ch4',
    title: 'Power Grid Simulator',
    formula: (
      <>
        P<sub>loss</sub> = I² R · n<sub>lines</sub> + Σ generator droop
      </>
    ),
    blurb:
      'Build a whole grid: generators, transmission lines, transformers, loads. Trip a generator and watch system frequency dip; add storage and watch it ride through.',
    heroLabel: 'Appendix · Lab A.5 — Power Grid Simulator',
    heroHeadline: (
      <>
        Run a <em className="text-accent font-normal italic">grid</em>.
      </>
    ),
    deck: 'A one-line-diagram editor for power systems. Drop generators (coal, CCGT, hydro, wind, solar PV with inverter, battery storage); add step-up transformers, transmission lines with R + jX, sub-stations, distribution feeders, and residential / industrial loads. The sandbox solves a power-flow balance every step, evolves system frequency through the swing equation when a generator trips, and shows the voltage profile across the entire network. Integrates Ch.12 (AC + impedance), Ch.21 (generators + inertia), Ch.22 (mutual coupling), Ch.23 (transformers), Ch.24 (rectifiers + inverters for the renewables), Ch.31 (big loads).',
  },
  {
    number: 'A.6',
    slug: 'rf-link',
    chapter: 'ch4',
    title: 'RF Link / Antenna Matching',
    formula: (
      <>
        Γ = (Z<sub>ant</sub> − Z₀) / (Z<sub>ant</sub> + Z₀)
      </>
    ),
    blurb:
      'Build a complete radio hop: transmitter, coax, matching reactance, antenna gain, path loss, and received power.',
    heroLabel: 'Appendix · Lab A.6 — RF Link',
    heroHeadline: (
      <>
        Match an <em className="text-accent font-normal italic">antenna</em>.
      </>
    ),
    deck: 'A radio-link workbench. Pick a frequency, cable run, antenna impedance, matching reactance, gains, and path distance. The sandbox computes reflection coefficient, VSWR, mismatch loss, delivered antenna power, free-space path loss, and received power. Integrates Ch.12 (impedance), Ch.16 (transmission lines), Ch.19 (antennas), and Ch.8 (Poynting energy flow).',
  },
  {
    number: 'A.7',
    slug: 'power-supply',
    chapter: 'ch4',
    title: 'Power Supply Designer',
    formula: (
      <>
        ΔV ≈ I<sub>load</sub> / (f<sub>ripple</sub> C)
      </>
    ),
    blurb:
      'Design the transformer, rectifier, smoothing capacitor, regulator, and load for a practical AC-to-DC supply.',
    heroLabel: 'Appendix · Lab A.7 — Power Supply Designer',
    heroHeadline: (
      <>
        Build a <em className="text-accent font-normal italic">DC rail</em>.
      </>
    ),
    deck: 'A complete linear AC-to-DC supply. Choose transformer secondary voltage, rectifier topology, diode drop, reservoir capacitance, load current, and regulator target. Watch ripple, headroom, diode heating, regulator heating, and efficiency update live. Integrates Ch.5 (capacitors), Ch.7 (induction), Ch.23 (transformers), Ch.24 (rectifiers), and Ch.3 (Joule heating).',
  },
];

/** Lookup a lab by slug. */
export function getLab(slug: string): LabManifestEntry | undefined {
  return MANIFEST.find((l) => l.slug === slug);
}

/** Get the previous and next lab in the textbook order. */
export function getNeighbors(slug: string) {
  const idx = MANIFEST.findIndex((l) => l.slug === slug);
  return {
    prev: idx > 0 ? MANIFEST[idx - 1] : null,
    next: idx >= 0 && idx < MANIFEST.length - 1 ? MANIFEST[idx + 1] : null,
  };
}

/** Per-lab default sources to surface. Pages can extend with their own keys. */
export const BASE_LAB_SOURCES: Record<string, SourceKey[]> = {
  coulomb: [
    'coulomb-1785',
    'cavendish-1773',
    'williams-faller-hill-1971',
    'griffiths-2017',
    'codata-2018',
  ],
  'e-field': ['griffiths-2017', 'feynman-II-2', 'codata-2018', 'hyperphysics-emag'],
  gauss: ['gauss-1813', 'griffiths-2017', 'jackson-1999', 'feynman-II-2'],
  potential: ['feynman-II-2', 'griffiths-2017', 'libretexts-univ-physics'],
  'biot-savart': ['biot-savart-1820', 'feynman-II-13', 'griffiths-2017', 'jackson-1999'],
  ampere: ['ampere-1826', 'maxwell-1865', 'feynman-II-13', 'griffiths-2017'],
  lorentz: ['feynman-II-13', 'griffiths-2017', 'hall-1879', 'codata-2018'],
  faraday: ['faraday-1832', 'feynman-II-17', 'griffiths-2017'],
  'ohms-law': ['drude-1900', 'ashcroft-mermin-1976', 'crc-resistivity', 'libretexts-conduction'],
  resistance: ['ashcroft-mermin-1976', 'crc-resistivity', 'griffiths-2017', 'kanthal'],
  drift: ['drude-1900', 'ashcroft-mermin-1976', 'kittel-2005', 'libretexts-conduction'],
  joule: ['joule-1841', 'griffiths-2017', 'crc-resistivity', 'kanthal'],
  capacitance: ['griffiths-2017', 'jackson-1999', 'feynman-II-2', 'codata-2018'],
  inductance: ['griffiths-2017', 'feynman-II-17', 'jackson-1999', 'codata-2018'],
  'energy-density': ['poynting-1884', 'jackson-1999', 'griffiths-2017'],
  poynting: [
    'poynting-1884',
    'feynman-II-27',
    'davis-kaplan-2011',
    'morris-styer-2012',
    'jackson-1999',
  ],
  'circuit-builder': [
    'kirchhoff-1845',
    'ho-ruehli-brennan-1975',
    'nilsson-riedel-2018',
    'horowitz-hill-2015',
    'shockley-1949',
  ],
  'house-wiring': [
    'nec-2023',
    'nfpa-70e-2024',
    'ul-498',
    'nema-wd-6',
    'grainger-power-systems-2003',
    'codata-2018',
  ],
  'motor-drive': [
    'sedra-smith-2014',
    'erickson-maksimovic-2020',
    'horowitz-hill-2015',
    'griffiths-2017',
    'codata-2018',
  ],
  'ev-bench': [
    'sae-j1772',
    'iec-62196',
    'ul-2231',
    'erickson-maksimovic-2020',
    'sedra-smith-2014',
    'codata-2018',
  ],
  'power-grid': [
    'kirchhoff-1845',
    'grainger-power-systems-2003',
    'kundur-1994-power-stability',
    'horowitz-hill-2015',
    'codata-2018',
  ],
  'rf-link': [
    'pozar-2011',
    'balanis-2016',
    'friis-1946',
    'kraus-marhefka-2002',
    'feynman-II-21',
    'codata-2018',
  ],
  'power-supply': [
    'horowitz-hill-2015',
    'mohan-undeland-robbins-2003',
    'mclyman-2004',
    'fleming-1904',
    'codata-2018',
  ],
};
