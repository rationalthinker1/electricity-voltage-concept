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
      className={`formula-block mx-auto max-w-[56ch] text-center border-t border-b border-border relative before:content-[''] before:absolute before:top-1/2 before:w-[8px] before:h-px before:bg-accent before:-translate-y-1/2 before:-left-[8px] after:content-[''] after:absolute after:top-1/2 after:w-[8px] after:h-px after:bg-accent after:-translate-y-1/2 after:-right-[8px] max-[600px]:py-[14px] max-[600px]:px-[18px] ${size === 'small' ? 'my-[24px] py-[12px] px-[24px]' : size === 'large' ? 'my-[36px] py-[28px] px-[36px]' : 'my-[36px] py-[18px] px-[32px]'}`}
      role="math"
    >
      <div className={`formula-content font-4 [font-style:italic] font-normal leading-[1.55] tracking-[.005em] text-text [font-feature-settings:"ss01","lnum"] [&_sub]:text-[.62em] [&_sub]:italic [&_sub]:leading-none [&_sub]:relative [&_sub]:tracking-normal [&_sub]:align-[-.32em] [&_sup]:text-[.62em] [&_sup]:italic [&_sup]:leading-none [&_sup]:relative [&_sup]:tracking-normal [&_sup]:align-[.55em] [&_var]:not-italic [&_.upright]:not-italic [&_.formula-var]:text-accent [&_.formula-var]:italic max-[600px]:text-[24px] ${size === 'small' ? 'text-[22px]' : 'text-[28px]'}`}>
        {children}
      </div>
      {caption && <div className="formula-caption mt-[10px] font-3 text-[10px] tracking-[.2em] uppercase text-text-muted">{caption}</div>}
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
      className={`formula-block mx-auto max-w-[56ch] text-center border-t border-b border-border relative before:content-[''] before:absolute before:top-1/2 before:w-[8px] before:h-px before:bg-accent before:-translate-y-1/2 before:-left-[8px] after:content-[''] after:absolute after:top-1/2 after:w-[8px] after:h-px after:bg-accent after:-translate-y-1/2 after:-right-[8px] max-[600px]:py-[14px] max-[600px]:px-[18px] ${size === 'small' ? 'my-[24px] py-[12px] px-[24px]' : size === 'large' ? 'my-[36px] py-[28px] px-[36px]' : 'my-[36px] py-[18px] px-[32px]'}`}
      role="math"
    >
      <div
        className={`formula-content font-4 [font-style:italic] font-normal leading-[1.55] tracking-[.005em] text-text [font-feature-settings:"ss01","lnum"] [&_sub]:text-[.62em] [&_sub]:italic [&_sub]:leading-none [&_sub]:relative [&_sub]:tracking-normal [&_sub]:align-[-.32em] [&_sup]:text-[.62em] [&_sup]:italic [&_sup]:leading-none [&_sup]:relative [&_sup]:tracking-normal [&_sup]:align-[.55em] [&_var]:not-italic [&_.upright]:not-italic [&_.formula-var]:text-accent [&_.formula-var]:italic max-[600px]:text-[24px] ${size === 'small' ? 'text-[22px]' : 'text-[28px]'}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {caption && <div className="formula-caption mt-[10px] font-3 text-[10px] tracking-[.2em] uppercase text-text-muted">{caption}</div>}
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
