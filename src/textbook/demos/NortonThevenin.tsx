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
import { useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, EquationStrip, MiniReadout, MiniSlider } from '@/components/Demo';
import { InlineMath } from '@/components/Formula';
import { Num } from '@/components/Num';
import { type CircuitElement } from '@/lib/canvasPrimitives';
import { getCanvasColors, withAlpha } from '@/lib/canvasTheme';
import { useCircuitCache } from '@/lib/useCircuitCache';
import { drawLabel } from "@/lib/canvasLayout";
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

interface Props {
  figure: string;
}

export function NortonTheveninDemo({ figure }: Props) {
  const [Vs, setVs] = useState(12);
  const [Rs, setRs] = useState(4);
  const [Rp, setRp] = useState(12);
  const [RL, setRL] = useState(8);

  const V_oc = (Vs * Rp) / (Rs + Rp);
  const R_Th = (Rs * Rp) / (Rs + Rp);
  const I_N = V_oc / R_Th; // == Vs / Rs (algebraically)
  // Driven by Thévenin
  const I_L_T = V_oc / (R_Th + RL);
  const V_L_T = I_L_T * RL;
  // Driven by Norton (current divider)
  const I_L_N = (I_N * R_Th) / (R_Th + RL);
  const V_L_N = I_L_N * RL;

  const stateRef = useSimState({ V_oc, R_Th, I_N, RL });

  const getStaticSchematic = useCircuitCache(
    (sw, sh, _dpr) => ({
      elements: buildAllPanels(sw, sh, sw / 3, V_oc, R_Th, I_N, RL) as CircuitElement[],
    }),
    [V_oc, R_Th, I_N, RL],
  );

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, dpr }) => {
      ctx.fillStyle = getCanvasColors().bg;
      ctx.fillRect(0, 0, w, h);

      const off = getStaticSchematic(w, h, dpr);
      if (off) ctx.drawImage(off, 0, 0, w, h);

      // Per-frame overlay: panel titles (used to bake into the cache),
      // panel-divider strokes, and the ⇌ glyphs.
      const colW = w / 3;

      ctx.save();
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = getCanvasColors().textDim;
      drawLabel(ctx, { text: 'Original network', x: colW / 2, y: 12, size: 11, font: '11px "JetBrains Mono", monospace', align: 'center', baseline: 'top' });
      drawLabel(ctx, { text: 'Thévenin equivalent + load', x: colW + colW / 2, y: 12, size: 11, font: '11px "JetBrains Mono", monospace', align: 'center', baseline: 'top' });
      drawLabel(ctx, { text: 'Norton equivalent + load', x: 2 * colW + colW / 2, y: 12, size: 11, font: '11px "JetBrains Mono", monospace', align: 'center', baseline: 'top' });
      ctx.restore();
      ctx.strokeStyle = getCanvasColors().border;
      ctx.beginPath();
      ctx.moveTo(colW, 8);
      ctx.lineTo(colW, h - 8);
      ctx.moveTo(2 * colW, 8);
      ctx.lineTo(2 * colW, h - 8);
      ctx.stroke();

      ctx.fillStyle = getCanvasColors().accent;
      drawLabel(ctx, { text: '⇌', x: colW, y: h * 0.45, weight: 'bold', size: 14, font: 'bold 14px "JetBrains Mono", monospace', align: 'center', baseline: 'middle' });
      drawLabel(ctx, { text: '⇌', x: 2 * colW, y: h * 0.45, weight: 'bold', size: 14, font: 'bold 14px "JetBrains Mono", monospace', align: 'center', baseline: 'middle' });
    },
    [getStaticSchematic],
  );

  return (
    <Demo
      figure={figure}
      title="Thévenin ⇌ Norton — three networks, identical terminal behaviour"
      question="Connect the same load R_L to any of three networks; V_L and I_L agree."
      caption={
        <>
          The original network on the left contains a source, a series resistor, and a bleeder. The
          middle panel is its Thévenin equivalent: a single voltage source V<sub>Th</sub> = V
          <sub>oc</sub> in series with R<sub>Th</sub>. The right panel is the Norton equivalent: a
          current source I<sub>N</sub> = V<sub>Th</sub>/R<sub>Th</sub>
          in parallel with the same R<sub>N</sub> = R<sub>Th</sub>. From the outside, all three are
          indistinguishable for any linear load.
        </>
      }
      deeperLab={{ slug: 'network-analysis', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={320} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="V_s"
          value={Vs}
          min={1}
          max={24}
          step={0.5}
          format={(v) => v.toFixed(1) + ' V'}
          onChange={setVs}
        />
        <MiniSlider
          label="R_s"
          value={Rs}
          min={0.5}
          max={50}
          step={0.5}
          format={(v) => v.toFixed(1) + ' Ω'}
          onChange={setRs}
        />
        <MiniSlider
          label="R_p"
          value={Rp}
          min={0.5}
          max={100}
          step={0.5}
          format={(v) => v.toFixed(1) + ' Ω'}
          onChange={setRp}
        />
        <MiniSlider
          label="R_L"
          value={RL}
          min={0.5}
          max={100}
          step={0.5}
          format={(v) => v.toFixed(1) + ' Ω'}
          onChange={setRL}
        />
        <MiniReadout label="V_Th = V_oc" value={<Num value={V_oc} digits={3} />} unit="V" />
        <MiniReadout label="R_Th = R_N" value={<Num value={R_Th} digits={3} />} unit="Ω" />
        <MiniReadout label="I_N (short)" value={<Num value={I_N} digits={3} />} unit="A" />
        <MiniReadout label="V_L  (Thévenin)" value={<Num value={V_L_T} digits={3} />} unit="V" />
        <MiniReadout label="V_L  (Norton)" value={<Num value={V_L_N} digits={3} />} unit="V" />
      </DemoControls>
      <EquationStrip
        leftLabel="Thévenin ↔ Norton"
        left={
          <InlineMath
            tex={`V_\\text{Th} = ${V_oc.toFixed(3)}\\,\\text{V},\\quad R_\\text{Th} = ${R_Th.toFixed(3)}\\,\\Omega`}
          />
        }
        rightLabel="Norton equivalent"
        right={
          <InlineMath
            tex={`I_N = V_\\text{Th}/R_\\text{Th} = ${I_N.toFixed(3)}\\,\\text{A};\\quad V_L = ${V_L_T.toFixed(3)}\\,\\text{V}`}
          />
        }
      />
    </Demo>
  );
}

function buildAllPanels(
  w: number,
  h: number,
  colW: number,
  Voc: number,
  RTh: number,
  IN: number,
  RL: number,
): CircuitElement[] {
  void w;
  return [
    ...buildOriginal(0, 0, colW, h),
    ...buildThev(colW, 0, colW, h, Voc, RTh, RL),
    ...buildNort(2 * colW, 0, colW, h, IN, RTh, RL),
  ];
}

// Translate every element's coordinates by (x0, y0).
function translateElements(els: CircuitElement[], x0: number, y0: number): CircuitElement[] {
  const tp = (p: { x: number; y: number }) => ({ x: p.x + x0, y: p.y + y0 });
  return els.map((el): CircuitElement => {
    switch (el.kind) {
      case 'wire':
        return { ...el, points: el.points.map(tp) };
      case 'resistor':
      case 'capacitor':
      case 'inductor':
      case 'arrow':
        return { ...el, from: tp(el.from), to: tp(el.to) };
      case 'battery':
      case 'currentSource':
      case 'switch':
      case 'bulb':
      case 'ground':
      case 'node':
      case 'voltmeter':
      case 'charge':
        return { ...el, at: tp(el.at) };
    }
  });
}

function buildOriginal(x0: number, y0: number, w: number, h: number): CircuitElement[] {
  const cy = h / 2;
  const xS = 26;
  const xR1 = 64;
  const xR2 = 112;
  const xA = w - 30;
  const yTop = cy - 50;
  const yBot = cy + 50;

  // Source network: V_s in series with R_s plus bleeder R_p across A–B.
  const elements: CircuitElement[] = [
    {
      kind: 'wire',
      points: [
        { x: xS, y: yTop },
        { x: xR1 - 18, y: yTop },
      ],
    },
    {
      kind: 'resistor',
      from: { x: xR1 - 18, y: yTop },
      to: { x: xR1 + 18, y: yTop },
      label: 'R_s',
      labelOffset: { x: 0, y: -10 },
    },
    {
      kind: 'wire',
      points: [
        { x: xR1 + 18, y: yTop },
        { x: xR2, y: yTop },
        { x: xR2, y: cy - 18 },
      ],
    },
    {
      kind: 'resistor',
      from: { x: xR2, y: cy - 18 },
      to: { x: xR2, y: cy + 18 },
      label: 'R_p',
      labelOffset: { x: 10, y: 0 },
    },
    {
      kind: 'wire',
      points: [
        { x: xR2, y: cy + 18 },
        { x: xR2, y: yBot },
      ],
    },
    {
      kind: 'wire',
      points: [
        { x: xR2, y: yTop },
        { x: xA, y: yTop },
      ],
    },
    {
      kind: 'wire',
      points: [
        { x: xS, y: yBot },
        { x: xA, y: yBot },
      ],
    },
    {
      kind: 'wire',
      points: [
        { x: xS, y: yTop },
        { x: xS, y: cy - 14 },
      ],
    },
    {
      kind: 'wire',
      points: [
        { x: xS, y: cy + 14 },
        { x: xS, y: yBot },
      ],
    },
    { kind: 'battery', at: { x: xS, y: cy }, label: 'V_s', leadLength: 50 },
    {
      kind: 'node',
      at: { x: xA, y: yTop },
      radius: 4,
      color: withAlpha(getCanvasColors().accent, 0.95),
      label: 'A',
      labelColor: withAlpha(getCanvasColors().text, 0.9),
      labelOffset: { x: 8, y: -2 },
    },
    {
      kind: 'node',
      at: { x: xA, y: yBot },
      radius: 4,
      color: withAlpha(getCanvasColors().accent, 0.95),
      label: 'B',
      labelColor: withAlpha(getCanvasColors().text, 0.9),
      labelOffset: { x: 8, y: -2 },
    },
  ];
  return translateElements(elements, x0, y0);
}

function buildThev(
  x0: number,
  y0: number,
  w: number,
  h: number,
  Voc: number,
  RTh: number,
  RL: number,
): CircuitElement[] {
  const cy = h / 2;
  const xS = 26;
  const xR = 70;
  const xA = w - 60;
  const yTop = cy - 50;
  const yBot = cy + 50;

  // Thévenin equivalent: V_Th in series with R_Th feeding R_L.
  const elements: CircuitElement[] = [
    {
      kind: 'wire',
      points: [
        { x: xS, y: yTop },
        { x: xR - 18, y: yTop },
      ],
    },
    {
      kind: 'resistor',
      from: { x: xR - 18, y: yTop },
      to: { x: xR + 18, y: yTop },
      label: `R_Th=${RTh.toFixed(1)}Ω`,
      labelOffset: { x: 0, y: -10 },
    },
    {
      kind: 'wire',
      points: [
        { x: xR + 18, y: yTop },
        { x: xA, y: yTop },
        { x: xA, y: cy - 18 },
      ],
    },
    {
      kind: 'resistor',
      from: { x: xA, y: cy - 18 },
      to: { x: xA, y: cy + 18 },
      label: `R_L=${RL.toFixed(1)}Ω`,
      labelOffset: { x: 10, y: 0 },
    },
    {
      kind: 'wire',
      points: [
        { x: xA, y: cy + 18 },
        { x: xA, y: yBot },
        { x: xS, y: yBot },
      ],
    },
    {
      kind: 'wire',
      points: [
        { x: xS, y: yTop },
        { x: xS, y: cy - 14 },
      ],
    },
    {
      kind: 'wire',
      points: [
        { x: xS, y: cy + 14 },
        { x: xS, y: yBot },
      ],
    },
    { kind: 'battery', at: { x: xS, y: cy }, label: `V_Th=${Voc.toFixed(2)}V`, leadLength: 50 },
    {
      kind: 'node',
      at: { x: xA, y: yTop },
      radius: 4,
      color: withAlpha(getCanvasColors().accent, 0.95),
      label: 'A',
      labelColor: withAlpha(getCanvasColors().text, 0.9),
      labelOffset: { x: 8, y: -2 },
    },
    {
      kind: 'node',
      at: { x: xA, y: yBot },
      radius: 4,
      color: withAlpha(getCanvasColors().accent, 0.95),
      label: 'B',
      labelColor: withAlpha(getCanvasColors().text, 0.9),
      labelOffset: { x: 8, y: -2 },
    },
  ];
  return translateElements(elements, x0, y0);
}

function buildNort(
  x0: number,
  y0: number,
  w: number,
  h: number,
  IN: number,
  RN: number,
  RL: number,
): CircuitElement[] {
  const cy = h / 2;
  const xS = 36;
  const xR = 84;
  const xA = w - 50;
  const yTop = cy - 50;
  const yBot = cy + 50;

  // Norton equivalent: I_N in parallel with R_N feeding R_L.
  const elements: CircuitElement[] = [
    {
      kind: 'wire',
      points: [
        { x: xS, y: yTop },
        { x: xS, y: cy - 18 },
      ],
    },
    {
      kind: 'wire',
      points: [
        { x: xS, y: cy + 18 },
        { x: xS, y: yBot },
      ],
    },
    {
      kind: 'currentSource',
      at: { x: xS, y: cy },
      label: `I_N=${IN.toFixed(2)}A`,
      labelOffset: { x: -20, y: 0 },
      radius: 16,
    },
    {
      kind: 'wire',
      points: [
        { x: xS, y: yTop },
        { x: xR, y: yTop },
        { x: xR, y: cy - 18 },
      ],
    },
    {
      kind: 'resistor',
      from: { x: xR, y: cy - 18 },
      to: { x: xR, y: cy + 18 },
      label: `R_N=${RN.toFixed(1)}Ω`,
      labelOffset: { x: 10, y: 0 },
    },
    {
      kind: 'wire',
      points: [
        { x: xR, y: cy + 18 },
        { x: xR, y: yBot },
        { x: xS, y: yBot },
      ],
    },
    {
      kind: 'wire',
      points: [
        { x: xR, y: yTop },
        { x: xA, y: yTop },
        { x: xA, y: cy - 18 },
      ],
    },
    {
      kind: 'resistor',
      from: { x: xA, y: cy - 18 },
      to: { x: xA, y: cy + 18 },
      label: `R_L=${RL.toFixed(1)}Ω`,
      labelOffset: { x: 10, y: 0 },
    },
    {
      kind: 'wire',
      points: [
        { x: xA, y: cy + 18 },
        { x: xA, y: yBot },
        { x: xR, y: yBot },
      ],
    },
    {
      kind: 'node',
      at: { x: xA, y: yTop },
      radius: 4,
      color: withAlpha(getCanvasColors().accent, 0.95),
      label: 'A',
      labelColor: withAlpha(getCanvasColors().text, 0.9),
      labelOffset: { x: 8, y: -2 },
    },
    {
      kind: 'node',
      at: { x: xA, y: yBot },
      radius: 4,
      color: withAlpha(getCanvasColors().accent, 0.95),
      label: 'B',
      labelColor: withAlpha(getCanvasColors().text, 0.9),
      labelOffset: { x: 8, y: -2 },
    },
  ];
  return translateElements(elements, x0, y0);
}
