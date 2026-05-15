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
    <article className="bg-bg-card border border-border-strong rounded-3 py-2xl px-2xl pb-xl relative overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:w-xxs before:h-full before:bg-accent before:opacity-80 max-sm:py-xl max-sm:px-lg">
      <header className="mb-lg">
        {tag && <span className="inline-block font-3 text-6 text-accent tracking-4 uppercase mb-md py-xxs px-md bg-accent-soft rounded-1">{tag}</span>}
        <h3 className="font-2 font-normal italic text-8 max-sm:text-8 leading-2 tracking-1 text-text mt-0 mb-md">{title}</h3>
        {summary && <p className="font-2 italic font-light text-6 leading-3 text-text-dim m-0">{summary}</p>}
      </header>
      <div className="text-6 leading-5 text-text-dim [&_.math]:font-4 [&_.math]:italic [&_.math]:text-7 [&_.math]:text-center [&_.math]:my-lg [&_.math]:text-text [&_.formula-block]:my-lg [&_.formula-block]:mx-0 [&_.formula-block]:py-lg [&_.formula-block]:px-lg [&_.formula-block]:max-w-none [&_.formula-block]:border-border">{children}</div>
      {specs && specs.length > 0 && (
        <dl className="mt-xl mb-0 py-lg px-xl border border-border bg-bg-elevated rounded-2 grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-y-md gap-x-xl">
          {specs.map((s, i) => (
            <div className="flex flex-col gap-xs" key={i}>
              <dt className="font-3 text-1 text-text-muted tracking-3 uppercase">{s.label}</dt>
              <dd className="m-0 font-3 text-4 text-accent tracking-normal">{s.value}</dd>
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
    <section className="max-w-col-lg mx-auto mt-5xl mb-0 pt-2xl border-t border-border-strong">
      <div className="eyebrow-rule mb-xl">Case studies</div>
      {intro && <p className="text-text-dim text-6 leading-4 mb-2xl italic max-w-col">{intro}</p>}
      <div className="flex flex-col gap-xl">{children}</div>
    </section>
  );
}
