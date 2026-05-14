/**
 * Right-sidebar inspector for the Power Grid Simulator.
 *
 * Looks at the current Selection and renders an editor for the underlying
 * element. The inspector is the only place to edit per-element parameters —
 * the canvas stays uncluttered.
 */

import type { ReactNode } from 'react';

import type {
  Bus, Generator, GridDoc, Line, Load, Selection, Transformer,
} from './types';

interface Props {
  doc: GridDoc;
  selection: Selection | null;
  onUpdateBus: (b: Bus) => void;
  onUpdateGenerator: (busId: string, g: Generator) => void;
  onUpdateLoad: (busId: string, l: Load) => void;
  onUpdateLine: (l: Line) => void;
  onUpdateTransformer: (t: Transformer) => void;
  onDelete: () => void;
  onTripGenerator: (busId: string, genId: string) => void;
}

export function Inspector(props: Props) {
  const { doc, selection } = props;
  if (!selection) {
    return (
      <div className="pg-inspector">
        <div className="pg-inspector-title">Inspector</div>
        <div className="pg-inspector-empty">
          Click a bus, line, transformer, generator, or load on the canvas to edit it.
        </div>
      </div>
    );
  }

  let body: ReactNode = null;
  let kindLabel = '';

  if (selection.kind === 'bus') {
    const b = doc.buses.find((x) => x.id === selection.id);
    if (!b) return null;
    kindLabel = 'Bus';
    body = <BusFields bus={b} onChange={props.onUpdateBus} />;
  } else if (selection.kind === 'line') {
    const l = doc.lines.find((x) => x.id === selection.id);
    if (!l) return null;
    kindLabel = 'Transmission line';
    body = <LineFields line={l} onChange={props.onUpdateLine} />;
  } else if (selection.kind === 'transformer') {
    const t = doc.transformers.find((x) => x.id === selection.id);
    if (!t) return null;
    kindLabel = 'Transformer';
    body = <TransformerFields tx={t} onChange={props.onUpdateTransformer} />;
  } else if (selection.kind === 'generator') {
    const b = doc.buses.find((x) => x.id === selection.parentBusId);
    const g = b?.generators.find((x) => x.id === selection.id);
    if (!b || !g) return null;
    kindLabel = `${capitalize(g.kind)} generator`;
    body = (
      <GeneratorFields
        gen={g}
        onChange={(ng) => props.onUpdateGenerator(b.id, ng)}
        onTrip={() => props.onTripGenerator(b.id, g.id)}
      />
    );
  } else if (selection.kind === 'load') {
    const b = doc.buses.find((x) => x.id === selection.parentBusId);
    const l = b?.loads.find((x) => x.id === selection.id);
    if (!b || !l) return null;
    kindLabel = `${capitalize(l.kind)} load`;
    body = <LoadFields ld={l} onChange={(nl) => props.onUpdateLoad(b.id, nl)} />;
  }

  return (
    <div className="pg-inspector">
      <div className="pg-inspector-title">Inspector</div>
      <div className="pg-inspector-kind">{kindLabel}</div>
      {body}
      <div className="pg-inspector-actions">
        <button type="button" className="pg-inspector-btn danger" onClick={props.onDelete}>
          Delete
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────── Per-kind fields ─────────────────────────── */

function BusFields({ bus, onChange }: { bus: Bus; onChange: (b: Bus) => void }) {
  return (
    <>
      <TextField
        label="Label"
        value={bus.label ?? ''}
        onChange={(v) => onChange({ ...bus, label: v })}
      />
      <NumberField
        label="Nominal kV" unit="kV"
        value={bus.kv}
        min={0.48} max={500} step={0.01}
        onChange={(v) => onChange({ ...bus, kv: (v as Bus['kv']) })}
      />
      <StaticField label="Generators" value={String(bus.generators.length)} />
      <StaticField label="Loads" value={String(bus.loads.length)} />
    </>
  );
}

function LineFields({ line, onChange }: { line: Line; onChange: (l: Line) => void }) {
  return (
    <>
      <NumberField
        label="Length" unit="mi"
        value={line.lengthMi} min={1} max={500} step={1}
        onChange={(v) => onChange({ ...line, lengthMi: v })}
      />
      <NumberField
        label="Resistance R" unit="pu"
        value={line.rPu} min={0.0001} max={1} step={0.0001}
        onChange={(v) => onChange({ ...line, rPu: v })}
      />
      <NumberField
        label="Reactance X" unit="pu"
        value={line.xPu} min={0.0001} max={2} step={0.0001}
        onChange={(v) => onChange({ ...line, xPu: v })}
      />
      <NumberField
        label="Thermal rating" unit="MVA"
        value={line.ratingMVA} min={10} max={2000} step={10}
        onChange={(v) => onChange({ ...line, ratingMVA: v })}
      />
    </>
  );
}

function TransformerFields({ tx, onChange }: { tx: Transformer; onChange: (t: Transformer) => void }) {
  return (
    <>
      <NumberField
        label="Rating" unit="MVA"
        value={tx.ratingMVA} min={10} max={2000} step={10}
        onChange={(v) => onChange({ ...tx, ratingMVA: v })}
      />
      <NumberField
        label="Leakage reactance X" unit="pu"
        value={tx.xPu} min={0.01} max={0.5} step={0.005}
        onChange={(v) => onChange({ ...tx, xPu: v })}
      />
    </>
  );
}

function GeneratorFields({
  gen, onChange, onTrip,
}: {
  gen: Generator;
  onChange: (g: Generator) => void;
  onTrip: () => void;
}) {
  return (
    <>
      <NumberField
        label="Rated capacity" unit="MW"
        value={gen.ratedMW} min={1} max={2000} step={1}
        onChange={(v) => onChange({ ...gen, ratedMW: v })}
      />
      <NumberField
        label="Dispatch" unit="fraction"
        value={gen.dispatch}
        min={gen.kind === 'battery' ? -1 : 0} max={1} step={0.01}
        onChange={(v) => onChange({ ...gen, dispatch: v })}
      />
      <NumberField
        label="Inertia H" unit="s"
        value={gen.H} min={0} max={10} step={0.1}
        onChange={(v) => onChange({ ...gen, H: v })}
      />
      <NumberField
        label="Droop R" unit="fraction"
        value={gen.droop} min={0} max={0.20} step={0.005}
        onChange={(v) => onChange({ ...gen, droop: v })}
      />
      <NumberField
        label="Variable cost" unit="$/MWh"
        value={gen.cost} min={0} max={500} step={1}
        onChange={(v) => onChange({ ...gen, cost: v })}
      />
      <NumberField
        label="CO₂ intensity" unit="kg/MWh"
        value={gen.co2} min={0} max={1500} step={10}
        onChange={(v) => onChange({ ...gen, co2: v })}
      />
      {gen.kind === 'battery' && gen.energyMWh !== undefined && (
        <>
          <NumberField
            label="Energy capacity" unit="MWh"
            value={gen.energyMWh} min={10} max={2000} step={10}
            onChange={(v) => onChange({ ...gen, energyMWh: v })}
          />
          <NumberField
            label="State of charge" unit="fraction"
            value={gen.soc ?? 0.5} min={0} max={1} step={0.01}
            onChange={(v) => onChange({ ...gen, soc: v })}
          />
        </>
      )}
      <button
        type="button"
        className={'pg-toggle ' + (gen.tripped ? 'open' : 'closed')}
        onClick={onTrip}
      >
        {gen.tripped ? 'Tripped (restore)' : 'Online (trip)'}
      </button>
    </>
  );
}

function LoadFields({ ld, onChange }: { ld: Load; onChange: (l: Load) => void }) {
  return (
    <>
      <NumberField
        label="Rated demand" unit="MW"
        value={ld.ratedMW} min={1} max={1000} step={1}
        onChange={(v) => onChange({ ...ld, ratedMW: v })}
      />
      <NumberField
        label="Demand scale" unit="fraction"
        value={ld.demandScale} min={0} max={1.5} step={0.01}
        onChange={(v) => onChange({ ...ld, demandScale: v })}
      />
      <NumberField
        label="Power factor" unit=""
        value={ld.pf} min={0.7} max={1.0} step={0.01}
        onChange={(v) => onChange({ ...ld, pf: v })}
      />
      <StaticField
        label="Voltage dependence"
        value={
          ld.kind === 'residential' ? 'P ∝ V² (constant Z)'
          : ld.kind === 'motor' ? 'P ∝ V (constant I)'
          : 'P fixed (constant P)'
        }
      />
    </>
  );
}

/* ─────────────────────────── Field primitives ─────────────────────────── */

interface NumberFieldProps {
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}

function NumberField({ label, unit, value, min, max, step, onChange }: NumberFieldProps) {
  return (
    <div className="pg-field">
      <label className="pg-field-label">
        {label}
        <span className="pg-field-unit">{unit}</span>
      </label>
      <input
        type="number"
        className="pg-field-input"
        value={value}
        step={step}
        onChange={(e) => {
          const v = parseFloat(e.target.value);
          if (isFinite(v)) onChange(v);
        }}
      />
      <input
        type="range"
        className="pg-field-slider"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => {
          const v = parseFloat(e.target.value);
          if (isFinite(v)) onChange(v);
        }}
      />
    </div>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="pg-field">
      <label className="pg-field-label">{label}</label>
      <input
        type="text"
        className="pg-field-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function StaticField({ label, value }: { label: string; value: string }) {
  return (
    <div className="pg-field">
      <label className="pg-field-label">{label}</label>
      <div className="pg-field-static">{value}</div>
    </div>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
