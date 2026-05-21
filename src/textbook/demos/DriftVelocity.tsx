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
import { useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, EquationStrip, MiniReadout, MiniSlider } from '@/components/Demo';
import { InlineMath } from '@/components/Formula';
import { Num } from '@/components/Num';
import { drawLabel } from '@/lib/canvasLayout';
import { MATERIALS, PHYS, formatTime } from '@/lib/physics';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

interface Props {
  figure?: string;
}

const N_ELECTRONS = 120;

interface Electron {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export function DriftVelocityDemo({ figure }: Props) {
  const [I, setI] = useState(1); // amperes
  const [Amm2, setAmm2] = useState(2.5); // cross-section in mm²

  // Real drift velocity, m/s
  const A_m2 = Amm2 * 1e-6;
  const n = MATERIALS.copper.n;
  const vd = I / (n * PHYS.e * A_m2);
  const t1m = 1 / vd; // seconds to traverse 1 m

  const stateRef = useSimState({ I, Amm2 });

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, colors }, _state, _dt, _simTime, electrons) => {
      const s = stateRef.current;
      const wireTop = h * 0.32;
      const wireBot = h * 0.78;
      const wireLeft = 50;
      const wireRight = w - 50;

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      // Wire body
      const r = (wireBot - wireTop) / 2;
      ctx.save();
      ctx.globalAlpha = 0.06;
      ctx.fillStyle = colors.accent;
      ctx.beginPath();
      ctx.moveTo(wireLeft + r, wireTop);
      ctx.lineTo(wireRight - r, wireTop);
      ctx.arc(wireRight - r, wireTop + r, r, -Math.PI / 2, Math.PI / 2);
      ctx.lineTo(wireLeft + r, wireBot);
      ctx.arc(wireLeft + r, wireTop + r, r, Math.PI / 2, -Math.PI / 2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = 0.1;
      ctx.strokeStyle = colors.text;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Battery terminals
      ctx.restore();
      ctx.fillStyle = colors.pink;
      ctx.fillRect(wireLeft - 10, wireTop + 8, 4, wireBot - wireTop - 16);
      ctx.fillStyle = colors.blue;
      ctx.fillRect(wireRight + 6, wireTop + 8, 4, wireBot - wireTop - 16);
      ctx.save();
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = colors.textDim;
      drawLabel(ctx, { text: '+', x: wireLeft - 8, y: wireTop, font: '10px "JetBrains Mono", monospace', align: 'center' });
      drawLabel(ctx, { text: '−', x: wireRight + 8, y: wireTop, font: '10px "JetBrains Mono", monospace', align: 'center' });

      // Tiny axis arrow showing E direction
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = 0.55;
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1;
      const axy = (wireTop + wireBot) / 2;
      for (let xa = wireLeft + 60; xa < wireRight - 50; xa += 110) {
        ctx.beginPath();
        ctx.moveTo(xa, axy);
        ctx.lineTo(xa + 26, axy);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(xa + 26, axy);
        ctx.lineTo(xa + 20, axy - 4);
        ctx.lineTo(xa + 20, axy + 4);
        ctx.closePath();
        ctx.fillStyle = colors.accent;
        ctx.fill();
      }
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = 0.7;
      drawLabel(ctx, {
        x: wireLeft + 4,
        y: wireTop - 6,
        text: 'E',
        color: colors.accent,
      });

      // Visual drift bias — amplified for visibility
      const vd_real = s.I / (n * PHYS.e * s.Amm2 * 1e-6);
      const driftBias = Math.max(0.04, Math.min(2.0, vd_real * 6e4));

      ctx.restore();
      for (const e of electrons) {
        // Thermal kick
        e.vx += (Math.random() - 0.5) * 1.4;
        e.vy += (Math.random() - 0.5) * 1.4;
        e.vx *= 0.85;
        e.vy *= 0.85;
        e.vx += driftBias;
        e.x += e.vx;
        e.y += e.vy;

        // Wrap horizontally
        if (e.x > wireRight - 4) e.x = wireLeft + 4;
        if (e.x < wireLeft + 4) e.x = wireRight - 4;
        if (e.y < wireTop + 3) e.y = wireTop + 3;
        if (e.y > wireBot - 3) e.y = wireBot - 3;

        ctx.beginPath();
        ctx.arc(e.x, e.y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }

      // Caption
      ctx.save();
      ctx.globalAlpha = 0.8;
      drawLabel(ctx, {
        x: wireLeft,
        y: h - 12,
        text: 'copper · 120 free electrons (visual bias scaled ×60 000 for visibility)',
        color: colors.textDim,
      });
      ctx.restore();
    },
    [],
    () => {
      // Electron positions depend on canvas size, so init once per setup
      const wireTop = 260 * 0.32; // approximate, will be recalculated in draw
      const wireBot = 260 * 0.78;
      const wireLeft = 50;
      const wireRight = 880 - 50; // approximate
      const electrons: Electron[] = Array.from({ length: N_ELECTRONS }, () => ({
        x: wireLeft + Math.random() * (wireRight - wireLeft),
        y: wireTop + Math.random() * (wireBot - wireTop),
        vx: 0,
        vy: 0,
      }));
      return { context: electrons };
    },
  );

  return (
    <Demo
      figure={figure ?? 'Fig. 2.2'}
      title="The astonishing slowness of drift"
      question="If 1 amp is 6×10¹⁸ electrons per second, how fast is each one going?"
      caption={
        <>
          Slow the visual down and you'd see electrons bouncing every which way at thermal speeds
          (~10⁶ m/s) with the faintest <em>net</em> rightward bias. Plug real numbers in: at 1 A
          through 2.5 mm² of copper, the average drift is about <strong>0.03 mm/s</strong>. A single
          electron would take roughly <strong>10 hours</strong> to traverse a 1-meter wire.
        </>
      }
      deeperLab={{ slug: 'drift', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={260} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="current I"
          value={I}
          min={0.1}
          max={20}
          step={0.1}
          format={(v) => v.toFixed(1) + ' A'}
          onChange={setI}
        />
        <MiniSlider
          label="area A"
          value={Amm2}
          min={0.5}
          max={4}
          step={0.05}
          format={(v) => v.toFixed(2) + ' mm²'}
          onChange={setAmm2}
        />
        <MiniReadout label="drift v_d" value={<Num value={vd} />} unit="m/s" />
        <MiniReadout label="time to cross 1 m" value={formatTime(t1m)} />
      </DemoControls>
      <EquationStrip
        leftLabel="Drude formula"
        left={<InlineMath tex="v_d \;=\; \dfrac{I}{n\, q\, A}" />}
        rightLabel="Live substitution (Cu, e, A)"
        right={
          <InlineMath
            tex={
              `v_d \\;=\\; \\dfrac{${I.toFixed(1)}}` +
              `{(8.5\\times 10^{28})(1.602\\times 10^{-19})(${Amm2.toFixed(2)}\\times 10^{-6})} ` +
              `\\;\\approx\\; ${vd.toExponential(2)}\\ \\text{m/s}`
            }
          />
        }
      />
    </Demo>
  );
}
