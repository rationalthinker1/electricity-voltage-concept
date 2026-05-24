/**
 * Demo D4.4 — Where the energy lives
 *
 * Parallel-plate capacitor with an amber "energy haze" in the gap whose
 * opacity tracks u_E = ½ ε₀ E². Slider sets V. Two readouts: total U = ½CV²
 * and field energy density u_E. The point: the energy isn't on the plates,
 * it's in the gap.
 */
import { useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, EquationStrip, MiniReadout, MiniSlider } from '@/components/Demo';
import { InlineMath } from '@/components/Formula';
import { Num } from '@/components/Num';
import { PHYS, sciTeX } from '@/lib/physics';
import { withAlpha } from '@/lib/canvasTheme';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';
import { drawLabel } from "@/lib/canvasLayout";

interface Props {
  figure: string;
}

export function EnergyInTheGapDemo({ figure }: Props) {
  const A_m2 = 100e-4;
  const d_m = 1e-3;
  const C = (PHYS.eps_0 * A_m2) / d_m;

  const [V, setV] = useState(12);

  const E = V / d_m;
  const u_E = 0.5 * PHYS.eps_0 * E * E;
  const U = 0.5 * C * V * V;

  const stateRef = useSimState({ V, E, u_E });
  const setup = useSimLoop(
    stateRef,
    ({ ctx, w: W, h: H, colors }, _state, _dt, _simTime, ctx0) => {
      let phase = ctx0.phase;
      const s = stateRef.current;
      phase += 0.02;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, W, H);
      const plateW = Math.min(W * 0.7, 460);
      const gap = 100;
      const plateThick = 8;
      const cx = W / 2;
      const cy = H / 2;
      const xL = cx - plateW / 2;
      const topY = cy - gap / 2 - plateThick / 2;
      const botY = cy + gap / 2 + plateThick / 2;
      const haze = Math.max(0.06, Math.min(0.7, Math.log10(s.u_E + 1) * 0.12 + 0.1));
      const grd = ctx.createLinearGradient(0, topY + plateThick, 0, botY - plateThick);
      grd.addColorStop(0, withAlpha(colors.accent, haze * 0.45));
      grd.addColorStop(0.5, withAlpha(colors.accent, haze));
      grd.addColorStop(1, withAlpha(colors.accent, haze * 0.45));
      ctx.fillStyle = grd;
      ctx.fillRect(xL, topY + plateThick, plateW, botY - topY - plateThick * 2);
      const usable = botY - topY - plateThick * 2 - 16;
      const Nfield = 14;
      const arrLen = Math.min(22, usable * 0.45);
      for (let i = 0; i < Nfield; i++) {
        const fx = xL + 18 + ((plateW - 36) * (i + 0.5)) / Nfield;
        const cycle = (phase * 70 + i * 11) % usable;
        const y1 = topY + plateThick + 8 + cycle;
        ctx.strokeStyle = colors.pink;
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(fx, y1 - arrLen);
        ctx.lineTo(fx, y1);
        ctx.stroke();
        ctx.fillStyle = colors.pink;
        ctx.beginPath();
        ctx.moveTo(fx, y1);
        ctx.lineTo(fx - 3.5, y1 - 6);
        ctx.lineTo(fx + 3.5, y1 - 6);
        ctx.closePath();
        ctx.fill();
      }
      drawPlate(ctx, xL, topY, plateW, plateThick, colors.pink);
      drawPlate(ctx, xL, botY - plateThick, plateW, plateThick, colors.blue);
      drawLabel(ctx, { text: 'u_E = ½ ε₀ E²', x: 14, y: 12, color: colors.accent, size: 11, font: '11px "JetBrains Mono", monospace', baseline: 'top' });
      ctx.fillStyle = colors.textDim;
      drawLabel(ctx, { text: `E = ${(s.E / 1000).toFixed(1)} kV/m`, x: 14, y: 28, size: 11, font: '11px "JetBrains Mono", monospace', baseline: 'top' });
      drawLabel(ctx, { text: `u_E = ${s.u_E.toExponential(2)} J/m³`, x: 14, y: 42, size: 11, font: '11px "JetBrains Mono", monospace', baseline: 'top' });
      drawLabel(ctx, { text: '← the energy lives here', x: W - 14, y: cy - 6, color: colors.accent, size: 11, font: '11px "JetBrains Mono", monospace', align: 'right', baseline: 'top' });
      drawLabel(ctx, { text: 'not in the plates', x: W - 14, y: cy + 8, size: 11, font: '11px "JetBrains Mono", monospace', align: 'right', baseline: 'top' });
      ctx0.phase = phase;
    },
    [],
    () => ({ context: { phase: 0 } }),
  );

  return (
    <Demo
      figure={figure}
      title="Energy in the gap"
      question="If the plates net to zero charge, where's the energy hiding?"
      caption={
        <>
          The orange haze visualises{' '}
          <strong>
            u<sub>E</sub> = ½ ε₀ E²
          </strong>{' '}
          — the energy density of the field. Total stored energy is this density integrated over the
          gap volume <strong>A·d</strong>, which gives back exactly <strong>½ C V²</strong>. The
          plates only hold the boundary; the energy is in the field they bracket.
        </>
      }
      deeperLab={{ slug: 'energy-density', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={280} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="V"
          value={V}
          min={0}
          max={200}
          step={1}
          format={(v) => v.toFixed(0) + ' V'}
          onChange={setV}
        />
        <MiniReadout label="U = ½CV²" value={<Num value={U} />} unit="J" />
        <MiniReadout label="u_E" value={<Num value={u_E} />} unit="J/m³" />
      </DemoControls>
      <EquationStrip
        leftLabel="Energy density in the field"
        left={
          <InlineMath
            tex={
              `u_{E} \\;=\\; \\tfrac{1}{2}\\varepsilon_{0} E^{2} \\;=\\; ` +
              `\\tfrac{1}{2}(8.854\\!\\times\\!10^{-12})(${sciTeX(E)})^{2} ` +
              `\\;\\approx\\; ${sciTeX(u_E)}\\ \\text{J/m}^{3}`
            }
          />
        }
        rightLabel="Total = u_E × volume"
        right={
          <InlineMath
            tex={
              `U \\;=\\; u_{E} \\cdot A d \\;\\approx\\; ${sciTeX(U)}\\ \\text{J}`
            }
          />
        }
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
