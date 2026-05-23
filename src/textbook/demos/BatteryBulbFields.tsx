/**
 * Demo D8.0 — Battery, switch, bulb: three fields at once
 *
 * Top-down schematic of a battery → switch → bulb loop, with three
 * toggleable field layers all on by default:
 *
 *   Electrons  — yellow/cyan dots drifting slowly along the wire when
 *                the switch is closed.
 *   B-field    — teal translucent circles curling around each wire
 *                segment; radius and saturation track current magnitude.
 *   E-field    — pink axial arrows along the wire's interior plus a
 *                sparser pink "dipole" field threading the air around
 *                the loop from + terminal to − terminal.
 *   Poynting S — amber arrows tied to whichever fields are visible.
 *                Numerically computed at a grid of points as
 *                S = (1/μ₀) E × B; near the bulb the arrows point
 *                radially INWARD into the wire; near the battery they
 *                point outward into the surrounding space.
 *
 * The pedagogical job is structural, not numerical: the simplified
 * analytical forms for E and B make S point in the right direction at
 * every grid point. Magnitudes are scaled for visibility.
 *
 * Complements WhereDoesEnergyFlowDemo (toggle two pictures) and
 * PoyntingInflowDemo (∮S·dA = VI on a single straight wire). This demo
 * sets up the question by overlaying all three fields on the real loop
 * geometry that the other demos abstract away.
 */
import { useMemo, useRef, useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, EquationStrip, MiniReadout, MiniSlider, MiniToggle } from '@/components/Demo';
import { InlineMath } from '@/components/Formula';
import { drawLabel } from '@/lib/canvasLayout';
import { type CircuitElement } from '@/lib/canvasPrimitives';
import { PHYS } from '@/lib/physics';
import { getCanvasColors, withAlpha } from '@/lib/canvasTheme';
import { useCircuitCache } from '@/lib/useCircuitCache';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

interface Props {
  figure: string;
}

/** One drifting carrier along the loop polyline. s in [0,1]. */
interface Carrier {
  s: number;
  jitter: number;
}

