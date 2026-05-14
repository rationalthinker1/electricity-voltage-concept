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
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';
import { drawWire } from '@/lib/canvasPrimitives';
import { PHYS } from '@/lib/physics';

interface Props { figure?: string }

export function AmpereMaxwellLawDemo({ figure }: Props) {
  const [I, setI] = useState(2);          // amps
  const [r_mm, setR_mm] = useState(8);    // radius of Amperian loop, mm

  const stateRef = useRef({ I, r_mm });
  useEffect(() => { stateRef.current = { I, r_mm }; }, [I, r_mm]);

  // Around the wire: B = μ₀ I / (2π r). Same value in the gap by ε₀ dΦ_E/dt.
  const r_m = r_mm * 1e-3;
  const B = (PHYS.mu_0 * I) / (2 * Math.PI * r_m);
  // Displacement current = conduction current (by continuity)
  const I_disp = I;

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, colors } = info;
    let raf = 0;
    let phase = 0;

    function draw() {
      const { I, r_mm } = stateRef.current;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      const cy = h / 2;
      // Three points of interest, left-to-right: battery, plate1, plate2, end of right wire.
      const battX = 60;
      const plate1X = w * 0.40;
      const plate2X = w * 0.60;
      const endX = w - 60;

      // Top-down style view of the wire (drawn as a horizontal line); B-circles
      // are drawn around it at intervals (ellipses to suggest perspective).
      // Wires
      drawWire(ctx, [{ x: battX, y: cy }, { x: plate1X, y: cy }], {
        color: 'rgba(255,107,42,0.8)',
        lineWidth: 3,
      });
      drawWire(ctx, [{ x: plate2X, y: cy }, { x: endX, y: cy }], {
        color: 'rgba(255,107,42,0.8)',
        lineWidth: 3,
      });

      // Battery glyph (left)
      ctx.fillStyle = colors.pink;
      ctx.fillRect(battX - 8, cy - 18, 4, 36);
      ctx.fillStyle = colors.blue;
      ctx.fillRect(battX - 16, cy - 10, 4, 20);
      ctx.fillStyle = colors.textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText('battery', battX - 10, cy + 22);

      // Capacitor plates (vertical bars)
      const plateH = 80;
      ctx.fillStyle = colors.accent;
      ctx.fillRect(plate1X - 3, cy - plateH / 2, 4, plateH);
      ctx.fillRect(plate2X, cy - plateH / 2, 4, plateH);

      // Plate charge labels (+ on left plate, − on right)
      ctx.fillStyle = colors.pink;
      ctx.font = 'bold 14px JetBrains Mono';
      ctx.textBaseline = 'middle';
      ctx.fillText('+', plate1X - 18, cy - plateH / 2 - 14);
      ctx.fillStyle = colors.blue;
      ctx.fillText('−', plate2X + 18, cy - plateH / 2 - 14);

      // E-field between the plates (growing). Render as several pink arrows.
      const nLines = 5;
      for (let i = 0; i < nLines; i++) {
        const y = cy - plateH / 2 + (i + 0.5) * (plateH / nLines);
        ctx.strokeStyle = 'rgba(255,59,110,0.7)';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(plate1X + 4, y); ctx.lineTo(plate2X - 6, y);
        ctx.stroke();
        // arrowhead
        ctx.fillStyle = colors.pink;
        ctx.beginPath();
        ctx.moveTo(plate2X - 6, y);
        ctx.lineTo(plate2X - 12, y - 3);
        ctx.lineTo(plate2X - 12, y + 3);
        ctx.closePath();
        ctx.fill();
      }
      // Label E
      ctx.fillStyle = colors.pink;
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText('E growing', (plate1X + plate2X) / 2, cy + plateH / 2 + 6);
      ctx.fillStyle = 'rgba(160,158,149,0.75)';
      ctx.fillText('∂E/∂t = displacement current', (plate1X + plate2X) / 2, cy + plateH / 2 + 22);

      // Three Amperian loops: around the left wire, around the gap, around the right wire
      // Drawn as ellipses around the cross-section position.
      const loopY_off = 0; // centred
      const radiusPx = Math.min(60, Math.max(18, r_mm * 4));
      const positions = [
        { x: (battX + plate1X) / 2, label: '∮B·dℓ = μ₀ I', kind: 'conduction' as const },
        { x: (plate1X + plate2X) / 2, label: '∮B·dℓ = μ₀ ε₀ dΦ_E/dt', kind: 'displacement' as const },
        { x: (plate2X + endX) / 2, label: '∮B·dℓ = μ₀ I', kind: 'conduction' as const },
      ];

      // animate phase for arrow movement
      phase = (performance.now() / 2000) % 1;

      for (const p of positions) {
        // Two ellipses (top + bottom) — a side-view "ring" around the wire / gap
        ctx.strokeStyle = p.kind === 'displacement'
          ? 'rgba(108,197,194,0.95)' : 'rgba(108,197,194,0.7)';
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
          const tnx = tx / tLen, tny = ty / tLen;
          const L = 6;
          ctx.strokeStyle = colors.teal;
          ctx.fillStyle = colors.teal;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(ax - tnx * L / 2, ay - tny * L / 2);
          ctx.lineTo(ax + tnx * L / 2, ay + tny * L / 2);
          ctx.stroke();
          // head
          const hx = ax + tnx * L / 2;
          const hy = ay + tny * L / 2;
          const nnx = -tny, nny = tnx;
          ctx.beginPath();
          ctx.moveTo(hx, hy);
          ctx.lineTo(hx - tnx * 3 + nnx * 2, hy - tny * 3 + nny * 2);
          ctx.lineTo(hx - tnx * 3 - nnx * 2, hy - tny * 3 - nny * 2);
          ctx.closePath();
          ctx.fill();
        }

        // Label
        ctx.fillStyle = p.kind === 'displacement'
          ? 'rgba(108,197,194,0.95)' : 'rgba(160,158,149,0.85)';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(p.label, p.x, cy - radiusPx * 0.32 - 10);
      }

      // I label and current direction near wires
      ctx.fillStyle = colors.accent;
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(`I = ${I.toFixed(2)} A →`, battX + 30, cy + 18);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 8.4'}
      title="Ampère–Maxwell law"
      question="If no current flows between the plates, why is there a B-field there?"
      caption={<>
        Pick an Amperian loop around the wire and you get <strong>∮B·dℓ = μ₀I</strong>. Slide it across to a loop
        between the plates — no conduction current pierces it — and Ampère alone gives zero. Maxwell's fix: a changing
        electric flux <em>also</em> sources a circulating B. The two contributions match exactly across the gap,
        because the displacement current <strong>ε₀ dΦ_E/dt</strong> equals the conduction current charging the plates.
      </>}
      deeperLab={{ slug: 'ampere', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={320} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="I"
          value={I} min={0.01} max={10} step={0.01}
          format={v => v.toFixed(2) + ' A'}
          onChange={setI}
        />
        <MiniSlider
          label="loop r"
          value={r_mm} min={2} max={20} step={0.5}
          format={v => v.toFixed(1) + ' mm'}
          onChange={setR_mm}
        />
        <MiniReadout label="|B| at r" value={<Num value={B} digits={2} />} unit="T" />
        <MiniReadout label="I_disp" value={<Num value={I_disp} digits={2} />} unit="A" />
      </DemoControls>
    </Demo>
  );
}
