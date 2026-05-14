/**
 * Demo 19.3 — Battery chemistry comparison
 *
 * Bar chart over selected chemistries: lead-acid, NiMH, LFP, NMC, NCA,
 * LMO. The reader picks the metric (energy density, cycle life, cost,
 * self-discharge) and the bars rescale. Approximate, datasheet-class
 * numbers — vendor-specific variants will deviate by tens of percent.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls } from '@/components/Demo';
import { getCanvasColors } from '@/lib/canvasTheme';

interface Props { figure?: string }

type MetricKey =
  | 'energy_kg' | 'energy_L' | 'cycles' | 'cost' | 'self_discharge' | 'V_cell';

interface MetricSpec {
  key: MetricKey;
  label: string;
  unit: string;
  format: (v: number) => string;
}

const METRICS: MetricSpec[] = [
  { key: 'energy_kg',      label: 'Energy density', unit: 'Wh / kg',  format: v => v.toFixed(0) },
  { key: 'energy_L',       label: 'Volumetric',     unit: 'Wh / L',   format: v => v.toFixed(0) },
  { key: 'cycles',         label: 'Cycle life',     unit: 'cycles',   format: v => v.toFixed(0) },
  { key: 'cost',           label: 'Cell cost',      unit: '$ / kWh',  format: v => v.toFixed(0) },
  { key: 'self_discharge', label: 'Self-discharge', unit: '% / month', format: v => v.toFixed(0) },
  { key: 'V_cell',         label: 'Cell voltage',   unit: 'V',        format: v => v.toFixed(2) },
];

interface Chem {
  key: string;
  name: string;
  color: string;
  data: Record<MetricKey, number>;
}

// Numbers are mid-range industry rules-of-thumb for current commodity cells.
const CHEMS: Chem[] = [
  {
    key: 'lead', name: 'Lead-acid', color: '#7d8082',
    data: { energy_kg: 35, energy_L: 80,  cycles: 500,  cost: 90,  self_discharge: 5,  V_cell: 2.10 },
  },
  {
    key: 'nimh', name: 'NiMH',      color: '#6cc5c2',
    data: { energy_kg: 80, energy_L: 250, cycles: 800,  cost: 350, self_discharge: 25, V_cell: 1.20 },
  },
  {
    key: 'lfp',  name: 'LFP',       color: '#5baef8',
    data: { energy_kg: 130, energy_L: 270, cycles: 3000, cost: 100, self_discharge: 3,  V_cell: 3.20 },
  },
  {
    key: 'nmc',  name: 'NMC',       color: '#ff6b2a',
    data: { energy_kg: 220, energy_L: 530, cycles: 1500, cost: 140, self_discharge: 3,  V_cell: 3.70 },
  },
  {
    key: 'nca',  name: 'NCA',       color: '#ff3b6e',
    data: { energy_kg: 240, energy_L: 600, cycles: 1000, cost: 150, self_discharge: 3,  V_cell: 3.60 },
  },
  {
    key: 'lmo',  name: 'LMO',       color: '#b87333',
    data: { energy_kg: 120, energy_L: 280, cycles: 700,  cost: 110, self_discharge: 4,  V_cell: 3.70 },
  },
];

export function ChemistryComparisonDemo({ figure }: Props) {
  const [metric, setMetric] = useState<MetricKey>('energy_kg');
  const spec = METRICS.find(m => m.key === metric)!;

  const stateRef = useRef({ metric, spec });
  useEffect(() => { stateRef.current = { metric, spec }; }, [metric, spec]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w: W, h: H } = info;
    let raf = 0;

    function draw() {
      const s = stateRef.current;
      ctx.fillStyle = getCanvasColors().bg;
      ctx.fillRect(0, 0, W, H);

      const pX = 56, pY = 24;
      const pW = W - 72, pH = H - 64;
      ctx.strokeStyle = getCanvasColors().border;
      ctx.strokeRect(pX, pY, pW, pH);

      const values = CHEMS.map(c => c.data[s.metric]);
      const vMax = Math.max(...values) * 1.1;

      const N = CHEMS.length;
      const barW = pW / N * 0.6;
      const slot = pW / N;

      for (let i = 0; i < N; i++) {
        const c = CHEMS[i];
        const v = c.data[s.metric];
        const x = pX + slot * i + slot / 2 - barW / 2;
        const barH = (v / vMax) * pH;
        const y = pY + pH - barH;
        ctx.fillStyle = c.color;
        ctx.fillRect(x, y, barW, barH);

        // value label on top
        ctx.fillStyle = getCanvasColors().text;
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(s.spec.format(v), x + barW / 2, y - 2);

        // x label
        ctx.fillStyle = getCanvasColors().textDim;
        ctx.textBaseline = 'top';
        ctx.fillText(c.name, x + barW / 2, pY + pH + 4);
      }

      // Metric label
      ctx.fillStyle = getCanvasColors().textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(`${s.spec.label}  (${s.spec.unit})`, pX, 6);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 19.3'}
      title="The Li-ion chemistry tree"
      question="LFP, NMC, NCA — what's the actual trade-off?"
      caption={
        <>
          All six chemistries are intercalation cells; the trade-offs come from cathode choice. LFP wins on cycle life
          and safety; NMC and NCA win on energy density; lead-acid stays in the picture because of cost and rugged
          high-current delivery. Numbers are typical mid-2020s commodity cells; specific vendor SKUs vary by tens of
          percent.
        </>
      }
    >
      <AutoResizeCanvas height={260} setup={setup} />
      <DemoControls>
        {METRICS.map(m => (
          <button
            key={m.key}
            type="button"
            className={`mini-toggle${metric === m.key ? ' on' : ''}`}
            onClick={() => setMetric(m.key)}
          >
            {m.label}
          </button>
        ))}
      </DemoControls>
    </Demo>
  );
}
