import type { ReactNode } from 'react';
import clsx from 'clsx';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'subtle';
export type CardAccent = 'accent' | 'teal' | 'pink' | 'blue' | undefined;

export interface CardProps {
  variant?: CardVariant;
  accent?: CardAccent;
  header?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function Card({
  variant = 'default',
  accent,
  header,
  footer,
  children,
  className,
}: CardProps) {
  return (
    <div
      className={clsx(
        'card-shell-1',
        variant === 'default' && 'card-shell-default-1',
        variant === 'elevated' && 'card-shell-elevated-1',
        variant === 'outlined' && 'card-shell-outlined-1',
        variant === 'subtle' && 'card-shell-subtle-1',
        accent === 'accent' && 'card-accent-brand',
        accent === 'teal' && 'card-accent-teal',
        accent === 'pink' && 'card-accent-pink',
        accent === 'blue' && 'card-accent-blue',
        className,
      )}
    >
      {header !== undefined && <header className="card-header-1">{header}</header>}
      <div className="card-body-1">{children}</div>
      {footer !== undefined && <footer className="card-footer-1">{footer}</footer>}
    </div>
  );
}
