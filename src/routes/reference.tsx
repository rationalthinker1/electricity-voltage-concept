import { Link, createFileRoute } from '@tanstack/react-router';

import { CHAPTER_META, MANIFEST, type ChapterId } from '@/labs/data/manifest';

export const Route = createFileRoute('/reference')({
  component: Reference,
});

function Reference() {
  const chapters: ChapterId[] = ['ch1', 'ch2', 'ch3', 'ch4'];
  const sandboxes = MANIFEST.filter(l => l.number.startsWith('A.'));

  const labRow = (lab: (typeof MANIFEST)[number]) => (
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
  );

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

      {sandboxes.length > 0 && (
        <section className="chapter" id="sandbox" style={{ marginBottom: 48 }}>
          <div className="chapter-head">
            <div>
              <div className="chapter-num">System sandboxes</div>
              <h2 className="chapter-title">Put the chapters together</h2>
            </div>
            <p className="chapter-blurb">
              The free-form playgrounds. Build circuits, wire houses, drive motors, run grids,
              match antennas, and design power supplies. These are the labs that test whether the
              isolated equations have become one working model in your head.
            </p>
          </div>
          <div className="lab-list">
            {sandboxes.map(labRow)}
          </div>
        </section>
      )}

      <div className="toc">
        {chapters.map(cid => {
          const meta = CHAPTER_META[cid];
          const labs = MANIFEST.filter(l => l.chapter === cid && !l.number.startsWith('A.'));
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
                {labs.map(labRow)}
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
