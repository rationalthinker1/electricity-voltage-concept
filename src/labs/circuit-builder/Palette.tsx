/**
 * Sidebar palette: a grid of component kinds. Click a kind to "arm" it —
 * the next click on the canvas places one. Click again on the same kind
 * to disarm.
 */

import type { ComponentKind } from './types';
import { kindDisplayName } from './components';

const KINDS: ComponentKind[] = [
  'battery', 'ac', 'resistor', 'capacitor', 'inductor',
  'diode', 'bulb', 'switch', 'ground',
];

interface PaletteProps {
  armed: ComponentKind | 'wire' | 'voltmeter' | 'ammeter' | null;
  onArm: (k: ComponentKind | 'wire' | 'voltmeter' | 'ammeter' | null) => void;
}

export function Palette({ armed, onArm }: PaletteProps) {
  return (
    <div className="cb-palette">
      <div className="cb-palette-section">
        <div className="cb-palette-title">Components</div>
        <div className="cb-palette-grid">
          {KINDS.map(k => (
            <button
              key={k}
              type="button"
              className={'cb-palette-btn' + (armed === k ? ' active' : '')}
              onClick={() => onArm(armed === k ? null : k)}
              title={kindDisplayName(k)}
            >
              <CompIcon kind={k} />
              <span className="cb-palette-label">{kindDisplayName(k)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="cb-palette-section">
        <div className="cb-palette-title">Tools</div>
        <div className="cb-palette-grid">
          <button
            type="button"
            className={'cb-palette-btn' + (armed === 'wire' ? ' active' : '')}
            onClick={() => onArm(armed === 'wire' ? null : 'wire')}
            title="Click two pins to draw a wire"
          >
            <ToolIcon kind="wire" />
            <span className="cb-palette-label">Wire</span>
          </button>
          <button
            type="button"
            className={'cb-palette-btn' + (armed === 'voltmeter' ? ' active' : '')}
            onClick={() => onArm(armed === 'voltmeter' ? null : 'voltmeter')}
            title="Click a node to place a voltmeter probe"
          >
            <ToolIcon kind="voltmeter" />
            <span className="cb-palette-label">Voltmeter</span>
          </button>
          <button
            type="button"
            className={'cb-palette-btn' + (armed === 'ammeter' ? ' active' : '')}
            onClick={() => onArm(armed === 'ammeter' ? null : 'ammeter')}
            title="Click a component to attach an ammeter"
          >
            <ToolIcon kind="ammeter" />
            <span className="cb-palette-label">Ammeter</span>
          </button>
        </div>
      </div>

      <div className="cb-palette-hint">
        {armed
          ? armed === 'wire'
            ? 'Click pin A, then pin B.'
            : armed === 'voltmeter'
              ? 'Click any node.'
              : armed === 'ammeter'
                ? 'Click a component to probe its current.'
                : `Placing: ${kindDisplayName(armed as ComponentKind)}. Click canvas.`
          : 'Pick a tool above.'}
      </div>
    </div>
  );
}

/* Inline SVG icons matched to the canvas drawings. */

function CompIcon({ kind }: { kind: ComponentKind }) {
  const stroke = '#a09e95';
  const w = 36, h = 18;
  const props = {
    width: w, height: h, viewBox: `0 0 ${w} ${h}`,
    fill: 'none', stroke, strokeWidth: 1.4, strokeLinecap: 'round' as const,
  };
  switch (kind) {
    case 'resistor':
      return (
        <svg {...props}>
          <path d="M2 9 L8 9 L10 4 L13 14 L16 4 L19 14 L22 4 L25 14 L28 9 L34 9" />
        </svg>
      );
    case 'battery':
      return (
        <svg {...props}>
          <path d="M2 9 L14 9 M14 4 L14 14 M18 2 L18 16 M18 9 L34 9" stroke="#ff3b6e" />
          <path d="M2 9 L14 9 M14 4 L14 14" />
        </svg>
      );
    case 'ac':
      return (
        <svg {...props}>
          <path d="M2 9 L11 9 M25 9 L34 9" />
          <circle cx="18" cy="9" r="6" />
          <path d="M13 9 Q15 4 18 9 T23 9" stroke="#6cc5c2" />
        </svg>
      );
    case 'capacitor':
      return (
        <svg {...props}>
          <path d="M2 9 L15 9 M21 9 L34 9" />
          <path d="M15 3 L15 15 M21 3 L21 15" />
        </svg>
      );
    case 'inductor':
      return (
        <svg {...props}>
          <path d="M2 9 L8 9 M28 9 L34 9" />
          <path d="M8 9 Q10 3 13 9 Q15 3 18 9 Q20 3 23 9 Q25 3 28 9" />
        </svg>
      );
    case 'diode':
      return (
        <svg {...props}>
          <path d="M2 9 L12 9 M24 9 L34 9" />
          <path d="M12 3 L24 9 L12 15 Z" fill="#16161a" />
          <path d="M24 3 L24 15" />
        </svg>
      );
    case 'bulb':
      return (
        <svg {...props}>
          <path d="M2 9 L10 9 M26 9 L34 9" />
          <circle cx="18" cy="9" r="6" fill="#16161a" />
          <path d="M14 5 L22 13 M22 5 L14 13" />
        </svg>
      );
    case 'switch':
      return (
        <svg {...props}>
          <path d="M2 9 L11 9 M25 9 L34 9" />
          <circle cx="11" cy="9" r="1.5" fill="#16161a" />
          <circle cx="25" cy="9" r="1.5" fill="#16161a" />
          <path d="M11 9 L24 3" />
        </svg>
      );
    case 'ground':
      return (
        <svg {...props}>
          <path d="M18 2 L18 8 M10 8 L26 8 M13 11 L23 11 M16 14 L20 14" />
        </svg>
      );
  }
}

function ToolIcon({ kind }: { kind: 'wire' | 'voltmeter' | 'ammeter' }) {
  const w = 36, h = 18;
  if (kind === 'wire') {
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" stroke="#a09e95" strokeWidth={1.4}>
        <path d="M2 14 L14 14 L14 4 L34 4" />
        <circle cx="2" cy="14" r="1.5" fill="#a09e95" />
        <circle cx="34" cy="4" r="1.5" fill="#a09e95" />
      </svg>
    );
  }
  if (kind === 'voltmeter') {
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" stroke="#6cc5c2" strokeWidth={1.4}>
        <circle cx="18" cy="9" r="7" />
        <text x="18" y="12" textAnchor="middle" fontSize="9" fontFamily="JetBrains Mono" fill="#6cc5c2" stroke="none">V</text>
      </svg>
    );
  }
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" stroke="#ff6b2a" strokeWidth={1.4}>
      <circle cx="18" cy="9" r="7" />
      <text x="18" y="12" textAnchor="middle" fontSize="9" fontFamily="JetBrains Mono" fill="#ff6b2a" stroke="none">A</text>
    </svg>
  );
}
