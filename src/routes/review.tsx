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
import '@/styles/review.css';

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
    <section className="review-page">
      <header className="review-header">
        <div className="review-eyebrow">Field · Theory · Spaced repetition</div>
        <h1>Reviews <em>due</em>.</h1>
        <p className="review-lede">
          The system surfaces quizzes you previously passed on a 1-day, 3-day,
          1-week, 1-month, and 3-month schedule. Pass a review to advance to
          the next interval; miss one and you reset to day 1.
        </p>

        <div className="review-summary">
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
        <div className="review-empty">
          <p>
            No reviews yet. Pass a chapter quiz to start building your review
            queue. {' '}
            <Link to="/" className="review-empty-link">Browse the contents</Link>
            {' '} or {' '}
            <Link to="/me" className="review-empty-link">view your transcript</Link>.
          </p>
        </div>
      ) : null}

      {due.length > 0 ? (
        <section className="review-section">
          <h2 className="review-section-title">Due now</h2>
          <ul className="review-list">
            {due.map((r) => (
              <ReviewCard key={r.slug} review={r} now={now} />
            ))}
          </ul>
        </section>
      ) : null}

      {upcoming.length > 0 ? (
        <section className="review-section">
          <h2 className="review-section-title">Upcoming reviews</h2>
          <ul className="review-list review-list-upcoming">
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
    <div className="review-stat">
      <div className="review-stat-value">{value}</div>
      <div className="review-stat-label">{label}</div>
    </div>
  );
}

function ReviewCard({ review, now }: { review: ReviewSchedule; now: number }) {
  const chapter = getChapter(review.slug as ChapterSlug);
  if (!chapter) return null;
  return (
    <li className="review-card">
      <div className="review-card-meta">
        <span className="review-card-tag">Ch.{chapter.number}</span>
        <span className="review-card-interval">{intervalLabel(review.intervalIdx)}</span>
        <span className="review-card-due">{relativeDue(review.nextDueAt, now)}</span>
      </div>
      <div className="review-card-title">{chapter.title}</div>
      {chapter.subtitle ? (
        <div className="review-card-subtitle">{chapter.subtitle}</div>
      ) : null}
      <div className="review-card-actions">
        <a
          href={`/textbook/${chapter.slug}?mode=review`}
          className="review-card-cta"
        >
          Start review
        </a>
        <Link
          to="/textbook/$chapterSlug"
          params={{ chapterSlug: chapter.slug }}
          className="review-card-secondary"
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
    <li className="review-upcoming-row">
      <span className="review-upcoming-tag">Ch.{chapter.number}</span>
      <Link
        to="/textbook/$chapterSlug"
        params={{ chapterSlug: chapter.slug }}
        className="review-upcoming-title"
      >
        {chapter.title}
      </Link>
      <span className="review-upcoming-interval">{intervalLabel(review.intervalIdx)}</span>
      <span className="review-upcoming-due">{relativeDue(review.nextDueAt, now)}</span>
    </li>
  );
}
