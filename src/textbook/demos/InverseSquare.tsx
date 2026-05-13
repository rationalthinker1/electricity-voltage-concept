/**
 * Demo D1.3 — How does force fall off with distance?
 *
 * A graph: F(r) on log-log axes. Slider for r changes a marker on the curve.
 * Reader watches: doubling r quarters F. Slope is exactly −2.
 */
import { useCallback, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';
import { PHYS, pretty } from '@/lib/physics';

interface Props { figure?: string }

export function InverseSquareDemo({ figure }: Props) {
  const [rCm, setRCm] = useState(10);   // current r marker

  // Use unit charges: q1 = q2 = 1 µC for clean numbers.
  const q = 1e-6;
  const r = rCm * 1e-2;
  const F = (PHYS.k * q * q) / (r * r);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h } = info;
    ctx.fillStyle = '#0d0d10';
    ctx.fillRect(0, 0, w, h);

    // Plot region
    const padL = 60, padR = 30, padT = 26, padB = 38;
    const pw = w - padL - padR;
    const ph = h - padT - padB;
    const minRcm = 1, maxRcm = 100;
    const minF = (PHYS.k * q * q) / ((maxRcm * 1e-2) ** 2);
    const maxF = (PHYS.k * q * q) / ((minRcm * 1e-2) ** 2);
    const logMinF = Math.log10(minF), logMaxF = Math.log10(maxF);

    function xOf(rCm: number) { return padL + (Math.log10(rCm) - Math.log10(minRcm)) / (Math.log10(maxRcm) - Math.log10(minRcm)) * pw; }
    function yOf(F: number) { return padT + ph - (Math.log10(F) - logMinF) / (logMaxF - logMinF) * ph; }

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,.06)';
    ctx.lineWidth = 1;
    for (const r of [1, 2, 5, 10, 20, 50, 100]) {
      ctx.beginPath();
      ctx.moveTo(xOf(r), padT); ctx.lineTo(xOf(r), padT + ph); ctx.stroke();
    }
    // Axes
    ctx.strokeStyle = 'rgba(255,255,255,.3)';
    ctx.beginPath();
    ctx.moveTo(padL, padT); ctx.lineTo(padL, padT + ph); ctx.lineTo(padL + pw, padT + ph); ctx.stroke();
    ctx.fillStyle = 'rgba(160,158,149,.85)';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    for (const rt of [1, 10, 100]) ctx.fillText(`${rt} cm`, xOf(rt), padT + ph + 6);
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    const fmid = Math.pow(10, (logMinF + logMaxF) / 2);
    for (const ft of [minF, fmid, maxF]) {
      const yt = yOf(ft);
      ctx.fillText(pretty(ft, 1) + ' N', padL - 6, yt);
    }

    // Curve F = kq²/r² across r 1–100 cm
    ctx.strokeStyle = 'rgba(255,107,42,.95)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= 200; i++) {
      const rcm = minRcm * Math.pow(maxRcm / minRcm, i / 200);
      const Ft = (PHYS.k * q * q) / ((rcm * 1e-2) ** 2);
      const x = xOf(rcm), y = yOf(Ft);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Marker for current r
    const mF = (PHYS.k * q * q) / ((rCm * 1e-2) ** 2);
    const mx = xOf(rCm), my = yOf(mF);
    ctx.strokeStyle = 'rgba(108,197,194,.7)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(mx, padT); ctx.lineTo(mx, my);
    ctx.moveTo(padL, my); ctx.lineTo(mx, my);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#ff6b2a';
    ctx.beginPath(); ctx.arc(mx, my, 5, 0, Math.PI * 2); ctx.fill();

    // Slope label
    ctx.fillStyle = 'rgba(108,197,194,.85)';
    ctx.font = 'italic 12px Fraunces, serif';
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('slope = −2  →  F ∝ 1/r²', padL + 12, padT + 6);
  }, [rCm]);

  return (
    <Demo
      figure={figure ?? 'Fig. 1.3'}
      title="Force vs. distance"
      question="Why exactly the square?"
      caption={<>
        Both axes are logarithmic. The curve is a straight line of slope <strong>−2</strong> — the algebraic signature of an inverse-square law.
        Slide <strong>r</strong> from 1&nbsp;cm to 1&nbsp;m and the force changes by four orders of magnitude.
      </>}
      deeperLab={{ slug: 'coulomb', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={260} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="r"
          value={rCm} min={1} max={100} step={0.5}
          format={v => v < 100 ? v.toFixed(1) + ' cm' : '1.00 m'}
          onChange={setRCm}
        />
        <MiniReadout label="F (1 µC each)" value={<Num value={F} />} unit="N" />
      </DemoControls>
    </Demo>
  );
}
