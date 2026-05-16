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
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';

interface Props {
  figure?: string;
}

const Vpk = 1;
const TAU3 = (2 * Math.PI) / 3;

export function SynchronousGeneratorDemo({ figure }: Props) {
  const [f, setF] = useState(60); // line frequency (Hz)

  const stateRef = useRef({ f });
  useEffect(() => {
    stateRef.current.f = f;
  }, [f]);
  const Vrms = Vpk / Math.sqrt(2);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, colors } = info;
    let raf = 0;
    let simT = 0;
    let lastT = performance.now();
    const scope: { t: number; a: number; b: number; c: number }[] = [];
    const SCOPE_DURATION = 0.06;

    function draw() {
      const { f } = stateRef.current;
      const now = performance.now();
      let dt = (now - lastT) / 1000;
      lastT = now;
      if (dt > 0.1) dt = 0.1;
      // slow visual time at high f so we can see waves
      const slow = f > 60 ? 60 / f : 1;
      simT += dt * slow;

      const omega = 2 * Math.PI * f;
      const phase = omega * simT;
      const va = Vpk * Math.cos(phase);
      const vb = Vpk * Math.cos(phase - TAU3);
      const vc = Vpk * Math.cos(phase - 2 * TAU3);
      scope.push({ t: simT, a: va, b: vb, c: vc });
      const tCut = simT - SCOPE_DURATION;
      while (scope.length && scope[0].t < tCut) scope.shift();

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
      const phaseColors = ['#ff3b6e', '#6cc5c2', '#ff6b2a'];
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
        const grd = ctx.createRadialGradient(sx, sy, 0, sx, sy, 28);
        grd.addColorStop(
          0,
          phaseColors[k] +
            Math.floor(v * 180)
              .toString(16)
              .padStart(2, '0'),
        );
        grd.addColorStop(1, phaseColors[k] + '00');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(sx, sy, 28, 0, Math.PI * 2);
        ctx.fill();
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
      ctx.fillText('N', nx, ny);
      ctx.fillText('S', sxx, syy);
      ctx.lineCap = 'butt';

      ctx.fillStyle = colors.textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('rotor (PM or DC-excited)', 8, 8);
      ctx.fillText('3 stator coils @ 120°', 8, 22);
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
        for (let i = 0; i < scope.length; i++) {
          const p = scope[i];
          const x = scopeX + ((p.t - tCut) / SCOPE_DURATION) * scopeW;
          const yv = p[traces[k]];
          const y = cyS - (yv / Vpk) * (scopeH / 2) * 0.85;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = phaseColors[0];
      ctx.fillText('V_A', scopeX + 4, scopeY + 12);
      ctx.fillStyle = phaseColors[1];
      ctx.fillText('V_B', scopeX + 38, scopeY + 12);
      ctx.fillStyle = phaseColors[2];
      ctx.fillText('V_C', scopeX + 72, scopeY + 12);
      ctx.fillStyle = colors.textDim;
      ctx.textAlign = 'right';
      ctx.fillText(`${f.toFixed(0)} Hz`, scopeX + scopeW - 4, scopeY + 12);
      ctx.restore();

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 17.2'}
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
    </Demo>
  );
}
