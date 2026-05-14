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
    <details className="disclosure-base">
      <summary className="disclosure-summary group">
        <span className="disclosure-marker text-color-accent">Q.</span>
        <span className="disclosure-title group-hover:text-color-accent">{q}</span>
        <span className="disclosure-chev text-color-accent" aria-hidden>+</span>
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
    <section className="section-reveal max-w-[70ch] mx-auto mt-[100px] mb-0 pt-[36px] border-t border-color-border-strong">
      <div className="eyebrow-rule">{eyebrow}</div>
      {intro && <p className="intro">{intro}</p>}
      <div className="list-divided">{children}</div>
    </section>
  );
}

