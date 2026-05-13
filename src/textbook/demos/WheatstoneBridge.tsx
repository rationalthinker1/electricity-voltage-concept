/**
 * Demo D13.3 — The Wheatstone bridge
 *
 *       +─── R1 ───A─── R2 ───+
 *       │          │          │
 *       V          G (galv.)  │
 *       │          │          │
 *       +─── R3 ───B─── Rx ───+
 *
 *   With the galvanometer ideal (infinite input impedance), nodes A and B
 *   are voltage dividers:
 *       V_A = V · R2 / (R1 + R2)         (top side, between R1 and R2)
 *       V_B = V · Rx / (R3 + Rx)         (bottom side, between R3 and Rx)
 *
 *   Wait — that's not quite the textbook labelling. Let me use the standard one:
 *
 *       Top branch:    V → R1 → A → R2 → 0
 *       Bottom branch: V → R3 → B → Rx → 0
 *       Galvanometer between A and B.
 *
 *   Balance condition: V_A = V_B  ⇒  R2/(R1+R2) = Rx/(R3+Rx)
 *                              ⇒  Rx · R1 = R2 · R3
 *                              ⇒  Rx = R2·R3 / R1
 *
 *   The demo lets the reader sweep Rx and watch the galvanometer needle
 *   crossing zero at the balance point.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import {
  Demo, DemoControls, MiniReadout, MiniSlider,
} from '@/components/Demo';
import { Num } from '@/components/Num';

interface Props { figure?: string }

export function WheatstoneBridgeDemo({ figure }: Props) {
  const [V, setV] = useState(10);
  const [R1, setR1] = useState(100);
  const [R2, setR2] = useState(200);
  const [R3, setR3] = useState(150);
  const [Rx, setRx] = useState(300);

  const V_A = V * R2 / (R1 + R2);
  const V_B = V * Rx / (R3 + Rx);
  const dV = V_A - V_B;                          // galvanometer reads this
  const RxBalance = R2 * R3 / R1;
  const balanceErr = Math.abs(Rx - RxBalance) / RxBalance;

  const stateRef = useRef({ V, R1, R2, R3, Rx, V_A, V_B, dV });
  useEffect(() => {
    stateRef.current = { V, R1, R2, R3, Rx, V_A, V_B, dV };
  }, [V, R1, R2, R3, Rx, V_A, V_B, dV]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h } = info;
    let raf = 0;

    function draw() {
      const { V, R1, R2, R3, Rx, V_A, V_B, dV } = stateRef.current;

      ctx.fillStyle = '#0d0d10';
      ctx.fillRect(0, 0, w, h);

      const padX = 60;
      const xL = padX;
      const xR = w - padX;
      const xA = (xL + xR) * 0.42;
      const xB = (xL + xR) * 0.42;
      const yTop = h * 0.28;
      const yBot = h * 0.72;
      const yMid = (yTop + yBot) / 2;

      ctx.strokeStyle = 'rgba(255,255,255,0.55)';
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';

      // Left vertical: battery
      ctx.beginPath();
      ctx.moveTo(xL, yTop); ctx.lineTo(xL, yMid - 22);
      ctx.moveTo(xL, yMid + 22); ctx.lineTo(xL, yBot);
      ctx.stroke();
      // Right vertical wire
      ctx.beginPath();
      ctx.moveTo(xR, yTop); ctx.lineTo(xR, yBot);
      ctx.stroke();

      // Top branch: R1, A, R2
      ctx.beginPath();
      ctx.moveTo(xL, yTop);
      ctx.lineTo((xL + xA) / 2 - 22, yTop);
      ctx.stroke();
      drawHResistor(ctx, (xL + xA) / 2, yTop, R1, '1');
      ctx.beginPath();
      ctx.moveTo((xL + xA) / 2 + 22, yTop);
      ctx.lineTo(xA, yTop);
      ctx.lineTo((xA + xR) / 2 - 22, yTop);
      ctx.stroke();
      drawHResistor(ctx, (xA + xR) / 2, yTop, R2, '2');
      ctx.beginPath();
      ctx.moveTo((xA + xR) / 2 + 22, yTop);
      ctx.lineTo(xR, yTop);
      ctx.stroke();

      // Bottom branch: R3, B, Rx
      ctx.beginPath();
      ctx.moveTo(xL, yBot);
      ctx.lineTo((xL + xB) / 2 - 22, yBot);
      ctx.stroke();
      drawHResistor(ctx, (xL + xB) / 2, yBot, R3, '3');
      ctx.beginPath();
      ctx.moveTo((xL + xB) / 2 + 22, yBot);
      ctx.lineTo(xB, yBot);
      ctx.lineTo((xB + xR) / 2 - 22, yBot);
      ctx.stroke();
      drawHResistorLabel(ctx, (xB + xR) / 2, yBot, Rx, 'x');
      ctx.beginPath();
      ctx.moveTo((xB + xR) / 2 + 22, yBot);
      ctx.lineTo(xR, yBot);
      ctx.stroke();

      drawBattery(ctx, xL, yMid, V);

      // Galvanometer between A and B
      drawGalvanometer(ctx, xA, yMid, dV, V);

      // Node dots and labels
      ctx.fillStyle = 'rgba(255,107,42,0.95)';
      ctx.beginPath(); ctx.arc(xA, yTop, 4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(xB, yBot, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`A   ${V_A.toFixed(3)} V`, xA + 8, yTop - 6);
      ctx.textBaseline = 'top';
      ctx.fillText(`B   ${V_B.toFixed(3)} V`, xB + 8, yBot + 6);

      // Header
      ctx.fillStyle = 'rgba(160,158,149,0.75)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('Wheatstone bridge — not reducible by series/parallel rules', 12, 10);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 13.3'}
      title="The Wheatstone bridge — balance by inspection"
      question="Drag R_x. The galvanometer crosses zero when R_x R₁ = R₂ R₃."
      caption={<>
        Four resistors in a diamond, with a galvanometer across the middle. The bridge
        balances — needle dead-centre — exactly when R<sub>x</sub>·R₁ = R₂·R₃. There
        is no way to reduce this network to a single series-parallel combination; you
        need either mesh / nodal analysis or a Y-Δ transformation. The balance trick
        is what makes the bridge the most precise resistance comparator ever
        invented.
      </>}
    >
      <AutoResizeCanvas height={320} setup={setup} />
      <DemoControls>
        <MiniSlider label="V" value={V} min={1} max={24} step={0.5}
          format={v => v.toFixed(1) + ' V'} onChange={setV} />
        <MiniSlider label="R₁" value={R1} min={10} max={500} step={5}
          format={v => v.toFixed(0) + ' Ω'} onChange={setR1} />
        <MiniSlider label="R₂" value={R2} min={10} max={500} step={5}
          format={v => v.toFixed(0) + ' Ω'} onChange={setR2} />
        <MiniSlider label="R₃" value={R3} min={10} max={500} step={5}
          format={v => v.toFixed(0) + ' Ω'} onChange={setR3} />
        <MiniSlider label="R_x" value={Rx} min={10} max={1000} step={5}
          format={v => v.toFixed(0) + ' Ω'} onChange={setRx} />
        <MiniReadout label="V_A − V_B" value={<Num value={dV} digits={3} />} unit="V" />
        <MiniReadout label="R_x at balance" value={<Num value={RxBalance} digits={1} />} unit="Ω" />
        <MiniReadout label="Imbalance" value={<Num value={balanceErr * 100} digits={1} />} unit="%" />
      </DemoControls>
    </Demo>
  );
}

function drawBattery(ctx: CanvasRenderingContext2D, x: number, y: number, V: number) {
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
  ctx.fillText(`${V.toFixed(1)} V`, x - 18, y);
}

function drawGalvanometer(
  ctx: CanvasRenderingContext2D, x: number, y: number, dV: number, V: number,
) {
  ctx.save();
  // Outer circle
  ctx.strokeStyle = 'rgba(108,197,194,0.95)';
  ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.arc(x, y, 18, 0, Math.PI * 2); ctx.stroke();

  // Needle: deflection mapped from full-scale ±V to ±60°
  const fullScale = Math.max(0.05, V * 0.5);
  const norm = Math.max(-1, Math.min(1, dV / fullScale));
  const ang = -Math.PI / 2 + norm * (Math.PI / 3);
  const isBalanced = Math.abs(dV) < V * 0.005;
  ctx.strokeStyle = isBalanced ? '#ff6b2a' : 'rgba(236,235,229,0.95)';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(x, y + 4);
  ctx.lineTo(x + 14 * Math.cos(ang), y + 14 * Math.sin(ang));
  ctx.stroke();

  ctx.fillStyle = 'rgba(108,197,194,0.95)';
  ctx.font = 'bold 10px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('G', x, y + 22);
  ctx.restore();
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

function drawHResistorLabel(ctx: CanvasRenderingContext2D, cx: number, cy: number, R: number, idx: string) {
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
  ctx.textBaseline = 'top';
  ctx.fillText(`R${idx}=${R.toFixed(0)}Ω`, cx, cy + 12);
}
