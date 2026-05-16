/**
 * Sidebar palette for the Power Grid Simulator. Three sections:
 *   - Topology: bus (per kV class), line, transformer.
 *   - Generation: coal / CCGT / hydro / wind / solar / battery.
 *   - Loads: residential / industrial / motor / EV.
 *
 * Click a tile to arm it; the next click on the canvas places it. Click
 * again on the same tile to disarm.
 */

import type { ArmedTool, GeneratorKind, LoadKind, VoltageLevel } from './types';

interface Props {
  armed: ArmedTool;
  onArm: (t: ArmedTool) => void;
}

const KV_LEVELS: VoltageLevel[] = [230, 138, 69, 25, 12.47];
const GEN_KINDS: { kind: GeneratorKind; label: string }[] = [
  { kind: 'coal', label: 'Coal' },
  { kind: 'ccgt', label: 'CCGT (gas)' },
  { kind: 'hydro', label: 'Hydro' },
  { kind: 'wind', label: 'Wind' },
  { kind: 'solar', label: 'Solar PV' },
  { kind: 'battery', label: 'Battery' },
];
const LOAD_KINDS: { kind: LoadKind; label: string }[] = [
  { kind: 'residential', label: 'Residential' },
  { kind: 'industrial', label: 'Industrial' },
  { kind: 'motor', label: 'Motor cluster' },
  { kind: 'ev', label: 'EV charging' },
];

export function Palette({ armed, onArm }: Props) {
  function isArmed(t: ArmedTool): boolean {
    if (armed.kind !== t.kind) return false;
    if (t.kind === 'bus' && armed.kind === 'bus') return armed.kv === t.kv;
    if (t.kind === 'generator' && armed.kind === 'generator') return armed.genKind === t.genKind;
    if (t.kind === 'load' && armed.kind === 'load') return armed.loadKind === t.loadKind;
    return true;
  }
  function toggle(t: ArmedTool) {
    if (isArmed(t)) onArm({ kind: 'select' });
    else onArm(t);
  }

  return (
    <div className="pg-palette">
      <div className="pg-palette-section">
        <div className="pg-palette-title">Tools</div>
        <button
          type="button"
          className={'pg-palette-btn' + (armed.kind === 'select' ? ' active' : '')}
          onClick={() => onArm({ kind: 'select' })}
        >
          <Glyph kind="select" />
          <span className="pg-palette-label">Select / drag</span>
        </button>
        <button
          type="button"
          className={'pg-palette-btn' + (armed.kind === 'line' ? ' active' : '')}
          onClick={() => toggle({ kind: 'line' })}
        >
          <Glyph kind="line" />
          <span className="pg-palette-label">Transmission line</span>
        </button>
        <button
          type="button"
          className={'pg-palette-btn' + (armed.kind === 'transformer' ? ' active' : '')}
          onClick={() => toggle({ kind: 'transformer' })}
        >
          <Glyph kind="transformer" />
          <span className="pg-palette-label">Transformer</span>
        </button>
      </div>

      <div className="pg-palette-section">
        <div className="pg-palette-title">Buses (kV class)</div>
        <div className="pg-palette-row">
          {KV_LEVELS.map((kv) => (
            <button
              key={kv}
              type="button"
              className={'pg-palette-pill' + (isArmed({ kind: 'bus', kv }) ? ' active' : '')}
              onClick={() => toggle({ kind: 'bus', kv })}
            >
              {kv} kV
            </button>
          ))}
        </div>
      </div>

      <div className="pg-palette-section">
        <div className="pg-palette-title">Generation</div>
        {GEN_KINDS.map(({ kind, label }) => (
          <button
            key={kind}
            type="button"
            className={
              'pg-palette-btn' + (isArmed({ kind: 'generator', genKind: kind }) ? ' active' : '')
            }
            onClick={() => toggle({ kind: 'generator', genKind: kind })}
          >
            <GenGlyph kind={kind} />
            <span className="pg-palette-label">{label}</span>
          </button>
        ))}
      </div>

      <div className="pg-palette-section">
        <div className="pg-palette-title">Loads</div>
        {LOAD_KINDS.map(({ kind, label }) => (
          <button
            key={kind}
            type="button"
            className={
              'pg-palette-btn' + (isArmed({ kind: 'load', loadKind: kind }) ? ' active' : '')
            }
            onClick={() => toggle({ kind: 'load', loadKind: kind })}
          >
            <LoadGlyph />
            <span className="pg-palette-label">{label}</span>
          </button>
        ))}
      </div>

      <div className="pg-palette-hint">{hintText(armed)}</div>
    </div>
  );
}

