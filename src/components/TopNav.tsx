import { Link, useRouterState } from '@tanstack/react-router';

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
    <nav className="top">
      <Link to="/" className="mark">
        Field <span>·</span> Theory
      </Link>
      <div className="links chapter-pills">
        {CHAPTERS.map(c => (
          <Link
            key={c.slug}
            to="/textbook/$chapterSlug"
            params={{ chapterSlug: c.slug }}
            className={activeChapter === c.slug ? 'active' : ''}
            title={`Ch.${c.number} — ${c.title}`}
          >
            {c.number}
          </Link>
        ))}
        <Link
          to="/reference"
          className={pathname === '/reference' ? 'active' : ''}
          title="Equation labs (appendix)"
          style={{ borderLeft: '1px solid var(--border-strong)', paddingLeft: 16, marginLeft: 6 }}
        >
          Labs
        </Link>
        <Link
          to="/map"
          className={pathname === '/map' ? 'active' : ''}
          title="Course map · prerequisite DAG"
        >
          Map
        </Link>
        <Link
          to="/tracks"
          className={pathname === '/tracks' ? 'active' : ''}
          title="Preset curriculum tracks"
        >
          Tracks
        </Link>
        <Link
          to="/me"
          className={pathname === '/me' ? 'active' : ''}
          title="Your reading progress"
        >
          Progress
        </Link>
      </div>
      <div className="nav-status">
        <div className="meta">{pageMeta}</div>
        <button
          type="button"
          className="theme-toggle"
          onClick={onCycleTheme}
          aria-label={`Theme: ${themeMode}. Effective theme: ${resolvedTheme}. Activate to cycle theme mode.`}
          title={`Theme: ${themeMode}`}
        >
          <span className="theme-toggle-icon" aria-hidden="true" />
          <span>{themeMode}</span>
        </button>
      </div>
    </nav>
  );
}
