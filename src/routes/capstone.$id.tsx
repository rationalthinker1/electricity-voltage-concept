import { Link, createFileRoute, notFound } from '@tanstack/react-router';
import { useCallback, useEffect, useState } from 'react';

import { CAPSTONES, getCapstone, type CapstoneStep } from '@/textbook/data/capstones';
import { CHAPTERS } from '@/textbook/data/chapters';
import { SourcesList } from '@/components/SourcesList';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Banner } from '@/components/ui/Banner';

export const Route = createFileRoute('/capstone/$id')({
  beforeLoad: ({ params }) => {
    if (!getCapstone(params.id)) throw notFound();
  },
  component: CapstonePage,
});

const STORAGE_KEY_PREFIX = 'fieldTheoryCapstone:';

interface CapstoneProgress {
  done: string[];
}

function readProgress(id: string): CapstoneProgress {
  if (typeof window === 'undefined') return { done: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_PREFIX + id);
    if (!raw) return { done: [] };
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.done)) {
      return { done: parsed.done.filter((x: unknown) => typeof x === 'string') };
    }
    return { done: [] };
  } catch {
    return { done: [] };
  }
}

function writeProgress(id: string, progress: CapstoneProgress): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY_PREFIX + id, JSON.stringify(progress));
  } catch {
    // ignore
  }
}

