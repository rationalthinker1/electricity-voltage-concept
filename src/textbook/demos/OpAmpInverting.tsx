/**
 * Demo D12.11 — Inverting op-amp
 *
 * Ideal op-amp inverting topology:
 *   V_out = − (R_f / R_in) · V_in
 * clipped to the ±V_sup rails when the math says |V_out| > V_sup.
 *
 * Display: V_in and V_out as overlaid sine traces on a scope-like
 * plot.  When V_out hits a rail, that part of the trace flattens.
 */
import { useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, EquationStrip, MiniReadout, MiniSlider } from '@/components/Demo';
import { M } from '@/components/Formula';
import { drawGlowPath } from '@/lib/canvasPrimitives';
import { withAlpha } from '@/lib/canvasTheme';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';
import { drawLabel } from '@/lib/canvasLayout';

interface Props {
  figure: string;
}

const V_SUP = 10; // ±10 V rails

export function OpAmpInvertingDemo({ figure }: Props) {
  const [RinK, setRinK] = useState(10); // kΩ
  const [RfK, setRfK] = useState(100); // kΩ
  const [Vamp, setVamp] = useState(0.5); // V peak

  const gain = -(RfK / RinK);
  const Vout_peak = gain * Vamp;
  const railed = Math.abs(Vout_peak) > V_SUP;

  const stateRef = useSimState({ gain, Vamp });
  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, colors }, _state, _dt, simTime) => {
      const { gain, Vamp } = stateRef.current;
      const tnow = simTime;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);
      const padL = 50,
        padR = 30,
        padT = 24,
        padB = 24;
      const plotX = padL,
        plotY = padT;
      const plotW = w - padL - padR;
      const plotH = h - padT - padB;
      ctx.strokeStyle = colors.border;
      ctx.strokeRect(plotX, plotY, plotW, plotH);
      const yV = (v: number) => plotY + plotH / 2 - (v / V_SUP) * (plotH / 2 - 6);
      ctx.strokeStyle = colors.border;
      for (let v = -10; v <= 10; v += 2) {
        const y = yV(v);
        ctx.beginPath();
        ctx.moveTo(plotX, y);
        ctx.lineTo(plotX + plotW, y);
        ctx.stroke();
      }
      ctx.strokeStyle = colors.borderStrong;
      const y0 = yV(0);
      ctx.beginPath();
      ctx.moveTo(plotX, y0);
      ctx.lineTo(plotX + plotW, y0);
      ctx.stroke();
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = colors.pink;
      ctx.setLineDash([4, 4]);
      const yPos = yV(V_SUP);
      const yNeg = yV(-V_SUP);
      ctx.beginPath();
      ctx.moveTo(plotX, yPos);
      ctx.lineTo(plotX + plotW, yPos);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(plotX, yNeg);
      ctx.lineTo(plotX + plotW, yNeg);
      ctx.stroke();
      ctx.setLineDash([]);
      const freq = 2.0;
      const N = 400;
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.strokeStyle = colors.blue;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (let i = 0; i <= N; i++) {
        const u = i / N;
        const t = (u * 2) / freq - tnow * 0; // static window
        const vin = Vamp * Math.sin(2 * Math.PI * freq * t + tnow * 2 * Math.PI * 0.5);
        const x = plotX + u * plotW;
        const y = yV(vin);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      const voutPts: { x: number; y: number }[] = [];
      for (let i = 0; i <= N; i++) {
        const u = i / N;
        const t = (u * 2) / freq;
        const vin = Vamp * Math.sin(2 * Math.PI * freq * t + tnow * 2 * Math.PI * 0.5);
        let vout = gain * vin;
        if (vout > V_SUP) vout = V_SUP;
        else if (vout < -V_SUP) vout = -V_SUP;
        voutPts.push({ x: plotX + u * plotW, y: yV(vout) });
      }
      drawGlowPath(ctx, voutPts, {
        color: withAlpha(colors.accent, 0.95),
        lineWidth: 1.8,
        glowColor: withAlpha(colors.accent, 0.35),
        glowWidth: 5,
      });
      ctx.restore();
      ctx.fillStyle = colors.textDim;
      drawLabel(ctx, {
        text: '+10 V',
        x: plotX - 4,
        y: yPos,
        size: 9,
        font: '9px "JetBrains Mono", monospace',
        align: 'right',
        baseline: 'middle',
      });
      drawLabel(ctx, {
        text: '0',
        x: plotX - 4,
        y: y0,
        size: 9,
        font: '9px "JetBrains Mono", monospace',
        align: 'right',
        baseline: 'middle',
      });
      drawLabel(ctx, {
        text: '-10 V',
        x: plotX - 4,
        y: yNeg,
        size: 9,
        font: '9px "JetBrains Mono", monospace',
        align: 'right',
        baseline: 'middle',
      });
      drawLabel(ctx, {
        text: 'V_in',
        x: plotX + 4,
        y: plotY + 4,
        color: colors.blue,
        font: '10px "JetBrains Mono", monospace',
        baseline: 'top',
      });
      drawLabel(ctx, {
        text: 'V_out',
        x: plotX + 40,
        y: plotY + 4,
        color: colors.accent,
        font: '10px "JetBrains Mono", monospace',
        baseline: 'top',
      });
      drawLabel(ctx, {
        text: `gain = ${gain.toFixed(1)}×`,
        x: plotX + plotW - 4,
        y: plotY + 4,
        color: colors.text,
        font: '10px "JetBrains Mono", monospace',
        align: 'right',
        baseline: 'top',
      });
      const peakOut = Math.abs(gain * Vamp);
      if (peakOut > V_SUP) {
        drawLabel(ctx, {
          text: 'RAILED — V_out clipped to ±10 V supply',
          x: plotX + plotW / 2,
          y: plotY + plotH - 4,
          color: colors.pink,
          align: 'center',
          baseline: 'bottom',
        });
      }
    },
    [],
  );

  return (
    <Demo
      figure={figure}
      title="Inverting op-amp"
      question="V_out = −(R_f/R_in)·V_in. Push V_in past the limit and the rails clip."
      caption={
        <>
          Blue: input sinusoid V<sub>in</sub>. Orange: output V<sub>out</sub> = −(R<sub>f</sub>/R
          <sub>in</sub>) × V<sub>in</sub>, inverted and amplified by the resistor ratio. The dashed
          lines at ±10 V are the supply rails — once the math wants to push V<sub>out</sub> past
          either, the real op-amp saturates and the waveform flattens against the rail.
        </>
      }
      deeperLab={{ slug: 'op-amp', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={260} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="R_in"
          value={RinK}
          min={1}
          max={100}
          step={1}
          format={(v) => v.toFixed(0) + ' kΩ'}
          onChange={setRinK}
        />
        <MiniSlider
          label="R_f"
          value={RfK}
          min={1}
          max={1000}
          step={1}
          format={(v) => (v < 1000 ? v.toFixed(0) + ' kΩ' : (v / 1000).toFixed(1) + ' MΩ')}
          onChange={setRfK}
        />
        <MiniSlider
          label="V_in peak"
          value={Vamp}
          min={0.05}
          max={5}
          step={0.05}
          format={(v) => v.toFixed(2) + ' V'}
          onChange={setVamp}
        />
        <MiniReadout label="Gain" value={gain.toFixed(2)} unit="V/V" />
        <MiniReadout label="V_out peak" value={Vout_peak.toFixed(2)} unit="V" />
        <MiniReadout label="State" value={railed ? 'railed' : 'linear'} />
      </DemoControls>
      <EquationStrip
        leftLabel="Inverting amplifier"
        left={<M tex={`V_{\\text{out}} = -\\frac{R_f}{R_{\\text{in}}} \\cdot V_{\\text{in}}`} />}
        rightLabel={`R_in = ${RinK} kΩ, R_f = ${RfK} kΩ`}
        right={
          <M
            tex={`A_v = -\\frac{${RfK}}{${RinK}} = ${gain.toFixed(1)},\\quad V_{\\text{out,pk}} = ${Vout_peak.toFixed(2)}\\,\\text{V}${railed ? '\\text{ (clipped)}' : ''}`}
          />
        }
      />
    </Demo>
  );
}
