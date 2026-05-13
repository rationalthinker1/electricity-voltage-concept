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
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider, MiniToggle } from '@/components/Demo';
import { renderCircuitToCanvas, type CircuitElement } from '@/lib/canvasPrimitives';
import { PHYS } from '@/lib/physics';

interface Props { figure?: string }

interface StaticCacheEntry { key: string; canvas: HTMLCanvasElement }

/** One drifting carrier along the loop polyline. s in [0,1]. */
interface Carrier { s: number; jitter: number }

interface Seg { x1: number; y1: number; x2: number; y2: number }

const R_LOAD = 4; // bulb's effective resistance for the I = V/R readout

export function BatteryBulbFieldsDemo({ figure }: Props) {
  const [closed, setClosed] = useState(true);
  const [V, setV] = useState(12);
  const [showE, setShowE] = useState(true);
  const [showB, setShowB] = useState(true);
  const [showElec, setShowElec] = useState(true);

  // I = V/R for a fixed bulb. With closed switch, current flows.
  const I = closed ? V / R_LOAD : 0;

  const stateRef = useRef({ closed, V, I, showE, showB, showElec });
  useEffect(() => {
    stateRef.current = { closed, V, I, showE, showB, showElec };
  }, [closed, V, I, showE, showB, showElec]);

  const cacheRef = useRef<StaticCacheEntry | null>(null);
  const carriersRef = useRef<Carrier[] | null>(null);

  // Pre-computed B at a fixed-radius sample inside the wire (μ₀ I / 2π a),
  // just for the readout. Used as a numerical anchor, not for drawing.
  const computed = useMemo(() => {
    const a = 1e-3; // 1 mm
    const Bsurf = (PHYS.mu_0 * I) / (2 * Math.PI * a);
    return { Bsurf };
  }, [I]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, dpr } = info;
    let raf = 0;

    // ----- Geometry of the loop. Battery left, switch top centre, bulb right.
    const margin = 56;
    const top = h * 0.30;
    const bot = h * 0.78;
    const batX = margin;
    const bulbX = w - margin;
    const switchX = (batX + bulbX) / 2;
    const cyMid = (top + bot) / 2;
    const bulbR = 16;

    // Loop polyline, ordered for carrier drift (conventional current:
    // + terminal → top rail → switch → top rail → bulb → bottom rail →
    // − terminal).
    const loop: Seg[] = [
      { x1: batX,    y1: top, x2: switchX, y2: top    },
      { x1: switchX, y1: top, x2: bulbX,   y2: top    },
      { x1: bulbX,   y1: top, x2: bulbX,   y2: bot    },
      { x1: bulbX,   y1: bot, x2: batX,    y2: bot    },
    ];
    const segLens = loop.map(s => Math.hypot(s.x2 - s.x1, s.y2 - s.y1));
    const totalLen = segLens.reduce((a, b) => a + b, 0);

    function pointOnLoop(s: number): { x: number; y: number; tx: number; ty: number } {
      // s in [0,1]; returns position and unit tangent in direction of motion.
      let dist = s * totalLen;
      for (let i = 0; i < loop.length; i++) {
        const seg = loop[i]!;
        const L = segLens[i]!;
        if (dist <= L) {
          const f = dist / L;
          const dx = seg.x2 - seg.x1, dy = seg.y2 - seg.y1;
          const m = Math.hypot(dx, dy) || 1;
          return {
            x: seg.x1 + dx * f,
            y: seg.y1 + dy * f,
            tx: dx / m, ty: dy / m,
          };
        }
        dist -= L;
      }
      const seg = loop[loop.length - 1]!;
      const dx = seg.x2 - seg.x1, dy = seg.y2 - seg.y1;
      const m = Math.hypot(dx, dy) || 1;
      return { x: seg.x2, y: seg.y2, tx: dx / m, ty: dy / m };
    }

    if (!carriersRef.current) {
      const arr: Carrier[] = [];
      for (let i = 0; i < 56; i++) {
        arr.push({ s: i / 56, jitter: (Math.random() - 0.5) * 4 });
      }
      carriersRef.current = arr;
    }

    // Simplified analytical field model used for drawing only.
    // Each wire segment contributes a tangential E (axial inside the
    // wire, pointing in the direction of conventional current) and a
    // circumferential B (right-hand rule).
    //
    // For a point in space at perpendicular distance r from a segment,
    // B ∝ I / (r + ε)  (Biot–Savart for a straight segment, simplified).
    // E in the air around the loop is a heuristic dipole field threading
    // from + terminal to − terminal. The cross product of the two then
    // points roughly into the wire near the resistive bulb and out of
    // the wire near the source — which is the demo's pedagogical claim.

    /** Closest point on segment seg to (px,py). Returns the foot, the signed
     *  perpendicular distance (positive if (px,py) is on the +n side), the unit
     *  tangent, and the unit normal pointing toward (px,py). */
    function projectOnSeg(seg: Seg, px: number, py: number) {
      const dx = seg.x2 - seg.x1, dy = seg.y2 - seg.y1;
      const L2 = dx * dx + dy * dy;
      const t = Math.max(0, Math.min(1, ((px - seg.x1) * dx + (py - seg.y1) * dy) / L2));
      const fx = seg.x1 + dx * t;
      const fy = seg.y1 + dy * t;
      const r = Math.hypot(px - fx, py - fy);
      const L = Math.sqrt(L2) || 1;
      const tx = dx / L, ty = dy / L;
      const nx = (px - fx) / (r || 1);
      const ny = (py - fy) / (r || 1);
      return { fx, fy, r, t, tx, ty, nx, ny };
    }

    /**
     * Magnetic field at (px,py) in canvas pixels, returned as a 2D vector
     * (canvas axes). Sum over the four wire segments. B ⊥ the segment in
     * the page; for a 2D top-down view with current to the right, B sticks
     * out of the page above the wire and into the page below. We map "out of
     * page" to the canvas's perpendicular direction (rotated 90° CCW from
     * the current vector) so the resulting cross product E × B reads
     * correctly inside the plane.
     */
    function fieldB(px: number, py: number, current: number): { bx: number; by: number } {
      let bx = 0, by = 0;
      for (const seg of loop) {
        const p = projectOnSeg(seg, px, py);
        // Skip degenerate cases: outside the segment's extent, perp distance
        // increases but we still want some contribution from the endpoints —
        // projectOnSeg already clamps t, so r is well-defined.
        const r = Math.max(8, p.r);
        const mag = (PHYS.mu_0 * current) / (2 * Math.PI * r);
        // B direction in the page: perpendicular to current and to the
        // page-normal sign of the side we're on. The sign of the perp dot
        // gives us which side of the segment we sit on; combine that with
        // the right-hand rule:
        //   above the segment (canvas −y side), B circles out of the page
        //   below the segment (canvas +y side), B circles into the page
        // To keep S = E×B in-plane and pointing toward/away from the wire,
        // we use the perpendicular IN the page as the visible B vector.
        // That treats B as a 2D in-plane proxy whose cross product with the
        // in-plane axial E gives an in-plane S perpendicular to the wire.
        // sign: +1 if point is on the n-side (perpendicular from segment),
        // determined by tx*ny - ty*nx (out-of-page z component of t × n).
        const sign = p.tx * p.ny - p.ty * p.nx >= 0 ? 1 : -1;
        // In-plane perpendicular to current direction, on the same side
        // the field point sits relative to the wire.
        bx += mag * sign * p.nx;
        by += mag * sign * p.ny;
      }
      return { bx, by };
    }

    /**
     * Axial E inside the wire. Outside, return a small heuristic dipole
     * field from + terminal to − terminal to give the air some E. The
     * combination is what makes Poynting arrows visible everywhere.
     */
    function fieldE(px: number, py: number, voltage: number): { ex: number; ey: number } {
      // Axial component: if the point is within ~6 px of any wire segment,
      // E points along the conventional-current direction inside the wire.
      let ex = 0, ey = 0;
      let nearest = Infinity;
      let nearestSeg: Seg | null = null;
      for (const seg of loop) {
        const p = projectOnSeg(seg, px, py);
        if (p.r < nearest) { nearest = p.r; nearestSeg = seg; }
      }
      if (nearestSeg && nearest < 8) {
        const seg = nearestSeg;
        const dx = seg.x2 - seg.x1, dy = seg.y2 - seg.y1;
        const L = Math.hypot(dx, dy) || 1;
        // Axial E ∝ V/L inside the conductor.
        const Eaxial = voltage / (totalLen * 0.001 + 1e-9); // in (V / m-ish)
        // Scale to a small canvas-unit magnitude.
        const k = 0.0015;
        ex += (dx / L) * Eaxial * k;
        ey += (dy / L) * Eaxial * k;
      }
      // Dipole-style E in the air: from + terminal (top-left battery lead)
      // to − terminal (bottom-left battery lead). Treat the two terminals
      // as point charges of opposite sign.
      const plus = { x: batX, y: top };
      const minus = { x: batX, y: bot };
      const kQ = voltage * 0.6;
      for (const [src, q] of [[plus, +1], [minus, -1]] as const) {
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

    function buildBackdrop(isClosed: boolean, bulbBright: number): HTMLCanvasElement {
      const elems: CircuitElement[] = [
        // Loop wire (dim base).
        { kind: 'wire',
          points: [
            { x: batX, y: top }, { x: bulbX, y: top },
            { x: bulbX, y: bot }, { x: batX, y: bot },
          ],
          color: 'rgba(160,158,149,.35)', lineWidth: 3.5 },
        // Battery, vertical, on the left.
        { kind: 'battery', at: { x: batX, y: cyMid },
          color: 'rgba(255,255,255,.18)',
          leadLength: (bot - top) / 2,
          negativeColor: '#ecebe5', negativePlateLength: 16,
          plateGap: (bot - top) / 2,
          positiveColor: '#ecebe5', positivePlateLength: 28 },
        // Switch on top rail.
        { kind: 'switch', at: { x: switchX, y: top },
          color: isClosed ? '#ff6b2a' : '#ecebe5',
          state: isClosed ? 'closed' : 'open-up',
          terminalGap: 32 },
        // Bulb on the right.
        { kind: 'bulb', at: { x: bulbX, y: cyMid },
          radius: bulbR, brightness: bulbBright },
      ];
      const off = renderCircuitToCanvas({ elements: elems }, w, h, dpr);
      const oc = off.getContext('2d');
      if (oc) {
        oc.setTransform(dpr, 0, 0, dpr, 0, 0);
        // Polarity glyphs.
        oc.fillStyle = '#ff3b6e';
        oc.font = 'bold 12px "JetBrains Mono", monospace';
        oc.textAlign = 'right';
        oc.textBaseline = 'middle';
        oc.fillText('+', batX - 18, top);
        oc.fillStyle = '#5baef8';
        oc.fillText('−', batX - 12, bot);
      }
      return off;
    }

    function draw() {
      const s = stateRef.current;
      const isClosed = s.closed;
      const current = s.I;
      const voltage = s.V;
      const brightness = isClosed ? Math.min(1, current / 6) : 0;

      ctx.fillStyle = '#0d0d10';
      ctx.fillRect(0, 0, w, h);

      const cacheKey = `${w}x${h}@${dpr}|c${isClosed ? 1 : 0}|b${brightness.toFixed(2)}`;
      if (cacheRef.current?.key !== cacheKey) {
        cacheRef.current = { key: cacheKey, canvas: buildBackdrop(isClosed, brightness) };
      }
      ctx.drawImage(cacheRef.current.canvas, 0, 0, w, h);

      // ----- B-field circles around the wire (sample points along the loop).
      if (s.showB && current > 0.01) {
        const Inorm = Math.min(1, Math.log10(current + 1) / 1.4);
        const baseAlpha = 0.18 + 0.45 * Inorm;
        ctx.strokeStyle = `rgba(108,197,194,${baseAlpha.toFixed(3)})`;
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
          ctx.fillStyle = `rgba(108,197,194,${(baseAlpha + 0.2).toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx - pt.tx * 5 - pt.ty * 3, cy - pt.ty * 5 + pt.tx * 3);
          ctx.lineTo(cx - pt.tx * 5 + pt.ty * 3, cy - pt.ty * 5 - pt.tx * 3);
          ctx.closePath(); ctx.fill();
        }
      }

      // ----- E-field arrows in the air + axial chevrons along the wire.
      if (s.showE && isClosed) {
        // Axial chevrons inside the wire — small pink triangles along
        // the path showing the direction of axial E.
        const nE = 24;
        ctx.fillStyle = 'rgba(255,59,110,0.85)';
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
              if (p.r < 14) { nearWire = true; break; }
            }
            if (nearWire) continue;
            const { ex, ey } = fieldE(gx, gy, voltage);
            const mag = Math.hypot(ex, ey);
            if (mag < 0.05) continue;
            const len = Math.min(18, 6 + mag * 14);
            const ux = ex / mag, uy = ey / mag;
            const tipX = gx + ux * len;
            const tipY = gy + uy * len;
            const alpha = Math.min(0.7, 0.2 + mag * 0.5);
            ctx.strokeStyle = `rgba(255,59,110,${alpha.toFixed(3)})`;
            ctx.lineWidth = 1.1;
            ctx.beginPath();
            ctx.moveTo(gx - ux * len * 0.4, gy - uy * len * 0.4);
            ctx.lineTo(tipX, tipY);
            ctx.stroke();
            ctx.fillStyle = `rgba(255,59,110,${alpha.toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(tipX, tipY);
            ctx.lineTo(tipX - ux * 4 + uy * 2.5, tipY - uy * 4 - ux * 2.5);
            ctx.lineTo(tipX - ux * 4 - uy * 2.5, tipY - uy * 4 + ux * 2.5);
            ctx.closePath();
            ctx.fill();
          }
        }
      }

      // ----- Poynting arrows. Tied to whichever fields are currently visible.
      // Only meaningful where BOTH E and B are nonzero, i.e. when both show
      // toggles are on AND the switch is closed.
      if (s.showE && s.showB && isClosed && current > 0.01) {
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
            const syFinal =  ex * sign * Bmag;
            const sMag = Math.hypot(sxFinal, syFinal);
            if (sMag < 1e-9) continue;
            const ux = sxFinal / sMag;
            const uy = syFinal / sMag;
            const len = 14;
            const tipX = gx + ux * len;
            const tipY = gy + uy * len;
            const alpha = 0.45 + 0.3 * Math.min(1, sMag * 8);
            ctx.strokeStyle = `rgba(255,107,42,${alpha.toFixed(3)})`;
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(gx - ux * len * 0.3, gy - uy * len * 0.3);
            ctx.lineTo(tipX, tipY);
            ctx.stroke();
            ctx.fillStyle = `rgba(255,107,42,${alpha.toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(tipX, tipY);
            ctx.lineTo(tipX - ux * 5 + uy * 3, tipY - uy * 5 - ux * 3);
            ctx.lineTo(tipX - ux * 5 - uy * 3, tipY - uy * 5 + ux * 3);
            ctx.closePath();
            ctx.fill();
          }
        }
      }

      // ----- Drifting electrons along the wire (drawn last so they sit
      // on top of the loop polyline).
      if (s.showElec) {
        const carriers = carriersRef.current!;
        const driftSpeed = isClosed ? 0.0009 * Math.min(3, current / 4 + 0.4) : 0;
        ctx.fillStyle = '#ffd166';
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
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillStyle = isClosed ? '#ff6b2a' : 'rgba(160,158,149,.65)';
      ctx.fillText(
        isClosed
          ? 'switch closed · three fields present · S = (1/μ₀) E × B'
          : 'switch open · no current · no B · no S',
        16, 12,
      );

      // ----- Bottom annotation: drift hint, only when electrons visible.
      if (s.showElec && isClosed) {
        ctx.fillStyle = 'rgba(91,174,248,.7)';
        ctx.textAlign = 'center';
        ctx.fillText(
          'drift speed of these dots ≈ 10⁻⁴ m/s in real copper — too slow to carry the energy',
          w / 2, h - 16,
        );
      }

      raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 8.0'}
      title="Battery, switch, bulb — three fields at once"
      question="Battery → wire → bulb. Where is the energy actually moving — along the wire, alongside it, or through the empty space around it?"
      caption={<>
        Close the switch. Yellow dots are the conduction electrons drifting along the copper. Teal circles are the magnetic field
        curling around the wire (right-hand rule). Pink arrows are the electric field — axial inside the conductor, dipole-style
        in the surrounding air. The amber arrows are the Poynting vector <strong>S = (1/μ<sub>0</sub>) E × B</strong>, drawn at
        every grid point where the other two are visible. Look at where the amber arrows point near the bulb, and where they point
        near the battery. That is where the energy is actually going.
      </>}
      deeperLab={{ slug: 'poynting', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={340} setup={setup} />
      <DemoControls>
        <MiniToggle label={closed ? 'switch CLOSED' : 'switch OPEN'} checked={closed} onChange={setClosed} />
        <MiniSlider
          label="V" value={V} min={1} max={24} step={0.5}
          format={v => v.toFixed(1) + ' V'}
          onChange={setV}
        />
        <MiniToggle label="electrons" checked={showElec} onChange={setShowElec} />
        <MiniToggle label="B field" checked={showB} onChange={setShowB} />
        <MiniToggle label="E field" checked={showE} onChange={setShowE} />
        <MiniReadout label="I = V/R" value={I.toFixed(2)} unit="A" />
        <MiniReadout label="|B| at wire (1 mm)" value={(computed.Bsurf * 1000).toFixed(2)} unit="mT" />
      </DemoControls>
    </Demo>
  );
}
