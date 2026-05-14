/**
 * Demo D1.5 — Conductor vs insulator
 *
 * A box of free charges. In a conductor, charges spread out to the boundary
 * and the inside field cancels. In an insulator, they stay where they're put.
 * Toggle and watch.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniToggle } from '@/components/Demo';

interface Props { figure?: string }

interface Charge {
  x: number;     // canvas px
  y: number;
  vx: number;
  vy: number;
  ix: number;    // initial position (insulator mode pins to this)
  iy: number;
}

export function ConductorRedistributionDemo({ figure }: Props) {
  const [conductor, setConductor] = useState(true);
  const stateRef = useRef({ conductor });
  useEffect(() => { stateRef.current = { conductor }; }, [conductor]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, colors } = info;
    let raf = 0;

    const N = 60;
    const padX = 80, padY = 40;
    const charges: Charge[] = [];
    let lastFrame = 0;
    // Initial random cluster in the left third of the box
    for (let i = 0; i < N; i++) {
      const ix = padX + Math.random() * (w * 0.3 - padX);
      const iy = padY + Math.random() * (h - 2 * padY);
      charges.push({ x: ix, y: iy, vx: 0, vy: 0, ix, iy });
    }

    function draw(now = performance.now()) {
      if (now - lastFrame < 1000 / 30) {
        raf = requestAnimationFrame(draw);
        return;
      }
      lastFrame = now;
      const { conductor } = stateRef.current;

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      // Container box
      ctx.strokeStyle = conductor ? 'rgba(108,197,194,.7)' : 'rgba(255,255,255,.25)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.strokeRect(padX, padY, w - 2 * padX, h - 2 * padY);
      ctx.setLineDash([]);
      ctx.fillStyle = conductor ? '#6cc5c2' : 'rgba(160,158,149,.6)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(conductor ? 'CONDUCTOR  →  charges free to move' : 'INSULATOR  →  charges pinned in place', padX, padY - 12);

      if (conductor) {
        // Mutually-repel + box-confined → settle on the boundary
        for (let i = 0; i < N; i++) {
          const a = charges[i]!;
          let fx = 0, fy = 0;
          for (let j = 0; j < N; j++) {
            if (i === j) continue;
            const b = charges[j]!;
            const dx = a.x - b.x, dy = a.y - b.y;
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
          if (a.x < padX + 4) { a.x = padX + 4; a.vx = Math.abs(a.vx) * 0.4; }
          if (a.x > w - padX - 4) { a.x = w - padX - 4; a.vx = -Math.abs(a.vx) * 0.4; }
          if (a.y < padY + 4) { a.y = padY + 4; a.vy = Math.abs(a.vy) * 0.4; }
          if (a.y > h - padY - 4) { a.y = h - padY - 4; a.vy = -Math.abs(a.vy) * 0.4; }
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
      for (const c of charges) {
        ctx.fillStyle = 'rgba(91,174,248,.95)';
        ctx.beginPath();
        ctx.arc(c.x, c.y, 2.4, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 1.5'}
      title="Conductor vs. insulator"
      question="What's the actual difference between a metal and a plastic?"
      caption={<>
        Same charges, same box. Toggle the material. In a conductor every charge can move and they redistribute on the surface — the inside field cancels itself out. In an insulator the charges stay pinned and the field inside is whatever the charges put there.
      </>}
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
