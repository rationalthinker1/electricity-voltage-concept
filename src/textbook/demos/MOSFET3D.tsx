/**
 * Demo D14.5b — n-channel MOSFET in 3D
 *
 * A 3D cross-section companion to the 2D MOSFETOperation demo. The reader
 * orbits the device, raises V_GS past V_T, and watches the inversion-layer
 * channel light up underneath the gate oxide. With V_DS > 0 and a channel
 * present, the electron dots in the inversion layer drift from source to
 * drain at a velocity proportional to V_DS.
 *
 * Geometry (world units, x along channel, y up, z width):
 *   - p-substrate:  large translucent blue box at the bottom.
 *   - n+ source:    small green box at top-left, slightly inset.
 *   - n+ drain:     small green box at top-right.
 *   - gate oxide:   thin pale slab covering the gap between S and D.
 *   - gate (metal): grey slab sitting on top of the oxide.
 *
 * Square-law: I_D = (k_n/2)(V_GS - V_T)² in saturation,
 *             I_D = k_n[(V_GS - V_T)V_DS - V_DS²/2] in triode.
 * V_T = 0.7 V (problem brief default), k_n = 2 mA/V².
 *
 * See Sedra & Smith §5.2 for the model, Streetman & Banerjee §8 for the
 * surface-inversion picture, Kahng & Atalla 1960 for the device.
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

const V_T = 0.7; // V — threshold voltage (problem brief default)
const K_N = 2e-3; // A/V² — transconductance parameter

function drainCurrent(V_GS: number, V_DS: number): number {
  const Vov = V_GS - V_T;
  if (Vov <= 0) return 0;
  if (V_DS < Vov) {
    return K_N * (Vov * V_DS - (V_DS * V_DS) / 2);
  }
  return (K_N / 2) * Vov * Vov;
}

function regimeLabel(V_GS: number, V_DS: number): 'cutoff' | 'triode' | 'saturation' {
  const Vov = V_GS - V_T;
  if (Vov <= 0) return 'cutoff';
  return V_DS < Vov ? 'triode' : 'saturation';
}

/* ──────────────────────────────────────────────────────────────────────
 *  Device geometry. All in world units; the camera sits ~6 units back.
 *  X is the source→drain axis, Y is up (gate above substrate), Z is
 *  width.
 * ────────────────────────────────────────────────────────────────────── */
const SUB = { x0: -2.0, x1: 2.0, y0: -1.0, y1: 0.0, z0: -1.0, z1: 1.0 };
const SRC = { x0: -1.7, x1: -0.9, y0: -0.25, y1: 0.0, z0: -0.8, z1: 0.8 };
const DRN = { x0: 0.9, x1: 1.7, y0: -0.25, y1: 0.0, z0: -0.8, z1: 0.8 };
const OXIDE = { x0: -0.9, x1: 0.9, y0: 0.0, y1: 0.1, z0: -0.8, z1: 0.8 };
const GATE = { x0: -0.9, x1: 0.9, y0: 0.1, y1: 0.4, z0: -0.8, z1: 0.8 };

// Channel slice: just inside the substrate, directly under the oxide.
const CHAN_Y = -0.04;
const CHAN_X0 = -0.9,
  CHAN_X1 = 0.9;
const CHAN_Z0 = -0.7,
  CHAN_Z1 = 0.7;

interface BoxStyle {
  fill: string;
  edge: string;
  edgeWidth: number;
  backEdge?: string;
}

function boxCorners(b: typeof SUB): Vec3[] {
  return [
    v3(b.x0, b.y0, b.z0),
    v3(b.x1, b.y0, b.z0),
    v3(b.x1, b.y0, b.z1),
    v3(b.x0, b.y0, b.z1),
    v3(b.x0, b.y1, b.z0),
    v3(b.x1, b.y1, b.z0),
    v3(b.x1, b.y1, b.z1),
    v3(b.x0, b.y1, b.z1),
  ];
}

// Edge pairs (vertex indices) of a box, in the order produced by boxCorners.
const BOX_EDGES: Array<[number, number]> = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 0], // bottom
  [4, 5],
  [5, 6],
  [6, 7],
  [7, 4], // top
  [0, 4],
  [1, 5],
  [2, 6],
  [3, 7], // verticals
];

