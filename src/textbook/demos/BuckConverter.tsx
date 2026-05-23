/**
 * Demo D19.4 — Buck (step-down) converter
 *
 * The canonical PWM step-down topology:
 *
 *   V_in ─── [SW] ──┬── L ──┬── V_out
 *                   │       │
 *                  [D]     [C] ── R_load
 *                   │       │
 *   GND ────────────┴───────┴──── GND
 *
 * In steady state (continuous conduction mode), volt-second balance on L
 * gives V_out = D · V_in, where D is the PWM duty cycle. The inductor
 * current ramps up while SW is on (slope = (V_in − V_out) / L) and ramps
 * down while SW is off (slope = − V_out / L).
 *
 * The animation shows the inductor current waveform and the switch
 * pulses. Slider: D, V_in, R_load.
 */
import { useState } from 'react';
import { drawLabel } from '@/lib/canvasLayout';
import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

interface Props {
  figure: string;
}

const F_SW = 100e3; // 100 kHz switching frequency
const L = 47e-6; // 47 µH inductor (typical for ~5 A buck)

export function BuckConverterDemo({ figure }: Props) {
  const [Vin, setVin] = useState(12);
  const [duty, setDuty] = useState(0.42);
  const [Rload, setRload] = useState(1.0);

  const Vout = duty * Vin;
  const Iout = Vout / Rload;
  const dIL_on = (Vin - Vout) / L; // A/s
  const dIL_off = -Vout / L; // A/s
  const Tsw = 1 / F_SW;
  const tOn = duty * Tsw;
  const tOff = (1 - duty) * Tsw;
  const dIL_pp = dIL_on * tOn; // peak-to-peak ripple
  const Pout = Vout * Iout;
  // Assume 92% efficiency (typical sync buck)
  const eta = 0.92;
  const Pin = Pout / eta;

  const stateRef = useSimState({ Vin, Vout, duty, dIL_on, dIL_off, Tsw, tOn, tOff, Iout });
  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, colors }, _state, _dt, _simTime) => {
      const { Vout, duty, dIL_on, dIL_off, Tsw, tOn, Iout } = stateRef.current;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);
      const padL = 50,
        padR = 20,
        padT = 18,
        padB = 32;
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
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      const yHi = top + 6;
      const yLo = top + subH - 6;
      let firstSeg = true;
      for (let k = 0; k < Ncyc; k++) {
        const tStart = k * Tsw;
        const xOn0 = padL + (tStart / tTotal) * plotW;
        const xOn1 = padL + ((tStart + tOn) / tTotal) * plotW;
        const xOff1 = padL + ((tStart + Tsw) / tTotal) * plotW;
        if (firstSeg) {
          ctx.moveTo(xOn0, yLo);
          firstSeg = false;
        }
        ctx.lineTo(xOn0, yHi);
        ctx.lineTo(xOn1, yHi);
        ctx.lineTo(xOn1, yLo);
        ctx.lineTo(xOff1, yLo);
      }
      ctx.stroke();
      ctx.save();
      ctx.globalAlpha = 0.8;
      drawLabel(ctx, { text: 'V_in', x: padL - 4, y: yHi, font: '10px "JetBrains Mono", monospace', align: 'right', baseline: 'middle' });
      ctx.restore();
      drawLabel(ctx, { text: '0', x: padL - 4, y: yLo });
      drawLabel(ctx, { text: `switch node (D = ${(duty * 100).toFixed(0)} %)`, x: padL + 4, y: top + 4, baseline: 'top' });
      const dIL_pp = dIL_on * tOn;
      const Imax = Iout + dIL_pp / 2;
      const Imin = Math.max(0, Iout - dIL_pp / 2);
      const yMax = mid + 6;
      const yMin = mid + subH - 6;
      const iOf = (i: number) => yMin - ((i - 0) / Math.max(Imax * 1.15, 0.1)) * (yMin - yMax);
      ctx.save();
      ctx.globalAlpha = 0.4;
      ctx.strokeStyle = colors.teal;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(padL, iOf(Iout));
      ctx.lineTo(padL + plotW, iOf(Iout));
      ctx.stroke();
      ctx.restore();
      ctx.setLineDash([]);
      ctx.strokeStyle = colors.teal;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      let iL = Imin;
      const x0 = padL;
      ctx.moveTo(x0, iOf(iL));
      const samples = 600;
      for (let s = 0; s <= samples; s++) {
        const t = (s / samples) * tTotal;
        const tInCyc = t % Tsw;
        // Build saw-tooth: piecewise linear
        const cyc = Math.floor(t / Tsw);
        // Reset at cyc start
        if (tInCyc === 0) iL = Imin;
        const dt = s > 0 ? tTotal / samples : 0;
        if (tInCyc < tOn) iL = iL + dIL_on * dt;
        else iL = iL + dIL_off * dt;
        // For visibility, clamp & re-seed each cycle to avoid drift
        const yc =
          tInCyc < tOn ? iOf(Imin + dIL_on * tInCyc) : iOf(Imax + dIL_off * (tInCyc - tOn));
        const x = padL + ((cyc * Tsw + tInCyc) / tTotal) * plotW;
        ctx.lineTo(x, yc);
      }
      ctx.stroke();
      ctx.save();
      ctx.globalAlpha = 0.8;
      drawLabel(ctx, { text: `${Imax.toFixed(2)} A`, x: padL - 4, y: iOf(Imax), align: 'right', baseline: 'middle' });
      ctx.restore();
      drawLabel(ctx, { text: `${Iout.toFixed(2)} A`, x: padL - 4, y: iOf(Iout) });
      drawLabel(ctx, { text: `${Imin.toFixed(2)} A`, x: padL - 4, y: iOf(Imin) });
      drawLabel(ctx, { text: 'inductor current  I_L', x: padL + 4, y: mid + 4, baseline: 'top' });
      drawLabel(ctx, { text: `0`, x: padL, y: padT + plotH + 4, align: 'center', baseline: 'top' });
      drawLabel(ctx, { text: `${(tTotal * 1e6).toFixed(0)} µs`, x: padL + plotW, y: padT + plotH + 4, align: 'center', baseline: 'top' });
      ctx.save();
      ctx.globalAlpha = 0.8;
      drawLabel(ctx, {
        x: 4,
        y: 4,
        text: `V_out = D · V_in = ${Vout.toFixed(2)} V`,
        color: colors.textDim,
        baseline: 'top',
      });
      ctx.restore();
    },
    [],
  );

  return (
    <Demo
      figure={figure}
      title="Buck converter: V_out = D · V_in"
      question="Slide the duty cycle. Where does the output voltage land — and what does the inductor current look like?"
      caption={
        <>
          A switch chops V<sub>in</sub> at ~100 kHz with duty cycle D. The inductor averages the
          chopped waveform (volt-second balance), giving V<sub>out</sub> = D · V<sub>in</sub>. The
          visible sawtooth is the inductor's ripple current — its peak-to-peak is ΔI<sub>L</sub> =
          (V<sub>in</sub> − V<sub>out</sub>) · D · T<sub>sw</sub> / L. Efficiencies of 92–98% are
          routine in modern synchronous buck silicon.
        </>
      }
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="V_in"
          value={Vin}
          min={5}
          max={48}
          step={0.5}
          format={(v) => v.toFixed(1) + ' V'}
          onChange={setVin}
        />
        <MiniSlider
          label="duty D"
          value={duty}
          min={0.05}
          max={0.95}
          step={0.01}
          format={(v) => (v * 100).toFixed(0) + ' %'}
          onChange={setDuty}
        />
        <MiniSlider
          label="R_load"
          value={Rload}
          min={0.5}
          max={10}
          step={0.1}
          format={(v) => v.toFixed(1) + ' Ω'}
          onChange={setRload}
        />
        <MiniReadout label="V_out" value={<Num value={Vout} />} unit="V" />
        <MiniReadout label="I_out" value={<Num value={Iout} />} unit="A" />
        <MiniReadout label="ΔI_L pp" value={<Num value={dIL_pp} />} unit="A" />
        <MiniReadout label="P_in (η=92%)" value={<Num value={Pin} />} unit="W" />
      </DemoControls>
    </Demo>
  );
}
