/**
 * Demo D3.5 — Series vs. parallel
 *
 * Two resistors. Toggle between series (R₁ + R₂) and parallel
 * (1/R = 1/R₁ + 1/R₂). The schematic redraws to match.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import {
  Demo, DemoControls, MiniReadout, MiniSlider, MiniToggle,
} from '@/components/Demo';
import { Num } from '@/components/Num';
import { drawCircuit } from '@/lib/canvasPrimitives';

interface Props {
  figure?: string;
}

export function SeriesVsParallelDemo({ figure }: Props) {
  const [R1, setR1] = useState(10);
  const [R2, setR2] = useState(30);
  const [series, setSeries] = useState(true);

  const stateRef = useRef({ R1, R2, series, t: 0 });
  useEffect(() => { stateRef.current = { ...stateRef.current, R1, R2, series }; }, [R1, R2, series]);

  const Rtot = series ? (R1 + R2) : (R1 * R2) / (R1 + R2);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h } = info;
    let raf = 0;

    function draw() {
      const st = stateRef.current;
      st.t += 0.016;
      const { R1, R2, series, t } = st;

      ctx.fillStyle = '#0d0d10';
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const padX = 60;
      const yTop = cy - 50;
      const yBot = cy + 50;

      // Battery on left
      const batX = padX;
      // Output node on right
      const outX = w - padX;

      if (series) {
        // Single loop: bat → R1 → R2 → out corner → return underneath.
        const xR1 = padX + (outX - padX) * 0.30;
        const xR2 = padX + (outX - padX) * 0.66;
        drawCircuit(ctx, {
          defaultWireColor: 'rgba(255,255,255,0.65)',
          elements: [
            { kind: 'battery', at: { x: batX, y: cy },
              label: '+', labelOffset: { x: -18, y: -10 }, leadLength: 50 },
            // Top rail with two resistor gaps + loop back along the bottom.
            { kind: 'wire', points: [{ x: batX, y: yTop }, { x: xR1 - 22, y: yTop }] },
            { kind: 'resistor', from: { x: xR1 - 20, y: yTop }, to: { x: xR1 + 20, y: yTop },
              label: `R1 = ${R1.toFixed(0)}Ω`, labelOffset: { x: 0, y: -16 } },
            { kind: 'wire', points: [{ x: xR1 + 22, y: yTop }, { x: xR2 - 22, y: yTop }] },
            { kind: 'resistor', from: { x: xR2 - 20, y: yTop }, to: { x: xR2 + 20, y: yTop },
              label: `R2 = ${R2.toFixed(0)}Ω`, labelOffset: { x: 0, y: -16 } },
            { kind: 'wire',
              points: [
                { x: xR2 + 22, y: yTop },
                { x: outX, y: yTop },
                { x: outX, y: yBot },
                { x: batX, y: yBot },
              ] },
          ],
        });
      } else {
        // Parallel: two horizontal branches between two vertical junction rails.
        const nodeL_x = padX + (outX - padX) * 0.28;
        const nodeR_x = padX + (outX - padX) * 0.72;
        const branchY1 = cy - 26;
        const branchY2 = cy + 26;
        const midA = (nodeL_x + nodeR_x) / 2;
        drawCircuit(ctx, {
          defaultWireColor: 'rgba(255,255,255,0.65)',
          elements: [
            { kind: 'battery', at: { x: batX, y: cy },
              label: '+', labelOffset: { x: -18, y: -10 }, leadLength: 50 },
            // Battery top → left junction.
            { kind: 'wire', points: [{ x: batX, y: yTop }, { x: nodeL_x, y: yTop }] },
            // Two vertical junction rails.
            { kind: 'wire', points: [{ x: nodeL_x, y: yTop }, { x: nodeL_x, y: yBot }] },
            { kind: 'wire', points: [{ x: nodeR_x, y: yTop }, { x: nodeR_x, y: yBot }] },
            // Branch 1 leads + resistor.
            { kind: 'wire', points: [{ x: nodeL_x, y: branchY1 }, { x: midA - 22, y: branchY1 }] },
            { kind: 'wire', points: [{ x: midA + 22, y: branchY1 }, { x: nodeR_x, y: branchY1 }] },
            { kind: 'resistor', from: { x: midA - 20, y: branchY1 }, to: { x: midA + 20, y: branchY1 },
              label: `R1 = ${R1.toFixed(0)}Ω`, labelOffset: { x: 0, y: -16 } },
            // Branch 2 leads + resistor.
            { kind: 'wire', points: [{ x: nodeL_x, y: branchY2 }, { x: midA - 22, y: branchY2 }] },
            { kind: 'wire', points: [{ x: midA + 22, y: branchY2 }, { x: nodeR_x, y: branchY2 }] },
            { kind: 'resistor', from: { x: midA - 20, y: branchY2 }, to: { x: midA + 20, y: branchY2 },
              label: `R2 = ${R2.toFixed(0)}Ω`, labelOffset: { x: 0, y: -16 } },
            // Right junction → out corner → return rail along the bottom.
            { kind: 'wire',
              points: [
                { x: nodeR_x, y: yTop },
                { x: outX, y: yTop },
                { x: outX, y: yBot },
                { x: batX, y: yBot },
              ] },
          ],
        });
      }

      // Battery negative-terminal glyph (battery primitive only emits the '+' label).
      ctx.fillStyle = '#5baef8';
      ctx.font = 'bold 12px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText('−', batX - 18, cy + 18);

      if (series) {
        // Animated current dots — same I through both resistors.
        drawCurrentDotsPath(ctx, t, [
          { x: batX, y: yTop }, { x: outX, y: yTop },
          { x: outX, y: yBot }, { x: batX, y: yBot },
        ], 1.0);
        ctx.fillStyle = 'rgba(160,158,149,0.85)';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('same current through both — voltages add', cx, h - 14);
      } else {
        const nodeL_x = padX + (outX - padX) * 0.28;
        const nodeR_x = padX + (outX - padX) * 0.72;
        const branchY1 = cy - 26;
        const branchY2 = cy + 26;

        // Animated dots — current splits inversely with R
        const Itot = 1; // unit
        const I1 = Itot * (R2 / (R1 + R2));
        const I2 = Itot * (R1 / (R1 + R2));
        // Trunk current
        drawCurrentDotsPath(ctx, t, [
          { x: batX, y: yTop }, { x: nodeL_x, y: yTop },
        ], Itot);
        drawCurrentDotsPath(ctx, t, [
          { x: nodeR_x, y: yTop }, { x: outX, y: yTop },
          { x: outX, y: yBot }, { x: batX, y: yBot },
        ], Itot);
        // Branch currents
        drawCurrentDotsPath(ctx, t, [
          { x: nodeL_x, y: branchY1 }, { x: nodeR_x, y: branchY1 },
        ], I1);
        drawCurrentDotsPath(ctx, t, [
          { x: nodeL_x, y: branchY2 }, { x: nodeR_x, y: branchY2 },
        ], I2);

        ctx.fillStyle = 'rgba(160,158,149,0.85)';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('same voltage across both — currents add', cx, h - 14);
      }

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 3.5'}
      title="Series and parallel"
      question="Which configuration carries more current?"
      caption="In series, the same current must climb both resistive hills, and the resistance is R₁ + R₂. In parallel, current splits across two paths and the combined resistance is always smaller than either one."
      deeperLab={{ slug: 'resistance', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={260} setup={setup} />
      <DemoControls>
        <MiniToggle
          label={series ? 'Series' : 'Parallel'}
          checked={series}
          onChange={setSeries}
        />
        <MiniSlider
          label="R₁"
          value={R1} min={1} max={100} step={1}
          format={v => v.toFixed(0) + ' Ω'}
          onChange={setR1}
        />
        <MiniSlider
          label="R₂"
          value={R2} min={1} max={100} step={1}
          format={v => v.toFixed(0) + ' Ω'}
          onChange={setR2}
        />
        <MiniReadout
          label={series ? 'R₁ + R₂' : '(R₁·R₂)/(R₁+R₂)'}
          value={<Num value={Rtot} />}
          unit="Ω"
        />
      </DemoControls>
    </Demo>
  );
}

function drawCurrentDotsPath(
  ctx: CanvasRenderingContext2D,
  t: number,
  pts: Array<{ x: number; y: number }>,
  Iscale: number,
) {
  // Walk along piecewise linear path; emit dots at intervals along it.
  const segs: Array<{ x0: number; y0: number; x1: number; y1: number; len: number }> = [];
  let total = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i]; const b = pts[i + 1];
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    segs.push({ x0: a.x, y0: a.y, x1: b.x, y1: b.y, len });
    total += len;
  }
  if (total < 1) return;
  const spacing = 26;
  const speed = 80; // px/sec
  const offset = (t * speed) % spacing;
  const intensity = Math.max(0.2, Math.min(1, Iscale));
  ctx.fillStyle = `rgba(91,174,248,${0.5 + 0.4 * intensity})`;
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
