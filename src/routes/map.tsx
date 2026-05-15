import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { useMemo, useState } from 'react';

import { CHAPTERS, type ChapterEntry, type ChapterSlug } from '@/textbook/data/chapters';

export const Route = createFileRoute('/map')({
  component: MapPage,
});

interface LaidOutNode {
  chapter: ChapterEntry;
  depth: number;
  col: number;
  x: number;
  y: number;
}

interface Edge {
  from: ChapterSlug;
  to: ChapterSlug;
}

const NODE_W = 200;
const NODE_H = 56;
const COL_GAP = 24;
const ROW_GAP = 80;
const PADDING_X = 60;
const PADDING_Y = 80;

function layoutGraph(chapters: ChapterEntry[]): {
  nodes: LaidOutNode[];
  edges: Edge[];
  width: number;
  height: number;
} {
  // Build a depth map using longest-path layering.
  const bySlug = new Map<ChapterSlug, ChapterEntry>(chapters.map(c => [c.slug, c]));
  const depth = new Map<ChapterSlug, number>();

  function depthOf(slug: ChapterSlug, seen: Set<ChapterSlug> = new Set()): number {
    if (depth.has(slug)) return depth.get(slug)!;
    if (seen.has(slug)) return 0; // defensive: cycle guard
    seen.add(slug);
    const c = bySlug.get(slug);
    const prereqs = c?.prereqs ?? [];
    let d = 0;
    for (const p of prereqs) {
      if (!bySlug.has(p)) continue;
      d = Math.max(d, depthOf(p, seen) + 1);
    }
    depth.set(slug, d);
    return d;
  }

  chapters.forEach(c => depthOf(c.slug));

  // Group by depth.
  const layers = new Map<number, ChapterEntry[]>();
  for (const c of chapters) {
    const d = depth.get(c.slug)!;
    if (!layers.has(d)) layers.set(d, []);
    layers.get(d)!.push(c);
  }
  // Sort within each layer by chapter number for stability.
  for (const arr of layers.values()) arr.sort((a, b) => a.number - b.number);

  const maxCols = Math.max(...Array.from(layers.values()).map(a => a.length));
  const width = PADDING_X * 2 + maxCols * NODE_W + (maxCols - 1) * COL_GAP;
  const totalLayers = Math.max(...Array.from(layers.keys())) + 1;
  const height = PADDING_Y * 2 + totalLayers * NODE_H + (totalLayers - 1) * ROW_GAP;

  const nodes: LaidOutNode[] = [];
  for (const [d, arr] of layers.entries()) {
    const layerWidth = arr.length * NODE_W + (arr.length - 1) * COL_GAP;
    const xStart = (width - layerWidth) / 2;
    arr.forEach((c, idx) => {
      nodes.push({
        chapter: c,
        depth: d,
        col: idx,
        x: xStart + idx * (NODE_W + COL_GAP),
        y: PADDING_Y + d * (NODE_H + ROW_GAP),
      });
    });
  }

  const edges: Edge[] = [];
  for (const c of chapters) {
    for (const p of c.prereqs ?? []) {
      if (bySlug.has(p)) edges.push({ from: p, to: c.slug });
    }
  }

  return { nodes, edges, width, height };
}

