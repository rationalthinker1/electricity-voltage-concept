/**
 * Demo D11.2 — A dielectric slab in a parallel-plate capacitor
 *
 * Two horizontal plates with free charge ±σ_f on them set up an applied
 * field E₀ = V/d (downward). Toggle a slab of dielectric between the plates:
 * bound charges appear on its upper and lower faces, opposing the applied field.
 * Net field inside the dielectric is reduced to E = E₀ / ε_r.
 * Capacitance C scales by ε_r.
 */
import { useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider, MiniToggle } from '@/components/Demo';
import { Num } from '@/components/Num';
import { drawLabel } from '@/lib/canvasLayout';
import { drawArrow } from '@/lib/canvasPrimitives';
import { PHYS } from '@/lib/physics';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

interface Props {
  figure?: string;
}

export function DielectricBetweenPlatesDemo({ figure }: Props) {
  const [V, setV] = useState(5); // applied voltage (V)
  const [er, setEr] = useState(80); // relative permittivity (water default)
  const [inserted, setInserted] = useState(false);

  const stateRef = useSimState({ V, er, inserted });
  // Geometry: plate separation d = 4 mm, plate area A = 1 cm² for the readout
  const d_m = 4e-3;
  const A_m2 = 1e-4;
  const erEff = inserted ? er : 1;
  const E_applied = V / d_m;
  const E_inside = E_applied / erEff;
  const C_vac = (PHYS.eps_0 * A_m2) / d_m;
  const C_eff = C_vac * erEff;

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, colors }, _state, _dt, simTime) => {
      const t = simTime;
      const { V, er, inserted } = stateRef.current;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);
      const plateW = Math.min(w - 80, 480);
      const px = (w - plateW) / 2;
      const yTop = h * 0.18;
      const yBot = h * 0.82;
      const gapH = yBot - yTop;
      ctx.fillStyle = colors.pink;
      ctx.fillRect(px, yTop - 6, plateW, 6);
      ctx.fillStyle = colors.blue;
      ctx.fillRect(px, yBot, plateW, 6);
      ctx.save();
      ctx.globalAlpha = 0.65;
      drawLabel(ctx, { text: `+ free charge   V = ${V.toFixed(1)} V`, x: w / 2, y: yTop - 14, color: colors.text, font: '10px "JetBrains Mono", monospace', align: 'center' });
      ctx.restore();
      drawLabel(ctx, { text: `− free charge`, x: w / 2, y: yBot + 18 });
      const ticks = 12;
      ctx.fillStyle = colors.bg;
      ctx.font = '11px "JetBrains Mono", monospace';
      for (let i = 0; i < ticks; i++) {
        const x = px + (i + 0.5) * (plateW / ticks);
        ctx.fillText('+', x, yTop - 1);
        ctx.fillText('−', x, yBot + 4.5);
      }
      const erEff = inserted ? er : 1;
      const slabPad = gapH * 0.18;
      const slabTop = yTop + slabPad;
      const slabBot = yBot - slabPad;
      if (inserted) {
        // Slab body
        ctx.save();
        ctx.globalAlpha = 0.1;
        ctx.fillStyle = colors.teal;
        ctx.fillRect(px + 12, slabTop, plateW - 24, slabBot - slabTop);
        ctx.restore();
        ctx.strokeStyle = colors.teal;
        ctx.lineWidth = 1;
        ctx.strokeRect(px + 12, slabTop, plateW - 24, slabBot - slabTop);
        drawLabel(ctx, { text: `dielectric  ε_r = ${er.toFixed(1)}`, x: px + 18, y: slabTop + 14, color: colors.teal, font: '10px "JetBrains Mono", monospace' });

        // Bound surface charges on the slab faces: top = negative (attracted toward + plate),
        // bottom = positive (attracted toward − plate). They partially cancel free charge.
        ctx.save();
        ctx.globalAlpha = 0.65;
        ctx.fillStyle = colors.blue;
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        for (let i = 0; i < ticks; i++) {
          const x = px + (i + 0.5) * (plateW / ticks);
          ctx.fillText('−', x, slabTop + 4);
          ctx.restore();
        }
        ctx.save();
        ctx.globalAlpha = 0.65;
        ctx.fillStyle = colors.pink;
        for (let i = 0; i < ticks; i++) {
          const x = px + (i + 0.5) * (plateW / ticks);
          ctx.fillText('+', x, slabBot - 0);
          ctx.restore();
        }

        // Bound-charge labels
        ctx.fillStyle = colors.textDim;
        ctx.textAlign = 'left';
        drawLabel(ctx, { text: 'bound − on top face', x: px + 18, y: slabTop + 28 });
        drawLabel(ctx, { text: 'bound + on bottom face', x: px + 18, y: slabBot - 14 });

        // Tiny aligned dipoles inside the slab — purely decorative
        const cols = 10;
        const rows = 3;
        for (let i = 0; i < cols; i++) {
          for (let j = 0; j < rows; j++) {
            const cx = px + 24 + (i + 0.5) * ((plateW - 48) / cols);
            const cy = slabTop + 22 + (j + 1) * ((slabBot - slabTop - 44) / (rows + 1));
            ctx.fillStyle = colors.blue;
            ctx.beginPath();
            ctx.arc(cx, cy - 4, 1.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = colors.pink;
            ctx.beginPath();
            ctx.arc(cx, cy + 4, 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      const arrowsN = 6;
      const phase = (t * 0.6) % 1;
      for (let i = 0; i < arrowsN; i++) {
        const ax = px + (i + 0.5) * (plateW / arrowsN);

        const drawFieldArrow = (y0: number, len: number, alpha: number) => {
          drawArrow(
            ctx,
            { x: ax, y: y0 },
            { x: ax, y: y0 + len },
            {
              color: `rgba(255,107,42,${alpha.toFixed(3)})`,
              headLength: 6,
              headWidth: 3,
              lineWidth: 1.4,
            },
          );
        };

        // Above the slab — applied field
        if (inserted) {
          drawFieldArrow(yTop + 4, slabTop - yTop - 8, 0.85);
          // Inside slab — reduced field
          const insideLen = Math.max(8, (slabBot - slabTop - 8) / Math.max(1, erEff * 0.25));
          drawFieldArrow(slabTop + 4 + (slabBot - slabTop - 8 - insideLen) / 2, insideLen, 0.4);
          // Below slab — applied field again
          drawFieldArrow(slabBot + 4, yBot - slabBot - 8, 0.85);
        } else {
          drawFieldArrow(yTop + 4, yBot - yTop - 8, 0.85);
        }
      }
      for (let i = 0; i < arrowsN; i++) {
        const ax = px + (i + 0.5) * (plateW / arrowsN);
        const yp = yTop + ((phase + i / arrowsN) % 1) * (yBot - yTop);
        ctx.save();
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = colors.accent;
        ctx.beginPath();
        ctx.arc(ax, yp, 1.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      drawLabel(ctx, {
        x: 14,
        y: h - 14,
        text: `E_inside = E₀ / ε_r = ${(V / 4e-3 / erEff).toFixed(0)} V/m`,
        color: colors.accent,
        size: 11,
      });
    },
    [],
  );

  return (
    <Demo
      figure={figure ?? 'Fig. 17.2'}
      title="Dielectric slab in a parallel-plate capacitor"
      question="What does inserting a dielectric do to the field and the capacitance?"
      caption={
        <>
          With the gap empty, the field between the plates is the full <em>E₀ = V/d</em>. Slide a
          slab of dielectric in and bound surface charges appear at the slab faces — opposite in
          sign to the free charge on each plate, by exactly the right amount to drop the field
          inside the slab to <em>E₀/ε_r</em>. The capacitance jumps by the same factor:{' '}
          <em>C = ε_r · C₀</em>. That is the whole reason a 1 µF ceramic cap is smaller than a 1 µF
          air-gap cap.
        </>
      }
      deeperLab={{ slug: 'capacitance', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={320} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="V"
          value={V}
          min={0.5}
          max={20}
          step={0.1}
          format={(v) => v.toFixed(1) + ' V'}
          onChange={setV}
        />
        <MiniSlider
          label="ε_r"
          value={er}
          min={1}
          max={100}
          step={0.1}
          format={(v) => v.toFixed(1)}
          onChange={setEr}
        />
        <MiniToggle
          label={inserted ? 'Dielectric inserted' : 'Empty gap'}
          checked={inserted}
          onChange={setInserted}
        />
        <MiniReadout label="E inside" value={<Num value={E_inside} digits={2} />} unit="V/m" />
        <MiniReadout label="C" value={<Num value={C_eff} digits={2} />} unit="F" />
      </DemoControls>
    </Demo>
  );
}
