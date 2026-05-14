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
      {icon !== undefined && <span className="pill-icon">{icon}</span>}
      <span>{children}</span>
    </>
  );
  const classes = clsx(
    'pill-base',
    variant === 'default' && 'pill-default',
    variant === 'accent' && 'pill-accent',
    variant === 'teal' && 'pill-teal',
    variant === 'pink' && 'pill-pink',
    variant === 'blue' && 'pill-blue',
    variant === 'subtle' && 'pill-subtle',
    interactive && 'pill-interactive',
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

