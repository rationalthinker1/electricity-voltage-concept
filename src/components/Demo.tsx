import { useEffect, useRef, useState, type ReactNode } from 'react';

import { Link } from '@tanstack/react-router';
import clsx from 'clsx';

interface DemoProps {
  /** Optional figure number, e.g. "Fig. 1.3" */
  figure?: string;
  /** Title shown in the demo card header */
  title: string;
  /** One-line caption — what the reader should look for */
  question: string;
  /** The interactive area: canvas, sliders, readout. Caller composes this freely. */
  children: ReactNode;
  /** Optional caption shown below the demo, in italic */
  caption?: ReactNode;
  /** Optional "go deeper" link to the full lab page in /labs */
  deeperLab?: { slug: string; label: string };
}

/**
 * Embedded demo card. Used inside ChapterShell prose to introduce small,
 * focused interactive figures. Each demo answers one specific question; the
 * reader can either play with it inline or click through to the full
 * /labs/{slug} page for the deeper math.
 */
export function Demo({ figure, title, question, children, caption, deeperLab }: DemoProps) {
  const figureRef = useRef<HTMLElement>(null);
  const [shouldRenderBody, setShouldRenderBody] = useState(false);

  useEffect(() => {
    const figure = figureRef.current;
    if (!figure) return;
    if (!('IntersectionObserver' in window)) {
      setShouldRenderBody(true);
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          setShouldRenderBody(true);
          observer.disconnect();
        }
      },
      { rootMargin: '720px 0px' },
    );
    observer.observe(figure);
    return () => observer.disconnect();
  }, []);

  return (
    <figure ref={figureRef} className="card-figure">
      <div className="flex flex-wrap items-baseline gap-lg px-[22px] py-lg bg-color-bg-elevated border-b border-color-border">
        <span className="text-meta text-color-accent">{figure ?? 'Fig.'}</span>
        <span className="title-sm flex-1 min-w-0">{title}</span>
        {deeperLab && (
          <Link to="/labs/$slug" params={{ slug: deeperLab.slug }} className="text-meta text-color-accent no-underline hover:underline">
            {deeperLab.label} →
          </Link>
        )}
      </div>
      <div className="question-base bg-color-accent-soft">{question}</div>
      <div className={clsx('canvas-base', !shouldRenderBody && 'min-h-[320px]')}>
        {shouldRenderBody ? children : null}
      </div>
      {caption && <figcaption className="caption-base">{caption}</figcaption>}
    </figure>
  );
}

interface DemoControlsProps {
  children: ReactNode;
}
/** Bottom strip of a demo card — small controls (slider, toggle) sit here. */
export function DemoControls({ children }: DemoControlsProps) {
  return <div className="toolbar-base">{children}</div>;
}

interface MiniSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  format?: (v: number) => string;
  onChange: (v: number) => void;
}
/**
 * Compact slider sized for inline-demo use. No min/max ticks; just a label
 * and a value, side by side.
 */
export function MiniSlider({ label, value, min, max, step = 0.01, format, onChange }: MiniSliderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <label className="flex flex-col gap-xs min-w-[160px] flex-1">
      <span className="text-meta">{label}</span>
      <input
        className="w-full h-[18px] appearance-none bg-transparent cursor-pointer demo-range"
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ ['--pct' as string]: `${pct}%` }}
      />
      <span className="text-meta text-color-accent">{format ? format(value) : value.toFixed(2)}</span>
    </label>
  );
}

interface MiniToggleProps {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}
export function MiniToggle({ label, checked, onChange }: MiniToggleProps) {
  return (
    <button
      type="button"
      className={clsx(
        'bg-transparent border border-color-border-strong text-color-text-dim px-md py-[6px] font-mono text-[10px] tracking-[.15em] uppercase cursor-pointer rounded-xs transition-colors',
        checked && 'bg-color-accent text-color-bg border-color-accent'
      )}
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
    >
      {label}
    </button>
  );
}

interface MiniReadoutProps {
  label: string;
  value: ReactNode;
  unit?: string;
}
export function MiniReadout({ label, value, unit }: MiniReadoutProps) {
  return (
    <div className="inline-flex items-baseline gap-sm font-mono text-[11px]">
      <span className="text-color-text-muted uppercase tracking-[.12em]">{label}</span>
      <span className="text-[13px] text-color-accent [&_sub]:text-[.75em] [&_sup]:text-[.75em] [&_sub]:align-[-0.35em] [&_sup]:align-[0.45em]">
        {value}{unit && <span className="text-color-text-muted text-[10px]"> {unit}</span>}
      </span>
    </div>
  );
}

