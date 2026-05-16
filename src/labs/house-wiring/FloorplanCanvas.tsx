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
 * Rendering happens on a single <canvas className="block w-full"> tied into AutoResizeCanvas, in
 * the same pattern as the Circuit Builder editor.
 */

import { useCallback, useEffect, useRef } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { getCanvasColors, type ThemeColors } from '@/lib/canvasTheme';

import { isReceptacle, BREAKER_AMPS } from './audit';
import type {
  Breaker,
  BreakerKind,
  Cable,
  CableKind,
  Device,
  DeviceKind,
  HouseDoc,
  Room,
  Violation,
} from './types';

const GRID_PX = 14;
const CANVAS_HEIGHT = 640;

/** Panel card geometry. */
const CARD_W = 152;
const CARD_MARGIN = 6;
const CARD_PAD = 10;
const CARD_RADIUS = 4;
const HEADER_H = 34;
const ROW_H = 22;

export type ArmedTool = DeviceKind | BreakerKind | CableKind | 'cable-pick' | 'select' | null;

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
  useEffect(() => {
    propsRef.current = props;
  }, [props]);

  const uiRef = useRef({
    hoverDeviceId: null as string | null,
    hoverBreakerId: null as string | null,
    hoverRoomId: null as string | null,
    ghost: null as { x: number; y: number } | null,
  });

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, canvas } = info;
    let raf = 0;

    const cardX = w - CARD_W - CARD_MARGIN;
    const cardY = CARD_MARGIN;
    const contentX = cardX + CARD_PAD;
    const contentW = CARD_W - CARD_PAD * 2;

    function getMouse(e: MouseEvent | TouchEvent): [number, number] {
      const r = canvas.getBoundingClientRect();
      const t = 'touches' in e ? e.touches[0] || e.changedTouches?.[0] : e;
      if (!t) return [-1, -1];
      return [t.clientX - r.left, t.clientY - r.top];
    }

    function roomAtPixel(mx: number, my: number): Room | null {
      const { doc } = propsRef.current;
      const sorted = [...doc.rooms].sort((a, b) => b.w * b.h - a.w * a.h);
      for (const r of sorted) {
        const px = r.x * GRID_PX;
        const py = r.y * GRID_PX;
        if (mx >= px && mx <= px + r.w * GRID_PX && my >= py && my <= py + r.h * GRID_PX) return r;
      }
      return null;
    }

    function deviceAtPixel(mx: number, my: number): Device | null {
      const { doc } = propsRef.current;
      for (let i = doc.devices.length - 1; i >= 0; i--) {
        const d = doc.devices[i];
        const dx = d.x * GRID_PX,
          dy = d.y * GRID_PX;
        if (Math.hypot(mx - dx, my - dy) < 10) return d;
      }
      return null;
    }

    function breakerAtPixel(mx: number, my: number): Breaker | null {
      const { doc } = propsRef.current;
      if (mx < contentX || mx > contentX + contentW) return null;
      for (const b of doc.breakers) {
        const py = cardY + HEADER_H + 4 + b.slot * ROW_H;
        if (my >= py && my <= py + ROW_H) return b;
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
        armed && armed !== 'select' ? 'crosshair' : dev || br || room ? 'pointer' : 'default';
    }

    function onMouseDown(e: MouseEvent) {
      const [mx, my] = getMouse(e);
      const p = propsRef.current;
      const armed = p.armed;
      const room = roomAtPixel(mx, my);
      const dev = deviceAtPixel(mx, my);
      const br = breakerAtPixel(mx, my);

      if (armed === 'cable-pick') {
        if (br) {
          p.onCableFromBreaker(br.id);
          return;
        }
        if (dev && p.cableAnchor) {
          p.onCableToDevice(dev.id);
          return;
        }
      }

      if (armed && isBreakerKind(armed)) {
        p.onDropBreaker(armed);
        return;
      }

      if (armed && isDeviceKind(armed)) {
        if (room) {
          const g = gridFromMouse(mx, my);
          p.onDropDevice(armed, room.id, g.x, g.y);
        }
        return;
      }

      if (dev) {
        p.onPickDevice(dev.id);
        return;
      }
      if (br) {
        p.onPickBreaker(br.id);
        return;
      }
      if (room) {
        p.onPickRoom(room.id, mx / GRID_PX, my / GRID_PX);
        return;
      }
      p.onPickDevice(null);
      p.onPickBreaker(null);
      p.onPickCable(null);
      p.onPickRoom(null, 0, 0);
    }

    function onTouchStart(e: TouchEvent) {
      e.preventDefault();
      const [mx, my] = getMouse(e);
      onMouseDown({
        clientX: mx + canvas.getBoundingClientRect().left,
        clientY: my + canvas.getBoundingClientRect().top,
      } as MouseEvent);
    }
    function onTouchMove(e: TouchEvent) {
      e.preventDefault();
      const [mx, my] = getMouse(e);
      onMouseMove({
        clientX: mx + canvas.getBoundingClientRect().left,
        clientY: my + canvas.getBoundingClientRect().top,
      } as MouseEvent);
    }

    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });

    function draw() {
      const p = propsRef.current;
      const ui = uiRef.current;
      const { doc } = p;
      const colors = getCanvasColors();

      // Background.
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      // Floor grid (subtle).
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      for (let x = 0; x < cardX; x += GRID_PX) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += GRID_PX) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(cardX, y);
        ctx.stroke();
      }

      // Rooms.
      for (const r of doc.rooms) {
        const px = r.x * GRID_PX,
          py = r.y * GRID_PX;
        const pw = r.w * GRID_PX,
          ph = r.h * GRID_PX;
        const isHover = ui.hoverRoomId === r.id;
        const fill = roomFillStyle(r, colors);
        ctx.save();
        ctx.globalAlpha = isHover ? Math.min(1, fill.alpha + 0.07) : fill.alpha;
        ctx.fillStyle = fill.color;
        ctx.fillRect(px, py, pw, ph);
        ctx.restore();
        ctx.strokeStyle = colors.borderStrong;
        ctx.lineWidth = 1.2;
        ctx.strokeRect(px + 0.5, py + 0.5, pw - 1, ph - 1);
        ctx.fillStyle = colors.textDim;
        ctx.globalAlpha = 0.8;
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(r.name, px + 6, py + 6);
        ctx.fillStyle = colors.textMuted;
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillText(`${r.w}×${r.h} ft`, px + 6, py + 22);
        ctx.globalAlpha = 1;
      }

      // Cables (drawn under devices).
      for (const c of doc.cables) {
        const br = doc.breakers.find((b) => b.id === c.breakerId);
        const dev = doc.devices.find((d) => d.id === c.deviceId);
        if (!br || !dev) continue;
        const bx = cardX + 4;
        const by = cardY + HEADER_H + 4 + br.slot * ROW_H + ROW_H / 2;
        const dx = dev.x * GRID_PX,
          dy = dev.y * GRID_PX;
        ctx.strokeStyle =
          p.selectedCableId === c.id ? colors.accent : cableStrokeColor(c.kind, colors);
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
        p.violations.filter((v) => v.refDeviceId).map((v) => v.refDeviceId!),
      );
      for (const d of doc.devices) {
        const dx = d.x * GRID_PX,
          dy = d.y * GRID_PX;
        const isHover = ui.hoverDeviceId === d.id;
        const isSel = p.selectedDeviceId === d.id;
        const isViolated = violatedDevIds.has(d.id);
        drawDevice(ctx, dx, dy, d.kind, isSel, isHover, isViolated, colors);
      }

      // ─── Service Panel Card ───
      drawPanelCard(ctx, cardX, cardY, h, doc, colors);

      const violatedBkrIds = new Set(
        p.violations.filter((v) => v.refBreakerId).map((v) => v.refBreakerId!),
      );
      for (const b of doc.breakers) {
        const py = cardY + HEADER_H + 4 + b.slot * ROW_H;
        const isHover = ui.hoverBreakerId === b.id;
        const isSel = p.selectedBreakerId === b.id;
        const isAnchor = p.cableAnchor?.breakerId === b.id;
        const isViolated = violatedBkrIds.has(b.id);
        drawBreakerRow(
          ctx,
          contentX,
          py,
          contentW,
          ROW_H,
          b,
          isSel,
          isHover,
          isAnchor,
          isViolated,
          colors,
        );
      }

      // Ghost crosshair when armed.
      if (p.armed && p.armed !== 'select' && p.armed !== 'cable-pick' && ui.ghost) {
        const gx = ui.ghost.x * GRID_PX,
          gy = ui.ghost.y * GRID_PX;
        ctx.strokeStyle = colors.accentGlow;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.arc(gx, gy, 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Cable anchor preview.
      if (p.cableAnchor) {
        const br = doc.breakers.find((b) => b.id === p.cableAnchor!.breakerId);
        if (br) {
          const bx = cardX + 4;
          const by = cardY + HEADER_H + 4 + br.slot * ROW_H + ROW_H / 2;
          ctx.strokeStyle = colors.teal;
          ctx.lineWidth = 1.4;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(bx, by);
          if (ui.ghost) {
            const gx = ui.ghost.x * GRID_PX,
              gy = ui.ghost.y * GRID_PX;
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

function drawPanelCard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  h: number,
  doc: HouseDoc,
  colors: ThemeColors,
) {
  const cardH = h - CARD_MARGIN * 2;

  // Card background.
  ctx.fillStyle = colors.cardBg;
  roundRect(ctx, x, y, CARD_W, cardH, CARD_RADIUS);
  ctx.fill();

  // Card border.
  ctx.strokeStyle = colors.border;
  ctx.lineWidth = 1;
  roundRect(ctx, x, y, CARD_W, cardH, CARD_RADIUS);
  ctx.stroke();

  // Title.
  ctx.fillStyle = colors.accent;
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('SERVICE PANEL', x + CARD_PAD, y + CARD_PAD);

  // Subtitle.
  ctx.fillStyle = colors.textMuted;
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.fillText(`${doc.panelAmps} A · 240/120 V`, x + CARD_PAD, y + CARD_PAD + 14);

  // Separator line under header.
  ctx.strokeStyle = colors.border;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + CARD_PAD, y + HEADER_H);
  ctx.lineTo(x + CARD_W - CARD_PAD, y + HEADER_H);
  ctx.stroke();
}

function roomFillStyle(r: Room, colors: ThemeColors): { color: string; alpha: number } {
  const base: Record<string, { color: string; alpha: number }> = {
    kitchen: { color: colors.teal, alpha: 0.07 },
    'kitchen-island': { color: colors.teal, alpha: 0.14 },
    bath: { color: colors.blue, alpha: 0.08 },
    living: { color: colors.text, alpha: 0.04 },
    dining: { color: colors.text, alpha: 0.04 },
    bedroom: { color: colors.accent, alpha: 0.05 },
    garage: { color: colors.text, alpha: 0.03 },
    basement: { color: colors.text, alpha: 0.03 },
    laundry: { color: colors.blue, alpha: 0.06 },
    outdoor: { color: colors.teal, alpha: 0.04 },
    hall: { color: colors.text, alpha: 0.02 },
    closet: { color: colors.text, alpha: 0.025 },
  };
  return base[r.kind] ?? { color: colors.text, alpha: 0.03 };
}

function drawDevice(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  kind: DeviceKind,
  selected: boolean,
  hovered: boolean,
  violated: boolean,
  colors: ThemeColors,
) {
  const color = selected
    ? colors.accent
    : violated
      ? colors.pink
      : hovered
        ? colors.text
        : colors.textDim;
  ctx.strokeStyle = color;
  ctx.fillStyle = colors.bg;
  ctx.lineWidth = selected ? 2.2 : 1.4;

  if (kind === 'switch') {
    // Toggle-switch schematic symbol.
    ctx.beginPath();
    ctx.arc(x - 5, y, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + 5, y, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - 5, y);
    ctx.lineTo(x + 4, y - 6);
    ctx.stroke();
  } else if (kind === 'light') {
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(x - 4, y - 4);
    ctx.lineTo(x + 4, y + 4);
    ctx.moveTo(x + 4, y - 4);
    ctx.lineTo(x - 4, y + 4);
    ctx.stroke();
    // Subtle glow when selected.
    if (selected) {
      ctx.save();
      ctx.globalAlpha = 0.25;
      ctx.fillStyle = colors.accent;
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  } else if (kind === 'smoke') {
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.font = 'bold 7px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SD', x, y);
  } else if (kind === 'fan') {
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.font = 'bold 7px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('F', x, y);
  } else if (isReceptacle(kind)) {
    ctx.beginPath();
    ctx.rect(x - 6, y - 5, 12, 10);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = color;
    if (kind === 'receptacle-gfci' || kind === 'receptacle-wr') {
      ctx.font = 'bold 6px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(kind === 'receptacle-gfci' ? 'G' : 'WR', x, y);
    } else if (kind === 'receptacle-240') {
      ctx.font = 'bold 6px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('240', x, y);
    } else {
      ctx.fillRect(x - 3, y - 3, 1, 6);
      ctx.fillRect(x + 2, y - 3, 1, 6);
    }
  }

  if (violated) {
    ctx.fillStyle = colors.pink;
    ctx.beginPath();
    ctx.arc(x + 8, y - 8, 2.4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawBreakerRow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  b: Breaker,
  selected: boolean,
  hovered: boolean,
  anchor: boolean,
  violated: boolean,
  colors: ThemeColors,
) {
  const stripColor = breakerStripColor(b.kind, colors);

  // Background tint for active states.
  if (violated) {
    ctx.fillStyle = withAlpha(colors.pink, 0.08);
    roundRect(ctx, x, y, w, h, 2);
    ctx.fill();
  } else if (selected) {
    ctx.fillStyle = colors.accentSoft;
    roundRect(ctx, x, y, w, h, 2);
    ctx.fill();
  } else if (anchor) {
    ctx.fillStyle = withAlpha(colors.teal, 0.08);
    roundRect(ctx, x, y, w, h, 2);
    ctx.fill();
  }

  // Left accent bar.
  if (selected || violated || anchor) {
    ctx.fillStyle = selected ? colors.accent : violated ? colors.pink : colors.teal;
    ctx.fillRect(x, y + 5, 2, h - 10);
  }

  // Label (left).
  ctx.fillStyle = selected || hovered ? colors.text : colors.textDim;
  ctx.font = '11px "DM Sans", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(shortBreakerLabel(b), x + 8, y + h / 2);

  // Right side: colored dot + amp value.
  const ampText = `${BREAKER_AMPS[b.kind]}A`;
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  const textW = ctx.measureText(ampText).width;

  // Colored dot.
  ctx.fillStyle = stripColor;
  ctx.beginPath();
  ctx.arc(x + w - 6 - textW - 6, y + h / 2, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Amp text.
  ctx.fillStyle = colors.text;
  ctx.fillText(ampText, x + w - 4, y + h / 2);

  // Dashed bottom border (like .hw-readout-row).
  ctx.strokeStyle = colors.border;
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(x, y + h - 0.5);
  ctx.lineTo(x + w, y + h - 0.5);
  ctx.stroke();
  ctx.setLineDash([]);
}

function breakerStripColor(k: BreakerKind, colors: ThemeColors): string {
  if (k === 'gfci-15' || k === 'gfci-20') return colors.blue;
  if (k === 'afci-15' || k === 'afci-20') return colors.accent;
  if (k === 'dfci-15' || k === 'dfci-20') return colors.teal;
  if (k === 'dp-30' || k === 'dp-40' || k === 'dp-50') return colors.pink;
  return colors.textMuted;
}

function shortBreakerLabel(b: Breaker): string {
  const aMap: Record<BreakerKind, number> = {
    'std-15': 15,
    'std-20': 20,
    'afci-15': 15,
    'afci-20': 20,
    'gfci-15': 15,
    'gfci-20': 20,
    'dfci-15': 15,
    'dfci-20': 20,
    'dp-30': 30,
    'dp-40': 40,
    'dp-50': 50,
  };
  const a = aMap[b.kind];
  const tag =
    b.kind === 'dfci-15' || b.kind === 'dfci-20'
      ? 'DFCI'
      : b.kind === 'afci-15' || b.kind === 'afci-20'
        ? 'AFCI'
        : b.kind === 'gfci-15' || b.kind === 'gfci-20'
          ? 'GFCI'
          : b.kind === 'dp-30' || b.kind === 'dp-40' || b.kind === 'dp-50'
            ? '2P'
            : 'STD';
  if (b.label) return `${a}A ${tag} ${truncate(b.label, 10)}`;
  return `${a}A ${tag}`;
}

function truncate(s: string, n: number): string {
  return s.length <= n ? s : s.slice(0, n - 1) + '…';
}

function cableStrokeColor(k: CableKind, colors: ThemeColors): string {
  if (k === 'nm-14-2') return withAlpha(colors.textDim, 0.45);
  if (k === 'nm-12-2') return withAlpha(colors.accent, 0.55);
  if (k === 'nm-10-3') return withAlpha(colors.accent, 0.65);
  if (k === 'nm-8-3') return withAlpha(colors.teal, 0.65);
  if (k === 'nm-6-3') return withAlpha(colors.pink, 0.6);
  return withAlpha(colors.textDim, 0.45);
}

/** Convert any hex / rgb / rgba string to rgba with the given alpha. */
function withAlpha(color: string, alpha: number): string {
  if (color.startsWith('rgba(')) {
    return color.replace(
      /rgba\(([^,]+),\s*([^,]+),\s*([^,]+),\s*[^)]+\)/,
      `rgba($1,$2,$3,${alpha})`,
    );
  }
  if (color.startsWith('rgb(')) {
    return color.replace(/rgb\(([^)]+)\)/, `rgba($1,${alpha})`);
  }
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  return color;
}

/** Draw a rounded rectangle path (does not stroke/fill). */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.arcTo(x + w, y, x + w, y + rr, rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.arcTo(x + w, y + h, x + w - rr, y + h, rr);
  ctx.lineTo(x + rr, y + h);
  ctx.arcTo(x, y + h, x, y + h - rr, rr);
  ctx.lineTo(x, y + rr);
  ctx.arcTo(x, y, x + rr, y, rr);
  ctx.closePath();
}

function isDeviceKind(k: string): k is DeviceKind {
  return (
    k === 'receptacle' ||
    k === 'receptacle-gfci' ||
    k === 'receptacle-tr' ||
    k === 'receptacle-wr' ||
    k === 'receptacle-240' ||
    k === 'switch' ||
    k === 'light' ||
    k === 'smoke' ||
    k === 'fan'
  );
}
function isBreakerKind(k: string): k is BreakerKind {
  return (
    k === 'std-15' ||
    k === 'std-20' ||
    k === 'afci-15' ||
    k === 'afci-20' ||
    k === 'gfci-15' ||
    k === 'gfci-20' ||
    k === 'dfci-15' ||
    k === 'dfci-20' ||
    k === 'dp-30' ||
    k === 'dp-40' ||
    k === 'dp-50'
  );
}

// Keeping unused imports satisfied for tsc strict.
export type { Cable, Breaker };
