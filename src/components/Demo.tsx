import { useEffect, useRef, useState, type ReactNode } from 'react';

import { Link } from '@tanstack/react-router';

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
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
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
    <figure
      ref={figureRef}
      className="bg-bg-card border-border-strong rounded-3 overflow-hidden border [contain-intrinsic-size:620px] [content-visibility:auto]"
    >
      <div className="gap-lg py-lg px-xl border-border bg-bg-elevated flex flex-wrap items-baseline border-b">
        <span className="eyebrow-accent text-1 tracking-4">{figure ?? 'Fig.'}</span>
        <span className="font-1 text-5 text-text flex-1 font-medium">{title}</span>
        {deeperLab && (
          <Link
            to="/labs/$slug"
            params={{ slug: deeperLab.slug }}
            className="font-3 text-1 text-text-muted tracking-3 border-text-muted hover:text-accent hover:border-accent border-b border-dotted uppercase no-underline"
          >
            {deeperLab.label} →
          </Link>
        )}
      </div>
      <div className="title-display py-lg px-xl text-6 border-border bg-accent-soft border-b font-light">
        {question}
      </div>
      <div
        className={
          shouldRenderBody
            ? 'bg-canvas-bg [contain:layout_paint_style]'
            : 'bg-canvas-bg min-h-panel [contain:layout_paint_style]'
        }
      >
        {shouldRenderBody ? children : null}
      </div>
      {caption && (
        <figcaption className="py-lg px-xl text-4 text-text-muted border-border border-t leading-4 italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

interface DemoControlsProps {
  children: ReactNode;
}
/** Bottom strip of a demo card — small controls (slider, toggle) sit here. */
export function DemoControls({ children }: DemoControlsProps) {
  return (
    <div className="gap-y-lg gap-x-xl py-lg px-xl bg-bg-elevated border-border flex flex-wrap items-center border-t">
      {children}
    </div>
  );
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
export function MiniSlider({
  label,
  value,
  min,
  max,
  step = 0.01,
  format,
  onChange,
}: MiniSliderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <label className="mini-slider">
      <span className="mini-slider-label">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ ['--pct' as string]: `${pct}%` }}
      />
      <span className="font-3 text-2 text-accent tracking-2">
        {format ? format(value) : value.toFixed(2)}
      </span>
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
      className={`mini-toggle${checked ? ' on' : ''}`}
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
    <div className="gap-sm font-3 text-2 inline-flex items-baseline">
      <span className="text-text-muted tracking-3 uppercase">{label}</span>
      <span className="text-accent text-4">
        {value}
        {unit && <span className="text-text-muted text-1"> {unit}</span>}
      </span>
    </div>
  );
}
