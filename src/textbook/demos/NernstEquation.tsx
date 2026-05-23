/**
 * Demo 18.3 — Nernst equation
 *
 * V = V° − (RT / nF) · ln(Q) for a Cu/Zn galvanic cell.
 * Sliders: anode-side [Zn²⁺], cathode-side [Cu²⁺], temperature T.
 * Standard conditions (both ions at 1 M, T = 298 K) give V = V° = 1.10 V.
 */
import { useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';
import { drawLabel } from "@/lib/canvasLayout";

interface Props {
  figure: string;
}

const R_GAS = 8.314462618; // J / (mol·K)
const F_FARADAY = 96485.33212; // C / mol
const V_STD = 1.1; // V° for Cu²⁺/Cu | Zn/Zn²⁺
const N_ELECTRONS = 2;

export function NernstEquationDemo({ figure }: Props) {
  // log-scaled molarity sliders, 1e-4 M .. 1 M
  const [logZn, setLogZn] = useState(0); // log10([Zn²⁺])
  const [logCu, setLogCu] = useState(0); // log10([Cu²⁺])
  const [T, setT] = useState(298); // K

  const Zn = Math.pow(10, logZn);
  const Cu = Math.pow(10, logCu);
  // For Cu²⁺ + Zn → Cu + Zn²⁺, the reaction quotient Q = [Zn²⁺] / [Cu²⁺]
  const Q = Zn / Cu;
  const V = V_STD - ((R_GAS * T) / (N_ELECTRONS * F_FARADAY)) * Math.log(Q);

  const stateRef = useSimState({ V, V_STD });
  const setup = useSimLoop(
    stateRef,
    ({ ctx, w: W, h: H, colors }, _state, _dt, _simTime) => {
      const s = stateRef.current;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, W, H);
      const pX = 36,
        pY = 26;
      const pW = W - 60,
        pH = H - 60;
      ctx.strokeStyle = colors.border;
      ctx.strokeRect(pX, pY, pW, pH);
      const vMin = V_STD - 0.4;
      const vMax = V_STD + 0.4;
      const yV = (v: number) => pY + pH - ((v - vMin) / (vMax - vMin)) * pH;
      const lqMin = -14;
      const lqMax = 14;
      const xLQ = (lq: number) => pX + ((lq - lqMin) / (lqMax - lqMin)) * pW;
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = colors.accent;
      ctx.setLineDash([4, 4]);
      const ystd = yV(V_STD);
      ctx.beginPath();
      ctx.moveTo(pX, ystd);
      ctx.lineTo(pX + pW, ystd);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = 0.75;
      drawLabel(ctx, { text: 'V° = 1.10 V', x: pX + pW - 4, y: ystd - 2, color: colors.accent, font: '10px "JetBrains Mono", monospace', align: 'right', baseline: 'bottom' });
      const slope = (R_GAS * T) / (N_ELECTRONS * F_FARADAY);
      ctx.restore();
      ctx.strokeStyle = colors.teal;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (let i = 0; i <= 80; i++) {
        const lq = lqMin + (i / 80) * (lqMax - lqMin);
        const v = V_STD - slope * lq;
        const x = xLQ(lq);
        const y = yV(v);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      const lqNow = Math.log(Q);
      const px = xLQ(Math.max(lqMin, Math.min(lqMax, lqNow)));
      const py = yV(Math.max(vMin, Math.min(vMax, s.V)));
      ctx.fillStyle = colors.pink;
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.save();
      ctx.globalAlpha = 0.4;
      ctx.strokeStyle = colors.pink;
      ctx.beginPath();
      ctx.arc(px, py, 9, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      ctx.fillStyle = colors.textDim;
      drawLabel(ctx, { text: 'V (cell potential)', x: pX, y: 6, font: '10px "JetBrains Mono", monospace', baseline: 'top' });
      drawLabel(ctx, { text: 'ln Q', x: pX + pW, y: pY + pH + 4, font: '10px "JetBrains Mono", monospace', align: 'right', baseline: 'top' });
      drawLabel(ctx, { text: `T = ${T.toFixed(0)} K`, x: pX, y: pY + pH + 4, font: '10px "JetBrains Mono", monospace', baseline: 'top' });
    },
    [],
  );

  return (
    <Demo
      figure={figure}
      title="The Nernst equation"
      question="How does ion concentration shift the cell voltage?"
      caption={
        <>
          For Cu²⁺ + Zn → Cu + Zn²⁺ the reaction quotient is <em>Q = [Zn²⁺] / [Cu²⁺]</em>. At
          standard conditions (Q = 1, T = 298 K) the cell sits at <strong>V° = 1.10 V</strong>.
          Increase product [Zn²⁺] or decrease reactant [Cu²⁺] and Q rises; V drops. The slope{' '}
          <em>RT/nF</em> at room temperature is about 12.8 mV per natural-log unit (≈ 29.6 mV per
          decade).
        </>
      }
    >
      <AutoResizeCanvas height={240} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="[Zn²⁺]"
          value={logZn}
          min={-4}
          max={1}
          step={0.05}
          format={(v) => `10^${v.toFixed(1)} M`}
          onChange={setLogZn}
        />
        <MiniSlider
          label="[Cu²⁺]"
          value={logCu}
          min={-4}
          max={1}
          step={0.05}
          format={(v) => `10^${v.toFixed(1)} M`}
          onChange={setLogCu}
        />
        <MiniSlider
          label="T"
          value={T}
          min={250}
          max={373}
          step={1}
          format={(v) => v.toFixed(0) + ' K'}
          onChange={setT}
        />
        <MiniReadout label="Q" value={<Num value={Q} />} />
        <MiniReadout label="V_cell" value={<Num value={V} />} unit="V" />
      </DemoControls>
    </Demo>
  );
}
