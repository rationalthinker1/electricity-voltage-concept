import { Link, createFileRoute } from '@tanstack/react-router';

import { CAPSTONES } from '@/textbook/data/capstones';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import '@/styles/capstones.css';

export const Route = createFileRoute('/capstones')({
  component: CapstonesIndex,
});

function CapstonesIndex() {
  return (
    <section className="capstones-page">
      <header className="capstones-header">
        <div className="capstones-eyebrow">Field · Theory · Capstones</div>
        <h1>
          Three <em>integration</em> projects.
        </h1>
        <p className="capstones-lede">
          The textbook chapters teach concepts one at a time. The
          capstones force you to integrate four to eight of them at
          once: design a real wall-wart, follow your electric bill back
          to the generator, build an AM radio receiver. Each one is a
          guided walkthrough — problem statement, sub-tasks with
          hidden-then-revealed worked solutions, and a stretch goal
          that pushes beyond the chapter content.
        </p>
      </header>

      <div className="capstones-grid">
        {CAPSTONES.map(cap => (
          <Link
            key={cap.id}
            to="/capstone/$id"
            params={{ id: cap.id }}
            className="capstones-card-link"
          >
            <Card variant="elevated" accent="accent" className="capstones-card">
              <div className="capstones-card-num">Capstone {cap.number}</div>
              <h2 className="capstones-card-title">{cap.title}</h2>
              <p className="capstones-card-sub">{cap.subtitle}</p>
              <div className="capstones-card-meta">
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
              <div className="capstones-card-cta">
                Start the build →
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="capstones-footer">
        <Link to="/tracks" className="capstones-back">← Tracks</Link>
        <Link to="/me" className="capstones-back">Progress →</Link>
      </div>
    </section>
  );
}
