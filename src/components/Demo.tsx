import type { ReactNode } from 'react';

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
  return (
    <figure className="demo">
      <div className="demo-head">
        <span className="demo-fig">{figure ?? 'Fig.'}</span>
        <span className="demo-title">{title}</span>
        {deeperLab && (
          <Link to="/labs/$slug" params={{ slug: deeperLab.slug }} className="demo-deeper">
            {deeperLab.label} →
          </Link>
        )}
      </div>
      <div className="demo-question">{question}</div>
      <div className="demo-body">{children}</div>
      {caption && <figcaption className="demo-caption">{caption}</figcaption>}
    </figure>
  );
}

interface DemoControlsProps {
  children: ReactNode;
}
/** Bottom strip of a demo card — small controls (slider, toggle) sit here. */
export function DemoControls({ children }: DemoControlsProps) {
  return <div className="demo-controls">{children}</div>;
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
      <span className="mini-slider-value">{format ? format(value) : value.toFixed(2)}</span>
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
    <div className="mini-readout">
      <span className="mini-readout-label">{label}</span>
      <span className="mini-readout-value">
        {value}{unit && <span className="mini-readout-unit"> {unit}</span>}
      </span>
    </div>
  );
}
