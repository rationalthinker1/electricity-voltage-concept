/**
 * Reusable 3D canvas helpers for the textbook's custom projection stack.
 *
 * These build on `projection3d.ts` to provide higher-level primitives:
 * heightfield meshes, ground-plane grids, and billboard spheres. No WebGL.
 */

import { drawGlowPath, drawHalo } from './canvasPrimitives';
import { getCanvasColors, withAlpha } from './canvasTheme';
import { add, length, normalize, project, projectedRadius, scale, v3, type OrbitCamera, type Vec3 } from './projection3d';

/* ───── Heightfield mesh ────────────────────────────────────────────── */

export interface HeightfieldVertex {
  world: Vec3;
  screen: { x: number; y: number; depth: number };
  scalar: number;
}

export interface HeightfieldTriangle {
  verts: [HeightfieldVertex, HeightfieldVertex, HeightfieldVertex];
  centerDepth: number;
  avgScalar: number;
}

export interface HeightfieldOptions {
  /** Scalar function f(x, z) → y (height). */
  scalarFn: (x: number, z: number) => number;
  /** Half-width of the grid in world units. */
  extent: number;
  /** Subdivisions per side (creates (steps)² cells). */
  steps: number;
  cam: OrbitCamera;
  w: number;
  h: number;
}

/**
 * Build a projected, depth-sorted triangle mesh from a scalar field.
 * The grid spans [-extent, extent] in both x and z; y comes from `scalarFn`.
 * Triangles are returned back-to-front (Painter's order).
 */
export function buildHeightfieldMesh(options: HeightfieldOptions): HeightfieldTriangle[] {
  const { scalarFn, extent, steps, cam, w, h } = options;
  const step = (extent * 2) / steps;
  const rows: HeightfieldVertex[][] = [];

  for (let iz = 0; iz <= steps; iz++) {
    const row: HeightfieldVertex[] = [];
    const z = -extent + iz * step;
    for (let ix = 0; ix <= steps; ix++) {
      const x = -extent + ix * step;
      const y = scalarFn(x, z);
      const world = v3(x, y, z);
      row.push({ world, screen: project(world, cam, w, h), scalar: y });
    }
    rows.push(row);
  }

  const tris: HeightfieldTriangle[] = [];
  for (let iz = 0; iz < steps; iz++) {
    for (let ix = 0; ix < steps; ix++) {
      const a = rows[iz]![ix]!;
      const b = rows[iz]![ix + 1]!;
      const c = rows[iz + 1]![ix]!;
      const d = rows[iz + 1]![ix + 1]!;

      if (a.screen.depth > 0 && b.screen.depth > 0 && c.screen.depth > 0) {
        tris.push({
          verts: [a, b, c],
          centerDepth: (a.screen.depth + b.screen.depth + c.screen.depth) / 3,
          avgScalar: (a.scalar + b.scalar + c.scalar) / 3,
        });
      }
      if (b.screen.depth > 0 && d.screen.depth > 0 && c.screen.depth > 0) {
        tris.push({
          verts: [b, d, c],
          centerDepth: (b.screen.depth + d.screen.depth + c.screen.depth) / 3,
          avgScalar: (b.scalar + d.scalar + c.scalar) / 3,
        });
      }
    }
  }

  tris.sort((t1, t2) => t2.centerDepth - t1.centerDepth);
  return tris;
}

/**
 * Draw a pre-built heightfield mesh with per-triangle colouring.
 * `colorFn` receives the triangle's average scalar and returns a CSS colour.
 * `alphaFn` receives the triangle's average scalar and returns the fill alpha.
 */
