import type { ReactNode } from 'react';
import clsx from 'clsx';
import { tv, type VariantProps } from 'tailwind-variants';

/**
 * Stat-value accent table. The value text is amber/teal/pink/blue when
 * `accent` is set, otherwise inherits text-text from the static base.
 */
const statValueVariants = tv({
  variants: {
    accent: {
      accent: 'text-accent',
      teal: 'text-teal',
      pink: 'text-pink',
      blue: 'text-blue',
    },
  },
});

type StatVariantProps = VariantProps<typeof statValueVariants>;

export type StatAccent = NonNullable<StatVariantProps['accent']>;

export interface StatProps extends StatVariantProps {
  label: ReactNode;
  value: ReactNode;
  unit?: ReactNode;
  delta?: ReactNode;
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
            statValueVariants({ accent }),
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
