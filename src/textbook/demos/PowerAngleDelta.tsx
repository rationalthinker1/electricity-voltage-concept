/**
 * Demo D17.8 — Power-angle curve (the swing equation in pictures)
 *
 * For a round-rotor synchronous generator connected to an infinite bus,
 * the real-power output is
 *   P(δ) = (|V_grid| · |E_f| / X_s) · sin(δ)
 *
 * δ is the angle between the rotor's internal EMF phasor and the grid
 * voltage. The mechanical input τ_mech raises δ until the curve's
 * height matches the demanded P; if mech input exceeds P_max =
 * |V·E_f|/X_s, the rotor accelerates past 90°, loses synchronism, and
 * the protective relay trips the unit offline.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';

interface Props { figure?: string }

const V_GRID = 1.0;
const E_F = 1.4;
const X_S = 1.2;
const P_MAX = (V_GRID * E_F) / X_S;

export function PowerAngleDeltaDemo({ figure }: Props) {
  const [pMech, setPMech] = useState(0.6);   // demanded mechanical input (pu)

  const stateRef = useRef({ pMech });
  useEffect(() => { stateRef.current.pMech = pMech; }, [pMech]);

  // Operating point: smallest δ such that P(δ) = pMech (stable side).
  const computed = useMemo(() => {
    if (pMech > P_MAX) {
      return { delta: 90, pullOut: true, P: P_MAX, marginPU: 0 };
    }
    const sinD = pMech / P_MAX;
    const delta = (Math.asin(Math.min(1, Math.max(-1, sinD))) * 180) / Math.PI;
    const margin = (P_MAX - pMech) / P_MAX;  // fraction of capacity remaining
    return { delta, pullOut: false, P: pMech, marginPU: margin };
  }, [pMech]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h } = info;
    let raf = 0;

    function draw() {
      const { pMech } = stateRef.current;

      ctx.fillStyle = '#0d0d10';
      ctx.fillRect(0, 0, w, h);

      const padL = 56, padR = 24, padT = 22, padB = 38;
      const plotW = w - padL - padR;
      const plotH = h - padT - padB;
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.strokeRect(padL, padT, plotW, plotH);

      const pMax = Math.max(P_MAX * 1.1, 1.4);
      const xAt = (d: number) => padL + (d / 180) * plotW;
      const yAt = (p: number) => padT + plotH - (p / pMax) * plotH;

      // Gridlines
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      for (let d = 30; d < 180; d += 30) {
        ctx.beginPath();
        ctx.moveTo(xAt(d), padT); ctx.lineTo(xAt(d), padT + plotH);
        ctx.stroke();
      }
      for (let p = 0.25; p < pMax; p += 0.25) {
        ctx.beginPath();
        ctx.moveTo(padL, yAt(p)); ctx.lineTo(padL + plotW, yAt(p));
        ctx.stroke();
      }

      // 90° line (stability limit)
      ctx.strokeStyle = 'rgba(255,59,110,0.45)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(xAt(90), padT); ctx.lineTo(xAt(90), padT + plotH);
      ctx.stroke();
      ctx.setLineDash([]);

      // P(δ) curve. Stable side (δ < 90°) solid; unstable side dashed.
      ctx.strokeStyle = '#ff6b2a';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let i = 0; i <= 90; i++) {
        const d = i;
        const p = P_MAX * Math.sin((d * Math.PI) / 180);
        const x = xAt(d), y = yAt(p);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      // Unstable branch dashed
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(255,107,42,0.5)';
      ctx.beginPath();
      for (let i = 90; i <= 180; i++) {
        const d = i;
        const p = P_MAX * Math.sin((d * Math.PI) / 180);
        const x = xAt(d), y = yAt(p);
        if (i === 90) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Mechanical input horizontal line
      ctx.strokeStyle = 'rgba(108,197,194,0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(padL, yAt(Math.min(pMech, pMax))); ctx.lineTo(padL + plotW, yAt(Math.min(pMech, pMax)));
      ctx.stroke();

      // Operating point
      if (pMech <= P_MAX) {
        const d = (Math.asin(pMech / P_MAX) * 180) / Math.PI;
        ctx.fillStyle = '#5baef8';
        ctx.beginPath();
        ctx.arc(xAt(d), yAt(pMech), 7, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Pull-out: marker red at the curve peak
        ctx.fillStyle = '#ff3b6e';
        ctx.beginPath();
        ctx.arc(xAt(90), yAt(P_MAX), 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ff3b6e';
        ctx.font = 'bold 11px "JetBrains Mono", monospace';
        ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
        ctx.fillText('POLE SLIP — TRIP', xAt(90), yAt(P_MAX) - 12);
      }

      // P_max line
      ctx.fillStyle = 'rgba(255,107,42,0.85)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(`P_max = V·E_f/X_s = ${P_MAX.toFixed(2)} pu`, padL + 8, yAt(P_MAX) - 8);

      // Axis labels
      ctx.fillStyle = 'rgba(160,158,149,0.85)';
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      for (let d = 0; d <= 180; d += 30) {
        ctx.fillText(d.toFixed(0) + '°', xAt(d), padT + plotH + 4);
      }
      ctx.fillText('power angle δ →', padL + plotW / 2, padT + plotH + 20);

      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillText('P (pu)', padL - 6, padT + plotH / 2);

      // Stable / unstable region labels
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(108,197,194,0.7)';
      ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
      ctx.fillText('stable: δ < 90°', padL + 8, padT + plotH - 6);
      ctx.fillStyle = 'rgba(255,59,110,0.7)';
      ctx.textAlign = 'right';
      ctx.fillText('unstable: δ > 90°', padL + plotW - 8, padT + plotH - 6);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 17.8'}
      title="Power-angle curve and the pull-out limit"
      question="If the turbine pushes harder than the grid can absorb, what happens to the rotor?"
      caption={<>
        Steady-state real power vs power angle: <em>P(δ) = (V·E_f / X_s) sin δ</em>, with V = 1, E_f = 1.4, X_s = 1.2 pu
        here. Increase mechanical input and δ rises along the stable branch (δ &lt; 90°). Past the peak P_max ≈ 1.17 pu
        the rotor cannot transmit any more power; it accelerates ahead of the grid, slips a pole, and the protection
        relay trips. This is the swing equation's static limit — the dynamic limit (after a fault) is tighter still.
      </>}
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="P mech input"
          value={pMech} min={0} max={1.4} step={0.01}
          format={v => v.toFixed(2) + ' pu'}
          onChange={setPMech}
        />
        <MiniReadout label="P_max" value={<Num value={P_MAX} digits={2} />} unit="pu" />
        <MiniReadout
          label="δ steady state"
          value={computed.pullOut ? <span>—</span> : <Num value={computed.delta} digits={1} />}
          unit={computed.pullOut ? undefined : '°'}
        />
        <MiniReadout label="margin to pull-out" value={(computed.marginPU * 100).toFixed(1)} unit="%" />
      </DemoControls>
    </Demo>
  );
}
