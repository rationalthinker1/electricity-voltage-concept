/**
 * Demo D19.2 — Bridge rectifier with smoothing capacitor
 *
 * Time-domain plot. Input: V_in(t) = V_p sin(2π · f · t), f = 60 Hz.
 * Bridge output (no cap): |V_in| − 2 V_F (two diode drops always in path).
 * With cap C and load R: the cap discharges through R between peaks at
 * τ = R C, then snaps back up at the next peak.
 *
 * Simple discrete-time simulation:
 *   dV_cap/dt = (V_rect − V_cap) / (R_diode C)   when V_rect > V_cap
 *   dV_cap/dt = − V_cap / (R C)                  otherwise
 *
 * Readouts: V_DC (mean of V_cap over the last cycle), V_ripple
 * (peak-to-peak), ripple frequency = 2 f.
 */
import { useMemo, useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, EquationStrip, MiniReadout, MiniSlider, MiniToggle } from '@/components/Demo';
import { InlineMath } from '@/components/Formula';
import { Num } from '@/components/Num';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';
import { drawLabel } from "@/lib/canvasLayout";

interface Props {
  figure: string;
}

const F_LINE = 60; // Hz
const V_F = 0.7; // forward drop per diode (silicon)

export function BridgeRectifierDemo({ figure }: Props) {
  const [Vp, setVp] = useState(17); // V peak (≈ 120 V_rms / √2 scaled down by 10×)
  const [Cuf, setCuf] = useState(470); // µF
  const [Rload, setRload] = useState(50); // Ω
  const [useCap, setUseCap] = useState(true);

  // Simulate one full cycle (16.67 ms) at fine sample resolution to get the
  // steady-state ripple readout. Use 2 cycles of warm-up + 1 measurement cycle.
  const sim = useMemo(() => {
    const C = Cuf * 1e-6;
    const T = 1 / F_LINE;
    const dt = T / 800;
    const N = Math.round((3 * T) / dt);
    const rDiode = 0.1; // small on-resistance for the conducting bridge
    const vCap: number[] = new Array(N + 1).fill(0);
    const vRect: number[] = new Array(N + 1).fill(0);
    let vc = 0;
    for (let k = 0; k <= N; k++) {
      const t = k * dt;
      const vin = Vp * Math.sin(2 * Math.PI * F_LINE * t);
      const vr = Math.max(0, Math.abs(vin) - 2 * V_F);
      vRect[k] = vr;
      if (!useCap) {
        vc = vr;
      } else {
        // Charge if vr > vc, otherwise discharge through R
        if (vr > vc) {
          vc = vc + ((vr - vc) / (rDiode * C)) * dt;
          if (vc > vr) vc = vr;
        } else {
          vc = vc - (vc / (Rload * C)) * dt;
          if (vc < 0) vc = 0;
        }
      }
      vCap[k] = vc;
    }
    // Measurement window: last 1 cycle (steady state)
    const startIdx = Math.round((2 * T) / dt);
    let vMin = Infinity,
      vMax = -Infinity,
      vSum = 0,
      count = 0;
    for (let k = startIdx; k <= N; k++) {
      if (vCap[k] < vMin) vMin = vCap[k];
      if (vCap[k] > vMax) vMax = vCap[k];
      vSum += vCap[k];
      count++;
    }
    const vMean = vSum / count;
    const vRipple = vMax - vMin;
    return { dt, N, vCap, vRect, vMean, vRipple };
  }, [Vp, Cuf, Rload, useCap]);

  const stateRef = useSimState({ Vp, sim });
  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, colors }, _state, _dt, _simTime, ctx0) => {
      let phase = ctx0.phase;
      const { Vp, sim } = stateRef.current;
      phase += 0.005;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);
      const padL = 50,
        padR = 80,
        padT = 18,
        padB = 30;
      const plotW = w - padL - padR;
      const plotH = h - padT - padB;
      const cy = padT + plotH * 0.55;
      const vMax = Math.max(Vp * 1.1, 1);
      const yOf = (v: number) => cy - (v / vMax) * (plotH * 0.45);
      ctx.strokeStyle = colors.border;
      ctx.strokeRect(padL, padT, plotW, plotH);
      ctx.beginPath();
      ctx.moveTo(padL, cy);
      ctx.lineTo(padL + plotW, cy);
      ctx.stroke();
      ctx.save();
      ctx.globalAlpha = 0.65;
      ctx.fillStyle = colors.textDim;
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      for (let k = 0; k <= 3; k++) {
        const x = padL + (k / 3) * plotW;
        ctx.fillText(`${(k * 16.67).toFixed(1)} ms`, x, padT + plotH + 4);
        ctx.restore();
      }
      ctx.save();
      ctx.globalAlpha = 0.55;
      ctx.strokeStyle = colors.text;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let k = 0; k <= sim.N; k++) {
        const t = k * sim.dt;
        const vin = Vp * Math.sin(2 * Math.PI * F_LINE * t + phase);
        const x = padL + (k / sim.N) * plotW;
        const y = yOf(vin);
        if (k === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();
      ctx.strokeStyle = colors.teal;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      for (let k = 0; k <= sim.N; k++) {
        const x = padL + (k / sim.N) * plotW;
        const y = yOf(sim.vRect[k]);
        if (k === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.9;
      ctx.beginPath();
      for (let k = 0; k <= sim.N; k++) {
        const x = padL + (k / sim.N) * plotW;
        const y = yOf(sim.vCap[k]);
        if (k === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = colors.accent;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(padL, yOf(sim.vMean));
      ctx.lineTo(padL + plotW, yOf(sim.vMean));
      ctx.stroke();
      ctx.restore();
      ctx.setLineDash([]);
      ctx.save();
      ctx.globalAlpha = 0.65;
      drawLabel(ctx, { text: '0', x: padL - 4, y: cy, align: 'right', baseline: 'middle' });
      ctx.restore();
      drawLabel(ctx, { text: `+${Vp.toFixed(0)} V`, x: padL - 4, y: yOf(Vp) });
      drawLabel(ctx, { text: `−${Vp.toFixed(0)} V`, x: padL - 4, y: yOf(-Vp) });
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      const lx = padL + plotW + 8;
      ctx.fillStyle = colors.text;
      ctx.fillRect(lx, padT + 8 - 1, 10, 2);
      drawLabel(ctx, { text: 'V_in', x: lx + 14, y: padT + 8, color: colors.text, font: '10px "JetBrains Mono", monospace', baseline: 'middle' });
      ctx.fillStyle = colors.teal;
      ctx.fillRect(lx, padT + 24 - 1, 10, 2);
      drawLabel(ctx, { text: '|V_rect|', x: lx + 14, y: padT + 24, color: colors.text, font: '10px "JetBrains Mono", monospace', baseline: 'middle' });
      ctx.fillStyle = colors.accent;
      ctx.fillRect(lx, padT + 40 - 1, 10, 2);
      drawLabel(ctx, { text: 'V_out', x: lx + 14, y: padT + 40, color: colors.text, font: '10px "JetBrains Mono", monospace', baseline: 'middle' });
      ctx0.phase = phase;
    },
    [],
    () => ({ context: { phase: 0 } }),
  );

  return (
    <Demo
      figure={figure}
      title="Bridge rectifier with smoothing cap"
      question="Where does the ripple come from — and what knob makes it go down?"
      caption={
        <>
          Four diodes flip the negative half-cycle up; the cap charges to ≈ V<sub>p</sub> − 2 V
          <sub>F</sub> on each peak and discharges through the load between peaks. The ripple
          frequency is twice the line frequency (120 Hz from 60 Hz mains). Ripple voltage ≈ I
          <sub>load</sub> / (2 f C): bigger C, smaller ripple.
        </>
      }
      deeperLab={{ slug: 'rc-circuit', label: 'See RC transient lab' }}
    >
      <AutoResizeCanvas height={280} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="V_peak"
          value={Vp}
          min={5}
          max={50}
          step={1}
          format={(v) => v.toFixed(0) + ' V'}
          onChange={setVp}
        />
        <MiniSlider
          label="C"
          value={Cuf}
          min={10}
          max={4700}
          step={10}
          format={(v) => (v >= 1000 ? (v / 1000).toFixed(1) + ' mF' : v.toFixed(0) + ' µF')}
          onChange={setCuf}
        />
        <MiniSlider
          label="R_load"
          value={Rload}
          min={5}
          max={500}
          step={1}
          format={(v) => v.toFixed(0) + ' Ω'}
          onChange={setRload}
        />
        <MiniToggle label="smoothing cap" checked={useCap} onChange={setUseCap} />
        <MiniReadout label="V_DC" value={<Num value={sim.vMean} />} unit="V" />
        <MiniReadout label="V_ripple" value={<Num value={sim.vRipple} />} unit="V pp" />
        <MiniReadout label="f_ripple" value="120" unit="Hz" />
      </DemoControls>
      <EquationStrip
        leftLabel="Rectified peak"
        left={<InlineMath tex={`V_{\\text{DC}} \\approx V_p - 2V_F = ${Vp.toFixed(0)} - ${(2 * V_F).toFixed(1)} = ${(Vp - 2 * V_F).toFixed(1)}\\,\\text{V}`} />}
        rightLabel="Ripple (cap smoothed)"
        right={<InlineMath tex={`V_{\\text{ripple}} \\approx \\frac{V_{\\text{DC}}}{2fRC} = ${sim.vRipple.toFixed(2)}\\,\\text{V}`} />}
      />
    </Demo>
  );
}
