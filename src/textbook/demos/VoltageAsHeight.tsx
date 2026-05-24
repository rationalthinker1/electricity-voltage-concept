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
import {
  Demo,
  DemoControls,
  EquationStrip,
  MiniReadout,
  MiniSlider,
  MiniToggle,
} from '@/components/Demo';
import { M } from '@/components/Formula';
import { drawHalo } from '@/lib/canvasPrimitives';
import { withAlpha } from '@/lib/canvasTheme';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';
import { drawLabel } from '@/lib/canvasLayout';

interface Props {
  figure: string;
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
      drawLabel(ctx, {
        text: `ΔV = ${V.toFixed(1)} V`,
        x: ax - 10,
        y: (ay + baseY) / 2,
        size: 11,
        font: '11px "JetBrains Mono", monospace',
        align: 'right',
        baseline: 'middle',
      });

      // A and B labels
      ctx.fillStyle = colors.accent;
      drawLabel(ctx, {
        text: 'A (high V)',
        x: ax,
        y: ay - 14,
        color: colors.accent,
        size: 11,
        font: '11px "JetBrains Mono", monospace',
        align: 'center',
        baseline: 'bottom',
      });
      drawLabel(ctx, {
        text: 'B (low V)',
        x: bx,
        y: by - 14,
        color: colors.accent,
        size: 11,
        font: '11px "JetBrains Mono", monospace',
        align: 'center',
        baseline: 'bottom',
      });

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
      drawHalo(ctx, {
        x: cx,
        y: cy,
        radius: radius * 2.5,
        color: colors.pink,
        alpha: 1,
        extent: 1,
      });
      ctx.fillStyle = colors.pink;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
      drawLabel(ctx, {
        text: '+',
        x: cx,
        y: cy,
        color: colors.bg,
        weight: 'bold',
        size: 12,
        font: '12px "JetBrains Mono"',
        align: 'center',
        baseline: 'middle',
      });
    },
    [],
    () => ({ context: { t: 0, v: 0 } }),
  );

  return (
    <Demo
      figure={figure}
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
      <EquationStrip
        leftLabel="Voltage as energy per charge"
        left={<M tex="W = q\,\Delta V" />}
        rightLabel="Live values"
        right={
          <M
            tex={`W = (1\\,\\text{C})(${voltage.toFixed(1)}\\,\\text{V}) = ${energyJ.toFixed(2)}\\,\\text{J}`}
          />
        }
      />
    </Demo>
  );
}
