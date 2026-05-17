/**
 * Demo D3.5b — Series + parallel mixed
 *
 * R1 in series with (R2 ∥ R3). Three sliders, one fixed 12 V source.
 * Node-voltage probes show how the potential drops at each step:
 *   V_in  → V_FIXED  (just after + terminal)
 *   V_mid → V_FIXED − I·R1     (between R1 and the parallel block)
 *   V_out → 0 V                (after the parallel block, back to −)
 * The trunk current splits at the parallel block: I₂ = V_mid / R₂ and
 * I₃ = V_mid / R₃, with I₂ + I₃ = I_tot. Dot speed in each branch is
 * proportional to that branch's current, so a thin-resistance branch
 * visibly carries more.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';
import { renderCircuitToCanvas, type CircuitElement } from '@/lib/canvasPrimitives';
import { getCanvasColors } from '@/lib/canvasTheme';

interface Props {
  figure?: string;
}

interface StaticCacheEntry {
  key: string;
  canvas: HTMLCanvasElement;
}

const V_FIXED = 12; // V — source voltage
// Reference current at the default config so dots run at 1× at startup.
// Defaults: R1 = 8, R2 = 20, R3 = 30. R_par = (20·30)/50 = 12. R_tot = 20.
// I_tot = 12/20 = 0.6 A.
const I_REF = 0.6;

export function SeriesParallelMixDemo({ figure }: Props) {
  const [R1, setR1] = useState(8);
  const [R2, setR2] = useState(20);
  const [R3, setR3] = useState(30);

  const Rpar = (R2 * R3) / (R2 + R3);
  const Rtot = R1 + Rpar;
  const Itot = V_FIXED / Rtot;
  const Vmid = V_FIXED - Itot * R1; // potential at the node between R1 and the parallel block
  const I2 = Vmid / R2;
  const I3 = Vmid / R3;

  const stateRef = useRef({ R1, R2, R3, t: 0 });
  useEffect(() => {
    stateRef.current = { ...stateRef.current, R1, R2, R3 };
  }, [R1, R2, R3]);

  const cacheRef = useRef<StaticCacheEntry | null>(null);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, dpr } = info;
    let raf = 0;

    function draw() {
      const st = stateRef.current;
      st.t += 0.016;
      const { R1, R2, R3, t } = st;

      ctx.fillStyle = getCanvasColors().bg;
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const padX = 60;
      const yTop = cy - 50;
      const yBot = cy + 50;
      const batX = padX;
      const outX = w - padX;

      // Live electrical values.
      const Rpar = (R2 * R3) / (R2 + R3);
      const Rtot = R1 + Rpar;
      const Itot = V_FIXED / Rtot;
      const Vmid = V_FIXED - Itot * R1;
      const I2 = Vmid / R2;
      const I3 = Vmid / R3;

      // Node x positions for the schematic.
      const xR1 = padX + (outX - padX) * 0.2;
      const nodeA_x = padX + (outX - padX) * 0.42;
      const nodeB_x = padX + (outX - padX) * 0.82;
      const xR2 = (nodeA_x + nodeB_x) / 2;
      const xR3 = (nodeA_x + nodeB_x) / 2;
      const branchY = yTop + 38; // lower branch with R3

      // Static schematic — cached by canvas size, DPR, slider state, AND theme:
      // the wire colour swaps when the user toggles light/dark.
      const theme = document.documentElement.getAttribute('data-theme') ?? 'dark';
      const cacheKey = `${w}x${h}@${dpr}|R1:${R1}|R2:${R2}|R3:${R3}|t:${theme}`;
      if (cacheRef.current?.key !== cacheKey) {
        cacheRef.current = {
          key: cacheKey,
          canvas: buildSchematic(w, h, R1, R2, R3, dpr, {
            batX,
            outX,
            yTop,
            yBot,
            cy,
            xR1,
            nodeA_x,
            nodeB_x,
            xR2,
            xR3,
            branchY,
          }),
        };
      }
      ctx.drawImage(cacheRef.current.canvas, 0, 0, w, h);

      // Battery '−' overlay.
      ctx.fillStyle = getCanvasColors().blue;
      ctx.font = 'bold 12px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText('−', batX - 18, cy + 18);

      // Electron flow — trunk speed scales with I_tot, each branch with its own I.
      const trunkScale = Itot / I_REF;
      const branch2Scale = I2 / I_REF;
      const branch3Scale = I3 / I_REF;

      // Trunk: battery + → through R1 → up to nodeA.
      drawCurrentDotsPath(
        ctx,
        t,
        [
          { x: batX, y: yTop },
          { x: nodeA_x, y: yTop },
        ],
        trunkScale,
      );
      // Trunk: from nodeB → outX → down → back to battery −.
      drawCurrentDotsPath(
        ctx,
        t,
        [
          { x: nodeB_x, y: yTop },
          { x: outX, y: yTop },
          { x: outX, y: yBot },
          { x: batX, y: yBot },
        ],
        trunkScale,
      );
      // Top branch (R2) on yTop.
      drawCurrentDotsPath(
        ctx,
        t,
        [
          { x: nodeA_x, y: yTop },
          { x: nodeB_x, y: yTop },
        ],
        branch2Scale,
      );
      // Lower branch (R3): nodeA → drop to branchY → R3 → back up to nodeB.
      drawCurrentDotsPath(
        ctx,
        t,
        [
          { x: nodeA_x, y: yTop },
          { x: nodeA_x, y: branchY },
          { x: nodeB_x, y: branchY },
          { x: nodeB_x, y: yTop },
        ],
        branch3Scale,
      );

      // Voltage probes at the three key nodes.
      drawVoltageProbe(ctx, (batX + (xR1 - 22)) / 2, yTop - 16, V_FIXED);
      drawVoltageProbe(ctx, (xR1 + 22 + nodeA_x) / 2, yTop - 16, Vmid);
      drawVoltageProbe(ctx, (nodeB_x + outX) / 2, yTop - 16, 0);
      drawVoltageProbe(ctx, (batX + outX) / 2, yBot + 18, 0);

      // Branch current labels near the resistors.
      const colors = getCanvasColors();
      ctx.save();
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = withAlpha(colors.blue, 0.95);
      ctx.fillText(`I₂ = ${I2.toFixed(2)} A`, xR2, yTop + 14);
      ctx.fillText(`I₃ = ${I3.toFixed(2)} A`, xR3, branchY + 14);
      ctx.fillStyle = withAlpha(colors.accent, 0.85);
      ctx.fillText(`I = ${Itot.toFixed(2)} A`, (batX + nodeA_x) / 2, yTop + 14);
      ctx.restore();

      // Helper text at the bottom of the canvas.
      ctx.fillStyle = colors.textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('R₁ in series with (R₂ ∥ R₃) — Kirchhoff in action', cx, h - 14);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 3.5b'}
      title="A mixed network — R₁ then (R₂ ∥ R₃)"
      question="Where does the 12 V go, and how does the current split?"
      caption={
        <>
          A first taste of network analysis. R₁ sees the full trunk current; the parallel pair after
          it splits that current inversely with resistance. Drag the sliders and watch the voltage
          probes track: the potential drops from <strong>12 V</strong> at the source to{' '}
          <strong>V_mid</strong> after R₁, then to <strong>0 V</strong> back at the negative
          terminal. The faster-flowing branch is always the one with the lower resistance.
        </>
      }
      deeperLab={{ slug: 'resistance', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={280} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="R₁"
          value={R1}
          min={1}
          max={50}
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
        <MiniSlider
          label="R₃"
          value={R3}
          min={1}
          max={100}
          step={1}
          format={(v) => v.toFixed(0) + ' Ω'}
          onChange={setR3}
        />
        <MiniReadout label="R_tot" value={<Num value={Rtot} />} unit="Ω" />
        <MiniReadout label="I_tot = 12 V / R" value={<Num value={Itot} />} unit="A" />
        <MiniReadout label="V_mid" value={<Num value={Vmid} />} unit="V" />
        <MiniReadout label="I₂ = V_mid / R₂" value={<Num value={I2} />} unit="A" />
        <MiniReadout label="I₃ = V_mid / R₃" value={<Num value={I3} />} unit="A" />
      </DemoControls>
    </Demo>
  );
}

/* ─── Schematic ────────────────────────────────────────────────────────── */

