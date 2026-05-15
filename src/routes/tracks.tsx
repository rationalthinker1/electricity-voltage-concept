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
  type ProgressState,
} from '@/lib/progress';

export const Route = createFileRoute('/tracks')({
  component: TracksPage,
});

/** Order chapters of a track so prereqs always come before dependents. */
function topoOrder(chapters: ChapterEntry[]): ChapterEntry[] {
  const inSet = new Set(chapters.map(c => c.slug));
  const out: ChapterEntry[] = [];
  const placed = new Set<ChapterSlug>();
  const queue = [...chapters].sort((a, b) => a.number - b.number);
  // Iterate up to N² guard to avoid infinite loops on weird input.
  let guard = chapters.length * chapters.length + 10;
  while (queue.length && guard-- > 0) {
    const next = queue.shift()!;
    const unmetPrereqs = (next.prereqs ?? []).filter(p => inSet.has(p) && !placed.has(p));
    if (unmetPrereqs.length === 0) {
      out.push(next);
      placed.add(next.slug);
    } else {
      queue.push(next);
    }
  }
  // Anything still unplaced (cycles, broken data) just append.
  if (out.length < chapters.length) {
    for (const c of chapters) if (!placed.has(c.slug)) out.push(c);
  }
  return out;
}

function trackAccentVar(accent: string): string {
  // TRACKS.accent is the name of a CSS variable token: 'teal' | 'accent' | 'pink'
  return `var(--${accent})`;
}

interface TrackCardProps {
  track: TrackId;
  chapters: ChapterEntry[];
  progress: ProgressState;
}

function statusOf(slug: ChapterSlug, progress: ProgressState):
  'not-started' | 'in-progress' | 'complete' {
  const p = progress.chapters[slug];
  if (!p) return 'not-started';
  if (p.status === 'completed') return 'complete';
  return 'in-progress';
}

function TrackCard({ track, chapters, progress }: TrackCardProps) {
  const meta = TRACKS[track];
  const accent = trackAccentVar(meta.accent);

  const ordered = useMemo(() => topoOrder(chapters), [chapters]);
  const total = ordered.length;
  const completed = ordered.filter(c => statusOf(c.slug, progress) === 'complete').length;
  const pct = total ? Math.round((completed / total) * 100) : 0;

  // Resume target = first not-yet-completed chapter; otherwise first chapter.
  const resumeChapter = ordered.find(c => statusOf(c.slug, progress) !== 'complete') ?? ordered[0];
  const anyStarted = ordered.some(c => statusOf(c.slug, progress) !== 'not-started');

  return (
    <section
      className="card-surface border-t-3 rounded-3 p-xl flex flex-col"
      style={{
        ['--path-accent' as string]: accent,
        borderTopColor: 'var(--path-accent)',
      } as React.CSSProperties}
    >
      <header className="mb-md">
        <div className="title-display text-8 mb-sm">{meta.name}</div>
        <p className="body-copy text-5 leading-4 m-0">{meta.description}</p>
      </header>

      <div className="mb-lg">
        <div className="w-full h-sm bg-bg-elevated rounded-pill overflow-hidden border border-border-1">
          <div
            className="h-full transition-[width] duration-300 ease-in-out bg-[var(--path-accent)]"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="eyebrow-muted mt-sm">
          {completed} of {total} chapters complete · {pct}%
        </div>
      </div>

      {resumeChapter && total > 0 && (
        <Link
          to="/textbook/$chapterSlug"
          params={{ chapterSlug: resumeChapter.slug }}
          className="flex flex-col gap-xs py-md px-md mb-lg bg-bg-elevated border border-border-2 border-l-3 border-l-[var(--path-accent)] rounded-5 no-underline font-3 text-3 text-text tracking-3 uppercase transition-[background-color,border-color] duration-150 ease-in-out hover:bg-bg-card-hover hover:border-[var(--path-accent)]"
        >
          {anyStarted ? 'Resume track →' : 'Start track →'}
          <span className="font-1 text-4 text-text-dim normal-case tracking-normal">
            Ch.{resumeChapter.number} · {resumeChapter.title}
          </span>
        </Link>
      )}

      {total === 0 ? (
        <p className="font-1 text-5 text-text-muted italic">No chapters are assigned to this track yet.</p>
      ) : (
        <ol className="list-none p-0 m-0 flex flex-col gap-xs">
          {ordered.map(c => {
            const status = statusOf(c.slug, progress);
            const icon =
              status === 'complete' ? '✓' :
              status === 'in-progress' ? '◐' :
              '○';
            const statusColor =
              status === 'complete' ? 'var(--path-accent)' :
              status === 'in-progress' ? 'var(--accent)' :
              'var(--text-muted)';
            const titleColor = status === 'complete' ? 'var(--color-4)' : 'inherit';
            return (
              <li key={c.slug}>
                <Link
                  to="/textbook/$chapterSlug"
                  params={{ chapterSlug: c.slug }}
                  className="grid grid-cols-[24px_60px_1fr_auto] gap-md items-center py-sm px-md rounded-4 no-underline text-text-dim font-1 text-5 transition-[background-color,color] duration-fast ease-in-out hover:bg-bg-elevated hover:text-text max-md:grid-cols-[24px_50px_1fr_auto] max-md:gap-sm"
                >
                  <span className="font-3 text-5 text-center" style={{ color: statusColor }} aria-hidden="true">{icon}</span>
                  <span className="eyebrow-muted">Ch.{c.number}</span>
                  <span style={{ color: titleColor }}>{c.title}</span>
                  <span className="font-3 text-1 text-text-muted tracking-3">
                    {c.timeToRead ? `${c.timeToRead} min` : '—'}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

function TracksPage() {
  const [progress, setProgress] = useState<ProgressState>(() => getProgress());

  useEffect(() => {
    return onProgressChange(() => setProgress(getProgress()));
  }, []);

  const chaptersByTrack = useMemo(() => {
    const map: Record<TrackId, ChapterEntry[]> = { practical: [], bench: [], rigor: [] };
    for (const c of CHAPTERS) {
      const tracks = c.tracks ?? [];
      for (const t of tracks) {
        if (map[t]) map[t].push(c);
      }
    }
    return map;
  }, []);

  const trackOrder: TrackId[] = ['practical', 'bench', 'rigor'];
  const anyTracksPopulated = trackOrder.some(t => chaptersByTrack[t].length > 0);

  return (
    <section className="page-shell max-w-page">
      <header className="mb-2xl">
        <div className="eyebrow-muted tracking-4 mb-sm">Field · Theory · Tracks</div>
        <h1 className="title-display font-light text-10 leading-1 tracking-1 mb-lg max-md:text-9">
          Three <em className="italic text-accent font-normal">paths</em> through the book.
        </h1>
        <p className="body-copy max-w-page-sm">
          Each track is a curated subset of the textbook, ordered so prerequisites
          come first. Pick the one that matches what you want to be able to do.
          Your progress is saved locally in this browser.
        </p>
      </header>

      {!anyTracksPopulated && (
        <p className="font-1 text-accent italic my-lg">
          Track assignments are still being populated. The cards below will fill
          in once the chapter manifest is complete.
        </p>
      )}

      <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-lg mt-lg">
        {trackOrder.map(t => (
          <TrackCard key={t} track={t} chapters={chaptersByTrack[t]} progress={progress} />
        ))}
      </div>

      <div className="flex justify-between mt-2xl pt-lg border-t border-border">
        <Link to="/map" className="eyebrow-muted-link">← Course map</Link>
        <Link to="/me" className="eyebrow-muted-link">Your progress →</Link>
      </div>
    </section>
  );
}
