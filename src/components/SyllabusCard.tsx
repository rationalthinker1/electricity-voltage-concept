import { Link } from '@tanstack/react-router';

import { Pill, type PillVariant } from '@/components/ui/Pill';
import { Stat } from '@/components/ui/Stat';
import {
  type ChapterEntry,
  type TrackId,
  TRACKS,
  getChapter,
} from '@/textbook/data/chapters';

interface SyllabusCardProps {
  chapter: ChapterEntry;
}

const TRACK_TONE: Record<TrackId, PillVariant> = {
  practical: 'teal',
  bench: 'accent',
  rigor: 'pink',
};

/**
 * Compact at-a-glance "course shell" block rendered at the top of every
 * chapter — punchline, learning objectives, prereqs, time-to-read, tracks.
 *
 * Gracefully omits any row whose underlying field is missing.
 */
export function SyllabusCard({ chapter }: SyllabusCardProps) {
  const {
    punchline,
    objectives,
    prereqs,
    timeToRead,
    tracks,
  } = chapter;

  const hasAnything =
    !!punchline ||
    (objectives && objectives.length > 0) ||
    (prereqs && prereqs.length > 0) ||
    typeof timeToRead === 'number' ||
    (tracks && tracks.length > 0);

  if (!hasAnything) return null;

  const prereqChapters = (prereqs ?? [])
    .map(slug => getChapter(slug))
    .filter((c): c is ChapterEntry => !!c);

  return (
    <section
      className="my-[28px] mx-0 mb-[36px] py-[20px] px-[22px] border border-border-1 border-l-2 border-l-accent-soft rounded-4 bg-[linear-gradient(180deg,rgba(255,255,255,.015),rgba(255,255,255,.005))] max-[600px]:py-lg max-[600px]:px-lg max-[600px]:pb-[18px]"
      aria-label="Chapter syllabus"
    >
      <header className="flex items-baseline gap-md flex-wrap mb-[10px] pb-[10px] border-b border-border">
        <span className="kicker-1 accent-brand">Syllabus</span>
        <span className="meta-1">
          Chapter {chapter.number} · {chapter.title}
        </span>
      </header>

      {punchline && (
        <p className="summary-1">{punchline}</p>
      )}

      <div className="inline-cluster-1">
        {typeof timeToRead === 'number' && (
          <Stat label="Time to read" value={`~${timeToRead}`} unit="min" />
        )}
        {tracks && tracks.length > 0 && (
          <div className="stack-0">
            <div className="label-mono-1">Tracks</div>
            <div className="flex flex-wrap gap-y-[6px] gap-x-sm">
              {tracks.map(t => (
                <Pill key={t} variant={TRACK_TONE[t]}>{TRACKS[t].name}</Pill>
              ))}
            </div>
          </div>
        )}
      </div>

      {prereqChapters.length > 0 && (
        <div className="stack-1">
          <div className="label-mono-1">Prerequisites</div>
          <div className="flex flex-wrap gap-y-[6px] gap-x-sm">
            {prereqChapters.map(c => (
              <Link
                key={c.slug}
                to="/textbook/$chapterSlug"
                params={{ chapterSlug: c.slug }}
                style={{ textDecoration: 'none' }}
              >
                <Pill variant="subtle" interactive>
                  Ch.{c.number} · {c.title}
                </Pill>
              </Link>
            ))}
          </div>
        </div>
      )}

      {objectives && objectives.length > 0 && (
        <div className="list-copy-1">
          <div className="label-mono-1">
            After this chapter you will be able to:
          </div>
          <ul>
            {objectives.map((o, i) => (
              <li key={i}>{o}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
