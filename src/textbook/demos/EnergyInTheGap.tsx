/**
 * Demo D4.4 — Where the energy lives
 *
 * Parallel-plate capacitor with an amber "energy haze" in the gap whose
 * opacity tracks u_E = ½ ε₀ E². Slider sets V. Two readouts: total U = ½CV²
 * and field energy density u_E. The point: the energy isn't on the plates,
 * it's in the gap.
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

export function EnergyInTheGapDemo({ figure }: Props) {
  const A_m2 = 100e-4;
  const d_m = 1e-3;
  const C = (PHYS.eps_0 * A_m2) / d_m;

  const [V, setV] = useState(12);

  const E = V / d_m;
  const u_E = 0.5 * PHYS.eps_0 * E * E;
  const U = 0.5 * C * V * V;

  const stateRef = useRef({ V, E, u_E });
  useEffect(() => { stateRef.current = { V, E, u_E }; }, [V, E, u_E]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w: W, h: H } = info;
    let raf = 0;
    let phase = 0;

    function draw() {
      const s = stateRef.current;
      phase += 0.02;

      ctx.fillStyle = getCanvasColors().bg;
      ctx.fillRect(0, 0, W, H);

      const plateW = Math.min(W * 0.7, 460);
      const gap = 100;
      const plateThick = 8;
      const cx = W / 2;
      const cy = H / 2;
      const xL = cx - plateW / 2;
      const topY = cy - gap / 2 - plateThick / 2;
      const botY = cy + gap / 2 + plateThick / 2;

      // Energy haze — opacity scales with log(u_E)
      const haze = Math.max(0.06, Math.min(0.7, Math.log10(s.u_E + 1) * 0.12 + 0.10));
      const grd = ctx.createLinearGradient(0, topY + plateThick, 0, botY - plateThick);
      grd.addColorStop(0, `rgba(255,107,42,${haze * 0.45})`);
      grd.addColorStop(0.5, `rgba(255,107,42,${haze})`);
      grd.addColorStop(1, `rgba(255,107,42,${haze * 0.45})`);
      ctx.fillStyle = grd;
      ctx.fillRect(xL, topY + plateThick, plateW, botY - topY - plateThick * 2);

      // Field arrows
      const usable = botY - topY - plateThick * 2 - 16;
      const Nfield = 14;
      const arrLen = Math.min(22, usable * 0.45);
      for (let i = 0; i < Nfield; i++) {
        const fx = xL + 18 + ((plateW - 36) * (i + 0.5)) / Nfield;
        const cycle = (phase * 70 + i * 11) % usable;
        const y1 = topY + plateThick + 8 + cycle;
        ctx.strokeStyle = getCanvasColors().pink;
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(fx, y1 - arrLen);
        ctx.lineTo(fx, y1);
        ctx.stroke();
        ctx.fillStyle = getCanvasColors().pink;
        ctx.beginPath();
        ctx.moveTo(fx, y1);
        ctx.lineTo(fx - 3.5, y1 - 6);
        ctx.lineTo(fx + 3.5, y1 - 6);
        ctx.closePath();
        ctx.fill();
      }

      // Plates
      drawPlate(ctx, xL, topY, plateW, plateThick, '#ff3b6e');
      drawPlate(ctx, xL, botY - plateThick, plateW, plateThick, '#5baef8');

      // Labels
      ctx.fillStyle = getCanvasColors().accent;
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('u_E = ½ ε₀ E²', 14, 12);
      ctx.fillStyle = getCanvasColors().textDim;
      ctx.fillText(`E = ${(s.E / 1000).toFixed(1)} kV/m`, 14, 28);
      ctx.fillText(`u_E = ${s.u_E.toExponential(2)} J/m³`, 14, 42);

      // Caption arrow pointing at the haze
      ctx.fillStyle = getCanvasColors().accent;
      ctx.textAlign = 'right';
      ctx.fillText('← the energy lives here', W - 14, cy - 6);
      ctx.fillStyle = getCanvasColors().textDim;
      ctx.fillText('not in the plates', W - 14, cy + 8);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 4.4'}
      title="Energy in the gap"
      question="If the plates net to zero charge, where's the energy hiding?"
      caption={
        <>
          The orange haze visualises <strong>u<sub>E</sub> = ½ ε₀ E²</strong> — the energy density of the field. Total stored energy is
          this density integrated over the gap volume <strong>A·d</strong>, which gives back exactly <strong>½ C V²</strong>. The plates
          only hold the boundary; the energy is in the field they bracket.
        </>
      }
      deeperLab={{ slug: 'energy-density', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={280} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="V"
          value={V} min={0} max={200} step={1}
          format={v => v.toFixed(0) + ' V'}
          onChange={setV}
        />
        <MiniReadout label="U = ½CV²" value={<Num value={U} />} unit="J" />
        <MiniReadout label="u_E" value={<Num value={u_E} />} unit="J/m³" />
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
