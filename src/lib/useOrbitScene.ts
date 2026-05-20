import { useRef } from 'react';

import { attachOrbit, depthSortIndices, project, type OrbitCamera, type Vec3 } from './projection3d';

export interface OrbitScene {
  /** The live camera object. Mutated by attachOrbit and read by your draw loop. */
  cam: OrbitCamera;
  /** Call this inside your AutoResizeCanvas cleanup to remove drag listeners. */
  dispose: () => void;
  /** Painter-sort items by depth (back to front). */
  depthSort: <T extends { anchor: Vec3 }>(items: T[], w: number, h: number) => number[];
  /** Project a single point through the camera. */
  projectPoint: (p: Vec3, w: number, h: number) => { x: number; y: number; depth: number };
}

/**
 * Initialise a 3D orbit scene inside an AutoResizeCanvas setup callback.
 *
 * This bundles the three pieces every 3D demo repeats:
 *   1. Create an OrbitCamera with sensible defaults
 *   2. Wire attachOrbit for drag-to-rotate
 *   3. Expose depthSort + project helpers
 *
 * Usage:
 *
 *   const setup = useSimLoop(stateRef, ({ ctx, w, h, canvas }, state, dt, simT) => {
 *     // Initialise once per setup invocation (AutoResizeCanvas re-runs on resize)
 *     const scene = createOrbitScene(canvas);
 *
 *     ctx.fillStyle = colors.bg;
 *     ctx.fillRect(0, 0, w, h);
 *
 *     const order = scene.depthSort(arrows, w, h);
 *     for (const idx of order) { … }
 *
 *     // Cleanup is handled automatically by useSimLoop's return.
 *   }, deps);
 *
 * If you need the camera outside the draw function (e.g. for initial
 * orientation), create the scene in a ref:
 *
 *   const sceneRef = useRef<OrbitScene | null>(null);
 *   const setup = useCallback((info) => {
 *     sceneRef.current = createOrbitScene(info.canvas, { distance: 6 });
 *     // …rAF loop reads sceneRef.current.cam …
 *     return () => { sceneRef.current?.dispose(); };
 *   }, []);
 */
export function createOrbitScene(
  canvas: HTMLCanvasElement,
  overrides: Partial<OrbitCamera> = {},
): OrbitScene {
  const cam: OrbitCamera = {
    yaw: overrides.yaw ?? 0.55,
    pitch: overrides.pitch ?? 0.28,
    distance: overrides.distance ?? 7.5,
    fov: overrides.fov ?? Math.PI / 4,
  };

  const dispose = attachOrbit(canvas, cam);

  return {
    cam,
    dispose,
    depthSort: (items, w, h) => depthSortIndices(items, cam, w, h),
    projectPoint: (p, w, h) => project(p, cam, w, h),
  };
}

/**
 * React hook version for demos that need the camera object at render time
 * (e.g. to set up derived geometry before the canvas setup runs).
 *
 * Returns a stable ref and an attach function meant to be called inside
 * AutoResizeCanvas.setup:
 *
 *   const orbit = useOrbitScene({ distance: 6 });
 *   const setup = useCallback((info) => {
 *     const dispose = orbit.attach(info.canvas);
 *     // … draw loop reads orbit.camRef.current …
 *     return () => dispose();
 *   }, [orbit]);
 */
export function useOrbitScene(initial: Partial<OrbitCamera> = {}) {
  const camRef = useRef<OrbitCamera>({
    yaw: initial.yaw ?? 0.55,
    pitch: initial.pitch ?? 0.28,
    distance: initial.distance ?? 7.5,
    fov: initial.fov ?? Math.PI / 4,
  });

  const attach = (canvas: HTMLCanvasElement) => {
    return attachOrbit(canvas, camRef.current);
  };

  const depthSort = <T extends { anchor: Vec3 }>(items: T[], w: number, h: number) =>
    depthSortIndices(items, camRef.current, w, h);

  const projectPoint = (p: Vec3, w: number, h: number) => project(p, camRef.current, w, h);

  return { camRef, attach, depthSort, projectPoint };
}
