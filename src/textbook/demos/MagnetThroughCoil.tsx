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
import { useEffect, useRef, useState } from 'react';
import { drawLabel } from '@/lib/canvasLayout';
import { drawHalo } from '@/lib/canvasPrimitives';
import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, EquationStrip, MiniReadout, MiniSlider } from '@/components/Demo';
import { InlineMath } from '@/components/Formula';
import { Num } from '@/components/Num';
import { withAlpha } from '@/lib/canvasTheme';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

interface Props {
  figure: string;
}

/** Dipole-axis flux model. x in canvas pixels; returns dimensionless flux. */
function fluxAt(magnetX: number, coilX: number): number {
  const dx = magnetX - coilX;
  const a = 60; // characteristic falloff scale (px) — coil radius proxy
  return 1.0 / Math.pow(1 + (dx * dx) / (a * a), 1.5);
}

interface MagnetCtx {
  lastFlux: number;
}

export function MagnetThroughCoilDemo({ figure }: Props) {
  // Magnet x position as fraction of canvas width (0..1)
  const [magnetX, setMagnetX] = useState(0.18);
  const [N, setN] = useState(40);

  const stateRef = useSimState({ magnetX, N });

  // EMF readout — populated from the draw loop, throttled
  const [emfNow, setEmfNow] = useState(0);
  const emfRef = useRef(0);
  useEffect(() => {
    const id = window.setInterval(() => setEmfNow(emfRef.current), 100);
    return () => window.clearInterval(id);
  }, []);

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, colors }, state, dt, _simTime, c: MagnetCtx) => {
      const { magnetX, N } = state;
      const cy = h / 2;
      const coilCx = w / 2;
      const mx = magnetX * w;

      const safeDt = dt <= 0 ? 1e-3 : dt;
      const phi = fluxAt(mx, coilCx);
      const dPhi = phi - c.lastFlux;
      c.lastFlux = phi;
      const emf = -N * (dPhi / safeDt);
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
      ctx.moveTo(40, cy);
      ctx.lineTo(w - 40, cy);
      ctx.stroke();
      ctx.setLineDash([]);

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

        if (Math.abs(emf) > 0.05 && i % 2 === 0) {
          const sym = dir > 0 ? '·' : '×';
          ctx.save();
          ctx.globalAlpha = 0.75;
          ctx.fillStyle = colors.blue;
          ctx.font = 'bold 10px JetBrains Mono';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(sym, lx, cy - loopHeight / 2 - 8);
          ctx.fillText(dir > 0 ? '×' : '·', lx, cy + loopHeight / 2 + 8);
          ctx.restore();
        }
        ctx.restore();
      }

      // Coil label
      ctx.textBaseline = 'top';
      drawLabel(ctx, { text: `Coil · N = ${N} turns`, x: coilCx, y: cy + loopHeight / 2 + 24, color: colors.accent, size: 11, font: '11px "JetBrains Mono", monospace', align: 'center', baseline: 'top' });

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
      const lampBase = dir > 0 ? colors.accent : colors.teal;
      drawHalo(ctx, {
        x: lampX,
        y: lampY,
        radius: 38,
        color: withAlpha(lampBase, 0.85 * intensity),
        alpha: 1,
        extent: 1,
      });
      ctx.strokeStyle = withAlpha(lampBase, 0.3 + 0.7 * intensity);
      ctx.lineWidth = 1.6;
      ctx.fillStyle = withAlpha(lampBase, 0.15 + 0.65 * intensity);
      ctx.beginPath();
      ctx.arc(lampX, lampY, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      drawLabel(ctx, { text: 'lamp', x: lampX, y: lampY + 26, font: '10px "JetBrains Mono", monospace', align: 'center', baseline: 'top' });

      // Bar magnet — N (pink) / S (blue) halves
      const magW = 84,
        magH = 32;
      const magY = cy;
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
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      drawLabel(ctx, { text: 'S', x: mx - magW / 4, y: magY, color: colors.bg, weight: 'bold', size: 14, font: '14px "JetBrains Mono"', align: 'center', baseline: 'middle' });
      drawLabel(ctx, { text: 'N', x: mx + magW / 4, y: magY, color: colors.bg, weight: 'bold', size: 14, font: '14px "JetBrains Mono"', align: 'center', baseline: 'middle' });

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
      drawLabel(ctx, {
        x: 16,
        y: 14,
        text: 'drag the magnet ↔',
        color: colors.textDim,
        baseline: 'top',
      });
      ctx.restore();
    },
    [],
    ({ canvas, w }) => {
      let dragging = false;

      function getMouseX(e: MouseEvent | TouchEvent): number {
        const r = canvas.getBoundingClientRect();
        const t = 'touches' in e ? e.touches[0] : e;
        if (!t) return 0;
        return t.clientX - r.left;
      }
      function magnetPx() {
        return stateRef.current.magnetX * w;
      }

      function onDown(e: MouseEvent) {
        const mx = getMouseX(e);
        if (Math.abs(mx - magnetPx()) < 50) {
          dragging = true;
          canvas.style.cursor = 'grabbing';
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
      function onUp() {
        dragging = false;
        canvas.style.cursor = 'default';
      }
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
      function onTEnd() {
        dragging = false;
      }

      canvas.addEventListener('mousedown', onDown);
      canvas.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
      canvas.addEventListener('touchstart', onTDown, { passive: false });
      canvas.addEventListener('touchmove', onTMove, { passive: false });
      canvas.addEventListener('touchend', onTEnd);

      return {
        context: {
          lastFlux: fluxAt(stateRef.current.magnetX * w, w / 2),
        } as MagnetCtx,
        cleanup: () => {
          canvas.removeEventListener('mousedown', onDown);
          canvas.removeEventListener('mousemove', onMove);
          window.removeEventListener('mouseup', onUp);
          canvas.removeEventListener('touchstart', onTDown);
          canvas.removeEventListener('touchmove', onTMove);
          canvas.removeEventListener('touchend', onTEnd);
        },
      };
    },
  );

  return (
    <Demo
      figure={figure}
      title="Move a magnet, get a voltage"
      question="What is the lamp doing — and why does it flip color when you reverse direction?"
      caption={
        <>
          Drag the bar magnet through the coil. The lamp brightens with <strong>|dΦ/dt|</strong> and
          changes color with the sign of the induced current. Hold the magnet still and the lamp
          goes dark — a static magnetic field induces nothing.
        </>
      }
      deeperLab={{ slug: 'faraday', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="N (turns)"
          value={N}
          min={1}
          max={200}
          step={1}
          format={(v) => Math.round(v).toString()}
          onChange={(v) => setN(Math.round(v))}
        />
        <MiniReadout label="EMF (instant.)" value={<Num value={emfNow} />} unit="V" />
      </DemoControls>
      <EquationStrip
        leftLabel="Faraday's law"
        left={
          <InlineMath
            tex={`\\varepsilon \\;=\\; -N\\,\\dfrac{d\\Phi}{dt}`}
          />
        }
        rightLabel="Live readout"
        right={
          <InlineMath
            tex={
              `N \\;=\\; ${N}, \\quad \\varepsilon \\;\\approx\\; ${emfNow.toFixed(3)}\\ \\text{(a.u.)}`
            }
          />
        }
      />
    </Demo>
  );
}
