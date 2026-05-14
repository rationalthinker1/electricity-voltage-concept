/**
 * Badge catalog for Field · Theory.
 *
 * Each badge's `earned` predicate reads ProgressState directly and is
 * pure — no I/O. The full list is rendered by <BadgeShelf /> on /me.
 *
 * Rarity convention:
 *   common   (gray)  — single-chapter badges in foundational chapters
 *   uncommon (teal)  — single-chapter badges in advanced chapters
 *   rare     (amber) — quiz / track badges
 *   epic     (pink)  — physics rigorist, perfect recall, marathon
 */

import { CHAPTERS, type ChapterSlug, type TrackId } from '@/textbook/data/chapters';
import type { ProgressState } from '@/lib/progress';

export type BadgeRarity = 'common' | 'uncommon' | 'rare' | 'epic';

export interface Badge {
  id: string;
  name: string;
  description: string;
  flavor?: string;
  rarity: BadgeRarity;
  /** Unicode glyph used as the badge symbol. Single semantic icon. */
  icon: string;
  earned: (progress: ProgressState) => boolean;
}

function chapterComplete(slug: ChapterSlug): (p: ProgressState) => boolean {
  return (p) => p.chapters[slug]?.status === 'completed';
}

function trackComplete(track: TrackId): (p: ProgressState) => boolean {
  const slugs = CHAPTERS.filter(c => (c.tracks ?? []).includes(track)).map(c => c.slug);
  return (p) => slugs.every(s => p.chapters[s]?.status === 'completed');
}

function quizPassCountAtLeast(n: number, threshold = 0.7): (p: ProgressState) => boolean {
  return (p) => {
    let count = 0;
    for (const c of Object.values(p.chapters)) {
      if ((c?.bestQuizScore ?? 0) >= threshold) count += 1;
    }
    return count >= n;
  };
}

function quizPerfectAtLeast(n: number): (p: ProgressState) => boolean {
  return (p) => {
    let count = 0;
    for (const c of Object.values(p.chapters)) {
      if ((c?.bestQuizScore ?? 0) >= 1) count += 1;
    }
    return count >= n;
  };
}

function streakAtLeast(n: number): (p: ProgressState) => boolean {
  return (p) => (p.streak?.days ?? 0) >= n;
}

function reviewsAtTopBucket(n: number): (p: ProgressState) => boolean {
  return (p) => {
    let sum = 0;
    for (const r of Object.values(p.reviews ?? {})) {
      sum += r?.completedAtTopInterval ?? 0;
    }
    return sum >= n;
  };
}

