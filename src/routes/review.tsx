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
    <section className="max-w-[940px] mx-auto pt-[48px] px-xl pb-[96px]">
      <header className="mb-[36px]">
        <div className="font-3 text-[11px] tracking-[.12em] uppercase text-text-muted mb-[10px]">Field · Theory · Spaced repetition</div>
        <h1 className="font-2 font-normal text-[clamp(36px,6vw,56px)] leading-[1.05] mb-[14px] text-color-4">
          Reviews <em className="italic text-accent">due</em>.
        </h1>
        <p className="text-color-5 text-[16px] max-w-[680px] leading-[1.55] mb-xl">
          The system surfaces quizzes you previously passed on a 1-day, 3-day,
          1-week, 1-month, and 3-month schedule. Pass a review to advance to
          the next interval; miss one and you reset to day 1.
        </p>

        <div className="grid grid-cols-4 gap-[12px] max-[720px]:grid-cols-2">
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
        <div className="p-xl border border-dashed border-border-strong rounded-6 text-color-5 text-center">
          <p>
            No reviews yet. Pass a chapter quiz to start building your review
            queue. {' '}
            <Link to="/" className="text-accent no-underline border-b border-accent-soft hover:text-color-4">Browse the contents</Link>
            {' '} or {' '}
            <Link to="/me" className="text-accent no-underline border-b border-accent-soft hover:text-color-4">view your transcript</Link>.
          </p>
        </div>
      ) : null}

      {due.length > 0 ? (
        <section className="mt-[32px]">
          <h2 className="font-2 font-normal text-[22px] mb-[14px] text-color-4">Due now</h2>
          <ul className="list-none m-0 p-0 grid gap-[12px] grid-cols-2 max-[720px]:grid-cols-1">
            {due.map((r) => (
              <ReviewCard key={r.slug} review={r} now={now} />
            ))}
          </ul>
        </section>
      ) : null}

      {upcoming.length > 0 ? (
        <section className="mt-[32px]">
          <h2 className="font-2 font-normal text-[22px] mb-[14px] text-color-4">Upcoming reviews</h2>
          <ul className="list-none m-0 p-0 grid gap-[12px]">
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
    <div className="py-[12px] px-[14px] bg-bg-card border border-border-1 rounded-5">
      <div className="font-2 text-[28px] leading-none text-color-4">{value}</div>
      <div className="font-3 text-[11px] tracking-[.08em] uppercase text-text-muted mt-[6px]">{label}</div>
    </div>
  );
}

function ReviewCard({ review, now }: { review: ReviewSchedule; now: number }) {
  const chapter = getChapter(review.slug as ChapterSlug);
  if (!chapter) return null;
  return (
    <li className="py-[18px] px-[18px] pb-[16px] bg-bg-card border border-border-2 rounded-[12px] flex flex-col gap-[8px]">
      <div className="flex flex-wrap gap-[10px] items-center font-3 text-[11px] tracking-[.06em]">
        <span className="text-accent uppercase">Ch.{chapter.number}</span>
        <span className="text-teal uppercase">{intervalLabel(review.intervalIdx)}</span>
        <span className="text-text-muted ml-auto">{relativeDue(review.nextDueAt, now)}</span>
      </div>
      <div className="font-2 text-[22px] leading-[1.15] text-color-4">{chapter.title}</div>
      {chapter.subtitle ? (
        <div className="text-color-5 text-[14px] leading-[1.45]">{chapter.subtitle}</div>
      ) : null}
      <div className="flex gap-[10px] mt-[6px]">
        <a
          href={`/textbook/${chapter.slug}?mode=review`}
          className="inline-flex items-center py-[8px] px-[14px] bg-accent text-bg rounded-4 font-3 text-[12px] tracking-[.06em] no-underline uppercase hover:brightness-110"
        >
          Start review
        </a>
        <Link
          to="/textbook/$chapterSlug"
          params={{ chapterSlug: chapter.slug }}
          className="inline-flex items-center py-[8px] px-[14px] bg-transparent text-color-5 border border-border-2 rounded-4 font-3 text-[12px] tracking-[.06em] no-underline uppercase hover:text-color-4 hover:border-color-5"
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
    <li className="grid items-center gap-[12px] py-[10px] px-[14px] bg-bg-card border border-border-1 rounded-5 grid-cols-[60px_1fr_auto_auto] max-[540px]:grid-cols-[60px_1fr] max-[540px]:gap-y-[4px]">
      <span className="font-3 text-[11px] text-accent tracking-[.06em] uppercase">Ch.{chapter.number}</span>
      <Link
        to="/textbook/$chapterSlug"
        params={{ chapterSlug: chapter.slug }}
        className="text-color-4 text-[15px] no-underline hover:text-accent"
      >
        {chapter.title}
      </Link>
      <span className="font-3 text-[11px] text-teal tracking-[.06em] max-[540px]:justify-self-start">{intervalLabel(review.intervalIdx)}</span>
      <span className="font-3 text-[11px] text-text-muted tracking-[.04em] max-[540px]:justify-self-end">{relativeDue(review.nextDueAt, now)}</span>
    </li>
  );
}
