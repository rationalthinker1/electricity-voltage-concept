/**
 * Demo D3.5b — Series + parallel mixed networks (selectable topology)
 *
 * Four selectable network topologies of three resistors driven by a fixed
 * 12 V source:
 *   1. R1 → (R2 ∥ R3)         — series trunk feeding a parallel block
 *   2. (R1 ∥ R2) → R3         — parallel pair feeding a series load
 *   3. R1 + R2 + R3            — three in series
 *   4. R1 ∥ R2 ∥ R3            — three in parallel
 *
 * The reader picks the topology from a four-button picker; the schematic
 * redraws, branch-current readouts re-bind, and the equation strip prints
 * the symbolic + substituted total resistance.
 *
 * Pedagogical thrust: the four cases use the same two rules (series sum,
 * parallel reciprocal sum) but in different combinations. Stepping through
 * them is the cleanest way to feel "any linear network reduces to those two
 * rules" before Chapter 13 builds mesh/nodal analysis on top.
 */
import { useMemo, useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, EquationStrip, MiniReadout, MiniSlider } from '@/components/Demo';
import { InlineMath } from '@/components/Formula';
import { Num } from '@/components/Num';
import { drawLabel } from '@/lib/canvasLayout';
import { type CircuitElement } from '@/lib/canvasPrimitives';
import { useCircuitCache } from '@/lib/useCircuitCache';
import { getCanvasColors, withAlpha } from '@/lib/canvasTheme';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

interface Props {
  figure?: string;
}

const V_FIXED = 12; // V — source voltage
// Visual scaling reference. The trunk current at the default config (R1=8,
// R2=20, R3=30, topology = series→parallel) is ~0.6 A.
const I_REF = 0.6;

type TopologyId = 'series-parallel' | 'parallel-series' | 'three-series' | 'three-parallel';

interface TopologyOption {
  id: TopologyId;
  label: string;
  symbolic: string;
}

const TOPOLOGIES: TopologyOption[] = [
  {
    id: 'series-parallel',
    label: 'R₁ → (R₂ ∥ R₃)',
    symbolic: 'R_{\\text{tot}} \\;=\\; R_1 + \\dfrac{R_2 R_3}{R_2 + R_3}',
  },
  {
    id: 'parallel-series',
    label: '(R₁ ∥ R₂) → R₃',
    symbolic: 'R_{\\text{tot}} \\;=\\; \\dfrac{R_1 R_2}{R_1 + R_2} + R_3',
  },
  {
    id: 'three-series',
    label: 'R₁ + R₂ + R₃',
    symbolic: 'R_{\\text{tot}} \\;=\\; R_1 + R_2 + R_3',
  },
  {
    id: 'three-parallel',
    label: 'R₁ ∥ R₂ ∥ R₃',
    symbolic:
      'R_{\\text{tot}} \\;=\\; \\left(\\tfrac{1}{R_1} + \\tfrac{1}{R_2} + \\tfrac{1}{R_3}\\right)^{-1}',
  },
];

interface NetworkResult {
  Rtot: number;
  Itot: number;
  // Voltage at each non-source node (label → value). The leftmost is always
  // V_FIXED and the rightmost is 0; we surface the interesting intermediate
  // nodes.
  nodes: { name: string; value: number }[];
  // Branch currents on the elements that aren't carrying the trunk current.
  branches: { name: string; value: number }[];
  // Per-element current, used for animating dot speed.
  perElement: { I1: number; I2: number; I3: number };
}

