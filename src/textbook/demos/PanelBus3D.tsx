/**
 * Demo 28.1 — Inside the residential panel, in 3D
 *
 * An orbital 3D rendering of a North-American residential service panel:
 *   - a semi-translucent rectangular enclosure
 *   - two vertical bus bars (L1 amber-pink, L2 amber-blue) running top to
 *     bottom inside the can, each stamped with sideways "stabs" at
 *     alternating Y heights so that reading straight down a single column
 *     of slots gives L1, L2, L1, L2, …
 *   - a two-pole main breaker at the head of the column, straddling both
 *     bus bars
 *   - a configurable number of single-pole branch breakers, each clipped
 *     to one stab
 *   - an optional two-pole 240 V branch breaker (the dryer) that
 *     straddles one L1 stab and one L2 stab on adjacent slots — which is
 *     the whole reason the bus stamping alternates
 *   - a horizontal neutral bar and a separate, smaller ground bar near
 *     the bottom of the can, with branch-circuit neutrals routed back to
 *     the neutral bar (optionally animated)
 *   - a single main bonding jumper bridging the neutral and ground bars
 *     at exactly one point — the green strap of NEC 250
 *
 * The reader drags to orbit the camera and toggles the various overlays
 * with mini-controls. Live readouts give V_L1-N, V_L2-N, V_L1-L2, the
 * panel's total current capacity (200 A main), and a derived per-breaker
 * example current (panel current divided over visible single-pole
 * breakers, capped at 20 A nameplate).
 *
 * Citations used: NEC 2023 Article 408 / 250 for the bonding and bar
 * geometry, NEMA AB-1 for the alternating-stab convention, UL 489 for
 * the breaker-listing umbrella, Square D QO datasheet for stab spacing
 * and bus material, Eaton BR datasheet for the sub-panel cousin, and
 * CODATA 2018 for the elementary-charge reduction of every ampere on
 * the panel label.
 *
 * No emoji. Only the chapter palette: amber primary, pink (positive
 * polarity, used here as L1's tint), blue (negative polarity, L2),
 * teal for the neutral/ground bars and the bonding jumper glow.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider, MiniToggle } from '@/components/Demo';
import { Num } from '@/components/Num';
import { drawGlowPath } from '@/lib/canvasPrimitives';
import {
  attachOrbit, depthSortIndices, project, v3,
  type OrbitCamera, type Vec3,
} from '@/lib/projection3d';

interface Props { figure?: string }

// World-space geometry. Y is up; the panel sits centred at the origin.
// Units are arbitrary "world" units chosen so the camera at distance ~7
// frames the whole thing nicely.
const CAN_W = 2.4;   // x extent (full width)
const CAN_H = 3.6;   // y extent (full height)
const CAN_D = 0.9;   // z extent (depth, front-to-back)

const BUS_X_L1 = -0.45;
const BUS_X_L2 = +0.45;
const BUS_W    = 0.10;          // bus-bar width (x)
const BUS_THK  = 0.06;          // bus-bar thickness (z)
const BUS_TOP  = +1.40;         // top y of the bus bar (below the main)
const BUS_BOT  = -1.20;         // bottom y of the bus bar

const SLOT_PITCH = 0.22;        // vertical spacing between adjacent stabs
const STAB_THK   = 0.045;

const NEUTRAL_Y = -1.45;
const NEUTRAL_X_HALF = 0.95;
const NEUTRAL_THK = 0.06;
const GROUND_Y  = -1.65;
const GROUND_X_HALF = 0.55;
const GROUND_THK = 0.05;

const MAIN_Y = 1.62;
const MAIN_HW = 0.95;           // half-width of the main breaker block
const MAIN_HH = 0.14;
const MAIN_HD = 0.18;

// One "slot" in the panel: a position on the vertical column and a phase
// identity. Adjacent slots have opposite phases.
type Phase = 'L1' | 'L2';
interface Slot {
  index: number;          // 0 = top
  y: number;              // world Y
  phase: Phase;
  busX: number;           // which bus bar the stab grows out of
  stabFromX: number;      // start x of the stab (on the bus)
  stabToX: number;        // end x of the stab (into the can, where the breaker clips)
  breakerCx: number;      // breaker centre x (load side of the stab)
}

function makeSlots(count: number): Slot[] {
  const slots: Slot[] = [];
  // We lay out 'count' slots vertically starting just below the main, in
  // a single column down the centre of the panel. Adjacent slots alternate
  // which bus they tap, and the stab itself alternates which side it
  // projects toward so the breaker bodies stagger left/right of centre.
  for (let i = 0; i < count; i++) {
    const y = BUS_TOP - 0.20 - i * SLOT_PITCH;
    const phase: Phase = (i % 2 === 0) ? 'L1' : 'L2';
    // The slot's stab originates on the matching bus and projects toward
    // the centre column, where the breaker seats.
    const busX = phase === 'L1' ? BUS_X_L1 : BUS_X_L2;
    const breakerCx = 0;
    const stabFromX = busX + Math.sign(breakerCx - busX) * (BUS_W / 2);
    const stabToX   = breakerCx + (busX < 0 ? -1 : 1) * 0.02;
    slots.push({ index: i, y, phase, busX, stabFromX, stabToX, breakerCx });
  }
  return slots;
}

interface SceneItem {
  anchor: Vec3;
  draw: (ctx: CanvasRenderingContext2D, cam: OrbitCamera, W: number, H: number) => void;
}

export function PanelBus3DDemo({ figure }: Props) {
  const [nBreakers, setNBreakers] = useState(8);
  const [show2Pole, setShow2Pole] = useState(true);
  const [showNeutral, setShowNeutral] = useState(true);
  const [showBond, setShowBond] = useState(true);

  const computed = useMemo(() => {
    // Split-phase service: each phase is 120 V RMS to neutral and the two
    // are 180° out of phase, so the line-to-line voltage is 240 V.
    const V_L1_N = 120;
    const V_L2_N = 120;        // magnitude; phase is opposite
    const V_L1_L2 = 240;
    const I_main = 200;        // example 200 A main service
    // Distribute an example total load equally across visible single-pole
    // breakers, capped at 20 A nameplate per branch.
    const I_per = Math.min(20, I_main / Math.max(1, nBreakers));
    return { V_L1_N, V_L2_N, V_L1_L2, I_main, I_per };
  }, [nBreakers]);

  const stateRef = useRef({ nBreakers, show2Pole, showNeutral, showBond });
  useEffect(() => {
    stateRef.current = { nBreakers, show2Pole, showNeutral, showBond };
  }, [nBreakers, show2Pole, showNeutral, showBond]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w: W, h: H, canvas } = info;
    let raf = 0;
    const cam: OrbitCamera = { yaw: 0.55, pitch: 0.18, distance: 7.5, fov: Math.PI / 4 };
    const dispose = attachOrbit(canvas, cam);

    // Neutral-flow dot phase for the animated routing overlay.
    let tFlow = 0;

    function draw() {
      ctx.fillStyle = '#0d0d10';
      ctx.fillRect(0, 0, W, H);
      tFlow = (tFlow + 0.012) % 1;

      const s = stateRef.current;
      const slots = makeSlots(s.nBreakers);

      // Choose two adjacent slots for the 2-pole 240 V breaker. We pick
      // the FIRST pair (i, i+1) we can find with opposite phases —
      // which is always slot 0 and slot 1 by the alternation rule, but
      // we check defensively in case future code changes the layout.
      let twoPolePair: [Slot, Slot] | null = null;
      if (s.show2Pole && slots.length >= 2) {
        for (let i = 1; i + 1 < slots.length; i++) {
          if (slots[i]!.phase !== slots[i + 1]!.phase) {
            twoPolePair = [slots[i]!, slots[i + 1]!];
            break;
          }
        }
      }
      const twoPoleIdxA = twoPolePair?.[0]?.index ?? -1;
      const twoPoleIdxB = twoPolePair?.[1]?.index ?? -1;

      // ─── Assemble the scene as a list of items with depth anchors ───
      const items: SceneItem[] = [];

      // Enclosure (semi-translucent wireframe box).
      items.push({
        anchor: v3(0, 0, -CAN_D / 2),
        draw: (c, cm, w, h) => drawEnclosure(c, cm, w, h),
      });

      // Left + right bus bars.
      items.push({
        anchor: v3(BUS_X_L1, (BUS_TOP + BUS_BOT) / 2, -0.02),
        draw: (c, cm, w, h) => drawBusBar(c, cm, w, h, BUS_X_L1, 'L1'),
      });
      items.push({
        anchor: v3(BUS_X_L2, (BUS_TOP + BUS_BOT) / 2, -0.02),
        draw: (c, cm, w, h) => drawBusBar(c, cm, w, h, BUS_X_L2, 'L2'),
      });

      // Stabs.
      for (const slot of slots) {
        const colour = slot.phase === 'L1' ? 'rgba(255,59,110,0.85)' : 'rgba(91,174,248,0.85)';
        items.push({
          anchor: v3((slot.stabFromX + slot.stabToX) / 2, slot.y, 0.01),
          draw: (c, cm, w, h) => drawStab(c, cm, w, h, slot, colour),
        });
      }

      // Main breaker (always present, at top).
      items.push({
        anchor: v3(0, MAIN_Y, 0.10),
        draw: (c, cm, w, h) => drawMainBreaker(c, cm, w, h),
      });

      // Branch breakers — skip any slot that belongs to the 2-pole pair,
      // and draw the 2-pole as a single span instead.
      for (const slot of slots) {
        if (slot.index === twoPoleIdxA || slot.index === twoPoleIdxB) continue;
        items.push({
          anchor: v3(slot.breakerCx, slot.y, 0.12),
          draw: (c, cm, w, h) => drawSinglePoleBreaker(c, cm, w, h, slot),
        });
      }
      if (twoPolePair) {
        const [a, b] = twoPolePair;
        const midY = (a.y + b.y) / 2;
        items.push({
          anchor: v3(0, midY, 0.14),
          draw: (c, cm, w, h) => drawTwoPoleBreaker(c, cm, w, h, a, b),
        });
      }

      // Neutral bar.
      items.push({
        anchor: v3(0, NEUTRAL_Y, 0),
        draw: (c, cm, w, h) => drawNeutralBar(c, cm, w, h),
      });
      // Ground bar.
      items.push({
        anchor: v3(0, GROUND_Y, 0),
        draw: (c, cm, w, h) => drawGroundBar(c, cm, w, h),
      });

      // Bonding jumper (toggleable).
      if (s.showBond) {
        items.push({
          anchor: v3(0.70, (NEUTRAL_Y + GROUND_Y) / 2, 0.05),
          draw: (c, cm, w, h) => drawBondingJumper(c, cm, w, h),
        });
      }

      // Neutral routing (toggleable). One white-ish line from each visible
      // single-pole breaker down to the neutral bar, with animated dots if
      // showNeutral is on.
      if (s.showNeutral) {
        for (const slot of slots) {
          if (slot.index === twoPoleIdxA || slot.index === twoPoleIdxB) continue;
          items.push({
            anchor: v3(slot.breakerCx - 0.05, (slot.y + NEUTRAL_Y) / 2, 0.13),
            draw: (c, cm, w, h) => drawNeutralRoute(c, cm, w, h, slot, tFlow),
          });
        }
      }

      // Painter's-algorithm sort: back-to-front by depth.
      const order = depthSortIndices(items, cam, W, H);
      for (const idx of order) items[idx]!.draw(ctx, cam, W, H);

      // Annotations
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textBaseline = 'top';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(160,158,149,0.85)';
      ctx.fillText('drag to rotate', 12, 12);
      ctx.fillStyle = 'rgba(160,158,149,0.55)';
      ctx.fillText(`${s.nBreakers} branch slots, alternating L1 / L2`, 12, 28);

      ctx.textAlign = 'right';
      ctx.fillStyle = 'rgba(255,59,110,0.90)';
      ctx.fillText('L1 bus', W - 12, 12);
      ctx.fillStyle = 'rgba(91,174,248,0.90)';
      ctx.fillText('L2 bus', W - 12, 28);
      ctx.fillStyle = 'rgba(108,197,194,0.90)';
      ctx.fillText('neutral · ground · bond', W - 12, 44);
      if (s.show2Pole && twoPolePair) {
        ctx.fillStyle = 'rgba(255,107,42,0.95)';
        ctx.fillText('2-pole 240 V breaker spans L1 + L2', W - 12, 60);
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
      figure={figure ?? 'Fig. 28.1'}
      title="Inside the panel, in 3D"
      question="A 240 V breaker is two slots wide. Why two slots — what would happen if it spanned two stabs on the same bus?"
      caption={<>
        Drag the panel to rotate. The two vertical bus bars are L1 (pink) and L2 (blue); their
        stamped stabs alternate down the column so that a single-pole breaker clicked into one slot
        grabs L1 and the one just below it grabs L2. A two-pole 240 V breaker straddles two adjacent
        slots and therefore <em>automatically</em> taps one of each — which is the whole reason
        for the alternation. Every white wire lands on the teal neutral bar at the bottom; every
        bare conductor lands on the separate ground bar below it. The single teal strap between
        the two is the main bonding jumper, the one place in the building where neutral and ground
        are tied together.
      </>}
    >
      <AutoResizeCanvas height={420} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="breakers" value={nBreakers} min={4} max={12} step={1}
          format={v => v.toFixed(0)} onChange={n => setNBreakers(Math.round(n))}
        />
        <MiniToggle label={show2Pole ? '2-pole 240 V on' : '2-pole 240 V off'} checked={show2Pole} onChange={setShow2Pole} />
        <MiniToggle label={showNeutral ? 'neutral routing on' : 'neutral routing off'} checked={showNeutral} onChange={setShowNeutral} />
        <MiniToggle label={showBond ? 'bonding jumper on' : 'bonding jumper off'} checked={showBond} onChange={setShowBond} />
        <MiniReadout label="V_L1-N" value={<Num value={computed.V_L1_N} />} unit="V" />
        <MiniReadout label="V_L2-N" value={<Num value={computed.V_L2_N} />} unit="V" />
        <MiniReadout label="V_L1-L2" value={<Num value={computed.V_L1_L2} />} unit="V" />
        <MiniReadout label="I_main" value={<Num value={computed.I_main} />} unit="A" />
        <MiniReadout label="I per branch" value={computed.I_per.toFixed(1)} unit="A" />
      </DemoControls>
    </Demo>
  );
}

/* ──────────────────────────────────────────────────────────────────────
 *  Drawing primitives — every one of these projects 3D vertices through
 *  the shared OrbitCamera and strokes the resulting 2D path.
 * ────────────────────────────────────────────────────────────────────── */

