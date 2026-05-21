/**
 * Demo D12.10 — RLC band-pass filter
 *
 * Series RLC driven by V_in; output taken across the resistor.
 *
 *   H(jω) = R / (R + jωL + 1/(jωC))
 *         = jωRC / (1 − ω²LC + jωRC)
 *
 *   |H| peaks at ω₀ = 1/√(LC) with |H_peak| = 1.
 *   Q = ω₀ L / R = (1/R)√(L/C)
 *   Δf_-3dB (bandwidth) = f₀ / Q
 *
 * Log-frequency Bode magnitude plot with markers at f_0 and the −3 dB
 * cutoffs that define the bandwidth.
 */
import { useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';
import { drawGlowPath } from '@/lib/canvasPrimitives';
import { withAlpha } from '@/lib/canvasTheme';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';
import { fmtFreqShort } from '@/lib/formatters';
import { drawLabel } from "@/lib/canvasLayout";

interface Props {
  figure?: string;
}

export function RLCBandpassDemo({ figure }: Props) {
  const [R, setR] = useState(10); // Ω
  const [Lmh, setLmh] = useState(1); // mH
  const [Cnf, setCnf] = useState(10); // nF

  const L = Lmh * 1e-3;
  const C = Cnf * 1e-9;
  const f0 = 1 / (2 * Math.PI * Math.sqrt(L * C));
  const omega0 = 2 * Math.PI * f0;
  const Q = (omega0 * L) / R;
  const bandwidth = f0 / Q;

  const stateRef = useSimState({ R, L, C, f0, Q });
  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, colors }, _state, _dt, _simTime) => {
      const { R, L, C, f0, Q } = stateRef.current;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);
      const logCenter = Math.log10(Math.max(f0, 1));
      const logMin = logCenter - 2.5;
      const logMax = logCenter + 2.5;
      const padL = 50,
        padR = 30,
        padT = 26,
        padB = 32;
      const plotX = padL,
        plotY = padT;
      const plotW = w - padL - padR;
      const plotH = h - padT - padB;
      ctx.strokeStyle = colors.border;
      ctx.strokeRect(plotX, plotY, plotW, plotH);
      const dBmin = -40,
        dBmax = 5;
      const yDb = (db: number) => plotY + plotH - ((db - dBmin) / (dBmax - dBmin)) * plotH;
      ctx.strokeStyle = colors.border;
      for (let db = dBmin; db <= dBmax; db += 10) {
        const y = yDb(db);
        ctx.beginPath();
        ctx.moveTo(plotX, y);
        ctx.lineTo(plotX + plotW, y);
        ctx.stroke();
      }
      ctx.save();
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = colors.textDim;
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      for (let lf = Math.ceil(logMin); lf <= Math.floor(logMax); lf++) {
        const f = Math.pow(10, lf);
        const x = plotX + ((lf - logMin) / (logMax - logMin)) * plotW;
        ctx.strokeStyle = colors.border;
        ctx.beginPath();
        ctx.moveTo(x, plotY);
        ctx.lineTo(x, plotY + plotH);
        ctx.stroke();
        ctx.save();
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = colors.textDim;
        ctx.fillText(fmtFreqShort(f), x, plotY + plotH + 4);
        ctx.restore();
      }
      const xf0 = plotX + ((Math.log10(f0) - logMin) / (logMax - logMin)) * plotW;
      ctx.restore();
      ctx.strokeStyle = colors.teal;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(xf0, plotY);
      ctx.lineTo(xf0, plotY + plotH);
      ctx.stroke();
      ctx.setLineDash([]);
      const yM3 = yDb(-3);
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = colors.pink;
      ctx.setLineDash([2, 4]);
      ctx.beginPath();
      ctx.moveTo(plotX, yM3);
      ctx.lineTo(plotX + plotW, yM3);
      ctx.stroke();
      ctx.setLineDash([]);
      const N = 260;
      const curvePts: { x: number; y: number }[] = [];
      for (let i = 0; i <= N; i++) {
        const u = i / N;
        const lf = logMin + u * (logMax - logMin);
        const f = Math.pow(10, lf);
        const om = 2 * Math.PI * f;
        // H = jωRC / (1 − ω²LC + jωRC); |H|² = (ωRC)² / ((1−ω²LC)² + (ωRC)²)
        const num = om * R * C;
        const den = Math.sqrt(Math.pow(1 - om * om * L * C, 2) + num * num);
        const Hmag = num / Math.max(den, 1e-12);
        const dB = 20 * Math.log10(Math.max(Hmag, 1e-6));
        const x = plotX + u * plotW;
        const y = yDb(Math.max(dBmin, Math.min(dBmax, dB)));
        curvePts.push({ x, y });
      }
      drawGlowPath(ctx, curvePts, {
        color: withAlpha(colors.accent, 0.95),
        glowColor: withAlpha(colors.accent, 0.35),
        lineWidth: 1.8,
      });
      ctx.restore();
      drawLabel(ctx, { text: '0 dB', x: plotX - 4, y: yDb(0), size: 9, font: '9px "JetBrains Mono", monospace', align: 'right', baseline: 'middle' });
      drawLabel(ctx, { text: '-20', x: plotX - 4, y: yDb(-20) });
      drawLabel(ctx, { text: '-40', x: plotX - 4, y: yDb(-40) });
      drawLabel(ctx, { text: `|H(f)|  band-pass`, x: plotX + 4, y: plotY + 4, color: colors.accent, font: '10px "JetBrains Mono", monospace', baseline: 'top' });
      drawLabel(ctx, { text: `f₀ = ${fmtFreqShort(f0)}   Q = ${Q.toFixed(1)}`, x: plotX + plotW - 4, y: plotY + 4, color: colors.teal, align: 'right' });
    },
    [],
  );

  return (
    <Demo
      figure={figure ?? 'Fig. 12.8'}
      title="Series RLC band-pass"
      question="A bell-curve in frequency space. Make it sharper by lowering R."
      caption={
        <>
          Output taken across the resistor of a series RLC. The transfer function peaks at the
          resonant frequency f<sub>0</sub> = 1/(2π√(LC)); width of the −3 dB band equals f
          <sub>0</sub>/Q. Drop R and the peak narrows: that is the same Q-factor selectivity that
          the previous resonance demo plotted as current amplitude.
        </>
      }
      deeperLab={{ slug: 'inductance', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={280} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="R"
          value={R}
          min={0.5}
          max={200}
          step={0.5}
          format={(v) => v.toFixed(1) + ' Ω'}
          onChange={setR}
        />
        <MiniSlider
          label="L"
          value={Lmh}
          min={0.01}
          max={10}
          step={0.01}
          format={(v) => (v < 1 ? (v * 1000).toFixed(0) + ' µH' : v.toFixed(2) + ' mH')}
          onChange={setLmh}
        />
        <MiniSlider
          label="C"
          value={Cnf}
          min={0.1}
          max={1000}
          step={0.1}
          format={(v) => (v < 1 ? (v * 1000).toFixed(0) + ' pF' : v.toFixed(1) + ' nF')}
          onChange={setCnf}
        />
        <MiniReadout label="f₀" value={<Num value={f0} />} unit="Hz" />
        <MiniReadout label="Q" value={Q.toFixed(2)} />
        <MiniReadout label="BW (f₀/Q)" value={<Num value={bandwidth} />} unit="Hz" />
      </DemoControls>
    </Demo>
  );
}
