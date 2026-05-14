/**
 * Demo 42.2 — Silica attenuation vs wavelength
 *
 * Plots the standard fiber-optic attenuation curve from ~800 nm to ~1700 nm
 * showing the three classical telecom windows:
 *   1st window  — 850 nm   (multimode datacom; ~3 dB/km)
 *   2nd window  — 1310 nm  (zero-dispersion SMF; ~0.35 dB/km)
 *   3rd window  — 1550 nm  (EDFA + DWDM C-band; ~0.20 dB/km)
 *
 * Curve composition (per Agrawal 2010 §2.5):
 *   total(λ) = Rayleigh A/λ^4 + OH⁻ peak at 1383 nm + IR absorption tail
 * The Rayleigh ∝ 1/λ⁴ term dominates at short wavelength; infrared lattice
 * absorption rises sharply past 1.6 μm. Reader drags a wavelength slider
 * to read out loss at any λ and see the loss budget.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { getCanvasColors } from '@/lib/canvasTheme';

/** Approximate silica fiber attenuation in dB/km vs wavelength λ (nm).
 *  Tuned to reproduce the canonical 0.20 dB/km @ 1550 nm and 0.35 dB/km @ 1310 nm
 *  reported by Miya et al. 1979 and ITU-T G.652. */
function lossDbPerKm(lambdaNm: number): number {
  const lambdaUm = lambdaNm / 1000;
  // Rayleigh scattering ∝ 1/λ⁴ — fit constant ~0.85 dB/km·μm⁴
  const rayleigh = 0.85 / Math.pow(lambdaUm, 4);
  // OH⁻ absorption peak near 1383 nm — Gaussian
  const sigma = 22; // nm
  const oh = 2.0 * Math.exp(-Math.pow((lambdaNm - 1383) / sigma, 2));
  // Infrared lattice tail (rises past 1600 nm)
  const ir = 7e-12 * Math.exp(0.011 * lambdaNm);
  return rayleigh + oh + ir;
}

export function FiberAttenuationDemo() {
  const [lambda, setLambda] = useState(1550);
  const stateRef = useRef({ lambda });
  useEffect(() => { stateRef.current = { lambda }; }, [lambda]);

  const loss = lossDbPerKm(lambda);
  // Link reach at 30 dB budget (1 mW launch, −29 dBm receiver)
  const reachKm = 30 / loss;

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w: W, h: H } = info;
    let raf = 0;

    function draw() {
      const { lambda } = stateRef.current;
      const colors = getCanvasColors();
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, W, H);

      const padL = 50, padR = 18, padT = 18, padB = 30;
      const plotW = W - padL - padR;
      const plotH = H - padT - padB;
      const lamMin = 800, lamMax = 1700;
      const lossMin = 0.1, lossMax = 5; // log scale dB/km

      const xOfLam = (l: number) => padL + ((l - lamMin) / (lamMax - lamMin)) * plotW;
      const yOfLoss = (db: number) => {
        const t = (Math.log10(db) - Math.log10(lossMin)) / (Math.log10(lossMax) - Math.log10(lossMin));
        return padT + (1 - Math.max(0, Math.min(1, t))) * plotH;
      };

      // Axis frame
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.strokeRect(padL, padT, plotW, plotH);

      // Telecom windows — vertical bands at 850 / 1310 / 1550
      const windows = [
        { l: 850,  label: '850 nm',  color: 'rgba(91,174,248,0.10)' },
        { l: 1310, label: '1310 nm', color: 'rgba(108,197,194,0.12)' },
        { l: 1550, label: '1550 nm', color: 'rgba(255,107,42,0.13)' },
      ];
      for (const w of windows) {
        const cx = xOfLam(w.l);
        ctx.fillStyle = w.color;
        ctx.fillRect(cx - 14, padT, 28, plotH);
      }

      // Loss curve
      ctx.strokeStyle = colors.text;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (let l = lamMin; l <= lamMax; l += 2) {
        const db = lossDbPerKm(l);
        const x = xOfLam(l);
        const y = yOfLoss(db);
        if (l === lamMin) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Cursor — vertical line + dot at current λ
      const curLoss = lossDbPerKm(lambda);
      const cx = xOfLam(lambda);
      const cy = yOfLoss(curLoss);
      ctx.strokeStyle = colors.accent;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(cx, padT); ctx.lineTo(cx, padT + plotH);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = colors.accent;
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fill();

      // X tick labels
      ctx.fillStyle = colors.textMuted;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      for (const l of [850, 1000, 1310, 1383, 1550, 1700]) {
        ctx.fillText(`${l}`, xOfLam(l), padT + plotH + 14);
      }
      // Y tick labels (log)
      ctx.textAlign = 'right';
      for (const db of [0.1, 0.2, 0.5, 1, 2, 5]) {
        ctx.fillText(`${db}`, padL - 6, yOfLoss(db) + 3);
      }
      // Axis titles
      ctx.fillStyle = colors.textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('λ (nm)', padL, H - 6);
      ctx.save();
      ctx.translate(12, padT + plotH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.fillText('loss (dB/km, log)', 0, 0);
      ctx.restore();

      // OH⁻ peak label
      ctx.fillStyle = colors.textMuted;
      ctx.textAlign = 'center';
      ctx.fillText('OH⁻', xOfLam(1383), yOfLoss(2.0) - 6);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure="Fig. 42.2"
      title="Silica fiber attenuation across the telecom bands"
      question="Why is 1550 nm the dominant long-haul wavelength?"
      caption={<>
        Silica fiber loss falls as <strong>1/λ⁴</strong> (Rayleigh scattering) until the
        infrared absorption band of the SiO₂ lattice kicks in past 1.6 μm. Modern{' '}
        <strong>OH⁻-stripped</strong> fibers can use the entire 1260–1625 nm range, but the
        two operating windows the industry standardised on are <strong>1310 nm</strong>{' '}
        (zero chromatic dispersion of standard SMF) and <strong>1550 nm</strong>{' '}
        (minimum loss + the gain band of erbium-doped fiber amplifiers).
      </>}
    >
      <AutoResizeCanvas height={260} setup={setup} />
      <DemoControls>
        <MiniSlider label="wavelength" value={lambda} min={800} max={1700} step={1}
          format={v => `${v.toFixed(0)} nm`} onChange={setLambda} />
        <MiniReadout label="loss" value={loss.toFixed(2)} unit="dB/km" />
        <MiniReadout label="reach @ 30 dB budget" value={reachKm.toFixed(0)} unit="km" />
      </DemoControls>
    </Demo>
  );
}