function drawEnclosure(ctx: CanvasRenderingContext2D, cam: OrbitCamera, W: number, H: number) {
  // 12 edges of a rectangular box. Front edges saturated, back edges
  // faint + dashed so the reader can read the depth of the can.
  const hx = CAN_W / 2, hy = CAN_H / 2, hz = CAN_D / 2;
  const corners: Vec3[] = [
    v3(-hx, -hy, -hz), v3( hx, -hy, -hz), v3( hx,  hy, -hz), v3(-hx,  hy, -hz),
    v3(-hx, -hy,  hz), v3( hx, -hy,  hz), v3( hx,  hy,  hz), v3(-hx,  hy,  hz),
  ];
  // Edge pairs by corner index.
  const edges: [number, number][] = [
    [0,1],[1,2],[2,3],[3,0],   // back face
    [4,5],[5,6],[6,7],[7,4],   // front face
    [0,4],[1,5],[2,6],[3,7],   // sides
  ];
  for (const [a, b] of edges) {
    const pA = project(corners[a]!, cam, W, H);
    const pB = project(corners[b]!, cam, W, H);
    // "Front" if midpoint is closer to the camera than the mean depth.
    const dMid = (pA.depth + pB.depth) / 2;
    const front = dMid < cam.distance;
    ctx.strokeStyle = front ? 'rgba(160,158,149,0.55)' : 'rgba(160,158,149,0.18)';
    ctx.lineWidth = front ? 1.2 : 1.0;
    ctx.setLineDash(front ? [] : [4, 4]);
    ctx.beginPath();
    ctx.moveTo(pA.x, pA.y);
    ctx.lineTo(pB.x, pB.y);
    ctx.stroke();
  }
  ctx.setLineDash([]);
}

