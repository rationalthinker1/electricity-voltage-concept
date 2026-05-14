import { Link } from '@tanstack/react-router';

import type { LabManifestEntry } from '@/labs/data/manifest';

interface PageNavProps {
  prev: LabManifestEntry | null;
  next: LabManifestEntry | null;
}

export function PageNav({ prev, next }: PageNavProps) {
  return (
    <div className="pager-1 reveal in">
      {prev ? (
        <Link to="/labs/$slug" params={{ slug: prev.slug }} className="pager-link-1">
          <div className="pager-dir-1">← Lab {prev.number}</div>
          <div className="pager-title-1">{prev.title}</div>
        </Link>
      ) : (
        <Link to="/" className="pager-link-1">
          <div className="pager-dir-1">← Back</div>
          <div className="pager-title-1">Contents</div>
        </Link>
      )}

      {next ? (
        <Link to="/labs/$slug" params={{ slug: next.slug }} className="pager-link-1 align-end-1">
          <div className="pager-dir-1">Lab {next.number} →</div>
          <div className="pager-title-1">{next.title}</div>
        </Link>
      ) : (
        <Link to="/" className="pager-link-1 align-end-1">
          <div className="pager-dir-1">Finish →</div>
          <div className="pager-title-1">Back to contents</div>
        </Link>
      )}
    </div>
  );
}
