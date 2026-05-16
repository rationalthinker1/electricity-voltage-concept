/**
 * Right-sidebar inspector: shows the selected component's editable value.
 *
 * The inspector is the *only* way to edit a value, by design — it keeps
 * the canvas free of clutter and gives each value a labelled input with
 * appropriate units.
 */

import clsx from 'clsx';
import type { PlacedComponent } from './types';
import { kindDisplayName } from './components';

interface InspectorProps {
  selected: PlacedComponent | null;
  onChange: (c: PlacedComponent) => void;
  onDelete: () => void;
  onRotate: () => void;
}

export function Inspector({ selected, onChange, onDelete, onRotate }: InspectorProps) {
  if (!selected) {
    return (
      <div className="gap-md flex flex-col">
        <div className="font-3 text-1 text-accent tracking-[.2em] uppercase">Inspector</div>
        <div className="text-2 text-text-muted leading-[1.5]">
          Click a component on the canvas to edit it.
        </div>
      </div>
    );
  }

  return (
    <div className="gap-md flex flex-col">
      <div className="font-3 text-1 text-accent tracking-[.2em] uppercase">Inspector</div>
      <div className="font-2 text-text text-[18px] italic">{kindDisplayName(selected.kind)}</div>

      {valueField(selected, onChange)}

      <div className="gap-sm mt-sm flex">
        <button
          type="button"
          className="bg-bg-elevated border-border text-text-dim font-3 rounded-2 duration-fast hover:text-text hover:border-text-dim flex-1 cursor-pointer border px-[10px] py-[6px] text-[11px] transition-all disabled:cursor-not-allowed disabled:opacity-40"
          onClick={onRotate}
          disabled={selected.kind === 'ground'}
        >
          Rotate
        </button>
        <button
          type="button"
          className="bg-bg-elevated border-border text-text-dim font-3 rounded-2 duration-fast hover:text-pink hover:border-pink flex-1 cursor-pointer border px-[10px] py-[6px] text-[11px] transition-all disabled:cursor-not-allowed disabled:opacity-40"
          onClick={onDelete}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

function valueField(c: PlacedComponent, onChange: (c: PlacedComponent) => void) {
  switch (c.kind) {
    case 'battery':
      return (
        <NumberField
          label="Voltage"
          unit="V"
          value={c.value}
          min={-100}
          max={100}
          step={0.1}
          onChange={(v) => onChange({ ...c, value: v })}
        />
      );
    case 'ac':
      return (
        <>
          <NumberField
            label="Peak voltage"
            unit="V₀"
            value={c.value}
            min={0}
            max={400}
            step={0.1}
            onChange={(v) => onChange({ ...c, value: v })}
          />
          <NumberField
            label="Frequency"
            unit="Hz"
            value={c.acFreq ?? 60}
            min={0.1}
            max={1e6}
            step={1}
            log
            onChange={(v) => onChange({ ...c, acFreq: v })}
          />
        </>
      );
    case 'resistor':
    case 'bulb':
      return (
        <NumberField
          label="Resistance"
          unit="Ω"
          value={c.value}
          min={0.01}
          max={1e7}
          step={1}
          log
          onChange={(v) => onChange({ ...c, value: v })}
        />
      );
    case 'capacitor':
      return (
        <NumberField
          label="Capacitance"
          unit="F"
          value={c.value}
          min={1e-12}
          max={1}
          step={1e-7}
          log
          onChange={(v) => onChange({ ...c, value: v })}
        />
      );
    case 'inductor':
      return (
        <NumberField
          label="Inductance"
          unit="H"
          value={c.value}
          min={1e-9}
          max={10}
          step={1e-6}
          log
          onChange={(v) => onChange({ ...c, value: v })}
        />
      );
    case 'switch':
      return (
        <div className="flex flex-col gap-[6px]">
          <label className="font-3 text-1 text-text-dim flex justify-between tracking-[.15em] uppercase">
            State
          </label>
          <button
            type="button"
            className={clsx(
              'bg-bg-elevated font-3 text-2 p-sm rounded-2 cursor-pointer border text-center',
              c.switchOpen ? 'text-pink border-pink' : 'text-teal border-teal',
            )}
            onClick={() => onChange({ ...c, switchOpen: !c.switchOpen })}
          >
            {c.switchOpen ? 'Open (off)' : 'Closed (on)'}
          </button>
        </div>
      );
    case 'diode':
      return (
        <div className="text-text-muted py-sm flex flex-col gap-[6px] text-[11px] leading-[1.5]">
          V_F = 0.7 V (piecewise-linear)
        </div>
      );
    case 'ground':
      return (
        <div className="text-text-muted py-sm flex flex-col gap-[6px] text-[11px] leading-[1.5]">
          Reference node. Every circuit needs at least one.
        </div>
      );
  }
}

interface NumberFieldProps {
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  step: number;
  log?: boolean;
  onChange: (v: number) => void;
}

function NumberField({ label, unit, value, min, max, step, log, onChange }: NumberFieldProps) {
  // For log-scale fields the slider works in log10 space.
  const safeMin = log ? Math.log10(Math.max(1e-12, min)) : min;
  const safeMax = log ? Math.log10(Math.max(1e-12, max)) : max;
  const safeVal = log ? Math.log10(Math.max(1e-12, value)) : value;

  return (
    <div className="flex flex-col gap-[6px]">
      <label className="font-3 text-1 text-text-dim flex justify-between tracking-[.15em] uppercase">
        {label}
        <span className="text-text-muted">{unit}</span>
      </label>
      <input
        type="number"
        className="bg-bg-elevated border-border text-text font-3 text-3 px-sm rounded-1 focus:border-accent box-border w-full border py-[6px] focus:outline-none"
        value={value}
        step={log ? 'any' : step}
        onChange={(e) => {
          const v = parseFloat(e.target.value);
          if (isFinite(v)) onChange(v);
        }}
      />
      <input
        type="range"
        className="accent-accent w-full"
        min={safeMin}
        max={safeMax}
        step={log ? (safeMax - safeMin) / 100 : step}
        value={safeVal}
        onChange={(e) => {
          const v = parseFloat(e.target.value);
          if (isFinite(v)) onChange(log ? Math.pow(10, v) : v);
        }}
      />
    </div>
  );
}