function hintText(armed: ArmedTool): string {
  switch (armed.kind) {
    case 'select':
      return 'Click any element to inspect. Drag a bus to move it. Right-click a generator to trip it.';
    case 'bus':
      return `Click an empty grid spot to drop a ${armed.kv} kV bus.`;
    case 'line':
      return 'Click bus A, then bus B. Buses must be at the same kV class.';
    case 'transformer':
      return 'Click two buses at different kV classes to connect them.';
    case 'generator':
      return 'Click a bus to attach a generator to it.';
    case 'load':
      return 'Click a bus to attach a load to it.';
  }
}

/* ─────────────────────────── Glyphs ─────────────────────────── */

function Glyph({ kind }: { kind: 'select' | 'line' | 'transformer' }) {
  const w = 36,
    h = 18;
  if (kind === 'select') {
    return (
      <svg
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        fill="none"
        stroke="var(--color-text-dim)"
        strokeWidth={1.4}
        strokeLinejoin="round"
      >
        <path d="M14 3 L14 15 L17 12 L20 17 L22 16 L19 11 L23 11 Z" fill="var(--color-bg)" />
      </svg>
    );
  }
  if (kind === 'line') {
    return (
      <svg
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        fill="none"
        stroke="var(--color-text-dim)"
        strokeWidth={1.4}
      >
        <path d="M3 9 L33 9" />
        <circle cx="3" cy="9" r="2" fill="var(--color-text-dim)" />
        <circle cx="33" cy="9" r="2" fill="var(--color-text-dim)" />
      </svg>
    );
  }
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      fill="none"
      stroke="var(--color-text-dim)"
      strokeWidth={1.4}
    >
      <path d="M2 9 L13 9 M23 9 L34 9" />
      <circle cx="15" cy="9" r="4" fill="var(--color-bg)" />
      <circle cx="21" cy="9" r="4" fill="var(--color-bg)" />
    </svg>
  );
}

function GenGlyph({ kind }: { kind: GeneratorKind }) {
  const colorByKind: Record<GeneratorKind, string> = {
    coal: 'var(--color-text-dim)',
    ccgt: 'var(--color-accent)',
    hydro: 'var(--color-blue)',
    wind: 'var(--color-teal)',
    solar: 'var(--color-accent)',
    battery: 'var(--color-pink)',
  };
  const labelByKind: Record<GeneratorKind, string> = {
    coal: 'C',
    ccgt: 'G',
    hydro: 'H',
    wind: 'W',
    solar: 'S',
    battery: 'B',
  };
  const w = 36,
    h = 18;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <circle
        cx="18"
        cy="9"
        r="7"
        stroke={colorByKind[kind]}
        strokeWidth={1.4}
        fill="var(--color-bg)"
      />
      <text
        x="18"
        y="12"
        textAnchor="middle"
        fontSize="9"
        fontFamily="JetBrains Mono"
        fontWeight="bold"
        fill={colorByKind[kind]}
      >
        {labelByKind[kind]}
      </text>
    </svg>
  );
}

function LoadGlyph() {
  const w = 36,
    h = 18;
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      fill="none"
      stroke="var(--color-text-dim)"
      strokeWidth={1.4}
    >
      <path d="M11 4 L25 4 L18 15 Z" fill="var(--color-bg)" />
    </svg>
  );
}
