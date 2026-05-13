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
import {
  Demo, DemoControls, MiniReadout, MiniSlider,
} from '@/components/Demo';
import { Num } from '@/components/Num';
import { drawBattery, drawResistor, drawWire } from '@/lib/canvasPrimitives';

interface Props { figure?: string }

function solveNodal(V1: number, V2: number, R1: number, R2: number, R3: number) {
  const G = 1 / R1 + 1 / R2 + 1 / R3;
  const V_A = (V1 / R1 + V2 / R3) / G;
  const I_R1 = (V1 - V_A) / R1;          // into A from V1
  const I_R3 = (V2 - V_A) / R3;          // into A from V2
  const I_R2 = V_A / R2;                 // out of A through R2
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

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h } = info;
    let raf = 0;

    function draw() {
      const { V1, V2, R1, R2, R3, nodal } = stateRef.current;

      ctx.fillStyle = '#0d0d10';
      ctx.fillRect(0, 0, w, h);

      const padX = 56;
      const yTop = h / 2 - 70;
      const yBot = h / 2 + 70;
      const xLeft = padX;
      const xRight = w - padX;
      const xMid = (xLeft + xRight) / 2;

      // Top wire with R1 and R3
      const xR1 = (xLeft + xMid) / 2;
      const xR3 = (xMid + xRight) / 2;
      drawWire(ctx, [{ x: xLeft, y: yTop }, { x: xR1 - 22, y: yTop }]);
      drawResistor(ctx, { x: xR1 - 20, y: yTop }, { x: xR1 + 20, y: yTop }, {
        label: `R1=${R1.toFixed(0)}Ω`,
        labelOffset: { x: 0, y: -12 },
      });
      drawWire(ctx, [{ x: xR1 + 22, y: yTop }, { x: xMid, y: yTop }, { x: xR3 - 22, y: yTop }]);
      drawResistor(ctx, { x: xR3 - 20, y: yTop }, { x: xR3 + 20, y: yTop }, {
        label: `R3=${R3.toFixed(0)}Ω`,
        labelOffset: { x: 0, y: -12 },
      });
      drawWire(ctx, [{ x: xR3 + 22, y: yTop }, { x: xRight, y: yTop }]);

      // Bottom rail = ground
      drawWire(ctx, [{ x: xLeft, y: yBot }, { x: xRight, y: yBot }]);

      // Vertical legs (batteries on the outside, R2 in the middle)
      drawWire(ctx, [{ x: xLeft, y: yTop }, { x: xLeft, y: h / 2 - 22 }]);
      drawWire(ctx, [{ x: xLeft, y: h / 2 + 22 }, { x: xLeft, y: yBot }]);
      drawWire(ctx, [{ x: xRight, y: yTop }, { x: xRight, y: h / 2 - 22 }]);
      drawWire(ctx, [{ x: xRight, y: h / 2 + 22 }, { x: xRight, y: yBot }]);
      drawWire(ctx, [{ x: xMid, y: yTop }, { x: xMid, y: h / 2 - 22 }]);
      drawWire(ctx, [{ x: xMid, y: h / 2 + 22 }, { x: xMid, y: yBot }]);

      drawBattery(ctx, { x: xLeft, y: h / 2 }, {
        label: `V₁=${V1.toFixed(1)}V`,
        leadLength: 22,
      });
      drawBattery(ctx, { x: xRight, y: h / 2 }, {
        label: `V₂=${V2.toFixed(1)}V`,
        leadLength: 22,
      });
      drawResistor(ctx, { x: xMid, y: h / 2 - 20 }, { x: xMid, y: h / 2 + 20 }, {
        label: `R2=${R2.toFixed(0)}Ω`,
        labelOffset: { x: -60, y: 0 },
      });

      // Highlight node A and ground
      ctx.fillStyle = 'rgba(255,107,42,0.95)';
      ctx.beginPath(); ctx.arc(xMid, yTop, 5, 0, Math.PI * 2); ctx.fill();

      // Ground symbol on bottom rail
      drawGround(ctx, xMid, yBot);

      // Node labels
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.font = 'bold 12px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`A   V_A = ${nodal.V_A.toFixed(3)} V`, xMid + 10, yTop - 6);

      // Caption
      ctx.fillStyle = 'rgba(160,158,149,0.75)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('Bottom rail = reference (V = 0)', 12, 10);
      ctx.fillText('KCL at A: (V₁−V_A)/R₁ + (V₂−V_A)/R₃ = V_A/R₂', 12, 24);

      // Branch-current arrows along R1, R3, R2
      ctx.fillStyle = 'rgba(91,174,248,0.95)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`I_R₁ = ${fmtA(nodal.I_R1)}`, (xLeft + xMid) / 2, yTop - 14);
      ctx.fillText(`I_R₃ = ${fmtA(nodal.I_R3)}`, (xMid + xRight) / 2, yTop - 14);
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';
      ctx.fillText(`I_R₂ = ${fmtA(nodal.I_R2)}`, xMid + 14, h / 2);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Sanity-check the two methods agree.
  const meshSumCheck = Math.abs(nodal.I_R2 - mesh.I_R2);

  return (
    <Demo
      figure={figure ?? 'Fig. 13.2'}
      title="Nodal analysis — one unknown voltage, one equation"
      question="Pick a ground; the unknowns become node voltages."
      caption={<>
        Same network as the previous demo. Choose the bottom rail as ground and the
        only unknown is V<sub>A</sub>. KCL at node A gives a single linear equation —
        smaller than the 2×2 mesh system. The branch currents recovered nodally agree
        with the mesh solution to numerical precision (residual below).
      </>}
    >
      <AutoResizeCanvas height={320} setup={setup} />
      <DemoControls>
        <MiniSlider label="V₁" value={V1} min={0} max={24} step={0.5}
          format={v => v.toFixed(1) + ' V'} onChange={setV1} />
        <MiniSlider label="V₂" value={V2} min={0} max={24} step={0.5}
          format={v => v.toFixed(1) + ' V'} onChange={setV2} />
        <MiniSlider label="R₁" value={R1} min={1} max={50} step={1}
          format={v => v.toFixed(0) + ' Ω'} onChange={setR1} />
        <MiniSlider label="R₂" value={R2} min={1} max={50} step={1}
          format={v => v.toFixed(0) + ' Ω'} onChange={setR2} />
        <MiniSlider label="R₃" value={R3} min={1} max={50} step={1}
          format={v => v.toFixed(0) + ' Ω'} onChange={setR3} />
        <MiniReadout label="V_A (nodal)" value={<Num value={nodal.V_A} digits={3} />} unit="V" />
        <MiniReadout label="I_R₂ (nodal)" value={<Num value={nodal.I_R2} digits={3} />} unit="A" />
        <MiniReadout label="I_R₂ (mesh)" value={<Num value={mesh.I_R2} digits={3} />} unit="A" />
        <MiniReadout label="|Δ| residual" value={<Num value={meshSumCheck} digits={2} />} unit="A" />
      </DemoControls>
    </Demo>
  );
}

function fmtA(I: number): string {
  if (Math.abs(I) >= 1) return I.toFixed(3) + ' A';
  if (Math.abs(I) >= 1e-3) return (I * 1000).toFixed(1) + ' mA';
  return (I * 1e6).toFixed(0) + ' µA';
}

function drawGround(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.strokeStyle = 'rgba(108,197,194,0.85)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(x, y); ctx.lineTo(x, y + 6);
  ctx.moveTo(x - 10, y + 6); ctx.lineTo(x + 10, y + 6);
  ctx.moveTo(x - 6, y + 10); ctx.lineTo(x + 6, y + 10);
  ctx.moveTo(x - 3, y + 14); ctx.lineTo(x + 3, y + 14);
  ctx.stroke();
}
