/**
 * Demo D13.4 — Smith chart basics
 *
 * The Smith chart is the unit-disk image of the right-half impedance plane
 * under the bilinear map
 *
 *   Γ = (z − 1)/(z + 1),     z = Z_L / Z_0
 *
 * Constant-r circles and constant-x arcs become the familiar grid. The
 * reader chooses Z_L = R + jX (in ohms) on a Z_0 = 50 Ω system. A marker
 * shows where Γ sits, and the chart prints |Γ|, ∠Γ, VSWR, and the
 * quarter-wave transform Z_in = Z_0² / Z_L (a 180° rotation through the
 * origin on the chart).
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import {
  Demo, DemoControls, MiniReadout, MiniSlider, MiniToggle,
} from '@/components/Demo';

interface Props { figure?: string }

export function SmithChartBasicsDemo({ figure }: Props) {
  const Z0 = 50;
  const [R, setR] = useState(100);     // Ω
  const [X, setX] = useState(50);      // Ω (can be negative)
  const [showQwave, setShowQwave] = useState(false);

  // z = Z/Z0; Γ = (z−1)/(z+1) with complex arithmetic
  const zr = R / Z0, zi = X / Z0;
  const dr = zr + 1, di = zi;
  const nr = zr - 1, ni = zi;
  // (nr + j ni) / (dr + j di) = ((nr·dr + ni·di) + j(ni·dr − nr·di)) / (dr² + di²)
  const denom = dr * dr + di * di;
  const Gr = (nr * dr + ni * di) / denom;
  const Gi = (ni * dr - nr * di) / denom;
  const Gmag = Math.sqrt(Gr * Gr + Gi * Gi);
  const GangleDeg = Math.atan2(Gi, Gr) * 180 / Math.PI;
  const VSWR = Gmag >= 1 - 1e-6 ? Infinity : (1 + Gmag) / (1 - Gmag);

  // Quarter-wave transform Z_in = Z_0^2 / Z_L
  const ZLmagSq = R * R + X * X;
  const Zin_r = ZLmagSq > 0 ? (Z0 * Z0 * R) / ZLmagSq : 0;
  const Zin_x = ZLmagSq > 0 ? -(Z0 * Z0 * X) / ZLmagSq : 0;

  const stateRef = useRef({ R, X, Gr, Gi, Gmag, showQwave });
  useEffect(() => {
    stateRef.current = { R, X, Gr, Gi, Gmag, showQwave };
  }, [R, X, Gr, Gi, Gmag, showQwave]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h } = info;
    let raf = 0;

    function draw() {
      const { Gr, Gi, Gmag, showQwave } = stateRef.current;

      ctx.fillStyle = '#0d0d10';
      ctx.fillRect(0, 0, w, h);

      const margin = 18;
      const radius = Math.min(w, h) / 2 - margin;
      const cx = w / 2;
      const cy = h / 2;

      // Outer unit circle |Γ| = 1
      ctx.strokeStyle = 'rgba(255,255,255,0.20)';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Real axis
      ctx.strokeStyle = 'rgba(255,255,255,0.10)';
      ctx.beginPath();
      ctx.moveTo(cx - radius, cy); ctx.lineTo(cx + radius, cy);
      ctx.stroke();

      // Mapping: Γ-plane point (gr, gi) → screen (cx + gr·radius, cy − gi·radius)
      const gToScreen = (gr: number, gi: number) => ({
        x: cx + gr * radius,
        y: cy - gi * radius,
      });

      // Constant-resistance circles: centre (r/(r+1), 0), radius 1/(r+1)
      const rValues = [0.2, 0.5, 1, 2, 5];
      ctx.strokeStyle = 'rgba(108,197,194,0.30)';
      ctx.lineWidth = 1;
      for (const r of rValues) {
        const ccg = r / (r + 1);
        const rcg = 1 / (r + 1);
        ctx.beginPath();
        ctx.arc(cx + ccg * radius, cy, rcg * radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Constant-reactance arcs: centre (1, 1/x), radius 1/|x|
      const xValues = [0.2, 0.5, 1, 2, 5];
      ctx.strokeStyle = 'rgba(255,107,42,0.28)';
      for (const x of xValues) {
        // Upper arc (positive x, inductive)
        const cxg = 1;
        const cyg_up = 1 / x;
        const rg = 1 / x;
        // Arc clipped to |Γ| ≤ 1: simpler to draw full circle and rely on
        // canvas clipping by drawing only where inside the unit disk.
        drawArcClipped(ctx, cx + cxg * radius, cy - cyg_up * radius, rg * radius, cx, cy, radius);
        // Lower arc (negative x, capacitive)
        drawArcClipped(ctx, cx + cxg * radius, cy + cyg_up * radius, rg * radius, cx, cy, radius);
      }
      // Centre cross (Γ = 0 — matched)
      ctx.fillStyle = 'rgba(160,158,149,0.7)';
      ctx.beginPath();
      ctx.arc(cx, cy, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('Γ = 0  (matched, Z = 50Ω)', cx + 4, cy + 4);

      // |Γ| = const circle (VSWR circle)
      ctx.strokeStyle = 'rgba(255,107,42,0.45)';
      ctx.setLineDash([3, 3]);
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.arc(cx, cy, Math.min(Gmag, 1) * radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Z_L marker
      const pZ = gToScreen(Gr, Gi);
      ctx.fillStyle = 'rgba(255,59,110,1)';
      ctx.beginPath();
      ctx.arc(pZ.x, pZ.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.9)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,59,110,0.95)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('Z_L', pZ.x + 8, pZ.y - 2);

      // Quarter-wave transform marker: Γ' = −Γ (180° rotation)
      if (showQwave) {
        const pZin = gToScreen(-Gr, -Gi);
        ctx.fillStyle = 'rgba(108,197,194,1)';
        ctx.beginPath();
        ctx.arc(pZin.x, pZin.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.9)';
        ctx.stroke();
        ctx.fillStyle = 'rgba(108,197,194,0.95)';
        ctx.fillText('Z_in (λ/4)', pZin.x + 8, pZin.y - 2);

        // Connect through origin
        ctx.strokeStyle = 'rgba(108,197,194,0.5)';
        ctx.setLineDash([2, 3]);
        ctx.beginPath();
        ctx.moveTo(pZ.x, pZ.y); ctx.lineTo(pZin.x, pZin.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Edge labels
      ctx.fillStyle = 'rgba(160,158,149,0.7)';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText('open  Γ=+1', cx + radius - 4, cy - 10);
      ctx.textAlign = 'left';
      ctx.fillText('short  Γ=−1', cx - radius + 4, cy - 10);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 13.4'}
      title="Smith chart — the impedance disk"
      question="Slide Z_L around. The marker tracks Γ on the unit disk; the dashed circle is VSWR."
      caption={<>
        The Smith chart is the unit disk of the reflection coefficient Γ = (Z<sub>L</sub> −
        Z<sub>0</sub>)/(Z<sub>L</sub> + Z<sub>0</sub>) on a Z<sub>0</sub> = 50 Ω system. Teal
        circles are loci of constant resistance r = R/Z<sub>0</sub>; orange arcs are constant
        reactance x = X/Z<sub>0</sub>. The centre is the matched load (Γ = 0, VSWR = 1); the rim
        is total reflection. Toggle "λ/4 transform" to see a quarter-wave line rotate the marker
        180° through the origin — the trick for matching real loads to real generators with a
        single piece of cable.
      </>}
    >
      <AutoResizeCanvas height={340} setup={setup} />
      <DemoControls>
        <MiniSlider label="R" value={R} min={1} max={500} step={1}
          format={v => v.toFixed(0) + ' Ω'} onChange={setR} />
        <MiniSlider label="X" value={X} min={-300} max={300} step={1}
          format={v => v.toFixed(0) + ' Ω'} onChange={setX} />
        <MiniToggle
          label={showQwave ? 'λ/4 transform: on' : 'λ/4 transform: off'}
          checked={showQwave}
          onChange={setShowQwave}
        />
        <MiniReadout label="|Γ|" value={Gmag.toFixed(3)} />
        <MiniReadout label="∠Γ" value={GangleDeg.toFixed(1)} unit="°" />
        <MiniReadout label="Re Γ" value={Gr.toFixed(3)} />
        <MiniReadout label="Im Γ" value={Gi.toFixed(3)} />
        <MiniReadout
          label="VSWR"
          value={isFinite(VSWR) ? VSWR.toFixed(2) : '∞'}
        />
        <MiniReadout
          label="Z_in (λ/4)"
          value={<>{Zin_r.toFixed(1)} {Zin_x >= 0 ? '+' : '−'} j{Math.abs(Zin_x).toFixed(1)}</>}
          unit="Ω"
        />
      </DemoControls>
    </Demo>
  );
}

/* Helper: draw a circle of radius cR centred at (ccx, ccy), but clipped to
 * the interior of the unit disk centred at (uCx, uCy) with radius uR. We
 * simply set a circular clip, draw, then restore. */
function drawArcClipped(
  ctx: CanvasRenderingContext2D,
  ccx: number, ccy: number, cR: number,
  uCx: number, uCy: number, uR: number,
) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(uCx, uCy, uR, 0, Math.PI * 2);
  ctx.clip();
  ctx.beginPath();
  ctx.arc(ccx, ccy, cR, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}
