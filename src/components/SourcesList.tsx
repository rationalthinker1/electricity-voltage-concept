import { SOURCES, type SourceKey } from '@/lib/sources';

interface SourcesListProps {
  ids: SourceKey[];
}

/**
 * Per-page Sources section. Renders a numbered bibliography of the
 * specific sources cited by this lab. Inline citations elsewhere in
 * prose reference these by [n].
 */
export function SourcesList({ ids }: SourcesListProps) {
  if (!ids.length) return null;
  return (
    <div className="reveal in  mb-4xl pt-2xl border-t border-border-strong">
      <div className="eyebrow-rule mb-xl">Sources</div>
      <ol className="list-none p-0 [counter-reset:src]">
        {ids.map(id => {
          const src = SOURCES[id];
          if (!src) {
            // Defensive: don't crash if a key is missing — surface the bad id.
            return (
              <li key={id} className="[counter-increment:src] relative py-lg pl-3xl leading-4 text-text-dim border-b border-dotted border-border last:border-b-0 before:content-['['_counter(src)_']'] before:absolute before:left-0 before:top-md before:font-3 before:text-2 before:text-accent before:tracking-3">
                <span className="text-text font-medium">Missing source: {id}</span>
              </li>
            );
          }
          return (
            <li key={id} className="[counter-increment:src] relative py-lg pl-3xl leading-4 text-text-dim border-b border-dotted border-border last:border-b-0 before:content-['['_counter(src)_']'] before:absolute before:left-0 before:top-md before:font-3 before:text-2 before:text-accent before:tracking-3">
              <span className="text-text font-medium">{src.title}</span>
              {' — '}
              <span className="text-text-muted italic">{src.author}</span>
              {src.year && ` (${src.year})`}
              {src.venue && `, ${src.venue}`}
              {src.locator && `, ${src.locator}`}
              {src.url && (
                <>
                  {'. '}
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-text-dim no-underline border-b border-dotted border-text-muted break-words hover:text-accent hover:border-accent"
                  >
                    {src.url.replace(/^https?:\/\//, '')}
                  </a>
                </>
              )}
              {src.note && <span className="block mt-sm text-3 text-text-muted italic">{src.note}</span>}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

interface CiteProps {
  /** Source key to cite. Must be present in the page's sources array. */
  id: SourceKey;
  /** The page's full sources array, for index lookup */
  in: SourceKey[];
}

/** Inline numbered citation pill — clickable down to the sources list.
 *  Keeps the legacy `cite` className so chapter-narrative descendant
 *  selectors that target `.cite` keep matching. */
export function Cite({ id, in: ids }: CiteProps) {
  const idx = ids.indexOf(id);
  if (idx === -1) {
     
    console.warn(`[Cite] source ${id} not in page sources array`);
    return <sup style={{ color: 'red' }}>[?]</sup>;
  }
  return (
    <a
      className="cite inline-block font-3 text-1 align-super leading-none text-accent bg-accent-soft py-px px-sm mx-px rounded-2 no-underline tracking-normal hover:bg-accent hover:text-bg"
      href={`#src-${id}`}
      title={SOURCES[id]?.title ?? id}
    >
      [{idx + 1}]
    </a>
  );
}
