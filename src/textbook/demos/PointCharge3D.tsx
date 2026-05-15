/**
 * Demo 1.x — A point charge's E-field in 3D
 *
 * A single point charge sits at the origin. Around it, on an invisible
 * sphere of (user-chosen) radius r, we render ~80 short radial arrows on
 * a lat/long grid. For a positive charge they point outward; for a
 * negative one, inward.
 *
 * The pedagogical punchline is geometric. The arrow LENGTH is set by the
 * field magnitude |E| = k|q|/r², so when the reader drags r from 1 to 2
 * normalised units the whole spiky-sphere shrinks by exactly 4×. The
 * "ratio" readout — |E(r)| / |E(2r)| — locks to 4.000 no matter what
 * else changes, which is the inverse-square law expressed as a single
 * number you can watch.
 *
 * Camera orbits via shared OrbitCamera (drag to rotate). Painter-sort
 * arrows by depth so back-side ones read fainter than front-side ones.
 * The central charge gets a soft glow via drawGlowPath on its silhouette
 * outline.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider, MiniToggle } from '@/components/Demo';
import { Num } from '@/components/Num';
import { drawGlowPath } from '@/lib/canvasPrimitives';
import { getCanvasColors } from '@/lib/canvasTheme';
import {
  attachOrbit, project, v3,
  type OrbitCamera, type Vec3,
} from '@/lib/projection3d';

interface Props { figure?: string }

/* ───── Geometry constants ──────────────────────────────────────────── */

// Charge sphere radius in normalised world units (visual only — the
// "point" charge is rendered as a small ball so the eye has a target).
const CHARGE_RADIUS = 0.18;

// Lat/long grid resolution for the field-sampling sphere.
// 8 latitude bands × 10 longitudes = 80 arrows, modulo endpoint
// merging at the poles (we collapse latitude 0 and N to single points).
const N_LAT = 8;
const N_LON = 10;

// Normalised "Coulomb constant" used purely to scale arrow lengths so
// the geometry reads at a glance. The displayed |E| readout uses the
// same k, so the ratio (the pedagogical point) is k-independent anyway.
const K_NORM = 1.0;

// Visual scale factor on arrow length. The raw magnitude k|q|/r² can
// span a wide dynamic range across the slider; we clamp the displayed
// length to a friendly band so the sphere of arrows always reads.
const ARROW_VISUAL_GAIN = 0.45;
const ARROW_MIN_LEN = 0.08;
const ARROW_MAX_LEN = 0.95;

/* ───── Arrow geometry (lat/long, radial) ───────────────────────────── */

interface RadialArrow {
  // Anchor point on the sample sphere (for depth-sort).
  anchor: Vec3;
  // Foot and tip of the radial arrow (outward-pointing unit vector
  // multiplied by length, originating at the anchor for q>0; for q<0
  // we swap so the tip ends ON the sample sphere instead).
  from: Vec3;
  to: Vec3;
}

/** Build the sampling-sphere arrow list for a given r, q, sign. */
function buildArrows(
  rSphere: number, eVisualLen: number, sign: 1 | -1,
): RadialArrow[] {
  const arrows: RadialArrow[] = [];
  for (let i = 0; i < N_LAT; i++) {
    // theta runs from a small offset away from the poles to avoid
    // arrow clustering at the +y / -y caps. Mid-latitude offset 0.5
    // centres each band.
    const theta = ((i + 0.5) / N_LAT) * Math.PI;
    const sT = Math.sin(theta);
    const cT = Math.cos(theta);
    for (let j = 0; j < N_LON; j++) {
      const phi = (j / N_LON) * 2 * Math.PI;
      const cP = Math.cos(phi);
      const sP = Math.sin(phi);
      // Outward unit normal at this (theta, phi).
      const nx = sT * cP;
      const ny = cT;
      const nz = sT * sP;
      const anchor = v3(rSphere * nx, rSphere * ny, rSphere * nz);
      // Foot/tip depend on sign.
      // For q > 0, arrow points OUTWARD from the sample sphere.
      // For q < 0, arrow points INWARD to the sample sphere (i.e.
      // the tip sits ON the sample sphere and the foot is further out).
      let from: Vec3, to: Vec3;
      if (sign > 0) {
        from = anchor;
        to = v3(
          (rSphere + eVisualLen) * nx,
          (rSphere + eVisualLen) * ny,
          (rSphere + eVisualLen) * nz,
        );
      } else {
        from = v3(
          (rSphere + eVisualLen) * nx,
          (rSphere + eVisualLen) * ny,
          (rSphere + eVisualLen) * nz,
        );
        to = anchor;
      }
      arrows.push({ anchor, from, to });
    }
  }
  return arrows;
}

