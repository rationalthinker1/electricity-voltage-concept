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
  const content = (
    <>
      {icon !== undefined && <span className="pill-icon-1">{icon}</span>}
      <span>{children}</span>
    </>
  );
  const classes = clsx(
    'pill-1',
    variant === 'default' && 'pill-default-1',
    variant === 'accent' && 'pill-accent-1',
    variant === 'teal' && 'pill-teal-1',
    variant === 'pink' && 'pill-pink-1',
    variant === 'blue' && 'pill-blue-1',
    variant === 'subtle' && 'pill-subtle-1',
    interactive && 'pill-interactive-1',
    className,
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
