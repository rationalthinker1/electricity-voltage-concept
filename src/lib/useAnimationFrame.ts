import { useEffect, useRef } from 'react';

/**
 * Run a callback once per animation frame. The callback receives the
 * current dt (ms since previous frame, capped at 60ms to avoid huge
 * jumps after a tab switch) and the elapsed time since first frame.
 *
 * Use this for any continuously-animated canvas viz.
 */
export function useAnimationFrame(
  callback: (dt: number, elapsed: number) => void,
  enabled = true,
) {
  const cbRef = useRef(callback);
  cbRef.current = callback;

  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    let last = performance.now();
    let start = last;
    function tick(now: number) {
      const dt = Math.min(60, now - last);
      last = now;
      cbRef.current(dt, now - start);
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [enabled]);
}
