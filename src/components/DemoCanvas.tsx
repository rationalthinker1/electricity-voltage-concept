import { useRef } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';

export interface DemoCanvasProps<T> {
  /** Display height in CSS pixels */
  height: number;
  /** Ref bridged via useSimState — always current inside the draw loop. */
  stateRef: React.MutableRefObject<T>;
  /** Called every animation frame. Receives canvas info, latest state, dt (s), and accumulated simTime (s). */
  draw: (info: CanvasInfo, state: T, dt: number, simTime: number) => void;
  /** Optional ARIA label */
  ariaLabel?: string;
}

/**
 * Convenience wrapper that combines AutoResizeCanvas with the standard
 * simulation loop (useSimLoop). Use this when a demo is just a canvas
 * plus controls — no custom resize logic or manual rAF needed.
 *
 * Example:
 *
 *   const stateRef = useSimState({ rpm, computed });
 *
 *   <DemoCanvas
 *     height={300}
 *     stateRef={stateRef}
 *     draw={({ ctx, w, h, colors }, state, dt, simT) => {
 *       ctx.fillStyle = colors.bg;
 *       ctx.fillRect(0, 0, w, h);
 *       // …
 *     }}
 *   />
 */
export function DemoCanvas<T>({ height, stateRef, draw, ariaLabel }: DemoCanvasProps<T>) {
  const drawRef = useRef(draw);
  drawRef.current = draw;

  return (
    <AutoResizeCanvas
      height={height}
      ariaLabel={ariaLabel}
      setup={(info) => {
        let raf = 0;
        let simTime = 0;
        let lastT = performance.now();

        function tick(now: number) {
          let dt = (now - lastT) / 1000;
          lastT = now;
          if (dt > 0.1) dt = 0.1;
          simTime += dt;
          drawRef.current(info, stateRef.current, dt, simTime);
          raf = requestAnimationFrame(tick);
        }

        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
      }}
    />
  );
}
