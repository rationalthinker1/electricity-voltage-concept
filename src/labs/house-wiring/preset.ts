/**
 * Sample wired house — the "Preset" the reader can load to see a
 * complete, mostly-compliant install. It's deliberately not perfect:
 * one or two minor violations remain for the reader to spot.
 *
 * Floorplan (grid units, 1 unit ≈ 1 ft):
 *
 *   ┌────────────┬──────────────────────────┐
 *   │            │                          │
 *   │  Bedroom 1 │       Living             │
 *   │   12×10    │        18×14             │
 *   │            │                          │
 *   ├────────────┤                          │
 *   │            │                          │
 *   │  Bath      │                          │
 *   │  8×6       ├──────────────────────────┤
 *   ├────────────┤      Kitchen             │
 *   │            │       14×12              │
 *   │  Bedroom 2 │                          │
 *   │   10×10    │  (island 6×3)            │
 *   ├────────────┴──────────────────────────┤
 *   │             Garage 22×20              │
 *   └───────────────────────────────────────┘
 *   plus an Outdoor zone for porch / patio.
 */

import type { HouseDoc } from './types';

let n = 1;
const id = (p: string) => `${p}-${n++}`;

const rooms: HouseDoc['rooms'] = [
  { id: 'r-bed1', kind: 'bedroom', name: 'Bedroom 1', x: 1, y: 1,  w: 12, h: 10 },
  { id: 'r-bath', kind: 'bath',    name: 'Bath',     x: 1, y: 12, w: 8,  h: 6  },
  { id: 'r-bed2', kind: 'bedroom', name: 'Bedroom 2', x: 1, y: 19, w: 10, h: 10 },
  { id: 'r-living', kind: 'living', name: 'Living',  x: 14, y: 1, w: 18, h: 14 },
  { id: 'r-kitchen', kind: 'kitchen', name: 'Kitchen', x: 14, y: 16, w: 14, h: 12 },
  { id: 'r-island',  kind: 'kitchen-island', name: 'Island', x: 18, y: 21, w: 6, h: 3 },
  { id: 'r-garage', kind: 'garage', name: 'Garage', x: 1, y: 30, w: 31, h: 12 },
  { id: 'r-outdoor', kind: 'outdoor', name: 'Patio', x: 33, y: 1, w: 6, h: 28 },
];

const breakers: HouseDoc['breakers'] = [
  { id: 'b-1',  kind: 'dfci-15', slot: 0,  label: 'Bedroom 1 lights/recep' },
  { id: 'b-2',  kind: 'dfci-15', slot: 1,  label: 'Bedroom 2 lights/recep' },
  { id: 'b-3',  kind: 'gfci-20', slot: 2,  label: 'Bath' },
  { id: 'b-4',  kind: 'dfci-20', slot: 3,  label: 'Kitchen counter A' },
  { id: 'b-5',  kind: 'dfci-20', slot: 4,  label: 'Kitchen counter B' },
  { id: 'b-6',  kind: 'dfci-20', slot: 5,  label: 'Living / Dining' },
  { id: 'b-7',  kind: 'gfci-20', slot: 6,  label: 'Garage / Outdoor' },
  { id: 'b-8',  kind: 'std-20',  slot: 7,  label: 'Fridge (dedicated)' },
  { id: 'b-9',  kind: 'std-20',  slot: 8,  label: 'Dishwasher (dedicated)' },
  { id: 'b-10', kind: 'dp-30',   slot: 9,  label: 'Dryer 30 A' },
  { id: 'b-11', kind: 'dp-50',   slot: 10, label: 'Range 50 A' },
  { id: 'b-12', kind: 'dp-50',   slot: 11, label: 'EV charger 50 A' },
  { id: 'b-13', kind: 'dp-30',   slot: 12, label: 'Heat pump 30 A' },
];

