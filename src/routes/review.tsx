import { Link, createFileRoute } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';

import {
  getProgress,
  getDueReviews,
  getUpcomingReviews,
  getReviewSummary,
  onProgressChange,
  REVIEW_INTERVALS_DAYS,
  type ReviewSchedule,
  type ProgressState,
} from '@/lib/progress';
import { getChapter, type ChapterSlug } from '@/textbook/data/chapters';

export const Route = createFileRoute('/review')({
  component: ReviewPage,
});

function intervalLabel(idx: number): string {
  const days = REVIEW_INTERVALS_DAYS[idx] ?? 1;
  if (days === 1) return '1-day review';
  if (days < 7) return `${days}-day review`;
  if (days === 7) return '1-week review';
  if (days < 30) return `${days}-day review`;
  if (days === 30) return '1-month review';
  if (days === 90) return '3-month review';
  return `${days}-day review`;
}

function relativeDue(ms: number, now: number): string {
  const delta = ms - now;
  const absMin = Math.round(Math.abs(delta) / 60_000);
  if (delta <= 0) {
    if (absMin < 60) return 'overdue';
    const hours = Math.round(absMin / 60);
    if (hours < 24) return `${hours}h overdue`;
    const days = Math.round(hours / 24);
    return `${days}d overdue`;
  }
  if (absMin < 60) return `due in ${absMin} min`;
  const hours = Math.round(absMin / 60);
  if (hours < 24) return `due in ${hours}h`;
  const days = Math.round(hours / 24);
  if (days < 7) return `due in ${days}d`;
  const weeks = Math.round(days / 7);
  if (weeks < 5) return `due in ${weeks}w`;
  const months = Math.round(days / 30);
  return `due in ${months}mo`;
}

function cumulativeRetention(progress: ProgressState): number | null {
  // Heuristic: count quizzes ever attempted vs ever passed. Returns null if
  // the reader hasn't attempted any quizzes yet.
  let attempts = 0;
  let passed = 0;
  for (const c of Object.values(progress.chapters)) {
    if (!c) continue;
    if ((c.quizAttempts ?? 0) > 0) attempts += 1;
    if ((c.bestQuizScore ?? 0) >= 0.7) passed += 1;
  }
  if (attempts === 0) return null;
  return Math.round((passed / attempts) * 100);
}

function ReviewPage() {
  const [progress, setProgress] = useState<ProgressState>(() => getProgress());
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => onProgressChange(() => setProgress(getProgress())), []);
  // Refresh the "due in Xm" copy every minute so it stays honest while the
  // page is open.
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  // progress is read implicitly by the helpers, but we depend on it for
  // re-render trigger:
  void progress;

  const due = useMemo(() => getDueReviews(now), [progress, now]);
  const upcoming = useMemo(() => getUpcomingReviews(now).slice(0, 8), [progress, now]);
  const summary = useMemo(() => getReviewSummary(now), [progress, now]);
  const retention = useMemo(() => cumulativeRetention(progress), [progress]);

  const isEmpty = summary.totalScheduled === 0;

  return (
    <section className="max-w-page mx-auto pt-3xl px-xl pb-4xl">
      <header className="mb-2xl">
        <div className="eyebrow-muted mb-md">Field · Theory · Spaced repetition</div>
        <h1 className="font-2 font-normal text-[clamp(36px,6vw,56px)] leading-1 mb-lg text-text">
          Reviews <em className="italic text-accent">due</em>.
        </h1>
        <p className="body-copy max-w-page-sm leading-4 mb-xl">
          The system surfaces quizzes you previously passed on a 1-day, 3-day,
          1-week, 1-month, and 3-month schedule. Pass a review to advance to
          the next interval; miss one and you reset to day 1.
        </p>

        <div className="grid grid-cols-4 gap-md max-md:grid-cols-2">
          <SummaryStat label="Due today" value={summary.dueToday} />
          <SummaryStat label="Due this week" value={summary.dueThisWeek} />
          <SummaryStat label="Total scheduled" value={summary.totalScheduled} />
          <SummaryStat
            label="Cumulative retention"
            value={retention === null ? '—' : `${retention}%`}
          />
        </div>
      </header>

      {isEmpty ? (
        <div className="p-xl border border-dashed border-border-strong rounded-6 text-text-dim text-center">
          <p>
            No reviews yet. Pass a chapter quiz to start building your review
            queue. {' '}
            <Link to="/" className="text-accent no-underline border-b border-accent-soft hover:text-text">Browse the contents</Link>
            {' '} or {' '}
            <Link to="/me" className="text-accent no-underline border-b border-accent-soft hover:text-text">view your transcript</Link>.
          </p>
        </div>
      ) : null}

      {due.length > 0 ? (
        <section className="mt-2xl">
          <h2 className="font-2 font-normal text-8 mb-lg text-text">Due now</h2>
          <ul className="grid-list gap-md grid-cols-2 max-md:grid-cols-1">
            {due.map((r) => (
              <ReviewCard key={r.slug} review={r} now={now} />
            ))}
          </ul>
        </section>
      ) : null}

      {upcoming.length > 0 ? (
        <section className="mt-2xl">
          <h2 className="font-2 font-normal text-8 mb-lg text-text">Upcoming reviews</h2>
          <ul className="grid-list gap-md">
            {upcoming.map((r) => (
              <UpcomingRow key={r.slug} review={r} now={now} />
            ))}
          </ul>
        </section>
      ) : null}
    </section>
  );
}

function SummaryStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="py-lg px-lg bg-bg-card border border-border-1 rounded-5">
      <div className="font-2 text-8 leading-none text-text">{value}</div>
      <div className="eyebrow-muted tracking-3 mt-sm">{label}</div>
    </div>
  );
}

function ReviewCard({ review, now }: { review: ReviewSchedule; now: number }) {
  const chapter = getChapter(review.slug as ChapterSlug);
  if (!chapter) return null;
  return (
    <li className="py-lg px-lg pb-lg bg-bg-card border border-border-2 rounded-7 flex flex-col gap-sm">
      <div className="flex flex-wrap gap-md items-center font-3 text-2 tracking-2">
        <span className="text-accent uppercase">Ch.{chapter.number}</span>
        <span className="text-teal uppercase">{intervalLabel(review.intervalIdx)}</span>
        <span className="text-text-muted ml-auto">{relativeDue(review.nextDueAt, now)}</span>
      </div>
      <div className="font-2 text-8 leading-2 text-text">{chapter.title}</div>
      {chapter.subtitle ? (
        <div className="text-text-dim text-5 leading-3">{chapter.subtitle}</div>
      ) : null}
      <div className="flex gap-md mt-sm">
        <a
          href={`/textbook/${chapter.slug}?mode=review`}
          className="inline-flex items-center py-md px-lg bg-accent text-bg rounded-4 font-3 text-3 tracking-2 no-underline uppercase hover:brightness-110"
        >
          Start review
        </a>
        <Link
          to="/textbook/$chapterSlug"
          params={{ chapterSlug: chapter.slug }}
          className="inline-flex items-center py-md px-lg bg-transparent text-text-dim border border-border-2 rounded-4 font-3 text-3 tracking-2 no-underline uppercase hover:text-text hover:border-text-dim"
        >
          Re-read chapter
        </Link>
      </div>
    </li>
  );
}

function UpcomingRow({ review, now }: { review: ReviewSchedule; now: number }) {
  const chapter = getChapter(review.slug as ChapterSlug);
  if (!chapter) return null;
  return (
    <li className="grid items-center gap-md py-md px-lg bg-bg-card border border-border-1 rounded-5 grid-cols-[60px_1fr_auto_auto] max-xs:grid-cols-[60px_1fr] max-xs:gap-y-xs">
      <span className="eyebrow-accent text-2 tracking-2">Ch.{chapter.number}</span>
      <Link
        to="/textbook/$chapterSlug"
        params={{ chapterSlug: chapter.slug }}
        className="text-text text-6 no-underline hover:text-accent"
      >
        {chapter.title}
      </Link>
      <span className="font-3 text-2 text-teal tracking-2 max-xs:justify-self-start">{intervalLabel(review.intervalIdx)}</span>
      <span className="font-3 text-2 text-text-muted tracking-2 max-xs:justify-self-end">{relativeDue(review.nextDueAt, now)}</span>
    </li>
  );
}
