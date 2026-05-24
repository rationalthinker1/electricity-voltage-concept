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
import { useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, EquationStrip, MiniReadout, MiniSlider } from '@/components/Demo';
import { M } from '@/components/Formula';
import { Num } from '@/components/Num';
import { drawLabel } from '@/lib/canvasLayout';
import { getCanvasColors, withAlpha } from '@/lib/canvasTheme';
import { fmtFrequency, fmtTime, fmtCurrent } from '@/lib/formatters';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

interface Props {
  figure: string;
}

export function LCOscillationDemo({ figure }: Props) {
  // L in mH; C in µF
  const [Lmh, setLmh] = useState(10); // 10 mH
  const [Cuf, setCuf] = useState(100); // 100 µF
  const L = Lmh * 1e-3;
  const C = Cuf * 1e-6;
  const f0 = 1 / (2 * Math.PI * Math.sqrt(L * C));
  const omega0 = 2 * Math.PI * f0;
  const T0 = 1 / f0;
  // Initial charge: pick so peak voltage = 5 V
  const V0 = 5;
  const Q0 = C * V0;
  const Utotal = (Q0 * Q0) / (2 * C);

  const stateRef = useSimState({ L, C, omega0, Q0 });

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, colors }, state, _dt, simTime) => {
      const { L, C, Q0 } = state;
      const visualFreq = 1.0; // Hz
      const visualOmega = 2 * Math.PI * visualFreq;
      const visualPhase = visualOmega * simTime;
      const Q = Q0 * Math.cos(visualPhase);
      const I = -Q0 * visualOmega * Math.sin(visualPhase);
      const Uc = (Q * Q) / (2 * C);
      // Use real ω0 to compute "true" U_L vs the synthetic I:
      // Better: derive U_L from energy conservation (since visual phase doesn't respect ω₀)
      const Ul = Math.max(0, Utotal - Uc);

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      const splitX = Math.min(w * 0.55, 380);

      // ── LEFT: schematic loop with capacitor (top) and inductor (right)
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, splitX, h);
      ctx.clip();

      const cx = splitX / 2;
      const cy = h / 2;
      const boxW = splitX * 0.62;
      const boxH = h * 0.55;
      const xL = cx - boxW / 2;
      const xR = cx + boxW / 2;
      const yT = cy - boxH / 2;
      const yB = cy + boxH / 2;

      ctx.strokeStyle = colors.textDim;
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      // Left + bottom + right wires (top has cap in middle, gap for inductor on right)
      ctx.beginPath();
      ctx.moveTo(cx - 18, yT);
      ctx.lineTo(xL, yT);
      ctx.lineTo(xL, yB);
      ctx.lineTo(xR, yB);
      ctx.lineTo(xR, cy - 24);
      ctx.moveTo(xR, cy + 24);
      ctx.lineTo(xR, yT);
      ctx.lineTo(cx + 18, yT);
      ctx.stroke();

      // Capacitor (top middle)
      const plateGap = 6;
      const plateW = 24;
      const plateAlpha = 0.4 + 0.55 * Math.min(1, Math.abs(Q) / Q0);
      // Top plate sign indicated by sign of Q
      const QSign = Q >= 0 ? '+' : '−';
      ctx.strokeStyle = withAlpha(colors.accent, plateAlpha);
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx - plateW / 2, yT - plateGap / 2);
      ctx.lineTo(cx + plateW / 2, yT - plateGap / 2);
      ctx.moveTo(cx - plateW / 2, yT + plateGap / 2);
      ctx.lineTo(cx + plateW / 2, yT + plateGap / 2);
      ctx.stroke();
      ctx.fillStyle = colors.accent;
      drawLabel(ctx, {
        text: `C  ${QSign}${Math.abs((Q / Q0) * V0).toFixed(2)}V`,
        x: cx + plateW / 2 + 6,
        y: yT,
        font: '10px "JetBrains Mono", monospace',
        baseline: 'middle',
      });

      // Inductor (right middle)
      drawInductorV(ctx, xR, cy, L);

      // Current dots — direction depends on sign of I
      const Imag = Math.abs(I);
      const Ipeak = Q0 * visualOmega;
      const Iscale = Math.min(1, Imag / Math.max(Ipeak, 1e-9));
      const dir = I >= 0 ? 1 : -1;
      const pathPts = [
        { x: cx + 18, y: yT },
        { x: xR, y: yT },
        { x: xR, y: cy - 24 },
        // skip inductor
        { x: xR, y: cy + 24 },
        { x: xR, y: yB },
        { x: xL, y: yB },
        { x: xL, y: yT },
        { x: cx - 18, y: yT },
      ];
      drawCurrentDotsPath(ctx, simTime * 60 * dir, pathPts, Iscale);

      // Labels
      ctx.fillStyle = colors.textDim;
      drawLabel(ctx, {
        text: `L = ${Lmh.toFixed(1)} mH    C = ${Cuf.toFixed(0)} µF`,
        x: 10,
        y: 8,
        font: '10px "JetBrains Mono", monospace',
        baseline: 'top',
      });
      drawLabel(ctx, {
        text: `f₀ = ${fmtFrequency(f0)}`,
        x: splitX - 10,
        y: 8,
        font: '10px "JetBrains Mono", monospace',
        align: 'right',
        baseline: 'top',
      });
      drawLabel(ctx, {
        text: `I → ${fmtCurrent(I)}`,
        x: 10,
        y: h - 6,
        font: '10px "JetBrains Mono", monospace',
        baseline: 'bottom',
      });

      ctx.restore();

      // Divider
      ctx.strokeStyle = colors.border;
      ctx.beginPath();
      ctx.moveTo(splitX, 0);
      ctx.lineTo(splitX, h);
      ctx.stroke();

      // ── RIGHT: energy bars
      ctx.save();
      ctx.beginPath();
      ctx.rect(splitX, 0, w - splitX, h);
      ctx.clip();

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
      ctx.strokeStyle = colors.border;
      ctx.strokeRect(x1, barY, barW, barH);
      ctx.strokeRect(x2, barY, barW, barH);

      const fracC = Utotal > 0 ? Uc / Utotal : 0;
      const fracL = Utotal > 0 ? Ul / Utotal : 0;
      const hC = fracC * barH;
      const hL = fracL * barH;
      // Capacitor bar (amber)
      ctx.fillStyle = colors.accent;
      ctx.fillRect(x1, barY + barH - hC, barW, hC);
      // Inductor bar (teal)
      ctx.fillStyle = colors.teal;
      ctx.fillRect(x2, barY + barH - hL, barW, hL);

      ctx.fillStyle = colors.text;
      drawLabel(ctx, {
        text: 'U_C',
        x: x1 + barW / 2,
        y: barY + barH + 6,
        weight: 'bold',
        size: 11,
        font: 'bold 11px "JetBrains Mono", monospace',
        align: 'center',
        baseline: 'top',
      });
      drawLabel(ctx, {
        text: 'U_L',
        x: x2 + barW / 2,
        y: barY + barH + 6,
        weight: 'bold',
        size: 11,
        font: 'bold 11px "JetBrains Mono", monospace',
        align: 'center',
        baseline: 'top',
      });
      ctx.fillStyle = colors.textDim;
      drawLabel(ctx, {
        text: `${(fracC * 100).toFixed(0)}%`,
        x: x1 + barW / 2,
        y: barY + barH + 22,
        font: '10px "JetBrains Mono", monospace',
        align: 'center',
        baseline: 'top',
      });
      drawLabel(ctx, {
        text: `${(fracL * 100).toFixed(0)}%`,
        x: x2 + barW / 2,
        y: barY + barH + 22,
        font: '10px "JetBrains Mono", monospace',
        align: 'center',
        baseline: 'top',
      });

      drawLabel(ctx, {
        x: innerX,
        y: 8,
        text: 'Energy shuttles between C and L',
        color: colors.textDim,
        baseline: 'top',
      });

      ctx.restore();
    },
    [Lmh, Cuf, f0, Utotal],
  );

  return (
    <Demo
      figure={figure}
      title="LC oscillation — the electrical pendulum"
      question="No resistor, no source. Why does anything happen?"
      caption={
        <>
          Charge sits on the capacitor; releasing it through the inductor sets up an oscillation at{' '}
          <strong>ω₀ = 1/√(LC)</strong>. Energy alternates between the capacitor (electric field)
          and the inductor (magnetic field) without ever leaving the loop. Real LC tanks decay
          because of resistance — see the next demo.
        </>
      }
      deeperLab={{ slug: 'inductance', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={240} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="L"
          value={Lmh}
          min={0.1}
          max={100}
          step={0.1}
          format={(v) => v.toFixed(1) + ' mH'}
          onChange={setLmh}
        />
        <MiniSlider
          label="C"
          value={Cuf}
          min={1}
          max={1000}
          step={1}
          format={(v) => v.toFixed(0) + ' µF'}
          onChange={setCuf}
        />
        <MiniReadout label="f₀ = 1/(2π√(LC))" value={<Num value={f0} />} unit="Hz" />
        <MiniReadout label="T₀ = 1/f₀" value={fmtTime(T0)} />
      </DemoControls>
      <EquationStrip
        leftLabel="LC resonance"
        left={<M tex={'f_0 = \\dfrac{1}{2\\pi\\sqrt{LC}}'} />}
        rightLabel="At this L, C"
        right={
          <M
            tex={`f_0 = ${f0.toFixed(2)}\\,\\text{Hz},\\quad T_0 = ${(T0 * 1000).toFixed(2)}\\,\\text{ms}`}
          />
        }
      />
    </Demo>
  );
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
  drawLabel(ctx, {
    x: x + 16,
    y: cy,
    text: `L`,
    color: getCanvasColors().teal,
    baseline: 'middle',
  });
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
    const a = pts[i];
    const b = pts[i + 1];
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    segs.push({ x0: a.x, y0: a.y, x1: b.x, y1: b.y, len });
    total += len;
  }
  if (total < 1) return;
  const spacing = 22;
  const speed = 60;
  const offset = ((t * speed) / 60) % spacing;
  const intensity = Math.max(0.0, Math.min(1, Iscale));
  if (intensity < 0.02) return;
  ctx.fillStyle = withAlpha(getCanvasColors().blue, 0.3 + 0.6 * intensity);
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
