/**
 * Schematic canvas editor.
 *
 * Owns all pointer interaction with the grid:
 *   - place new components when palette-armed
 *   - draw wires by clicking pin → pin
 *   - drag a placed component to move it
 *   - click a component to select (for the inspector)
 *   - click a placed probe to delete (palette-armed = 'voltmeter'/'ammeter')
 *
 * Rendering happens entirely on the <canvas> for visual consistency with the
 * rest of the textbook. The component tree is React for state; the canvas
 * is the view.
 *
 * The render loop reads three things off refs (so the closure stays stable):
 *   docRef.current     — current circuit document
 *   solverRef.current  — latest solver result (voltages, currents)
 *   uiRef.current      — UI state (hover, selection, wire-anchor, etc.)
 */

import { useCallback, useEffect, useRef } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';

import { drawComponent, GRID_PX } from './components';
import { getCanvasColors } from '@/lib/canvasTheme';
import { pinCoords, pkey, eng } from './solver';
import type {
  ComponentKind, GridPoint, NodeMap, PlacedComponent, Probe, SolverResult, Wire,
} from './types';

const CANVAS_HEIGHT = 600;

type ArmedTool = ComponentKind | 'wire' | 'voltmeter' | 'ammeter' | null;

interface CanvasEditorProps {
  components: PlacedComponent[];
  wires: Wire[];
  probes: Probe[];
  selectedId: string | null;
  selectedWireId: string | null;
  armed: ArmedTool;

  onPlaceComponent: (kind: ComponentKind, at: GridPoint) => void;
  onPlaceWire: (from: GridPoint, to: GridPoint) => void;
  onSelect: (id: string | null) => void;
  onSelectWire: (id: string | null) => void;
  onMoveComponent: (id: string, to: GridPoint) => void;
  onPlaceVoltProbe: (at: GridPoint) => void;
  onPlaceAmmProbe: (componentId: string) => void;
  onDeleteProbe: (id: string) => void;

  /** Latest solver result for live coloring. */
  solverResult: SolverResult | null;
  /** Node map for resolving voltmeter probe positions to node voltages. */
  nodeMap: NodeMap;
}

interface UIState {
  hoverComponentId: string | null;
  hoverProbeId: string | null;
  hoverPin: GridPoint | null;
  hoverWireId: string | null;
  /** Pin we're currently routing a wire from (after first click). */
  wireAnchor: GridPoint | null;
  /** Mouse position in grid coords for the placement ghost. */
  ghost: GridPoint | null;
  /** Drag state for moving a placed component. */
  dragId: string | null;
  dragOffset: GridPoint | null;
  /** Whether a drag has actually moved (vs just a click). */
  dragMoved: boolean;
}

