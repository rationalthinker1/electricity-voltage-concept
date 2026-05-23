/**
 * Demo D3.3 — Material picker
 *
 * At fixed V, L, A, swap the material and watch I (and P) collapse by
 * orders of magnitude. Copper carries ~1788 A; nichrome carries ~27 mA.
 */
import { useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, EquationStrip, MiniReadout } from '@/components/Demo';
import { InlineMath } from '@/components/Formula';
import { Num } from '@/components/Num';
import { drawLabel } from '@/lib/canvasLayout';
import { withAlpha } from '@/lib/canvasTheme';
import { fmtCurrent } from '@/lib/formatters';
import { MATERIALS, type MaterialKey } from '@/lib/physics';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

interface Props {
  figure: string;
}

const CHOICES: MaterialKey[] = ['copper', 'aluminum', 'iron', 'tungsten', 'nichrome'];

const V = 12;
const L = 1.0;
const A_mm2 = 2.5;
const A_m2 = A_mm2 * 1e-6;

export function MaterialPickerDemo({ figure }: Props) {
  const [mat, setMat] = useState<MaterialKey>('copper');

  const sigma = MATERIALS[mat]!.sigma;
  const R = L / (sigma * A_m2);
  const I = V / R;
  const P = V * I;

  const stateRef = useSimState({ mat });

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, colors }) => {
      const s = stateRef.current;
      const mat_ = s.mat;
      const sigma_ = MATERIALS[mat_]!.sigma;
      const R_ = L / (sigma_ * A_m2);
      const I_ = V / R_;

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      // Bar chart of currents across all 5 materials, log scale
      const padL = 110;
      const padR = 24;
      const padT = 34;
      const padB = 30;
      const innerW = w - padL - padR;
      const innerH = h - padT - padB;
      const rowH = innerH / CHOICES.length;

      const currents = CHOICES.map((k) => {
        const s_ = MATERIALS[k]!.sigma;
        return V / (L / (s_ * A_m2));
      });
      const logMax = Math.log10(Math.max(...currents)) + 0.5;
      const logMin = Math.log10(Math.min(...currents)) - 0.5;
      const logRange = logMax - logMin;

      ctx.strokeStyle = colors.border;
      ctx.beginPath();
      ctx.moveTo(padL, padT);
      ctx.lineTo(padL, h - padB);
      ctx.lineTo(w - padR, h - padB);
      ctx.stroke();

      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = colors.textDim;
      const decadeStart = Math.ceil(logMin);
      const decadeEnd = Math.floor(logMax);
      for (let d = decadeStart; d <= decadeEnd; d++) {
        const x = padL + ((d - logMin) / logRange) * innerW;
        ctx.strokeStyle = colors.border;
        ctx.beginPath();
        ctx.moveTo(x, padT);
        ctx.lineTo(x, h - padB);
        ctx.stroke();
        const label = d >= 0 ? `10^${d}` : `10⁻${-d}`;
        ctx.fillText(label.replace('10^', '10').replace('^', ''), x, h - padB + 14);
      }
      drawLabel(ctx, { text: 'current (A, log scale)', x: padL + innerW / 2, y: h - padB + 26 });

      CHOICES.forEach((k, i) => {
        const m = MATERIALS[k]!;
        const s_ = m.sigma;
        const ik = V / (L / (s_ * A_m2));
        const x0 = padL;
        const x1 = padL + ((Math.log10(ik) - logMin) / logRange) * innerW;
        const yMid = padT + rowH * (i + 0.5);
        const barH = Math.min(22, rowH * 0.55);
        const isSel = k === mat_;
        ctx.fillStyle = isSel ? withAlpha(colors.accent, 0.85) : withAlpha(colors.teal, 0.4);
        ctx.fillRect(x0, yMid - barH / 2, Math.max(1, x1 - x0), barH);
        ctx.strokeStyle = isSel ? colors.accent : withAlpha(colors.teal, 0.65);
        ctx.lineWidth = 1;
        ctx.strokeRect(x0, yMid - barH / 2, Math.max(1, x1 - x0), barH);

        ctx.fillStyle = isSel ? colors.accent : withAlpha(colors.text, 0.75);
        drawLabel(ctx, { text: m.name.replace(' (filament)', '').replace(' (heater)', '').toUpperCase(), x: padL - 10, y: yMid + 3, font: isSel
                    ? 'bold 10px "JetBrains Mono", monospace'
                    : '10px "JetBrains Mono", monospace', align: 'right' });

        ctx.fillStyle = isSel ? colors.accent : withAlpha(colors.textDim, 0.85);
        const txt = fmtCurrent(ik);
        drawLabel(ctx, { text: txt, x: Math.min(w - padR - 60, x1 + 6), y: yMid + 3, font: '10px "JetBrains Mono", monospace' });
      });

      drawLabel(ctx, {
        x: 10,
        y: 16,
        text: `V = ${V} V   ·   L = ${L} m   ·   A = ${A_mm2} mm²`,
        color: colors.accent,
        size: 11,
      });
      void I_;
    },
    [],
  );

  return (
    <Demo
      figure={figure}
      title="Material is destiny"
      question="Same wire geometry, same voltage. What current flows through each material?"
      caption="At V = 12 V across 1 m of 2.5 mm² wire, copper carries ~1.8 kA (it's basically a short circuit), while nichrome — designed for heating elements — carries about 27 mA. Five orders of magnitude, set entirely by σ."
      deeperLab={{ slug: 'ohms-law', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={260} setup={setup} />
      <DemoControls>
        {CHOICES.map((k) => (
          <button
            key={k}
            type="button"
            className={`mini-toggle${k === mat ? 'on' : ''}`}
            onClick={() => setMat(k)}
            aria-pressed={k === mat}
          >
            {MATERIALS[k]!.name.replace(' (filament)', '').replace(' (heater)', '')}
          </button>
        ))}
        <MiniReadout label="Current" value={<Num value={I} />} unit="A" />
        <MiniReadout label="Power" value={<Num value={P} />} unit="W" />
      </DemoControls>
      <EquationStrip
        leftLabel="Same V, L, A — material varies"
        left={<InlineMath tex="I \;=\; \dfrac{V \\sigma A}{L} \;=\; \dfrac{V}{R}" />}
        rightLabel={`Live substitution (${MATERIALS[mat]!.name})`}
        right={
          <InlineMath
            tex={
              `I \\;=\\; \\dfrac{12}{${R.toExponential(2)}} \\;\\approx\\; ` +
              `${I.toExponential(2)}\\ \\text{A}`
            }
          />
        }
      />
    </Demo>
  );
}

