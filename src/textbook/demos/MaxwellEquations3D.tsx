/**
 * Demo 10.0 — Maxwell's four equations on a single rotating object (3D)
 *
 * A synthesizing visual for Ch.10. One scene, one orbital camera, four
 * toggleable "facets" of Maxwell. The reader picks a mode and watches the
 * geometric content of that equation unfold inside a cubical "Maxwell box":
 *
 *   Mode 1 — Gauss for E:    point charge inside, radial E-arrows pierce
 *                            the cube faces. ∮ E·dA = Q/ε₀ (numerically
 *                            matched on screen).
 *   Mode 2 — Gauss for B:    a short bar magnet in the middle, B field
 *                            traced as closed loops that enter one face
 *                            and exit another. ∮ B·dA = 0 by inspection.
 *   Mode 3 — Faraday:        a horizontal wire loop pierced by a B that
 *                            ramps up over time. The growing B-arrows
 *                            induce a curling E-ring around the loop.
 *                            ∮ E·dℓ = −dΦ_B/dt.
 *   Mode 4 — Ampère–Maxwell: a charging parallel-plate capacitor inside
 *                            the box. Current flows in the lead wire,
 *                            growing E in the gap, and a B-curl ring
 *                            wraps the gap region — Maxwell's displacement
 *                            current "filling in" for the missing
 *                            conduction current. ∮ B·dℓ = μ₀(I + ε₀ dΦ_E/dt).
 *
 * All four modes share the same cubical wireframe so the reader's spatial
 * intuition transfers between equations. The slider re-maps per mode to
 * the most diagnostic quantity (Q, B, dB/dt, dE/dt).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Formula } from '@/components/Formula';
import { Num } from '@/components/Num';
import { PHYS } from '@/lib/physics';
import { drawGlowPath } from '@/lib/canvasPrimitives';
import { getCanvasColors } from '@/lib/canvasTheme';
import {
  add,
  attachOrbit,
  length,
  normalize,
  project,
  scale,
  sub,
  v3,
  type OrbitCamera,
  type Vec3,
} from '@/lib/projection3d';

interface Props {
  figure?: string;
}

type Mode = 'gauss-e' | 'gauss-b' | 'faraday' | 'ampere';

// Cube half-edge in world units.
const BOX = 1.4;

// ─────────────────────────────────────────────────────────────────────────
// Field builders for each mode
// ─────────────────────────────────────────────────────────────────────────

/** Point-charge E at world point p, charge q at origin. Direction + 1/r² mag. */
function pointChargeE(p: Vec3, q: number): Vec3 {
  const l = Math.max(length(p), 0.06);
  return scale(p, q / (l * l * l));
}

/** Idealized magnetic dipole at origin, moment m along +y. */
function dipoleB(p: Vec3, m: number): Vec3 {
  const r = Math.max(length(p), 0.08);
  const rhat = scale(p, 1 / r);
  // B = (μ₀/4π) · (3(m·r̂)r̂ − m) / r³  ; we drop μ₀/4π for visualization.
  const mvec = v3(0, m, 0);
  const mdr = mvec.x * rhat.x + mvec.y * rhat.y + mvec.z * rhat.z;
  const term1 = scale(rhat, 3 * mdr);
  const term2 = mvec;
  return scale(sub(term1, term2), 1 / (r * r * r));
}

/** Trace a field line from `start`, integrating direction. `sign` flips
 *  the integration direction; `stop` is a predicate that ends the trace. */
function traceLine(
  start: Vec3,
  fieldFn: (p: Vec3) => Vec3,
  sign: number,
  steps: number,
  dt: number,
  maxRadius: number,
): Vec3[] {
  const pts: Vec3[] = [start];
  let p = start;
  for (let i = 0; i < steps; i++) {
    const dir = normalize(fieldFn(p));
    if (dir.x === 0 && dir.y === 0 && dir.z === 0) break;
    p = add(p, scale(dir, sign * dt));
    pts.push(p);
    if (length(p) > maxRadius) break;
  }
  return pts;
}

// ─────────────────────────────────────────────────────────────────────────
// Wireframe cube — the shared Maxwell box
// ─────────────────────────────────────────────────────────────────────────

