import type { LabManifestEntry } from '@/labs/data/manifest';

interface HeroProps {
  lab: LabManifestEntry;
}

/** Equation-hero block used at the top of every lab page. */
export function Hero({ lab }: HeroProps) {
  return (
    <section className="max-w-page-lg mx-auto px-3xl max-md:px-xl pt-5xl pb-4xl">
      <div className="eyebrow-rule text-2 mb-lg">{lab.heroLabel}</div>
      <h1
        className="font-2 font-light text-[clamp(56px,9vw,132px)] leading-1 tracking-1 text-text max-w-[11ch] mb-2xl [&_em]:italic [&_em]:font-normal [&_em]:text-color-accent"
        dangerouslySetInnerHTML={{ __html: lab.heroHeadline }}
      />
      <div
        className="font-4 italic text-text my-xl [&_sub]:text-[.58em] [&_sup]:text-[.58em] [&_sub]:leading-none [&_sup]:leading-none [&_sub]:align-[-.32em] [&_sup]:align-[.5em] text-[clamp(48px,8vw,96px)]"
        dangerouslySetInnerHTML={{ __html: lab.formula }}
      />
      <p className="font-2 italic font-light text-7 leading-3 text-text-dim max-w-col mt-xl">{lab.deck}</p>
    </section>
  );
}
