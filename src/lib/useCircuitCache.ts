/**
 * Memoised offscreen-canvas cache for static schematic backdrops.
 *
 * Why this exists
 * ────────────────
 * Many demos redraw the same schematic every frame even though nothing about
 * it has changed — only an overlay (current arrows, glow, value labels) is
 * animating. Per MDN's canvas optimisation guide, the cheapest fix is to
 * render the static layer once into an offscreen HTMLCanvasElement and
 * drawImage it each tick.
 *
 * `useCircuitCache` returns a ref pointing at the pre-rendered canvas. The
 * caller invalidates by changing the `deps` array — same semantics as
 * `useMemo`. While `deps` are stable, every rAF tick is just one drawImage
 * call instead of dozens of beginPath / stroke / fillText.
 *
 * Caveats
 * ───────
 * - The cache renders at the supplied DPR; callers should pass the same DPR
 *   the visible canvas uses or the bake will look blurry.
 * - The cached canvas is at backing-store size (w·dpr × h·dpr); when you
 *   blit it onto a context that already has a DPR transform applied, use
 *   the CSS-pixel dimensions: `ctx.drawImage(cache, 0, 0, w, h)`.
 * - Cache key is the dep array's referential equality, like useMemo. If the
 *   spec depends on a slider value, include that value in deps.
 */

import { useEffect, useRef } from 'react';

import { renderCircuitToCanvas, type CircuitSpec } from '@/lib/canvasPrimitives';

export interface CircuitCacheHandle {
  /** The most recent offscreen canvas, or null before the first render. */
  current: HTMLCanvasElement | null;
}

/**
 * Pre-render a CircuitSpec to an offscreen canvas and re-render only when
 * deps change. The returned ref's `.current` is the latest cached canvas
 * (or null until the first effect fires).
 *
 * Pass `spec` as a function so the spec object isn't rebuilt every render
 * — only when deps fire is it (re)constructed and (re)rendered.
 */
export function useCircuitCache(
  build: () => CircuitSpec,
  w: number,
  h: number,
  dpr: number,
  deps: ReadonlyArray<unknown>,
): CircuitCacheHandle {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    if (w <= 0 || h <= 0) return;
    ref.current = renderCircuitToCanvas(build(), w, h, dpr);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [w, h, dpr, ...deps]);
  return ref;
}