/* ── Devices ── */
const devices: HouseDoc['devices'] = [
  // Bedroom 1: 4 receptacles + ceiling light + smoke
  { id: id('d'), kind: 'receptacle-tr', roomId: 'r-bed1', x: 2,  y: 2, breakerId: 'b-1', applianceId: null },
  { id: id('d'), kind: 'receptacle-tr', roomId: 'r-bed1', x: 8,  y: 2, breakerId: 'b-1', applianceId: null },
  { id: id('d'), kind: 'receptacle-tr', roomId: 'r-bed1', x: 2,  y: 10, breakerId: 'b-1', applianceId: null },
  { id: id('d'), kind: 'receptacle-tr', roomId: 'r-bed1', x: 12, y: 10, breakerId: 'b-1', applianceId: null },
  { id: id('d'), kind: 'light',          roomId: 'r-bed1', x: 7,  y: 6,  breakerId: 'b-1', applianceId: null },
  { id: id('d'), kind: 'smoke',          roomId: 'r-bed1', x: 6,  y: 6,  breakerId: 'b-1', applianceId: null },
  { id: id('d'), kind: 'switch',         roomId: 'r-bed1', x: 12, y: 4,  breakerId: 'b-1', applianceId: null },

  // Bedroom 2 — note: no smoke alarm here → flagged by audit.
  { id: id('d'), kind: 'receptacle-tr', roomId: 'r-bed2', x: 2,  y: 20, breakerId: 'b-2', applianceId: null },
  { id: id('d'), kind: 'receptacle-tr', roomId: 'r-bed2', x: 9,  y: 20, breakerId: 'b-2', applianceId: null },
  { id: id('d'), kind: 'receptacle-tr', roomId: 'r-bed2', x: 2,  y: 28, breakerId: 'b-2', applianceId: null },
  { id: id('d'), kind: 'light',          roomId: 'r-bed2', x: 6,  y: 24, breakerId: 'b-2', applianceId: null },
  { id: id('d'), kind: 'switch',         roomId: 'r-bed2', x: 10, y: 22, breakerId: 'b-2', applianceId: null },

  // Bath
  { id: id('d'), kind: 'receptacle-gfci', roomId: 'r-bath', x: 4,  y: 13, breakerId: 'b-3', applianceId: null },
  { id: id('d'), kind: 'light',           roomId: 'r-bath', x: 4,  y: 15, breakerId: 'b-3', applianceId: null },
  { id: id('d'), kind: 'fan',             roomId: 'r-bath', x: 6,  y: 15, breakerId: 'b-3', applianceId: null },

  // Living — receptacles, lights, TV plug
  { id: id('d'), kind: 'receptacle-tr', roomId: 'r-living', x: 15, y: 2,  breakerId: 'b-6', applianceId: null },
  { id: id('d'), kind: 'receptacle-tr', roomId: 'r-living', x: 23, y: 2,  breakerId: 'b-6', applianceId: null },
  { id: id('d'), kind: 'receptacle-tr', roomId: 'r-living', x: 30, y: 8,  breakerId: 'b-6', applianceId: 'a-tv' },
  { id: id('d'), kind: 'receptacle-tr', roomId: 'r-living', x: 15, y: 14, breakerId: 'b-6', applianceId: null },
  { id: id('d'), kind: 'receptacle-tr', roomId: 'r-living', x: 23, y: 14, breakerId: 'b-6', applianceId: 'a-comp' },
  { id: id('d'), kind: 'light',          roomId: 'r-living', x: 22, y: 7,  breakerId: 'b-6', applianceId: 'a-lights' },
  { id: id('d'), kind: 'switch',         roomId: 'r-living', x: 30, y: 14, breakerId: 'b-6', applianceId: null },

  // Kitchen — split between two small-appliance circuits, GFCI required.
  { id: id('d'), kind: 'receptacle-gfci', roomId: 'r-kitchen', x: 15, y: 17, breakerId: 'b-4', applianceId: 'a-toaster' },
  { id: id('d'), kind: 'receptacle-gfci', roomId: 'r-kitchen', x: 22, y: 17, breakerId: 'b-4', applianceId: 'a-microwave' },
  { id: id('d'), kind: 'receptacle-gfci', roomId: 'r-kitchen', x: 27, y: 22, breakerId: 'b-5', applianceId: 'a-kettle' },
  { id: id('d'), kind: 'receptacle-gfci', roomId: 'r-kitchen', x: 27, y: 27, breakerId: 'b-5', applianceId: null },
  { id: id('d'), kind: 'receptacle-gfci', roomId: 'r-island',  x: 21, y: 22, breakerId: 'b-5', applianceId: null },
  { id: id('d'), kind: 'light',           roomId: 'r-kitchen', x: 20, y: 20, breakerId: 'b-6', applianceId: null },
  // Dedicated fridge + dishwasher.
  { id: id('d'), kind: 'receptacle',      roomId: 'r-kitchen', x: 17, y: 27, breakerId: 'b-8', applianceId: 'a-fridge' },
  { id: id('d'), kind: 'receptacle-gfci', roomId: 'r-kitchen', x: 20, y: 27, breakerId: 'b-9', applianceId: 'a-dish' },
  // Range — 240 V.
  { id: id('d'), kind: 'receptacle-240',  roomId: 'r-kitchen', x: 23, y: 27, breakerId: 'b-11', applianceId: 'a-range' },

  // Garage — GFCI required.
  { id: id('d'), kind: 'receptacle-gfci', roomId: 'r-garage', x: 3,  y: 31, breakerId: 'b-7', applianceId: null },
  { id: id('d'), kind: 'receptacle-gfci', roomId: 'r-garage', x: 15, y: 31, breakerId: 'b-7', applianceId: null },
  { id: id('d'), kind: 'receptacle-gfci', roomId: 'r-garage', x: 28, y: 31, breakerId: 'b-7', applianceId: null },
  { id: id('d'), kind: 'light',           roomId: 'r-garage', x: 10, y: 36, breakerId: 'b-7', applianceId: null },
  { id: id('d'), kind: 'light',           roomId: 'r-garage', x: 22, y: 36, breakerId: 'b-7', applianceId: null },
  // EV charger + heat pump on dedicated 240 V circuits.
  { id: id('d'), kind: 'receptacle-240',  roomId: 'r-garage', x: 5,  y: 41, breakerId: 'b-12', applianceId: 'a-ev' },
  { id: id('d'), kind: 'receptacle-240',  roomId: 'r-garage', x: 28, y: 41, breakerId: 'b-10', applianceId: 'a-dryer' },
  { id: id('d'), kind: 'receptacle-240',  roomId: 'r-garage', x: 18, y: 41, breakerId: 'b-13', applianceId: 'a-heat' },

  // Outdoor patio — WR + GFCI required.
  { id: id('d'), kind: 'receptacle-wr',   roomId: 'r-outdoor', x: 34, y: 6,  breakerId: 'b-7', applianceId: null },
  { id: id('d'), kind: 'receptacle-wr',   roomId: 'r-outdoor', x: 34, y: 20, breakerId: 'b-7', applianceId: null },
];

