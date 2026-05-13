/**
 * Demo D12.8 — Thévenin equivalent
 *
 * A small two-source network on the left:
 *   V_s in series with R_1, then a node that joins R_2 to ground, with
 *   a parallel current source I_s also injected at the load node. The
 *   network's two output terminals connect to a load R_L.
 *
 * Open-circuit voltage and short-circuit current of this network give
 *   V_th = V_s · (R_2 / (R_1 + R_2)) + I_s · (R_1·R_2 / (R_1 + R_2))
 *   R_th = R_1 ∥ R_2  =  R_1·R_2 / (R_1 + R_2)
 *
 * Both circuits driven onto the same load R_L produce identical V_load
 * and I_load — the entire point of the equivalence.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';

interface Props { figure?: string }

export function TheveninEquivalentDemo({ figure }: Props) {
  const [Vs, setVs] = useState(12);          // V
  const [R1, setR1] = useState(100);         // Ω
  const [R2, setR2] = useState(200);         // Ω
  const [Is_mA, setIs_mA] = useState(20);    // mA
  const [RL, setRL] = useState(300);         // Ω

  const Is = Is_mA * 1e-3; // A
  const parallel = (R1 * R2) / (R1 + R2);
  const Vth = Vs * (R2 / (R1 + R2)) + Is * parallel;
  const Rth = parallel;
  // Load voltage and current via Thévenin (or original, equivalent)
  const Iload = Vth / (Rth + RL);
  const Vload = Iload * RL;

  const stateRef = useRef({ Vs, R1, R2, Is, RL, Vth, Rth, Vload, Iload });
  useEffect(() => {
    stateRef.current = { Vs, R1, R2, Is, RL, Vth, Rth, Vload, Iload };
  }, [Vs, R1, R2, Is, RL, Vth, Rth, Vload, Iload]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h } = info;
    let raf = 0;

    function draw() {
      const st = stateRef.current;

      ctx.fillStyle = '#0d0d10';
      ctx.fillRect(0, 0, w, h);

      const splitX = w / 2;

      // Divider
      ctx.strokeStyle = 'rgba(255,255,255,0.10)';
      ctx.beginPath(); ctx.moveTo(splitX, 14); ctx.lineTo(splitX, h - 14); ctx.stroke();

      // Labels
      ctx.fillStyle = 'rgba(160,158,149,0.85)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('Original network', splitX / 2, 6);
      ctx.fillText('Thévenin equivalent', splitX + splitX / 2, 6);

      // ── LEFT: Original network ──────────────────────────────
      drawOriginal(ctx, 0, 22, splitX, h - 22, st);

      // ── RIGHT: Thévenin equivalent ──────────────────────────
      drawThevenin(ctx, splitX, 22, splitX, h - 22, st);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 12.6'}
      title="Thévenin equivalent of a two-source network"
      question="The two circuits load the same R_L. Do they ever disagree?"
      caption={<>
        Left: a voltage source V<sub>s</sub> and a current source I<sub>s</sub> wrapped around two
        resistors, feeding a load R<sub>L</sub>. Right: the same network compressed to a single
        Thévenin source V<sub>th</sub> in series with R<sub>th</sub>. Slide any parameter — the
        two circuits always show the same V<sub>load</sub> and I<sub>load</sub>. Any linear
        two-terminal network reduces to this pair of numbers.
      </>}
    >
      <AutoResizeCanvas height={280} setup={setup} />
      <DemoControls>
        <MiniSlider label="V_s" value={Vs} min={0} max={24} step={0.5}
          format={v => v.toFixed(1) + ' V'} onChange={setVs} />
        <MiniSlider label="I_s" value={Is_mA} min={0} max={100} step={1}
          format={v => v.toFixed(0) + ' mA'} onChange={setIs_mA} />
        <MiniSlider label="R₁" value={R1} min={10} max={1000} step={10}
          format={v => v.toFixed(0) + ' Ω'} onChange={setR1} />
        <MiniSlider label="R₂" value={R2} min={10} max={1000} step={10}
          format={v => v.toFixed(0) + ' Ω'} onChange={setR2} />
        <MiniSlider label="R_L" value={RL} min={10} max={2000} step={10}
          format={v => v.toFixed(0) + ' Ω'} onChange={setRL} />
        <MiniReadout label="V_th" value={<Num value={Vth} />} unit="V" />
        <MiniReadout label="R_th" value={<Num value={Rth} />} unit="Ω" />
        <MiniReadout label="V_load" value={<Num value={Vload} />} unit="V" />
        <MiniReadout label="I_load" value={<Num value={Iload * 1000} />} unit="mA" />
      </DemoControls>
    </Demo>
  );
}

interface ST {
  Vs: number; R1: number; R2: number; Is: number; RL: number;
  Vth: number; Rth: number; Vload: number; Iload: number;
}

function drawOriginal(
  ctx: CanvasRenderingContext2D,
  x0: number, y0: number, w: number, h: number, st: ST,
) {
  const cy = y0 + h / 2;
  const xBat = x0 + 40;
  const xR1 = x0 + w * 0.40;
  const xMid = x0 + w * 0.58;
  const xLoad = x0 + w - 40;
  const yTop = cy - 50;
  const yBot = cy + 50;

  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';

  // Top wire: battery+ → R1 → node
  ctx.beginPath();
  ctx.moveTo(xBat, yTop); ctx.lineTo(xR1 - 22, yTop); ctx.stroke();
  drawResistorH(ctx, xR1, yTop, `R₁ ${fmtR(st.R1)}`, '#ff6b2a');
  ctx.beginPath();
  ctx.moveTo(xR1 + 22, yTop); ctx.lineTo(xLoad, yTop); ctx.stroke();

  // Battery on left
  drawBattery(ctx, xBat, cy, st.Vs);

  // Bottom wire
  ctx.beginPath();
  ctx.moveTo(xBat, yBot); ctx.lineTo(xLoad, yBot); ctx.stroke();

  // R2 from node-down to ground (vertical) at xMid
  drawResistorV(ctx, xMid, cy, `R₂ ${fmtR(st.R2)}`, '#ff6b2a');
  ctx.beginPath();
  ctx.moveTo(xMid, yTop); ctx.lineTo(xMid, cy - 18); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(xMid, cy + 18); ctx.lineTo(xMid, yBot); ctx.stroke();

  // Current source between top and bottom rails at x just before R_L
  const xIs = x0 + w * 0.78;
  drawCurrentSource(ctx, xIs, cy, st.Is);
  ctx.beginPath();
  ctx.moveTo(xIs, yTop); ctx.lineTo(xIs, cy - 14); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(xIs, cy + 14); ctx.lineTo(xIs, yBot); ctx.stroke();

  // Load resistor (vertical) at xLoad
  drawResistorV(ctx, xLoad, cy, `R_L ${fmtR(st.RL)}`, '#6cc5c2');
  ctx.beginPath();
  ctx.moveTo(xLoad, yTop); ctx.lineTo(xLoad, cy - 18); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(xLoad, cy + 18); ctx.lineTo(xLoad, yBot); ctx.stroke();

  // Readout near the load
  ctx.fillStyle = 'rgba(108,197,194,0.95)';
  ctx.font = 'bold 10px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(`V_L = ${st.Vload.toFixed(2)} V`, xLoad + 12, cy - 8);
  ctx.fillStyle = 'rgba(91,174,248,0.95)';
  ctx.fillText(`I_L = ${(st.Iload * 1000).toFixed(1)} mA`, xLoad + 12, cy + 8);
}

function drawThevenin(
  ctx: CanvasRenderingContext2D,
  x0: number, y0: number, w: number, h: number, st: ST,
) {
  const cy = y0 + h / 2;
  const xBat = x0 + 50;
  const xR = x0 + w * 0.45;
  const xLoad = x0 + w - 40;
  const yTop = cy - 50;
  const yBot = cy + 50;

  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';

  // Top wire: V_th + → R_th → load
  ctx.beginPath();
  ctx.moveTo(xBat, yTop); ctx.lineTo(xR - 22, yTop); ctx.stroke();
  drawResistorH(ctx, xR, yTop, `R_th ${fmtR(st.Rth)}`, '#ff6b2a');
  ctx.beginPath();
  ctx.moveTo(xR + 22, yTop); ctx.lineTo(xLoad, yTop); ctx.stroke();

  drawBattery(ctx, xBat, cy, st.Vth, 'V_th');

  ctx.beginPath();
  ctx.moveTo(xBat, yBot); ctx.lineTo(xLoad, yBot); ctx.stroke();

  drawResistorV(ctx, xLoad, cy, `R_L ${fmtR(st.RL)}`, '#6cc5c2');
  ctx.beginPath();
  ctx.moveTo(xLoad, yTop); ctx.lineTo(xLoad, cy - 18); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(xLoad, cy + 18); ctx.lineTo(xLoad, yBot); ctx.stroke();

  ctx.fillStyle = 'rgba(108,197,194,0.95)';
  ctx.font = 'bold 10px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(`V_L = ${st.Vload.toFixed(2)} V`, xLoad + 12, cy - 8);
  ctx.fillStyle = 'rgba(91,174,248,0.95)';
  ctx.fillText(`I_L = ${(st.Iload * 1000).toFixed(1)} mA`, xLoad + 12, cy + 8);
}

function fmtR(R: number): string {
  if (R >= 1e6) return (R / 1e6).toFixed(1) + ' MΩ';
  if (R >= 1e3) return (R / 1e3).toFixed(1) + ' kΩ';
  return R.toFixed(0) + ' Ω';
}

function drawBattery(
  ctx: CanvasRenderingContext2D, x: number, y: number, V: number, label = 'V_s',
) {
  ctx.strokeStyle = 'rgba(255,255,255,0.65)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x, y - 50); ctx.lineTo(x, y - 14);
  ctx.moveTo(x, y + 14); ctx.lineTo(x, y + 50);
  ctx.stroke();
  ctx.strokeStyle = '#ff3b6e';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x - 12, y - 14); ctx.lineTo(x + 12, y - 14); ctx.stroke();
  ctx.strokeStyle = '#5baef8';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x - 7, y + 14); ctx.lineTo(x + 7, y + 14); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.font = '9px "JetBrains Mono", monospace';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${label}=${V.toFixed(1)}V`, x - 16, y);
}

function drawResistorH(
  ctx: CanvasRenderingContext2D, cx: number, cy: number, label: string, color: string,
) {
  const x0 = cx - 20, x1 = cx + 20;
  ctx.strokeStyle = color;
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
  ctx.fillStyle = color;
  ctx.font = '9px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText(label, cx, cy - 10);
}

function drawResistorV(
  ctx: CanvasRenderingContext2D, cx: number, cy: number, label: string, color: string,
) {
  const y0 = cy - 18, y1 = cy + 18;
  ctx.strokeStyle = color;
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
  ctx.fillStyle = color;
  ctx.font = '9px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, cx + 12, cy);
}

function drawCurrentSource(
  ctx: CanvasRenderingContext2D, cx: number, cy: number, I: number,
) {
  // Circle with arrow inside, pointing up (current flowing up into top rail)
  ctx.strokeStyle = 'rgba(108,197,194,0.95)';
  ctx.fillStyle = 'rgba(108,197,194,0.95)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(cx, cy, 14, 0, Math.PI * 2);
  ctx.stroke();
  // Arrow up
  ctx.beginPath();
  ctx.moveTo(cx, cy + 8);
  ctx.lineTo(cx, cy - 6);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, cy - 9);
  ctx.lineTo(cx - 4, cy - 3);
  ctx.lineTo(cx + 4, cy - 3);
  ctx.closePath();
  ctx.fill();
  ctx.font = '9px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText(`I_s=${(I * 1000).toFixed(0)}mA`, cx, cy - 18);
}
