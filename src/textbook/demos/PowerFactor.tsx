/**
 * Demo D12.5b — Power factor in an R + L AC load
 *
 *   Z = R + jωL,    |Z| = √(R² + (ωL)²),    φ = atan(ωL / R)
 *   v(t) = V_p cos(ωt)
 *   i(t) = (V_p / |Z|) cos(ωt − φ)
 *   p(t) = v·i
 *   ⟨p⟩ = (V_p² / (2|Z|)) cos(φ) = V_rms I_rms cos(φ)   = P (real)
 *   reactive Q = V_rms I_rms sin(φ)
 *
 * Three traces share a time axis: v (orange), i (teal), and p (pink).
 * The dashed horizontal line marks ⟨p⟩ = P. As φ → 90° the average flattens
 * to zero, the load draws current but absorbs no net energy — pure reactive.
 */
import { useState } from 'react';
import { drawLabel } from '@/lib/canvasLayout';
import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, EquationStrip, MiniReadout, MiniSlider } from '@/components/Demo';
import { M } from '@/components/Formula';
import { Num } from '@/components/Num';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

interface Props {
  figure: string;
}

export function PowerFactorDemo({ figure }: Props) {
  const [R, setR] = useState(20); // Ω
  const [Lmh, setLmh] = useState(30); // mH
  const [f, setF] = useState(60); // Hz
  const Vp = 100; // V (fixed peak)

  const L = Lmh * 1e-3;
  const omega = 2 * Math.PI * f;
  const XL = omega * L;
  const Zmag = Math.sqrt(R * R + XL * XL);
  const phi = Math.atan2(XL, R); // rad
  const Ip = Vp / Zmag;
  const Vrms = Vp / Math.SQRT2;
  const Irms = Ip / Math.SQRT2;
  const Preal = Vrms * Irms * Math.cos(phi);
  const Qreac = Vrms * Irms * Math.sin(phi);
  const Sapp = Vrms * Irms;
  const pf = Math.cos(phi);

  const stateRef = useSimState({ Vp, Ip, phi, omega, Preal });
  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, colors }, _state, _dt, _simTime) => {
      const { Vp, Ip, phi, omega, Preal } = stateRef.current;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);
      const padL = 50,
        padR = 60,
        padT = 18,
        padB = 22;
      const plotW = w - padL - padR;
      const plotH = h - padT - padB;
      const yMid = padT + plotH / 2;
      const T = (2 * Math.PI) / omega;
      const tMax = 2 * T;
      const xOf = (t: number) => padL + (t / tMax) * plotW;
      const pMax = Vp * Ip;
      const yScaleP = plotH / 2 / Math.max(pMax, 1e-3);
      const yScaleV = plotH / 2 / Math.max(Vp, 1e-3);
      const yScaleI = plotH / 2 / Math.max(Ip, 1e-3);
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.strokeRect(padL, padT, plotW, plotH);
      ctx.beginPath();
      ctx.moveTo(padL, yMid);
      ctx.lineTo(padL + plotW, yMid);
      ctx.stroke();
      ctx.strokeStyle = colors.border;
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(xOf(T), padT);
      ctx.lineTo(xOf(T), padT + plotH);
      ctx.stroke();
      ctx.setLineDash([]);
      const N = 320;
      ctx.fillStyle = colors.pink;
      ctx.beginPath();
      ctx.moveTo(padL, yMid);
      for (let i = 0; i <= N; i++) {
        const t = (i / N) * tMax;
        const v = Vp * Math.cos(omega * t);
        const ii = Ip * Math.cos(omega * t - phi);
        const p = v * ii;
        const x = xOf(t);
        const y = yMid - p * yScaleP;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(padL + plotW, yMid);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (let i = 0; i <= N; i++) {
        const t = (i / N) * tMax;
        const v = Vp * Math.cos(omega * t);
        const x = xOf(t);
        const y = yMid - v * yScaleV;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.strokeStyle = colors.teal;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (let i = 0; i <= N; i++) {
        const t = (i / N) * tMax;
        const ii = Ip * Math.cos(omega * t - phi);
        const x = xOf(t);
        const y = yMid - ii * yScaleI;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.strokeStyle = colors.pink;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (let i = 0; i <= N; i++) {
        const t = (i / N) * tMax;
        const v = Vp * Math.cos(omega * t);
        const ii = Ip * Math.cos(omega * t - phi);
        const p = v * ii;
        const x = xOf(t);
        const y = yMid - p * yScaleP;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      const yMean = yMid - Preal * yScaleP;
      ctx.save();
      ctx.globalAlpha = 0.6;
      ctx.strokeStyle = colors.accent;
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(padL, yMean);
      ctx.lineTo(padL + plotW, yMean);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      drawLabel(ctx, { text: 'v(t)', x: padL + plotW + 4, y: padT + 10, color: colors.accent });
      drawLabel(ctx, { text: 'i(t)', x: padL + plotW + 4, y: padT + 24, color: colors.teal });
      drawLabel(ctx, { text: 'p(t)=v·i', x: padL + plotW + 4, y: padT + 38, color: colors.pink });
      ctx.save();
      ctx.globalAlpha = 0.8;
      drawLabel(ctx, { text: '⟨p⟩ = P', x: padL + plotW + 4, y: yMean, color: colors.accent });
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = 0.65;
      ctx.fillStyle = colors.textDim;
      drawLabel(ctx, {
        text: 'T',
        x: xOf(T),
        y: padT + plotH + 4,
        align: 'center',
        baseline: 'top',
      });
      drawLabel(ctx, {
        text: '2T',
        x: xOf(tMax),
        y: padT + plotH + 4,
        align: 'center',
        baseline: 'top',
      });
      ctx.restore();
      drawLabel(ctx, {
        x: padL,
        y: 4,
        text: `φ = ${((phi * 180) / Math.PI).toFixed(1)}°,   pf = cos(φ) = ${Math.cos(phi).toFixed(3)}`,
        color: colors.textDim,
        baseline: 'top',
      });
    },
    [],
  );

  return (
    <Demo
      figure={figure}
      title="Power factor — the average of v·i for an R+L load"
      question="Crank L up. The shaded area under p(t) — the energy actually delivered — shrinks."
      deeperLab={{ slug: 'ac-impedance', label: 'See full lab' }}
      caption={
        <>
          Drive a series R+L load with a sine V<sub>p</sub> = 100 V. The current lags by φ =
          atan(ωL/R); the instantaneous power p(t) = v·i oscillates at <em>twice</em> the line
          frequency. Its time-average ⟨p⟩ = V<sub>rms</sub> I<sub>rms</sub> cos(φ) is the real power
          P, marked by the dashed line. At φ = 0 (pure R) the whole product sits above zero — pf =
          1. At φ → 90° (pure L), p(t) becomes symmetric about zero, ⟨p⟩ → 0, pf → 0 — the load
          draws current but delivers no net energy each cycle.
        </>
      }
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="R"
          value={R}
          min={1}
          max={100}
          step={1}
          format={(v) => v.toFixed(0) + ' Ω'}
          onChange={setR}
        />
        <MiniSlider
          label="L"
          value={Lmh}
          min={0.1}
          max={200}
          step={0.1}
          format={(v) => v.toFixed(1) + ' mH'}
          onChange={setLmh}
        />
        <MiniSlider
          label="f"
          value={f}
          min={10}
          max={400}
          step={1}
          format={(v) => v.toFixed(0) + ' Hz'}
          onChange={setF}
        />
        <MiniReadout label="ωL" value={<Num value={XL} />} unit="Ω" />
        <MiniReadout label="|Z|" value={<Num value={Zmag} />} unit="Ω" />
        <MiniReadout label="pf = cos φ" value={pf.toFixed(3)} />
        <MiniReadout label="P (real)" value={<Num value={Preal} />} unit="W" />
        <MiniReadout label="Q (reactive)" value={<Num value={Qreac} />} unit="VAR" />
        <MiniReadout label="S (apparent)" value={<Num value={Sapp} />} unit="VA" />
      </DemoControls>
      <EquationStrip
        leftLabel="Real power"
        left={
          <M
            tex={`\\langle P \\rangle = V_\\text{rms}\\,I_\\text{rms}\\cos\\varphi = ${Vrms.toFixed(1)}\\times${Irms.toFixed(3)}\\times${pf.toFixed(3)} = ${Preal.toFixed(1)}\\,\\text{W}`}
          />
        }
        rightLabel="Power factor"
        right={
          <M
            tex={`\\text{pf} = \\cos(${((phi * 180) / Math.PI).toFixed(1)}^{\\circ}) = ${pf.toFixed(3)}`}
          />
        }
      />
    </Demo>
  );
}
