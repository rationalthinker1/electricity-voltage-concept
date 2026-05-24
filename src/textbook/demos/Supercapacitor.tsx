/**
 * Demo 19.4 — Supercapacitor (electric double-layer)
 *
 * A linear charge / discharge curve through a constant-current source.
 * Unlike a battery — which holds roughly flat voltage during discharge —
 * a capacitor's voltage falls linearly with the charge drawn:
 *   V(t) = V₀ − (I / C) · t  on discharge.
 *
 * Plus a Ragone-ish power-vs-energy backdrop with chemistry markers.
 */
import { useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, EquationStrip, MiniReadout, MiniSlider, MiniToggle } from '@/components/Demo';
import { InlineMath } from '@/components/Formula';
import { Num } from '@/components/Num';
import { withAlpha } from '@/lib/canvasTheme';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';
import { drawLabel } from "@/lib/canvasLayout";

interface Props {
  figure: string;
}

export function SupercapacitorDemo({ figure }: Props) {
  const [C, setC] = useState(1000); // F
  const [I, setI] = useState(50); // A
  const [V_max, _setVmax] = useState(2.7);
  const [mode, setMode] = useState<'charge' | 'discharge' | 'idle'>('idle');
  const [V, setV] = useState(0);

  useEffect(() => {
    if (mode === 'idle') return;
    const dir = mode === 'charge' ? +1 : -1;
    const id = window.setInterval(() => {
      setV((v) => {
        const dv = ((dir * I) / C) * 0.05; // 50 ms tick
        const next = v + dv;
        if (next >= V_max) return V_max;
        if (next <= 0) return 0;
        return next;
      });
    }, 50);
    return () => window.clearInterval(id);
  }, [mode, I, C, V_max]);

  const U = 0.5 * C * V * V; // joules currently stored

  // Trace
  const traceRef = useRef<Array<{ t: number; v: number }>>([]);
  const tRef = useRef(0);
  useEffect(() => {
    tRef.current += 0.05;
    traceRef.current.push({ t: tRef.current, v: V });
    if (traceRef.current.length > 400) traceRef.current.shift();
  }, [V]);

  const stateRef = useSimState({ V, V_max });
  const setup = useSimLoop(
    stateRef,
    ({ ctx, w: W, h: H, colors }, _state, _dt, _simTime) => {
      const s = stateRef.current;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, W, H);
      const pX = 40,
        pY = 22;
      const pW = W - 56,
        pH = H - 50;
      ctx.strokeStyle = colors.border;
      ctx.strokeRect(pX, pY, pW, pH);
      const yV = (v: number) => pY + pH - (v / s.V_max) * pH;
      ctx.strokeStyle = withAlpha(colors.accent, 0.35);
      ctx.setLineDash([4, 4]);
      const yvm = yV(s.V_max);
      ctx.beginPath();
      ctx.moveTo(pX, yvm);
      ctx.lineTo(pX + pW, yvm);
      ctx.stroke();
      ctx.setLineDash([]);
      const trace = traceRef.current;
      if (trace.length > 1) {
        const tMin = trace[0]!.t;
        const tMax = trace[trace.length - 1]!.t;
        const tSpan = Math.max(tMax - tMin, 1e-6);
        ctx.strokeStyle = colors.pink;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        for (let i = 0; i < trace.length; i++) {
          const p = trace[i]!;
          const x = pX + ((p.t - tMin) / tSpan) * pW;
          const y = yV(p.v);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.fillStyle = colors.textDim;
      drawLabel(ctx, { text: 'V(t)', x: pX, y: 6, font: '10px "JetBrains Mono", monospace', baseline: 'top' });
      drawLabel(ctx, { text: `V_max = ${s.V_max.toFixed(2)} V`, x: pX + pW - 4, y: yvm - 4, font: '10px "JetBrains Mono", monospace', align: 'right', baseline: 'top' });
      drawLabel(ctx, { text: `V = ${s.V.toFixed(2)} V`, x: pX + pW, y: pY + pH + 4, font: '10px "JetBrains Mono", monospace', align: 'right', baseline: 'top' });
    },
    [],
  );

  return (
    <Demo
      figure={figure}
      title="Supercapacitor: a field, not a reaction"
      question="Why does a supercap's voltage fall linearly while a battery's stays flat?"
      caption={
        <>
          Constant-current charge or discharge gives a linear ramp: <em>dV/dt = ±I / C</em>. A
          1000-F cell charged to 2.7 V holds <strong>½CV² ≈ 3.6 kJ</strong> — about 1 Wh. Power per
          mass beats Li-ion by an order of magnitude; energy per mass loses by an order of
          magnitude. Two complementary devices, not interchangeable.
        </>
      }
      deeperLab={{ slug: 'li-ion-cycling', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={220} setup={setup} />
      <DemoControls>
        <MiniToggle
          label="Charge"
          checked={mode === 'charge'}
          onChange={(v) => setMode(v ? 'charge' : 'idle')}
        />
        <MiniToggle
          label="Discharge"
          checked={mode === 'discharge'}
          onChange={(v) => setMode(v ? 'discharge' : 'idle')}
        />
        <button
          type="button"
          className="mini-toggle"
          onClick={() => {
            setV(0);
            setMode('idle');
            traceRef.current = [];
            tRef.current = 0;
          }}
        >
          Reset
        </button>
        <MiniSlider
          label="C"
          value={C}
          min={100}
          max={3000}
          step={50}
          format={(v) => v.toFixed(0) + ' F'}
          onChange={setC}
        />
        <MiniSlider
          label="I"
          value={I}
          min={1}
          max={300}
          step={1}
          format={(v) => v.toFixed(0) + ' A'}
          onChange={setI}
        />
        <MiniReadout label="V" value={<Num value={V} />} unit="V" />
        <MiniReadout label="U = ½CV²" value={<Num value={U} />} unit="J" />
      </DemoControls>
      <EquationStrip
        leftLabel="Supercapacitor charge/discharge"
        left={<InlineMath tex="\frac{dV}{dt} = \pm\frac{I}{C},\quad U = \tfrac{1}{2}CV^2" />}
        rightLabel="At current state"
        right={<InlineMath tex={`\\frac{dV}{dt} = \\frac{${I.toFixed(0)}}{${C.toFixed(0)}} = ${(I / C).toFixed(4)}\\,\\text{V/s};\\quad U = ${U.toFixed(0)}\\,\\text{J}`} />}
      />
    </Demo>
  );
}
