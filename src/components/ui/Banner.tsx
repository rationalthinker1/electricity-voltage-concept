import type { ReactNode } from 'react';
import clsx from 'clsx';
import { tv, type VariantProps } from 'tailwind-variants';

import { IconButton } from './IconButton';

/**
 * Banner variant table — keyed off semantic role. `root` carries the
 * border + bg tint; `icon` carries the matching foreground colour.
 * Static structural classes (flex, gap, padding, radius, border) live
 * inline at the JSX.
 */
const bannerVariants = tv({
  slots: { root: '', icon: '' },
  variants: {
    variant: {
      info: { root: 'border-blue/30 bg-blue/10', icon: 'text-blue' },
      warn: { root: 'border-accent-glow bg-accent-soft', icon: 'text-accent' },
      success: { root: 'border-teal/30 bg-teal-soft', icon: 'text-teal' },
      danger: { root: 'border-pink/30 bg-pink/10', icon: 'text-pink' },
    },
  },
  defaultVariants: { variant: 'info' },
});

type BannerVariantProps = VariantProps<typeof bannerVariants>;

export type BannerVariant = NonNullable<BannerVariantProps['variant']>;

export interface BannerProps extends BannerVariantProps {
  icon?: ReactNode;
  children?: ReactNode;
  onDismiss?: () => void;
  className?: string;
}

export function Banner({ variant, icon, children, onDismiss, className }: BannerProps) {
  const { root, icon: iconSlot } = bannerVariants({ variant });
  const effectiveVariant = variant ?? 'info';
  return (
    <div
      className={root({
        class: clsx(
          'gap-md py-lg px-lg rounded-5 border-border-2 bg-bg-elevated text-text text-5 flex items-start border leading-4',
          className,
        ),
      })}
      role={effectiveVariant === 'danger' || effectiveVariant === 'warn' ? 'alert' : 'status'}
    >
      {icon !== undefined && (
        <span
          className={iconSlot({ class: 'banner-icon text-6 mt-xxs shrink-0 leading-3' })}
          aria-hidden="true"
        >
          {icon}
        </span>
      )}
      <div className="min-w-0 flex-1">{children}</div>
      {onDismiss && (
        <IconButton
          className="text-7 px-sm self-start border-0 py-0"
          onClick={onDismiss}
          aria-label="Dismiss"
        >
          ×
        </IconButton>
      )}
    </div>
  );
}
