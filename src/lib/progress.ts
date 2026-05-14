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
}

export interface ProgressState {
  chapters: Partial<Record<ChapterSlug, ChapterProgress>>;
  streak: {
    days: number;
    /** ISO `yyyy-mm-dd` (UTC) of the last day a chapter was touched */
    lastUpdatedDay: string;
  };
}

export const PROGRESS_STORAGE_KEY = 'fieldTheoryProgress';
export const PROGRESS_EVENT = 'progress-change';

function emptyState(): ProgressState {
  return {
    chapters: {},
    streak: { days: 0, lastUpdatedDay: '' },
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
    return {
      chapters: parsed.chapters ?? {},
      streak: parsed.streak ?? { days: 0, lastUpdatedDay: '' },
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
