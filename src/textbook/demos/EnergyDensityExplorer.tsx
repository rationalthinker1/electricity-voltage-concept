/**
 * Demo D5.6 — Electric-field energy-density explorer
 *
 * The unified parallel-plate energy demo: two plates, animated field lines in
 * the gap, and an amber "energy haze" whose opacity tracks u_E = ½ε₀E². Three
 * live sliders — voltage V, plate separation d, and plate area A — drive the
 * whole picture. An inset on the right plots u_E against E so the reader can
 * watch the operating point ride up the parabola: stronger field means
 * quadratically more stored energy, not linearly more.
 *
 * Supersedes the V-only "energy in the gap" demo by adding the geometry
 * sliders (d, A) the reader needs to feel how C = ε₀A/d and E = V/d trade off.
 */
import { useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, EquationStrip, MiniReadout, MiniSlider } from '@/components/Demo';
import { M } from '@/components/Formula';
import { Num } from '@/components/Num';
import { PHYS, sciTeX } from '@/lib/physics';
import { withAlpha } from '@/lib/canvasTheme';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';
import { drawLabel } from '@/lib/canvasLayout';

interface Props {
  figure: string;
}

// Slider extents — used to fix the parabola's axes so the operating point
// genuinely climbs as the field grows, instead of being re-normalised away.
const V_MAX = 200; // V
const D_MIN_M = 0.1e-3; // 0.1 mm
const E_MAX = V_MAX / D_MIN_M; // strongest field the sliders can reach, V/m
const UE_MAX = 0.5 * PHYS.eps_0 * E_MAX * E_MAX; // matching energy density, J/m³

