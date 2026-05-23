/**
 * Demo D2.5 — Voltage drives the flow
 *
 * One slider: battery voltage V (0.5 V to 24 V) across a fixed 10 Ω load.
 * Everything else updates from V:
 *   • current I = V/R
 *   • drift velocity v_d = I / (n q A)
 *   • power delivered P = V·I = V²/R
 *   • drift dot speed on screen, scaled visually
 *   • magnetic-field curls around the wire
 *
 * The pedagogical thrust is the chain V → I → v_d → P. Doubling V doubles
 * I and v_d but quadruples P.
 */
import { useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, EquationStrip, MiniReadout, MiniSlider } from '@/components/Demo';
import { InlineMath } from '@/components/Formula';
import { Num } from '@/components/Num';
import { type CircuitElement } from '@/lib/canvasPrimitives';
import { getCanvasColors, withAlpha } from '@/lib/canvasTheme';
import { MATERIALS, PHYS } from '@/lib/physics';
import { useCircuitCache } from '@/lib/useCircuitCache';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';
import { drawLabel } from "@/lib/canvasLayout";

interface Props {
  figure: string;
}

interface Dot {
  s: number;
  phase: number;
}

interface Segment {
  x0: number;
  y0: number;
  dx: number;
  dy: number;
  length: number;
  nx: number;
  ny: number;
  hidden: boolean;
}

// Fixed circuit parameters
const R_OHMS = 10;
const A_MM2 = 1.0;
const A_M2 = A_MM2 * 1e-6;
const N_CU = MATERIALS.copper.n;
const N_DOTS = 56;

interface SimState {
  V: number;
}

interface SimContext {
  dots: Dot[];
  segments: Segment[];
  totalLen: number;
}

