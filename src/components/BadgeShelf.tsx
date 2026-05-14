import { useEffect, useMemo, useState } from 'react';

import { BADGES, type Badge } from '@/textbook/data/badges';
import { getProgress, onProgressChange, type ProgressState } from '@/lib/progress';

/**
 * Grid of all defined badges, with earned/locked treatment.
 *
 * Earned badges show full colour + icon. Locked badges go greyscale with a
 * locked overlay and the flavor text hidden until earned.
 */
export function BadgeShelf() {
  const [progress, setProgress] = useState<ProgressState>(() => getProgress());
  useEffect(() => onProgressChange(() => setProgress(getProgress())), []);

  const items = useMemo(() => {
    return BADGES.map((b) => ({ b, earned: b.earned(progress) }));
  }, [progress]);

  const earnedCount = items.filter((i) => i.earned).length;

  return (
    <div className="badge-shelf">
      <div className="badge-shelf-meta">
        <strong>{earnedCount}</strong> of <strong>{BADGES.length}</strong> earned
      </div>
      <ul className="badge-grid">
        {items.map(({ b, earned }) => (
          <BadgeTile key={b.id} badge={b} earned={earned} />
        ))}
      </ul>
    </div>
  );
}

function BadgeTile({ badge, earned }: { badge: Badge; earned: boolean }) {
  const cls = [
    'badge-tile',
    `badge-rarity-${badge.rarity}`,
    earned ? 'badge-earned' : 'badge-locked',
  ].join(' ');
  return (
    <li className={cls} tabIndex={0} aria-label={`${badge.name}${earned ? ' — earned' : ' — locked'}`}>
      <div className="badge-icon" aria-hidden="true">
        <span className="badge-glyph">{badge.icon}</span>
        {!earned && <span className="badge-lock" aria-hidden="true">⌶</span>}
      </div>
      <div className="badge-body">
        <div className="badge-name">{badge.name}</div>
        <div className="badge-rarity-label">{badge.rarity}</div>
      </div>
      <div className="badge-tooltip" role="tooltip">
        <div className="badge-tt-name">{badge.name}</div>
        <div className="badge-tt-desc">{badge.description}</div>
        {earned && badge.flavor ? (
          <div className="badge-tt-flavor">{badge.flavor}</div>
        ) : null}
        {!earned ? (
          <div className="badge-tt-locked">Not yet earned.</div>
        ) : null}
      </div>
    </li>
  );
}
