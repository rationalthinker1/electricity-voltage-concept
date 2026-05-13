/**
 * Demo D4.2 — Color-code decoder (IEC 60062)
 *
 * Four-band and five-band resistor colour-code decoder. Reader clicks colored
 * squares to set each band; live readout shows the nominal value (Ω/kΩ/MΩ)
 * and tolerance %. A toggle flips between 4-band and 5-band modes.
 */
import { useState } from 'react';

import {
  Demo, DemoControls, MiniReadout,
} from '@/components/Demo';

interface Props { figure?: string }

interface Colour {
  key: string;
  label: string;
  /** Display swatch */
  swatch: string;
  /** Digit value (null = not a digit colour) */
  digit: number | null;
  /** Multiplier exponent for the multiplier-band position */
  mult: number | null;
  /** Tolerance ± fraction for the tolerance-band position */
  tol: number | null;
}

const COLOURS: Colour[] = [
  { key: 'black',  label: 'Black',  swatch: '#1a1a1a', digit: 0, mult: 0,  tol: null   },
  { key: 'brown',  label: 'Brown',  swatch: '#7a4a14', digit: 1, mult: 1,  tol: 0.01   },
  { key: 'red',    label: 'Red',    swatch: '#cc1f1f', digit: 2, mult: 2,  tol: 0.02   },
  { key: 'orange', label: 'Orange', swatch: '#d97a1a', digit: 3, mult: 3,  tol: null   },
  { key: 'yellow', label: 'Yellow', swatch: '#dccd1f', digit: 4, mult: 4,  tol: null   },
  { key: 'green',  label: 'Green',  swatch: '#3aa84b', digit: 5, mult: 5,  tol: 0.005  },
  { key: 'blue',   label: 'Blue',   swatch: '#3a73d9', digit: 6, mult: 6,  tol: 0.0025 },
  { key: 'violet', label: 'Violet', swatch: '#8e3acc', digit: 7, mult: 7,  tol: 0.001  },
  { key: 'grey',   label: 'Grey',   swatch: '#7a7a7a', digit: 8, mult: 8,  tol: 0.0005 },
  { key: 'white',  label: 'White',  swatch: '#e8e8e8', digit: 9, mult: 9,  tol: null   },
  { key: 'gold',   label: 'Gold',   swatch: '#caa84a', digit: null, mult: -1, tol: 0.05 },
  { key: 'silver', label: 'Silver', swatch: '#c0c0c0', digit: null, mult: -2, tol: 0.10 },
];

const BY_KEY: Record<string, Colour> = Object.fromEntries(COLOURS.map(c => [c.key, c]));

const DIGIT_COLOURS = COLOURS.filter(c => c.digit !== null);
const MULT_COLOURS = COLOURS.filter(c => c.mult !== null);
const TOL_COLOURS = COLOURS.filter(c => c.tol !== null);

export function ColorCodeDecoderDemo({ figure }: Props) {
  const [mode, setMode] = useState<4 | 5>(4);
  // Defaults: 1 kΩ ±5% (brown, black, red, gold) for 4-band; 1.00 kΩ ±1% (brown, black, black, brown, brown) for 5-band.
  const [b1, setB1] = useState('brown');
  const [b2, setB2] = useState('black');
  const [b3, setB3] = useState('black');     // 3rd digit for 5-band; multiplier for 4-band
  const [bMult, setBMult] = useState('red'); // 5-band multiplier
  const [bTol, setBTol] = useState('gold');

  const c1 = BY_KEY[b1]!, c2 = BY_KEY[b2]!, c3 = BY_KEY[b3]!, cM = BY_KEY[bMult]!, cT = BY_KEY[bTol]!;

  let nominal: number;
  let tol: number;
  if (mode === 4) {
    const d1 = c1.digit ?? 0;
    const d2 = c2.digit ?? 0;
    const mexp = c3.mult ?? 0;
    nominal = (d1 * 10 + d2) * Math.pow(10, mexp);
    tol = cT.tol ?? 0.20;  // no band = ±20%
  } else {
    const d1 = c1.digit ?? 0;
    const d2 = c2.digit ?? 0;
    const d3 = c3.digit ?? 0;
    const mexp = cM.mult ?? 0;
    nominal = (d1 * 100 + d2 * 10 + d3) * Math.pow(10, mexp);
    tol = cT.tol ?? 0.20;
  }

  return (
    <Demo
      figure={figure ?? 'Fig. 4.2'}
      title="The colour code"
      question="What's that hot-dog actually worth?"
      caption={
        <>
          The IEC 60062 colour code: two (or three) digit bands, a multiplier band, and a tolerance band. Four bands gives you
          two significant figures (E12/E24 series, ±2–10%); five gives three (E96, ±1% or better). Click colours to set each
          band; the readout shows the nominal value and the tolerance window.
        </>
      }
      deeperLab={{ slug: 'resistance', label: 'See full lab' }}
    >
      <div style={{ padding: '12px', background: '#0d0d10', borderRadius: 6 }}>
        <ResistorSVG bands={mode === 4 ? [c1, c2, c3, cT] : [c1, c2, c3, cM, cT]} />
      </div>

      <DemoControls>
        <button
          type="button"
          className={`mini-toggle${mode === 4 ? ' on' : ''}`}
          onClick={() => setMode(4)}
        >4-band</button>
        <button
          type="button"
          className={`mini-toggle${mode === 5 ? ' on' : ''}`}
          onClick={() => setMode(5)}
        >5-band</button>
        <MiniReadout label="Value" value={fmtOhms(nominal)} />
        <MiniReadout label="Tolerance" value={`±${fmtTol(tol)}`} />
        <MiniReadout label="Range" value={`${fmtOhms(nominal * (1 - tol))} – ${fmtOhms(nominal * (1 + tol))}`} />
      </DemoControls>

      <div className="cc-band-pickers" style={{ display: 'grid', gap: 10, padding: '10px 14px' }}>
        <BandRow label="Band 1 (digit)" value={b1} options={DIGIT_COLOURS} onChange={setB1} />
        <BandRow label="Band 2 (digit)" value={b2} options={DIGIT_COLOURS} onChange={setB2} />
        {mode === 4 ? (
          <BandRow label="Band 3 (multiplier)" value={b3} options={MULT_COLOURS} onChange={setB3} />
        ) : (
          <>
            <BandRow label="Band 3 (digit)" value={b3} options={DIGIT_COLOURS} onChange={setB3} />
            <BandRow label="Band 4 (multiplier)" value={bMult} options={MULT_COLOURS} onChange={setBMult} />
          </>
        )}
        <BandRow label={`Band ${mode === 4 ? 4 : 5} (tolerance)`} value={bTol} options={TOL_COLOURS} onChange={setBTol} />
      </div>
    </Demo>
  );
}

