/**
 * Floorplan canvas.
 *
 * Draws rooms (filled rectangles + name tag), devices (small symbols
 * pinned to grid points), the panel (as a strip along the right edge),
 * and cable runs (polylines from panel-edge to device).
 *
 * Pointer interaction:
 *   - When `armed` is a device kind, the next click drops one in the
 *     room under the cursor.
 *   - When `armed === 'cable'`, click a breaker in the panel then a
 *     device on the floorplan to create a cable.
 *   - Otherwise click a device to select it for the inspector.
 *
 * Rendering happens on a single <canvas> tied into AutoResizeCanvas, in
 * the same pattern as the Circuit Builder editor.
 */

import { useCallback, useEffect, useRef } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';

import { isReceptacle } from './audit';
import type {
  Breaker, BreakerKind, Cable, CableKind, Device, DeviceKind,
  HouseDoc, Room, Violation,
} from './types';

const GRID_PX = 14;
const CANVAS_HEIGHT = 640;

export type ArmedTool =
  | DeviceKind
  | BreakerKind
  | CableKind
  | 'cable-pick'
  | 'select'
  | null;

interface Props {
  doc: HouseDoc;
  armed: ArmedTool;
  selectedDeviceId: string | null;
  selectedBreakerId: string | null;
  selectedCableId: string | null;
  /** Violations to render warning badges over devices. */
  violations: Violation[];
  /** While routing a cable: the breaker we already picked. */
  cableAnchor: { breakerId: string } | null;
  /** Default cable kind to drop when finishing a route. */
  defaultCableKind: CableKind;

  onPickRoom: (roomId: string | null, gx: number, gy: number) => void;
  onPickDevice: (id: string | null) => void;
  onPickBreaker: (id: string | null) => void;
  onPickCable: (id: string | null) => void;
  onDropDevice: (kind: DeviceKind, roomId: string, gx: number, gy: number) => void;
  onDropBreaker: (kind: BreakerKind) => void;
  onCableFromBreaker: (breakerId: string) => void;
  onCableToDevice: (deviceId: string) => void;
}

