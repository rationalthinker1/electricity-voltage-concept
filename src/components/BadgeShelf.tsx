import { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';

import { BADGES, type Badge } from '@/textbook/data/badges';
import { getProgress, onProgressChange, type ProgressState } from '@/lib/progress';
import { Stack } from '@/components/ui/Stack';

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
    <Stack gap={14}>
      <div className="text-meta lowercase">
        <strong className="text-text font-medium">{earnedCount}</strong> of <strong className="text-text font-medium">{BADGES.length}</strong> earned
      </div>
      <ul className="list-none m-0 p-0 grid [grid-template-columns:repeat(4,minmax(0,1fr))] gap-md max-[720px]:[grid-template-columns:repeat(2,minmax(0,1fr))]">
        {items.map(({ b, earned }) => (
          <BadgeTile key={b.id} badge={b} earned={earned} />
        ))}
      </ul>
    </Stack>
  );
}

function BadgeTile({ badge, earned }: { badge: Badge; earned: boolean }) {
  return (
    <li
      className={clsx(
        'group relative flex flex-col items-center gap-sm py-[14px] px-[10px] pb-md rounded-lg bg-surface border border-border cursor-default outline-none transition-colors hover:-translate-y-px hover:border-border-strong hover:bg-surface-hover focus-visible:-translate-y-px focus-visible:border-border-strong focus-visible:bg-surface-hover',
      )}
      tabIndex={0}
      aria-label={`${badge.name}${earned ? ' — earned' : ' — locked'}`}
    >
      <div
        className={clsx(
          'relative w-[52px] h-[52px] grid place-items-center rounded-full bg-white/[.04] border border-border',
          !earned && 'grayscale opacity-55',
          earned && badge.rarity === 'common' && 'bg-text/[.08] border-text/25 text-text',
          earned && badge.rarity === 'uncommon' && 'bg-teal-soft border-teal/45 text-teal shadow-[0_0_12px_var(--color-teal-soft)]',
          earned && badge.rarity === 'rare' && 'bg-accent-soft border-accent text-accent shadow-[0_0_16px_var(--color-accent-glow)]',
          earned && badge.rarity === 'epic' && 'bg-pink/14 border-pink text-pink shadow-[0_0_18px_rgba(255,59,110,.4)]',
        )}
        aria-hidden="true"
      >
        <span className={clsx('font-math text-[24px] leading-none', !earned && 'text-text-muted')}>{badge.icon}</span>
        {!earned && (
          <span className="absolute -right-xs -bottom-xs w-[18px] h-[18px] grid place-items-center rounded-full bg-bg border border-border-strong text-[11px] text-text-muted" aria-hidden="true">⌶</span>
        )}
      </div>
      <div className="flex flex-col gap-xs text-center">
        <div className={clsx('font-body text-[13px] font-medium text-text leading-[1.2]', !earned && 'text-text-dim')}>{badge.name}</div>
        <div
          className={clsx(
            'font-mono text-[10px] tracking-[.08em] uppercase text-text-muted',
            earned && badge.rarity === 'uncommon' && 'text-teal',
            earned && badge.rarity === 'rare' && 'text-accent',
            earned && badge.rarity === 'epic' && 'text-pink',
          )}
        >
          {badge.rarity}
        </div>
      </div>
      <div className="surface-tooltip group-hover:opacity-100 group-hover:translate-y-[-4px] group-focus-visible:opacity-100 group-focus-visible:translate-y-[-4px] w-max max-w-[240px] text-left" role="tooltip">
        <div className="font-medium mb-xs text-text">{badge.name}</div>
        <div className="text-text-dim mb-xs leading-[1.45]">{badge.description}</div>
        {earned && badge.flavor ? (
          <div className="font-display italic text-text leading-[1.45]">{badge.flavor}</div>
        ) : null}
        {!earned ? (
          <div className="font-mono text-[11px] text-text-muted tracking-[.04em]">Not yet earned.</div>
        ) : null}
      </div>
    </li>
  );
}