export function EnergyDensityExplorerDemo({ figure }: Props) {
  const [V, setV] = useState(12);
  const [d_mm, setDMm] = useState(1.0);
  const [A_cm2, setACm2] = useState(100);

  const A_m2 = A_cm2 * 1e-4;
  const d_m = d_mm * 1e-3;
  const C = (PHYS.eps_0 * A_m2) / d_m;
  const E = V / d_m;
  const u_E = 0.5 * PHYS.eps_0 * E * E;
  const U = 0.5 * C * V * V; // identically u_E · A · d

  const stateRef = useSimState({ V, d_mm, A_cm2, E, u_E });
  const setup = useSimLoop(
    stateRef,
    ({ ctx, w: W, h: H, colors }, _state, _dt, _simTime, ctx0) => {
      let phase = ctx0.phase;
      const s = stateRef.current;
      phase += 0.02;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, W, H);

      // Split: capacitor on the left, u_E-vs-E parabola on the right.
      const splitX = Math.min(W * 0.63, Math.max(W - 210, W * 0.55));

      // ---- Left: the capacitor ----
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, splitX, H);
      ctx.clip();

      const padX = 36;
      const wScale = Math.sqrt(s.A_cm2 / 200);
      const plateW = Math.max(120, Math.min(splitX - 2 * padX, 340 * wScale));
      const dNorm = (Math.log10(s.d_mm) - Math.log10(0.1)) / (Math.log10(10) - Math.log10(0.1));
      const gapPx = 24 + Math.max(0, Math.min(1, dNorm)) * (H * 0.46);
      const plateThick = 8;
      const cx = splitX / 2;
      const cy = H / 2;
      const xL = cx - plateW / 2;
      const topY = cy - gapPx / 2 - plateThick / 2;
      const botY = cy + gapPx / 2 + plateThick / 2;

      // Energy haze — opacity tracks u_E (log-compressed so the full slider
      // range stays legible).
      const haze = Math.max(0.05, Math.min(0.7, Math.log10(s.u_E + 1) * 0.12 + 0.1));
      const grd = ctx.createLinearGradient(0, topY + plateThick, 0, botY - plateThick);
      grd.addColorStop(0, withAlpha(colors.accent, haze * 0.45));
      grd.addColorStop(0.5, withAlpha(colors.accent, haze));
      grd.addColorStop(1, withAlpha(colors.accent, haze * 0.45));
      ctx.fillStyle = grd;
      ctx.fillRect(xL, topY + plateThick, plateW, botY - topY - plateThick * 2);

      // Field lines — count grows with field strength (denser = stronger).
      const usable = botY - topY - plateThick * 2 - 16;
      if (usable > 8 && s.E > 0) {
        const Nfield = Math.max(4, Math.min(20, Math.round(5 + 15 * (s.E / E_MAX))));
        const arrLen = Math.min(22, usable * 0.45);
        for (let i = 0; i < Nfield; i++) {
          const fx = xL + 18 + ((plateW - 36) * (i + 0.5)) / Nfield;
          const cycle = (phase * 70 + i * 11) % usable;
          const y1 = topY + plateThick + 8 + cycle;
          ctx.strokeStyle = colors.pink;
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          ctx.moveTo(fx, y1 - arrLen);
          ctx.lineTo(fx, y1);
          ctx.stroke();
          ctx.fillStyle = colors.pink;
          ctx.beginPath();
          ctx.moveTo(fx, y1);
          ctx.lineTo(fx - 3.5, y1 - 6);
          ctx.lineTo(fx + 3.5, y1 - 6);
          ctx.closePath();
          ctx.fill();
        }
      }

      drawPlate(ctx, xL, topY, plateW, plateThick, colors.pink);
      drawPlate(ctx, xL, botY - plateThick, plateW, plateThick, colors.blue);

      ctx.fillStyle = colors.textDim;
      drawLabel(ctx, {
        text: `E = ${(s.E / 1000).toFixed(1)} kV/m`,
        x: 12,
        y: 12,
        size: 11,
        font: '11px "JetBrains Mono", monospace',
        baseline: 'top',
      });
      drawLabel(ctx, {
        text: `u_E = ${s.u_E.toExponential(2)} J/m³`,
        x: 12,
        y: 27,
        size: 11,
        font: '11px "JetBrains Mono", monospace',
        baseline: 'top',
      });
      drawLabel(ctx, {
        text: '← energy lives in the gap',
        x: 12,
        y: H - 14,
        color: colors.accent,
        size: 10,
        font: '10px "JetBrains Mono", monospace',
        baseline: 'bottom',
      });
      ctx.restore();

      // Divider
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(splitX, 0);
      ctx.lineTo(splitX, H);
      ctx.stroke();

      // ---- Right: u_E vs E parabola ----
      ctx.save();
      ctx.beginPath();
      ctx.rect(splitX, 0, W - splitX, H);
      ctx.clip();

      const pX = splitX + 30;
      const pW = W - splitX - 44;
      const gY = 28;
      const gH = H - gY - 34;
      const xOfE = (e: number) => pX + (e / E_MAX) * pW;
      const yOfU = (u: number) => gY + gH - (u / UE_MAX) * (gH * 0.94);

      // axes
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pX, gY);
      ctx.lineTo(pX, gY + gH);
      ctx.lineTo(pX + pW, gY + gH);
      ctx.stroke();

      drawLabel(ctx, {
        text: 'u_E ∝ E²',
        x: pX + 4,
        y: gY - 4,
        color: colors.accent,
        size: 10,
        font: '10px "JetBrains Mono", monospace',
        baseline: 'bottom',
      });
      drawLabel(ctx, {
        text: 'E →',
        x: pX + pW,
        y: gY + gH + 4,
        color: colors.textDim,
        size: 9,
        font: '9px "JetBrains Mono", monospace',
        align: 'right',
        baseline: 'top',
      });
      drawLabel(ctx, {
        text: 'u_E',
        x: pX - 4,
        y: gY,
        color: colors.textDim,
        size: 9,
        font: '9px "JetBrains Mono", monospace',
        align: 'right',
        baseline: 'top',
      });

      // parabola
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      const N = 60;
      for (let i = 0; i <= N; i++) {
        const e = (E_MAX * i) / N;
        const u = 0.5 * PHYS.eps_0 * e * e;
        const x = xOfE(e);
        const y = yOfU(u);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // operating point + crosshair
      const opX = xOfE(Math.min(s.E, E_MAX));
      const opY = yOfU(Math.min(s.u_E, UE_MAX));
      ctx.strokeStyle = withAlpha(colors.text, 0.35);
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(opX, gY + gH);
      ctx.lineTo(opX, opY);
      ctx.moveTo(pX, opY);
      ctx.lineTo(opX, opY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = colors.accent;
      ctx.beginPath();
      ctx.arc(opX, opY, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx0.phase = phase;
    },
    [],
    () => ({ context: { phase: 0 } }),
  );

  return (
    <Demo
      figure={figure}
      title="Electric-field energy density"
      question="Crank V, squeeze d, widen A — where does the stored energy go, and how fast does it grow?"
      caption={
        <>
          The amber haze visualises{' '}
          <strong>
            u<sub>E</sub> = ½ ε₀ E²
          </strong>{' '}
          — the energy stored per cubic metre of field. The three sliders set the field two ways:{' '}
          <strong>V</strong> and <strong>d</strong> fix the field strength through{' '}
          <strong>E = V/d</strong>, while <strong>A</strong> sets how much volume that field fills.
          The parabola on the right is the punchline: double the field and the energy density{' '}
          <em>quadruples</em>. Total stored energy is <strong>u<sub>E</sub></strong> integrated over
          the gap volume <strong>A·d</strong>, which is exactly <strong>½ C V²</strong>.
        </>
      }
      deeperLab={{ slug: 'energy-density', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={320} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="V"
          value={V}
          min={0}
          max={V_MAX}
          step={1}
          format={(v) => v.toFixed(0) + ' V'}
          onChange={setV}
        />
        <MiniSlider
          label="d"
          value={d_mm}
          min={0.1}
          max={5}
          step={0.05}
          format={(v) => v.toFixed(2) + ' mm'}
          onChange={setDMm}
        />
        <MiniSlider
          label="A"
          value={A_cm2}
          min={10}
          max={500}
          step={5}
          format={(v) => v.toFixed(0) + ' cm²'}
          onChange={setACm2}
        />
        <MiniReadout label="C = ε₀A/d" value={<Num value={C} />} unit="F" />
        <MiniReadout label="E = V/d" value={<Num value={E} />} unit="V/m" />
        <MiniReadout label="u_E = ½ε₀E²" value={<Num value={u_E} />} unit="J/m³" />
        <MiniReadout label="U = ½CV²" value={<Num value={U} />} unit="J" />
      </DemoControls>
      <EquationStrip
        leftLabel="Energy density in the field"
        left={
          <M
            tex={
              `u_{E} \\;=\\; \\tfrac{1}{2}\\varepsilon_{0} E^{2} \\;=\\; ` +
              `\\tfrac{1}{2}(8.854\\!\\times\\!10^{-12})(${sciTeX(E)})^{2} ` +
              `\\;\\approx\\; ${sciTeX(u_E)}\\ \\text{J/m}^{3}`
            }
          />
        }
        rightLabel="Total = u_E × gap volume"
        right={<M tex={`U \\;=\\; u_{E} \\cdot A\\,d \\;\\approx\\; ${sciTeX(U)}\\ \\text{J}`} />}
      />
    </Demo>
  );
}

function drawPlate(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
) {
  const grd = ctx.createLinearGradient(x, y, x, y + h);
  grd.addColorStop(0, color);
  grd.addColorStop(1, color + '99');
  ctx.fillStyle = grd;
  ctx.shadowColor = color + 'a0';
  ctx.shadowBlur = 12;
  ctx.fillRect(x, y, w, h);
  ctx.shadowBlur = 0;
}
