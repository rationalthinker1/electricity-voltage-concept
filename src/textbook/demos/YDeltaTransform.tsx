/**
 * Demo D13.4 — Y-Δ (star-delta) transformation
 *
 *   Y network: three resistors R_a, R_b, R_c each tied between a terminal
 *   (A, B, C) and a common interior node.
 *
 *   Δ network: three resistors R_AB, R_BC, R_CA tied directly between
 *   the three terminals.
 *
 *   Y → Δ (resistances):
 *     R_AB = (R_a R_b + R_b R_c + R_c R_a) / R_c
 *     R_BC = (R_a R_b + R_b R_c + R_c R_a) / R_a
 *     R_CA = (R_a R_b + R_b R_c + R_c R_a) / R_b
 *
 *   Test: terminal resistance R_AB seen from outside, with C floating:
 *     Y:  R_AB^Y = R_a + R_b
 *     Δ:  R_AB^Δ = R_AB ∥ (R_BC + R_CA)
 *   The transform makes both quantities equal — same for the other pairs.
 *
 *   The demo draws both networks side by side, lets the user move sliders on
 *   the Y, computes the corresponding Δ, and displays R_AB measured both
 *   ways. Residual should be machine-precision zero.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';
import { getCanvasColors } from '@/lib/canvasTheme';

interface Props {
  figure?: string;
}

function yToDelta(Ra: number, Rb: number, Rc: number) {
  const S = Ra * Rb + Rb * Rc + Rc * Ra;
  return {
    R_AB: S / Rc,
    R_BC: S / Ra,
    R_CA: S / Rb,
  };
}

export function YDeltaTransformDemo({ figure }: Props) {
  const [Ra, setRa] = useState(10);
  const [Rb, setRb] = useState(20);
  const [Rc, setRc] = useState(30);

  const delta = yToDelta(Ra, Rb, Rc);
  // Terminal resistance A-B with C left floating, computed via each network
  const RAB_Y = Ra + Rb;
  const RAB_D = (delta.R_AB * (delta.R_BC + delta.R_CA)) / (delta.R_AB + delta.R_BC + delta.R_CA);
  const residual = Math.abs(RAB_Y - RAB_D);

  const stateRef = useRef({ Ra, Rb, Rc, delta });
  useEffect(() => {
    stateRef.current = { Ra, Rb, Rc, delta };
  }, [Ra, Rb, Rc, delta.R_AB, delta.R_BC, delta.R_CA]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h } = info;
    let raf = 0;

    function draw() {
      const { Ra, Rb, Rc, delta } = stateRef.current;

      ctx.fillStyle = getCanvasColors().bg;
      ctx.fillRect(0, 0, w, h);

      // Two panels side by side
      const halfW = w / 2;

      // Y on the left
      drawYNetwork(ctx, 0, 0, halfW, h, Ra, Rb, Rc);
      // Δ on the right
      drawDeltaNetwork(ctx, halfW, 0, halfW, h, delta.R_AB, delta.R_BC, delta.R_CA);

      // Divider
      ctx.strokeStyle = getCanvasColors().border;
      ctx.beginPath();
      ctx.moveTo(halfW, 8);
      ctx.lineTo(halfW, h - 8);
      ctx.stroke();

      // Equivalence arrow
      ctx.fillStyle = getCanvasColors().accent;
      ctx.font = 'bold 14px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⇌', halfW, h / 2);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 13.4'}
      title="Y ⇌ Δ transformation — three resistors, two shapes, one network"
      question="The Y on the left and the Δ on the right are externally indistinguishable."
      caption={
        <>
          Three resistors arranged as a wye (left) or a delta (right). Kennelly (1899) showed that
          for the right choice of resistor values, the two networks present identical impedance to
          anything connected at the three terminals A, B, C. That makes bridge-style networks —
          un-reducible by series/parallel alone — suddenly tractable.
        </>
      }
    >
      <AutoResizeCanvas height={320} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="R_a (Y)"
          value={Ra}
          min={1}
          max={100}
          step={1}
          format={(v) => v.toFixed(0) + ' Ω'}
          onChange={setRa}
        />
        <MiniSlider
          label="R_b (Y)"
          value={Rb}
          min={1}
          max={100}
          step={1}
          format={(v) => v.toFixed(0) + ' Ω'}
          onChange={setRb}
        />
        <MiniSlider
          label="R_c (Y)"
          value={Rc}
          min={1}
          max={100}
          step={1}
          format={(v) => v.toFixed(0) + ' Ω'}
          onChange={setRc}
        />
        <MiniReadout label="R_AB (Δ side)" value={<Num value={delta.R_AB} digits={2} />} unit="Ω" />
        <MiniReadout label="R_BC (Δ side)" value={<Num value={delta.R_BC} digits={2} />} unit="Ω" />
        <MiniReadout label="R_CA (Δ side)" value={<Num value={delta.R_CA} digits={2} />} unit="Ω" />
        <MiniReadout label="A–B from Y" value={<Num value={RAB_Y} digits={3} />} unit="Ω" />
        <MiniReadout label="A–B from Δ" value={<Num value={RAB_D} digits={3} />} unit="Ω" />
        <MiniReadout label="|Δ| residual" value={<Num value={residual} digits={2} />} unit="Ω" />
      </DemoControls>
    </Demo>
  );
}

function drawYNetwork(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  w: number,
  h: number,
  Ra: number,
  Rb: number,
  Rc: number,
) {
  ctx.save();
  ctx.translate(x0, y0);
  const cx = w / 2;
  const cy = h * 0.55;
  const r = Math.min(w, h) * 0.32;
  const A = { x: cx, y: cy - r };
  const B = { x: cx - r * 0.866, y: cy + r * 0.5 };
  const C = { x: cx + r * 0.866, y: cy + r * 0.5 };
  const N = { x: cx, y: cy };

  ctx.strokeStyle = getCanvasColors().textDim;
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  // Three legs with embedded resistors
  drawLineResistor(ctx, A.x, A.y, N.x, N.y, `R_a=${Ra.toFixed(0)}Ω`);
  drawLineResistor(ctx, B.x, B.y, N.x, N.y, `R_b=${Rb.toFixed(0)}Ω`);
  drawLineResistor(ctx, C.x, C.y, N.x, N.y, `R_c=${Rc.toFixed(0)}Ω`);

  // Terminal dots
  drawTerminal(ctx, A, 'A');
  drawTerminal(ctx, B, 'B');
  drawTerminal(ctx, C, 'C');

  // Centre node
  ctx.fillStyle = getCanvasColors().teal;
  ctx.beginPath();
  ctx.arc(N.x, N.y, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = getCanvasColors().textDim;
  ctx.font = '11px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('Y (star)', cx, 12);
  ctx.restore();
}

function drawDeltaNetwork(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  w: number,
  h: number,
  RAB: number,
  RBC: number,
  RCA: number,
) {
  ctx.save();
  ctx.translate(x0, y0);
  const cx = w / 2;
  const cy = h * 0.55;
  const r = Math.min(w, h) * 0.32;
  const A = { x: cx, y: cy - r };
  const B = { x: cx - r * 0.866, y: cy + r * 0.5 };
  const C = { x: cx + r * 0.866, y: cy + r * 0.5 };

  ctx.strokeStyle = getCanvasColors().textDim;
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  drawLineResistor(ctx, A.x, A.y, B.x, B.y, `R_AB=${RAB.toFixed(1)}Ω`);
  drawLineResistor(ctx, B.x, B.y, C.x, C.y, `R_BC=${RBC.toFixed(1)}Ω`);
  drawLineResistor(ctx, C.x, C.y, A.x, A.y, `R_CA=${RCA.toFixed(1)}Ω`);

  drawTerminal(ctx, A, 'A');
  drawTerminal(ctx, B, 'B');
  drawTerminal(ctx, C, 'C');

  ctx.fillStyle = getCanvasColors().textDim;
  ctx.font = '11px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('Δ (delta)', cx, 12);
  ctx.restore();
}

function drawTerminal(ctx: CanvasRenderingContext2D, p: { x: number; y: number }, label: string) {
  ctx.fillStyle = getCanvasColors().accent;
  ctx.beginPath();
  ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.font = 'bold 12px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText(label, p.x, p.y - 8);
}

function drawLineResistor(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  label: string,
) {
  const dx = x1 - x0,
    dy = y1 - y0;
  const len = Math.hypot(dx, dy);
  if (len < 4) return;
  const ux = dx / len,
    uy = dy / len;
  // Perpendicular for zig-zag
  const px = -uy,
    py = ux;

  const start = 22; // leave a gap for the terminal
  const end = len - 22;
  const segs = 6;
  const segLen = (end - start) / segs;
  const amp = 6;

  ctx.strokeStyle = getCanvasColors().textDim;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x0 + ux * start, y0 + uy * start);
  ctx.stroke();

  ctx.strokeStyle = getCanvasColors().accent;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  let cx = x0 + ux * start;
  let cy = y0 + uy * start;
  ctx.moveTo(cx, cy);
  for (let i = 0; i < segs; i++) {
    cx += ux * segLen;
    cy += uy * segLen;
    const sign = i % 2 === 0 ? 1 : -1;
    ctx.lineTo(cx + px * amp * sign, cy + py * amp * sign);
  }
  ctx.lineTo(x0 + ux * end, y0 + uy * end);
  ctx.stroke();

  ctx.strokeStyle = getCanvasColors().textDim;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x0 + ux * end, y0 + uy * end);
  ctx.lineTo(x1, y1);
  ctx.stroke();

  // Label at midpoint, offset perpendicular
  const mx = (x0 + x1) / 2 + px * 14;
  const my = (y0 + y1) / 2 + py * 14;
  ctx.fillStyle = getCanvasColors().accent;
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, mx, my);
}