/* ── Cables ── */
const cables: HouseDoc['cables'] = [
  { id: 'c-1', kind: 'nm-14-2', breakerId: 'b-1', deviceId: devices[0].id,  lengthFt: 35, studs: 6 },
  { id: 'c-2', kind: 'nm-14-2', breakerId: 'b-2', deviceId: devices[7].id,  lengthFt: 45, studs: 8 },
  { id: 'c-3', kind: 'nm-12-2', breakerId: 'b-3', deviceId: devices[12].id, lengthFt: 30, studs: 5 },
  { id: 'c-4', kind: 'nm-12-2', breakerId: 'b-4', deviceId: devices[22].id, lengthFt: 35, studs: 5 },
  { id: 'c-5', kind: 'nm-12-2', breakerId: 'b-5', deviceId: devices[24].id, lengthFt: 40, studs: 6 },
  { id: 'c-6', kind: 'nm-12-2', breakerId: 'b-6', deviceId: devices[15].id, lengthFt: 30, studs: 4 },
  { id: 'c-7', kind: 'nm-12-2', breakerId: 'b-7', deviceId: devices[31].id, lengthFt: 55, studs: 9 },
  { id: 'c-8', kind: 'nm-12-2', breakerId: 'b-8', deviceId: devices[29].id, lengthFt: 50, studs: 7 },
  { id: 'c-9', kind: 'nm-12-2', breakerId: 'b-9', deviceId: devices[30].id, lengthFt: 50, studs: 7 },
  { id: 'c-10', kind: 'nm-10-3', breakerId: 'b-10', deviceId: devices[37].id, lengthFt: 55, studs: 8 },
  { id: 'c-11', kind: 'nm-6-3',  breakerId: 'b-11', deviceId: devices[31].id, lengthFt: 30, studs: 4 },
  { id: 'c-12', kind: 'nm-6-3',  breakerId: 'b-12', deviceId: devices[36].id, lengthFt: 40, studs: 6 },
  { id: 'c-13', kind: 'nm-10-3', breakerId: 'b-13', deviceId: devices[38].id, lengthFt: 50, studs: 8 },
];

