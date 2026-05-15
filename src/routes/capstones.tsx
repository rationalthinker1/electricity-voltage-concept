import { Link, createFileRoute } from '@tanstack/react-router';

import { CAPSTONES } from '@/textbook/data/capstones';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export const Route = createFileRoute('/capstones')({
  component: CapstonesIndex,
});

function CapstonesIndex() {
  return (
    <section className="pt-[140px] pb-[80px] px-[40px] max-w-[1200px] mx-auto max-[760px]:pt-[120px] max-[760px]:pb-[60px] max-[760px]:px-[18px]">
      <header className="mb-[32px]">
        <div className="eyebrow-muted tracking-[.18em] mb-[12px]">Field · Theory · Capstones</div>
        <h1 className="title-display font-light text-[52px] leading-[1.05] tracking-[-.02em] mb-[14px] max-[760px]:text-[34px] [&_em]:italic [&_em]:text-accent [&_em]:font-normal">
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
              <div className="font-3 text-[11px] text-accent uppercase tracking-[.14em] mb-[10px]">Capstone {cap.number}</div>
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
              <div className="font-3 text-[12px] text-accent uppercase tracking-[.14em]">
                Start the build →
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="flex justify-between mt-[40px] pt-[20px] border-t border-border">
        <Link to="/tracks" className="eyebrow-muted text-[12px] no-underline hover:text-accent">← Tracks</Link>
        <Link to="/me" className="eyebrow-muted text-[12px] no-underline hover:text-accent">Progress →</Link>
      </div>
    </section>
  );
}
