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
import { useMemo, useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, EquationStrip, MiniReadout, MiniSlider } from '@/components/Demo';
import { InlineMath } from '@/components/Formula';
import { drawLabel } from '@/lib/canvasLayout';
import { getCanvasColors } from '@/lib/canvasTheme';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

interface Props {
  figure?: string;
}

const Q1 = 50;
const Q2 = 50;

function efficiency(k: number): number {
  const x = k * k * Q1 * Q2;
  return x / Math.pow(1 + Math.sqrt(1 + x), 2);
}

export function CouplingCoefficientDemo({ figure }: Props) {
  const [k, setK] = useState(0.3);

  const stateRef = useSimState({ k });
  const computed = useMemo(
    () => ({
      eta: efficiency(k),
      couplingProduct: k * k * Q1 * Q2,
    }),
    [k],
  );

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, colors }, _state, _dt, _simTime) => {
      const { k } = stateRef.current;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);
      const topY = 18;
      const topH = Math.min(110, h * 0.5);
      const cy = topY + topH / 2;
      const maxGap = 110;
      const gap = maxGap * (1 - k);
      const c1x = w / 2 - gap / 2 - 36;
      const c2x = w / 2 + gap / 2 + 36;
      if (k > 0.45) {
        const coreOpacity = (k - 0.45) / 0.55;
        ctx.save();
        ctx.globalAlpha = 0.1 * coreOpacity;
        ctx.fillStyle = colors.teal;
        ctx.fillRect(c1x - 36, cy - 38, c2x - c1x + 72, 76);
        ctx.restore();
        ctx.save();
        ctx.globalAlpha = 0.45 * coreOpacity;
        ctx.strokeStyle = colors.teal;
        ctx.lineWidth = 1.4;
        ctx.strokeRect(c1x - 36, cy - 38, c2x - c1x + 72, 76);
        ctx.restore();
        ctx.save();
        ctx.globalAlpha = 0.6 * coreOpacity;
        drawLabel(ctx, {
          x: c1x - 32,
          y: cy - 34,
          text: 'shared ferrite core',
          color: colors.teal,
          size: 9,
          baseline: 'top',
        });
        ctx.restore();
      }
      drawCoil(ctx, c1x, cy, 'C1');
      drawCoil(ctx, c2x, cy, 'C2');
      const regime =
        k < 0.15
          ? 'loose coupling (RFID, antennas)'
          : k < 0.5
            ? 'air-core RF / Qi charger'
            : k < 0.85
              ? 'gapped iron core'
              : 'tightly coupled iron / ferrite';
      drawLabel(ctx, {
        text: regime,
        x: w / 2,
        y: topY + topH - 4,
        font: '10px "JetBrains Mono", monospace',
        align: 'center',
        baseline: 'bottom',
      });
      const plotY = topY + topH + 14;
      const plotH = h - plotY - 14;
      const plotX = 56;
      const plotW = w - plotX - 16;
      ctx.save();
      ctx.globalAlpha = 0.45;
      ctx.strokeStyle = colors.textDim;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(plotX, plotY);
      ctx.lineTo(plotX, plotY + plotH);
      ctx.lineTo(plotX + plotW, plotY + plotH);
      ctx.stroke();
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = 0.65;
      drawLabel(ctx, {
        text: 'η',
        x: plotX - 4,
        y: plotY + 4,
        size: 9,
        font: '9px "JetBrains Mono", monospace',
        align: 'right',
        baseline: 'middle',
      });
      ctx.restore();
      drawLabel(ctx, { text: '1', x: plotX - 4, y: plotY + plotH * 0.05, align: 'right' });
      drawLabel(ctx, { text: '0', x: plotX - 4, y: plotY + plotH, align: 'right' });
      drawLabel(ctx, {
        text: '0',
        x: plotX,
        y: plotY + plotH + 4,
        align: 'center',
        baseline: 'top',
      });
      drawLabel(ctx, {
        text: '1',
        x: plotX + plotW,
        y: plotY + plotH + 4,
        align: 'center',
        baseline: 'top',
      });
      drawLabel(ctx, {
        text: 'k',
        x: plotX + plotW / 2,
        y: plotY + plotH + 4,
        align: 'center',
        baseline: 'top',
      });
      ctx.strokeStyle = colors.accent;
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
      const eta = efficiency(k);
      const mx = plotX + k * plotW;
      const my = plotY + (1 - eta) * plotH;
      ctx.fillStyle = colors.accent;
      ctx.beginPath();
      ctx.arc(mx, my, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.save();
      ctx.globalAlpha = 0.85;
      drawLabel(ctx, {
        x: mx + 8,
        y: my,
        text: `η ≈ ${(eta * 100).toFixed(0)}%`,
        color: colors.text,
      });
      ctx.restore();
    },
    [],
  );

  return (
    <Demo
      figure={figure ?? 'Fig. 22.2'}
      title="Coupling coefficient k and what it buys you"
      question="Why does a wireless charger need careful alignment?"
      caption={
        <>
          With high-Q resonant tuning (here Q ≈ 50 on both sides), you can still hit ~75 %
          efficiency at k = 0.3. Drop k to 0.05 — a phone misaligned by a few centimetres — and the
          efficiency collapses below 30 %. Real Qi pads buy back that margin with active alignment
          hints and tight ferrite-shielded coils.
        </>
      }
      deeperLab={{ slug: 'inductance', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={320} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="k"
          value={k}
          min={0}
          max={0.99}
          step={0.01}
          format={(v) => v.toFixed(2)}
          onChange={setK}
        />
        <MiniReadout label="link efficiency" value={(computed.eta * 100).toFixed(0)} unit="%" />
        <MiniReadout
          label="regime"
          value={k < 0.15 ? 'loose' : k < 0.5 ? 'moderate' : k < 0.85 ? 'tight' : 'iron-class'}
        />
      </DemoControls>
      <EquationStrip
        leftLabel="resonant link"
        left={<InlineMath tex="\eta=\frac{k^2Q_1Q_2}{(1+\sqrt{1+k^2Q_1Q_2})^2}" />}
        rightLabel="live value"
        right={
          <InlineMath
            tex={`k^2Q_1Q_2=${computed.couplingProduct.toFixed(1)},\\ \\eta=${(
              computed.eta * 100
            ).toFixed(0)}\\%`}
          />
        }
      />
    </Demo>
  );
}

function drawCoil(ctx: CanvasRenderingContext2D, cx: number, cy: number, label: string) {
  const turns = 6;
  const rx = 18;
  const colH = 64;
  const dy = colH / turns;
  ctx.strokeStyle = getCanvasColors().accent;
  ctx.lineWidth = 1.6;
  for (let i = 0; i < turns; i++) {
    const y = cy - colH / 2 + (i + 0.5) * dy;
    ctx.beginPath();
    ctx.ellipse(cx, y, rx, dy * 0.42, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.save();
  ctx.globalAlpha = 0.8;
  drawLabel(ctx, {
    x: cx,
    y: cy + colH / 2 + 12,
    text: label,
    color: getCanvasColors().accent,
    align: 'center',
    baseline: 'middle',
    weight: 'bold',
  });
  ctx.restore();
}
