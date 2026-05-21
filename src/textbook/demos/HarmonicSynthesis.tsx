/**
 * Demo 15.1 — Harmonic synthesis
 *
 * Build a square, triangle, or sawtooth wave by adding sine harmonics one at
 * a time. Reader chooses target waveform and number of harmonics N. The
 * partial sum is overlaid against the ideal target so the convergence — and
 * the Gibbs overshoot near discontinuities — is visible.
 */
import { useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider, MiniToggle } from '@/components/Demo';
import { drawAxes, drawHLine, drawLinePlot } from '@/lib/drawPlot';
import { getCanvasColors } from '@/lib/canvasTheme';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';
import { drawLabel } from "@/lib/canvasLayout";

interface Coeff {
  n: number;
  amp: number;
}

/** Return the analytic Fourier series coefficients (amplitudes of sin(nωt))
 *  for unit-peak versions of each waveform. Each entry is { harmonic n, amp }.
 */
function coeffs(target: 'square' | 'triangle' | 'sawtooth', N: number): Coeff[] {
  const out: Coeff[] = [];
  for (let n = 1; n <= N; n++) {
    if (target === 'square') {
      // (4/π) Σ sin(nωt)/n  for n = 1, 3, 5, ...
      if (n % 2 === 1) out.push({ n, amp: 4 / (Math.PI * n) });
    } else if (target === 'triangle') {
      // (8/π²) Σ (-1)^((n-1)/2) sin(nωt)/n²  for n = 1, 3, 5, ...
      if (n % 2 === 1) {
        const sign = ((n - 1) / 2) % 2 === 0 ? 1 : -1;
        out.push({ n, amp: ((8 / (Math.PI * Math.PI)) * sign) / (n * n) });
      }
    } else {
      // sawtooth: (2/π) Σ (-1)^(n+1) sin(nωt)/n
      const sign = (n + 1) % 2 === 0 ? -1 : 1;
      out.push({ n, amp: ((2 / Math.PI) * sign) / n });
    }
  }
  return out;
}

