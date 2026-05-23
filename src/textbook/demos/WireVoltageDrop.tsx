/**
 * Demo D3.0b — Wire voltage drop
 *
 * A simple uniform wire carrying current I. The reader drags a probe along
 * the wire; the readout shows V(x), and a "potential landscape" above the
 * wire renders the linear gradient from V₀ at the left terminal to 0 at the
 * right terminal. The IR drop across the partial segment from the source to
 * the probe is displayed live.
 *
 * Pedagogical thrust: voltage does not "jump" across a resistor — it falls
 * smoothly along the wire's length. Drag the probe to the midpoint and the
 * reading is exactly half the total drop, the cleanest possible statement of
 * the linear V(x) = V₀ − I·R·(x/L) relationship. This fills the FAQ gap
 * "what is 'voltage drop' really?" with a draggable picture rather than an
 * algebraic identity.
 *
 * Source pattern: Griffiths §7.1; PhET "Resistance in a Wire" + a sliding
 * voltmeter probe (the gap PhET's sim doesn't fill). The hill metaphor
 * echoes Ch.2's `VoltageAsHeight` demo, applied here to a single uniform
 * wire under steady current.
 */
import { useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, EquationStrip, MiniReadout, MiniSlider } from '@/components/Demo';
import { InlineMath } from '@/components/Formula';
import { Num } from '@/components/Num';
import { pathRoundRect } from '@/lib/canvasPrimitives';
import { withAlpha } from '@/lib/canvasTheme';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';
import { drawLabel } from "@/lib/canvasLayout";

interface Props {
  figure: string;
}

