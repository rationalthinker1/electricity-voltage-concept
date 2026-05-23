/**
 * Demo D13.1 — Mesh-current analysis on a two-loop network
 *
 *   Two-mesh network:
 *
 *       V1 — R1 — A — R3 — +
 *                 |        |
 *                 R2       V2
 *                 |        |
 *       +---------B--------+
 *
 *   Mesh 1 (left loop, clockwise current I1):
 *       V1 = I1·R1 + (I1 − I2)·R2
 *   Mesh 2 (right loop, clockwise current I2):
 *       0  = (I2 − I1)·R2 + I2·R3 + V2     (V2 oriented to oppose I2)
 *
 *   Rearranged:
 *       (R1 + R2)·I1 −     R2·I2 = V1
 *           −R2·I1 + (R2 + R3)·I2 = −V2
 *
 *   2×2 linear system; solve by Cramer's rule. Branch currents follow
 *   from I1, I2:
 *       I_R1 = I1,   I_R3 = I2,   I_R2 = I1 − I2
 */
import { useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, EquationStrip, MiniReadout, MiniSlider } from '@/components/Demo';
import { InlineMath } from '@/components/Formula';
import { Num } from '@/components/Num';
import { drawLabel } from '@/lib/canvasLayout';
import { type CircuitElement } from '@/lib/canvasPrimitives';
import { getCanvasColors, withAlpha } from '@/lib/canvasTheme';
import { fmtCurrent } from '@/lib/formatters';
import { useCircuitCache } from '@/lib/useCircuitCache';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

interface Props {
  figure: string;
}

function solveMesh(V1: number, V2: number, R1: number, R2: number, R3: number) {
  const a11 = R1 + R2;
  const a12 = -R2;
  const a21 = -R2;
  const a22 = R2 + R3;
  const b1 = V1;
  const b2 = -V2;
  const det = a11 * a22 - a12 * a21;
  const I1 = (b1 * a22 - a12 * b2) / det;
  const I2 = (a11 * b2 - b1 * a21) / det;
  return {
    I1,
    I2,
    I_R1: I1,
    I_R3: I2,
    I_R2: I1 - I2,
  };
}