/** Ideal target waveform value at phase ωt in [0, 2π). Unit peak amplitude. */
function ideal(target: 'square' | 'triangle' | 'sawtooth', phase: number): number {
  const t = ((phase % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  if (target === 'square') return t < Math.PI ? 1 : -1;
  if (target === 'triangle') {
    // 0 at 0, 1 at π/2, 0 at π, -1 at 3π/2
    if (t < Math.PI / 2) return t / (Math.PI / 2);
    if (t < (3 * Math.PI) / 2) return 1 - (t - Math.PI / 2) / (Math.PI / 2);
    return -1 + (t - (3 * Math.PI) / 2) / (Math.PI / 2);
  }
  // sawtooth: ramp from +1 at 0 to -1 at 2π (discontinuity wraps)
  return 1 - t / Math.PI;
}

export function HarmonicSynthesisDemo() {
  const [target, setTarget] = useState<'square' | 'triangle' | 'sawtooth'>('square');
  const [N, setN] = useState(7);
  const [showIdeal, setShowIdeal] = useState(true);

  const stateRef = useSimState({ target, N, showIdeal });

  // peak-overshoot for caption: evaluate the partial sum just past a square's
  // discontinuity to get the Gibbs ripple amplitude
  let gibbsPct = 0;
  if (target === 'square') {
    const cs = coeffs('square', N);
    // sample at a small offset past π — near the discontinuity at π
    const samples = 200;
    let peak = 0;
    for (let i = 1; i <= samples; i++) {
      const phase = Math.PI - (i / samples) * 0.6; // approach π from below
      let s = 0;
      for (const c of cs) s += c.amp * Math.sin(c.n * phase);
      if (s > peak) peak = s;
    }
    gibbsPct = (peak - 1) * 100;
  }

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h }) => {
      const { target, N, showIdeal } = stateRef.current;
      const colors = getCanvasColors();

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      const padX = 30;
      const padY = 24;
      const plotW = w - 2 * padX;
      const plotH = h - 2 * padY;
      const rect = { x: padX, y: padY, w: plotW, h: plotH };

      // Axes: x = 0..4π (2 cycles), y = -1.2 .. 1.2
      drawAxes(ctx, rect, {
        xMin: 0,
        xMax: 4 * Math.PI,
        yMin: -1.2,
        yMax: 1.2,
        xTicks: [],
        yTicks: [-1, 0, 1],
      });

      // ±1 reference lines
      drawHLine(ctx, rect, 1, -1.2, 1.2, { color: colors.border, dash: [3, 5], alpha: 0.6 });
      drawHLine(ctx, rect, -1, -1.2, 1.2, { color: colors.border, dash: [3, 5], alpha: 0.6 });

      // y-axis tick labels manually for ±1 and 0
      ctx.fillStyle = colors.textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      const yAt = (v: number) => padY + plotH - ((v + 1.2) / 2.4) * plotH;
      drawLabel(ctx, { text: '+1', x: padX - 6, y: yAt(1), font: '10px "JetBrains Mono", monospace', align: 'right', baseline: 'middle' });
      drawLabel(ctx, { text: '−1', x: padX - 6, y: yAt(-1), font: '10px "JetBrains Mono", monospace', align: 'right', baseline: 'middle' });
      drawLabel(ctx, { text: '0', x: padX - 6, y: yAt(0), font: '10px "JetBrains Mono", monospace', align: 'right', baseline: 'middle' });

      const cs = coeffs(target, N);
      const cycles = 2;
      const N_samples = 600;

      // Plot ideal in dim
      if (showIdeal) {
        const idealPts: Array<{ x: number; y: number }> = [];
        for (let i = 0; i <= N_samples; i++) {
          const x = (i / N_samples) * cycles * 2 * Math.PI;
          idealPts.push({ x, y: ideal(target, x) });
        }
        ctx.save();
        ctx.globalAlpha = 0.45;
        drawLinePlot(ctx, rect, idealPts, 0, 4 * Math.PI, -1.2, 1.2, {
          color: colors.teal,
          lineWidth: 1.2,
        });
        ctx.restore();
      }

      // Plot partial sum (the synthesized wave)
      const sumPts: Array<{ x: number; y: number }> = [];
      for (let i = 0; i <= N_samples; i++) {
        const x = (i / N_samples) * cycles * 2 * Math.PI;
        let y = 0;
        for (const c of cs) y += c.amp * Math.sin(c.n * x);
        sumPts.push({ x, y });
      }
      drawLinePlot(ctx, rect, sumPts, 0, 4 * Math.PI, -1.2, 1.2, {
        color: colors.accent,
        lineWidth: 2,
      });
    },
    [],
  );

  return (
    <Demo
      figure="Fig. 15.1"
      title="Fourier synthesis — build a wave from sines"
      question="How many harmonics does it take to look like a square wave?"
      caption={
        <>
          The partial sum (amber) converges to the ideal target (teal) as N grows. Near a
          discontinuity the partial sum overshoots by about 9% of the jump — the{' '}
          <strong>Gibbs phenomenon</strong>. That overshoot never goes away no matter how many
          harmonics you add; it just gets narrower. For the square wave the overshoot is roughly{' '}
          {gibbsPct.toFixed(1)}% with N = {N}.
        </>
      }
    >
      <AutoResizeCanvas height={280} setup={setup} />
      <DemoControls>
        <MiniToggle
          label="Square"
          checked={target === 'square'}
          onChange={() => setTarget('square')}
        />
        <MiniToggle
          label="Triangle"
          checked={target === 'triangle'}
          onChange={() => setTarget('triangle')}
        />
        <MiniToggle
          label="Sawtooth"
          checked={target === 'sawtooth'}
          onChange={() => setTarget('sawtooth')}
        />
        <MiniSlider
          label="harmonics N"
          value={N}
          min={1}
          max={40}
          step={1}
          format={(v) => v.toFixed(0)}
          onChange={setN}
        />
        <MiniToggle
          label="Show ideal"
          checked={showIdeal}
          onChange={() => setShowIdeal((p) => !p)}
        />
        <MiniReadout label="Gibbs overshoot" value={gibbsPct.toFixed(1)} unit="%" />
      </DemoControls>
    </Demo>
  );
}