export function FloorplanCanvas(props: Props) {
  const propsRef = useRef(props);
  useEffect(() => { propsRef.current = props; }, [props]);

  const uiRef = useRef({
    hoverDeviceId: null as string | null,
    hoverBreakerId: null as string | null,
    hoverRoomId: null as string | null,
    ghost: null as { x: number; y: number } | null,
  });

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, canvas } = info;
    let raf = 0;

    function getMouse(e: MouseEvent | TouchEvent): [number, number] {
      const r = canvas.getBoundingClientRect();
      const t = 'touches' in e ? (e.touches[0] || e.changedTouches?.[0]) : e;
      if (!t) return [-1, -1];
      return [t.clientX - r.left, t.clientY - r.top];
    }

    function roomAtPixel(mx: number, my: number): Room | null {
      const { doc } = propsRef.current;
      // iterate small rooms last so they win the hit test.
      const sorted = [...doc.rooms].sort((a, b) => (b.w * b.h) - (a.w * a.h));
      for (const r of sorted) {
        const px = r.x * GRID_PX;
        const py = r.y * GRID_PX;
        if (mx >= px && mx <= px + r.w * GRID_PX &&
            my >= py && my <= py + r.h * GRID_PX) return r;
      }
      return null;
    }

    function deviceAtPixel(mx: number, my: number): Device | null {
      const { doc } = propsRef.current;
      for (let i = doc.devices.length - 1; i >= 0; i--) {
        const d = doc.devices[i];
        const dx = d.x * GRID_PX, dy = d.y * GRID_PX;
        if (Math.hypot(mx - dx, my - dy) < 10) return d;
      }
      return null;
    }

    function breakerAtPixel(mx: number, my: number): Breaker | null {
      const { doc } = propsRef.current;
      const panelX = w - 160;
      if (mx < panelX || mx > w - 12) return null;
      for (const b of doc.breakers) {
        const py = 40 + b.slot * 18;
        if (my >= py && my <= py + 16) return b;
      }
      return null;
    }

    function gridFromMouse(mx: number, my: number): { x: number; y: number } {
      return {
        x: Math.round(mx / GRID_PX),
        y: Math.round(my / GRID_PX),
      };
    }

    function onMouseMove(e: MouseEvent) {
      const [mx, my] = getMouse(e);
      const ui = uiRef.current;
      const armed = propsRef.current.armed;
      const room = roomAtPixel(mx, my);
      const dev = deviceAtPixel(mx, my);
      const br = breakerAtPixel(mx, my);
      ui.hoverRoomId = room?.id ?? null;
      ui.hoverDeviceId = dev?.id ?? null;
      ui.hoverBreakerId = br?.id ?? null;
      ui.ghost = gridFromMouse(mx, my);
      canvas.style.cursor =
        armed && armed !== 'select' ? 'crosshair' :
        (dev || br || room) ? 'pointer' : 'default';
    }

    function onMouseDown(e: MouseEvent) {
      const [mx, my] = getMouse(e);
      const p = propsRef.current;
      const armed = p.armed;
      const room = roomAtPixel(mx, my);
      const dev = deviceAtPixel(mx, my);
      const br = breakerAtPixel(mx, my);

      // 1. Routing a cable from a breaker?
      if (armed === 'cable-pick') {
        if (br) { p.onCableFromBreaker(br.id); return; }
        if (dev && p.cableAnchor) { p.onCableToDevice(dev.id); return; }
      }

      // 2. Dropping a breaker?
      if (armed && isBreakerKind(armed)) {
        p.onDropBreaker(armed);
        return;
      }

      // 3. Dropping a device?
      if (armed && isDeviceKind(armed)) {
        if (room) {
          const g = gridFromMouse(mx, my);
          p.onDropDevice(armed, room.id, g.x, g.y);
        }
        return;
      }

      // 4. Select mode.
      if (dev) { p.onPickDevice(dev.id); return; }
      if (br)  { p.onPickBreaker(br.id); return; }
      if (room) { p.onPickRoom(room.id, mx / GRID_PX, my / GRID_PX); return; }
      p.onPickDevice(null);
      p.onPickBreaker(null);
      p.onPickCable(null);
      p.onPickRoom(null, 0, 0);
    }

    function onTouchStart(e: TouchEvent) {
      e.preventDefault();
      const [mx, my] = getMouse(e);
      onMouseDown({ clientX: mx + canvas.getBoundingClientRect().left,
                    clientY: my + canvas.getBoundingClientRect().top } as MouseEvent);
    }
    function onTouchMove(e: TouchEvent) {
      e.preventDefault();
      const [mx, my] = getMouse(e);
      onMouseMove({ clientX: mx + canvas.getBoundingClientRect().left,
                    clientY: my + canvas.getBoundingClientRect().top } as MouseEvent);
    }

    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });

    function draw() {
      const p = propsRef.current;
      const ui = uiRef.current;
      const { doc } = p;

      // Background.
      ctx.fillStyle = '#0d0d10';
      ctx.fillRect(0, 0, w, h);

      // Floor grid (subtle).
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w - 160; x += GRID_PX) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y < h; y += GRID_PX) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w - 160, y); ctx.stroke();
      }

      // Rooms.
      for (const r of doc.rooms) {
        const px = r.x * GRID_PX, py = r.y * GRID_PX;
        const pw = r.w * GRID_PX, ph = r.h * GRID_PX;
        const isHover = ui.hoverRoomId === r.id;
        ctx.fillStyle = roomFillColor(r, isHover);
        ctx.fillRect(px, py, pw, ph);
        ctx.strokeStyle = 'rgba(236,235,229,0.18)';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(px + 0.5, py + 0.5, pw - 1, ph - 1);
        // Label
        ctx.fillStyle = 'rgba(236,235,229,0.55)';
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(r.name, px + 6, py + 6);
        ctx.fillStyle = 'rgba(160,158,149,0.55)';
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillText(`${r.w}×${r.h} ft`, px + 6, py + 22);
      }

      // Cables (drawn under devices).
      for (const c of doc.cables) {
        const br = doc.breakers.find(b => b.id === c.breakerId);
        const dev = doc.devices.find(d => d.id === c.deviceId);
        if (!br || !dev) continue;
        const bx = w - 160 + 4;
        const by = 40 + br.slot * 18 + 8;
        const dx = dev.x * GRID_PX, dy = dev.y * GRID_PX;
        // Manhattan-ish path with one mid-point.
        ctx.strokeStyle = p.selectedCableId === c.id
          ? '#ff6b2a'
          : cableStrokeColor(c.kind);
        ctx.lineWidth = p.selectedCableId === c.id ? 2.4 : 1.4;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx - 30, by);
        ctx.lineTo(bx - 30, dy);
        ctx.lineTo(dx, dy);
        ctx.stroke();
      }

      // Devices.
      const violatedDevIds = new Set(
        p.violations.filter(v => v.refDeviceId).map(v => v.refDeviceId!),
      );
      for (const d of doc.devices) {
        const dx = d.x * GRID_PX, dy = d.y * GRID_PX;
        const isHover = ui.hoverDeviceId === d.id;
        const isSel = p.selectedDeviceId === d.id;
        const isViolated = violatedDevIds.has(d.id);
        drawDevice(ctx, dx, dy, d.kind, isSel, isHover, isViolated);
      }

      // Panel strip.
      const panelX = w - 160;
      ctx.fillStyle = '#16161a';
      ctx.fillRect(panelX, 0, 160, h);
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(panelX + 0.5, 0.5, 159, h - 1);

      ctx.fillStyle = 'var(--accent)';
      ctx.fillStyle = '#ff6b2a';
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('SERVICE PANEL', panelX + 10, 8);
      ctx.fillStyle = '#a09e95';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText(`${doc.panelAmps} A · 240/120 V`, panelX + 10, 22);

      const violatedBkrIds = new Set(
        p.violations.filter(v => v.refBreakerId).map(v => v.refBreakerId!),
      );
      for (const b of doc.breakers) {
        const py = 40 + b.slot * 18;
        const isHover = ui.hoverBreakerId === b.id;
        const isSel = p.selectedBreakerId === b.id;
        const isAnchor = p.cableAnchor?.breakerId === b.id;
        const isViolated = violatedBkrIds.has(b.id);
        drawBreaker(ctx, panelX + 10, py, 140, 16, b, isSel, isHover, isAnchor, isViolated);
      }

      // Ghost crosshair when armed.
      if (p.armed && p.armed !== 'select' && p.armed !== 'cable-pick' && ui.ghost) {
        const gx = ui.ghost.x * GRID_PX, gy = ui.ghost.y * GRID_PX;
        ctx.strokeStyle = 'rgba(255,107,42,0.6)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.arc(gx, gy, 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Cable anchor preview.
      if (p.cableAnchor) {
        const br = doc.breakers.find(b => b.id === p.cableAnchor!.breakerId);
        if (br) {
          const bx = w - 160 + 4;
          const by = 40 + br.slot * 18 + 8;
          ctx.strokeStyle = '#6cc5c2';
          ctx.lineWidth = 1.4;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(bx, by);
          if (ui.ghost) {
            const gx = ui.ghost.x * GRID_PX, gy = ui.ghost.y * GRID_PX;
            ctx.lineTo(bx - 30, by);
            ctx.lineTo(bx - 30, gy);
            ctx.lineTo(gx, gy);
          }
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
    };
  }, []);

  return <AutoResizeCanvas height={CANVAS_HEIGHT} setup={setup} ariaLabel="House floorplan" />;
}

