import { useEffect, useRef, useState } from 'react';
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

  const [chaptersOpen, setChaptersOpen] = useState(false);
  const chaptersMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => { setChaptersOpen(false); }, [pathname]);

  useEffect(() => {
    if (!chaptersOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setChaptersOpen(false);
    }
    function onClick(e: MouseEvent) {
      if (chaptersMenuRef.current && !chaptersMenuRef.current.contains(e.target as Node)) {
        setChaptersOpen(false);
      }
    }
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [chaptersOpen]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-[998] py-[22px] px-[40px] flex justify-between items-center border-b border-border bg-[linear-gradient(180deg,var(--nav-bg-start),var(--nav-bg-end))] backdrop-blur-[12px] max-[760px]:py-lg max-[760px]:px-xl max-[760px]:flex-wrap max-[760px]:gap-md">
      <Link to="/" className="title-display font-light text-[20px] tracking-[-.02em] no-underline [&_span]:text-accent">
        Field <span>·</span> Theory
      </Link>
      <div className="flex gap-[14px] items-center max-[900px]:gap-[9px] max-[760px]:gap-[14px]">
        <div ref={chaptersMenuRef} className="relative">
          <button
            type="button"
            className={clsx(
              'font-3 text-[12px] no-underline uppercase tracking-[.12em] min-w-[22px] text-center py-[2px] px-0 transition-colors hover:text-color-4 max-[900px]:text-[11px] max-[760px]:text-[10px] inline-flex items-center gap-[6px] cursor-pointer bg-transparent border-0',
              activeChapter ? 'text-accent' : 'text-text-muted',
            )}
            aria-haspopup="menu"
            aria-expanded={chaptersOpen}
            onClick={() => setChaptersOpen(o => !o)}
            title="Browse all chapters"
          >
            Chapters
            <span aria-hidden="true" className={clsx('inline-block transition-transform', chaptersOpen && 'rotate-180')}>▾</span>
          </button>
          {chaptersOpen && (
            <div
              role="menu"
              aria-label="All chapters"
              className="fixed top-[72px] left-1/2 -translate-x-1/2 z-[999] w-[min(1100px,calc(100vw-40px))] max-h-[calc(100vh-100px)] overflow-y-auto py-[28px] px-[32px] rounded-5 border border-border-2 bg-bg-elevated shadow-[0_24px_60px_var(--shadow-strong)]"
            >
              <div className="flex items-baseline justify-between mb-xl pb-md border-b border-border">
                <span className="eyebrow-muted tracking-[.18em]">All chapters</span>
                <span className="font-3 text-[11px] text-text-muted tracking-[.05em] tabular-nums">{CHAPTERS.length} total</span>
              </div>
              <ul className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-x-xl gap-y-[2px] list-none m-0 p-0">
                {CHAPTERS.map(c => (
                  <li key={c.slug} className="m-0 p-0">
                    <Link
                      to="/textbook/$chapterSlug"
                      params={{ chapterSlug: c.slug }}
                      role="menuitem"
                      className={clsx(
                        'grid grid-cols-[34px_1fr] items-baseline gap-md py-[10px] px-md rounded-3 no-underline transition-colors',
                        activeChapter === c.slug
                          ? 'text-accent bg-accent-soft'
                          : 'text-color-4 hover:bg-bg-card-hover',
                      )}
                    >
                      <span className={clsx(
                        'font-3 text-[12px] text-right tabular-nums',
                        activeChapter === c.slug ? 'text-accent' : 'text-text-muted',
                      )}>{c.number}</span>
                      <span className="font-1 text-[14px] leading-[1.35]">{c.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <Link
          to="/reference"
          className={clsx('font-3 text-[12px] no-underline uppercase tracking-[.12em] min-w-[22px] text-center py-[2px] px-0 transition-colors hover:text-color-4 max-[900px]:text-[11px] max-[760px]:text-[10px] border-l border-border-2 pl-lg ml-[6px]', pathname === '/reference' ? 'text-accent' : 'text-text-muted')}
          title="Equation labs (appendix)"
        >
          Labs
        </Link>
        <Link
          to="/labs/$slug"
          params={{ slug: 'circuit-builder' }}
          className={clsx('font-3 text-[12px] no-underline uppercase tracking-[.12em] min-w-[22px] text-center py-[2px] px-0 transition-colors hover:text-color-4 max-[900px]:text-[11px] max-[760px]:text-[10px]', pathname === '/labs/circuit-builder' ? 'text-accent' : 'text-text-muted')}
          title="Free-form circuit-builder sandbox"
        >
          Build
        </Link>
        <Link
          to="/map"
          className={clsx('font-3 text-[12px] no-underline uppercase tracking-[.12em] min-w-[22px] text-center py-[2px] px-0 transition-colors hover:text-color-4 max-[900px]:text-[11px] max-[760px]:text-[10px]', pathname === '/map' ? 'text-accent' : 'text-text-muted')}
          title="Course map · prerequisite DAG"
        >
          Map
        </Link>
        <Link
          to="/tracks"
          className={clsx('font-3 text-[12px] no-underline uppercase tracking-[.12em] min-w-[22px] text-center py-[2px] px-0 transition-colors hover:text-color-4 max-[900px]:text-[11px] max-[760px]:text-[10px]', pathname === '/tracks' ? 'text-accent' : 'text-text-muted')}
          title="Preset curriculum tracks"
        >
          Tracks
        </Link>
        <Link
          to="/capstones"
          className={clsx('font-3 text-[12px] no-underline uppercase tracking-[.12em] min-w-[22px] text-center py-[2px] px-0 transition-colors hover:text-color-4 max-[900px]:text-[11px] max-[760px]:text-[10px]', pathname.startsWith('/capstone') ? 'text-accent' : 'text-text-muted')}
          title="Capstone integration projects"
        >
          Capstones
        </Link>
        <Link
          to="/me"
          className={clsx('font-3 text-[12px] no-underline uppercase tracking-[.12em] min-w-[22px] text-center py-[2px] px-0 transition-colors hover:text-color-4 max-[900px]:text-[11px] max-[760px]:text-[10px]', pathname === '/me' ? 'text-accent' : 'text-text-muted')}
          title="Your reading progress"
        >
          Progress
        </Link>
      </div>
      <div className="flex items-center justify-end gap-[14px]">
        <div className="meta-1 max-[760px]:hidden">{pageMeta}</div>
        <button
          type="button"
          className="inline-flex items-center gap-sm min-h-[30px] px-[10px] border border-border-2 rounded-pill bg-color-3 eyebrow-muted text-[10px] leading-none cursor-pointer transition-colors hover:text-color-4 hover:border-accent"
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
