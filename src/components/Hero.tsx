import type { LabManifestEntry } from '@/labs/data/manifest';

interface HeroProps {
  lab: LabManifestEntry;
}

/** Equation-hero block used at the top of every lab page. */
export function Hero({ lab }: HeroProps) {
  return (
    <section className="max-w-[1480px] mx-auto pt-[150px] px-[40px] pb-[70px] relative">
      <div className="eyebrow-rule-1 accent-brand">{lab.heroLabel}</div>
      <h1
        className="font-2 font-light text-[clamp(56px,9vw,132px)] leading-[.95] tracking-[-.035em] max-w-[11ch] mb-[30px] text-color-4 [&_em]:italic [&_em]:font-normal [&_em]:text-accent"
        dangerouslySetInnerHTML={{ __html: lab.heroHeadline }}
      />
      <div
        className="font-4 italic text-[clamp(48px,8vw,96px)] leading-none text-color-4 my-xl [&_sub]:text-[.58em] [&_sup]:text-[.58em] [&_sub]:leading-none [&_sup]:leading-none [&_sub]:align-[-.32em] [&_sup]:align-[.5em]"
        dangerouslySetInnerHTML={{ __html: lab.formula }}
      />
      <p className="font-2 italic font-light text-[clamp(22px,2.2vw,32px)] leading-[1.35] text-color-5 max-w-[620px] mt-xl">{lab.deck}</p>
    </section>
  );
}
