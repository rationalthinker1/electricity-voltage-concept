import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type ReactNode,
} from 'react';
import clsx from 'clsx';

import { Card, Banner } from '@/components/ui';
import {
  getPassingScore,
  getQuiz,
  type ChapterQuiz,
  type QuizQuestion,
} from '@/textbook/data/quizzes';
import {
  getQuizStatus,
  onProgressChange,
  recordQuizAttempt,
} from '@/lib/progress';
import type { ChapterSlug } from '@/textbook/data/chapters';

interface QuizProps {
  chapterSlug: ChapterSlug;
  /** Optional heading shown above the quiz card. */
  heading?: ReactNode;
}

type AnswerMap = Record<string, string>;

interface GradedQuestion {
  question: QuizQuestion;
  /** The raw user answer (a stringified index for MC/TF, a string for short/numeric). */
  given: string;
  /** Pretty version of the user's answer for display. */
  givenDisplay: ReactNode;
  /** Pretty version of the correct answer for display. */
  correctDisplay: ReactNode;
  isCorrect: boolean;
}

interface GradeResult {
  graded: GradedQuestion[];
  score: number;      // 0..1
  numCorrect: number;
  numTotal: number;
}

const ICON_CORRECT = '✓'; // ✓
const ICON_WRONG = '✗';   // ✗
const INPUT_CLASS = 'w-full max-w-panel py-md px-lg card-surface bg-bg-elevated font-3 text-6 text-text transition-[border-color,background] duration-fast ease-in-out focus:outline-none focus:border-accent focus:bg-bg-card disabled:opacity-70 disabled:cursor-not-allowed';

/* ---------- Grading helpers ---------- */

