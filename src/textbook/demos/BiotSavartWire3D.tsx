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
import { useMemo, useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import {
  Demo,
  DemoControls,
  EquationStrip,
  MiniReadout,
  MiniSlider,
  MiniToggle,
} from '@/components/Demo';
import { M } from '@/components/Formula';
import { Num } from '@/components/Num';
import { drawGlowPath } from '@/lib/canvasPrimitives';
import { PHYS, sciTeX } from '@/lib/physics';
import { withAlpha } from '@/lib/canvasTheme';
import { project, type Vec3 } from '@/lib/projection3d';
import { createOrbitScene, type OrbitScene } from '@/lib/useOrbitScene';
import { drawLabel } from '@/lib/canvasLayout';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

interface Props {
  figure: string;
}

// World geometry. Wire runs from y = -Y_HALF to +Y_HALF along the y-axis.
const Y_HALF = 1.6;
// Three ring radii in world units. The middle one is driven by the slider.
const RING_HEIGHTS = [-1.0, -0.2, 0.6, 1.2];
const ARROWS_PER_RING = 18;
// Physical scale: 1 world unit = 1 cm of radial distance for the readout.
const WORLD_TO_METRES = 0.01;

interface ArrowSeg {
  from: Vec3;
  to: Vec3;
  anchor: Vec3;
  scale: number; // 0..1 visual scale for arrowhead size
  ringIdx: number;
}

export function BiotSavartWire3DDemo({ figure }: Props) {
  const [I, setI] = useState(3); // A
  const [rMid, setRMid] = useState(1.0); // world units (slider for middle ring)
  const [showHand, setShowHand] = useState(true);
  const [reverse, setReverse] = useState(false);

  const computed = useMemo(() => {
    const rMetres = Math.max(0.002, rMid * WORLD_TO_METRES);
    const B_at_r = (PHYS.mu_0 * I) / (2 * Math.PI * rMetres);
    const B_at_1cm = (PHYS.mu_0 * I) / (2 * Math.PI * 0.01);
    return { B_at_r, B_at_1cm };
  }, [I, rMid]);

  const stateRef = useSimState({ I, rMid, showHand, reverse, computed });

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w: W, h: H, colors }, s, _dt, simTime, scene: OrbitScene) => {
      const cam = scene.cam;

      function depthFade(pDepth: number, base = 0.95): number {
        const t = (cam.distance + 1.5 - pDepth) / 3.0;
        const k = Math.max(0.35, Math.min(1, t));
        return base * k;
      }

      function ringRadii(rMid: number): [number, number, number] {
        return [Math.max(0.15, rMid * 0.55), rMid, rMid * 1.6];
      }

      function buildRingArrows(
        radius: number,
        yHeight: number,
        sign: number,
        ringIdx: number,
      ): ArrowSeg[] {
        const arrows: ArrowSeg[] = [];
        const refR = s.rMid;
        const bScale = refR / radius;
        const chord = ((2 * Math.PI) / ARROWS_PER_RING) * 0.42;
        for (let i = 0; i < ARROWS_PER_RING; i++) {
          const phi = (i / ARROWS_PER_RING) * Math.PI * 2;
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
            from,
            to,
            anchor,
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
        const baseAlpha = a.ringIdx === 0 ? 1.0 : a.ringIdx === 1 ? 0.88 : 0.72;
        const alpha = baseAlpha * fade;
        const colour = withAlpha(colors.teal, alpha);
        ctx.strokeStyle = colour;
        ctx.lineWidth = 1.0 + 0.4 * a.scale;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        const dx = p2.x - p1.x,
          dy = p2.y - p1.y;
        const len = Math.hypot(dx, dy);
        if (len < 2) return;
        const ux = dx / len,
          uy = dy / len;
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
        drawGlowPath(
          ctx,
          [
            { x: pTop.x, y: pTop.y },
            { x: pBot.x, y: pBot.y },
          ],
          {
            color: withAlpha(colors.accent, 0.95),
            lineWidth: 3.0,
            glowColor: withAlpha(colors.accent, 0.28),
            glowWidth: 10,
          },
        );

        const N_FLOW = 9;
        const phase = (simTime * 0.7) % 1;
        for (let i = 0; i < N_FLOW; i++) {
          const u = (i + phase) / N_FLOW;
          const y = -Y_HALF + u * 2 * Y_HALF;
          const tail: Vec3 = { x: 0, y: y - 0.1 * sign, z: 0 };
          const tip: Vec3 = { x: 0, y: y + 0.1 * sign, z: 0 };
          const pa = project(tail, cam, W, H);
          const pb = project(tip, cam, W, H);
          if (pa.depth <= 0 || pb.depth <= 0) continue;
          const dx = pb.x - pa.x,
            dy = pb.y - pa.y;
          const len = Math.hypot(dx, dy);
          if (len < 2) continue;
          const ux = dx / len,
            uy = dy / len;
          ctx.fillStyle = colors.accent;
          ctx.beginPath();
          ctx.moveTo(pb.x, pb.y);
          ctx.lineTo(pb.x - ux * 7 - uy * 3.5, pb.y - uy * 7 + ux * 3.5);
          ctx.lineTo(pb.x - ux * 7 + uy * 3.5, pb.y - uy * 7 - ux * 3.5);
          ctx.closePath();
          ctx.fill();
        }
      }

      function drawRingOutline(radius: number, yHeight: number, ringIdx: number) {
        const N = 64;
        const pts: { x: number; y: number; depth: number }[] = [];
        for (let i = 0; i <= N; i++) {
          const phi = (i / N) * Math.PI * 2;
          pts.push(
            project(
              {
                x: radius * Math.cos(phi),
                y: yHeight,
                z: radius * Math.sin(phi),
              },
              cam,
              W,
              H,
            ),
          );
        }
        const sorted = [...pts.map((p) => p.depth)].sort((a, b) => a - b);
        const cutoff = sorted[Math.floor(pts.length / 2)]!;
        const baseAlpha = ringIdx === 0 ? 0.4 : ringIdx === 1 ? 0.3 : 0.22;
        for (const pass of ['back', 'front'] as const) {
          ctx.beginPath();
          let drawing = false;
          for (let i = 0; i < pts.length; i++) {
            const p = pts[i]!;
            const isFront = p.depth <= cutoff;
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
          ctx.strokeStyle =
            pass === 'front'
              ? withAlpha(colors.teal, baseAlpha)
              : withAlpha(colors.teal, baseAlpha * 0.35);
          ctx.lineWidth = 1.0;
          ctx.setLineDash(pass === 'back' ? [3, 4] : []);
          ctx.stroke();
        }
        ctx.setLineDash([]);
      }

      function drawHand(sign: number, ringRadius: number, ringY: number) {
        const wristR = ringRadius * 1.05;
        const wristPhi = -0.5;
        const wrist: Vec3 = {
          x: wristR * Math.cos(wristPhi),
          y: ringY,
          z: wristR * Math.sin(wristPhi),
        };
        const thumbTip: Vec3 = {
          x: wrist.x,
          y: wrist.y + 0.55 * sign,
          z: wrist.z,
        };
        const pWrist = project(wrist, cam, W, H);
        const pThumb = project(thumbTip, cam, W, H);
        if (pWrist.depth <= 0 || pThumb.depth <= 0) return;
        ctx.save();
        ctx.globalAlpha = 0.1;
        ctx.fillStyle = colors.text;
        ctx.save();
        ctx.globalAlpha = 0.55;
        ctx.strokeStyle = colors.text;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(pWrist.x, pWrist.y, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        ctx.restore();
        ctx.stroke();
        drawGlowPath(
          ctx,
          [
            { x: pWrist.x, y: pWrist.y },
            { x: pThumb.x, y: pThumb.y },
          ],
          {
            color: withAlpha(colors.text, 0.9),
            lineWidth: 2.4,
            glowColor: withAlpha(colors.text, 0.2),
            glowWidth: 7,
          },
        );
        const dx = pThumb.x - pWrist.x,
          dy = pThumb.y - pWrist.y;
        const len = Math.hypot(dx, dy);
        if (len > 2) {
          const ux = dx / len,
            uy = dy / len;
          ctx.fillStyle = colors.text;
          ctx.beginPath();
          ctx.moveTo(pThumb.x, pThumb.y);
          ctx.lineTo(pThumb.x - ux * 7 - uy * 3.5, pThumb.y - uy * 7 + ux * 3.5);
          ctx.lineTo(pThumb.x - ux * 7 + uy * 3.5, pThumb.y - uy * 7 - ux * 3.5);
          ctx.closePath();
          ctx.fill();
        }
        const fingerCount = 4;
        const fingerSamples = 6;
        const fingerSpan = 0.85;
        for (let f = 0; f < fingerCount; f++) {
          const yOff = (f - (fingerCount - 1) / 2) * 0.08;
          const fy = wrist.y + yOff;
          const pts: { x: number; y: number; depth: number }[] = [];
          for (let ssample = 0; ssample <= fingerSamples; ssample++) {
            const t = ssample / fingerSamples;
            const phi = wristPhi + sign * fingerSpan * t;
            const r = wristR * (1.0 - 0.05 * t);
            pts.push(
              project(
                {
                  x: r * Math.cos(phi),
                  y: fy,
                  z: r * Math.sin(phi),
                },
                cam,
                W,
                H,
              ),
            );
          }
          ctx.save();
          ctx.globalAlpha = 0.75;
          ctx.strokeStyle = colors.text;
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          ctx.moveTo(pts[0]!.x, pts[0]!.y);
          for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i]!.x, pts[i]!.y);
          ctx.stroke();
          ctx.restore();
          const a = pts[pts.length - 2]!;
          const b = pts[pts.length - 1]!;
          const fdx = b.x - a.x,
            fdy = b.y - a.y;
          const flen = Math.hypot(fdx, fdy);
          if (flen > 1) {
            const ux = fdx / flen,
              uy = fdy / flen;
            ctx.fillStyle = colors.text;
            ctx.beginPath();
            ctx.moveTo(b.x, b.y);
            ctx.lineTo(b.x - ux * 5 - uy * 2.5, b.y - uy * 5 + ux * 2.5);
            ctx.lineTo(b.x - ux * 5 + uy * 2.5, b.y - uy * 5 - ux * 2.5);
            ctx.closePath();
            ctx.fill();
          }
        }
      }

      // Background.
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, W, H);

      const sign = s.reverse ? -1 : 1;
      const [r1, r2, r3] = ringRadii(s.rMid);

      const allArrows: ArrowSeg[] = [];
      for (let h = 0; h < RING_HEIGHTS.length; h++) {
        const yH = RING_HEIGHTS[h]!;
        allArrows.push(...buildRingArrows(r1, yH, sign, 0));
        allArrows.push(...buildRingArrows(r2, yH, sign, 1));
        allArrows.push(...buildRingArrows(r3, yH, sign, 2));
      }
      const projectedDepths = allArrows.map((a) => project(a.anchor, cam, W, H).depth);
      const order = allArrows
        .map((_, i) => i)
        .sort((a, b) => projectedDepths[b]! - projectedDepths[a]!);

      for (const yH of RING_HEIGHTS) {
        drawRingOutline(r1, yH, 0);
        drawRingOutline(r2, yH, 1);
        drawRingOutline(r3, yH, 2);
      }

      const backIdx: number[] = [],
        frontIdx: number[] = [];
      for (const i of order) {
        if (projectedDepths[i]! > cam.distance) backIdx.push(i);
        else frontIdx.push(i);
      }
      for (const i of backIdx) drawArrow(allArrows[i]!);
      drawWire(sign);
      for (const i of frontIdx) drawArrow(allArrows[i]!);

      if (s.showHand) {
        drawHand(sign, r2, RING_HEIGHTS[RING_HEIGHTS.length - 1]!);
      }

      // Annotations
      ctx.fillStyle = colors.textDim;
      drawLabel(ctx, {
        text: 'drag to rotate',
        x: 12,
        y: 12,
        size: 11,
        font: '11px "JetBrains Mono", monospace',
        baseline: 'top',
      });
      ctx.save();
      ctx.globalAlpha = 0.65;
      ctx.fillStyle = colors.textDim;
      drawLabel(ctx, {
        text: `r₁ = ${r1.toFixed(2)}   r₂ = ${r2.toFixed(2)}   r₃ = ${r3.toFixed(2)}`,
        x: 12,
        y: 28,
      });
      ctx.restore();
      ctx.fillStyle = colors.accent;
      drawLabel(ctx, {
        text: s.reverse ? 'I  amber · current −ŷ' : 'I  amber · current +ŷ',
        x: W - 12,
        y: 12,
        align: 'right',
      });
      ctx.fillStyle = colors.teal;
      drawLabel(ctx, {
        text: 'B  teal · azimuthal (right-hand rule)',
        x: W - 12,
        y: 28,
        align: 'right',
      });
      if (s.showHand) {
        ctx.save();
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = colors.text;
        drawLabel(ctx, { text: 'thumb = I, fingers curl with B', x: W - 12, y: 44 });
        ctx.restore();
      }
    },
    [],
    ({ canvas }) => {
      const scene = createOrbitScene(canvas, { yaw: 0.65, pitch: 0.28, distance: 6.0 });
      return { context: scene, cleanup: () => scene.dispose() };
    },
  );

  return (
    <Demo
      figure={figure}
      title="The B-field around a wire, in three dimensions"
      question="Why do magnetic field lines circle a wire instead of pointing at it?"
      caption={
        <>
          A vertical wire carries current <strong>I</strong> upward. At several heights, the
          magnetic field wraps the wire in concentric circles — inner rings denser, outer rings
          sparser, because
          <strong> |B| = μ₀I/(2πr)</strong> falls off as <strong>1/r</strong>. Drag to orbit. The
          ghost hand encodes the right-hand rule: thumb along the current, fingers curl with
          <strong> B</strong>. Reverse the current and every arrow on every ring flips at once.
        </>
      }
      deeperLab={{ slug: 'biot-savart', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={380} setup={setup} ariaLabel="3D B-field around a straight wire" />
      <DemoControls>
        <MiniSlider
          label="current I"
          value={I}
          min={0.1}
          max={10}
          step={0.1}
          format={(v) => v.toFixed(1) + ' A'}
          onChange={setI}
        />
        <MiniSlider
          label="radius r"
          value={rMid}
          min={0.3}
          max={3.0}
          step={0.05}
          format={(v) => v.toFixed(2)}
          onChange={setRMid}
        />
        <MiniToggle
          label={showHand ? 'right-hand rule on' : 'right-hand rule off'}
          checked={showHand}
          onChange={setShowHand}
        />
        <MiniToggle
          label={reverse ? 'current reversed' : 'current forward'}
          checked={reverse}
          onChange={setReverse}
        />
        <MiniReadout label="|B| at slider r" value={<Num value={computed.B_at_r} />} unit="T" />
        <MiniReadout label="|B| at r = 1 cm" value={<Num value={computed.B_at_1cm} />} unit="T" />
      </DemoControls>
      <EquationStrip
        leftLabel="Long-wire B-field"
        left={
          <M
            tex={`|\\vec{B}| \\;=\\; \\dfrac{\\mu_{0} I}{2\\pi r} \\;\\approx\\; ${sciTeX(computed.B_at_r)}\\ \\text{T}`}
          />
        }
        rightLabel="At Earth-field scale (r = 1 cm)"
        right={
          <M
            tex={`|\\vec{B}|_{1\\,\\text{cm}} \\;\\approx\\; ${sciTeX(computed.B_at_1cm)}\\ \\text{T}`}
          />
        }
      />
    </Demo>
  );
}
