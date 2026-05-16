import type { ReactNode } from 'react';
import clsx from 'clsx';
import { tv, type VariantProps } from 'tailwind-variants';

/**
 * Variant table — colour + size dials only. Static structural classes
 * (inline-flex, border, font, whitespace) live inline at the JSX site.
 */
const badgeVariants = tv({
  variants: {
    variant: {
      default: '',
      accent: 'bg-accent-soft text-accent border-accent-glow',
      teal: 'bg-teal-soft text-teal border-teal/30',
      pink: 'bg-pink/15 text-pink border-pink/30',
      blue: 'bg-blue/15 text-blue border-blue/30',
      subtle: 'text-text-muted border-border-1 bg-transparent',
    },
    size: {
      sm: 'text-1 py-xxs px-sm leading-3',
      md: 'text-3 py-xxs px-md leading-3',
    },
  },
  defaultVariants: { variant: 'default', size: 'md' },
});

type BadgeVariantProps = VariantProps<typeof badgeVariants>;

export type BadgeVariant = NonNullable<BadgeVariantProps['variant']>;
export type BadgeSize = NonNullable<BadgeVariantProps['size']>;

export interface BadgeProps extends BadgeVariantProps {
  children?: ReactNode;
  className?: string;
}

export function Badge({ variant, size, children, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'font-3 tracking-2 rounded-3 border-border-2 bg-bg-elevated text-text-dim inline-flex items-center border font-medium whitespace-nowrap',
        badgeVariants({ variant, size }),
        className,
      )}
    >
      {children}
    </span>
  );
}
