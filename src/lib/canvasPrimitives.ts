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
  ctx.strokeStyle = options.color ?? 'rgba(255,255,255,0.55)';
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
  ctx.strokeStyle = options.color ?? 'rgba(255,107,42,0.95)';
  ctx.lineWidth = options.lineWidth ?? 1.6;
  ctx.lineCap = options.lineCap ?? 'round';
  ctx.lineJoin = options.lineJoin ?? 'round';
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  for (let i = 0; i < segments; i++) {
    const along = (i + 0.5) * step;
    const normal = i % 2 === 0 ? -amplitude : amplitude;
    ctx.lineTo(
      start.x + ux * along + nx * normal,
      start.y + uy * along + ny * normal,
    );
  }
  ctx.lineTo(end.x, end.y);
  ctx.stroke();

  if (options.label) {
    const cx = (start.x + end.x) / 2;
    const cy = (start.y + end.y) / 2;
    const offset = options.labelOffset ?? { x: nx * -18, y: ny * -18 };
    ctx.fillStyle = options.labelColor ?? options.color ?? '#ff6b2a';
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
  ctx.strokeStyle = options.color ?? 'rgba(91,174,248,0.95)';
  ctx.fillStyle = options.fillColor ?? options.color ?? 'rgba(91,174,248,0.95)';
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
  const sign = options.sign ?? '+';
  const color = options.color ?? (sign === '+' ? '#ff3b6e' : '#5baef8');
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

  ctx.fillStyle = options.textColor ?? '#0a0a0b';
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
  const wireColor = options.color ?? 'rgba(255,255,255,0.65)';
  const positiveColor = options.positiveColor ?? '#ff3b6e';
  const negativeColor = options.negativeColor ?? '#5baef8';

  ctx.save();
  ctx.lineCap = 'round';
  if (vertical) {
    drawWire(ctx, [
      { x: center.x, y: center.y - leadLength },
      { x: center.x, y: center.y - plateGap },
    ], { color: wireColor });
    drawWire(ctx, [
      { x: center.x, y: center.y + plateGap },
      { x: center.x, y: center.y + leadLength },
    ], { color: wireColor });
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
    drawWire(ctx, [
      { x: center.x - leadLength, y: center.y },
      { x: center.x - plateGap, y: center.y },
    ], { color: wireColor });
    drawWire(ctx, [
      { x: center.x + plateGap, y: center.y },
      { x: center.x + leadLength, y: center.y },
    ], { color: wireColor });
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
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
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
  const color = options.color ?? 'rgba(108,197,194,0.95)';
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

export function drawSwitch(
  ctx: CanvasRenderingContext2D,
  center: CanvasPoint,
  options: SwitchOptions = {},
) {
  const color = options.color ?? 'rgba(255,107,42,0.95)';
  const terminalGap = options.terminalGap ?? 24;
  const state = options.state ?? 'closed';
  const left = { x: center.x - terminalGap / 2, y: center.y };
  const right = { x: center.x + terminalGap / 2, y: center.y };
  const bladeEnd = state === 'closed'
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
    ctx.fillStyle = 'rgba(160,158,149,0.85)';
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = offset.y < 0 ? 'bottom' : 'top';
    ctx.fillText(options.label, center.x + offset.x, center.y + offset.y);
  }

  ctx.restore();
}
