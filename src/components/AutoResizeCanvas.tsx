import { useEffect, useRef } from 'react';

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
 * The setup callback re-runs every time the canvas is resized;
 * it receives a context with the DPR transform already applied.
 */
export function AutoResizeCanvas({ height, setup, ariaLabel }: AutoResizeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cleanup: void | (() => void);

    function applySizeAndSetup() {
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const target = canvas.parentElement;
      if (!target) return;
      const w = target.clientWidth;
      const h = height;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (typeof cleanup === 'function') cleanup();
      cleanup = setup({ w, h, ctx, dpr, canvas });
    }

    applySizeAndSetup();

    let raf = 0;
    function handleResize() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(applySizeAndSetup);
    }
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(raf);
      if (typeof cleanup === 'function') cleanup();
    };
  }, [height, setup]);

  return (
    <canvas
      ref={canvasRef}
      aria-label={ariaLabel}
      style={{ display: 'block', width: '100%' }}
    />
  );
}
