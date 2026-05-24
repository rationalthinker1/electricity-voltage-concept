/**
 * Demo 15.2 — Fourier spectrum
 *
 * Pick a periodic waveform; see its harmonic spectrum as a bar chart of
 * amplitudes at f, 2f, 3f, ... 20f. Sine has one bar; square has only odd
 * bars at 4/(πn); triangle is odd bars at 8/(π²n²); sawtooth has all bars
 * at 2/(πn); half- and full-wave rectified sines have characteristic
 * even-harmonic spectra.
 */
import { useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniToggle } from '@/components/Demo';
import { drawLabel } from '@/lib/canvasLayout';
import { drawAxes, drawBarChart, drawLinePlot } from '@/lib/drawPlot';
import { getCanvasColors, withAlpha } from '@/lib/canvasTheme';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

type Wave = 'sine' | 'square' | 'triangle' | 'sawtooth' | 'half-rect' | 'full-rect';

interface Props {
  figure: string;
}

interface Bar {
  n: number;
  amp: number;
}

/** Coefficients of the trigonometric series for each named waveform, up to
 *  harmonic N. Returns |b_n| or |a_n| (whichever is non-zero), normalised so
 *  the fundamental of a unit-peak sine is 1. The DC term is reported at n=0
 *  when it is non-zero (rectified sines). */
function spectrum(wave: Wave, N: number): Bar[] {
  const out: Bar[] = [];
  if (wave === 'sine') {
    out.push({ n: 1, amp: 1 });
    return out;
  }
  if (wave === 'square') {
    for (let n = 1; n <= N; n++) {
      if (n % 2 === 1) out.push({ n, amp: 4 / (Math.PI * n) });
    }
    return out;
  }
  if (wave === 'triangle') {
    for (let n = 1; n <= N; n++) {
      if (n % 2 === 1) out.push({ n, amp: 8 / (Math.PI * Math.PI * n * n) });
    }
    return out;
  }
  if (wave === 'sawtooth') {
    for (let n = 1; n <= N; n++) out.push({ n, amp: 2 / (Math.PI * n) });
    return out;
  }
  if (wave === 'half-rect') {
    // DC = 1/π, fundamental = 1/2 (peak), even harmonics: 2/(π(n²-1)) for even n
    out.push({ n: 0, amp: 1 / Math.PI });
    out.push({ n: 1, amp: 0.5 });
    for (let n = 2; n <= N; n++) {
      if (n % 2 === 0) out.push({ n, amp: 2 / (Math.PI * (n * n - 1)) });
    }
    return out;
  }
  // full-rect: DC = 2/π, even harmonics 4/(π(n²-1)) starting at n=2
  out.push({ n: 0, amp: 2 / Math.PI });
  for (let n = 2; n <= N; n++) {
    if (n % 2 === 0) out.push({ n, amp: 4 / (Math.PI * (n * n - 1)) });
  }
  return out;
}

