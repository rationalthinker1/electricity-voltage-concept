import type { ReactNode } from 'react';
import clsx from 'clsx';

export interface ReadoutProps {
  /** Greek letter or variable name shown in italic before the label */
  sym: ReactNode;
  /** Plain-text or JSX label */
  label: ReactNode;
  /** Numeric value (rendered as HTML so callers can pass pretty()/sci() output) */
  valueHTML?: string;
  /** Alternative: pass a plain value (will not be parsed as HTML) */
  value?: ReactNode;
  /** Unit string */
  unit?: string;
  /** Mark as the "punchline" output — gets the accent-soft highlighted style */
  highlight?: boolean;
}

/**
 * Output readout. Two variants: normal (border-bottom row) and highlighted
 * (the lab's punchline number — accent background + amber).
 */
export function Readout({ sym, label, valueHTML, value, unit, highlight }: ReadoutProps) {
  if (highlight) {
    return (
      <div className="readout-row-1 readout-highlight-1 accent-brand">
        <span className="readout-label-2">
          <span className="readout-symbol-1">{sym}</span>
          {label}
        </span>
        <span className="readout-number-1 readout-number-lg-1">
          {valueHTML
            ? <span dangerouslySetInnerHTML={{ __html: valueHTML }} />
            : value ?? '—'}
          {unit && <span className="readout-unit-2"> {unit}</span>}
        </span>
      </div>
    );
  }

  return (
    <div className={clsx('readout-row-1 accent-teal')}>
      <span className="readout-label-2">
        <span className="readout-symbol-1">{sym}</span>
        {label}
      </span>
      <span className="readout-number-1">
        {valueHTML
          ? <span dangerouslySetInnerHTML={{ __html: valueHTML }} />
          : value ?? '—'}
        {unit && <span className="readout-unit-2"> {unit}</span>}
      </span>
    </div>
  );
}
