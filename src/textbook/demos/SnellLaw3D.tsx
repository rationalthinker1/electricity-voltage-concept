/**
 * Demo 18.1b — Snell's law in 3D
 *
 * A horizontal flat interface (the x-z plane, y = 0) separates two media. By
 * default air sits above (n₁ = 1) and glass / water below (n₂, slider). A
 * single incoming ray strikes the origin from the upper-left, producing a
 * reflected ray (back up into n₁) and a refracted ray (down into n₂, bent
 * toward the normal because n₂ > n₁). A vertical normal stands at the point
 * of incidence; all four rays — incident, reflected, refracted, normal —
 * lie in a single "plane of incidence" (the x-y plane, z = 0), which can
 * be rendered as a faint translucent sheet so the reader sees the planarity.
 *
 * The reader can:
 *   - orbit the scene by dragging (look along z to see the canonical 2D
 *     refraction triangle),
 *   - vary the incidence angle θ₁ (0–89°),
 *   - vary the refractive index of the lower medium n₂ (1.0 to 2.5),
 *   - toggle the reflected ray and the plane-of-incidence sheet,
 *   - flip to "TIR mode": now light starts in n₂ going up, and above the
 *     critical angle the refracted ray vanishes — perfect mirror.
 *
 * Live readouts: θ₂, reflection coefficient R (Snell + Fresnel, unpolarised
 * average), and critical angle θ_c (defined only when going from a denser
 * medium into a rarer one).
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

// World scale of the half-plane patch (extent of the interface drawn).
const PLANE_HALF = 2.4;
// Ray length on each side of the interface (world units).
const RAY_LEN = 2.0;

export function SnellLaw3DDemo({ figure }: Props) {
  const [theta1Deg, setTheta1Deg] = useState(35);
  const [n2, setN2] = useState(1.5);
  const [showReflected, setShowReflected] = useState(true);
  const [showPlane, setShowPlane] = useState(true);
  const [tirMode, setTirMode] = useState(false);

  // Physics. When tirMode is off, light starts in n₁ = 1 (top) going down
  // into n₂ (bottom). When tirMode is on, light starts in n₂ (bottom) going
  // up into n₁ = 1 (top), and TIR can occur for θ₁ > θ_c.
  const computed = useMemo(() => {
    const theta1 = (theta1Deg * Math.PI) / 180;
    const n_in = tirMode ? n2 : 1.0;
    const n_out = tirMode ? 1.0 : n2;
    const sinT2 = (n_in / n_out) * Math.sin(theta1);
    const totalReflection = sinT2 > 1.0;
    const theta2 = totalReflection ? null : Math.asin(sinT2);

    // Critical angle (only meaningful when n_in > n_out).
    const thetaC = n_in > n_out ? Math.asin(n_out / n_in) : null;

    // Fresnel reflectance, unpolarised: R = (R_s + R_p) / 2.
    let R: number;
    if (totalReflection) {
      R = 1.0;
    } else {
      const c1 = Math.cos(theta1);
      const c2 = Math.cos(theta2!);
      const rs = (n_in * c1 - n_out * c2) / (n_in * c1 + n_out * c2);
      const rp = (n_out * c1 - n_in * c2) / (n_out * c1 + n_in * c2);
      R = (rs * rs + rp * rp) / 2;
    }
    return { theta1, theta2, totalReflection, thetaC, R, n_in, n_out };
  }, [theta1Deg, n2, tirMode]);

  const stateRef = useRef({ theta1Deg, n2, showReflected, showPlane, tirMode, computed });
  useEffect(() => {
    stateRef.current = { theta1Deg, n2, showReflected, showPlane, tirMode, computed };
  }, [theta1Deg, n2, showReflected, showPlane, tirMode, computed]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, canvas } = info;
    const cam: OrbitCamera = { yaw: 0.55, pitch: 0.28, distance: 7.5, fov: Math.PI / 4 };
    const dispose = attachOrbit(canvas, cam);
    let raf = 0;

    function draw() {
      const s = stateRef.current;
      const { theta1, theta2, totalReflection } = s.computed;

      ctx.fillStyle = getCanvasColors().bg;
      ctx.fillRect(0, 0, w, h);

      // Geometry. We always anchor the ray geometry to a fixed convention:
      // the incoming ray approaches the origin from the upper-left in
      // (x, y) with z = 0 (so the plane of incidence is the x-y plane).
      //
      // In normal mode (air → glass), the ray starts above (y > 0) and
      // continues down into the lower medium. In TIR mode (glass → air),
      // the geometry is mirrored vertically — the ray starts below and
      // heads up. Either way, "incident side" is medium n_in.
      const flip = s.tirMode ? -1 : 1; // +1 above, -1 below

      // The four key points (origin = strike point).
      const O = v3(0, 0, 0);
      // Incident: comes from the n_in side, upper-left in (x, y_flipped).
      const incidentStart = v3(-RAY_LEN * Math.sin(theta1), flip * RAY_LEN * Math.cos(theta1), 0);
      // Reflected: leaves the origin on the same side, mirror-symmetric.
      const reflectedEnd = v3(RAY_LEN * Math.sin(theta1), flip * RAY_LEN * Math.cos(theta1), 0);
      // Refracted: leaves the origin on the other side (only if no TIR).
      let refractedEnd: Vec3 | null = null;
      if (!totalReflection && theta2 != null) {
        refractedEnd = v3(RAY_LEN * Math.sin(theta2), -flip * RAY_LEN * Math.cos(theta2), 0);
      }

      // Normal: full vertical line, both above and below origin.
      const normalTop = v3(0, RAY_LEN * 0.95, 0);
      const normalBot = v3(0, -RAY_LEN * 0.95, 0);

      // ─── 1. Lower medium volume (subtle filled box, drawn before plane) ───
      // We hint the dense medium by drawing a translucent "floor" beneath
      // the interface plane (or above, if tirMode). It's deliberately
      // simple: an offset translucent quad parallel to the interface, plus
      // a few vertical posts to give depth.
      drawMediumVolume(ctx, cam, w, h, flip, s.n2);

      // ─── 2. Plane of incidence (faint sheet, x-y plane) ───
      if (s.showPlane) {
        const sheetCorners: Vec3[] = [
          v3(-PLANE_HALF * 0.9, -PLANE_HALF * 0.9, 0),
          v3(PLANE_HALF * 0.9, -PLANE_HALF * 0.9, 0),
          v3(PLANE_HALF * 0.9, PLANE_HALF * 0.9, 0),
          v3(-PLANE_HALF * 0.9, PLANE_HALF * 0.9, 0),
        ];
        const c2 = sheetCorners.map((p) => project(p, cam, w, h));
        ctx.fillStyle = 'rgba(255,107,42,0.06)';
        ctx.beginPath();
        ctx.moveTo(c2[0]!.x, c2[0]!.y);
        for (let i = 1; i < 4; i++) ctx.lineTo(c2[i]!.x, c2[i]!.y);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = getCanvasColors().accentSoft;
        ctx.setLineDash([5, 4]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(c2[0]!.x, c2[0]!.y);
        for (let i = 1; i < 4; i++) ctx.lineTo(c2[i]!.x, c2[i]!.y);
        ctx.closePath();
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // ─── 3. Interface plane (the surface, the x-z plane at y = 0) ───
      drawInterfacePlane(ctx, cam, w, h);

      // ─── 4. Normal line ───
      const nTopP = project(normalTop, cam, w, h);
      const nBotP = project(normalBot, cam, w, h);
      // Dashed grey; small ticks at top and bottom.
      ctx.save();
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = 'rgba(236,235,229,0.55)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(nTopP.x, nTopP.y);
      ctx.lineTo(nBotP.x, nBotP.y);
      ctx.stroke();
      ctx.restore();
      // Label "n̂" near the top of the normal.
      ctx.fillStyle = getCanvasColors().text;
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('n̂', nTopP.x + 6, nTopP.y - 2);

      // ─── 5. Angle arcs at the origin ───
      // Tiny 2D arcs drawn in screen space, on the side of each ray.
      drawAngleArc(ctx, cam, w, h, 0.45, flip, theta1, 'theta1');
      if (!totalReflection && theta2 != null) {
        drawAngleArc(ctx, cam, w, h, 0.45, -flip, theta2, 'theta2');
      }

      // ─── 6. The rays themselves ───
      // Incident: amber, the bright source.
      const inP1 = project(incidentStart, cam, w, h);
      const inP2 = project(O, cam, w, h);
      drawArrow3D(ctx, inP1, inP2, {
        color: 'rgba(255,107,42,0.95)',
        glow: 'rgba(255,107,42,0.30)',
        width: 2.2,
        glowWidth: 8,
      });

      // Reflected: pink, optional.
      if (s.showReflected) {
        const refP1 = project(O, cam, w, h);
        const refP2 = project(reflectedEnd, cam, w, h);
        drawArrow3D(ctx, refP1, refP2, {
          color: 'rgba(255,59,110,0.92)',
          glow: 'rgba(255,59,110,0.22)',
          width: 1.8,
          glowWidth: 6,
          dashed: totalReflection ? false : false,
        });
      }

      // Refracted: teal. Only if there is one.
      if (refractedEnd) {
        const trP1 = project(O, cam, w, h);
        const trP2 = project(refractedEnd, cam, w, h);
        drawArrow3D(ctx, trP1, trP2, {
          color: 'rgba(108,197,194,0.95)',
          glow: 'rgba(108,197,194,0.25)',
          width: 2.0,
          glowWidth: 7,
        });
      } else {
        // TIR: replace the refracted ray with a "no transmission" tag
        // in the lower medium.
        const tagAnchor = v3(0.5, -flip * 0.5, 0);
        const t2 = project(tagAnchor, cam, w, h);
        ctx.fillStyle = getCanvasColors().accent;
        ctx.font = 'bold 11px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText('TIR — no transmitted ray', t2.x, t2.y);
      }

      // ─── 7. Labels and legend ───
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillStyle = getCanvasColors().textDim;
      ctx.fillText('drag to orbit · look along z to see the 2D triangle', 12, 12);

      ctx.textAlign = 'right';
      ctx.fillStyle = getCanvasColors().accent;
      ctx.fillText('incident', w - 12, 12);
      if (s.showReflected) {
        ctx.fillStyle = getCanvasColors().pink;
        ctx.fillText('reflected', w - 12, 28);
      }
      if (refractedEnd) {
        ctx.fillStyle = getCanvasColors().teal;
        ctx.fillText('refracted', w - 12, 44);
      }
      ctx.fillStyle = getCanvasColors().text;
      ctx.fillText('normal', w - 12, refractedEnd ? 60 : s.showReflected ? 44 : 28);

      // Medium labels in the corners of the interface.
      ctx.textAlign = 'left';
      ctx.fillStyle = getCanvasColors().text;
      const labelAbove = s.tirMode ? `n₁ = 1.00 (air)` : `n₁ = 1.00 (air)`;
      const labelBelow = `n₂ = ${s.n2.toFixed(2)}`;
      const aboveAnchor = project(v3(-PLANE_HALF * 0.85, 0.9, 0), cam, w, h);
      const belowAnchor = project(v3(-PLANE_HALF * 0.85, -0.9, 0), cam, w, h);
      ctx.fillText(labelAbove, aboveAnchor.x, aboveAnchor.y);
      ctx.fillText(labelBelow, belowAnchor.x, belowAnchor.y);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      dispose();
    };
  }, []);

  // Readout values.
  const theta2Display = computed.totalReflection ? null : (computed.theta2! * 180) / Math.PI;
  const thetaCDisplay = computed.thetaC == null ? null : (computed.thetaC * 180) / Math.PI;

  return (
    <Demo
      figure={figure ?? 'Fig. 18.1b'}
      title="Snell's law in 3D — the plane of incidence"
      question="When a ray hits glass at an angle, which way does it bend — and why does the whole geometry lie in one plane?"
      caption={
        <>
          An incoming ray strikes a horizontal air-glass interface. Snell's law bends the
          transmitted ray <em>toward</em> the normal because the glass has a larger refractive
          index. The incident, reflected, refracted, and normal rays all lie in a single plane (the
          plane of incidence) — a direct consequence of matching the tangential component of{' '}
          <strong>k</strong> across the boundary. Drag to orbit; tilt the camera until you're
          looking edge-on at that plane and the canonical 2D refraction triangle pops out of the 3D
          scene. Switch on TIR mode to send the ray the other way: above the critical angle, the
          boundary becomes a perfect mirror.
        </>
      }
      deeperLab={{ slug: 'poynting', label: 'Energy flow at boundaries' }}
    >
      <AutoResizeCanvas height={380} setup={setup} />
      <DemoControls>
        <MiniSlider
          label={'incidence θ₁'}
          value={theta1Deg}
          min={0}
          max={89}
          step={1}
          format={(v) => v.toFixed(0) + '°'}
          onChange={setTheta1Deg}
        />
        <MiniSlider
          label="index n₂"
          value={n2}
          min={1.0}
          max={2.5}
          step={0.01}
          format={(v) => v.toFixed(2)}
          onChange={setN2}
        />
        <MiniToggle
          label={showReflected ? 'reflected ray ON' : 'reflected ray OFF'}
          checked={showReflected}
          onChange={setShowReflected}
        />
        <MiniToggle
          label={showPlane ? 'plane of incidence ON' : 'plane of incidence OFF'}
          checked={showPlane}
          onChange={setShowPlane}
        />
        <MiniToggle
          label={tirMode ? 'TIR mode (n₂ → air)' : 'normal mode (air → n₂)'}
          checked={tirMode}
          onChange={setTirMode}
        />
        <MiniReadout
          label={'refraction θ₂'}
          value={theta2Display == null ? '—' : <Num value={theta2Display} />}
          unit={theta2Display == null ? '(TIR)' : '°'}
        />
        <MiniReadout
          label="reflectance R"
          value={<Num value={computed.R} />}
          unit={computed.totalReflection ? '(= 1, TIR)' : ''}
        />
        <MiniReadout
          label={'critical θ_c'}
          value={thetaCDisplay == null ? '—' : <Num value={thetaCDisplay} />}
          unit={thetaCDisplay == null ? '(no TIR this way)' : '°'}
        />
      </DemoControls>
    </Demo>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 *  Helpers
 * ────────────────────────────────────────────────────────────────────── */

