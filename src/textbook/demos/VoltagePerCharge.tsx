/**
 * Demo D2.3 — Voltage is energy per charge (the invariance)
 *
 * Same two points, same voltage between them, different test charges sent
 * across. The total energy the field hands the charge, W = qV, scales with
 * how big a charge you send — but divide by the charge and you always land on
 * the same number, V. The left scene drops a single test charge (radius ∝ q)
 * from the high terminal to the low one. The right panel makes the point
 * quantitatively: a "Total W = qV" bar chart ramps up with q, while the
 * "Energy per charge W/q" chart stays pinned flat at V_ab for every charge.
 *
 * Pedagogical thrust: voltage is a property of the two points (and the field
 * between them), not of whatever charge you probe with. That ratio,
 * joules per coulomb, is what the word "voltage" actually names.
 */
import { useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, EquationStrip, MiniReadout, MiniSlider } from '@/components/Demo';
import { M } from '@/components/Formula';
import { drawLabel } from '@/lib/canvasLayout';
import { drawArrow, drawHalo } from '@/lib/canvasPrimitives';
import { withAlpha } from '@/lib/canvasTheme';
import { fmtEnergy } from '@/lib/formatters';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

interface Props {
  figure: string;
}

const Q_MAX = 5; // C
const V_MAX = 12; // V
const W_MAX = Q_MAX * V_MAX; // J — full scale for the "total energy" chart

