/**
 * Demo D22.4 — Measuring M from series-aiding and series-opposing
 *
 * Two coils with adjustable L1, L2, and k. Reader toggles between
 * "aiding" and "opposing" winding orientations. The demo displays the
 * series equivalent inductance for each, then computes
 *
 *   M = (L_aid - L_opp) / 4
 *
 * which is exactly the classic bench technique for measuring mutual
 * inductance — just two LCR-meter readings.
 */
import { useMemo, useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider, MiniToggle } from '@/components/Demo';
import { Num } from '@/components/Num';
import { drawLabel } from '@/lib/canvasLayout';
import { getCanvasColors, withAlpha } from '@/lib/canvasTheme';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

interface Props {
  figure?: string;
}

export function SeriesCoupledMeasureMDemo({ figure }: Props) {
  const [L1mH, setL1mH] = useState(4);
  const [L2mH, setL2mH] = useState(9);
  const [k, setK] = useState(0.5);
  const [aiding, setAiding] = useState(true);

  const stateRef = useSimState({ L1mH, L2mH, k, aiding });
  const computed = useMemo(() => {
    const Mh = k * Math.sqrt(L1mH * L2mH); // mH
    const Laid = L1mH + L2mH + 2 * Mh;
    const Lopp = L1mH + L2mH - 2 * Mh;
    const Lnow = aiding ? Laid : Lopp;
    const Mfromreadings = (Laid - Lopp) / 4;
    return { Mh, Laid, Lopp, Lnow, Mfromreadings };
  }, [L1mH, L2mH, k, aiding]);

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, colors }, _state, _dt, _simTime) => {
      const { L1mH, L2mH, k, aiding } = stateRef.current;
      const Mh = k * Math.sqrt(L1mH * L2mH);
      const Laid = L1mH + L2mH + 2 * Mh;
      const Lopp = L1mH + L2mH - 2 * Mh;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);
      const cy = h / 2;
      const c1x = w * 0.3;
      const c2x = w * 0.62;
      drawCoilSeries(ctx, c1x, cy, 'L₁', `${L1mH.toFixed(1)} mH`, +1);
      drawCoilSeries(ctx, c2x, cy, 'L₂', `${L2mH.toFixed(1)} mH`, aiding ? +1 : -1);
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = colors.textDim;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(c1x + 22, cy);
      ctx.lineTo(c2x - 22, cy);
      ctx.stroke();
      ctx.restore();
      drawLabel(ctx, { text: `M = ${Mh.toFixed(2)} mH`, x: (c1x + c2x) / 2, y: cy + 24, color: colors.teal, font: '10px "JetBrains Mono", monospace', align: 'center' });
      ctx.fillStyle = aiding ? withAlpha(colors.accent, 0.95) : withAlpha(colors.blue, 0.95);
      ctx.font = 'bold 18px "STIX Two Text", "Fraunces", serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(`L_eq = ${(aiding ? Laid : Lopp).toFixed(2)} mH`, w / 2, 14);
      drawLabel(ctx, { text: aiding ? 'series aiding:  L₁ + L₂ + 2M' : 'series opposing:  L₁ + L₂ − 2M', x: w / 2, y: 38, font: '10px "JetBrains Mono", monospace' });
      ctx.save();
      ctx.globalAlpha = 0.65;
      drawLabel(ctx, { text: `L_aid = ${Laid.toFixed(2)} mH`, x: 12, y: h - 22, font: '10px "JetBrains Mono", monospace', baseline: 'bottom' });
      drawLabel(ctx, { text: `L_opp = ${Lopp.toFixed(2)} mH`, x: 12, y: h - 8 });
      ctx.textAlign = 'right';
      ctx.restore();
      drawLabel(ctx, { text: `M = (L_aid − L_opp) / 4 = ${((Laid - Lopp) / 4).toFixed(2)} mH`, x: w - 12, y: h - 8, color: colors.accent });
    },
    [],
  );

  return (
    <Demo
      figure={figure ?? 'Fig. 22.4'}
      title="Measuring M from two series readings"
      question="Two LCR-meter readings, one subtraction — that's it."
      caption={
        <>
          Series-aiding and series-opposing add 2M and subtract 2M from L₁ + L₂. Subtract the two
          readings and divide by four; what falls out is the mutual inductance. This is the standard
          bench measurement, taught in every introductory circuits lab.
        </>
      }
      deeperLab={{ slug: 'inductance', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={260} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="L₁"
          value={L1mH}
          min={1}
          max={20}
          step={0.5}
          format={(v) => v.toFixed(1) + ' mH'}
          onChange={setL1mH}
        />
        <MiniSlider
          label="L₂"
          value={L2mH}
          min={1}
          max={20}
          step={0.5}
          format={(v) => v.toFixed(1) + ' mH'}
          onChange={setL2mH}
        />
        <MiniSlider
          label="k"
          value={k}
          min={0}
          max={0.99}
          step={0.01}
          format={(v) => v.toFixed(2)}
          onChange={setK}
        />
        <MiniToggle
          label={aiding ? 'series: aiding' : 'series: opposing'}
          checked={aiding}
          onChange={setAiding}
        />
        <MiniReadout
          label="L_eq"
          value={<Num value={computed.Lnow * 1e-3} digits={2} />}
          unit="H"
        />
        <MiniReadout
          label="M (derived)"
          value={<Num value={computed.Mfromreadings * 1e-3} digits={2} />}
          unit="H"
        />
      </DemoControls>
    </Demo>
  );
}

function drawCoilSeries(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  label: string,
  value: string,
  sense: number,
) {
  const loops = 4;
  const span = 44;
  const dy = span / loops;
  ctx.strokeStyle = getCanvasColors().accent;
  ctx.lineWidth = 1.6;
  // Lead in
  ctx.beginPath();
  ctx.moveTo(cx - 22, cy);
  ctx.lineTo(cx - 18, cy);
  ctx.stroke();

  // Bump loops above or below depending on sense
  ctx.beginPath();
  for (let i = 0; i < loops; i++) {
    const x0 = cx - 18 + i * (span / loops) + 2;
    ctx.moveTo(x0, cy);
    ctx.arc(x0 + dy / 2, cy, dy / 2, Math.PI, 0, sense < 0);
    ctx.lineTo(x0 + dy, cy);
  }
  ctx.stroke();

  // Lead out
  ctx.beginPath();
  ctx.moveTo(cx + 18, cy);
  ctx.lineTo(cx + 22, cy);
  ctx.stroke();

  // Labels
  drawLabel(ctx, {
    x: cx,
    y: cy - 24,
    text: label,
    color: getCanvasColors().accent,
    size: 11,
    align: 'center',
    baseline: 'top',
    weight: 'bold',
  });
  ctx.save();
  ctx.globalAlpha = 0.75;
  drawLabel(ctx, {
    x: cx,
    y: cy - 38,
    text: value,
    color: getCanvasColors().textDim,
    size: 9,
  });
  ctx.restore();
}
