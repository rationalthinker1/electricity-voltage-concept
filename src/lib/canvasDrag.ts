/**
 * Reusable mouse + touch drag handler for canvas-based demos.
 *
 * Handles the boilerplate that appears in almost every draggable demo:
 *   - normalised (x, y) relative to the canvas
 *   - mousedown / mousemove / mouseup (window-scoped for up)
 *   - touchstart / touchmove / touchend with preventDefault
 *   - cursor management
 *
 * The caller supplies three callbacks. `onDown` receives the initial click
 * point; if it returns `false` the drag is ignored. `onMove` fires while
 * dragging. `onUp` fires on release.
 */

export interface CanvasDragHandlers {
  /** Called on mouse/touch down. Return `false` to reject this drag. */
  onDown?: (x: number, y: number) => boolean | void;
  /** Called on every move while a drag is active. */
  onMove?: (x: number, y: number) => void;
  /** Called when the drag ends (mouse up or touch end). */
  onUp?: () => void;
}

/**
 * Attach unified mouse + touch drag handlers to a canvas.
 * Returns a cleanup function that removes all listeners and resets cursor.
 */
export function attachCanvasDrag(
  canvas: HTMLCanvasElement,
  handlers: CanvasDragHandlers,
): () => void {
  let dragging = false;

  function getPoint(e: MouseEvent | TouchEvent): [number, number] {
    const r = canvas.getBoundingClientRect();
    const t = 'touches' in e ? e.touches[0] : e;
    if (!t) return [0, 0];
    return [t.clientX - r.left, t.clientY - r.top];
  }

  function onMouseDown(e: MouseEvent) {
    const [x, y] = getPoint(e);
    const accepted = handlers.onDown?.(x, y);
    if (accepted !== false) {
      dragging = true;
      canvas.style.cursor = 'grabbing';
    }
  }

  function onMouseMove(e: MouseEvent) {
    if (!dragging) return;
    const [x, y] = getPoint(e);
    handlers.onMove?.(x, y);
  }

  function onMouseUp() {
    if (!dragging) return;
    dragging = false;
    canvas.style.cursor = 'grab';
    handlers.onUp?.();
  }

  function onTouchStart(e: TouchEvent) {
    if (e.touches.length === 0) return;
    const [x, y] = getPoint(e);
    const accepted = handlers.onDown?.(x, y);
    if (accepted !== false) {
      e.preventDefault();
      dragging = true;
    }
  }

  function onTouchMove(e: TouchEvent) {
    if (!dragging) return;
    e.preventDefault();
    const [x, y] = getPoint(e);
    handlers.onMove?.(x, y);
  }

  function onTouchEnd() {
    if (!dragging) return;
    dragging = false;
    handlers.onUp?.();
  }

  canvas.style.cursor = 'grab';
  canvas.style.touchAction = 'none';
  canvas.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
  canvas.addEventListener('touchstart', onTouchStart, { passive: false });
  canvas.addEventListener('touchmove', onTouchMove, { passive: false });
  canvas.addEventListener('touchend', onTouchEnd);

  return () => {
    canvas.removeEventListener('mousedown', onMouseDown);
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
    canvas.removeEventListener('touchstart', onTouchStart);
    canvas.removeEventListener('touchmove', onTouchMove);
    canvas.removeEventListener('touchend', onTouchEnd);
    canvas.style.cursor = '';
    canvas.style.touchAction = '';
  };
}
