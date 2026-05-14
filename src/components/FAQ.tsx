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
    <details className="faq-item">
      <summary>
        <span className="faq-q-marker">Q.</span>
        <span className="faq-q-text">{q}</span>
        <span className="faq-q-chevron" aria-hidden>+</span>
      </summary>
      <div className="faq-answer">{children}</div>
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
    <section className="faq">
      <div className="faq-eyebrow">{eyebrow}</div>
      {intro && <p className="faq-intro">{intro}</p>}
      <div className="faq-list">{children}</div>
    </section>
  );
}
