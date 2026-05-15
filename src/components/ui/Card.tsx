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
        'rounded-6 bg-color-3 border border-border-1 overflow-hidden flex flex-col',
        variant === 'elevated' && 'bg-color-2 border-border-2 shadow-2',
        variant === 'outlined' && 'bg-transparent border-border-2',
        variant === 'subtle' && 'bg-transparent border-dashed border-border-1',
        accent === 'accent' && 'border-l-[3px] border-l-accent',
        accent === 'teal' && 'border-l-[3px] border-l-teal',
        accent === 'pink' && 'border-l-[3px] border-l-pink',
        accent === 'blue' && 'border-l-[3px] border-l-blue',
        '[&_button:focus-visible]:outline [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-accent [&_button:focus-visible]:outline-offset-2 [&_button:focus-visible]:shadow-[0_0_0_4px_var(--accent-soft)]',
        className,
      )}
    >
      {header !== undefined && (
        <header className="py-[14px] px-[18px] border-b border-border-1 eyebrow-dim text-[12px] tracking-[.08em]">
          {header}
        </header>
      )}
      <div className="p-[18px] text-color-4">{children}</div>
      {footer !== undefined && (
        <footer className="py-[12px] px-[18px] border-t border-border-1 text-[13px] text-text-muted">
          {footer}
        </footer>
      )}
    </div>
  );
}
