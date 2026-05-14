/**
 * Demo D19.3 — Linear regulator (LM7805-style)
 *
 * A linear regulator holds V_out fixed by burning the difference between
 * V_in and V_out across an internal pass transistor. Power dissipated in
 * the regulator = (V_in − V_out) × I_load. Efficiency = V_out / V_in.
 *
 * Visualisation: a horizontal energy-flow bar. The full P_in chunk is
 * shown on the left; the slice that actually reaches the load is on the
 * right; the wasted bit (heat) is in the middle, sized proportionally.
 *
 * Constraint: if V_in − V_out < V_dropout (≈ 2 V for a 7805), the
 * regulator falls out of regulation.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';
import { drawCircuit, type CircuitElement } from '@/lib/canvasPrimitives';
import { getCanvasColors } from '@/lib/canvasTheme';

interface Props { figure?: string }

interface StaticCache { key: string; canvas: HTMLCanvasElement }

const V_OUT = 5.0;
const V_DROPOUT = 2.0;

export function LinearRegulatorDemo({ figure }: Props) {
  const [Vin, setVin]   = useState(12);    // V
  const [Iload, setIload] = useState(0.5); // A

  const regulating = (Vin - V_OUT) >= V_DROPOUT;
  const Vout = regulating ? V_OUT : Math.max(0, Vin - V_DROPOUT);
  const Pin  = Vin * Iload;
  const Pout = Vout * Iload;
  const Pdiss = Pin - Pout;
  const eta = Pout / Pin;

  const stateRef = useRef({ Vin, Iload, regulating, Vout, Pin, Pout, Pdiss, eta });
  useEffect(() => {
    stateRef.current = { Vin, Iload, regulating, Vout, Pin, Pout, Pdiss, eta };
  }, [Vin, Iload, regulating, Vout, Pin, Pout, Pdiss, eta]);

  const cacheRef = useRef<StaticCache | null>(null);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, dpr } = info;
    let raf = 0;
    let t = 0;

    function draw() {
      const { Vin, Vout, Pin, Pout, Pdiss, eta, regulating } = stateRef.current;
      t += 1 / 60;

      ctx.fillStyle = getCanvasColors().bg;
      ctx.fillRect(0, 0, w, h);

      // bar geometry
      const padL = 30, padR = 30, padT = 60, padB = 80;
      const barH = h - padT - padB;
      const barW = w - padL - padR;
      const yTop = padT;

      // input column (left), regulator box (middle), output column (right)
      const inW = barW * 0.18;
      const regW = barW * 0.30;
      const outW = barW * 0.18;
      const gap = (barW - inW - regW - outW) / 2;

      const xIn = padL;
      const xReg = padL + inW + gap;
      const xOut = padL + inW + gap + regW + gap;

      // Cache key invalidates on resize / DPR change and whenever the regulating
      // flag flips (which swaps the regulator block fill + stroke colour).
      const cacheKey = `${w}x${h}@${dpr}|r${regulating ? 1 : 0}`;
      if (cacheRef.current?.key !== cacheKey) {
        // The static layer is everything whose geometry & colour does not depend
        // on slider numbers: full P_in bar fill, regulator block fill/outline,
        // chip name + state badge, the two flow arrows, header axis labels, footer.
        const off = document.createElement('canvas');
        off.width = Math.max(1, Math.floor(w * dpr));
        off.height = Math.max(1, Math.floor(h * dpr));
        const sctx = off.getContext('2d')!;
        sctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // Input bar (full P_in column).
        sctx.fillStyle = getCanvasColors().accent;
        sctx.fillRect(xIn, yTop, inW, barH);
        // P_in header.
        sctx.fillStyle = getCanvasColors().text;
        sctx.font = 'bold 13px "JetBrains Mono", monospace';
        sctx.textAlign = 'center'; sctx.textBaseline = 'bottom';
        sctx.fillText('P_in', xIn + inW / 2, yTop - 22);

        // Regulator block.
        sctx.fillStyle = regulating ? 'rgba(108,197,194,0.20)' : 'rgba(255,59,110,0.25)';
        sctx.fillRect(xReg, yTop, regW, barH);
        sctx.strokeStyle = regulating ? 'rgba(108,197,194,0.85)' : 'rgba(255,59,110,0.85)';
        sctx.lineWidth = 1.5;
        sctx.strokeRect(xReg, yTop, regW, barH);
        sctx.fillStyle = getCanvasColors().text;
        sctx.font = 'bold 12px "DM Sans", sans-serif';
        sctx.textAlign = 'center'; sctx.textBaseline = 'middle';
        sctx.fillText('LM7805', xReg + regW / 2, yTop + barH / 2 - 26);
        sctx.font = '10px "DM Sans", sans-serif';
        sctx.fillStyle = regulating ? '#6cc5c2' : '#ff3b6e';
        sctx.fillText(regulating ? 'regulating' : 'in dropout', xReg + regW / 2, yTop + barH / 2 - 10);

        // "(burned as heat)" caption sits below the wiggle and never moves.
        sctx.font = '10px "JetBrains Mono", monospace';
        sctx.fillStyle = getCanvasColors().textDim;
        sctx.fillText('(burned as heat)', xReg + regW / 2, yTop + barH / 2 + 30);

        // P_out header.
        sctx.fillStyle = getCanvasColors().text;
        sctx.font = 'bold 13px "JetBrains Mono", monospace';
        sctx.textAlign = 'center'; sctx.textBaseline = 'bottom';
        sctx.fillText('P_out', xOut + outW / 2, yTop - 22);

        // Source → regulator → load energy-flow arrows (purely geometric).
        const flowArrows: CircuitElement[] = [
          { kind: 'arrow',
            from: { x: xIn + inW + 6, y: yTop + barH / 2 },
            to:   { x: xReg - 4,      y: yTop + barH / 2 },
            color: '#ecebe5', lineWidth: 1.4, headLength: 6, headWidth: 4 },
          { kind: 'arrow',
            from: { x: xReg + regW + 4, y: yTop + barH / 2 },
            to:   { x: xOut - 6,        y: yTop + barH / 2 },
            color: '#ecebe5', lineWidth: 1.4, headLength: 6, headWidth: 4 },
        ];
        // We already used the offscreen context to draw the static rectangles;
        // route the arrows through the same offscreen ctx so everything bakes into
        // a single image we can drawImage in one call per frame.
        drawCircuit(sctx, { elements: flowArrows });

        // Footer rule.
        sctx.fillStyle = 'rgba(160,158,149,0.55)';
        sctx.font = '9px "JetBrains Mono", monospace';
        sctx.textAlign = 'center'; sctx.textBaseline = 'bottom';
        sctx.fillText(
          'Linear regulator: η = V_out / V_in.  Dropout requires V_in − V_out ≥ ~2 V.',
          w / 2, h - 8,
        );

        cacheRef.current = { key: cacheKey, canvas: off };
      }
      ctx.drawImage(cacheRef.current.canvas, 0, 0, w, h);

      // Dynamic overlay: live P_in / Vin numbers under the input column.
      ctx.fillStyle = getCanvasColors().text;
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      ctx.fillText(`${Pin.toFixed(2)} W`, xIn + inW / 2, yTop - 6);
      ctx.textBaseline = 'top';
      ctx.fillStyle = getCanvasColors().textDim;
      ctx.fillText(`${Vin.toFixed(1)} V × I_load`, xIn + inW / 2, yTop + barH + 6);

      // Dynamic overlay: animated heat wiggle + P_diss readout in the regulator.
      const heatFrac = Math.min(1, Pdiss / Math.max(Pin, 0.01));
      const wig = Math.sin(t * 5) * 3;
      ctx.fillStyle = `rgba(255, ${107 - heatFrac * 80}, ${42 - heatFrac * 30}, ${0.4 + heatFrac * 0.5})`;
      ctx.font = 'bold 12px "JetBrains Mono", monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(`P_diss = ${Pdiss.toFixed(2)} W`, xReg + regW / 2, yTop + barH / 2 + 12 + wig);

      // Dynamic overlay: output bar height = Pout / Pin fraction.
      const outBarH = Math.max(2, barH * (Pout / Math.max(Pin, 0.01)));
      ctx.fillStyle = getCanvasColors().teal;
      ctx.fillRect(xOut, yTop + (barH - outBarH), outW, outBarH);

      // Dynamic overlay: live P_out / Vout numbers under the output column.
      ctx.fillStyle = getCanvasColors().text;
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      ctx.fillText(`${Pout.toFixed(2)} W`, xOut + outW / 2, yTop - 6);
      ctx.textBaseline = 'top';
      ctx.fillStyle = getCanvasColors().textDim;
      ctx.fillText(`${Vout.toFixed(2)} V × I_load`, xOut + outW / 2, yTop + barH + 6);

      // Dynamic overlay: efficiency badge.
      ctx.fillStyle = getCanvasColors().textDim;
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText(`η = P_out / P_in = ${(eta * 100).toFixed(1)} %`, w / 2, 12);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 19.3'}
      title="Linear regulator: V_in − V_out, burned as heat"
      question="At 12 V in and 0.5 A out, how much of the power becomes useful 5 V — and where does the rest go?"
      caption={<>
        A linear regulator like the LM7805 is essentially a variable resistor that adjusts itself
        to keep V<sub>out</sub> = 5 V. Every joule it absorbs above the output voltage shows up as
        heat in the package — which is why these chips need heatsinks above a few hundred milliamps
        and lose to switchers above ~50% step-down ratios.
      </>}
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="V_in"
          value={Vin} min={6} max={24} step={0.1}
          format={v => v.toFixed(1) + ' V'}
          onChange={setVin}
        />
        <MiniSlider
          label="I_load"
          value={Iload} min={0.01} max={1.5} step={0.01}
          format={v => v >= 1 ? v.toFixed(2) + ' A' : (v * 1000).toFixed(0) + ' mA'}
          onChange={setIload}
        />
        <MiniReadout label="V_out"  value={<Num value={Vout} />}  unit="V" />
        <MiniReadout label="P_diss" value={<Num value={Pdiss} />} unit="W" />
        <MiniReadout label="η"      value={(eta * 100).toFixed(1)} unit="%" />
      </DemoControls>
    </Demo>
  );
}
