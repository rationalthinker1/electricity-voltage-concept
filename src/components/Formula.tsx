/**
 * Block-display equation.
 *
 * Replaces ad-hoc <p className="math">F = ...</p> blocks with a styled,
 * centered formula card that handles sub/superscripts properly. Variables
 * can use <Var/> for a subtle amber tint; operators stay text-colored.
 *
 *   <Formula>{...JSX with <Var/>, <sub/>, <sup/>...}</Formula>
 *
 *   <Formula caption="Coulomb's law (1785)">
 *     <Var>F</Var> = k <Var>Q</Var><sub>1</sub><Var>Q</Var><sub>2</sub> /{' '}
 *     <Var>r</Var><sup>2</sup>
 *   </Formula>
 *
 * Math typography for sub/sup/var lives in .formula-content and
 * .formula-inline recipes in main.css. These class names are also
 * descendant-selector hooks so parent contexts (TryIt, CaseStudy) can
 * override layout via [&_.formula-block]: rules.
 */
import type { ReactNode } from 'react';

type FormulaSize = 'normal' | 'small' | 'large';

interface FormulaProps {
  /** The equation. Use <Var/>, <sub/>, <sup/> for nice typography. */
  children: ReactNode;
  /** Optional small caption under the formula (e.g., source / name). */
  caption?: ReactNode;
  /** If set, render at a smaller size — useful inside FAQ answers etc. */
  size?: FormulaSize;
}

function blockSizing(size: FormulaSize): string {
  if (size === 'small') return 'my-xl py-lg px-xl';
  if (size === 'large') return 'my-2xl py-2xl px-2xl';
  return 'my-2xl py-lg px-2xl';
}

export function Formula({ children, caption, size = 'normal' }: FormulaProps) {
  return (
    <div
      className={`formula-block mx-auto text-center relative border-t border-b border-border before:content-[''] before:absolute before:top-1/2 before:w-sm before:h-px before:bg-accent before:-translate-y-1/2 before:-left-sm after:content-[''] after:absolute after:top-1/2 after:w-sm after:h-px after:bg-accent after:-translate-y-1/2 after:-right-sm max-sm:py-lg max-sm:px-lg ${blockSizing(size)}`}
      role="math"
    >
      <div className="formula-content">
        {children}
      </div>
      {caption && <div className="formula-caption mt-md eyebrow-muted text-1 tracking-4">{caption}</div>}
    </div>
  );
}


/** Variable accent — slight amber tint to distinguish symbols from operators. */
export function Var({ children }: { children: ReactNode }) {
  return <span className="formula-var text-accent italic">{children}</span>;
}

/** Inline math — small enough to live inside a sentence. */
export function InlineMath({ children }: { children: ReactNode }) {
  return (
    <span className="formula-inline">
      {children}
    </span>
  );
}
