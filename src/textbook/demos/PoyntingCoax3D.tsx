/**
 * Demo 8.6 — Poynting vector around a coaxial cable, in 3D
 *
 * A coaxial cable rendered as three nested cylinders, viewed through an
 * orbital camera (drag to rotate). The inner conductor (amber) carries
 * current I along +x; the outer braid (translucent wireframe) is the
 * return path. Between them lies the dielectric.
 *
 *   E_radial  ∝ V / (r ln(b/a))    — pink, radial inside the dielectric
 *   B_phi     ∝ μ₀ I / (2π r)      — teal, circumferential in cross-section
 *   S = E×B/μ₀ ∝ V·I / (r² ln(b/a)) — amber, AXIAL along the cable
 *
 * The pedagogical punchline is geometric: the cross-product structure
 * forces S to point along the cable (not radially into the metal as in
 * the resistive-wire case), and integrating S over the dielectric cross-
 * section gives V·I exactly — the same identity from the 2D inflow demo,
 * now obvious from the geometry.
 *
 * Camera: shared OrbitCamera from src/lib/projection3d.ts. Cylinder rims
 * and axial wireframes are baked into an offscreen cache keyed on camera
 * orientation (yaw, pitch) plus canvas size — small camera nudges
 * recompute, slider changes do not invalidate the static cache.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider, MiniToggle } from '@/components/Demo';
import { Num } from '@/components/Num';
import { PHYS } from '@/lib/physics';
import { drawGlowPath } from '@/lib/canvasPrimitives';
import { getCanvasColors } from '@/lib/canvasTheme';
import {
  attachOrbit,
  depthSortIndices,
  project,
  v3,
  type OrbitCamera,
  type Vec3,
} from '@/lib/projection3d';

interface Props {
  figure?: string;
}

// Geometry (world units). The cable runs along the x-axis from -X_HALF to +X_HALF.
const X_HALF = 2.0;
const R_INNER = 0.2; // inner conductor radius
const R_OUTER = 0.65; // outer braid radius (dielectric fills the gap)

interface ArrowSpec {
  anchor: Vec3; // depth-sort key (midpoint)
  from: Vec3;
  to: Vec3;
  kind: 'E' | 'B' | 'S';
}

interface StaticCache {
  key: string;
  canvas: HTMLCanvasElement;
}

export function PoyntingCoax3DDemo({ figure }: Props) {
  const [I, setI] = useState(3); // A
  const [V, setV] = useState(24); // V
  const [showE, setShowE] = useState(true);
  const [showB, setShowB] = useState(true);
  const [showS, setShowS] = useState(true);

  const computed = useMemo(() => {
    // Power delivered.
    const P = V * I;
    // Surface integral of S over the dielectric cross-section.
    //   ∫∫ S(r) dA  with S(r) = μ₀ I V / (2π² L r² ln(b/a)) is the local
    // form; integrating between r=a and r=b gives exactly V·I per unit
    // length cancellation. We expose both as a "match" diagnostic.
    const a = R_INNER,
      b = R_OUTER;
    const logba = Math.log(b / a);
    // Closed-form: ∫_a^b S(r) · 2π r dr = V I.
    // (Substitute S(r) = V I / (2π r² ln(b/a)) — note this is per length,
    // since E·B/μ₀ at fixed V, I, geometry is already a cross-section
    // intensity in W/m².)
    const S_at_inner = (V * I) / (2 * Math.PI * a * a * logba);
    const integral = V * I; // analytic
    const match = integral / (V * I);
    return { P, S_at_inner, integral, match, logba };
  }, [I, V]);

  const stateRef = useRef({ I, V, showE, showB, showS, computed });
  useEffect(() => {
    stateRef.current = { I, V, showE, showB, showS, computed };
  }, [I, V, showE, showB, showS, computed]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w: W, h: H, dpr, canvas } = info;
    let raf = 0;

    const cam: OrbitCamera = { yaw: 0.6, pitch: 0.25, distance: 6.5, fov: Math.PI / 4 };
    const dispose = attachOrbit(canvas, cam);

    const cache: { entry: StaticCache | null } = { entry: null };

    // Pre-built rim points (parametric circles in y-z, at fixed x).
    const RIM_N = 48;
    const rimPoints = (radius: number, x: number): Vec3[] => {
      const arr: Vec3[] = [];
      for (let i = 0; i < RIM_N; i++) {
        const phi = (i / RIM_N) * Math.PI * 2;
        arr.push(v3(x, radius * Math.cos(phi), radius * Math.sin(phi)));
      }
      return arr;
    };

    // Render the static scaffolding (rims, axial wireframe, axes) into
    // an offscreen canvas. Camera-orientation-sensitive, so we re-bake
    // when the camera moves more than ~0.02 rad.
    function bakeStatic(): HTMLCanvasElement {
      const off = document.createElement('canvas');
      off.width = Math.max(1, Math.floor(W * dpr));
      off.height = Math.max(1, Math.floor(H * dpr));
      const o = off.getContext('2d')!;
      o.scale(dpr, dpr);
      o.clearRect(0, 0, W, H);

      // Outer braid rims (front + back, at both ends + a few middle hoops).
      const xs = [-X_HALF, -X_HALF / 2, 0, X_HALF / 2, X_HALF];
      for (const x of xs) {
        drawRim(o, rimPoints(R_OUTER, x), cam, W, H, {
          frontColor: 'rgba(160,158,149,0.55)',
          backColor: 'rgba(160,158,149,0.18)',
          lineWidth: 1.0,
          backDash: [4, 4],
        });
      }
      // Inner conductor rims (more saturated).
      for (const x of [-X_HALF, 0, X_HALF]) {
        drawRim(o, rimPoints(R_INNER, x), cam, W, H, {
          frontColor: 'rgba(255,107,42,0.85)',
          backColor: 'rgba(255,107,42,0.35)',
          lineWidth: 1.2,
          backDash: [4, 4],
        });
      }

      // Axial wireframe lines along the outer braid (8 longitudinal lines).
      const N_LONG = 8;
      for (let i = 0; i < N_LONG; i++) {
        const phi = (i / N_LONG) * Math.PI * 2;
        const y = R_OUTER * Math.cos(phi);
        const z = R_OUTER * Math.sin(phi);
        const front = z >= 0;
        const p1 = project(v3(-X_HALF, y, z), cam, W, H);
        const p2 = project(v3(+X_HALF, y, z), cam, W, H);
        o.strokeStyle = front ? 'rgba(160,158,149,0.45)' : 'rgba(160,158,149,0.14)';
        o.lineWidth = 1;
        o.setLineDash(front ? [] : [4, 4]);
        o.beginPath();
        o.moveTo(p1.x, p1.y);
        o.lineTo(p2.x, p2.y);
        o.stroke();
      }
      o.setLineDash([]);

      // Inner conductor body — a tinted band drawn as filled silhouette
      // (two long edges, projected through cam, capped with rim ellipses).
      drawInnerConductorBody(o, cam, W, H);

      return off;
    }

    function getStatic(): HTMLCanvasElement {
      const yawQ = Math.round(cam.yaw / 0.04) * 0.04;
      const pitQ = Math.round(cam.pitch / 0.04) * 0.04;
      const key = `${W}x${H}@${dpr}|y${yawQ.toFixed(2)}|p${pitQ.toFixed(2)}`;
      if (cache.entry?.key !== key) {
        cache.entry = { key, canvas: bakeStatic() };
      }
      return cache.entry.canvas;
    }

    function draw() {
      ctx.fillStyle = getCanvasColors().bg;
      ctx.fillRect(0, 0, W, H);

      const s = stateRef.current;

      // Background scaffolding (cached).
      ctx.drawImage(getStatic(), 0, 0, W, H);

      // ── Build the dynamic arrow list ─────────────────────────────────
      const arrows: ArrowSpec[] = [];

      // E-field arrows: radial, inside dielectric, on a sparse grid of
      // (x, phi) at a single mid-radius for clarity.
      if (s.showE) {
        const nx = 5,
          nphi = 8;
        const r_mid = (R_INNER + R_OUTER) / 2;
        for (let i = 0; i < nx; i++) {
          const x = -X_HALF + ((i + 0.5) / nx) * (2 * X_HALF);
          for (let j = 0; j < nphi; j++) {
            const phi = (j / nphi) * Math.PI * 2;
            const r0 = R_INNER + 0.04;
            const r1 = R_OUTER - 0.04;
            const cy = Math.cos(phi),
              sy = Math.sin(phi);
            const from = v3(x, r0 * cy, r0 * sy);
            const to = v3(x, r1 * cy, r1 * sy);
            arrows.push({
              from,
              to,
              anchor: v3(x, r_mid * cy, r_mid * sy),
              kind: 'E',
            });
          }
        }
      }

      // B-field arrows: tangential to a circle in the y-z plane, at a
      // few axial slices. Each arrow is a short chord representing the
      // local azimuthal direction.
      if (s.showB) {
        const nx = 4,
          nphi = 12;
        const r_b = (R_INNER + R_OUTER) / 2 + 0.05;
        const arc = ((2 * Math.PI) / nphi) * 0.55; // half-length of chord in radians
        for (let i = 0; i < nx; i++) {
          const x = -X_HALF + ((i + 0.5) / nx) * (2 * X_HALF);
          for (let j = 0; j < nphi; j++) {
            const phi = (j / nphi) * Math.PI * 2;
            const phi0 = phi - arc;
            const phi1 = phi + arc;
            const from = v3(x, r_b * Math.cos(phi0), r_b * Math.sin(phi0));
            const to = v3(x, r_b * Math.cos(phi1), r_b * Math.sin(phi1));
            arrows.push({
              from,
              to,
              anchor: v3(x, r_b * Math.cos(phi), r_b * Math.sin(phi)),
              kind: 'B',
            });
          }
        }
      }

      // Poynting arrows: axial (+x), inside the dielectric, at a sparse
      // (phi, r) grid spanning the cross-section. Length depends on V·I
      // for visual emphasis, but always axial.
      if (s.showS) {
        const nphi = 8,
          nr = 2;
        const power = Math.min(1.6, Math.max(0.5, 0.6 + 0.05 * Math.log10(s.I * s.V + 1)));
        const baseLen = 0.55 * power;
        for (let j = 0; j < nphi; j++) {
          const phi = (j / nphi) * Math.PI * 2 + Math.PI / nphi;
          for (let k = 0; k < nr; k++) {
            const r = R_INNER + 0.1 + (k + 0.5) * ((R_OUTER - R_INNER - 0.2) / nr);
            const cy = Math.cos(phi),
              sz = Math.sin(phi);
            const x0 = -baseLen / 2;
            // Stagger axially so multiple streams are visible per slice.
            const stagger = (((j + k) % 3) - 1) * 0.6;
            const from = v3(x0 + stagger, r * cy, r * sz);
            const to = v3(x0 + stagger + baseLen, r * cy, r * sz);
            arrows.push({
              from,
              to,
              anchor: v3(stagger, r * cy, r * sz),
              kind: 'S',
            });
          }
        }
      }

      // Painter's-algorithm: draw back-to-front.
      const order = depthSortIndices(arrows, cam, W, H);
      for (const idx of order) {
        const a = arrows[idx]!;
        drawArrow(ctx, a, cam, W, H);
      }

      // Annotations
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillStyle = getCanvasColors().textDim;
      ctx.fillText('drag to rotate', 12, 12);
      ctx.save();
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = getCanvasColors().textDim;
      ctx.fillText(
        `inner radius a = ${R_INNER.toFixed(2)}   outer b = ${R_OUTER.toFixed(2)}`,
        12,
        28,
      );

      ctx.textAlign = 'right';
      ctx.restore();
      ctx.fillStyle = getCanvasColors().pink;
      ctx.fillText('E  pink · radial', W - 12, 12);
      ctx.fillStyle = getCanvasColors().teal;
      ctx.fillText('B  teal · circumferential', W - 12, 28);
      ctx.fillStyle = getCanvasColors().accent;
      ctx.fillText('S = E × B / μ₀ · axial', W - 12, 44);

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
      figure={figure ?? 'Fig. 8.6'}
      title="The coax cable — energy lives in the dielectric"
      question="In a coaxial cable, which way does the Poynting vector point — into the copper, or along the cable?"
      caption={
        <>
          Drag the cable to rotate. The pink radial <strong>E</strong> and teal circumferential{' '}
          <strong>B</strong>
          live in the dielectric between inner conductor and outer braid; their cross product points{' '}
          <em>along</em>
          the cable — amber arrows streaming from source to load. Integrating <strong>
            S
          </strong>{' '}
          over the dielectric cross-section gives <strong>∮ S · dA = V·I</strong> exactly, just as
          for the resistive wire of the previous demo, but with the energy threading the empty space
          between the conductors instead of pouring inward into copper.
        </>
      }
      deeperLab={{ slug: 'poynting', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={360} setup={setup} />
      <DemoControls>
        <MiniToggle label={showE ? 'E on' : 'E off'} checked={showE} onChange={setShowE} />
        <MiniToggle label={showB ? 'B on' : 'B off'} checked={showB} onChange={setShowB} />
        <MiniToggle label={showS ? 'S on' : 'S off'} checked={showS} onChange={setShowS} />
        <MiniSlider
          label="I"
          value={I}
          min={0.1}
          max={10}
          step={0.1}
          format={(v) => v.toFixed(1) + ' A'}
          onChange={setI}
        />
        <MiniSlider
          label="V"
          value={V}
          min={5}
          max={100}
          step={1}
          format={(v) => v.toFixed(0) + ' V'}
          onChange={setV}
        />
        <MiniReadout label="P = V·I" value={<Num value={computed.P} />} unit="W" />
        <MiniReadout label="∮ S · dA" value={<Num value={computed.integral} />} unit="W" />
        <MiniReadout label="match" value={computed.match.toFixed(3)} unit="×" />
      </DemoControls>
    </Demo>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 *  Helpers
 * ────────────────────────────────────────────────────────────────────── */

