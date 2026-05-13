/**
 * Demo D4.2 — Two parallel wires
 *
 * Two long wires shown end-on. Currents either both into-page (parallel)
 * or one in / one out (antiparallel). Force per unit length:
 *   F/L = μ₀ I₁ I₂ / (2π d)
 * Sliders for I₁, I₂, separation d. The wires gently animate toward or
 * away from each other in the canvas to convey attraction vs repulsion;
 * the readout shows |F/L| in N/m.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider, MiniToggle } from '@/components/Demo';
import { Num } from '@/components/Num';
import { PHYS } from '@/lib/physics';

interface Props { figure?: string }

export function TwoParallelWiresDemo({ figure }: Props) {
  const [I1, setI1] = useState(10);
  const [I2, setI2] = useState(10);
  const [dCm, setDCm] = useState(8);    // separation in cm (visual + physical)
  const [parallel, setParallel] = useState(true); // true: same direction (attract)

  const stateRef = useRef({ I1, I2, dCm, parallel });
  useEffect(() => { stateRef.current = { I1, I2, dCm, parallel }; }, [I1, I2, dCm, parallel]);

  const d_m = dCm * 1e-2;
  const F_per_L = (PHYS.mu_0 * I1 * I2) / (2 * Math.PI * d_m);
  const attractive = parallel;

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h } = info;
    let raf = 0;
    let t0 = performance.now();

    function draw() {
      const now = performance.now();
      const dt = (now - t0) / 1000;
      const { I1, I2, dCm, parallel } = stateRef.current;
      ctx.fillStyle = '#0d0d10';
      ctx.fillRect(0, 0, w, h);

      // Visual layout: wires drawn end-on, separated by dCm centered horizontally.
      // 1 px = 1 mm.
      const cy = h / 2;
      const cxMid = w / 2;

      // Subtle visual jitter — wires "lean" toward (attract) or away from
      // (repel) each other by a small amount that grows with |F/L|.
      const F = (PHYS.mu_0 * I1 * I2) / (2 * Math.PI * Math.max(dCm * 1e-2, 1e-4));
      const drift = Math.min(8, Math.log10(Math.abs(F) * 1e6 + 1) * 1.6);
      const sign = parallel ? -1 : +1; // attract → wires shift inward (sign=-1)
      const wiggle = Math.sin(dt * 2.2) * drift * 0.4;

      const cx1 = cxMid - (dCm * 5) - sign * (drift + wiggle);
      const cx2 = cxMid + (dCm * 5) + sign * (drift + wiggle);

      // Field circles around each wire (faint).
      function fieldCircles(cx: number, cy_: number, I: number, intoPage: boolean) {
        const radii = [25, 50, 80, 120];
        for (const R of radii) {
          if (R > Math.min(w, h) * 0.45) continue;
          const r_m = R / 1000;
          const B = (PHYS.mu_0 * Math.abs(I)) / (2 * Math.PI * r_m);
          const op = Math.min(0.35, 0.05 + Math.log10(B * 1e6 + 1) * 0.05);
          ctx.strokeStyle = `rgba(108,197,194,${op.toFixed(3)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(cx, cy_, R, 0, Math.PI * 2);
          ctx.stroke();
        }
        // direction marks at top/right
        const arrowDir = intoPage ? +1 : -1;
        const nArrows = 8;
        const R = 50;
        for (let i = 0; i < nArrows; i++) {
          const theta = (i / nArrows) * Math.PI * 2;
          const ax = cx + R * Math.cos(theta);
          const ay = cy_ + R * Math.sin(theta);
          const tx = -Math.sin(theta) * arrowDir;
          const ty =  Math.cos(theta) * arrowDir;
          const len = 6;
          ctx.strokeStyle = 'rgba(108,197,194,0.55)';
          ctx.fillStyle = ctx.strokeStyle;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(ax - tx * len * 0.5, ay - ty * len * 0.5);
          ctx.lineTo(ax + tx * len * 0.5, ay + ty * len * 0.5);
          ctx.stroke();
          const hx = ax + tx * len * 0.5;
          const hy = ay + ty * len * 0.5;
          const nx = -ty, ny = tx;
          ctx.beginPath();
          ctx.moveTo(hx, hy);
          ctx.lineTo(hx - tx * 3 + nx * 2.2, hy - ty * 3 + ny * 2.2);
          ctx.lineTo(hx - tx * 3 - nx * 2.2, hy - ty * 3 - ny * 2.2);
          ctx.closePath();
          ctx.fill();
        }
      }

      fieldCircles(cx1, cy, I1, true);
      fieldCircles(cx2, cy, I2, parallel);

      // Wire discs
      function drawWire(cx: number, cy_: number, intoPage: boolean, label: string, I: number) {
        const wireR = 11;
        const grd = ctx.createRadialGradient(cx, cy_, 0, cx, cy_, wireR * 3);
        grd.addColorStop(0, 'rgba(255,107,42,0.5)');
        grd.addColorStop(1, 'rgba(255,107,42,0)');
        ctx.fillStyle = grd;
        ctx.beginPath(); ctx.arc(cx, cy_, wireR * 3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#1c1c22';
        ctx.strokeStyle = '#ff6b2a';
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(cx, cy_, wireR, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

        ctx.strokeStyle = '#ff6b2a';
        ctx.fillStyle = '#ff6b2a';
        if (intoPage) {
          ctx.lineWidth = 1.8;
          const k = wireR * 0.55;
          ctx.beginPath();
          ctx.moveTo(cx - k, cy_ - k); ctx.lineTo(cx + k, cy_ + k);
          ctx.moveTo(cx + k, cy_ - k); ctx.lineTo(cx - k, cy_ + k);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(cx, cy_, wireR * 0.32, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = 'rgba(160,158,149,.9)';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(label, cx, cy_ - wireR - 10);
        ctx.fillText(`${I.toFixed(1)} A ${intoPage ? '⊗' : '⊙'}`, cx, cy_ + wireR + 22);
      }

      drawWire(cx1, cy, true, 'I₁', I1);
      drawWire(cx2, cy, parallel, 'I₂', I2);

      // Force arrows on each wire (along the line connecting them).
      // Attractive: arrows point inward; repulsive: outward.
      const Fmag = Math.abs(F);
      if (Fmag > 1e-12) {
        const arrowLen = Math.min(60, 18 + Math.log10(Fmag * 1e6 + 1) * 8);
        const dirSign = parallel ? +1 : -1; // +1 attractive (toward each other)
        ctx.strokeStyle = parallel ? 'rgba(255,107,42,0.95)' : 'rgba(255,59,110,0.95)';
        ctx.fillStyle = ctx.strokeStyle;
        ctx.lineWidth = 2;
        // Arrow on wire 1 (points right if attractive, left if repulsive)
        function drawArr(fromX: number, fromY: number, dxSign: number) {
          const startX = fromX + dxSign * 16;
          const tipX = fromX + dxSign * (16 + arrowLen);
          ctx.beginPath();
          ctx.moveTo(startX, fromY); ctx.lineTo(tipX, fromY); ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(tipX, fromY);
          ctx.lineTo(tipX - dxSign * 7, fromY - 4);
          ctx.lineTo(tipX - dxSign * 7, fromY + 4);
          ctx.closePath(); ctx.fill();
        }
        drawArr(cx1, cy, +dirSign);
        drawArr(cx2, cy, -dirSign);
      }

      // Separation label
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(255,255,255,.18)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx1, cy + 60);
      ctx.lineTo(cx2, cy + 60);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(160,158,149,.85)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`d = ${dCm.toFixed(1)} cm`, (cx1 + cx2) / 2, cy + 76);

      // Attract / repel label
      ctx.fillStyle = parallel ? 'rgba(255,107,42,0.9)' : 'rgba(255,59,110,0.9)';
      ctx.font = '11px "DM Sans", sans-serif';
      ctx.fillText(parallel ? 'parallel currents → attract' : 'antiparallel → repel', w / 2, 22);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 4.2'}
      title="Two wires that talk"
      question="Same direction or opposite — do the wires pull or push?"
      caption={<>
        Each wire makes a magnetic field; each carries a current that feels the other's field. Same
        direction → attract. Opposite → repel. The magnitude follows <em>F/L = μ₀ I₁ I₂ / (2π d)</em>.
        From 1948 to 2019 this was the operational definition of one ampere.
      </>}
      deeperLab={{ slug: 'ampere', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={320} setup={setup} />
      <DemoControls>
        <MiniToggle
          label={parallel ? 'parallel ⊗ ⊗' : 'antiparallel ⊗ ⊙'}
          checked={parallel}
          onChange={setParallel}
        />
        <MiniSlider
          label="I₁"
          value={I1} min={0.1} max={50} step={0.1}
          format={v => v.toFixed(1) + ' A'}
          onChange={setI1}
        />
        <MiniSlider
          label="I₂"
          value={I2} min={0.1} max={50} step={0.1}
          format={v => v.toFixed(1) + ' A'}
          onChange={setI2}
        />
        <MiniSlider
          label="d"
          value={dCm} min={1} max={20} step={0.1}
          format={v => v.toFixed(1) + ' cm'}
          onChange={setDCm}
        />
        <MiniReadout
          label={attractive ? 'F/L (attract)' : 'F/L (repel)'}
          value={<Num value={Math.abs(F_per_L)} digits={3} />}
          unit="N/m"
        />
      </DemoControls>
    </Demo>
  );
}