/* ── Appliances ── */
const appliances: HouseDoc['appliances'] = [
  { id: 'a-fridge',    kind: 'fridge',         watts: 700,  volts: 120, continuous: false, on: true,  label: 'Fridge' },
  { id: 'a-dish',      kind: 'dishwasher',     watts: 1200, volts: 120, continuous: false, on: false, label: 'Dishwasher' },
  { id: 'a-toaster',   kind: 'toaster',        watts: 1500, volts: 120, continuous: false, on: false, label: 'Toaster' },
  { id: 'a-kettle',    kind: 'kettle',         watts: 1500, volts: 120, continuous: false, on: false, label: 'Kettle' },
  { id: 'a-microwave', kind: 'microwave',      watts: 1200, volts: 120, continuous: false, on: false, label: 'Microwave' },
  { id: 'a-tv',        kind: 'tv',             watts: 150,  volts: 120, continuous: false, on: true,  label: 'TV' },
  { id: 'a-comp',      kind: 'computer',       watts: 300,  volts: 120, continuous: false, on: true,  label: 'Computer' },
  { id: 'a-lights',    kind: 'general-lights', watts: 900,  volts: 120, continuous: true,  on: true,  label: 'Lights' },
  { id: 'a-range',     kind: 'range',          watts: 8000, volts: 240, continuous: false, on: false, label: 'Range' },
  { id: 'a-dryer',     kind: 'dryer',          watts: 5500, volts: 240, continuous: false, on: false, label: 'Dryer' },
  { id: 'a-ev',        kind: 'ev-charger',     watts: 7680, volts: 240, continuous: true,  on: false, label: 'EV charger' },
  { id: 'a-heat',      kind: 'heat-pump',      watts: 6000, volts: 240, continuous: true,  on: true,  label: 'Heat pump' },
];

export const PRESET_HOUSE: HouseDoc = {
  rooms,
  panelAmps: 200,
  mainBondingJumper: true,
  subpanelBonded: false,
  breakers,
  devices,
  cables,
  appliances,
};

export function emptyDoc(): HouseDoc {
  return {
    rooms: rooms.map(r => ({ ...r })),
    panelAmps: 200,
    mainBondingJumper: true,
    subpanelBonded: false,
    breakers: [],
    devices: [],
    cables: [],
    appliances: [],
  };
}

export function clonePreset(): HouseDoc {
  return JSON.parse(JSON.stringify(PRESET_HOUSE));
}
