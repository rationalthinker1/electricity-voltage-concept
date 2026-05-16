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
    <article className="bg-bg-card border-border-strong rounded-3 py-2xl px-2xl pb-xl before:w-xxs before:bg-accent max-sm:py-xl max-sm:px-lg relative overflow-hidden border before:absolute before:top-0 before:left-0 before:h-full before:opacity-80 before:content-['']">
      <header className="mb-lg">
        {tag && (
          <span className="eyebrow-accent text-6 tracking-4 mb-md py-xxs px-md bg-accent-soft rounded-1 inline-block">
            {tag}
          </span>
        )}
        <h3 className="font-2 text-8 max-sm:text-8 tracking-1 text-text mb-md mt-0 leading-2 font-normal italic">
          {title}
        </h3>
        {summary && (
          <p className="font-2 text-6 text-text-dim m-0 leading-3 font-light italic">{summary}</p>
        )}
      </header>
      <div className="text-6 text-text-dim [&_.math]:font-4 [&_.math]:text-7 [&_.math]:my-lg [&_.math]:text-text [&_.formula-block]:my-lg [&_.formula-block]:py-lg [&_.formula-block]:px-lg [&_.formula-block]:border-border leading-5 [&_.formula-block]:mx-0 [&_.formula-block]:max-w-none [&_.math]:text-center [&_.math]:italic">
        {children}
      </div>
      {specs && specs.length > 0 && (
        <dl className="mt-xl py-lg px-xl border-border bg-bg-elevated rounded-2 gap-y-md gap-x-xl mb-0 grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] border">
          {specs.map((s, i) => (
            <div className="gap-xs flex flex-col" key={i}>
              <dt className="font-3 text-1 text-text-muted tracking-3 uppercase">{s.label}</dt>
              <dd className="font-3 text-4 text-accent m-0 tracking-normal">{s.value}</dd>
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
    <section className="max-w-col-lg mt-5xl pt-2xl border-border-strong mx-auto mb-0 border-t">
      <div className="eyebrow-rule mb-xl">Case studies</div>
      {intro && <p className="text-text-dim text-6 mb-2xl max-w-col leading-4 italic">{intro}</p>}
      <div className="gap-xl flex flex-col">{children}</div>
    </section>
  );
}
