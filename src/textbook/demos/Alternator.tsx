/**
 * Demo D17.3 — Car alternator (3-phase generator + 6-diode rectifier)
 *
 * Three-phase AC from the generator feeds a six-diode full-wave bridge,
 * producing nearly-DC output that's smoothed and regulated to ~14 V to
 * charge the battery and run the loads.
 *
 * Left half: stacked 3-phase waveforms (raw AC). Right half: the rectified
 * output, which is the running maximum of the three rectified phases —
 * with ripple at 6× the line frequency.
 *
 * Slider: engine RPM (drives generator frequency via belt ratio).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';

interface Props { figure?: string }

const TAU3 = (2 * Math.PI) / 3;
const POLE_PAIRS = 6;       // typical claw-pole alternator
const PULLEY_RATIO = 2.5;   // crank → alternator
const V_REG = 14;           // V regulated output

export function AlternatorDemo({ figure }: Props) {
  const [engineRpm, setEngineRpm] = useState(2000);

  const stateRef = useRef({ engineRpm });
  useEffect(() => { stateRef.current.engineRpm = engineRpm; }, [engineRpm]);

  const computed = useMemo(() => {
    const altRpm = engineRpm * PULLEY_RATIO;
    const f = (altRpm / 60) * POLE_PAIRS;   // electrical Hz
    return { altRpm, f };
  }, [engineRpm]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, colors } = info;
    let raf = 0;
    let simT = 0;
    let lastT = performance.now();

    function draw() {
      const { engineRpm } = stateRef.current;
      const altRpm = engineRpm * PULLEY_RATIO;
      const f = (altRpm / 60) * POLE_PAIRS;
      const omega = 2 * Math.PI * f;
      // Slow visual time for high f
      const slow = f > 60 ? 60 / f : 1;

      const now = performance.now();
      let dt = (now - lastT) / 1000;
      lastT = now;
      if (dt > 0.1) dt = 0.1;
      simT += dt * slow;

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      // Two stacked plots
      const padL = 40, padR = 20;
      const plotW = w - padL - padR;
      const topY = 30, midGap = 18;
      const plotH = (h - 60 - midGap) / 2;
      const cy1 = topY + plotH / 2;
      const cy2 = topY + plotH + midGap + plotH / 2;

      // Top: 3-phase raw
      ctx.strokeStyle = colors.border;
      ctx.strokeRect(padL, topY, plotW, plotH);
      ctx.beginPath();
      ctx.moveTo(padL, cy1); ctx.lineTo(padL + plotW, cy1);
      ctx.stroke();

      // Bottom: regulated DC + ripple
      ctx.strokeRect(padL, topY + plotH + midGap, plotW, plotH);
      ctx.beginPath();
      ctx.moveTo(padL, cy2); ctx.lineTo(padL + plotW, cy2);
      ctx.stroke();

      const samples = 240;
      const tWindow = 2 / Math.max(f, 1);  // show 2 cycles
      const peak = 17;   // ~17 V peak from a 14 V regulated output
      const phaseColors = ['#ff3b6e', '#6cc5c2', '#ff6b2a'];

      // Draw the three raw phases on the top plot.
      const phases = [0, -TAU3, -2 * TAU3];
      for (let k = 0; k < 3; k++) {
        ctx.strokeStyle = phaseColors[k];
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let i = 0; i <= samples; i++) {
          const tau = (i / samples) * tWindow;
          const v = peak * Math.cos(omega * (simT + tau) + phases[k]);
          const x = padL + (i / samples) * plotW;
          const y = cy1 - (v / peak) * (plotH / 2) * 0.85;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Rectified envelope on the bottom plot: max(|va|,|vb|,|vc|) — for a
      // full-wave 3-phase bridge, the output is the supremum across all
      // three phases of |v|. Result: 6 humps per cycle, hovering just
      // below the peak.
      ctx.strokeStyle = colors.text;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (let i = 0; i <= samples; i++) {
        const tau = (i / samples) * tWindow;
        const va = peak * Math.cos(omega * (simT + tau) + phases[0]);
        const vb = peak * Math.cos(omega * (simT + tau) + phases[1]);
        const vc = peak * Math.cos(omega * (simT + tau) + phases[2]);
        const vout = Math.max(Math.abs(va), Math.abs(vb), Math.abs(vc));
        // Regulator clamps at V_REG (peak supply ~14 V across the battery)
        const clamped = Math.min(vout, V_REG);
        const x = padL + (i / samples) * plotW;
        const y = cy2 + (plotH / 2) * 0.85 - (clamped / peak) * (plotH * 0.85);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Regulator level dotted line (at +14 V)
      ctx.strokeStyle = colors.teal;
      ctx.setLineDash([4, 4]);
      const yReg = cy2 + (plotH / 2) * 0.85 - (V_REG / peak) * (plotH * 0.85);
      ctx.beginPath();
      ctx.moveTo(padL, yReg); ctx.lineTo(padL + plotW, yReg);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = colors.teal;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillText('14 V', padL - 4, yReg);

      // Labels
      ctx.fillStyle = colors.textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText('raw 3-phase AC', padL + 4, topY + 4);
      ctx.fillText('rectified + regulated DC', padL + 4, topY + plotH + midGap + 4);
      ctx.textAlign = 'right';
      ctx.fillText(`f_elec = ${f.toFixed(0)} Hz`, padL + plotW - 4, topY + 4);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 17.3'}
      title="The car alternator — AC, then a six-diode bridge"
      question="A car needs DC at 14 V. What's between the engine pulley and the battery?"
      caption={<>
        A 3-phase generator (claw-pole rotor, six pole-pairs) feeds a full-wave bridge of six
        diodes. The output is the maximum of the three rectified phases — six pulses per
        electrical cycle. A field-current regulator clamps the average to ~14 V; the lead-acid
        battery and any large capacitors absorb whatever ripple remains.
      </>}
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="engine RPM"
          value={engineRpm} min={600} max={6000} step={50}
          format={v => v.toFixed(0)}
          onChange={setEngineRpm}
        />
        <MiniReadout label="alternator RPM" value={<Num value={computed.altRpm} digits={0} />} />
        <MiniReadout label="electrical f" value={<Num value={computed.f} digits={0} />} unit="Hz" />
        <MiniReadout label="V_out (regulated)" value={V_REG.toFixed(1)} unit="V" />
      </DemoControls>
    </Demo>
  );
}
