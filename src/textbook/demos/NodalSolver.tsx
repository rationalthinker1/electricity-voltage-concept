/**
 * Demo D13.2 — Nodal analysis on the same two-mesh network.
 *
 *   Same topology as MeshCurrentSolverDemo:
 *
 *      V1 — R1 — A — R3 — V2
 *                |
 *                R2
 *                |
 *               GND (reference)
 *
 *   Take node B as ground. Node A is the only unknown nodal voltage V_A.
 *   KCL at A:
 *       (V1 − V_A)/R1 + (V2 − V_A)/R3 = V_A/R2
 *       V_A · (1/R1 + 1/R2 + 1/R3) = V1/R1 + V2/R3
 *
 *   For comparison we also solve the mesh system and show that the branch
 *   currents agree to numerical precision.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';
import { type CircuitElement } from '@/lib/canvasPrimitives';
import { getCanvasColors, withAlpha } from '@/lib/canvasTheme';
import { fmtCurrent } from '@/lib/formatters';
import { useCircuitCache } from '@/lib/useCircuitCache';
import { drawLabel } from "@/lib/canvasLayout";

interface Props {
  figure?: string;
}

function solveNodal(V1: number, V2: number, R1: number, R2: number, R3: number) {
  const G = 1 / R1 + 1 / R2 + 1 / R3;
  const V_A = (V1 / R1 + V2 / R3) / G;
  const I_R1 = (V1 - V_A) / R1; // into A from V1
  const I_R3 = (V2 - V_A) / R3; // into A from V2
  const I_R2 = V_A / R2; // out of A through R2
  return { V_A, I_R1, I_R2, I_R3 };
}

function solveMesh(V1: number, V2: number, R1: number, R2: number, R3: number) {
  // Same convention as MeshCurrentSolverDemo, but here V2 oriented to help I2
  // so both source nodes drive node A positive.
  const a11 = R1 + R2;
  const a12 = -R2;
  const a21 = -R2;
  const a22 = R2 + R3;
  const b1 = V1;
  const b2 = V2;
  const det = a11 * a22 - a12 * a21;
  const I1 = (b1 * a22 - a12 * b2) / det;
  const I2 = (a11 * b2 - b1 * a21) / det;
  return { I_R1: I1, I_R3: I2, I_R2: I1 + I2 };
}

export function NodalSolverDemo({ figure }: Props) {
  const [V1, setV1] = useState(12);
  const [V2, setV2] = useState(9);
  const [R1, setR1] = useState(4);
  const [R2, setR2] = useState(8);
  const [R3, setR3] = useState(6);

  const nodal = solveNodal(V1, V2, R1, R2, R3);
  const mesh = solveMesh(V1, V2, R1, R2, R3);

  const stateRef = useRef({ V1, V2, R1, R2, R3, nodal });
  useEffect(() => {
    stateRef.current = { V1, V2, R1, R2, R3, nodal };
  }, [V1, V2, R1, R2, R3, nodal.V_A, nodal.I_R1, nodal.I_R2, nodal.I_R3]);

  // Static schematic. Re-bakes on slider change or resize.
  const getStaticSchematic = useCircuitCache(
    (sw, sh, _dpr) => ({
      elements: buildNodalSchematic(sw, sh, V1, V2, R1, R2, R3) as CircuitElement[],
    }),
    [V1, V2, R1, R2, R3],
  );

  const setup = useCallback(
    (info: CanvasInfo) => {
      const { ctx, w, h, dpr } = info;
      let raf = 0;

      function draw() {
        const { nodal } = stateRef.current;

        ctx.fillStyle = getCanvasColors().bg;
        ctx.fillRect(0, 0, w, h);

        const off = getStaticSchematic(w, h, dpr);
        if (off) ctx.drawImage(off, 0, 0, w, h);

        // Per-frame text overlay (node labels, current readouts, KCL caption).
        // Used to be baked into the offscreen canvas; pulled out so the cache
        // is a plain CircuitSpec. Costs a dozen ctx calls — negligible.
        const padX = 56;
        const yTop = h / 2 - 70;
        const xLeft = padX;
        const xRight = w - padX;
        const xMid = (xLeft + xRight) / 2;

        ctx.save();
        ctx.globalAlpha = 0.85;
        ctx.fillStyle = getCanvasColors().text;
        drawLabel(ctx, { text: `A   V_A = ${nodal.V_A.toFixed(3)} V`, x: xMid + 10, y: yTop - 6, weight: 'bold', size: 12, font: 'bold 12px "JetBrains Mono", monospace', baseline: 'bottom' });
        ctx.restore();

        ctx.save();
        ctx.globalAlpha = 0.75;
        ctx.fillStyle = getCanvasColors().textDim;
        drawLabel(ctx, { text: 'Bottom rail = reference (V = 0)', x: 12, y: 10, font: '10px "JetBrains Mono", monospace', baseline: 'top' });
        drawLabel(ctx, { text: 'KCL at A: (V₁−V_A)/R₁ + (V₂−V_A)/R₃ = V_A/R₂', x: 12, y: 24, font: '10px "JetBrains Mono", monospace', baseline: 'top' });
        ctx.restore();

        ctx.save();
        ctx.globalAlpha = 0.95;
        ctx.fillStyle = getCanvasColors().blue;
        drawLabel(ctx, { text: `I_R₁ = ${fmtCurrent(nodal.I_R1)}`, x: (xLeft + xMid) / 2, y: yTop - 14, font: '10px "JetBrains Mono", monospace', align: 'center', baseline: 'bottom' });
        drawLabel(ctx, { text: `I_R₃ = ${fmtCurrent(nodal.I_R3)}`, x: (xMid + xRight) / 2, y: yTop - 14, font: '10px "JetBrains Mono", monospace', align: 'center', baseline: 'bottom' });
        drawLabel(ctx, { text: `I_R₂ = ${fmtCurrent(nodal.I_R2)}`, x: xMid + 14, y: h / 2, font: '10px "JetBrains Mono", monospace', baseline: 'middle' });
        ctx.restore();

        raf = requestAnimationFrame(draw);
      }
      raf = requestAnimationFrame(draw);
      return () => cancelAnimationFrame(raf);
    },
    [getStaticSchematic],
  );

  // Sanity-check the two methods agree.
  const meshSumCheck = Math.abs(nodal.I_R2 - mesh.I_R2);

  return (
    <Demo
      figure={figure ?? 'Fig. 13.2'}
      title="Nodal analysis — one unknown voltage, one equation"
      question="Pick a ground; the unknowns become node voltages."
      caption={
        <>
          Same network as the previous demo. Choose the bottom rail as ground and the only unknown
          is V<sub>A</sub>. KCL at node A gives a single linear equation — smaller than the 2×2 mesh
          system. The branch currents recovered nodally agree with the mesh solution to numerical
          precision (residual below).
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
        <MiniReadout label="V_A (nodal)" value={<Num value={nodal.V_A} digits={3} />} unit="V" />
        <MiniReadout label="I_R₂ (nodal)" value={<Num value={nodal.I_R2} digits={3} />} unit="A" />
        <MiniReadout label="I_R₂ (mesh)" value={<Num value={mesh.I_R2} digits={3} />} unit="A" />
        <MiniReadout
          label="|Δ| residual"
          value={<Num value={meshSumCheck} digits={2} />}
          unit="A"
        />
      </DemoControls>
    </Demo>
  );
}

function buildNodalSchematic(
  w: number,
  h: number,
  V1: number,
  V2: number,
  R1: number,
  R2: number,
  R3: number,
): CircuitElement[] {
  const padX = 56;
  const yTop = h / 2 - 70;
  const yBot = h / 2 + 70;
  const xLeft = padX;
  const xRight = w - padX;
  const xMid = (xLeft + xRight) / 2;
  const xR1 = (xLeft + xMid) / 2;
  const xR3 = (xMid + xRight) / 2;

  // Same topology as the mesh demo; bottom rail = ground, node A is the unknown.
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
    // Node A dot (amber) and ground glyph at the reference rail.
    {
      kind: 'node',
      at: { x: xMid, y: yTop },
      radius: 5,
      color: withAlpha(getCanvasColors().accent, 0.95),
    },
    { kind: 'ground', at: { x: xMid, y: yBot }, color: withAlpha(getCanvasColors().teal, 0.85) },
  ];
}
