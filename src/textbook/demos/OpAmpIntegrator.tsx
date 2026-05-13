/**
 * Demo D12.12 — Op-amp integrator
 *
 * Inverting op-amp with R at the input and C in the feedback path:
 *
 *   V_out(t) = − (1 / RC) · ∫ V_in(t') dt'
 *
 * Square-wave input → triangle output.
 * Sine input → 90°-lagging cosine, attenuated by 1/(ωRC).
 *
 * Integration is performed numerically (forward-Euler, dt = 1 ms).
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import {
  Demo, DemoControls, MiniReadout, MiniSlider, MiniToggle,
} from '@/components/Demo';

type WaveKind = 'square' | 'sine' | 'triangle';

interface Props { figure?: string }

const V_SUP = 8;  // ±8 V output rail

export function OpAmpIntegratorDemo({ figure }: Props) {
  const [RkOhm, setRkOhm] = useState(10);   // kΩ
  const [Cnf, setCnf] = useState(100);      // nF
  const [fHz, setFHz] = useState(200);      // Hz
  const [VinAmp, setVinAmp] = useState(2);  // V peak
  const [kind, setKind] = useState<WaveKind>('square');

  const R = RkOhm * 1e3;
  const C = Cnf * 1e-9;
  const tau = R * C;
  // Sinusoidal attenuation factor for the readout
  const omega = 2 * Math.PI * fHz;
  const sineGainMag = 1 / (omega * tau);

  const stateRef = useRef({ R, C, fHz, VinAmp, kind });
  useEffect(() => {
    stateRef.current = { R, C, fHz, VinAmp, kind };
  }, [R, C, fHz, VinAmp, kind]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h } = info;
    let raf = 0;
    const t0 = performance.now();

    function draw() {
      const { R, C, fHz, VinAmp, kind } = stateRef.current;
      const tau = R * C;
      const tnow = (performance.now() - t0) / 1000;

      ctx.fillStyle = '#0d0d10';
      ctx.fillRect(0, 0, w, h);

      const padL = 50, padR = 30, padT = 22, padB = 22;
      const plotX = padL, plotY = padT;
      const plotW = w - padL - padR;
      const plotH = h - padT - padB;

      ctx.strokeStyle = 'rgba(255,255,255,0.10)';
      ctx.strokeRect(plotX, plotY, plotW, plotH);

      // Window holds 2 periods
      const WINDOW = 2.0 / fHz;
      // y axis: -V_SUP..+V_SUP
      const yV = (v: number) =>
        plotY + plotH / 2 - (v / V_SUP) * (plotH / 2 - 4);

      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      for (let v = -V_SUP; v <= V_SUP; v += 2) {
        const y = yV(v);
        ctx.beginPath(); ctx.moveTo(plotX, y); ctx.lineTo(plotX + plotW, y); ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      const y0 = yV(0);
      ctx.beginPath(); ctx.moveTo(plotX, y0); ctx.lineTo(plotX + plotW, y0); ctx.stroke();

      // Build input + integrated output samples
      const N = 600;
      const phase = tnow * 2 * Math.PI * 0.4;  // slow drift so it animates
      // We want a steady-state output, so initialize the integrator from
      // the analytical mean of one full period and let it precondition.
      const inputAt = (t: number) => {
        const u = (t * fHz) % 1;  // 0..1 phase
        if (kind === 'square') return VinAmp * (u < 0.5 ? 1 : -1);
        if (kind === 'sine') return VinAmp * Math.sin(2 * Math.PI * u);
        // triangle
        return VinAmp * (u < 0.5 ? (4 * u - 1) : (3 - 4 * u));
      };
      const drift = phase / (2 * Math.PI * fHz);
      // Precondition: integrate 4 periods with no display, starting at 0
      let vout = 0;
      const preSteps = 2000;
      const preDt = (4 / fHz) / preSteps;
      for (let i = 0; i < preSteps; i++) {
        const t = -4 / fHz + i * preDt + drift;
        const vin = inputAt(t);
        vout += -(vin / tau) * preDt;
        if (vout > V_SUP) vout = V_SUP;
        else if (vout < -V_SUP) vout = -V_SUP;
      }
      // Now sample two periods for display
      const samplesIn: number[] = [];
      const samplesOut: number[] = [];
      const dt = WINDOW / N;
      for (let i = 0; i <= N; i++) {
        const t = i * dt + drift;
        const vin = inputAt(t);
        samplesIn.push(vin);
        vout += -(vin / tau) * dt;
        if (vout > V_SUP) vout = V_SUP;
        else if (vout < -V_SUP) vout = -V_SUP;
        samplesOut.push(vout);
      }

      // V_in (blue)
      ctx.strokeStyle = 'rgba(91,174,248,0.85)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i <= N; i++) {
        const x = plotX + (i / N) * plotW;
        const y = yV(samplesIn[i]);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // V_out (orange)
      ctx.strokeStyle = 'rgba(255,107,42,0.95)';
      ctx.shadowColor = 'rgba(255,107,42,0.45)';
      ctx.shadowBlur = 4;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (let i = 0; i <= N; i++) {
        const x = plotX + (i / N) * plotW;
        const y = yV(samplesOut[i]);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Y labels
      ctx.fillStyle = 'rgba(160,158,149,0.85)';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText('+8 V', plotX - 4, yV(V_SUP));
      ctx.fillText('0', plotX - 4, y0);
      ctx.fillText('-8 V', plotX - 4, yV(-V_SUP));

      // Header
      ctx.fillStyle = 'rgba(91,174,248,0.9)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(`V_in (${kind})`, plotX + 4, plotY + 4);
      ctx.fillStyle = 'rgba(255,107,42,0.9)';
      ctx.fillText('V_out = -(1/RC)∫V_in dt', plotX + 100, plotY + 4);
      ctx.fillStyle = 'rgba(236,235,229,0.85)';
      ctx.textAlign = 'right';
      ctx.fillText(`τ = RC = ${fmtT(tau)}`, plotX + plotW - 4, plotY + 4);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 12.10'}
      title="Op-amp integrator — square in, triangle out"
      question="Replace R_f with a C. The amplifier integrates."
      caption={<>
        With R at the input and C in the feedback path, V<sub>out</sub>(t) = −(1/RC) ∫ V<sub>in</sub>
        dt. A square wave integrates to a triangle. A sine wave integrates to a cosine — same
        frequency, 90° lag, magnitude scaled by 1/(ωRC). The integrator is the building block of
        every analog filter, every PID controller, and the first stage of a sigma-delta ADC.
      </>}
    >
      <AutoResizeCanvas height={260} setup={setup} />
      <DemoControls>
        <MiniToggle label="Square" checked={kind === 'square'}
          onChange={() => setKind('square')} />
        <MiniToggle label="Sine" checked={kind === 'sine'}
          onChange={() => setKind('sine')} />
        <MiniToggle label="Triangle" checked={kind === 'triangle'}
          onChange={() => setKind('triangle')} />
        <MiniSlider label="R" value={RkOhm} min={1} max={100} step={1}
          format={v => v.toFixed(0) + ' kΩ'} onChange={setRkOhm} />
        <MiniSlider label="C" value={Cnf} min={1} max={1000} step={1}
          format={v => v < 1000 ? v.toFixed(0) + ' nF' : (v / 1000).toFixed(2) + ' µF'}
          onChange={setCnf} />
        <MiniSlider label="f_in" value={fHz} min={20} max={2000} step={10}
          format={v => v < 1000 ? v.toFixed(0) + ' Hz' : (v / 1000).toFixed(2) + ' kHz'}
          onChange={setFHz} />
        <MiniSlider label="V_in peak" value={VinAmp} min={0.1} max={5} step={0.1}
          format={v => v.toFixed(1) + ' V'} onChange={setVinAmp} />
        <MiniReadout label="τ = RC" value={fmtT(tau)} />
        <MiniReadout label="1/(ωRC)" value={sineGainMag.toFixed(3)} unit="(sine gain)" />
      </DemoControls>
    </Demo>
  );
}

function fmtT(s: number): string {
  if (!isFinite(s) || s <= 0) return '—';
  if (s < 1e-6) return (s * 1e9).toFixed(0) + ' ns';
  if (s < 1e-3) return (s * 1e6).toFixed(1) + ' µs';
  if (s < 1) return (s * 1e3).toFixed(2) + ' ms';
  return s.toFixed(2) + ' s';
}
