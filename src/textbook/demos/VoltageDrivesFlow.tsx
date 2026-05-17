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

interface Props {
  figure?: string;
}

interface Dot {
  s: number; // arc-length position along the closed loop
  phase: number;
}

// A directed segment of the closed loop. `dx`/`dy` are the full
// (un-normalised) direction vector; `nx`/`ny` are the perpendicular unit
// vector used for the visual bob. `hidden` segments are inside the battery
// or bulb symbols and are not drawn.
interface Segment {
  x0: number;
  y0: number;
  dx: number;
  dy: number;
  length: number;
  nx: number;
  ny: number;
  hidden: boolean;
}

// Fixed circuit parameters
const R_OHMS = 10; // resistive load
const A_MM2 = 1.0; // wire cross-section, mm²
const A_M2 = A_MM2 * 1e-6; // m²
const N_CU = MATERIALS.copper.n; // 8.5e28 /m³
const N_DOTS = 56; // drift dots distributed around the whole loop

interface StaticCacheEntry {
  key: string;
  canvas: HTMLCanvasElement;
}

export function VoltageDrivesFlowDemo({ figure }: Props) {
  const [V, setV] = useState(6); // volts

  const stateRef = useRef({ V });
  useEffect(() => {
    stateRef.current = { V };
  }, [V]);

  // Real (physical) values for the readouts
  const I = V / R_OHMS; // amperes
  const vd = I / (N_CU * PHYS.e * A_M2); // m/s
  const P = V * I; // watts

  const cacheRef = useRef<StaticCacheEntry | null>(null);
  const dotsRef = useRef<Dot[] | null>(null);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, dpr } = info;
    let raf = 0;
    let last = performance.now();

    // Wire geometry. Derived top-down: canvas margins → circuit bounding
    // box → element sizes → element positions. Downstream code (segments,
    // static schematic, in-frame labels) should reach for these constants
    // instead of hard-coding offsets. Canvas y=0 is the top of the canvas;
    // y increases downward.

    // 1. Margins (relative to canvas size, capped so they don't dominate
    //    on large canvases).
    const canvasMarginX = Math.min(64, w * 0.15);
    const canvasMarginY = Math.min(40, h * 0.1);

    const legendLeft = canvasMarginX;
    const legendRight = w - canvasMarginX;
    const legendTop = h - canvasMarginY - 60; // leave room for the bottom caption
    const legendBottom = h - canvasMarginY;
    const legendPaddingX = 0; // horizontal padding inside the legend strip
    const legendPaddingY = 10;

    // Derived row/column anchors for the three legend rows. Defined here in
    // setup so staticElements can position circuit-element labels against
    // them via labelOffset.
    const legendCol1X = legendLeft + legendPaddingX;
    const legendCol2X = legendRight - legendPaddingX;
    const legendRow1Y = legendTop + legendPaddingY + 10;
    const legendRow3Y = legendBottom - legendPaddingY + 10;
    const legendRow2Y = (legendRow1Y + legendRow3Y) / 2;


    // 2. Circuit bounding box.
    const circuitLeft = canvasMarginX;
    const circuitRight = w - canvasMarginX;
    const circuitTop = canvasMarginY;
    const circuitBottom = h - canvasMarginY - 60; // leave room for the bottom caption

    // 3. Element sizes.
    const bulbR = 16; // bulb radius
    const batLead = 35; // half-length of the battery symbol along its axis
    const batStub = 48; // horizontal stub from battery lead to start of main wire
    const bulbStub = 28; // horizontal stub from end of main wire to bulb edge

    // 4. Element positions on the rectangle.
    const batX = circuitLeft;
    const bulbX = circuitRight;
    const wireY = circuitBottom; // main wire = bottom edge of the rectangle
    const topY = circuitTop; // top return wire = top edge
    const batCenterY = (circuitTop + circuitBottom) / 2; // battery vertical centre
    const wireLeft = batX + batStub; // main wire starts past the battery's right side
    const wireRight = bulbX - bulbStub; // main wire ends just before the bulb circle
    const wireLength = wireRight - wireLeft;

    // Build the closed-loop path in electron-flow direction:
    //  − terminal (top of battery)  → right across top wire
    //  → down right vertical to top of bulb
    //  → through bulb (hidden)
    //  → left along main wire / pigtails
    //  → up through battery (hidden)
    //  → back to start.
    // Conventional current is the reverse, so the on-screen arrow stays L→R.
    const rawSegs: { x0: number; y0: number; x1: number; y1: number; hidden: boolean }[] = [
      { x0: batX, y0: topY, x1: bulbX, y1: topY, hidden: false }, // top wire L→R
      { x0: bulbX, y0: topY, x1: bulbX, y1: wireY - bulbR, hidden: false }, // right vert down
      { x0: bulbX, y0: wireY - bulbR, x1: bulbX - bulbR, y1: wireY, hidden: true }, // through bulb
      { x0: bulbX - bulbR, y0: wireY, x1: batX, y1: wireY, hidden: false }, // main wire R→L
      { x0: batX, y0: wireY, x1: batX, y1: topY, hidden: true }, // through battery
    ];
    const segments: Segment[] = rawSegs.map((s) => {
      const dx = s.x1 - s.x0;
      const dy = s.y1 - s.y0;
      const length = Math.hypot(dx, dy);
      return {
        x0: s.x0,
        y0: s.y0,
        dx,
        dy,
        length,
        nx: -dy / length,
        ny: dx / length,
        hidden: s.hidden,
      };
    });
    const totalLen = segments.reduce((sum, s) => sum + s.length, 0);

    // Initialise drift dots evenly around the whole loop.
    if (!dotsRef.current || dotsRef.current.length !== N_DOTS) {
      dotsRef.current = Array.from({ length: N_DOTS }, (_, i) => ({
        s: (i + 0.5) * (totalLen / N_DOTS),
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
          // The whole loop is one continuous wire (copper, same gauge
          // everywhere). Drawn as two polylines — top half and bottom half —
          // so the battery and bulb symbols can sit on top of the verticals
          // without the wire visibly punching through their bodies.
          {
            kind: 'wire',
            points: [
              { x: batX, y: wireY },
              { x: batX, y: topY },
              { x: bulbX, y: topY },
              { x: bulbX, y: wireY - bulbR },
            ],
            color: 'rgba(160,158,149,.45)',
            lineWidth: 2,
          },
          {
            kind: 'wire',
            points: [
              { x: batX, y: wireY },
              { x: bulbX, y: wireY },
            ],
            color: 'rgba(160,158,149,.45)',
            lineWidth: 2,
          },
          // Battery on the left. Label is offset down into row 2 of the
          // legend strip (centered on batX by the battery renderer).
          {
            kind: 'battery',
            at: { x: batX, y: batCenterY },
            color: 'rgba(255,255,255,.30)',
            label: `${R_OHMS} Ω load · 1 mm² copper`,
            labelOffset: { x: legendCol1X - batX + 72, y: legendRow2Y - batCenterY },
            leadLength: batLead,
            plateGap: 8,
            negativeColor: '#5baef8',
            negativePlateLength: 14,
            positiveColor: '#ff3b6e',
            positivePlateLength: 24,
          },
          // Bulb (the load) on the right. Label is offset down into row 2
          // of the legend strip, aligned to the right column anchor.
          {
            kind: 'bulb',
            at: { x: bulbX, y: wireY },
            radius: bulbR,
            brightness: bulbBright,
            label: 'load',
            labelOffset: { x: legendCol2X - bulbX, y: legendRow2Y - wireY },
          },
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
      const Balpha = 0.2 + 0.7 * Inorm;
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

      // ── Legend strip — dynamic labels ─────────────────────────────────────
      // Row 2 (battery spec, "load") is rendered by renderCircuitToCanvas
      // via labelOffset on the battery and bulb static elements. The two
      // labels here are the ones that can't ride on a circuit element:
      // the B-field label has a per-frame cyan opacity, and the disclosure
      // caption sits in the bottom row by itself.
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      // Row 1 — B-field label (cyan, fades with current).
      ctx.fillStyle = `rgba(108,197,194,${(0.4 + 0.5 * Inorm).toFixed(3)})`;
      ctx.fillText('B  (circles wire; |B| ∝ I)', legendCol1X, legendRow1Y);
      // Row 3 — disclosure caption.
      ctx.fillStyle = 'rgba(160,158,149,.7)';
      ctx.fillText(
        'fixed: R = 10 Ω · A = 1 mm² · n = 8.5×10²⁸/m³ (Cu) · dot motion ≠ to scale',
        legendCol1X,
        legendRow3Y,
      );

      // ── Drift dots around the whole loop ──────────────────────────────────
      // Visual speed in px/s — scaled so the dots are clearly moving at high
      // current. Real drift is microscopic; the readout has the truth. Each
      // dot walks forward along the path (segments are already oriented in
      // the electron-flow direction), so the segment 1 dots travel L→R on
      // the top wire and segment 4 dots travel R→L on the main wire — both
      // opposite to the conventional-current arrow.
      const visSpeed = 90 * Inorm; // px/s at full slider
      const dots = dotsRef.current!;
      ctx.fillStyle = getCanvasColors().blue;
      for (const d of dots) {
        d.s += visSpeed * dt;
        d.s = ((d.s % totalLen) + totalLen) % totalLen;
        d.phase += dt * 6;

        // Locate the dot's segment and position within it.
        let rem = d.s;
        let seg: Segment | undefined;
        for (const cand of segments) {
          if (rem <= cand.length) {
            seg = cand;
            break;
          }
          rem -= cand.length;
        }
        if (!seg || seg.hidden) continue;
        const t = rem / seg.length;
        const bob = Math.sin(d.phase) * 1.4;
        const x = seg.x0 + seg.dx * t + seg.nx * bob;
        const y = seg.y0 + seg.dy * t + seg.ny * bob;
        ctx.beginPath();
        ctx.arc(x, y, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Conventional-current arrow above the wire (points + → −, i.e. L → R).
      const arrowY = wireY - 24;
      const ax0 = wireLeft + wireLength * 0.35;
      const ax1 = wireLeft + wireLength * 0.65;
      ctx.strokeStyle = `rgba(255,107,42,${(0.45 + 0.5 * Inorm).toFixed(3)})`;
      ctx.fillStyle = `rgba(255,107,42,${(0.45 + 0.5 * Inorm).toFixed(3)})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(ax0, arrowY);
      ctx.lineTo(ax1, arrowY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(ax1, arrowY);
      ctx.lineTo(ax1 - 7, arrowY - 4);
      ctx.lineTo(ax1 - 7, arrowY + 4);
      ctx.closePath();
      ctx.fill();
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('I  (conventional)', (ax0 + ax1) / 2, arrowY - 6);

      // ── Poynting-flux annotation at the load ──────────────────────────────
      // A small arrow pointing into the bulb labelled with the instantaneous
      // power. Length / opacity scale with P; cap so the arrow stays inside
      // the canvas at high V.
      const Pmax = (24 * 24) / R_OHMS; // 57.6 W at V=24
      const Pnorm = Math.min(1, (V * I_now) / Pmax);
      const fluxLen = 14 + 28 * Pnorm;
      const fluxAlpha = 0.35 + 0.6 * Pnorm;
      const fx1 = bulbX - 18;
      const fx0 = fx1 - fluxLen;
      const fy = wireY - 36;
      ctx.strokeStyle = `rgba(255,204,85,${fluxAlpha.toFixed(3)})`;
      ctx.fillStyle = `rgba(255,204,85,${fluxAlpha.toFixed(3)})`;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(fx0, fy);
      ctx.lineTo(fx1, fy);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(fx1, fy);
      ctx.lineTo(fx1 - 7, fy - 4);
      ctx.lineTo(fx1 - 7, fy + 4);
      ctx.closePath();
      ctx.fill();
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`P = V·I = ${(V * I_now).toFixed(1)} W`, fx1, fy - 6);

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
      caption={
        <>
          One slider, one wire, one fixed 10 Ω load. Lifting V lifts I in lockstep (Ohm's law, I =
          V/R) and lifts the electrons' drift velocity by the same factor. But the drift stays in
          the tens of micrometres per second — visually you cannot tell 6 V from 24 V just by
          watching the dots. What changes dramatically is the power, P = V·I = V²/R: double V and
          the load gets four times the energy per second. That quadratic is the whole reason the
          grid bothers to step voltage <em>up</em> for transmission — and a first hint of the
          Poynting story in Chapter 8, where the energy turns out to flow through the field around
          the wire, not down the wire itself.
        </>
      }
      deeperLab={{ slug: 'drift', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={280} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="battery voltage V"
          value={V}
          min={0.5}
          max={24}
          step={0.1}
          format={(v) => v.toFixed(1) + ' V'}
          onChange={setV}
        />
        <MiniReadout label="current I = V/R" value={I.toFixed(2)} unit="A" />
        <MiniReadout label="drift v_d" value={<Num value={vd} />} unit="m/s" />
        <MiniReadout label="power P = V·I" value={P.toFixed(2)} unit="W" />
      </DemoControls>
    </Demo>
  );
}