interface Arrow3DOpts {
  color: string;
  glow: string;
  width: number;
  glowWidth: number;
  dashed?: boolean;
}

function drawArrow3D(ctx: CanvasRenderingContext2D, p1: Point2D, p2: Point2D, opts: Arrow3DOpts) {
  if (p1.depth <= 0 || p2.depth <= 0) return;
  // Glow + line via drawGlowPath.
  drawGlowPath(ctx, [p1, p2], {
    color: opts.color,
    lineWidth: opts.width,
    glowColor: opts.glow,
    glowWidth: opts.glowWidth,
  });

  // Screen-space arrowhead.
  const dx = p2.x - p1.x,
    dy = p2.y - p1.y;
  const len = Math.hypot(dx, dy);
  if (len < 4) return;
  const ux = dx / len,
    uy = dy / len;
  const head = 10,
    half = 5;
  ctx.fillStyle = opts.color;
  ctx.beginPath();
  ctx.moveTo(p2.x, p2.y);
  ctx.lineTo(p2.x - ux * head - uy * half, p2.y - uy * head + ux * half);
  ctx.lineTo(p2.x - ux * head + uy * half, p2.y - uy * head - ux * half);
  ctx.closePath();
  ctx.fill();
}

/**
 * Draw the interface (the surface) — a translucent square in the x-z plane
 * with a wireframe grid. Slightly tinted teal to read as "glass-ish".
 */
