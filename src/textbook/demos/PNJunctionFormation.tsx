/**
 * Demo D14.2 — p-n junction in (forward / zero / reverse) bias.
 *
 * Two halves of a silicon crystal side by side: n-type on the left
 * (electrons; pink dots) and p-type on the right (holes; blue circles).
 * Between them, a depletion region whose width is set by the applied
 * bias. The built-in potential at zero bias is V_bi ≈ 0.7 V for a
 * typical Si junction (Streetman & Banerjee §5.2); forward bias shrinks
 * the depletion width, reverse bias grows it. Arrows for the diffusion
 * and drift currents flip direction with bias.
 *
 * Visual model:
 *   depletion width  ∝ √(V_bi − V_applied)        (V_applied < V_bi)
 *                    = pinned-narrow when V_applied ≥ V_bi (just visual)
 */
import { useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';
import { Demo, DemoControls, EquationStrip, MiniReadout, MiniSlider } from '@/components/Demo';
import { InlineMath } from '@/components/Formula';
import { drawLabel } from "@/lib/canvasLayout";

interface Props {
  figure: string;
}

const V_BI = 0.7; // built-in potential, V

export function PNJunctionFormationDemo({ figure }: Props) {
  const [Vbias, setVbias] = useState(0);

  // Depletion width relative to zero-bias (W_0 = 1).
  const w_rel = Math.max(0.18, Math.sqrt(Math.max(0, V_BI - Vbias) / V_BI));

  const stateRef = useSimState({ Vbias });

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, colors }, state, _dt, _simTime, carriers) => {
      const { Vbias } = state;
      const w_rel = Math.max(0.18, Math.sqrt(Math.max(0, V_BI - Vbias) / V_BI));

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      const padL = 30,
        padR = 30,
        padT = 26,
        padB = 26;
      const plotW = w - padL - padR;
      const plotH = h - padT - padB;

      // depletion centred at x = 0.5; half-width = (w_rel * 0.18)
      const dHalf = 0.18 * w_rel;
      const xL = 0.5 - dHalf;
      const xR = 0.5 + dHalf;

      // n-side (left) — soft pink wash
      ctx.save();
      ctx.globalAlpha = 0.06;
      ctx.fillStyle = colors.pink;
      ctx.fillRect(padL, padT, plotW * xL, plotH);
      // p-side (right) — soft blue wash
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = 0.06;
      ctx.fillStyle = colors.blue;
      ctx.fillRect(padL + plotW * xR, padT, plotW * (1 - xR), plotH);
      // depletion region — neutral
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = 0.04;
      ctx.fillStyle = colors.text;
      ctx.fillRect(padL + plotW * xL, padT, plotW * (xR - xL), plotH);

      // depletion boundary lines
      ctx.restore();
      ctx.strokeStyle = colors.borderStrong;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(padL + plotW * xL, padT);
      ctx.lineTo(padL + plotW * xL, padT + plotH);
      ctx.moveTo(padL + plotW * xR, padT);
      ctx.lineTo(padL + plotW * xR, padT + plotH);
      ctx.stroke();
      ctx.setLineDash([]);

      // ionised dopants inside the depletion region: negative acceptor ions on
      // the p-side half, positive donor ions on the n-side half.
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const nIons = 6;
      for (let i = 0; i < nIons; i++) {
        // p-side of depletion (negative ions)
        const xp = padL + plotW * (xL + ((i + 0.5) / nIons) * (0.5 - xL));
        const yp = padT + plotH * (0.15 + 0.7 * ((i * 0.37) % 1));
        ctx.fillStyle = colors.blue;
        ctx.fillText('−', xp, yp);
        // n-side of depletion (positive ions)
        const xn = padL + plotW * (0.5 + ((i + 0.5) / nIons) * (xR - 0.5));
        const yn = padT + plotH * (0.15 + 0.7 * ((i * 0.41 + 0.13) % 1));
        ctx.fillStyle = colors.pink;
        ctx.fillText('+', xn, yn);
      }

      // built-in field arrow inside the depletion (left ← right convention:
      // E points from + (n-side) to − (p-side) i.e. from right boundary toward left,
      // but the convention for a p-n junction is E points from n to p inside the
      // depletion. We draw it from n-side ions toward p-side ions.
      const arrowY = padT + plotH * 0.5;
      const arrowL = padL + plotW * (0.5 + dHalf * 0.3);
      const arrowR = padL + plotW * (0.5 + dHalf * 0.85);
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(arrowR, arrowY);
      ctx.lineTo(arrowL, arrowY);
      ctx.stroke();
      // arrowhead pointing left (from n toward p means actually rightward for
      // the field; but in standard textbook diagrams E_built-in points from the
      // positive n-side dopants toward the negative p-side dopants — to the LEFT).
      ctx.beginPath();
      ctx.moveTo(arrowL, arrowY);
      ctx.lineTo(arrowL + 5, arrowY - 4);
      ctx.lineTo(arrowL + 5, arrowY + 4);
      ctx.closePath();
      ctx.fillStyle = colors.accent;
      ctx.fill();
      drawLabel(ctx, { text: 'E_built-in', x: (arrowL + arrowR) / 2, y: arrowY - 8, color: colors.accent, font: '10px "JetBrains Mono", monospace', align: 'center', baseline: 'bottom' });

      // carrier dots — drift slightly with bias.
      // Forward bias: carriers cross the junction (left→right for electrons,
      // right→left for holes). Reverse: they get pushed away from it.
      const driftBias = (Vbias - 0) * 0.0008;
      for (const c of carriers) {
        if (c.kind === 'e') {
          c.x += driftBias + 0.0003 * (Math.random() - 0.5);
        } else {
          c.x += -driftBias + 0.0003 * (Math.random() - 0.5);
        }
        // wrap within domains (no crossing depletion for visual cleanliness)
        if (c.kind === 'e') {
          if (c.x < 0) c.x = xL - 0.02;
          if (c.x > xL) c.x = 0;
        } else {
          if (c.x > 1) c.x = xR + 0.02;
          if (c.x < xR) c.x = 1;
        }
      }
      // draw carriers
      for (const c of carriers) {
        const cx = padL + plotW * c.x;
        const cy = padT + plotH * c.y;
        if (c.kind === 'e') {
          ctx.fillStyle = colors.pink;
          ctx.beginPath();
          ctx.arc(cx, cy, 2.6, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.save();
          ctx.globalAlpha = 0.85;
          ctx.strokeStyle = colors.blue;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(cx, cy, 2.6, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      }

      // labels
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.textBaseline = 'top';
      drawLabel(ctx, { text: 'n-type', x: padL + 6, y: padT + 4, color: colors.pink, weight: 'bold', size: 11, font: 'bold 11px "JetBrains Mono", monospace', baseline: 'top' });
      drawLabel(ctx, { text: 'p-type', x: padL + plotW - 6, y: padT + 4, color: colors.blue, weight: 'bold', size: 11, font: 'bold 11px "JetBrains Mono", monospace', align: 'right', baseline: 'top' });

      // depletion region label
      drawLabel(ctx, { text: `depletion region   (W/W₀ = ${w_rel.toFixed(2)})`, x: padL + plotW * 0.5, y: padT + plotH - 16, color: colors.text, font: '10px "JetBrains Mono", monospace', align: 'center', baseline: 'top' });

      // header
      ctx.fillStyle = colors.textDim;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      let mode = 'zero bias';
      if (Vbias > 0.01) mode = 'forward bias';
      else if (Vbias < -0.01) mode = 'reverse bias';
      drawLabel(ctx, { text: `V_applied = ${Vbias.toFixed(2)} V   ·   ${mode}   ·   V_bi = ${V_BI.toFixed(2)} V`, x: padL, y: 6 });

    },
    [],
    () => {
      type Carrier = { x: number; y: number; vx: number; kind: 'e' | 'h' };
      const carriers: Carrier[] = [];
      const N_EACH = 36;
      for (let i = 0; i < N_EACH; i++) {
        carriers.push({
          x: Math.random() * 0.45,
          y: 0.15 + Math.random() * 0.7,
          vx: 0,
          kind: 'e',
        });
        carriers.push({
          x: 0.55 + Math.random() * 0.45,
          y: 0.15 + Math.random() * 0.7,
          vx: 0,
          kind: 'h',
        });
      }
      return { context: carriers };
    },
  );

  return (
    <Demo
      figure={figure}
      title="A p-n junction under bias"
      question="What happens to the depletion region when you forward-bias or reverse-bias the junction?"
      caption={
        <>
          Pink dots are electrons (n-type majority); blue circles are holes (p-type majority). The
          neutral strip between is the depletion region — empty of mobile carriers, populated only
          by ionised dopants. Forward bias (V {'>'} 0) narrows it; reverse bias (V {'<'} 0) widens
          it. Width scales as{' '}
          <em>
            W ∝ √(V<sub>bi</sub> − V)
          </em>
          .
        </>
      }
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="V_applied"
          value={Vbias}
          min={-3}
          max={0.7}
          step={0.01}
          format={(v) => v.toFixed(2) + ' V'}
          onChange={setVbias}
        />
        <MiniReadout label="V_bi" value={V_BI.toFixed(2)} unit="V" />
        <MiniReadout label="W/W₀" value={w_rel.toFixed(2)} />
      </DemoControls>
      <EquationStrip
        leftLabel="Depletion width"
        left={<InlineMath tex={`\\frac{W}{W_0} = \\sqrt{\\frac{V_{bi} - V_{\\text{applied}}}{V_{bi}}}`} />}
        rightLabel="Live values"
        right={<InlineMath tex={`\\sqrt{\\frac{${V_BI.toFixed(2)} - (${Vbias.toFixed(2)})}{${V_BI.toFixed(2)}}} = ${w_rel.toFixed(2)}`} />}
      />
    </Demo>
  );
}
