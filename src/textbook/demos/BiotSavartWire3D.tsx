/**
 * Demo 6.x — Biot–Savart wire in 3D
 *
 * A vertical straight wire carrying current I along +y, viewed through an
 * orbital camera. Concentric magnetic-field circles ("rings") are drawn at
 * a handful of axial heights and at three radii r₁ < r₂ < r₃. Each ring is
 * rendered as a circle of small arrows tangent to the ring, circulating in
 * the direction the right-hand rule predicts: thumb along I, fingers curl
 * with B.
 *
 * Field magnitude follows the long-wire Biot–Savart result
 *
 *     |B(r)| = μ₀ I / (2π r)
 *
 * so the inner ring's arrows are larger and denser, the outer ring's
 * arrows are smaller — the visual asymmetry encodes the 1/r fall-off.
 * Toggling the current reverses every arrow on every ring at once;
 * toggling the right-hand-rule indicator overlays a small ghost hand at
 * one of the rings with the thumb along I and fingers curling with B.
 *
 * Conventions
 * ───────────
 *   wire axis  : world +y
 *   current I  : +y (or −y if reversed)
 *   B circles  : lie in horizontal (x, z) planes at fixed y
 *   right-hand : φ̂(I>0) is the +y-curl direction in the (x, z) plane
 *
 * Painter's algorithm sorts the wire body, the rings, and the per-arrow
 * segments so back-facing arrows are dimmer — the same approach as the
 * Poynting-coax and antenna-transition demos.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider, MiniToggle } from '@/components/Demo';
import { Num } from '@/components/Num';
import { drawGlowPath } from '@/lib/canvasPrimitives';
import { PHYS } from '@/lib/physics';
import { getCanvasColors } from '@/lib/canvasTheme';
import {
  attachOrbit,
  project,
  type OrbitCamera,
  type Vec3,
} from '@/lib/projection3d';

interface Props { figure?: string }

// World geometry. Wire runs from y = -Y_HALF to +Y_HALF along the y-axis.
const Y_HALF = 1.6;
// Three ring radii in world units. The middle one is driven by the slider.
// Inner / outer flank the user-driven middle radius at fixed ratios.
const RING_HEIGHTS = [-1.0, -0.2, 0.6, 1.2];
const ARROWS_PER_RING = 18;
// Physical scale: 1 world unit = 1 cm of radial distance for the readout.
const WORLD_TO_METRES = 0.01;

interface ArrowSeg {
  from: Vec3;
  to: Vec3;
  anchor: Vec3;
  scale: number;      // 0..1 visual scale for arrowhead size
  ringIdx: number;
}

export function BiotSavartWire3DDemo({ figure }: Props) {
  const [I, setI] = useState(3);                  // A
  const [rMid, setRMid] = useState(1.0);          // world units (slider for middle ring)
  const [showHand, setShowHand] = useState(true);
  const [reverse, setReverse] = useState(false);

  // |B| at the slider radius (converted to metres via WORLD_TO_METRES).
  // |B| at r = 1 cm for comparison with Earth's field (~50 µT).
  const computed = useMemo(() => {
    const rMetres = Math.max(0.002, rMid * WORLD_TO_METRES);
    const B_at_r = (PHYS.mu_0 * I) / (2 * Math.PI * rMetres);
    const B_at_1cm = (PHYS.mu_0 * I) / (2 * Math.PI * 0.01);
    return { B_at_r, B_at_1cm };
  }, [I, rMid]);

  const stateRef = useRef({ I, rMid, showHand, reverse, computed });
  useEffect(() => {
    stateRef.current = { I, rMid, showHand, reverse, computed };
  }, [I, rMid, showHand, reverse, computed]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w: W, h: H, canvas } = info;
    let raf = 0;

    const cam: OrbitCamera = { yaw: 0.65, pitch: 0.28, distance: 6.0, fov: Math.PI / 4 };
    const dispose = attachOrbit(canvas, cam);

    function depthFade(pDepth: number, base = 0.95): number {
      // Map camera-space depth into a 0.35..1.0 alpha multiplier.
      const t = (cam.distance + 1.5 - pDepth) / 3.0;
      const k = Math.max(0.35, Math.min(1, t));
      return base * k;
    }

    /** Build the three ring radii from the slider value. */
    function ringRadii(rMid: number): [number, number, number] {
      return [Math.max(0.15, rMid * 0.55), rMid, rMid * 1.6];
    }

    /** Build one ring's worth of tangent arrows. */
    function buildRingArrows(
      radius: number, yHeight: number, sign: number, ringIdx: number,
    ): ArrowSeg[] {
      const arrows: ArrowSeg[] = [];
      // Visual scaling: arrows on the inner ring are physically larger,
      // because |B| ∝ 1/r. Use a normalised factor against the middle
      // ring radius so the middle ring's arrow length is ~constant as
      // the slider moves (the inner/outer arrows breathe accordingly).
      const refR = stateRef.current.rMid;
      const bScale = refR / radius;             // 1/r normalised
      // Tangent chord half-length, in radians.
      const chord = (2 * Math.PI / ARROWS_PER_RING) * 0.42;
      for (let i = 0; i < ARROWS_PER_RING; i++) {
        const phi = (i / ARROWS_PER_RING) * Math.PI * 2;
        // Right-hand rule: thumb +y, fingers curl from +x toward +z.
        // Sign +1 means current along +y → arrow runs phi → phi + dφ.
        // Sign −1 means current reversed → arrow runs phi → phi − dφ.
        const phi0 = phi - chord * sign;
        const phi1 = phi + chord * sign;
        const from: Vec3 = {
          x: radius * Math.cos(phi0),
          y: yHeight,
          z: radius * Math.sin(phi0),
        };
        const to: Vec3 = {
          x: radius * Math.cos(phi1),
          y: yHeight,
          z: radius * Math.sin(phi1),
        };
        const anchor: Vec3 = {
          x: radius * Math.cos(phi),
          y: yHeight,
          z: radius * Math.sin(phi),
        };
        arrows.push({
          from, to, anchor,
          scale: Math.max(0.45, Math.min(1.8, bScale)),
          ringIdx,
        });
      }
      return arrows;
    }

    function drawArrow(a: ArrowSeg) {
      const p1 = project(a.from, cam, W, H);
      const p2 = project(a.to, cam, W, H);
      if (p1.depth <= 0 || p2.depth <= 0) return;
      const dMid = (p1.depth + p2.depth) / 2;
      const fade = depthFade(dMid);
      // Per-ring colour: inner saturated teal, middle teal, outer teal-dim.
      const baseAlpha = a.ringIdx === 0 ? 1.0 : a.ringIdx === 1 ? 0.88 : 0.72;
      const alpha = (baseAlpha * fade).toFixed(3);
      const colour = `rgba(108,197,194,${alpha})`;
      ctx.strokeStyle = colour;
      ctx.lineWidth = 1.0 + 0.4 * a.scale;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
      // Screen-space arrowhead. Size proportional to a.scale.
      const dx = p2.x - p1.x, dy = p2.y - p1.y;
      const len = Math.hypot(dx, dy);
      if (len < 2) return;
      const ux = dx / len, uy = dy / len;
      const head = 5 + 3 * a.scale;
      const wing = 2.5 + 1.5 * a.scale;
      ctx.fillStyle = colour;
      ctx.beginPath();
      ctx.moveTo(p2.x, p2.y);
      ctx.lineTo(p2.x - ux * head - uy * wing, p2.y - uy * head + ux * wing);
      ctx.lineTo(p2.x - ux * head + uy * wing, p2.y - uy * head - ux * wing);
      ctx.closePath();
      ctx.fill();
    }

    function drawWire(sign: number) {
      const top: Vec3 = { x: 0, y: Y_HALF, z: 0 };
      const bot: Vec3 = { x: 0, y: -Y_HALF, z: 0 };
      const pTop = project(top, cam, W, H);
      const pBot = project(bot, cam, W, H);
      // Wire trunk (glow on the conductor body).
      drawGlowPath(ctx,
        [{ x: pTop.x, y: pTop.y }, { x: pBot.x, y: pBot.y }],
        {
          color: 'rgba(255,107,42,0.95)',
          lineWidth: 3.0,
          glowColor: 'rgba(255,107,42,0.28)',
          glowWidth: 10,
        });

      // Flowing current arrows: small arrowheads stepping along the wire
      // with a time-varying offset. Direction set by `sign`.
      const N_FLOW = 9;
      const tNow = performance.now() / 1000;
      const phase = (tNow * 0.7) % 1;            // 0..1 cycle
      for (let i = 0; i < N_FLOW; i++) {
        const u = ((i + phase) / N_FLOW);         // 0..1
        const y = -Y_HALF + u * 2 * Y_HALF;       // -Y_HALF .. +Y_HALF
        const tail: Vec3 = { x: 0, y: y - 0.10 * sign, z: 0 };
        const tip: Vec3 = { x: 0, y: y + 0.10 * sign, z: 0 };
        const pa = project(tail, cam, W, H);
        const pb = project(tip, cam, W, H);
        if (pa.depth <= 0 || pb.depth <= 0) continue;
        const dx = pb.x - pa.x, dy = pb.y - pa.y;
        const len = Math.hypot(dx, dy);
        if (len < 2) continue;
        const ux = dx / len, uy = dy / len;
        ctx.fillStyle = 'rgba(255,107,42,1)';
        ctx.beginPath();
        ctx.moveTo(pb.x, pb.y);
        ctx.lineTo(pb.x - ux * 7 - uy * 3.5, pb.y - uy * 7 + ux * 3.5);
        ctx.lineTo(pb.x - ux * 7 + uy * 3.5, pb.y - uy * 7 - ux * 3.5);
        ctx.closePath();
        ctx.fill();
      }
    }

    /**
     * Draw a faint ring outline behind the arrows so the circle structure
     * reads even where arrows are sparse.
     */
    function drawRingOutline(radius: number, yHeight: number, ringIdx: number) {
      const N = 64;
      const pts: { x: number; y: number; depth: number }[] = [];
      for (let i = 0; i <= N; i++) {
        const phi = (i / N) * Math.PI * 2;
        pts.push(project({
          x: radius * Math.cos(phi),
          y: yHeight,
          z: radius * Math.sin(phi),
        }, cam, W, H));
      }
      // Median depth as front/back cutoff.
      const sorted = [...pts.map(p => p.depth)].sort((a, b) => a - b);
      const cutoff = sorted[Math.floor(pts.length / 2)]!;
      const baseAlpha = ringIdx === 0 ? 0.40 : ringIdx === 1 ? 0.30 : 0.22;
      for (const pass of ['back', 'front'] as const) {
        ctx.beginPath();
        let drawing = false;
        for (let i = 0; i < pts.length; i++) {
          const p = pts[i]!;
          const isFront = p.depth <= cutoff;
          const include = pass === 'front' ? isFront : !isFront;
          if (include) {
            if (!drawing) { ctx.moveTo(p.x, p.y); drawing = true; }
            else ctx.lineTo(p.x, p.y);
          } else {
            drawing = false;
          }
        }
        ctx.strokeStyle = pass === 'front'
          ? `rgba(108,197,194,${baseAlpha.toFixed(3)})`
          : `rgba(108,197,194,${(baseAlpha * 0.35).toFixed(3)})`;
        ctx.lineWidth = 1.0;
        ctx.setLineDash(pass === 'back' ? [3, 4] : []);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }

    /**
     * Right-hand-rule indicator. A small ghost "hand" at one of the
     * rings, drawn as a stylised thumb (along the wire, in the current
     * direction) plus four short curved fingers wrapping a portion of the
     * ring. This is symbolic, not anatomical.
     */
    function drawHand(sign: number, ringRadius: number, ringY: number) {
      // Anchor the wrist on the +x side of the ring, sitting just outside.
      const wristR = ringRadius * 1.05;
      const wristPhi = -0.5;        // slightly tilted off the +x axis
      const wrist: Vec3 = {
        x: wristR * Math.cos(wristPhi),
        y: ringY,
        z: wristR * Math.sin(wristPhi),
      };
      // Thumb: straight up (or down) along ±y from the wrist.
      const thumbTip: Vec3 = {
        x: wrist.x, y: wrist.y + 0.55 * sign, z: wrist.z,
      };
      const pWrist = project(wrist, cam, W, H);
      const pThumb = project(thumbTip, cam, W, H);
      if (pWrist.depth <= 0 || pThumb.depth <= 0) return;
      // Translucent palm circle.
      ctx.fillStyle = 'rgba(236,235,229,0.10)';
      ctx.strokeStyle = 'rgba(236,235,229,0.55)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(pWrist.x, pWrist.y, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Thumb (cream, thicker).
      drawGlowPath(ctx,
        [{ x: pWrist.x, y: pWrist.y }, { x: pThumb.x, y: pThumb.y }],
        {
          color: 'rgba(236,235,229,0.90)',
          lineWidth: 2.4,
          glowColor: 'rgba(236,235,229,0.20)',
          glowWidth: 7,
        });
      // Arrowhead on the thumb to label current direction.
      const dx = pThumb.x - pWrist.x, dy = pThumb.y - pWrist.y;
      const len = Math.hypot(dx, dy);
      if (len > 2) {
        const ux = dx / len, uy = dy / len;
        ctx.fillStyle = getCanvasColors().text;
        ctx.beginPath();
        ctx.moveTo(pThumb.x, pThumb.y);
        ctx.lineTo(pThumb.x - ux * 7 - uy * 3.5, pThumb.y - uy * 7 + ux * 3.5);
        ctx.lineTo(pThumb.x - ux * 7 + uy * 3.5, pThumb.y - uy * 7 - ux * 3.5);
        ctx.closePath();
        ctx.fill();
      }
      // Fingers: four short curved strokes that follow the ring in the
      // direction of B at the wrist's azimuth. Drawn as polylines in
      // world space along ±dφ from wristPhi.
      const fingerCount = 4;
      const fingerSamples = 6;
      const fingerSpan = 0.85;     // radians of arc each finger traces
      for (let f = 0; f < fingerCount; f++) {
        // Stagger fingers slightly off the wrist height so they don't
        // overlap. Offset along y by a small fraction of the ring height.
        const yOff = (f - (fingerCount - 1) / 2) * 0.08;
        const fy = wrist.y + yOff;
        const pts: { x: number; y: number; depth: number }[] = [];
        for (let s = 0; s <= fingerSamples; s++) {
          const t = s / fingerSamples;
          // Fingers curl from the wrist's φ in the +φ̂ (right-hand) direction
          // when sign = +1; opposite when sign = −1.
          const phi = wristPhi + sign * fingerSpan * t;
          // Slight radial shrink along the finger so it looks like it's
          // wrapping the ring rather than running along it exactly.
          const r = wristR * (1.0 - 0.05 * t);
          pts.push(project({
            x: r * Math.cos(phi), y: fy, z: r * Math.sin(phi),
          }, cam, W, H));
        }
        ctx.strokeStyle = 'rgba(236,235,229,0.75)';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(pts[0]!.x, pts[0]!.y);
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i]!.x, pts[i]!.y);
        ctx.stroke();
        // Arrowhead at the finger tip to show the B direction.
        const a = pts[pts.length - 2]!;
        const b = pts[pts.length - 1]!;
        const fdx = b.x - a.x, fdy = b.y - a.y;
        const flen = Math.hypot(fdx, fdy);
        if (flen > 1) {
          const ux = fdx / flen, uy = fdy / flen;
          ctx.fillStyle = getCanvasColors().text;
          ctx.beginPath();
          ctx.moveTo(b.x, b.y);
          ctx.lineTo(b.x - ux * 5 - uy * 2.5, b.y - uy * 5 + ux * 2.5);
          ctx.lineTo(b.x - ux * 5 + uy * 2.5, b.y - uy * 5 - ux * 2.5);
          ctx.closePath();
          ctx.fill();
        }
      }
    }

    function draw() {
      const s = stateRef.current;
      // Background.
      ctx.fillStyle = getCanvasColors().bg;
      ctx.fillRect(0, 0, W, H);

      const sign = s.reverse ? -1 : 1;
      const [r1, r2, r3] = ringRadii(s.rMid);

      // ── Build everything that needs painter's-algorithm sorting ────
      //  - the wire body is split into front / back halves by camera depth
      //  - each ring outline is drawn front/back internally
      //  - per-arrow segments are depth-sorted as a single pool
      //
      // We render in this order:
      //   1. back-half wire body (faint)
      //   2. ring outlines back halves (faint, dashed)
      //   3. back-half arrows
      //   4. front-half arrows
      //   5. ring outlines front halves
      //   6. front-half wire body (saturated) + flowing current arrows
      //   7. right-hand-rule indicator overlay (on top)

      // Wire silhouette: trivially split at y, but at most camera angles
      // a single drawGlowPath stroke with depth-aware glow is enough.
      // Skipping the front/back split for the trunk; the rings carry the
      // depth cue.

      // Build all arrow segments for all rings × all heights.
      const allArrows: ArrowSeg[] = [];
      for (let h = 0; h < RING_HEIGHTS.length; h++) {
        const yH = RING_HEIGHTS[h]!;
        allArrows.push(...buildRingArrows(r1, yH, sign, 0));
        allArrows.push(...buildRingArrows(r2, yH, sign, 1));
        allArrows.push(...buildRingArrows(r3, yH, sign, 2));
      }
      // Painter sort: back (large depth) first.
      const projectedDepths = allArrows.map(a =>
        project(a.anchor, cam, W, H).depth,
      );
      const order = allArrows
        .map((_, i) => i)
        .sort((a, b) => projectedDepths[b]! - projectedDepths[a]!);

      // Ring outlines first (so arrows sit on top of the dashed outline).
      for (const yH of RING_HEIGHTS) {
        drawRingOutline(r1, yH, 0);
        drawRingOutline(r2, yH, 1);
        drawRingOutline(r3, yH, 2);
      }

      // Split the sorted arrow list at the camera distance — back arrows
      // drawn before the wire body, front arrows after, so the wire
      // visually occludes far-side arrows correctly.
      const backIdx: number[] = [], frontIdx: number[] = [];
      for (const i of order) {
        if (projectedDepths[i]! > cam.distance) backIdx.push(i);
        else frontIdx.push(i);
      }
      for (const i of backIdx) drawArrow(allArrows[i]!);
      drawWire(sign);
      for (const i of frontIdx) drawArrow(allArrows[i]!);

      // Right-hand-rule indicator at the middle ring of the topmost height.
      if (s.showHand) {
        drawHand(sign, r2, RING_HEIGHTS[RING_HEIGHTS.length - 1]!);
      }

      // ── Annotations ────────────────────────────────────────────────
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillStyle = getCanvasColors().textDim;
      ctx.fillText('drag to rotate', 12, 12);
      ctx.fillStyle = 'rgba(160,158,149,0.65)';
      ctx.fillText(`r₁ = ${(r1).toFixed(2)}   r₂ = ${(r2).toFixed(2)}   r₃ = ${(r3).toFixed(2)}`, 12, 28);

      ctx.textAlign = 'right';
      ctx.fillStyle = getCanvasColors().accent;
      ctx.fillText(s.reverse ? 'I  amber · current −ŷ' : 'I  amber · current +ŷ', W - 12, 12);
      ctx.fillStyle = getCanvasColors().teal;
      ctx.fillText('B  teal · azimuthal (right-hand rule)', W - 12, 28);
      ctx.fillStyle = 'rgba(236,235,229,0.70)';
      if (s.showHand) {
        ctx.fillText('thumb = I, fingers curl with B', W - 12, 44);
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
      figure={figure ?? 'Fig. 6.x'}
      title="The B-field around a wire, in three dimensions"
      question="Why do magnetic field lines circle a wire instead of pointing at it?"
      caption={<>
        A vertical wire carries current <strong>I</strong> upward. At several heights, the magnetic field
        wraps the wire in concentric circles — inner rings denser, outer rings sparser, because
        <strong> |B| = μ₀I/(2πr)</strong> falls off as <strong>1/r</strong>. Drag to orbit.
        The ghost hand encodes the right-hand rule: thumb along the current, fingers curl with
        <strong> B</strong>. Reverse the current and every arrow on every ring flips at once.
      </>}
      deeperLab={{ slug: 'biot-savart', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={380} setup={setup} ariaLabel="3D B-field around a straight wire" />
      <DemoControls>
        <MiniSlider
          label="current I" value={I} min={0.1} max={10} step={0.1}
          format={v => v.toFixed(1) + ' A'} onChange={setI}
        />
        <MiniSlider
          label="radius r" value={rMid} min={0.3} max={3.0} step={0.05}
          format={v => v.toFixed(2)} onChange={setRMid}
        />
        <MiniToggle label={showHand ? 'right-hand rule on' : 'right-hand rule off'} checked={showHand} onChange={setShowHand} />
        <MiniToggle label={reverse ? 'current reversed' : 'current forward'} checked={reverse} onChange={setReverse} />
        <MiniReadout label="|B| at slider r" value={<Num value={computed.B_at_r} />} unit="T" />
        <MiniReadout label="|B| at r = 1 cm" value={<Num value={computed.B_at_1cm} />} unit="T" />
      </DemoControls>
    </Demo>
  );
}
