/**
 * Demo D1.1 — Two point charges
 *
 * The simplest possible interactive electrostatics demo: two charges, each
 * with a sign toggle, drawn with a force vector that points the right way.
 * Reader plays with same-sign vs opposite-sign and watches attraction flip.
 */
import { useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import {
  Demo,
  DemoControls,
  EquationStrip,
  MiniReadout,
  MiniSlider,
  MiniToggle,
} from '@/components/Demo';
import { InlineMath } from '@/components/Formula';
import { Num } from '@/components/Num';
import { drawLabel } from '@/lib/canvasLayout';
import { drawArrow, drawCharge } from '@/lib/canvasPrimitives';
import { withAlpha } from '@/lib/canvasTheme';
import { PHYS, sciTeX } from '@/lib/physics';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

interface Props {
  figure: string;
}

export function TwoChargesDemo({ figure }: Props) {
  const [q1Pos, setQ1Pos] = useState(true); // true = +, false = −
  const [q2Pos, setQ2Pos] = useState(false);
  const [magNC, setMagNC] = useState(5); // shared magnitude in nC
  const [rCm, setRCm] = useState(15); // separation in cm

  // Computed force — used in both readout and arrow length
  const q1 = (q1Pos ? 1 : -1) * magNC * 1e-9;
  const q2 = (q2Pos ? 1 : -1) * magNC * 1e-9;
  const r = rCm * 1e-2;
  const F = (PHYS.k * q1 * q2) / (r * r); // signed
  const sameSign = Math.sign(q1) === Math.sign(q2);

  const stateRef = useSimState({ q1Pos, q2Pos, magNC, rCm });

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, colors }) => {
      const s = stateRef.current;
      const sameSign_ = s.q1Pos === s.q2Pos;
      const F_ =
        (PHYS.k * (s.q1Pos ? 1 : -1) * (s.q2Pos ? 1 : -1) * (s.magNC * 1e-9) ** 2) /
        (s.rCm * 1e-2) ** 2;

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      // Map cm to pixels: full canvas spans 30 cm → centered.
      const cmPerPx = 30 / w;
      const cy = h / 2;
      const cxMid = w / 2;
      const cx1 = cxMid - s.rCm / 2 / cmPerPx;
      const cx2 = cxMid + s.rCm / 2 / cmPerPx;

      // Distance line
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = withAlpha(colors.text, 0.2);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx1, cy);
      ctx.lineTo(cx2, cy);
      ctx.stroke();
      ctx.setLineDash([]);
      drawLabel(ctx, {
        x: cxMid,
        y: cy - 12,
        text: `${s.rCm.toFixed(1)} cm`,
        color: withAlpha(colors.textDim, 0.85),
        align: 'center',
      });

      // Force arrows on each charge
      const arrowLen = Math.min(110, 24 + Math.log10(Math.abs(F_) + 1) * 13);
      const dir1 = sameSign_ ? -1 : +1; // points from 1 toward 2 if attractive
      if (Math.abs(F_) > 1e-30) {
        drawArrow(
          ctx,
          { x: cx1 + dir1 * 18, y: cy },
          { x: cx1 + dir1 * arrowLen, y: cy },
          {
            color: withAlpha(colors.accent, 0.95),
            lineWidth: 2,
          },
        );
        drawArrow(
          ctx,
          { x: cx2 - dir1 * 18, y: cy },
          { x: cx2 - dir1 * arrowLen, y: cy },
          {
            color: withAlpha(colors.accent, 0.95),
            lineWidth: 2,
          },
        );
      }

      // Charges
      drawCharge(
        ctx,
        { x: cx1, y: cy },
        {
          color: s.q1Pos ? colors.pink : colors.blue,
          label: 'Q₁',
          radius: 12 + Math.min(8, s.magNC * 0.7),
          sign: s.q1Pos ? '+' : '−',
          textColor: colors.bg,
        },
      );
      drawCharge(
        ctx,
        { x: cx2, y: cy },
        {
          color: s.q2Pos ? colors.pink : colors.blue,
          label: 'Q₂',
          radius: 12 + Math.min(8, s.magNC * 0.7),
          sign: s.q2Pos ? '+' : '−',
          textColor: colors.bg,
        },
      );
    },
    [],
  );

  // Signed product of charges, in C² — used in the EquationStrip substitution.
  const q1q2 = q1 * q2;

  return (
    <Demo
      figure={figure}
      title="Two point charges"
      question="Same sign or opposite — what changes?"
      caption="Toggle the signs to flip attraction and repulsion. The arrow length grows like log|F| because the force changes by orders of magnitude as you slide the separation."
      deeperLab={{ slug: 'coulomb', label: 'See full lab' }}
    >
      <div style={{ position: 'relative' }}>
        <AutoResizeCanvas height={260} setup={setup} />
      </div>
      <DemoControls>
        <MiniToggle label={`Q₁ ${q1Pos ? '+' : '−'}`} checked={q1Pos} onChange={setQ1Pos} />
        <MiniToggle label={`Q₂ ${q2Pos ? '+' : '−'}`} checked={q2Pos} onChange={setQ2Pos} />
        <MiniSlider
          label="|Q|"
          value={magNC}
          min={0.1}
          max={10}
          step={0.1}
          format={(v) => v.toFixed(1) + ' nC'}
          onChange={setMagNC}
        />
        <MiniSlider
          label="separation"
          value={rCm}
          min={1}
          max={28}
          step={0.1}
          format={(v) => v.toFixed(1) + ' cm'}
          onChange={setRCm}
        />
        <MiniReadout
          label={sameSign ? 'Repulsive |F|' : 'Attractive |F|'}
          value={<Num value={Math.abs(F)} />}
          unit="N"
        />
      </DemoControls>
      <EquationStrip
        leftLabel="Coulomb's law"
        left={<InlineMath tex="F \;=\; \dfrac{k\, Q_1 Q_2}{r^{2}}" />}
        rightLabel="Live substitution"
        right={
          <InlineMath
            tex={
              `F \\;=\\; \\dfrac{(8.99\\times 10^{9})` +
              `(${sciTeX(q1q2)})}` +
              `{(${r.toFixed(3)})^{2}} \\;\\approx\\; ` +
              `${sciTeX(F)}\\ \\text{N}`
            }
          />
        }
      />
    </Demo>
  );
}
