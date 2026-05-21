/**
 * Demo D2.1 — Voltage as height
 *
 * Gravity analogy: a tilted ramp with a ball that rolls down. The slope
 * is "voltage" (the difference in height); rolling down means the ball
 * gains kinetic energy equal to qV (here m·g·h, but the analogy is
 * direct). A toggle releases / parks the ball, and a slider sets the
 * slope. Pure intuition pump — no physical units pretending to be SI.
 */
import { useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider, MiniToggle } from '@/components/Demo';
import { withAlpha } from '@/lib/canvasTheme';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

interface Props {
  figure?: string;
}

export function VoltageAsHeightDemo({ figure }: Props) {
  const [voltage, setVoltage] = useState(6);
  const [rolling, setRolling] = useState(true);

  // Energy a 1-coulomb test charge would gain rolling top → bottom:
  // W = q·ΔV. With q = 1 C and ΔV = voltage, W = voltage joules.
  const energyJ = voltage;

  const stateRef = useSimState({ voltage, rolling });

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, colors }, _state, _dt, _simTime, ball) => {
      const s = stateRef.current;
      const { voltage: V, rolling } = s;

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      // Ramp endpoints. Higher voltage → steeper slope.
      const padX = 70;
      const baseY = h - 60;
      const maxRise = h - 110;
      const rise = (V / 12) * maxRise;
      const ax = padX,
        ay = baseY - rise;
      const bx = w - padX,
        by = baseY;
      const dx = bx - ax,
        dy = by - ay;
      const len = Math.hypot(dx, dy);

      // Ground line
      ctx.strokeStyle = withAlpha(colors.textDim, 0.25);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, baseY);
      ctx.lineTo(w, baseY);
      ctx.stroke();

      // Filled hill
      ctx.fillStyle = withAlpha(colors.text, 0.04);
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.lineTo(bx, baseY);
      ctx.lineTo(ax, baseY);
      ctx.closePath();
      ctx.fill();

      // Ramp line
      ctx.strokeStyle = withAlpha(colors.accent, 0.7);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();

      // Height marker (the "ΔV")
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = withAlpha(colors.teal, 0.55);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(ax, baseY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = withAlpha(colors.teal, 0.85);
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(`ΔV = ${V.toFixed(1)} V`, ax - 10, (ay + baseY) / 2);

      // A and B labels
      ctx.fillStyle = colors.accent;
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText('A (high V)', ax, ay - 14);
      ctx.fillText('B (low V)', bx, by - 14);

      // Update ball physics
      const slope = dy / Math.max(len, 1);
      const accel = slope * 0.0015;
      if (rolling) {
        ball.v += accel;
        ball.v *= 0.998;
        ball.t += ball.v;
      } else {
        ball.t = 0;
        ball.v = 0;
      }
      if (ball.t > 1) {
        ball.t = 0;
        ball.v = 0;
      }
      if (ball.t < 0) {
        ball.t = 0;
        ball.v = 0;
      }

      // Ball position along ramp
      const bxs = ax + dx * ball.t;
      const bys = ay + dy * ball.t;
      const nx = -dy / Math.max(len, 1);
      const ny = dx / Math.max(len, 1);
      const radius = 11;
      const cx = bxs + nx * -radius;
      const cy = bys + ny * -radius;

      // Trail
      if (ball.t > 0.02) {
        ctx.strokeStyle = withAlpha(colors.pink, 0.35);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(ax + nx * -radius, ay + ny * -radius);
        ctx.lineTo(cx, cy);
        ctx.stroke();
      }

      // Ball glow + body
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 2.5);
      grd.addColorStop(0, colors.pink);
      grd.addColorStop(1, withAlpha(colors.pink, 0));
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = colors.pink;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = colors.bg;
      ctx.font = 'bold 12px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('+', cx, cy);
    },
    [],
    () => ({ context: { t: 0, v: 0 } }),
  );

  return (
    <Demo
      figure={figure ?? 'Fig. 2.1'}
      title="Voltage is a difference in height"
      question="What does it mean for one point to be 'at 12 volts'?"
      caption={
        <>
          The slope is the voltage. A positive charge released at A coasts down to B, picking up
          kinetic energy equal to <em>qΔV</em>. Voltage by itself is meaningless — only differences
          are physical, exactly the way only differences in altitude matter for a ball.
        </>
      }
      deeperLab={{ slug: 'potential', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={280} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="ΔV (slope)"
          value={voltage}
          min={0}
          max={12}
          step={0.1}
          format={(v) => v.toFixed(1) + ' V'}
          onChange={setVoltage}
        />
        <MiniToggle
          label={rolling ? 'rolling' : 'parked'}
          checked={rolling}
          onChange={setRolling}
        />
        <MiniReadout label="Energy gained per coulomb" value={energyJ.toFixed(2)} unit="J" />
      </DemoControls>
    </Demo>
  );
}
