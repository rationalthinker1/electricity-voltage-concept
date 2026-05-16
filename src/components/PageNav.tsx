import type { LabManifestEntry } from '@/labs/data/manifest';
import { NavCard, NavCardGrid } from '@/components/ui/NavCard';

interface PageNavProps {
  prev: LabManifestEntry | null;
  next: LabManifestEntry | null;
}

export function PageNav({ prev, next }: PageNavProps) {
  return (
    <NavCardGrid className="reveal in mt-5xl">
      {prev ? (
        <NavCard to="/labs/$slug" params={{ slug: prev.slug }}>
          <div className="eyebrow-muted text-1 tracking-4 mb-md">← Lab {prev.number}</div>
          <div className="title-display text-8 tracking-1 font-light">{prev.title}</div>
        </NavCard>
      ) : (
        <NavCard to="/">
          <div className="eyebrow-muted text-1 tracking-4 mb-md">← Back</div>
          <div className="title-display text-8 tracking-1 font-light">Contents</div>
        </NavCard>
      )}

      {next ? (
        <NavCard to="/labs/$slug" params={{ slug: next.slug }}>
          <div className="eyebrow-muted text-1 tracking-4 mb-md text-right">
            Lab {next.number} →
          </div>
          <div className="title-display text-8 tracking-1 text-right font-light">{next.title}</div>
        </NavCard>
      ) : (
        <NavCard to="/">
          <div className="eyebrow-muted text-1 tracking-4 mb-md text-right">Finish →</div>
          <div className="title-display text-8 tracking-1 text-right font-light">
            Back to contents
          </div>
        </NavCard>
      )}
    </NavCardGrid>
  );
}