/* ───── Drawing helpers ───── */

function roomFillColor(r: Room, hover: boolean): string {
  const base: Record<string, string> = {
    kitchen: 'rgba(108,197,194,0.07)',
    'kitchen-island': 'rgba(108,197,194,0.14)',
    bath: 'rgba(91,174,248,0.08)',
    living: 'rgba(236,235,229,0.04)',
    dining: 'rgba(236,235,229,0.04)',
    bedroom: 'rgba(255,107,42,0.05)',
    garage: 'rgba(255,255,255,0.03)',
    basement: 'rgba(255,255,255,0.03)',
    laundry: 'rgba(91,174,248,0.06)',
    outdoor: 'rgba(108,197,194,0.04)',
    hall: 'rgba(255,255,255,0.02)',
    closet: 'rgba(255,255,255,0.025)',
  };
  const c = base[r.kind] ?? 'rgba(255,255,255,0.03)';
  return hover ? brighten(c) : c;
}

function brighten(rgba: string): string {
  // Naïve: bump the alpha.
  const m = rgba.match(/rgba\(([^)]+)\)/);
  if (!m) return rgba;
  const parts = m[1].split(',').map(s => s.trim());
  if (parts.length < 4) return rgba;
  const a = Math.min(1, parseFloat(parts[3]) + 0.07);
  return `rgba(${parts[0]},${parts[1]},${parts[2]},${a})`;
}