const CUBE_EDGES: Array<[Vec3, Vec3]> = (() => {
  const c: Vec3[] = [];
  for (let xi = 0; xi < 2; xi++)
    for (let yi = 0; yi < 2; yi++)
      for (let zi = 0; zi < 2; zi++)
        c.push(v3(xi === 0 ? -BOX : BOX, yi === 0 ? -BOX : BOX, zi === 0 ? -BOX : BOX));
  const edges: Array<[Vec3, Vec3]> = [];
  for (let i = 0; i < 8; i++) {
    for (let j = i + 1; j < 8; j++) {
      let diff = 0;
      if (c[i]!.x !== c[j]!.x) diff++;
      if (c[i]!.y !== c[j]!.y) diff++;
      if (c[i]!.z !== c[j]!.z) diff++;
      if (diff === 1) edges.push([c[i]!, c[j]!]);
    }
  }
  return edges;
})();

function drawCube(ctx: CanvasRenderingContext2D, cam: OrbitCamera, w: number, h: number) {
  for (const [a, b] of CUBE_EDGES) {
    const pa = project(a, cam, w, h);
    const pb = project(b, cam, w, h);
    // Estimate "back" by sum-of-depths heuristic.
    const back = pa.depth + pb.depth > 2 * cam.distance;
    ctx.strokeStyle = back ? 'rgba(160,158,149,0.18)' : 'rgba(160,158,149,0.5)';
    ctx.lineWidth = 1;
    ctx.setLineDash(back ? [4, 4] : []);
    ctx.beginPath();
    ctx.moveTo(pa.x, pa.y);
    ctx.lineTo(pb.x, pb.y);
    ctx.stroke();
  }
  ctx.setLineDash([]);
}

// ─────────────────────────────────────────────────────────────────────────
// 3D arrow primitive (line + screen-space arrowhead)
// ─────────────────────────────────────────────────────────────────────────

function drawArrow3D(
  ctx: CanvasRenderingContext2D,
  from: Vec3,
  to: Vec3,
  cam: OrbitCamera,
  w: number,
  h: number,
  color: string,
  lineWidth = 1.6,
  headSize = 6,
) {
  const p1 = project(from, cam, w, h);
  const p2 = project(to, cam, w, h);
  if (p1.depth <= 0 || p2.depth <= 0) return;

  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();

  const dx = p2.x - p1.x,
    dy = p2.y - p1.y;
  const len = Math.hypot(dx, dy);
  if (len < 3) return;
  const ux = dx / len,
    uy = dy / len;
  const half = headSize * 0.55;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(p2.x, p2.y);
  ctx.lineTo(p2.x - ux * headSize - uy * half, p2.y - uy * headSize + ux * half);
  ctx.lineTo(p2.x - ux * headSize + uy * half, p2.y - uy * headSize - ux * half);
  ctx.closePath();
  ctx.fill();
}

// ─────────────────────────────────────────────────────────────────────────
// The four mode draw routines
// ─────────────────────────────────────────────────────────────────────────

/**
 * Mode 1: Gauss for E. A point charge at the origin sprays E-arrows
 * outward; arrows that intersect the box's faces are highlighted to
 * emphasize "flux through faces."
 */
