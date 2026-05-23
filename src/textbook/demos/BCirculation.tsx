/**
 * Demo D8.4 — B circulates around the wire
 *
 * End-on view of a current-carrying wire (cross section as a small disc
 * with × indicating current into the page). Concentric teal B-field
 * circles around it; tangential arrows show direction by the right-hand
 * rule. Slider for I. Live readout B = μ₀ I / (2π a) at the surface.
 *
 * The point: B is *circumferential*. It is perpendicular to the axial E
 * shown in the previous demo. That perpendicularity is what makes the
 * cross product E × B come out *radial* — and that radial cross product
 * is the Poynting vector.
 */
import { useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, EquationStrip, MiniReadout, MiniSlider } from '@/components/Demo';
import { InlineMath } from '@/components/Formula';
import { Num } from '@/components/Num';
import { drawLabel } from '@/lib/canvasLayout';
import { drawHalo } from '@/lib/canvasPrimitives';
import { PHYS, pretty } from '@/lib/physics';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

function fmtLatex(n: number, digits = 2): string {
  if (!isFinite(n)) return '—';
  const abs = Math.abs(n);
  if (abs === 0) return '0';
  if (abs >= 1e-2 && abs < 1e6) return n.toFixed(digits);
  const s = n.toExponential(digits);
  const [m, e] = s.split('e');
  return `${m} \\times 10^{${parseInt(e!, 10)}}`;
}

interface Props {
  figure: string;
}

