import { Link, createFileRoute } from '@tanstack/react-router';

import { CAPSTONES } from '@/textbook/data/capstones';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export const Route = createFileRoute('/capstones')({
  component: CapstonesIndex,
});

function CapstonesIndex() {
  return (
    <section className="page-shell max-w-page">
      <header className="mb-2xl">
        <div className="eyebrow-muted tracking-4 mb-lg">Field · Theory · Capstones</div>
        <h1 className="hero-display max-md:text-9">
          Three <em>integration</em> projects.
        </h1>
        <p className="body-copy max-w-page-sm">
          The textbook chapters teach concepts one at a time. The capstones force you to integrate
          four to eight of them at once: design a real wall-wart, follow your electric bill back to
          the generator, build an AM radio receiver. Each one is a guided walkthrough — problem
          statement, sub-tasks with hidden-then-revealed worked solutions, and a stretch goal that
          pushes beyond the chapter content.
        </p>
      </header>

      <div className="gap-xl mt-2xl grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))]">
        {CAPSTONES.map((cap) => (
          <Link
            key={cap.id}
            to="/capstone/$id"
            params={{ id: cap.id }}
            className="hover:-translate-y-xxs block text-inherit no-underline transition-transform duration-150 ease-out"
          >
            <Card variant="elevated" accent="accent" className="h-full">
              <div className="eyebrow-accent text-2 tracking-3 mb-md">Capstone {cap.number}</div>
              <h2 className="title-display text-8 mb-md leading-2">{cap.title}</h2>
              <p className="body-copy text-5 mb-lg m-0 leading-4">{cap.subtitle}</p>
              <div className="gap-sm mb-lg flex flex-wrap">
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
              <div className="eyebrow-accent text-3 tracking-3">Start the build →</div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-3xl pt-lg border-border flex justify-between border-t">
        <Link to="/tracks" className="eyebrow-muted-link">
          ← Tracks
        </Link>
        <Link to="/me" className="eyebrow-muted-link">
          Progress →
        </Link>
      </div>
    </section>
  );
}
