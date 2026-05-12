import { Link, useRouterState } from '@tanstack/react-router';

import { CHAPTERS } from '@/textbook/data/chapters';
import { MANIFEST } from '@/labs/data/manifest';

/**
 * Sticky top nav. Shows the six narrative chapters as pills with the current
 * chapter highlighted; resolves the active chapter from either /textbook/...
 * or /labs/... (in which case it walks back through the manifest to find
 * which textbook chapter is most-related to the current lab).
 */
export function TopNav() {
  const router = useRouterState();
  const pathname = router.location.pathname;

  // Determine which chapter is active.
  let activeChapter: string | null = null;
  let pageMeta = 'An interactive textbook · v.04';

  if (pathname.startsWith('/textbook/')) {
    const slug = pathname.split('/')[2];
    const c = CHAPTERS.find(ch => ch.slug === slug);
    if (c) { activeChapter = c.slug; pageMeta = `Chapter ${c.number} / 6`; }
  } else if (pathname.startsWith('/labs/')) {
    const labSlug = pathname.split('/')[2];
    const lab = MANIFEST.find(l => l.slug === labSlug);
    if (lab) {
      pageMeta = `Lab ${lab.number} · appendix`;
      // Find the first chapter that lists this lab as related — light it up.
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
      <div className="links">
        {CHAPTERS.map(c => (
          <Link
            key={c.slug}
            to="/textbook/$chapterSlug"
            params={{ chapterSlug: c.slug }}
            className={activeChapter === c.slug ? 'active' : ''}
            title={c.title}
          >
            {c.number}. {shortTitle(c.title)}
          </Link>
        ))}
        <Link
          to="/reference"
          className={pathname === '/reference' ? 'active' : ''}
          title="Equation labs (appendix)"
          style={{ borderLeft: '1px solid var(--border-strong)', paddingLeft: 18, marginLeft: 4 }}
        >
          Labs
        </Link>
      </div>
      <div className="meta">{pageMeta}</div>
    </nav>
  );
}

function shortTitle(title: string): string {
  // Compact form for the nav pill: drop common words.
  return title
    .replace(/^What is /, '')
    .replace(/^Where the energy actually flows$/, 'Energy flow')
    .replace(/^Resistance and power$/, 'Resistance')
    .replace(/^Voltage and current$/, 'Voltage');
}
