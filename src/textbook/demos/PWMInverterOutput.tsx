/**
 * Demo D19.9 — PWM inverter output spectrum
 *
 * Sinusoidal PWM modulation produces a switching waveform whose moving
 * average is a clean sine at the reference frequency (60 Hz). The
 * spectrum of the raw PWM has a fundamental at 60 Hz plus a cluster of
 * harmonics around the carrier frequency f_sw and its multiples. Pushing
 * f_sw higher moves the harmonic cluster further from the fundamental,
 * which makes the LC output filter much easier (smaller L, smaller C)
 * for the same residual ripple.
 *
 * Plot: raw PWM in pale orange, LC-filtered output in solid amber,
 * normalised harmonic spectrum bar chart in teal.
 *
 * Sliders: carrier frequency f_sw (1–50 kHz), modulation index m (0–1).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';

interface Props { figure?: string }

const F_OUT = 60;       // fundamental output, Hz
const V_DC  = 400;      // DC bus, V

export function PWMInverterOutputDemo({ figure }: Props) {
  const [fSw, setFSw] = useState(5000);    // carrier 5 kHz default
  const [m, setM]     = useState(0.85);    // modulation index

  const computed = useMemo(() => {
    const Vpeak = m * V_DC;
    const Vrms  = Vpeak / Math.sqrt(2);
    // First side-band harmonic at f_sw − 2·f_out (approx) is the worst
    // residual after a single-pole LC filter at f_c. For a fixed THD
    // budget the filter inductance scales as 1/f_sw².
    const fSidelobe = fSw - 2 * F_OUT;
    return { Vpeak, Vrms, fSidelobe };
  }, [fSw, m]);

  const stateRef = useRef({ fSw, m });
  useEffect(() => { stateRef.current = { fSw, m }; }, [fSw, m]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, colors } = info;
    let raf = 0;
    let phase = 0;

    function draw() {
      const { fSw, m } = stateRef.current;
      phase += 0.01;

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      const padL = 50, padR = 16, padT = 18, padB = 28;
      const plotW = w - padL - padR;
      const plotH = h - padT - padB;
      const subH = plotH / 2 - 6;
      const top = padT;
      const bot = padT + subH + 12;

      ctx.strokeStyle = colors.border;
      ctx.strokeRect(padL, top, plotW, subH);
      ctx.strokeRect(padL, bot, plotW, subH);

      // ─── Top: time-domain PWM + filtered sine ───
      const tWindow = 2 / F_OUT;       // 2 cycles of 60 Hz
      const samples = 1400;
      const yTime = (v: number) => (top + subH / 2) - (v / V_DC) * (subH / 2 - 4);

      // Mid-line
      ctx.strokeStyle = colors.border;
      ctx.beginPath();
      ctx.moveTo(padL, top + subH / 2); ctx.lineTo(padL + plotW, top + subH / 2);
      ctx.stroke();

      // Raw PWM (pale)
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      let prevY = yTime(V_DC);
      for (let i = 0; i <= samples; i++) {
        const t = (i / samples) * tWindow;
        const ref = m * Math.sin(2 * Math.PI * F_OUT * t + phase);
        const carrier = 2 * ((fSw * t) % 1) - 1;
        const pwm = ref > carrier ? +V_DC : -V_DC;
        const x = padL + (i / samples) * plotW;
        const y = yTime(pwm);
        if (i === 0) { ctx.moveTo(x, y); prevY = y; }
        else { ctx.lineTo(x, prevY); ctx.lineTo(x, y); prevY = y; }
      }
      ctx.stroke();

      // LC-filtered output (analytic sine)
      ctx.strokeStyle = 'rgba(108,197,194,1.0)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (let i = 0; i <= samples; i++) {
        const t = (i / samples) * tWindow;
        const v = m * V_DC * Math.sin(2 * Math.PI * F_OUT * t + phase);
        const x = padL + (i / samples) * plotW;
        const y = yTime(v);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.fillStyle = 'rgba(160,158,149,0.80)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillText('+V_DC', padL - 4, yTime(+V_DC));
      ctx.fillText('0',     padL - 4, top + subH / 2);
      ctx.fillText('−V_DC', padL - 4, yTime(-V_DC));
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText(`raw PWM (carrier ${(fSw / 1e3).toFixed(1)} kHz)  +  60 Hz filtered`,
        padL + 4, top + 4);

      // ─── Bottom: schematic harmonic spectrum (log frequency axis) ───
      // For a single-pole sinusoidal PWM, the dominant harmonics sit at
      // f_sw ± k·f_out for small k. We render an idealised stem plot with:
      //   • fundamental at 60 Hz, amplitude m
      //   • sidelobes at f_sw ± 2 f_out (relative amplitude ~ 0.6 m)
      //   • second carrier cluster at 2 f_sw ± f_out (rel. ~ 0.3 m)
      // Frequencies plotted on log scale from 10 Hz to 1 MHz.
      const fLo = 10;
      const fHi = 1e6;
      const xOfF = (f: number) =>
        padL + (Math.log10(f / fLo) / Math.log10(fHi / fLo)) * plotW;
      const yBase = bot + subH - 6;
      const yPeak = bot + 8;
      const yOfA = (a: number) => yBase - a * (yBase - yPeak);

      // Log-frequency grid + decade ticks
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.fillStyle = 'rgba(160,158,149,0.65)';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      for (const decade of [10, 100, 1e3, 1e4, 1e5, 1e6]) {
        const xd = xOfF(decade);
        ctx.beginPath();
        ctx.moveTo(xd, bot); ctx.lineTo(xd, bot + subH);
        ctx.stroke();
        const label = decade >= 1e6 ? '1 MHz'
          : decade >= 1e3 ? `${(decade / 1e3).toFixed(0)} kHz`
          : `${decade.toFixed(0)} Hz`;
        ctx.fillText(label, xd, bot + subH + 4);
      }

      // Stems
      function stem(f: number, amp: number, color: string) {
        if (f < fLo || f > fHi) return;
        const x = xOfF(f);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, yBase);
        ctx.lineTo(x, yOfA(amp));
        ctx.stroke();
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, yOfA(amp), 2.6, 0, 2 * Math.PI);
        ctx.fill();
      }

      // Fundamental — amber
      stem(F_OUT, m, 'rgba(255,107,42,1.0)');
      // Carrier sidelobes — teal
      stem(fSw - 2 * F_OUT, 0.6 * m, 'rgba(108,197,194,0.95)');
      stem(fSw + 2 * F_OUT, 0.6 * m, 'rgba(108,197,194,0.95)');
      stem(fSw,             0.15 * m, 'rgba(108,197,194,0.6)');
      // Second carrier cluster — fainter
      stem(2 * fSw - F_OUT, 0.30 * m, 'rgba(108,197,194,0.65)');
      stem(2 * fSw + F_OUT, 0.30 * m, 'rgba(108,197,194,0.65)');

      // Filter corner annotation: a typical LC filter chosen at f_sw / 10
      const fCorner = fSw / 10;
      const xC = xOfF(fCorner);
      ctx.strokeStyle = 'rgba(236,235,229,0.50)';
      ctx.setLineDash([3, 3]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(xC, bot); ctx.lineTo(xC, bot + subH);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = colors.text;
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText(`LC corner f_sw/10 = ${formatHz(fCorner)}`, xC + 3, bot + 4);

      // Labels
      ctx.fillStyle = 'rgba(160,158,149,0.80)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText('output spectrum  (60 Hz fundamental + carrier sidelobes)', padL + 4, bot + 4);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 19.9'}
      title="PWM carrier vs filter difficulty"
      question="Push the carrier from 1 kHz to 50 kHz. Where do the harmonics go — and what does that do to the filter?"
      caption={<>
        Sinusoidal PWM places the wanted 60 Hz fundamental in the audio band, but the energy from the
        switching itself piles up in side-bands around the carrier f<sub>sw</sub> (and its multiples).
        Move the carrier up by 10× and the side-bands move 10× further from the fundamental, so an LC
        output filter whose corner is set at f<sub>sw</sub>/10 attenuates them by ~ 40 dB more — a
        smaller inductor and smaller capacitor are both fine. This is why modern inverter silicon
        (SiC, GaN) is worth its cost: higher allowed f<sub>sw</sub> shrinks every passive in the
        output filter.
      </>}
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="carrier f_sw"
          value={Math.log10(fSw)} min={Math.log10(1000)} max={Math.log10(50000)} step={0.01}
          format={v => formatHz(Math.pow(10, v))}
          onChange={v => setFSw(Math.pow(10, v))}
        />
        <MiniSlider
          label="modulation m"
          value={m} min={0.10} max={1.00} step={0.01}
          format={v => v.toFixed(2)}
          onChange={setM}
        />
        <MiniReadout label="V_out peak"   value={<Num value={computed.Vpeak} digits={1} />}    unit="V" />
        <MiniReadout label="V_out rms"    value={<Num value={computed.Vrms}  digits={1} />}    unit="V" />
        <MiniReadout label="first sidelobe" value={formatHz(computed.fSidelobe)} />
      </DemoControls>
    </Demo>
  );
}

function formatHz(f: number): string {
  if (f >= 1e6) return (f / 1e6).toFixed(2) + ' MHz';
  if (f >= 1e3) return (f / 1e3).toFixed(f >= 1e4 ? 0 : 1) + ' kHz';
  return f.toFixed(0) + ' Hz';
}
