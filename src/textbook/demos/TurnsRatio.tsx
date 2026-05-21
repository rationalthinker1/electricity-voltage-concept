/**
 * Demo D18.2 — Turns-ratio oscilloscope
 *
 * A single slider for the turns ratio n = N_s/N_p. Two waveforms overlaid:
 * the primary voltage V_p(t) (a fixed 170 V peak sinusoid) and the secondary
 * V_s(t) = n · V_p(t). The reader sweeps the ratio and watches V_s scale
 * while phase stays locked.
 */
import { useMemo, useState } from 'react';
import { withAlpha } from '@/lib/canvasTheme';
import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';
import { drawAxes, drawHLine, drawLinePlot } from '@/lib/drawPlot';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';
import { drawLabel } from "@/lib/canvasLayout";

interface Props {
  figure?: string;
}

const VP_PEAK = 170; // 170 V peak ≈ 120 V_rms
const F_HZ = 60; // 60 Hz line

export function TurnsRatioDemo({ figure }: Props) {
  const [ratio, setRatio] = useState(0.1); // step-down 10:1 by default

  const stateRef = useSimState({ ratio });
  const computed = useMemo(() => {
    const Vs = VP_PEAK * ratio;
    const VsRms = Vs / Math.sqrt(2);
    return { Vs, VsRms };
  }, [ratio]);

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, colors }, _state, _dt, simTime) => {
      const { ratio } = stateRef.current;
      const t = simTime;
      const tVis = t * (2 / F_HZ);
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);
      const padL = 50,
        padR = 30;
      const padT = 24,
        padB = 30;
      const rect = { x: padL, y: padT, w: w - padL - padR, h: h - padT - padB };
      // Symmetric voltage axis. yMax originally was 200; we keep the same
      // ±yMax span and the 8 % bottom/top padding by scaling the data range
      // a touch wider than ±yMax so the curves don't ride the frame.
      const yMax = 200;
      const yRange = yMax / 0.92;

      // Tick marks at -150,-100,-50,0,50,100,150 — labels at -150,0,+150 only.
      const yGridTicks = [-150, -100, -50, 0, 50, 100, 150];
      const yLabelSet = new Set([-150, 0, 150]);
      drawAxes(ctx, rect, {
        xMin: 0,
        xMax: 1,
        yMin: -yRange,
        yMax: yRange,
        xTicks: [],
        yTicks: yGridTicks,
        gridColor: colors.border,
        axisColor: colors.border,
        yTickFormat: (v) => (yLabelSet.has(v) ? (v > 0 ? '+' : '') + v.toFixed(0) : ''),
      });
      // The 0-axis on top of the dashed grid for extra weight.
      drawHLine(ctx, rect, 0, -yRange, yRange, {
        color: colors.borderStrong,
        alpha: 1,
        dash: undefined,
      });
      const tWindow = 2 / F_HZ;
      const samples = 320;
      const omega = 2 * Math.PI * F_HZ;
      const primPts: { x: number; y: number }[] = [];
      const secPts: { x: number; y: number }[] = [];
      for (let i = 0; i <= samples; i++) {
        const tau = (i / samples) * tWindow;
        const u = i / samples; // 0..1
        const v = VP_PEAK * Math.sin(omega * (tVis + tau));
        primPts.push({ x: u, y: v });
        secPts.push({ x: u, y: VP_PEAK * ratio * Math.sin(omega * (tVis + tau)) });
      }
      drawLinePlot(ctx, rect, primPts, 0, 1, -yRange, yRange, {
        color: colors.pink,
        lineWidth: 1.8,
      });
      drawLinePlot(ctx, rect, secPts, 0, 1, -yRange, yRange, {
        color: colors.accent,
        lineWidth: 1.8,
      });
      const plotW = rect.w;
      const plotH = rect.h;
      drawLabel(ctx, { text: '— V_p (170 V peak)', x: padL + 8, y: padT + 6, color: colors.pink, font: '10px "JetBrains Mono", monospace', baseline: 'top' });
      drawLabel(ctx, { text: `— V_s = n · V_p`, x: padL + 8, y: padT + 22, color: colors.accent });
      ctx.fillStyle = withAlpha(colors.textDim, 0.6);
      drawLabel(ctx, { text: 't (60 Hz · 2 cycles)', x: padL + plotW, y: padT + plotH + 4, align: 'right', baseline: 'top' });
    },
    [],
  );

  return (
    <Demo
      figure={figure ?? 'Fig. 18.2'}
      title="Turns ratio sets the voltage scale"
      question="One knob. The secondary scales. The frequency and phase don't."
      caption={
        <>
          Two traces of <em>V(t) = V_peak · sin(ωt)</em>: the primary at fixed 170 V peak, the
          secondary at
          <em> n · V_peak</em> where <em>n = N_s/N_p</em>. Slide n from 0.01 (huge step-down)
          through 1 (1:1 isolation) to ~3 (step-up). The waveforms stay perfectly phase-locked —
          that's what "ideal" means.
        </>
      }
      deeperLab={{ slug: 'faraday', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={240} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="n = N_s/N_p"
          value={ratio}
          min={0.01}
          max={1.2}
          step={0.01}
          format={(v) => v.toFixed(2)}
          onChange={setRatio}
        />
        <MiniReadout label="V_s,peak" value={<Num value={computed.Vs} digits={2} />} unit="V" />
        <MiniReadout label="V_s,rms" value={<Num value={computed.VsRms} digits={2} />} unit="V" />
      </DemoControls>
    </Demo>
  );
}
