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
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';

interface Props { figure?: string }

// Stylised load curve, normalised: GW relative to a 30 GW system peak.
// Two-peak "duck curve" -ish residential/commercial pattern.
function loadFracAt(hour: number): number {
  // 0..24 → fraction of peak (~0.55..1.0)
  const morning = Math.exp(-Math.pow((hour - 8) / 2.2, 2));   // 8 AM peak
  const evening = Math.exp(-Math.pow((hour - 19) / 2.4, 2));  // 7 PM peak
  const nightFloor = 0.55;
  return nightFloor + 0.42 * Math.max(morning * 0.85, evening);
}

const SYSTEM_PEAK_GW = 30;
const BASELOAD_FRAC = 0.55;   // baseload covers minimum load

export function LoadFollowingDemo({ figure }: Props) {
  const [hour, setHour] = useState(19);

  const stateRef = useRef({ hour });
  useEffect(() => { stateRef.current.hour = hour; }, [hour]);

  const computed = useMemo(() => {
    const loadGW = loadFracAt(hour) * SYSTEM_PEAK_GW;
    const baseGW = BASELOAD_FRAC * SYSTEM_PEAK_GW;
    const peakerGW = Math.max(0, loadGW - baseGW);
    const reserveGW = SYSTEM_PEAK_GW * 0.10;  // 10% spinning reserve
    return { loadGW, baseGW, peakerGW, reserveGW };
  }, [hour]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, colors } = info;
    let raf = 0;

    function draw() {
      const { hour } = stateRef.current;

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      const padL = 48, padR = 24, padT = 24, padB = 38;
      const plotW = w - padL - padR;
      const plotH = h - padT - padB;
      const xAt = (hr: number) => padL + (hr / 24) * plotW;
      const yAt = (frac: number) => padT + plotH - frac * plotH;

      // Frame
      ctx.strokeStyle = colors.border;
      ctx.strokeRect(padL, padT, plotW, plotH);
      // Horizontal gridlines at 0.25, 0.5, 0.75
      for (let i = 1; i < 4; i++) {
        const y = padT + (i / 4) * plotH;
        ctx.beginPath();
        ctx.moveTo(padL, y); ctx.lineTo(padL + plotW, y);
        ctx.stroke();
      }

      // Baseload band (teal, bottom)
      ctx.save();
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = colors.teal;
      ctx.beginPath();
      ctx.moveTo(padL, yAt(0));
      ctx.lineTo(padL + plotW, yAt(0));
      ctx.lineTo(padL + plotW, yAt(BASELOAD_FRAC));
      ctx.lineTo(padL, yAt(BASELOAD_FRAC));
      ctx.closePath(); ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = 0.6;
      ctx.strokeStyle = colors.teal;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padL, yAt(BASELOAD_FRAC)); ctx.lineTo(padL + plotW, yAt(BASELOAD_FRAC));
      ctx.stroke();

      // Peaker band: between baseload and load curve, sampled
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = 0.25;
      ctx.fillStyle = colors.accent;
      ctx.beginPath();
      const N = 200;
      for (let i = 0; i <= N; i++) {
        const hr = (i / N) * 24;
        const x = xAt(hr);
        const y = yAt(loadFracAt(hr));
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      // close along baseload line
      ctx.lineTo(padL + plotW, yAt(BASELOAD_FRAC));
      ctx.lineTo(padL, yAt(BASELOAD_FRAC));
      ctx.closePath();
      ctx.fill();

      // Load curve itself
      ctx.restore();
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (let i = 0; i <= N; i++) {
        const hr = (i / N) * 24;
        const x = xAt(hr);
        const y = yAt(loadFracAt(hr));
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Reserve band (dashed line above the load curve)
      ctx.save();
      ctx.globalAlpha = 0.55;
      ctx.strokeStyle = colors.pink;
      ctx.setLineDash([5, 4]);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let i = 0; i <= N; i++) {
        const hr = (i / N) * 24;
        const x = xAt(hr);
        const y = yAt(loadFracAt(hr) + 0.10);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Time-of-day marker
      const mx = xAt(hour);
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = 0.7;
      ctx.strokeStyle = colors.text;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(mx, padT); ctx.lineTo(mx, padT + plotH);
      ctx.stroke();
      ctx.restore();
      ctx.fillStyle = colors.accent;
      ctx.beginPath();
      ctx.arc(mx, yAt(loadFracAt(hour)), 5, 0, Math.PI * 2);
      ctx.fill();

      // Axes labels
      ctx.save();
      ctx.globalAlpha = 0.75;
      ctx.fillStyle = colors.textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      for (let hr = 0; hr <= 24; hr += 4) {
        ctx.fillText(hr.toString().padStart(2, '0') + ':00', xAt(hr), padT + plotH + 6);
      }
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillText('peak', padL - 6, yAt(1));
      ctx.fillText('½', padL - 6, yAt(0.5));
      ctx.fillText('0', padL - 6, yAt(0));

      // Legend
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      const legX = padL + 8;
      let legY = padT + 8;
      const lg = (color: string, label: string) => {
        ctx.fillStyle = color;
        ctx.fillRect(legX, legY + 4, 14, 4);
        ctx.fillStyle = colors.text;
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillText(label, legX + 20, legY + 2);
        legY += 14;
      };
      lg('rgba(108,197,194,0.6)', 'baseload');
      lg('rgba(255,107,42,0.7)', 'peakers');
      lg('rgba(255,59,110,0.7)', 'reserve (dashed)');

      raf = requestAnimationFrame(draw);
      ctx.restore();
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 17.5'}
      title="Load following — the grid as a real-time market"
      question="Demand swings ±40 % across a day. Supply has to match it second-by-second. How?"
      caption={<>
        Stylised 24-hour residential/commercial load curve, normalised to a 30 GW system peak.
        Baseload generators (nuclear, coal) run flat at minimum demand; peakers (gas turbines,
        hydro) cycle to follow the curve; a 10 % spinning-reserve cushion sits idle but
        synchronised, ready to pick up an unscheduled outage in seconds.
      </>}
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="time of day"
          value={hour} min={0} max={23.99} step={0.25}
          format={v => `${Math.floor(v).toString().padStart(2, '0')}:${Math.floor((v % 1) * 60).toString().padStart(2, '0')}`}
          onChange={setHour}
        />
        <MiniReadout label="load" value={<Num value={computed.loadGW} digits={1} />} unit="GW" />
        <MiniReadout label="baseload" value={<Num value={computed.baseGW} digits={1} />} unit="GW" />
        <MiniReadout label="peakers" value={<Num value={computed.peakerGW} digits={1} />} unit="GW" />
        <MiniReadout label="reserve (idle)" value={<Num value={computed.reserveGW} digits={1} />} unit="GW" />
      </DemoControls>
    </Demo>
  );
}
