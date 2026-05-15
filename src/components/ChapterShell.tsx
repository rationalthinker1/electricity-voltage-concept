import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from '@tanstack/react-router';

import { SourcesList } from './SourcesList';
import { SyllabusCard } from './SyllabusCard';
import { Quiz } from './Quiz';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './ui';
import { type ChapterEntry, getChapterNeighbors } from '@/textbook/data/chapters';
import { MANIFEST } from '@/labs/data/manifest';
import { getQuiz, getPassingScore } from '@/textbook/data/quizzes';
import {
  addTimeSpent,
  getProgress,
  getQuizStatus,
  markChapterCompleted,
  markChapterOpened,
  onProgressChange,
} from '@/lib/progress';

const NARRATIVE =
  'max-w-[70ch] mx-auto text-[17.5px] leading-[1.72] text-text-dim [&>p]:mb-[1.4em] [&>p:first-of-type]:first-letter:font-2 [&>p:first-of-type]:first-letter:font-light [&>p:first-of-type]:first-letter:text-[4em] [&>p:first-of-type]:first-letter:leading-none [&>p:first-of-type]:first-letter:float-left [&>p:first-of-type]:first-letter:mt-[4px] [&>p:first-of-type]:first-letter:mr-[12px] [&>p:first-of-type]:first-letter:mb-[-4px] [&>p:first-of-type]:first-letter:text-accent [&_h2]:font-2 [&_h2]:font-light [&_h2]:italic [&_h2]:text-[clamp(28px,3.5vw,42px)] [&_h2]:leading-[1.1] [&_h2]:tracking-[-.02em] [&_h2]:text-text [&_h2]:mt-[90px] [&_h2]:mb-[28px] [&_h2]:max-w-[28ch] [&_h2_em]:text-accent [&_h3]:font-1 [&_h3]:font-medium [&_h3]:text-[13px] [&_h3]:uppercase [&_h3]:tracking-[.2em] [&_h3]:text-accent [&_h3]:mt-[50px] [&_h3]:mb-[14px] [&_strong]:text-text [&_strong]:font-medium [&_em]:italic [&_em]:text-text [&_.pullout]:font-2 [&_.pullout]:italic [&_.pullout]:font-light [&_.pullout]:text-[26px] [&_.pullout]:leading-[1.35] [&_.pullout]:text-text [&_.pullout]:py-[24px] [&_.pullout]:pr-0 [&_.pullout]:pl-[28px] [&_.pullout]:my-[40px] [&_.pullout]:border-l-2 [&_.pullout]:border-accent [&_.math]:font-2 [&_.math]:italic [&_.math]:text-[26px] [&_.math]:text-center [&_.math]:text-text [&_.math]:my-[30px] [&_.math_sub]:text-[.55em] [&_.math_sup]:text-[.55em] [&_.kbd]:font-3 [&_.kbd]:text-[.85em] [&_.kbd]:text-accent [&_.kbd]:bg-accent-soft [&_.kbd]:py-[2px] [&_.kbd]:px-[8px] [&_.kbd]:rounded-1 [&_.cite]:inline-block [&_.cite]:font-3 [&_.cite]:text-[10px] [&_.cite]:align-super [&_.cite]:leading-none [&_.cite]:text-accent [&_.cite]:bg-accent-soft [&_.cite]:py-px [&_.cite]:px-[5px] [&_.cite]:mx-px [&_.cite]:rounded-1 [&_.cite]:no-underline [&_.cite]:tracking-normal [&_.cite:hover]:bg-accent [&_.cite:hover]:text-bg';
const RELATED_LABS =
  'max-w-[70ch] mx-auto mt-[80px] mb-0 pt-[36px] border-t border-border';
const RELATED_LABS_HEAD =
  'font-3 text-[11px] text-accent tracking-[.25em] uppercase mb-[22px]';
const RELATED_LAB_LINK =
  'block no-underline text-inherit py-[14px] border-b border-dotted border-border last:border-b-0';
const RELATED_LAB_NAME =
  'font-1 font-medium text-text text-[15px]';
const RELATED_LAB_EQ =
  'font-4 italic text-accent text-[18px] ml-[8px]';
const RELATED_LAB_BLURB =
  'text-text-muted text-[13px] mt-[4px]';
