/**
 * Demo D1.2 — Field around a single point charge
 *
 * Grid of arrows pointing radially out (or in). Length encodes log|E|.
 * A draggable probe shows the field magnitude at that location, in V/m.
 *
 * The UI layer also draws a dashed segment from the charge to the probe
 * with its physical length labelled (1 px = 1 mm physical scale). The
 * EquationStrip below the controls renders the two equations the demo
 * embodies, with live values substituted in:
 *
 *   |E| = kQ/r²          (field at the probe)
 *   F   = eE             (force on an electron sitting there)
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Demo, DemoControls, EquationStrip, MiniReadout, MiniSlider, MiniToggle } from '@/components/Demo';
import { InlineMath } from '@/components/Formula';
import { LayeredCanvas, type LayeredCanvasInfo } from '@/components/LayeredCanvas';
import { Num } from '@/components/Num';
import { drawCharge } from '@/lib/canvasPrimitives';
import { PHYS } from '@/lib/physics';

import { getCanvasColors } from '@/lib/canvasTheme';
interface Props {
  figure?: string;
}

/** Format a real number as a TeX scalar — plain decimal for mid-range,
 *  mantissa × 10^exp otherwise. Three sig figs. */
function texNum(x: number, sig: number = 3): string {
  if (!isFinite(x)) return '\\text{—}';
  if (x === 0) return '0';
  const abs = Math.abs(x);
  if (abs >= 0.01 && abs < 10000) {
    return Number(x.toPrecision(sig)).toString();
  }
  const exp = Math.floor(Math.log10(abs));
  const mantissa = x / Math.pow(10, exp);
  const mantStr = Number(mantissa.toPrecision(sig)).toString();
  return `${mantStr}\\times 10^{${exp}}`;
}

function formatProbeLength(r_mm: number): string {
  if (r_mm < 100) return `${r_mm.toFixed(0)} mm`;
  return `${(r_mm / 10).toFixed(1)} cm`;
}

