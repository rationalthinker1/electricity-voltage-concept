import { useEffect, useRef } from 'react';
import { getCanvasColors, type ThemeColors } from '@/lib/canvasTheme';

export interface CanvasInfo {
  /** CSS width in pixels */
  w: number;
  /** CSS height in pixels */
  h: number;
  /** 2D rendering context with DPR scale applied. */
  ctx: CanvasRenderingContext2D;
  /** Device pixel ratio in use */
  dpr: number;
  /** The canvas element itself */
  canvas: HTMLCanvasElement;
  /** Theme-aware colors for the current light / dark mode. */
  colors: ThemeColors;
}

export interface AutoResizeCanvasProps {
  /** Display height in CSS pixels */
  height: number;
  /**
   * Setup callback. Called once on mount and whenever the canvas resizes.
   * Return an optional cleanup function (for cancelling rAF, removing listeners, etc.)
   */
  setup: (info: CanvasInfo) => void | (() => void);
  /** Optional ARIA label */
  ariaLabel?: string;
}

/**
 * Canvas that handles devicePixelRatio + window-resize repaint.
 * The setup callback re-runs every time the canvas is resized or resumes;
 * it receives a context with the DPR transform already applied.
 * Animation work is paused while the canvas is away from the viewport.
 */
export function AutoResizeCanvas({ height, setup, ariaLabel }: AutoResizeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const setupRef = useRef(setup);
  const rerunRef = useRef<null | (() => void)>(null);

  useEffect(() => {
    setupRef.current = setup;
    rerunRef.current?.();
  }, [setup]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cleanup: void | (() => void);
    let visible = false;
    let pageVisible = document.visibilityState === 'visible';
    let raf = 0;
    const target = canvas.parentElement;

    function stop() {
      if (typeof cleanup === 'function') cleanup();
      cleanup = undefined;
    }

    function applySizeAndSetup() {
      if (!canvas || !visible || !pageVisible) return;
      if (!target) return;
      const w = target.clientWidth;
      if (w <= 0) return;
      const h = height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stop();
      cleanup = setupRef.current({ w, h, ctx, dpr, canvas, colors: getCanvasColors() });
    }

    function scheduleSetup() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(applySizeAndSetup);
    }
    rerunRef.current = scheduleSetup;

    function setRunning(nextVisible: boolean) {
      visible = nextVisible;
      if (visible && pageVisible) scheduleSetup();
      else stop();
    }

    function handleVisibilityChange() {
      pageVisible = document.visibilityState === 'visible';
      if (pageVisible && visible) scheduleSetup();
      else stop();
    }

    let resizeObserver: ResizeObserver | undefined;
    if (target && 'ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(scheduleSetup);
      resizeObserver.observe(target);
    } else {
      window.addEventListener('resize', scheduleSetup);
    }

    let intersectionObserver: IntersectionObserver | undefined;
    if ('IntersectionObserver' in window) {
      intersectionObserver = new IntersectionObserver(
        (entries) => setRunning(entries.some((entry) => entry.isIntersecting)),
        { rootMargin: '320px 0px' },
      );
      intersectionObserver.observe(canvas);
    } else {
      setRunning(true);
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      window.removeEventListener('resize', scheduleSetup);
      cancelAnimationFrame(raf);
      stop();
      if (rerunRef.current === scheduleSetup) rerunRef.current = null;
    };
  }, [height]);

  return (
    <canvas
      className="block w-full"
      ref={canvasRef}
      aria-label={ariaLabel}
      style={{ display: 'block', width: '100%' }}
    />
  );
}
