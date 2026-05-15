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
    <article className="pt-[130px] pb-[80px] px-[40px] max-w-[920px] mx-auto max-[760px]:pt-[120px] max-[760px]:pb-[60px] max-[760px]:px-[18px]">
      <header className="mb-[48px]">
        <div className="font-3 text-[11px] text-accent uppercase tracking-[.18em] mb-[14px]">Capstone {capstone.number} · Integration project</div>
        <h1 className="title-display font-light text-[48px] leading-[1.08] tracking-[-.02em] mb-[8px] max-[760px]:text-[34px]">{capstone.title}</h1>
        <p className="title-display text-[20px] text-color-5 mb-[20px]"><em>{capstone.subtitle}</em></p>

        <div className="body-copy leading-[1.65] text-color-4 mb-[24px] [&_p]:m-0 [&_p]:mb-[14px]">{capstone.intro}</div>

        <div className="flex flex-wrap gap-[8px] my-[18px]">
          <Badge variant="accent">≈ {capstone.estimatedMinutes} min</Badge>
          <Badge variant="subtle">{capstone.steps.length} steps</Badge>
          <Badge variant="subtle">{capstone.requiredChapters.length} chapters</Badge>
          <Badge variant="teal">{completedCount}/{totalSteps} done · {pct}%</Badge>
        </div>

        <div className="mt-[18px] py-[14px] px-[16px] card-surface bg-color-2 rounded-6">
          <div className="eyebrow-muted text-[10px] tracking-[.14em] mb-[8px]">Built on:</div>
          <div className="flex flex-wrap gap-[6px]">
            {capstone.requiredChapters.map(slug => {
              const ch = CHAPTERS.find(c => c.slug === slug);
              if (!ch) return null;
              return (
                <Link
                  key={slug}
                  to="/textbook/$chapterSlug"
                  params={{ chapterSlug: slug }}
                  className="inline-block py-[4px] px-[10px] bg-color-3 border border-border-2 rounded-pill font-3 text-[11px] text-color-5 no-underline tracking-[.04em] transition-colors duration-[120ms] ease-out hover:text-accent hover:border-accent"
                >
                  Ch.{ch.number} · {ch.title}
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      <section className="mb-[40px]">
        <div className="flex items-baseline justify-between mb-[18px]">
          <h2 className="title-display font-light text-[32px]">Walkthrough</h2>
          {completedCount > 0 && (
            <button
              type="button"
              className="bg-transparent border border-border-2 text-text-muted font-3 text-[11px] uppercase tracking-[.12em] py-[6px] px-[12px] rounded-4 cursor-pointer transition-colors duration-[120ms] ease-out hover:text-accent hover:border-accent"
              onClick={resetProgress}
              aria-label="Reset capstone progress"
            >
              Reset progress
            </button>
          )}
        </div>

        <ol className="list-none p-0 m-0 flex flex-col gap-[20px]">
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

      <section className="my-[40px]">
        <Banner variant="info">
          <div className="flex items-baseline gap-[12px] mb-[10px]">
            <span className="font-3 text-[10px] text-blue uppercase tracking-[.14em] py-[3px] px-[8px] border border-blue rounded-3">Stretch</span>
            <h3 className="title-display font-light text-[22px] leading-[1.25]">{capstone.stretch.title}</h3>
          </div>
          <div className="body-copy text-[15px] leading-[1.65] text-color-4">
            <div className="[&_p]:m-0 [&_p]:mb-[12px] [&_ul]:my-[8px] [&_ul]:mb-[12px] [&_ul]:pl-[22px] [&_ol]:my-[8px] [&_ol]:mb-[12px] [&_ol]:pl-[22px]">{capstone.stretch.problem}</div>
            <details className="mt-[12px] [&_summary::-webkit-details-marker]:hidden">
              <summary className="cursor-pointer font-3 text-[12px] text-blue uppercase tracking-[.14em] py-[8px] list-none hover:text-accent">Show one approach →</summary>
              <div className="mt-[10px] py-[14px] px-[16px] bg-color-3 rounded-3 [&_p]:m-0 [&_p]:mb-[12px] [&_ul]:my-[8px] [&_ul]:mb-[12px] [&_ul]:pl-[22px] [&_ol]:my-[8px] [&_ol]:mb-[12px] [&_ol]:pl-[22px]">{capstone.stretch.solution}</div>
            </details>
          </div>
        </Banner>
      </section>

      <section className="my-[40px] mb-[24px]">
        <SourcesList ids={capstone.sources} />
      </section>

      <nav className="grid grid-cols-2 gap-[18px] mt-[30px] pt-[22px] border-t border-border max-[760px]:grid-cols-1">
        {neighbors.prev ? (
          <Link
            to="/capstone/$id"
            params={{ id: neighbors.prev.id }}
            className="flex flex-col gap-[4px] py-[14px] px-[16px] card-surface bg-color-2 no-underline transition-colors duration-[120ms] ease-out hover:border-accent hover:bg-color-3"
          >
            <span className="eyebrow-muted tracking-[.14em]">← Previous</span>
            <span className="font-1 text-[14px] text-color-4">
              Capstone {neighbors.prev.number} · {neighbors.prev.title}
            </span>
          </Link>
        ) : (
          <Link to="/capstones" className="flex flex-col gap-[4px] py-[14px] px-[16px] card-surface bg-color-2 no-underline transition-colors duration-[120ms] ease-out hover:border-accent hover:bg-color-3">
            <span className="eyebrow-muted tracking-[.14em]">← All capstones</span>
          </Link>
        )}
        {neighbors.next ? (
          <Link
            to="/capstone/$id"
            params={{ id: neighbors.next.id }}
            className="flex flex-col gap-[4px] py-[14px] px-[16px] card-surface bg-color-2 no-underline transition-colors duration-[120ms] ease-out hover:border-accent hover:bg-color-3 text-right max-[760px]:text-left"
          >
            <span className="eyebrow-muted tracking-[.14em]">Next →</span>
            <span className="font-1 text-[14px] text-color-4">
              Capstone {neighbors.next.number} · {neighbors.next.title}
            </span>
          </Link>
        ) : (
          <Link to="/me" className="flex flex-col gap-[4px] py-[14px] px-[16px] card-surface bg-color-2 no-underline transition-colors duration-[120ms] ease-out hover:border-accent hover:bg-color-3 text-right max-[760px]:text-left">
            <span className="eyebrow-muted tracking-[.14em]">Progress →</span>
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
        <div className="grid grid-cols-[auto_1fr_auto] gap-[14px] items-baseline mb-[12px] pb-[10px] border-b border-border max-[760px]:grid-cols-1 max-[760px]:gap-[6px]">
          <div className="eyebrow-muted tracking-[.14em]">Step {index}</div>
          <h3 className="title-display text-[24px] font-light leading-[1.2]">{step.title}</h3>
          <label
            className={`inline-flex items-center gap-[6px] font-3 text-[11px] uppercase tracking-[.12em] cursor-pointer select-none max-[760px]:justify-self-start ${done ? 'text-teal' : 'text-text-muted'}`}
          >
            <input
              type="checkbox"
              checked={done}
              onChange={onToggleDone}
              aria-label={`Mark step ${index} as done`}
              className="w-[14px] h-[14px] cursor-pointer accent-teal"
            />
            <span>Done</span>
          </label>
        </div>
        <div className="body-copy text-[15px] leading-[1.65] text-color-4 [&_p]:m-0 [&_p]:mb-[12px] [&_ul]:my-[8px] [&_ul]:mb-[12px] [&_ul]:pl-[22px] [&_ol]:my-[8px] [&_ol]:mb-[12px] [&_ol]:pl-[22px] [&_li]:my-[4px]">{step.problem}</div>
        {step.hint && !showSolution && (
          <div className="my-[14px] py-[10px] px-[14px] bg-color-2 border-l-[3px] border-teal rounded-3 font-1 text-[14px] text-color-5 flex gap-[10px] items-baseline">
            <span className="font-3 text-[10px] text-teal uppercase tracking-[.14em]">Hint</span>
            <span>{step.hint}</span>
          </div>
        )}
        <button
          type="button"
          className="mt-[12px] bg-transparent border border-accent text-accent font-3 text-[12px] uppercase tracking-[.14em] py-[8px] px-[14px] rounded-4 cursor-pointer transition-colors duration-[120ms] ease-out hover:bg-accent-soft"
          onClick={() => setShowSolution(s => !s)}
          aria-expanded={showSolution}
        >
          {showSolution ? 'Hide solution ↑' : 'Show solution →'}
        </button>
        {showSolution && (
          <div className="mt-[16px] py-[16px] px-[18px] bg-color-2 border-l-[3px] border-accent rounded-3 body-copy text-[15px] leading-[1.65] text-color-4 [&_p]:m-0 [&_p]:mb-[12px] [&_ul]:my-[8px] [&_ul]:mb-[12px] [&_ul]:pl-[22px] [&_ol]:my-[8px] [&_ol]:mb-[12px] [&_ol]:pl-[22px] [&_li]:my-[4px]">{step.solution}</div>
        )}
      </Card>
    </li>
  );
}
