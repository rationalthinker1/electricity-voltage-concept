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
 *
 * Note: the legacy classNames `formula-block`, `formula-content`,
 * `formula-var`, `formula-caption`, `formula-inline` are kept on the
 * elements alongside inline Tailwind so chapter / case-study / tryit
 * narrative descendant selectors (`[&_.formula-block]:...`) keep
 * matching and applying their context-specific overrides.
 */
import type { ReactNode } from 'react';

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
    <div
      className={`formula-block mx-auto max-w-col text-center border-t border-b border-border relative before:content-[''] before:absolute before:top-1/2 before:w-sm before:h-px before:bg-accent before:-translate-y-1/2 before:-left-[8px] after:content-[''] after:absolute after:top-1/2 after:w-sm after:h-px after:bg-accent after:-translate-y-1/2 after:-right-[8px] max-sm:py-lg max-sm:px-lg ${size === 'small' ? 'my-xl py-lg px-xl' : size === 'large' ? 'my-2xl py-2xl px-2xl' : 'my-2xl py-lg px-2xl'}`}
      role="math"
    >
      <div className={`formula-content font-4 [font-style:italic] font-normal leading-[1.55] tracking-normal text-text [font-feature-settings:"ss01","lnum"] [&_sub]:text-[.62em] [&_sub]:italic [&_sub]:leading-none [&_sub]:relative [&_sub]:tracking-normal [&_sub]:align-[-.32em] [&_sup]:text-[.62em] [&_sup]:italic [&_sup]:leading-none [&_sup]:relative [&_sup]:tracking-normal [&_sup]:align-[.55em] [&_var]:not-italic [&_.upright]:not-italic [&_.formula-var]:text-accent [&_.formula-var]:italic max-sm:text-8 ${size === 'small' ? 'text-8' : 'text-8'}`}>
        {children}
      </div>
      {caption && <div className="formula-caption mt-md font-3 text-1 tracking-4 uppercase text-text-muted">{caption}</div>}
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
    <div
      className={`formula-block mx-auto max-w-col text-center border-t border-b border-border relative before:content-[''] before:absolute before:top-1/2 before:w-sm before:h-px before:bg-accent before:-translate-y-1/2 before:-left-[8px] after:content-[''] after:absolute after:top-1/2 after:w-sm after:h-px after:bg-accent after:-translate-y-1/2 after:-right-[8px] max-sm:py-lg max-sm:px-lg ${size === 'small' ? 'my-xl py-lg px-xl' : size === 'large' ? 'my-2xl py-2xl px-2xl' : 'my-2xl py-lg px-2xl'}`}
      role="math"
    >
      <div
        className={`formula-content font-4 [font-style:italic] font-normal leading-[1.55] tracking-normal text-text [font-feature-settings:"ss01","lnum"] [&_sub]:text-[.62em] [&_sub]:italic [&_sub]:leading-none [&_sub]:relative [&_sub]:tracking-normal [&_sub]:align-[-.32em] [&_sup]:text-[.62em] [&_sup]:italic [&_sup]:leading-none [&_sup]:relative [&_sup]:tracking-normal [&_sup]:align-[.55em] [&_var]:not-italic [&_.upright]:not-italic [&_.formula-var]:text-accent [&_.formula-var]:italic max-sm:text-8 ${size === 'small' ? 'text-8' : 'text-8'}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {caption && <div className="formula-caption mt-md font-3 text-1 tracking-4 uppercase text-text-muted">{caption}</div>}
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
    <span className="formula-inline font-4 italic text-[1.05em] text-text whitespace-nowrap [font-feature-settings:'lnum'] [&_var]:not-italic [&_.upright]:not-italic [&_sub]:text-[.65em] [&_sub]:leading-none [&_sub]:align-[-.35em] [&_sup]:text-[.65em] [&_sup]:leading-none [&_sup]:align-[.5em]">
      {children}
    </span>
  );
}
