/**
 * Demo D16.7 — Back-EMF in a running DC motor
 *
 * Steady-state model of a brushed DC motor with winding resistance R,
 * back-EMF constant k_e, and a load torque τ_L. Mechanical:
 *   J dω/dt = k_t · I − b·ω − τ_L
 * Electrical:
 *   V = I·R + k_e·ω    (back-EMF opposes supply)
 *
 * At stall (ω = 0): I = V/R (large). At full speed (light load): back-EMF
 * nearly cancels V; current collapses. Reader slides load torque; the
 * scope plots show I(t), V_applied (constant), back-EMF(t) approach steady.
 */
import { useMemo, useState } from 'react';
import { withAlpha } from '@/lib/canvasTheme';
import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, EquationStrip, MiniReadout, MiniSlider } from '@/components/Demo';
import { M } from '@/components/Formula';
import { Num } from '@/components/Num';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';
import { drawLabel } from '@/lib/canvasLayout';

interface Props {
  figure: string;
}

// Model parameters (small-motor scale).
const V_SUPPLY = 12; // V
const R_WIND = 1.0; // Ω
const K_E = 0.05; // V·s/rad  (back-EMF constant)
const K_T = 0.05; // N·m/A     (torque constant — equal in SI)
const J_ROT = 1.5e-4; // kg·m² (rotor inertia)
const B_VISC = 1.5e-4; // N·m·s/rad (viscous loss)

const HISTORY_LEN = 240; // samples in the scope window