export function MeshCurrentSolverDemo({ figure }: Props) {
  const [V1, setV1] = useState(12);
  const [V2, setV2] = useState(6);
  const [R1, setR1] = useState(4);
  const [R2, setR2] = useState(8);
  const [R3, setR3] = useState(6);

  const sol = solveMesh(V1, V2, R1, R2, R3);
  const stateRef = useSimState({ V1, V2, R1, R2, R3, sol });

  const getStaticSchematic = useCircuitCache(
    (sw, sh, _dpr) => ({
      elements: buildMeshSchematic(sw, sh, V1, V2, R1, R2, R3) as CircuitElement[],
    }),
    [V1, V2, R1, R2, R3],
  );

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, dpr }, state, _dt, simTime) => {
      const { sol } = state;
      const t = simTime;

      ctx.fillStyle = getCanvasColors().bg;
      ctx.fillRect(0, 0, w, h);

      const padX = 60;
      const yTop = h / 2 - 70;
      const yBot = h / 2 + 70;
      const xLeft = padX;
      const xRight = w - padX;
      const xMid = (xLeft + xRight) / 2;

      const off = getStaticSchematic(w, h, dpr);
      if (off) ctx.drawImage(off, 0, 0, w, h);

      // Per-frame text overlay: node labels, R₂ readout, caption. Cheap.
      ctx.save();
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = getCanvasColors().text;
      drawLabel(ctx, { text: 'A', x: xMid + 6, y: yTop - 4, weight: 'bold', size: 11, font: 'bold 11px "JetBrains Mono", monospace', baseline: 'bottom' });
      drawLabel(ctx, { text: 'B', x: xMid + 6, y: yBot + 6, weight: 'bold', size: 11, font: 'bold 11px "JetBrains Mono", monospace', baseline: 'top' });
      ctx.restore();

      ctx.save();
      ctx.globalAlpha = 0.95;
      ctx.fillStyle = getCanvasColors().blue;
      drawLabel(ctx, { text: `I_R₂ = I₁ − I₂ = ${fmtCurrent(sol.I_R2)}`, x: xMid + 14, y: h / 2, font: '10px "JetBrains Mono", monospace', baseline: 'middle' });
      ctx.restore();

      ctx.save();
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = getCanvasColors().textDim;
      drawLabel(ctx, { text: 'Two clockwise mesh currents I₁, I₂', x: 12, y: 10, font: '10px "JetBrains Mono", monospace', baseline: 'top' });
      ctx.restore();

      // Per-frame overlay: rotating arrowhead around each mesh-loop ellipse.
      drawMeshLoop(
        ctx,
        xLeft + 30,
        yTop + 18,
        xMid - 30,
        yBot - 18,
        'I₁',
        withAlpha(getCanvasColors().accent, 0.85),
        sol.I1,
        t,
      );
      drawMeshLoop(
        ctx,
        xMid + 30,
        yTop + 18,
        xRight - 30,
        yBot - 18,
        'I₂',
        withAlpha(getCanvasColors().teal, 0.85),
        sol.I2,
        t,
      );
    },
    [getStaticSchematic],
  );

  return (
    <Demo
      figure={figure}
      title="Mesh-current analysis — two loops, one matrix"
      question="Pick mesh currents; the linear system writes itself."
      caption={
        <>
          Two clockwise mesh currents I₁ and I₂ collapse the network to a 2×2 linear system. The
          middle branch R₂ is shared between the loops; its branch current is I₁ − I₂. For an N-mesh
          network the system is N×N — far smaller than the branch count.
        </>
      }
    >
      <AutoResizeCanvas height={320} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="V₁"
          value={V1}
          min={0}
          max={24}
          step={0.5}
          format={(v) => v.toFixed(1) + ' V'}
          onChange={setV1}
        />
        <MiniSlider
          label="V₂"
          value={V2}
          min={0}
          max={24}
          step={0.5}
          format={(v) => v.toFixed(1) + ' V'}
          onChange={setV2}
        />
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
          max={50}
          step={1}
          format={(v) => v.toFixed(0) + ' Ω'}
          onChange={setR2}
        />
        <MiniSlider
          label="R₃"
          value={R3}
          min={1}
          max={50}
          step={1}
          format={(v) => v.toFixed(0) + ' Ω'}
          onChange={setR3}
        />
        <MiniReadout label="Mesh I₁" value={<Num value={sol.I1} digits={3} />} unit="A" />
        <MiniReadout label="Mesh I₂" value={<Num value={sol.I2} digits={3} />} unit="A" />
        <MiniReadout label="I through R₂" value={<Num value={sol.I_R2} digits={3} />} unit="A" />
      </DemoControls>
      <EquationStrip
        leftLabel="Mesh equations"
        left={
          <InlineMath
            tex={`(R_1+R_2)I_1 - R_2 I_2 = V_1 \\;\\Rightarrow\\; I_1 = ${sol.I1.toFixed(3)}\\,\\text{A}`}
          />
        }
        rightLabel="Shared branch"
        right={
          <InlineMath
            tex={`I_{R_2} = I_1 - I_2 = ${sol.I1.toFixed(3)} - ${sol.I2.toFixed(3)} = ${sol.I_R2.toFixed(3)}\\,\\text{A}`}
          />
        }
      />
    </Demo>
  );
}