function drawInterfacePlane(ctx: CanvasRenderingContext2D, cam: OrbitCamera, w: number, h: number) {
  const corners: Vec3[] = [
    v3(-PLANE_HALF, 0, -PLANE_HALF),
    v3(PLANE_HALF, 0, -PLANE_HALF),
    v3(PLANE_HALF, 0, PLANE_HALF),
    v3(-PLANE_HALF, 0, PLANE_HALF),
  ];
  const c2 = corners.map((c) => project(c, cam, w, h));
  ctx.fillStyle = 'rgba(108,197,194,0.07)';
  ctx.beginPath();
  ctx.moveTo(c2[0]!.x, c2[0]!.y);
  for (let i = 1; i < 4; i++) ctx.lineTo(c2[i]!.x, c2[i]!.y);
  ctx.closePath();
  ctx.fill();
  // Border.
  ctx.strokeStyle = getCanvasColors().teal;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(c2[0]!.x, c2[0]!.y);
  for (let i = 1; i < 4; i++) ctx.lineTo(c2[i]!.x, c2[i]!.y);
  ctx.closePath();
  ctx.stroke();
  // Grid (every 0.6 units).
  ctx.strokeStyle = getCanvasColors().tealSoft;
  const step = 0.6;
  for (let g = -PLANE_HALF + step; g < PLANE_HALF - 1e-6; g += step) {
    const a = project(v3(g, 0, -PLANE_HALF), cam, w, h);
    const b = project(v3(g, 0, PLANE_HALF), cam, w, h);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    const c = project(v3(-PLANE_HALF, 0, g), cam, w, h);
    const d = project(v3(PLANE_HALF, 0, g), cam, w, h);
    ctx.beginPath();
    ctx.moveTo(c.x, c.y);
    ctx.lineTo(d.x, d.y);
    ctx.stroke();
  }
}

