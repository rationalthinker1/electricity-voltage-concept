/**
 * Memoised offscreen-canvas cache for arbitrary static draw blocks.
 *
 * Why this exists
 * ────────────────
 * Sibling to `useCircuitCache`, which only handles `CircuitSpec` bakes.
 * Some demos pre-render a static layer that isn't a circuit diagram —
 * a bar chart with text labels, a pill-shaped wire with radial-gradient
 * polarity terminals, a bulb-glow halo + filament squiggle. For those
 * the bake is arbitrary `ctx2d` drawing, so this hook hands the user
 * the offscreen context and the dimensions and lets them draw whatever
 * they like.
 *
 *   const getStatic = useCanvasCache(
 *     (octx, w, h, _dpr) => {
 *       octx.fillStyle = colors.accent;
 *       octx.fillRect(0, 0, 80, h);
 *       octx.fillText('P_in', 40, 12);
 *       // …
 *     },
 *     [regulating],
 *   );
 *
 *   const setup = useSimLoop(stateRef, ({ ctx, w, h, dpr }) => {
 *     const off = getStatic(w, h, dpr);
 *     if (off) ctx.drawImage(off, 0, 0, w, h);
 *     // …per-frame overlay…
 *   }, []);
 *
 * The cache rebuilds whenever `(w, h, dpr)` or any value in `deps`
 * changes (referential, like `useMemo`). The offscreen canvas is
 * allocated at backing-store size (w·dpr × h·dpr) and the supplied
 * context has its DPR transform already applied, so draw in CSS pixels.
 */

import { useMemo, useRef } from 'react';

/** Draw the static layer. Receives a DPR-prepped offscreen context. */
export type CanvasCacheBuilder = (
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  dpr: number,
) => void;

/**
 * Returns a stable getter to call inside the draw loop. The getter rebuilds
 * the offscreen canvas whenever (w, h, dpr) or any entry in `deps` changes;
 * otherwise it returns the cached canvas in O(1).
 *
 * Optional `frameKey` argument
 * ────────────────────────────
 * For caches whose validity depends on a value that's mutated inside the
 * rAF loop (NOT React state) — typically an orbit-camera angle quantized
 * to coarse buckets — pass a stringly-typed extra key on each call:
 *
 *   getStatic(w, h, dpr, `y${yawQ}|p${pitQ}`);
 *
 * The bake re-runs whenever that string changes. Use sparingly: the only
 * legitimate case is when the cache invariant truly lives outside React.
 * For React-derivable invariants prefer `deps`, which is checked once per
 * render instead of once per tick.
 */
export function useCanvasCache(
  draw: CanvasCacheBuilder,
  deps: ReadonlyArray<unknown>,
): (w: number, h: number, dpr: number, frameKey?: string) => HTMLCanvasElement | null {
  const cacheRef = useRef<{ key: string; canvas: HTMLCanvasElement } | null>(null);
  const drawRef = useRef(draw);
  drawRef.current = draw;

  // Track deps in a ref and invalidate synchronously each render when they
  // change. See useCircuitCache for the rationale — a useEffect-based
  // invalidation lags one tick and the rAF loop can blit a stale canvas
  // in between.
  const depsRef = useRef<ReadonlyArray<unknown>>(deps);
  if (!shallowEqual(depsRef.current, deps)) {
    cacheRef.current = null;
    depsRef.current = deps;
  }

  return useMemo(
    () => (w: number, h: number, dpr: number, frameKey?: string) => {
      if (w <= 0 || h <= 0) return null;
      const key = frameKey ? `${w}x${h}@${dpr}|${frameKey}` : `${w}x${h}@${dpr}`;
      if (cacheRef.current?.key !== key) {
        const off = document.createElement('canvas');
        off.width = Math.max(1, Math.floor(w * dpr));
        off.height = Math.max(1, Math.floor(h * dpr));
        const octx = off.getContext('2d');
        if (octx) {
          octx.setTransform(dpr, 0, 0, dpr, 0, 0);
          drawRef.current(octx, w, h, dpr);
        }
        cacheRef.current = { key, canvas: off };
      }
      return cacheRef.current.canvas;
    },
    [],
  );
}

function shallowEqual(
  a: ReadonlyArray<unknown>,
  b: ReadonlyArray<unknown>,
): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (!Object.is(a[i], b[i])) return false;
  }
  return true;
}
