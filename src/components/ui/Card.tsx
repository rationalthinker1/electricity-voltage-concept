import type { ReactNode } from 'react';
import clsx from 'clsx';
import { tv, type VariantProps } from 'tailwind-variants';

/**
 * Card variant table — two axes:
 *   variant: bg/border surface intensity (default | elevated | outlined | subtle)
 *   accent:  optional 3-px left-edge color stripe
 * Static structural classes (rounded, flex column, overflow, focus rings)
 * live inline at the JSX site.
 */
const cardVariants = tv({
  variants: {
    variant: {
      default: '',
      elevated: 'bg-bg-elevated border-border-2 shadow-2',
      outlined: 'border-border-2 bg-transparent',
      subtle: 'border-border-1 border-dashed bg-transparent',
    },
    accent: {
      accent: 'border-l-accent border-l-3',
      teal: 'border-l-teal border-l-3',
      pink: 'border-l-pink border-l-3',
      blue: 'border-l-blue border-l-3',
    },
  },
  defaultVariants: { variant: 'default' },
});

type CardVariantProps = VariantProps<typeof cardVariants>;

export type CardVariant = NonNullable<CardVariantProps['variant']>;
export type CardAccent = NonNullable<CardVariantProps['accent']>;

export interface CardProps extends CardVariantProps {
  header?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function Card({ variant, accent, header, footer, children, className }: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-6 bg-bg-card border-border-1 flex flex-col overflow-hidden border',
        '[&_button:focus-visible]:outline-accent [&_button:focus-visible]:shadow-[0_0_0_4px_var(--accent-soft)] [&_button:focus-visible]:outline [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-offset-2',
        cardVariants({ variant, accent }),
        className,
      )}
    >
      {header !== undefined && (
        <header className="py-lg px-lg border-border-1 eyebrow-dim text-3 tracking-3 border-b">
          {header}
        </header>
      )}
      <div className="p-lg text-text">{children}</div>
      {footer !== undefined && (
        <footer className="py-lg px-lg border-border-1 text-4 text-text-muted border-t">
          {footer}
        </footer>
      )}
    </div>
  );
}
