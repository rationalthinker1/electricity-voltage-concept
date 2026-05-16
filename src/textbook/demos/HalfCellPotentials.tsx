/**
 * Demo 18.5 — Standard half-cell potentials
 *
 * Pick any two half-cells from a tabulated list. The cell potential is
 * E°_cell = E°_cathode − E°_anode (anode = more negative; cathode = more
 * positive). Standard values referenced against SHE (H⁺/H₂ = 0.00 V).
 */
import { useState } from 'react';

import { Demo, DemoControls, MiniReadout } from '@/components/Demo';
import { Num } from '@/components/Num';

interface Props {
  figure?: string;
}

// Standard reduction potentials in volts vs SHE.
// Values from Bard & Faulkner (2001) and CRC Handbook.
const HALF_CELLS: Array<{ key: string; label: string; E: number }> = [
  { key: 'Li', label: 'Li⁺ + e⁻ → Li', E: -3.04 },
  { key: 'K', label: 'K⁺ + e⁻ → K', E: -2.93 },
  { key: 'Mg', label: 'Mg²⁺ + 2e⁻ → Mg', E: -2.37 },
  { key: 'Al', label: 'Al³⁺ + 3e⁻ → Al', E: -1.66 },
  { key: 'Zn', label: 'Zn²⁺ + 2e⁻ → Zn', E: -0.76 },
  { key: 'Fe', label: 'Fe²⁺ + 2e⁻ → Fe', E: -0.44 },
  { key: 'Pb', label: 'Pb²⁺ + 2e⁻ → Pb', E: -0.13 },
  { key: 'H', label: '2H⁺ + 2e⁻ → H₂  (SHE)', E: 0.0 },
  { key: 'Cu', label: 'Cu²⁺ + 2e⁻ → Cu', E: +0.34 },
  { key: 'Ag', label: 'Ag⁺ + e⁻ → Ag', E: +0.8 },
  { key: 'O', label: 'O₂ + 4H⁺ + 4e⁻ → 2H₂O', E: +1.23 },
  { key: 'F', label: 'F₂ + 2e⁻ → 2F⁻', E: +2.87 },
];

export function HalfCellPotentialsDemo({ figure }: Props) {
  const [anodeKey, setAnodeKey] = useState('Zn');
  const [cathodeKey, setCathodeKey] = useState('Cu');

  const anode = HALF_CELLS.find((c) => c.key === anodeKey)!;
  const cathode = HALF_CELLS.find((c) => c.key === cathodeKey)!;
  const Ecell = cathode.E - anode.E;
  const spontaneous = Ecell > 0;

  return (
    <Demo
      figure={figure ?? 'Fig. 18.5'}
      title="Predict a battery's voltage from its half-cells"
      question="Why does Zn / Cu give 1.10 V but Li / F₂ gives 5.91 V?"
      caption={
        <>
          All half-cells are tabulated as reduction potentials against the standard hydrogen
          electrode (SHE = 0.00 V). The cell potential is{' '}
          <strong>E°_cell = E°_cathode − E°_anode</strong>. A positive E°_cell means the reaction
          runs spontaneously left-to-right; that's the open-circuit voltage of the galvanic cell
          built from those two half-reactions.
        </>
      }
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
          padding: '8px 12px',
        }}
      >
        <HalfCellTable
          title="Anode (oxidation)"
          color="#5baef8"
          selected={anodeKey}
          onSelect={setAnodeKey}
        />
        <HalfCellTable
          title="Cathode (reduction)"
          color="#ff3b6e"
          selected={cathodeKey}
          onSelect={setCathodeKey}
        />
      </div>
      <DemoControls>
        <MiniReadout label="E°_anode" value={<Num value={anode.E} />} unit="V" />
        <MiniReadout label="E°_cathode" value={<Num value={cathode.E} />} unit="V" />
        <MiniReadout label="E°_cell" value={<Num value={Ecell} />} unit="V" />
        <MiniReadout label="spontaneous?" value={spontaneous ? 'yes' : 'no'} />
      </DemoControls>
    </Demo>
  );
}

function HalfCellTable({
  title,
  color,
  selected,
  onSelect,
}: {
  title: string;
  color: string;
  selected: string;
  onSelect: (k: string) => void;
}) {
  return (
    <div
      style={{
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 6,
        padding: 8,
        background: '#0d0d10',
      }}
    >
      <div
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 10,
          color,
          marginBottom: 6,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}
      >
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {HALF_CELLS.map((c) => {
          const isSel = c.key === selected;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => onSelect(c.key)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '4px 8px',
                background: isSel ? `${color}33` : 'transparent',
                border: isSel ? `1px solid ${color}` : '1px solid rgba(255,255,255,0.05)',
                borderRadius: 4,
                color: '#ecebe5',
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 11,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span>{c.label}</span>
              <span style={{ color: '#a09e95' }}>
                {c.E > 0 ? '+' : ''}
                {c.E.toFixed(2)} V
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