/* ───── Component ───────────────────────────────────────────────────── */

export function PointCharge3DDemo({ figure }: Props) {
  const [positive, setPositive] = useState(true);
  const [q, setQ] = useState(1.5);            // normalised units
  const [rSample, setRSample] = useState(2.0); // normalised units

  // Physics readouts. Pure |E| = k|q|/r²; ratio is the geometric punch.
  const computed = useMemo(() => {
    const Emag = (K_NORM * q) / (rSample * rSample);
    const EmagAtDouble = (K_NORM * q) / (2 * rSample * (2 * rSample));
    const ratio = Emag / EmagAtDouble; // always exactly 4
    // Visual arrow length, scaled and clamped.
    const lenRaw = ARROW_VISUAL_GAIN * Emag;
    const len = Math.max(ARROW_MIN_LEN, Math.min(ARROW_MAX_LEN, lenRaw));
    return { Emag, EmagAtDouble, ratio, len };
  }, [q, rSample]);

  const stateRef = useRef({ positive, q, rSample, computed });
  useEffect(() => {
    stateRef.current = { positive, q, rSample, computed };
  }, [positive, q, rSample, computed]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w: W, h: H, canvas } = info;
    let raf = 0;

    const cam: OrbitCamera = {
      yaw: 0.55,
      pitch: 0.28,
      distance: 7.5,
      fov: Math.PI / 4,
    };
    const dispose = attachOrbit(canvas, cam);

    function draw() {
      ctx.fillStyle = getCanvasColors().bg;
      ctx.fillRect(0, 0, W, H);

      const s = stateRef.current;
      const sign: 1 | -1 = s.positive ? 1 : -1;

      // ── Central charge glow + body ────────────────────────────────
      const chargeColor = s.positive ? '#ff3b6e' : '#5baef8';
      const chargeColorGlow = s.positive
        ? 'rgba(255,59,110,0.35)'
        : 'rgba(91,174,248,0.35)';

      // Project the centre and a ring of equator points to draw a glowing
      // silhouette ellipse for the ball.
      drawChargeBall(ctx, cam, W, H, chargeColor, chargeColorGlow, s.positive ? '+' : '-');

      // ── Sample sphere (very faint reference rings) ────────────────
      drawSampleSphere(ctx, cam, W, H, s.rSample);

      // ── Field arrows ──────────────────────────────────────────────
      const arrows = buildArrows(s.rSample, s.computed.len, sign);

      // Painter sort: largest depth first (deepest = far side).
      const order = arrows
        .map((a, i) => ({ i, d: project(a.anchor, cam, W, H).depth }))
        .sort((a, b) => b.d - a.d)
        .map(o => o.i);

      for (const idx of order) {
        const a = arrows[idx]!;
        drawRadialArrow(ctx, a, cam, W, H, s.positive);
      }

      // ── Annotations ───────────────────────────────────────────────
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillStyle = getCanvasColors().textDim;
      ctx.fillText('drag to rotate', 12, 12);
      ctx.save();
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = getCanvasColors().textDim;
      ctx.fillText(
        `sample sphere r = ${s.rSample.toFixed(2)}   |E| ∝ k|q|/r²`,
        12, 28,
      );

      ctx.textAlign = 'right';
      ctx.restore();
      ctx.fillStyle = s.positive
        ? 'rgba(255,59,110,0.92)'
        : 'rgba(91,174,248,0.92)';
      ctx.fillText(
        s.positive ? 'E radial · outward' : 'E radial · inward',
        W - 12, 12,
      );

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
      figure={figure ?? 'Fig. 1.3'}
      title="A point charge's field in three dimensions"
      question="Why does doubling r quarter the field — not halve it?"
      caption={<>
        Drag the sphere to orbit. The arrows show the electric field on a
        spherical shell of radius <strong>r</strong> around a point charge.
        Their length tracks <strong>|E| = k|q|/r²</strong> — so when you
        slide <strong>r</strong> from 1 to 2 the entire spiky shell
        shrinks by exactly <strong>4×</strong>. That factor of four is the
        inverse-square law, and the reason it's a four (not a two) is the
        same reason the surface area of a sphere is <strong>4πr²</strong>:
        a fixed amount of "flux" spreads over a larger and larger
        spherical area as r grows.
      </>}
      deeperLab={{ slug: 'e-field', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={360} setup={setup} />
      <DemoControls>
        <MiniToggle
          label={positive ? 'sign: +' : 'sign: −'}
          checked={positive}
          onChange={setPositive}
        />
        <MiniSlider
          label="|q|"
          value={q}
          min={0.5}
          max={5}
          step={0.1}
          format={v => v.toFixed(1)}
          onChange={setQ}
        />
        <MiniSlider
          label="r"
          value={rSample}
          min={0.5}
          max={4}
          step={0.1}
          format={v => v.toFixed(1)}
          onChange={setRSample}
        />
        <MiniReadout
          label="|E| = k|q|/r²"
          value={<Num value={computed.Emag} />}
          unit="(norm.)"
        />
        <MiniReadout
          label="|E(r)| / |E(2r)|"
          value={computed.ratio.toFixed(2)}
          unit="×"
        />
      </DemoControls>
    </Demo>
  );
}

/* ───── Helpers ─────────────────────────────────────────────────────── */

/**
 * Draw the central charge as a 2D ball at the projected origin, with a
 * soft glow halo from drawGlowPath around its silhouette circle. The
 * radius scales by the perspective projection so it looks "in" the scene.
 */
function drawChargeBall(
  ctx: CanvasRenderingContext2D,
  cam: OrbitCamera, W: number, H: number,
  color: string, glow: string, signGlyph: '+' | '-',
) {
  const centre = project(v3(0, 0, 0), cam, W, H);
  // Approximate on-screen radius via the focal length the projection uses.
  const focal = (Math.min(W, H) / 2) / Math.tan(cam.fov / 2);
  const rPx = (CHARGE_RADIUS / Math.max(0.01, centre.depth)) * focal;

  // Glow halo: trace the silhouette circle as a polyline through
  // drawGlowPath so we get the bleed-then-saturate effect.
  const N = 36;
  const ring: { x: number; y: number }[] = [];
  for (let i = 0; i <= N; i++) {
    const a = (i / N) * Math.PI * 2;
    ring.push({
      x: centre.x + Math.cos(a) * rPx,
      y: centre.y + Math.sin(a) * rPx,
    });
  }
  drawGlowPath(ctx, ring, {
    color,
    lineWidth: 2.0,
    glowColor: glow,
    glowWidth: 12,
  });
  // Filled body.
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(centre.x, centre.y, rPx * 0.9, 0, Math.PI * 2);
  ctx.fill();
  // Glyph.
  ctx.fillStyle = getCanvasColors().bg;
  ctx.font = `bold ${Math.max(10, Math.round(rPx * 1.0))}px "JetBrains Mono", monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(signGlyph, centre.x, centre.y + 1);
}

/**
 * Draw three faint great-circle outlines on the sample sphere so the
 * reader can see what shell the arrows are pinned to. Two passes per
 * circle (back dashed, front solid) to read 3D.
 */
function drawSampleSphere(
  ctx: CanvasRenderingContext2D,
  cam: OrbitCamera, W: number, H: number,
  r: number,
) {
  const N = 60;
  const planes: Array<(t: number) => Vec3> = [
    // Equator (xz-plane)
    (t: number) => v3(r * Math.cos(t), 0, r * Math.sin(t)),
    // Meridian (xy-plane)
    (t: number) => v3(r * Math.cos(t), r * Math.sin(t), 0),
    // Meridian (yz-plane)
    (t: number) => v3(0, r * Math.cos(t), r * Math.sin(t)),
  ];
  for (const f of planes) {
    const pts: Vec3[] = [];
    for (let i = 0; i <= N; i++) pts.push(f((i / N) * Math.PI * 2));
    const proj = pts.map(p => project(p, cam, W, H));
    const depths = proj.map(p => p.depth);
    const sorted = [...depths].sort((a, b) => a - b);
    const cutoff = sorted[Math.floor(sorted.length / 2)]!;
    for (const pass of ['back', 'front'] as const) {
      ctx.beginPath();
      let drawing = false;
      for (let i = 0; i < proj.length; i++) {
        const isFront = depths[i]! <= cutoff;
        const include = pass === 'front' ? isFront : !isFront;
        const p = proj[i]!;
        if (include) {
          if (!drawing) { ctx.moveTo(p.x, p.y); drawing = true; }
          else ctx.lineTo(p.x, p.y);
        } else {
          drawing = false;
        }
      }
      ctx.strokeStyle = pass === 'front'
        ? 'rgba(160,158,149,0.18)'
        : 'rgba(160,158,149,0.07)';
      ctx.lineWidth = 1;
      ctx.setLineDash(pass === 'back' ? [4, 4] : []);
      ctx.stroke();
    }
    ctx.setLineDash([]);
  }
}

/**
 * Project a single radial arrow, dim it by depth, and stroke head as a
 * 2D triangle in screen-space so it always reads.
 */
function drawRadialArrow(
  ctx: CanvasRenderingContext2D,
  a: RadialArrow,
  cam: OrbitCamera, W: number, H: number,
  positive: boolean,
) {
  const p1 = project(a.from, cam, W, H);
  const p2 = project(a.to, cam, W, H);
  if (p1.depth <= 0 || p2.depth <= 0) return;

  // Depth dimming: anchors with larger projected depth (far side) read
  // dimmer; near side reads saturated. Normalise around camera distance.
  const dMid = (p1.depth + p2.depth) / 2;
  const tDepth = Math.max(0, Math.min(1, (cam.distance + 2 - dMid) / 4.0));
  const fade = 0.32 + 0.62 * tDepth;

  const baseColor = positive
    ? `rgba(255,59,110,${(0.95 * fade).toFixed(3)})`
    : `rgba(91,174,248,${(0.95 * fade).toFixed(3)})`;

  ctx.strokeStyle = baseColor;
  ctx.lineWidth = 1.55;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();

  // 2D screen-space arrowhead at p2.
  const dx = p2.x - p1.x, dy = p2.y - p1.y;
  const len = Math.hypot(dx, dy);
  if (len < 3) return;
  const ux = dx / len, uy = dy / len;
  const head = 7;
  const half = 3.2;
  ctx.fillStyle = baseColor;
  ctx.beginPath();
  ctx.moveTo(p2.x, p2.y);
  ctx.lineTo(p2.x - ux * head - uy * half, p2.y - uy * head + ux * half);
  ctx.lineTo(p2.x - ux * head + uy * half, p2.y - uy * head - ux * half);
  ctx.closePath();
  ctx.fill();
}
