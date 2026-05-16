import type { ReactNode } from 'react';

interface FAQItemProps {
  q: string;
  /** Answer may include <Cite/>, <strong>, math markup, etc. */
  children: ReactNode;
}

/**
 * One question/answer row. Uses native <details>/<summary> so the
 * keyboard, mouse, and screen-reader story works for free — no JS.
 */
export function FAQItem({ q, children }: FAQItemProps) {
  return (
    <details className="border-border group/d border-b first:border-t [&[open]_.chev]:rotate-45">
      <summary className="gap-md py-lg group/s flex cursor-pointer list-none items-baseline outline-none [&::-webkit-details-marker]:hidden">
        <span className="font-3 text-2 tracking-3 text-accent w-2xl shrink-0">Q.</span>
        <span className="font-2 text-7 text-text group-hover/d:text-accent group-focus-visible/s:outline-accent min-w-0 flex-1 leading-3 font-light italic group-focus-visible/s:outline group-focus-visible/s:outline-1 group-focus-visible/s:outline-offset-4">
          {q}
        </span>
        <span
          className="chev font-3 text-5 text-accent shrink-0 transition-transform duration-150"
          aria-hidden
        >
          +
        </span>
      </summary>
      <div className="pb-xl pl-3xl text-color-text-dim text-6 max-sm:pl-2xl max-sm:text-5 leading-5">
        {children}
      </div>
    </details>
  );
}

interface FAQProps {
  /** Optional eyebrow heading. Defaults to "Frequently asked". */
  eyebrow?: string;
  /** Optional intro line under the eyebrow. */
  intro?: ReactNode;
  /** Each child should be a <FAQItem/>. */
  children: ReactNode;
}

/**
 * Chapter-end FAQ section. Sits between the chapter narrative and the
 * related-labs sidebar. Questions are scannable (closed by default);
 * the reader expands the ones they care about.
 */
export function FAQ({ eyebrow = 'Frequently asked', intro, children }: FAQProps) {
  return (
    <section className="max-w-col-lg mt-5xl pt-2xl border-color-border-strong mx-auto mb-0 border-t opacity-100">
      <div className="eyebrow-rule mb-xl">{eyebrow}</div>
      {intro && <p className="text-text-dim text-6 mb-2xl max-w-col leading-4 italic">{intro}</p>}
      <div>{children}</div>
    </section>
  );
}
