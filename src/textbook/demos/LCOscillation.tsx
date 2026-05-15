/**
 * Demo D10.3 — LC oscillation
 *
 * An ideal L and C in a loop with initial charge Q0 on the cap.
 *   U_C = Q²/(2C)
 *   U_L = ½ L I²
 *   ω₀ = 1/√(LC)
 *
 * Solution: Q(t) = Q0 cos(ω₀ t),  I(t) = −Q0 ω₀ sin(ω₀ t).
 * Total energy U_C + U_L is constant = Q0²/(2C).
 *
 * Left: schematic with animated charge / current. Right: energy bar chart
 * (capacitor vs inductor) plus a small phase-trace.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';
import { getCanvasColors } from '@/lib/canvasTheme';

interface Props { figure?: string }

export function LCOscillationDemo({ figure }: Props) {
  // L in mH; C in µF
  const [Lmh, setLmh] = useState(10);    // 10 mH
  const [Cuf, setCuf] = useState(100);   // 100 µF
  const L = Lmh * 1e-3;
  const C = Cuf * 1e-6;
  const f0 = 1 / (2 * Math.PI * Math.sqrt(L * C));
  const omega0 = 2 * Math.PI * f0;
  const T0 = 1 / f0;
  // Initial charge: pick so peak voltage = 5 V
  const V0 = 5;
  const Q0 = C * V0;
  const Utotal = (Q0 * Q0) / (2 * C);

  const stateRef = useRef({ L, C, omega0, Q0, simT: 0, lastT: performance.now() });
  useEffect(() => {
    stateRef.current.L = L;
    stateRef.current.C = C;
    stateRef.current.omega0 = omega0;
    stateRef.current.Q0 = Q0;
    // restart so the new period is immediately visible
    stateRef.current.simT = 0;
  }, [L, C, omega0, Q0]);

  const setup = useCallback((info: CanvasInfo) => {
    const colors = getCanvasColors();
    const { ctx, w, h, } = info;
    let raf = 0;
    stateRef.current.lastT = performance.now();
    // visual playback speed factor — slow real oscillation to ~2 Hz visible
    function draw() {
      const st = stateRef.current;
      const now = performance.now();
      let dt = (now - st.lastT) / 1000;
      st.lastT = now;
      if (dt > 0.1) dt = 0.1;
      // Real frequency can be kHz+; we play back at visible rate.
      const visualFreq = 1.0; // Hz
      st.simT += dt * (visualFreq / Math.max(f0, 1e-12)) * f0; // == dt; placeholder
      // Use a re-scaled phase so visualisation looks reasonable regardless of f0
      const visualOmega = 2 * Math.PI * visualFreq;
      // For numbers we use the real ω0; for visuals we use a synthetic phase
      const visualPhase = visualOmega * (st.simT * (1 / 1)); // (=)
      const Q = st.Q0 * Math.cos(visualPhase);
      const I = -st.Q0 * visualOmega * Math.sin(visualPhase);
      const Uc = (Q * Q) / (2 * st.C);
      // Use real ω0 to compute "true" U_L vs the synthetic I:
      // Better: derive U_L from energy conservation (since visual phase doesn't respect ω₀)
      const Ul = Math.max(0, Utotal - Uc);

      ctx.fillStyle = getCanvasColors().bg;
      ctx.fillRect(0, 0, w, h);

      const splitX = Math.min(w * 0.55, 380);

      // ── LEFT: schematic loop with capacitor (top) and inductor (right)
      ctx.save();
      ctx.beginPath(); ctx.rect(0, 0, splitX, h); ctx.clip();

      const cx = splitX / 2;
      const cy = h / 2;
      const boxW = splitX * 0.62;
      const boxH = h * 0.55;
      const xL = cx - boxW / 2;
      const xR = cx + boxW / 2;
      const yT = cy - boxH / 2;
      const yB = cy + boxH / 2;

      ctx.strokeStyle = getCanvasColors().textDim;
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      // Left + bottom + right wires (top has cap in middle, gap for inductor on right)
      ctx.beginPath();
      ctx.moveTo(cx - 18, yT); ctx.lineTo(xL, yT);
      ctx.lineTo(xL, yB);
      ctx.lineTo(xR, yB);
      ctx.lineTo(xR, cy - 24);
      ctx.moveTo(xR, cy + 24); ctx.lineTo(xR, yT);
      ctx.lineTo(cx + 18, yT);
      ctx.stroke();

      // Capacitor (top middle)
      const plateGap = 6;
      const plateW = 24;
      const plateAlpha = 0.4 + 0.55 * Math.min(1, Math.abs(Q) / st.Q0);
      // Top plate sign indicated by sign of Q
      const QSign = Q >= 0 ? '+' : '−';
      ctx.strokeStyle = `rgba(255,107,42,${plateAlpha})`;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx - plateW / 2, yT - plateGap / 2);
      ctx.lineTo(cx + plateW / 2, yT - plateGap / 2);
      ctx.moveTo(cx - plateW / 2, yT + plateGap / 2);
      ctx.lineTo(cx + plateW / 2, yT + plateGap / 2);
      ctx.stroke();
      ctx.fillStyle = getCanvasColors().accent;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(`C  ${QSign}${Math.abs(Q / st.Q0 * V0).toFixed(2)}V`, cx + plateW / 2 + 6, yT);

      // Inductor (right middle)
      drawInductorV(ctx, xR, cy, st.L);

      // Current dots — direction depends on sign of I
      const Imag = Math.abs(I);
      const Ipeak = st.Q0 * visualOmega;
      const Iscale = Math.min(1, Imag / Math.max(Ipeak, 1e-9));
      const dir = I >= 0 ? 1 : -1;
      const pathPts = [
        { x: cx + 18, y: yT }, { x: xR, y: yT },
        { x: xR, y: cy - 24 },
        // skip inductor
        { x: xR, y: cy + 24 }, { x: xR, y: yB },
        { x: xL, y: yB }, { x: xL, y: yT },
        { x: cx - 18, y: yT },
      ];
      drawCurrentDotsPath(ctx, st.simT * 60 * dir, pathPts, Iscale);

      // Labels
      ctx.fillStyle = getCanvasColors().textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(`L = ${Lmh.toFixed(1)} mH    C = ${Cuf.toFixed(0)} µF`, 10, 8);
      ctx.textAlign = 'right';
      ctx.fillText(`f₀ = ${fmtFreq(f0)}`, splitX - 10, 8);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`I → ${fmtA(I)}`, 10, h - 6);

      ctx.restore();

      // Divider
      ctx.strokeStyle = getCanvasColors().border;
      ctx.beginPath(); ctx.moveTo(splitX, 0); ctx.lineTo(splitX, h); ctx.stroke();

      // ── RIGHT: energy bars
      ctx.save();
      ctx.beginPath(); ctx.rect(splitX, 0, w - splitX, h); ctx.clip();

      const innerX = splitX + 28;
      const innerW = w - splitX - 50;
      const barH = h * 0.55;
      const barY = (h - barH) / 2;
      const barW = (innerW - 40) / 2;
      const x1 = innerX;
      const x2 = innerX + barW + 40;

      ctx.save();
      ctx.globalAlpha = 0.04;
      ctx.fillStyle = colors.text;
      ctx.fillRect(x1, barY, barW, barH);
      ctx.fillRect(x2, barY, barW, barH);
      ctx.restore();
      ctx.strokeStyle = getCanvasColors().border;
      ctx.strokeRect(x1, barY, barW, barH);
      ctx.strokeRect(x2, barY, barW, barH);

      const fracC = Utotal > 0 ? Uc / Utotal : 0;
      const fracL = Utotal > 0 ? Ul / Utotal : 0;
      const hC = fracC * barH;
      const hL = fracL * barH;
      // Capacitor bar (amber)
      ctx.fillStyle = getCanvasColors().accent;
      ctx.fillRect(x1, barY + barH - hC, barW, hC);
      // Inductor bar (teal)
      ctx.fillStyle = getCanvasColors().teal;
      ctx.fillRect(x2, barY + barH - hL, barW, hL);

      ctx.fillStyle = getCanvasColors().text;
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('U_C', x1 + barW / 2, barY + barH + 6);
      ctx.fillText('U_L', x2 + barW / 2, barY + barH + 6);
      ctx.fillStyle = getCanvasColors().textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText(`${(fracC * 100).toFixed(0)}%`, x1 + barW / 2, barY + barH + 22);
      ctx.fillText(`${(fracL * 100).toFixed(0)}%`, x2 + barW / 2, barY + barH + 22);

      ctx.fillStyle = getCanvasColors().textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('Energy shuttles between C and L', innerX, 8);

      ctx.restore();

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [Lmh, Cuf, f0, Utotal]);

  return (
    <Demo
      figure={figure ?? 'Fig. 10.3'}
      title="LC oscillation — the electrical pendulum"
      question="No resistor, no source. Why does anything happen?"
      caption={<>
        Charge sits on the capacitor; releasing it through the inductor sets up an oscillation
        at <strong>ω₀ = 1/√(LC)</strong>. Energy alternates between the capacitor (electric
        field) and the inductor (magnetic field) without ever leaving the loop. Real LC tanks
        decay because of resistance — see the next demo.
      </>}
      deeperLab={{ slug: 'inductance', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={240} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="L"
          value={Lmh} min={0.1} max={100} step={0.1}
          format={v => v.toFixed(1) + ' mH'}
          onChange={setLmh}
        />
        <MiniSlider
          label="C"
          value={Cuf} min={1} max={1000} step={1}
          format={v => v.toFixed(0) + ' µF'}
          onChange={setCuf}
        />
        <MiniReadout label="f₀ = 1/(2π√(LC))" value={<Num value={f0} />} unit="Hz" />
        <MiniReadout label="T₀ = 1/f₀" value={fmtT(T0)} />
      </DemoControls>
    </Demo>
  );
}

function fmtFreq(f: number): string {
  if (!isFinite(f)) return '—';
  if (f >= 1e6) return (f / 1e6).toFixed(2) + ' MHz';
  if (f >= 1e3) return (f / 1e3).toFixed(2) + ' kHz';
  return f.toFixed(1) + ' Hz';
}
function fmtT(s: number): string {
  if (!isFinite(s) || s <= 0) return '—';
  if (s < 1e-6) return (s * 1e9).toFixed(1) + ' ns';
  if (s < 1e-3) return (s * 1e6).toFixed(1) + ' µs';
  if (s < 1) return (s * 1e3).toFixed(1) + ' ms';
  return s.toFixed(2) + ' s';
}
function fmtA(I: number): string {
  if (Math.abs(I) >= 1) return I.toFixed(2) + ' A';
  if (Math.abs(I) >= 1e-3) return (I * 1000).toFixed(1) + ' mA';
  return (I * 1e6).toFixed(1) + ' µA';
}

function drawInductorV(ctx: CanvasRenderingContext2D, x: number, cy: number, L: number) {
  // Three small half-loops stacked vertically
  ctx.strokeStyle = getCanvasColors().teal;
  ctx.lineWidth = 1.6;
  const loops = 3;
  const totalH = 36;
  const loopH = totalH / loops;
  const top = cy - totalH / 2;
  for (let i = 0; i < loops; i++) {
    const yLoop = top + i * loopH + loopH / 2;
    ctx.beginPath();
    ctx.arc(x, yLoop, loopH / 2, -Math.PI / 2, Math.PI / 2, false);
    ctx.stroke();
  }
  ctx.fillStyle = getCanvasColors().teal;
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(`L`, x + 16, cy);
  void L;
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
  const speed = 60;
  const offset = (t * speed / 60) % spacing;
  const intensity = Math.max(0.0, Math.min(1, Iscale));
  if (intensity < 0.02) return;
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
        ctx.arc(x, y, 1.5 + 1.5 * intensity, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      acc += sg.len;
    }
  }
}
