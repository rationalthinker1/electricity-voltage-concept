/**
 * Demo D17.1 — Rotating coil generator
 *
 * A single coil rotating between two stator magnets. EMF(t) = NBAω·sin(ωt).
 * Left half: coil in field (side view). Right half: oscilloscope of EMF.
 * Slider: ω.
 *
 * Closely mirrors the existing RotatingCoil demo (Ch.7 Induction), but
 * sized and labelled for the generator-chapter narrative.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';

interface Props {
  figure?: string;
}

const N_TURNS = 80;
const A_M2 = 0.02; // 200 cm² coil area
const B_T = 0.5; // T

export function RotatingCoilGeneratorDemo({ figure }: Props) {
  const [omega, setOmega] = useState(80); // rad/s

  const stateRef = useRef({ omega });
  useEffect(() => {
    stateRef.current.omega = omega;
  }, [omega]);

  const computed = useMemo(() => {
    const peak = N_TURNS * B_T * A_M2 * omega;
    const f = omega / (2 * Math.PI);
    const Vrms = peak / Math.sqrt(2);
    return { peak, f, Vrms };
  }, [omega]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, colors } = info;
    let raf = 0;
    let simT = 0;
    let lastT = performance.now();
    const scope: { t: number; emf: number }[] = [];
    const SCOPE_DURATION = 0.2;

    function draw() {
      const { omega } = stateRef.current;
      const peak = N_TURNS * B_T * A_M2 * omega;

      const now = performance.now();
      let dt = (now - lastT) / 1000;
      lastT = now;
      if (dt > 0.1) dt = 0.1;
      simT += dt;

      const visualOmega = Math.min(omega, 2.5);
      const emf = peak * Math.sin(omega * simT);

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);
      const splitX = w * 0.42;

      // LEFT: coil + magnets
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, splitX, h);
      ctx.clip();
      // Magnet poles (vertical stripes left=N, right=S)
      ctx.save();
      ctx.globalAlpha = 0.15;
      ctx.fillStyle = colors.pink;
      ctx.fillRect(8, h * 0.18, 26, h * 0.64);
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = 0.15;
      ctx.fillStyle = colors.blue;
      ctx.fillRect(splitX - 34, h * 0.18, 26, h * 0.64);
      ctx.restore();
      ctx.fillStyle = colors.pink;
      ctx.font = 'bold 12px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('N', 21, h / 2);
      ctx.fillStyle = colors.blue;
      ctx.fillText('S', splitX - 21, h / 2);
      // Field arrows
      ctx.save();
      ctx.globalAlpha = 0.25;
      ctx.strokeStyle = colors.teal;
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = 0.25;
      ctx.fillStyle = colors.teal;
      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        const y = h * 0.22 + (i * (h * 0.56)) / 4;
        ctx.beginPath();
        ctx.moveTo(38, y);
        ctx.lineTo(splitX - 40, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(splitX - 40, y);
        ctx.lineTo(splitX - 46, y - 3);
        ctx.lineTo(splitX - 46, y + 3);
        ctx.closePath();
        ctx.fill();
      }

      // Coil rectangle rotating
      const coilCx = splitX / 2;
      const coilCy = h / 2;
      const coilH = h * 0.55;
      const coilW = splitX * 0.35;
      const ang = visualOmega * simT;
      const visW = coilW * Math.abs(Math.sin(ang));
      ctx.restore();
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 2;
      ctx.strokeRect(coilCx - visW / 2, coilCy - coilH / 2, visW, coilH);
      // Slip rings (two parallel arcs at the shaft)
      ctx.strokeStyle = 'rgba(212,160,80,0.85)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(coilCx, coilCy + coilH / 2 + 14, 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(coilCx, coilCy + coilH / 2 + 28, 6, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = colors.textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(`B = ${B_T} T  ·  N = ${N_TURNS}  ·  A = ${(A_M2 * 1e4).toFixed(0)} cm²`, 8, 8);
      ctx.restore();

      // Divider
      ctx.strokeStyle = colors.border;
      ctx.beginPath();
      ctx.moveTo(splitX, 0);
      ctx.lineTo(splitX, h);
      ctx.stroke();

      // RIGHT: oscilloscope
      ctx.save();
      ctx.beginPath();
      ctx.rect(splitX, 0, w - splitX, h);
      ctx.clip();
      const scopeX = splitX + 30;
      const scopeW = w - splitX - 50;
      const scopeCy = h / 2;
      const scopeH = h * 0.66;
      scope.push({ t: simT, emf });
      const tCut = simT - SCOPE_DURATION;
      while (scope.length && scope[0].t < tCut) scope.shift();
      const yScale = Math.max(peak, 0.01);

      // Grid
      ctx.strokeStyle = colors.border;
      for (let i = 0; i <= 4; i++) {
        const y = scopeCy - scopeH / 2 + (i * scopeH) / 4;
        ctx.beginPath();
        ctx.moveTo(scopeX, y);
        ctx.lineTo(scopeX + scopeW, y);
        ctx.stroke();
      }
      // Zero line
      ctx.strokeStyle = colors.borderStrong;
      ctx.beginPath();
      ctx.moveTo(scopeX, scopeCy);
      ctx.lineTo(scopeX + scopeW, scopeCy);
      ctx.stroke();
      // Peak guides
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.strokeStyle = colors.accent;
      ctx.setLineDash([4, 4]);
      const py1 = scopeCy - (scopeH / 2) * 0.9;
      const py2 = scopeCy + (scopeH / 2) * 0.9;
      ctx.beginPath();
      ctx.moveTo(scopeX, py1);
      ctx.lineTo(scopeX + scopeW, py1);
      ctx.moveTo(scopeX, py2);
      ctx.lineTo(scopeX + scopeW, py2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Trace
      if (scope.length > 2) {
        ctx.strokeStyle = colors.pink;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        for (let i = 0; i < scope.length; i++) {
          const s = scope[i];
          const x = scopeX + ((s.t - tCut) / SCOPE_DURATION) * scopeW;
          const y = scopeCy - (s.emf / yScale) * (scopeH / 2) * 0.9;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.restore();
      ctx.fillStyle = colors.textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('EMF(t)', scopeX, 12);
      ctx.textAlign = 'right';
      ctx.fillStyle = colors.accent;
      ctx.fillText(`peak = ${peak.toFixed(1)} V`, scopeX + scopeW, 12);
      ctx.restore();

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 17.1'}
      title="Rotating coil = simple alternator"
      question="A coil that goes round and round. What's the voltage between its leads?"
      caption={
        <>
          A coil of <strong>N = {N_TURNS}</strong> turns and area{' '}
          <strong>{(A_M2 * 1e4).toFixed(0)} cm²</strong> rotates in a uniform 0.5 T field. The
          voltage between its leads is <em>NBAω sin(ωt)</em> — a clean sine wave whose peak
          amplitude scales with rotation rate. Two slip rings (not a commutator) carry the AC out
          unchanged.
        </>
      }
      deeperLab={{ slug: 'faraday', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={280} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="ω"
          value={omega}
          min={0}
          max={400}
          step={1}
          format={(v) => Math.round(v) + ' rad/s'}
          onChange={setOmega}
        />
        <MiniReadout label="EMFₚₖ" value={<Num value={computed.peak} digits={2} />} unit="V" />
        <MiniReadout label="f" value={<Num value={computed.f} digits={2} />} unit="Hz" />
        <MiniReadout label="Vᵣₘₛ" value={<Num value={computed.Vrms} digits={2} />} unit="V" />
      </DemoControls>
    </Demo>
  );
}
