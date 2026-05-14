/**
 * Demo D23.X — Transformer designer
 *
 * The reader picks N_p, N_s, operating frequency f, load power, core
 * material (laminated iron / silicon steel / ferrite), and core shape
 * (E-core or toroid). The demo computes — live — turns ratio, secondary
 * voltage from a 120 V_rms primary, peak core flux density B_max, the
 * magnetising current, copper and core (Steinmetz) losses, and overall
 * efficiency η. The core's flux-density status is rendered as a colour
 * fill on the magnetic limb: amber when well below B_sat, red and bordered
 * when saturating.
 *
 * Equations:
 *   V_s          = V_p · N_s / N_p
 *   B_max        = V_p / (4.44 · f · N_p · A_core)
 *                  — "transformer equation" — pinned to McLyman §3.
 *   I_mag        ≈ V_p / (2π · f · L_p),  L_p = μ_0·μ_r·N_p²·A/l_core
 *   P_core       = k · f^α · B_max^β · V_core   (Steinmetz; α≈1.5, β≈2.5)
 *   P_copper     = I_load² · R_p_eff + I_load² · R_s_eff   (simplified;
 *                  reflected secondary current dominates at the rated load)
 *   η            = P_load / (P_load + P_copper + P_core)
 *
 * No animation — purely a design-explorer: the canvas paints a top-down
 * transformer (E-core or toroid) with the two windings as schematic coils,
 * the iron core fill modulated by B_max/B_sat, and a load resistor on the
 * secondary side. State changes redraw on demand via a small "dirty" tick.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import {
  Demo, DemoControls, MiniReadout, MiniSlider, MiniToggle,
} from '@/components/Demo';
import { Num } from '@/components/Num';
import { PHYS } from '@/lib/physics';

interface Props { figure?: string }

type CoreKey = 'laminated-iron' | 'silicon-steel' | 'ferrite';
type ShapeKey = 'e-core' | 'toroid';

interface CoreMaterial {
  key: CoreKey;
  name: string;
  /** Peak flux density at which the material saturates (T). */
  B_sat: number;
  /** Relative permeability (dimensionless), small-signal in linear region. */
  mu_r: number;
  /** Steinmetz coefficient k (W/m³ at B in tesla, f in hertz) — typical lit. values. */
  k_steinmetz: number;
  /** Steinmetz frequency exponent. */
  alpha: number;
  /** Steinmetz flux-density exponent. */
  beta: number;
  /** UI accent. */
  color: string;
  /** Short trade-off summary shown in the caption when chosen. */
  blurb: string;
}

// Core materials — published-typical values (McLyman 2004, Fitzgerald
// et al. 2014). The Steinmetz constants are order-of-magnitude figures
// suitable for a design-intuition demo, not a manufacturing datasheet.
const CORE_MATERIALS: Record<CoreKey, CoreMaterial> = {
  'laminated-iron': {
    key: 'laminated-iron', name: 'Laminated iron',
    B_sat: 1.5, mu_r: 1500, k_steinmetz: 6.0, alpha: 1.5, beta: 2.5,
    color: '#c9a06b',
    blurb: 'Cheap. Tolerates high flux (B_sat ≈ 1.5 T). Loud at line frequency; eddy losses explode above a few kilohertz. Used in mains-frequency power transformers up to a few kVA.',
  },
  'silicon-steel': {
    key: 'silicon-steel', name: 'Silicon steel',
    B_sat: 1.7, mu_r: 5000, k_steinmetz: 2.0, alpha: 1.5, beta: 2.5,
    color: '#b6c0c2',
    blurb: 'Grain-oriented silicon steel — the standard for utility transformers. Highest B_sat, low-loss at 50/60 Hz. Heavy. Still wasteful above ~1 kHz.',
  },
  'ferrite': {
    key: 'ferrite', name: 'Ferrite (Mn-Zn)',
    B_sat: 0.4, mu_r: 2500, k_steinmetz: 0.05, alpha: 1.5, beta: 2.5,
    color: '#6b6f78',
    blurb: 'Sintered ceramic. Saturates at a low 0.4 T but barely loses anything up to hundreds of kilohertz. The core inside every modern SMPS, phone charger, and aircraft 400 Hz transformer.',
  },
};

