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
        'flex items-start gap-md py-[12px] px-[14px] rounded-5 border border-border-2 bg-color-2 text-color-4 text-[14.5px] leading-[1.55]',
        variant === 'info' && 'border-[rgba(91,174,248,.32)] bg-[rgba(91,174,248,.08)] [&_.banner-icon]:text-blue',
        variant === 'warn' && 'border-accent-glow bg-accent-soft [&_.banner-icon]:text-accent',
        variant === 'success' && 'border-[rgba(108,197,194,.3)] bg-teal-soft [&_.banner-icon]:text-teal',
        variant === 'danger' && 'border-[rgba(255,59,110,.32)] bg-[rgba(255,59,110,.10)] [&_.banner-icon]:text-pink',
        className,
      )}
      role={variant === 'danger' || variant === 'warn' ? 'alert' : 'status'}
    >
      {icon !== undefined && <span className="banner-icon text-[16px] leading-[1.4] shrink-0 mt-[2px]" aria-hidden="true">{icon}</span>}
      <div className="flex-1 min-w-0">{children}</div>
      {onDismiss && (
        <button
          type="button"
          className="appearance-none bg-transparent border-0 text-color-5 text-[20px] leading-none cursor-pointer py-0 px-[4px] self-start hover:text-color-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 focus-visible:shadow-[0_0_0_4px_var(--accent-soft)]"
          onClick={onDismiss}
          aria-label="Dismiss"
        >
          ×
        </button>
      )}
    </div>
  );
}
