/**
 * Demo D5.2 — Rotating coil = AC generator
 *
 * Adapted from src/labs/FaradayLab.tsx, simplified for inline use.
 * Left half: coil rotating in a uniform horizontal B field.
 * Right half: oscilloscope plot of EMF(t) sweeping right→left.
 * Sliders: ω, B; readouts: peak EMF, frequency, V_rms.
 */
import { useMemo, useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, EquationStrip, MiniReadout, MiniSlider } from '@/components/Demo';
import { drawGlowPath } from '@/lib/canvasPrimitives';
import { InlineMath } from '@/components/Formula';
import { Num } from '@/components/Num';
import { withAlpha } from '@/lib/canvasTheme';
import { fmtVoltage } from '@/lib/formatters';
import { drawLabel } from "@/lib/canvasLayout";
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

interface Props {
  figure: string;
}

const N_TURNS = 100;
const A_M2 = 0.01; // 100 cm² fixed area for the inline demo

interface RotatingContext {
  scope: { t: number; emf: number }[];
}

export function RotatingCoilDemo({ figure }: Props) {
  const [B, setB] = useState(0.5); // T
  const [omega, setOmega] = useState(60); // rad/s

  const stateRef = useSimState({ B, omega });

  const computed = useMemo(() => {
    const peak = N_TURNS * B * A_M2 * omega;
    const f = omega / (2 * Math.PI);
    const Vrms = peak / Math.sqrt(2);
    return { peak, f, Vrms };
  }, [B, omega]);

  const SCOPE_DURATION = 0.2;

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, colors }, state, _dt, simT, c: RotatingContext) => {
      const { B, omega } = state;
      const peak = N_TURNS * B * A_M2 * omega;
      const visualOmega = Math.min(omega, 3.0);

      const emf = N_TURNS * B * A_M2 * omega * Math.sin(omega * simT);

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      const splitX = w * 0.42;

      // LEFT — coil
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, splitX, h);
      ctx.clip();

      // B field rows
      if (B > 0.005) {
        const op = Math.min(0.4, 0.1 + B * 0.2);
        const tealStr = withAlpha(colors.teal, op);
        ctx.strokeStyle = tealStr;
        ctx.fillStyle = tealStr;
        ctx.lineWidth = 1;
        const rows = 6;
        for (let i = 0; i < rows; i++) {
          const y = ((i + 0.5) * h) / rows;
          ctx.beginPath();
          ctx.moveTo(14, y);
          ctx.lineTo(splitX - 18, y);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(splitX - 18, y);
          ctx.lineTo(splitX - 24, y - 4);
          ctx.lineTo(splitX - 24, y + 4);
          ctx.closePath();
          ctx.fill();
        }
      }

      const coilCx = splitX / 2;
      const coilCy = h / 2;
      const coilH = Math.min(h * 0.55, 170);
      const coilW = Math.min(splitX * 0.55, 140);
      const angle = visualOmega * simT;
      const visW = coilW * Math.abs(Math.sin(angle));
      const persp = coilW * Math.cos(angle) * 0.18;

      // axis
      ctx.strokeStyle = colors.borderStrong;
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(coilCx, 18);
      ctx.lineTo(coilCx, h - 18);
      ctx.stroke();
      ctx.setLineDash([]);

      // coil rectangle
      ctx.strokeStyle = withAlpha(colors.accent, 0.45 + 0.4 * Math.abs(Math.sin(angle)));
      ctx.lineWidth = 2;
      const xL = coilCx - visW / 2;
      const xR = coilCx + visW / 2;
      const yT = coilCy - coilH / 2;
      const yB = coilCy + coilH / 2;
      ctx.beginPath();
      ctx.moveTo(xL - persp * 0.3, yT);
      ctx.lineTo(xR - persp * 0.3, yT);
      ctx.lineTo(xR + persp * 0.3, yB);
      ctx.lineTo(xL + persp * 0.3, yB);
      ctx.closePath();
      ctx.stroke();

      // normal arrow
      const normLen = 30;
      const projNx = Math.cos(angle) * normLen;
      const projNy = -Math.sin(angle) * normLen * 0.35;
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = colors.text;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(coilCx, coilCy);
      ctx.lineTo(coilCx + projNx, coilCy + projNy);
      ctx.stroke();
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = 0.55;
      drawLabel(ctx, { text: 'n̂', x: coilCx + projNx + 4, y: coilCy + projNy, color: colors.text, font: '10px "JetBrains Mono", monospace', baseline: 'middle' });

      ctx.restore();
      drawLabel(ctx, { text: `B → ${B.toFixed(2)} T`, x: 12, y: 12, color: colors.teal, font: '10px "JetBrains Mono", monospace', baseline: 'top' });

      ctx.restore();

      // divider
      ctx.strokeStyle = colors.border;
      ctx.beginPath();
      ctx.moveTo(splitX, 0);
      ctx.lineTo(splitX, h);
      ctx.stroke();

      // RIGHT — scope
      ctx.save();
      ctx.beginPath();
      ctx.rect(splitX, 0, w - splitX, h);
      ctx.clip();

      const scopeX = splitX + 30;
      const scopeW = w - splitX - 50;
      const scopeCy = h / 2;
      const scopeH = h * 0.66;

      c.scope.push({ t: simT, emf });
      const tCut = simT - SCOPE_DURATION;
      while (c.scope.length && c.scope[0]!.t < tCut) c.scope.shift();

      const yScale = Math.max(peak, 0.01);

      // grid
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = scopeCy - scopeH / 2 + (i * scopeH) / 4;
        ctx.beginPath();
        ctx.moveTo(scopeX, y);
        ctx.lineTo(scopeX + scopeW, y);
        ctx.stroke();
      }
      // zero line
      ctx.strokeStyle = colors.borderStrong;
      ctx.beginPath();
      ctx.moveTo(scopeX, scopeCy);
      ctx.lineTo(scopeX + scopeW, scopeCy);
      ctx.stroke();

      // peak guides
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = colors.accent;
      ctx.setLineDash([4, 4]);
      const peakY = scopeCy - (scopeH / 2) * 0.9;
      const peakYn = scopeCy + (scopeH / 2) * 0.9;
      ctx.beginPath();
      ctx.moveTo(scopeX, peakY);
      ctx.lineTo(scopeX + scopeW, peakY);
      ctx.moveTo(scopeX, peakYn);
      ctx.lineTo(scopeX + scopeW, peakYn);
      ctx.stroke();
      ctx.setLineDash([]);

      // trace
      if (c.scope.length > 2) {
        const tracePts: { x: number; y: number }[] = [];
        for (let i = 0; i < c.scope.length; i++) {
          const s = c.scope[i]!;
          tracePts.push({
            x: scopeX + ((s.t - tCut) / SCOPE_DURATION) * scopeW,
            y: scopeCy - (s.emf / yScale) * (scopeH / 2) * 0.9,
          });
        }
        drawGlowPath(ctx, tracePts, {
          color: withAlpha(colors.pink, 0.95),
          lineWidth: 1.6,
          glowColor: withAlpha(colors.pink, 0.4),
          glowWidth: 6,
        });
      }

      ctx.restore();
      ctx.save();
      ctx.globalAlpha = 0.75;
      drawLabel(ctx, { text: 'EMF(t)', x: scopeX, y: 12, font: '10px "JetBrains Mono", monospace', baseline: 'top' });
      ctx.restore();
      drawLabel(ctx, { text: `peak = ${fmtVoltage(peak)}`, x: scopeX + scopeW, y: 12, color: colors.accent });

      ctx.restore();
    },
    [],
    () => ({
      context: {
        scope: [] as { t: number; emf: number }[],
      } as RotatingContext,
    }),
  );

  return (
    <Demo
      figure={figure}
      title="Spinning a coil = generating AC"
      question="Constant rotation, constant field — why is the output a sine wave?"
      caption={
        <>
          A coil of <strong>N = 100</strong> turns and area <strong>A = 100 cm²</strong> spins
          inside a uniform horizontal B field. The right pane is a live oscilloscope of{' '}
          <strong>EMF(t)</strong>. The peak amplitude is exactly
          <strong> NBAω</strong>: scale up any of the four and the trace gets taller.
        </>
      }
      deeperLab={{ slug: 'faraday', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={280} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="B"
          value={B}
          min={0}
          max={2}
          step={0.01}
          format={(v) => v.toFixed(2) + ' T'}
          onChange={setB}
        />
        <MiniSlider
          label="ω"
          value={omega}
          min={0}
          max={200}
          step={1}
          format={(v) => Math.round(v) + ' rad/s'}
          onChange={setOmega}
        />
        <MiniReadout label="EMFₚₖ = NBAω" value={<Num value={computed.peak} />} unit="V" />
        <MiniReadout label="f" value={<Num value={computed.f} />} unit="Hz" />
        <MiniReadout label="Vᵣₘₛ" value={<Num value={computed.Vrms} />} unit="V" />
      </DemoControls>
      <EquationStrip
        leftLabel="Peak amplitude"
        left={
          <InlineMath
            tex={
              `\\varepsilon_{\\text{pk}} \\;=\\; NBA\\omega \\;=\\; ` +
              `(${N_TURNS})(${B.toFixed(2)})(${A_M2})(${omega}) ` +
              `\\;\\approx\\; ${computed.peak.toFixed(2)}\\ \\text{V}`
            }
          />
        }
        rightLabel="AC frequency"
        right={
          <InlineMath
            tex={
              `f \\;=\\; \\dfrac{\\omega}{2\\pi} \\;\\approx\\; ${computed.f.toFixed(2)}\\ \\text{Hz}`
            }
          />
        }
      />
    </Demo>
  );
}
