/**
 * Demo D4.3 — Plate geometry → capacitance
 *
 * Sliders for plate area A and separation d. Plates resize visually. C readout
 * updates as C = ε₀ A / d. The caption frames the headline result: capacitance
 * is geometry; doubling A doubles C; halving d also doubles C.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import {
  Demo, DemoControls, MiniReadout, MiniSlider,
} from '@/components/Demo';
import { Num } from '@/components/Num';
import { PHYS } from '@/lib/physics';
import { getCanvasColors } from '@/lib/canvasTheme';

interface Props { figure?: string }

export function PlateGeometryDemo({ figure }: Props) {
  const [A_cm2, setACm2] = useState(100);
  const [d_mm, setDMm] = useState(1.0);

  const A_m2 = A_cm2 * 1e-4;
  const d_m = d_mm * 1e-3;
  const C = (PHYS.eps_0 * A_m2) / d_m;

  const stateRef = useRef({ A_cm2, d_mm });
  useEffect(() => { stateRef.current = { A_cm2, d_mm }; }, [A_cm2, d_mm]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w: W, h: H } = info;
    let raf = 0;

    function draw() {
      const s = stateRef.current;
      ctx.fillStyle = getCanvasColors().bg;
      ctx.fillRect(0, 0, W, H);

      const cx = W / 2;
      const cy = H / 2;
      const refW = Math.min(W * 0.72, 460);
      const wScale = Math.sqrt(s.A_cm2 / 500);
      const plateW = Math.max(100, refW * (0.3 + 0.8 * wScale));
      // Log-mapped d so the slider has range without burying small d.
      const dNorm = (Math.log10(s.d_mm) - Math.log10(0.05)) / (Math.log10(10) - Math.log10(0.05));
      const gap = 16 + Math.max(0, Math.min(1, dNorm)) * (H * 0.55);
      const plateThick = 8;
      const xL = cx - plateW / 2;
      const topY = cy - gap / 2 - plateThick / 2;
      const botY = cy + gap / 2 + plateThick / 2;

      // Plates
      drawPlate(ctx, xL, topY, plateW, plateThick, '#ff3b6e');
      drawPlate(ctx, xL, botY - plateThick, plateW, plateThick, '#5baef8');

      // A-dimension brackets
      ctx.strokeStyle = 'rgba(160,158,149,0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(xL, topY - 18); ctx.lineTo(xL + plateW, topY - 18);
      ctx.moveTo(xL, topY - 22); ctx.lineTo(xL, topY - 14);
      ctx.moveTo(xL + plateW, topY - 22); ctx.lineTo(xL + plateW, topY - 14);
      ctx.stroke();
      ctx.fillStyle = getCanvasColors().text;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`A = ${s.A_cm2.toFixed(0)} cm²`, cx, topY - 24);

      // d-dimension marker on the right
      const xD = xL + plateW + 26;
      ctx.strokeStyle = 'rgba(160,158,149,0.6)';
      ctx.beginPath();
      ctx.moveTo(xD - 4, topY + plateThick); ctx.lineTo(xD + 4, topY + plateThick);
      ctx.moveTo(xD - 4, botY - plateThick); ctx.lineTo(xD + 4, botY - plateThick);
      ctx.moveTo(xD, topY + plateThick); ctx.lineTo(xD, botY - plateThick);
      ctx.stroke();
      ctx.fillStyle = getCanvasColors().text;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(`d = ${s.d_mm.toFixed(2)} mm`, xD + 10, cy);

      // C label
      ctx.fillStyle = getCanvasColors().accent;
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(`C = ε₀ A / d`, 14, 12);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 4.3'}
      title="Geometry is the capacity"
      question="Why does the shape of the plates set the capacitance?"
      caption={
        <>
          Capacitance is entirely a property of the geometry (in vacuum): more area, more capacity; less gap, more capacity. Double <strong>A</strong>
          and <strong>C</strong> doubles. Halve <strong>d</strong> and <strong>C</strong> doubles. Insert an insulator in the gap and
          the relative permittivity <strong>εᵣ</strong> multiplies on top.
        </>
      }
      deeperLab={{ slug: 'capacitance', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="A"
          value={A_cm2} min={10} max={1000} step={5}
          format={v => v.toFixed(0) + ' cm²'}
          onChange={setACm2}
        />
        <MiniSlider
          label="d"
          value={d_mm} min={0.05} max={10} step={0.05}
          format={v => v.toFixed(2) + ' mm'}
          onChange={setDMm}
        />
        <MiniReadout label="C = ε₀A/d" value={<Num value={C} />} unit="F" />
      </DemoControls>
    </Demo>
  );
}

function drawPlate(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, color: string,
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
