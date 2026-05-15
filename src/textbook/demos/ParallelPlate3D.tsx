/**
 * Demo 5.x — Parallel-plate capacitor in 3D
 *
 * Two square plates floating in space, viewed through an orbital camera.
 * The reader drags to rotate, then varies plate area, gap, and applied
 * voltage. As they do:
 *   - Surface-charge density σ = Q/A is rendered on each plate by a sparse
 *     6×6 grid of + or − marks. The mark size scales with σ.
 *   - The gap fills with a regular 3D grid of E-field arrows pointing from
 *     the positive (top) plate to the negative (bottom) plate. Arrow length
 *     scales with E = σ/ε₀ = V/d.
 *   - The gap volume is tinted a translucent amber to suggest "field
 *     volume" — the place where ½ε₀E² lives.
 *   - A toggle reveals a small Gauss pillbox piercing the top plate, with
 *     the identity ∮ D · dA = σA = Q_enclosed displayed alongside the
 *     pillbox.
 *
 * Quantities exposed in readouts: C = ε₀A/d (pF), Q = CV (nC),
 * U = ½CV² (nJ), E = V/d (V/m).
 *
 * The painter-sort order is fixed (no per-arrow depth sort needed because
 * the geometry is so symmetric): back-plate marks first, then field
 * arrows, then front-plate marks, then the optional pillbox on top.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider, MiniToggle } from '@/components/Demo';
import { Num } from '@/components/Num';
import { drawGlowPath } from '@/lib/canvasPrimitives';
import { PHYS } from '@/lib/physics';
import { getCanvasColors } from '@/lib/canvasTheme';
import {
  attachOrbit, project, v3,
  type OrbitCamera, type Vec3,
} from '@/lib/projection3d';

interface Props { figure?: string }

// Visual world-units scaling.
//   A is given in cm², d in mm, V in volts. We map A and d to world units
//   for rendering, but the readouts always show the real SI values.
const SIZE_REF = 250; // cm² mapped to world plate half-side 1.5
const SIZE_HALF_MIN = 0.6;
const SIZE_HALF_MAX = 1.8;
const GAP_SCALE = 0.12; // world units per mm of physical gap

function plateHalfWorld(A_cm2: number): number {
  // Plate is square; side = √A. Map by linear interpolation in √A.
  const sideRel = Math.sqrt(A_cm2 / SIZE_REF);
  const half = SIZE_HALF_MIN + (SIZE_HALF_MAX - SIZE_HALF_MIN) * Math.min(1.4, Math.max(0.3, sideRel));
  return half;
}

function gapWorld(d_mm: number): number {
  // Clamp the visible gap so very-thin physical gaps still read.
  return Math.max(0.15, Math.min(1.8, d_mm * GAP_SCALE));
}

export function ParallelPlate3DDemo({ figure }: Props) {
  const [A_cm2, setA] = useState(100);   // cm²
  const [d_mm, setD] = useState(2);      // mm
  const [V, setV] = useState(9);         // volts
  const [showGauss, setShowGauss] = useState(false);

  const computed = useMemo(() => {
    const A_m2 = A_cm2 * 1e-4;            // cm² → m²
    const d_m = d_mm * 1e-3;              // mm → m
    const C = PHYS.eps_0 * A_m2 / d_m;    // farads
    const Q = C * V;                      // coulombs
    const U = 0.5 * C * V * V;            // joules
    const E = V / d_m;                    // V/m
    const sigma = Q / A_m2;               // C/m²  (= ε₀ E)
    const sigmaA = sigma * A_m2;          // coulombs (= Q_enclosed of the pillbox if pillbox area = A)
    return { A_m2, d_m, C, Q, U, E, sigma, sigmaA };
  }, [A_cm2, d_mm, V]);

  const stateRef = useRef({ A_cm2, d_mm, V, showGauss, computed });
  useEffect(() => {
    stateRef.current = { A_cm2, d_mm, V, showGauss, computed };
  }, [A_cm2, d_mm, V, showGauss, computed]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w: W, h: H, canvas } = info;
    const cam: OrbitCamera = { yaw: 0.55, pitch: 0.32, distance: 7.2, fov: Math.PI / 4 };
    const dispose = attachOrbit(canvas, cam);
    let raf = 0;

    function draw() {
      const s = stateRef.current;
      ctx.fillStyle = getCanvasColors().bg;
      ctx.fillRect(0, 0, W, H);

      const half = plateHalfWorld(s.A_cm2);
      const gap = gapWorld(s.d_mm);
      const yTop = gap / 2;
      const yBot = -gap / 2;

      // Camera-space depth of plate centres — used to decide painter order.
      const topDepth = project(v3(0, yTop, 0), cam, W, H).depth;
      const botDepth = project(v3(0, yBot, 0), cam, W, H).depth;
      // Larger depth = further from camera = drawn first (back).
      const topIsBack = topDepth >= botDepth;

      // Helpers --------------------------------------------------------
      const plateCorners = (y: number): Vec3[] => [
        v3(-half, y, -half),
        v3( half, y, -half),
        v3( half, y,  half),
        v3(-half, y,  half),
      ];

      function drawPlateFill(y: number, color: string) {
        const pts = plateCorners(y).map(c => project(c, cam, W, H));
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(pts[0]!.x, pts[0]!.y);
        for (let i = 1; i < 4; i++) ctx.lineTo(pts[i]!.x, pts[i]!.y);
        ctx.closePath();
        ctx.fill();
      }

      function drawPlateOutline(y: number, color: string) {
        const pts = plateCorners(y).map(c => project(c, cam, W, H));
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(pts[0]!.x, pts[0]!.y);
        for (let i = 1; i < 4; i++) ctx.lineTo(pts[i]!.x, pts[i]!.y);
        ctx.closePath();
        ctx.stroke();
      }

      // Sparse 6×6 grid of σ-marks on a plate. `sign` decides + or −,
      // `colorRgb` is the marker fill colour, and `sigmaRel` (0..1) scales
      // the symbol size.
      function drawSigmaMarks(y: number, sign: '+' | '−', colorRgb: string, sigmaRel: number) {
        const N = 6;
        // Marks placed at cell centres of a 6×6 grid inside the plate.
        const step = (2 * half) / N;
        // Sort marks back-to-front so closer marks read on top of farther.
        const cells: { x: number; z: number; p: { x: number; y: number; depth: number } }[] = [];
        for (let i = 0; i < N; i++) {
          for (let j = 0; j < N; j++) {
            const x = -half + (i + 0.5) * step;
            const z = -half + (j + 0.5) * step;
            cells.push({ x, z, p: project(v3(x, y, z), cam, W, H) });
          }
        }
        cells.sort((a, b) => b.p.depth - a.p.depth);

        const baseSize = 8 + 9 * Math.min(1.2, sigmaRel);
        ctx.font = `bold ${baseSize.toFixed(0)}px "JetBrains Mono", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        for (const c of cells) {
          if (c.p.depth <= 0) continue;
          // Subtle "stamp" disc behind the symbol for readability.
          ctx.fillStyle = `rgba(${colorRgb},0.18)`;
          ctx.beginPath();
          ctx.arc(c.p.x, c.p.y, baseSize * 0.7, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = `rgba(${colorRgb},0.95)`;
          ctx.fillText(sign, c.p.x, c.p.y + 1);
        }
      }

      // ─── 1. Back plate (fill + outline + σ-marks) ───────────────────
      if (topIsBack) {
        drawPlateFill(yTop, 'rgba(255,59,110,0.10)');
        drawPlateOutline(yTop, 'rgba(255,59,110,0.55)');
      } else {
        drawPlateFill(yBot, 'rgba(91,174,248,0.10)');
        drawPlateOutline(yBot, 'rgba(91,174,248,0.55)');
      }

      // σ-density relative to a reference. Use sqrt to keep tiny σ visible.
      const sigmaRef = (PHYS.eps_0 * 24) / (1e-3); // E_ref = 24 V/mm = 24 000 V/m
      const sigmaRel = Math.sqrt(Math.max(0, s.computed.sigma) / sigmaRef);

      if (topIsBack) {
        drawSigmaMarks(yTop, '+', '255,59,110', sigmaRel);
      } else {
        drawSigmaMarks(yBot, '−', '91,174,248', sigmaRel);
      }

      // ─── 2. Translucent amber gap volume ───────────────────────────
      // Render the four side faces, then the two horizontal faces are
      // already represented by the plates themselves.
      const top = plateCorners(yTop).map(c => project(c, cam, W, H));
      const bot = plateCorners(yBot).map(c => project(c, cam, W, H));
      for (let i = 0; i < 4; i++) {
        const j = (i + 1) % 4;
        ctx.save();
        ctx.globalAlpha = 0.045;
        ctx.fillStyle = getCanvasColors().accent;
        ctx.beginPath();
        ctx.moveTo(top[i]!.x, top[i]!.y);
        ctx.lineTo(top[j]!.x, top[j]!.y);
        ctx.lineTo(bot[j]!.x, bot[j]!.y);
        ctx.lineTo(bot[i]!.x, bot[i]!.y);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      // Faint amber edges connecting the corners (gap volume wireframe).
      ctx.save();
      ctx.globalAlpha = 0.18;
      ctx.strokeStyle = getCanvasColors().accent;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(top[i]!.x, top[i]!.y);
        ctx.lineTo(bot[i]!.x, bot[i]!.y);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // ─── 3. E-field arrows on a 4×4 grid across the gap, from top to bot ─
      // Arrow length scales with E (== V/d). Visual cap so the slider feels
      // like it controls *intensity* without breaking layout.
      const E_ref = 24 / (1e-3); // 24 V over 1 mm
      const Erel = Math.min(1.4, Math.max(0.08, s.computed.E / E_ref));
      const arrowLen = gap * 0.7 * Math.min(1.0, Math.max(0.18, Erel));
      const headLen = 6 + 4 * Math.min(1, Erel);
      const headWid = 3 + 2 * Math.min(1, Erel);

      const NG = 4;
      const arrowStep = (2 * half) / NG;
      type ArrowRec = { from: Vec3; to: Vec3; anchor: Vec3 };
      const arrows: ArrowRec[] = [];
      for (let i = 0; i < NG; i++) {
        for (let j = 0; j < NG; j++) {
          const x = -half + (i + 0.5) * arrowStep;
          const z = -half + (j + 0.5) * arrowStep;
          const yA = yTop - (gap - arrowLen) / 2; // arrow starts a bit below the top plate
          const yB = yA - arrowLen;
          arrows.push({
            from: v3(x, yA, z),
            to:   v3(x, yB, z),
            anchor: v3(x, (yA + yB) / 2, z),
          });
        }
      }
      // Painter-sort the arrows back-to-front.
      const arrowIdx = arrows.map((a, k) => ({ k, d: project(a.anchor, cam, W, H).depth }));
      arrowIdx.sort((a, b) => b.d - a.d);

      for (const it of arrowIdx) {
        const a = arrows[it.k]!;
        const p1 = project(a.from, cam, W, H);
        const p2 = project(a.to, cam, W, H);
        if (p1.depth <= 0 || p2.depth <= 0) continue;
        const dMid = (p1.depth + p2.depth) / 2;
        const tDepth = Math.max(0, Math.min(1, (cam.distance + 1.5 - dMid) / 3.5));
        const fade = 0.32 + 0.55 * tDepth;
        const baseColor = `rgba(255,107,42,${(0.92 * fade).toFixed(3)})`;

        // Body.
        ctx.strokeStyle = baseColor;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        // Screen-space arrowhead.
        const dx = p2.x - p1.x, dy = p2.y - p1.y;
        const len = Math.hypot(dx, dy);
        if (len < 3) continue;
        const ux = dx / len, uy = dy / len;
        const nx = -uy, ny = ux;
        ctx.fillStyle = baseColor;
        ctx.beginPath();
        ctx.moveTo(p2.x, p2.y);
        ctx.lineTo(p2.x - ux * headLen + nx * headWid, p2.y - uy * headLen + ny * headWid);
        ctx.lineTo(p2.x - ux * headLen - nx * headWid, p2.y - uy * headLen - ny * headWid);
        ctx.closePath();
        ctx.fill();
      }

      // ─── 4. Front plate (fill + outline + σ-marks) ──────────────────
      if (topIsBack) {
        drawPlateFill(yBot, 'rgba(91,174,248,0.10)');
        drawPlateOutline(yBot, 'rgba(91,174,248,0.65)');
        drawSigmaMarks(yBot, '−', '91,174,248', sigmaRel);
      } else {
        drawPlateFill(yTop, 'rgba(255,59,110,0.10)');
        drawPlateOutline(yTop, 'rgba(255,59,110,0.65)');
        drawSigmaMarks(yTop, '+', '255,59,110', sigmaRel);
      }

      // ─── 5. Gauss pillbox (on top of everything) ────────────────────
      if (s.showGauss) {
        // Small cylindrical pillbox piercing the top plate at (x0, yTop, z0).
        // Top cap at y = yTop + capH (just above plate), bottom cap at
        // y = yTop - capH (in the gap, just below plate).
        const pbR = Math.min(0.32, half * 0.28);
        const capH = Math.min(0.18, gap * 0.30);
        const x0 = -half * 0.45;
        const z0 = -half * 0.30;
        const yU = yTop + capH;
        const yL = yTop - capH;

        // Rim points.
        const RIM_N = 28;
        const rim = (y: number) => {
          const arr: Vec3[] = [];
          for (let i = 0; i < RIM_N; i++) {
            const phi = (i / RIM_N) * Math.PI * 2;
            arr.push(v3(x0 + pbR * Math.cos(phi), y, z0 + pbR * Math.sin(phi)));
          }
          return arr;
        };
        const rimU = rim(yU).map(p => project(p, cam, W, H));
        const rimL = rim(yL).map(p => project(p, cam, W, H));

        // Translucent side fill (quad strip).
        ctx.save();
        ctx.globalAlpha = 0.10;
        ctx.fillStyle = getCanvasColors().teal;
        for (let i = 0; i < RIM_N; i++) {
          const j = (i + 1) % RIM_N;
          ctx.beginPath();
          ctx.moveTo(rimU[i]!.x, rimU[i]!.y);
          ctx.lineTo(rimU[j]!.x, rimU[j]!.y);
          ctx.lineTo(rimL[j]!.x, rimL[j]!.y);
          ctx.lineTo(rimL[i]!.x, rimL[i]!.y);
          ctx.closePath();
          ctx.fill();
        }

        // Glow-outline the two rims and a couple of side generators.
        drawGlowPath(ctx, [...rimU, rimU[0]!], {
          color: 'rgba(108,197,194,0.95)',
          lineWidth: 1.4,
          glowColor: 'rgba(108,197,194,0.30)',
          glowWidth: 5,
        });
        drawGlowPath(ctx, [...rimL, rimL[0]!], {
          color: 'rgba(108,197,194,0.95)',
          lineWidth: 1.4,
          glowColor: 'rgba(108,197,194,0.30)',
          glowWidth: 5,
        });
        // Two generator lines (front & back) for shape readability.
        for (const k of [0, Math.floor(RIM_N / 2)]) {
          drawGlowPath(ctx, [rimU[k]!, rimL[k]!], {
            color: 'rgba(108,197,194,0.85)',
            lineWidth: 1.2,
            glowColor: 'rgba(108,197,194,0.20)',
            glowWidth: 4,
          });
        }

        // Label badge.
        const anchor = project(v3(x0, yU + 0.15, z0), cam, W, H);
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';
        const labelLines = [
          '∮ D · dA = σ A',
          `σ A = ${formatCoulombs(s.computed.sigmaA)}`,
          `Q_enc = ${formatCoulombs(s.computed.Q)}`,
        ];
        const pad = 6;
        const lineH = 14;
        // Measure the widest line for box width.
        let maxW = 0;
        for (const ln of labelLines) {
          const m = ctx.measureText(ln).width;
          if (m > maxW) maxW = m;
        }
        const boxW = maxW + pad * 2;
        const boxH = labelLines.length * lineH + pad * 2;
        const boxX = Math.min(W - boxW - 8, Math.max(8, anchor.x + 18));
        const boxY = Math.min(H - boxH - 8, Math.max(8, anchor.y - boxH - 10));
        // Connector from anchor to box.
        ctx.restore();
        ctx.strokeStyle = getCanvasColors().teal;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(anchor.x, anchor.y);
        ctx.lineTo(boxX + 6, boxY + boxH);
        ctx.stroke();
        // Box.
        ctx.save();
        ctx.globalAlpha = 0.92;
        ctx.fillStyle = getCanvasColors().canvasBg;
        ctx.restore();
        ctx.strokeStyle = getCanvasColors().teal;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.rect(boxX, boxY, boxW, boxH);
        ctx.fill();
        ctx.stroke();
        // Lines.
        ctx.fillStyle = getCanvasColors().teal;
        ctx.textBaseline = 'top';
        for (let i = 0; i < labelLines.length; i++) {
          ctx.fillText(labelLines[i]!, boxX + pad, boxY + pad + i * lineH);
        }
      }

      // ─── 6. HUD ────────────────────────────────────────────────────
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.restore();
      ctx.fillStyle = getCanvasColors().textDim;
      ctx.fillText('drag to orbit', 12, 12);
      ctx.fillStyle = getCanvasColors().pink;
      ctx.fillText('+ plate', 12, H - 42);
      ctx.fillStyle = getCanvasColors().blue;
      ctx.fillText('− plate', 12, H - 28);
      ctx.fillStyle = getCanvasColors().accent;
      ctx.fillText('E-field in the gap', 12, H - 14);

      raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); dispose(); };
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 5.4'}
      title="A parallel-plate capacitor, in 3D"
      question="What does the field in the gap actually look like — and why is ∮D·dA on a pillbox piercing the plate exactly Q_enclosed?"
      caption={
        <>
          Two square conducting plates separated by a thin vacuum gap. Push charge Q onto the top
          plate and an equal-and-opposite −Q migrates to the facing surface of the bottom plate.
          The gap fills with a uniform field <strong>E = σ/ε₀ = V/d</strong> pointing from positive
          to negative. Toggle the Gauss pillbox to see why the surface integral
          <strong> ∮ D · dA</strong> over any closed surface piercing one plate equals the charge it
          encloses — the operational statement of Gauss's law that underwrites
          <strong> C = ε₀ A / d</strong>.
        </>
      }
    >
      <AutoResizeCanvas height={380} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="plate area A"
          value={A_cm2} min={10} max={500} step={5}
          format={v => v.toFixed(0) + ' cm²'}
          onChange={setA}
        />
        <MiniSlider
          label="gap d"
          value={d_mm} min={1} max={10} step={0.1}
          format={v => v.toFixed(1) + ' mm'}
          onChange={setD}
        />
        <MiniSlider
          label="voltage V"
          value={V} min={1} max={24} step={0.5}
          format={v => v.toFixed(1) + ' V'}
          onChange={setV}
        />
        <MiniToggle
          label={showGauss ? 'Gauss pillbox SHOWN' : 'Gauss pillbox hidden'}
          checked={showGauss} onChange={setShowGauss}
        />
        <MiniReadout
          label="C = ε₀ A / d"
          value={<Num value={computed.C * 1e12} />}
          unit="pF"
        />
        <MiniReadout
          label="Q = C V"
          value={<Num value={computed.Q * 1e9} />}
          unit="nC"
        />
        <MiniReadout
          label="U = ½ C V²"
          value={<Num value={computed.U * 1e9} />}
          unit="nJ"
        />
        <MiniReadout
          label="E = V / d"
          value={<Num value={computed.E} />}
          unit="V/m"
        />
      </DemoControls>
    </Demo>
  );
}

/**
 * Format a (small) charge in coulombs with the most natural SI prefix
 * (nC or pC). Used only inside the Gauss-pillbox label, where Q ranges
 * from ~10⁻¹³ to ~10⁻⁸ C across the slider domain.
 */
function formatCoulombs(C: number): string {
  const a = Math.abs(C);
  if (a === 0) return '0 C';
  if (a >= 1e-9) return `${(C * 1e9).toFixed(2)} nC`;
  if (a >= 1e-12) return `${(C * 1e12).toFixed(2)} pC`;
  return `${C.toExponential(2)} C`;
}
