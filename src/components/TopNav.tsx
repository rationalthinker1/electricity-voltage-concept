import { Link, useRouterState } from '@tanstack/react-router';

import { MANIFEST } from '@/labs/data/manifest';

const CHAPTERS = [
  { id: 'ch1', short: 'I. Electric',   label: 'Electric Field' },
  { id: 'ch2', short: 'II. Magnetic',  label: 'Magnetic Field' },
  { id: 'ch3', short: 'III. Conduction', label: 'Conduction' },
  { id: 'ch4', short: 'IV. Energy',    label: 'Energy & Fields' },
];

export function TopNav() {
  const router = useRouterState();
  const pathname = router.location.pathname;
  const labSlug = pathname.startsWith('/labs/') ? pathname.split('/')[2] : null;
  const currentLab = labSlug ? MANIFEST.find(l => l.slug === labSlug) : null;
  const activeChapter = currentLab?.chapter ?? null;

  return (
    <nav className="top">
      <Link to="/" className="mark">
        Field <span>·</span> Theory
      </Link>
      <div className="links">
        {CHAPTERS.map(c => (
          <Link
            key={c.id}
            to="/"
            hash={c.id}
            className={activeChapter === c.id ? 'active' : ''}
            title={c.label}
          >
            {c.short}
          </Link>
        ))}
      </div>
      <div className="meta">
        {currentLab ? `Lab ${currentLab.number} / 4.4` : 'An interactive textbook · v.03'}
      </div>
    </nav>
  );
}
