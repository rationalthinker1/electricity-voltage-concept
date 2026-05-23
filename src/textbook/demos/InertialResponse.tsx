/**
 * Demo D17.7 — Inertial response after a generator trip
 *
 * Swing equation for an aggregate grid:
 *   2H · df/dt = P_gen − P_load     (per-unit, with H in seconds)
 *
 * At t = 0 a generator trips and P_gen drops by ΔP. Frequency falls at
 * an initial rate of −ΔP/(2H) Hz/s, until governors respond with a
 * primary frequency response proportional to (f_nom − f):
 *   P_gov = K_gov · (f_nom − f) / f_nom
 * Frequency drops, reaches a nadir, then partially recovers to a new
 * steady-state offset (no AGC in this demo). Compare high-inertia
 * (synchronous-rich, H = 5 s) vs low-inertia (inverter-rich, H = 1 s).
 */
import { useState } from 'react';

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

const F_NOM = 60; // Hz nominal
const SIM_DURATION = 30; // seconds shown
const K_GOV = 25; // governor gain (per-unit power per per-unit freq)

interface Trace {
  ts: number[];
  fs: number[];
}

function simulate(H: number, deltaP: number): Trace {
  const ts: number[] = [];
  const fs: number[] = [];
  let f = F_NOM;
  const dt = 0.01;
  const govDelay = 1.0; // s, before governor response starts
  for (let t = 0; t <= SIM_DURATION; t += dt) {
    ts.push(t);
    fs.push(f);
    if (t < 0.5) {
      // pre-trip steady
      continue;
    }
    const elapsed = t - 0.5;
    const govScale = elapsed > govDelay ? Math.min(1, (elapsed - govDelay) / 2) : 0;
    const Pgov = K_GOV * ((F_NOM - f) / F_NOM) * govScale;
    const Pnet = -deltaP + Pgov;
    // df/dt = (Pnet / (2H)) × f_nom
    const dfdt = (Pnet * F_NOM) / (2 * H);
    f += dfdt * dt;
    if (f < 50) f = 50;
  }
  return { ts, fs };
}

export function InertialResponseDemo({ figure }: Props) {
  const [deltaP, setDeltaP] = useState(0.05); // 5% of system rating
  const [showHigh, setShowHigh] = useState(true);
  const [showLow, setShowLow] = useState(true);

  const stateRef = useSimState({ deltaP, showHigh, showLow });
  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, colors }, _state, _dt, _simTime) => {
      const { deltaP, showHigh, showLow } = stateRef.current;
      const traceHigh = showHigh ? simulate(5, deltaP) : null;
      const traceLow = showLow ? simulate(1, deltaP) : null;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);
      const padL = 56,
        padR = 24,
        padT = 22,
        padB = 38;
      const plotW = w - padL - padR;
      const plotH = h - padT - padB;
      ctx.strokeStyle = colors.border;
      ctx.strokeRect(padL, padT, plotW, plotH);
      const fMin = F_NOM - 3;
      const fMax = F_NOM + 0.2;
      const xAt = (t: number) => padL + (t / SIM_DURATION) * plotW;
      const yAt = (f: number) => padT + plotH - ((f - fMin) / (fMax - fMin)) * plotH;
      ctx.strokeStyle = colors.border;
      for (let f = Math.ceil(fMin); f <= fMax; f += 0.5) {
        const y = yAt(f);
        ctx.beginPath();
        ctx.moveTo(padL, y);
        ctx.lineTo(padL + plotW, y);
        ctx.stroke();
      }
      ctx.strokeStyle = colors.teal;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(padL, yAt(F_NOM));
      ctx.lineTo(padL + plotW, yAt(F_NOM));
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = colors.textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      for (let f = Math.ceil(fMin); f <= 60; f += 1) {
        ctx.fillText(f.toFixed(0), padL - 6, yAt(f));
      }
      ctx.save();
      ctx.translate(16, padT + plotH / 2);
      ctx.rotate(-Math.PI / 2);
      drawLabel(ctx, { text: 'frequency (Hz) →', x: 0, y: 0, align: 'center', baseline: 'middle' });
      ctx.restore();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      for (let t = 0; t <= SIM_DURATION; t += 5) {
        ctx.fillText(t.toFixed(0), xAt(t), padT + plotH + 4);
      }
      drawLabel(ctx, { text: 'time after trip (s) →', x: padL + plotW / 2, y: padT + plotH + 20 });
      function plotTrace(trace: Trace, color: string) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < trace.ts.length; i++) {
          const x = xAt(trace.ts[i]);
          const y = yAt(Math.max(fMin, trace.fs[i]));
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      if (traceHigh) plotTrace(traceHigh, colors.teal);
      if (traceLow) plotTrace(traceLow, colors.pink);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      const legX = padL + 8;
      let legY = padT + 6;
      const lg = (color: string, label: string) => {
        ctx.fillStyle = color;
        ctx.fillRect(legX, legY + 4, 14, 3);
        drawLabel(ctx, { text: label, x: legX + 20, y: legY + 1, color: colors.text });
        legY += 14;
      };
      if (showHigh) lg(colors.teal, 'high inertia, H = 5 s (synchronous-rich)');
      if (showLow) lg(colors.pink, 'low inertia, H = 1 s (inverter-rich)');
    },
    [],
  );

  // Compute initial rate of change (RoCoF) for the readouts.
  const rocofHigh = (-deltaP * F_NOM) / (2 * 5);
  const rocofLow = (-deltaP * F_NOM) / (2 * 1);

  return (
    <Demo
      figure={figure}
      title="Inertial response: what 'frequency dip' looks like"
      question="A generator trips. The grid's rotating mass is the only thing keeping frequency stable in the first second."
      caption={
        <>
          Swing equation: 2H · df/dt = ΔP. With H = 5 s (lots of synchronous machines) a 5%
          generation loss gives an initial frequency drop of 0.3 Hz/s; with H = 1 s (lots of
          inverters, no rotating mass) the same loss gives 1.5 Hz/s. Governor response begins after
          ~1 s and arrests the fall, but the nadir is much deeper in the low-inertia case — this is
          the heart of the modern grid stability debate.
        </>
      }
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="ΔP (lost generation)"
          value={deltaP}
          min={0.01}
          max={0.15}
          step={0.005}
          format={(v) => (v * 100).toFixed(1) + '% sys'}
          onChange={setDeltaP}
        />
        <MiniToggle label="show H=5 s" checked={showHigh} onChange={setShowHigh} />
        <MiniToggle label="show H=1 s" checked={showLow} onChange={setShowLow} />
        <MiniReadout label="RoCoF, H=5" value={<Num value={rocofHigh} digits={2} />} unit="Hz/s" />
        <MiniReadout label="RoCoF, H=1" value={<Num value={rocofLow} digits={2} />} unit="Hz/s" />
      </DemoControls>
      <EquationStrip
        leftLabel="Initial RoCoF (swing equation)"
        left={
          <InlineMath
            tex={`\\dfrac{df}{dt}\\bigg|_{0} = -\\dfrac{\\Delta P}{2H}\\,f_{\\text{nom}}`}
          />
        }
        rightLabel="with current ΔP"
        right={
          <InlineMath
            tex={
              `H=5\\!:\\ ${rocofHigh.toFixed(2)}\\ \\text{Hz/s} \\quad\\big|\\quad H=1\\!:\\ ${rocofLow.toFixed(2)}\\ \\text{Hz/s}`
            }
          />
        }
      />
    </Demo>
  );
}