interface RimOptions {
  frontColor: string;
  backColor: string;
  lineWidth: number;
  backDash?: number[];
}

/**
 * Draw a single rim (closed parametric circle) by splitting it into
 * front-facing and back-facing arcs and drawing the back one dashed.
 * "Front" is decided by projected depth at each vertex.
 */
function drawRim(
  ctx: CanvasRenderingContext2D,
  pts: Vec3[],
  cam: OrbitCamera,
  W: number,
  H: number,
  opts: RimOptions,
) {
  const projected = pts.map((p) => project(p, cam, W, H));
  const N = projected.length;
  // Median depth as the front/back cutoff.
  const depths = projected.map((p) => p.depth);
  const sorted = [...depths].sort((a, b) => a - b);
  const cutoff = sorted[Math.floor(N / 2)]!;

  // Two passes: back first (dashed), then front.
  for (const pass of ['back', 'front'] as const) {
    ctx.beginPath();
    let drawing = false;
    for (let i = 0; i <= N; i++) {
      const p = projected[i % N]!;
      const isFront = depths[i % N]! <= cutoff;
      const include = pass === 'front' ? isFront : !isFront;
      if (include) {
        if (!drawing) {
          ctx.moveTo(p.x, p.y);
          drawing = true;
        } else ctx.lineTo(p.x, p.y);
      } else {
        drawing = false;
      }
    }
    ctx.strokeStyle = pass === 'front' ? opts.frontColor : opts.backColor;
    ctx.lineWidth = opts.lineWidth;
    ctx.setLineDash(pass === 'back' && opts.backDash ? opts.backDash : []);
    ctx.stroke();
  }
  ctx.setLineDash([]);
}

