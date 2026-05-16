/**
 * Reader-progress tracking, persisted to localStorage.
 *
 * Schema (key: `fieldTheoryProgress`):
 *   {
 *     chapters: { [slug]: { status, lastOpenedAt, completedAt?, totalTimeMs } },
 *     streak:   { days, lastUpdatedDay }
 *   }
 *
 * Each mutating function dispatches a `progress-change` CustomEvent on
 * `window` so listeners (the /me page, /tracks progress bars, the
 * Mark-as-complete button in <ChapterShell>) refresh without a page reload.
 *
 * All reads are defensive: corrupted JSON, missing keys, or a disabled
 * localStorage all degrade to a sensible empty state.
 */

import type { ChapterSlug } from '@/textbook/data/chapters';

export type ChapterStatus = 'opened' | 'completed';

export interface ChapterProgress {
  status: ChapterStatus;
  /** ms epoch */
  lastOpenedAt: number;
  /** ms epoch — set when status flips to 'completed' */
  completedAt?: number;
  /** Accumulated time on the chapter page, in ms */
  totalTimeMs: number;
  /**
   * Quiz fields — owned by Phase 4A. Defensive so older saves still load.
   */
  bestQuizScore?: number;
  lastQuizAttemptAt?: number;
  quizAttempts?: number;
}

/** Spaced-repetition: bucketed review intervals in days. */
export const REVIEW_INTERVALS_DAYS: number[] = [1, 3, 7, 30, 90];

export interface ReviewSchedule {
  /** Chapter slug. */
  slug: ChapterSlug;
  /** Last successful review (ms epoch). */
  lastReviewedAt: number;
  /** Current interval bucket — 0 = 1 day … 4 = 3 months. */
  intervalIdx: number;
  /** Computed: next review due (ms epoch). */
  nextDueAt: number;
  /** Count of successful reviews at the top bucket (intervalIdx === 4). */
  completedAtTopInterval?: number;
}

export interface ProgressState {
  chapters: Partial<Record<ChapterSlug, ChapterProgress>>;
  streak: {
    days: number;
    /** ISO `yyyy-mm-dd` (UTC) of the last day a chapter was touched */
    lastUpdatedDay: string;
  };
  /** Spaced-repetition queue, keyed by chapter slug. */
  reviews: Partial<Record<ChapterSlug, ReviewSchedule>>;
}

export const PROGRESS_STORAGE_KEY = 'fieldTheoryProgress';
export const PROGRESS_EVENT = 'progress-change';

function emptyState(): ProgressState {
  return {
    chapters: {},
    streak: { days: 0, lastUpdatedDay: '' },
    reviews: {},
  };
}

function isProgressState(value: unknown): value is ProgressState {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.chapters === 'object' &&
    v.chapters !== null &&
    typeof v.streak === 'object' &&
    v.streak !== null
  );
}

export function getProgress(): ProgressState {
  if (typeof window === 'undefined') return emptyState();
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
  } catch {
    return emptyState();
  }
  if (!raw) return emptyState();
  try {
    const parsed = JSON.parse(raw);
    if (!isProgressState(parsed)) return emptyState();
    // Backfill missing fields defensively.
    const anyParsed = parsed as ProgressState & { reviews?: unknown };
    const reviews =
      anyParsed.reviews && typeof anyParsed.reviews === 'object'
        ? (anyParsed.reviews as ProgressState['reviews'])
        : {};
    return {
      chapters: parsed.chapters ?? {},
      streak: parsed.streak ?? { days: 0, lastUpdatedDay: '' },
      reviews: reviews ?? {},
    };
  } catch {
    return emptyState();
  }
}

function writeProgress(state: ProgressState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage is full / disabled. State survives for the current session.
  }
  try {
    window.dispatchEvent(new CustomEvent(PROGRESS_EVENT));
  } catch {
    // CustomEvent unavailable; ignore.
  }
}

