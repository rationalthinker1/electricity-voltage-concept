/**
 * Demo 2.x — 3D "Electrical Altitude" visualizer
 *
 * A topographic surface whose height at every (x, z) is the electric potential
 * V = Σ(k·q/r) from a set of user-placed point charges. Positive charges pull
 * the surface up into warm-coloured peaks; negative charges push it down into
 * cool-coloured valleys. Charges can be dragged around the ground plane, and a
 * test particle can be dropped to roll downhill — physically demonstrating that
 * positive charges seek lower potential.
 *
 * The rendering core (`renderScene`) is a pure function: given canvas context,
 * dimensions, theme colours, camera, and simulation state, it deterministically
 * draws one frame. All side effects (event listeners, rAF loop, React state
 * updates) live in the thin component wrapper below.
 */
import { useCallback, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniToggle } from '@/components/Demo';
import { drawLabel } from '@/lib/canvasLayout';
import {
  buildHeightfieldMesh,
  drawGridPlane,
  drawHeightfieldMesh,
  drawProjectedSphere,
} from '@/lib/canvas3d';
import { attachCanvasDrag } from '@/lib/canvasDrag';
import { lerpColor, type ThemeColors } from '@/lib/canvasTheme';
import { intersectScreenWithGround, project, projectedRadius, v3, type OrbitCamera } from '@/lib/projection3d';
import { createOrbitScene } from '@/lib/useOrbitScene';
import { useSimState } from '@/lib/useSimState';

interface Props {
  figure: string;
}

/* ───── Geometry constants ──────────────────────────────────────────── */

const GRID_EXTENT = 3.5;
const GRID_STEPS = 28;
const K_NORM = 0.85;
const SOFTEN = 0.18;
const Y_CLAMP = 2.2;
const MAX_CHARGES = 6;

/* ───── Data types ──────────────────────────────────────────────────── */

export interface Charge {
  id: string;
  x: number;
  z: number;
  q: number; // +1 or -1 (normalized units)
}

export interface TestParticle {
  x: number;
  z: number;
  vx: number;
  vz: number;
  active: boolean;
}

/** Immutable snapshot of simulation state passed to the pure renderer. */
export interface SceneState {
  charges: Charge[];
  testParticle: TestParticle | null;
}

const INITIAL_CHARGES: Charge[] = [
  { id: '1', x: -1.3, z: 0.4, q: 1 },
  { id: '2', x: 1.2, z: -0.3, q: -1 },
];

/* ───── Pure physics ────────────────────────────────────────────────── */

export function potentialAt(x: number, z: number, charges: Charge[]): number {
  let v = 0;
  for (const c of charges) {
    const r = Math.hypot(x - c.x, z - c.z);
    v += (K_NORM * c.q) / Math.max(r, SOFTEN);
  }
  return Math.max(-Y_CLAMP, Math.min(Y_CLAMP, v));
}

export function gradientAt(x: number, z: number, charges: Charge[]): { dx: number; dz: number } {
  const h = 0.08;
  const vp = potentialAt(x + h, z, charges);
  const vm = potentialAt(x - h, z, charges);
  const zp = potentialAt(x, z + h, charges);
  const zm = potentialAt(x, z - h, charges);
  return { dx: (vp - vm) / (2 * h), dz: (zp - zm) / (2 * h) };
}

export function updateParticle(tp: TestParticle, dt: number, charges: Charge[]): TestParticle {
  const grad = gradientAt(tp.x, tp.z, charges);
  const accelScale = 2.2;
  let vx = tp.vx + -grad.dx * accelScale * dt;
  let vz = tp.vz + -grad.dz * accelScale * dt;

  const damp = 0.12;
  vx *= 1 - damp * dt;
  vz *= 1 - damp * dt;

  let x = tp.x + vx * dt;
  let z = tp.z + vz * dt;

  const lim = GRID_EXTENT - 0.2;
  if (x < -lim) { x = -lim; vx *= -0.3; }
  if (x > lim) { x = lim; vx *= -0.3; }
  if (z < -lim) { z = -lim; vz *= -0.3; }
  if (z > lim) { z = lim; vz *= -0.3; }

  if (Math.hypot(vx, vz) < 0.05) {
    vx = 0;
    vz = 0;
  }

  return { ...tp, x, z, vx, vz };
}

/* ───── Pure colour mapping ─────────────────────────────────────────── */

export function potentialToColor(
  v: number,
  neutral: string,
  warm: string,
  cool: string,
): string {
  const scale = 1.4;
  const t = Math.max(-1, Math.min(1, v / scale));
  if (t > 0) return lerpColor(neutral, warm, t);
  return lerpColor(neutral, cool, -t);
}