// Quad faces; vertex order chosen so that the cross product of adjacent
// edges gives an outward normal. Used for translucent fills + face culling.
const BOX_FACES: Array<[number, number, number, number]> = [
  [0, 3, 2, 1], // bottom (y = y0, normal -y)
  [4, 5, 6, 7], // top    (y = y1, normal +y)
  [0, 1, 5, 4], // front  (z = z0, normal -z)
  [2, 3, 7, 6], // back   (z = z1, normal +z)
  [1, 2, 6, 5], // right  (x = x1, normal +x)
  [3, 0, 4, 7], // left   (x = x0, normal -x)
];

function faceNormal(face: [number, number, number, number]): Vec3 {
  // All faces lie on an axis-aligned plane; outward normals are constant
  // per face index. Precomputed:
  //   0: (0,-1,0)  1: (0,+1,0)
  //   2: (0,0,-1)  3: (0,0,+1)
  //   4: (+1,0,0)  5: (-1,0,0)
  // (face is unused — kept for API symmetry.)
  void face;
  return v3(0, 0, 0);
}

function drawBox(
  ctx: CanvasRenderingContext2D,
  b: typeof SUB,
  style: BoxStyle,
  cam: OrbitCamera,
  w: number,
  h: number,
) {
  const corners = boxCorners(b);
  const proj: Point2D[] = corners.map((c) => project(c, cam, w, h));
  if (proj.some((p) => p.depth <= 0)) return;

  // Translucent fills for the visible (front-facing) faces only.
  const NORMALS: Vec3[] = [
    v3(0, -1, 0),
    v3(0, 1, 0),
    v3(0, 0, -1),
    v3(0, 0, 1),
    v3(1, 0, 0),
    v3(-1, 0, 0),
  ];
  // Camera forward direction (from origin toward eye): rotate (0,0,1)
  // by -yaw, -pitch. The simplest is to ask: a face is visible if its
  // centre projects in front of all other face centres on that axis;
  // equivalently, the dot of its world normal with the camera-look-vector
  // is positive. Build the look vector from cam orientation.
  const cy = Math.cos(cam.yaw),
    sy = Math.sin(cam.yaw);
  const cp = Math.cos(cam.pitch),
    sp = Math.sin(cam.pitch);
  // Camera position in world space (cam looks toward origin from this point).
  // World→camera: rotate yaw around y, then pitch around x. Camera is at
  // (0, 0, distance) in cam space; transform back:
  const camPos: Vec3 = {
    x: cam.distance * cy * sp * 0 + cam.distance * sy * cp,
    y: cam.distance * sp,
    z: cam.distance * cy * cp,
  };
  void faceNormal; // suppress unused

  for (let f = 0; f < BOX_FACES.length; f++) {
    const face = BOX_FACES[f]!;
    const n = NORMALS[f]!;
    const c0 = corners[face[0]]!;
    const c2 = corners[face[2]]!;
    const centre = v3((c0.x + c2.x) / 2, (c0.y + c2.y) / 2, (c0.z + c2.z) / 2);
    // Outward face is visible if (camPos - centre) · n > 0.
    const dx = camPos.x - centre.x,
      dy = camPos.y - centre.y,
      dz = camPos.z - centre.z;
    const facing = dx * n.x + dy * n.y + dz * n.z;
    if (facing <= 0) continue;

    ctx.fillStyle = style.fill;
    ctx.beginPath();
    const p0 = proj[face[0]]!,
      p1 = proj[face[1]]!,
      p2 = proj[face[2]]!,
      p3 = proj[face[3]]!;
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.closePath();
    ctx.fill();
  }

  // Edges: two passes. Back-facing (dashed faint) first, front-facing
  // (solid) on top. We approximate "back-facing" by checking whether
  // both adjacent faces of an edge are back-facing — but for clarity
  // and given the small device, we just draw all edges as a single
  // solid wireframe with a translucent dashed underlay for the rear
  // four edges (the verticals of the back face are the canonical "back
  // edges" 8..11 with specific corner indices).
  ctx.strokeStyle = style.backEdge ?? style.edge;
  ctx.lineWidth = style.edgeWidth;
  ctx.setLineDash([3, 4]);
  ctx.beginPath();
  // Edges that lie in the back (largest depth) corner pairs.
  const depths = proj.map((p) => p.depth);
  for (const [a, c] of BOX_EDGES) {
    const da = depths[a]!,
      dc = depths[c]!;
    const isBack = (da + dc) / 2 > cam.distance;
    if (!isBack) continue;
    const pa = proj[a]!,
      pc = proj[c]!;
    ctx.moveTo(pa.x, pa.y);
    ctx.lineTo(pc.x, pc.y);
  }
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.strokeStyle = style.edge;
  ctx.lineWidth = style.edgeWidth;
  ctx.beginPath();
  for (const [a, c] of BOX_EDGES) {
    const da = depths[a]!,
      dc = depths[c]!;
    const isBack = (da + dc) / 2 > cam.distance;
    if (isBack) continue;
    const pa = proj[a]!,
      pc = proj[c]!;
    ctx.moveTo(pa.x, pa.y);
    ctx.lineTo(pc.x, pc.y);
  }
  ctx.stroke();
}

