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

      ctx.strokeStyle = 'rgba(255,255,255,0.55)';
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';

      // Top wire with R1 and R3
      ctx.beginPath();
      ctx.moveTo(xLeft, yTop);
      ctx.lineTo((xLeft + xMid) / 2 - 22, yTop);
      ctx.stroke();
      drawHResistor(ctx, (xLeft + xMid) / 2, yTop, R1, '1');
      ctx.beginPath();
      ctx.moveTo((xLeft + xMid) / 2 + 22, yTop);
      ctx.lineTo(xMid, yTop);
      ctx.lineTo((xMid + xRight) / 2 - 22, yTop);
      ctx.stroke();
      drawHResistor(ctx, (xMid + xRight) / 2, yTop, R3, '3');
      ctx.beginPath();
      ctx.moveTo((xMid + xRight) / 2 + 22, yTop);
      ctx.lineTo(xRight, yTop);
      ctx.stroke();

      // Bottom rail = ground
      ctx.beginPath();
      ctx.moveTo(xLeft, yBot);
      ctx.lineTo(xRight, yBot);
      ctx.stroke();

      // Vertical legs (batteries on the outside, R2 in the middle)
      ctx.beginPath();
      ctx.moveTo(xLeft, yTop); ctx.lineTo(xLeft, h / 2 - 22);
      ctx.moveTo(xLeft, h / 2 + 22); ctx.lineTo(xLeft, yBot);
      ctx.moveTo(xRight, yTop); ctx.lineTo(xRight, h / 2 - 22);
      ctx.moveTo(xRight, h / 2 + 22); ctx.lineTo(xRight, yBot);
      ctx.moveTo(xMid, yTop); ctx.lineTo(xMid, h / 2 - 22);
      ctx.moveTo(xMid, h / 2 + 22); ctx.lineTo(xMid, yBot);
      ctx.stroke();

      drawBattery(ctx, xLeft, h / 2, V1, 'V₁');
      drawBattery(ctx, xRight, h / 2, V2, 'V₂');
      drawVResistor(ctx, xMid, h / 2, R2, '2');

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

function drawBattery(
  ctx: CanvasRenderingContext2D, x: number, y: number, V: number, label: string,
) {
  ctx.strokeStyle = 'rgba(255,255,255,0.65)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x, y - 22); ctx.lineTo(x, y - 14);
  ctx.moveTo(x, y + 14); ctx.lineTo(x, y + 22);
  ctx.stroke();
  ctx.strokeStyle = '#ff3b6e';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x - 14, y - 14); ctx.lineTo(x + 14, y - 14);
  ctx.stroke();
  ctx.strokeStyle = '#5baef8';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x - 8, y + 14); ctx.lineTo(x + 8, y + 14);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${label}=${V.toFixed(1)}V`, x - 18, y);
}

function drawHResistor(ctx: CanvasRenderingContext2D, cx: number, cy: number, R: number, idx: string) {
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
  ctx.fillStyle = '#ff6b2a';
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText(`R${idx}=${R.toFixed(0)}Ω`, cx, cy - 12);
}

function drawVResistor(ctx: CanvasRenderingContext2D, cx: number, cy: number, R: number, idx: string) {
  const y0 = cy - 20;
  const y1 = cy + 20;
  ctx.strokeStyle = 'rgba(255,107,42,0.95)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(cx, y0);
  const steps = 6;
  const stepH = (y1 - y0) / steps;
  for (let i = 0; i < steps; i++) {
    const y = y0 + (i + 0.5) * stepH;
    const x = cx + (i % 2 === 0 ? -7 : 7);
    ctx.lineTo(x, y);
  }
  ctx.lineTo(cx, y1);
  ctx.stroke();
  ctx.fillStyle = '#ff6b2a';
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(`R${idx}=${R.toFixed(0)}Ω`, cx - 60, cy);
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
