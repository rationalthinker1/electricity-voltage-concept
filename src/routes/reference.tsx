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
      className="bg-bg py-2xl px-2xl no-underline text-inherit flex flex-col gap-md transition-colors relative hover:bg-bg-card-hover"
    >
      <span className="font-3 text-1 text-text-muted tracking-4 uppercase">Lab {lab.number}</span>
      <span
        className="font-4 italic font-normal text-8 tracking-normal text-accent leading-3 [&_sub]:text-[.6em] [&_sup]:text-[.6em] [&_sub]:leading-none [&_sup]:leading-none [&_sub]:align-[-.32em] [&_sup]:align-[.5em]"
        dangerouslySetInnerHTML={{ __html: lab.formula }}
      />
      <span className="text-6 text-text font-medium">{lab.title}</span>
      <span className="text-4 text-text-dim leading-4">{lab.blurb}</span>
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
        <section className="mb-3xl scroll-mt-4xl" id="sandbox">
          <div className="flex items-baseline justify-between mb-2xl pb-xl border-b border-border-strong gap-xl flex-wrap">
            <div>
              <div className="font-3 text-2 text-accent uppercase tracking-4">System sandboxes</div>
              <h2 className="font-2 font-light text-[clamp(36px,5vw,56px)] tracking-1 text-text leading-none [&_em]:italic [&_em]:text-accent [&_em]:font-normal">Put the chapters together</h2>
            </div>
            <p className="text-6 text-text-dim max-w-col-sm text-right max-md:text-left leading-4">
              The free-form playgrounds. Build circuits, wire houses, drive motors, run grids,
              match antennas, and design power supplies. These are the labs that test whether the
              isolated equations have become one working model in your head.
            </p>
          </div>
          <div className="grid grid-cols-2 max-md:grid-cols-1 gap-px bg-border border border-border">
            {sandboxes.map(labRow)}
          </div>
        </section>
      )}

      <div className="toc">
        {chapters.map(cid => {
          const meta = CHAPTER_META[cid];
          const labs = MANIFEST.filter(l => l.chapter === cid && !l.number.startsWith('A.'));
          return (
            <section className="mb-4xl scroll-mt-4xl" id={cid} key={cid}>
              <div className="flex items-baseline justify-between mb-2xl pb-xl border-b border-border-strong gap-xl flex-wrap">
                <div>
                  <div className="font-3 text-2 text-accent uppercase tracking-4">{meta.eyebrow}</div>
                  <h2 className="font-2 font-light text-[clamp(36px,5vw,56px)] tracking-1 text-text leading-none [&_em]:italic [&_em]:text-accent [&_em]:font-normal">{meta.title}</h2>
                </div>
                <p className="text-6 text-text-dim max-w-col-sm text-right max-md:text-left leading-4">{meta.blurb}</p>
              </div>

              <div className="grid grid-cols-2 max-md:grid-cols-1 gap-px bg-border border border-border">
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
