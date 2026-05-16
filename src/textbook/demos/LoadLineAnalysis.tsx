/**
 * Demo D14.5 — Load-line analysis of a common-emitter amplifier
 *
 * Plot the BJT output characteristic family I_C vs V_CE on the same axes
 * as the load line V_CE = V_CC − I_C · R_C. The Q-point sits at the
 * intersection of the load line with the I_B curve set by the reader.
 *
 * Reader sliders: V_CC, R_C, I_B. Live readout: Q-point (I_C, V_CE),
 * and the swing capacity (room above / below the operating point).
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';

interface Props {
  figure?: string;
}

const V_CE_SAT = 0.2;
const V_A = 50;

function I_C(V_CE: number, I_B: number, beta: number): number {
  const V = Math.max(0, V_CE);
  const I_act = beta * I_B * (1 + V / V_A);
  if (V < V_CE_SAT) return I_act * (V / V_CE_SAT);
  return I_act;
}

// Find the intersection of I_C(V_CE) with the load line
// V_CE = V_CC − I_C R_C  ⇒  I_C = (V_CC − V_CE) / R_C
// Solve I_C(V_CE) = (V_CC − V_CE)/R_C by bisection.
function findQ(V_CC: number, R_C: number, I_B: number, beta: number) {
  let lo = 0,
    hi = V_CC;
  for (let i = 0; i < 40; i++) {
    const m = (lo + hi) / 2;
    const lhs = I_C(m, I_B, beta);
    const rhs = (V_CC - m) / R_C;
    if (lhs > rhs) lo = m;
    else hi = m;
  }
  const Vq = (lo + hi) / 2;
  const Iq = (V_CC - Vq) / R_C;
  return { Vq, Iq };
}

export function LoadLineAnalysisDemo({ figure }: Props) {
  const [V_CC, setVCC] = useState(10);
  const [R_C, setRC] = useState(2000);
  const [I_B, setIB] = useState(20e-6);
  const beta = 100;

  const { Vq, Iq } = findQ(V_CC, R_C, I_B, beta);

  const stateRef = useRef({ V_CC, R_C, I_B });
  useEffect(() => {
    stateRef.current = { V_CC, R_C, I_B };
  }, [V_CC, R_C, I_B]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, colors } = info;
    let raf = 0;

    function draw() {
      const { V_CC, R_C, I_B } = stateRef.current;

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      const padL = 60,
        padR = 20,
        padT = 22,
        padB = 36;
      const plotW = w - padL - padR;
      const plotH = h - padT - padB;

      const Vmin = 0,
        Vmax = Math.max(15, V_CC * 1.05);
      const Imax = Math.max(0.015, (V_CC / R_C) * 1.1);

      const xOf = (v: number) => padL + ((v - Vmin) / (Vmax - Vmin)) * plotW;
      const yOf = (i: number) => padT + plotH - (i / Imax) * plotH;

      // frame
      ctx.strokeStyle = colors.border;
      ctx.strokeRect(padL, padT, plotW, plotH);

      // gridlines
      ctx.strokeStyle = colors.border;
      ctx.beginPath();
      const vStep = Vmax > 20 ? 5 : 2;
      for (let v = 0; v <= Vmax + 1e-9; v += vStep) {
        ctx.moveTo(xOf(v), padT);
        ctx.lineTo(xOf(v), padT + plotH);
      }
      ctx.stroke();

      // axis ticks
      ctx.save();
      ctx.globalAlpha = 0.65;
      ctx.fillStyle = colors.textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      for (let v = 0; v <= Vmax + 1e-9; v += vStep) {
        ctx.fillText(v.toFixed(0), xOf(v), padT + plotH + 4);
      }

      // y-axis ticks (mA)
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      const iStep = Imax > 0.02 ? 0.005 : 0.002;
      for (let i = 0; i <= Imax + 1e-9; i += iStep) {
        ctx.fillText(`${(i * 1000).toFixed(1)} mA`, padL - 4, yOf(i));
      }

      // axis titles
      ctx.restore();
      ctx.fillStyle = colors.textDim;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('V_CE (volts)', padL + plotW / 2, padT + plotH + 18);

      // BJT family (three context traces and one highlighted)
      const traces = [0.5 * I_B, I_B, 1.5 * I_B];
      traces.forEach((IB, k) => {
        const lit = k === 1;
        const col = lit ? 'rgba(255,107,42,0.95)' : 'rgba(255,107,42,0.4)';
        ctx.strokeStyle = col;
        ctx.lineWidth = lit ? 2.0 : 1.2;
        ctx.beginPath();
        const N = 200;
        for (let j = 0; j <= N; j++) {
          const v = Vmin + (j / N) * (Vmax - Vmin);
          const i = I_C(v, IB, beta);
          const x = xOf(v);
          const y = yOf(Math.min(Imax, i));
          if (j === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.fillStyle = col;
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          `I_B = ${(IB * 1e6).toFixed(1)} µA`,
          padL + plotW - 6,
          yOf(Math.min(Imax, I_C(Vmax, IB, beta))) - 8,
        );
      });

      // load line: from (V_CC, 0) to (0, V_CC/R_C)
      const I_sat = V_CC / R_C;
      ctx.strokeStyle = colors.teal;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(xOf(V_CC), yOf(0));
      ctx.lineTo(xOf(0), yOf(Math.min(Imax, I_sat)));
      ctx.stroke();

      // load-line endpoint labels
      ctx.fillStyle = colors.teal;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`V_CC = ${V_CC.toFixed(1)} V`, xOf(V_CC), yOf(0) - 4);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        `V_CC/R_C = ${(I_sat * 1000).toFixed(1)} mA`,
        xOf(0) + 6,
        yOf(Math.min(Imax, I_sat)),
      );

      // Q-point dot
      ctx.fillStyle = colors.text;
      ctx.beginPath();
      ctx.arc(xOf(Vq), yOf(Math.min(Imax, Iq)), 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = colors.text;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText(
        `Q-point  (${Vq.toFixed(2)} V, ${(Iq * 1000).toFixed(2)} mA)`,
        xOf(Vq) + 8,
        yOf(Math.min(Imax, Iq)) - 6,
      );

      // header
      ctx.fillStyle = colors.textDim;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(
        `V_CC = ${V_CC.toFixed(1)} V   R_C = ${R_C.toFixed(0)} Ω   I_B = ${(I_B * 1e6).toFixed(1)} µA   β = ${beta}`,
        padL,
        6,
      );

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 14.5'}
      title="Load-line analysis"
      question="A linear resistor and a non-linear transistor share the same current. Where do they meet?"
      caption={
        <>
          The teal line is the load-line constraint V_CE = V_CC − I_C·R_C — pure Ohm's law for the
          resistor and the supply. The orange curve is the transistor's I_B trace. Their crossing is
          the Q-point: the only (V_CE, I_C) that satisfies both. Moving I_B slides Q up and down the
          load line.
        </>
      }
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="V_CC"
          value={V_CC}
          min={3}
          max={20}
          step={0.5}
          format={(v) => v.toFixed(1) + ' V'}
          onChange={setVCC}
        />
        <MiniSlider
          label="R_C"
          value={R_C}
          min={500}
          max={10000}
          step={100}
          format={(v) => (v / 1000).toFixed(1) + ' kΩ'}
          onChange={setRC}
        />
        <MiniSlider
          label="I_B"
          value={I_B}
          min={5e-6}
          max={60e-6}
          step={1e-6}
          format={(v) => (v * 1e6).toFixed(0) + ' µA'}
          onChange={setIB}
        />
        <MiniReadout label="V_CE(Q)" value={Vq.toFixed(2)} unit="V" />
        <MiniReadout label="I_C(Q)" value={<Num value={Iq} />} unit="A" />
      </DemoControls>
    </Demo>
  );
}
