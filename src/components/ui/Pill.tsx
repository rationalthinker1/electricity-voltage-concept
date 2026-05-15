import type { ReactNode, MouseEventHandler } from 'react';
import clsx from 'clsx';

export type PillVariant = 'default' | 'accent' | 'teal' | 'pink' | 'blue' | 'subtle';

export interface PillProps {
  variant?: PillVariant;
  interactive?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
  onClick?: MouseEventHandler<HTMLElement>;
  className?: string;
  'aria-label'?: string;
}

export function Pill({
  variant = 'default',
  interactive = false,
  icon,
  children,
  onClick,
  className,
  'aria-label': ariaLabel,
}: PillProps) {
  const classes = clsx(
    'inline-flex items-center gap-[6px] font-3 text-[13px] tracking-[.03em] py-[5px] px-[12px] rounded-pill border border-border-2 bg-color-2 text-color-4 no-underline',
    variant === 'accent' && 'bg-accent-soft text-accent border-accent-glow',
    variant === 'teal' && 'bg-teal-soft text-teal border-[rgba(108,197,194,.3)]',
    variant === 'pink' && 'bg-[rgba(255,59,110,.14)] text-pink border-[rgba(255,59,110,.32)]',
    variant === 'blue' && 'bg-[rgba(91,174,248,.14)] text-blue border-[rgba(91,174,248,.32)]',
    variant === 'subtle' && 'bg-transparent text-text-muted border-border-1',
    interactive && 'cursor-pointer transition-[background-color,border-color,transform] duration-[120ms] ease-in-out hover:bg-bg-card-hover hover:border-border-2 active:translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 focus-visible:shadow-[0_0_0_4px_var(--accent-soft)]',
    className,
  );

  const content = (
    <>
      {icon !== undefined && <span className="inline-flex text-[14px] leading-none opacity-80">{icon}</span>}
      <span>{children}</span>
    </>
  );

  if (interactive) {
    return (
      <button type="button" className={classes} onClick={onClick} aria-label={ariaLabel}>
        {content}
      </button>
    );
  }
  return <span className={classes}>{content}</span>;
}
