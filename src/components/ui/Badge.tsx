import type { ReactNode } from 'react';

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
  const classes = ['ui-badge', `ui-badge-${variant}`, `ui-badge-${size}`];
  if (className) classes.push(className);
  return <span className={classes.join(' ')}>{children}</span>;
}
