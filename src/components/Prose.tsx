import type { ReactNode } from 'react';

/** Display equation block in italic Fraunces, centered.
 *  Keeps the legacy `math` className so chapter / lab narrative
 *  descendant selectors that target `.math` keep matching. */
export function MathBlock({ children }: { children: ReactNode }) {
  return <p className="math">{children}</p>;
}

/** Italic pull-out quote with amber left bar.
 *  Keeps the legacy `pullout` className so chapter / lab narrative
 *  descendant selectors that target `.pullout` keep matching. */
export function Pullout({ children }: { children: ReactNode }) {
  return <p className="pullout">{children}</p>;
}

/** Inline keyboard / token pill.
 *  Keeps the legacy `kbd` className so chapter / lab narrative
 *  descendant selectors that target `.kbd` keep matching. */
export function Kbd({ children }: { children: ReactNode }) {
  return (
    <span className="kbd inline-block py-[.05rem] px-[.4rem] border border-border-strong border-b-2 rounded-3 bg-bg-elevated font-3 text-[11px] text-text">
      {children}
    </span>
  );
}
