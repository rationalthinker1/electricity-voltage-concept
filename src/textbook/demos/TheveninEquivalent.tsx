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
import { useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, EquationStrip, MiniReadout, MiniSlider } from '@/components/Demo';
import { M } from '@/components/Formula';
import { Num } from '@/components/Num';
import { type CircuitElement } from '@/lib/canvasPrimitives';
import { getCanvasColors, withAlpha } from '@/lib/canvasTheme';
import { fmtResistance } from '@/lib/formatters';
import { useCircuitCache } from '@/lib/useCircuitCache';
import { drawLabel } from '@/lib/canvasLayout';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

interface Props {
  figure: string;
}

export function TheveninEquivalentDemo({ figure }: Props) {
  const [Vs, setVs] = useState(12); // V
  const [R1, setR1] = useState(100); // Ω
  const [R2, setR2] = useState(200); // Ω
  const [Is_mA, setIs_mA] = useState(20); // mA
  const [RL, setRL] = useState(300); // Ω

  const Is = Is_mA * 1e-3; // A
  const parallel = (R1 * R2) / (R1 + R2);
  const Vth = Vs * (R2 / (R1 + R2)) + Is * parallel;
  const Rth = parallel;
  // Load voltage and current via Thévenin (or original, equivalent)
  const Iload = Vth / (Rth + RL);
  const Vload = Iload * RL;

  const stateRef = useSimState({ Vs, R1, R2, Is, RL, Vth, Rth, Vload, Iload });

  // Static schematic backdrop — re-bakes when any slider value (and therefore
  // any component label) changes, or when the canvas resizes.
  const getStaticSchematic = useCircuitCache(
    (sw, sh, _dpr) => {
      const colors = getCanvasColors();
      return {
        elements: [
          ...buildOriginalElements(0, 22, sw / 2, sh - 22, colors, {
            Vs,
            R1,
            R2,
            Is,
            RL,
            Vth,
            Rth,
            Vload,
            Iload,
          }),
          ...buildTheveninElements(sw / 2, 22, sw / 2, sh - 22, colors, {
            Vs,
            R1,
            R2,
            Is,
            RL,
            Vth,
            Rth,
            Vload,
            Iload,
          }),
        ] as CircuitElement[],
      };
    },
    [Vs, R1, R2, Is, RL, Vth, Rth, Vload, Iload],
  );

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, dpr, colors }, state) => {
      const st = state;

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      const splitX = w / 2;

      const off = getStaticSchematic(w, h, dpr);
      if (off) ctx.drawImage(off, 0, 0, w, h);

      // Panel titles + dividing line + load-side readouts. Used to be baked
      // into the offscreen canvas after renderCircuitToCanvas; now drawn
      // per-frame so the cache can stay a plain CircuitSpec. The cost is a
      // handful of ctx calls, negligible next to the cache blit it replaces.
      ctx.strokeStyle = withAlpha(colors.border, 0.1);
      ctx.beginPath();
      ctx.moveTo(splitX, 14);
      ctx.lineTo(splitX, h - 14);
      ctx.stroke();

      ctx.fillStyle = withAlpha(colors.textDim, 0.85);
      drawLabel(ctx, {
        text: 'Original network',
        x: splitX / 2,
        y: 6,
        font: '10px "JetBrains Mono", monospace',
        align: 'center',
        baseline: 'top',
      });
      drawLabel(ctx, {
        text: 'Thévenin equivalent',
        x: splitX + splitX / 2,
        y: 6,
        font: '10px "JetBrains Mono", monospace',
        align: 'center',
        baseline: 'top',
      });

      drawLoadReadouts(ctx, colors, 0, 22, splitX, h - 22, st);
      drawLoadReadouts(ctx, colors, splitX, 22, splitX, h - 22, st);
    },
    [getStaticSchematic],
  );

  return (
    <Demo
      figure={figure}
      title="Thévenin equivalent of a two-source network"
      question="The two circuits load the same R_L. Do they ever disagree?"
      deeperLab={{ slug: 'ac-impedance', label: 'See full lab' }}
      caption={
        <>
          Left: a voltage source V<sub>s</sub> and a current source I<sub>s</sub> wrapped around two
          resistors, feeding a load R<sub>L</sub>. Right: the same network compressed to a single
          Thévenin source V<sub>th</sub> in series with R<sub>th</sub>. Slide any parameter — the
          two circuits always show the same V<sub>load</sub> and I<sub>load</sub>. Any linear
          two-terminal network reduces to this pair of numbers.
        </>
      }
    >
      <AutoResizeCanvas height={280} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="V_s"
          value={Vs}
          min={0}
          max={24}
          step={0.5}
          format={(v) => v.toFixed(1) + ' V'}
          onChange={setVs}
        />
        <MiniSlider
          label="I_s"
          value={Is_mA}
          min={0}
          max={100}
          step={1}
          format={(v) => v.toFixed(0) + ' mA'}
          onChange={setIs_mA}
        />
        <MiniSlider
          label="R₁"
          value={R1}
          min={10}
          max={1000}
          step={10}
          format={(v) => v.toFixed(0) + ' Ω'}
          onChange={setR1}
        />
        <MiniSlider
          label="R₂"
          value={R2}
          min={10}
          max={1000}
          step={10}
          format={(v) => v.toFixed(0) + ' Ω'}
          onChange={setR2}
        />
        <MiniSlider
          label="R_L"
          value={RL}
          min={10}
          max={2000}
          step={10}
          format={(v) => v.toFixed(0) + ' Ω'}
          onChange={setRL}
        />
        <MiniReadout label="V_th" value={<Num value={Vth} />} unit="V" />
        <MiniReadout label="R_th" value={<Num value={Rth} />} unit="Ω" />
        <MiniReadout label="V_load" value={<Num value={Vload} />} unit="V" />
        <MiniReadout label="I_load" value={<Num value={Iload * 1000} />} unit="mA" />
      </DemoControls>
      <EquationStrip
        leftLabel="Thévenin equivalent"
        left={
          <M
            tex={`V_\\text{th} = ${Vth.toFixed(2)}\\,\\text{V},\\quad R_\\text{th} = ${Rth.toFixed(1)}\\,\\Omega`}
          />
        }
        rightLabel="Load voltage"
        right={
          <M
            tex={`V_\\text{load} = V_\\text{th}\\dfrac{R_L}{R_\\text{th}+R_L} = ${Vload.toFixed(2)}\\,\\text{V}`}
          />
        }
      />
    </Demo>
  );
}

