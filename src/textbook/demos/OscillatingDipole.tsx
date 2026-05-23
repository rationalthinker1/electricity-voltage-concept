/**
 * Demo D7.4 — Oscillating dipole radiation
 *
 * Two charges (one +, one −) on a vertical axis, separation modulated
 * sinusoidally at angular frequency ω. The charges radiate concentric
 * outgoing E ripples that propagate at the simulation's "c" — these are
 * just sin(k·r − ω·t) ripples, but their amplitude is weighted by the
 * radiation pattern sin²θ in the far field, so the ripples are bright
 * perpendicular to the dipole axis and fade to zero along it.
 *
 * Slider: ω (angular frequency, normalised). Readout: wavelength λ = c/f.
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
import { drawCharge } from '@/lib/canvasPrimitives';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';
import { drawLabel } from '@/lib/canvasLayout';

interface Props {
  figure: string;
}

function hexToRgb(hex: string) {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
}

export function OscillatingDipoleDemo({ figure }: Props) {
  // Angular frequency in "rad / simulation second". Wavelength readout below
  // is the visualisation's λ_px → labelled in pixels; the physical interpretation
  // is that λ shrinks as ω grows, exactly the way λ = c/f does in reality.
  const [omega, setOmega] = useState(2.4);

  // Simulation-frame speed of light, in px per simulation second. Kept fixed
  // so the slider only changes ω and λ falls out as c/f.
  const C_SIM = 110; // px / s
  const f = omega / (2 * Math.PI);
  const lambdaPx = C_SIM / Math.max(1e-6, f);

  const stateRef = useSimState({ omega });
  const setup = useSimLoop(
    stateRef,
    ({ ctx, w: W, h: H, colors }, _state, _dt, simTime) => {
      const t = simTime;
      const om = stateRef.current.omega;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, W, H);
      const cx = W / 2;
      const cy = H / 2;
      const dipoleHalf = 22;
      const k = om / C_SIM;
      const img = ctx.createImageData(W, H);
      const data = img.data;
      const step = 2;
      const pinkRGB = hexToRgb(colors.pink);
      const blueRGB = hexToRgb(colors.blue);
      for (let py = 0; py < H; py += step) {
        for (let px = 0; px < W; px += step) {
          const dx = px - cx;
          const dy = py - cy;
          const r = Math.sqrt(dx * dx + dy * dy);
          if (r < dipoleHalf + 4) continue;
          // θ measured from the vertical dipole axis (so along axis = 0, equator = π/2)
          const sinTheta = Math.abs(dx) / r;
          const pat = sinTheta * sinTheta;
          // 1/r far-field falloff for radiation, plus pattern, plus phase
          const amp = (pat / Math.sqrt(r)) * Math.sin(k * r - om * t);
          // Map to colour: +amp → pink, −amp → blue, balanced background
          const v = Math.max(-1, Math.min(1, amp * 3.4));
          const r8 = v > 0 ? pinkRGB.r : blueRGB.r;
          const g8 = v > 0 ? pinkRGB.g : blueRGB.g;
          const b8 = v > 0 ? pinkRGB.b : blueRGB.b;
          const alpha = Math.min(180, Math.abs(v) * 220);
          // Fill the step×step block
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
      const disp = Math.sin(om * t) * dipoleHalf * 0.5;
      const yPos = cy - dipoleHalf - disp;
      const yNeg = cy + dipoleHalf - disp;
      drawCharge(
        ctx,
        { x: cx, y: yPos },
        {
          color: colors.pink,
          glow: true,
          radius: 11,
          sign: '+',
          textColor: colors.bg,
        },
      );
      drawCharge(
        ctx,
        { x: cx, y: yNeg },
        {
          color: colors.blue,
          glow: true,
          radius: 11,
          sign: '−',
          textColor: colors.bg,
        },
      );
      ctx.setLineDash([4, 6]);
      ctx.strokeStyle = colors.borderStrong;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx, 8);
      ctx.lineTo(cx, H - 8);
      ctx.stroke();
      ctx.setLineDash([]);
      drawLabel(ctx, { text: 'axis · zero radiation', x: cx, y: 18, font: '10px "JetBrains Mono", monospace', align: 'center' });
      drawLabel(ctx, { text: 'equator · max radiation →', x: 14, y: cy + 4, color: colors.accent, font: '10px "JetBrains Mono", monospace' });
    },
    [],
  );

  return (
    <Demo
      figure={figure}
      title="An oscillating dipole radiates"
      question="Where do the ripples go — and where do they not go?"
      caption={
        <>
          Two opposite charges wobbling along a vertical axis at frequency ω. The radiated
          wavefronts spread outward at the simulation's <em>c</em>, but their amplitude follows the
          far-field pattern <strong>sin²θ</strong> — strongest on the equator (perpendicular to the
          dipole axis), zero along the axis itself. Crank ω and watch the wavelength shrink as λ =
          c/f.
        </>
      }
      deeperLab={{ slug: 'poynting', label: 'See Poynting lab' }}
    >
      <AutoResizeCanvas height={320} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="ω"
          value={omega}
          min={0.6}
          max={8}
          step={0.05}
          format={(v) => v.toFixed(2) + ' rad/s'}
          onChange={setOmega}
        />
        <MiniReadout label="frequency f" value={f.toFixed(2)} unit="Hz" />
        <MiniReadout label="wavelength λ" value={lambdaPx.toFixed(0)} unit="px" />
      </DemoControls>
      <EquationStrip
        leftLabel="Radiation pattern"
        left={<InlineMath tex={`I(\\theta) \\;\\propto\\; \\sin^{2}\\theta`} />}
        rightLabel="Wavelength"
        right={
          <InlineMath
            tex={
              `\\lambda \\;=\\; \\dfrac{c}{f} \\;=\\; ` +
              `\\dfrac{${C_SIM}}{${f.toFixed(2)}} \\;\\approx\\; ${lambdaPx.toFixed(0)}\\ \text{px}`
            }
          />
        }
      />
    </Demo>
  );
}
