import { Link } from '@tanstack/react-router';

import type { LabManifestEntry } from '@/labs/data/manifest';

interface PageNavProps {
  prev: LabManifestEntry | null;
  next: LabManifestEntry | null;
}

export function PageNav({ prev, next }: PageNavProps) {
  return (
    <div className="reveal in card-grid mt-5xl">
      {prev ? (
        <Link to="/labs/$slug" params={{ slug: prev.slug }} className="nav-item">
          <div className="eyebrow-muted text-1 tracking-4 mb-md">← Lab {prev.number}</div>
          <div className="title-display text-8 tracking-1 font-light">{prev.title}</div>
        </Link>
      ) : (
        <Link to="/" className="nav-item">
          <div className="eyebrow-muted text-1 tracking-4 mb-md">← Back</div>
          <div className="title-display text-8 tracking-1 font-light">Contents</div>
        </Link>
      )}

      {next ? (
        <Link to="/labs/$slug" params={{ slug: next.slug }} className="nav-item">
          <div className="eyebrow-muted text-1 tracking-4 mb-md text-right">
            Lab {next.number} →
          </div>
          <div className="title-display text-8 tracking-1 text-right font-light">{next.title}</div>
        </Link>
      ) : (
        <Link to="/" className="nav-item">
          <div className="eyebrow-muted text-1 tracking-4 mb-md text-right">Finish →</div>
          <div className="title-display text-8 tracking-1 text-right font-light">
            Back to contents
          </div>
        </Link>
      )}
    </div>
  );
}