export function BCirculationDemo({ figure }: Props) {
  const [I, setI] = useState(10);
  const [a_mm, setAMm] = useState(1.5);

  const stateRef = useSimState({ I, a_mm });
  const a_m = a_mm * 1e-3;
  const Bsurf = (PHYS.mu_0 * Math.abs(I)) / (2 * Math.PI * a_m);

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, colors }, _state, _dt, _simTime, ctx0) => {
      let phase = ctx0.phase;
      const { I, a_mm } = stateRef.current;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;
      const wireR_px = Math.max(8, Math.min(28, 14 * (a_mm / 1.5)));
      const ringRs = [wireR_px + 25, wireR_px + 55, wireR_px + 95, wireR_px + 140, wireR_px + 195];
      const I_norm = Math.max(0, Math.min(1, Math.abs(I) / 50));
      phase += 0.012;
      for (let k = 0; k < ringRs.length; k++) {
        const R = ringRs[k]!;
        if (R > Math.min(w, h) * 0.48) continue;
        const op = 0.18 + 0.22 * (1 - k / ringRs.length) + I_norm * 0.18;
        ctx.save();
        ctx.globalAlpha = Math.min(0.7, op);
        ctx.strokeStyle = colors.teal;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // Tangent arrows around the ring. Right-hand rule: current INTO page
        // (×) → fingers curl clockwise as seen on screen.
        const nArrows = Math.max(4, Math.floor(R / 22));
        for (let i = 0; i < nArrows; i++) {
          const theta = (i / nArrows) * Math.PI * 2;
          const ax = cx + R * Math.cos(theta);
          const ay = cy + R * Math.sin(theta);
          // CW tangent in screen coords: derivative of (cos θ, sin θ) is (−sin θ, cos θ);
          // for CW (current into page) we want the negative of this in screen space.
          const tx = -Math.sin(theta);
          const ty = Math.cos(theta);
          const len = 9 + I_norm * 6;
          ctx.save();
          ctx.globalAlpha = Math.min(0.95, op + 0.3);
          ctx.strokeStyle = colors.teal;
          ctx.fillStyle = ctx.strokeStyle;
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          ctx.moveTo(ax - tx * len * 0.5, ay - ty * len * 0.5);
          ctx.lineTo(ax + tx * len * 0.5, ay + ty * len * 0.5);
          ctx.stroke();
          ctx.restore();
          // arrowhead
          const hx = ax + tx * len * 0.5;
          const hy = ay + ty * len * 0.5;
          const nx = -ty,
            ny = tx;
          ctx.beginPath();
          ctx.moveTo(hx, hy);
          ctx.lineTo(hx - tx * 4 + nx * 3, hy - ty * 4 + ny * 3);
          ctx.lineTo(hx - tx * 4 - nx * 3, hy - ty * 4 - ny * 3);
          ctx.closePath();
          ctx.fill();
        }
      }
      const tracerR = ringRs[1]!;
      const tracerTheta = phase * Math.PI * 2;
      const tx = cx + tracerR * Math.cos(tracerTheta);
      const ty = cy + tracerR * Math.sin(tracerTheta);
      ctx.fillStyle = colors.teal;
      ctx.beginPath();
      ctx.arc(tx, ty, 2.4, 0, Math.PI * 2);
      ctx.fill();
      drawHalo(ctx, {
        x: cx,
        y: cy,
        radius: wireR_px * 3,
        color: colors.accent,
        alpha: 0.45,
        extent: 1,
      });
      ctx.fillStyle = colors.surfaceHover;
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, wireR_px, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 2;
      const k = wireR_px * 0.55;
      ctx.beginPath();
      ctx.moveTo(cx - k, cy - k);
      ctx.lineTo(cx + k, cy + k);
      ctx.moveTo(cx + k, cy - k);
      ctx.lineTo(cx - k, cy + k);
      ctx.stroke();
      ctx.save();
      ctx.globalAlpha = 0.85;
      drawLabel(ctx, { text: `I = ${I.toFixed(1)} A  ⊗  (into page)`, x: cx, y: cy + wireR_px * 3 + 6, font: '10px "JetBrains Mono", monospace', align: 'center', baseline: 'top' });
      ctx.restore();
      drawLabel(ctx, { text: 'B  (circumferential)', x: 18, y: 14, color: colors.teal, size: 11, font: '11px "JetBrains Mono", monospace', baseline: 'top' });
      ctx.save();
      ctx.globalAlpha = 0.7;
      drawLabel(ctx, { text: 'right-hand rule: thumb along I, fingers curl with B', x: 18, y: 30 });
      ctx.restore();
      const a_m_ = a_mm * 1e-3;
      const B_ = (PHYS.mu_0 * Math.abs(I)) / (2 * Math.PI * a_m_);
      drawLabel(ctx, {
        x: w / 2,
        y: h - 12,
        text: `B at surface (r = a) = μ₀ I / (2π a) = ${pretty(B_)} T`,
        color: colors.teal,
        size: 11,
        align: 'center',
      });
      ctx0.phase = phase;
    },
    [],
    () => ({ context: { phase: 0 } }),
  );

  return (
    <Demo
      figure={figure}
      title="B wraps the wire"
      question="And the magnetic field — which way does that point?"
      caption={
        <>
          End-on view of the same wire (current into the page, ⊗). The teal circles are{' '}
          <strong>B</strong>; tangent arrows show its direction by the right-hand rule.{' '}
          <strong>B</strong> is <em>circumferential</em> — perpendicular at every point to the axial
          <strong> E</strong>. That perpendicularity is exactly what makes their cross product
          non-zero, and that cross product is the energy flux.
        </>
      }
      deeperLab={{ slug: 'biot-savart', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="I"
          value={I}
          min={0.1}
          max={50}
          step={0.1}
          format={(v) => v.toFixed(1) + ' A'}
          onChange={setI}
        />
        <MiniSlider
          label="a"
          value={a_mm}
          min={0.5}
          max={5}
          step={0.05}
          format={(v) => v.toFixed(2) + ' mm'}
          onChange={setAMm}
        />
        <MiniReadout label="|B| at surface" value={<Num value={Bsurf} />} unit="T" />
      </DemoControls>
      <EquationStrip
        leftLabel="Magnetic field at surface"
        left={
          <InlineMath
            tex={
              `|B| = \\dfrac{\\mu_0 I}{2\\pi a} = \\dfrac{(${fmtLatex(PHYS.mu_0, 2)})(${I.toFixed(1)})}{2\\pi (${fmtLatex(a_mm * 1e-3, 2)})} \\approx ${fmtLatex(Bsurf, 2)} \\text{ T}`
            }
          />
        }
        rightLabel="Scaling"
        right={<InlineMath tex={`B \\propto I / a`} />}
      />
    </Demo>
  );
}
