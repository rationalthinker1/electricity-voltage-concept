import { Link } from '@tanstack/react-router';

import type { LabManifestEntry } from '@/labs/data/manifest';

interface PageNavProps {
  prev: LabManifestEntry | null;
  next: LabManifestEntry | null;
}

export function PageNav({ prev, next }: PageNavProps) {
  return (
    <div className="grid-pager">
      {prev ? (
        <Link to="/labs/$slug" params={{ slug: prev.slug }} className="link-pager">
          <div className="text-meta">← Lab {prev.number}</div>
          <div className="title-md">{prev.title}</div>
        </Link>
      ) : (
        <Link to="/" className="link-pager">
          <div className="text-meta">← Back</div>
          <div className="title-md">Contents</div>
        </Link>
      )}

      {next ? (
        <Link to="/labs/$slug" params={{ slug: next.slug }} className="link-pager text-right">
          <div className="text-meta">Lab {next.number} →</div>
          <div className="title-md">{next.title}</div>
        </Link>
      ) : (
        <Link to="/" className="link-pager text-right">
          <div className="text-meta">Finish →</div>
          <div className="title-md">Back to contents</div>
        </Link>
      )}
    </div>
  );
}

