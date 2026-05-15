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
        'inline-flex items-center font-3 font-medium tracking-[.04em] rounded-3 border border-border-2 bg-color-2 text-color-5 whitespace-nowrap',
        size === 'sm' ? 'text-[10.5px] py-[2px] px-[6px] leading-[1.4]' : 'text-[12px] py-[3px] px-[8px] leading-[1.4]',
        variant === 'accent' && 'bg-accent-soft text-accent border-accent-glow',
        variant === 'teal' && 'bg-teal-soft text-teal border-[rgba(108,197,194,.3)]',
        variant === 'pink' && 'bg-[rgba(255,59,110,.14)] text-pink border-[rgba(255,59,110,.32)]',
        variant === 'blue' && 'bg-[rgba(91,174,248,.14)] text-blue border-[rgba(91,174,248,.32)]',
        variant === 'subtle' && 'bg-transparent text-text-muted border-border-1',
        className,
      )}
    >
      {children}
    </span>
  );
}
