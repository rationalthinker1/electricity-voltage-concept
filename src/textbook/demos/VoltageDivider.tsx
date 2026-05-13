/**
 * Demo D12.0 — Voltage divider, with optional load
 *
 *   V_out = V_in · R2 / (R1 + R2)        (no load)
 *   V_out = V_in · (R2 ∥ R_L) / (R1 + R2 ∥ R_L)   (with load R_L)
 *
 * Two side-by-side schematics: unloaded on the left, with a 10 kΩ load on
 * the right. The reader scrubs R1, R2, V_in and watches V_out and the
 * dissipated power in each resistor. Toggling the load attached to the
 * output reveals "loading" — the signature reason every sensor circuit
 * uses an op-amp buffer.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import {
  Demo, DemoControls, MiniReadout, MiniSlider, MiniToggle,
} from '@/components/Demo';
import { Num } from '@/components/Num';
import { drawResistor, drawWire } from '@/lib/canvasPrimitives';

interface Props { figure?: string }

export function VoltageDividerDemo({ figure }: Props) {
  const [Vin, setVin] = useState(9);     // V
  const [R1k, setR1k] = useState(1);     // kΩ
  const [R2k, setR2k] = useState(2);     // kΩ
  const [loaded, setLoaded] = useState(false);

  const R1 = R1k * 1e3;
  const R2 = R2k * 1e3;
  const RL = 10e3;  // fixed 10 kΩ load when enabled

  // Effective lower-leg resistance
  const R2eff = loaded ? (R2 * RL) / (R2 + RL) : R2;
  const Vout = Vin * R2eff / (R1 + R2eff);
  const Itotal = Vin / (R1 + R2eff);
  const P1 = Itotal * Itotal * R1;
  // Power in lower leg = V_out^2 / R2eff (covers both R2 and load if present)
  const P2eff = (Vout * Vout) / R2eff;

  const stateRef = useRef({ Vin, R1, R2, Vout, loaded, Itotal });
  useEffect(() => {
    stateRef.current = { Vin, R1, R2, Vout, loaded, Itotal };
  }, [Vin, R1, R2, Vout, loaded, Itotal]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h } = info;
    let raf = 0;

    function draw() {
      const { Vin, R1, R2, Vout, loaded } = stateRef.current;

      ctx.fillStyle = '#0d0d10';
      ctx.fillRect(0, 0, w, h);

      // Layout: schematic on the left half, bar chart on the right half
      const splitX = Math.floor(w * 0.55);

      drawDivider(ctx, 0, 0, splitX, h, Vin, R1, R2, Vout, loaded);
      drawBars(ctx, splitX, 0, w - splitX, h, Vin, Vout);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Predicted unloaded value for comparison readout
  const VoutUnloaded = Vin * R2 / (R1 + R2);

  return (
    <Demo
      figure={figure ?? 'Fig. 12.0'}
      title="The voltage divider — and what 'loading' does to it"
      question="With no load, V_out = V_in · R₂/(R₁+R₂). Attach a 10 kΩ load — what happens?"
      caption={<>
        Two resistors in series across V<sub>in</sub>; the output is the voltage across the
        lower one. Without a load, the divider is exact: V<sub>out</sub> = V<sub>in</sub>·R₂/(R₁+R₂).
        Connect a real input (here a 10 kΩ load), and the lower leg becomes R₂ ∥ R<sub>L</sub> — the
        divider sags. The closer R<sub>L</sub> gets to R₂, the worse the sag. This is exactly why a
        sensor that hands its output to an ADC almost always uses an op-amp buffer first.
      </>}
    >
      <AutoResizeCanvas height={280} setup={setup} />
      <DemoControls>
        <MiniSlider label="V_in" value={Vin} min={0} max={24} step={0.5}
          format={v => v.toFixed(1) + ' V'} onChange={setVin} />
        <MiniSlider label="R₁" value={R1k} min={0.1} max={20} step={0.1}
          format={v => v.toFixed(1) + ' kΩ'} onChange={setR1k} />
        <MiniSlider label="R₂" value={R2k} min={0.1} max={20} step={0.1}
          format={v => v.toFixed(1) + ' kΩ'} onChange={setR2k} />
        <MiniToggle
          label={loaded ? 'Load: 10 kΩ' : 'No load'}
          checked={loaded}
          onChange={setLoaded}
        />
        <MiniReadout label="V_out (ideal)" value={<Num value={VoutUnloaded} digits={3} />} unit="V" />
        <MiniReadout label="V_out (actual)" value={<Num value={Vout} digits={3} />} unit="V" />
        <MiniReadout label="P in R₁" value={<Num value={P1} />} unit="W" />
        <MiniReadout label="P in lower leg" value={<Num value={P2eff} />} unit="W" />
      </DemoControls>
    </Demo>
  );
}

/* ─── Schematic rendering ─────────────────────────────────────────────── */

