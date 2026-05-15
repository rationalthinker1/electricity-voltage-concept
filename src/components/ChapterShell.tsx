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
    <article className="page-shell max-w-page">
      <div className="eyebrow-rule mb-xl">Chapter {chapter.number}</div>
      <h1 className="font-2 font-light leading-1 mb-xl max-w-[18ch] text-[clamp(48px,7vw,86px)] tracking-[-.03em]">
        {chapter.title}
      </h1>
      <p className="font-2 italic font-light leading-3 max-w-[50ch] pl-xl mb-3xl text-text-dim text-[clamp(22px,2.4vw,28px)] border-l-2 border-accent">
        {chapter.subtitle}
      </p>

      <SyllabusCard chapter={chapter} />

      <div className="mx-auto mt-xl text-7 leading-5 text-text-dim">{children}</div>

      {labs.length > 0 && (
        <aside className="mx-auto pt-2xl">
          <div className="eyebrow-rule mb-xl">Go deeper · Related equation labs</div>
          {labs.map(l => (
            <Link
              key={l.slug}
              to="/labs/$slug"
              params={{ slug: l.slug }}
              className="block no-underline text-inherit py-lg border-b border-dotted border-border last:border-b-0"
            >
              <span className="font-1 font-medium text-text">{l.title}</span>
              <span className="font-4 italic text-accent  ml-md">{l.formula}</span>
              <div className="text-text-muted mt-sm">{l.blurb}</div>
            </Link>
          ))}
        </aside>
      )}

      <div className="mx-auto mb-0 pt-2xl">
        <SourcesList ids={chapter.sources} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-lg my-2xl mb-xl py-lg px-xl bg-bg-card border border-border rounded-6">
        <button
          type="button"
          className={isComplete
            ? 'bg-transparent text-teal border border-teal py-md px-xl rounded-5 font-3 text-3 tracking-3 uppercase cursor-default transition-[background,opacity] hover:bg-transparent'
            : 'bg-accent text-bg border-0 py-md px-xl rounded-5 font-3 text-3 tracking-3 uppercase cursor-pointer transition-[background,opacity] hover:bg-accent-glow disabled:bg-transparent disabled:text-teal disabled:border disabled:border-teal disabled:cursor-default'}
          onClick={handleMarkComplete}
          disabled={isComplete}
          aria-pressed={isComplete}
        >
          {isComplete ? 'Marked complete ✓' : 'Mark this chapter complete'}
        </button>
        <Link to="/me" className="font-3 text-2 text-text-muted uppercase tracking-3 no-underline hover:text-accent">View your progress →</Link>
      </div>

      {toast && (
        <div className="fixed bottom-2xl left-1/2 -translate-x-1/2 bg-bg-elevated border border-teal text-teal py-md px-lg rounded-pill font-3 text-3 tracking-3 uppercase z-3 shadow-2 animate-[chap-toast-in_.25s_ease-out]" role="status" aria-live="polite">{toast}</div>
      )}

      {quiz && (
        <div className="mt-2xl">
          {quizStatus.passed ? (
            <div className="flex items-center justify-between gap-lg py-lg px-lg my-xl card-surface bg-bg-elevated border-l-3 border-l-teal font-1 text-5 text-text">
              <div className="flex-1">
                Quiz passed (<strong className="font-3 text-teal">{Math.round(quizStatus.bestScore * 100)}%</strong>).
                You&rsquo;ve already met the mastery threshold for this chapter.
              </div>
              <Link
                to="/quiz/$chapterSlug"
                params={{ chapterSlug: chapter.slug }}
                className="font-1 text-4 text-accent no-underline whitespace-nowrap hover:underline"
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

      <nav className="card-grid mx-auto mt-5xl mb-0 px-2xl py-xl">
        {prev ? (
          <Link to="/textbook/$chapterSlug" params={{ chapterSlug: prev.slug }} className="nav-item">
            <div className="eyebrow-muted text-1 tracking-4 mb-md">← Chapter {prev.number}</div>
            <div className="title-display font-light text-8">{prev.title}</div>
          </Link>
        ) : (
          <Link to="/" className="nav-item">
            <div className="eyebrow-muted text-1 tracking-4 mb-md">← Back</div>
            <div className="title-display font-light text-8">Contents</div>
          </Link>
        )}
        {next ? (
          <Link to="/textbook/$chapterSlug" params={{ chapterSlug: next.slug }} className="nav-item text-right">
            <div className="eyebrow-muted text-1 tracking-4 mb-md">Chapter {next.number} →</div>
            <div className="title-display font-light text-8">{next.title}</div>
          </Link>
        ) : (
          <Link to="/reference" className="nav-item text-right">
            <div className="eyebrow-muted text-1 tracking-4 mb-md">Appendix →</div>
            <div className="title-display font-light text-8">Equation labs</div>
          </Link>
        )}
      </nav>
    </article>
  );
}
