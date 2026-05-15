/**
 * Demo D3.x — Drift in copper (3D)
 *
 * A horizontal copper wire rendered as a translucent cylinder, viewed
 * through an orbital camera (drag to rotate). Inside the wire ~50 cyan
 * electrons execute random-walk thermal motion plus a tiny drift bias
 * along +x. The pedagogical point: the thermal speed v_th is roughly
 * 10^10 times the drift speed v_d. The visual exaggerates both so the
 * jitter is visible, but the *ratio* is preserved and the readouts
 * always show the real physical numbers.
 *
 * Sliders
 *   I  — current (0.1–10 A). Drift v_d scales linearly with I.
 *   T  — temperature (100–400 K). Thermal v_th = √(3k_BT/m_e) scales as √T.
 *
 * Toggles
 *   drift arrows — small short arrow on every electron showing its mean
 *                  +x drift bias.
 *   ion lattice  — sparse 3D grid of static amber ion-spheres behind the
 *                  moving electrons.
 *
 * Readouts
 *   v_d  — real drift velocity, m/s.
 *   v_th — real RMS thermal speed, m/s.
 *   v_th / v_d — the astonishing ratio (~10^10 at room temperature).
 *
 * Geometry & projection share src/lib/projection3d.ts with the Phase-5
 * 3D demos (PoyntingCoax3D, WireToAntennaTransition3D).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider, MiniToggle } from '@/components/Demo';
import { Num } from '@/components/Num';
import { drawGlowPath } from '@/lib/canvasPrimitives';
import { MATERIALS, PHYS } from '@/lib/physics';
import { getCanvasColors } from '@/lib/canvasTheme';
import {
  attachOrbit, project, v3,
  type OrbitCamera, type Vec3,
} from '@/lib/projection3d';

interface Props { figure?: string }

// Wire geometry, world units. Cylinder runs along x; radius is in y-z.
const X_HALF = 2.2;
const R_WIRE = 0.55;

// Particle counts.
const N_ELECTRONS = 56;
const N_IONS_AXIAL = 6;
const N_IONS_RADIAL = 3;
const N_IONS_AZIM = 6;

// Reference current/temperature used to scale the visual drift bias so
// the ratio v_th/v_d is preserved across slider sweeps (real ratio is
// ~10^10, way too extreme to draw). The visual ratio is roughly 80:1.
const I_REF = 3;          // A
const T_REF = 300;        // K
const VIS_THERMAL = 0.045;   // world-units per frame at T_REF (per axis std-dev)
const VIS_DRIFT = 5.5e-4;    // world-units per frame at I_REF (mean +x step)

interface Electron {
  pos: Vec3;
  // Latest velocity (world-units/frame), used only for short arrow tails.
  vx: number; vy: number; vz: number;
}

interface DrawItem {
  kind: 'electron' | 'ion';
  depth: number;
  proj: { x: number; y: number; depth: number };
  // Electron-only extras.
  arrowTip?: { x: number; y: number; depth: number };
}

export function DriftInCopper3DDemo({ figure }: Props) {
  const [I, setI] = useState(3);
  const [T, setT] = useState(300);
  const [showArrows, setShowArrows] = useState(true);
  const [showLattice, setShowLattice] = useState(true);

  // Real physics.
  const computed = useMemo(() => {
    // Copper, 2.5 mm² (matches DriftVelocityDemo defaults).
    const A_m2 = 2.5e-6;
    const n = MATERIALS.copper.n;
    const vd = I / (n * PHYS.e * A_m2);                       // m/s
    const vth = Math.sqrt((3 * PHYS.k_B * T) / PHYS.me);      // m/s
    const ratio = vth / vd;
    return { vd, vth, ratio, A_m2, n };
  }, [I, T]);

  const stateRef = useRef({ I, T, showArrows, showLattice, computed });
  useEffect(() => {
    stateRef.current = { I, T, showArrows, showLattice, computed };
  }, [I, T, showArrows, showLattice, computed]);

  const setup = useCallback((info: CanvasInfo) => {
    const colors = getCanvasColors();
    const { ctx, w: W, h: H, canvas } = info;
    let raf = 0;

    const cam: OrbitCamera = { yaw: 0.55, pitch: 0.22, distance: 6.5, fov: Math.PI / 4 };
    const dispose = attachOrbit(canvas, cam);

    // Initialise electrons uniformly inside the cylinder.
    function randInCylinder(): Vec3 {
      // Uniform-in-area cross-section: r = R·√u; uniform x along ±X_HALF.
      const u = Math.random();
      const phi = Math.random() * Math.PI * 2;
      const r = R_WIRE * Math.sqrt(u) * 0.96;
      const x = (Math.random() * 2 - 1) * X_HALF * 0.96;
      return v3(x, r * Math.cos(phi), r * Math.sin(phi));
    }
    const electrons: Electron[] = Array.from({ length: N_ELECTRONS }, () => {
      const p = randInCylinder();
      return { pos: p, vx: 0, vy: 0, vz: 0 };
    });

    // Pre-baked static ion lattice positions (don't move).
    const ions: Vec3[] = [];
    for (let i = 0; i < N_IONS_AXIAL; i++) {
      const x = -X_HALF + ((i + 0.5) / N_IONS_AXIAL) * (2 * X_HALF);
      // Centre ion on axis.
      ions.push(v3(x, 0, 0));
      for (let k = 1; k <= N_IONS_RADIAL; k++) {
        const r = (k / N_IONS_RADIAL) * R_WIRE * 0.78;
        for (let j = 0; j < N_IONS_AZIM; j++) {
          // Stagger azimuth between rings for visual variety.
          const phi = (j / N_IONS_AZIM) * Math.PI * 2 + (k * Math.PI) / N_IONS_AZIM;
          ions.push(v3(x, r * Math.cos(phi), r * Math.sin(phi)));
        }
      }
    }

    // Pre-projected rim points for the wire cylinder (rebuilt each frame
    // because cheap, and camera moves).
    const RIM_N = 48;
    const rimPoints = (xAxial: number): Vec3[] => {
      const arr: Vec3[] = [];
      for (let i = 0; i < RIM_N; i++) {
        const phi = (i / RIM_N) * Math.PI * 2;
        arr.push(v3(xAxial, R_WIRE * Math.cos(phi), R_WIRE * Math.sin(phi)));
      }
      return arr;
    };

    function drawRim(pts: Vec3[]) {
      const projected = pts.map(p => project(p, cam, W, H));
      const N = projected.length;
      const depths = projected.map(p => p.depth);
      const sorted = [...depths].sort((a, b) => a - b);
      const cutoff = sorted[Math.floor(N / 2)]!;

      for (const pass of ['back', 'front'] as const) {
        ctx.beginPath();
        let drawing = false;
        for (let i = 0; i <= N; i++) {
          const p = projected[i % N]!;
          const isFront = depths[i % N]! <= cutoff;
          const include = pass === 'front' ? isFront : !isFront;
          if (include) {
            if (!drawing) { ctx.moveTo(p.x, p.y); drawing = true; }
            else ctx.lineTo(p.x, p.y);
          } else {
            drawing = false;
          }
        }
        ctx.strokeStyle = pass === 'front'
          ? 'rgba(255,107,42,0.75)'
          : 'rgba(255,107,42,0.22)';
        ctx.lineWidth = 1.1;
        ctx.setLineDash(pass === 'back' ? [4, 4] : []);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }

    function drawWireScaffold() {
      // Hoops at several axial slices.
      const xs = [-X_HALF, -X_HALF / 2, 0, X_HALF / 2, X_HALF];
      for (const x of xs) drawRim(rimPoints(x));

      // Axial generators (longitudinal wireframe lines).
      const N_LONG = 12;
      for (let i = 0; i < N_LONG; i++) {
        const phi = (i / N_LONG) * Math.PI * 2;
        const y = R_WIRE * Math.cos(phi);
        const z = R_WIRE * Math.sin(phi);
        const mid = project(v3(0, y, z), cam, W, H);
        const back = mid.depth > cam.distance;
        const p1 = project(v3(-X_HALF, y, z), cam, W, H);
        const p2 = project(v3(+X_HALF, y, z), cam, W, H);
        // Soft amber glow for the front-half generators; dashed grey for back.
        if (!back) {
          drawGlowPath(ctx,
            [{ x: p1.x, y: p1.y }, { x: p2.x, y: p2.y }],
            {
              color: 'rgba(255,107,42,0.32)',
              lineWidth: 1.0,
              glowColor: 'rgba(255,107,42,0.10)',
              glowWidth: 5,
            });
        } else {
          ctx.save();
          ctx.globalAlpha = 0.14;
          ctx.strokeStyle = colors.textDim;
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.restore();
        }
      }
    }

    function draw() {
      const s = stateRef.current;
      ctx.fillStyle = getCanvasColors().bg;
      ctx.fillRect(0, 0, W, H);

      // Visual scale factors. We exaggerate thermal & drift by huge but
      // FIXED ratios so motion is visible; the ratio between the two
      // tracks √T and I correctly.
      const thermalSigma = VIS_THERMAL * Math.sqrt(s.T / T_REF);
      const driftStep = VIS_DRIFT * (s.I / I_REF);

      // Update electrons.
      for (const e of electrons) {
        // Random thermal kick (Gaussian-ish via two uniform sums).
        const kx = ((Math.random() + Math.random() + Math.random()) - 1.5) * thermalSigma * 2;
        const ky = ((Math.random() + Math.random() + Math.random()) - 1.5) * thermalSigma * 2;
        const kz = ((Math.random() + Math.random() + Math.random()) - 1.5) * thermalSigma * 2;
        // Light velocity damping (collisions randomise direction) + drift bias.
        e.vx = e.vx * 0.55 + kx + driftStep;
        e.vy = e.vy * 0.55 + ky;
        e.vz = e.vz * 0.55 + kz;
        e.pos.x += e.vx;
        e.pos.y += e.vy;
        e.pos.z += e.vz;

        // Wrap around in x (so electrons don't deplete).
        if (e.pos.x > X_HALF) e.pos.x -= 2 * X_HALF;
        else if (e.pos.x < -X_HALF) e.pos.x += 2 * X_HALF;

        // Reflect off the cylinder wall in radius.
        const r2 = e.pos.y * e.pos.y + e.pos.z * e.pos.z;
        const rMax = R_WIRE * 0.97;
        if (r2 > rMax * rMax) {
          const r = Math.sqrt(r2);
          const nx = e.pos.y / r, nz = e.pos.z / r;
          // Place just inside.
          e.pos.y = nx * rMax * 0.98;
          e.pos.z = nz * rMax * 0.98;
          // Reflect transverse velocity.
          const dotn = e.vy * nx + e.vz * nz;
          e.vy -= 2 * dotn * nx;
          e.vz -= 2 * dotn * nz;
          // Soft damp on bounce.
          e.vy *= 0.6; e.vz *= 0.6;
        }
      }

      // Wire scaffold (back-most layer of structure).
      drawWireScaffold();

      // Build a single depth-sorted draw list of ions + electrons so
      // the lattice peeks through correctly when an electron passes
      // in front of an ion.
      const items: DrawItem[] = [];
      if (s.showLattice) {
        for (const ion of ions) {
          const p = project(ion, cam, W, H);
          if (p.depth <= 0) continue;
          items.push({ kind: 'ion', depth: p.depth, proj: p });
        }
      }
      for (const e of electrons) {
        const p = project(e.pos, cam, W, H);
        if (p.depth <= 0) continue;
        let arrowTip: DrawItem['arrowTip'];
        if (s.showArrows) {
          // The drift arrow is a short +x segment in world space,
          // scaled longer than the actual visual step so the reader
          // can see direction.
          const tip = project(
            v3(e.pos.x + 0.18, e.pos.y, e.pos.z),
            cam, W, H,
          );
          arrowTip = tip;
        }
        items.push({ kind: 'electron', depth: p.depth, proj: p, arrowTip });
      }

      // Painter's algorithm: largest depth first.
      items.sort((a, b) => b.depth - a.depth);

      for (const it of items) {
        if (it.kind === 'ion') {
          // Amber ion sphere, depth-faded.
          const t = Math.max(0, Math.min(1, (cam.distance + 1.5 - it.depth) / 3.5));
          const alpha = 0.30 + 0.45 * t;
          const radius = 2.4 + 1.6 * t;
          // Soft outer glow + solid inner.
          ctx.fillStyle = `rgba(255,107,42,${(0.10 * alpha).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(it.proj.x, it.proj.y, radius * 1.9, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = `rgba(255,107,42,${alpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(it.proj.x, it.proj.y, radius, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Electron — cyan disc with a tiny halo.
          const t = Math.max(0, Math.min(1, (cam.distance + 1.5 - it.depth) / 3.5));
          const alpha = 0.55 + 0.40 * t;
          const radius = 1.7 + 1.4 * t;
          ctx.fillStyle = `rgba(91,174,248,${(0.18 * alpha).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(it.proj.x, it.proj.y, radius * 2.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = `rgba(108,197,194,${alpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(it.proj.x, it.proj.y, radius, 0, Math.PI * 2);
          ctx.fill();

          // Drift arrow.
          if (it.arrowTip && it.arrowTip.depth > 0) {
            const p1 = it.proj;
            const p2 = it.arrowTip;
            const dx = p2.x - p1.x, dy = p2.y - p1.y;
            const len = Math.hypot(dx, dy);
            if (len > 2) {
              const ux = dx / len, uy = dy / len;
              ctx.strokeStyle = `rgba(255,107,42,${(0.85 * alpha).toFixed(3)})`;
              ctx.lineWidth = 1.1;
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
              const head = 4, half = 2.4;
              ctx.fillStyle = `rgba(255,107,42,${(0.92 * alpha).toFixed(3)})`;
              ctx.beginPath();
              ctx.moveTo(p2.x, p2.y);
              ctx.lineTo(p2.x - ux * head - uy * half, p2.y - uy * head + ux * half);
              ctx.lineTo(p2.x - ux * head + uy * half, p2.y - uy * head - ux * half);
              ctx.closePath();
              ctx.fill();
            }
          }
        }
      }

      // Annotations.
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillStyle = getCanvasColors().textDim;
      ctx.fillText('drag to rotate', 12, 12);
      ctx.save();
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = colors.textDim;
      ctx.fillText('copper · 56 free electrons · thermal & drift scaled for visibility', 12, H - 18);

      ctx.textAlign = 'right';
      ctx.restore();
      ctx.fillStyle = getCanvasColors().teal;
      ctx.fillText('electrons (cyan)', W - 12, 12);
      ctx.fillStyle = getCanvasColors().accent;
      ctx.fillText('Cu+ ions (amber)', W - 12, 28);
      if (s.showArrows) {
        ctx.fillStyle = getCanvasColors().accent;
        ctx.fillText('drift bias → +x', W - 12, 44);
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
      figure={figure ?? 'Fig. 3.6'}
      title="Drift in copper, in 3D"
      question="Inside the wire: how fast is each electron actually moving?"
      caption={<>
        A short length of copper, viewed from any angle. The cyan dots are
        free electrons. Watch one — it bounces every direction at thermal
        speeds (<strong>~10⁵ m/s</strong> at room temperature), colliding
        with the amber ion lattice every <strong>~2×10⁻¹⁴ s</strong>.
        Underneath the chaos there is a faint, steady bias toward +x —
        the drift velocity, set by the current. At <strong>I = 3 A</strong> in
        ordinary house wiring v_d is about <strong>0.1 mm/s</strong>. The
        ratio between the two — printed live on the right — is roughly
        <strong> 10¹⁰</strong>. Drag to orbit.
      </>}
      deeperLab={{ slug: 'drift', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={360} setup={setup} ariaLabel="3D copper wire with drifting electrons" />
      <DemoControls>
        <MiniSlider
          label="current I"
          value={I} min={0.1} max={10} step={0.1}
          format={v => v.toFixed(1) + ' A'}
          onChange={setI}
        />
        <MiniSlider
          label="temperature T"
          value={T} min={100} max={400} step={5}
          format={v => v.toFixed(0) + ' K'}
          onChange={setT}
        />
        <MiniToggle label="drift arrows" checked={showArrows} onChange={setShowArrows} />
        <MiniToggle label="ion lattice" checked={showLattice} onChange={setShowLattice} />
        <MiniReadout label="v_d" value={<Num value={computed.vd} />} unit="m/s" />
        <MiniReadout label="v_th" value={<Num value={computed.vth} />} unit="m/s" />
        <MiniReadout label="v_th / v_d" value={<Num value={computed.ratio} />} unit="×" />
      </DemoControls>
    </Demo>
  );
}

