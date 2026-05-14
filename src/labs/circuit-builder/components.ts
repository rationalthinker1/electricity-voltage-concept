/**
 * Canvas drawing routines for every component kind.
 *
 * All drawing happens in CSS pixels relative to the canvas's local origin.
 * Each draw function receives the component's pin coordinates already
 * resolved to pixel space; it knows nothing about the grid system.
 *
 * Conventions:
 *   - line width 1.5 px, color depends on hover / selected / live current
 *   - dark fill on bodies so they don't blend with wires
 *   - rotation is implicit in the direction of (p0 → p1)
 */

import type { PlacedComponent } from './types';

export const GRID_PX = 20;
/** Half-thickness of the "body" of a component perpendicular to its axis. */
const BODY_HALF = 10;

import type { ThemeColors } from '@/lib/canvasTheme';
export type { ThemeColors };

interface DrawCtx {
  ctx: CanvasRenderingContext2D;
  /** Pin0 in pixel coords. */
  p0: { x: number; y: number };
  /** Pin1 in pixel coords (or null for one-pin components). */
  p1: { x: number; y: number } | null;
  /** Visual state. */
  selected: boolean;
  hovered: boolean;
  /** Current through the component (signed, p0 → p1), used to colour active branches. */
  current: number;
  /** Voltage across the component (p0 − p1), used by AC/battery indicator. */
  voltage: number;
  /** Optional brightness override for bulbs (computed in lab). */
  brightness?: number;
  /** Theme-aware colors. */
  colors: ThemeColors;
}

/** Set stroke style based on selected/hovered/current. */
function strokeForState(ctx: CanvasRenderingContext2D, st: DrawCtx) {
  if (st.selected) ctx.strokeStyle = st.colors.accent;
  else if (st.hovered) ctx.strokeStyle = st.colors.strokeHi;
  else ctx.strokeStyle = st.colors.stroke;
  ctx.lineWidth = 1.7;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
}

/** Helper: draw a centred rectangle aligned with the (p0 → p1) axis. */
function drawBody(
  ctx: CanvasRenderingContext2D,
  p0: { x: number; y: number }, p1: { x: number; y: number },
  innerHalf: number,
  bodyHalfLen: number,
  fill: boolean | string = true,
) {
  const ax = p1.x - p0.x;
  const ay = p1.y - p0.y;
  const len = Math.hypot(ax, ay) || 1;
  const ux = ax / len, uy = ay / len;
  const cx = (p0.x + p1.x) / 2;
  const cy = (p0.y + p1.y) / 2;
  const nx = -uy, ny = ux;
  const hx = ux * bodyHalfLen, hy = uy * bodyHalfLen;
  const wx = nx * innerHalf, wy = ny * innerHalf;
  ctx.beginPath();
  ctx.moveTo(cx + hx + wx, cy + hy + wy);
  ctx.lineTo(cx + hx - wx, cy + hy - wy);
  ctx.lineTo(cx - hx - wx, cy - hy - wy);
  ctx.lineTo(cx - hx + wx, cy - hy + wy);
  ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill === true ? '#16161a' : (fill as string);
    ctx.fill();
  }
  ctx.stroke();
}

/** Lead lines from p0 and p1 to the body, given body half-length. */
function drawLeads(
  ctx: CanvasRenderingContext2D,
  p0: { x: number; y: number }, p1: { x: number; y: number },
  bodyHalfLen: number,
) {
  const ax = p1.x - p0.x;
  const ay = p1.y - p0.y;
  const len = Math.hypot(ax, ay) || 1;
  const ux = ax / len, uy = ay / len;
  const cx = (p0.x + p1.x) / 2;
  const cy = (p0.y + p1.y) / 2;
  ctx.beginPath();
  ctx.moveTo(p0.x, p0.y);
  ctx.lineTo(cx - ux * bodyHalfLen, cy - uy * bodyHalfLen);
  ctx.moveTo(cx + ux * bodyHalfLen, cy + uy * bodyHalfLen);
  ctx.lineTo(p1.x, p1.y);
  ctx.stroke();
}

