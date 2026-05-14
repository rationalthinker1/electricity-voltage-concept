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
            className={clsx('nav-pill', activeChapter === c.slug && 'nav-pill-active')}
            title={`Ch.${c.number} — ${c.title}`}
          >
            {c.number}
          </Link>
        ))}
        <Link
          to="/reference"
          className={clsx('nav-pill-divider', pathname === '/reference' && 'nav-pill-active')}
          title="Equation labs (appendix)"
        >
          Labs
        </Link>
        <Link
          to="/labs/$slug"
          params={{ slug: 'circuit-builder' }}
          className={clsx('nav-pill', pathname === '/labs/circuit-builder' && 'nav-pill-active')}
          title="Free-form circuit-builder sandbox"
        >
          Build
        </Link>
        <Link
          to="/map"
          className={clsx('nav-pill', pathname === '/map' && 'nav-pill-active')}
          title="Course map · prerequisite DAG"
        >
          Map
        </Link>
        <Link
          to="/tracks"
          className={clsx('nav-pill', pathname === '/tracks' && 'nav-pill-active')}
          title="Preset curriculum tracks"
        >
          Tracks
        </Link>
        <Link
          to="/capstones"
          className={clsx('nav-pill', pathname.startsWith('/capstone') && 'nav-pill-active')}
          title="Capstone integration projects"
        >
          Capstones
        </Link>
        <Link
          to="/me"
          className={clsx('nav-pill', pathname === '/me' && 'nav-pill-active')}
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