export function WireVoltageDropDemo({ figure }: Props) {
  // Steady-state DC. Source voltage held at 12 V; wire resistance and
  // current are the two control knobs. The probe's position on the wire
  // is the third (draggable).
  const V0 = 12;
  const [I, setI] = useState(1.5);
  const [R, setR] = useState(6);
  // Probe normalised position along the wire, 0 = left terminal, 1 = right.
  const [probeT, setProbeT] = useState(0.5);

  const stateRef = useSimState({ I, R, probeT });

  // Live derived quantities for the readouts and EquationStrip.
  const Vdrop = I * R; // total IR drop end-to-end
  const Vprobe = V0 - I * R * probeT; // potential at the probe
  const Vfrom0 = I * R * probeT; // drop from the left terminal to the probe

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, colors }) => {
      const { I, R, probeT } = stateRef.current;
      const Vd = I * R; // total drop
      const Vp = V0 - Vd * probeT; // V at probe

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      // Layout regions:
      //   top half  — potential landscape (a sloped "hill" falling left → right)
      //   bottom    — the wire and the probe
      const wireLeft = 80;
      const wireRight = w - 80;
      const wireLen = wireRight - wireLeft;
      const wireCY = h * 0.62;
      const wireThickness = 28;
      const wireTop = wireCY - wireThickness / 2;
      const wireBot = wireCY + wireThickness / 2;

      // Potential-landscape baseline (top of wire = "ground", goes up = high V).
      const hillBaseY = wireTop - 6;
      const hillMaxH = h * 0.45;
      // Map V0 to full hill height. Vd ≤ V0 always (clamped below) so the
      // visible hill stays inside the canvas.
      const VdClamped = Math.min(Vd, V0);
      const yOfV = (v: number) => hillBaseY - (Math.max(0, v) / V0) * hillMaxH;

      // ── Filled hill (left tall → right short) ──────────────────────────
      const hillGrad = ctx.createLinearGradient(wireLeft, hillBaseY, wireRight, hillBaseY);
      hillGrad.addColorStop(0, withAlpha(colors.pink, 0.45));
      hillGrad.addColorStop(1, withAlpha(colors.blue, 0.35));
      ctx.fillStyle = hillGrad;
      ctx.beginPath();
      ctx.moveTo(wireLeft, hillBaseY);
      ctx.lineTo(wireLeft, yOfV(V0));
      ctx.lineTo(wireRight, yOfV(V0 - VdClamped));
      ctx.lineTo(wireRight, hillBaseY);
      ctx.closePath();
      ctx.fill();

      // Hill outline.
      ctx.strokeStyle = withAlpha(colors.teal, 0.7);
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(wireLeft, yOfV(V0));
      ctx.lineTo(wireRight, yOfV(V0 - VdClamped));
      ctx.stroke();

      // V-axis ticks at 0 V and V₀ on the left edge.
      ctx.fillStyle = withAlpha(colors.textDim, 0.85);
      drawLabel(ctx, { text: `${V0} V`, x: wireLeft - 8, y: yOfV(V0), font: '10px "JetBrains Mono", monospace', align: 'right', baseline: 'middle' });
      drawLabel(ctx, { text: '0 V', x: wireLeft - 8, y: hillBaseY, font: '10px "JetBrains Mono", monospace', align: 'right', baseline: 'middle' });

      // ── Wire body (bottom row) ─────────────────────────────────────────
      // Gradient along the wire matches the hill: pink (+) on the left,
      // blue (−) on the right, fading through the gap.
      const wireGrad = ctx.createLinearGradient(wireLeft, 0, wireRight, 0);
      wireGrad.addColorStop(0, withAlpha(colors.pink, 0.7));
      wireGrad.addColorStop(0.5, withAlpha(colors.accent, 0.4));
      wireGrad.addColorStop(1, withAlpha(colors.blue, 0.7));
      ctx.fillStyle = wireGrad;
      pathRoundRect(ctx, wireLeft, wireTop, wireLen, wireThickness, 8);
      ctx.fill();
      ctx.strokeStyle = withAlpha(colors.textDim, 0.5);
      ctx.lineWidth = 1;
      pathRoundRect(ctx, wireLeft, wireTop, wireLen, wireThickness, 8);
      ctx.stroke();

      // Terminal markers (+ on left, − on right).
      drawLabel(ctx, { text: '+', x: wireLeft - 18, y: wireCY, color: colors.pink, weight: 'bold', size: 12, font: 'bold 12px "JetBrains Mono", monospace', align: 'center', baseline: 'middle' });
      drawLabel(ctx, { text: '−', x: wireRight + 18, y: wireCY, color: colors.blue, weight: 'bold', size: 12, font: 'bold 12px "JetBrains Mono", monospace', align: 'center', baseline: 'middle' });

      // Current-direction arrow above the wire (conventional current +→−).
      const arrowY = wireTop - 18;
      const ax0 = wireLeft + wireLen * 0.35;
      const ax1 = wireLeft + wireLen * 0.65;
      ctx.strokeStyle = withAlpha(colors.accent, 0.7);
      ctx.fillStyle = withAlpha(colors.accent, 0.7);
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(ax0, arrowY);
      ctx.lineTo(ax1, arrowY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(ax1, arrowY);
      ctx.lineTo(ax1 - 7, arrowY - 4);
      ctx.lineTo(ax1 - 7, arrowY + 4);
      ctx.closePath();
      ctx.fill();
      drawLabel(ctx, { text: `I = ${I.toFixed(2)} A`, x: (ax0 + ax1) / 2, y: arrowY - 6, font: '10px "JetBrains Mono", monospace', align: 'center' });

      // ── Probe ─────────────────────────────────────────────────────────
      const px = wireLeft + probeT * wireLen;
      // Drop a vertical guide from the probe up to the hill outline at this x.
      const hillY = yOfV(V0 - Vd * probeT);
      ctx.strokeStyle = withAlpha(colors.teal, 0.7);
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px, wireTop);
      ctx.lineTo(px, hillY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Probe disc on the wire.
      ctx.fillStyle = colors.accent;
      ctx.beginPath();
      ctx.arc(px, wireCY, 9, 0, Math.PI * 2);
      ctx.fill();
      drawLabel(ctx, { text: 'P', x: px, y: wireCY + 1, color: colors.bg, weight: 'bold', font: 'bold 10px "JetBrains Mono", monospace', align: 'center', baseline: 'middle' });
      // V-at-probe readout, attached to the hill crossing point.
      drawLabel(ctx, { text: `V(P) ≈ ${Vp.toFixed(2)} V`, x: px, y: hillY - 10, color: colors.accent, font: '10px "JetBrains Mono", monospace', align: 'center' });

      // ── Bottom caption / position label ───────────────────────────────
      ctx.fillStyle = withAlpha(colors.textDim, 0.8);
      drawLabel(ctx, { text: 'drag the probe along the wire', x: wireLeft, y: wireBot + 22, font: '10px "JetBrains Mono", monospace' });
      drawLabel(ctx, { text: `position: ${(probeT * 100).toFixed(0)}% of wire length`, x: wireRight, y: wireBot + 22, font: '10px "JetBrains Mono", monospace', align: 'right' });
    },
    [],
    (info) => {
      const { canvas, w, h } = info;
      let dragging = false;

      function tFromMouse(mx: number, wireLeft: number, wireRight: number): number {
        const span = wireRight - wireLeft;
        return Math.max(0, Math.min(1, (mx - wireLeft) / span));
      }

      const wireLeft = 80;
      const wireRight = w - 80;
      const wireCY = h * 0.62;

      function onMouseDown(e: MouseEvent) {
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        if (Math.abs(my - wireCY) < 50 && mx >= wireLeft - 10 && mx <= wireRight + 10) {
          dragging = true;
          const t = tFromMouse(mx, wireLeft, wireRight);
          setProbeT(t);
          stateRef.current = { ...stateRef.current, probeT: t };
          canvas.style.cursor = 'grabbing';
        }
      }
      function onMouseMove(e: MouseEvent) {
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        if (dragging) {
          const t = tFromMouse(mx, wireLeft, wireRight);
          setProbeT(t);
          stateRef.current = { ...stateRef.current, probeT: t };
        } else {
          canvas.style.cursor =
            Math.abs(my - wireCY) < 50 && mx >= wireLeft - 10 && mx <= wireRight + 10
              ? 'grab'
              : 'default';
        }
      }
      function onMouseUp() {
        dragging = false;
        canvas.style.cursor = 'default';
      }
      function onTouchStart(e: TouchEvent) {
        const t0 = e.touches[0];
        if (!t0) return;
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const mx = t0.clientX - rect.left;
        const my = t0.clientY - rect.top;
        if (Math.abs(my - wireCY) < 60 && mx >= wireLeft - 20 && mx <= wireRight + 20) {
          dragging = true;
          const t = tFromMouse(mx, wireLeft, wireRight);
          setProbeT(t);
          stateRef.current = { ...stateRef.current, probeT: t };
        }
      }
      function onTouchMove(e: TouchEvent) {
        if (!dragging) return;
        const t0 = e.touches[0];
        if (!t0) return;
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const mx = t0.clientX - rect.left;
        const t = tFromMouse(mx, wireLeft, wireRight);
        setProbeT(t);
        stateRef.current = { ...stateRef.current, probeT: t };
      }
      function onTouchEnd() {
        dragging = false;
      }

      canvas.addEventListener('mousedown', onMouseDown);
      canvas.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      canvas.addEventListener('touchstart', onTouchStart, { passive: false });
      canvas.addEventListener('touchmove', onTouchMove, { passive: false });
      canvas.addEventListener('touchend', onTouchEnd);

      return {
        context: undefined,
        cleanup: () => {
          canvas.removeEventListener('mousedown', onMouseDown);
          canvas.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('mouseup', onMouseUp);
          canvas.removeEventListener('touchstart', onTouchStart);
          canvas.removeEventListener('touchmove', onTouchMove);
          canvas.removeEventListener('touchend', onTouchEnd);
        },
      };
    },
  );

  return (
    <Demo
      figure={figure}
      title="Voltage drops linearly along a uniform wire"
      question="A wire is one resistor — but where does the voltage drop happen?"
      caption={
        <>
          A uniform resistive wire with potential <strong>V₀ = 12 V</strong> at the left terminal
          and <strong>0 V</strong> at the right. The shaded hill above the wire is the electrostatic
          potential <strong>V(x)</strong> — a perfectly linear ramp from <strong>V₀</strong> down to
          zero. Drag the probe to the midpoint and the reading is exactly half the total drop. The
          "voltage drop across a resistor" isn't a jump at the ends — it's a smooth potential
          gradient along the whole length, and the missing potential energy radiates as Joule heat
          at the rate <strong>I²R</strong> per unit length.
        </>
      }
      deeperLab={{ slug: 'ohms-law', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={320} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="current I"
          value={I}
          min={0.1}
          max={3}
          step={0.05}
          format={(v) => v.toFixed(2) + ' A'}
          onChange={setI}
        />
        <MiniSlider
          label="wire R"
          value={R}
          min={1}
          max={50}
          step={0.5}
          format={(v) => v.toFixed(1) + ' Ω'}
          onChange={setR}
        />
        <MiniReadout label="V₀ − V(P)" value={<Num value={Vfrom0} />} unit="V" />
        <MiniReadout label="V(P)" value={<Num value={Vprobe} />} unit="V" />
        <MiniReadout label="total IR drop" value={<Num value={Vdrop} />} unit="V" />
      </DemoControls>
      <EquationStrip
        leftLabel="Potential along the wire"
        left={<InlineMath tex="V(x) \;=\; V_{0} - I R\, (x/L)" />}
        rightLabel="Substitution at the probe"
        right={
          <InlineMath
            tex={
              `V(P) \\;=\\; ${V0} - ${I.toFixed(2)} \\times ${R.toFixed(1)} \\times ` +
              `${probeT.toFixed(2)} \\;\\approx\\; ${Vprobe.toFixed(2)}\\ \\text{V}`
            }
          />
        }
      />
    </Demo>
  );
}
