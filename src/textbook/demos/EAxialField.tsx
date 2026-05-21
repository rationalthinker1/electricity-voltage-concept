/**
 * Demo D6.2 — Axial E inside a resistive wire
 *
 * The simplest possible point: inside a current-carrying resistive wire,
 * the electric field is *along the axis*, not radial. Magnitude E = V/L.
 * That's the field that drives the drift in the first place — without it
 * there's no current.
 *
 * Visual: horizontal cylindrical wire in slight 3D perspective, with pink
 * E arrows running along the axis. Sliders for V (voltage drop) and L
 * (length). Live readout E = V/L.
 */
import { useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';
import { withAlpha } from '@/lib/canvasTheme';
import { pretty } from '@/lib/physics';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';
import { drawLabel } from "@/lib/canvasLayout";

interface Props {
  figure?: string;
}

export function EAxialFieldDemo({ figure }: Props) {
  const [V, setV] = useState(12);
  const [L, setL] = useState(1.0);

  const stateRef = useSimState({ V, L });
  const E = V / L;

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, colors }, _state, _dt, _simTime, ctx0) => {
      let phase = ctx0.phase;
      const { V, L } = stateRef.current;
      const E_ = V / L;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);
      const margin = 80;
      const wireXL = margin;
      const wireXR = w - margin;
      const wireCY = h * 0.55;
      const r = Math.min(60, h * 0.22);
      const er = r * 0.32;
      const sideGrd = ctx.createLinearGradient(0, wireCY - r, 0, wireCY + r);
      sideGrd.addColorStop(0, withAlpha(colors.accent, 0.1));
      sideGrd.addColorStop(0.5, withAlpha(colors.accent, 0.28));
      sideGrd.addColorStop(1, withAlpha(colors.accent, 0.1));
      ctx.fillStyle = sideGrd;
      ctx.beginPath();
      ctx.moveTo(wireXL, wireCY - r);
      ctx.lineTo(wireXR, wireCY - r);
      ctx.ellipse(wireXR, wireCY, er, r, 0, -Math.PI / 2, Math.PI / 2);
      ctx.lineTo(wireXL, wireCY + r);
      ctx.ellipse(wireXL, wireCY, er, r, 0, Math.PI / 2, -Math.PI / 2);
      ctx.closePath();
      ctx.fill();
      ctx.save();
      ctx.globalAlpha = 0.55;
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(wireXL, wireCY - r);
      ctx.lineTo(wireXR, wireCY - r);
      ctx.moveTo(wireXL, wireCY + r);
      ctx.lineTo(wireXR, wireCY + r);
      ctx.stroke();
      ctx.restore();
      ctx.strokeStyle = colors.accent;
      ctx.beginPath();
      ctx.ellipse(wireXL, wireCY, er, r, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(wireXR, wireCY, er, r, 0, 0, Math.PI * 2);
      ctx.stroke();
      const nArrows = 6;
      const arrLen = Math.min(80, 32 + Math.log10(Math.max(1, E_)) * 14);
      ctx.strokeStyle = colors.pink;
      ctx.fillStyle = colors.pink;
      ctx.lineWidth = 2;
      for (let i = 0; i < nArrows; i++) {
        const t = (i + 0.5) / nArrows;
        const cx = wireXL + t * (wireXR - wireXL) - arrLen / 2;
        const cy = wireCY;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + arrLen, cy);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + arrLen, cy);
        ctx.lineTo(cx + arrLen - 8, cy - 5);
        ctx.lineTo(cx + arrLen - 8, cy + 5);
        ctx.closePath();
        ctx.fill();
      }
      phase += 0.012;
      ctx.fillStyle = colors.pink;
      const nDots = 5;
      for (let i = 0; i < nDots; i++) {
        const f = (i / nDots + phase) % 1;
        const tx = wireXL + 18 + f * (wireXR - wireXL - 36);
        ctx.beginPath();
        ctx.arc(tx, wireCY, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = colors.pink;
      ctx.fillRect(wireXL - 22, wireCY - r - 4, 4, 2 * r + 8);
      ctx.fillStyle = colors.blue;
      ctx.fillRect(wireXR + 18, wireCY - r - 4, 4, 2 * r + 8);
      drawLabel(ctx, { text: '+', x: wireXL - 36, y: wireCY, color: colors.pink, weight: 'bold', size: 14, font: 'bold 14px "JetBrains Mono", monospace', align: 'center', baseline: 'middle' });
      drawLabel(ctx, { text: '−', x: wireXR + 36, y: wireCY, color: colors.blue });
      drawLabel(ctx, { text: 'E  (axial)', x: (wireXL + wireXR) / 2, y: wireCY - r - 14, color: colors.pink, size: 11, font: '11px "JetBrains Mono", monospace', align: 'center', baseline: 'bottom' });
      ctx.save();
      ctx.globalAlpha = 0.85;
      drawLabel(ctx, { text: `V = ${V.toFixed(1)} V`, x: 18, y: h - 24, font: '10px "JetBrains Mono", monospace', baseline: 'top' });
      drawLabel(ctx, { text: `L = ${L.toFixed(2)} m`, x: w - 18, y: h - 24, align: 'right' });
      ctx.textAlign = 'center';
      ctx.restore();
      drawLabel(ctx, { text: `E = V / L = ${pretty(E_)} V/m`, x: w / 2, y: h - 24, color: colors.accent });
      ctx0.phase = phase;
    },
    [],
    () => ({ context: { phase: 0 } }),
  );

  return (
    <Demo
      figure={figure ?? 'Fig. 6.2'}
      title="E points along the wire"
      question="Where does the electric field inside a resistive wire actually point?"
      caption={
        <>
          Pink arrows are the electric field <strong>E</strong>. It runs{' '}
          <em>along the wire's axis</em>, not radially — it has to, because that's the field that
          pushes the drifting charge to maintain the current. Magnitude follows directly from the
          voltage drop across the length: <em>E = V/L</em>.
        </>
      }
      deeperLab={{ slug: 'ohms-law', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={260} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="V"
          value={V}
          min={0.1}
          max={48}
          step={0.1}
          format={(v) => v.toFixed(1) + ' V'}
          onChange={setV}
        />
        <MiniSlider
          label="L"
          value={L}
          min={0.1}
          max={5}
          step={0.05}
          format={(v) => v.toFixed(2) + ' m'}
          onChange={setL}
        />
        <MiniReadout label="E along axis" value={<Num value={E} />} unit="V/m" />
      </DemoControls>
    </Demo>
  );
}
