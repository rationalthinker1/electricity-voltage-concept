import { Link } from '@tanstack/react-router';

import type { LabManifestEntry } from '@/labs/data/manifest';

interface PageNavProps {
  prev: LabManifestEntry | null;
  next: LabManifestEntry | null;
}

export function PageNav({ prev, next }: PageNavProps) {
  return (
    <div className="reveal in grid grid-cols-2 max-[760px]:grid-cols-1 gap-px bg-border border border-border mt-[100px] [&_a]:bg-bg [&_a]:py-[36px] [&_a]:px-[32px] [&_a]:no-underline [&_a]:text-inherit [&_a]:transition-colors hover:[&_a]:bg-bg-card-hover">
      {prev ? (
        <Link to="/labs/$slug" params={{ slug: prev.slug }}>
          <div className="font-3 text-[10px] text-text-muted uppercase tracking-[.22em] mb-[10px]">← Lab {prev.number}</div>
          <div className="font-2 italic font-light text-[24px] text-text tracking-[-.02em]">{prev.title}</div>
        </Link>
      ) : (
        <Link to="/">
          <div className="font-3 text-[10px] text-text-muted uppercase tracking-[.22em] mb-[10px]">← Back</div>
          <div className="font-2 italic font-light text-[24px] text-text tracking-[-.02em]">Contents</div>
        </Link>
      )}

      {next ? (
        <Link to="/labs/$slug" params={{ slug: next.slug }}>
          <div className="font-3 text-[10px] text-text-muted uppercase tracking-[.22em] mb-[10px] text-right">Lab {next.number} →</div>
          <div className="font-2 italic font-light text-[24px] text-text tracking-[-.02em] text-right">{next.title}</div>
        </Link>
      ) : (
        <Link to="/">
          <div className="font-3 text-[10px] text-text-muted uppercase tracking-[.22em] mb-[10px] text-right">Finish →</div>
          <div className="font-2 italic font-light text-[24px] text-text tracking-[-.02em] text-right">Back to contents</div>
        </Link>
      )}
    </div>
  );
}
