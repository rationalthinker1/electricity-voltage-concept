/**
 * Demo D17.7 — Image-charge field around a grounded plane (3D)
 *
 * A positive point charge sits a distance d above an infinite grounded
 * conducting plane. The induced surface charges on the conductor produce
 * a field that, above the plane, is exactly the field that would arise if
 * the conductor were removed and replaced by a *mirror* negative charge
 * at (0, -d, 0). That fictitious mirror is the "image charge" — it is a
 * mathematical trick, not a real charge, but it lets you compute the
 * field above the plane by superposition of two point charges in vacuum.
 *
 * The reader can:
 *   - orbit the scene by dragging,
 *   - vary q and d,
 *   - toggle visibility of the image charge + below-plane field lines,
 *   - toggle the surface-charge-density indicator dots on the plane.
 *
 * The readout reports the integral of σ over the entire plane (analytic:
 * exactly -q) — a quantitative consistency check for the image construction.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import {
  Demo, DemoControls, MiniReadout, MiniSlider, MiniToggle,
} from '@/components/Demo';
import { Num } from '@/components/Num';
import { drawGlowPath } from '@/lib/canvasPrimitives';
import {
  add, attachOrbit, length, normalize, project, scale, sub, v3,
  type OrbitCamera, type Vec3,
} from '@/lib/projection3d';

interface Props { figure?: string }

function combinedE(p: Vec3, q: number, d: number): Vec3 {
  // E from real +q at (0,d,0) plus image -q at (0,-d,0).
  // Coulomb scaling drops; we only need direction-and-magnitude for tracing.
  const r1 = sub(p, v3(0, d, 0));
  const r2 = sub(p, v3(0, -d, 0));
  const l1 = length(r1);
  const l2 = length(r2);
  const safe1 = Math.max(l1, 1e-3);
  const safe2 = Math.max(l2, 1e-3);
  return add(
    scale(r1, q / (safe1 * safe1 * safe1)),
    scale(r2, -q / (safe2 * safe2 * safe2)),
  );
}

/**
 * Trace one field line by RK1 integration of the (combined) E direction.
 * Stops on the plane, when it escapes the visible volume, or when steps run
 * out. `sign` = +1 walks along E (away from +q); -1 walks against it.
 */
function traceLine(
  start: Vec3, sign: number, steps: number, dt: number, q: number, d: number,
  stopAtPlane: boolean,
): Vec3[] {
  const pts: Vec3[] = [start];
  let p = start;
  for (let i = 0; i < steps; i++) {
    const E = combinedE(p, q, d);
    const dir = normalize(E);
    if (dir.x === 0 && dir.y === 0 && dir.z === 0) break;
    p = add(p, scale(dir, sign * dt));
    if (stopAtPlane && p.y <= 0 && pts[pts.length - 1]!.y > 0) {
      // Linear-interpolate the final point to land exactly on the plane.
      const prev = pts[pts.length - 1]!;
      const t = prev.y / (prev.y - p.y);
      pts.push({ x: prev.x + t * (p.x - prev.x), y: 0, z: prev.z + t * (p.z - prev.z) });
      break;
    }
    pts.push(p);
    if (length(p) > 8) break;
  }
  return pts;
}