function computeNetwork(topology: TopologyId, R1: number, R2: number, R3: number): NetworkResult {
  switch (topology) {
    case 'series-parallel': {
      const Rpar = (R2 * R3) / (R2 + R3);
      const Rtot = R1 + Rpar;
      const Itot = V_FIXED / Rtot;
      const Vmid = V_FIXED - Itot * R1;
      const I2 = Vmid / R2;
      const I3 = Vmid / R3;
      return {
        Rtot,
        Itot,
        nodes: [{ name: 'V_mid', value: Vmid }],
        branches: [
          { name: 'I₂', value: I2 },
          { name: 'I₃', value: I3 },
        ],
        perElement: { I1: Itot, I2, I3 },
      };
    }
    case 'parallel-series': {
      const Rpar = (R1 * R2) / (R1 + R2);
      const Rtot = Rpar + R3;
      const Itot = V_FIXED / Rtot;
      // Voltage across the parallel block:
      const Vpar = Itot * Rpar;
      const I1 = Vpar / R1;
      const I2 = Vpar / R2;
      // Voltage at the node between the parallel block and R3:
      const Vmid = V_FIXED - Vpar;
      return {
        Rtot,
        Itot,
        nodes: [{ name: 'V_mid', value: Vmid }],
        branches: [
          { name: 'I₁', value: I1 },
          { name: 'I₂', value: I2 },
        ],
        perElement: { I1, I2, I3: Itot },
      };
    }
    case 'three-series': {
      const Rtot = R1 + R2 + R3;
      const I = V_FIXED / Rtot;
      const V_afterR1 = V_FIXED - I * R1;
      const V_afterR2 = V_afterR1 - I * R2;
      return {
        Rtot,
        Itot: I,
        nodes: [
          { name: 'V_a', value: V_afterR1 },
          { name: 'V_b', value: V_afterR2 },
        ],
        branches: [],
        perElement: { I1: I, I2: I, I3: I },
      };
    }
    case 'three-parallel': {
      const Rtot = 1 / (1 / R1 + 1 / R2 + 1 / R3);
      const Itot = V_FIXED / Rtot;
      const I1 = V_FIXED / R1;
      const I2 = V_FIXED / R2;
      const I3 = V_FIXED / R3;
      return {
        Rtot,
        Itot,
        nodes: [],
        branches: [
          { name: 'I₁', value: I1 },
          { name: 'I₂', value: I2 },
          { name: 'I₃', value: I3 },
        ],
        perElement: { I1, I2, I3 },
      };
    }
  }
}

