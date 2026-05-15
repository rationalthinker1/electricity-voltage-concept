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
      className="nav-item flex flex-col gap-md relative"
    >
      <span className="font-3 text-1 text-text-muted tracking-4 uppercase">Lab {lab.number}</span>
      <span className="font-4 italic font-normal text-8 tracking-normal text-accent leading-3">
        {lab.formula}
      </span>
      <span className="text-6 text-text font-medium">{lab.title}</span>
      <span className="text-4 text-text-dim leading-4">{lab.blurb}</span>
    </Link>
  );

  return (
    <>
      <section className="mx-auto pt-[180px] px-3xl pb-4xl max-w-page-lg">
        <div className="eyebrow-rule mb-2xl text-2">Appendix · Equation labs + sandboxes</div>
        <h1 className="font-2 font-light leading-1 mb-2xl max-w-[14ch] text-[clamp(56px,9vw,124px)] tracking-[-.035em]">The <em className="italic text-accent font-normal">equations</em>, one at a time.</h1>
        <p className="font-light leading-4 max-w-col text-text-dim text-[21px]">
          Sixteen interactive equation labs plus integrated system sandboxes. Each lab has full sliders,
          live readouts, a visualization, a long-form math walkthrough, and a per-page sources block.
          The sandboxes stitch multiple chapters together: circuits, house wiring, motors, EVs, grids,
          RF links, and power supplies.
        </p>
        <p className="font-light leading-4 max-w-col text-text-dim text-[21px] mt-xl">
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
              <div className="eyebrow-accent text-2 tracking-4">System sandboxes</div>
              <h2 className="font-2 font-light text-[clamp(36px,5vw,56px)] tracking-1 text-text leading-none">Put the chapters together</h2>
            </div>
            <p className="text-6 text-text-dim max-w-col-sm text-right max-md:text-left leading-4">
              The free-form playgrounds. Build circuits, wire houses, drive motors, run grids,
              match antennas, and design power supplies. These are the labs that test whether the
              isolated equations have become one working model in your head.
            </p>
          </div>
          <div className="card-grid">
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
                  <div className="eyebrow-accent text-2 tracking-4">{meta.eyebrow}</div>
                  <h2 className="font-2 font-light text-[clamp(36px,5vw,56px)] tracking-1 text-text leading-none">{meta.title}</h2>
                </div>
                <p className="text-6 text-text-dim max-w-col-sm text-right max-md:text-left leading-4">{meta.blurb}</p>
              </div>

              <div className="card-grid">
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
