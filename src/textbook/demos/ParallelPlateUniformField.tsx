/**
 * Demo D1.6 — Parallel-plate uniform field
 *
 * Two horizontal plates: pink (positive, top) and blue (negative, bottom).
 * Between them, a perfectly uniform grid of amber field arrows. Outside,
 * almost nothing — a faint fringe at the edges.
 *
 * Sliders: plate separation d (mm) and surface charge density σ (nC/cm²).
 * Readouts: |E| = σ/ε₀ in V/m and V = E·d in volts.
 *
 * The pedagogical surprise: drag d. The arrow lengths between the plates
 * stay exactly the same. The uniform field of an ideal parallel plate is
 * independent of separation — only V scales with d.  E only changes when
 * you change the charge on the plates, not the geometry of the gap.
 *
 * Sources for the model: Griffiths §2.5 (Gauss pillbox derivation),
 * Feynman II §5-5, OpenStax Vol. 2 Ch. 5 ("infinite plane / parallel plate").
 */
import { useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, EquationStrip, MiniReadout, MiniSlider } from '@/components/Demo';
import { InlineMath } from '@/components/Formula';
import { Num } from '@/components/Num';
import { drawLabel } from '@/lib/canvasLayout';
import { withAlpha } from '@/lib/canvasTheme';
import { PHYS, sciTeX } from '@/lib/physics';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

interface Props {
  figure: string;
}

