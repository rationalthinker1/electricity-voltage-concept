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
    <div className={clsx('card-formula', size !== 'normal' && (size === 'small' ? 'my-[24px] py-md px-xl text-[22px]' : 'py-[28px] px-[36px] text-[40px]'))} role="math">
      <div className="text-formula">{children}</div>
      {caption && <div className="mt-[10px] font-mono text-[10px] tracking-[.2em] uppercase text-color-text-muted">{caption}</div>}
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
    <div className={clsx('card-formula', size !== 'normal' && (size === 'small' ? 'my-[24px] py-md px-xl text-[22px]' : 'py-[28px] px-[36px] text-[40px]'))} role="math">
      <div className="text-formula" dangerouslySetInnerHTML={{ __html: html }} />
      {caption && <div className="mt-[10px] font-mono text-[10px] tracking-[.2em] uppercase text-color-text-muted">{caption}</div>}
    </div>
  );
}

/** Variable accent — slight amber tint to distinguish symbols from operators. */
export function Var({ children }: { children: ReactNode }) {
  return <span className="text-formula-var">{children}</span>;
}

/** Inline math — small enough to live inside a sentence. */
export function InlineMath({ children }: { children: ReactNode }) {
  return <span className="text-formula-inline">{children}</span>;
}

