/**
 * Demo D2.1 — Voltage as height
 *
 * Gravity analogy: a tilted ramp with a ball that rolls down. The slope
 * is "voltage" (the difference in height); rolling down means the ball
 * gains kinetic energy equal to qV (here m·g·h, but the analogy is
 * direct). A toggle releases / parks the ball, and a slider sets the
 * slope. Pure intuition pump — no physical units pretending to be SI.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider, MiniToggle } from '@/components/Demo';

interface Props { figure?: string }

export function VoltageAsHeightDemo({ figure }: Props) {
  const [voltage, setVoltage] = useState(6);   // "V" — drives the slope
  const [rolling, setRolling] = useState(true);

  const stateRef = useRef({ voltage, rolling });
  useEffect(() => { stateRef.current = { voltage, rolling }; }, [voltage, rolling]);

  // Energy a 1-coulomb test charge would gain rolling top → bottom:
  // W = q·ΔV. With q = 1 C and ΔV = voltage, W = voltage joules.
  const energyJ = voltage; // q = 1 C

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, colors } = info;
    let raf = 0;

    // Ball position parameterised along the ramp, t ∈ [0, 1].
    let t = 0;
    let v = 0; // along-ramp velocity, "demo units"

    function draw() {
      const { voltage, rolling } = stateRef.current;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      // Ramp endpoints. Higher voltage → steeper slope. Both ends fixed
      // horizontally; the left end rises from baseline by an amount that
      // scales with voltage.
      const padX = 70;
      const baseY = h - 60;
      const maxRise = h - 110;
      const rise = (voltage / 12) * maxRise; // visual mapping only
      const ax = padX, ay = baseY - rise;     // top of ramp (point A)
      const bx = w - padX, by = baseY;        // bottom of ramp (point B)
      const dx = bx - ax, dy = by - ay;
      const len = Math.hypot(dx, dy);

      // Ground line
      ctx.strokeStyle = 'rgba(160,158,149,.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, baseY); ctx.lineTo(w, baseY); ctx.stroke();

      // Filled hill — soft grey wedge under the ramp
      ctx.fillStyle = 'rgba(255,255,255,.04)';
      ctx.beginPath();
      ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.lineTo(bx, baseY); ctx.lineTo(ax, baseY);
      ctx.closePath(); ctx.fill();

      // Ramp line itself, in amber
      ctx.strokeStyle = 'rgba(255,107,42,.7)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();

      // Height marker (the "ΔV") — vertical dashed line on the left
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(108,197,194,.55)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax, baseY); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(108,197,194,.85)';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillText(`ΔV = ${voltage.toFixed(1)} V`, ax - 10, (ay + baseY) / 2);

      // A and B labels
      ctx.fillStyle = colors.accent;
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      ctx.fillText('A (high V)', ax, ay - 14);
      ctx.fillText('B (low V)', bx, by - 14);

      // Update ball physics. The "acceleration" along the ramp is just
      // the slope sin(θ), which we map directly from voltage. Pure
      // intuition pump — no SI units pretending to be real.
      const slope = dy / Math.max(len, 1); // sin(θ) ≥ 0 since dy ≥ 0
      const accel = slope * 0.0015;        // demo-unit acceleration
      if (rolling) {
        v += accel;
        v *= 0.998; // a touch of damping so it doesn't fly off-screen
        t += v;
      } else {
        t = 0; v = 0;
      }
      if (t > 1) { t = 0; v = 0; }
      if (t < 0) { t = 0; v = 0; }

      // Ball position along ramp. Lift by ball-radius perpendicular to slope.
      const bxs = ax + dx * t;
      const bys = ay + dy * t;
      const nx = -dy / Math.max(len, 1);
      const ny =  dx / Math.max(len, 1);
      const radius = 11;
      const cx = bxs + nx * (-radius);
      const cy = bys + ny * (-radius);

      // Trail showing the path so far
      if (t > 0.02) {
        ctx.strokeStyle = 'rgba(255,59,110,.35)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(ax + nx * (-radius), ay + ny * (-radius));
        ctx.lineTo(cx, cy);
        ctx.stroke();
      }

      // Ball — pink "positive test charge"
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 2.5);
      grd.addColorStop(0, '#ff3b6e'); grd.addColorStop(1, '#ff3b6e00');
      ctx.fillStyle = grd;
      ctx.beginPath(); ctx.arc(cx, cy, radius * 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = colors.pink;
      ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = colors.bg;
      ctx.font = 'bold 12px JetBrains Mono';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('+', cx, cy);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 2.1'}
      title="Voltage is a difference in height"
      question="What does it mean for one point to be 'at 12 volts'?"
      caption={<>
        The slope is the voltage. A positive charge released at A coasts down to B, picking up kinetic energy equal to <em>qΔV</em>. Voltage by itself is meaningless — only differences are physical, exactly the way only differences in altitude matter for a ball.
      </>}
      deeperLab={{ slug: 'potential', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={280} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="ΔV (slope)"
          value={voltage} min={0} max={12} step={0.1}
          format={v => v.toFixed(1) + ' V'}
          onChange={setVoltage}
        />
        <MiniToggle label={rolling ? 'rolling' : 'parked'} checked={rolling} onChange={setRolling} />
        <MiniReadout label="Energy gained per coulomb" value={energyJ.toFixed(2)} unit="J" />
      </DemoControls>
    </Demo>
  );
}
