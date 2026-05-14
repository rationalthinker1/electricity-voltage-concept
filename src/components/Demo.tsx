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
    <figure ref={figureRef} className="card-figure-1">
      <div className="header-1">
        <span className="kicker-1 accent-brand">{figure ?? 'Fig.'}</span>
        <span className="title-5 grow-1">{title}</span>
        {deeperLab && (
          <Link to="/labs/$slug" params={{ slug: deeperLab.slug }} className="link-1 accent-brand">
            {deeperLab.label} →
          </Link>
        )}
      </div>
      <div className="question-1 accent-brand surface-soft">{question}</div>
      <div className={clsx('canvas-1', !shouldRenderBody && 'canvas-pending-1')}>
        {shouldRenderBody ? children : null}
      </div>
      {caption && <figcaption className="caption-1">{caption}</figcaption>}
    </figure>
  );
}

interface DemoControlsProps {
  children: ReactNode;
}
/** Bottom strip of a demo card — small controls (slider, toggle) sit here. */
export function DemoControls({ children }: DemoControlsProps) {
  return <div className="controls-1">{children}</div>;
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
    <label className="slider-1">
      <span className="slider-label-1">{label}</span>
      <input
        className="slider-input-1 demo-range"
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ ['--pct' as string]: `${pct}%` }}
      />
      <span className="slider-value-1 accent-brand">{format ? format(value) : value.toFixed(2)}</span>
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
      className={clsx('toggle-1', checked && 'toggle-active-1 accent-brand')}
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
    <div className="readout-1">
      <span className="readout-label-1">{label}</span>
      <span className="readout-value-1 accent-brand">
        {value}{unit && <span className="readout-unit-1"> {unit}</span>}
      </span>
    </div>
  );
}
