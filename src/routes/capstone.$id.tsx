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

  const toggleDone = useCallback((stepId: string) => {
    setProgress(prev => {
      const has = prev.done.includes(stepId);
      const next: CapstoneProgress = {
        done: has ? prev.done.filter(x => x !== stepId) : [...prev.done, stepId],
      };
      writeProgress(id, next);
      return next;
    });
  }, [id]);

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
    const idx = CAPSTONES.findIndex(c => c.id === id);
    return {
      prev: idx > 0 ? CAPSTONES[idx - 1] : null,
      next: idx >= 0 && idx < CAPSTONES.length - 1 ? CAPSTONES[idx + 1] : null,
    };
  })();

  return (
    <article className="page-shell pt-5xl max-w-page">
      <header className="mb-3xl">
        <div className="eyebrow-accent text-2 tracking-4 mb-lg">Capstone {capstone.number} · Integration project</div>
        <h1 className="title-display font-light text-10 leading-[1.08] tracking-1 mb-md max-md:text-9">{capstone.title}</h1>
        <p className="title-display text-7 text-text-dim mb-lg"><em>{capstone.subtitle}</em></p>

        <div className="body-copy leading-[1.65] text-text mb-xl [&_p]:m-0 [&_p]:mb-lg">{capstone.intro}</div>

        <div className="flex flex-wrap gap-sm my-lg">
          <Badge variant="accent">≈ {capstone.estimatedMinutes} min</Badge>
          <Badge variant="subtle">{capstone.steps.length} steps</Badge>
          <Badge variant="subtle">{capstone.requiredChapters.length} chapters</Badge>
          <Badge variant="teal">{completedCount}/{totalSteps} done · {pct}%</Badge>
        </div>

        <div className="mt-lg py-lg px-lg card-surface bg-color-2 rounded-6">
          <div className="eyebrow-muted text-1 tracking-3 mb-md">Built on:</div>
          <div className="flex flex-wrap gap-sm">
            {capstone.requiredChapters.map(slug => {
              const ch = CHAPTERS.find(c => c.slug === slug);
              if (!ch) return null;
              return (
                <Link
                  key={slug}
                  to="/textbook/$chapterSlug"
                  params={{ chapterSlug: slug }}
                  className="inline-block py-sm px-md bg-color-3 border border-border-2 rounded-pill font-3 text-2 text-text-dim no-underline tracking-2 transition-colors duration-[120ms] ease-out hover:text-accent hover:border-accent"
                >
                  Ch.{ch.number} · {ch.title}
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      <section className="mb-3xl">
        <div className="flex items-baseline justify-between mb-lg">
          <h2 className="title-display font-light text-9">Walkthrough</h2>
          {completedCount > 0 && (
            <button
              type="button"
              className="bg-transparent border border-border-2 text-text-muted font-3 text-2 uppercase tracking-3 py-sm px-lg rounded-4 cursor-pointer transition-colors duration-[120ms] ease-out hover:text-accent hover:border-accent"
              onClick={resetProgress}
              aria-label="Reset capstone progress"
            >
              Reset progress
            </button>
          )}
        </div>

        <ol className="list-none p-0 m-0 flex flex-col gap-lg">
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
          <div className="flex items-baseline gap-md mb-md">
            <span className="font-3 text-1 text-blue uppercase tracking-3 py-xxs px-md border border-blue rounded-3">Stretch</span>
            <h3 className="title-display font-light text-8 leading-[1.25]">{capstone.stretch.title}</h3>
          </div>
          <div className="body-copy text-6 leading-[1.65] text-text">
            <div className="[&_p]:m-0 [&_p]:mb-lg [&_ul]:my-md [&_ul]:mb-lg [&_ul]:pl-xl [&_ol]:my-md [&_ol]:mb-lg [&_ol]:pl-xl">{capstone.stretch.problem}</div>
            <details className="mt-lg [&_summary::-webkit-details-marker]:hidden">
              <summary className="cursor-pointer font-3 text-3 text-blue uppercase tracking-3 py-md list-none hover:text-accent">Show one approach →</summary>
              <div className="mt-md py-lg px-lg bg-color-3 rounded-3 [&_p]:m-0 [&_p]:mb-lg [&_ul]:my-md [&_ul]:mb-lg [&_ul]:pl-xl [&_ol]:my-md [&_ol]:mb-lg [&_ol]:pl-xl">{capstone.stretch.solution}</div>
            </details>
          </div>
        </Banner>
      </section>

      <section className="my-3xl mb-xl">
        <SourcesList ids={capstone.sources} />
      </section>

      <nav className="grid grid-cols-2 gap-lg mt-2xl pt-xl border-t border-border max-md:grid-cols-1">
        {neighbors.prev ? (
          <Link
            to="/capstone/$id"
            params={{ id: neighbors.prev.id }}
            className="flex flex-col gap-xs py-lg px-lg card-surface bg-color-2 no-underline transition-colors duration-[120ms] ease-out hover:border-accent hover:bg-color-3"
          >
            <span className="eyebrow-muted tracking-3">← Previous</span>
            <span className="font-1 text-5 text-text">
              Capstone {neighbors.prev.number} · {neighbors.prev.title}
            </span>
          </Link>
        ) : (
          <Link to="/capstones" className="flex flex-col gap-xs py-lg px-lg card-surface bg-color-2 no-underline transition-colors duration-[120ms] ease-out hover:border-accent hover:bg-color-3">
            <span className="eyebrow-muted tracking-3">← All capstones</span>
          </Link>
        )}
        {neighbors.next ? (
          <Link
            to="/capstone/$id"
            params={{ id: neighbors.next.id }}
            className="flex flex-col gap-xs py-lg px-lg card-surface bg-color-2 no-underline transition-colors duration-[120ms] ease-out hover:border-accent hover:bg-color-3 text-right max-md:text-left"
          >
            <span className="eyebrow-muted tracking-3">Next →</span>
            <span className="font-1 text-5 text-text">
              Capstone {neighbors.next.number} · {neighbors.next.title}
            </span>
          </Link>
        ) : (
          <Link to="/me" className="flex flex-col gap-xs py-lg px-lg card-surface bg-color-2 no-underline transition-colors duration-[120ms] ease-out hover:border-accent hover:bg-color-3 text-right max-md:text-left">
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
      <Card
        variant="default"
        className={done ? '!border-teal' : undefined}
      >
        <div className="grid grid-cols-[auto_1fr_auto] gap-md items-baseline mb-lg pb-md border-b border-border max-md:grid-cols-1 max-md:gap-sm">
          <div className="eyebrow-muted tracking-3">Step {index}</div>
          <h3 className="title-display text-8 font-light leading-[1.2]">{step.title}</h3>
          <label
            className={`inline-flex items-center gap-sm font-3 text-2 uppercase tracking-3 cursor-pointer select-none max-md:justify-self-start ${done ? 'text-teal' : 'text-text-muted'}`}
          >
            <input
              type="checkbox"
              checked={done}
              onChange={onToggleDone}
              aria-label={`Mark step ${index} as done`}
              className="w-lg h-lg cursor-pointer accent-teal"
            />
            <span>Done</span>
          </label>
        </div>
        <div className="body-copy text-6 leading-[1.65] text-text [&_p]:m-0 [&_p]:mb-lg [&_ul]:my-md [&_ul]:mb-lg [&_ul]:pl-xl [&_ol]:my-md [&_ol]:mb-lg [&_ol]:pl-xl [&_li]:my-sm">{step.problem}</div>
        {step.hint && !showSolution && (
          <div className="my-lg py-md px-lg bg-color-2 border-l-[3px] border-teal rounded-3 font-1 text-5 text-text-dim flex gap-md items-baseline">
            <span className="font-3 text-1 text-teal uppercase tracking-3">Hint</span>
            <span>{step.hint}</span>
          </div>
        )}
        <button
          type="button"
          className="mt-lg bg-transparent border border-accent text-accent font-3 text-3 uppercase tracking-3 py-md px-lg rounded-4 cursor-pointer transition-colors duration-[120ms] ease-out hover:bg-accent-soft"
          onClick={() => setShowSolution(s => !s)}
          aria-expanded={showSolution}
        >
          {showSolution ? 'Hide solution ↑' : 'Show solution →'}
        </button>
        {showSolution && (
          <div className="mt-lg py-lg px-lg bg-color-2 border-l-[3px] border-accent rounded-3 body-copy text-6 leading-[1.65] text-text [&_p]:m-0 [&_p]:mb-lg [&_ul]:my-md [&_ul]:mb-lg [&_ul]:pl-xl [&_ol]:my-md [&_ol]:mb-lg [&_ol]:pl-xl [&_li]:my-sm">{step.solution}</div>
        )}
      </Card>
    </li>
  );
}
