/**
 * Demo D10.4 — Driven RLC resonance
 *
 * Sinusoidal source V0 cos(ωt) in series with R, L, C.
 *
 *   Z(ω) = R + j(ωL − 1/(ωC))
 *   |I(ω)| = V0 / |Z(ω)|
 *   ω₀ = 1/√(LC)
 *   Q  = ω₀ L / R = (1/R) √(L/C)
 *
 * Plot |I(f)| vs f over a window centered on f₀. Slider R changes the
 * peak sharpness (Q factor); L and C move the peak.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { drawGlowPath } from '@/lib/canvasPrimitives';
import { Num } from '@/components/Num';

interface Props { figure?: string }

const V0 = 1;  // 1 V drive amplitude

export function RLCResonanceDemo({ figure }: Props) {
  const [R, setR] = useState(5);     // Ω
  const [Lmh, setLmh] = useState(10); // mH
  const [Cuf, setCuf] = useState(10); // µF
  const L = Lmh * 1e-3;
  const C = Cuf * 1e-6;
  const f0 = 1 / (2 * Math.PI * Math.sqrt(L * C));
  const omega0 = 2 * Math.PI * f0;
  const Q = (omega0 * L) / R;
  const Ipeak = V0 / R;

  const stateRef = useRef({ R, L, C, f0, omega0 });
  useEffect(() => { stateRef.current = { R, L, C, f0, omega0 }; }, [R, L, C, f0, omega0]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, colors } = info;
    let raf = 0;

    function draw() {
      const { R, L, C, f0 } = stateRef.current;

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      // Plot region
      const padL = 50;
      const padR = 20;
      const padT = 28;
      const padB = 32;
      const plotX = padL;
      const plotY = padT;
      const plotW = w - padL - padR;
      const plotH = h - padT - padB;

      // Frequency window: from 0.2 f0 to 5 f0 (log scale)
      const fMin = 0.2 * f0;
      const fMax = 5 * f0;
      const logMin = Math.log10(fMin);
      const logMax = Math.log10(fMax);

      ctx.strokeStyle = colors.border;
      ctx.strokeRect(plotX, plotY, plotW, plotH);

      // Compute peak so we can scale vertically. Peak |I| = V0/R.
      const Imax = V0 / R;

      // Grid
      ctx.strokeStyle = colors.border;
      for (let i = 1; i < 5; i++) {
        const y = plotY + (i * plotH) / 5;
        ctx.beginPath(); ctx.moveTo(plotX, y); ctx.lineTo(plotX + plotW, y); ctx.stroke();
      }
      // Frequency axis ticks at f0/2, f0, 2f0
      const tickFs = [f0 / 2, f0, 2 * f0];
      ctx.fillStyle = 'rgba(160,158,149,0.6)';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      for (const tf of tickFs) {
        const x = plotX + ((Math.log10(tf) - logMin) / (logMax - logMin)) * plotW;
        ctx.strokeStyle = colors.border;
        ctx.beginPath(); ctx.moveTo(x, plotY); ctx.lineTo(x, plotY + plotH); ctx.stroke();
        ctx.fillText(fmtFreq(tf), x, plotY + plotH + 4);
      }

      // f0 marker (vertical dashed)
      const x0 = plotX + ((Math.log10(f0) - logMin) / (logMax - logMin)) * plotW;
      ctx.strokeStyle = colors.teal;
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(x0, plotY); ctx.lineTo(x0, plotY + plotH); ctx.stroke();
      ctx.setLineDash([]);

      // The |I| curve
      const N = 250;
      const curvePts: { x: number; y: number }[] = [];
      for (let i = 0; i <= N; i++) {
        const u = i / N;
        const lf = logMin + u * (logMax - logMin);
        const f = Math.pow(10, lf);
        const om = 2 * Math.PI * f;
        const X = om * L - 1 / (om * C);
        const Zmag = Math.sqrt(R * R + X * X);
        const I = V0 / Zmag;
        curvePts.push({
          x: plotX + u * plotW,
          y: plotY + plotH - (I / Imax) * plotH * 0.95,
        });
      }
      drawGlowPath(ctx, curvePts, {
        color: 'rgba(255,107,42,0.95)',
        lineWidth: 1.8,
        glowColor: 'rgba(255,107,42,0.4)',
        glowWidth: 7,
      });

      // Half-power band (|I|² half) — at I = Imax/√2 ≈ 0.707 Imax
      const yHalf = plotY + plotH - 0.707 * plotH * 0.95;
      ctx.strokeStyle = 'rgba(255,59,110,0.45)';
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(plotX, yHalf); ctx.lineTo(plotX + plotW, yHalf);
      ctx.stroke();
      ctx.setLineDash([]);

      // Labels
      ctx.fillStyle = colors.textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('|I(f)| / Imax', plotX, 8);
      ctx.fillStyle = colors.teal;
      ctx.textAlign = 'right';
      ctx.fillText(`f₀ = ${fmtFreq(f0)}`, plotX + plotW, 8);
      ctx.fillStyle = colors.pink;
      ctx.fillText('−3 dB (½ power)', plotX + plotW, plotY + plotH * 0.18);

      // Q factor annotation near peak
      const Qnow = (2 * Math.PI * f0 * L) / R;
      ctx.fillStyle = colors.text;
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`Q ≈ ${Qnow.toFixed(2)}`, x0, plotY + plotH - 0.95 * plotH - 4);

      ctx.fillStyle = colors.textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('frequency (log scale)', plotX + plotW / 2, plotY + plotH + 18);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 10.4'}
      title="Driven RLC — resonance and Q"
      question="Same circuit. Sweep ω. Why does current peak so sharply?"
      caption={<>
        A 1-V sinusoidal source drives R, L, and C in series. The current responds with
        amplitude <strong>|I| = V₀ / |Z(ω)|</strong>, peaking when ωL = 1/(ωC) — i.e. at the
        resonant frequency <strong>f₀ = 1/(2π√(LC))</strong>. The peak sharpness is set by the
        quality factor <strong>Q = ω₀L/R</strong>: smaller R, sharper peak, more selective filter.
      </>}
      deeperLab={{ slug: 'inductance', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={260} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="R"
          value={R} min={0.5} max={50} step={0.5}
          format={v => v.toFixed(1) + ' Ω'}
          onChange={setR}
        />
        <MiniSlider
          label="L"
          value={Lmh} min={0.1} max={100} step={0.1}
          format={v => v.toFixed(1) + ' mH'}
          onChange={setLmh}
        />
        <MiniSlider
          label="C"
          value={Cuf} min={0.1} max={100} step={0.1}
          format={v => v.toFixed(1) + ' µF'}
          onChange={setCuf}
        />
        <MiniReadout label="f₀" value={<Num value={f0} />} unit="Hz" />
        <MiniReadout label="Q = ω₀L/R" value={Q.toFixed(2)} />
        <MiniReadout label="Ipeak = V₀/R" value={<Num value={Ipeak} />} unit="A" />
      </DemoControls>
    </Demo>
  );
}

function fmtFreq(f: number): string {
  if (!isFinite(f)) return '—';
  if (f >= 1e6) return (f / 1e6).toFixed(2) + ' MHz';
  if (f >= 1e3) return (f / 1e3).toFixed(1) + ' kHz';
  return f.toFixed(0) + ' Hz';
}