interface ST {
  Vs: number;
  R1: number;
  R2: number;
  Is: number;
  RL: number;
  Vth: number;
  Rth: number;
  Vload: number;
  Iload: number;
}

function buildOriginalElements(
  x0: number,
  y0: number,
  w: number,
  h: number,
  colors: import('@/lib/canvasTheme').ThemeColors,
  st: ST,
): CircuitElement[] {
  const cy = y0 + h / 2;
  const xBat = x0 + 40;
  const xR1 = x0 + w * 0.4;
  const xMid = x0 + w * 0.58;
  const xLoad = x0 + w - 40;
  const yTop = cy - 50;
  const yBot = cy + 50;

  const xIs = x0 + w * 0.78;

  // Two-source network: V_s + R_1 series, R_2 shunt, I_s parallel, R_L load.
  return [
    {
      kind: 'wire',
      points: [
        { x: xBat, y: yTop },
        { x: xR1 - 22, y: yTop },
      ],
    },
    {
      kind: 'resistor',
      from: { x: xR1 - 20, y: yTop },
      to: { x: xR1 + 20, y: yTop },
      color: colors.accent,
      label: `R₁ ${fmtResistance(st.R1)}`,
      labelOffset: { x: 0, y: -10 },
    },
    {
      kind: 'wire',
      points: [
        { x: xR1 + 22, y: yTop },
        { x: xLoad, y: yTop },
      ],
    },
    { kind: 'battery', at: { x: xBat, y: cy }, label: `V_s=${st.Vs.toFixed(1)}V`, leadLength: 50 },
    {
      kind: 'wire',
      points: [
        { x: xBat, y: yBot },
        { x: xLoad, y: yBot },
      ],
    },
    {
      kind: 'resistor',
      from: { x: xMid, y: cy - 18 },
      to: { x: xMid, y: cy + 18 },
      color: colors.accent,
      label: `R₂ ${fmtResistance(st.R2)}`,
      labelOffset: { x: 12, y: 0 },
    },
    {
      kind: 'wire',
      points: [
        { x: xMid, y: yTop },
        { x: xMid, y: cy - 18 },
      ],
    },
    {
      kind: 'wire',
      points: [
        { x: xMid, y: cy + 18 },
        { x: xMid, y: yBot },
      ],
    },
    {
      kind: 'currentSource',
      at: { x: xIs, y: cy },
      label: `I_s=${(st.Is * 1000).toFixed(0)}mA`,
      labelOffset: { x: 0, y: -32 },
    },
    {
      kind: 'wire',
      points: [
        { x: xIs, y: yTop },
        { x: xIs, y: cy - 14 },
      ],
    },
    {
      kind: 'wire',
      points: [
        { x: xIs, y: cy + 14 },
        { x: xIs, y: yBot },
      ],
    },
    {
      kind: 'resistor',
      from: { x: xLoad, y: cy - 18 },
      to: { x: xLoad, y: cy + 18 },
      color: colors.teal,
      label: `R_L ${fmtResistance(st.RL)}`,
      labelOffset: { x: 12, y: 0 },
    },
    {
      kind: 'wire',
      points: [
        { x: xLoad, y: yTop },
        { x: xLoad, y: cy - 18 },
      ],
    },
    {
      kind: 'wire',
      points: [
        { x: xLoad, y: cy + 18 },
        { x: xLoad, y: yBot },
      ],
    },
  ];
}

