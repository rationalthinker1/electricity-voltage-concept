import type { ReactNode, MouseEventHandler } from 'react';
import clsx from 'clsx';
import { tv, type VariantProps } from 'tailwind-variants';

/**
 * Pill variant table — colour + interactive dials. Static layout
 * (inline-flex, gap, font, padding, rounded-pill, border) lives inline
 * at JSX. `interactive` adds hover/active/focus behaviour and switches
 * the rendered element from <span> to <button>.
 */
const pillVariants = tv({
  variants: {
    variant: {
      default: '',
      accent: 'bg-accent-soft text-accent border-accent-glow',
      teal: 'bg-teal-soft text-teal border-teal/30',
      pink: 'bg-pink/15 text-pink border-pink/30',
      blue: 'bg-blue/15 text-blue border-blue/30',
      subtle: 'bg-transparent text-text-muted border-border-1',
    },
    interactive: {
      true: 'cursor-pointer transition-[background-color,border-color,transform] duration-fast ease-in-out hover:bg-bg-card-hover hover:border-border-2 active:translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 focus-visible:shadow-[0_0_0_4px_var(--accent-soft)]',
      false: '',
    },
  },
  defaultVariants: { variant: 'default', interactive: false },
});

type PillVariantProps = VariantProps<typeof pillVariants>;

export type PillVariant = NonNullable<PillVariantProps['variant']>;

export interface PillProps extends PillVariantProps {
  icon?: ReactNode;
  children?: ReactNode;
  onClick?: MouseEventHandler<HTMLElement>;
  className?: string;
  'aria-label'?: string;
}

export function Pill({
  variant,
  interactive,
  icon,
  children,
  onClick,
  className,
  'aria-label': ariaLabel,
}: PillProps) {
  const classes = clsx(
    'inline-flex items-center gap-sm font-3 text-4 tracking-2 py-sm px-lg rounded-pill border border-border-2 bg-bg-elevated text-text no-underline',
    pillVariants({ variant, interactive }),
    className,
  );

  const content = (
    <>
      {icon !== undefined && (
        <span className="text-5 inline-flex leading-none opacity-80">{icon}</span>
      )}
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