export function drawHeightfieldMesh(
  ctx: CanvasRenderingContext2D,
  tris: HeightfieldTriangle[],
  colorFn: (scalar: number) => string,
  alphaFn: (scalar: number) => number,
) {
  for (const tri of tris) {
    const [a, b, c] = tri.verts;
    ctx.beginPath();
    ctx.moveTo(a.screen.x, a.screen.y);
    ctx.lineTo(b.screen.x, b.screen.y);
    ctx.lineTo(c.screen.x, c.screen.y);
    ctx.closePath();

    const baseColor = colorFn(tri.avgScalar);
    const alpha = alphaFn(tri.avgScalar);
    ctx.fillStyle = withAlpha(baseColor, alpha);
    ctx.fill();

    ctx.strokeStyle = withAlpha(baseColor, alpha * 0.6);
    ctx.lineWidth = 0.6;
    ctx.stroke();
  }
}

/* ───── Ground-plane grid ───────────────────────────────────────────── */

export interface GridPlaneOptions {
  extent: number;
  divisions?: number;
  lineAlpha?: number;
  fillAlpha?: number;
}

export interface ProjectedLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface GridPlaneGeometry {
  lines: ProjectedLine[];
  fill: Array<{ x: number; y: number }> | null;
}

/**
 * Pure geometry builder: project a ground-plane grid onto screen space.
 * Returns line segments and an optional fill polygon. No canvas mutation.
 */
export function buildGridPlaneProjected(
  cam: OrbitCamera,
  w: number,
  h: number,
  extent: number,
  divisions: number,
): GridPlaneGeometry {
  const lines: ProjectedLine[] = [];
  for (let i = 0; i <= divisions; i++) {
    const t = (i / divisions) * 2 * extent - extent;
    const px1 = project(v3(-extent, 0, t), cam, w, h);
    const px2 = project(v3(extent, 0, t), cam, w, h);
    if (px1.depth > 0 && px2.depth > 0) {
      lines.push({ x1: px1.x, y1: px1.y, x2: px2.x, y2: px2.y });
    }
    const pz1 = project(v3(t, 0, -extent), cam, w, h);
    const pz2 = project(v3(t, 0, extent), cam, w, h);
    if (pz1.depth > 0 && pz2.depth > 0) {
      lines.push({ x1: pz1.x, y1: pz1.y, x2: pz2.x, y2: pz2.y });
    }
  }

  const corners = [
    project(v3(-extent, 0, -extent), cam, w, h),
    project(v3(extent, 0, -extent), cam, w, h),
    project(v3(extent, 0, extent), cam, w, h),
    project(v3(-extent, 0, extent), cam, w, h),
  ];
  const fill = corners.every((p) => p.depth > 0)
    ? corners.map((p) => ({ x: p.x, y: p.y }))
    : null;

  return { lines, fill };
}

/**
 * Draw a faint grid on the horizontal plane y = 0.
 * Thin impure wrapper around `buildGridPlaneProjected`.
 */
export function drawGridPlane(
  ctx: CanvasRenderingContext2D,
  cam: OrbitCamera,
  w: number,
  h: number,
  colors: { textDim: string },
  opts: GridPlaneOptions,
) {
  const { extent, divisions = 10, lineAlpha = 0.12, fillAlpha = 0.03 } = opts;
  const geo = buildGridPlaneProjected(cam, w, h, extent, divisions);

  ctx.strokeStyle = withAlpha(colors.textDim, lineAlpha);
  ctx.lineWidth = 1;
  for (const line of geo.lines) {
    ctx.beginPath();
    ctx.moveTo(line.x1, line.y1);
    ctx.lineTo(line.x2, line.y2);
    ctx.stroke();
  }

  if (geo.fill) {
    ctx.fillStyle = withAlpha(colors.textDim, fillAlpha);
    ctx.beginPath();
    ctx.moveTo(geo.fill[0]!.x, geo.fill[0]!.y);
    for (let i = 1; i < geo.fill.length; i++) ctx.lineTo(geo.fill[i]!.x, geo.fill[i]!.y);
    ctx.closePath();
    ctx.fill();
  }
}

/* ───── Billboard sphere ────────────────────────────────────────────── */

export interface ProjectedSphereOptions {
  /** Text label drawn inside the sphere. */
  label?: string;
  /** Label colour. Defaults to canvas background. */
  labelColor?: string;
  /** If true, draw a thin stalk from the surface y up to the sphere centre. */
  surfaceY?: number;
  /** Stalk colour. Defaults to sphere colour at 0.45 alpha. */
  stalkColor?: string;
}

