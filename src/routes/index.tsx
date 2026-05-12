import { Link, createFileRoute } from '@tanstack/react-router';

import { CHAPTERS } from '@/textbook/data/chapters';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  return (
    <>
      <section className="book-hero">
        <div className="imprint">Field · Theory · An interactive textbook · v0.4</div>
        <h1>
          The field is the <em>thing</em>.
        </h1>
        <p className="lede">
          Most people learn electricity through a broken metaphor — electrons rushing through a wire like water in a pipe.
          The real story, the one Maxwell wrote down and Poynting finished, is stranger and more beautiful.
          {' '}<strong>Electrons crawl. Energy sprints. And it doesn't travel inside the wire at all.</strong>
        </p>
        <p className="lede" style={{ marginTop: 22 }}>
          This is a textbook in six chapters. Each chapter is a long-form essay with embedded interactive demonstrations
          you can play with as you read — small canvases, a few sliders, focused on answering one question. When you want
          the full math, the equation labs in the {' '}
          <Link to="/reference" style={{ color: 'var(--accent)', textDecoration: 'none', borderBottom: '1px dotted' }}>appendix</Link>
          {' '} are one click away.
        </p>
      </section>

      <div className="toc">
        <div className="chapter-grid">
          {CHAPTERS.map(c => (
            <Link
              key={c.slug}
              to="/textbook/$chapterSlug"
              params={{ chapterSlug: c.slug }}
              className="chapter-card"
            >
              <span className="chap-num">Chapter {c.number}</span>
              <span className="chap-title">{c.title}</span>
              <span className="chap-subtitle">{c.subtitle}</span>
              <span className="chap-blurb">{c.blurb}</span>
              <span className="chap-cta">Read chapter →</span>
            </Link>
          ))}
        </div>
      </div>

      <footer>
        <div className="colophon">
          <span>Field · Theory · 6 chapters · 16 equation labs · vanilla physics, real sources</span>
          <span>
            <Link to="/reference" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
              Equation appendix →
            </Link>
          </span>
        </div>
      </footer>
    </>
  );
}
