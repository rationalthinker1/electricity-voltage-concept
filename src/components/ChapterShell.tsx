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

      <div className="narrative">{children}</div>

      {labs.length > 0 && (
        <aside className="related-labs">
          <div className="related-labs-head">Go deeper · Related equation labs</div>
          {labs.map(l => (
            <Link
              key={l.slug}
              to="/labs/$slug"
              params={{ slug: l.slug }}
              className="related-lab-link"
            >
              <span className="rl-name">{l.title}</span>
              <span className="rl-eq" dangerouslySetInnerHTML={{ __html: l.formula }} />
              <div className="rl-blurb">{l.blurb}</div>
            </Link>
          ))}
        </aside>
      )}

      <div className="related-labs">
        <SourcesList ids={chapter.sources} />
      </div>

      <div className="chap-complete">
        <button
          type="button"
          className={`chap-complete-btn ${isComplete ? 'is-complete' : ''}`}
          onClick={handleMarkComplete}
          disabled={isComplete}
          aria-pressed={isComplete}
        >
          {isComplete ? 'Marked complete ✓' : 'Mark this chapter complete'}
        </button>
        <Link to="/me" className="chap-complete-link">View your progress →</Link>
      </div>

      {toast && (
        <div className="chap-toast" role="status" aria-live="polite">{toast}</div>
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

      <nav className="chap-page-nav">
        {prev ? (
          <Link to="/textbook/$chapterSlug" params={{ chapterSlug: prev.slug }}>
            <div className="dir">← Chapter {prev.number}</div>
            <div className="ch-title">{prev.title}</div>
          </Link>
        ) : (
          <Link to="/">
            <div className="dir">← Back</div>
            <div className="ch-title">Contents</div>
          </Link>
        )}
        {next ? (
          <Link to="/textbook/$chapterSlug" params={{ chapterSlug: next.slug }} className="next">
            <div className="dir next">Chapter {next.number} →</div>
            <div className="ch-title">{next.title}</div>
          </Link>
        ) : (
          <Link to="/reference" className="next">
            <div className="dir next">Appendix →</div>
            <div className="ch-title">Equation labs</div>
          </Link>
        )}
      </nav>
    </article>
  );
}
