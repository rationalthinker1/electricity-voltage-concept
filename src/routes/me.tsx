import { Link, createFileRoute } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';

import {
  CHAPTERS,
  TRACKS,
  type ChapterEntry,
  type ChapterSlug,
  type TrackId,
} from '@/textbook/data/chapters';
import {
  getProgress,
  getDueReviews,
  getUpcomingReviews,
  REVIEW_INTERVALS_DAYS,
  onProgressChange,
  resetProgress,
  type ProgressState,
  type ReviewSchedule,
} from '@/lib/progress';
import { BadgeShelf } from '@/components/BadgeShelf';
import { BADGES } from '@/textbook/data/badges';

export const Route = createFileRoute('/me')({
  component: MePage,
});

type SortKey = 'number' | 'title' | 'status' | 'lastOpened' | 'time';
type FilterStatus = 'all' | 'none' | 'opened' | 'completed';

function formatDuration(ms: number): string {
  if (ms <= 0) return '—';
  const min = Math.round(ms / 60_000);
  if (min < 1) return '< 1 min';
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function formatDate(ms: number | undefined): string {
  if (!ms) return '—';
  const d = new Date(ms);
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  if (sameDay) {
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: d.getFullYear() === today.getFullYear() ? undefined : 'numeric' });
}

function chapterStatus(slug: ChapterSlug, progress: ProgressState): 'none' | 'opened' | 'completed' {
  const p = progress.chapters[slug];
  if (!p) return 'none';
  return p.status === 'completed' ? 'completed' : 'opened';
}

// Reusable inline class fragments
const META = 'eyebrow-muted';
const META_SM = 'eyebrow-muted text-1';
const SECTION_TITLE = 'title-display font-light text-8 mb-md';
const CARD = 'card-surface';
const STATUS_PILL = 'font-3 text-1 tracking-3 uppercase py-xxs px-sm rounded-pill border border-border-2 text-text-muted whitespace-nowrap';

