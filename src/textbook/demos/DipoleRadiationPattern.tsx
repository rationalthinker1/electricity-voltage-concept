/**
 * Demo D15.1 — The dipole radiation pattern
 *
 * Polar plot of |E(θ)|² ∝ sin²θ — the far-field intensity pattern of a
 * short electric dipole. A vertical dipole sits at the origin; the
 * radiation "lobes" are strongest perpendicular to the axis (equator),
 * zero along the axis.
 *
 * A normalisation slider lets the reader exaggerate the lobes if desired.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { getCanvasColors } from '@/lib/canvasTheme';

interface Props { figure?: string }

export function DipoleRadiationPatternDemo({ figure }: Props) {
  // Probe angle (degrees from the dipole axis) — moves the radial readout marker
  const [probeDeg, setProbeDeg] = useState(60);

  const stateRef = useRef({ probeDeg });
  useEffect(() => { stateRef.current = { probeDeg }; }, [probeDeg]);

  // sin²θ readout at the probe angle
  const sinT = Math.sin((probeDeg * Math.PI) / 180);
  const intensity = sinT * sinT;

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w: W, h: H } = info;
    let raf = 0;
    function draw() {
      const { probeDeg } = stateRef.current;
      ctx.fillStyle = getCanvasColors().bg;
      ctx.fillRect(0, 0, W, H);

      const cx = W / 2;
      const cy = H / 2;
      const R = Math.min(W, H) * 0.42;

      // Concentric reference circles
      ctx.strokeStyle = getCanvasColors().border;
      ctx.lineWidth = 1;
      for (let f = 0.25; f <= 1.001; f += 0.25) {
        ctx.beginPath(); ctx.arc(cx, cy, R * f, 0, Math.PI * 2); ctx.stroke();
      }

      // Axis (vertical dashed) — the dipole axis
      ctx.setLineDash([4, 5]);
      ctx.strokeStyle = getCanvasColors().borderStrong;
      ctx.beginPath(); ctx.moveTo(cx, cy - R - 6); ctx.lineTo(cx, cy + R + 6); ctx.stroke();
      ctx.setLineDash([]);

      // Radial spokes every 30°
      ctx.strokeStyle = getCanvasColors().border;
      for (let deg = 0; deg < 360; deg += 30) {
        const a = (deg * Math.PI) / 180;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + R * Math.cos(a), cy + R * Math.sin(a));
        ctx.stroke();
      }

      // Pattern curve: r(θ) = sin²θ where θ measured from the vertical axis
      ctx.strokeStyle = getCanvasColors().accent;
      ctx.lineWidth = 2;
      ctx.fillStyle = 'rgba(255,107,42,0.15)';
      ctx.beginPath();
      const N = 360;
      for (let i = 0; i <= N; i++) {
        const phi = (i / N) * 2 * Math.PI; // sweep around screen
        // Angle from axis (vertical = 0 or π)
        const theta = Math.acos(Math.cos(phi)); // 0 to π
        const r = R * Math.sin(theta) ** 2;
        // Convert (phi) → screen XY; phi=0 → up; phi=π/2 → right; etc.
        const x = cx + r * Math.sin(phi);
        const y = cy - r * Math.cos(phi);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Probe direction — line from origin to the point on the curve at probeDeg
      const th = (probeDeg * Math.PI) / 180;
      const rprobe = R * Math.sin(th) ** 2;
      const pxR = cx + rprobe * Math.sin(th);
      const pyR = cy - rprobe * Math.cos(th);
      ctx.strokeStyle = getCanvasColors().teal;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + R * Math.sin(th), cy - R * Math.cos(th));
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = getCanvasColors().teal;
      ctx.beginPath(); ctx.arc(pxR, pyR, 4, 0, Math.PI * 2); ctx.fill();

      // Dipole symbol — two charges on the axis
      ctx.fillStyle = getCanvasColors().pink;
      ctx.beginPath(); ctx.arc(cx, cy - 8, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = getCanvasColors().blue;
      ctx.beginPath(); ctx.arc(cx, cy + 8, 5, 0, Math.PI * 2); ctx.fill();

      // Labels
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = getCanvasColors().textDim;
      ctx.textAlign = 'center';
      ctx.fillText('axis · 0', cx, cy - R - 12);
      ctx.fillText('axis · π', cx, cy + R + 18);
      ctx.textAlign = 'left';
      ctx.fillText('equator', cx + R + 4, cy + 4);
      ctx.fillText('|E|² ∝ sin²θ', 12, 18);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 15.1'}
      title="The dipole pattern — sin²θ"
      question="In which direction does a dipole radiate strongest?"
      caption={<>
        Polar plot of the far-field radiated intensity for a short electric dipole oriented along
        the vertical axis. Strongest perpendicular to the axis ("broadside"), zero along the axis
        itself. Around it, the 3D pattern is the familiar fat donut. Slide the probe angle to read
        off the relative intensity at any θ.
      </>}
    >
      <AutoResizeCanvas height={320} setup={setup} />
      <DemoControls>
        <MiniSlider label="θ" value={probeDeg} min={0} max={180} step={1}
          format={v => v.toFixed(0) + '°'} onChange={setProbeDeg} />
        <MiniReadout label="sin²θ" value={intensity.toFixed(3)} />
      </DemoControls>
    </Demo>
  );
}
