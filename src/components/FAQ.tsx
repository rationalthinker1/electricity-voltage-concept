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
      <summary className="cursor-pointer flex items-baseline gap-[14px] py-[18px] outline-none list-none [&::-webkit-details-marker]:hidden group/s">
        <span className="font-3 text-[11px] tracking-[.15em] shrink-0 w-[28px] text-accent">Q.</span>
        <span className="font-2 italic font-light text-[20px] text-color-4 leading-[1.3] flex-1 min-w-0 group-hover/d:text-accent group-focus-visible/s:outline group-focus-visible/s:outline-1 group-focus-visible/s:outline-accent group-focus-visible/s:outline-offset-4">{q}</span>
        <span className="chev font-3 text-[14px] shrink-0 transition-transform duration-150 text-accent" aria-hidden>+</span>
      </summary>
      <div className="pb-[22px] pl-[42px] text-color-text-dim text-[15.5px] leading-[1.65] max-[600px]:pl-[28px] max-[600px]:text-[14.5px]">
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
    <section className="opacity-100 max-w-[70ch] mx-auto mt-[100px] mb-0 pt-[36px] border-t border-color-border-strong">
      <div className="eyebrow-rule">{eyebrow}</div>
      {intro && <p className="text-color-5 text-[15px] leading-[1.55] mb-[28px] italic max-w-[55ch]">{intro}</p>}
      <div className="border-t border-border py-2 [&_>*+*]:border-t [&_>*+*]:border-border">{children}</div>
    </section>
  );
}