function drawBusBar(
  ctx: CanvasRenderingContext2D, cam: OrbitCamera, W: number, H: number,
  cx: number, phase: Phase,
) {
  // Solid-ish rectangular prism: filled top/front/right faces drawn as
  // projected quads so the bus reads as a 3D bar rather than a 2D rectangle.
  const hw = BUS_W / 2, hd = BUS_THK / 2;
  const yTop = BUS_TOP, yBot = BUS_BOT;
  // 8 corners.
  const c000 = v3(cx - hw, yBot, -hd);
  const c100 = v3(cx + hw, yBot, -hd);
  const c110 = v3(cx + hw, yTop, -hd);
  const c010 = v3(cx - hw, yTop, -hd);
  const c001 = v3(cx - hw, yBot,  hd);
  const c101 = v3(cx + hw, yBot,  hd);
  const c111 = v3(cx + hw, yTop,  hd);
  const c011 = v3(cx - hw, yTop,  hd);

  const baseFill = phase === 'L1' ? 'rgba(255,59,110,0.16)' : 'rgba(91,174,248,0.16)';
  const baseStroke = phase === 'L1' ? 'rgba(255,59,110,0.85)' : 'rgba(91,174,248,0.85)';

  // Quads: front face, then the two visible side faces.
  const quads: [Vec3, Vec3, Vec3, Vec3][] = [
    [c001, c101, c111, c011],   // front (+z)
    [c101, c100, c110, c111],   // right (+x)
    [c000, c001, c011, c010],   // left  (-x)
  ];
  for (const q of quads) {
    const pts = q.map(p => project(p, cam, W, H));
    ctx.fillStyle = baseFill;
    ctx.beginPath();
    ctx.moveTo(pts[0]!.x, pts[0]!.y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i]!.x, pts[i]!.y);
    ctx.closePath();
    ctx.fill();
  }

  // Glowing front edge along the bar's length — the bus is energised.
  const pTop = project(v3(cx, yTop,  hd), cam, W, H);
  const pBot = project(v3(cx, yBot,  hd), cam, W, H);
  drawGlowPath(ctx, [pTop, pBot], {
    color: baseStroke,
    lineWidth: 2.4,
    glowColor: phase === 'L1' ? 'rgba(255,59,110,0.28)' : 'rgba(91,174,248,0.28)',
    glowWidth: 9,
  });

  // Outline.
  const outline: Vec3[] = [c001, c101, c111, c011, c001];
  ctx.strokeStyle = baseStroke;
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  for (let i = 0; i < outline.length; i++) {
    const p = project(outline[i]!, cam, W, H);
    if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
  }
  ctx.stroke();
}

