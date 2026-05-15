/**
 * Demo D2.5 — Voltage drives the flow
 *
 * One slider: battery voltage V (0.5 V to 24 V) across a fixed 10 Ω load.
 * Everything else updates from V:
 *   • current I = V/R                              (Ohm's law, anticipating Ch.3)
 *   • drift velocity v_d = I / (n q A)             (Drude, n for copper, A = 1 mm²)
 *   • power delivered P = V·I = V²/R               (the quadratic kicker)
 *   • drift dot speed on screen, scaled visually   (real v_d is microscopic)
 *   • magnetic-field curls around the wire — radius, line-width, saturation
 *     all track |I|. (Anticipates the Ampère/Biot-Savart picture in Ch.6.)
 *
 * The pedagogical thrust is the chain V → I → v_d → P. Doubling V doubles
 * I and v_d but quadruples P. The drift stays microscopic across the entire
 * slider range; the bulb gets dramatically brighter anyway. The energy isn't
 * in the motion of the electrons — it's in the field around the wire, and
 * that's a V² story.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';
import { renderCircuitToCanvas, type CircuitElement } from '@/lib/canvasPrimitives';
import { MATERIALS, PHYS } from '@/lib/physics';
import { getCanvasColors } from '@/lib/canvasTheme';

interface Props { figure?: string }

interface Dot { x: number; phase: number }

// Fixed circuit parameters
const R_OHMS = 10;                     // resistive load
const A_MM2 = 1.0;                     // wire cross-section, mm²
const A_M2 = A_MM2 * 1e-6;             // m²
const N_CU = MATERIALS.copper.n;       // 8.5e28 /m³
const N_DOTS = 28;                     // drift dots along the wire

interface StaticCacheEntry { key: string; canvas: HTMLCanvasElement }

export function VoltageDrivesFlowDemo({ figure }: Props) {
  const [V, setV] = useState(6);  // volts

  const stateRef = useRef({ V });
  useEffect(() => { stateRef.current = { V }; }, [V]);

  // Real (physical) values for the readouts
  const I = V / R_OHMS;                             // amperes
  const vd = I / (N_CU * PHYS.e * A_M2);            // m/s
  const P = V * I;                                  // watts

  const cacheRef = useRef<StaticCacheEntry | null>(null);
  const dotsRef = useRef<Dot[] | null>(null);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, dpr } = info;
    let raf = 0;
    let last = performance.now();

    // Wire geometry — a single horizontal line, battery on left, bulb on right.
    const margin = 64;
    const wireY = Math.round(h * 0.50);
    const batX = margin;
    const bulbX = w - margin;
    const wireLeft = batX + 48;       // just right of battery lead
    const wireRight = bulbX - 28;     // just left of bulb circle
    const wireLength = wireRight - wireLeft;

    // Initialise drift dots evenly along the wire
    if (!dotsRef.current || dotsRef.current.length !== N_DOTS) {
      dotsRef.current = Array.from({ length: N_DOTS }, (_, i) => ({
        x: wireLeft + (i + 0.5) * (wireLength / N_DOTS),
        phase: Math.random() * Math.PI * 2,
      }));
    }

    function draw(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const { V } = stateRef.current;
      const I_now = V / R_OHMS;
      // Normalised current 0..1 across the slider's 0.5..24 V range.
      const Inorm = Math.min(1, Math.abs(I_now) / (24 / R_OHMS));

      // Background.
      ctx.fillStyle = getCanvasColors().bg;
      ctx.fillRect(0, 0, w, h);

      // Build / reuse the static schematic cache. Key includes a coarsened
      // brightness bucket so the bulb glow refreshes in steps, not per-pixel.
      const brightness = Math.min(1, (V * I_now) / (24 * (24 / R_OHMS))); // P / Pmax
      const brightBucket = Math.round(brightness * 12);
      const cacheKey = `${w}x${h}@${dpr}|b${brightBucket}`;
      if (cacheRef.current?.key !== cacheKey) {
        const bulbBright = brightBucket / 12;
        const staticElements: CircuitElement[] = [
          // Top return wire — battery (+) up and over to bulb top.
          { kind: 'wire',
            points: [
              { x: batX, y: wireY }, { x: batX, y: wireY - 70 },
              { x: bulbX, y: wireY - 70 }, { x: bulbX, y: wireY - 16 },
            ],
            color: 'rgba(160,158,149,.35)', lineWidth: 2 },
          // Battery on the left (vertical between top rail and main wire).
          { kind: 'battery', at: { x: batX, y: wireY - 35 },
            color: 'rgba(255,255,255,.30)',
            label: `${R_OHMS} Ω load · 1 mm² copper`,
            labelOffset: { x: 0, y: 90 },
            leadLength: 35, plateGap: 8,
            negativeColor: '#5baef8', negativePlateLength: 14,
            positiveColor: '#ff3b6e', positivePlateLength: 24 },
          // The main wire (where drift dots will be drawn).
          { kind: 'wire',
            points: [{ x: wireLeft, y: wireY }, { x: wireRight, y: wireY }],
            color: 'rgba(255,107,42,.55)', lineWidth: 5 },
          // Tiny pigtails from battery and bulb to the main wire.
          { kind: 'wire',
            points: [{ x: batX, y: wireY }, { x: wireLeft, y: wireY }],
            color: 'rgba(160,158,149,.45)', lineWidth: 2 },
          { kind: 'wire',
            points: [{ x: wireRight, y: wireY }, { x: bulbX, y: wireY }],
            color: 'rgba(160,158,149,.45)', lineWidth: 2 },
          // Bulb (the load) on the right.
          { kind: 'bulb', at: { x: bulbX, y: wireY },
            radius: 16, brightness: bulbBright,
            label: 'load', labelOffset: { x: 0, y: 30 } },
        ];
        cacheRef.current = {
          key: cacheKey,
          canvas: renderCircuitToCanvas({ elements: staticElements }, w, h, dpr),
        };
      }
      ctx.drawImage(cacheRef.current.canvas, 0, 0, w, h);

      // ── Magnetic-field curls around the wire ──────────────────────────────
      // B is proportional to I; we draw three pairs of "ribs" perpendicular to
      // the wire, each pair being two short arcs above and below. Radius,
      // line width, and saturation all scale with Inorm.
      const Bcols = 4;
      const Bradius = 8 + 18 * Inorm;
      const Bwidth = 0.8 + 2.2 * Inorm;
      const Balpha = 0.20 + 0.70 * Inorm;
      ctx.save();
      ctx.strokeStyle = `rgba(108,197,194,${Balpha.toFixed(3)})`;
      ctx.lineWidth = Bwidth;
      ctx.lineCap = 'round';
      for (let i = 0; i < Bcols; i++) {
        const cx = wireLeft + (i + 0.5) * (wireLength / Bcols);
        // Ellipse halves above and below (current into page on the back side,
        // out on the front — we draw both halves so the picture reads as a
        // curl around the wire).
        ctx.beginPath();
        ctx.ellipse(cx, wireY, Bradius, Bradius * 0.45, 0, Math.PI, 2 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(cx, wireY, Bradius, Bradius * 0.45, 0, 0, Math.PI);
        ctx.stroke();
      }
      ctx.restore();

      // B label (top-left of the figure)
      ctx.fillStyle = `rgba(108,197,194,${(0.4 + 0.5 * Inorm).toFixed(3)})`;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('B  (circles wire; |B| ∝ I)', wireLeft, wireY + 50);

      // ── Drift dots along the main wire ────────────────────────────────────
      // Visual speed in px/s — scaled so 1 A moves a dot a clearly-visible
      // amount per second. Real drift is microscopic; the readout has the
      // truth. Conventional current direction is left→right; electrons drift
      // the opposite way, so the dots (cyan electrons) move right→left.
      const visSpeed = 90 * Inorm;  // px/s at full slider
      const dots = dotsRef.current!;
      ctx.fillStyle = getCanvasColors().blue;
      for (const d of dots) {
        d.x -= visSpeed * dt;
        if (d.x < wireLeft) d.x += wireLength;
        if (d.x > wireRight) d.x -= wireLength;
        // Tiny vertical bob so the line isn't visually dead at I=0.
        d.phase += dt * 6;
        const y = wireY + Math.sin(d.phase) * 1.4;
        ctx.beginPath();
        ctx.arc(d.x, y, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Conventional-current arrow above the wire (points + → −, i.e. L → R).
      const arrowY = wireY - 24;
      const ax0 = wireLeft + wireLength * 0.35;
      const ax1 = wireLeft + wireLength * 0.65;
      ctx.strokeStyle = `rgba(255,107,42,${(0.45 + 0.5 * Inorm).toFixed(3)})`;
      ctx.fillStyle = `rgba(255,107,42,${(0.45 + 0.5 * Inorm).toFixed(3)})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(ax0, arrowY); ctx.lineTo(ax1, arrowY); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(ax1, arrowY);
      ctx.lineTo(ax1 - 7, arrowY - 4);
      ctx.lineTo(ax1 - 7, arrowY + 4);
      ctx.closePath(); ctx.fill();
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('I  (conventional)', (ax0 + ax1) / 2, arrowY - 6);

      // ── Poynting-flux annotation at the load ──────────────────────────────
      // A small arrow pointing into the bulb labelled with the instantaneous
      // power. Length / opacity scale with P; cap so the arrow stays inside
      // the canvas at high V.
      const Pmax = (24 * 24) / R_OHMS;           // 57.6 W at V=24
      const Pnorm = Math.min(1, (V * I_now) / Pmax);
      const fluxLen = 14 + 28 * Pnorm;
      const fluxAlpha = 0.35 + 0.6 * Pnorm;
      const fx1 = bulbX - 18;
      const fx0 = fx1 - fluxLen;
      const fy = wireY - 36;
      ctx.strokeStyle = `rgba(255,204,85,${fluxAlpha.toFixed(3)})`;
      ctx.fillStyle = `rgba(255,204,85,${fluxAlpha.toFixed(3)})`;
      ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(fx0, fy); ctx.lineTo(fx1, fy); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(fx1, fy);
      ctx.lineTo(fx1 - 7, fy - 4);
      ctx.lineTo(fx1 - 7, fy + 4);
      ctx.closePath(); ctx.fill();
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`P = V·I = ${(V * I_now).toFixed(1)} W`, fx1, fy - 6);

      // Bottom-left disclosure caption.
      ctx.fillStyle = 'rgba(160,158,149,.7)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(
        'fixed: R = 10 Ω · A = 1 mm² · n = 8.5×10²⁸/m³ (Cu) · dot motion ≠ to scale',
        wireLeft, h - 12,
      );

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 2.5'}
      title="Crank the voltage"
      question="Crank the voltage from 1 V to 24 V. The electrons go faster — but still less than a millimetre per second. So how does the load get so much brighter?"
      caption={<>
        One slider, one wire, one fixed 10 Ω load. Lifting V lifts I in lockstep (Ohm's law,
        I = V/R) and lifts the electrons' drift velocity by the same factor. But the drift
        stays in the tens of micrometres per second — visually you cannot tell 6 V from 24 V
        just by watching the dots. What changes dramatically is the power, P = V·I = V²/R:
        double V and the load gets four times the energy per second. That quadratic is the
        whole reason the grid bothers to step voltage <em>up</em> for transmission — and a
        first hint of the Poynting story in Chapter 8, where the energy turns out to flow
        through the field around the wire, not down the wire itself.
      </>}
      deeperLab={{ slug: 'drift', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={280} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="battery voltage V"
          value={V} min={0.5} max={24} step={0.1}
          format={v => v.toFixed(1) + ' V'}
          onChange={setV}
        />
        <MiniReadout label="current I = V/R" value={I.toFixed(2)} unit="A" />
        <MiniReadout label="drift v_d" value={<Num value={vd} />} unit="m/s" />
        <MiniReadout label="power P = V·I" value={P.toFixed(2)} unit="W" />
      </DemoControls>
    </Demo>
  );
}
