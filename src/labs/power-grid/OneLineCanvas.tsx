/**
 * One-line-diagram canvas editor for the Power Grid Simulator.
 *
 * Owns all pointer interaction with the grid:
 *   - drop a new bus when palette-armed with a bus tool
 *   - draw a transmission line by clicking bus → bus when palette is 'line'
 *   - drop a transformer between two buses when armed with 'transformer'
 *   - attach a generator or load to a bus when armed with those kinds
 *   - click a bus / line / transformer / generator / load to select
 *   - right-click a generator to trip / restore it
 *   - drag a bus to reposition
 *
 * Rendering is on the same <canvas> as the other sandbox labs. The
 * component tree is React for state.
 */

import { useCallback, useEffect, useRef } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';

import type {
  ArmedTool,
  Bus,
  Generator,
  GridDoc,
  Line,
  Load,
  Selection,
  Transformer,
  SystemSnapshot,
} from './types';

/** Pixels per grid cell. Buses snap to integer multiples of this. */
export const GRID_PX = 20;
/** Bus rendering radius in pixels. */
const BUS_R = 9;
const CANVAS_HEIGHT = 480;

interface Props {
  doc: GridDoc;
  selection: Selection | null;
  armed: ArmedTool;
  snapshot: SystemSnapshot | null;

  onSelect: (s: Selection | null) => void;
  onPlaceBus: (x: number, y: number, kv: Bus['kv']) => void;
  onMoveBus: (busId: string, x: number, y: number) => void;
  onPlaceLine: (fromBusId: string, toBusId: string) => void;
  onPlaceTransformer: (fromBusId: string, toBusId: string) => void;
  onAttachGenerator: (busId: string, kind: Generator['kind']) => void;
  onAttachLoad: (busId: string, kind: Load['kind']) => void;
  onTripGenerator: (busId: string, genId: string) => void;
}

interface UIState {
  hoverBusId: string | null;
  hoverGenId: string | null;
  hoverGenBusId: string | null;
  hoverLoadId: string | null;
  hoverLoadBusId: string | null;
  hoverLineId: string | null;
  hoverTxId: string | null;
  /** First-click anchor when drawing a line or transformer. */
  anchorBusId: string | null;
  ghost: { x: number; y: number } | null;
  dragBusId: string | null;
}

