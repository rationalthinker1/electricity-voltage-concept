import type { ReactNode, MouseEventHandler } from 'react';

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
  const classes = ['ui-pill', `ui-pill-${variant}`];
  if (interactive) classes.push('ui-pill-interactive');
  if (className) classes.push(className);

  const content = (
    <>
      {icon !== undefined && <span className="ui-pill-icon">{icon}</span>}
      <span className="ui-pill-label">{children}</span>
    </>
  );

  if (interactive) {
    return (
      <button type="button" className={classes.join(' ')} onClick={onClick} aria-label={ariaLabel}>
        {content}
      </button>
    );
  }
  return <span className={classes.join(' ')}>{content}</span>;
}
