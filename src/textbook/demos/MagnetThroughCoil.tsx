/**
 * Demo D5.1 — Magnet through a coil
 *
 * Side view of a coil (a row of loops). A bar magnet (N/S labelled) is
 * draggable horizontally along the coil axis. The induced EMF is computed
 * from −dΦ/dt of a dipole-like flux model B(x) ∝ 1/((x − x_c)² + d²)^(3/2).
 * An indicator lamp at the side of the coil lights up; brightness ∝ |EMF|,
 * color flips with current direction (Lenz).
 *
 * The flux model is a stylised single-axis dipole — the *direction* of
 * dΦ/dt is what matters here, not its absolute calibration.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';

interface Props { figure?: string }

/** Dipole-axis flux model. x in canvas pixels; returns dimensionless flux. */
function fluxAt(magnetX: number, coilX: number): number {
  const dx = magnetX - coilX;
  const a = 60; // characteristic falloff scale (px) — coil radius proxy
  return 1.0 / Math.pow(1 + (dx * dx) / (a * a), 1.5);
}

export function MagnetThroughCoilDemo({ figure }: Props) {
  // Magnet x position as fraction of canvas width (0..1)
  const [magnetX, setMagnetX] = useState(0.18);
  const [N, setN] = useState(40);

  const stateRef = useRef({ magnetX, N });
  useEffect(() => { stateRef.current = { magnetX, N }; }, [magnetX, N]);

  // EMF readout — populated from the draw loop, throttled
  const [emfNow, setEmfNow] = useState(0);
  const emfRef = useRef(0);
  useEffect(() => {
    const id = window.setInterval(() => setEmfNow(emfRef.current), 100);
    return () => window.clearInterval(id);
  }, []);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, canvas, colors } = info;
    let raf = 0;
    let dragging = false;
    let lastT = performance.now();
    let lastFlux = fluxAt(stateRef.current.magnetX * w, w / 2);

    function getMouseX(e: MouseEvent | TouchEvent): number {
      const r = canvas.getBoundingClientRect();
      const t = 'touches' in e ? e.touches[0] : e;
      if (!t) return 0;
      return t.clientX - r.left;
    }
    function magnetPx() { return stateRef.current.magnetX * w; }

    function onDown(e: MouseEvent) {
      const mx = getMouseX(e);
      if (Math.abs(mx - magnetPx()) < 50) {
        dragging = true; canvas.style.cursor = 'grabbing';
      }
    }
    function onMove(e: MouseEvent) {
      const mx = getMouseX(e);
      if (dragging) {
        setMagnetX(Math.max(0.04, Math.min(0.96, mx / w)));
      } else {
        canvas.style.cursor = Math.abs(mx - magnetPx()) < 50 ? 'grab' : 'default';
      }
    }
    function onUp() { dragging = false; canvas.style.cursor = 'default'; }
    function onTDown(e: TouchEvent) {
      e.preventDefault();
      const mx = getMouseX(e);
      if (Math.abs(mx - magnetPx()) < 60) dragging = true;
    }
    function onTMove(e: TouchEvent) {
      e.preventDefault();
      if (!dragging) return;
      const mx = getMouseX(e);
      setMagnetX(Math.max(0.04, Math.min(0.96, mx / w)));
    }
    function onTEnd() { dragging = false; }

    canvas.addEventListener('mousedown', onDown);
    canvas.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    canvas.addEventListener('touchstart', onTDown, { passive: false });
    canvas.addEventListener('touchmove', onTMove, { passive: false });
    canvas.addEventListener('touchend', onTEnd);

    function draw() {
      const { magnetX, N } = stateRef.current;
      const cy = h / 2;
      const coilCx = w / 2;
      const mx = magnetX * w;

      // Compute dPhi/dt via finite difference (per second, real time)
      const now = performance.now();
      let dt = (now - lastT) / 1000;
      lastT = now;
      if (dt <= 0) dt = 1e-3;
      const phi = fluxAt(mx, coilCx);
      const dPhi = phi - lastFlux;
      lastFlux = phi;
      const emf = -N * (dPhi / dt);  // V (in arbitrary units; visual)
      emfRef.current = emf;

      // Background
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      // Coil — drawn as series of loop cross-sections (ovals) along an axis
      const coilHalfLen = 90;
      const loops = 9;
      const loopHeight = 70;
      // axis line
      ctx.strokeStyle = colors.border;
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(40, cy); ctx.lineTo(w - 40, cy); ctx.stroke();
      ctx.setLineDash([]);

      // Each loop — two small dots (top/bottom) connected by a faint vertical
      // line with current-direction indicators (× / ·) on each side
      const dir = Math.sign(emf);
      for (let i = 0; i < loops; i++) {
        const t = i / (loops - 1);
        const lx = coilCx - coilHalfLen + t * 2 * coilHalfLen;
        // ring outline (ellipse seen edge-on)
        ctx.save();
        ctx.globalAlpha = 0.55;
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.ellipse(lx, cy, 4, loopHeight / 2, 0, 0, Math.PI * 2);
        ctx.stroke();

        // current direction indicators (only when |emf| meaningful)
        if (Math.abs(emf) > 0.05 && i % 2 === 0) {
          const sym = dir > 0 ? '·' : '×';
          ctx.save();
          ctx.globalAlpha = 0.75;
          ctx.fillStyle = colors.blue;
          ctx.font = 'bold 10px JetBrains Mono';
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(sym, lx, cy - loopHeight / 2 - 8);
          ctx.fillText(dir > 0 ? '×' : '·', lx, cy + loopHeight / 2 + 8);
          ctx.restore();
        }
        ctx.restore();
      }

      // Coil label
      ctx.fillStyle = colors.accent;
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(`Coil · N = ${N} turns`, coilCx, cy + loopHeight / 2 + 24);

      // Wire from one end of coil down to indicator lamp on the right
      const lampX = w - 50;
      const lampY = cy + loopHeight / 2 + 60;
      ctx.strokeStyle = colors.borderStrong;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(coilCx + coilHalfLen, cy + loopHeight / 2);
      ctx.lineTo(coilCx + coilHalfLen, lampY);
      ctx.lineTo(lampX - 14, lampY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(coilCx - coilHalfLen, cy + loopHeight / 2);
      ctx.lineTo(coilCx - coilHalfLen, h - 20);
      ctx.lineTo(lampX + 14, h - 20);
      ctx.lineTo(lampX + 14, lampY + 14);
      ctx.stroke();

      // Indicator lamp — color depends on current direction; brightness on |emf|
      const intensity = Math.min(1, Math.abs(emf) / 8);
      const lampColor = dir > 0 ? '255,107,42' : '108,197,194';
      const lampGlow = ctx.createRadialGradient(lampX, lampY, 0, lampX, lampY, 38);
      lampGlow.addColorStop(0, `rgba(${lampColor},${0.85 * intensity})`);
      lampGlow.addColorStop(1, `rgba(${lampColor},0)`);
      ctx.fillStyle = lampGlow;
      ctx.beginPath(); ctx.arc(lampX, lampY, 38, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = `rgba(${lampColor},${0.3 + 0.7 * intensity})`;
      ctx.lineWidth = 1.6;
      ctx.fillStyle = `rgba(${lampColor},${0.15 + 0.65 * intensity})`;
      ctx.beginPath(); ctx.arc(lampX, lampY, 12, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = colors.textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('lamp', lampX, lampY + 26);

      // Bar magnet — N (pink) / S (blue) halves
      const magW = 84, magH = 32;
      const magY = cy;
      // shadow
      const grd = ctx.createLinearGradient(mx - magW / 2, magY, mx + magW / 2, magY);
      grd.addColorStop(0, colors.blue);
      grd.addColorStop(0.5, colors.blue);
      grd.addColorStop(0.5, colors.pink);
      grd.addColorStop(1, colors.pink);
      ctx.fillStyle = grd;
      ctx.fillRect(mx - magW / 2, magY - magH / 2, magW, magH);
      ctx.save();
      ctx.globalAlpha = 0.2;
      ctx.strokeStyle = colors.text;
      ctx.lineWidth = 1;
      ctx.strokeRect(mx - magW / 2, magY - magH / 2, magW, magH);
      ctx.restore();
      ctx.fillStyle = colors.bg;
      ctx.font = 'bold 14px JetBrains Mono';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('S', mx - magW / 4, magY);
      ctx.fillText('N', mx + magW / 4, magY);

      // Faint field-line cue from N pole pointing rightward
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = colors.pink;
      ctx.lineWidth = 1;
      for (let k = 0; k < 3; k++) {
        const yoff = (k - 1) * 6;
        ctx.beginPath();
        ctx.moveTo(mx + magW / 2 + 2, magY + yoff);
        ctx.lineTo(mx + magW / 2 + 18, magY + yoff);
        ctx.stroke();
      }

      // Drag hint
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = colors.textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText('drag the magnet ↔', 16, 14);

      raf = requestAnimationFrame(draw);
      ctx.restore();
    }
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener('mousedown', onDown);
      canvas.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      canvas.removeEventListener('touchstart', onTDown);
      canvas.removeEventListener('touchmove', onTMove);
      canvas.removeEventListener('touchend', onTEnd);
    };
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 5.1'}
      title="Move a magnet, get a voltage"
      question="What is the lamp doing — and why does it flip color when you reverse direction?"
      caption={<>
        Drag the bar magnet through the coil. The lamp brightens with <strong>|dΦ/dt|</strong> and changes color with the
        sign of the induced current. Hold the magnet still and the lamp goes dark — a static magnetic field induces nothing.
      </>}
      deeperLab={{ slug: 'faraday', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="N (turns)"
          value={N} min={1} max={200} step={1}
          format={v => Math.round(v).toString()}
          onChange={v => setN(Math.round(v))}
        />
        <MiniReadout label="EMF (instant.)" value={<Num value={emfNow} />} unit="V" />
      </DemoControls>
    </Demo>
  );
}
