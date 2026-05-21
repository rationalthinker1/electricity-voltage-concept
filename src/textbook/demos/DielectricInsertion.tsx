/**
 * Demo D5.5 — Sliding a dielectric into a capacitor
 *
 * A parallel-plate capacitor (fixed A = 100 cm², d = 1 mm) with a discrete
 * material picker: vacuum, glass, water, barium-titanate ceramic. A toggle
 * between two boundary conditions:
 *
 *   • "isolated"  — charge Q held fixed. Inserting a dielectric drops V by εᵣ
 *                   and drops E by εᵣ.
 *   • "battery"   — voltage V held fixed. Inserting a dielectric multiplies
 *                   Q (and the surface-charge density σ) by εᵣ.
 *
 * Visualisation: two pink/blue plates of fixed size with a teal slab
 * sliding in to fill the gap. Slab opacity scales with log(εᵣ). Inside the
 * slab, short ↔ dipole glyphs show the bound polarisation charges
 * cancelling part of the applied field. Plate surface-charge "fringes"
 * grow with |Q|.
 *
 * Pedagogical thrust: εᵣ shows up in two formulas earlier in the chapter
 * but has no interactive home until this demo. The barium-titanate
 * (εᵣ ≈ 1200) slider position is the punchline — V drops by 1200× in
 * isolated mode, Q rises by 1200× in battery mode.
 */
import { useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, EquationStrip, MiniReadout, MiniSlider, MiniToggle } from '@/components/Demo';
import { InlineMath } from '@/components/Formula';
import { Num } from '@/components/Num';
import { drawLabel } from '@/lib/canvasLayout';
import { withAlpha } from '@/lib/canvasTheme';
import { PHYS } from '@/lib/physics';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

interface Props {
  figure?: string;
}

interface Material {
  key: string;
  label: string;
  epsR: number;
}

// Material values from Jackson 3e Ch.4 (water ~80 at room temperature) and
// the standard high-εᵣ ferroelectric ceramic literature for BaTiO₃ (typical
// undoped polycrystalline value ~1200 — see, e.g., Kittel 8e Ch.16).
const MATERIALS: Material[] = [
  { key: 'vacuum', label: 'vacuum', epsR: 1 },
  { key: 'glass', label: 'glass', epsR: 4 },
  { key: 'water', label: 'water (H₂O)', epsR: 80 },
  { key: 'batio3', label: 'BaTiO₃ ceramic', epsR: 1200 },
];

// Fixed geometry. A = 100 cm² = 0.01 m², d = 1 mm.
const A_M2 = 1e-2;
const D_M = 1e-3;
const C_VAC = (PHYS.eps_0 * A_M2) / D_M; // ≈ 88.54 pF
// Reference operating point: 10 V across vacuum gap → Q ≈ 885 pC.
const V_REF = 10;
const Q_REF = C_VAC * V_REF;

