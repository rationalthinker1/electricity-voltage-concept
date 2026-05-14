import type { ReactNode } from 'react';

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
      <div
        className="readout"
        style={{
          background: 'var(--accent-soft)',
          margin: '8px -28px',
          padding: '14px 28px',
          border: 'none',
        }}
      >
        <span className="ro-label" style={{ color: 'var(--accent)' }}>
          <span className="sym" style={{ color: 'var(--accent)' }}>{sym}</span>
          {label}
        </span>
        <span
          className="ro-value"
          style={{ color: 'var(--accent)', fontSize: 16 }}
        >
          {valueHTML
            ? <span dangerouslySetInnerHTML={{ __html: valueHTML }} />
            : value ?? '—'}
          {unit && <span className="unit"> {unit}</span>}
        </span>
      </div>
    );
  }

  return (
    <div className="readout">
      <span className="ro-label">
        <span className="sym">{sym}</span>
        {label}
      </span>
      <span className="ro-value">
        {valueHTML
          ? <span dangerouslySetInnerHTML={{ __html: valueHTML }} />
          : value ?? '—'}
        {unit && <span className="unit"> {unit}</span>}
      </span>
    </div>
  );
}
