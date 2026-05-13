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
      drawBattery(ctx, batX, cy);

      // Output node on right
      const outX = w - padX;

      ctx.strokeStyle = 'rgba(255,255,255,0.65)';
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';

      if (series) {
        // Single line: bat → R1 → R2 → bat (return underneath)
        const xR1 = padX + (outX - padX) * 0.30;
        const xR2 = padX + (outX - padX) * 0.66;

        // Top wire
        ctx.beginPath();
        ctx.moveTo(batX, yTop);
        ctx.lineTo(xR1 - 22, yTop);
        ctx.stroke();
        drawResistor(ctx, xR1, yTop, R1, '1');
        ctx.beginPath();
        ctx.moveTo(xR1 + 22, yTop);
        ctx.lineTo(xR2 - 22, yTop);
        ctx.stroke();
        drawResistor(ctx, xR2, yTop, R2, '2');
        ctx.beginPath();
        ctx.moveTo(xR2 + 22, yTop);
        ctx.lineTo(outX, yTop);
        ctx.lineTo(outX, yBot);
        ctx.lineTo(batX, yBot);
        ctx.stroke();

        // Animated current dots — same I through both resistors
        drawCurrentDotsPath(ctx, t, [
          { x: batX, y: yTop }, { x: outX, y: yTop },
          { x: outX, y: yBot }, { x: batX, y: yBot },
        ], 1.0);

        // Caption
        ctx.fillStyle = 'rgba(160,158,149,0.85)';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('same current through both — voltages add', cx, h - 14);
      } else {
        // Parallel: two branches between two junction nodes
        const nodeL_x = padX + (outX - padX) * 0.28;
        const nodeR_x = padX + (outX - padX) * 0.72;

        // Top wire from battery
        ctx.beginPath();
        ctx.moveTo(batX, yTop);
        ctx.lineTo(nodeL_x, yTop);
        ctx.stroke();
        // Top branch (R1)
        ctx.beginPath();
        ctx.moveTo(nodeL_x, yTop);
        ctx.lineTo(nodeL_x, cy - 22);
        ctx.stroke();
        drawResistorVertical(ctx, nodeL_x, cy - 12, R1, '1', 'left');
        // skipping — replaced below

        // Reset: draw two horizontal branches between vertical junction lines.
        ctx.beginPath();
        ctx.moveTo(nodeL_x, yTop);
        ctx.lineTo(nodeL_x, yBot);
        ctx.moveTo(nodeR_x, yTop);
        ctx.lineTo(nodeR_x, yBot);
        ctx.stroke();

        const branchY1 = cy - 26;
        const branchY2 = cy + 26;
        const midA = (nodeL_x + nodeR_x) / 2;

        // Branch 1
        ctx.beginPath();
        ctx.moveTo(nodeL_x, branchY1); ctx.lineTo(midA - 22, branchY1);
        ctx.moveTo(midA + 22, branchY1); ctx.lineTo(nodeR_x, branchY1);
        ctx.stroke();
        drawResistor(ctx, midA, branchY1, R1, '1');

        // Branch 2
        ctx.beginPath();
        ctx.moveTo(nodeL_x, branchY2); ctx.lineTo(midA - 22, branchY2);
        ctx.moveTo(midA + 22, branchY2); ctx.lineTo(nodeR_x, branchY2);
        ctx.stroke();
        drawResistor(ctx, midA, branchY2, R2, '2');

        // Bottom return wire
        ctx.beginPath();
        ctx.moveTo(nodeR_x, yTop); ctx.lineTo(outX, yTop);
        ctx.lineTo(outX, yBot); ctx.lineTo(batX, yBot);
        ctx.stroke();

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

function drawBattery(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // long plate (+) above, short plate (−) below
  ctx.strokeStyle = 'rgba(255,255,255,0.65)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x, y - 50); ctx.lineTo(x, y - 14);
  ctx.moveTo(x, y + 14); ctx.lineTo(x, y + 50);
  ctx.stroke();
  // + plate (long)
  ctx.strokeStyle = '#ff3b6e';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x - 14, y - 14); ctx.lineTo(x + 14, y - 14);
  ctx.stroke();
  // − plate (short)
  ctx.strokeStyle = '#5baef8';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x - 8, y + 14); ctx.lineTo(x + 8, y + 14);
  ctx.stroke();
  // labels
  ctx.fillStyle = '#ff3b6e';
  ctx.font = 'bold 12px "JetBrains Mono", monospace';
  ctx.textAlign = 'right';
  ctx.fillText('+', x - 18, y - 10);
  ctx.fillStyle = '#5baef8';
  ctx.fillText('−', x - 18, y + 18);
}

function drawResistor(ctx: CanvasRenderingContext2D, cx: number, cy: number, R: number, idx: string) {
  // Zig-zag horizontal, ±22 px wide
  const x0 = cx - 20;
  const x1 = cx + 20;
  ctx.strokeStyle = 'rgba(255,107,42,0.95)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(x0, cy);
  const steps = 6;
  const stepW = (x1 - x0) / steps;
  for (let i = 0; i < steps; i++) {
    const x = x0 + (i + 0.5) * stepW;
    const y = cy + (i % 2 === 0 ? -7 : 7);
    ctx.lineTo(x, y);
  }
  ctx.lineTo(x1, cy);
  ctx.stroke();
  // label
  ctx.fillStyle = '#ff6b2a';
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`R${idx} = ${R.toFixed(0)}Ω`, cx, cy - 16);
}

// Stub used briefly above; kept for safety.
function drawResistorVertical(_ctx: CanvasRenderingContext2D, _cx: number, _cy: number, _R: number, _idx: string, _side: 'left' | 'right') {
  // No-op (replaced by horizontal-branch layout in parallel mode).
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
