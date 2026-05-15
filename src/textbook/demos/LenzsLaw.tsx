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
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';

interface Props { figure?: string }

export function LenzsLawDemo({ figure }: Props) {
  // Distance from loop, in arbitrary "cm" units (1 = touching loop, large = far)
  const [d, setD] = useState(8);

  const stateRef = useRef({ d });
  useEffect(() => { stateRef.current = { d }; }, [d]);

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

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, colors } = info;
    let raf = 0;
    let lastT = performance.now();
    let lastD = stateRef.current.d;
    let smoothedRate = 0;

    function draw() {
      const { d } = stateRef.current;
      const now = performance.now();
      let dt = (now - lastT) / 1000;
      lastT = now;
      if (dt <= 0) dt = 1e-3;
      const dD = d - lastD; // + = moving away, − = approaching
      lastD = d;
      // raw rate of change of flux ∝ -dD/dt (closer = more flux)
      const rawRate = -dD / dt;
      // smooth toward 0 if user holds still, decay quickly
      smoothedRate = smoothedRate * 0.5 + rawRate * 0.5;
      if (Math.abs(smoothedRate) < 0.01) smoothedRate = 0;
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
      const magW = 60, magH = 24;
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
      ctx.font = 'bold 11px JetBrains Mono';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('S', cx, magY - magH / 4);
      ctx.fillText('N', cx, magY + magH / 4);

      // Magnet's own B-field arrow — pink, pointing down toward loop
      ctx.fillStyle = colors.pink;
      ctx.lineWidth = 1.4;
      const arrowFromY = magY + magH / 2 + 6;
      const arrowToY = cy - loopRy - 8;
      ctx.save();
      ctx.globalAlpha = 0.6;
      ctx.strokeStyle = colors.pink;
      ctx.beginPath();
      ctx.moveTo(cx, arrowFromY); ctx.lineTo(cx, arrowToY); ctx.stroke();
      ctx.restore();
      ctx.beginPath();
      ctx.moveTo(cx, arrowToY);
      ctx.lineTo(cx - 5, arrowToY - 7);
      ctx.lineTo(cx + 5, arrowToY - 7);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = colors.pink;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText('B (magnet)', cx + 10, (arrowFromY + arrowToY) / 2);

      // Induced-B arrow (teal) inside the loop. dir = +1 (approaching) → B_ind UP (out of loop, opposing).
      // dir = −1 (retreating) → B_ind DOWN (into loop, supporting fading flux).
      if (dir !== 0) {
        const tealAlpha = Math.min(0.9, 0.35 + Math.abs(smoothedRate) * 0.5);
        ctx.strokeStyle = `rgba(108,197,194,${tealAlpha})`;
        ctx.fillStyle = `rgba(108,197,194,${tealAlpha})`;
        ctx.lineWidth = 1.8;
        if (dir > 0) {
          // arrow inside loop pointing UP (out of plane toward viewer = up-axis)
          ctx.beginPath();
          ctx.moveTo(cx, cy + 4); ctx.lineTo(cx, cy - 28); ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(cx, cy - 28);
          ctx.lineTo(cx - 5, cy - 22);
          ctx.lineTo(cx + 5, cy - 22);
          ctx.closePath(); ctx.fill();
        } else {
          // arrow inside loop pointing DOWN
          ctx.beginPath();
          ctx.moveTo(cx, cy - 4); ctx.lineTo(cx, cy + 28); ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(cx, cy + 28);
          ctx.lineTo(cx - 5, cy + 22);
          ctx.lineTo(cx + 5, cy + 22);
          ctx.closePath(); ctx.fill();
        }
        ctx.fillStyle = `rgba(108,197,194,${tealAlpha})`;
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText('B (induced)', cx + 12, cy);
      }

      // Induced current direction — circular arrow around the loop
      if (dir !== 0) {
        // dir +1 (approaching, B_ind up) → current CCW seen from above (i.e. current
        // flows leftward at the top arc, rightward at the bottom arc, in our face-on view).
        // dir −1 → reversed.
        const ccw = dir > 0;
        const arrowAlpha = Math.min(0.95, 0.4 + Math.abs(smoothedRate) * 0.5);
        ctx.strokeStyle = `rgba(255,107,42,${arrowAlpha})`;
        ctx.fillStyle = `rgba(255,107,42,${arrowAlpha})`;
        ctx.lineWidth = 1.6;
        // small chevrons placed along the ellipse
        const chevrons = 6;
        for (let i = 0; i < chevrons; i++) {
          const theta = (i / chevrons) * Math.PI * 2;
          const px = cx + (loopR + 12) * Math.cos(theta);
          const py = cy + (loopRy + 6) * Math.sin(theta);
          // tangent direction at this point (CCW = +d/dθ)
          const tx = -loopR * Math.sin(theta);
          const ty = (loopRy) * Math.cos(theta);
          const tlen = Math.hypot(tx, ty) || 1;
          const ux = (tx / tlen) * (ccw ? 1 : -1);
          const uy = (ty / tlen) * (ccw ? 1 : -1);
          ctx.beginPath();
          ctx.moveTo(px - ux * 5 - uy * 3, py - uy * 5 + ux * 3);
          ctx.lineTo(px + ux * 5, py + uy * 5);
          ctx.lineTo(px - ux * 5 + uy * 3, py - uy * 5 - ux * 3);
          ctx.stroke();
        }
        ctx.fillStyle = `rgba(255,107,42,${arrowAlpha})`;
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center'; ctx.textBaseline = 'top';
        ctx.fillText(`induced current (${ccw ? 'opposes' : 'attracts'})`, cx, cy + loopRy + 18);
      } else {
        ctx.fillStyle = colors.textDim;
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center'; ctx.textBaseline = 'top';
        ctx.fillText('move the magnet to induce a current', cx, cy + loopRy + 18);
      }

      // Status pill top-left
      ctx.fillStyle = colors.textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      const status =
        dir > 0 ? 'magnet approaching · Φ ↑ · current opposes' :
        dir < 0 ? 'magnet retreating · Φ ↓ · current sustains' :
        'static · no induction';
      ctx.fillText(status, 14, 14);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 5.2'}
      title="Lenz's law — the induced current always pushes back"
      question="Push the magnet closer. What direction does the induced current flow — and why?"
      caption={<>
        Slide the magnet toward the loop or pull it away. The induced current (orange chevrons) always flows the way that
        creates an internal <strong style={{ color: 'var(--teal)' }}>induced B</strong> opposing the change in flux:
        repelling the magnet on approach, attracting it on retreat. The work you do moving the magnet is exactly the
        electrical energy that appears in the loop.
      </>}
      deeperLab={{ slug: 'faraday', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={320} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="distance"
          value={d} min={1} max={15} step={0.05}
          format={v => v.toFixed(1) + ' (a.u.)'}
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
    </Demo>
  );
}
