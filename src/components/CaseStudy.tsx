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
        {tag && <span className="inline-block font-3 text-1 text-accent tracking-4 uppercase mb-md py-xxs px-md bg-accent-soft rounded-1">{tag}</span>}
        <h3 className="font-2 font-normal italic text-8 max-sm:text-8 leading-2 tracking-1 text-text mt-0 mb-md [&_em]:text-accent">{title}</h3>
        {summary && <p className="font-2 italic font-light text-6 leading-3 text-text-dim m-0">{summary}</p>}
      </header>
      <div className="text-6 leading-5 text-text-dim [&_p]:mb-prose-2 [&_p:last-child]:mb-0 [&_strong]:text-text [&_strong]:font-medium [&_em]:text-text [&_em]:italic [&_.math]:font-4 [&_.math]:italic [&_.math]:text-7 [&_.math]:text-center [&_.math]:my-lg [&_.math]:text-text [&_.cite]:inline-block [&_.cite]:font-3 [&_.cite]:text-1 [&_.cite]:align-super [&_.cite]:leading-none [&_.cite]:text-accent [&_.cite]:bg-accent-soft [&_.cite]:py-px [&_.cite]:px-sm [&_.cite]:mx-px [&_.cite]:rounded-1 [&_.cite]:no-underline hover:[&_.cite]:bg-accent hover:[&_.cite]:text-bg [&_.formula-block]:my-lg [&_.formula-block]:mx-0 [&_.formula-block]:py-lg [&_.formula-block]:px-lg [&_.formula-block]:max-w-none [&_.formula-block]:border-border [&_.formula-content]:text-8">{children}</div>
      {specs && specs.length > 0 && (
        <dl className="mt-xl mb-0 py-lg px-xl border border-border bg-bg-elevated rounded-2 grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-y-md gap-x-xl">
          {specs.map((s, i) => (
            <div className="flex flex-col gap-xs [&_dt]:font-3 [&_dt]:text-1 [&_dt]:text-text-muted [&_dt]:tracking-3 [&_dt]:uppercase [&_dd]:m-0 [&_dd]:font-3 [&_dd]:text-4 [&_dd]:text-accent [&_dd]:tracking-normal" key={i}>
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
    <section className="max-w-col-lg mx-auto mt-5xl mb-0 pt-2xl border-t border-border-strong">
      <div className="font-3 text-accent uppercase tracking-4 mb-xl flex items-center gap-md before:content-[''] before:w-icon-lg before:h-px before:bg-accent">Case studies</div>
      {intro && <p className="text-text-dim text-6 leading-4 mb-2xl italic max-w-col">{intro}</p>}
      <div className="flex flex-col gap-xl">{children}</div>
    </section>
  );
}
