import type { ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';

/**
 * Readout variant table — `highlight` flips the whole row from a quiet
 * border-bottom strip into an accent-tinted "punchline" callout. Each
 * slot carries the differentiating utilities; static layout (flex
 * baseline + gap) stays inline at the JSX root.
 */
const readoutVariants = tv({
  slots: {
    root: '',
    label: '',
    sym: '',
    value: '',
  },
  variants: {
    highlight: {
      true: {
        root: 'bg-accent-soft -mx-2xl my-md py-lg px-2xl border-0',
        label: 'text-accent',
        sym: 'text-accent',
        value: 'text-accent text-6',
      },
      false: {
        root: 'py-lg border-border border-b last:border-b-0',
        label: 'text-text-dim',
        sym: 'text-teal',
        value: 'text-text text-5',
      },
    },
  },
  defaultVariants: { highlight: false },
});

type ReadoutVariantProps = VariantProps<typeof readoutVariants>;

export interface ReadoutProps extends ReadoutVariantProps {
  /** Greek letter or variable name shown in italic before the label */
  sym: ReactNode;
  /** Plain-text or JSX label */
  label: ReactNode;
  /** Numeric value as JSX (use prettyJsx() / sciJsx() / engJsx() from
   *  @/lib/physics for proper sub/sup typography) */
  value?: ReactNode;
  /** Unit string */
  unit?: string;
}

/**
 * Output readout. Two variants: normal (border-bottom row) and highlighted
 * (the lab's punchline number — accent background + amber).
 */
export function Readout({ sym, label, value, unit, highlight }: ReadoutProps) {
  const slots = readoutVariants({ highlight });
  return (
    <div className={slots.root({ class: 'gap-md flex items-baseline justify-between' })}>
      <span className={slots.label({ class: 'font-1 text-4' })}>
        <span className={slots.sym({ class: 'font-2 text-6 mr-sm italic' })}>{sym}</span>
        {label}
      </span>
      <span
        className={slots.value({ class: 'font-3 text-right tracking-normal whitespace-nowrap' })}
      >
        {value ?? '—'}
        {unit && <span className="text-text-muted text-2 ml-sm tracking-3"> {unit}</span>}
      </span>
    </div>
  );
}
