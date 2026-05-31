/**
 * Small 2D geometry utilities shared across canvas demos.
 *
 * Pure functions, no canvas/DOM/theme dependencies. The companion drawing
 * helpers live in `canvasPrimitives.ts` (glyphs) and `canvasLayout.ts` (text);
 * this file is the math those draw loops reach for.
 */

/**
 * Shortest distance from a point P to the line segment A→B, all in the same
 * coordinate space (pixels or metres). Clamps the projection parameter to
 * [0, 1] so the result is the distance to the nearest point *on the segment*,
 * not the infinite line.
 *
 * Common uses: rejecting a drag that would push a path through a singularity,
 * hit-testing a click against a wire, snapping a probe to the closest lead.
 */
export function pointSegmentDistance(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
): number {
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy;
  if (len2 < 1e-12) return Math.hypot(px - ax, py - ay);
  let t = ((px - ax) * dx + (py - ay) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (ax + dx * t), py - (ay + dy * t));
}
