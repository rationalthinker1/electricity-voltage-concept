/**
 * Demo D19.7 — Boost (step-up) DC-DC converter
 *
 * Topology:
 *
 *   V_in ── L ──┬── D ──┬── V_out
 *               │       │
 *              [SW]    [C] ── R_load
 *               │       │
 *   GND ────────┴───────┴──── GND
 *
 * When SW is closed (on-time t_on = D · T_sw), the inductor sees V_in
 * and its current ramps up (slope V_in/L). When SW opens, the inductor
 * current — which cannot change discontinuously — forward-biases the
 * diode and dumps into the output cap; the inductor now sees
 * V_in − V_out (negative), and current ramps down (slope (V_in − V_out)/L).
 *
 * Volt-second balance: V_in · D = (V_out − V_in) · (1 − D)
 * → V_out = V_in / (1 − D).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';

interface Props {
  figure?: string;
}

const F_SW = 100e3; // 100 kHz
const L = 22e-6; // 22 µH inductor
const C = 47e-6; // 47 µF output cap
const ETA = 0.93; // typical boost efficiency

export function BoostConverterDemo({ figure }: Props) {
  const [Vin, setVin] = useState(5);
  const [duty, setDuty] = useState(0.5);
  const [Rload, setRload] = useState(20);

  const computed = useMemo(() => {
    const Vout = Vin / Math.max(1 - duty, 0.01);
    const Iout = Vout / Rload;
    const Iin_ideal = (Vout * Iout) / Vin;
    const Iin = Iin_ideal / ETA;
    const Tsw = 1 / F_SW;
    const tOn = duty * Tsw;
    const tOff = (1 - duty) * Tsw;
    const dIL_on = Vin / L; // A/s while SW on
    const dIL_off = (Vin - Vout) / L; // A/s while SW off (negative)
    const dIL_pp = dIL_on * tOn;
    // Output ripple from cap discharging into load during t_on
    const Vripple = (Iout * tOn) / C;
    const Pout = Vout * Iout;
    return { Vout, Iout, Iin, Iin_ideal, Tsw, tOn, tOff, dIL_on, dIL_off, dIL_pp, Vripple, Pout };
  }, [Vin, duty, Rload]);

  const stateRef = useRef(computed);
  useEffect(() => {
    stateRef.current = computed;
  }, [computed]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, colors } = info;
    let raf = 0;

    function draw() {
      const { Vout, Iout, Tsw, tOn, dIL_pp } = stateRef.current;

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      const padL = 50,
        padR = 20,
        padT = 18,
        padB = 28;
      const plotW = w - padL - padR;
      const plotH = h - padT - padB;
      const subH = plotH / 2 - 6;
      const top = padT;
      const mid = padT + subH + 12;

      ctx.strokeStyle = colors.border;
      ctx.strokeRect(padL, top, plotW, subH);
      ctx.strokeRect(padL, mid, plotW, subH);

      const Ncyc = 4;
      const tTotal = Ncyc * Tsw;

      // Top sub-plot: switch-node voltage. When SW closed, switch node = 0;
      // when SW open, switch node = V_out (one diode drop above output).
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      const yLo = top + subH - 6;
      const yHi = top + 6;
      let first = true;
      for (let k = 0; k < Ncyc; k++) {
        const ts = k * Tsw;
        const x0 = padL + (ts / tTotal) * plotW;
        const x1 = padL + ((ts + tOn) / tTotal) * plotW;
        const x2 = padL + ((ts + Tsw) / tTotal) * plotW;
        if (first) {
          ctx.moveTo(x0, yLo);
          first = false;
        }
        ctx.lineTo(x0, yLo); // closed → low
        ctx.lineTo(x1, yLo);
        ctx.lineTo(x1, yHi); // opens → switch node jumps to V_out
        ctx.lineTo(x2, yHi);
      }
      ctx.stroke();

      ctx.save();
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = colors.textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(`V_out`, padL - 4, yHi);
      ctx.restore();
      ctx.fillText(`0`, padL - 4, yLo);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('switch-node voltage', padL + 4, top + 4);

      // Bottom sub-plot: inductor current — triangular ramp
      // Average is the input current. ΔI_L pp = (V_in / L) · t_on
      const Iin_avg = stateRef.current.Iin_ideal;
      const Imax = Iin_avg + dIL_pp / 2;
      const Imin = Math.max(0, Iin_avg - dIL_pp / 2);
      const yMaxTop = mid + 6;
      const yMinBot = mid + subH - 6;
      const iOf = (i: number) => yMinBot - (i / Math.max(Imax * 1.15, 0.1)) * (yMinBot - yMaxTop);

      // dashed avg
      ctx.save();
      ctx.globalAlpha = 0.4;
      ctx.strokeStyle = colors.teal;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(padL, iOf(Iin_avg));
      ctx.lineTo(padL + plotW, iOf(Iin_avg));
      ctx.stroke();
      ctx.restore();
      ctx.setLineDash([]);

      ctx.strokeStyle = colors.teal;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (let k = 0; k < Ncyc; k++) {
        const ts = k * Tsw;
        const x0 = padL + (ts / tTotal) * plotW;
        const x1 = padL + ((ts + tOn) / tTotal) * plotW;
        const x2 = padL + ((ts + Tsw) / tTotal) * plotW;
        if (k === 0) ctx.moveTo(x0, iOf(Imin));
        ctx.lineTo(x1, iOf(Imax));
        ctx.lineTo(x2, iOf(Imin));
      }
      ctx.stroke();

      ctx.save();
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = colors.textDim;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${Imax.toFixed(2)} A`, padL - 4, iOf(Imax));
      ctx.restore();
      ctx.fillText(`${Iin_avg.toFixed(2)} A`, padL - 4, iOf(Iin_avg));
      ctx.fillText(`${Imin.toFixed(2)} A`, padL - 4, iOf(Imin));
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('inductor current I_L  (= input current)', padL + 4, mid + 4);

      // x-axis
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('0', padL, padT + plotH + 4);
      ctx.fillText(`${(tTotal * 1e6).toFixed(0)} µs`, padL + plotW, padT + plotH + 4);

      // Header
      ctx.save();
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = colors.textDim;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(
        `V_out = V_in / (1 − D) = ${Vout.toFixed(2)} V    I_out = ${Iout.toFixed(2)} A`,
        4,
        4,
      );
      ctx.restore();

      // Annotate switch states
      ctx.save();
      ctx.globalAlpha = 0.65;
      ctx.fillStyle = colors.accent;
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      const x_on = padL + (tOn / 2 / tTotal) * plotW;
      const x_off = padL + ((tOn + (Tsw - tOn) / 2) / tTotal) * plotW;
      ctx.fillText('SW on: L charging', x_on, top + subH - 16);
      ctx.restore();
      ctx.fillText('SW off: dump → C', x_off, top + subH - 16);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 19.7'}
      title="Boost converter: V_out = V_in / (1 − D)"
      question="Push the duty cycle past 0.8. Where does V_out go — and why does the equation blow up at D = 1?"
      caption={
        <>
          Inductor in series with the input, switch to ground, diode to the output. While the switch
          is on, the inductor stores energy from V<sub>in</sub>; while it is off, that stored energy
          is forced through the diode into the output capacitor, which must therefore sit{' '}
          <em>above</em> V<sub>in</sub>. Volt-second balance on L gives{' '}
          <strong>
            V<sub>out</sub> = V<sub>in</sub> / (1 − D)
          </strong>
          . The input current is the inductor average and is always larger than the output current —
          by the same factor the voltage steps up. Real converters cap at D ≈ 0.85 because resistive
          losses in the switch and inductor blow up the implicit equation past that.
        </>
      }
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="V_in"
          value={Vin}
          min={2}
          max={24}
          step={0.5}
          format={(v) => v.toFixed(1) + ' V'}
          onChange={setVin}
        />
        <MiniSlider
          label="duty D"
          value={duty}
          min={0.05}
          max={0.9}
          step={0.01}
          format={(v) => (v * 100).toFixed(0) + ' %'}
          onChange={setDuty}
        />
        <MiniSlider
          label="R_load"
          value={Rload}
          min={2}
          max={200}
          step={1}
          format={(v) => Math.round(v) + ' Ω'}
          onChange={setRload}
        />
        <MiniReadout label="V_out" value={<Num value={computed.Vout} digits={2} />} unit="V" />
        <MiniReadout label="I_out" value={<Num value={computed.Iout} digits={2} />} unit="A" />
        <MiniReadout label="I_in" value={<Num value={computed.Iin} digits={2} />} unit="A" />
        <MiniReadout
          label="ripple V"
          value={<Num value={computed.Vripple} digits={2} />}
          unit="V"
        />
        <MiniReadout label="η (typ.)" value={<Num value={ETA * 100} digits={0} />} unit="%" />
      </DemoControls>
    </Demo>
  );
}