export function VoltageDrivesFlowDemo({ figure }: Props) {
  const [V, setV] = useState(6);

  // Real physical values for the readouts
  const I = V / R_OHMS;
  const vd = I / (N_CU * PHYS.e * A_M2);
  const P = V * I;

  const stateRef = useSimState({ V });

  // Brightness is bucketed to 13 distinct values so the cache rebuilds at most
  // 13 times as V sweeps. Compute the bucket here from React state so it can
  // serve as a dep for useCircuitCache.
  const brightBucket = Math.round(Math.min(1, (V * V) / 576) * 12);

  // Static schematic. Rebakes when brightness bucket changes or canvas resizes.
  const getStaticSchematic = useCircuitCache(
    (sw, sh, _dpr) => {
      const bulbBright = brightBucket / 12;
      const canvasMarginX = Math.min(64, sw * 0.15);
      const canvasMarginY = Math.min(40, sh * 0.1);
      const legendLeft = canvasMarginX;
      const legendRight = sw - canvasMarginX;
      const legendTop = sh - canvasMarginY - 60;
      const legendBottom = sh - canvasMarginY;
      const legendPaddingY = 10;
      const legendCol1X = legendLeft;
      const legendCol2X = legendRight;
      const legendRow1Y = legendTop + legendPaddingY + 10;
      const legendRow3Y = legendBottom - legendPaddingY + 10;
      const legendRow2Y = (legendRow1Y + legendRow3Y) / 2;
      const circuitLeft = canvasMarginX;
      const circuitRight = sw - canvasMarginX;
      const circuitTop = canvasMarginY;
      const circuitBottom = sh - canvasMarginY - 60;
      const bulbR = 16;
      const batLead = 35;
      const batX = circuitLeft;
      const bulbX = circuitRight;
      const wireY = circuitBottom;
      const topY = circuitTop;
      const batCenterY = (circuitTop + circuitBottom) / 2;
      const c = getCanvasColors();
      const elements: CircuitElement[] = [
        {
          kind: 'wire',
          points: [
            { x: batX, y: wireY },
            { x: batX, y: topY },
            { x: bulbX, y: topY },
            { x: bulbX, y: wireY - bulbR },
          ],
          color: withAlpha(c.textDim, 0.45),
          lineWidth: 2,
        },
        {
          kind: 'wire',
          points: [
            { x: batX, y: wireY },
            { x: bulbX, y: wireY },
          ],
          color: withAlpha(c.textDim, 0.45),
          lineWidth: 2,
        },
        {
          kind: 'battery',
          at: { x: batX, y: batCenterY },
          color: withAlpha(c.text, 0.3),
          label: `${R_OHMS} Ω load · 1 mm² copper`,
          labelOffset: { x: legendCol1X - batX + 72, y: legendRow2Y - batCenterY },
          leadLength: batLead,
          plateGap: 8,
          negativeColor: c.blue,
          negativePlateLength: 14,
          positiveColor: c.pink,
          positivePlateLength: 24,
        },
        {
          kind: 'bulb',
          at: { x: bulbX, y: wireY },
          radius: bulbR,
          brightness: bulbBright,
          label: 'load',
          labelOffset: { x: legendCol2X - bulbX, y: legendRow2Y - wireY },
        },
      ];
      return { elements };
    },
    [brightBucket],
  );

  const setup = useSimLoop<SimState, SimContext>(
    stateRef,
    ({ ctx, w, h, colors, dpr }, _state, dt, _simTime, c) => {
      const s = stateRef.current;
      const I_now = s.V / R_OHMS;
      const Inorm = Math.min(1, Math.abs(I_now) / (24 / R_OHMS));

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      // Geometry (recomputed each frame for responsiveness)
      const canvasMarginX = Math.min(64, w * 0.15);
      const canvasMarginY = Math.min(40, h * 0.1);
      const legendLeft = canvasMarginX;
      const legendTop = h - canvasMarginY - 60;
      const legendBottom = h - canvasMarginY;
      const legendPaddingY = 10;
      const legendCol1X = legendLeft;
      const legendRow1Y = legendTop + legendPaddingY + 10;
      const legendRow3Y = legendBottom - legendPaddingY + 10;
      const circuitLeft = canvasMarginX;
      const circuitRight = w - canvasMarginX;
      const circuitTop = canvasMarginY;
      const circuitBottom = h - canvasMarginY - 60;
      const bulbR = 16;
      const batStub = 48;
      const bulbStub = 28;
      const batX = circuitLeft;
      const bulbX = circuitRight;
      const wireY = circuitBottom;
      const topY = circuitTop;
      const wireLeft = batX + batStub;
      const wireRight = bulbX - bulbStub;
      const wireLength = wireRight - wireLeft;

      // Rebuild segments if canvas size changed (simple check: cache null)
      if (!c.segments.length) {
        const rawSegs: { x0: number; y0: number; x1: number; y1: number; hidden: boolean }[] = [
          { x0: batX, y0: topY, x1: bulbX, y1: topY, hidden: false },
          { x0: bulbX, y0: topY, x1: bulbX, y1: wireY - bulbR, hidden: false },
          { x0: bulbX, y0: wireY - bulbR, x1: bulbX - bulbR, y1: wireY, hidden: true },
          { x0: bulbX - bulbR, y0: wireY, x1: batX, y1: wireY, hidden: false },
          { x0: batX, y0: wireY, x1: batX, y1: topY, hidden: true },
        ];
        c.segments = rawSegs.map((seg) => {
          const dx = seg.x1 - seg.x0;
          const dy = seg.y1 - seg.y0;
          const length = Math.hypot(dx, dy);
          return {
            x0: seg.x0,
            y0: seg.y0,
            dx,
            dy,
            length,
            nx: -dy / length,
            ny: dx / length,
            hidden: seg.hidden,
          };
        });
        c.totalLen = c.segments.reduce((sum, seg) => sum + seg.length, 0);

        // Initialise dots evenly around the loop
        if (!c.dots.length) {
          c.dots = Array.from({ length: N_DOTS }, (_, i) => ({
            s: (i + 0.5) * (c.totalLen / N_DOTS),
            phase: Math.random() * Math.PI * 2,
          }));
        }
      }

      // Static schematic — bake lives in useCircuitCache at component scope.
      const off = getStaticSchematic(w, h, dpr);
      if (off) ctx.drawImage(off, 0, 0, w, h);

      // Magnetic-field curls
      const Bcols = 4;
      const Bradius = 8 + 18 * Inorm;
      const Bwidth = 0.8 + 2.2 * Inorm;
      const Balpha = 0.2 + 0.7 * Inorm;
      ctx.save();
      ctx.strokeStyle = withAlpha(colors.teal, Balpha);
      ctx.lineWidth = Bwidth;
      ctx.lineCap = 'round';
      for (let i = 0; i < Bcols; i++) {
        const cx_ = wireLeft + (i + 0.5) * (wireLength / Bcols);
        ctx.beginPath();
        ctx.ellipse(cx_, wireY, Bradius, Bradius * 0.45, 0, Math.PI, 2 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(cx_, wireY, Bradius, Bradius * 0.45, 0, 0, Math.PI);
        ctx.stroke();
      }
      ctx.restore();

      // Legend strip
      ctx.fillStyle = withAlpha(colors.teal, 0.4 + 0.5 * Inorm);
      drawLabel(ctx, { text: 'B  (circles wire; |B| ∝ I)', x: legendCol1X, y: legendRow1Y, font: '10px "JetBrains Mono", monospace' });
      ctx.fillStyle = withAlpha(colors.textDim, 0.7);
      drawLabel(ctx, { text: 'fixed: R = 10 Ω · A = 1 mm² · n = 8.5×10²⁸/m³ (Cu) · dot motion ≠ to scale', x: legendCol1X, y: legendRow3Y, font: '10px "JetBrains Mono", monospace' });

      // Drift dots
      const visSpeed = 90 * Inorm;
      ctx.fillStyle = colors.blue;
      for (const d of c.dots) {
        d.s += visSpeed * dt;
        d.s = ((d.s % c.totalLen) + c.totalLen) % c.totalLen;
        d.phase += dt * 6;

        let rem = d.s;
        let seg: Segment | undefined;
        for (const cand of c.segments) {
          if (rem <= cand.length) {
            seg = cand;
            break;
          }
          rem -= cand.length;
        }
        if (!seg || seg.hidden) continue;
        const t = rem / seg.length;
        const bob = Math.sin(d.phase) * 1.4;
        const x = seg.x0 + seg.dx * t + seg.nx * bob;
        const y = seg.y0 + seg.dy * t + seg.ny * bob;
        ctx.beginPath();
        ctx.arc(x, y, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Conventional-current arrow
      const arrowY = wireY - 24;
      const ax0 = wireLeft + wireLength * 0.35;
      const ax1 = wireLeft + wireLength * 0.65;
      ctx.strokeStyle = withAlpha(colors.accent, 0.45 + 0.5 * Inorm);
      ctx.fillStyle = withAlpha(colors.accent, 0.45 + 0.5 * Inorm);
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(ax0, arrowY);
      ctx.lineTo(ax1, arrowY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(ax1, arrowY);
      ctx.lineTo(ax1 - 7, arrowY - 4);
      ctx.lineTo(ax1 - 7, arrowY + 4);
      ctx.closePath();
      ctx.fill();
      drawLabel(ctx, { text: 'I  (conventional)', x: (ax0 + ax1) / 2, y: arrowY - 6, font: '10px "JetBrains Mono", monospace', align: 'center' });

      // Poynting-flux annotation
      const Pmax = (24 * 24) / R_OHMS;
      const Pnorm = Math.min(1, (s.V * I_now) / Pmax);
      const fluxLen = 14 + 28 * Pnorm;
      const fluxAlpha = 0.35 + 0.6 * Pnorm;
      const fx1 = bulbX - 18;
      const fx0 = fx1 - fluxLen;
      const fy = wireY - 36;
      ctx.strokeStyle = withAlpha(colors.accent, fluxAlpha);
      ctx.fillStyle = withAlpha(colors.accent, fluxAlpha);
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(fx0, fy);
      ctx.lineTo(fx1, fy);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(fx1, fy);
      ctx.lineTo(fx1 - 7, fy - 4);
      ctx.lineTo(fx1 - 7, fy + 4);
      ctx.closePath();
      ctx.fill();
      drawLabel(ctx, { text: `P = V·I = ${(s.V * I_now).toFixed(1)} W`, x: fx1, y: fy - 6, font: '10px "JetBrains Mono", monospace', align: 'right' });
    },
    [],
    () => ({
      context: {
        dots: [],
        segments: [],
        totalLen: 0,
      },
    }),
  );

  return (
    <Demo
      figure={figure}
      title="Crank the voltage"
      question="Crank the voltage from 1 V to 24 V. The electrons go faster — but still less than a millimetre per second. So how does the load get so much brighter?"
      caption={
        <>
          One slider, one wire, one fixed 10 Ω load. Lifting V lifts I in lockstep (Ohm's law, I =
          V/R) and lifts the electrons' drift velocity by the same factor. But the drift stays in
          the tens of micrometres per second — visually you cannot tell 6 V from 24 V just by
          watching the dots. What changes dramatically is the power, P = V·I = V²/R: double V and
          the load gets four times the energy per second. That quadratic is the whole reason the
          grid bothers to step voltage <em>up</em> for transmission — and a first hint of the
          Poynting story in Chapter 8, where the energy turns out to flow through the field around
          the wire, not down the wire itself.
        </>
      }
      deeperLab={{ slug: 'drift', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={280} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="battery voltage V"
          value={V}
          min={0.5}
          max={24}
          step={0.1}
          format={(v) => v.toFixed(1) + ' V'}
          onChange={setV}
        />
        <MiniReadout label="current I = V/R" value={I.toFixed(2)} unit="A" />
        <MiniReadout label="drift v_d" value={<Num value={vd} />} unit="m/s" />
        <MiniReadout label="power P = V·I" value={P.toFixed(2)} unit="W" />
      </DemoControls>
      <EquationStrip
        leftLabel="Ohm's law (linear in V)"
        left={
          <InlineMath
            tex={
              `I \\;=\\; V/R \\;=\\; ` +
              `${V.toFixed(1)}/${R_OHMS} \\;=\\; ` +
              `${I.toFixed(2)}\\ \\text{A}`
            }
          />
        }
        rightLabel="Power (quadratic in V)"
        right={
          <InlineMath
            tex={
              `P \\;=\\; V^{2}/R \\;=\\; ` +
              `${V.toFixed(1)}^{2}/${R_OHMS} \\;=\\; ` +
              `${P.toFixed(2)}\\ \\text{W}`
            }
          />
        }
      />
    </Demo>
  );
}