const CHAP_COMPLETE =
  'flex flex-wrap items-center justify-between gap-[16px] my-[32px] mb-[24px] py-[18px] px-[22px] bg-bg-card border border-border rounded-6';
const CHAP_COMPLETE_BTN =
  'bg-accent text-bg border-0 py-[10px] px-[22px] rounded-5 font-3 text-[12px] tracking-[.12em] uppercase cursor-pointer transition-[background,opacity] hover:bg-accent-glow disabled:bg-transparent disabled:text-teal disabled:border disabled:border-teal disabled:cursor-default';
const CHAP_COMPLETE_BTN_DONE =
  'bg-transparent text-teal border border-teal cursor-default hover:bg-transparent';
const CHAP_COMPLETE_LINK =
  'font-3 text-[11px] text-text-muted uppercase tracking-[.12em] no-underline hover:text-accent';
const CHAP_TOAST =
  'fixed bottom-[28px] left-1/2 -translate-x-1/2 bg-bg-elevated border border-teal text-teal py-[10px] px-[18px] rounded-pill font-3 text-[12px] tracking-[.12em] uppercase z-[1000] shadow-2 animate-[chap-toast-in_.25s_ease-out]';
const CHAP_PAGE_NAV =
  'grid grid-cols-2 max-[760px]:grid-cols-1 gap-px bg-border border border-border max-w-[70ch] mx-auto mt-[100px] mb-0';
const CHAP_PAGE_NAV_LINK =
  'bg-bg py-[36px] px-[28px] no-underline text-inherit transition-colors hover:bg-bg-card-hover';
const CHAP_PAGE_DIR =
  'font-3 text-[10px] text-text-muted uppercase tracking-[.22em] mb-[10px]';
const CHAP_PAGE_TITLE =
  'font-2 italic font-light text-[22px] text-text';

interface ChapterShellProps {
  chapter: ChapterEntry;
  /** Long narrative content with embedded <Demo> cards */
  children: ReactNode;
}

/**
 * Full-page narrative-chapter layout. Each chapter:
 *   eyebrow + title + deck → narrative prose (with embedded demos) →
 *   related-labs sidebar → sources → prev/next chapter nav.
 */
