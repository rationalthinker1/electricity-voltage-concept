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
    <div className="flex flex-col gap-[14px]">
      <div className="font-3 text-[12px] text-color-5 tracking-[.04em] [&_strong]:text-color-4 [&_strong]:font-medium">
        <strong>{earnedCount}</strong> of <strong>{BADGES.length}</strong> earned
      </div>
      <ul className="list-none m-0 p-0 grid grid-cols-4 gap-[12px] max-[720px]:grid-cols-2">
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
      className="group relative flex flex-col items-center gap-sm py-[14px] px-[10px] pb-md card-surface rounded-6 transition-[transform,border-color,background] duration-[120ms] ease-in-out cursor-default outline-none hover:-translate-y-px hover:border-border-2 hover:bg-bg-card-hover focus-visible:-translate-y-px focus-visible:border-border-2 focus-visible:bg-bg-card-hover"
      tabIndex={0}
      aria-label={`${badge.name}${earned ? ' — earned' : ' — locked'}`}
    >
      <div
        className={clsx(
          'relative w-[52px] h-[52px] grid place-items-center rounded-full bg-white/[.04] border border-border-1',
          !earned && 'grayscale opacity-55',
          earned && badge.rarity === 'common' && 'bg-[rgba(236,235,229,.08)] border-[rgba(236,235,229,.25)] text-color-4',
          earned && badge.rarity === 'uncommon' && 'bg-[rgba(108,197,194,.12)] border-[rgba(108,197,194,.45)] text-teal shadow-[0_0_12px_rgba(108,197,194,.22)]',
          earned && badge.rarity === 'rare' && 'bg-accent-soft border-accent text-accent shadow-[0_0_16px_var(--accent-glow)]',
          earned && badge.rarity === 'epic' && 'bg-[rgba(255,59,110,.14)] border-pink text-pink shadow-[0_0_18px_rgba(255,59,110,.4)]',
        )}
        aria-hidden="true"
      >
        <span className={clsx('font-4 text-[24px] leading-none', !earned && 'text-text-muted')}>{badge.icon}</span>
        {!earned && (
          <span className="absolute -right-[4px] -bottom-[4px] w-[18px] h-[18px] grid place-items-center rounded-full bg-bg border border-border-2 text-[11px] text-text-muted" aria-hidden="true">⌶</span>
        )}
      </div>
      <div className="text-center flex flex-col gap-[2px]">
        <div className={clsx('font-1 text-[13px] font-medium text-color-4 leading-[1.2]', !earned && 'text-color-5')}>{badge.name}</div>
        <div
          className={clsx(
            'eyebrow-muted text-[10px] tracking-[.08em]',
            earned && badge.rarity === 'uncommon' && 'text-teal',
            earned && badge.rarity === 'rare' && 'text-accent',
            earned && badge.rarity === 'epic' && 'text-pink',
          )}
        >
          {badge.rarity}
        </div>
      </div>
      <div className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 translate-y-[4px] w-max max-w-[240px] py-[10px] px-md bg-color-2 border border-border-2 rounded-5 text-[12px] text-color-4 opacity-0 pointer-events-none transition-[opacity,transform] duration-[140ms] ease-in-out z-[30] text-left shadow-2 group-hover:opacity-100 group-hover:translate-y-0 group-focus-visible:opacity-100 group-focus-visible:translate-y-0" role="tooltip">
        <div className="font-medium mb-xs">{badge.name}</div>
        <div className="text-color-5 mb-xs leading-[1.45]">{badge.description}</div>
        {earned && badge.flavor ? (
          <div className="title-display leading-[1.45]">{badge.flavor}</div>
        ) : null}
        {!earned ? (
          <div className="font-3 text-[11px] text-text-muted tracking-[.04em]">Not yet earned.</div>
        ) : null}
      </div>
    </li>
  );
}