/**
 * Draw a perspective-correct sphere (glow + body + optional label) at a world
 * position. The sphere billboard-faces the camera automatically because it's
 * just a circle in screen space.
 */
export function drawProjectedSphere(
  ctx: CanvasRenderingContext2D,
  worldPos: Vec3,
  worldRadius: number,
  color: string,
  cam: OrbitCamera,
  w: number,
  h: number,
  opts: ProjectedSphereOptions = {},
) {
  const p = project(worldPos, cam, w, h);
  if (p.depth <= 0) return;

  const rPx = projectedRadius(worldRadius, p.depth, cam, w, h);

  // Optional stalk from a surface point up to the sphere centre
  if (opts.surfaceY !== undefined) {
    const surf = project(v3(worldPos.x, opts.surfaceY, worldPos.z), cam, w, h);
    if (surf.depth > 0) {
      ctx.strokeStyle = opts.stalkColor ?? withAlpha(color, 0.45);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(surf.x, surf.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }
  }

  // Glow halo
  drawHalo(ctx, {
    x: p.x,
    y: p.y,
    radius: rPx,
    color,
    alpha: 0.35,
    extent: 2.8,
  });

  // Body
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(p.x, p.y, rPx * 0.9, 0, Math.PI * 2);
  ctx.fill();

  // Label
  if (opts.label) {
    ctx.fillStyle = opts.labelColor ?? '#0d0d10';
    ctx.font = `bold ${Math.max(10, Math.round(rPx * 1.0))}px "JetBrains Mono", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(opts.label, p.x, p.y + 1);
  }
}

/* ───── 3D arrow ────────────────────────────────────────────────────── */

export interface Arrow3DOptions {
  lineWidth?: number;
  /** Absolute head length in pixels. Default 6. */
  headSize?: number;
  /**
   * If provided, the head length is computed dynamically as
   * `min(10 * headScale, screenLength * 0.5)` instead of using `headSize`.
   */
  headScale?: number;
  /** If true, draw the shaft with a glow halo via `drawGlowPath`. */
  glow?: boolean;
  /** Custom glow colour. Defaults to the arrow `color`. */
  glowColor?: string;
}

/**
 * Draw a 3D arrow from `from` to `to`, projected through the camera.
 * The arrowhead is drawn in screen space so it always reads correctly.
 */
export function drawArrow3D(
  ctx: CanvasRenderingContext2D,
  from: Vec3,
  to: Vec3,
  cam: OrbitCamera,
  w: number,
  h: number,
  color: string,
  opts: Arrow3DOptions = {},
) {
  const p1 = project(from, cam, w, h);
  const p2 = project(to, cam, w, h);
  if (p1.depth <= 0 || p2.depth <= 0) return;

  const lineWidth = opts.lineWidth ?? 1.6;
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const len = Math.hypot(dx, dy);
  if (len < 1e-3) return;

  let headLen: number;
  if (opts.headScale !== undefined) {
    headLen = Math.min(10 * opts.headScale, len * 0.5);
  } else {
    headLen = opts.headSize ?? 6;
  }
  const half = headLen * 0.55;
  const ux = dx / len;
  const uy = dy / len;
  const baseX = p2.x - ux * headLen;
  const baseY = p2.y - uy * headLen;

  if (opts.glow) {
    drawGlowPath(
      ctx,
      [
        { x: p1.x, y: p1.y },
        { x: p2.x, y: p2.y },
      ],
      { color, lineWidth, glowColor: opts.glowColor ?? color, glowWidth: lineWidth + 6 },
    );
  } else {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  }

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(p2.x, p2.y);
  ctx.lineTo(baseX - uy * half, baseY + ux * half);
  ctx.lineTo(baseX + uy * half, baseY - ux * half);
  ctx.closePath();
  ctx.fill();
}

/* ───── Wireframe box ───────────────────────────────────────────────── */

/**
 * Cached edge list for a unit cube (corners at ±1 on each axis).
 * Computed once at load time.
 */
const UNIT_CUBE_EDGES: Array<[Vec3, Vec3]> = (() => {
  const c: Vec3[] = [];
  for (let xi = 0; xi < 2; xi++)
    for (let yi = 0; yi < 2; yi++)
      for (let zi = 0; zi < 2; zi++)
        c.push(v3(xi === 0 ? -1 : 1, yi === 0 ? -1 : 1, zi === 0 ? -1 : 1));
  const edges: Array<[Vec3, Vec3]> = [];
  for (let i = 0; i < 8; i++) {
    for (let j = i + 1; j < 8; j++) {
      let diff = 0;
      if (c[i]!.x !== c[j]!.x) diff++;
      if (c[i]!.y !== c[j]!.y) diff++;
      if (c[i]!.z !== c[j]!.z) diff++;
      if (diff === 1) edges.push([c[i]!, c[j]!]);
    }
  }
  return edges;
})();

/* ───── Field-line tracer ───────────────────────────────────────────── */

export interface FieldLineOptions {
  /** Integration direction: +1 follows the field, −1 walks against it. */
  direction?: number;
  /** Max integration steps. */
  steps?: number;
  /** Step size in world units. */
  stepSize?: number;
  /** Stop when the point is farther than this distance from the origin. */
  maxRadius?: number;
  /** Custom stop predicate. Return `true` to end the trace. */
  stop?: (p: Vec3) => boolean;
}

/**
 * Trace a field line by integrating along the direction of a vector field.
 *
 * Starting from `seed`, the field is sampled at each step, normalised to a
 * unit direction, and the point is advanced by `direction * stepSize`.
 * The trace ends when any limit (`steps`, `maxRadius`, `stop`) is reached
 * or the field vanishes.
 */
export function traceFieldLine(
  seed: Vec3,
  fieldFn: (p: Vec3) => Vec3,
  opts: FieldLineOptions = {},
): Vec3[] {
  const dir = opts.direction ?? 1;
  const steps = opts.steps ?? 200;
  const dt = opts.stepSize ?? 0.05;
  const maxR = opts.maxRadius ?? Infinity;
  const stop = opts.stop;

  const pts: Vec3[] = [seed];
  let p = seed;
  for (let i = 0; i < steps; i++) {
    const d = normalize(fieldFn(p));
    if (d.x === 0 && d.y === 0 && d.z === 0) break;
    p = add(p, scale(d, dir * dt));
    pts.push(p);
    if (length(p) > maxR) break;
    if (stop?.(p)) break;
  }
  return pts;
}

/**
 * Draw a wireframe box centred at the origin with half-edge `halfExtent`.
 * Edges whose average depth exceeds `cam.distance` are rendered faint and
 * dashed (back lines); the rest are solid (front lines).
 */
export function drawWireframeBox(
  ctx: CanvasRenderingContext2D,
  cam: OrbitCamera,
  w: number,
  h: number,
  halfExtent: number,
  color?: string,
): void {
  const stroke = color ?? withAlpha(getCanvasColors().textDim, 0.5);
  const backStroke = color
    ? withAlpha(color, 0.35)
    : withAlpha(getCanvasColors().textDim, 0.18);
  for (const [a, b] of UNIT_CUBE_EDGES) {
    const pa = project(v3(a.x * halfExtent, a.y * halfExtent, a.z * halfExtent), cam, w, h);
    const pb = project(v3(b.x * halfExtent, b.y * halfExtent, b.z * halfExtent), cam, w, h);
    const back = pa.depth + pb.depth > 2 * cam.distance;
    ctx.strokeStyle = back ? backStroke : stroke;
    ctx.lineWidth = 1;
    ctx.setLineDash(back ? [4, 4] : []);
    ctx.beginPath();
    ctx.moveTo(pa.x, pa.y);
    ctx.lineTo(pb.x, pb.y);
    ctx.stroke();
  }
  ctx.setLineDash([]);
}