/** Time-domain shape of each wave on phase 0..2π, unit peak. */
function timeDomain(wave: Wave, phase: number): number {
  const t = ((phase % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  switch (wave) {
    case 'sine':
      return Math.sin(t);
    case 'square':
      return t < Math.PI ? 1 : -1;
    case 'sawtooth':
      return 1 - t / Math.PI;
    case 'triangle': {
      if (t < Math.PI / 2) return t / (Math.PI / 2);
      if (t < (3 * Math.PI) / 2) return 1 - (t - Math.PI / 2) / (Math.PI / 2);
      return -1 + (t - (3 * Math.PI) / 2) / (Math.PI / 2);
    }
    case 'half-rect':
      return Math.max(0, Math.sin(t));
    case 'full-rect':
      return Math.abs(Math.sin(t));
  }
}

export function FourierSpectrumDemo({ figure }: Props) {
  const [wave, setWave] = useState<Wave>('square');
  const stateRef = useSimState({ wave });

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h }) => {
      const { wave } = stateRef.current;
      const colors = getCanvasColors();

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      // Two panels stacked: top time-domain, bottom spectrum
      const split = h * 0.42;
      const padX = 36;

      // Top: time domain
      const tH = split - 16;
      const tMid = 8 + tH / 2;
      const tRect = { x: padX, y: 8, w: w - 2 * padX, h: tH };

      ctx.strokeStyle = colors.border;
      ctx.beginPath();
      ctx.moveTo(padX, tMid);
      ctx.lineTo(w - padX, tMid);
      ctx.stroke();
      ctx.save();
      ctx.globalAlpha = 0.6;
      drawLabel(ctx, {
        x: w - padX - 4,
        y: tMid + 12,
        text: 'time →',
        color: colors.textDim,
        size: 9,
        align: 'right',
      });
      ctx.restore();

      const samples = 400;
      const cycles = 2;
      const timePts: Array<{ x: number; y: number }> = [];
      for (let i = 0; i <= samples; i++) {
        const x = (i / samples) * cycles * 2 * Math.PI;
        timePts.push({ x, y: timeDomain(wave, x) });
      }
      drawLinePlot(ctx, tRect, timePts, 0, cycles * 2 * Math.PI, -1.2, 1.2, {
        color: colors.accent,
        lineWidth: 2,
      });

      // Bottom: spectrum bar chart
      const bRect = { x: padX, y: split + 4, w: w - 2 * padX, h: h - split - 32 };
      const bars = spectrum(wave, 20);
      const nMax = 20;
      const maxAmp = Math.max(...bars.map((b) => b.amp), 0.01);

      drawAxes(ctx, bRect, {
        xMin: 0,
        xMax: nMax,
        yMin: 0,
        yMax: maxAmp * 1.1,
        xTicks: Array.from({ length: 11 }, (_, i) => i * 2),
        yTicks: [],
      });

      // Custom x-axis labels: DC for 0, numbers for rest
      ctx.fillStyle = colors.textDim;
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      for (let n = 0; n <= nMax; n += 2) {
        const x = bRect.x + (n / nMax) * bRect.w;
        ctx.fillText(n === 0 ? 'DC' : n.toString(), x, bRect.y + bRect.h + 4);
      }

      // Build bar data for drawBarChart
      const barData = Array.from({ length: nMax + 1 }, (_, n) => {
        const b = bars.find((b) => b.n === n);
        return {
          value: b?.amp ?? 0,
          label: b && b.amp / maxAmp > 0.08 ? b.amp.toFixed(2) : undefined,
        };
      });

      // Per-bar colors: DC = teal, rest = accent
      const barColors = Array.from({ length: nMax + 1 }, (_, n) =>
        n === 0 ? withAlpha(colors.teal, 0.85) : colors.accent,
      );

      drawBarChart(ctx, bRect, barData, 0, maxAmp * 1.1, {
        barColors,
        barWidth: 14,
        gap: 2,
        skipZero: true,
      });

      // Y-axis label
      drawLabel(ctx, {
        x: w - padX - 4,
        y: bRect.y,
        text: 'amplitude →',
        color: colors.textDim,
        size: 9,
        align: 'right',
        baseline: 'top',
      });
    },
    [],
  );

  return (
    <Demo
      figure={figure}
      title="Spectrum of a periodic wave"
      question="What harmonics are inside each of these waveforms?"
      caption={
        <>
          A sine has one bar at f. A square and a sawtooth have peaks at every harmonic (or every
          odd one), with amplitudes falling as 1/n. A triangle's amplitudes fall as 1/n², so it
          converges faster and sounds &ldquo;softer&rdquo;. A half- or full-rectified sine — what a
          diode bridge produces — has a DC term plus only even harmonics: the basis of every linear
          power supply.
        </>
      }
      deeperLab={{ slug: 'fourier-series', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={320} setup={setup} />
      <DemoControls>
        <MiniToggle label="Sine" checked={wave === 'sine'} onChange={() => setWave('sine')} />
        <MiniToggle label="Square" checked={wave === 'square'} onChange={() => setWave('square')} />
        <MiniToggle
          label="Triangle"
          checked={wave === 'triangle'}
          onChange={() => setWave('triangle')}
        />
        <MiniToggle
          label="Sawtooth"
          checked={wave === 'sawtooth'}
          onChange={() => setWave('sawtooth')}
        />
        <MiniToggle
          label="Half-rect"
          checked={wave === 'half-rect'}
          onChange={() => setWave('half-rect')}
        />
        <MiniToggle
          label="Full-rect"
          checked={wave === 'full-rect'}
          onChange={() => setWave('full-rect')}
        />
      </DemoControls>
    </Demo>
  );
}
