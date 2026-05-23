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
import { useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, EquationStrip, MiniReadout, MiniSlider } from '@/components/Demo';
import { InlineMath } from '@/components/Formula';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';
import { drawLabel } from "@/lib/canvasLayout";

interface Props {
  figure: string;
}

const C0 = 2.998e8; // m/s

export function PatchAntennaDemo({ figure }: Props) {
  const [Lmm, setLmm] = useState(29);
  const [eps, setEps] = useState(4.4); // FR-4 substrate is the default

  const stateRef = useSimState({ Lmm, eps });
  // f₀ = c / (2 L √ε_r)  [Hz]
  const f0 = C0 / (2 * (Lmm * 1e-3) * Math.sqrt(eps));
  const f0GHz = f0 / 1e9;

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w: W, h: H, colors }, _state, _dt, _simTime, ctx0) => {
      let tAnim = ctx0.tAnim;
      const { Lmm, eps } = stateRef.current;
      tAnim += 0.05;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, W, H);
      const splitX = W * 0.45;
      const cxL = splitX / 2;
      const cyL = H / 2;
      const subW = splitX * 0.75;
      const subH = H * 0.55;
      ctx.save();
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = colors.teal;
      ctx.fillRect(cxL - subW / 2, cyL - subH / 2, subW, subH);
      ctx.restore();
      ctx.strokeStyle = colors.teal;
      ctx.lineWidth = 1;
      ctx.strokeRect(cxL - subW / 2, cyL - subH / 2, subW, subH);
      const patchPxPerMm = Math.min((subW * 0.7) / 60, (subH * 0.7) / 60);
      const Lpx = Lmm * patchPxPerMm;
      const Wpatch = Lpx * 0.8;
      ctx.fillStyle = colors.accent;
      ctx.fillRect(cxL - Lpx / 2, cyL - Wpatch / 2, Lpx, Wpatch);
      const phase = Math.cos(tAnim * 2);
      const arrowLen = Wpatch * 0.55 * phase;
      ctx.strokeStyle = colors.canvasBg;
      ctx.fillStyle = colors.bg;
      ctx.lineWidth = 2;
      drawArr(ctx, cxL - Lpx / 2, cyL, cxL - Lpx / 2, cyL - arrowLen);
      drawArr(ctx, cxL + Lpx / 2, cyL, cxL + Lpx / 2, cyL + arrowLen);
      ctx.save();
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = colors.text;
      ctx.beginPath();
      ctx.arc(cxL - Lpx / 4, cyL, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      drawLabel(ctx, { text: 'feed', x: cxL - Lpx / 4, y: cyL + 14, align: 'center' });
      ctx.fillStyle = colors.textDim;
      drawLabel(ctx, { text: `L = ${Lmm.toFixed(1)} mm`, x: 12, y: 18, font: '10px "JetBrains Mono", monospace' });
      drawLabel(ctx, { text: `εᵣ = ${eps.toFixed(2)}`, x: 12, y: 32, font: '10px "JetBrains Mono", monospace' });
      drawLabel(ctx, { text: 'patch (top view)', x: cxL, y: H - 12, font: '10px "JetBrains Mono", monospace', align: 'center' });
      const cxR = splitX + (W - splitX) / 2;
      const cyR = H / 2;
      const R = Math.min((W - splitX) * 0.4, H * 0.4);
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      for (let f = 0.25; f <= 1.001; f += 0.25) {
        ctx.beginPath();
        ctx.arc(cxR, cyR, R * f, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.strokeStyle = colors.teal;
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.moveTo(cxR - R, cyR);
      ctx.lineTo(cxR + R, cyR);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = colors.accent;
      ctx.save();
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = colors.accent;
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
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.lineTo(cxR - 0, cyR);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      ctx.fillStyle = colors.textDim;
      drawLabel(ctx, { text: 'broadside (zenith)', x: cxR, y: cyR - R - 8, align: 'center' });
      drawLabel(ctx, { text: 'ground plane', x: cxR, y: cyR + 14, align: 'center' });
      drawLabel(ctx, { text: `f₀ ≈ ${f0GHz.toFixed(2)} GHz`, x: W - 12, y: 18, align: 'right' });
      ctx0.tAnim = tAnim;
    },
    [],
    () => ({ context: { tAnim: 0 } }),
  );

  return (
    <Demo
      figure={figure}
      title="Patch antenna — half-wave inside the substrate"
      question="What sets the resonance frequency of a microstrip patch?"
      caption={
        <>
          A rectangular metal patch on a dielectric substrate (εᵣ) over a ground plane. The
          fundamental mode is a half-wavelength standing wave between the two radiating edges, so
          <strong> L ≈ λ / (2 √εᵣ)</strong>, i.e. <strong>f₀ ≈ c / (2 L √εᵣ)</strong>. The radiation
          pattern is broadside (perpendicular to the patch), with typical gain around 6 dBi and a
          broad ~80° beamwidth. Every smartphone's Wi-Fi, GPS and cellular antennas are variants on
          this geometry — sized for 2.4, 1.5 and 0.9 GHz respectively.
        </>
      }
    >
      <AutoResizeCanvas height={280} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="L"
          value={Lmm}
          min={10}
          max={60}
          step={0.5}
          format={(v) => v.toFixed(1) + ' mm'}
          onChange={setLmm}
        />
        <MiniSlider
          label="εᵣ"
          value={eps}
          min={1.0}
          max={10.0}
          step={0.05}
          format={(v) => v.toFixed(2)}
          onChange={setEps}
        />
        <MiniReadout label="f₀" value={f0GHz.toFixed(2)} unit="GHz" />
      </DemoControls>
      <EquationStrip
        leftLabel="Patch antenna resonance"
        left={<InlineMath tex="f_0 = c\,/\,(2\,L\,\sqrt{\varepsilon_r})" />}
        rightLabel="At this operating point"
        right={<InlineMath tex={`f_0 = c\\,/\\,(2 \\times ${Lmm.toFixed(1)}\\,\\text{mm} \\times \\sqrt{${eps.toFixed(2)}}) = ${f0GHz.toFixed(2)}\\,\\text{GHz}`} />}
      />
    </Demo>
  );
}

function drawArr(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  const dx = x2 - x1,
    dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len < 4) return;
  const ux = dx / len,
    uy = dy / len;
  const px = -uy,
    py = ux;
  const Hh = 5;
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - ux * Hh + px * 2.5, y2 - uy * Hh + py * 2.5);
  ctx.lineTo(x2 - ux * Hh - px * 2.5, y2 - uy * Hh - py * 2.5);
  ctx.closePath();
  ctx.fill();
}
