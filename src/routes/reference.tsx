import { Link, createFileRoute } from '@tanstack/react-router';

import { CHAPTER_META, MANIFEST, type ChapterId } from '@/labs/data/manifest';

export const Route = createFileRoute('/reference')({
  component: Reference,
});

function Reference() {
  const chapters: ChapterId[] = ['ch1', 'ch2', 'ch3', 'ch4'];
  const sandbox = MANIFEST.find(l => l.slug === 'circuit-builder');
  return (
    <>
      <section className="book-hero">
        <div className="imprint">Appendix · Equation labs + sandboxes</div>
        <h1>The <em>equations</em>, one at a time.</h1>
        <p className="lede">
          Sixteen interactive equation labs plus integrated system sandboxes. Each lab has full sliders,
          live readouts, a visualization, a long-form math walkthrough, and a per-page sources block.
          The sandboxes stitch multiple chapters together: circuits, house wiring, motors, EVs, grids,
          RF links, and power supplies.
        </p>
        <p className="lede" style={{ marginTop: 22 }}>
          Reading the textbook chapters? These are linked from inside each chapter as "Go deeper" pages. You can also
          browse them directly here. {' '}
          <Link to="/" style={{ color: 'var(--accent)', textDecoration: 'none', borderBottom: '1px dotted' }}>
            ← Back to the textbook
          </Link>
        </p>
      </section>

      {sandbox && (
        <section className="chapter" id="sandbox" style={{ marginBottom: 48 }}>
          <div className="chapter-head">
            <div>
              <div className="chapter-num">Sandbox</div>
              <h2 className="chapter-title">Build your own circuit</h2>
            </div>
            <p className="chapter-blurb">
              The free-form playground. Drop batteries, resistors, capacitors, inductors, diodes,
              switches, and bulbs on a grid; click pin-to-pin to wire them; press Run. A live
              Modified Nodal Analysis solver runs every frame. Load a preset to inspect RC charging,
              an RLC resonator, or a half-wave rectifier — or start from scratch.
            </p>
          </div>
          <div className="lab-list">
            <Link
              to="/labs/$slug"
              params={{ slug: sandbox.slug }}
              className="lab-row"
            >
              <span className="lab-id">Lab {sandbox.number}</span>
              <span
                className="lab-eq"
                dangerouslySetInnerHTML={{ __html: sandbox.formula }}
              />
              <span className="lab-name">{sandbox.title}</span>
              <span className="lab-blurb">{sandbox.blurb}</span>
            </Link>
          </div>
        </section>
      )}

      <div className="toc">
        {chapters.map(cid => {
          const meta = CHAPTER_META[cid];
          const labs = MANIFEST.filter(l => l.chapter === cid && l.slug !== 'circuit-builder');
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
          <span>Field · Theory · Equation appendix · labs + sandboxes</span>
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
