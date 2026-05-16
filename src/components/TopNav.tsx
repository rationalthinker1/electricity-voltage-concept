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
    const c = CHAPTERS.find((ch) => ch.slug === slug);
    if (c) {
      activeChapter = c.slug;
      pageMeta = `Chapter ${c.number} / ${TOTAL_CHAPTERS}`;
    }
  } else if (pathname.startsWith('/labs/')) {
    const labSlug = pathname.split('/')[2];
    const lab = MANIFEST.find((l) => l.slug === labSlug);
    if (lab) {
      pageMeta = `Lab ${lab.number} · appendix`;
      const related = CHAPTERS.find((ch) => ch.relatedLabs.includes(labSlug));
      if (related) activeChapter = related.slug;
    }
  } else if (pathname === '/reference') {
    pageMeta = 'Equation appendix';
  }

  const [chaptersOpen, setChaptersOpen] = useState(false);
  const chaptersMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setChaptersOpen(false);
  }, [pathname]);

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
    <nav className="py-xl px-3xl border-border max-md:py-lg max-md:px-xl max-md:gap-md fixed top-0 right-0 left-0 z-2 flex items-center justify-between border-b bg-[linear-gradient(180deg,var(--nav-bg-start),var(--nav-bg-end))] backdrop-blur-[12px] max-md:flex-wrap">
      <Link to="/" className="title-display text-7 tracking-1 font-light no-underline">
        Field <span className="text-accent">·</span> Theory
      </Link>
      <div className="gap-md max-lg:gap-sm max-md:gap-md flex items-center">
        <div ref={chaptersMenuRef} className="relative">
          <button
            type="button"
            className={clsx(
              'font-3 text-3 tracking-3 min-w-icon py-xxs hover:text-text max-lg:text-2 max-md:text-1 gap-sm inline-flex cursor-pointer items-center border-0 bg-transparent px-0 text-center uppercase no-underline transition-colors',
              activeChapter ? 'text-accent' : 'text-text-muted',
            )}
            aria-haspopup="menu"
            aria-expanded={chaptersOpen}
            onClick={() => setChaptersOpen((o) => !o)}
            title="Browse all chapters"
          >
            Chapters
            <span
              aria-hidden="true"
              className={clsx('inline-block transition-transform', chaptersOpen && 'rotate-180')}
            >
              ▾
            </span>
          </button>
          {chaptersOpen && (
            <div
              role="menu"
              aria-label="All chapters"
              className="top-4xl py-2xl px-2xl rounded-5 border-border-2 bg-bg-elevated fixed left-1/2 z-2 max-h-[calc(100vh-100px)] w-[min(1100px,calc(100vw-40px))] -translate-x-1/2 overflow-y-auto border shadow-[0_24px_60px_var(--shadow-strong)]"
            >
              <div className="mb-xl pb-md border-border flex items-baseline justify-between border-b">
                <span className="eyebrow-muted tracking-4">All chapters</span>
                <span className="font-3 text-2 text-text-muted tracking-2 tabular-nums">
                  {CHAPTERS.length} total
                </span>
              </div>
              <ul className="grid-list gap-x-xl gap-y-xs grid-cols-[repeat(auto-fit,minmax(280px,1fr))]">
                {CHAPTERS.map((c) => (
                  <li key={c.slug} className="m-0 p-0">
                    <Link
                      to="/textbook/$chapterSlug"
                      params={{ chapterSlug: c.slug }}
                      role="menuitem"
                      className={clsx(
                        'gap-md py-md px-md rounded-3 grid grid-cols-[34px_1fr] items-baseline no-underline transition-colors',
                        activeChapter === c.slug
                          ? 'text-accent bg-accent-soft'
                          : 'text-text hover:bg-bg-card-hover',
                      )}
                    >
                      <span
                        className={clsx(
                          'font-3 text-3 text-right tabular-nums',
                          activeChapter === c.slug ? 'text-accent' : 'text-text-muted',
                        )}
                      >
                        {c.number}
                      </span>
                      <span className="font-1 text-5 leading-3">{c.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <Link
          to="/reference"
          className={clsx(
            'font-3 text-3 tracking-3 min-w-icon py-xxs hover:text-text max-lg:text-2 max-md:text-1 border-border-2 pl-lg ml-sm border-l px-0 text-center uppercase no-underline transition-colors',
            pathname === '/reference' ? 'text-accent' : 'text-text-muted',
          )}
          title="Equation labs (appendix)"
        >
          Labs
        </Link>
        <Link
          to="/labs/$slug"
          params={{ slug: 'circuit-builder' }}
          className={clsx(
            'font-3 text-3 tracking-3 min-w-icon py-xxs hover:text-text max-lg:text-2 max-md:text-1 px-0 text-center uppercase no-underline transition-colors',
            pathname === '/labs/circuit-builder' ? 'text-accent' : 'text-text-muted',
          )}
          title="Free-form circuit-builder sandbox"
        >
          Build
        </Link>
        <Link
          to="/map"
          className={clsx(
            'font-3 text-3 tracking-3 min-w-icon py-xxs hover:text-text max-lg:text-2 max-md:text-1 px-0 text-center uppercase no-underline transition-colors',
            pathname === '/map' ? 'text-accent' : 'text-text-muted',
          )}
          title="Course map · prerequisite DAG"
        >
          Map
        </Link>
        <Link
          to="/tracks"
          className={clsx(
            'font-3 text-3 tracking-3 min-w-icon py-xxs hover:text-text max-lg:text-2 max-md:text-1 px-0 text-center uppercase no-underline transition-colors',
            pathname === '/tracks' ? 'text-accent' : 'text-text-muted',
          )}
          title="Preset curriculum tracks"
        >
          Tracks
        </Link>
        <Link
          to="/capstones"
          className={clsx(
            'font-3 text-3 tracking-3 min-w-icon py-xxs hover:text-text max-lg:text-2 max-md:text-1 px-0 text-center uppercase no-underline transition-colors',
            pathname.startsWith('/capstone') ? 'text-accent' : 'text-text-muted',
          )}
          title="Capstone integration projects"
        >
          Capstones
        </Link>
        <Link
          to="/me"
          className={clsx(
            'font-3 text-3 tracking-3 min-w-icon py-xxs hover:text-text max-lg:text-2 max-md:text-1 px-0 text-center uppercase no-underline transition-colors',
            pathname === '/me' ? 'text-accent' : 'text-text-muted',
          )}
          title="Your reading progress"
        >
          Progress
        </Link>
      </div>
      <div className="gap-md flex items-center justify-end">
        <div className="meta-1 max-md:hidden">{pageMeta}</div>
        <button
          type="button"
          className="gap-sm min-h-2xl px-md border-border-2 rounded-pill bg-bg-card eyebrow-muted text-1 hover:text-text hover:border-accent inline-flex cursor-pointer items-center border leading-none transition-colors"
          onClick={onCycleTheme}
          aria-label={`Theme: ${themeMode}. Effective theme: ${resolvedTheme}. Activate to cycle theme mode.`}
          title={`Theme: ${themeMode}`}
        >
          <span
            className={clsx(
              'h-lg rounded-pill relative w-lg border border-current',
              resolvedTheme === 'light' && 'bg-current shadow-[0_0_0_3px_var(--accent-soft)]',
              resolvedTheme === 'dark' &&
                "after:-top-xxs after:left-xs after:h-md after:rounded-pill after:bg-bg after:absolute after:w-md after:content-['']",
            )}
            aria-hidden="true"
          />
          <span>{themeMode}</span>
        </button>
      </div>
    </nav>
  );
}