function todayKey(now: number = Date.now()): string {
  const d = new Date(now);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function bumpStreak(state: ProgressState, now: number): void {
  const today = todayKey(now);
  if (state.streak.lastUpdatedDay === today) return;
  // Compute whether yesterday was the previous touched day.
  if (state.streak.lastUpdatedDay) {
    const prev = new Date(state.streak.lastUpdatedDay + 'T00:00:00');
    const cur = new Date(today + 'T00:00:00');
    const diffDays = Math.round((cur.getTime() - prev.getTime()) / 86_400_000);
    if (diffDays === 1) {
      state.streak.days = state.streak.days + 1;
    } else {
      state.streak.days = 1;
    }
  } else {
    state.streak.days = 1;
  }
  state.streak.lastUpdatedDay = today;
}

export function markChapterOpened(slug: ChapterSlug): void {
  const state = getProgress();
  const now = Date.now();
  const existing = state.chapters[slug];
  state.chapters[slug] = {
    status: existing?.status === 'completed' ? 'completed' : 'opened',
    lastOpenedAt: now,
    completedAt: existing?.completedAt,
    totalTimeMs: existing?.totalTimeMs ?? 0,
  };
  bumpStreak(state, now);
  writeProgress(state);
}

export function markChapterCompleted(slug: ChapterSlug): void {
  const state = getProgress();
  const now = Date.now();
  const existing = state.chapters[slug];
  state.chapters[slug] = {
    status: 'completed',
    lastOpenedAt: existing?.lastOpenedAt ?? now,
    completedAt: existing?.completedAt ?? now,
    totalTimeMs: existing?.totalTimeMs ?? 0,
  };
  bumpStreak(state, now);
  writeProgress(state);
}

export function addTimeSpent(slug: ChapterSlug, ms: number): void {
  if (!ms || ms <= 0) return;
  const state = getProgress();
  const existing = state.chapters[slug];
  state.chapters[slug] = {
    status: existing?.status ?? 'opened',
    lastOpenedAt: existing?.lastOpenedAt ?? Date.now(),
    completedAt: existing?.completedAt,
    totalTimeMs: (existing?.totalTimeMs ?? 0) + ms,
  };
  writeProgress(state);
}

export function resetProgress(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(PROGRESS_STORAGE_KEY);
  } catch {
    // ignore
  }
  try {
    window.dispatchEvent(new CustomEvent(PROGRESS_EVENT));
  } catch {
    // ignore
  }
}

/* ─────────────────────────────────────────────────────────────────
 * Quiz attempts — Phase 4A
 *
 * The full Quiz UI / question bank lives in Phase 4A. These helpers
 * only persist attempt metadata against the chapter row, and trigger
 * spaced-repetition scheduling when an attempt passes.
 * ──────────────────────────────────────────────────────────────── */

export interface QuizAttemptOptions {
  /** 0..1 score the reader received. */
  score: number;
  /** Threshold considered a "pass" (default 0.7). */
  passThreshold?: number;
  /** Optional timestamp override (mostly for tests). */
  now?: number;
}

export function recordQuizAttempt(slug: ChapterSlug, opts: QuizAttemptOptions): boolean {
  const state = getProgress();
  const now = opts.now ?? Date.now();
  const passThreshold = opts.passThreshold ?? 0.7;
  const passed = opts.score >= passThreshold;
  const existing = state.chapters[slug];
  // On a pass we also flip the chapter's status to 'completed' (and stamp
  // completedAt on first-ever pass). Failing attempts never demote status.
  const nextStatus: ChapterStatus = passed ? 'completed' : (existing?.status ?? 'opened');
  state.chapters[slug] = {
    status: nextStatus,
    lastOpenedAt: existing?.lastOpenedAt ?? now,
    completedAt:
      nextStatus === 'completed' ? (existing?.completedAt ?? now) : existing?.completedAt,
    totalTimeMs: existing?.totalTimeMs ?? 0,
    bestQuizScore: Math.max(existing?.bestQuizScore ?? 0, opts.score),
    lastQuizAttemptAt: now,
    quizAttempts: (existing?.quizAttempts ?? 0) + 1,
  };
  // Bump streak: any quiz attempt counts as engagement for the day.
  bumpStreak(state, now);
  // Update review schedule in the same state object before writing.
  applyReviewScheduleMutation(state, slug, passed, now);
  writeProgress(state);
  return passed;
}

export interface QuizStatus {
  attempts: number;
  bestScore: number;
  lastAttemptAt?: number;
  passed: boolean;
}

export function getQuizStatus(slug: ChapterSlug, passThreshold = 0.7): QuizStatus {
  const p = getProgress().chapters[slug];
  const bestScore = p?.bestQuizScore ?? 0;
  return {
    attempts: p?.quizAttempts ?? 0,
    bestScore,
    lastAttemptAt: p?.lastQuizAttemptAt,
    passed: bestScore >= passThreshold,
  };
}

/* ─────────────────────────────────────────────────────────────────
 * Spaced-repetition scheduling.
 * ──────────────────────────────────────────────────────────────── */

