import { Link, createFileRoute } from '@tanstack/react-router';

import { CHAPTER_META, MANIFEST, type ChapterId } from '@/labs/data/manifest';
import { NavCard, NavCardGrid } from '@/components/ui/NavCard';

export const Route = createFileRoute('/reference')({
  component: Reference,
});

const DIFFICULTY_LABEL: Record<'intro' | 'core' | 'advanced', string> = {
  intro: 'Intro',
  core: 'Core',
  advanced: 'Advanced',
};

function Reference() {
  const chapters: ChapterId[] = ['ch1', 'ch2', 'ch3', 'ch4'];
  const sandboxes = MANIFEST.filter((l) => l.number.startsWith('A.'));

  const equationCount = MANIFEST.filter(
    (l) => (l.kind ?? 'equation') === 'equation' && !l.number.startsWith('A.'),
  ).length;
  const experimentalCount = MANIFEST.filter((l) => l.kind === 'experimental').length;
  const sandboxCount = sandboxes.length;

  const equationCard = (lab: (typeof MANIFEST)[number]) => (
    <NavCard
      key={lab.slug}
      to="/labs/$slug"
      params={{ slug: lab.slug }}
      className="gap-md relative flex flex-col"
    >
      <span className="font-3 text-1 text-text-muted tracking-4 uppercase">Lab {lab.number}</span>
      <span className="font-2 tracking-1 text-text text-8 leading-1 font-light">{lab.title}</span>
      <span className="font-4 text-5 text-accent leading-3 font-normal tracking-normal italic">
        {lab.formula}
      </span>
      <span className="text-4 text-text-dim leading-4">{lab.blurb}</span>
    </NavCard>
  );

  const experimentalCard = (lab: (typeof MANIFEST)[number]) => {
    const firstSoftware = lab.software?.[0]?.name;
    const equipmentCount = lab.equipment?.length ?? 0;
    const toolsLine = [firstSoftware, equipmentCount > 0 ? `${equipmentCount} items` : null]
      .filter(Boolean)
      .join(' · ');

    return (
      <NavCard
        key={lab.slug}
        to="/labs/$slug"
        params={{ slug: lab.slug }}
        className="gap-md relative flex flex-col"
      >
        <span className="font-3 text-1 text-text-muted tracking-4 uppercase">Lab {lab.number}</span>
        <span className="font-2 tracking-1 text-text text-8 leading-1 font-light">
          {lab.title}
        </span>
        <div className="gap-sm flex flex-wrap items-center">
          <span className="font-3 text-1 text-accent border-accent-soft bg-accent-soft rounded-2 px-sm py-xxs tracking-4 uppercase border">
            Experimental
          </span>
          {lab.runtime && (
            <span className="font-3 text-1 text-text-dim border-border rounded-2 px-sm py-xxs tracking-4 uppercase border">
              {lab.runtime}
            </span>
          )}
          {lab.difficulty && (
            <span className="font-3 text-1 text-text-dim border-border rounded-2 px-sm py-xxs tracking-4 uppercase border">
              {DIFFICULTY_LABEL[lab.difficulty]}
            </span>
          )}
        </div>
        {toolsLine && (
          <span className="font-3 text-2 text-text-muted tracking-3 uppercase">{toolsLine}</span>
        )}
        <span className="text-4 text-text-dim leading-4">{lab.blurb}</span>
      </NavCard>
    );
  };

  const labRow = (lab: (typeof MANIFEST)[number]) =>
    lab.kind === 'experimental' ? experimentalCard(lab) : equationCard(lab);

  const anchorTargets: Array<{ id: string; label: string }> = [
    { id: 'sandbox', label: 'Sandboxes' },
    ...chapters.map((cid) => ({ id: cid, label: `Ch.${CHAPTER_META[cid].eyebrow.replace(/^Chapter\s+/, '')} — ${CHAPTER_META[cid].title}` })),
  ];

  return (
    <>
      <section className="px-3xl pb-4xl max-w-page-lg mx-auto pt-[180px]">
        <div className="eyebrow-rule mb-2xl text-2">Appendix · Equation labs + sandboxes</div>
        <h1 className="font-2 mb-2xl max-w-[14ch] text-[clamp(56px,9vw,124px)] leading-1 font-light tracking-[-.035em]">
          The <em className="text-accent font-normal italic">equations</em>, one at a time.
        </h1>
        <p className="max-w-col text-text-dim text-[21px] leading-4 font-light">
          {equationCount} interactive equation labs, {experimentalCount} hands-on experimental labs,
          and {sandboxCount} integrated system sandboxes. Each equation lab has full sliders, live
          readouts, a visualization, a long-form math walkthrough, and a per-page sources block. The
          experimental labs are university-style procedures with real equipment or web tools. The
          sandboxes stitch multiple chapters together: circuits, house wiring, motors, EVs, grids,
          RF links, and power supplies.
        </p>
        <p className="max-w-col text-text-dim mt-xl text-[21px] leading-4 font-light">
          Reading the textbook chapters? These are linked from inside each chapter as "Go deeper"
          pages. You can also browse them directly here.{' '}
          <Link
            to="/"
            style={{ color: 'var(--accent)', textDecoration: 'none', borderBottom: '1px dotted' }}
          >
            ← Back to the textbook
          </Link>
        </p>
      </section>

      <nav
        aria-label="Reference sections"
        className="px-3xl max-w-page-lg mb-3xl mx-auto"
      >
        <ul className="border-border-strong gap-md flex flex-wrap items-center border-t border-b py-md m-0 p-0 list-none">
          {anchorTargets.map((t) => (
            <li key={t.id} className="m-0 p-0">
              <a
                href={`#${t.id}`}
                className="eyebrow-accent text-2 tracking-3 hover:text-text no-underline"
              >
                {t.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {sandboxes.length > 0 && (
        <section className="mb-3xl scroll-mt-4xl" id="sandbox">
          <div className="mb-2xl pb-xl border-border-strong gap-xl flex flex-wrap items-baseline justify-between border-b">
            <div>
              <div className="eyebrow-accent text-2 tracking-4">System sandboxes</div>
              <h2 className="font-2 tracking-1 text-text text-[clamp(36px,5vw,56px)] leading-none font-light">
                Put the chapters together
              </h2>
            </div>
            <p className="text-6 text-text-dim max-w-col-sm text-right leading-4 max-md:text-left">
              The free-form playgrounds. Build circuits, wire houses, drive motors, run grids, match
              antennas, and design power supplies. These are the labs that test whether the isolated
              equations have become one working model in your head.
            </p>
          </div>
          <NavCardGrid>{sandboxes.map(labRow)}</NavCardGrid>
        </section>
      )}

      <div className="toc">
        {chapters.map((cid) => {
          const meta = CHAPTER_META[cid];
          const chapterLabs = MANIFEST.filter(
            (l) => l.chapter === cid && !l.number.startsWith('A.'),
          );
          const equationLabs = chapterLabs.filter((l) => (l.kind ?? 'equation') === 'equation');
          const experimentalLabs = chapterLabs.filter((l) => l.kind === 'experimental');
          return (
            <section className="mb-4xl scroll-mt-4xl" id={cid} key={cid}>
              <div className="mb-2xl pb-xl border-border-strong gap-xl flex flex-wrap items-baseline justify-between border-b">
                <div>
                  <div className="eyebrow-accent text-2 tracking-4">{meta.eyebrow}</div>
                  <h2 className="font-2 tracking-1 text-text text-[clamp(36px,5vw,56px)] leading-none font-light">
                    {meta.title}
                  </h2>
                </div>
                <p className="text-6 text-text-dim max-w-col-sm text-right leading-4 max-md:text-left">
                  {meta.blurb}
                </p>
              </div>

              {equationLabs.length > 0 && <NavCardGrid>{equationLabs.map(labRow)}</NavCardGrid>}

              {experimentalLabs.length > 0 && (
                <div className="mt-2xl">
                  <div className="eyebrow-muted text-2 tracking-4 mb-lg">
                    Experimental — hands-on
                  </div>
                  <NavCardGrid>{experimentalLabs.map(labRow)}</NavCardGrid>
                </div>
              )}
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
