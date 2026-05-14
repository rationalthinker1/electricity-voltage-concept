/**
 * Demo D17.4 — Synchronising a generator to the grid
 *
 * Two sinusoids plotted on the same axis:
 *   • Grid:       V_grid = V cos(2π · 60 · t)
 *   • Generator:  V_gen  = V_g cos(2π · f_gen · t + φ)
 *
 * The user adjusts f_gen and φ to match the grid. When |Δf| and |Δφ| are
 * both small the "ready to close" indicator turns green; if the breaker
 * closes with significant Δ, a large transient surge current is drawn,
 * shown as a red flash.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';

interface Props { figure?: string }

const F_GRID = 60;       // Hz
const V_GRID = 1;        // normalised peak

export function GridSyncDemo({ figure }: Props) {
  const [fGen, setFGen] = useState(60.5);
  const [phiDeg, setPhiDeg] = useState(30);
  const [vGen, setVGen] = useState(1.0);

  const stateRef = useRef({ fGen, phiDeg, vGen });
  useEffect(() => { stateRef.current = { fGen, phiDeg, vGen }; }, [fGen, phiDeg, vGen]);

  const ready = useMemo(() => {
    const dF = Math.abs(fGen - F_GRID);
    const dPhi = Math.abs(phiDeg) % 360;
    const dPhiMin = Math.min(dPhi, 360 - dPhi);
    const dV = Math.abs(vGen - V_GRID);
    // Industrial practice: |Δf| < 0.2 Hz, |Δφ| < ~10°, |ΔV| < 5%
    return dF < 0.2 && dPhiMin < 10 && dV < 0.05;
  }, [fGen, phiDeg, vGen]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, colors } = info;
    let raf = 0;
    let simT = 0;
    let lastT = performance.now();

    function draw() {
      const { fGen, phiDeg, vGen } = stateRef.current;
      const now = performance.now();
      let dt = (now - lastT) / 1000;
      lastT = now;
      if (dt > 0.1) dt = 0.1;
      // slow real-time playback so we can see ~60 Hz
      simT += dt * 0.06;

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      const padL = 50, padR = 30, padT = 30, padB = 40;
      const plotW = w - padL - padR;
      const plotH = h - padT - padB;
      const cy = padT + plotH / 2;

      ctx.strokeStyle = colors.border;
      ctx.strokeRect(padL, padT, plotW, plotH);
      ctx.beginPath();
      ctx.moveTo(padL, cy); ctx.lineTo(padL + plotW, cy);
      ctx.stroke();

      const tWindow = 0.05;   // 50 ms window
      const samples = 320;
      const phi = (phiDeg * Math.PI) / 180;

      // Grid trace (white)
      ctx.strokeStyle = 'rgba(236,235,229,0.85)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (let i = 0; i <= samples; i++) {
        const t = simT + (i / samples) * tWindow;
        const v = V_GRID * Math.cos(2 * Math.PI * F_GRID * t);
        const x = padL + (i / samples) * plotW;
        const y = cy - (v / Math.max(V_GRID, vGen)) * (plotH / 2) * 0.85;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Generator trace (amber)
      ctx.strokeStyle = ready ? 'rgba(108,197,194,0.95)' : 'rgba(255,107,42,0.9)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (let i = 0; i <= samples; i++) {
        const t = simT + (i / samples) * tWindow;
        const v = vGen * Math.cos(2 * Math.PI * fGen * t + phi);
        const x = padL + (i / samples) * plotW;
        const y = cy - (v / Math.max(V_GRID, vGen)) * (plotH / 2) * 0.85;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Difference (red, shaded)
      ctx.fillStyle = colors.pink;
      ctx.beginPath();
      let started = false;
      for (let i = 0; i <= samples; i++) {
        const t = simT + (i / samples) * tWindow;
        const vG = V_GRID * Math.cos(2 * Math.PI * F_GRID * t);
        const vGen2 = vGen * Math.cos(2 * Math.PI * fGen * t + phi);
        const diff = vG - vGen2;
        const x = padL + (i / samples) * plotW;
        const yDiff = cy - (diff / Math.max(V_GRID, vGen)) * (plotH / 2) * 0.85;
        if (!started) { ctx.moveTo(x, cy); started = true; }
        ctx.lineTo(x, yDiff);
      }
      ctx.lineTo(padL + plotW, cy);
      ctx.closePath();
      ctx.fill();

      // Indicator badge
      ctx.fillStyle = ready ? 'rgba(108,197,194,0.85)' : 'rgba(255,59,110,0.85)';
      ctx.beginPath(); ctx.arc(padL + plotW - 18, padT + 14, 7, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = ready ? '#6cc5c2' : '#ff3b6e';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillText(ready ? 'READY TO CLOSE' : 'NOT SYNCHRONISED', padL + plotW - 30, padT + 14);

      // Legend
      ctx.fillStyle = 'rgba(236,235,229,0.75)';
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText('grid', padL + 6, padT + 14);
      ctx.fillStyle = ready ? '#6cc5c2' : '#ff6b2a';
      ctx.fillText('generator', padL + 40, padT + 14);

      // Δf, Δφ, ΔV readout near bottom
      ctx.fillStyle = colors.textDim;
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      const dPhi = Math.abs(phiDeg) % 360;
      const dPhiMin = Math.min(dPhi, 360 - dPhi);
      ctx.fillText(
        `Δf = ${(fGen - F_GRID).toFixed(2)} Hz   ·   Δφ = ${dPhiMin.toFixed(0)}°   ·   ΔV = ${((vGen - V_GRID) * 100).toFixed(1)}%`,
        padL + plotW / 2, padT + plotH + 26
      );

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 17.4'}
      title="Synchronising a generator to the grid"
      question="Three knobs to set before you can throw the breaker. What are they, and what's the penalty for getting them wrong?"
      caption={<>
        Before a generator can connect to a live grid, three things must match: <strong>frequency</strong>,
        <strong> phase</strong>, and <strong>voltage</strong>. The shaded red area is the instantaneous
        difference — proportional to the transient circulating current the windings would have to absorb at
        breaker close. Get within ~0.2 Hz, ~10°, ~5% and the indicator goes green.
      </>}
    >
      <AutoResizeCanvas height={280} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="f_gen"
          value={fGen} min={59} max={61} step={0.05}
          format={v => v.toFixed(2) + ' Hz'}
          onChange={setFGen}
        />
        <MiniSlider
          label="phase φ"
          value={phiDeg} min={-180} max={180} step={1}
          format={v => v.toFixed(0) + '°'}
          onChange={setPhiDeg}
        />
        <MiniSlider
          label="V_gen"
          value={vGen} min={0.7} max={1.3} step={0.01}
          format={v => v.toFixed(2)}
          onChange={setVGen}
        />
        <MiniReadout label="status" value={ready ? 'in sync' : 'out of sync'} />
      </DemoControls>
    </Demo>
  );
}