/* ───── Pure hit testing ────────────────────────────────────────────── */

export function hitCharge(
  mx: number,
  my: number,
  cam: OrbitCamera,
  w: number,
  h: number,
  charges: Charge[],
): string | null {
  for (let i = charges.length - 1; i >= 0; i--) {
    const c = charges[i]!;
    const p = project(v3(c.x, potentialAt(c.x, c.z, charges) + 0.08, c.z), cam, w, h);
    if (p.depth <= 0) continue;
    const rPx = projectedRadius(0.16, p.depth, cam, w, h);
    if (Math.hypot(mx - p.x, my - p.y) < Math.max(rPx, 14)) return c.id;
  }
  return null;
}

/* ───── Pure renderer ───────────────────────────────────────────────── */

/**
 * Render one frame of the electrical-altitude scene.
 *
 * Pure function: no external state, no side effects other than writing to the
 * supplied canvas context. Given the same inputs, it produces the same output.
 */
export function renderScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  colors: ThemeColors,
  cam: OrbitCamera,
  state: SceneState,
): void {
  // Background
  ctx.fillStyle = colors.canvasBg;
  ctx.fillRect(0, 0, w, h);

  // Ground reference grid
  drawGridPlane(ctx, cam, w, h, colors, { extent: GRID_EXTENT });

  // Voltage surface
  const tris = buildHeightfieldMesh({
    scalarFn: (x, z) => potentialAt(x, z, state.charges),
    extent: GRID_EXTENT,
    steps: GRID_STEPS,
    cam,
    w,
    h,
  });
  drawHeightfieldMesh(
    ctx,
    tris,
    (scalar) => potentialToColor(scalar, colors.textMuted, colors.pink, colors.blue),
    (scalar) => 0.38 + 0.22 * Math.abs(scalar) / Y_CLAMP,
  );

  // Charges (depth-sorted)
  const chargeItems = state.charges.map((c) => {
    const ySurf = potentialAt(c.x, c.z, state.charges);
    return { c, ySurf, world: v3(c.x, ySurf + 0.1, c.z) };
  });
  chargeItems.sort((a, b) => {
    const da = project(a.world, cam, w, h).depth;
    const db = project(b.world, cam, w, h).depth;
    return db - da;
  });
  for (const it of chargeItems) {
    const isPos = it.c.q > 0;
    drawProjectedSphere(ctx, it.world, 0.16, isPos ? colors.pink : colors.blue, cam, w, h, {
      surfaceY: it.ySurf,
      label: isPos ? '+' : '−',
      labelColor: colors.canvasBg,
    });
  }

  // Test particle
  if (state.testParticle?.active) {
    const tp = state.testParticle;
    const ySurf = potentialAt(tp.x, tp.z, state.charges);
    drawProjectedSphere(ctx, v3(tp.x, ySurf + 0.08, tp.z), 0.1, colors.yellow, cam, w, h);
  }

  // Labels
  drawLabel(ctx, {
    text: 'drag to orbit · drag charges to move',
    x: 12,
    y: 12,
    size: 11,
    font: '11px "JetBrains Mono", monospace',
    baseline: 'top',
  });
  ctx.globalAlpha = 0.6;
  drawLabel(ctx, {
    text: `charges: ${state.charges.length}  ·  V = Σ(kq/r)`,
    x: 12,
    y: 28,
    size: 11,
    font: '11px "JetBrains Mono", monospace',
    baseline: 'top',
  });
  ctx.globalAlpha = 1;
}

/* ───── Component (thin state wrapper) ──────────────────────────────── */

