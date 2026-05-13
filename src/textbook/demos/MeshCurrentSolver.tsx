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
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import {
  Demo, DemoControls, MiniReadout, MiniSlider,
} from '@/components/Demo';
import { Num } from '@/components/Num';

interface Props { figure?: string }

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
    I1, I2,
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
  const stateRef = useRef({ V1, V2, R1, R2, R3, sol, t: 0 });
  useEffect(() => {
    stateRef.current = {
      ...stateRef.current,
      V1, V2, R1, R2, R3, sol,
    };
  }, [V1, V2, R1, R2, R3, sol.I1, sol.I2, sol.I_R1, sol.I_R2, sol.I_R3]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h } = info;
    let raf = 0;

    function draw() {
      const st = stateRef.current;
      st.t += 0.016;
      const { V1, V2, R1, R2, R3, sol, t } = st;

      ctx.fillStyle = '#0d0d10';
      ctx.fillRect(0, 0, w, h);

      const padX = 60;
      const yTop = h / 2 - 70;
      const yBot = h / 2 + 70;
      const xLeft = padX;
      const xRight = w - padX;
      const xMid = (xLeft + xRight) / 2;

      // Wires
      ctx.strokeStyle = 'rgba(255,255,255,0.55)';
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';

      // Left battery V1 (vertical) at xLeft
      // Top wire xLeft -> R1 -> xMid (A)
      ctx.beginPath();
      ctx.moveTo(xLeft, yTop);
      ctx.lineTo((xLeft + xMid) / 2 - 22, yTop);
      ctx.stroke();
      drawHResistor(ctx, (xLeft + xMid) / 2, yTop, R1, '1');
      ctx.beginPath();
      ctx.moveTo((xLeft + xMid) / 2 + 22, yTop);
      ctx.lineTo(xMid, yTop);
      ctx.stroke();

      // Top wire xMid -> R3 -> xRight
      ctx.beginPath();
      ctx.moveTo(xMid, yTop);
      ctx.lineTo((xMid + xRight) / 2 - 22, yTop);
      ctx.stroke();
      drawHResistor(ctx, (xMid + xRight) / 2, yTop, R3, '3');
      ctx.beginPath();
      ctx.moveTo((xMid + xRight) / 2 + 22, yTop);
      ctx.lineTo(xRight, yTop);
      ctx.stroke();

      // Bottom return rails
      ctx.beginPath();
      ctx.moveTo(xLeft, yBot);
      ctx.lineTo(xRight, yBot);
      ctx.stroke();

      // Vertical legs
      ctx.beginPath();
      ctx.moveTo(xLeft, yTop); ctx.lineTo(xLeft, h / 2 - 22);
      ctx.moveTo(xLeft, h / 2 + 22); ctx.lineTo(xLeft, yBot);
      ctx.moveTo(xRight, yTop); ctx.lineTo(xRight, h / 2 - 22);
      ctx.moveTo(xRight, h / 2 + 22); ctx.lineTo(xRight, yBot);
      // R2 middle leg
      ctx.moveTo(xMid, yTop); ctx.lineTo(xMid, h / 2 - 22);
      ctx.moveTo(xMid, h / 2 + 22); ctx.lineTo(xMid, yBot);
      ctx.stroke();

      drawBattery(ctx, xLeft, h / 2, V1, 'V₁');
      drawBattery(ctx, xRight, h / 2, V2, 'V₂');
      drawVResistor(ctx, xMid, h / 2, R2, '2');

      // Mesh-current arrows: clockwise loops
      drawMeshLoop(ctx, xLeft + 30, yTop + 18, xMid - 30, yBot - 18,
        'I₁', 'rgba(255,107,42,0.85)', sol.I1, t);
      drawMeshLoop(ctx, xMid + 30, yTop + 18, xRight - 30, yBot - 18,
        'I₂', 'rgba(108,197,194,0.85)', sol.I2, t);

      // Node labels A, B
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText('A', xMid + 6, yTop - 4);
      ctx.textBaseline = 'top';
      ctx.fillText('B', xMid + 6, yBot + 6);

      // Branch current annotations
      ctx.fillStyle = 'rgba(91,174,248,0.95)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(`I_R₂ = I₁ − I₂ = ${fmtA(sol.I_R2)}`, xMid + 14, h / 2);

      // Top corner caption
      ctx.fillStyle = 'rgba(160,158,149,0.7)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('Two clockwise mesh currents I₁, I₂', 12, 10);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 13.1'}
      title="Mesh-current analysis — two loops, one matrix"
      question="Pick mesh currents; the linear system writes itself."
      caption={<>
        Two clockwise mesh currents I₁ and I₂ collapse the network to a 2×2 linear
        system. The middle branch R₂ is shared between the loops; its branch current
        is I₁ − I₂. For an N-mesh network the system is N×N — far smaller than the
        branch count.
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
        <MiniReadout label="Mesh I₁" value={<Num value={sol.I1} digits={3} />} unit="A" />
        <MiniReadout label="Mesh I₂" value={<Num value={sol.I2} digits={3} />} unit="A" />
        <MiniReadout label="I through R₂" value={<Num value={sol.I_R2} digits={3} />} unit="A" />
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

function drawMeshLoop(
  ctx: CanvasRenderingContext2D,
  x0: number, y0: number, x1: number, y1: number,
  label: string, color: string, I: number, t: number,
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
  const ux = tx / mag, uy = ty / mag;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(ax + ux * 8, ay + uy * 8);
  ctx.lineTo(ax - ux * 4 + uy * 4, ay - uy * 4 - ux * 4);
  ctx.lineTo(ax - ux * 4 - uy * 4, ay - uy * 4 + ux * 4);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = color;
  ctx.font = 'bold 12px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${label} = ${fmtA(I)}`, cx, cy);
  ctx.restore();
}
