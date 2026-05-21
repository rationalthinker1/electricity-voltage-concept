/**
 * Demo D8.4 — Ampère–Maxwell law
 *
 * A parallel-plate capacitor connected by wires to a battery. Current I flows
 * in the wires; charge accumulates on the plates; between the plates there is
 * no conduction current — only a growing E-field.
 *
 * Around the wires, B circles by Ampère: ∮B·dℓ = μ₀I.
 * Around a circle in the gap, no current pierces — yet B *still* circulates,
 * because Maxwell's displacement-current term ε₀ dΦ_E/dt restores the count.
 *
 * Slider sets the current I (the rate of charge buildup). The visualization
 * draws B-field circles around BOTH the wires AND the gap, with matching
 * magnitudes — illustrating that the displacement current "stands in" for the
 * missing conduction current.
 */
import { useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';
import { drawLabel } from '@/lib/canvasLayout';
import { drawWire } from '@/lib/canvasPrimitives';
import { withAlpha } from '@/lib/canvasTheme';
import { PHYS } from '@/lib/physics';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

interface Props {
  figure?: string;
}

export function AmpereMaxwellLawDemo({ figure }: Props) {
  const [I, setI] = useState(2); // amps
  const [r_mm, setR_mm] = useState(8); // radius of Amperian loop, mm

  const stateRef = useSimState({ I, r_mm });
  // Around the wire: B = μ₀ I / (2π r). Same value in the gap by ε₀ dΦ_E/dt.
  const r_m = r_mm * 1e-3;
  const B = (PHYS.mu_0 * I) / (2 * Math.PI * r_m);
  // Displacement current = conduction current (by continuity)
  const I_disp = I;

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, colors }, _state, _dt, _simTime, ctx0) => {
      let phase = ctx0.phase;
      const { I, r_mm } = stateRef.current;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);
      const cy = h / 2;
      const battX = 60;
      const plate1X = w * 0.4;
      const plate2X = w * 0.6;
      const endX = w - 60;
      drawWire(
        ctx,
        [
          { x: battX, y: cy },
          { x: plate1X, y: cy },
        ],
        {
          color: withAlpha(colors.accent, 0.8),
          lineWidth: 3,
        },
      );
      drawWire(
        ctx,
        [
          { x: plate2X, y: cy },
          { x: endX, y: cy },
        ],
        {
          color: withAlpha(colors.accent, 0.8),
          lineWidth: 3,
        },
      );
      ctx.fillStyle = colors.pink;
      ctx.fillRect(battX - 8, cy - 18, 4, 36);
      ctx.fillStyle = colors.blue;
      ctx.fillRect(battX - 16, cy - 10, 4, 20);
      ctx.fillStyle = colors.textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('battery', battX - 10, cy + 22);
      const plateH = 80;
      ctx.fillStyle = colors.accent;
      ctx.fillRect(plate1X - 3, cy - plateH / 2, 4, plateH);
      ctx.fillRect(plate2X, cy - plateH / 2, 4, plateH);
      ctx.fillStyle = colors.pink;
      ctx.font = 'bold 14px JetBrains Mono';
      ctx.textBaseline = 'middle';
      ctx.fillText('+', plate1X - 18, cy - plateH / 2 - 14);
      ctx.fillStyle = colors.blue;
      ctx.fillText('−', plate2X + 18, cy - plateH / 2 - 14);
      const nLines = 5;
      for (let i = 0; i < nLines; i++) {
        const y = cy - plateH / 2 + (i + 0.5) * (plateH / nLines);
        ctx.save();
        ctx.globalAlpha = 0.7;
        ctx.strokeStyle = colors.pink;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(plate1X + 4, y);
        ctx.lineTo(plate2X - 6, y);
        ctx.stroke();
        ctx.restore();
        // arrowhead
        ctx.fillStyle = colors.pink;
        ctx.beginPath();
        ctx.moveTo(plate2X - 6, y);
        ctx.lineTo(plate2X - 12, y - 3);
        ctx.lineTo(plate2X - 12, y + 3);
        ctx.closePath();
        ctx.fill();
      }
      ctx.fillStyle = colors.pink;
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('E growing', (plate1X + plate2X) / 2, cy + plateH / 2 + 6);
      ctx.save();
      ctx.globalAlpha = 0.75;
      ctx.fillStyle = colors.textDim;
      ctx.fillText('∂E/∂t = displacement current', (plate1X + plate2X) / 2, cy + plateH / 2 + 22);
      ctx.restore();
      const loopY_off = 0;
      const radiusPx = Math.min(60, Math.max(18, r_mm * 4));
      const positions = [
        { x: (battX + plate1X) / 2, label: '∮B·dℓ = μ₀ I', kind: 'conduction' as const },
        {
          x: (plate1X + plate2X) / 2,
          label: '∮B·dℓ = μ₀ ε₀ dΦ_E/dt',
          kind: 'displacement' as const,
        },
        { x: (plate2X + endX) / 2, label: '∮B·dℓ = μ₀ I', kind: 'conduction' as const },
      ];
      phase = (performance.now() / 2000) % 1;
      for (const p of positions) {
        // Two ellipses (top + bottom) — a side-view "ring" around the wire / gap
        ctx.strokeStyle =
          p.kind === 'displacement' ? withAlpha(colors.teal, 0.95) : withAlpha(colors.teal, 0.7);
        ctx.lineWidth = 1.4;
        ctx.setLineDash(p.kind === 'displacement' ? [4, 3] : []);
        ctx.beginPath();
        ctx.ellipse(p.x, cy + loopY_off, radiusPx, radiusPx * 0.32, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // arrows along the ellipse (CCW viewed from +x ≈ current direction)
        const nArr = 4;
        for (let i = 0; i < nArr; i++) {
          const a = (i / nArr) * Math.PI * 2 + phase * Math.PI * 2;
          const ax = p.x + radiusPx * Math.cos(a);
          const ay = cy + loopY_off + radiusPx * 0.32 * Math.sin(a);
          // tangent direction
          const tx = -Math.sin(a);
          const ty = Math.cos(a) * 0.32;
          const tLen = Math.hypot(tx, ty);
          const tnx = tx / tLen,
            tny = ty / tLen;
          const L = 6;
          ctx.strokeStyle = colors.teal;
          ctx.fillStyle = colors.teal;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(ax - (tnx * L) / 2, ay - (tny * L) / 2);
          ctx.lineTo(ax + (tnx * L) / 2, ay + (tny * L) / 2);
          ctx.stroke();
          // head
          const hx = ax + (tnx * L) / 2;
          const hy = ay + (tny * L) / 2;
          const nnx = -tny,
            nny = tnx;
          ctx.beginPath();
          ctx.moveTo(hx, hy);
          ctx.lineTo(hx - tnx * 3 + nnx * 2, hy - tny * 3 + nny * 2);
          ctx.lineTo(hx - tnx * 3 - nnx * 2, hy - tny * 3 - nny * 2);
          ctx.closePath();
          ctx.fill();
        }

        // Label
        drawLabel(ctx, {
          x: p.x,
          y: cy - radiusPx * 0.32 - 10,
          text: p.label,
          color:
            p.kind === 'displacement'
              ? withAlpha(colors.teal, 0.95)
              : withAlpha(colors.textDim, 0.85),
          align: 'center',
          baseline: 'bottom',
        });
      }
      drawLabel(ctx, {
        x: battX + 30,
        y: cy + 18,
        text: `I = ${I.toFixed(2)} A →`,
        color: colors.accent,
        size: 11,
        baseline: 'middle',
      });
      ctx0.phase = phase;
    },
    [],
    () => ({ context: { phase: 0 } }),
  );

  return (
    <Demo
      figure={figure ?? 'Fig. 8.4'}
      title="Ampère–Maxwell law"
      question="If no current flows between the plates, why is there a B-field there?"
      caption={
        <>
          Pick an Amperian loop around the wire and you get <strong>∮B·dℓ = μ₀I</strong>. Slide it
          across to a loop between the plates — no conduction current pierces it — and Ampère alone
          gives zero. Maxwell's fix: a changing electric flux <em>also</em> sources a circulating B.
          The two contributions match exactly across the gap, because the displacement current{' '}
          <strong>ε₀ dΦ_E/dt</strong> equals the conduction current charging the plates.
        </>
      }
      deeperLab={{ slug: 'ampere', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={320} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="I"
          value={I}
          min={0.01}
          max={10}
          step={0.01}
          format={(v) => v.toFixed(2) + ' A'}
          onChange={setI}
        />
        <MiniSlider
          label="loop r"
          value={r_mm}
          min={2}
          max={20}
          step={0.5}
          format={(v) => v.toFixed(1) + ' mm'}
          onChange={setR_mm}
        />
        <MiniReadout label="|B| at r" value={<Num value={B} digits={2} />} unit="T" />
        <MiniReadout label="I_disp" value={<Num value={I_disp} digits={2} />} unit="A" />
      </DemoControls>
    </Demo>
  );
}