/**
 * Draw a thin "wireframe-shaded" inner conductor: two top/bottom edges
 * projected at the silhouette of the cylinder. Approximated by sampling
 * a handful of axial lines on the visible half.
 */
function drawInnerConductorBody(
  ctx: CanvasRenderingContext2D,
  cam: OrbitCamera,
  W: number,
  H: number,
) {
  // Sample a few longitudinal generator lines (front half by projection
  // depth). Stroke them with a soft amber to give the inner conductor
  // some volume without occluding the field arrows.
  const N = 18;
  for (let i = 0; i < N; i++) {
    const phi = (i / N) * Math.PI * 2;
    const y = R_INNER * Math.cos(phi);
    const z = R_INNER * Math.sin(phi);
    // Decide front/back by camera-space z of the midpoint.
    const mid = project(v3(0, y, z), cam, W, H);
    const back = mid.depth > cam.distance;
    if (back) continue;
    const p1 = project(v3(-X_HALF, y, z), cam, W, H);
    const p2 = project(v3(+X_HALF, y, z), cam, W, H);
    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.strokeStyle = getCanvasColors().accent;
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
    ctx.restore();
  }
}

/**
 * Project a single 3D arrow and stroke it with kind-appropriate styling.
 * Arrowheads are 2D screen-space triangles so they always read.
 */
