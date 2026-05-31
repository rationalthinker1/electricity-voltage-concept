/**
 * Demo D2.1b — The line integral of E, built one Riemann rectangle at a time
 *
 * The formal definition V_ab = V_b − V_a = −∫_a^b E·dℓ is the one place in the
 * chapter where an integral does real work, and most readers have never *seen*
 * a line integral evaluated interactively. This demo makes the integral
 * tangible.
 *
 * Top panel: the radial field of a single point charge, with faint
 * equipotential rings (the "altitude contours"). A path runs from a draggable
 * start point `a` to a draggable end point `b`. The path is chopped into N
 * segments; at each segment midpoint the local field vector E is drawn, and the
 * running sum −Σ E·Δℓ is accumulated.
 *
 * Bottom panel: the Riemann picture itself. The horizontal axis is arc length s
 * along the path; the vertical axis is E∥ — the component of E along the path.
 * The signed area under that curve is exactly ∫E·dℓ, and the demo tiles it with
 * N midpoint rectangles. Drag the N slider up and watch the rectangles refine
 * until their total area locks onto the exact value kq(1/r_b − 1/r_a).
 *
 * Two payoffs:
 *   • The integral is a *limit of a sum* — visibly, as N climbs the rectangle
 *     total converges to the smooth area.
 *   • Path-independence — toggle the straight path for a bowed detour between
 *     the same two endpoints and the answer is unchanged, because the
 *     electrostatic field is conservative.
 */
import { useMemo, useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, EquationStrip, MiniReadout, MiniSlider, MiniToggle } from '@/components/Demo';
import { M } from '@/components/Formula';
import { attachCanvasDrag } from '@/lib/canvasDrag';
import { drawLabel } from '@/lib/canvasLayout';
import { drawArrow, drawCharge, drawGlowPath, drawHandle } from '@/lib/canvasPrimitives';
import { withAlpha } from '@/lib/canvasTheme';
import { makePlotMappers } from '@/lib/drawPlot';
import { pointSegmentDistance } from '@/lib/geometry';
import { pointChargeField2D } from '@/lib/physics';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

interface Props {
  figure: string;
}

const REGION_METERS = 0.5; // physical width the canvas spans, for V to come out in volts
const MIN_R_PX = 22; // clamp near the charge so the field doesn't blow up
const CHARGE_FX = 0.5; // charge x as a fraction of canvas width
const CHARGE_FY = 0.46; // charge y as a fraction of the field-panel height
const FINE = 180; // samples for the smooth E∥ curve

interface Pt {
  x: number;
  y: number;
}

interface Layout {
  fieldTop: number;
  fieldBottom: number;
  fieldH: number;
  plotTop: number;
  plotBottom: number;
  cx: number;
  cy: number;
  mpp: number; // metres per pixel
}

function layoutFor(w: number, h: number): Layout {
  const plotBottom = h - 24;
  const plotTop = plotBottom - 116;
  const fieldTop = 10;
  const fieldBottom = plotTop - 34;
  const fieldH = fieldBottom - fieldTop;
  return {
    fieldTop,
    fieldBottom,
    fieldH,
    plotTop,
    plotBottom,
    cx: w * CHARGE_FX,
    cy: fieldTop + fieldH * CHARGE_FY,
    mpp: REGION_METERS / Math.max(1, w),
  };
}

/** Normalised (nx, ny) within the field panel → canvas pixels. */
function toPx(L: Layout, w: number, nx: number, ny: number): Pt {
  return { x: nx * w, y: L.fieldTop + ny * L.fieldH };
}

/** Point-charge field (V/m) + potential (V) at a pixel point. */
function fieldAt(px: number, py: number, L: Layout, Q: number) {
  // Work in metres so the shared SI helper does the k·Q/r² math.
  return pointChargeField2D(Q, (px - L.cx) * L.mpp, (py - L.cy) * L.mpp, MIN_R_PX * L.mpp);
}

interface Computed {
  L: Layout;
  A: Pt;
  B: Pt;
  pathPoint: (u: number) => Pt;
  rA: number;
  rB: number;
  VA: number;
  VB: number;
  VabExact: number;
  Vapprox: number;
  /** Coarse N-segment midpoint rectangles, in arc-length / E∥ terms. */
  segs: Array<{ s0: number; s1: number; ePar: number; mid: Pt; e: { ex: number; ey: number } }>;
  /** Fine smooth E∥(s) curve. */
  fine: Array<{ s: number; ePar: number }>;
  totalS: number; // path length, metres
  ePeak: number; // max |E∥| for plot scaling
}

