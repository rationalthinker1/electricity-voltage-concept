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
    <figure ref={figureRef} className="bg-bg-card border border-border-strong rounded-3 overflow-hidden [content-visibility:auto] [contain-intrinsic-size:620px]">
      <div className="flex items-baseline gap-[16px] py-[16px] px-[22px] border-b border-border bg-bg-elevated flex-wrap">
        <span className="font-3 text-[10px] text-accent tracking-[.22em] uppercase">{figure ?? 'Fig.'}</span>
        <span className="font-1 text-[14px] text-text font-medium flex-1">{title}</span>
        {deeperLab && (
          <Link to="/labs/$slug" params={{ slug: deeperLab.slug }} className="font-3 text-[10px] text-text-muted tracking-[.15em] uppercase no-underline border-b border-dotted border-text-muted hover:text-accent hover:border-accent">
            {deeperLab.label} →
          </Link>
        )}
      </div>
      <div className="py-[12px] px-[22px] font-2 italic font-light text-[17px] text-text border-b border-border bg-accent-soft">{question}</div>
      <div className={shouldRenderBody
        ? 'bg-canvas-bg [contain:layout_paint_style] [&_canvas]:block [&_canvas]:w-full'
        : 'bg-canvas-bg [contain:layout_paint_style] [&_canvas]:block [&_canvas]:w-full min-h-[320px]'}>
        {shouldRenderBody ? children : null}
      </div>
      {caption && <figcaption className="py-[14px] px-[22px] text-[13px] text-text-muted italic leading-[1.5] border-t border-border">{caption}</figcaption>}
    </figure>
  );
}

interface DemoControlsProps {
  children: ReactNode;
}
/** Bottom strip of a demo card — small controls (slider, toggle) sit here. */
export function DemoControls({ children }: DemoControlsProps) {
  return <div className="flex flex-wrap gap-y-[18px] gap-x-[28px] items-center py-[14px] px-[22px] bg-bg-elevated border-t border-border">{children}</div>;
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
    <label className="mini-slider">
      <span className="mini-slider-label">{label}</span>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ ['--pct' as string]: `${pct}%` }}
      />
      <span className="font-3 text-[11px] text-accent tracking-[.04em]">{format ? format(value) : value.toFixed(2)}</span>
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
    <div className="inline-flex items-baseline gap-[8px] font-3 text-[11px]">
      <span className="text-text-muted uppercase tracking-[.12em]">{label}</span>
      <span className="text-accent text-[13px] [&_sub]:text-[.7em] [&_sup]:text-[.7em] [&_sub]:leading-none [&_sup]:leading-none [&_sub]:font-3 [&_sup]:font-3 [&_sub]:align-[-.35em] [&_sup]:align-[.45em]">
        {value}{unit && <span className="text-text-muted text-[10px]"> {unit}</span>}
      </span>
    </div>
  );
}
