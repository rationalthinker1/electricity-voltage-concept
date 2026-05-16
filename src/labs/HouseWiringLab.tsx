/**
 * Lab A.2 — House Wiring Sandbox
 *
 *   NEC 220.82 demand + 240.4 ampacity + 314.16 box fill
 *
 * A floorplan editor for residential wiring. The reader drops devices
 * (receptacles, switches, lights, smoke alarms) into rooms, drops
 * breakers into the service panel, runs NM-B cable between them, and
 * plugs appliances into receptacles. A live audit runs the document
 * through a slim subset of the 2023 National Electrical Code and lists
 * every violation it finds.
 *
 *   /labs/HouseWiringLab.tsx              ← this file (UI + state)
 *   /labs/house-wiring/types.ts           ← document & audit types
 *   /labs/house-wiring/audit.ts           ← pure-function NEC audit
 *   /labs/house-wiring/preset.ts          ← sample wired house
 *   /labs/house-wiring/FloorplanCanvas    ← floorplan + panel renderer
 */

import { useCallback, useEffect, useMemo, useState } from 'react';

import { LabShell } from '@/components/LabShell';
import { MathBlock, Pullout } from '@/components/Prose';
import { Cite } from '@/components/SourcesList';
import { TryIt } from '@/components/TryIt';
import { BASE_LAB_SOURCES } from '@/labs/data/manifest';

import { FloorplanCanvas, type ArmedTool } from './house-wiring/FloorplanCanvas';
import {
  BREAKER_AMPS,
  applianceDefault,
  applianceLabel,
  breakerKindLabel,
  cableLabel,
  deviceLabel,
  audit,
} from './house-wiring/audit';
import { clonePreset, emptyDoc } from './house-wiring/preset';
import type {
  Appliance,
  ApplianceKind,
  BreakerKind,
  CableKind,
  Device,
  DeviceKind,
  HouseDoc,
} from './house-wiring/types';

const SLUG = 'house-wiring';
const SOURCES = BASE_LAB_SOURCES[SLUG]!;

/* ───────────────────────── Component ───────────────────────── */

const DEVICE_KINDS: DeviceKind[] = [
  'receptacle-tr',
  'receptacle-gfci',
  'receptacle-wr',
  'receptacle-240',
  'switch',
  'light',
  'smoke',
  'fan',
];

const BREAKER_KINDS: BreakerKind[] = [
  'std-15',
  'std-20',
  'afci-15',
  'afci-20',
  'gfci-15',
  'gfci-20',
  'dfci-15',
  'dfci-20',
  'dp-30',
  'dp-40',
  'dp-50',
];

const CABLE_KINDS: CableKind[] = ['nm-14-2', 'nm-12-2', 'nm-10-3', 'nm-8-3', 'nm-6-3'];

const APPLIANCE_KINDS: ApplianceKind[] = [
  'fridge',
  'dishwasher',
  'microwave',
  'toaster',
  'kettle',
  'washer',
  'dryer',
  'range',
  'water-heater',
  'heat-pump',
  'ev-charger',
  'general-lights',
  'tv',
  'computer',
];