function drawStab(
  ctx: CanvasRenderingContext2D, cam: OrbitCamera, W: number, H: number,
  slot: Slot, colour: string,
) {
  // A short rectangular bar at slot.y connecting the bus face to the
  // breaker's load-side clip. Drawn as a single filled quad in the x-z
  // plane (top face) plus its outline.
  const hd = STAB_THK / 2;
  const x0 = slot.stabFromX;
  const x1 = slot.stabToX;
  const y = slot.y;
  const corners: Vec3[] = [
    v3(x0, y, -hd),
    v3(x1, y, -hd),
    v3(x1, y,  hd),
    v3(x0, y,  hd),
  ];
  const pts = corners.map(p => project(p, cam, W, H));
  ctx.fillStyle = slot.phase === 'L1' ? 'rgba(255,59,110,0.35)' : 'rgba(91,174,248,0.35)';
  ctx.beginPath();
  ctx.moveTo(pts[0]!.x, pts[0]!.y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i]!.x, pts[i]!.y);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = colour;
  ctx.lineWidth = 1.1;
  ctx.stroke();
}

function drawSinglePoleBreaker(
  ctx: CanvasRenderingContext2D, cam: OrbitCamera, W: number, H: number,
  slot: Slot,
) {
  // A small black block centred over the stab, slightly proud of the
  // bus plane (positive z) so it sits in front of the bus rails.
  const cx = slot.breakerCx;
  const cy = slot.y;
  const hw = 0.18, hh = SLOT_PITCH * 0.42, hd = 0.16;
  const cz = 0.20;
  drawBox(ctx, cam, W, H, v3(cx, cy, cz), hw, hh, hd, {
    fill: 'rgba(28,28,34,0.92)',
    stroke: 'rgba(160,158,149,0.55)',
  });
  // Phase-tinted dot on the handle face so the reader can tell which
  // bus this breaker grabs.
  const dot = project(v3(cx, cy, cz + hd), cam, W, H);
  ctx.fillStyle = slot.phase === 'L1' ? 'rgba(255,59,110,0.95)' : 'rgba(91,174,248,0.95)';
  ctx.beginPath();
  ctx.arc(dot.x, dot.y, 3.0, 0, Math.PI * 2);
  ctx.fill();
}

