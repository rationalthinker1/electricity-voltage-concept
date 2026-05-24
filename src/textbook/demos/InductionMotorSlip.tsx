/**
 * Demo D16.3 — Three-phase induction motor (slip)
 *
 * Three-phase stator currents produce a rotating magnetic field at
 * synchronous speed n_s = 120 f / p RPM (p poles). A squirrel-cage rotor
 * lags behind by the slip fraction s = (n_s − n) / n_s. The lag induces
 * currents in the rotor bars, which interact with the stator field to
 * produce torque. The model:
 *   τ ∝ s (linear region — operating near synchronous speed)
 *   load_torque set by slider → solve for s in steady state
 *
 * Sliders: line frequency f, load torque (arbitrary units).
 * Readouts: synchronous RPM, rotor RPM, slip%, torque.
 */
import { useMemo, useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, EquationStrip, MiniReadout, MiniSlider } from '@/components/Demo';
import { M } from '@/components/Formula';
import { Num } from '@/components/Num';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';
import { withAlpha } from '@/lib/canvasTheme';
import { drawLabel } from '@/lib/canvasLayout';

interface Props {
  figure: string;
}

const POLES = 4; // 4-pole machine — synchronous speed at 60 Hz = 1800 RPM

export function InductionMotorSlipDemo({ figure }: Props) {
  const [f, setF] = useState(60);
  // Load as fraction of max stable torque (0..1). Operating region is the
  // linear part of the torque/slip curve before pull-out.
  const [load, setLoad] = useState(0.5);

  const stateRef = useSimState({ f, load });
  const computed = useMemo(() => {
    // Synchronous speed (RPM): n_s = 120 f / p
    const n_s = (120 * f) / POLES;
    // Linear regime: slip is proportional to load (up to pull-out at s≈0.15)
    // Take torque = (s / s_max) * τ_max; here τ_max chosen so load=1 → s=0.05.
    const s_at_full_load = 0.05;
    const s = load * s_at_full_load; // dimensionless slip
    const n = n_s * (1 - s); // rotor RPM
    return { n_s, n, s };
  }, [f, load]);

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, colors }, _state, dt, _simTime, ctx0) => {
      let statorAng = ctx0.statorAng;
      let rotorAng = ctx0.rotorAng;
      const { f, load } = stateRef.current;
      const omega_s = (4 * Math.PI * f) / POLES;
      const slip = load * 0.05;
      const omega_rotor = omega_s * (1 - slip);
      const visCap = 3.0;
      const scale = omega_s > visCap ? visCap / omega_s : 1;
      statorAng += omega_s * scale * dt;
      rotorAng += omega_rotor * scale * dt;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;
      const R = Math.min(w, h) * 0.36;
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(cx, cy, R + 18, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, R - 4, 0, Math.PI * 2);
      ctx.stroke();
      const sFx = cx + Math.cos(statorAng) * R * 0.95;
      const sFy = cy - Math.sin(statorAng) * R * 0.95;
      const sSx = cx - Math.cos(statorAng) * R * 0.95;
      const sSy = cy + Math.sin(statorAng) * R * 0.95;
      ctx.strokeStyle = colors.teal;
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sSx, sSy);
      ctx.lineTo(sFx, sFy);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = colors.teal;
      ctx.beginPath();
      ctx.arc(sFx, sFy, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = colors.teal;
      ctx.beginPath();
      ctx.arc(sSx, sSy, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = colors.bg;
      drawLabel(ctx, {
        text: 'N',
        x: sFx,
        y: sFy,
        color: colors.bg,
        weight: 'bold',
        font: '10px "JetBrains Mono"',
        align: 'center',
        baseline: 'middle',
      });
      drawLabel(ctx, {
        text: 'S',
        x: sSx,
        y: sSy,
        color: colors.bg,
        weight: 'bold',
        font: '10px "JetBrains Mono"',
        align: 'center',
        baseline: 'middle',
      });
      const bars = 12;
      const rBar = R * 0.55;
      for (let i = 0; i < bars; i++) {
        const a = rotorAng + (i / bars) * Math.PI * 2;
        const bx = cx + Math.cos(a) * rBar;
        const by = cy - Math.sin(a) * rBar;
        // Induced current strength depends on slip — brighter at higher slip
        const intensity = Math.min(1, slip * 25 + 0.15);
        ctx.fillStyle = withAlpha(colors.accent, 0.4 + 0.5 * intensity);
        ctx.beginPath();
        ctx.arc(bx, by, 5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, rBar, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = colors.border;
      ctx.beginPath();
      ctx.arc(cx, cy, rBar - 16, 0, Math.PI * 2);
      ctx.stroke();
      const refA = rotorAng;
      const rmx = cx + Math.cos(refA) * (rBar - 10);
      const rmy = cy - Math.sin(refA) * (rBar - 10);
      ctx.fillStyle = colors.accent;
      ctx.beginPath();
      ctx.arc(rmx, rmy, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.save();
      ctx.globalAlpha = 0.75;
      ctx.fillStyle = colors.textDim;
      drawLabel(ctx, {
        text: 'rotating stator field (dashed)',
        x: 12,
        y: 12,
        font: '10px "JetBrains Mono", monospace',
        baseline: 'top',
      });
      drawLabel(ctx, {
        text: 'squirrel-cage rotor',
        x: 12,
        y: 26,
        font: '10px "JetBrains Mono", monospace',
        baseline: 'top',
      });
      drawLabel(ctx, {
        text: `load = ${(load * 100).toFixed(0)}%`,
        x: w - 12,
        y: 12,
        font: '10px "JetBrains Mono", monospace',
        align: 'right',
        baseline: 'top',
      });
      drawLabel(ctx, {
        text: `slip = ${(slip * 100).toFixed(2)}%`,
        x: w - 12,
        y: 26,
        font: '10px "JetBrains Mono", monospace',
        align: 'right',
        baseline: 'top',
      });
      ctx.restore();
      ctx0.statorAng = statorAng;
      ctx0.rotorAng = rotorAng;
    },
    [],
    () => ({ context: { statorAng: 0, rotorAng: 0 } }),
  );

  return (
    <Demo
      figure={figure}
      title="The induction motor — slip is the signal"
      question="The rotor never catches up with the stator's field. Why is that a feature, not a bug?"
      caption={
        <>
          A balanced three-phase stator current creates a rotating magnetic field at synchronous
          speed <M tex="n_s = 120 f/p" />. The rotor — a squirrel cage of shorted bars on a steel
          core — lags behind by the slip <M tex="s" />. That lag changes the flux linking each bar,
          induces currents in the bars, and those currents react with the stator field to produce
          torque. No connection to the rotor; no commutator. Tesla, 1888.
        </>
      }
      deeperLab={{ slug: 'motor-torque-speed', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={320} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="line f"
          value={f}
          min={20}
          max={100}
          step={1}
          format={(v) => v.toFixed(0) + ' Hz'}
          onChange={setF}
        />
        <MiniSlider
          label="load"
          value={load}
          min={0}
          max={1}
          step={0.01}
          format={(v) => (v * 100).toFixed(0) + '%'}
          onChange={setLoad}
        />
        <MiniReadout
          label="n_synchronous"
          value={<Num value={computed.n_s} digits={0} />}
          unit="rpm"
        />
        <MiniReadout label="n_rotor" value={<Num value={computed.n} digits={0} />} unit="rpm" />
        <MiniReadout label="slip" value={(computed.s * 100).toFixed(2) + '%'} />
      </DemoControls>
      <EquationStrip
        leftLabel="synchronous speed"
        left={<M tex={`n_s = 120f/p = ${computed.n_s.toFixed(0)}\\,\\text{rpm}`} />}
        rightLabel="slip speed"
        right={
          <M
            tex={`n = n_s(1-s) = ${computed.n.toFixed(0)}\\,\\text{rpm},\\quad s = ${(computed.s * 100).toFixed(2)}\\%`}
          />
        }
      />
    </Demo>
  );
}