export const BADGES: Badge[] = [
  // ─── Chapter-specific (foundational → common; later → uncommon) ───
  {
    id: 'first-charge',
    name: 'First Charge',
    description: 'Complete Ch.1 — Charge and field.',
    flavor: 'Rub a balloon on your hair. Watch the universe pick a side.',
    rarity: 'common',
    icon: '⚡',
    earned: chapterComplete('what-is-electricity'),
  },
  {
    id: 'field-theorist',
    name: 'Field Theorist',
    description: 'Complete Ch.8 — Where the energy actually flows.',
    flavor: 'The energy was never in the wire. It rode the field beside it.',
    rarity: 'uncommon',
    icon: '∇',
    earned: chapterComplete('energy-flow'),
  },
  {
    id: 'synthesist',
    name: 'Synthesist',
    description: 'Complete Ch.10 — Maxwell’s synthesis.',
    flavor: 'Four equations. One field. The deepest unification before relativity.',
    rarity: 'uncommon',
    icon: '∮',
    earned: chapterComplete('maxwell'),
  },
  {
    id: 'network-architect',
    name: 'Network Architect',
    description: 'Complete Ch.13 — Network analysis methods.',
    flavor: 'Mesh, nodal, Norton, Y-Δ. The toolbox is complete.',
    rarity: 'uncommon',
    icon: '⌗',
    earned: chapterComplete('network-analysis'),
  },
  {
    id: 'transistor-whisperer',
    name: 'Transistor Whisperer',
    description: 'Complete Ch.14 — Semiconductors and transistors.',
    flavor: 'Doped silicon, biased junctions, gain on demand.',
    rarity: 'uncommon',
    icon: '⌁',
    earned: chapterComplete('semiconductors'),
  },
  {
    id: 'fourier-decomposed',
    name: 'Fourier Decomposed',
    description: 'Complete Ch.15 — Fourier and harmonic analysis.',
    flavor: 'Every signal is a sum of sines. Especially the ugly ones.',
    rarity: 'uncommon',
    icon: '≈',
    earned: chapterComplete('fourier-harmonics'),
  },
  {
    id: 'tonal-engineer',
    name: 'Tonal Engineer',
    description: 'Complete Ch.16 — Filters, op-amps, and transmission lines.',
    flavor: 'Shape a frequency response. Shape what the system hears.',
    rarity: 'uncommon',
    icon: '⨍',
    earned: chapterComplete('filters-op-amps-tlines'),
  },
  {
    id: 'light-bender',
    name: 'Light Bender',
    description: 'Complete Ch.18 — Optics from EM.',
    flavor: 'Index of refraction is a story about phase velocity.',
    rarity: 'uncommon',
    icon: '◈',
    earned: chapterComplete('optics'),
  },
  {
    id: 'antenna-designer',
    name: 'Antenna Designer',
    description: 'Complete Ch.19 — Antennas and radiation.',
    flavor: 'A wire that accelerates charge becomes a wire that talks to space.',
    rarity: 'uncommon',
    icon: '⊤',
    earned: chapterComplete('antennas'),
  },
  {
    id: 'power-mover',
    name: 'Power Mover',
    description: 'Complete Ch.21 — Generators and the grid.',
    flavor: 'Spin a magnet near a coil. The entire continent lights up.',
    rarity: 'uncommon',
    icon: '⦿',
    earned: chapterComplete('generators'),
  },
  {
    id: 'transformer-tuned',
    name: 'Transformer Tuned',
    description: 'Complete Ch.23 — Transformers.',
    flavor: 'Coupled flux trades voltage for current and never loses the bargain.',
    rarity: 'uncommon',
    icon: '⦾',
    earned: chapterComplete('transformers'),
  },
  {
    id: 'plug-pro',
    name: 'Plug Pro',
    description: 'Complete Ch.27 — How the grid arrives at the house.',
    flavor: 'Service drop, meter base, panel. The same sequence everywhere.',
    rarity: 'common',
    icon: '☰',
    earned: chapterComplete('house-grid-arrives'),
  },
  {
    id: 'panel-master',
    name: 'Panel Master',
    description: 'Complete Ch.28 — The house panel.',
    flavor: 'Bus bars, breakers, neutrals, grounds. Know which goes where.',
    rarity: 'common',
    icon: '▤',
    earned: chapterComplete('house-panel'),
  },
  {
    id: 'code-reader',
    name: 'Code Reader',
    description: 'Complete Ch.29 — Branch circuits.',
    flavor: 'Conductors, OCPD, derating. The NEC is a long argument about heat.',
    rarity: 'common',
    icon: '§',
    earned: chapterComplete('house-branch-circuits'),
  },
  {
    id: 'life-saver',
    name: 'Life Saver',
    description: 'Complete Ch.32 — Safety: GFCI, AFCI, grounding.',
    flavor: 'Most of what an electrician does is keep current away from people. Take this one seriously.',
    rarity: 'uncommon',
    icon: '☠',
    earned: chapterComplete('house-safety'),
  },
  {
    id: 'wall-to-chip',
    name: 'Wall to Chip',
    description: 'Complete Ch.34 — From wall outlet to chip rail.',
    flavor: 'AC to DC, DC to DC, DC to logic. Five conversion stages in a metre.',
    rarity: 'uncommon',
    icon: '⋯',
    earned: chapterComplete('house-plug-to-chip'),
  },

  // ─── Track-completion ───
  {
    id: 'practical-electrician',
    name: 'Practical Electrician',
    description: 'Complete every chapter on the Practical track.',
    flavor: 'Hands on the panel, eyes on the code book.',
    rarity: 'rare',
    icon: '⚒',
    earned: trackComplete('practical'),
  },
  {
    id: 'bench-engineer',
    name: 'Bench Engineer',
    description: 'Complete every chapter on the Bench track.',
    flavor: 'Probes down, scope warm, oscillation tamed.',
    rarity: 'rare',
    icon: '⚙',
    earned: trackComplete('bench'),
  },
  {
    id: 'physics-rigorist',
    name: 'Physics Rigorist',
    description: 'Complete every chapter in the textbook.',
    flavor: 'Every chapter, every demo, every footnote. Welcome to the field.',
    rarity: 'epic',
    icon: '∇',
    earned: trackComplete('rigor'),
  },

  // ─── Quiz mastery ───
  {
    id: 'quick-study',
    name: 'Quick Study',
    description: 'Pass any 5 chapter quizzes.',
    flavor: 'Five passes. The shape of the textbook starts to fit.',
    rarity: 'rare',
    icon: '✓',
    earned: quizPassCountAtLeast(5),
  },
  {
    id: 'quizmaster',
    name: 'Quizmaster',
    description: 'Pass 15 chapter quizzes.',
    flavor: 'Fifteen passes. You can teach the early chapters now.',
    rarity: 'rare',
    icon: '★',
    earned: quizPassCountAtLeast(15),
  },
  {
    id: 'perfect-recall',
    name: 'Perfect Recall',
    description: 'Score 100% on any 3 quizzes.',
    flavor: 'Three perfect scores. Every symbol exactly where it belongs.',
    rarity: 'epic',
    icon: '✪',
    earned: quizPerfectAtLeast(3),
  },

  // ─── Streak / retention ───
  {
    id: 'daily-driver',
    name: 'Daily Driver',
    description: 'Open a chapter on 7 consecutive days.',
    flavor: 'A week of small reps. The habit takes hold.',
    rarity: 'rare',
    icon: '☉',
    earned: streakAtLeast(7),
  },
  {
    id: 'marathon',
    name: 'Marathon',
    description: 'Open a chapter on 30 consecutive days.',
    flavor: 'A month of unbroken study. Few readers get here.',
    rarity: 'epic',
    icon: '⚫',
    earned: streakAtLeast(30),
  },
  {
    id: 'spaced-and-locked',
    name: 'Spaced and Locked',
    description: 'Complete 10 reviews at the 3-month interval.',
    flavor: 'Retention proven across three months. The knowledge is yours.',
    rarity: 'epic',
    icon: '✧',
    earned: reviewsAtTopBucket(10),
  },
];

export function countEarned(progress: ProgressState): number {
  let n = 0;
  for (const b of BADGES) if (b.earned(progress)) n += 1;
  return n;
}
