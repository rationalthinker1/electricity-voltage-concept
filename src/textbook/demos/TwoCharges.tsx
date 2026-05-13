/**
 * Demo D1.1 — Two point charges
 *
 * The simplest possible interactive electrostatics demo: two charges, each
 * with a sign toggle, drawn with a force vector that points the right way.
 * Reader plays with same-sign vs opposite-sign and watches attraction flip.
 */
import { useCallback, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import {
  Demo, DemoControls, MiniReadout, MiniSlider, MiniToggle,
} from '@/components/Demo';
import { Num } from '@/components/Num';
import { drawArrow, drawCharge } from '@/lib/canvasPrimitives';
import { PHYS } from '@/lib/physics';

interface Props {
  figure?: string;
}

export function TwoChargesDemo({ figure }: Props) {
  const [q1Pos, setQ1Pos] = useState(true);   // true = +, false = −
  const [q2Pos, setQ2Pos] = useState(false);
  const [magNC, setMagNC] = useState(5);      // shared magnitude in nC
  const [rCm, setRCm] = useState(15);         // separation in cm

  // Computed force — used in both readout and arrow length
  const q1 = (q1Pos ? 1 : -1) * magNC * 1e-9;
  const q2 = (q2Pos ? 1 : -1) * magNC * 1e-9;
  const r = rCm * 1e-2;
  const F = (PHYS.k * q1 * q2) / (r * r);   // signed
  const sameSign = Math.sign(q1) === Math.sign(q2);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h } = info;
    const sameSign_ = q1Pos === q2Pos;
    const F_ = (PHYS.k * (q1Pos ? 1 : -1) * (q2Pos ? 1 : -1) * (magNC * 1e-9) ** 2) / ((rCm * 1e-2) ** 2);
    ctx.fillStyle = '#0d0d10';
    ctx.fillRect(0, 0, w, h);

    // Map cm to pixels: full canvas spans 30 cm → centered.
    const cmPerPx = 30 / w;
    const cy = h / 2;
    const cxMid = w / 2;
    const cx1 = cxMid - rCm / 2 / cmPerPx;
    const cx2 = cxMid + rCm / 2 / cmPerPx;

    // Distance line
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = 'rgba(255,255,255,.2)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx1, cy); ctx.lineTo(cx2, cy); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(160,158,149,.85)';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${rCm.toFixed(1)} cm`, cxMid, cy - 12);

    // Force arrows on each charge
    const arrowLen = Math.min(110, 24 + Math.log10(Math.abs(F_) + 1) * 13);
    const dir1 = sameSign_ ? -1 : +1; // points from 1 toward 2 if attractive
    if (Math.abs(F_) > 1e-30) {
      drawArrow(ctx, { x: cx1 + dir1 * 18, y: cy }, { x: cx1 + dir1 * arrowLen, y: cy }, {
        color: 'rgba(255,107,42,0.95)',
        lineWidth: 2,
      });
      drawArrow(ctx, { x: cx2 - dir1 * 18, y: cy }, { x: cx2 - dir1 * arrowLen, y: cy }, {
        color: 'rgba(255,107,42,0.95)',
        lineWidth: 2,
      });
    }

    // Charges
    drawCharge(ctx, { x: cx1, y: cy }, {
      color: q1Pos ? '#ff3b6e' : '#5baef8',
      label: 'Q₁',
      radius: 12 + Math.min(8, magNC * 0.7),
      sign: q1Pos ? '+' : '−',
      textColor: '#0a0a0b',
    });
    drawCharge(ctx, { x: cx2, y: cy }, {
      color: q2Pos ? '#ff3b6e' : '#5baef8',
      label: 'Q₂',
      radius: 12 + Math.min(8, magNC * 0.7),
      sign: q2Pos ? '+' : '−',
      textColor: '#0a0a0b',
    });
  }, [q1Pos, q2Pos, magNC, rCm]);

  return (
    <Demo
      figure={figure ?? 'Fig. 1.1'}
      title="Two point charges"
      question="Same sign or opposite — what changes?"
      caption="Toggle the signs to flip attraction and repulsion. The arrow length grows like log|F| because the force changes by orders of magnitude as you slide the separation."
      deeperLab={{ slug: 'coulomb', label: 'See full lab' }}
    >
      <div style={{ position: 'relative' }}>
        <AutoResizeCanvas height={260} setup={setup} />
      </div>
      <DemoControls>
        <MiniToggle label={`Q₁ ${q1Pos ? '+' : '−'}`} checked={q1Pos} onChange={setQ1Pos} />
        <MiniToggle label={`Q₂ ${q2Pos ? '+' : '−'}`} checked={q2Pos} onChange={setQ2Pos} />
        <MiniSlider
          label="|Q|"
          value={magNC} min={0.1} max={10} step={0.1}
          format={v => v.toFixed(1) + ' nC'}
          onChange={setMagNC}
        />
        <MiniSlider
          label="separation"
          value={rCm} min={2} max={28} step={0.1}
          format={v => v.toFixed(1) + ' cm'}
          onChange={setRCm}
        />
        <MiniReadout
          label={sameSign ? 'Repulsive |F|' : 'Attractive |F|'}
          value={<Num value={Math.abs(F)} />}
          unit="N"
        />
      </DemoControls>
    </Demo>
  );
}