export function DielectricInsertionDemo({ figure }: Props) {
  const [materialIdx, setMaterialIdx] = useState(0);
  const [batteryMode, setBatteryMode] = useState(false);

  const mat = MATERIALS[materialIdx]!;
  const epsR = mat.epsR;
  const C = epsR * C_VAC;
  const V = batteryMode ? V_REF : V_REF / epsR;
  const Q = batteryMode ? Q_REF * epsR : Q_REF;
  const E = V / D_M;

  const stateRef = useSimState({ epsR, batteryMode });

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w: W, h: H, colors }, _state, _dt, _simTime) => {
      const s = stateRef.current;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, W, H);

      const cx = W / 2;
      const cy = H / 2;
      const plateW = Math.min(W * 0.7, 460);
      const plateThick = 8;
      const gap = Math.min(H * 0.45, 160);
      const xL = cx - plateW / 2;
      const xR = xL + plateW;
      const topY = cy - gap / 2 - plateThick / 2;
      const botY = cy + gap / 2 + plateThick / 2;
      const gapTop = topY + plateThick;
      const gapBot = botY - plateThick;
      const gapMid = (gapTop + gapBot) / 2;

      // ── Slab fill (only when not vacuum). Opacity scales with log10(εᵣ).
      if (s.epsR > 1) {
        const slabOpacity = Math.min(0.4, 0.07 + 0.12 * Math.log10(s.epsR));
        ctx.fillStyle = withAlpha(colors.teal, slabOpacity);
        ctx.fillRect(xL, gapTop, plateW, gapBot - gapTop);
        ctx.strokeStyle = withAlpha(colors.teal, 0.5);
        ctx.lineWidth = 1;
        ctx.strokeRect(xL, gapTop, plateW, gapBot - gapTop);
      }

      // ── Field arrows in the gap. Length scales with E relative to baseline.
      //    In battery mode E is constant (always at baseline); in isolated mode
      //    it shrinks by 1/εᵣ. Cap at near-zero so BaTiO₃ in isolated mode
      //    just shows a stub.
      const E_REL = s.batteryMode ? 1 : 1 / s.epsR;
      const arrowFracY = Math.max(0.08, Math.min(1, E_REL));
      const nArrows = 6;
      ctx.strokeStyle = withAlpha(colors.accent, 0.85);
      ctx.fillStyle = withAlpha(colors.accent, 0.85);
      ctx.lineWidth = 1.4;
      const fullLen = (gapBot - gapTop) * 0.78;
      const len = fullLen * arrowFracY;
      const arrowTop = gapMid - len / 2;
      const arrowBot = gapMid + len / 2;
      for (let i = 0; i < nArrows; i++) {
        const xa = xL + (plateW * (i + 0.5)) / nArrows;
        ctx.beginPath();
        ctx.moveTo(xa, arrowTop);
        ctx.lineTo(xa, arrowBot);
        ctx.stroke();
        // arrowhead at the bottom (E points from + to −)
        ctx.beginPath();
        ctx.moveTo(xa, arrowBot);
        ctx.lineTo(xa - 4, arrowBot - 7);
        ctx.lineTo(xa + 4, arrowBot - 7);
        ctx.closePath();
        ctx.fill();
      }

      // ── Bound-charge dipole glyphs inside the slab (rendered when εᵣ > 1).
      //    Each dipole is drawn anti-parallel to E to convey that bound
      //    polarisation partly cancels the applied field.
      if (s.epsR > 1) {
        const nCol = 8;
        const nRow = 3;
        const dipoleLen = Math.min(14, (gapBot - gapTop) / (nRow + 2));
        const polColor = withAlpha(colors.textDim, 0.85);
        ctx.strokeStyle = polColor;
        ctx.fillStyle = polColor;
        ctx.lineWidth = 1;
        for (let r = 0; r < nRow; r++) {
          for (let c = 0; c < nCol; c++) {
            const dx = xL + 18 + (c * (plateW - 36)) / Math.max(1, nCol - 1);
            const dy = gapTop + 10 + (r * (gapBot - gapTop - 20)) / Math.max(1, nRow - 1);
            // Dipole vertical, head up (anti-parallel to E which points down).
            ctx.beginPath();
            ctx.moveTo(dx, dy + dipoleLen / 2);
            ctx.lineTo(dx, dy - dipoleLen / 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(dx, dy - dipoleLen / 2);
            ctx.lineTo(dx - 2.5, dy - dipoleLen / 2 + 4);
            ctx.lineTo(dx + 2.5, dy - dipoleLen / 2 + 4);
            ctx.closePath();
            ctx.fill();
          }
        }
      }

      // ── Plates. The plate body is solid; a thin "fringe" inside the gap
      //    visualises surface-charge density σ = Q/A. Fringe thickness scales
      //    with |Q| relative to baseline.
      const Q_REL = s.batteryMode ? s.epsR : 1;
      // Clamp the fringe so BaTiO₃ in battery mode doesn't run off the gap.
      const fringeThick = Math.min(plateThick * 1.5, 1 + 2 * Math.log10(Q_REL + 1));

      // Top plate (positive).
      ctx.fillStyle = colors.pink;
      ctx.fillRect(xL, topY, plateW, plateThick);
      if (fringeThick > 0.5) {
        ctx.fillStyle = withAlpha(colors.pink, 0.7);
        ctx.fillRect(xL, gapTop, plateW, fringeThick);
      }
      // Bottom plate (negative).
      ctx.fillStyle = colors.blue;
      ctx.fillRect(xL, botY - plateThick, plateW, plateThick);
      if (fringeThick > 0.5) {
        ctx.fillStyle = withAlpha(colors.blue, 0.7);
        ctx.fillRect(xL, gapBot - fringeThick, plateW, fringeThick);
      }

      // Plate polarity glyphs and Q label.
      drawLabel(ctx, { text: '+Q', x: xL - 8, y: topY + plateThick / 2, color: colors.pink, weight: 'bold', size: 11, font: 'bold 11px "JetBrains Mono", monospace', align: 'right', baseline: 'middle' });
      drawLabel(ctx, { text: '−Q', x: xL - 8, y: botY - plateThick / 2, color: colors.blue });

      // Slab caption (material name + εᵣ value).
      drawLabel(ctx, {
        x: xR + 10,
        y: gapMid,
        text: `εᵣ = ${s.epsR}`,
        color: s.epsR === 1 ? colors.textDim : colors.teal,
        size: 11,
        baseline: 'middle',
      });

      // Mode label, top-left.
      drawLabel(ctx, {
        x: 14,
        y: 12,
        text: s.batteryMode ? 'mode: BATTERY (V fixed)' : 'mode: ISOLATED (Q fixed)',
        color: colors.accent,
        size: 11,
        baseline: 'top',
      });
      drawLabel(ctx, {
        x: 14,
        y: 28,
        text: `A = 100 cm²,  d = 1 mm`,
        color: colors.textDim,
        size: 10,
        baseline: 'top',
      });
    },
    [],
  );

  return (
    <Demo
      figure={figure ?? 'Fig. 5.5'}
      title="Slide a dielectric in"
      question="Putting a slab of glass — or water, or ceramic — between the plates multiplies the capacitance. What does it do to V, Q, and E?"
      caption={
        <>
          Two boundary conditions, one geometry. In <strong>isolated mode</strong> the plates start
          with a fixed charge Q; pushing a high-εᵣ slab into the gap forces V (and E) to drop by
          the same factor εᵣ — the bound polarisation charges inside the slab partially cancel the
          applied field. In <strong>battery mode</strong> the source clamps V, so the same slab
          pulls in εᵣ-times more charge from the battery. Pick BaTiO₃ ceramic to see a factor of
          ~1200 in either direction.
        </>
      }
      deeperLab={{ slug: 'capacitance', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={280} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="material"
          value={materialIdx}
          min={0}
          max={MATERIALS.length - 1}
          step={1}
          format={(v) => MATERIALS[v]?.label ?? '?'}
          onChange={(v) => setMaterialIdx(Math.round(v))}
        />
        <MiniToggle
          label={batteryMode ? 'battery (V fixed)' : 'isolated (Q fixed)'}
          checked={batteryMode}
          onChange={setBatteryMode}
        />
        <MiniReadout label="C = εᵣ·ε₀A/d" value={<Num value={C} />} unit="F" />
        <MiniReadout label="V" value={<Num value={V} />} unit="V" />
        <MiniReadout label="E = V/d" value={<Num value={E} />} unit="V/m" />
        <MiniReadout label="Q = CV" value={<Num value={Q} />} unit="C" />
      </DemoControls>
      <EquationStrip
        leftLabel="Geometry rule"
        left={
          <InlineMath
            tex={
              `C \\;=\\; \\dfrac{\\varepsilon_0 \\varepsilon_r A}{d} ` +
              `\\;=\\; ${epsR} \\cdot ${(C_VAC * 1e12).toFixed(1)}\\ \\text{pF} ` +
              `\\;=\\; ${(C * 1e9).toFixed(2)}\\ \\text{nF}`
            }
          />
        }
        rightLabel={batteryMode ? 'V clamped — Q scales' : 'Q clamped — V drops'}
        right={
          batteryMode ? (
            <InlineMath
              tex={
                `Q \\;=\\; CV \\;=\\; ${(C * 1e9).toFixed(2)}\\ \\text{nF} \\cdot ${V_REF}\\ \\text{V} ` +
                `\\;=\\; ${(Q * 1e9).toFixed(1)}\\ \\text{nC}`
              }
            />
          ) : (
            <InlineMath
              tex={
                `V \\;=\\; Q/C \\;=\\; \\dfrac{${V_REF}\\ \\text{V}}{${epsR}} ` +
                `\\;=\\; ${V.toFixed(epsR >= 100 ? 4 : 2)}\\ \\text{V}`
              }
            />
          )
        }
      />
    </Demo>
  );
}
