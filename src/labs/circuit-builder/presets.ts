/**
 * Preset circuits that load into the editor.
 *
 * Grid units: 1 cell = 20 pixels in the canvas. Components are 2 cells wide
 * along their long axis, so a horizontal resistor at (x,y) has pins at
 * (x,y) and (x+2,y).
 *
 * Each preset is a self-contained lesson: concept, formulas, worked
 * calculation, and interactive experiment hints.
 */

import type { CircuitDoc, CircuitPreset } from './types';

let _idn = 0;
const id = (k: string) => `${k}-${++_idn}`;

function mkDoc(): CircuitDoc {
  return { components: [], wires: [], probes: [] };
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  1. Ohm's Law                                                              */
/* ═══════════════════════════════════════════════════════════════════════════ */
function ohmsLaw(): CircuitDoc {
  _idn = 0;
  const d = mkDoc();
  d.components.push(
    { id: id('bat'), kind: 'battery', x: 4, y: 3, rotation: 0, value: 9 },
    { id: id('r'), kind: 'resistor', x: 10, y: 3, rotation: 0, value: 100 },
    { id: id('gnd'), kind: 'ground', x: 4, y: 7, rotation: 0, value: 0 },
  );
  d.wires.push(
    { id: id('w'), from: { x: 6, y: 3 }, to: { x: 10, y: 3 } },
    { id: id('w'), from: { x: 12, y: 3 }, to: { x: 12, y: 7 } },
    { id: id('w'), from: { x: 12, y: 7 }, to: { x: 4, y: 7 } },
    { id: id('w'), from: { x: 4, y: 3 }, to: { x: 4, y: 7 } },
  );
  d.probes.push({ id: id('p'), kind: 'ammeter', componentId: d.components[1]!.id });
  return d;
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  2. Parallel Resistors  (KCL intro)                                        */
/* ═══════════════════════════════════════════════════════════════════════════ */
function parallelResistors(): CircuitDoc {
  _idn = 0;
  const d = mkDoc();
  d.components.push(
    { id: id('bat'), kind: 'battery', x: 3, y: 4, rotation: 0, value: 12 },
    { id: id('r1'), kind: 'resistor', x: 9, y: 2, rotation: 0, value: 200 },
    { id: id('r2'), kind: 'resistor', x: 9, y: 6, rotation: 0, value: 300 },
    { id: id('gnd'), kind: 'ground', x: 3, y: 8, rotation: 0, value: 0 },
  );
  d.wires.push(
    { id: id('w'), from: { x: 5, y: 4 }, to: { x: 7, y: 4 } },
    { id: id('w'), from: { x: 7, y: 4 }, to: { x: 7, y: 2 } },
    { id: id('w'), from: { x: 7, y: 2 }, to: { x: 9, y: 2 } },
    { id: id('w'), from: { x: 7, y: 4 }, to: { x: 7, y: 6 } },
    { id: id('w'), from: { x: 7, y: 6 }, to: { x: 9, y: 6 } },
    { id: id('w'), from: { x: 11, y: 2 }, to: { x: 11, y: 4 } },
    { id: id('w'), from: { x: 11, y: 6 }, to: { x: 11, y: 4 } },
    { id: id('w'), from: { x: 11, y: 4 }, to: { x: 11, y: 8 } },
    { id: id('w'), from: { x: 11, y: 8 }, to: { x: 3, y: 8 } },
    { id: id('w'), from: { x: 3, y: 4 }, to: { x: 3, y: 8 } },
  );
  d.probes.push(
    { id: id('p1'), kind: 'ammeter', componentId: d.components[1]!.id },
    { id: id('p2'), kind: 'ammeter', componentId: d.components[2]!.id },
    { id: id('p3'), kind: 'voltmeter', at: { x: 7, y: 4 } },
  );
  return d;
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  3. Series–Parallel Network                                                */
/* ═══════════════════════════════════════════════════════════════════════════ */
function seriesParallel(): CircuitDoc {
  _idn = 0;
  const d = mkDoc();
  d.components.push(
    { id: id('bat'), kind: 'battery', x: 3, y: 4, rotation: 0, value: 12 },
    { id: id('rs'), kind: 'resistor', x: 7, y: 4, rotation: 0, value: 100 },
    { id: id('r1'), kind: 'resistor', x: 11, y: 2, rotation: 0, value: 200 },
    { id: id('r2'), kind: 'resistor', x: 11, y: 6, rotation: 0, value: 200 },
    { id: id('gnd'), kind: 'ground', x: 3, y: 8, rotation: 0, value: 0 },
  );
  d.wires.push(
    { id: id('w'), from: { x: 5, y: 4 }, to: { x: 7, y: 4 } },
    { id: id('w'), from: { x: 9, y: 4 }, to: { x: 11, y: 2 } },
    { id: id('w'), from: { x: 9, y: 4 }, to: { x: 11, y: 6 } },
    { id: id('w'), from: { x: 13, y: 2 }, to: { x: 13, y: 8 } },
    { id: id('w'), from: { x: 13, y: 6 }, to: { x: 13, y: 8 } },
    { id: id('w'), from: { x: 3, y: 8 }, to: { x: 13, y: 8 } },
    { id: id('w'), from: { x: 3, y: 4 }, to: { x: 3, y: 8 } },
  );
  d.probes.push(
    { id: id('p1'), kind: 'ammeter', componentId: d.components[1]!.id },
    { id: id('p2'), kind: 'ammeter', componentId: d.components[2]!.id },
    { id: id('p3'), kind: 'ammeter', componentId: d.components[3]!.id },
    { id: id('p4'), kind: 'voltmeter', at: { x: 9, y: 4 } },
  );
  return d;
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  4. KVL — Series Loop                                                      */
/* ═══════════════════════════════════════════════════════════════════════════ */
function kvlLoop(): CircuitDoc {
  _idn = 0;
  const d = mkDoc();
  d.components.push(
    { id: id('bat'), kind: 'battery', x: 4, y: 3, rotation: 0, value: 12 },
    { id: id('r1'), kind: 'resistor', x: 8, y: 3, rotation: 0, value: 100 },
    { id: id('r2'), kind: 'resistor', x: 12, y: 3, rotation: 0, value: 200 },
    { id: id('r3'), kind: 'resistor', x: 16, y: 3, rotation: 0, value: 300 },
    { id: id('gnd'), kind: 'ground', x: 4, y: 7, rotation: 0, value: 0 },
  );
  d.wires.push(
    { id: id('w'), from: { x: 6, y: 3 }, to: { x: 8, y: 3 } },
    { id: id('w'), from: { x: 10, y: 3 }, to: { x: 12, y: 3 } },
    { id: id('w'), from: { x: 14, y: 3 }, to: { x: 16, y: 3 } },
    { id: id('w'), from: { x: 18, y: 3 }, to: { x: 18, y: 7 } },
    { id: id('w'), from: { x: 18, y: 7 }, to: { x: 4, y: 7 } },
    { id: id('w'), from: { x: 4, y: 3 }, to: { x: 4, y: 7 } },
  );
  d.probes.push(
    { id: id('p1'), kind: 'voltmeter', at: { x: 10, y: 3 } },
    { id: id('p2'), kind: 'voltmeter', at: { x: 14, y: 3 } },
    { id: id('p3'), kind: 'voltmeter', at: { x: 18, y: 3 } },
    { id: id('p4'), kind: 'ammeter', componentId: d.components[1]!.id },
  );
  return d;
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  5. KCL — Current Splits at a Node                                         */
/* ═══════════════════════════════════════════════════════════════════════════ */
function kclNode(): CircuitDoc {
  _idn = 0;
  const d = mkDoc();
  d.components.push(
    { id: id('bat'), kind: 'battery', x: 3, y: 4, rotation: 0, value: 12 },
    { id: id('rs'), kind: 'resistor', x: 7, y: 4, rotation: 0, value: 100 },
    { id: id('r1'), kind: 'resistor', x: 11, y: 2, rotation: 0, value: 200 },
    { id: id('r2'), kind: 'resistor', x: 11, y: 6, rotation: 0, value: 300 },
    { id: id('r3'), kind: 'resistor', x: 15, y: 4, rotation: 0, value: 600 },
    { id: id('gnd'), kind: 'ground', x: 3, y: 8, rotation: 0, value: 0 },
  );
  d.wires.push(
    { id: id('w'), from: { x: 5, y: 4 }, to: { x: 7, y: 4 } },
    { id: id('w'), from: { x: 9, y: 4 }, to: { x: 11, y: 2 } },
    { id: id('w'), from: { x: 9, y: 4 }, to: { x: 11, y: 6 } },
    { id: id('w'), from: { x: 9, y: 4 }, to: { x: 15, y: 4 } },
    { id: id('w'), from: { x: 13, y: 2 }, to: { x: 13, y: 8 } },
    { id: id('w'), from: { x: 13, y: 6 }, to: { x: 13, y: 8 } },
    { id: id('w'), from: { x: 17, y: 4 }, to: { x: 17, y: 8 } },
    { id: id('w'), from: { x: 3, y: 8 }, to: { x: 17, y: 8 } },
    { id: id('w'), from: { x: 3, y: 4 }, to: { x: 3, y: 8 } },
  );
  d.probes.push(
    { id: id('p1'), kind: 'ammeter', componentId: d.components[1]!.id },
    { id: id('p2'), kind: 'ammeter', componentId: d.components[2]!.id },
    { id: id('p3'), kind: 'ammeter', componentId: d.components[3]!.id },
    { id: id('p4'), kind: 'ammeter', componentId: d.components[4]!.id },
    { id: id('p5'), kind: 'voltmeter', at: { x: 9, y: 4 } },
  );
  return d;
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  6. Voltage Divider                                                        */
/* ═══════════════════════════════════════════════════════════════════════════ */
function voltageDivider(): CircuitDoc {
  _idn = 0;
  const d = mkDoc();
  d.components.push(
    { id: id('bat'), kind: 'battery', x: 4, y: 2, rotation: 0, value: 12 },
    { id: id('r1'), kind: 'resistor', x: 10, y: 2, rotation: 90, value: 1000 },
    { id: id('r2'), kind: 'resistor', x: 10, y: 4, rotation: 90, value: 1000 },
    { id: id('gnd'), kind: 'ground', x: 4, y: 6, rotation: 0, value: 0 },
  );
  d.wires.push(
    { id: id('w'), from: { x: 6, y: 2 }, to: { x: 10, y: 2 } },
    { id: id('w'), from: { x: 10, y: 6 }, to: { x: 4, y: 6 } },
    { id: id('w'), from: { x: 4, y: 2 }, to: { x: 4, y: 6 } },
  );
  d.probes.push({ id: id('p'), kind: 'voltmeter', at: { x: 10, y: 4 } });
  return d;
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  7. Loaded Voltage Divider                                                 */
/* ═══════════════════════════════════════════════════════════════════════════ */
function loadedDivider(): CircuitDoc {
  _idn = 0;
  const d = mkDoc();
  d.components.push(
    { id: id('bat'), kind: 'battery', x: 4, y: 2, rotation: 0, value: 12 },
    { id: id('r1'), kind: 'resistor', x: 10, y: 2, rotation: 90, value: 1000 },
    { id: id('r2'), kind: 'resistor', x: 10, y: 4, rotation: 90, value: 1000 },
    { id: id('rl'), kind: 'resistor', x: 14, y: 4, rotation: 90, value: 1000 },
    { id: id('gnd'), kind: 'ground', x: 4, y: 6, rotation: 0, value: 0 },
  );
  d.wires.push(
    { id: id('w'), from: { x: 6, y: 2 }, to: { x: 10, y: 2 } },
    { id: id('w'), from: { x: 10, y: 6 }, to: { x: 4, y: 6 } },
    { id: id('w'), from: { x: 4, y: 2 }, to: { x: 4, y: 6 } },
    { id: id('w'), from: { x: 10, y: 4 }, to: { x: 14, y: 4 } },
    { id: id('w'), from: { x: 14, y: 6 }, to: { x: 10, y: 6 } },
  );
  d.probes.push(
    { id: id('p1'), kind: 'voltmeter', at: { x: 10, y: 4 } },
    { id: id('p2'), kind: 'ammeter', componentId: d.components[3]!.id },
  );
  return d;
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  8. RC Charging                                                            */
/* ═══════════════════════════════════════════════════════════════════════════ */
function rcCharging(): CircuitDoc {
  _idn = 0;
  const d = mkDoc();
  d.components.push(
    { id: id('bat'), kind: 'battery', x: 3, y: 3, rotation: 0, value: 5 },
    { id: id('sw'), kind: 'switch', x: 7, y: 3, rotation: 0, value: 0, switchOpen: false },
    { id: id('r'), kind: 'resistor', x: 11, y: 3, rotation: 0, value: 1000 },
    { id: id('c'), kind: 'capacitor', x: 13, y: 3, rotation: 90, value: 1e-6 },
    { id: id('gnd'), kind: 'ground', x: 3, y: 5, rotation: 0, value: 0 },
  );
  d.wires.push(
    { id: id('w'), from: { x: 5, y: 3 }, to: { x: 7, y: 3 } },
    { id: id('w'), from: { x: 9, y: 3 }, to: { x: 11, y: 3 } },
    { id: id('w'), from: { x: 13, y: 5 }, to: { x: 3, y: 5 } },
    { id: id('w'), from: { x: 3, y: 3 }, to: { x: 3, y: 5 } },
  );
  d.probes.push({ id: id('p'), kind: 'voltmeter', at: { x: 13, y: 3 } });
  return d;
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  9. RL Time Constant                                                       */
/* ═══════════════════════════════════════════════════════════════════════════ */
function rlCircuit(): CircuitDoc {
  _idn = 0;
  const d = mkDoc();
  d.components.push(
    { id: id('bat'), kind: 'battery', x: 3, y: 3, rotation: 0, value: 12 },
    { id: id('sw'), kind: 'switch', x: 7, y: 3, rotation: 0, value: 0, switchOpen: false },
    { id: id('r'), kind: 'resistor', x: 11, y: 3, rotation: 0, value: 100 },
    { id: id('l'), kind: 'inductor', x: 15, y: 3, rotation: 0, value: 10e-3 },
    { id: id('gnd'), kind: 'ground', x: 3, y: 7, rotation: 0, value: 0 },
  );
  d.wires.push(
    { id: id('w'), from: { x: 5, y: 3 }, to: { x: 7, y: 3 } },
    { id: id('w'), from: { x: 9, y: 3 }, to: { x: 11, y: 3 } },
    { id: id('w'), from: { x: 13, y: 3 }, to: { x: 15, y: 3 } },
    { id: id('w'), from: { x: 17, y: 3 }, to: { x: 17, y: 7 } },
    { id: id('w'), from: { x: 17, y: 7 }, to: { x: 3, y: 7 } },
    { id: id('w'), from: { x: 3, y: 3 }, to: { x: 3, y: 7 } },
  );
  d.probes.push(
    { id: id('p1'), kind: 'ammeter', componentId: d.components[3]!.id },
    { id: id('p2'), kind: 'voltmeter', at: { x: 15, y: 3 } },
  );
  return d;
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  10. RC Low-Pass Filter                                                    */
/* ═══════════════════════════════════════════════════════════════════════════ */
function rcLowpass(): CircuitDoc {
  _idn = 0;
  const d = mkDoc();
  d.components.push(
    { id: id('ac'), kind: 'ac', x: 3, y: 3, rotation: 0, value: 5, acFreq: 100 },
    { id: id('r'), kind: 'resistor', x: 8, y: 3, rotation: 0, value: 1000 },
    { id: id('c'), kind: 'capacitor', x: 10, y: 3, rotation: 90, value: 1e-6 },
    { id: id('gnd'), kind: 'ground', x: 3, y: 7, rotation: 0, value: 0 },
  );
  d.wires.push(
    { id: id('w'), from: { x: 5, y: 3 }, to: { x: 8, y: 3 } },
    { id: id('w'), from: { x: 10, y: 5 }, to: { x: 10, y: 7 } },
    { id: id('w'), from: { x: 10, y: 7 }, to: { x: 3, y: 7 } },
    { id: id('w'), from: { x: 3, y: 3 }, to: { x: 3, y: 7 } },
  );
  d.probes.push({ id: id('p'), kind: 'voltmeter', at: { x: 10, y: 3 } });
  return d;
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  11. RLC Series Resonator                                                  */
/* ═══════════════════════════════════════════════════════════════════════════ */
function rlcResonator(): CircuitDoc {
  _idn = 0;
  const d = mkDoc();
  d.components.push(
    { id: id('ac'), kind: 'ac', x: 3, y: 3, rotation: 0, value: 10, acFreq: 500 },
    { id: id('r'), kind: 'resistor', x: 6, y: 3, rotation: 0, value: 10 },
    { id: id('l'), kind: 'inductor', x: 9, y: 3, rotation: 0, value: 10e-3 },
    { id: id('c'), kind: 'capacitor', x: 12, y: 3, rotation: 0, value: 10e-6 },
    { id: id('gnd'), kind: 'ground', x: 3, y: 5, rotation: 0, value: 0 },
  );
  d.wires.push(
    { id: id('w'), from: { x: 5, y: 3 }, to: { x: 6, y: 3 } },
    { id: id('w'), from: { x: 8, y: 3 }, to: { x: 9, y: 3 } },
    { id: id('w'), from: { x: 11, y: 3 }, to: { x: 12, y: 3 } },
    { id: id('w'), from: { x: 14, y: 3 }, to: { x: 14, y: 5 } },
    { id: id('w'), from: { x: 14, y: 5 }, to: { x: 3, y: 5 } },
    { id: id('w'), from: { x: 3, y: 3 }, to: { x: 3, y: 5 } },
  );
  d.probes.push({ id: id('p'), kind: 'voltmeter', at: { x: 12, y: 3 } });
  return d;
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  12. Half-Wave Rectifier                                                   */
/* ═══════════════════════════════════════════════════════════════════════════ */
function halfWaveRectifier(): CircuitDoc {
  _idn = 0;
  const d = mkDoc();
  d.components.push(
    { id: id('ac'), kind: 'ac', x: 3, y: 3, rotation: 0, value: 10, acFreq: 60 },
    { id: id('d'), kind: 'diode', x: 7, y: 3, rotation: 0, value: 0 },
    { id: id('r'), kind: 'resistor', x: 11, y: 3, rotation: 0, value: 100 },
    { id: id('gnd'), kind: 'ground', x: 3, y: 6, rotation: 0, value: 0 },
  );
  d.wires.push(
    { id: id('w'), from: { x: 5, y: 3 }, to: { x: 7, y: 3 } },
    { id: id('w'), from: { x: 9, y: 3 }, to: { x: 11, y: 3 } },
    { id: id('w'), from: { x: 13, y: 3 }, to: { x: 13, y: 6 } },
    { id: id('w'), from: { x: 13, y: 6 }, to: { x: 3, y: 6 } },
    { id: id('w'), from: { x: 3, y: 3 }, to: { x: 3, y: 6 } },
  );
  d.probes.push({ id: id('p'), kind: 'voltmeter', at: { x: 11, y: 3 } });
  return d;
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  13. Full-Wave Bridge Rectifier                                            */
/* ═══════════════════════════════════════════════════════════════════════════ */
function fullWaveBridge(): CircuitDoc {
  _idn = 0;
  const d = mkDoc();
  d.components.push(
    { id: id('ac'), kind: 'ac', x: 3, y: 6, rotation: 0, value: 10, acFreq: 60 },
    { id: id('d1'), kind: 'diode', x: 9, y: 4, rotation: 0, value: 0 },
    { id: id('d2'), kind: 'diode', x: 5, y: 4, rotation: 0, value: 0 },
    { id: id('d3'), kind: 'diode', x: 9, y: 8, rotation: 0, value: 0 },
    { id: id('d4'), kind: 'diode', x: 5, y: 8, rotation: 0, value: 0 },
    { id: id('r'), kind: 'resistor', x: 13, y: 6, rotation: 90, value: 100 },
    { id: id('gnd'), kind: 'ground', x: 3, y: 10, rotation: 0, value: 0 },
  );
  d.wires.push(
    /* AC+ bus to D1 anode and D4 cathode */
    { id: id('w'), from: { x: 5, y: 6 }, to: { x: 5, y: 4 } },
    { id: id('w'), from: { x: 5, y: 4 }, to: { x: 9, y: 4 } },
    { id: id('w'), from: { x: 5, y: 6 }, to: { x: 5, y: 8 } },
    { id: id('w'), from: { x: 5, y: 8 }, to: { x: 7, y: 8 } },
    /* AC- bus to D2 anode and D3 cathode */
    { id: id('w'), from: { x: 3, y: 6 }, to: { x: 3, y: 4 } },
    { id: id('w'), from: { x: 3, y: 4 }, to: { x: 5, y: 4 } },
    { id: id('w'), from: { x: 3, y: 6 }, to: { x: 3, y: 8 } },
    { id: id('w'), from: { x: 3, y: 8 }, to: { x: 11, y: 8 } },
    /* Load+ rail (D1/D2 cathodes) to resistor top */
    { id: id('w'), from: { x: 7, y: 4 }, to: { x: 11, y: 4 } },
    { id: id('w'), from: { x: 11, y: 4 }, to: { x: 13, y: 4 } },
    { id: id('w'), from: { x: 13, y: 4 }, to: { x: 13, y: 6 } },
    /* Load- rail (D3/D4 anodes) to resistor bottom */
    { id: id('w'), from: { x: 5, y: 8 }, to: { x: 9, y: 8 } },
    { id: id('w'), from: { x: 9, y: 8 }, to: { x: 13, y: 8 } },
    /* ground */
    { id: id('w'), from: { x: 3, y: 6 }, to: { x: 3, y: 10 } },
  );
  d.probes.push({ id: id('p'), kind: 'voltmeter', at: { x: 13, y: 6 } });
  return d;
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  14. LED with Current-Limiting Resistor                                    */
/* ═══════════════════════════════════════════════════════════════════════════ */
function ledResistor(): CircuitDoc {
  _idn = 0;
  const d = mkDoc();
  d.components.push(
    { id: id('bat'), kind: 'battery', x: 4, y: 3, rotation: 0, value: 9 },
    { id: id('r'), kind: 'resistor', x: 9, y: 3, rotation: 0, value: 330 },
    { id: id('d'), kind: 'diode', x: 13, y: 3, rotation: 0, value: 0 },
    { id: id('gnd'), kind: 'ground', x: 4, y: 7, rotation: 0, value: 0 },
  );
  d.wires.push(
    { id: id('w'), from: { x: 6, y: 3 }, to: { x: 9, y: 3 } },
    { id: id('w'), from: { x: 11, y: 3 }, to: { x: 13, y: 3 } },
    { id: id('w'), from: { x: 15, y: 3 }, to: { x: 15, y: 7 } },
    { id: id('w'), from: { x: 15, y: 7 }, to: { x: 4, y: 7 } },
    { id: id('w'), from: { x: 4, y: 3 }, to: { x: 4, y: 7 } },
  );
  d.probes.push(
    { id: id('p1'), kind: 'ammeter', componentId: d.components[1]!.id },
    { id: id('p2'), kind: 'voltmeter', at: { x: 13, y: 3 } },
  );
  return d;
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  15. Wheatstone Bridge                                                     */
/* ═══════════════════════════════════════════════════════════════════════════ */
function wheatstoneBridge(): CircuitDoc {
  _idn = 0;
  const d = mkDoc();
  d.components.push(
    { id: id('bat'), kind: 'battery', x: 3, y: 4, rotation: 0, value: 12 },
    { id: id('r1'), kind: 'resistor', x: 7, y: 2, rotation: 0, value: 1000 },
    { id: id('r2'), kind: 'resistor', x: 7, y: 6, rotation: 0, value: 1000 },
    { id: id('r3'), kind: 'resistor', x: 11, y: 2, rotation: 0, value: 1000 },
    { id: id('r4'), kind: 'resistor', x: 11, y: 6, rotation: 0, value: 2000 },
    { id: id('gnd'), kind: 'ground', x: 13, y: 8, rotation: 0, value: 0 },
  );
  d.wires.push(
    { id: id('w'), from: { x: 5, y: 4 }, to: { x: 5, y: 2 } },
    { id: id('w'), from: { x: 5, y: 2 }, to: { x: 7, y: 2 } },
    { id: id('w'), from: { x: 5, y: 4 }, to: { x: 5, y: 6 } },
    { id: id('w'), from: { x: 5, y: 6 }, to: { x: 7, y: 6 } },
    { id: id('w'), from: { x: 9, y: 2 }, to: { x: 11, y: 2 } },
    { id: id('w'), from: { x: 9, y: 6 }, to: { x: 11, y: 6 } },
    { id: id('w'), from: { x: 13, y: 2 }, to: { x: 13, y: 4 } },
    { id: id('w'), from: { x: 13, y: 6 }, to: { x: 13, y: 4 } },
    { id: id('w'), from: { x: 13, y: 4 }, to: { x: 13, y: 8 } },
    { id: id('w'), from: { x: 3, y: 4 }, to: { x: 3, y: 8 } },
    { id: id('w'), from: { x: 3, y: 8 }, to: { x: 13, y: 8 } },
  );
  d.probes.push(
    { id: id('p1'), kind: 'voltmeter', at: { x: 9, y: 2 } },
    { id: id('p2'), kind: 'voltmeter', at: { x: 9, y: 6 } },
  );
  return d;
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Preset registry                                                           */
/* ═══════════════════════════════════════════════════════════════════════════ */

export const PRESETS: CircuitPreset[] = [
  {
    id: 'ohms-law',
    name: "Ohm's Law",
    description: '9 V battery across 100 Ω. Current = 90 mA.',
    doc: ohmsLaw(),
    topic: "Ohm's Law",
    goal: 'See the direct proportionality between voltage, resistance, and current.',
    theory: `Ohm's Law is the most fundamental relationship in circuit analysis: for a resistor, the voltage across it is directly proportional to the current through it. The constant of proportionality is the resistance R.\n\nIn this circuit, a 9 V source is connected across a single 100 Ω resistor. Because there is only one path, the full 9 V appears across the resistor. The current is limited only by that resistance.`,
    formulas: [
      'V = I · R',
      'I = V / R = 9 V / 100 Ω = 0.090 A = 90 mA',
      'P = V · I = 9 V × 0.090 A = 0.81 W',
    ],
    steps: [
      'Identify the only closed loop: battery → resistor → ground → battery.',
      'Apply KVL around the loop: +9 V − V_R = 0, so V_R = 9 V.',
      "Apply Ohm's Law: I = V_R / R = 9 / 100 = 0.090 A.",
      'Check the ammeter probe on the resistor — it should read ≈ 90 mA.',
    ],
    hints: [
      'Double-click the resistor in the inspector and change it to 200 Ω. The current should halve to 45 mA.',
      'Change the battery to 18 V. The current doubles to 180 mA.',
      'Try a bulb instead of a resistor — the glow intensity is proportional to I²R.',
    ],
  },
  {
    id: 'parallel-resistors',
    name: 'Parallel Resistors',
    description: '12 V across 200 Ω || 300 Ω. KCL at the junction.',
    doc: parallelResistors(),
    topic: 'Parallel Circuits / KCL',
    goal: 'Learn that voltage is shared across parallel branches while current splits according to conductance.',
    theory: `When two resistors are connected in parallel, they share the same voltage across their terminals. The current from the source splits at the junction (node) according to each branch's resistance.\n\nKirchhoff's Current Law (KCL) states that the algebraic sum of currents entering any node is zero. Here, the source current I_s splits into I_1 (through R_1) and I_2 (through R_2): I_s = I_1 + I_2.`,
    formulas: [
      'V_branch = V_source = 12 V  (same across both resistors)',
      'I_1 = V / R_1 = 12 / 200 = 60 mA',
      'I_2 = V / R_2 = 12 / 300 = 40 mA',
      'I_total = I_1 + I_2 = 100 mA',
      'R_eq = (R_1 · R_2) / (R_1 + R_2) = (200×300)/500 = 120 Ω',
      'I_total = V / R_eq = 12 / 120 = 100 mA  (check)',
    ],
    steps: [
      'Both branches connect between the same two nodes: the junction at (7,4) and the return rail.',
      'Voltage across each resistor is identical: 12 V.',
      "Calculate branch currents independently using Ohm's Law.",
      'Sum the branch currents to get the total source current.',
      'Verify with the ammeter probes: 60 mA + 40 mA = 100 mA.',
    ],
    hints: [
      'Add a third parallel resistor. The equivalent resistance drops and total current rises.',
      'Make R_1 = R_2. The current splits equally: 50 mA each.',
      'What happens if one branch is a short (0 Ω)? All current goes through the short.',
    ],
  },
  {
    id: 'series-parallel',
    name: 'Series–Parallel',
    description: '12 V → 100 Ω → (200 Ω || 200 Ω).',
    doc: seriesParallel(),
    topic: 'Series-Parallel Networks',
    goal: 'Practice reducing a mixed network step by step to find total resistance and node voltages.',
    theory: `Most real circuits are neither purely series nor purely parallel. The strategy is to simplify from the "inside out": first combine parallel sections, then treat the result as a single series element.\n\nHere, the two 200 Ω resistors are in parallel. Their equivalent is 100 Ω. That 100 Ω is in series with the first 100 Ω resistor, giving 200 Ω total.`,
    formulas: [
      'R_parallel = (200 × 200) / (200 + 200) = 100 Ω',
      'R_total = 100 Ω + 100 Ω = 200 Ω',
      'I_total = 12 V / 200 Ω = 60 mA',
      'V_node = 12 V − (60 mA × 100 Ω) = 6 V',
      'I_R1 = I_R2 = 6 V / 200 Ω = 30 mA each',
    ],
    steps: [
      'Identify the parallel pair: R_1 and R_2 both connect between the node at (9,4) and ground.',
      'Replace the pair with their equivalent: 100 Ω.',
      'Now the circuit is a simple series: 100 Ω + 100 Ω = 200 Ω.',
      'Total current = 12 V / 200 Ω = 60 mA.',
      'Voltage at the node = 12 V − (0.06 A × 100 Ω) = 6 V.',
      'Each parallel branch carries 6 V / 200 Ω = 30 mA.',
    ],
    hints: [
      'Change one of the parallel resistors to 100 Ω. Now the parallel pair is 66.7 Ω.',
      'The node voltage is always less than 12 V because of the series drop.',
      'Add a voltmeter at the node and watch it change as you edit resistor values.',
    ],
  },
  {
    id: 'kvl-loop',
    name: 'KVL Loop',
    description: '12 V → 100 Ω → 200 Ω → 300 Ω in series. Sum of drops = 12 V.',
    doc: kvlLoop(),
    topic: "Kirchhoff's Voltage Law",
    goal: 'Verify that the sum of voltage drops around any closed loop equals the sum of voltage rises.',
    theory: `Kirchhoff's Voltage Law (KVL) is a statement of conservation of energy: the net change in electric potential around any closed loop is zero. In practical terms, the battery voltage must be exactly consumed by the voltage drops across the resistors.\n\nThis circuit has one battery and three resistors all in a single loop. The same current flows through every element.`,
    formulas: [
      'R_total = 100 + 200 + 300 = 600 Ω',
      'I = V_source / R_total = 12 / 600 = 20 mA',
      'V_R1 = I · R_1 = 0.020 × 100 = 2.0 V',
      'V_R2 = I · R_2 = 0.020 × 200 = 4.0 V',
      'V_R3 = I · R_3 = 0.020 × 300 = 6.0 V',
      'Check: 2.0 + 4.0 + 6.0 = 12.0 V  ✓',
    ],
    steps: [
      'Trace the loop clockwise starting from the battery negative terminal.',
      'Across the battery: voltage rises by 12 V (internal to the source).',
      'Across each resistor: voltage drops by I·R.',
      'Apply KVL: 12 V − V_R1 − V_R2 − V_R3 = 0.',
      'Solve for I: I = 12 / (100+200+300) = 20 mA.',
      'Calculate each drop and verify they sum to 12 V.',
    ],
    hints: [
      'Watch the three voltmeter probes: they read 2 V, 4 V, and 6 V progressively.',
      'Add a fourth resistor. The current drops and each existing drop shrinks proportionally.',
      'What happens if you insert a second battery opposing the first? Net voltage = difference.',
    ],
  },
  {
    id: 'kcl-node',
    name: 'KCL Node',
    description: 'Current splits at a node into three branches: 200 Ω, 300 Ω, 600 Ω.',
    doc: kclNode(),
    topic: "Kirchhoff's Current Law",
    goal: 'Prove that total current entering a node equals total current leaving it.',
    theory: `Kirchhoff's Current Law (KCL) is conservation of charge: charge cannot accumulate at a point. The current flowing into any node must equal the current flowing out.\n\nIn this circuit, a 12 V source drives current through a 100 Ω series resistor to a junction. From that junction, three parallel branches (200 Ω, 300 Ω, 600 Ω) all return to ground. The node voltage settles at the value that makes the sum of branch currents equal the incoming current.`,
    formulas: [
      'Let V_n = node voltage at the junction.',
      'I_s = (12 − V_n) / 100  (series resistor)',
      'I_1 = V_n / 200,   I_2 = V_n / 300,   I_3 = V_n / 600',
      'KCL: I_s = I_1 + I_2 + I_3',
      '(12 − V_n)/100 = V_n/200 + V_n/300 + V_n/600',
      'Multiply by 600: 6(12 − V_n) = 3V_n + 2V_n + V_n = 6V_n',
      '72 − 6V_n = 6V_n  →  V_n = 6.0 V',
      'I_s = (12−6)/100 = 60 mA,  I_1 = 30 mA,  I_2 = 20 mA,  I_3 = 10 mA',
      'Check: 30 + 20 + 10 = 60 mA  ✓',
    ],
    steps: [
      'Label the unknown node voltage V_n at the junction (9,4).',
      "Write Ohm's Law for each branch in terms of V_n.",
      'Write KCL: current in = current out.',
      'Solve the linear equation for V_n.',
      'Back-substitute to find each branch current.',
      'Confirm with the four ammeter probes.',
    ],
    hints: [
      'The node voltage is 6 V — exactly half the source. Coincidence? Try changing R_s.',
      'The branch currents are inversely proportional to resistance: 30:20:10 = 1/200:1/300:1/600.',
      'Add a fourth branch. V_n drops because more current can escape.',
    ],
  },
  {
    id: 'voltage-divider',
    name: 'Voltage Divider',
    description: '12 V → 1 kΩ → 1 kΩ → ground. V_out = 6 V at the midpoint.',
    doc: voltageDivider(),
    topic: 'Voltage Division',
    goal: 'Understand how two series resistors act as a linear voltage scaler.',
    theory: `A voltage divider is the simplest DAC in existence: it converts a higher voltage into a lower one using the ratio of two resistances. The output is taken from the midpoint between them.\n\nWith no load connected, the same current flows through both resistors. The output voltage is simply the input voltage multiplied by the fraction R_2/(R_1+R_2).`,
    formulas: [
      'I = V_in / (R_1 + R_2) = 12 / (1000 + 1000) = 6 mA',
      'V_out = I · R_2 = 6 mA × 1 kΩ = 6 V',
      'V_out = V_in · R_2 / (R_1 + R_2) = 12 × 1000/2000 = 6 V',
    ],
    steps: [
      'Both resistors carry the same current because they are in series.',
      'Calculate current: I = 12 V / 2 kΩ = 6 mA.',
      'V_out is the voltage across R_2: V = I·R_2 = 6 V.',
      'The voltmeter at the midpoint reads 6 V.',
    ],
    hints: [
      'Make R_2 = 2 kΩ. V_out becomes 12 × 2/3 = 8 V.',
      'Make R_1 = 2 kΩ, R_2 = 1 kΩ. V_out becomes 4 V.',
      'Compare with the Loaded Divider preset to see why real dividers sag.',
    ],
  },
  {
    id: 'loaded-divider',
    name: 'Loaded Divider',
    description:
      'Same 1 kΩ/1 kΩ divider, but with a 1 kΩ load across the output. V_out sags to 4 V.',
    doc: loadedDivider(),
    topic: 'Loading Effect',
    goal: 'See why a voltage divider cannot supply significant current without its output collapsing.',
    theory: `An ideal voltage divider assumes no load — the output is measured by a perfect voltmeter with infinite resistance. In reality, anything you connect to V_out draws current. That load is in parallel with R_2, reducing the effective bottom resistance and pulling V_downward.\n\nHere, a 1 kΩ load is placed across R_2. The parallel combination is 500 Ω. The divider ratio changes from 1/2 to 500/(1000+500) = 1/3.`,
    formulas: [
      'R_2 || R_L = (1000 × 1000) / (1000 + 1000) = 500 Ω',
      'V_out = 12 V × 500 / (1000 + 500) = 4.0 V',
      'I_load = 4 V / 1000 Ω = 4 mA',
      'Unloaded V_out would be 6 V; loading costs 2 V (33 % sag).',
    ],
    steps: [
      'Without the load, V_out = 6 V (see Voltage Divider preset).',
      'Add the 1 kΩ load in parallel with R_2.',
      'The equivalent bottom resistance drops to 500 Ω.',
      'Recompute: V_out = 12 × 500/1500 = 4 V.',
      'The load current is 4 mA — significant compared to the 6 mA total.',
    ],
    hints: [
      'Increase R_L to 10 kΩ. The sag becomes smaller: V_out ≈ 5.45 V.',
      'Decrease R_L to 100 Ω. V_out collapses to ≈ 0.55 V.',
      'This is why real power supplies use active regulators instead of passive dividers.',
    ],
  },
  {
    id: 'rc-charging',
    name: 'RC Charging',
    description: '5 V through 1 kΩ into 1 µF. τ = 1 ms; scope shows exponential rise.',
    doc: rcCharging(),
    topic: 'RC Transients',
    goal: 'Watch the exponential charging curve and understand the time constant τ = RC.',
    theory: `A capacitor stores energy in an electric field. When connected to a voltage source through a resistor, it cannot charge instantaneously — the resistor limits the current, and the capacitor voltage rises asymptotically toward the source voltage.\n\nThe time constant τ = RC sets the speed: after one τ, the capacitor has reached ~63 % of V_source; after 5τ, it is >99 % charged. The governing equation comes from solving the first-order differential equation formed by KVL around the loop.`,
    formulas: [
      'τ = R · C = 1000 Ω × 1 µF = 1.0 ms',
      'v_C(t) = V_s (1 − e^(−t/τ))',
      'At t = τ:  v_C = 5 V × (1 − e^(−1)) ≈ 3.16 V  (63 %)',
      'At t = 5τ: v_C = 5 V × (1 − e^(−5)) ≈ 4.97 V  (99.3 %)',
      'i(t) = (V_s / R) e^(−t/τ)  (current starts at 5 mA, decays to 0)',
    ],
    steps: [
      'At t = 0, the capacitor acts like a short: v_C = 0, i = V_s/R = 5 mA.',
      'As charge builds, v_C rises and the voltage across R falls.',
      'Current decays exponentially: i(t) = (V_s/R) e^(−t/τ).',
      'After τ = 1 ms, v_C ≈ 3.16 V. After 5 ms, v_C ≈ 4.97 V.',
      'Watch the scope trace climb toward 5 V.',
    ],
    hints: [
      'Open the switch (click it, then click again) to pause charging. Close it to resume.',
      'Double the capacitor to 2 µF. τ doubles to 2 ms and the curve stretches.',
      'Halve the resistor to 500 Ω. τ halves to 0.5 ms and charging speeds up.',
    ],
  },
  {
    id: 'rl-circuit',
    name: 'RL Time Constant',
    description: '12 V → 100 Ω → 10 mH. τ = L/R = 0.1 ms. Current ramps up.',
    doc: rlCircuit(),
    topic: 'RL Transients',
    goal: 'Observe how an inductor opposes changes in current, creating a smooth ramp instead of a step.',
    theory: `An inductor stores energy in a magnetic field. Unlike a capacitor, which resists changes in voltage, an inductor resists changes in current. When voltage is suddenly applied, the inductor initially acts like an open circuit (i = 0), then gradually allows current to build.\n\nThe time constant is τ = L/R. After one τ, current reaches ~63 % of its final value V/R. The inductor voltage starts at V_s and decays to 0 as the current stabilizes.`,
    formulas: [
      'τ = L / R = 10 mH / 100 Ω = 0.1 ms = 100 µs',
      'I_final = V_s / R = 12 V / 100 Ω = 120 mA',
      'i(t) = (V_s / R) (1 − e^(−t/τ))',
      'v_L(t) = V_s · e^(−t/τ)  (starts at 12 V, decays to 0)',
      'At t = τ:  i ≈ 0.63 × 120 mA = 75.6 mA',
    ],
    steps: [
      'At t = 0, the inductor acts like an open circuit: i = 0, v_L = 12 V.',
      'As current builds, the magnetic field stores energy.',
      'The inductor voltage falls while the resistor voltage rises.',
      'At steady state, the inductor is a short: v_L = 0, i = 120 mA.',
      'Watch the ammeter climb and the voltmeter across L decay.',
    ],
    hints: [
      'Increase L to 100 mH. τ becomes 1 ms — the ramp is ten times slower.',
      'The scope is tied to the first voltmeter, so it shows v_L decaying.',
      'Compare with RC: cap voltage rises, inductor current rises. Dual behaviour.',
    ],
  },
  {
    id: 'rc-lowpass',
    name: 'RC Low-Pass Filter',
    description: '100 Hz AC through 1 kΩ + 1 µF. Scope shows attenuated sine.',
    doc: rcLowpass(),
    topic: 'AC Filters',
    goal: 'See how a capacitor passes high frequencies to ground, leaving low frequencies at the output.',
    theory: `In the frequency domain, a capacitor's impedance is Z_C = 1/(jωC). At low frequencies, |Z_C| is large, so most of the input voltage appears at the output. At high frequencies, |Z_C| is small, shunting the signal to ground.\n\nThis circuit is a first-order low-pass filter with cutoff frequency f_c = 1/(2πRC). Below f_c, signals pass; above f_c, they are attenuated at −20 dB/decade.`,
    formulas: [
      'f_c = 1 / (2πRC) = 1 / (2π × 1000 × 1×10^(−6)) ≈ 159 Hz',
      'At f = 100 Hz (below f_c): |V_out/V_in| = 1/√(1+(f/f_c)²) ≈ 0.85  (−1.4 dB)',
      'At f = 500 Hz (above f_c): |V_out/V_in| ≈ 0.30  (−10.4 dB)',
      'Phase shift: φ = −arctan(f/f_c)',
    ],
    steps: [
      'The input is 5 V peak at 100 Hz.',
      'At 100 Hz, the capacitive reactance X_C = 1/(2π·100·1µF) ≈ 1592 Ω.',
      'The output is the voltage across C in the voltage divider formed by R and X_C.',
      'V_out ≈ 5 V × 1592/√(1000² + 1592²) ≈ 4.24 V peak.',
      'Watch the scope: the output sine is slightly smaller and phase-shifted.',
    ],
    hints: [
      'Change the AC frequency to 500 Hz in the inspector. The output shrinks dramatically.',
      'Change to 10 Hz. The output is nearly equal to the input.',
      'Swap R and C positions to make a high-pass filter.',
    ],
  },
  {
    id: 'rlc-resonator',
    name: 'RLC Resonator',
    description: '10 V AC @ 500 Hz, 10 Ω, 10 mH, 10 µF in series.',
    doc: rlcResonator(),
    topic: 'Resonance',
    goal: 'Observe how L and C exchange energy, and how the source frequency affects the loop current.',
    theory: `In a series RLC circuit, the inductor and capacitor have opposite reactances: X_L = ωL (positive, inductive) and X_C = −1/(ωC) (negative, capacitive). At the resonant frequency ω₀ = 1/√(LC), they cancel exactly, leaving only the resistor to limit current.\n\nThe solver operates in the time domain, so you see the actual sine waves. At resonance, the loop current is in phase with the source and reaches its maximum amplitude.`,
    formulas: [
      'f₀ = 1 / (2π√(LC)) = 1 / (2π√(0.01 × 10×10^(−6))) ≈ 503 Hz',
      'At f = 500 Hz (near resonance): X_L ≈ 31.4 Ω, X_C ≈ −31.8 Ω',
      'Net reactance ≈ −0.4 Ω  (slightly capacitive)',
      '|Z| = √(R² + (X_L+X_C)²) ≈ 10 Ω  (minimum possible)',
      'I_peak ≈ V/R = 10 V / 10 Ω = 1 A  (very large!)',
    ],
    steps: [
      'The source is 10 V peak at 500 Hz, almost exactly the resonant frequency.',
      'L and C voltages are nearly equal and opposite, so they cancel.',
      'The resistor sees almost the full source voltage.',
      'Current is limited mainly by the 10 Ω resistor.',
      'Watch the capacitor voltage on the scope — it can exceed the source voltage.',
    ],
    hints: [
      'Change the AC frequency to 100 Hz. X_C dominates and current drops.',
      'Change to 1 kHz. X_L dominates and current drops again.',
      'The capacitor voltage peaks above the source voltage — this is the voltage magnification of resonance.',
    ],
  },
  {
    id: 'half-wave-rectifier',
    name: 'Half-Wave Rectifier',
    description: '10 V AC @ 60 Hz → diode → 100 Ω. Negative half-cycle clipped.',
    doc: halfWaveRectifier(),
    topic: 'Rectification',
    goal: 'See how a single diode blocks one polarity, converting AC into pulsating DC.',
    theory: `A diode conducts only when its anode is more positive than its cathode by about 0.7 V. During the positive half-cycle of the AC source, the diode is forward-biased and current flows through the load. During the negative half-cycle, the diode is reverse-biased and blocks current.\n\nThe result is a pulsating DC waveform: only the positive half of each sine wave reaches the load. The average (DC) value of a half-wave rectified sine is V_peak/π ≈ 0.318 V_peak.`,
    formulas: [
      'V_peak = 10 V',
      'Conduction begins when V_AC > 0.7 V (diode forward drop)',
      'V_load,peak ≈ 10 V − 0.7 V = 9.3 V',
      'V_DC,avg = V_peak/π ≈ 3.18 V  (ideal, ignoring diode drop)',
      'I_peak = 9.3 V / 100 Ω ≈ 93 mA',
    ],
    steps: [
      'Positive half-cycle: diode anode > cathode, diode turns on at ~0.7 V.',
      'Load sees a sine wave with the bottom 0.7 V clipped off the peak.',
      'Negative half-cycle: diode is reverse-biased, no current flows.',
      'The scope shows half-sine pulses separated by flat zeros.',
      'Average load voltage is roughly 3 V (one-third of the peak).',
    ],
    hints: [
      'Add a capacitor in parallel with the load to smooth the ripple.',
      'The flat zero regions are when the diode is off — no energy reaches the load.',
      'Compare with the Full-Wave Bridge to see how both half-cycles can be harvested.',
    ],
  },
  {
    id: 'full-wave-bridge',
    name: 'Full-Wave Bridge',
    description: '4-diode bridge rectifies both half-cycles. Load sees full-wave pulses.',
    doc: fullWaveBridge(),
    topic: 'Rectification',
    goal: 'Understand how four diodes route both AC half-cycles through the load in the same direction.',
    theory: `A bridge rectifier uses four diodes arranged so that, regardless of the AC polarity, current always flows through the load in the same direction.\n\nDuring the positive half-cycle, D1 and D3 conduct, routing current from AC+ through the load to AC-. During the negative half-cycle, D2 and D4 conduct, routing current from AC- (now at higher potential) through the load to AC+ (now at lower potential). The load sees both half-cycles as positive pulses.`,
    formulas: [
      'V_peak = 10 V',
      'Two diode drops per cycle: V_load,peak ≈ 10 V − 2×0.7 V = 8.6 V',
      'V_DC,avg = 2·V_peak/π ≈ 6.37 V  (twice the half-wave value)',
      'Ripple frequency = 2 × f_in = 120 Hz',
      'I_peak = 8.6 V / 100 Ω ≈ 86 mA',
    ],
    steps: [
      'Positive half-cycle: D1 (top-left) and D3 (bottom-right) conduct.',
      'Current path: AC+ → D1 → Load+ → R → Load- → D3 → AC-.',
      'Negative half-cycle: D2 (top-right) and D4 (bottom-left) conduct.',
      'Current path: AC- → D2 → Load+ → R → Load- → D4 → AC+.',
      'Load current always flows top-to-bottom. Both half-cycles are used.',
    ],
    hints: [
      'The scope shows twice as many pulses as the half-wave rectifier.',
      'The ripple frequency is 120 Hz instead of 60 Hz — easier to filter.',
      'Try removing one diode to see the bridge collapse back to half-wave.',
    ],
  },
  {
    id: 'led-resistor',
    name: 'LED + Resistor',
    description: '9 V → 330 Ω → diode (LED). ~25 mA — a safe LED current.',
    doc: ledResistor(),
    topic: 'Practical Design',
    goal: 'Learn to size a current-limiting resistor for a diode or LED.',
    theory: `A light-emitting diode (LED) is a diode that emits light when forward-biased. Like any diode, it has a roughly fixed forward voltage drop (typically 1.8–3.3 V for LEDs, modeled here as 0.7 V). The current must be limited to prevent thermal damage.\n\nThe series resistor drops the excess voltage and sets the current. This is the most common LED circuit in existence.`,
    formulas: [
      'V_R = V_source − V_LED = 9 V − 0.7 V = 8.3 V',
      'I = V_R / R = 8.3 V / 330 Ω ≈ 25.2 mA',
      'P_R = I²R = (0.0252)² × 330 ≈ 0.21 W  (a ¼ W resistor is fine)',
      'P_LED = V_LED × I = 0.7 V × 25.2 mA ≈ 17.6 mW',
    ],
    steps: [
      'Subtract the LED forward drop from the supply voltage.',
      "Apply Ohm's Law to the resistor: R = V_R / I_desired.",
      'Here, 330 Ω gives ~25 mA — a bright but safe LED current.',
      'The ammeter confirms the calculation.',
      "The voltmeter across the diode reads ~0.7 V (the model's forward drop).",
    ],
    hints: [
      'Reduce R to 100 Ω. Current jumps to ~83 mA — the resistor must now be 1 W rated.',
      'Increase R to 1 kΩ. Current drops to ~8.3 mA — the LED dims.',
      'In reality, LEDs have higher drops (red ≈ 2 V, blue ≈ 3.3 V). Recalculate with those values.',
    ],
  },
  {
    id: 'wheatstone-bridge',
    name: 'Wheatstone Bridge',
    description:
      'Diamond of 4 resistors. Slightly unbalanced (R4 = 2 kΩ). Meter shows ~2 V difference.',
    doc: wheatstoneBridge(),
    topic: 'Bridge Circuits',
    goal: 'Understand how a bridge measures small resistance changes by detecting voltage differences.',
    theory: `A Wheatstone bridge compares two voltage dividers. When balanced (R1/R2 = R3/R4), the midpoint voltages are equal and no current flows between them. Any imbalance creates a differential voltage proportional to the resistance change.\n\nThis circuit is the basis of strain gauges, RTD temperature sensors, and load cells. Here R4 is deliberately 2 kΩ while the others are 1 kΩ, producing a visible 2 V imbalance.`,
    formulas: [
      'V_B (top mid) = V_source × R2/(R1+R2) = 12 × 1000/2000 = 6.0 V',
      'V_D (bot mid) = V_source × R4/(R3+R4) = 12 × 2000/3000 = 8.0 V',
      'V_diff = V_B − V_D = 6.0 − 8.0 = −2.0 V',
      'For balance: R1/R2 = R3/R4  →  1000/1000 = 1000/R4  →  R4 = 1 kΩ',
    ],
    steps: [
      'The left side is a 1:1 divider: V_B = 6 V.',
      'The right side is a 1:2 divider: V_D = 8 V.',
      'The 2 V difference would drive current through a galvanometer connected between the midpoints.',
      'Set R4 = 1 kΩ in the inspector to balance the bridge. Both voltmeters should read 6 V.',
    ],
    hints: [
      'Balance the bridge by setting all four resistors to 1 kΩ. The midpoints match.',
      'Change R4 to 1.5 kΩ. V_D becomes 7.2 V; difference is 1.2 V.',
      'This is how a strain gauge works: a tiny ΔR produces a measurable ΔV.',
    ],
  },
];

/** Clone a preset's document so the user can mutate it without affecting the source. */
export function clonePresetDoc(doc: CircuitDoc): CircuitDoc {
  let n = 0;
  const fresh = () => `c${Date.now()}-${++n}`;
  const idMap = new Map<string, string>();
  return {
    components: doc.components.map((c) => {
      const newId = fresh();
      idMap.set(c.id, newId);
      return { ...c, id: newId };
    }),
    wires: doc.wires.map((w) => ({ ...w, id: fresh(), from: { ...w.from }, to: { ...w.to } })),
    probes: doc.probes.map((p) => ({
      ...p,
      id: fresh(),
      at: p.at ? { ...p.at } : undefined,
      componentId: p.componentId ? (idMap.get(p.componentId) ?? p.componentId) : undefined,
    })),
  };
}
