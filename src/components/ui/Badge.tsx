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

export function Badge({ variant = 'default', size = 'md', children, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'font-3 tracking-2 rounded-3 border-border-2 bg-bg-elevated text-text-dim inline-flex items-center border font-medium whitespace-nowrap',
        size === 'sm' ? 'text-1 py-xxs px-sm leading-3' : 'text-3 py-xxs px-md leading-3',
        variant === 'accent' && 'bg-accent-soft text-accent border-accent-glow',
        variant === 'teal' && 'bg-teal-soft text-teal border-teal/30',
        variant === 'pink' && 'bg-pink/15 text-pink border-pink/30',
        variant === 'blue' && 'bg-blue/15 text-blue border-blue/30',
        variant === 'subtle' && 'text-text-muted border-border-1 bg-transparent',
        className,
      )}
    >
      {children}
    </span>
  );
}
