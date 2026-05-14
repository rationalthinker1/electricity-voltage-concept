/**
 * Demo D3.3 — Material picker
 *
 * At fixed V, L, A, swap the material and watch I (and P) collapse by
 * orders of magnitude. Copper carries ~1788 A; nichrome carries ~27 mA.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import {
  Demo, DemoControls, MiniReadout,
} from '@/components/Demo';
import { Num } from '@/components/Num';
import { MATERIALS, type MaterialKey } from '@/lib/physics';

interface Props {
  figure?: string;
}

const CHOICES: MaterialKey[] = ['copper', 'aluminum', 'iron', 'tungsten', 'nichrome'];

// Fixed scenario
const V = 12;          // V
const L = 1.0;         // m
const A_mm2 = 2.5;     // mm²
const A_m2 = A_mm2 * 1e-6;

export function MaterialPickerDemo({ figure }: Props) {
  const [mat, setMat] = useState<MaterialKey>('copper');

  const stateRef = useRef({ mat });
  useEffect(() => { stateRef.current = { mat }; }, [mat]);

  const sigma = MATERIALS[mat]!.sigma;
  const R = L / (sigma * A_m2);
  const I = V / R;
  const P = V * I;

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h } = info;
    let raf = 0;

    function draw() {
      const { mat } = stateRef.current;
      const sigma = MATERIALS[mat]!.sigma;
      const R = L / (sigma * A_m2);
      const I_ = V / R;

      ctx.fillStyle = '#0d0d10';
      ctx.fillRect(0, 0, w, h);

      // Bar chart of currents across all 5 materials, log scale
      const padL = 110;
      const padR = 24;
      const padT = 34;
      const padB = 30;
      const innerW = w - padL - padR;
      const innerH = h - padT - padB;
      const rowH = innerH / CHOICES.length;

      // Establish log range — pick min & max across the choice set at V/L/A
      const currents = CHOICES.map(k => {
        const s = MATERIALS[k]!.sigma;
        return V / (L / (s * A_m2));
      });
      const logMax = Math.log10(Math.max(...currents)) + 0.5;
      const logMin = Math.log10(Math.min(...currents)) - 0.5;
      const logRange = logMax - logMin;

      // Axis baseline
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.beginPath();
      ctx.moveTo(padL, padT);
      ctx.lineTo(padL, h - padB);
      ctx.lineTo(w - padR, h - padB);
      ctx.stroke();

      // Decade gridlines
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(160,158,149,0.5)';
      const decadeStart = Math.ceil(logMin);
      const decadeEnd = Math.floor(logMax);
      for (let d = decadeStart; d <= decadeEnd; d++) {
        const x = padL + ((d - logMin) / logRange) * innerW;
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.beginPath();
        ctx.moveTo(x, padT);
        ctx.lineTo(x, h - padB);
        ctx.stroke();
        const label = d >= 0 ? `10^${d}` : `10⁻${-d}`;
        ctx.fillText(label.replace('10^', '10').replace('^', ''), x, h - padB + 14);
      }
      ctx.fillText('current (A, log scale)', padL + innerW / 2, h - padB + 26);

      CHOICES.forEach((k, i) => {
        const m = MATERIALS[k]!;
        const s = m.sigma;
        const ik = V / (L / (s * A_m2));
        const x0 = padL;
        const x1 = padL + ((Math.log10(ik) - logMin) / logRange) * innerW;
        const yMid = padT + rowH * (i + 0.5);
        const barH = Math.min(22, rowH * 0.55);
        const isSel = k === mat;
        ctx.fillStyle = isSel ? 'rgba(255,107,42,0.85)' : 'rgba(108,197,194,0.4)';
        ctx.fillRect(x0, yMid - barH / 2, Math.max(1, x1 - x0), barH);
        ctx.strokeStyle = isSel ? 'rgba(255,107,42,1)' : 'rgba(108,197,194,0.65)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x0, yMid - barH / 2, Math.max(1, x1 - x0), barH);

        // Material label
        ctx.fillStyle = isSel ? '#ff6b2a' : 'rgba(236,235,229,0.75)';
        ctx.font = isSel ? 'bold 10px "JetBrains Mono", monospace' : '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'right';
        ctx.fillText(m.name.replace(' (filament)', '').replace(' (heater)', '').toUpperCase(), padL - 10, yMid + 3);

        // Numeric value at end of bar
        ctx.fillStyle = isSel ? '#ff6b2a' : 'rgba(160,158,149,0.85)';
        ctx.textAlign = 'left';
        ctx.font = '10px "JetBrains Mono", monospace';
        const txt = formatCurrent(ik);
        ctx.fillText(txt, Math.min(w - padR - 60, x1 + 6), yMid + 3);
      });

      // Header
      ctx.fillStyle = '#ff6b2a';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`V = ${V} V   ·   L = ${L} m   ·   A = ${A_mm2} mm²`, 10, 16);
      // Suppress unused-var warning by referencing I_
      void I_;

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 3.3'}
      title="Material is destiny"
      question="Same wire geometry, same voltage. What current flows through each material?"
      caption="At V = 12 V across 1 m of 2.5 mm² wire, copper carries ~1.8 kA (it's basically a short circuit), while nichrome — designed for heating elements — carries about 27 mA. Five orders of magnitude, set entirely by σ."
      deeperLab={{ slug: 'ohms-law', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={260} setup={setup} />
      <DemoControls>
        {CHOICES.map(k => (
          <button
            key={k}
            type="button"
            className={`mini-toggle${k === mat ? ' on' : ''}`}
            onClick={() => setMat(k)}
            aria-pressed={k === mat}
          >
            {MATERIALS[k]!.name.replace(' (filament)', '').replace(' (heater)', '')}
          </button>
        ))}
        <MiniReadout label="Current" value={<Num value={I} />} unit="A" />
        <MiniReadout label="Power" value={<Num value={P} />} unit="W" />
      </DemoControls>
    </Demo>
  );
}

function formatCurrent(I: number): string {
  if (I >= 1000) return (I / 1000).toFixed(2) + ' kA';
  if (I >= 1) return I.toFixed(1) + ' A';
  if (I >= 1e-3) return (I * 1e3).toFixed(1) + ' mA';
  if (I >= 1e-6) return (I * 1e6).toFixed(1) + ' µA';
  return I.toExponential(1) + ' A';
}
