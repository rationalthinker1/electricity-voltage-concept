/**
 * Demo D3.5 — Series vs. parallel
 *
 * Two resistors. Toggle between series (R₁ + R₂) and parallel
 * (1/R = 1/R₁ + 1/R₂). The schematic redraws to match. A fixed
 * source voltage drives the loop, so the animated electron flow
 * actually slows when you crank R up — the same V = IR that the
 * readout shows.
 */
import { useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import {
  Demo,
  DemoControls,
  EquationStrip,
  MiniReadout,
  MiniSlider,
  MiniToggle,
} from '@/components/Demo';
import { InlineMath } from '@/components/Formula';
import { Num } from '@/components/Num';
import { drawLabel } from '@/lib/canvasLayout';
import { type CircuitElement } from '@/lib/canvasPrimitives';
import { getCanvasColors, withAlpha } from '@/lib/canvasTheme';
import { useCircuitCache } from '@/lib/useCircuitCache';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

const V_FIXED = 12;
const I_REF = V_FIXED / 40;

interface Props {
  figure: string;
}

export function SeriesVsParallelDemo({ figure }: Props) {
  const [R1, setR1] = useState(10);
  const [R2, setR2] = useState(30);
  const [series, setSeries] = useState(true);

  const Rtot = series ? R1 + R2 : (R1 * R2) / (R1 + R2);
  const Itot = V_FIXED / Rtot;

  const stateRef = useSimState({ R1, R2, series });

  // Static schematic. Rebakes when topology or resistor labels change.
  const getStaticSchematic = useCircuitCache(
    (sw, sh, _dpr) => buildSeriesParallelSpec(sw, sh, series, R1, R2),
    [series, R1, R2],
  );

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, colors, dpr }, _state, _dt, simTime) => {
      const s = stateRef.current;
      const { R1, R2, series } = s;
      const t = simTime;

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const padX = 60;
      const yTop = cy - 50;
      const yBot = cy + 50;
      const batX = padX;
      const outX = w - padX;

      const off = getStaticSchematic(w, h, dpr);
      if (off) ctx.drawImage(off, 0, 0, w, h);

      drawLabel(ctx, {
        x: batX - 18,
        y: cy + 18,
        text: '−',
        color: colors.blue,
        size: 12,
        align: 'right',
        weight: 'bold',
      });

      const RtotNow = series ? R1 + R2 : (R1 * R2) / (R1 + R2);
      const ItotNow = V_FIXED / RtotNow;
      const trunkScale = ItotNow / I_REF;

      if (series) {
        const xR1 = padX + (outX - padX) * 0.3;
        const xR2 = padX + (outX - padX) * 0.66;
        const V_afterR1 = V_FIXED - ItotNow * R1;

        drawCurrentDotsPath(
          ctx,
          t,
          [
            { x: batX, y: yTop },
            { x: outX, y: yTop },
            { x: outX, y: yBot },
            { x: batX, y: yBot },
          ],
          trunkScale,
        );

        drawVoltageProbe(ctx, (batX + (xR1 - 22)) / 2, yTop - 16, V_FIXED);
        drawVoltageProbe(ctx, (xR1 + xR2) / 2, yTop - 16, V_afterR1);
        drawVoltageProbe(ctx, (xR2 + 22 + outX) / 2, yTop - 16, 0);
        drawVoltageProbe(ctx, (batX + outX) / 2, yBot + 18, 0);

        drawLabel(ctx, {
          x: cx,
          y: h - 14,
          text: 'same current through both — voltages add',
          color: colors.textDim,
          align: 'center',
        });
      } else {
        const nodeL_x = padX + (outX - padX) * 0.28;
        const nodeR_x = padX + (outX - padX) * 0.72;
        const branchY1 = cy - 26;
        const branchY2 = cy + 26;

        const I1 = V_FIXED / R1;
        const I2 = V_FIXED / R2;
        const branch1Scale = I1 / I_REF;
        const branch2Scale = I2 / I_REF;

        drawCurrentDotsPath(
          ctx,
          t,
          [
            { x: batX, y: yTop },
            { x: nodeL_x, y: yTop },
          ],
          trunkScale,
        );
        drawCurrentDotsPath(
          ctx,
          t,
          [
            { x: nodeR_x, y: yTop },
            { x: outX, y: yTop },
            { x: outX, y: yBot },
            { x: batX, y: yBot },
          ],
          trunkScale,
        );
        drawCurrentDotsPath(
          ctx,
          t,
          [
            { x: nodeL_x, y: branchY1 },
            { x: nodeR_x, y: branchY1 },
          ],
          branch1Scale,
        );
        drawCurrentDotsPath(
          ctx,
          t,
          [
            { x: nodeL_x, y: branchY2 },
            { x: nodeR_x, y: branchY2 },
          ],
          branch2Scale,
        );

        drawVoltageProbe(ctx, (batX + nodeL_x) / 2, yTop - 16, V_FIXED);
        drawVoltageProbe(ctx, (nodeR_x + outX) / 2, yTop - 16, 0);
        drawVoltageProbe(ctx, (batX + outX) / 2, yBot + 18, 0);

        drawLabel(ctx, {
          x: cx,
          y: h - 14,
          text: 'same voltage across both — currents add',
          color: colors.textDim,
          align: 'center',
        });
      }
    },
    [],
  );

  return (
    <Demo
      figure={figure}
      title="Series and parallel"
      question="Which configuration carries more current?"
      caption="In series, the same current must climb both resistive hills, and the resistance is R₁ + R₂. In parallel, current splits across two paths and the combined resistance is always smaller than either one."
      deeperLab={{ slug: 'resistance', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={260} setup={setup} />
      <DemoControls>
        <MiniToggle label={series ? 'Series' : 'Parallel'} checked={series} onChange={setSeries} />
        <MiniSlider
          label="R₁"
          value={R1}
          min={1}
          max={100}
          step={1}
          format={(v) => v.toFixed(0) + ' Ω'}
          onChange={setR1}
        />
        <MiniSlider
          label="R₂"
          value={R2}
          min={1}
          max={100}
          step={1}
          format={(v) => v.toFixed(0) + ' Ω'}
          onChange={setR2}
        />
        <MiniReadout
          label={series ? 'R₁ + R₂' : '(R₁·R₂)/(R₁+R₂)'}
          value={<Num value={Rtot} />}
          unit="Ω"
        />
        <MiniReadout label={`I = ${V_FIXED} V / R`} value={<Num value={Itot} />} unit="A" />
      </DemoControls>
      <EquationStrip
        leftLabel={series ? 'Series combination' : 'Parallel combination'}
        left={
          series ? (
            <InlineMath
              tex={
                `R_{\\text{tot}} \\;=\\; R_1 + R_2 \\;=\\; ` +
                `${R1.toFixed(0)} + ${R2.toFixed(0)} \\;=\\; ${Rtot.toFixed(2)}\\ \\Omega`
              }
            />
          ) : (
            <InlineMath
              tex={
                `R_{\\text{tot}} \\;=\\; \\dfrac{R_1 R_2}{R_1 + R_2} \\;=\\; ` +
                `\\dfrac{${R1.toFixed(0)} \\times ${R2.toFixed(0)}}` +
                `{${R1.toFixed(0)} + ${R2.toFixed(0)}} \\;=\\; ${Rtot.toFixed(2)}\\ \\Omega`
              }
            />
          )
        }
        rightLabel="Loop current at V = 12 V"
        right={
          <InlineMath
            tex={
              `I \\;=\\; V / R_{\\text{tot}} \\;=\\; 12 / ${Rtot.toFixed(2)} ` +
              `\\;\\approx\\; ${Itot.toFixed(3)}\\ \\text{A}`
            }
          />
        }
      />
    </Demo>
  );
}

function buildSeriesParallelSpec(w: number, h: number, series: boolean, R1: number, R2: number) {
  const cy = h / 2;
  const padX = 60;
  const yTop = cy - 50;
  const yBot = cy + 50;
  const batX = padX;
  const outX = w - padX;

  let elements: CircuitElement[];
  if (series) {
    const xR1 = padX + (outX - padX) * 0.3;
    const xR2 = padX + (outX - padX) * 0.66;
    elements = [
      {
        kind: 'battery',
        at: { x: batX, y: cy },
        label: `+   ${V_FIXED} V`,
        labelOffset: { x: -22, y: -10 },
        leadLength: 50,
      },
      {
        kind: 'wire',
        points: [
          { x: batX, y: yTop },
          { x: xR1 - 22, y: yTop },
        ],
      },
      {
        kind: 'resistor',
        from: { x: xR1 - 20, y: yTop },
        to: { x: xR1 + 20, y: yTop },
        label: `R1 = ${R1.toFixed(0)}Ω`,
        labelOffset: { x: 0, y: -16 },
      },
      {
        kind: 'wire',
        points: [
          { x: xR1 + 22, y: yTop },
          { x: xR2 - 22, y: yTop },
        ],
      },
      {
        kind: 'resistor',
        from: { x: xR2 - 20, y: yTop },
        to: { x: xR2 + 20, y: yTop },
        label: `R2 = ${R2.toFixed(0)}Ω`,
        labelOffset: { x: 0, y: -16 },
      },
      {
        kind: 'wire',
        points: [
          { x: xR2 + 22, y: yTop },
          { x: outX, y: yTop },
          { x: outX, y: yBot },
          { x: batX, y: yBot },
        ],
      },
    ];
  } else {
    const nodeL_x = padX + (outX - padX) * 0.28;
    const nodeR_x = padX + (outX - padX) * 0.72;
    const branchY1 = cy - 26;
    const branchY2 = cy + 26;
    const midA = (nodeL_x + nodeR_x) / 2;
    elements = [
      {
        kind: 'battery',
        at: { x: batX, y: cy },
        label: `+   ${V_FIXED} V`,
        labelOffset: { x: -22, y: -10 },
        leadLength: 50,
      },
      {
        kind: 'wire',
        points: [
          { x: batX, y: yTop },
          { x: nodeL_x, y: yTop },
        ],
      },
      {
        kind: 'wire',
        points: [
          { x: nodeL_x, y: yTop },
          { x: nodeL_x, y: yBot },
        ],
      },
      {
        kind: 'wire',
        points: [
          { x: nodeR_x, y: yTop },
          { x: nodeR_x, y: yBot },
        ],
      },
      {
        kind: 'wire',
        points: [
          { x: nodeL_x, y: branchY1 },
          { x: midA - 22, y: branchY1 },
        ],
      },
      {
        kind: 'wire',
        points: [
          { x: midA + 22, y: branchY1 },
          { x: nodeR_x, y: branchY1 },
        ],
      },
      {
        kind: 'resistor',
        from: { x: midA - 20, y: branchY1 },
        to: { x: midA + 20, y: branchY1 },
        label: `R1 = ${R1.toFixed(0)}Ω`,
        labelOffset: { x: 0, y: -16 },
      },
      {
        kind: 'wire',
        points: [
          { x: nodeL_x, y: branchY2 },
          { x: midA - 22, y: branchY2 },
        ],
      },
      {
        kind: 'wire',
        points: [
          { x: midA + 22, y: branchY2 },
          { x: nodeR_x, y: branchY2 },
        ],
      },
      {
        kind: 'resistor',
        from: { x: midA - 20, y: branchY2 },
        to: { x: midA + 20, y: branchY2 },
        label: `R2 = ${R2.toFixed(0)}Ω`,
        labelOffset: { x: 0, y: -16 },
      },
      {
        kind: 'wire',
        points: [
          { x: nodeR_x, y: yTop },
          { x: outX, y: yTop },
          { x: outX, y: yBot },
          { x: batX, y: yBot },
        ],
      },
    ];
  }
  return { elements, defaultWireColor: withAlpha(getCanvasColors().text, 0.65) };
}

function drawCurrentDotsPath(
  ctx: CanvasRenderingContext2D,
  t: number,
  pts: Array<{ x: number; y: number }>,
  Iscale: number,
) {
  const segs: Array<{ x0: number; y0: number; x1: number; y1: number; len: number }> = [];
  let total = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    segs.push({ x0: a.x, y0: a.y, x1: b.x, y1: b.y, len });
    total += len;
  }
  if (total < 1) return;
  const spacing = 26;
  const visScale = Math.max(0.05, Math.min(3, Iscale));
  const speed = 80 * visScale;
  const offset = (t * speed) % spacing;
  const intensity = Math.max(0.2, Math.min(1, visScale));
  const blue = getCanvasColors().blue;
  ctx.fillStyle = withAlpha(blue, 0.5 + 0.4 * intensity);
  for (let s = -spacing; s < total; s += spacing) {
    const d = s + offset;
    if (d < 0 || d > total) continue;
    let acc = 0;
    for (const sg of segs) {
      if (d <= acc + sg.len) {
        const f = (d - acc) / sg.len;
        const x = sg.x0 + (sg.x1 - sg.x0) * f;
        const y = sg.y0 + (sg.y1 - sg.y0) * f;
        ctx.beginPath();
        ctx.arc(x, y, 1.8 + 1.4 * intensity, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      acc += sg.len;
    }
  }
}

function drawVoltageProbe(ctx: CanvasRenderingContext2D, x: number, y: number, value: number) {
  const colors = getCanvasColors();
  const text = `${value.toFixed(2)} V`;
  ctx.save();
  const m = ctx.measureText(text);
  const boxW = m.width + 12;
  const boxH = 16;
  ctx.fillStyle = withAlpha(colors.bg, 0.85);
  ctx.fillRect(x - boxW / 2, y - boxH / 2, boxW, boxH);
  ctx.strokeStyle = withAlpha(colors.accent, 0.55);
  ctx.lineWidth = 1;
  ctx.strokeRect(x - boxW / 2, y - boxH / 2, boxW, boxH);
  drawLabel(ctx, { text: text, x: x, y: y, color: colors.accent, font: '10px "JetBrains Mono", monospace', align: 'center', baseline: 'middle' });
  ctx.restore();
}
