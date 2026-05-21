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
 * `useCircuitCache(build, deps)` returns a function. Inside the rAF /
 * useSimLoop draw callback, call `getCache(w, h, dpr)`; the hook lazily
 * bakes the cache on the first call and re-bakes whenever `(w, h, dpr)` or
 * any value in `deps` changes (referential comparison, like useMemo).
 *
 * Typical use:
 *
 *   const getStatic = useCircuitCache(
 *     (w, h, _dpr) => ({ elements: buildElements(w, h, R1, R2) }),
 *     [R1, R2],
 *   );
 *
 *   const setup = useSimLoop(stateRef, ({ ctx, w, h, dpr }) => {
 *     const off = getStatic(w, h, dpr);
 *     if (off) ctx.drawImage(off, 0, 0, w, h);
 *     // …per-frame overlay…
 *   }, []);
 *
 * Why not at render time
 * ──────────────────────
 * AutoResizeCanvas measures the canvas size inside its setup callback (it
 * watches a ResizeObserver on the parent), so the component itself doesn't
 * know `w` / `h` / `dpr` at React-render time. The hook therefore defers
 * the bake to the first frame and re-bakes only when the size actually
 * changes — once the canvas settles, every subsequent tick is a single
 * cache lookup.
 *
 * Caveats
 * ───────
 * - The cache renders at the supplied DPR; pass the same DPR the visible
 *   canvas uses or the bake looks blurry.
 * - The cached canvas is backing-store size (w·dpr × h·dpr); when blitting
 *   onto a context that already has a DPR transform applied, use the
 *   CSS-pixel dimensions: `ctx.drawImage(off, 0, 0, w, h)`.
 * - Cache key is the dep array's referential equality, like useMemo. If
 *   the spec depends on a slider value, include that value in deps.
 */

import { useMemo, useRef } from 'react';

import { renderCircuitToCanvas, type CircuitSpec } from '@/lib/canvasPrimitives';

/** Build the static layer. Receives the current canvas size + DPR. */
export type CircuitCacheBuilder = (w: number, h: number, dpr: number) => CircuitSpec;

/**
 * Returns a stable getter to call inside the draw loop. The getter rebuilds
 * the offscreen canvas whenever (w, h, dpr) or any entry in `deps` changes;
 * otherwise it returns the cached canvas in O(1).
 */
export function useCircuitCache(
  build: CircuitCacheBuilder,
  deps: ReadonlyArray<unknown>,
): (w: number, h: number, dpr: number) => HTMLCanvasElement | null {
  const cacheRef = useRef<{ key: string; canvas: HTMLCanvasElement } | null>(null);
  const buildRef = useRef(build);
  buildRef.current = build;

  // Track deps in a ref and compare synchronously each render. When any
  // entry changes (referential), drop the cache so the next getter call
  // re-bakes. Doing this in render is intentional — a useEffect-based
  // invalidation lags one tick and the rAF loop can blit a stale canvas
  // in between.
  const depsRef = useRef<ReadonlyArray<unknown>>(deps);
  if (!shallowEqual(depsRef.current, deps)) {
    cacheRef.current = null;
    depsRef.current = deps;
  }

  // Stable callback identity across renders so the consumer's effect
  // dependencies don't churn.
  return useMemo(
    () => (w: number, h: number, dpr: number) => {
      if (w <= 0 || h <= 0) return null;
      const key = `${w}x${h}@${dpr}`;
      if (cacheRef.current?.key !== key) {
        cacheRef.current = {
          key,
          canvas: renderCircuitToCanvas(buildRef.current(w, h, dpr), w, h, dpr),
        };
      }
      return cacheRef.current.canvas;
    },
    [],
  );
}

function shallowEqual(a: ReadonlyArray<unknown>, b: ReadonlyArray<unknown>): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (!Object.is(a[i], b[i])) return false;
  }
  return true;
}
