/**
 * Demo D14.6 — Common-emitter amplifier with input/output waveforms
 *
 * Draws the canonical CE amplifier: V_CC supply, R_C collector resistor,
 * R_E emitter degeneration, R_1/R_2 base bias divider, input coupling
 * cap. Bias-point analysis is the standard textbook procedure
 * (Sedra & Smith §6.6 — voltage-divider bias):
 *
 *   V_BB    = V_CC R_2 / (R_1 + R_2)        (Thevenin of divider)
 *   R_BB    = R_1 ∥ R_2
 *   I_E     = (V_BB − V_BE) / (R_E + R_BB/β)
 *   I_C    ≈ I_E
 *   V_CE    = V_CC − I_C (R_C + R_E)
 *   g_m     = I_C / V_T
 *   A_v     = −g_m R_C        (with R_E bypassed)
 *
 * Two side-by-side time plots show the AC input (small sine) and the
 * inverted, amplified output around the Q-point.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';

interface Props { figure?: string }

const V_BE = 0.7;
const V_T = 0.02585;   // V — kT/q at 300 K
const beta = 150;

interface Bias { Ic: number; Vce: number; gm: number; Av: number; }

function biasPoint(V_CC: number, R_C: number, R_E: number, R_1: number, R_2: number): Bias {
  const V_BB = V_CC * R_2 / (R_1 + R_2);
  const R_BB = (R_1 * R_2) / (R_1 + R_2);
  const I_E = Math.max(0, (V_BB - V_BE) / (R_E + R_BB / beta));
  const I_C = I_E * beta / (beta + 1);
  const V_CE = V_CC - I_C * (R_C + R_E);
  const gm = I_C / V_T;
  const Av = -gm * R_C;
  return { Ic: I_C, Vce: V_CE, gm, Av };
}

export function CommonEmitterAmpDemo({ figure }: Props) {
  const [V_CC, setVCC] = useState(12);
  const [R_C, setRC] = useState(4700);
  const [R_E, setRE] = useState(1000);
  const [R_1, setR1] = useState(47000);
  const [R_2, setR2] = useState(10000);
  const [Vin_mV, setVin] = useState(10);

  const { Ic, Vce, gm, Av } = biasPoint(V_CC, R_C, R_E, R_1, R_2);

  const stateRef = useRef({ V_CC, R_C, Av, Vce, Vin_mV });
  useEffect(() => { stateRef.current = { V_CC, R_C, Av, Vce, Vin_mV }; }, [V_CC, R_C, Av, Vce, Vin_mV]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h } = info;
    let raf = 0;
    let t0 = 0;

    function draw(ts: number) {
      if (!t0) t0 = ts;
      const tSec = (ts - t0) / 1000;
      const { V_CC, Av, Vce, Vin_mV } = stateRef.current;

      ctx.fillStyle = '#0d0d10';
      ctx.fillRect(0, 0, w, h);

      const padL = 50, padR = 16, padT = 24, padB = 30;
      const plotW = w - padL - padR;
      const plotH = h - padT - padB;

      // We plot two traces on the same axes: input (small, around 0) and
      // output (large, around V_CE), both shifted into the same display window.
      // To get them both visible, render input "magnified" by a fixed factor
      // (visual-only) and centred on a baseline; render output around V_CE.
      // The amplitude scaling is annotated.

      const Vmin = 0, Vmax = V_CC;
      const yOf = (v: number) => padT + plotH - ((v - Vmin) / (Vmax - Vmin)) * plotH;

      // axes
      ctx.strokeStyle = 'rgba(255,255,255,0.10)';
      ctx.strokeRect(padL, padT, plotW, plotH);

      // V_CC line
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.setLineDash([2, 4]);
      ctx.beginPath();
      ctx.moveTo(padL, yOf(V_CC)); ctx.lineTo(padL + plotW, yOf(V_CC));
      ctx.moveTo(padL, yOf(Vce)); ctx.lineTo(padL + plotW, yOf(Vce));
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(160,158,149,0.7)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(`V_CC = ${V_CC.toFixed(1)} V`, padL - 4, yOf(V_CC));
      ctx.fillText(`Q: V_CE = ${Vce.toFixed(2)} V`, padL - 4, yOf(Vce));
      ctx.fillText('0', padL - 4, yOf(0));

      // x-axis title
      ctx.fillStyle = 'rgba(160,158,149,0.8)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('time', padL + plotW / 2, padT + plotH + 16);

      // input waveform: small sine, plotted on a fixed sub-band 0..0.8 V,
      // centred at 0.4 V. (Visual-only — labelled below.)
      const f = 1.2; // Hz
      const inputBase = 0.4;
      const inputAmp = (Vin_mV / 1000) * 80; // amplification factor for display
      const N = 240;
      ctx.strokeStyle = 'rgba(108,197,194,0.95)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i <= N; i++) {
        const ti = (i / N) * 6 + tSec * 0.4;
        const v = inputBase + inputAmp * Math.sin(2 * Math.PI * f * ti);
        const x = padL + (i / N) * plotW;
        const y = yOf(Math.max(0, Math.min(V_CC, v)));
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // output waveform: V_out(t) = V_CE + A_v · Vin(t) (clamped to supply rails)
      ctx.strokeStyle = 'rgba(255,107,42,0.95)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (let i = 0; i <= N; i++) {
        const ti = (i / N) * 6 + tSec * 0.4;
        const vin = (Vin_mV / 1000) * Math.sin(2 * Math.PI * f * ti);
        let vout = Vce + Av * vin;
        if (vout > V_CC) vout = V_CC;
        if (vout < 0.2) vout = 0.2;
        const x = padL + (i / N) * plotW;
        const y = yOf(vout);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // legend
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillStyle = 'rgba(108,197,194,0.95)';
      ctx.fillText(`V_in   amp = ${Vin_mV.toFixed(1)} mV   (shown ×80 for visibility)`, padL + 6, padT + 4);
      ctx.fillStyle = 'rgba(255,107,42,0.95)';
      ctx.fillText(`V_out  amp = ${(Math.abs(Av) * Vin_mV).toFixed(1)} mV   A_v = ${Av.toFixed(0)}`, padL + 6, padT + 18);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 14.6'}
      title="The common-emitter amplifier"
      question="One transistor and four resistors. What's the small-signal voltage gain?"
      caption={<>
        Bias network R<sub>1</sub>/R<sub>2</sub> sets V<sub>BB</sub>, R<sub>E</sub> stabilises the operating point against
        β-variation, R<sub>C</sub> converts the transistor's current swing into a voltage swing. Gain is
        A<sub>v</sub> ≈ −g<sub>m</sub> R<sub>C</sub> with g<sub>m</sub> = I<sub>C</sub>/V<sub>T</sub>. Push the input too
        hard and the output clips against the supply rails.
      </>}
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        <MiniSlider label="V_CC"  value={V_CC} min={5} max={20} step={0.5}
          format={v => v.toFixed(1) + ' V'} onChange={setVCC} />
        <MiniSlider label="R_C"   value={R_C} min={500} max={20000} step={100}
          format={v => (v / 1000).toFixed(1) + ' kΩ'} onChange={setRC} />
        <MiniSlider label="R_E"   value={R_E} min={100} max={5000} step={50}
          format={v => v.toFixed(0) + ' Ω'} onChange={setRE} />
        <MiniSlider label="R_1"   value={R_1} min={10000} max={200000} step={1000}
          format={v => (v / 1000).toFixed(0) + ' kΩ'} onChange={setR1} />
        <MiniSlider label="R_2"   value={R_2} min={2000} max={50000} step={500}
          format={v => (v / 1000).toFixed(1) + ' kΩ'} onChange={setR2} />
        <MiniSlider label="V_in"  value={Vin_mV} min={1} max={50} step={1}
          format={v => v.toFixed(0) + ' mV'} onChange={setVin} />
        <MiniReadout label="I_C(Q)"  value={<Num value={Ic} />} unit="A" />
        <MiniReadout label="V_CE(Q)" value={Vce.toFixed(2)} unit="V" />
        <MiniReadout label="g_m"     value={<Num value={gm} />} unit="S" />
        <MiniReadout label="A_v"     value={Av.toFixed(1)} />
      </DemoControls>
    </Demo>
  );
}
