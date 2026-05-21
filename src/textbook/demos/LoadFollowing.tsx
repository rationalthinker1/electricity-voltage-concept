/**
 * Demo D17.5 — Power-grid load following
 *
 * A 24-hour residential/commercial load curve. Three generation tiers are
 * stacked under it:
 *   • Baseload    — flat throughout the day (nuclear / coal)
 *   • Peakers     — gas / hydro / mid-merit; track the curve
 *   • Reserves    — spinning reserve, kept on the bus but unused
 *
 * Slider: time-of-day (0..24 h). Readouts: load, generation by tier,
 * fraction met by peakers.
 */
import { useMemo, useState } from 'react';
import { drawLabel } from '@/lib/canvasLayout';
import { withAlpha } from '@/lib/canvasTheme';
import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';
import { drawAxes, drawLinePlot, drawVLine, makePlotMappers } from '@/lib/drawPlot';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

interface Props {
  figure?: string;
}

// Stylised load curve, normalised: GW relative to a 30 GW system peak.
// Two-peak "duck curve" -ish residential/commercial pattern.
function loadFracAt(hour: number): number {
  // 0..24 → fraction of peak (~0.55..1.0)
  const morning = Math.exp(-Math.pow((hour - 8) / 2.2, 2)); // 8 AM peak
  const evening = Math.exp(-Math.pow((hour - 19) / 2.4, 2)); // 7 PM peak
  const nightFloor = 0.55;
  return nightFloor + 0.42 * Math.max(morning * 0.85, evening);
}

const SYSTEM_PEAK_GW = 30;
const BASELOAD_FRAC = 0.55; // baseload covers minimum load

