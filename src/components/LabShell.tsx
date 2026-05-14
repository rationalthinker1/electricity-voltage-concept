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

      <div className="relative py-[80px] px-0 border-y border-color-border bg-color-bg-elevated">
        <div className="container-max">
          <div className="flex justify-between items-baseline flex-wrap gap-md mb-[30px] pb-[20px] border-b border-color-border">
            <span className="text-meta">Interactive Lab · {labSubtitle}</span>
            <span className="text-meta text-color-text-dim">/ {labId}</span>
          </div>
          {legend}
          {labContent}
        </div>
      </div>

      <section className="page-section">
        <div className="prose-content section-reveal">{prose}</div>

        <SourcesList ids={sourceKeys} />

        <PageNav prev={prev} next={next} />
      </section>

      <footer className="page-section pt-[100px] pb-[60px] border-t border-color-border">
        <div className="flex justify-between items-center text-meta text-color-text-muted">
          <span>Field · Theory · Lab {lab.number}</span>
          <span>
            <a href="/" className="text-color-text-muted no-underline hover:text-color-accent">↑ Back to contents</a>
          </span>
        </div>
      </footer>
    </>
  );
}

