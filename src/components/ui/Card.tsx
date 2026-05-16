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
        'rounded-6 bg-bg-card border-border-1 flex flex-col overflow-hidden border',
        variant === 'elevated' && 'bg-bg-elevated border-border-2 shadow-2',
        variant === 'outlined' && 'border-border-2 bg-transparent',
        variant === 'subtle' && 'border-border-1 border-dashed bg-transparent',
        accent === 'accent' && 'border-l-accent border-l-3',
        accent === 'teal' && 'border-l-teal border-l-3',
        accent === 'pink' && 'border-l-pink border-l-3',
        accent === 'blue' && 'border-l-blue border-l-3',
        '[&_button:focus-visible]:outline-accent [&_button:focus-visible]:shadow-[0_0_0_4px_var(--accent-soft)] [&_button:focus-visible]:outline [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-offset-2',
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