/**
 * Hint the denser medium's volume with a translucent quad parallel to the
 * interface, plus a few faint vertical edges. `flip = +1` means n₁ is above
 * (so n₂ fills below — depth ranges from y = 0 down to y = -depth). When
 * flip = -1 (TIR mode), the dense medium is the upper half — we mirror.
 */
function drawMediumVolume(
  ctx: CanvasRenderingContext2D,
  cam: OrbitCamera,
  w: number,
  h: number,
  flip: number,
  n2: number,
) {
  const depth = 0.9;
  const yBot = -flip * depth;
  const corners: Vec3[] = [
    v3(-PLANE_HALF, yBot, -PLANE_HALF),
    v3(PLANE_HALF, yBot, -PLANE_HALF),
    v3(PLANE_HALF, yBot, PLANE_HALF),
    v3(-PLANE_HALF, yBot, PLANE_HALF),
  ];
  const c2 = corners.map((c) => project(c, cam, w, h));
  // Tint scales gently with n2 — denser glass reads slightly more saturated.
  const alpha = 0.05 + Math.min(0.1, (n2 - 1.0) * 0.05);
  ctx.fillStyle = `rgba(91,174,248,${alpha.toFixed(3)})`;
  ctx.beginPath();
  ctx.moveTo(c2[0]!.x, c2[0]!.y);
  for (let i = 1; i < 4; i++) ctx.lineTo(c2[i]!.x, c2[i]!.y);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = `rgba(91,174,248,${(0.18 + alpha * 1.5).toFixed(3)})`;
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 4]);
  ctx.beginPath();
  ctx.moveTo(c2[0]!.x, c2[0]!.y);
  for (let i = 1; i < 4; i++) ctx.lineTo(c2[i]!.x, c2[i]!.y);
  ctx.closePath();
  ctx.stroke();
  // Vertical posts from the four bottom corners up to the interface.
  for (let i = 0; i < 4; i++) {
    const top = project(v3(corners[i]!.x, 0, corners[i]!.z), cam, w, h);
    ctx.beginPath();
    ctx.moveTo(c2[i]!.x, c2[i]!.y);
    ctx.lineTo(top.x, top.y);
    ctx.stroke();
  }
  ctx.setLineDash([]);
}

