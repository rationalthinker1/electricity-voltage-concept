/**
 * Demo D14.1 — Snell's law at a flat interface
 *
 * Horizontal interface, medium 1 (n₁) on top, medium 2 (n₂) on bottom.
 * Reader drags the incidence angle; the refracted ray bends per
 * n₁ sin θ₁ = n₂ sin θ₂. If the angle exceeds the critical angle
 * (only possible when n₁ > n₂), the demo shows total internal reflection
 * and reflects the ray back into medium 1.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { getCanvasColors } from '@/lib/canvasTheme';

interface Props { figure?: string }

export function SnellsLawDemo({ figure }: Props) {
  const [thetaDeg, setThetaDeg] = useState(30);
  const [n1, setN1] = useState(1.00);
  const [n2, setN2] = useState(1.50);

  const stateRef = useRef({ thetaDeg, n1, n2 });
  useEffect(() => { stateRef.current = { thetaDeg, n1, n2 }; }, [thetaDeg, n1, n2]);

  // Compute outputs for the readout panel
  const theta1 = (thetaDeg * Math.PI) / 180;
  const sinRatio = (n1 / n2) * Math.sin(theta1);
  const tir = Math.abs(sinRatio) > 1;
  const theta2 = tir ? NaN : Math.asin(sinRatio);
  const critDeg = n1 > n2 ? (Math.asin(n2 / n1) * 180) / Math.PI : NaN;

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w: W, h: H } = info;
    let raf = 0;
    function draw() {
      const { thetaDeg, n1, n2 } = stateRef.current;
      const th1 = (thetaDeg * Math.PI) / 180;
      const sr = (n1 / n2) * Math.sin(th1);
      const totalIntRefl = Math.abs(sr) > 1;
      const th2 = totalIntRefl ? 0 : Math.asin(sr);

      ctx.fillStyle = getCanvasColors().bg;
      ctx.fillRect(0, 0, W, H);

      const cx = W / 2;
      const cy = H / 2;

      // Shading for the two media — slight tints
      ctx.fillStyle = 'rgba(91,174,248,0.06)';   // medium 1: blue tint
      ctx.fillRect(0, 0, W, cy);
      ctx.fillStyle = 'rgba(108,197,194,0.10)'; // medium 2: teal tint
      ctx.fillRect(0, cy, W, H - cy);

      // Interface line
      ctx.strokeStyle = getCanvasColors().textDim;
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke();

      // Normal (dashed)
      ctx.setLineDash([4, 5]);
      ctx.strokeStyle = getCanvasColors().borderStrong;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx, 10); ctx.lineTo(cx, H - 10); ctx.stroke();
      ctx.setLineDash([]);

      const L = Math.min(W, H) * 0.42;

      // Incident ray: from upper-left toward interface point (cx, cy)
      const ix = cx - L * Math.sin(th1);
      const iy = cy - L * Math.cos(th1);
      drawRay(ctx, ix, iy, cx, cy, 'rgba(255,107,42,0.9)', 2.2);

      if (totalIntRefl) {
        // Reflected ray inside medium 1 (mirror about the normal)
        const rx = cx + L * Math.sin(th1);
        const ry = cy - L * Math.cos(th1);
        drawRay(ctx, cx, cy, rx, ry, 'rgba(255,59,110,0.9)', 2.2);
        ctx.fillStyle = getCanvasColors().pink;
        ctx.font = 'bold 12px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('TOTAL INTERNAL REFLECTION', cx, H - 16);
      } else {
        // Refracted ray in medium 2
        const tx = cx + L * Math.sin(th2);
        const ty = cy + L * Math.cos(th2);
        drawRay(ctx, cx, cy, tx, ty, 'rgba(108,197,194,0.95)', 2.2);
      }

      // Labels
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillStyle = getCanvasColors().textDim;
      ctx.textAlign = 'left';
      ctx.fillText(`n₁ = ${n1.toFixed(2)}`, 12, 18);
      ctx.fillText(`n₂ = ${n2.toFixed(2)}`, 12, H - 8);
      ctx.fillStyle = getCanvasColors().accent;
      ctx.fillText(`θ₁ = ${thetaDeg.toFixed(1)}°`, cx + 8, cy - 30);
      if (!totalIntRefl) {
        ctx.fillStyle = getCanvasColors().teal;
        ctx.fillText(`θ₂ = ${((th2 * 180) / Math.PI).toFixed(1)}°`, cx + 8, cy + 36);
      }

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 14.1'}
      title="Snell's law — a ray bends at an interface"
      question="When does total internal reflection take over?"
      caption={<>
        A ray hits a flat interface between media with refractive indices <strong>n₁</strong> (top)
        and <strong>n₂</strong> (bottom). The transmitted angle satisfies <strong>n₁ sin θ₁ = n₂ sin θ₂</strong>.
        When you go from a dense medium to a rare one and exceed the critical angle
        <strong> sin θ_c = n₂/n₁</strong>, the boundary stops transmitting and the ray reflects.
      </>}
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        <MiniSlider label="θ₁" value={thetaDeg} min={0} max={89} step={0.5}
          format={v => v.toFixed(1) + '°'} onChange={setThetaDeg} />
        <MiniSlider label="n₁" value={n1} min={1.0} max={2.5} step={0.01}
          format={v => v.toFixed(2)} onChange={setN1} />
        <MiniSlider label="n₂" value={n2} min={1.0} max={2.5} step={0.01}
          format={v => v.toFixed(2)} onChange={setN2} />
        <MiniReadout
          label={tir ? 'state' : 'θ₂'}
          value={tir ? 'TIR' : ((theta2 * 180) / Math.PI).toFixed(2)}
          unit={tir ? '' : '°'}
        />
        <MiniReadout
          label="critical θ_c"
          value={Number.isFinite(critDeg) ? critDeg.toFixed(2) : '—'}
          unit={Number.isFinite(critDeg) ? '°' : ''}
        />
      </DemoControls>
    </Demo>
  );
}

function drawRay(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number, x2: number, y2: number,
  color: string, width: number,
) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  // Arrowhead at (x2, y2)
  const dx = x2 - x1; const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 4) return;
  const ux = dx / len; const uy = dy / len;
  const px = -uy; const py = ux;
  const H = 7;
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - ux * H + px * 3.5, y2 - uy * H + py * 3.5);
  ctx.lineTo(x2 - ux * H - px * 3.5, y2 - uy * H - py * 3.5);
  ctx.closePath(); ctx.fill();
}