export function FieldArrowsDemo({ figure }: Props) {
  const [qNC, setQNC] = useState(10);
  const [pos, setPos] = useState(true);
  const [probe, setProbe] = useState({ x: 0.72, y: 0.34 });
  // Track the *actual* canvas pixel size so the probe-distance readout
  // and the equation strip use the same r as what's drawn on screen.
  // (1 px = 1 mm physical, per the demo's mapping.)
  const [dims, setDims] = useState({ w: 880, h: 300 });

  const stateRef = useRef({ qNC, pos, probe });
  useEffect(() => {
    stateRef.current = { qNC, pos, probe };
  }, [qNC, pos, probe]);

  // Live probe-distance + field strength, derived from actual canvas dims.
  const { r_m, Eprobe } = useMemo(() => {
    const dx = (probe.x - 0.5) * dims.w;
    const dy = (probe.y - 0.5) * dims.h;
    const r_mm = Math.hypot(dx, dy);
    const rClamped = Math.max(r_mm * 1e-3, 5e-3);
    const sign = pos ? +1 : -1;
    const E = (PHYS.k * sign * qNC * 1e-9) / (rClamped * rClamped);
    return { r_m: rClamped, Eprobe: E };
  }, [probe, dims, pos, qNC]);

  const setup = useCallback(
    (info: LayeredCanvasInfo<'field' | 'ui'>) => {
      const colors = getCanvasColors();
      const { contexts, w, h, canvas } = info;
      const fieldCtx = contexts.field;
      const uiCtx = contexts.ui;

      // Publish actual canvas dims to React state once per setup so the
      // r computed above matches what the user sees on screen.
      setDims({ w, h });

      let dragging = false;
      // eslint-disable-next-line prefer-const -- forward declaration; assigned below
      let drawUi: () => void;
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
      function updateProbe(mx: number, my: number) {
        const nextProbe = {
          x: Math.max(0.05, Math.min(0.95, mx / w)),
          y: Math.max(0.1, Math.min(0.9, my / h)),
        };
        stateRef.current.probe = nextProbe;
        setProbe(nextProbe);
        drawUi();
      }
      function onMouseMove(e: MouseEvent) {
        const [mx, my] = getMouse(e);
        if (dragging) {
          updateProbe(mx, my);
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
        updateProbe(mx, my);
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

      function drawField() {
        const sign = pos ? +1 : -1;
        const q = sign * qNC * 1e-9;
        const cx0 = w / 2,
          cy0 = h / 2;
        // Map: 1 px = 1 mm physical (so canvas ~ 30 cm wide)
        fieldCtx.fillStyle = colors.canvasBg;
        fieldCtx.fillRect(0, 0, w, h);

        // Field arrow grid
        const step = 36;
        for (let py = step; py < h; py += step) {
          for (let px = step; px < w; px += step) {
            const dx = px - cx0;
            const dy = py - cy0;
            const r2 = dx * dx + dy * dy;
            if (r2 < 600) continue; // skip too close to charge
            const r = Math.sqrt(r2);
            const r_m = r / 1000; // mm → m
            const Emag = (PHYS.k * Math.abs(q)) / (r_m * r_m);
            // log-mapped arrow length so it stays visible across orders
            const len = Math.min(20, 5 + Math.log10(Emag + 1) * 1.6);
            const ux = (dx / r) * sign;
            const uy = (dy / r) * sign;
            fieldCtx.strokeStyle = `rgba(255,107,42,${0.15 + Math.min(0.5, Math.log10(Emag + 1) / 12)})`;
            fieldCtx.lineWidth = 1;
            fieldCtx.beginPath();
            fieldCtx.moveTo(px - ux * len * 0.3, py - uy * len * 0.3);
            fieldCtx.lineTo(px + ux * len * 0.7, py + uy * len * 0.7);
            fieldCtx.stroke();
            // small head
            fieldCtx.fillStyle = `rgba(255,107,42,${0.25 + Math.min(0.6, Math.log10(Emag + 1) / 12)})`;
            fieldCtx.beginPath();
            fieldCtx.arc(px + ux * len * 0.7, py + uy * len * 0.7, 1.4, 0, Math.PI * 2);
            fieldCtx.fill();
          }
        }

        // Charge
        const color = pos ? '#ff3b6e' : '#5baef8';
        const radius = 14 + Math.min(8, qNC * 0.4);
        drawCharge(
          fieldCtx,
          { x: cx0, y: cy0 },
          {
            color,
            radius,
            sign: pos ? '+' : '−',
            textColor: '#0a0a0b',
          },
        );
      }

      drawUi = function drawProbeLayer() {
        const { probe } = stateRef.current;
        uiCtx.clearRect(0, 0, w, h);

        const cx = w / 2;
        const cy = h / 2;
        const px = probe.x * w;
        const py = probe.y * h;
        const dx = px - cx;
        const dy = py - cy;
        const r_mm = Math.hypot(dx, dy);

        // Dashed segment between charge centre and probe.
        uiCtx.save();
        uiCtx.strokeStyle = colors.textDim;
        uiCtx.lineWidth = 1;
        uiCtx.globalAlpha = 0.65;
        uiCtx.setLineDash([5, 4]);
        uiCtx.beginPath();
        uiCtx.moveTo(cx, cy);
        uiCtx.lineTo(px, py);
        uiCtx.stroke();
        uiCtx.setLineDash([]);
        uiCtx.restore();

        // Length label at the midpoint, offset perpendicular to the line.
        if (r_mm > 18) {
          const mx = (cx + px) / 2;
          const my = (cy + py) / 2;
          const angle = Math.atan2(dy, dx);
          const perp = angle + Math.PI / 2;
          const offset = 12;
          const lx = mx + Math.cos(perp) * offset;
          const ly = my + Math.sin(perp) * offset;
          const label = `r = ${formatProbeLength(r_mm)}`;
          uiCtx.font = '10px "JetBrains Mono", monospace';
          uiCtx.textAlign = 'center';
          uiCtx.textBaseline = 'middle';
          const m = uiCtx.measureText(label);
          const padX = 6;
          const padY = 3;
          const boxW = m.width + padX * 2;
          const boxH = 12 + padY * 2;
          uiCtx.save();
          uiCtx.fillStyle = colors.bg;
          uiCtx.globalAlpha = 0.85;
          uiCtx.fillRect(lx - boxW / 2, ly - boxH / 2, boxW, boxH);
          uiCtx.globalAlpha = 1;
          uiCtx.fillStyle = colors.textDim;
          uiCtx.fillText(label, lx, ly);
          uiCtx.restore();
        }

        // Probe ring
        uiCtx.strokeStyle = colors.accent;
        uiCtx.lineWidth = 2;
        uiCtx.save();
        uiCtx.globalAlpha = 0.9;
        uiCtx.fillStyle = colors.canvasBg;
        uiCtx.beginPath();
        uiCtx.arc(px, py, 9, 0, Math.PI * 2);
        uiCtx.fill();
        uiCtx.stroke();
        uiCtx.restore();
        uiCtx.fillStyle = colors.accent;
        uiCtx.font = 'bold 10px JetBrains Mono';
        uiCtx.textAlign = 'center';
        uiCtx.textBaseline = 'middle';
        uiCtx.fillText('P', px, py);
      };

      drawField();
      drawUi();

      return () => {
        canvas.removeEventListener('mousedown', onMouseDown);
        canvas.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        canvas.removeEventListener('touchstart', onTouchStart);
        canvas.removeEventListener('touchmove', onTouchMove);
        canvas.removeEventListener('touchend', onTouchEnd);
      };
    },
    [qNC, pos],
  );

  // Build the substituted LaTeX for both equations. The constants k and e
  // are baked in (they're not slider-controlled).
  const Q_C = (pos ? 1 : -1) * qNC * 1e-9;
  const F_e = PHYS.e * Eprobe; // force on a single electron at the probe
  const leftTex =
    `|\\vec{E}| \\;=\\; \\dfrac{kQ}{r^{2}} \\;=\\; ` +
    `\\dfrac{(8.99\\!\\times\\!10^{9})(${texNum(Q_C)})}{(${texNum(r_m)})^{2}} ` +
    `\\;\\approx\\; ${texNum(Eprobe)}\\ \\text{V/m}`;
  const rightTex =
    `F \\;=\\; eE \\;=\\; (1.602\\!\\times\\!10^{-19})(${texNum(Eprobe)}) ` +
    `\\;\\approx\\; ${texNum(F_e)}\\ \\text{N}`;

  return (
    <Demo
      figure={figure ?? 'Fig. 1.2'}
      title="The field of one charge"
      question="A charge fills space with arrows. What does an arrow even mean?"
      caption={
        <>
          Each arrow shows which way a positive test charge would feel pushed if it sat at that
          point. Length is log-scaled so the inverse-square fall-off doesn't hide everything outside
          a small zone. <em>Drag the orange ring</em> to probe the magnitude.
        </>
      }
      deeperLab={{ slug: 'e-field', label: 'See full lab' }}
    >
      <LayeredCanvas height={300} layers={['field', 'ui']} setup={setup} />
      <DemoControls>
        <MiniToggle label={`Charge ${pos ? '+' : '−'}`} checked={pos} onChange={setPos} />
        <MiniSlider
          label="|Q|"
          value={qNC}
          min={1}
          max={50}
          step={0.5}
          format={(v) => v.toFixed(1) + ' nC'}
          onChange={setQNC}
        />
        <MiniReadout label="|E| at probe" value={<Num value={Eprobe} />} unit="V/m" />
      </DemoControls>
      <EquationStrip
        leftLabel="Field at the probe"
        left={<InlineMath tex={leftTex} />}
        rightLabel="Force on an electron there"
        right={<InlineMath tex={rightTex} />}
      />
    </Demo>
  );
}