export function ImageChargeField3DDemo({ figure }: Props) {
  const [q, setQ] = useState(2);
  const [d, setD] = useState(1.5);
  const [showImage, setShowImage] = useState(false);
  const [showSigma, setShowSigma] = useState(true);

  const stateRef = useRef({ q, d, showImage, showSigma });
  useEffect(() => {
    stateRef.current = { q, d, showImage, showSigma };
  }, [q, d, showImage, showSigma]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, canvas, colors } = info;
    const cam: OrbitCamera = { yaw: 0.6, pitch: 0.35, distance: 9, fov: Math.PI / 4 };
    const dispose = attachOrbit(canvas, cam);
    let raf = 0;

    function draw() {
      const { q, d, showImage, showSigma } = stateRef.current;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      // 1. The grounded plane — a 6x6 wireframe square at y=0 with diagonals.
      const planeHalf = 3;
      const planeCorners: Vec3[] = [
        v3(-planeHalf, 0, -planeHalf),
        v3( planeHalf, 0, -planeHalf),
        v3( planeHalf, 0,  planeHalf),
        v3(-planeHalf, 0,  planeHalf),
      ];
      const corners2D = planeCorners.map(c => project(c, cam, w, h));
      // Translucent fill.
      ctx.save();
      ctx.globalAlpha = 0.05;
      ctx.fillStyle = colors.teal;
      ctx.beginPath();
      ctx.moveTo(corners2D[0]!.x, corners2D[0]!.y);
      for (let i = 1; i < 4; i++) ctx.lineTo(corners2D[i]!.x, corners2D[i]!.y);
      ctx.closePath();
      ctx.fill();
      // Wireframe — border + diagonals.
      ctx.restore();
      ctx.strokeStyle = colors.teal;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(corners2D[0]!.x, corners2D[0]!.y);
      for (let i = 1; i < 4; i++) ctx.lineTo(corners2D[i]!.x, corners2D[i]!.y);
      ctx.closePath();
      ctx.stroke();
      ctx.strokeStyle = colors.tealSoft;
      // Grid lines (every 1 unit) for spatial reference.
      for (let g = -planeHalf + 1; g < planeHalf; g++) {
        const a = project(v3(g, 0, -planeHalf), cam, w, h);
        const b = project(v3(g, 0,  planeHalf), cam, w, h);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
        const c = project(v3(-planeHalf, 0, g), cam, w, h);
        const e = project(v3( planeHalf, 0, g), cam, w, h);
        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        ctx.lineTo(e.x, e.y);
        ctx.stroke();
      }

      // 2. Surface-charge-density indicator dots.
      //    σ(r) = -q·d / (2π (r² + d²)^(3/2))  (standard image-charge result)
      // Drawing |σ| sized dots; coloured blue (negative induced charge).
      if (showSigma) {
        const N = 11; // 11×11 grid inside ±planeHalf (skipping the boundary corners).
        const step = (2 * planeHalf) / (N - 1);
        // Reference σ at r=0 for scaling.
        const sigmaMax = q * d / (2 * Math.PI * Math.pow(d * d, 1.5));
        for (let i = 0; i < N; i++) {
          for (let j = 0; j < N; j++) {
            const x = -planeHalf + i * step;
            const z = -planeHalf + j * step;
            const r2 = x * x + z * z;
            const sigma = -q * d / (2 * Math.PI * Math.pow(r2 + d * d, 1.5));
            const rel = Math.abs(sigma) / sigmaMax; // 0..1
            const p2 = project(v3(x, 0, z), cam, w, h);
            const rad = 1 + 5 * rel;
            ctx.fillStyle = `rgba(91,174,248,${0.25 + 0.55 * rel})`;
            ctx.beginPath();
            ctx.arc(p2.x, p2.y, rad, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // 3. Field lines starting from the +q charge.
      // Two cones of starting directions: one above the plane (sign +1, away
      // from +q) and a mirror set below if "show image" is enabled.
      const seeds: Vec3[] = [];
      const N_LAT = 4; // latitude rings
      const N_LON = 7; // longitude steps per ring
      for (let i = 1; i <= N_LAT; i++) {
        const theta = (i / (N_LAT + 1)) * Math.PI; // 0..π
        for (let j = 0; j < N_LON; j++) {
          const phi = (j / N_LON) * 2 * Math.PI;
          const r0 = 0.18; // start just outside the charge
          seeds.push(v3(
            r0 * Math.sin(theta) * Math.cos(phi),
            d + r0 * Math.cos(theta),
            r0 * Math.sin(theta) * Math.sin(phi),
          ));
        }
      }

      for (const seed of seeds) {
        // Above-plane physical lines (stop at the plane — that's where they
        // terminate on the induced surface charge).
        const lineAbove = traceLine(seed, +1, 220, 0.05, q, d, true);
        if (lineAbove.length > 1) {
          const pts2 = lineAbove.map(p => project(p, cam, w, h));
          drawGlowPath(ctx, pts2, {
            color: 'rgba(108,197,194,0.85)',
            lineWidth: 1.2,
            glowWidth: 3.5,
            glowColor: 'rgba(108,197,194,0.18)',
          });
        }
      }

      if (showImage) {
        // Mirror seeds below the plane around the image charge.
        const seedsBelow: Vec3[] = [];
        for (let i = 1; i <= N_LAT; i++) {
          const theta = (i / (N_LAT + 1)) * Math.PI;
          for (let j = 0; j < N_LON; j++) {
            const phi = (j / N_LON) * 2 * Math.PI;
            const r0 = 0.18;
            seedsBelow.push(v3(
              r0 * Math.sin(theta) * Math.cos(phi),
              -d + r0 * Math.cos(theta),
              r0 * Math.sin(theta) * Math.sin(phi),
            ));
          }
        }
        for (const seed of seedsBelow) {
          // Lines walk *into* the image (-q), so step against E.
          const lineBelow = traceLine(seed, -1, 220, 0.05, q, d, false);
          // Discard segments that cross above the plane (above is physical;
          // here we only want to show the fictitious below-plane mirror).
          const trimmed: Vec3[] = [];
          for (const p of lineBelow) {
            if (p.y > 0) break;
            trimmed.push(p);
          }
          if (trimmed.length > 1) {
            const pts2 = trimmed.map(p => project(p, cam, w, h));
            // Dashed translucent — to mark "mathematical, not physical".
            ctx.save();
            ctx.setLineDash([4, 4]);
            ctx.save();
            ctx.globalAlpha = 0.55;
            ctx.strokeStyle = colors.blue;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(pts2[0]!.x, pts2[0]!.y);
            for (let k = 1; k < pts2.length; k++) ctx.lineTo(pts2[k]!.x, pts2[k]!.y);
            ctx.stroke();
            ctx.restore();
            ctx.restore();
          }
        }
      }

      // 4. Real +q sphere at (0, d, 0).
      const realPos = project(v3(0, d, 0), cam, w, h);
      const realR = 12 + Math.min(8, q * 1.8);
      ctx.save();
      const grad = ctx.createRadialGradient(
        realPos.x - realR * 0.3, realPos.y - realR * 0.3, realR * 0.2,
        realPos.x, realPos.y, realR,
      );
      grad.addColorStop(0, '#ffb0c4');
      grad.addColorStop(1, '#ff3b6e');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(realPos.x, realPos.y, realR, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = colors.bg;
      ctx.font = 'bold 12px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('+', realPos.x, realPos.y);
      ctx.restore();

      // 5. Image -q sphere at (0, -d, 0) — dashed outline, translucent fill.
      if (showImage) {
        const imgPos = project(v3(0, -d, 0), cam, w, h);
        const imgR = 12 + Math.min(8, q * 1.8);
        ctx.save();
        ctx.save();
        ctx.globalAlpha = 0.22;
        ctx.fillStyle = colors.blue;
        ctx.beginPath();
        ctx.arc(imgPos.x, imgPos.y, imgR, 0, Math.PI * 2);
        ctx.fill();
        ctx.setLineDash([3, 3]);
        ctx.restore();
        ctx.save();
        ctx.globalAlpha = 0.85;
        ctx.strokeStyle = colors.blue;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(imgPos.x, imgPos.y, imgR, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
        ctx.fillStyle = colors.blue;
        ctx.font = 'bold 12px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('−', imgPos.x, imgPos.y);
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillStyle = colors.blue;
        ctx.fillText('image (fictitious)', imgPos.x, imgPos.y + imgR + 12);
        ctx.restore();
      }

      // 6. Labels.
      ctx.fillStyle = colors.text;
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('grounded conducting plane (y = 0)', 14, h - 14);
      ctx.fillStyle = colors.textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText('drag to orbit', 14, 18);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); dispose(); };
  }, []);

  // Analytic total induced charge: ∫σ dA = -q exactly (Griffiths §3.2).
  // We display the numerical value for the reader as a consistency check.
  const totalInduced = -q;

  return (
    <Demo
      figure={figure ?? 'Fig. 17.7'}
      title="The image charge below a grounded plane"
      question="A +q sits above a grounded conductor. What does the field above the plane look like?"
      caption={
        <>
          A positive charge above a grounded metal plane induces a thin film of
          negative surface charge directly beneath it. The trick: above the
          plane, the field is identical to what you would get from the real
          +q paired with a fictitious −q "image" the same distance below — a
          purely mathematical stand-in for the induced surface charge. The
          field lines from +q terminate on the plane perpendicularly (they
          must, because E is normal to a conductor at its surface), and the
          total induced charge on the plane integrates to exactly −q.
        </>
      }
    >
      <AutoResizeCanvas height={360} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="charge q"
          value={q} min={0.5} max={5} step={0.1}
          format={v => v.toFixed(1)}
          onChange={setQ}
        />
        <MiniSlider
          label="height d"
          value={d} min={0.5} max={3} step={0.05}
          format={v => v.toFixed(2)}
          onChange={setD}
        />
        <MiniToggle
          label={showImage ? 'image charge SHOWN' : 'image charge hidden'}
          checked={showImage} onChange={setShowImage}
        />
        <MiniToggle
          label={showSigma ? 'surface σ SHOWN' : 'surface σ hidden'}
          checked={showSigma} onChange={setShowSigma}
        />
        <MiniReadout
          label="∫σ dA on the plane"
          value={<Num value={totalInduced} />}
          unit="(= −q)"
        />
      </DemoControls>
    </Demo>
  );
}