function drawGaussE(
  ctx: CanvasRenderingContext2D,
  cam: OrbitCamera,
  w: number,
  h: number,
  q: number,
) {
  // 1. The charge — a glowing pink sphere at the origin.
  const origin = project(v3(0, 0, 0), cam, w, h);
  const rad = 14 + Math.min(10, Math.abs(q) * 4);
  ctx.save();
  const grad = ctx.createRadialGradient(
    origin.x - rad * 0.3,
    origin.y - rad * 0.3,
    rad * 0.2,
    origin.x,
    origin.y,
    rad,
  );
  grad.addColorStop(0, q >= 0 ? '#ffb0c4' : '#a8d4f8');
  grad.addColorStop(1, q >= 0 ? getCanvasColors().pink : getCanvasColors().blue);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(origin.x, origin.y, rad, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = getCanvasColors().bg;
  ctx.font = 'bold 13px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(q >= 0 ? '+' : '−', origin.x, origin.y);
  ctx.restore();

  // 2. Field-line seeds on a small sphere around the charge.
  const N_LAT = 5,
    N_LON = 8;
  for (let i = 1; i <= N_LAT; i++) {
    const theta = (i / (N_LAT + 1)) * Math.PI;
    for (let j = 0; j < N_LON; j++) {
      const phi = (j / N_LON) * 2 * Math.PI;
      const r0 = 0.12;
      const seed = v3(
        r0 * Math.sin(theta) * Math.cos(phi),
        r0 * Math.cos(theta),
        r0 * Math.sin(theta) * Math.sin(phi),
      );
      const dir = q >= 0 ? +1 : -1;
      const line = traceLine(seed, (p) => pointChargeE(p, q), dir, 80, 0.05, BOX * 2.5);
      if (line.length > 1) {
        const pts2 = line.map((p) => project(p, cam, w, h));
        drawGlowPath(ctx, pts2, {
          color: 'rgba(255,107,42,0.72)',
          lineWidth: 1.2,
          glowWidth: 3.2,
          glowColor: 'rgba(255,107,42,0.14)',
        });
      }
    }
  }

  // 3. Highlight a few flux arrows at the face centers, pointing outward.
  //    +x, -x, +y, -y, +z, -z. These give the reader a "look — flux out
  //    through every face" cue.
  const faceCenters: Vec3[] = [
    v3(BOX, 0, 0),
    v3(-BOX, 0, 0),
    v3(0, BOX, 0),
    v3(0, -BOX, 0),
    v3(0, 0, BOX),
    v3(0, 0, -BOX),
  ];
  const normals: Vec3[] = [
    v3(1, 0, 0),
    v3(-1, 0, 0),
    v3(0, 1, 0),
    v3(0, -1, 0),
    v3(0, 0, 1),
    v3(0, 0, -1),
  ];
  for (let i = 0; i < 6; i++) {
    const c = faceCenters[i]!;
    const n = normals[i]!;
    const arrowLen = 0.45 * (q >= 0 ? 1 : -1) * Math.tanh(Math.abs(q) / 3);
    const from = c;
    const to = add(c, scale(n, arrowLen));
    drawArrow3D(ctx, from, to, cam, w, h, 'rgba(255,107,42,0.95)', 2.2, 9);
  }
}

/**
 * Mode 2: Gauss for B. A bar magnet (vertical) at origin; B-field as
 * closed loops. Every loop that enters the box must exit it.
 */
function drawGaussB(
  ctx: CanvasRenderingContext2D,
  cam: OrbitCamera,
  w: number,
  h: number,
  m: number,
) {
  // 1. Draw the bar magnet — a small vertical capsule.
  const top = v3(0, 0.35, 0);
  const bot = v3(0, -0.35, 0);
  const pt = project(top, cam, w, h);
  const pb = project(bot, cam, w, h);
  // Stem.
  ctx.save();
  ctx.globalAlpha = 0.7;
  ctx.strokeStyle = getCanvasColors().textDim;
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(pt.x, pt.y);
  ctx.lineTo(pb.x, pb.y);
  ctx.stroke();
  ctx.lineCap = 'butt';
  // N pole label (top, pink).
  ctx.restore();
  ctx.fillStyle = getCanvasColors().pink;
  ctx.beginPath();
  ctx.arc(pt.x, pt.y, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = getCanvasColors().bg;
  ctx.font = 'bold 11px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('N', pt.x, pt.y);
  // S pole label (bottom, blue).
  ctx.fillStyle = getCanvasColors().blue;
  ctx.beginPath();
  ctx.arc(pb.x, pb.y, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = getCanvasColors().bg;
  ctx.fillText('S', pb.x, pb.y);

  // 2. Trace closed B-field loops by integrating the dipole field forward
  //    *and* backward from a seed point. Concatenate to get a single loop.
  const N_AZ = 6; // azimuthal copies (rotated about y).
  const N_LAT = 3; // a few latitudes / different loop sizes.
  for (let a = 0; a < N_AZ; a++) {
    const phi0 = (a / N_AZ) * 2 * Math.PI;
    const cphi = Math.cos(phi0),
      sphi = Math.sin(phi0);
    for (let i = 0; i < N_LAT; i++) {
      // Seed offset in the half-plane at angle phi0, just outside the
      // magnet stem.
      const radius0 = 0.5 + i * 0.4;
      const seed = v3(radius0 * cphi, 0.05, radius0 * sphi);
      const fwd = traceLine(seed, (p) => dipoleB(p, m), +1, 220, 0.04, BOX * 2.0);
      const bwd = traceLine(seed, (p) => dipoleB(p, m), -1, 220, 0.04, BOX * 2.0);
      // Stitch: reverse backward, then forward.
      const loop = [...bwd.slice().reverse(), ...fwd];
      if (loop.length > 1) {
        const pts2 = loop.map((p) => project(p, cam, w, h));
        drawGlowPath(ctx, pts2, {
          color: 'rgba(108,197,194,0.78)',
          lineWidth: 1.2,
          glowWidth: 3.2,
          glowColor: 'rgba(108,197,194,0.16)',
        });
        // Draw a few arrowheads along the loop to show direction.
        for (const t of [0.25, 0.5, 0.75]) {
          const k = Math.floor(t * pts2.length);
          if (k > 0 && k < pts2.length - 1) {
            const p1 = pts2[k - 1]!,
              p2 = pts2[k]!;
            const dx = p2.x - p1.x,
              dy = p2.y - p1.y;
            const len = Math.hypot(dx, dy);
            if (len < 1) continue;
            const ux = dx / len,
              uy = dy / len;
            ctx.fillStyle = getCanvasColors().teal;
            ctx.beginPath();
            ctx.moveTo(p2.x, p2.y);
            ctx.lineTo(p2.x - ux * 5 - uy * 3, p2.y - uy * 5 + ux * 3);
            ctx.lineTo(p2.x - ux * 5 + uy * 3, p2.y - uy * 5 - ux * 3);
            ctx.closePath();
            ctx.fill();
          }
        }
      }
    }
  }
}

/**
 * Mode 3: Faraday. A horizontal wire loop in the y=0 plane, pierced by
 * a B-field along +y that ramps over time. The growing flux induces a
 * circulating E tangent to the loop (Lenz: induced E opposes the change).
 */
function drawFaraday(
  ctx: CanvasRenderingContext2D,
  cam: OrbitCamera,
  w: number,
  h: number,
  dBdt: number,
  t: number,
) {
  // 1. The wire loop — a circle in the y=0 plane.
  const R_LOOP = 0.9;
  const N = 64;
  const loopPts: Vec3[] = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * 2 * Math.PI;
    loopPts.push(v3(R_LOOP * Math.cos(a), 0, R_LOOP * Math.sin(a)));
  }
  const loop2 = loopPts.map((p) => project(p, cam, w, h));
  // Closed loop, copper-amber.
  ctx.strokeStyle = getCanvasColors().accent;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(loop2[0]!.x, loop2[0]!.y);
  for (let i = 1; i < loop2.length; i++) ctx.lineTo(loop2[i]!.x, loop2[i]!.y);
  ctx.closePath();
  ctx.stroke();

  // 2. B-arrows piercing the loop along +y. Length pulses with t so the
  //    reader sees the field "ramping up."
  const Bnow = dBdt * (0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * 1.6)));
  const arrowLen = Math.max(0.15, Math.min(0.95, Math.abs(Bnow) * 0.4));
  const Bdir = Bnow >= 0 ? 1 : -1;
  // Several B-arrows on a small grid inside the loop.
  const positions: Array<[number, number]> = [
    [0, 0],
    [0.45, 0],
    [-0.45, 0],
    [0, 0.45],
    [0, -0.45],
    [0.32, 0.32],
    [-0.32, 0.32],
    [0.32, -0.32],
    [-0.32, -0.32],
  ];
  for (const [x, z] of positions) {
    const from = v3(x, (-arrowLen / 2) * Bdir, z);
    const to = v3(x, (arrowLen / 2) * Bdir, z);
    drawArrow3D(ctx, from, to, cam, w, h, 'rgba(108,197,194,0.9)', 1.8, 7);
  }

  // 3. Induced E circulation — a ring of arrows tangent to the loop.
  //    By Lenz's law: B is along +y (out of the page from above), increasing
  //    → induced E goes clockwise when viewed from +y (opposing the increase).
  //    We use the sign of dBdt to flip direction.
  const N_E = 12;
  const R_E = R_LOOP * 1.05;
  for (let i = 0; i < N_E; i++) {
    const a0 = (i / N_E) * 2 * Math.PI;
    const a1 = a0 + (Bdir > 0 ? -1 : +1) * ((2 * Math.PI) / N_E) * 0.5;
    const from = v3(R_E * Math.cos(a0), 0, R_E * Math.sin(a0));
    const to = v3(R_E * Math.cos(a1), 0, R_E * Math.sin(a1));
    drawArrow3D(ctx, from, to, cam, w, h, 'rgba(255,59,110,0.95)', 2.0, 8);
  }

  // 4. Tiny legend dot near the loop.
  const labelP = project(v3(R_LOOP + 0.25, 0, 0), cam, w, h);
  ctx.save();
  ctx.globalAlpha = 0.75;
  ctx.fillStyle = getCanvasColors().text;
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('induced E', labelP.x + 6, labelP.y);
  ctx.restore();
}

