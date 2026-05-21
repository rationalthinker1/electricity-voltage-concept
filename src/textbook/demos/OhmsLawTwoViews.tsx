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
import { useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, EquationStrip, MiniReadout, MiniSlider } from '@/components/Demo';
import { InlineMath } from '@/components/Formula';
import { Num } from '@/components/Num';
import { drawLabel } from '@/lib/canvasLayout';
import { drawCircuit, type CircuitElement } from '@/lib/canvasPrimitives';
import { type ThemeColors, withAlpha } from '@/lib/canvasTheme';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

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

interface SimContext {
  top: number[];
  bottom: number[];
}

export function OhmsLawTwoViewsDemo({ figure }: Props) {
  const [I_left, setILeft] = useState(2.5); // A — drives top panel
  const [R_right, setRRight] = useState(15); // Ω — drives bottom panel

  // Derived readouts
  const V_left = R_FIXED * I_left;
  const I_right = V_FIXED / R_right;

  const stateRef = useSimState({ I_left, R_right });

  const setup = useSimLoop<{ I_left: number; R_right: number }, SimContext>(
    stateRef,
    ({ ctx, w, h, colors }, _state, dt, _simTime, electrons) => {
      const s = stateRef.current;
      const { I_left, R_right } = s;

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
        electrons.top,
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
        electrons.bottom,
        dt,
      );
    },
    [],
    () => ({
      context: {
        top: Array.from({ length: N_ELECTRONS }, (_, i) => i / N_ELECTRONS),
        bottom: Array.from({ length: N_ELECTRONS }, (_, i) => i / N_ELECTRONS),
      },
    }),
  );

  return (
    <Demo
      figure={figure ?? 'Fig. 3.0b'}
      title="Ohm's law, two ways"
      question="Same equation V = IR — but pulled in two directions. Push voltage up, current rises in lockstep. Push resistance up, current falls. Watch both at once."
      caption={
        <>
          The two panels are the same V = IR seen from opposite ends. In the top scenario the
          resistor is fixed at 5 Ω and the slider varies the current — voltage tracks linearly,
          slope R, and the electrons (cyan) flow faster around the loop as you turn it up. In the
          bottom scenario the source is fixed at 20 V and the slider varies the resistance — current
          falls as a hyperbola, I = V/R, and the same electrons slow to a crawl as you crank R up.
          Whether you read it as &quot;voltage drives current&quot; or &quot;resistance restricts
          current&quot; depends on which knob you imagine having your hand on.
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
        <MiniReadout label="V = R·I  (R = 5 Ω)" value={<Num value={V_left} />} unit="V" />
        <MiniSlider
          label="Panel 2 · resistance R"
          value={R_right}
          min={R_MIN}
          max={R_AXIS_MAX}
          step={0.1}
          format={(v) => v.toFixed(1) + ' Ω'}
          onChange={setRRight}
        />
        <MiniReadout label="I = V/R  (V = 20 V)" value={<Num value={I_right} />} unit="A" />
      </DemoControls>
      <EquationStrip
        leftLabel="Panel 1: voltage tracks current"
        left={
          <InlineMath
            tex={
              `V \\;=\\; R\\, I \\;=\\; 5\\times ${I_left.toFixed(2)} ` +
              `\\;=\\; ${V_left.toFixed(2)}\\ \\text{V}`
            }
          />
        }
        rightLabel="Panel 2: current falls as 1/R"
        right={
          <InlineMath
            tex={
              `I \\;=\\; V/R \\;=\\; 20/${R_right.toFixed(1)} ` +
              `\\;\\approx\\; ${I_right.toFixed(2)}\\ \\text{A}`
            }
          />
        }
      />
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

function drawPlot(ctx: CanvasRenderingContext2D, colors: ThemeColors, rect: Rect, p: PanelArgs) {
  const ml = 28;
  const mr = 10;
  const mt = 8;
  const mb = 24;
  const px = rect.x + ml;
  const py = rect.y + mt;
  const pw = rect.w - ml - mr;
  const ph = rect.h - mt - mb;

  ctx.strokeStyle = colors.borderStrong;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.lineTo(px, py + ph);
  ctx.lineTo(px + pw, py + ph);
  ctx.stroke();

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

  ctx.fillStyle = colors.textDim;
  ctx.font = "italic 11px 'STIX Two Text', serif";
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  const yLabel = p.mode === 'V-of-I' ? 'V' : 'R';
  ctx.fillText(yLabel, px - 6, py + 4);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('I', px + pw - 8, py + ph + 6);

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
    const a = toPx(0, 0);
    const b = toPx(xMax, R_FIXED * xMax);
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
  } else {
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

  const dotIx = p.I;
  const dotYx = p.mode === 'V-of-I' ? p.V : p.R;
  const dot = toPx(dotIx, Math.min(dotYx, yMax));

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
  const margin = 12;
  const x0 = rect.x + margin;
  const y0 = rect.y + margin + 4;
  const x1 = rect.x + rect.w - margin;
  const y1 = rect.y + rect.h - margin - 4;
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;

  const Inorm = Math.min(1, Math.max(0, p.I / I_MAX));
  const loopAlpha = 0.3 + 0.55 * Inorm;
  const wireColor = withAlpha(colors.accent, loopAlpha);

  const elements: CircuitElement[] = [
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

  const loop: LoopGeom = {
    x0,
    y0,
    x1,
    y1,
    cy,
    perimeter: 2 * (x1 - x0 + y1 - y0),
  };
  const compHalf = 22;

  const speed = ELECTRON_BASE_SPEED * Inorm;

  for (let i = 0; i < electrons.length; i++) {
    electrons[i] = wrap(electrons[i]! - (speed * dt) / loop.perimeter, 1);
  }

  for (const phase of electrons) {
    const pt = pointOnLoop(loop, phase * loop.perimeter);
    if (Math.abs(pt.x - loop.x0) < 0.5 && Math.abs(pt.y - loop.cy) < compHalf) continue;
    if (Math.abs(pt.x - loop.x1) < 0.5 && Math.abs(pt.y - loop.cy) < compHalf) continue;
    ctx.fillStyle = colors.blue;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 2.4, 0, Math.PI * 2);
    ctx.fill();
  }

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

  drawLabel(ctx, {
    x: cx,
    y: y1 + 14,
    text: `I = ${p.I.toFixed(2)} A`,
    color: colors.textDim,
    align: 'center',
    baseline: 'bottom',
  });
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
