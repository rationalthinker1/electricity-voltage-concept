/**
 * Demo D11.2 — A dielectric slab in a parallel-plate capacitor
 *
 * Two horizontal plates with free charge ±σ_f on them set up an applied
 * field E₀ = V/d (downward). Toggle a slab of dielectric between the plates:
 * bound charges appear on its upper and lower faces, opposing the applied field.
 * Net field inside the dielectric is reduced to E = E₀ / ε_r.
 * Capacitance C scales by ε_r.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider, MiniToggle } from '@/components/Demo';
import { Num } from '@/components/Num';
import { drawArrow } from '@/lib/canvasPrimitives';
import { PHYS } from '@/lib/physics';

interface Props { figure?: string }

export function DielectricBetweenPlatesDemo({ figure }: Props) {
  const [V, setV] = useState(5);          // applied voltage (V)
  const [er, setEr] = useState(80);       // relative permittivity (water default)
  const [inserted, setInserted] = useState(false);

  const stateRef = useRef({ V, er, inserted });
  useEffect(() => { stateRef.current = { V, er, inserted }; }, [V, er, inserted]);

  // Geometry: plate separation d = 4 mm, plate area A = 1 cm² for the readout
  const d_m = 4e-3;
  const A_m2 = 1e-4;
  const erEff = inserted ? er : 1;
  const E_applied = V / d_m;
  const E_inside = E_applied / erEff;
  const C_vac = PHYS.eps_0 * A_m2 / d_m;
  const C_eff = C_vac * erEff;

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, colors } = info;
    let raf = 0;
    const tStart = performance.now() / 1000;

    function draw() {
      const t = performance.now() / 1000 - tStart;
      const { V, er, inserted } = stateRef.current;

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      // Layout: plates horizontal, gap in middle
      const plateW = Math.min(w - 80, 480);
      const px = (w - plateW) / 2;
      const yTop = h * 0.18;
      const yBot = h * 0.82;
      const gapH = yBot - yTop;

      // Top plate (positive free charge)
      ctx.fillStyle = colors.pink;
      ctx.fillRect(px, yTop - 6, plateW, 6);
      // Bottom plate (negative free charge)
      ctx.fillStyle = colors.blue;
      ctx.fillRect(px, yBot, plateW, 6);

      // Plate labels
      ctx.fillStyle = 'rgba(255,255,255,0.65)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`+ free charge   V = ${V.toFixed(1)} V`, w / 2, yTop - 14);
      ctx.fillText(`− free charge`, w / 2, yBot + 18);

      // Free-charge "+" / "−" tick marks along the plates
      const ticks = 12;
      ctx.fillStyle = colors.bg;
      ctx.font = '11px "JetBrains Mono", monospace';
      for (let i = 0; i < ticks; i++) {
        const x = px + (i + 0.5) * (plateW / ticks);
        ctx.fillText('+', x, yTop - 1);
        ctx.fillText('−', x, yBot + 4.5);
      }

      const erEff = inserted ? er : 1;

      // Dielectric slab — thinner than the full gap
      const slabPad = gapH * 0.18;
      const slabTop = yTop + slabPad;
      const slabBot = yBot - slabPad;
      if (inserted) {
        // Slab body
        ctx.fillStyle = 'rgba(108,197,194,0.10)';
        ctx.fillRect(px + 12, slabTop, plateW - 24, slabBot - slabTop);
        ctx.strokeStyle = colors.teal;
        ctx.lineWidth = 1;
        ctx.strokeRect(px + 12, slabTop, plateW - 24, slabBot - slabTop);
        ctx.fillStyle = colors.teal;
        ctx.textAlign = 'left';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillText(`dielectric  ε_r = ${er.toFixed(1)}`, px + 18, slabTop + 14);

        // Bound surface charges on the slab faces: top = negative (attracted toward + plate),
        // bottom = positive (attracted toward − plate). They partially cancel free charge.
        ctx.fillStyle = 'rgba(91,174,248,0.65)';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        for (let i = 0; i < ticks; i++) {
          const x = px + (i + 0.5) * (plateW / ticks);
          ctx.fillText('−', x, slabTop + 4);
        }
        ctx.fillStyle = 'rgba(255,59,110,0.65)';
        for (let i = 0; i < ticks; i++) {
          const x = px + (i + 0.5) * (plateW / ticks);
          ctx.fillText('+', x, slabBot - 0);
        }

        // Bound-charge labels
        ctx.fillStyle = colors.textDim;
        ctx.textAlign = 'left';
        ctx.fillText('bound − on top face', px + 18, slabTop + 28);
        ctx.fillText('bound + on bottom face', px + 18, slabBot - 14);

        // Tiny aligned dipoles inside the slab — purely decorative
        const cols = 10;
        const rows = 3;
        for (let i = 0; i < cols; i++) {
          for (let j = 0; j < rows; j++) {
            const cx = px + 24 + (i + 0.5) * ((plateW - 48) / cols);
            const cy = slabTop + 22 + (j + 1) * ((slabBot - slabTop - 44) / (rows + 1));
            ctx.fillStyle = colors.blue;
            ctx.beginPath(); ctx.arc(cx, cy - 4, 1.5, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = colors.pink;
            ctx.beginPath(); ctx.arc(cx, cy + 4, 1.5, 0, Math.PI * 2); ctx.fill();
          }
        }
      }

      // Field arrows in the gap. In the gap (outside slab) the field is E_applied.
      // Inside the slab the field is reduced to E_applied / er.
      const arrowsN = 6;
      // Drift phase for tracer
      const phase = (t * 0.6) % 1;
      for (let i = 0; i < arrowsN; i++) {
        const ax = px + (i + 0.5) * (plateW / arrowsN);

        const drawFieldArrow = (y0: number, len: number, alpha: number) => {
          drawArrow(ctx, { x: ax, y: y0 }, { x: ax, y: y0 + len }, {
            color: `rgba(255,107,42,${alpha.toFixed(3)})`,
            headLength: 6,
            headWidth: 3,
            lineWidth: 1.4,
          });
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

      // Drift tracers (small dots flowing top→bottom for fun)
      for (let i = 0; i < arrowsN; i++) {
        const ax = px + (i + 0.5) * (plateW / arrowsN);
        const yp = yTop + ((phase + i / arrowsN) % 1) * (yBot - yTop);
        ctx.fillStyle = 'rgba(255,107,42,0.6)';
        ctx.beginPath(); ctx.arc(ax, yp, 1.6, 0, Math.PI * 2); ctx.fill();
      }

      // Readout overlay
      ctx.fillStyle = colors.accent;
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`E_inside = E₀ / ε_r = ${(V / 4e-3 / erEff).toFixed(0)} V/m`, 14, h - 14);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 11.2'}
      title="Dielectric slab in a parallel-plate capacitor"
      question="What does inserting a dielectric do to the field and the capacitance?"
      caption={<>
        With the gap empty, the field between the plates is the full <em>E₀ = V/d</em>.
        Slide a slab of dielectric in and bound surface charges appear at the slab faces — opposite
        in sign to the free charge on each plate, by exactly the right amount to drop the field
        inside the slab to <em>E₀/ε_r</em>. The capacitance jumps by the same factor: <em>C = ε_r · C₀</em>.
        That is the whole reason a 1 µF ceramic cap is smaller than a 1 µF air-gap cap.
      </>}
      deeperLab={{ slug: 'capacitance', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={320} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="V"
          value={V} min={0.5} max={20} step={0.1}
          format={v => v.toFixed(1) + ' V'}
          onChange={setV}
        />
        <MiniSlider
          label="ε_r"
          value={er} min={1} max={100} step={0.1}
          format={v => v.toFixed(1)}
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
