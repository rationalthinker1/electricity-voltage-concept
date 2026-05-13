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
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';
import { pretty } from '@/lib/physics';

interface Props { figure?: string }

export function EAxialFieldDemo({ figure }: Props) {
  const [V, setV] = useState(12);
  const [L, setL] = useState(1.0);

  const stateRef = useRef({ V, L });
  useEffect(() => { stateRef.current = { V, L }; }, [V, L]);

  const E = V / L;

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h } = info;
    let raf = 0;
    let phase = 0;

    function draw() {
      const { V, L } = stateRef.current;
      const E_ = V / L;
      ctx.fillStyle = '#0d0d10';
      ctx.fillRect(0, 0, w, h);

      const margin = 80;
      const wireXL = margin;
      const wireXR = w - margin;
      const wireCY = h * 0.55;
      const r = Math.min(60, h * 0.22);
      const er = r * 0.32;

      // ── Wire body (cylinder in slight perspective)
      const sideGrd = ctx.createLinearGradient(0, wireCY - r, 0, wireCY + r);
      sideGrd.addColorStop(0, 'rgba(255,107,42,0.10)');
      sideGrd.addColorStop(0.5, 'rgba(255,107,42,0.28)');
      sideGrd.addColorStop(1, 'rgba(255,107,42,0.10)');
      ctx.fillStyle = sideGrd;
      ctx.beginPath();
      ctx.moveTo(wireXL, wireCY - r);
      ctx.lineTo(wireXR, wireCY - r);
      ctx.ellipse(wireXR, wireCY, er, r, 0, -Math.PI / 2, Math.PI / 2);
      ctx.lineTo(wireXL, wireCY + r);
      ctx.ellipse(wireXL, wireCY, er, r, 0, Math.PI / 2, -Math.PI / 2);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = 'rgba(255,107,42,0.55)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(wireXL, wireCY - r);
      ctx.lineTo(wireXR, wireCY - r);
      ctx.moveTo(wireXL, wireCY + r);
      ctx.lineTo(wireXR, wireCY + r);
      ctx.stroke();

      // End caps
      ctx.strokeStyle = 'rgba(255,107,42,0.5)';
      ctx.beginPath(); ctx.ellipse(wireXL, wireCY, er, r, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(wireXR, wireCY, er, r, 0, 0, Math.PI * 2); ctx.stroke();

      // ── Axial E arrows (pink) inside the wire
      // Use multiple arrows along the wire centerline; arrow length scales with log E.
      const nArrows = 6;
      // Visual scaling for arrow length, capped so it stays inside wire.
      const arrLen = Math.min(80, 32 + Math.log10(Math.max(1, E_)) * 14);
      ctx.strokeStyle = 'rgba(255,59,110,0.95)';
      ctx.fillStyle = 'rgba(255,59,110,0.95)';
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

      // Subtle moving tracer dots along the axis to suggest the field "pushing"
      phase += 0.012;
      ctx.fillStyle = 'rgba(255,59,110,0.6)';
      const nDots = 5;
      for (let i = 0; i < nDots; i++) {
        const f = ((i / nDots) + phase) % 1;
        const tx = wireXL + 18 + f * (wireXR - wireXL - 36);
        ctx.beginPath(); ctx.arc(tx, wireCY, 1.6, 0, Math.PI * 2); ctx.fill();
      }

      // Terminals — battery hookup
      ctx.fillStyle = '#ff3b6e';
      ctx.fillRect(wireXL - 22, wireCY - r - 4, 4, 2 * r + 8);
      ctx.fillStyle = '#5baef8';
      ctx.fillRect(wireXR + 18, wireCY - r - 4, 4, 2 * r + 8);
      ctx.fillStyle = '#ff3b6e';
      ctx.font = 'bold 14px "JetBrains Mono", monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('+', wireXL - 36, wireCY);
      ctx.fillStyle = '#5baef8';
      ctx.fillText('−', wireXR + 36, wireCY);

      // Labels
      ctx.fillStyle = 'rgba(255,59,110,0.85)';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      ctx.fillText('E  (axial)', (wireXL + wireXR) / 2, wireCY - r - 14);

      ctx.fillStyle = 'rgba(160,158,149,.85)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText(`V = ${V.toFixed(1)} V`, 18, h - 24);
      ctx.textAlign = 'right';
      ctx.fillText(`L = ${L.toFixed(2)} m`, w - 18, h - 24);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ff6b2a';
      ctx.fillText(`E = V / L = ${pretty(E_)} V/m`, w / 2, h - 24);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 6.2'}
      title="E points along the wire"
      question="Where does the electric field inside a resistive wire actually point?"
      caption={<>
        Pink arrows are the electric field <strong>E</strong>. It runs <em>along the wire's axis</em>, not radially — it has to,
        because that's the field that pushes the drifting charge to maintain the current. Magnitude follows directly from the
        voltage drop across the length: <em>E = V/L</em>.
      </>}
      deeperLab={{ slug: 'ohms-law', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={260} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="V"
          value={V} min={0.1} max={48} step={0.1}
          format={v => v.toFixed(1) + ' V'}
          onChange={setV}
        />
        <MiniSlider
          label="L"
          value={L} min={0.1} max={5} step={0.05}
          format={v => v.toFixed(2) + ' m'}
          onChange={setL}
        />
        <MiniReadout label="E along axis" value={<Num value={E} />} unit="V/m" />
      </DemoControls>
    </Demo>
  );
}
