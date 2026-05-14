import type { ReactNode } from 'react';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'subtle';
export type CardAccent = 'accent' | 'teal' | 'pink' | 'blue' | undefined;

export interface CardProps {
  variant?: CardVariant;
  accent?: CardAccent;
  header?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function Card({
  variant = 'default',
  accent,
  header,
  footer,
  children,
  className,
}: CardProps) {
  const classes = ['ui-card', `ui-card-${variant}`];
  if (accent) classes.push(`ui-card-accent-${accent}`);
  if (className) classes.push(className);
  return (
    <div className={classes.join(' ')}>
      {header !== undefined && <header className="ui-card-header">{header}</header>}
      <div className="ui-card-body">{children}</div>
      {footer !== undefined && <footer className="ui-card-footer">{footer}</footer>}
    </div>
  );
}