function drawDivider(
  ctx: CanvasRenderingContext2D,
  x0: number, y0: number, w: number, h: number,
  Vin: number, R1: number, R2: number, Vout: number, loaded: boolean,
) {
  ctx.save();
  ctx.translate(x0, y0);

  const margin = 20;
  const xRail = margin + 30;          // x of the divider trunk
  const xLoad = w - margin - 30;      // x of the load branch (if any)
  const yTop = margin + 10;
  const yMid = Math.floor(h / 2);
  const yBot = h - margin - 10;

  // Wires (trunk)
  drawWire(ctx, [{ x: xRail, y: yTop }, { x: xRail, y: yBot }], {
    color: 'rgba(236,235,229,0.55)',
    lineWidth: 1.4,
  });

  // V_in source: drawn as a small circle on the left
  const xSrc = margin;
  drawWire(ctx, [{ x: xSrc, y: yTop }, { x: xRail, y: yTop }], {
    color: 'rgba(236,235,229,0.55)',
    lineWidth: 1.4,
  });
  drawWire(ctx, [{ x: xSrc, y: yBot }, { x: xRail, y: yBot }], {
    color: 'rgba(236,235,229,0.55)',
    lineWidth: 1.4,
  });

  ctx.beginPath();
  ctx.arc(xSrc, (yTop + yBot) / 2, 12, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,107,42,0.9)';
  ctx.font = 'bold 10px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('V', xSrc, (yTop + yBot) / 2);

  // Ground symbol at bottom
  ctx.strokeStyle = 'rgba(160,158,149,0.7)';
  ctx.beginPath();
  ctx.moveTo(xRail - 6, yBot); ctx.lineTo(xRail + 6, yBot);
  ctx.moveTo(xRail - 4, yBot + 3); ctx.lineTo(xRail + 4, yBot + 3);
  ctx.moveTo(xRail - 2, yBot + 6); ctx.lineTo(xRail + 2, yBot + 6);
  ctx.stroke();

  // R1 resistor box (top half)
  drawResistor(ctx, { x: xRail, y: yTop + 18 }, { x: xRail, y: yMid - 18 }, {
    color: 'rgba(255,59,110,0.9)',
    label: `R₁ = ${formatR(R1)}`,
    labelOffset: { x: 16, y: 0 },
  });
  // R2 resistor box (bottom half)
  drawResistor(ctx, { x: xRail, y: yMid + 18 }, { x: xRail, y: yBot - 6 }, {
    color: 'rgba(108,197,194,0.9)',
    label: `R₂ = ${formatR(R2)}`,
    labelOffset: { x: 16, y: 0 },
  });

  // V_out tap at yMid going right
  const yTap = yMid;
  drawWire(ctx, [{ x: xRail, y: yTap }, { x: xLoad, y: yTap }], {
    color: 'rgba(236,235,229,0.55)',
    lineWidth: 1.4,
  });

  // Probe node at the load X
  ctx.fillStyle = 'rgba(255,107,42,0.95)';
  ctx.beginPath();
  ctx.arc(xLoad, yTap, 4, 0, Math.PI * 2);
  ctx.fill();

  // If loaded, draw R_L between tap and ground
  if (loaded) {
    drawWire(ctx, [{ x: xLoad, y: yTap }, { x: xLoad, y: yTap + 24 }], {
      color: 'rgba(236,235,229,0.55)',
      lineWidth: 1.4,
    });
    drawWire(ctx, [{ x: xLoad, y: yBot }, { x: xRail + 1, y: yBot }], {
      color: 'rgba(236,235,229,0.55)',
      lineWidth: 1.4,
    });
    drawResistor(ctx, { x: xLoad, y: yTap + 24 }, { x: xLoad, y: yBot - 6 }, {
      color: 'rgba(91,174,248,0.9)',
      label: 'R_L = 10 kΩ',
      labelOffset: { x: 16, y: 0 },
    });
  }

  // Labels
  ctx.fillStyle = 'rgba(255,107,42,0.9)';
  ctx.font = 'bold 10px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(`V_in = ${Vin.toFixed(1)} V`, xSrc - 4, yTop - 12);
  ctx.fillStyle = 'rgba(255,107,42,0.95)';
  ctx.textAlign = 'left';
  ctx.fillText(`V_out = ${Vout.toFixed(3)} V`, xLoad + 8, yTap);

  ctx.restore();
}

