/**
 * Demo D15.2 — Half-wave dipole input impedance
 *
 * Plot |Z(f)| for a half-wave dipole of length L. Near resonance (f₀ = c/(2L))
 * the impedance crosses through pure-real ≈ 73 Ω. Below or above f₀, large
 * reactance dominates and |Z| climbs.
 *
 * Slider for L; readout for f₀ and R_rad at resonance.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { PHYS } from '@/lib/physics';
import { getCanvasColors } from '@/lib/canvasTheme';

interface Props { figure?: string }

export function HalfWaveDipoleResonanceDemo({ figure }: Props) {
  // L in metres
  const [L, setL] = useState(1.5);

  const stateRef = useRef({ L });
  useEffect(() => { stateRef.current = { L }; }, [L]);

  const f0 = PHYS.c / (2 * L);
  const R_rad = 73; // Ω at resonance, half-wave dipole

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w: W, h: H } = info;
    let raf = 0;
    function draw() {
      const { L } = stateRef.current;
      const f0_ = PHYS.c / (2 * L);

      ctx.fillStyle = getCanvasColors().bg;
      ctx.fillRect(0, 0, W, H);

      // Plot area
      const padL = 56, padR = 18, padT = 22, padB = 36;
      const x0 = padL, x1 = W - padR;
      const y0 = H - padB, y1 = padT;
      const plotW = x1 - x0;
      const plotH = y0 - y1;

      // Plot |Z| over 0.3 f₀ to 2.5 f₀
      const fmin = 0.3 * f0_;
      const fmax = 2.5 * f0_;
      const Zmax = 1500;

      // Axes
      ctx.strokeStyle = getCanvasColors().borderStrong;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x0, y0); ctx.lineTo(x1, y0);
      ctx.moveTo(x0, y0); ctx.lineTo(x0, y1);
      ctx.stroke();
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = getCanvasColors().textDim;
      ctx.textAlign = 'center';
      for (let i = 0; i <= 5; i++) {
        const fr = fmin + (fmax - fmin) * i / 5;
        const x = x0 + (i / 5) * plotW;
        ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y0 + 3); ctx.stroke();
        ctx.fillText(formatHz(fr), x, y0 + 14);
      }
      ctx.fillText('frequency f', (x0 + x1) / 2, H - 4);
      ctx.textAlign = 'right';
      for (let v = 0; v <= Zmax; v += 300) {
        const y = y0 - (v / Zmax) * plotH;
        ctx.beginPath(); ctx.moveTo(x0 - 3, y); ctx.lineTo(x0, y); ctx.stroke();
        ctx.fillText(String(v), x0 - 6, y + 3);
      }
      ctx.save();
      ctx.translate(14, (y0 + y1) / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.fillText('|Z|  (Ω)', 0, 0);
      ctx.restore();

      // Approximate |Z(f)|: at f₀, |Z| = 73 Ω; off-resonance, a large cot-like reactance.
      // Use Z ≈ R_rad − j·Z₀·cot(kL/2) for a centre-fed dipole with Z₀ ~ 120·(ln(L/r) − 1) ≈ 600 Ω.
      const Z0 = 600;
      ctx.strokeStyle = getCanvasColors().accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i <= 300; i++) {
        const f = fmin + (fmax - fmin) * (i / 300);
        // Half-wave dipole: kL = π at f=f₀ → kL/2 = π/2. So:
        const half_kL = (Math.PI * f) / (2 * f0_);
        const X = -Z0 * cot(half_kL);
        const Zmag = Math.sqrt(R_rad * R_rad + X * X);
        const Zclip = Math.min(Zmax, Zmag);
        const x = x0 + (i / 300) * plotW;
        const y = y0 - (Zclip / Zmax) * plotH;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Resonance marker at f₀
      const xRes = x0 + ((f0_ - fmin) / (fmax - fmin)) * plotW;
      ctx.setLineDash([3, 4]);
      ctx.strokeStyle = getCanvasColors().teal;
      ctx.beginPath(); ctx.moveTo(xRes, y0); ctx.lineTo(xRes, y1); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = getCanvasColors().teal;
      ctx.textAlign = 'center';
      ctx.fillText(`f₀ = ${formatHz(f0_)}`, xRes, y1 - 4);

      // 73-Ω horizontal line
      const y73 = y0 - (73 / Zmax) * plotH;
      ctx.setLineDash([2, 4]);
      ctx.strokeStyle = getCanvasColors().borderStrong;
      ctx.beginPath(); ctx.moveTo(x0, y73); ctx.lineTo(x1, y73); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.textAlign = 'left';
      ctx.fillText('73 Ω', x0 + 4, y73 - 4);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 15.2'}
      title="Half-wave dipole — input impedance"
      question="Why does |Z| dip to ~73 Ω at one frequency?"
      caption={<>
        Centre-fed dipole of length <strong>L</strong>: input impedance has large reactance off
        resonance and crosses to a pure real ≈ 73 Ω when <strong>L = λ/2</strong>, i.e. at
        <strong> f₀ = c/(2L)</strong>. The 73 Ω is <em>radiation resistance</em> — the rate at
        which energy is sucked out of the circuit and into the far-field, not heat.
      </>}
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        <MiniSlider label="L" value={L} min={0.05} max={5} step={0.01}
          format={v => v.toFixed(2) + ' m'} onChange={setL} />
        <MiniReadout label="f₀" value={formatHz(f0)} />
        <MiniReadout label="R_rad" value={R_rad.toFixed(0)} unit="Ω" />
      </DemoControls>
    </Demo>
  );
}

function cot(x: number): number {
  const c = Math.cos(x); const s = Math.sin(x);
  if (Math.abs(s) < 1e-6) return Math.sign(c) * 1e6;
  return c / s;
}

function formatHz(f: number): string {
  if (f >= 1e9) return (f / 1e9).toFixed(2) + ' GHz';
  if (f >= 1e6) return (f / 1e6).toFixed(2) + ' MHz';
  if (f >= 1e3) return (f / 1e3).toFixed(2) + ' kHz';
  return f.toFixed(1) + ' Hz';
}
