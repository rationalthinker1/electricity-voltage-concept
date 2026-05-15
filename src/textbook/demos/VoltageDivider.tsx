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
import { renderCircuitToCanvas, type CircuitElement } from '@/lib/canvasPrimitives';
import { getCanvasColors } from '@/lib/canvasTheme';

interface Props { figure?: string }

interface StaticCacheEntry { key: string; canvas: HTMLCanvasElement }

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

  const cacheRef = useRef<StaticCacheEntry | null>(null);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, dpr } = info;
    let raf = 0;

    function draw() {
      const { Vin, R1, R2, Vout, loaded } = stateRef.current;

      ctx.fillStyle = getCanvasColors().bg;
      ctx.fillRect(0, 0, w, h);

      // Layout: schematic on the left half, bar chart on the right half
      const splitX = Math.floor(w * 0.55);

      // Cache key: schematic geometry depends on canvas size, DPR, the loaded toggle (adds a branch), and the resistor-value labels.
      const cacheKey = `${w}x${h}@${dpr}|l${loaded ? 1 : 0}|R1:${R1}|R2:${R2}`;
      if (cacheRef.current?.key !== cacheKey) {
        cacheRef.current = {
          key: cacheKey,
          canvas: buildDividerStatic(splitX, h, R1, R2, loaded, dpr),
        };
      }
      ctx.drawImage(cacheRef.current.canvas, 0, 0, splitX, h);

      // Per-frame overlay: V source glyph + V_in / V_out numeric readouts that change with the slider.
      drawDividerOverlay(ctx, 0, 0, splitX, h, Vin, Vout);

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

function dividerGeometry(w: number, h: number) {
  const margin = 20;
  return {
    margin,
    xRail: margin + 30,
    xLoad: w - margin - 30,
    xSrc: margin,
    yTop: margin + 10,
    yMid: Math.floor(h / 2),
    yBot: h - margin - 10,
    yTap: Math.floor(h / 2),
  };
}

function buildDividerStatic(
  w: number, h: number,
  R1: number, R2: number, loaded: boolean, dpr: number,
): HTMLCanvasElement {
  const { xRail, xLoad, xSrc, yTop, yMid, yBot, yTap } = dividerGeometry(w, h);

  const elements: CircuitElement[] = [
    // Top and bottom rails from the source to the trunk, then trunk top→bottom.
    { kind: 'wire',
      points: [
        { x: xSrc, y: yTop }, { x: xRail, y: yTop },
        { x: xRail, y: yBot }, { x: xSrc, y: yBot },
      ] },
    // R1 on the top half of the trunk.
    { kind: 'resistor',
      from: { x: xRail, y: yTop + 18 },
      to:   { x: xRail, y: yMid - 18 },
      color: 'rgba(255,59,110,0.9)',
      label: `R₁ = ${formatR(R1)}`,
      labelOffset: { x: 16, y: 0 } },
    // R2 on the bottom half of the trunk.
    { kind: 'resistor',
      from: { x: xRail, y: yMid + 18 },
      to:   { x: xRail, y: yBot - 6 },
      color: 'rgba(108,197,194,0.9)',
      label: `R₂ = ${formatR(R2)}`,
      labelOffset: { x: 16, y: 0 } },
    // Tap wire from the trunk midpoint out to the load column.
    { kind: 'wire', points: [{ x: xRail, y: yTap }, { x: xLoad, y: yTap }] },
    // Output probe dot at the load column.
    { kind: 'node', at: { x: xLoad, y: yTap }, color: 'rgba(255,107,42,0.95)', radius: 4 },
    // Ground symbol at the bottom of the trunk.
    { kind: 'ground', at: { x: xRail, y: yBot }, leadLength: 0, size: 12 },
  ];
  if (loaded) {
    elements.push(
      // Load branch: tap → corner, corner → ground rail.
      { kind: 'wire',
        points: [{ x: xLoad, y: yTap }, { x: xLoad, y: yTap + 24 }] },
      { kind: 'wire',
        points: [{ x: xLoad, y: yBot }, { x: xRail + 1, y: yBot }] },
      // R_L between the tap and ground.
      { kind: 'resistor',
        from: { x: xLoad, y: yTap + 24 },
        to:   { x: xLoad, y: yBot - 6 },
        color: 'rgba(91,174,248,0.9)',
        label: 'R_L = 10 kΩ',
        labelOffset: { x: 16, y: 0 } },
    );
  }
  const off = renderCircuitToCanvas(
    { elements, defaultWireColor: 'rgba(236,235,229,0.55)', defaultWireWidth: 1.4 },
    w, h, dpr,
  );

  // Bake the V-source ring glyph into the static cache as well — it never changes per frame.
  const oc = off.getContext('2d');
  if (oc) {
    oc.save();
    oc.setTransform(dpr, 0, 0, dpr, 0, 0);
    oc.strokeStyle = 'rgba(236,235,229,0.55)';
    oc.lineWidth = 1.4;
    oc.beginPath();
    oc.arc(xSrc, (yTop + yBot) / 2, 12, 0, Math.PI * 2);
    oc.stroke();
    oc.fillStyle = 'rgba(255,107,42,0.9)';
    oc.font = 'bold 10px "JetBrains Mono", monospace';
    oc.textAlign = 'center';
    oc.textBaseline = 'middle';
    oc.fillText('V', xSrc, (yTop + yBot) / 2);
    oc.restore();
  }
  return off;
}

function drawDividerOverlay(
  ctx: CanvasRenderingContext2D,
  x0: number, y0: number, w: number, h: number,
  Vin: number, Vout: number,
) {
  ctx.save();
  ctx.translate(x0, y0);
  const { xSrc, xLoad, yTop, yTap } = dividerGeometry(w, h);

  // Per-frame value labels.
  ctx.font = 'bold 10px "JetBrains Mono", monospace';
  ctx.fillStyle = getCanvasColors().accent;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(`V_in = ${Vin.toFixed(1)} V`, xSrc - 4, yTop - 12);
  ctx.fillStyle = getCanvasColors().accent;
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
  ctx.strokeStyle = getCanvasColors().border;
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
  ctx.fillStyle = getCanvasColors().pink;
  const r1Top = yOf(Vin);
  const r1Bot = yOf(Vout);
  ctx.fillRect(xA, r1Top, barW, r1Bot - r1Top);
  // R2 / V_out
  ctx.fillStyle = getCanvasColors().teal;
  const r2Top = yOf(Vout);
  const r2Bot = yOf(0);
  ctx.fillRect(xB, r2Top, barW, r2Bot - r2Top);

  // Bar labels
  ctx.fillStyle = getCanvasColors().text;
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('V across R₁', xA + barW / 2, padT + plotH + 4);
  ctx.fillText('V_out (across R₂)', xB + barW / 2, padT + plotH + 4);
  ctx.fillStyle = getCanvasColors().pink;
  ctx.textBaseline = 'bottom';
  ctx.fillText(`${VR1.toFixed(2)} V`, xA + barW / 2, r1Top - 2);
  ctx.fillStyle = getCanvasColors().teal;
  ctx.fillText(`${Vout.toFixed(3)} V`, xB + barW / 2, r2Top - 2);

  // Title
  ctx.fillStyle = getCanvasColors().textDim;
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