function buildTheveninElements(
  x0: number,
  y0: number,
  w: number,
  h: number,
  colors: import('@/lib/canvasTheme').ThemeColors,
  st: ST,
): CircuitElement[] {
  const cy = y0 + h / 2;
  const xBat = x0 + 50;
  const xR = x0 + w * 0.45;
  const xLoad = x0 + w - 40;
  const yTop = cy - 50;
  const yBot = cy + 50;

  // Thévenin: single V_th in series with R_th feeding R_L.
  return [
    {
      kind: 'wire',
      points: [
        { x: xBat, y: yTop },
        { x: xR - 22, y: yTop },
      ],
    },
    {
      kind: 'resistor',
      from: { x: xR - 20, y: yTop },
      to: { x: xR + 20, y: yTop },
      color: colors.accent,
      label: `R_th ${fmtResistance(st.Rth)}`,
      labelOffset: { x: 0, y: -10 },
    },
    {
      kind: 'wire',
      points: [
        { x: xR + 22, y: yTop },
        { x: xLoad, y: yTop },
      ],
    },
    {
      kind: 'battery',
      at: { x: xBat, y: cy },
      label: `V_th=${st.Vth.toFixed(1)}V`,
      leadLength: 50,
    },
    {
      kind: 'wire',
      points: [
        { x: xBat, y: yBot },
        { x: xLoad, y: yBot },
      ],
    },
    {
      kind: 'resistor',
      from: { x: xLoad, y: cy - 18 },
      to: { x: xLoad, y: cy + 18 },
      color: colors.teal,
      label: `R_L ${fmtResistance(st.RL)}`,
      labelOffset: { x: 12, y: 0 },
    },
    {
      kind: 'wire',
      points: [
        { x: xLoad, y: yTop },
        { x: xLoad, y: cy - 18 },
      ],
    },
    {
      kind: 'wire',
      points: [
        { x: xLoad, y: cy + 18 },
        { x: xLoad, y: yBot },
      ],
    },
  ];
}

function drawLoadReadouts(
  ctx: CanvasRenderingContext2D,
  colors: import('@/lib/canvasTheme').ThemeColors,
  x0: number,
  y0: number,
  w: number,
  h: number,
  st: ST,
) {
  const cy = y0 + h / 2;
  const xLoad = x0 + w - 40;
  ctx.fillStyle = colors.teal;
  drawLabel(ctx, {
    text: `V_L = ${st.Vload.toFixed(2)} V`,
    x: xLoad + 12,
    y: cy - 8,
    weight: 'bold',
    font: 'bold 10px "JetBrains Mono", monospace',
    baseline: 'middle',
  });
  ctx.fillStyle = colors.blue;
  drawLabel(ctx, {
    text: `I_L = ${(st.Iload * 1000).toFixed(1)} mA`,
    x: xLoad + 12,
    y: cy + 8,
    weight: 'bold',
    font: 'bold 10px "JetBrains Mono", monospace',
    baseline: 'middle',
  });
}
