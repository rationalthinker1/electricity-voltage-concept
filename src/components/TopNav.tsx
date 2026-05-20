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

interface NavTarget {
  label: string;
  to: string;
  params?: Record<string, string>;
  title: string;
  isActive: (pathname: string) => boolean;
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const chaptersMenuRef = useRef<HTMLDivElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const mobileToggleRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    setChaptersOpen(false);
    setMobileOpen(false);
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

  useEffect(() => {
    if (!mobileOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMobileOpen(false);
    }
    function onClick(e: MouseEvent) {
      const t = e.target as Node;
      const inMenu = mobileMenuRef.current?.contains(t);
      const inToggle = mobileToggleRef.current?.contains(t);
      if (!inMenu && !inToggle) setMobileOpen(false);
    }
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [mobileOpen]);

  // Shared list of secondary nav targets (everything besides the Chapters
  // dropdown). Rendered as desktop pills below and as a vertical stack
  // inside the mobile drawer.
  const navTargets: NavTarget[] = [
    {
      label: 'Labs',
      to: '/reference',
      title: 'Equation labs (appendix)',
      isActive: (p) => p === '/reference',
    },
    {
      label: 'Build',
      to: '/labs/$slug',
      params: { slug: 'circuit-builder' },
      title: 'Free-form circuit-builder sandbox',
      isActive: (p) => p === '/labs/circuit-builder',
    },
    {
      label: 'Map',
      to: '/map',
      title: 'Course map · prerequisite DAG',
      isActive: (p) => p === '/map',
    },
    {
      label: 'Tracks',
      to: '/tracks',
      title: 'Preset curriculum tracks',
      isActive: (p) => p === '/tracks',
    },
    {
      label: 'Capstones',
      to: '/capstones',
      title: 'Capstone integration projects',
      isActive: (p) => p.startsWith('/capstone'),
    },
    {
      label: 'Progress',
      to: '/me',
      title: 'Your reading progress',
      isActive: (p) => p === '/me',
    },
  ];

  const desktopPillClass = (active: boolean, extra?: string) =>
    clsx(
      'font-3 text-3 tracking-3 min-w-icon py-xxs hover:text-text max-lg:text-2 px-0 text-center uppercase no-underline transition-colors',
      active ? 'text-accent' : 'text-text-muted',
      extra,
    );

  const mobileItemClass = (active: boolean) =>
    clsx(
      'font-3 text-3 tracking-3 py-md px-md rounded-3 text-left uppercase no-underline transition-colors',
      active ? 'text-accent bg-accent-soft' : 'text-text hover:bg-bg-card-hover',
    );

  const themeToggle = (
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
  );

  return (
    <nav className="py-xl px-3xl border-border max-md:py-md max-md:px-lg fixed top-0 right-0 left-0 z-2 flex items-center justify-between border-b bg-[linear-gradient(180deg,var(--nav-bg-start),var(--nav-bg-end))] backdrop-blur-[12px]">
      <Link
        to="/"
        className="title-display text-7 max-md:text-5 tracking-1 font-light no-underline"
      >
        Field <span className="text-accent">·</span> Theory
      </Link>

      {/* Desktop secondary nav — hidden on mobile, where the hamburger
          drawer below carries the same destinations. */}
      <div className="gap-md max-lg:gap-sm flex items-center max-md:hidden">
        <div ref={chaptersMenuRef} className="relative">
          <button
            type="button"
            className={clsx(
              'font-3 text-3 tracking-3 min-w-icon py-xxs hover:text-text max-lg:text-2 gap-sm inline-flex cursor-pointer items-center border-0 bg-transparent px-0 text-center uppercase no-underline transition-colors',
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
        {navTargets.map((t, i) => (
          <Link
            key={t.to + (t.params?.slug ?? '')}
            to={t.to}
            params={t.params as never}
            className={desktopPillClass(
              t.isActive(pathname),
              i === 0 ? 'border-border-2 pl-lg ml-sm border-l' : undefined,
            )}
            title={t.title}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* Desktop meta + theme toggle */}
      <div className="gap-md flex items-center justify-end max-md:hidden">
        <div className="meta-1">{pageMeta}</div>
        {themeToggle}
      </div>

      {/* Mobile hamburger toggle */}
      <button
        ref={mobileToggleRef}
        type="button"
        className="text-text-dim hover:text-text border-border-2 rounded-3 h-icon-lg w-icon-lg inline-flex cursor-pointer items-center justify-center border bg-transparent transition-colors md:hidden"
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={mobileOpen}
        aria-controls="mobile-nav-menu"
        onClick={() => setMobileOpen((o) => !o)}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          {mobileOpen ? (
            <>
              <line x1="5" y1="5" x2="19" y2="19" />
              <line x1="19" y1="5" x2="5" y2="19" />
            </>
          ) : (
            <>
              <line x1="4" y1="7" x2="20" y2="7" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="17" x2="20" y2="17" />
            </>
          )}
        </svg>
      </button>

      {/* Mobile drawer — anchored to the fixed nav via top-full. */}
      {mobileOpen && (
        <div
          ref={mobileMenuRef}
          id="mobile-nav-menu"
          role="menu"
          aria-label="Site navigation"
          className="border-border bg-bg-elevated absolute top-full right-0 left-0 z-2 max-h-[calc(100vh-72px)] overflow-y-auto border-b shadow-[0_24px_60px_var(--shadow-strong)] md:hidden"
        >
          <div className="py-lg px-lg gap-xs flex flex-col">
            <Link
              to="/"
              role="menuitem"
              className={mobileItemClass(!!activeChapter || pathname === '/')}
            >
              Chapters
            </Link>
            {navTargets.map((t) => (
              <Link
                key={t.to + (t.params?.slug ?? '')}
                to={t.to}
                params={t.params as never}
                role="menuitem"
                className={mobileItemClass(t.isActive(pathname))}
                title={t.title}
              >
                {t.label}
              </Link>
            ))}
            <div className="mt-md pt-md border-border gap-md flex items-center justify-between border-t">
              <span className="font-3 text-2 text-text-muted tracking-3 uppercase">{pageMeta}</span>
              {themeToggle}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
