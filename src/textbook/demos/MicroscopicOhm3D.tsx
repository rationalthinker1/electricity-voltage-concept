/**
 * Demo D3.0a — J = σE (microscopic Ohm's law, in 3D)
 *
 * A translucent cylindrical wire viewed through an orbital camera. An
 * applied electric field E points along the axis (+x); the free
 * electrons (cyan) respond by drifting in the opposite direction at a
 * speed proportional to σE. The macroscopic current density J — being
 * the flow of positive charge — points the same way as E, with
 * magnitude σE. Around the wire, a magnetic field B circles by the
 * right-hand rule with magnitude proportional to the current. Three
 * vectors, one wire, one equation:
 *
 *   J = σE        (microscopic Ohm's law)
 *   B(r) = μ0 I / (2π r)
 *
 * Sliders
 *   material — discrete picker across 5 metals (nichrome ⇢ copper).
 *   E        — applied field (10⁻³ to 1 V/m, log10).
 *
 * Readouts
 *   σ, J = σE, drift velocity v_d, total current I through a 1 mm² wire.
 *
 * Drag to orbit. Theme colours re-read per-frame so a light/dark toggle
 * re-paints the diagram in place.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';
import { getCanvasColors } from '@/lib/canvasTheme';
import { MATERIALS, type MaterialKey, PHYS } from '@/lib/physics';
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

// Materials ordered worst → best conductor along the slider.
const MATERIAL_LIST: MaterialKey[] = ['nichrome', 'iron', 'tungsten', 'aluminum', 'copper'];

// Wire geometry, world units. Cylinder runs along x; radius is in y-z.
const X_HALF = 2.2;
const R_WIRE = 0.55;
const A_M2 = 1e-6; // 1 mm² — used for the readout total current

const N_ELECTRONS = 40;

// Slider range for E in V/m: log10 → 0.001 to 1.0.
const LOG_E_MIN = -3;
const LOG_E_MAX = 0;

// Reference values used for visual scaling so the diagram doesn't
// blow up at either extreme. We normalise vector lengths and ring
// brightnesses against J at "copper + maximum E".
const SIGMA_MAX = MATERIALS.copper.sigma;
const E_MAX_LIN = Math.pow(10, LOG_E_MAX);
const J_REF = SIGMA_MAX * E_MAX_LIN;
const I_REF = J_REF * A_M2;

// Visual drift step (world-units per frame at J = J_REF). Real v_d at
// copper + max E is ~4 mm/s; we keep the dot motion clearly visible.
const VIS_DRIFT_PER_FRAME = 0.012;

interface Electron {
  pos: Vec3;
}

export function MicroscopicOhm3DDemo({ figure }: Props) {
  const [logE, setLogE] = useState(-2); // E = 0.01 V/m default
  const [matIdx, setMatIdx] = useState(MATERIAL_LIST.indexOf('copper'));

  const matKey = MATERIAL_LIST[matIdx]!;
  const mat = MATERIALS[matKey]!;
  const computed = useMemo(() => {
    const E = Math.pow(10, logE);
    const sigma = mat.sigma;
    const n = mat.n;
    const J = sigma * E;
    const vd = J / (n * PHYS.e);
    const I = J * A_M2;
    return { E, sigma, n, J, vd, I };
  }, [logE, mat]);

  const stateRef = useRef({ computed });
  useEffect(() => {
    stateRef.current = { computed };
  }, [computed]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w: W, h: H, canvas } = info;
    let raf = 0;

    const cam: OrbitCamera = { yaw: 0.55, pitch: 0.22, distance: 7, fov: Math.PI / 4 };
    const dispose = attachOrbit(canvas, cam);

    // Initialise electrons uniformly inside the cylinder.
    const electrons: Electron[] = [];
    for (let i = 0; i < N_ELECTRONS; i++) {
      const u = Math.random();
      const phi = Math.random() * Math.PI * 2;
      const r = R_WIRE * Math.sqrt(u) * 0.95;
      const x = (Math.random() * 2 - 1) * X_HALF * 0.95;
      electrons.push({ pos: v3(x, r * Math.cos(phi), r * Math.sin(phi)) });
    }

    function draw() {
      const colors = getCanvasColors();
      const { computed: c } = stateRef.current;

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, W, H);

      // Drift step proportional to real J = σE; electrons move in -x
      // (opposite to conventional current).
      const driftStep = -VIS_DRIFT_PER_FRAME * (c.J / J_REF);
      for (const e of electrons) {
        e.pos.x += driftStep;
        if (e.pos.x > X_HALF) e.pos.x -= 2 * X_HALF;
        else if (e.pos.x < -X_HALF) e.pos.x += 2 * X_HALF;
      }

      // Magnitudes normalised for visual purposes; both are clamped to 1.
      const Enorm = Math.min(1, c.E / E_MAX_LIN);
      const Jnorm = Math.min(1, c.J / J_REF);
      const Inorm = Math.min(1, c.I / I_REF);

      drawWireScaffold(ctx, colors, cam, W, H);
      drawBFieldRings(ctx, colors, cam, W, H, Inorm);
      drawFieldVectors(ctx, colors, cam, W, H, Enorm, Jnorm);
      drawElectrons(ctx, colors, cam, W, H, electrons);
      drawLegend(ctx, colors, W, H, mat.name);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      dispose();
    };
  }, [mat.name]);

  return (
    <Demo
      figure={figure ?? 'Fig. 3.0a'}
      title="J = σE — current density follows the field"
      question="Inside a conductor: how does an applied field push the charges?"
      caption={
        <>
          Inside the cylinder, the orange arrow on the wire axis is the applied electric field{' '}
          <em className="text-text italic">E</em>; the pink arrow is the current density{' '}
          <strong>J = σE</strong>, parallel to <em className="text-text italic">E</em> and longer or
          shorter depending on the material's conductivity. The cyan dots are free electrons; they
          drift opposite to <em className="text-text italic">E</em> at a speed proportional to{' '}
          <strong>σE</strong>. Around the wire, the teal rings are the magnetic field{' '}
          <strong>B</strong>: perpendicular to the wire, curling by the right-hand rule, with
          magnitude tracking the current. Slide <em className="text-text italic">E</em> up — the
          electrons speed up, <strong>J</strong> grows in lockstep, and the B-field rings brighten.
          Switch material to nichrome and the same field gives ~65× less current — same equation,
          different σ. Drag to orbit.
        </>
      }
      deeperLab={{ slug: 'resistance', label: 'See full lab' }}
    >
      <AutoResizeCanvas
        height={380}
        setup={setup}
        ariaLabel="3D wire showing E and J vectors, B field rings, and drifting electrons"
      />
      <DemoControls>
        <MiniSlider
          label="material"
          value={matIdx}
          min={0}
          max={MATERIAL_LIST.length - 1}
          step={1}
          format={() => mat.name}
          onChange={(v) => setMatIdx(Math.round(v))}
        />
        <MiniSlider
          label="field E"
          value={logE}
          min={LOG_E_MIN}
          max={LOG_E_MAX}
          step={0.05}
          format={(v) => Math.pow(10, v).toExponential(2) + ' V/m'}
          onChange={setLogE}
        />
        <MiniReadout label="σ" value={<Num value={computed.sigma} />} unit="S/m" />
        <MiniReadout label="J = σE" value={<Num value={computed.J} />} unit="A/m²" />
        <MiniReadout label="v_d" value={<Num value={computed.vd} />} unit="m/s" />
        <MiniReadout label="I  (1 mm²)" value={<Num value={computed.I} />} unit="A" />
      </DemoControls>
    </Demo>
  );
}

/* ─── Drawing helpers ──────────────────────────────────────────────────── */

