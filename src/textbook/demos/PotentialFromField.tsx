/**
 * Demo D2.1c — Potential from the field integral: watching the sum become V
 *
 * The formula V = −∫ E·dℓ is usually handed over finished. This demo unpacks
 * it as a process you can watch. A point charge sits at the left; a straight
 * radial path runs out to a draggable probe. Walk inward from the far
 * reference (where V ≈ 0) toward the probe and, at every little step dℓ, the
 * field does an amount of work −E·dℓ on a test charge. Stack those pieces and
 * you get V. As N grows the staircase of pieces locks onto the smooth curve —
 * the integral is the limit of that refinement.
 *
 * The two panels share one horizontal axis (distance r from the charge), so a
 * stretch of the path sits directly above the slice of voltage it contributes.
 * A sweep line marches from the reference inward; bars it has passed light up
 * and a dot traces the running total onto the curve, so you see the sum being
 * assembled segment by segment.
 */
import { useMemo, useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import {
  Demo,
  DemoControls,
  EquationStrip,
  MiniReadout,
  MiniSlider,
  MiniToggle,
} from '@/components/Demo';
import { M } from '@/components/Formula';
import { attachCanvasDrag } from '@/lib/canvasDrag';
import { drawLabel } from '@/lib/canvasLayout';
import { drawArrow, drawCharge, drawHandle } from '@/lib/canvasPrimitives';
import { withAlpha } from '@/lib/canvasTheme';
import { PHYS } from '@/lib/physics';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

interface Props {
  figure: string;
}

const REGION_METERS = 0.6; // physical width the canvas spans
const CHARGE_X = 34; // charge x in px (r = 0 anchored here)
const MIN_GAP_PX = 48; // keep the probe this far from the charge
const FINE = 200; // samples for the smooth exact curve
const SWEEP_SECS = 3.0; // time for the accumulation sweep to cross the path
const HOLD_SECS = 1.2; // pause on the completed sum before looping

/** Per-mount accumulation-sweep position, advanced in the draw loop or
 *  dragged by the reader. frac 0 = at the reference, 1 = at the probe. */
interface Sweep {
  frac: number;
  hold: number; // seconds remaining on the completed-sum pause
}

interface Segment {
  r0: number; // outer end (larger r), m
  r1: number; // inner end (smaller r), m
  midR: number; // midpoint radius, m
  contrib: number; // −E·dℓ for this segment, V
  eMag: number; // |E| at midpoint, V/m
}

interface Computed {
  fieldTop: number;
  fieldBottom: number;
  midY: number;
  plotTop: number;
  plotBottom: number;
  mpp: number; // metres per px
  pxPerM: number;
  refR: number; // reference radius, m
  probeR: number; // probe radius, m
  probeX: number; // probe x, px
  refX: number; // reference x, px (right end of path)
  plotLeftX: number; // fixed left of the graph frame, px
  exact: number; // exact V at probe, V
  approx: number; // Riemann sum (N segments), V
  segs: Segment[];
  fine: Array<{ r: number; V: number }>;
  ePeak: number; // strongest |E| on the path (at the probe), V/m
}

function computeAll(w: number, h: number, pxFrac: number, Q: number, N: number): Computed {
  const plotBottom = h - 26;
  const plotTop = plotBottom - 118;
  const fieldTop = 12;
  const fieldBottom = plotTop - 26;
  const midY = fieldTop + (fieldBottom - fieldTop) * 0.5;

  const mpp = REGION_METERS / w;
  const pxPerM = 1 / mpp;

  const refX = w - 18;
  const refR = (refX - CHARGE_X) * mpp;

  // Probe slides horizontally along the path; clamp to keep it off the charge.
  const minProbeX = CHARGE_X + MIN_GAP_PX;
  const probeX = Math.max(minProbeX, Math.min(refX - 6, pxFrac * w));
  const probeR = (probeX - CHARGE_X) * mpp;
  const plotLeftX = minProbeX;

  const kQ = PHYS.k * Q;
  const exact = kQ * (1 / probeR - 1 / refR);

  // Midpoint-rule segments from the reference (outer) inward to the probe.
  const segs: Segment[] = [];
  const dr = (probeR - refR) / N; // negative — walking inward
  let sum = 0;
  for (let i = 0; i < N; i++) {
    const r0 = refR + dr * i;
    const r1 = refR + dr * (i + 1);
    const midR = (r0 + r1) / 2;
    const eSigned = kQ / (midR * midR); // E·r̂ : +outward for +Q
    const contrib = -eSigned * dr; // −E·dℓ ; dℓ points inward (dr < 0)
    sum += contrib;
    segs.push({ r0, r1, midR, contrib, eMag: Math.abs(eSigned) });
  }
  const approx = sum;

  const fine: Array<{ r: number; V: number }> = [];
  for (let i = 0; i <= FINE; i++) {
    const r = refR + ((probeR - refR) * i) / FINE;
    fine.push({ r, V: kQ * (1 / r - 1 / refR) });
  }

  const ePeak = Math.abs(kQ / (probeR * probeR));

  return {
    fieldTop,
    fieldBottom,
    midY,
    plotTop,
    plotBottom,
    mpp,
    pxPerM,
    refR,
    probeR,
    probeX,
    refX,
    plotLeftX,
    exact,
    approx,
    segs,
    fine,
    ePeak,
  };
}

const sub = (x: number) => (x >= 0 ? '+' : '') + x.toFixed(2);

export function PotentialFromFieldDemo({ figure }: Props) {
  const [pxFrac, setPxFrac] = useState(0.34);
  const [Qn, setQn] = useState(1.5); // charge, nC
  const [N, setN] = useState(8);
  const [playing, setPlaying] = useState(true);
  const [dims, setDims] = useState({ w: 880, h: 440 });

  const Q = Qn * 1e-9;

  const stateRef = useSimState({ pxFrac, Q, N, playing });

  const readout = useMemo(() => computeAll(dims.w, dims.h, pxFrac, Q, N), [dims, pxFrac, Q, N]);

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, colors }, state, dt, _simTime, sweep: Sweep) => {
      const { pxFrac: frac, Q: q, N: n, playing: isPlaying } = state;
      const c = computeAll(w, h, frac, q, n);
      const xOfR = (r: number) => CHARGE_X + r * c.pxPerM;

      // Accumulation sweep marches from the reference (outer) inward to the
      // probe over SWEEP_SECS, holds the completed sum for HOLD_SECS, then
      // restarts. Paused → frozen in place; the reader can also drag it
      // (hit-testing + scrubbing live in the init callback below).
      if (isPlaying) {
        if (sweep.hold > 0) {
          sweep.hold = Math.max(0, sweep.hold - dt);
          if (sweep.hold === 0) sweep.frac = 0;
        } else {
          sweep.frac += dt / SWEEP_SECS;
          if (sweep.frac >= 1) {
            sweep.frac = 1;
            sweep.hold = HOLD_SECS;
          }
        }
      }
      const frac01 = Math.max(0, Math.min(1, sweep.frac));
      const sweepR = c.refR + (c.probeR - c.refR) * frac01;
      const sweepX = xOfR(sweepR);
      const kQ = PHYS.k * q;
      const vPartial = kQ * (1 / sweepR - 1 / c.refR);

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      // ── Field panel ────────────────────────────────────────────────
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, c.fieldTop, w, c.fieldBottom - c.fieldTop);
      ctx.clip();

      // Faint, unlabeled equipotential arcs centred on the charge.
      for (const f of [0.25, 0.45, 0.65, 0.85]) {
        const rp = ((c.refX - CHARGE_X) * f);
        ctx.strokeStyle = withAlpha(colors.teal, 0.12);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(CHARGE_X, c.midY, rp, -Math.PI / 2.4, Math.PI / 2.4);
        ctx.stroke();
      }

      // The integration path baseline (probe → reference).
      ctx.strokeStyle = withAlpha(colors.textMuted, 0.45);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(c.probeX, c.midY);
      ctx.lineTo(c.refX, c.midY);
      ctx.stroke();

      // Segment dividers + per-segment fill keyed to contribution size.
      const maxContrib = Math.max(1e-12, ...c.segs.map((s) => Math.abs(s.contrib)));
      for (const sg of c.segs) {
        const x0 = xOfR(sg.r0);
        const x1 = xOfR(sg.r1);
        const summed = sg.midR >= sweepR; // already passed by the sweep
        const intensity = Math.abs(sg.contrib) / maxContrib;
        const a = (summed ? 0.5 : 0.14) + intensity * (summed ? 0.45 : 0.12);
        ctx.strokeStyle = withAlpha(colors.accent, a);
        ctx.lineWidth = 3 + intensity * 3;
        ctx.beginPath();
        ctx.moveTo(x0, c.midY);
        ctx.lineTo(x1, c.midY);
        ctx.stroke();
      }
      // Tick at every segment boundary.
      for (let i = 0; i <= n; i++) {
        const r = c.refR + ((c.probeR - c.refR) * i) / n;
        const x = xOfR(r);
        ctx.fillStyle = withAlpha(colors.text, 0.5);
        ctx.beginPath();
        ctx.arc(x, c.midY, 1.7, 0, Math.PI * 2);
        ctx.fill();
      }

      // Field arrows at each segment midpoint (skip when too dense).
      if (n <= 18) {
        const dir = q >= 0 ? 1 : -1; // +Q points away from charge (+x)
        for (const sg of c.segs) {
          const x = xOfR(sg.midR);
          const len = 9 + 26 * Math.min(1, sg.eMag / c.ePeak);
          drawArrow(
            ctx,
            { x: x - dir * len * 0.5, y: c.midY - 13 },
            { x: x + dir * len * 0.5, y: c.midY - 13 },
            { color: withAlpha(colors.accent, 0.7), lineWidth: 1.3, headLength: 4, headWidth: 3 },
          );
        }
        drawLabel(ctx, {
          text: 'E along the path',
          x: c.refX,
          y: c.midY - 30,
          color: withAlpha(colors.accent, 0.7),
          align: 'right',
          baseline: 'bottom',
          size: 9,
        });
      }

      // Reference end-cap.
      drawLabel(ctx, {
        text: 'reference · V ≈ 0',
        x: c.refX,
        y: c.midY + 10,
        color: withAlpha(colors.textMuted, 0.85),
        align: 'right',
        baseline: 'top',
        size: 9,
      });

      // The charge.
      drawCharge(
        ctx,
        { x: CHARGE_X, y: c.midY },
        {
          color: q >= 0 ? colors.pink : colors.blue,
          sign: q >= 0 ? '+' : '−',
          radius: 11,
          label: `${Qn.toFixed(1)} nC`,
          textColor: colors.bg,
          labelColor: colors.textDim,
        },
      );

      // Probe handle.
      drawHandle(ctx, { x: c.probeX, y: c.midY }, { label: 'p', color: colors.yellow });

      ctx.restore(); // end field-panel clip

      // ── Accumulation panel (shares the same x-axis = distance r) ─────
      const plotW = c.refX - c.plotLeftX;
      const plotH = c.plotBottom - c.plotTop;

      const vMax = Math.max(0, c.exact * 1.1);
      const vMin = Math.min(0, c.exact * 1.1);
      const pad = Math.max(0.4, (vMax - vMin) * 0.08);
      const yMin = vMin - pad;
      const yMax = vMax + pad;
      const yOf = (v: number) => c.plotBottom - ((v - yMin) / (yMax - yMin)) * plotH;

      // Frame + zero axis.
      ctx.strokeStyle = withAlpha(colors.borderStrong, 0.7);
      ctx.lineWidth = 1;
      ctx.strokeRect(c.plotLeftX, c.plotTop, plotW, plotH);
      const zeroY = yOf(0);
      ctx.strokeStyle = withAlpha(colors.text, 0.28);
      ctx.beginPath();
      ctx.moveTo(c.plotLeftX, zeroY);
      ctx.lineTo(c.refX, zeroY);
      ctx.stroke();

      // Staircase of −E·dℓ pieces; passed bars brighten under the sweep.
      let acc = 0;
      for (const sg of c.segs) {
        const x0 = xOfR(sg.r0);
        const x1 = xOfR(sg.r1);
        const y0 = yOf(acc);
        acc += sg.contrib;
        const y1 = yOf(acc);
        const summed = sg.midR >= sweepR;
        ctx.fillStyle = withAlpha(colors.accent, summed ? 0.26 : 0.08);
        ctx.fillRect(Math.min(x0, x1), Math.min(y0, y1), Math.abs(x1 - x0) || 0.6, Math.abs(y1 - y0));
        ctx.strokeStyle = withAlpha(colors.accent, summed ? 0.85 : 0.3);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x0, y1);
        ctx.lineTo(x1, y1);
        ctx.stroke();
      }

      // Smooth exact curve V(r).
      ctx.strokeStyle = colors.teal;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      c.fine.forEach((f, i) => {
        const X = xOfR(f.r);
        const Y = yOf(f.V);
        if (i === 0) ctx.moveTo(X, Y);
        else ctx.lineTo(X, Y);
      });
      ctx.stroke();

      // ── Accumulation sweep marker (spans both panels; draggable) ─────
      ctx.strokeStyle = withAlpha(colors.yellow, isPlaying ? 0.45 : 0.7);
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(sweepX, c.fieldTop + 11);
      ctx.lineTo(sweepX, c.plotBottom);
      ctx.stroke();
      ctx.setLineDash([]);

      // Grab handle at the top of the line (signals it is draggable).
      ctx.fillStyle = colors.yellow;
      ctx.beginPath();
      ctx.arc(sweepX, c.fieldTop + 5, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = withAlpha(colors.bg, 0.85);
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // The active segment's contribution, anchored at the line.
      const active = c.segs.find((s) => sweepR <= s.r0 && sweepR >= s.r1);
      if (active) {
        drawLabel(ctx, {
          text: `−E·Δℓ = ${sub(active.contrib)} V`,
          x: sweepX + (sweepX > w * 0.6 ? -8 : 8),
          y: c.fieldBottom - 2,
          color: colors.yellow,
          align: sweepX > w * 0.6 ? 'right' : 'left',
          baseline: 'bottom',
          size: 10,
        });
      }

      // Running-total dot riding the curve at the sweep position.
      const dotY = yOf(vPartial);
      ctx.fillStyle = colors.yellow;
      ctx.beginPath();
      ctx.arc(sweepX, dotY, 3.4, 0, Math.PI * 2);
      ctx.fill();
      drawLabel(ctx, {
        text: `Σ so far ${sub(vPartial)} V`,
        x: sweepX + (sweepX > w * 0.6 ? -7 : 7),
        y: dotY - 6,
        color: colors.yellow,
        align: sweepX > w * 0.6 ? 'right' : 'left',
        baseline: 'bottom',
        size: 9,
      });

      // Axis labels.
      drawLabel(ctx, {
        text: 'V',
        x: c.plotLeftX - 6,
        y: c.plotTop + 2,
        color: colors.teal,
        align: 'right',
        baseline: 'top',
        size: 10,
      });
      drawLabel(ctx, {
        text: 'r (distance from charge)  →',
        x: c.plotLeftX + 2,
        y: c.plotBottom + 4,
        color: colors.textDim,
        align: 'left',
        baseline: 'top',
        size: 9,
      });
      drawLabel(ctx, {
        text: 'probe',
        x: c.probeX,
        y: c.plotBottom + 4,
        color: withAlpha(colors.yellow, 0.85),
        align: 'center',
        baseline: 'top',
        size: 9,
      });
    },
    [],
    (info) => {
      setDims({ w: info.w, h: info.h });
      const sweep: Sweep = { frac: 0, hold: 0 };
      let mode: 'probe' | 'sweep' | null = null;

      const geom = () => {
        const s = stateRef.current;
        return computeAll(info.w, info.h, s.pxFrac, s.Q, s.N);
      };
      // x of the sweep line for the current frac (mirrors the draw math).
      const sweepXOf = (c: Computed) =>
        CHARGE_X + (c.refR + (c.probeR - c.refR) * sweep.frac) * c.pxPerM;
      const overProbe = (mx: number, my: number, c: Computed) =>
        Math.hypot(mx - c.probeX, my - c.midY) < 16;
      const overSweep = (mx: number, my: number, c: Computed) =>
        Math.abs(mx - sweepXOf(c)) < 10 && my >= c.fieldTop && my <= c.plotBottom;
      // refX → frac 0, probeX → frac 1 (probeX < refX, so the slope is negative).
      const fracFromX = (mx: number, c: Computed) =>
        Math.max(0, Math.min(1, (mx - c.refX) / (c.probeX - c.refX)));

      const cleanup = attachCanvasDrag(info.canvas, {
        onDown(mx, my) {
          const c = geom();
          if (overProbe(mx, my, c)) {
            mode = 'probe';
            return true;
          }
          if (overSweep(mx, my, c)) {
            mode = 'sweep';
            setPlaying(false); // grabbing the line takes manual control
            sweep.frac = fracFromX(mx, c);
            return true;
          }
          return false;
        },
        onMove(mx) {
          const c = geom();
          if (mode === 'probe') setPxFrac(Math.max(0.04, Math.min(0.97, mx / info.w)));
          else if (mode === 'sweep') sweep.frac = fracFromX(mx, c);
        },
        onUp() {
          mode = null;
        },
        onHover(mx, my) {
          const c = geom();
          info.canvas.style.cursor = overProbe(mx, my, c)
            ? 'grab'
            : overSweep(mx, my, c)
              ? 'ew-resize'
              : 'default';
        },
      });

      return { context: sweep, cleanup };
    },
  );

  const err = Math.abs(readout.approx - readout.exact);

  return (
    <Demo
      figure={figure}
      title="Building V by accumulating −E·dℓ"
      question="How does the integral assemble the potential at a point from the field along the way?"
      caption={
        <>
          A point charge sits at the left; the path runs out to the draggable probe{' '}
          <em>p</em>. To find the probe&apos;s potential you walk inward from the far{' '}
          <em>reference</em> (where <M tex="V \approx 0" />) and, at every little step{' '}
          <M tex="d\vec{\ell}" />, add the work the field does on a unit charge,{' '}
          <M tex="-\vec{E}\cdot d\vec{\ell}" />. The lower panel stacks those pieces directly
          beneath the stretch of path that produced them: the amber staircase is the Riemann sum
          and the teal curve is the exact <M tex="V(r)=kQ/r" /> (minus the reference offset). The
          yellow sweep shows the running total being assembled — <em>pause</em> it and drag the
          line to read <M tex="-\vec{E}\cdot\Delta\vec{\ell}" /> and the sum so far at any point.
          Drag <em>N</em> up and the steps shrink onto the curve — the integral is the limit of
          that refinement.
        </>
      }
      deeperLab={{ slug: 'potential', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={440} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="N segments"
          value={N}
          min={1}
          max={80}
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
        <MiniToggle
          label={playing ? 'Pause sweep' : 'Play sweep'}
          checked={playing}
          onChange={setPlaying}
        />
        {/* Readouts drop to their own row (basis-full) so the inputs above —
            two sliders + the sweep toggle — read as one tidy controls group. */}
        <div className="gap-x-xl gap-y-lg flex basis-full flex-wrap items-center">
          <MiniReadout label="r_probe" value={`${(readout.probeR * 100).toFixed(1)}`} unit="cm" />
          <MiniReadout label="V exact" value={sub(readout.exact)} unit="V" />
          <MiniReadout label={`Riemann (N=${N})`} value={sub(readout.approx)} unit="V" />
          <MiniReadout label="|error|" value={err.toFixed(3)} unit="V" />
        </div>
      </DemoControls>
      <EquationStrip
        leftLabel="What the formula is (the integral)"
        left={
          <div className="flex flex-col items-center gap-1">
            <M tex={`V = -\\int_{\\text{ref}}^{p} \\vec{E} \\cdot d\\vec{\\ell}`} />
            <M
              tex={
                `= kQ\\!\\left(\\tfrac{1}{r_p}-\\tfrac{1}{r_{\\text{ref}}}\\right) = ` +
                `${sub(readout.exact)}\\ \\text{V}`
              }
            />
          </div>
        }
        rightLabel={`The sum that approximates it (N = ${N})`}
        right={
          <M
            tex={
              `-\\sum_{i=1}^{${N}} \\vec{E}_i \\cdot \\Delta\\vec{\\ell}_i ` +
              `\\approx ${sub(readout.approx)}\\ \\text{V}`
            }
          />
        }
      />
    </Demo>
  );
}
