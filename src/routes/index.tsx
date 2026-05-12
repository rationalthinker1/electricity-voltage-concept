import { Link, createFileRoute } from '@tanstack/react-router';

import { CHAPTER_META, MANIFEST, type ChapterId } from '@/labs/data/manifest';

export const Route = createFileRoute('/')({
  component: TableOfContents,
});

function TableOfContents() {
  const chapters: ChapterId[] = ['ch1', 'ch2', 'ch3', 'ch4'];
  return (
    <>
      <section className="book-hero">
        <div className="imprint">Field · Theory · An interactive textbook · v0.3</div>
        <h1>
          The field is the <em>thing</em>.
        </h1>
        <p className="lede">
          Most people learn electricity through a broken metaphor — electrons rushing through a wire like water in a pipe.
          The real story, the one Maxwell wrote down and Poynting finished, is stranger and more beautiful.
          {' '}<strong>Electrons crawl. Energy sprints. And it doesn't travel inside the wire at all.</strong>
        </p>
        <p className="lede" style={{ marginTop: 22 }}>
          This is a textbook in sixteen interactive labs. One equation per lab. Each equation has its own page —
          sliders to play with the variables, real-time computed outputs, a visualization, a long-form deep dive,
          and a sources list at the bottom so you can chase the physics back to its origin.
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
          <span>Field · Theory · 16 interactive labs · vanilla physics, real sources</span>
          <span>v0.3</span>
        </div>
      </footer>
    </>
  );
}
