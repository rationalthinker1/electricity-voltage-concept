/**
 * Demo D14.2 — Dispersion through a prism
 *
 * White light enters a triangular glass prism from the left. Each visible
 * wavelength has a slightly different refractive index n(λ) ≈ A + B/λ²
 * (Cauchy's formula), so each colour bends by a slightly different
 * amount on entry and exit. Result: a rainbow fans out the far side.
 *
 * Sliders for the Cauchy coefficients A and B let the reader see what
 * "more dispersive glass" looks like (flint vs crown).
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { getCanvasColors } from '@/lib/canvasTheme';

interface Props {
  figure?: string;
}

// Visible-light reference wavelengths in nm
const COLOURS: Array<{ lam: number; rgb: string }> = [
  { lam: 700, rgb: '#ff3030' }, // red
  { lam: 620, rgb: '#ff7a18' }, // orange
  { lam: 580, rgb: '#ffd040' }, // yellow
  { lam: 540, rgb: '#7fe07f' }, // green
  { lam: 470, rgb: '#5baef8' }, // blue
  { lam: 420, rgb: '#a060ff' }, // violet
];

export function DispersionDemo({ figure }: Props) {
  // Cauchy: n(λ) = A + B/λ²  (λ in µm). Crown glass A≈1.5046 B≈0.00420.
  const [A, setA] = useState(1.5);
  const [B, setB] = useState(0.0042);

  const stateRef = useRef({ A, B });
  useEffect(() => {
    stateRef.current = { A, B };
  }, [A, B]);

  // For readout: spread of n across visible
  const nRed = A + B / Math.pow(0.7, 2);
  const nViolet = A + B / Math.pow(0.42, 2);

  const setup = useCallback((info: CanvasInfo) => {
    const colors = getCanvasColors();
    const { ctx, w: W, h: H } = info;
    let raf = 0;
    function draw() {
      const { A, B } = stateRef.current;
      ctx.fillStyle = getCanvasColors().bg;
      ctx.fillRect(0, 0, W, H);

      // ── Prism geometry: equilateral triangle, apex up
      const cx = W * 0.42;
      const cy = H / 2 + 30;
      const side = Math.min(W * 0.34, H * 0.85);
      const halfBase = side / 2;
      const apexY = cy - (side * Math.sqrt(3)) / 2;
      const apex = { x: cx, y: apexY };
      const leftBase = { x: cx - halfBase, y: cy };
      const rightBase = { x: cx + halfBase, y: cy };

      // Glass body (subtle fill)
      ctx.save();
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = colors.teal;
      ctx.beginPath();
      ctx.moveTo(apex.x, apex.y);
      ctx.lineTo(leftBase.x, leftBase.y);
      ctx.lineTo(rightBase.x, rightBase.y);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = 0.4;
      ctx.strokeStyle = colors.text;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Left-face normal (perp. to left edge, pointing OUT of prism)
      // Left edge: apex → leftBase. Outward normal points up-and-left.
      const lex = leftBase.x - apex.x;
      const ley = leftBase.y - apex.y;
      const lel = Math.sqrt(lex * lex + ley * ley);
      const ltx = lex / lel;
      const lty = ley / lel; // tangent along left edge
      const lnx = -lty;
      const lny = ltx; // outward normal (rotate +90°)

      // Right-face: apex → rightBase. Outward normal points up-and-right.
      const rex = rightBase.x - apex.x;
      const rey = rightBase.y - apex.y;
      const rel = Math.sqrt(rex * rex + rey * rey);
      const rtx = rex / rel;
      const rty = rey / rel;
      const rnx = rty;
      const rny = -rtx;

      // Incoming white ray: horizontal, heading right. Entry point on left face
      // halfway down the edge.
      const entry = {
        x: (apex.x + leftBase.x) / 2,
        y: (apex.y + leftBase.y) / 2,
      };
      const incomingDir = { x: 1, y: 0 };

      // Angle of incidence at left face (between incoming and inward normal)
      // Inward normal at left face = (-lnx, -lny)
      const inLnx = -lnx;
      const inLny = -lny;
      // Cos of incidence angle: dot product of -incoming with inward normal
      const cos1L = -(incomingDir.x * inLnx + incomingDir.y * inLny);
      const sin1L = Math.sqrt(Math.max(0, 1 - cos1L * cos1L));

      // Draw the incoming white ray
      drawSegment(ctx, 0, entry.y, entry.x, entry.y, 'rgba(255,255,255,0.9)', 2);

      // For each colour: Snell at left face → traverse prism → Snell at right face → fan out.
      for (const c of COLOURS) {
        const lam_um = c.lam / 1000;
        const n = A + B / (lam_um * lam_um);
        // n_air sin θ1 = n sin θ2  →  sin θ2 = sin θ1 / n
        const sin2L = sin1L / n;
        const cos2L = Math.sqrt(Math.max(0, 1 - sin2L * sin2L));
        // Refracted direction inside the glass: bend incoming toward inward normal
        // Build orthonormal frame at the surface: inward normal (inLnx,inLny) and
        // a tangent perp to the normal in the plane (lty, -ltx) chosen so that
        // the tangential component of the incoming ray is along it.
        const tx = lty;
        const ty = -ltx; // some unit tangent
        // Tangential component of incoming
        const inTan = incomingDir.x * tx + incomingDir.y * ty;
        const sgn = Math.sign(inTan) || 1;
        const innerDir = {
          x: sgn * sin2L * tx + cos2L * inLnx,
          y: sgn * sin2L * ty + cos2L * inLny,
        };

        // Find exit point on right face: param along (rightBase - apex), entry parameterised
        // along the inner ray from entry point.
        const exit = lineSegmentIntersect(entry, innerDir, apex, rightBase);
        if (!exit) continue;

        // Draw the inside-prism segment, faintly
        drawSegment(ctx, entry.x, entry.y, exit.x, exit.y, fadedRgba(c.rgb, 0.55), 1.5);

        // Snell at the right face: cos of internal incidence
        // cos of angle between innerDir and outward normal (rnx, rny)
        const cosInt = innerDir.x * rnx + innerDir.y * rny;
        const sinInt = Math.sqrt(Math.max(0, 1 - cosInt * cosInt));
        // Exit Snell: n sin = 1 sin_out
        const sinOut = n * sinInt;
        if (sinOut > 1) continue; // TIR — skip this colour
        const cosOut = Math.sqrt(Math.max(0, 1 - sinOut * sinOut));
        // Tangent at right face perp to (rnx,rny); preserve sign of tangential
        const tx2 = -rny;
        const ty2 = rnx;
        const inTan2 = innerDir.x * tx2 + innerDir.y * ty2;
        const sgn2 = Math.sign(inTan2) || 1;
        const outDir = {
          x: sgn2 * sinOut * tx2 + cosOut * rnx,
          y: sgn2 * sinOut * ty2 + cosOut * rny,
        };
        // Trace out to right edge of canvas
        const tMax = (W - 6 - exit.x) / Math.max(1e-6, outDir.x);
        const endX = exit.x + outDir.x * tMax;
        const endY = exit.y + outDir.y * tMax;
        drawSegment(ctx, exit.x, exit.y, endX, endY, c.rgb, 1.8);
      }

      // Label
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.restore();
      ctx.fillStyle = getCanvasColors().textDim;
      ctx.textAlign = 'left';
      ctx.fillText(`n(λ) = A + B/λ²`, 12, 18);
      ctx.fillText(`A = ${A.toFixed(2)}, B = ${B.toFixed(4)} µm²`, 12, 32);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 14.2'}
      title="A prism splits white light"
      question="Why does each colour bend by a different amount?"
      caption={
        <>
          Cauchy's empirical fit <strong>n(λ) ≈ A + B/λ²</strong> lets <em>n</em> grow as λ shrinks.
          Violet (420 nm) sees a higher refractive index than red (700 nm), so it bends more at each
          face of the prism. Two refractions later, the white beam has fanned into a spectrum. Crown
          glass: <strong>A ≈ 1.50, B ≈ 0.004 µm²</strong>.
        </>
      }
    >
      <AutoResizeCanvas height={320} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="A"
          value={A}
          min={1.4}
          max={1.8}
          step={0.005}
          format={(v) => v.toFixed(3)}
          onChange={setA}
        />
        <MiniSlider
          label="B"
          value={B}
          min={0.001}
          max={0.03}
          step={0.0005}
          format={(v) => v.toFixed(4)}
          onChange={setB}
        />
        <MiniReadout label="n(red)" value={nRed.toFixed(4)} />
        <MiniReadout label="n(violet)" value={nViolet.toFixed(4)} />
      </DemoControls>
    </Demo>
  );
}

function drawSegment(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  width: number,
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function fadedRgba(hex: string, alpha: number): string {
  // Quick hex → rgba conversion
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// Intersect ray (p, dir) with the segment from a→b. Returns the intersection point or null.
function lineSegmentIntersect(
  p: { x: number; y: number },
  dir: { x: number; y: number },
  a: { x: number; y: number },
  b: { x: number; y: number },
): { x: number; y: number } | null {
  const sx = b.x - a.x;
  const sy = b.y - a.y;
  const denom = dir.x * -sy + dir.y * sx; // = dir × s (2D cross)
  if (Math.abs(denom) < 1e-9) return null;
  const t = ((a.x - p.x) * -sy + (a.y - p.y) * sx) / denom;
  const u = ((a.x - p.x) * dir.y - (a.y - p.y) * dir.x) / denom;
  if (t < 0 || u < 0 || u > 1) return null;
  return { x: p.x + t * dir.x, y: p.y + t * dir.y };
}
