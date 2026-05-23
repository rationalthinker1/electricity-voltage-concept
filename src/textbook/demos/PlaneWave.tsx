/**
 * Demo D7.2 — A plane EM wave
 *
 * 3D-ish view of a plane wave travelling in +x. Pink E vectors oscillate in
 * +y; teal B vectors oscillate in +z. Both transverse, both in phase, with
 * |B| = |E|/c. Slider: ω. The picture is a standard textbook diagram
 * (Griffiths §9.2) — but animated, so the propagation is visible.
 */
import { useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import {
  Demo,
  DemoControls,
  EquationStrip,
  MiniReadout,
  MiniSlider,
} from '@/components/Demo';
import { InlineMath } from '@/components/Formula';
import { withAlpha } from '@/lib/canvasTheme';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';
import { drawLabel } from '@/lib/canvasLayout';

interface Props {
  figure: string;
}

export function PlaneWaveDemo({ figure }: Props) {
  const [omega, setOmega] = useState(2.0);

  // Visual "c" in pixels per simulation second
  const C_SIM = 110;
  const f = omega / (2 * Math.PI);
  const lambdaPx = C_SIM / Math.max(1e-6, f);

  const stateRef = useSimState({ omega });
  const setup = useSimLoop(
    stateRef,
    ({ ctx, w: W, h: H, colors }, _state, _dt, simTime) => {
      const t = simTime;
      const om = stateRef.current.omega;
      const k = om / C_SIM;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, W, H);
      const xL = 60;
      const xR = W - 30;
      const cy = H / 2;
      const ZSCALE_X = Math.cos((25 * Math.PI) / 180);
      const ZSCALE_Y = Math.sin((25 * Math.PI) / 180);
      ctx.strokeStyle = colors.borderStrong;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(xL, cy);
      ctx.lineTo(xR, cy);
      ctx.stroke();
      ctx.save();
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = colors.text;
      ctx.beginPath();
      ctx.moveTo(xR, cy);
      ctx.lineTo(xR - 10, cy - 5);
      ctx.lineTo(xR - 10, cy + 5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      drawLabel(ctx, { text: 'x · direction of propagation', x: xR - 200, y: cy + 16, font: '10px "JetBrains Mono", monospace' });
      const N = 60;
      const Eamp = Math.min(80, H * 0.28);
      const Bamp = Eamp * 0.55;
      for (let i = 0; i < N; i++) {
        const u = i / (N - 1);
        const x = xL + u * (xR - xL);
        const phase = k * (x - xL) - om * t;
        const sinp = Math.sin(phase);

        // E vector: along +y (screen vertical). Tail on axis, tip displaced.
        const eY = -sinp * Eamp;
        if (i % 2 === 0) {
          drawVector(ctx, x, cy, x, cy + eY, withAlpha(colors.pink, 0.85), 1.8);
        }
        // B vector: along +z (foreshortened into screen). Tail on axis, tip
        // shifted by (cos25°, sin25°) so it visually points back-and-up.
        const bMag = sinp * Bamp;
        const bx2 = x + bMag * ZSCALE_X;
        const by2 = cy - bMag * ZSCALE_Y;
        if (i % 2 === 0) {
          drawVector(ctx, x, cy, bx2, by2, withAlpha(colors.teal, 0.85), 1.8);
        }
      }
      ctx.save();
      ctx.globalAlpha = 0.45;
      ctx.strokeStyle = colors.pink;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let i = 0; i <= N * 3; i++) {
        const u = i / (N * 3);
        const x = xL + u * (xR - xL);
        const phase = k * (x - xL) - om * t;
        const y = cy - Math.sin(phase) * Eamp;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();
      ctx.strokeStyle = colors.teal;
      ctx.beginPath();
      for (let i = 0; i <= N * 3; i++) {
        const u = i / (N * 3);
        const x = xL + u * (xR - xL);
        const phase = k * (x - xL) - om * t;
        const m = Math.sin(phase) * Bamp;
        const bx2 = x + m * ZSCALE_X;
        const by2 = cy - m * ZSCALE_Y;
        if (i === 0) ctx.moveTo(bx2, by2);
        else ctx.lineTo(bx2, by2);
      }
      ctx.stroke();
      drawLabel(ctx, { text: 'E (y)', x: 14, y: 22, color: colors.pink, size: 11, font: '11px "JetBrains Mono", monospace' });
      drawLabel(ctx, { text: 'B (z)', x: 14, y: 38, color: colors.teal, size: 11, font: '11px "JetBrains Mono", monospace' });
      drawLabel(ctx, { text: 'in phase · |B| = |E|/c', x: 14, y: 54, size: 11, font: '11px "JetBrains Mono", monospace' });
    },
    [],
  );

  return (
    <Demo
      figure={figure}
      title="A plane wave, in slow motion"
      question="What's perpendicular to what?"
      caption={
        <>
          A plane wave travelling in <strong>+x</strong>. The pink electric vectors oscillate in
          <strong> y</strong>; the teal magnetic vectors oscillate in <strong>z</strong> (rendered
          foreshortened into the page). Both are transverse to the direction of travel, both peak at
          the same time, and <strong>|B| = |E|/c</strong> — the magnetic part looks "small" because
          it shares the same field-energy density only after the factor of c is restored.
        </>
      }
      deeperLab={{ slug: 'poynting', label: 'See Poynting lab' }}
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="ω"
          value={omega}
          min={0.6}
          max={6}
          step={0.05}
          format={(v) => v.toFixed(2) + ' rad/s'}
          onChange={setOmega}
        />
        <MiniReadout label="frequency f" value={f.toFixed(2)} unit="Hz" />
        <MiniReadout label="wavelength λ" value={lambdaPx.toFixed(0)} unit="px" />
      </DemoControls>
      <EquationStrip
        leftLabel="Field amplitudes"
        left={<InlineMath tex={`|B| \\;=\\; \\dfrac{|E|}{c}`} />}
        rightLabel="Wavelength"
        right={
          <InlineMath
            tex={
              `\\lambda \\;=\\; \\dfrac{c}{f} \\;=\\; ` +
              `\\dfrac{${C_SIM}}{${f.toFixed(2)}} \\;\\approx\\; ${lambdaPx.toFixed(0)}\\ \text{px}`
            }
          />
        }
      />
    </Demo>
  );
}

function drawVector(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  width: number,
) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  // Arrowhead
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 4) return;
  const ux = dx / len;
  const uy = dy / len;
  const px = -uy;
  const py = ux;
  const HEAD = 5;
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - ux * HEAD + px * 3, y2 - uy * HEAD + py * 3);
  ctx.lineTo(x2 - ux * HEAD - px * 3, y2 - uy * HEAD - py * 3);
  ctx.closePath();
  ctx.fill();
}
