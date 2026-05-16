/**
 * Demo 23.X — Shell-form transformer in 3D, with flux path and leakage
 *
 * A rectangular laminated core viewed through an orbital camera (drag to
 * rotate). Six helical turns of primary wrap the left leg; three helical
 * turns of secondary wrap the right leg. Inside the iron, amber flux
 * arrows route through the closed magnetic loop (left up → top → right
 * down → bottom → left). When the reader toggles "leakage" on, a sparse
 * field of teal-blue arrows shows the small fraction of flux that escapes
 * each winding through the air. A second toggle reveals an induced
 * secondary current — a pink arrow stream marching along the secondary
 * winding — that lights up whenever the primary's flux is changing.
 *
 * Readouts:
 *   V_p applied (driving the primary)
 *   V_s = V_p · (N_s / N_p)
 *   Φ      = μ₀ μ_r · N_p · I_p · A / ℓ_path
 *   k      ≈ 0.95 with leakage hidden; 0.88–0.92 with leakage on
 *
 * The whole point of the demo is to make the difference between
 *   (a) the dominant flux closing inside the iron, and
 *   (b) the small leakage flux closing through air around each winding
 * geometric — you can see one path vs the other directly.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider, MiniToggle } from '@/components/Demo';
import { Num } from '@/components/Num';
import { drawGlowPath } from '@/lib/canvasPrimitives';
import { getCanvasColors } from '@/lib/canvasTheme';
import {
  attachOrbit,
  project,
  v3,
  type OrbitCamera,
  type Point2D,
  type Vec3,
} from '@/lib/projection3d';

interface Props {
  figure?: string;
}

// ─── core geometry (world units) ────────────────────────────────────────────
// Outer rectangle of the iron core, in the x–y plane. The core is a closed
// magnetic loop with a rectangular "window" cut out of the middle.
const CORE_OUTER_X = 2.0; // half-width
const CORE_OUTER_Y = 1.3; // half-height
const LEG_THICK = 0.42; // thickness of each leg in the x–y plane
const CORE_DEPTH = 0.36; // total stack depth along z
const N_LAMINATIONS = 9; // number of laminated sheets drawn

// Position of leg centres (geometric axis of each leg).
const LEG_LEFT_X = -(CORE_OUTER_X - LEG_THICK / 2);
const LEG_RIGHT_X = +(CORE_OUTER_X - LEG_THICK / 2);
const LEG_BOT_Y = -(CORE_OUTER_Y - LEG_THICK / 2);
const LEG_TOP_Y = +(CORE_OUTER_Y - LEG_THICK / 2);

// Winding radius (how far the helix sits from the leg centreline). It must
// be larger than half the leg's xy cross-section so the helix wraps the
// leg without intersecting it.
const WIND_R = 0.42;
const PRIMARY_HELIX_HEIGHT = 1.5; // total y-extent of the primary helix
const SECONDARY_HELIX_HEIGHT = 1.5; // same for the secondary

// Approximate magnetic path length (mean iron loop perimeter).
const PATH_LENGTH = 2 * (2 * CORE_OUTER_X - LEG_THICK) + 2 * (2 * CORE_OUTER_Y - LEG_THICK);

// Effective core cross-section A = LEG_THICK · CORE_DEPTH.
const CORE_AREA = LEG_THICK * CORE_DEPTH;

// Constants for the readout (illustrative — uses μ₀·μ_r for soft iron).
const MU_0 = 4 * Math.PI * 1e-7;
const MU_R_IRON = 5000;

// Turns-ratio choices the reader can pick.
const RATIO_CHOICES: { label: string; np: number; ns: number }[] = [
  { label: '1:1', np: 6, ns: 6 },
  { label: '2:1', np: 6, ns: 3 },
  { label: '5:1', np: 10, ns: 2 },
  { label: '10:1', np: 10, ns: 1 },
];

const V_P_RMS = 240; // shown as the assumed primary voltage

// ─── helper: build the iron rectangular-window cross-section as a polygon ───
function corePolygonOuter(): { x: number; y: number }[] {
  return [
    { x: -CORE_OUTER_X, y: -CORE_OUTER_Y },
    { x: CORE_OUTER_X, y: -CORE_OUTER_Y },
    { x: CORE_OUTER_X, y: CORE_OUTER_Y },
    { x: -CORE_OUTER_X, y: CORE_OUTER_Y },
  ];
}
function corePolygonInner(): { x: number; y: number }[] {
  const ix = CORE_OUTER_X - LEG_THICK;
  const iy = CORE_OUTER_Y - LEG_THICK;
  return [
    { x: -ix, y: -iy },
    { x: ix, y: -iy },
    { x: ix, y: iy },
    { x: -ix, y: iy },
  ];
}

// Helix path around a vertical leg. Returns 3D points sampled along the
// helix. Axis runs along +y through (legX, *, 0). The helix radius is
// WIND_R and lies in the x–z plane.
function helixAroundLeg(
  legX: number,
  turns: number,
  height: number,
  samplesPerTurn: number,
  phase: number = 0,
): Vec3[] {
  const out: Vec3[] = [];
  const total = turns * samplesPerTurn;
  for (let i = 0; i <= total; i++) {
    const u = i / total; // 0..1 along the helix
    const theta = u * turns * Math.PI * 2 + phase;
    const y = -height / 2 + u * height;
    const x = legX + WIND_R * Math.cos(theta);
    const z = WIND_R * Math.sin(theta);
    out.push(v3(x, y, z));
  }
  return out;
}

export function TransformerFlux3DDemo({ figure }: Props) {
  const [Ip, setIp] = useState(2.0);
  const [ratioIdx, setRatioIdx] = useState(1); // 2:1 default
  const [showLeakage, setShowLeakage] = useState(false);
  const [showFlux, setShowFlux] = useState(true);
  const [showSecCurrent, setShowSecCurrent] = useState(true);

  const ratio = RATIO_CHOICES[ratioIdx]!;
  const Np = ratio.np;
  const Ns = ratio.ns;

  const computed = useMemo(() => {
    const Vp = V_P_RMS;
    const Vs = Vp * (Ns / Np);
    // Φ = μ · N · I · A / ℓ  (Ampere's law for a magnetic circuit)
    const phi = (MU_0 * MU_R_IRON * Np * Ip * CORE_AREA) / PATH_LENGTH;
    const k = showLeakage ? 0.9 : 0.95;
    return { Vp, Vs, phi, k };
  }, [Ip, Np, Ns, showLeakage]);

  const stateRef = useRef({ Ip, Np, Ns, showLeakage, showFlux, showSecCurrent });
  useEffect(() => {
    stateRef.current = { Ip, Np, Ns, showLeakage, showFlux, showSecCurrent };
  }, [Ip, Np, Ns, showLeakage, showFlux, showSecCurrent]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w: W, h: H, canvas } = info;
    let raf = 0;
    const cam: OrbitCamera = { yaw: 0.55, pitch: 0.22, distance: 7.5, fov: Math.PI / 4 };
    const dispose = attachOrbit(canvas, cam);
    let t = 0;
    let last = performance.now();

    // Project a polyline of 3D points to screen, returning only the segments
    // where both ends are in front of the camera. Returns an array of
    // contiguous 2D polylines (one per visible segment-run).
    function projectPolyline(pts: Vec3[]): Point2D[][] {
      const segs: Point2D[][] = [];
      let cur: Point2D[] = [];
      for (const p of pts) {
        const sp = project(p, cam, W, H);
        if (sp.depth <= 0) {
          if (cur.length > 1) segs.push(cur);
          cur = [];
        } else {
          cur.push(sp);
        }
      }
      if (cur.length > 1) segs.push(cur);
      return segs;
    }

    function drawArrow2D(
      p1: Point2D,
      p2: Point2D,
      color: string,
      lineWidth: number,
      glow: boolean,
    ) {
      if (glow) {
        drawGlowPath(ctx, [p1, p2], {
          color,
          lineWidth,
          glowColor: color.replace(/[\d.]+\)$/, '0.30)'),
          glowWidth: lineWidth + 5,
        });
      } else {
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
      const dx = p2.x - p1.x,
        dy = p2.y - p1.y;
      const len = Math.hypot(dx, dy);
      if (len < 3) return;
      const ux = dx / len,
        uy = dy / len;
      const head = glow ? 8 : 6;
      const half = glow ? 4 : 3;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(p2.x, p2.y);
      ctx.lineTo(p2.x - ux * head - uy * half, p2.y - uy * head + ux * half);
      ctx.lineTo(p2.x - ux * head + uy * half, p2.y - uy * head - ux * half);
      ctx.closePath();
      ctx.fill();
    }

    function drawArrow3D(from: Vec3, to: Vec3, color: string, lineWidth: number, glow: boolean) {
      const p1 = project(from, cam, W, H);
      const p2 = project(to, cam, W, H);
      if (p1.depth <= 0 || p2.depth <= 0) return;
      drawArrow2D(p1, p2, color, lineWidth, glow);
    }

    // Draw one lamination plate: outer rectangle minus inner window, at fixed z.
    function drawLamination(z: number, depthAvg: number) {
      const fade = Math.max(0.18, Math.min(0.85, (cam.distance + 1.5 - depthAvg) / 3.5));
      const outer = corePolygonOuter();
      const inner = corePolygonInner();
      const outerScreen = outer.map((p) => project(v3(p.x, p.y, z), cam, W, H));
      const innerScreen = inner.map((p) => project(v3(p.x, p.y, z), cam, W, H));
      if (outerScreen.some((p) => p.depth <= 0)) return;

      // Filled silhouette: outer rect with inner rect punched out (even-odd).
      ctx.save();
      ctx.fillStyle = `rgba(60,58,52,${(0.55 * fade).toFixed(3)})`;
      ctx.strokeStyle = `rgba(180,176,164,${(0.55 * fade).toFixed(3)})`;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      // Outer ring
      ctx.moveTo(outerScreen[0]!.x, outerScreen[0]!.y);
      for (let i = 1; i < 4; i++) ctx.lineTo(outerScreen[i]!.x, outerScreen[i]!.y);
      ctx.closePath();
      // Inner window (reverse winding for even-odd hole)
      ctx.moveTo(innerScreen[0]!.x, innerScreen[0]!.y);
      for (let i = 3; i >= 1; i--) ctx.lineTo(innerScreen[i]!.x, innerScreen[i]!.y);
      ctx.closePath();
      ctx.fill('evenodd');
      ctx.stroke();
      ctx.restore();
    }

    function draw() {
      const now = performance.now();
      let dt = (now - last) / 1000;
      last = now;
      if (dt > 0.1) dt = 0.1;
      t += dt;
      const st = stateRef.current;

      ctx.fillStyle = getCanvasColors().bg;
      ctx.fillRect(0, 0, W, H);

      // ── 1) lamination stack (painter back-to-front along z) ──
      const zs: number[] = [];
      for (let i = 0; i < N_LAMINATIONS; i++) {
        zs.push(-CORE_DEPTH / 2 + (i + 0.5) * (CORE_DEPTH / N_LAMINATIONS));
      }
      // Depth-sort by projected depth at origin.
      const lamOrder = zs
        .map((z) => ({ z, d: project(v3(0, 0, z), cam, W, H).depth }))
        .sort((a, b) => b.d - a.d);
      for (const lam of lamOrder) drawLamination(lam.z, lam.d);

      // ── 2) flux loop through the iron ──
      if (st.showFlux) {
        const midZ = 0;
        // Inside-of-iron radius (centre of each leg, but a hair inward
        // from the leg centre line so the arrows visually sit inside iron).
        const arrowsPerLeg = 3;
        const arrowsPerBar = 4;
        const fluxPts: Vec3[] = [];

        // Left leg: bottom → top (flux going up)
        for (let i = 0; i < arrowsPerLeg; i++) {
          const u = (i + 0.5) / arrowsPerLeg;
          fluxPts.push(v3(LEG_LEFT_X, LEG_BOT_Y + u * (LEG_TOP_Y - LEG_BOT_Y), midZ));
        }
        // Top bar: left → right
        for (let i = 0; i < arrowsPerBar; i++) {
          const u = (i + 0.5) / arrowsPerBar;
          fluxPts.push(v3(LEG_LEFT_X + u * (LEG_RIGHT_X - LEG_LEFT_X), LEG_TOP_Y, midZ));
        }
        // Right leg: top → bottom
        for (let i = 0; i < arrowsPerLeg; i++) {
          const u = (i + 0.5) / arrowsPerLeg;
          fluxPts.push(v3(LEG_RIGHT_X, LEG_TOP_Y - u * (LEG_TOP_Y - LEG_BOT_Y), midZ));
        }
        // Bottom bar: right → left
        for (let i = 0; i < arrowsPerBar; i++) {
          const u = (i + 0.5) / arrowsPerBar;
          fluxPts.push(v3(LEG_RIGHT_X - u * (LEG_RIGHT_X - LEG_LEFT_X), LEG_BOT_Y, midZ));
        }

        // Animation: walk the chevron arrows along the loop.
        const intensity = Math.min(1, 0.25 + 0.15 * st.Ip);
        const arrowLen = 0.36;
        // For each station, place an arrow whose direction follows the
        // local tangent of the closed loop (left up → top right →
        // right down → bottom left).
        const segs = fluxPts.length;
        const phaseShift = (t * 0.6) % 1;
        for (let i = 0; i < segs; i++) {
          const fp = fluxPts[i]!;
          // Local tangent.
          let tx = 0,
            ty = 0;
          if (
            Math.abs(fp.x - LEG_LEFT_X) < 0.01 &&
            fp.y > LEG_BOT_Y + 0.05 &&
            fp.y < LEG_TOP_Y - 0.05
          ) {
            ty = 1;
          } else if (
            Math.abs(fp.x - LEG_RIGHT_X) < 0.01 &&
            fp.y > LEG_BOT_Y + 0.05 &&
            fp.y < LEG_TOP_Y - 0.05
          ) {
            ty = -1;
          } else if (Math.abs(fp.y - LEG_TOP_Y) < 0.01) {
            tx = 1;
          } else if (Math.abs(fp.y - LEG_BOT_Y) < 0.01) {
            tx = -1;
          }
          // Twinkle phase: each station blinks in turn so the eye reads a
          // travelling chevron around the loop.
          const stationPhase = (i / segs + phaseShift) % 1;
          const twinkle = 0.55 + 0.45 * Math.cos(2 * Math.PI * stationPhase);
          const alpha = (0.45 + 0.5 * intensity) * twinkle;
          const from = v3(fp.x - (tx * arrowLen) / 2, fp.y - (ty * arrowLen) / 2, fp.z);
          const to = v3(fp.x + (tx * arrowLen) / 2, fp.y + (ty * arrowLen) / 2, fp.z);
          drawArrow3D(from, to, `rgba(255,107,42,${alpha.toFixed(3)})`, 2.0, true);
        }

        // Φ label near the top bar.
        const lp = project(v3(0, LEG_TOP_Y + 0.25, 0), cam, W, H);
        if (lp.depth > 0) {
          ctx.fillStyle = getCanvasColors().accent;
          ctx.font = 'italic 12px "STIX Two Text", serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('Φ (core)', lp.x, lp.y);
        }
      }

      // ── 3) primary winding (helix around left leg) ──
      const primaryPts = helixAroundLeg(LEG_LEFT_X, st.Np, PRIMARY_HELIX_HEIGHT, 36);
      for (const segPath of projectPolyline(primaryPts)) {
        drawGlowPath(ctx, segPath, {
          color: 'rgba(255,59,110,0.92)',
          lineWidth: 1.7,
          glowColor: 'rgba(255,59,110,0.28)',
          glowWidth: 5,
        });
      }

      // ── 4) secondary winding (helix around right leg) ──
      const secondaryPts = helixAroundLeg(
        LEG_RIGHT_X,
        st.Ns,
        SECONDARY_HELIX_HEIGHT,
        36,
        Math.PI / 4,
      );
      for (const segPath of projectPolyline(secondaryPts)) {
        drawGlowPath(ctx, segPath, {
          color: 'rgba(91,174,248,0.92)',
          lineWidth: 1.7,
          glowColor: 'rgba(91,174,248,0.28)',
          glowWidth: 5,
        });
      }

      // ── 5) induced secondary current animation ──
      // March a bright pink dot along the secondary helix to visualise
      // induced current flow. Only shown when the toggle is on AND there
      // is primary current to drive it.
      if (st.showSecCurrent && st.Ip > 0.05) {
        const ratioMag = st.Np / Math.max(1, st.Ns);
        // Animate a few "wave-packet" chevrons sliding along the secondary
        // wire. Each packet samples a short slice of the helix as a
        // polyline, then drawGlowPath strokes it. The pink colour matches
        // the primary winding to suggest "this is the same energy on the
        // other side."
        const packets = 3;
        for (let k = 0; k < packets; k++) {
          const base = (t * 0.18 + k / packets) % 1;
          // Sample a sub-stretch of ~7% of the helix as one packet.
          const lo = Math.max(0, base - 0.035);
          const hi = Math.min(1, base + 0.035);
          const iLo = Math.floor(lo * (secondaryPts.length - 1));
          const iHi = Math.ceil(hi * (secondaryPts.length - 1));
          const slice = secondaryPts.slice(iLo, iHi + 1);
          if (slice.length < 2) continue;
          for (const segPath of projectPolyline(slice)) {
            drawGlowPath(ctx, segPath, {
              color: `rgba(255,107,42,${(0.85).toFixed(3)})`,
              lineWidth: 2.4,
              glowColor: 'rgba(255,107,42,0.45)',
              glowWidth: 8,
            });
          }
          // Arrowhead at the leading edge of the packet.
          const headIdx = Math.min(secondaryPts.length - 1, iHi);
          const tailIdx = Math.max(0, headIdx - 2);
          const ph = project(secondaryPts[headIdx]!, cam, W, H);
          const pt = project(secondaryPts[tailIdx]!, cam, W, H);
          if (ph.depth > 0 && pt.depth > 0) {
            const dx = ph.x - pt.x,
              dy = ph.y - pt.y;
            const len = Math.hypot(dx, dy);
            if (len > 2) {
              const ux = dx / len,
                uy = dy / len;
              ctx.fillStyle = getCanvasColors().accent;
              ctx.beginPath();
              ctx.moveTo(ph.x, ph.y);
              ctx.lineTo(ph.x - ux * 8 - uy * 4, ph.y - uy * 8 + ux * 4);
              ctx.lineTo(ph.x - ux * 8 + uy * 4, ph.y - uy * 8 - ux * 4);
              ctx.closePath();
              ctx.fill();
            }
          }
        }
        // Scale-by-magnitude annotation in a corner.
        ctx.fillStyle = getCanvasColors().accent;
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.fillText(`I_s = ${(st.Ip * ratioMag).toFixed(2)} A`, W - 12, 60);
      }

      // ── 6) leakage flux (small arrows escaping into air around each winding) ──
      if (st.showLeakage) {
        const intensity = Math.min(1, 0.4 + 0.12 * st.Ip);
        // For each winding, place a few leakage arrows that loop out of
        // the leg through the air on the side facing AWAY from the core
        // (the "free" side of each winding).
        const leakSpec: { legX: number; outwardX: number }[] = [
          { legX: LEG_LEFT_X, outwardX: -1 }, // primary: bows out to the left
          { legX: LEG_RIGHT_X, outwardX: +1 }, // secondary: bows out to the right
        ];
        for (const ls of leakSpec) {
          const NLEAK = 4;
          for (let i = 0; i < NLEAK; i++) {
            const u = (i + 0.5) / NLEAK;
            const y = -PRIMARY_HELIX_HEIGHT / 2 + u * PRIMARY_HELIX_HEIGHT;
            // Short curved arc that exits the winding sideways into the
            // air, sampled as a polyline.
            const arc: Vec3[] = [];
            const ARC_N = 12;
            for (let j = 0; j <= ARC_N; j++) {
              const s = j / ARC_N; // 0..1 along arc
              const theta = Math.PI * s; // half-circle in x-y plane
              const arcR = 0.45;
              const ax = ls.legX + ls.outwardX * (WIND_R + 0.05 + arcR * Math.sin(theta));
              const ay = y + arcR * 0.7 * (1 - Math.cos(theta)) - 0.0;
              arc.push(v3(ax, ay, 0));
            }
            const alpha = 0.38 + 0.25 * intensity;
            for (const segPath of projectPolyline(arc)) {
              drawGlowPath(ctx, segPath, {
                color: `rgba(108,197,194,${alpha.toFixed(3)})`,
                lineWidth: 1.4,
                glowColor: 'rgba(108,197,194,0.22)',
                glowWidth: 4,
              });
            }
            // Small arrowhead at the tip (last point in the arc).
            if (arc.length >= 2) {
              const ph = project(arc[arc.length - 1]!, cam, W, H);
              const pt = project(arc[arc.length - 2]!, cam, W, H);
              if (ph.depth > 0 && pt.depth > 0) {
                const dx = ph.x - pt.x,
                  dy = ph.y - pt.y;
                const len = Math.hypot(dx, dy);
                if (len > 2) {
                  const ux = dx / len,
                    uy = dy / len;
                  ctx.fillStyle = `rgba(108,197,194,${alpha.toFixed(3)})`;
                  ctx.beginPath();
                  ctx.moveTo(ph.x, ph.y);
                  ctx.lineTo(ph.x - ux * 6 - uy * 3, ph.y - uy * 6 + ux * 3);
                  ctx.lineTo(ph.x - ux * 6 + uy * 3, ph.y - uy * 6 - ux * 3);
                  ctx.closePath();
                  ctx.fill();
                }
              }
            }
          }
        }
        // "leakage" label.
        const lp = project(v3(LEG_LEFT_X - 0.95, 0, 0), cam, W, H);
        if (lp.depth > 0) {
          ctx.fillStyle = 'rgba(108,197,194,0.82)';
          ctx.font = 'italic 11px "STIX Two Text", serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('Φ_leak', lp.x, lp.y);
        }
      }

      // ── labels (corner annotations) ──
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillStyle = getCanvasColors().textDim;
      ctx.fillText('drag to rotate', 12, 12);
      ctx.fillStyle = 'rgba(160,158,149,0.6)';
      ctx.fillText('laminated iron core', 12, 28);

      ctx.textAlign = 'right';
      ctx.fillStyle = getCanvasColors().pink;
      ctx.fillText(`primary  N_p = ${st.Np}`, W - 12, 12);
      ctx.fillStyle = getCanvasColors().blue;
      ctx.fillText(`secondary  N_s = ${st.Ns}`, W - 12, 28);
      if (st.showFlux) {
        ctx.fillStyle = getCanvasColors().accent;
        ctx.fillText('Φ through iron', W - 12, 44);
      }

      raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      dispose();
    };
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 23.X'}
      title="Shell-form transformer in 3D — the flux path and what escapes it"
      question="Where does the flux actually go, and how much of it never makes it from one coil to the other?"
      caption={
        <>
          Drag the core to rotate. The pink helix on the left leg is the primary, the blue helix on
          the right leg is the secondary, and amber chevrons inside the iron trace the closed
          magnetic loop that ties them together. Toggle "leakage" on to see the teal arcs that
          escape each winding through the air — that small fraction of flux that never reaches the
          other coil is what makes the coupling coefficient k slightly less than one in a real
          transformer.
        </>
      }
      deeperLab={{ slug: 'inductance', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={420} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="I_p"
          value={Ip}
          min={0}
          max={10}
          step={0.1}
          format={(v) => v.toFixed(1) + ' A'}
          onChange={setIp}
        />
        <MiniSlider
          label="ratio N_p:N_s"
          value={ratioIdx}
          min={0}
          max={RATIO_CHOICES.length - 1}
          step={1}
          format={(v) => RATIO_CHOICES[Math.round(v)]!.label}
          onChange={(v) => setRatioIdx(Math.round(v))}
        />
        <MiniToggle label="flux in core" checked={showFlux} onChange={setShowFlux} />
        <MiniToggle label="leakage flux" checked={showLeakage} onChange={setShowLeakage} />
        <MiniToggle label="induced I_s" checked={showSecCurrent} onChange={setShowSecCurrent} />
        <MiniReadout label="V_p" value={computed.Vp.toFixed(0)} unit="V" />
        <MiniReadout label="V_s = V_p · N_s/N_p" value={computed.Vs.toFixed(1)} unit="V" />
        <MiniReadout label="Φ" value={<Num value={computed.phi} />} unit="Wb" />
        <MiniReadout label="k (coupling)" value={computed.k.toFixed(2)} />
      </DemoControls>
    </Demo>
  );
}
