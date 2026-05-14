import type { ReactNode } from 'react';
import { Card } from '@/components/ui/Card';
import { Pill } from '@/components/ui/Pill';
import { Stack } from '@/components/ui/Stack';

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
    <Card variant="default" accent="accent" className="relative overflow-hidden">
      <header className="mb-5">
        {tag && (
          <div className="mb-4">
            <Pill variant="accent">{tag}</Pill>
          </div>
        )}
        <h3 className="title-md !italic !text-2xl mb-2">{title}</h3>
        {summary && <p className="font-display italic text-text-dim text-lg leading-snug m-0">{summary}</p>}
      </header>
      <div className="text-text-dim leading-relaxed text-[15.5px]">{children}</div>
      {specs && specs.length > 0 && (
        <dl className="spec-grid-1 mt-6">
          {specs.map((s, i) => (
            <div className="spec-row-1" key={i}>
              <dt className="text-meta !text-[10px]">{s.label}</dt>
              <dd className="font-mono text-accent text-sm">{s.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </Card>
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
    <section className="section-reveal max-w-[70ch] mx-auto px-10">
      <div className="eyebrow-rule-1 !mb-6">Case studies</div>
      {intro && <p className="intro-1">{intro}</p>}
      <Stack gap={36}>{children}</Stack>
    </section>
  );
}

