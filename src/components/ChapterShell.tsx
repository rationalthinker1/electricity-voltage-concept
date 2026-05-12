import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';

import { SourcesList } from './SourcesList';
import { type ChapterEntry, getChapterNeighbors } from '@/textbook/data/chapters';
import { MANIFEST } from '@/labs/data/manifest';

interface ChapterShellProps {
  chapter: ChapterEntry;
  /** Long narrative content with embedded <Demo> cards */
  children: ReactNode;
}

/**
 * Full-page narrative-chapter layout. Each chapter:
 *   eyebrow + title + deck → narrative prose (with embedded demos) →
 *   related-labs sidebar → sources → prev/next chapter nav.
 */
export function ChapterShell({ chapter, children }: ChapterShellProps) {
  const { prev, next } = getChapterNeighbors(chapter.slug);
  const labs = MANIFEST.filter(l => chapter.relatedLabs.includes(l.slug));

  return (
    <article className="chapter-page">
      <div className="chapter-eyebrow">Chapter {chapter.number}</div>
      <h1 dangerouslySetInnerHTML={{ __html: chapter.title }} />
      <p className="chap-deck" dangerouslySetInnerHTML={{ __html: chapter.subtitle }} />

      <div className="narrative">{children}</div>

      {labs.length > 0 && (
        <aside className="related-labs">
          <div className="related-labs-head">Go deeper · Related equation labs</div>
          {labs.map(l => (
            <Link
              key={l.slug}
              to="/labs/$slug"
              params={{ slug: l.slug }}
              className="related-lab-link"
            >
              <span className="rl-name">{l.title}</span>
              <span className="rl-eq" dangerouslySetInnerHTML={{ __html: l.formula }} />
              <div className="rl-blurb">{l.blurb}</div>
            </Link>
          ))}
        </aside>
      )}

      <div className="related-labs">
        <SourcesList ids={chapter.sources} />
      </div>

      <nav className="chap-page-nav">
        {prev ? (
          <Link to="/textbook/$chapterSlug" params={{ chapterSlug: prev.slug }}>
            <div className="dir">← Chapter {prev.number}</div>
            <div className="ch-title">{prev.title}</div>
          </Link>
        ) : (
          <Link to="/">
            <div className="dir">← Back</div>
            <div className="ch-title">Contents</div>
          </Link>
        )}
        {next ? (
          <Link to="/textbook/$chapterSlug" params={{ chapterSlug: next.slug }} className="next">
            <div className="dir next">Chapter {next.number} →</div>
            <div className="ch-title">{next.title}</div>
          </Link>
        ) : (
          <Link to="/reference" className="next">
            <div className="dir next">Appendix →</div>
            <div className="ch-title">Equation labs</div>
          </Link>
        )}
      </nav>
    </article>
  );
}
