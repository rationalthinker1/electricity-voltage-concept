import type { ReactNode } from 'react';

/** Display equation block in italic Fraunces, centered. */
export function MathBlock({ children }: { children: ReactNode }) {
  return <p className="math-block-1">{children}</p>;
}

/** Italic pull-out quote with amber left bar. */
export function Pullout({ children }: { children: ReactNode }) {
  return <p className="pullout-1 accent-brand">{children}</p>;
}

/** Inline keyboard / token pill. */
export function Kbd({ children }: { children: ReactNode }) {
  return <span className="kbd">{children}</span>;
}
