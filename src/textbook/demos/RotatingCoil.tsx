/**
 * Demo D5.2 — Rotating coil = AC generator
 *
 * Adapted from src/labs/FaradayLab.tsx, simplified for inline use.
 * Left half: coil rotating in a uniform horizontal B field.
 * Right half: oscilloscope plot of EMF(t) sweeping right→left.
 * Sliders: ω, B; readouts: peak EMF, frequency, V_rms.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { drawGlowPath } from '@/lib/canvasPrimitives';
import { Num } from '@/components/Num';
import { pretty } from '@/lib/physics';

interface Props { figure?: string }

const N_TURNS = 100;
const A_M2 = 0.01;  // 100 cm² fixed area for the inline demo

export function RotatingCoilDemo({ figure }: Props) {
  const [B, setB] = useState(0.5);        // T
  const [omega, setOmega] = useState(60); // rad/s

  const stateRef = useRef({ B, omega });
  useEffect(() => { stateRef.current = { B, omega }; }, [B, omega]);

  const computed = useMemo(() => {
    const peak = N_TURNS * B * A_M2 * omega;
    const f = omega / (2 * Math.PI);
    const Vrms = peak / Math.sqrt(2);
    return { peak, f, Vrms };
  }, [B, omega]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, colors } = info;
    let raf = 0;
    let simT = 0;
    let lastRealT = performance.now();
    const scope: { t: number; emf: number }[] = [];
    const SCOPE_DURATION = 0.2;

    function draw() {
      const { B, omega } = stateRef.current;
      const peak = N_TURNS * B * A_M2 * omega;

      const now = performance.now();
      let dt = (now - lastRealT) / 1000;
      lastRealT = now;
      if (dt > 0.1) dt = 0.1;
      const visualOmega = Math.min(omega, 3.0);
      simT += dt;

      const emf = N_TURNS * B * A_M2 * omega * Math.sin(omega * simT);

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      const splitX = w * 0.42;

      // LEFT — coil
      ctx.save();
      ctx.beginPath(); ctx.rect(0, 0, splitX, h); ctx.clip();

      // B field rows
      if (B > 0.005) {
        const op = Math.min(0.4, 0.1 + B * 0.2);
        ctx.strokeStyle = `rgba(108,197,194,${op})`;
        ctx.fillStyle = `rgba(108,197,194,${op})`;
        ctx.lineWidth = 1;
        const rows = 6;
        for (let i = 0; i < rows; i++) {
          const y = ((i + 0.5) * h) / rows;
          ctx.beginPath();
          ctx.moveTo(14, y); ctx.lineTo(splitX - 18, y); ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(splitX - 18, y);
          ctx.lineTo(splitX - 24, y - 4);
          ctx.lineTo(splitX - 24, y + 4);
          ctx.closePath(); ctx.fill();
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
      ctx.beginPath(); ctx.moveTo(coilCx, 18); ctx.lineTo(coilCx, h - 18); ctx.stroke();
      ctx.setLineDash([]);

      // coil rectangle
      ctx.strokeStyle = `rgba(255,107,42,${0.45 + 0.4 * Math.abs(Math.sin(angle))})`;
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
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(coilCx, coilCy);
      ctx.lineTo(coilCx + projNx, coilCy + projNy);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText('n̂', coilCx + projNx + 4, coilCy + projNy);

      ctx.fillStyle = colors.teal;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText(`B → ${B.toFixed(2)} T`, 12, 12);

      ctx.restore();

      // divider
      ctx.strokeStyle = colors.border;
      ctx.beginPath();
      ctx.moveTo(splitX, 0); ctx.lineTo(splitX, h); ctx.stroke();

      // RIGHT — scope
      ctx.save();
      ctx.beginPath(); ctx.rect(splitX, 0, w - splitX, h); ctx.clip();

      const scopeX = splitX + 30;
      const scopeW = w - splitX - 50;
      const scopeCy = h / 2;
      const scopeH = h * 0.66;

      scope.push({ t: simT, emf });
      const tCut = simT - SCOPE_DURATION;
      while (scope.length && scope[0].t < tCut) scope.shift();

      const yScale = Math.max(peak, 0.01);

      // grid
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = scopeCy - scopeH / 2 + (i * scopeH) / 4;
        ctx.beginPath(); ctx.moveTo(scopeX, y); ctx.lineTo(scopeX + scopeW, y); ctx.stroke();
      }
      // zero line
      ctx.strokeStyle = colors.borderStrong;
      ctx.beginPath();
      ctx.moveTo(scopeX, scopeCy); ctx.lineTo(scopeX + scopeW, scopeCy); ctx.stroke();

      // peak guides
      ctx.strokeStyle = 'rgba(255,107,42,0.35)';
      ctx.setLineDash([4, 4]);
      const peakY = scopeCy - (scopeH / 2) * 0.9;
      const peakYn = scopeCy + (scopeH / 2) * 0.9;
      ctx.beginPath();
      ctx.moveTo(scopeX, peakY); ctx.lineTo(scopeX + scopeW, peakY);
      ctx.moveTo(scopeX, peakYn); ctx.lineTo(scopeX + scopeW, peakYn);
      ctx.stroke();
      ctx.setLineDash([]);

      // trace
      if (scope.length > 2) {
        const tracePts: { x: number; y: number }[] = [];
        for (let i = 0; i < scope.length; i++) {
          const s = scope[i];
          tracePts.push({
            x: scopeX + ((s.t - tCut) / SCOPE_DURATION) * scopeW,
            y: scopeCy - (s.emf / yScale) * (scopeH / 2) * 0.9,
          });
        }
        drawGlowPath(ctx, tracePts, {
          color: 'rgba(255,59,110,0.95)',
          lineWidth: 1.6,
          glowColor: 'rgba(255,59,110,0.4)',
          glowWidth: 6,
        });
      }

      ctx.fillStyle = 'rgba(160,158,149,0.75)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText('EMF(t)', scopeX, 12);
      ctx.textAlign = 'right';
      ctx.fillStyle = colors.accent;
      ctx.fillText(`peak = ${pretty(peak)} V`, scopeX + scopeW, 12);

      ctx.restore();

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 5.3'}
      title="Spinning a coil = generating AC"
      question="Constant rotation, constant field — why is the output a sine wave?"
      caption={<>
        A coil of <strong>N = 100</strong> turns and area <strong>A = 100 cm²</strong> spins inside a uniform horizontal
        B field. The right pane is a live oscilloscope of <strong>EMF(t)</strong>. The peak amplitude is exactly
        <strong> NBAω</strong>: scale up any of the four and the trace gets taller.
      </>}
      deeperLab={{ slug: 'faraday', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={280} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="B"
          value={B} min={0} max={2} step={0.01}
          format={v => v.toFixed(2) + ' T'}
          onChange={setB}
        />
        <MiniSlider
          label="ω"
          value={omega} min={0} max={200} step={1}
          format={v => Math.round(v) + ' rad/s'}
          onChange={setOmega}
        />
        <MiniReadout label="EMFₚₖ = NBAω" value={<Num value={computed.peak} />} unit="V" />
        <MiniReadout label="f" value={<Num value={computed.f} />} unit="Hz" />
        <MiniReadout label="Vᵣₘₛ" value={<Num value={computed.Vrms} />} unit="V" />
      </DemoControls>
    </Demo>
  );
}