// SVG-only styles: SVG elements can't consume Tailwind text/fill utilities
// uniformly across stroke/fill transitions, so we keep a tiny scoped block.
const SVG_STYLES = `
.map-edge {
  fill: none;
  stroke: var(--border-strong);
  stroke-width: 1.2;
  marker-end: url(#arrow);
  color: var(--border-strong);
  transition: stroke .2s ease, opacity .2s ease;
}
.map-edge-active {
  stroke: var(--accent);
  color: var(--accent);
  stroke-width: 1.8;
  opacity: 1;
}
.map-edge-faded { opacity: .25; }

.map-node { cursor: pointer; transition: opacity .2s ease; }
.map-node:focus { outline: none; }
.map-node-rect {
  fill: var(--bg-elevated);
  stroke: var(--border-strong);
  stroke-width: 1;
  transition: fill .2s ease, stroke .2s ease;
}
.map-node-num {
  font-family: var(--font-3);
  font-size: 10px;
  letter-spacing: .12em;
  text-transform: uppercase;
  fill: var(--text-muted);
}
.map-node-title {
  font-family: var(--font-1);
  font-size: 13px;
  fill: var(--text);
}
.map-node:hover .map-node-rect,
.map-node:focus .map-node-rect,
.map-node-hover .map-node-rect {
  fill: var(--accent-soft);
  stroke: var(--accent);
}
.map-node-hover .map-node-num { fill: var(--accent); }
.map-node-hover .map-node-title { fill: var(--text); }
.map-node-prereq .map-node-rect { fill: var(--bg-elevated); stroke: var(--teal); }
.map-node-prereq .map-node-num { fill: var(--teal); }
.map-node-dep .map-node-rect { fill: var(--bg-elevated); stroke: var(--pink); }
.map-node-dep .map-node-num { fill: var(--pink); }
.map-node-faded { opacity: .35; }
`;

