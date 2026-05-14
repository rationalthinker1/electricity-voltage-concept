import { Link, useRouterState } from '@tanstack/react-router';
import clsx from 'clsx';

import { CHAPTERS } from '@/textbook/data/chapters';
import { MANIFEST } from '@/labs/data/manifest';

const TOTAL_CHAPTERS = CHAPTERS.length;

interface TopNavProps {
  themeMode: 'system' | 'light' | 'dark';
  resolvedTheme: 'light' | 'dark';
  onCycleTheme: () => void;
}

/**
 * Sticky top nav. With 11 chapters the pills are too many for inline titles,
 * so we show just the chapter number ("1", "2", ..., "11") with the full
 * title in the title attribute, plus a single "Labs" link to the appendix.
 * Active chapter highlighted in amber.
 */
export function TopNav({ themeMode, resolvedTheme, onCycleTheme }: TopNavProps) {
  const router = useRouterState();
  const pathname = router.location.pathname;

  let activeChapter: string | null = null;
  let pageMeta = 'An interactive textbook · v.07';

  if (pathname.startsWith('/textbook/')) {
    const slug = pathname.split('/')[2];
    const c = CHAPTERS.find(ch => ch.slug === slug);
    if (c) { activeChapter = c.slug; pageMeta = `Chapter ${c.number} / ${TOTAL_CHAPTERS}`; }
  } else if (pathname.startsWith('/labs/')) {
    const labSlug = pathname.split('/')[2];
    const lab = MANIFEST.find(l => l.slug === labSlug);
    if (lab) {
      pageMeta = `Lab ${lab.number} · appendix`;
      const related = CHAPTERS.find(ch => ch.relatedLabs.includes(labSlug));
      if (related) activeChapter = related.slug;
    }
  } else if (pathname === '/reference') {
    pageMeta = 'Equation appendix';
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-[998] py-[22px] px-[40px] flex justify-between items-center border-b border-border bg-[linear-gradient(180deg,var(--nav-bg-start),var(--nav-bg-end))] backdrop-blur-[12px] max-[760px]:py-lg max-[760px]:px-xl max-[760px]:flex-wrap max-[760px]:gap-md">
      <Link to="/" className="font-2 italic font-light text-[20px] tracking-[-.02em] text-color-4 no-underline [&_span]:text-accent">
        Field <span>·</span> Theory
      </Link>
      <div className="flex gap-[14px] items-center max-[900px]:gap-[9px] max-[760px]:gap-[14px]">
        {CHAPTERS.map(c => (
          <Link
            key={c.slug}
            to="/textbook/$chapterSlug"
            params={{ chapterSlug: c.slug }}
            className={clsx(
              'font-3 text-[12px] text-text-muted no-underline uppercase tracking-[.12em] min-w-[22px] text-center py-[2px] px-0 transition-colors hover:text-color-4 max-[900px]:text-[11px] max-[760px]:text-[10px]',
              activeChapter === c.slug && 'text-accent',
            )}
            title={`Ch.${c.number} — ${c.title}`}
          >
            {c.number}
          </Link>
        ))}
        <Link
          to="/reference"
          className={clsx(
            'font-3 text-[12px] text-text-muted no-underline uppercase tracking-[.12em] min-w-[22px] text-center py-[2px] px-0 transition-colors hover:text-color-4 border-l border-border-2 pl-lg ml-[6px] max-[900px]:text-[11px] max-[760px]:text-[10px]',
            pathname === '/reference' && 'text-accent',
          )}
          title="Equation labs (appendix)"
        >
          Labs
        </Link>
        <Link
          to="/labs/$slug"
          params={{ slug: 'circuit-builder' }}
          className={clsx('font-3 text-[12px] text-text-muted no-underline uppercase tracking-[.12em] min-w-[22px] text-center py-[2px] px-0 transition-colors hover:text-color-4 max-[900px]:text-[11px] max-[760px]:text-[10px]', pathname === '/labs/circuit-builder' && 'text-accent')}
          title="Free-form circuit-builder sandbox"
        >
          Build
        </Link>
        <Link
          to="/map"
          className={clsx('font-3 text-[12px] text-text-muted no-underline uppercase tracking-[.12em] min-w-[22px] text-center py-[2px] px-0 transition-colors hover:text-color-4 max-[900px]:text-[11px] max-[760px]:text-[10px]', pathname === '/map' && 'text-accent')}
          title="Course map · prerequisite DAG"
        >
          Map
        </Link>
        <Link
          to="/tracks"
          className={clsx('font-3 text-[12px] text-text-muted no-underline uppercase tracking-[.12em] min-w-[22px] text-center py-[2px] px-0 transition-colors hover:text-color-4 max-[900px]:text-[11px] max-[760px]:text-[10px]', pathname === '/tracks' && 'text-accent')}
          title="Preset curriculum tracks"
        >
          Tracks
        </Link>
        <Link
          to="/capstones"
          className={clsx('font-3 text-[12px] text-text-muted no-underline uppercase tracking-[.12em] min-w-[22px] text-center py-[2px] px-0 transition-colors hover:text-color-4 max-[900px]:text-[11px] max-[760px]:text-[10px]', pathname.startsWith('/capstone') && 'text-accent')}
          title="Capstone integration projects"
        >
          Capstones
        </Link>
        <Link
          to="/me"
          className={clsx('font-3 text-[12px] text-text-muted no-underline uppercase tracking-[.12em] min-w-[22px] text-center py-[2px] px-0 transition-colors hover:text-color-4 max-[900px]:text-[11px] max-[760px]:text-[10px]', pathname === '/me' && 'text-accent')}
          title="Your reading progress"
        >
          Progress
        </Link>
      </div>
      <div className="flex items-center justify-end gap-[14px]">
        <div className="meta-1 max-[760px]:hidden">{pageMeta}</div>
        <button
          type="button"
          className="inline-flex items-center gap-sm min-h-[30px] px-[10px] border border-border-2 rounded-pill bg-color-3 text-text-muted font-3 text-[10px] leading-none tracking-[.12em] uppercase cursor-pointer transition-colors hover:text-color-4 hover:border-accent"
          onClick={onCycleTheme}
          aria-label={`Theme: ${themeMode}. Effective theme: ${resolvedTheme}. Activate to cycle theme mode.`}
          title={`Theme: ${themeMode}`}
        >
          <span
            className={clsx(
              'relative w-[14px] h-[14px] border-[1.5px] border-current rounded-pill',
              resolvedTheme === 'light' && 'bg-current shadow-[0_0_0_3px_var(--accent-soft)]',
              resolvedTheme === 'dark' && "after:content-[''] after:absolute after:-top-[2px] after:left-[5px] after:w-[11px] after:h-[11px] after:rounded-pill after:bg-bg",
            )}
            aria-hidden="true"
          />
          <span>{themeMode}</span>
        </button>
      </div>
    </nav>
  );
}
