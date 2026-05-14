/**
 * Demo D22.2 — Coupling coefficient k
 *
 * One knob: k from 0 to 1. The demo draws (a) two coils with a schematic
 * cartoon of what k corresponds to physically (air gap big -> small k;
 * shared ferrite core -> large k), and (b) a plot of transfer efficiency
 * versus k for a fixed source impedance and resonant load.
 *
 * Physics: efficiency of an inductively coupled link (matched both sides)
 * scales as k² · Q1 · Q2 / (1 + sqrt(1 + k² · Q1 · Q2))² in the ideal
 * resonant case. With fixed Q1 = Q2 = 50 we get a smooth curve that hits
 * ~75 % at k = 0.3 (typical Qi) and ~98 % at k = 0.95 (line-frequency
 * transformer). Useful order-of-magnitude.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';

interface Props { figure?: string }

const Q1 = 50;
const Q2 = 50;

function efficiency(k: number): number {
  const x = k * k * Q1 * Q2;
  return x / Math.pow(1 + Math.sqrt(1 + x), 2);
}

export function CouplingCoefficientDemo({ figure }: Props) {
  const [k, setK] = useState(0.3);

  const stateRef = useRef({ k });
  useEffect(() => { stateRef.current.k = k; }, [k]);

  const computed = useMemo(() => ({
    eta: efficiency(k),
  }), [k]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h } = info;
    let raf = 0;

    function draw() {
      const { k } = stateRef.current;
      ctx.fillStyle = '#0d0d10';
      ctx.fillRect(0, 0, w, h);

      // Top half: cartoon of two coils with air gap shrinking as k grows
      const topY = 18;
      const topH = Math.min(110, h * 0.5);

      // Coil 1 + Coil 2 inside a cartoon "core" region
      const cy = topY + topH / 2;
      // Gap shrinks as k -> 1
      const maxGap = 110;
      const gap = maxGap * (1 - k);
      const c1x = w / 2 - gap / 2 - 36;
      const c2x = w / 2 + gap / 2 + 36;

      // Draw a faint "ferrite core" rectangle that gets darker / more solid as k grows
      if (k > 0.45) {
        const coreOpacity = (k - 0.45) / 0.55;
        ctx.fillStyle = `rgba(108,197,194,${0.10 * coreOpacity})`;
        ctx.fillRect(c1x - 36, cy - 38, c2x - c1x + 72, 76);
        ctx.strokeStyle = `rgba(108,197,194,${0.45 * coreOpacity})`;
        ctx.lineWidth = 1.4;
        ctx.strokeRect(c1x - 36, cy - 38, c2x - c1x + 72, 76);
        ctx.fillStyle = `rgba(108,197,194,${0.6 * coreOpacity})`;
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText('shared ferrite core', c1x - 32, cy - 34);
      }

      drawCoil(ctx, c1x, cy, 'C1');
      drawCoil(ctx, c2x, cy, 'C2');

      // Annotate regime
      ctx.fillStyle = 'rgba(160,158,149,0.7)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      const regime =
        k < 0.15 ? 'loose coupling (RFID, antennas)' :
        k < 0.5  ? 'air-core RF / Qi charger' :
        k < 0.85 ? 'gapped iron core' :
        'tightly coupled iron / ferrite';
      ctx.fillText(regime, w / 2, topY + topH - 4);

      // Bottom half: efficiency curve eta(k) with marker
      const plotY = topY + topH + 14;
      const plotH = h - plotY - 14;
      const plotX = 56;
      const plotW = w - plotX - 16;

      // Axes
      ctx.strokeStyle = 'rgba(160,158,149,0.45)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(plotX, plotY); ctx.lineTo(plotX, plotY + plotH);
      ctx.lineTo(plotX + plotW, plotY + plotH);
      ctx.stroke();

      ctx.fillStyle = 'rgba(160,158,149,0.65)';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText('η', plotX - 4, plotY + 4);
      ctx.textAlign = 'right';
      ctx.fillText('1', plotX - 4, plotY + plotH * 0.05);
      ctx.fillText('0', plotX - 4, plotY + plotH);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('0', plotX, plotY + plotH + 4);
      ctx.fillText('1', plotX + plotW, plotY + plotH + 4);
      ctx.fillText('k', plotX + plotW / 2, plotY + plotH + 4);

      // Curve
      ctx.strokeStyle = 'rgba(255,107,42,0.85)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (let i = 0; i <= 100; i++) {
        const kk = i / 100;
        const eta = efficiency(kk);
        const px = plotX + kk * plotW;
        const py = plotY + (1 - eta) * plotH;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Marker for current k
      const eta = efficiency(k);
      const mx = plotX + k * plotW;
      const my = plotY + (1 - eta) * plotH;
      ctx.fillStyle = 'rgba(255,107,42,1)';
      ctx.beginPath();
      ctx.arc(mx, my, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`η ≈ ${(eta * 100).toFixed(0)}%`, mx + 8, my);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 22.2'}
      title="Coupling coefficient k and what it buys you"
      question="Why does a wireless charger need careful alignment?"
      caption={
        <>
          With high-Q resonant tuning (here Q ≈ 50 on both sides), you can still hit ~75 % efficiency at k = 0.3.
          Drop k to 0.05 — a phone misaligned by a few centimetres — and the efficiency collapses below 30 %.
          Real Qi pads buy back that margin with active alignment hints and tight ferrite-shielded coils.
        </>
      }
      deeperLab={{ slug: 'inductance', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={320} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="k"
          value={k} min={0} max={0.99} step={0.01}
          format={v => v.toFixed(2)}
          onChange={setK}
        />
        <MiniReadout label="link efficiency" value={(computed.eta * 100).toFixed(0)} unit="%" />
        <MiniReadout label="regime" value={
          k < 0.15 ? 'loose' :
          k < 0.5  ? 'moderate' :
          k < 0.85 ? 'tight' : 'iron-class'
        } />
      </DemoControls>
    </Demo>
  );
}

function drawCoil(ctx: CanvasRenderingContext2D, cx: number, cy: number, label: string) {
  const turns = 6;
  const rx = 18;
  const colH = 64;
  const dy = colH / turns;
  ctx.strokeStyle = 'rgba(255,107,42,0.95)';
  ctx.lineWidth = 1.6;
  for (let i = 0; i < turns; i++) {
    const y = cy - colH / 2 + (i + 0.5) * dy;
    ctx.beginPath();
    ctx.ellipse(cx, y, rx, dy * 0.42, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(255,107,42,0.8)';
  ctx.font = 'bold 10px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, cx, cy + colH / 2 + 12);
}
