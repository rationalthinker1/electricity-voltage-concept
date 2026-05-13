/**
 * Demo D13.5 — Thévenin ↔ Norton equivalence
 *
 *   Source network (left): voltage source V_s in series with R_s, plus a
 *   bleeder R_p in parallel across the output terminals.
 *
 *      V_s ──[R_s]──+── terminal A
 *                   |
 *                   [R_p]
 *                   |
 *      ──────────── +── terminal B (ground)
 *
 *   Open-circuit voltage at AB:
 *       V_oc = V_s · R_p / (R_s + R_p)
 *   Thévenin resistance (V_s shorted):
 *       R_Th = R_s ∥ R_p = R_s R_p / (R_s + R_p)
 *   Norton equivalent:
 *       I_N  = V_oc / R_Th = V_s / R_s     (independent of R_p — short-circuit current)
 *       R_N  = R_Th
 *
 *   For an external load R_L, the terminal voltage is:
 *       V_L = V_oc · R_L / (R_Th + R_L)
 *   and the load current is:
 *       I_L = V_oc / (R_Th + R_L) = I_N · R_N / (R_N + R_L)
 *   The two equivalents give numerically identical V_L and I_L.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import {
  Demo, DemoControls, MiniReadout, MiniSlider,
} from '@/components/Demo';
import { Num } from '@/components/Num';

interface Props { figure?: string }

export function NortonTheveninDemo({ figure }: Props) {
  const [Vs, setVs] = useState(12);
  const [Rs, setRs] = useState(4);
  const [Rp, setRp] = useState(12);
  const [RL, setRL] = useState(8);

  const V_oc = Vs * Rp / (Rs + Rp);
  const R_Th = (Rs * Rp) / (Rs + Rp);
  const I_N = V_oc / R_Th;                     // == Vs / Rs (algebraically)
  // Driven by Thévenin
  const I_L_T = V_oc / (R_Th + RL);
  const V_L_T = I_L_T * RL;
  // Driven by Norton (current divider)
  const I_L_N = I_N * R_Th / (R_Th + RL);
  const V_L_N = I_L_N * RL;

  const stateRef = useRef({ V_oc, R_Th, I_N, RL });
  useEffect(() => {
    stateRef.current = { V_oc, R_Th, I_N, RL };
  }, [V_oc, R_Th, I_N, RL]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h } = info;
    let raf = 0;

    function draw() {
      const { V_oc, R_Th, I_N, RL } = stateRef.current;

      ctx.fillStyle = '#0d0d10';
      ctx.fillRect(0, 0, w, h);

      // Three panels: original, Thévenin, Norton
      const colW = w / 3;
      drawOriginal(ctx, 0, 0, colW, h);
      drawThev(ctx, colW, 0, colW, h, V_oc, R_Th, RL);
      drawNort(ctx, 2 * colW, 0, colW, h, I_N, R_Th, RL);

      ctx.strokeStyle = 'rgba(255,255,255,0.10)';
      ctx.beginPath();
      ctx.moveTo(colW, 8); ctx.lineTo(colW, h - 8);
      ctx.moveTo(2 * colW, 8); ctx.lineTo(2 * colW, h - 8);
      ctx.stroke();

      ctx.fillStyle = 'rgba(255,107,42,0.85)';
      ctx.font = 'bold 14px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⇌', colW, h * 0.45);
      ctx.fillText('⇌', 2 * colW, h * 0.45);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 13.5'}
      title="Thévenin ⇌ Norton — three networks, identical terminal behaviour"
      question="Connect the same load R_L to any of three networks; V_L and I_L agree."
      caption={<>
        The original network on the left contains a source, a series resistor, and a
        bleeder. The middle panel is its Thévenin equivalent: a single voltage source
        V<sub>Th</sub> = V<sub>oc</sub> in series with R<sub>Th</sub>. The right panel is
        the Norton equivalent: a current source I<sub>N</sub> = V<sub>Th</sub>/R<sub>Th</sub>
        in parallel with the same R<sub>N</sub> = R<sub>Th</sub>. From the outside, all
        three are indistinguishable for any linear load.
      </>}
    >
      <AutoResizeCanvas height={320} setup={setup} />
      <DemoControls>
        <MiniSlider label="V_s" value={Vs} min={1} max={24} step={0.5}
          format={v => v.toFixed(1) + ' V'} onChange={setVs} />
        <MiniSlider label="R_s" value={Rs} min={0.5} max={50} step={0.5}
          format={v => v.toFixed(1) + ' Ω'} onChange={setRs} />
        <MiniSlider label="R_p" value={Rp} min={0.5} max={100} step={0.5}
          format={v => v.toFixed(1) + ' Ω'} onChange={setRp} />
        <MiniSlider label="R_L" value={RL} min={0.5} max={100} step={0.5}
          format={v => v.toFixed(1) + ' Ω'} onChange={setRL} />
        <MiniReadout label="V_Th = V_oc" value={<Num value={V_oc} digits={3} />} unit="V" />
        <MiniReadout label="R_Th = R_N" value={<Num value={R_Th} digits={3} />} unit="Ω" />
        <MiniReadout label="I_N (short)" value={<Num value={I_N} digits={3} />} unit="A" />
        <MiniReadout label="V_L  (Thévenin)" value={<Num value={V_L_T} digits={3} />} unit="V" />
        <MiniReadout label="V_L  (Norton)" value={<Num value={V_L_N} digits={3} />} unit="V" />
      </DemoControls>
    </Demo>
  );
}

function drawOriginal(
  ctx: CanvasRenderingContext2D, x0: number, y0: number, w: number, h: number,
) {
  ctx.save();
  ctx.translate(x0, y0);
  ctx.fillStyle = 'rgba(160,158,149,0.85)';
  ctx.font = '11px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('Original network', w / 2, 12);

  const cy = h / 2;
  const xS = 26;
  const xR1 = 64;
  const xR2 = 112;
  const xA = w - 30;
  const yTop = cy - 50;
  const yBot = cy + 50;

  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  // Bat to R_s to node X to R_p (down to bottom rail) and to terminal A
  ctx.beginPath();
  ctx.moveTo(xS, yTop);
  ctx.lineTo(xR1 - 18, yTop);
  ctx.stroke();
  drawHResistor(ctx, xR1, yTop, 'R_s');
  ctx.beginPath();
  ctx.moveTo(xR1 + 18, yTop);
  ctx.lineTo(xR2, yTop);
  // Down from node X through R_p to bottom
  ctx.lineTo(xR2, cy - 18);
  ctx.stroke();
  drawVResistor(ctx, xR2, cy, 'R_p');
  ctx.beginPath();
  ctx.moveTo(xR2, cy + 18); ctx.lineTo(xR2, yBot);
  // From node X right to terminal A
  ctx.moveTo(xR2, yTop); ctx.lineTo(xA, yTop);
  // Bottom rail
  ctx.moveTo(xS, yBot); ctx.lineTo(xA, yBot);
  // Battery
  ctx.moveTo(xS, yTop); ctx.lineTo(xS, cy - 14);
  ctx.moveTo(xS, cy + 14); ctx.lineTo(xS, yBot);
  ctx.stroke();
  drawBat(ctx, xS, cy);
  drawTerminal(ctx, xA, yTop, 'A');
  drawTerminal(ctx, xA, yBot, 'B');
  ctx.restore();
}

function drawThev(
  ctx: CanvasRenderingContext2D, x0: number, y0: number, w: number, h: number,
  Voc: number, RTh: number, RL: number,
) {
  ctx.save();
  ctx.translate(x0, y0);
  ctx.fillStyle = 'rgba(160,158,149,0.85)';
  ctx.font = '11px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('Thévenin equivalent + load', w / 2, 12);

  const cy = h / 2;
  const xS = 26;
  const xR = 70;
  const xA = w - 60;
  const xL = w - 30;
  const yTop = cy - 50;
  const yBot = cy + 50;

  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(xS, yTop); ctx.lineTo(xR - 18, yTop); ctx.stroke();
  drawHResistor(ctx, xR, yTop, `R_Th=${RTh.toFixed(1)}Ω`);
  ctx.beginPath();
  ctx.moveTo(xR + 18, yTop); ctx.lineTo(xA, yTop);
  // Load
  ctx.lineTo(xA, cy - 18); ctx.stroke();
  drawVResistor(ctx, xA, cy, `R_L=${RL.toFixed(1)}Ω`);
  ctx.beginPath();
  ctx.moveTo(xA, cy + 18); ctx.lineTo(xA, yBot);
  ctx.moveTo(xS, yBot); ctx.lineTo(xA, yBot);
  ctx.moveTo(xS, yTop); ctx.lineTo(xS, cy - 14);
  ctx.moveTo(xS, cy + 14); ctx.lineTo(xS, yBot);
  ctx.stroke();
  drawBatLabel(ctx, xS, cy, `V_Th=${Voc.toFixed(2)}V`);
  drawTerminal(ctx, xA, yTop, 'A');
  drawTerminal(ctx, xA, yBot, 'B');
  // load-line marker
  void xL;
  ctx.restore();
}

function drawNort(
  ctx: CanvasRenderingContext2D, x0: number, y0: number, w: number, h: number,
  IN: number, RN: number, RL: number,
) {
  ctx.save();
  ctx.translate(x0, y0);
  ctx.fillStyle = 'rgba(160,158,149,0.85)';
  ctx.font = '11px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('Norton equivalent + load', w / 2, 12);

  const cy = h / 2;
  const xS = 36;
  const xR = 84;
  const xA = w - 50;
  const yTop = cy - 50;
  const yBot = cy + 50;

  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  // Current source on left (vertical between rails)
  ctx.beginPath();
  ctx.moveTo(xS, yTop); ctx.lineTo(xS, cy - 18);
  ctx.moveTo(xS, cy + 18); ctx.lineTo(xS, yBot);
  ctx.stroke();
  drawCurrentSource(ctx, xS, cy, `I_N=${IN.toFixed(2)}A`);

  // Parallel resistor R_N between rails
  ctx.beginPath();
  ctx.moveTo(xS, yTop); ctx.lineTo(xR, yTop); ctx.lineTo(xR, cy - 18); ctx.stroke();
  drawVResistor(ctx, xR, cy, `R_N=${RN.toFixed(1)}Ω`);
  ctx.beginPath();
  ctx.moveTo(xR, cy + 18); ctx.lineTo(xR, yBot); ctx.lineTo(xS, yBot); ctx.stroke();

  // Load
  ctx.beginPath();
  ctx.moveTo(xR, yTop); ctx.lineTo(xA, yTop); ctx.lineTo(xA, cy - 18); ctx.stroke();
  drawVResistor(ctx, xA, cy, `R_L=${RL.toFixed(1)}Ω`);
  ctx.beginPath();
  ctx.moveTo(xA, cy + 18); ctx.lineTo(xA, yBot); ctx.lineTo(xR, yBot); ctx.stroke();

  drawTerminal(ctx, xA, yTop, 'A');
  drawTerminal(ctx, xA, yBot, 'B');
  ctx.restore();
}

function drawBat(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.strokeStyle = '#ff3b6e';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x - 12, y - 14); ctx.lineTo(x + 12, y - 14);
  ctx.stroke();
  ctx.strokeStyle = '#5baef8';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x - 7, y + 14); ctx.lineTo(x + 7, y + 14);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText('V_s', x - 16, y);
}

function drawBatLabel(ctx: CanvasRenderingContext2D, x: number, y: number, lbl: string) {
  ctx.strokeStyle = '#ff3b6e';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x - 12, y - 14); ctx.lineTo(x + 12, y - 14);
  ctx.stroke();
  ctx.strokeStyle = '#5baef8';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x - 7, y + 14); ctx.lineTo(x + 7, y + 14);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.font = '9px "JetBrains Mono", monospace';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText(lbl, x - 16, y);
}

function drawCurrentSource(ctx: CanvasRenderingContext2D, x: number, y: number, lbl: string) {
  ctx.strokeStyle = 'rgba(108,197,194,0.95)';
  ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.arc(x, y, 16, 0, Math.PI * 2); ctx.stroke();
  // Up-arrow inside
  ctx.beginPath();
  ctx.moveTo(x, y + 8); ctx.lineTo(x, y - 8);
  ctx.moveTo(x - 4, y - 4); ctx.lineTo(x, y - 8); ctx.lineTo(x + 4, y - 4);
  ctx.stroke();
  ctx.fillStyle = 'rgba(108,197,194,0.95)';
  ctx.font = '9px "JetBrains Mono", monospace';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText(lbl, x - 20, y);
}

function drawTerminal(ctx: CanvasRenderingContext2D, x: number, y: number, lbl: string) {
  ctx.fillStyle = 'rgba(255,107,42,0.95)';
  ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.font = 'bold 11px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(lbl, x + 8, y);
}

function drawHResistor(ctx: CanvasRenderingContext2D, cx: number, cy: number, label: string) {
  const x0 = cx - 18;
  const x1 = cx + 18;
  ctx.strokeStyle = 'rgba(255,107,42,0.95)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(x0, cy);
  const steps = 6;
  const stepW = (x1 - x0) / steps;
  for (let i = 0; i < steps; i++) {
    const x = x0 + (i + 0.5) * stepW;
    const y = cy + (i % 2 === 0 ? -6 : 6);
    ctx.lineTo(x, y);
  }
  ctx.lineTo(x1, cy);
  ctx.stroke();
  ctx.fillStyle = '#ff6b2a';
  ctx.font = '9px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText(label, cx, cy - 10);
}

function drawVResistor(ctx: CanvasRenderingContext2D, cx: number, cy: number, label: string) {
  const y0 = cy - 18;
  const y1 = cy + 18;
  ctx.strokeStyle = 'rgba(255,107,42,0.95)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(cx, y0);
  const steps = 6;
  const stepH = (y1 - y0) / steps;
  for (let i = 0; i < steps; i++) {
    const y = y0 + (i + 0.5) * stepH;
    const x = cx + (i % 2 === 0 ? -6 : 6);
    ctx.lineTo(x, y);
  }
  ctx.lineTo(cx, y1);
  ctx.stroke();
  ctx.fillStyle = '#ff6b2a';
  ctx.font = '9px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, cx + 10, cy);
}
