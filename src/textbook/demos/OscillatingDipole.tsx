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
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { drawCharge } from '@/lib/canvasPrimitives';

interface Props { figure?: string }

export function OscillatingDipoleDemo({ figure }: Props) {
  // Angular frequency in "rad / simulation second". Wavelength readout below
  // is the visualisation's λ_px → labelled in pixels; the physical interpretation
  // is that λ shrinks as ω grows, exactly the way λ = c/f does in reality.
  const [omega, setOmega] = useState(2.4);

  // Simulation-frame speed of light, in px per simulation second. Kept fixed
  // so the slider only changes ω and λ falls out as c/f.
  const C_SIM = 110;            // px / s
  const f = omega / (2 * Math.PI);
  const lambdaPx = C_SIM / Math.max(1e-6, f);

  const stateRef = useRef({ omega });
  useEffect(() => { stateRef.current = { omega }; }, [omega]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w: W, h: H } = info;
    let raf = 0;
    const tStart = performance.now() / 1000;

    function draw() {
      const t = performance.now() / 1000 - tStart;
      const om = stateRef.current.omega;

      ctx.fillStyle = '#0d0d10';
      ctx.fillRect(0, 0, W, H);

      const cx = W / 2;
      const cy = H / 2;
      const dipoleHalf = 22;        // half-separation of the two charges, in px

      // ── Radiated E ripples
      // Far-field amplitude ~ sin²θ where θ is measured from the dipole axis (vertical).
      // For each pixel we compute r = distance to dipole centre, then drop a
      // sinusoid sin(k r − ω t). Bright on the equator, zero on the axis.
      const k = om / C_SIM;
      const img = ctx.createImageData(W, H);
      const data = img.data;
      const step = 2;               // sub-sample for speed
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
          const r8 = v > 0 ? 255 : 0x5b;
          const g8 = v > 0 ? 59 : 0xae;
          const b8 = v > 0 ? 110 : 0xf8;
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

      // ── Dipole oscillation: the two charges' vertical positions wobble
      const disp = Math.sin(om * t) * dipoleHalf * 0.5;
      const yPos = cy - dipoleHalf - disp;
      const yNeg = cy + dipoleHalf - disp;

      drawCharge(ctx, { x: cx, y: yPos }, {
        color: '#ff3b6e',
        glow: true,
        radius: 11,
        sign: '+',
        textColor: '#0a0a0b',
      });
      drawCharge(ctx, { x: cx, y: yNeg }, {
        color: '#5baef8',
        glow: true,
        radius: 11,
        sign: '−',
        textColor: '#0a0a0b',
      });

      // Axis indicator (dashed vertical line)
      ctx.setLineDash([4, 6]);
      ctx.strokeStyle = 'rgba(255,255,255,0.18)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx, 8); ctx.lineTo(cx, H - 8); ctx.stroke();
      ctx.setLineDash([]);

      // Labels: "axis" and "equator (max radiation)"
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(160,158,149,0.85)';
      ctx.textAlign = 'center';
      ctx.fillText('axis · zero radiation', cx, 18);
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(255,107,42,0.85)';
      ctx.fillText('equator · max radiation →', 14, cy + 4);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 7.4'}
      title="An oscillating dipole radiates"
      question="Where do the ripples go — and where do they not go?"
      caption={<>
        Two opposite charges wobbling along a vertical axis at frequency ω. The radiated
        wavefronts spread outward at the simulation's <em>c</em>, but their amplitude follows the
        far-field pattern <strong>sin²θ</strong> — strongest on the equator (perpendicular to the
        dipole axis), zero along the axis itself. Crank ω and watch the wavelength shrink as
        λ = c/f.
      </>}
      deeperLab={{ slug: 'poynting', label: 'See Poynting lab' }}
    >
      <AutoResizeCanvas height={320} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="ω"
          value={omega} min={0.6} max={8} step={0.05}
          format={v => v.toFixed(2) + ' rad/s'}
          onChange={setOmega}
        />
        <MiniReadout label="frequency f" value={f.toFixed(2)} unit="Hz" />
        <MiniReadout label="wavelength λ" value={lambdaPx.toFixed(0)} unit="px" />
      </DemoControls>
    </Demo>
  );
}
