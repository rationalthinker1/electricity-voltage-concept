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
        className="my-2xl mb-lg"
        header={
          <div className="flex items-center gap-md flex-wrap">
            <Badge variant="accent" size="sm">Predict first</Badge>
            <span className="eyebrow-muted tracking-3">Commit to a guess — being wrong is fine.</span>
          </div>
        }
      >
        <div className="body-copy leading-4 text-text m-0 mb-lg">{question}</div>
        {spec.kind === 'multiple-choice' ? (
          <fieldset className="flex flex-col gap-sm border-0 p-0 m-0 mb-lg">
            <legend className="absolute w-px h-px overflow-hidden [clip:rect(0_0_0_0)]">Choose one</legend>
            {spec.options.map(opt => {
              const checked = mcSelected === opt.id;
              return (
                <label
                  key={opt.id}
                  className={clsx(
                    'flex items-center gap-md py-md px-md border border-border-1 rounded-2 bg-bg-elevated cursor-pointer transition-all duration-150 ease-in-out text-text-dim font-1 text-5 leading-3 hover:border-border-2 hover:text-text hover:bg-bg-card-hover',
                    checked && 'border-accent bg-accent-soft text-text',
                  )}
                >
                  <input
                    className="appearance-none w-lg h-lg border border-border-2 rounded-full m-0 shrink-0 relative cursor-pointer bg-transparent checked:border-accent checked:after:content-[''] checked:after:absolute checked:after:top-1/2 checked:after:left-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:w-sm checked:after:h-sm checked:after:rounded-full checked:after:bg-accent"
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
          <div className="flex items-center gap-md m-0 mb-lg">
            <input
              type="text"
              className="flex-1 min-w-0 bg-bg-elevated border border-border-2 text-text py-md px-md font-3 text-5 rounded-2 transition-colors duration-150 ease-in-out focus:outline-none focus:border-accent"
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
            {spec.unit && <span className="font-3 text-4 text-text-dim">{spec.unit}</span>}
          </div>
        )}
        <div className="flex justify-end gap-md">
          <button
            type="button"
            className="btn disabled:opacity-45 disabled:cursor-not-allowed"
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
        className="my-2xl mb-lg"
        header={
          <div className="flex items-center gap-md flex-wrap">
            <Badge variant="teal" size="sm">Prediction locked in</Badge>
          </div>
        }
      >
        <p className="body-copy text-6 leading-4 m-0 mb-lg">
          You guessed: <strong className="text-text font-medium">{displayedAnswer}</strong>
        </p>
        {reveal ? (
          <div className="body-copy text-5 leading-4 m-0 mb-lg py-md px-lg bg-bg-elevated border-l-2 border-teal rounded-r-2">
            {reveal(answer)}
          </div>
        ) : null}
        <div className="flex justify-end gap-md">
          <button type="button" className="btn disabled:opacity-45 disabled:cursor-not-allowed" onClick={handleReveal}>
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
    <div className="my-lg">
      <Banner variant={annotationVariant} className="mb-md font-1 text-4">
        <span className="eyebrow-muted tracking-3">Your prediction:</span>{' '}
        <strong className="text-text font-medium">{displayedAnswer}</strong>{' '}
        <span className="text-text-dim">
          Try the demo to see if you were right.
        </span>
      </Banner>
      {children}
    </div>
  );
}
