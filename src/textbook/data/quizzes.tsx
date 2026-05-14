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
const CH27_SOURCES = sourcesFor('house-grid-arrives');

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

export const QUIZZES: Partial<Record<ChapterSlug, ChapterQuiz>> = {
  'what-is-electricity': CH1_QUIZ,
  'house-grid-arrives': CH27_QUIZ,
};

export function getQuiz(slug: ChapterSlug): ChapterQuiz | undefined {
  return QUIZZES[slug];
}

/** Convenience: the effective passing threshold for a slug. */
export function getPassingScore(slug: ChapterSlug): number {
  return QUIZZES[slug]?.passingScore ?? DEFAULT_PASSING_SCORE;
}
