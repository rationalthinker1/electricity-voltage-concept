import type { ReactNode } from 'react';

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
  const classes = ['ui-stat'];
  if (accent) classes.push(`ui-stat-${accent}`);
  if (className) classes.push(className);
  return (
    <div className={classes.join(' ')}>
      <div className="ui-stat-label">{label}</div>
      <div className="ui-stat-value-row">
        <span className="ui-stat-value">{value}</span>
        {unit !== undefined && <span className="ui-stat-unit">{unit}</span>}
      </div>
      {delta !== undefined && <div className="ui-stat-delta">{delta}</div>}
    </div>
  );
}
