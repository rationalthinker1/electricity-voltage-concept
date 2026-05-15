import type { ReactNode } from 'react';

const CASE_STUDY =
  'bg-bg-card border border-border-strong rounded-3 py-[30px] px-[32px] pb-[26px] relative overflow-hidden before:content-[\'\'] before:absolute before:top-0 before:left-0 before:w-[3px] before:h-full before:bg-accent before:opacity-80 max-[600px]:py-[22px] max-[600px]:px-[20px]';
const CASE_HEAD = 'mb-[20px]';
const CASE_TAG =
  'inline-block font-3 text-[10px] text-accent tracking-[.22em] uppercase mb-[10px] py-[2px] px-[8px] bg-accent-soft rounded-1';
const CASE_TITLE =
  'font-2 font-normal italic text-[26px] max-[600px]:text-[22px] leading-[1.2] tracking-[-.015em] text-text mt-0 mb-[8px] [&_em]:text-accent';
const CASE_SUMMARY =
  'font-2 italic font-light text-[17px] leading-[1.45] text-text-dim m-0';
const CASE_BODY =
  'text-[15.5px] leading-[1.65] text-text-dim [&_p]:mb-[1em] [&_p:last-child]:mb-0 [&_strong]:text-text [&_strong]:font-medium [&_em]:text-text [&_em]:italic [&_.math]:font-4 [&_.math]:italic [&_.math]:text-[18px] [&_.math]:text-center [&_.math]:my-[14px] [&_.math]:text-text [&_.cite]:inline-block [&_.cite]:font-3 [&_.cite]:text-[10px] [&_.cite]:align-super [&_.cite]:leading-none [&_.cite]:text-accent [&_.cite]:bg-accent-soft [&_.cite]:py-px [&_.cite]:px-[5px] [&_.cite]:mx-px [&_.cite]:rounded-1 [&_.cite]:no-underline hover:[&_.cite]:bg-accent hover:[&_.cite]:text-bg [&_.formula-block]:my-[16px] [&_.formula-block]:mx-0 [&_.formula-block]:py-[12px] [&_.formula-block]:px-[18px] [&_.formula-block]:max-w-none [&_.formula-block]:border-border [&_.formula-content]:text-[22px]';
const CASE_SPECS =
  'mt-[24px] mb-0 py-[18px] px-[22px] border border-border bg-bg-elevated rounded-2 grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-y-[14px] gap-x-[26px]';
const CASE_SPEC_ROW =
  'flex flex-col gap-[4px] [&_dt]:font-3 [&_dt]:text-[10px] [&_dt]:text-text-muted [&_dt]:tracking-[.15em] [&_dt]:uppercase [&_dd]:m-0 [&_dd]:font-3 [&_dd]:text-[13px] [&_dd]:text-accent [&_dd]:tracking-[.02em]';
const CASE_STUDIES =
  'max-w-[70ch] mx-auto mt-[100px] mb-0 pt-[36px] border-t border-border-strong';
const CASE_STUDIES_HEAD =
  'font-3 text-[11px] text-accent tracking-[.25em] uppercase mb-[18px] flex items-center gap-[14px] before:content-[\'\'] before:w-[36px] before:h-px before:bg-accent';
const CASE_STUDIES_INTRO =
  'text-text-dim text-[15px] leading-[1.55] mb-[30px] italic max-w-[55ch]';
const CASE_STUDIES_LIST = 'flex flex-col gap-[36px]';

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
    <article className={CASE_STUDY}>
      <header className={CASE_HEAD}>
        {tag && <span className={CASE_TAG}>{tag}</span>}
        <h3 className={CASE_TITLE}>{title}</h3>
        {summary && <p className={CASE_SUMMARY}>{summary}</p>}
      </header>
      <div className={CASE_BODY}>{children}</div>
      {specs && specs.length > 0 && (
        <dl className={CASE_SPECS}>
          {specs.map((s, i) => (
            <div className={CASE_SPEC_ROW} key={i}>
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
    <section className={CASE_STUDIES}>
      <div className={CASE_STUDIES_HEAD}>Case studies</div>
      {intro && <p className={CASE_STUDIES_INTRO}>{intro}</p>}
      <div className={CASE_STUDIES_LIST}>{children}</div>
    </section>
  );
}
