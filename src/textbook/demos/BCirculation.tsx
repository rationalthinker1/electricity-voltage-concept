/**
 * Demo D6.3 — B circulates around the wire
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
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';
import { PHYS, pretty } from '@/lib/physics';

interface Props { figure?: string }

export function BCirculationDemo({ figure }: Props) {
  const [I, setI] = useState(10);
  const [a_mm, setAMm] = useState(1.5);

  const stateRef = useRef({ I, a_mm });
  useEffect(() => { stateRef.current = { I, a_mm }; }, [I, a_mm]);

  const a_m = a_mm * 1e-3;
  const Bsurf = (PHYS.mu_0 * Math.abs(I)) / (2 * Math.PI * a_m);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h } = info;
    let raf = 0;
    let phase = 0;

    function draw() {
      const { I, a_mm } = stateRef.current;
      ctx.fillStyle = '#0d0d10';
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;

      // Wire radius in pixels — scales gently with a_mm so it's visible.
      // Treat a = 1.5 mm as ~14 px on screen.
      const wireR_px = Math.max(8, Math.min(28, 14 * (a_mm / 1.5)));

      // Outer rings — a few concentric circles around the wire.
      const ringRs = [wireR_px + 25, wireR_px + 55, wireR_px + 95, wireR_px + 140, wireR_px + 195];
      const I_norm = Math.max(0, Math.min(1, Math.abs(I) / 50));
      phase += 0.012;

      for (let k = 0; k < ringRs.length; k++) {
        const R = ringRs[k]!;
        if (R > Math.min(w, h) * 0.48) continue;
        const op = 0.18 + 0.22 * (1 - k / ringRs.length) + I_norm * 0.18;
        ctx.strokeStyle = `rgba(108,197,194,${Math.min(0.7, op).toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.stroke();

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
          ctx.strokeStyle = `rgba(108,197,194,${Math.min(0.95, op + 0.3).toFixed(3)})`;
          ctx.fillStyle = ctx.strokeStyle;
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          ctx.moveTo(ax - tx * len * 0.5, ay - ty * len * 0.5);
          ctx.lineTo(ax + tx * len * 0.5, ay + ty * len * 0.5);
          ctx.stroke();
          // arrowhead
          const hx = ax + tx * len * 0.5;
          const hy = ay + ty * len * 0.5;
          const nx = -ty, ny = tx;
          ctx.beginPath();
          ctx.moveTo(hx, hy);
          ctx.lineTo(hx - tx * 4 + nx * 3, hy - ty * 4 + ny * 3);
          ctx.lineTo(hx - tx * 4 - nx * 3, hy - ty * 4 - ny * 3);
          ctx.closePath();
          ctx.fill();
        }
      }

      // Animated tracer dot circling at one of the radii to suggest the field
      // direction (CW for current into page).
      const tracerR = ringRs[1]!;
      const tracerTheta = phase * Math.PI * 2;
      const tx = cx + tracerR * Math.cos(tracerTheta);
      const ty = cy + tracerR * Math.sin(tracerTheta);
      ctx.fillStyle = 'rgba(108,197,194,0.9)';
      ctx.beginPath(); ctx.arc(tx, ty, 2.4, 0, Math.PI * 2); ctx.fill();

      // ── Wire (end-on disc) at center
      const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, wireR_px * 3);
      halo.addColorStop(0, 'rgba(255,107,42,0.45)');
      halo.addColorStop(1, 'rgba(255,107,42,0)');
      ctx.fillStyle = halo;
      ctx.beginPath(); ctx.arc(cx, cy, wireR_px * 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#1c1c22';
      ctx.strokeStyle = '#ff6b2a';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(cx, cy, wireR_px, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      // × glyph (current into page)
      ctx.strokeStyle = '#ff6b2a';
      ctx.lineWidth = 2;
      const k = wireR_px * 0.55;
      ctx.beginPath();
      ctx.moveTo(cx - k, cy - k); ctx.lineTo(cx + k, cy + k);
      ctx.moveTo(cx + k, cy - k); ctx.lineTo(cx - k, cy + k);
      ctx.stroke();

      // Wire label
      ctx.fillStyle = 'rgba(160,158,149,.85)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText(`I = ${I.toFixed(1)} A  ⊗  (into page)`, cx, cy + wireR_px * 3 + 6);

      // Top-left labels
      ctx.fillStyle = '#6cc5c2';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText('B  (circumferential)', 18, 14);
      ctx.fillStyle = 'rgba(160,158,149,.7)';
      ctx.fillText('right-hand rule: thumb along I, fingers curl with B', 18, 30);

      // Bottom: surface B value
      const a_m_ = a_mm * 1e-3;
      const B_ = (PHYS.mu_0 * Math.abs(I)) / (2 * Math.PI * a_m_);
      ctx.fillStyle = '#6cc5c2';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      ctx.fillText(`B at surface (r = a) = μ₀ I / (2π a) = ${pretty(B_)} T`, w / 2, h - 12);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 6.3'}
      title="B wraps the wire"
      question="And the magnetic field — which way does that point?"
      caption={<>
        End-on view of the same wire (current into the page, ⊗). The teal circles are <strong>B</strong>; tangent arrows show
        its direction by the right-hand rule. <strong>B</strong> is <em>circumferential</em> — perpendicular at every point to the axial
        <strong> E</strong>. That perpendicularity is exactly what makes their cross product non-zero, and that cross product is the energy flux.
      </>}
      deeperLab={{ slug: 'biot-savart', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="I"
          value={I} min={0.1} max={50} step={0.1}
          format={v => v.toFixed(1) + ' A'}
          onChange={setI}
        />
        <MiniSlider
          label="a"
          value={a_mm} min={0.5} max={5} step={0.05}
          format={v => v.toFixed(2) + ' mm'}
          onChange={setAMm}
        />
        <MiniReadout label="|B| at surface" value={<Num value={Bsurf} />} unit="T" />
      </DemoControls>
    </Demo>
  );
}
