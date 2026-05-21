/**
 * Demo D2.5 — Cursor as point charge perturbing a wire
 *
 * A horizontal wire across the canvas with a battery driving steady drift to
 * the right. Free electrons (cyan dots) crawl with the battery's bias. The
 * reader's mouse cursor on the canvas is treated as an external point charge,
 * sign toggleable. When near the wire it emits an E-field, perturbs electron
 * motion locally, and induces a surface-charge pattern on the wire.
 */
import { useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniSlider, MiniToggle } from '@/components/Demo';
import { drawLabel } from '@/lib/canvasLayout';
import { getCanvasColors, withAlpha } from '@/lib/canvasTheme';
import { drawArrow } from '@/lib/canvasPrimitives';
import { useCanvasCache } from '@/lib/useCanvasCache';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

interface Props {
  figure?: string;
}

interface Electron {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const N_ELECTRONS = 44;

interface SimState {
  cursorPos: boolean;
  qNC: number;
  showBatteryField: boolean;
}

interface SimContext {
  electrons: Electron[];
  ui: { cx: number; cy: number; hovering: boolean };
}

export function CursorEFieldOnWireDemo({ figure }: Props) {
  const [cursorPos, setCursorPos] = useState(true);
  const [qNC, setQNC] = useState(6);
  const [showBatteryField, setShowBatteryField] = useState(true);

  const stateRef = useSimState({ cursorPos, qNC, showBatteryField });

  // Static wire pill + polarity terminals + glyphs. The bake is raw ctx
  // drawing (rounded-pill shape via lineTo + arc) so it uses useCanvasCache,
  // the sibling of useCircuitCache for non-CircuitSpec bakes.
  const getStatic = useCanvasCache((octx, sw, sh, _dpr) => {
    const colors = getCanvasColors();
    const margin = 70;
    const wireTop = sh * 0.42;
    const wireBot = sh * 0.66;
    const wireLeft = margin;
    const wireRight = sw - margin;
    const r = (wireBot - wireTop) / 2;

    // Wire pill (rounded-end rectangle).
    octx.fillStyle = withAlpha(colors.accent, 0.06);
    octx.beginPath();
    octx.moveTo(wireLeft + r, wireTop);
    octx.lineTo(wireRight - r, wireTop);
    octx.arc(wireRight - r, wireTop + r, r, -Math.PI / 2, Math.PI / 2);
    octx.lineTo(wireLeft + r, wireBot);
    octx.arc(wireLeft + r, wireTop + r, r, Math.PI / 2, -Math.PI / 2);
    octx.closePath();
    octx.fill();
    octx.strokeStyle = withAlpha(colors.text, 0.1);
    octx.lineWidth = 1;
    octx.stroke();

    // Polarity terminals + glyphs + caption.
    octx.fillStyle = colors.pink;
    octx.fillRect(wireLeft - 12, wireTop + 4, 4, wireBot - wireTop - 8);
    octx.fillStyle = colors.blue;
    octx.fillRect(wireRight + 8, wireTop + 4, 4, wireBot - wireTop - 8);
    octx.fillStyle = withAlpha(colors.textDim, 0.85);
    octx.font = '10px "JetBrains Mono", monospace';
    octx.textAlign = 'center';
    octx.fillText('+', wireLeft - 10, wireTop - 4);
    octx.fillText('−', wireRight + 10, wireTop - 4);
    octx.textAlign = 'left';
    octx.fillStyle = withAlpha(colors.textDim, 0.7);
    octx.fillText('battery drives drift  →', wireLeft, wireTop - 14);
  }, []);

  const setup = useSimLoop<SimState, SimContext>(
    stateRef,
    ({ ctx, w, h, colors, dpr }, _state, _dt, _simTime, c) => {
      const s = stateRef.current;
      const margin = 70;
      const wireTop = h * 0.42;
      const wireBot = h * 0.66;
      const wireLeft = margin;
      const wireRight = w - margin;
      const wireMidY = (wireTop + wireBot) / 2;

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      // Static wire pill + polarity terminals — cached at component scope.
      const off = getStatic(w, h, dpr);
      if (off) ctx.drawImage(off, 0, 0, w, h);

      // Battery drift arrows
      if (s.showBatteryField) {
        ctx.strokeStyle = colors.accentGlow;
        ctx.fillStyle = colors.accentGlow;
        ctx.lineWidth = 1;
        for (let xa = wireLeft + 50; xa < wireRight - 50; xa += 90) {
          ctx.beginPath();
          ctx.moveTo(xa, wireMidY);
          ctx.lineTo(xa + 22, wireMidY);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(xa + 22, wireMidY);
          ctx.lineTo(xa + 16, wireMidY - 3.5);
          ctx.lineTo(xa + 16, wireMidY + 3.5);
          ctx.closePath();
          ctx.fill();
        }
        ctx.save();
        ctx.globalAlpha = 0.6;
        drawLabel(ctx, {
          x: wireLeft + 4,
          y: wireBot + 14,
          text: 'E_battery',
          color: colors.accent,
        });
        ctx.restore();
      }

      // Cursor field arrows
      const ui = c.ui;
      const haveCursor = ui.hovering && ui.cx >= 0 && ui.cy >= 0;
      const cursorSign = s.cursorPos ? +1 : -1;
      const cursorColor = s.cursorPos ? colors.pink : colors.blue;
      const Q_SCALE = 18 * (s.qNC / 10);
      const cursorQ = cursorSign * Q_SCALE;

      if (haveCursor) {
        const span = 110;
        const step = 22;
        for (let dx = -span; dx <= span; dx += step) {
          for (let dy = -span; dy <= span; dy += step) {
            const px = ui.cx + dx;
            const py = ui.cy + dy;
            const r2 = dx * dx + dy * dy;
            if (r2 < 14 * 14) continue;
            if (r2 > span * span) continue;
            const r = Math.sqrt(r2);
            const mag = (cursorQ * 280) / r2;
            const ux = dx / r;
            const uy = dy / r;
            const aLen = Math.max(4, Math.min(14, Math.abs(mag)));
            const sx = px - ux * aLen * 0.5 * Math.sign(mag);
            const sy = py - uy * aLen * 0.5 * Math.sign(mag);
            const ex = px + ux * aLen * 0.5 * Math.sign(mag);
            const ey = py + uy * aLen * 0.5 * Math.sign(mag);
            drawArrow(
              ctx,
              { x: sx, y: sy },
              { x: ex, y: ey },
              {
                color: withAlpha(s.cursorPos ? colors.pink : colors.blue, 0.55),
                lineWidth: 1,
                headLength: 4,
                headWidth: 3,
              },
            );
          }
        }

        ctx.fillStyle = cursorColor;
        ctx.beginPath();
        ctx.arc(ui.cx, ui.cy, 7, 0, Math.PI * 2);
        ctx.fill();
        drawLabel(ctx, {
          x: ui.cx,
          y: ui.cy + 1,
          text: s.cursorPos ? '+' : '−',
          color: colors.bg,
          align: 'center',
          baseline: 'middle',
          weight: 'bold',
        });
      }

      // Surface-charge indicators
      if (haveCursor) {
        const cursorAboveWire = ui.cy < wireMidY;
        const nearY = cursorAboveWire ? wireTop : wireBot;
        const farY = cursorAboveWire ? wireBot : wireTop;
        const nearOutwardSign = cursorAboveWire ? -1 : +1;

        const sampleStep = 18;
        for (let xs = wireLeft + 10; xs <= wireRight - 10; xs += sampleStep) {
          const rx = xs - ui.cx;
          const ry = nearY - ui.cy;
          const r2 = rx * rx + ry * ry;
          if (r2 < 8 * 8) continue;
          const Ey = (cursorQ * ry) / (r2 * Math.sqrt(r2));
          const Eperp = Ey * nearOutwardSign;
          const sigmaNear = -Eperp;
          const sigmaFar = +Eperp;

          const magNear = Math.min(1.5, Math.abs(sigmaNear) * 1.6);
          if (magNear > 0.08) {
            ctx.fillStyle = withAlpha(
              sigmaNear > 0 ? colors.pink : colors.blue,
              Math.min(0.95, 0.25 + magNear * 0.6),
            );
            ctx.font = `bold ${Math.round(9 + magNear * 4)}px "JetBrains Mono", monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(sigmaNear > 0 ? '+' : '−', xs, nearY + (cursorAboveWire ? -8 : 8));
          }
          const magFar = Math.min(1.5, Math.abs(sigmaFar) * 1.6);
          if (magFar > 0.08) {
            ctx.fillStyle = withAlpha(
              sigmaFar > 0 ? colors.pink : colors.blue,
              Math.min(0.75, 0.18 + magFar * 0.45),
            );
            ctx.font = `bold ${Math.round(8 + magFar * 3)}px "JetBrains Mono", monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(sigmaFar > 0 ? '+' : '−', xs, farY + (cursorAboveWire ? 8 : -8));
          }
        }
      }

      // Update electrons and draw
      const baseDrift = s.showBatteryField ? 0.55 : 0.0;
      ctx.fillStyle = colors.blue;
      for (const eDot of c.electrons) {
        eDot.vx += (Math.random() - 0.5) * 0.8;
        eDot.vy += (Math.random() - 0.5) * 0.8;
        eDot.vx += baseDrift;

        if (haveCursor) {
          const rx = eDot.x - ui.cx;
          const ry = eDot.y - ui.cy;
          const r2 = rx * rx + ry * ry;
          const r2s = Math.max(r2, 18 * 18);
          const rs = Math.sqrt(r2s);
          const fStrength = (cursorQ * 90) / r2s;
          eDot.vx += -fStrength * (rx / rs);
          eDot.vy += -fStrength * (ry / rs);
        }

        eDot.vx *= 0.72;
        eDot.vy *= 0.72;
        const sp = Math.hypot(eDot.vx, eDot.vy);
        if (sp > 3.2) {
          eDot.vx *= 3.2 / sp;
          eDot.vy *= 3.2 / sp;
        }

        eDot.x += eDot.vx;
        eDot.y += eDot.vy;

        if (eDot.x > wireRight - 3) eDot.x = wireLeft + 3;
        if (eDot.x < wireLeft + 3) eDot.x = wireRight - 3;
        if (eDot.y < wireTop + 3) {
          eDot.y = wireTop + 3;
          eDot.vy = Math.abs(eDot.vy) * 0.3;
        }
        if (eDot.y > wireBot - 3) {
          eDot.y = wireBot - 3;
          eDot.vy = -Math.abs(eDot.vy) * 0.3;
        }

        ctx.beginPath();
        ctx.arc(eDot.x, eDot.y, 2.0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Hint text
      ctx.save();
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = colors.textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      if (!haveCursor) {
        drawLabel(ctx, { text: 'hover the canvas — your cursor is a point charge', x: wireLeft, y: h - 14 });
        ctx.restore();
      } else {
        drawLabel(ctx, { text: s.cursorPos
                      ? 'positive cursor: free electrons drift toward it · near surface goes net −'
                      : 'negative cursor: free electrons recoil · near surface goes net +', x: wireLeft, y: h - 14 });
      }
    },
    [],
    (info) => {
      const { w, h, canvas } = info;
      const margin = 70;
      const wireTop = h * 0.42;
      const wireBot = h * 0.66;
      const wireLeft = margin;
      const wireRight = w - margin;

      const electrons: Electron[] = Array.from({ length: N_ELECTRONS }, () => ({
        x: wireLeft + Math.random() * (wireRight - wireLeft),
        y: wireTop + 3 + Math.random() * (wireBot - wireTop - 6),
        vx: 0,
        vy: 0,
      }));

      const ui = { cx: -1, cy: -1, hovering: false };

      function pointerMove(clientX: number, clientY: number) {
        const rect = canvas.getBoundingClientRect();
        ui.cx = clientX - rect.left;
        ui.cy = clientY - rect.top;
        ui.hovering = true;
      }
      function pointerLeave() {
        ui.hovering = false;
        ui.cx = -1;
        ui.cy = -1;
      }
      function onMouseMove(e: MouseEvent) {
        pointerMove(e.clientX, e.clientY);
      }
      function onMouseLeave() {
        pointerLeave();
      }
      function onTouchStart(e: TouchEvent) {
        if (e.touches.length === 0) return;
        e.preventDefault();
        const t = e.touches[0]!;
        pointerMove(t.clientX, t.clientY);
      }
      function onTouchMove(e: TouchEvent) {
        if (e.touches.length === 0) return;
        e.preventDefault();
        const t = e.touches[0]!;
        pointerMove(t.clientX, t.clientY);
      }
      function onTouchEnd() {
        pointerLeave();
      }

      canvas.addEventListener('mousemove', onMouseMove);
      canvas.addEventListener('mouseleave', onMouseLeave);
      canvas.addEventListener('touchstart', onTouchStart, { passive: false });
      canvas.addEventListener('touchmove', onTouchMove, { passive: false });
      canvas.addEventListener('touchend', onTouchEnd);
      canvas.addEventListener('touchcancel', onTouchEnd);

      return {
        context: { electrons, ui },
        cleanup: () => {
          canvas.removeEventListener('mousemove', onMouseMove);
          canvas.removeEventListener('mouseleave', onMouseLeave);
          canvas.removeEventListener('touchstart', onTouchStart);
          canvas.removeEventListener('touchmove', onTouchMove);
          canvas.removeEventListener('touchend', onTouchEnd);
          canvas.removeEventListener('touchcancel', onTouchEnd);
        },
      };
    },
  );

  return (
    <Demo
      figure={figure ?? 'Fig. 2.5'}
      title="Your cursor is a charge"
      question="Hover the canvas — your cursor is a small point charge. What happens to the electrons in the wire? Does the wire's surface change?"
      caption={
        <>
          The cursor's field reaches into the wire and pushes on every free electron there. They
          pile up near a positive cursor, recoil from a negative one, and the wire's surface ends up
          coated in a thin layer of induced charge — opposite sign on the near face, same sign on
          the far face. This is the bottom-layer reason an electrostatic conductor has{' '}
          <em>E = 0</em> inside: the free charges have already rearranged to cancel anything you
          push at them. Same physics as a charged comb picking up paper, capacitive touchscreens,
          and the inside of a Faraday cage.
        </>
      }
      deeperLab={{ slug: 'potential', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={320} setup={setup} />
      <DemoControls>
        <MiniToggle
          label={cursorPos ? 'cursor +' : 'cursor −'}
          checked={cursorPos}
          onChange={setCursorPos}
        />
        <MiniSlider
          label="|q_cursor|"
          value={qNC}
          min={0}
          max={10}
          step={0.1}
          format={(v) => v.toFixed(1) + ' nC'}
          onChange={setQNC}
        />
        <MiniToggle
          label={showBatteryField ? 'battery field ON' : 'battery field OFF'}
          checked={showBatteryField}
          onChange={setShowBatteryField}
        />
      </DemoControls>
    </Demo>
  );
}
