/**
 * Demo D3.0 — Ohm's law, two views
 *
 * V = IR taken apart into the two intuitions it bundles together:
 *
 *  TOP    panel — "voltage drives current": fix R, slide I, watch V = R·I
 *                 trace a straight line through the origin (slope = R).
 *  BOTTOM panel — "resistance restricts current": fix V, slide R, watch
 *                 I = V/R trace a hyperbola in the (I, R) plane.
 *
 * Each panel pairs a (plot, dot, trace) with a small loop schematic
 * (battery + fixed/variable resistor). Electrons (cyan dots) drift around
 * each loop in the conventional-current direction; their speed scales
 * with the panel's current, so the bottom-panel loop visibly slows as
 * resistance climbs and the top-panel loop visibly speeds up as the
 * driving current increases. Theme colours are re-read every frame, so
 * a light/dark toggle switches the diagram in place.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { drawCircuit, type CircuitElement } from '@/lib/canvasPrimitives';
import { getCanvasColors, type ThemeColors } from '@/lib/canvasTheme';

// Top panel: fixed R, vary I, V follows.
const R_FIXED = 5; // Ω
const I_MAX = 4; // A — also defines x-axis limit
const V_MAX = R_FIXED * I_MAX; // 20 V — y-axis limit so the line spans diagonally

// Bottom panel: fixed V, vary R, I follows.
const V_FIXED = 20; // V
const R_AXIS_MAX = 30; // Ω — y-axis limit for R(I)
const R_MIN = V_FIXED / I_MAX; // 5 Ω → I_max = 4 A on the x-axis

const N_ELECTRONS = 14; // dots per loop
const ELECTRON_BASE_SPEED = 120; // px/s at I = I_MAX

interface Props {
  figure?: string;
}

interface LoopGeom {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  cy: number;
  perimeter: number;
}

export function OhmsLawTwoViewsDemo({ figure }: Props) {
  const [I_left, setILeft] = useState(2.5); // A — drives top panel
  const [R_right, setRRight] = useState(15); // Ω — drives bottom panel

  // Derived readouts
  const V_left = R_FIXED * I_left;
  const I_right = V_FIXED / R_right;

  const stateRef = useRef({ I_left, R_right });
  useEffect(() => {
    stateRef.current = { I_left, R_right };
  }, [I_left, R_right]);

  // Each electron is parameterised by arc-length s along its loop's
  // perimeter. We keep two separate phase arrays so the two panels run
  // independently. Refs persist across frames; the values are recomputed
  // (only the geometry-dependent perimeter) at the start of each draw.
  const electronsRef = useRef<{ top: number[]; bottom: number[] }>({
    top: Array.from({ length: N_ELECTRONS }, (_, i) => i / N_ELECTRONS),
    bottom: Array.from({ length: N_ELECTRONS }, (_, i) => i / N_ELECTRONS),
  });

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h } = info;
    let raf = 0;
    let last = performance.now();

    function draw(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const { I_left, R_right } = stateRef.current;
      const colors = getCanvasColors();

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      // Headline at top of canvas.
      ctx.fillStyle = colors.text;
      ctx.font = '600 14px "DM Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText("Ohm's law", w / 2, 6);
      ctx.fillStyle = colors.textDim;
      ctx.font = "italic 13px 'STIX Two Text', serif";
      ctx.fillText('V = I × R', w / 2, 26);

      // Split canvas into two stacked sub-panels.
      const topY = 50;
      const panelH = (h - topY - 8) / 2;
      drawPanel(
        ctx,
        colors,
        {
          x: 0,
          y: topY,
          w,
          h: panelH,
          title: '1.  Voltage  drives  current',
          titleAccent: 'drives',
          mode: 'V-of-I',
          I: I_left,
          R: R_FIXED,
          V: R_FIXED * I_left,
        },
        electronsRef.current.top,
        dt,
      );
      drawPanel(
        ctx,
        colors,
        {
          x: 0,
          y: topY + panelH + 8,
          w,
          h: panelH,
          title: '2.  Resistance  restricts  current',
          titleAccent: 'restricts',
          mode: 'R-of-I',
          I: V_FIXED / R_right,
          R: R_right,
          V: V_FIXED,
        },
        electronsRef.current.bottom,
        dt,
      );

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 3.0b'}
      title="Ohm's law, two ways"
      question="Same equation V = IR — but pulled in two directions. Push voltage up, current rises in lockstep. Push resistance up, current falls. Watch both at once."
      caption={
        <>
          The two panels are the same V = IR seen from opposite ends. In the top scenario the resistor
          is fixed at 5 Ω and the slider varies the current — voltage tracks linearly, slope R, and
          the electrons (cyan) flow faster around the loop as you turn it up. In the bottom scenario
          the source is fixed at 20 V and the slider varies the resistance — current falls as a
          hyperbola, I = V/R, and the same electrons slow to a crawl as you crank R up. Whether you
          read it as &quot;voltage drives current&quot; or &quot;resistance restricts current&quot;
          depends on which knob you imagine having your hand on.
        </>
      }
      deeperLab={{ slug: 'resistance', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={460} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="Panel 1 · current I"
          value={I_left}
          min={0.1}
          max={I_MAX}
          step={0.05}
          format={(v) => v.toFixed(2) + ' A'}
          onChange={setILeft}
        />
        <MiniReadout label="V = R·I  (R = 5 Ω)" value={V_left.toFixed(2)} unit="V" />
        <MiniSlider
          label="Panel 2 · resistance R"
          value={R_right}
          min={R_MIN}
          max={R_AXIS_MAX}
          step={0.1}
          format={(v) => v.toFixed(1) + ' Ω'}
          onChange={setRRight}
        />
        <MiniReadout label="I = V/R  (V = 20 V)" value={I_right.toFixed(2)} unit="A" />
      </DemoControls>
    </Demo>
  );
}

/* ───────────────────────────────────────────────────────────────────────── */

