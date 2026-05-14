import type { ReactNode } from 'react';

/** Display equation block in italic Fraunces, centered. */
export function MathBlock({ children }: { children: ReactNode }) {
  return <p className="text-formula text-[26px] my-[30px] text-center">{children}</p>;
}

/** Italic pull-out quote with amber left bar. */
export function Pullout({ children }: { children: ReactNode }) {
  return (
    <p className="font-display italic font-light text-[26px] leading-[1.35] text-color-text py-xl pr-0 pl-[28px] my-[40px] border-l-2 border-l-color-accent">
      {children}
    </p>
  );
}

/** Inline keyboard / token pill. */
export function Kbd({ children }: { children: ReactNode }) {
  return <span className="kbd-base">{children}</span>;
}

