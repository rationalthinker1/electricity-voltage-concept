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

export function Banner({ variant = 'info', icon, children, onDismiss, className }: BannerProps) {
  return (
    <div
      className={clsx(
        'gap-md py-lg px-lg rounded-5 border-border-2 bg-bg-elevated text-text text-5 flex items-start border leading-4',
        variant === 'info' && 'border-blue/30 bg-blue/10',
        variant === 'warn' && 'border-accent-glow bg-accent-soft',
        variant === 'success' && 'border-teal/30 bg-teal-soft',
        variant === 'danger' && 'border-pink/30 bg-pink/10',
        className,
      )}
      role={variant === 'danger' || variant === 'warn' ? 'alert' : 'status'}
    >
      {icon !== undefined && (
        <span
          className={clsx(
            'banner-icon text-6 mt-xxs shrink-0 leading-3',
            variant === 'info' && 'text-blue',
            variant === 'warn' && 'text-accent',
            variant === 'success' && 'text-teal',
            variant === 'danger' && 'text-pink',
          )}
          aria-hidden="true"
        >
          {icon}
        </span>
      )}
      <div className="min-w-0 flex-1">{children}</div>
      {onDismiss && (
        <button
          type="button"
          className="icon-btn text-7 px-sm self-start border-0 py-0"
          onClick={onDismiss}
          aria-label="Dismiss"
        >
          ×
        </button>
      )}
    </div>
  );
}
