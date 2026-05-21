/**
 * Demo D4.1 — Magnetic field around a long straight wire
 *
 * Top-down view: the wire is end-on (a small filled circle at the center
 * with a × for current going into the page or • for current coming out).
 * Concentric teal B-field circles around it; tiny tangent arrows show
 * direction by the right-hand rule. A draggable orange probe reads
 * |B| = μ₀ I / (2π r) at its location.
 */
import { useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, EquationStrip, MiniReadout, MiniSlider, MiniToggle } from '@/components/Demo';
import { InlineMath } from '@/components/Formula';
import { Num } from '@/components/Num';
import { drawHalo } from '@/lib/canvasPrimitives';
import { withAlpha } from '@/lib/canvasTheme';
import { PHYS } from '@/lib/physics';
import { fmtSIPrecision } from '@/lib/formatters';
import { drawLabel } from "@/lib/canvasLayout";
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

interface Props {
  figure?: string;
}

interface WireBFieldContext {
  cleanup: () => void;
}

export function WireBFieldDemo({ figure }: Props) {
  const [I, setI] = useState(10); // amps
  const [intoPage, setIntoPage] = useState(true);
  const [probe, setProbe] = useState({ x: 0.72, y: 0.36 });

  const stateRef = useSimState({ I, intoPage, probe });

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, colors }, state) => {
      const { I, intoPage, probe } = state;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      const cx0 = w / 2,
        cy0 = h / 2;
      // Pixel scale: 1 px = 1 mm. Probe distance in meters → r/1000.
      const PX_PER_M = 1000;

      // Concentric B-field circles. Opacity scales with current and 1/r.
      const I_norm = Math.max(0.0001, I) / 50; // 0..1
      const radii = [40, 70, 110, 160, 220, 290];
      for (const R of radii) {
        if (R > Math.min(w, h) * 0.55) continue;
        const r_m = R / PX_PER_M;
        const B = (PHYS.mu_0 * Math.abs(I)) / (2 * Math.PI * r_m);
        // Map log(B) to opacity. Floor + scale.
        const op = Math.min(0.55, 0.08 + 0.08 * Math.log10(B * 1e6 + 1) + I_norm * 0.18);
        ctx.strokeStyle = withAlpha(colors.teal, op);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx0, cy0, R, 0, Math.PI * 2);
        ctx.stroke();

        // Tangent arrows at intervals around the circle.
        const arrowDir = intoPage ? +1 : -1;
        const nArrows = Math.max(4, Math.floor(R / 18));
        for (let i = 0; i < nArrows; i++) {
          const theta = (i / nArrows) * Math.PI * 2;
          const ax = cx0 + R * Math.cos(theta);
          const ay = cy0 + R * Math.sin(theta);
          const tx = -Math.sin(theta) * arrowDir;
          const ty = Math.cos(theta) * arrowDir;
          const len = 7 + I_norm * 5;
          ctx.strokeStyle = withAlpha(colors.teal, Math.min(0.95, op + 0.25));
          ctx.fillStyle = ctx.strokeStyle;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(ax - tx * len * 0.5, ay - ty * len * 0.5);
          ctx.lineTo(ax + tx * len * 0.5, ay + ty * len * 0.5);
          ctx.stroke();
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

      // Wire end-on (filled disc).
      const wireR = 12;
      drawHalo(ctx, {
        x: cx0,
        y: cy0,
        radius: wireR * 3,
        color: colors.accent,
        alpha: 0.55,
        extent: 1,
      });
      ctx.fillStyle = colors.surfaceHover;
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx0, cy0, wireR, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // × (into page) or • (out of page) glyph.
      ctx.strokeStyle = colors.accent;
      ctx.fillStyle = colors.accent;
      if (intoPage) {
        ctx.lineWidth = 2;
        const k = wireR * 0.55;
        ctx.beginPath();
        ctx.moveTo(cx0 - k, cy0 - k);
        ctx.lineTo(cx0 + k, cy0 + k);
        ctx.moveTo(cx0 + k, cy0 - k);
        ctx.lineTo(cx0 - k, cy0 + k);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(cx0, cy0, wireR * 0.32, 0, Math.PI * 2);
        ctx.fill();
      }

      // Wire label
      ctx.fillStyle = withAlpha(colors.textDim, 0.85);
      drawLabel(ctx, { text: `I = ${I.toFixed(1)} A ${intoPage ? '⊗' : '⊙'}`, x: cx0, y: cy0 + wireR * 3 + 14, font: '10px "JetBrains Mono", monospace', align: 'center' });

      // Probe
      const px = probe.x * w,
        py = probe.y * h;
      const dx = px - cx0,
        dy = py - cy0;
      const r_px = Math.max(2, Math.hypot(dx, dy));
      const r_m = r_px / PX_PER_M;
      const Bprobe = (PHYS.mu_0 * Math.abs(I)) / (2 * Math.PI * r_m);

      // Radial line from wire to probe
      ctx.strokeStyle = withAlpha(colors.accent, 0.35);
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx0, cy0);
      ctx.lineTo(px, py);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = withAlpha(colors.bg, 0.9);
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(px, py, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      drawLabel(ctx, { text: 'P', x: px, y: py, color: colors.accent, weight: 'bold', font: '10px "JetBrains Mono"', align: 'center', baseline: 'middle' });

      // Probe distance label
      ctx.fillStyle = withAlpha(colors.text, 0.85);
      drawLabel(ctx, { text: `r = ${(r_m * 1000).toFixed(0)} mm`, x: px, y: py - 16, font: '10px "JetBrains Mono", monospace', align: 'center' });
      drawLabel(ctx, { text: `|B| = ${fmtSIPrecision(Bprobe, 'T', 2)}`, x: px, y: py + 22, color: colors.teal, font: '10px "JetBrains Mono", monospace', align: 'center' });
    },
    [],
    ({ canvas, w, h }) => {
      let dragging = false;

      function getMouse(e: MouseEvent | TouchEvent): [number, number] {
        const r = canvas.getBoundingClientRect();
        const t = 'touches' in e ? e.touches[0] : e;
        if (!t) return [0, 0];
        return [t.clientX - r.left, t.clientY - r.top];
      }
      function onMouseDown(e: MouseEvent) {
        const [mx, my] = getMouse(e);
        const px = stateRef.current.probe.x * w;
        const py = stateRef.current.probe.y * h;
        if (Math.hypot(mx - px, my - py) < 22) {
          dragging = true;
          canvas.style.cursor = 'grabbing';
        }
      }
      function onMouseMove(e: MouseEvent) {
        const [mx, my] = getMouse(e);
        if (dragging) {
          setProbe({
            x: Math.max(0.05, Math.min(0.95, mx / w)),
            y: Math.max(0.08, Math.min(0.92, my / h)),
          });
        } else {
          const px = stateRef.current.probe.x * w;
          const py = stateRef.current.probe.y * h;
          canvas.style.cursor = Math.hypot(mx - px, my - py) < 22 ? 'grab' : 'default';
        }
      }
      function onMouseUp() {
        dragging = false;
        canvas.style.cursor = 'default';
      }
      function onTouchStart(e: TouchEvent) {
        e.preventDefault();
        const [mx, my] = getMouse(e);
        const px = stateRef.current.probe.x * w;
        const py = stateRef.current.probe.y * h;
        if (Math.hypot(mx - px, my - py) < 30) dragging = true;
      }
      function onTouchMove(e: TouchEvent) {
        e.preventDefault();
        if (!dragging) return;
        const [mx, my] = getMouse(e);
        setProbe({
          x: Math.max(0.05, Math.min(0.95, mx / w)),
          y: Math.max(0.08, Math.min(0.92, my / h)),
        });
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
        context: { cleanup: () => undefined } as WireBFieldContext,
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

  // Static readout uses an estimated canvas width to avoid threading dims out.
  const W_est = 880;
  const dx = (probe.x - 0.5) * W_est;
  const dy = (probe.y - 0.5) * 320;
  const r_m = Math.max(Math.hypot(dx, dy) * 1e-3, 5e-3);
  const Bprobe = (PHYS.mu_0 * Math.abs(I)) / (2 * Math.PI * r_m);

  return (
    <Demo
      figure={figure ?? 'Fig. 6.1'}
      title="The field around a current"
      question="What does the magnetic field of a wire actually look like?"
      caption={
        <>
          End-on view of a long straight wire carrying current <strong>I</strong>. Teal circles are
          the magnetic field <strong>B</strong>; tangent arrows show its direction (right-hand rule
          — thumb along <strong>I</strong>, fingers curl with <strong>B</strong>). Drag the orange
          probe; the magnitude follows <em>B = μ₀ I / (2πr)</em>.
        </>
      }
      deeperLab={{ slug: 'biot-savart', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={320} setup={setup} />
      <DemoControls>
        <MiniToggle
          label={intoPage ? 'I into page ⊗' : 'I out of page ⊙'}
          checked={intoPage}
          onChange={setIntoPage}
        />
        <MiniSlider
          label="I"
          value={I}
          min={0}
          max={50}
          step={0.1}
          format={(v) => v.toFixed(1) + ' A'}
          onChange={setI}
        />
        <MiniReadout label="|B| at probe" value={<Num value={Bprobe} digits={2} />} unit="T" />
      </DemoControls>
      <EquationStrip
        leftLabel="Long-wire B-field"
        left={
          <InlineMath
            tex={
              `|\\vec{B}| \\;=\\; \\dfrac{\\mu_{0} I}{2\\pi r} \\;\\approx\\; ${Bprobe.toExponential(2)}\\ \\text{T}`
            }
          />
        }
        rightLabel="Falls as 1 / r"
        right={
          <InlineMath
            tex={`|\\vec{B}(2r)| \\;=\\; \\tfrac{1}{2}\\,|\\vec{B}(r)|`}
          />
        }
      />
    </Demo>
  );
}
