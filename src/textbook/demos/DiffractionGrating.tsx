/**
 * Demo D14.9 — Diffraction grating intensity pattern
 *
 * N equally-spaced slits with spacing d, illuminated by a monochromatic
 * plane wave at wavelength λ. The intensity on a distant screen is the
 * N-slit interference function
 *   I(θ) = I₀ · [sin(N · π d sinθ / λ) / sin(π d sinθ / λ)]² / N²
 * Principal maxima at sin θ = m λ / d (m = 0, ±1, ±2, …); between every
 * pair of principal maxima there are N − 2 weak secondary maxima. As N
 * grows from 10 → 100 → 1000, the principal maxima sharpen as 1/N and
 * the resolving power increases.
 *
 * Reader slides N (log scale) and λ.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { getCanvasColors } from '@/lib/canvasTheme';

interface Props { figure?: string }

export function DiffractionGratingDemo({ figure }: Props) {
  // N = 10 / 100 / 1000 — index 0 / 1 / 2 on a discrete slider
  const [nIdx, setNIdx] = useState(1);
  const [lamNm, setLamNm] = useState(550);
  const [linesPerMm, setLinesPerMm] = useState(600);

  const stateRef = useRef({ nIdx, lamNm, linesPerMm });
  useEffect(() => { stateRef.current = { nIdx, lamNm, linesPerMm }; }, [nIdx, lamNm, linesPerMm]);

  const Nvals = [10, 100, 1000];
  const lam = lamNm * 1e-9;
  const dGr = 1e-3 / linesPerMm;          // grating period in metres
  const theta1 = Math.asin(Math.min(1, lam / dGr));
  const theta1Deg = (theta1 * 180) / Math.PI;

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w: W, h: H } = info;
    let raf = 0;
    function draw() {
      const { nIdx, lamNm, linesPerMm } = stateRef.current;
      const N = Nvals[nIdx];
      const lam_ = lamNm * 1e-9;
      const d_ = 1e-3 / linesPerMm;

      ctx.fillStyle = getCanvasColors().bg;
      ctx.fillRect(0, 0, W, H);

      // Plot intensity vs sin θ over the range [-1, 1]
      // β = π d sinθ / λ; I_N(β) = (sin(Nβ)/(N sinβ))²
      const padL = 28;
      const padR = 20;
      const padTop = 20;
      const padBot = 30;
      const plotW = W - padL - padR;
      const plotH = H - padTop - padBot;
      const x0 = padL;
      const y0 = padTop;
      const yBase = y0 + plotH;

      // Axes
      ctx.strokeStyle = getCanvasColors().borderStrong;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x0, yBase); ctx.lineTo(x0 + plotW, yBase);
      ctx.moveTo(x0 + plotW / 2, y0); ctx.lineTo(x0 + plotW / 2, yBase);
      ctx.stroke();

      // Wavelength colour
      const [r, g, b] = wavelengthRGB(lamNm);

      // Compute intensity samples
      const Nsamp = Math.max(1200, plotW * 3);
      const Imax = 1;
      ctx.strokeStyle = `rgba(${r},${g},${b},0.95)`;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      for (let i = 0; i <= Nsamp; i++) {
        const s = -1 + 2 * (i / Nsamp);          // sin θ
        const beta = (Math.PI * d_ * s) / lam_;
        let I: number;
        const sb = Math.sin(beta);
        const sNb = Math.sin(N * beta);
        if (Math.abs(sb) < 1e-9) {
          I = 1;                                  // principal max
        } else {
          I = (sNb * sNb) / (N * N * sb * sb);
        }
        const xPlot = x0 + (i / Nsamp) * plotW;
        const yPlot = yBase - (I / Imax) * plotH;
        if (i === 0) ctx.moveTo(xPlot, yPlot); else ctx.lineTo(xPlot, yPlot);
      }
      ctx.stroke();

      // Mark expected principal-maximum positions sinθ = m λ/d
      ctx.strokeStyle = getCanvasColors().borderStrong;
      ctx.setLineDash([3, 4]);
      const mMax = Math.floor(d_ / lam_);
      for (let m = -mMax; m <= mMax; m++) {
        const s = (m * lam_) / d_;
        if (Math.abs(s) > 1) continue;
        const xx = x0 + ((s + 1) / 2) * plotW;
        ctx.beginPath();
        ctx.moveTo(xx, y0); ctx.lineTo(xx, yBase + 4);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = getCanvasColors().textDim;
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`m=${m}`, xx, yBase + 16);
        ctx.setLineDash([3, 4]);
      }
      ctx.setLineDash([]);

      // Axis labels
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = getCanvasColors().textDim;
      ctx.textAlign = 'left';
      ctx.fillText(`N = ${N}`, padL + 4, padTop + 12);
      ctx.fillText(`λ = ${lamNm.toFixed(0)} nm`, padL + 4, padTop + 26);
      ctx.fillText(`d = 1/${linesPerMm} mm`, padL + 4, padTop + 40);
      ctx.textAlign = 'right';
      ctx.fillText('I/I₀', x0 + 30, padTop + 12);
      ctx.textAlign = 'center';
      ctx.fillText('sin θ', x0 + plotW / 2, H - 8);
      ctx.textAlign = 'left';
      ctx.fillText('−1', x0 + 2, yBase + 16);
      ctx.textAlign = 'right';
      ctx.fillText('+1', x0 + plotW - 2, yBase + 16);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 14.9'}
      title="Diffraction grating — N slits sharpen the maxima"
      question="Why does a grating make sharper spectral lines than two slits?"
      caption={<>
        N equally-spaced slits of spacing <strong>d</strong>, illuminated by light of wavelength
        <strong> λ</strong>. Principal maxima appear at <strong>sin θ = m λ / d</strong>. The full
        width at half-maximum of each principal peak shrinks as <strong>1/N</strong>, so increasing
        N from 10 to 1000 narrows the lines by two orders of magnitude — that's the physics behind
        every grating spectrometer. The first-order angle for the current λ and d is shown in the
        readout.
      </>}
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        <MiniSlider label="N" value={nIdx} min={0} max={2} step={1}
          format={v => Nvals[Math.round(v)].toString()} onChange={setNIdx} />
        <MiniSlider label="λ" value={lamNm} min={400} max={700} step={5}
          format={v => v.toFixed(0) + ' nm'} onChange={setLamNm} />
        <MiniSlider label="lines/mm" value={linesPerMm} min={100} max={2000} step={10}
          format={v => v.toFixed(0)} onChange={setLinesPerMm} />
        <MiniReadout label="θ₁" value={theta1Deg.toFixed(2)} unit="°" />
      </DemoControls>
    </Demo>
  );
}

function wavelengthRGB(lam: number): [number, number, number] {
  let r = 0, g = 0, b = 0;
  if (lam >= 380 && lam < 440) { r = -(lam - 440) / 60; g = 0; b = 1; }
  else if (lam < 490) { r = 0; g = (lam - 440) / 50; b = 1; }
  else if (lam < 510) { r = 0; g = 1; b = -(lam - 510) / 20; }
  else if (lam < 580) { r = (lam - 510) / 70; g = 1; b = 0; }
  else if (lam < 645) { r = 1; g = -(lam - 645) / 65; b = 0; }
  else if (lam <= 740) { r = 1; g = 0; b = 0; }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}
