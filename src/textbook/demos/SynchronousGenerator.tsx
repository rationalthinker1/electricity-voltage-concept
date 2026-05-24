/**
 * Demo D17.2 — 3-phase synchronous generator
 *
 * Three stator windings 120° apart, a rotor with a permanent-magnet (or
 * wound-field) flux. As the rotor spins, each stator winding sees a
 * sinusoidal flux 120° out of phase with the next, producing three-phase
 * AC at the rotor's mechanical frequency × (pole-pairs).
 *
 * Left: stator cross-section with rotating rotor magnet, three stator
 * coil positions drawn around it. Right: three-trace oscilloscope.
 */
import { useState } from 'react';
import { drawHalo } from '@/lib/canvasPrimitives';
import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, EquationStrip, MiniReadout, MiniSlider } from '@/components/Demo';
import { InlineMath } from '@/components/Formula';
import { Num } from '@/components/Num';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';
import { withAlpha } from '@/lib/canvasTheme';
import { drawLabel } from "@/lib/canvasLayout";

interface Props {
  figure: string;
}

const Vpk = 1;
const TAU3 = (2 * Math.PI) / 3;

interface ScopeSample {
  t: number;
  a: number;
  b: number;
  c: number;
}

export function SynchronousGeneratorDemo({ figure }: Props) {
  const [f, setF] = useState(60); // line frequency (Hz)

  const stateRef = useSimState({ f });
  const Vrms = Vpk / Math.sqrt(2);

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, colors }, _state, dt, _simTime, ctx0) => {
      const { f } = stateRef.current;
      // slow visual time at high f so we can see waves
      const slow = f > 60 ? 60 / f : 1;
      ctx0.simT += dt * slow;
      const simT = ctx0.simT;

      const omega = 2 * Math.PI * f;
      const phase = omega * simT;
      const va = Vpk * Math.cos(phase);
      const vb = Vpk * Math.cos(phase - TAU3);
      const vc = Vpk * Math.cos(phase - 2 * TAU3);
      const SCOPE_DURATION = 0.06;
      ctx0.scope.push({ t: simT, a: va, b: vb, c: vc });
      const tCut = simT - SCOPE_DURATION;
      while (ctx0.scope.length && ctx0.scope[0].t < tCut) ctx0.scope.shift();

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);
      const splitX = w * 0.42;

      // LEFT: cross-section of generator
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, splitX, h);
      ctx.clip();

      const cx = splitX / 2;
      const cy = h / 2;
      const R = Math.min(splitX, h) * 0.36;

      // Stator ring
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(cx, cy, R + 14, 0, Math.PI * 2);
      ctx.stroke();

      // Three stator coil positions at 120° apart
      const phaseColors = [colors.pink, colors.teal, colors.accent];
      const labels = ['A', 'B', 'C'];
      const baseAngles = [Math.PI / 2, Math.PI / 2 - TAU3, Math.PI / 2 - 2 * TAU3];
      // Each coil's instantaneous induced voltage is cos(phase - k·120°)
      const drives = [va, vb, vc];
      for (let k = 0; k < 3; k++) {
        const a = baseAngles[k];
        const sx = cx + Math.cos(a) * R;
        const sy = cy - Math.sin(a) * R;
        // glow proportional to |drive|
        const v = Math.abs(drives[k]);
        drawHalo(ctx, {
          x: sx,
          y: sy,
          radius: 28,
          color: withAlpha(phaseColors[k], Math.min(1, v)),
          alpha: 1,
          extent: 1,
        });
        ctx.strokeStyle = phaseColors[k];
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(sx, sy, 14, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = phaseColors[k];
        ctx.font = 'bold 12px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(labels[k], sx, sy);
      }

      // Rotor (bar magnet, rotates at omega)
      const rotR = R * 0.55;
      const visOmega = Math.min(omega * slow, 2.5);
      const rotorAng = visOmega * simT;
      const rcos = Math.cos(rotorAng);
      const rsin = Math.sin(rotorAng);
      const nx = cx + rcos * rotR;
      const ny = cy - rsin * rotR;
      const sxx = cx - rcos * rotR;
      const syy = cy + rsin * rotR;
      ctx.strokeStyle = colors.borderStrong;
      ctx.lineWidth = 12;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(sxx, syy);
      ctx.lineTo(nx, ny);
      ctx.stroke();
      ctx.fillStyle = colors.pink;
      ctx.beginPath();
      ctx.arc(nx, ny, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = colors.blue;
      ctx.beginPath();
      ctx.arc(sxx, syy, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = colors.bg;
      ctx.font = 'bold 10px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      drawLabel(ctx, { text: 'N', x: nx, y: ny, color: colors.bg, weight: 'bold', font: '10px "JetBrains Mono"', align: 'center', baseline: 'middle' });
      drawLabel(ctx, { text: 'S', x: sxx, y: syy, color: colors.bg, weight: 'bold', font: '10px "JetBrains Mono"', align: 'center', baseline: 'middle' });
      ctx.lineCap = 'butt';

      ctx.fillStyle = colors.textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      drawLabel(ctx, { text: 'rotor (PM or DC-excited)', x: 8, y: 8, font: '10px "JetBrains Mono", monospace', baseline: 'top' });
      drawLabel(ctx, { text: '3 stator coils @ 120°', x: 8, y: 22, font: '10px "JetBrains Mono", monospace', baseline: 'top' });
      ctx.restore();

      // Divider
      ctx.strokeStyle = colors.border;
      ctx.beginPath();
      ctx.moveTo(splitX, 0);
      ctx.lineTo(splitX, h);
      ctx.stroke();

      // RIGHT: scope
      ctx.save();
      ctx.beginPath();
      ctx.rect(splitX, 0, w - splitX, h);
      ctx.clip();
      const scopeX = splitX + 24;
      const scopeW = w - splitX - 36;
      const scopeY = 24;
      const scopeH = h - 48;
      const cyS = scopeY + scopeH / 2;
      // Grid
      ctx.strokeStyle = colors.border;
      ctx.strokeRect(scopeX, scopeY, scopeW, scopeH);
      ctx.beginPath();
      ctx.moveTo(scopeX, cyS);
      ctx.lineTo(scopeX + scopeW, cyS);
      ctx.stroke();

      const traces: Array<'a' | 'b' | 'c'> = ['a', 'b', 'c'];
      for (let k = 0; k < 3; k++) {
        ctx.strokeStyle = phaseColors[k];
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        for (let i = 0; i < ctx0.scope.length; i++) {
          const p = ctx0.scope[i];
          const x = scopeX + ((p.t - tCut) / SCOPE_DURATION) * scopeW;
          const yv = p[traces[k]];
          const y = cyS - (yv / Vpk) * (scopeH / 2) * 0.85;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.font = '10px "JetBrains Mono", monospace';
      drawLabel(ctx, { text: 'V_A', x: scopeX + 4, y: scopeY + 12, color: phaseColors[0], font: '10px "JetBrains Mono", monospace' });
      drawLabel(ctx, { text: 'V_B', x: scopeX + 38, y: scopeY + 12, color: phaseColors[1], font: '10px "JetBrains Mono", monospace' });
      drawLabel(ctx, { text: 'V_C', x: scopeX + 72, y: scopeY + 12, color: phaseColors[2], font: '10px "JetBrains Mono", monospace' });
      drawLabel(ctx, { text: `${f.toFixed(0)} Hz`, x: scopeX + scopeW - 4, y: scopeY + 12, font: '10px "JetBrains Mono", monospace', align: 'right' });
      ctx.restore();
    },
    [],
    () => ({ context: { simT: 0, scope: [] as ScopeSample[] } }),
  );

  return (
    <Demo
      figure={figure}
      title="Three-phase synchronous generator"
      question="One rotor, three coils, 120° apart. What appears on each pair of leads?"
      caption={
        <>
          Three stator windings spaced 120° around a rotating field produce three sinusoids 120°
          apart in phase. Sum them and the instantaneous total is zero — three wires carry all the
          power, no neutral required. This is the topology of essentially every utility generator on
          the planet, from 1 MW gas peakers to 1.3 GW nuclear units.
        </>
      }
      deeperLab={{ slug: 'synchronous-machine', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={320} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="line f"
          value={f}
          min={20}
          max={120}
          step={1}
          format={(v) => v.toFixed(0) + ' Hz'}
          onChange={setF}
        />
        <MiniReadout label="V_pk (norm.)" value={Vpk.toFixed(2)} />
        <MiniReadout label="V_rms = V_pk/√2" value={<Num value={Vrms} digits={3} />} />
        <MiniReadout label="phase offset" value="120°" />
      </DemoControls>
      <EquationStrip
        leftLabel="Three-phase stator voltages"
        left={
          <InlineMath
            tex={`v_{a,b,c}(t) = V_{pk}\\cos\\!\\big(2\\pi f t - k\\cdot 120^{\\circ}\\big)`}
          />
        }
        rightLabel="with current f"
        right={
          <InlineMath
            tex={`f = ${f.toFixed(0)}\\ \\text{Hz},\\ \\ V_{rms} = V_{pk}/\\sqrt{2} \\approx ${Vrms.toFixed(3)}`}
          />
        }
      />
    </Demo>
  );
}