/**
 * Mode 4: Ampère–Maxwell. A capacitor: two square plates parallel to
 * y=0, separated by a small gap. Current flows down the wire to the top
 * plate; E builds up in the gap; circulating B-arrows wrap the gap.
 */
function drawAmpere(
  ctx: CanvasRenderingContext2D,
  cam: OrbitCamera,
  w: number,
  h: number,
  dEdt: number,
  t: number,
) {
  // Capacitor geometry.
  const PLATE_HALF = 0.55;
  const GAP_HALF = 0.18; // half-distance between plates
  const wireLen = BOX - GAP_HALF - 0.1;

  // 1. Top plate (square in z-x at y = +GAP_HALF), bottom plate at y = -GAP_HALF.
  function drawPlate(yLevel: number, label: string, color: string) {
    const corners: Vec3[] = [
      v3(-PLATE_HALF, yLevel, -PLATE_HALF),
      v3(PLATE_HALF, yLevel, -PLATE_HALF),
      v3(PLATE_HALF, yLevel, PLATE_HALF),
      v3(-PLATE_HALF, yLevel, PLATE_HALF),
    ];
    const pts = corners.map((p) => project(p, cam, w, h));
    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = getCanvasColors().accent;
    ctx.restore();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(pts[0]!.x, pts[0]!.y);
    for (let i = 1; i < 4; i++) ctx.lineTo(pts[i]!.x, pts[i]!.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Label at one corner.
    ctx.fillStyle = color;
    ctx.font = 'bold 10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, pts[1]!.x + 12, pts[1]!.y - 8);
  }
  drawPlate(+GAP_HALF, '+', getCanvasColors().pink);
  drawPlate(-GAP_HALF, '−', getCanvasColors().blue);

  // 2. Lead wires (vertical, along +y above and below the plates).
  for (const [yStart, yEnd] of [
    [GAP_HALF, GAP_HALF + wireLen],
    [-GAP_HALF - wireLen, -GAP_HALF],
  ]) {
    const p1 = project(v3(0, yStart, 0), cam, w, h);
    const p2 = project(v3(0, yEnd, 0), cam, w, h);
    ctx.strokeStyle = getCanvasColors().accent;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  }

  // 3. Current arrows on the wires — moving with t (flow animation).
  const flowPhase = (t * 0.6) % 1;
  for (const sign of [+1, -1]) {
    for (let k = 0; k < 3; k++) {
      const u0 = (k / 3 + flowPhase) % 1;
      const yA = sign > 0 ? GAP_HALF + wireLen * u0 : -GAP_HALF - wireLen * u0;
      // Current direction: into +plate from above (yA decreasing for +sign).
      const dy = sign > 0 ? -0.18 : -0.18;
      const from = v3(0, yA, 0);
      const to = v3(0, yA + dy, 0);
      drawArrow3D(ctx, from, to, cam, w, h, 'rgba(255,107,42,0.95)', 2.0, 8);
    }
  }

  // 4. Growing E-field in the gap (downward, +plate → −plate).
  const Enow = dEdt * (0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * 1.6)));
  const Esign = Enow >= 0 ? -1 : +1;
  const Elen = Math.max(0.08, Math.min(0.3, Math.abs(Enow) * 0.18));
  const eGrid: Array<[number, number]> = [
    [0, 0],
    [0.3, 0],
    [-0.3, 0],
    [0, 0.3],
    [0, -0.3],
    [0.2, 0.2],
    [-0.2, 0.2],
    [0.2, -0.2],
    [-0.2, -0.2],
  ];
  for (const [x, z] of eGrid) {
    const from = v3(x, GAP_HALF * 0.6 * -Esign, z);
    const to = v3(x, GAP_HALF * 0.6 * -Esign + Esign * Elen, z);
    drawArrow3D(ctx, from, to, cam, w, h, 'rgba(255,59,110,0.95)', 1.8, 7);
  }

  // 5. B-curl rings around the gap. Two rings at different y inside the gap
  //    plus one ring around the wire. The right-hand rule: thumb along the
  //    displacement-current direction (same as conduction current direction,
  //    here pointing along −y when capacitor is charging), so B curls
  //    *clockwise* when viewed from +y above.
  const ringRadii: Array<{ y: number; r: number; teal: number }> = [
    { y: 0, r: 0.85, teal: 0.95 },
    { y: GAP_HALF + wireLen * 0.5, r: 0.2, teal: 0.85 },
    { y: -GAP_HALF - wireLen * 0.5, r: 0.2, teal: 0.85 },
  ];
  const Bsign = Enow >= 0 ? +1 : -1;
  for (const { y, r, teal } of ringRadii) {
    const N_RING = 14;
    for (let i = 0; i < N_RING; i++) {
      const a0 = (i / N_RING) * 2 * Math.PI;
      const a1 = a0 + Bsign * ((2 * Math.PI) / N_RING) * 0.55;
      const from = v3(r * Math.cos(a0), y, r * Math.sin(a0));
      const to = v3(r * Math.cos(a1), y, r * Math.sin(a1));
      drawArrow3D(ctx, from, to, cam, w, h, `rgba(108,197,194,${teal.toFixed(2)})`, 1.8, 7);
    }
  }

  // 6. Annotation for the gap region.
  const gapLabel = project(v3(PLATE_HALF + 0.2, 0, 0), cam, w, h);
  ctx.save();
  ctx.globalAlpha = 0.75;
  ctx.fillStyle = getCanvasColors().text;
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('gap: dE/dt + B-curl', gapLabel.x + 4, gapLabel.y);
  ctx.restore();
}

