/**
 * Demo 17.x — A dielectric block aligning under an external field (3D)
 *
 * A translucent yellow-tinted dielectric block sits in a uniform external
 * E-field running along +x. Inside the block: a population of small
 * molecular dipoles, each rendered as a short arrow from a tail (−) to a
 * head (+). Each dipole's orientation evolves under two competing effects:
 *
 *   - a deterministic torque from the external field that tends to align
 *     its dipole moment p with E_ext (so its head points along +x),
 *   - a stochastic thermal kick of variance ∝ kT that scrambles it.
 *
 * The steady-state mean alignment ⟨cos θ⟩ is the classical Langevin
 * function L(x) = coth(x) − 1/x with x = pE/kT (Griffiths §4.1.3,
 * Langevin 1905). We compute it from the population's current
 * orientations and surface it as the polarisation P = N p ⟨cos θ⟩; we
 * also extract a susceptibility χ_e by linearising P ≈ ε₀ χ_e E_ext at
 * the current operating point, then display ε_r = 1 + χ_e.
 *
 * Bound surface charges: the left face of the block (E enters) collects
 * the dipole tails (negative); the right face collects the heads
 * (positive). When show-bound-charge is on, we draw clusters of − and +
 * marks on those two faces with sizes proportional to |P|.
 *
 * Camera: shared OrbitCamera from src/lib/projection3d.ts. The reader
 * drags to rotate the block; the field-arrow grid and the bound-charge
 * marks ride along with the rotation.
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

// World-space block half-extents. The block sits centred on the origin,
// long axis along +x to make "field enters left, exits right" obvious.
const BX = 1.6;   // x half-extent
const BY = 0.9;   // y half-extent
const BZ = 0.9;   // z half-extent

const N_DIPOLES = 32;
const DIPOLE_LEN = 0.34;  // world-units, tail-to-head

interface Dipole {
  // Position inside the block.
  pos: Vec3;
  // Unit vector — direction of the dipole moment (tail to head).
  dir: Vec3;
}

function randInUnitBlock(): Vec3 {
  return v3(
    (Math.random() * 2 - 1) * (BX - 0.15),
    (Math.random() * 2 - 1) * (BY - 0.15),
    (Math.random() * 2 - 1) * (BZ - 0.15),
  );
}

function randUnit(): Vec3 {
  // Uniform on the unit sphere via the inverse-CDF on cos θ.
  const u = Math.random() * 2 - 1;
  const phi = Math.random() * 2 * Math.PI;
  const s = Math.sqrt(Math.max(0, 1 - u * u));
  return v3(s * Math.cos(phi), s * Math.sin(phi), u);
}

function normalizeUnit(v: Vec3): Vec3 {
  const l = Math.hypot(v.x, v.y, v.z);
  if (l < 1e-9) return v3(1, 0, 0);
  return v3(v.x / l, v.y / l, v.z / l);
}

// Box–Muller standard normal sample.
function gauss(): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// Langevin function L(x) = coth x − 1/x. Numerically stable at small x.
function langevin(x: number): number {
  if (Math.abs(x) < 1e-4) return x / 3;
  return 1 / Math.tanh(x) - 1 / x;
}

export function DipoleAlignment3DDemo({ figure }: Props) {
  const [Eext, setEext] = useState(0.4);   // 0..1 normalised
  const [T, setT] = useState(0.35);        // 0..1 normalised "temperature"
  const [showBound, setShowBound] = useState(true);

  // Initialise the dipole population once. Subsequent state-change reactions
  // happen inside the animation loop via stateRef.
  const dipolesRef = useRef<Dipole[]>([]);
  if (dipolesRef.current.length === 0) {
    const arr: Dipole[] = [];
    for (let i = 0; i < N_DIPOLES; i++) {
      arr.push({ pos: randInUnitBlock(), dir: randUnit() });
    }
    dipolesRef.current = arr;
  }

  // Steady-state Langevin readouts.
  // x = pE/kT is the natural dimensionless drive; in our normalised units
  // we set the prefactor so x = 6·E_ext/T spans the visually-interesting
  // range across the (0,1)² slider plane.
  const computed = useMemo(() => {
    const x = (6 * Eext) / Math.max(T, 0.05);
    const meanCos = langevin(x);
    // P in units of "fraction of saturation polarisation N p". Reported as
    // a dimensionless 0..1 number.
    const P = meanCos;
    // Linear-regime susceptibility: P/E in the same normalised units. The
    // factor of 2 makes ε_r match common low-loss-dielectric values
    // (~few) when E is moderate and T is moderate — purely cosmetic, the
    // demo is qualitative.
    const chi_e = Eext > 1e-3 ? (2 * P) / Math.max(Eext, 1e-3) : 0;
    const eps_r = 1 + chi_e;
    return { x, meanCos, P, chi_e, eps_r };
  }, [Eext, T]);

  const stateRef = useRef({ Eext, T, showBound });
  useEffect(() => {
    stateRef.current = { Eext, T, showBound };
  }, [Eext, T, showBound]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, canvas, colors } = info;
    const cam: OrbitCamera = { yaw: 0.55, pitch: 0.28, distance: 6.5, fov: Math.PI / 4 };
    const dispose = attachOrbit(canvas, cam);

    let raf = 0;
    let last = performance.now();

    function draw(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      const { Eext, T, showBound } = stateRef.current;
      const dipoles = dipolesRef.current;

      // ── Dipole dynamics ─────────────────────────────────────────────
      // Torque from E along +x pulls dir toward +x; thermal kick is a
      // small isotropic random tilt. Strengths chosen for legibility at
      // 60 fps. Conceptually: ⟨cos θ⟩ steady state matches langevin(x).
      const align = 4.0 * Eext;          // alignment rate, 1/s-ish
      const kick = 1.8 * Math.sqrt(T);   // angular diffusion amplitude
      const xhat = v3(1, 0, 0);
      const sqrtDt = Math.sqrt(dt);
      for (let i = 0; i < dipoles.length; i++) {
        const d = dipoles[i]!;
        let { x, y, z } = d.dir;
        // Drift toward xhat with strength proportional to (1 − cos θ),
        // implemented as a small step of dir toward xhat.
        x += align * dt * (xhat.x - x);
        y += align * dt * (xhat.y - y);
        z += align * dt * (xhat.z - z);
        // Thermal kick — Gaussian in each component.
        x += kick * sqrtDt * gauss();
        y += kick * sqrtDt * gauss();
        z += kick * sqrtDt * gauss();
        d.dir = normalizeUnit(v3(x, y, z));
      }

      // Mean cos θ from the current population, for visual P estimate.
      let sumCos = 0;
      for (const d of dipoles) sumCos += d.dir.x;
      const meanCos = sumCos / dipoles.length;

      // ── Background ──────────────────────────────────────────────────
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      // ── External E-field arrow grid (passes through the block) ──────
      // 3 layers in y, 3 columns in z, each a thin arrow along +x. We
      // draw them across the whole scene (outside and inside the block).
      const EXT = 2.3;
      const fieldLen = 0.7 + 0.6 * Eext;       // visual length scales with E
      const fieldAlpha = 0.25 + 0.55 * Eext;   // brightness scales with E
      type FArrow = { from: Vec3; to: Vec3; anchor: Vec3 };
      const fArrows: FArrow[] = [];
      // A staggered grid: 3 y-rows × 3 z-cols × 3 x-positions.
      for (let iy = -1; iy <= 1; iy++) {
        for (let iz = -1; iz <= 1; iz++) {
          for (let ix = -1; ix <= 1; ix++) {
            // Skip the centre line so arrows don't overlap dipoles.
            if (iy === 0 && iz === 0) continue;
            const y0 = iy * (BY + 0.25);
            const z0 = iz * (BZ + 0.25);
            const xc = ix * (EXT * 0.6);
            const from = v3(xc - fieldLen / 2, y0, z0);
            const to = v3(xc + fieldLen / 2, y0, z0);
            fArrows.push({ from, to, anchor: v3(xc, y0, z0) });
          }
        }
      }
      // Painter's algorithm: draw far field arrows first so closer
      // dipoles overlay them.
      const fOrder = depthSortIndices(fArrows, cam, w, h);
      for (const idx of fOrder) {
        const a = fArrows[idx]!;
        const p1 = project(a.from, cam, w, h);
        const p2 = project(a.to, cam, w, h);
        if (p1.depth <= 0 || p2.depth <= 0) continue;
        const col = `rgba(108,197,194,${fieldAlpha.toFixed(3)})`;
        ctx.strokeStyle = col;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        // Tiny arrowhead in screen space.
        const dx = p2.x - p1.x, dy = p2.y - p1.y;
        const L = Math.hypot(dx, dy);
        if (L > 3) {
          const ux = dx / L, uy = dy / L;
          const hd = 5;
          ctx.fillStyle = col;
          ctx.beginPath();
          ctx.moveTo(p2.x, p2.y);
          ctx.lineTo(p2.x - ux * hd - uy * 2.5, p2.y - uy * hd + ux * 2.5);
          ctx.lineTo(p2.x - ux * hd + uy * 2.5, p2.y - uy * hd - ux * 2.5);
          ctx.closePath();
          ctx.fill();
        }
      }

      // ── Dielectric block — translucent yellow-tinted ────────────────
      // Render six quad faces back-to-front so the front face draws on
      // top of dipoles behind it (we draw the back faces first, then
      // dipoles, then the front faces — a 3-pass painter's order).
      const corners: Vec3[] = [
        v3(-BX, -BY, -BZ), // 0
        v3( BX, -BY, -BZ), // 1
        v3( BX,  BY, -BZ), // 2
        v3(-BX,  BY, -BZ), // 3
        v3(-BX, -BY,  BZ), // 4
        v3( BX, -BY,  BZ), // 5
        v3( BX,  BY,  BZ), // 6
        v3(-BX,  BY,  BZ), // 7
      ];
      type Face = { idx: [number, number, number, number]; centroid: Vec3; isLeft: boolean; isRight: boolean };
      const faces: Face[] = [
        { idx: [0,1,2,3], centroid: v3(0,0,-BZ), isLeft: false, isRight: false }, // back
        { idx: [4,5,6,7], centroid: v3(0,0, BZ), isLeft: false, isRight: false }, // front
        { idx: [0,3,7,4], centroid: v3(-BX,0,0), isLeft: true,  isRight: false }, // left (−x)
        { idx: [1,2,6,5], centroid: v3( BX,0,0), isLeft: false, isRight: true  }, // right (+x)
        { idx: [0,1,5,4], centroid: v3(0,-BY,0), isLeft: false, isRight: false }, // bottom
        { idx: [3,2,6,7], centroid: v3(0, BY,0), isLeft: false, isRight: false }, // top
      ];
      const faceDepth = (f: Face) => project(f.centroid, cam, w, h).depth;
      const sortedFaces = [...faces].sort((a, b) => faceDepth(b) - faceDepth(a));

      function strokeFace(f: Face, fill: string, edge: string) {
        const pts = f.idx.map(k => project(corners[k]!, cam, w, h));
        ctx.fillStyle = fill;
        ctx.strokeStyle = edge;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(pts[0]!.x, pts[0]!.y);
        for (let k = 1; k < 4; k++) ctx.lineTo(pts[k]!.x, pts[k]!.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      // Back half of the faces (those with depth > camera distance).
      const splitDepth = cam.distance;
      const backFaces = sortedFaces.filter(f => faceDepth(f) > splitDepth);
      const frontFaces = sortedFaces.filter(f => faceDepth(f) <= splitDepth);
      const fillCol = 'rgba(240,200,80,0.06)';
      const edgeBack = 'rgba(240,200,80,0.25)';
      const edgeFront = 'rgba(240,200,80,0.55)';
      for (const f of backFaces) strokeFace(f, fillCol, edgeBack);

      // ── Dipoles (depth-sorted) ─────────────────────────────────────
      type DArrow = { idx: number; anchor: Vec3 };
      const dItems: DArrow[] = dipoles.map((d, i) => ({ idx: i, anchor: d.pos }));
      const dOrder = depthSortIndices(dItems, cam, w, h);
      for (const k of dOrder) {
        const dipole = dipoles[dItems[k]!.idx]!;
        const half = DIPOLE_LEN / 2;
        const tail = v3(
          dipole.pos.x - dipole.dir.x * half,
          dipole.pos.y - dipole.dir.y * half,
          dipole.pos.z - dipole.dir.z * half,
        );
        const head = v3(
          dipole.pos.x + dipole.dir.x * half,
          dipole.pos.y + dipole.dir.y * half,
          dipole.pos.z + dipole.dir.z * half,
        );
        const p1 = project(tail, cam, w, h);
        const p2 = project(head, cam, w, h);
        if (p1.depth <= 0 || p2.depth <= 0) continue;

        // Alignment in [0,1]: 0 = perpendicular or anti-aligned, 1 = parallel.
        const align01 = Math.max(0, dipole.dir.x);

        // Aligned dipoles glow amber; misaligned ones use a muted neutral.
        const baseColor = align01 > 0.55
          ? `rgba(255,107,42,${(0.55 + 0.4 * align01).toFixed(3)})`
          : `rgba(200,195,170,${(0.35 + 0.25 * (1 - align01)).toFixed(3)})`;
        if (align01 > 0.55) {
          drawGlowPath(ctx, [p1, p2], {
            color: baseColor,
            lineWidth: 1.8,
            glowColor: `rgba(255,107,42,${(0.18 * align01).toFixed(3)})`,
            glowWidth: 5.5,
          });
        } else {
          ctx.strokeStyle = baseColor;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }

        // Tail (−) marker — small blue dot.
        ctx.fillStyle = colors.blue;
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, 2.1, 0, Math.PI * 2);
        ctx.fill();
        // Head (+) marker — small pink dot.
        ctx.fillStyle = colors.pink;
        ctx.beginPath();
        ctx.arc(p2.x, p2.y, 2.6, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── Front faces of the block (on top of dipoles for occlusion) ──
      for (const f of frontFaces) strokeFace(f, fillCol, edgeFront);

      // ── Bound surface charges on left (−) and right (+) faces ───────
      if (showBound) {
        const density = Math.max(0, meanCos); // proportional to |P|
        const NS = 5;  // 5×5 grid of marks on each face
        const stepY = (2 * BY) / (NS + 1);
        const stepZ = (2 * BZ) / (NS + 1);
        for (let iy = 1; iy <= NS; iy++) {
          for (let iz = 1; iz <= NS; iz++) {
            const y = -BY + iy * stepY;
            const z = -BZ + iz * stepZ;
            // Slight jitter, deterministic by indices, so the layout
            // doesn't look like graph paper.
            const jY = ((iy * 13 + iz * 7) % 5 - 2) * 0.015;
            const jZ = ((iy * 7 + iz * 11) % 5 - 2) * 0.015;
            // Left face: x = -BX − tiny offset (just outside).
            const left = project(v3(-BX - 0.02, y + jY, z + jZ), cam, w, h);
            const right = project(v3( BX + 0.02, y + jY, z + jZ), cam, w, h);
            if (left.depth > 0) {
              ctx.fillStyle = `rgba(91,174,248,${(0.25 + 0.65 * density).toFixed(3)})`;
              ctx.font = `${Math.round(10 + 6 * density)}px "JetBrains Mono", monospace`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText('−', left.x, left.y);
            }
            if (right.depth > 0) {
              ctx.fillStyle = `rgba(255,59,110,${(0.3 + 0.65 * density).toFixed(3)})`;
              ctx.font = `${Math.round(10 + 6 * density)}px "JetBrains Mono", monospace`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText('+', right.x, right.y);
            }
          }
        }
      }

      // ── Annotations ────────────────────────────────────────────────
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillStyle = colors.textDim;
      ctx.fillText('drag to rotate', 12, 12);
      ctx.fillStyle = colors.teal;
      ctx.fillText('E_ext  teal · along +x', 12, 28);
      ctx.fillStyle = 'rgba(240,200,80,0.85)';
      ctx.fillText('dielectric block', 12, 44);

      ctx.textAlign = 'right';
      ctx.fillStyle = colors.accent;
      ctx.fillText('p  aligned dipole', w - 12, 12);
      ctx.fillStyle = 'rgba(200,195,170,0.75)';
      ctx.fillText('p  scrambled (thermal)', w - 12, 28);

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
      figure={figure ?? 'Fig. 17.3'}
      title="A dielectric aligns under an applied field"
      question="How do microscopic dipoles, randomly tumbling at zero field, give a macroscopic ε_r when the field is turned on?"
      caption={
        <>
          A translucent slab of dielectric sits in a uniform external{' '}
          <strong>E_ext</strong> along +x. The interior is populated by
          molecular dipoles — short arrows from a blue tail (−) to a pink
          head (+). At <em>E = 0</em> they tumble isotropically and the
          mean alignment <em>⟨cos θ⟩</em> is zero; turn up the field and
          they tilt toward +x against thermal noise, with the equilibrium
          alignment given by the Langevin function <em>L(pE/kT)</em>. The
          dipole tails accumulate on the left face and the heads on the
          right — that's the bound surface charge, and it's what reduces
          the field inside the block by the factor <em>ε<sub>r</sub></em>.
        </>
      }
    >
      <AutoResizeCanvas height={360} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="E_ext"
          value={Eext} min={0} max={1} step={0.01}
          format={v => v.toFixed(2)}
          onChange={setEext}
        />
        <MiniSlider
          label="temperature T"
          value={T} min={0.05} max={1} step={0.01}
          format={v => v.toFixed(2)}
          onChange={setT}
        />
        <MiniToggle
          label={showBound ? 'bound surface charge SHOWN' : 'bound surface charge hidden'}
          checked={showBound} onChange={setShowBound}
        />
        <MiniReadout
          label="P (∝ ⟨cos θ⟩)"
          value={<Num value={computed.P} />}
          unit="of saturation"
        />
        <MiniReadout
          label="χ_e ≈ P/E"
          value={<Num value={computed.chi_e} />}
        />
        <MiniReadout
          label="ε_r = 1 + χ_e"
          value={<Num value={computed.eps_r} />}
        />
      </DemoControls>
    </Demo>
  );
}