export function LoadFollowingDemo({ figure }: Props) {
  const [hour, setHour] = useState(19);

  const stateRef = useSimState({ hour });
  const computed = useMemo(() => {
    const loadGW = loadFracAt(hour) * SYSTEM_PEAK_GW;
    const baseGW = BASELOAD_FRAC * SYSTEM_PEAK_GW;
    const peakerGW = Math.max(0, loadGW - baseGW);
    const reserveGW = SYSTEM_PEAK_GW * 0.1; // 10% spinning reserve
    return { loadGW, baseGW, peakerGW, reserveGW };
  }, [hour]);

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, colors }, _state, _dt, _simTime) => {
      const { hour } = stateRef.current;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);
      const padL = 48,
        padR = 24,
        padT = 24,
        padB = 38;
      const rect = { x: padL, y: padT, w: w - padL - padR, h: h - padT - padB };
      const xHourTicks: number[] = [];
      for (let hr = 0; hr <= 24; hr += 4) xHourTicks.push(hr);
      const yFracLabels = new Map<number, string>([
        [0, '0'],
        [0.5, '½'],
        [1, 'peak'],
      ]);
      drawAxes(ctx, rect, {
        xMin: 0,
        xMax: 24,
        yMin: 0,
        yMax: 1,
        xTicks: xHourTicks,
        yTicks: [0, 0.25, 0.5, 0.75, 1],
        xTickFormat: (hr) => hr.toString().padStart(2, '0') + ':00',
        yTickFormat: (v) => yFracLabels.get(v) ?? '',
      });
      const { xOf: xAt, yOf: yAt } = makePlotMappers(rect, 0, 24, 0, 1);
      const plotW = rect.w;
      // Baseload band (teal fill)
      ctx.save();
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = colors.teal;
      ctx.beginPath();
      ctx.moveTo(padL, yAt(0));
      ctx.lineTo(padL + plotW, yAt(0));
      ctx.lineTo(padL + plotW, yAt(BASELOAD_FRAC));
      ctx.lineTo(padL, yAt(BASELOAD_FRAC));
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = 0.6;
      ctx.strokeStyle = colors.teal;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padL, yAt(BASELOAD_FRAC));
      ctx.lineTo(padL + plotW, yAt(BASELOAD_FRAC));
      ctx.stroke();
      ctx.restore();
      const N = 200;
      const loadPts: { x: number; y: number }[] = [];
      for (let i = 0; i <= N; i++) {
        const hr = (i / N) * 24;
        loadPts.push({ x: hr, y: loadFracAt(hr) });
      }
      // Peaker shaded band above baseload — closed polygon to BASELOAD_FRAC,
      // which doesn't match drawLinePlot's fill (it closes to the bottom of
      // the rect), so keep this as raw ctx.
      ctx.save();
      ctx.globalAlpha = 0.25;
      ctx.fillStyle = colors.accent;
      ctx.beginPath();
      for (let i = 0; i <= N; i++) {
        const hr = (i / N) * 24;
        const x = xAt(hr);
        const y = yAt(loadFracAt(hr));
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.lineTo(padL + plotW, yAt(BASELOAD_FRAC));
      ctx.lineTo(padL, yAt(BASELOAD_FRAC));
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      drawLinePlot(ctx, rect, loadPts, 0, 24, 0, 1, {
        color: colors.accent,
        lineWidth: 1.8,
      });
      // Reserve dashed line (load + 10% headroom)
      const reservePts = loadPts.map((p) => ({ x: p.x, y: p.y + 0.1 }));
      ctx.save();
      ctx.globalAlpha = 0.55;
      ctx.setLineDash([5, 4]);
      drawLinePlot(ctx, rect, reservePts, 0, 24, 0, 1, {
        color: colors.pink,
        lineWidth: 1.2,
      });
      ctx.setLineDash([]);
      ctx.restore();
      drawVLine(ctx, rect, hour, 0, 24, {
        color: colors.text,
        lineWidth: 1.2,
        alpha: 0.7,
        dash: undefined,
      });
      ctx.fillStyle = colors.accent;
      ctx.beginPath();
      ctx.arc(xAt(hour), yAt(loadFracAt(hour)), 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      const legX = padL + 8;
      let legY = padT + 8;
      const lg = (color: string, label: string) => {
        ctx.fillStyle = color;
        ctx.fillRect(legX, legY + 4, 14, 4);
        drawLabel(ctx, {
          x: legX + 20,
          y: legY + 2,
          text: label,
          color: colors.text,
        });
        legY += 14;
      };
      lg(withAlpha(colors.teal, 0.6), 'baseload');
      lg(withAlpha(colors.accent, 0.7), 'peakers');
      lg(withAlpha(colors.pink, 0.7), 'reserve (dashed)');
      ctx.restore();
    },
    [],
  );

  return (
    <Demo
      figure={figure ?? 'Fig. 17.5'}
      title="Load following — the grid as a real-time market"
      question="Demand swings ±40 % across a day. Supply has to match it second-by-second. How?"
      caption={
        <>
          Stylised 24-hour residential/commercial load curve, normalised to a 30 GW system peak.
          Baseload generators (nuclear, coal) run flat at minimum demand; peakers (gas turbines,
          hydro) cycle to follow the curve; a 10 % spinning-reserve cushion sits idle but
          synchronised, ready to pick up an unscheduled outage in seconds.
        </>
      }
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="time of day"
          value={hour}
          min={0}
          max={23.99}
          step={0.25}
          format={(v) =>
            `${Math.floor(v).toString().padStart(2, '0')}:${Math.floor((v % 1) * 60)
              .toString()
              .padStart(2, '0')}`
          }
          onChange={setHour}
        />
        <MiniReadout label="load" value={<Num value={computed.loadGW} digits={1} />} unit="GW" />
        <MiniReadout
          label="baseload"
          value={<Num value={computed.baseGW} digits={1} />}
          unit="GW"
        />
        <MiniReadout
          label="peakers"
          value={<Num value={computed.peakerGW} digits={1} />}
          unit="GW"
        />
        <MiniReadout
          label="reserve (idle)"
          value={<Num value={computed.reserveGW} digits={1} />}
          unit="GW"
        />
      </DemoControls>
    </Demo>
  );
}