function MapPage() {
  const [hovered, setHovered] = useState<ChapterSlug | null>(null);
  const navigate = useNavigate();

  const { nodes, edges, width, height, hasPrereqData } = useMemo(() => {
    const hasPrereqData = CHAPTERS.some(c => (c.prereqs?.length ?? 0) > 0);
    const layout = layoutGraph(CHAPTERS);
    return { ...layout, hasPrereqData };
  }, []);

  const nodeBySlug = useMemo(() => {
    const m = new Map<ChapterSlug, LaidOutNode>();
    for (const n of nodes) m.set(n.chapter.slug, n);
    return m;
  }, [nodes]);

  // Build adjacency for hover highlighting.
  const { prereqsOf, dependentsOf } = useMemo(() => {
    const prereqs = new Map<ChapterSlug, Set<ChapterSlug>>();
    const deps = new Map<ChapterSlug, Set<ChapterSlug>>();
    for (const e of edges) {
      if (!prereqs.has(e.to)) prereqs.set(e.to, new Set());
      prereqs.get(e.to)!.add(e.from);
      if (!deps.has(e.from)) deps.set(e.from, new Set());
      deps.get(e.from)!.add(e.to);
    }
    return { prereqsOf: prereqs, dependentsOf: deps };
  }, [edges]);

  const highlightSet = useMemo(() => {
    if (!hovered) return null;
    const s = new Set<ChapterSlug>([hovered]);
    prereqsOf.get(hovered)?.forEach(x => s.add(x));
    dependentsOf.get(hovered)?.forEach(x => s.add(x));
    return s;
  }, [hovered, prereqsOf, dependentsOf]);

  function isHighlighted(slug: ChapterSlug): boolean {
    return !highlightSet || highlightSet.has(slug);
  }

  function edgeHighlighted(e: Edge): boolean {
    return !hovered || e.from === hovered || e.to === hovered;
  }

  return (
    <section className="pt-[140px] pb-[80px] px-[40px] max-w-[1300px] mx-auto max-[700px]:pt-[120px] max-[700px]:pb-[60px] max-[700px]:px-[18px]">
      <style>{SVG_STYLES}</style>
      <div className="mb-[28px]">
        <div className="eyebrow-muted tracking-[.18em] mb-[12px]">
          Field · Theory · Course map
        </div>
        <h1 className="title-display font-light text-[52px] leading-[1.05] tracking-[-.02em] mb-[14px] max-[700px]:text-[36px] [&_em]:italic [&_em]:text-accent [&_em]:font-normal">
          The chapter <em>graph</em>.
        </h1>
        <p className="body-copy max-w-[640px] max-[700px]:text-[15px]">
          Each chapter sits above its prerequisites. Click a node to open it.
          Hover to highlight the dependency chain.
          {!hasPrereqData && (
            <span className="text-accent italic">
              {' '}Prerequisite data is still loading — only chapter positions are
              shown until the manifest is populated.
            </span>
          )}
        </p>
      </div>

      <div className="flex gap-[16px] items-center font-3 text-[11px] text-color-5 uppercase tracking-[.12em] mb-[18px] flex-wrap">
        <span className="inline-block w-[14px] h-[14px] rounded-3 border border-border-2 align-middle mr-[6px] ml-[12px] bg-accent" /> selected
        <span className="inline-block w-[14px] h-[14px] rounded-3 border border-border-2 align-middle mr-[6px] ml-[12px] bg-teal" /> prerequisite
        <span className="inline-block w-[14px] h-[14px] rounded-3 border border-border-2 align-middle mr-[6px] ml-[12px] bg-pink" /> depends on
      </div>

      <div
        className="card-surface rounded-[12px] p-[12px] overflow-auto [-webkit-overflow-scrolling:touch]"
        role="region"
        aria-label="Chapter prerequisite graph"
      >
        <svg
          className="block max-w-full h-auto text-text-muted"
          viewBox={`0 0 ${width} ${height}`}
          width={width}
          height={height}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
            </marker>
          </defs>

          <g className="edges">
            {edges.map((e, i) => {
              const from = nodeBySlug.get(e.from);
              const to = nodeBySlug.get(e.to);
              if (!from || !to) return null;
              const x1 = from.x + NODE_W / 2;
              const y1 = from.y + NODE_H;
              const x2 = to.x + NODE_W / 2;
              const y2 = to.y;
              const midY = (y1 + y2) / 2;
              const d = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
              const cls = ['map-edge'];
              if (edgeHighlighted(e)) cls.push('map-edge-active');
              else cls.push('map-edge-faded');
              return <path key={i} d={d} className={cls.join(' ')} />;
            })}
          </g>

          <g className="nodes">
            {nodes.map(n => {
              const slug = n.chapter.slug;
              const active = isHighlighted(slug);
              const isHover = hovered === slug;
              const isPrereq = hovered && prereqsOf.get(hovered)?.has(slug);
              const isDep = hovered && dependentsOf.get(hovered)?.has(slug);
              const cls = ['map-node'];
              if (isHover) cls.push('map-node-hover');
              else if (isPrereq) cls.push('map-node-prereq');
              else if (isDep) cls.push('map-node-dep');
              else if (!active) cls.push('map-node-faded');
              return (
                <g
                  key={slug}
                  className={cls.join(' ')}
                  transform={`translate(${n.x} ${n.y})`}
                  role="link"
                  tabIndex={0}
                  aria-label={`Chapter ${n.chapter.number}: ${n.chapter.title}`}
                  onMouseEnter={() => setHovered(slug)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(slug)}
                  onBlur={() => setHovered(null)}
                  onClick={() => navigate({ to: '/textbook/$chapterSlug', params: { chapterSlug: slug } })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate({ to: '/textbook/$chapterSlug', params: { chapterSlug: slug } });
                    }
                  }}
                >
                  <rect
                    width={NODE_W}
                    height={NODE_H}
                    rx={10}
                    ry={10}
                    className="map-node-rect"
                  />
                  <text x={14} y={22} className="map-node-num">
                    Ch.{n.chapter.number}
                  </text>
                  <text x={14} y={42} className="map-node-title">
                    {truncate(n.chapter.title, 22)}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      <div className="flex justify-between items-center mt-[28px] pt-[20px] border-t border-border-1">
        <Link to="/" className="eyebrow-muted text-[12px] no-underline hover:text-accent">← Back to contents</Link>
        <Link to="/tracks" className="eyebrow-muted text-[12px] no-underline hover:text-accent">Tracks →</Link>
      </div>
    </section>
  );
}

function truncate(s: string, n: number): string {
  return s.length <= n ? s : s.slice(0, n - 1) + '…';
}