function computeAll(
  w: number,
  h: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  Q: number,
  N: number,
  curved: boolean,
): Computed {
  const L = layoutFor(w, h);
  const A = toPx(L, w, ax, ay);
  const B = toPx(L, w, bx, by);

  // Bow the curved detour onto whichever side sits farther from the charge, so
  // the path never sweeps across the singularity.
  const dx = B.x - A.x;
  const dy = B.y - A.y;
  const segLen = Math.max(1, Math.hypot(dx, dy));
  let nx = -dy / segLen;
  let ny = dx / segLen;
  const mx = (A.x + B.x) / 2;
  const my = (A.y + B.y) / 2;
  if ((mx + nx - L.cx) ** 2 + (my + ny - L.cy) ** 2 < (mx - nx - L.cx) ** 2 + (my - ny - L.cy) ** 2) {
    nx = -nx;
    ny = -ny;
  }
  const amp = curved ? 0.42 * segLen : 0;

  const pathPoint = (u: number): Pt => {
    const bx0 = A.x + dx * u;
    const by0 = A.y + dy * u;
    const off = amp * Math.sin(Math.PI * u);
    return { x: bx0 + nx * off, y: by0 + ny * off };
  };

  // Exact endpoint potentials.
  const fa = fieldAt(A.x, A.y, L, Q);
  const fb = fieldAt(B.x, B.y, L, Q);
  const VA = fa.V;
  const VB = fb.V;
  const VabExact = VB - VA;

  // Coarse Riemann segments (midpoint rule on the path parameter).
  const segs: Computed['segs'] = [];
  let sum = 0;
  let sAcc = 0;
  for (let i = 0; i < N; i++) {
    const p0 = pathPoint(i / N);
    const p1 = pathPoint((i + 1) / N);
    const mid = pathPoint((i + 0.5) / N);
    const cdx = p1.x - p0.x;
    const cdy = p1.y - p0.y;
    const chordPx = Math.max(1e-6, Math.hypot(cdx, cdy));
    const chordM = chordPx * L.mpp;
    const e = fieldAt(mid.x, mid.y, L, Q);
    // E·dℓ with dℓ = chord vector in metres.
    const contribution = e.ex * cdx * L.mpp + e.ey * cdy * L.mpp;
    sum += contribution;
    const ePar = (e.ex * cdx + e.ey * cdy) / chordPx; // V/m along the chord
    segs.push({ s0: sAcc, s1: sAcc + chordM, ePar, mid, e: { ex: e.ex, ey: e.ey } });
    sAcc += chordM;
  }
  const Vapprox = -sum;

  // Fine smooth curve for the plot backdrop, on the same chord-length axis.
  const fine: Computed['fine'] = [];
  let fAcc = 0;
  let prev = pathPoint(0);
  for (let i = 0; i <= FINE; i++) {
    const u = i / FINE;
    const p = pathPoint(u);
    if (i > 0) fAcc += Math.hypot(p.x - prev.x, p.y - prev.y) * L.mpp;
    // tangent
    const uu = Math.min(1, u + 1e-3);
    const pf = pathPoint(uu);
    let tx = pf.x - p.x;
    let ty = pf.y - p.y;
    const tl = Math.max(1e-6, Math.hypot(tx, ty));
    tx /= tl;
    ty /= tl;
    const e = fieldAt(p.x, p.y, L, Q);
    fine.push({ s: fAcc, ePar: e.ex * tx + e.ey * ty });
    prev = p;
  }

  let ePeak = 1e-9;
  for (const f of fine) ePeak = Math.max(ePeak, Math.abs(f.ePar));
  for (const sg of segs) ePeak = Math.max(ePeak, Math.abs(sg.ePar));

  return {
    L,
    A,
    B,
    pathPoint,
    rA: fa.r,
    rB: fb.r,
    VA,
    VB,
    VabExact,
    Vapprox,
    segs,
    fine,
    totalS: sAcc,
    ePeak,
  };
}

function hitHandle(mx: number, my: number, p: Pt) {
  return Math.hypot(mx - p.x, my - p.y) < 16;
}

