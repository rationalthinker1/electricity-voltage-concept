/**
 * Demo D1.4 — Field of two charges (dipole / pair)
 *
 * Heatmap + equipotential rings. Toggle between dipole (+,−) and like-pair (+,+).
 * Tiny canvas-only viz, no probe.
 */
import { useCallback, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniToggle } from '@/components/Demo';
import { drawCharge } from '@/lib/canvasPrimitives';
import { PHYS } from '@/lib/physics';

interface Props { figure?: string }

export function EquipotentialsDemo({ figure }: Props) {
  const [dipole, setDipole] = useState(true);     // +,− vs +,+

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, colors } = info;
    const q1NC = +5;
    const q2NC = dipole ? -5 : +5;

    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, w, h);

    const cy = h / 2;
    const cx1 = w * 0.35, cx2 = w * 0.65;
    const PX_PER_M = 1000; // 1 px = 1 mm

    function V(x: number, y: number): number {
      const r1 = Math.hypot(x - cx1, y - cy) / PX_PER_M;
      const r2 = Math.hypot(x - cx2, y - cy) / PX_PER_M;
      return PHYS.k * (q1NC * 1e-9 / Math.max(r1, 1e-3) + q2NC * 1e-9 / Math.max(r2, 1e-3));
    }

    // Heatmap (coarse)
    const cell = 6;
    for (let y = 0; y < h; y += cell) {
      for (let x = 0; x < w; x += cell) {
        const v = V(x, y);
        if (Math.abs(v) < 1) continue;
        const t = Math.tanh(v / 200);
        if (t > 0) ctx.fillStyle = `rgba(255,59,110,${Math.abs(t) * 0.10})`;
        else ctx.fillStyle = `rgba(91,174,248,${Math.abs(t) * 0.10})`;
        ctx.fillRect(x, y, cell, cell);
      }
    }

    // Equipotential bands
    const levels = [-1000, -500, -200, -100, -50, -20, 20, 50, 100, 200, 500, 1000];
    const step = 4;
    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        const v = V(x, y);
        for (const L of levels) {
          if (Math.abs(v - L) < Math.abs(L) * 0.05 + 1.5) {
            ctx.fillStyle = colors.tealSoft;
            ctx.fillRect(x, y, 2, 2);
          }
        }
      }
    }

    // Charges
    drawCharge(ctx, { x: cx1, y: cy }, {
      color: '#ff3b6e',
      label: 'Q₁',
      radius: 14,
      sign: '+',
      textColor: '#0a0a0b',
    });
    drawCharge(ctx, { x: cx2, y: cy }, {
      color: dipole ? '#5baef8' : '#ff3b6e',
      label: 'Q₂',
      radius: 14,
      sign: dipole ? '−' : '+',
      textColor: '#0a0a0b',
    });
  }, [dipole]);

  return (
    <Demo
      figure={figure ?? 'Fig. 1.4'}
      title="Two charges, two patterns"
      question="Same sign or opposite — what does the field look like?"
      caption={<>
        Color tints show the sign of the potential (pink + / blue −). Teal dots are bands of constant <strong>V</strong> — equipotentials, the contour lines of the field. Toggle the second charge to flip the topology between a dipole and a like-pair.
      </>}
      deeperLab={{ slug: 'potential', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        <MiniToggle
          label={dipole ? 'Dipole (+, −)' : 'Like pair (+, +)'}
          checked={dipole}
          onChange={setDipole}
        />
      </DemoControls>
    </Demo>
  );
}