interface PanelArgs {
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  titleAccent: string;
  mode: 'V-of-I' | 'R-of-I';
  I: number;
  R: number;
  V: number;
}

function drawPanel(
  ctx: CanvasRenderingContext2D,
  colors: ThemeColors,
  p: PanelArgs,
  electrons: number[],
  dt: number,
) {
  // Title row.
  ctx.textBaseline = 'top';
  ctx.font = '600 13px "DM Sans", sans-serif';
  ctx.textAlign = 'center';
  const accentColor = p.mode === 'V-of-I' ? colors.blue : colors.teal;
  // Draw the title with one word highlighted.
  const parts = p.title.split(/(\s+)/);
  const widths = parts.map((s) => ctx.measureText(s).width);
  const totalW = widths.reduce((a, b) => a + b, 0);
  let cursor = p.x + p.w / 2 - totalW / 2;
  for (let i = 0; i < parts.length; i++) {
    const word = parts[i]!;
    ctx.fillStyle = word.trim() === p.titleAccent ? accentColor : colors.text;
    ctx.fillText(word, cursor + widths[i]! / 2, p.y);
    cursor += widths[i]!;
  }

  // Layout: left half = plot, right half = schematic.
  const padX = 12;
  const headerH = 22;
  const plotX = p.x + padX;
  const plotY = p.y + headerH;
  const splitW = p.w - padX * 2;
  const plotW = Math.round(splitW * 0.55);
  const plotH = p.h - headerH - 8;
  const circuitX = plotX + plotW + 10;
  const circuitW = splitW - plotW - 10;

  drawPlot(ctx, colors, { x: plotX, y: plotY, w: plotW, h: plotH }, p);
  drawCircuitMini(
    ctx,
    colors,
    { x: circuitX, y: plotY, w: circuitW, h: plotH },
    p,
    accentColor,
    electrons,
    dt,
  );
}

/* ── Plot ──────────────────────────────────────────────────────────────── */

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

