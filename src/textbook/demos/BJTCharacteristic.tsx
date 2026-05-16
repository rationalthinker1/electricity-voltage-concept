/**
 * Demo D14.3 — BJT output characteristics
 *
 * Plots I_C vs V_CE for a family of base currents I_B = 5, 10, 20, 40, 80 µA.
 * Each curve has two regimes:
 *   - Saturation:  V_CE < V_CE(sat) ≈ 0.2 V, I_C steeply rises with V_CE.
 *   - Active:      I_C ≈ β I_B (1 + V_CE / V_A), slight slope from
 *                  channel-length / Early-effect (V_A = Early voltage,
 *                  ≈ 50 V for a generic small-signal npn — Sedra & Smith §6.5).
 *
 * Reader sliders: β and V_CE. A live readout shows I_C at the chosen
 * operating point on the I_B trace nearest the user's slider value.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';

interface Props {
  figure?: string;
}

const IB_TRACES = [5e-6, 10e-6, 20e-6, 40e-6, 80e-6]; // amps
const V_CE_SAT = 0.2; // V
const V_A = 50; // V — Early voltage

function I_C(V_CE: number, I_B: number, beta: number): number {
  const V = Math.max(0, V_CE);
  const I_act = beta * I_B * (1 + V / V_A);
  if (V < V_CE_SAT) {
    // saturation: linear ramp from 0 at V_CE=0 up to I_act at V_CE = V_CE_SAT
    return I_act * (V / V_CE_SAT);
  }
  return I_act;
}

export function BJTCharacteristicDemo({ figure }: Props) {
  const [V_CE, setVCE] = useState(5);
  const [beta, setBeta] = useState(100);
  const [I_B_pick, setIBpick] = useState(20e-6);

  const I_C_op = I_C(V_CE, I_B_pick, beta);

  const stateRef = useRef({ V_CE, beta, I_B_pick });
  useEffect(() => {
    stateRef.current = { V_CE, beta, I_B_pick };
  }, [V_CE, beta, I_B_pick]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, colors } = info;
    let raf = 0;

    function draw() {
      const { V_CE, beta, I_B_pick } = stateRef.current;

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      const padL = 60,
        padR = 20,
        padT = 20,
        padB = 36;
      const plotW = w - padL - padR;
      const plotH = h - padT - padB;

      const Vmin = 0,
        Vmax = 10;
      const Imax = 0.012; // 12 mA full-scale

      const xOf = (v: number) => padL + ((v - Vmin) / (Vmax - Vmin)) * plotW;
      const yOf = (i: number) => padT + plotH - (i / Imax) * plotH;

      // frame
      ctx.strokeStyle = colors.border;
      ctx.strokeRect(padL, padT, plotW, plotH);

      // gridlines
      ctx.strokeStyle = colors.border;
      ctx.beginPath();
      for (let v = 0; v <= Vmax; v += 2) {
        ctx.moveTo(xOf(v), padT);
        ctx.lineTo(xOf(v), padT + plotH);
      }
      for (let i = 0; i <= Imax + 1e-9; i += 0.002) {
        ctx.moveTo(padL, yOf(i));
        ctx.lineTo(padL + plotW, yOf(i));
      }
      ctx.stroke();

      // tick labels
      ctx.save();
      ctx.globalAlpha = 0.65;
      ctx.fillStyle = colors.textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      for (let v = 0; v <= Vmax; v += 2) {
        ctx.fillText(v.toFixed(0), xOf(v), padT + plotH + 4);
        ctx.restore();
      }
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      for (let i = 0; i <= Imax + 1e-9; i += 0.002) {
        ctx.fillText(`${(i * 1000).toFixed(0)} mA`, padL - 4, yOf(i));
      }

      // axis titles
      ctx.fillStyle = colors.textDim;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('V_CE (volts)', padL + plotW / 2, padT + plotH + 18);
      ctx.save();
      ctx.translate(14, padT + plotH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.textBaseline = 'middle';
      ctx.fillText('I_C (mA)', 0, 0);
      ctx.restore();

      // V_CE_sat boundary
      ctx.strokeStyle = colors.border;
      ctx.setLineDash([2, 4]);
      ctx.beginPath();
      ctx.moveTo(xOf(V_CE_SAT), padT);
      ctx.lineTo(xOf(V_CE_SAT), padT + plotH);
      ctx.stroke();
      ctx.setLineDash([]);

      // curves
      const colorFor = (k: number) => {
        const t = k / (IB_TRACES.length - 1);
        const r = Math.round(255 - 100 * t);
        const g = Math.round(107 + 30 * t);
        const b = Math.round(42 + 80 * t);
        return `rgba(${r},${g},${b},0.95)`;
      };

      IB_TRACES.forEach((IB, k) => {
        ctx.strokeStyle = colorFor(k);
        ctx.lineWidth = IB === I_B_pick ? 2.2 : 1.3;
        ctx.beginPath();
        const N = 240;
        for (let j = 0; j <= N; j++) {
          const v = Vmin + (j / N) * (Vmax - Vmin);
          const i = I_C(v, IB, beta);
          const x = xOf(v);
          const y = yOf(Math.min(Imax, i));
          if (j === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // I_B label at right end
        const yEnd = yOf(Math.min(Imax, I_C(Vmax, IB, beta)));
        ctx.fillStyle = colorFor(k);
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(`I_B = ${(IB * 1e6).toFixed(0)} µA`, padL + plotW - 6, yEnd - 8);
      });

      // operating point: where V_CE slider crosses the picked I_B curve
      const Iop = I_C(V_CE, I_B_pick, beta);
      const opX = xOf(V_CE);
      const opY = yOf(Math.min(Imax, Iop));
      ctx.save();
      ctx.globalAlpha = 0.45;
      ctx.strokeStyle = colors.text;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(opX, padT);
      ctx.lineTo(opX, padT + plotH);
      ctx.stroke();
      ctx.restore();
      ctx.setLineDash([]);
      ctx.fillStyle = colors.text;
      ctx.beginPath();
      ctx.arc(opX, opY, 4, 0, Math.PI * 2);
      ctx.fill();

      // header
      ctx.fillStyle = colors.textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(
        `npn BJT family   β = ${beta.toFixed(0)}   V_A (Early) = ${V_A} V   I_C(op) = ${(Iop * 1000).toFixed(2)} mA`,
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
      figure={figure ?? 'Fig. 14.3'}
      title="BJT output characteristics — I_C vs V_CE"
      question="A small base current I_B controls a much larger collector current I_C. How much larger? And how flat is the response?"
      caption={
        <>
          Each trace is one fixed I_B. Below V_CE ≈ 0.2 V the transistor is in <em>saturation</em>;
          above, it is in the
          <em> active region</em> where I_C ≈ β·I_B. Slope across the active region is the Early
          effect, parameterised by V_A — the curves would be perfectly flat if V_A → ∞.
        </>
      }
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="V_CE"
          value={V_CE}
          min={0}
          max={10}
          step={0.05}
          format={(v) => v.toFixed(2) + ' V'}
          onChange={setVCE}
        />
        <MiniSlider
          label="β"
          value={beta}
          min={20}
          max={400}
          step={5}
          format={(v) => v.toFixed(0)}
          onChange={setBeta}
        />
        <MiniSlider
          label="I_B"
          value={I_B_pick}
          min={5e-6}
          max={80e-6}
          step={1e-6}
          format={(v) => (v * 1e6).toFixed(0) + ' µA'}
          onChange={setIBpick}
        />
        <MiniReadout label="I_C" value={<Num value={I_C_op} />} unit="A" />
        <MiniReadout label="β·I_B" value={<Num value={beta * I_B_pick} />} unit="A" />
      </DemoControls>
    </Demo>
  );
}