export function BackEMFInRunningMotorDemo({ figure }: Props) {
  const [tauLoad, setTauLoad] = useState(0.1); // N·m
  const [restartTick, setRestartTick] = useState(0);

  const stateRef = useSimState({ tauLoad });

  // Steady-state algebra: at dω/dt = 0
  //   I·k_t = b·ω + τ_L
  //   V = I·R + k_e·ω
  // Solve: ω_ss = (k_t V − R τ_L) / (k_t k_e + R b)
  const computed = useMemo(() => {
    const omegaSS = (K_T * V_SUPPLY - R_WIND * tauLoad) / (K_T * K_E + R_WIND * B_VISC);
    const omegaClamped = Math.max(0, omegaSS);
    const backEMFss = K_E * omegaClamped;
    const Iss = (V_SUPPLY - backEMFss) / R_WIND;
    const Istart = V_SUPPLY / R_WIND; // ω = 0
    return {
      omegaSS: omegaClamped,
      backEMFss,
      Iss,
      Istart,
      rpm: (omegaClamped * 60) / (2 * Math.PI),
    };
  }, [tauLoad]);

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, colors }, _state, dt, _simTime, ctx0) => {
      const { tauLoad } = stateRef.current;
      const backEMF = K_E * ctx0.omega;
      const I = (V_SUPPLY - backEMF) / R_WIND;
      const tauMotor = K_T * I;
      const tauNet = tauMotor - B_VISC * ctx0.omega - tauLoad;
      ctx0.omega += (tauNet / J_ROT) * dt;
      if (ctx0.omega < 0) ctx0.omega = 0;

      ctx0.histI.push(I);
      ctx0.histE.push(backEMF);
      if (ctx0.histI.length > HISTORY_LEN) ctx0.histI.shift();
      if (ctx0.histE.length > HISTORY_LEN) ctx0.histE.shift();

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      const padL = 56,
        padR = 24,
        padT = 18,
        padB = 22;
      const plotH = h - padT - padB;
      const plotW = w - padL - padR;

      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.strokeRect(padL, padT, plotW, plotH);

      // Y axes: current 0..V/R (max), back-EMF 0..V
      const yI = (v: number) => padT + plotH - (v / (V_SUPPLY / R_WIND)) * plotH;
      const yE = (v: number) => padT + plotH - (v / V_SUPPLY) * plotH;
      const xT = (i: number) => padL + (i / (HISTORY_LEN - 1)) * plotW;

      // Gridlines
      ctx.strokeStyle = colors.border;
      for (let i = 1; i < 4; i++) {
        const y = padT + (i / 4) * plotH;
        ctx.beginPath();
        ctx.moveTo(padL, y);
        ctx.lineTo(padL + plotW, y);
        ctx.stroke();
      }

      // V_applied — flat line at top (constant)
      ctx.strokeStyle = colors.teal;
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(padL, yE(V_SUPPLY));
      ctx.lineTo(padL + plotW, yE(V_SUPPLY));
      ctx.stroke();
      ctx.setLineDash([]);

      // Current trace (amber)
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < ctx0.histI.length; i++) {
        const x = xT(HISTORY_LEN - ctx0.histI.length + i);
        const y = yI(ctx0.histI[i]);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Back-EMF trace (blue)
      ctx.strokeStyle = colors.blue;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < ctx0.histE.length; i++) {
        const x = xT(HISTORY_LEN - ctx0.histE.length + i);
        const y = yE(ctx0.histE[i]);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Axis labels
      ctx.fillStyle = colors.textDim;
      drawLabel(ctx, {
        text: 'I → V/R',
        x: padL - 6,
        y: yI(V_SUPPLY / R_WIND),
        font: '10px "JetBrains Mono", monospace',
        align: 'right',
        baseline: 'middle',
      });
      drawLabel(ctx, {
        text: '0',
        x: padL - 6,
        y: yI(0),
        font: '10px "JetBrains Mono", monospace',
        align: 'right',
        baseline: 'middle',
      });
      drawLabel(ctx, {
        text: 'E_back → V',
        x: padL + plotW + 6,
        y: yE(V_SUPPLY),
        font: '10px "JetBrains Mono", monospace',
        baseline: 'middle',
      });

      // Legend
      const legX = padL + 8;
      let legY = padT + 6;
      const lg = (color: string, label: string) => {
        ctx.fillStyle = color;
        ctx.fillRect(legX, legY + 4, 14, 3);
        drawLabel(ctx, { text: label, x: legX + 20, y: legY + 1, color: colors.text });
        legY += 14;
      };
      lg(withAlpha(colors.teal, 0.55), 'V_applied (constant)');
      lg(colors.blue, 'back-EMF = k_e ω');
      lg(colors.accent, 'current I = (V − E_back)/R');

      // Time axis
      ctx.save();
      ctx.globalAlpha = 0.65;
      drawLabel(ctx, {
        text: 'time →',
        x: padL + plotW / 2,
        y: padT + plotH + 6,
        align: 'center',
        baseline: 'top',
      });
      ctx.restore();
    },
    [restartTick],
    () => ({ context: { omega: 0, histI: [] as number[], histE: [] as number[] } }),
  );

  return (
    <Demo
      figure={figure}
      title="Back-EMF and the inrush current"
      question="Why does a stalled motor pull several times its rated current — and what stops it from doing that once running?"
      caption={
        <>
          Brushed DC motor with <M tex="V = 12\,\text{V}" />, <M tex="R = 1\,\Omega" />, and{' '}
          <M tex="k_e = 0.05\,\text{V·s/rad}" />. At <M tex="t = 0" /> the rotor is stationary and
          the full 12 V drops across the winding, so <M tex="I = V/R = 12\,\text{A}" /> — the
          inrush. As the rotor accelerates, back-EMF rises (<M tex="E = k_e\omega" />
          ); the net voltage across <M tex="R" /> falls; current collapses to its small running
          value, just enough to balance load torque. Increase the load and steady-state current
          rises again.
        </>
      }
      deeperLab={{ slug: 'motor-torque-speed', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={260} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="load torque τ_L"
          value={tauLoad}
          min={0}
          max={0.4}
          step={0.01}
          format={(v) => v.toFixed(2) + ' N·m'}
          onChange={setTauLoad}
        />
        <MiniReadout
          label="I startup (ω=0)"
          value={<Num value={computed.Istart} digits={1} />}
          unit="A"
        />
        <MiniReadout
          label="I running (ss)"
          value={<Num value={computed.Iss} digits={2} />}
          unit="A"
        />
        <MiniReadout
          label="back-EMF (ss)"
          value={<Num value={computed.backEMFss} digits={2} />}
          unit="V"
        />
        <MiniReadout
          label="speed (ss)"
          value={<Num value={computed.rpm} digits={0} />}
          unit="rpm"
        />
        <button
          type="button"
          className="mini-toggle"
          onClick={() => setRestartTick((t) => t + 1)}
          style={{ marginLeft: 'auto' }}
        >
          restart
        </button>
      </DemoControls>
      <EquationStrip
        leftLabel="back-EMF"
        left={
          <M tex={`E_{\\text{back}} = k_e\\omega = ${computed.backEMFss.toFixed(2)}\\,\\text{V}`} />
        }
        rightLabel="running current"
        right={<M tex={`I = (V - E_{\\text{back}})/R = ${computed.Iss.toFixed(2)}\\,\\text{A}`} />}
      />
    </Demo>
  );
}
