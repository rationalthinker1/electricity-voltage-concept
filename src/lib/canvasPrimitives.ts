import { getCanvasColors } from './canvasTheme';

export interface CanvasPoint {
  x: number;
  y: number;
}

interface WireOptions {
  color?: string;
  lineWidth?: number;
  lineCap?: CanvasLineCap;
  lineJoin?: CanvasLineJoin;
}

interface ResistorOptions extends WireOptions {
  amplitude?: number;
  segments?: number;
  label?: string;
  labelColor?: string;
  labelOffset?: CanvasPoint;
}

interface ArrowOptions extends WireOptions {
  headLength?: number;
  headWidth?: number;
  fillColor?: string;
}

interface ChargeOptions {
  color?: string;
  fillColor?: string;
  label?: string;
  labelColor?: string;
  magnitudeLabel?: string;
  radius?: number;
  sign?: '+' | '-' | '−';
  textColor?: string;
  glow?: boolean;
}

interface BatteryOptions {
  color?: string;
  label?: string;
  labelOffset?: CanvasPoint;
  leadLength?: number;
  negativeColor?: string;
  negativePlateLength?: number;
  orientation?: 'vertical' | 'horizontal';
  plateGap?: number;
  positiveColor?: string;
  positivePlateLength?: number;
}

interface CurrentSourceOptions {
  color?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
  label?: string;
  labelOffset?: CanvasPoint;
  radius?: number;
}

interface SwitchOptions {
  color?: string;
  label?: string;
  labelOffset?: CanvasPoint;
  state?: 'closed' | 'open-up' | 'open-down';
  terminalGap?: number;
}

export function drawWire(
  ctx: CanvasRenderingContext2D,
  points: CanvasPoint[],
  options: WireOptions = {},
) {
  if (points.length < 2) return;

  ctx.save();
  ctx.strokeStyle = options.color ?? getCanvasColors().textDim;
  ctx.lineWidth = options.lineWidth ?? 1.5;
  ctx.lineCap = options.lineCap ?? 'round';
  ctx.lineJoin = options.lineJoin ?? 'round';
  ctx.beginPath();
  ctx.moveTo(points[0]!.x, points[0]!.y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i]!.x, points[i]!.y);
  }
  ctx.stroke();
  ctx.restore();
}

export function drawResistor(
  ctx: CanvasRenderingContext2D,
  start: CanvasPoint,
  end: CanvasPoint,
  options: ResistorOptions = {},
) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.hypot(dx, dy);
  if (length <= 0) return;

  const ux = dx / length;
  const uy = dy / length;
  const nx = -uy;
  const ny = ux;
  const segments = options.segments ?? 6;
  const amplitude = options.amplitude ?? 7;
  const step = length / segments;

  ctx.save();
  ctx.strokeStyle = options.color ?? getCanvasColors().accent;
  ctx.lineWidth = options.lineWidth ?? 1.6;
  ctx.lineCap = options.lineCap ?? 'round';
  ctx.lineJoin = options.lineJoin ?? 'round';
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  for (let i = 0; i < segments; i++) {
    const along = (i + 0.5) * step;
    const normal = i % 2 === 0 ? -amplitude : amplitude;
    ctx.lineTo(start.x + ux * along + nx * normal, start.y + uy * along + ny * normal);
  }
  ctx.lineTo(end.x, end.y);
  ctx.stroke();

  if (options.label) {
    const cx = (start.x + end.x) / 2;
    const cy = (start.y + end.y) / 2;
    const offset = options.labelOffset ?? { x: nx * -18, y: ny * -18 };
    ctx.fillStyle = options.labelColor ?? options.color ?? getCanvasColors().accent;
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = Math.abs(dx) < Math.abs(dy) ? 'left' : 'center';
    ctx.textBaseline = Math.abs(dx) < Math.abs(dy) ? 'middle' : 'bottom';
    ctx.fillText(options.label, cx + offset.x, cy + offset.y);
  }

  ctx.restore();
}