/* ─── Bar chart of voltage drops ──────────────────────────────────────── */

function drawBars(
  ctx: CanvasRenderingContext2D,
  x0: number, y0: number, w: number, h: number,
  Vin: number, Vout: number,
) {
  ctx.save();
  ctx.translate(x0, y0);

  const padL = 20, padR = 20, padT = 24, padB = 30;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;

  // Scale: top of plot represents V_in
  const vmax = Math.max(Vin, 1e-3);
  const yOf = (v: number) => padT + plotH - (v / vmax) * plotH;

  // Frame
  ctx.strokeStyle = 'rgba(255,255,255,0.10)';
  ctx.strokeRect(padL, padT, plotW, plotH);

  // Tick: V_in line
  ctx.fillStyle = 'rgba(160,158,149,0.6)';
  ctx.font = '9px "JetBrains Mono", monospace';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${Vin.toFixed(1)} V`, padL - 4, yOf(Vin));
  ctx.fillText('0', padL - 4, yOf(0));

  // Bars: V_R1 (top portion of V_in) and V_R2 (= V_out)
  const VR1 = Vin - Vout;

  const barW = Math.min(48, plotW / 4);
  const xA = padL + plotW * 0.25 - barW / 2;
  const xB = padL + plotW * 0.65 - barW / 2;

  // R1 drop
  ctx.fillStyle = 'rgba(255,59,110,0.7)';
  const r1Top = yOf(Vin);
  const r1Bot = yOf(Vout);
  ctx.fillRect(xA, r1Top, barW, r1Bot - r1Top);
  // R2 / V_out
  ctx.fillStyle = 'rgba(108,197,194,0.85)';
  const r2Top = yOf(Vout);
  const r2Bot = yOf(0);
  ctx.fillRect(xB, r2Top, barW, r2Bot - r2Top);

  // Bar labels
  ctx.fillStyle = 'rgba(236,235,229,0.9)';
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('V across R₁', xA + barW / 2, padT + plotH + 4);
  ctx.fillText('V_out (across R₂)', xB + barW / 2, padT + plotH + 4);
  ctx.fillStyle = 'rgba(255,59,110,0.95)';
  ctx.textBaseline = 'bottom';
  ctx.fillText(`${VR1.toFixed(2)} V`, xA + barW / 2, r1Top - 2);
  ctx.fillStyle = 'rgba(108,197,194,0.95)';
  ctx.fillText(`${Vout.toFixed(3)} V`, xB + barW / 2, r2Top - 2);

  // Title
  ctx.fillStyle = 'rgba(160,158,149,0.85)';
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('KVL: V_in = V_R₁ + V_out', padL, 6);

  ctx.restore();
}

function formatR(R: number): string {
  if (R >= 1e6) return (R / 1e6).toFixed(2) + ' MΩ';
  if (R >= 1e3) return (R / 1e3).toFixed(2) + ' kΩ';
  return R.toFixed(0) + ' Ω';
}
