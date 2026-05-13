/**
 * Demo D14.3 — Brewster's angle
 *
 * Plot R_s and R_p (Fresnel reflection coefficients, intensity) vs. angle
 * of incidence. R_p dips to zero at the Brewster angle θ_B = arctan(n₂/n₁);
 * R_s rises monotonically.
 *
 * Slider: n₂ (n₁ fixed at 1.0 — air). Vertical marker at θ_B with the
 * exact value displayed.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';

interface Props { figure?: string }

export function BrewsterAngleDemo({ figure }: Props) {
  const [n2, setN2] = useState(1.50);
  const n1 = 1.00;

  const stateRef = useRef({ n1, n2 });
  useEffect(() => { stateRef.current = { n1, n2 }; }, [n1, n2]);

  const brewsterDeg = (Math.atan(n2 / n1) * 180) / Math.PI;

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w: W, h: H } = info;
    let raf = 0;
    function draw() {
      const { n1, n2 } = stateRef.current;
      ctx.fillStyle = '#0d0d10';
      ctx.fillRect(0, 0, W, H);

      // Plot area
      const padL = 50, padR = 18, padT = 24, padB = 36;
      const x0 = padL, x1 = W - padR;
      const y0 = H - padB, y1 = padT;
      const plotW = x1 - x0;
      const plotH = y0 - y1;

      // Axes
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x0, y0); ctx.lineTo(x1, y0); // x-axis
      ctx.moveTo(x0, y0); ctx.lineTo(x0, y1); // y-axis
      ctx.stroke();
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(160,158,149,0.85)';
      ctx.textAlign = 'center';
      for (let d = 0; d <= 90; d += 15) {
        const x = x0 + (d / 90) * plotW;
        ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y0 + 3); ctx.stroke();
        ctx.fillText(String(d), x, y0 + 14);
      }
      ctx.fillText('angle of incidence θ (°)', (x0 + x1) / 2, H - 4);
      ctx.textAlign = 'right';
      for (let v = 0; v <= 1.01; v += 0.25) {
        const y = y0 - v * plotH;
        ctx.beginPath(); ctx.moveTo(x0 - 3, y); ctx.lineTo(x0, y); ctx.stroke();
        ctx.fillText(v.toFixed(2), x0 - 6, y + 3);
      }
      ctx.save();
      ctx.translate(14, (y0 + y1) / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.fillText('reflectance R', 0, 0);
      ctx.restore();

      // Compute Fresnel R_s and R_p at every angle, plot both curves
      function fresnel(thDeg: number) {
        const th = (thDeg * Math.PI) / 180;
        const cos1 = Math.cos(th);
        const sin1 = Math.sin(th);
        const sin2sq = ((n1 / n2) * sin1) ** 2;
        if (sin2sq > 1) return { Rs: 1, Rp: 1 }; // TIR
        const cos2 = Math.sqrt(1 - sin2sq);
        const rs = (n1 * cos1 - n2 * cos2) / (n1 * cos1 + n2 * cos2);
        const rp = (n2 * cos1 - n1 * cos2) / (n2 * cos1 + n1 * cos2);
        return { Rs: rs * rs, Rp: rp * rp };
      }

      // R_s curve (pink)
      ctx.strokeStyle = 'rgba(255,59,110,0.95)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i <= 360; i++) {
        const d = (i / 360) * 89.5;
        const { Rs } = fresnel(d);
        const x = x0 + (d / 90) * plotW;
        const y = y0 - Rs * plotH;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // R_p curve (teal)
      ctx.strokeStyle = 'rgba(108,197,194,0.95)';
      ctx.beginPath();
      for (let i = 0; i <= 360; i++) {
        const d = (i / 360) * 89.5;
        const { Rp } = fresnel(d);
        const x = x0 + (d / 90) * plotW;
        const y = y0 - Rp * plotH;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Brewster marker
      const brDeg = (Math.atan(n2 / n1) * 180) / Math.PI;
      const bx = x0 + (brDeg / 90) * plotW;
      ctx.setLineDash([3, 4]);
      ctx.strokeStyle = 'rgba(255,107,42,0.85)';
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(bx, y0); ctx.lineTo(bx, y1); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(255,107,42,0.95)';
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`θ_B = ${brDeg.toFixed(2)}°`, bx, y1 - 4);

      // Legend
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillStyle = '#ff3b6e';
      ctx.textAlign = 'left';
      ctx.fillText('R_s · ⊥ to plane', x1 - 130, y1 + 14);
      ctx.fillStyle = '#6cc5c2';
      ctx.fillText('R_p · ∥ to plane', x1 - 130, y1 + 28);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 14.3'}
      title="Brewster's angle — where R_p falls to zero"
      question="What's special about the angle where reflected light is fully polarised?"
      caption={<>
        Fresnel reflectance for the two polarisations: <strong>R_s</strong> (electric field
        perpendicular to the plane of incidence) and <strong>R_p</strong> (parallel). At
        <strong> θ_B = arctan(n₂/n₁)</strong>, R_p drops to <em>zero</em> — the reflected beam is
        100% s-polarised. For glass (n ≈ 1.5) in air this lands at about 56°. Polaroid sunglasses
        use this to kill horizontal glare from wet roads.
      </>}
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        <MiniSlider label="n₂" value={n2} min={1.0} max={2.5} step={0.01}
          format={v => v.toFixed(2)} onChange={setN2} />
        <MiniReadout label="θ_B" value={brewsterDeg.toFixed(2)} unit="°" />
      </DemoControls>
    </Demo>
  );
}
