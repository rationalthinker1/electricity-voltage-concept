/**
 * Demo D16.1 — Brushed DC motor (cross-section)
 *
 * A single rotor coil spins between two stator magnets (left = N, right = S).
 * A two-segment split-ring commutator on the rotor's shaft reverses the
 * current direction in the coil every half-turn, so the torque
 * τ = NIA·B·sin(θ) remains positive on average rather than oscillating
 * positive and negative as it would in a slip-ring AC alternator.
 *
 * Slider: V (supply voltage). Coil current I = V/R, with R baked in.
 * Visual rotor speed is proportional to mean-torque (after damping) so the
 * coil visibly spins up as V increases. The readout shows real values.
 */
import { useMemo, useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';
import { drawLabel } from "@/lib/canvasLayout";

interface Props {
  figure?: string;
}

// Fixed parameters of the model motor.
const COIL_N = 50; // turns
const COIL_A = 0.002; // m² (small rotor: ~4.5 cm × 4.5 cm)
const COIL_B = 0.18; // T (ceramic stator magnets, ferrite-grade)
const COIL_R = 4; // Ω (winding resistance)

export function BrushedDCMotorDemo({ figure }: Props) {
  const [V, setV] = useState(6); // supply volts

  const stateRef = useSimState({ V });
  const computed = useMemo(() => {
    const I = V / COIL_R;
    const tauPeak = COIL_N * I * COIL_A * COIL_B; // N·m at sin=1
    const tauMean = (2 / Math.PI) * tauPeak; // rectified sine avg
    return { I, tauPeak, tauMean };
  }, [V]);

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, colors }, _state, dt, _simTime, ctx0) => {
      let theta = ctx0.theta;
      let omega = ctx0.omega;
      const { V } = stateRef.current;
      const I = V / COIL_R;
      const tauPeak = COIL_N * I * COIL_A * COIL_B;
      const drive = tauPeak * Math.abs(Math.sin(theta));
      const friction = 0.05 * omega;
      omega += (drive * 6 - friction) * dt;
      if (omega < 0) omega = 0;
      if (omega > 10) omega = 10;
      theta += omega * dt;
      const cx = w / 2;
      const cy = h / 2;
      const R = Math.min(w, h) * 0.36;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);
      const magW = R * 0.45;
      const magH = R * 1.35;
      ctx.save();
      ctx.globalAlpha = 0.22;
      ctx.fillStyle = colors.pink;
      ctx.fillRect(cx - R - magW, cy - magH / 2, magW, magH);
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = colors.pink;
      ctx.lineWidth = 1.2;
      ctx.strokeRect(cx - R - magW, cy - magH / 2, magW, magH);
      ctx.restore();
      drawLabel(ctx, { text: 'N', x: cx - R - magW / 2, y: cy, color: colors.pink, weight: 'bold', size: 14, font: '14px "JetBrains Mono"', align: 'center', baseline: 'middle' });
      ctx.save();
      ctx.globalAlpha = 0.22;
      ctx.fillStyle = colors.blue;
      ctx.fillRect(cx + R, cy - magH / 2, magW, magH);
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = colors.blue;
      ctx.strokeRect(cx + R, cy - magH / 2, magW, magH);
      ctx.restore();
      drawLabel(ctx, { text: 'S', x: cx + R + magW / 2, y: cy, color: colors.blue });
      ctx.save();
      ctx.globalAlpha = 0.22;
      ctx.strokeStyle = colors.teal;
      ctx.save();
      ctx.globalAlpha = 0.22;
      ctx.fillStyle = colors.teal;
      ctx.lineWidth = 1;
      const rows = 4;
      for (let i = 0; i < rows; i++) {
        const y = cy - magH * 0.35 + (i * magH * 0.7) / (rows - 1);
        ctx.beginPath();
        ctx.moveTo(cx - R + 6, y);
        ctx.lineTo(cx + R - 6, y);
        ctx.stroke();
        ctx.restore();
        ctx.restore();
        // arrowhead
        ctx.beginPath();
        ctx.moveTo(cx + R - 6, y);
        ctx.lineTo(cx + R - 14, y - 4);
        ctx.lineTo(cx + R - 14, y + 4);
        ctx.closePath();
        ctx.fill();
      }
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, R + 4, 0, Math.PI * 2);
      ctx.stroke();
      const coilW = R * 0.18;
      const coilLen = R * 1.7;
      const cos = Math.cos(theta);
      const sin = Math.sin(theta);
      const corners = [
        { x: -coilLen / 2, y: -coilW / 2 },
        { x: coilLen / 2, y: -coilW / 2 },
        { x: coilLen / 2, y: coilW / 2 },
        { x: -coilLen / 2, y: coilW / 2 },
      ].map((p) => ({
        x: cx + p.x * cos - p.y * sin,
        y: cy + p.x * sin + p.y * cos,
      }));
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(corners[0].x, corners[0].y);
      for (let i = 1; i < 4; i++) ctx.lineTo(corners[i].x, corners[i].y);
      ctx.closePath();
      ctx.stroke();
      const endAx = cx + (coilLen / 2) * cos;
      const endAy = cy + (coilLen / 2) * sin;
      const endBx = cx - (coilLen / 2) * cos;
      const endBy = cy - (coilLen / 2) * sin;
      const topEnd = endAy < endBy ? { x: endAx, y: endAy } : { x: endBx, y: endBy };
      const botEnd = endAy < endBy ? { x: endBx, y: endBy } : { x: endAx, y: endAy };
      ctx.fillStyle = colors.pink;
      ctx.beginPath();
      ctx.arc(topEnd.x, topEnd.y, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = 'bold 10px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      drawLabel(ctx, { text: '×', x: topEnd.x, y: topEnd.y, color: colors.bg, weight: 'bold', font: '10px "JetBrains Mono"', align: 'center', baseline: 'middle' });
      ctx.fillStyle = colors.blue;
      ctx.beginPath();
      ctx.arc(botEnd.x, botEnd.y, 7, 0, Math.PI * 2);
      ctx.fill();
      drawLabel(ctx, { text: '·', x: botEnd.x, y: botEnd.y, color: colors.bg, weight: 'bold', font: '10px "JetBrains Mono"', align: 'center', baseline: 'middle' });
      const fLen = Math.max(8, Math.min(36, drive * 30 + 10));
      ctx.strokeStyle = colors.accent;
      ctx.fillStyle = colors.accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(topEnd.x, topEnd.y);
      ctx.lineTo(topEnd.x, topEnd.y - fLen);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(topEnd.x, topEnd.y - fLen);
      ctx.lineTo(topEnd.x - 4, topEnd.y - fLen + 6);
      ctx.lineTo(topEnd.x + 4, topEnd.y - fLen + 6);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(botEnd.x, botEnd.y);
      ctx.lineTo(botEnd.x, botEnd.y + fLen);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(botEnd.x, botEnd.y + fLen);
      ctx.lineTo(botEnd.x - 4, botEnd.y + fLen - 6);
      ctx.lineTo(botEnd.x + 4, botEnd.y + fLen - 6);
      ctx.closePath();
      ctx.fill();
      const commR = R * 0.18;
      ctx.strokeStyle = '#d4a050';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cx, cy, commR, theta + 0.15, theta + Math.PI - 0.15);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, commR, theta + Math.PI + 0.15, theta + 2 * Math.PI - 0.15);
      ctx.stroke();
      ctx.fillStyle = '#888';
      ctx.fillRect(cx - 3, cy - commR - 10, 6, 8);
      ctx.fillRect(cx - 3, cy + commR + 2, 6, 8);
      ctx.save();
      ctx.globalAlpha = 0.4;
      ctx.strokeStyle = colors.text;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(cx, cy - commR - 10);
      ctx.lineTo(cx, cy - commR - 30);
      ctx.moveTo(cx, cy + commR + 10);
      ctx.lineTo(cx, cy + commR + 30);
      ctx.stroke();
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = 0.8;
      drawLabel(ctx, { text: '+', x: cx + 8, y: cy - commR - 22, color: colors.text, font: '10px "JetBrains Mono", monospace', baseline: 'middle' });
      ctx.restore();
      drawLabel(ctx, { text: '−', x: cx + 8, y: cy + commR + 22 });
      ctx.save();
      ctx.globalAlpha = 0.75;
      drawLabel(ctx, { text: 'rotor coil + split-ring commutator', x: 12, y: 12, font: '10px "JetBrains Mono", monospace', baseline: 'top' });
      ctx.restore();
      drawLabel(ctx, { text: `I = ${I.toFixed(2)} A   ω(vis) = ${omega.toFixed(1)} rad/s`, x: w - 12, y: 12, align: 'right' });
      ctx0.theta = theta;
      ctx0.omega = omega;
    },
    [],
    () => ({ context: { theta: 0, omega: 0 } }),
  );

  return (
    <Demo
      figure={figure ?? 'Fig. 16.1'}
      title="The brushed DC motor"
      question="A coil in a steady field would oscillate. What does the commutator fix?"
      caption={
        <>
          Cross-section of a permanent-magnet brushed DC motor. As the rotor spins, the split-ring
          <strong> commutator</strong> reverses the current in the coil every half-turn, so the
          torque on the rotor — <em>τ = NIA·B·sin(θ)</em> after commutation — always pushes the same
          way. Two brushes ride on the ring and feed it from the fixed external supply.
        </>
      }
    >
      <AutoResizeCanvas height={320} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="V supply"
          value={V}
          min={0}
          max={24}
          step={0.1}
          format={(v) => v.toFixed(1) + ' V'}
          onChange={setV}
        />
        <MiniReadout label="I = V/R" value={<Num value={computed.I} digits={2} />} unit="A" />
        <MiniReadout
          label="τ peak = NIAB"
          value={<Num value={computed.tauPeak} digits={2} />}
          unit="N·m"
        />
        <MiniReadout
          label="τ mean (after commutation)"
          value={<Num value={computed.tauMean} digits={2} />}
          unit="N·m"
        />
      </DemoControls>
    </Demo>
  );
}
