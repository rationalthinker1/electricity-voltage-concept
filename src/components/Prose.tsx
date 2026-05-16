import type { ReactNode } from 'react';

/** Display equation block in italic Fraunces, centered. Styling lives in
 *  the .math recipe in main.css; sub/sup descendants are sized there too.
 *  Class name is also a descendant-selector hook for parent contexts
 *  (CaseStudy, LabShell) that override math layout. */
export function MathBlock({ children }: { children: ReactNode }) {
  return <p className="math">{children}</p>;
}

/** Italic pull-out quote with amber left bar. The `pullout` class is kept as a
 *  descendant-selector hook for parent contexts. */
export function Pullout({ children }: { children: ReactNode }) {
  return (
    <p className="pullout font-2 text-8 text-text py-xl pl-2xl my-3xl border-accent border-l-2 pr-0 leading-3 font-light italic">
      {children}
    </p>
  );
}

/** Inline keyboard / token pill (`<kbd>`-style accent). The `kbd` class is kept
 *  as a descendant-selector hook for parent contexts (e.g. chapter narrative)
 *  that override sizing via `[&_.kbd]:` rules. */
export function Kbd({ children }: { children: ReactNode }) {
  return (
    <span className="kbd py-xxs px-sm border-border-strong rounded-3 bg-bg-elevated font-3 text-2 text-text inline-block border border-b-2">
      {children}
    </span>
  );
}
