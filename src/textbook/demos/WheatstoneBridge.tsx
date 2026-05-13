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
import { drawBattery, drawResistor, drawWire } from '@/lib/canvasPrimitives';

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

      // Left vertical: battery
      drawWire(ctx, [{ x: xL, y: yTop }, { x: xL, y: yMid - 22 }]);
      drawWire(ctx, [{ x: xL, y: yMid + 22 }, { x: xL, y: yBot }]);
      // Right vertical wire
      drawWire(ctx, [{ x: xR, y: yTop }, { x: xR, y: yBot }]);

      // Top branch: R1, A, R2
      const xR1 = (xL + xA) / 2;
      const xR2 = (xA + xR) / 2;
      drawWire(ctx, [{ x: xL, y: yTop }, { x: xR1 - 22, y: yTop }]);
      drawResistor(ctx, { x: xR1 - 20, y: yTop }, { x: xR1 + 20, y: yTop }, {
        label: `R1=${R1.toFixed(0)}Ω`,
        labelOffset: { x: 0, y: -12 },
      });
      drawWire(ctx, [{ x: xR1 + 22, y: yTop }, { x: xA, y: yTop }, { x: xR2 - 22, y: yTop }]);
      drawResistor(ctx, { x: xR2 - 20, y: yTop }, { x: xR2 + 20, y: yTop }, {
        label: `R2=${R2.toFixed(0)}Ω`,
        labelOffset: { x: 0, y: -12 },
      });
      drawWire(ctx, [{ x: xR2 + 22, y: yTop }, { x: xR, y: yTop }]);

      // Bottom branch: R3, B, Rx
      const xR3 = (xL + xB) / 2;
      const xRx = (xB + xR) / 2;
      drawWire(ctx, [{ x: xL, y: yBot }, { x: xR3 - 22, y: yBot }]);
      drawResistor(ctx, { x: xR3 - 20, y: yBot }, { x: xR3 + 20, y: yBot }, {
        label: `R3=${R3.toFixed(0)}Ω`,
        labelOffset: { x: 0, y: -12 },
      });
      drawWire(ctx, [{ x: xR3 + 22, y: yBot }, { x: xB, y: yBot }, { x: xRx - 22, y: yBot }]);
      drawResistor(ctx, { x: xRx - 20, y: yBot }, { x: xRx + 20, y: yBot }, {
        label: `Rx=${Rx.toFixed(0)}Ω`,
        labelOffset: { x: 0, y: 20 },
      });
      drawWire(ctx, [{ x: xRx + 22, y: yBot }, { x: xR, y: yBot }]);

      drawBattery(ctx, { x: xL, y: yMid }, {
        label: `${V.toFixed(1)} V`,
        leadLength: 22,
      });

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
