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
import clsx from 'clsx';
import katex from 'katex';
import { useMemo, type ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';

import { FORMULAS, type FormulaId } from '@/lib/formulas';

/**
 * Variant table — size dial only. Static structural classes (centering,
 * borders, accent ticks) live inline at the JSX so you can read them on
 * the element. `lg` also tints the inner tex slot amber.
 */
const formulaVariants = tv({
  slots: {
    root: '',
    tex: '',
  },
  variants: {
    size: {
      sm: { root: 'my-xl py-lg px-xl' },
      md: { root: 'my-2xl py-lg px-2xl' },
      lg: { root: 'my-2xl py-lg px-2xl text-8', tex: 'text-accent' },
    },
  },
  defaultVariants: { size: 'md' },
});

type FormulaVariants = VariantProps<typeof formulaVariants>;

interface FormulaProps extends FormulaVariants {
  /** Registry id — preferred for named equations. */
  id?: FormulaId;
  /** One-off LaTeX source (used when id isn't set). */
  tex?: string;
  /** Legacy JSX path; only used when neither id nor tex is provided. */
  children?: ReactNode;
  /** Optional small caption under the formula (e.g., source / name). */
  caption?: ReactNode;
  /** Optional override for the aria-label / plain-text form. */
  ariaLabel?: string;
  /** If true, the aria-label / plain-text form will be used as the content of the <span>, in addition to the KaTeX rendering. This is useful for formulas that are already very plain (e.g., E=mc^2) and where the KaTeX rendering doesn't add much visual interest. */
  plainText?: boolean;
  /** Extra utilities appended to the root container — caller override for margins/padding/etc. */
  className?: string;
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
  plainText: string;
}

function resolve(id: FormulaId | undefined, tex: string | undefined, ariaLabel: string | undefined): ResolvedFormula | null {
  if (id) {
    const def = FORMULAS[id];
    if (!def) return null;
    return { tex: def.tex, plain: ariaLabel ?? def.plain, plainText: def.plain };
  }
  if (tex) {
    return { tex, plain: ariaLabel ?? tex, plainText: ariaLabel ?? tex };
  }
  return null;
}

export function Formula({ id, tex, children, caption, size, ariaLabel, plainText = false, className }: FormulaProps) {
  const { root, tex: texSlot } = formulaVariants({ size });
  const resolved = resolve(id, tex, ariaLabel);
  const html = useMemo(() => (resolved ? renderTeX(resolved.tex, true) : null), [resolved?.tex]);

  if (plainText && !!children) {
    return (
      <div className={clsx('formula-block', className)}>
        {children}
      </div>
    );
  }

  return (
    <div
      className={root({
        class: clsx(
          'formula-block relative mx-auto text-center border-t border-b border-border max-sm:py-lg max-sm:px-lg',
          "before:content-[''] before:absolute before:top-1/2 before:-left-sm before:h-px before:w-sm before:-translate-y-1/2 before:bg-accent",
          "after:content-[''] after:absolute after:top-1/2 after:-right-sm after:h-px after:w-sm after:-translate-y-1/2 after:bg-accent",
          className,
        ),
      })}
      role="math"
      aria-label={resolved?.plain}
    >
      {!!html && (
        <div className={texSlot({ class: 'formula-tex' })} dangerouslySetInnerHTML={{ __html: html }} />
      )}
      {!!children && !html && (
        <div className="formula-content">
          {children}
        </div>
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
        className="formula-inline text-base"
        aria-label={resolved!.plain}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }
  return <span className="formula-inline">{children}</span>;
}
