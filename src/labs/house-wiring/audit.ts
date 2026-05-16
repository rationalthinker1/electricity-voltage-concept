/**
 * NEC audit engine for the House Wiring Sandbox.
 *
 * Pure function: takes a HouseDoc, returns an AuditResult. No React, no
 * side effects.
 *
 * The audit is deliberately a simplified subset of the real NEC: just
 * enough rules to give the reader a sense of how an electrician thinks
 * and to catch the canonical "first 20 mistakes a homeowner makes".
 *
 * NEC articles enforced (2023 edition):
 *   210.8   — GFCI protection by location
 *   210.12  — AFCI protection in dwelling living areas
 *   210.19  — branch-circuit conductor sizing (continuous × 1.25)
 *   210.23  — permissible load on a branch circuit (80 % continuous)
 *   210.52  — receptacle spacing on walls
 *   220.82  — optional dwelling-unit calculation
 *   240.4   — overcurrent protection for conductors
 *   250     — bonding / grounding (main bonding jumper, subpanel bond)
 *   300.4   — protection of NM cable through framing (stud count proxy)
 *   314.16  — box fill (very simplified — only flags absurdly stuffed boxes)
 *   404.2(C)— neutral required at switch boxes
 *   406.9   — outdoor receptacle in-use / WR
 */

import type {
  Appliance,
  AuditResult,
  Breaker,
  BreakerKind,
  Cable,
  CableKind,
  CircuitTally,
  Device,
  DeviceKind,
  HouseDoc,
  Room,
  RoomKind,
  Violation,
} from './types';

/* ───────────── Lookup tables ───────────── */

/** Breaker rating (amps) keyed by kind. */
export const BREAKER_AMPS: Record<BreakerKind, number> = {
  'std-15': 15,
  'std-20': 20,
  'afci-15': 15,
  'afci-20': 20,
  'gfci-15': 15,
  'gfci-20': 20,
  'dfci-15': 15,
  'dfci-20': 20,
  'dp-30': 30,
  'dp-40': 40,
  'dp-50': 50,
};

/** True if this kind provides AFCI protection. */
export function isAFCI(k: BreakerKind): boolean {
  return k === 'afci-15' || k === 'afci-20' || k === 'dfci-15' || k === 'dfci-20';
}

/** True if this kind provides GFCI protection at the breaker. */
export function isGFCI(k: BreakerKind): boolean {
  return k === 'gfci-15' || k === 'gfci-20' || k === 'dfci-15' || k === 'dfci-20';
}

/** True if double-pole (240 V). */
export function is240(k: BreakerKind): boolean {
  return k === 'dp-30' || k === 'dp-40' || k === 'dp-50';
}

/** NM-B ampacity at 60 °C (NEC 334.80 → 310.16 column).  */
export const CABLE_AMPACITY: Record<CableKind, number> = {
  'nm-14-2': 15,
  'nm-12-2': 20,
  'nm-10-3': 30,
  'nm-8-3': 40,
  'nm-6-3': 55, // 60 °C; NEC limits NM to 60 °C column.
};

/** Conductor cross-section in circular mils. */
export const CABLE_CMIL: Record<CableKind, number> = {
  'nm-14-2': 4110,
  'nm-12-2': 6530,
  'nm-10-3': 10380,
  'nm-8-3': 16510,
  'nm-6-3': 26240,
};

/** AWG label for display. */
export const CABLE_AWG: Record<CableKind, string> = {
  'nm-14-2': '14',
  'nm-12-2': '12',
  'nm-10-3': '10',
  'nm-8-3': '8',
  'nm-6-3': '6',
};

/** Copper resistivity in ohm·circular-mil per foot, at 75 °C. */
const RHO_CU_OMCMIL_FT = 12.9;

/* ───────────── Room helpers ───────────── */

/** Rooms that require GFCI on 15/20 A receptacles (NEC 210.8(A)). */
const GFCI_ROOMS: RoomKind[] = [
  'bath',
  'kitchen',
  'kitchen-island',
  'garage',
  'outdoor',
  'basement',
  'laundry',
];

/** Rooms that require AFCI on 15/20 A circuits (NEC 210.12(A)). */
const AFCI_ROOMS: RoomKind[] = [
  'kitchen',
  'kitchen-island',
  'bedroom',
  'living',
  'dining',
  'hall',
  'closet',
  'laundry',
];

