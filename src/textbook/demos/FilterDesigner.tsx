/**
 * Demo D13.x — Filter designer (build-it)
 *
 * The reader is handed a noisy signal: a 1 kHz audio tone mixed with 60 Hz
 * mains hum, plus a thin white-noise floor across the band. Their job is to
 * pick a topology and component values so the filter passes the 1 kHz tone
 * while killing the 60 Hz hum.
 *
 * Topologies (chosen for clean closed-form |H(jω)|):
 *
 *   RC-LP   — 2nd-order RC low-pass cascade (two identical R/C stages,
 *             buffered so they don't load each other). Roll-off −40 dB/decade.
 *
 *     |H(jω)| = 1 / (1 + (ω R C)²)
 *     ω_c     = 1/(R C)
 *
 *   LC-LP   — series-L / shunt-C low-pass. Roll-off −40 dB/decade past ω₀.
 *
 *     |H(jω)|² = 1 / ((1 − ω² L C)² + (ω L / R_load)²)
 *     ω_0     = 1/√(L C)
 *
 *   RC-HP   — 1st-order RC high-pass.
 *
 *     |H(jω)| = (ω R C) / √(1 + (ω R C)²)
 *     ω_c     = 1/(R C)
 *
 *   NOTCH   — twin-T notch tuned at user-chosen f₀. Standard twin-T
 *             requires R₁ = R, C₁ = C, R₂ = R/2, C₂ = 2C with
 *             f₀ = 1/(2π R C). |H| is exactly zero at ω₀; off-band the
 *             notch passes flat. Modelled with the second-order rejection
 *             magnitude
 *
 *     |H(jω)| = |1 − (ω/ω₀)²| / √((1 − (ω/ω₀)²)² + (2ζ ω/ω₀)²),  ζ = 0.5
 *
 *   MFB-BP  — multi-feedback band-pass tuned at user f₀, Q ≈ 5.
 *
 *     |H(jω)| = (ω/ω₀ Q⁻¹) / √((1 − (ω/ω₀)²)² + (ω/ω₀ Q⁻¹)²)
 *
 * The reader's success metric is the audio-to-hum ratio at the output,
 * computed as 20·log10(|H(2π·1000)| / |H(2π·60)|), expressed in dB. Goal:
 * push this above ~40 dB while keeping |H(2π·1000)| above 0.3 (i.e. less
 * than ~10 dB of insertion loss in the audio band).
 *
 * Three live plots: noisy input (left), output time-series (right), and a
 * Bode magnitude curve below them. The reader sees the filtering directly
 * in the time domain and as a transfer function — same physics, two windows.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';
import { drawGlowPath } from '@/lib/canvasPrimitives';

interface Props { figure?: string }

type Topology = 'rc-lp' | 'lc-lp' | 'rc-hp' | 'notch' | 'mfb-bp';

const TOPOLOGIES: { key: Topology; label: string }[] = [
  { key: 'rc-lp',  label: '2nd-order RC low-pass' },
  { key: 'lc-lp',  label: 'LC low-pass' },
  { key: 'rc-hp',  label: 'RC high-pass' },
  { key: 'notch',  label: 'Twin-T notch' },
  { key: 'mfb-bp', label: 'Multi-feedback band-pass' },
];

const F_AUDIO = 1000;   // Hz, the desired signal
const F_HUM   = 60;     // Hz, the unwanted mains hum

/** Closed-form magnitude response for each topology. f in Hz, returns |H|. */
function transferMagnitude(topology: Topology, f: number, R: number, C: number, L: number, f0: number): number {
  const omega = 2 * Math.PI * f;
  switch (topology) {
    case 'rc-lp': {
      // Two-stage buffered RC: |H| = 1 / (1 + (ω R C)²)
      const wRC = omega * R * C;
      return 1 / (1 + wRC * wRC);
    }
    case 'lc-lp': {
      // Series-L / shunt-C into a 1 kΩ "load" stand-in (so the math is finite)
      const RL = 1000;
      const re = 1 - omega * omega * L * C;
      const im = omega * L / RL;
      return 1 / Math.sqrt(re * re + im * im);
    }
    case 'rc-hp': {
      const wRC = omega * R * C;
      return wRC / Math.sqrt(1 + wRC * wRC);
    }
    case 'notch': {
      // Twin-T notch at f0 with damping ζ = 0.5 (a passive twin-T's effective Q)
      const omega0 = 2 * Math.PI * f0;
      const r = omega / omega0;
      const oneMinusR2 = 1 - r * r;
      const zeta = 0.5;
      const denom = Math.sqrt(oneMinusR2 * oneMinusR2 + (2 * zeta * r) * (2 * zeta * r));
      return Math.abs(oneMinusR2) / Math.max(denom, 1e-12);
    }
    case 'mfb-bp': {
      // Multi-feedback band-pass, Q = 5
      const omega0 = 2 * Math.PI * f0;
      const Q = 5;
      const r = omega / omega0;
      const oneMinusR2 = 1 - r * r;
      const rOverQ = r / Q;
      return rOverQ / Math.sqrt(oneMinusR2 * oneMinusR2 + rOverQ * rOverQ);
    }
  }
}

