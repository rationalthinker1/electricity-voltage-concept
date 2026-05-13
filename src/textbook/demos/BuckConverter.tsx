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
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';

interface Props { figure?: string }

const F_SW = 100e3;     // 100 kHz switching frequency
const L = 47e-6;        // 47 µH inductor (typical for ~5 A buck)

export function BuckConverterDemo({ figure }: Props) {
  const [Vin, setVin] = useState(12);
  const [duty, setDuty] = useState(0.42);
  const [Rload, setRload] = useState(1.0);

  const Vout = duty * Vin;
  const Iout = Vout / Rload;
  const dIL_on  =  (Vin - Vout) / L;     // A/s
  const dIL_off = -Vout / L;             // A/s
  const Tsw = 1 / F_SW;
  const tOn = duty * Tsw;
  const tOff = (1 - duty) * Tsw;
  const dIL_pp = dIL_on * tOn;           // peak-to-peak ripple
  const Pout = Vout * Iout;
  // Assume 92% efficiency (typical sync buck)
  const eta = 0.92;
  const Pin = Pout / eta;

  const stateRef = useRef({ Vin, Vout, duty, dIL_on, dIL_off, Tsw, tOn, tOff, Iout });
  useEffect(() => {
    stateRef.current = { Vin, Vout, duty, dIL_on, dIL_off, Tsw, tOn, tOff, Iout };
  }, [Vin, Vout, duty, dIL_on, dIL_off, Tsw, tOn, tOff, Iout]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h } = info;
    let raf = 0;

    function draw() {
      const { Vout, duty, dIL_on, dIL_off, Tsw, tOn, Iout } = stateRef.current;

      ctx.fillStyle = '#0d0d10';
      ctx.fillRect(0, 0, w, h);

      const padL = 50, padR = 20, padT = 18, padB = 32;
      const plotW = w - padL - padR;
      const plotH = h - padT - padB;

      // Two stacked sub-plots: top = switch state (V_sw node), bottom = I_L
      const subH = plotH / 2 - 6;
      const top = padT;
      const mid = padT + subH + 12;

      // frame: SW
      ctx.strokeStyle = 'rgba(255,255,255,0.10)';
      ctx.strokeRect(padL, top, plotW, subH);
      // frame: I_L
      ctx.strokeRect(padL, mid, plotW, subH);

      // We show ~4 switching cycles
      const Ncyc = 4;
      const tTotal = Ncyc * Tsw;

      // Sub-plot 1: switch-node voltage (rectangular pulses)
      ctx.strokeStyle = 'rgba(255,107,42,1.0)';
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
        if (firstSeg) { ctx.moveTo(xOn0, yLo); firstSeg = false; }
        ctx.lineTo(xOn0, yHi);
        ctx.lineTo(xOn1, yHi);
        ctx.lineTo(xOn1, yLo);
        ctx.lineTo(xOff1, yLo);
      }
      ctx.stroke();

      ctx.fillStyle = 'rgba(160,158,149,0.80)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillText('V_in',  padL - 4, yHi);
      ctx.fillText('0',     padL - 4, yLo);
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText(`switch node (D = ${(duty * 100).toFixed(0)} %)`, padL + 4, top + 4);

      // Sub-plot 2: inductor current — saw-tooth around I_avg = I_out
      const dIL_pp = dIL_on * tOn;
      const Imax = Iout + dIL_pp / 2;
      const Imin = Math.max(0, Iout - dIL_pp / 2);
      const yMax = mid + 6;
      const yMin = mid + subH - 6;
      const iOf = (i: number) => yMin - ((i - 0) / Math.max(Imax * 1.15, 0.1)) * (yMin - yMax);

      // Reference: I_out (dashed)
      ctx.strokeStyle = 'rgba(108,197,194,0.40)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(padL, iOf(Iout));
      ctx.lineTo(padL + plotW, iOf(Iout));
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.strokeStyle = 'rgba(108,197,194,1.0)';
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
        const dt = (s > 0 ? tTotal / samples : 0);
        if (tInCyc < tOn) iL = iL + dIL_on * dt;
        else iL = iL + dIL_off * dt;
        // For visibility, clamp & re-seed each cycle to avoid drift
        const yc = (tInCyc < tOn)
          ? iOf(Imin + dIL_on * tInCyc)
          : iOf(Imax + dIL_off * (tInCyc - tOn));
        const x = padL + ((cyc * Tsw + tInCyc) / tTotal) * plotW;
        ctx.lineTo(x, yc);
      }
      ctx.stroke();

      ctx.fillStyle = 'rgba(160,158,149,0.80)';
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillText(`${Imax.toFixed(2)} A`, padL - 4, iOf(Imax));
      ctx.fillText(`${Iout.toFixed(2)} A`, padL - 4, iOf(Iout));
      ctx.fillText(`${Imin.toFixed(2)} A`, padL - 4, iOf(Imin));
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText('inductor current  I_L', padL + 4, mid + 4);

      // x-axis tick: time
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText(`0`,                              padL,             padT + plotH + 4);
      ctx.fillText(`${(tTotal * 1e6).toFixed(0)} µs`, padL + plotW,     padT + plotH + 4);

      // Header
      ctx.fillStyle = 'rgba(160,158,149,0.80)';
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText(`V_out = D · V_in = ${Vout.toFixed(2)} V`, 4, 4);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 19.4'}
      title="Buck converter: V_out = D · V_in"
      question="Slide the duty cycle. Where does the output voltage land — and what does the inductor current look like?"
      caption={<>
        A switch chops V<sub>in</sub> at ~100 kHz with duty cycle D. The inductor averages the
        chopped waveform (volt-second balance), giving V<sub>out</sub> = D · V<sub>in</sub>.
        The visible sawtooth is the inductor's ripple current — its peak-to-peak is
        ΔI<sub>L</sub> = (V<sub>in</sub> − V<sub>out</sub>) · D · T<sub>sw</sub> / L. Efficiencies of 92–98%
        are routine in modern synchronous buck silicon.
      </>}
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="V_in"
          value={Vin} min={5} max={48} step={0.5}
          format={v => v.toFixed(1) + ' V'}
          onChange={setVin}
        />
        <MiniSlider
          label="duty D"
          value={duty} min={0.05} max={0.95} step={0.01}
          format={v => (v * 100).toFixed(0) + ' %'}
          onChange={setDuty}
        />
        <MiniSlider
          label="R_load"
          value={Rload} min={0.5} max={10} step={0.1}
          format={v => v.toFixed(1) + ' Ω'}
          onChange={setRload}
        />
        <MiniReadout label="V_out"   value={<Num value={Vout} />}    unit="V" />
        <MiniReadout label="I_out"   value={<Num value={Iout} />}    unit="A" />
        <MiniReadout label="ΔI_L pp" value={<Num value={dIL_pp} />}  unit="A" />
        <MiniReadout label="P_in (η=92%)" value={<Num value={Pin} />} unit="W" />
      </DemoControls>
    </Demo>
  );
}
