/**
 * Scenario presets for the Power Grid Simulator.
 *
 * Three pedagogical setups (named after the patterns operators recognise
 * in the wild):
 *
 *   afternoon-ramp  — residential load climbs 70 → 100 %.  Watch the
 *                     marginal generator change as cheaper units run out
 *                     of headroom and pricier peakers come online.
 *
 *   trip            — a 500 MW coal unit trips at t=0. Without storage,
 *                     frequency dips below the 59.3 Hz UFLS threshold.
 *                     Drop a 200 MW battery (H=0.1, droop=2 %) and the
 *                     dip is arrested at 59.7 Hz.
 *
 *   duck-curve      — solar peaks midday; the net load drops to ~30 %
 *                     of the morning peak. Then solar fades while
 *                     residential climbs — the steepest ramp the
 *                     grid sees. The reader rebuilds dispatch to ride
 *                     through.
 */

import type { Bus, GridDoc, GridPreset } from './types';
import { defaultGenerator, defaultLoad, lineImpedancePerMile, lineRating } from './solver';

let _idn = 0;
const mkId = (prefix: string) => `${prefix}-${++_idn}`;

function emptyDoc(): GridDoc {
  return { buses: [], lines: [], transformers: [], nominalHz: 60 };
}

/* ───────────── A simple 4-bus topology shared by all three ───────────── */

function build4Bus(): GridDoc {
  _idn = 0;
  const d = emptyDoc();

  // Layout (canvas grid cells):
  //
  //   (gen)    (gen + storage)
  //   Bus 1 ────── line ────── Bus 2          (230 kV)
  //     │                        │
  //   xformer                  xformer
  //     │                        │
  //   Bus 3 ────── line ────── Bus 4          (69 kV)
  //   (load: residential)      (load: industrial + ev)
  //
  const bus1: Bus = {
    id: mkId('bus'),
    x: 6,
    y: 4,
    kv: 230,
    generators: [],
    loads: [],
    label: 'North Gen',
  };
  const bus2: Bus = {
    id: mkId('bus'),
    x: 22,
    y: 4,
    kv: 230,
    generators: [],
    loads: [],
    label: 'East Gen',
  };
  const bus3: Bus = {
    id: mkId('bus'),
    x: 6,
    y: 14,
    kv: 69,
    generators: [],
    loads: [],
    label: 'North Load',
  };
  const bus4: Bus = {
    id: mkId('bus'),
    x: 22,
    y: 14,
    kv: 69,
    generators: [],
    loads: [],
    label: 'East Load',
  };

  // Generation.
  bus1.generators.push(
    { id: mkId('gen'), ...defaultGenerator('coal') },
    { id: mkId('gen'), ...defaultGenerator('wind') },
  );
  bus2.generators.push(
    { id: mkId('gen'), ...defaultGenerator('ccgt') },
    { id: mkId('gen'), ...defaultGenerator('hydro') },
  );

  // Loads.
  bus3.loads.push({ id: mkId('ld'), ...defaultLoad('residential') });
  bus4.loads.push(
    { id: mkId('ld'), ...defaultLoad('industrial') },
    { id: mkId('ld'), ...defaultLoad('ev') },
  );

  d.buses.push(bus1, bus2, bus3, bus4);

  // High-voltage line bus1 — bus2.
  {
    const z = lineImpedancePerMile(230);
    const len = 80;
    d.lines.push({
      id: mkId('ln'),
      fromBusId: bus1.id,
      toBusId: bus2.id,
      lengthMi: len,
      rPu: z.r * len,
      xPu: z.x * len,
      ratingMVA: lineRating(230),
    });
  }
  // Distribution line bus3 — bus4.
  {
    const z = lineImpedancePerMile(69);
    const len = 30;
    d.lines.push({
      id: mkId('ln'),
      fromBusId: bus3.id,
      toBusId: bus4.id,
      lengthMi: len,
      rPu: z.r * len,
      xPu: z.x * len,
      ratingMVA: lineRating(69),
    });
  }
  // Transformers (one per side).
  d.transformers.push(
    { id: mkId('tx'), fromBusId: bus1.id, toBusId: bus3.id, ratingMVA: 500, xPu: 0.1 },
    { id: mkId('tx'), fromBusId: bus2.id, toBusId: bus4.id, ratingMVA: 500, xPu: 0.1 },
  );

  return d;
}

/* ───────────── afternoon-ramp ───────────── */

function buildAfternoonRamp(): GridDoc {
  const d = build4Bus();
  // Start at 70 % residential load. Schedule will ramp.
  for (const b of d.buses) {
    for (const ld of b.loads) {
      if (ld.kind === 'residential') ld.demandScale = 0.7;
    }
  }
  return d;
}

