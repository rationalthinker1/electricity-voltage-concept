/**
 * Preset circuits that load into the editor.
 *
 * Grid units: 1 cell = 20 pixels in the canvas. Components are 2 cells wide
 * along their long axis, so a horizontal resistor at (x,y) has pins at
 * (x,y) and (x+2,y).
 *
 * Each preset gives the textbook reader something to recognise instantly:
 * battery + bulb (Ohm's law), divider, RC, RLC, half-wave rectifier.
 */

import type { CircuitDoc, CircuitPreset } from './types';

let _idn = 0;
const id = (k: string) => `${k}-${++_idn}`;

function mkDoc(): CircuitDoc {
  return { components: [], wires: [], probes: [] };
}

/* ───────────── 1. Battery + bulb ───────────── */
function batteryBulb(): CircuitDoc {
  _idn = 0;
  const d = mkDoc();
  // Layout (grid):
  //  (4,3) battery → (6,3)
  //  (6,3) wire     → (12,3)
  //  (12,3) bulb    → (14,3)
  //  (14,3) wire    → (14,7) → (4,7) → (4,3) → ground @ (4,7)
  d.components.push(
    { id: id('bat'), kind: 'battery',  x: 4,  y: 3, rotation: 0,   value: 9 },
    { id: id('bulb'), kind: 'bulb',    x: 12, y: 3, rotation: 0,   value: 50 },
    { id: id('gnd'),  kind: 'ground',  x: 4,  y: 7, rotation: 0,   value: 0 },
  );
  d.wires.push(
    { id: id('w'), from: { x: 6,  y: 3 }, to: { x: 12, y: 3 } },
    { id: id('w'), from: { x: 14, y: 3 }, to: { x: 14, y: 7 } },
    { id: id('w'), from: { x: 14, y: 7 }, to: { x: 4,  y: 7 } },
    { id: id('w'), from: { x: 4,  y: 3 }, to: { x: 4,  y: 7 } },
  );
  return d;
}

/* ───────────── 2. Voltage divider ───────────── */
function voltageDivider(): CircuitDoc {
  _idn = 0;
  const d = mkDoc();
  // Vertical stack: battery on left, R1 then R2 on right, ground at bottom.
  //   (4,1) battery → (4,3)       (vertical, pin0 top)
  //   (4,3) wire     → (10,3)
  //   (10,3) R1     → (10,5)
  //   (10,5) R2     → (10,7)  ←  V_OUT probe at (10,5)
  //   (10,7) wire   → (4,7) → ground
  //   battery bottom pin (4,3) is the +
  // Use horizontal battery for simpler routing:
  d.components.push(
    { id: id('bat'), kind: 'battery',  x: 4,  y: 2, rotation: 0,  value: 12 },
    { id: id('r1'),  kind: 'resistor', x: 10, y: 2, rotation: 90, value: 1000 }, // 1 kΩ down
    { id: id('r2'),  kind: 'resistor', x: 10, y: 4, rotation: 90, value: 1000 },
    { id: id('gnd'), kind: 'ground',   x: 4,  y: 6, rotation: 0,  value: 0 },
  );
  d.wires.push(
    { id: id('w'), from: { x: 6,  y: 2 }, to: { x: 10, y: 2 } },
    { id: id('w'), from: { x: 10, y: 6 }, to: { x: 4,  y: 6 } },
    { id: id('w'), from: { x: 4,  y: 2 }, to: { x: 4,  y: 6 } },
  );
  d.probes.push({ id: id('p'), kind: 'voltmeter', at: { x: 10, y: 4 } });
  return d;
}

/* ───────────── 3. RC charging ───────────── */
function rcCharging(): CircuitDoc {
  _idn = 0;
  const d = mkDoc();
  // Battery → switch → R → C → ground
  //   (3,3) bat → (5,3)   (3,3 is -, 5,3 is +)
  //   (5,3) wire → (7,3)
  //   (7,3) switch → (9,3)
  //   (9,3) wire → (11,3)
  //   (11,3) R → (13,3)
  //   (13,3) C vertical → (13,5)
  //   (13,5) wire → (3,5) → ground at (3,5)
  d.components.push(
    { id: id('bat'),   kind: 'battery',   x: 3,  y: 3, rotation: 0,  value: 5 },
    { id: id('sw'),    kind: 'switch',    x: 7,  y: 3, rotation: 0,  value: 0, switchOpen: false },
    { id: id('r'),     kind: 'resistor',  x: 11, y: 3, rotation: 0,  value: 1000 },
    { id: id('c'),     kind: 'capacitor', x: 13, y: 3, rotation: 90, value: 1e-6 },
    { id: id('gnd'),   kind: 'ground',    x: 3,  y: 5, rotation: 0,  value: 0 },
  );
  d.wires.push(
    { id: id('w'), from: { x: 5,  y: 3 }, to: { x: 7,  y: 3 } },
    { id: id('w'), from: { x: 9,  y: 3 }, to: { x: 11, y: 3 } },
    { id: id('w'), from: { x: 13, y: 5 }, to: { x: 3,  y: 5 } },
    { id: id('w'), from: { x: 3,  y: 3 }, to: { x: 3,  y: 5 } },
  );
  d.probes.push({ id: id('p'), kind: 'voltmeter', at: { x: 13, y: 3 } });
  return d;
}

