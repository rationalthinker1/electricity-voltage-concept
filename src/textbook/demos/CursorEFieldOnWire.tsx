/**
 * Demo D2.5 — Cursor as point charge perturbing a wire
 *
 * A horizontal wire across the canvas with a battery driving steady drift to
 * the right. Free electrons (cyan dots) crawl with the battery's bias. The
 * reader's mouse cursor on the canvas is treated as an external point charge,
 * sign toggleable. When near the wire it (a) emits an E-field visualised as
 * radial arrows in a sparse grid around the cursor, (b) perturbs electron
 * motion locally (F = qE on top of the battery's field), and (c) induces a
 * surface-charge pattern on the wire — plus marks on the near surface for a
 * positive cursor (electrons crowd in, negative charge on the surface; we mark
 * what the lattice "feels" — net minus on the near side, plus on the far side),
 * minus marks for a negative cursor. This is the picture beneath Faraday-cage
 * shielding, capacitive sensing, and the boundary condition E_inside = 0 for
 * an electrostatic conductor.
 *
 * Visual scaling is deliberate: the cursor's force on a single free electron
 * in a real wire would redistribute surface charge in picoseconds, leaving the
 * bulk drift essentially unchanged. Here we exaggerate the perturbation to
 * make the transient response visible. The pedagogical point is the response
 * itself, not its quantitative size.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniSlider, MiniToggle } from '@/components/Demo';
import { getCanvasColors } from '@/lib/canvasTheme';
import {
  drawCircuit,
  drawArrow,
  renderCircuitToCanvas,
  type CircuitElement,
} from '@/lib/canvasPrimitives';

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

export function CursorEFieldOnWireDemo({ figure }: Props) {
  const [cursorPos, setCursorPos] = useState(true); // +/- cursor sign
  const [qNC, setQNC] = useState(6); // cursor charge magnitude in nC
  const [showBatteryField, setShowBatteryField] = useState(true);

  const stateRef = useRef({ cursorPos, qNC, showBatteryField });
  useEffect(() => {
    stateRef.current = { cursorPos, qNC, showBatteryField };
  }, [cursorPos, qNC, showBatteryField]);

  // UI cursor position in canvas (CSS) pixels. -1,-1 means "off canvas".
  const uiRef = useRef({ cx: -1, cy: -1, hovering: false });

  // Cache key for the static schematic (battery + wire outline)
  const cacheRef = useRef<{ key: string; canvas: HTMLCanvasElement } | null>(null);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, dpr, canvas } = info;
    let raf = 0;

    const margin = 70;
    const wireTop = h * 0.42;
    const wireBot = h * 0.66;
    const wireLeft = margin;
    const wireRight = w - margin;
    const wireMidY = (wireTop + wireBot) / 2;

    // Initial electron population, spread along the wire.
    const electrons: Electron[] = Array.from({ length: N_ELECTRONS }, () => ({
      x: wireLeft + Math.random() * (wireRight - wireLeft),
      y: wireTop + 3 + Math.random() * (wireBot - wireTop - 6),
      vx: 0,
      vy: 0,
    }));

    // Mouse / touch handlers — update uiRef.
    function pointerMove(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect();
      uiRef.current.cx = clientX - rect.left;
      uiRef.current.cy = clientY - rect.top;
      uiRef.current.hovering = true;
    }
    function pointerLeave() {
      uiRef.current.hovering = false;
      uiRef.current.cx = -1;
      uiRef.current.cy = -1;
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

    function buildStaticCache(): HTMLCanvasElement {
      const r = (wireBot - wireTop) / 2;
      // We can't make the rounded rectangle through drawCircuit alone, so we
      // composite: a separate offscreen canvas for the wire body + then
      // renderCircuitToCanvas for the battery, layered together.
      const off = document.createElement('canvas');
      off.width = Math.max(1, Math.floor(w * dpr));
      off.height = Math.max(1, Math.floor(h * dpr));
      const c2 = off.getContext('2d');
      if (!c2) return off;
      c2.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Wire body fill + outline.
      c2.fillStyle = 'rgba(255,107,42,.06)';
      c2.beginPath();
      c2.moveTo(wireLeft + r, wireTop);
      c2.lineTo(wireRight - r, wireTop);
      c2.arc(wireRight - r, wireTop + r, r, -Math.PI / 2, Math.PI / 2);
      c2.lineTo(wireLeft + r, wireBot);
      c2.arc(wireLeft + r, wireTop + r, r, Math.PI / 2, -Math.PI / 2);
      c2.closePath();
      c2.fill();
      c2.strokeStyle = 'rgba(255,255,255,.10)';
      c2.lineWidth = 1;
      c2.stroke();

      // Battery terminals as small rectangles, plus labels.
      c2.fillStyle = '#ff3b6e';
      c2.fillRect(wireLeft - 12, wireTop + 4, 4, wireBot - wireTop - 8);
      c2.fillStyle = '#5baef8';
      c2.fillRect(wireRight + 8, wireTop + 4, 4, wireBot - wireTop - 8);
      c2.fillStyle = 'rgba(160,158,149,.85)';
      c2.font = '10px "JetBrains Mono", monospace';
      c2.textAlign = 'center';
      c2.fillText('+', wireLeft - 10, wireTop - 4);
      c2.fillText('−', wireRight + 10, wireTop - 4);
      c2.textAlign = 'left';
      c2.fillStyle = 'rgba(160,158,149,.7)';
      c2.fillText('battery drives drift  →', wireLeft, wireTop - 14);

      // Reuse drawCircuit to draw nothing else — keep the schematic minimal.
      void drawCircuit;
      void renderCircuitToCanvas;
      void ([] as CircuitElement[]);
      return off;
    }

    function draw() {
      const { cursorPos, qNC, showBatteryField } = stateRef.current;

      // Background
      ctx.fillStyle = getCanvasColors().bg;
      ctx.fillRect(0, 0, w, h);

      // Static schematic cache
      const key = `${w}x${h}@${dpr}`;
      if (cacheRef.current?.key !== key) {
        cacheRef.current = { key, canvas: buildStaticCache() };
      }
      ctx.drawImage(cacheRef.current.canvas, 0, 0, w, h);

      // ───── Battery drift arrows (left → right inside the wire) ─────
      if (showBatteryField) {
        ctx.strokeStyle = getCanvasColors().accentGlow;
        ctx.fillStyle = getCanvasColors().accentGlow;
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
        ctx.fillStyle = getCanvasColors().accent;
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText('E_battery', wireLeft + 4, wireBot + 14);
        ctx.restore();
      }

      // ───── Cursor field arrows (only when hovering on canvas) ─────
      const ui = uiRef.current;
      const haveCursor = ui.hovering && ui.cx >= 0 && ui.cy >= 0;
      const cursorSign = cursorPos ? +1 : -1;
      const cursorColor = cursorPos ? '#ff3b6e' : '#5baef8';

      // Drawn-units coupling for the perturbation. Tuned so a 6 nC cursor at
      // ~60 px from the wire moves electrons visibly without flinging them.
      const Q_SCALE = 18 * (qNC / 10); // dimensionless strength used in draw
      const cursorQ = cursorSign * Q_SCALE;

      if (haveCursor) {
        // Field arrows: a sparse 6×6 grid centred on the cursor, span ~110 px.
        const span = 110;
        const step = 22;
        for (let dx = -span; dx <= span; dx += step) {
          for (let dy = -span; dy <= span; dy += step) {
            const px = ui.cx + dx;
            const py = ui.cy + dy;
            const rx = dx;
            const ry = dy;
            const r2 = rx * rx + ry * ry;
            if (r2 < 14 * 14) continue;
            if (r2 > span * span) continue;
            const r = Math.sqrt(r2);
            // Field magnitude ∝ 1/r² in 2D-projected display units.
            const mag = (cursorQ * 280) / r2;
            // Direction: outward from a positive cursor, inward to a negative.
            const ux = rx / r;
            const uy = ry / r;
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
                color: cursorPos ? 'rgba(255,59,110,.55)' : 'rgba(91,174,248,.55)',
                lineWidth: 1,
                headLength: 4,
                headWidth: 3,
              },
            );
          }
        }

        // Cursor itself — a small disc with its sign.
        ctx.fillStyle = cursorColor;
        ctx.beginPath();
        ctx.arc(ui.cx, ui.cy, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = getCanvasColors().bg;
        ctx.font = 'bold 10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(cursorPos ? '+' : '−', ui.cx, ui.cy + 1);
      }

      // ───── Surface-charge indicators on the wire ─────
      // For each sample along the wire's top (if cursor above) or bottom edge,
      // compute the perpendicular component of E_cursor and place a + or −.
      // An external positive cursor near the wire attracts electrons to the
      // near surface — so the near surface acquires NET NEGATIVE charge, and
      // the opposite side gets a net positive. We mark net surface charge.
      if (haveCursor) {
        const cursorAboveWire = ui.cy < wireMidY;
        const nearY = cursorAboveWire ? wireTop : wireBot;
        const farY = cursorAboveWire ? wireBot : wireTop;
        const nearOutwardSign = cursorAboveWire ? -1 : +1; // outward normal y-direction

        const sampleStep = 18;
        for (let xs = wireLeft + 10; xs <= wireRight - 10; xs += sampleStep) {
          // Perpendicular E from cursor at (xs, nearY): only the y-component
          // matters for the "into the surface" sense.
          const rx = xs - ui.cx;
          const ry = nearY - ui.cy;
          const r2 = rx * rx + ry * ry;
          if (r2 < 8 * 8) continue;
          // E_y from cursor at this surface sample (sign-aware).
          const Ey = (cursorQ * ry) / (r2 * Math.sqrt(r2)); // ∝ q · r̂_y / r²
          // Inward perpendicular component (the part pushing INTO the wire):
          // dot with outward normal direction nearOutwardSign·ĵ gives the
          // outward-pointing E component. Surface charge that the conductor
          // induces opposes the external normal field, so the surface-charge
          // sign on the near surface is OPPOSITE the sign of (E · n̂_out).
          const Eperp = Ey * nearOutwardSign;
          const sigmaNear = -Eperp; // induced charge sign at the near surface
          const sigmaFar = +Eperp; // and at the far surface (opposite)

          const magNear = Math.min(1.5, Math.abs(sigmaNear) * 1.6);
          if (magNear > 0.08) {
            ctx.fillStyle =
              sigmaNear > 0
                ? `rgba(255,59,110,${Math.min(0.95, 0.25 + magNear * 0.6)})`
                : `rgba(91,174,248,${Math.min(0.95, 0.25 + magNear * 0.6)})`;
            ctx.font = `bold ${Math.round(9 + magNear * 4)}px "JetBrains Mono", monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(sigmaNear > 0 ? '+' : '−', xs, nearY + (cursorAboveWire ? -8 : 8));
          }
          const magFar = Math.min(1.5, Math.abs(sigmaFar) * 1.6);
          if (magFar > 0.08) {
            ctx.fillStyle =
              sigmaFar > 0
                ? `rgba(255,59,110,${Math.min(0.75, 0.18 + magFar * 0.45)})`
                : `rgba(91,174,248,${Math.min(0.75, 0.18 + magFar * 0.45)})`;
            ctx.font = `bold ${Math.round(8 + magFar * 3)}px "JetBrains Mono", monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(sigmaFar > 0 ? '+' : '−', xs, farY + (cursorAboveWire ? 8 : -8));
          }
        }
      }

      // ───── Update electrons and draw ─────
      // Visual battery drift (rightward) — when toggled off, set to ~0 so the
      // cursor's perturbation is the only thing moving the electrons.
      const baseDrift = showBatteryField ? 0.55 : 0.0;

      ctx.fillStyle = getCanvasColors().blue;
      for (const eDot of electrons) {
        // Thermal kick — small, just to keep things alive.
        eDot.vx += (Math.random() - 0.5) * 0.8;
        eDot.vy += (Math.random() - 0.5) * 0.8;

        // Battery field bias (rightward).
        eDot.vx += baseDrift;

        // Cursor field on this electron. Electron charge is negative, so the
        // force on the electron is OPPOSITE to E_cursor's direction relative
        // to the cursor: attracted toward a + cursor, repelled by a −.
        if (haveCursor) {
          const rx = eDot.x - ui.cx;
          const ry = eDot.y - ui.cy;
          const r2 = rx * rx + ry * ry;
          // Soften the singularity at small r.
          const r2s = Math.max(r2, 18 * 18);
          const rs = Math.sqrt(r2s);
          // Force per unit drag, in display units. Sign convention: a positive
          // cursor (cursorQ > 0) attracts the electron, i.e. force points
          // FROM electron TOWARD cursor → -r̂.
          const fStrength = (cursorQ * 90) / r2s;
          // Add as a velocity bias (overdamped approximation — this models the
          // mobility-limited response of electrons in the lattice).
          eDot.vx += -fStrength * (rx / rs);
          eDot.vy += -fStrength * (ry / rs);
        }

        // Heavy damping — keeps speeds bounded and gives the overdamped feel
        // (electrons in a metal collide every ~10⁻¹⁴ s, so velocity is
        // essentially proportional to force, not the time integral of it).
        eDot.vx *= 0.72;
        eDot.vy *= 0.72;
        // Cap speeds.
        const sp = Math.hypot(eDot.vx, eDot.vy);
        if (sp > 3.2) {
          eDot.vx *= 3.2 / sp;
          eDot.vy *= 3.2 / sp;
        }

        eDot.x += eDot.vx;
        eDot.y += eDot.vy;

        // Confine to the wire interior; wrap around the ends so density
        // perturbations are visible without electrons disappearing.
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

      // ───── Hint text ─────
      ctx.save();
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = getCanvasColors().textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      if (!haveCursor) {
        ctx.fillText('hover the canvas — your cursor is a point charge', wireLeft, h - 14);
        ctx.restore();
      } else {
        ctx.fillText(
          cursorPos
            ? 'positive cursor: free electrons drift toward it · near surface goes net −'
            : 'negative cursor: free electrons recoil · near surface goes net +',
          wireLeft,
          h - 14,
        );
      }

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseleave', onMouseLeave);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
      canvas.removeEventListener('touchcancel', onTouchEnd);
    };
  }, []);

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
