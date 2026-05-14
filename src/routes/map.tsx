import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { useMemo, useState } from 'react';

import { CHAPTERS, type ChapterEntry, type ChapterSlug } from '@/textbook/data/chapters';
import '@/styles/map.css';

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
    <section className="map-page">
      <div className="map-header">
        <div className="map-eyebrow">Field · Theory · Course map</div>
        <h1>The chapter <em>graph</em>.</h1>
        <p className="map-lede">
          Each chapter sits above its prerequisites. Click a node to open it.
          Hover to highlight the dependency chain.
          {!hasPrereqData && (
            <span className="map-degrade">
              {' '}Prerequisite data is still loading — only chapter positions are
              shown until the manifest is populated.
            </span>
          )}
        </p>
      </div>

      <div className="map-legend">
        <span className="legend-swatch legend-self" /> selected
        <span className="legend-swatch legend-prereq" /> prerequisite
        <span className="legend-swatch legend-dep" /> depends on
      </div>

      <div className="map-viewport" role="region" aria-label="Chapter prerequisite graph">
        <svg
          className="map-svg"
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
              const cls = ['edge'];
              if (edgeHighlighted(e)) cls.push('edge-active');
              else cls.push('edge-faded');
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

      <div className="map-footer">
        <Link to="/" className="map-back">← Back to contents</Link>
        <Link to="/tracks" className="map-back">Tracks →</Link>
      </div>
    </section>
  );
}

function truncate(s: string, n: number): string {
  return s.length <= n ? s : s.slice(0, n - 1) + '…';
}
