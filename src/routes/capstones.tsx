import { Link, createFileRoute } from '@tanstack/react-router';

import { CAPSTONES } from '@/textbook/data/capstones';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export const Route = createFileRoute('/capstones')({
  component: CapstonesIndex,
});

function CapstonesIndex() {
  return (
    <section className="page-shell pt-5xl max-w-page">
      <header className="mb-2xl">
        <div className="eyebrow-muted tracking-4 mb-lg">Field · Theory · Capstones</div>
        <h1 className="hero-display max-md:text-9">
          Three <em>integration</em> projects.
        </h1>
        <p className="body-copy max-w-page-sm">
          The textbook chapters teach concepts one at a time. The
          capstones force you to integrate four to eight of them at
          once: design a real wall-wart, follow your electric bill back
          to the generator, build an AM radio receiver. Each one is a
          guided walkthrough — problem statement, sub-tasks with
          hidden-then-revealed worked solutions, and a stretch goal
          that pushes beyond the chapter content.
        </p>
      </header>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-xl mt-2xl">
        {CAPSTONES.map(cap => (
          <Link
            key={cap.id}
            to="/capstone/$id"
            params={{ id: cap.id }}
            className="no-underline text-inherit block transition-transform duration-150 ease-out hover:-translate-y-[2px]"
          >
            <Card variant="elevated" accent="accent" className="h-full">
              <div className="eyebrow-accent text-2 tracking-3 mb-md">Capstone {cap.number}</div>
              <h2 className="title-display text-8 leading-[1.18] mb-md">{cap.title}</h2>
              <p className="body-copy text-5 leading-[1.5] m-0 mb-lg">{cap.subtitle}</p>
              <div className="flex flex-wrap gap-sm mb-lg">
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
              <div className="eyebrow-accent text-3 tracking-3">
                Start the build →
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="flex justify-between mt-3xl pt-lg border-t border-border">
        <Link to="/tracks" className="eyebrow-muted-link">← Tracks</Link>
        <Link to="/me" className="eyebrow-muted-link">Progress →</Link>
      </div>
    </section>
  );
}