export default function HouseWiringLab() {
  const [doc, setDoc] = useState<HouseDoc>(() => clonePreset());
  const [armed, setArmed] = useState<ArmedTool>('select');
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [selectedBreakerId, setSelectedBreakerId] = useState<string | null>(null);
  const [selectedCableId, setSelectedCableId] = useState<string | null>(null);
  const [cableAnchor, setCableAnchor] = useState<{ breakerId: string } | null>(null);
  const [defaultCableKind, setDefaultCableKind] = useState<CableKind>('nm-12-2');

  /* ── Re-run audit on every doc change ── */
  const auditResult = useMemo(() => audit(doc), [doc]);

  /* ── Mutators ── */

  const placeDevice = useCallback((kind: DeviceKind, roomId: string, gx: number, gy: number) => {
    const id = `d${Date.now()}-${Math.floor(Math.random() * 9999)}`;
    const dev: Device = {
      id,
      kind,
      roomId,
      x: gx,
      y: gy,
      breakerId: null,
      applianceId: null,
    };
    setDoc((prev) => ({ ...prev, devices: [...prev.devices, dev] }));
    setSelectedDeviceId(id);
    setArmed('select');
  }, []);

  const placeBreaker = useCallback(
    (kind: BreakerKind) => {
      const slot = Math.max(0, ...doc.breakers.map((b) => b.slot + 1));
      const id = `b${Date.now()}-${Math.floor(Math.random() * 9999)}`;
      setDoc((prev) => ({
        ...prev,
        breakers: [...prev.breakers, { id, kind, slot }],
      }));
      setSelectedBreakerId(id);
      setArmed('select');
    },
    [doc.breakers],
  );

  const beginCableFromBreaker = useCallback((breakerId: string) => {
    setCableAnchor({ breakerId });
  }, []);

  const completeCableToDevice = useCallback(
    (deviceId: string) => {
      if (!cableAnchor) return;
      const id = `c${Date.now()}-${Math.floor(Math.random() * 9999)}`;
      setDoc((prev) => ({
        ...prev,
        // Assign the breaker to the device automatically.
        devices: prev.devices.map((d) =>
          d.id === deviceId ? { ...d, breakerId: cableAnchor.breakerId } : d,
        ),
        cables: [
          ...prev.cables,
          {
            id,
            kind: defaultCableKind,
            breakerId: cableAnchor.breakerId,
            deviceId,
            lengthFt: 30,
            studs: 5,
          },
        ],
      }));
      setCableAnchor(null);
      setArmed('select');
    },
    [cableAnchor, defaultCableKind],
  );

  const deleteSelected = useCallback(() => {
    if (selectedDeviceId) {
      setDoc((prev) => ({
        ...prev,
        devices: prev.devices.filter((d) => d.id !== selectedDeviceId),
        cables: prev.cables.filter((c) => c.deviceId !== selectedDeviceId),
      }));
      setSelectedDeviceId(null);
    } else if (selectedBreakerId) {
      setDoc((prev) => ({
        ...prev,
        breakers: prev.breakers.filter((b) => b.id !== selectedBreakerId),
        cables: prev.cables.filter((c) => c.breakerId !== selectedBreakerId),
        devices: prev.devices.map((d) =>
          d.breakerId === selectedBreakerId ? { ...d, breakerId: null } : d,
        ),
      }));
      setSelectedBreakerId(null);
    } else if (selectedCableId) {
      setDoc((prev) => ({ ...prev, cables: prev.cables.filter((c) => c.id !== selectedCableId) }));
      setSelectedCableId(null);
    }
  }, [selectedDeviceId, selectedBreakerId, selectedCableId]);

  // Keyboard delete handling.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setArmed('select');
        setCableAnchor(null);
        return;
      }
      if (e.key !== 'Delete' && e.key !== 'Backspace') return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if (selectedDeviceId || selectedBreakerId || selectedCableId) {
        e.preventDefault();
        deleteSelected();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [deleteSelected, selectedDeviceId, selectedBreakerId, selectedCableId]);

  const loadPreset = useCallback(() => {
    setDoc(clonePreset());
    setSelectedDeviceId(null);
    setSelectedBreakerId(null);
    setSelectedCableId(null);
    setArmed('select');
    setCableAnchor(null);
  }, []);

  const clearAll = useCallback(() => {
    setDoc(emptyDoc());
    setSelectedDeviceId(null);
    setSelectedBreakerId(null);
    setSelectedCableId(null);
    setArmed('select');
    setCableAnchor(null);
  }, []);

  const updateDevice = useCallback((next: Device) => {
    setDoc((prev) => ({
      ...prev,
      devices: prev.devices.map((d) => (d.id === next.id ? next : d)),
    }));
  }, []);

  const updateBreakerKind = useCallback((id: string, kind: BreakerKind) => {
    setDoc((prev) => ({
      ...prev,
      breakers: prev.breakers.map((b) => (b.id === id ? { ...b, kind } : b)),
    }));
  }, []);

  const updateCable = useCallback(
    (id: string, patch: Partial<{ kind: CableKind; lengthFt: number; studs: number }>) => {
      setDoc((prev) => ({
        ...prev,
        cables: prev.cables.map((c) => (c.id === id ? { ...c, ...patch } : c)),
      }));
    },
    [],
  );

  const updatePanelAmps = useCallback((amps: number) => {
    setDoc((prev) => ({ ...prev, panelAmps: amps }));
  }, []);

  const toggleBonding = useCallback((field: 'mainBondingJumper' | 'subpanelBonded') => {
    setDoc((prev) => ({ ...prev, [field]: !prev[field] }));
  }, []);

  // Add/replace appliance on the selected receptacle.
  const setApplianceOnDevice = useCallback((deviceId: string, kind: ApplianceKind | '') => {
    setDoc((prev) => {
      const d = prev.devices.find((dd) => dd.id === deviceId);
      if (!d) return prev;
      // Remove old appliance.
      let appliances = prev.appliances;
      if (d.applianceId) appliances = appliances.filter((a) => a.id !== d.applianceId);
      let newApplianceId: string | null = null;
      if (kind) {
        const def = applianceDefault(kind);
        newApplianceId = `a${Date.now()}-${Math.floor(Math.random() * 9999)}`;
        appliances = [
          ...appliances,
          { id: newApplianceId, ...def, on: false, label: applianceLabel(kind) },
        ];
      }
      return {
        ...prev,
        appliances,
        devices: prev.devices.map((dd) =>
          dd.id === deviceId ? { ...dd, applianceId: newApplianceId } : dd,
        ),
      };
    });
  }, []);

  const toggleAppliance = useCallback((id: string) => {
    setDoc((prev) => ({
      ...prev,
      appliances: prev.appliances.map((a) => (a.id === id ? { ...a, on: !a.on } : a)),
    }));
  }, []);

  const updateAppliance = useCallback((id: string, patch: Partial<Appliance>) => {
    setDoc((prev) => ({
      ...prev,
      appliances: prev.appliances.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    }));
  }, []);

  /* ── Lookups for the inspector & readouts ── */
  const selectedDevice = useMemo(
    () => doc.devices.find((d) => d.id === selectedDeviceId) ?? null,
    [doc.devices, selectedDeviceId],
  );
  const selectedBreaker = useMemo(
    () => doc.breakers.find((b) => b.id === selectedBreakerId) ?? null,
    [doc.breakers, selectedBreakerId],
  );
  const selectedCable = useMemo(
    () => doc.cables.find((c) => c.id === selectedCableId) ?? null,
    [doc.cables, selectedCableId],
  );

  const onPickRoom = useCallback(() => {
    setSelectedDeviceId(null);
    setSelectedBreakerId(null);
    setSelectedCableId(null);
  }, []);

  /* ───────────── Render ───────────── */

  const labContent = (
    <div className="gap-lg mt-md flex flex-col">
      <div className="gap-lg pb-md border-border flex flex-wrap items-center justify-between border-b">
        <div className="gap-sm flex flex-wrap items-center">
          <button
            type="button"
            className="bg-bg-card text-text-dim border-border font-3 text-2 px-md rounded-2 hover:text-text hover:border-text-dim hover:bg-bg-card-hover cursor-pointer border py-[6px] transition-all"
            onClick={loadPreset}
          >
            Load preset
          </button>
          <button
            type="button"
            className="bg-bg-card text-text-dim border-border font-3 text-2 px-md rounded-2 hover:text-pink hover:border-pink hover:bg-bg-card-hover cursor-pointer border py-[6px] transition-all"
            onClick={clearAll}
          >
            Clear all
          </button>
        </div>
        <div className="gap-sm flex flex-wrap items-center">
          <span className="font-3 text-1 text-text-muted tracking-4 mr-xs uppercase">Panel:</span>
          {[100, 150, 200, 400].map((a) => (
            <button
              key={a}
              type="button"
              className={
                'bg-bg-card font-3 text-1 py-xs rounded-2 hover:bg-bg-card-hover cursor-pointer border px-[9px] transition-all ' +
                (doc.panelAmps === a
                  ? 'text-accent border-accent'
                  : 'text-text-dim border-border hover:text-text hover:border-text-dim')
              }
              onClick={() => updatePanelAmps(a)}
            >
              {a} A
            </button>
          ))}
        </div>
        <div className="gap-sm flex flex-wrap items-center">
          <button
            type="button"
            className={
              'bg-bg-card font-3 text-1 py-xs rounded-2 hover:bg-bg-card-hover cursor-pointer border px-[9px] transition-all ' +
              (doc.mainBondingJumper
                ? 'text-accent border-accent'
                : 'text-text-muted border-border hover:text-text hover:border-text-dim')
            }
            onClick={() => toggleBonding('mainBondingJumper')}
            title="Main bonding jumper at service panel"
          >
            MBJ: {doc.mainBondingJumper ? 'on' : 'off'}
          </button>
          <button
            type="button"
            className={
              'bg-bg-card font-3 text-1 py-xs rounded-2 hover:bg-bg-card-hover cursor-pointer border px-[9px] transition-all ' +
              (doc.subpanelBonded
                ? 'text-text-muted border-border hover:text-text hover:border-text-dim'
                : 'text-accent border-accent')
            }
            onClick={() => toggleBonding('subpanelBonded')}
            title="Whether neutral and ground are bonded at a subpanel (should be off)"
          >
            Subpanel N-G: {doc.subpanelBonded ? 'bonded' : 'isolated'}
          </button>
        </div>
      </div>

      <div className="gap-lg grid grid-cols-[220px_1fr_280px] items-start max-[1200px]:grid-cols-1">
        <aside className="bg-bg-card border-border rounded-3 max-h-[700px] overflow-y-auto border p-[14px]">
          <div className="mb-[14px] flex flex-col gap-[5px]">
            <div className="font-3 text-1 text-accent tracking-4 mb-xs uppercase">Devices</div>
            {DEVICE_KINDS.map((k) => (
              <button
                key={k}
                type="button"
                className={
                  'font-1 text-3 rounded-2 cursor-pointer border px-[9px] py-[5px] text-left transition-all ' +
                  (armed === k
                    ? 'bg-accent-soft text-text border-accent'
                    : 'bg-bg-elevated border-border text-text-dim hover:text-text hover:bg-bg-card-hover hover:border-text-dim')
                }
                onClick={() => setArmed(armed === k ? 'select' : k)}
              >
                {deviceLabel(k)}
              </button>
            ))}
          </div>
          <div className="mb-[14px] flex flex-col gap-[5px]">
            <div className="font-3 text-1 text-accent tracking-4 mb-xs uppercase">Breakers</div>
            {BREAKER_KINDS.map((k) => (
              <button
                key={k}
                type="button"
                className={
                  'font-1 text-3 rounded-2 cursor-pointer border px-[9px] py-[5px] text-left transition-all ' +
                  (armed === k
                    ? 'bg-accent-soft text-text border-accent'
                    : 'bg-bg-elevated border-border text-text-dim hover:text-text hover:bg-bg-card-hover hover:border-text-dim')
                }
                onClick={() => setArmed(armed === k ? 'select' : k)}
              >
                {breakerKindLabel(k)}
              </button>
            ))}
          </div>
          <div className="mb-[14px] flex flex-col gap-[5px]">
            <div className="font-3 text-1 text-accent tracking-4 mb-xs uppercase">Cable</div>
            {CABLE_KINDS.map((k) => (
              <button
                key={k}
                type="button"
                className={
                  'font-1 text-3 rounded-2 cursor-pointer border px-[9px] py-[5px] text-left transition-all ' +
                  (defaultCableKind === k
                    ? 'bg-accent-soft text-text border-accent'
                    : 'bg-bg-elevated border-border text-text-dim hover:text-text hover:bg-bg-card-hover hover:border-text-dim')
                }
                onClick={() => setDefaultCableKind(k)}
              >
                NM-B {cableLabel(k)}
              </button>
            ))}
            <button
              type="button"
              className={
                'font-1 text-3 rounded-2 cursor-pointer border px-[9px] py-[5px] text-left transition-all ' +
                (armed === 'cable-pick'
                  ? 'bg-accent-soft text-text border-accent'
                  : 'bg-bg-elevated border-border text-text-dim hover:text-text hover:bg-bg-card-hover hover:border-text-dim')
              }
              onClick={() => {
                if (armed === 'cable-pick') {
                  setArmed('select');
                  setCableAnchor(null);
                } else setArmed('cable-pick');
              }}
            >
              Run cable…
            </button>
          </div>
          <div className="font-3 text-1 text-text-muted border-border border-t pt-[10px] leading-[1.45]">
            {armed === 'cable-pick'
              ? cableAnchor
                ? 'Click the device this cable feeds.'
                : 'Click a breaker in the panel to start the run.'
              : armed && armed !== 'select'
                ? 'Click on the floorplan to drop one.'
                : 'Select mode. Click a device or breaker to edit it.'}
          </div>
        </aside>

        <main className="gap-lg flex flex-col">
          <FloorplanCanvas
            doc={doc}
            armed={armed}
            selectedDeviceId={selectedDeviceId}
            selectedBreakerId={selectedBreakerId}
            selectedCableId={selectedCableId}
            violations={auditResult.violations}
            cableAnchor={cableAnchor}
            defaultCableKind={defaultCableKind}
            onPickRoom={onPickRoom}
            onPickDevice={setSelectedDeviceId}
            onPickBreaker={setSelectedBreakerId}
            onPickCable={setSelectedCableId}
            onDropDevice={placeDevice}
            onDropBreaker={placeBreaker}
            onCableFromBreaker={beginCableFromBreaker}
            onCableToDevice={completeCableToDevice}
          />

          {/* Bottom: tally + violations */}
          <div className="bg-bg-card border-border rounded-3 grid grid-cols-[1fr_1.2fr_1.4fr] gap-[18px] border p-[14px] max-[900px]:grid-cols-1">
            <div className="min-w-0">
              <div className="font-3 text-1 text-accent tracking-4 mb-sm uppercase">
                Panel summary
              </div>
              <Row label="Service rating" value={`${doc.panelAmps} A`} />
              <Row
                label="Calculated demand"
                value={`${auditResult.panelDemandAmps.toFixed(0)} A · ${(auditResult.panelDemandWatts / 1000).toFixed(1)} kW`}
              />
              <Row
                label="Utilisation"
                value={`${(auditResult.panelUtilisation * 100).toFixed(0)} %`}
                color={
                  auditResult.panelUtilisation > 1
                    ? 'var(--pink)'
                    : auditResult.panelUtilisation > 0.8
                      ? 'var(--accent)'
                      : 'var(--teal)'
                }
              />
              <Row label="Branches" value={String(doc.breakers.length)} />
              <Row label="Devices" value={String(doc.devices.length)} />
            </div>
            <div className="min-w-0">
              <div className="font-3 text-1 text-accent tracking-4 mb-sm uppercase">
                Circuits (live)
              </div>
              <div className="flex flex-col gap-[2px]">
                {auditResult.circuits.length === 0 && (
                  <div className="text-2 text-text-muted py-sm leading-5">No breakers placed.</div>
                )}
                {auditResult.circuits.map((c) => (
                  <div
                    key={c.breakerId}
                    className="gap-sm border-border text-2 flex justify-between border-b border-dashed py-[3px]"
                  >
                    <span className="text-text-dim font-1">{c.breakerLabel}</span>
                    <span className="text-text font-3 text-2">
                      {c.demandAmps.toFixed(1)}/{c.breakerAmps} A
                      {c.voltageDropPct > 0 && <> · ΔV {c.voltageDropPct.toFixed(1)}%</>}
                      {c.willTrip && <span className="text-pink ml-[6px] font-bold"> TRIP</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="min-w-0">
              <div className="font-3 text-1 text-accent tracking-4 mb-sm uppercase">
                Violations{' '}
                <span className="text-text bg-accent rounded-pill text-1 ml-[6px] px-[7px] py-[1px]">
                  {auditResult.violations.length}
                </span>
              </div>
              <div className="gap-sm flex max-h-[260px] flex-col overflow-y-auto">
                {auditResult.violations.length === 0 && (
                  <div className="text-2 text-teal py-sm leading-5">
                    No violations. Inspector smiles.
                  </div>
                )}
                {auditResult.violations.map((v) => (
                  <div
                    key={v.id}
                    className={
                      'px-sm bg-bg-elevated rounded-r-2 border-l-[3px] py-[6px] ' +
                      (v.severity === 'error'
                        ? 'border-l-pink'
                        : v.severity === 'warning'
                          ? 'border-l-accent'
                          : v.severity === 'info'
                            ? 'border-l-teal'
                            : 'border-l-accent')
                    }
                  >
                    <div className="gap-sm text-2 flex items-baseline">
                      <span className="font-3 text-text-dim text-1 uppercase">{v.code}</span>
                      <span className="font-1 text-text font-semibold">{v.title}</span>
                    </div>
                    <div className="text-2 text-text-dim mt-[3px] leading-5">{v.detail}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>

        <aside className="bg-bg-card border-border rounded-3 max-h-[700px] overflow-y-auto border p-[14px]">
          {selectedDevice && (
            <DeviceInspector
              key={selectedDevice.id}
              doc={doc}
              device={selectedDevice}
              onUpdate={updateDevice}
              onDelete={deleteSelected}
              onSetAppliance={setApplianceOnDevice}
              onToggleAppliance={toggleAppliance}
              onUpdateAppliance={updateAppliance}
            />
          )}
          {!selectedDevice && selectedBreaker && (
            <BreakerInspector
              breaker={selectedBreaker}
              onUpdate={updateBreakerKind}
              onDelete={deleteSelected}
            />
          )}
          {!selectedDevice && !selectedBreaker && selectedCable && (
            <CableInspector
              cable={selectedCable}
              onUpdate={updateCable}
              onDelete={deleteSelected}
            />
          )}
          {!selectedDevice && !selectedBreaker && !selectedCable && (
            <div className="flex flex-col gap-[10px]">
              <div className="font-3 text-1 text-accent tracking-4 uppercase">Inspector</div>
              <div className="text-3 text-text-muted leading-5">
                Click a device, breaker, or cable to edit its properties, attach an appliance, or
                change conductor size.
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );

  const prose = (
    <>
      <h3 className="lab-section-h3">What this lab integrates</h3>
      <p className="mb-prose-3">
        The practical track of this textbook — Ch.27 through Ch.40 — covers everything from how 60
        Hz power reaches the meter through to grounding, surge protection, and the diagnostics a
        working electrician uses on a service call. The House Wiring Sandbox is the integration
        test: every NEC rule the chapters introduced lives somewhere in the audit engine. Drop a
        non-GFCI receptacle in a bathroom and the sandbox will quote NEC 210.8(A) at you
        <Cite id="nec-2023" in={SOURCES} />; over-load a 20 A branch with a toaster and a microwave
        and it will flag NEC 210.23 and trip the breaker in the live-load simulation. Bond the
        neutral at a subpanel and the sandbox will quote NEC 250.142(B) — the rule that keeps the
        ground bar from carrying neutral return current and turning every metal box in your house
        into a fault-current bus.
      </p>

      <h3 className="lab-section-h3">How an electrician reads a new house</h3>
      <p className="mb-prose-3">
        The thought process is well-rehearsed.{' '}
        <strong className="text-text font-medium">Start at the rooms.</strong> Walk the floorplan
        once and list every place that needs power: kitchen counters, bath vanities, bedroom
        outlets, ceiling lights, smoke detectors, the dishwasher, the range, the dryer, the EV
        charger, the heat pump.{' '}
        <strong className="text-text font-medium">Group them into circuits.</strong> Lighting and
        general receptacles in dwelling rooms ride on 15 or 20 A AFCI-protected branches. The
        kitchen counter requires two dedicated 20 A small-appliance branches by NEC 210.11(C)(1)
        <Cite id="nec-2023" in={SOURCES} />. The bathroom gets its own 20 A GFCI circuit. The
        dishwasher and the disposal each want their own 20 A. The fridge is usually dedicated as
        well so a tripped kitchen breaker doesn't spoil a weekly grocery run. The 240 V loads —
        range, dryer, water heater, heat pump, EV — each get a double-pole breaker sized to their
        nameplate.
      </p>
      <p className="mb-prose-3">
        <strong className="text-text font-medium">Then size the conductors.</strong> NEC 240.4(D) is
        the workhorse table: 14 AWG copper to 15 A, 12 AWG to 20 A, 10 AWG to 30 A, 8 AWG to 40 A, 6
        AWG to 55 A on NM at the 60 °C column. Read it backwards from the breaker rating. Then check
        voltage drop: the informational note to 210.19(A)(1) recommends ≤ 3 % on a branch circuit
        <Cite id="nec-2023" in={SOURCES} />. The standard formula for a single-phase round trip is
      </p>
      <MathBlock>V_drop = 2 · I · ρ · L / A</MathBlock>
      <p className="mb-prose-3">
        with <strong className="text-text font-medium">I</strong> the circuit current in amperes,{' '}
        <strong className="text-text font-medium">L</strong> the one-way length in feet,
        <strong className="text-text font-medium"> ρ ≈ 12.9</strong> ohm-circular-mils-per-foot for
        copper at 75 °C
        <Cite id="codata-2018" in={SOURCES} />, and{' '}
        <strong className="text-text font-medium">A</strong> the conductor area in circular mils.
        For a 12 AWG run carrying 16 A at 120 V over 50 ft, the drop is about 3.2 V or 2.6 % — under
        the limit. Double it for the 100 ft kitchen-island run and it climbs to 5 %, which is when
        most journeymen pull 10 AWG instead.
      </p>
      <Pullout>
        The audit panel is the inspector at your shoulder. Every rule that book learning leaves
        abstract has a line item here.
      </Pullout>

      <h3 className="lab-section-h3">NEC 220.82 — the optional dwelling-unit calculation</h3>
      <p className="mb-prose-3">
        The full standard calculation in 220 Part III is heavy. NEC 220.82 offers a simpler shortcut
        for single-family dwellings: total all small-appliance, laundry, and general lighting at 3
        VA per square foot plus 1500 VA per small-appliance branch and 1500 VA for the laundry
        branch; add nameplate watts for fixed-in-place appliances (water heater, disposal,
        dishwasher, dryer); add the largest of heating or cooling at its nameplate; sum these and
        take the first 10 kVA at 100 % plus the remainder at 40 %. The result is the design demand
        on the service
        <Cite id="nec-2023" in={SOURCES} />. The sandbox runs a simplified version of exactly this
        calculation and shows the result as a percentage of the panel rating.
      </p>

      <h3 className="lab-section-h3">Worked example — 1,800 ft² house with EV and heat pump</h3>
      <p className="mb-prose-3">
        Three bedrooms, two baths, 1,800 ft² conditioned area. General lighting at 3 VA/ft² = 5,400
        VA. Two kitchen small-appliance circuits at 1,500 VA each = 3,000 VA. Laundry at 1,500 VA.
        Dishwasher 1,200 W, disposal 900 W, microwave 1,200 W, water heater 4,500 W, range 8,000 W,
        dryer 5,500 W, heat pump 6,000 W (the larger of heating vs cooling), EV charger 7,680 W
        continuous (32 A at 240 V). Gross VA: about 44,880. NEC 220.82: 10,000 × 1.0 + 34,880 × 0.4
        = 23,952 VA, or ~100 A at 240 V. The reader can build the corresponding house in the sandbox
        and confirm the panel reads "100 A demand" — well under a standard 200 A service even with
        the EV continuously charging.
      </p>

      <h3 className="lab-section-h3">Try it in the sandbox</h3>
      <TryIt
        tag="Try A.2.1"
        question={
          <>
            Load the preset house and toggle the toaster, kettle, and microwave all{' '}
            <strong className="text-text font-medium">on</strong>. Why does Kitchen Counter A trip?
          </>
        }
        hint="Each is 1500 W on 120 V. The breaker is rated 20 A."
        answer={
          <>
            <p className="mb-prose-3">
              The toaster (1,500 W) and microwave (1,200 W) are both wired to Counter A in the
              preset. At 120 V that draws (1500 + 1200)/120 ≈ 22.5 A on a 20 A breaker — the
              live-load simulator flags TRIP.
            </p>
            <p className="mb-prose-3">
              The fix in the preset is exactly why NEC 210.11(C)(1) requires{' '}
              <strong className="text-text font-medium">two</strong> small-appliance circuits in the
              kitchen: spread the toaster and microwave across both 20 A counters and neither trips.
              Move the microwave to Counter B in the inspector and watch the TRIP flag clear.
            </p>
          </>
        }
      />
      <TryIt
        tag="Try A.2.2"
        question={
          <>
            Place a standard (non-GFCI) receptacle in the garage. Which NEC article does the audit
            cite, and how do you clear it?
          </>
        }
        hint="GFCI by location."
        answer={
          <>
            <p className="mb-prose-3">
              The audit cites <strong className="text-text font-medium">NEC 210.8(A)(2)</strong>:
              125 V, 15/20 A receptacles in garages must be GFCI protected. Two ways to clear it:
              change the device kind to <em className="text-text italic">GFCI receptacle</em>, or
              change its feeding breaker to a GFCI or DFCI type. Either path satisfies the rule.
            </p>
          </>
        }
      />
      <TryIt
        tag="Try A.2.3"
        question={
          <>
            The preset feeds the EV charger with 6 AWG copper on a 50 A breaker. Compute voltage
            drop at 32 A continuous over 40 ft, one-way.
          </>
        }
        hint="V_drop = 2·I·ρ·L/A, ρ ≈ 12.9 Ω·cmil/ft, 6 AWG ≈ 26,240 cmil."
        answer={
          <>
            <p className="mb-prose-3">
              Substitute: 2 × 32 × 12.9 × 40 / 26,240 ≈{' '}
              <strong className="text-text font-medium">1.26 V</strong>, or about 0.5 % of 240 V —
              well under the 3 % branch-circuit recommendation. The sandbox shows the live result on
              the EV circuit row.
            </p>
          </>
        }
      />
      <TryIt
        tag="Try A.2.4"
        question={
          <>
            Change the dryer breaker from 30 A double-pole to 50 A double-pole without changing the
            cable. What violates, and why?
          </>
        }
        hint="NEC 240.4 is a conductor-protection rule."
        answer={
          <>
            <p className="mb-prose-3">
              The 10 AWG NM cable is rated 30 A at the 60 °C column required for NM. A 50 A breaker
              no longer protects it from overload — the conductor will overheat before the breaker
              trips. The audit cites <strong className="text-text font-medium">NEC 240.4(D)</strong>
              .
            </p>
            <p className="mb-prose-3">
              Fix it either by reverting the breaker or upsizing the cable to 6 AWG.
            </p>
          </>
        }
      />
      <TryIt
        tag="Try A.2.5"
        question={
          <>Toggle the main bonding jumper off. Why is the resulting violation so dangerous?</>
        }
        hint="Think about the path fault current takes back to the source."
        answer={
          <>
            <p className="mb-prose-3">
              Without the main bonding jumper, the equipment-grounding system has no low-impedance
              path back to the utility neutral. A hot-to-chassis fault at any appliance will charge
              the chassis to line voltage, and the breaker will not see enough current to trip —
              every metal surface in the building becomes a shock hazard. NEC 250.24(B) makes the
              MBJ mandatory at exactly one place: the service equipment.
            </p>
          </>
        }
      />
      <TryIt
        tag="Try A.2.6"
        question={
          <>
            The preset omits a smoke detector in Bedroom 2. Add one. Why does the wiring matter
            (i.e., why not just install a 9 V battery alarm)?
          </>
        }
        hint="Code references NFPA 72."
        answer={
          <>
            <p className="mb-prose-3">
              Modern code requires <em className="text-text italic">interconnected</em> smoke alarms
              on a normally-energised circuit so that one detector trips all of them simultaneously,
              with a battery backup. Battery-only alarms drift out of service silently when
              batteries fail. In the sandbox, drop a smoke device in Bedroom 2 and assign it to the
              bedroom branch; the warning clears.
            </p>
          </>
        }
      />

      <h3 className="lab-section-h3">Where to go next</h3>
      <p className="mb-prose-3">
        The sandbox is intentionally not a replacement for an electrician's CAD tool — it leaves out
        box-fill cubic-inch math, the full standard load calculation, neutral-current sizing on
        multi-wire branches, the &gt;100 ft service drop drop calculation, and a hundred other
        corners of NEC. What it captures is the <em className="text-text italic">shape</em> of how
        the code interacts with a real install: rooms determine GFCI/AFCI; appliances set demand;
        conductors set ampacity; the panel sets the upper bound. Build a house. Break it. Read what
        the audit says
        <Cite id="nec-2023" in={SOURCES} />.
      </p>
    </>
  );

  return (
    <LabShell
      slug={SLUG}
      labSubtitle="Floorplan editor + live NEC audit"
      labId="house-wiring / NEC 210 · 220 · 240 · 250 · 300 · 404 · 406"
      labContent={labContent}
      prose={prose}
    />
  );
}

/* ───────────────────────── Inspectors ───────────────────────── */

interface DeviceInspectorProps {
  doc: HouseDoc;
  device: Device;
  onUpdate: (d: Device) => void;
  onDelete: () => void;
  onSetAppliance: (deviceId: string, kind: ApplianceKind | '') => void;
  onToggleAppliance: (id: string) => void;
  onUpdateAppliance: (id: string, patch: Partial<Appliance>) => void;
}

function DeviceInspector({
  doc,
  device,
  onUpdate,
  onDelete,
  onSetAppliance,
  onToggleAppliance,
  onUpdateAppliance,
}: DeviceInspectorProps) {
  const room = doc.rooms.find((r) => r.id === device.roomId);
  const breakers = doc.breakers;
  const appliance = device.applianceId
    ? doc.appliances.find((a) => a.id === device.applianceId)
    : null;

  return (
    <div className="flex flex-col gap-[10px]">
      <div className="font-3 text-1 text-accent tracking-4 uppercase">Inspector — Device</div>
      <div className="font-2 text-text text-[17px] italic">{deviceLabel(device.kind)}</div>
      <div className="text-2 text-text-muted leading-[1.4]">
        In {room?.name ?? '(no room)'} at ({device.x}, {device.y})
      </div>

      <div className="flex flex-col gap-[5px]">
        <label className="font-3 text-1 text-text-dim flex justify-between tracking-[0.15em] uppercase">
          Type
        </label>
        <select
          className="bg-bg-elevated border-border text-text font-3 text-3 rounded-1 focus:border-accent box-border w-full border px-[7px] py-[5px] focus:outline-none"
          value={device.kind}
          onChange={(e) => onUpdate({ ...device, kind: e.target.value as DeviceKind })}
        >
          {DEVICE_KINDS.map((k) => (
            <option key={k} value={k}>
              {deviceLabel(k)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-[5px]">
        <label className="font-3 text-1 text-text-dim flex justify-between tracking-[0.15em] uppercase">
          Breaker
        </label>
        <select
          className="bg-bg-elevated border-border text-text font-3 text-3 rounded-1 focus:border-accent box-border w-full border px-[7px] py-[5px] focus:outline-none"
          value={device.breakerId ?? ''}
          onChange={(e) => onUpdate({ ...device, breakerId: e.target.value || null })}
        >
          <option value="">— none —</option>
          {breakers.map((b) => (
            <option key={b.id} value={b.id}>
              {b.label ?? breakerKindLabel(b.kind)} ({BREAKER_AMPS[b.kind]} A)
            </option>
          ))}
        </select>
      </div>

      {(device.kind === 'receptacle' ||
        device.kind === 'receptacle-gfci' ||
        device.kind === 'receptacle-tr' ||
        device.kind === 'receptacle-wr' ||
        device.kind === 'receptacle-240') && (
        <div className="flex flex-col gap-[5px]">
          <label className="font-3 text-1 text-text-dim flex justify-between tracking-[0.15em] uppercase">
            Appliance
          </label>
          <select
            className="bg-bg-elevated border-border text-text font-3 text-3 rounded-1 focus:border-accent box-border w-full border px-[7px] py-[5px] focus:outline-none"
            value={appliance?.kind ?? ''}
            onChange={(e) => onSetAppliance(device.id, e.target.value as ApplianceKind | '')}
          >
            <option value="">— empty —</option>
            {APPLIANCE_KINDS.map((k) => (
              <option key={k} value={k}>
                {applianceLabel(k)}
              </option>
            ))}
          </select>
        </div>
      )}

      {appliance && (
        <div className="bg-bg-elevated border-border rounded-2 gap-sm flex flex-col border p-[10px]">
          <div className="flex flex-col gap-[5px]">
            <label className="font-3 text-1 text-text-dim flex justify-between tracking-[0.15em] uppercase">
              Nameplate <span className="text-text-muted">W</span>
            </label>
            <input
              type="number"
              className="bg-bg-elevated border-border text-text font-3 text-3 rounded-1 focus:border-accent box-border w-full border px-[7px] py-[5px] focus:outline-none"
              value={appliance.watts}
              min={0}
              step={50}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                if (isFinite(v)) onUpdateAppliance(appliance.id, { watts: v });
              }}
            />
          </div>
          <div className="flex gap-[6px]">
            <button
              type="button"
              className={
                'bg-bg-elevated font-3 text-2 px-sm rounded-2 flex-1 cursor-pointer border py-[6px] ' +
                (appliance.continuous ? 'text-teal border-teal' : 'text-text-muted border-border')
              }
              onClick={() => onUpdateAppliance(appliance.id, { continuous: !appliance.continuous })}
            >
              {appliance.continuous ? 'Continuous (×1.25)' : 'Non-continuous'}
            </button>
          </div>
          <div className="flex gap-[6px]">
            <button
              type="button"
              className={
                'bg-bg-elevated font-3 text-2 px-sm rounded-2 flex-1 cursor-pointer border py-[6px] ' +
                (appliance.on ? 'text-teal border-teal' : 'text-text-muted border-border')
              }
              onClick={() => onToggleAppliance(appliance.id)}
            >
              {appliance.on ? 'Currently ON' : 'Currently off'}
            </button>
          </div>
        </div>
      )}

      <div className="gap-sm mt-xs flex">
        <button
          type="button"
          className="bg-bg-card text-text-dim border-border font-3 text-1 py-xs rounded-2 hover:text-pink hover:border-pink hover:bg-bg-card-hover cursor-pointer border px-[9px] transition-all"
          onClick={onDelete}
        >
          Delete device
        </button>
      </div>
    </div>
  );
}

interface BreakerInspectorProps {
  breaker: { id: string; kind: BreakerKind; slot: number; label?: string };
  onUpdate: (id: string, kind: BreakerKind) => void;
  onDelete: () => void;
}
function BreakerInspector({ breaker, onUpdate, onDelete }: BreakerInspectorProps) {
  return (
    <div className="flex flex-col gap-[10px]">
      <div className="font-3 text-1 text-accent tracking-4 uppercase">Inspector — Breaker</div>
      <div className="font-2 text-text text-[17px] italic">Slot {breaker.slot + 1}</div>
      <div className="text-2 text-text-muted leading-[1.4]">{breaker.label ?? '(no label)'}</div>
      <div className="flex flex-col gap-[5px]">
        <label className="font-3 text-1 text-text-dim flex justify-between tracking-[0.15em] uppercase">
          Kind
        </label>
        <select
          className="bg-bg-elevated border-border text-text font-3 text-3 rounded-1 focus:border-accent box-border w-full border px-[7px] py-[5px] focus:outline-none"
          value={breaker.kind}
          onChange={(e) => onUpdate(breaker.id, e.target.value as BreakerKind)}
        >
          {BREAKER_KINDS.map((k) => (
            <option key={k} value={k}>
              {breakerKindLabel(k)}
            </option>
          ))}
        </select>
      </div>
      <div className="gap-sm mt-xs flex">
        <button
          type="button"
          className="bg-bg-card text-text-dim border-border font-3 text-1 py-xs rounded-2 hover:text-pink hover:border-pink hover:bg-bg-card-hover cursor-pointer border px-[9px] transition-all"
          onClick={onDelete}
        >
          Delete breaker
        </button>
      </div>
    </div>
  );
}

interface CableInspectorProps {
  cable: { id: string; kind: CableKind; lengthFt: number; studs: number };
  onUpdate: (
    id: string,
    patch: Partial<{ kind: CableKind; lengthFt: number; studs: number }>,
  ) => void;
  onDelete: () => void;
}
function CableInspector({ cable, onUpdate, onDelete }: CableInspectorProps) {
  return (
    <div className="flex flex-col gap-[10px]">
      <div className="font-3 text-1 text-accent tracking-4 uppercase">Inspector — Cable</div>
      <div className="font-2 text-text text-[17px] italic">NM-B {cableLabel(cable.kind)}</div>
      <div className="flex flex-col gap-[5px]">
        <label className="font-3 text-1 text-text-dim flex justify-between tracking-[0.15em] uppercase">
          Cable type
        </label>
        <select
          className="bg-bg-elevated border-border text-text font-3 text-3 rounded-1 focus:border-accent box-border w-full border px-[7px] py-[5px] focus:outline-none"
          value={cable.kind}
          onChange={(e) => onUpdate(cable.id, { kind: e.target.value as CableKind })}
        >
          {CABLE_KINDS.map((k) => (
            <option key={k} value={k}>
              NM-B {cableLabel(k)}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-[5px]">
        <label className="font-3 text-1 text-text-dim flex justify-between tracking-[0.15em] uppercase">
          Length <span className="text-text-muted">ft</span>
        </label>
        <input
          type="number"
          className="bg-bg-elevated border-border text-text font-3 text-3 rounded-1 focus:border-accent box-border w-full border px-[7px] py-[5px] focus:outline-none"
          value={cable.lengthFt}
          min={1}
          step={1}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            if (isFinite(v)) onUpdate(cable.id, { lengthFt: v });
          }}
        />
      </div>
      <div className="flex flex-col gap-[5px]">
        <label className="font-3 text-1 text-text-dim flex justify-between tracking-[0.15em] uppercase">
          Studs / joists pierced
        </label>
        <input
          type="number"
          className="bg-bg-elevated border-border text-text font-3 text-3 rounded-1 focus:border-accent box-border w-full border px-[7px] py-[5px] focus:outline-none"
          value={cable.studs}
          min={0}
          step={1}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            if (isFinite(v)) onUpdate(cable.id, { studs: Math.max(0, Math.floor(v)) });
          }}
        />
      </div>
      <div className="gap-sm mt-xs flex">
        <button
          type="button"
          className="bg-bg-card text-text-dim border-border font-3 text-1 py-xs rounded-2 hover:text-pink hover:border-pink hover:bg-bg-card-hover cursor-pointer border px-[9px] transition-all"
          onClick={onDelete}
        >
          Delete cable
        </button>
      </div>
    </div>
  );
}

/* ───────────── Small components ───────────── */

interface RowProps {
  label: string;
  value: string;
  color?: string;
}
function Row({ label, value, color }: RowProps) {
  return (
    <div className="gap-md py-xs border-border text-3 flex justify-between border-b border-dashed last:border-b-0">
      <span className="text-text-dim font-1">{label}</span>
      <span className="text-text font-3" style={color ? { color } : undefined}>
        {value}
      </span>
    </div>
  );
}
