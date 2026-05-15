/**
 * Block-display equation, rendered via KaTeX.
 *
 * Three call shapes:
 *   <Formula id="coulomb-force" />          // look up from FORMULAS registry
 *   <Formula tex="F = k Q_1 Q_2 / r^2" />   // one-off LaTeX (worked problems)
 *   <Formula>{...JSX...}</Formula>          // legacy JSX path (still works
 *                                              for files not yet migrated)
 *
 * The `id` form is preferred for any equation that has a name and gets
 * referenced more than once across the book. Worked-problem substitutions
 * (one-shot numeric plug-ins inside TryIt answers) belong as `tex`.
 *
 * The plain-text Unicode form from the registry is used as the aria-label
 * so screen readers and copy-paste hand back something readable.
 *
 * Math typography is KaTeX's defaults; styling lives in main.css under the
 * `.formula-tex` and `.formula-content` recipes.
 */
import katex from 'katex';
import { useMemo, type ReactNode } from 'react';

import { FORMULAS, type FormulaId } from '@/lib/formulas';

interface FormulaProps {
  /** Registry id — preferred for named equations. */
  id?: FormulaId;
  /** One-off LaTeX source (used when id isn't set). */
  tex?: string;
  /** Legacy JSX path; only used when neither id nor tex is provided. */
  children?: ReactNode;
  /** Optional small caption under the formula (e.g., source / name). */
  caption?: ReactNode;
  /** Render at the default size (applies when neither large nor small is set). */
  normal?: boolean;
  /** Render at a larger size. */
  large?: boolean;
  /** Render at a smaller size — useful inside FAQ answers etc. */
  small?: boolean;
  /** Optional override for the aria-label / plain-text form. */
  ariaLabel?: string;
}

function blockSizing(large: boolean | undefined, small: boolean | undefined): string {
  if (small) return 'my-xl py-lg px-xl';
  if (large) return 'my-2xl py-lg px-2xl text-8';
  return 'my-2xl py-lg px-2xl';
}

function renderTeX(tex: string, displayMode: boolean): string {
  try {
    return katex.renderToString(tex, {
      displayMode,
      throwOnError: false,
      strict: 'ignore',
      output: 'html',
    });
  } catch (err) {
    return `<span style="color:#ff3b6e">[KaTeX error: ${(err as Error).message}]</span>`;
  }
}

interface ResolvedFormula {
  tex: string;
  plain: string;
}

function resolve(id: FormulaId | undefined, tex: string | undefined, ariaLabel: string | undefined): ResolvedFormula | null {
  if (id) {
    const def = FORMULAS[id];
    if (!def) return null;
    return { tex: def.tex, plain: ariaLabel ?? def.plain };
  }
  if (tex) {
    return { tex, plain: ariaLabel ?? tex };
  }
  return null;
}

export function Formula({ id, tex, children, caption, large, small, ariaLabel }: FormulaProps) {
  const resolved = resolve(id, tex, ariaLabel);
  const html = useMemo(() => (resolved ? renderTeX(resolved.tex, true) : null), [resolved?.tex]);

  return (
    <div
      className={`formula-block mx-auto text-center relative border-t border-b border-border before:content-[''] before:absolute before:top-1/2 before:w-sm before:h-px before:bg-accent before:-translate-y-1/2 before:-left-sm after:content-[''] after:absolute after:top-1/2 after:w-sm after:h-px after:bg-accent after:-translate-y-1/2 after:-right-sm max-sm:py-lg max-sm:px-lg ${blockSizing(large, small)}`}
      role="math"
      aria-label={resolved?.plain}
    >
      {html ? (
        <div className="formula-tex" dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <div className="formula-content">{children}</div>
      )}
      {caption && <div className="formula-caption mt-md eyebrow-muted text-1 tracking-4">{caption}</div>}
    </div>
  );
}


/** Variable accent — slight amber tint to distinguish symbols from operators. */
export function Var({ children }: { children: ReactNode }) {
  return <span className="formula-var text-accent italic">{children}</span>;
}

interface InlineMathProps {
  /** Registry id — preferred for named equations. */
  id?: FormulaId;
  /** One-off LaTeX source. */
  tex?: string;
  /** Legacy JSX path. */
  children?: ReactNode;
  /** Optional override for the aria-label / plain-text form. */
  ariaLabel?: string;
}

/** Inline math — small enough to live inside a sentence. */
export function InlineMath({ id, tex, children, ariaLabel }: InlineMathProps) {
  const resolved = resolve(id, tex, ariaLabel);
  const html = useMemo(() => (resolved ? renderTeX(resolved.tex, false) : null), [resolved?.tex]);

  if (html) {
    return (
      <span
        className="formula-inline"
        aria-label={resolved!.plain}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }
  return <span className="formula-inline">{children}</span>;
}
