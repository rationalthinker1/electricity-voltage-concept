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
import { useState } from 'react';
import { drawLabel } from '@/lib/canvasLayout';
import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';
import { drawAxes, drawLinePlot, drawVLine, makePlotMappers } from '@/lib/drawPlot';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

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

  const stateRef = useSimState({ V_CE, beta, I_B_pick });
  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, colors }, _state, _dt, _simTime) => {
      const { V_CE, beta, I_B_pick } = stateRef.current;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);
      const padL = 60,
        padR = 20,
        padT = 20,
        padB = 36;
      const rect = { x: padL, y: padT, w: w - padL - padR, h: h - padT - padB };
      const Vmin = 0,
        Vmax = 10;
      const Imax = 0.012;
      const xTicks: number[] = [];
      for (let v = 0; v <= Vmax; v += 2) xTicks.push(v);
      const yTicks: number[] = [];
      for (let i = 0; i <= Imax + 1e-9; i += 0.002) yTicks.push(i);

      drawAxes(ctx, rect, {
        xMin: Vmin,
        xMax: Vmax,
        yMin: 0,
        yMax: Imax,
        xTicks,
        yTicks,
        xLabel: 'V_CE (volts)',
        xTickFormat: (v) => v.toFixed(0),
        yTickFormat: (i) => `${(i * 1000).toFixed(0)} mA`,
      });
      const { xOf, yOf } = makePlotMappers(rect, Vmin, Vmax, 0, Imax);
      // Rotated y-axis label — drawAxes' yLabel sits a fixed distance from
      // the frame which is too close in this layout; keep this manual.
      ctx.save();
      ctx.fillStyle = colors.textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.translate(14, padT + rect.h / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('I_C (mA)', 0, 0);
      ctx.restore();
      // V_CE_SAT marker (dashed vertical)
      drawVLine(ctx, rect, V_CE_SAT, Vmin, Vmax, {
        color: colors.border,
        dash: [2, 4],
        alpha: 1,
      });
      const colorFor = (k: number) => {
        const t = k / (IB_TRACES.length - 1);
        const r = Math.round(255 - 100 * t);
        const g = Math.round(107 + 30 * t);
        const b = Math.round(42 + 80 * t);
        return `rgba(${r},${g},${b},0.95)`;
      };
      IB_TRACES.forEach((IB, k) => {
        const color = colorFor(k);
        const N = 240;
        const pts: { x: number; y: number }[] = [];
        for (let j = 0; j <= N; j++) {
          const v = Vmin + (j / N) * (Vmax - Vmin);
          pts.push({ x: v, y: Math.min(Imax, I_C(v, IB, beta)) });
        }
        drawLinePlot(ctx, rect, pts, Vmin, Vmax, 0, Imax, {
          color,
          lineWidth: IB === I_B_pick ? 2.2 : 1.3,
        });

        // I_B label at right end
        const yEnd = yOf(Math.min(Imax, I_C(Vmax, IB, beta)));
        drawLabel(ctx, {
          x: padL + rect.w - 6,
          y: yEnd - 8,
          text: `I_B = ${(IB * 1e6).toFixed(0)} µA`,
          color,
          align: 'right',
          baseline: 'middle',
        });
      });
      const Iop = I_C(V_CE, I_B_pick, beta);
      const opX = xOf(V_CE);
      const opY = yOf(Math.min(Imax, Iop));
      drawVLine(ctx, rect, V_CE, Vmin, Vmax, {
        color: colors.text,
        dash: [3, 3],
        alpha: 0.45,
      });
      ctx.fillStyle = colors.text;
      ctx.beginPath();
      ctx.arc(opX, opY, 4, 0, Math.PI * 2);
      ctx.fill();
      drawLabel(ctx, {
        x: padL,
        y: 6,
        text: `npn BJT family   β = ${beta.toFixed(0)}   V_A (Early) = ${V_A} V   I_C(op) = ${(Iop * 1000).toFixed(2)} mA`,
        color: colors.textDim,
        baseline: 'top',
      });
    },
    [],
  );

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