interface BandRowProps {
  label: string;
  value: string;
  options: Colour[];
  onChange: (k: string) => void;
}
function BandRow({ label, value, options, onChange }: BandRowProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <span style={{ font: '10px "JetBrains Mono", monospace', color: 'rgba(160,158,149,0.85)', minWidth: 150 }}>
        {label}
      </span>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {options.map(c => {
          const sel = c.key === value;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => onChange(c.key)}
              aria-pressed={sel}
              title={c.label}
              style={{
                width: 22, height: 22, borderRadius: 4,
                background: c.swatch,
                border: sel ? '2px solid #ff6b2a' : '1px solid rgba(255,255,255,0.18)',
                cursor: 'pointer', padding: 0,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

interface ResistorSVGProps {
  bands: Colour[];
}
function ResistorSVG({ bands }: ResistorSVGProps) {
  const W = 360;
  const H = 90;
  const bodyL = 60;
  const bodyW = 240;
  const bodyT = 24;
  const bodyH = 42;

  // Distribute bands across the body
  const padX = 18;
  const slots = bands.length;
  const slotW = (bodyW - 2 * padX) / Math.max(slots, 1);
  const stripeW = 12;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: 460, display: 'block', margin: '0 auto' }}>
      {/* Leads */}
      <line x1={4} y1={H / 2} x2={bodyL} y2={H / 2} stroke="#c8c8cc" strokeWidth={2} />
      <line x1={bodyL + bodyW} y1={H / 2} x2={W - 4} y2={H / 2} stroke="#c8c8cc" strokeWidth={2} />
      {/* Body */}
      <rect x={bodyL} y={bodyT} width={bodyW} height={bodyH} rx={20} ry={20}
            fill="rgba(200,170,140,0.32)" stroke="rgba(255,255,255,0.22)" />
      {/* Bands */}
      {bands.map((c, i) => {
        // Cluster the first few bands toward the left; tolerance band sits on the right
        let cx: number;
        if (i < bands.length - 1) {
          cx = bodyL + padX + slotW * (i + 0.5) * 0.65;
        } else {
          cx = bodyL + bodyW - padX - stripeW / 2;
        }
        return (
          <rect key={i}
                x={cx - stripeW / 2} y={bodyT + 2}
                width={stripeW} height={bodyH - 4}
                fill={c.swatch} />
        );
      })}
    </svg>
  );
}

function fmtOhms(R: number): string {
  if (!isFinite(R)) return '—';
  if (R >= 1e9) return (R / 1e9).toFixed(R >= 10e9 ? 1 : 2) + ' GΩ';
  if (R >= 1e6) return (R / 1e6).toFixed(R >= 10e6 ? 1 : 2) + ' MΩ';
  if (R >= 1e3) return (R / 1e3).toFixed(R >= 10e3 ? 1 : 2) + ' kΩ';
  if (R >= 1)   return R.toFixed(R >= 10 ? 1 : 2) + ' Ω';
  if (R >= 0.01) return (R * 1e3).toFixed(0) + ' mΩ';
  return R.toExponential(2) + ' Ω';
}
function fmtTol(t: number): string {
  return (t * 100).toFixed(t < 0.01 ? 2 : t < 0.05 ? 1 : 0) + '%';
}
