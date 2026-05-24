/**
 * Demo D17.4 — Synchronising a generator to the grid
 *
 * Two sinusoids plotted on the same axis:
 *   • Grid:       V_grid = V cos(2π · 60 · t)
 *   • Generator:  V_gen  = V_g cos(2π · f_gen · t + φ)
 *
 * The user adjusts f_gen and φ to match the grid. When |Δf| and |Δφ| are
 * both small the "ready to close" indicator turns green; if the breaker
 * closes with significant Δ, a large transient surge current is drawn,
 * shown as a red flash.
 */
import { useMemo, useState } from 'react';
import { withAlpha } from '@/lib/canvasTheme';
import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, EquationStrip, MiniReadout, MiniSlider } from '@/components/Demo';
import { InlineMath } from '@/components/Formula';
import { drawAxes, drawHLine, drawLinePlot, makePlotMappers } from '@/lib/drawPlot';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';
import { drawLabel } from "@/lib/canvasLayout";

interface Props {
  figure: string;
}

const F_GRID = 60; // Hz
const V_GRID = 1; // normalised peak

export function GridSyncDemo({ figure }: Props) {
  const [fGen, setFGen] = useState(60.5);
  const [phiDeg, setPhiDeg] = useState(30);
  const [vGen, setVGen] = useState(1.0);

  const stateRef = useSimState({ fGen, phiDeg, vGen });
  const ready = useMemo(() => {
    const dF = Math.abs(fGen - F_GRID);
    const dPhi = Math.abs(phiDeg) % 360;
    const dPhiMin = Math.min(dPhi, 360 - dPhi);
    const dV = Math.abs(vGen - V_GRID);
    // Industrial practice: |Δf| < 0.2 Hz, |Δφ| < ~10°, |ΔV| < 5%
    return dF < 0.2 && dPhiMin < 10 && dV < 0.05;
  }, [fGen, phiDeg, vGen]);

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, colors }, _state, dt, _simTime, ctx0) => {
      let simT = ctx0.simT;
      const { fGen, phiDeg, vGen } = stateRef.current;
      simT += dt * 0.06;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);
      const padL = 50,
        padR = 30,
        padT = 30,
        padB = 40;
      const rect = { x: padL, y: padT, w: w - padL - padR, h: h - padT - padB };
      // 85% scaling factor in original keeps curves off the frame edges;
      // expand the data range proportionally so drawLinePlot reproduces it.
      const yRange = Math.max(V_GRID, vGen) / 0.85;
      drawAxes(ctx, rect, {
        xMin: 0,
        xMax: 1,
        yMin: -yRange,
        yMax: yRange,
        xTicks: [],
        yTicks: [],
      });
      drawHLine(ctx, rect, 0, -yRange, yRange, {
        color: colors.border,
        alpha: 1,
        dash: undefined,
      });
      const cy = padT + rect.h / 2;
      const tWindow = 0.05;
      const samples = 320;
      const phi = (phiDeg * Math.PI) / 180;
      const gridPts: { x: number; y: number }[] = [];
      const genPts: { x: number; y: number }[] = [];
      for (let i = 0; i <= samples; i++) {
        const u = i / samples;
        const t = simT + u * tWindow;
        gridPts.push({ x: u, y: V_GRID * Math.cos(2 * Math.PI * F_GRID * t) });
        genPts.push({ x: u, y: vGen * Math.cos(2 * Math.PI * fGen * t + phi) });
      }
      ctx.save();
      ctx.globalAlpha = 0.85;
      drawLinePlot(ctx, rect, gridPts, 0, 1, -yRange, yRange, {
        color: colors.text,
        lineWidth: 1.6,
      });
      ctx.restore();
      drawLinePlot(ctx, rect, genPts, 0, 1, -yRange, yRange, {
        color: ready ? withAlpha(colors.teal, 0.95) : withAlpha(colors.accent, 0.9),
        lineWidth: 1.6,
      });
      // Difference fill: closed polygon between (gridPts - genPts) and the
      // centre axis. drawLinePlot.fill closes to the bottom of the rect, not
      // the centre, so the fill stays as raw ctx calls.
      const { xOf, yOf } = makePlotMappers(rect, 0, 1, -yRange, yRange);
      const plotW = rect.w;
      const plotH = rect.h;
      ctx.fillStyle = colors.pink;
      ctx.beginPath();
      let started = false;
      for (let i = 0; i <= samples; i++) {
        const u = i / samples;
        const t = simT + u * tWindow;
        const vG = V_GRID * Math.cos(2 * Math.PI * F_GRID * t);
        const vGen2 = vGen * Math.cos(2 * Math.PI * fGen * t + phi);
        const diff = vG - vGen2;
        const x = xOf(u);
        const yDiff = yOf(diff);
        if (!started) {
          ctx.moveTo(x, cy);
          started = true;
        }
        ctx.lineTo(x, yDiff);
      }
      ctx.lineTo(padL + plotW, cy);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = ready ? withAlpha(colors.teal, 0.85) : withAlpha(colors.pink, 0.85);
      ctx.beginPath();
      ctx.arc(padL + plotW - 18, padT + 14, 7, 0, Math.PI * 2);
      ctx.fill();
      drawLabel(ctx, { text: ready ? 'READY TO CLOSE' : 'NOT SYNCHRONISED', x: padL + plotW - 30, y: padT + 14, color: ready ? colors.teal : colors.pink, font: '10px "JetBrains Mono", monospace', align: 'right', baseline: 'middle' });
      ctx.save();
      ctx.globalAlpha = 0.75;
      drawLabel(ctx, { text: 'grid', x: padL + 6, y: padT + 14, color: colors.text, baseline: 'middle' });
      ctx.restore();
      drawLabel(ctx, { text: 'generator', x: padL + 40, y: padT + 14, color: ready ? colors.teal : colors.accent });
      const dPhi = Math.abs(phiDeg) % 360;
      const dPhiMin = Math.min(dPhi, 360 - dPhi);
      drawLabel(ctx, { text: `Δf = ${(fGen - F_GRID).toFixed(2)} Hz   ·   Δφ = ${dPhiMin.toFixed(0)}°   ·   ΔV = ${((vGen - V_GRID) * 100).toFixed(1)}%`, x: padL + plotW / 2, y: padT + plotH + 26, size: 11, font: '11px "JetBrains Mono", monospace', align: 'center', baseline: 'bottom' });
      ctx0.simT = simT;
    },
    [],
    () => ({ context: { simT: 0 } }),
  );

  return (
    <Demo
      figure={figure}
      title="Synchronising a generator to the grid"
      question="Three knobs to set before you can throw the breaker. What are they, and what's the penalty for getting them wrong?"
      caption={
        <>
          Before a generator can connect to a live grid, three things must match:{' '}
          <strong>frequency</strong>,<strong> phase</strong>, and <strong>voltage</strong>. The
          shaded red area is the instantaneous difference — proportional to the transient
          circulating current the windings would have to absorb at breaker close. Get within ~0.2
          Hz, ~10°, ~5% and the indicator goes green.
        </>
      }
      deeperLab={{ slug: 'synchronous-machine', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={280} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="f_gen"
          value={fGen}
          min={59}
          max={61}
          step={0.05}
          format={(v) => v.toFixed(2) + ' Hz'}
          onChange={setFGen}
        />
        <MiniSlider
          label="phase φ"
          value={phiDeg}
          min={-180}
          max={180}
          step={1}
          format={(v) => v.toFixed(0) + '°'}
          onChange={setPhiDeg}
        />
        <MiniSlider
          label="V_gen"
          value={vGen}
          min={0.7}
          max={1.3}
          step={0.01}
          format={(v) => v.toFixed(2)}
          onChange={setVGen}
        />
        <MiniReadout label="status" value={ready ? 'in sync' : 'out of sync'} />
      </DemoControls>
      <EquationStrip
        leftLabel="Sync conditions"
        left={
          <InlineMath
            tex={`|\\Delta f| < 0.2\\ \\text{Hz},\\ \\ |\\Delta\\varphi| < 10^{\\circ},\\ \\ |\\Delta V|/V < 5\\%`}
          />
        }
        rightLabel="current mismatch"
        right={
          <InlineMath
            tex={
              `\\Delta f = ${(fGen - F_GRID).toFixed(2)}\\ \\text{Hz},\\ \\ ` +
              `\\Delta\\varphi = ${Math.min(Math.abs(phiDeg) % 360, 360 - (Math.abs(phiDeg) % 360)).toFixed(0)}^{\\circ},\\ \\ ` +
              `\\Delta V = ${((vGen - V_GRID) * 100).toFixed(1)}\\%`
            }
          />
        }
      />
    </Demo>
  );
}
