/**
 * Demo D3.2 — Area vs. resistance
 *
 * Vary cross-section A at fixed length and material. R = ρL/A — twice
 * the area is half the resistance. Visualization: wire thickness changes,
 * with a small inset showing the cross-section as a circle.
 */
import { useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, EquationStrip, MiniReadout, MiniSlider } from '@/components/Demo';
import { InlineMath } from '@/components/Formula';
import { Num } from '@/components/Num';
import { drawEyebrowStats, drawLabeledValue } from '@/lib/canvasLayout';
import { pathRoundRect } from '@/lib/canvasPrimitives';
import { withAlpha } from '@/lib/canvasTheme';
import { MATERIALS } from '@/lib/physics';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

interface Props {
  figure?: string;
}

export function AreaVsResistanceDemo({ figure }: Props) {
  const L = 1.0; // m
  const sigma = MATERIALS.copper!.sigma;

  const [Amm2, setAmm2] = useState(2.5);

  const A_m2 = Amm2 * 1e-6;
  const R = L / (sigma * A_m2);

  const stateRef = useSimState({ Amm2 });

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, colors }) => {
      const s = stateRef.current;
      const { Amm2: A } = s;

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      const tFrac = Math.sqrt(A / 10);
      const thickness = 14 + tFrac * 90;

      const wireLeft = 80;
      const wireRight = w - 160;
      const wireCY = h / 2;
      const top = wireCY - thickness / 2;
      const bot = wireCY + thickness / 2;

      const grd = ctx.createLinearGradient(0, top, 0, bot);
      grd.addColorStop(0, withAlpha(colors.accent, 0.08));
      grd.addColorStop(0.5, withAlpha(colors.accent, 0.18));
      grd.addColorStop(1, withAlpha(colors.accent, 0.08));
      ctx.fillStyle = grd;
      pathRoundRect(
        ctx,
        wireLeft,
        top,
        wireRight - wireLeft,
        thickness,
        Math.min(10, thickness * 0.45),
      );
      ctx.fill();
      ctx.strokeStyle = colors.textDim;
      ctx.lineWidth = 1;
      pathRoundRect(
        ctx,
        wireLeft,
        top,
        wireRight - wireLeft,
        thickness,
        Math.min(10, thickness * 0.45),
      );
      ctx.stroke();

      ctx.fillStyle = colors.pink;
      ctx.fillRect(wireLeft - 10, top - 4, 4, thickness + 8);
      ctx.fillStyle = colors.blue;
      ctx.fillRect(wireRight + 6, top - 4, 4, thickness + 8);

      // Cross-section inset
      const insetCX = w - 70;
      const insetCY = h / 2;
      const insetMaxR = Math.min(46, h / 2 - 30);
      const insetR = 8 + tFrac * (insetMaxR - 8);

      ctx.strokeStyle = colors.borderStrong;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(insetCX, insetCY, insetMaxR + 4, 0, Math.PI * 2);
      ctx.stroke();

      ctx.save();
      ctx.globalAlpha = 0.22;
      ctx.fillStyle = colors.accent;
      ctx.beginPath();
      ctx.arc(insetCX, insetCY, insetR, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(insetCX, insetCY, insetR, 0, Math.PI * 2);
      ctx.stroke();

      drawLabeledValue(ctx, {
        x: insetCX,
        y: insetCY + insetMaxR + 18,
        label: 'cross-section',
        value: A.toFixed(2),
        unit: 'mm²',
        align: 'center',
      });

      drawEyebrowStats(ctx, {
        x: wireLeft,
        y: 18,
        parts: ['Copper', `L = ${L.toFixed(1)} m`],
        color: colors.accent,
        size: 11,
      });
    },
    [],
  );

  return (
    <Demo
      figure={figure ?? 'Fig. 3.2'}
      title="Area divides resistance"
      question="Fatten the wire — what happens to R?"
      caption="Hold length and material fixed. Resistance is inversely proportional to cross-section: doubling the area halves the resistance, because there are twice as many parallel paths for current."
      deeperLab={{ slug: 'resistance', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={240} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="A"
          value={Amm2}
          min={0.1}
          max={10}
          step={0.05}
          format={(v) => v.toFixed(2) + ' mm²'}
          onChange={setAmm2}
        />
        <MiniReadout label="Resistance" value={<Num value={R} />} unit="Ω" />
      </DemoControls>
      <EquationStrip
        leftLabel="Geometric resistance"
        left={<InlineMath tex="R \;=\; \dfrac{\\rho L}{A}" />}
        rightLabel="Live substitution (Cu, L = 1 m)"
        right={
          <InlineMath
            tex={
              `R \\;=\\; \\dfrac{1.68\\times 10^{-8} \\times 1}` +
              `{${Amm2.toFixed(2)}\\times 10^{-6}} \\;\\approx\\; ${R.toExponential(2)}\\ \\Omega`
            }
          />
        }
      />
    </Demo>
  );
}