function MePage() {
  const [progress, setProgress] = useState<ProgressState>(() => getProgress());
  const [sortKey, setSortKey] = useState<SortKey>('number');
  const [sortDesc, setSortDesc] = useState(false);
  const [filter, setFilter] = useState<FilterStatus>('all');

  useEffect(() => {
    return onProgressChange(() => setProgress(getProgress()));
  }, []);

  const stats = useMemo(() => {
    const opened = Object.entries(progress.chapters).filter(([, v]) => v).length;
    const completed = Object.values(progress.chapters).filter(p => p?.status === 'completed').length;
    const totalTimeMs = Object.values(progress.chapters).reduce(
      (acc, p) => acc + (p?.totalTimeMs ?? 0), 0,
    );
    return {
      opened,
      completed,
      totalTimeMs,
      streak: progress.streak.days,
    };
  }, [progress]);

  const trackStats = useMemo(() => {
    const out: { id: TrackId; name: string; accent: string; total: number; completed: number; touched: boolean }[] = [];
    (['practical', 'bench', 'rigor'] as TrackId[]).forEach(t => {
      const chapters = CHAPTERS.filter(c => (c.tracks ?? []).includes(t));
      const completed = chapters.filter(c => chapterStatus(c.slug, progress) === 'completed').length;
      const touched = chapters.some(c => chapterStatus(c.slug, progress) !== 'none');
      out.push({
        id: t,
        name: TRACKS[t].name,
        accent: TRACKS[t].accent,
        total: chapters.length,
        completed,
        touched,
      });
    });
    return out;
  }, [progress]);

  const recent = useMemo(() => {
    return CHAPTERS
      .map(c => ({ c, p: progress.chapters[c.slug] }))
      .filter(x => !!x.p)
      .sort((a, b) => (b.p!.lastOpenedAt ?? 0) - (a.p!.lastOpenedAt ?? 0))
      .slice(0, 5);
  }, [progress]);

  const reviewPreview = useMemo(() => {
    void progress;
    const due = getDueReviews();
    const upcoming = getUpcomingReviews();
    const totalScheduled = due.length + upcoming.length;
    return {
      list: due.slice(0, 5) as ReviewSchedule[],
      dueCount: due.length,
      totalScheduled,
    };
  }, [progress]);

  const badgeEarned = useMemo(() => {
    return BADGES.filter(b => b.earned(progress)).length;
  }, [progress]);

  const tableRows = useMemo(() => {
    let rows = CHAPTERS.map(c => {
      const p = progress.chapters[c.slug];
      const status = chapterStatus(c.slug, progress);
      return {
        chapter: c,
        status,
        lastOpenedAt: p?.lastOpenedAt ?? 0,
        totalTimeMs: p?.totalTimeMs ?? 0,
      };
    });

    if (filter !== 'all') {
      rows = rows.filter(r => r.status === filter);
    }

    rows.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'number':     cmp = a.chapter.number - b.chapter.number; break;
        case 'title':      cmp = a.chapter.title.localeCompare(b.chapter.title); break;
        case 'status':     cmp = a.status.localeCompare(b.status); break;
        case 'lastOpened': cmp = a.lastOpenedAt - b.lastOpenedAt; break;
        case 'time':       cmp = a.totalTimeMs - b.totalTimeMs; break;
      }
      return sortDesc ? -cmp : cmp;
    });

    return rows;
  }, [progress, filter, sortKey, sortDesc]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDesc(s => !s);
    else { setSortKey(key); setSortDesc(false); }
  }

  function handleReset() {
    if (typeof window === 'undefined') return;
    const ok = window.confirm(
      'Reset all reading progress? This clears completion status, time spent, and your streak. This cannot be undone.',
    );
    if (ok) resetProgress();
  }

  const isEmpty = stats.opened === 0;

  return (
    <section className="page-shell pt-5xl max-w-page">
      <header className="mb-2xl">
        <div className="eyebrow-muted tracking-4 mb-md">Field · Theory · Your transcript</div>
        <h1 className="hero-display max-md:text-9">Where you are in the <em>book</em>.</h1>
        <p className="body-copy text-6 max-w-page-sm">
          All progress data lives only in this browser. Open another browser or
          clear site data and you start fresh.
        </p>
      </header>

      {isEmpty ? (
        <div className={`${CARD} rounded-5 p-lg my-xl font-1 text-text-dim`}>
          <p>You haven't opened any chapters yet. {' '}
            <Link to="/" className="text-accent no-underline border-b border-dotted border-accent">Pick one from the contents</Link>{' '}
            or {' '}
            <Link to="/tracks" className="text-accent no-underline border-b border-dotted border-accent">choose a track</Link>{' '}
            to start.
          </p>
        </div>
      ) : null}

      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-lg my-2xl">
        <Stat label="Opened" value={`${stats.opened}`} sub={`of ${CHAPTERS.length}`} />
        <Stat label="Completed" value={`${stats.completed}`} sub={`of ${CHAPTERS.length}`} />
        <Stat label="Time on book" value={formatDuration(stats.totalTimeMs)} />
        <Stat label="Day streak" value={`${stats.streak}`} sub={stats.streak === 1 ? 'day' : 'days'} />
      </div>

      <section className="my-3xl">
        <h2 className={SECTION_TITLE}>Active tracks</h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-lg">
          {trackStats.map(t => {
            const pct = t.total ? Math.round((t.completed / t.total) * 100) : 0;
            return (
              <Link
                key={t.id}
                to="/tracks"
                className={`block no-underline ${CARD} rounded-6 p-lg transition-colors hover:bg-bg-card-hover ${t.touched ? '' : 'opacity-65'}`}
                style={{
                  ['--me-accent' as string]: `var(--${t.accent})`,
                  borderTop: '3px solid var(--me-accent)',
                } as React.CSSProperties}
              >
                <div className="font-1 text-5 text-text mb-md">{t.name}</div>
                <div className="w-full h-sm bg-color-2 rounded-pill overflow-hidden border border-border-1">
                  <div
                    className="h-full transition-[width] duration-300"
                    style={{ width: `${pct}%`, background: 'var(--me-accent)' }}
                  />
                </div>
                <div className={`${META_SM} mt-sm`}>
                  {t.completed}/{t.total} · {pct}%
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="my-3xl">
        <div className="flex items-baseline justify-between gap-md mb-lg">
          <h2 className={`${SECTION_TITLE} mb-0`}>Reviews due</h2>
          <Link
            to="/review"
            className="eyebrow-accent text-2 tracking-3 no-underline border-b border-solid border-transparent hover:border-accent"
          >
            See all reviews
          </Link>
        </div>
        {reviewPreview.totalScheduled === 0 ? (
          <p className="font-1 text-text-muted italic">
            No reviews scheduled yet. Pass a chapter quiz to start your queue.
          </p>
        ) : reviewPreview.list.length === 0 ? (
          <p className="font-1 text-text-muted italic">
            Nothing due right now — {reviewPreview.totalScheduled} review{reviewPreview.totalScheduled === 1 ? '' : 's'} scheduled later.
          </p>
        ) : (
          <ul className="grid-list gap-sm">
            {reviewPreview.list.map((r) => {
              const ch = CHAPTERS.find(c => c.slug === r.slug);
              if (!ch) return null;
              const days = REVIEW_INTERVALS_DAYS[r.intervalIdx] ?? 1;
              const label = days === 1 ? '1-day' : days === 7 ? '1-week' : days === 30 ? '1-month' : days === 90 ? '3-month' : `${days}-day`;
              return (
                <li key={r.slug}>
                  <Link
                    to="/review"
                    className={`grid grid-cols-[60px_1fr_auto] gap-md items-center py-md px-md ${CARD} rounded-5 no-underline text-text hover:bg-bg-card-hover hover:border-border-2 max-md:grid-cols-[50px_1fr] max-md:gap-y-xs`}
                  >
                    <span className={META}>Ch.{ch.number}</span>
                    <span>{ch.title}</span>
                    <span className="font-3 text-2 text-teal tracking-2 uppercase max-md:col-start-2 max-md:justify-self-start">{label} review</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="my-3xl">
        <div className="flex items-baseline justify-between gap-md mb-lg">
          <h2 className={`${SECTION_TITLE} mb-0`}>Badges</h2>
          <span className="font-3 text-2 tracking-3 text-text-dim">{badgeEarned} of {BADGES.length} earned</span>
        </div>
        <BadgeShelf />
      </section>

      <section className="my-3xl">
        <h2 className={SECTION_TITLE}>Recent chapters</h2>
        {recent.length === 0 ? (
          <p className="font-1 text-text-muted italic">Nothing opened yet.</p>
        ) : (
          <ul className="list-none p-0 m-0 flex flex-col gap-xs">
            {recent.map(({ c, p }) => {
              const st = chapterStatus(c.slug, progress);
              const statusClass =
                st === 'completed' ? 'text-teal border-teal' :
                st === 'opened'    ? 'text-accent border-accent' : '';
              return (
                <li key={c.slug}>
                  <Link
                    to="/textbook/$chapterSlug"
                    params={{ chapterSlug: c.slug }}
                    className={`grid grid-cols-[60px_1fr_auto_auto] gap-lg items-center py-md px-lg border border-border-1 bg-color-3 rounded-5 no-underline text-text font-1 text-5 transition-colors hover:bg-bg-card-hover max-md:grid-cols-[50px_1fr] max-md:gap-y-sm`}
                  >
                    <span className={META}>Ch.{c.number}</span>
                    <span>{c.title}</span>
                    <span className={`${STATUS_PILL} ${statusClass} max-md:col-start-2 max-md:justify-self-start`}>
                      {st === 'completed' ? '✓ complete' :
                       st === 'opened'    ? '◐ opened'  : '○ none'}
                    </span>
                    <span className={`font-3 text-2 text-text-muted max-md:col-start-2 max-md:justify-self-start`}>{formatDate(p?.lastOpenedAt)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="my-3xl">
        <div className="flex justify-between items-center mb-sm flex-wrap gap-md">
          <h2 className={SECTION_TITLE}>All chapters</h2>
          <div className={META}>
            <label>Filter:&nbsp;</label>
            <select
              value={filter}
              onChange={e => setFilter(e.target.value as FilterStatus)}
              className="bg-color-3 border border-border-2 text-text py-sm px-md font-3 text-2 rounded-3"
            >
              <option value="all">all</option>
              <option value="none">not started</option>
              <option value="opened">opened</option>
              <option value="completed">completed</option>
            </select>
          </div>
        </div>
        <div className={`${CARD} rounded-6 overflow-hidden`}>
          <table className="w-full border-collapse [&_tr:last-child_td]:border-b-0">
            <thead>
              <tr>
                {([
                  ['number', '#'],
                  ['title', 'Chapter'],
                  ['status', 'Status'],
                  ['lastOpened', 'Last opened'],
                  ['time', 'Time'],
                ] as [SortKey, string][]).map(([key, label]) => (
                  <th
                    key={key}
                    onClick={() => toggleSort(key)}
                    className="text-left eyebrow-muted text-1 py-md px-lg border-b border-border bg-color-2 cursor-pointer select-none hover:text-accent"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map(r => (
                <ChapterRow key={r.chapter.slug} chapter={r.chapter} status={r.status} lastOpened={r.lastOpenedAt} timeMs={r.totalTimeMs} />
              ))}
            </tbody>
          </table>
          {tableRows.length === 0 && (
            <p className="font-1 text-text-muted italic" style={{ padding: 18 }}>No chapters match this filter.</p>
          )}
        </div>
      </section>

      <section className={`mt-4xl p-xl border border-border-1 rounded-6 bg-color-3 text-center`}>
        <button
          type="button"
          onClick={handleReset}
          className="bg-transparent border border-pink text-pink py-md px-xl rounded-5 font-3 text-3 uppercase tracking-3 cursor-pointer transition-colors hover:bg-pink hover:text-bg"
        >
          Reset all progress
        </button>
        <p className={`${META_SM} mt-md mb-0`}>
          Clears localStorage. There is no server copy.
        </p>
      </section>
    </section>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="card-surface rounded-6 p-lg">
      <div className="eyebrow-muted mb-sm">{label}</div>
      <div className="font-2 text-9 font-light text-text leading-none">{value}</div>
      {sub && <div className="eyebrow-muted mt-sm">{sub}</div>}
    </div>
  );
}

function ChapterRow({
  chapter, status, lastOpened, timeMs,
}: {
  chapter: ChapterEntry;
  status: 'none' | 'opened' | 'completed';
  lastOpened: number;
  timeMs: number;
}) {
  const statusClass =
    status === 'completed' ? 'text-teal border-teal' :
    status === 'opened'    ? 'text-accent border-accent' : '';
  return (
    <tr>
      <td className="py-md px-lg border-b border-border font-3 text-2 text-text-muted">{chapter.number}</td>
      <td className="py-md px-lg border-b border-border font-1 text-4 [&_a]:text-text [&_a]:no-underline [&_a]:border-b [&_a]:border-dotted [&_a]:border-transparent [&_a:hover]:border-accent [&_a:hover]:text-accent">
        <Link to="/textbook/$chapterSlug" params={{ chapterSlug: chapter.slug }}>
          {chapter.title}
        </Link>
      </td>
      <td className="py-md px-lg border-b border-border">
        <span className={`${STATUS_PILL} ${statusClass}`}>
          {status === 'completed' ? '✓ complete' :
           status === 'opened'    ? '◐ opened'  : '○ none'}
        </span>
      </td>
      <td className="py-md px-lg border-b border-border font-3 text-2 text-text-muted">{formatDate(lastOpened || undefined)}</td>
      <td className="py-md px-lg border-b border-border font-3 text-2 text-text-muted">{formatDuration(timeMs)}</td>
    </tr>
  );
}
