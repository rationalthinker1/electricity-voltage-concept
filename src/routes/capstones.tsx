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
        <div className="font-3 text-[11px] text-text-muted uppercase tracking-[.18em] mb-[12px]">Field · Theory · Capstones</div>
        <h1 className="font-2 italic font-light text-[52px] leading-[1.05] tracking-[-.02em] text-color-4 m-0 mb-[14px] max-[760px]:text-[34px] [&_em]:italic [&_em]:text-accent [&_em]:font-normal">
          Three <em>integration</em> projects.
        </h1>
        <p className="font-1 text-[16px] leading-[1.6] text-color-5 max-w-[720px]">
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
              <h2 className="font-2 italic text-[26px] leading-[1.18] m-0 mb-[8px] text-color-4">{cap.title}</h2>
              <p className="font-1 text-[14px] text-color-5 leading-[1.5] m-0 mb-[16px]">{cap.subtitle}</p>
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
        <Link to="/tracks" className="font-3 text-[12px] text-text-muted uppercase tracking-[.12em] no-underline hover:text-accent">← Tracks</Link>
        <Link to="/me" className="font-3 text-[12px] text-text-muted uppercase tracking-[.12em] no-underline hover:text-accent">Progress →</Link>
      </div>
    </section>
  );
}