/** Perimeter wall length (ft) — the audit's stand-in for "wall space". */
function roomPerimeterFt(r: Room): number {
  return 2 * (r.w + r.h);
}

/* ───────────── Audit entry point ───────────── */

export function audit(doc: HouseDoc): AuditResult {
  const violations: Violation[] = [];

  /* ── Index helpers ── */
  const roomById = new Map(doc.rooms.map((r) => [r.id, r]));
  const breakerById = new Map(doc.breakers.map((b) => [b.id, b]));
  const applianceById = new Map(doc.appliances.map((a) => [a.id, a]));
  const cableByDeviceId = new Map<string, Cable>();
  for (const c of doc.cables) cableByDeviceId.set(c.deviceId, c);
  const cableByBreakerId = new Map<string, Cable[]>();
  for (const c of doc.cables) {
    const arr = cableByBreakerId.get(c.breakerId) ?? [];
    arr.push(c);
    cableByBreakerId.set(c.breakerId, arr);
  }
  const devicesByBreakerId = new Map<string, Device[]>();
  for (const d of doc.devices) {
    if (!d.breakerId) continue;
    const arr = devicesByBreakerId.get(d.breakerId) ?? [];
    arr.push(d);
    devicesByBreakerId.set(d.breakerId, arr);
  }
  const devicesByRoomId = new Map<string, Device[]>();
  for (const d of doc.devices) {
    const arr = devicesByRoomId.get(d.roomId) ?? [];
    arr.push(d);
    devicesByRoomId.set(d.roomId, arr);
  }

  /* ──────────────── 210.8 GFCI by location ──────────────── */
  for (const d of doc.devices) {
    if (!isReceptacle(d.kind)) continue;
    const room = roomById.get(d.roomId);
    if (!room) continue;
    if (!GFCI_ROOMS.includes(room.kind)) continue;
    const breaker = d.breakerId ? breakerById.get(d.breakerId) : null;
    const gfciAtBreaker = breaker ? isGFCI(breaker.kind) : false;
    const gfciAtDevice = d.kind === 'receptacle-gfci';
    if (!gfciAtBreaker && !gfciAtDevice) {
      violations.push({
        id: `gfci-${d.id}`,
        code: '210.8(A)',
        severity: 'error',
        title: 'GFCI protection required',
        detail:
          `${labelForRoom(room)} receptacle is not GFCI-protected. ` +
          'NEC 210.8(A) requires GFCI on 125 V, 15/20 A receptacles in this ' +
          'location. Replace with a GFCI device or feed from a GFCI breaker.',
        refDeviceId: d.id,
        refRoomId: room.id,
      });
    }
  }

  /* ──────────────── 210.12 AFCI in living areas ──────────────── */
  // Flag any non-AFCI 15/20 A breaker that feeds a receptacle/light in an AFCI room.
  for (const b of doc.breakers) {
    if (is240(b.kind)) continue; // doesn't apply to 240 V loads
    if (isAFCI(b.kind)) continue;
    const fed = devicesByBreakerId.get(b.id) ?? [];
    for (const d of fed) {
      const room = roomById.get(d.roomId);
      if (!room) continue;
      if (AFCI_ROOMS.includes(room.kind)) {
        violations.push({
          id: `afci-${b.id}-${d.id}`,
          code: '210.12(A)',
          severity: 'error',
          title: 'AFCI protection required',
          detail:
            `Breaker ${breakerLabel(b)} feeds ${labelForRoom(room)} but is not ` +
            'AFCI. NEC 210.12(A) requires AFCI on 15/20 A circuits supplying ' +
            'dwelling-unit living areas.',
          refBreakerId: b.id,
          refDeviceId: d.id,
          refRoomId: room.id,
        });
        break; // one finding per breaker is enough
      }
    }
  }

  /* ──────────────── 210.52 receptacle spacing ──────────────── */
  // Simplified: any room that "needs receptacles per 210.52(A)" should have
  // at least ceil(perimeter / 12) receptacles, since no point on the wall
  // may be more than 6 ft from one.
  const SPACING_ROOMS: RoomKind[] = ['living', 'dining', 'bedroom', 'hall', 'kitchen', 'laundry'];
  for (const r of doc.rooms) {
    if (!SPACING_ROOMS.includes(r.kind)) continue;
    const receptacles = (devicesByRoomId.get(r.id) ?? []).filter((d) => isReceptacle(d.kind));
    const perim = roomPerimeterFt(r);
    const needed = Math.max(2, Math.ceil(perim / 12));
    if (receptacles.length < needed) {
      violations.push({
        id: `spacing-${r.id}`,
        code: '210.52(A)',
        severity: 'warning',
        title: 'Receptacle spacing under code',
        detail:
          `${r.name} has ${receptacles.length} receptacle(s); NEC 210.52(A) ` +
          `requires no point on a wall to be more than 6 ft from an outlet ` +
          `(roughly ≥ ${needed} for a ${r.w}×${r.h} ft room).`,
        refRoomId: r.id,
      });
    }
  }

  /* ──────────────── 240.4 conductor ↔ breaker match ──────────────── */
  for (const c of doc.cables) {
    const breaker = breakerById.get(c.breakerId);
    if (!breaker) continue;
    const bAmps = BREAKER_AMPS[breaker.kind];
    const cAmps = CABLE_AMPACITY[c.kind];
    if (cAmps < bAmps) {
      violations.push({
        id: `ampacity-${c.id}`,
        code: '240.4(D)',
        severity: 'error',
        title: 'Conductor too small for breaker',
        detail:
          `${CABLE_AWG[c.kind]} AWG cable (${cAmps} A ampacity) is fed by a ` +
          `${bAmps} A breaker. NEC 240.4(D) limits 14 AWG to 15 A, 12 AWG to ` +
          '20 A, 10 AWG to 30 A on NM. Upsize the cable or downsize the breaker.',
        refCableId: c.id,
        refBreakerId: breaker.id,
      });
    }
  }

  /* ──────────────── 250 bonding / grounding ──────────────── */
  if (!doc.mainBondingJumper) {
    violations.push({
      id: 'mbj',
      code: '250.24(B)',
      severity: 'error',
      title: 'Main bonding jumper missing',
      detail:
        'The service equipment must be bonded to the grounded (neutral) ' +
        'conductor with a main bonding jumper. Without it, fault current has ' +
        'no low-impedance path back to the source — breakers will not trip ' +
        'on a ground fault.',
    });
  }
  if (doc.subpanelBonded) {
    violations.push({
      id: 'sp-bond',
      code: '250.142(B)',
      severity: 'error',
      title: 'Neutral bonded at a subpanel',
      detail:
        'Neutral and ground must remain isolated at subpanels. Bonding them ' +
        'downstream of the service makes the ground bar carry neutral return ' +
        'current — a shock and fire hazard.',
    });
  }

  /* ──────────────── 300.4 cable through framing ──────────────── */
  // Proxy: any single cable run with more than 12 stud holes implies a long
  // attic / floor joist run that almost certainly hits framing edges
  // < 1¼" from the face without nail plates somewhere.
  for (const c of doc.cables) {
    if (c.studs > 12) {
      violations.push({
        id: `studs-${c.id}`,
        code: '300.4(A)',
        severity: 'warning',
        title: 'Long run; verify nail-plate protection',
        detail:
          `Cable passes through ${c.studs} studs/joists. NEC 300.4(A) requires ` +
          'a steel nail plate (or 1¼" setback) at every hole within 1¼" of the ' +
          'framing edge. Long runs almost always need plates somewhere.',
        refCableId: c.id,
      });
    }
  }

  /* ──────────────── 314.16 box fill (simplified) ──────────────── */
  // We don't model boxes explicitly. Heuristic: if a switch or a
  // device in the same 1-grid spot has more than 2 sibling devices,
  // call it a stuffed box.
  const boxKey = (d: Device) => `${d.roomId}:${d.x},${d.y}`;
  const byBox = new Map<string, Device[]>();
  for (const d of doc.devices) {
    const k = boxKey(d);
    const arr = byBox.get(k) ?? [];
    arr.push(d);
    byBox.set(k, arr);
  }
  for (const [, arr] of byBox) {
    if (arr.length > 3) {
      violations.push({
        id: `box-${arr[0].id}`,
        code: '314.16(B)',
        severity: 'warning',
        title: 'Box fill likely exceeded',
        detail:
          `${arr.length} devices clustered at one location. A standard ` +
          '4 × 1½" box holds about 22 in³; a typical receptacle + switch + ' +
          'grounds + clamps will saturate it well below this count.',
        refDeviceId: arr[0].id,
      });
    }
  }

  /* ──────────────── 404.2(C) neutral at switch boxes ──────────────── */
  // Proxy: any "switch" device that does not share a room with at least
  // one receptacle on the same circuit flags this rule. The 2023 NEC
  // requires a neutral conductor at almost every switch location to
  // accommodate smart switches.
  for (const d of doc.devices) {
    if (d.kind !== 'switch') continue;
    if (!d.breakerId) continue;
    const peers = devicesByBreakerId.get(d.breakerId) ?? [];
    const hasLoad = peers.some(
      (p) => p.id !== d.id && (p.kind === 'light' || isReceptacle(p.kind)),
    );
    if (!hasLoad) {
      violations.push({
        id: `neutral-${d.id}`,
        code: '404.2(C)',
        severity: 'warning',
        title: 'Switch box needs a neutral',
        detail:
          'NEC 404.2(C) requires a grounded (neutral) conductor at most ' +
          'switch locations so smart / electronic switches can operate. ' +
          'Pull a 3-conductor cable, or feed the box from the load side.',
        refDeviceId: d.id,
      });
    }
  }

  /* ──────────────── 406.9 outdoor weather-resistance ──────────────── */
  for (const d of doc.devices) {
    const room = roomById.get(d.roomId);
    if (!room || room.kind !== 'outdoor') continue;
    if (!isReceptacle(d.kind)) continue;
    if (d.kind !== 'receptacle-wr' && d.kind !== 'receptacle-gfci') {
      violations.push({
        id: `wr-${d.id}`,
        code: '406.9(A)',
        severity: 'error',
        title: 'Outdoor receptacle not weather-resistant',
        detail:
          'NEC 406.9(A) requires weather-resistant (WR) receptacles in damp ' +
          'or wet locations, with an in-use ("bubble") cover. Replace with ' +
          'a WR/TR device.',
        refDeviceId: d.id,
        refRoomId: room.id,
      });
    }
  }

  /* ──────────────── Per-circuit demand & voltage drop ──────────────── */
  const circuits: CircuitTally[] = [];
  for (const b of doc.breakers) {
    const fed = devicesByBreakerId.get(b.id) ?? [];
    let continuousW = 0;
    let nonContinuousW = 0;
    let anyOnW = 0;
    for (const d of fed) {
      if (!d.applianceId) continue;
      const a = applianceById.get(d.applianceId);
      if (!a) continue;
      if (a.continuous) continuousW += a.watts;
      else nonContinuousW += a.watts;
      if (a.on) anyOnW += a.watts;
    }
    const demandW = continuousW * 1.25 + nonContinuousW;
    const volts = is240(b.kind) ? 240 : 120;
    const demandA = demandW / volts;

    // Voltage drop on the heaviest-fed device cable.
    let vdropV = 0;
    let vdropPct = 0;
    const cables = cableByBreakerId.get(b.id) ?? [];
    if (cables.length > 0) {
      // Use the longest cable as worst-case.
      const worst = cables.reduce((a, c) => (c.lengthFt > a.lengthFt ? c : a), cables[0]);
      // V_drop = 2 * I * ρ * L / cmil
      vdropV = (2 * demandA * RHO_CU_OMCMIL_FT * worst.lengthFt) / CABLE_CMIL[worst.kind];
      vdropPct = (vdropV / volts) * 100;
      if (vdropPct > 3) {
        violations.push({
          id: `vdrop-${worst.id}`,
          code: '210.19(A) Note 4',
          severity: 'warning',
          title: 'Voltage drop above 3 %',
          detail:
            `Branch circuit on breaker ${breakerLabel(b)} drops ` +
            `${vdropPct.toFixed(1)} % (${vdropV.toFixed(1)} V) at full demand. ` +
            'NEC informational note recommends ≤ 3 % on branch circuits. ' +
            'Upsize the conductor or shorten the run.',
          refCableId: worst.id,
          refBreakerId: b.id,
        });
      }
    }

    // 210.23 80 % continuous rule: continuous load must not exceed 80 % of
    // breaker rating (equivalent to demand including the 1.25 factor).
    const bAmps = BREAKER_AMPS[b.kind];
    if (demandA > bAmps) {
      violations.push({
        id: `over-${b.id}`,
        code: '210.23',
        severity: 'error',
        title: 'Branch over-loaded',
        detail:
          `Demand on breaker ${breakerLabel(b)} is ${demandA.toFixed(1)} A; ` +
          `breaker is rated ${bAmps} A. Move loads or use a larger circuit.`,
        refBreakerId: b.id,
      });
    }

    circuits.push({
      breakerId: b.id,
      breakerLabel: breakerLabel(b),
      breakerAmps: bAmps,
      is240: is240(b.kind),
      demandWatts: demandW,
      demandAmps: demandA,
      voltageDropV: vdropV,
      voltageDropPct: vdropPct,
      willTrip: anyOnW / volts > bAmps,
    });
  }

  /* ──────────────── 220.82 panel demand ──────────────── */
  // Simplified: general lighting + small-appliance branch at 3 VA/ft² +
  // appliance fixed-in-place loads + range/HVAC/EV at their nameplate.
  // We collect every appliance watt across the house and apply the
  // 220.82 weighting: first 10 kVA at 100 %, remainder at 40 %.
  let totalApplianceW = 0;
  for (const a of doc.appliances) totalApplianceW += a.watts;
  const houseAreaFt2 = doc.rooms.reduce((s, r) => s + r.w * r.h, 0);
  const lightingVA = 3 * houseAreaFt2; // NEC 220.12 3 VA / ft²
  const grossVA = totalApplianceW + lightingVA;
  const panelDemandW = grossVA <= 10000 ? grossVA : 10000 + 0.4 * (grossVA - 10000);
  const panelDemandA = panelDemandW / 240;
  const panelUtil = panelDemandA / Math.max(1, doc.panelAmps);
  if (panelUtil > 0.8) {
    violations.push({
      id: 'panel-80',
      code: '220.82',
      severity: 'warning',
      title: 'Panel demand above 80 %',
      detail:
        `Calculated demand is ${panelDemandA.toFixed(0)} A on a ` +
        `${doc.panelAmps} A service (${(panelUtil * 100).toFixed(0)} %). ` +
        'NEC permits 100 %, but most jurisdictions and good practice ' +
        'cap continuous load at 80 % of the main breaker.',
    });
  }
  if (panelUtil > 1.0) {
    violations.push({
      id: 'panel-over',
      code: '220.82',
      severity: 'error',
      title: 'Panel under-sized for load',
      detail:
        `Calculated demand (${panelDemandA.toFixed(0)} A) exceeds the ` +
        `${doc.panelAmps} A service. Upsize the service or shed load.`,
    });
  }

  /* ──────────────── Smoke detector & 240 V receptacle pairings ──────────────── */
  // 210.7: every bedroom needs a smoke detector on a normally-energised
  // circuit. We flag bedrooms without any smoke device.
  for (const r of doc.rooms) {
    if (r.kind !== 'bedroom') continue;
    const inRoom = devicesByRoomId.get(r.id) ?? [];
    const hasSmoke = inRoom.some((d) => d.kind === 'smoke');
    if (!hasSmoke) {
      violations.push({
        id: `smoke-${r.id}`,
        code: 'NFPA 72',
        severity: 'warning',
        title: 'No smoke detector in bedroom',
        detail:
          `${r.name} has no smoke detector. NFPA 72 (referenced by ` +
          'IRC §R314) requires interconnected smoke alarms in each ' +
          'sleeping room.',
        refRoomId: r.id,
      });
    }
  }

  // 210.21(B)(2): 240 V appliance must sit on a 240 V breaker.
  for (const d of doc.devices) {
    if (d.kind !== 'receptacle-240') continue;
    const b = d.breakerId ? breakerById.get(d.breakerId) : null;
    if (!b) continue;
    if (!is240(b.kind)) {
      violations.push({
        id: `240-${d.id}`,
        code: '210.21(B)(2)',
        severity: 'error',
        title: '240 V receptacle on a 120 V breaker',
        detail:
          'A 240 V receptacle (range / dryer / EV) must be fed from a ' +
          'double-pole breaker. The receptacle and its supply must match.',
        refDeviceId: d.id,
        refBreakerId: b.id,
      });
    }
  }

  return {
    violations,
    circuits,
    panelDemandWatts: panelDemandW,
    panelDemandAmps: panelDemandA,
    panelUtilisation: panelUtil,
  };
}