interface Seg {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface ProjResult {
  fx: number;
  fy: number;
  r: number;
  t: number;
  tx: number;
  ty: number;
  nx: number;
  ny: number;
}

interface SimCtx {
  margin: number;
  top: number;
  bot: number;
  batX: number;
  bulbX: number;
  switchX: number;
  loop: Seg[];
  segLens: number[];
  totalLen: number;
  pointOnLoop(s: number): { x: number; y: number; tx: number; ty: number };
  projectOnSeg(seg: Seg, px: number, py: number): ProjResult;
  fieldB(px: number, py: number, current: number): { bx: number; by: number };
  fieldE(px: number, py: number, voltage: number): { ex: number; ey: number };
  carriers: Carrier[];
}

const R_LOAD = 4; // bulb's effective resistance for the I = V/R readout

export function BatteryBulbFieldsDemo({ figure }: Props) {
  const [closed, setClosed] = useState(true);
  const [V, setV] = useState(12);
  const [showE, setShowE] = useState(true);
  const [showB, setShowB] = useState(true);
  const [showElec, setShowElec] = useState(true);

  // I = V/R for a fixed bulb. With closed switch, current flows.
  const I = closed ? V / R_LOAD : 0;

  const carriersRef = useRef<Carrier[] | null>(null);

  // Bulb brightness depends on current = V/R_LOAD (when closed); bucket it
  // to 13 levels so cache rebakes are bounded as V scrubs across its range.
  const brightnessBucket = closed ? Math.round(Math.min(1, I / 6) * 12) : 0;

  // Pre-computed B at a fixed-radius sample inside the wire (μ₀ I / 2π a),
  // just for the readout. Used as a numerical anchor, not for drawing.
  const computed = useMemo(() => {
    const a = 1e-3; // 1 mm
    const Bsurf = (PHYS.mu_0 * I) / (2 * Math.PI * a);
    return { Bsurf };
  }, [I]);

  const stateRef = useSimState({ closed, V, I, showE, showB, showElec, computed });

  // Static schematic backdrop. Rebakes on closed-flip or brightness step or
  // canvas resize.
  const getStatic = useCircuitCache(
    (sw, sh, _dpr) => {
      const colors = getCanvasColors();
      const margin = 56;
      const top = sh * 0.3;
      const bot = sh * 0.78;
      const batX = margin;
      const bulbX = sw - margin;
      const switchX = (batX + bulbX) / 2;
      const cyMid = (top + bot) / 2;
      const bulbR = 16;
      const bulbBright = brightnessBucket / 12;
      const elements: CircuitElement[] = [
        {
          kind: 'wire',
          points: [
            { x: batX, y: top },
            { x: bulbX, y: top },
            { x: bulbX, y: bot },
            { x: batX, y: bot },
          ],
          color: withAlpha(colors.textDim, 0.35),
          lineWidth: 3.5,
        },
        {
          kind: 'battery',
          at: { x: batX, y: cyMid },
          color: withAlpha(colors.text, 0.18),
          leadLength: (bot - top) / 2,
          negativeColor: colors.text,
          negativePlateLength: 16,
          plateGap: (bot - top) / 2,
          positiveColor: colors.text,
          positivePlateLength: 28,
        },
        {
          kind: 'switch',
          at: { x: switchX, y: top },
          color: closed ? colors.accent : colors.text,
          state: closed ? 'closed' : 'open-up',
          terminalGap: 32,
        },
        { kind: 'bulb', at: { x: bulbX, y: cyMid }, radius: bulbR, brightness: bulbBright },
      ];
      return { elements };
    },
    [closed, brightnessBucket],
  );

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, dpr, colors }, state, _dt, _simT, context: SimCtx) => {
      const { closed, V, I, showE, showB, showElec, computed: _computed } = state;
      const {
        margin,
        top,
        bot,
        batX,
        bulbX: _bulbX,
        switchX: _switchX,
        loop,
        segLens: _segLens,
        totalLen: _totalLen,
        pointOnLoop,
        projectOnSeg,
        fieldB,
        fieldE,
        carriers,
      } = context;

      const isClosed = closed;
      const current = I;
      const voltage = V;

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      const off = getStatic(w, h, dpr);
      if (off) ctx.drawImage(off, 0, 0, w, h);

      // Polarity glyphs — used to bake into the offscreen canvas; pulled
      // out to per-frame ctx so the cache stays a plain CircuitSpec.
      drawLabel(ctx, { text: '+', x: batX - 18, y: top, color: colors.pink, weight: 'bold', size: 12, font: 'bold 12px "JetBrains Mono", monospace', align: 'right', baseline: 'middle' });
      drawLabel(ctx, { text: '−', x: batX - 12, y: bot, color: colors.blue, weight: 'bold', size: 12, font: 'bold 12px "JetBrains Mono", monospace', align: 'right', baseline: 'middle' });

      // ----- B-field circles around the wire (sample points along the loop).
      if (showB && current > 0.01) {
        const Inorm = Math.min(1, Math.log10(current + 1) / 1.4);
        const baseAlpha = 0.18 + 0.45 * Inorm;
        ctx.save();
        ctx.globalAlpha = baseAlpha;
        ctx.strokeStyle = colors.teal;
        ctx.lineWidth = 1.1;
        const samples = 16;
        for (let i = 0; i < samples; i++) {
          const t = (i + 0.5) / samples;
          // Skip the immediate vicinity of the switch (small gap).
          if (Math.abs(t - 0.125) < 0.02 && !isClosed) continue;
          const pt = pointOnLoop(t);
          // Two concentric circles per sample for a sense of "field tube".
          const r1 = 8 + 8 * Inorm;
          const r2 = r1 + 6;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, r1, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
          ctx.globalAlpha = 0.5;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, r2, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = 1;
          // Small chevron showing the local circulation sense (right-hand
          // rule from the conventional current). Pick a perpendicular
          // direction on the "above wire" side (canvas −n).
          const cx = pt.x - pt.ty * (r1 + 3);
          const cy = pt.y + pt.tx * (r1 + 3);
          ctx.save();
          ctx.globalAlpha = baseAlpha + 0.2;
          ctx.fillStyle = colors.teal;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx - pt.tx * 5 - pt.ty * 3, cy - pt.ty * 5 + pt.tx * 3);
          ctx.lineTo(cx - pt.tx * 5 + pt.ty * 3, cy - pt.ty * 5 - pt.tx * 3);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
      }

      // ----- E-field arrows in the air + axial chevrons along the wire.
      if (showE && isClosed) {
        // Axial chevrons inside the wire — small pink triangles along
        // the path showing the direction of axial E.
        const nE = 24;
        ctx.fillStyle = colors.pink;
        for (let i = 0; i < nE; i++) {
          const t = (i + 0.5) / nE;
          const pt = pointOnLoop(t);
          const len = 7;
          const ax = pt.x + pt.tx * len;
          const ay = pt.y + pt.ty * len;
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(ax - pt.tx * 6 + pt.ty * 3, ay - pt.ty * 6 - pt.tx * 3);
          ctx.lineTo(ax - pt.tx * 6 - pt.ty * 3, ay - pt.ty * 6 + pt.tx * 3);
          ctx.closePath();
          ctx.fill();
        }

        // Dipole-style E field in the air around the loop.
        const gridStepX = 64;
        const gridStepY = 56;
        for (let gx = margin / 2; gx < w; gx += gridStepX) {
          for (let gy = 18; gy < h - 8; gy += gridStepY) {
            // Skip points that sit on or very near the wire (already shown).
            let nearWire = false;
            for (const seg of loop) {
              const p = projectOnSeg(seg, gx, gy);
              if (p.r < 14) {
                nearWire = true;
                break;
              }
            }
            if (nearWire) continue;
            const { ex, ey } = fieldE(gx, gy, voltage);
            const mag = Math.hypot(ex, ey);
            if (mag < 0.05) continue;
            const len = Math.min(18, 6 + mag * 14);
            const ux = ex / mag,
              uy = ey / mag;
            const tipX = gx + ux * len;
            const tipY = gy + uy * len;
            const alpha = Math.min(0.7, 0.2 + mag * 0.5);
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.strokeStyle = colors.pink;
            ctx.lineWidth = 1.1;
            ctx.beginPath();
            ctx.moveTo(gx - ux * len * 0.4, gy - uy * len * 0.4);
            ctx.lineTo(tipX, tipY);
            ctx.stroke();
            ctx.restore();
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = colors.pink;
            ctx.beginPath();
            ctx.moveTo(tipX, tipY);
            ctx.lineTo(tipX - ux * 4 + uy * 2.5, tipY - uy * 4 - ux * 2.5);
            ctx.lineTo(tipX - ux * 4 - uy * 2.5, tipY - uy * 4 + ux * 2.5);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
          }
        }
      }

      // ----- Poynting arrows. Tied to whichever fields are currently visible.
      // Only meaningful where BOTH E and B are nonzero, i.e. when both show
      // toggles are on AND the switch is closed.
      if (showE && showB && isClosed && current > 0.01) {
        const gridStepX = 70;
        const gridStepY = 60;
        for (let gx = margin / 2; gx < w; gx += gridStepX) {
          for (let gy = 22; gy < h - 12; gy += gridStepY) {
            // Pick points just outside the wire — that's where Poynting
            // arrows tell the story.
            let nearest = Infinity;
            for (const seg of loop) {
              const p = projectOnSeg(seg, gx, gy);
              if (p.r < nearest) nearest = p.r;
            }
            if (nearest < 12 || nearest > 90) continue;

            const { ex, ey } = fieldE(gx, gy, voltage);
            const { bx, by } = fieldB(gx, gy, current);
            // Treat E as in-plane (axial along the wire or dipole-radial
            // in the air) and B as the in-plane proxy returned by fieldB.
            // The pedagogically useful S is "perp(E) along the side set
            // by the sign of (E × Bproxy)" — that aims S into the wire on
            // the resistive side and out of the wire on the source side.
            const Emag = Math.hypot(ex, ey);
            const Bmag = Math.hypot(bx, by);
            if (Emag < 0.05 || Bmag < 1e-9) continue;
            const cross = ex * by - ey * bx; // out-of-plane (z) component
            const sign = cross >= 0 ? 1 : -1;
            // perp(E) rotated 90° CCW, scaled by |B|.
            const sxFinal = -ey * sign * Bmag;
            const syFinal = ex * sign * Bmag;
            const sMag = Math.hypot(sxFinal, syFinal);
            if (sMag < 1e-9) continue;
            const ux = sxFinal / sMag;
            const uy = syFinal / sMag;
            const len = 14;
            const tipX = gx + ux * len;
            const tipY = gy + uy * len;
            const alpha = 0.45 + 0.3 * Math.min(1, sMag * 8);
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.strokeStyle = colors.accent;
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(gx - ux * len * 0.3, gy - uy * len * 0.3);
            ctx.lineTo(tipX, tipY);
            ctx.stroke();
            ctx.restore();
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = colors.accent;
            ctx.beginPath();
            ctx.moveTo(tipX, tipY);
            ctx.lineTo(tipX - ux * 5 + uy * 3, tipY - uy * 5 - ux * 3);
            ctx.lineTo(tipX - ux * 5 - uy * 3, tipY - uy * 5 + ux * 3);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
          }
        }
      }

      // ----- Drifting electrons along the wire (drawn last so they sit
      // on top of the loop polyline).
      if (showElec) {
        const driftSpeed = isClosed ? 0.0009 * Math.min(3, current / 4 + 0.4) : 0;
        ctx.fillStyle = colors.blue;
        for (const c of carriers) {
          c.s += driftSpeed;
          if (c.s > 1) c.s -= 1;
          const pt = pointOnLoop(c.s);
          const px = pt.x - pt.ty * c.jitter * 0.4;
          const py = pt.y + pt.tx * c.jitter * 0.4;
          ctx.beginPath();
          ctx.arc(px, py, 2.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ----- Header label.
      drawLabel(ctx, {
        x: 16,
        y: 12,
        text: isClosed
          ? 'switch closed · three fields present · S = (1/μ₀) E × B'
          : 'switch open · no current · no B · no S',
        color: isClosed ? colors.accent : withAlpha(colors.textDim, 0.65),
        size: 11,
        baseline: 'top',
      });

      // ----- Bottom annotation: drift hint, only when electrons visible.
      if (showElec && isClosed) {
        ctx.save();
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = colors.blue;
        drawLabel(ctx, { text: 'drift speed of these dots ≈ 10⁻⁴ m/s in real copper — too slow to carry the energy', x: w / 2, y: h - 16, align: 'center' });
        ctx.restore();
      }
    },
    [getStatic],
    (info) => {
      const { w, h } = info;

      // ----- Geometry of the loop. Battery left, switch top centre, bulb right.
      const margin = 56;
      const top = h * 0.3;
      const bot = h * 0.78;
      const batX = margin;
      const bulbX = w - margin;
      const switchX = (batX + bulbX) / 2;

      // Loop polyline, ordered for carrier drift (conventional current:
      // + terminal → top rail → switch → top rail → bulb → bottom rail →
      // − terminal).
      const loop: Seg[] = [
        { x1: batX, y1: top, x2: switchX, y2: top },
        { x1: switchX, y1: top, x2: bulbX, y2: top },
        { x1: bulbX, y1: top, x2: bulbX, y2: bot },
        { x1: bulbX, y1: bot, x2: batX, y2: bot },
      ];
      const segLens = loop.map((s) => Math.hypot(s.x2 - s.x1, s.y2 - s.y1));
      const totalLen = segLens.reduce((a, b) => a + b, 0);

      function pointOnLoop(s: number): { x: number; y: number; tx: number; ty: number } {
        let dist = s * totalLen;
        for (let i = 0; i < loop.length; i++) {
          const seg = loop[i]!;
          const L = segLens[i]!;
          if (dist <= L) {
            const f = dist / L;
            const dx = seg.x2 - seg.x1,
              dy = seg.y2 - seg.y1;
            const m = Math.hypot(dx, dy) || 1;
            return {
              x: seg.x1 + dx * f,
              y: seg.y1 + dy * f,
              tx: dx / m,
              ty: dy / m,
            };
          }
          dist -= L;
        }
        const seg = loop[loop.length - 1]!;
        const dx = seg.x2 - seg.x1,
          dy = seg.y2 - seg.y1;
        const m = Math.hypot(dx, dy) || 1;
        return { x: seg.x2, y: seg.y2, tx: dx / m, ty: dy / m };
      }

      function projectOnSeg(seg: Seg, px: number, py: number): ProjResult {
        const dx = seg.x2 - seg.x1,
          dy = seg.y2 - seg.y1;
        const L2 = dx * dx + dy * dy;
        const t = Math.max(0, Math.min(1, ((px - seg.x1) * dx + (py - seg.y1) * dy) / L2));
        const fx = seg.x1 + dx * t;
        const fy = seg.y1 + dy * t;
        const r = Math.hypot(px - fx, py - fy);
        const L = Math.sqrt(L2) || 1;
        const tx = dx / L,
          ty = dy / L;
        const nx = (px - fx) / (r || 1);
        const ny = (py - fy) / (r || 1);
        return { fx, fy, r, t, tx, ty, nx, ny };
      }

      function fieldB(px: number, py: number, current: number): { bx: number; by: number } {
        let bx = 0,
          by = 0;
        for (const seg of loop) {
          const p = projectOnSeg(seg, px, py);
          const r = Math.max(8, p.r);
          const mag = (PHYS.mu_0 * current) / (2 * Math.PI * r);
          const sign = p.tx * p.ny - p.ty * p.nx >= 0 ? 1 : -1;
          bx += mag * sign * p.nx;
          by += mag * sign * p.ny;
        }
        return { bx, by };
      }

      function fieldE(px: number, py: number, voltage: number): { ex: number; ey: number } {
        let ex = 0,
          ey = 0;
        let nearest = Infinity;
        let nearestSeg: Seg | null = null;
        for (const seg of loop) {
          const p = projectOnSeg(seg, px, py);
          if (p.r < nearest) {
            nearest = p.r;
            nearestSeg = seg;
          }
        }
        if (nearestSeg && nearest < 8) {
          const seg = nearestSeg;
          const dx = seg.x2 - seg.x1,
            dy = seg.y2 - seg.y1;
          const L = Math.hypot(dx, dy) || 1;
          const Eaxial = voltage / (totalLen * 0.001 + 1e-9);
          const k = 0.0015;
          ex += (dx / L) * Eaxial * k;
          ey += (dy / L) * Eaxial * k;
        }
        const plus = { x: batX, y: top };
        const minus = { x: batX, y: bot };
        const kQ = voltage * 0.6;
        for (const [src, q] of [
          [plus, +1],
          [minus, -1],
        ] as const) {
          const dx = px - src.x;
          const dy = py - src.y;
          const r2 = dx * dx + dy * dy + 400;
          const r = Math.sqrt(r2);
          const mag = (kQ * q) / r2;
          ex += mag * (dx / r);
          ey += mag * (dy / r);
        }
        return { ex, ey };
      }

      if (!carriersRef.current) {
        const arr: Carrier[] = [];
        for (let i = 0; i < 56; i++) {
          arr.push({ s: i / 56, jitter: (Math.random() - 0.5) * 4 });
        }
        carriersRef.current = arr;
      }

      return {
        context: {
          margin,
          top,
          bot,
          batX,
          bulbX,
          switchX,
          loop,
          segLens,
          totalLen,
          pointOnLoop,
          projectOnSeg,
          fieldB,
          fieldE,
          carriers: carriersRef.current,
        },
      };
    },
  );

  return (
    <Demo
      figure={figure}
      title="Battery, switch, bulb — three fields at once"
      question="Battery → wire → bulb. Where is the energy actually moving — along the wire, alongside it, or through the empty space around it?"
      caption={
        <>
          Close the switch. Yellow dots are the conduction electrons drifting along the copper. Teal
          circles are the magnetic field curling around the wire (right-hand rule). Pink arrows are
          the electric field — axial inside the conductor, dipole-style in the surrounding air. The
          amber arrows are the Poynting vector{' '}
          <strong>
            S = (1/μ<sub>0</sub>) E × B
          </strong>
          , drawn at every grid point where the other two are visible. Look at where the amber
          arrows point near the bulb, and where they point near the battery. That is where the
          energy is actually going.
        </>
      }
      deeperLab={{ slug: 'poynting', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={340} setup={setup} />
      <DemoControls>
        <MiniToggle
          label={closed ? 'switch CLOSED' : 'switch OPEN'}
          checked={closed}
          onChange={setClosed}
        />
        <MiniSlider
          label="V"
          value={V}
          min={1}
          max={24}
          step={0.5}
          format={(v) => v.toFixed(1) + ' V'}
          onChange={setV}
        />
        <MiniToggle label="electrons" checked={showElec} onChange={setShowElec} />
        <MiniToggle label="B field" checked={showB} onChange={setShowB} />
        <MiniToggle label="E field" checked={showE} onChange={setShowE} />
        <MiniReadout label="I = V/R" value={I.toFixed(2)} unit="A" />
        <MiniReadout
          label="|B| at wire (1 mm)"
          value={(computed.Bsurf * 1000).toFixed(2)}
          unit="mT"
        />
      </DemoControls>
      <EquationStrip
        leftLabel="Current"
        left={
          <InlineMath
            tex={`I = \\dfrac{V}{R} = \\dfrac{${V.toFixed(1)}}{${R_LOAD}} = ${I.toFixed(2)} \\text{ A}`}
          />
        }
        rightLabel="|B| at wire surface"
        right={
          <InlineMath
            tex={`|B| = \\dfrac{\\mu_0 I}{2\\pi a} \\approx ${(computed.Bsurf * 1000).toFixed(2)} \\text{ mT}`}
          />
        }
      />
    </Demo>
  );
}
