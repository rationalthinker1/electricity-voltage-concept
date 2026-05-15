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

const SYLLABUS_CARD =
  'my-[28px] mb-[36px] py-[20px] px-[22px] pb-[22px] max-[600px]:py-[16px] max-[600px]:px-[16px] max-[600px]:pb-[18px] bg-[linear-gradient(180deg,rgba(255,255,255,.015),rgba(255,255,255,.005))] border border-border border-l-2 border-l-accent-soft rounded-4';
const SYLLABUS_HEAD =
  'flex items-baseline gap-[12px] flex-wrap mb-[10px] pb-[10px] border-b border-border';
const SYLLABUS_EYEBROW =
  'font-3 text-[10.5px] tracking-[.14em] uppercase text-accent';
const SYLLABUS_CHAPTER =
  'font-3 text-[11.5px] tracking-[.06em] text-text-muted';
const SYLLABUS_PUNCHLINE =
  'mt-[4px] mb-[16px] font-2 italic text-[17px] max-[600px]:text-[15.5px] leading-[1.5] text-text';
const SYLLABUS_STATS =
  'flex flex-wrap gap-y-[24px] gap-x-[32px] max-[600px]:gap-y-[18px] max-[600px]:gap-x-[22px] items-start mb-[14px]';
const SYLLABUS_STAT_LABEL =
  'font-3 text-[10.5px] tracking-[.12em] uppercase text-text-muted mb-[6px]';
const SYLLABUS_TRACKS = 'flex flex-col';
const SYLLABUS_PREREQS = 'mb-[14px]';
const SYLLABUS_OBJECTIVES =
  'mt-[4px] [&_ul]:mt-[6px] [&_ul]:mb-0 [&_ul]:pl-[20px] [&_ul]:list-disc [&_ul]:text-text-dim [&_li]:text-[14.5px] max-[600px]:[&_li]:text-[13.5px] [&_li]:leading-[1.55] [&_li]:mb-[4px]';

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
    <section className={SYLLABUS_CARD} aria-label="Chapter syllabus">
      <header className={SYLLABUS_HEAD}>
        <span className={SYLLABUS_EYEBROW}>Syllabus</span>
        <span className={SYLLABUS_CHAPTER}>
          Chapter {chapter.number} · {chapter.title}
        </span>
      </header>

      {punchline && (
        <p className={SYLLABUS_PUNCHLINE}>{punchline}</p>
      )}

      <div className={SYLLABUS_STATS}>
        {typeof timeToRead === 'number' && (
          <Stat label="Time to read" value={`~${timeToRead}`} unit="min" />
        )}
        {tracks && tracks.length > 0 && (
          <div className={SYLLABUS_TRACKS}>
            <div className={SYLLABUS_STAT_LABEL}>Tracks</div>
            <div className="flex flex-wrap gap-[6px]">
              {tracks.map(t => (
                <Pill key={t} variant={TRACK_TONE[t]}>{TRACKS[t].name}</Pill>
              ))}
            </div>
          </div>
        )}
      </div>

      {prereqChapters.length > 0 && (
        <div className={SYLLABUS_PREREQS}>
          <div className={SYLLABUS_STAT_LABEL}>Prerequisites</div>
          <div className="flex flex-wrap gap-[6px]">
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
        <div className={SYLLABUS_OBJECTIVES}>
          <div className={SYLLABUS_STAT_LABEL}>
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
