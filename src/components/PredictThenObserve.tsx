import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import clsx from 'clsx';
import { Badge, Banner, Card } from './ui';

export type PredictKind = 'multiple-choice' | 'short-answer';

interface MultipleChoicePredict {
  kind: 'multiple-choice';
  options: { id: string; label: ReactNode }[];
  /** Which option(s) are considered correct (informational only — being wrong is fine). */
  correctIds?: string[];
}

interface ShortAnswerPredict {
  kind: 'short-answer';
  /** What unit (if any) to display next to the input. */
  unit?: string;
  /** What to compare the submitted string against (lowercase, trimmed) for the "you said X — were you right?" feedback. */
  acceptedAnswers?: string[];
  /** Placeholder text for the input. */
  placeholder?: string;
}

export type PredictSpec = MultipleChoicePredict | ShortAnswerPredict;

export interface PredictThenObserveProps {
  /** Unique key for this prediction (used in localStorage to remember the answer). */
  storageKey: string;
  /** The prediction question to ask. */
  question: ReactNode;
  /** Multiple-choice options OR short-answer config. */
  spec: PredictSpec;
  /** Optional reveal copy shown after submission, before the demo unlocks. */
  reveal?: (userAnswer: string) => ReactNode;
  /** The demo to reveal once the reader has committed. */
  children: ReactNode;
}

interface StoredPrediction {
  answer: string;
  predictedAt: number;
}

type PredictionStore = Record<string, StoredPrediction>;

const STORAGE_ROOT = 'fieldTheoryPredictions';

function readStore(): PredictionStore {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_ROOT);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === 'object') return parsed as PredictionStore;
    return {};
  } catch {
    return {};
  }
}

function writeStore(next: PredictionStore): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_ROOT, JSON.stringify(next));
  } catch {
    /* ignore quota / private-mode errors */
  }
}

function savePrediction(key: string, answer: string): void {
  const store = readStore();
  store[key] = { answer, predictedAt: Date.now() };
  writeStore(store);
}

function loadPrediction(key: string): StoredPrediction | null {
  const store = readStore();
  return store[key] ?? null;
}

type Phase = 'awaiting' | 'just-predicted' | 'revealed';

