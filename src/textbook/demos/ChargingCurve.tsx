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
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import {
  Demo, DemoControls, MiniReadout, MiniSlider, MiniToggle,
} from '@/components/Demo';
import { Num } from '@/components/Num';
import { drawGlowPath } from '@/lib/canvasPrimitives';
import { getCanvasColors } from '@/lib/canvasTheme';

interface Props { figure?: string }

export function ChargingCurveDemo({ figure }: Props) {
  const V0 = 12;
  const [R, setR] = useState(1000);  // ohms
  const [Cuf, setCuf] = useState(220); // µF
  const [closed, setClosed] = useState(true);

  const C = Cuf * 1e-6;
  const tau = R * C;
  const t99 = 5 * tau; // ~99.3% in 5τ

  const stateRef = useRef({
    R, C, closed,
    Vc: 0,
    lastT: performance.now(),
    simT: 0,
    trace: [] as Array<{ t: number; v: number }>,
  });
  useEffect(() => { stateRef.current.R = R; stateRef.current.C = C; }, [R, C]);
  useEffect(() => {
    stateRef.current.closed = closed;
    stateRef.current.simT = 0;
    stateRef.current.Vc = 0;
    stateRef.current.trace = [];
  }, [closed]);

  const [VcDisplay, setVcDisplay] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setVcDisplay(stateRef.current.Vc), 80);
    return () => window.clearInterval(id);
  }, []);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w: W, h: H } = info;
    let raf = 0;
    stateRef.current.lastT = performance.now();

    function draw() {
      const s = stateRef.current;
      const now = performance.now();
      let dt = (now - s.lastT) / 1000;
      s.lastT = now;
      if (dt > 0.1) dt = 0.1;

      const tauNow = Math.max(s.R * s.C, 1e-9);
      if (s.closed) {
        s.Vc += (V0 - s.Vc) * (dt / tauNow);
      }
      s.simT += dt;
      s.trace.push({ t: s.simT, v: s.Vc });

      const PLOT_DURATION = Math.max(6 * tauNow, 0.05);
      const tCut = Math.max(0, s.simT - PLOT_DURATION);
      while (s.trace.length && s.trace[0]!.t < tCut) s.trace.shift();

      ctx.fillStyle = getCanvasColors().bg;
      ctx.fillRect(0, 0, W, H);

      const pX = 30, pY = 26;
      const pW = W - 60, pH = H - 60;
      ctx.strokeStyle = getCanvasColors().border;
      ctx.lineWidth = 1;
      ctx.strokeRect(pX, pY, pW, pH);

      const yV = (v: number) => pY + pH - (v / V0) * pH;
      const xT = (tt: number) => pX + (tt / PLOT_DURATION) * pW;

      // Reference lines: V0, 63%, 99%
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = getCanvasColors().accent;
      ctx.setLineDash([4, 4]);
      const y0line = yV(V0);
      ctx.beginPath(); ctx.moveTo(pX, y0line); ctx.lineTo(pX + pW, y0line); ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = getCanvasColors().teal;
      const y63 = yV(V0 * (1 - 1 / Math.E));
      ctx.beginPath(); ctx.moveTo(pX, y63); ctx.lineTo(pX + pW, y63); ctx.stroke();
      ctx.restore();

      ctx.strokeStyle = getCanvasColors().borderStrong;
      const y99 = yV(V0 * 0.99);
      ctx.beginPath(); ctx.moveTo(pX, y99); ctx.lineTo(pX + pW, y99); ctx.stroke();
      ctx.setLineDash([]);

      // τ and 5τ markers
      ctx.save();
      ctx.globalAlpha = 0.6;
      ctx.strokeStyle = getCanvasColors().teal;
      ctx.setLineDash([3, 3]);
      const xTau = xT(tauNow);
      if (xTau < pX + pW) { ctx.beginPath(); ctx.moveTo(xTau, pY); ctx.lineTo(xTau, pY + pH); ctx.stroke(); }
      ctx.restore();
      ctx.strokeStyle = getCanvasColors().borderStrong;
      const x5tau = xT(5 * tauNow);
      if (x5tau < pX + pW) { ctx.beginPath(); ctx.moveTo(x5tau, pY); ctx.lineTo(x5tau, pY + pH); ctx.stroke(); }
      ctx.setLineDash([]);

      // Trace
      if (s.trace.length > 1) {
        const pts: { x: number; y: number }[] = [];
        for (let i = 0; i < s.trace.length; i++) {
          const p = s.trace[i]!;
          pts.push({ x: xT(p.t - tCut), y: yV(p.v) });
        }
        drawGlowPath(ctx, pts, {
          color: 'rgba(255,59,110,0.95)',
          glowColor: 'rgba(255,59,110,0.35)',
          lineWidth: 1.8,
        });
      }

      // Labels
      ctx.fillStyle = getCanvasColors().accent;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`V₀ = ${V0} V`, pX + pW - 4, y0line - 2);
      ctx.fillStyle = getCanvasColors().teal;
      ctx.fillText('63% V₀  (after 1τ)', pX + pW - 4, y63 - 2);
      ctx.fillStyle = getCanvasColors().textDim;
      ctx.fillText('99% V₀  (after 5τ)', pX + pW - 4, y99 - 2);

      ctx.fillStyle = getCanvasColors().teal;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(`τ = RC`, Math.min(xTau + 4, pX + pW - 60), pY + 4);

      ctx.fillStyle = getCanvasColors().textDim;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('V_C(t)', pX, 8);
      ctx.textAlign = 'right';
      ctx.fillText(`V_C = ${s.Vc.toFixed(2)} V`, pX + pW, 8);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`window: ${fmtT(PLOT_DURATION)} (6τ)`, pX + pW / 2, H - 6);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 4.5'}
      title="The RC charging curve"
      question="How long does it take a capacitor to charge through a resistor?"
      caption={
        <>
          Close the switch and the capacitor voltage approaches the battery exponentially. After one time constant
          <strong> τ = RC</strong> it has reached <strong>63%</strong> of V₀; after five it is past <strong>99%</strong>. Scale
          R or C and the whole curve stretches or compresses; the shape is invariant.
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
          value={R} min={100} max={10000} step={100}
          format={fmtR}
          onChange={setR}
        />
        <MiniSlider
          label="C"
          value={Cuf} min={1} max={2200} step={1}
          format={v => v.toFixed(0) + ' µF'}
          onChange={setCuf}
        />
        <MiniReadout label="τ = RC" value={fmtT(tau)} />
        <MiniReadout label="5τ (≈99%)" value={fmtT(t99)} />
        <MiniReadout label="V_C(now)" value={<Num value={VcDisplay} />} unit="V" />
      </DemoControls>
    </Demo>
  );
}

function fmtR(R: number): string {
  if (R >= 1e6) return (R / 1e6).toFixed(1) + ' MΩ';
  if (R >= 1e3) return (R / 1e3).toFixed(1) + ' kΩ';
  return R.toFixed(0) + ' Ω';
}
function fmtT(s: number): string {
  if (!isFinite(s) || s <= 0) return '—';
  if (s < 1e-6) return (s * 1e9).toFixed(1) + ' ns';
  if (s < 1e-3) return (s * 1e6).toFixed(1) + ' µs';
  if (s < 1) return (s * 1e3).toFixed(1) + ' ms';
  return s.toFixed(2) + ' s';
}
