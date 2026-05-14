/**
 * Demo D13.6 — Maximum power transfer
 *
 *   A real source: ideal V_Th in series with internal resistance R_S. Drive
 *   a load R_L.
 *
 *       I_L = V_Th / (R_S + R_L)
 *       P_L = I_L² R_L = V_Th² · R_L / (R_S + R_L)²
 *
 *   dP_L/dR_L = 0  ⇒  R_L = R_S
 *   P_L,max = V_Th² / (4 R_S)
 *   Efficiency at max-power = P_L / (P_L + P_RS) = R_L / (R_S + R_L) = 1/2.
 *
 *   AC variant: with Z_S = R_S + j X_S and Z_L = R_L + j X_L, the maximum
 *   power transfer condition is Z_L = Z_S* (conjugate). The reactances cancel
 *   in the series sum, the magnitude reduces to the real-only case, and
 *   P_L,max is reached at R_L = R_S, X_L = -X_S.
 *
 *   The demo plots P_L vs R_L on a normalized log-x axis from 0.05 R_S to
 *   20 R_S, marks the peak at R_L = R_S, shows the efficiency curve, and
 *   has a toggle for the AC case where the user adjusts X_S; conjugate
 *   matching sets X_L = -X_S automatically and recovers the same peak.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import {
  Demo, DemoControls, MiniReadout, MiniSlider, MiniToggle,
} from '@/components/Demo';
import { Num } from '@/components/Num';

interface Props { figure?: string }

export function MaxPowerTransferDemo({ figure }: Props) {
  const [V, setV] = useState(12);
  const [RS, setRS] = useState(4);
  const [RL, setRL] = useState(4);
  const [ac, setAc] = useState(false);
  const [XS, setXS] = useState(3);     // source reactance, Ω
  const [conjMatch, setConjMatch] = useState(true);

  // In AC mode, the load is R_L + j X_L. Conjugate matching sets X_L = -X_S.
  const XL = ac ? (conjMatch ? -XS : 0) : 0;
  // Impedance magnitude squared of the series sum
  const denom2_real = (RS + RL) * (RS + RL);
  const denom2 = ac
    ? (RS + RL) * (RS + RL) + (XS + XL) * (XS + XL)
    : denom2_real;
  // Real (average) power delivered to R_L
  const I_mag2 = (V * V) / denom2;        // |V_Th|² / |Z_total|²
  const P_L = I_mag2 * RL;
  const P_S = I_mag2 * RS;
  const eta = P_L / (P_L + P_S);          // = R_L / (R_S + R_L)
  const P_max = (V * V) / (4 * RS);

  const stateRef = useRef({ V, RS, RL, ac, XS, XL, conjMatch, P_L, P_max });
  useEffect(() => {
    stateRef.current = { V, RS, RL, ac, XS, XL, conjMatch, P_L, P_max };
  }, [V, RS, RL, ac, XS, XL, conjMatch, P_L, P_max]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, colors } = info;
    let raf = 0;

    function draw() {
      const { V, RS, RL, ac, XS, XL, P_L, P_max } = stateRef.current;

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      const padL = 56, padR = 16, padT = 32, padB = 38;
      const plotW = w - padL - padR;
      const plotH = h - padT - padB;

      // Axes
      ctx.strokeStyle = colors.borderStrong;
      ctx.lineWidth = 1;
      ctx.strokeRect(padL, padT, plotW, plotH);

      // X-axis: log of R_L / R_S, from 1/20 to 20
      const lo = Math.log(1 / 20);
      const hi = Math.log(20);
      const xOf = (r: number) => padL + ((Math.log(r) - lo) / (hi - lo)) * plotW;
      const yOf = (p: number) => padT + plotH - (p / (P_max * 1.05)) * plotH;
      const yOfEta = (e: number) => padT + plotH - e * plotH;

      // P_L(R_L) curve
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      const N = 200;
      for (let i = 0; i <= N; i++) {
        const r = Math.exp(lo + (hi - lo) * (i / N));
        const RL_i = r * RS;
        const den2 = ac
          ? (RS + RL_i) * (RS + RL_i) + (XS + XL) * (XS + XL)
          : (RS + RL_i) * (RS + RL_i);
        const p = (V * V * RL_i) / den2;
        const x = padL + (i / N) * plotW;
        const y = yOf(p);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Efficiency curve η = R_L / (R_S + R_L) (only real-part bookkeeping;
      // shape is the same for the AC conjugate-matched case at each R_L)
      ctx.strokeStyle = colors.teal;
      ctx.lineWidth = 1.4;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      for (let i = 0; i <= N; i++) {
        const r = Math.exp(lo + (hi - lo) * (i / N));
        const eta_i = r / (1 + r);
        const x = padL + (i / N) * plotW;
        const y = yOfEta(eta_i);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Vertical line at R_L = R_S
      const xPeak = xOf(1);
      ctx.strokeStyle = 'rgba(255,107,42,0.55)';
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(xPeak, padT); ctx.lineTo(xPeak, padT + plotH);
      ctx.stroke();
      ctx.setLineDash([]);

      // Current R_L marker (cursor)
      const xCur = xOf(RL / RS);
      const yCur = yOf(P_L);
      ctx.fillStyle = colors.accent;
      ctx.beginPath(); ctx.arc(xCur, yCur, 5, 0, Math.PI * 2); ctx.fill();

      // Labels
      ctx.fillStyle = colors.textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('P_L  (W)  — amber', 12, 12);
      ctx.fillStyle = colors.teal;
      ctx.fillText('η  — teal dashed', 12, 26);

      // x-axis ticks
      ctx.fillStyle = colors.textDim;
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      for (const r of [0.1, 0.5, 1, 2, 5, 10]) {
        const x = xOf(r);
        ctx.fillStyle = 'rgba(255,255,255,0.10)';
        ctx.beginPath(); ctx.moveTo(x, padT); ctx.lineTo(x, padT + plotH); ctx.stroke();
        ctx.fillStyle = colors.textDim;
        ctx.fillText(`${r}·R_S`, x, padT + plotH + 4);
      }

      // y-axis tick: P_max
      ctx.fillStyle = colors.textDim;
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(`P_max = ${P_max.toFixed(2)} W`, padL - 4, yOf(P_max));
      ctx.fillText('0', padL - 4, padT + plotH);
      ctx.fillText('1', padL - 4, padT);

      // Peak label
      ctx.fillStyle = colors.accent;
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText('R_L = R_S  →  η = 50 %', xPeak, padT - 6);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 13.6'}
      title="Maximum power transfer — match, don't over-match"
      question="P_L peaks at R_L = R_S. Efficiency at that peak is exactly 50%."
      caption={<>
        Slide R<sub>L</sub> through the source's internal resistance. Power delivered
        to the load peaks at R<sub>L</sub> = R<sub>S</sub> with P<sub>L,max</sub>
        = V<sub>Th</sub>² / (4 R<sub>S</sub>); the other half of the source's output
        is wasted inside R<sub>S</sub>. Switch to AC: with Z<sub>S</sub> = R<sub>S</sub>
        + jX<sub>S</sub>, the conjugate match Z<sub>L</sub> = Z<sub>S</sub><sup>*</sup>
        recovers the same peak; an unmatched reactance pushes the operating point
        down the curve.
      </>}
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        <MiniSlider label="V_Th" value={V} min={1} max={24} step={0.5}
          format={v => v.toFixed(1) + ' V'} onChange={setV} />
        <MiniSlider label="R_S" value={RS} min={0.5} max={20} step={0.5}
          format={v => v.toFixed(1) + ' Ω'} onChange={setRS} />
        <MiniSlider label="R_L" value={RL} min={0.2} max={80} step={0.2}
          format={v => v.toFixed(1) + ' Ω'} onChange={setRL} />
        <MiniToggle label={ac ? 'AC' : 'DC'} checked={ac} onChange={setAc} />
        {ac && (
          <MiniSlider label="X_S" value={XS} min={-20} max={20} step={0.5}
            format={v => v.toFixed(1) + ' Ω'} onChange={setXS} />
        )}
        {ac && (
          <MiniToggle
            label={conjMatch ? 'X_L = −X_S (conj)' : 'X_L = 0'}
            checked={conjMatch}
            onChange={setConjMatch}
          />
        )}
        <MiniReadout label="P_L" value={<Num value={P_L} digits={3} />} unit="W" />
        <MiniReadout label="P_L,max" value={<Num value={P_max} digits={3} />} unit="W" />
        <MiniReadout label="Efficiency" value={<Num value={eta * 100} digits={1} />} unit="%" />
      </DemoControls>
    </Demo>
  );
}
