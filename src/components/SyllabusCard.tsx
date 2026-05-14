import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';

import {
  type ChapterEntry,
  type TrackId,
  TRACKS,
  getChapter,
} from '@/textbook/data/chapters';

interface SyllabusCardProps {
  chapter: ChapterEntry;
}

/**
 * Minimal local Badge primitive. A future pass can swap for a shared
 * UI primitive once the shared component lands.
 */
function Badge({
  children,
  tone = 'default',
}: {
  children: ReactNode;
  tone?: 'default' | 'teal' | 'accent' | 'pink';
}) {
  return <span className={`syllabus-badge syllabus-badge-${tone}`}>{children}</span>;
}

function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="syllabus-stat">
      <div className="syllabus-stat-label">{label}</div>
      <div className="syllabus-stat-value">{value}</div>
    </div>
  );
}

const TRACK_TONE: Record<TrackId, 'teal' | 'accent' | 'pink'> = {
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
    <section className="chapter-syllabus-card" aria-label="Chapter syllabus">
      <header className="chapter-syllabus-card-head">
        <span className="chapter-syllabus-card-eyebrow">Syllabus</span>
        <span className="chapter-syllabus-card-chapter">
          Chapter {chapter.number} · {chapter.title}
        </span>
      </header>

      {punchline && (
        <p className="chapter-syllabus-card-punchline">{punchline}</p>
      )}

      <div className="chapter-syllabus-card-stats">
        {typeof timeToRead === 'number' && (
          <Stat label="Time to read" value={<>~{timeToRead} min</>} />
        )}
        {tracks && tracks.length > 0 && (
          <div className="chapter-syllabus-card-tracks">
            <div className="syllabus-stat-label">Tracks</div>
            <div className="chapter-syllabus-card-badge-row">
              {tracks.map(t => (
                <Badge key={t} tone={TRACK_TONE[t]}>
                  {TRACKS[t].name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {prereqChapters.length > 0 && (
        <div className="chapter-syllabus-card-prereqs">
          <div className="syllabus-stat-label">Prerequisites</div>
          <div className="chapter-syllabus-card-badge-row">
            {prereqChapters.map(c => (
              <Link
                key={c.slug}
                to="/textbook/$chapterSlug"
                params={{ chapterSlug: c.slug }}
                className="syllabus-badge syllabus-badge-link"
              >
                Ch.{c.number} · {c.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      {objectives && objectives.length > 0 && (
        <div className="chapter-syllabus-card-objectives">
          <div className="syllabus-stat-label">
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
