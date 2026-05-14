/**
 * Demo 15.4 — Clipping and THD
 *
 * A clean sine of unit peak is clipped symmetrically at ±A_clip. The clipped
 * waveform is purely odd-harmonic. We compute the analytic Fourier
 * coefficients of the clipped sine numerically (one cycle's b_n = (2/T)
 * ∫₀^T y(t) sin(nω t) dt) and display them as a bar chart, plus the THD
 * percentage.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import {
  Demo, DemoControls, MiniReadout, MiniSlider,
} from '@/components/Demo';

const N_HARMONICS = 11;
const N_INT = 1024; // samples per cycle for numerical integration

function clippedSineCoeffs(Aclip: number): number[] {
  // Returns [b_1, b_2, ..., b_N]
  const coeffs: number[] = [];
  for (let n = 1; n <= N_HARMONICS; n++) {
    let acc = 0;
    for (let i = 0; i < N_INT; i++) {
      const t = (i / N_INT) * 2 * Math.PI;
      let y = Math.sin(t);
      if (y > Aclip) y = Aclip;
      if (y < -Aclip) y = -Aclip;
      acc += y * Math.sin(n * t);
    }
    coeffs.push((2 / N_INT) * acc);
  }
  return coeffs;
}

export function THDAndDistortionDemo() {
  const [Aclip, setAclip] = useState(0.7);
  const stateRef = useRef({ Aclip });
  useEffect(() => { stateRef.current = { Aclip }; }, [Aclip]);

  // Coefficients + THD recomputed on slider change
  const { coeffs, thdPct } = useMemo(() => {
    const c = clippedSineCoeffs(Aclip);
    const fund = c[0];
    // THD = √(Σ_{n≥2} b_n²) / b_1
    let sumSq = 0;
    for (let i = 1; i < c.length; i++) sumSq += c[i] * c[i];
    const thd = Math.sqrt(sumSq) / Math.abs(fund);
    return { coeffs: c, thdPct: thd * 100 };
  }, [Aclip]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, colors } = info;
    let raf = 0;
    function draw() {
      const { Aclip } = stateRef.current;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      const padX = 36;
      const padY = 14;
      const halfH = (h - 2 * padY) / 2;

      // Top: time-domain clipped sine
      const tMid = padY + halfH / 2 + 4;
      ctx.strokeStyle = colors.border;
      ctx.beginPath(); ctx.moveTo(padX, tMid); ctx.lineTo(w - padX, tMid); ctx.stroke();
      // Reference: unclipped sine
      ctx.strokeStyle = 'rgba(108,197,194,0.4)';
      ctx.setLineDash([3, 4]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      const samples = 400;
      const cycles = 2;
      for (let i = 0; i <= samples; i++) {
        const x = padX + (i / samples) * (w - 2 * padX);
        const phase = (i / samples) * cycles * 2 * Math.PI;
        const y = tMid - Math.sin(phase) * (halfH / 2) * 0.9;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      // Clipped
      ctx.strokeStyle = '#ff6b2a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i <= samples; i++) {
        const x = padX + (i / samples) * (w - 2 * padX);
        const phase = (i / samples) * cycles * 2 * Math.PI;
        let s = Math.sin(phase);
        if (s > Aclip) s = Aclip;
        if (s < -Aclip) s = -Aclip;
        const y = tMid - s * (halfH / 2) * 0.9;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      // Clip level markers
      ctx.strokeStyle = 'rgba(255,107,42,0.3)';
      ctx.setLineDash([2, 4]);
      const yUp = tMid - Aclip * (halfH / 2) * 0.9;
      const yDn = tMid + Aclip * (halfH / 2) * 0.9;
      ctx.beginPath();
      ctx.moveTo(padX, yUp); ctx.lineTo(w - padX, yUp);
      ctx.moveTo(padX, yDn); ctx.lineTo(w - padX, yDn);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = colors.textDim;
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('time domain', padX, padY + 8);

      // Bottom: spectrum
      const bMid = padY + halfH + halfH * 0.95 + 4;
      const bH = halfH * 0.85;
      ctx.strokeStyle = colors.border;
      ctx.beginPath(); ctx.moveTo(padX, bMid); ctx.lineTo(w - padX, bMid); ctx.stroke();

      const maxAmp = Math.max(...coeffs.map(c => Math.abs(c)), 0.01);
      const nMax = N_HARMONICS;
      const xOf = (n: number) => padX + (n / nMax) * (w - 2 * padX);
      const barW = (w - 2 * padX) / nMax * 0.55;

      for (let n = 1; n <= nMax; n++) {
        const amp = Math.abs(coeffs[n - 1]);
        const x = xOf(n) - barW / 2;
        const hPx = (amp / maxAmp) * bH * 0.9;
        ctx.fillStyle = n === 1 ? 'rgba(108,197,194,0.85)' : '#ff6b2a';
        ctx.fillRect(x, bMid - hPx, barW, hPx);
        if (amp / maxAmp > 0.06) {
          ctx.fillStyle = colors.text;
          ctx.font = '9px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillText(amp.toFixed(2), x + barW / 2, bMid - hPx - 3);
        }
      }
      ctx.fillStyle = colors.textDim;
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      for (let n = 1; n <= nMax; n += 2) {
        ctx.fillText(n.toString() + 'f', xOf(n), bMid + 12);
      }
      ctx.fillStyle = colors.textDim;
      ctx.textAlign = 'left';
      ctx.fillText('spectrum', padX, padY + halfH + 14);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [coeffs]);

  return (
    <Demo
      figure="Fig. 15.4"
      title="Clipping and THD"
      question="As the clip level drops, how does the harmonic content grow?"
      caption={
        <>
          Soft clipping at A_clip ≥ 1 leaves the sine untouched — THD is essentially zero. Drive harder and the tips
          flatten; the waveform develops only <em>odd</em> harmonics because the clipping is symmetric. THD is the
          industry-standard scalar: RMS of harmonics above the fundamental, divided by the fundamental's RMS. A guitar
          amp's overdrive sits in the 10–30% THD range; an audiophile power amp aims for under 0.01%.
        </>
      }
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="clip level A"
          value={Aclip} min={0.05} max={1} step={0.01}
          format={v => v.toFixed(2)}
          onChange={setAclip}
        />
        <MiniReadout label="THD" value={thdPct.toFixed(1)} unit="%" />
        <MiniReadout label="fundamental b₁" value={coeffs[0].toFixed(3)} />
        <MiniReadout label="3rd harmonic" value={coeffs[2].toFixed(3)} />
      </DemoControls>
    </Demo>
  );
}
