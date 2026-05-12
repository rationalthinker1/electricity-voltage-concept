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
    <div className="sources reveal in">
      <div className="sources-head">Sources</div>
      <ol>
        {ids.map(id => {
          const src = SOURCES[id];
          if (!src) {
            // Defensive: don't crash if a key is missing — surface the bad id.
            return (
              <li key={id}>
                <span className="src-title">Missing source: {id}</span>
              </li>
            );
          }
          return (
            <li key={id}>
              <span className="src-title">{src.title}</span>
              {' — '}
              <span className="src-author">{src.author}</span>
              {src.year && ` (${src.year})`}
              {src.venue && `, ${src.venue}`}
              {src.locator && `, ${src.locator}`}
              {src.url && (
                <>
                  {'. '}
                  <a href={src.url} target="_blank" rel="noreferrer noopener">
                    {src.url.replace(/^https?:\/\//, '')}
                  </a>
                </>
              )}
              {src.note && <span className="src-note">{src.note}</span>}
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
      className="cite"
      href={`#src-${id}`}
      title={SOURCES[id]?.title ?? id}
    >
      [{idx + 1}]
    </a>
  );
}
