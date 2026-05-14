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
        'banner-1',
        variant === 'info' && 'banner-info-1 accent-blue',
        variant === 'warn' && 'banner-warn-1 accent-brand',
        variant === 'success' && 'banner-success-1 accent-teal',
        variant === 'danger' && 'banner-danger-1 accent-pink',
        className,
      )}
      role={variant === 'danger' || variant === 'warn' ? 'alert' : 'status'}
    >
      {icon !== undefined && <span className="banner-icon-1" aria-hidden="true">{icon}</span>}
      <div className="banner-body-1">{children}</div>
      {onDismiss && (
        <button
          type="button"
          className="button-icon-1"
          onClick={onDismiss}
          aria-label="Dismiss"
        >
          ×
        </button>
      )}
    </div>
  );
}
