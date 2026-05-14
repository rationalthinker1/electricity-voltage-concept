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
    <div className="mt-[90px] pt-[36px] border-t border-border-2 reveal in">
      <div className="eyebrow-rule-1 accent-brand">Sources</div>
      <ol className="list-decimal pl-[32px] m-0">
        {ids.map(id => {
          const src = SOURCES[id];
          if (!src) {
            // Defensive: don't crash if a key is missing — surface the bad id.
            return (
              <li key={id} className="py-md border-b border-border text-[14px] leading-[1.55] text-color-5 marker:font-3 marker:text-[10px] marker:text-accent">
                <span className="source-title-1">Missing source: {id}</span>
              </li>
            );
          }
          return (
            <li key={id} className="py-md border-b border-border text-[14px] leading-[1.55] text-color-5 marker:font-3 marker:text-[10px] marker:text-accent last:border-b-0">
              <span className="source-title-1">{src.title}</span>
              {' — '}
              <span className="source-author-1">{src.author}</span>
              {src.year && ` (${src.year})`}
              {src.venue && `, ${src.venue}`}
              {src.locator && `, ${src.locator}`}
              {src.url && (
                <>
                  {'. '}
                  <a href={src.url} target="_blank" rel="noreferrer noopener" className="text-color-5 no-underline border-b border-dotted border-text-muted hover:text-accent hover:border-accent">
                    {src.url.replace(/^https?:\/\//, '')}
                  </a>
                </>
              )}
              {src.note && <span className="source-note-1">{src.note}</span>}
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

/** Inline numbered citation pill — clickable down to the sources list. */
export function Cite({ id, in: ids }: CiteProps) {
  const idx = ids.indexOf(id);
  if (idx === -1) {
    // eslint-disable-next-line no-console
    console.warn(`[Cite] source ${id} not in page sources array`);
    return <sup style={{ color: 'red' }}>[?]</sup>;
  }
  return (
    <a
      className="cite-inline"
      href={`#src-${id}`}
      title={SOURCES[id]?.title ?? id}
    >
      [{idx + 1}]
    </a>
  );
}
