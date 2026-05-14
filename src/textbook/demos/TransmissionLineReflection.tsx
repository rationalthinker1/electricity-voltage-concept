/**
 * Demo D12.13 — Transmission-line pulse reflection
 *
 * A Gaussian pulse launched at the left end of a transmission line of
 * characteristic impedance Z_0 propagates to the right at v = 1/√(LC).
 * When it reaches the load Z_L on the right end, a fraction Γ reflects:
 *
 *   Γ = (Z_L − Z_0) / (Z_L + Z_0)
 *
 * Special cases:
 *   Z_L = Z_0  →  Γ = 0   (matched, fully absorbed)
 *   Z_L = 0    →  Γ = −1  (short, inverted reflection)
 *   Z_L → ∞    →  Γ = +1  (open, same-sign reflection)
 *
 * Visualised as a moving Gaussian on a 1D line, with the reflected
 * pulse drawn on the same axis once the incident pulse has hit the end.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';
import { drawGlowPath } from '@/lib/canvasPrimitives';

interface Props { figure?: string }

const Z0 = 50; // Ω

export function TransmissionLineReflectionDemo({ figure }: Props) {
  const [ZL, setZL] = useState(50);

  // Reflection coefficient (clamp Z_L away from singular open)
  const Gamma = (ZL - Z0) / (ZL + Z0);
  const absG = Math.abs(Gamma);
  const VSWR = absG >= 1 ? Infinity : (1 + absG) / (1 - absG);

  const stateRef = useRef({ Gamma });
  useEffect(() => { stateRef.current = { Gamma }; }, [Gamma]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h } = info;
    let raf = 0;
    const t0 = performance.now();

    function draw() {
      const { Gamma } = stateRef.current;
      const t = ((performance.now() - t0) / 1000) % 5;  // 5-s loop

      ctx.fillStyle = '#0d0d10';
      ctx.fillRect(0, 0, w, h);

      const padL = 50, padR = 50, padT = 40, padB = 40;
      const lineX0 = padL, lineX1 = w - padR;
      const cy = padT + (h - padT - padB) / 2;

      // Line itself (drawn as two horizontal conductors)
      ctx.strokeStyle = 'rgba(255,255,255,0.45)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(lineX0, cy - 18); ctx.lineTo(lineX1, cy - 18); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(lineX0, cy + 18); ctx.lineTo(lineX1, cy + 18); ctx.stroke();

      // Source on the left (battery-like symbol)
      ctx.strokeStyle = '#ff6b2a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(lineX0 - 16, cy - 18); ctx.lineTo(lineX0, cy - 18);
      ctx.moveTo(lineX0 - 16, cy + 18); ctx.lineTo(lineX0, cy + 18);
      ctx.moveTo(lineX0 - 16, cy - 22); ctx.lineTo(lineX0 - 16, cy + 22);
      ctx.stroke();
      ctx.fillStyle = 'rgba(160,158,149,0.85)';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText('source', lineX0 - 22, cy);

      // Load on the right (vertical resistor)
      ctx.strokeStyle = '#6cc5c2';
      ctx.lineWidth = 2;
      // resistor zigzag vertical
      const y0r = cy - 14, y1r = cy + 14;
      const stepN = 6;
      ctx.beginPath();
      ctx.moveTo(lineX1, cy - 18); ctx.lineTo(lineX1, y0r);
      for (let i = 0; i < stepN; i++) {
        const y = y0r + ((i + 0.5) / stepN) * (y1r - y0r);
        const x = lineX1 + (i % 2 === 0 ? -6 : 6);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(lineX1, y1r); ctx.lineTo(lineX1, cy + 18);
      ctx.stroke();
      ctx.fillStyle = '#6cc5c2';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(`Z_L = ${ZL >= 1e5 ? '∞' : ZL.toFixed(0) + ' Ω'}`, lineX1 + 8, cy);

      ctx.fillStyle = 'rgba(160,158,149,0.7)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(`Z₀ = ${Z0} Ω`, (lineX0 + lineX1) / 2, cy + 28);

      // Pulse position. Period: incident travel 0..1 in time 0..2,
      // reflection travel 0..1 in time 2..4, rest at 4..5.
      const Lx = lineX1 - lineX0;
      const yPulse = (level: number) =>
        cy - 24 - 26 * level;  // amplitude 1 maps to 26 px above the conductor

      // Helper to draw a Gaussian pulse at center xc with sign s
      const drawPulse = (xc: number, s: number) => {
        if (Math.abs(s) < 0.01) return;
        const sigma = 0.06 * Lx;
        const pts: { x: number; y: number }[] = [];
        for (let x = lineX0; x <= lineX1; x += 1) {
          const u = (x - xc) / sigma;
          const v = s * Math.exp(-u * u / 2);
          pts.push({ x, y: yPulse(v) });
        }
        drawGlowPath(ctx, pts, {
          color: s > 0 ? 'rgba(255,107,42,0.95)' : 'rgba(91,174,248,0.95)',
          glowColor: s > 0 ? 'rgba(255,107,42,0.35)' : 'rgba(91,174,248,0.35)',
          lineWidth: 1.8,
        });
      };

      if (t < 2) {
        // Incident pulse moving right
        const xc = lineX0 + (t / 2) * Lx;
        drawPulse(xc, 1);
      } else if (t < 4) {
        // Reflected pulse moving left
        const u = (t - 2) / 2;
        const xc = lineX1 - u * Lx;
        // also show transmitted (1+Γ) component as a small marker absorbed
        drawPulse(xc, Gamma);
      } else {
        // brief pause then loop
      }

      // Header
      ctx.fillStyle = 'rgba(236,235,229,0.9)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('Γ = (Z_L − Z₀)/(Z_L + Z₀)', 10, 8);
      ctx.textAlign = 'right';
      ctx.fillText(`Γ = ${Gamma.toFixed(3)}    |Γ| = ${Math.abs(Gamma).toFixed(3)}    VSWR = ${VSWR === Infinity ? '∞' : VSWR.toFixed(2)}`,
        w - 10, 8);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 12.11'}
      title="Transmission-line reflection"
      question="A 50 Ω cable into a mismatched load. Where does the pulse go?"
      caption={<>
        A 50 Ω line, a Gaussian pulse launched from the source on the left, a load Z<sub>L</sub>
        on the right. When Z<sub>L</sub> = Z<sub>0</sub> the pulse is absorbed cleanly (no return).
        Mismatch the load and a fraction Γ = (Z<sub>L</sub>−Z<sub>0</sub>)/(Z<sub>L</sub>+Z<sub>0</sub>)
        comes back — same-sign for an open, inverted for a short. The VSWR is just (1+|Γ|)/(1−|Γ|).
      </>}
    >
      <AutoResizeCanvas height={260} setup={setup} />
      <DemoControls>
        <MiniSlider label="Z_L" value={ZL} min={0} max={500} step={1}
          format={v => v.toFixed(0) + ' Ω'} onChange={setZL} />
        <MiniReadout label="Γ" value={Gamma.toFixed(3)} />
        <MiniReadout label="|Γ|" value={Math.abs(Gamma).toFixed(3)} />
        <MiniReadout label="VSWR" value={VSWR === Infinity ? '∞' : <Num value={VSWR} />} />
        <MiniReadout label="Power reflected" value={(Gamma * Gamma * 100).toFixed(1)} unit="%" />
      </DemoControls>
    </Demo>
  );
}
