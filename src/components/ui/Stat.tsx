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
    <div className={clsx('flex flex-col gap-xs py-[12px] px-[14px] card-surface min-w-0', className)}>
      <div className="eyebrow-muted text-[10.5px]">{label}</div>
      <div className="flex items-baseline gap-[5px]">
        <span
          className={clsx(
            'font-3 text-[22px] font-medium text-color-4 leading-[1.1]',
            accent === 'accent' && 'text-accent',
            accent === 'teal' && 'text-teal',
            accent === 'pink' && 'text-pink',
            accent === 'blue' && 'text-blue',
          )}
        >
          {value}
        </span>
        {unit !== undefined && <span className="font-3 text-[12px] text-color-5">{unit}</span>}
      </div>
      {delta !== undefined && <div className="font-3 text-[11px] text-color-5">{delta}</div>}
    </div>
  );
}