export function VoltagePerChargeDemo({ figure }: Props) {
  const [Vab, setVab] = useState(6); // volts between the two points
  const [q, setQ] = useState(2); // test-charge magnitude, coulombs

  const W = q * Vab; // J — total energy the field gives this charge
  const perCharge = W / q; // J/C = V — identically Vab, for any q

  const stateRef = useSimState({ Vab, q });

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, colors }, _state, _dt, simTime) => {
      const s = stateRef.current;
      const { Vab: V, q: qNow } = s;
      const Wnow = qNow * V;

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      const splitX = Math.min(w * 0.42, Math.max(160, w - 320));

      // ---- Left: one charge taking the trip ----
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, splitX, h);
      ctx.clip();

      const padX = 30;
      const termW = splitX - 2 * padX;
      const termH = 12;
      const topY = 48;
      const botY = h - 70;
      const gapTop = topY + termH;
      const gapBot = botY;

      // Terminals: A high (accent), B low (teal)
      ctx.fillStyle = withAlpha(colors.accent, 0.85);
      ctx.fillRect(padX, topY, termW, termH);
      ctx.fillStyle = withAlpha(colors.teal, 0.85);
      ctx.fillRect(padX, botY, termW, termH);
      ctx.fillStyle = colors.accent;
      drawLabel(ctx, { text: `A  (high V)`, x: padX, y: topY - 6 });
      ctx.fillStyle = colors.teal;
      drawLabel(ctx, { text: `B  (low V)`, x: padX, y: botY + termH + 6, baseline: 'top' });

      // Field arrows high → low, density/alpha track V
      const Enorm = Math.min(1, V / V_MAX);
      const eAlpha = 0.18 + 0.55 * Enorm;
      const cols = 4;
      for (let i = 0; i < cols; i++) {
        const ax = padX + ((i + 0.5) / cols) * termW;
        drawArrow(
          ctx,
          { x: ax, y: gapTop + 10 },
          { x: ax, y: gapBot - 10 },
          { color: withAlpha(colors.accent, eAlpha), lineWidth: 1.3, headLength: 8, headWidth: 5 },
        );
      }

      // The test charge: radius ∝ q, descending A → B on a loop.
      const frac = (simTime * 0.45) % 1;
      const radius = 7 + (qNow / Q_MAX) * 16;
      const cx = padX + termW / 2;
      const cy = gapTop + 12 + frac * (gapBot - gapTop - 24);
      drawHalo(ctx, {
        x: cx,
        y: cy,
        radius: radius * 2.4,
        color: withAlpha(colors.pink, 0.5),
        alpha: 1,
        extent: 1,
      });
      ctx.fillStyle = colors.pink;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
      drawLabel(ctx, {
        text: '+',
        x: cx,
        y: cy + 1,
        color: colors.bg,
        align: 'center',
        baseline: 'middle',
      });

      // Energy released so far on this trip = qV · frac
      ctx.fillStyle = colors.textDim;
      drawLabel(ctx, {
        text: `q = ${qNow.toFixed(0)} C  →  W = qV = ${fmtEnergy(Wnow)}`,
        x: padX,
        y: 18,
        font: '11px "JetBrains Mono", monospace',
        baseline: 'top',
      });
      drawLabel(ctx, {
        text: `released so far: ${fmtEnergy(Wnow * frac)}`,
        x: cx,
        y: cy + radius + 8,
        color: withAlpha(colors.text, 0.7),
        font: '10px "JetBrains Mono", monospace',
        align: 'center',
        baseline: 'top',
      });
      ctx.restore();

      // Divider
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(splitX, 0);
      ctx.lineTo(splitX, h);
      ctx.stroke();

      // ---- Right: the two bar charts ----
      ctx.save();
      ctx.beginPath();
      ctx.rect(splitX, 0, w - splitX, h);
      ctx.clip();

      const rX = splitX + 22;
      const rW = w - splitX - 40;
      const nBars = Q_MAX;
      const gapBars = 8;
      const barW = (rW - (nBars - 1) * gapBars) / nBars;
      const qHi = Math.round(qNow); // which bar is "you"

      const chartH = (h - 70) / 2 - 16;

      const drawChart = (
        baseY: number,
        title: string,
        valueOf: (qi: number) => number, // the bar's real value
        full: number, // full-scale value
        color: string,
        flatLabel?: string,
      ) => {
        drawLabel(ctx, {
          text: title,
          x: rX,
          y: baseY - chartH - 14,
          color: colors.textDim,
          size: 10,
          font: '10px "JetBrains Mono", monospace',
          baseline: 'top',
        });
        // baseline
        ctx.strokeStyle = colors.border;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(rX, baseY);
        ctx.lineTo(rX + rW, baseY);
        ctx.stroke();
        // optional flat reference line (for the per-charge chart)
        if (flatLabel) {
          const yFlat = baseY - (valueOf(1) / full) * chartH;
          ctx.strokeStyle = withAlpha(colors.teal, 0.6);
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(rX, yFlat);
          ctx.lineTo(rX + rW, yFlat);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = colors.teal;
          drawLabel(ctx, {
            text: flatLabel,
            x: rX + rW,
            y: yFlat - 4,
            align: 'right',
            size: 10,
            font: '10px "JetBrains Mono", monospace',
            baseline: 'bottom',
          });
        }
        for (let i = 0; i < nBars; i++) {
          const qi = i + 1;
          const bh = (valueOf(qi) / full) * chartH;
          const bx = rX + i * (barW + gapBars);
          const isYou = qi === qHi;
          ctx.fillStyle = isYou ? color : withAlpha(color, 0.3);
          ctx.fillRect(bx, baseY - bh, barW, bh);
          ctx.fillStyle = colors.textMuted;
          drawLabel(ctx, {
            text: `${qi}`,
            x: bx + barW / 2,
            y: baseY + 4,
            size: 9,
            font: '9px "JetBrains Mono", monospace',
            align: 'center',
            baseline: 'top',
          });
        }
      };

      // Top chart: total energy W = qV — ramps with q.
      drawChart(
        16 + chartH,
        'Total energy  W = qV  (J)',
        (qi) => qi * V,
        W_MAX,
        colors.accent,
      );
      // Bottom chart: energy per charge W/q = V_ab — flat for every charge.
      drawChart(
        h - 38,
        'Energy per charge  W/q  (J/C = V)',
        () => V,
        V_MAX,
        colors.teal,
        `V_ab = ${V.toFixed(1)} V`,
      );

      drawLabel(ctx, {
        text: 'charge q (C) →',
        x: rX + rW,
        y: h - 14,
        color: colors.textMuted,
        size: 9,
        font: '9px "JetBrains Mono", monospace',
        align: 'right',
        baseline: 'top',
      });
      ctx.restore();
    },
    [],
  );

  return (
    <Demo
      figure={figure}
      title="Voltage is energy per charge"
      question="Send a bigger charge between the same two points. The energy grows — so why is the voltage the same?"
      caption={
        <>
          The two terminals sit at a fixed voltage <em>V</em>
          <sub>ab</sub> apart, with the field in the gap pointing from high to low. Drop a test
          charge and the field does work on it: <em>W = qV</em>
          <sub>ab</sub> joules. Send a charge twice as big and it collects twice the energy — the{' '}
          <em>Total W</em> bars ramp up. But divide each one by its own charge and you get the same
          number every time: the <em>W/q</em> bars stay pinned flat at <em>V</em>
          <sub>ab</sub>. That ratio — joules per coulomb — is what "voltage between two points"
          actually means. It belongs to the points and the field between them, not to the charge you
          probe with.
        </>
      }
      deeperLab={{ slug: 'potential', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={320} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="V_ab"
          value={Vab}
          min={1}
          max={V_MAX}
          step={0.5}
          format={(v) => v.toFixed(1) + ' V'}
          onChange={setVab}
        />
        <MiniSlider
          label="q"
          value={q}
          min={1}
          max={Q_MAX}
          step={1}
          format={(v) => v.toFixed(0) + ' C'}
          onChange={setQ}
        />
        <MiniReadout label="W = qV_ab" value={fmtEnergy(W)} />
        <MiniReadout label="W/q (= V_ab)" value={perCharge.toFixed(1)} unit="V" />
      </DemoControls>
      <EquationStrip
        leftLabel="Energy the field gives this charge"
        left={
          <M
            tex={
              `W \\;=\\; q\\,V_{ab} \\;=\\; (${q.toFixed(0)})(${Vab.toFixed(1)}) ` +
              `\\;=\\; ${W.toFixed(1)}\\ \\text{J}`
            }
          />
        }
        rightLabel="Divide by the charge → the voltage"
        right={
          <M
            tex={
              `V_{ab} \\;=\\; \\dfrac{W}{q} \\;=\\; \\dfrac{${W.toFixed(1)}}{${q.toFixed(0)}} ` +
              `\\;=\\; ${perCharge.toFixed(1)}\\ \\tfrac{\\text{J}}{\\text{C}} \\;=\\; ${perCharge.toFixed(1)}\\ \\text{V}`
            }
          />
        }
      />
    </Demo>
  );
}
