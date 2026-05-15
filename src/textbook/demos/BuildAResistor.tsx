/**
 * Demo D4.1 — Build a resistor (chapter centerpiece)
 *
 * Reader picks a material family (carbon-comp, carbon-film, metal-film,
 * metal-oxide, wirewound-NiCr, wirewound-manganin), a film length L_film
 * (mm — spiral length of the resistive element), and a film cross-section
 * A_film (mm² — the thin film's cross-section, or the wire's cross-section
 * for wirewound). The live readout shows R = ρL/A and a tolerance band per
 * family.
 *
 * Visualization: a side-on resistor body with two axial leads. A "cutaway"
 * exposes the spiraled film around a ceramic substrate; as L grows the spiral
 * tightens; as A grows the film thickens.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import {
  Demo, DemoControls, MiniReadout, MiniSlider,
} from '@/components/Demo';
import { Num } from '@/components/Num';
import { getCanvasColors } from '@/lib/canvasTheme';

interface Props { figure?: string }

type FamilyKey = 'carbon-comp' | 'carbon-film' | 'metal-film' | 'metal-oxide' | 'wirewound-nicr' | 'wirewound-manganin';

interface Family {
  key: FamilyKey;
  label: string;
  /** Resistivity ρ in Ω·m at 20 °C. Values from CRC/Kanthal/typical film-resistor literature. */
  rho: number;
  /** Typical tolerance band (±fraction) — practical, not theoretical floor. */
  tol: number;
  /** UI accent for the visualization. */
  color: string;
  /** Short caption shown below the figure when this family is selected. */
  blurb: string;
}

// Bulk-material resistivities (CRC at 20 °C); for film resistors ρ here is the
// effective resistivity of the deposited film (similar order to the bulk metal,
// though film ρ is usually 1–10× bulk depending on grain structure — this is a
// physical-intuition demo, not a manufacturing spec sheet).
const FAMILIES: Record<FamilyKey, Family> = {
  'carbon-comp':       { key: 'carbon-comp',       label: 'Carbon comp',       rho: 3.5e-5,  tol: 0.10,   color: '#d28b5f', blurb: 'A pressed slug of carbon-graphite powder + binder. Cheap, noisy, ±5–10%, drifts with humidity and age. Mostly obsolete except in pulse-power applications.' },
  'carbon-film':       { key: 'carbon-film',       label: 'Carbon film',       rho: 4.0e-5,  tol: 0.05,   color: '#b07050', blurb: 'A thin spiral of carbon deposited on a ceramic core, then trimmed. ±2–5%, low cost, slight negative temperature coefficient.' },
  'metal-film':        { key: 'metal-film',        label: 'Metal film',        rho: 1.4e-6,  tol: 0.001,  color: '#9aafff', blurb: 'A spiral of NiCr or tantalum nitride on a ceramic core. ±0.1–1%, very low noise, low TCR. The default for precision circuits.' },
  'metal-oxide':       { key: 'metal-oxide',       label: 'Metal oxide',       rho: 5.0e-6,  tol: 0.02,   color: '#c89070', blurb: 'A film of tin-oxide on ceramic. Rugged, high operating temp, high pulse capability. ±2–5%. Common in power-supply primary side.' },
  'wirewound-nicr':    { key: 'wirewound-nicr',    label: 'Wirewound NiCr',    rho: 1.1e-6,  tol: 0.05,   color: '#6cc5c2', blurb: 'A coil of nichrome wire on a ceramic former. Handles high power (1–25 W+); inductive at high frequency.' },
  'wirewound-manganin':{ key: 'wirewound-manganin',label: 'Wirewound manganin',rho: 4.8e-7,  tol: 0.0005, color: '#9cd3ff', blurb: 'A coil of Cu-Mn-Ni alloy, engineered for α ≈ 0. Used for precision current shunts and resistance standards.' },
};

const FAMILY_KEYS: FamilyKey[] = ['carbon-comp', 'carbon-film', 'metal-film', 'metal-oxide', 'wirewound-nicr', 'wirewound-manganin'];

