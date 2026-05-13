/**
 * Demo D1.1 — Two point charges
 *
 * The simplest possible interactive electrostatics demo: two charges, each
 * with a sign toggle, drawn with a force vector that points the right way.
 * Reader plays with same-sign vs opposite-sign and watches attraction flip.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import {
  Demo, DemoControls, MiniReadout, MiniSlider, MiniToggle,
} from '@/components/Demo';
import { Num } from '@/components/Num';
import { PHYS } from '@/lib/physics';

interface Props {
  figure?: string;
}

export function TwoChargesDemo({ figure }: Props) {
  const [q1Pos, setQ1Pos] = useState(true);   // true = +, false = −
  const [q2Pos, setQ2Pos] = useState(false);
  const [magNC, setMagNC] = useState(5);      // shared magnitude in nC
  const [rCm, setRCm] = useState(15);         // separation in cm

  const stateRef = useRef({ q1Pos, q2Pos, magNC, rCm });
  useEffect(() => { stateRef.current = { q1Pos, q2Pos, magNC, rCm }; }, [q1Pos, q2Pos, magNC, rCm]);

  // Computed force — used in both readout and arrow length
  const q1 = (q1Pos ? 1 : -1) * magNC * 1e-9;
  const q2 = (q2Pos ? 1 : -1) * magNC * 1e-9;
  const r = rCm * 1e-2;
  const F = (PHYS.k * q1 * q2) / (r * r);   // signed
  const sameSign = Math.sign(q1) === Math.sign(q2);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h } = info;
    let raf = 0;
    function draw() {
      const { q1Pos, q2Pos, magNC, rCm } = stateRef.current;
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
      function drawArrow(fromX: number, fromY: number, dirSign: number) {
        const tipX = fromX + dirSign * arrowLen;
        ctx.strokeStyle = 'rgba(255,107,42,0.95)';
        ctx.fillStyle = 'rgba(255,107,42,0.95)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(fromX + dirSign * 18, fromY);
        ctx.lineTo(tipX, fromY); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(tipX, fromY);
        ctx.lineTo(tipX - dirSign * 8, fromY - 5);
        ctx.lineTo(tipX - dirSign * 8, fromY + 5);
        ctx.closePath(); ctx.fill();
      }
      if (Math.abs(F_) > 1e-30) {
        drawArrow(cx1, cy, dir1);
        drawArrow(cx2, cy, -dir1);
      }

      // Charges
      drawCharge(ctx, cx1, cy, q1Pos ? '#ff3b6e' : '#5baef8', q1Pos, magNC, 'Q₁');
      drawCharge(ctx, cx2, cy, q2Pos ? '#ff3b6e' : '#5baef8', q2Pos, magNC, 'Q₂');

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

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

function drawCharge(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, color: string,
  positive: boolean, magNC: number, label: string,
) {
  const radius = 12 + Math.min(8, magNC * 0.7);
  const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 3);
  grd.addColorStop(0, color);
  grd.addColorStop(1, color + '00');
  ctx.fillStyle = grd;
  ctx.beginPath(); ctx.arc(cx, cy, radius * 3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#0a0a0b';
  ctx.font = `bold ${radius}px JetBrains Mono`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(positive ? '+' : '−', cx, cy);
  ctx.fillStyle = color;
  ctx.font = '10px JetBrains Mono';
  ctx.fillText(label, cx, cy + radius + 14);
}
