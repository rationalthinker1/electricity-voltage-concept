/**
 * Demo D3.5 — Series vs. parallel
 *
 * Two resistors. Toggle between series (R₁ + R₂) and parallel
 * (1/R = 1/R₁ + 1/R₂). The schematic redraws to match. A fixed
 * source voltage drives the loop, so the animated electron flow
 * actually slows when you crank R up — the same V = IR that the
 * readout shows.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider, MiniToggle } from '@/components/Demo';
import { Num } from '@/components/Num';
import { renderCircuitToCanvas, type CircuitElement } from '@/lib/canvasPrimitives';
import { getCanvasColors } from '@/lib/canvasTheme';

// Fixed driving voltage and a reference total resistance so the visual
// flow rate is "1" at the demo's initial configuration (R1 = 10 Ω in
// series with R2 = 30 Ω → R_tot = 40 Ω → I = 0.3 A). Sliding R away
// from the reference visibly speeds up or slows down the dot flow.
const V_FIXED = 12; // V
const I_REF = V_FIXED / 40; // 0.3 A — used to normalise visual speed

interface Props {
  figure?: string;
}

interface StaticCacheEntry {
  key: string;
  canvas: HTMLCanvasElement;
}

export function SeriesVsParallelDemo({ figure }: Props) {
  const [R1, setR1] = useState(10);
  const [R2, setR2] = useState(30);
  const [series, setSeries] = useState(true);

  const stateRef = useRef({ R1, R2, series, t: 0 });
  useEffect(() => {
    stateRef.current = { ...stateRef.current, R1, R2, series };
  }, [R1, R2, series]);

  const Rtot = series ? R1 + R2 : (R1 * R2) / (R1 + R2);
  const Itot = V_FIXED / Rtot;

  const cacheRef = useRef<StaticCacheEntry | null>(null);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, dpr } = info;
    let raf = 0;

    function draw() {
      const st = stateRef.current;
      st.t += 0.016;
      const { R1, R2, series, t } = st;

      ctx.fillStyle = getCanvasColors().bg;
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

      // Cache key: schematic depends on canvas size, DPR, series-vs-parallel topology,
      // the resistor labels, AND the current theme — wire colour swaps light/dark.
      const theme = document.documentElement.getAttribute('data-theme') ?? 'dark';
      const cacheKey = `${w}x${h}@${dpr}|s${series ? 1 : 0}|R1:${R1}|R2:${R2}|t:${theme}`;
      if (cacheRef.current?.key !== cacheKey) {
        cacheRef.current = {
          key: cacheKey,
          canvas: buildStaticSchematic(w, h, series, R1, R2, dpr),
        };
      }
      ctx.drawImage(cacheRef.current.canvas, 0, 0, w, h);

      // Per-frame overlay: animated current dots + helper text + battery '−' glyph.
      ctx.fillStyle = getCanvasColors().blue;
      ctx.font = 'bold 12px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText('−', batX - 18, cy + 18);

      // Current driven by the fixed source. Speed/density of the dots is
      // normalised against I_REF so the initial configuration runs at "1×".
      const RtotNow = series ? R1 + R2 : (R1 * R2) / (R1 + R2);
      const ItotNow = V_FIXED / RtotNow;
      const trunkScale = ItotNow / I_REF;

      if (series) {
        // Node-voltage probes along the top wire (Kirchhoff's voltage law).
        const xR1 = padX + (outX - padX) * 0.3;
        const xR2 = padX + (outX - padX) * 0.66;
        const V_afterR1 = V_FIXED - ItotNow * R1; // node between R1 and R2

        // Animated current dots — same I through both resistors.
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

        ctx.fillStyle = getCanvasColors().textDim;
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('same current through both — voltages add', cx, h - 14);
      } else {
        const nodeL_x = padX + (outX - padX) * 0.28;
        const nodeR_x = padX + (outX - padX) * 0.72;
        const branchY1 = cy - 26;
        const branchY2 = cy + 26;

        // Trunk carries the full ItotNow; each branch carries V_FIXED / R_k.
        const I1 = V_FIXED / R1;
        const I2 = V_FIXED / R2;
        const branch1Scale = I1 / I_REF;
        const branch2Scale = I2 / I_REF;

        // Trunk current
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
        // Branch currents
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

        // Voltage probes — both branches see the full V across them.
        drawVoltageProbe(ctx, (batX + nodeL_x) / 2, yTop - 16, V_FIXED);
        drawVoltageProbe(ctx, (nodeR_x + outX) / 2, yTop - 16, 0);
        drawVoltageProbe(ctx, (batX + outX) / 2, yBot + 18, 0);

        ctx.fillStyle = getCanvasColors().textDim;
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
    </Demo>
  );
}

function buildStaticSchematic(
  w: number,
  h: number,
  series: boolean,
  R1: number,
  R2: number,
  dpr: number,
): HTMLCanvasElement {
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
  return renderCircuitToCanvas(
    { elements, defaultWireColor: withAlpha(getCanvasColors().text, 0.65) },
    w,
    h,
    dpr,
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
    const a = pts[i];
    const b = pts[i + 1];
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    segs.push({ x0: a.x, y0: a.y, x1: b.x, y1: b.y, len });
    total += len;
  }
  if (total < 1) return;
  const spacing = 26;
  // Speed scales with current — same V, larger R → smaller I → slower dots.
  // Clamp the visual to keep motion perceptible across the slider range.
  const visScale = Math.max(0.05, Math.min(3, Iscale));
  const speed = 80 * visScale; // px/sec
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

function drawVoltageProbe(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  value: number,
) {
  const colors = getCanvasColors();
  const text = `${value.toFixed(2)} V`;
  ctx.save();
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const m = ctx.measureText(text);
  const boxW = m.width + 12;
  const boxH = 16;
  ctx.fillStyle = withAlpha(colors.bg, 0.85);
  ctx.fillRect(x - boxW / 2, y - boxH / 2, boxW, boxH);
  ctx.strokeStyle = withAlpha(colors.accent, 0.55);
  ctx.lineWidth = 1;
  ctx.strokeRect(x - boxW / 2, y - boxH / 2, boxW, boxH);
  ctx.fillStyle = colors.accent;
  ctx.fillText(text, x, y);
  ctx.restore();
}

function withAlpha(color: string, alpha: number): string {
  if (color.startsWith('#')) {
    let r: number;
    let g: number;
    let b: number;
    if (color.length === 7) {
      r = parseInt(color.slice(1, 3), 16);
      g = parseInt(color.slice(3, 5), 16);
      b = parseInt(color.slice(5, 7), 16);
    } else if (color.length === 4) {
      r = parseInt(color[1]! + color[1]!, 16);
      g = parseInt(color[2]! + color[2]!, 16);
      b = parseInt(color[3]! + color[3]!, 16);
    } else {
      return color;
    }
    return `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
  }
  const m = color.match(/rgba?\(([^)]+)\)/);
  if (m) {
    const parts = m[1]!.split(',').map((s) => s.trim());
    return `rgba(${parts[0]},${parts[1]},${parts[2]},${alpha.toFixed(3)})`;
  }
  return color;
}
