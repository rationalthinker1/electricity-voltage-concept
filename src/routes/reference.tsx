import { Link, createFileRoute } from '@tanstack/react-router';

import { CHAPTER_META, MANIFEST, type ChapterId } from '@/labs/data/manifest';

export const Route = createFileRoute('/reference')({
  component: Reference,
});

function Reference() {
  const chapters: ChapterId[] = ['ch1', 'ch2', 'ch3', 'ch4'];
  return (
    <>
      <section className="book-hero">
        <div className="imprint">Appendix · Equation labs</div>
        <h1>The <em>equations</em>, one at a time.</h1>
        <p className="lede">
          Sixteen interactive labs, one per fundamental equation in classical electromagnetism. Each lab has full sliders,
          live readouts, a visualization, a long-form math walkthrough, and a per-page sources block.
        </p>
        <p className="lede" style={{ marginTop: 22 }}>
          Reading the textbook chapters? These are linked from inside each chapter as "Go deeper" pages. You can also
          browse them directly here. {' '}
          <Link to="/" style={{ color: 'var(--accent)', textDecoration: 'none', borderBottom: '1px dotted' }}>
            ← Back to the textbook
          </Link>
        </p>
      </section>

      <div className="toc">
        {chapters.map(cid => {
          const meta = CHAPTER_META[cid];
          const labs = MANIFEST.filter(l => l.chapter === cid);
          return (
            <section className="chapter" id={cid} key={cid}>
              <div className="chapter-head">
                <div>
                  <div className="chapter-num">{meta.eyebrow}</div>
                  <h2 className="chapter-title">{meta.title}</h2>
                </div>
                <p className="chapter-blurb">{meta.blurb}</p>
              </div>

              <div className="lab-list">
                {labs.map(lab => (
                  <Link
                    key={lab.slug}
                    to="/labs/$slug"
                    params={{ slug: lab.slug }}
                    className="lab-row"
                  >
                    <span className="lab-id">Lab {lab.number}</span>
                    <span
                      className="lab-eq"
                      dangerouslySetInnerHTML={{ __html: lab.formula }}
                    />
                    <span className="lab-name">{lab.title}</span>
                    <span className="lab-blurb">{lab.blurb}</span>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <footer>
        <div className="colophon">
          <span>Field · Theory · Equation appendix · 16 labs</span>
          <span>
            <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
              ↑ Back to chapters
            </Link>
          </span>
        </div>
      </footer>
    </>
  );
}
