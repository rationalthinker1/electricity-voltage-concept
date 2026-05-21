/**
 * Demo D4.6 — Wiedemann–Franz law
 *
 * For a small set of metals (Cu, Ag, Au, Al, Fe, W), display the measured
 * electrical conductivity σ and thermal conductivity κ at 295 K. Compute
 * the Lorenz number L = κ / (σ T). For nearly every common metal the
 * answer is within a few percent of L₀ = 2.44×10⁻⁸ W·Ω·K⁻², which is the
 * Wiedemann–Franz law.
 *
 * (Iron is the standard "deviates a bit" entry; transition metals with
 * multiple bands at the Fermi level don't satisfy WF as cleanly.)
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout } from '@/components/Demo';
import { Num } from '@/components/Num';
import { drawLabel } from '@/lib/canvasLayout';
import { getCanvasColors, withAlpha } from '@/lib/canvasTheme';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';


interface Props {
  figure?: string;
}

interface Metal {
  key: string;
  name: string;
  /** Electrical conductivity σ, S/m at 295 K. CRC Handbook. */
  sigma: number;
  /** Thermal conductivity κ, W/(m·K) at 295 K. CRC Handbook. */
  kappa: number;
  color: string;
}

const T_K = 295;
const L0 = 2.44e-8; // Sommerfeld Lorenz number, W·Ω·K⁻²

// CRC Handbook of Chemistry & Physics 104th ed. (2023):
// Thermal conductivities at 298 K and electrical resistivities at 293 K.
// (Conductivities = 1/ρ; ρ_Cu = 1.678e-8 Ω·m, etc.)
const METALS: Metal[] = [
  { key: 'silver', name: 'Silver', sigma: 6.3e7, kappa: 429, color: '#e8e8e8' },
  { key: 'copper', name: 'Copper', sigma: 5.96e7, kappa: 401, color: '#ff6b2a' },
  { key: 'gold', name: 'Gold', sigma: 4.1e7, kappa: 318, color: '#dccd1f' },
  { key: 'aluminum', name: 'Aluminum', sigma: 3.77e7, kappa: 237, color: '#a8c0d8' },
  { key: 'tungsten', name: 'Tungsten', sigma: 1.79e7, kappa: 173, color: '#ffb84a' },
  { key: 'iron', name: 'Iron', sigma: 1.0e7, kappa: 80.4, color: '#cc6a5a' },
];

export function WiedemannFranzDemo({ figure }: Props) {
  const [metalKey, setMetalKey] = useState('copper');

  const stateRef = useSimState({ metalKey });
  const m = METALS.find((x) => x.key === metalKey)!;
  const L = m.kappa / (m.sigma * T_K);

  const setup = useSimLoop(
      stateRef,
      ({ ctx, w: W, h: H, colors }, _state, _dt, _simTime) => {
        const { metalKey } = stateRef.current;
        ctx.fillStyle = colors.bg;
        ctx.fillRect(0, 0, W, H);
        const padL = 100;
        const padR = 24;
        const padT = 38;
        const padB = 40;
        const gW = W - padL - padR;
        const gH = H - padT - padB;
        const rowH = gH / METALS.length;
        ctx.strokeStyle = colors.borderStrong;
        ctx.beginPath();
        ctx.moveTo(padL, padT);
        ctx.lineTo(padL, padT + gH);
        ctx.lineTo(padL + gW, padT + gH);
        ctx.stroke();
        const maxK = 450;
        const maxS = 7e7;
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillStyle = colors.textDim;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        METALS.forEach((mm, i) => {
                const y = padT + rowH * i;
                const yMid = y + rowH / 2;
                const isSel = mm.key === metalKey;
        
                // κ bar (top half of row)
                const kappaW = (mm.kappa / maxK) * gW;
                ctx.fillStyle = isSel
                  ? withAlpha(colors.accent, 0.85)
                  : withAlpha(colors.accent, 0.3);
                ctx.fillRect(padL, y + 6, kappaW, rowH / 2 - 8);
        
                // σ bar (bottom half of row)
                const sigmaW = (mm.sigma / maxS) * gW;
                ctx.fillStyle = isSel
                  ? withAlpha(colors.teal, 0.85)
                  : withAlpha(colors.teal, 0.3);
                ctx.fillRect(padL, y + rowH / 2 + 2, sigmaW, rowH / 2 - 8);
        
                // Material label
                ctx.fillStyle = isSel ? '#ff6b2a' : withAlpha(colors.text, 0.75);
                ctx.font = isSel
                  ? 'bold 10px "JetBrains Mono", monospace'
                  : '10px "JetBrains Mono", monospace';
                ctx.textAlign = 'right';
                ctx.textBaseline = 'middle';
                ctx.fillText(mm.name.toUpperCase(), padL - 10, yMid);
        
                // Per-metal Lorenz value
                const L_m = mm.kappa / (mm.sigma * T_K);
                drawLabel(ctx, {
                  x: padL + Math.max(kappaW, sigmaW) + 6,
                  y: yMid,
                  text: `L = ${(L_m * 1e8).toFixed(2)}×10⁻⁸`,
                  color: isSel ? '#ff6b2a' : withAlpha(colors.textDim, 0.7),
                  size: 9,
                });
              });
        drawLabel(ctx, {
                x: padL,
                y: 8,
                text: 'κ — thermal conductivity (W/m·K)',
                color: colors.accent,
                size: 9,
                baseline: 'top',
              });
        drawLabel(ctx, {
                x: padL,
                y: 22,
                text: 'σ — electrical conductivity (S/m)',
                color: colors.teal,
                size: 9,
                baseline: 'top',
              });
        drawLabel(ctx, {
                x: W - 12,
                y: 8,
                text: `L₀ = 2.44×10⁻⁸ W·Ω·K⁻²`,
                color: colors.accent,
                align: 'right',
                baseline: 'top',
              });
      },
      [],
    );

  return (
    <Demo
      figure={figure ?? 'Fig. 4.6'}
      title="Wiedemann–Franz"
      question="Why are good electrical conductors also good thermal conductors?"
      caption={
        <>
          For every metal in the list, κ and σ live in the same ratio: <strong>κ / (σT)</strong> ≈{' '}
          <strong>2.44×10⁻⁸ W·Ω·K⁻²</strong>. The reason is that the same free-electron gas carries
          both — current is electrons drifting in an E field, heat is electrons carrying kinetic
          energy down a temperature gradient. The Sommerfeld free-electron model predicts the
          constant exactly; experiment confirms it across the common metals. (Iron deviates a bit —
          transition metals have additional scattering channels.)
        </>
      }
      deeperLab={{ slug: 'drift', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={280} setup={setup} />
      <DemoControls>
        {METALS.map((mm) => (
          <button
            key={mm.key}
            type="button"
            className={`mini-toggle${mm.key === metalKey ? 'on' : ''}`}
            onClick={() => setMetalKey(mm.key)}
            aria-pressed={mm.key === metalKey}
          >
            {mm.name}
          </button>
        ))}
        <MiniReadout label="κ" value={m.kappa.toFixed(0)} unit="W/m·K" />
        <MiniReadout label="σ" value={<Num value={m.sigma} />} unit="S/m" />
        <MiniReadout label="L = κ/(σT)" value={<Num value={L} />} unit="W·Ω·K⁻²" />
        <MiniReadout label="L / L₀" value={(L / L0).toFixed(3)} />
      </DemoControls>
    </Demo>
  );
}
