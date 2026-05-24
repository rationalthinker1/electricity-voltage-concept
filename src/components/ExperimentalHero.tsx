import type { LabManifestEntry } from '@/labs/data/manifest';

interface ExperimentalHeroProps {
  lab: LabManifestEntry;
}

const DIFFICULTY_LABEL: Record<NonNullable<LabManifestEntry['difficulty']>, string> = {
  intro: 'Intro',
  core: 'Core',
  advanced: 'Advanced',
};

/**
 * Sibling of {@link Hero} for experimental labs.
 *
 * The equation hero leads with a giant formula; an experimental lab has no
 * single canonical equation. It leads instead with equipment + software + a
 * runtime/difficulty badge row — the same metadata a student would expect on
 * a university lab handout.
 */
export function ExperimentalHero({ lab }: ExperimentalHeroProps) {
  const equipment = lab.equipment ?? [];
  const software = lab.software ?? [];

  return (
    <section className="page-shell max-w-page-lg max-md:px-xl">
      <div className="eyebrow-rule text-2 mb-lg">{lab.heroLabel}</div>
      <h1 className="font-2 tracking-1 text-text mb-2xl max-w-[14ch] text-[clamp(56px,9vw,132px)] leading-1 font-light">
        {lab.heroHeadline}
      </h1>

      {/* Badge row — runtime + difficulty + a small "experimental" pill. */}
      <div className="gap-md mb-xl flex flex-wrap items-center">
        <span className="font-3 text-2 text-accent border-accent-soft bg-accent-soft rounded-2 px-md py-xxs tracking-3 border uppercase">
          Experimental
        </span>
        {lab.runtime && (
          <span className="font-3 text-2 text-text-dim border-border rounded-2 px-md py-xxs tracking-3 border uppercase">
            {lab.runtime}
          </span>
        )}
        {lab.difficulty && (
          <span className="font-3 text-2 text-text-dim border-border rounded-2 px-md py-xxs tracking-3 border uppercase">
            {DIFFICULTY_LABEL[lab.difficulty]}
          </span>
        )}
      </div>

      <div className="gap-2xl max-md:gap-xl mb-xl grid grid-cols-2 max-md:grid-cols-1">
        {equipment.length > 0 && (
          <div>
            <div className="font-3 text-2 text-text-muted tracking-4 mb-md uppercase">
              You will need
            </div>
            <ul className="font-1 text-6 text-text-dim space-y-1 leading-3">
              {equipment.map((item) => (
                <li key={item}>— {item}</li>
              ))}
            </ul>
          </div>
        )}
        {software.length > 0 && (
          <div>
            <div className="font-3 text-2 text-text-muted tracking-4 mb-md uppercase">
              Software / tools
            </div>
            <ul className="font-1 text-6 text-text-dim space-y-2 leading-3">
              {software.map((s) => (
                <li key={s.url}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-text hover:text-accent underline decoration-dotted underline-offset-4"
                  >
                    {s.name}
                  </a>
                  {s.free && (
                    <span className="font-3 text-1 text-accent ml-xs tracking-3 uppercase">
                      · free
                    </span>
                  )}
                  {s.note && (
                    <div className="font-1 text-2 text-text-muted mt-1 leading-2">{s.note}</div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <p className="font-2 text-7 text-text-dim max-w-col mt-xl leading-3 font-light italic">
        {lab.deck}
      </p>
    </section>
  );
}
