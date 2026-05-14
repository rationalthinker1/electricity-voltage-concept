import type { ReactNode } from 'react';
import clsx from 'clsx';

export type StatAccent = 'accent' | 'teal' | 'pink' | 'blue' | undefined;

export interface StatProps {
  label: ReactNode;
  value: ReactNode;
  unit?: ReactNode;
  delta?: ReactNode;
  accent?: StatAccent;
  className?: string;
}

export function Stat({
  label,
  value,
  unit,
  delta,
  accent,
  className,
}: StatProps) {
  return (
    <div className={clsx('stat-card-1', accent && `accent-${accent === 'accent' ? 'brand' : accent}`, className)}>
      <div className="label-mono-1">{label}</div>
      <div className="inline-baseline-1">
        <span className="stat-value-1">{value}</span>
        {unit !== undefined && <span className="stat-unit-1">{unit}</span>}
      </div>
      {delta !== undefined && <div className="meta-1">{delta}</div>}
    </div>
  );
}