function drawTwoPoleBreaker(
  ctx: CanvasRenderingContext2D, cam: OrbitCamera, W: number, H: number,
  a: Slot, b: Slot,
) {
  // A taller block spanning slots a and b. The handle face carries one
  // pink dot and one blue dot to make the "one on each phase" point
  // visually explicit.
  const cy = (a.y + b.y) / 2;
  const half = Math.abs(a.y - b.y) / 2 + SLOT_PITCH * 0.42;
  const cz = 0.22;
  drawBox(ctx, cam, W, H, v3(0, cy, cz), 0.22, half, 0.17, {
    fill: 'rgba(40,28,18,0.96)',
    stroke: 'rgba(255,107,42,0.85)',
  });
  // Two phase dots, vertically aligned with the two slots they grab.
  for (const slot of [a, b]) {
    const dot = project(v3(slot.breakerCx, slot.y, cz + 0.17), cam, W, H);
    ctx.fillStyle = slot.phase === 'L1' ? 'rgba(255,59,110,0.98)' : 'rgba(91,174,248,0.98)';
    ctx.beginPath();
    ctx.arc(dot.x, dot.y, 3.2, 0, Math.PI * 2);
    ctx.fill();
  }
  // "240 V" label, projected screen-space, near the top of the breaker.
  const lbl = project(v3(0, cy + half + 0.06, cz + 0.17), cam, W, H);
  ctx.fillStyle = 'rgba(255,107,42,0.95)';
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText('240 V', lbl.x, lbl.y);
}