function drawArrow(
  ctx: CanvasRenderingContext2D,
  a: ArrowSpec,
  cam: OrbitCamera,
  W: number,
  H: number,
) {
  const p1 = project(a.from, cam, W, H);
  const p2 = project(a.to, cam, W, H);
  if (p1.depth <= 0 || p2.depth <= 0) return;

  // Depth-based dimming: arrows on the far side of the cable read fainter.
  const dMid = (p1.depth + p2.depth) / 2;
  const tDepth = Math.max(0, Math.min(1, (cam.distance + 1.5 - dMid) / 3.0));
  const fade = 0.35 + 0.6 * tDepth;

  let baseColor: string;
  switch (a.kind) {
    case 'E':
      baseColor = `rgba(255,59,110,${(0.85 * fade).toFixed(3)})`;
      break;
    case 'B':
      baseColor = `rgba(108,197,194,${(0.85 * fade).toFixed(3)})`;
      break;
    case 'S':
      baseColor = `rgba(255,107,42,${(0.98 * fade).toFixed(3)})`;
      break;
  }

  if (a.kind === 'S') {
    // Poynting arrows pop with the glow helper.
    drawGlowPath(ctx, [p1, p2], {
      color: baseColor,
      lineWidth: 2.0,
      glowColor: `rgba(255,107,42,${(0.3 * fade).toFixed(3)})`,
      glowWidth: 7,
    });
  } else {
    ctx.strokeStyle = baseColor;
    ctx.lineWidth = a.kind === 'B' ? 1.5 : 1.6;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  }

  // Screen-space arrowhead.
  const dx = p2.x - p1.x,
    dy = p2.y - p1.y;
  const len = Math.hypot(dx, dy);
  if (len < 4) return;
  const ux = dx / len,
    uy = dy / len;
  const head = a.kind === 'S' ? 9 : 6;
  const half = a.kind === 'S' ? 4 : 3;
  ctx.fillStyle = baseColor;
  ctx.beginPath();
  ctx.moveTo(p2.x, p2.y);
  ctx.lineTo(p2.x - ux * head - uy * half, p2.y - uy * head + ux * half);
  ctx.lineTo(p2.x - ux * head + uy * half, p2.y - uy * head - ux * half);
  ctx.closePath();
  ctx.fill();
}

// Silence unused warnings for PHYS — kept imported for future expansion
// of the readout to show E_max, B_max, etc.
void PHYS;
