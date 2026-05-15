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
import { renderCircuitToCanvas, type CircuitElement } from '@/lib/canvasPrimitives';
import { getCanvasColors } from '@/lib/canvasTheme';

interface Props { figure?: string }

interface StaticCacheEntry { key: string; canvas: HTMLCanvasElement }

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

  const cacheRef = useRef<StaticCacheEntry | null>(null);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, dpr } = info;
    let raf = 0;

    function draw() {
      const st = stateRef.current;
      st.t += 0.016;
      const { V1, V2, R1, R2, R3, sol, t } = st;

      ctx.fillStyle = getCanvasColors().bg;
      ctx.fillRect(0, 0, w, h);

      const padX = 60;
      const yTop = h / 2 - 70;
      const yBot = h / 2 + 70;
      const xLeft = padX;
      const xRight = w - padX;
      const xMid = (xLeft + xRight) / 2;

      // Cache key: invalidates on resize/DPR change or any slider movement.
      // Mesh-loop arrows are drawn live on top — they animate with t.
      const cacheKey =
        `${w}x${h}@${dpr}|${V1.toFixed(2)}|${V2.toFixed(2)}` +
        `|${R1.toFixed(0)}|${R2.toFixed(0)}|${R3.toFixed(0)}` +
        `|${sol.I_R2.toFixed(6)}`;
      if (cacheRef.current?.key !== cacheKey) {
        const elements = buildMeshSchematic(w, h, V1, V2, R1, R2, R3);
        const off = renderCircuitToCanvas({ elements }, w, h, dpr);
        const offCtx = off.getContext('2d');
        if (offCtx) {
          // Static text overlays: node labels, R₂ branch-current readout, caption.
          offCtx.save();
          offCtx.globalAlpha = 0.8;
          offCtx.fillStyle = getCanvasColors().text;
          offCtx.font = 'bold 11px "JetBrains Mono", monospace';
          offCtx.textAlign = 'left';
          offCtx.textBaseline = 'bottom';
          offCtx.fillText('A', xMid + 6, yTop - 4);
          offCtx.textBaseline = 'top';
          offCtx.fillText('B', xMid + 6, yBot + 6);

          offCtx.restore();
          offCtx.save();
          offCtx.globalAlpha = 0.95;
          offCtx.fillStyle = getCanvasColors().blue;
          offCtx.font = '10px "JetBrains Mono", monospace';
          offCtx.textAlign = 'left';
          offCtx.textBaseline = 'middle';
          offCtx.fillText(`I_R₂ = I₁ − I₂ = ${fmtA(sol.I_R2)}`, xMid + 14, h / 2);

          offCtx.restore();
          offCtx.save();
          offCtx.globalAlpha = 0.7;
          offCtx.fillStyle = getCanvasColors().textDim;
          offCtx.font = '10px "JetBrains Mono", monospace';
          offCtx.textAlign = 'left';
          offCtx.textBaseline = 'top';
          offCtx.fillText('Two clockwise mesh currents I₁, I₂', 12, 10);
          offCtx.restore();
        }
        cacheRef.current = { key: cacheKey, canvas: off };
      }
      // Blit cached schematic in one drawImage; live mesh-loop arrows on top.
      ctx.drawImage(cacheRef.current.canvas, 0, 0, w, h);

      // Per-frame overlay: rotating arrowhead around each mesh-loop ellipse.
      drawMeshLoop(ctx, xLeft + 30, yTop + 18, xMid - 30, yBot - 18,
        'I₁', 'rgba(255,107,42,0.85)', sol.I1, t);
      drawMeshLoop(ctx, xMid + 30, yTop + 18, xRight - 30, yBot - 18,
        'I₂', 'rgba(108,197,194,0.85)', sol.I2, t);

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

function buildMeshSchematic(
  w: number, h: number,
  V1: number, V2: number, R1: number, R2: number, R3: number,
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
    { kind: 'wire', points: [{ x: xLeft, y: yTop }, { x: xR1 - 22, y: yTop }] },
    { kind: 'resistor', from: { x: xR1 - 20, y: yTop }, to: { x: xR1 + 20, y: yTop },
      label: `R1=${R1.toFixed(0)}Ω`, labelOffset: { x: 0, y: -12 } },
    { kind: 'wire', points: [{ x: xR1 + 22, y: yTop }, { x: xMid, y: yTop }] },
    { kind: 'wire', points: [{ x: xMid, y: yTop }, { x: xR3 - 22, y: yTop }] },
    { kind: 'resistor', from: { x: xR3 - 20, y: yTop }, to: { x: xR3 + 20, y: yTop },
      label: `R3=${R3.toFixed(0)}Ω`, labelOffset: { x: 0, y: -12 } },
    { kind: 'wire', points: [{ x: xR3 + 22, y: yTop }, { x: xRight, y: yTop }] },
    { kind: 'wire', points: [{ x: xLeft, y: yBot }, { x: xRight, y: yBot }] },
    { kind: 'wire', points: [{ x: xLeft, y: yTop }, { x: xLeft, y: h / 2 - 22 }] },
    { kind: 'wire', points: [{ x: xLeft, y: h / 2 + 22 }, { x: xLeft, y: yBot }] },
    { kind: 'wire', points: [{ x: xRight, y: yTop }, { x: xRight, y: h / 2 - 22 }] },
    { kind: 'wire', points: [{ x: xRight, y: h / 2 + 22 }, { x: xRight, y: yBot }] },
    { kind: 'wire', points: [{ x: xMid, y: yTop }, { x: xMid, y: h / 2 - 22 }] },
    { kind: 'wire', points: [{ x: xMid, y: h / 2 + 22 }, { x: xMid, y: yBot }] },
    { kind: 'battery', at: { x: xLeft, y: h / 2 },
      label: `V₁=${V1.toFixed(1)}V`, leadLength: 22 },
    { kind: 'battery', at: { x: xRight, y: h / 2 },
      label: `V₂=${V2.toFixed(1)}V`, leadLength: 22 },
    { kind: 'resistor', from: { x: xMid, y: h / 2 - 20 }, to: { x: xMid, y: h / 2 + 20 },
      label: `R2=${R2.toFixed(0)}Ω`, labelOffset: { x: -60, y: 0 } },
  ];
}

function fmtA(I: number): string {
  if (Math.abs(I) >= 1) return I.toFixed(3) + ' A';
  if (Math.abs(I) >= 1e-3) return (I * 1000).toFixed(1) + ' mA';
  return (I * 1e6).toFixed(0) + ' µA';
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
