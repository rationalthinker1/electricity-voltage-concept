/**
 * Demo D7.3 — Polarization
 *
 * Same plane wave as the PlaneWave demo, but here we look down the
 * propagation axis (the wave is coming toward you). The E vector traces a
 * curve in the transverse (y, z) plane. Sliders:
 *   - polarization angle φ  (linear-polarization direction)
 *   - phase shift δ between the y-component and z-component of E
 *
 * δ = 0   → linear polarization at angle φ
 * δ = π/2 → circular polarization (sense of rotation depends on sign of φ)
 * other   → elliptical polarization
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { getCanvasColors } from '@/lib/canvasTheme';

interface Props { figure?: string }

export function PolarizationDemo({ figure }: Props) {
  const [phi, setPhi] = useState(0);        // polarization angle, radians
  const [delta, setDelta] = useState(0);    // y/z phase difference, radians

  const stateRef = useRef({ phi, delta });
  useEffect(() => { stateRef.current = { phi, delta }; }, [phi, delta]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w: W, h: H } = info;
    let raf = 0;
    const tStart = performance.now() / 1000;

    function draw() {
      const t = performance.now() / 1000 - tStart;
      const { phi, delta } = stateRef.current;
      const om = 2.0;

      ctx.fillStyle = getCanvasColors().bg;
      ctx.fillRect(0, 0, W, H);

      const cx = W / 2;
      const cy = H / 2;
      const R = Math.min(W, H) * 0.36;

      // Axes (y horizontal, z vertical — we're looking down -x)
      ctx.strokeStyle = getCanvasColors().borderStrong;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 5]);
      ctx.beginPath(); ctx.moveTo(cx - R, cy); ctx.lineTo(cx + R, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy - R); ctx.lineTo(cx, cy + R); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = getCanvasColors().textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('y', cx + R + 6, cy + 4);
      ctx.textAlign = 'center';
      ctx.fillText('z', cx, cy - R - 6);

      // The traced E vector. Decompose along (y, z) using (φ, δ):
      //   E_y(t) =  cos(φ) · cos(ω t)
      //   E_z(t) =  sin(φ) · cos(ω t − δ)
      // (this is the standard Jones-vector parameterisation; for δ=0 it reduces
      //  to a vector of unit length along angle φ, oscillating linearly.)
      function eVec(time: number) {
        const yEy = Math.cos(phi) * Math.cos(om * time);
        const zEz = Math.sin(phi) * Math.cos(om * time - delta);
        return { yEy, zEz };
      }

      // Trace the locus of E over one period (the polarization ellipse)
      ctx.strokeStyle = 'rgba(255,107,42,0.35)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      const Nsteps = 80;
      for (let i = 0; i <= Nsteps; i++) {
        const tau = (i / Nsteps) * (2 * Math.PI / om);
        const e = eVec(tau);
        const px = cx + e.yEy * R;
        const py = cy - e.zEz * R;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Trailing motion path: last quarter-period
      ctx.strokeStyle = 'rgba(255,107,42,0.75)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      const TRAIL = 18;
      for (let i = 0; i <= TRAIL; i++) {
        const tau = t - (TRAIL - i) * 0.02;
        const e = eVec(tau);
        const px = cx + e.yEy * R;
        const py = cy - e.zEz * R;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Current E vector
      const cur = eVec(t);
      const px = cx + cur.yEy * R;
      const py = cy - cur.zEz * R;
      ctx.strokeStyle = getCanvasColors().pink;
      ctx.fillStyle = getCanvasColors().pink;
      ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke();
      // Arrowhead
      const dxA = px - cx, dyA = py - cy;
      const len = Math.sqrt(dxA * dxA + dyA * dyA);
      if (len > 6) {
        const ux = dxA / len, uy = dyA / len;
        const HEAD = 8;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px - ux * HEAD - uy * 3, py - uy * HEAD + ux * 3);
        ctx.lineTo(px - ux * HEAD + uy * 3, py - uy * HEAD - ux * 3);
        ctx.closePath(); ctx.fill();
      }

      // Centre dot (the propagation axis seen end-on)
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2); ctx.fill();

      // Label: state of polarization
      let stateLabel = 'elliptical';
      const dAbs = Math.abs(Math.atan2(Math.sin(delta), Math.cos(delta)));    // [0, π]
      if (Math.abs(Math.sin(phi)) < 0.05 || Math.abs(Math.cos(phi)) < 0.05 || dAbs < 0.05 || Math.abs(dAbs - Math.PI) < 0.05) {
        stateLabel = 'linear';
      } else if (Math.abs(dAbs - Math.PI / 2) < 0.05 && Math.abs(Math.abs(phi) - Math.PI / 4) < 0.08) {
        stateLabel = 'circular';
      }
      ctx.fillStyle = getCanvasColors().accent;
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`polarization: ${stateLabel}`, 14, 22);
      ctx.fillStyle = getCanvasColors().textDim;
      ctx.fillText('view: looking down the propagation axis →', 14, 38);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 7.3'}
      title="Polarization"
      question="What direction does E point — and is it staying put?"
      caption={<>
        Looking down the propagation axis at the tip of <strong>E</strong>. With phase shift δ = 0
        the vector oscillates back and forth along a line (<em>linear</em> polarization). With δ = π/2
        and φ = ±45° it sweeps out a circle (<em>circular</em>). Anything in between is
        <em> elliptical</em>. The wave still travels at c; only the direction of E's wobble changes.
      </>}
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="angle φ"
          value={phi} min={-Math.PI / 2} max={Math.PI / 2} step={0.01}
          format={v => ((v * 180) / Math.PI).toFixed(0) + '°'}
          onChange={setPhi}
        />
        <MiniSlider
          label="phase δ"
          value={delta} min={0} max={Math.PI} step={0.01}
          format={v => ((v * 180) / Math.PI).toFixed(0) + '°'}
          onChange={setDelta}
        />
        <MiniReadout label="δ" value={((delta * 180) / Math.PI).toFixed(0)} unit="°" />
        <MiniReadout label="φ" value={((phi * 180) / Math.PI).toFixed(0)} unit="°" />
      </DemoControls>
    </Demo>
  );
}
