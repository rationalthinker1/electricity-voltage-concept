/**
 * Demo 15.2 — Fourier spectrum
 *
 * Pick a periodic waveform; see its harmonic spectrum as a bar chart of
 * amplitudes at f, 2f, 3f, ... 20f. Sine has one bar; square has only odd
 * bars at 4/(πn); triangle is odd bars at 8/(π²n²); sawtooth has all bars
 * at 2/(πn); half- and full-wave rectified sines have characteristic
 * even-harmonic spectra.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import {
  Demo, DemoControls, MiniToggle,
} from '@/components/Demo';

type Wave = 'sine' | 'square' | 'triangle' | 'sawtooth' | 'half-rect' | 'full-rect';

interface Bar { n: number; amp: number; }

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
    case 'sine':      return Math.sin(t);
    case 'square':    return t < Math.PI ? 1 : -1;
    case 'sawtooth':  return 1 - t / Math.PI;
    case 'triangle': {
      if (t < Math.PI / 2) return t / (Math.PI / 2);
      if (t < 3 * Math.PI / 2) return 1 - (t - Math.PI / 2) / (Math.PI / 2);
      return -1 + (t - 3 * Math.PI / 2) / (Math.PI / 2);
    }
    case 'half-rect': return Math.max(0, Math.sin(t));
    case 'full-rect': return Math.abs(Math.sin(t));
  }
}

export function FourierSpectrumDemo() {
  const [wave, setWave] = useState<Wave>('square');
  const stateRef = useRef({ wave });
  useEffect(() => { stateRef.current = { wave }; }, [wave]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, colors } = info;
    let raf = 0;
    function draw() {
      const { wave } = stateRef.current;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      // Two panels stacked: top time-domain, bottom spectrum
      const split = h * 0.42;
      const padX = 36;

      // Top: time domain
      const tH = split - 16;
      const tMid = 8 + tH / 2;
      ctx.strokeStyle = colors.border;
      ctx.beginPath(); ctx.moveTo(padX, tMid); ctx.lineTo(w - padX, tMid); ctx.stroke();
      ctx.fillStyle = 'rgba(160,158,149,0.6)';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText('time →', w - padX - 4, tMid + 12);

      ctx.strokeStyle = '#ff6b2a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      const samples = 400;
      const cycles = 2;
      for (let i = 0; i <= samples; i++) {
        const x = padX + (i / samples) * (w - 2 * padX);
        const phase = (i / samples) * cycles * 2 * Math.PI;
        const y = tMid - timeDomain(wave, phase) * (tH / 2) * 0.9;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Bottom: spectrum bar chart
      const bMid = split + (h - split) - 24;
      const bH = h - split - 32;
      ctx.strokeStyle = colors.border;
      ctx.beginPath(); ctx.moveTo(padX, bMid); ctx.lineTo(w - padX, bMid); ctx.stroke();

      const bars = spectrum(wave, 20);
      const nMax = 20;
      // x position for harmonic n
      const xOf = (n: number) => padX + (n / nMax) * (w - 2 * padX);
      // ampliture scale: normalise so the largest bar is ~90% bH
      const maxAmp = Math.max(...bars.map(b => b.amp), 0.01);
      const barW = (w - 2 * padX) / nMax * 0.6;

      for (const b of bars) {
        const x = xOf(b.n) - barW / 2;
        const hPx = (b.amp / maxAmp) * bH * 0.9;
        ctx.fillStyle = b.n === 0 ? 'rgba(108,197,194,0.85)' : '#ff6b2a';
        ctx.fillRect(x, bMid - hPx, barW, hPx);
        if (b.amp / maxAmp > 0.08) {
          ctx.fillStyle = colors.text;
          ctx.font = '9px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillText(b.amp.toFixed(2), x + barW / 2, bMid - hPx - 3);
        }
      }
      // axis labels
      ctx.fillStyle = colors.textDim;
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      for (let n = 0; n <= nMax; n += 2) {
        ctx.fillText(n === 0 ? 'DC' : n.toString(), xOf(n), bMid + 12);
      }
      ctx.textAlign = 'right';
      ctx.fillText('amplitude →', w - padX - 4, bMid - bH);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure="Fig. 15.2"
      title="Spectrum of a periodic wave"
      question="What harmonics are inside each of these waveforms?"
      caption={
        <>
          A sine has one bar at f. A square and a sawtooth have peaks at every harmonic (or every odd one), with amplitudes
          falling as 1/n. A triangle's amplitudes fall as 1/n², so it converges faster and sounds &ldquo;softer&rdquo;. A
          half- or full-rectified sine — what a diode bridge produces — has a DC term plus only even harmonics: the basis
          of every linear power supply.
        </>
      }
    >
      <AutoResizeCanvas height={320} setup={setup} />
      <DemoControls>
        <MiniToggle label="Sine" checked={wave === 'sine'} onChange={() => setWave('sine')} />
        <MiniToggle label="Square" checked={wave === 'square'} onChange={() => setWave('square')} />
        <MiniToggle label="Triangle" checked={wave === 'triangle'} onChange={() => setWave('triangle')} />
        <MiniToggle label="Sawtooth" checked={wave === 'sawtooth'} onChange={() => setWave('sawtooth')} />
        <MiniToggle label="Half-rect" checked={wave === 'half-rect'} onChange={() => setWave('half-rect')} />
        <MiniToggle label="Full-rect" checked={wave === 'full-rect'} onChange={() => setWave('full-rect')} />
      </DemoControls>
    </Demo>
  );
}