export function PredictThenObserve({
  storageKey,
  question,
  spec,
  reveal,
  children,
}: PredictThenObserveProps): JSX.Element {
  const [phase, setPhase] = useState<Phase>('awaiting');
  const [answer, setAnswer] = useState<string>('');
  const [mcSelected, setMcSelected] = useState<string>('');
  const [shortInput, setShortInput] = useState<string>('');

  // On mount, hydrate from localStorage so returning visitors don't see the prompt.
  useEffect(() => {
    const prior = loadPrediction(storageKey);
    if (prior && prior.answer) {
      setAnswer(prior.answer);
      setPhase('revealed');
    }
  }, [storageKey]);

  const labelForId = useCallback(
    (id: string): string => {
      if (spec.kind !== 'multiple-choice') return id;
      const found = spec.options.find(o => o.id === id);
      if (!found) return id;
      if (typeof found.label === 'string') return found.label;
      // Non-string ReactNode — fall back to id as a stable display key.
      return id;
    },
    [spec]
  );

  const correctness = useMemo<'correct' | 'incorrect' | 'unknown'>(() => {
    if (!answer) return 'unknown';
    if (spec.kind === 'multiple-choice') {
      if (!spec.correctIds || spec.correctIds.length === 0) return 'unknown';
      return spec.correctIds.includes(answer) ? 'correct' : 'incorrect';
    }
    if (!spec.acceptedAnswers || spec.acceptedAnswers.length === 0) return 'unknown';
    const norm = answer.trim().toLowerCase();
    return spec.acceptedAnswers.map(a => a.trim().toLowerCase()).includes(norm)
      ? 'correct'
      : 'incorrect';
  }, [answer, spec]);

  const displayedAnswer = useMemo<ReactNode>(() => {
    if (!answer) return null;
    if (spec.kind === 'multiple-choice') {
      const opt = spec.options.find(o => o.id === answer);
      return opt ? opt.label : labelForId(answer);
    }
    return spec.unit ? `${answer} ${spec.unit}` : answer;
  }, [answer, spec, labelForId]);

  function handleSubmit(): void {
    let chosen = '';
    if (spec.kind === 'multiple-choice') {
      chosen = mcSelected;
    } else {
      chosen = shortInput.trim();
    }
    if (!chosen) return;
    setAnswer(chosen);
    savePrediction(storageKey, chosen);
    setPhase('just-predicted');
  }

  function handleReveal(): void {
    setPhase('revealed');
  }

  if (phase === 'awaiting') {
    return (
      <Card
        variant="outlined"
        accent="accent"
        className="my-[28px] mx-0 mb-[18px]"
        header={
          <div className="flex flex-wrap items-center gap-md">
            <Badge variant="accent" size="sm">Predict first</Badge>
            <span className="text-meta">Commit to a guess — being wrong is fine.</span>
          </div>
        }
      >
        <div className="text-prompt">{question}</div>
        {spec.kind === 'multiple-choice' ? (
          <fieldset className="choice-list mb-lg border-0 p-0 m-0">
            <legend className="visually-hidden">Choose one</legend>
            {spec.options.map(opt => {
              const checked = mcSelected === opt.id;
              return (
                <label
                  key={opt.id}
                  className={clsx('choice-card', checked && 'is-selected')}
                >
                  <input
                    type="radio"
                    name={`pto-${storageKey}`}
                    value={opt.id}
                    checked={checked}
                    onChange={() => setMcSelected(opt.id)}
                  />
                  <span className="flex-1 min-w-0">{opt.label}</span>
                </label>
              );
            })}
          </fieldset>
        ) : (
          <div className="inline-flex items-center gap-[10px] mb-lg">
            <input
              type="text"
              className="input-base"
              value={shortInput}
              onChange={e => setShortInput(e.target.value)}
              placeholder={spec.placeholder ?? 'Your prediction'}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            {spec.unit && <span className="text-meta">{spec.unit}</span>}
          </div>
        )}
        <div className="flex justify-end gap-md">
          <button
            type="button"
            className="button-primary"
            onClick={handleSubmit}
            disabled={
              spec.kind === 'multiple-choice' ? !mcSelected : shortInput.trim().length === 0
            }
          >
            Make prediction
          </button>
        </div>
      </Card>
    );
  }

  if (phase === 'just-predicted') {
    return (
      <Card
        variant="outlined"
        accent="teal"
        className="my-[28px] mx-0 mb-[18px]"
        header={
          <div className="flex flex-wrap items-center gap-md">
            <Badge variant="teal" size="sm">Prediction locked in</Badge>
          </div>
        }
      >
        <p className="font-body text-[15.5px] text-color-text-dim leading-[1.55] m-0 mb-[14px]">
          You guessed: <strong>{displayedAnswer}</strong>
        </p>
        {reveal ? <div className="text-[14.5px] text-color-text-dim leading-[1.55] mb-lg py-md px-[14px] bg-color-bg-elevated border-l-2 border-l-color-teal rounded-r-xs">{reveal(answer)}</div> : null}
        <div className="flex justify-end gap-md">
          <button type="button" className="button-primary" onClick={handleReveal}>
            Reveal demo
          </button>
        </div>
      </Card>
    );
  }

  // phase === 'revealed'
  const annotationVariant =
    correctness === 'correct' ? 'success' : correctness === 'incorrect' ? 'warn' : 'info';

  return (
    <div className="my-[18px] mx-0">
      <Banner variant={annotationVariant} className="mb-md text-[13.5px]">
        <span className="font-mono text-[10.5px] tracking-[.12em] uppercase text-color-text-muted mb-[6px]">Your prediction:</span>{' '}
        <strong>{displayedAnswer}</strong>{' '}
        <span className="text-[13px] text-color-text-dim mt-[2px]">
          Try the demo to see if you were right.
        </span>
      </Banner>
      {children}
    </div>
  );
}