export function ChapterShell({ chapter, children }: ChapterShellProps) {
  const { prev, next } = getChapterNeighbors(chapter.slug);
  const labs = MANIFEST.filter(l => chapter.relatedLabs.includes(l.slug));
  const quiz = getQuiz(chapter.slug);
  const passingScore = getPassingScore(chapter.slug);

  // Track quiz status reactively so the inline banner refreshes after attempts.
  const [quizStatus, setQuizStatus] = useState(() => getQuizStatus(chapter.slug, passingScore));
  useEffect(() => {
    setQuizStatus(getQuizStatus(chapter.slug, passingScore));
    return onProgressChange(() => {
      setQuizStatus(getQuizStatus(chapter.slug, passingScore));
    });
  }, [chapter.slug, passingScore]);

  // Mark this chapter as "opened" on mount + on slug change. Accumulate
  // time-on-page into localStorage; bumps streak inside the helper.
  const arrivedAt = useRef<number>(Date.now());
  useEffect(() => {
    arrivedAt.current = Date.now();
    markChapterOpened(chapter.slug);
    return () => {
      const elapsed = Date.now() - arrivedAt.current;
      if (elapsed > 1000) addTimeSpent(chapter.slug, elapsed);
    };
  }, [chapter.slug]);

  // Track completion state reactively so the button reflects the latest store.
  const [isComplete, setIsComplete] = useState(
    () => getProgress().chapters[chapter.slug]?.status === 'completed',
  );
  useEffect(() => {
    setIsComplete(getProgress().chapters[chapter.slug]?.status === 'completed');
    return onProgressChange(() => {
      setIsComplete(getProgress().chapters[chapter.slug]?.status === 'completed');
    });
  }, [chapter.slug]);

  const [toast, setToast] = useState<string | null>(null);
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(t);
  }, [toast]);

  function handleMarkComplete() {
    if (isComplete) return;
    markChapterCompleted(chapter.slug);
    setToast('Marked complete');
  }

  return (
    <article className="chapter-page">
      <div className="chapter-eyebrow">Chapter {chapter.number}</div>
      <h1 dangerouslySetInnerHTML={{ __html: chapter.title }} />
      <p className="chap-deck" dangerouslySetInnerHTML={{ __html: chapter.subtitle }} />

      <SyllabusCard chapter={chapter} />

      <div className={NARRATIVE}>{children}</div>

      {labs.length > 0 && (
        <aside className={RELATED_LABS}>
          <div className={RELATED_LABS_HEAD}>Go deeper · Related equation labs</div>
          {labs.map(l => (
            <Link
              key={l.slug}
              to="/labs/$slug"
              params={{ slug: l.slug }}
              className={RELATED_LAB_LINK}
            >
              <span className={RELATED_LAB_NAME}>{l.title}</span>
              <span className={RELATED_LAB_EQ} dangerouslySetInnerHTML={{ __html: l.formula }} />
              <div className={RELATED_LAB_BLURB}>{l.blurb}</div>
            </Link>
          ))}
        </aside>
      )}

      <div className={RELATED_LABS}>
        <SourcesList ids={chapter.sources} />
      </div>

      <div className={CHAP_COMPLETE}>
        <button
          type="button"
          className={`${CHAP_COMPLETE_BTN} ${isComplete ? CHAP_COMPLETE_BTN_DONE : ''}`}
          onClick={handleMarkComplete}
          disabled={isComplete}
          aria-pressed={isComplete}
        >
          {isComplete ? 'Marked complete ✓' : 'Mark this chapter complete'}
        </button>
        <Link to="/me" className={CHAP_COMPLETE_LINK}>View your progress →</Link>
      </div>

      {toast && (
        <div className={CHAP_TOAST} role="status" aria-live="polite">{toast}</div>
      )}

      {quiz && (
        <div className="mt-[32px]">
          {quizStatus.passed ? (
            <div className="flex items-center justify-between gap-lg py-[14px] px-[18px] my-[24px] card-surface bg-color-2 border-l-[3px] border-l-teal font-1 text-[14px] text-color-4">
              <div className="flex-1 [&_strong]:font-3 [&_strong]:text-teal">
                Quiz passed (<strong>{Math.round(quizStatus.bestScore * 100)}%</strong>).
                You&rsquo;ve already met the mastery threshold for this chapter.
              </div>
              <Link
                to="/quiz/$chapterSlug"
                params={{ chapterSlug: chapter.slug }}
                className="font-1 text-[13px] text-accent no-underline whitespace-nowrap hover:underline"
              >
                Retake quiz →
              </Link>
            </div>
          ) : (
            <Accordion>
              <AccordionItem id="mastery-quiz">
                <AccordionTrigger>
                  Mastery check &middot; {quiz.questions.length} questions
                </AccordionTrigger>
                <AccordionContent>
                  <Quiz chapterSlug={chapter.slug} />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </div>
      )}

      <nav className={CHAP_PAGE_NAV}>
        {prev ? (
          <Link to="/textbook/$chapterSlug" params={{ chapterSlug: prev.slug }} className={CHAP_PAGE_NAV_LINK}>
            <div className={CHAP_PAGE_DIR}>← Chapter {prev.number}</div>
            <div className={CHAP_PAGE_TITLE}>{prev.title}</div>
          </Link>
        ) : (
          <Link to="/" className={CHAP_PAGE_NAV_LINK}>
            <div className={CHAP_PAGE_DIR}>← Back</div>
            <div className={CHAP_PAGE_TITLE}>Contents</div>
          </Link>
        )}
        {next ? (
          <Link to="/textbook/$chapterSlug" params={{ chapterSlug: next.slug }} className={`${CHAP_PAGE_NAV_LINK} text-right`}>
            <div className={CHAP_PAGE_DIR}>Chapter {next.number} →</div>
            <div className={CHAP_PAGE_TITLE}>{next.title}</div>
          </Link>
        ) : (
          <Link to="/reference" className={`${CHAP_PAGE_NAV_LINK} text-right`}>
            <div className={CHAP_PAGE_DIR}>Appendix →</div>
            <div className={CHAP_PAGE_TITLE}>Equation labs</div>
          </Link>
        )}
      </nav>
    </article>
  );
}
