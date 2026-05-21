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
import { useMemo, useState } from 'react';
import { drawLabel } from '@/lib/canvasLayout';
import { withAlpha } from '@/lib/canvasTheme';
import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

interface Props {
  figure?: string;
}

const F_OUT = 60; // fundamental output, Hz
const V_DC = 400; // DC bus, V

export function PWMInverterOutputDemo({ figure }: Props) {
  const [fSw, setFSw] = useState(5000); // carrier 5 kHz default
  const [m, setM] = useState(0.85); // modulation index

  const computed = useMemo(() => {
    const Vpeak = m * V_DC;
    const Vrms = Vpeak / Math.sqrt(2);
    // First side-band harmonic at f_sw − 2·f_out (approx) is the worst
    // residual after a single-pole LC filter at f_c. For a fixed THD
    // budget the filter inductance scales as 1/f_sw².
    const fSidelobe = fSw - 2 * F_OUT;
    return { Vpeak, Vrms, fSidelobe };
  }, [fSw, m]);

  const stateRef = useSimState({ fSw, m });
  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, colors }, _state, _dt, _simTime, ctx0) => {
      let phase = ctx0.phase;
      const { fSw, m } = stateRef.current;
      phase += 0.01;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);
      const padL = 50,
        padR = 16,
        padT = 18,
        padB = 28;
      const plotW = w - padL - padR;
      const plotH = h - padT - padB;
      const subH = plotH / 2 - 6;
      const top = padT;
      const bot = padT + subH + 12;
      ctx.strokeStyle = colors.border;
      ctx.strokeRect(padL, top, plotW, subH);
      ctx.strokeRect(padL, bot, plotW, subH);
      const tWindow = 2 / F_OUT;
      const samples = 1400;
      const yTime = (v: number) => top + subH / 2 - (v / V_DC) * (subH / 2 - 4);
      ctx.strokeStyle = colors.border;
      ctx.beginPath();
      ctx.moveTo(padL, top + subH / 2);
      ctx.lineTo(padL + plotW, top + subH / 2);
      ctx.stroke();
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
        if (i === 0) {
          ctx.moveTo(x, y);
          prevY = y;
        } else {
          ctx.lineTo(x, prevY);
          ctx.lineTo(x, y);
          prevY = y;
        }
      }
      ctx.stroke();
      ctx.strokeStyle = colors.teal;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (let i = 0; i <= samples; i++) {
        const t = (i / samples) * tWindow;
        const v = m * V_DC * Math.sin(2 * Math.PI * F_OUT * t + phase);
        const x = padL + (i / samples) * plotW;
        const y = yTime(v);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.save();
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = colors.textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      drawLabel(ctx, { text: '+V_DC', x: padL - 4, y: yTime(+V_DC), font: '10px "JetBrains Mono", monospace', align: 'right', baseline: 'middle' });
      drawLabel(ctx, { text: '0', x: padL - 4, y: top + subH / 2, font: '10px "JetBrains Mono", monospace', align: 'right', baseline: 'middle' });
      drawLabel(ctx, { text: '−V_DC', x: padL - 4, y: yTime(-V_DC), font: '10px "JetBrains Mono", monospace', align: 'right', baseline: 'middle' });
      drawLabel(ctx, { text: `raw PWM (carrier ${(fSw / 1e3).toFixed(1)} kHz)  +  60 Hz filtered`, x: padL + 4, y: top + 4, font: '10px "JetBrains Mono", monospace', baseline: 'top' });
      const fLo = 10;
      const fHi = 1e6;
      const xOfF = (f: number) => padL + (Math.log10(f / fLo) / Math.log10(fHi / fLo)) * plotW;
      const yBase = bot + subH - 6;
      const yPeak = bot + 8;
      const yOfA = (a: number) => yBase - a * (yBase - yPeak);
      ctx.restore();
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.save();
      ctx.globalAlpha = 0.65;
      ctx.fillStyle = colors.textDim;
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      for (const decade of [10, 100, 1e3, 1e4, 1e5, 1e6]) {
        const xd = xOfF(decade);
        ctx.beginPath();
        ctx.moveTo(xd, bot);
        ctx.lineTo(xd, bot + subH);
        ctx.stroke();
        const label =
          decade >= 1e6
            ? '1 MHz'
            : decade >= 1e3
              ? `${(decade / 1e3).toFixed(0)} kHz`
              : `${decade.toFixed(0)} Hz`;
        ctx.fillText(label, xd, bot + subH + 4);
      }
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
      stem(F_OUT, m, withAlpha(colors.accent, 1.0));
      stem(fSw - 2 * F_OUT, 0.6 * m, withAlpha(colors.teal, 0.95));
      stem(fSw + 2 * F_OUT, 0.6 * m, withAlpha(colors.teal, 0.95));
      stem(fSw, 0.15 * m, withAlpha(colors.teal, 0.6));
      stem(2 * fSw - F_OUT, 0.3 * m, withAlpha(colors.teal, 0.65));
      stem(2 * fSw + F_OUT, 0.3 * m, withAlpha(colors.teal, 0.65));
      const fCorner = fSw / 10;
      const xC = xOfF(fCorner);
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = colors.text;
      ctx.setLineDash([3, 3]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(xC, bot);
      ctx.lineTo(xC, bot + subH);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      drawLabel(ctx, {
        x: xC + 3,
        y: bot + 4,
        text: `LC corner f_sw/10 = ${formatHz(fCorner)}`,
        color: colors.text,
        size: 9,
        baseline: 'top',
      });
      ctx.save();
      ctx.globalAlpha = 0.8;
      drawLabel(ctx, {
        x: padL + 4,
        y: bot + 4,
        text: 'output spectrum  (60 Hz fundamental + carrier sidelobes)',
        color: colors.textDim,
        baseline: 'top',
      });
      ctx.restore();
      ctx0.phase = phase;
    },
    [],
    () => ({ context: { phase: 0 } }),
  );

  return (
    <Demo
      figure={figure ?? 'Fig. 19.9'}
      title="PWM carrier vs filter difficulty"
      question="Push the carrier from 1 kHz to 50 kHz. Where do the harmonics go — and what does that do to the filter?"
      caption={
        <>
          Sinusoidal PWM places the wanted 60 Hz fundamental in the audio band, but the energy from
          the switching itself piles up in side-bands around the carrier f<sub>sw</sub> (and its
          multiples). Move the carrier up by 10× and the side-bands move 10× further from the
          fundamental, so an LC output filter whose corner is set at f<sub>sw</sub>/10 attenuates
          them by ~ 40 dB more — a smaller inductor and smaller capacitor are both fine. This is why
          modern inverter silicon (SiC, GaN) is worth its cost: higher allowed f<sub>sw</sub>{' '}
          shrinks every passive in the output filter.
        </>
      }
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="carrier f_sw"
          value={Math.log10(fSw)}
          min={Math.log10(1000)}
          max={Math.log10(50000)}
          step={0.01}
          format={(v) => formatHz(Math.pow(10, v))}
          onChange={(v) => setFSw(Math.pow(10, v))}
        />
        <MiniSlider
          label="modulation m"
          value={m}
          min={0.1}
          max={1.0}
          step={0.01}
          format={(v) => v.toFixed(2)}
          onChange={setM}
        />
        <MiniReadout
          label="V_out peak"
          value={<Num value={computed.Vpeak} digits={1} />}
          unit="V"
        />
        <MiniReadout label="V_out rms" value={<Num value={computed.Vrms} digits={1} />} unit="V" />
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
