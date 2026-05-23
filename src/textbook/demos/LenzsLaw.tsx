/**
 * Demo D5.2 — Lenz's law
 *
 * A loop of wire seen face-on. A bar magnet floats above with N pole pointing
 * down at the loop. Slider controls the magnet's distance. Closer ⇒ flux
 * increases (downward through the loop) ⇒ induced current circulates to
 * oppose the change (creates an upward induced B inside the loop). Pull the
 * magnet away ⇒ flux decreases ⇒ induced current reverses to maintain it
 * (now points downward through the loop, attracting the magnet back).
 *
 * The "rate of change" is computed from changes in the slider value over real
 * time, so the lamp is dark when you stop moving.
 */
import { useEffect, useRef, useState } from 'react';
import { drawLabel } from '@/lib/canvasLayout';
import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, EquationStrip, MiniReadout, MiniSlider } from '@/components/Demo';
import { InlineMath } from '@/components/Formula';
import { withAlpha } from '@/lib/canvasTheme';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

interface Props {
  figure: string;
}

interface LenzContext {
  lastD: number;
  smoothedRate: number;
}

export function LenzsLawDemo({ figure }: Props) {
  // Distance from loop, in arbitrary "cm" units (1 = touching loop, large = far)
  const [d, setD] = useState(8);

  const stateRef = useSimState({ d });

  // Direction sign: +1 = magnet approaching (induced current opposes; CCW from above), −1 = retreating (CW)
  const [direction, setDirection] = useState<0 | 1 | -1>(0);
  const [rate, setRate] = useState(0);
  const dirRef = useRef<{ dir: 0 | 1 | -1; rate: number }>({ dir: 0, rate: 0 });
  useEffect(() => {
    const id = window.setInterval(() => {
      setDirection(dirRef.current.dir);
      setRate(dirRef.current.rate);
    }, 100);
    return () => window.clearInterval(id);
  }, []);

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, colors }, state, dt, _simTime, c: LenzContext) => {
      const { d } = state;
      const safeDt = dt <= 0 ? 1e-3 : dt;
      const dD = d - c.lastD; // + = moving away, − = approaching
      c.lastD = d;
      // raw rate of change of flux ∝ -dD/dt (closer = more flux)
      const rawRate = -dD / safeDt;
      // smooth toward 0 if user holds still, decay quickly
      c.smoothedRate = c.smoothedRate * 0.5 + rawRate * 0.5;
      if (Math.abs(c.smoothedRate) < 0.01) c.smoothedRate = 0;
      const smoothedRate = c.smoothedRate;
      const dir: 0 | 1 | -1 = smoothedRate > 0.05 ? 1 : smoothedRate < -0.05 ? -1 : 0;
      dirRef.current = { dir, rate: smoothedRate };

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h * 0.62;
      const loopR = Math.min(w * 0.18, 90);

      // Draw loop (face-on: an ellipse with strong perspective)
      const loopRy = loopR * 0.32;
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(cx, cy, loopR, loopRy, 0, 0, Math.PI * 2);
      ctx.stroke();
      // small highlight stroke
      ctx.strokeStyle = colors.accentSoft;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(cx, cy, loopR + 4, loopRy + 1.5, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Magnet — floating above the loop. Distance d (arbitrary units 1..15)
      // maps to vertical pixels above loop center.
      const magY = cy - 50 - d * 14;
      const magW = 60,
        magH = 24;
      // S on top, N on bottom (so N points at loop)
      ctx.fillStyle = colors.blue;
      ctx.fillRect(cx - magW / 2, magY - magH / 2, magW, magH / 2);
      ctx.fillStyle = colors.pink;
      ctx.fillRect(cx - magW / 2, magY, magW, magH / 2);
      ctx.save();
      ctx.globalAlpha = 0.2;
      ctx.strokeStyle = colors.text;
      ctx.lineWidth = 1;
      ctx.strokeRect(cx - magW / 2, magY - magH / 2, magW, magH);
      ctx.restore();
      ctx.fillStyle = colors.bg;
      drawLabel(ctx, { text: 'S', x: cx, y: magY - magH / 4, color: colors.bg, weight: 'bold', size: 11, font: '11px "JetBrains Mono"', align: 'center', baseline: 'middle' });
      drawLabel(ctx, { text: 'N', x: cx, y: magY + magH / 4, color: colors.bg, weight: 'bold', size: 11, font: '11px "JetBrains Mono"', align: 'center', baseline: 'middle' });

      // Magnet's own B-field arrow — pink, pointing down toward loop
      ctx.fillStyle = colors.pink;
      ctx.lineWidth = 1.4;
      const arrowFromY = magY + magH / 2 + 6;
      const arrowToY = cy - loopRy - 8;
      ctx.save();
      ctx.globalAlpha = 0.6;
      ctx.strokeStyle = colors.pink;
      ctx.beginPath();
      ctx.moveTo(cx, arrowFromY);
      ctx.lineTo(cx, arrowToY);
      ctx.stroke();
      ctx.restore();
      ctx.beginPath();
      ctx.moveTo(cx, arrowToY);
      ctx.lineTo(cx - 5, arrowToY - 7);
      ctx.lineTo(cx + 5, arrowToY - 7);
      ctx.closePath();
      ctx.fill();
      drawLabel(ctx, { text: 'B (magnet)', x: cx + 10, y: (arrowFromY + arrowToY) / 2, color: colors.pink, font: '10px "JetBrains Mono", monospace', baseline: 'middle' });

      // Induced-B arrow (teal) inside the loop. dir = +1 (approaching) → B_ind UP (out of loop, opposing).
      // dir = −1 (retreating) → B_ind DOWN (into loop, supporting fading flux).
      if (dir !== 0) {
        const tealAlpha = Math.min(0.9, 0.35 + Math.abs(smoothedRate) * 0.5);
        const tealStr = withAlpha(colors.teal, tealAlpha);
        ctx.strokeStyle = tealStr;
        ctx.fillStyle = tealStr;
        ctx.lineWidth = 1.8;
        if (dir > 0) {
          // arrow inside loop pointing UP (out of plane toward viewer = up-axis)
          ctx.beginPath();
          ctx.moveTo(cx, cy + 4);
          ctx.lineTo(cx, cy - 28);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(cx, cy - 28);
          ctx.lineTo(cx - 5, cy - 22);
          ctx.lineTo(cx + 5, cy - 22);
          ctx.closePath();
          ctx.fill();
        } else {
          // arrow inside loop pointing DOWN
          ctx.beginPath();
          ctx.moveTo(cx, cy - 4);
          ctx.lineTo(cx, cy + 28);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(cx, cy + 28);
          ctx.lineTo(cx - 5, cy + 22);
          ctx.lineTo(cx + 5, cy + 22);
          ctx.closePath();
          ctx.fill();
        }
        drawLabel(ctx, {
          x: cx + 12,
          y: cy,
          text: 'B (induced)',
          color: tealStr,
        });
      }

      // Induced current direction — circular arrow around the loop
      if (dir !== 0) {
        // dir +1 (approaching, B_ind up) → current CCW seen from above (i.e. current
        // flows leftward at the top arc, rightward at the bottom arc, in our face-on view).
        // dir −1 → reversed.
        const ccw = dir > 0;
        const arrowAlpha = Math.min(0.95, 0.4 + Math.abs(smoothedRate) * 0.5);
        const accentStr = withAlpha(colors.accent, arrowAlpha);
        ctx.strokeStyle = accentStr;
        ctx.fillStyle = accentStr;
        ctx.lineWidth = 1.6;
        // small chevrons placed along the ellipse
        const chevrons = 6;
        for (let i = 0; i < chevrons; i++) {
          const theta = (i / chevrons) * Math.PI * 2;
          const px = cx + (loopR + 12) * Math.cos(theta);
          const py = cy + (loopRy + 6) * Math.sin(theta);
          // tangent direction at this point (CCW = +d/dθ)
          const tx = -loopR * Math.sin(theta);
          const ty = loopRy * Math.cos(theta);
          const tlen = Math.hypot(tx, ty) || 1;
          const ux = (tx / tlen) * (ccw ? 1 : -1);
          const uy = (ty / tlen) * (ccw ? 1 : -1);
          ctx.beginPath();
          ctx.moveTo(px - ux * 5 - uy * 3, py - uy * 5 + ux * 3);
          ctx.lineTo(px + ux * 5, py + uy * 5);
          ctx.lineTo(px - ux * 5 + uy * 3, py - uy * 5 - ux * 3);
          ctx.stroke();
        }
        drawLabel(ctx, {
          x: cx,
          y: cy + loopRy + 18,
          text: `induced current (${ccw ? 'opposes' : 'attracts'})`,
          color: accentStr,
          align: 'center',
          baseline: 'top',
        });
      } else {
        drawLabel(ctx, {
          x: cx,
          y: cy + loopRy + 18,
          text: 'move the magnet to induce a current',
          color: colors.textDim,
          align: 'center',
          baseline: 'top',
        });
      }

      // Status pill top-left
      const status =
        dir > 0
          ? 'magnet approaching · Φ ↑ · current opposes'
          : dir < 0
            ? 'magnet retreating · Φ ↓ · current sustains'
            : 'static · no induction';
      drawLabel(ctx, { text: status, x: 14, y: 14, font: '10px "JetBrains Mono", monospace', baseline: 'top' });
    },
    [],
    () => ({
      context: {
        lastD: stateRef.current.d,
        smoothedRate: 0,
      } as LenzContext,
    }),
  );

  return (
    <Demo
      figure={figure}
      title="Lenz's law — the induced current always pushes back"
      question="Push the magnet closer. What direction does the induced current flow — and why?"
      caption={
        <>
          Slide the magnet toward the loop or pull it away. The induced current (orange chevrons)
          always flows the way that creates an internal{' '}
          <strong style={{ color: 'var(--teal)' }}>induced B</strong> opposing the change in flux:
          repelling the magnet on approach, attracting it on retreat. The work you do moving the
          magnet is exactly the electrical energy that appears in the loop.
        </>
      }
      deeperLab={{ slug: 'faraday', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={320} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="distance"
          value={d}
          min={1}
          max={15}
          step={0.05}
          format={(v) => v.toFixed(1) + ' (a.u.)'}
          onChange={setD}
        />
        <MiniReadout
          label="dΦ/dt"
          value={rate === 0 ? '0' : (rate > 0 ? '+' : '') + rate.toFixed(2)}
          unit="(a.u.)"
        />
        <MiniReadout
          label="state"
          value={direction > 0 ? 'opposing' : direction < 0 ? 'attracting' : 'idle'}
        />
      </DemoControls>
      <EquationStrip
        leftLabel="The minus sign is the whole story"
        left={
          <InlineMath
            tex={`\\varepsilon \\;=\\; -\\dfrac{d\\Phi}{dt}`}
          />
        }
        rightLabel="Rate of change (signed, a.u.)"
        right={
          <InlineMath
            tex={`\\dfrac{d\\Phi}{dt} \\;\\approx\\; ${rate === 0 ? '0' : (rate > 0 ? '+' : '') + rate.toFixed(2)}`}
          />
        }
      />
    </Demo>
  );
}