export function OneLineCanvas(props: Props) {
  const propsRef = useRef(props);
  useEffect(() => { propsRef.current = props; }, [props]);

  const uiRef = useRef<UIState>({
    hoverBusId: null,
    hoverGenId: null,
    hoverGenBusId: null,
    hoverLoadId: null,
    hoverLoadBusId: null,
    hoverLineId: null,
    hoverTxId: null,
    anchorBusId: null,
    ghost: null,
    dragBusId: null,
  });

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, canvas } = info;
    let raf = 0;

    function getMouse(e: MouseEvent | TouchEvent): [number, number] {
      const r = canvas.getBoundingClientRect();
      const t = 'touches' in e
        ? (e.touches[0] || (e as TouchEvent).changedTouches?.[0])
        : e;
      if (!t) return [-1, -1];
      return [t.clientX - r.left, t.clientY - r.top];
    }
    function gridFromMouse(mx: number, my: number): { x: number; y: number } {
      return {
        x: Math.round(mx / GRID_PX),
        y: Math.round(my / GRID_PX),
      };
    }
    function busAt(mx: number, my: number): Bus | null {
      const d = propsRef.current.doc;
      for (let i = d.buses.length - 1; i >= 0; i--) {
        const b = d.buses[i];
        const dx = mx - b.x * GRID_PX;
        const dy = my - b.y * GRID_PX;
        if (dx * dx + dy * dy < (BUS_R + 4) * (BUS_R + 4)) return b;
      }
      return null;
    }
    function generatorAt(mx: number, my: number): { bus: Bus; gen: Generator } | null {
      // Generators draw above the bus in a stack; pick by approximate bounds.
      const d = propsRef.current.doc;
      for (const b of d.buses) {
        const cx = b.x * GRID_PX;
        const cy = b.y * GRID_PX;
        for (let gi = 0; gi < b.generators.length; gi++) {
          const g = b.generators[gi];
          const ox = cx - 36 + gi * 18;
          const oy = cy - 32;
          if (mx >= ox - 8 && mx <= ox + 8 && my >= oy - 8 && my <= oy + 8) {
            return { bus: b, gen: g };
          }
        }
      }
      return null;
    }
    function loadAt(mx: number, my: number): { bus: Bus; load: Load } | null {
      const d = propsRef.current.doc;
      for (const b of d.buses) {
        const cx = b.x * GRID_PX;
        const cy = b.y * GRID_PX;
        for (let li = 0; li < b.loads.length; li++) {
          const ld = b.loads[li];
          const ox = cx - 36 + li * 18;
          const oy = cy + 32;
          if (mx >= ox - 8 && mx <= ox + 8 && my >= oy - 8 && my <= oy + 8) {
            return { bus: b, load: ld };
          }
        }
      }
      return null;
    }
    function lineAt(mx: number, my: number): Line | null {
      const d = propsRef.current.doc;
      for (let i = d.lines.length - 1; i >= 0; i--) {
        const ln = d.lines[i];
        const a = d.buses.find((b) => b.id === ln.fromBusId);
        const c = d.buses.find((b) => b.id === ln.toBusId);
        if (!a || !c) continue;
        const dist = distToSeg(mx, my, a.x * GRID_PX, a.y * GRID_PX, c.x * GRID_PX, c.y * GRID_PX);
        if (dist < 7) return ln;
      }
      return null;
    }
    function transformerAt(mx: number, my: number): Transformer | null {
      const d = propsRef.current.doc;
      for (let i = d.transformers.length - 1; i >= 0; i--) {
        const tx = d.transformers[i];
        const a = d.buses.find((b) => b.id === tx.fromBusId);
        const c = d.buses.find((b) => b.id === tx.toBusId);
        if (!a || !c) continue;
        const dist = distToSeg(mx, my, a.x * GRID_PX, a.y * GRID_PX, c.x * GRID_PX, c.y * GRID_PX);
        if (dist < 7) return tx;
      }
      return null;
    }

    function onMouseMove(e: MouseEvent) {
      const [mx, my] = getMouse(e);
      const ui = uiRef.current;
      const armed = propsRef.current.armed;
      ui.ghost = gridFromMouse(mx, my);

      if (ui.dragBusId) {
        const g = gridFromMouse(mx, my);
        propsRef.current.onMoveBus(ui.dragBusId, g.x, g.y);
        return;
      }

      ui.hoverBusId = null;
      ui.hoverGenId = null;
      ui.hoverGenBusId = null;
      ui.hoverLoadId = null;
      ui.hoverLoadBusId = null;
      ui.hoverLineId = null;
      ui.hoverTxId = null;

      // Order: gen / load hit precedes bus (they overlap visually).
      const gen = generatorAt(mx, my);
      if (gen) {
        ui.hoverGenId = gen.gen.id;
        ui.hoverGenBusId = gen.bus.id;
        canvas.style.cursor = 'pointer';
        return;
      }
      const ld = loadAt(mx, my);
      if (ld) {
        ui.hoverLoadId = ld.load.id;
        ui.hoverLoadBusId = ld.bus.id;
        canvas.style.cursor = 'pointer';
        return;
      }
      const b = busAt(mx, my);
      if (b) {
        ui.hoverBusId = b.id;
        canvas.style.cursor = armed.kind === 'line' || armed.kind === 'transformer'
          ? 'crosshair' : 'pointer';
        return;
      }
      const lp = lineAt(mx, my);
      if (lp) {
        ui.hoverLineId = lp.id;
        canvas.style.cursor = 'pointer';
        return;
      }
      const tx = transformerAt(mx, my);
      if (tx) {
        ui.hoverTxId = tx.id;
        canvas.style.cursor = 'pointer';
        return;
      }
      canvas.style.cursor = armed.kind === 'select' ? 'default' : 'crosshair';
    }

    function onMouseDown(e: MouseEvent) {
      // Right-click → trip a generator if hovered.
      if (e.button === 2) {
        e.preventDefault();
        const [mx, my] = getMouse(e);
        const gen = generatorAt(mx, my);
        if (gen) propsRef.current.onTripGenerator(gen.bus.id, gen.gen.id);
        return;
      }

      const [mx, my] = getMouse(e);
      const ui = uiRef.current;
      const armed = propsRef.current.armed;

      if (armed.kind === 'bus') {
        const g = gridFromMouse(mx, my);
        propsRef.current.onPlaceBus(g.x, g.y, armed.kv);
        return;
      }
      if (armed.kind === 'line' || armed.kind === 'transformer') {
        const b = busAt(mx, my);
        if (!b) return;
        if (!ui.anchorBusId) {
          ui.anchorBusId = b.id;
        } else if (ui.anchorBusId !== b.id) {
          if (armed.kind === 'line') propsRef.current.onPlaceLine(ui.anchorBusId, b.id);
          else propsRef.current.onPlaceTransformer(ui.anchorBusId, b.id);
          ui.anchorBusId = null;
        }
        return;
      }
      if (armed.kind === 'generator') {
        const b = busAt(mx, my);
        if (b) propsRef.current.onAttachGenerator(b.id, armed.genKind);
        return;
      }
      if (armed.kind === 'load') {
        const b = busAt(mx, my);
        if (b) propsRef.current.onAttachLoad(b.id, armed.loadKind);
        return;
      }

      // Select mode.
      const gen = generatorAt(mx, my);
      if (gen) {
        propsRef.current.onSelect({ kind: 'generator', id: gen.gen.id, parentBusId: gen.bus.id });
        return;
      }
      const ld = loadAt(mx, my);
      if (ld) {
        propsRef.current.onSelect({ kind: 'load', id: ld.load.id, parentBusId: ld.bus.id });
        return;
      }
      const b = busAt(mx, my);
      if (b) {
        propsRef.current.onSelect({ kind: 'bus', id: b.id });
        ui.dragBusId = b.id;
        return;
      }
      const lp = lineAt(mx, my);
      if (lp) {
        propsRef.current.onSelect({ kind: 'line', id: lp.id });
        return;
      }
      const tx = transformerAt(mx, my);
      if (tx) {
        propsRef.current.onSelect({ kind: 'transformer', id: tx.id });
        return;
      }
      propsRef.current.onSelect(null);
    }

    function onMouseUp() {
      uiRef.current.dragBusId = null;
    }

    function onContextMenu(e: MouseEvent) {
      e.preventDefault();
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        uiRef.current.anchorBusId = null;
        propsRef.current.onSelect(null);
      }
    }

    function onTouchStart(e: TouchEvent) {
      e.preventDefault();
      onMouseDown({
        clientX: e.touches[0].clientX,
        clientY: e.touches[0].clientY,
        button: 0,
        preventDefault: () => undefined,
      } as unknown as MouseEvent);
    }
    function onTouchMove(e: TouchEvent) {
      e.preventDefault();
      onMouseMove({
        clientX: e.touches[0].clientX,
        clientY: e.touches[0].clientY,
      } as MouseEvent);
    }
    function onTouchEnd() { onMouseUp(); }

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('contextmenu', onContextMenu);
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);
    window.addEventListener('keydown', onKeyDown);

    function draw() {
      const p = propsRef.current;
      const ui = uiRef.current;

      ctx.fillStyle = '#0d0d10';
      ctx.fillRect(0, 0, w, h);

      // Grid.
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += GRID_PX) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y < h; y += GRID_PX) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      for (let x = 0; x < w; x += GRID_PX) {
        for (let y = 0; y < h; y += GRID_PX) {
          ctx.fillRect(x - 0.5, y - 0.5, 1, 1);
        }
      }

      // Transmission lines.
      for (const ln of p.doc.lines) {
        const a = p.doc.buses.find((b) => b.id === ln.fromBusId);
        const c = p.doc.buses.find((b) => b.id === ln.toBusId);
        if (!a || !c) continue;
        const ax = a.x * GRID_PX, ay = a.y * GRID_PX;
        const bx = c.x * GRID_PX, by = c.y * GRID_PX;
        const flow = p.snapshot?.pf.flowMW.get(ln.id) ?? 0;
        const loadFrac = Math.abs(flow) / Math.max(1, ln.ratingMVA);

        // Color: idle gray → teal at 50 % loaded → pink near 100 %.
        const isSel = p.selection?.kind === 'line' && p.selection.id === ln.id;
        const isHover = ui.hoverLineId === ln.id;
        const stroke = isSel ? '#ff6b2a'
          : isHover ? '#ffb084'
          : loadFrac > 0.9 ? '#ff3b6e'
          : loadFrac > 0.5 ? '#6cc5c2'
          : '#7a7770';
        ctx.strokeStyle = stroke;
        ctx.lineWidth = isSel ? 3 : 2;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();

        // Mid-line label: flow in MW.
        if (p.snapshot) {
          const mx = (ax + bx) / 2;
          const my = (ay + by) / 2;
          const text = Math.abs(flow).toFixed(0) + ' MW';
          ctx.font = '9px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          const tw = ctx.measureText(text).width;
          ctx.fillStyle = 'rgba(13,13,16,0.85)';
          ctx.fillRect(mx - tw / 2 - 3, my - 7, tw + 6, 13);
          ctx.fillStyle = stroke;
          ctx.fillText(text, mx, my + 3);
        }
      }

      // Transformers — drawn as two interlocking circles on a line.
      for (const tx of p.doc.transformers) {
        const a = p.doc.buses.find((b) => b.id === tx.fromBusId);
        const c = p.doc.buses.find((b) => b.id === tx.toBusId);
        if (!a || !c) continue;
        const ax = a.x * GRID_PX, ay = a.y * GRID_PX;
        const bx = c.x * GRID_PX, by = c.y * GRID_PX;
        const isSel = p.selection?.kind === 'transformer' && p.selection.id === tx.id;
        const isHover = ui.hoverTxId === tx.id;
        const stroke = isSel ? '#ff6b2a' : isHover ? '#ffb084' : '#a09e95';
        ctx.strokeStyle = stroke;
        ctx.lineWidth = isSel ? 2.4 : 1.6;
        // Skinny line.
        ctx.beginPath();
        ctx.moveTo(ax, ay); ctx.lineTo(bx, by);
        ctx.stroke();
        // Two coils at the midpoint.
        const mx = (ax + bx) / 2;
        const my = (ay + by) / 2;
        const dxn = (bx - ax);
        const dyn = (by - ay);
        const ll = Math.hypot(dxn, dyn) || 1;
        const ux = dxn / ll;
        const uy = dyn / ll;
        ctx.fillStyle = '#0d0d10';
        ctx.beginPath();
        ctx.arc(mx - ux * 6, my - uy * 6, 6, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        ctx.beginPath();
        ctx.arc(mx + ux * 6, my + uy * 6, 6, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        // Rating label.
        ctx.fillStyle = '#7a7770';
        ctx.font = '8px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(tx.ratingMVA + ' MVA', mx, my + 18);
      }

      // Buses.
      for (const b of p.doc.buses) {
        const cx = b.x * GRID_PX;
        const cy = b.y * GRID_PX;
        const isSel = p.selection?.kind === 'bus' && p.selection.id === b.id;
        const isHover = ui.hoverBusId === b.id;
        const v = p.snapshot?.pf.voltage.get(b.id) ?? 1.0;
        // Bar style: short horizontal bar like a real one-line.
        const half = 12;
        ctx.strokeStyle = isSel ? '#ff6b2a' : isHover ? '#ffb084' : '#ecebe5';
        ctx.lineWidth = isSel ? 3 : 2.2;
        ctx.beginPath();
        ctx.moveTo(cx - half, cy);
        ctx.lineTo(cx + half, cy);
        ctx.stroke();

        // Voltage chip beside the bus.
        if (p.snapshot) {
          ctx.font = '8px "JetBrains Mono", monospace';
          ctx.textAlign = 'left';
          const vColor = v < 0.95 ? '#ff3b6e' : v > 1.05 ? '#ff3b6e' : '#6cc5c2';
          ctx.fillStyle = vColor;
          ctx.fillText(v.toFixed(3) + ' pu', cx + half + 4, cy + 3);
        }
        // Label below.
        if (b.label) {
          ctx.fillStyle = '#a09e95';
          ctx.font = '9px "DM Sans", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(b.label + '  ·  ' + b.kv + ' kV', cx, cy + 60);
        }

        // Generators above the bus.
        for (let gi = 0; gi < b.generators.length; gi++) {
          const g = b.generators[gi];
          const ox = cx - 36 + gi * 18;
          const oy = cy - 32;
          drawGenerator(ctx, ox, oy, g,
            ui.hoverGenId === g.id,
            p.selection?.kind === 'generator' && p.selection.id === g.id);
          // Tie line from gen to bus.
          ctx.strokeStyle = g.tripped ? '#5b5953' : '#a09e95';
          ctx.lineWidth = 1;
          ctx.setLineDash(g.tripped ? [3, 3] : []);
          ctx.beginPath(); ctx.moveTo(ox, oy + 7); ctx.lineTo(ox, cy); ctx.stroke();
          ctx.setLineDash([]);
        }

        // Loads below the bus.
        for (let li = 0; li < b.loads.length; li++) {
          const ld = b.loads[li];
          const ox = cx - 36 + li * 18;
          const oy = cy + 32;
          drawLoad(ctx, ox, oy, ld,
            ui.hoverLoadId === ld.id,
            p.selection?.kind === 'load' && p.selection.id === ld.id);
          ctx.strokeStyle = '#a09e95';
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(ox, oy - 7); ctx.lineTo(ox, cy); ctx.stroke();
        }
      }

      // Anchor preview when drawing a line / transformer.
      if ((p.armed.kind === 'line' || p.armed.kind === 'transformer') && ui.anchorBusId) {
        const a = p.doc.buses.find((b) => b.id === ui.anchorBusId);
        if (a && ui.ghost) {
          ctx.strokeStyle = '#6cc5c2';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(a.x * GRID_PX, a.y * GRID_PX);
          ctx.lineTo(ui.ghost.x * GRID_PX, ui.ghost.y * GRID_PX);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = '#6cc5c2';
          ctx.beginPath();
          ctx.arc(a.x * GRID_PX, a.y * GRID_PX, 5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Ghost when armed with bus / generator / load.
      if (p.armed.kind === 'bus' && ui.ghost) {
        const gx = ui.ghost.x * GRID_PX;
        const gy = ui.ghost.y * GRID_PX;
        ctx.strokeStyle = 'rgba(255,107,42,0.5)';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(gx - 12, gy);
        ctx.lineTo(gx + 12, gy);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('contextmenu', onContextMenu);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  return <AutoResizeCanvas height={CANVAS_HEIGHT} setup={setup} ariaLabel="Power-grid one-line diagram" />;
}

/* ─────────────────────────── Helpers ─────────────────────────── */

function distToSeg(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax, dy = by - ay;
  const l2 = dx * dx + dy * dy;
  if (l2 === 0) return Math.hypot(px - ax, py - ay);
  let t = ((px - ax) * dx + (py - ay) * dy) / l2;
  t = Math.max(0, Math.min(1, t));
  const x = ax + t * dx, y = ay + t * dy;
  return Math.hypot(px - x, py - y);
}

function drawGenerator(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, g: Generator,
  hover: boolean, selected: boolean,
) {
  const colorByKind: Record<Generator['kind'], string> = {
    coal:    '#a09e95',
    ccgt:    '#ff6b2a',
    hydro:   '#5baef8',
    wind:    '#6cc5c2',
    solar:   '#ff6b2a',
    battery: '#ff3b6e',
  };
  const labelByKind: Record<Generator['kind'], string> = {
    coal:    'C',
    ccgt:    'G',
    hydro:   'H',
    wind:    'W',
    solar:   'S',
    battery: 'B',
  };
  const c = g.tripped ? '#5b5953' : colorByKind[g.kind];
  ctx.fillStyle = '#0d0d10';
  ctx.strokeStyle = selected ? '#ff6b2a' : hover ? '#ffb084' : c;
  ctx.lineWidth = selected ? 2.2 : hover ? 1.6 : 1.3;
  ctx.beginPath();
  ctx.arc(cx, cy, 7, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = g.tripped ? '#5b5953' : c;
  ctx.font = 'bold 9px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(labelByKind[g.kind], cx, cy + 0.5);
  ctx.textBaseline = 'alphabetic';
  if (g.tripped) {
    // X over the circle.
    ctx.strokeStyle = '#ff3b6e';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(cx - 6, cy - 6); ctx.lineTo(cx + 6, cy + 6);
    ctx.moveTo(cx + 6, cy - 6); ctx.lineTo(cx - 6, cy + 6);
    ctx.stroke();
  }
}

function drawLoad(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, ld: Load,
  hover: boolean, selected: boolean,
) {
  const labels: Record<Load['kind'], string> = {
    residential: 'R',
    industrial: 'I',
    motor:      'M',
    ev:         'E',
  };
  ctx.fillStyle = '#0d0d10';
  ctx.strokeStyle = selected ? '#ff6b2a' : hover ? '#ffb084' : '#a09e95';
  ctx.lineWidth = selected ? 2.2 : hover ? 1.6 : 1.3;
  // Downward-pointing triangle.
  ctx.beginPath();
  ctx.moveTo(cx - 7, cy - 6);
  ctx.lineTo(cx + 7, cy - 6);
  ctx.lineTo(cx, cy + 7);
  ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = selected ? '#ff6b2a' : '#a09e95';
  ctx.font = 'bold 8px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(labels[ld.kind], cx, cy - 0.5);
}