/* ───────── Resistor ───────── */
function drawResistor(st: DrawCtx) {
  if (!st.p1) return;
  const { ctx, p0, p1 } = st;
  strokeForState(ctx, st);
  // Zig-zag body.
  const ax = p1.x - p0.x;
  const ay = p1.y - p0.y;
  const len = Math.hypot(ax, ay);
  const ux = ax / len, uy = ay / len;
  const nx = -uy, ny = ux;
  const cx = (p0.x + p1.x) / 2;
  const cy = (p0.y + p1.y) / 2;
  const bodyHalf = 18;
  // Leads
  drawLeads(ctx, p0, p1, bodyHalf);
  // Hidden background body for hit-area visibility
  drawBody(ctx, p0, p1, BODY_HALF, bodyHalf, st.colors.body);
  // Zig-zag
  ctx.beginPath();
  const zigCount = 6;
  for (let i = 0; i <= zigCount; i++) {
    const t = -1 + (2 * i) / zigCount;
    const px = cx + ux * t * bodyHalf;
    const py = cy + uy * t * bodyHalf;
    const off = i === 0 || i === zigCount ? 0 : (i % 2 === 0 ? -1 : 1) * 6;
    const X = px + nx * off;
    const Y = py + ny * off;
    if (i === 0) ctx.moveTo(X, Y);
    else ctx.lineTo(X, Y);
  }
  ctx.stroke();
}

/* ───────── Battery ───────── */
function drawBattery(st: DrawCtx) {
  if (!st.p1) return;
  const { ctx, p0, p1, colors } = st;
  strokeForState(ctx, st);
  const ax = p1.x - p0.x;
  const ay = p1.y - p0.y;
  const len = Math.hypot(ax, ay);
  const ux = ax / len, uy = ay / len;
  const nx = -uy, ny = ux;
  const cx = (p0.x + p1.x) / 2;
  const cy = (p0.y + p1.y) / 2;
  // Leads
  drawLeads(ctx, p0, p1, 8);
  // Long line (positive) on pin1 side, short line (negative) on pin0 side.
  // Convention: p0 = − terminal, p1 = + terminal.
  const longHalf = 12, shortHalf = 6;
  // Negative plate (pin0 side) at offset = -4
  const negCx = cx - ux * 4, negCy = cy - uy * 4;
  ctx.beginPath();
  ctx.moveTo(negCx + nx * shortHalf, negCy + ny * shortHalf);
  ctx.lineTo(negCx - nx * shortHalf, negCy - ny * shortHalf);
  ctx.stroke();
  // Positive plate (pin1 side)
  const posCx = cx + ux * 4, posCy = cy + uy * 4;
  ctx.strokeStyle = st.selected ? colors.accent : colors.pink;
  ctx.beginPath();
  ctx.moveTo(posCx + nx * longHalf, posCy + ny * longHalf);
  ctx.lineTo(posCx - nx * longHalf, posCy - ny * longHalf);
  ctx.stroke();
  // Label "+" and "−"
  ctx.fillStyle = colors.stroke;
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('−', negCx + nx * (shortHalf + 8), negCy + ny * (shortHalf + 8));
  ctx.fillText('+', posCx + nx * (longHalf + 8), posCy + ny * (longHalf + 8));
}

