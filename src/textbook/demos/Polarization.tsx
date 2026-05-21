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
import { useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import {
  Demo,
  DemoControls,
  EquationStrip,
  MiniReadout,
  MiniSlider,
} from '@/components/Demo';
import { InlineMath } from '@/components/Formula';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';
import { drawLabel } from '@/lib/canvasLayout';

interface Props {
  figure?: string;
}

export function PolarizationDemo({ figure }: Props) {
  const [phi, setPhi] = useState(0); // polarization angle, radians
  const [delta, setDelta] = useState(0); // y/z phase difference, radians

  const stateRef = useSimState({ phi, delta });
  const setup = useSimLoop(
    stateRef,
    ({ ctx, w: W, h: H, colors }, _state, _dt, simTime) => {
      const t = simTime;
      const { phi, delta } = stateRef.current;
      const om = 2.0;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, W, H);
      const cx = W / 2;
      const cy = H / 2;
      const R = Math.min(W, H) * 0.36;
      ctx.strokeStyle = colors.borderStrong;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 5]);
      ctx.beginPath();
      ctx.moveTo(cx - R, cy);
      ctx.lineTo(cx + R, cy);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy - R);
      ctx.lineTo(cx, cy + R);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = colors.textDim;
      drawLabel(ctx, { text: 'y', x: cx + R + 6, y: cy + 4, font: '10px "JetBrains Mono", monospace' });
      drawLabel(ctx, { text: 'z', x: cx, y: cy - R - 6, font: '10px "JetBrains Mono", monospace', align: 'center' });
      function eVec(time: number) {
        const yEy = Math.cos(phi) * Math.cos(om * time);
        const zEz = Math.sin(phi) * Math.cos(om * time - delta);
        return { yEy, zEz };
      }
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      const Nsteps = 80;
      for (let i = 0; i <= Nsteps; i++) {
        const tau = (i / Nsteps) * ((2 * Math.PI) / om);
        const e = eVec(tau);
        const px = cx + e.yEy * R;
        const py = cy - e.zEz * R;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = 0.75;
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      const TRAIL = 18;
      for (let i = 0; i <= TRAIL; i++) {
        const tau = t - (TRAIL - i) * 0.02;
        const e = eVec(tau);
        const px = cx + e.yEy * R;
        const py = cy - e.zEz * R;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      const cur = eVec(t);
      const px = cx + cur.yEy * R;
      const py = cy - cur.zEz * R;
      ctx.restore();
      ctx.strokeStyle = colors.pink;
      ctx.fillStyle = colors.pink;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(px, py);
      ctx.stroke();
      const dxA = px - cx,
        dyA = py - cy;
      const len = Math.sqrt(dxA * dxA + dyA * dyA);
      if (len > 6) {
        const ux = dxA / len,
          uy = dyA / len;
        const HEAD = 8;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px - ux * HEAD - uy * 3, py - uy * HEAD + ux * 3);
        ctx.lineTo(px - ux * HEAD + uy * 3, py - uy * HEAD - ux * 3);
        ctx.closePath();
        ctx.fill();
      }
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = colors.text;
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fill();
      let stateLabel = 'elliptical';
      const dAbs = Math.abs(Math.atan2(Math.sin(delta), Math.cos(delta)));
      if (
        Math.abs(Math.sin(phi)) < 0.05 ||
        Math.abs(Math.cos(phi)) < 0.05 ||
        dAbs < 0.05 ||
        Math.abs(dAbs - Math.PI) < 0.05
      ) {
        stateLabel = 'linear';
      } else if (
        Math.abs(dAbs - Math.PI / 2) < 0.05 &&
        Math.abs(Math.abs(phi) - Math.PI / 4) < 0.08
      ) {
        stateLabel = 'circular';
      }
      ctx.restore();
      drawLabel(ctx, { text: `polarization: ${stateLabel}`, x: 14, y: 22, color: colors.accent, size: 11, font: '11px "JetBrains Mono", monospace' });
      drawLabel(ctx, { text: 'view: looking down the propagation axis →', x: 14, y: 38, size: 11, font: '11px "JetBrains Mono", monospace' });
    },
    [],
  );

  return (
    <Demo
      figure={figure ?? 'Fig. 7.3'}
      title="Polarization"
      question="What direction does E point — and is it staying put?"
      caption={
        <>
          Looking down the propagation axis at the tip of <strong>E</strong>. With phase shift δ = 0
          the vector oscillates back and forth along a line (<em>linear</em> polarization). With δ =
          π/2 and φ = ±45° it sweeps out a circle (<em>circular</em>). Anything in between is
          <em> elliptical</em>. The wave still travels at c; only the direction of E's wobble
          changes.
        </>
      }
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="angle φ"
          value={phi}
          min={-Math.PI / 2}
          max={Math.PI / 2}
          step={0.01}
          format={(v) => ((v * 180) / Math.PI).toFixed(0) + '°'}
          onChange={setPhi}
        />
        <MiniSlider
          label="phase δ"
          value={delta}
          min={0}
          max={Math.PI}
          step={0.01}
          format={(v) => ((v * 180) / Math.PI).toFixed(0) + '°'}
          onChange={setDelta}
        />
        <MiniReadout label="δ" value={((delta * 180) / Math.PI).toFixed(0)} unit="°" />
        <MiniReadout label="φ" value={((phi * 180) / Math.PI).toFixed(0)} unit="°" />
      </DemoControls>
      <EquationStrip
        leftLabel="E-field (y)"
        left={
          <InlineMath
            tex={
              `E_{y} \\;=\\; \\cos\\varphi\\,\\cos(\\omega t) \\;=\\; ` +
              `\\cos(${((phi * 180) / Math.PI).toFixed(0)}^{\\circ})\\,\\cos(\\omega t)`
            }
          />
        }
        rightLabel="E-field (z)"
        right={
          <InlineMath
            tex={
              `E_{z} \\;=\\; \\sin\\varphi\\,\\cos(\\omega t - \\delta) \\;=\\; ` +
              `\\sin(${((phi * 180) / Math.PI).toFixed(0)}^{\\circ})\\,` +
              `\\cos(\\omega t - ${((delta * 180) / Math.PI).toFixed(0)}^{\\circ})`
            }
          />
        }
      />
    </Demo>
  );
}
