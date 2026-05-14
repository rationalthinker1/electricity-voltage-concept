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
  onProgressChange,
  resetProgress,
  type ProgressState,
} from '@/lib/progress';
import '@/styles/me.css';

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
    <section className="me-page">
      <header className="me-header">
        <div className="me-eyebrow">Field · Theory · Your transcript</div>
        <h1>Where you are in the <em>book</em>.</h1>
        <p className="me-lede">
          All progress data lives only in this browser. Open another browser or
          clear site data and you start fresh.
        </p>
      </header>

      {isEmpty ? (
        <div className="me-empty">
          <p>You haven't opened any chapters yet. {' '}
            <Link to="/" className="me-empty-link">Pick one from the contents</Link>{' '}
            or {' '}
            <Link to="/tracks" className="me-empty-link">choose a track</Link>{' '}
            to start.
          </p>
        </div>
      ) : null}

      <div className="me-stats">
        <Stat label="Opened" value={`${stats.opened}`} sub={`of ${CHAPTERS.length}`} />
        <Stat label="Completed" value={`${stats.completed}`} sub={`of ${CHAPTERS.length}`} />
        <Stat label="Time on book" value={formatDuration(stats.totalTimeMs)} />
        <Stat label="Day streak" value={`${stats.streak}`} sub={stats.streak === 1 ? 'day' : 'days'} />
      </div>

      <section className="me-section">
        <h2 className="me-section-title">Active tracks</h2>
        <div className="me-tracks">
          {trackStats.map(t => {
            const pct = t.total ? Math.round((t.completed / t.total) * 100) : 0;
            return (
              <Link
                key={t.id}
                to="/tracks"
                className={`me-track ${t.touched ? 'me-track-touched' : 'me-track-untouched'}`}
                style={{ ['--me-accent' as string]: `var(--${t.accent})` } as React.CSSProperties}
              >
                <div className="me-track-name">{t.name}</div>
                <div className="me-track-bar">
                  <div className="me-track-bar-fill" style={{ width: `${pct}%` }} />
                </div>
                <div className="me-track-meta">
                  {t.completed}/{t.total} · {pct}%
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="me-section">
        <h2 className="me-section-title">Recent chapters</h2>
        {recent.length === 0 ? (
          <p className="me-empty-inline">Nothing opened yet.</p>
        ) : (
          <ul className="me-recent">
            {recent.map(({ c, p }) => (
              <li key={c.slug}>
                <Link to="/textbook/$chapterSlug" params={{ chapterSlug: c.slug }} className="me-recent-row">
                  <span className="me-recent-num">Ch.{c.number}</span>
                  <span className="me-recent-title">{c.title}</span>
                  <span className={`me-status me-status-${chapterStatus(c.slug, progress)}`}>
                    {chapterStatus(c.slug, progress) === 'completed' ? '✓ complete' :
                     chapterStatus(c.slug, progress) === 'opened'    ? '◐ opened'  : '○ none'}
                  </span>
                  <span className="me-recent-when">{formatDate(p?.lastOpenedAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="me-section">
        <div className="me-table-head">
          <h2 className="me-section-title">All chapters</h2>
          <div className="me-filter">
            <label>Filter:&nbsp;</label>
            <select value={filter} onChange={e => setFilter(e.target.value as FilterStatus)}>
              <option value="all">all</option>
              <option value="none">not started</option>
              <option value="opened">opened</option>
              <option value="completed">completed</option>
            </select>
          </div>
        </div>
        <div className="me-table-wrap">
          <table className="me-table">
            <thead>
              <tr>
                <th onClick={() => toggleSort('number')} className="sortable">#</th>
                <th onClick={() => toggleSort('title')} className="sortable">Chapter</th>
                <th onClick={() => toggleSort('status')} className="sortable">Status</th>
                <th onClick={() => toggleSort('lastOpened')} className="sortable">Last opened</th>
                <th onClick={() => toggleSort('time')} className="sortable">Time</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map(r => (
                <ChapterRow key={r.chapter.slug} chapter={r.chapter} status={r.status} lastOpened={r.lastOpenedAt} timeMs={r.totalTimeMs} />
              ))}
            </tbody>
          </table>
          {tableRows.length === 0 && (
            <p className="me-empty-inline" style={{ padding: 18 }}>No chapters match this filter.</p>
          )}
        </div>
      </section>

      <section className="me-danger">
        <button type="button" className="me-reset" onClick={handleReset}>
          Reset all progress
        </button>
        <p className="me-reset-note">
          Clears localStorage. There is no server copy.
        </p>
      </section>
    </section>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="me-stat">
      <div className="me-stat-label">{label}</div>
      <div className="me-stat-value">{value}</div>
      {sub && <div className="me-stat-sub">{sub}</div>}
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
  return (
    <tr>
      <td className="me-cell-num">{chapter.number}</td>
      <td className="me-cell-title">
        <Link to="/textbook/$chapterSlug" params={{ chapterSlug: chapter.slug }}>
          {chapter.title}
        </Link>
      </td>
      <td>
        <span className={`me-status me-status-${status}`}>
          {status === 'completed' ? '✓ complete' :
           status === 'opened'    ? '◐ opened'  : '○ none'}
        </span>
      </td>
      <td className="me-cell-date">{formatDate(lastOpened || undefined)}</td>
      <td className="me-cell-time">{formatDuration(timeMs)}</td>
    </tr>
  );
}
