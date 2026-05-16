/**
 * Demo D1.2 — Field around a single point charge
 *
 * Grid of arrows pointing radially out (or in). Length encodes log|E|.
 * A draggable probe shows the field magnitude at that location, in V/m.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { Demo, DemoControls, MiniReadout, MiniSlider, MiniToggle } from '@/components/Demo';
import { LayeredCanvas, type LayeredCanvasInfo } from '@/components/LayeredCanvas';
import { Num } from '@/components/Num';
import { drawCharge } from '@/lib/canvasPrimitives';
import { PHYS } from '@/lib/physics';

import { getCanvasColors } from '@/lib/canvasTheme';
interface Props {
  figure?: string;
}

export function FieldArrowsDemo({ figure }: Props) {
  const [qNC, setQNC] = useState(10);
  const [pos, setPos] = useState(true);
  const [probe, setProbe] = useState({ x: 0.72, y: 0.34 });
  const stateRef = useRef({ qNC, pos, probe });
  useEffect(() => {
    stateRef.current = { qNC, pos, probe };
  }, [qNC, pos, probe]);

  const setup = useCallback(
    (info: LayeredCanvasInfo<'field' | 'ui'>) => {
      const colors = getCanvasColors();
      const { contexts, w, h, canvas } = info;
      const fieldCtx = contexts.field;
      const uiCtx = contexts.ui;
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
        // Probe
        const px = probe.x * w,
          py = probe.y * h;
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

  // Live readout for the probe
  // Probe distance from canvas center → mm → m
  const Eprobe = useEprobe(qNC, pos, probe);

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
    </Demo>
  );
}

function useEprobe(qNC: number, pos: boolean, probe: { x: number; y: number }): number {
  // We don't have direct access to canvas dims here, so estimate from the
  // typical canvas aspect (we know height=300 and assume ~880 wide on desktop;
  // the readout is approximate but stable as you drag).
  const W = 880,
    H = 300;
  const dx = (probe.x - 0.5) * W;
  const dy = (probe.y - 0.5) * H;
  const r_mm = Math.hypot(dx, dy);
  const r_m = Math.max(r_mm * 1e-3, 5e-3);
  const sign = pos ? +1 : -1;
  return (PHYS.k * sign * qNC * 1e-9) / (r_m * r_m);
}