interface Electron {
  x: number;
  z: number;
  vx: number; // jitter velocity
  vz: number;
}

export function MOSFET3DDemo({ figure }: Props) {
  const [V_GS, setVGS] = useState(2.0);
  const [V_DS, setVDS] = useState(1.0);
  const [showField, setShowField] = useState(true);

  const I_D = useMemo(() => drainCurrent(V_GS, V_DS), [V_GS, V_DS]);
  const regime = useMemo(() => regimeLabel(V_GS, V_DS), [V_GS, V_DS]);
  const Vov = Math.max(0, V_GS - V_T);

  const stateRef = useRef({ V_GS, V_DS, showField });
  useEffect(() => {
    stateRef.current = { V_GS, V_DS, showField };
  }, [V_GS, V_DS, showField]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w: W, h: H, canvas } = info;
    let raf = 0;

    const cam: OrbitCamera = { yaw: 0.7, pitch: 0.45, distance: 6.5, fov: Math.PI / 4 };
    const dispose = attachOrbit(canvas, cam);

    // Persistent electron cloud. ~80 dots; spawned across the channel
    // footprint and re-cycled when they reach the drain edge.
    const N_ELECTRONS = 80;
    const electrons: Electron[] = [];
    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    for (let i = 0; i < N_ELECTRONS; i++) {
      electrons.push({
        x: rand(CHAN_X0, CHAN_X1),
        z: rand(CHAN_Z0, CHAN_Z1),
        vx: rand(-0.02, 0.02),
        vz: rand(-0.02, 0.02),
      });
    }

    let last = performance.now();

    function draw(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = stateRef.current;
      const overdrive = Math.max(0, s.V_GS - V_T);
      const channelOn = overdrive > 0;

      ctx.fillStyle = getCanvasColors().bg;
      ctx.fillRect(0, 0, W, H);

      // Painter's-algorithm-friendly draw order: substrate first
      // (largest, deepest), then source/drain inset inside its top,
      // then oxide, then gate. The opaque-fill faces are translucent,
      // so back-to-front order matters only mildly; depth-tested
      // wireframes do most of the heavy lifting visually.

      // 1. p-substrate (translucent blue).
      drawBox(
        ctx,
        SUB,
        {
          fill: 'rgba(91,174,248,0.12)',
          edge: 'rgba(91,174,248,0.55)',
          backEdge: 'rgba(91,174,248,0.25)',
          edgeWidth: 1.1,
        },
        cam,
        W,
        H,
      );

      // 2. Inversion layer glow (only when V_GS > V_T). Drawn before
      //    source / drain so the dots can sit on top of it.
      if (channelOn) {
        // A translucent amber slab across the channel footprint, drawn
        // as a glowing strip on top of the substrate near y = 0. Build
        // the four corners of the channel rectangle at CHAN_Y and stroke
        // its rim as a glow path; fill it lightly.
        const cs = [
          v3(CHAN_X0, CHAN_Y, CHAN_Z0),
          v3(CHAN_X1, CHAN_Y, CHAN_Z0),
          v3(CHAN_X1, CHAN_Y, CHAN_Z1),
          v3(CHAN_X0, CHAN_Y, CHAN_Z1),
        ].map((p) => project(p, cam, W, H));
        const a = Math.min(0.55, 0.1 + 0.25 * overdrive);
        ctx.fillStyle = `rgba(255,107,42,${a.toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(cs[0]!.x, cs[0]!.y);
        for (let i = 1; i < 4; i++) ctx.lineTo(cs[i]!.x, cs[i]!.y);
        ctx.closePath();
        ctx.fill();
        // Glowing rim — "channel turning on" moment.
        drawGlowPath(ctx, [...cs, cs[0]!], {
          color: `rgba(255,107,42,${(0.55 + 0.35 * Math.min(1, overdrive / 2)).toFixed(3)})`,
          lineWidth: 1.6,
          glowWidth: 9,
          glowColor: `rgba(255,107,42,${(0.18 + 0.18 * Math.min(1, overdrive / 2)).toFixed(3)})`,
        });
      }

      // 3. n+ source (translucent green).
      drawBox(
        ctx,
        SRC,
        {
          fill: 'rgba(140,220,150,0.22)',
          edge: 'rgba(140,220,150,0.85)',
          backEdge: 'rgba(140,220,150,0.30)',
          edgeWidth: 1.2,
        },
        cam,
        W,
        H,
      );
      // 4. n+ drain (translucent green).
      drawBox(
        ctx,
        DRN,
        {
          fill: 'rgba(140,220,150,0.22)',
          edge: 'rgba(140,220,150,0.85)',
          backEdge: 'rgba(140,220,150,0.30)',
          edgeWidth: 1.2,
        },
        cam,
        W,
        H,
      );

      // 5. Gate oxide (thin pale slab, very translucent).
      drawBox(
        ctx,
        OXIDE,
        {
          fill: 'rgba(255,255,255,0.10)',
          edge: 'rgba(255,255,255,0.50)',
          backEdge: 'rgba(255,255,255,0.18)',
          edgeWidth: 0.9,
        },
        cam,
        W,
        H,
      );

      // 6. Gate (gray slab with an amber tint to mark it as the control terminal).
      drawBox(
        ctx,
        GATE,
        {
          fill: 'rgba(160,158,149,0.22)',
          edge: 'rgba(255,107,42,0.80)',
          backEdge: 'rgba(255,107,42,0.30)',
          edgeWidth: 1.3,
        },
        cam,
        W,
        H,
      );

      // 7. Drift the electron cloud. Each step the dots drift +x at a
      //    velocity proportional to V_DS (saturation caps it: beyond
      //    V_OV the channel pinches and the carriers no longer accelerate
      //    longitudinally inside the conduction part of the channel).
      const driftSpeed = channelOn
        ? Math.min(s.V_DS, overdrive) * 0.45 + 0.04 // scaled for visibility
        : 0;
      for (const e of electrons) {
        if (channelOn) {
          // Persistent left-to-right drift + small Brownian jitter.
          e.x += (driftSpeed + e.vx) * dt;
          e.z += e.vz * dt;
          e.vx += rand(-0.4, 0.4) * dt;
          e.vz += rand(-0.4, 0.4) * dt;
          // Light damping so jitter doesn't blow up.
          e.vx *= 0.96;
          e.vz *= 0.96;
          if (e.z < CHAN_Z0) e.z = CHAN_Z0;
          if (e.z > CHAN_Z1) e.z = CHAN_Z1;
          if (e.x > CHAN_X1) {
            // Recycle at the source side.
            e.x = CHAN_X0 + rand(0, 0.05);
            e.z = rand(CHAN_Z0, CHAN_Z1);
          }
        }
      }

      if (channelOn) {
        const dotAlpha = Math.min(1, 0.45 + 0.4 * Math.min(1, overdrive / 2));
        const projected = electrons.map((e) => ({
          p: project(v3(e.x, CHAN_Y, e.z), cam, W, H),
        }));
        // Depth-sort dots so far ones draw first.
        const order = projected
          .map((_, i) => i)
          .sort((a, b) => projected[b]!.p.depth - projected[a]!.p.depth);
        for (const i of order) {
          const { p } = projected[i]!;
          if (p.depth <= 0) continue;
          // Size attenuates slightly with depth.
          const t = Math.max(0, Math.min(1, (cam.distance + 2 - p.depth) / 4));
          const r = 1.6 + 1.6 * t;
          ctx.fillStyle = `rgba(91,174,248,${(dotAlpha * (0.55 + 0.45 * t)).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 8. Field arrows (toggled). Vertical E from gate into channel +
      //    horizontal E from drain to source along the channel (when V_DS > 0).
      if (s.showField) {
        // Vertical arrows: a grid across the gate footprint, pointing
        // from the gate down to just above the channel.
        const NX = 4,
          NZ = 3;
        for (let i = 0; i < NX; i++) {
          for (let j = 0; j < NZ; j++) {
            const t = (i + 0.5) / NX;
            const u = (j + 0.5) / NZ;
            const x = OXIDE.x0 + t * (OXIDE.x1 - OXIDE.x0);
            const z = OXIDE.z0 + u * (OXIDE.z1 - OXIDE.z0);
            const top = project(v3(x, GATE.y0 - 0.02, z), cam, W, H);
            const bot = project(v3(x, CHAN_Y + 0.02, z), cam, W, H);
            if (top.depth <= 0 || bot.depth <= 0) continue;
            // Intensity tracks V_GS (clamped 0..1.5 for visual scaling).
            const k = Math.min(1, s.V_GS / 3);
            ctx.strokeStyle = `rgba(255,59,110,${(0.45 + 0.35 * k).toFixed(3)})`;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(top.x, top.y);
            ctx.lineTo(bot.x, bot.y);
            ctx.stroke();
            // Arrowhead in screen space.
            const dx = bot.x - top.x,
              dy = bot.y - top.y;
            const len = Math.hypot(dx, dy);
            if (len > 4) {
              const ux = dx / len,
                uy = dy / len;
              ctx.fillStyle = `rgba(255,59,110,${(0.55 + 0.35 * k).toFixed(3)})`;
              ctx.beginPath();
              ctx.moveTo(bot.x, bot.y);
              ctx.lineTo(bot.x - ux * 6 - uy * 3, bot.y - uy * 6 + ux * 3);
              ctx.lineTo(bot.x - ux * 6 + uy * 3, bot.y - uy * 6 - ux * 3);
              ctx.closePath();
              ctx.fill();
            }
          }
        }

        // Lateral arrows (drain→source along the channel) when V_DS > 0
        // and a channel exists. We draw with the conventional E direction
        // — pointing from higher potential (drain, +x) toward source (-x).
        if (channelOn && s.V_DS > 0) {
          const NZ_LAT = 3;
          for (let j = 0; j < NZ_LAT; j++) {
            const u = (j + 0.5) / NZ_LAT;
            const z = CHAN_Z0 + u * (CHAN_Z1 - CHAN_Z0);
            const tail = project(v3(CHAN_X1 - 0.05, CHAN_Y + 0.02, z), cam, W, H);
            const head = project(v3(CHAN_X0 + 0.05, CHAN_Y + 0.02, z), cam, W, H);
            if (tail.depth <= 0 || head.depth <= 0) continue;
            const k = Math.min(1, s.V_DS / 3);
            ctx.strokeStyle = `rgba(108,197,194,${(0.45 + 0.4 * k).toFixed(3)})`;
            ctx.lineWidth = 1.3;
            ctx.beginPath();
            ctx.moveTo(tail.x, tail.y);
            ctx.lineTo(head.x, head.y);
            ctx.stroke();
            const dx = head.x - tail.x,
              dy = head.y - tail.y;
            const len = Math.hypot(dx, dy);
            if (len > 4) {
              const ux = dx / len,
                uy = dy / len;
              ctx.fillStyle = `rgba(108,197,194,${(0.55 + 0.4 * k).toFixed(3)})`;
              ctx.beginPath();
              ctx.moveTo(head.x, head.y);
              ctx.lineTo(head.x - ux * 6 - uy * 3, head.y - uy * 6 + ux * 3);
              ctx.lineTo(head.x - ux * 6 + uy * 3, head.y - uy * 6 - ux * 3);
              ctx.closePath();
              ctx.fill();
            }
          }
        }
      }

      // 9. Labels.
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textBaseline = 'top';

      const labelAt = (world: Vec3, text: string, color: string) => {
        const p = project(world, cam, W, H);
        if (p.depth <= 0) return;
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.fillText(text, p.x, p.y);
      };
      labelAt(v3((SRC.x0 + SRC.x1) / 2, SRC.y1 + 0.05, 0), 'S (n+)', 'rgba(140,220,150,0.95)');
      labelAt(v3((DRN.x0 + DRN.x1) / 2, DRN.y1 + 0.05, 0), 'D (n+)', 'rgba(140,220,150,0.95)');
      labelAt(v3(0, GATE.y1 + 0.1, 0), 'G (gate)', 'rgba(255,107,42,0.95)');
      labelAt(v3(0, GATE.y0 - 0.2, OXIDE.z1 + 0.18), 'oxide', 'rgba(236,235,229,0.7)');
      labelAt(v3(0, SUB.y0 + 0.18, SUB.z1 - 0.05), 'p-substrate (body)', 'rgba(91,174,248,0.9)');

      // Top-left help.
      ctx.fillStyle = getCanvasColors().textDim;
      ctx.textAlign = 'left';
      ctx.fillText('drag to rotate', 12, 12);

      // Bottom-right status banner — regime + channel-on/off.
      ctx.textAlign = 'right';
      const status = channelOn
        ? `channel ON · V_OV = ${overdrive.toFixed(2)} V`
        : `channel OFF · below V_T = ${V_T.toFixed(2)} V`;
      ctx.fillStyle = channelOn ? 'rgba(255,107,42,0.95)' : 'rgba(160,158,149,0.7)';
      ctx.fillText(status, W - 12, 12);

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
      figure={figure ?? 'Fig. 14.5b'}
      title="Inside the MOSFET — the inversion layer in 3D"
      question="Where, physically, does the channel of the MOSFET sit — and what makes it appear?"
      caption={
        <>
          Drag to rotate. Below threshold (V<sub>GS</sub> &lt; V<sub>T</sub> ≈ 0.7 V) the green
          source and drain are isolated by a slab of p-type substrate and no current can flow. Push
          V<sub>GS</sub> past V<sub>T</sub> and the gate field — pink, pointing down through the SiO
          <sub>2</sub> — pulls electrons up to the surface; an
          <strong>inversion layer</strong> lights up directly under the oxide, bridging source to
          drain. Apply V<sub>DS</sub> and those electrons drift from source to drain, carrying the
          drain current. Toggle the field arrows to see both the vertical (gate-to-channel) and
          lateral (drain-to-source) components.
        </>
      }
    >
      <AutoResizeCanvas height={360} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="V_GS"
          value={V_GS}
          min={0}
          max={5}
          step={0.02}
          format={(v) => v.toFixed(2) + ' V'}
          onChange={setVGS}
        />
        <MiniSlider
          label="V_DS"
          value={V_DS}
          min={0}
          max={5}
          step={0.02}
          format={(v) => v.toFixed(2) + ' V'}
          onChange={setVDS}
        />
        <MiniToggle
          label={showField ? 'field lines SHOWN' : 'field lines hidden'}
          checked={showField}
          onChange={setShowField}
        />
        <MiniReadout label="V_T" value={V_T.toFixed(2)} unit="V" />
        <MiniReadout label="V_OV" value={Vov.toFixed(2)} unit="V" />
        <MiniReadout label="I_D" value={<Num value={I_D} />} unit="A" />
        <MiniReadout label="regime" value={regime} />
      </DemoControls>
    </Demo>
  );
}