export function ParallelPlateUniformFieldDemo({ figure }: Props) {
  // Plate separation in millimetres (20–150 mm). Visual only — the field
  // magnitude does NOT depend on this, which is the point of the demo.
  const [d_mm, setDmm] = useState(60);
  // Surface charge density per plate in nC/cm². Realistic lab-scale: a
  // 1 nC/cm² = 1e-5 C/m² plate at 6 cm separation gives E ≈ 1.1 MV/m and
  // V ≈ 68 kV. The values are illustrative, not safe to assemble.
  const [sigma_nC_cm2, setSigma] = useState(0.05);

  // SI conversions for readouts and equation strip.
  const sigma_SI = sigma_nC_cm2 * 1e-5; // 1 nC/cm² = 1e-9 / 1e-4 = 1e-5 C/m²
  const d_m = d_mm * 1e-3;
  const E_Vm = sigma_SI / PHYS.eps_0; // V/m
  const V = E_Vm * d_m; // volts

  const stateRef = useSimState({ d_mm, sigma_nC_cm2 });

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, colors }) => {
      const s = stateRef.current;
      const { d_mm: dMm, sigma_nC_cm2: sigma } = s;

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      // Layout — two plates centred vertically. Mapping: 150 mm (slider max)
      // fills 65% of the canvas height; smaller separations shrink the gap
      // proportionally so the plates visibly move closer together.
      const padX = 60;
      const plateWidth = w - 2 * padX;
      const cyMid = h * 0.52;
      // d_mm maps linearly to pixel gap. 1 mm → ~1.8 px in this layout.
      const gapPx = (dMm / 150) * (h * 0.62);
      const yTop = cyMid - gapPx / 2;
      const yBot = cyMid + gapPx / 2;

      // ── Plates ─────────────────────────────────────────────────────────
      const plateThickness = 8;
      // Top plate (+, pink).
      ctx.fillStyle = colors.pink;
      ctx.fillRect(padX, yTop - plateThickness, plateWidth, plateThickness);
      // Bottom plate (−, blue).
      ctx.fillStyle = colors.blue;
      ctx.fillRect(padX, yBot, plateWidth, plateThickness);

      // ── + and − signs along each plate ─────────────────────────────────
      ctx.font = 'bold 12px "JetBrains Mono", monospace';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      const signStep = 36;
      ctx.fillStyle = colors.bg;
      for (let x = padX + signStep / 2; x < padX + plateWidth; x += signStep) {
        ctx.fillText('+', x, yTop - plateThickness / 2);
        ctx.fillText('−', x, yBot + plateThickness / 2);
      }

      // ── Uniform field arrows in the gap ───────────────────────────────
      // The arrow length is set by σ (drag the σ slider to lengthen them);
      // separation d does NOT affect arrow length. This is the surprise.
      // We cap visually so a saturated σ doesn't outgrow the gap.
      const sigmaNorm = sigma / 0.2; // 0..1 across the slider range
      const arrowLen = Math.max(8, Math.min(gapPx * 0.7, 14 + sigmaNorm * 56));
      const arrowAlpha = 0.4 + 0.55 * sigmaNorm;
      ctx.strokeStyle = withAlpha(colors.accent, arrowAlpha);
      ctx.fillStyle = withAlpha(colors.accent, arrowAlpha);
      ctx.lineWidth = 1.4;

      // Grid stride: roughly 30 px apart horizontally.
      const xStride = 30;
      const yMidGap = (yTop + yBot) / 2;
      // Slight inset so the arrows don't poke past the plate ends visually.
      for (let x = padX + xStride / 2; x < padX + plateWidth; x += xStride) {
        const y0 = yMidGap - arrowLen / 2;
        const y1 = yMidGap + arrowLen / 2;
        ctx.beginPath();
        ctx.moveTo(x, y0);
        ctx.lineTo(x, y1);
        ctx.stroke();
        // Arrowhead at the bottom (field points + → −).
        ctx.beginPath();
        ctx.moveTo(x, y1);
        ctx.lineTo(x - 4, y1 - 6);
        ctx.lineTo(x + 4, y1 - 6);
        ctx.closePath();
        ctx.fill();
      }

      // ── Faint fringe at the plate edges ───────────────────────────────
      // Just enough to remind the reader this is "approximately" uniform —
      // a real finite plate bulges outward at the corners. Two tiny curved
      // arrows at each end, drawn in textDim so they don't compete with
      // the main field grid.
      ctx.strokeStyle = withAlpha(colors.textDim, 0.55 * arrowAlpha);
      ctx.lineWidth = 1;
      for (const side of [-1, +1]) {
        const xEdge = side > 0 ? padX + plateWidth : padX;
        for (const dy of [-arrowLen * 0.35, arrowLen * 0.35]) {
          const sx = xEdge;
          const sy = yMidGap + dy;
          const cpx = xEdge + side * 22;
          const cpy = sy;
          const ex = xEdge + side * 18;
          const ey = sy + dy * 0.4 + side * 6;
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.quadraticCurveTo(cpx, cpy, ex, ey);
          ctx.stroke();
        }
      }

      // ── Annotations ────────────────────────────────────────────────────
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textBaseline = 'alphabetic';
      // Plate labels (small + and − on the outside ends).
      ctx.textAlign = 'left';
      drawLabel(ctx, { text: '+ plate (σ > 0)', x: padX, y: yTop - plateThickness - 6, color: colors.pink, font: '10px "JetBrains Mono", monospace' });
      drawLabel(ctx, { text: '− plate (σ < 0)', x: padX, y: yBot + plateThickness + 14, color: colors.blue, font: '10px "JetBrains Mono", monospace' });

      // Separation indicator — a dashed bracket at the right edge.
      ctx.save();
      ctx.strokeStyle = withAlpha(colors.teal, 0.7);
      ctx.fillStyle = withAlpha(colors.teal, 0.95);
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      const bracketX = padX + plateWidth + 8;
      ctx.beginPath();
      ctx.moveTo(bracketX, yTop);
      ctx.lineTo(bracketX + 14, yTop);
      ctx.moveTo(bracketX + 7, yTop);
      ctx.lineTo(bracketX + 7, yBot);
      ctx.moveTo(bracketX, yBot);
      ctx.lineTo(bracketX + 14, yBot);
      ctx.stroke();
      ctx.setLineDash([]);
      drawLabel(ctx, { text: `d = ${dMm.toFixed(0)} mm`, x: bracketX + 18, y: (yTop + yBot) / 2, baseline: 'middle' });
      ctx.restore();

      // Disclosure caption — what's fixed vs what's varying.
      ctx.save();
      ctx.globalAlpha = 0.8;
      drawLabel(ctx, {
        x: padX,
        y: h - 14,
        text: 'try this: drag d. The arrows between the plates do not change length.',
        color: colors.textDim,
      });
      ctx.restore();
    },
    [],
  );

  return (
    <Demo
      figure={figure}
      title="The uniform field between parallel plates"
      question="Slide the plates closer or farther apart. Does the field between them change?"
      caption={
        <>
          Two charged plates carry surface densities <em>±σ</em>. The field between them is{' '}
          <strong>|E| = σ/ε₀</strong> — set by the charge density alone, independent of how far
          apart you put the plates. Drag <strong>d</strong> and the arrows hold their length. Drag{' '}
          <strong>σ</strong> and they lengthen together. Voltage <em>does</em> scale with d, because{' '}
          <em>V = E · d</em>. This is the geometry that becomes a capacitor in Ch.5 and the entry
          point for <em>V = Ed</em> in Ch.2.
        </>
      }
      deeperLab={{ slug: 'potential', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="separation d"
          value={d_mm}
          min={20}
          max={150}
          step={1}
          format={(v) => v.toFixed(0) + ' mm'}
          onChange={setDmm}
        />
        <MiniSlider
          label="surface charge σ"
          value={sigma_nC_cm2}
          min={0.005}
          max={0.2}
          step={0.005}
          format={(v) => v.toFixed(3) + ' nC/cm²'}
          onChange={setSigma}
        />
        <MiniReadout label="|E| = σ/ε₀" value={<Num value={E_Vm} />} unit="V/m" />
        <MiniReadout label="V = E·d" value={<Num value={V} />} unit="V" />
      </DemoControls>
      <EquationStrip
        leftLabel="Uniform field (independent of d)"
        left={
          <InlineMath
            tex={
              `|\\vec{E}| \\;=\\; \\dfrac{\\sigma}{\\varepsilon_{0}} \\;=\\; ` +
              `\\dfrac{${sciTeX(sigma_SI)}}{8.85\\times 10^{-12}} ` +
              `\\;\\approx\\; ${sciTeX(E_Vm)}\\ \\text{V/m}`
            }
          />
        }
        rightLabel="Voltage (scales with d) — preview of Ch.2"
        right={
          <InlineMath
            tex={
              `V \\;=\\; E\\,d \\;=\\; ` +
              `(${sciTeX(E_Vm)})(${d_m.toFixed(3)}) ` +
              `\\;\\approx\\; ${sciTeX(V)}\\ \\text{V}`
            }
          />
        }
      />
    </Demo>
  );
}