export function ElectricalAltitudeDemo({ figure }: Props) {
  const [charges, setCharges] = useState<Charge[]>(INITIAL_CHARGES);
  const [testParticle, setTestParticle] = useState<TestParticle | null>(null);
  const nextIdRef = useRef(3);

  const stateRef = useSimState<SceneState>({ charges, testParticle });

  const setup = useCallback(
    (info: CanvasInfo) => {
      const { ctx, w, h, canvas, colors } = info;
      const scene = createOrbitScene(canvas, { distance: 8, yaw: 0.55, pitch: 0.32 });

      let raf = 0;
      let lastT = performance.now();
      let draggingId: string | null = null;

      /* ── Input (side effects) ──────────────────────────────────── */

      const disposeDrag = attachCanvasDrag(canvas, {
        onDown(mx, my) {
          const hit = hitCharge(mx, my, scene.cam, w, h, stateRef.current.charges);
          if (hit) {
            draggingId = hit;
            return true;
          }
          return false;
        },
        onMove(mx, my) {
          if (!draggingId) return;
          const hit = intersectScreenWithGround(mx, my, scene.cam, w, h);
          if (!hit) return;

          const s = stateRef.current;
          const m = GRID_EXTENT - 0.25;
          const nx = Math.max(-m, Math.min(m, hit.x));
          const nz = Math.max(-m, Math.min(m, hit.z));

          for (const c of s.charges) {
            if (c.id === draggingId) continue;
            if (Math.hypot(nx - c.x, nz - c.z) < 0.45) return;
          }

          const next = s.charges.map((c) => (c.id === draggingId ? { ...c, x: nx, z: nz } : c));
          stateRef.current.charges = next;
          setCharges(next);
        },
        onUp() {
          draggingId = null;
        },
      });

      /* ── Animation loop (side effects) ─────────────────────────── */

      function tick(now: number) {
        let dt = (now - lastT) / 1000;
        lastT = now;
        if (dt > 0.1) dt = 0.1;

        const s = stateRef.current;

        if (s.testParticle?.active) {
          const nextTp = updateParticle(s.testParticle, dt, s.charges);
          stateRef.current.testParticle = nextTp;
          setTestParticle(nextTp);
        }

        // Pure render call — all inputs explicit, no closure state
        renderScene(ctx, w, h, colors, scene.cam, stateRef.current);

        raf = requestAnimationFrame(tick);
      }

      raf = requestAnimationFrame(tick);

      return () => {
        cancelAnimationFrame(raf);
        scene.dispose();
        disposeDrag();
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  /* ── Control handlers ────────────────────────────────────────────── */

  function addCharge(sign: 1 | -1) {
    if (charges.length >= MAX_CHARGES) return;
    const id = String(nextIdRef.current++);

    let bestX = 0;
    let bestZ = 0;
    let bestDist = 0;
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      const radius = 0.6 + (i % 3) * 0.5;
      const cx = Math.cos(angle) * radius;
      const cz = Math.sin(angle) * radius;
      let minDist = Infinity;
      for (const c of charges) {
        minDist = Math.min(minDist, Math.hypot(cx - c.x, cz - c.z));
      }
      if (minDist > bestDist) {
        bestDist = minDist;
        bestX = cx;
        bestZ = cz;
      }
    }

    setCharges([...charges, { id, x: bestX, z: bestZ, q: sign }]);
  }

  function reset() {
    nextIdRef.current = 3;
    setCharges(INITIAL_CHARGES.map((c) => ({ ...c })));
    setTestParticle(null);
  }

  function dropParticle() {
    const posCharges = charges.filter((c) => c.q > 0);
    let startX = 0;
    let startZ = 0;
    if (posCharges.length > 0) {
      const target = posCharges[Math.floor(Math.random() * posCharges.length)]!;
      const angle = Math.random() * Math.PI * 2;
      const r = 0.4 + Math.random() * 0.6;
      startX = target.x + Math.cos(angle) * r;
      startZ = target.z + Math.sin(angle) * r;
    } else {
      startX = (Math.random() - 0.5) * 2;
      startZ = (Math.random() - 0.5) * 2;
    }
    const lim = GRID_EXTENT - 0.3;
    startX = Math.max(-lim, Math.min(lim, startX));
    startZ = Math.max(-lim, Math.min(lim, startZ));
    setTestParticle({ x: startX, z: startZ, vx: 0, vz: 0, active: true });
  }

  const posCount = charges.filter((c) => c.q > 0).length;
  const negCount = charges.filter((c) => c.q < 0).length;

  return (
    <Demo
      figure={figure}
      title="Electrical altitude — potential as a landscape"
      question="What does a positive test charge do on this surface?"
      caption={
        <>
          The height of the mesh at any point is the electric potential{' '}
          <strong>V = Σ(kq/r)</strong> from all point charges. Warm colours mark peaks
          (positive charges); cool colours mark valleys (negative charges). Drag charges
          to reshape the landscape, orbit to see the 3D relief, then drop a test particle
          and watch it roll <em>downhill</em> — positive charges seek lower potential.
        </>
      }
    >
      <AutoResizeCanvas height={380} setup={setup} />
      <DemoControls>
        <MiniToggle label="Add +" checked onChange={() => addCharge(1)} />
        <MiniToggle label="Add −" checked={false} onChange={() => addCharge(-1)} />
        <MiniToggle label="Reset" checked={false} onChange={reset} />
        <MiniToggle
          label="Drop particle"
          checked={testParticle?.active ?? false}
          onChange={dropParticle}
        />
        <MiniReadout label="Positive" value={posCount} />
        <MiniReadout label="Negative" value={negCount} />
      </DemoControls>
    </Demo>
  );
}