interface Layout {
  batX: number;
  outX: number;
  yTop: number;
  yBot: number;
  cy: number;
  xR1: number;
  nodeA_x: number;
  nodeB_x: number;
  xR2: number;
  xR3: number;
  branchY: number;
}

function buildSchematic(
  w: number,
  h: number,
  R1: number,
  R2: number,
  R3: number,
  dpr: number,
  L: Layout,
): HTMLCanvasElement {
  const elements: CircuitElement[] = [
    {
      kind: 'battery',
      at: { x: L.batX, y: L.cy },
      label: `+   ${V_FIXED} V`,
      labelOffset: { x: -22, y: -10 },
      leadLength: 50,
    },
    // Top wire from battery + to R1.
    {
      kind: 'wire',
      points: [
        { x: L.batX, y: L.yTop },
        { x: L.xR1 - 22, y: L.yTop },
      ],
    },
    {
      kind: 'resistor',
      from: { x: L.xR1 - 20, y: L.yTop },
      to: { x: L.xR1 + 20, y: L.yTop },
      label: `R1 = ${R1.toFixed(0)}Ω`,
      labelOffset: { x: 0, y: -16 },
    },
    // After R1 → nodeA.
    {
      kind: 'wire',
      points: [
        { x: L.xR1 + 22, y: L.yTop },
        { x: L.nodeA_x, y: L.yTop },
      ],
    },
    // Top branch: nodeA → R2 → nodeB.
    {
      kind: 'wire',
      points: [
        { x: L.nodeA_x, y: L.yTop },
        { x: L.xR2 - 22, y: L.yTop },
      ],
    },
    {
      kind: 'resistor',
      from: { x: L.xR2 - 20, y: L.yTop },
      to: { x: L.xR2 + 20, y: L.yTop },
      label: `R2 = ${R2.toFixed(0)}Ω`,
      labelOffset: { x: 0, y: -16 },
    },
    {
      kind: 'wire',
      points: [
        { x: L.xR2 + 22, y: L.yTop },
        { x: L.nodeB_x, y: L.yTop },
      ],
    },
    // Lower branch posts: nodeA drops to branchY, nodeB drops to branchY.
    {
      kind: 'wire',
      points: [
        { x: L.nodeA_x, y: L.yTop },
        { x: L.nodeA_x, y: L.branchY },
        { x: L.xR3 - 22, y: L.branchY },
      ],
    },
    {
      kind: 'resistor',
      from: { x: L.xR3 - 20, y: L.branchY },
      to: { x: L.xR3 + 20, y: L.branchY },
      label: `R3 = ${R3.toFixed(0)}Ω`,
      labelOffset: { x: 0, y: 16 },
    },
    {
      kind: 'wire',
      points: [
        { x: L.xR3 + 22, y: L.branchY },
        { x: L.nodeB_x, y: L.branchY },
        { x: L.nodeB_x, y: L.yTop },
      ],
    },
    // After nodeB → outX → down → back to battery −.
    {
      kind: 'wire',
      points: [
        { x: L.nodeB_x, y: L.yTop },
        { x: L.outX, y: L.yTop },
        { x: L.outX, y: L.yBot },
        { x: L.batX, y: L.yBot },
      ],
    },
    // Junction dots so the splits read clearly.
    { kind: 'node', at: { x: L.nodeA_x, y: L.yTop } },
    { kind: 'node', at: { x: L.nodeB_x, y: L.yTop } },
  ];
  return renderCircuitToCanvas(
    { elements, defaultWireColor: withAlpha(getCanvasColors().text, 0.65) },
    w,
    h,
    dpr,
  );
}

/* ─── Animated dots ────────────────────────────────────────────────────── */

function drawCurrentDotsPath(
  ctx: CanvasRenderingContext2D,
  t: number,
  pts: Array<{ x: number; y: number }>,
  Iscale: number,
) {
  const segs: Array<{ x0: number; y0: number; x1: number; y1: number; len: number }> = [];
  let total = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i]!;
    const b = pts[i + 1]!;
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
  ctx.fillStyle = withAlpha(getCanvasColors().blue, 0.5 + 0.4 * intensity);
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

/* ─── Voltage probe ────────────────────────────────────────────────────── */

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

/* ─── colour helper ────────────────────────────────────────────────────── */

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
