import type { ReactNode } from 'react';

interface CaseStudyProps {
  /** Numerical tag like "Case 1.1" — shown in monospace as eyebrow */
  tag?: string;
  /** Title — e.g., "A Faraday cage in your microwave" */
  title: string;
  /** One-line summary / sub-title, italic */
  summary?: string;
  /** The actual case content (prose, math, optional spec panel) */
  children: ReactNode;
  /** Optional "spec sheet" — key numbers shown as a compact list */
  specs?: Array<{ label: string; value: ReactNode }>;
}

/**
 * Case-study card. Sits inside <CaseStudies/> sections at the end of each
 * chapter, before the FAQ. Frames a real-world example: title, sub-title,
 * prose, optional spec sheet of key numbers.
 */
export function CaseStudy({ tag, title, summary, children, specs }: CaseStudyProps) {
  return (
    <article className="case-study">
      <header className="case-head">
        {tag && <span className="case-tag">{tag}</span>}
        <h3 className="case-title">{title}</h3>
        {summary && <p className="case-summary">{summary}</p>}
      </header>
      <div className="case-body">{children}</div>
      {specs && specs.length > 0 && (
        <dl className="case-specs">
          {specs.map((s, i) => (
            <div className="case-spec-row" key={i}>
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
    <section className="case-studies">
      <div className="case-studies-head">Case studies</div>
      {intro && <p className="case-studies-intro">{intro}</p>}
      <div className="case-studies-list">{children}</div>
    </section>
  );
}
