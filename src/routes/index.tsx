import { Link, createFileRoute } from '@tanstack/react-router';

import { CHAPTERS } from '@/textbook/data/chapters';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  return (
    <>
      <section className="px-3xl pb-4xl max-w-page-lg mx-auto pt-[180px]">
        <div className="eyebrow-rule mb-2xl text-2">
          Field · Theory · An interactive textbook · v0.4
        </div>
        <h1 className="font-2 mb-2xl max-w-[14ch] text-[clamp(56px,9vw,124px)] leading-1 font-light tracking-[-.035em]">
          The field is the <em className="text-accent font-normal italic">thing</em>.
        </h1>
        <p className="max-w-col text-text-dim text-[21px] leading-4 font-light">
          Most people learn electricity through a broken metaphor — electrons rushing through a wire
          like water in a pipe. The real story, the one Maxwell wrote down and Poynting finished, is
          stranger and more beautiful.{' '}
          <strong className="text-text font-medium">
            Electrons crawl. Energy sprints. And it doesn't travel inside the wire at all.
          </strong>
        </p>
        <p className="max-w-col text-text-dim mt-xl text-[21px] leading-4 font-light">
          This is a textbook in six chapters. Each chapter is a long-form essay with embedded
          interactive demonstrations you can play with as you read — small canvases, a few sliders,
          focused on answering one question. When you want the full math, the equation labs in the{' '}
          <Link
            to="/reference"
            style={{ color: 'var(--accent)', textDecoration: 'none', borderBottom: '1px dotted' }}
          >
            appendix
          </Link>{' '}
          are one click away.
        </p>
      </section>

      <div className="toc">
        <div className="bg-border border-border mt-4xl grid grid-cols-2 gap-px border max-lg:grid-cols-1">
          {CHAPTERS.map((c) => (
            <Link
              key={c.slug}
              to="/textbook/$chapterSlug"
              params={{ chapterSlug: c.slug }}
              className="group bg-bg py-3xl px-3xl gap-md min-h-panel hover:bg-bg-card-hover relative flex flex-col text-inherit no-underline transition-colors duration-150"
            >
              <span className="eyebrow-accent text-2 tracking-4">Chapter {c.number}</span>
              <span className="font-2 text-9 tracking-1 text-text leading-1 font-light">
                {c.title}
              </span>
              <span className="font-2 text-7 text-accent -mt-sm font-light italic">
                {c.subtitle}
              </span>
              <span className="text-text-dim text-5 leading-4">{c.blurb}</span>
              <span className="font-3 text-1 text-text-muted tracking-4 pt-lg gap-sm group-hover:text-accent mt-auto flex items-center uppercase">
                Read chapter →
              </span>
            </Link>
          ))}
        </div>
      </div>

      <footer>
        <div className="colophon">
          <span>
            Field · Theory · 6 chapters · 16 equation labs · vanilla physics, real sources
          </span>
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
