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
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';

interface Props {
  figure?: string;
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

  const stateRef = useRef({ tauLoad });
  useEffect(() => {
    stateRef.current.tauLoad = tauLoad;
  }, [tauLoad]);

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

  const setup = useCallback(
    (info: CanvasInfo) => {
      const { ctx, w, h, colors } = info;
      let raf = 0;
      let lastT = performance.now();
      let omega = 0;
      const histI: number[] = [];
      const histE: number[] = [];

      function draw() {
        const now = performance.now();
        let dt = (now - lastT) / 1000;
        lastT = now;
        if (dt > 0.05) dt = 0.05;

        const { tauLoad } = stateRef.current;
        const backEMF = K_E * omega;
        const I = (V_SUPPLY - backEMF) / R_WIND;
        const tauMotor = K_T * I;
        const tauNet = tauMotor - B_VISC * omega - tauLoad;
        omega += (tauNet / J_ROT) * dt;
        if (omega < 0) omega = 0;

        histI.push(I);
        histE.push(backEMF);
        if (histI.length > HISTORY_LEN) histI.shift();
        if (histE.length > HISTORY_LEN) histE.shift();

        // Layout: scope on top, bar plot below.
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
        for (let i = 0; i < histI.length; i++) {
          const x = xT(HISTORY_LEN - histI.length + i);
          const y = yI(histI[i]);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Back-EMF trace (blue)
        ctx.strokeStyle = colors.blue;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < histE.length; i++) {
          const x = xT(HISTORY_LEN - histE.length + i);
          const y = yE(histE[i]);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Axis labels
        ctx.fillStyle = colors.textDim;
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText('I → V/R', padL - 6, yI(V_SUPPLY / R_WIND));
        ctx.fillText('0', padL - 6, yI(0));
        ctx.textAlign = 'left';
        ctx.fillText('E_back → V', padL + plotW + 6, yE(V_SUPPLY));

        // Legend
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        const legX = padL + 8;
        let legY = padT + 6;
        const lg = (color: string, label: string) => {
          ctx.fillStyle = color;
          ctx.fillRect(legX, legY + 4, 14, 3);
          ctx.fillStyle = colors.text;
          ctx.fillText(label, legX + 20, legY + 1);
          legY += 14;
        };
        lg('rgba(108,197,194,0.55)', 'V_applied (constant)');
        lg('#5baef8', 'back-EMF = k_e ω');
        lg('#ff6b2a', 'current I = (V − E_back)/R');

        // Time axis
        ctx.save();
        ctx.globalAlpha = 0.65;
        ctx.fillStyle = colors.textDim;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText('time →', padL + plotW / 2, padT + plotH + 6);
        ctx.restore();

        raf = requestAnimationFrame(draw);
      }
      raf = requestAnimationFrame(draw);
      return () => cancelAnimationFrame(raf);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [restartTick],
  );

  return (
    <Demo
      figure={figure ?? 'Fig. 16.7'}
      title="Back-EMF and the inrush current"
      question="Why does a stalled motor pull 10× its rated current — and what stops it from doing that once running?"
      caption={
        <>
          Brushed DC motor with V = 12 V, R = 1 Ω, k_e = 0.05 V·s/rad. At <em>t</em> = 0 the rotor
          is stationary and the full 12 V drops across the winding, so I = V/R = 12 A — the inrush.
          As the rotor accelerates, back-EMF rises (E = k_e ω); the net voltage across R falls;
          current collapses to its small running value, just enough to balance load torque. Increase
          the load and steady-state current rises again.
        </>
      }
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
    </Demo>
  );
}
