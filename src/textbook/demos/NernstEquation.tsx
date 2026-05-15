/**
 * Demo 18.3 — Nernst equation
 *
 * V = V° − (RT / nF) · ln(Q) for a Cu/Zn galvanic cell.
 * Sliders: anode-side [Zn²⁺], cathode-side [Cu²⁺], temperature T.
 * Standard conditions (both ions at 1 M, T = 298 K) give V = V° = 1.10 V.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import {
  Demo, DemoControls, MiniReadout, MiniSlider,
} from '@/components/Demo';
import { Num } from '@/components/Num';
import { getCanvasColors } from '@/lib/canvasTheme';

interface Props { figure?: string }

const R_GAS = 8.314462618; // J / (mol·K)
const F_FARADAY = 96485.33212; // C / mol
const V_STD = 1.10; // V° for Cu²⁺/Cu | Zn/Zn²⁺
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
  const V = V_STD - (R_GAS * T / (N_ELECTRONS * F_FARADAY)) * Math.log(Q);

  const stateRef = useRef({ V, V_STD });
  useEffect(() => { stateRef.current = { V, V_STD }; }, [V]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w: W, h: H } = info;
    let raf = 0;

    function draw() {
      const s = stateRef.current;
      ctx.fillStyle = getCanvasColors().bg;
      ctx.fillRect(0, 0, W, H);

      // Plot V vs ln(Q) for current T, with marker
      const pX = 36, pY = 26;
      const pW = W - 60, pH = H - 60;
      ctx.strokeStyle = getCanvasColors().border;
      ctx.strokeRect(pX, pY, pW, pH);

      // V range: V° ± 0.4 V (covers our Q sweep)
      const vMin = V_STD - 0.4;
      const vMax = V_STD + 0.4;
      const yV = (v: number) => pY + pH - ((v - vMin) / (vMax - vMin)) * pH;

      // x = ln(Q), Q range from 1e-6 to 1e6 → ln from -13.8 to +13.8
      const lqMin = -14;
      const lqMax = 14;
      const xLQ = (lq: number) => pX + ((lq - lqMin) / (lqMax - lqMin)) * pW;

      // V° dashed line
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = getCanvasColors().accent;
      ctx.setLineDash([4, 4]);
      const ystd = yV(V_STD);
      ctx.beginPath(); ctx.moveTo(pX, ystd); ctx.lineTo(pX + pW, ystd); ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = 0.75;
      ctx.fillStyle = getCanvasColors().accent;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.fillText('V° = 1.10 V', pX + pW - 4, ystd - 2);

      // Nernst line: V = V° − (RT/nF)·lnQ
      const slope = R_GAS * T / (N_ELECTRONS * F_FARADAY);
      ctx.restore();
      ctx.strokeStyle = getCanvasColors().teal;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (let i = 0; i <= 80; i++) {
        const lq = lqMin + (i / 80) * (lqMax - lqMin);
        const v = V_STD - slope * lq;
        const x = xLQ(lq);
        const y = yV(v);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Current point
      const lqNow = Math.log(Q);
      const px = xLQ(Math.max(lqMin, Math.min(lqMax, lqNow)));
      const py = yV(Math.max(vMin, Math.min(vMax, s.V)));
      ctx.fillStyle = getCanvasColors().pink;
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.save();
      ctx.globalAlpha = 0.4;
      ctx.strokeStyle = getCanvasColors().pink;
      ctx.beginPath();
      ctx.arc(px, py, 9, 0, Math.PI * 2);
      ctx.stroke();

      // Axes
      ctx.restore();
      ctx.fillStyle = getCanvasColors().textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('V (cell potential)', pX, 6);
      ctx.textAlign = 'right';
      ctx.fillText('ln Q', pX + pW, pY + pH + 4);
      ctx.textAlign = 'left';
      ctx.fillText(`T = ${T.toFixed(0)} K`, pX, pY + pH + 4);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [T]);

  return (
    <Demo
      figure={figure ?? 'Fig. 18.3'}
      title="The Nernst equation"
      question="How does ion concentration shift the cell voltage?"
      caption={
        <>
          For Cu²⁺ + Zn → Cu + Zn²⁺ the reaction quotient is <em>Q = [Zn²⁺] / [Cu²⁺]</em>. At standard conditions
          (Q = 1, T = 298 K) the cell sits at <strong>V° = 1.10 V</strong>. Increase product [Zn²⁺] or decrease
          reactant [Cu²⁺] and Q rises; V drops. The slope <em>RT/nF</em> at room temperature is about 12.8 mV per
          natural-log unit (≈ 29.6 mV per decade).
        </>
      }
    >
      <AutoResizeCanvas height={240} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="[Zn²⁺]"
          value={logZn} min={-4} max={1} step={0.05}
          format={v => `10^${v.toFixed(1)} M`}
          onChange={setLogZn}
        />
        <MiniSlider
          label="[Cu²⁺]"
          value={logCu} min={-4} max={1} step={0.05}
          format={v => `10^${v.toFixed(1)} M`}
          onChange={setLogCu}
        />
        <MiniSlider
          label="T"
          value={T} min={250} max={373} step={1}
          format={v => v.toFixed(0) + ' K'}
          onChange={setT}
        />
        <MiniReadout label="Q" value={<Num value={Q} />} />
        <MiniReadout label="V_cell" value={<Num value={V} />} unit="V" />
      </DemoControls>
    </Demo>
  );
}
