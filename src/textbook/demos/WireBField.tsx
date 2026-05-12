/**
 * Demo D4.1 — Magnetic field around a long straight wire
 *
 * Top-down view: the wire is end-on (a small filled circle at the center
 * with a × for current going into the page or • for current coming out).
 * Concentric teal B-field circles around it; tiny tangent arrows show
 * direction by the right-hand rule. A draggable orange probe reads
 * |B| = μ₀ I / (2π r) at its location.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider, MiniToggle } from '@/components/Demo';
import { PHYS, pretty } from '@/lib/physics';

interface Props { figure?: string }

export function WireBFieldDemo({ figure }: Props) {
  const [I, setI] = useState(10);              // amps
  const [intoPage, setIntoPage] = useState(true);
  const [probe, setProbe] = useState({ x: 0.72, y: 0.36 });

  const stateRef = useRef({ I, intoPage, probe });
  useEffect(() => { stateRef.current = { I, intoPage, probe }; }, [I, intoPage, probe]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, canvas } = info;
    let raf = 0;
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
        dragging = true; canvas.style.cursor = 'grabbing';
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
    function onMouseUp() { dragging = false; canvas.style.cursor = 'default'; }
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
    function onTouchEnd() { dragging = false; }

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);

    function draw() {
      const { I, intoPage, probe } = stateRef.current;
      ctx.fillStyle = '#0d0d10';
      ctx.fillRect(0, 0, w, h);

      const cx0 = w / 2, cy0 = h / 2;
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
        ctx.strokeStyle = `rgba(108,197,194,${op.toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx0, cy0, R, 0, Math.PI * 2);
        ctx.stroke();

        // Tangent arrows at intervals around the circle.
        // RHR: thumb out of page (• ; intoPage=false) → fingers curl CCW viewed from +z.
        // intoPage=true → CW. We use angle direction sign accordingly.
        const arrowDir = intoPage ? +1 : -1; // +1 → CW in screen coords
        const nArrows = Math.max(4, Math.floor(R / 18));
        for (let i = 0; i < nArrows; i++) {
          const theta = (i / nArrows) * Math.PI * 2;
          const ax = cx0 + R * Math.cos(theta);
          const ay = cy0 + R * Math.sin(theta);
          // Tangent direction: perpendicular to radial. For CW (positive arrowDir)
          // tangent at angle θ is (sin θ, -cos θ) in standard math coords; in
          // screen coords y is flipped, so direction = (-sin θ, cos θ) for CW.
          const tx = -Math.sin(theta) * arrowDir;
          const ty =  Math.cos(theta) * arrowDir;
          const len = 7 + I_norm * 5;
          ctx.strokeStyle = `rgba(108,197,194,${Math.min(0.95, op + 0.25).toFixed(3)})`;
          ctx.fillStyle = ctx.strokeStyle;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(ax - tx * len * 0.5, ay - ty * len * 0.5);
          ctx.lineTo(ax + tx * len * 0.5, ay + ty * len * 0.5);
          ctx.stroke();
          // arrowhead
          const hx = ax + tx * len * 0.5;
          const hy = ay + ty * len * 0.5;
          // perpendicular for head wings
          const nx = -ty, ny = tx;
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
      const grd = ctx.createRadialGradient(cx0, cy0, 0, cx0, cy0, wireR * 3);
      grd.addColorStop(0, 'rgba(255,107,42,0.55)');
      grd.addColorStop(1, 'rgba(255,107,42,0)');
      ctx.fillStyle = grd;
      ctx.beginPath(); ctx.arc(cx0, cy0, wireR * 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#1c1c22';
      ctx.strokeStyle = '#ff6b2a';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(cx0, cy0, wireR, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

      // × (into page) or • (out of page) glyph.
      ctx.strokeStyle = '#ff6b2a';
      ctx.fillStyle = '#ff6b2a';
      if (intoPage) {
        ctx.lineWidth = 2;
        const k = wireR * 0.55;
        ctx.beginPath();
        ctx.moveTo(cx0 - k, cy0 - k); ctx.lineTo(cx0 + k, cy0 + k);
        ctx.moveTo(cx0 + k, cy0 - k); ctx.lineTo(cx0 - k, cy0 + k);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(cx0, cy0, wireR * 0.32, 0, Math.PI * 2);
        ctx.fill();
      }

      // Wire label
      ctx.fillStyle = 'rgba(160,158,149,.85)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`I = ${I.toFixed(1)} A ${intoPage ? '⊗' : '⊙'}`, cx0, cy0 + wireR * 3 + 14);

      // Probe
      const px = probe.x * w, py = probe.y * h;
      const dx = px - cx0, dy = py - cy0;
      const r_px = Math.max(2, Math.hypot(dx, dy));
      const r_m = r_px / PX_PER_M;
      const Bprobe = (PHYS.mu_0 * Math.abs(I)) / (2 * Math.PI * r_m);

      // Radial line from wire to probe
      ctx.strokeStyle = 'rgba(255,107,42,0.35)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx0, cy0); ctx.lineTo(px, py); ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(10,10,11,.9)';
      ctx.strokeStyle = '#ff6b2a';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(px, py, 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#ff6b2a';
      ctx.font = 'bold 10px JetBrains Mono';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('P', px, py);

      // Probe distance label
      ctx.fillStyle = 'rgba(236,235,229,.85)';
      ctx.textBaseline = 'alphabetic';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText(`r = ${(r_m * 1000).toFixed(0)} mm`, px, py - 16);
      ctx.fillStyle = '#6cc5c2';
      ctx.fillText(`|B| = ${pretty(Bprobe, 2)} T`, px, py + 22);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  // Static readout uses an estimated canvas width to avoid threading dims out.
  const W_est = 880;
  const dx = (probe.x - 0.5) * W_est;
  const dy = (probe.y - 0.5) * 320;
  const r_m = Math.max(Math.hypot(dx, dy) * 1e-3, 5e-3);
  const Bprobe = (PHYS.mu_0 * Math.abs(I)) / (2 * Math.PI * r_m);

  return (
    <Demo
      figure={figure ?? 'Fig. 4.1'}
      title="The field around a current"
      question="What does the magnetic field of a wire actually look like?"
      caption={<>
        End-on view of a long straight wire carrying current <strong>I</strong>. Teal circles are
        the magnetic field <strong>B</strong>; tangent arrows show its direction (right-hand rule —
        thumb along <strong>I</strong>, fingers curl with <strong>B</strong>). Drag the orange probe;
        the magnitude follows <em>B = μ₀ I / (2πr)</em>.
      </>}
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
          value={I} min={0} max={50} step={0.1}
          format={v => v.toFixed(1) + ' A'}
          onChange={setI}
        />
        <MiniReadout label="|B| at probe" value={pretty(Bprobe, 2)} unit="T" />
      </DemoControls>
    </Demo>
  );
}
