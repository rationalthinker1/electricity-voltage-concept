/**
 * Demo D15.6 — Phased-array beam steering
 *
 * N equally-spaced isotropic elements along a line, spacing d, fed with a
 * progressive phase shift Δφ between adjacent elements. The array factor
 *   |AF(θ)| = |sin(N ψ/2) / (N sin(ψ/2))|,  ψ = (2π d/λ) sinθ − Δφ
 * steers the main beam to the direction sin θ_steer = (Δφ · λ) / (2π d).
 *
 * Reader sets N, d/λ, and Δφ (in degrees per element).
 */
import { useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, EquationStrip, MiniReadout, MiniSlider } from '@/components/Demo';
import { M } from '@/components/Formula';
import { drawLabel } from '@/lib/canvasLayout';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

interface Props {
  figure: string;
}

export function PhasedArraySteeringDemo({ figure }: Props) {
  const [N, setN] = useState(8);
  const [dOverLam, setDOverLam] = useState(0.5);
  const [phiDeg, setPhiDeg] = useState(60);

  const stateRef = useSimState({ N, dOverLam, phiDeg });
  // θ_steer = arcsin( (Δφ · λ) / (2π d) ) = arcsin( phi / (2π d/λ) )
  const phiRad = (phiDeg * Math.PI) / 180;
  const sinSteer = phiRad / (2 * Math.PI * dOverLam);
  const steerDeg = Math.abs(sinSteer) <= 1 ? (Math.asin(sinSteer) * 180) / Math.PI : NaN;

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w: W, h: H, colors }, _state, _dt, _simTime) => {
      const { N, dOverLam, phiDeg } = stateRef.current;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, W, H);
      const splitX = W * 0.32;
      const cyEl = H / 2;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = colors.textDim;
      ctx.textAlign = 'left';
      drawLabel(ctx, {
        text: `N = ${N} elements`,
        x: 12,
        y: 18,
        font: '10px "JetBrains Mono", monospace',
      });
      drawLabel(ctx, {
        text: `d = ${dOverLam.toFixed(2)}λ`,
        x: 12,
        y: 32,
        font: '10px "JetBrains Mono", monospace',
      });
      drawLabel(ctx, {
        text: `Δφ = ${phiDeg.toFixed(0)}°/elem`,
        x: 12,
        y: 46,
        font: '10px "JetBrains Mono", monospace',
      });
      const stripH = Math.min(H - 80, N * 18);
      const dy = stripH / Math.max(N - 1, 1);
      const x0 = splitX * 0.45;
      for (let k = 0; k < N; k++) {
        const yk = cyEl - stripH / 2 + k * dy;
        ctx.fillStyle = colors.teal;
        ctx.beginPath();
        ctx.arc(x0, yk, 4, 0, Math.PI * 2);
        ctx.fill();
        // Phase label
        ctx.fillStyle = colors.textDim;
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        const ph = ((k * phiDeg) % 360).toFixed(0);
        ctx.fillText(`${ph}°`, x0 + 8, yk + 3);
      }
      const cx = splitX + (W - splitX) / 2;
      const cy = H / 2;
      const R = Math.min((W - splitX) * 0.42, H * 0.42);
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      for (let f = 0.25; f <= 1.001; f += 0.25) {
        ctx.beginPath();
        ctx.arc(cx, cy, R * f, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.strokeStyle = colors.borderStrong;
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.moveTo(cx - R, cy);
      ctx.lineTo(cx + R, cy);
      ctx.stroke();
      ctx.setLineDash([]);
      const phiRad = (phiDeg * Math.PI) / 180;
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.8;
      ctx.save();
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = colors.accent;
      ctx.beginPath();
      const Ns = 360;
      for (let i = 0; i <= Ns; i++) {
        // Sweep θ from -90° to +90° (right hemisphere of array)
        const theta = -Math.PI / 2 + (i / Ns) * Math.PI;
        const psi = 2 * Math.PI * dOverLam * Math.sin(theta) - phiRad;
        let AF: number;
        if (Math.abs(Math.sin(psi / 2)) < 1e-9) {
          AF = 1;
        } else {
          AF = Math.abs(Math.sin((N * psi) / 2) / (N * Math.sin(psi / 2)));
        }
        const rr = AF * R;
        // Screen mapping: array along vertical, broadside to the right.
        // x = cx + rr * cos(theta), y = cy - rr * sin(theta) (theta=0 → right; +θ → up)
        const x = cx + rr * Math.cos(theta);
        const y = cy - rr * Math.sin(theta);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.lineTo(cx, cy);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      const sinSt = phiRad / (2 * Math.PI * dOverLam);
      if (Math.abs(sinSt) <= 1) {
        const thS = Math.asin(sinSt);
        ctx.strokeStyle = colors.teal;
        ctx.setLineDash([4, 5]);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + R * Math.cos(thS), cy - R * Math.sin(thS));
        ctx.stroke();
        ctx.setLineDash([]);
        drawLabel(ctx, {
          x: cx + R * Math.cos(thS) + 6,
          y: cy - R * Math.sin(thS),
          text: `θ_steer = ${((thS * 180) / Math.PI).toFixed(1)}°`,
          color: colors.teal,
        });
      } else {
        drawLabel(ctx, {
          x: cx,
          y: cy + R + 20,
          text: '|sin θ_steer| > 1 — grating lobe regime',
          color: colors.pink,
          align: 'center',
        });
      }
      ctx.restore();
      ctx.fillStyle = colors.textDim;
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      drawLabel(ctx, {
        text: 'broadside (θ=0)',
        x: cx + R + 12,
        y: cy + 4,
        size: 9,
        font: '9px "JetBrains Mono", monospace',
        align: 'center',
      });
      drawLabel(ctx, {
        text: 'θ = +90°',
        x: cx,
        y: cy - R - 6,
        size: 9,
        font: '9px "JetBrains Mono", monospace',
        align: 'center',
      });
      drawLabel(ctx, {
        text: 'θ = −90°',
        x: cx,
        y: cy + R + 14,
        size: 9,
        font: '9px "JetBrains Mono", monospace',
        align: 'center',
      });
    },
    [],
  );

  return (
    <Demo
      figure={figure}
      title="Phased array — steer the beam with phase, not gimbals"
      question="What phase shift between elements points the main beam to a given angle?"
      caption={
        <>
          N isotropic elements spaced <strong>d</strong> apart along a line, fed with a progressive
          phase shift <strong>Δφ</strong> between adjacent elements. The array factor steers its
          main lobe to{' '}
          <strong>
            sin θ<sub>steer</sub> = Δφ · λ / (2π d)
          </strong>
          . For d = λ/2 the steering range covers a full ±90° hemisphere; pushing d above λ/2
          introduces unwanted "grating lobes" on the other side of broadside.
        </>
      }
      deeperLab={{ slug: 'antenna-radiation', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="N"
          value={N}
          min={4}
          max={16}
          step={1}
          format={(v) => v.toFixed(0)}
          onChange={setN}
        />
        <MiniSlider
          label="d/λ"
          value={dOverLam}
          min={0.25}
          max={1.0}
          step={0.01}
          format={(v) => v.toFixed(2)}
          onChange={setDOverLam}
        />
        <MiniSlider
          label="Δφ"
          value={phiDeg}
          min={-180}
          max={180}
          step={1}
          format={(v) => v.toFixed(0) + '°'}
          onChange={setPhiDeg}
        />
        <MiniReadout
          label="θ_steer"
          value={Number.isFinite(steerDeg) ? steerDeg.toFixed(1) : '—'}
          unit={Number.isFinite(steerDeg) ? '°' : ''}
        />
      </DemoControls>
      <EquationStrip
        leftLabel="Beam-steering formula"
        left={<M tex="\sin\theta_{\text{steer}} = \Delta\varphi\,\lambda\,/\,(2\pi d)" />}
        rightLabel="Live steering angle"
        right={
          <M
            tex={
              Number.isFinite(steerDeg)
                ? `\\theta_{\\text{steer}} = ${steerDeg.toFixed(1)}^\\circ`
                : `|\\sin\\theta| = ${Math.abs(sinSteer).toFixed(2)} > 1\\;\\text{(grating lobe)}`
            }
          />
        }
      />
    </Demo>
  );
}