/** Cutoff or centre frequency for the chosen topology (Hz). */
function characteristicFreq(topology: Topology, R: number, C: number, L: number, f0: number): number {
  switch (topology) {
    case 'rc-lp': return 1 / (2 * Math.PI * R * C);
    case 'lc-lp': return 1 / (2 * Math.PI * Math.sqrt(Math.max(L * C, 1e-30)));
    case 'rc-hp': return 1 / (2 * Math.PI * R * C);
    case 'notch':
    case 'mfb-bp':
      return f0;
  }
}

export function FilterDesignerDemo({ figure }: Props) {
  const [topology, setTopology] = useState<Topology>('rc-lp');
  const [Rk, setRk] = useState(1.6);    // kΩ
  const [Cnf, setCnf] = useState(100);  // nF
  const [Lmh, setLmh] = useState(10);   // mH
  const [f0, setF0] = useState(60);     // Hz (notch/MFB centre)

  const R = Rk * 1e3;
  const C = Cnf * 1e-9;
  const L = Lmh * 1e-3;

  // Live derived numbers
  const fc = useMemo(() => characteristicFreq(topology, R, C, L, f0), [topology, R, C, L, f0]);
  const Haudio = useMemo(() => transferMagnitude(topology, F_AUDIO, R, C, L, f0), [topology, R, C, L, f0]);
  const Hhum   = useMemo(() => transferMagnitude(topology, F_HUM,   R, C, L, f0), [topology, R, C, L, f0]);
  const insertionLossDb = -20 * Math.log10(Math.max(Haudio, 1e-9));
  const humAttenDb      = -20 * Math.log10(Math.max(Hhum,   1e-9));
  // Score: audio-to-hum ratio at the output, in dB
  const scoreDb = 20 * Math.log10(Math.max(Haudio, 1e-9) / Math.max(Hhum, 1e-9));

  // Optional Q for resonant topologies
  const Q = useMemo(() => {
    if (topology === 'lc-lp') {
      const omega0 = 2 * Math.PI * fc;
      const RL = 1000;
      return (omega0 * L) / RL;
    }
    if (topology === 'mfb-bp') return 5;
    if (topology === 'notch')  return 0.5; // effective damping inverse
    return NaN;
  }, [topology, fc, L]);

  const stateRef = useRef({ topology, R, C, L, f0, Haudio, Hhum });
  useEffect(() => {
    stateRef.current = { topology, R, C, L, f0, Haudio, Hhum };
  }, [topology, R, C, L, f0, Haudio, Hhum]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, colors } = info;
    let raf = 0;

    function draw(now: number) {
      const { topology, R, C, L, f0 } = stateRef.current;

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      // Layout: three panels. Top-left = noisy input; top-right = output;
      // bottom = Bode plot spanning the whole width.
      const pad = 16;
      const gap = 14;
      const topH = Math.floor((h - pad * 2 - gap) * 0.46);
      // botH = h - pad * 2 - topH - gap;  // reserved; current layout uses topH only.
      const halfW = Math.floor((w - pad * 2 - gap) / 2);

      const inX0  = pad,           inY0  = pad,             inX1  = pad + halfW,            inY1  = pad + topH;
      const outX0 = inX1 + gap,    outY0 = pad,             outX1 = outX0 + halfW,          outY1 = pad + topH;
      const bodeX0 = pad,          bodeY0 = pad + topH + gap, bodeX1 = w - pad,             bodeY1 = h - pad;

      // Panel frames
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.strokeRect(inX0, inY0, inX1 - inX0, inY1 - inY0);
      ctx.strokeRect(outX0, outY0, outX1 - outX0, outY1 - outY0);
      ctx.strokeRect(bodeX0, bodeY0, bodeX1 - bodeX0, bodeY1 - bodeY0);

      // Labels
      ctx.fillStyle = colors.accent;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('noisy input  1 kHz tone + 60 Hz hum', inX0 + 6, inY0 + 4);
      ctx.fillText('filtered output', outX0 + 6, outY0 + 4);
      ctx.fillStyle = colors.teal;
      ctx.fillText('|H(f)|  [dB]', bodeX0 + 6, bodeY0 + 4);

      // === Time-domain plots ===
      // 50 ms of signal; horizontal axis = time, vertical = amplitude.
      const tSpan = 0.05;
      const NT = 480;
      const seed = 1.234;

      // Pre-compute the input samples; we'll reuse for the (numerically-filtered)
      // output by applying the filter's frequency response in a simple per-frequency
      // sum-over-components fashion — only audio, hum, and the two noise partials
      // are present, so the time-domain output is a sum of four sinusoids each
      // attenuated and phase-shifted by H(jω) at their own ω.
      const componentFreqs = [F_AUDIO, F_HUM, 4300, 7700];
      const componentAmps  = [1.0, 0.7, 0.08, 0.08];
      const componentPhase = [0, 0, seed, seed * 1.7];
      const Hcomp = componentFreqs.map(f => transferMagnitude(topology, f, R, C, L, f0));
      // For the time-domain plot, magnitude attenuation is what matters visually;
      // we elide the phase delay (would just shift the wave).

      // Find the input/output peaks for shared scaling.
      let inPeak = 0, outPeak = 0;
      const inputSamples = new Float32Array(NT + 1);
      const outputSamples = new Float32Array(NT + 1);
      for (let i = 0; i <= NT; i++) {
        const t = (i / NT) * tSpan;
        let xi = 0, yo = 0;
        for (let k = 0; k < componentFreqs.length; k++) {
          const fk = componentFreqs[k]!;
          const ak = componentAmps[k]!;
          const ph = componentPhase[k]!;
          const samp = ak * Math.sin(2 * Math.PI * fk * t + ph);
          xi += samp;
          yo += samp * Hcomp[k]!;
        }
        inputSamples[i] = xi;
        outputSamples[i] = yo;
        const aIn = Math.abs(xi); if (aIn > inPeak) inPeak = aIn;
        const aOut = Math.abs(yo); if (aOut > outPeak) outPeak = aOut;
      }
      const scaleIn  = inPeak > 0 ? 1 / inPeak : 1;
      const scaleOut = outPeak > 0 ? 1 / outPeak : 1;

      const inputPts: { x: number; y: number }[] = [];
      const outputPts: { x: number; y: number }[] = [];
      const inMidY = (inY0 + inY1) / 2;
      const inAmp  = (inY1 - inY0) * 0.40;
      const outMidY = (outY0 + outY1) / 2;
      const outAmp  = (outY1 - outY0) * 0.40;
      for (let i = 0; i <= NT; i++) {
        const u = i / NT;
        const xi = inputSamples[i]! * scaleIn;
        const yo = outputSamples[i]! * scaleOut;
        inputPts.push({ x: inX0 + u * (inX1 - inX0), y: inMidY - xi * inAmp });
        outputPts.push({ x: outX0 + u * (outX1 - outX0), y: outMidY - yo * outAmp });
      }
      drawGlowPath(ctx, inputPts, {
        color: 'rgba(255,107,42,0.9)',
        glowColor: 'rgba(255,107,42,0.30)',
        lineWidth: 1.4, glowWidth: 4,
      });
      drawGlowPath(ctx, outputPts, {
        color: 'rgba(108,197,194,0.95)',
        glowColor: 'rgba(108,197,194,0.35)',
        lineWidth: 1.4, glowWidth: 4,
      });

      // Centre lines + scale tag in each scope panel
      ctx.strokeStyle = colors.border;
      ctx.beginPath(); ctx.moveTo(inX0,  inMidY); ctx.lineTo(inX1,  inMidY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(outX0, outMidY); ctx.lineTo(outX1, outMidY); ctx.stroke();
      ctx.fillStyle = 'rgba(160,158,149,0.55)';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`peak ≈ ${inPeak.toFixed(2)}`, inX1 - 6, inY1 - 4);
      ctx.fillText(`peak ≈ ${outPeak.toFixed(3)}`, outX1 - 6, outY1 - 4);

      // === Bode plot ===
      // Log-f axis from 10 Hz to 100 kHz; magnitude in dB from -80 to +10.
      const logMin = 1;   // log10(10 Hz)
      const logMax = 5;   // log10(100 kHz)
      const dBmin = -80, dBmax = 10;
      const bx = bodeX0, by = bodeY0, bw = bodeX1 - bodeX0, bh = bodeY1 - bodeY0;
      const xf = (f: number) => bx + ((Math.log10(f) - logMin) / (logMax - logMin)) * bw;
      const yDb = (db: number) => by + bh - ((db - dBmin) / (dBmax - dBmin)) * bh;

      // Gridlines
      ctx.strokeStyle = colors.border;
      for (let lf = logMin; lf <= logMax; lf++) {
        const f = Math.pow(10, lf);
        const x = xf(f);
        ctx.beginPath(); ctx.moveTo(x, by); ctx.lineTo(x, by + bh); ctx.stroke();
        ctx.fillStyle = 'rgba(160,158,149,0.55)';
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(fmtFreq(f), x, by + bh + 2);
      }
      for (let db = dBmin; db <= dBmax; db += 20) {
        const y = yDb(db);
        ctx.strokeStyle = colors.border;
        ctx.beginPath(); ctx.moveTo(bx, y); ctx.lineTo(bx + bw, y); ctx.stroke();
        ctx.fillStyle = colors.textDim;
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${db}`, bx - 4, y);
      }

      // Mark the 60 Hz hum and 1 kHz audio
      const xHum = xf(F_HUM);
      ctx.strokeStyle = 'rgba(255,59,110,0.55)';
      ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(xHum, by); ctx.lineTo(xHum, by + bh); ctx.stroke();
      const xAudio = xf(F_AUDIO);
      ctx.strokeStyle = colors.teal;
      ctx.beginPath(); ctx.moveTo(xAudio, by); ctx.lineTo(xAudio, by + bh); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = colors.pink;
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('60 Hz hum', xHum + 3, by + 16);
      ctx.fillStyle = colors.teal;
      ctx.fillText('1 kHz audio', xAudio + 3, by + 16);

      // |H(f)| curve
      const Nb = 240;
      const curve: { x: number; y: number }[] = [];
      for (let i = 0; i <= Nb; i++) {
        const u = i / Nb;
        const lf = logMin + u * (logMax - logMin);
        const f = Math.pow(10, lf);
        const m = transferMagnitude(topology, f, R, C, L, f0);
        const db = 20 * Math.log10(Math.max(m, 1e-9));
        const yy = yDb(Math.max(dBmin, Math.min(dBmax, db)));
        curve.push({ x: xf(f), y: yy });
      }
      drawGlowPath(ctx, curve, {
        color: 'rgba(255,107,42,0.95)',
        glowColor: 'rgba(255,107,42,0.35)',
        lineWidth: 1.7, glowWidth: 6,
      });

      // 0 dB and the 1 kHz / 60 Hz markers on the curve
      const Hkhz = transferMagnitude(topology, F_AUDIO, R, C, L, f0);
      const Hhum = transferMagnitude(topology, F_HUM, R, C, L, f0);
      const yAudio = yDb(Math.max(dBmin, Math.min(dBmax, 20 * Math.log10(Math.max(Hkhz, 1e-9)))));
      const yHum   = yDb(Math.max(dBmin, Math.min(dBmax, 20 * Math.log10(Math.max(Hhum, 1e-9)))));
      ctx.fillStyle = 'rgba(108,197,194,1)';
      ctx.beginPath(); ctx.arc(xAudio, yAudio, 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,59,110,1)';
      ctx.beginPath(); ctx.arc(xHum, yHum, 3.5, 0, Math.PI * 2); ctx.fill();

      // Tag advancing time so the scope traces appear "live" if we ever want to
      // animate; for now `now` is just used to keep React's rAF alive.
      void now;

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  const scoreLabel = scoreDb >= 40
    ? 'Excellent — 60 Hz crushed'
    : scoreDb >= 20
      ? 'Acceptable — hum reduced'
      : scoreDb >= 0
        ? 'Marginal — try a different topology'
        : 'Filter is amplifying the hum';

  const isResonant = topology === 'notch' || topology === 'mfb-bp';

  return (
    <Demo
      figure={figure ?? 'Fig. 13.3'}
      title="Filter designer — kill the 60 Hz hum"
      question="A 1 kHz tone is buried under 60 Hz mains hum. Pick a topology and component values that pass the tone and reject the hum."
      caption={<>
        The orange scope on the left shows the dirty input: a 1 kHz tone, a fat 60 Hz mains
        ripple, and a hiss of high-frequency noise. The teal scope on the right shows what your
        filter produces. Below them, the Bode plot is the filter's transfer function magnitude
        — the orange dot is what survives at 60 Hz, the teal dot at 1 kHz. Push the "audio /
        hum" score above 40 dB and the hum is essentially gone; the twin-T notch and the LC
        low-pass both clear that bar with the right values.
      </>}
      deeperLab={{ slug: 'capacitance', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={420} setup={setup} />
      <DemoControls>
        <label className="mini-slider">
          <span className="mini-slider-label">topology</span>
          <select
            value={topology}
            onChange={e => setTopology(e.target.value as Topology)}
            style={{
              background: '#1c1c22', color: '#ecebe5', border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: 4, padding: '2px 8px', fontFamily: '"JetBrains Mono", monospace', fontSize: 12,
            }}
          >
            {TOPOLOGIES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
          </select>
        </label>
        <MiniSlider label="R" value={Rk} min={0.01} max={100} step={0.01}
          format={v => v < 1 ? (v * 1000).toFixed(0) + ' Ω' : v.toFixed(2) + ' kΩ'}
          onChange={setRk} />
        <MiniSlider label="C" value={Cnf} min={1} max={100000} step={1}
          format={v => v < 1000 ? v.toFixed(0) + ' nF' : (v / 1000).toFixed(1) + ' µF'}
          onChange={setCnf} />
        <MiniSlider label="L" value={Lmh} min={0.0001} max={100} step={0.0001}
          format={v => v < 1 ? (v * 1000).toFixed(1) + ' µH' : v.toFixed(2) + ' mH'}
          onChange={setLmh} />
        {isResonant && (
          <MiniSlider label="f₀" value={f0} min={10} max={1000} step={1}
            format={v => v.toFixed(0) + ' Hz'} onChange={setF0} />
        )}
        <MiniReadout
          label={topology === 'notch' || topology === 'mfb-bp' ? 'centre f₀' : 'cutoff f_c'}
          value={<Num value={fc} />} unit="Hz" />
        <MiniReadout label="loss @ 1 kHz" value={insertionLossDb.toFixed(1)} unit="dB" />
        <MiniReadout label="reject @ 60 Hz" value={humAttenDb.toFixed(1)} unit="dB" />
        {isFinite(Q) && <MiniReadout label="Q" value={Q.toFixed(2)} />}
        <MiniReadout label="audio / hum  (score)" value={scoreDb.toFixed(1)} unit="dB" />
        <MiniReadout label="verdict" value={scoreLabel} />
      </DemoControls>
    </Demo>
  );
}

function fmtFreq(f: number): string {
  if (!isFinite(f) || f <= 0) return '—';
  if (f >= 1e6) return (f / 1e6).toFixed(0) + 'M';
  if (f >= 1e3) return (f / 1e3).toFixed(0) + 'k';
  if (f >= 1) return f.toFixed(0);
  return f.toFixed(2);
}
