/**
 * Demo D9.x — Wire-to-antenna transition (3D)
 *
 * A centre-fed straight conductor of fixed physical length L = 1 m driven
 * sinusoidally at variable frequency f. As f rises, the wavelength λ = c/f
 * shrinks past L through a sequence of regimes:
 *
 *   λ ≫ L           lumped — the wire is a single node, no radiation.
 *   L < λ/2         short dipole — weak radiation, near-field dominated.
 *   L = λ/2         half-wave dipole — donut-shaped far-field pattern.
 *   L = λ           full-wave — pattern splits, narrower main lobe.
 *   L > λ           multi-lobe — current reverses along the wire.
 *
 * The visualization is a 3D wireframe radiation-pattern surface enclosing a
 * thin vertical wire. Drag to orbit. The pattern factor used is the canonical
 * centre-fed linear antenna form
 *
 *     F(θ) = | cos(kL cosθ / 2) − cos(kL/2) | / sinθ
 *
 * normalised so the maximum lobe equals 1. The current envelope along the
 * wire follows I(z) ∝ sin(k(L/2 − |z|)); the reader can toggle small in-wire
 * arrows showing direction and amplitude at each height.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider, MiniToggle } from '@/components/Demo';
import { drawGlowPath } from '@/lib/canvasPrimitives';
import { PHYS } from '@/lib/physics';
import {
  attachOrbit,
  project,
  type OrbitCamera,
  type Vec3,
} from '@/lib/projection3d';

interface Props { figure?: string }

const L_METERS = 1.0;            // fixed physical wire length, metres
const NLAT = 18;
const NLON = 24;

/**
 * Far-field amplitude pattern for a centre-fed linear antenna of length L
 * carrying a sinusoidal standing-wave current at frequency f.
 *
 *   F(θ) = ( cos(kL cosθ / 2) − cos(kL/2) ) / sinθ
 *
 * Returns |F|. The caller is responsible for normalising to the peak.
 */
function patternFactor(theta: number, kL: number): number {
  const s = Math.sin(theta);
  if (Math.abs(s) < 1e-6) return 0;
  const num = Math.cos((kL * Math.cos(theta)) / 2) - Math.cos(kL / 2);
  return Math.abs(num / s);
}

/**
 * Find the peak of |F(θ)| over θ ∈ (0, π) by dense sampling. Used to
 * normalise the wireframe so its largest lobe always reaches r ≈ 1.
 */
function patternPeak(kL: number): number {
  let m = 0;
  const N = 360;
  for (let i = 1; i < N; i++) {
    const th = (i / N) * Math.PI;
    const v = patternFactor(th, kL);
    if (v > m) m = v;
  }
  return m > 0 ? m : 1;
}

/** Pre-build vertex grid for the radiation surface. */
function buildSurface(kL: number, peak: number): Vec3[][] {
  const grid: Vec3[][] = [];
  for (let i = 0; i <= NLAT; i++) {
    const theta = (i / NLAT) * Math.PI;
    const r = patternFactor(theta, kL) / peak;
    const row: Vec3[] = [];
    const sT = Math.sin(theta);
    const cT = Math.cos(theta);
    for (let j = 0; j <= NLON; j++) {
      const phi = (j / NLON) * 2 * Math.PI;
      row.push({
        x: r * sT * Math.cos(phi),
        y: r * cT,
        z: r * sT * Math.sin(phi),
      });
    }
    grid.push(row);
  }
  return grid;
}

/** Current along the wire: standing wave with zero at the tips. */
function currentAt(z: number, kL: number): number {
  // z normalised so wire runs −L/2 … +L/2 in metres; convert via L_METERS.
  const argument = (kL / 2) * (1 - (2 * Math.abs(z)) / L_METERS);
  return Math.sin(argument);
}

function classifyRegime(LoverLambda: number): string {
  if (LoverLambda < 0.1) return 'Lumped (L ≪ λ)';
  if (LoverLambda < 0.45) return 'Short dipole (L < λ/2)';
  if (LoverLambda <= 0.6) return 'Half-wave dipole (L ≈ λ/2)';
  if (LoverLambda < 0.9) return 'Between resonances';
  if (LoverLambda <= 1.1) return 'Full-wave dipole (L ≈ λ)';
  return 'Multi-lobe (L > λ)';
}

