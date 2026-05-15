import { Link, createFileRoute } from '@tanstack/react-router';

import { CAPSTONES } from '@/textbook/data/capstones';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export const Route = createFileRoute('/capstones')({
  component: CapstonesIndex,
});

function CapstonesIndex() {
  return (
    <section className="page-shell pt-[140px] max-w-[1200px]">
      <header className="mb-[32px]">
        <div className="eyebrow-muted tracking-[.18em] mb-[12px]">Field · Theory · Capstones</div>
        <h1 className="hero-display max-[760px]:text-[34px]">
          Three <em>integration</em> projects.
        </h1>
        <p className="body-copy max-w-[720px]">
          The textbook chapters teach concepts one at a time. The
          capstones force you to integrate four to eight of them at
          once: design a real wall-wart, follow your electric bill back
          to the generator, build an AM radio receiver. Each one is a
          guided walkthrough — problem statement, sub-tasks with
          hidden-then-revealed worked solutions, and a stretch goal
          that pushes beyond the chapter content.
        </p>
      </header>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-[22px] mt-[28px]">
        {CAPSTONES.map(cap => (
          <Link
            key={cap.id}
            to="/capstone/$id"
            params={{ id: cap.id }}
            className="no-underline text-inherit block transition-transform duration-150 ease-out hover:-translate-y-[2px]"
          >
            <Card variant="elevated" accent="accent" className="h-full">
              <div className="eyebrow-accent text-[11px] tracking-[.14em] mb-[10px]">Capstone {cap.number}</div>
              <h2 className="title-display text-[26px] leading-[1.18] mb-[8px]">{cap.title}</h2>
              <p className="body-copy text-[14px] leading-[1.5] m-0 mb-[16px]">{cap.subtitle}</p>
              <div className="flex flex-wrap gap-[8px] mb-[16px]">
                <Badge variant="subtle" size="sm">
                  {cap.requiredChapters.length} chapters
                </Badge>
                <Badge variant="subtle" size="sm">
                  {cap.steps.length} steps
                </Badge>
                <Badge variant="accent" size="sm">
                  ≈ {cap.estimatedMinutes} min
                </Badge>
              </div>
              <div className="eyebrow-accent text-[12px] tracking-[.14em]">
                Start the build →
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="flex justify-between mt-[40px] pt-[20px] border-t border-border">
        <Link to="/tracks" className="eyebrow-muted-link">← Tracks</Link>
        <Link to="/me" className="eyebrow-muted-link">Progress →</Link>
      </div>
    </section>
  );
}
