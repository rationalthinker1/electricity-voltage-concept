import type { LabManifestEntry } from '@/labs/data/manifest';

interface HeroProps {
  lab: LabManifestEntry;
}

/** Equation-hero block used at the top of every lab page. */
export function Hero({ lab }: HeroProps) {
  return (
    <section className="container-max pt-[150px] pb-[70px]">
      <div className="text-meta text-color-accent mb-[18px] flex items-center gap-[14px] before:content-[''] before:w-[36px] before:h-[1px] before:bg-color-accent">{lab.heroLabel}</div>
      <h1
        className="title-xl max-w-[11ch] mb-[30px] [&_em]:italic [&_em]:font-normal [&_em]:text-color-accent"
        dangerouslySetInnerHTML={{ __html: lab.heroHeadline }}
      />
      <div
        className="text-formula my-xl [&_sub]:text-[.58em] [&_sup]:text-[.58em] [&_sub]:leading-none [&_sup]:leading-none [&_sub]:align-[-.32em] [&_sup]:align-[.5em] text-[clamp(48px,8vw,96px)]"
        dangerouslySetInnerHTML={{ __html: lab.formula }}
      />
      <p className="text-deck mt-xl">{lab.deck}</p>
    </section>
  );
}

