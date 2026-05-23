/**
 * Demo D1.4 — Field of two charges (dipole / pair)
 *
 * Heatmap + equipotential rings. Toggle between dipole (+,−) and like-pair (+,+).
 * Drag either charge with mouse or touch to reshape the field in real time.
 */
import { useCallback, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniToggle } from '@/components/Demo';
import { drawCharge } from '@/lib/canvasPrimitives';
import { getCanvasColors, withAlpha } from '@/lib/canvasTheme';
import { PHYS } from '@/lib/physics';
import { useSimState } from '@/lib/useSimState';

interface Props {
  figure?: string;
}

const CHARGE_RADIUS = 14;
const HIT_RADIUS = 22;
const TOUCH_HIT_RADIUS = 30;

export function EquipotentialsDemo({ figure }: Props) {
  const [dipole, setDipole] = useState(true); // +,− vs +,+
  // Positions stored as fractions of canvas width/height so they survive resizes.
  const [q1Frac, setQ1Frac] = useState({ x: 0.35, y: 0.5 });
  const [q2Frac, setQ2Frac] = useState({ x: 0.65, y: 0.5 });

  const stateRef = useSimState({ dipole, q1Frac, q2Frac });

  const setup = useCallback(
    (info: CanvasInfo) => {
      const { ctx, w, h, canvas } = info;
      const PX_PER_M = 1000; // 1 px = 1 mm

      let dragging: 'q1' | 'q2' | null = null;
      let dragOffsetX = 0;
      let dragOffsetY = 0;

      function getMouse(e: MouseEvent | TouchEvent): [number, number] {
        const r = canvas.getBoundingClientRect();
        const t = 'touches' in e ? e.touches[0] : e;
        if (!t) return [0, 0];
        return [t.clientX - r.left, t.clientY - r.top];
      }

      function hitTest(mx: number, my: number, radius: number): 'q1' | 'q2' | null {
        const { q1Frac: q1, q2Frac: q2 } = stateRef.current;
        const d2 = (px: number, py: number) => (mx - px) ** 2 + (my - py) ** 2;
        const d1 = d2(q1.x * w, q1.y * h);
        const dd2 = d2(q2.x * w, q2.y * h);
        const r2 = radius * radius;
        if (d1 < dd2 && d1 < r2) return 'q1';
        if (dd2 < r2) return 'q2';
        return null;
      }

      function clampFrac(x: number, y: number) {
        // Keep a comfortable margin so the charge stays in-canvas.
        const marginX = 0.05;
        const marginY = 0.08;
        return {
          x: Math.max(marginX, Math.min(1 - marginX, x)),
          y: Math.max(marginY, Math.min(1 - marginY, y)),
        };
      }

      function setPos(which: 'q1' | 'q2', frac: { x: number; y: number }) {
        if (which === 'q1') {
          stateRef.current.q1Frac = frac;
          setQ1Frac(frac);
        } else {
          stateRef.current.q2Frac = frac;
          setQ2Frac(frac);
        }
        draw();
      }

      function onMouseDown(e: MouseEvent) {
        const [mx, my] = getMouse(e);
        const hit = hitTest(mx, my, HIT_RADIUS);
        if (hit) {
          dragging = hit;
          const current = hit === 'q1' ? stateRef.current.q1Frac : stateRef.current.q2Frac;
          dragOffsetX = current.x * w - mx;
          dragOffsetY = current.y * h - my;
          canvas.style.cursor = 'grabbing';
        }
      }

      function onMouseMove(e: MouseEvent) {
        const [mx, my] = getMouse(e);
        if (dragging) {
          setPos(dragging, clampFrac((mx + dragOffsetX) / w, (my + dragOffsetY) / h));
        } else {
          canvas.style.cursor = hitTest(mx, my, HIT_RADIUS) ? 'grab' : 'default';
        }
      }

      function onMouseUp() {
        dragging = null;
        canvas.style.cursor = 'default';
      }

      function onTouchStart(e: TouchEvent) {
        const [mx, my] = getMouse(e);
        const hit = hitTest(mx, my, TOUCH_HIT_RADIUS);
        if (hit) {
          e.preventDefault();
          dragging = hit;
          const current = hit === 'q1' ? stateRef.current.q1Frac : stateRef.current.q2Frac;
          dragOffsetX = current.x * w - mx;
          dragOffsetY = current.y * h - my;
        }
      }

      function onTouchMove(e: TouchEvent) {
        if (!dragging) return;
        e.preventDefault();
        const [mx, my] = getMouse(e);
        setPos(dragging, clampFrac((mx + dragOffsetX) / w, (my + dragOffsetY) / h));
      }

      function onTouchEnd() {
        dragging = null;
      }

      function draw() {
        const colors = getCanvasColors();
        const { dipole: isDipole, q1Frac: q1, q2Frac: q2 } = stateRef.current;
        const q1NC = +5;
        const q2NC = isDipole ? -5 : +5;
        const cx1 = q1.x * w;
        const cy1 = q1.y * h;
        const cx2 = q2.x * w;
        const cy2 = q2.y * h;

        ctx.fillStyle = colors.bg;
        ctx.fillRect(0, 0, w, h);

        function V(x: number, y: number): number {
          const r1 = Math.hypot(x - cx1, y - cy1) / PX_PER_M;
          const r2 = Math.hypot(x - cx2, y - cy2) / PX_PER_M;
          return PHYS.k * ((q1NC * 1e-9) / Math.max(r1, 1e-3) + (q2NC * 1e-9) / Math.max(r2, 1e-3));
        }

        // Heatmap (coarse)
        const cell = 6;
        for (let y = 0; y < h; y += cell) {
          for (let x = 0; x < w; x += cell) {
            const v = V(x, y);
            if (Math.abs(v) < 1) continue;
            const t = Math.tanh(v / 200);
            if (t > 0) ctx.fillStyle = withAlpha(colors.pink, Math.abs(t) * 0.1);
            else ctx.fillStyle = withAlpha(colors.blue, Math.abs(t) * 0.1);
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
                break;
              }
            }
          }
        }

        // Charges
        drawCharge(
          ctx,
          { x: cx1, y: cy1 },
          {
            color: colors.pink,
            label: 'Q₁',
            radius: CHARGE_RADIUS,
            sign: '+',
            textColor: colors.canvasBg,
          },
        );
        drawCharge(
          ctx,
          { x: cx2, y: cy2 },
          {
            color: isDipole ? colors.blue : colors.pink,
            label: 'Q₂',
            radius: CHARGE_RADIUS,
            sign: isDipole ? '−' : '+',
            textColor: colors.canvasBg,
          },
        );
      }

      canvas.style.touchAction = 'none';
      canvas.addEventListener('mousedown', onMouseDown);
      canvas.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      canvas.addEventListener('touchstart', onTouchStart, { passive: false });
      canvas.addEventListener('touchmove', onTouchMove, { passive: false });
      canvas.addEventListener('touchend', onTouchEnd);

      draw();

      return () => {
        canvas.removeEventListener('mousedown', onMouseDown);
        canvas.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        canvas.removeEventListener('touchstart', onTouchStart);
        canvas.removeEventListener('touchmove', onTouchMove);
        canvas.removeEventListener('touchend', onTouchEnd);
        canvas.style.cursor = '';
        canvas.style.touchAction = '';
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dipole],
  );

  return (
    <Demo
      figure={figure ?? 'Fig. 1.4'}
      title="Two charges, two patterns"
      question="Same sign or opposite — what does the field look like?"
      caption={
        <>
          Color tints show the sign of the potential (pink + / blue −). Teal dots are bands of
          constant <strong>V</strong> — equipotentials, the contour lines of the field. Drag either
          charge to move it; toggle the second charge to flip the topology between a dipole and a
          like-pair.
        </>
      }
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