function nextDueAt(intervalIdx: number, from: number): number {
  const clamped = Math.min(Math.max(intervalIdx, 0), REVIEW_INTERVALS_DAYS.length - 1);
  const days = REVIEW_INTERVALS_DAYS[clamped]!;
  return from + days * 86_400_000;
}

function applyReviewScheduleMutation(
  state: ProgressState,
  slug: ChapterSlug,
  success: boolean,
  now: number,
): void {
  const existing = state.reviews[slug];
  if (!success) {
    // Failure: reset to interval 0, due tomorrow.
    state.reviews[slug] = {
      slug,
      lastReviewedAt: now,
      intervalIdx: 0,
      nextDueAt: nextDueAt(0, now),
      completedAtTopInterval: existing?.completedAtTopInterval ?? 0,
    };
    return;
  }
  if (!existing) {
    // First-ever pass: schedule at interval 0.
    state.reviews[slug] = {
      slug,
      lastReviewedAt: now,
      intervalIdx: 0,
      nextDueAt: nextDueAt(0, now),
      completedAtTopInterval: 0,
    };
    return;
  }
  // Subsequent success — only advance the bucket if we're at-or-past due,
  // otherwise just refresh lastReviewedAt without inflating interval.
  const dueNow = existing.nextDueAt <= now;
  const nextIdx = dueNow
    ? Math.min(existing.intervalIdx + 1, REVIEW_INTERVALS_DAYS.length - 1)
    : existing.intervalIdx;
  const topHit =
    dueNow &&
    nextIdx === REVIEW_INTERVALS_DAYS.length - 1 &&
    existing.intervalIdx === REVIEW_INTERVALS_DAYS.length - 1;
  state.reviews[slug] = {
    slug,
    lastReviewedAt: now,
    intervalIdx: nextIdx,
    nextDueAt: nextDueAt(nextIdx, now),
    completedAtTopInterval: (existing.completedAtTopInterval ?? 0) + (topHit ? 1 : 0),
  };
}

/** Called from recordQuizAttempt (or directly by a quiz route) with the
 *  pass/fail result. Advances the bucket on a passing retake at-or-after
 *  due-date; resets to interval 0 on failure. */
export function scheduleReview(slug: ChapterSlug, success: boolean): void {
  const state = getProgress();
  applyReviewScheduleMutation(state, slug, success, Date.now());
  writeProgress(state);
}

/** All reviews whose nextDueAt <= now, sorted oldest-due-first. */
export function getDueReviews(now: number = Date.now()): ReviewSchedule[] {
  const state = getProgress();
  const out: ReviewSchedule[] = [];
  for (const r of Object.values(state.reviews)) {
    if (r && r.nextDueAt <= now) out.push(r);
  }
  out.sort((a, b) => a.nextDueAt - b.nextDueAt);
  return out;
}

/** All reviews not yet due, sorted by soonest-due. */
export function getUpcomingReviews(now: number = Date.now()): ReviewSchedule[] {
  const state = getProgress();
  const out: ReviewSchedule[] = [];
  for (const r of Object.values(state.reviews)) {
    if (r && r.nextDueAt > now) out.push(r);
  }
  out.sort((a, b) => a.nextDueAt - b.nextDueAt);
  return out;
}

export interface ReviewSummary {
  totalScheduled: number;
  dueToday: number;
  dueThisWeek: number;
}

export function getReviewSummary(now: number = Date.now()): ReviewSummary {
  const state = getProgress();
  const endOfToday = endOfDay(now);
  const inOneWeek = now + 7 * 86_400_000;
  let total = 0;
  let dueToday = 0;
  let dueThisWeek = 0;
  for (const r of Object.values(state.reviews)) {
    if (!r) continue;
    total += 1;
    if (r.nextDueAt <= endOfToday) dueToday += 1;
    if (r.nextDueAt <= inOneWeek) dueThisWeek += 1;
  }
  return { totalScheduled: total, dueToday, dueThisWeek };
}

function endOfDay(now: number): number {
  const d = new Date(now);
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

/** Subscribe to progress-change events. Returns an unsubscribe. */
export function onProgressChange(listener: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = () => listener();
  window.addEventListener(PROGRESS_EVENT, handler);
  // Cross-tab sync via the storage event.
  const storageHandler = (e: StorageEvent) => {
    if (e.key === PROGRESS_STORAGE_KEY) listener();
  };
  window.addEventListener('storage', storageHandler);
  return () => {
    window.removeEventListener(PROGRESS_EVENT, handler);
    window.removeEventListener('storage', storageHandler);
  };
}
