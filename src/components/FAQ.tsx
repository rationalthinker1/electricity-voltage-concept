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
    <details className="border-b border-border group/d [&[open]_.chev]:rotate-45">
      <summary className="cursor-pointer flex items-baseline gap-md py-lg outline-none list-none [&::-webkit-details-marker]:hidden group/s">
        <span className="font-3 text-2 tracking-3 shrink-0 w-2xl text-accent">Q.</span>
        <span className="font-2 italic font-light text-7 text-text leading-3 flex-1 min-w-0 group-hover/d:text-accent group-focus-visible/s:outline group-focus-visible/s:outline-1 group-focus-visible/s:outline-accent group-focus-visible/s:outline-offset-4">{q}</span>
        <span className="chev font-3 text-5 shrink-0 transition-transform duration-150 text-accent" aria-hidden>+</span>
      </summary>
      <div className="pb-xl pl-3xl text-color-text-dim text-6 leading-5 max-sm:pl-2xl max-sm:text-5">
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
    <section className="opacity-100 max-w-col-lg mx-auto mt-5xl mb-0 pt-2xl border-t border-color-border-strong">
      <div className="eyebrow-rule mb-xl">{eyebrow}</div>
      {intro && <p className="text-text-dim text-6 leading-4 mb-2xl italic max-w-col">{intro}</p>}
      <div className="border-t border-border py-2 [&_>*+*]:border-t [&_>*+*]:border-border">{children}</div>
    </section>
  );
}
