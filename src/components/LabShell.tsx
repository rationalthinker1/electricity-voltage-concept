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

      <div className="w-full bg-[linear-gradient(180deg,var(--bg)_0%,var(--bg-elevated)_100%)] border-t border-b border-border py-3xl relative before:content-[''] before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_20%_20%,rgba(255,107,42,.04)_0%,transparent_50%),radial-gradient(ellipse_at_80%_80%,rgba(108,197,194,.03)_0%,transparent_50%)] before:pointer-events-none">
        <div className="max-w-page-lg mx-auto px-3xl max-md:px-lg relative">
          <div className="flex justify-between items-baseline mb-2xl pb-lg border-b border-border flex-wrap gap-md">
            <span className="font-3 text-3 text-text-dim uppercase tracking-4">Interactive Lab · {labSubtitle}</span>
            <span className="font-3 text-2 text-text-muted tracking-3">/ {labId}</span>
          </div>
          {legend}
          {labContent}
        </div>
      </div>

      <section>
        <div className="reveal in max-w-col-lg text-6 leading-[1.7] text-text-dim [&_p]:mb-prose-3 [&_p_strong]:text-text [&_p_strong]:font-medium [&_strong]:text-text [&_strong]:font-medium [&_em]:italic [&_em]:text-text [&_h3]:font-2 [&_h3]:font-normal [&_h3]:italic [&_h3]:text-9 [&_h3]:leading-[1.1] [&_h3]:my-4xl [&_h3]:mb-xl [&_h3]:text-text [&_h3]:tracking-1 [&_.pullout]:font-2 [&_.pullout]:italic [&_.pullout]:font-light [&_.pullout]:text-8 [&_.pullout]:leading-[1.3] [&_.pullout]:text-text [&_.pullout]:py-xl [&_.pullout]:pr-0 [&_.pullout]:pl-2xl [&_.pullout]:my-2xl [&_.pullout]:border-l-2 [&_.pullout]:border-accent [&_.math]:font-2 [&_.math]:italic [&_.math]:text-8 [&_.math]:text-center [&_.math]:my-2xl [&_.math]:text-text [&_.math_sub]:text-[.55em] [&_.math_sup]:text-[.55em] [&_.kbd]:font-3 [&_.kbd]:text-[.85em] [&_.kbd]:text-accent [&_.kbd]:bg-accent-soft [&_.kbd]:py-xxs [&_.kbd]:px-md [&_.kbd]:rounded-2">{prose}</div>

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
