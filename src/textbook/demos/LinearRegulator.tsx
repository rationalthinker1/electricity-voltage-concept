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
import { useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';
import { drawLabel } from '@/lib/canvasLayout';
import { drawCircuit, type CircuitElement } from '@/lib/canvasPrimitives';
import { getCanvasColors, withAlpha } from '@/lib/canvasTheme';
import { useCanvasCache } from '@/lib/useCanvasCache';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

interface Props {
  figure?: string;
}

const V_OUT = 5.0;
const V_DROPOUT = 2.0;

export function LinearRegulatorDemo({ figure }: Props) {
  const [Vin, setVin] = useState(12); // V
  const [Iload, setIload] = useState(0.5); // A

  const regulating = Vin - V_OUT >= V_DROPOUT;
  const Vout = regulating ? V_OUT : Math.max(0, Vin - V_DROPOUT);
  const Pin = Vin * Iload;
  const Pout = Vout * Iload;
  const Pdiss = Pin - Pout;
  const eta = Pout / Pin;

  const stateRef = useSimState({ Vin, Iload, regulating, Vout, Pin, Pout, Pdiss, eta });

  // Static layer (input bar, regulator block, headers, flow arrows, footer)
  // rebakes only when `regulating` flips (swaps the regulator block colour)
  // or the canvas resizes. The bake is raw fillRect/fillText — not a circuit
  // diagram — so useCanvasCache fits, not useCircuitCache.
  const getStatic = useCanvasCache(
    (octx, sw, sh, _dpr) => {
      const colors = getCanvasColors();
      const padL = 30,
        padR = 30,
        padT = 60,
        padB = 80;
      const barH = sh - padT - padB;
      const barW = sw - padL - padR;
      const yTop = padT;
      const inW = barW * 0.18;
      const regW = barW * 0.3;
      const outW = barW * 0.18;
      const gap = (barW - inW - regW - outW) / 2;
      const xIn = padL;
      const xReg = padL + inW + gap;
      const xOut = padL + inW + gap + regW + gap;

      // Input bar.
      octx.fillStyle = colors.accent;
      octx.fillRect(xIn, yTop, inW, barH);
      octx.fillStyle = colors.text;
      octx.font = 'bold 13px "JetBrains Mono", monospace';
      octx.textAlign = 'center';
      octx.textBaseline = 'bottom';
      octx.fillText('P_in', xIn + inW / 2, yTop - 22);

      // Regulator block.
      octx.fillStyle = regulating ? withAlpha(colors.teal, 0.2) : withAlpha(colors.pink, 0.25);
      octx.fillRect(xReg, yTop, regW, barH);
      octx.strokeStyle = regulating ? withAlpha(colors.teal, 0.85) : withAlpha(colors.pink, 0.85);
      octx.lineWidth = 1.5;
      octx.strokeRect(xReg, yTop, regW, barH);
      octx.fillStyle = colors.text;
      octx.font = 'bold 12px "DM Sans", sans-serif';
      octx.textAlign = 'center';
      octx.textBaseline = 'middle';
      octx.fillText('LM7805', xReg + regW / 2, yTop + barH / 2 - 26);
      octx.font = '10px "DM Sans", sans-serif';
      octx.fillStyle = regulating ? colors.teal : colors.pink;
      octx.fillText(
        regulating ? 'regulating' : 'in dropout',
        xReg + regW / 2,
        yTop + barH / 2 - 10,
      );

      octx.font = '10px "JetBrains Mono", monospace';
      octx.fillStyle = colors.textDim;
      octx.fillText('(burned as heat)', xReg + regW / 2, yTop + barH / 2 + 30);

      // P_out header.
      octx.fillStyle = colors.text;
      octx.font = 'bold 13px "JetBrains Mono", monospace';
      octx.textAlign = 'center';
      octx.textBaseline = 'bottom';
      octx.fillText('P_out', xOut + outW / 2, yTop - 22);

      // Flow arrows (source → regulator → load).
      const flowArrows: CircuitElement[] = [
        {
          kind: 'arrow',
          from: { x: xIn + inW + 6, y: yTop + barH / 2 },
          to: { x: xReg - 4, y: yTop + barH / 2 },
          color: colors.text,
          lineWidth: 1.4,
          headLength: 6,
          headWidth: 4,
        },
        {
          kind: 'arrow',
          from: { x: xReg + regW + 4, y: yTop + barH / 2 },
          to: { x: xOut - 6, y: yTop + barH / 2 },
          color: colors.text,
          lineWidth: 1.4,
          headLength: 6,
          headWidth: 4,
        },
      ];
      drawCircuit(octx, { elements: flowArrows });

      // Footer caption.
      octx.save();
      octx.globalAlpha = 0.55;
      octx.fillStyle = colors.textDim;
      octx.font = '9px "JetBrains Mono", monospace';
      octx.textAlign = 'center';
      octx.textBaseline = 'bottom';
      octx.fillText(
        'Linear regulator: η = V_out / V_in.  Dropout requires V_in − V_out ≥ ~2 V.',
        sw / 2,
        sh - 8,
      );
      octx.restore();
    },
    [regulating],
  );

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, dpr }, state, _dt, simTime) => {
      const { Vin, Vout, Pin, Pout, Pdiss, eta } = state;
      const t = simTime;

      ctx.fillStyle = getCanvasColors().bg;
      ctx.fillRect(0, 0, w, h);

      // bar geometry
      const padL = 30,
        padR = 30,
        padT = 60,
        padB = 80;
      const barH = h - padT - padB;
      const barW = w - padL - padR;
      const yTop = padT;

      // input column (left), regulator box (middle), output column (right)
      const inW = barW * 0.18;
      const regW = barW * 0.3;
      const outW = barW * 0.18;
      const gap = (barW - inW - regW - outW) / 2;

      const xIn = padL;
      const xReg = padL + inW + gap;
      const xOut = padL + inW + gap + regW + gap;

      // Cache key invalidates on resize / DPR change and whenever the regulating
      // flag flips (which swaps the regulator block fill + stroke colour).
      const off = getStatic(w, h, dpr);
      if (off) ctx.drawImage(off, 0, 0, w, h);

      // Dynamic overlay: live P_in / Vin numbers under the input column.
      ctx.fillStyle = getCanvasColors().text;
      drawLabel(ctx, { text: `${Pin.toFixed(2)} W`, x: xIn + inW / 2, y: yTop - 6, size: 11, font: '11px "JetBrains Mono", monospace', align: 'center', baseline: 'bottom' });
      ctx.fillStyle = getCanvasColors().textDim;
      drawLabel(ctx, { text: `${Vin.toFixed(1)} V × I_load`, x: xIn + inW / 2, y: yTop + barH + 6, size: 11, font: '11px "JetBrains Mono", monospace', align: 'center', baseline: 'top' });

      // Dynamic overlay: animated heat wiggle + P_diss readout in the regulator.
      const heatFrac = Math.min(1, Pdiss / Math.max(Pin, 0.01));
      const wig = Math.sin(t * 5) * 3;
      ctx.fillStyle = `rgba(255, ${107 - heatFrac * 80}, ${42 - heatFrac * 30}, ${0.4 + heatFrac * 0.5})`;
      drawLabel(ctx, { text: `P_diss = ${Pdiss.toFixed(2)} W`, x: xReg + regW / 2, y: yTop + barH / 2 + 12 + wig, weight: 'bold', size: 12, font: 'bold 12px "JetBrains Mono", monospace', align: 'center', baseline: 'middle' });

      // Dynamic overlay: output bar height = Pout / Pin fraction.
      const outBarH = Math.max(2, barH * (Pout / Math.max(Pin, 0.01)));
      ctx.fillStyle = getCanvasColors().teal;
      ctx.fillRect(xOut, yTop + (barH - outBarH), outW, outBarH);

      // Dynamic overlay: live P_out / Vout numbers under the output column.
      ctx.fillStyle = getCanvasColors().text;
      drawLabel(ctx, { text: `${Pout.toFixed(2)} W`, x: xOut + outW / 2, y: yTop - 6, size: 11, font: '11px "JetBrains Mono", monospace', align: 'center', baseline: 'bottom' });
      ctx.fillStyle = getCanvasColors().textDim;
      drawLabel(ctx, { text: `${Vout.toFixed(2)} V × I_load`, x: xOut + outW / 2, y: yTop + barH + 6, size: 11, font: '11px "JetBrains Mono", monospace', align: 'center', baseline: 'top' });

      // Dynamic overlay: efficiency badge.
      drawLabel(ctx, {
        x: w / 2,
        y: 12,
        text: `η = P_out / P_in = ${(eta * 100).toFixed(1)} %`,
        color: getCanvasColors().textDim,
        size: 11,
        align: 'center',
        baseline: 'top',
      });
    },
    [getStatic],
  );

  return (
    <Demo
      figure={figure ?? 'Fig. 24.3'}
      title="Linear regulator: V_in − V_out, burned as heat"
      question="At 12 V in and 0.5 A out, how much of the power becomes useful 5 V — and where does the rest go?"
      caption={
        <>
          A linear regulator like the LM7805 is essentially a variable resistor that adjusts itself
          to keep V<sub>out</sub> = 5 V. Every joule it absorbs above the output voltage shows up as
          heat in the package — which is why these chips need heatsinks above a few hundred
          milliamps and lose to switchers above ~50% step-down ratios.
        </>
      }
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="V_in"
          value={Vin}
          min={6}
          max={24}
          step={0.1}
          format={(v) => v.toFixed(1) + ' V'}
          onChange={setVin}
        />
        <MiniSlider
          label="I_load"
          value={Iload}
          min={0.01}
          max={1.5}
          step={0.01}
          format={(v) => (v >= 1 ? v.toFixed(2) + ' A' : (v * 1000).toFixed(0) + ' mA')}
          onChange={setIload}
        />
        <MiniReadout label="V_out" value={<Num value={Vout} />} unit="V" />
        <MiniReadout label="P_diss" value={<Num value={Pdiss} />} unit="W" />
        <MiniReadout label="η" value={(eta * 100).toFixed(1)} unit="%" />
      </DemoControls>
    </Demo>
  );
}
