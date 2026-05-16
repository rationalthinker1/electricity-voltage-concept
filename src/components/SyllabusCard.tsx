import { Link } from '@tanstack/react-router';

import { Pill, type PillVariant } from '@/components/ui/Pill';
import { Stat } from '@/components/ui/Stat';
import { type ChapterEntry, type TrackId, TRACKS, getChapter } from '@/textbook/data/chapters';

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
  const { punchline, objectives, prereqs, timeToRead, tracks } = chapter;

  const hasAnything =
    !!punchline ||
    (objectives && objectives.length > 0) ||
    (prereqs && prereqs.length > 0) ||
    typeof timeToRead === 'number' ||
    (tracks && tracks.length > 0);

  if (!hasAnything) return null;

  const prereqChapters = (prereqs ?? [])
    .map((slug) => getChapter(slug))
    .filter((c): c is ChapterEntry => !!c);

  return (
    <section
      className="my-2xl mb-2xl py-lg px-xl pb-xl max-sm:py-lg max-sm:px-lg max-sm:pb-lg border-border border-l-accent-soft rounded-4 border border-l-2 bg-[linear-gradient(180deg,rgba(255,255,255,.015),rgba(255,255,255,.005))]"
      aria-label="Chapter syllabus"
    >
      <header className="gap-md mb-md pb-md border-border flex flex-wrap items-baseline border-b">
        <span className="font-3 text-1 tracking-3 text-accent uppercase">Syllabus</span>
        <span className="font-3 text-2 tracking-2 text-text-muted">
          Chapter {chapter.number} · {chapter.title}
        </span>
      </header>

      {punchline && (
        <p className="title-display mt-sm mb-lg text-6 max-sm:text-6 leading-4">{punchline}</p>
      )}

      <div className="gap-y-xl gap-x-xl max-sm:gap-y-lg max-sm:gap-x-xl mb-lg flex flex-wrap items-start">
        {typeof timeToRead === 'number' && (
          <Stat label="Time to read" value={`~${timeToRead}`} unit="min" />
        )}
        {tracks && tracks.length > 0 && (
          <div className="flex flex-col">
            <div className="eyebrow-muted text-1 mb-sm">Tracks</div>
            <div className="gap-sm flex flex-wrap">
              {tracks.map((t) => (
                <Pill key={t} variant={TRACK_TONE[t]}>
                  {TRACKS[t].name}
                </Pill>
              ))}
            </div>
          </div>
        )}
      </div>

      {prereqChapters.length > 0 && (
        <div className="mb-lg">
          <div className="eyebrow-muted text-1 mb-sm">Prerequisites</div>
          <div className="gap-sm flex flex-wrap">
            {prereqChapters.map((c) => (
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
        <div className="mt-sm">
          <div className="eyebrow-muted text-3 mb-sm">After this chapter you will be able to:</div>
          <ul className="mt-sm pl-lg text-text-dim mb-0 list-disc">
            {objectives.map((o, i) => (
              <li key={i} className="text-5 max-sm:text-4 mb-sm leading-4">
                {o}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
