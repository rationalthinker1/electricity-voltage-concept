/**
 * Demo D18.8 — Transformer inrush current
 *
 * Energising an unloaded transformer at the wrong instant of the AC cycle
 * causes the core flux to integrate asymmetrically up to ~2× its
 * steady-state peak, driving the core deep into saturation. The
 * magnetizing current then spikes — 10 to 30× normal — for the first few
 * cycles until the asymmetry decays.
 *
 * Why: V_p = N dΦ/dt, so Φ(t) = (1/N) ∫ V_p dt + Φ_residual. If the
 * switch closes at the voltage *peak* (90°), the integral starts at its
 * natural average; Φ swings symmetrically about zero and never saturates.
 * If the switch closes at a voltage *zero-crossing* (0°), the integral
 * starts climbing from zero and reaches twice the steady-state peak on
 * the first half-cycle — past saturation, magnetising current spikes.
 *
 * Reader sets the switch-on phase angle θ ∈ [0°, 180°].
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';

interface Props { figure?: string }

// Normalized: peak flux at steady state = 1.0; B_sat = 1.05 (just above peak).
const B_SAT = 1.05;
// How steeply current ramps once we go past saturation
const SAT_GAIN = 60;

export function InRushCurrentDemo({ figure }: Props) {
  const [thetaDeg, setThetaDeg] = useState(0);   // switch-on phase angle, degrees

  // Pre-compute the I, B traces analytically for one display window.
  // Φ(t) = − cos(ωt + θ) + cos(θ)        (integral of sin(ωt + θ) from 0)
  // (Normalised so that steady-state |Φ_peak| = 1.)
  // Magnetising current: linear in Φ when |Φ| < B_sat, exponential past it.
  function magCurrent(B: number): number {
    const a = Math.abs(B);
    if (a < B_SAT) return B * 0.02;                       // tiny in linear region
    const sign = B < 0 ? -1 : 1;
    return sign * (0.02 * B_SAT + SAT_GAIN * (a - B_SAT)); // sharp ramp once saturated
  }

  // Peak inrush current over the first 3 cycles
  let Ipeak = 0;
  let Bpeak = 0;
  {
    const theta = (thetaDeg * Math.PI) / 180;
    const N = 600;
    for (let i = 0; i <= N; i++) {
      const phi = (i / N) * 6 * Math.PI;   // 3 cycles
      const B = -Math.cos(phi + theta) + Math.cos(theta);
      const I = magCurrent(B);
      if (Math.abs(I) > Math.abs(Ipeak)) Ipeak = I;
      if (Math.abs(B) > Math.abs(Bpeak)) Bpeak = B;
    }
  }
  const Iratio = Math.abs(Ipeak) / 0.02;   // vs steady-state magnetising

  const stateRef = useRef({ thetaDeg });
  useEffect(() => { stateRef.current = { thetaDeg }; }, [thetaDeg]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, colors } = info;
    let raf = 0;

    function draw() {
      const { thetaDeg } = stateRef.current;
      const theta = (thetaDeg * Math.PI) / 180;

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      const padL = 50, padR = 16, padT = 18, padB = 28;
      const plotW = w - padL - padR;
      const plotH = h - padT - padB;
      const subH = plotH / 3 - 6;
      const topV = padT;
      const midB = padT + subH + 8;
      const botI = padT + 2 * (subH + 8);

      ctx.strokeStyle = colors.border;
      ctx.strokeRect(padL, topV, plotW, subH);
      ctx.strokeRect(padL, midB, plotW, subH);
      ctx.strokeRect(padL, botI, plotW, subH);

      // Mid-lines
      ctx.beginPath();
      ctx.moveTo(padL, topV + subH / 2); ctx.lineTo(padL + plotW, topV + subH / 2);
      ctx.moveTo(padL, midB + subH / 2); ctx.lineTo(padL + plotW, midB + subH / 2);
      ctx.moveTo(padL, botI + subH / 2); ctx.lineTo(padL + plotW, botI + subH / 2);
      ctx.stroke();

      const N = 800;
      // Show 3 line cycles
      const nCyc = 3;
      const phiMax = nCyc * 2 * Math.PI;

      // Y mappers
      const yV = (v: number) => (topV + subH / 2) - (v / 1.2) * (subH / 2 - 4);
      // B: range ~[-2.2, 2.2] worst case
      const yB = (b: number) => (midB + subH / 2) - (b / 2.4) * (subH / 2 - 4);
      // I: dynamic — clamp to ~[-1.5, 1.5] (saturated peaks visible)
      const yI = (i: number) => (botI + subH / 2) - (Math.max(-1.5, Math.min(1.5, i)) / 1.6) * (subH / 2 - 4);

      // Trace V
      ctx.strokeStyle = 'rgba(160,158,149,0.85)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      for (let i = 0; i <= N; i++) {
        const phi = (i / N) * phiMax;
        const v = Math.sin(phi + theta);
        const x = padL + (i / N) * plotW;
        const y = yV(v);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Trace B (flux)
      const Bsat = B_SAT;
      // Draw saturation band on B plot
      ctx.fillStyle = 'rgba(255,107,42,0.10)';
      const ySatTop = yB(Bsat);
      const ySatTopMax = yB(2.4);
      ctx.fillRect(padL, ySatTopMax, plotW, ySatTop - ySatTopMax);
      const ySatBotTop = yB(-Bsat);
      const ySatBotBot = yB(-2.4);
      ctx.fillRect(padL, ySatBotTop, plotW, ySatBotBot - ySatBotTop);

      ctx.strokeStyle = 'rgba(108,197,194,1.0)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (let i = 0; i <= N; i++) {
        const phi = (i / N) * phiMax;
        const B = -Math.cos(phi + theta) + Math.cos(theta);
        const x = padL + (i / N) * plotW;
        const y = yB(B);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Trace I (magnetising current)
      ctx.strokeStyle = 'rgba(255,107,42,1.0)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (let i = 0; i <= N; i++) {
        const phi = (i / N) * phiMax;
        const B = -Math.cos(phi + theta) + Math.cos(theta);
        const I = magCurrent(B);
        const x = padL + (i / N) * plotW;
        const y = yI(I);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Labels
      ctx.fillStyle = colors.textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillText('+V', padL - 4, yV(1));
      ctx.fillText('0',  padL - 4, topV + subH / 2);
      ctx.fillText('+B_sat', padL - 4, yB(Bsat));
      ctx.fillText('−B_sat', padL - 4, yB(-Bsat));
      ctx.fillText('clip',   padL - 4, yI(1.4));

      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText(`primary voltage  V_p(t) = sin(ωt + θ),  θ = ${thetaDeg.toFixed(0)}°`,
        padL + 4, topV + 4);
      ctx.fillText('core flux  Φ(t)  (asymmetric if θ ≠ 90°)', padL + 4, midB + 4);
      ctx.fillText('magnetising current  I_mag(t)', padL + 4, botI + 4);

      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText('0',                              padL,             padT + plotH + 4);
      ctx.fillText('3 cycles',                       padL + plotW / 2, padT + plotH + 4);
      ctx.fillText(`${(nCyc / 60 * 1000).toFixed(0)} ms`, padL + plotW, padT + plotH + 4);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 18.8'}
      title="Inrush current: switching at the wrong instant"
      question="Close the breaker at θ = 0° (voltage zero-crossing). Then try 90° (voltage peak). What does the flux do?"
      caption={<>
        Because Φ is the time-integral of V<sub>p</sub>, the instant of switch-on sets the DC offset of the
        flux waveform. Closing at the voltage peak (θ = 90°) starts the integral at its natural average —
        Φ swings symmetrically around zero. Closing at a voltage zero-crossing (θ = 0°) leaves the integral
        with a half-cycle of accumulation before the next reversal, driving Φ to ~2 × its steady-state peak.
        That overshoot pushes the core well past B<sub>sat</sub>, and the magnetising current jumps by an
        order of magnitude or more. Real distribution transformers see 10–30× nominal inrush this way; it is
        why upstream breakers have inverse-time curves rather than instantaneous trips.
      </>}
    >
      <AutoResizeCanvas height={320} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="switch-on θ"
          value={thetaDeg} min={0} max={180} step={1}
          format={v => `${Math.round(v)}°`}
          onChange={setThetaDeg}
        />
        <MiniReadout label="Φ peak / Φ steady"   value={<Num value={Math.abs(Bpeak)} digits={2} />} unit="×" />
        <MiniReadout label="I_inrush / I_mag,ss" value={<Num value={Iratio} digits={1} />} unit="×" />
        <MiniReadout label="saturated?"          value={Math.abs(Bpeak) > B_SAT ? 'yes' : 'no'} />
      </DemoControls>
    </Demo>
  );
}