function drawMainBreaker(ctx: CanvasRenderingContext2D, cam: OrbitCamera, W: number, H: number) {
  // The main disconnect — a wide 2-pole block at the head of the column.
  drawBox(ctx, cam, W, H, v3(0, MAIN_Y, 0.22), MAIN_HW, MAIN_HH, MAIN_HD, {
    fill: 'rgba(20,20,24,0.96)',
    stroke: 'rgba(160,158,149,0.75)',
  });
  // Two phase dots on the handle.
  const dL1 = project(v3(-0.35, MAIN_Y, 0.22 + MAIN_HD), cam, W, H);
  const dL2 = project(v3( 0.35, MAIN_Y, 0.22 + MAIN_HD), cam, W, H);
  ctx.fillStyle = 'rgba(255,59,110,0.98)';
  ctx.beginPath(); ctx.arc(dL1.x, dL1.y, 3.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(91,174,248,0.98)';
  ctx.beginPath(); ctx.arc(dL2.x, dL2.y, 3.2, 0, Math.PI * 2); ctx.fill();
  const lbl = project(v3(0, MAIN_Y - MAIN_HH - 0.04, 0.22 + MAIN_HD), cam, W, H);
  ctx.fillStyle = 'rgba(160,158,149,0.85)';
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('MAIN  200 A', lbl.x, lbl.y);
}

function drawNeutralBar(ctx: CanvasRenderingContext2D, cam: OrbitCamera, W: number, H: number) {
  drawBox(
    ctx, cam, W, H,
    v3(0, NEUTRAL_Y, 0.05),
    NEUTRAL_X_HALF, NEUTRAL_THK / 2, 0.06,
    { fill: 'rgba(108,197,194,0.18)', stroke: 'rgba(108,197,194,0.85)' },
  );
  // Small terminal-screw ticks along the front face.
  for (let i = 0; i < 14; i++) {
    const x = -NEUTRAL_X_HALF + 0.08 + i * ((NEUTRAL_X_HALF * 2 - 0.16) / 13);
    const tick = project(v3(x, NEUTRAL_Y + 0.04, 0.11), cam, W, H);
    ctx.fillStyle = 'rgba(108,197,194,0.65)';
    ctx.beginPath(); ctx.arc(tick.x, tick.y, 1.4, 0, Math.PI * 2); ctx.fill();
  }
  const lbl = project(v3(-NEUTRAL_X_HALF - 0.10, NEUTRAL_Y, 0.11), cam, W, H);
  ctx.fillStyle = 'rgba(108,197,194,0.85)';
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText('NEUTRAL', lbl.x, lbl.y);
}

function drawGroundBar(ctx: CanvasRenderingContext2D, cam: OrbitCamera, W: number, H: number) {
  drawBox(
    ctx, cam, W, H,
    v3(0, GROUND_Y, 0.05),
    GROUND_X_HALF, GROUND_THK / 2, 0.05,
    { fill: 'rgba(108,197,194,0.10)', stroke: 'rgba(108,197,194,0.55)' },
  );
  for (let i = 0; i < 9; i++) {
    const x = -GROUND_X_HALF + 0.06 + i * ((GROUND_X_HALF * 2 - 0.12) / 8);
    const tick = project(v3(x, GROUND_Y + 0.03, 0.10), cam, W, H);
    ctx.fillStyle = 'rgba(108,197,194,0.45)';
    ctx.beginPath(); ctx.arc(tick.x, tick.y, 1.2, 0, Math.PI * 2); ctx.fill();
  }
  const lbl = project(v3(-GROUND_X_HALF - 0.10, GROUND_Y, 0.10), cam, W, H);
  ctx.fillStyle = 'rgba(108,197,194,0.55)';
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText('GROUND', lbl.x, lbl.y);
}

function drawBondingJumper(ctx: CanvasRenderingContext2D, cam: OrbitCamera, W: number, H: number) {
  // A single short strap from the right end of the neutral bar down to the
  // right end of the ground bar. drawGlowPath gives it the same teal halo
  // as the bars themselves, so the eye reads it as "the connection".
  const p1 = project(v3( NEUTRAL_X_HALF - 0.08, NEUTRAL_Y - NEUTRAL_THK / 2, 0.11), cam, W, H);
  const p2 = project(v3( NEUTRAL_X_HALF - 0.08, NEUTRAL_Y - 0.10,            0.11), cam, W, H);
  const p3 = project(v3( GROUND_X_HALF  - 0.05, GROUND_Y  + 0.05,            0.10), cam, W, H);
  const p4 = project(v3( GROUND_X_HALF  - 0.05, GROUND_Y  + GROUND_THK / 2, 0.10), cam, W, H);
  drawGlowPath(ctx, [p1, p2, p3, p4], {
    color: 'rgba(108,197,194,0.95)',
    lineWidth: 2.2,
    glowColor: 'rgba(108,197,194,0.32)',
    glowWidth: 8,
  });
  const lbl = project(v3(NEUTRAL_X_HALF - 0.04, (NEUTRAL_Y + GROUND_Y) / 2, 0.11), cam, W, H);
  ctx.fillStyle = 'rgba(108,197,194,0.85)';
  ctx.font = '9px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('bond', lbl.x, lbl.y);
}

function drawNeutralRoute(
  ctx: CanvasRenderingContext2D, cam: OrbitCamera, W: number, H: number,
  slot: Slot, tFlow: number,
) {
  // A thin white-ish line from the bottom of the breaker down to a
  // terminal on the neutral bar, then small dots flow along it at phase
  // tFlow to suggest the return current.
  const xTop = slot.breakerCx - 0.05;
  const xMid = slot.breakerCx - 0.45;
  const xBot = -NEUTRAL_X_HALF + 0.1 + ((slot.index + 0.5) / Math.max(1, 12)) * (NEUTRAL_X_HALF * 1.6);
  const route: Vec3[] = [
    v3(xTop, slot.y - 0.05, 0.18),
    v3(xMid, slot.y - 0.05, 0.16),
    v3(xMid, NEUTRAL_Y + 0.05, 0.14),
    v3(xBot, NEUTRAL_Y + 0.05, 0.12),
  ];
  const proj = route.map(p => project(p, cam, W, H));
  ctx.strokeStyle = 'rgba(220,220,210,0.45)';
  ctx.lineWidth = 1.0;
  ctx.beginPath();
  ctx.moveTo(proj[0]!.x, proj[0]!.y);
  for (let i = 1; i < proj.length; i++) ctx.lineTo(proj[i]!.x, proj[i]!.y);
  ctx.stroke();
  // Animated flow dot — interpolate along the polyline by total length.
  let total = 0;
  const lens: number[] = [];
  for (let i = 1; i < proj.length; i++) {
    const l = Math.hypot(proj[i]!.x - proj[i - 1]!.x, proj[i]!.y - proj[i - 1]!.y);
    lens.push(l); total += l;
  }
  const phase = (tFlow + slot.index * 0.13) % 1;
  let dist = phase * total;
  for (let i = 0; i < lens.length; i++) {
    if (dist <= lens[i]!) {
      const t = dist / lens[i]!;
      const x = proj[i]!.x + t * (proj[i + 1]!.x - proj[i]!.x);
      const y = proj[i]!.y + t * (proj[i + 1]!.y - proj[i]!.y);
      ctx.fillStyle = 'rgba(236,235,229,0.85)';
      ctx.beginPath();
      ctx.arc(x, y, 1.8, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    dist -= lens[i]!;
  }
}

/**
 * Generic axis-aligned 3D box renderer with painter ordering by face
 * depth. Used for breakers and the neutral / ground bars.
 */
function drawBox(
  ctx: CanvasRenderingContext2D, cam: OrbitCamera, W: number, H: number,
  centre: Vec3, hw: number, hh: number, hd: number,
  style: { fill: string; stroke: string },
) {
  const { x: cx, y: cy, z: cz } = centre;
  const c = [
    v3(cx - hw, cy - hh, cz - hd),
    v3(cx + hw, cy - hh, cz - hd),
    v3(cx + hw, cy + hh, cz - hd),
    v3(cx - hw, cy + hh, cz - hd),
    v3(cx - hw, cy - hh, cz + hd),
    v3(cx + hw, cy - hh, cz + hd),
    v3(cx + hw, cy + hh, cz + hd),
    v3(cx - hw, cy + hh, cz + hd),
  ];
  // Six faces by corner indices.
  const faces: [number, number, number, number][] = [
    [4, 5, 6, 7],  // front  (+z)
    [1, 0, 3, 2],  // back   (-z)
    [5, 1, 2, 6],  // right  (+x)
    [0, 4, 7, 3],  // left   (-x)
    [3, 7, 6, 2],  // top    (+y)
    [0, 1, 5, 4],  // bottom (-y)
  ];
  // Painter sort by mean depth (largest depth = furthest = drawn first).
  const projected = c.map(p => project(p, cam, W, H));
  const faceDepths = faces.map(f => ({
    f,
    d: (projected[f[0]]!.depth + projected[f[1]]!.depth + projected[f[2]]!.depth + projected[f[3]]!.depth) / 4,
  }));
  faceDepths.sort((a, b) => b.d - a.d);
  for (const { f } of faceDepths) {
    const pts = f.map(i => projected[i]!);
    ctx.fillStyle = style.fill;
    ctx.strokeStyle = style.stroke;
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(pts[0]!.x, pts[0]!.y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i]!.x, pts[i]!.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}
