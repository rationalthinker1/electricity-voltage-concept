/**
 * Per-chapter mastery quizzes.
 *
 * A quiz is a small set of 8–12 questions that gates "mastered" status
 * on a chapter. Quizzes are separate from the in-chapter `<TryIt>`
 * exercises (which are formative); these are summative.
 *
 * A passing score (default 80%) flips the chapter's status from `opened`
 * to `completed` and contributes to the track-completion percentage on
 * /tracks and /me. Attempts are stored in `localStorage.fieldTheoryProgress`.
 *
 * Each `explanation` field is shown to the reader after submission,
 * regardless of correctness. Cite only sources already present in the
 * chapter's `chapter.sources` array.
 */

import type { ReactNode } from 'react';
import type { ChapterSlug } from '@/textbook/data/chapters';
import { Cite } from '@/components/SourcesList';
import { Formula } from '@/components/Formula';
import { getChapter } from '@/textbook/data/chapters';

export type QuizQuestionType = 'multiple-choice' | 'true-false' | 'short-answer' | 'numeric';

export interface QuizQuestion {
  /** Stable per-quiz id, e.g. 'q1'. */
  id: string;
  type: QuizQuestionType;
  /** The question text (can include math, formulas, citations). */
  prompt: ReactNode;
  /** For multiple-choice / true-false. */
  choices?: ReactNode[];
  correctIndex?: number;
  /** For short-answer: accepted answer strings (lowercased + trimmed before compare). */
  acceptedAnswers?: string[];
  /** For numeric: target value, accepted relative tolerance (default 0.05). */
  targetValue?: number;
  tolerance?: number;
  unit?: string;
  /** Required explanation, shown after submission regardless of correctness. */
  explanation: ReactNode;
}

export interface ChapterQuiz {
  chapterSlug: ChapterSlug;
  /** 8–12 questions. */
  questions: QuizQuestion[];
  /** Score threshold (0–1) for marking the chapter complete. Default 0.8. */
  passingScore?: number;
}

export const DEFAULT_PASSING_SCORE = 0.8;

/* ────────────────────────────────────────────────────────────────────── */
/* Source-array shortcut. Each quiz cites only keys already present in    */
/* the corresponding chapter's `chapter.sources` array. Authors of future */
/* quizzes can write `sourcesFor('foo-slug')` rather than importing the   */
/* chapter manifest by hand.                                              */
/* ────────────────────────────────────────────────────────────────────── */

function sourcesFor(slug: ChapterSlug) {
  return getChapter(slug)?.sources ?? [];
}

const CH1_SOURCES = sourcesFor('what-is-electricity');
const CH2_SOURCES = sourcesFor('voltage-and-current');
const CH3_SOURCES = sourcesFor('resistance-and-power');
const CH4_SOURCES = sourcesFor('how-a-resistor-works');
const CH5_SOURCES = sourcesFor('capacitors');
const CH6_SOURCES = sourcesFor('magnetism');
const CH7_SOURCES = sourcesFor('induction');
const CH8_SOURCES = sourcesFor('energy-flow');
const CH9_SOURCES = sourcesFor('em-waves');
const CH10_SOURCES = sourcesFor('maxwell');
const CH11_SOURCES = sourcesFor('relativity');
const CH12_SOURCES = sourcesFor('circuits-and-ac');
const CH13_SOURCES = sourcesFor('network-analysis');
const CH14_SOURCES = sourcesFor('semiconductors');
const CH15_SOURCES = sourcesFor('fourier-harmonics');
const CH16_SOURCES = sourcesFor('filters-op-amps-tlines');
const CH17_SOURCES = sourcesFor('materials');
const CH18_SOURCES = sourcesFor('optics');
const CH19_SOURCES = sourcesFor('antennas');
const CH20_SOURCES = sourcesFor('motors');
const CH21_SOURCES = sourcesFor('generators');
const CH22_SOURCES = sourcesFor('magnetically-coupled-circuits');
const CH23_SOURCES = sourcesFor('transformers');
const CH24_SOURCES = sourcesFor('rectifiers-and-inverters');
const CH25_SOURCES = sourcesFor('batteries');
const CH26_SOURCES = sourcesFor('modern-batteries');
const CH27_SOURCES = sourcesFor('house-grid-arrives');
const CH28_SOURCES = sourcesFor('house-panel');
const CH29_SOURCES = sourcesFor('house-branch-circuits');
const CH30_SOURCES = sourcesFor('house-switches-receptacles');
const CH31_SOURCES = sourcesFor('house-big-loads');
const CH32_SOURCES = sourcesFor('house-safety');
const CH33_SOURCES = sourcesFor('house-smart-meter');
const CH34_SOURCES = sourcesFor('house-plug-to-chip');

/* ────────────────────────────────────────────────────────────────────── */
/* Ch.1 — Charge and field                                                */
/* ────────────────────────────────────────────────────────────────────── */