function drawDevice(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  kind: DeviceKind,
  selected: boolean, hovered: boolean, violated: boolean,
) {
  const color = selected ? '#ff6b2a' : violated ? '#ff3b6e' : hovered ? '#ffb084' : '#ecebe5';
  ctx.strokeStyle = color;
  ctx.fillStyle = '#0d0d10';
  ctx.lineWidth = selected ? 2.2 : 1.4;

  if (kind === 'switch') {
    ctx.beginPath();
    ctx.rect(x - 4, y - 6, 8, 12);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = color;
    ctx.font = 'bold 7px "JetBrains Mono", monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('S', x, y);
  } else if (kind === 'light') {
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(x - 4, y - 4); ctx.lineTo(x + 4, y + 4);
    ctx.moveTo(x + 4, y - 4); ctx.lineTo(x - 4, y + 4);
    ctx.stroke();
  } else if (kind === 'smoke') {
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = color;
    ctx.font = 'bold 7px "JetBrains Mono", monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('SD', x, y);
  } else if (kind === 'fan') {
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = color;
    ctx.font = 'bold 7px "JetBrains Mono", monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('F', x, y);
  } else if (isReceptacle(kind)) {
    // Duplex receptacle: two parallel slots.
    ctx.beginPath();
    ctx.rect(x - 6, y - 5, 12, 10);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = color;
    if (kind === 'receptacle-gfci' || kind === 'receptacle-wr') {
      ctx.font = 'bold 6px "JetBrains Mono", monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(kind === 'receptacle-gfci' ? 'G' : 'WR', x, y);
    } else if (kind === 'receptacle-240') {
      ctx.font = 'bold 6px "JetBrains Mono", monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('240', x, y);
    } else {
      // Two slot marks.
      ctx.fillRect(x - 3, y - 3, 1, 6);
      ctx.fillRect(x + 2, y - 3, 1, 6);
    }
  }

  if (violated) {
    // Small warning dot top-right.
    ctx.fillStyle = '#ff3b6e';
    ctx.beginPath();
    ctx.arc(x + 8, y - 8, 2.4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawBreaker(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  b: Breaker, selected: boolean, hovered: boolean, anchor: boolean, violated: boolean,
) {
  ctx.fillStyle = '#0d0d10';
  ctx.strokeStyle =
    anchor ? '#6cc5c2' :
    selected ? '#ff6b2a' :
    violated ? '#ff3b6e' :
    hovered ? '#ffb084' :
    'rgba(236,235,229,0.35)';
  ctx.lineWidth = selected || anchor ? 2 : 1.2;
  ctx.beginPath();
  ctx.rect(x + 0.5, y + 0.5, w - 1, h - 1);
  ctx.fill(); ctx.stroke();

  // Indicator strip for kind.
  ctx.fillStyle = breakerStripColor(b.kind);
  ctx.fillRect(x + 1, y + 1, 4, h - 2);

  ctx.fillStyle = '#ecebe5';
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(shortBreakerLabel(b), x + 10, y + h / 2);
}

function breakerStripColor(k: BreakerKind): string {
  if (k === 'gfci-15' || k === 'gfci-20') return '#5baef8';
  if (k === 'afci-15' || k === 'afci-20') return '#ff6b2a';
  if (k === 'dfci-15' || k === 'dfci-20') return '#6cc5c2';
  if (k === 'dp-30' || k === 'dp-40' || k === 'dp-50') return '#ff3b6e';
  return '#a09e95';
}

function shortBreakerLabel(b: Breaker): string {
  const aMap: Record<BreakerKind, number> = {
    'std-15': 15, 'std-20': 20, 'afci-15': 15, 'afci-20': 20,
    'gfci-15': 15, 'gfci-20': 20, 'dfci-15': 15, 'dfci-20': 20,
    'dp-30': 30, 'dp-40': 40, 'dp-50': 50,
  };
  const a = aMap[b.kind];
  const tag =
    (b.kind === 'dfci-15' || b.kind === 'dfci-20') ? 'DFCI' :
    (b.kind === 'afci-15' || b.kind === 'afci-20') ? 'AFCI' :
    (b.kind === 'gfci-15' || b.kind === 'gfci-20') ? 'GFCI' :
    (b.kind === 'dp-30' || b.kind === 'dp-40' || b.kind === 'dp-50') ? '2P' :
    'STD';
  if (b.label) return `${a}A ${tag} ${truncate(b.label, 12)}`;
  return `${a}A ${tag}`;
}

function truncate(s: string, n: number): string {
  return s.length <= n ? s : s.slice(0, n - 1) + '…';
}

function cableStrokeColor(k: CableKind): string {
  if (k === 'nm-14-2') return 'rgba(255,255,255,0.35)';
  if (k === 'nm-12-2') return 'rgba(255,235,150,0.5)';
  if (k === 'nm-10-3') return 'rgba(255,160,90,0.55)';
  if (k === 'nm-8-3')  return 'rgba(108,197,194,0.6)';
  if (k === 'nm-6-3')  return 'rgba(255,59,110,0.55)';
  return 'rgba(255,255,255,0.35)';
}

function isDeviceKind(k: string): k is DeviceKind {
  return (
    k === 'receptacle' || k === 'receptacle-gfci' || k === 'receptacle-tr' ||
    k === 'receptacle-wr' || k === 'receptacle-240' || k === 'switch' ||
    k === 'light' || k === 'smoke' || k === 'fan'
  );
}
function isBreakerKind(k: string): k is BreakerKind {
  return (
    k === 'std-15' || k === 'std-20' || k === 'afci-15' || k === 'afci-20' ||
    k === 'gfci-15' || k === 'gfci-20' || k === 'dfci-15' || k === 'dfci-20' ||
    k === 'dp-30' || k === 'dp-40' || k === 'dp-50'
  );
}

// Keeping unused imports satisfied for tsc strict.
export type { Cable, Breaker };