function buildMeshSchematic(
  w: number,
  h: number,
  V1: number,
  V2: number,
  R1: number,
  R2: number,
  R3: number,
): CircuitElement[] {
  const padX = 60;
  const yTop = h / 2 - 70;
  const yBot = h / 2 + 70;
  const xLeft = padX;
  const xRight = w - padX;
  const xMid = (xLeft + xRight) / 2;
  const xR1 = (xLeft + xMid) / 2;
  const xR3 = (xMid + xRight) / 2;

  // Two-mesh network: V1 left, V2 right, R2 the shared middle branch.
  return [
    {
      kind: 'wire',
      points: [
        { x: xLeft, y: yTop },
        { x: xR1 - 22, y: yTop },
      ],
    },
    {
      kind: 'resistor',
      from: { x: xR1 - 20, y: yTop },
      to: { x: xR1 + 20, y: yTop },
      label: `R1=${R1.toFixed(0)}Ω`,
      labelOffset: { x: 0, y: -12 },
    },
    {
      kind: 'wire',
      points: [
        { x: xR1 + 22, y: yTop },
        { x: xMid, y: yTop },
      ],
    },
    {
      kind: 'wire',
      points: [
        { x: xMid, y: yTop },
        { x: xR3 - 22, y: yTop },
      ],
    },
    {
      kind: 'resistor',
      from: { x: xR3 - 20, y: yTop },
      to: { x: xR3 + 20, y: yTop },
      label: `R3=${R3.toFixed(0)}Ω`,
      labelOffset: { x: 0, y: -12 },
    },
    {
      kind: 'wire',
      points: [
        { x: xR3 + 22, y: yTop },
        { x: xRight, y: yTop },
      ],
    },
    {
      kind: 'wire',
      points: [
        { x: xLeft, y: yBot },
        { x: xRight, y: yBot },
      ],
    },
    {
      kind: 'wire',
      points: [
        { x: xLeft, y: yTop },
        { x: xLeft, y: h / 2 - 22 },
      ],
    },
    {
      kind: 'wire',
      points: [
        { x: xLeft, y: h / 2 + 22 },
        { x: xLeft, y: yBot },
      ],
    },
    {
      kind: 'wire',
      points: [
        { x: xRight, y: yTop },
        { x: xRight, y: h / 2 - 22 },
      ],
    },
    {
      kind: 'wire',
      points: [
        { x: xRight, y: h / 2 + 22 },
        { x: xRight, y: yBot },
      ],
    },
    {
      kind: 'wire',
      points: [
        { x: xMid, y: yTop },
        { x: xMid, y: h / 2 - 22 },
      ],
    },
    {
      kind: 'wire',
      points: [
        { x: xMid, y: h / 2 + 22 },
        { x: xMid, y: yBot },
      ],
    },
    { kind: 'battery', at: { x: xLeft, y: h / 2 }, label: `V₁=${V1.toFixed(1)}V`, leadLength: 22 },
    { kind: 'battery', at: { x: xRight, y: h / 2 }, label: `V₂=${V2.toFixed(1)}V`, leadLength: 22 },
    {
      kind: 'resistor',
      from: { x: xMid, y: h / 2 - 20 },
      to: { x: xMid, y: h / 2 + 20 },
      label: `R2=${R2.toFixed(0)}Ω`,
      labelOffset: { x: -60, y: 0 },
    },
  ];
}

function drawMeshLoop(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  label: string,
  color: string,
  I: number,
  t: number,
) {
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  const rx = (x1 - x0) / 2 - 4;
  const ry = (y1 - y0) / 2 - 4;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.2;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Arrow rotating clockwise around the ellipse
  const speed = Math.min(2.0, Math.max(0.4, Math.abs(I) * 0.5));
  const dir = I >= 0 ? 1 : -1;
  const theta = dir * t * speed;
  const ax = cx + rx * Math.cos(theta);
  const ay = cy + ry * Math.sin(theta);
  const tx = -rx * Math.sin(theta) * dir;
  const ty = ry * Math.cos(theta) * dir;
  const mag = Math.hypot(tx, ty) || 1;
  const ux = tx / mag,
    uy = ty / mag;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(ax + ux * 8, ay + uy * 8);
  ctx.lineTo(ax - ux * 4 + uy * 4, ay - uy * 4 - ux * 4);
  ctx.lineTo(ax - ux * 4 - uy * 4, ay - uy * 4 + ux * 4);
  ctx.closePath();
  ctx.fill();

  drawLabel(ctx, {
    x: cx,
    y: cy,
    text: `${label} = ${fmtCurrent(I)}`,
    color: color,
    size: 12,
    align: 'center',
    baseline: 'middle',
    weight: 'bold',
  });
  ctx.restore();
}