export function SeriesParallelMixDemo({ figure }: Props) {
  const [topology, setTopology] = useState<TopologyId>('series-parallel');
  const [R1, setR1] = useState(8);
  const [R2, setR2] = useState(20);
  const [R3, setR3] = useState(30);

  const network = useMemo(() => computeNetwork(topology, R1, R2, R3), [topology, R1, R2, R3]);
  const { Rtot, Itot } = network;

  const stateRef = useSimState({ topology, R1, R2, R3 });

  // Static schematic — rebakes when topology, resistors, or canvas size change.
  const getStaticSchematic = useCircuitCache(
    (sw, sh, _dpr) => {
      const padX = 60;
      const batX = padX;
      const outX = sw - padX;
      const cy = sh / 2;
      const yTop = cy - 50;
      const yBot = cy + 50;
      return buildSchematicSpec(topology, R1, R2, R3, { batX, outX, cy, yTop, yBot });
    },
    [topology, R1, R2, R3],
  );

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, dpr, colors }, _state, _dt, simTime) => {
      const s = stateRef.current;
      const { topology, R1, R2, R3 } = s;
      const t = simTime;

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      const padX = 60;
      const batX = padX;
      const outX = w - padX;
      const cy = h / 2;
      const yTop = cy - 50;
      const yBot = cy + 50;

      const off = getStaticSchematic(w, h, dpr);
      if (off) ctx.drawImage(off, 0, 0, w, h);

      // Battery '−' overlay (the renderer doesn't include the polarity glyph
      // beside the bottom lead).
      ctx.fillStyle = colors.blue;
      ctx.font = 'bold 12px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText('−', batX - 18, cy + 18);

      // Current animation paths + voltage probes are topology-specific.
      const live = computeNetwork(topology, R1, R2, R3);
      drawAnimatedFlow(ctx, topology, t, live, { batX, outX, cy, yTop, yBot });
      drawProbesAndLabels(ctx, topology, live, R1, R2, R3, w, h, {
        batX,
        outX,
        cy,
        yTop,
        yBot,
      });

      // Helper text at the bottom.
      ctx.fillStyle = colors.textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      const labelTopology = TOPOLOGIES.find((tp) => tp.id === topology)?.label ?? topology;
      ctx.fillText(`${labelTopology} — Kirchhoff in action`, w / 2, h - 14);
    },
    [],
  );

  // EquationStrip content for the chosen topology.
  const topologyMeta = TOPOLOGIES.find((tp) => tp.id === topology)!;
  const substitutedExpr = (() => {
    switch (topology) {
      case 'series-parallel':
        return (
          `R_{\\text{tot}} \\;=\\; ${R1.toFixed(0)} + ` +
          `\\dfrac{${R2.toFixed(0)}\\times ${R3.toFixed(0)}}{${R2.toFixed(0)} + ${R3.toFixed(0)}} ` +
          `\\;\\approx\\; ${Rtot.toFixed(2)}\\ \\Omega`
        );
      case 'parallel-series':
        return (
          `R_{\\text{tot}} \\;=\\; ` +
          `\\dfrac{${R1.toFixed(0)}\\times ${R2.toFixed(0)}}{${R1.toFixed(0)} + ${R2.toFixed(0)}} ` +
          `+ ${R3.toFixed(0)} \\;\\approx\\; ${Rtot.toFixed(2)}\\ \\Omega`
        );
      case 'three-series':
        return (
          `R_{\\text{tot}} \\;=\\; ${R1.toFixed(0)} + ${R2.toFixed(0)} + ${R3.toFixed(0)} ` +
          `\\;=\\; ${Rtot.toFixed(2)}\\ \\Omega`
        );
      case 'three-parallel':
        return (
          `R_{\\text{tot}} \\;=\\; \\left(\\tfrac{1}{${R1.toFixed(0)}} + ` +
          `\\tfrac{1}{${R2.toFixed(0)}} + \\tfrac{1}{${R3.toFixed(0)}}\\right)^{-1} ` +
          `\\;\\approx\\; ${Rtot.toFixed(2)}\\ \\Omega`
        );
    }
  })();

  return (
    <Demo
      figure={figure ?? 'Fig. 3.5b'}
      title="Mixed networks — pick a topology"
      question="Where does the 12 V go, and how does the current split?"
      caption={
        <>
          A first taste of network analysis. Pick a topology with the buttons below: a trunk feeding
          a parallel pair, a parallel pair feeding a series load, three in series, or three in
          parallel. The same two rules — series sum, parallel reciprocal sum — solve each one, and
          the voltage probes and branch-current labels redraw to match. The faster-flowing branch is
          always the one with the lower resistance.
        </>
      }
      deeperLab={{ slug: 'resistance', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        {TOPOLOGIES.map((tp) => (
          <button
            key={tp.id}
            type="button"
            className={`mini-toggle${topology === tp.id ? 'on' : ''}`}
            onClick={() => setTopology(tp.id)}
            aria-pressed={topology === tp.id}
          >
            {tp.label}
          </button>
        ))}
        <MiniSlider
          label="R₁"
          value={R1}
          min={1}
          max={50}
          step={1}
          format={(v) => v.toFixed(0) + ' Ω'}
          onChange={setR1}
        />
        <MiniSlider
          label="R₂"
          value={R2}
          min={1}
          max={100}
          step={1}
          format={(v) => v.toFixed(0) + ' Ω'}
          onChange={setR2}
        />
        <MiniSlider
          label="R₃"
          value={R3}
          min={1}
          max={100}
          step={1}
          format={(v) => v.toFixed(0) + ' Ω'}
          onChange={setR3}
        />
        <MiniReadout label="R_tot" value={<Num value={Rtot} />} unit="Ω" />
        <MiniReadout label="I_tot = 12 V / R_tot" value={<Num value={Itot} />} unit="A" />
        {network.branches.map((br) => (
          <MiniReadout key={br.name} label={br.name} value={<Num value={br.value} />} unit="A" />
        ))}
        {network.nodes.map((nd) => (
          <MiniReadout key={nd.name} label={nd.name} value={<Num value={nd.value} />} unit="V" />
        ))}
      </DemoControls>
      <EquationStrip
        leftLabel={`${topologyMeta.label} — symbolic`}
        left={<InlineMath tex={topologyMeta.symbolic} />}
        rightLabel="Live substitution"
        right={<InlineMath tex={substitutedExpr} />}
      />
    </Demo>
  );
}

/* ─── Schematic builders ──────────────────────────────────────────────── */

interface FrameLayout {
  batX: number;
  outX: number;
  cy: number;
  yTop: number;
  yBot: number;
}

function buildSchematicSpec(
  topology: TopologyId,
  R1: number,
  R2: number,
  R3: number,
  L: FrameLayout,
) {
  let elements: CircuitElement[];
  switch (topology) {
    case 'series-parallel':
      elements = buildSeriesParallel(R1, R2, R3, L);
      break;
    case 'parallel-series':
      elements = buildParallelSeries(R1, R2, R3, L);
      break;
    case 'three-series':
      elements = buildThreeSeries(R1, R2, R3, L);
      break;
    case 'three-parallel':
      elements = buildThreeParallel(R1, R2, R3, L);
      break;
  }
  return { elements, defaultWireColor: withAlpha(getCanvasColors().text, 0.65) };
}

function batteryElement(L: FrameLayout): CircuitElement {
  return {
    kind: 'battery',
    at: { x: L.batX, y: L.cy },
    label: `+   ${V_FIXED} V`,
    labelOffset: { x: -22, y: -10 },
    leadLength: 50,
  };
}

function buildSeriesParallel(R1: number, R2: number, R3: number, L: FrameLayout): CircuitElement[] {
  const xR1 = L.batX + (L.outX - L.batX) * 0.2;
  const nodeA = L.batX + (L.outX - L.batX) * 0.42;
  const nodeB = L.batX + (L.outX - L.batX) * 0.82;
  const xR23 = (nodeA + nodeB) / 2;
  const branchY = L.yTop + 38;
  return [
    batteryElement(L),
    {
      kind: 'wire',
      points: [
        { x: L.batX, y: L.yTop },
        { x: xR1 - 22, y: L.yTop },
      ],
    },
    {
      kind: 'resistor',
      from: { x: xR1 - 20, y: L.yTop },
      to: { x: xR1 + 20, y: L.yTop },
      label: `R1 = ${R1.toFixed(0)}Ω`,
      labelOffset: { x: 0, y: -16 },
    },
    {
      kind: 'wire',
      points: [
        { x: xR1 + 22, y: L.yTop },
        { x: nodeA, y: L.yTop },
      ],
    },
    // R2 along top branch.
    {
      kind: 'wire',
      points: [
        { x: nodeA, y: L.yTop },
        { x: xR23 - 22, y: L.yTop },
      ],
    },
    {
      kind: 'resistor',
      from: { x: xR23 - 20, y: L.yTop },
      to: { x: xR23 + 20, y: L.yTop },
      label: `R2 = ${R2.toFixed(0)}Ω`,
      labelOffset: { x: 0, y: -16 },
    },
    {
      kind: 'wire',
      points: [
        { x: xR23 + 22, y: L.yTop },
        { x: nodeB, y: L.yTop },
      ],
    },
    // R3 along lower branch.
    {
      kind: 'wire',
      points: [
        { x: nodeA, y: L.yTop },
        { x: nodeA, y: branchY },
        { x: xR23 - 22, y: branchY },
      ],
    },
    {
      kind: 'resistor',
      from: { x: xR23 - 20, y: branchY },
      to: { x: xR23 + 20, y: branchY },
      label: `R3 = ${R3.toFixed(0)}Ω`,
      labelOffset: { x: 0, y: 16 },
    },
    {
      kind: 'wire',
      points: [
        { x: xR23 + 22, y: branchY },
        { x: nodeB, y: branchY },
        { x: nodeB, y: L.yTop },
      ],
    },
    // Return wire.
    {
      kind: 'wire',
      points: [
        { x: nodeB, y: L.yTop },
        { x: L.outX, y: L.yTop },
        { x: L.outX, y: L.yBot },
        { x: L.batX, y: L.yBot },
      ],
    },
    { kind: 'node', at: { x: nodeA, y: L.yTop } },
    { kind: 'node', at: { x: nodeB, y: L.yTop } },
  ];
}

function buildParallelSeries(R1: number, R2: number, R3: number, L: FrameLayout): CircuitElement[] {
  // Mirror of series-parallel: parallel block on the left, R3 in series on the right.
  const nodeA = L.batX + (L.outX - L.batX) * 0.16;
  const nodeB = L.batX + (L.outX - L.batX) * 0.6;
  const xR12 = (nodeA + nodeB) / 2;
  const branchY = L.yTop + 38;
  const xR3 = L.batX + (L.outX - L.batX) * 0.82;
  return [
    batteryElement(L),
    {
      kind: 'wire',
      points: [
        { x: L.batX, y: L.yTop },
        { x: nodeA, y: L.yTop },
      ],
    },
    // R1 along top branch.
    {
      kind: 'wire',
      points: [
        { x: nodeA, y: L.yTop },
        { x: xR12 - 22, y: L.yTop },
      ],
    },
    {
      kind: 'resistor',
      from: { x: xR12 - 20, y: L.yTop },
      to: { x: xR12 + 20, y: L.yTop },
      label: `R1 = ${R1.toFixed(0)}Ω`,
      labelOffset: { x: 0, y: -16 },
    },
    {
      kind: 'wire',
      points: [
        { x: xR12 + 22, y: L.yTop },
        { x: nodeB, y: L.yTop },
      ],
    },
    // R2 along lower branch.
    {
      kind: 'wire',
      points: [
        { x: nodeA, y: L.yTop },
        { x: nodeA, y: branchY },
        { x: xR12 - 22, y: branchY },
      ],
    },
    {
      kind: 'resistor',
      from: { x: xR12 - 20, y: branchY },
      to: { x: xR12 + 20, y: branchY },
      label: `R2 = ${R2.toFixed(0)}Ω`,
      labelOffset: { x: 0, y: 16 },
    },
    {
      kind: 'wire',
      points: [
        { x: xR12 + 22, y: branchY },
        { x: nodeB, y: branchY },
        { x: nodeB, y: L.yTop },
      ],
    },
    // Trunk after the parallel block → R3.
    {
      kind: 'wire',
      points: [
        { x: nodeB, y: L.yTop },
        { x: xR3 - 22, y: L.yTop },
      ],
    },
    {
      kind: 'resistor',
      from: { x: xR3 - 20, y: L.yTop },
      to: { x: xR3 + 20, y: L.yTop },
      label: `R3 = ${R3.toFixed(0)}Ω`,
      labelOffset: { x: 0, y: -16 },
    },
    {
      kind: 'wire',
      points: [
        { x: xR3 + 22, y: L.yTop },
        { x: L.outX, y: L.yTop },
        { x: L.outX, y: L.yBot },
        { x: L.batX, y: L.yBot },
      ],
    },
    { kind: 'node', at: { x: nodeA, y: L.yTop } },
    { kind: 'node', at: { x: nodeB, y: L.yTop } },
  ];
}

function buildThreeSeries(R1: number, R2: number, R3: number, L: FrameLayout): CircuitElement[] {
  const xR1 = L.batX + (L.outX - L.batX) * 0.22;
  const xR2 = L.batX + (L.outX - L.batX) * 0.5;
  const xR3 = L.batX + (L.outX - L.batX) * 0.78;
  return [
    batteryElement(L),
    {
      kind: 'wire',
      points: [
        { x: L.batX, y: L.yTop },
        { x: xR1 - 22, y: L.yTop },
      ],
    },
    {
      kind: 'resistor',
      from: { x: xR1 - 20, y: L.yTop },
      to: { x: xR1 + 20, y: L.yTop },
      label: `R1 = ${R1.toFixed(0)}Ω`,
      labelOffset: { x: 0, y: -16 },
    },
    {
      kind: 'wire',
      points: [
        { x: xR1 + 22, y: L.yTop },
        { x: xR2 - 22, y: L.yTop },
      ],
    },
    {
      kind: 'resistor',
      from: { x: xR2 - 20, y: L.yTop },
      to: { x: xR2 + 20, y: L.yTop },
      label: `R2 = ${R2.toFixed(0)}Ω`,
      labelOffset: { x: 0, y: -16 },
    },
    {
      kind: 'wire',
      points: [
        { x: xR2 + 22, y: L.yTop },
        { x: xR3 - 22, y: L.yTop },
      ],
    },
    {
      kind: 'resistor',
      from: { x: xR3 - 20, y: L.yTop },
      to: { x: xR3 + 20, y: L.yTop },
      label: `R3 = ${R3.toFixed(0)}Ω`,
      labelOffset: { x: 0, y: -16 },
    },
    {
      kind: 'wire',
      points: [
        { x: xR3 + 22, y: L.yTop },
        { x: L.outX, y: L.yTop },
        { x: L.outX, y: L.yBot },
        { x: L.batX, y: L.yBot },
      ],
    },
  ];
}

function buildThreeParallel(R1: number, R2: number, R3: number, L: FrameLayout): CircuitElement[] {
  const nodeA = L.batX + (L.outX - L.batX) * 0.18;
  const nodeB = L.batX + (L.outX - L.batX) * 0.82;
  const xR1 = (nodeA + nodeB) / 2;
  const yR2 = L.yTop + 38;
  const yR3 = L.yTop + 76;
  return [
    batteryElement(L),
    {
      kind: 'wire',
      points: [
        { x: L.batX, y: L.yTop },
        { x: nodeA, y: L.yTop },
      ],
    },
    // R1 along top branch.
    {
      kind: 'wire',
      points: [
        { x: nodeA, y: L.yTop },
        { x: xR1 - 22, y: L.yTop },
      ],
    },
    {
      kind: 'resistor',
      from: { x: xR1 - 20, y: L.yTop },
      to: { x: xR1 + 20, y: L.yTop },
      label: `R1 = ${R1.toFixed(0)}Ω`,
      labelOffset: { x: 0, y: -16 },
    },
    {
      kind: 'wire',
      points: [
        { x: xR1 + 22, y: L.yTop },
        { x: nodeB, y: L.yTop },
      ],
    },
    // R2 along middle branch.
    {
      kind: 'wire',
      points: [
        { x: nodeA, y: L.yTop },
        { x: nodeA, y: yR2 },
        { x: xR1 - 22, y: yR2 },
      ],
    },
    {
      kind: 'resistor',
      from: { x: xR1 - 20, y: yR2 },
      to: { x: xR1 + 20, y: yR2 },
      label: `R2 = ${R2.toFixed(0)}Ω`,
      labelOffset: { x: 0, y: 16 },
    },
    {
      kind: 'wire',
      points: [
        { x: xR1 + 22, y: yR2 },
        { x: nodeB, y: yR2 },
        { x: nodeB, y: L.yTop },
      ],
    },
    // R3 along lower branch.
    {
      kind: 'wire',
      points: [
        { x: nodeA, y: L.yTop },
        { x: nodeA, y: yR3 },
        { x: xR1 - 22, y: yR3 },
      ],
    },
    {
      kind: 'resistor',
      from: { x: xR1 - 20, y: yR3 },
      to: { x: xR1 + 20, y: yR3 },
      label: `R3 = ${R3.toFixed(0)}Ω`,
      labelOffset: { x: 0, y: 16 },
    },
    {
      kind: 'wire',
      points: [
        { x: xR1 + 22, y: yR3 },
        { x: nodeB, y: yR3 },
        { x: nodeB, y: L.yTop },
      ],
    },
    // Return wire.
    {
      kind: 'wire',
      points: [
        { x: nodeB, y: L.yTop },
        { x: L.outX, y: L.yTop },
        { x: L.outX, y: L.yBot },
        { x: L.batX, y: L.yBot },
      ],
    },
    { kind: 'node', at: { x: nodeA, y: L.yTop } },
    { kind: 'node', at: { x: nodeB, y: L.yTop } },
  ];
}

/* ─── Animation paths ─────────────────────────────────────────────────── */

function drawAnimatedFlow(
  ctx: CanvasRenderingContext2D,
  topology: TopologyId,
  t: number,
  net: NetworkResult,
  L: FrameLayout,
) {
  const { perElement, Itot } = net;
  const trunkScale = Itot / I_REF;
  switch (topology) {
    case 'series-parallel': {
      const xR1 = L.batX + (L.outX - L.batX) * 0.2;
      const nodeA = L.batX + (L.outX - L.batX) * 0.42;
      const nodeB = L.batX + (L.outX - L.batX) * 0.82;
      const branchY = L.yTop + 38;
      void xR1;
      // Trunk to nodeA.
      drawCurrentDotsPath(
        ctx,
        t,
        [
          { x: L.batX, y: L.yTop },
          { x: nodeA, y: L.yTop },
        ],
        trunkScale,
      );
      // Top branch (R2).
      drawCurrentDotsPath(
        ctx,
        t,
        [
          { x: nodeA, y: L.yTop },
          { x: nodeB, y: L.yTop },
        ],
        perElement.I2 / I_REF,
      );
      // Lower branch (R3).
      drawCurrentDotsPath(
        ctx,
        t,
        [
          { x: nodeA, y: L.yTop },
          { x: nodeA, y: branchY },
          { x: nodeB, y: branchY },
          { x: nodeB, y: L.yTop },
        ],
        perElement.I3 / I_REF,
      );
      // Trunk from nodeB → battery −.
      drawCurrentDotsPath(
        ctx,
        t,
        [
          { x: nodeB, y: L.yTop },
          { x: L.outX, y: L.yTop },
          { x: L.outX, y: L.yBot },
          { x: L.batX, y: L.yBot },
        ],
        trunkScale,
      );
      break;
    }
    case 'parallel-series': {
      const nodeA = L.batX + (L.outX - L.batX) * 0.16;
      const nodeB = L.batX + (L.outX - L.batX) * 0.6;
      const xR3 = L.batX + (L.outX - L.batX) * 0.82;
      const branchY = L.yTop + 38;
      void xR3;
      // Trunk to nodeA.
      drawCurrentDotsPath(
        ctx,
        t,
        [
          { x: L.batX, y: L.yTop },
          { x: nodeA, y: L.yTop },
        ],
        trunkScale,
      );
      // R1 top branch.
      drawCurrentDotsPath(
        ctx,
        t,
        [
          { x: nodeA, y: L.yTop },
          { x: nodeB, y: L.yTop },
        ],
        perElement.I1 / I_REF,
      );
      // R2 lower branch.
      drawCurrentDotsPath(
        ctx,
        t,
        [
          { x: nodeA, y: L.yTop },
          { x: nodeA, y: branchY },
          { x: nodeB, y: branchY },
          { x: nodeB, y: L.yTop },
        ],
        perElement.I2 / I_REF,
      );
      // Trunk through R3 → battery −.
      drawCurrentDotsPath(
        ctx,
        t,
        [
          { x: nodeB, y: L.yTop },
          { x: L.outX, y: L.yTop },
          { x: L.outX, y: L.yBot },
          { x: L.batX, y: L.yBot },
        ],
        trunkScale,
      );
      break;
    }
    case 'three-series': {
      // One single loop — animate it as a continuous polyline.
      drawCurrentDotsPath(
        ctx,
        t,
        [
          { x: L.batX, y: L.yTop },
          { x: L.outX, y: L.yTop },
          { x: L.outX, y: L.yBot },
          { x: L.batX, y: L.yBot },
        ],
        trunkScale,
      );
      break;
    }
    case 'three-parallel': {
      const nodeA = L.batX + (L.outX - L.batX) * 0.18;
      const nodeB = L.batX + (L.outX - L.batX) * 0.82;
      const yR2 = L.yTop + 38;
      const yR3 = L.yTop + 76;
      // Trunk pre-split.
      drawCurrentDotsPath(
        ctx,
        t,
        [
          { x: L.batX, y: L.yTop },
          { x: nodeA, y: L.yTop },
        ],
        trunkScale,
      );
      // R1 top branch.
      drawCurrentDotsPath(
        ctx,
        t,
        [
          { x: nodeA, y: L.yTop },
          { x: nodeB, y: L.yTop },
        ],
        perElement.I1 / I_REF,
      );
      // R2 middle branch.
      drawCurrentDotsPath(
        ctx,
        t,
        [
          { x: nodeA, y: L.yTop },
          { x: nodeA, y: yR2 },
          { x: nodeB, y: yR2 },
          { x: nodeB, y: L.yTop },
        ],
        perElement.I2 / I_REF,
      );
      // R3 lower branch.
      drawCurrentDotsPath(
        ctx,
        t,
        [
          { x: nodeA, y: L.yTop },
          { x: nodeA, y: yR3 },
          { x: nodeB, y: yR3 },
          { x: nodeB, y: L.yTop },
        ],
        perElement.I3 / I_REF,
      );
      // Trunk post-merge.
      drawCurrentDotsPath(
        ctx,
        t,
        [
          { x: nodeB, y: L.yTop },
          { x: L.outX, y: L.yTop },
          { x: L.outX, y: L.yBot },
          { x: L.batX, y: L.yBot },
        ],
        trunkScale,
      );
      break;
    }
  }
}

function drawProbesAndLabels(
  ctx: CanvasRenderingContext2D,
  topology: TopologyId,
  net: NetworkResult,
  R1: number,
  R2: number,
  R3: number,
  _w: number,
  _h: number,
  L: FrameLayout,
) {
  void R1;
  void R2;
  void R3;
  // Source and ground probes — always present.
  drawVoltageProbe(
    ctx,
    (L.batX + (L.batX + (L.outX - L.batX) * 0.2 - 22)) / 2,
    L.yTop - 16,
    V_FIXED,
  );
  drawVoltageProbe(ctx, (L.outX + L.batX) / 2, L.yBot + 18, 0);

  // Topology-specific probes for the interior nodes.
  switch (topology) {
    case 'series-parallel': {
      const xR1 = L.batX + (L.outX - L.batX) * 0.2;
      const nodeA = L.batX + (L.outX - L.batX) * 0.42;
      const nodeB = L.batX + (L.outX - L.batX) * 0.82;
      const branchY = L.yTop + 38;
      const xR23 = (nodeA + nodeB) / 2;
      drawVoltageProbe(ctx, (xR1 + 22 + nodeA) / 2, L.yTop - 16, net.nodes[0]?.value ?? 0);
      drawVoltageProbe(ctx, (nodeB + L.outX) / 2, L.yTop - 16, 0);
      const colors = getCanvasColors();
      ctx.save();
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = withAlpha(colors.blue, 0.95);
      ctx.fillText(`I₂ = ${net.branches[0]!.value.toFixed(2)} A`, xR23, L.yTop + 14);
      ctx.fillText(`I₃ = ${net.branches[1]!.value.toFixed(2)} A`, xR23, branchY + 14);
      ctx.fillStyle = withAlpha(colors.accent, 0.85);
      ctx.fillText(`I = ${net.Itot.toFixed(2)} A`, (L.batX + nodeA) / 2, L.yTop + 14);
      ctx.restore();
      break;
    }
    case 'parallel-series': {
      const nodeA = L.batX + (L.outX - L.batX) * 0.16;
      const nodeB = L.batX + (L.outX - L.batX) * 0.6;
      const xR12 = (nodeA + nodeB) / 2;
      const xR3 = L.batX + (L.outX - L.batX) * 0.82;
      const branchY = L.yTop + 38;
      drawVoltageProbe(ctx, (nodeB + xR3 - 22) / 2, L.yTop - 16, net.nodes[0]?.value ?? 0);
      drawVoltageProbe(ctx, (xR3 + 22 + L.outX) / 2, L.yTop - 16, 0);
      const colors = getCanvasColors();
      ctx.save();
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = withAlpha(colors.blue, 0.95);
      ctx.fillText(`I₁ = ${net.branches[0]!.value.toFixed(2)} A`, xR12, L.yTop + 14);
      ctx.fillText(`I₂ = ${net.branches[1]!.value.toFixed(2)} A`, xR12, branchY + 14);
      ctx.fillStyle = withAlpha(colors.accent, 0.85);
      ctx.fillText(`I = ${net.Itot.toFixed(2)} A`, (nodeB + xR3) / 2, L.yTop + 14);
      ctx.restore();
      break;
    }
    case 'three-series': {
      const xR1 = L.batX + (L.outX - L.batX) * 0.22;
      const xR2 = L.batX + (L.outX - L.batX) * 0.5;
      const xR3 = L.batX + (L.outX - L.batX) * 0.78;
      drawVoltageProbe(ctx, (xR1 + 22 + xR2 - 22) / 2, L.yTop - 16, net.nodes[0]?.value ?? 0);
      drawVoltageProbe(ctx, (xR2 + 22 + xR3 - 22) / 2, L.yTop - 16, net.nodes[1]?.value ?? 0);
      const colors = getCanvasColors();
      ctx.save();
      drawLabel(ctx, {
        x: (L.batX + xR1) / 2,
        y: L.yTop + 14,
        text: `I = ${net.Itot.toFixed(2)} A`,
        color: withAlpha(colors.accent, 0.85),
        align: 'center',
        baseline: 'middle',
      });
      ctx.restore();
      break;
    }
    case 'three-parallel': {
      const nodeA = L.batX + (L.outX - L.batX) * 0.18;
      const nodeB = L.batX + (L.outX - L.batX) * 0.82;
      const xR1 = (nodeA + nodeB) / 2;
      const yR2 = L.yTop + 38;
      const yR3 = L.yTop + 76;
      const colors = getCanvasColors();
      ctx.save();
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = withAlpha(colors.blue, 0.95);
      ctx.fillText(`I₁ = ${net.branches[0]!.value.toFixed(2)} A`, xR1, L.yTop + 14);
      ctx.fillText(`I₂ = ${net.branches[1]!.value.toFixed(2)} A`, xR1, yR2 + 14);
      ctx.fillText(`I₃ = ${net.branches[2]!.value.toFixed(2)} A`, xR1, yR3 + 14);
      ctx.fillStyle = withAlpha(colors.accent, 0.85);
      ctx.fillText(`I = ${net.Itot.toFixed(2)} A`, (L.batX + nodeA) / 2, L.yTop + 14);
      ctx.restore();
      break;
    }
  }
}

/* ─── Animated dots ────────────────────────────────────────────────────── */

function drawCurrentDotsPath(
  ctx: CanvasRenderingContext2D,
  t: number,
  pts: Array<{ x: number; y: number }>,
  Iscale: number,
) {
  const segs: Array<{ x0: number; y0: number; x1: number; y1: number; len: number }> = [];
  let total = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i]!;
    const b = pts[i + 1]!;
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    segs.push({ x0: a.x, y0: a.y, x1: b.x, y1: b.y, len });
    total += len;
  }
  if (total < 1) return;
  const spacing = 26;
  const visScale = Math.max(0.05, Math.min(3, Iscale));
  const speed = 80 * visScale;
  const offset = (t * speed) % spacing;
  const intensity = Math.max(0.2, Math.min(1, visScale));
  ctx.fillStyle = withAlpha(getCanvasColors().blue, 0.5 + 0.4 * intensity);
  for (let s = -spacing; s < total; s += spacing) {
    const d = s + offset;
    if (d < 0 || d > total) continue;
    let acc = 0;
    for (const sg of segs) {
      if (d <= acc + sg.len) {
        const f = (d - acc) / sg.len;
        const x = sg.x0 + (sg.x1 - sg.x0) * f;
        const y = sg.y0 + (sg.y1 - sg.y0) * f;
        ctx.beginPath();
        ctx.arc(x, y, 1.8 + 1.4 * intensity, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      acc += sg.len;
    }
  }
}

/* ─── Voltage probe ────────────────────────────────────────────────────── */

function drawVoltageProbe(ctx: CanvasRenderingContext2D, x: number, y: number, value: number) {
  const colors = getCanvasColors();
  const text = `${value.toFixed(2)} V`;
  ctx.save();
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const m = ctx.measureText(text);
  const boxW = m.width + 12;
  const boxH = 16;
  ctx.fillStyle = withAlpha(colors.bg, 0.85);
  ctx.fillRect(x - boxW / 2, y - boxH / 2, boxW, boxH);
  ctx.strokeStyle = withAlpha(colors.accent, 0.55);
  ctx.lineWidth = 1;
  ctx.strokeRect(x - boxW / 2, y - boxH / 2, boxW, boxH);
  ctx.fillStyle = colors.accent;
  ctx.fillText(text, x, y);
  ctx.restore();
}