function CapstonePage() {
  const { id } = Route.useParams();
  const capstone = getCapstone(id);

  const [progress, setProgress] = useState<CapstoneProgress>(() => readProgress(id));

  useEffect(() => {
    setProgress(readProgress(id));
  }, [id]);

  const toggleDone = useCallback(
    (stepId: string) => {
      setProgress((prev) => {
        const has = prev.done.includes(stepId);
        const next: CapstoneProgress = {
          done: has ? prev.done.filter((x) => x !== stepId) : [...prev.done, stepId],
        };
        writeProgress(id, next);
        return next;
      });
    },
    [id],
  );

  const resetProgress = useCallback(() => {
    const empty: CapstoneProgress = { done: [] };
    writeProgress(id, empty);
    setProgress(empty);
  }, [id]);

  if (!capstone) return null;

  const completedCount = progress.done.length;
  const totalSteps = capstone.steps.length;
  const pct = totalSteps ? Math.round((completedCount / totalSteps) * 100) : 0;

  const neighbors = (() => {
    const idx = CAPSTONES.findIndex((c) => c.id === id);
    return {
      prev: idx > 0 ? CAPSTONES[idx - 1] : null,
      next: idx >= 0 && idx < CAPSTONES.length - 1 ? CAPSTONES[idx + 1] : null,
    };
  })();

  return (
    <article className="page-shell max-w-page">
      <header className="mb-3xl">
        <div className="eyebrow-accent text-2 tracking-4 mb-lg">
          Capstone {capstone.number} · Integration project
        </div>
        <h1 className="title-display text-10 tracking-1 mb-md max-md:text-9 leading-1 font-light">
          {capstone.title}
        </h1>
        <p className="title-display text-7 text-text-dim mb-lg">
          <em>{capstone.subtitle}</em>
        </p>

        <div className="body-copy text-text mb-xl leading-5">{capstone.intro}</div>

        <div className="gap-sm my-lg flex flex-wrap">
          <Badge variant="accent">≈ {capstone.estimatedMinutes} min</Badge>
          <Badge variant="subtle">{capstone.steps.length} steps</Badge>
          <Badge variant="subtle">{capstone.requiredChapters.length} chapters</Badge>
          <Badge variant="teal">
            {completedCount}/{totalSteps} done · {pct}%
          </Badge>
        </div>

        <div className="mt-lg py-lg px-lg card-surface bg-bg-elevated rounded-6">
          <div className="eyebrow-muted text-1 tracking-3 mb-md">Built on:</div>
          <div className="gap-sm flex flex-wrap">
            {capstone.requiredChapters.map((slug) => {
              const ch = CHAPTERS.find((c) => c.slug === slug);
              if (!ch) return null;
              return (
                <Link
                  key={slug}
                  to="/textbook/$chapterSlug"
                  params={{ chapterSlug: slug }}
                  className="py-sm px-md bg-bg-card border-border-2 rounded-pill font-3 text-2 text-text-dim tracking-2 duration-fast hover:text-accent hover:border-accent inline-block border no-underline transition-colors ease-out"
                >
                  Ch.{ch.number} · {ch.title}
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      <section className="mb-3xl">
        <div className="mb-lg flex items-baseline justify-between">
          <h2 className="title-display text-9 font-light">Walkthrough</h2>
          {completedCount > 0 && (
            <button
              type="button"
              className="border-border-2 text-text-muted font-3 text-2 tracking-3 py-sm px-lg rounded-4 duration-fast hover:text-accent hover:border-accent cursor-pointer border bg-transparent uppercase transition-colors ease-out"
              onClick={resetProgress}
              aria-label="Reset capstone progress"
            >
              Reset progress
            </button>
          )}
        </div>

        <ol className="gap-lg m-0 flex list-none flex-col p-0">
          {capstone.steps.map((step, idx) => (
            <StepCard
              key={step.id}
              step={step}
              index={idx + 1}
              done={progress.done.includes(step.id)}
              onToggleDone={() => toggleDone(step.id)}
            />
          ))}
        </ol>
      </section>

      <section className="my-3xl">
        <Banner variant="info">
          <div className="gap-md mb-md flex items-baseline">
            <span className="font-3 text-1 text-blue tracking-3 py-xxs px-md border-blue rounded-3 border uppercase">
              Stretch
            </span>
            <h3 className="title-display text-8 leading-2 font-light">{capstone.stretch.title}</h3>
          </div>
          <div className="body-copy text-6 text-text leading-5">
            <div>{capstone.stretch.problem}</div>
            <details className="mt-lg [&_summary::-webkit-details-marker]:hidden">
              <summary className="font-3 text-3 text-blue tracking-3 py-md hover:text-accent cursor-pointer list-none uppercase">
                Show one approach →
              </summary>
              <div className="mt-md py-lg px-lg bg-bg-card rounded-3">
                {capstone.stretch.solution}
              </div>
            </details>
          </div>
        </Banner>
      </section>

      <section className="my-3xl mb-xl">
        <SourcesList ids={capstone.sources} />
      </section>

      <nav className="gap-lg mt-2xl pt-xl border-border grid grid-cols-2 border-t max-md:grid-cols-1">
        {neighbors.prev ? (
          <Link
            to="/capstone/$id"
            params={{ id: neighbors.prev.id }}
            className="gap-xs py-lg px-lg card-surface bg-bg-elevated duration-fast hover:border-accent hover:bg-bg-card flex flex-col no-underline transition-colors ease-out"
          >
            <span className="eyebrow-muted tracking-3">← Previous</span>
            <span className="font-1 text-5 text-text">
              Capstone {neighbors.prev.number} · {neighbors.prev.title}
            </span>
          </Link>
        ) : (
          <Link
            to="/capstones"
            className="gap-xs py-lg px-lg card-surface bg-bg-elevated duration-fast hover:border-accent hover:bg-bg-card flex flex-col no-underline transition-colors ease-out"
          >
            <span className="eyebrow-muted tracking-3">← All capstones</span>
          </Link>
        )}
        {neighbors.next ? (
          <Link
            to="/capstone/$id"
            params={{ id: neighbors.next.id }}
            className="gap-xs py-lg px-lg card-surface bg-bg-elevated duration-fast hover:border-accent hover:bg-bg-card flex flex-col text-right no-underline transition-colors ease-out max-md:text-left"
          >
            <span className="eyebrow-muted tracking-3">Next →</span>
            <span className="font-1 text-5 text-text">
              Capstone {neighbors.next.number} · {neighbors.next.title}
            </span>
          </Link>
        ) : (
          <Link
            to="/me"
            className="gap-xs py-lg px-lg card-surface bg-bg-elevated duration-fast hover:border-accent hover:bg-bg-card flex flex-col text-right no-underline transition-colors ease-out max-md:text-left"
          >
            <span className="eyebrow-muted tracking-3">Progress →</span>
          </Link>
        )}
      </nav>
    </article>
  );
}

interface StepCardProps {
  step: CapstoneStep;
  index: number;
  done: boolean;
  onToggleDone: () => void;
}

function StepCard({ step, index, done, onToggleDone }: StepCardProps) {
  const [showSolution, setShowSolution] = useState(false);
  return (
    <li className="relative">
      <Card variant="default" className={done ? '!border-teal' : undefined}>
        <div className="gap-md mb-lg pb-md border-border max-md:gap-sm grid grid-cols-[auto_1fr_auto] items-baseline border-b max-md:grid-cols-1">
          <div className="eyebrow-muted tracking-3">Step {index}</div>
          <h3 className="title-display text-8 leading-2 font-light">{step.title}</h3>
          <label
            className={`gap-sm font-3 text-2 tracking-3 inline-flex cursor-pointer items-center uppercase select-none max-md:justify-self-start ${done ? 'text-teal' : 'text-text-muted'}`}
          >
            <input
              type="checkbox"
              checked={done}
              onChange={onToggleDone}
              aria-label={`Mark step ${index} as done`}
              className="h-lg accent-teal w-lg cursor-pointer"
            />
            <span>Done</span>
          </label>
        </div>
        <div className="body-copy text-6 text-text leading-5">{step.problem}</div>
        {step.hint && !showSolution && (
          <div className="my-lg py-md px-lg bg-bg-elevated border-teal rounded-3 font-1 text-5 text-text-dim gap-md flex items-baseline border-l-3">
            <span className="font-3 text-1 text-teal tracking-3 uppercase">Hint</span>
            <span>{step.hint}</span>
          </div>
        )}
        <button
          type="button"
          className="mt-lg border-accent text-accent font-3 text-3 tracking-3 py-md px-lg rounded-4 duration-fast hover:bg-accent-soft cursor-pointer border bg-transparent uppercase transition-colors ease-out"
          onClick={() => setShowSolution((s) => !s)}
          aria-expanded={showSolution}
        >
          {showSolution ? 'Hide solution ↑' : 'Show solution →'}
        </button>
        {showSolution && (
          <div className="mt-lg py-lg px-lg bg-bg-elevated border-accent rounded-3 body-copy text-6 text-text border-l-3 leading-5">
            {step.solution}
          </div>
        )}
      </Card>
    </li>
  );
}
