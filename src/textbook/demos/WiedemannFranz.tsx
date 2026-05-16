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
import { getCanvasColors } from '@/lib/canvasTheme';

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

  const stateRef = useRef({ metalKey });
  useEffect(() => {
    stateRef.current = { metalKey };
  }, [metalKey]);

  const m = METALS.find((x) => x.key === metalKey)!;
  const L = m.kappa / (m.sigma * T_K);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w: W, h: H } = info;
    let raf = 0;

    function draw() {
      const { metalKey } = stateRef.current;
      ctx.fillStyle = getCanvasColors().bg;
      ctx.fillRect(0, 0, W, H);

      // Two-axis bar chart: for each metal plot κ (left axis) and σ (right axis)
      const padL = 100;
      const padR = 24;
      const padT = 38;
      const padB = 40;
      const gW = W - padL - padR;
      const gH = H - padT - padB;
      const rowH = gH / METALS.length;

      ctx.strokeStyle = getCanvasColors().borderStrong;
      ctx.beginPath();
      ctx.moveTo(padL, padT);
      ctx.lineTo(padL, padT + gH);
      ctx.lineTo(padL + gW, padT + gH);
      ctx.stroke();

      const maxK = 450;
      const maxS = 7e7;

      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillStyle = getCanvasColors().textDim;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';

      METALS.forEach((mm, i) => {
        const y = padT + rowH * i;
        const yMid = y + rowH / 2;
        const isSel = mm.key === metalKey;

        // κ bar (top half of row)
        const kappaW = (mm.kappa / maxK) * gW;
        ctx.fillStyle = isSel ? 'rgba(255,107,42,0.85)' : 'rgba(255,107,42,0.30)';
        ctx.fillRect(padL, y + 6, kappaW, rowH / 2 - 8);

        // σ bar (bottom half of row)
        const sigmaW = (mm.sigma / maxS) * gW;
        ctx.fillStyle = isSel ? 'rgba(108,197,194,0.85)' : 'rgba(108,197,194,0.30)';
        ctx.fillRect(padL, y + rowH / 2 + 2, sigmaW, rowH / 2 - 8);

        // Material label
        ctx.fillStyle = isSel ? '#ff6b2a' : 'rgba(236,235,229,0.75)';
        ctx.font = isSel
          ? 'bold 10px "JetBrains Mono", monospace'
          : '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(mm.name.toUpperCase(), padL - 10, yMid);

        // Per-metal Lorenz value
        const L_m = mm.kappa / (mm.sigma * T_K);
        ctx.fillStyle = isSel ? '#ff6b2a' : 'rgba(160,158,149,0.7)';
        ctx.textAlign = 'left';
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillText(
          `L = ${(L_m * 1e8).toFixed(2)}×10⁻⁸`,
          padL + Math.max(kappaW, sigmaW) + 6,
          yMid,
        );
      });

      // Headers
      ctx.fillStyle = getCanvasColors().accent;
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('κ — thermal conductivity (W/m·K)', padL, 8);
      ctx.fillStyle = getCanvasColors().teal;
      ctx.fillText('σ — electrical conductivity (S/m)', padL, 22);

      // Headline: average Lorenz across the metals
      ctx.fillStyle = getCanvasColors().accent;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`L₀ = 2.44×10⁻⁸ W·Ω·K⁻²`, W - 12, 8);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

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
