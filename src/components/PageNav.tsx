import { Link } from '@tanstack/react-router';

import type { LabManifestEntry } from '@/labs/data/manifest';

interface PageNavProps {
  prev: LabManifestEntry | null;
  next: LabManifestEntry | null;
}

export function PageNav({ prev, next }: PageNavProps) {
  return (
    <div className="page-nav reveal in">
      {prev ? (
        <Link to="/labs/$slug" params={{ slug: prev.slug }}>
          <div className="dir">← Lab {prev.number}</div>
          <div className="title">{prev.title}</div>
        </Link>
      ) : (
        <Link to="/">
          <div className="dir">← Back</div>
          <div className="title">Contents</div>
        </Link>
      )}

      {next ? (
        <Link to="/labs/$slug" params={{ slug: next.slug }} className="next">
          <div className="dir next">Lab {next.number} →</div>
          <div className="title">{next.title}</div>
        </Link>
      ) : (
        <Link to="/" className="next">
          <div className="dir next">Finish →</div>
          <div className="title">Back to contents</div>
        </Link>
      )}
    </div>
  );
}
