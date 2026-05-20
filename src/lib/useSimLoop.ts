import { useCallback, useRef } from 'react';

import type { CanvasInfo } from '@/components/AutoResizeCanvas';

export interface SimLoopInitFn<C> {
  (info: CanvasInfo): { context: C; cleanup: () => void };
}

export interface SimLoopDrawFn<T, C = void> {
  (info: CanvasInfo, state: T, dt: number, simTime: number, context: C): void;
}

/**
 * Returns an AutoResizeCanvas-compatible `setup` callback that runs a
 * simulation loop with capped dt and accumulated sim time.
 *
 * This replaces the rAF boilerplate repeated in almost every demo:
 *
 *   let raf = 0;
 *   let simT = 0;
 *   let lastT = performance.now();
 *   function draw() {
 *     const now = performance.now();
 *     let dt = (now - lastT) / 1000;
 *     lastT = now;
 *     if (dt > 0.1) dt = 0.1;
 *     simT += dt;
 *     // ... draw ...
 *     raf = requestAnimationFrame(draw);
 *   }
 *   raf = requestAnimationFrame(draw);
 *   return () => cancelAnimationFrame(raf);
 *
 * Usage with useSimState:
 *
 *   const stateRef = useSimState({ rpm, computed });
 *   const setup = useSimLoop(stateRef, ({ ctx, w, h, colors }, state, dt, simT) => {
 *     const { rpm } = state;
 *     // draw every frame …
 *   }, []);
 *
 *   <AutoResizeCanvas height={300} setup={setup} />
 *
 * For demos that need one-time initialisation (e.g. 3D orbit scene, event
 * listeners), pass an `init` callback. Its return value becomes the `context`
 * argument to the draw function, and its `cleanup` runs when the loop stops:
 *
 *   const setup = useSimLoop(
 *     stateRef,
 *     ({ ctx, w, h }, state, dt, simT, scene) => {
 *       // draw using scene.cam, scene.depthSort, ...
 *     },
 *     [],
 *     (info) => {
 *       const scene = createOrbitScene(info.canvas);
 *       return { context: scene, cleanup: () => scene.dispose() };
 *     },
 *   );
 */
export function useSimLoop<T>(
  stateRef: React.MutableRefObject<T>,
  draw: (info: CanvasInfo, state: T, dt: number, simTime: number) => void,
  deps: React.DependencyList,
): (info: CanvasInfo) => () => void;

export function useSimLoop<T, C>(
  stateRef: React.MutableRefObject<T>,
  draw: (info: CanvasInfo, state: T, dt: number, simTime: number, context: C) => void,
  deps: React.DependencyList,
  init: SimLoopInitFn<C>,
): (info: CanvasInfo) => () => void;

export function useSimLoop<T, C = void>(
  stateRef: React.MutableRefObject<T>,
  draw: (info: CanvasInfo, state: T, dt: number, simTime: number, context: C) => void,
  deps: React.DependencyList,
  init?: SimLoopInitFn<C>,
): (info: CanvasInfo) => () => void {
  const drawRef = useRef(draw);
  drawRef.current = draw;
  const initRef = useRef(init);
  initRef.current = init;

  return useCallback((info: CanvasInfo) => {
    let raf = 0;
    let simTime = 0;
    let lastT = performance.now();

    let context: C = undefined as C;
    let cleanupInit: (() => void) | undefined;

    if (initRef.current) {
      const result = initRef.current(info);
      context = result.context;
      cleanupInit = result.cleanup;
    }

    function tick(now: number) {
      let dt = (now - lastT) / 1000;
      lastT = now;
      if (dt > 0.1) dt = 0.1;
      simTime += dt;
      drawRef.current(info, stateRef.current, dt, simTime, context);
      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      cleanupInit?.();
    };
    // `deps` is intentionally forwarded so callers control re-creation,
    // exactly like the built-in useMemo/useCallback hooks. stateRef is a
    // stable ref and must NOT be included in deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
