import type { ReactNode } from 'react';
import clsx from 'clsx';

export type BadgeVariant = 'default' | 'accent' | 'teal' | 'pink' | 'blue' | 'subtle';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children?: ReactNode;
  className?: string;
}

export function Badge({
  variant = 'default',
  size = 'md',
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center font-3 font-medium tracking-2 rounded-3 border border-border-2 bg-color-2 text-text-dim whitespace-nowrap',
        size === 'sm' ? 'text-1 py-xxs px-sm leading-[1.4]' : 'text-3 py-xxs px-md leading-[1.4]',
        variant === 'accent' && 'bg-accent-soft text-accent border-accent-glow',
        variant === 'teal' && 'bg-teal-soft text-teal border-teal/30',
        variant === 'pink' && 'bg-pink/15 text-pink border-pink/30',
        variant === 'blue' && 'bg-blue/15 text-blue border-blue/30',
        variant === 'subtle' && 'bg-transparent text-text-muted border-border-1',
        className,
      )}
    >
      {children}
    </span>
  );
}
