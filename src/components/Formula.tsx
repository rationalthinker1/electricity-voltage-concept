/**
 * Block-display equation.
 *
 * Replaces ad-hoc <p className="math">F = ...</p> blocks with a styled,
 * centered formula card that handles sub/superscripts properly. Variables
 * can use <Var/> for a subtle amber tint; operators stay text-colored.
 *
 * Two usage modes:
 *
 *   <Formula>{...JSX with <Var/>, <sub/>, <sup/>...}</Formula>
 *
 *   <Formula caption="Coulomb's law (1785)">
 *     <Var>F</Var> = k <Var>Q</Var><sub>1</sub><Var>Q</Var><sub>2</sub> /{' '}
 *     <Var>r</Var><sup>2</sup>
 *   </Formula>
 *
 *   <FormulaHTML html="..." />   ←  legacy escape hatch
 */
import type { ReactNode } from 'react';
import clsx from 'clsx';

interface FormulaProps {
  /** The equation. Use <Var/>, <sub/>, <sup/> for nice typography. */
  children: ReactNode;
  /** Optional small caption under the formula (e.g., source / name). */
  caption?: ReactNode;
  /** If set, render at a smaller size — useful inside FAQ answers etc. */
  size?: 'normal' | 'small' | 'large';
}

export function Formula({ children, caption, size = 'normal' }: FormulaProps) {
  return (
    <div className={clsx('equation-card-1 accent-brand', size !== 'normal' && `equation-${size}-1`)} role="math">
      <div className="equation-content-1">{children}</div>
      {caption && <div className="caption-mono-1">{caption}</div>}
    </div>
  );
}

interface FormulaHTMLProps {
  html: string;
  caption?: ReactNode;
  size?: 'normal' | 'small' | 'large';
}

/** Escape hatch — render an HTML string. Use sparingly; prefer JSX. */
export function FormulaHTML({ html, caption, size = 'normal' }: FormulaHTMLProps) {
  return (
    <div className={clsx('equation-card-1 accent-brand', size !== 'normal' && `equation-${size}-1`)} role="math">
      <div className="equation-content-1" dangerouslySetInnerHTML={{ __html: html }} />
      {caption && <div className="caption-mono-1">{caption}</div>}
    </div>
  );
}

/** Variable accent — slight amber tint to distinguish symbols from operators. */
export function Var({ children }: { children: ReactNode }) {
  return <span className="equation-var-1">{children}</span>;
}

/** Inline math — small enough to live inside a sentence. */
export function InlineMath({ children }: { children: ReactNode }) {
  return <span className="equation-inline-1">{children}</span>;
}