const afternoonRampSchedule = [
  {
    at: 5,
    description: 'Residential load rises to 85 %',
    apply: (doc: GridDoc) => {
      for (const b of doc.buses) {
        for (const ld of b.loads) if (ld.kind === 'residential') ld.demandScale = 0.85;
      }
    },
  },
  {
    at: 12,
    description: 'Residential load rises to 100 %',
    apply: (doc: GridDoc) => {
      for (const b of doc.buses) {
        for (const ld of b.loads) if (ld.kind === 'residential') ld.demandScale = 1.0;
      }
    },
  },
  {
    at: 20,
    description: 'Residential load peaks at 110 %',
    apply: (doc: GridDoc) => {
      for (const b of doc.buses) {
        for (const ld of b.loads) if (ld.kind === 'residential') ld.demandScale = 1.1;
      }
    },
  },
];

/* ───────────── trip ───────────── */

function buildTrip(): GridDoc {
  const d = build4Bus();
  // Make sure the coal unit is the biggest single dispatched unit, so its
  // loss is felt across the grid.
  for (const b of d.buses) {
    for (const g of b.generators) {
      if (g.kind === 'coal') g.dispatch = 0.95;
    }
  }
  return d;
}

const tripSchedule = [
  {
    at: 4,
    description: 'Coal unit trips offline (500 MW lost)',
    apply: (doc: GridDoc) => {
      for (const b of doc.buses) {
        for (const g of b.generators) {
          if (g.kind === 'coal') g.tripped = true;
        }
      }
    },
  },
];

/* ───────────── duck-curve ───────────── */

function buildDuckCurve(): GridDoc {
  const d = build4Bus();
  // Add a big solar plant to bus 2 alongside the gas + hydro.
  for (const b of d.buses) {
    if (b.label === 'East Gen') {
      b.generators.push({ id: mkId('gen'), ...defaultGenerator('solar'), ratedMW: 600 });
    }
  }
  // Start at midday: solar dispatched at 95 %, residential at 50 % (low daytime).
  for (const b of d.buses) {
    for (const g of b.generators) {
      if (g.kind === 'solar') g.dispatch = 0.95;
      if (g.kind === 'coal') g.dispatch = 0.2;
    }
    for (const ld of b.loads) {
      if (ld.kind === 'residential') ld.demandScale = 0.5;
    }
  }
  return d;
}

const duckCurveSchedule = [
  {
    at: 6,
    description: 'Sun setting: solar dispatch drops to 50 %',
    apply: (doc: GridDoc) => {
      for (const b of doc.buses) {
        for (const g of b.generators) if (g.kind === 'solar') g.dispatch = 0.5;
        for (const ld of b.loads) if (ld.kind === 'residential') ld.demandScale = 0.75;
      }
    },
  },
  {
    at: 14,
    description: 'Solar offline; residential at evening peak',
    apply: (doc: GridDoc) => {
      for (const b of doc.buses) {
        for (const g of b.generators) if (g.kind === 'solar') g.dispatch = 0.05;
        for (const ld of b.loads) if (ld.kind === 'residential') ld.demandScale = 1.05;
      }
    },
  },
];

/* ───────────── Empty starting canvas ───────────── */

function buildEmpty(): GridDoc {
  _idn = 0;
  return emptyDoc();
}

/* ───────────── Manifest ───────────── */

export const PRESETS: GridPreset[] = [
  {
    id: '4-bus',
    name: '4-bus',
    description:
      'Two-area, four-bus system. Two generators per area; one residential, one industrial load. The default starting point.',
    doc: build4Bus(),
  },
  {
    id: 'afternoon-ramp',
    name: 'Afternoon ramp',
    description:
      'Residential load climbs from 70 % to 110 %. Watch dispatch reshuffle as cheaper baseload tops out and peakers come online.',
    doc: buildAfternoonRamp(),
    schedule: afternoonRampSchedule,
  },
  {
    id: 'trip',
    name: 'Trip',
    description:
      'A 500 MW coal unit trips at t = 4 s. Watch frequency dip. Drop a battery and try again.',
    doc: buildTrip(),
    schedule: tripSchedule,
  },
  {
    id: 'duck-curve',
    name: 'Duck curve',
    description:
      'Midday solar drives net load to 30 % of peak. Then solar fades while residential climbs — the steepest evening ramp.',
    doc: buildDuckCurve(),
    schedule: duckCurveSchedule,
  },
  {
    id: 'empty',
    name: 'Empty',
    description: 'Start from a blank canvas. Drop buses and wire them up.',
    doc: buildEmpty(),
  },
];

/** Deep-clone a preset doc — presets are read from in-place, never mutated. */
export function cloneDoc(d: GridDoc): GridDoc {
  return {
    nominalHz: d.nominalHz,
    buses: d.buses.map((b) => ({
      ...b,
      generators: b.generators.map((g) => ({ ...g })),
      loads: b.loads.map((ld) => ({ ...ld })),
    })),
    lines: d.lines.map((l) => ({ ...l })),
    transformers: d.transformers.map((t) => ({ ...t })),
  };
}
