/**
 * Demo D5.x — Dielectric slide-in
 *
 * A side-view of a parallel-plate capacitor with a slab of dielectric (the
 * coloured rectangle) that the reader can slide in and out of the gap.
 *
 * Two modes:
 *   - "Q held fixed" (battery disconnected, charge isolated on plates):
 *     sliding the dielectric in DROPS V by a factor εᵣ, since C grows
 *     by εᵣ and Q = CV is fixed.
 *   - "V held fixed" (battery connected): sliding the dielectric in pulls
 *     additional charge from the battery onto the plates; Q grows by εᵣ,
 *     V is unchanged.
 *
 * Either way C tracks the slab insertion fraction f via the parallel-
 * combination C(f) = ε₀ A/d · (1 − f + εᵣ f).
 */
import { useMemo, useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import {
  Demo,
  DemoControls,
  EquationStrip,
  MiniReadout,
  MiniSlider,
  MiniToggle,
} from '@/components/Demo';
import { M } from '@/components/Formula';
import { Num } from '@/components/Num';
import { PHYS } from '@/lib/physics';
import { withAlpha } from '@/lib/canvasTheme';
import { drawLabel } from '@/lib/canvasLayout';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

interface Props {
  figure: string;
}

export function DielectricSlideDemo({ figure }: Props) {
  const [f, setF] = useState(0.0); // insertion fraction 0..1
  const [epsR, setEpsR] = useState(4.0);
  const [holdQ, setHoldQ] = useState(true); // true: battery disconnected, Q fixed

  // Fixed geometry — only insertion / εᵣ are user-controlled here.
  const A_m2 = 100e-4; // 100 cm²
  const d_m = 1e-3; // 1 mm
  const V0 = 12; // initial voltage before sliding (battery EMF if connected)

  const C0 = (PHYS.eps_0 * A_m2) / d_m; // vacuum capacitance
  const C = C0 * (1 - f + epsR * f);

  const computed = useMemo(() => {
    if (holdQ) {
      // Charged once at V0 with vacuum gap, then battery disconnected.
      const Q = C0 * V0;
      const V = Q / C;
      const U = (0.5 * Q * Q) / C;
      return { Q, V, U };
    } else {
      // Battery stays connected at V0.
      const V = V0;
      const Q = C * V;
      const U = 0.5 * C * V * V;
      return { Q, V, U };
    }
  }, [holdQ, C, C0]);

  const stateRef = useSimState({ f, epsR, holdQ, computed });

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, colors }, state) => {
      const { f, epsR, holdQ, computed } = state;

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      // Layout: capacitor in centre, plates horizontal.
      const pad = 40;
      const plateW = w - 2 * pad;
      const cx = w / 2;
      const cy = h / 2;
      const gap = 60; // pixel gap between plates
      const plateThick = 4;
      const xL = cx - plateW / 2;
      const xR = cx + plateW / 2;
      const yTop = cy - gap / 2;
      const yBot = cy + gap / 2;

      // Slab — fills the gap from the LEFT, width proportional to f.
      const slabW = plateW * f;
      const slabX = xL;
      if (slabW > 1) {
        ctx.fillStyle = withAlpha(colors.teal, 0.18);
        ctx.fillRect(slabX, yTop + plateThick / 2, slabW, gap - plateThick);
        ctx.strokeStyle = withAlpha(colors.teal, 0.7);
        ctx.lineWidth = 1.5;
        ctx.strokeRect(slabX, yTop + plateThick / 2, slabW, gap - plateThick);

        // Polarisation arrows inside the slab: tiny vertical dipoles pointing
        // along the local field. The induced dipole points from − bound
        // charge to + bound charge, i.e. from the negative (bottom) plate
        // toward the positive (top) plate when V > 0.
        const polCols = Math.max(2, Math.floor(slabW / 22));
        const polRows = 2;
        ctx.strokeStyle = withAlpha(colors.teal, 0.8);
        ctx.lineWidth = 1.2;
        for (let i = 0; i < polCols; i++) {
          for (let j = 0; j < polRows; j++) {
            const px = slabX + (i + 0.5) * (slabW / polCols);
            const py = yTop + plateThick / 2 + (j + 0.5) * ((gap - plateThick) / polRows);
            // Two-charge dipole symbol: + above, − below.
            ctx.fillStyle = withAlpha(colors.pink, 0.7);
            ctx.beginPath();
            ctx.arc(px, py - 5, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = withAlpha(colors.blue, 0.7);
            ctx.beginPath();
            ctx.arc(px, py + 5, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Plates
      ctx.fillStyle = colors.pink;
      ctx.fillRect(xL, yTop - plateThick / 2, plateW, plateThick);
      ctx.fillStyle = colors.blue;
      ctx.fillRect(xL, yBot - plateThick / 2, plateW, plateThick);

      // Surface charge density representation: sparse + on top plate, − on bottom.
      // Density tied to current Q.
      const sigmaRef = (PHYS.eps_0 * V0) / d_m; // σ at vacuum, V = V0
      const sigmaNow = computed.Q / A_m2;
      const sigmaRel = Math.min(2.0, Math.max(0.1, sigmaNow / sigmaRef));
      const nMarks = Math.max(6, Math.min(28, Math.round(14 * sigmaRel)));
      ctx.font = `bold ${(9 + 4 * Math.min(1, sigmaRel)).toFixed(0)}px "JetBrains Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let i = 0; i < nMarks; i++) {
        const tx = xL + (plateW * (i + 0.5)) / nMarks;
        ctx.fillStyle = withAlpha(colors.pink, 0.92);
        ctx.fillText('+', tx, yTop - 14);
        ctx.fillStyle = withAlpha(colors.blue, 0.92);
        ctx.fillText('−', tx, yBot + 14);
      }

      // Battery wire indicator on the right side: drawn either as a closed
      // loop (battery connected) or as an open switch (disconnected).
      const battX = xR + 20;
      const battTopY = yTop;
      const battBotY = yBot;
      ctx.strokeStyle = colors.borderStrong;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(xR, battTopY);
      ctx.lineTo(battX, battTopY);
      ctx.moveTo(xR, battBotY);
      ctx.lineTo(battX, battBotY);
      ctx.stroke();
      if (holdQ) {
        // Open switch: gap in the right-hand wire
        ctx.strokeStyle = colors.textDim;
        ctx.beginPath();
        ctx.moveTo(battX, battTopY);
        ctx.lineTo(battX, (battTopY + battBotY) / 2 - 4);
        ctx.moveTo(battX, (battTopY + battBotY) / 2 + 4);
        ctx.lineTo(battX, battBotY);
        ctx.stroke();
        drawLabel(ctx, {
          text: 'open',
          x: battX + 8,
          y: (battTopY + battBotY) / 2,
          color: colors.textDim,
          font: '10px "JetBrains Mono", monospace',
          baseline: 'middle',
        });
      } else {
        ctx.strokeStyle = colors.accent;
        ctx.beginPath();
        ctx.moveTo(battX, battTopY);
        ctx.lineTo(battX, battBotY);
        ctx.stroke();
        // Battery glyph in the middle
        const my = (battTopY + battBotY) / 2;
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(battX - 6, my - 6);
        ctx.lineTo(battX + 6, my - 6);
        ctx.moveTo(battX - 3, my + 6);
        ctx.lineTo(battX + 3, my + 6);
        ctx.stroke();
        drawLabel(ctx, {
          text: `${V0} V`,
          x: battX + 10,
          y: my,
          color: colors.accent,
          font: '10px "JetBrains Mono", monospace',
          baseline: 'middle',
        });
      }

      // Slab handle hint
      if (f < 0.95) {
        ctx.fillStyle = colors.textDim;
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        drawLabel(ctx, {
          text: 'drag the “insertion” slider →',
          x: 14,
          y: 14,
          color: colors.textDim,
          font: '10px "JetBrains Mono", monospace',
          baseline: 'top',
        });
      }

      // Mode badge
      drawLabel(ctx, {
        text: holdQ ? 'Q held fixed (battery disconnected)' : 'V held fixed (battery connected)',
        x: w - 14,
        y: 14,
        color: holdQ ? colors.blue : colors.accent,
        font: '10px "JetBrains Mono", monospace',
        align: 'right',
        baseline: 'top',
      });

      // εᵣ value badge
      drawLabel(ctx, {
        text: `εᵣ = ${epsR.toFixed(1)}`,
        x: w - 14,
        y: 30,
        color: colors.teal,
        font: '10px "JetBrains Mono", monospace',
        align: 'right',
        baseline: 'top',
      });
    },
    [],
  );

  return (
    <Demo
      figure={figure}
      title="Slide a dielectric into the gap"
      question="What happens to V when you push a slab of high-εᵣ material between the plates?"
      deeperLab={{ slug: 'capacitance', label: 'See full lab' }}
      caption={
        <>
          Two modes, two stories. With the battery <strong>disconnected</strong> (Q held fixed), the
          dielectric drops V by exactly εᵣ — the same charge spreads its field through a more
          polarisable medium. With the battery <strong>connected</strong> (V held fixed), the slab
          instead pulls extra charge from the battery onto the plates: Q rises by εᵣ. Either way C
          itself grows by the same factor.
        </>
      }
    >
      <AutoResizeCanvas height={260} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="insertion f"
          value={f}
          min={0}
          max={1}
          step={0.01}
          format={(v) => (v * 100).toFixed(0) + '%'}
          onChange={setF}
        />
        <MiniSlider
          label="εᵣ"
          value={epsR}
          min={1}
          max={10}
          step={0.1}
          format={(v) => v.toFixed(1)}
          onChange={setEpsR}
        />
        <MiniToggle
          label={holdQ ? 'Q held (battery off)' : 'V held (battery on)'}
          checked={holdQ}
          onChange={setHoldQ}
        />
        <MiniReadout label="C" value={<Num value={C} />} unit="F" />
        <MiniReadout label="V" value={<Num value={computed.V} />} unit="V" />
        <MiniReadout label="Q" value={<Num value={computed.Q} />} unit="C" />
        <MiniReadout label="U = ½CV²" value={<Num value={computed.U} />} unit="J" />
      </DemoControls>
      <EquationStrip
        leftLabel="Mixed-gap capacitance"
        left={
          <M
            tex={
              `C(f) \\;=\\; \\dfrac{\\varepsilon_{0} A}{d}\\,\\bigl(1 - f + \\varepsilon_{r} f\\bigr) ` +
              `\\;\\approx\\; ${(C * 1e12).toFixed(1)}\\ \\text{pF}`
            }
          />
        }
        rightLabel={holdQ ? 'Q fixed → V drops by εᵣ' : 'V fixed → Q rises by εᵣ'}
        right={
          <M
            tex={
              holdQ
                ? `V \\;=\\; \\dfrac{Q}{C} \\;\\approx\\; ${computed.V.toFixed(2)}\\ \\text{V}`
                : `Q \\;=\\; CV \\;\\approx\\; ${(computed.Q * 1e9).toFixed(2)}\\ \\text{nC}`
            }
          />
        }
      />
    </Demo>
  );
}
