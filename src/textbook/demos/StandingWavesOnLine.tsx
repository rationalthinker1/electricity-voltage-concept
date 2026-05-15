/**
 * Demo D12.14 — Standing-wave envelope on a mismatched line
 *
 * Continuous sine source. The voltage along a lossless line with
 * incident amplitude A and load reflection Γ is
 *
 *   V(x,t) = A [ e^{-jβx} + Γ e^{+jβx} ] e^{jωt}
 *   |V(x)| = A √[ 1 + |Γ|² + 2|Γ| cos(2βx + φ) ]
 *
 * Maximum |V_max| = A(1+|Γ|), minimum |V_min| = A(1−|Γ|),
 * VSWR = V_max / V_min = (1+|Γ|)/(1−|Γ|).
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { drawGlowPath } from '@/lib/canvasPrimitives';
import { Num } from '@/components/Num';

interface Props { figure?: string }

const Z0 = 50;

export function StandingWavesOnLineDemo({ figure }: Props) {
  const [ZL, setZL] = useState(150);
  const [wavelengths, setWavelengths] = useState(2.0); // line length in λ

  // Reflection coefficient (purely real load)
  const Gamma = (ZL - Z0) / (ZL + Z0);
  const absG = Math.abs(Gamma);
  const Vmax = 1 + absG;
  const Vmin = Math.max(1 - absG, 1e-6);
  const VSWR = absG >= 1 ? Infinity : Vmax / Vmin;

  const stateRef = useRef({ Gamma, wavelengths });
  useEffect(() => { stateRef.current = { Gamma, wavelengths }; }, [Gamma, wavelengths]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, colors } = info;
    let raf = 0;
    const t0 = performance.now();

    function draw() {
      const { Gamma, wavelengths } = stateRef.current;
      const phase = ((performance.now() - t0) / 1000) * 2 * Math.PI * 0.8;

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      const padL = 50, padR = 30, padT = 24, padB = 36;
      const plotX = padL, plotY = padT;
      const plotW = w - padL - padR;
      const plotH = h - padT - padB;

      ctx.strokeStyle = colors.border;
      ctx.strokeRect(plotX, plotY, plotW, plotH);

      // y axis ±2.2
      const yMax = 2.2;
      const yV = (v: number) => plotY + plotH / 2 - (v / yMax) * (plotH / 2 - 4);

      // gridlines
      ctx.strokeStyle = colors.border;
      for (let v = -2; v <= 2; v++) {
        const y = yV(v);
        ctx.beginPath(); ctx.moveTo(plotX, y); ctx.lineTo(plotX + plotW, y); ctx.stroke();
      }
      ctx.strokeStyle = colors.borderStrong;
      ctx.beginPath(); ctx.moveTo(plotX, yV(0)); ctx.lineTo(plotX + plotW, yV(0)); ctx.stroke();

      // x is position from source (left) to load (right) measured in wavelengths
      // Load is at x = wavelengths, so β x = 2π x.
      const N = 400;
      // Instantaneous V(x,t) trace — sine that "stands" with moving phase
      const vPts: { x: number; y: number }[] = [];
      for (let i = 0; i <= N; i++) {
        const u = i / N;
        const x = u * wavelengths;
        // Position measured from load: d = wavelengths - x (load at d=0)
        const d = wavelengths - x;
        // V = A[ e^{-jβx}·e^{jωt} + Γ e^{+jβx} e^{jωt} ]  → real part:
        // V(x,t) = cos(ωt - 2π x) + Γ cos(ωt + 2π x)
        // We treat Γ as real (resistive load).
        const v = Math.cos(phase - 2 * Math.PI * x)
                + Gamma * Math.cos(phase + 2 * Math.PI * x);
        void d;
        vPts.push({ x: plotX + u * plotW, y: yV(v) });
      }
      drawGlowPath(ctx, vPts, {
        color: 'rgba(255,107,42,0.95)',
        lineWidth: 1.6,
        glowColor: 'rgba(255,107,42,0.35)',
        glowWidth: 5,
      });

      // Envelope ±|V(x)|
      ctx.strokeStyle = 'rgba(108,197,194,0.75)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      for (let i = 0; i <= N; i++) {
        const u = i / N;
        const x = u * wavelengths;
        const mag = Math.sqrt(
          1 + Gamma * Gamma + 2 * Gamma * Math.cos(2 * 2 * Math.PI * x)
        );
        const X = plotX + u * plotW;
        const Y = yV(mag);
        if (i === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y);
      }
      ctx.stroke();
      ctx.beginPath();
      for (let i = 0; i <= N; i++) {
        const u = i / N;
        const x = u * wavelengths;
        const mag = Math.sqrt(
          1 + Gamma * Gamma + 2 * Gamma * Math.cos(2 * 2 * Math.PI * x)
        );
        const X = plotX + u * plotW;
        const Y = yV(-mag);
        if (i === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y);
      }
      ctx.stroke();

      // Axis labels
      ctx.fillStyle = colors.textDim;
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText('+2', plotX - 4, yV(2));
      ctx.fillText('0', plotX - 4, yV(0));
      ctx.fillText('-2', plotX - 4, yV(-2));

      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('source', plotX, plotY + plotH + 4);
      ctx.textAlign = 'right';
      ctx.fillText('load', plotX + plotW, plotY + plotH + 4);
      ctx.textAlign = 'center';
      ctx.fillText('position along line (λ)', plotX + plotW / 2, plotY + plotH + 18);

      // Header
      ctx.fillStyle = colors.accent;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('V(x,t)  (instantaneous)', plotX + 4, plotY + 4);
      ctx.fillStyle = colors.teal;
      ctx.fillText('±|V(x)|  envelope', plotX + 180, plotY + 4);
      ctx.fillStyle = colors.text;
      ctx.textAlign = 'right';
      ctx.fillText(`VSWR = ${VSWR === Infinity ? '∞' : VSWR.toFixed(2)}`,
        plotX + plotW - 4, plotY + 4);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 12.12'}
      title="Standing waves on a mismatched line"
      question="Mismatch the load and the line's voltage envelope is no longer flat."
      caption={<>
        Continuous-wave drive on a 50 Ω line into a real load. For a matched load (Z<sub>L</sub> =
        50 Ω) the envelope is flat and the wave is a clean traveling sine. Mismatch and the
        incident and reflected waves interfere — peaks where they add, nulls where they cancel.
        The peak-to-null ratio is the VSWR; the spacing between adjacent nulls is half a
        wavelength.
      </>}
    >
      <AutoResizeCanvas height={260} setup={setup} />
      <DemoControls>
        <MiniSlider label="Z_L" value={ZL} min={1} max={500} step={1}
          format={v => v.toFixed(0) + ' Ω'} onChange={setZL} />
        <MiniSlider label="Line length" value={wavelengths} min={0.5} max={5} step={0.1}
          format={v => v.toFixed(1) + ' λ'} onChange={setWavelengths} />
        <MiniReadout label="Γ" value={Gamma.toFixed(3)} />
        <MiniReadout label="V_max / V_min" value={VSWR === Infinity ? '∞' : <Num value={VSWR} />} />
        <MiniReadout label="V_max" value={Vmax.toFixed(2)} unit="·A" />
        <MiniReadout label="V_min" value={Vmin.toFixed(2)} unit="·A" />
      </DemoControls>
    </Demo>
  );
}