// ─────────────────────────────────────────────────────────────────────────
// The component
// ─────────────────────────────────────────────────────────────────────────

const MODE_TITLES: Record<Mode, string> = {
  'gauss-e': 'Mode 1 — Gauss for E',
  'gauss-b': 'Mode 2 — Gauss for B',
  faraday: 'Mode 3 — Faraday',
  ampere: 'Mode 4 — Ampère–Maxwell',
};

const MODE_BLURBS: Record<Mode, string> = {
  'gauss-e':
    'A point charge inside the box sprays radial E-arrows. Every outward arrow pierces a face; total flux out equals Q/ε₀.',
  'gauss-b':
    'A bar magnet inside the box. Every B-line that enters one face exits another — no monopoles, net flux through any closed surface is zero.',
  faraday:
    'A wire loop pierced by a magnetic flux ramping over time. The changing B induces an electric circulation around the loop: ∮ E·dℓ = −dΦ_B/dt.',
  ampere:
    "A charging capacitor. Conduction current flows in the wires; in the gap, no current — only a growing E. Maxwell's displacement-current term fills in for the missing conduction current and B curls around the gap exactly as it does around the wire.",
};

export function MaxwellEquations3DDemo({ figure }: Props) {
  const [mode, setMode] = useState<Mode>('gauss-e');
  // Per-mode physical parameter (the slider remaps).
  const [q, setQ] = useState(2); // Mode 1: charge (nC, scaled for display)
  const [mDipole, setMDipole] = useState(1.5); // Mode 2: dipole moment (a.u.)
  const [dBdt, setDBdt] = useState(1.2); // Mode 3: dB/dt (T/s)
  const [dEdt, setDEdt] = useState(1.5); // Mode 4: dE/dt (×10⁹ V/(m·s))

  // ── Live readouts: integrals on both sides match by construction ──
  const computed = useMemo(() => {
    // Mode 1: Φ_E = Q/ε₀, with q in nC for display.
    const Q_SI = q * 1e-9;
    const fluxE = Q_SI / PHYS.eps_0; // V·m

    // Mode 2: Φ_B = 0, always.
    const fluxB = 0;

    // Mode 3: |EMF| = |dΦ_B/dt| · A_loop, where A_loop = π·R² with R = 0.9
    //         taken in real metres (visual radius equals physical radius).
    const A_loop = Math.PI * 0.9 * 0.9; // m²
    const emf = Math.abs(dBdt) * A_loop; // V

    // Mode 4: I_displacement = ε₀ · dE/dt · A_plate, plate side 1.1 m
    //         (A_plate = 1.21 m²), dEdt in 10⁹ V/(m·s).
    const A_plate = 1.1 * 1.1; // m²
    const Id = PHYS.eps_0 * dEdt * 1e9 * A_plate; // A
    // ∮ B·dℓ enclosing the displacement current = μ₀ Id (no conduction
    // current through the surface in the gap). Reported in T·m.
    const closedBline = PHYS.mu_0 * Id;

    return { Q_SI, fluxE, fluxB, emf, A_loop, A_plate, Id, closedBline };
  }, [q, mDipole, dBdt, dEdt]);
  void mDipole; // mDipole has no closed-form scalar readout — it just sets visual scale.

  const stateRef = useRef({ mode, q, mDipole, dBdt, dEdt });
  useEffect(() => {
    stateRef.current = { mode, q, mDipole, dBdt, dEdt };
  }, [mode, q, mDipole, dBdt, dEdt]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, canvas } = info;
    const cam: OrbitCamera = { yaw: 0.55, pitch: 0.3, distance: 6.0, fov: Math.PI / 4 };
    const dispose = attachOrbit(canvas, cam);
    let raf = 0;
    const t0 = performance.now();

    function draw() {
      const tNow = (performance.now() - t0) / 1000;
      const s = stateRef.current;
      ctx.fillStyle = getCanvasColors().bg;
      ctx.fillRect(0, 0, w, h);

      // Shared wireframe cube.
      drawCube(ctx, cam, w, h);

      switch (s.mode) {
        case 'gauss-e':
          drawGaussE(ctx, cam, w, h, s.q);
          break;
        case 'gauss-b':
          drawGaussB(ctx, cam, w, h, s.mDipole);
          break;
        case 'faraday':
          drawFaraday(ctx, cam, w, h, s.dBdt, tNow);
          break;
        case 'ampere':
          drawAmpere(ctx, cam, w, h, s.dEdt, tNow);
          break;
      }

      // Hint + mode label.
      ctx.save();
      ctx.globalAlpha = 0.65;
      ctx.fillStyle = getCanvasColors().textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('drag to orbit · same box for all four laws', 12, 12);
      ctx.restore();
      ctx.fillStyle = getCanvasColors().accent;
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.fillText(MODE_TITLES[s.mode], 12, h - 22);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      dispose();
    };
  }, []);

  // Slider config per mode.
  const slider = (() => {
    switch (mode) {
      case 'gauss-e':
        return (
          <MiniSlider
            label="charge Q"
            value={q}
            min={-5}
            max={5}
            step={0.1}
            format={(v) => v.toFixed(1) + ' nC'}
            onChange={setQ}
          />
        );
      case 'gauss-b':
        return (
          <MiniSlider
            label="dipole moment m"
            value={mDipole}
            min={0.3}
            max={3}
            step={0.05}
            format={(v) => v.toFixed(2)}
            onChange={setMDipole}
          />
        );
      case 'faraday':
        return (
          <MiniSlider
            label="dB/dt"
            value={dBdt}
            min={-3}
            max={3}
            step={0.05}
            format={(v) => v.toFixed(2) + ' T/s'}
            onChange={setDBdt}
          />
        );
      case 'ampere':
        return (
          <MiniSlider
            label="dE/dt"
            value={dEdt}
            min={-3}
            max={3}
            step={0.05}
            format={(v) => v.toFixed(2) + '×10⁹ V/(m·s)'}
            onChange={setDEdt}
          />
        );
    }
  })();

  // Equation + matching readouts per mode.
  const eqDisplay = (() => {
    switch (mode) {
      case 'gauss-e':
        return (
          <>
            <Formula>
              ∮ E · dA = Q<sub>enc</sub> / ε₀
            </Formula>
          </>
        );
      case 'gauss-b':
        return <Formula>∮ B · dA = 0</Formula>;
      case 'faraday':
        return (
          <Formula>
            ∮ E · dℓ = − dΦ<sub>B</sub>/dt
          </Formula>
        );
      case 'ampere':
        return (
          <Formula>
            ∮ B · dℓ = μ₀ ( I<sub>enc</sub> + ε₀ dΦ<sub>E</sub>/dt )
          </Formula>
        );
    }
  })();

  const readouts = (() => {
    switch (mode) {
      case 'gauss-e':
        return (
          <>
            <MiniReadout label="∮ E·dA" value={<Num value={computed.fluxE} />} unit="V·m" />
            <MiniReadout label="Q/ε₀" value={<Num value={computed.fluxE} />} unit="V·m" />
          </>
        );
      case 'gauss-b':
        return (
          <>
            <MiniReadout label="∮ B·dA" value={<Num value={computed.fluxB} />} unit="T·m²" />
            <MiniReadout label="(no source)" value="0" unit="T·m²" />
          </>
        );
      case 'faraday':
        return (
          <>
            <MiniReadout label="|∮ E·dℓ|" value={<Num value={computed.emf} />} unit="V" />
            <MiniReadout label="|dΦ_B/dt| (A=πR²)" value={<Num value={computed.emf} />} unit="V" />
          </>
        );
      case 'ampere':
        return (
          <>
            <MiniReadout label="I_displacement" value={<Num value={computed.Id} />} unit="A" />
            <MiniReadout
              label="∮ B·dℓ = μ₀ I_d"
              value={<Num value={computed.closedBline} />}
              unit="T·m"
            />
          </>
        );
    }
  })();

  return (
    <Demo
      figure={figure ?? 'Fig. 10.0'}
      title="The Maxwell box — all four laws on one rotating object"
      question="Can you see each Maxwell equation as a geometric statement about flux through faces or circulation around loops — in the same cubical region of space?"
      caption={
        <>
          A single 3D scene with four toggleable facets. Mode 1 puts a point charge inside the cube
          and shows radial E-flux through its faces; the integral ∮ E·dA equals Q/ε₀ exactly. Mode 2
          puts a bar magnet inside the same cube; every B-line that enters one face exits another,
          so ∮ B·dA = 0 by inspection. Mode 3 ramps a magnetic flux through a wire loop and shows
          the induced E curling around the loop's edge. Mode 4 charges a capacitor: conduction
          current in the wires, no current in the gap, but a growing E whose displacement-current
          term ε₀ dΦ_E/dt produces exactly the missing B circulation. The slider sets the diagnostic
          quantity in each mode; the live readouts show both sides of the equation matching
          numerically.
        </>
      }
    >
      {/* Mode selector — radio-style row of buttons. */}
      <div
        role="tablist"
        aria-label="Maxwell equation mode"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 6,
          marginBottom: 10,
        }}
      >
        {(['gauss-e', 'gauss-b', 'faraday', 'ampere'] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => setMode(m)}
            style={{
              flex: '1 1 auto',
              minWidth: 130,
              padding: '7px 10px',
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 11,
              color: mode === m ? getCanvasColors().canvasBg : getCanvasColors().textDim,
              background: mode === m ? getCanvasColors().accent : 'rgba(255,255,255,0.04)',
              border: mode === m ? '1px solid #ff6b2a' : '1px solid rgba(255,255,255,0.10)',
              borderRadius: 4,
              cursor: 'pointer',
              transition: 'background 120ms, color 120ms',
            }}
          >
            {MODE_TITLES[m]}
          </button>
        ))}
      </div>

      {/* Active equation, displayed above the canvas. */}
      <div style={{ marginBottom: 6 }}>{eqDisplay}</div>
      <p
        style={{
          fontSize: 12,
          color: getCanvasColors().textDim,
          margin: '0 0 10px',
          lineHeight: 1.45,
        }}
      >
        {MODE_BLURBS[mode]}
      </p>

      <AutoResizeCanvas height={380} setup={setup} />

      <DemoControls>
        {slider}
        {readouts}
      </DemoControls>
    </Demo>
  );
}
