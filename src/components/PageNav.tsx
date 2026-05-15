import { Link } from '@tanstack/react-router';

import type { LabManifestEntry } from '@/labs/data/manifest';

interface PageNavProps {
  prev: LabManifestEntry | null;
  next: LabManifestEntry | null;
}

export function PageNav({ prev, next }: PageNavProps) {
  return (
    <div className="reveal in grid grid-cols-2 max-md:grid-cols-1 gap-px bg-border border border-border mt-5xl [&_a]:bg-bg [&_a]:py-2xl [&_a]:px-2xl [&_a]:no-underline [&_a]:text-inherit [&_a]:transition-colors hover:[&_a]:bg-bg-card-hover">
      {prev ? (
        <Link to="/labs/$slug" params={{ slug: prev.slug }}>
          <div className="eyebrow-muted text-1 tracking-4 mb-md">← Lab {prev.number}</div>
          <div className="title-display font-light text-8 tracking-1">{prev.title}</div>
        </Link>
      ) : (
        <Link to="/">
          <div className="eyebrow-muted text-1 tracking-4 mb-md">← Back</div>
          <div className="title-display font-light text-8 tracking-1">Contents</div>
        </Link>
      )}

      {next ? (
        <Link to="/labs/$slug" params={{ slug: next.slug }}>
          <div className="eyebrow-muted text-1 tracking-4 mb-md text-right">Lab {next.number} →</div>
          <div className="title-display font-light text-8 tracking-1 text-right">{next.title}</div>
        </Link>
      ) : (
        <Link to="/">
          <div className="eyebrow-muted text-1 tracking-4 mb-md text-right">Finish →</div>
          <div className="title-display font-light text-8 tracking-1 text-right">Back to contents</div>
        </Link>
      )}
    </div>
  );
}
