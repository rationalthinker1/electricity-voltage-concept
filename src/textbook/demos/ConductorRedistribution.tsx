/**
 * Demo D1.5 — Conductor vs insulator
 *
 * A box of free charges. In a conductor, charges spread out to the boundary
 * and the inside field cancels. In an insulator, they stay where they're put.
 * Toggle and watch.
 */
import { useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniToggle } from '@/components/Demo';
import { withAlpha } from '@/lib/canvasTheme';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

interface Props {
  figure?: string;
}

interface Charge {
  x: number; // canvas px
  y: number;
  vx: number;
  vy: number;
  ix: number; // initial position (insulator mode pins to this)
  iy: number;
}

export function ConductorRedistributionDemo({ figure }: Props) {
  const [conductor, setConductor] = useState(true);
  const stateRef = useSimState({ conductor });

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, colors }, _state, _dt, _simTime, charges: Charge[]) => {
      const s = stateRef.current;
      const N = charges.length;
      const padX = 80,
        padY = 40;

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      // Container box
      ctx.strokeStyle = s.conductor ? withAlpha(colors.teal, 0.7) : withAlpha(colors.text, 0.25);
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.strokeRect(padX, padY, w - 2 * padX, h - 2 * padY);
      ctx.setLineDash([]);
      ctx.fillStyle = s.conductor ? colors.teal : withAlpha(colors.textDim, 0.6);
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(
        s.conductor ? 'CONDUCTOR  →  charges free to move' : 'INSULATOR  →  charges pinned in place',
        padX,
        padY - 12,
      );

      if (s.conductor) {
        // Mutually-repel + box-confined → settle on the boundary
        for (let i = 0; i < N; i++) {
          const a = charges[i]!;
          let fx = 0,
            fy = 0;
          for (let j = 0; j < N; j++) {
            if (i === j) continue;
            const b = charges[j]!;
            const dx = a.x - b.x,
              dy = a.y - b.y;
            const d2 = dx * dx + dy * dy + 12;
            const inv = 60 / d2;
            fx += dx * inv;
            fy += dy * inv;
          }
          a.vx = (a.vx + fx) * 0.6;
          a.vy = (a.vy + fy) * 0.6;
          a.x += a.vx;
          a.y += a.vy;
          // Confine to box (bounce / clip)
          if (a.x < padX + 4) {
            a.x = padX + 4;
            a.vx = Math.abs(a.vx) * 0.4;
          }
          if (a.x > w - padX - 4) {
            a.x = w - padX - 4;
            a.vx = -Math.abs(a.vx) * 0.4;
          }
          if (a.y < padY + 4) {
            a.y = padY + 4;
            a.vy = Math.abs(a.vy) * 0.4;
          }
          if (a.y > h - padY - 4) {
            a.y = h - padY - 4;
            a.vy = -Math.abs(a.vy) * 0.4;
          }
        }
      } else {
        // Insulator: each charge slowly drifts back to its initial pin location.
        for (let i = 0; i < N; i++) {
          const a = charges[i]!;
          a.x += (a.ix - a.x) * 0.05;
          a.y += (a.iy - a.y) * 0.05;
        }
      }

      // Render
      ctx.fillStyle = withAlpha(colors.blue, 0.95);
      for (const c of charges) {
        ctx.beginPath();
        ctx.arc(c.x, c.y, 2.4, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    [],
    (info) => {
      const { w, h } = info;
      const N = 60;
      const padX = 80,
        padY = 40;
      const charges: Charge[] = [];
      // Initial random cluster in the left third of the box
      for (let i = 0; i < N; i++) {
        const ix = padX + Math.random() * (w * 0.3 - padX);
        const iy = padY + Math.random() * (h - 2 * padY);
        charges.push({ x: ix, y: iy, vx: 0, vy: 0, ix, iy });
      }
      return { context: charges };
    },
  );

  return (
    <Demo
      figure={figure ?? 'Fig. 1.5'}
      title="Conductor vs. insulator"
      question="What's the actual difference between a metal and a plastic?"
      caption={
        <>
          Same charges, same box. Toggle the material. In a conductor every charge can move and they
          redistribute on the surface — the inside field cancels itself out. In an insulator the
          charges stay pinned and the field inside is whatever the charges put there.
        </>
      }
    >
      <AutoResizeCanvas height={260} setup={setup} />
      <DemoControls>
        <MiniToggle
          label={conductor ? 'Conductor' : 'Insulator'}
          checked={conductor}
          onChange={setConductor}
        />
      </DemoControls>
    </Demo>
  );
}