export function LineIntegralVoltageDemo({ figure }: Props) {
  const [ax, setAx] = useState(0.26);
  const [ay, setAy] = useState(0.22);
  const [bx, setBx] = useState(0.76);
  const [by, setBy] = useState(0.3);
  const [Qn, setQn] = useState(1); // charge, nC
  const [N, setN] = useState(12);
  const [curved, setCurved] = useState(false);
  const [dims, setDims] = useState({ w: 880, h: 460 });

  const Q = Qn * 1e-9;

  const stateRef = useSimState({ ax, ay, bx, by, Q, N, curved });

  const readout = useMemo(
    () => computeAll(dims.w, dims.h, ax, ay, bx, by, Q, N, curved),
    [dims, ax, ay, bx, by, Q, N, curved],
  );

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, colors }, state) => {
      const { ax: aX, ay: aY, bx: bX, by: bY, Q: q, N: n, curved: cv } = state;
      const c = computeAll(w, h, aX, aY, bX, bY, q, n, cv);
      const L = c.L;

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      // ── Field panel ────────────────────────────────────────────────
      // Clip everything in this section to the panel so the rings and the
      // charge glow can't bleed into the Riemann plot below.
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, L.fieldTop, w, L.fieldH);
      ctx.clip();

      // Equipotential rings: pixel circles around the charge, each an
      // equipotential, labelled with its volts.
      const ringPx = [40, 78, 122, 172, 226];
      for (const rp of ringPx) {
        ctx.strokeStyle = withAlpha(colors.teal, 0.16);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(L.cx, L.cy, rp, 0, Math.PI * 2);
        ctx.stroke();
        const vRing = fieldAt(L.cx + rp, L.cy, L, q).V;
        drawLabel(ctx, {
          text: `${vRing.toFixed(0)} V`,
          x: L.cx + rp - 2,
          y: L.cy - 3,
          color: withAlpha(colors.teal, 0.5),
          align: 'right',
          baseline: 'bottom',
          size: 9,
        });
      }

      // Sparse background field arrows.
      const gx = 9;
      const gy = 4;
      for (let i = 1; i < gx; i++) {
        for (let j = 1; j <= gy; j++) {
          const px = (i / gx) * w;
          const py = L.fieldTop + (j / (gy + 1)) * L.fieldH;
          const e = fieldAt(px, py, L, q);
          const mag = Math.hypot(e.ex, e.ey);
          if (mag < 1e-9) continue;
          const ux = e.ex / mag;
          const uy = e.ey / mag;
          const len = 11;
          drawArrow(
            ctx,
            { x: px - ux * len * 0.5, y: py - uy * len * 0.5 },
            { x: px + ux * len * 0.5, y: py + uy * len * 0.5 },
            { color: withAlpha(colors.accent, 0.22), lineWidth: 1, headLength: 4, headWidth: 3 },
          );
        }
      }

      // The charge.
      drawCharge(ctx, { x: L.cx, y: L.cy }, {
        color: q >= 0 ? colors.pink : colors.blue,
        sign: q >= 0 ? '+' : '−',
        radius: 13,
        label: `q = ${Qn.toFixed(1)} nC`,
        textColor: colors.bg,
        labelColor: colors.textDim,
      });

      // The path itself (glowing polyline).
      const poly: Pt[] = [];
      for (let i = 0; i <= 80; i++) poly.push(c.pathPoint(i / 80));
      drawGlowPath(ctx, poly, { color: colors.text, lineWidth: 2, glowWidth: 7 });

      // Segment boundary ticks + midpoint field arrows.
      const showArrows = n <= 18;
      for (let i = 0; i <= n; i++) {
        const p = c.pathPoint(i / n);
        ctx.fillStyle = withAlpha(colors.text, 0.75);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      if (showArrows) {
        for (const sg of c.segs) {
          const mag = Math.hypot(sg.e.ex, sg.e.ey);
          if (mag < 1e-9) continue;
          const ux = sg.e.ex / mag;
          const uy = sg.e.ey / mag;
          const len = 16;
          drawArrow(
            ctx,
            { x: sg.mid.x, y: sg.mid.y },
            { x: sg.mid.x + ux * len, y: sg.mid.y + uy * len },
            { color: withAlpha(colors.accent, 0.9), lineWidth: 1.4, headLength: 5, headWidth: 3.5 },
          );
        }
      }

      // Endpoint handles.
      drawHandle(ctx, c.A, { label: 'a', color: colors.blue });
      drawHandle(ctx, c.B, { label: 'b', color: colors.pink });

      // Running answer, top-left.
      drawLabel(ctx, {
        text: `drag a and b · −Σ E·Δℓ (N=${n}) ≈ ${c.Vapprox.toFixed(2)} V`,
        x: 10,
        y: L.fieldTop + 4,
        color: colors.textDim,
        baseline: 'top',
        size: 10,
      });

      ctx.restore(); // end field-panel clip

      // ── Riemann plot panel ─────────────────────────────────────────
      const plotLeft = 48;
      const plotRight = w - 12;
      const plotW = plotRight - plotLeft;
      const plotH = L.plotBottom - L.plotTop;
      const zeroY = (L.plotTop + L.plotBottom) / 2;
      // Symmetric y-range so E∥ = 0 lands on the mid-line; pad the peak by 6%.
      const peak = c.ePeak * 1.06;
      const { xOf, yOf } = makePlotMappers(
        { x: plotLeft, y: L.plotTop, w: plotW, h: plotH },
        0,
        c.totalS > 0 ? c.totalS : 1,
        -peak,
        peak,
      );

      // Panel frame + zero axis.
      ctx.strokeStyle = withAlpha(colors.borderStrong, 0.7);
      ctx.lineWidth = 1;
      ctx.strokeRect(plotLeft, L.plotTop, plotW, L.plotBottom - L.plotTop);
      ctx.strokeStyle = withAlpha(colors.text, 0.35);
      ctx.beginPath();
      ctx.moveTo(plotLeft, zeroY);
      ctx.lineTo(plotRight, zeroY);
      ctx.stroke();

      // Midpoint rectangles — the Riemann sum made visible.
      for (const sg of c.segs) {
        const x0 = xOf(sg.s0);
        const x1 = xOf(sg.s1);
        const yv = yOf(sg.ePar);
        const top = Math.min(zeroY, yv);
        const hgt = Math.abs(yv - zeroY);
        ctx.fillStyle = withAlpha(colors.accent, 0.28);
        ctx.fillRect(x0, top, Math.max(0.5, x1 - x0), hgt);
        ctx.strokeStyle = withAlpha(colors.accent, 0.8);
        ctx.lineWidth = 1;
        ctx.strokeRect(x0, top, Math.max(0.5, x1 - x0), hgt);
      }

      // Smooth E∥(s) curve over the top.
      ctx.strokeStyle = colors.teal;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      c.fine.forEach((f, i) => {
        const X = xOf(f.s);
        const Y = yOf(f.ePar);
        if (i === 0) ctx.moveTo(X, Y);
        else ctx.lineTo(X, Y);
      });
      ctx.stroke();

      // Axis labels.
      drawLabel(ctx, {
        text: 'E∥',
        x: plotLeft - 6,
        y: L.plotTop + 2,
        color: colors.teal,
        align: 'right',
        baseline: 'top',
        size: 10,
      });
      drawLabel(ctx, {
        text: '+',
        x: plotLeft - 6,
        y: L.plotTop + 12,
        color: colors.textMuted,
        align: 'right',
        baseline: 'middle',
        size: 9,
      });
      drawLabel(ctx, {
        text: '−',
        x: plotLeft - 6,
        y: L.plotBottom - 10,
        color: colors.textMuted,
        align: 'right',
        baseline: 'middle',
        size: 9,
      });
      drawLabel(ctx, {
        text: 'arc length s, from a → b',
        x: plotRight,
        y: L.plotBottom + 4,
        color: colors.textDim,
        align: 'right',
        baseline: 'top',
        size: 9,
      });
      drawLabel(ctx, {
        text: `shaded signed area = ∫E·dℓ ;  V_ab = −area = ${c.Vapprox.toFixed(2)} V`,
        x: plotLeft,
        y: L.plotBottom + 4,
        color: colors.textDim,
        align: 'left',
        baseline: 'top',
        size: 9,
      });
    },
    [],
    (info) => {
      setDims({ w: info.w, h: info.h });
      let drag: 'a' | 'b' | null = null;

      const handleAt = (mx: number, my: number): 'a' | 'b' | null => {
        const s = stateRef.current;
        const c = computeAll(info.w, info.h, s.ax, s.ay, s.bx, s.by, s.Q, s.N, s.curved);
        if (hitHandle(mx, my, c.A)) return 'a';
        if (hitHandle(mx, my, c.B)) return 'b';
        return null;
      };

      const move = (mx: number, my: number) => {
        if (!drag) return;
        const L = layoutFor(info.w, info.h);
        const nx = Math.max(0.04, Math.min(0.96, mx / info.w));
        const ny = Math.max(0.05, Math.min(0.95, (my - L.fieldTop) / L.fieldH));
        const cand = toPx(L, info.w, nx, ny);
        // A physical line integral can't run through the charge: reject any
        // drag whose straight path would pass within 26 px of it. (The curved
        // detour always bows farther out, so guarding the straight case is
        // sufficient for both routes.)
        const s = stateRef.current;
        const other = drag === 'a' ? toPx(L, info.w, s.bx, s.by) : toPx(L, info.w, s.ax, s.ay);
        if (pointSegmentDistance(L.cx, L.cy, cand.x, cand.y, other.x, other.y) < 26) return;
        if (drag === 'a') {
          setAx(nx);
          setAy(ny);
        } else {
          setBx(nx);
          setBy(ny);
        }
      };

      const cleanup = attachCanvasDrag(info.canvas, {
        onDown(mx, my) {
          const hit = handleAt(mx, my);
          if (hit) {
            drag = hit;
            return true;
          }
          return false;
        },
        onMove: move,
        onUp() {
          drag = null;
        },
        onHover(mx, my) {
          info.canvas.style.cursor = handleAt(mx, my) ? 'grab' : 'default';
        },
      });

      return { context: undefined, cleanup };
    },
  );

  const sub = (x: number) => (x >= 0 ? '+' : '') + x.toFixed(2);
  const err = Math.abs(readout.Vapprox - readout.VabExact);

  return (
    <Demo
      figure={figure}
      title="The line integral, one rectangle at a time"
      question="Add up E along a path from a to b. Does the route matter — and how many slices until the sum is the integral?"
      caption={
        <>
          A single point charge sets up a radial field; the faint teal rings are equipotentials. The
          path from <em>a</em> to <em>b</em> is sliced into <em>N</em> segments, and the panel below
          plots <em>E∥</em> — the component of the field along the path — against arc length. The{' '}
          <em>signed area</em> under that curve is{' '}
          <M tex="\int_a^b \vec{E}\cdot d\vec{\ell}" />, and the amber rectangles are the midpoint
          Riemann sum approximating it. Drag <em>N</em> up and the rectangles refine until their
          total locks onto the exact{' '}
          <M tex="V_{ab} = kq\left(\tfrac{1}{r_b}-\tfrac{1}{r_a}\right)" />. Flip on the curved
          detour: same endpoints, same answer — the electrostatic field is conservative, so the line
          integral does not care which route you take.
        </>
      }
      deeperLab={{ slug: 'potential', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={460} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="N segments"
          value={N}
          min={1}
          max={60}
          step={1}
          format={(v) => v.toFixed(0)}
          onChange={(v) => setN(Math.round(v))}
        />
        <MiniSlider
          label="charge q"
          value={Qn}
          min={-2}
          max={2}
          step={0.1}
          format={(v) => (v >= 0 ? '+' : '') + v.toFixed(1) + ' nC'}
          onChange={setQn}
        />
        <MiniToggle label="Curved detour" checked={curved} onChange={setCurved} />
        <MiniReadout label="r_a → r_b" value={`${(readout.rA * 100).toFixed(1)} → ${(readout.rB * 100).toFixed(1)}`} unit="cm" />
        <MiniReadout label="V_a, V_b" value={`${readout.VA.toFixed(1)}, ${readout.VB.toFixed(1)}`} unit="V" />
        <MiniReadout label="V_ab exact" value={sub(readout.VabExact)} unit="V" />
        <MiniReadout label={`Riemann (N=${N})`} value={sub(readout.Vapprox)} unit="V" />
        <MiniReadout label="|error|" value={err.toFixed(3)} unit="V" />
      </DemoControls>
      <EquationStrip
        leftLabel="Definition (exact)"
        left={
          <div className="flex flex-col items-center gap-1">
            <M tex={`V_{ab} = V_b - V_a = -\\int_a^b \\vec{E}\\cdot d\\vec{\\ell}`} />
            <M
              tex={
                `= kq\\!\\left(\\tfrac{1}{r_b}-\\tfrac{1}{r_a}\\right) = ` +
                `${sub(readout.VabExact)}\\ \\text{V}`
              }
            />
          </div>
        }
        rightLabel={`Riemann sum (N = ${N})`}
        right={
          <M
            tex={
              `-\\sum_{i=1}^{${N}} \\vec{E}_i\\cdot\\Delta\\vec{\\ell}_i ` +
              `\\approx ${sub(readout.Vapprox)}\\ \\text{V}`
            }
          />
        }
      />
    </Demo>
  );
}
