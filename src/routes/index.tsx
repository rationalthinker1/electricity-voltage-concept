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
        <div className="grid grid-cols-2 max-lg:grid-cols-1 gap-px bg-border border border-border mt-4xl">
          {CHAPTERS.map(c => (
            <Link
              key={c.slug}
              to="/textbook/$chapterSlug"
              params={{ chapterSlug: c.slug }}
              className="group bg-bg py-3xl px-3xl no-underline text-inherit flex flex-col gap-md transition-colors duration-150 relative min-h-panel hover:bg-bg-card-hover"
            >
              <span className="font-3 text-2 text-accent tracking-4 uppercase">Chapter {c.number}</span>
              <span className="font-2 font-light text-9 leading-1 tracking-1 text-text">{c.title}</span>
              <span className="font-2 italic font-light text-7 text-accent -mt-sm">{c.subtitle}</span>
              <span className="text-text-dim text-5 leading-4">{c.blurb}</span>
              <span className="font-3 text-1 text-text-muted tracking-4 uppercase mt-auto pt-lg flex items-center gap-sm group-hover:text-accent">Read chapter →</span>
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
