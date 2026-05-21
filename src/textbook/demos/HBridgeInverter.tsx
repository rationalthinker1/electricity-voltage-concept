/**
 * Demo D19.5 — H-bridge inverter with sine-PWM modulation
 *
 * Four MOSFETs (S1..S4) connect a DC bus to an inductive load through an
 * H bridge. Driven with sinusoidal PWM at modulation index m:
 *   • compare a high-frequency triangular carrier to a sine reference
 *   • the high-side of one leg matches, the other leg's high-side is the
 *     complement → bipolar PWM output
 *
 * After LC filtering the output is a 60 Hz sine of amplitude m · V_DC.
 *
 * Visualisation: top trace shows the PWM voltage (square pulses
 * jumping between ±V_DC), bottom trace shows the filtered output sine
 * (the moving average over one carrier period).
 */
import { useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';
import { drawLabel } from "@/lib/canvasLayout";

interface Props {
  figure?: string;
}

const F_OUT = 60; // Hz — desired output sine
const F_SW = 1200; // Hz — carrier (low for visual clarity)
const V_DC = 400; // V — DC bus

export function HBridgeInverterDemo({ figure }: Props) {
  const [m, setM] = useState(0.85); // modulation index 0..1

  const Vout_peak = m * V_DC;
  const Vout_rms = Vout_peak / Math.sqrt(2);

  const stateRef = useSimState({ m });
  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, colors }, _state, _dt, _simTime, ctx0) => {
      let phase = ctx0.phase;
      const { m } = stateRef.current;
      phase += 0.012;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);
      const padL = 50,
        padR = 20,
        padT = 18,
        padB = 28;
      const plotW = w - padL - padR;
      const plotH = h - padT - padB;
      const subH = plotH / 2 - 4;
      const top = padT;
      const mid = padT + subH + 8;
      ctx.strokeStyle = colors.border;
      ctx.strokeRect(padL, top, plotW, subH);
      ctx.strokeRect(padL, mid, plotW, subH);
      ctx.beginPath();
      ctx.moveTo(padL, top + subH / 2);
      ctx.lineTo(padL + plotW, top + subH / 2);
      ctx.moveTo(padL, mid + subH / 2);
      ctx.lineTo(padL + plotW, mid + subH / 2);
      ctx.stroke();
      const tWindow = 2 / F_OUT;
      const samples = 1200;
      const yTop = (v: number) => top + subH / 2 - (v / V_DC) * (subH / 2 - 4);
      const yMid = (v: number) => mid + subH / 2 - (v / V_DC) * (subH / 2 - 4);
      ctx.strokeStyle = colors.teal;
      ctx.lineWidth = 1.1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      for (let i = 0; i <= samples; i++) {
        const t = (i / samples) * tWindow;
        const ref = m * Math.sin(2 * Math.PI * F_OUT * t + phase);
        const x = padL + (i / samples) * plotW;
        const y = yMid(ref * V_DC);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      let prevY = yTop(V_DC);
      for (let i = 0; i <= samples; i++) {
        const t = (i / samples) * tWindow;
        const ref = m * Math.sin(2 * Math.PI * F_OUT * t + phase);
        const carrier = 2 * ((F_SW * t) % 1) - 1; // −1..+1
        const pwm = ref > carrier ? +V_DC : -V_DC;
        const x = padL + (i / samples) * plotW;
        const y = yTop(pwm);
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
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (let i = 0; i <= samples; i++) {
        const t = (i / samples) * tWindow;
        const v = m * V_DC * Math.sin(2 * Math.PI * F_OUT * t + phase);
        const x = padL + (i / samples) * plotW;
        const y = yMid(v);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.save();
      ctx.globalAlpha = 0.8;
      drawLabel(ctx, { text: '+V_DC', x: padL - 4, y: yTop(+V_DC), font: '10px "JetBrains Mono", monospace', align: 'right', baseline: 'middle' });
      drawLabel(ctx, { text: '0', x: padL - 4, y: top + subH / 2 });
      drawLabel(ctx, { text: '−V_DC', x: padL - 4, y: yTop(-V_DC) });
      drawLabel(ctx, { text: `+${(m * V_DC).toFixed(0)} V`, x: padL - 4, y: yMid(+m * V_DC) });
      drawLabel(ctx, { text: '0', x: padL - 4, y: mid + subH / 2 });
      drawLabel(ctx, { text: `−${(m * V_DC).toFixed(0)} V`, x: padL - 4, y: yMid(-m * V_DC) });
      drawLabel(ctx, { text: `bipolar PWM (carrier ${F_SW} Hz)`, x: padL + 4, y: top + 4, baseline: 'top' });
      drawLabel(ctx, { text: `LC-filtered output  (${F_OUT} Hz sine)`, x: padL + 4, y: mid + 4 });
      drawLabel(ctx, { text: '0', x: padL, y: padT + plotH + 4, align: 'center', baseline: 'top' });
      drawLabel(ctx, { text: `${(tWindow * 1000).toFixed(0)} ms`, x: padL + plotW, y: padT + plotH + 4 });
      ctx.restore();
      ctx0.phase = phase;
    },
    [],
    () => ({ context: { phase: 0 } }),
  );

  return (
    <Demo
      figure={figure ?? 'Fig. 19.5'}
      title="H-bridge inverter: DC bus to 60 Hz sine"
      question="The top trace is square pulses jumping between ±400 V. The bottom is a 60 Hz sine. What turns one into the other?"
      caption={
        <>
          Four MOSFETs compare a sinusoidal reference m · sin(2π · 60 · t) against a high-frequency
          triangular carrier (here 1.2 kHz for visual clarity; real inverters run 8–20 kHz). An LC
          filter at the output averages the pulses into a clean sine of peak m · V<sub>DC</sub>.
          Modulation index m sets the output amplitude; the reference's phase sets where on the grid
          waveform you land.
        </>
      }
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="modulation m"
          value={m}
          min={0.1}
          max={1.0}
          step={0.01}
          format={(v) => v.toFixed(2)}
          onChange={setM}
        />
        <MiniReadout label="V_DC" value={<Num value={V_DC} />} unit="V" />
        <MiniReadout label="V_out peak" value={<Num value={Vout_peak} />} unit="V" />
        <MiniReadout label="V_out rms" value={<Num value={Vout_rms} />} unit="V" />
        <MiniReadout label="output freq" value="60" unit="Hz" />
      </DemoControls>
    </Demo>
  );
}
