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
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';

interface Props { figure?: string }

const F_OUT = 60;       // Hz — desired output sine
const F_SW  = 1200;     // Hz — carrier (low for visual clarity)
const V_DC  = 400;      // V — DC bus

export function HBridgeInverterDemo({ figure }: Props) {
  const [m, setM] = useState(0.85);      // modulation index 0..1

  const Vout_peak = m * V_DC;
  const Vout_rms  = Vout_peak / Math.sqrt(2);

  const stateRef = useRef({ m });
  useEffect(() => { stateRef.current = { m }; }, [m]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, colors } = info;
    let raf = 0;
    let phase = 0;

    function draw() {
      const { m } = stateRef.current;
      phase += 0.012;

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      const padL = 50, padR = 20, padT = 18, padB = 28;
      const plotW = w - padL - padR;
      const plotH = h - padT - padB;
      const subH = plotH / 2 - 4;
      const top = padT;
      const mid = padT + subH + 8;

      // frames
      ctx.strokeStyle = colors.border;
      ctx.strokeRect(padL, top, plotW, subH);
      ctx.strokeRect(padL, mid, plotW, subH);

      // mid-lines (V = 0)
      ctx.beginPath();
      ctx.moveTo(padL, top + subH / 2); ctx.lineTo(padL + plotW, top + subH / 2);
      ctx.moveTo(padL, mid + subH / 2); ctx.lineTo(padL + plotW, mid + subH / 2);
      ctx.stroke();

      // Window: 2 line cycles
      const tWindow = 2 / F_OUT;            // s
      const samples = 1200;

      const yTop = (v: number) => (top + subH / 2) - (v / V_DC) * (subH / 2 - 4);
      const yMid = (v: number) => (mid + subH / 2) - (v / V_DC) * (subH / 2 - 4);

      // Sine reference (visible on bottom plot, dashed)
      ctx.strokeStyle = colors.teal;
      ctx.lineWidth = 1.1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      for (let i = 0; i <= samples; i++) {
        const t = (i / samples) * tWindow;
        const ref = m * Math.sin(2 * Math.PI * F_OUT * t + phase);
        const x = padL + (i / samples) * plotW;
        const y = yMid(ref * V_DC);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // PWM output (top plot)
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      let prevY = yTop(V_DC);
      for (let i = 0; i <= samples; i++) {
        const t = (i / samples) * tWindow;
        const ref = m * Math.sin(2 * Math.PI * F_OUT * t + phase);
        const carrier = 2 * ((F_SW * t) % 1) - 1;  // −1..+1
        const pwm = ref > carrier ? +V_DC : -V_DC;
        const x = padL + (i / samples) * plotW;
        const y = yTop(pwm);
        if (i === 0) { ctx.moveTo(x, y); prevY = y; }
        else { ctx.lineTo(x, prevY); ctx.lineTo(x, y); prevY = y; }
      }
      ctx.stroke();

      // Filtered output (bottom plot) — analytic m · V_DC · sin(...)
      ctx.strokeStyle = 'rgba(255,107,42,1.0)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (let i = 0; i <= samples; i++) {
        const t = (i / samples) * tWindow;
        const v = m * V_DC * Math.sin(2 * Math.PI * F_OUT * t + phase);
        const x = padL + (i / samples) * plotW;
        const y = yMid(v);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Labels
      ctx.fillStyle = 'rgba(160,158,149,0.80)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillText('+V_DC',  padL - 4, yTop(+V_DC));
      ctx.fillText('0',      padL - 4, top + subH / 2);
      ctx.fillText('−V_DC',  padL - 4, yTop(-V_DC));
      ctx.fillText(`+${(m * V_DC).toFixed(0)} V`, padL - 4, yMid(+m * V_DC));
      ctx.fillText('0',                          padL - 4, mid + subH / 2);
      ctx.fillText(`−${(m * V_DC).toFixed(0)} V`, padL - 4, yMid(-m * V_DC));

      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText(`bipolar PWM (carrier ${F_SW} Hz)`, padL + 4, top + 4);
      ctx.fillText(`LC-filtered output  (${F_OUT} Hz sine)`, padL + 4, mid + 4);

      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText('0',                              padL,             padT + plotH + 4);
      ctx.fillText(`${(tWindow * 1000).toFixed(0)} ms`, padL + plotW,  padT + plotH + 4);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 19.5'}
      title="H-bridge inverter: DC bus to 60 Hz sine"
      question="The top trace is square pulses jumping between ±400 V. The bottom is a 60 Hz sine. What turns one into the other?"
      caption={<>
        Four MOSFETs compare a sinusoidal reference m · sin(2π · 60 · t) against a high-frequency
        triangular carrier (here 1.2 kHz for visual clarity; real inverters run 8–20 kHz). An LC
        filter at the output averages the pulses into a clean sine of peak m · V<sub>DC</sub>.
        Modulation index m sets the output amplitude; the reference's phase sets where on the
        grid waveform you land.
      </>}
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="modulation m"
          value={m} min={0.1} max={1.0} step={0.01}
          format={v => v.toFixed(2)}
          onChange={setM}
        />
        <MiniReadout label="V_DC"          value={<Num value={V_DC} />}      unit="V" />
        <MiniReadout label="V_out peak"    value={<Num value={Vout_peak} />} unit="V" />
        <MiniReadout label="V_out rms"     value={<Num value={Vout_rms}  />} unit="V" />
        <MiniReadout label="output freq"   value="60" unit="Hz" />
      </DemoControls>
    </Demo>
  );
}