function drawPlot(
  ctx: CanvasRenderingContext2D,
  colors: ThemeColors,
  rect: Rect,
  p: PanelArgs,
) {
  // Plot margins inside the rect for axis labels.
  const ml = 28;
  const mr = 10;
  const mt = 8;
  const mb = 24;
  const px = rect.x + ml;
  const py = rect.y + mt;
  const pw = rect.w - ml - mr;
  const ph = rect.h - mt - mb;

  // Axes.
  ctx.strokeStyle = colors.borderStrong;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.lineTo(px, py + ph);
  ctx.lineTo(px + pw, py + ph);
  ctx.stroke();

  // Axis tick marks.
  ctx.strokeStyle = colors.border;
  ctx.lineWidth = 1;
  for (let i = 1; i <= 3; i++) {
    const x = px + (pw * i) / 4;
    ctx.beginPath();
    ctx.moveTo(x, py + ph);
    ctx.lineTo(x, py + ph + 4);
    ctx.stroke();
    const y = py + (ph * i) / 4;
    ctx.beginPath();
    ctx.moveTo(px - 4, y);
    ctx.lineTo(px, y);
    ctx.stroke();
  }

  // Axis labels.
  ctx.fillStyle = colors.textDim;
  ctx.font = "italic 11px 'STIX Two Text', serif";
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  const yLabel = p.mode === 'V-of-I' ? 'V' : 'R';
  ctx.fillText(yLabel, px - 6, py + 4);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('I', px + pw - 8, py + ph + 6);

  // Trace + dot.
  const xMax = I_MAX;
  const yMax = p.mode === 'V-of-I' ? V_MAX : R_AXIS_MAX;
  const toPx = (Ival: number, yval: number) => ({
    x: px + (Ival / xMax) * pw,
    y: py + ph - (yval / yMax) * ph,
  });

  const traceColor = p.mode === 'V-of-I' ? colors.blue : colors.teal;
  ctx.strokeStyle = traceColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  if (p.mode === 'V-of-I') {
    // Line V = R·I from origin out to I_MAX.
    const a = toPx(0, 0);
    const b = toPx(xMax, R_FIXED * xMax);
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
  } else {
    // Hyperbola R = V/I sampled across the plotted I range.
    const Imin = V_FIXED / R_AXIS_MAX;
    const N = 80;
    for (let i = 0; i <= N; i++) {
      const Ival = Imin + ((xMax - Imin) * i) / N;
      const Rval = V_FIXED / Ival;
      const pt = toPx(Ival, Math.min(Rval, yMax));
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    }
  }
  ctx.stroke();

  // The live dot.
  const dotIx = p.I;
  const dotYx = p.mode === 'V-of-I' ? p.V : p.R;
  const dot = toPx(dotIx, Math.min(dotYx, yMax));

  // Dashed guide lines from dot to each axis.
  ctx.strokeStyle = colors.border;
  ctx.setLineDash([3, 3]);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(dot.x, dot.y);
  ctx.lineTo(dot.x, py + ph);
  ctx.moveTo(dot.x, dot.y);
  ctx.lineTo(px, dot.y);
  ctx.stroke();
  ctx.setLineDash([]);

  // Tick labels for the live values.
  ctx.fillStyle = colors.text;
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  const yText =
    p.mode === 'V-of-I' ? `${dotYx.toFixed(1)}V` : `${Math.min(dotYx, yMax).toFixed(1)}Ω`;
  ctx.fillText(yText, px - 4, dot.y);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(`${dotIx.toFixed(2)}A`, dot.x, py + ph + 6);

  // Dot.
  ctx.fillStyle = colors.bg;
  ctx.strokeStyle = traceColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(dot.x, dot.y, 4.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

/* ── Circuit mini-schematic ────────────────────────────────────────────── */

function drawCircuitMini(
  ctx: CanvasRenderingContext2D,
  colors: ThemeColors,
  rect: Rect,
  p: PanelArgs,
  accentColor: string,
  electrons: number[],
  dt: number,
) {
  // Rectangular loop centred in rect. Battery on the left side, resistor on
  // the right side; conventional current flows clockwise (electrons go the
  // other way).
  const margin = 12;
  const x0 = rect.x + margin;
  const y0 = rect.y + margin + 4;
  const x1 = rect.x + rect.w - margin;
  const y1 = rect.y + rect.h - margin - 4;
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;

  // Brightness of the loop tracks the current relative to I_MAX, so both
  // panels feel "alive" the same way.
  const Inorm = Math.min(1, Math.max(0, p.I / I_MAX));
  const loopAlpha = 0.3 + 0.55 * Inorm;
  const wireColor = withAlpha(colors.accent, loopAlpha);

  const elements: CircuitElement[] = [
    // Loop wires — top half and bottom half, broken by the battery on the
    // left and the resistor on the right.
    {
      kind: 'wire',
      points: [
        { x: x0, y: cy + 22 },
        { x: x0, y: y1 },
        { x: x1, y: y1 },
        { x: x1, y: cy + 22 },
      ],
      color: wireColor,
      lineWidth: 1.8,
    },
    {
      kind: 'wire',
      points: [
        { x: x0, y: cy - 22 },
        { x: x0, y: y0 },
        { x: x1, y: y0 },
        { x: x1, y: cy - 22 },
      ],
      color: wireColor,
      lineWidth: 1.8,
    },
    // Battery (vertical) on the left.
    {
      kind: 'battery',
      at: { x: x0, y: cy },
      orientation: 'vertical',
      leadLength: 22,
      plateGap: 8,
      negativeColor: colors.blue,
      positiveColor: colors.pink,
      negativePlateLength: 12,
      positivePlateLength: 20,
      color: colors.textDim,
      label: `${p.V.toFixed(1)} V`,
      labelOffset: { x: -22, y: 0 },
    },
    // Resistor (vertical) on the right.
    {
      kind: 'resistor',
      from: { x: x1, y: cy - 22 },
      to: { x: x1, y: cy + 22 },
      color: accentColor,
      lineWidth: 1.6,
      amplitude: 6,
      segments: 6,
      label: `${p.R.toFixed(1)} Ω`,
      labelColor: colors.textDim,
      labelOffset: { x: 22, y: 0 },
    },
  ];

  drawCircuit(ctx, { elements });

  // ── Electron drift ─────────────────────────────────────────────────────
  // Loop perimeter, walked clockwise starting at the top-right of the
  // battery's positive terminal. We treat it as a closed rectangle for
  // parametrisation; component breaks are handled by hiding the dot when
  // its position falls inside a component zone.
  const loop: LoopGeom = {
    x0,
    y0,
    x1,
    y1,
    cy,
    perimeter: 2 * (x1 - x0 + y1 - y0),
  };
  const compHalf = 22; // half-height of the battery / resistor break

  // Visual electron speed in px/s, signed: electrons move opposite to
  // conventional current, so we increment s in the direction of the
  // conventional clockwise lap but use a negative effective velocity when
  // we want the cyan dots to drift counter-clockwise. Concretely we draw
  // them as moving counter-clockwise around the loop (negative ds/dt).
  const speed = ELECTRON_BASE_SPEED * Inorm;

  for (let i = 0; i < electrons.length; i++) {
    electrons[i] = wrap(electrons[i]! - (speed * dt) / loop.perimeter, 1);
  }

  for (const phase of electrons) {
    const pt = pointOnLoop(loop, phase * loop.perimeter);
    // Skip drawing if the dot is inside a component zone.
    if (Math.abs(pt.x - loop.x0) < 0.5 && Math.abs(pt.y - loop.cy) < compHalf) continue;
    if (Math.abs(pt.x - loop.x1) < 0.5 && Math.abs(pt.y - loop.cy) < compHalf) continue;
    ctx.fillStyle = colors.blue;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 2.4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Conventional-current arrow centred on the top wire.
  const arrowY = y0 - 8;
  const ax0 = x0 + (x1 - x0) * 0.4;
  const ax1 = x0 + (x1 - x0) * 0.6;
  const arrowAlpha = 0.45 + 0.5 * Inorm;
  ctx.strokeStyle = withAlpha(colors.accent, arrowAlpha);
  ctx.fillStyle = withAlpha(colors.accent, arrowAlpha);
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(ax0, arrowY);
  ctx.lineTo(ax1 - 4, arrowY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(ax1, arrowY);
  ctx.lineTo(ax1 - 7, arrowY - 4);
  ctx.lineTo(ax1 - 7, arrowY + 4);
  ctx.closePath();
  ctx.fill();
  ctx.font = '9px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillStyle = withAlpha(colors.accent, arrowAlpha);
  ctx.fillText('I  (conventional)', (ax0 + ax1) / 2, arrowY - 4);

  // A small "I = …" tag below the loop so the panel reads end-to-end.
  ctx.fillStyle = colors.textDim;
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText(`I = ${p.I.toFixed(2)} A`, cx, y1 + 14);
}

/* ── helpers ───────────────────────────────────────────────────────────── */

function wrap(x: number, mod: number): number {
  let r = x % mod;
  if (r < 0) r += mod;
  return r;
}

interface Point {
  x: number;
  y: number;
}

/**
 * Return the (x, y) at arc-length `s` along a rectangular loop, walked
 * clockwise starting from the top-left corner.
 */
function pointOnLoop(loop: LoopGeom, s: number): Point {
  const { x0, y0, x1, y1 } = loop;
  const top = x1 - x0;
  const right = y1 - y0;
  const bottom = x1 - x0;
  const left = y1 - y0;
  let t = wrap(s, top + right + bottom + left);

  if (t < top) return { x: x0 + t, y: y0 };
  t -= top;
  if (t < right) return { x: x1, y: y0 + t };
  t -= right;
  if (t < bottom) return { x: x1 - t, y: y1 };
  t -= bottom;
  return { x: x0, y: y1 - t };
}

/**
 * Convert a hex (#rrggbb / #rgb) or rgb()/rgba() colour string to an rgba
 * string with the supplied alpha. Anything else is returned unchanged.
 */
function withAlpha(color: string, alpha: number): string {
  if (color.startsWith('#')) {
    let r: number;
    let g: number;
    let b: number;
    if (color.length === 7) {
      r = parseInt(color.slice(1, 3), 16);
      g = parseInt(color.slice(3, 5), 16);
      b = parseInt(color.slice(5, 7), 16);
    } else if (color.length === 4) {
      r = parseInt(color[1]! + color[1]!, 16);
      g = parseInt(color[2]! + color[2]!, 16);
      b = parseInt(color[3]! + color[3]!, 16);
    } else {
      return color;
    }
    return `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
  }
  const m = color.match(/rgba?\(([^)]+)\)/);
  if (m) {
    const parts = m[1]!.split(',').map((s) => s.trim());
    return `rgba(${parts[0]},${parts[1]},${parts[2]},${alpha.toFixed(3)})`;
  }
  return color;
}
