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
    <div className={clsx('flex flex-col gap-xs py-lg px-lg card-surface min-w-0', className)}>
      <div className="eyebrow-muted text-1">{label}</div>
      <div className="flex items-baseline gap-xs">
        <span
          className={clsx(
            'font-3 text-8 font-medium text-text leading-1',
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
