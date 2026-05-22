/**
 * Demo D11.6 — A single water molecule in an external field
 *
 * H-O-H molecule with permanent dipole moment p along the bisector. Toggle the
 * external E field on/off; with E on, the molecule rotates toward alignment.
 * Temperature slider changes the random angular kick — at higher T, alignment
 * is weaker and the static ε_r drops. The on-screen "ε_r estimate" follows
 * the Langevin form C/T (illustrative only — calibrated so T=300 K gives ~80
 * and lower temperatures push higher).
 */
import { useState } from 'react';
import { drawLabel } from '@/lib/canvasLayout';
import { withAlpha } from '@/lib/canvasTheme';
import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider, MiniToggle } from '@/components/Demo';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

interface Props {
  figure?: string;
}

export function WhyWaterPolarizesDemo({ figure }: Props) {
  const [E_on, setE_on] = useState(true);
  const [T, setT] = useState(300); // Kelvin
  const stateRef = useSimState({ E_on, T });
  // Illustrative: ε_r ∝ C/T (Curie-Langevin form), calibrated so T=300 ⇒ 80
  const er_estimate = (80 * 300) / T;

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, colors }, _state, _dt, _simTime, ctx0) => {
      let theta = ctx0.theta;
      let omega = ctx0.omega;
      const { E_on, T } = stateRef.current;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);
      if (E_on) {
        ctx.strokeStyle = withAlpha(colors.accent, 0.2);
        ctx.lineWidth = 1;
        for (let y = 26; y < h; y += 40) {
          ctx.beginPath();
          ctx.moveTo(20, y);
          ctx.lineTo(w - 20, y);
          ctx.stroke();
          ctx.fillStyle = withAlpha(colors.accent, 0.4);
          ctx.beginPath();
          ctx.moveTo(w - 20, y);
          ctx.lineTo(w - 28, y - 4);
          ctx.lineTo(w - 28, y + 4);
          ctx.closePath();
          ctx.fill();
        }
      }
      const E_strength = E_on ? 0.06 : 0;
      const noiseAmp = Math.sqrt(T / 300) * 0.18;
      const torque = -E_strength * Math.sin(theta) + (Math.random() - 0.5) * noiseAmp;
      omega = (omega + torque) * 0.86;
      theta += omega;
      const cx = w / 2,
        cy = h / 2;
      const bondLen = 50;
      const hOffsetAng = (104.5 * Math.PI) / 180 / 2;
      const hAng1 = theta + Math.PI - hOffsetAng;
      const hAng2 = theta + Math.PI + hOffsetAng;
      const h1x = cx + Math.cos(hAng1) * bondLen;
      const h1y = cy + Math.sin(hAng1) * bondLen;
      const h2x = cx + Math.cos(hAng2) * bondLen;
      const h2y = cy + Math.sin(hAng2) * bondLen;
      ctx.strokeStyle = colors.borderStrong;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(h1x, h1y);
      ctx.moveTo(cx, cy);
      ctx.lineTo(h2x, h2y);
      ctx.stroke();
      ctx.fillStyle = colors.blue;
      ctx.beginPath();
      ctx.arc(cx, cy, 22, 0, Math.PI * 2);
      ctx.fill();
      drawLabel(ctx, { text: 'O', x: cx, y: cy, color: colors.bg, weight: 'bold', size: 14, font: 'bold 14px "JetBrains Mono", monospace', align: 'center', baseline: 'middle' });
      for (const [hx, hy] of [
        [h1x, h1y],
        [h2x, h2y],
      ]) {
        ctx.fillStyle = colors.pink;
        ctx.beginPath();
        ctx.arc(hx, hy, 12, 0, Math.PI * 2);
        ctx.fill();
        drawLabel(ctx, {
          x: hx,
          y: hy,
          text: 'H',
          color: colors.bg,
          size: 11,
          weight: 'bold',
        });
      }
      const pLen = 56;
      const pTipX = cx + Math.cos(theta) * pLen;
      const pTipY = cy + Math.sin(theta) * pLen;
      ctx.strokeStyle = colors.accent;
      ctx.fillStyle = colors.accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(pTipX, pTipY);
      ctx.stroke();
      const ux = Math.cos(theta),
        uy = Math.sin(theta);
      ctx.beginPath();
      ctx.moveTo(pTipX, pTipY);
      ctx.lineTo(pTipX - ux * 9 - uy * 4, pTipY - uy * 9 + ux * 4);
      ctx.lineTo(pTipX - ux * 9 + uy * 4, pTipY - uy * 9 - ux * 4);
      ctx.closePath();
      ctx.fill();
      drawLabel(ctx, { text: 'p', x: pTipX + 8, y: pTipY, color: colors.accent, font: 'italic 12px "Fraunces", serif', baseline: 'middle' });
      ctx.fillStyle = colors.textDim;
      drawLabel(ctx, { text: `T = ${T.toFixed(0)} K`, x: 14, y: h - 16, font: '10px "JetBrains Mono", monospace' });
      drawLabel(ctx, { text: `θ = ${((theta * 180) / Math.PI).toFixed(0)}°`, x: w - 14, y: h - 16, font: '10px "JetBrains Mono", monospace', align: 'right' });
      if (E_on) {
        drawLabel(ctx, { text: 'E (external) →', x: 14, y: 18, color: colors.accent });
      }
      ctx0.theta = theta;
      ctx0.omega = omega;
    },
    [],
    () => ({ context: { theta: Math.PI / 4, omega: 0 } }),
  );

  return (
    <Demo
      figure={figure ?? 'Fig. 17.4'}
      title="Why water's ε_r is so large"
      question="A single water molecule already wants to align. Where does ε_r ≈ 80 come from?"
      caption={
        <>
          Water's geometry is bent (∼104.5°) and oxygen pulls electron density away from the
          hydrogens, leaving the molecule with a substantial <em>permanent</em> dipole moment (about
          6.2×10⁻³⁰ C·m, or 1.85 debye). In an external field these dipoles rotate toward alignment
          — and the resulting bulk polarization is huge compared to non-polar liquids. The static ε
          <sub>r</sub> follows the Langevin–Debye formula and falls as temperature rises (more
          thermal jitter, less alignment). Even at boiling point water still has ε<sub>r</sub> ≈ 55.
        </>
      }
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        <MiniToggle label={E_on ? 'E on' : 'E off'} checked={E_on} onChange={setE_on} />
        <MiniSlider
          label="T"
          value={T}
          min={200}
          max={500}
          step={1}
          format={(v) => v.toFixed(0) + ' K'}
          onChange={setT}
        />
        <MiniReadout label="ε_r (est.)" value={er_estimate.toFixed(0)} />
      </DemoControls>
    </Demo>
  );
}
