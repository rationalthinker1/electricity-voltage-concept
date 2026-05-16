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
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider, MiniToggle } from '@/components/Demo';
import { Num } from '@/components/Num';
import { getCanvasColors } from '@/lib/canvasTheme';

interface Props {
  figure?: string;
}

export function SeriesCoupledMeasureMDemo({ figure }: Props) {
  const [L1mH, setL1mH] = useState(4);
  const [L2mH, setL2mH] = useState(9);
  const [k, setK] = useState(0.5);
  const [aiding, setAiding] = useState(true);

  const stateRef = useRef({ L1mH, L2mH, k, aiding });
  useEffect(() => {
    stateRef.current = { L1mH, L2mH, k, aiding };
  }, [L1mH, L2mH, k, aiding]);

  const computed = useMemo(() => {
    const Mh = k * Math.sqrt(L1mH * L2mH); // mH
    const Laid = L1mH + L2mH + 2 * Mh;
    const Lopp = L1mH + L2mH - 2 * Mh;
    const Lnow = aiding ? Laid : Lopp;
    const Mfromreadings = (Laid - Lopp) / 4;
    return { Mh, Laid, Lopp, Lnow, Mfromreadings };
  }, [L1mH, L2mH, k, aiding]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h } = info;
    let raf = 0;

    function draw() {
      const { L1mH, L2mH, k, aiding } = stateRef.current;
      const Mh = k * Math.sqrt(L1mH * L2mH);
      const Laid = L1mH + L2mH + 2 * Mh;
      const Lopp = L1mH + L2mH - 2 * Mh;

      ctx.fillStyle = getCanvasColors().bg;
      ctx.fillRect(0, 0, w, h);

      // Two coils in series in the schematic — draw them with arrow tags showing winding sense
      const cy = h / 2;
      const c1x = w * 0.3;
      const c2x = w * 0.62;

      drawCoilSeries(ctx, c1x, cy, 'L₁', `${L1mH.toFixed(1)} mH`, +1);
      // Aiding: same sense; Opposing: flip the second coil's wind direction
      drawCoilSeries(ctx, c2x, cy, 'L₂', `${L2mH.toFixed(1)} mH`, aiding ? +1 : -1);

      // Connecting wire
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = getCanvasColors().textDim;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(c1x + 22, cy);
      ctx.lineTo(c2x - 22, cy);
      ctx.stroke();

      // M label between
      ctx.restore();
      ctx.fillStyle = getCanvasColors().teal;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`M = ${Mh.toFixed(2)} mH`, (c1x + c2x) / 2, cy + 24);

      // Big readout: L_eq right now
      ctx.fillStyle = aiding ? 'rgba(255,107,42,0.95)' : 'rgba(91,174,248,0.95)';
      ctx.font = 'bold 18px "STIX Two Text", "Fraunces", serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(`L_eq = ${(aiding ? Laid : Lopp).toFixed(2)} mH`, w / 2, 14);
      ctx.fillStyle = getCanvasColors().textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText(
        aiding ? 'series aiding:  L₁ + L₂ + 2M' : 'series opposing:  L₁ + L₂ − 2M',
        w / 2,
        38,
      );

      // Bottom strip: both readings + derived M
      ctx.save();
      ctx.globalAlpha = 0.65;
      ctx.fillStyle = getCanvasColors().textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`L_aid = ${Laid.toFixed(2)} mH`, 12, h - 22);
      ctx.fillText(`L_opp = ${Lopp.toFixed(2)} mH`, 12, h - 8);
      ctx.textAlign = 'right';
      ctx.restore();
      ctx.fillStyle = getCanvasColors().accent;
      ctx.fillText(`M = (L_aid − L_opp) / 4 = ${((Laid - Lopp) / 4).toFixed(2)} mH`, w - 12, h - 8);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

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
  ctx.fillStyle = getCanvasColors().accent;
  ctx.font = 'bold 11px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(label, cx, cy - 24);
  ctx.save();
  ctx.globalAlpha = 0.75;
  ctx.fillStyle = getCanvasColors().textDim;
  ctx.font = '9px "JetBrains Mono", monospace';
  ctx.fillText(value, cx, cy - 38);
  ctx.restore();
}
