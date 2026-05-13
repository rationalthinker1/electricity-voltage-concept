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
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';

interface Props { figure?: string }

export function PowerFactorDemo({ figure }: Props) {
  const [R, setR] = useState(20);         // Ω
  const [Lmh, setLmh] = useState(30);     // mH
  const [f, setF] = useState(60);         // Hz
  const Vp = 100;                          // V (fixed peak)

  const L = Lmh * 1e-3;
  const omega = 2 * Math.PI * f;
  const XL = omega * L;
  const Zmag = Math.sqrt(R * R + XL * XL);
  const phi = Math.atan2(XL, R);          // rad
  const Ip = Vp / Zmag;
  const Vrms = Vp / Math.SQRT2;
  const Irms = Ip / Math.SQRT2;
  const Preal = Vrms * Irms * Math.cos(phi);
  const Qreac = Vrms * Irms * Math.sin(phi);
  const Sapp = Vrms * Irms;
  const pf = Math.cos(phi);

  const stateRef = useRef({ Vp, Ip, phi, omega, Preal });
  useEffect(() => {
    stateRef.current = { Vp, Ip, phi, omega, Preal };
  }, [Vp, Ip, phi, omega, Preal]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h } = info;
    let raf = 0;

    function draw() {
      const { Vp, Ip, phi, omega, Preal } = stateRef.current;

      ctx.fillStyle = '#0d0d10';
      ctx.fillRect(0, 0, w, h);

      const padL = 50, padR = 60, padT = 18, padB = 22;
      const plotW = w - padL - padR;
      const plotH = h - padT - padB;
      const yMid = padT + plotH / 2;

      // Time axis: two full periods
      const T = 2 * Math.PI / omega;
      const tMax = 2 * T;
      const xOf = (t: number) => padL + (t / tMax) * plotW;

      // Compute peak instantaneous power for scaling
      const pMax = Vp * Ip; // worst case
      const yScaleP = (plotH / 2) / Math.max(pMax, 1e-3);
      const yScaleV = (plotH / 2) / Math.max(Vp, 1e-3);
      const yScaleI = (plotH / 2) / Math.max(Ip, 1e-3);

      // Frame
      ctx.strokeStyle = 'rgba(255,255,255,0.10)';
      ctx.lineWidth = 1;
      ctx.strokeRect(padL, padT, plotW, plotH);
      // Zero line
      ctx.beginPath();
      ctx.moveTo(padL, yMid); ctx.lineTo(padL + plotW, yMid);
      ctx.stroke();

      // Vertical T marker
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(xOf(T), padT); ctx.lineTo(xOf(T), padT + plotH);
      ctx.stroke();
      ctx.setLineDash([]);

      const N = 320;

      // Instantaneous power p(t) — shaded
      ctx.fillStyle = 'rgba(255,59,110,0.18)';
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

      // v(t) — orange
      ctx.strokeStyle = 'rgba(255,107,42,0.95)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (let i = 0; i <= N; i++) {
        const t = (i / N) * tMax;
        const v = Vp * Math.cos(omega * t);
        const x = xOf(t);
        const y = yMid - v * yScaleV;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // i(t) — teal
      ctx.strokeStyle = 'rgba(108,197,194,0.95)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (let i = 0; i <= N; i++) {
        const t = (i / N) * tMax;
        const ii = Ip * Math.cos(omega * t - phi);
        const x = xOf(t);
        const y = yMid - ii * yScaleI;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // p(t) — pink line on top of shading
      ctx.strokeStyle = 'rgba(255,59,110,0.95)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (let i = 0; i <= N; i++) {
        const t = (i / N) * tMax;
        const v = Vp * Math.cos(omega * t);
        const ii = Ip * Math.cos(omega * t - phi);
        const p = v * ii;
        const x = xOf(t);
        const y = yMid - p * yScaleP;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Mean-power dashed line
      const yMean = yMid - Preal * yScaleP;
      ctx.strokeStyle = 'rgba(255,107,42,0.6)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(padL, yMean); ctx.lineTo(padL + plotW, yMean);
      ctx.stroke();
      ctx.setLineDash([]);

      // Labels
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(255,107,42,0.95)';
      ctx.fillText('v(t)', padL + plotW + 4, padT + 10);
      ctx.fillStyle = 'rgba(108,197,194,0.95)';
      ctx.fillText('i(t)', padL + plotW + 4, padT + 24);
      ctx.fillStyle = 'rgba(255,59,110,0.95)';
      ctx.fillText('p(t)=v·i', padL + plotW + 4, padT + 38);
      ctx.fillStyle = 'rgba(255,107,42,0.8)';
      ctx.fillText('⟨p⟩ = P', padL + plotW + 4, yMean);

      ctx.fillStyle = 'rgba(160,158,149,0.65)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('T', xOf(T), padT + plotH + 4);
      ctx.fillText('2T', xOf(tMax), padT + plotH + 4);

      // Header
      ctx.fillStyle = 'rgba(160,158,149,0.85)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(`φ = ${(phi * 180 / Math.PI).toFixed(1)}°,   pf = cos(φ) = ${Math.cos(phi).toFixed(3)}`, padL, 4);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 12.5b'}
      title="Power factor — the average of v·i for an R+L load"
      question="Crank L up. The shaded area under p(t) — the energy actually delivered — shrinks."
      caption={<>
        Drive a series R+L load with a sine V<sub>p</sub> = 100 V. The current lags by
        φ = atan(ωL/R); the instantaneous power p(t) = v·i oscillates at <em>twice</em> the line
        frequency. Its time-average ⟨p⟩ = V<sub>rms</sub> I<sub>rms</sub> cos(φ) is the real
        power P, marked by the dashed line. At φ = 0 (pure R) the whole product sits above zero —
        pf = 1. At φ → 90° (pure L), p(t) becomes symmetric about zero, ⟨p⟩ → 0, pf → 0 — the load
        draws current but delivers no net energy each cycle.
      </>}
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        <MiniSlider label="R" value={R} min={1} max={100} step={1}
          format={v => v.toFixed(0) + ' Ω'} onChange={setR} />
        <MiniSlider label="L" value={Lmh} min={0.1} max={200} step={0.1}
          format={v => v.toFixed(1) + ' mH'} onChange={setLmh} />
        <MiniSlider label="f" value={f} min={10} max={400} step={1}
          format={v => v.toFixed(0) + ' Hz'} onChange={setF} />
        <MiniReadout label="ωL" value={<Num value={XL} />} unit="Ω" />
        <MiniReadout label="|Z|" value={<Num value={Zmag} />} unit="Ω" />
        <MiniReadout label="pf = cos φ" value={pf.toFixed(3)} />
        <MiniReadout label="P (real)" value={<Num value={Preal} />} unit="W" />
        <MiniReadout label="Q (reactive)" value={<Num value={Qreac} />} unit="VAR" />
        <MiniReadout label="S (apparent)" value={<Num value={Sapp} />} unit="VA" />
      </DemoControls>
    </Demo>
  );
}
