/**
 * Demo 19.1 — Lead-acid cell (Planté 1859)
 *
 * Two lead plates in dilute H₂SO₄. Discharge:
 *   Pb + PbO₂ + 2 H₂SO₄ → 2 PbSO₄ + 2 H₂O
 * Both plates pick up PbSO₄ as discharge progresses; acid gets diluted
 * (specific gravity drops from 1.27 → 1.10). Charging reverses it.
 *
 * Reader toggles discharge / charge and watches the white PbSO₄ crystals
 * grow on both plates and the acid SG fall.
 */
import { useEffect, useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniToggle } from '@/components/Demo';
import { Num } from '@/components/Num';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';
import { drawLabel } from "@/lib/canvasLayout";
import { withAlpha } from '@/lib/canvasTheme';

interface Props {
  figure?: string;
}

const SG_FULL = 1.27; // specific gravity of acid when fully charged
const SG_EMPTY = 1.1;
const V_FULL = 2.1; // per cell (Planté chemistry)
const V_EMPTY = 1.8;

export function LeadAcidCellDemo({ figure }: Props) {
  const [mode, setMode] = useState<'discharge' | 'charge' | 'idle'>('idle');
  const [soc, setSoc] = useState(1.0);

  // SG, V per cell as linear functions of SOC (rough)
  const SG = SG_EMPTY + (SG_FULL - SG_EMPTY) * soc;
  const V_cell = V_EMPTY + (V_FULL - V_EMPTY) * soc;

  useEffect(() => {
    if (mode === 'idle') return;
    const dir = mode === 'discharge' ? -1 : +1;
    const id = window.setInterval(() => {
      setSoc((s) => Math.max(0, Math.min(1, s + dir * 0.01)));
    }, 80);
    return () => window.clearInterval(id);
  }, [mode]);

  const stateRef = useSimState({ soc, SG, V_cell });
  const setup = useSimLoop(
    stateRef,
    ({ ctx, w: W, h: H, colors }, _state, _dt, _simTime) => {
      const s = stateRef.current;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, W, H);
      const jarX = 40,
        jarY = 30;
      const jarW = W - 80,
        jarH = H - 70;
      ctx.strokeStyle = colors.borderStrong;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(jarX, jarY, jarW, jarH);
      const acidAlpha = 0.1 + 0.18 * s.soc;
      ctx.fillStyle = withAlpha(colors.accent, acidAlpha);
      ctx.fillRect(jarX + 2, jarY + 12, jarW - 4, jarH - 14);
      const plateW = 36;
      const gap = 30;
      const negX = jarX + jarW / 2 - gap / 2 - plateW;
      const posX = jarX + jarW / 2 + gap / 2;
      const plateY = jarY + 14;
      const plateH = jarH - 22;
      ctx.fillStyle = '#7d8082';
      ctx.fillRect(negX, plateY, plateW, plateH);
      ctx.fillStyle = '#3e3232';
      ctx.fillRect(posX, plateY, plateW, plateH);
      const dischargeFrac = 1 - s.soc;
      if (dischargeFrac > 0.02) {
        ctx.fillStyle = withAlpha(colors.text, 0.3 + 0.5 * dischargeFrac);
        const nodCount = Math.floor(dischargeFrac * 60);
        for (let i = 0; i < nodCount; i++) {
          // Use deterministic-ish pattern from i for stability
          const seed = (i * 2654435761) >>> 0;
          const r1 = (seed & 0xffff) / 0xffff;
          const r2 = ((seed >>> 16) & 0xffff) / 0xffff;
          const py = plateY + 6 + r1 * (plateH - 12);
          ctx.beginPath();
          ctx.arc(negX + 4 + r2 * (plateW - 8), py, 1.6, 0, Math.PI * 2);
          ctx.arc(posX + 4 + r2 * (plateW - 8), py, 1.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.fillStyle = colors.textDim;
      drawLabel(ctx, { text: 'Pb', x: negX + plateW / 2, y: plateY - 2, font: '10px "JetBrains Mono", monospace', align: 'center', baseline: 'bottom' });
      drawLabel(ctx, { text: 'PbO₂', x: posX + plateW / 2, y: plateY - 2, font: '10px "JetBrains Mono", monospace', align: 'center', baseline: 'bottom' });
      drawLabel(ctx, { text: 'H₂SO₄(aq)', x: jarX + 8, y: jarY + jarH - 16, font: '10px "JetBrains Mono", monospace', baseline: 'top' });
      ctx.save();
      ctx.globalAlpha = 0.75;
      drawLabel(ctx, { text: 'discharge:  Pb + PbO₂ + 2 H₂SO₄  →  2 PbSO₄ + 2 H₂O', x: jarX, y: jarY + jarH + 10, baseline: 'top' });
      ctx.restore();
    },
    [],
  );

  return (
    <Demo
      figure={figure ?? 'Fig. 19.1'}
      title="Lead-acid: rechargeable since 1859"
      question="What does discharging actually do to the plates?"
      caption={
        <>
          On discharge, both Pb and PbO₂ pick up sulphate ions to form
          <strong> PbSO₄</strong> on the plate surfaces, and the acid loses sulphate (specific
          gravity drops from
          <strong> ~1.27</strong> to <strong>~1.10</strong>). Charging drives the reaction
          backwards. Energy density is modest (~30–40 Wh/kg) but the cell can deliver hundreds of
          amps for the brief job of cranking an engine.
        </>
      }
    >
      <AutoResizeCanvas height={260} setup={setup} />
      <DemoControls>
        <MiniToggle
          label="Discharge"
          checked={mode === 'discharge'}
          onChange={(v) => setMode(v ? 'discharge' : 'idle')}
        />
        <MiniToggle
          label="Charge"
          checked={mode === 'charge'}
          onChange={(v) => setMode(v ? 'charge' : 'idle')}
        />
        <button
          type="button"
          className="mini-toggle"
          onClick={() => {
            setSoc(1.0);
            setMode('idle');
          }}
        >
          Reset (full)
        </button>
        <MiniReadout label="SOC" value={(soc * 100).toFixed(0) + ' %'} />
        <MiniReadout label="specific gravity" value={<Num value={SG} />} />
        <MiniReadout label="V_cell" value={<Num value={V_cell} />} unit="V" />
      </DemoControls>
    </Demo>
  );
}
