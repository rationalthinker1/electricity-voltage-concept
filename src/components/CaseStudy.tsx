import type { ReactNode } from 'react';

interface CaseStudyProps {
  /** Numerical tag like "Case 1.1" — shown in monospace as eyebrow */
  tag?: string;
  /** Title — e.g., "A Faraday cage in your microwave" */
  title: string;
  /** One-line summary / sub-title, italic */
  summary?: ReactNode;
  /** The actual case content (prose, math, optional spec panel) */
  children: ReactNode;
  /** Optional "spec sheet" — key numbers shown as a compact list */
  specs?: Array<{ label: ReactNode; value: ReactNode }>;
}

/**
 * Case-study card. Sits inside <CaseStudies/> sections at the end of each
 * chapter, before the FAQ. Frames a real-world example: title, sub-title,
 * prose, optional spec sheet of key numbers.
 */
export function CaseStudy({ tag, title, summary, children, specs }: CaseStudyProps) {
  return (
    <article className="article-card-1 card-accent-brand">
      <header className="article-header-1">
        {tag && <span className="chip chip-accent chip-sm">{tag}</span>}
        <h3 className="title-4 article-title-1">{title}</h3>
        {summary && <p className="summary-1">{summary}</p>}
      </header>
      <div className="richtext-1">{children}</div>
      {specs && specs.length > 0 && (
        <dl className="spec-grid-1">
          {specs.map((s, i) => (
            <div className="spec-row-1" key={i}>
              <dt>{s.label}</dt>
              <dd>{s.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </article>
  );
}

interface CaseStudiesProps {
  /** Optional intro line under the eyebrow */
  intro?: ReactNode;
  /** Each child should be a <CaseStudy/> */
  children: ReactNode;
}

/**
 * Wrapper for the chapter's case-study block. Renders an eyebrow header
 * and an intro line; children are CaseStudy cards.
 */
export function CaseStudies({ intro, children }: CaseStudiesProps) {
  return (
    <section className="section-narrow-1">
      <div className="eyebrow-rule-1 accent-brand">Case studies</div>
      {intro && <p className="intro-1">{intro}</p>}
      <div className="stack-2">{children}</div>
    </section>
  );
}
