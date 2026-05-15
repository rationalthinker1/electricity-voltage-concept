import type { ReactNode } from 'react';
import clsx from 'clsx';

export type BannerVariant = 'info' | 'warn' | 'success' | 'danger';

export interface BannerProps {
  variant?: BannerVariant;
  icon?: ReactNode;
  children?: ReactNode;
  onDismiss?: () => void;
  className?: string;
}

export function Banner({
  variant = 'info',
  icon,
  children,
  onDismiss,
  className,
}: BannerProps) {
  return (
    <div
      className={clsx(
        'flex items-start gap-md py-lg px-lg rounded-5 border border-border-2 bg-bg-elevated text-text text-5 leading-4',
        variant === 'info' && 'border-blue/30 bg-blue/10 [&_.banner-icon]:text-blue',
        variant === 'warn' && 'border-accent-glow bg-accent-soft [&_.banner-icon]:text-accent',
        variant === 'success' && 'border-teal/30 bg-teal-soft [&_.banner-icon]:text-teal',
        variant === 'danger' && 'border-pink/30 bg-pink/10 [&_.banner-icon]:text-pink',
        className,
      )}
      role={variant === 'danger' || variant === 'warn' ? 'alert' : 'status'}
    >
      {icon !== undefined && <span className="banner-icon text-6 leading-3 shrink-0 mt-xxs" aria-hidden="true">{icon}</span>}
      <div className="flex-1 min-w-0">{children}</div>
      {onDismiss && (
        <button
          type="button"
          className="icon-btn border-0 text-7 py-0 px-sm self-start"
          onClick={onDismiss}
          aria-label="Dismiss"
        >
          ×
        </button>
      )}
    </div>
  );
}
