/**
 * Sidebar palette: a grid of component kinds. Click a kind to "arm" it —
 * the next click on the canvas places one. Click again on the same kind
 * to disarm.
 */

import { useState } from 'react';
import clsx from 'clsx';
import { kindDisplayName, kindTooltip, type TooltipInfo } from './components';
import type { ComponentKind } from './types';

const KINDS: ComponentKind[] = [
  'battery', 'ac', 'resistor', 'capacitor', 'inductor',
  'diode', 'bulb', 'switch', 'ground',
];

interface PaletteProps {
  armed: ComponentKind | 'wire' | 'voltmeter' | 'ammeter' | null;
  onArm: (k: ComponentKind | 'wire' | 'voltmeter' | 'ammeter' | null) => void;
}

export function Palette({ armed, onArm }: PaletteProps) {
  const [hoverTip, setHoverTip] = useState<TooltipInfo | null>(null);

  function handleEnter(k: ComponentKind | 'wire' | 'voltmeter' | 'ammeter' | 'cursor') {
    setHoverTip(kindTooltip(k === 'cursor' ? 'cursor' : k as ComponentKind | 'wire' | 'voltmeter' | 'ammeter'));
  }
  function handleLeave() {
    setHoverTip(null);
  }

  const tip = hoverTip ?? (armed ? kindTooltip(armed === 'wire' || armed === 'voltmeter' || armed === 'ammeter' ? armed : armed as ComponentKind) : kindTooltip('cursor'));

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex flex-col gap-sm">
        <div className="font-3 text-1 text-accent uppercase tracking-[.2em]">Components</div>
        <div className="grid grid-cols-1 gap-[6px]">
          {KINDS.map(k => (
            <button
              key={k}
              type="button"
              className={clsx(
                'flex items-center gap-[10px] bg-bg-elevated border font-1 text-2 py-sm px-[10px] rounded-2 cursor-pointer text-left transition-all duration-fast',
                armed === k
                  ? 'bg-accent-soft border-accent text-text'
                  : 'border-border text-text-dim hover:bg-bg-card-hover hover:text-text hover:border-text-dim',
              )}
              onClick={() => onArm(armed === k ? null : k)}
              onMouseEnter={() => handleEnter(k)}
              onMouseLeave={handleLeave}
            >
              <CompIcon kind={k} />
              <span className="flex-1">{kindDisplayName(k)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-sm">
        <div className="font-3 text-1 text-accent uppercase tracking-[.2em]">Tools</div>
        <div className="grid grid-cols-1 gap-[6px]">
          <button
            type="button"
            className={clsx(
              'flex items-center gap-[10px] bg-bg-elevated border font-1 text-2 py-sm px-[10px] rounded-2 cursor-pointer text-left transition-all duration-fast',
              armed === null
                ? 'bg-accent-soft border-accent text-text'
                : 'border-border text-text-dim hover:bg-bg-card-hover hover:text-text hover:border-text-dim',
            )}
            onClick={() => onArm(null)}
            onMouseEnter={() => handleEnter('cursor')}
            onMouseLeave={handleLeave}
          >
            <ToolIcon kind="cursor" />
            <span className="flex-1">Select</span>
          </button>
          <button
            type="button"
            className={clsx(
              'flex items-center gap-[10px] bg-bg-elevated border font-1 text-2 py-sm px-[10px] rounded-2 cursor-pointer text-left transition-all duration-fast',
              armed === 'wire'
                ? 'bg-accent-soft border-accent text-text'
                : 'border-border text-text-dim hover:bg-bg-card-hover hover:text-text hover:border-text-dim',
            )}
            onClick={() => onArm(armed === 'wire' ? null : 'wire')}
            onMouseEnter={() => handleEnter('wire')}
            onMouseLeave={handleLeave}
          >
            <ToolIcon kind="wire" />
            <span className="flex-1">Wire</span>
          </button>
          <button
            type="button"
            className={clsx(
              'flex items-center gap-[10px] bg-bg-elevated border font-1 text-2 py-sm px-[10px] rounded-2 cursor-pointer text-left transition-all duration-fast',
              armed === 'voltmeter'
                ? 'bg-accent-soft border-accent text-text'
                : 'border-border text-text-dim hover:bg-bg-card-hover hover:text-text hover:border-text-dim',
            )}
            onClick={() => onArm(armed === 'voltmeter' ? null : 'voltmeter')}
            onMouseEnter={() => handleEnter('voltmeter')}
            onMouseLeave={handleLeave}
          >
            <ToolIcon kind="voltmeter" />
            <span className="flex-1">Voltmeter</span>
          </button>
          <button
            type="button"
            className={clsx(
              'flex items-center gap-[10px] bg-bg-elevated border font-1 text-2 py-sm px-[10px] rounded-2 cursor-pointer text-left transition-all duration-fast',
              armed === 'ammeter'
                ? 'bg-accent-soft border-accent text-text'
                : 'border-border text-text-dim hover:bg-bg-card-hover hover:text-text hover:border-text-dim',
            )}
            onClick={() => onArm(armed === 'ammeter' ? null : 'ammeter')}
            onMouseEnter={() => handleEnter('ammeter')}
            onMouseLeave={handleLeave}
          >
            <ToolIcon kind="ammeter" />
            <span className="flex-1">Ammeter</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-[6px] pt-[10px] border-t border-border min-h-[110px]">
        <div className="font-3 text-[11px] text-accent font-medium">{tip.title}</div>
        <div className="text-[11px] text-text-dim leading-[1.45]">{tip.description}</div>
        {tip.formula !== '—' && (
          <div className="font-4 italic text-3 text-text leading-1 py-xs px-sm bg-bg-elevated rounded-2 border border-border">{tip.formula}</div>
        )}
        <div className="text-1 text-text-muted leading-[1.45] italic">{tip.behavior}</div>
      </div>
    </div>
  );
}

/* Inline SVG icons matched to the canvas drawings. */

function CompIcon({ kind }: { kind: ComponentKind }) {
  const stroke = 'var(--color-text-dim)';
  const surface = 'var(--color-surface)';
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
          <path d="M2 9 L14 9 M14 4 L14 14 M18 2 L18 16 M18 9 L34 9" stroke="var(--color-pink)" />
          <path d="M2 9 L14 9 M14 4 L14 14" />
        </svg>
      );
    case 'ac':
      return (
        <svg {...props}>
          <path d="M2 9 L11 9 M25 9 L34 9" />
          <circle cx="18" cy="9" r="6" />
          <path d="M13 9 Q15 4 18 9 T23 9" stroke="var(--color-teal)" />
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
          <path d="M12 3 L24 9 L12 15 Z" fill={surface} />
          <path d="M24 3 L24 15" />
        </svg>
      );
    case 'bulb':
      return (
        <svg {...props}>
          <path d="M2 9 L10 9 M26 9 L34 9" />
          <circle cx="18" cy="9" r="6" fill={surface} />
          <path d="M14 5 L22 13 M22 5 L14 13" />
        </svg>
      );
    case 'switch':
      return (
        <svg {...props}>
          <path d="M2 9 L11 9 M25 9 L34 9" />
          <circle cx="11" cy="9" r="1.5" fill={surface} />
          <circle cx="25" cy="9" r="1.5" fill={surface} />
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

function ToolIcon({ kind }: { kind: 'wire' | 'voltmeter' | 'ammeter' | 'cursor' }) {
  const w = 36, h = 18;
  const surface = 'var(--color-surface)';
  if (kind === 'cursor') {
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" stroke="var(--color-text-dim)" strokeWidth={1.4} strokeLinejoin="round">
        <path d="M14 3 L14 15 L17 12 L20 17 L22 16 L19 11 L23 11 Z" fill={surface} />
      </svg>
    );
  }
  if (kind === 'wire') {
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" stroke="var(--color-text-dim)" strokeWidth={1.4}>
        <path d="M2 14 L14 14 L14 4 L34 4" />
        <circle cx="2" cy="14" r="1.5" fill="var(--color-text-dim)" />
        <circle cx="34" cy="4" r="1.5" fill="var(--color-text-dim)" />
      </svg>
    );
  }
  if (kind === 'voltmeter') {
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" stroke="var(--color-teal)" strokeWidth={1.4}>
        <circle cx="18" cy="9" r="7" />
        <text x="18" y="12" textAnchor="middle" fontSize="9" fontFamily="JetBrains Mono" fill="var(--color-teal)" stroke="none">V</text>
      </svg>
    );
  }
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" stroke="var(--color-accent)" strokeWidth={1.4}>
      <circle cx="18" cy="9" r="7" />
      <text x="18" y="12" textAnchor="middle" fontSize="9" fontFamily="JetBrains Mono" fill="var(--color-accent)" stroke="none">A</text>
    </svg>
  );
}
