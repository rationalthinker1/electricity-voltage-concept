/**
 * Demo D4.5 — RC charging curve
 *
 * Battery + resistor + capacitor + switch. Toggle the switch and the
 * capacitor charges as V_C(t) = V₀ (1 − e^(−t/RC)). The plot shows
 * V_C vs t with τ = RC marked and the 63% / 99% lines flagged.
 *
 * Distinct from the appendix RCTransientDemo: this is the simpler "look at
 * the curve" version, with no discharge mode.
 */
import { useEffect, useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import {
  Demo,
  DemoControls,
  EquationStrip,
  MiniReadout,
  MiniSlider,
  MiniToggle,
} from '@/components/Demo';
import { M } from '@/components/Formula';
import { Num } from '@/components/Num';
import { drawGlowPath } from '@/lib/canvasPrimitives';
import { withAlpha } from '@/lib/canvasTheme';
import { fmtResistance, fmtTime } from '@/lib/formatters';
import { drawLabel } from '@/lib/canvasLayout';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

interface Props {
  figure: string;
}

interface RCContext {
  Vc: number;
  simT: number;
  trace: Array<{ t: number; v: number }>;
  vcDisplaySetter: (v: number) => void;
  vcDisplayAccum: number;
}

export function ChargingCurveDemo({ figure }: Props) {
  const V0 = 12;
  const [R, setR] = useState(1000); // ohms
  const [Cuf, setCuf] = useState(220); // µF
  const [closed, setClosed] = useState(true);

  const C = Cuf * 1e-6;
  const tau = R * C;
  const t99 = 5 * tau; // ~99.3% in 5τ

  const [VcDisplay, setVcDisplay] = useState(0);

  const stateRef = useSimState({ R, C, closed, setVcDisplay });

  // Reset the integrator when the switch toggles.
  // Resetting goes through a ref so we don't re-create the rAF loop.
  const [resetTick, setResetTick] = useState(0);
  useEffect(() => {
    setResetTick((t) => t + 1);
  }, [closed]);

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w: W, h: H, colors }, state, dt, _simTime, c) => {
      const { R: Rnow, C: Cnow, closed: closedNow, setVcDisplay: setVc } = state;
      const tauNow = Math.max(Rnow * Cnow, 1e-9);
      if (closedNow) {
        c.Vc += (V0 - c.Vc) * (dt / tauNow);
      }
      c.simT += dt;
      c.trace.push({ t: c.simT, v: c.Vc });

      // Throttled JSX readout — sample at ~12 Hz to avoid flooding React.
      c.vcDisplayAccum += dt;
      if (c.vcDisplayAccum >= 0.08) {
        c.vcDisplayAccum = 0;
        setVc(c.Vc);
      }

      const PLOT_DURATION = Math.max(6 * tauNow, 0.05);
      const tCut = Math.max(0, c.simT - PLOT_DURATION);
      while (c.trace.length && c.trace[0]!.t < tCut) c.trace.shift();

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, W, H);

      const pX = 30,
        pY = 26;
      const pW = W - 60,
        pH = H - 60;
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.strokeRect(pX, pY, pW, pH);

      const yV = (v: number) => pY + pH - (v / V0) * pH;
      const xT = (tt: number) => pX + (tt / PLOT_DURATION) * pW;

      // Reference lines: V0, 63%, 99%
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = colors.accent;
      ctx.setLineDash([4, 4]);
      const y0line = yV(V0);
      ctx.beginPath();
      ctx.moveTo(pX, y0line);
      ctx.lineTo(pX + pW, y0line);
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = colors.teal;
      const y63 = yV(V0 * (1 - 1 / Math.E));
      ctx.beginPath();
      ctx.moveTo(pX, y63);
      ctx.lineTo(pX + pW, y63);
      ctx.stroke();
      ctx.restore();

      ctx.strokeStyle = colors.borderStrong;
      const y99 = yV(V0 * 0.99);
      ctx.beginPath();
      ctx.moveTo(pX, y99);
      ctx.lineTo(pX + pW, y99);
      ctx.stroke();
      ctx.setLineDash([]);

      // τ and 5τ markers
      ctx.save();
      ctx.globalAlpha = 0.6;
      ctx.strokeStyle = colors.teal;
      ctx.setLineDash([3, 3]);
      const xTau = xT(tauNow);
      if (xTau < pX + pW) {
        ctx.beginPath();
        ctx.moveTo(xTau, pY);
        ctx.lineTo(xTau, pY + pH);
        ctx.stroke();
      }
      ctx.restore();
      ctx.strokeStyle = colors.borderStrong;
      const x5tau = xT(5 * tauNow);
      if (x5tau < pX + pW) {
        ctx.beginPath();
        ctx.moveTo(x5tau, pY);
        ctx.lineTo(x5tau, pY + pH);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // Trace
      if (c.trace.length > 1) {
        const pts: { x: number; y: number }[] = [];
        for (let i = 0; i < c.trace.length; i++) {
          const p = c.trace[i]!;
          pts.push({ x: xT(p.t - tCut), y: yV(p.v) });
        }
        drawGlowPath(ctx, pts, {
          color: withAlpha(colors.pink, 0.95),
          glowColor: withAlpha(colors.pink, 0.35),
          lineWidth: 1.8,
        });
      }

      // Labels
      ctx.fillStyle = colors.accent;
      drawLabel(ctx, {
        text: `V₀ = ${V0} V`,
        x: pX + pW - 4,
        y: y0line - 2,
        font: '10px "JetBrains Mono", monospace',
        align: 'right',
        baseline: 'bottom',
      });
      ctx.fillStyle = colors.teal;
      drawLabel(ctx, {
        text: '63% V₀  (after 1τ)',
        x: pX + pW - 4,
        y: y63 - 2,
        font: '10px "JetBrains Mono", monospace',
        align: 'right',
        baseline: 'bottom',
      });
      ctx.fillStyle = colors.textDim;
      drawLabel(ctx, {
        text: '99% V₀  (after 5τ)',
        x: pX + pW - 4,
        y: y99 - 2,
        font: '10px "JetBrains Mono", monospace',
        align: 'right',
        baseline: 'bottom',
      });

      ctx.fillStyle = colors.teal;
      drawLabel(ctx, {
        text: `τ = RC`,
        x: Math.min(xTau + 4, pX + pW - 60),
        y: pY + 4,
        font: '10px "JetBrains Mono", monospace',
        baseline: 'top',
      });

      ctx.fillStyle = colors.textDim;
      drawLabel(ctx, {
        text: 'V_C(t)',
        x: pX,
        y: 8,
        font: '10px "JetBrains Mono", monospace',
        baseline: 'top',
      });
      drawLabel(ctx, {
        text: `V_C = ${c.Vc.toFixed(2)} V`,
        x: pX + pW,
        y: 8,
        font: '10px "JetBrains Mono", monospace',
        align: 'right',
        baseline: 'top',
      });
      drawLabel(ctx, {
        text: `window: ${fmtTime(PLOT_DURATION)} (6τ)`,
        x: pX + pW / 2,
        y: H - 6,
        font: '10px "JetBrains Mono", monospace',
        align: 'center',
        baseline: 'bottom',
      });
    },
    [resetTick],
    () => ({
      context: {
        Vc: 0,
        simT: 0,
        trace: [] as Array<{ t: number; v: number }>,
        vcDisplaySetter: () => undefined,
        vcDisplayAccum: 0,
      } as RCContext,
    }),
  );

  return (
    <Demo
      figure={figure}
      title="The RC charging curve"
      question="How long does it take a capacitor to charge through a resistor?"
      caption={
        <>
          Close the switch and the capacitor voltage approaches the battery exponentially. After one
          time constant
          <strong> τ = RC</strong> it has reached <strong>63%</strong> of V₀; after five it is past{' '}
          <strong>99%</strong>. Scale R or C and the whole curve stretches or compresses; the shape
          is invariant.
        </>
      }
      deeperLab={{ slug: 'capacitance', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={260} setup={setup} />
      <DemoControls>
        <MiniToggle
          label={closed ? 'Switch closed' : 'Switch open'}
          checked={closed}
          onChange={setClosed}
        />
        <MiniSlider
          label="R"
          value={R}
          min={100}
          max={10000}
          step={100}
          format={fmtResistance}
          onChange={setR}
        />
        <MiniSlider
          label="C"
          value={Cuf}
          min={1}
          max={2200}
          step={1}
          format={(v) => v.toFixed(0) + ' µF'}
          onChange={setCuf}
        />
        <MiniReadout label="τ = RC" value={fmtTime(tau)} />
        <MiniReadout label="5τ (≈99%)" value={fmtTime(t99)} />
        <MiniReadout label="V_C(now)" value={<Num value={VcDisplay} />} unit="V" />
      </DemoControls>
      <EquationStrip
        leftLabel="Capacitor voltage vs. time"
        left={
          <M
            tex={
              `V_{C}(t) \\;=\\; V_{0}\\!\\left(1 - e^{-t/\\tau}\\right) ` +
              `\\quad\\text{with } V_{0} = 12\\ \\text{V}`
            }
          />
        }
        rightLabel="Current setting"
        right={
          <M
            tex={
              `\\tau \\;=\\; RC \\;=\\; ` +
              `(${(R / 1000).toFixed(2)}\\ \\text{k}\\Omega)(${Cuf}\\ \\mu\\text{F}) ` +
              `\\;\\approx\\; ${tau >= 1 ? tau.toFixed(2) + '\\ \\text{s}' : (tau * 1000).toFixed(1) + '\\ \\text{ms}'}`
            }
          />
        }
      />
    </Demo>
  );
}
