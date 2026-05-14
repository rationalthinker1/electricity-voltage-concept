import { Link, createFileRoute, notFound } from '@tanstack/react-router';
import { useCallback, useEffect, useState } from 'react';

import { CAPSTONES, getCapstone, type CapstoneStep } from '@/textbook/data/capstones';
import { CHAPTERS } from '@/textbook/data/chapters';
import { SourcesList } from '@/components/SourcesList';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Banner } from '@/components/ui/Banner';
import '@/styles/capstones.css';

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
    <article className="capstone-page">
      <header className="capstone-hero">
        <div className="capstone-eyebrow">Capstone {capstone.number} · Integration project</div>
        <h1 className="capstone-title">{capstone.title}</h1>
        <p className="capstone-subtitle"><em>{capstone.subtitle}</em></p>

        <div className="capstone-intro">{capstone.intro}</div>

        <div className="capstone-meta">
          <Badge variant="accent">≈ {capstone.estimatedMinutes} min</Badge>
          <Badge variant="subtle">{capstone.steps.length} steps</Badge>
          <Badge variant="subtle">{capstone.requiredChapters.length} chapters</Badge>
          <Badge variant="teal">{completedCount}/{totalSteps} done · {pct}%</Badge>
        </div>

        <div className="capstone-chips">
          <div className="capstone-chips-label">Built on:</div>
          <div className="capstone-chips-row">
            {capstone.requiredChapters.map(slug => {
              const ch = CHAPTERS.find(c => c.slug === slug);
              if (!ch) return null;
              return (
                <Link
                  key={slug}
                  to="/textbook/$chapterSlug"
                  params={{ chapterSlug: slug }}
                  className="capstone-chip"
                >
                  Ch.{ch.number} · {ch.title}
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      <section className="capstone-steps">
        <div className="capstone-steps-head">
          <h2>Walkthrough</h2>
          {completedCount > 0 && (
            <button
              type="button"
              className="capstone-reset"
              onClick={resetProgress}
              aria-label="Reset capstone progress"
            >
              Reset progress
            </button>
          )}
        </div>

        <ol className="capstone-step-list">
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

      <section className="capstone-stretch">
        <Banner variant="info">
          <div className="capstone-stretch-head">
            <span className="capstone-stretch-tag">Stretch</span>
            <h3>{capstone.stretch.title}</h3>
          </div>
          <div className="capstone-stretch-body">
            <div className="capstone-stretch-problem">{capstone.stretch.problem}</div>
            <details className="capstone-stretch-reveal">
              <summary>Show one approach →</summary>
              <div className="capstone-stretch-solution">{capstone.stretch.solution}</div>
            </details>
          </div>
        </Banner>
      </section>

      <section className="capstone-sources">
        <SourcesList ids={capstone.sources} />
      </section>

      <nav className="capstone-nav">
        {neighbors.prev ? (
          <Link
            to="/capstone/$id"
            params={{ id: neighbors.prev.id }}
            className="capstone-nav-link"
          >
            <span className="capstone-nav-dir">← Previous</span>
            <span className="capstone-nav-title">
              Capstone {neighbors.prev.number} · {neighbors.prev.title}
            </span>
          </Link>
        ) : (
          <Link to="/capstones" className="capstone-nav-link">
            <span className="capstone-nav-dir">← All capstones</span>
          </Link>
        )}
        {neighbors.next ? (
          <Link
            to="/capstone/$id"
            params={{ id: neighbors.next.id }}
            className="capstone-nav-link capstone-nav-link-next"
          >
            <span className="capstone-nav-dir">Next →</span>
            <span className="capstone-nav-title">
              Capstone {neighbors.next.number} · {neighbors.next.title}
            </span>
          </Link>
        ) : (
          <Link to="/me" className="capstone-nav-link capstone-nav-link-next">
            <span className="capstone-nav-dir">Progress →</span>
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
    <li className={`capstone-step${done ? ' capstone-step-done' : ''}`}>
      <Card variant="default" className="capstone-step-card">
        <div className="capstone-step-head">
          <div className="capstone-step-num">Step {index}</div>
          <h3 className="capstone-step-title">{step.title}</h3>
          <label className="capstone-step-done-toggle">
            <input
              type="checkbox"
              checked={done}
              onChange={onToggleDone}
              aria-label={`Mark step ${index} as done`}
            />
            <span>Done</span>
          </label>
        </div>
        <div className="capstone-step-problem">{step.problem}</div>
        {step.hint && !showSolution && (
          <div className="capstone-step-hint">
            <span className="capstone-step-hint-tag">Hint</span>
            <span>{step.hint}</span>
          </div>
        )}
        <button
          type="button"
          className="capstone-step-reveal"
          onClick={() => setShowSolution(s => !s)}
          aria-expanded={showSolution}
        >
          {showSolution ? 'Hide solution ↑' : 'Show solution →'}
        </button>
        {showSolution && (
          <div className="capstone-step-solution">{step.solution}</div>
        )}
      </Card>
    </li>
  );
}
