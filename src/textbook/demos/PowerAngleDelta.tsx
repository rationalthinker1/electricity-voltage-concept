/**
 * Demo D17.8 — Power-angle curve (the swing equation in pictures)
 *
 * For a round-rotor synchronous generator connected to an infinite bus,
 * the real-power output is
 *   P(δ) = (|V_grid| · |E_f| / X_s) · sin(δ)
 *
 * δ is the angle between the rotor's internal EMF phasor and the grid
 * voltage. The mechanical input τ_mech raises δ until the curve's
 * height matches the demanded P; if mech input exceeds P_max =
 * |V·E_f|/X_s, the rotor accelerates past 90°, loses synchronism, and
 * the protective relay trips the unit offline.
 */
import { useMemo, useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';
import { drawLabel } from '@/lib/canvasLayout';
import { drawAxes, drawHLine, drawLinePlot, drawVLine, makePlotMappers } from '@/lib/drawPlot';
import { getCanvasColors } from '@/lib/canvasTheme';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

interface Props {
  figure?: string;
}

const V_GRID = 1.0;
const E_F = 1.4;
const X_S = 1.2;
const P_MAX = (V_GRID * E_F) / X_S;

export function PowerAngleDeltaDemo({ figure }: Props) {
  const [pMech, setPMech] = useState(0.6); // demanded mechanical input (pu)

  const stateRef = useSimState({ pMech });

  // Operating point: smallest δ such that P(δ) = pMech (stable side).
  const computed = useMemo(() => {
    if (pMech > P_MAX) {
      return { delta: 90, pullOut: true, P: P_MAX, marginPU: 0 };
    }
    const sinD = pMech / P_MAX;
    const delta = (Math.asin(Math.min(1, Math.max(-1, sinD))) * 180) / Math.PI;
    const margin = (P_MAX - pMech) / P_MAX; // fraction of capacity remaining
    return { delta, pullOut: false, P: pMech, marginPU: margin };
  }, [pMech]);

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h }) => {
      const { pMech } = stateRef.current;
      const colors = getCanvasColors();

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      const padL = 56,
        padR = 24,
        padT = 22,
        padB = 38;
      const plotW = w - padL - padR;
      const plotH = h - padT - padB;
      const rect = { x: padL, y: padT, w: plotW, h: plotH };

      const pMax = Math.max(P_MAX * 1.1, 1.4);
      const { xOf, yOf } = makePlotMappers(rect, 0, 180, 0, pMax);

      // Axes + grid
      drawAxes(ctx, rect, {
        xMin: 0,
        xMax: 180,
        yMin: 0,
        yMax: pMax,
        xTicks: [0, 30, 60, 90, 120, 150, 180],
        yTicks: [0, 0.25, 0.5, 0.75, 1.0, 1.25],
        xLabel: 'power angle δ →',
        yLabel: 'P (pu)',
      });

      // 90° line (stability limit)
      drawVLine(ctx, rect, 90, 0, 180, {
        color: colors.pink,
        dash: [4, 4],
        alpha: 0.45,
      });

      // P(δ) curve. Stable side (δ < 90°) solid; unstable side dashed.
      const stablePts: Array<{ x: number; y: number }> = [];
      const unstablePts: Array<{ x: number; y: number }> = [];
      for (let i = 0; i <= 180; i++) {
        const d = i;
        const p = P_MAX * Math.sin((d * Math.PI) / 180);
        if (d <= 90) stablePts.push({ x: d, y: p });
        if (d >= 90) unstablePts.push({ x: d, y: p });
      }
      drawLinePlot(ctx, rect, stablePts, 0, 180, 0, pMax, {
        color: colors.accent,
        lineWidth: 2.5,
      });
      drawLinePlot(ctx, rect, unstablePts, 0, 180, 0, pMax, {
        color: colors.accent,
        lineWidth: 2.5,
      });
      // Unstable branch dashed overlay
      ctx.save();
      ctx.setLineDash([4, 4]);
      drawLinePlot(ctx, rect, unstablePts, 0, 180, 0, pMax, {
        color: colors.accent,
        lineWidth: 2.5,
      });
      ctx.restore();

      // Mechanical input horizontal line
      drawHLine(ctx, rect, Math.min(pMech, pMax), 0, pMax, {
        color: colors.teal,
        lineWidth: 1.5,
        alpha: 0.6,
      });

      // Operating point
      if (pMech <= P_MAX) {
        const d = (Math.asin(pMech / P_MAX) * 180) / Math.PI;
        ctx.fillStyle = colors.blue;
        ctx.beginPath();
        ctx.arc(xOf(d), yOf(pMech), 7, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Pull-out: marker red at the curve peak
        ctx.fillStyle = colors.pink;
        ctx.beginPath();
        ctx.arc(xOf(90), yOf(P_MAX), 8, 0, Math.PI * 2);
        ctx.fill();
        drawLabel(ctx, {
          x: xOf(90),
          y: yOf(P_MAX) - 12,
          text: 'POLE SLIP — TRIP',
          color: colors.pink,
          size: 11,
          align: 'center',
          baseline: 'bottom',
          weight: 'bold',
        });
      }

      // P_max label
      drawLabel(ctx, { text: `P_max = V·E_f/X_s = ${P_MAX.toFixed(2)} pu`, x: padL + 8, y: yOf(P_MAX) - 8, color: colors.accent, font: '10px "JetBrains Mono", monospace', baseline: 'middle' });

      // Stable / unstable region labels
      drawLabel(ctx, { text: 'stable: δ < 90°', x: padL + 8, y: padT + plotH - 6, color: colors.teal, font: '10px "JetBrains Mono", monospace', baseline: 'bottom' });
      drawLabel(ctx, { text: 'unstable: δ > 90°', x: padL + plotW - 8, y: padT + plotH - 6, color: colors.pink, font: '10px "JetBrains Mono", monospace', align: 'right', baseline: 'bottom' });
    },
    [],
  );

  return (
    <Demo
      figure={figure ?? 'Fig. 21.8'}
      title="Power-angle curve and the pull-out limit"
      question="If the turbine pushes harder than the grid can absorb, what happens to the rotor?"
      caption={
        <>
          For a round-rotor machine the real power vs rotor angle is a simple sine:{' '}
          <strong>P(δ) = (|V|·|E_f|/X_s)·sin δ</strong>. The operating point is where the mechanical
          input line intersects the curve on the left (stable) side. Push past the 90° peak and the
          rotor loses synchronism — the machine poles slip, frequency wanders, and the protection
          relay opens the breaker.
        </>
      }
      deeperLab={{ slug: 'power-grid', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={260} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="mech input P"
          value={pMech}
          min={0.1}
          max={1.5}
          step={0.05}
          format={(v) => v.toFixed(2) + ' pu'}
          onChange={setPMech}
        />
        <MiniReadout
          label="operating δ"
          value={<Num value={computed.delta} digits={1} />}
          unit="°"
        />
        <MiniReadout
          label="stability margin"
          value={<Num value={computed.marginPU * 100} digits={0} />}
          unit="%"
        />
      </DemoControls>
    </Demo>
  );
}