export function drawArrow(
  ctx: CanvasRenderingContext2D,
  from: CanvasPoint,
  to: CanvasPoint,
  options: ArrowOptions = {},
) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy);
  if (length <= 0) return;

  const ux = dx / length;
  const uy = dy / length;
  const nx = -uy;
  const ny = ux;
  const headLength = options.headLength ?? 8;
  const headWidth = options.headWidth ?? 5;

  ctx.save();
  ctx.strokeStyle = options.color ?? getCanvasColors().blue;
  ctx.fillStyle = options.fillColor ?? options.color ?? getCanvasColors().blue;
  ctx.lineWidth = options.lineWidth ?? 1.6;
  ctx.lineCap = options.lineCap ?? 'round';
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(to.x, to.y);
  ctx.lineTo(to.x - ux * headLength + nx * headWidth, to.y - uy * headLength + ny * headWidth);
  ctx.lineTo(to.x - ux * headLength - nx * headWidth, to.y - uy * headLength - ny * headWidth);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function drawCharge(
  ctx: CanvasRenderingContext2D,
  center: CanvasPoint,
  options: ChargeOptions = {},
) {
  const colors = getCanvasColors();
  const sign = options.sign ?? '+';
  const color = options.color ?? (sign === '+' ? colors.pink : colors.blue);
  const radius = options.radius ?? 16;

  ctx.save();
  if (options.glow ?? true) {
    const glow = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, radius * 2.2);
    glow.addColorStop(0, color);
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius * 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  ctx.fillStyle = options.fillColor ?? color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = options.textColor ?? colors.bg;
  ctx.font = `bold ${Math.round(radius * 1.1)}px "JetBrains Mono", monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(sign, center.x, center.y + 1);

  if (options.label || options.magnitudeLabel) {
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textBaseline = 'top';
    ctx.fillStyle = options.labelColor ?? color;
    const text = [options.label, options.magnitudeLabel].filter(Boolean).join(' ');
    ctx.fillText(text, center.x, center.y + radius + 8);
  }

  ctx.restore();
}

export function drawBattery(
  ctx: CanvasRenderingContext2D,
  center: CanvasPoint,
  options: BatteryOptions = {},
) {
  const vertical = (options.orientation ?? 'vertical') === 'vertical';
  const leadLength = options.leadLength ?? 50;
  const plateGap = options.plateGap ?? 14;
  const positivePlateLength = options.positivePlateLength ?? 28;
  const negativePlateLength = options.negativePlateLength ?? 16;
  const colors = getCanvasColors();
  const wireColor = options.color ?? colors.textDim;
  const positiveColor = options.positiveColor ?? colors.pink;
  const negativeColor = options.negativeColor ?? colors.blue;

  ctx.save();
  ctx.lineCap = 'round';
  if (vertical) {
    drawWire(
      ctx,
      [
        { x: center.x, y: center.y - leadLength },
        { x: center.x, y: center.y - plateGap },
      ],
      { color: wireColor },
    );
    drawWire(
      ctx,
      [
        { x: center.x, y: center.y + plateGap },
        { x: center.x, y: center.y + leadLength },
      ],
      { color: wireColor },
    );
    ctx.strokeStyle = positiveColor;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(center.x - positivePlateLength / 2, center.y - plateGap);
    ctx.lineTo(center.x + positivePlateLength / 2, center.y - plateGap);
    ctx.stroke();
    ctx.strokeStyle = negativeColor;
    ctx.beginPath();
    ctx.moveTo(center.x - negativePlateLength / 2, center.y + plateGap);
    ctx.lineTo(center.x + negativePlateLength / 2, center.y + plateGap);
    ctx.stroke();
  } else {
    drawWire(
      ctx,
      [
        { x: center.x - leadLength, y: center.y },
        { x: center.x - plateGap, y: center.y },
      ],
      { color: wireColor },
    );
    drawWire(
      ctx,
      [
        { x: center.x + plateGap, y: center.y },
        { x: center.x + leadLength, y: center.y },
      ],
      { color: wireColor },
    );
    ctx.strokeStyle = positiveColor;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(center.x - plateGap, center.y - positivePlateLength / 2);
    ctx.lineTo(center.x - plateGap, center.y + positivePlateLength / 2);
    ctx.stroke();
    ctx.strokeStyle = negativeColor;
    ctx.beginPath();
    ctx.moveTo(center.x + plateGap, center.y - negativePlateLength / 2);
    ctx.lineTo(center.x + plateGap, center.y + negativePlateLength / 2);
    ctx.stroke();
  }

  if (options.label) {
    const offset = options.labelOffset ?? (vertical ? { x: -18, y: 0 } : { x: 0, y: -18 });
    ctx.fillStyle = colors.text;
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = vertical && offset.x < 0 ? 'right' : 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(options.label, center.x + offset.x, center.y + offset.y);
  }

  ctx.restore();
}
export function drawCurrentSource(
  ctx: CanvasRenderingContext2D,
  center: CanvasPoint,
  options: CurrentSourceOptions = {},
) {
  const radius = options.radius ?? 14;
  const color = options.color ?? getCanvasColors().teal;
  const direction = options.direction ?? 'up';
  const dirs = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
  } satisfies Record<string, CanvasPoint>;
  const d = dirs[direction];
  const start = { x: center.x - d.x * radius * 0.5, y: center.y - d.y * radius * 0.5 };
  const end = { x: center.x + d.x * radius * 0.5, y: center.y + d.y * radius * 0.5 };

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
  ctx.stroke();
  drawArrow(ctx, start, end, { color, lineWidth: 1.6, headLength: 6, headWidth: 4 });

  if (options.label) {
    const offset = options.labelOffset ?? { x: 0, y: -radius - 8 };
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.textAlign = offset.x < 0 ? 'right' : offset.x > 0 ? 'left' : 'center';
    ctx.textBaseline = offset.y < 0 ? 'bottom' : 'top';
    ctx.fillText(options.label, center.x + offset.x, center.y + offset.y);
  }

  ctx.restore();
}

interface CapacitorOptions extends WireOptions {
  plateLength?: number;
  plateGap?: number;
  label?: string;
  labelOffset?: CanvasPoint;
  labelColor?: string;
}

interface InductorOptions extends WireOptions {
  loops?: number;
  amplitude?: number;
  label?: string;
  labelOffset?: CanvasPoint;
  labelColor?: string;
}

interface BulbOptions {
  color?: string;
  glowColor?: string;
  radius?: number;
  brightness?: number;
  label?: string;
  labelColor?: string;
  labelOffset?: CanvasPoint;
}

interface GroundOptions {
  color?: string;
  size?: number;
  /** Which way the ground prong faces. */
  orientation?: 'down' | 'up' | 'left' | 'right';
  /** Lead from the connect point to the ground triple-bar. */
  leadLength?: number;
}

interface NodeDotOptions {
  color?: string;
  radius?: number;
  label?: string;
  labelColor?: string;
  labelOffset?: CanvasPoint;
}

interface VoltmeterOptions {
  color?: string;
  radius?: number;
  label?: string;
  labelColor?: string;
  reading?: string;
  /** Where to attach leads (probe points). If given, two short leads are drawn from the meter circle to these points. */
  leads?: [CanvasPoint, CanvasPoint];
}

export function drawCapacitor(
  ctx: CanvasRenderingContext2D,
  start: CanvasPoint,
  end: CanvasPoint,
  options: CapacitorOptions = {},
) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.hypot(dx, dy);
  if (length <= 0) return;
  const ux = dx / length;
  const uy = dy / length;
  const nx = -uy;
  const ny = ux;
  const plateLength = options.plateLength ?? 18;
  const plateGap = options.plateGap ?? 6;
  const mid = length / 2;

  ctx.save();
  ctx.strokeStyle = options.color ?? getCanvasColors().teal;
  ctx.lineWidth = options.lineWidth ?? 1.6;
  ctx.lineCap = options.lineCap ?? 'round';
  // Lead in.
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(start.x + ux * (mid - plateGap), start.y + uy * (mid - plateGap));
  ctx.stroke();
  // First plate.
  const p1x = start.x + ux * (mid - plateGap);
  const p1y = start.y + uy * (mid - plateGap);
  ctx.beginPath();
  ctx.moveTo(p1x + (nx * plateLength) / 2, p1y + (ny * plateLength) / 2);
  ctx.lineTo(p1x - (nx * plateLength) / 2, p1y - (ny * plateLength) / 2);
  ctx.stroke();
  // Second plate.
  const p2x = start.x + ux * (mid + plateGap);
  const p2y = start.y + uy * (mid + plateGap);
  ctx.beginPath();
  ctx.moveTo(p2x + (nx * plateLength) / 2, p2y + (ny * plateLength) / 2);
  ctx.lineTo(p2x - (nx * plateLength) / 2, p2y - (ny * plateLength) / 2);
  ctx.stroke();
  // Lead out.
  ctx.beginPath();
  ctx.moveTo(p2x, p2y);
  ctx.lineTo(end.x, end.y);
  ctx.stroke();

  if (options.label) {
    const cx = (start.x + end.x) / 2;
    const cy = (start.y + end.y) / 2;
    const offset = options.labelOffset ?? { x: nx * -18, y: ny * -18 };
    ctx.fillStyle = options.labelColor ?? options.color ?? getCanvasColors().teal;
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = Math.abs(dx) < Math.abs(dy) ? 'left' : 'center';
    ctx.textBaseline = Math.abs(dx) < Math.abs(dy) ? 'middle' : 'bottom';
    ctx.fillText(options.label, cx + offset.x, cy + offset.y);
  }
  ctx.restore();
}

export function drawInductor(
  ctx: CanvasRenderingContext2D,
  start: CanvasPoint,
  end: CanvasPoint,
  options: InductorOptions = {},
) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.hypot(dx, dy);
  if (length <= 0) return;
  const ux = dx / length;
  const uy = dy / length;
  const nx = -uy;
  const ny = ux;
  const loops = options.loops ?? 4;
  const amplitude = options.amplitude ?? 6;
  const coilLength = Math.min(length * 0.7, loops * amplitude * 2);
  const leadLength = (length - coilLength) / 2;

  ctx.save();
  ctx.strokeStyle = options.color ?? getCanvasColors().teal;
  ctx.lineWidth = options.lineWidth ?? 1.6;
  ctx.lineCap = options.lineCap ?? 'round';
  // Lead in.
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  const c0x = start.x + ux * leadLength;
  const c0y = start.y + uy * leadLength;
  ctx.lineTo(c0x, c0y);
  // Loops as semicircles bowing outward.
  const step = coilLength / loops;
  for (let i = 0; i < loops; i++) {
    const bx = c0x + ux * step * i;
    const by = c0y + uy * step * i;
    const ex = c0x + ux * step * (i + 1);
    const ey = c0y + uy * step * (i + 1);
    // Bezier arc bowing along normal direction.
    ctx.bezierCurveTo(
      bx + nx * amplitude,
      by + ny * amplitude,
      ex + nx * amplitude,
      ey + ny * amplitude,
      ex,
      ey,
    );
  }
  // Lead out.
  ctx.lineTo(end.x, end.y);
  ctx.stroke();

  if (options.label) {
    const cx = (start.x + end.x) / 2;
    const cy = (start.y + end.y) / 2;
    const offset = options.labelOffset ?? { x: nx * -20, y: ny * -20 };
    ctx.fillStyle = options.labelColor ?? options.color ?? getCanvasColors().teal;
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = Math.abs(dx) < Math.abs(dy) ? 'left' : 'center';
    ctx.textBaseline = Math.abs(dx) < Math.abs(dy) ? 'middle' : 'bottom';
    ctx.fillText(options.label, cx + offset.x, cy + offset.y);
  }
  ctx.restore();
}

export function drawBulb(
  ctx: CanvasRenderingContext2D,
  center: CanvasPoint,
  options: BulbOptions = {},
) {
  const radius = options.radius ?? 16;
  const brightness = Math.max(0, Math.min(1, options.brightness ?? 0));
  const colors = getCanvasColors();
  const baseColor = options.color ?? colors.textDim;
  const glowColor = options.glowColor ?? '#ffcc55';

  ctx.save();
  if (brightness > 0) {
    const grd = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, radius * 3.5);
    grd.addColorStop(0, hexToRgba(glowColor, 0.5 * brightness));
    grd.addColorStop(1, hexToRgba(glowColor, 0));
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius * 3.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = brightness > 0 ? glowColor : baseColor;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
  ctx.stroke();
  // Filament zigzag.
  ctx.strokeStyle = brightness > 0 ? colors.accent : baseColor;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(center.x - radius * 0.55, center.y + radius * 0.28);
  ctx.lineTo(center.x - radius * 0.25, center.y - radius * 0.28);
  ctx.lineTo(center.x, center.y + radius * 0.28);
  ctx.lineTo(center.x + radius * 0.25, center.y - radius * 0.28);
  ctx.lineTo(center.x + radius * 0.55, center.y + radius * 0.28);
  ctx.stroke();

  if (options.label) {
    const offset = options.labelOffset ?? { x: 0, y: radius + 14 };
    ctx.fillStyle = options.labelColor ?? colors.textDim;
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(options.label, center.x + offset.x, center.y + offset.y);
  }
  ctx.restore();
}

export function drawGround(
  ctx: CanvasRenderingContext2D,
  at: CanvasPoint,
  options: GroundOptions = {},
) {
  const orientation = options.orientation ?? 'down';
  const size = options.size ?? 10;
  const lead = options.leadLength ?? 8;
  const color = options.color ?? getCanvasColors().textDim;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  const dirs = {
    down: { ux: 0, uy: 1, nx: 1, ny: 0 },
    up: { ux: 0, uy: -1, nx: 1, ny: 0 },
    left: { ux: -1, uy: 0, nx: 0, ny: 1 },
    right: { ux: 1, uy: 0, nx: 0, ny: 1 },
  } as const;
  const { ux, uy, nx, ny } = dirs[orientation];
  // Lead.
  ctx.beginPath();
  ctx.moveTo(at.x, at.y);
  ctx.lineTo(at.x + ux * lead, at.y + uy * lead);
  ctx.stroke();
  // Three diminishing horizontal bars.
  for (let i = 0; i < 3; i++) {
    const w = size * (1 - i * 0.3);
    const cx = at.x + ux * (lead + i * 3);
    const cy = at.y + uy * (lead + i * 3);
    ctx.beginPath();
    ctx.moveTo(cx + (nx * w) / 2, cy + (ny * w) / 2);
    ctx.lineTo(cx - (nx * w) / 2, cy - (ny * w) / 2);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawNodeDot(
  ctx: CanvasRenderingContext2D,
  at: CanvasPoint,
  options: NodeDotOptions = {},
) {
  const colors = getCanvasColors();
  const radius = options.radius ?? 3.5;
  const color = options.color ?? colors.text;
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(at.x, at.y, radius, 0, Math.PI * 2);
  ctx.fill();
  if (options.label) {
    const offset = options.labelOffset ?? { x: radius + 4, y: -radius - 4 };
    ctx.fillStyle = options.labelColor ?? color;
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = offset.x < 0 ? 'right' : 'left';
    ctx.textBaseline = offset.y < 0 ? 'bottom' : 'top';
    ctx.fillText(options.label, at.x + offset.x, at.y + offset.y);
  }
  ctx.restore();
}

export function drawVoltmeter(
  ctx: CanvasRenderingContext2D,
  center: CanvasPoint,
  options: VoltmeterOptions = {},
) {
  const colors = getCanvasColors();
  const radius = options.radius ?? 12;
  const color = options.color ?? colors.teal;
  ctx.save();
  if (options.leads) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.2;
    for (const lead of options.leads) {
      // Stop the lead at the meter's edge so it visibly enters the circle.
      const dx = lead.x - center.x;
      const dy = lead.y - center.y;
      const dist = Math.hypot(dx, dy);
      if (dist <= radius) continue;
      const sx = center.x + (dx / dist) * radius;
      const sy = center.y + (dy / dist) * radius;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(lead.x, lead.y);
      ctx.stroke();
    }
  }
  ctx.strokeStyle = color;
  ctx.fillStyle = colors.bg;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.font = `bold ${Math.round(radius * 0.85)}px "JetBrains Mono", monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('V', center.x, center.y + 0.5);

  if (options.reading) {
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textBaseline = 'top';
    ctx.fillText(options.reading, center.x, center.y + radius + 4);
  }
  if (options.label) {
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillStyle = options.labelColor ?? color;
    ctx.textBaseline = 'bottom';
    ctx.fillText(options.label, center.x, center.y - radius - 4);
  }
  ctx.restore();
}

