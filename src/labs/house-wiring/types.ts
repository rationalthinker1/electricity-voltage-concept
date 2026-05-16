/**
 * Document types for the House Wiring Sandbox.
 *
 * The document is a floorplan plus a panel. Rooms are pre-defined zones
 * (kitchen, bathrooms, bedrooms, etc.); the reader places devices into
 * rooms, drops breakers in the panel, runs cables from a breaker to a
 * device, and attaches appliances to receptacles.
 *
 * Positions live on a 20-px integer grid in canvas CSS coords. Rooms
 * are axis-aligned rectangles whose extent in grid units defines wall
 * length (used for the receptacle-spacing audit).
 */

/* ───────────────── Rooms ───────────────── */

export type RoomKind =
  | 'kitchen'
  | 'kitchen-island'
  | 'bath'
  | 'living'
  | 'dining'
  | 'bedroom'
  | 'garage'
  | 'basement'
  | 'laundry'
  | 'outdoor'
  | 'hall'
  | 'closet';

export interface Room {
  id: string;
  kind: RoomKind;
  name: string;
  /** Top-left grid coordinate. */
  x: number;
  y: number;
  /** Width and height in grid units. One grid unit ≈ 1 ft, scaled to canvas. */
  w: number;
  h: number;
}

/* ───────────────── Devices ───────────────── */

export type DeviceKind =
  | 'receptacle' // standard duplex 15/20 A
  | 'receptacle-gfci' // GFCI duplex
  | 'receptacle-tr' // tamper resistant (modern code default)
  | 'receptacle-wr' // weather resistant (outdoor)
  | 'receptacle-240' // 30/50 A range/dryer/EV
  | 'switch'
  | 'light' // ceiling/wall fixture
  | 'smoke' // smoke detector (120 V interconnected)
  | 'fan'; // ceiling fan / exhaust fan

/** A placed device sitting on the floorplan. */
export interface Device {
  id: string;
  kind: DeviceKind;
  /** Room this device belongs to. */
  roomId: string;
  /** Grid position inside the canvas. */
  x: number;
  y: number;
  /** Which breaker (if any) feeds this device. */
  breakerId: string | null;
  /** Which appliance (if any) is plugged into this receptacle. */
  applianceId: string | null;
  /** Manual label override (else derived from kind). */
  label?: string;
}

/* ───────────────── Panel & breakers ───────────────── */

export type BreakerKind =
  | 'std-15'
  | 'std-20'
  | 'afci-15'
  | 'afci-20'
  | 'gfci-15'
  | 'gfci-20'
  | 'dfci-15' // dual function AFCI/GFCI (210.8 + 210.12 compliant)
  | 'dfci-20'
  | 'dp-30' // double-pole 240 V
  | 'dp-40'
  | 'dp-50';

export interface Breaker {
  id: string;
  kind: BreakerKind;
  /** Slot index in the panel (0-based). */
  slot: number;
  /** Optional human label, e.g. "Kitchen counter". */
  label?: string;
}

/* ───────────────── Cables ───────────────── */

export type CableKind =
  | 'nm-14-2' // 14 AWG, 15 A
  | 'nm-12-2' // 12 AWG, 20 A
  | 'nm-10-3' // 10 AWG, 30 A, 3-conductor (240 V)
  | 'nm-8-3' // 8 AWG, 40 A
  | 'nm-6-3'; // 6 AWG, 50 A (EV / range)

/** A cable run from a breaker to a device. We treat it as a single
 *  abstract length-of-conductor; the floorplan UI draws it as a
 *  polyline but the audit only cares about kind + length + endpoints. */
export interface Cable {
  id: string;
  kind: CableKind;
  breakerId: string;
  deviceId: string;
  /** Length in feet (computed from the polyline; user-editable). */
  lengthFt: number;
  /** Number of studs/joists the cable passes through (proxy for
   *  300.4 protection check). */
  studs: number;
}

/* ───────────────── Appliances ───────────────── */

export type ApplianceKind =
  | 'toaster'
  | 'kettle'
  | 'microwave'
  | 'dishwasher'
  | 'fridge'
  | 'washer'
  | 'dryer' // 240 V, 30 A
  | 'range' // 240 V, 40-50 A
  | 'water-heater' // 240 V, 30 A
  | 'heat-pump' // 240 V, 30-50 A
  | 'ev-charger' // 240 V, 32-48 A continuous
  | 'general-lights' // a placeholder for the bulk lighting load
  | 'tv'
  | 'computer';

export interface Appliance {
  id: string;
  kind: ApplianceKind;
  /** Nameplate watts (continuous + non-continuous combined). */
  watts: number;
  /** Operating voltage (120 or 240). */
  volts: 120 | 240;
  /** If true, treated as a "continuous" load (NEC 210.19/220.14: ×1.25). */
  continuous: boolean;
  /** Whether the appliance is currently switched on (for the trip sim). */
  on: boolean;
  /** Human label override. */
  label?: string;
}

/* ───────────────── Document ───────────────── */

export interface HouseDoc {
  /** Floorplan rooms (fixed in a preset; can be edited later). */
  rooms: Room[];
  /** Panel size in amperes. Typical: 100, 150, 200, 400. */
  panelAmps: number;
  /** Is the main bonding jumper installed at the panel? */
  mainBondingJumper: boolean;
  /** Are neutral and ground bonded at a subpanel? (true = violation). */
  subpanelBonded: boolean;
  breakers: Breaker[];
  devices: Device[];
  cables: Cable[];
  appliances: Appliance[];
}

/* ───────────────── Audit result ───────────────── */

export type ViolationSeverity = 'error' | 'warning' | 'info';

export interface Violation {
  id: string;
  /** NEC article reference, e.g. "210.8(A)(6)". */
  code: string;
  severity: ViolationSeverity;
  /** Short headline. */
  title: string;
  /** Longer explanation, plain text. */
  detail: string;
  /** Optional reference to the element triggering it. */
  refDeviceId?: string;
  refBreakerId?: string;
  refCableId?: string;
  refRoomId?: string;
}

export interface CircuitTally {
  breakerId: string;
  breakerLabel: string;
  breakerAmps: number;
  /** True if 240 V (double-pole). */
  is240: boolean;
  /** Sum of continuous-load watts × 1.25 + non-continuous watts. */
  demandWatts: number;
  /** Current implied by demand at the circuit voltage. */
  demandAmps: number;
  /** Voltage drop along the cable feeding the heaviest fed device, in V. */
  voltageDropV: number;
  /** Same, as a percentage of nominal voltage. */
  voltageDropPct: number;
  /** Does the simulated "on" load exceed the breaker rating? */
  willTrip: boolean;
}

export interface AuditResult {
  violations: Violation[];
  circuits: CircuitTally[];
  /** Total panel demand watts (post-220.82 weighting), full house. */
  panelDemandWatts: number;
  /** Implied feeder amps at 240 V (split-phase). */
  panelDemandAmps: number;
  /** Panel utilisation as a fraction of panelAmps. */
  panelUtilisation: number;
}