const CORE_KEYS: CoreKey[] = ['laminated-iron', 'silicon-steel', 'ferrite'];

export function TransformerDesignerDemo({ figure }: Props) {
  // Reader inputs.
  const [Np, setNp] = useState(200);
  const [Ns, setNs] = useState(20);
  const [f, setF] = useState(60);            // Hz
  const [Pload, setPload] = useState(50);    // W
  const [coreKey, setCoreKey] = useState<CoreKey>('silicon-steel');
  const [shape, setShape] = useState<ShapeKey>('e-core');

  const mat = CORE_MATERIALS[coreKey];

  // Geometry — fixed-ish core size so the design lever is N_p, f, and
  // material rather than physical size. Cross-section A_core ≈ 6 cm²
  // (typical of a small-to-medium mains transformer). Mean magnetic path
  // length l_core ≈ 0.18 m for the E-core; 0.14 m for the toroid.
  const A_core = 6e-4;                                  // m²
  const l_core = shape === 'toroid' ? 0.14 : 0.18;      // m
  const V_core = A_core * l_core;                       // m³

  // Electrical inputs.
  const V_p = 120;                                       // V_rms primary
  const V_s = V_p * (Ns / Np);                           // V_rms ideal secondary

  // Transformer / core equation. B_max in tesla.
  const B_max = V_p / (4.44 * f * Np * A_core);
  const saturating = B_max > mat.B_sat;
  const sat_frac = Math.min(2.0, B_max / mat.B_sat);     // ≥1 means over-sat
  // Visual flux-fill colour: amber→red as we approach and exceed B_sat.
  const fluxFill = saturating
    ? `rgba(255, 59, 110, ${Math.min(0.85, 0.55 + (sat_frac - 1) * 0.4)})`
    : `rgba(255, 107, 42, ${0.18 + Math.min(0.5, B_max / mat.B_sat) * 0.45})`;

  // Primary inductance L_p = μ_0 · μ_r · N_p² · A / l_core.
  // I_mag (RMS) = V_p / (2π f L_p) — the no-load magnetising current.
  const L_p = PHYS.mu_0 * mat.mu_r * Np * Np * A_core / l_core;
  const I_mag = V_p / (2 * Math.PI * f * L_p);

  // Load currents.
  const I_s = Pload / Math.max(V_s, 1e-6);               // A
  const I_p = Pload / V_p;                               // ideal-transformer primary current

  // Winding resistance — a small linear model. Per-turn resistance
  // r_per_turn ~ 5 mΩ for a 5-cm mean-turn length of small magnet wire.
  // This is a teaching approximation, not a wire-gauge calculation.
  const r_per_turn = 0.005;                              // Ω / turn
  const R_p = r_per_turn * Np;
  const R_s = r_per_turn * Ns;
  const P_copper = I_p * I_p * R_p + I_s * I_s * R_s;

  // Steinmetz core loss density × volume.
  // Note: when B_max overshoots B_sat the actual loss balloons further
  // (the model breaks down) — we clip B_max into the Steinmetz term to
  // keep the readout finite, but the saturation warning fires regardless.
  const B_for_loss = Math.min(B_max, mat.B_sat * 1.4);
  const P_core = mat.k_steinmetz
    * Math.pow(f, mat.alpha)
    * Math.pow(B_for_loss, mat.beta)
    * V_core;

  const eta = Pload / (Pload + P_copper + P_core);

  // "Operating envelope" status.
  let envelope: 'optimal' | 'approaching' | 'saturated' | 'too-few-turns';
  if (B_max > mat.B_sat) envelope = 'saturated';
  else if (B_max > mat.B_sat * 0.85) envelope = 'approaching';
  else if (Np < 20 && f < 1000) envelope = 'too-few-turns';
  else envelope = 'optimal';

  const envelopeLabel = {
    optimal: 'Optimal',
    approaching: 'Approaching saturation',
    saturated: 'SATURATED',
    'too-few-turns': 'Too few turns for f',
  }[envelope];

  const envelopeColor = {
    optimal: '#6cc5c2',
    approaching: '#ffcc55',
    saturated: '#ff3b6e',
    'too-few-turns': '#ffcc55',
  }[envelope];

  // State the canvas needs.
  const stateRef = useRef({ Np, Ns, shape, coreKey, fluxFill, saturating, sat_frac });
  useEffect(() => {
    stateRef.current = { Np, Ns, shape, coreKey, fluxFill, saturating, sat_frac };
  }, [Np, Ns, shape, coreKey, fluxFill, saturating, sat_frac]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w: W, h: H } = info;
    let raf = 0;

    function draw() {
      const { Np, Ns, shape, coreKey, fluxFill, saturating } = stateRef.current;
      const mat = CORE_MATERIALS[coreKey];

      ctx.fillStyle = '#0d0d10';
      ctx.fillRect(0, 0, W, H);

      const cx = W / 2;
      const cy = H / 2;

      if (shape === 'e-core') {
        drawECore(ctx, cx, cy, W, H, fluxFill, saturating, mat.color, Np, Ns);
      } else {
        drawToroid(ctx, cx, cy, W, H, fluxFill, saturating, mat.color, Np, Ns);
      }

      // Top-left label
      ctx.fillStyle = 'rgba(160,158,149,0.85)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(mat.name.toUpperCase(), 12, 10);
      ctx.fillText(`B_sat = ${mat.B_sat.toFixed(2)} T`, 12, 24);
      ctx.fillText(`μ_r  = ${mat.mu_r}`, 12, 38);

      // Top-right warning
      if (saturating) {
        ctx.textAlign = 'right';
        ctx.fillStyle = '#ff3b6e';
        ctx.font = 'bold 11px "JetBrains Mono", monospace';
        ctx.fillText('CORE SATURATING', W - 12, 10);
        ctx.fillStyle = 'rgba(255,59,110,0.8)';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillText('μ collapses → huge I_mag → heat', W - 12, 24);
      }

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Caption: combine the static intro with the material's blurb so the
  // reader sees why their choice matters.
  const caption = useMemo(() => (
    <>
      Pick a core material, set the turns counts and operating frequency,
      and watch the design land on a sweet spot — or fall off it. <strong>B<sub>max</sub> = V<sub>p</sub>/(4.44·f·N<sub>p</sub>·A)</strong>: too few primary turns at 60 Hz pushes flux past B<sub>sat</sub> and the core saturates; raising frequency lets you shrink turns without saturating, which is exactly why your phone charger runs at 100 kHz. <em>{mat.blurb}</em>
    </>
  ), [mat]);

  return (
    <Demo
      figure={figure ?? 'Fig. 23.10'}
      title="Transformer designer"
      question="Can you pick N_p, f, and a core material that delivers 50 W to the load at >95% efficiency without saturating?"
      caption={caption}
      deeperLab={{ slug: 'faraday', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={320} setup={setup} />
      <DemoControls>
        {CORE_KEYS.map(k => (
          <button
            key={k}
            type="button"
            className={`mini-toggle${k === coreKey ? ' on' : ''}`}
            onClick={() => setCoreKey(k)}
            aria-pressed={k === coreKey}
          >
            {CORE_MATERIALS[k].name}
          </button>
        ))}
        <MiniToggle
          label={shape === 'e-core' ? 'shape: E-core' : 'shape: toroid'}
          checked={shape === 'toroid'}
          onChange={v => setShape(v ? 'toroid' : 'e-core')}
        />
        <MiniSlider
          label="N_p"
          value={Np} min={10} max={500} step={1}
          format={v => v.toFixed(0)}
          onChange={setNp}
        />
        <MiniSlider
          label="N_s"
          value={Ns} min={10} max={500} step={1}
          format={v => v.toFixed(0)}
          onChange={setNs}
        />
        <MiniSlider
          label="f"
          value={f} min={50} max={100000} step={50}
          format={fmtFreq}
          onChange={setF}
        />
        <MiniSlider
          label="P_load"
          value={Pload} min={1} max={100} step={1}
          format={v => v.toFixed(0) + ' W'}
          onChange={setPload}
        />
        <MiniReadout label="N_p : N_s" value={`${Math.round(Np)} : ${Math.round(Ns)}`} />
        <MiniReadout label="V_s (from 120 V)" value={V_s.toFixed(1)} unit="V" />
        <MiniReadout
          label="B_max"
          value={
            <span style={{ color: saturating ? '#ff3b6e' : envelope === 'approaching' ? '#ffcc55' : '#ecebe5' }}>
              {B_max < 0.01 ? B_max.toExponential(2) : B_max.toFixed(2)}
            </span>
          }
          unit={`T  / B_sat ${mat.B_sat.toFixed(2)} T`}
        />
        <MiniReadout label="I_mag (no-load)" value={<Num value={I_mag} />} unit="A" />
        <MiniReadout label="P_copper" value={<Num value={P_copper} />} unit="W" />
        <MiniReadout label="P_core" value={<Num value={P_core} />} unit="W" />
        <MiniReadout
          label="η = P_out / P_in"
          value={
            <span style={{ color: eta > 0.95 ? '#6cc5c2' : eta > 0.85 ? '#ffcc55' : '#ff3b6e' }}>
              {(eta * 100).toFixed(1)}
            </span>
          }
          unit="%"
        />
        <MiniReadout
          label="Envelope"
          value={<span style={{ color: envelopeColor, fontWeight: 600 }}>{envelopeLabel}</span>}
        />
      </DemoControls>
    </Demo>
  );
}

/* ────────────────────────────── canvas helpers ────────────────────────────── */

function drawECore(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, W: number, H: number,
  fluxFill: string, saturating: boolean, ironTint: string,
  Np: number, Ns: number,
) {
  // E-I core seen from above: a rectangular outer window with a central
  // limb. Two windings sit on the central limb (primary) and one of the
  // outer limbs (secondary), as is conventional in shell-type designs.
  // (Many practical E-cores wind both around the centre limb; this layout
  // separates them for visual clarity.)
  const coreW = Math.min(W * 0.62, 380);
  const coreH = Math.min(H * 0.66, 220);
  const x0 = cx - coreW / 2;
  const y0 = cy - coreH / 2;
  const limb = coreW * 0.16;

  // Iron tint base.
  ctx.fillStyle = 'rgba(60,60,68,0.55)';
  ctx.strokeStyle = saturating ? '#ff3b6e' : 'rgba(220,220,220,0.35)';
  ctx.lineWidth = saturating ? 3 : 1.4;

  // Outer rectangle.
  ctx.beginPath();
  ctx.rect(x0, y0, coreW, coreH);
  ctx.fill();
  ctx.stroke();

  // Two windows — left and right of the central limb.
  const winX1 = x0 + limb;
  const winX2 = x0 + coreW - limb - (coreW - 3 * limb) / 2;
  const winW = (coreW - 3 * limb) / 2;
  const winH = coreH - 2 * limb;

  // Cut out the windows (paint background).
  ctx.fillStyle = '#0d0d10';
  ctx.fillRect(winX1, y0 + limb, winW, winH);
  ctx.fillRect(winX2, y0 + limb, winW, winH);

  // Now fill the iron region with the flux-fill colour.
  // Use a path that traces outer rectangle minus the two window rects.
  ctx.save();
  ctx.fillStyle = fluxFill;
  ctx.beginPath();
  ctx.rect(x0, y0, coreW, coreH);
  // Counter-clockwise sub-paths cut holes:
  ctx.rect(winX1 + winW, y0 + limb + winH, -winW, -winH);
  ctx.rect(winX2 + winW, y0 + limb + winH, -winW, -winH);
  ctx.fill('evenodd');
  ctx.restore();

  // Lamination hatch lines for visual texture (vertical thin lines).
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1;
  for (let x = x0 + 4; x < x0 + coreW; x += 6) {
    ctx.beginPath();
    ctx.moveTo(x, y0 + 2);
    ctx.lineTo(x, y0 + coreH - 2);
    ctx.stroke();
  }
  ctx.restore();

  // Central limb position.
  const centerLimbX = (winX1 + winW + winX2) / 2;
  // Right limb position.
  const rightLimbX = x0 + coreW - limb / 2;

  // Draw the two windings.
  drawWindingTopDown(ctx, centerLimbX, cy, limb * 0.45, coreH * 0.65, Np, '#ff6b2a', 'PRIMARY');
  drawWindingTopDown(ctx, rightLimbX,  cy, limb * 0.45, coreH * 0.65, Ns, '#6cc5c2', 'SECONDARY');

  // Tint ironTint slightly on the outer rim — pure visual cue for material.
  void ironTint;

  // Load on the secondary side: a small resistor symbol.
  const loadX = x0 + coreW + 42;
  const loadY1 = cy - 36;
  const loadY2 = cy + 36;
  // Leads
  ctx.strokeStyle = 'rgba(108,197,194,0.85)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(rightLimbX + limb * 0.45 + 6, loadY1);
  ctx.lineTo(loadX, loadY1);
  ctx.moveTo(rightLimbX + limb * 0.45 + 6, loadY2);
  ctx.lineTo(loadX, loadY2);
  ctx.stroke();
  drawResistorZigzag(ctx, loadX, loadY1, loadX, loadY2, '#6cc5c2');
  ctx.fillStyle = 'rgba(108,197,194,0.85)';
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('R_load', loadX + 14, cy);
}

function drawToroid(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, W: number, H: number,
  fluxFill: string, saturating: boolean, ironTint: string,
  Np: number, Ns: number,
) {
  const Router = Math.min(W, H) * 0.34;
  const Rinner = Router * 0.55;

  // Annular ring (iron).
  ctx.save();
  ctx.fillStyle = 'rgba(60,60,68,0.55)';
  ctx.strokeStyle = saturating ? '#ff3b6e' : 'rgba(220,220,220,0.35)';
  ctx.lineWidth = saturating ? 3 : 1.4;
  ctx.beginPath();
  ctx.arc(cx, cy, Router, 0, Math.PI * 2);
  ctx.arc(cx, cy, Rinner, 0, Math.PI * 2, true);
  ctx.fill('evenodd');
  ctx.stroke();
  // Outline inner edge separately so it gets the same stroke style.
  ctx.beginPath();
  ctx.arc(cx, cy, Rinner, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Flux fill (same annulus).
  ctx.save();
  ctx.fillStyle = fluxFill;
  ctx.beginPath();
  ctx.arc(cx, cy, Router, 0, Math.PI * 2);
  ctx.arc(cx, cy, Rinner, 0, Math.PI * 2, true);
  ctx.fill('evenodd');
  ctx.restore();

  void ironTint;

  // Windings: primary covers the left half, secondary covers the right half.
  drawToroidalWinding(ctx, cx, cy, Router, Rinner, Math.PI * 0.6, Math.PI * 1.4, Np, '#ff6b2a', 'PRIMARY', 'left');
  drawToroidalWinding(ctx, cx, cy, Router, Rinner, Math.PI * 1.6, Math.PI * 2.4, Ns, '#6cc5c2', 'SECONDARY', 'right');

  // Load resistor far right of the toroid.
  const loadX = cx + Router + 56;
  const loadY1 = cy - 30;
  const loadY2 = cy + 30;
  ctx.strokeStyle = 'rgba(108,197,194,0.85)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(cx + Router * 1.05, loadY1);
  ctx.lineTo(loadX, loadY1);
  ctx.moveTo(cx + Router * 1.05, loadY2);
  ctx.lineTo(loadX, loadY2);
  ctx.stroke();
  drawResistorZigzag(ctx, loadX, loadY1, loadX, loadY2, '#6cc5c2');
  ctx.fillStyle = 'rgba(108,197,194,0.85)';
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('R_load', loadX + 14, cy);
}

/**
 * A vertical "limb" winding: shown as a stack of horizontal ellipses
 * spanning the limb. Turn count maps to ellipse count (capped for sanity).
 */
function drawWindingTopDown(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  halfW: number, fullH: number,
  N: number, color: string, label: string,
) {
  const turns = Math.max(4, Math.min(28, Math.round(N / 12 + 4)));
  const yTop = cy - fullH / 2;
  const yBot = cy + fullH / 2;
  const pitch = (yBot - yTop) / turns;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.6;
  for (let i = 0; i < turns; i++) {
    const y = yTop + (i + 0.5) * pitch;
    ctx.beginPath();
    ctx.ellipse(cx, y, halfW + 6, pitch * 0.45, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  ctx.fillStyle = color;
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(`${label} (${N})`, cx, yBot + 6);
}

/**
 * Toroidal winding: draw N small radial coil arcs over an arc of the ring.
 * Each "turn" is a tiny crescent crossing the ring from outer to inner edge.
 */
function drawToroidalWinding(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  Router: number, Rinner: number,
  thStart: number, thEnd: number,
  N: number, color: string, label: string,
  side: 'left' | 'right',
) {
  const turns = Math.max(4, Math.min(40, Math.round(N / 10 + 4)));
  const dTheta = (thEnd - thStart) / turns;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  for (let i = 0; i < turns; i++) {
    const th = thStart + (i + 0.5) * dTheta;
    // A small crescent: from just outside R_outer to just inside R_inner,
    // crossing the ring radially.
    const oxOut = cx + Math.cos(th) * (Router + 4);
    const oyOut = cy + Math.sin(th) * (Router + 4);
    const oxIn  = cx + Math.cos(th) * (Rinner - 4);
    const oyIn  = cy + Math.sin(th) * (Rinner - 4);
    ctx.beginPath();
    ctx.moveTo(oxOut, oyOut);
    ctx.lineTo(oxIn, oyIn);
    ctx.stroke();
    // Outer arc to next turn — gives the visual "wraps around the ring".
    const thNext = thStart + (i + 1) * dTheta;
    if (i < turns - 1) {
      ctx.beginPath();
      ctx.arc(cx, cy, Router + 4, th, thNext);
      ctx.stroke();
    }
  }
  ctx.restore();

  // Label
  const thMid = (thStart + thEnd) / 2;
  const lx = cx + Math.cos(thMid) * (Router + 22);
  const ly = cy + Math.sin(thMid) * (Router + 22);
  ctx.fillStyle = color;
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.textAlign = side === 'left' ? 'right' : 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${label} (${N})`, lx, ly);
}

function drawResistorZigzag(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number, x2: number, y2: number, color: string,
) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len <= 0) return;
  const ux = dx / len, uy = dy / len;
  const nx = -uy, ny = ux;
  const segments = 6;
  const step = len / segments;
  const amp = 5;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  for (let i = 0; i < segments; i++) {
    const along = (i + 0.5) * step;
    const normal = i % 2 === 0 ? -amp : amp;
    ctx.lineTo(x1 + ux * along + nx * normal, y1 + uy * along + ny * normal);
  }
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

/* ────────────────────────────── formatters ────────────────────────────── */

function fmtFreq(v: number): string {
  if (v >= 1000) return (v / 1000).toFixed(v >= 10000 ? 0 : 1) + ' kHz';
  return v.toFixed(0) + ' Hz';
}
