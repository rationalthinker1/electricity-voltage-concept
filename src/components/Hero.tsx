import type { LabManifestEntry } from '@/labs/data/manifest';

interface HeroProps {
  lab: LabManifestEntry;
}

/** Equation-hero block used at the top of every lab page. */
export function Hero({ lab }: HeroProps) {
  return (
    <section className="page-shell max-w-page-lg max-md:px-xl">
      <div className="eyebrow-rule text-2 mb-lg">{lab.heroLabel}</div>
      <h1 className="font-2 tracking-1 text-text mb-2xl max-w-[11ch] text-[clamp(56px,9vw,132px)] leading-1 font-light">
        {lab.heroHeadline}
      </h1>
      <div className="formula-hero">{lab.formula}</div>
      <p className="font-2 text-7 text-text-dim max-w-col mt-xl leading-3 font-light italic">
        {lab.deck}
      </p>
    </section>
  );
}
