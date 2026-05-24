/**
 * Demo D15.5 — Near-field / far-field transition
 *
 * A short dipole at the origin: visualize where the field structure
 * transitions from the reactive near-field (∝ 1/r³, no net energy flow)
 * to the radiative far-field (∝ 1/r, energy flux outward).
 *
 * Slider for ω, which sets λ; the transition zone is around r ~ λ/(2π).
 */
import { useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, EquationStrip, MiniReadout, MiniSlider } from '@/components/Demo';
import { M } from '@/components/Formula';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';
import { drawLabel } from '@/lib/canvasLayout';

interface Props {
  figure: string;
}

export function NearFarFieldTransitionDemo({ figure }: Props) {
  // Visual ω in rad/sim-sec — sets the "wavelength" in pixel space
  const [omega, setOmega] = useState(2.5);
  const C_SIM = 110;
  const lamPx = (2 * Math.PI * C_SIM) / omega;

  const stateRef = useSimState({ omega });
  const setup = useSimLoop(
    stateRef,
    ({ ctx, w: W, h: H, colors }, _state, _dt, simTime) => {
      const t = simTime;
      const om = stateRef.current.omega;
      const k = om / C_SIM;
      const lam = (2 * Math.PI) / k;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, W, H);
      const cx = W / 2;
      const cy = H / 2;
      const rNF = lam / (2 * Math.PI);
      ctx.save();
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = colors.pink;
      ctx.beginPath();
      ctx.arc(cx, cy, rNF, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = 0.45;
      ctx.strokeStyle = colors.pink;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.arc(cx, cy, rNF, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      const rFF = 2 * lam;
      if (rFF < Math.min(W, H) / 2) {
        ctx.strokeStyle = colors.teal;
        ctx.setLineDash([3, 4]);
        ctx.beginPath();
        ctx.arc(cx, cy, rFF, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      const step = 3;
      const img = ctx.createImageData(W, H);
      const data = img.data;
      for (let py = 0; py < H; py += step) {
        for (let px = 0; px < W; px += step) {
          const dx = px - cx;
          const dy = py - cy;
          const r = Math.sqrt(dx * dx + dy * dy);
          if (r < 8) continue;
          const sinTheta = Math.abs(dx) / r;
          // Near-field: dipole potential ∝ cos θ / r² * cos(ωt). Sign from cos θ.
          const cosTheta = dy / r;
          const near = (1 / (r * r)) * cosTheta * Math.cos(om * t);
          // Far-field: sin θ component × sin(kr − ωt), 1/r
          const far = (1 / r) * sinTheta * Math.sin(k * r - om * t);
          // Weighted blend: near dominates inside rNF, far dominates outside
          const wNear = Math.exp(-k * r);
          const v = wNear * 80 * near + (1 - wNear) * 60 * far;
          const vClamped = Math.max(-1, Math.min(1, v));
          const r8 = vClamped > 0 ? 255 : 0x5b;
          const g8 = vClamped > 0 ? 59 : 0xae;
          const b8 = vClamped > 0 ? 110 : 0xf8;
          const alpha = Math.min(160, Math.abs(vClamped) * 220);
          for (let oy = 0; oy < step && py + oy < H; oy++) {
            for (let ox = 0; ox < step && px + ox < W; ox++) {
              const idx = ((py + oy) * W + (px + ox)) * 4;
              data[idx] = r8;
              data[idx + 1] = g8;
              data[idx + 2] = b8;
              data[idx + 3] = alpha;
            }
          }
        }
      }
      ctx.putImageData(img, 0, 0);
      ctx.restore();
      ctx.fillStyle = colors.pink;
      ctx.beginPath();
      ctx.arc(cx, cy - 6, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = colors.blue;
      ctx.beginPath();
      ctx.arc(cx, cy + 6, 4, 0, Math.PI * 2);
      ctx.fill();
      drawLabel(ctx, {
        text: `near-field r ≲ λ/2π = ${rNF.toFixed(0)} px`,
        x: 12,
        y: 18,
        color: colors.pink,
        font: '10px "JetBrains Mono", monospace',
      });
      drawLabel(ctx, {
        text: `far-field r ≫ λ/2π`,
        x: 12,
        y: 32,
        color: colors.teal,
        font: '10px "JetBrains Mono", monospace',
      });
      drawLabel(ctx, {
        text: `λ = ${lam.toFixed(0)} px`,
        x: 12,
        y: 46,
        font: '10px "JetBrains Mono", monospace',
      });
    },
    [],
  );

  return (
    <Demo
      figure={figure}
      title="Near field vs far field"
      question="Where does the field stop sloshing back and start propagating?"
      caption={
        <>
          Close to the dipole (inside the pink ring at <strong>r ≈ λ/2π</strong>), the field is
          dominated by reactive 1/r³ near-zone terms that oscillate in place — no net energy flows
          outward. Past the transition (teal ring at 2λ), only the 1/r radiative term survives, and
          the field becomes a true outgoing wave carrying Poynting flux to infinity.
        </>
      }
      deeperLab={{ slug: 'antenna-radiation', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={320} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="ω"
          value={omega}
          min={0.8}
          max={6}
          step={0.05}
          format={(v) => v.toFixed(2) + ' rad/s'}
          onChange={setOmega}
        />
        <MiniReadout label="λ" value={lamPx.toFixed(0)} unit="px" />
        <MiniReadout label="λ/2π" value={(lamPx / (2 * Math.PI)).toFixed(1)} unit="px" />
      </DemoControls>
      <EquationStrip
        leftLabel="Near/far-field boundary"
        left={<M tex="r_{\text{NF}} \approx \lambda\,/\,(2\pi)" />}
        rightLabel="In this view"
        right={
          <M
            tex={`\\lambda = ${lamPx.toFixed(0)}\\,\\text{px};\\quad r_{\\text{NF}} \\approx ${(lamPx / (2 * Math.PI)).toFixed(1)}\\,\\text{px}`}
          />
        }
      />
    </Demo>
  );
}
