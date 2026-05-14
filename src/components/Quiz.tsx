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
    if (given !== '') givenDisplay = <span className="text-mono-num">{given}</span>;
    const accepted = (q.acceptedAnswers ?? []).map(normalizeText);
    isCorrect = accepted.includes(normalizeText(given));
    correctDisplay = q.acceptedAnswers && q.acceptedAnswers[0]
      ? <span className="text-mono-num text-accent-current accent-teal">{q.acceptedAnswers[0]}</span>
      : null;
  } else if (q.type === 'numeric') {
    const parsed = parseNumeric(given);
    if (parsed !== null) {
      givenDisplay = (
        <span className="text-mono-num">
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
      <span className="text-mono-num text-accent-current accent-teal">
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
      <div className="choice-list-1" role="radiogroup">
        {choices.map((c, idx) => {
          const id = `${question.id}-opt-${idx}`;
          const checked = value === String(idx);
          return (
            <label key={idx} htmlFor={id} className={clsx('choice-card-1', checked && 'is-selected accent-brand')}>
              <input
                id={id}
                type="radio"
                name={question.id}
                value={String(idx)}
                checked={checked}
                disabled={disabled}
                onChange={() => onChange(String(idx))}
              />
              <span className="grow-1">{c}</span>
            </label>
          );
        })}
      </div>
    );
  }
  if (question.type === 'numeric') {
    return (
      <div className="inline-baseline-2">
        <input
          type="text"
          inputMode="decimal"
          className="field-input-1"
          value={value}
          disabled={disabled}
          placeholder="Enter a number"
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        />
        {question.unit && <span className="field-unit-1">{question.unit}</span>}
      </div>
    );
  }
  // short-answer
  return (
    <input
      type="text"
      className="field-input-1 field-input-text-1"
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
        'question-card-1',
        status === 'correct' && 'question-correct-1',
        status === 'wrong' && 'question-wrong-1',
      )}
      header={
        <div className="split-header-2">
          <span className="meta-1">Question {index + 1}</span>
          {graded && (
            <span
              className={clsx('status-pill-1', status === 'correct' ? 'accent-teal' : 'accent-pink')}
              aria-label={graded.isCorrect ? 'Correct' : 'Incorrect'}
            >
              {graded.isCorrect ? ICON_CORRECT : ICON_WRONG}
              <span className="status-label-1">
                {graded.isCorrect ? 'Correct' : 'Incorrect'}
              </span>
            </span>
          )}
        </div>
      }
    >
      <div className="prompt-1">{question.prompt}</div>
      <QuestionInput
        question={question}
        value={value}
        disabled={disabled}
        onChange={onChange}
      />
      {graded && (
        <div className="feedback-1">
          {!graded.isCorrect && graded.correctDisplay && (
            <div className="copy-1">
              <span className="label-mono-1">Correct answer:</span>{' '}
              <span className="text-accent-current accent-teal">{graded.correctDisplay}</span>
            </div>
          )}
          <div className="copy-muted-1">{question.explanation}</div>
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
    <section className="quiz-stack-1" id={`quiz-${chapterSlug}`}>
      {heading && <div className="title-4">{heading}</div>}

      {submitted ? (
        <Banner variant={passed ? 'success' : 'warn'}>
          <div className="copy-1">
            You scored <strong>{submitted.numCorrect}/{submitted.numTotal}</strong>{' '}
            <span className="meta-1">({scorePct}%)</span>.
          </div>
          <div className="copy-muted-2">
            {passed
              ? <>You passed — this chapter is marked complete. You can retake the quiz any time.</>
              : <>Need {passingPct}% to mark this chapter complete.</>}
          </div>
        </Banner>
      ) : status.passed ? (
        <Banner variant="success">
          <div className="copy-1">
            Previously passed at <strong>{Math.round(status.bestScore * 100)}%</strong>.{' '}
            <span className="copy-muted-2">
              {status.attempts} attempt{status.attempts === 1 ? '' : 's'} so far.
            </span>
          </div>
        </Banner>
      ) : status.attempts > 0 ? (
        <Banner variant="info">
          <div className="copy-1">
            Best score so far: <strong>{Math.round(status.bestScore * 100)}%</strong>{' '}
            across {status.attempts} attempt{status.attempts === 1 ? '' : 's'}.
            You need {passingPct}% to mark this chapter complete.
          </div>
        </Banner>
      ) : (
        <Banner variant="info">
          <div className="copy-1">
            Mastery check &middot; {quiz.questions.length} questions.
            Need {passingPct}% to mark this chapter complete.
          </div>
        </Banner>
      )}

      <div className="stack-1">
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

      <div className="actions-end-1">
        {submitted ? (
          <button type="button" className="button-solid-1 accent-brand" onClick={handleRetry}>
            Retry quiz
          </button>
        ) : (
          <button
            type="button"
            className="button-solid-1 accent-brand"
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
