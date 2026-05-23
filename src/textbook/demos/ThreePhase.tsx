/**
 * Demo D10.6 — Three-phase
 *
 *   V_a(t) = V_pk cos(ωt)
 *   V_b(t) = V_pk cos(ωt − 2π/3)
 *   V_c(t) = V_pk cos(ωt − 4π/3)
 *
 * Their instantaneous sum is exactly zero — so the return current on a delta
 * three-wire system also sums to zero, and no neutral wire is needed.
 *
 * Right side: rotating phasor diagram showing the three vectors at 120° apart.
 */
import { useState } from 'react';
import { drawLabel } from '@/lib/canvasLayout';
import { withAlpha } from '@/lib/canvasTheme';
import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

interface Props {
  figure: string;
}

const Vpk = 1;
const TAU3 = (2 * Math.PI) / 3;

export function ThreePhaseDemo({ figure }: Props) {
  const [f, setF] = useState(60); // Hz (real grid)
  const stateRef = useSimState({ f });
  const Vrms = Vpk / Math.sqrt(2);

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, colors }, _state, dt, _simTime, ctx0) => {
      let simT = ctx0.simT;
      const SCOPE_DURATION = ctx0.SCOPE_DURATION;
      const { f } = stateRef.current;
      const slow = f > 120 ? 120 / f : 1;
      simT += dt * slow;
      const omega = 2 * Math.PI * f;
      const phase = omega * simT;
      const tStart = simT - SCOPE_DURATION;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);
      const splitX = Math.max(w * 0.58, w - 240);
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, splitX, h);
      ctx.clip();
      const plotX = 36;
      const plotW = Math.max(80, splitX - 60);
      const plotY = 32;
      const plotH = h - 60;
      const cyP = plotY + plotH / 2;
      ctx.strokeStyle = colors.border;
      ctx.strokeRect(plotX, plotY, plotW, plotH);
      ctx.strokeStyle = colors.borderStrong;
      ctx.beginPath();
      ctx.moveTo(plotX, cyP);
      ctx.lineTo(plotX + plotW, cyP);
      ctx.stroke();
      const xT = (tt: number) => plotX + ((tt - tStart) / SCOPE_DURATION) * plotW;
      const yV = (v: number) => cyP - (v / Vpk) * (plotH / 2) * 0.85;
      const sampleCount = Math.max(160, Math.floor(plotW));
      const voltageAt = (t: number, offset: number) => Vpk * Math.cos(omega * t - offset);
      const phaseColors = [
        withAlpha(colors.pink, 0.95), // pink
        withAlpha(colors.teal, 0.95), // teal
        withAlpha(colors.accent, 0.95), // amber
      ];
      const offsets = [0, TAU3, 2 * TAU3];
      for (let k = 0; k < 3; k++) {
        ctx.strokeStyle = phaseColors[k];
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let i = 0; i <= sampleCount; i++) {
          const t = tStart + (i / sampleCount) * SCOPE_DURATION;
          const x = xT(t);
          const y = yV(voltageAt(t, offsets[k]));
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.strokeStyle = withAlpha(colors.text, 0.95);
      ctx.setLineDash([3, 3]);
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      for (let i = 0; i <= sampleCount; i++) {
        const t = tStart + (i / sampleCount) * SCOPE_DURATION;
        const sumTrace = voltageAt(t, 0) + voltageAt(t, TAU3) + voltageAt(t, 2 * TAU3);
        const x = xT(t);
        const y = yV(sumTrace);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      drawLabel(ctx, { text: 'V_a', x: plotX + 4, y: plotY + 4, color: phaseColors[0], font: '10px "JetBrains Mono", monospace', baseline: 'top' });
      drawLabel(ctx, { text: 'V_b', x: plotX + 36, y: plotY + 4, color: phaseColors[1], font: '10px "JetBrains Mono", monospace', baseline: 'top' });
      drawLabel(ctx, { text: 'V_c', x: plotX + 68, y: plotY + 4, color: phaseColors[2], font: '10px "JetBrains Mono", monospace', baseline: 'top' });
      drawLabel(ctx, { text: 'Σ = 0', x: plotX + 100, y: plotY + 4, color: colors.text, font: '10px "JetBrains Mono", monospace', baseline: 'top' });
      drawLabel(ctx, { text: `${f.toFixed(0)} Hz — 120° apart`, x: plotX + plotW / 2, y: h - 14, font: '10px "JetBrains Mono", monospace', align: 'center', baseline: 'top' });
      ctx.restore();
      ctx.strokeStyle = colors.border;
      ctx.beginPath();
      ctx.moveTo(splitX, 0);
      ctx.lineTo(splitX, h);
      ctx.stroke();
      ctx.save();
      ctx.beginPath();
      ctx.rect(splitX, 0, w - splitX, h);
      ctx.clip();
      const pcx = splitX + (w - splitX) / 2;
      const pcy = h / 2 + 8;
      const pR = Math.max(50, Math.min((w - splitX) / 2 - 18, h / 2 - 36));
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(pcx, pcy, pR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(pcx - pR - 4, pcy);
      ctx.lineTo(pcx + pR + 4, pcy);
      ctx.moveTo(pcx, pcy - pR - 4);
      ctx.lineTo(pcx, pcy + pR + 4);
      ctx.stroke();
      const angles = [phase, phase - TAU3, phase - 2 * TAU3];
      const cols = [phaseColors[0], phaseColors[1], phaseColors[2]];
      const labels = ['a', 'b', 'c'];
      for (let k = 0; k < 3; k++) {
        const ax = pcx + Math.cos(angles[k]) * pR;
        const ay = pcy - Math.sin(angles[k]) * pR;
        ctx.strokeStyle = cols[k];
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(pcx, pcy);
        ctx.lineTo(ax, ay);
        ctx.stroke();
        // arrowhead
        const ang = Math.atan2(ay - pcy, ax - pcx);
        ctx.fillStyle = cols[k];
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(ax - 8 * Math.cos(ang - 0.4), ay - 8 * Math.sin(ang - 0.4));
        ctx.lineTo(ax - 8 * Math.cos(ang + 0.4), ay - 8 * Math.sin(ang + 0.4));
        ctx.closePath();
        ctx.fill();
        drawLabel(ctx, {
          x: ax + 10 * Math.cos(ang),
          y: ay + 10 * Math.sin(ang),
          text: labels[k],
          color: cols[k],
          align: 'center',
          baseline: 'middle',
          weight: 'bold',
        });
      }
      ctx.fillStyle = colors.textDim;
      drawLabel(ctx, { text: 'phasors at 120°', x: pcx, y: 10, font: '10px "JetBrains Mono", monospace', align: 'center', baseline: 'top' });
      drawLabel(ctx, { text: `Σ vectors → 0`, x: pcx, y: h - 8, font: '10px "JetBrains Mono", monospace', align: 'center', baseline: 'bottom' });
      ctx.restore();
      ctx0.simT = simT;
      ctx0.SCOPE_DURATION = SCOPE_DURATION;
    },
    [],
    () => ({ context: { simT: 0, SCOPE_DURATION: 0.05 } }),
  );

  return (
    <Demo
      figure={figure}
      title="Three-phase — why the grid uses three wires"
      question="Three sinusoids, each 120° behind the previous. What's special about that sum?"
      caption={
        <>
          Three voltages 120° apart in phase add to exactly zero at every instant. That means a
          balanced three-phase delta system needs no neutral return wire — three wires carry all the
          power. The right panel shows the phasor picture: three vectors of equal length at 120°,
          summing geometrically to the origin.
        </>
      }
    >
      <AutoResizeCanvas height={320} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="f"
          value={f}
          min={10}
          max={400}
          step={1}
          format={(v) => v.toFixed(0) + ' Hz'}
          onChange={setF}
        />
        <MiniReadout label="V_pk" value={Vpk.toFixed(2)} unit="V" />
        <MiniReadout label="V_rms = V_pk/√2" value={Vrms.toFixed(3)} unit="V" />
        <MiniReadout label="Phase offset" value="120°" />
      </DemoControls>
    </Demo>
  );
}