function hexToRgba(color: string, alpha: number): string {
  // Accept #rrggbb or rgb(...) or rgba(...). For simplicity, only handle #rrggbb;
  // any other format passes through with alpha appended via the colour-mix approach
  // breaks gracefully — the caller already has alpha control via brightness.
  if (color.startsWith('#') && color.length === 7) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  return color;
}

export function drawSwitch(
  ctx: CanvasRenderingContext2D,
  center: CanvasPoint,
  options: SwitchOptions = {},
) {
  const color = options.color ?? getCanvasColors().accent;
  const terminalGap = options.terminalGap ?? 24;
  const state = options.state ?? 'closed';
  const left = { x: center.x - terminalGap / 2, y: center.y };
  const right = { x: center.x + terminalGap / 2, y: center.y };
  const bladeEnd =
    state === 'closed'
      ? right
      : { x: right.x - 2, y: center.y + (state === 'open-down' ? 18 : -18) };

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(left.x, left.y, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(right.x, right.y, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(left.x, left.y);
  ctx.lineTo(bladeEnd.x, bladeEnd.y);
  ctx.stroke();

  if (options.label) {
    const offset = options.labelOffset ?? { x: 0, y: -22 };
    ctx.fillStyle = getCanvasColors().textDim;
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = offset.y < 0 ? 'bottom' : 'top';
    ctx.fillText(options.label, center.x + offset.x, center.y + offset.y);
  }

  ctx.restore();
}

/* ───────────────────────────────────────────────────────────────────────────
 *  drawCircuit — declarative one-shot schematic renderer.
 *
 *  Pass an array of typed elements; each is rendered in order. Wires accept a
 *  polyline (any number of points). Components are positioned at canvas
 *  coordinates exactly as written — no implicit layout, no grid snapping.
 *
 *  The element types are intentionally a small, common subset. For anything
 *  exotic (curved field lines, animated arrows, etc.), call the lower-level
 *  primitive directly after drawCircuit.
 * ─────────────────────────────────────────────────────────────────────── */

export type CircuitElement =
  | ({ kind: 'wire'; points: CanvasPoint[] } & WireOptions)
  | ({ kind: 'resistor'; from: CanvasPoint; to: CanvasPoint } & ResistorOptions)
  | ({ kind: 'capacitor'; from: CanvasPoint; to: CanvasPoint } & CapacitorOptions)
  | ({ kind: 'inductor'; from: CanvasPoint; to: CanvasPoint } & InductorOptions)
  | ({ kind: 'battery'; at: CanvasPoint } & BatteryOptions)
  | ({ kind: 'currentSource'; at: CanvasPoint } & CurrentSourceOptions)
  | ({ kind: 'switch'; at: CanvasPoint } & SwitchOptions)
  | ({ kind: 'bulb'; at: CanvasPoint } & BulbOptions)
  | ({ kind: 'ground'; at: CanvasPoint } & GroundOptions)
  | ({ kind: 'node'; at: CanvasPoint } & NodeDotOptions)
  | ({ kind: 'voltmeter'; at: CanvasPoint } & VoltmeterOptions)
  | ({ kind: 'charge'; at: CanvasPoint } & ChargeOptions)
  | ({ kind: 'arrow'; from: CanvasPoint; to: CanvasPoint } & ArrowOptions);

export interface CircuitSpec {
  elements: CircuitElement[];
  /** Default colour applied to any `wire` element that doesn't set its own. */
  defaultWireColor?: string;
  /** Default line width applied to any `wire` element that doesn't set its own. */
  defaultWireWidth?: number;
}

export function drawCircuit(ctx: CanvasRenderingContext2D, spec: CircuitSpec): void {
  const wireColor = spec.defaultWireColor ?? getCanvasColors().textDim;
  const wireWidth = spec.defaultWireWidth ?? 1.4;
  for (const el of spec.elements) {
    switch (el.kind) {
      case 'wire':
        drawWire(ctx, el.points, {
          color: el.color ?? wireColor,
          lineWidth: el.lineWidth ?? wireWidth,
          lineCap: el.lineCap,
          lineJoin: el.lineJoin,
        });
        break;
      case 'resistor':
        drawResistor(ctx, el.from, el.to, el);
        break;
      case 'capacitor':
        drawCapacitor(ctx, el.from, el.to, el);
        break;
      case 'inductor':
        drawInductor(ctx, el.from, el.to, el);
        break;
      case 'battery':
        drawBattery(ctx, el.at, el);
        break;
      case 'currentSource':
        drawCurrentSource(ctx, el.at, el);
        break;
      case 'switch':
        drawSwitch(ctx, el.at, el);
        break;
      case 'bulb':
        drawBulb(ctx, el.at, el);
        break;
      case 'ground':
        drawGround(ctx, el.at, el);
        break;
      case 'node':
        drawNodeDot(ctx, el.at, el);
        break;
      case 'voltmeter':
        drawVoltmeter(ctx, el.at, el);
        break;
      case 'charge':
        drawCharge(ctx, el.at, el);
        break;
      case 'arrow':
        drawArrow(ctx, el.from, el.to, el);
        break;
    }
  }
}

/* ───────────────────────────────────────────────────────────────────────────
 *  renderCircuitToCanvas — pre-render a CircuitSpec to an offscreen canvas.
 *
 *  Per MDN's canvas optimisation guide, the biggest single win for a static
 *  schematic that's redrawn every frame is to bake it once into an offscreen
 *  HTMLCanvasElement, then drawImage() that onto the visible canvas each tick.
 *  The expensive part — many beginPath/stroke calls, gradient fills, label
 *  measurements — runs once at the resolution the screen will read it at.
 *
 *  Returns an HTMLCanvasElement (not OffscreenCanvas — Safari ≤16 lacks 2d
 *  context support on OffscreenCanvas in workers, and we don't need the
 *  worker affordance here). The returned canvas is at backing-store size
 *  (w·dpr × h·dpr); drawImage with the CSS-pixel dimensions to display it.
 * ─────────────────────────────────────────────────────────────────────── */

export function renderCircuitToCanvas(
  spec: CircuitSpec,
  w: number,
  h: number,
  dpr = 1,
): HTMLCanvasElement {
  const off = document.createElement('canvas');
  off.width = Math.max(1, Math.floor(w * dpr));
  off.height = Math.max(1, Math.floor(h * dpr));
  const ctx = off.getContext('2d');
  if (!ctx) return off;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  drawCircuit(ctx, spec);
  return off;
}

/* ───────────────────────────────────────────────────────────────────────────
 *  drawGlowPath — fast glowing polyline without ctx.shadowBlur.
 *
 *  shadowBlur is implemented as a software-side gaussian on every browser and
 *  costs ~3-10x more than a plain stroke for the same path. For animated
 *  paths that need a glow halo, the cheaper trick is:
 *    1. Stroke the path once at a wider lineWidth with a translucent colour
 *       (the "bleed").
 *    2. Stroke it again at the normal lineWidth with the saturated colour.
 *  The result reads as a soft halo at a fraction of the GPU cost.
 *
 *  Use this anywhere you would have set shadowBlur on a moving polyline —
 *  current-flow indicators, wave packets, traces on an oscilloscope, the
 *  energised loop in SwitchAndBulb, etc.
 * ─────────────────────────────────────────────────────────────────────── */

interface GlowPathOptions extends WireOptions {
  /** Outer-halo line width. Defaults to (lineWidth ?? 1.5) + 4. */
  glowWidth?: number;
  /** Outer-halo colour. Defaults to a translucent version of color. */
  glowColor?: string;
}

export function drawGlowPath(
  ctx: CanvasRenderingContext2D,
  points: CanvasPoint[],
  options: GlowPathOptions = {},
) {
  if (points.length < 2) return;
  const color = options.color ?? getCanvasColors().accent;
  const lineWidth = options.lineWidth ?? 1.5;
  const glowWidth = options.glowWidth ?? lineWidth + 4;
  const glowColor = options.glowColor ?? translucent(color, 0.35);

  ctx.save();
  ctx.lineCap = options.lineCap ?? 'round';
  ctx.lineJoin = options.lineJoin ?? 'round';
  // Outer halo first.
  ctx.strokeStyle = glowColor;
  ctx.lineWidth = glowWidth;
  ctx.beginPath();
  ctx.moveTo(points[0]!.x, points[0]!.y);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i]!.x, points[i]!.y);
  ctx.stroke();
  // Inner saturated line on top.
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  // beginPath is required so we don't double-stroke the previous fat path
  // (which would compound the halo width on top of the inner line).
  ctx.beginPath();
  ctx.moveTo(points[0]!.x, points[0]!.y);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i]!.x, points[i]!.y);
  ctx.stroke();
  ctx.restore();
}

/**
 * Best-effort opacity adjustment for an arbitrary CSS colour string.
 * Recognises #rrggbb, #rrggbbaa, rgb(...), rgba(...), and hsl(...)/hsla(...).
 * For anything else it returns the colour unchanged.
 */
function translucent(color: string, alpha: number): string {
  // #rrggbb or #rrggbbaa
  if (color.startsWith('#')) {
    if (color.length === 7) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r},${g},${b},${alpha})`;
    }
    if (color.length === 9) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r},${g},${b},${alpha})`;
    }
    return color;
  }
  // rgb(r,g,b) or rgba(r,g,b,a) — replace/inject alpha.
  const rgbMatch = color.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgbMatch) {
    return `rgba(${rgbMatch[1]},${rgbMatch[2]},${rgbMatch[3]},${alpha})`;
  }
  // hsl(...) / hsla(...) — same trick.
  const hslMatch = color.match(/^hsla?\((.+?),(.+?),(.+?)(?:,.+)?\)$/);
  if (hslMatch) {
    return `hsla(${hslMatch[1]},${hslMatch[2]},${hslMatch[3]},${alpha})`;
  }
  return color;
}