export function BuildAResistorDemo({ figure }: Props) {
  const [familyKey, setFamilyKey] = useState<FamilyKey>('metal-film');
  // L_film is the *length* of the spiral / wire (mm)
  const [Lmm, setLmm] = useState(120);
  // A_film is the cross-section of the spiral film (mm²) — sub-mm² range is
  // realistic for thin films; we go up to a few mm² to show wirewound also.
  const [Amm2, setAmm2] = useState(0.05);

  const fam = FAMILIES[familyKey];
  const L_m = Lmm * 1e-3;
  const A_m2 = Amm2 * 1e-6;
  const R = (fam.rho * L_m) / A_m2;
  const Rmin = R * (1 - fam.tol);
  const Rmax = R * (1 + fam.tol);

  const stateRef = useRef({ familyKey, Lmm, Amm2 });
  useEffect(() => { stateRef.current = { familyKey, Lmm, Amm2 }; }, [familyKey, Lmm, Amm2]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w: W, h: H } = info;
    let raf = 0;
    let phase = 0;

    function draw() {
      const { familyKey, Lmm, Amm2 } = stateRef.current;
      const f = FAMILIES[familyKey];
      phase += 0.012;

      ctx.fillStyle = getCanvasColors().bg;
      ctx.fillRect(0, 0, W, H);

      // Layout
      const bodyW = Math.min(W * 0.72, 460);
      const bodyH = Math.min(H * 0.48, 110);
      const cx = W / 2;
      const cy = H / 2;
      const bodyL = cx - bodyW / 2;
      const bodyT = cy - bodyH / 2;
      const isWirewound = familyKey.startsWith('wirewound');

      // Axial leads
      ctx.strokeStyle = 'rgba(200,200,205,0.85)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bodyL - 80, cy); ctx.lineTo(bodyL + 4, cy);
      ctx.moveTo(bodyL + bodyW - 4, cy); ctx.lineTo(bodyL + bodyW + 80, cy);
      ctx.stroke();

      // Body shell (rounded rect, beige for carbon-types, blue for metal-film, etc)
      const shellColor = isWirewound ? 'rgba(220,220,220,0.18)' : 'rgba(190,160,140,0.22)';
      roundRect(ctx, bodyL, bodyT, bodyW, bodyH, 18);
      ctx.fillStyle = shellColor;
      ctx.fill();
      ctx.strokeStyle = getCanvasColors().borderStrong;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Cutaway region (lower portion) — exposes the spiral / wire winding
      const cutT = cy - 6;
      const cutH = bodyH / 2 + 12;
      ctx.save();
      ctx.beginPath();
      roundRectPath(ctx, bodyL + 6, cutT, bodyW - 12, cutH, 8);
      ctx.clip();

      // Ceramic substrate (gray cylinder cross-section)
      const subH = cutH * 0.55;
      const subT = cutT + (cutH - subH) / 2;
      ctx.fillStyle = 'rgba(230,225,210,0.22)';
      roundRect(ctx, bodyL + 12, subT, bodyW - 24, subH, 4);
      ctx.fill();

      if (!isWirewound) {
        // Helical/spiral cut on the film: draw L_film / pitch turns.
        // Visual spiral count: scale with L (longer spiral = more turns shown).
        const turns = Math.max(2, Math.min(28, Math.round(Lmm / 8)));
        // Film thickness scales with sqrt(A_film)
        const filmThick = Math.max(0.8, Math.min(6, 0.8 + Math.sqrt(Amm2 / 0.5) * 4.0));
        ctx.strokeStyle = f.color;
        ctx.lineWidth = filmThick;
        const pitch = (bodyW - 24) / turns;
        for (let i = 0; i < turns; i++) {
          const x0 = bodyL + 12 + i * pitch;
          // Draw a half-ellipse to suggest a wrap of film around the cylinder
          ctx.beginPath();
          ctx.ellipse(x0 + pitch * 0.5, subT + subH / 2, pitch * 0.5, subH * 0.45, 0, Math.PI, 2 * Math.PI);
          ctx.stroke();
        }
      } else {
        // Wirewound: thicker round wire helix
        const turns = Math.max(3, Math.min(36, Math.round(Lmm / 5)));
        const wireThick = Math.max(1.5, Math.min(7, 1.0 + Math.sqrt(Amm2 / 0.5) * 5.0));
        ctx.strokeStyle = f.color;
        ctx.lineWidth = wireThick;
        const pitch = (bodyW - 24) / turns;
        for (let i = 0; i < turns; i++) {
          const x0 = bodyL + 12 + i * pitch;
          ctx.beginPath();
          ctx.arc(x0 + pitch * 0.5, subT + subH / 2, Math.min(pitch * 0.55, subH * 0.42), Math.PI, 2 * Math.PI);
          ctx.stroke();
        }
      }
      ctx.restore();

      // Four-band stripe markings on the upper half of the body (for fixed-value
      // resistors only — wirewounds usually have printed value).
      if (!isWirewound) {
        // We pick a "nearest preferred value" decoded from R for display.
        const bands = decodeFourBand(R);
        const stripeW = 8;
        const gap = 6;
        const startX = bodyL + bodyW * 0.18;
        const stripeT = bodyT + 6;
        const stripeH = bodyH / 2 - 14;
        bands.forEach((c, i) => {
          ctx.fillStyle = c;
          ctx.fillRect(startX + i * (stripeW + gap), stripeT, stripeW, stripeH);
        });
      }

      // Labels
      ctx.fillStyle = getCanvasColors().textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(f.label.toUpperCase(), 12, 10);
      ctx.fillText(`ρ = ${fmtRho(f.rho)} Ω·m`, 12, 24);
      ctx.fillText(`L = ${Lmm.toFixed(0)} mm`, 12, 38);
      ctx.fillText(`A = ${Amm2.toFixed(3)} mm²`, 12, 52);

      // Tolerance band on the right
      ctx.textAlign = 'right';
      ctx.fillStyle = getCanvasColors().accent;
      ctx.fillText(`R = ${fmtOhms(R)}`, W - 12, 10);
      ctx.fillStyle = getCanvasColors().textDim;
      ctx.fillText(`±${(f.tol * 100).toFixed(f.tol < 0.01 ? 2 : 0)}%   ${fmtOhms(Rmin)} … ${fmtOhms(Rmax)}`, W - 12, 24);

      void phase;
      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 4.1'}
      title="Build a resistor"
      question="What's actually inside the brown hot-dog with two stripes on it?"
      caption={
        <>
          Pick a material family, a film length, and a cross-section. <strong>R = ρL/A</strong> updates live, and so does the
          tolerance band: a carbon-comp resistor is <strong>±10%</strong>; a precision metal-film is <strong>±0.1%</strong>. Watch the
          spiral inside the cutaway tighten as <strong>L</strong> grows, and thicken as <strong>A</strong> grows. Wirewound packages
          a metal coil instead of a deposited film. <em>{FAMILIES[familyKey].blurb}</em>
        </>
      }
      deeperLab={{ slug: 'resistance', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        {FAMILY_KEYS.map(k => (
          <button
            key={k}
            type="button"
            className={`mini-toggle${k === familyKey ? ' on' : ''}`}
            onClick={() => setFamilyKey(k)}
            aria-pressed={k === familyKey}
          >
            {FAMILIES[k].label}
          </button>
        ))}
        <MiniSlider
          label="L"
          value={Lmm} min={5} max={400} step={1}
          format={v => v.toFixed(0) + ' mm'}
          onChange={setLmm}
        />
        <MiniSlider
          label="A"
          value={Amm2} min={0.005} max={2.5} step={0.005}
          format={v => v < 0.1 ? v.toFixed(3) + ' mm²' : v.toFixed(2) + ' mm²'}
          onChange={setAmm2}
        />
        <MiniReadout label="R = ρL/A" value={<Num value={R} />} unit="Ω" />
        <MiniReadout label="Tolerance" value={`±${(fam.tol * 100).toFixed(fam.tol < 0.01 ? 2 : 0)}%`} />
      </DemoControls>
    </Demo>
  );
}

/* ─── Helpers ─── */

function fmtOhms(R: number): string {
  if (!isFinite(R)) return '—';
  if (R >= 1e6) return (R / 1e6).toFixed(2) + ' MΩ';
  if (R >= 1e3) return (R / 1e3).toFixed(2) + ' kΩ';
  if (R >= 1)   return R.toFixed(2) + ' Ω';
  if (R >= 1e-3) return (R * 1e3).toFixed(2) + ' mΩ';
  return R.toExponential(2) + ' Ω';
}
function fmtRho(r: number): string {
  return r.toExponential(2);
}

/** Map R (Ω) onto a four-band colour sequence (two digit bands, multiplier, gold tolerance). */
function decodeFourBand(R: number): string[] {
  const COLOR: string[] = [
    '#1a1a1a', // 0 black
    '#7a4a14', // 1 brown
    '#cc1f1f', // 2 red
    '#d97a1a', // 3 orange
    '#dccd1f', // 4 yellow
    '#3aa84b', // 5 green
    '#3a73d9', // 6 blue
    '#8e3acc', // 7 violet
    '#7a7a7a', // 8 grey
    '#e8e8e8', // 9 white
  ];
  if (!isFinite(R) || R <= 0) return [COLOR[0]!, COLOR[0]!, COLOR[0]!, '#caa84a'];
  const exp = Math.floor(Math.log10(R));
  const mantissa = R / Math.pow(10, exp);
  const m2 = Math.round(mantissa * 10);
  const d1 = Math.min(9, Math.max(0, Math.floor(m2 / 10)));
  const d2 = Math.min(9, Math.max(0, m2 - d1 * 10));
  // multiplier band index = exp - 1 (since two digits already account for ×10^1)
  const multIdx = Math.min(9, Math.max(0, exp - 1));
  return [COLOR[d1]!, COLOR[d2]!, COLOR[multIdx]!, '#caa84a'];
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  roundRectPath(ctx, x, y, w, h, r);
}
function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  r = Math.min(r, h / 2, w / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
