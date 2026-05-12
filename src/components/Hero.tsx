import type { LabManifestEntry } from '@/labs/data/manifest';

interface HeroProps {
  lab: LabManifestEntry;
}

/** Equation-hero block used at the top of every lab page. */
export function Hero({ lab }: HeroProps) {
  return (
    <section className="eq-hero">
      <div className="eq-label">{lab.heroLabel}</div>
      <h1 dangerouslySetInnerHTML={{ __html: lab.heroHeadline }} />
      <div className="formula" dangerouslySetInnerHTML={{ __html: lab.formula }} />
      <p className="deck">{lab.deck}</p>
    </section>
  );
}
