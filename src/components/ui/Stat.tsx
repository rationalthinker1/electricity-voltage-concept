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

export function Stat({ label, value, unit, delta, accent, className }: StatProps) {
  return (
    <div className={clsx('gap-xs py-lg px-lg card-surface flex min-w-0 flex-col', className)}>
      <div className="eyebrow-muted text-1">{label}</div>
      <div className="gap-xs flex items-baseline">
        <span
          className={clsx(
            'font-3 text-8 text-text leading-1 font-medium',
            accent === 'accent' && 'text-accent',
            accent === 'teal' && 'text-teal',
            accent === 'pink' && 'text-pink',
            accent === 'blue' && 'text-blue',
          )}
        >
          {value}
        </span>
        {unit !== undefined && <span className="font-3 text-3 text-text-dim">{unit}</span>}
      </div>
      {delta !== undefined && <div className="font-3 text-2 text-text-dim">{delta}</div>}
    </div>
  );
}
