import type { ReactNode } from 'react';

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
  const classes = ['ui-banner', `ui-banner-${variant}`];
  if (className) classes.push(className);
  return (
    <div className={classes.join(' ')} role={variant === 'danger' || variant === 'warn' ? 'alert' : 'status'}>
      {icon !== undefined && <span className="ui-banner-icon" aria-hidden="true">{icon}</span>}
      <div className="ui-banner-body">{children}</div>
      {onDismiss && (
        <button
          type="button"
          className="ui-banner-close"
          onClick={onDismiss}
          aria-label="Dismiss"
        >
          ×
        </button>
      )}
    </div>
  );
}
