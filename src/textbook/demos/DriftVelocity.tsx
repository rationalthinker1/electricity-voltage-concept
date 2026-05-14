/**
 * Demo D2.2 — Drift velocity
 *
 * A horizontal copper wire with N jittering electrons. Each frame, every
 * electron gets random thermal kicks plus a small rightward bias. The
 * bias is a *visually amplified* version of the actual drift velocity
 * v_d = I / (n q A); the readout always shows the real value.
 *
 * Sliders: current I (0.1–20 A) and cross-section A (0.5–4 mm²).
 * Material is fixed to copper (n from MATERIALS.copper).
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';
import { MATERIALS, PHYS, formatTime } from '@/lib/physics';

interface Props { figure?: string }

const N_ELECTRONS = 120;

interface Electron { x: number; y: number; vx: number; vy: number }

export function DriftVelocityDemo({ figure }: Props) {
  const [I, setI] = useState(1);          // amperes
  const [Amm2, setAmm2] = useState(2.5);  // cross-section in mm²

  const stateRef = useRef({ I, Amm2 });
  useEffect(() => { stateRef.current = { I, Amm2 }; }, [I, Amm2]);

  // Real drift velocity, m/s
  const A_m2 = Amm2 * 1e-6;
  const n = MATERIALS.copper.n;
  const vd = I / (n * PHYS.e * A_m2);
  const t1m = 1 / vd; // seconds to traverse 1 m

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h } = info;
    let raf = 0;

    const wireTop = h * 0.32;
    const wireBot = h * 0.78;
    const wireLeft = 50;
    const wireRight = w - 50;

    // Initialise electrons uniformly inside the wire bounds
    const electrons: Electron[] = Array.from({ length: N_ELECTRONS }, () => ({
      x: wireLeft + Math.random() * (wireRight - wireLeft),
      y: wireTop + Math.random() * (wireBot - wireTop),
      vx: 0, vy: 0,
    }));

    function draw() {
      const { I } = stateRef.current;
      ctx.fillStyle = '#0d0d10';
      ctx.fillRect(0, 0, w, h);

      // Wire body — soft amber rounded rectangle
      const r = (wireBot - wireTop) / 2;
      ctx.fillStyle = 'rgba(255,107,42,.06)';
      ctx.beginPath();
      ctx.moveTo(wireLeft + r, wireTop);
      ctx.lineTo(wireRight - r, wireTop);
      ctx.arc(wireRight - r, wireTop + r, r, -Math.PI / 2, Math.PI / 2);
      ctx.lineTo(wireLeft + r, wireBot);
      ctx.arc(wireLeft + r, wireTop + r, r, Math.PI / 2, -Math.PI / 2);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.10)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Battery terminals
      ctx.fillStyle = '#ff3b6e';
      ctx.fillRect(wireLeft - 10, wireTop + 8, 4, wireBot - wireTop - 16);
      ctx.fillStyle = '#5baef8';
      ctx.fillRect(wireRight + 6, wireTop + 8, 4, wireBot - wireTop - 16);
      ctx.fillStyle = 'rgba(160,158,149,.85)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('+', wireLeft - 8, wireTop);
      ctx.fillText('−', wireRight + 8, wireTop);

      // Tiny axis arrow showing E direction (left → right)
      ctx.strokeStyle = 'rgba(255,107,42,.55)';
      ctx.lineWidth = 1;
      const axy = (wireTop + wireBot) / 2;
      for (let xa = wireLeft + 60; xa < wireRight - 50; xa += 110) {
        ctx.beginPath(); ctx.moveTo(xa, axy); ctx.lineTo(xa + 26, axy); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(xa + 26, axy);
        ctx.lineTo(xa + 20, axy - 4);
        ctx.lineTo(xa + 20, axy + 4);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255,107,42,.55)';
        ctx.fill();
      }
      ctx.fillStyle = 'rgba(255,107,42,.7)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('E', wireLeft + 4, wireTop - 6);

      // Visual drift bias — amplified for visibility (real v_d is way too
      // slow to render — ~3×10⁻⁵ m/s). The readout shows the real number.
      const vd_real = I / (n * PHYS.e * stateRef.current.Amm2 * 1e-6);
      const driftBias = Math.max(0.04, Math.min(2.0, vd_real * 6e4));

      ctx.fillStyle = '#5baef8';
      for (const e of electrons) {
        // Thermal kick
        e.vx += (Math.random() - 0.5) * 1.4;
        e.vy += (Math.random() - 0.5) * 1.4;
        e.vx *= 0.85; e.vy *= 0.85;
        e.vx += driftBias;
        e.x += e.vx; e.y += e.vy;

        // Wrap horizontally so electrons don't deplete
        if (e.x > wireRight - 4) e.x = wireLeft + 4;
        if (e.x < wireLeft + 4) e.x = wireRight - 4;
        if (e.y < wireTop + 3) e.y = wireTop + 3;
        if (e.y > wireBot - 3) e.y = wireBot - 3;

        ctx.beginPath();
        ctx.arc(e.x, e.y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }

      // Caption
      ctx.fillStyle = 'rgba(160,158,149,.8)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('copper · 120 free electrons (visual bias scaled ×60 000 for visibility)', wireLeft, h - 12);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 2.2'}
      title="The astonishing slowness of drift"
      question="If 1 amp is 6×10¹⁸ electrons per second, how fast is each one going?"
      caption={<>
        Slow the visual down and you'd see electrons bouncing every which way at thermal speeds (~10⁶ m/s) with the faintest <em>net</em> rightward bias. Plug real numbers in: at 1 A through 2.5 mm² of copper, the average drift is about <strong>0.03 mm/s</strong>. A single electron would take roughly <strong>10 hours</strong> to traverse a 1-meter wire.
      </>}
      deeperLab={{ slug: 'drift', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={260} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="current I"
          value={I} min={0.1} max={20} step={0.1}
          format={v => v.toFixed(1) + ' A'}
          onChange={setI}
        />
        <MiniSlider
          label="area A"
          value={Amm2} min={0.5} max={4} step={0.05}
          format={v => v.toFixed(2) + ' mm²'}
          onChange={setAmm2}
        />
        <MiniReadout label="drift v_d" value={<Num value={vd} />} unit="m/s" />
        <MiniReadout label="time to cross 1 m" value={formatTime(t1m)} />
      </DemoControls>
    </Demo>
  );
}
