import { useEffect, useMemo, useRef } from 'react';

export interface LayeredCanvasInfo<LayerName extends string = string> {
  /** CSS width in pixels */
  w: number;
  /** CSS height in pixels */
  h: number;
  /** Device pixel ratio in use */
  dpr: number;
  /** Canvas elements keyed by layer name. */
  canvases: Record<LayerName, HTMLCanvasElement>;
  /** 2D rendering contexts keyed by layer name, with DPR scale applied. */
  contexts: Record<LayerName, CanvasRenderingContext2D>;
  /** Top-most canvas, useful for pointer events. */
  canvas: HTMLCanvasElement;
}

export interface LayeredCanvasProps<LayerName extends string = string> {
  /** Display height in CSS pixels */
  height: number;
  /** Layer names from back to front. The last layer receives pointer events. */
  layers: readonly LayerName[];
  /**
   * Setup callback. Called once on mount and whenever the canvas stack resizes.
   * Return an optional cleanup function (for cancelling rAF, removing listeners, etc.)
   */
  setup: (info: LayeredCanvasInfo<LayerName>) => void | (() => void);
  /** Optional ARIA label for the top canvas */
  ariaLabel?: string;
}

/**
 * Stacked canvases that share one responsive stage.
 *
 * Use this when expensive/static pixels can live on a background layer while
 * animated or interactive overlays repaint independently on upper layers.
 */
export function LayeredCanvas<LayerName extends string = string>({
  height,
  layers,
  setup,
  ariaLabel,
}: LayeredCanvasProps<LayerName>) {
  const canvasRefs = useRef(new Map<LayerName, HTMLCanvasElement>());
  const setupRef = useRef(setup);
  const rerunRef = useRef<null | (() => void)>(null);
  const layerSignature = layers.join('\u0000');
  const layerList = useMemo(() => [...layers], [layerSignature]);

  useEffect(() => {
    setupRef.current = setup;
    rerunRef.current?.();
  }, [setup]);

  useEffect(() => {
    const canvases = layerList
      .map(layer => [layer, canvasRefs.current.get(layer)] as const)
      .filter((entry): entry is readonly [LayerName, HTMLCanvasElement] => Boolean(entry[1]));
    if (canvases.length !== layerList.length) return;

    const topCanvas = canvases[canvases.length - 1]?.[1];
    if (!topCanvas) return;

    let cleanup: void | (() => void);
    let visible = false;
    let pageVisible = document.visibilityState === 'visible';
    let raf = 0;
    const target = topCanvas.parentElement;

    function stop() {
      if (typeof cleanup === 'function') cleanup();
      cleanup = undefined;
    }

    function applySizeAndSetup() {
      if (!visible || !pageVisible) return;
      if (!target) return;
      const w = target.clientWidth;
      if (w <= 0) return;
      const h = height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const contexts = {} as Record<LayerName, CanvasRenderingContext2D>;
      const canvasRecord = {} as Record<LayerName, HTMLCanvasElement>;

      for (const [layer, canvas] of canvases) {
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        contexts[layer] = ctx;
        canvasRecord[layer] = canvas;
      }

      stop();
      cleanup = setupRef.current({
        w,
        h,
        dpr,
        canvases: canvasRecord,
        contexts,
        canvas: topCanvas,
      });
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
        entries => setRunning(entries.some(entry => entry.isIntersecting)),
        { rootMargin: '320px 0px' },
      );
      intersectionObserver.observe(topCanvas);
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
  }, [height, layerList]);

  const topLayer = layerList[layerList.length - 1];

  return (
    <div style={{ height, position: 'relative', width: '100%' }}>
      {layerList.map(layer => (
        <canvas className="block w-full"
          key={layer}
          ref={(node) => {
            if (node) canvasRefs.current.set(layer, node);
            else canvasRefs.current.delete(layer);
          }}
          aria-hidden={layer !== topLayer}
          aria-label={layer === topLayer ? ariaLabel : undefined}
          style={{
            display: 'block',
            height: '100%',
            inset: 0,
            pointerEvents: layer === topLayer ? 'auto' : 'none',
            position: 'absolute',
            width: '100%',
          }}
        />
      ))}
    </div>
  );
}
