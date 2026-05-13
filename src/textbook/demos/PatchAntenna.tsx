/**
 * Demo D15.8 — Microstrip patch antenna
 *
 * A rectangular metal patch of length L on top of a dielectric substrate
 * with relative permittivity ε_r, sitting on a ground plane. The
 * fundamental resonance is approximately
 *   f₀ ≈ c / (2 L √ε_r)
 * because the resonant mode is a half-wave standing wave between the
 * two radiating edges. The radiation pattern is broadside (perpendicular
 * to the patch plane), with typical gain around 6 dBi.
 *
 * Reader picks L (in mm) and ε_r; the demo reports the resonance
 * frequency and shows a top view of the patch + a cardioid-ish broadside
 * lobe.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';

interface Props { figure?: string }

const C0 = 2.998e8;     // m/s

export function PatchAntennaDemo({ figure }: Props) {
  const [Lmm, setLmm] = useState(29);
  const [eps, setEps] = useState(4.4);    // FR-4 substrate is the default

  const stateRef = useRef({ Lmm, eps });
  useEffect(() => { stateRef.current = { Lmm, eps }; }, [Lmm, eps]);

  // f₀ = c / (2 L √ε_r)  [Hz]
  const f0 = C0 / (2 * (Lmm * 1e-3) * Math.sqrt(eps));
  const f0GHz = f0 / 1e9;

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w: W, h: H } = info;
    let raf = 0;
    let tAnim = 0;
    function draw() {
      const { Lmm, eps } = stateRef.current;
      tAnim += 0.05;
      ctx.fillStyle = '#0d0d10';
      ctx.fillRect(0, 0, W, H);

      // Left: top-view of patch + ground plane. Right: broadside cosine-ish lobe.
      const splitX = W * 0.45;

      // ── Left: patch top-view
      const cxL = splitX / 2;
      const cyL = H / 2;
      // Substrate slab (ground plane outline)
      const subW = splitX * 0.75;
      const subH = H * 0.55;
      ctx.fillStyle = 'rgba(108,197,194,0.10)';
      ctx.fillRect(cxL - subW / 2, cyL - subH / 2, subW, subH);
      ctx.strokeStyle = 'rgba(108,197,194,0.5)';
      ctx.lineWidth = 1;
      ctx.strokeRect(cxL - subW / 2, cyL - subH / 2, subW, subH);

      // Patch — scale L pixel-wise so a "typical" L sits comfortably inside the substrate
      const patchPxPerMm = Math.min(subW * 0.7 / 60, subH * 0.7 / 60); // 60 mm full range
      const Lpx = Lmm * patchPxPerMm;
      const Wpatch = Lpx * 0.8;
      ctx.fillStyle = 'rgba(255,107,42,0.85)';
      ctx.fillRect(cxL - Lpx / 2, cyL - Wpatch / 2, Lpx, Wpatch);

      // E-field on the two radiating edges — sinusoidal in time, opposite ends
      const phase = Math.cos(tAnim * 2);
      const arrowLen = Wpatch * 0.55 * phase;
      // Left edge: upward arrow when phase>0
      ctx.strokeStyle = '#0a0a0b';
      ctx.fillStyle = '#0a0a0b';
      ctx.lineWidth = 2;
      drawArr(ctx, cxL - Lpx / 2, cyL, cxL - Lpx / 2, cyL - arrowLen);
      drawArr(ctx, cxL + Lpx / 2, cyL, cxL + Lpx / 2, cyL + arrowLen);

      // Feed point — small dot quarter-way in
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.beginPath(); ctx.arc(cxL - Lpx / 4, cyL, 3, 0, Math.PI * 2); ctx.fill();
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(160,158,149,0.85)';
      ctx.textAlign = 'center';
      ctx.fillText('feed', cxL - Lpx / 4, cyL + 14);

      // Labels
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(160,158,149,0.9)';
      ctx.textAlign = 'left';
      ctx.fillText(`L = ${Lmm.toFixed(1)} mm`, 12, 18);
      ctx.fillText(`εᵣ = ${eps.toFixed(2)}`, 12, 32);
      ctx.textAlign = 'center';
      ctx.fillText('patch (top view)', cxL, H - 12);

      // ── Right: broadside cos^n pattern
      const cxR = splitX + (W - splitX) / 2;
      const cyR = H / 2;
      const R = Math.min((W - splitX) * 0.40, H * 0.40);

      ctx.strokeStyle = 'rgba(255,255,255,0.10)';
      ctx.lineWidth = 1;
      for (let f = 0.25; f <= 1.001; f += 0.25) {
        ctx.beginPath(); ctx.arc(cxR, cyR, R * f, 0, Math.PI * 2); ctx.stroke();
      }
      // Ground plane line at the bottom of the polar
      ctx.strokeStyle = 'rgba(108,197,194,0.5)';
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.moveTo(cxR - R, cyR); ctx.lineTo(cxR + R, cyR);
      ctx.stroke();
      ctx.setLineDash([]);

      // Pattern: ~cos^n(θ) for the upper half only (broadside, blocked below ground plane).
      // n chosen to give roughly 6 dBi HPBW ≈ 80°.
      ctx.strokeStyle = 'rgba(255,107,42,0.95)';
      ctx.fillStyle = 'rgba(255,107,42,0.12)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      const Ns = 180;
      const nExp = 1.6;
      for (let i = 0; i <= Ns; i++) {
        // θ from -π/2 (left horizon) to +π/2 (right horizon), pattern in upper half only.
        const theta = -Math.PI / 2 + (i / Ns) * Math.PI;
        const rrFactor = Math.max(0, Math.cos(theta)) ** nExp;
        const rr = rrFactor * R;
        const x = cxR + rr * Math.sin(theta);
        const y = cyR - rr * Math.cos(theta);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      // Close along the ground plane back to start
      ctx.lineTo(cxR - 0, cyR);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Labels
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(160,158,149,0.8)';
      ctx.textAlign = 'center';
      ctx.fillText('broadside (zenith)', cxR, cyR - R - 8);
      ctx.fillText('ground plane', cxR, cyR + 14);
      ctx.textAlign = 'right';
      ctx.fillText(`f₀ ≈ ${f0GHz.toFixed(2)} GHz`, W - 12, 18);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [f0GHz]);

  return (
    <Demo
      figure={figure ?? 'Fig. 15.8'}
      title="Patch antenna — half-wave inside the substrate"
      question="What sets the resonance frequency of a microstrip patch?"
      caption={<>
        A rectangular metal patch on a dielectric substrate (εᵣ) over a ground plane. The
        fundamental mode is a half-wavelength standing wave between the two radiating edges, so
        <strong> L ≈ λ / (2 √εᵣ)</strong>, i.e. <strong>f₀ ≈ c / (2 L √εᵣ)</strong>. The radiation
        pattern is broadside (perpendicular to the patch), with typical gain around 6 dBi and a
        broad ~80° beamwidth. Every smartphone's Wi-Fi, GPS and cellular antennas are variants on
        this geometry — sized for 2.4, 1.5 and 0.9 GHz respectively.
      </>}
    >
      <AutoResizeCanvas height={280} setup={setup} />
      <DemoControls>
        <MiniSlider label="L" value={Lmm} min={10} max={60} step={0.5}
          format={v => v.toFixed(1) + ' mm'} onChange={setLmm} />
        <MiniSlider label="εᵣ" value={eps} min={1.0} max={10.0} step={0.05}
          format={v => v.toFixed(2)} onChange={setEps} />
        <MiniReadout label="f₀" value={f0GHz.toFixed(2)} unit="GHz" />
      </DemoControls>
    </Demo>
  );
}

function drawArr(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len < 4) return;
  const ux = dx / len, uy = dy / len;
  const px = -uy, py = ux;
  const Hh = 5;
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - ux * Hh + px * 2.5, y2 - uy * Hh + py * 2.5);
  ctx.lineTo(x2 - ux * Hh - px * 2.5, y2 - uy * Hh - py * 2.5);
  ctx.closePath();
  ctx.fill();
}
