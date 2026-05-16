import { type ReactNode } from 'react';
import { Link, type LinkProps } from '@tanstack/react-router';
import clsx from 'clsx';

/**
 * Hairline-divided 2-column card grid. The grid container shows the
 * border colour through a 1px gap; individual NavCards fill their cell
 * with bg-bg so the gap stays visible. Collapses to 1 column on mobile.
 *
 * Pair with <NavCard> children. Drop-in replacement for the legacy
 * `.card-grid + .nav-item` className combo.
 */
export interface NavCardGridProps {
  children?: ReactNode;
  className?: string;
}

export function NavCardGrid({ children, className }: NavCardGridProps) {
  return (
    <div
      className={clsx(
        'border-border bg-border grid grid-cols-2 gap-px border max-md:grid-cols-1',
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * One cell of a NavCardGrid. Styled as a card surface with a hover
 * background swap and bg-bg base so the grid's 1px gap renders the
 * border colour. Forwards all props to TanStack Router's <Link>
 * (`to`, `params`, etc.).
 */
export type NavCardProps = LinkProps & {
  children?: ReactNode;
  className?: string;
};

export function NavCard({ children, className, ...linkProps }: NavCardProps) {
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- pass through TanStack Router's route-tree-aware generics
    <Link
      {...(linkProps as any)}
      className={clsx(
        'bg-bg px-2xl py-2xl text-text hover:bg-bg-card-hover focus-visible:outline-accent block no-underline transition-colors focus-visible:shadow-[0_0_0_4px_var(--accent-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        className,
      )}
    >
      {children}
    </Link>
  );
}