export function CanvasEditor(props: CanvasEditorProps) {
  // Refs so the canvas draw loop sees current values without re-running setup.
  const propsRef = useRef(props);
  useEffect(() => { propsRef.current = props; }, [props]);

  const uiRef = useRef<UIState>({
    hoverComponentId: null,
    hoverProbeId: null,
    hoverPin: null,
    hoverWireId: null,
    wireAnchor: null,
    ghost: null,
    dragId: null,
    dragOffset: null,
    dragMoved: false,
  });

  // Force a redraw kick whenever React props change (for static state like selection).
  const rerenderKick = useRef(0);
  useEffect(() => { rerenderKick.current++; }, [props]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, canvas } = info;
    let raf = 0;

    function gridFromMouse(mx: number, my: number): GridPoint {
      return {
        x: Math.round(mx / GRID_PX),
        y: Math.round(my / GRID_PX),
      };
    }
    function pxFromGrid(p: GridPoint): { x: number; y: number } {
      return { x: p.x * GRID_PX, y: p.y * GRID_PX };
    }
    function getMouse(e: MouseEvent | TouchEvent): [number, number] {
      const r = canvas.getBoundingClientRect();
      const t = 'touches' in e ? (e.touches[0] || (e as TouchEvent).changedTouches?.[0]) : e;
      if (!t) return [-1, -1];
      return [t.clientX - r.left, t.clientY - r.top];
    }

    function hitTestComponent(mx: number, my: number): PlacedComponent | null {
      const { components } = propsRef.current;
      for (let i = components.length - 1; i >= 0; i--) {
        const c = components[i];
        const [p0g, p1g] = pinCoords(c);
        const p0 = pxFromGrid(p0g);
        const p1 = p1g ? pxFromGrid(p1g) : null;
        if (!p1) {
          // Ground: small square 18×18 around p0.
          if (Math.abs(mx - p0.x) < 14 && my > p0.y - 4 && my < p0.y + 22) return c;
        } else {
          // Distance-to-segment, threshold 14 px.
          const d = distToSeg(mx, my, p0.x, p0.y, p1.x, p1.y);
          if (d < 14) return c;
        }
      }
      return null;
    }

    function hitTestPin(mx: number, my: number): GridPoint | null {
      // Snap to nearest grid intersection within 10 px.
      const g = gridFromMouse(mx, my);
      const px = pxFromGrid(g);
      if (Math.hypot(mx - px.x, my - px.y) < 10) return g;
      return null;
    }

    function hitTestProbe(mx: number, my: number): Probe | null {
      const { probes, components } = propsRef.current;
      for (let i = probes.length - 1; i >= 0; i--) {
        const p = probes[i];
        if (p.kind === 'voltmeter' && p.at) {
          const pp = pxFromGrid(p.at);
          if (Math.hypot(mx - pp.x - 14, my - pp.y - 14) < 10) return p;
        } else if (p.kind === 'ammeter' && p.componentId) {
          const c = components.find(cc => cc.id === p.componentId);
          if (!c) continue;
          const [p0g, p1g] = pinCoords(c);
          if (!p1g) continue;
          const mid = {
            x: (p0g.x + p1g.x) * GRID_PX / 2,
            y: (p0g.y + p1g.y) * GRID_PX / 2,
          };
          if (Math.hypot(mx - mid.x - 16, my - mid.y - 16) < 10) return p;
        }
      }
      return null;
    }

    function hitTestWire(mx: number, my: number): Wire | null {
      const { wires } = propsRef.current;
      for (let i = wires.length - 1; i >= 0; i--) {
        const w = wires[i];
        const a = pxFromGrid(w.from);
        const b = pxFromGrid(w.to);
        if (distToSeg(mx, my, a.x, a.y, b.x, b.y) < 6) return w;
      }
      return null;
    }

    function onMouseMove(e: MouseEvent) {
      const [mx, my] = getMouse(e);
      const ui = uiRef.current;
      const armed = propsRef.current.armed;
      ui.ghost = gridFromMouse(mx, my);

      if (ui.dragId) {
        // Drag a placed component.
        const newPos = gridFromMouse(mx - (ui.dragOffset?.x ?? 0), my - (ui.dragOffset?.y ?? 0));
        const c = propsRef.current.components.find(c => c.id === ui.dragId);
        if (c && (c.x !== newPos.x || c.y !== newPos.y)) {
          ui.dragMoved = true;
          propsRef.current.onMoveComponent(c.id, newPos);
        }
        return;
      }

      if (armed === 'wire') {
        const pin = hitTestPin(mx, my);
        ui.hoverPin = pin;
        canvas.style.cursor = pin ? 'crosshair' : 'default';
      } else if (armed === 'voltmeter') {
        const pin = hitTestPin(mx, my);
        ui.hoverPin = pin;
        canvas.style.cursor = 'crosshair';
      } else if (armed === 'ammeter') {
        const c = hitTestComponent(mx, my);
        ui.hoverComponentId = c?.id ?? null;
        canvas.style.cursor = c ? 'crosshair' : 'default';
      } else if (armed) {
        canvas.style.cursor = 'crosshair';
      } else {
        const c = hitTestComponent(mx, my);
        const probe = c ? null : hitTestProbe(mx, my);
        const wire = (c || probe) ? null : hitTestWire(mx, my);
        ui.hoverComponentId = c?.id ?? null;
        ui.hoverProbeId = probe?.id ?? null;
        ui.hoverWireId = wire?.id ?? null;
        canvas.style.cursor = (c || probe || wire) ? 'pointer' : 'default';
      }
    }

    function onMouseDown(e: MouseEvent) {
      const [mx, my] = getMouse(e);
      const ui = uiRef.current;
      const armed = propsRef.current.armed;

      if (armed === 'wire') {
        const pin = hitTestPin(mx, my);
        if (pin) {
          if (!ui.wireAnchor) ui.wireAnchor = pin;
          else if (pin.x !== ui.wireAnchor.x || pin.y !== ui.wireAnchor.y) {
            propsRef.current.onPlaceWire(ui.wireAnchor, pin);
            ui.wireAnchor = null;
          }
        }
        return;
      }
      if (armed === 'voltmeter') {
        const pin = hitTestPin(mx, my);
        if (pin) propsRef.current.onPlaceVoltProbe(pin);
        return;
      }
      if (armed === 'ammeter') {
        const c = hitTestComponent(mx, my);
        if (c) propsRef.current.onPlaceAmmProbe(c.id);
        return;
      }
      if (armed) {
        const g = gridFromMouse(mx, my);
        propsRef.current.onPlaceComponent(armed as ComponentKind, g);
        return;
      }

      // No tool armed → click selects / drags.
      const probe = hitTestProbe(mx, my);
      if (probe) {
        propsRef.current.onDeleteProbe(probe.id);
        return;
      }
      const c = hitTestComponent(mx, my);
      if (c) {
        const [p0g] = pinCoords(c);
        const p0 = pxFromGrid(p0g);
        ui.dragId = c.id;
        ui.dragOffset = { x: mx - p0.x, y: my - p0.y };
        ui.dragMoved = false;
        propsRef.current.onSelect(c.id);
        return;
      }
      const wire = hitTestWire(mx, my);
      if (wire) {
        propsRef.current.onSelectWire(wire.id);
        return;
      }
      propsRef.current.onSelect(null);
      propsRef.current.onSelectWire(null);
    }

    function onMouseUp() {
      const ui = uiRef.current;
      if (ui.dragId && !ui.dragMoved) {
        // pure click — selection already set on mouseDown
      }
      ui.dragId = null;
      ui.dragOffset = null;
      ui.dragMoved = false;
    }

    function onDoubleClick(e: MouseEvent) {
      const [mx, my] = getMouse(e);
      const c = hitTestComponent(mx, my);
      if (c && c.kind === 'switch') {
        propsRef.current.onMoveComponent(c.id, { x: c.x, y: c.y }); // no-op trigger
        // Toggle via a synthetic onChange — use onSelect to bring up inspector instead.
        propsRef.current.onSelect(c.id);
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        uiRef.current.wireAnchor = null;
        propsRef.current.onSelect(null);
      }
    }

    function onTouchStart(e: TouchEvent) {
      e.preventDefault();
      onMouseDown({
        clientX: e.touches[0].clientX,
        clientY: e.touches[0].clientY,
      } as MouseEvent);
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
    canvas.addEventListener('dblclick', onDoubleClick);
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);
    window.addEventListener('keydown', onKeyDown);

    function draw() {
      const p = propsRef.current;
      const ui = uiRef.current;

      // Theme-aware colors.
      const colors = getCanvasColors();

      // Clear & background.
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      // Grid.
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += GRID_PX) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y < h; y += GRID_PX) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }
      // Grid dots at intersections (subtle).
      ctx.fillStyle = colors.border;
      for (let x = 0; x < w; x += GRID_PX) {
        for (let y = 0; y < h; y += GRID_PX) {
          ctx.fillRect(x - 0.5, y - 0.5, 1, 1);
        }
      }

      // Wires.
      for (const wr of p.wires) {
        const a = { x: wr.from.x * GRID_PX, y: wr.from.y * GRID_PX };
        const b = { x: wr.to.x * GRID_PX,   y: wr.to.y * GRID_PX };
        const isSelected = p.selectedWireId === wr.id;
        const isHovered = ui.hoverWireId === wr.id;
        ctx.strokeStyle = isSelected ? colors.accent : isHovered ? colors.strokeHi : colors.stroke;
        ctx.lineWidth = isSelected ? 2.6 : 1.8;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        // Manhattan: horizontal then vertical from a → b.
        ctx.lineTo(b.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      // Components.
      for (const c of p.components) {
        const [p0g, p1g] = pinCoords(c);
        const p0 = { x: p0g.x * GRID_PX, y: p0g.y * GRID_PX };
        const p1 = p1g ? { x: p1g.x * GRID_PX, y: p1g.y * GRID_PX } : null;
        let brightness = 0;
        if (c.kind === 'bulb' && p.solverResult) {
          const I = p.solverResult.componentCurrents.get(c.id) ?? 0;
          const P = I * I * Math.max(1e-6, c.value);
          // Scale: 0.5 W ≈ full brightness.
          brightness = Math.min(1, P / 0.5);
        }
        drawComponent(c, {
          ctx, p0, p1,
          selected: p.selectedId === c.id,
          hovered: ui.hoverComponentId === c.id,
          current: p.solverResult?.componentCurrents.get(c.id) ?? 0,
          voltage: 0,
          brightness,
          colors,
        });
      }

      // Pin dots where wires/pins terminate.
      const pinPoints = new Set<string>();
      for (const c of p.components) {
        const [a, b] = pinCoords(c);
        pinPoints.add(`${a.x},${a.y}`);
        if (b) pinPoints.add(`${b.x},${b.y}`);
      }
      for (const wr of p.wires) {
        pinPoints.add(`${wr.from.x},${wr.from.y}`);
        pinPoints.add(`${wr.to.x},${wr.to.y}`);
      }
      ctx.fillStyle = colors.stroke;
      for (const k of pinPoints) {
        const [gx, gy] = k.split(',').map(Number);
        ctx.beginPath();
        ctx.arc(gx * GRID_PX, gy * GRID_PX, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Probes.
      for (const probe of p.probes) {
        if (probe.kind === 'voltmeter' && probe.at) {
          const pp = { x: probe.at.x * GRID_PX, y: probe.at.y * GRID_PX };
          drawProbeBadge(ctx, pp.x + 14, pp.y + 14, 'V', colors.teal,
            ui.hoverProbeId === probe.id);
        } else if (probe.kind === 'ammeter' && probe.componentId) {
          const c = p.components.find(cc => cc.id === probe.componentId);
          if (!c) continue;
          const [a, b] = pinCoords(c);
          if (!b) continue;
          const mid = {
            x: (a.x + b.x) * GRID_PX / 2,
            y: (a.y + b.y) * GRID_PX / 2,
          };
          drawProbeBadge(ctx, mid.x + 16, mid.y + 16, 'A', colors.accent,
            ui.hoverProbeId === probe.id);
        }
      }

      // Wire-routing preview: anchor → current mouse.
      if (p.armed === 'wire' && ui.wireAnchor) {
        const a = { x: ui.wireAnchor.x * GRID_PX, y: ui.wireAnchor.y * GRID_PX };
        const tgt = ui.hoverPin ?? ui.ghost;
        if (tgt) {
          const b = { x: tgt.x * GRID_PX, y: tgt.y * GRID_PX };
          ctx.strokeStyle = colors.teal;
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        // Highlight anchor.
        ctx.fillStyle = colors.teal;
        ctx.beginPath();
        ctx.arc(a.x, a.y, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Pin highlight on hover (wire tool).
      if ((p.armed === 'wire' || p.armed === 'voltmeter') && ui.hoverPin) {
        const pp = { x: ui.hoverPin.x * GRID_PX, y: ui.hoverPin.y * GRID_PX };
        ctx.strokeStyle = colors.teal;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(pp.x, pp.y, 6, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Ghost placement preview when a component is armed.
      if (p.armed && p.armed !== 'wire' && p.armed !== 'voltmeter' && p.armed !== 'ammeter' && ui.ghost) {
        const gx = ui.ghost.x * GRID_PX;
        const gy = ui.ghost.y * GRID_PX;
        ctx.strokeStyle = colors.glow;
        ctx.lineWidth = 1.2;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.arc(gx, gy, 6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        // tiny preview vector.
        ctx.beginPath();
        ctx.moveTo(gx, gy);
        ctx.lineTo(gx + 2 * GRID_PX, gy);
        ctx.stroke();
      }

      // Live voltage / current readouts drawn next to each probe badge.
      if (p.solverResult) {
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textBaseline = 'middle';
        for (const probe of p.probes) {
          if (probe.kind === 'voltmeter' && probe.at) {
            const idx = p.nodeMap.index.get(pkey(probe.at.x, probe.at.y));
            const v = idx !== undefined ? p.solverResult.nodeVoltages[idx] : 0;
            const text = eng(v, 3) + 'V';
            const cx = probe.at.x * GRID_PX + 14;
            const cy = probe.at.y * GRID_PX + 14;
            ctx.save();
            ctx.globalAlpha = 0.9;
            ctx.fillStyle = colors.bg;
            const padX = 4, w0 = ctx.measureText(text).width + padX * 2;
            ctx.fillRect(cx + 12, cy - 8, w0, 16);
            ctx.restore();
            ctx.fillStyle = colors.teal;
            ctx.textAlign = 'left';
            ctx.fillText(text, cx + 12 + padX, cy + 0.5);
          } else if (probe.kind === 'ammeter' && probe.componentId) {
            const c = p.components.find(cc => cc.id === probe.componentId);
            if (!c) continue;
            const [a, b] = pinCoords(c);
            if (!b) continue;
            const i = p.solverResult.componentCurrents.get(probe.componentId) ?? 0;
            const text = eng(i, 3) + 'A';
            const cx = (a.x + b.x) * GRID_PX / 2 + 16;
            const cy = (a.y + b.y) * GRID_PX / 2 + 16;
            ctx.save();
            ctx.globalAlpha = 0.9;
            ctx.fillStyle = colors.bg;
            const padX = 4, w0 = ctx.measureText(text).width + padX * 2;
            ctx.fillRect(cx + 12, cy - 8, w0, 16);
            ctx.restore();
            ctx.fillStyle = colors.accent;
            ctx.textAlign = 'left';
            ctx.fillText(text, cx + 12 + padX, cy + 0.5);
          }
        }
      }

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('dblclick', onDoubleClick);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  return <AutoResizeCanvas height={CANVAS_HEIGHT} setup={setup} ariaLabel="Schematic editor" />;
}

/* ───── Small helpers ───── */

function distToSeg(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax, dy = by - ay;
  const l2 = dx * dx + dy * dy;
  if (l2 === 0) return Math.hypot(px - ax, py - ay);
  let t = ((px - ax) * dx + (py - ay) * dy) / l2;
  t = Math.max(0, Math.min(1, t));
  const x = ax + t * dx, y = ay + t * dy;
  return Math.hypot(px - x, py - y);
}

function drawProbeBadge(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, label: string, color: string, hover: boolean,
) {
  const colors = getCanvasColors();
  ctx.fillStyle = colors.bg;
  ctx.strokeStyle = color;
  ctx.lineWidth = hover ? 2 : 1.3;
  ctx.beginPath();
  ctx.arc(cx, cy, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.font = 'bold 10px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, cx, cy + 0.5);
}
