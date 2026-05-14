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
  return <span className={clsx('chip', `chip-${variant}`, `chip-${size}`, className)}>{children}</span>;
}