/* ───────────── 4. RLC series resonator ───────────── */
function rlcResonator(): CircuitDoc {
  _idn = 0;
  const d = mkDoc();
  // AC → R → L → C → ground (series loop)
  d.components.push(
    { id: id('ac'),  kind: 'ac',        x: 3,  y: 3, rotation: 0,  value: 10, acFreq: 500 },
    { id: id('r'),   kind: 'resistor',  x: 6,  y: 3, rotation: 0,  value: 10 },
    { id: id('l'),   kind: 'inductor',  x: 9,  y: 3, rotation: 0,  value: 10e-3 },
    { id: id('c'),   kind: 'capacitor', x: 12, y: 3, rotation: 0,  value: 10e-6 },
    { id: id('gnd'), kind: 'ground',    x: 3,  y: 5, rotation: 0,  value: 0 },
  );
  d.wires.push(
    { id: id('w'), from: { x: 5,  y: 3 }, to: { x: 6,  y: 3 } },
    { id: id('w'), from: { x: 8,  y: 3 }, to: { x: 9,  y: 3 } },
    { id: id('w'), from: { x: 11, y: 3 }, to: { x: 12, y: 3 } },
    { id: id('w'), from: { x: 14, y: 3 }, to: { x: 14, y: 5 } },
    { id: id('w'), from: { x: 14, y: 5 }, to: { x: 3,  y: 5 } },
    { id: id('w'), from: { x: 3,  y: 3 }, to: { x: 3,  y: 5 } },
  );
  d.probes.push({ id: id('p'), kind: 'voltmeter', at: { x: 12, y: 3 } });
  return d;
}

/* ───────────── 5. Half-wave rectifier ───────────── */
function halfWaveRectifier(): CircuitDoc {
  _idn = 0;
  const d = mkDoc();
  //  AC → diode → R(load) → ground
  d.components.push(
    { id: id('ac'),  kind: 'ac',       x: 3,  y: 3, rotation: 0,  value: 10, acFreq: 60 },
    { id: id('d'),   kind: 'diode',    x: 7,  y: 3, rotation: 0,  value: 0 },
    { id: id('r'),   kind: 'resistor', x: 11, y: 3, rotation: 0,  value: 100 },
    { id: id('gnd'), kind: 'ground',   x: 3,  y: 6, rotation: 0,  value: 0 },
  );
  d.wires.push(
    { id: id('w'), from: { x: 5,  y: 3 }, to: { x: 7,  y: 3 } },
    { id: id('w'), from: { x: 9,  y: 3 }, to: { x: 11, y: 3 } },
    { id: id('w'), from: { x: 13, y: 3 }, to: { x: 13, y: 6 } },
    { id: id('w'), from: { x: 13, y: 6 }, to: { x: 3,  y: 6 } },
    { id: id('w'), from: { x: 3,  y: 3 }, to: { x: 3,  y: 6 } },
  );
  d.probes.push({ id: id('p'), kind: 'voltmeter', at: { x: 11, y: 3 } });
  return d;
}

export const PRESETS: CircuitPreset[] = [
  {
    id: 'battery-bulb',
    name: 'Battery + Bulb',
    description: '9 V battery driving a 50 Ω bulb. Bulb glows; current ≈ 0.18 A.',
    doc: batteryBulb(),
  },
  {
    id: 'voltage-divider',
    name: 'Voltage Divider',
    description: '12 V → 1 kΩ → 1 kΩ → ground. V_OUT at the midpoint = 6 V.',
    doc: voltageDivider(),
  },
  {
    id: 'rc-charging',
    name: 'RC Charging',
    description: '5 V through 1 kΩ into 1 µF cap. τ = RC = 1 ms; watch the curve.',
    doc: rcCharging(),
  },
  {
    id: 'rlc',
    name: 'RLC Resonator',
    description: '10 V AC at 500 Hz, 10 Ω, 10 mH, 10 µF in series.',
    doc: rlcResonator(),
  },
  {
    id: 'half-wave',
    name: 'Half-Wave Rectifier',
    description: '10 V AC at 60 Hz → diode → 100 Ω load.',
    doc: halfWaveRectifier(),
  },
];

/** Clone a preset's document so the user can mutate it without affecting the source. */
export function clonePresetDoc(doc: CircuitDoc): CircuitDoc {
  let n = 0;
  const fresh = () => `c${Date.now()}-${++n}`;
  const idMap = new Map<string, string>();
  return {
    components: doc.components.map(c => {
      const newId = fresh();
      idMap.set(c.id, newId);
      return { ...c, id: newId };
    }),
    wires: doc.wires.map(w => ({ ...w, id: fresh(), from: { ...w.from }, to: { ...w.to } })),
    probes: doc.probes.map(p => ({
      ...p,
      id: fresh(),
      at: p.at ? { ...p.at } : undefined,
      componentId: p.componentId ? idMap.get(p.componentId) ?? p.componentId : undefined,
    })),
  };
}
