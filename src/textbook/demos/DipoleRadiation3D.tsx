/**
 * Demo D15.1b — Dipole radiation pattern in 3D
 *
 * A perspective rendering of the half-wave (or short-electric) dipole's
 * far-field intensity pattern as a 3D surface. For each direction (θ, φ)
 * on a sphere, plot a point at radius r(θ) = sin^n(θ) — the canonical
 * fat-donut "toroidal" pattern, with the dipole wire threaded vertically
 * through the hole.
 *
 * The reader drags to orbit the camera. A pattern-exponent slider lets
 * them sweep from n=1 (the field amplitude pattern) through n=2 (the
 * standard intensity pattern for a short dipole) up to n=4 (a much
 * sharper, end-fire-like cone narrowing the lobe).
 *
 * Renders a latitude/longitude wireframe with simple painter-style
 * depth-fading (back-half segments dimmer than front-half) so the
 * 3D shape reads cleanly even without GL.
 */
import { useMemo, useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, EquationStrip, MiniReadout, MiniSlider, MiniToggle } from '@/components/Demo';
import { InlineMath } from '@/components/Formula';
import { project, type Vec3 } from '@/lib/projection3d';
import { createOrbitScene, type OrbitScene } from '@/lib/useOrbitScene';
import { drawGlowPath } from '@/lib/canvasPrimitives';
import { withAlpha } from '@/lib/canvasTheme';
import { drawLabel } from "@/lib/canvasLayout";
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

interface Props {
  figure: string;
}

interface DipoleCtx {
  scene: OrbitScene;
  rays: Array<{ theta: number; phi: number }>;
  cachedN: number;
  surface: Vec3[][];
}

// Normalised pattern radius r(θ) = sin^n(θ).
function patternR(theta: number, n: number): number {
  const s = Math.sin(theta);
  return Math.pow(Math.max(0, s), n);
}