function normalizeText(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

function parseNumeric(raw: string): number | null {
  if (!raw) return null;
  // Allow scientific notation, commas, etc.
  const cleaned = raw.replace(/,/g, '').trim();
  if (cleaned === '') return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function describeChoice(q: QuizQuestion, idx: number): ReactNode {
  if (!q.choices || idx < 0 || idx >= q.choices.length) return <em>(no answer)</em>;
  return q.choices[idx];
}

function gradeOne(q: QuizQuestion, given: string): GradedQuestion {
  let isCorrect = false;
  let givenDisplay: ReactNode = <em>(no answer)</em>;
  let correctDisplay: ReactNode = null;

  if (q.type === 'multiple-choice' || q.type === 'true-false') {
    const givenIdx = given === '' ? -1 : Number(given);
    if (Number.isFinite(givenIdx) && givenIdx >= 0) {
      givenDisplay = describeChoice(q, givenIdx);
    }
    isCorrect = givenIdx === q.correctIndex;
    correctDisplay = q.correctIndex !== undefined
      ? describeChoice(q, q.correctIndex)
      : null;
  } else if (q.type === 'short-answer') {
    if (given !== '') givenDisplay = <span className="font-3">{given}</span>;
    const accepted = (q.acceptedAnswers ?? []).map(normalizeText);
    isCorrect = accepted.includes(normalizeText(given));
    correctDisplay = q.acceptedAnswers && q.acceptedAnswers[0]
      ? <span className="font-3 text-teal">{q.acceptedAnswers[0]}</span>
      : null;
  } else if (q.type === 'numeric') {
    const parsed = parseNumeric(given);
    if (parsed !== null) {
      givenDisplay = (
        <span className="font-3">
          {parsed}{q.unit ? ` ${q.unit}` : ''}
        </span>
      );
    }
    if (parsed !== null && q.targetValue !== undefined) {
      const tol = q.tolerance ?? 0.05;
      const base = Math.abs(q.targetValue);
      const allowed = base === 0 ? tol : base * tol;
      isCorrect = Math.abs(parsed - q.targetValue) <= allowed;
    }
    correctDisplay = q.targetValue !== undefined ? (
      <span className="font-3 text-teal">
        {q.targetValue}{q.unit ? ` ${q.unit}` : ''}
      </span>
    ) : null;
  }

  return { question: q, given, givenDisplay, correctDisplay, isCorrect };
}

function gradeAll(quiz: ChapterQuiz, answers: AnswerMap): GradeResult {
  const graded = quiz.questions.map(q => gradeOne(q, answers[q.id] ?? ''));
  const numCorrect = graded.filter(g => g.isCorrect).length;
  return {
    graded,
    numCorrect,
    numTotal: quiz.questions.length,
    score: numCorrect / Math.max(1, quiz.questions.length),
  };
}

/* ---------- Sub-components ---------- */

function QuestionInput({
  question,
  value,
  disabled,
  onChange,
}: {
  question: QuizQuestion;
  value: string;
  disabled: boolean;
  onChange: (v: string) => void;
}) {
  if (question.type === 'multiple-choice' || question.type === 'true-false') {
    const choices = question.choices ?? [];
    return (
      <div className="flex flex-col gap-sm" role="radiogroup">
        {choices.map((c, idx) => {
          const id = `${question.id}-opt-${idx}`;
          const checked = value === String(idx);
          return (
            <label
              key={idx}
              htmlFor={id}
              className={clsx(
                'flex items-start gap-md py-md px-lg card-surface bg-bg-elevated cursor-pointer transition-[background,border-color] duration-fast ease-in-out font-1 text-6 text-text leading-4 hover:bg-bg-card-hover hover:border-border-2',
                checked && 'border-accent bg-accent-soft',
              )}
            >
              <input
                className="mt-sm accent-accent shrink-0 disabled:cursor-not-allowed"
                id={id}
                type="radio"
                name={question.id}
                value={String(idx)}
                checked={checked}
                disabled={disabled}
                onChange={() => onChange(String(idx))}
              />
              <span className="flex-1 min-w-0">{c}</span>
            </label>
          );
        })}
      </div>
    );
  }
  if (question.type === 'numeric') {
    return (
      <div className="inline-flex items-center gap-md">
        <input
          type="text"
          inputMode="decimal"
          className={clsx(INPUT_CLASS, 'w-panel-sm')}
          value={value}
          disabled={disabled}
          placeholder="Enter a number"
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        />
        {question.unit && <span className="font-3 text-5 text-text-dim">{question.unit}</span>}
      </div>
    );
  }
  // short-answer
  return (
    <input
      type="text"
      className={clsx(INPUT_CLASS, 'font-1')}
      value={value}
      disabled={disabled}
      placeholder="Type your answer"
      onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
    />
  );
}

function QuestionCard({
  index,
  question,
  value,
  disabled,
  graded,
  onChange,
}: {
  index: number;
  question: QuizQuestion;
  value: string;
  disabled: boolean;
  graded?: GradedQuestion;
  onChange: (v: string) => void;
}) {
  const status = graded ? (graded.isCorrect ? 'correct' : 'wrong') : 'pending';
  return (
    <Card
      className={clsx(
        'relative',
        status === 'correct' && '!border-teal/45',
        status === 'wrong' && '!border-pink/45',
      )}
      header={
        <div className="flex items-center justify-between gap-md eyebrow-dim text-3 tracking-2">
          <span className="text-text-dim">Question {index + 1}</span>
          {graded && (
            <span
              className={clsx(
                'inline-flex items-center gap-sm font-3 text-3 tracking-2',
                status === 'correct' && 'text-teal',
                status === 'wrong' && 'text-pink',
              )}
              aria-label={graded.isCorrect ? 'Correct' : 'Incorrect'}
            >
              {graded.isCorrect ? ICON_CORRECT : ICON_WRONG}
              <span className="normal-case tracking-normal text-3">
                {graded.isCorrect ? 'Correct' : 'Incorrect'}
              </span>
            </span>
          )}
        </div>
      }
    >
      <div className="body-copy leading-4 text-text my-md mb-lg">{question.prompt}</div>
      <QuestionInput
        question={question}
        value={value}
        disabled={disabled}
        onChange={onChange}
      />
      {graded && (
        <div className="mt-lg pt-lg border-t border-dashed border-border flex flex-col gap-sm">
          {!graded.isCorrect && graded.correctDisplay && (
            <div className="font-1 text-5 text-text">
              <span className="eyebrow-dim text-2 tracking-2 mr-xs">Correct answer:</span>{' '}
              <span className="text-teal">{graded.correctDisplay}</span>
            </div>
          )}
          <div className="body-copy text-5 leading-4">{question.explanation}</div>
        </div>
      )}
    </Card>
  );
}

/* ---------- The Quiz component ---------- */

export function Quiz({ chapterSlug, heading }: QuizProps) {
  const quiz = getQuiz(chapterSlug);
  const passingScore = getPassingScore(chapterSlug);

  const [answers, setAnswers] = useState<AnswerMap>({});
  const [submitted, setSubmitted] = useState<GradeResult | null>(null);
  const [status, setStatus] = useState(() => getQuizStatus(chapterSlug, passingScore));

  useEffect(() => {
    return onProgressChange(() => {
      setStatus(getQuizStatus(chapterSlug, passingScore));
    });
  }, [chapterSlug, passingScore]);

  // Reset transient state if the slug changes.
  useEffect(() => {
    setAnswers({});
    setSubmitted(null);
    setStatus(getQuizStatus(chapterSlug, passingScore));
  }, [chapterSlug, passingScore]);

  const allAnswered = useMemo(() => {
    if (!quiz) return false;
    return quiz.questions.every(q => (answers[q.id] ?? '').trim() !== '');
  }, [quiz, answers]);

  const handleChange = useCallback((id: string, value: string) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  }, []);

  const handleSubmit = useCallback(() => {
    if (!quiz) return;
    const result = gradeAll(quiz, answers);
    setSubmitted(result);
    recordQuizAttempt(chapterSlug, {
      score: result.score,
      passThreshold: passingScore,
    });
    // Scroll to top of quiz so the score banner is visible.
    if (typeof window !== 'undefined') {
      window.requestAnimationFrame(() => {
        const el = document.getElementById(`quiz-${chapterSlug}`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, [quiz, answers, chapterSlug, passingScore]);

  const handleRetry = useCallback(() => {
    setAnswers({});
    setSubmitted(null);
  }, []);

  if (!quiz) {
    return null;
  }

  const passingPct = Math.round(passingScore * 100);
  const scorePct = submitted ? Math.round(submitted.score * 100) : 0;
  const passed = submitted ? submitted.score >= passingScore : false;

  return (
    <section id={`quiz-${chapterSlug}`} className="flex flex-col gap-lg my-2xl">
      {heading && <div className="title-display text-8 mb-sm">{heading}</div>}

      {submitted ? (
        <Banner variant={passed ? 'success' : 'warn'}>
          <div className="font-1 text-6 text-text">
            You scored <strong className="font-3 font-semibold">{submitted.numCorrect}/{submitted.numTotal}</strong>{' '}
            <span className="font-3 text-text-dim text-4">({scorePct}%)</span>.
          </div>
          <div className="font-1 text-4 text-text-dim mt-xxs">
            {passed
              ? <>You passed — this chapter is marked complete. You can retake the quiz any time.</>
              : <>Need {passingPct}% to mark this chapter complete.</>}
          </div>
        </Banner>
      ) : status.passed ? (
        <Banner variant="success">
          <div className="font-1 text-6 text-text">
            Previously passed at <strong className="font-3 font-semibold">{Math.round(status.bestScore * 100)}%</strong>.{' '}
            <span className="font-1 text-4 text-text-dim mt-xxs">
              {status.attempts} attempt{status.attempts === 1 ? '' : 's'} so far.
            </span>
          </div>
        </Banner>
      ) : status.attempts > 0 ? (
        <Banner variant="info">
          <div className="font-1 text-6 text-text">
            Best score so far: <strong className="font-3 font-semibold">{Math.round(status.bestScore * 100)}%</strong>{' '}
            across {status.attempts} attempt{status.attempts === 1 ? '' : 's'}.
            You need {passingPct}% to mark this chapter complete.
          </div>
        </Banner>
      ) : (
        <Banner variant="info">
          <div className="font-1 text-6 text-text">
            Mastery check &middot; {quiz.questions.length} questions.
            Need {passingPct}% to mark this chapter complete.
          </div>
        </Banner>
      )}

      <div className="flex flex-col gap-lg">
        {quiz.questions.map((q, i) => (
          <QuestionCard
            key={q.id}
            index={i}
            question={q}
            value={answers[q.id] ?? ''}
            disabled={submitted !== null}
            graded={submitted?.graded[i]}
            onChange={(v) => handleChange(q.id, v)}
          />
        ))}
      </div>

      <div className="flex justify-end gap-md">
        {submitted ? (
          <button type="button" className="inline-flex items-center gap-sm py-md px-lg rounded-5 font-1 text-5 font-medium border border-accent bg-accent text-bg cursor-pointer transition-[background,border-color,color] duration-fast ease-in-out hover:brightness-110 disabled:opacity-55 disabled:cursor-not-allowed" onClick={handleRetry}>
            Retry quiz
          </button>
        ) : (
          <button
            type="button"
            className="inline-flex items-center gap-sm py-md px-lg rounded-5 font-1 text-5 font-medium border border-accent bg-accent text-bg cursor-pointer transition-[background,border-color,color] duration-fast ease-in-out hover:not-disabled:brightness-110 disabled:opacity-55 disabled:cursor-not-allowed"
            onClick={handleSubmit}
            disabled={!allAnswered}
          >
            {allAnswered ? 'Submit quiz' : `Answer all ${quiz.questions.length} questions to submit`}
          </button>
        )}
      </div>
    </section>
  );
}
