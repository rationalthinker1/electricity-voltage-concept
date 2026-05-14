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
        'banner-base',
        variant === 'info' && 'banner-info',
        variant === 'warn' && 'banner-warn',
        variant === 'success' && 'banner-success',
        variant === 'danger' && 'banner-danger',
        className,
      )}
      role={variant === 'danger' || variant === 'warn' ? 'alert' : 'status'}
    >
      {icon !== undefined && <span className="banner-icon" aria-hidden="true">{icon}</span>}
      <div className="banner-body">{children}</div>
      {onDismiss && (
        <button
          type="button"
          className="button-icon"
          onClick={onDismiss}
          aria-label="Dismiss"
        >
          ×
        </button>
      )}
    </div>
  );
}