// Build a (NLAT+1) × (NLON+1) grid of vertices on the pattern surface.
function buildSurface(n: number, NLAT: number, NLON: number): Vec3[][] {
  const grid: Vec3[][] = [];
  for (let i = 0; i <= NLAT; i++) {
    const theta = (i / NLAT) * Math.PI;
    const r = patternR(theta, n);
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

// Half-power beamwidth for r = sin^n(θ). Peak at θ = π/2 where r = 1; the
// half-power angles satisfy sin^n(θ) = 1/2 ⇒ θ = asin(2^{-1/n}). HPBW is
// the angular width 2·(π/2 − asin(2^{-1/n})). Returns degrees.
function hpbwDeg(n: number): number {
  const sHalf = Math.pow(0.5, 1 / n);
  const thetaHalf = Math.asin(Math.min(1, Math.max(0, sHalf)));
  const hpbwRad = 2 * (Math.PI / 2 - thetaHalf);
  return (hpbwRad * 180) / Math.PI;
}

export function DipoleRadiation3DDemo({ figure }: Props) {
  const [n, setN] = useState(2);
  const [showMesh, setShowMesh] = useState(true);
  const [showRays, setShowRays] = useState(true);
  const [showE, setShowE] = useState(true);

  const beamwidth = useMemo(() => hpbwDeg(n), [n]);

  const stateRef = useSimState({ n, showMesh, showRays, showE });

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w: W, h: H, colors }, s, _dt, _simTime, ctx0: DipoleCtx) => {
      const scene = ctx0.scene;
      const cam = scene.cam;
      const NLAT = 18;
      const NLON = 24;
      const RAYS = ctx0.rays;

      // Depth-fade alpha: closer segments (smaller cam-space depth) brighter.
      function depthAlpha(avgDepth: number, base: number): number {
        const t = (cam.distance + 1.2 - avgDepth) / 2.4;
        const k = Math.max(0.08, Math.min(1, t));
        return base * k;
      }

      // Cache the surface so we only rebuild it when n changes.
      if (s.n !== ctx0.cachedN) {
        ctx0.surface = buildSurface(s.n, NLAT, NLON);
        ctx0.cachedN = s.n;
      }
      const surface = ctx0.surface;

      // Background.
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, W, H);

      // Reference: faint equatorial disc outline (a circle of radius 1 in xz).
      const NEQ = 64;
      const eq: Array<{ x: number; y: number; depth: number }> = [];
      for (let i = 0; i <= NEQ; i++) {
        const ph = (i / NEQ) * 2 * Math.PI;
        eq.push(project({ x: Math.cos(ph), y: 0, z: Math.sin(ph) }, cam, W, H));
      }
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(eq[0]!.x, eq[0]!.y);
      for (let i = 1; i < eq.length; i++) ctx.lineTo(eq[i]!.x, eq[i]!.y);
      ctx.stroke();

      // Reference: xz-plane meridian outline at φ ∈ {0, π}, used by the 2D
      // dipole demo — useful for the reader to relate the 2D slice to the 3D.
      const NMER = 96;
      ctx.strokeStyle = withAlpha(colors.teal, 0.25);
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i <= NMER; i++) {
        // Trace r(θ) in the xz-plane: x = r sinθ, y = r cosθ, z = 0.
        const phi = (i / NMER) * 2 * Math.PI;
        const theta = Math.acos(Math.cos(phi));
        const r = patternR(theta, s.n);
        const p = project(
          {
            x: r * Math.sin(theta) * Math.sin(phi), // sign of x follows sin(phi)
            y: r * Math.cos(theta),
            z: 0,
          },
          cam,
          W,
          H,
        );
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();

      // Project all surface vertices once per frame.
      const projected: Array<Array<{ x: number; y: number; depth: number }>> = [];
      for (let i = 0; i <= NLAT; i++) {
        const row: Array<{ x: number; y: number; depth: number }> = [];
        for (let j = 0; j <= NLON; j++) {
          row.push(project(surface[i]![j]!, cam, W, H));
        }
        projected.push(row);
      }

      // Build line-segment list with depth, then draw back-to-front so the
      // brighter front segments paint over the dimmer back ones.
      if (s.showMesh) {
        interface Seg {
          x1: number;
          y1: number;
          x2: number;
          y2: number;
          depth: number;
          kind: 'lat' | 'lon';
        }
        const segs: Seg[] = [];
        // Latitude rings.
        for (let i = 0; i <= NLAT; i++) {
          for (let j = 0; j < NLON; j++) {
            const a = projected[i]![j]!;
            const b = projected[i]![j + 1]!;
            segs.push({
              x1: a.x,
              y1: a.y,
              x2: b.x,
              y2: b.y,
              depth: (a.depth + b.depth) / 2,
              kind: 'lat',
            });
          }
        }
        // Longitude meridians.
        for (let j = 0; j <= NLON; j++) {
          for (let i = 0; i < NLAT; i++) {
            const a = projected[i]![j]!;
            const b = projected[i + 1]![j]!;
            segs.push({
              x1: a.x,
              y1: a.y,
              x2: b.x,
              y2: b.y,
              depth: (a.depth + b.depth) / 2,
              kind: 'lon',
            });
          }
        }
        segs.sort((a, b) => b.depth - a.depth);
        for (const seg of segs) {
          const baseAlpha = seg.kind === 'lat' ? 0.55 : 0.45;
          const baseToken = seg.kind === 'lat' ? colors.teal : colors.accent;
          const a = depthAlpha(seg.depth, baseAlpha);
          ctx.strokeStyle = withAlpha(baseToken, a);
          ctx.lineWidth = seg.kind === 'lat' ? 1.0 : 1.0;
          ctx.beginPath();
          ctx.moveTo(seg.x1, seg.y1);
          ctx.lineTo(seg.x2, seg.y2);
          ctx.stroke();
        }
      }

      // Rays from origin to the surface at picked (θ, φ).
      if (s.showRays) {
        for (const r of RAYS) {
          const len = patternR(r.theta, s.n);
          if (len < 0.02) continue;
          const tip: Vec3 = {
            x: len * Math.sin(r.theta) * Math.cos(r.phi),
            y: len * Math.cos(r.theta),
            z: len * Math.sin(r.theta) * Math.sin(r.phi),
          };
          const p0 = project({ x: 0, y: 0, z: 0 }, cam, W, H);
          const p1 = project(tip, cam, W, H);
          const avgDepth = (p0.depth + p1.depth) / 2;
          const a = depthAlpha(avgDepth, 0.9);
          ctx.strokeStyle = withAlpha(colors.accent, a);
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.stroke();
          ctx.fillStyle = withAlpha(colors.accent, a);
          ctx.beginPath();
          ctx.arc(p1.x, p1.y, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // The dipole itself — a thin vertical line segment along ±y. Render as
      // a glowing path; use λ/2 normalised to ±0.5 in surface units so the
      // wire visibly threads the donut's hole.
      const yTop = 0.55;
      const yBot = -0.55;
      const pTop = project({ x: 0, y: yTop, z: 0 }, cam, W, H);
      const pBot = project({ x: 0, y: yBot, z: 0 }, cam, W, H);
      drawGlowPath(
        ctx,
        [
          { x: pTop.x, y: pTop.y },
          { x: pBot.x, y: pBot.y },
        ],
        {
          color: withAlpha(colors.text, 0.95),
          lineWidth: 2.0,
          glowColor: withAlpha(colors.text, 0.18),
          glowWidth: 8,
        },
      );

      // Feedpoint marker — the centre of the dipole.
      const pCen = project({ x: 0, y: 0, z: 0 }, cam, W, H);
      ctx.fillStyle = colors.accent;
      ctx.beginPath();
      ctx.arc(pCen.x, pCen.y, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // E-field polarisation arrows along the antenna (small white arrows
      // pointing up and down from the feedpoint, since current along the
      // dipole produces a vertically-aligned E far-field).
      if (s.showE) {
        const arrowYs = [0.12, 0.3, -0.12, -0.3];
        for (const ay of arrowYs) {
          const dir = ay > 0 ? 1 : -1;
          const tail = project({ x: 0, y: ay - dir * 0.06, z: 0 }, cam, W, H);
          const tip = project({ x: 0, y: ay + dir * 0.06, z: 0 }, cam, W, H);
          ctx.strokeStyle = colors.pink;
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(tail.x, tail.y);
          ctx.lineTo(tip.x, tip.y);
          ctx.stroke();
          // Small arrowhead.
          const dx = tip.x - tail.x;
          const dy = tip.y - tail.y;
          const L = Math.hypot(dx, dy) || 1;
          const ux = dx / L,
            uy = dy / L;
          const nx = -uy,
            ny = ux;
          const head = 5;
          const wing = 3;
          ctx.fillStyle = colors.pink;
          ctx.beginPath();
          ctx.moveTo(tip.x, tip.y);
          ctx.lineTo(tip.x - ux * head + nx * wing, tip.y - uy * head + ny * wing);
          ctx.lineTo(tip.x - ux * head - nx * wing, tip.y - uy * head - ny * wing);
          ctx.closePath();
          ctx.fill();
        }
      }

      // Axis labels at the dipole tips.
      ctx.fillStyle = colors.textDim;
      drawLabel(ctx, { text: 'axis · θ=0', x: pTop.x, y: pTop.y - 6, font: '10px "JetBrains Mono", monospace', align: 'center', baseline: 'bottom' });
      drawLabel(ctx, { text: 'axis · θ=π', x: pBot.x, y: pBot.y + 6, font: '10px "JetBrains Mono", monospace', align: 'center', baseline: 'top' });

      // Top-left overlay.
      ctx.fillStyle = colors.accent;
      drawLabel(ctx, { text: `r(θ) = sin^${s.n.toFixed(1)} θ`, x: 14, y: 14, font: '10px "JetBrains Mono", monospace', baseline: 'top' });
      ctx.fillStyle = colors.textDim;
      drawLabel(ctx, { text: 'drag to orbit', x: 14, y: 30, font: '10px "JetBrains Mono", monospace', baseline: 'top' });
    },
    [],
    ({ canvas }) => {
      const scene = createOrbitScene(canvas, {
        yaw: 0.6,
        pitch: 0.32,
        distance: 4.2,
      });
      const RAYS: Array<{ theta: number; phi: number }> = [];
      const RAY_THETAS = [
        Math.PI * 0.18,
        Math.PI * 0.3,
        Math.PI * 0.5,
        Math.PI * 0.7,
        Math.PI * 0.82,
      ];
      const RAY_PHIS = [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5];
      for (const th of RAY_THETAS) for (const ph of RAY_PHIS) RAYS.push({ theta: th, phi: ph });

      const ctx0: DipoleCtx = {
        scene,
        rays: RAYS,
        cachedN: -1,
        surface: [],
      };
      return { context: ctx0, cleanup: () => scene.dispose() };
    },
  );

  return (
    <Demo
      figure={figure}
      title="The dipole pattern, in 3D — a fat donut"
      question="The 2D sin²θ plot is a slice. What does the full pattern look like?"
      caption={
        <>
          Sweep the 2D sin²θ lobe around the dipole axis (the vertical wire) and you get this
          toroidal surface. Strongest along the equator (broadside to the wire), pinched to zero
          along the wire's axis. Drag to orbit. The exponent slider sharpens the pattern as the
          antenna becomes more directive: n=2 is the canonical short dipole; higher n approximates a
          longer end-fire structure with a narrower main lobe.
        </>
      }
    >
      <AutoResizeCanvas height={360} setup={setup} ariaLabel="3D dipole radiation pattern" />
      <DemoControls>
        <MiniSlider
          label="pattern exponent n"
          value={n}
          min={1}
          max={4}
          step={0.1}
          format={(v) => v.toFixed(1)}
          onChange={setN}
        />
        <MiniReadout label="HPBW (−3 dB)" value={beamwidth.toFixed(1)} unit="°" />
        <MiniToggle label="wireframe" checked={showMesh} onChange={setShowMesh} />
        <MiniToggle label="rays" checked={showRays} onChange={setShowRays} />
        <MiniToggle label="E along antenna" checked={showE} onChange={setShowE} />
      </DemoControls>
      <EquationStrip
        leftLabel="Pattern surface"
        left={<InlineMath tex="r(\theta) = \sin^n\theta" />}
        rightLabel={`n = ${n.toFixed(1)}`}
        right={<InlineMath tex={`\\text{HPBW} = ${beamwidth.toFixed(1)}^\\circ`} />}
      />
    </Demo>
  );
}