interface ThemeLite {
  bg: string;
  text: string;
  textDim: string;
  accent: string;
  teal: string;
  pink: string;
  blue: string;
}

function drawWireScaffold(
  ctx: CanvasRenderingContext2D,
  colors: ThemeLite,
  cam: OrbitCamera,
  W: number,
  H: number,
) {
  // Five hoops around the cylinder + several axial generators give the
  // shape without overdrawing the field arrows inside.
  const xs = [-X_HALF, -X_HALF / 2, 0, X_HALF / 2, X_HALF];
  const RIM_N = 48;

  for (const xAxial of xs) {
    const pts: Vec3[] = [];
    for (let i = 0; i < RIM_N; i++) {
      const phi = (i / RIM_N) * Math.PI * 2;
      pts.push(v3(xAxial, R_WIRE * Math.cos(phi), R_WIRE * Math.sin(phi)));
    }
    const projected = pts.map((p) => project(p, cam, W, H));
    const sorted = [...projected.map((p) => p.depth)].sort((a, b) => a - b);
    const cutoff = sorted[Math.floor(projected.length / 2)]!;

    for (const pass of ['back', 'front'] as const) {
      ctx.beginPath();
      let drawing = false;
      for (let i = 0; i <= RIM_N; i++) {
        const p = projected[i % RIM_N]!;
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
        pass === 'front' ? withAlpha(colors.accent, 0.7) : withAlpha(colors.accent, 0.18);
      ctx.lineWidth = 1.0;
      ctx.setLineDash(pass === 'back' ? [4, 4] : []);
      ctx.stroke();
    }
    ctx.setLineDash([]);
  }

  // Axial generators (longitudinal wireframe lines).
  const N_LONG = 10;
  for (let i = 0; i < N_LONG; i++) {
    const phi = (i / N_LONG) * Math.PI * 2;
    const y = R_WIRE * Math.cos(phi);
    const z = R_WIRE * Math.sin(phi);
    const mid = project(v3(0, y, z), cam, W, H);
    const back = mid.depth > cam.distance;
    const p1 = project(v3(-X_HALF, y, z), cam, W, H);
    const p2 = project(v3(+X_HALF, y, z), cam, W, H);
    ctx.save();
    ctx.lineWidth = 0.9;
    ctx.strokeStyle = back ? withAlpha(colors.textDim, 0.14) : withAlpha(colors.accent, 0.28);
    ctx.setLineDash(back ? [4, 4] : []);
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
    ctx.restore();
  }
}

function drawBFieldRings(
  ctx: CanvasRenderingContext2D,
  colors: ThemeLite,
  cam: OrbitCamera,
  W: number,
  H: number,
  Inorm: number,
) {
  // B field circles the wire by the right-hand rule. Each ring lies in the
  // y-z plane at a fixed x; we draw five along the wire, with three small
  // arrowheads each indicating the +B tangent direction.
  const ringPositions = [-1.6, -0.8, 0, 0.8, 1.6];
  const R_RING = R_WIRE * 1.6;
  const RIM_N = 56;

  for (const xRing of ringPositions) {
    const projected: Point2D[] = [];
    for (let i = 0; i < RIM_N; i++) {
      const theta = (i / RIM_N) * Math.PI * 2;
      projected.push(
        project(v3(xRing, R_RING * Math.cos(theta), R_RING * Math.sin(theta)), cam, W, H),
      );
    }
    const sorted = [...projected.map((p) => p.depth)].sort((a, b) => a - b);
    const cutoff = sorted[Math.floor(projected.length / 2)]!;

    const baseAlpha = 0.18 + 0.55 * Inorm;
    const lineWidth = 0.9 + 1.7 * Inorm;
    for (const pass of ['back', 'front'] as const) {
      ctx.beginPath();
      let drawing = false;
      for (let i = 0; i <= RIM_N; i++) {
        const p = projected[i % RIM_N]!;
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
      ctx.strokeStyle = withAlpha(
        colors.teal,
        pass === 'front' ? baseAlpha : baseAlpha * 0.35,
      );
      ctx.lineWidth = lineWidth;
      ctx.setLineDash(pass === 'back' ? [3, 3] : []);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Tangent arrowheads at three points per ring. Right-hand rule with
    // current in +x: tangent direction at (y=Rcosθ, z=Rsinθ) is (-sinθ, cosθ).
    const arrowsPerRing = 3;
    for (let a = 0; a < arrowsPerRing; a++) {
      const theta = (a / arrowsPerRing) * Math.PI * 2;
      const head = v3(xRing, R_RING * Math.cos(theta), R_RING * Math.sin(theta));
      const back = v3(
        xRing,
        R_RING * Math.cos(theta) + 0.18 * Math.sin(theta),
        R_RING * Math.sin(theta) - 0.18 * Math.cos(theta),
      );
      const pHead = project(head, cam, W, H);
      const pBack = project(back, cam, W, H);
      if (pHead.depth <= 0 || pBack.depth <= 0) continue;
      const isFront = pHead.depth <= cutoff;
      const headAlpha = (isFront ? 0.55 : 0.2) + 0.45 * Inorm;
      drawArrowhead(ctx, pBack, pHead, withAlpha(colors.teal, headAlpha), 5, 2.8);
    }
  }

  // Per-ring "B" label, placed near the top-most ring's top-most point so
  // the symbol sits visually next to the rings without colliding with the
  // wire body.
  const labelAt = project(v3(0, R_RING * 1.15, 0), cam, W, H);
  ctx.fillStyle = withAlpha(colors.teal, 0.45 + 0.5 * Inorm);
  ctx.font = "italic 13px 'STIX Two Text', serif";
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText('B', labelAt.x, labelAt.y - 4);
}

function drawFieldVectors(
  ctx: CanvasRenderingContext2D,
  colors: ThemeLite,
  cam: OrbitCamera,
  W: number,
  H: number,
  Enorm: number,
  Jnorm: number,
) {
  // E vector on the wire axis. Length scales linearly with Enorm so a tiny
  // field really does read as a tiny arrow.
  const ELEN = X_HALF * 1.6;
  const halfE = (ELEN * Enorm) / 2;
  const eTail = v3(-halfE, 0, 0);
  const eHead = v3(+halfE, 0, 0);
  const pE0 = project(eTail, cam, W, H);
  const pE1 = project(eHead, cam, W, H);
  drawVectorArrow(
    ctx,
    pE0,
    pE1,
    withAlpha(colors.accent, 0.55 + 0.4 * Enorm),
    2 + 1.5 * Enorm,
  );
  // Label "E" near the head.
  const eLabelAnchor = project(v3(halfE + 0.18, 0.18, 0), cam, W, H);
  ctx.fillStyle = withAlpha(colors.accent, 0.85);
  ctx.font = "italic 13px 'STIX Two Text', serif";
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('E', eLabelAnchor.x, eLabelAnchor.y);

  // J vector — same axis but offset above the wire so the two arrows are
  // distinguishable. Length scales with Jnorm.
  const yJ = R_WIRE * 1.85;
  const halfJ = (ELEN * Jnorm) / 2;
  const jTail = v3(-halfJ, yJ, 0);
  const jHead = v3(+halfJ, yJ, 0);
  const pJ0 = project(jTail, cam, W, H);
  const pJ1 = project(jHead, cam, W, H);
  drawVectorArrow(
    ctx,
    pJ0,
    pJ1,
    withAlpha(colors.pink, 0.6 + 0.4 * Jnorm),
    2 + 1.5 * Jnorm,
  );
  const jLabelAnchor = project(v3(halfJ + 0.18, yJ + 0.18, 0), cam, W, H);
  ctx.fillStyle = withAlpha(colors.pink, 0.9);
  ctx.font = "italic 13px 'STIX Two Text', serif";
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('J = σE', jLabelAnchor.x, jLabelAnchor.y);
}

function drawElectrons(
  ctx: CanvasRenderingContext2D,
  colors: ThemeLite,
  cam: OrbitCamera,
  W: number,
  H: number,
  electrons: Electron[],
) {
  // Back-to-front so a dot in front of the wire hoops shows up on top.
  const projected = electrons
    .map((e) => project(e.pos, cam, W, H))
    .filter((p) => p.depth > 0)
    .sort((a, b) => b.depth - a.depth);

  for (const p of projected) {
    const radius = 2.4;
    ctx.fillStyle = withAlpha(colors.blue, 0.25);
    ctx.beginPath();
    ctx.arc(p.x, p.y, radius * 2.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = withAlpha(colors.blue, 0.95);
    ctx.beginPath();
    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawLegend(
  ctx: CanvasRenderingContext2D,
  colors: ThemeLite,
  W: number,
  H: number,
  matName: string,
) {
  ctx.font = '11px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = colors.textDim;
  ctx.fillText('drag to rotate', 12, 12);

  ctx.textAlign = 'right';
  ctx.fillStyle = withAlpha(colors.accent, 0.95);
  ctx.fillText('E   applied field', W - 12, 12);
  ctx.fillStyle = withAlpha(colors.pink, 0.95);
  ctx.fillText('J = σE   current density', W - 12, 28);
  ctx.fillStyle = withAlpha(colors.teal, 0.95);
  ctx.fillText('B   magnetic field', W - 12, 44);
  ctx.fillStyle = withAlpha(colors.blue, 0.95);
  ctx.fillText('electrons (drift)', W - 12, 60);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';
  ctx.fillStyle = colors.textDim;
  ctx.fillText(`${matName} · 1 mm² cross-section · arrows scaled, vectors real`, 12, H - 12);
}

/* ─── Vector / arrowhead primitives ────────────────────────────────────── */

function drawVectorArrow(
  ctx: CanvasRenderingContext2D,
  from: Point2D,
  to: Point2D,
  color: string,
  lineWidth: number,
) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy);
  if (len < 1) return;
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
  drawArrowhead(ctx, from, to, color, 8 + lineWidth, 5 + lineWidth);
}

function drawArrowhead(
  ctx: CanvasRenderingContext2D,
  from: Point2D,
  to: Point2D,
  color: string,
  headLen = 6,
  headHalf = 3.5,
) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy);
  if (len < 1) return;
  const ux = dx / len;
  const uy = dy / len;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(to.x, to.y);
  ctx.lineTo(to.x - ux * headLen - uy * headHalf, to.y - uy * headLen + ux * headHalf);
  ctx.lineTo(to.x - ux * headLen + uy * headHalf, to.y - uy * headLen - ux * headHalf);
  ctx.closePath();
  ctx.fill();
}

/* ─── colour helper ────────────────────────────────────────────────────── */

function withAlpha(color: string, alpha: number): string {
  if (color.startsWith('#')) {
    let r: number;
    let g: number;
    let b: number;
    if (color.length === 7) {
      r = parseInt(color.slice(1, 3), 16);
      g = parseInt(color.slice(3, 5), 16);
      b = parseInt(color.slice(5, 7), 16);
    } else if (color.length === 4) {
      r = parseInt(color[1]! + color[1]!, 16);
      g = parseInt(color[2]! + color[2]!, 16);
      b = parseInt(color[3]! + color[3]!, 16);
    } else {
      return color;
    }
    return `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
  }
  const m = color.match(/rgba?\(([^)]+)\)/);
  if (m) {
    const parts = m[1]!.split(',').map((s) => s.trim());
    return `rgba(${parts[0]},${parts[1]},${parts[2]},${alpha.toFixed(3)})`;
  }
  return color;
}
