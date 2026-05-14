import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import clsx from 'clsx';

import { SourcesList } from './SourcesList';
import { SyllabusCard } from './SyllabusCard';
import { Quiz } from './Quiz';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent, Card, Banner } from './ui';
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
    <article className="article-page-1">
      <div className="eyebrow-rule-1 accent-brand">Chapter {chapter.number}</div>
      <h1 dangerouslySetInnerHTML={{ __html: chapter.title }} />
      <p className="deck-1 accent-brand" dangerouslySetInnerHTML={{ __html: chapter.subtitle }} />

      <SyllabusCard chapter={chapter} />

      <div className="narrative-1">{children}</div>

      {labs.length > 0 && (
        <aside className="section-narrow-2">
          <div className="eyebrow-2 accent-brand">Go deeper · Related equation labs</div>
          {labs.map(l => (
            <Link
              key={l.slug}
              to="/labs/$slug"
              params={{ slug: l.slug }}
              className="link-row-1"
            >
              <span className="link-row-title-1">{l.title}</span>
              <span className="equation-inline-1 text-accent-current" dangerouslySetInnerHTML={{ __html: l.formula }} />
              <div className="caption-2">{l.blurb}</div>
            </Link>
          ))}
        </aside>
      )}

      <div className="section-narrow-2">
        <SourcesList ids={chapter.sources} />
      </div>

      <Card variant="default" className="flex flex-wrap items-center justify-between gap-lg my-10 px-[22px] py-[18px] rounded-lg">
        <button
          type="button"
          className={clsx('button-solid-1 accent-brand', isComplete && 'is-complete accent-teal')}
          onClick={handleMarkComplete}
          disabled={isComplete}
          aria-pressed={isComplete}
        >
          {isComplete ? 'Marked complete ✓' : 'Mark this chapter complete'}
        </button>
        <Link to="/me" className="link-accent text-sm font-mono uppercase tracking-wider">View your progress →</Link>
      </Card>

      {toast && (
        <div className="toast-1 accent-teal" role="status" aria-live="polite">{toast}</div>
      )}

      {quiz && (
        <div className="section-narrow-2">
          {quizStatus.passed ? (
            <Banner variant="success" className="my-8">
              <div className="flex items-center justify-between w-full">
                <div>
                  Quiz passed (<strong>{Math.round(quizStatus.bestScore * 100)}%</strong>).
                  You&rsquo;ve already met the mastery threshold for this chapter.
                </div>
                <Link
                  to="/quiz/$chapterSlug"
                  params={{ chapterSlug: chapter.slug }}
                  className="link-accent ml-4 whitespace-nowrap"
                >
                  Retake quiz →
                </Link>
              </div>
            </Banner>
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

      <nav className="pager-1 pager-narrow-1">
        {prev ? (
          <Link to="/textbook/$chapterSlug" params={{ chapterSlug: prev.slug }} className="pager-link-1">
            <div className="pager-dir-1">← Chapter {prev.number}</div>
            <div className="pager-title-2">{prev.title}</div>
          </Link>
        ) : (
          <Link to="/" className="pager-link-1">
            <div className="pager-dir-1">← Back</div>
            <div className="pager-title-2">Contents</div>
          </Link>
        )}
        {next ? (
          <Link to="/textbook/$chapterSlug" params={{ chapterSlug: next.slug }} className="pager-link-1 align-end-1">
            <div className="pager-dir-1">Chapter {next.number} →</div>
            <div className="pager-title-2">{next.title}</div>
          </Link>
        ) : (
          <Link to="/reference" className="pager-link-1 align-end-1">
            <div className="pager-dir-1">Appendix →</div>
            <div className="pager-title-2">Equation labs</div>
          </Link>
        )}
      </nav>
    </article>
  );
}