/* ───────── AC source ───────── */
function drawAC(st: DrawCtx) {
  if (!st.p1) return;
  const { ctx, p0, p1, colors } = st;
  strokeForState(ctx, st);
  drawLeads(ctx, p0, p1, 12);
  const cx = (p0.x + p1.x) / 2;
  const cy = (p0.y + p1.y) / 2;
  // Circle
  ctx.fillStyle = colors.body;
  ctx.beginPath(); ctx.arc(cx, cy, 12, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // Sine inside
  ctx.strokeStyle = colors.teal;
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  for (let i = -8; i <= 8; i++) {
    const x = cx + i;
    const y = cy - Math.sin(i * 0.6) * 5;
    if (i === -8) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

/* ───────── Capacitor ───────── */
function drawCapacitor(st: DrawCtx) {
  if (!st.p1) return;
  const { ctx, p0, p1 } = st;
  strokeForState(ctx, st);
  drawLeads(ctx, p0, p1, 4);
  const ax = p1.x - p0.x, ay = p1.y - p0.y;
  const len = Math.hypot(ax, ay);
  const ux = ax / len, uy = ay / len;
  const nx = -uy, ny = ux;
  const cx = (p0.x + p1.x) / 2, cy = (p0.y + p1.y) / 2;
  const half = 11;
  // Two parallel plates separated by 6 px along axis.
  for (const off of [-3, 3]) {
    const px = cx + ux * off, py = cy + uy * off;
    ctx.beginPath();
    ctx.moveTo(px + nx * half, py + ny * half);
    ctx.lineTo(px - nx * half, py - ny * half);
    ctx.stroke();
  }
}

/* ───────── Inductor ───────── */
function drawInductor(st: DrawCtx) {
  if (!st.p1) return;
  const { ctx, p0, p1 } = st;
  strokeForState(ctx, st);
  drawLeads(ctx, p0, p1, 18);
  const ax = p1.x - p0.x, ay = p1.y - p0.y;
  const len = Math.hypot(ax, ay);
  const ux = ax / len, uy = ay / len;
  const nx = -uy, ny = ux;
  const cx = (p0.x + p1.x) / 2, cy = (p0.y + p1.y) / 2;
  // Four loops along the axis.
  const loops = 4;
  const total = 32;
  ctx.beginPath();
  for (let i = 0; i < loops; i++) {
    const t = -total / 2 + (i + 0.5) * (total / loops);
    const lx = cx + ux * t;
    const ly = cy + uy * t;
    ctx.moveTo(lx - ux * 4, ly - uy * 4);
    ctx.bezierCurveTo(
      lx - ux * 4 + nx * 8, ly - uy * 4 + ny * 8,
      lx + ux * 4 + nx * 8, ly + uy * 4 + ny * 8,
      lx + ux * 4, ly + uy * 4,
    );
  }
  ctx.stroke();
}

/* ───────── Diode ───────── */
function drawDiode(st: DrawCtx) {
  if (!st.p1) return;
  const { ctx, p0, p1, colors } = st;
  strokeForState(ctx, st);
  drawLeads(ctx, p0, p1, 9);
  const ax = p1.x - p0.x, ay = p1.y - p0.y;
  const len = Math.hypot(ax, ay);
  const ux = ax / len, uy = ay / len;
  const nx = -uy, ny = ux;
  const cx = (p0.x + p1.x) / 2, cy = (p0.y + p1.y) / 2;
  // Triangle pointing from p0 (anode) to p1 (cathode).
  const tipX = cx + ux * 7, tipY = cy + uy * 7;
  const baseLx = cx - ux * 7 + nx * 8, baseLy = cy - uy * 7 + ny * 8;
  const baseRx = cx - ux * 7 - nx * 8, baseRy = cy - uy * 7 - ny * 8;
  ctx.fillStyle = colors.body;
  ctx.beginPath();
  ctx.moveTo(tipX, tipY);
  ctx.lineTo(baseLx, baseLy);
  ctx.lineTo(baseRx, baseRy);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Cathode bar.
  ctx.beginPath();
  ctx.moveTo(tipX + nx * 8, tipY + ny * 8);
  ctx.lineTo(tipX - nx * 8, tipY - ny * 8);
  ctx.stroke();
}

/* ───────── Bulb ───────── */
function drawBulb(st: DrawCtx) {
  if (!st.p1) return;
  const { ctx, p0, p1 } = st;
  strokeForState(ctx, st);
  drawLeads(ctx, p0, p1, 14);
  const cx = (p0.x + p1.x) / 2, cy = (p0.y + p1.y) / 2;
  // Brightness halo.
  const br = Math.max(0, Math.min(1, st.brightness ?? 0));
  if (br > 0.01) {
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30);
    g.addColorStop(0, `rgba(255, 220, 130, ${0.7 * br})`);
    g.addColorStop(1, 'rgba(255, 220, 130, 0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(cx, cy, 30, 0, Math.PI * 2); ctx.fill();
  }
  // Circle.
  ctx.fillStyle = st.colors.body;
  ctx.beginPath(); ctx.arc(cx, cy, 13, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // X inside (filament).
  ctx.beginPath();
  const r = 8;
  ctx.moveTo(cx - r, cy - r); ctx.lineTo(cx + r, cy + r);
  ctx.moveTo(cx + r, cy - r); ctx.lineTo(cx - r, cy + r);
  ctx.stroke();
}

/* ───────── Switch ───────── */
function drawSwitch(st: DrawCtx, open: boolean) {
  if (!st.p1) return;
  const { ctx, p0, p1, colors } = st;
  strokeForState(ctx, st);
  drawLeads(ctx, p0, p1, 10);
  const ax = p1.x - p0.x, ay = p1.y - p0.y;
  const len = Math.hypot(ax, ay);
  const ux = ax / len, uy = ay / len;
  const nx = -uy, ny = ux;
  const cx = (p0.x + p1.x) / 2, cy = (p0.y + p1.y) / 2;
  // Two contact dots.
  const lx = cx - ux * 8, ly = cy - uy * 8;
  const rx = cx + ux * 8, ry = cy + uy * 8;
  ctx.fillStyle = colors.body;
  ctx.beginPath(); ctx.arc(lx, ly, 2.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(rx, ry, 2.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // Hinge from lx,ly: either straight to rx,ry (closed) or lifted (open).
  ctx.beginPath();
  ctx.moveTo(lx, ly);
  if (open) {
    ctx.lineTo(rx + nx * 10, ry + ny * 10);
  } else {
    ctx.lineTo(rx, ry);
  }
  ctx.stroke();
}

/* ───────── Ground ───────── */
function drawGround(st: DrawCtx) {
  const { ctx, p0 } = st;
  strokeForState(ctx, st);
  // Pin lead going down for 6 px, then three horizontal bars.
  ctx.beginPath();
  ctx.moveTo(p0.x, p0.y);
  ctx.lineTo(p0.x, p0.y + 6);
  ctx.stroke();
  for (let i = 0; i < 3; i++) {
    const y = p0.y + 6 + i * 4;
    const half = 10 - i * 3;
    ctx.beginPath();
    ctx.moveTo(p0.x - half, y);
    ctx.lineTo(p0.x + half, y);
    ctx.stroke();
  }
}

/* ───────── Public dispatch ───────── */
export function drawComponent(c: PlacedComponent, st: DrawCtx) {
  switch (c.kind) {
    case 'resistor':   drawResistor(st); break;
    case 'battery':    drawBattery(st); break;
    case 'ac':         drawAC(st); break;
    case 'capacitor':  drawCapacitor(st); break;
    case 'inductor':   drawInductor(st); break;
    case 'diode':      drawDiode(st); break;
    case 'bulb':       drawBulb(st); break;
    case 'switch':     drawSwitch(st, !!c.switchOpen); break;
    case 'ground':     drawGround(st); break;
  }
  // Label.
  if (c.kind !== 'ground' && st.p1) {
    const cx = (st.p0.x + st.p1.x) / 2;
    const cy = (st.p0.y + st.p1.y) / 2;
    const dy = Math.abs(st.p1.x - st.p0.x) > Math.abs(st.p1.y - st.p0.y) ? 24 : 0;
    const dx = Math.abs(st.p1.x - st.p0.x) > Math.abs(st.p1.y - st.p0.y) ? 0 : 24;
    st.ctx.fillStyle = st.colors.muted;
    st.ctx.font = '10px "JetBrains Mono", monospace';
    st.ctx.textAlign = 'center';
    st.ctx.textBaseline = 'middle';
    st.ctx.fillText(componentLabel(c), cx + dx, cy + dy);
  }
}

/** Human-readable label for the inspector and on-canvas annotation. */
export function componentLabel(c: PlacedComponent): string {
  switch (c.kind) {
    case 'battery':   return `${c.value.toPrecision(3)} V`;
    case 'ac':        return `${c.value.toPrecision(3)} V₀ · ${c.acFreq ?? 60} Hz`;
    case 'resistor':  return fmtOhm(c.value);
    case 'bulb':      return fmtOhm(c.value);
    case 'capacitor': return fmtF(c.value);
    case 'inductor':  return fmtH(c.value);
    case 'switch':    return c.switchOpen ? 'open' : 'closed';
    case 'diode':     return 'D';
    case 'ground':    return 'GND';
  }
}

function fmtOhm(v: number): string {
  if (v >= 1e6) return (v / 1e6).toPrecision(3) + ' MΩ';
  if (v >= 1e3) return (v / 1e3).toPrecision(3) + ' kΩ';
  return v.toPrecision(3) + ' Ω';
}
function fmtF(v: number): string {
  if (v >= 1) return v.toPrecision(3) + ' F';
  if (v >= 1e-3) return (v * 1e3).toPrecision(3) + ' mF';
  if (v >= 1e-6) return (v * 1e6).toPrecision(3) + ' µF';
  if (v >= 1e-9) return (v * 1e9).toPrecision(3) + ' nF';
  return (v * 1e12).toPrecision(3) + ' pF';
}
function fmtH(v: number): string {
  if (v >= 1) return v.toPrecision(3) + ' H';
  if (v >= 1e-3) return (v * 1e3).toPrecision(3) + ' mH';
  return (v * 1e6).toPrecision(3) + ' µH';
}

export interface TooltipInfo {
  title: string;
  description: string;
  formula: string;
  behavior: string;
}

/** Rich tooltip content for palette buttons and canvas hover. */
export function kindTooltip(
  k: PlacedComponent['kind'] | 'wire' | 'voltmeter' | 'ammeter' | 'cursor',
): TooltipInfo {
  switch (k) {
    case 'battery':
      return {
        title: 'Battery (DC)',
        description: 'An ideal voltage source that maintains a constant potential difference between its terminals.',
        formula: 'V = constant',
        behavior: 'Supplies fixed voltage regardless of current. Positive terminal is pink; negative is gray.',
      };
    case 'ac':
      return {
        title: 'AC Source',
        description: 'A time-varying voltage source that oscillates sinusoidally.',
        formula: 'V(t) = V₀ sin(2πft)',
        behavior: 'Voltage swings positive and negative at the set frequency and amplitude.',
      };
    case 'resistor':
      return {
        title: 'Resistor',
        description: 'Dissipates electrical energy as heat; opposes the flow of current.',
        formula: 'V = IR    P = I²R',
        behavior: 'Current is proportional to the voltage across it. Ohm\'s law at work.',
      };
    case 'capacitor':
      return {
        title: 'Capacitor',
        description: 'Stores energy in an electric field between two conductive plates.',
        formula: 'Q = CV    i = C dV/dt',
        behavior: 'Blocks DC after charging, passes AC. Voltage cannot change instantaneously.',
      };
    case 'inductor':
      return {
        title: 'Inductor',
        description: 'Stores energy in a magnetic field generated by current through a coil.',
        formula: 'V = L dI/dt',
        behavior: 'Opposes changes in current. Current cannot change instantaneously.',
      };
    case 'diode':
      return {
        title: 'Diode',
        description: 'Allows current to flow in one direction only, blocking reverse voltage.',
        formula: 'I = Iₛ(e^{qV/kT} − 1)',
        behavior: 'Modeled as 0.7 V drop when forward-biased, open circuit when reverse-biased.',
      };
    case 'bulb':
      return {
        title: 'Bulb',
        description: 'A resistive filament that emits light proportional to power dissipation.',
        formula: 'P = I²R    Brightness ∝ P',
        behavior: 'Glows brighter as more current passes through. Acts like a temperature-dependent resistor.',
      };
    case 'switch':
      return {
        title: 'Switch',
        description: 'A mechanical break in a circuit that can open or close a conductive path.',
        formula: 'R ≈ 0 (closed)    R → ∞ (open)',
        behavior: 'Toggle open/closed in the inspector. Closed is a near-short; open is a near-open.',
      };
    case 'ground':
      return {
        title: 'Ground',
        description: 'Reference node defined as 0 V. The solver requires at least one ground.',
        formula: 'V = 0',
        behavior: 'Every circuit needs one ground node as the voltage reference. Place at least one.',
      };
    case 'wire':
      return {
        title: 'Wire',
        description: 'An ideal zero-resistance connection between two nodes.',
        formula: 'R = 0    V₁ = V₂',
        behavior: 'Click two pins to connect them. Wires enforce the same voltage at both ends.',
      };
    case 'voltmeter':
      return {
        title: 'Voltmeter Probe',
        description: 'Measures the electric potential at a node relative to ground.',
        formula: 'Reading = V_node − V_ground',
        behavior: 'Click any node to place. The value appears in the Probes panel and on the canvas.',
      };
    case 'ammeter':
      return {
        title: 'Ammeter Probe',
        description: 'Measures the current flowing through a specific component.',
        formula: 'Reading = I_component',
        behavior: 'Click a component to attach. Positive sign means current flows pin 0 → pin 1.',
      };
    case 'cursor':
      return {
        title: 'Select',
        description: 'Select, drag, and inspect components.',
        formula: '—',
        behavior: 'Click a component to select it. Drag to move. Press Delete to remove. Double-click a switch to toggle.',
      };
  }
}

/** Human-readable display name for the palette / inspector header. */
export function kindDisplayName(k: PlacedComponent['kind']): string {
  return {
    battery:   'Battery (DC)',
    ac:        'AC Source',
    resistor:  'Resistor',
    capacitor: 'Capacitor',
    inductor:  'Inductor',
    diode:     'Diode',
    bulb:      'Bulb',
    switch:    'Switch',
    ground:    'Ground',
  }[k];
}

/** Default value for a new component of the given kind. */
export function defaultValue(k: PlacedComponent['kind']): {
  value: number; acFreq?: number; switchOpen?: boolean;
} {
  switch (k) {
    case 'battery':   return { value: 9 };
    case 'ac':        return { value: 10, acFreq: 60 };
    case 'resistor':  return { value: 1000 };
    case 'capacitor': return { value: 1e-6 };
    case 'inductor':  return { value: 1e-3 };
    case 'diode':     return { value: 0 };
    case 'bulb':      return { value: 100 };
    case 'switch':    return { value: 0, switchOpen: false };
    case 'ground':    return { value: 0 };
  }
}