/* ───────────── Helpers ───────────── */

export function isReceptacle(k: DeviceKind): boolean {
  return (
    k === 'receptacle' ||
    k === 'receptacle-gfci' ||
    k === 'receptacle-tr' ||
    k === 'receptacle-wr' ||
    k === 'receptacle-240'
  );
}

export function breakerLabel(b: Breaker): string {
  if (b.label) return b.label;
  const a = BREAKER_AMPS[b.kind];
  const tag =
    isAFCI(b.kind) && isGFCI(b.kind)
      ? 'DFCI'
      : isAFCI(b.kind)
        ? 'AFCI'
        : isGFCI(b.kind)
          ? 'GFCI'
          : is240(b.kind)
            ? '2P'
            : 'STD';
  return `${a} A ${tag} (slot ${b.slot + 1})`;
}

function labelForRoom(r: Room): string {
  return r.name;
}

/* ───────────── Display utilities ───────────── */

export function applianceDefault(k: Appliance['kind']): Omit<Appliance, 'id' | 'on' | 'label'> {
  switch (k) {
    case 'toaster':
      return { kind: k, watts: 1500, volts: 120, continuous: false };
    case 'kettle':
      return { kind: k, watts: 1500, volts: 120, continuous: false };
    case 'microwave':
      return { kind: k, watts: 1200, volts: 120, continuous: false };
    case 'dishwasher':
      return { kind: k, watts: 1200, volts: 120, continuous: false };
    case 'fridge':
      return { kind: k, watts: 700, volts: 120, continuous: false };
    case 'washer':
      return { kind: k, watts: 1200, volts: 120, continuous: false };
    case 'dryer':
      return { kind: k, watts: 5500, volts: 240, continuous: false };
    case 'range':
      return { kind: k, watts: 8000, volts: 240, continuous: false };
    case 'water-heater':
      return { kind: k, watts: 4500, volts: 240, continuous: true };
    case 'heat-pump':
      return { kind: k, watts: 6000, volts: 240, continuous: true };
    case 'ev-charger':
      return { kind: k, watts: 7680, volts: 240, continuous: true }; // 32 A continuous
    case 'general-lights':
      return { kind: k, watts: 900, volts: 120, continuous: true };
    case 'tv':
      return { kind: k, watts: 150, volts: 120, continuous: false };
    case 'computer':
      return { kind: k, watts: 300, volts: 120, continuous: false };
  }
}

