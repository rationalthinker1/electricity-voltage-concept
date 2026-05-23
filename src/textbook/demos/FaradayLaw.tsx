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
import { useEffect, useRef, useState } from 'react';
import { withAlpha } from '@/lib/canvasTheme';
import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, EquationStrip, MiniReadout, MiniSlider } from '@/components/Demo';
import { InlineMath } from '@/components/Formula';
import { Num } from '@/components/Num';
import { drawLabel } from "@/lib/canvasLayout";
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

interface Props {
  figure?: string;
}

export function FaradayLawDemo({ figure }: Props) {
  const [B0_mT, setB0_mT] = useState(50); // peak flux density, mT
  const [freq, setFreq] = useState(1.2); // Hz
  const [area_cm2, setAreaCm2] = useState(40); // loop area, cm²

  const stateRef = useSimState({ B0_mT, freq, area_cm2 });

  // Live readout — updated from the draw loop
  const emfRef = useRef(0);
  const [emfNow, setEmfNow] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setEmfNow(emfRef.current), 100);
    return () => window.clearInterval(id);
  }, []);

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, colors }, _state, dt, simTime, ctx0) => {
      const { B0_mT, freq, area_cm2 } = stateRef.current;
      const t = simTime;
      const B0 = B0_mT * 1e-3; // T
      const A = area_cm2 * 1e-4; // m²
      const omega = 2 * Math.PI * freq;
      const phi = B0 * A * Math.sin(omega * t);
      const emf = -B0 * A * omega * Math.cos(omega * t);
      emfRef.current = emf;

      // Throttle buffer at ~60Hz
      ctx0.accum += dt;
      if (ctx0.accum > 0.014) {
        ctx0.phiBuf[ctx0.head] = phi;
        ctx0.emfBuf[ctx0.head] = emf;
        ctx0.head = (ctx0.head + 1) % ctx0.N;
        ctx0.accum = 0;
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
      ctx.fillStyle = withAlpha(colors.teal, 0.25 + Math.min(0.6, (Math.abs(phi) / (B0 * A + 1e-12)) * 0.6));
      ctx.font = '14px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const cols = Math.ceil(Math.sqrt(symCount));
      for (let i = 0; i < symCount; i++) {
        const cc = i % cols,
          rr = Math.floor(i / cols);
        const sx = loopCx - loopR * 0.6 + cc * ((loopR * 1.2) / Math.max(1, cols - 1));
        const sy = loopCy - loopR * 0.5 + rr * (loopR / Math.max(1, cols - 1));
        // skip if outside circle
        if (Math.hypot(sx - loopCx, sy - loopCy) > loopR - 8) continue;
        ctx.fillText(sym, sx, sy);
      }

      // The wire loop itself
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(loopCx, loopCy, loopR, 0, Math.PI * 2);
      ctx.stroke();

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
        const arrowAlpha = 0.4 + 0.55 * Math.min(1, Math.abs(emf) / 0.05);
        ctx.strokeStyle = withAlpha(colors.accent, arrowAlpha);
        ctx.fillStyle = withAlpha(colors.accent, arrowAlpha);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x - (tx * L) / 2, y - (ty * L) / 2);
        ctx.lineTo(x + (tx * L) / 2, y + (ty * L) / 2);
        ctx.stroke();
        // arrowhead
        const hx = x + (tx * L) / 2;
        const hy = y + (ty * L) / 2;
        const nx = -ty,
          ny = tx;
        ctx.beginPath();
        ctx.moveTo(hx, hy);
        ctx.lineTo(hx - tx * 4 + nx * 2.5, hy - ty * 4 + ny * 2.5);
        ctx.lineTo(hx - tx * 4 - nx * 2.5, hy - ty * 4 - ny * 2.5);
        ctx.closePath();
        ctx.fill();
      }

      // Labels
      drawLabel(ctx, { text: `B(t) = B₀ sin(ωt) through loop`, x: loopCx, y: loopCy + loopR + 14, font: '10px "JetBrains Mono", monospace', align: 'center', baseline: 'top' });

      // Right panel: oscilloscope
      const oscX = leftW + 16;
      const oscW = w - oscX - 16;
      const oscY = 16;
      const oscH = h - 32;
      ctx.fillStyle = colors.canvasBg;
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.fillRect(oscX, oscY, oscW, oscH);
      ctx.strokeRect(oscX, oscY, oscW, oscH);

      // Centerline
      const cyOsc = oscY + oscH / 2;
      ctx.save();
      ctx.globalAlpha = 0.1;
      ctx.strokeStyle = colors.text;
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(oscX, cyOsc);
      ctx.lineTo(oscX + oscW, cyOsc);
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
        for (let i = 0; i < ctx0.N; i++) {
          const idx = (ctx0.head + i) % ctx0.N;
          const x = oscX + (i / (ctx0.N - 1)) * oscW;
          const y = cyOsc - buf[idx] * scale;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      plotTrace(ctx0.phiBuf, phiScale, withAlpha(colors.teal, 0.9)); // teal: Φ_B
      plotTrace(ctx0.emfBuf, emfScale, withAlpha(colors.accent, 0.95)); // amber: EMF

      // Legend
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textBaseline = 'top';
      ctx.textAlign = 'left';
      ctx.restore();
      drawLabel(ctx, { text: 'Φ_B  (teal)', x: oscX + 10, y: oscY + 8, color: colors.teal });
      drawLabel(ctx, { text: 'EMF = −dΦ/dt  (amber)', x: oscX + 10, y: oscY + 22, color: colors.accent });
    },
    [],
    () => {
      const N = 240;
      return {
        context: {
          N,
          phiBuf: new Float32Array(N),
          emfBuf: new Float32Array(N),
          head: 0,
          accum: 0,
        },
      };
    },
  );

  return (
    <Demo
      figure={figure ?? 'Fig. 10.3'}
      title="Faraday's law"
      question="When B changes through a loop, what appears around the loop?"
      caption={
        <>
          Flux through the loop oscillates sinusoidally; the induced EMF is its negative time
          derivative — a cosine, 90° out of phase. The minus sign is Lenz's law: the induced current
          direction (arrowheads around the loop) flips to oppose whichever way the flux is changing.
        </>
      }
      deeperLab={{ slug: 'faraday', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="B₀"
          value={B0_mT}
          min={1}
          max={200}
          step={1}
          format={(v) => v.toFixed(0) + ' mT'}
          onChange={setB0_mT}
        />
        <MiniSlider
          label="freq"
          value={freq}
          min={0.1}
          max={4}
          step={0.05}
          format={(v) => v.toFixed(2) + ' Hz'}
          onChange={setFreq}
        />
        <MiniSlider
          label="area"
          value={area_cm2}
          min={1}
          max={200}
          step={1}
          format={(v) => v.toFixed(0) + ' cm²'}
          onChange={setAreaCm2}
        />
        <MiniReadout label="EMF (instant.)" value={<Num value={emfNow} digits={2} />} unit="V" />
      </DemoControls>
      <EquationStrip
        leftLabel="Faraday's law"
        left={
          <InlineMath
            tex={`\\text{EMF} \\;=\\; -\\dfrac{d\\Phi_B}{dt}`}
          />
        }
        rightLabel="Live substitution"
        right={
          <InlineMath
            tex={
              `-(${B0_mT.toFixed(0)}\\times10^{-3})(${area_cm2.toFixed(0)}\\times10^{-4})(2\\pi\\cdot${freq.toFixed(2)})\\cos(\\omega t) ` +
              `\\;=\\; ${emfNow.toFixed(3)}\\ \\text{V}`
            }
          />
        }
      />
    </Demo>
  );
}
