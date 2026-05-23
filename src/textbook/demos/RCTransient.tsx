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
import { useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';
import { Demo, DemoControls, MiniReadout, MiniSlider, MiniToggle } from '@/components/Demo';
import { Num } from '@/components/Num';
import { drawLabel } from '@/lib/canvasLayout';
import { drawGlowPath, type CircuitElement } from '@/lib/canvasPrimitives';
import { useCircuitCache } from '@/lib/useCircuitCache';
import { getCanvasColors, withAlpha } from '@/lib/canvasTheme';
import { fmtResistance, fmtTime } from '@/lib/formatters';

type Mode = 'open' | 'charging' | 'discharging';

interface Props {
  figure?: string;
}

export function RCTransientDemo({ figure }: Props) {
  const V0 = 12;
  // R in Ω; C in µF
  const [R, setR] = useState(1000);
  const [Cuf, setCuf] = useState(220);
  const [mode, setMode] = useState<Mode>('charging');

  const C = Cuf * 1e-6;
  const tau = R * C;

  const stateRef = useSimState({ R, C, mode });
  const simRef = useRef({ Vc: 0, trace: [] as Array<{ t: number; v: number }> });

  // Reset the integrator when the mode changes.
  const [resetTick, setResetTick] = useState(0);
  useEffect(() => {
    simRef.current.trace = [];
    setResetTick((t) => t + 1);
  }, [mode]);

  const [VcDisplay, setVcDisplay] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setVcDisplay(simRef.current.Vc), 80);
    return () => window.clearInterval(id);
  }, []);

  // Static schematic — rebakes when the switch state (mode) or the resistor
  // label value (R) changes, or when the canvas resizes.
  const getStaticSchematic = useCircuitCache(
    (sw, sh, _dpr) => {
      const splitX = Math.min(sw * 0.42, 320);
      const cy = sh / 2;
      const padX = 30;
      const innerW = splitX - 2 * padX;
      const batX = padX + 10;
      const swX = padX + innerW * 0.35;
      const resX = padX + innerW * 0.55;
      const capX = padX + innerW * 0.85;
      const yTop = cy - 50;
      const yBot = cy + 50;
      const elements: CircuitElement[] = [
        {
          kind: 'wire',
          points: [
            { x: batX, y: yTop },
            { x: swX - 14, y: yTop },
          ],
        },
        {
          kind: 'switch',
          at: { x: swX, y: yTop },
          label: mode.toUpperCase(),
          state: mode === 'charging' ? 'closed' : mode === 'discharging' ? 'open-down' : 'open-up',
        },
        {
          kind: 'wire',
          points: [
            { x: swX + 14, y: yTop },
            { x: resX - 22, y: yTop },
          ],
        },
        {
          kind: 'resistor',
          from: { x: resX - 20, y: yTop },
          to: { x: resX + 20, y: yTop },
          label: fmtResistance(R),
          labelOffset: { x: 0, y: -10 },
        },
        {
          kind: 'wire',
          points: [
            { x: resX + 22, y: yTop },
            { x: capX, y: yTop },
          ],
        },
        {
          kind: 'wire',
          points: [
            { x: capX, y: cy + 14 },
            { x: capX, y: yBot },
            { x: batX, y: yBot },
          ],
        },
        {
          kind: 'battery',
          at: { x: batX, y: cy },
          label: `${V0.toFixed(0)}V`,
          leadLength: 50,
          positivePlateLength: 24,
          negativePlateLength: 14,
        },
      ];
      return { elements };
    },
    [mode, R],
  );

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, dpr }, state, dt, simTime) => {
      const { R, C, mode } = state;

      // Integrate Vc
      const tauNow = R * C;
      if (tauNow > 0) {
        if (mode === 'charging') {
          simRef.current.Vc += (V0 - simRef.current.Vc) * (dt / tauNow);
        } else if (mode === 'discharging') {
          simRef.current.Vc -= simRef.current.Vc * (dt / tauNow);
        }
      }
      simRef.current.trace.push({ t: simTime, v: simRef.current.Vc });

      // Plot window: 6τ
      const PLOT_DURATION = Math.max(6 * tauNow, 0.05);
      const tCut = Math.max(0, simTime - PLOT_DURATION);
      while (simRef.current.trace.length && simRef.current.trace[0].t < tCut) simRef.current.trace.shift();

        ctx.fillStyle = getCanvasColors().bg;
        ctx.fillRect(0, 0, w, h);

        const splitX = Math.min(w * 0.42, 320);

        const cy = h / 2;
        const padX = 30;
        const innerW = splitX - 2 * padX;
        const batX = padX + 10;
        const swX = padX + innerW * 0.35;
        const resX = padX + innerW * 0.55;
        const capX = padX + innerW * 0.85;
        const yTop = cy - 50;
        const yBot = cy + 50;

        const plotX = splitX + 36;
        const plotW = w - splitX - 56;
        const plotY = 28;
        const plotH = h - 60;
        const yV = (v: number) => plotY + plotH - (v / V0) * plotH;
        const y0line = yV(V0);
        const y63 = yV(V0 * (1 - 1 / Math.E));

        const off = getStaticSchematic(w, h, dpr);
        if (off) ctx.drawImage(off, 0, 0, w, h);

        // Plot frame + grid + V0 + 63% reference lines + their labels — used to
        // be baked into the same offscreen canvas as the schematic; pulled into
        // per-frame ctx calls so the cache is a plain CircuitSpec. Cost is
        // ~12 draw calls, negligible.
        ctx.strokeStyle = getCanvasColors().border;
        ctx.lineWidth = 1;
        ctx.strokeRect(plotX, plotY, plotW, plotH);
        for (let i = 0; i <= 4; i++) {
          const y = plotY + (i * plotH) / 4;
          ctx.beginPath();
          ctx.moveTo(plotX, y);
          ctx.lineTo(plotX + plotW, y);
          ctx.stroke();
        }
        ctx.save();
        ctx.globalAlpha = 0.35;
        ctx.strokeStyle = getCanvasColors().accent;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(plotX, y0line);
        ctx.lineTo(plotX + plotW, y0line);
        ctx.stroke();
        ctx.restore();
        ctx.save();
        ctx.globalAlpha = 0.35;
        ctx.strokeStyle = getCanvasColors().teal;
        ctx.beginPath();
        ctx.moveTo(plotX, y63);
        ctx.lineTo(plotX + plotW, y63);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
        ctx.fillStyle = getCanvasColors().accent;
        drawLabel(ctx, { text: `V₀ = ${V0} V`, x: plotX + plotW - 4, y: y0line - 2, font: '10px "JetBrains Mono", monospace', align: 'right', baseline: 'bottom' });
        ctx.fillStyle = getCanvasColors().teal;
        drawLabel(ctx, { text: '63% V₀', x: plotX + plotW - 4, y: y63 - 2, font: '10px "JetBrains Mono", monospace', align: 'right', baseline: 'bottom' });
        ctx.fillStyle = getCanvasColors().textDim;
        drawLabel(ctx, { text: 'V_C(t)', x: plotX, y: 8, font: '10px "JetBrains Mono", monospace', baseline: 'top' });

        // Divider between the two panes.
        ctx.strokeStyle = getCanvasColors().border;
        ctx.beginPath();
        ctx.moveTo(splitX, 0);
        ctx.lineTo(splitX, h);
        ctx.stroke();

        // ── LEFT: schematic dynamic overlays
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, splitX, h);
        ctx.clip();

        // Dynamic overlay: capacitor plates whose colour brightens as Vc rises.
        drawCapacitorV(ctx, capX, cy, simRef.current.Vc, V0);

        // Dynamic overlay: animated current dots, only while mode != open and dV is meaningful.
        const dV = mode === 'charging' ? V0 - simRef.current.Vc : mode === 'discharging' ? simRef.current.Vc : 0;
        const I = Math.abs(dV) / Math.max(R, 1e-9);
        const Iscale = Math.min(1, I / (V0 / Math.max(R, 1e-9)));
        if (mode === 'charging' && Iscale > 0.005) {
          drawCurrentDotsPath(
            ctx,
            simTime * 60,
            [
              { x: batX, y: yTop },
              { x: capX, y: yTop },
              { x: capX, y: cy - 16 },
            ],
            Iscale,
          );
          drawCurrentDotsPath(
            ctx,
            simTime * 60,
            [
              { x: capX, y: cy + 16 },
              { x: capX, y: yBot },
              { x: batX, y: yBot },
            ],
            Iscale,
          );
        } else if (mode === 'discharging' && Iscale > 0.005) {
          drawCurrentDotsPath(
            ctx,
            simTime * 60,
            [
              { x: capX, y: cy - 16 },
              { x: capX, y: yTop },
              { x: resX + 22, y: yTop },
              { x: resX - 22, y: yTop },
              { x: swX, y: yTop },
              { x: swX, y: cy + 30 },
              { x: capX, y: cy + 30 },
              { x: capX, y: cy + 16 },
            ],
            Iscale,
          );
        }

        // Dynamic overlay: live R / C / τ readout in the schematic pane.
        ctx.fillStyle = getCanvasColors().textDim;
        drawLabel(ctx, { text: `R = ${fmtResistance(R)}   C = ${(C * 1e6).toFixed(0)} µF   τ = ${fmtTime(tauNow)}`, x: 10, y: 8, font: '10px "JetBrains Mono", monospace', baseline: 'top' });

        ctx.restore();

        // ── RIGHT: plot dynamic overlays (τ marker, glow trace, live readouts).
        ctx.save();
        ctx.beginPath();
        ctx.rect(splitX, 0, w - splitX, h);
        ctx.clip();

        const xT = (tt: number) => plotX + (tt / PLOT_DURATION) * plotW;
        const xTau = xT(tauNow);

        // Dynamic overlay: τ vertical marker — its position slides with R*C.
        ctx.save();
        ctx.globalAlpha = 0.6;
        ctx.strokeStyle = getCanvasColors().teal;
        ctx.setLineDash([3, 3]);
        if (xTau < plotX + plotW) {
          ctx.beginPath();
          ctx.moveTo(xTau, plotY);
          ctx.lineTo(xTau, plotY + plotH);
          ctx.stroke();
        }
        ctx.setLineDash([]);

        // Dynamic overlay: V_C(t) trace with a soft halo (drawGlowPath avoids shadowBlur).
        if (simRef.current.trace.length > 1) {
          const tracePts: { x: number; y: number }[] = new Array(simRef.current.trace.length);
          for (let i = 0; i < simRef.current.trace.length; i++) {
            const p = simRef.current.trace[i];
            tracePts[i] = { x: xT(p.t - tCut), y: yV(p.v) };
          }
          drawGlowPath(ctx, tracePts, {
            color: withAlpha(getCanvasColors().pink, 0.95),
            glowColor: withAlpha(getCanvasColors().pink, 0.35),
            lineWidth: 1.8,
            glowWidth: 6,
          });
        }

        // Dynamic overlay: τ-marker label + live V_C readout + (6τ) window legend.
        ctx.restore();
        ctx.fillStyle = getCanvasColors().teal;
        drawLabel(ctx, { text: `τ = ${fmtTime(tauNow)}`, x: Math.min(xTau + 4, plotX + plotW - 80), y: plotY + 4, font: '10px "JetBrains Mono", monospace', baseline: 'top' });
        ctx.fillStyle = getCanvasColors().textDim;
        drawLabel(ctx, { text: `V_C = ${simRef.current.Vc.toFixed(2)} V`, x: plotX + plotW, y: 8, font: '10px "JetBrains Mono", monospace', align: 'right', baseline: 'top' });
        drawLabel(ctx, { text: `window: ${fmtTime(PLOT_DURATION)} (6τ)`, x: plotX + plotW / 2, y: h - 6, font: '10px "JetBrains Mono", monospace', align: 'center', baseline: 'bottom' });

        ctx.restore();
    },
    [resetTick],
  );

  return (
    <Demo
      figure={figure ?? 'Fig. 10.2'}
      title="The RC transient"
      question="How fast does the capacitor charge? — answer: τ = RC."
      caption={
        <>
          Flip the switch to "charging" and the capacitor voltage rises along an exponential curve
          that reaches <strong>63%</strong> of V₀ in one time constant τ = RC. Flip to "discharging"
          and it falls along the mirror curve. Scale R or C and the curve stretches or compresses
          accordingly.
        </>
      }
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
        <MiniReadout label="V_C(now)" value={<Num value={VcDisplay} />} unit="V" />
      </DemoControls>
    </Demo>
  );
}

function drawCapacitorV(
  ctx: CanvasRenderingContext2D,
  x: number,
  cy: number,
  Vc: number,
  V0: number,
) {
  // Two horizontal plates with gap
  const yTop = cy - 8;
  const yBot = cy + 8;
  // Vertical leads
  ctx.strokeStyle = getCanvasColors().textDim;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  // (leads drawn elsewhere)
  // Plates
  const charge = Math.max(0, Math.min(1, Vc / V0));
  const alpha = 0.45 + 0.5 * charge;
  ctx.strokeStyle = `rgba(255,107,42,${alpha})`;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x - 12, yTop);
  ctx.lineTo(x + 12, yTop);
  ctx.moveTo(x - 12, yBot);
  ctx.lineTo(x + 12, yBot);
  ctx.stroke();
  drawLabel(ctx, {
    x: x + 16,
    y: cy,
    text: 'C',
    color: getCanvasColors().textDim,
    size: 9,
    baseline: 'middle',
  });
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
    const a = pts[i];
    const b = pts[i + 1];
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