export function applianceLabel(k: Appliance['kind']): string {
  const M: Record<Appliance['kind'], string> = {
    toaster: 'Toaster',
    kettle: 'Kettle',
    microwave: 'Microwave',
    dishwasher: 'Dishwasher',
    fridge: 'Refrigerator',
    washer: 'Washer',
    dryer: 'Dryer (240 V)',
    range: 'Range (240 V)',
    'water-heater': 'Water heater',
    'heat-pump': 'Heat pump',
    'ev-charger': 'EV charger',
    'general-lights': 'General lighting',
    tv: 'TV',
    computer: 'Computer',
  };
  return M[k];
}

export function deviceLabel(k: DeviceKind): string {
  const M: Record<DeviceKind, string> = {
    receptacle: 'Receptacle',
    'receptacle-gfci': 'GFCI receptacle',
    'receptacle-tr': 'TR receptacle',
    'receptacle-wr': 'WR receptacle',
    'receptacle-240': '240 V receptacle',
    switch: 'Switch',
    light: 'Light',
    smoke: 'Smoke alarm',
    fan: 'Fan',
  };
  return M[k];
}

export function cableLabel(k: CableKind): string {
  const a = CABLE_AMPACITY[k];
  return `${CABLE_AWG[k]} AWG · ${a} A`;
}

export function breakerKindLabel(k: BreakerKind): string {
  const a = BREAKER_AMPS[k];
  if (isAFCI(k) && isGFCI(k)) return `${a} A DFCI (dual-function)`;
  if (isAFCI(k)) return `${a} A AFCI`;
  if (isGFCI(k)) return `${a} A GFCI`;
  if (is240(k)) return `${a} A double-pole`;
  return `${a} A standard`;
}