function formatHz(f: number): string {
  if (f >= 1e9) return (f / 1e9).toFixed(2) + ' GHz';
  if (f >= 1e6) return (f / 1e6).toFixed(1) + ' MHz';
  if (f >= 1e3) return (f / 1e3).toFixed(2) + ' kHz';
  return f.toFixed(1) + ' Hz';
}

export function WireToAntennaTransition3DDemo({ figure }: Props) {
  // Frequency in Hz; default at the half-wave resonance, f = c/(2L) = 150 MHz.
  const [fMHz, setFMHz] = useState(150);
  const [showMesh, setShowMesh] = useState(true);
  const [showCurrent, setShowCurrent] = useState(true);

  const f = fMHz * 1e6;
  const lambda = PHYS.c / f;
  const LoverLambda = L_METERS / lambda;
  const regime = useMemo(() => classifyRegime(LoverLambda), [LoverLambda]);

  const stateRef = useRef({ fMHz, showMesh, showCurrent });
  useEffect(() => {
    stateRef.current = { fMHz, showMesh, showCurrent };
  }, [fMHz, showMesh, showCurrent]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w: W, h: H, canvas } = info;
    let raf = 0;

    const cam: OrbitCamera = {
      yaw: 0.6,
      pitch: 0.28,
      distance: 4.0,
      fov: Math.PI / 4,
    };
    const disposeOrbit = attachOrbit(canvas, cam);

    // Surface cache; rebuild whenever kL changes.
    let cachedKL = NaN;
    let cachedPeak = 1;
    let surface: Vec3[][] = [];

    function ensureSurface(kL: number) {
      if (kL === cachedKL) return;
      cachedPeak = patternPeak(kL);
      surface = buildSurface(kL, cachedPeak);
      cachedKL = kL;
    }

    function depthAlpha(avgDepth: number, base: number): number {
      const t = (cam.distance + 1.2 - avgDepth) / 2.4;
      const k = Math.max(0.08, Math.min(1, t));
      return base * k;
    }

    function draw(now: number) {
      const s = stateRef.current;
      const fHz = s.fMHz * 1e6;
      const lam = PHYS.c / fHz;
      const kL = (2 * Math.PI * L_METERS) / lam;
      ensureSurface(kL);

      // Background.
      ctx.fillStyle = '#0d0d10';
      ctx.fillRect(0, 0, W, H);

      // Faint equatorial reference circle (radius 1 in xz).
      const NEQ = 64;
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i <= NEQ; i++) {
        const ph = (i / NEQ) * 2 * Math.PI;
        const p = project({ x: Math.cos(ph), y: 0, z: Math.sin(ph) }, cam, W, H);
        if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();

      // Project all surface vertices.
      const projected: Array<Array<{ x: number; y: number; depth: number }>> = [];
      for (let i = 0; i <= NLAT; i++) {
        const row: Array<{ x: number; y: number; depth: number }> = [];
        for (let j = 0; j <= NLON; j++) {
          row.push(project(surface[i]![j]!, cam, W, H));
        }
        projected.push(row);
      }

      // Radiation pattern wireframe (back-to-front so front lobes paint over).
      if (s.showMesh) {
        interface Seg { x1: number; y1: number; x2: number; y2: number; depth: number; kind: 'lat' | 'lon' }
        const segs: Seg[] = [];
        for (let i = 0; i <= NLAT; i++) {
          for (let j = 0; j < NLON; j++) {
            const a = projected[i]![j]!;
            const b = projected[i]![j + 1]!;
            segs.push({
              x1: a.x, y1: a.y, x2: b.x, y2: b.y,
              depth: (a.depth + b.depth) / 2, kind: 'lat',
            });
          }
        }
        for (let j = 0; j <= NLON; j++) {
          for (let i = 0; i < NLAT; i++) {
            const a = projected[i]![j]!;
            const b = projected[i + 1]![j]!;
            segs.push({
              x1: a.x, y1: a.y, x2: b.x, y2: b.y,
              depth: (a.depth + b.depth) / 2, kind: 'lon',
            });
          }
        }
        segs.sort((a, b) => b.depth - a.depth);
        for (const seg of segs) {
          const baseAlpha = seg.kind === 'lat' ? 0.55 : 0.40;
          const baseColor = seg.kind === 'lat'
            ? 'rgba(108,197,194,'
            : 'rgba(255,107,42,';
          const a = depthAlpha(seg.depth, baseAlpha);
          ctx.strokeStyle = baseColor + a.toFixed(3) + ')';
          ctx.lineWidth = 1.0;
          ctx.beginPath();
          ctx.moveTo(seg.x1, seg.y1);
          ctx.lineTo(seg.x2, seg.y2);
          ctx.stroke();
        }
      }

      // The wire. Vertical along ±y; map physical L_METERS to ±0.55 world.
      const yScale = 0.55 / (L_METERS / 2);
      const yTop = (L_METERS / 2) * yScale;
      const yBot = -(L_METERS / 2) * yScale;
      const pTop = project({ x: 0, y: yTop, z: 0 }, cam, W, H);
      const pBot = project({ x: 0, y: yBot, z: 0 }, cam, W, H);
      drawGlowPath(ctx,
        [{ x: pTop.x, y: pTop.y }, { x: pBot.x, y: pBot.y }],
        {
          color: 'rgba(236,235,229,0.95)',
          lineWidth: 2.0,
          glowColor: 'rgba(236,235,229,0.18)',
          glowWidth: 8,
        });
      // Feedpoint marker.
      const pCen = project({ x: 0, y: 0, z: 0 }, cam, W, H);
      ctx.fillStyle = 'rgba(255,107,42,0.95)';
      ctx.beginPath();
      ctx.arc(pCen.x, pCen.y, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Current-distribution arrows along the wire. Sinusoidal time-phase so
      // the standing wave breathes — purely visual; readouts stay static.
      if (s.showCurrent) {
        const NARR = 11;
        const phase = Math.sin((now / 1000) * 2 * Math.PI * 1.2);
        for (let i = 0; i < NARR; i++) {
          // z in metres, evenly spaced along the wire.
          const z = (-L_METERS / 2) + (L_METERS * i) / (NARR - 1);
          const Iraw = currentAt(z, kL) * phase;
          if (Math.abs(Iraw) < 0.03) continue;
          // Arrow length (in world units, x direction). Scaled for visibility.
          const len = Iraw * 0.42;
          const yW = z * yScale;
          const tail = project({ x: 0, y: yW, z: 0 }, cam, W, H);
          const tip = project({ x: len, y: yW, z: 0 }, cam, W, H);
          const dx = tip.x - tail.x;
          const dy = tip.y - tail.y;
          const Llen = Math.hypot(dx, dy);
          if (Llen < 1) continue;
          const ux = dx / Llen, uy = dy / Llen;
          const nx = -uy, ny = ux;

          // Colour: pink for +I, blue for −I (matching charge-polarity palette).
          const col = Iraw >= 0
            ? 'rgba(255,59,110,0.85)'
            : 'rgba(91,174,248,0.85)';
          ctx.strokeStyle = col;
          ctx.fillStyle = col;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(tail.x, tail.y);
          ctx.lineTo(tip.x, tip.y);
          ctx.stroke();
          const head = 5;
          const wing = 3;
          ctx.beginPath();
          ctx.moveTo(tip.x, tip.y);
          ctx.lineTo(tip.x - ux * head + nx * wing, tip.y - uy * head + ny * wing);
          ctx.lineTo(tip.x - ux * head - nx * wing, tip.y - uy * head - ny * wing);
          ctx.closePath();
          ctx.fill();
        }
      }

      // Wire-tip labels.
      ctx.fillStyle = 'rgba(160,158,149,0.85)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText('+L/2', pTop.x, pTop.y - 6);
      ctx.textBaseline = 'top';
      ctx.fillText('−L/2', pBot.x, pBot.y + 6);

      // Top-left readout overlay.
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillStyle = '#ff6b2a';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillText(`f = ${formatHz(fHz)}`, 14, 14);
      ctx.fillStyle = 'rgba(108,197,194,0.95)';
      ctx.fillText(`λ = ${lam >= 1 ? lam.toFixed(2) + ' m' : (lam * 100).toFixed(1) + ' cm'}`, 14, 30);
      ctx.fillStyle = 'rgba(236,235,229,0.78)';
      ctx.fillText(`L/λ = ${(L_METERS / lam).toFixed(3)}`, 14, 46);
      ctx.fillStyle = 'rgba(160,158,149,0.65)';
      ctx.fillText('drag to orbit', 14, H - 18);

      // Bottom scale bar — L vs λ on a common axis. Highlight when L = λ/2.
      const barY = H - 28;
      const barX0 = W - 200;
      const barX1 = W - 20;
      const barW = barX1 - barX0;
      // Map: pixel-per-metre chosen so 2 m = full bar.
      const ppm = barW / 2;
      // The wire's footprint is fixed at L_METERS along this bar.
      const wirePix = L_METERS * ppm;
      const lamPix = Math.min(barW, lam * ppm);

      // Wire bar (always white, fixed length).
      ctx.strokeStyle = 'rgba(236,235,229,0.85)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(barX0, barY);
      ctx.lineTo(barX0 + wirePix, barY);
      ctx.stroke();
      ctx.fillStyle = 'rgba(236,235,229,0.85)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText('L = 1 m', barX0, barY - 4);

      // λ bar (teal; highlights amber near half-wave).
      const halfWave = LoverLambda > 0.45 && LoverLambda < 0.6;
      const lamCol = halfWave ? 'rgba(255,107,42,0.95)' : 'rgba(108,197,194,0.85)';
      ctx.strokeStyle = lamCol;
      ctx.lineWidth = halfWave ? 3 : 2;
      ctx.beginPath();
      ctx.moveTo(barX0, barY + 10);
      ctx.lineTo(barX0 + lamPix, barY + 10);
      ctx.stroke();
      // Tick at λ/2 to make the resonance visually obvious.
      const halfLamPix = Math.min(barW, (lam / 2) * ppm);
      ctx.strokeStyle = lamCol;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(barX0 + halfLamPix, barY + 6);
      ctx.lineTo(barX0 + halfLamPix, barY + 14);
      ctx.stroke();
      ctx.fillStyle = lamCol;
      ctx.textBaseline = 'top';
      ctx.fillText(lam > 2 ? `λ = ${lam.toFixed(2)} m (off-scale)` : `λ = ${lam.toFixed(2)} m`, barX0, barY + 14);
      if (halfWave) {
        ctx.textAlign = 'right';
        ctx.fillStyle = 'rgba(255,107,42,0.95)';
        ctx.fillText('half-wave resonance', barX1, barY - 18);
      }

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      disposeOrbit();
    };
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 9.x'}
      title="From wire to antenna — a continuous spectrum"
      question="The same metre of wire. Where does the radiation pattern come from?"
      caption={<>
        A vertical wire of fixed length <strong>L = 1 m</strong>, fed at the centre by a sinusoidal
        source. Sweep the frequency. At low <em>f</em> the wavelength dwarfs the wire and nothing
        radiates — the wire is a single lumped node. As <em>f</em> climbs, λ shrinks toward
        <strong> 2L</strong>; at λ = 2L (around 150 MHz here) the wire becomes a half-wave dipole
        and a clean toroidal far-field appears. Push further and the pattern splits — full-wave at
        λ = L, then multi-lobe beyond. The antenna and the circuit element are the same object at
        different L/λ. Drag to orbit.
      </>}
    >
      <AutoResizeCanvas height={360} setup={setup} ariaLabel="3D wire-to-antenna transition" />
      <DemoControls>
        <MiniSlider
          label="frequency f"
          value={fMHz}
          min={10}
          max={600}
          step={1}
          format={v => v < 1000 ? v.toFixed(0) + ' MHz' : (v / 1000).toFixed(2) + ' GHz'}
          onChange={setFMHz}
        />
        <MiniToggle label="current arrows" checked={showCurrent} onChange={setShowCurrent} />
        <MiniToggle label="pattern wireframe" checked={showMesh} onChange={setShowMesh} />
        <MiniReadout label="λ" value={lambda >= 1 ? lambda.toFixed(2) : (lambda * 100).toFixed(1)} unit={lambda >= 1 ? 'm' : 'cm'} />
        <MiniReadout label="L/λ" value={LoverLambda.toFixed(3)} />
        <MiniReadout label="regime" value={regime} />
      </DemoControls>
    </Demo>
  );
}
