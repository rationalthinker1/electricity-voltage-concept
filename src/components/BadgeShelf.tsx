import { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';

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
    <div className="flex flex-col gap-md">
      <div className="font-3 text-3 text-text-dim tracking-2">
        <strong className="text-text font-medium">{earnedCount}</strong> of <strong className="text-text font-medium">{BADGES.length}</strong> earned
      </div>
      <ul className="grid-list grid-cols-4 gap-md max-md:grid-cols-2">
        {items.map(({ b, earned }) => (
          <BadgeTile key={b.id} badge={b} earned={earned} />
        ))}
      </ul>
    </div>
  );
}

function BadgeTile({ badge, earned }: { badge: Badge; earned: boolean }) {
  return (
    <li
      className="group relative flex flex-col items-center gap-sm py-lg px-md pb-md card-surface rounded-6 transition-[transform,border-color,background] duration-fast ease-in-out cursor-default outline-none hover:-translate-y-px hover:border-border-2 hover:bg-bg-card-hover focus-visible:-translate-y-px focus-visible:border-border-2 focus-visible:bg-bg-card-hover"
      tabIndex={0}
      aria-label={`${badge.name}${earned ? ' — earned' : ' — locked'}`}
    >
      <div
        className={clsx(
          'relative w-3xl h-3xl grid place-items-center rounded-full bg-white/[.04] border border-border-1',
          !earned && 'grayscale opacity-55',
          earned && badge.rarity === 'common' && 'bg-text/10 border-text/30 text-text',
          earned && badge.rarity === 'uncommon' && 'bg-teal/10 border-teal/45 text-teal shadow-[0_0_12px_rgba(108,197,194,.22)]',
          earned && badge.rarity === 'rare' && 'bg-accent-soft border-accent text-accent shadow-[0_0_16px_var(--accent-glow)]',
          earned && badge.rarity === 'epic' && 'bg-pink/15 border-pink text-pink shadow-[0_0_18px_rgba(255,59,110,.4)]',
        )}
        aria-hidden="true"
      >
        <span className={clsx('font-4 text-8 leading-none', !earned && 'text-text-muted')}>{badge.icon}</span>
        {!earned && (
          <span className="absolute -right-xs -bottom-xs w-lg h-lg grid place-items-center rounded-full bg-bg border border-border-2 text-2 text-text-muted" aria-hidden="true">⌶</span>
        )}
      </div>
      <div className="text-center flex flex-col gap-xs">
        <div className={clsx('font-1 text-4 font-medium text-text leading-2', !earned && 'text-text-dim')}>{badge.name}</div>
        <div
          className={clsx(
            'eyebrow-muted text-1 tracking-3',
            earned && badge.rarity === 'uncommon' && 'text-teal',
            earned && badge.rarity === 'rare' && 'text-accent',
            earned && badge.rarity === 'epic' && 'text-pink',
          )}
        >
          {badge.rarity}
        </div>
      </div>
      <div className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 translate-y-xs w-max max-w-panel-sm py-md px-md bg-bg-elevated border border-border-2 rounded-5 text-3 text-text opacity-0 pointer-events-none transition-[opacity,transform] duration-fast ease-in-out z-1 text-left shadow-2 group-hover:opacity-100 group-hover:translate-y-0 group-focus-visible:opacity-100 group-focus-visible:translate-y-0" role="tooltip">
        <div className="font-medium mb-xs">{badge.name}</div>
        <div className="text-text-dim mb-xs leading-3">{badge.description}</div>
        {earned && badge.flavor ? (
          <div className="title-display leading-3">{badge.flavor}</div>
        ) : null}
        {!earned ? (
          <div className="font-3 text-2 text-text-muted tracking-2">Not yet earned.</div>
        ) : null}
      </div>
    </li>
  );
}
