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
    <details className="disclosure-1">
      <summary className="disclosure-summary-1">
        <span className="disclosure-marker-1 accent-brand">Q.</span>
        <span className="disclosure-title-1">{q}</span>
        <span className="disclosure-chev-1 accent-brand" aria-hidden>+</span>
      </summary>
      <div className="richtext-compact-1">{children}</div>
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
    <section className="section-narrow-1">
      <div className="eyebrow-rule-1 accent-brand">{eyebrow}</div>
      {intro && <p className="intro-1">{intro}</p>}
      <div className="list-divided-1">{children}</div>
    </section>
  );
}
