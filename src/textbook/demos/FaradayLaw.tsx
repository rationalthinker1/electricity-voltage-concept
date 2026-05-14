/**
 * Demo D8.3 — Faraday's law
 *
 * A wire loop on the left with a magnetic flux through it that varies as
 * Φ_B(t) = B₀ A sin(ω t). The induced EMF, by Faraday, is
 * EMF = −dΦ_B/dt = −B₀ A ω cos(ω t).
 *
 * On the right: a small oscilloscope trace showing Φ_B (teal) and the induced
 * EMF (amber) overlaid in real time. The 90° phase shift is visible at a
 * glance; sign matches Lenz (the induced current opposes the change).
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';

interface Props { figure?: string }

export function FaradayLawDemo({ figure }: Props) {
  const [B0_mT, setB0_mT] = useState(50);   // peak flux density, mT
  const [freq, setFreq] = useState(1.2);    // Hz
  const [area_cm2, setAreaCm2] = useState(40); // loop area, cm²

  const stateRef = useRef({ B0_mT, freq, area_cm2 });
  useEffect(() => { stateRef.current = { B0_mT, freq, area_cm2 }; }, [B0_mT, freq, area_cm2]);

  // Live readout — updated from the draw loop
  const emfRef = useRef(0);
  const [emfNow, setEmfNow] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setEmfNow(emfRef.current), 100);
    return () => window.clearInterval(id);
  }, []);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, colors } = info;
    let raf = 0;
    const t0 = performance.now();
    // Ring buffers for the trace
    const N = 240;
    const phiBuf = new Float32Array(N);
    const emfBuf = new Float32Array(N);
    let head = 0;
    let lastT = 0;

    function draw(now: number) {
      const t = (now - t0) / 1000;
      const { B0_mT, freq, area_cm2 } = stateRef.current;
      const B0 = B0_mT * 1e-3;        // T
      const A = area_cm2 * 1e-4;      // m²
      const omega = 2 * Math.PI * freq;
      const phi = B0 * A * Math.sin(omega * t);
      const emf = -B0 * A * omega * Math.cos(omega * t);
      emfRef.current = emf;

      // Throttle buffer at ~60Hz
      if (now - lastT > 14) {
        phiBuf[head] = phi;
        emfBuf[head] = emf;
        head = (head + 1) % N;
        lastT = now;
      }

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      // Left panel: the loop + flux
      const leftW = Math.min(w * 0.45, 360);
      const loopCx = leftW / 2;
      const loopCy = h / 2;
      const loopR = Math.min(80, leftW / 3);

      // Flux indicator: × or · symbols inside the loop, density ∝ |B|
      const intensity = Math.max(0, Math.abs(B0) / 0.1);
      const sym = phi >= 0 ? '⊗' : '⊙';
      const symCount = Math.round(6 + intensity * 8);
      ctx.fillStyle = `rgba(108,197,194,${(0.25 + Math.min(0.6, Math.abs(phi) / (B0 * A + 1e-12) * 0.6)).toFixed(2)})`;
      ctx.font = '14px JetBrains Mono';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const cols = Math.ceil(Math.sqrt(symCount));
      for (let i = 0; i < symCount; i++) {
        const cc = i % cols, rr = Math.floor(i / cols);
        const sx = loopCx - loopR * 0.6 + cc * (loopR * 1.2 / Math.max(1, cols - 1));
        const sy = loopCy - loopR * 0.5 + rr * (loopR / Math.max(1, cols - 1));
        // skip if outside circle
        if (Math.hypot(sx - loopCx, sy - loopCy) > loopR - 8) continue;
        ctx.fillText(sym, sx, sy);
      }

      // The wire loop itself
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(loopCx, loopCy, loopR, 0, Math.PI * 2); ctx.stroke();

      // Induced current direction (arrows around the loop). Direction flips
      // with sign of EMF.
      const dirSign = Math.sign(emf) || 1;
      const arrows = 6;
      for (let i = 0; i < arrows; i++) {
        const theta = (i / arrows) * Math.PI * 2 + 0.1;
        const x = loopCx + loopR * Math.cos(theta);
        const y = loopCy + loopR * Math.sin(theta);
        // tangent direction (CCW × dirSign)
        const tx = -Math.sin(theta) * dirSign;
        const ty = Math.cos(theta) * dirSign;
        const L = 7;
        ctx.strokeStyle = `rgba(255,107,42,${(0.4 + 0.55 * Math.min(1, Math.abs(emf) / 0.05)).toFixed(2)})`;
        ctx.fillStyle = ctx.strokeStyle;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x - tx * L / 2, y - ty * L / 2);
        ctx.lineTo(x + tx * L / 2, y + ty * L / 2);
        ctx.stroke();
        // arrowhead
        const hx = x + tx * L / 2;
        const hy = y + ty * L / 2;
        const nx = -ty, ny = tx;
        ctx.beginPath();
        ctx.moveTo(hx, hy);
        ctx.lineTo(hx - tx * 4 + nx * 2.5, hy - ty * 4 + ny * 2.5);
        ctx.lineTo(hx - tx * 4 - nx * 2.5, hy - ty * 4 - ny * 2.5);
        ctx.closePath();
        ctx.fill();
      }

      // Labels
      ctx.fillStyle = colors.textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText(`B(t) = B₀ sin(ωt) through loop`, loopCx, loopCy + loopR + 14);

      // Right panel: oscilloscope
      const oscX = leftW + 16;
      const oscW = w - oscX - 16;
      const oscY = 16;
      const oscH = h - 32;
      ctx.fillStyle = '#08080a';
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.fillRect(oscX, oscY, oscW, oscH);
      ctx.strokeRect(oscX, oscY, oscW, oscH);

      // Centerline
      const cyOsc = oscY + oscH / 2;
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(oscX, cyOsc); ctx.lineTo(oscX + oscW, cyOsc);
      ctx.stroke();
      ctx.setLineDash([]);

      // Auto-scale traces
      const phiMax = Math.max(1e-12, B0 * A);
      const emfMax = Math.max(1e-9, B0 * A * omega);
      const phiScale = (oscH * 0.4) / phiMax;
      const emfScale = (oscH * 0.4) / emfMax;

      function plotTrace(buf: Float32Array, scale: number, color: string) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        for (let i = 0; i < N; i++) {
          const idx = (head + i) % N;
          const x = oscX + (i / (N - 1)) * oscW;
          const y = cyOsc - buf[idx] * scale;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      plotTrace(phiBuf, phiScale, 'rgba(108,197,194,0.9)');     // teal: Φ_B
      plotTrace(emfBuf, emfScale, 'rgba(255,107,42,0.95)');     // amber: EMF

      // Legend
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textBaseline = 'top';
      ctx.textAlign = 'left';
      ctx.fillStyle = colors.teal;
      ctx.fillText('Φ_B  (teal)', oscX + 10, oscY + 8);
      ctx.fillStyle = colors.accent;
      ctx.fillText('EMF = −dΦ/dt  (amber)', oscX + 10, oscY + 22);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 8.3'}
      title="Faraday's law"
      question="When B changes through a loop, what appears around the loop?"
      caption={<>
        Flux through the loop oscillates sinusoidally; the induced EMF is its negative time derivative — a cosine,
        90° out of phase. The minus sign is Lenz's law: the induced current direction (arrowheads around the loop)
        flips to oppose whichever way the flux is changing.
      </>}
      deeperLab={{ slug: 'faraday', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="B₀"
          value={B0_mT} min={1} max={200} step={1}
          format={v => v.toFixed(0) + ' mT'}
          onChange={setB0_mT}
        />
        <MiniSlider
          label="freq"
          value={freq} min={0.1} max={4} step={0.05}
          format={v => v.toFixed(2) + ' Hz'}
          onChange={setFreq}
        />
        <MiniSlider
          label="area"
          value={area_cm2} min={1} max={200} step={1}
          format={v => v.toFixed(0) + ' cm²'}
          onChange={setAreaCm2}
        />
        <MiniReadout label="EMF (instant.)" value={<Num value={emfNow} digits={2} />} unit="V" />
      </DemoControls>
    </Demo>
  );
}
