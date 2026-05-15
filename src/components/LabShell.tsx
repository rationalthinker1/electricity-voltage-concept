import type { ReactNode } from 'react';

import { Hero } from './Hero';
import { PageNav } from './PageNav';
import { SourcesList } from './SourcesList';
import { getLab, getNeighbors, BASE_LAB_SOURCES } from '@/labs/data/manifest';
import type { SourceKey } from '@/lib/sources';

interface LabShellProps {
  /** Lab slug — looks up the manifest entry for hero + prev/next + sources */
  slug: string;
  /** The interactive lab section (canvas + controls + readouts).
   *  Goes inside .lab > .lab-inner with the standard header. */
  labContent: ReactNode;
  /** Sub-title for the lab header */
  labSubtitle: string;
  /** Slug-style id shown in monospace next to the header */
  labId: string;
  /** Long-form prose deep dive */
  prose: ReactNode;
  /** Override default sources for this lab (else from manifest) */
  sources?: SourceKey[];
  /** Extra prose-aside content above the lab-grid, optional */
  legend?: ReactNode;
}

/**
 * Standard lab page shell. Pulls hero, page-nav, and sources from the manifest
 * given just a slug; the lab page itself supplies the interactive content
 * and the prose. Single-source-of-truth for layout: change here, all 16 labs update.
 */
export function LabShell({
  slug, labContent, labSubtitle, labId, prose, sources, legend,
}: LabShellProps) {
  const lab = getLab(slug);
  if (!lab) {
    return <div style={{ padding: 80 }}>Unknown lab: {slug}</div>;
  }
  const { prev, next } = getNeighbors(slug);
  const sourceKeys = sources ?? BASE_LAB_SOURCES[slug] ?? [];

  return (
    <>
      <Hero lab={lab} />

      <div className="w-full bg-[linear-gradient(180deg,var(--bg)_0%,var(--bg-elevated)_100%)] border-t border-b border-border py-[50px] relative before:content-[''] before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_20%_20%,rgba(255,107,42,.04)_0%,transparent_50%),radial-gradient(ellipse_at_80%_80%,rgba(108,197,194,.03)_0%,transparent_50%)] before:pointer-events-none">
        <div className="max-w-[1480px] mx-auto px-[40px] max-[760px]:px-[20px] relative">
          <div className="flex justify-between items-baseline mb-[30px] pb-[20px] border-b border-border flex-wrap gap-[12px]">
            <span className="font-3 text-[12px] text-text-dim uppercase tracking-[.22em]">Interactive Lab · {labSubtitle}</span>
            <span className="font-3 text-[11px] text-text-muted tracking-[.15em]">/ {labId}</span>
          </div>
          {legend}
          {labContent}
        </div>
      </div>

      <section>
        <div className="reveal in max-w-[70ch] text-[17px] leading-[1.7] text-text-dim [&_p]:mb-[1.4em] [&_p_strong]:text-text [&_p_strong]:font-medium [&_strong]:text-text [&_strong]:font-medium [&_em]:italic [&_em]:text-text [&_h3]:font-2 [&_h3]:font-normal [&_h3]:italic [&_h3]:text-[32px] [&_h3]:leading-[1.1] [&_h3]:my-[60px] [&_h3]:mb-[24px] [&_h3]:text-text [&_h3]:tracking-[-.02em] [&_.pullout]:font-2 [&_.pullout]:italic [&_.pullout]:font-light [&_.pullout]:text-[26px] [&_.pullout]:leading-[1.3] [&_.pullout]:text-text [&_.pullout]:py-[24px] [&_.pullout]:pr-0 [&_.pullout]:pl-[28px] [&_.pullout]:my-[32px] [&_.pullout]:border-l-2 [&_.pullout]:border-accent [&_.math]:font-2 [&_.math]:italic [&_.math]:text-[26px] [&_.math]:text-center [&_.math]:my-[30px] [&_.math]:text-text [&_.math_sub]:text-[.55em] [&_.math_sup]:text-[.55em] [&_.kbd]:font-3 [&_.kbd]:text-[.85em] [&_.kbd]:text-accent [&_.kbd]:bg-accent-soft [&_.kbd]:py-[2px] [&_.kbd]:px-[8px] [&_.kbd]:rounded-2">{prose}</div>

        <SourcesList ids={sourceKeys} />

        <PageNav prev={prev} next={next} />
      </section>

      <footer>
        <div className="colophon">
          <span>Field · Theory · Lab {lab.number}</span>
          <span>
            <a href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>↑ Back to contents</a>
          </span>
        </div>
      </footer>
    </>
  );
}
