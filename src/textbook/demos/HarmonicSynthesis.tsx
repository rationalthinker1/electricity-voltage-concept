/**
 * Demo 15.1 — Harmonic synthesis
 *
 * Build a square, triangle, or sawtooth wave by adding sine harmonics one at
 * a time. Reader chooses target waveform and number of harmonics N. The
 * partial sum is overlaid against the ideal target so the convergence — and
 * the Gibbs overshoot near discontinuities — is visible.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider, MiniToggle } from '@/components/Demo';

type Target = 'square' | 'triangle' | 'sawtooth';

interface Coeff {
  n: number;
  amp: number;
}

/** Return the analytic Fourier series coefficients (amplitudes of sin(nωt))
 *  for unit-peak versions of each waveform. Each entry is { harmonic n, amp }.
 */
function coeffs(target: Target, N: number): Coeff[] {
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
function ideal(target: Target, phase: number): number {
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
  const [target, setTarget] = useState<Target>('square');
  const [N, setN] = useState(7);
  const [showIdeal, setShowIdeal] = useState(true);

  const stateRef = useRef({ target, N, showIdeal });
  useEffect(() => {
    stateRef.current = { target, N, showIdeal };
  }, [target, N, showIdeal]);

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

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, colors } = info;
    let raf = 0;
    function draw() {
      const { target, N, showIdeal } = stateRef.current;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      const padX = 30;
      const padY = 24;
      const plotW = w - 2 * padX;
      const plotH = h - 2 * padY;
      const midY = padY + plotH / 2;

      // axes
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padX, midY);
      ctx.lineTo(padX + plotW, midY);
      ctx.stroke();
      // ±1 reference lines
      ctx.setLineDash([3, 5]);
      ctx.strokeStyle = colors.border;
      const yPlus = midY - (plotH / 2) * 0.85;
      const yMinus = midY + (plotH / 2) * 0.85;
      ctx.beginPath();
      ctx.moveTo(padX, yPlus);
      ctx.lineTo(padX + plotW, yPlus);
      ctx.moveTo(padX, yMinus);
      ctx.lineTo(padX + plotW, yMinus);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = colors.textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText('+1', padX - 6, yPlus + 4);
      ctx.fillText('−1', padX - 6, yMinus + 4);
      ctx.fillText('0', padX - 6, midY + 4);

      const cs = coeffs(target, N);
      const cycles = 2;
      const N_samples = 600;

      // Plot ideal in dim
      if (showIdeal) {
        ctx.strokeStyle = colors.teal;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        for (let i = 0; i <= N_samples; i++) {
          const x = padX + (i / N_samples) * plotW;
          const phase = (i / N_samples) * cycles * 2 * Math.PI;
          const y = midY - ideal(target, phase) * (plotH / 2) * 0.85;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Plot partial sum (the synthesized wave)
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i <= N_samples; i++) {
        const x = padX + (i / N_samples) * plotW;
        const phase = (i / N_samples) * cycles * 2 * Math.PI;
        let s = 0;
        for (const c of cs) s += c.amp * Math.sin(c.n * phase);
        const y = midY - s * (plotH / 2) * 0.85;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Labels
      ctx.fillStyle = colors.accent;
      ctx.textAlign = 'left';
      ctx.fillText(`partial sum, N = ${N}`, padX + 6, padY + 12);
      if (showIdeal) {
        ctx.fillStyle = colors.teal;
        ctx.fillText('ideal target', padX + 6, padY + 26);
      }

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure="Fig. 15.1"
      title="Harmonic synthesis"
      question="Add sine harmonics one by one — when does the partial sum start to look like the target?"
      caption={
        <>
          The square and sawtooth need infinitely many harmonics to reach their corners; the partial
          sum overshoots the discontinuity by ~9% no matter how high N gets. That stubborn overshoot
          is the Gibbs phenomenon. Triangle waves converge much faster — their coefficients fall as
          1/n², not 1/n.
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
          label="N (harmonics)"
          value={N}
          min={1}
          max={30}
          step={1}
          format={(v) => v.toFixed(0)}
          onChange={(v) => setN(Math.round(v))}
        />
        <MiniToggle label="Show ideal" checked={showIdeal} onChange={setShowIdeal} />
        {target === 'square' && (
          <MiniReadout label="Gibbs overshoot" value={gibbsPct.toFixed(1)} unit="%" />
        )}
      </DemoControls>
    </Demo>
  );
}