const CH1_QUIZ: ChapterQuiz = {
  chapterSlug: 'what-is-electricity',
  passingScore: 0.8,
  questions: [
    {
      id: 'q1',
      type: 'multiple-choice',
      prompt: <>Coulomb&rsquo;s law gives the magnitude of the force between two point charges. Which expression is correct?</>,
      choices: [
        <Formula key="a">F = k Q&#8321; Q&#8322; / r</Formula>,
        <Formula key="b">F = k Q&#8321; Q&#8322; / r&sup2;</Formula>,
        <Formula key="c">F = k (Q&#8321; + Q&#8322;) / r&sup2;</Formula>,
        <Formula key="d">F = k Q&#8321; Q&#8322; r&sup2;</Formula>,
      ],
      correctIndex: 1,
      explanation: (
        <>
          Coulomb&rsquo;s law is an inverse-square law: force falls off as 1/r&sup2; with distance and
          scales as the product of the two charges<Cite id="coulomb-1785" in={CH1_SOURCES} />.
        </>
      ),
    },
    {
      id: 'q2',
      type: 'multiple-choice',
      prompt: <>The electric field <strong>E</strong> at a point in space is defined as:</>,
      choices: [
        <>The force on a charge at that point.</>,
        <>The force per unit positive test charge at that point.</>,
        <>The work done to bring a charge from infinity to that point.</>,
        <>The charge density at that point.</>,
      ],
      correctIndex: 1,
      explanation: (
        <>
          The field is force-per-unit-charge: <strong>E = F/q</strong>. Its SI unit is N/C
          (equivalently V/m). It is defined as a property of <em>space</em>, independent of
          whether a test charge is actually there<Cite id="griffiths-2017" in={CH1_SOURCES} />.
        </>
      ),
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      prompt: <>Why does Coulomb&rsquo;s law fall off as 1/r&sup2; rather than 1/r or 1/r&sup3;?</>,
      choices: [
        <>Because charges repel proportionally to area.</>,
        <>Because the surface area of a sphere grows as r&sup2; in 3D space.</>,
        <>Because it was measured that way and there is no deeper reason.</>,
        <>Because the speed of light is finite.</>,
      ],
      correctIndex: 1,
      explanation: (
        <>
          The inverse-square law is geometry: field lines from a point charge spread over the
          surface of a sphere of area 4&pi;r&sup2;. The flux is conserved, so the density of lines
          (the field) must drop as 1/r&sup2;<Cite id="feynman-II-2" in={CH1_SOURCES} />.
        </>
      ),
    },
    {
      id: 'q4',
      type: 'multiple-choice',
      prompt: <>Far from a dipole (two equal and opposite charges separated by a small distance), the field magnitude falls off as:</>,
      choices: [
        <>1/r</>,
        <>1/r&sup2;</>,
        <>1/r&sup3;</>,
        <>1/r&#8308;</>,
      ],
      correctIndex: 2,
      explanation: (
        <>
          A dipole&rsquo;s near-cancellation makes its field drop faster than a single point charge.
          The leading term in the far-field expansion goes as 1/r&sup3;
          <Cite id="griffiths-2017" in={CH1_SOURCES} />.
        </>
      ),
    },
    {
      id: 'q5',
      type: 'true-false',
      prompt: <>Total electric charge in an isolated system is conserved.</>,
      choices: [<>True</>, <>False</>],
      correctIndex: 0,
      explanation: (
        <>
          Conservation of charge is one of the foundational empirical facts of electromagnetism.
          The net charge of an isolated system never changes; it can only be moved around or
          created in equal positive/negative pairs<Cite id="feynman-II-2" in={CH1_SOURCES} />.
        </>
      ),
    },
    {
      id: 'q6',
      type: 'true-false',
      prompt: <>The electric field exists at a point in space even if there is no test charge there to feel it.</>,
      choices: [<>True</>, <>False</>],
      correctIndex: 0,
      explanation: (
        <>
          The field is a property of space, not of the test charge. Treating it as a real entity
          that fills the volume around any charged object is what makes Maxwell&rsquo;s framework
          work<Cite id="feynman-II-2" in={CH1_SOURCES} />.
        </>
      ),
    },
    {
      id: 'q7',
      type: 'numeric',
      prompt: (
        <>
          Two point charges of <strong>+1 &micro;C</strong> each sit <strong>1 m</strong> apart in vacuum.
          What is the magnitude of the Coulomb force between them, in newtons?
          (Use k = 8.99&times;10&#8313; N&middot;m&sup2;/C&sup2;.)
        </>
      ),
      targetValue: 0.00899,
      tolerance: 0.05,
      unit: 'N',
      explanation: (
        <>
          F = k Q&#8321;Q&#8322;/r&sup2; = (8.99&times;10&#8313;)(10&#8315;&#8310;)(10&#8315;&#8310;) / 1&sup2;
          &approx; 8.99&times;10&#8315;&sup3; N &approx; 9 mN<Cite id="codata-2018" in={CH1_SOURCES} />.
        </>
      ),
    },
    {
      id: 'q8',
      type: 'numeric',
      prompt: (
        <>
          A point charge of <strong>+1 nC</strong> sits at the origin. What is the magnitude of the
          electric field, in N/C, at a distance of <strong>0.1 m</strong>? (Use k = 8.99&times;10&#8313;.)
        </>
      ),
      targetValue: 899,
      tolerance: 0.05,
      unit: 'N/C',
      explanation: (
        <>
          E = kQ/r&sup2; = (8.99&times;10&#8313;)(10&#8315;&#8313;)/(0.1)&sup2; = 899 N/C.
          Equivalently 899 V/m<Cite id="codata-2018" in={CH1_SOURCES} />.
        </>
      ),
    },
    {
      id: 'q9',
      type: 'short-answer',
      prompt: <>What is the name of the constant <strong>k</strong> in F = k Q&#8321; Q&#8322; / r&sup2;? (One or two words.)</>,
      acceptedAnswers: [
        "coulomb's constant",
        'coulombs constant',
        'coulomb constant',
        'the coulomb constant',
        "the coulomb's constant",
      ],
      explanation: (
        <>
          k is <em>Coulomb&rsquo;s constant</em>, with the SI value
          k = 8.99&times;10&#8313; N&middot;m&sup2;/C&sup2;. It is equivalent to 1/(4&pi;&epsilon;&#8320;)
          <Cite id="codata-2018" in={CH1_SOURCES} />.
        </>
      ),
    },
    {
      id: 'q10',
      type: 'short-answer',
      prompt: <>What shape are the equipotential surfaces of an isolated point charge? (One word.)</>,
      acceptedAnswers: ['sphere', 'spheres', 'spherical', 'concentric spheres'],
      explanation: (
        <>
          Equipotential surfaces of a point charge are concentric <strong>spheres</strong> centred
          on the charge — because the potential V(r) = kQ/r depends only on the radial distance
          <Cite id="griffiths-2017" in={CH1_SOURCES} />.
        </>
      ),
    },
  ],
};

/* ────────────────────────────────────────────────────────────────────── */
/* Ch.27 — The grid arrives at your meter                                 */
/* ────────────────────────────────────────────────────────────────────── */

const CH27_QUIZ: ChapterQuiz = {
  chapterSlug: 'house-grid-arrives',
  passingScore: 0.8,
  questions: [
    {
      id: 'q1',
      type: 'multiple-choice',
      prompt: <>In North-American utility slang, what is a &ldquo;pole-pig&rdquo;?</>,
      choices: [
        <>A medium-voltage fuse on a distribution feeder.</>,
        <>The distribution transformer mounted on a utility pole.</>,
        <>A pad-mounted recloser at the substation.</>,
        <>The service drop conductor between the pole and the house.</>,
      ],
      correctIndex: 1,
      explanation: (
        <>
          &ldquo;Pole-pig&rdquo; is informal utility-worker shorthand for the cylindrical
          distribution transformer hung on a pole that steps medium-voltage primary (typically
          a few kV to ~35 kV) down to 240 V split-phase for the service drop
          <Cite id="grainger-power-systems-2003" in={CH27_SOURCES} />.
        </>
      ),
    },
    {
      id: 'q2',
      type: 'multiple-choice',
      prompt: <>What is the standard nominal secondary voltage of a North-American residential pole or pad transformer, measured hot-to-hot?</>,
      choices: [
        <>120 V</>,
        <>208 V</>,
        <>240 V</>,
        <>277 V</>,
      ],
      correctIndex: 2,
      explanation: (
        <>
          North-American residential service is 240 V hot-to-hot with a centre-tapped neutral,
          giving 120 V from each hot to neutral. ANSI C84.1 specifies 240 V as the nominal
          utilization voltage<Cite id="ansi-c84-1-2020" in={CH27_SOURCES} />.
        </>
      ),
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      prompt: <>Why is the residential secondary delivered as <strong>split-phase</strong> (two hots 180&deg; apart with a centre-tap neutral) rather than a single 240 V hot and a neutral?</>,
      choices: [
        <>It halves the total transformer current.</>,
        <>It lets the same service feed both 120 V loads (lights, outlets) and 240 V loads (range, dryer) from the same drop.</>,
        <>It eliminates harmonics in the neutral.</>,
        <>It is required for grounding to work.</>,
      ],
      correctIndex: 1,
      explanation: (
        <>
          Split-phase is what lets one transformer feed both classes of load: 120 V from either
          hot to neutral for receptacles and lighting, 240 V hot-to-hot for the big resistive
          loads like ranges, dryers, and water heaters<Cite id="nec-2023" in={CH27_SOURCES} />.
        </>
      ),
    },
    {
      id: 'q4',
      type: 'multiple-choice',
      prompt: <>The utility revenue meter at the service entrance is measuring:</>,
      choices: [
        <>Instantaneous voltage.</>,
        <>Peak current.</>,
        <>Energy: the time-integral of instantaneous power (kilowatt-hours).</>,
        <>Power factor only.</>,
      ],
      correctIndex: 2,
      explanation: (
        <>
          The kilowatt-hour meter integrates the product v(t)&middot;i(t) over time to produce
          energy in kWh. Older mechanical meters did this with an induction disk whose rotation
          rate was proportional to instantaneous power; modern smart meters sample digitally
          <Cite id="ieee-std-3001-2-2017" in={CH27_SOURCES} />.
        </>
      ),
    },
    {
      id: 'q5',
      type: 'true-false',
      prompt: <>In a properly wired North-American residence, the neutral conductor is bonded to ground at the service entrance only — never again downstream in subpanels or branch circuits.</>,
      choices: [<>True</>, <>False</>],
      correctIndex: 0,
      explanation: (
        <>
          NEC 250.24 requires the neutral-to-ground bond at exactly one point — the service
          equipment. Bonding it again downstream would create parallel return paths and cause
          objectionable current to flow on grounding conductors<Cite id="nec-2023" in={CH27_SOURCES} />.
        </>
      ),
    },
    {
      id: 'q6',
      type: 'true-false',
      prompt: <>The meter base on the side of the house is the legal boundary between utility-owned and homeowner-owned electrical equipment.</>,
      choices: [<>True</>, <>False</>],
      correctIndex: 0,
      explanation: (
        <>
          The meter socket itself is utility-owned; everything on the load side of the meter
          (the service-entrance conductors into the panel, the panel, and beyond) belongs to
          the homeowner and is governed by the NEC<Cite id="nec-2023" in={CH27_SOURCES} />.
        </>
      ),
    },
    {
      id: 'q7',
      type: 'numeric',
      prompt: (
        <>
          A 1500 W space heater runs continuously for 8 hours. How much energy does it consume,
          in kilowatt-hours?
        </>
      ),
      targetValue: 12,
      tolerance: 0.02,
      unit: 'kWh',
      explanation: (
        <>
          Energy = power &times; time = 1.5 kW &times; 8 h = 12 kWh. At a typical residential
          rate of ~$0.15/kWh that is about $1.80 of electricity for the run.
        </>
      ),
    },
    {
      id: 'q8',
      type: 'numeric',
      prompt: (
        <>
          A copper service drop has a one-way resistance of <strong>0.05 &Omega;</strong> per conductor.
          With a hot-leg load current of <strong>100 A</strong>, what is the voltage drop along one hot
          conductor, in volts? (V = IR.)
        </>
      ),
      targetValue: 5,
      tolerance: 0.05,
      unit: 'V',
      explanation: (
        <>
          V = IR = (100 A)(0.05 &Omega;) = 5 V. That is why service-drop conductors are sized
          fat: at 100 A draw, even 50 m&Omega; of round-trip resistance costs you 5 V on the hot
          and another 5 V on the neutral return<Cite id="codata-2018" in={CH27_SOURCES} />.
        </>
      ),
    },
    {
      id: 'q9',
      type: 'short-answer',
      prompt: (
        <>
          What NEMA receptacle pattern is the standard for a 240 V, 50 A circuit feeding a
          residential level-2 EV charger or electric range? (Format: NEMA &#8230;)
        </>
      ),
      acceptedAnswers: ['14-50', 'nema 14-50', '14-50r', 'nema 14-50r'],
      explanation: (
        <>
          NEMA <strong>14-50</strong> is the four-pin 50 A, 125/250 V outlet (two hots, neutral,
          ground) used for ranges, RV pedestals, and level-2 EV chargers. The 14-30 is the same
          family at 30 A and is common for electric dryers<Cite id="nec-2023" in={CH27_SOURCES} />.
        </>
      ),
    },
    {
      id: 'q10',
      type: 'short-answer',
      prompt: <>In utility-worker slang, &ldquo;pole-pig&rdquo; refers to which piece of equipment? (One or two words.)</>,
      acceptedAnswers: [
        'transformer',
        'distribution transformer',
        'pole transformer',
        'pole-mounted transformer',
        'pole mounted transformer',
      ],
      explanation: (
        <>
          A pole-pig is the distribution transformer that hangs on a utility pole, stepping the
          medium-voltage primary down to 240 V split-phase for the service drop
          <Cite id="grainger-power-systems-2003" in={CH27_SOURCES} />.
        </>
      ),
    },
  ],
};

/* ────────────────────────────────────────────────────────────────────── */
/* Ch.2 — Voltage and current                                             */
/* ────────────────────────────────────────────────────────────────────── */

const CH2_QUIZ: ChapterQuiz = {
  chapterSlug: 'voltage-and-current',
  questions: [
    {
      id: 'q1',
      type: 'multiple-choice',
      prompt: <>Voltage is best described as:</>,
      choices: [
        <>A property of a single point in space.</>,
        <>The pressure exerted by electrons in a wire.</>,
        <>The work done per unit charge between two points.</>,
        <>The number of electrons in a conductor.</>,
      ],
      correctIndex: 2,
      explanation: (
        <>
          Voltage is energy per coulomb: <Formula>V = W/q</Formula>. It is always defined between
          two points; calling a single node &ldquo;at 5 V&rdquo; only makes sense after a reference
          (ground) is chosen<Cite id="feynman-II-2" in={CH2_SOURCES} />.
        </>
      ),
    },
    {
      id: 'q2',
      type: 'multiple-choice',
      prompt: <>By the convention established by Franklin in 1747, conventional current points in the direction:</>,
      choices: [
        <>Electrons move.</>,
        <>Positive charge would move.</>,
        <>The electric field points outside the wire.</>,
        <>Of decreasing temperature.</>,
      ],
      correctIndex: 1,
      explanation: (
        <>
          Conventional current points the way positive charge would flow. In an ordinary copper wire
          the actual carriers are electrons drifting the opposite way, but every textbook and
          right-hand rule is written against the conventional direction
          <Cite id="griffiths-2017" in={CH2_SOURCES} />.
        </>
      ),
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      prompt: <>Approximately how many elementary charges per second is 1 ampere?</>,
      choices: [
        <>6.02&times;10&sup2;&sup3;</>,
        <>1.602&times;10&#8315;&sup1;&#8313;</>,
        <>6.24&times;10&sup1;&#8312;</>,
        <>3.00&times;10&#8312;</>,
      ],
      correctIndex: 2,
      explanation: (
        <>
          One coulomb is about 6.24&times;10&sup1;&#8312; elementary charges (1/e). One ampere is
          one coulomb per second &mdash; about six quintillion electrons per second per amp.
        </>
      ),
    },
    {
      id: 'q4',
      type: 'multiple-choice',
      prompt: <>Drift velocity in household copper wiring is typically:</>,
      choices: [
        <>Near the speed of light.</>,
        <>Hundreds of metres per second.</>,
        <>Millimetres per second or slower.</>,
        <>Comparable to the Fermi velocity (~10&#8310; m/s).</>,
      ],
      correctIndex: 2,
      explanation: (
        <>
          Plug v<sub>d</sub> = I/(nqA) for ordinary currents and copper&rsquo;s n &asymp;
          8.5&times;10&sup2;&#8312;/m&sup3;: drift comes out in mm/s
          <Cite id="libretexts-conduction" in={CH2_SOURCES} />.
        </>
      ),
    },
    {
      id: 'q5',
      type: 'true-false',
      prompt: <>The signal that turns on a lamp when a switch closes travels through the wire at roughly the drift velocity of the electrons.</>,
      choices: [<>True</>, <>False</>],
      correctIndex: 1,
      explanation: (
        <>
          False. The drift velocity is mm/s but the signal &mdash; an electromagnetic reconfiguration
          in the field around the wire &mdash; propagates at roughly two-thirds c, around
          2&times;10&#8312; m/s<Cite id="libretexts-conduction" in={CH2_SOURCES} />.
        </>
      ),
    },
    {
      id: 'q6',
      type: 'true-false',
      prompt: <>For an electrostatic field, the line integral of E between two points is path-independent.</>,
      choices: [<>True</>, <>False</>],
      correctIndex: 0,
      explanation: (
        <>
          &nabla;&times;E = 0 for static fields, which is exactly path-independence of &int;E&middot;d&ell;.
          That property is what makes &ldquo;voltage at a point&rdquo; meaningful at all
          <Cite id="griffiths-2017" in={CH2_SOURCES} />.
        </>
      ),
    },
    {
      id: 'q7',
      type: 'numeric',
      prompt: <>A battery transfers <strong>0.5 J</strong> to <strong>0.1 C</strong> of charge as it moves between the terminals. What is the potential difference, in volts?</>,
      targetValue: 5,
      tolerance: 0.05,
      unit: 'V',
      explanation: <>V = W/Q = 0.5 J / 0.1 C = 5 V.</>,
    },
    {
      id: 'q8',
      type: 'numeric',
      prompt: <>A copper wire of cross-section <strong>2.0 mm&sup2;</strong> carries <strong>10 A</strong>. Using n = 8.5&times;10&sup2;&#8312;/m&sup3; and e = 1.602&times;10&#8315;&sup1;&#8313; C, what is the drift velocity, in mm/s?</>,
      targetValue: 0.37,
      tolerance: 0.15,
      unit: 'mm/s',
      explanation: (
        <>
          v<sub>d</sub> = I/(nqA) = 10 / (8.5&times;10&sup2;&#8312; &middot; 1.602&times;10&#8315;&sup1;&#8313;
          &middot; 2&times;10&#8315;&#8310;) &approx; 3.7&times;10&#8315;&#8308; m/s = 0.37 mm/s
          <Cite id="drude-1900" in={CH2_SOURCES} />.
        </>
      ),
    },
    {
      id: 'q9',
      type: 'short-answer',
      prompt: <>What SI unit equals one joule per coulomb? (One word.)</>,
      acceptedAnswers: ['volt', 'volts', 'the volt'],
      explanation: <>The volt: 1 V = 1 J/C. A 1.5 V battery is fundamentally a statement about energy per unit charge.</>,
    },
    {
      id: 'q10',
      type: 'short-answer',
      prompt: <>What 1900 classical model treats metal electrons as a gas accelerated by E between lattice collisions? (Two words.)</>,
      acceptedAnswers: ['drude model', 'the drude model', 'drude'],
      explanation: (
        <>
          Paul Drude&rsquo;s 1900 model gives &sigma; = nq&sup2;&tau;/m and the linear
          v<sub>d</sub> = I/(nqA) relation<Cite id="drude-1900" in={CH2_SOURCES} />.
        </>
      ),
    },
  ],
};

/* ────────────────────────────────────────────────────────────────────── */
/* Ch.3 — Resistance and power                                            */
/* ────────────────────────────────────────────────────────────────────── */

const CH3_QUIZ: ChapterQuiz = {
  chapterSlug: 'resistance-and-power',
  questions: [
    {
      id: 'q1',
      type: 'multiple-choice',
      prompt: <>Ohm&rsquo;s law for an ideal resistor states:</>,
      choices: [<>V = I&sup2; R</>, <>V = I R</>, <>V = I / R</>, <>V = R / I</>],
      correctIndex: 1,
      explanation: (
        <>
          Ohm&rsquo;s law: V = IR. Microscopically it follows from <Formula>J = &sigma; E</Formula>, a
          linear response of current density to applied field<Cite id="griffiths-2017" in={CH3_SOURCES} />.
        </>
      ),
    },
    {
      id: 'q2',
      type: 'multiple-choice',
      prompt: <>The resistance of a uniform wire of length L and area A is:</>,
      choices: [<>R = &rho; A / L</>, <>R = L A / &rho;</>, <>R = &rho; L / A</>, <>R = &rho; / (L A)</>],
      correctIndex: 2,
      explanation: <>R = &rho;L/A. Longer wires put more collisions in series; fatter wires offer more parallel lanes for the charge.</>,
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      prompt: <>Which expression is NOT a correct form of dissipated power in a resistor?</>,
      choices: [<>P = VI</>, <>P = I&sup2; R</>, <>P = V&sup2; / R</>, <>P = V / I</>],
      correctIndex: 3,
      explanation: (
        <>
          V/I is resistance, not power. The three Joule-heating forms P = VI = I&sup2;R = V&sup2;/R
          are all equivalent by Ohm&rsquo;s law<Cite id="joule-1841" in={CH3_SOURCES} />.
        </>
      ),
    },
    {
      id: 'q4',
      type: 'multiple-choice',
      prompt: <>Two resistors of 10 &Omega; and 15 &Omega; in parallel give an equivalent resistance of:</>,
      choices: [<>25 &Omega;</>, <>12.5 &Omega;</>, <>6 &Omega;</>, <>5 &Omega;</>],
      correctIndex: 2,
      explanation: <>R<sub>p</sub> = (10&middot;15)/(10+15) = 6 &Omega;. Parallel resistance is always less than the smallest component.</>,
    },
    {
      id: 'q5',
      type: 'true-false',
      prompt: <>The resistance of a typical metal increases with temperature.</>,
      choices: [<>True</>, <>False</>],
      correctIndex: 0,
      explanation: (
        <>
          Hotter lattice means more vigorous phonons and shorter mean-free-path. Resistivity rises
          roughly linearly with T above the Debye temperature<Cite id="matthiessen-1864" in={CH3_SOURCES} />.
        </>
      ),
    },
    {
      id: 'q6',
      type: 'true-false',
      prompt: <>A superconductor below its critical temperature has exactly zero DC resistance and dissipates no Joule heat.</>,
      choices: [<>True</>, <>False</>],
      correctIndex: 0,
      explanation: (
        <>
          Onnes 1911 observed zero DC resistance in mercury below 4.2 K. With R = 0, P = I&sup2;R = 0
          <Cite id="onnes-1911" in={CH3_SOURCES} /><Cite id="bcs-1957" in={CH3_SOURCES} />.
        </>
      ),
    },
    {
      id: 'q7',
      type: 'numeric',
      prompt: <>A 240 V heater has a resistance of <strong>12 &Omega;</strong>. What power does it dissipate, in watts?</>,
      targetValue: 4800,
      tolerance: 0.02,
      unit: 'W',
      explanation: <>P = V&sup2;/R = 240&sup2;/12 = 57600/12 = 4800 W = 4.8 kW.</>,
    },
    {
      id: 'q8',
      type: 'numeric',
      prompt: <>What is the resistance of a 1 m length of copper wire with cross-section 1 mm&sup2;? (&rho;<sub>Cu</sub> &asymp; 1.72&times;10&#8315;&#8312; &Omega;&middot;m.) Answer in milliohms.</>,
      targetValue: 17.2,
      tolerance: 0.05,
      unit: 'm&Omega;',
      explanation: (
        <>
          R = &rho;L/A = 1.72&times;10&#8315;&#8312; &middot; 1 / 10&#8315;&#8310; = 0.0172 &Omega; = 17.2 m&Omega;
          <Cite id="crc-resistivity" in={CH3_SOURCES} />.
        </>
      ),
    },
    {
      id: 'q9',
      type: 'short-answer',
      prompt: <>Resistive dissipation, named for the Englishman who quantified P &prop; I&sup2;R in 1841, is called &ldquo;__ heating.&rdquo; (One word.)</>,
      acceptedAnswers: ['joule', 'ohmic', 'resistive'],
      explanation: <>Joule heating (also called ohmic or resistive heating)<Cite id="joule-1841" in={CH3_SOURCES} />.</>,
    },
    {
      id: 'q10',
      type: 'short-answer',
      prompt: <>What property of a material relates J to E via J = &sigma;E? (One word.)</>,
      acceptedAnswers: ['conductivity', 'electrical conductivity'],
      explanation: <>&sigma; is conductivity (S/m); its reciprocal is the resistivity &rho;.</>,
    },
  ],
};

/* ────────────────────────────────────────────────────────────────────── */
/* Ch.4 — How a resistor works                                            */
/* ────────────────────────────────────────────────────────────────────── */

const CH4_QUIZ: ChapterQuiz = {
  chapterSlug: 'how-a-resistor-works',
  questions: [
    {
      id: 'q1',
      type: 'multiple-choice',
      prompt: <>A four-band resistor reads brown-black-red-gold. Its value is:</>,
      choices: [<>100 &Omega; &plusmn;5%</>, <>1 k&Omega; &plusmn;5%</>, <>10 k&Omega; &plusmn;5%</>, <>1 M&Omega; &plusmn;5%</>],
      correctIndex: 1,
      explanation: (
        <>
          Brown=1, Black=0, Red=&times;10&sup2;, Gold=&plusmn;5%. 10 &times; 100 = 1000 &Omega; = 1 k&Omega; &plusmn;5%
          <Cite id="iec-60062-2016" in={CH4_SOURCES} />.
        </>
      ),
    },
    {
      id: 'q2',
      type: 'multiple-choice',
      prompt: <>Which resistor technology generally has the lowest noise and tightest tolerance?</>,
      choices: [
        <>Carbon composition</>,
        <>Carbon film</>,
        <>Bulk metal foil (Z-foil)</>,
        <>Wirewound</>,
      ],
      correctIndex: 2,
      explanation: (
        <>
          Bulk metal foil resistors achieve tolerances down to 0.005% and very low temperature
          coefficients<Cite id="vishay-z-foil" in={CH4_SOURCES} />.
        </>
      ),
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      prompt: <>The IEC E-series of preferred values is spaced so that:</>,
      choices: [
        <>Every value is a round decimal.</>,
        <>Consecutive values&rsquo; tolerance bands just touch.</>,
        <>Resistors are easier to memorise.</>,
        <>Manufacturers can hit them without trimming.</>,
      ],
      correctIndex: 1,
      explanation: (
        <>
          E12, E24, E96, ... are geometric progressions chosen so consecutive values&rsquo; tolerance
          bands cover the gap. That is why 47 k&Omega; exists in E24 but 50 k&Omega; does not
          <Cite id="iec-60062-2016" in={CH4_SOURCES} />.
        </>
      ),
    },
    {
      id: 'q4',
      type: 'multiple-choice',
      prompt: <>A thermistor with a negative temperature coefficient (NTC):</>,
      choices: [
        <>Increases R as T rises.</>,
        <>Decreases R as T rises.</>,
        <>Has fixed R regardless of T.</>,
        <>Is the same as an RTD.</>,
      ],
      correctIndex: 1,
      explanation: (
        <>
          NTC thermistors are typically metal-oxide semiconductors whose carrier concentration rises
          sharply with T. Steinhart-Hart captures the curve<Cite id="steinhart-hart-1968" in={CH4_SOURCES} />.
        </>
      ),
    },
    {
      id: 'q5',
      type: 'true-false',
      prompt: <>A &frac14; W resistor can safely dissipate &frac14; W at any ambient temperature without derating.</>,
      choices: [<>True</>, <>False</>],
      correctIndex: 1,
      explanation: (
        <>
          False. Power ratings are typically specified at 70 &deg;C ambient and must be derated linearly
          to zero at the maximum body temperature<Cite id="horowitz-hill-2015" in={CH4_SOURCES} />.
        </>
      ),
    },
    {
      id: 'q6',
      type: 'true-false',
      prompt: <>The Wiedemann-Franz law says the ratio of thermal to electrical conductivity in a metal is approximately proportional to absolute temperature.</>,
      choices: [<>True</>, <>False</>],
      correctIndex: 0,
      explanation: (
        <>
          &kappa;/&sigma; = L<sub>0</sub>T with the Lorenz number L<sub>0</sub> &approx;
          2.44&times;10&#8315;&#8312; W&Omega;/K&sup2;<Cite id="wiedemann-franz-1853" in={CH4_SOURCES} />.
        </>
      ),
    },
    {
      id: 'q7',
      type: 'numeric',
      prompt: <>You need to limit current through a 3 V LED to 20 mA from a 9 V source. What series-resistor value is required, in ohms?</>,
      targetValue: 300,
      tolerance: 0.05,
      unit: '&Omega;',
      explanation: <>R = (V<sub>src</sub> &minus; V<sub>LED</sub>) / I = 6 / 0.020 = 300 &Omega;.</>,
    },
    {
      id: 'q8',
      type: 'numeric',
      prompt: <>A resistor dissipates 0.2 W in a 5 V circuit. What is its resistance, in ohms?</>,
      targetValue: 125,
      tolerance: 0.05,
      unit: '&Omega;',
      explanation: <>R = V&sup2;/P = 25/0.2 = 125 &Omega;.</>,
    },
    {
      id: 'q9',
      type: 'short-answer',
      prompt: <>What is the name for a variable resistor whose resistance changes with light intensity? (One or two words.)</>,
      acceptedAnswers: ['photoresistor', 'ldr', 'light dependent resistor', 'light-dependent resistor'],
      explanation: <>A photoresistor (LDR) drops in resistance under illumination because absorbed photons free additional carriers.</>,
    },
    {
      id: 'q10',
      type: 'short-answer',
      prompt: <>The three-terminal variable resistor used as an adjustable voltage divider is called a &hellip;? (One word.)</>,
      acceptedAnswers: ['potentiometer', 'pot'],
      explanation: <>A potentiometer (&ldquo;pot&rdquo;): resistive track plus sliding wiper, forming a divider whose ratio is set mechanically.</>,
    },
  ],
};

/* ────────────────────────────────────────────────────────────────────── */
/* Ch.5 — Capacitors                                                      */
/* ────────────────────────────────────────────────────────────────────── */

const CH5_QUIZ: ChapterQuiz = {
  chapterSlug: 'capacitors',
  questions: [
    {
      id: 'q1',
      type: 'multiple-choice',
      prompt: <>The defining relation between stored charge and applied voltage is:</>,
      choices: [<>Q = C/V</>, <>Q = V/C</>, <>Q = CV</>, <>Q = CV&sup2;</>],
      correctIndex: 2,
      explanation: <>Capacitance is the proportionality Q = CV. SI unit: farad (F = C/V)<Cite id="griffiths-2017" in={CH5_SOURCES} />.</>,
    },
    {
      id: 'q2',
      type: 'multiple-choice',
      prompt: <>Vacuum parallel-plate capacitance is:</>,
      choices: [<>C = &epsilon;&#8320; d / A</>, <>C = &epsilon;&#8320; A / d</>, <>C = A d / &epsilon;&#8320;</>, <>C = &epsilon;&#8320; / (A d)</>],
      correctIndex: 1,
      explanation: <>C = &epsilon;&#8320; A/d. Larger plates store more charge at a given V; thinner gap reduces V at fixed Q<Cite id="feynman-II-2" in={CH5_SOURCES} />.</>,
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      prompt: <>Inserting a dielectric of &epsilon;<sub>r</sub> &gt; 1:</>,
      choices: [
        <>Decreases C by &epsilon;<sub>r</sub>.</>,
        <>Increases C by &epsilon;<sub>r</sub>.</>,
        <>Has no effect on C.</>,
        <>Inverts the sign of Q.</>,
      ],
      correctIndex: 1,
      explanation: (
        <>
          Bound charges partially cancel the applied field, allowing more free charge to be stored at
          the same V. C = &epsilon;&#8320;&epsilon;<sub>r</sub>A/d<Cite id="griffiths-2017" in={CH5_SOURCES} />.
        </>
      ),
    },
    {
      id: 'q4',
      type: 'multiple-choice',
      prompt: <>The energy stored in a charged capacitor is:</>,
      choices: [<>U = CV</>, <>U = QV</>, <>U = &frac12; CV&sup2;</>, <>U = &frac12; C/V&sup2;</>],
      correctIndex: 2,
      explanation: <>U = &frac12;CV&sup2; = Q&sup2;/(2C). The &frac12; comes from the work to push successive charges against a rising V.</>,
    },
    {
      id: 'q5',
      type: 'true-false',
      prompt: <>The time constant of an RC charging circuit is &tau; = RC.</>,
      choices: [<>True</>, <>False</>],
      correctIndex: 0,
      explanation: <>V<sub>C</sub>(t) = V&#8320;(1 &minus; e&#8315;<sup>t/&tau;</sup>), &tau; = RC. After ~5&tau; the capacitor reaches ~99% of V&#8320;.</>,
    },
    {
      id: 'q6',
      type: 'true-false',
      prompt: <>An aluminum electrolytic capacitor can be connected with either polarity without consequence.</>,
      choices: [<>True</>, <>False</>],
      correctIndex: 1,
      explanation: <>False. Reverse-biasing an electrolytic breaks down the oxide dielectric and can cause venting<Cite id="horowitz-hill-2015" in={CH5_SOURCES} />.</>,
    },
    {
      id: 'q7',
      type: 'numeric',
      prompt: <>A 100 &micro;F capacitor is charged to 24 V. How much energy does it store, in joules?</>,
      targetValue: 0.0288,
      tolerance: 0.05,
      unit: 'J',
      explanation: <>U = &frac12;CV&sup2; = &frac12;(100&times;10&#8315;&#8310;)(576) = 0.0288 J = 28.8 mJ.</>,
    },
    {
      id: 'q8',
      type: 'numeric',
      prompt: <>A 10 k&Omega; resistor charges a 10 &micro;F capacitor from a 12 V source. What is &tau;, in milliseconds?</>,
      targetValue: 100,
      tolerance: 0.05,
      unit: 'ms',
      explanation: <>&tau; = RC = 10&sup4; &middot; 10&#8315;&#8309; = 0.1 s = 100 ms.</>,
    },
    {
      id: 'q9',
      type: 'short-answer',
      prompt: <>What is the SI unit of capacitance? (One word.)</>,
      acceptedAnswers: ['farad', 'farads', 'the farad'],
      explanation: <>The farad: 1 F = 1 C/V. Practical caps are pF, nF, &micro;F; a 1 F capacitor is enormous.</>,
    },
    {
      id: 'q10',
      type: 'short-answer',
      prompt: <>What 1745 device &mdash; a glass jar with foil inside and out &mdash; was the first capacitor? (Two words.)</>,
      acceptedAnswers: ['leyden jar', 'leiden jar', 'the leyden jar'],
      explanation: <>The Leyden jar: foil-coated glass, first practical store of electric charge<Cite id="leyden-jar-1745" in={CH5_SOURCES} />.</>,
    },
  ],
};

/* ────────────────────────────────────────────────────────────────────── */
/* Ch.6 — Magnetism                                                       */
/* ────────────────────────────────────────────────────────────────────── */

const CH6_QUIZ: ChapterQuiz = {
  chapterSlug: 'magnetism',
  questions: [
    {
      id: 'q1',
      type: 'multiple-choice',
      prompt: <>The magnetic field at distance r from a long straight wire carrying current I is:</>,
      choices: [<>B = &mu;&#8320; I / (4&pi; r)</>, <>B = &mu;&#8320; I / (2&pi; r)</>, <>B = &mu;&#8320; I / r&sup2;</>, <>B = &mu;&#8320; I r</>],
      correctIndex: 1,
      explanation: <>From Amp&egrave;re&rsquo;s law: B(2&pi;r) = &mu;&#8320;I&nbsp;&rArr; B = &mu;&#8320;I/(2&pi;r)<Cite id="ampere-1826" in={CH6_SOURCES} />.</>,
    },
    {
      id: 'q2',
      type: 'multiple-choice',
      prompt: <>The Lorentz force on a charged particle is:</>,
      choices: [<>F = qE only</>, <>F = qv&middot;B</>, <>F = q(E + v &times; B)</>, <>F = qB only</>],
      correctIndex: 2,
      explanation: <>F = q(E + v &times; B). The magnetic part is perpendicular to v and therefore does no work.</>,
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      prompt: <>Two parallel wires carrying current in the same direction:</>,
      choices: [<>Repel each other.</>, <>Attract each other.</>, <>Exert no net force on each other.</>, <>Exert a torque but no net force.</>],
      correctIndex: 1,
      explanation: <>Same-direction currents attract; antiparallel currents repel. F/L = &mu;&#8320;I&#8321;I&#8322;/(2&pi;d)<Cite id="ampere-1826" in={CH6_SOURCES} />.</>,
    },
    {
      id: 'q4',
      type: 'multiple-choice',
      prompt: <>Inside a long solenoid with n turns/m carrying current I, the field is approximately:</>,
      choices: [<>B = &mu;&#8320; I / n</>, <>B = &mu;&#8320; n I</>, <>B = &mu;&#8320; I / (2&pi; r)</>, <>Zero</>],
      correctIndex: 1,
      explanation: <>B = &mu;&#8320;nI inside, ideally zero outside<Cite id="griffiths-2017" in={CH6_SOURCES} />.</>,
    },
    {
      id: 'q5',
      type: 'true-false',
      prompt: <>Isolated magnetic monopoles have been observed experimentally.</>,
      choices: [<>True</>, <>False</>],
      correctIndex: 1,
      explanation: <>No monopole has ever been observed. Gauss&rsquo;s law for B (&nabla;&middot;B = 0) encodes that fact<Cite id="jackson-1999" in={CH6_SOURCES} />.</>,
    },
    {
      id: 'q6',
      type: 'true-false',
      prompt: <>The magnetic force on a moving charged particle does no work on the particle.</>,
      choices: [<>True</>, <>False</>],
      correctIndex: 0,
      explanation: <>F<sub>mag</sub> = qv&times;B is &perp; to v, so F&middot;v = 0 and no work is done. B can change direction of motion but not speed.</>,
    },
    {
      id: 'q7',
      type: 'numeric',
      prompt: <>A long straight wire carries <strong>20 A</strong>. What is |B| at <strong>10 cm</strong> from the wire, in microteslas?</>,
      targetValue: 40,
      tolerance: 0.05,
      unit: '&micro;T',
      explanation: <>|B| = &mu;&#8320;I/(2&pi;r) = (4&pi;&times;10&#8315;&#8311;)(20)/(2&pi;&middot;0.10) = 40 &micro;T &mdash; close to Earth&rsquo;s field.</>,
    },
    {
      id: 'q8',
      type: 'numeric',
      prompt: <>A 1 m straight wire carrying 3 A is perpendicular to a 0.5 T field. What is the magnitude of the force on it, in newtons?</>,
      targetValue: 1.5,
      tolerance: 0.05,
      unit: 'N',
      explanation: <>F = BIL = (0.5)(3)(1) = 1.5 N.</>,
    },
    {
      id: 'q9',
      type: 'short-answer',
      prompt: <>What is the SI unit of magnetic flux density B? (One word.)</>,
      acceptedAnswers: ['tesla', 'teslas', 'the tesla', 't'],
      explanation: <>The tesla: 1 T = 1 N/(A&middot;m). Earth&rsquo;s surface field is &asymp;25-65 &micro;T &mdash; tesla is a large unit.</>,
    },
    {
      id: 'q10',
      type: 'short-answer',
      prompt: <>What 1820 law gives the differential B from a current element, dB = (&mu;&#8320;/4&pi;)(I dL &times; r&#770;)/r&sup2;? (Two hyphenated names.)</>,
      acceptedAnswers: ['biot-savart', 'biot savart', 'biot-savart law', 'the biot-savart law', 'biot savart law'],
      explanation: <>The Biot-Savart law (1820)<Cite id="biot-savart-1820" in={CH6_SOURCES} />.</>,
    },
  ],
};

/* ────────────────────────────────────────────────────────────────────── */
/* Ch.7 — Induction                                                       */
/* ────────────────────────────────────────────────────────────────────── */

const CH7_QUIZ: ChapterQuiz = {
  chapterSlug: 'induction',
  questions: [
    {
      id: 'q1',
      type: 'multiple-choice',
      prompt: <>Faraday&rsquo;s law of induction states:</>,
      choices: [<>EMF = +d&Phi;/dt</>, <>EMF = &minus;d&Phi;/dt</>, <>EMF = &Phi;/t</>, <>EMF = &Phi;&middot;B</>],
      correctIndex: 1,
      explanation: <>EMF = &minus;d&Phi;<sub>B</sub>/dt. The minus sign is Lenz&rsquo;s law &mdash; induced EMF opposes the flux change<Cite id="faraday-1832" in={CH7_SOURCES} />.</>,
    },
    {
      id: 'q2',
      type: 'multiple-choice',
      prompt: <>Lenz&rsquo;s law says the induced current direction is one that:</>,
      choices: [<>Reinforces the flux change.</>, <>Opposes the flux change.</>, <>Maximizes power.</>, <>Is perpendicular to the original flux.</>],
      correctIndex: 1,
      explanation: <>The induced current produces a flux that opposes the change driving it; otherwise you could build a perpetual motion machine.</>,
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      prompt: <>For a solenoid of length &ell;, area A, and N turns, the self-inductance is approximately:</>,
      choices: [<>L = &mu;&#8320; N A / &ell;</>, <>L = &mu;&#8320; N&sup2; A / &ell;</>, <>L = &mu;&#8320; N&sup2; &ell; / A</>, <>L = &mu;&#8320; &ell; / (N A)</>],
      correctIndex: 1,
      explanation: <>L = &mu;&#8320;N&sup2;A/&ell;. The N&sup2; comes from each turn linking flux from every other turn<Cite id="griffiths-2017" in={CH7_SOURCES} />.</>,
    },
    {
      id: 'q4',
      type: 'multiple-choice',
      prompt: <>Voltage across an inductor is related to rate of change of current by:</>,
      choices: [<>V = L &middot; I</>, <>V = L &middot; dI/dt</>, <>V = (1/L) &middot; dI/dt</>, <>V = I/L</>],
      correctIndex: 1,
      explanation: <>V<sub>L</sub> = L &middot; dI/dt. The inductor resists changes in current the way a capacitor resists changes in voltage.</>,
    },
    {
      id: 'q5',
      type: 'true-false',
      prompt: <>A steady DC current in a primary winding induces a steady DC voltage in the secondary of an iron-cored transformer.</>,
      choices: [<>True</>, <>False</>],
      correctIndex: 1,
      explanation: <>False. Faraday&rsquo;s law requires d&Phi;/dt &ne; 0; DC gives constant flux and zero induced EMF. That is why transformers do not work on DC.</>,
    },
    {
      id: 'q6',
      type: 'true-false',
      prompt: <>The time constant of an RL series circuit is &tau; = L/R.</>,
      choices: [<>True</>, <>False</>],
      correctIndex: 0,
      explanation: <>I(t) = (V/R)(1 &minus; e&#8315;<sup>t/&tau;</sup>), &tau; = L/R.</>,
    },
    {
      id: 'q7',
      type: 'numeric',
      prompt: <>A 50-turn coil sees its flux change by <strong>2&times;10&#8315;&sup3; Wb</strong> in <strong>5 ms</strong>. What is |EMF|, in volts?</>,
      targetValue: 20,
      tolerance: 0.05,
      unit: 'V',
      explanation: <>|EMF| = N |&Delta;&Phi;/&Delta;t| = 50 &middot; (2&times;10&#8315;&sup3;/5&times;10&#8315;&sup3;) = 20 V.</>,
    },
    {
      id: 'q8',
      type: 'numeric',
      prompt: <>A 1000-turn primary drives a 50-turn secondary. With 240 V AC on the primary, what is the secondary voltage, in volts?</>,
      targetValue: 12,
      tolerance: 0.05,
      unit: 'V',
      explanation: <>V&#8322; = V&#8321;(N&#8322;/N&#8321;) = 240 &middot; (50/1000) = 12 V.</>,
    },
    {
      id: 'q9',
      type: 'short-answer',
      prompt: <>The directional rule for induced currents is named for which physicist? (One word.)</>,
      acceptedAnswers: ['lenz', "lenz's law", 'lenz law'],
      explanation: <>Heinrich Lenz (1834): the energy-conservation statement embedded in the minus sign of Faraday&rsquo;s law.</>,
    },
    {
      id: 'q10',
      type: 'short-answer',
      prompt: <>What is the SI unit of inductance? (One word.)</>,
      acceptedAnswers: ['henry', 'henrys', 'henries', 'h', 'the henry'],
      explanation: <>The henry: 1 H = 1 V&middot;s/A. Named for Joseph Henry, an American contemporary of Faraday.</>,
    },
  ],
};

/* ────────────────────────────────────────────────────────────────────── */
/* Ch.8 — Where the energy actually flows (Poynting)                      */
/* ────────────────────────────────────────────────────────────────────── */

const CH8_QUIZ: ChapterQuiz = {
  chapterSlug: 'energy-flow',
  questions: [
    {
      id: 'q1',
      type: 'multiple-choice',
      prompt: <>The Poynting vector is defined as:</>,
      choices: [<>S = E + B</>, <>S = E &middot; B</>, <>S = (1/&mu;&#8320;) E &times; B</>, <>S = &mu;&#8320; E B</>],
      correctIndex: 2,
      explanation: <>S = (1/&mu;&#8320;) E &times; B, units W/m&sup2;, pointing the way energy flows<Cite id="poynting-1884" in={CH8_SOURCES} />.</>,
    },
    {
      id: 'q2',
      type: 'multiple-choice',
      prompt: <>Around a current-carrying resistive wire, S points:</>,
      choices: [<>Along the wire with the current.</>, <>Along the wire against the current.</>, <>Radially inward into the wire.</>, <>Radially outward from the wire.</>],
      correctIndex: 2,
      explanation: <>E along the wire, B circling it &nbsp;&rArr; S points radially inward, depositing energy into the wire from the surrounding field<Cite id="feynman-II-27" in={CH8_SOURCES} />.</>,
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      prompt: <>&oint; S &middot; dA over a closed surface enclosing a section of resistive wire equals:</>,
      choices: [<>VI &mdash; the dissipated power.</>, <>QV &mdash; the stored energy.</>, <>The current I.</>, <>Zero.</>],
      correctIndex: 0,
      explanation: <>The integral comes out to exactly VI. Energy enters through the surrounding field, not through the copper<Cite id="poynting-1884" in={CH8_SOURCES} />.</>,
    },
    {
      id: 'q4',
      type: 'multiple-choice',
      prompt: <>The energy density of the EM field in vacuum is:</>,
      choices: [<>u = &epsilon;&#8320; E + B/&mu;&#8320;</>, <>u = &frac12; &epsilon;&#8320; E&sup2; + B&sup2;/(2&mu;&#8320;)</>, <>u = E B</>, <>u = E&sup2; + B&sup2;</>],
      correctIndex: 1,
      explanation: <>u = &frac12;&epsilon;&#8320;E&sup2; + B&sup2;/(2&mu;&#8320;): quadratic in the fields, the same way &frac12;CV&sup2; and &frac12;LI&sup2; appear for caps and coils<Cite id="griffiths-2017" in={CH8_SOURCES} />.</>,
    },
    {
      id: 'q5',
      type: 'true-false',
      prompt: <>In a coaxial cable, most of the energy delivered to the load travels in the dielectric gap rather than inside the copper conductors.</>,
      choices: [<>True</>, <>False</>],
      correctIndex: 0,
      explanation: <>In an ideal coax, S points along the axis through the dielectric. The copper is a guide for the field, not a pipe for the energy<Cite id="pozar-2011" in={CH8_SOURCES} />.</>,
    },
    {
      id: 'q6',
      type: 'true-false',
      prompt: <>In an ideal superconductor with zero E inside, the radial component of S at the wire surface is also zero.</>,
      choices: [<>True</>, <>False</>],
      correctIndex: 0,
      explanation: <>E<sub>tangential</sub> = 0 means S has no radial inward component, consistent with zero dissipation in the wire.</>,
    },
    {
      id: 'q7',
      type: 'numeric',
      prompt: <>A panel absorbs <strong>2 m&sup2;</strong> of solar irradiance at 1000 W/m&sup2;. What power does it intercept, in watts?</>,
      targetValue: 2000,
      tolerance: 0.02,
      unit: 'W',
      explanation: <>P = S &times; A = 1000 W/m&sup2; &middot; 2 m&sup2; = 2000 W = 2 kW<Cite id="kopp-lean-2011" in={CH8_SOURCES} />.</>,
    },
    {
      id: 'q8',
      type: 'numeric',
      prompt: <>A wire with V = 5 V across it carries I = 2 A. By Poynting, the total electromagnetic power entering its surface is, in watts:</>,
      targetValue: 10,
      tolerance: 0.02,
      unit: 'W',
      explanation: <>&oint; S &middot; dA = VI = 10 W. Exactly the dissipated power.</>,
    },
    {
      id: 'q9',
      type: 'short-answer',
      prompt: <>Who in 1884 derived the vector that bears his name? (One word.)</>,
      acceptedAnswers: ['poynting', 'john poynting', 'john henry poynting', 'j.h. poynting'],
      explanation: <>John Henry Poynting<Cite id="poynting-1884" in={CH8_SOURCES} />.</>,
    },
    {
      id: 'q10',
      type: 'short-answer',
      prompt: <>What are the SI units of the Poynting vector? (Format: W/m^2 or watts per square metre.)</>,
      acceptedAnswers: ['w/m^2', 'w/m2', 'w/m²', 'watts per square metre', 'watts per square meter'],
      explanation: <>W/m&sup2; &mdash; energy flux through unit area, the same units as irradiance/intensity.</>,
    },
  ],
};

/* ────────────────────────────────────────────────────────────────────── */
/* Ch.9 — Electromagnetic waves                                           */
/* ────────────────────────────────────────────────────────────────────── */

const CH9_QUIZ: ChapterQuiz = {
  chapterSlug: 'em-waves',
  questions: [
    {
      id: 'q1',
      type: 'multiple-choice',
      prompt: <>The speed of light in vacuum is derived from Maxwell&rsquo;s equations as:</>,
      choices: [<>c = &epsilon;&#8320; &middot; &mu;&#8320;</>, <>c = 1 / (&epsilon;&#8320; &middot; &mu;&#8320;)</>, <>c = 1 / &radic;(&epsilon;&#8320; &mu;&#8320;)</>, <>c = &radic;(&epsilon;&#8320; / &mu;&#8320;)</>],
      correctIndex: 2,
      explanation: <>v = 1/&radic;(&mu;&#8320;&epsilon;&#8320;) &approx; 2.998&times;10&#8312; m/s<Cite id="maxwell-1865" in={CH9_SOURCES} />.</>,
    },
    {
      id: 'q2',
      type: 'multiple-choice',
      prompt: <>In a plane EM wave in vacuum, the relationship between E and B magnitudes is:</>,
      choices: [<>|E| = |B|</>, <>|E| = c |B|</>, <>|E| = |B|/c</>, <>|E| = c&sup2; |B|</>],
      correctIndex: 1,
      explanation: <>|E| = c|B|. Numerically B looks small but the energy densities &frac12;&epsilon;&#8320;E&sup2; and B&sup2;/(2&mu;&#8320;) are equal.</>,
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      prompt: <>The time-averaged intensity of a plane EM wave with peak field E&#8320; is:</>,
      choices: [<>I = &frac12; &epsilon;&#8320; c E&#8320;&sup2;</>, <>I = &epsilon;&#8320; c E&#8320;</>, <>I = c B&#8320;</>, <>I = E&#8320; / B&#8320;</>],
      correctIndex: 0,
      explanation: <>&lt;I&gt; = &frac12;&epsilon;&#8320;cE&#8320;&sup2;. The &frac12; comes from averaging cos&sup2;(&omega;t).</>,
    },
    {
      id: 'q4',
      type: 'multiple-choice',
      prompt: <>An accelerating charge:</>,
      choices: [<>Does not radiate.</>, <>Radiates EM waves.</>, <>Only radiates above c.</>, <>Only radiates at the cyclotron frequency.</>],
      correctIndex: 1,
      explanation: <>Accelerating charges radiate (Larmor formula). A steady current doesn&rsquo;t accelerate the average carrier, so a DC wire doesn&rsquo;t radiate.</>,
    },
    {
      id: 'q5',
      type: 'true-false',
      prompt: <>Electromagnetic waves carry momentum as well as energy.</>,
      choices: [<>True</>, <>False</>],
      correctIndex: 0,
      explanation: <>Radiation pressure P = I/c on an absorbing surface. JAXA&rsquo;s IKAROS solar sail demonstrated this directly<Cite id="tsuda-2013-ikaros" in={CH9_SOURCES} />.</>,
    },
    {
      id: 'q6',
      type: 'true-false',
      prompt: <>Radio waves and X-rays are the same phenomenon &mdash; both are electromagnetic waves obeying Maxwell&rsquo;s equations.</>,
      choices: [<>True</>, <>False</>],
      correctIndex: 0,
      explanation: <>Radio, microwave, IR, visible, UV, X-ray, gamma &mdash; one continuous spectrum, differing only in &lambda; (hence f and photon energy).</>,
    },
    {
      id: 'q7',
      type: 'numeric',
      prompt: <>What is the wavelength of a 5 GHz Wi-Fi carrier in vacuum, in cm? (c = 3&times;10&#8312; m/s.)</>,
      targetValue: 6,
      tolerance: 0.05,
      unit: 'cm',
      explanation: <>&lambda; = c/f = 3&times;10&#8312;/5&times;10&#8313; = 0.06 m = 6 cm<Cite id="ieee-80211" in={CH9_SOURCES} />.</>,
    },
    {
      id: 'q8',
      type: 'numeric',
      prompt: <>Sunlight at 1361 W/m&sup2; absorbed by a black surface exerts what radiation pressure, in micropascals?</>,
      targetValue: 4.54,
      tolerance: 0.1,
      unit: '&micro;Pa',
      explanation: <>P = I/c = 1361 / 3&times;10&#8312; &approx; 4.54&times;10&#8315;&#8310; Pa = 4.54 &micro;Pa<Cite id="kopp-lean-2011" in={CH9_SOURCES} />.</>,
    },
    {
      id: 'q9',
      type: 'short-answer',
      prompt: <>What is the name for an EM wave whose E vector oscillates in a single fixed plane? (One word.)</>,
      acceptedAnswers: ['polarized', 'polarised', 'linearly polarized', 'linearly polarised', 'polarization'],
      explanation: <>Linearly polarized: E confined to a single plane. Polarizing filters and Brewster reflection exploit this.</>,
    },
    {
      id: 'q10',
      type: 'short-answer',
      prompt: <>Who first generated and detected radio waves in 1887, confirming Maxwell&rsquo;s prediction? (One word.)</>,
      acceptedAnswers: ['hertz', 'heinrich hertz', 'h. hertz'],
      explanation: <>Heinrich Hertz<Cite id="hertz-1888" in={CH9_SOURCES} />.</>,
    },
  ],
};

/* ────────────────────────────────────────────────────────────────────── */
/* Ch.10 — Maxwell's equations together                                   */
/* ────────────────────────────────────────────────────────────────────── */

const CH10_QUIZ: ChapterQuiz = {
  chapterSlug: 'maxwell',
  questions: [
    {
      id: 'q1',
      type: 'multiple-choice',
      prompt: <>Gauss&rsquo;s law for E in integral form is:</>,
      choices: [<>&oint; E &middot; dA = 0</>, <>&oint; E &middot; dA = Q<sub>enc</sub>/&epsilon;&#8320;</>, <>&oint; E &middot; dA = &mu;&#8320; I<sub>enc</sub></>, <>&oint; E &middot; dA = &minus;d&Phi;<sub>B</sub>/dt</>],
      correctIndex: 1,
      explanation: <>Flux of E through a closed surface equals Q<sub>enc</sub>/&epsilon;&#8320;<Cite id="gauss-1813" in={CH10_SOURCES} />.</>,
    },
    {
      id: 'q2',
      type: 'multiple-choice',
      prompt: <>&oint; B &middot; dA = 0 expresses:</>,
      choices: [<>B is always zero.</>, <>No isolated magnetic monopoles.</>, <>B is conservative.</>, <>B circulates around currents.</>],
      correctIndex: 1,
      explanation: <>Zero net flux through any closed surface means field lines have no sources &mdash; no monopoles.</>,
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      prompt: <>Maxwell&rsquo;s correction to Amp&egrave;re&rsquo;s law adds:</>,
      choices: [<>The conduction current.</>, <>The displacement current &epsilon;&#8320; d&Phi;<sub>E</sub>/dt.</>, <>A factor of 2 in front of &mu;&#8320;.</>, <>A new charge density.</>],
      correctIndex: 1,
      explanation: <>The displacement current &epsilon;&#8320; d&Phi;<sub>E</sub>/dt closes Amp&egrave;re across capacitor gaps and gives rise to EM waves<Cite id="maxwell-1865" in={CH10_SOURCES} />.</>,
    },
    {
      id: 'q4',
      type: 'multiple-choice',
      prompt: <>Which equation, combined with Amp&egrave;re-Maxwell, gives the wave equation in vacuum?</>,
      choices: [<>Gauss for E</>, <>Gauss for B</>, <>Faraday&rsquo;s law</>, <>Ohm&rsquo;s law</>],
      correctIndex: 2,
      explanation: <>Taking &nabla;&times; of Faraday and substituting Amp&egrave;re-Maxwell yields &nabla;&sup2;E = &mu;&#8320;&epsilon;&#8320; &part;&sup2;E/&part;t&sup2;.</>,
    },
    {
      id: 'q5',
      type: 'true-false',
      prompt: <>Maxwell&rsquo;s equations are linear in E and B.</>,
      choices: [<>True</>, <>False</>],
      correctIndex: 0,
      explanation: <>Linearity makes superposition work: the sum of two solutions is again a solution. Two antennas&rsquo; waves pass through each other undistorted.</>,
    },
    {
      id: 'q6',
      type: 'true-false',
      prompt: <>Charge conservation, &part;&rho;/&part;t + &nabla;&middot;J = 0, follows from Maxwell&rsquo;s equations rather than being an extra postulate.</>,
      choices: [<>True</>, <>False</>],
      correctIndex: 0,
      explanation: <>The divergence of Amp&egrave;re-Maxwell combined with Gauss forces continuity. Maxwell&rsquo;s displacement-current correction is precisely what closes this loop.</>,
    },
    {
      id: 'q7',
      type: 'numeric',
      prompt: <>A <strong>2 nC</strong> point charge sits inside a closed surface. What is the electric flux through that surface, in V&middot;m? (&epsilon;&#8320; = 8.854&times;10&#8315;&sup1;&sup2; F/m.)</>,
      targetValue: 226,
      tolerance: 0.05,
      unit: 'V&middot;m',
      explanation: <>&Phi; = Q/&epsilon;&#8320; = 2&times;10&#8315;&#8313;/8.854&times;10&#8315;&sup1;&sup2; &approx; 226 V&middot;m<Cite id="codata-2018" in={CH10_SOURCES} />.</>,
    },
    {
      id: 'q8',
      type: 'numeric',
      prompt: <>Flux through a single loop drops from <strong>3&times;10&#8315;&sup3; Wb</strong> to zero in <strong>2 ms</strong>. What is |EMF|, in volts?</>,
      targetValue: 1.5,
      tolerance: 0.05,
      unit: 'V',
      explanation: <>|EMF| = |d&Phi;/dt| = 3&times;10&#8315;&sup3;/2&times;10&#8315;&sup3; = 1.5 V.</>,
    },
    {
      id: 'q9',
      type: 'short-answer',
      prompt: <>How many independent equations make up Maxwell&rsquo;s system? (One word.)</>,
      acceptedAnswers: ['four', '4'],
      explanation: <>Four: Gauss for E, Gauss for B, Faraday, Amp&egrave;re-Maxwell.</>,
    },
    {
      id: 'q10',
      type: 'short-answer',
      prompt: <>The term Maxwell added to Amp&egrave;re&rsquo;s law is called the &ldquo;__ current.&rdquo; (One word.)</>,
      acceptedAnswers: ['displacement', 'displacement current'],
      explanation: <>Displacement current &mdash; not actually a flow of charges, but a changing electric flux that acts like one.</>,
    },
  ],
};

/* ────────────────────────────────────────────────────────────────────── */
/* Ch.11 — Relativity and electromagnetism                                */
/* ────────────────────────────────────────────────────────────────────── */

const CH11_QUIZ: ChapterQuiz = {
  chapterSlug: 'relativity',
  questions: [
    {
      id: 'q1',
      type: 'multiple-choice',
      prompt: <>The magnetic force on a moving test charge near a current-carrying wire:</>,
      choices: [<>Is a fundamentally different force from electricity.</>, <>Can be reinterpreted as an electric force in a different reference frame.</>, <>Requires quantum mechanics to explain.</>, <>Vanishes at all speeds.</>],
      correctIndex: 1,
      explanation: <>Boost into the test-charge frame: length-contracted ion and electron densities no longer match, the wire appears charged, and the magnetic force becomes pure Coulomb<Cite id="purcell-morin-2013" in={CH11_SOURCES} />.</>,
    },
    {
      id: 'q2',
      type: 'multiple-choice',
      prompt: <>The Lorentz factor &gamma; at v = 0.5 c is approximately:</>,
      choices: [<>1.00</>, <>1.15</>, <>1.73</>, <>2.00</>],
      correctIndex: 1,
      explanation: <>&gamma; = 1/&radic;(1 &minus; 0.25) = 1/&radic;0.75 &approx; 1.155.</>,
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      prompt: <>E and B fields transform under Lorentz boosts as components of:</>,
      choices: [<>Two separate scalars.</>, <>A single rank-2 antisymmetric tensor.</>, <>Two unrelated four-vectors.</>, <>A scalar potential only.</>],
      correctIndex: 1,
      explanation: <>F<sup>&mu;&nu;</sup> packs E and B into one antisymmetric rank-2 object; Lorentz transforms mix its components<Cite id="jackson-1999" in={CH11_SOURCES} />.</>,
    },
    {
      id: 'q4',
      type: 'multiple-choice',
      prompt: <>Which of the following is a Lorentz invariant of the EM field?</>,
      choices: [<>|E|</>, <>|B|</>, <>E &middot; B</>, <>Energy density u.</>],
      correctIndex: 2,
      explanation: <>The two invariants of F are E&middot;B and E&sup2; &minus; c&sup2;B&sup2;<Cite id="jackson-1999" in={CH11_SOURCES} />.</>,
    },
    {
      id: 'q5',
      type: 'true-false',
      prompt: <>A configuration that is purely electric in one inertial frame is purely electric in every frame.</>,
      choices: [<>True</>, <>False</>],
      correctIndex: 1,
      explanation: <>False. A static charge has only E in its rest frame; a moving observer measures both E and B. Whether a field is &ldquo;electric&rdquo; depends on the frame.</>,
    },
    {
      id: 'q6',
      type: 'true-false',
      prompt: <>Per-electron, the relativistic correction in a current-carrying wire is tiny; the macroscopic magnetic force is large because of the enormous density of carriers.</>,
      choices: [<>True</>, <>False</>],
      correctIndex: 0,
      explanation: <>v/c &sim; 10&#8315;&sup1;&sup1; per electron, but n &asymp; 8.5&times;10&sup2;&#8312;/m&sup3; in copper. The small per-electron effect, multiplied across that density, yields perceptible B<Cite id="feynman-II-13" in={CH11_SOURCES} />.</>,
    },
    {
      id: 'q7',
      type: 'numeric',
      prompt: <>A 1 m rod at rest in S moves at 0.6 c relative to S&prime;. What length does S&prime; measure, in metres?</>,
      targetValue: 0.8,
      tolerance: 0.02,
      unit: 'm',
      explanation: <>L = L&#8320;/&gamma; = 1 &middot; &radic;(1 &minus; 0.36) = 0.8 m.</>,
    },
    {
      id: 'q8',
      type: 'numeric',
      prompt: <>Compute the Lorentz factor &gamma; at v = 0.9 c.</>,
      targetValue: 2.294,
      tolerance: 0.02,
      explanation: <>&gamma; = 1/&radic;(1 &minus; 0.81) = 1/&radic;0.19 &approx; 2.294.</>,
    },
    {
      id: 'q9',
      type: 'short-answer',
      prompt: <>Whose 1905 paper unified electricity and magnetism into a covariant theory? (One word, last name.)</>,
      acceptedAnswers: ['einstein', 'a. einstein', 'albert einstein'],
      explanation: <>Einstein&rsquo;s &ldquo;On the Electrodynamics of Moving Bodies&rdquo; (1905)<Cite id="einstein-1905" in={CH11_SOURCES} />.</>,
    },
    {
      id: 'q10',
      type: 'short-answer',
      prompt: <>What is the relativistic shortening of a moving object along its direction of motion called? (Two words.)</>,
      acceptedAnswers: ['length contraction', 'lorentz contraction', 'lorentz-fitzgerald contraction', 'fitzgerald contraction'],
      explanation: <>Length contraction: L = L&#8320;/&gamma; along the motion direction, from the Lorentz transformation.</>,
    },
  ],
};

/* ────────────────────────────────────────────────────────────────────── */
/* Ch.12 — Circuits, AC, and impedance                                    */
/* ────────────────────────────────────────────────────────────────────── */

const CH12_QUIZ: ChapterQuiz = {
  chapterSlug: 'circuits-and-ac',
  questions: [
    {
      id: 'q1',
      type: 'multiple-choice',
      prompt: <>Kirchhoff&rsquo;s current law (KCL) states:</>,
      choices: [<>The sum of voltages around a loop is zero.</>, <>The sum of currents entering a node equals the sum leaving.</>, <>Current is constant in any element.</>, <>Voltage is constant in any element.</>],
      correctIndex: 1,
      explanation: <>KCL is charge conservation at a node: charge doesn&rsquo;t pile up, so what flows in must flow out<Cite id="kirchhoff-1845" in={CH12_SOURCES} />.</>,
    },
    {
      id: 'q2',
      type: 'multiple-choice',
      prompt: <>The impedance of an ideal capacitor at angular frequency &omega; is:</>,
      choices: [<>Z<sub>C</sub> = &omega; C</>, <>Z<sub>C</sub> = j&omega;C</>, <>Z<sub>C</sub> = 1/(j&omega;C)</>, <>Z<sub>C</sub> = j/&omega;C</>],
      correctIndex: 2,
      explanation: <>Z<sub>C</sub> = 1/(j&omega;C); magnitude falls with f, so a capacitor blocks DC and passes AC.</>,
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      prompt: <>The resonant angular frequency of a series LC is:</>,
      choices: [<>&omega;&#8320; = LC</>, <>&omega;&#8320; = 1/(LC)</>, <>&omega;&#8320; = 1/&radic;(LC)</>, <>&omega;&#8320; = &radic;(L/C)</>],
      correctIndex: 2,
      explanation: <>&omega;&#8320; = 1/&radic;(LC). At resonance X<sub>L</sub> = X<sub>C</sub> and the reactive parts cancel.</>,
    },
    {
      id: 'q4',
      type: 'multiple-choice',
      prompt: <>The RMS of a sinusoid with peak 170 V is approximately:</>,
      choices: [<>85 V</>, <>120 V</>, <>170 V</>, <>240 V</>],
      correctIndex: 1,
      explanation: <>V<sub>rms</sub> = V<sub>peak</sub>/&radic;2 &approx; 120 V &mdash; standard North-American line voltage<Cite id="ansi-c84-1-2020" in={CH12_SOURCES} />.</>,
    },
    {
      id: 'q5',
      type: 'true-false',
      prompt: <>Real power in an AC circuit is &lt;P&gt; = V<sub>rms</sub> I<sub>rms</sub> cos(&phi;), where &phi; is the V-I phase angle.</>,
      choices: [<>True</>, <>False</>],
      correctIndex: 0,
      explanation: <>The cos(&phi;) factor is the power factor. Pure reactive loads have cos(&phi;) = 0; pure resistive loads have cos(&phi;) = 1.</>,
    },
    {
      id: 'q6',
      type: 'true-false',
      prompt: <>Connecting a finite load to a voltage divider always reduces V<sub>out</sub> below its unloaded value.</>,
      choices: [<>True</>, <>False</>],
      correctIndex: 0,
      explanation: <>The load appears in parallel with R&#8322;, dropping the effective lower resistance and therefore the output. This is the loading effect.</>,
    },
    {
      id: 'q7',
      type: 'numeric',
      prompt: <>For an RLC with L = 10 mH and C = 10 nF, what is f&#8320;, in kHz?</>,
      targetValue: 15.92,
      tolerance: 0.05,
      unit: 'kHz',
      explanation: <>f&#8320; = 1/(2&pi;&radic;LC) = 1/(2&pi;&middot;10&#8315;&#8309;) &approx; 15.92 kHz.</>,
    },
    {
      id: 'q8',
      type: 'numeric',
      prompt: <>A divider has R&#8321; = 4 k&Omega;, R&#8322; = 2 k&Omega;, V<sub>in</sub> = 12 V. What is V<sub>out</sub>, in volts?</>,
      targetValue: 4,
      tolerance: 0.02,
      unit: 'V',
      explanation: <>V<sub>out</sub> = V<sub>in</sub> R&#8322;/(R&#8321;+R&#8322;) = 12 &middot; 2/6 = 4 V.</>,
    },
    {
      id: 'q9',
      type: 'short-answer',
      prompt: <>The cosine of the phase angle between V and I in an AC circuit is called the &hellip;? (Two words.)</>,
      acceptedAnswers: ['power factor', 'powerfactor'],
      explanation: <>Power factor = cos(&phi;) = real power / apparent power. Reactive elements drag it below 1.</>,
    },
    {
      id: 'q10',
      type: 'short-answer',
      prompt: <>The open-circuit voltage of a linear two-terminal network, taken with its internal Th&eacute;venin resistance, is named for whom? (One word.)</>,
      acceptedAnswers: ['thevenin', 'thévenin', "thevenin's voltage", "thévenin's voltage", "thevenin voltage", "thévenin voltage"],
      explanation: <>Th&eacute;venin&rsquo;s theorem<Cite id="irwin-circuit-analysis-2015" in={CH12_SOURCES} />.</>,
    },
  ],
};

/* ────────────────────────────────────────────────────────────────────── */
/* Ch.13 — Network analysis methods                                       */
/* ────────────────────────────────────────────────────────────────────── */

const CH13_QUIZ: ChapterQuiz = {
  chapterSlug: 'network-analysis',
  questions: [
    {
      id: 'q1',
      type: 'multiple-choice',
      prompt: <>Mesh-current analysis writes one equation per:</>,
      choices: [<>Node in the circuit.</>, <>Independent mesh in a planar circuit.</>, <>Branch in the circuit.</>, <>Resistor.</>],
      correctIndex: 1,
      explanation: <>Mesh analysis assigns a loop current to each independent mesh and applies KVL around it<Cite id="maxwell-1873" in={CH13_SOURCES} />.</>,
    },
    {
      id: 'q2',
      type: 'multiple-choice',
      prompt: <>Nodal analysis is based on:</>,
      choices: [<>KVL around each loop.</>, <>KCL at each non-reference node.</>, <>Th&eacute;venin&rsquo;s theorem.</>, <>Conservation of energy.</>],
      correctIndex: 1,
      explanation: <>Pick a reference node; write KCL at each remaining node, expressing currents as conductance times node-voltage differences.</>,
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      prompt: <>Superposition is applicable to circuits that are:</>,
      choices: [<>Strictly DC.</>, <>Strictly AC.</>, <>Linear (R, L, C, plus independent sources).</>, <>Always passive.</>],
      correctIndex: 2,
      explanation: <>Superposition requires linearity. Nonlinear elements (diodes, active BJTs) break it<Cite id="hayt-kemmerly-durbin-2018" in={CH13_SOURCES} />.</>,
    },
    {
      id: 'q4',
      type: 'multiple-choice',
      prompt: <>Norton&rsquo;s theorem represents a linear two-terminal network as:</>,
      choices: [<>Voltage source in series with R.</>, <>Current source in parallel with R.</>, <>Inductor in series with capacitor.</>, <>A short-circuit only.</>],
      correctIndex: 1,
      explanation: <>Norton: I<sub>N</sub> (short-circuit current) in parallel with R<sub>N</sub> = R<sub>th</sub><Cite id="norton-1926" in={CH13_SOURCES} />.</>,
    },
    {
      id: 'q5',
      type: 'true-false',
      prompt: <>For maximum power transfer to a load from a source of internal resistance R<sub>S</sub>, the load resistance should equal R<sub>S</sub>.</>,
      choices: [<>True</>, <>False</>],
      correctIndex: 0,
      explanation: <>dP/dR<sub>L</sub> = 0 at R<sub>L</sub> = R<sub>S</sub>. Efficiency at this match is exactly 50%.</>,
    },
    {
      id: 'q6',
      type: 'true-false',
      prompt: <>The Y-&Delta; transformation (Kennelly 1899) lets you convert a delta network of three resistors into an equivalent Y network and vice versa.</>,
      choices: [<>True</>, <>False</>],
      correctIndex: 0,
      explanation: <>Kennelly&rsquo;s transformation untangles bridge networks that have no straightforward series/parallel reduction<Cite id="kennelly-1899" in={CH13_SOURCES} />.</>,
    },
    {
      id: 'q7',
      type: 'numeric',
      prompt: <>A 12 V source with R<sub>S</sub> = 6 &Omega; drives a load. For maximum power, what R<sub>L</sub>, in ohms?</>,
      targetValue: 6,
      tolerance: 0.05,
      unit: '&Omega;',
      explanation: <>R<sub>L</sub> = R<sub>S</sub> = 6 &Omega;. Then P<sub>L,max</sub> = V<sub>S</sub>&sup2;/(4 R<sub>S</sub>) = 144/24 = 6 W.</>,
    },
    {
      id: 'q8',
      type: 'numeric',
      prompt: <>A network has V<sub>oc</sub> = 10 V, I<sub>sc</sub> = 2 A. What is its Th&eacute;venin resistance, in ohms?</>,
      targetValue: 5,
      tolerance: 0.05,
      unit: '&Omega;',
      explanation: <>R<sub>th</sub> = V<sub>oc</sub>/I<sub>sc</sub> = 10/2 = 5 &Omega;.</>,
    },
    {
      id: 'q9',
      type: 'short-answer',
      prompt: <>The dual of nodal analysis, writing KVL around loops, is called &hellip;? (Two words or hyphenated.)</>,
      acceptedAnswers: ['mesh analysis', 'mesh-current analysis', 'mesh current analysis', 'loop analysis'],
      explanation: <>Mesh-current (loop) analysis. Together with nodal, the two systematic techniques for any planar linear network.</>,
    },
    {
      id: 'q10',
      type: 'short-answer',
      prompt: <>Norton&rsquo;s theorem is the dual of which theorem? (One word, surname.)</>,
      acceptedAnswers: ['thevenin', 'thévenin', "thevenin's", "thévenin's"],
      explanation: <>Th&eacute;venin and Norton equivalents are the voltage-source/current-source duals of the same linear network.</>,
    },
  ],
};

/* ────────────────────────────────────────────────────────────────────── */
/* Ch.14 — Semiconductors and transistors                                 */
/* ────────────────────────────────────────────────────────────────────── */

const CH14_QUIZ: ChapterQuiz = {
  chapterSlug: 'semiconductors',
  questions: [
    {
      id: 'q1',
      type: 'multiple-choice',
      prompt: <>The dominant charge carriers in n-type silicon are:</>,
      choices: [<>Holes.</>, <>Electrons.</>, <>Positrons.</>, <>Ions in the lattice.</>],
      correctIndex: 1,
      explanation: <>Donor impurities (P, As) push electrons into the conduction band &mdash; n-type. Acceptors (B) create holes for p-type<Cite id="streetman-banerjee-2015" in={CH14_SOURCES} />.</>,
    },
    {
      id: 'q2',
      type: 'multiple-choice',
      prompt: <>The Shockley diode equation is:</>,
      choices: [<>I = I<sub>s</sub> exp(qV/kT)</>, <>I = I<sub>s</sub>(exp(qV/nkT) &minus; 1)</>, <>I = V/R</>, <>I = I<sub>s</sub> qV/kT</>],
      correctIndex: 1,
      explanation: <>I = I<sub>s</sub>(exp(qV/nkT) &minus; 1). The &minus;1 keeps reverse-bias current bounded at &minus;I<sub>s</sub><Cite id="shockley-1949" in={CH14_SOURCES} />.</>,
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      prompt: <>In a BJT in the active region, &beta; relates:</>,
      choices: [<>I<sub>C</sub> = &beta; I<sub>B</sub></>, <>I<sub>B</sub> = &beta; I<sub>E</sub></>, <>I<sub>E</sub> = &beta; I<sub>C</sub></>, <>I<sub>C</sub> = &beta; V<sub>BE</sub></>],
      correctIndex: 0,
      explanation: <>&beta; = I<sub>C</sub>/I<sub>B</sub>, typically 50-300. A small base current controls a much larger collector current.</>,
    },
    {
      id: 'q4',
      type: 'multiple-choice',
      prompt: <>A MOSFET is in saturation when:</>,
      choices: [<>V<sub>DS</sub> &gt; V<sub>GS</sub> &minus; V<sub>T</sub> and V<sub>GS</sub> &gt; V<sub>T</sub></>, <>V<sub>DS</sub> &lt; V<sub>GS</sub> &minus; V<sub>T</sub></>, <>V<sub>GS</sub> &lt; V<sub>T</sub></>, <>V<sub>DS</sub> = 0</>],
      correctIndex: 0,
      explanation: <>Saturation needs the channel pinched at the drain end: V<sub>DS</sub> &ge; V<sub>OV</sub> with the gate above threshold<Cite id="sedra-smith-2014" in={CH14_SOURCES} />.</>,
    },
    {
      id: 'q5',
      type: 'true-false',
      prompt: <>A reverse-biased silicon diode conducts as freely as a forward-biased one.</>,
      choices: [<>True</>, <>False</>],
      correctIndex: 1,
      explanation: <>False. The depletion region widens; only the tiny saturation current I<sub>s</sub> flows until breakdown. That asymmetry is the rectifying action.</>,
    },
    {
      id: 'q6',
      type: 'true-false',
      prompt: <>MOSFETs have essentially infinite DC gate input impedance because of the SiO&#8322; gate dielectric.</>,
      choices: [<>True</>, <>False</>],
      correctIndex: 0,
      explanation: <>The oxide blocks DC gate current entirely. Bias networks see negligible loading &mdash; one big advantage over BJTs<Cite id="kahng-atalla-1960" in={CH14_SOURCES} />.</>,
    },
    {
      id: 'q7',
      type: 'numeric',
      prompt: <>A BJT with &beta; = 150 has I<sub>B</sub> = 20 &micro;A. What is I<sub>C</sub>, in milliamperes?</>,
      targetValue: 3,
      tolerance: 0.02,
      unit: 'mA',
      explanation: <>I<sub>C</sub> = &beta; I<sub>B</sub> = 150 &middot; 20 &micro;A = 3 mA.</>,
    },
    {
      id: 'q8',
      type: 'numeric',
      prompt: <>A BJT in the active region has I<sub>C</sub> = 1 mA. What is its small-signal transconductance g<sub>m</sub>, in millisiemens? (V<sub>T</sub> &asymp; 25.85 mV.)</>,
      targetValue: 38.68,
      tolerance: 0.05,
      unit: 'mS',
      explanation: <>g<sub>m</sub> = I<sub>C</sub>/V<sub>T</sub> = 1 mA/25.85 mV &approx; 38.7 mS<Cite id="razavi-2021" in={CH14_SOURCES} />.</>,
    },
    {
      id: 'q9',
      type: 'short-answer',
      prompt: <>What is the family acronym for the three-terminal device whose terminals are gate, drain, and source? (Acronym, one word.)</>,
      acceptedAnswers: ['mosfet', 'fet', 'mosfets'],
      explanation: <>Metal-Oxide-Semiconductor Field-Effect Transistor &mdash; MOSFET<Cite id="kahng-atalla-1960" in={CH14_SOURCES} />.</>,
    },
    {
      id: 'q10',
      type: 'short-answer',
      prompt: <>What process adds controlled impurities to silicon to create n-type or p-type material? (One word.)</>,
      acceptedAnswers: ['doping', 'dope', 'doped'],
      explanation: <>Doping introduces parts-per-million donor or acceptor atoms to set the carrier concentration.</>,
    },
  ],
};

/* ────────────────────────────────────────────────────────────────────── */
/* Ch.15 — Fourier and harmonic analysis                                  */
/* ────────────────────────────────────────────────────────────────────── */

const CH15_QUIZ: ChapterQuiz = {
  chapterSlug: 'fourier-harmonics',
  questions: [
    {
      id: 'q1',
      type: 'multiple-choice',
      prompt: <>Fourier&rsquo;s central claim (1822) is that any reasonably well-behaved periodic function decomposes into:</>,
      choices: [<>A sum of polynomials.</>, <>A sum of sines and cosines at integer multiples of a fundamental frequency.</>, <>An exponential decay.</>, <>A single sinusoid.</>],
      correctIndex: 1,
      explanation: <>f(t) = a&#8320;/2 + &sum; (a<sub>n</sub> cos n&omega;t + b<sub>n</sub> sin n&omega;t)<Cite id="fourier-1822" in={CH15_SOURCES} />.</>,
    },
    {
      id: 'q2',
      type: 'multiple-choice',
      prompt: <>A symmetric square wave contains:</>,
      choices: [<>Only the fundamental.</>, <>Only even harmonics.</>, <>Only odd harmonics.</>, <>All harmonics with equal amplitude.</>],
      correctIndex: 2,
      explanation: <>Odd harmonics only, with amplitudes 1/n: 1, 1/3, 1/5, 1/7, ...</>,
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      prompt: <>Parseval&rsquo;s theorem equates:</>,
      choices: [<>Time-mean and frequency-phase.</>, <>Mean-square in time and sum of squared Fourier coefficients.</>, <>Period and frequency.</>, <>Phase and amplitude.</>],
      correctIndex: 1,
      explanation: <>&lt;f&sup2;&gt; = &frac12; &sum;(a<sub>n</sub>&sup2; + b<sub>n</sub>&sup2;): total power in time = total power summed over harmonics.</>,
    },
    {
      id: 'q4',
      type: 'multiple-choice',
      prompt: <>The Cooley-Tukey FFT reduces the cost of an N-point DFT from O(N&sup2;) to:</>,
      choices: [<>O(N)</>, <>O(N log N)</>, <>O(N&sup3;/&sup2;)</>, <>O(2N)</>],
      correctIndex: 1,
      explanation: <>O(N log N). For N = 1024 that&rsquo;s 10240 vs 1048576 &mdash; the speedup that made digital signal processing practical<Cite id="cooley-tukey-1965" in={CH15_SOURCES} />.</>,
    },
    {
      id: 'q5',
      type: 'true-false',
      prompt: <>The Gibbs overshoot at discontinuities of a truncated Fourier series stays at about 9% no matter how many harmonics you include.</>,
      choices: [<>True</>, <>False</>],
      correctIndex: 0,
      explanation: <>The overshoot amplitude does not vanish as N&rarr;&infin;; it stays around 8.95% of the jump. Only its width shrinks<Cite id="bracewell-2000" in={CH15_SOURCES} />.</>,
    },
    {
      id: 'q6',
      type: 'true-false',
      prompt: <>A linear time-invariant filter scales and phase-shifts each Fourier component independently but cannot create new frequencies.</>,
      choices: [<>True</>, <>False</>],
      correctIndex: 0,
      explanation: <>LTI systems preserve the input&rsquo;s frequency content; new harmonics require nonlinearity<Cite id="oppenheim-willsky-1997" in={CH15_SOURCES} />.</>,
    },
    {
      id: 'q7',
      type: 'numeric',
      prompt: <>How many multiplies does a naive 64-point DFT need? (N&sup2;.)</>,
      targetValue: 4096,
      tolerance: 0.02,
      explanation: <>64&sup2; = 4096.</>,
    },
    {
      id: 'q8',
      type: 'numeric',
      prompt: <>How many for the FFT on 64 points (N log&#8322; N)?</>,
      targetValue: 384,
      tolerance: 0.05,
      explanation: <>64 &middot; 6 = 384. About a 10&times; speedup at this size; vastly more for larger N.</>,
    },
    {
      id: 'q9',
      type: 'short-answer',
      prompt: <>What three-letter acronym measures &ldquo;how distorted is this waveform compared to a pure sine?&rdquo;</>,
      acceptedAnswers: ['thd', 'total harmonic distortion'],
      explanation: <>Total Harmonic Distortion = (RMS of harmonics &ge; 2) / (RMS of fundamental).</>,
    },
    {
      id: 'q10',
      type: 'short-answer',
      prompt: <>What is the minimum sampling rate, in units of the highest frequency component, to reconstruct a band-limited signal? (A number or word.)</>,
      acceptedAnswers: ['2', 'two', 'twice', '2x', 'nyquist', 'nyquist rate'],
      explanation: <>Shannon-Nyquist: f<sub>s</sub> &gt; 2 f<sub>max</sub>. Below that, aliasing.</>,
    },
  ],
};

/* ────────────────────────────────────────────────────────────────────── */
/* Ch.16 — Filters, op-amps, transmission lines                           */
/* ────────────────────────────────────────────────────────────────────── */

const CH16_QUIZ: ChapterQuiz = {
  chapterSlug: 'filters-op-amps-tlines',
  questions: [
    {
      id: 'q1',
      type: 'multiple-choice',
      prompt: <>The corner (&minus;3 dB) frequency of a first-order RC low-pass is:</>,
      choices: [<>f<sub>c</sub> = RC</>, <>f<sub>c</sub> = 1/(RC)</>, <>f<sub>c</sub> = 1/(2&pi;RC)</>, <>f<sub>c</sub> = 2&pi;/RC</>],
      correctIndex: 2,
      explanation: <>f<sub>c</sub> = 1/(2&pi;RC). At f<sub>c</sub>, |H| = 1/&radic;2 = &minus;3 dB<Cite id="horowitz-hill-2015" in={CH16_SOURCES} />.</>,
    },
    {
      id: 'q2',
      type: 'multiple-choice',
      prompt: <>An ideal inverting op-amp with input R<sub>in</sub> and feedback R<sub>f</sub> has gain:</>,
      choices: [<>+R<sub>f</sub>/R<sub>in</sub></>, <>&minus;R<sub>f</sub>/R<sub>in</sub></>, <>R<sub>in</sub>/R<sub>f</sub></>, <>R<sub>in</sub> &middot; R<sub>f</sub></>],
      correctIndex: 1,
      explanation: <>V<sub>out</sub>/V<sub>in</sub> = &minus;R<sub>f</sub>/R<sub>in</sub> from the virtual-short approximation<Cite id="sedra-smith-2014" in={CH16_SOURCES} />.</>,
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      prompt: <>The characteristic impedance of a lossless transmission line is:</>,
      choices: [<>Z&#8320; = L&prime;/C&prime;</>, <>Z&#8320; = &radic;(L&prime;/C&prime;)</>, <>Z&#8320; = &radic;(L&prime; C&prime;)</>, <>Z&#8320; = C&prime;/L&prime;</>],
      correctIndex: 1,
      explanation: <>Z&#8320; = &radic;(L&prime;/C&prime;) per unit length<Cite id="pozar-2011" in={CH16_SOURCES} />.</>,
    },
    {
      id: 'q4',
      type: 'multiple-choice',
      prompt: <>The reflection coefficient at a load is:</>,
      choices: [<>&Gamma; = Z<sub>L</sub> + Z&#8320;</>, <>&Gamma; = Z<sub>L</sub>/Z&#8320;</>, <>&Gamma; = (Z<sub>L</sub> &minus; Z&#8320;)/(Z<sub>L</sub> + Z&#8320;)</>, <>&Gamma; = Z&#8320; &minus; Z<sub>L</sub></>],
      correctIndex: 2,
      explanation: <>&Gamma; = (Z<sub>L</sub> &minus; Z&#8320;)/(Z<sub>L</sub> + Z&#8320;). Matched load: &Gamma; = 0, no reflection.</>,
    },
    {
      id: 'q5',
      type: 'true-false',
      prompt: <>A wire can usually be treated as a lumped node when its length is much less than &lambda;/10 of the highest signal frequency.</>,
      choices: [<>True</>, <>False</>],
      correctIndex: 0,
      explanation: <>L &lt; &lambda;/10 is the standard rule of thumb. Above that, transmission-line effects (reflections, standing waves) start to matter<Cite id="johnson-graham-1993" in={CH16_SOURCES} />.</>,
    },
    {
      id: 'q6',
      type: 'true-false',
      prompt: <>Negative feedback in an op-amp circuit drives the difference between the two op-amp inputs to approximately zero.</>,
      choices: [<>True</>, <>False</>],
      correctIndex: 0,
      explanation: <>The virtual short: infinite open-loop gain plus finite output forces V&#8314; = V&#8315;. That single fact reduces most op-amp circuits to a resistor ratio.</>,
    },
    {
      id: 'q7',
      type: 'numeric',
      prompt: <>For RC low-pass with R = 1 k&Omega; and C = 100 nF, what is f<sub>c</sub>, in kHz?</>,
      targetValue: 1.592,
      tolerance: 0.05,
      unit: 'kHz',
      explanation: <>f<sub>c</sub> = 1/(2&pi;&middot;10&sup3;&middot;10&#8315;&#8311;) &approx; 1.59 kHz.</>,
    },
    {
      id: 'q8',
      type: 'numeric',
      prompt: <>An inverting amp with R<sub>in</sub> = 1 k&Omega;, R<sub>f</sub> = 47 k&Omega; sees V<sub>in</sub> = 50 mV. What is V<sub>out</sub>, in volts?</>,
      targetValue: -2.35,
      tolerance: 0.05,
      unit: 'V',
      explanation: <>V<sub>out</sub> = &minus;(47/1)(0.050) = &minus;2.35 V.</>,
    },
    {
      id: 'q9',
      type: 'short-answer',
      prompt: <>The log-log magnitude-vs-frequency plot of a filter is called a &hellip; plot? (One word, surname.)</>,
      acceptedAnswers: ['bode', 'bode plot'],
      explanation: <>Bode plot &mdash; first-order filter asymptotes collapse to two straight lines.</>,
    },
    {
      id: 'q10',
      type: 'short-answer',
      prompt: <>What is the standard characteristic impedance, in ohms, for RF coax used in radio and instrumentation? (A number.)</>,
      acceptedAnswers: ['50', '50 ohms', '50 ohm', '50ohm', '50Ω', '50 Ω'],
      explanation: <>50 &Omega; (the long-standing RF/lab standard, a compromise between peak power and low loss). TV cable uses 75 &Omega;.</>,
    },
  ],
};

/* ────────────────────────────────────────────────────────────────────── */
/* Ch.17 — Materials                                                      */
/* ────────────────────────────────────────────────────────────────────── */

const CH17_QUIZ: ChapterQuiz = {
  chapterSlug: 'materials',
  questions: [
    {
      id: 'q1',
      type: 'multiple-choice',
      prompt: <>Inserting a dielectric of &epsilon;<sub>r</sub> &gt; 1 between capacitor plates changes the capacitance by what factor?</>,
      choices: [<>1/&epsilon;<sub>r</sub></>, <>&epsilon;<sub>r</sub></>, <>1 + &epsilon;<sub>r</sub></>, <>&epsilon;<sub>r</sub>&sup2;</>],
      correctIndex: 1,
      explanation: <>C = &epsilon;<sub>r</sub> &middot; C<sub>vacuum</sub>. Bound charge in the dielectric partially cancels the applied field<Cite id="griffiths-2017" in={CH17_SOURCES} />.</>,
    },
    {
      id: 'q2',
      type: 'multiple-choice',
      prompt: <>A diamagnetic material has &mu;<sub>r</sub>:</>,
      choices: [<>Slightly less than 1.</>, <>Slightly greater than 1.</>, <>Many times greater than 1.</>, <>Exactly zero.</>],
      correctIndex: 0,
      explanation: <>Diamagnets weakly oppose an applied field (&chi;<sub>m</sub> &lt; 0): copper, water, bismuth. &mu;<sub>r</sub> is fractionally below 1.</>,
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      prompt: <>A ferromagnet has:</>,
      choices: [<>&mu;<sub>r</sub> &approx; 1 always.</>, <>&mu;<sub>r</sub> slightly less than 1.</>, <>&mu;<sub>r</sub> &gt;&gt; 1 with hysteresis below the Curie temperature.</>, <>&mu;<sub>r</sub> = 0.</>],
      correctIndex: 2,
      explanation: <>Iron, nickel, cobalt: domains align with the applied field and remember it, producing the characteristic B-H hysteresis loop<Cite id="weiss-1907" in={CH17_SOURCES} />.</>,
    },
    {
      id: 'q4',
      type: 'multiple-choice',
      prompt: <>The relation &epsilon;<sub>r</sub> = 1 + &chi;<sub>e</sub> defines:</>,
      choices: [<>The Curie constant.</>, <>The electric susceptibility.</>, <>The dielectric loss tangent.</>, <>The Larmor frequency.</>],
      correctIndex: 1,
      explanation: <>&chi;<sub>e</sub> is the electric susceptibility; &epsilon;<sub>r</sub> = 1 + &chi;<sub>e</sub>, &mu;<sub>r</sub> = 1 + &chi;<sub>m</sub>.</>,
    },
    {
      id: 'q5',
      type: 'true-false',
      prompt: <>Heating a permanent magnet above its Curie temperature destroys its magnetization.</>,
      choices: [<>True</>, <>False</>],
      correctIndex: 0,
      explanation: <>Above T<sub>C</sub> thermal agitation overwhelms the exchange coupling, domain alignment is lost, and the material reverts to paramagnetism<Cite id="weiss-1907" in={CH17_SOURCES} />.</>,
    },
    {
      id: 'q6',
      type: 'true-false',
      prompt: <>The speed of light in a non-magnetic dielectric is c/&radic;&epsilon;<sub>r</sub>; equivalently, the refractive index is n = &radic;(&epsilon;<sub>r</sub> &mu;<sub>r</sub>).</>,
      choices: [<>True</>, <>False</>],
      correctIndex: 0,
      explanation: <>v = c/n = c/&radic;(&epsilon;<sub>r</sub>&mu;<sub>r</sub>). At optical frequencies &mu;<sub>r</sub> &asymp; 1 for most materials, so n &asymp; &radic;&epsilon;<sub>r</sub>.</>,
    },
    {
      id: 'q7',
      type: 'numeric',
      prompt: <>A vacuum cap of <strong>100 pF</strong> has its gap filled with a dielectric of &epsilon;<sub>r</sub> = 6.7 (mica). What is the new C, in pF?</>,
      targetValue: 670,
      tolerance: 0.02,
      unit: 'pF',
      explanation: <>C = &epsilon;<sub>r</sub> &middot; 100 pF = 670 pF<Cite id="moulson-herbert-2003" in={CH17_SOURCES} />.</>,
    },
    {
      id: 'q8',
      type: 'numeric',
      prompt: <>An iron core has &mu;<sub>r</sub> = 5000. By what factor does it boost the inductance of a coil compared to an air core?</>,
      targetValue: 5000,
      tolerance: 0.02,
      explanation: <>L = &mu;<sub>r</sub> L&#8320;. A 2 mH air-cored coil becomes 10 H with this iron.</>,
    },
    {
      id: 'q9',
      type: 'short-answer',
      prompt: <>What is the alignment of electric dipoles inside a dielectric under an external field called? (One word.)</>,
      acceptedAnswers: ['polarization', 'polarisation'],
      explanation: <>Polarization P is the dipole moment per unit volume; it produces the bound surface charges that partially cancel the applied E.</>,
    },
    {
      id: 'q10',
      type: 'short-answer',
      prompt: <>What is the temperature above which a ferromagnet loses its spontaneous magnetization called? (Two words.)</>,
      acceptedAnswers: ['curie temperature', 'curie point', 'curie-temperature'],
      explanation: <>The Curie temperature T<sub>C</sub>. Iron&rsquo;s is 1043 K; nickel&rsquo;s is 627 K.</>,
    },
  ],
};

/* ────────────────────────────────────────────────────────────────────── */
/* Ch.18 — Optics from electromagnetism                                   */
/* ────────────────────────────────────────────────────────────────────── */

const CH18_QUIZ: ChapterQuiz = {
  chapterSlug: 'optics',
  questions: [
    {
      id: 'q1',
      type: 'multiple-choice',
      prompt: <>Snell&rsquo;s law for refraction reads:</>,
      choices: [<>n&#8321; sin&theta;&#8321; = n&#8322; sin&theta;&#8322;</>, <>n&#8321; cos&theta;&#8321; = n&#8322; cos&theta;&#8322;</>, <>n&#8321;&sup2; + n&#8322;&sup2; = sin&theta;&#8321; sin&theta;&#8322;</>, <>&theta;&#8321; = &theta;&#8322;</>],
      correctIndex: 0,
      explanation: <>Snell&rsquo;s law falls out of boundary conditions on tangential E and B at an interface<Cite id="hecht-2017" in={CH18_SOURCES} />.</>,
    },
    {
      id: 'q2',
      type: 'multiple-choice',
      prompt: <>Brewster&rsquo;s angle is the incidence angle at which:</>,
      choices: [<>Total internal reflection occurs.</>, <>Reflected light is completely polarized perpendicular to the plane of incidence.</>, <>The transmitted wave vanishes.</>, <>Frequency doubles.</>],
      correctIndex: 1,
      explanation: <>tan(&theta;<sub>B</sub>) = n&#8322;/n&#8321;. At this angle the p-polarized component is zero in the reflected beam<Cite id="brewster-1815" in={CH18_SOURCES} />.</>,
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      prompt: <>Total internal reflection requires:</>,
      choices: [<>Light going from low-n to high-n medium.</>, <>Light going from high-n to low-n medium at an angle greater than &theta;<sub>c</sub>.</>, <>The wavelength to be in the UV.</>, <>The surface to be metallic.</>],
      correctIndex: 1,
      explanation: <>sin&theta;<sub>c</sub> = n&#8322;/n&#8321; (with n&#8321; &gt; n&#8322;). Above &theta;<sub>c</sub>, no transmitted wave exists. The principle behind fibre optics.</>,
    },
    {
      id: 'q4',
      type: 'multiple-choice',
      prompt: <>A thin-lens object distance d<sub>o</sub> and image distance d<sub>i</sub> satisfy:</>,
      choices: [<>1/f = 1/d<sub>o</sub> + 1/d<sub>i</sub></>, <>f = d<sub>o</sub> + d<sub>i</sub></>, <>f = d<sub>o</sub> d<sub>i</sub></>, <>1/f = 1/d<sub>o</sub> &minus; 1/d<sub>i</sub></>],
      correctIndex: 0,
      explanation: <>The thin-lens equation. With d<sub>o</sub>&rarr;&infin; (incoming parallel rays), d<sub>i</sub> = f &mdash; the focal plane.</>,
    },
    {
      id: 'q5',
      type: 'true-false',
      prompt: <>When light enters a denser medium its frequency stays the same but its wavelength gets shorter.</>,
      choices: [<>True</>, <>False</>],
      correctIndex: 0,
      explanation: <>Frequency is set by the source. v = c/n drops, so &lambda; = v/f shortens by the same factor.</>,
    },
    {
      id: 'q6',
      type: 'true-false',
      prompt: <>A laser&rsquo;s spatial and temporal coherence both arise from stimulated emission and the resonator&rsquo;s mode selection.</>,
      choices: [<>True</>, <>False</>],
      correctIndex: 0,
      explanation: <>Stimulated emission produces in-phase photons; the resonator filters to a single (or few) longitudinal modes. Together they give the coherence that ordinary thermal sources lack<Cite id="maiman-1960" in={CH18_SOURCES} />.</>,
    },
    {
      id: 'q7',
      type: 'numeric',
      prompt: <>Critical angle for total internal reflection at water-air (n&#8321; = 1.33). Give &theta;<sub>c</sub> in degrees.</>,
      targetValue: 48.8,
      tolerance: 0.05,
      unit: '&deg;',
      explanation: <>sin&theta;<sub>c</sub> = 1.00/1.33 &approx; 0.752, &theta;<sub>c</sub> &approx; 48.8&deg;.</>,
    },
    {
      id: 'q8',
      type: 'numeric',
      prompt: <>Brewster&rsquo;s angle for an air-glass interface with n = 1.52. Give &theta;<sub>B</sub> in degrees.</>,
      targetValue: 56.7,
      tolerance: 0.05,
      unit: '&deg;',
      explanation: <>&theta;<sub>B</sub> = arctan(1.52) &approx; 56.7&deg;.</>,
    },
    {
      id: 'q9',
      type: 'short-answer',
      prompt: <>The wavelength-dependence of refractive index that splits white light through a prism is called &hellip;? (One word.)</>,
      acceptedAnswers: ['dispersion', 'chromatic dispersion'],
      explanation: <>Dispersion: n(&lambda;) decreases with &lambda; in normal materials, so blue refracts more than red.</>,
    },
    {
      id: 'q10',
      type: 'short-answer',
      prompt: <>What experiment in 1804 demonstrated the wave nature of light via interference? (Two-word name or surname.)</>,
      acceptedAnswers: ['young', "young's", "young's experiment", "young's double slit", "double-slit", 'double slit'],
      explanation: <>Thomas Young&rsquo;s double-slit experiment (1804) showed the alternating bright-dark fringes only consistent with interference<Cite id="young-1804" in={CH18_SOURCES} />.</>,
    },
  ],
};

/* ────────────────────────────────────────────────────────────────────── */
/* Ch.19 — Antennas and radiation                                         */
/* ────────────────────────────────────────────────────────────────────── */

const CH19_QUIZ: ChapterQuiz = {
  chapterSlug: 'antennas',
  questions: [
    {
      id: 'q1',
      type: 'multiple-choice',
      prompt: <>The far-field radiation pattern of an ideal short dipole varies as:</>,
      choices: [<>cos&sup2;&theta;</>, <>sin&sup2;&theta;</>, <>tan&sup2;&theta;</>, <>1 (isotropic)</>],
      correctIndex: 1,
      explanation: <>I(&theta;) &prop; sin&sup2;&theta;: zero along the axis, maximum broadside. No antenna in 3D space radiates isotropically<Cite id="balanis-2016" in={CH19_SOURCES} />.</>,
    },
    {
      id: 'q2',
      type: 'multiple-choice',
      prompt: <>The Friis transmission equation is:</>,
      choices: [<>P<sub>r</sub> = P<sub>t</sub> G<sub>t</sub> G<sub>r</sub> (&lambda;/4&pi;d)&sup2;</>, <>P<sub>r</sub> = P<sub>t</sub> / d</>, <>P<sub>r</sub> = P<sub>t</sub> G<sub>t</sub> G<sub>r</sub> &lambda;d</>, <>P<sub>r</sub> = P<sub>t</sub> &middot; 4&pi;d&sup2;</>],
      correctIndex: 0,
      explanation: <>The (&lambda;/4&pi;d)&sup2; factor captures both inverse-square spreading and the effective aperture<Cite id="friis-1946" in={CH19_SOURCES} />.</>,
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      prompt: <>A half-wave dipole resonates when:</>,
      choices: [<>L = &lambda;/2</>, <>L = &lambda;</>, <>L = &lambda;/4</>, <>L = 2&lambda;</>],
      correctIndex: 0,
      explanation: <>A half-wave dipole has L = &lambda;/2 and presents a real input impedance of approximately 73 &Omega; at resonance.</>,
    },
    {
      id: 'q4',
      type: 'multiple-choice',
      prompt: <>Beam steering in a phased array is achieved by:</>,
      choices: [<>Mechanically rotating the antenna.</>, <>Introducing a progressive phase shift &Delta;&phi; between adjacent elements.</>, <>Changing the carrier frequency.</>, <>Reducing transmit power.</>],
      correctIndex: 1,
      explanation: <>Adjacent elements driven with &Delta;&phi; create constructive interference at angle sin&theta; = &lambda;&Delta;&phi;/(2&pi;d), so changing &Delta;&phi; sweeps the beam<Cite id="balanis-2016" in={CH19_SOURCES} />.</>,
    },
    {
      id: 'q5',
      type: 'true-false',
      prompt: <>An antenna is a reciprocal device: its transmit and receive patterns (and gains) are identical.</>,
      choices: [<>True</>, <>False</>],
      correctIndex: 0,
      explanation: <>Reciprocity: the same antenna has the same gain pattern, polarization, and impedance in either direction.</>,
    },
    {
      id: 'q6',
      type: 'true-false',
      prompt: <>The far-field region of an aperture antenna of largest dimension D starts at approximately 2D&sup2;/&lambda;.</>,
      choices: [<>True</>, <>False</>],
      correctIndex: 0,
      explanation: <>r &gt; 2D&sup2;/&lambda; defines Fraunhofer/far-field, where the field has settled into the 1/r angular pattern.</>,
    },
    {
      id: 'q7',
      type: 'numeric',
      prompt: <>What is the half-wave-dipole length for a 2.4 GHz Wi-Fi carrier, in cm? (c = 3&times;10&#8312; m/s.)</>,
      targetValue: 6.25,
      tolerance: 0.05,
      unit: 'cm',
      explanation: <>&lambda; = c/f = 0.125 m; L = &lambda;/2 = 6.25 cm.</>,
    },
    {
      id: 'q8',
      type: 'numeric',
      prompt: <>Compute the relative intensity of a dipole at &theta; = 60&deg; vs the broadside maximum (&theta; = 90&deg;).</>,
      targetValue: 0.75,
      tolerance: 0.05,
      explanation: <>I(60&deg;)/I(90&deg;) = sin&sup2;(60&deg;)/sin&sup2;(90&deg;) = (&radic;3/2)&sup2; = 0.75.</>,
    },
    {
      id: 'q9',
      type: 'short-answer',
      prompt: <>The Japanese engineer who developed the multi-element directional array in 1928 was &hellip;? (One word, surname.)</>,
      acceptedAnswers: ['yagi', 'hidetsugu yagi', 'h. yagi'],
      explanation: <>Hidetsugu Yagi (and Uda) developed the Yagi-Uda array, now ubiquitous on rooftops as a TV antenna<Cite id="yagi-1928" in={CH19_SOURCES} />.</>,
    },
    {
      id: 'q10',
      type: 'short-answer',
      prompt: <>What is the unit of antenna gain when referenced to an isotropic radiator? (One word.)</>,
      acceptedAnswers: ['dbi', 'db', 'decibels isotropic'],
      explanation: <>dBi: decibels relative to an isotropic radiator. A half-wave dipole has 2.15 dBi.</>,
    },
  ],
};

/* ────────────────────────────────────────────────────────────────────── */
/* Ch.20 — Motors                                                         */
/* ────────────────────────────────────────────────────────────────────── */

const CH20_QUIZ: ChapterQuiz = {
  chapterSlug: 'motors',
  questions: [
    {
      id: 'q1',
      type: 'multiple-choice',
      prompt: <>The torque on a single rectangular current loop of area A, N turns, current I, in field B at angle &theta; is:</>,
      choices: [<>&tau; = N I A B cos&theta;</>, <>&tau; = N I A B sin&theta;</>, <>&tau; = N I A / B</>, <>&tau; = N I&sup2; A B</>],
      correctIndex: 1,
      explanation: <>&tau; = NIAB sin&theta;, derived from F = IL &times; B on each side and summing torque arms.</>,
    },
    {
      id: 'q2',
      type: 'multiple-choice',
      prompt: <>The function of a commutator in a brushed DC motor is to:</>,
      choices: [<>Limit the maximum current.</>, <>Reverse the current in the rotor windings as it turns so torque always pushes the same way.</>, <>Convert AC to DC.</>, <>Smooth out ripple.</>],
      correctIndex: 1,
      explanation: <>The split-ring commutator + brushes switch the rotor current twice per revolution, keeping the magnetic torque always pushing the rotor forward.</>,
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      prompt: <>Back-EMF in a DC motor:</>,
      choices: [<>Speeds up the motor.</>, <>Opposes the supply voltage, growing with rotor speed.</>, <>Increases starting current.</>, <>Has no effect.</>],
      correctIndex: 1,
      explanation: <>E<sub>back</sub> = k<sub>e</sub>&omega;. The terminal current I = (V &minus; E<sub>back</sub>)/R drops as the motor accelerates, which is the self-limiting mechanism.</>,
    },
    {
      id: 'q4',
      type: 'multiple-choice',
      prompt: <>The synchronous speed of a 4-pole AC induction motor on a 60 Hz line is:</>,
      choices: [<>900 rpm</>, <>1800 rpm</>, <>3600 rpm</>, <>7200 rpm</>],
      correctIndex: 1,
      explanation: <>n<sub>s</sub> = 120f/p = 120&middot;60/4 = 1800 rpm<Cite id="fitzgerald-kingsley-umans-2014" in={CH20_SOURCES} />.</>,
    },
    {
      id: 'q5',
      type: 'true-false',
      prompt: <>An AC induction motor (Tesla 1888) has no permanent magnet on its rotor &mdash; rotor current is induced by the rotating stator field.</>,
      choices: [<>True</>, <>False</>],
      correctIndex: 0,
      explanation: <>Squirrel-cage rotors are short-circuited copper or aluminium bars; they carry induced currents only, no permanent magnet<Cite id="tesla-1888" in={CH20_SOURCES} />.</>,
    },
    {
      id: 'q6',
      type: 'true-false',
      prompt: <>A synchronous motor inherently has zero slip when operating in steady state.</>,
      choices: [<>True</>, <>False</>],
      correctIndex: 0,
      explanation: <>Synchronous machines lock to the line frequency (s = 0); induction machines need a small slip to develop torque.</>,
    },
    {
      id: 'q7',
      type: 'numeric',
      prompt: <>A 12 V brushed DC motor has armature resistance 1 &Omega; and runs at speed where back-EMF is 10 V. What current flows, in amperes?</>,
      targetValue: 2,
      tolerance: 0.05,
      unit: 'A',
      explanation: <>I = (V &minus; E<sub>back</sub>)/R = (12 &minus; 10)/1 = 2 A.</>,
    },
    {
      id: 'q8',
      type: 'numeric',
      prompt: <>An induction motor has n<sub>s</sub> = 1800 rpm and operates at 1740 rpm. What is the slip, in percent?</>,
      targetValue: 3.33,
      tolerance: 0.05,
      unit: '%',
      explanation: <>s = (n<sub>s</sub> &minus; n)/n<sub>s</sub> = (1800 &minus; 1740)/1800 &approx; 3.33%.</>,
    },
    {
      id: 'q9',
      type: 'short-answer',
      prompt: <>The mechanical part of a brushed motor whose split contacts reverse rotor current as the shaft spins is called the &hellip;? (One word.)</>,
      acceptedAnswers: ['commutator', 'split-ring commutator', 'split ring commutator'],
      explanation: <>The commutator is the split-ring mechanical inverter that keeps torque uni-directional in a brushed DC motor.</>,
    },
    {
      id: 'q10',
      type: 'short-answer',
      prompt: <>Who patented the rotating magnetic field and AC induction motor in 1888? (One word, surname.)</>,
      acceptedAnswers: ['tesla', 'nikola tesla'],
      explanation: <>Nikola Tesla, 1888<Cite id="tesla-1888" in={CH20_SOURCES} />.</>,
    },
  ],
};

/* ────────────────────────────────────────────────────────────────────── */
/* Ch.21 — Generators and the grid                                        */
/* ────────────────────────────────────────────────────────────────────── */

const CH21_QUIZ: ChapterQuiz = {
  chapterSlug: 'generators',
  questions: [
    {
      id: 'q1',
      type: 'multiple-choice',
      prompt: <>The peak EMF of a coil with N turns, area A, rotating at &omega; in field B is:</>,
      choices: [<>NBA&omega;</>, <>NBA/&omega;</>, <>NB/A</>, <>BA&omega;&sup2;</>],
      correctIndex: 0,
      explanation: <>&epsilon;(t) = NBA&omega;sin(&omega;t), peak NBA&omega;. The output is naturally sinusoidal &mdash; that&rsquo;s why AC won the standardization fight<Cite id="faraday-1832" in={CH21_SOURCES} />.</>,
    },
    {
      id: 'q2',
      type: 'multiple-choice',
      prompt: <>For a 60 Hz grid, a 4-pole synchronous generator must spin at:</>,
      choices: [<>900 rpm</>, <>1800 rpm</>, <>3000 rpm</>, <>3600 rpm</>],
      correctIndex: 1,
      explanation: <>n = 120f/p = 120&middot;60/4 = 1800 rpm<Cite id="fitzgerald-kingsley-umans-2014" in={CH21_SOURCES} />.</>,
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      prompt: <>A three-phase generator&rsquo;s three windings are offset by:</>,
      choices: [<>60&deg;</>, <>90&deg;</>, <>120&deg;</>, <>180&deg;</>],
      correctIndex: 2,
      explanation: <>Three phases at 120&deg; spacing sum (in a balanced load) to zero instantaneous current in the neutral, enabling power transfer with the minimum number of conductors.</>,
    },
    {
      id: 'q4',
      type: 'multiple-choice',
      prompt: <>The power angle &delta; of a synchronous generator controls primarily:</>,
      choices: [<>Frequency.</>, <>Real power output.</>, <>Voltage magnitude.</>, <>Reactive power only.</>],
      correctIndex: 1,
      explanation: <>P = (|V<sub>grid</sub>||E<sub>f</sub>|/X<sub>s</sub>) sin&delta;. Real-power throughput is set by the load angle; excitation controls Q<Cite id="kundur-1994-power-stability" in={CH21_SOURCES} />.</>,
    },
    {
      id: 'q5',
      type: 'true-false',
      prompt: <>Synchronous generators across an interconnection all spin in lockstep with the grid frequency.</>,
      choices: [<>True</>, <>False</>],
      correctIndex: 0,
      explanation: <>By definition, every synchronous machine on the same interconnection has its rotor angle locked into the same electrical frequency &mdash; that&rsquo;s what makes the grid coherent.</>,
    },
    {
      id: 'q6',
      type: 'true-false',
      prompt: <>The grid frequency drifts down when generation cannot keep up with load, because rotors are slowing as they pull kinetic energy out of their stored inertia.</>,
      choices: [<>True</>, <>False</>],
      correctIndex: 0,
      explanation: <>Mismatch: load &gt; generation pulls energy from the rotating mass, slowing the rotors and dropping f. df/dt = &minus;&Delta;P/H<sub>sys</sub><Cite id="kundur-1994-power-stability" in={CH21_SOURCES} />.</>,
    },
    {
      id: 'q7',
      type: 'numeric',
      prompt: <>A 100-turn, 0.02 m&sup2; coil rotates at 377 rad/s in a 0.5 T field. What is the peak EMF, in volts?</>,
      targetValue: 377,
      tolerance: 0.05,
      unit: 'V',
      explanation: <>&epsilon;<sub>peak</sub> = NBA&omega; = 100 &middot; 0.5 &middot; 0.02 &middot; 377 = 377 V.</>,
    },
    {
      id: 'q8',
      type: 'numeric',
      prompt: <>A 40-pole hydroelectric generator must produce 60 Hz. What rotor speed, in rpm?</>,
      targetValue: 180,
      tolerance: 0.05,
      unit: 'rpm',
      explanation: <>n = 120 &middot; 60 / 40 = 180 rpm. Hydro turbines run slow, so generators have many poles<Cite id="grainger-power-systems-2003" in={CH21_SOURCES} />.</>,
    },
    {
      id: 'q9',
      type: 'short-answer',
      prompt: <>What is the standard grid frequency in North America, in Hz?</>,
      acceptedAnswers: ['60', '60 hz', '60hz'],
      explanation: <>60 Hz in North America; 50 Hz in Europe and most of Asia. The choice locked in around the early 20th century<Cite id="grainger-power-systems-2003" in={CH21_SOURCES} />.</>,
    },
    {
      id: 'q10',
      type: 'short-answer',
      prompt: <>What is the difference between rotor speed and synchronous speed, divided by synchronous speed, called? (One word.)</>,
      acceptedAnswers: ['slip'],
      explanation: <>Slip s = (n<sub>s</sub> &minus; n)/n<sub>s</sub>. Zero for synchronous machines; a few percent for induction machines.</>,
    },
  ],
};

/* ────────────────────────────────────────────────────────────────────── */
/* Ch.22 — Magnetically coupled circuits                                  */
/* ────────────────────────────────────────────────────────────────────── */

const CH22_QUIZ: ChapterQuiz = {
  chapterSlug: 'magnetically-coupled-circuits',
  questions: [
    {
      id: 'q1',
      type: 'multiple-choice',
      prompt: <>Mutual inductance M relates voltage in coil 2 to:</>,
      choices: [<>I<sub>1</sub></>, <>dI<sub>1</sub>/dt</>, <>V<sub>1</sub></>, <>&omega;</>],
      correctIndex: 1,
      explanation: <>v<sub>2</sub> = M dI<sub>1</sub>/dt (open-circuit on coil 2). Symmetric in either direction: M<sub>12</sub> = M<sub>21</sub><Cite id="henry-1832" in={CH22_SOURCES} />.</>,
    },
    {
      id: 'q2',
      type: 'multiple-choice',
      prompt: <>The coupling coefficient k between two coils is:</>,
      choices: [<>k = M / (L<sub>1</sub> L<sub>2</sub>)</>, <>k = M&sup2; / (L<sub>1</sub> L<sub>2</sub>)</>, <>k = M / &radic;(L<sub>1</sub> L<sub>2</sub>)</>, <>k = &radic;M / (L<sub>1</sub> + L<sub>2</sub>)</>],
      correctIndex: 2,
      explanation: <>k = M/&radic;(L<sub>1</sub>L<sub>2</sub>), with 0 &le; k &le; 1. k = 1 is the perfect-coupling limit, never quite reached in practice.</>,
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      prompt: <>Two ideally coupled coils with L<sub>1</sub> = L<sub>2</sub> = 4 mH and k = 0.5 have M equal to:</>,
      choices: [<>1 mH</>, <>2 mH</>, <>4 mH</>, <>8 mH</>],
      correctIndex: 1,
      explanation: <>M = k&radic;(L<sub>1</sub>L<sub>2</sub>) = 0.5 &middot; &radic;16 = 0.5 &middot; 4 = 2 mH.</>,
    },
    {
      id: 'q4',
      type: 'multiple-choice',
      prompt: <>Two coupled coils in series-aiding (currents in agreement with the dot convention) have:</>,
      choices: [<>L<sub>eq</sub> = L<sub>1</sub> + L<sub>2</sub> &minus; 2M</>, <>L<sub>eq</sub> = L<sub>1</sub> + L<sub>2</sub> + 2M</>, <>L<sub>eq</sub> = L<sub>1</sub> L<sub>2</sub> / (L<sub>1</sub> + L<sub>2</sub>)</>, <>L<sub>eq</sub> = L<sub>1</sub> + L<sub>2</sub></>],
      correctIndex: 1,
      explanation: <>Series-aiding: L<sub>eq</sub> = L<sub>1</sub> + L<sub>2</sub> + 2M. Series-opposing flips the sign of M.</>,
    },
    {
      id: 'q5',
      type: 'true-false',
      prompt: <>The dot convention indicates the relative winding sense and tells you whether to add or subtract M in coupled-coil equations.</>,
      choices: [<>True</>, <>False</>],
      correctIndex: 0,
      explanation: <>Currents entering dotted terminals together yield aiding fluxes (M positive); opposite enters give opposing fluxes (M negative). The dots keep signs honest.</>,
    },
    {
      id: 'q6',
      type: 'true-false',
      prompt: <>The reflected impedance into the primary of a coupled-coil pair driving a load Z<sub>L</sub> on the secondary is approximately (&omega;M)&sup2; / Z<sub>L</sub> at high coupling and high frequency.</>,
      choices: [<>True</>, <>False</>],
      correctIndex: 0,
      explanation: <>Z<sub>refl</sub> = (&omega;M)&sup2;/(j&omega;L<sub>2</sub> + Z<sub>L</sub>); for Z<sub>L</sub> dominating, Z<sub>refl</sub> &asymp; (&omega;M)&sup2;/Z<sub>L</sub><Cite id="hayt-kemmerly-durbin-2018" in={CH22_SOURCES} />.</>,
    },
    {
      id: 'q7',
      type: 'numeric',
      prompt: <>L<sub>1</sub> = 1 mH, L<sub>2</sub> = 4 mH, perfectly coupled (k = 1). What is M<sub>max</sub>, in mH?</>,
      targetValue: 2,
      tolerance: 0.02,
      unit: 'mH',
      explanation: <>M<sub>max</sub> = &radic;(L<sub>1</sub>L<sub>2</sub>) = &radic;4 = 2 mH.</>,
    },
    {
      id: 'q8',
      type: 'numeric',
      prompt: <>Two coupled coils have L<sub>aid</sub> = 19 mH and L<sub>opp</sub> = 7 mH (series tests). What is M, in mH?</>,
      targetValue: 3,
      tolerance: 0.05,
      unit: 'mH',
      explanation: <>M = (L<sub>aid</sub> &minus; L<sub>opp</sub>)/4 = (19 &minus; 7)/4 = 3 mH. Classic two-test method.</>,
    },
    {
      id: 'q9',
      type: 'short-answer',
      prompt: <>What schematic mark indicates the relative winding polarity of two coupled coils? (One word.)</>,
      acceptedAnswers: ['dot', 'dots', 'dot convention', 'the dot'],
      explanation: <>A small dot at one end of each coil indicates the &ldquo;same-sign&rdquo; terminals so designers can decide whether to add or subtract M.</>,
    },
    {
      id: 'q10',
      type: 'short-answer',
      prompt: <>Inductance arising from one coil&rsquo;s field linking only itself is called &hellip; inductance? (One word.)</>,
      acceptedAnswers: ['self', 'self-inductance', 'self inductance'],
      explanation: <>Self-inductance L: the proportionality of EMF to its own dI/dt. Mutual inductance M is the cross term.</>,
    },
  ],
};

/* ────────────────────────────────────────────────────────────────────── */
/* Ch.23 — Transformers                                                   */
/* ────────────────────────────────────────────────────────────────────── */

const CH23_QUIZ: ChapterQuiz = {
  chapterSlug: 'transformers',
  questions: [
    {
      id: 'q1',
      type: 'multiple-choice',
      prompt: <>An ideal transformer relates voltages and turns by:</>,
      choices: [<>V<sub>s</sub>/V<sub>p</sub> = N<sub>p</sub>/N<sub>s</sub></>, <>V<sub>s</sub>/V<sub>p</sub> = N<sub>s</sub>/N<sub>p</sub></>, <>V<sub>s</sub> = V<sub>p</sub> &middot; (N<sub>p</sub> N<sub>s</sub>)</>, <>V<sub>s</sub> = V<sub>p</sub> &minus; I R</>],
      correctIndex: 1,
      explanation: <>V<sub>s</sub>/V<sub>p</sub> = N<sub>s</sub>/N<sub>p</sub>. Ratios follow directly from V = N d&Phi;/dt with a shared flux<Cite id="faraday-1832" in={CH23_SOURCES} />.</>,
    },
    {
      id: 'q2',
      type: 'multiple-choice',
      prompt: <>An ideal transformer&rsquo;s current ratio is:</>,
      choices: [<>I<sub>s</sub>/I<sub>p</sub> = N<sub>s</sub>/N<sub>p</sub></>, <>I<sub>s</sub>/I<sub>p</sub> = N<sub>p</sub>/N<sub>s</sub></>, <>I<sub>s</sub>/I<sub>p</sub> = 1</>, <>I<sub>s</sub>/I<sub>p</sub> = (N<sub>p</sub> N<sub>s</sub>)</>],
      correctIndex: 1,
      explanation: <>Current ratio inverts the voltage ratio: I<sub>s</sub>/I<sub>p</sub> = N<sub>p</sub>/N<sub>s</sub>. V<sub>p</sub>I<sub>p</sub> = V<sub>s</sub>I<sub>s</sub> (ideal).</>,
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      prompt: <>An impedance Z<sub>L</sub> on the secondary, referred to the primary side, appears as:</>,
      choices: [<>Z<sub>p</sub> = (N<sub>s</sub>/N<sub>p</sub>)&sup2; Z<sub>L</sub></>, <>Z<sub>p</sub> = (N<sub>p</sub>/N<sub>s</sub>)&sup2; Z<sub>L</sub></>, <>Z<sub>p</sub> = (N<sub>p</sub>/N<sub>s</sub>) Z<sub>L</sub></>, <>Z<sub>p</sub> = Z<sub>L</sub></>],
      correctIndex: 1,
      explanation: <>Z<sub>p</sub> = (N<sub>p</sub>/N<sub>s</sub>)&sup2; Z<sub>L</sub>. Squared because both V and I scale, and Z = V/I<Cite id="fitzgerald-kingsley-umans-2014" in={CH23_SOURCES} />.</>,
    },
    {
      id: 'q4',
      type: 'multiple-choice',
      prompt: <>The reason the grid steps up to hundreds of kV for transmission is:</>,
      choices: [<>Easier insulation.</>, <>P<sub>loss</sub> &prop; P&sup2;R/V&sup2;, so higher V means lower I and dramatically lower I&sup2;R losses.</>, <>Higher V increases mechanical strength.</>, <>To reduce inductive reactance.</>],
      correctIndex: 1,
      explanation: <>For a fixed delivered power, I = P/V; resistive loss in transmission is (P/V)&sup2; R<Cite id="grainger-power-systems-2003" in={CH23_SOURCES} />.</>,
    },
    {
      id: 'q5',
      type: 'true-false',
      prompt: <>A transformer operates on AC because it requires a changing flux; a DC source through the primary produces no induced secondary voltage in steady state.</>,
      choices: [<>True</>, <>False</>],
      correctIndex: 0,
      explanation: <>Faraday: V = N d&Phi;/dt. With DC, d&Phi;/dt = 0, so no induced V<sub>s</sub>.</>,
    },
    {
      id: 'q6',
      type: 'true-false',
      prompt: <>Iron transformer cores are made from thin laminations (rather than solid) to reduce eddy-current losses.</>,
      choices: [<>True</>, <>False</>],
      correctIndex: 0,
      explanation: <>Laminations + interlaminar insulation force eddy currents into thin sheets, dramatically reducing their cross-section and the i&sup2;R loss<Cite id="steinmetz-1893" in={CH23_SOURCES} />.</>,
    },
    {
      id: 'q7',
      type: 'numeric',
      prompt: <>A pole transformer steps 12,470 V down to 240 V. What is the turns ratio N<sub>p</sub>:N<sub>s</sub>?</>,
      targetValue: 52,
      tolerance: 0.05,
      explanation: <>N<sub>p</sub>/N<sub>s</sub> = V<sub>p</sub>/V<sub>s</sub> = 12470/240 &approx; 52:1<Cite id="grainger-power-systems-2003" in={CH23_SOURCES} />.</>,
    },
    {
      id: 'q8',
      type: 'numeric',
      prompt: <>A 10:1 step-down transformer drives a 8 &Omega; speaker. What impedance does the primary see, in ohms?</>,
      targetValue: 800,
      tolerance: 0.02,
      unit: '&Omega;',
      explanation: <>Z<sub>p</sub> = 10&sup2; &middot; 8 = 800 &Omega;. Transformers are how vacuum-tube amplifiers were matched to low-impedance speakers.</>,
    },
    {
      id: 'q9',
      type: 'short-answer',
      prompt: <>The single-coil variation of a transformer that shares a portion of its winding between primary and secondary is called &hellip;? (One word.)</>,
      acceptedAnswers: ['autotransformer', 'auto-transformer', 'autoformer'],
      explanation: <>Autotransformer: cheaper and smaller than a two-winding model, but offers no galvanic isolation.</>,
    },
    {
      id: 'q10',
      type: 'short-answer',
      prompt: <>The American who in 1885-86 built the first commercially practical AC transformer-distribution system was &hellip;? (One word, surname.)</>,
      acceptedAnswers: ['stanley', 'william stanley', 'w. stanley'],
      explanation: <>William Stanley demonstrated AC transformer distribution in Great Barrington, MA in 1886<Cite id="stanley-1886" in={CH23_SOURCES} />.</>,
    },
  ],
};

/* ────────────────────────────────────────────────────────────────────── */
/* Ch.24 — Rectifiers and inverters                                       */
/* ────────────────────────────────────────────────────────────────────── */

const CH24_QUIZ: ChapterQuiz = {
  chapterSlug: 'rectifiers-and-inverters',
  questions: [
    {
      id: 'q1',
      type: 'multiple-choice',
      prompt: <>A full-wave bridge rectifier uses how many diodes?</>,
      choices: [<>1</>, <>2</>, <>4</>, <>6</>],
      correctIndex: 2,
      explanation: <>Four diodes in a bridge route both half-cycles of AC through the load in the same direction, doubling the average DC output vs a single-diode half-wave.</>,
    },
    {
      id: 'q2',
      type: 'multiple-choice',
      prompt: <>The output voltage of an ideal buck converter at duty cycle D is:</>,
      choices: [<>V<sub>out</sub> = V<sub>in</sub>/D</>, <>V<sub>out</sub> = D &middot; V<sub>in</sub></>, <>V<sub>out</sub> = (1 &minus; D) V<sub>in</sub></>, <>V<sub>out</sub> = V<sub>in</sub>/(1 &minus; D)</>],
      correctIndex: 1,
      explanation: <>V<sub>out</sub> = D &middot; V<sub>in</sub> (ideal, continuous conduction). 50% duty halves the input voltage<Cite id="erickson-maksimovic-2020" in={CH24_SOURCES} />.</>,
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      prompt: <>An ideal boost converter steps up via:</>,
      choices: [<>V<sub>out</sub> = D V<sub>in</sub></>, <>V<sub>out</sub> = V<sub>in</sub>/D</>, <>V<sub>out</sub> = V<sub>in</sub>/(1 &minus; D)</>, <>V<sub>out</sub> = V<sub>in</sub> &middot; D&sup2;</>],
      correctIndex: 2,
      explanation: <>V<sub>out</sub> = V<sub>in</sub>/(1 &minus; D). At D = 0.75, V<sub>out</sub> = 4&times;V<sub>in</sub>.</>,
    },
    {
      id: 'q4',
      type: 'multiple-choice',
      prompt: <>Switch-mode supplies replaced linear regulators in most applications because:</>,
      choices: [<>They are cheaper and smaller for any output.</>, <>They are dramatically more efficient (no I&middot;&Delta;V dissipation).</>, <>They generate less EMI.</>, <>They don&rsquo;t need a transformer.</>],
      correctIndex: 1,
      explanation: <>Linear regulators dissipate (V<sub>in</sub> &minus; V<sub>out</sub>)&middot;I as heat. SMPS chop the input and use L/C storage, achieving 85-98% efficiency<Cite id="erickson-maksimovic-2020" in={CH24_SOURCES} />.</>,
    },
    {
      id: 'q5',
      type: 'true-false',
      prompt: <>An inverter takes DC in and synthesizes an AC waveform on the output.</>,
      choices: [<>True</>, <>False</>],
      correctIndex: 0,
      explanation: <>A rectifier does AC&rarr;DC; an inverter does DC&rarr;AC. Solar grid-tie boxes and motor-drive VFDs both rely on inverters.</>,
    },
    {
      id: 'q6',
      type: 'true-false',
      prompt: <>The ripple voltage on a bridge-rectifier reservoir capacitor goes approximately as I<sub>load</sub> / (2 f<sub>line</sub> C).</>,
      choices: [<>True</>, <>False</>],
      correctIndex: 0,
      explanation: <>For continuous conduction in a full-wave bridge, &Delta;V &approx; I/(2fC). Bigger C, higher f<sub>line</sub>, or smaller I&rarr;smoother DC.</>,
    },
    {
      id: 'q7',
      type: 'numeric',
      prompt: <>A buck converter has V<sub>in</sub> = 24 V and runs at D = 0.30 with 90% efficiency, supplying 5 A on the output. What is V<sub>out</sub>, in volts?</>,
      targetValue: 7.2,
      tolerance: 0.05,
      unit: 'V',
      explanation: <>V<sub>out</sub> = D V<sub>in</sub> = 0.30 &middot; 24 = 7.2 V (ideal, before efficiency factor is folded into input current).</>,
    },
    {
      id: 'q8',
      type: 'numeric',
      prompt: <>Ripple on a 1000 &micro;F capacitor fed by a full-wave bridge from a 60 Hz line with 1 A load. Approximate ripple, in volts. (&Delta;V &asymp; I T/C, T &asymp; 8.33 ms half-cycle.)</>,
      targetValue: 8.33,
      tolerance: 0.1,
      unit: 'V',
      explanation: <>&Delta;V &approx; I T/C = 1 &middot; 8.33&times;10&#8315;&sup3; / 10&#8315;&sup3; = 8.33 V<Cite id="horowitz-hill-2015" in={CH24_SOURCES} />.</>,
    },
    {
      id: 'q9',
      type: 'short-answer',
      prompt: <>What 1904 invention by Fleming was the first electronic device that converted AC into DC? (Two words or one compound term.)</>,
      acceptedAnswers: ['vacuum diode', 'fleming valve', 'thermionic diode', 'fleming diode', 'fleming-valve'],
      explanation: <>Fleming&rsquo;s thermionic valve (1904) &mdash; the first vacuum diode, the original electronic rectifier<Cite id="fleming-1904" in={CH24_SOURCES} />.</>,
    },
    {
      id: 'q10',
      type: 'short-answer',
      prompt: <>What is the name of the SMPS topology that uses a single transformer with the switch on the primary and stores energy in the magnetizing inductance? (One or two words.)</>,
      acceptedAnswers: ['flyback', 'flyback converter', 'flyback topology'],
      explanation: <>Flyback &mdash; stores energy in the primary inductance during the on-time, then releases through the secondary during the off-time. Common in low-power isolated supplies.</>,
    },
  ],
};

/* ────────────────────────────────────────────────────────────────────── */
/* Ch.25 — Batteries                                                      */
/* ────────────────────────────────────────────────────────────────────── */

const CH25_QUIZ: ChapterQuiz = {
  chapterSlug: 'batteries',
  questions: [
    {
      id: 'q1',
      type: 'multiple-choice',
      prompt: <>At the anode of a galvanic cell:</>,
      choices: [<>Reduction occurs.</>, <>Oxidation occurs.</>, <>Both occur equally.</>, <>Neither occurs.</>],
      correctIndex: 1,
      explanation: <>Oxidation at the anode (metal gives up electrons), reduction at the cathode. In a galvanic cell, anode is the negative terminal.</>,
    },
    {
      id: 'q2',
      type: 'multiple-choice',
      prompt: <>The Nernst equation predicts the cell voltage at non-standard concentrations as:</>,
      choices: [<>V = V&deg; + (RT/nF) ln Q</>, <>V = V&deg; &minus; (RT/nF) ln Q</>, <>V = V&deg; &middot; Q</>, <>V = V&deg; / ln Q</>],
      correctIndex: 1,
      explanation: <>V = V&deg; &minus; (RT/nF) ln Q. Q &gt; 1 (products favoured): cell voltage drops below standard<Cite id="nernst-1889" in={CH25_SOURCES} />.</>,
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      prompt: <>The standard electrode potential of the Cu&sup2;&#8314;/Cu couple is approximately:</>,
      choices: [<>&minus;0.76 V</>, <>+0.34 V</>, <>+0.80 V</>, <>+1.10 V</>],
      correctIndex: 1,
      explanation: <>E&deg;(Cu&sup2;&#8314;/Cu) = +0.34 V. Pairing with Zn&sup2;&#8314;/Zn (&minus;0.76 V) gives the 1.10 V Daniell cell<Cite id="bard-faulkner-2001" in={CH25_SOURCES} />.</>,
    },
    {
      id: 'q4',
      type: 'multiple-choice',
      prompt: <>The internal resistance of a real cell:</>,
      choices: [<>Has no effect on operation.</>, <>Drops the terminal voltage by I R<sub>int</sub> under load.</>, <>Increases output current.</>, <>Is exactly zero.</>],
      correctIndex: 1,
      explanation: <>V<sub>term</sub> = V<sub>OC</sub> &minus; I R<sub>int</sub>. Cold weather raises R<sub>int</sub>, which is why car batteries struggle in winter.</>,
    },
    {
      id: 'q5',
      type: 'true-false',
      prompt: <>A primary cell can be recharged repeatedly by reversing the current through it.</>,
      choices: [<>True</>, <>False</>],
      correctIndex: 1,
      explanation: <>False. Primary (alkaline, lithium-MnO&#8322;, zinc-air) chemistries are one-shot; secondary cells (lead-acid, NiMH, Li-ion) are designed for reversible reactions.</>,
    },
    {
      id: 'q6',
      type: 'true-false',
      prompt: <>The electrolyte in a battery conducts ions but is intentionally an electronic insulator.</>,
      choices: [<>True</>, <>False</>],
      correctIndex: 0,
      explanation: <>Free electrons must travel through the external circuit (delivering work to your load), while ions complete the internal loop through the electrolyte.</>,
    },
    {
      id: 'q7',
      type: 'numeric',
      prompt: <>Cell with V<sub>OC</sub> = 1.5 V and R<sub>int</sub> = 0.2 &Omega; drives a 1 &Omega; load. What is V<sub>term</sub>, in volts?</>,
      targetValue: 1.25,
      tolerance: 0.05,
      unit: 'V',
      explanation: <>V<sub>term</sub> = V<sub>OC</sub> R<sub>L</sub>/(R<sub>L</sub> + R<sub>int</sub>) = 1.5 &middot; 1/1.2 &approx; 1.25 V.</>,
    },
    {
      id: 'q8',
      type: 'numeric',
      prompt: <>Standard EMF of a cell with E&deg;<sub>cathode</sub> = +0.80 V and E&deg;<sub>anode</sub> = &minus;0.76 V, in volts.</>,
      targetValue: 1.56,
      tolerance: 0.02,
      unit: 'V',
      explanation: <>E&deg;<sub>cell</sub> = E&deg;<sub>cathode</sub> &minus; E&deg;<sub>anode</sub> = 0.80 &minus; (&minus;0.76) = 1.56 V.</>,
    },
    {
      id: 'q9',
      type: 'short-answer',
      prompt: <>Who, in 1800, invented the first battery (the &ldquo;pile&rdquo;)? (One word, surname.)</>,
      acceptedAnswers: ['volta', 'alessandro volta', 'a. volta'],
      explanation: <>Alessandro Volta&rsquo;s 1800 pile (zinc and copper discs with brine-soaked cardboard) was the first continuous source of current<Cite id="volta-1800-pile" in={CH25_SOURCES} />.</>,
    },
    {
      id: 'q10',
      type: 'short-answer',
      prompt: <>What is the SI unit measuring stored charge capacity of a cell, equal to one ampere-hour, in three letters?</>,
      acceptedAnswers: ['ah', 'a·h', 'ampere-hour', 'ampere hour', 'amp-hour', 'amp hour'],
      explanation: <>Ah (ampere-hour) is the conventional capacity unit, 1 Ah = 3600 C. The strict SI unit is the coulomb.</>,
    },
  ],
};

/* ────────────────────────────────────────────────────────────────────── */
/* Ch.26 — Modern batteries                                               */
/* ────────────────────────────────────────────────────────────────────── */

const CH26_QUIZ: ChapterQuiz = {
  chapterSlug: 'modern-batteries',
  questions: [
    {
      id: 'q1',
      type: 'multiple-choice',
      prompt: <>The mechanism that lets a Li-ion cell cycle many times without consuming its electrodes is:</>,
      choices: [<>Plating and stripping of lithium metal.</>, <>Intercalation: Li&#8314; shuttles in and out of host lattices.</>, <>Combustion at the cathode.</>, <>Ionization of helium.</>],
      correctIndex: 1,
      explanation: <>Li&#8314; intercalates into graphite anodes and layered transition-metal-oxide cathodes; the host crystals stay intact, enabling thousands of cycles<Cite id="goodenough-1980-licoo2" in={CH26_SOURCES} />.</>,
    },
    {
      id: 'q2',
      type: 'multiple-choice',
      prompt: <>Compared to lead-acid, Li-ion offers what kind of advantage in specific energy?</>,
      choices: [<>Roughly the same.</>, <>About 5-10&times; higher specific energy.</>, <>About 2&times; lower.</>, <>About 100&times; higher.</>],
      correctIndex: 1,
      explanation: <>Lead-acid is &asymp;30-40 Wh/kg; Li-ion is &asymp;150-250 Wh/kg &mdash; roughly 5-10&times; higher specific energy. That gap is why phones and EVs use Li-ion.</>,
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      prompt: <>A flow battery differs from a sealed cell mainly because:</>,
      choices: [<>It has no electrodes.</>, <>Its electrolyte is stored in external tanks and pumped past the electrodes; capacity scales with tank size independently of power.</>, <>It uses solid lithium metal.</>, <>It cannot be recharged.</>],
      correctIndex: 1,
      explanation: <>Vanadium-redox and similar flow systems decouple energy (electrolyte volume) from power (membrane stack size), making grid-scale storage tractable<Cite id="larminie-dicks-2003-fuel-cells" in={CH26_SOURCES} />.</>,
    },
    {
      id: 'q4',
      type: 'multiple-choice',
      prompt: <>A hydrogen-oxygen PEM fuel cell&rsquo;s thermodynamic open-circuit voltage is approximately:</>,
      choices: [<>0.5 V</>, <>1.23 V</>, <>2.5 V</>, <>3.7 V</>],
      correctIndex: 1,
      explanation: <>E&deg; &approx; 1.23 V per cell at 25 &deg;C, set by &Delta;G/(nF) for the H&#8322; + &frac12;O&#8322; &rarr; H&#8322;O reaction<Cite id="larminie-dicks-2003-fuel-cells" in={CH26_SOURCES} />.</>,
    },
    {
      id: 'q5',
      type: 'true-false',
      prompt: <>A supercapacitor stores energy via charge separation across a double-layer interface, not a redox reaction; it therefore has higher power density but lower energy density than a battery.</>,
      choices: [<>True</>, <>False</>],
      correctIndex: 0,
      explanation: <>The double-layer mechanism is fast (no diffusion-limited chemistry), so power densities are very high. But the surface-area-limited capacity gives lower Wh/kg than batteries.</>,
    },
    {
      id: 'q6',
      type: 'true-false',
      prompt: <>The 2019 Chemistry Nobel honoured Whittingham, Goodenough, and Yoshino for their contributions to lithium-ion battery development.</>,
      choices: [<>True</>, <>False</>],
      correctIndex: 0,
      explanation: <>Three generations of Li-ion architecture, awarded jointly: the cathode (Whittingham 1976), the layered oxide (Goodenough 1980), and the commercial cell (Yoshino 1985)<Cite id="whittingham-1976" in={CH26_SOURCES} /><Cite id="yoshino-1985" in={CH26_SOURCES} />.</>,
    },
    {
      id: 'q7',
      type: 'numeric',
      prompt: <>A 60 Ah, 12 V lead-acid battery stores what nominal energy, in kWh?</>,
      targetValue: 0.72,
      tolerance: 0.02,
      unit: 'kWh',
      explanation: <>E = V Q = 12 &middot; 60 = 720 Wh = 0.72 kWh.</>,
    },
    {
      id: 'q8',
      type: 'numeric',
      prompt: <>A 100-cell PEM stack with 0.65 V/cell drawing 200 A produces how many watts?</>,
      targetValue: 13000,
      tolerance: 0.02,
      unit: 'W',
      explanation: <>V<sub>stack</sub> = 100 &middot; 0.65 = 65 V; P = V I = 65 &middot; 200 = 13 kW.</>,
    },
    {
      id: 'q9',
      type: 'short-answer',
      prompt: <>What is the most common cathode chemistry abbreviation for EV batteries combining nickel, manganese, and cobalt? (One acronym.)</>,
      acceptedAnswers: ['nmc', 'ncm', 'lnmc'],
      explanation: <>NMC (a.k.a. NCM): LiNi<sub>x</sub>Mn<sub>y</sub>Co<sub>z</sub>O&#8322; with varying ratios. LFP (LiFePO&#8324;) is the safer, lower-energy alternative.</>,
    },
    {
      id: 'q10',
      type: 'short-answer',
      prompt: <>What name does the runaway exothermic decomposition of an over-charged or punctured Li-ion cell go by? (Two words.)</>,
      acceptedAnswers: ['thermal runaway', 'thermal-runaway'],
      explanation: <>Thermal runaway: positive-feedback heat release once a damaged cell crosses a critical temperature. Each cell&rsquo;s decomposition heats its neighbours.</>,
    },
  ],
};

/* ────────────────────────────────────────────────────────────────────── */
/* Ch.28 — Inside the panel                                               */
/* ────────────────────────────────────────────────────────────────────── */

const CH28_QUIZ: ChapterQuiz = {
  chapterSlug: 'house-panel',
  questions: [
    {
      id: 'q1',
      type: 'multiple-choice',
      prompt: <>A 240 V circuit in a North-American panel taps:</>,
      choices: [<>L1 and neutral.</>, <>L1 and L2 (the two hots, 180&deg; out of phase).</>, <>L2 and ground.</>, <>Two adjacent breaker slots on the same bus stab.</>],
      correctIndex: 1,
      explanation: <>L1 and L2 are 180&deg; apart on the split-phase secondary, so V<sub>L1</sub> &minus; V<sub>L2</sub> = 240 V. A 240 V breaker must straddle the two stabs<Cite id="nec-2023" in={CH28_SOURCES} />.</>,
    },
    {
      id: 'q2',
      type: 'multiple-choice',
      prompt: <>A GFCI breaker trips when:</>,
      choices: [<>The current exceeds the breaker&rsquo;s ampere rating.</>, <>An arc is detected.</>, <>|I<sub>hot</sub> &minus; I<sub>neutral</sub>| &gt; about 5 mA.</>, <>Voltage drops below 100 V.</>],
      correctIndex: 2,
      explanation: <>GFCIs sense residual current (current leaving via a path other than the neutral); the UL 943 threshold is roughly 5 mA in 25 ms<Cite id="nec-2023" in={CH28_SOURCES} />.</>,
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      prompt: <>The function of an AFCI breaker is to detect:</>,
      choices: [<>Ground faults.</>, <>Overcurrent only.</>, <>Series and parallel arc-fault signatures.</>, <>Reverse polarity.</>],
      correctIndex: 2,
      explanation: <>AFCIs use signal-processing on the high-frequency content of the line current to identify the chaotic signature of a sustained arc &mdash; the cause of many residential fires<Cite id="ul-489" in={CH28_SOURCES} />.</>,
    },
    {
      id: 'q4',
      type: 'multiple-choice',
      prompt: <>The neutral and ground bars in a subpanel are:</>,
      choices: [<>Bonded together.</>, <>Isolated from each other; bonding is only at the service equipment.</>, <>Both connected to L1.</>, <>Always tied to the metal enclosure regardless of location.</>],
      correctIndex: 1,
      explanation: <>NEC 250.24 requires the neutral-to-ground bond at one point only &mdash; the service entrance. Bonding again in a subpanel creates parallel return paths<Cite id="nec-2023" in={CH28_SOURCES} />.</>,
    },
    {
      id: 'q5',
      type: 'true-false',
      prompt: <>A panel&rsquo;s interrupting (AIC) rating is the maximum fault current the breaker can safely interrupt without welding or failing open.</>,
      choices: [<>True</>, <>False</>],
      correctIndex: 0,
      explanation: <>Typical residential AIC is 10 kA; commercial breakers can go to 65-200 kA. Available fault current must not exceed AIC.</>,
    },
    {
      id: 'q6',
      type: 'true-false',
      prompt: <>The grounding electrode rod alone is what carries fault current back to clear a breaker after a hot-to-chassis short.</>,
      choices: [<>True</>, <>False</>],
      correctIndex: 1,
      explanation: <>False. Dirt impedance (25-100 &Omega;) is far too high for that. Fault current returns via the equipment grounding conductor to the neutral bond at the service<Cite id="nec-2023" in={CH28_SOURCES} />.</>,
    },
    {
      id: 'q7',
      type: 'numeric',
      prompt: <>L1 is at +120 V instantaneous and L2 is at &minus;120 V instantaneous. What is V<sub>L1</sub> &minus; V<sub>L2</sub>, in volts?</>,
      targetValue: 240,
      tolerance: 0.02,
      unit: 'V',
      explanation: <>V<sub>L1</sub> &minus; V<sub>L2</sub> = 120 &minus; (&minus;120) = 240 V.</>,
    },
    {
      id: 'q8',
      type: 'numeric',
      prompt: <>A GFCI senses I<sub>hot</sub> = 12.0 A and I<sub>neutral</sub> = 11.992 A. The residual current is, in milliamperes:</>,
      targetValue: 8,
      tolerance: 0.05,
      unit: 'mA',
      explanation: <>|I<sub>hot</sub> &minus; I<sub>neutral</sub>| = 0.008 A = 8 mA &mdash; above the 5 mA threshold, so the GFCI trips.</>,
    },
    {
      id: 'q9',
      type: 'short-answer',
      prompt: <>What is the abbreviation for the breaker that detects ground faults? (Four letters.)</>,
      acceptedAnswers: ['gfci', 'g.f.c.i.', 'gfi'],
      explanation: <>Ground-Fault Circuit Interrupter (GFCI / GFI). Required by NEC in wet locations: bathrooms, kitchens, outdoors, garages.</>,
    },
    {
      id: 'q10',
      type: 'short-answer',
      prompt: <>What is the deliberate electrical connection between non-current-carrying metal parts of a system that ensures they sit at the same potential called? (One word.)</>,
      acceptedAnswers: ['bonding'],
      explanation: <>Bonding ties together panels, conduit, and appliance chassis so a fault drives the EGC, not your body. Distinct from grounding to earth.</>,
    },
  ],
};

/* ────────────────────────────────────────────────────────────────────── */
/* Ch.29 — Branch circuits                                                */
/* ────────────────────────────────────────────────────────────────────── */

const CH29_QUIZ: ChapterQuiz = {
  chapterSlug: 'house-branch-circuits',
  questions: [
    {
      id: 'q1',
      type: 'multiple-choice',
      prompt: <>The standard wire gauge used with a 20 A residential breaker on a 120 V branch is:</>,
      choices: [<>14 AWG copper</>, <>12 AWG copper</>, <>10 AWG copper</>, <>8 AWG copper</>],
      correctIndex: 1,
      explanation: <>12 AWG copper has 60 &deg;C ampacity of 20 A in NEC Table 310.16. 14 AWG is for 15 A circuits<Cite id="awg-table-nec" in={CH29_SOURCES} />.</>,
    },
    {
      id: 'q2',
      type: 'multiple-choice',
      prompt: <>For a 15 A continuous load (operating &gt;3 hours), the branch must be rated for at least:</>,
      choices: [<>15 A</>, <>18.75 A &mdash; the &ldquo;80% rule&rdquo; (1.25&times; continuous).</>, <>30 A</>, <>50 A</>],
      correctIndex: 1,
      explanation: <>NEC 210.20(A): branch breaker rating &ge; 125% of continuous load. A continuous 15 A load needs a &ge; 19 A breaker, in practice 20 A<Cite id="nec-2023" in={CH29_SOURCES} />.</>,
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      prompt: <>NM-B cable is permitted in dry interior locations. UF-B differs because it is:</>,
      choices: [<>Always armoured.</>, <>Sunlight-resistant and rated for direct burial.</>, <>Higher temperature rated.</>, <>Aluminium only.</>],
      correctIndex: 1,
      explanation: <>UF-B has a solid moulded jacket and is the only common Romex-family cable rated for direct burial and damp/wet locations<Cite id="nec-2023" in={CH29_SOURCES} />.</>,
    },
    {
      id: 'q4',
      type: 'multiple-choice',
      prompt: <>Voltage drop over a long branch circuit is approximately:</>,
      choices: [<>&Delta;V = I &middot; R<sub>per metre</sub></>, <>&Delta;V = 2 &middot; I &middot; R<sub>per metre</sub> &middot; L (counting both directions)</>, <>&Delta;V = V<sub>line</sub> &middot; L</>, <>&Delta;V = 0 for any reasonable run.</>],
      correctIndex: 1,
      explanation: <>Voltage drop in single-phase is round-trip: 2 &middot; I &middot; R<sub>/m</sub> &middot; L. NEC recommends &le;3% on branches and &le;5% combined feeder + branch.</>,
    },
    {
      id: 'q5',
      type: 'true-false',
      prompt: <>NEC requires the kitchen small-appliance circuits to be served by at least two separate 20 A branch circuits.</>,
      choices: [<>True</>, <>False</>],
      correctIndex: 0,
      explanation: <>NEC 210.11(C)(1): at least two 20 A small-appliance branch circuits for kitchen, pantry, dining counters, breakfast room<Cite id="nec-2023" in={CH29_SOURCES} />.</>,
    },
    {
      id: 'q6',
      type: 'true-false',
      prompt: <>Solid-aluminum branch-circuit wire (vintage 1965-1973) is associated with elevated risk of overheating and fires at connection points.</>,
      choices: [<>True</>, <>False</>],
      correctIndex: 0,
      explanation: <>Oxide formation, creep, and dissimilar-metal expansion at terminations caused unique failure modes; CPSC studies showed elevated fire risk. AA-8000 alloys later improved feeders<Cite id="nec-2017-aluminum" in={CH29_SOURCES} />.</>,
    },
    {
      id: 'q7',
      type: 'numeric',
      prompt: <>A 100 ft (about 30 m) run of 12 AWG copper (~5.2 m&Omega;/m) carries 15 A. Round-trip voltage drop, in volts.</>,
      targetValue: 4.68,
      tolerance: 0.1,
      unit: 'V',
      explanation: <>&Delta;V = 2 I R<sub>/m</sub> L = 2 &middot; 15 &middot; 0.0052 &middot; 30 &approx; 4.7 V &mdash; about 4% of 120 V.</>,
    },
    {
      id: 'q8',
      type: 'numeric',
      prompt: <>What current does a 3500 W appliance draw on 120 V, in amperes?</>,
      targetValue: 29.17,
      tolerance: 0.05,
      unit: 'A',
      explanation: <>I = P/V = 3500/120 &approx; 29.2 A. Too big for a 20 A branch &mdash; this load wants 240 V or its own dedicated 30 A circuit.</>,
    },
    {
      id: 'q9',
      type: 'short-answer',
      prompt: <>What is the slang name for nonmetallic-sheathed Romex-style cable? (One word.)</>,
      acceptedAnswers: ['romex', 'nm', 'nm-b', 'nmb'],
      explanation: <>Romex is the genericized Southwire trademark for type NM-B nonmetallic-sheathed cable, the workhorse of residential branch wiring.</>,
    },
    {
      id: 'q10',
      type: 'short-answer',
      prompt: <>The amount of current a conductor can carry continuously without exceeding its insulation temperature rating is called &hellip;? (One word.)</>,
      acceptedAnswers: ['ampacity'],
      explanation: <>Ampacity is the conductor&rsquo;s rated current capacity under specified ambient and bundling conditions. NEC Table 310.16 is the practical lookup<Cite id="awg-table-nec" in={CH29_SOURCES} />.</>,
    },
  ],
};

/* ────────────────────────────────────────────────────────────────────── */
/* Ch.30 — Switches and receptacles                                       */
/* ────────────────────────────────────────────────────────────────────── */

const CH30_QUIZ: ChapterQuiz = {
  chapterSlug: 'house-switches-receptacles',
  questions: [
    {
      id: 'q1',
      type: 'multiple-choice',
      prompt: <>The standard 15 A, 125 V North-American duplex receptacle has the NEMA designation:</>,
      choices: [<>5-15</>, <>5-20</>, <>6-15</>, <>14-50</>],
      correctIndex: 0,
      explanation: <>NEMA 5-15R is the everyday two-blade-plus-ground household outlet. 5-20 has the perpendicular slot for 20 A loads<Cite id="nema-wd-6" in={CH30_SOURCES} />.</>,
    },
    {
      id: 'q2',
      type: 'multiple-choice',
      prompt: <>A three-way switch is used to control a single light from two different locations. The pair of wires running between the two switches is called the:</>,
      choices: [<>Hot pair.</>, <>Travellers.</>, <>Neutrals.</>, <>Ground wires.</>],
      correctIndex: 1,
      explanation: <>Two &ldquo;travellers&rdquo; alternate between live and dead depending on switch positions; toggling either switch swaps which traveller carries the hot.</>,
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      prompt: <>A leading-edge phase-cut dimmer works by:</>,
      choices: [<>Reducing the voltage with a series resistor.</>, <>Using a triac to delay turning on each AC half-cycle until a chosen firing angle.</>, <>Generating PWM at 100 kHz.</>, <>Changing the line frequency.</>],
      correctIndex: 1,
      explanation: <>The triac waits an adjustable angle &alpha; into each half-cycle before conducting. RMS voltage drops as &alpha; increases &mdash; classical incandescent dimming.</>,
    },
    {
      id: 'q4',
      type: 'multiple-choice',
      prompt: <>NEMA 14-50 is a 4-prong 50 A 240 V outlet commonly used for:</>,
      choices: [<>A standard lamp.</>, <>A 120 V hair dryer.</>, <>An electric range or level-2 EV charger.</>, <>A 480 V industrial load.</>],
      correctIndex: 2,
      explanation: <>NEMA 14-50: 50 A, 125/250 V, two hots + neutral + ground &mdash; the standard for ranges, RV pedestals, and home EV charging<Cite id="nec-2023" in={CH30_SOURCES} />.</>,
    },
    {
      id: 'q5',
      type: 'true-false',
      prompt: <>For a 5-15R outlet, the larger neutral slot is on the left when viewing the outlet with the ground hole at the bottom.</>,
      choices: [<>True</>, <>False</>],
      correctIndex: 0,
      explanation: <>Neutral on the left (wider slot), hot on the right (smaller slot), ground at the bottom &mdash; the standard polarized configuration.</>,
    },
    {
      id: 'q6',
      type: 'true-false',
      prompt: <>The downstream &ldquo;LOAD&rdquo; terminals on a GFCI receptacle protect any standard outlets wired in series below it on the same branch.</>,
      choices: [<>True</>, <>False</>],
      correctIndex: 0,
      explanation: <>A single GFCI receptacle can protect a whole chain when downstream outlets are wired through its LOAD terminals &mdash; cheaper than swapping every device.</>,
    },
    {
      id: 'q7',
      type: 'numeric',
      prompt: <>An 800 W toaster on a 119 V outlet draws what current, in amperes?</>,
      targetValue: 6.72,
      tolerance: 0.05,
      unit: 'A',
      explanation: <>I = P/V = 800/119 &approx; 6.7 A.</>,
    },
    {
      id: 'q8',
      type: 'numeric',
      prompt: <>For a 50 A NEMA 14-50 outlet on a continuous EV load, the EVSE may draw at most 80% of 50 A. What current, in amperes?</>,
      targetValue: 40,
      tolerance: 0.02,
      unit: 'A',
      explanation: <>NEC 80%-rule for continuous loads: 0.80 &middot; 50 = 40 A, equivalent to 9.6 kW at 240 V<Cite id="nec-2023" in={CH30_SOURCES} />.</>,
    },
    {
      id: 'q9',
      type: 'short-answer',
      prompt: <>What is the name of the four-pin connector that&rsquo;s essentially two three-way switches in one box, allowing control of one light from three locations? (Two words.)</>,
      acceptedAnswers: ['four-way switch', 'four way switch', '4-way switch', '4 way switch', 'four-way', 'fourway'],
      explanation: <>A four-way switch is the &ldquo;middle&rdquo; switch in a 3+ location lighting circuit; it swaps the two travellers between its input and output pairs.</>,
    },
    {
      id: 'q10',
      type: 'short-answer',
      prompt: <>What is the term for the receptacle with spring-shutters that block insertion unless both prongs are inserted simultaneously? (Three letters, an abbreviation.)</>,
      acceptedAnswers: ['tr', 'tr outlet', 'tamper resistant', 'tamper-resistant', 'tr receptacle'],
      explanation: <>Tamper-resistant (TR) receptacles are required by NEC for residential locations to prevent child injuries from inserting objects.</>,
    },
  ],
};

/* ────────────────────────────────────────────────────────────────────── */
/* Ch.31 — Big loads (dryers, ranges, EVs, heat pumps)                    */
/* ────────────────────────────────────────────────────────────────────── */

const CH31_QUIZ: ChapterQuiz = {
  chapterSlug: 'house-big-loads',
  questions: [
    {
      id: 'q1',
      type: 'multiple-choice',
      prompt: <>The reason large appliances use 240 V instead of 120 V is:</>,
      choices: [<>The motor doesn&rsquo;t work on 120 V.</>, <>For the same power, doubling V halves I, cutting I&sup2;R wire losses by 4&times;.</>, <>240 V is safer.</>, <>It&rsquo;s required for grounding.</>],
      correctIndex: 1,
      explanation: <>P<sub>loss</sub> &prop; I&sup2; R; doubling V quarters losses for the same delivered power. That&rsquo;s why ranges, dryers, EVs all use 240 V.</>,
    },
    {
      id: 'q2',
      type: 'multiple-choice',
      prompt: <>SAE J1772 is the standard connector for:</>,
      choices: [<>Level-3 DC fast charging.</>, <>Level-1/2 AC charging in North America.</>, <>Industrial 3-phase service.</>, <>RV pedestals.</>],
      correctIndex: 1,
      explanation: <>SAE J1772 specifies the 5-pin connector for AC (level 1/2) EV charging in North America. CCS extends it for DC fast charging<Cite id="sae-j1772" in={CH31_SOURCES} />.</>,
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      prompt: <>The locked-rotor amperes (LRA) of a typical compressor motor is approximately:</>,
      choices: [<>0.5&times; FLA</>, <>1&times; FLA</>, <>5-7&times; FLA</>, <>100&times; FLA</>],
      correctIndex: 2,
      explanation: <>LRA is the inrush current at startup, typically 5-7&times; the full-load amperes. HACR breakers tolerate this brief surge without nuisance tripping<Cite id="nec-2023" in={CH31_SOURCES} />.</>,
    },
    {
      id: 'q4',
      type: 'multiple-choice',
      prompt: <>A heat-pump dryer can run on a 120 V outlet because:</>,
      choices: [<>It uses a much smaller resistive element.</>, <>It moves heat rather than generating it, so its peak power is small enough for a 15-20 A circuit.</>, <>It only operates at half capacity.</>, <>It uses gas backup.</>],
      correctIndex: 1,
      explanation: <>A 120 V/15 A circuit supplies 1800 W; a heat pump uses a fraction of that to move existing heat. Resistive dryers need 240 V because they make heat directly.</>,
    },
    {
      id: 'q5',
      type: 'true-false',
      prompt: <>A pure 240 V load like a tankless water heater needs no neutral wire, because the current returns through the second hot.</>,
      choices: [<>True</>, <>False</>],
      correctIndex: 0,
      explanation: <>L1 and L2 are 180&deg; apart; current in L1 returns through L2. Only 120/240 V split loads (like dryers with 120 V controls) need a neutral.</>,
    },
    {
      id: 'q6',
      type: 'true-false',
      prompt: <>NEC requires a continuous EV charging load to be calculated at 125% of its nameplate current.</>,
      choices: [<>True</>, <>False</>],
      correctIndex: 0,
      explanation: <>NEC 625.42: EVSE is a continuous load and must be sized with the 1.25 multiplier; the branch breaker and wire must reflect that<Cite id="nec-2023" in={CH31_SOURCES} />.</>,
    },
    {
      id: 'q7',
      type: 'numeric',
      prompt: <>A 5000 W heat-pump compressor on 240 V has FLA equal to, in amperes:</>,
      targetValue: 20.83,
      tolerance: 0.05,
      unit: 'A',
      explanation: <>FLA = P/V = 5000/240 &approx; 20.83 A.</>,
    },
    {
      id: 'q8',
      type: 'numeric',
      prompt: <>A level-2 EVSE draws 32 A continuously. With the 125% rule, the minimum branch breaker is, in amperes:</>,
      targetValue: 40,
      tolerance: 0.05,
      unit: 'A',
      explanation: <>1.25 &middot; 32 = 40 A. The wire must support 40 A ampacity; 8 AWG copper suffices<Cite id="nec-2023" in={CH31_SOURCES} />.</>,
    },
    {
      id: 'q9',
      type: 'short-answer',
      prompt: <>What does the acronym EVSE stand for? (Four words.)</>,
      acceptedAnswers: ['electric vehicle supply equipment', 'electric-vehicle supply equipment'],
      explanation: <>Electric Vehicle Supply Equipment &mdash; technically the charger sits inside the car; the EVSE is the safety-and-handshake hardware on the wall.</>,
    },
    {
      id: 'q10',
      type: 'short-answer',
      prompt: <>The standard NEMA receptacle pattern for a residential electric range or level-2 EV outlet, 50 A and 240 V, is &hellip;? (Format: NEMA &hellip;)</>,
      acceptedAnswers: ['14-50', 'nema 14-50', '14-50r'],
      explanation: <>NEMA 14-50: four-prong (L1, L2, N, G), 50 A, 125/250 V<Cite id="nec-2023" in={CH31_SOURCES} />.</>,
    },
  ],
};

/* ────────────────────────────────────────────────────────────────────── */
/* Ch.32 — Safety and what kills you                                      */
/* ────────────────────────────────────────────────────────────────────── */

const CH32_QUIZ: ChapterQuiz = {
  chapterSlug: 'house-safety',
  questions: [
    {
      id: 'q1',
      type: 'multiple-choice',
      prompt: <>What hurts people in an electrical shock is fundamentally:</>,
      choices: [<>Voltage by itself.</>, <>Current through the body, especially through the heart.</>, <>The wire material.</>, <>The fault duration only, not the current.</>],
      correctIndex: 1,
      explanation: <>Voltage gets the headlines; current through the heart is what causes ventricular fibrillation. 100 mA at 60 Hz for ~1 s is canonically lethal<Cite id="dalziel-1956" in={CH32_SOURCES} />.</>,
    },
    {
      id: 'q2',
      type: 'multiple-choice',
      prompt: <>A GFCI trips at:</>,
      choices: [<>1 mA in 1 s</>, <>5 mA in about 25 ms</>, <>20 mA in 100 ms</>, <>100 mA in 1 s</>],
      correctIndex: 1,
      explanation: <>UL 943 specifies 5 mA residual current detection with an inverse-time trip; nominal trip time is &lt;25 ms at 6 mA.</>,
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      prompt: <>The reason a bird can sit on a single high-voltage line without harm is:</>,
      choices: [<>Birds are insulators.</>, <>There is no closed loop between two points at different potential; both feet are at the same potential.</>, <>Bird feathers shield it.</>, <>The current is too small.</>],
      correctIndex: 1,
      explanation: <>One contact means no completed circuit. A squirrel that bridges two lines (or a line and ground) is the cautionary opposite.</>,
    },
    {
      id: 'q4',
      type: 'multiple-choice',
      prompt: <>60 Hz is more dangerous than 1000 Hz at the same current because:</>,
      choices: [<>Higher frequency penetrates tissue better.</>, <>60 Hz is close to the natural firing rate of cardiac muscle and can capture the heart into fibrillation.</>, <>High frequency causes more heating.</>, <>Only DC is dangerous.</>],
      correctIndex: 1,
      explanation: <>The heart&rsquo;s electrical control is most vulnerable to disruption in the 40-150 Hz band; 60 Hz lies near the worst-case sensitivity<Cite id="iec-60479-2018" in={CH32_SOURCES} />.</>,
    },
    {
      id: 'q5',
      type: 'true-false',
      prompt: <>The Dalziel let-go threshold &mdash; the current above which a person can no longer voluntarily release a grasped conductor &mdash; is on the order of 10-20 mA at 60 Hz.</>,
      choices: [<>True</>, <>False</>],
      correctIndex: 0,
      explanation: <>10-16 mA for adult males, 6-10 mA for adult females. Above this, muscles clench and the victim cannot let go<Cite id="dalziel-1956" in={CH32_SOURCES} />.</>,
    },
    {
      id: 'q6',
      type: 'true-false',
      prompt: <>Arc-fault breakers and ground-fault breakers protect against the same kind of fault.</>,
      choices: [<>True</>, <>False</>],
      correctIndex: 1,
      explanation: <>False. AFCIs detect arcs (fire prevention); GFCIs detect leakage to ground (shock prevention). Both serve different residential safety roles<Cite id="nfpa-70e-2024" in={CH32_SOURCES} />.</>,
    },
    {
      id: 'q7',
      type: 'numeric',
      prompt: <>If body resistance is 2000 &Omega; and contact voltage is 120 V, what current flows, in milliamperes?</>,
      targetValue: 60,
      tolerance: 0.05,
      unit: 'mA',
      explanation: <>I = V/R = 120/2000 = 0.060 A = 60 mA &mdash; in the ventricular-fibrillation range<Cite id="dalziel-1956" in={CH32_SOURCES} />.</>,
    },
    {
      id: 'q8',
      type: 'numeric',
      prompt: <>A dry-skin body resistance is around 100 k&Omega;. At 120 V, current is, in milliamperes:</>,
      targetValue: 1.2,
      tolerance: 0.05,
      unit: 'mA',
      explanation: <>I = 120/10&#8309; = 1.2 mA &mdash; perceptible but not dangerous. Wet skin can drop R by 50&times;.</>,
    },
    {
      id: 'q9',
      type: 'short-answer',
      prompt: <>What is the abbreviation for the personal-protective-equipment standard for arc-flash work? (Three or four characters.)</>,
      acceptedAnswers: ['ppe', 'nfpa 70e', '70e'],
      explanation: <>NFPA 70E classifies arc-flash hazard categories and the PPE required for each<Cite id="nfpa-70e-2024" in={CH32_SOURCES} />.</>,
    },
    {
      id: 'q10',
      type: 'short-answer',
      prompt: <>The lethal heart rhythm caused by 60 Hz currents in the 50-500 mA range is called &hellip;? (Two words.)</>,
      acceptedAnswers: ['ventricular fibrillation', 'v-fib', 'vfib', 'ventricular-fibrillation', 'fibrillation'],
      explanation: <>Ventricular fibrillation: the ventricles quiver chaotically instead of pumping. Without defibrillation within minutes, fatal<Cite id="dalziel-1956" in={CH32_SOURCES} />.</>,
    },
  ],
};

/* ────────────────────────────────────────────────────────────────────── */
/* Ch.33 — Smart meter and the bill                                       */
/* ────────────────────────────────────────────────────────────────────── */

const CH33_QUIZ: ChapterQuiz = {
  chapterSlug: 'house-smart-meter',
  questions: [
    {
      id: 'q1',
      type: 'multiple-choice',
      prompt: <>The residential electricity bill is based primarily on:</>,
      choices: [<>Peak instantaneous voltage.</>, <>Real energy in kWh.</>, <>Reactive energy in kVARh.</>, <>Power factor.</>],
      correctIndex: 1,
      explanation: <>Residential customers pay for kWh = &int;V(t)I(t) dt. Power factor and reactive energy generally do not appear on the household bill<Cite id="ansi-c12-1-2014" in={CH33_SOURCES} />.</>,
    },
    {
      id: 'q2',
      type: 'multiple-choice',
      prompt: <>Apparent power S, real power P, and reactive power Q are related by:</>,
      choices: [<>S = P + Q</>, <>S&sup2; = P&sup2; + Q&sup2;</>, <>S = P &middot; Q</>, <>S = P/Q</>],
      correctIndex: 1,
      explanation: <>S&sup2; = P&sup2; + Q&sup2; (the power triangle). PF = P/S.</>,
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      prompt: <>A time-of-use (TOU) tariff means:</>,
      choices: [<>Fixed price all hours.</>, <>kWh price varies by time of day to reflect generation cost.</>, <>The meter only reads at month-end.</>, <>Reactive power is billed.</>],
      correctIndex: 1,
      explanation: <>TOU tariffs assign higher per-kWh prices to peak hours and lower to off-peak, signalling consumption shifting and aligning bills with marginal cost<Cite id="ansi-c12-20-2015" in={CH33_SOURCES} />.</>,
    },
    {
      id: 'q4',
      type: 'multiple-choice',
      prompt: <>Net metering on a bidirectional meter means:</>,
      choices: [<>Solar exports are not measured.</>, <>The meter measures import minus export; you are billed (or credited) on the net.</>, <>Two meters run independently.</>, <>The utility takes 100% of exported energy.</>],
      correctIndex: 1,
      explanation: <>Net metering tracks bidirectional energy. Excess solar in the middle of the day offsets nighttime consumption at the prevailing rate.</>,
    },
    {
      id: 'q5',
      type: 'true-false',
      prompt: <>The induction-disk legacy meter measures real energy by counting rotations of a disk whose rotation rate is proportional to instantaneous power.</>,
      choices: [<>True</>, <>False</>],
      correctIndex: 0,
      explanation: <>The aluminium disk rotates between an electromagnet whose torque is proportional to V&middot;I&middot;cos(&phi;). Eddy-current braking sets rotation rate = real power.</>,
    },
    {
      id: 'q6',
      type: 'true-false',
      prompt: <>IEEE 1547 requires grid-tie inverters to disconnect from the grid within seconds of detecting an islanding condition (grid loss).</>,
      choices: [<>True</>, <>False</>],
      correctIndex: 0,
      explanation: <>Anti-islanding protects utility workers servicing &ldquo;dead&rdquo; lines and prevents out-of-spec power downstream<Cite id="ieee-1547-2018" in={CH33_SOURCES} />.</>,
    },
    {
      id: 'q7',
      type: 'numeric',
      prompt: <>A household uses 30 kWh/day for 30 days at $0.20/kWh. What is the monthly bill, in dollars?</>,
      targetValue: 180,
      tolerance: 0.02,
      unit: '$',
      explanation: <>30 &middot; 30 &middot; 0.20 = $180.</>,
    },
    {
      id: 'q8',
      type: 'numeric',
      prompt: <>An industrial load has P = 780 kW and S = 1000 kVA. What is the power factor?</>,
      targetValue: 0.78,
      tolerance: 0.02,
      explanation: <>PF = P/S = 780/1000 = 0.78. Utility penalty thresholds typically kick in below 0.85 or 0.90.</>,
    },
    {
      id: 'q9',
      type: 'short-answer',
      prompt: <>What three-letter unit measures real electrical energy on a household bill?</>,
      acceptedAnswers: ['kwh', 'kw-h', 'kilowatt-hour', 'kilowatt hour'],
      explanation: <>kWh (kilowatt-hour). 1 kWh = 3.6 MJ &mdash; the standard residential billing unit.</>,
    },
    {
      id: 'q10',
      type: 'short-answer',
      prompt: <>What protection mode requires grid-tie solar to shut off when the grid disconnects, preventing energising a dead utility line? (Two words.)</>,
      acceptedAnswers: ['anti-islanding', 'anti islanding', 'islanding protection'],
      explanation: <>Anti-islanding: detects loss of utility voltage/frequency and disconnects the inverter within ~2 s<Cite id="ieee-1547-2018" in={CH33_SOURCES} />.</>,
    },
  ],
};

/* ────────────────────────────────────────────────────────────────────── */
/* Ch.34 — From plug to chip                                              */
/* ────────────────────────────────────────────────────────────────────── */

const CH34_QUIZ: ChapterQuiz = {
  chapterSlug: 'house-plug-to-chip',
  questions: [
    {
      id: 'q1',
      type: 'multiple-choice',
      prompt: <>In a modern laptop power chain, the first stage after the AC plug is:</>,
      choices: [<>Buck converter to 1.0 V.</>, <>Input EMI filter + bridge rectifier + bulk capacitor.</>, <>USB-PD negotiation.</>, <>On-die LDO.</>],
      correctIndex: 1,
      explanation: <>AC enters via an EMI filter; the bridge rectifier converts to pulsed DC; the bulk cap smooths it to roughly &radic;2 V<sub>rms</sub> &approx; 170 V DC<Cite id="erickson-maksimovic-2020" in={CH34_SOURCES} />.</>,
    },
    {
      id: 'q2',
      type: 'multiple-choice',
      prompt: <>USB-PD negotiation determines:</>,
      choices: [<>The cable&rsquo;s color.</>, <>The bus voltage between source and sink, dynamically.</>, <>The frequency of the transmitter.</>, <>The Wi-Fi channel.</>],
      correctIndex: 1,
      explanation: <>The USB Power Delivery protocol exchanges discrete messages on the CC pin to agree on a profile (5/9/15/20/28/36/48 V) within milliseconds<Cite id="usb-pd-r3" in={CH34_SOURCES} />.</>,
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      prompt: <>The reason the bulk capacitor in a laptop charger is rated for 400 V even though the bridge output is only ~170 V is:</>,
      choices: [<>Marketing.</>, <>Margin for line transients, the 240 V European supply, and capacitor de-rating over life.</>, <>The capacitor needs higher voltage to charge.</>, <>It is required by USB-PD.</>],
      correctIndex: 1,
      explanation: <>Universal-input chargers must handle 264 V<sub>rms</sub> &times; &radic;2 = 373 V peak. 400 V or 450 V caps with derating give a comfortable safety margin.</>,
    },
    {
      id: 'q4',
      type: 'multiple-choice',
      prompt: <>The reason flyback converters operate at &asymp;100 kHz rather than at 50/60 Hz is:</>,
      choices: [<>Audible frequencies are forbidden.</>, <>At higher frequency, the transformer and capacitors needed to handle the same power shrink dramatically.</>, <>Higher frequency is more efficient by definition.</>, <>The grid only accepts 100 kHz.</>],
      correctIndex: 1,
      explanation: <>For a given V&middot;s product, &Phi; = V&middot;t. At 100 kHz the &lsquo;t&rsquo; is &asymp;1000&times; shorter than at 60 Hz, so the transformer cross-section can be 1000&times; smaller<Cite id="erickson-maksimovic-2020" in={CH34_SOURCES} />.</>,
    },
    {
      id: 'q5',
      type: 'true-false',
      prompt: <>Galvanic isolation in a laptop charger means the secondary (low-voltage) side has no DC continuity with the mains side.</>,
      choices: [<>True</>, <>False</>],
      correctIndex: 0,
      explanation: <>The flyback transformer transfers energy magnetically; the user-touched side is electrically isolated from the AC mains for safety.</>,
    },
    {
      id: 'q6',
      type: 'true-false',
      prompt: <>The CPU core voltage in a modern laptop is typically less than 1 V; multiple buck stages and on-die LDOs step the 20 V bus down to the actual chip rails.</>,
      choices: [<>True</>, <>False</>],
      correctIndex: 0,
      explanation: <>Modern processes (5 nm, 3 nm) operate near 0.8 V core for transistor reliability. Each generation pushes voltage down to manage power and leakage.</>,
    },
    {
      id: 'q7',
      type: 'numeric',
      prompt: <>The peak voltage of a 120 V<sub>rms</sub> sinusoid is, in volts:</>,
      targetValue: 169.7,
      tolerance: 0.02,
      unit: 'V',
      explanation: <>V<sub>peak</sub> = &radic;2 V<sub>rms</sub> = 1.414 &middot; 120 &approx; 170 V.</>,
    },
    {
      id: 'q8',
      type: 'numeric',
      prompt: <>A USB-PD source negotiates 20 V at 3 A. What power, in watts?</>,
      targetValue: 60,
      tolerance: 0.02,
      unit: 'W',
      explanation: <>P = VI = 20 &middot; 3 = 60 W. The standard 60 W USB-C laptop charger profile.</>,
    },
    {
      id: 'q9',
      type: 'short-answer',
      prompt: <>What is the small low-dropout linear regulator embedded on a CPU die to clean up the last few mV of ripple called? (Acronym.)</>,
      acceptedAnswers: ['ldo', 'low dropout regulator', 'low-dropout regulator'],
      explanation: <>LDO (low-dropout regulator) trades a bit of efficiency for clean, fast-responding voltage to sensitive analog and core rails<Cite id="horowitz-hill-2015" in={CH34_SOURCES} />.</>,
    },
    {
      id: 'q10',
      type: 'short-answer',
      prompt: <>What transformer-style SMPS topology stores energy in the primary inductance during the on-time and releases it through the secondary during the off-time? (One word.)</>,
      acceptedAnswers: ['flyback', 'flyback converter'],
      explanation: <>The flyback converter is the canonical low-power isolated SMPS topology &mdash; nearly every USB charger uses one<Cite id="erickson-maksimovic-2020" in={CH34_SOURCES} />.</>,
    },
  ],
};

/* ────────────────────────────────────────────────────────────────────── */

export const QUIZZES: Partial<Record<ChapterSlug, ChapterQuiz>> = {
  'what-is-electricity': CH1_QUIZ,
  'voltage-and-current': CH2_QUIZ,
  'resistance-and-power': CH3_QUIZ,
  'how-a-resistor-works': CH4_QUIZ,
  'capacitors': CH5_QUIZ,
  'magnetism': CH6_QUIZ,
  'induction': CH7_QUIZ,
  'energy-flow': CH8_QUIZ,
  'em-waves': CH9_QUIZ,
  'maxwell': CH10_QUIZ,
  'relativity': CH11_QUIZ,
  'circuits-and-ac': CH12_QUIZ,
  'network-analysis': CH13_QUIZ,
  'semiconductors': CH14_QUIZ,
  'fourier-harmonics': CH15_QUIZ,
  'filters-op-amps-tlines': CH16_QUIZ,
  'materials': CH17_QUIZ,
  'optics': CH18_QUIZ,
  'antennas': CH19_QUIZ,
  'motors': CH20_QUIZ,
  'generators': CH21_QUIZ,
  'magnetically-coupled-circuits': CH22_QUIZ,
  'transformers': CH23_QUIZ,
  'rectifiers-and-inverters': CH24_QUIZ,
  'batteries': CH25_QUIZ,
  'modern-batteries': CH26_QUIZ,
  'house-grid-arrives': CH27_QUIZ,
  'house-panel': CH28_QUIZ,
  'house-branch-circuits': CH29_QUIZ,
  'house-switches-receptacles': CH30_QUIZ,
  'house-big-loads': CH31_QUIZ,
  'house-safety': CH32_QUIZ,
  'house-smart-meter': CH33_QUIZ,
  'house-plug-to-chip': CH34_QUIZ,
};

export function getQuiz(slug: ChapterSlug): ChapterQuiz | undefined {
  return QUIZZES[slug];
}

/** Convenience: the effective passing threshold for a slug. */
export function getPassingScore(slug: ChapterSlug): number {
  return QUIZZES[slug]?.passingScore ?? DEFAULT_PASSING_SCORE;
}
