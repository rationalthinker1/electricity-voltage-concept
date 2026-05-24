/**
 * Demo D4.3 — Plate geometry → capacitance
 *
 * Sliders for plate area A and separation d. Plates resize visually. C readout
 * updates as C = ε₀ A / d. The caption frames the headline result: capacitance
 * is geometry; doubling A doubles C; halving d also doubles C.
 */
import { useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, EquationStrip, MiniReadout, MiniSlider } from '@/components/Demo';
import { M } from '@/components/Formula';
import { Num } from '@/components/Num';
import { PHYS } from '@/lib/physics';
import { drawLabel } from '@/lib/canvasLayout';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

interface Props {
  figure: string;
}

export function PlateGeometryDemo({ figure }: Props) {
  const [A_cm2, setACm2] = useState(100);
  const [d_mm, setDMm] = useState(1.0);

  const A_m2 = A_cm2 * 1e-4;
  const d_m = d_mm * 1e-3;
  const C = (PHYS.eps_0 * A_m2) / d_m;

  const stateRef = useSimState({ A_cm2, d_mm });
  const setup = useSimLoop(
    stateRef,
    ({ ctx, w: W, h: H, colors }, _state, _dt, _simTime) => {
      const s = stateRef.current;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, W, H);
      const cx = W / 2;
      const cy = H / 2;
      const refW = Math.min(W * 0.72, 460);
      const wScale = Math.sqrt(s.A_cm2 / 500);
      const plateW = Math.max(100, refW * (0.3 + 0.8 * wScale));
      const dNorm = (Math.log10(s.d_mm) - Math.log10(0.05)) / (Math.log10(10) - Math.log10(0.05));
      const gap = 16 + Math.max(0, Math.min(1, dNorm)) * (H * 0.55);
      const plateThick = 8;
      const xL = cx - plateW / 2;
      const topY = cy - gap / 2 - plateThick / 2;
      const botY = cy + gap / 2 + plateThick / 2;
      drawPlate(ctx, xL, topY, plateW, plateThick, colors.pink);
      drawPlate(ctx, xL, botY - plateThick, plateW, plateThick, colors.blue);
      ctx.save();
      ctx.globalAlpha = 0.6;
      ctx.strokeStyle = colors.textDim;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(xL, topY - 18);
      ctx.lineTo(xL + plateW, topY - 18);
      ctx.moveTo(xL, topY - 22);
      ctx.lineTo(xL, topY - 14);
      ctx.moveTo(xL + plateW, topY - 22);
      ctx.lineTo(xL + plateW, topY - 14);
      ctx.stroke();
      ctx.restore();
      drawLabel(ctx, {
        x: cx,
        y: topY - 24,
        text: `A = ${s.A_cm2.toFixed(0)} cm²`,
        color: colors.text,
        align: 'center',
        baseline: 'bottom',
      });
      const xD = xL + plateW + 26;
      ctx.save();
      ctx.globalAlpha = 0.6;
      ctx.strokeStyle = colors.textDim;
      ctx.beginPath();
      ctx.moveTo(xD - 4, topY + plateThick);
      ctx.lineTo(xD + 4, topY + plateThick);
      ctx.moveTo(xD - 4, botY - plateThick);
      ctx.lineTo(xD + 4, botY - plateThick);
      ctx.moveTo(xD, topY + plateThick);
      ctx.lineTo(xD, botY - plateThick);
      ctx.stroke();
      ctx.restore();
      drawLabel(ctx, {
        x: xD + 10,
        y: cy,
        text: `d = ${s.d_mm.toFixed(2)} mm`,
        color: colors.text,
        baseline: 'middle',
      });
      drawLabel(ctx, {
        x: 14,
        y: 12,
        text: `C = ε₀ A / d`,
        color: colors.accent,
        size: 11,
        baseline: 'top',
      });
    },
    [],
  );

  return (
    <Demo
      figure={figure}
      title="Geometry is the capacity"
      question="Why does the shape of the plates set the capacitance?"
      caption={
        <>
          Capacitance is entirely a property of the geometry (in vacuum): more area, more capacity;
          less gap, more capacity. Double <strong>A</strong>
          and <strong>C</strong> doubles. Halve <strong>d</strong> and <strong>C</strong> doubles.
          Insert an insulator in the gap and the relative permittivity <strong>εᵣ</strong>{' '}
          multiplies on top.
        </>
      }
      deeperLab={{ slug: 'capacitance', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="A"
          value={A_cm2}
          min={10}
          max={1000}
          step={5}
          format={(v) => v.toFixed(0) + ' cm²'}
          onChange={setACm2}
        />
        <MiniSlider
          label="d"
          value={d_mm}
          min={0.05}
          max={10}
          step={0.05}
          format={(v) => v.toFixed(2) + ' mm'}
          onChange={setDMm}
        />
        <MiniReadout label="C = ε₀A/d" value={<Num value={C} />} unit="F" />
      </DemoControls>
      <EquationStrip
        leftLabel="Geometry sets capacitance"
        left={
          <M
            tex={
              `C \\;=\\; \\dfrac{\\varepsilon_{0} A}{d} \\;=\\; ` +
              `\\dfrac{(8.854\\!\\times\\!10^{-12})(${(A_m2 * 1e4).toFixed(0)}\\!\\times\\!10^{-4})}{${(d_m * 1e3).toFixed(2)}\\!\\times\\!10^{-3}} ` +
              `\\;\\approx\\; ${(C * 1e12).toFixed(1)}\\ \\text{pF}`
            }
          />
        }
        rightLabel="Halve d, double C"
        right={<M tex={`C \\propto \\dfrac{A}{d}`} />}
      />
    </Demo>
  );
}

function drawPlate(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
) {
  const grd = ctx.createLinearGradient(x, y, x, y + h);
  grd.addColorStop(0, color);
  grd.addColorStop(1, color + '99');
  ctx.fillStyle = grd;
  ctx.shadowColor = color + 'a0';
  ctx.shadowBlur = 12;
  ctx.fillRect(x, y, w, h);
  ctx.shadowBlur = 0;
}
