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
  return (
    <div className={`flex justify-between items-baseline gap-[14px] ${highlight ? 'bg-accent-soft -mx-[28px] my-[8px] py-[14px] px-[28px] border-0' : 'py-[14px] border-b border-border last:border-b-0'}`}>
      <span className={`font-1 text-[13px] ${highlight ? 'text-accent' : 'text-text-dim'}`}>
        <span className={`font-2 italic text-[16px] mr-[4px] ${highlight ? 'text-accent' : 'text-teal'}`}>{sym}</span>
        {label}
      </span>
      <span className={`font-3 text-right tracking-[.02em] whitespace-nowrap [&_sub]:text-[.7em] [&_sub]:leading-none [&_sub]:font-3 [&_sub]:align-[-.35em] [&_sup]:text-[.7em] [&_sup]:leading-none [&_sup]:font-3 [&_sup]:align-[.45em] ${highlight ? 'text-accent text-[16px]' : 'text-text text-[14px]'}`}>
        {valueHTML
          ? <span dangerouslySetInnerHTML={{ __html: valueHTML }} />
          : value ?? '—'}
        {unit && <span className="text-text-muted text-[11px] ml-[4px] tracking-[.08em]"> {unit}</span>}
      </span>
    </div>
  );
}
