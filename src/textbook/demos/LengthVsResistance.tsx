/**
 * Demo D3.1 — Length vs. resistance
 *
 * Vary the length L of a copper wire at fixed cross-section. Resistance
 * R = ρL/A grows linearly. The visualization is a horizontal wire whose
 * drawn length changes with L; tick marks every meter give scale.
 */
import { useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, EquationStrip, MiniReadout, MiniSlider } from '@/components/Demo';
import { M } from '@/components/Formula';
import { Num } from '@/components/Num';
import { drawEyebrowStats } from '@/lib/canvasLayout';
import { pathRoundRect } from '@/lib/canvasPrimitives';
import { withAlpha } from '@/lib/canvasTheme';
import { MATERIALS, sciTeX } from '@/lib/physics';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

interface Props {
  figure: string;
}

export function LengthVsResistanceDemo({ figure }: Props) {
  const A_mm2 = 2.5;
  const A_m2 = A_mm2 * 1e-6;
  const sigma = MATERIALS.copper!.sigma;

  const [L, setL] = useState(1.0);

  const R = L / (sigma * A_m2);

  const stateRef = useSimState({ L });

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, colors }) => {
      const s = stateRef.current;
      const { L: L_ } = s;

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      const marginX = 60;
      const usableW = w - marginX * 2;
      const pxPerM = usableW / 10;
      const wireLen = Math.max(30, L_ * pxPerM);
      const wireCY = h / 2;
      const wireLeft = (w - wireLen) / 2;
      const wireRight = wireLeft + wireLen;
      const thickness = 36;
      const top = wireCY - thickness / 2;
      const bot = wireCY + thickness / 2;

      // Tick marks every meter
      ctx.strokeStyle = colors.borderStrong;
      ctx.fillStyle = colors.textDim;
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      const nTicks = Math.floor(L_) + 1;
      for (let i = 0; i <= nTicks; i++) {
        const m = Math.min(i, L_);
        const x = wireLeft + m * pxPerM;
        ctx.beginPath();
        ctx.moveTo(x, bot + 8);
        ctx.lineTo(x, bot + 16);
        ctx.stroke();
        ctx.fillText(`${m.toFixed(0)} m`, x, bot + 28);
      }

      // Wire body
      const grd = ctx.createLinearGradient(0, top, 0, bot);
      grd.addColorStop(0, withAlpha(colors.accent, 0.08));
      grd.addColorStop(0.5, withAlpha(colors.accent, 0.18));
      grd.addColorStop(1, withAlpha(colors.accent, 0.08));
      ctx.fillStyle = grd;
      pathRoundRect(ctx, wireLeft, top, wireLen, thickness, 8);
      ctx.fill();
      ctx.strokeStyle = colors.textDim;
      ctx.lineWidth = 1;
      pathRoundRect(ctx, wireLeft, top, wireLen, thickness, 8);
      ctx.stroke();

      // End caps
      ctx.fillStyle = colors.pink;
      ctx.fillRect(wireLeft - 10, top - 4, 4, thickness + 8);
      ctx.fillStyle = colors.blue;
      ctx.fillRect(wireRight + 6, top - 4, 4, thickness + 8);

      drawEyebrowStats(ctx, {
        x: w / 2,
        y: top - 14,
        parts: ['Copper', `A = ${A_mm2.toFixed(1)} mm²`],
        color: colors.accent,
        size: 11,
        align: 'center',
      });
    },
    [],
  );

  return (
    <Demo
      figure={figure}
      title="Length adds resistance"
      question="Stretch the wire — what does R do?"
      caption="Hold the cross-section fixed. Resistance scales linearly with length: R = ρL/A. Twice the wire, twice the resistance."
      deeperLab={{ slug: 'resistance', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={220} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="L"
          value={L}
          min={0.1}
          max={10}
          step={0.1}
          format={(v) => v.toFixed(1) + ' m'}
          onChange={setL}
        />
        <MiniReadout label="Resistance" value={<Num value={R} />} unit="Ω" />
      </DemoControls>
      <EquationStrip
        leftLabel="Geometric resistance"
        left={<M tex="R \;=\; \dfrac{\\rho L}{A}" />}
        rightLabel="Live substitution (Cu, A = 2.5 mm²)"
        right={
          <M
            tex={
              `R \\;=\\; \\dfrac{1.68\\times 10^{-8} \\times ${L.toFixed(2)}}` +
              `{2.5\\times 10^{-6}} \\;\\approx\\; ${sciTeX(R)}\\ \\Omega`
            }
          />
        }
      />
    </Demo>
  );
}