/**
 * Draw a small 2D arc at the origin to mark an angle measured from the
 * normal. `side`: +1 places the arc on the upper side (y > 0), -1 lower.
 * `flipX`: ray sits to the left of the normal (incident) vs the right
 * (reflected/refracted). Here we colour-code by `kind`.
 *
 * Approach: project the three vertices of the arc's bounding sector — the
 * origin, a point along the normal, and a point along the ray — and draw a
 * 2D arc in screen space between the two off-origin vertices, centred at
 * the projected origin. For small angles this matches the true 3D arc
 * to within a pixel, and it always reads as an angle marker.
 */
function drawAngleArc(
  ctx: CanvasRenderingContext2D,
  cam: OrbitCamera,
  w: number,
  h: number,
  arcWorldR: number,
  ySide: number,
  theta: number,
  kind: 'theta1' | 'theta2',
) {
  // 3D vertices.
  const O = project(v3(0, 0, 0), cam, w, h);
  // Normal direction at the strike side: along +y if ySide>0.
  const nEnd = project(v3(0, ySide * arcWorldR, 0), cam, w, h);
  // Ray direction in (x, y) plane. Incident lives to the LEFT (x<0) on
  // the n_in side; transmitted/reflected sit to the RIGHT.
  // For kind=theta1, the arc swings from the (upward or downward) normal
  // toward the incident ray on the LEFT (x<0).
  // For kind=theta2, the arc swings from the normal on the OPPOSITE side
  // toward the refracted ray on the RIGHT (x>0).
  const xSign = kind === 'theta1' ? -1 : +1;
  const rayEnd = project(
    v3(xSign * arcWorldR * Math.sin(theta), ySide * arcWorldR * Math.cos(theta), 0),
    cam,
    w,
    h,
  );
  const a1 = Math.atan2(nEnd.y - O.y, nEnd.x - O.x);
  const a2 = Math.atan2(rayEnd.y - O.y, rayEnd.x - O.x);
  // Use the average screen-space radius — projection foreshortening can
  // make the two endpoints land at slightly different distances from O.
  const r1 = Math.hypot(nEnd.x - O.x, nEnd.y - O.y);
  const r2 = Math.hypot(rayEnd.x - O.x, rayEnd.y - O.y);
  const r = (r1 + r2) / 2;

  // Always sweep along the short way.
  let da = a2 - a1;
  while (da > Math.PI) da -= 2 * Math.PI;
  while (da < -Math.PI) da += 2 * Math.PI;

  const colour = kind === 'theta1' ? 'rgba(255,107,42,0.85)' : 'rgba(108,197,194,0.85)';
  ctx.strokeStyle = colour;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(O.x, O.y, r, a1, a1 + da, da < 0);
  ctx.stroke();

  // Tiny label at the mid-angle.
  const aMid = a1 + da / 2;
  const labR = r + 12;
  const lx = O.x + labR * Math.cos(aMid);
  const ly = O.y + labR * Math.sin(aMid);
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = colour;
  ctx.fillText(kind === 'theta1' ? 'θ₁' : 'θ₂', lx, ly);
}
