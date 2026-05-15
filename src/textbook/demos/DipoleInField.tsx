/**
 * Demo D11.1 — A grid of molecular dipoles aligning to E
 *
 * Each "molecule" is a small pink-blue dumbbell that initially points in a
 * random direction. Drag the slider to ramp up an applied E field (rightward).
 * Each dipole rotates toward alignment with the field; thermal noise fights
 * back. The readout shows the alignment fraction ⟨cos θ⟩ — this is what the
 * Langevin function gives in the kT-limit, and it is exactly what bulk
 * polarization P is, up to a constant factor (number density × dipole moment).
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';

interface Props { figure?: string }

interface Dipole {
  x: number;
  y: number;
  theta: number;     // current orientation
  omega: number;     // angular velocity (for inertia/smoothing)
}

export function DipoleInFieldDemo({ figure }: Props) {
  // E in arbitrary units (0 .. 10). 0 means thermal-disorder only.
  const [E, setE] = useState(0);
  const stateRef = useRef({ E });
  useEffect(() => { stateRef.current = { E }; }, [E]);
  const [align, setAlign] = useState(0);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, colors } = info;
    let raf = 0;

    // Build the grid of molecules
    const cols = Math.max(8, Math.floor(w / 60));
    const rows = Math.max(4, Math.floor(h / 60));
    const dx = w / (cols + 1);
    const dy = h / (rows + 1);
    const dipoles: Dipole[] = [];
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        dipoles.push({
          x: dx * (i + 1),
          y: dy * (j + 1),
          theta: Math.random() * Math.PI * 2,
          omega: 0,
        });
      }
    }

    function draw() {
      const { E } = stateRef.current;

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      // Background E-field arrows (very faint horizontal stream)
      if (E > 0.01) {
        ctx.strokeStyle = `rgba(255,107,42,${(0.12 + 0.06 * Math.min(1, E / 6)).toFixed(3)})`;
        ctx.lineWidth = 1;
        for (let y = 18; y < h; y += 44) {
          for (let x0 = 10; x0 < w; x0 += 70) {
            ctx.beginPath();
            ctx.moveTo(x0, y);
            ctx.lineTo(x0 + 40, y);
            ctx.stroke();
            // arrowhead
            ctx.beginPath();
            ctx.moveTo(x0 + 40, y);
            ctx.lineTo(x0 + 34, y - 3);
            ctx.lineTo(x0 + 34, y + 3);
            ctx.closePath();
            ctx.fillStyle = ctx.strokeStyle;
            ctx.fill();
          }
        }
      }

      // Update each dipole. Torque ∝ -E·sin θ. Thermal kick = small random.
      let cos_sum = 0;
      const N = dipoles.length;
      const damping = 0.86;
      const torqueStrength = 0.04;       // visual tuning
      const noise = Math.max(0.08, 0.32 - E * 0.03);  // noise drops as field overwhelms it

      for (const d of dipoles) {
        const torque = -E * Math.sin(d.theta) * torqueStrength + (Math.random() - 0.5) * noise;
        d.omega = (d.omega + torque) * damping;
        d.theta += d.omega;
        cos_sum += Math.cos(d.theta);
      }
      const meanCos = cos_sum / N;

      // Draw dipoles
      const len = Math.min(dx, dy) * 0.32;
      for (const d of dipoles) {
        const cx = d.x, cy = d.y;
        const tx = Math.cos(d.theta) * len;
        const ty = Math.sin(d.theta) * len;
        // bar
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = colors.text;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx - tx, cy - ty);
        ctx.lineTo(cx + tx, cy + ty);
        ctx.stroke();
        // negative end (blue) — at -t
        ctx.restore();
        ctx.fillStyle = colors.blue;
        ctx.beginPath();
        ctx.arc(cx - tx, cy - ty, 3, 0, Math.PI * 2);
        ctx.fill();
        // positive end (pink) — at +t
        ctx.fillStyle = colors.pink;
        ctx.beginPath();
        ctx.arc(cx + tx, cy + ty, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Overlay alignment text
      ctx.fillStyle = colors.accent;
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`⟨cos θ⟩ = ${meanCos.toFixed(2)}`, 12, 18);
      ctx.fillStyle = colors.textDim;
      ctx.fillText(`E (applied) →`, w - 110, 18);

      // Throttle React state updates to ~5 Hz
      setAlignThrottled(meanCos);

      raf = requestAnimationFrame(draw);
    }

    // Throttle the live readout update
    let lastSet = 0;
    function setAlignThrottled(v: number) {
      const now = performance.now();
      if (now - lastSet > 200) {
        lastSet = now;
        setAlign(v);
      }
    }

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 11.1'}
      title="Molecular dipoles aligning to an applied field"
      question="What does it physically mean for a material to 'polarize'?"
      caption={<>
        Each dumbbell is a model molecule with a small dipole moment (pink end is positive,
        blue end is negative). With <strong>E = 0</strong> they tumble at random thanks to thermal motion.
        Crank E up and the torque <em>τ = p × E</em> nudges them into alignment.
        The number on the canvas is <em>⟨cos θ⟩</em> — the average projection of each dipole onto E. The bulk
        polarization <strong>P</strong> is just this number times the density of dipoles times the dipole
        moment per molecule.
      </>}
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="E"
          value={E} min={0} max={10} step={0.05}
          format={v => v.toFixed(2)}
          onChange={setE}
        />
        <MiniReadout label="⟨cos θ⟩" value={align.toFixed(2)} />
      </DemoControls>
    </Demo>
  );
}
