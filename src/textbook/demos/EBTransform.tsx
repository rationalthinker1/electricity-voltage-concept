/**
 * Demo D9.3 — How E and B transform under a Lorentz boost
 *
 * Start with a pure E_y field (e.g. between the plates of a capacitor at
 * rest). Boost the observer with velocity β in the +x direction. In the
 * new frame the components are
 *   E_x'  = E_x
 *   E_y'  = γ ( E_y - v · B_z ) = γ · E_y     (since B_z = 0 here)
 *   E_z'  = γ ( E_z + v · B_y ) = 0
 *   B_x'  = B_x
 *   B_y'  = γ ( B_y + v · E_z / c² ) = 0
 *   B_z'  = γ ( B_z - v · E_y / c² ) = -γ β · E_y / c
 *
 * So a pure electric field, viewed from a moving frame, picks up a
 * magnetic component. The new B is perpendicular to both the original E
 * and the boost direction. At β → 1, |c·B'| approaches |E'|, i.e. the two
 * are comparable. The visual shows the initial pure-E field as upward pink
 * arrows, and the induced B in the moving frame as small teal dots/crosses
 * indicating the out-of-page / into-page B_z'.
 */
import { useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';
import { PHYS } from '@/lib/physics';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';
import { drawLabel } from "@/lib/canvasLayout";

interface Props {
  figure?: string;
}

export function EBTransformDemo({ figure }: Props) {
  const [betaPct, setBetaPct] = useState(30);
  const [Ey, setEy] = useState(1.0e6); // V/m  (a strong but reasonable capacitor field)

  const stateRef = useSimState({ betaPct, Ey });
  const beta = Math.max(0, Math.min(0.999, betaPct / 100));
  const gamma = 1 / Math.sqrt(1 - beta * beta);
  const Ey_new = gamma * Ey;
  const Bz_new = (-gamma * beta * Ey) / PHYS.c; // tesla
  const cB_over_E = Ey_new !== 0 ? Math.abs(PHYS.c * Bz_new) / Math.abs(Ey_new) : 0;

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, colors }, _state, _dt, _simTime) => {
      const s = stateRef.current;
      const b = Math.max(0, Math.min(0.999, s.betaPct / 100));
      const g = 1 / Math.sqrt(1 - b * b);
      const induced = g * b;
      void g;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      const gs = 36;
      for (let x = gs / 2; x < w; x += gs) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = gs / 2; y < h; y += gs) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      const midX = w / 2;
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(midX, 14);
      ctx.lineTo(midX, h - 14);
      ctx.stroke();
      ctx.fillStyle = colors.textDim;
      drawLabel(ctx, { text: 'REST FRAME · pure E_y', x: midX / 2, y: 18, font: '10px "JetBrains Mono", monospace', align: 'center' });
      drawLabel(ctx, { text: `BOOSTED FRAME · β = ${b.toFixed(2)} →`, x: midX + midX / 2, y: 18, font: '10px "JetBrains Mono", monospace', align: 'center' });
      function drawE(left: number, right: number, scale: number) {
        ctx.strokeStyle = colors.pink;
        ctx.fillStyle = colors.pink;
        ctx.lineWidth = 1.5;
        const cols = 4,
          rows = 4;
        const dx = (right - left) / cols;
        const dy = (h - 60) / rows;
        const arrLen = 28 * scale;
        for (let i = 0; i < cols; i++) {
          for (let j = 0; j < rows; j++) {
            const cx = left + (i + 0.5) * dx;
            const cy = 36 + (j + 0.5) * dy;
            const yTop = cy - arrLen / 2;
            const yBot = cy + arrLen / 2;
            ctx.beginPath();
            ctx.moveTo(cx, yBot);
            ctx.lineTo(cx, yTop);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(cx, yTop);
            ctx.lineTo(cx - 4, yTop + 7);
            ctx.lineTo(cx + 4, yTop + 7);
            ctx.closePath();
            ctx.fill();
          }
        }
      }
      function drawB(left: number, right: number, strength: number) {
        const density = Math.min(1, strength);
        const op = 0.15 + 0.65 * density;
        ctx.strokeStyle = `rgba(108,197,194,${op.toFixed(3)})`;
        ctx.lineWidth = 1.2;
        const cols = 7,
          rows = 7;
        const dx = (right - left) / cols;
        const dy = (h - 50) / rows;
        const k = 3 + 4 * density;
        for (let i = 0; i < cols; i++) {
          for (let j = 0; j < rows; j++) {
            const cx = left + (i + 0.5) * dx;
            const cy = 30 + (j + 0.5) * dy;
            // alternate × and · so the pattern reads "into page B"
            ctx.beginPath();
            ctx.moveTo(cx - k, cy - k);
            ctx.lineTo(cx + k, cy + k);
            ctx.moveTo(cx + k, cy - k);
            ctx.lineTo(cx - k, cy + k);
            ctx.stroke();
          }
        }
      }
      drawE(24, midX - 12, 1);
      drawE(midX + 12, w - 24, Math.min(1.5, g));
      if (induced > 0.01) {
        drawB(midX + 12, w - 24, induced);
      }
      drawLabel(ctx, { text: "B_z'  (induced, into page)", x: midX + 18, y: h - 18, color: colors.teal, font: '10px "JetBrains Mono", monospace' });
      drawLabel(ctx, { text: "E_y'  = γ·E_y", x: midX + 18, y: h - 34, color: colors.pink, font: '10px "JetBrains Mono", monospace' });
    },
    [],
  );

  return (
    <Demo
      figure={figure ?? 'Fig. 9.3'}
      title="A pure E field becomes E + B when you move"
      question="Start with E only. Boost. What does the new frame measure?"
      caption={
        <>
          Left: a pure electric field <em>E_y</em>, say between the plates of a stationary
          capacitor. Right: the same situation viewed from a frame moving in the <em>+x</em>{' '}
          direction at speed
          <em> v = βc</em>. The new frame sees a slightly stronger <em>E_y'</em> = γ·E_y{' '}
          <em>and</em> a magnetic field <em>B_z' = −γβ·E_y/c</em>. Crank β toward 1 and the ratio{' '}
          <em>|c·B'|/|E'|</em>
          approaches β — the two are of the same order. Whether a field is "electric" or "magnetic"
          is a question about your reference frame.
        </>
      }
    >
      <AutoResizeCanvas height={280} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="β"
          value={betaPct}
          min={0}
          max={99}
          step={1}
          format={(v) => (v / 100).toFixed(2)}
          onChange={setBetaPct}
        />
        <MiniSlider
          label="E_y (rest)"
          value={Ey}
          min={1e4}
          max={1e7}
          step={1e4}
          format={(v) => v.toExponential(1) + ' V/m'}
          onChange={setEy}
        />
        <MiniReadout label="γ" value={gamma.toFixed(4)} />
        <MiniReadout label="E_y'" value={<Num value={Ey_new} />} unit="V/m" />
        <MiniReadout label="B_z'" value={<Num value={Bz_new} />} unit="T" />
        <MiniReadout label="|cB'/E'|" value={cB_over_E.toFixed(3)} />
      </DemoControls>
    </Demo>
  );
}
