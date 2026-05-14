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
        'card-base',
        variant === 'default' && 'card-primary',
        variant === 'elevated' && 'card-elevated',
        variant === 'outlined' && 'card-outlined',
        variant === 'subtle' && 'card-subtle',
        accent === 'accent' && 'card-accent-brand',
        accent === 'teal' && 'card-accent-teal',
        accent === 'pink' && 'card-accent-pink',
        accent === 'blue' && 'card-accent-blue',
        className,
      )}
    >
      {header !== undefined && <header className="card-header">{header}</header>}
      <div className="card-body">{children}</div>
      {footer !== undefined && <footer className="card-footer">{footer}</footer>}
    </div>
  );
}

