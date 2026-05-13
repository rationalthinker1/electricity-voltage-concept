/**
 * Demo D10.2 — RC transient
 *
 * Battery + resistor + capacitor + three-state switch (open / charge / discharge).
 *
 * Charging: V_C(t) = V₀ (1 − e^(−t/τ)),  τ = RC
 * Discharging: V_C(t) = V_C0 · e^(−t/τ)
 *
 * The right pane is a live plot of V_C vs time, with a vertical marker at t = τ.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import {
  Demo, DemoControls, MiniReadout, MiniSlider, MiniToggle,
} from '@/components/Demo';
import { Num } from '@/components/Num';
import { drawBattery, drawResistor, drawSwitch, drawWire } from '@/lib/canvasPrimitives';

type Mode = 'open' | 'charging' | 'discharging';

interface Props { figure?: string }

export function RCTransientDemo({ figure }: Props) {
  const V0 = 12;
  // R in Ω; C in µF
  const [R, setR] = useState(1000);
  const [Cuf, setCuf] = useState(220);
  const [mode, setMode] = useState<Mode>('charging');

  const C = Cuf * 1e-6;
  const tau = R * C;

  const stateRef = useRef({ R, C, mode, Vc: 0, lastT: performance.now(), trace: [] as Array<{t: number; v: number}>, simT: 0 });
  useEffect(() => {
    stateRef.current.R = R;
    stateRef.current.C = C;
  }, [R, C]);
  useEffect(() => {
    // Reset clock + trace on mode change
    stateRef.current.mode = mode;
    stateRef.current.simT = 0;
    stateRef.current.trace = [];
    if (mode === 'open') {
      // hold current Vc
    }
  }, [mode]);

  const [VcDisplay, setVcDisplay] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setVcDisplay(stateRef.current.Vc), 80);
    return () => window.clearInterval(id);
  }, []);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h } = info;
    let raf = 0;
    stateRef.current.lastT = performance.now();

    function draw() {
      const st = stateRef.current;
      const now = performance.now();
      let dt = (now - st.lastT) / 1000;
      st.lastT = now;
      if (dt > 0.1) dt = 0.1;

      // Integrate Vc
      const tauNow = st.R * st.C;
      if (tauNow > 0) {
        if (st.mode === 'charging') {
          // dVc/dt = (V0 − Vc)/τ
          st.Vc += (V0 - st.Vc) * (dt / tauNow);
        } else if (st.mode === 'discharging') {
          // dVc/dt = −Vc/τ
          st.Vc -= st.Vc * (dt / tauNow);
        }
      }
      st.simT += dt;
      st.trace.push({ t: st.simT, v: st.Vc });

      // Plot window: 6τ
      const PLOT_DURATION = Math.max(6 * tauNow, 0.05);
      const tCut = Math.max(0, st.simT - PLOT_DURATION);
      while (st.trace.length && st.trace[0].t < tCut) st.trace.shift();

      ctx.fillStyle = '#0d0d10';
      ctx.fillRect(0, 0, w, h);

      const splitX = Math.min(w * 0.42, 320);

      // ── LEFT: schematic
      ctx.save();
      ctx.beginPath(); ctx.rect(0, 0, splitX, h); ctx.clip();

      const cy = h / 2;
      const padX = 30;
      const innerW = splitX - 2 * padX;
      const batX = padX + 10;
      const swX = padX + innerW * 0.35;
      const resX = padX + innerW * 0.55;
      const capX = padX + innerW * 0.85;
      const yTop = cy - 50;
      const yBot = cy + 50;

      // top wire: battery+ → switch → resistor → capacitor
      drawWire(ctx, [{ x: batX, y: yTop }, { x: swX - 14, y: yTop }]);
      // Switch
      drawSwitch(ctx, { x: swX, y: yTop }, {
        label: st.mode.toUpperCase(),
        state: st.mode === 'charging' ? 'closed' : st.mode === 'discharging' ? 'open-down' : 'open-up',
      });
      drawWire(ctx, [{ x: swX + 14, y: yTop }, { x: resX - 22, y: yTop }]);
      drawResistor(ctx, { x: resX - 20, y: yTop }, { x: resX + 20, y: yTop }, {
        label: fmtR(st.R),
        labelOffset: { x: 0, y: -10 },
      });
      drawWire(ctx, [{ x: resX + 22, y: yTop }, { x: capX, y: yTop }]);
      // Capacitor
      drawCapacitorV(ctx, capX, cy, st.Vc, V0);
      // Bottom wire back to battery
      drawWire(ctx, [
        { x: capX, y: cy + 14 },
        { x: capX, y: yBot },
        { x: batX, y: yBot },
      ]);
      // Battery
      drawBattery(ctx, { x: batX, y: cy }, {
        label: `${V0.toFixed(0)}V`,
        leadLength: 50,
        positivePlateLength: 24,
        negativePlateLength: 14,
      });

      // Current dots when active (only if mode is not open and there is appreciable change)
      const dV = st.mode === 'charging' ? V0 - st.Vc : st.mode === 'discharging' ? st.Vc : 0;
      const I = Math.abs(dV) / Math.max(st.R, 1e-9);
      const Iscale = Math.min(1, I / (V0 / Math.max(st.R, 1e-9)));
      if (st.mode === 'charging' && Iscale > 0.005) {
        drawCurrentDotsPath(ctx, st.simT * 60, [
          { x: batX, y: yTop }, { x: capX, y: yTop }, { x: capX, y: cy - 16 },
        ], Iscale);
        drawCurrentDotsPath(ctx, st.simT * 60, [
          { x: capX, y: cy + 16 }, { x: capX, y: yBot }, { x: batX, y: yBot },
        ], Iscale);
      } else if (st.mode === 'discharging' && Iscale > 0.005) {
        // Discharge loops the other way — but with the switch in discharge position
        // we model the cap as discharging through R back to its own other plate.
        drawCurrentDotsPath(ctx, st.simT * 60, [
          { x: capX, y: cy - 16 }, { x: capX, y: yTop },
          { x: resX + 22, y: yTop }, { x: resX - 22, y: yTop },
          { x: swX, y: yTop }, { x: swX, y: cy + 30 },
          { x: capX, y: cy + 30 }, { x: capX, y: cy + 16 },
        ], Iscale);
      }

      // Labels
      ctx.fillStyle = 'rgba(160,158,149,0.85)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(`R = ${fmtR(st.R)}   C = ${(st.C * 1e6).toFixed(0)} µF   τ = ${fmtT(tauNow)}`, 10, 8);

      ctx.restore();

      // Divider
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.beginPath(); ctx.moveTo(splitX, 0); ctx.lineTo(splitX, h); ctx.stroke();

      // ── RIGHT: plot
      ctx.save();
      ctx.beginPath(); ctx.rect(splitX, 0, w - splitX, h); ctx.clip();

      const plotX = splitX + 36;
      const plotW = w - splitX - 56;
      const plotY = 28;
      const plotH = h - 60;

      // Frame
      ctx.strokeStyle = 'rgba(255,255,255,0.10)';
      ctx.lineWidth = 1;
      ctx.strokeRect(plotX, plotY, plotW, plotH);

      // Horizontal grid: V0 (asymptote), V0(1-1/e), 0
      const yV = (v: number) => plotY + plotH - (v / V0) * plotH;
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      for (let i = 0; i <= 4; i++) {
        const y = plotY + (i * plotH) / 4;
        ctx.beginPath(); ctx.moveTo(plotX, y); ctx.lineTo(plotX + plotW, y); ctx.stroke();
      }

      // V0 line
      ctx.strokeStyle = 'rgba(255,107,42,0.35)';
      ctx.setLineDash([4, 4]);
      const y0line = yV(V0);
      ctx.beginPath(); ctx.moveTo(plotX, y0line); ctx.lineTo(plotX + plotW, y0line); ctx.stroke();

      // 63% line (V0 (1−1/e))
      ctx.strokeStyle = 'rgba(108,197,194,0.35)';
      const y63 = yV(V0 * (1 - 1 / Math.E));
      ctx.beginPath(); ctx.moveTo(plotX, y63); ctx.lineTo(plotX + plotW, y63); ctx.stroke();
      ctx.setLineDash([]);

      // τ vertical marker
      const xT = (tt: number) => plotX + (tt / PLOT_DURATION) * plotW;
      ctx.strokeStyle = 'rgba(108,197,194,0.6)';
      ctx.setLineDash([3, 3]);
      const xTau = xT(tauNow);
      if (xTau < plotX + plotW) {
        ctx.beginPath(); ctx.moveTo(xTau, plotY); ctx.lineTo(xTau, plotY + plotH); ctx.stroke();
      }
      ctx.setLineDash([]);

      // Trace
      if (st.trace.length > 1) {
        ctx.strokeStyle = 'rgba(255,59,110,0.95)';
        ctx.shadowColor = 'rgba(255,59,110,0.5)';
        ctx.shadowBlur = 6;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        for (let i = 0; i < st.trace.length; i++) {
          const p = st.trace[i];
          const tx = xT(p.t - tCut);
          const ty = yV(p.v);
          if (i === 0) ctx.moveTo(tx, ty); else ctx.lineTo(tx, ty);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Labels
      ctx.fillStyle = 'rgba(255,107,42,0.85)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`V₀ = ${V0} V`, plotX + plotW - 4, y0line - 2);
      ctx.fillStyle = 'rgba(108,197,194,0.85)';
      ctx.fillText('63% V₀', plotX + plotW - 4, y63 - 2);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(`τ = ${fmtT(tauNow)}`, Math.min(xTau + 4, plotX + plotW - 80), plotY + 4);

      ctx.fillStyle = 'rgba(160,158,149,0.8)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('V_C(t)', plotX, 8);
      ctx.textAlign = 'right';
      ctx.fillText(`V_C = ${st.Vc.toFixed(2)} V`, plotX + plotW, 8);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`window: ${fmtT(PLOT_DURATION)} (6τ)`, plotX + plotW / 2, h - 6);

      ctx.restore();
      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 10.2'}
      title="The RC transient"
      question="How fast does the capacitor charge? — answer: τ = RC."
      caption={<>
        Flip the switch to "charging" and the capacitor voltage rises along an exponential
        curve that reaches <strong>63%</strong> of V₀ in one time constant
        τ = RC. Flip to "discharging" and it falls along the mirror curve. Scale R or C and
        the curve stretches or compresses accordingly.
      </>}
      deeperLab={{ slug: 'capacitance', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={280} setup={setup} />
      <DemoControls>
        <MiniToggle
          label="Charging"
          checked={mode === 'charging'}
          onChange={(on) => setMode(on ? 'charging' : 'open')}
        />
        <MiniToggle
          label="Discharging"
          checked={mode === 'discharging'}
          onChange={(on) => setMode(on ? 'discharging' : 'open')}
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

function drawCapacitorV(ctx: CanvasRenderingContext2D, x: number, cy: number, Vc: number, V0: number) {
  // Two horizontal plates with gap
  const yTop = cy - 8;
  const yBot = cy + 8;
  // Vertical leads
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  // (leads drawn elsewhere)
  // Plates
  const charge = Math.max(0, Math.min(1, Vc / V0));
  const alpha = 0.45 + 0.5 * charge;
  ctx.strokeStyle = `rgba(255,107,42,${alpha})`;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x - 12, yTop); ctx.lineTo(x + 12, yTop);
  ctx.moveTo(x - 12, yBot); ctx.lineTo(x + 12, yBot);
  ctx.stroke();
  ctx.fillStyle = 'rgba(160,158,149,0.85)';
  ctx.font = '9px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('C', x + 16, cy);
}

function drawCurrentDotsPath(
  ctx: CanvasRenderingContext2D,
  t: number,
  pts: Array<{ x: number; y: number }>,
  Iscale: number,
) {
  const segs: Array<{ x0: number; y0: number; x1: number; y1: number; len: number }> = [];
  let total = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i]; const b = pts[i + 1];
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    segs.push({ x0: a.x, y0: a.y, x1: b.x, y1: b.y, len });
    total += len;
  }
  if (total < 1) return;
  const spacing = 22;
  const offset = (t * 1.0) % spacing;
  const intensity = Math.max(0.1, Math.min(1, Iscale));
  ctx.fillStyle = `rgba(91,174,248,${0.3 + 0.6 * intensity})`;
  for (let s = -spacing; s < total; s += spacing) {
    const d = s + offset;
    if (d < 0 || d > total) continue;
    let acc = 0;
    for (const sg of segs) {
      if (d <= acc + sg.len) {
        const f = (d - acc) / sg.len;
        const x = sg.x0 + (sg.x1 - sg.x0) * f;
        const y = sg.y0 + (sg.y1 - sg.y0) * f;
        ctx.beginPath();
        ctx.arc(x, y, 1.5 + 1.4 * intensity, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      acc += sg.len;
    }
  }
}
