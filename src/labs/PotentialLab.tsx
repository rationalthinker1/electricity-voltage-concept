/**
 * Lab 1.4 — Potential Difference
 *
 *   V_ab = V_b − V_a = −∫_a^b E · dℓ
 *
 * Two charges build a 2D potential field; two draggable probes A, B report
 * the potential difference. Equipotential heatmap, contour bands, animated
 * field-line streaming, A→B integration path.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Formula } from '@/components/Formula';
import { LabGrid, LegendItem } from '@/components/LabLayout';
import { LabShell } from '@/components/LabShell';
import { MathBlock, Pullout } from '@/components/Prose';
import { Readout } from '@/components/Readout';
import { Cite } from '@/components/SourcesList';
import { Slider } from '@/components/Slider';
import { TryIt } from '@/components/TryIt';
import { PHYS, pretty } from '@/lib/physics';
import { BASE_LAB_SOURCES } from '@/labs/data/manifest';

const SLUG = 'potential';
const SOURCES = BASE_LAB_SOURCES[SLUG]!;

const PX_PER_M = 1000; // 1 px = 1 mm

interface Pt { x: number; y: number }

export default function PotentialLab() {
  const [q1NC, setQ1NC] = useState(+5);
  const [q2NC, setQ2NC] = useState(-5);
  const [er, setEr] = useState(1.0);

  const [q1, setQ1] = useState<Pt>({ x: 0.30, y: 0.5 });
  const [q2, setQ2] = useState<Pt>({ x: 0.70, y: 0.5 });
  const [pA, setPA] = useState<Pt>({ x: 0.45, y: 0.30 });
  const [pB, setPB] = useState<Pt>({ x: 0.55, y: 0.70 });

  const [sizePx, setSizePx] = useState({ W: 800, H: 520 });

  const stateRef = useRef({ q1NC, q2NC, er, q1, q2, pA, pB, sizePx });
  useEffect(() => {
    stateRef.current = { q1NC, q2NC, er, q1, q2, pA, pB, sizePx };
  }, [q1NC, q2NC, er, q1, q2, pA, pB, sizePx]);

  // Compute potentials at the probes (W,H matter for px-to-meter conversion).
  const computed = useMemo(() => {
    const { W, H } = sizePx;
    function potentialAt(ux: number, uy: number) {
      let v = 0;
      for (const c of [{ x: q1.x, y: q1.y, q: q1NC * 1e-9 }, { x: q2.x, y: q2.y, q: q2NC * 1e-9 }]) {
        const dxPx = (ux - c.x) * W;
        const dyPx = (uy - c.y) * H;
        const r_m = Math.hypot(dxPx, dyPx) / PX_PER_M;
        v += (PHYS.k * c.q) / Math.max(r_m, 0.001);
      }
      return v / er;
    }
    function fieldAt(ux: number, uy: number) {
      let Ex = 0, Ey = 0;
      for (const c of [{ x: q1.x, y: q1.y, q: q1NC * 1e-9 }, { x: q2.x, y: q2.y, q: q2NC * 1e-9 }]) {
        const dxPx = (ux - c.x) * W;
        const dyPx = (uy - c.y) * H;
        const r_m = Math.max(Math.hypot(dxPx, dyPx) / PX_PER_M, 1e-3);
        const r2 = r_m * r_m;
        const ux_v = (dxPx / PX_PER_M) / r_m;
        const uy_v = (dyPx / PX_PER_M) / r_m;
        const E = (PHYS.k * c.q) / r2;
        Ex += E * ux_v;
        Ey += E * uy_v;
      }
      Ex /= er; Ey /= er;
      return { Ex, Ey, mag: Math.hypot(Ex, Ey) };
    }
    const VA = potentialAt(pA.x, pA.y);
    const VB = potentialAt(pB.x, pB.y);
    const dV = VB - VA;
    const Eat = fieldAt(pA.x, pA.y);
    const dxPx = (pB.x - pA.x) * W;
    const dyPx = (pB.y - pA.y) * H;
    const distance_m = Math.hypot(dxPx, dyPx) / PX_PER_M;
    const work = 1 * dV; // 1 C test charge moved A → B
    return { VA, VB, dV, EmagA: Eat.mag, distance_m, work };
  }, [q1NC, q2NC, er, q1, q2, pA, pB, sizePx]);

  const setupCanvas = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, canvas } = info;
    setSizePx({ W: w, H: h });
    let raf = 0;
    let dragging: 'q1' | 'q2' | 'pA' | 'pB' | null = null;
    let phase = 0;

    function getMouse(e: MouseEvent | TouchEvent): [number, number] {
      const r = canvas.getBoundingClientRect();
      const t = 'touches' in e ? e.touches[0] : e;
      if (!t) return [0, 0];
      return [t.clientX - r.left, t.clientY - r.top];
    }
    function nearest(mx: number, my: number) {
      const st = stateRef.current;
      let best: typeof dragging = null;
      let bestD = 22;
      for (const key of ['q1', 'q2', 'pA', 'pB'] as const) {
        const p = st[key];
        const d = Math.hypot(mx - p.x * w, my - p.y * h);
        if (d < bestD) { bestD = d; best = key; }
      }
      return best;
    }
    function clamp01(p: number) { return Math.max(0.04, Math.min(0.96, p)); }
    function clampY(p: number) { return Math.max(0.08, Math.min(0.92, p)); }
    function applyDrag(target: NonNullable<typeof dragging>, mx: number, my: number) {
      const np = { x: clamp01(mx / w), y: clampY(my / h) };
      if (target === 'q1') setQ1(np);
      else if (target === 'q2') setQ2(np);
      else if (target === 'pA') setPA(np);
      else setPB(np);
    }

    function onMouseDown(e: MouseEvent) {
      const [mx, my] = getMouse(e);
      dragging = nearest(mx, my);
      if (dragging) canvas.style.cursor = 'grabbing';
    }
    function onMouseMove(e: MouseEvent) {
      const [mx, my] = getMouse(e);
      if (dragging) {
        applyDrag(dragging, mx, my);
      } else {
        canvas.style.cursor = nearest(mx, my) ? 'grab' : 'default';
      }
    }
    function onMouseUp() { dragging = null; canvas.style.cursor = 'default'; }
    function onTouchStart(e: TouchEvent) {
      e.preventDefault();
      const [mx, my] = getMouse(e);
      dragging = nearest(mx, my);
    }
    function onTouchMove(e: TouchEvent) {
      e.preventDefault();
      if (!dragging) return;
      const [mx, my] = getMouse(e);
      applyDrag(dragging, mx, my);
    }
    function onTouchEnd() { dragging = null; }

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);

    function chargesAsList() {
      const st = stateRef.current;
      return [
        { x: st.q1.x, y: st.q1.y, q: st.q1NC * 1e-9 },
        { x: st.q2.x, y: st.q2.y, q: st.q2NC * 1e-9 },
      ];
    }
    function potentialAt(ux: number, uy: number) {
      const er = stateRef.current.er;
      let v = 0;
      for (const c of chargesAsList()) {
        const dxPx = (ux - c.x) * w;
        const dyPx = (uy - c.y) * h;
        const r_m = Math.hypot(dxPx, dyPx) / PX_PER_M;
        v += (PHYS.k * c.q) / Math.max(r_m, 0.001);
      }
      return v / er;
    }
    function fieldAt(ux: number, uy: number) {
      const er = stateRef.current.er;
      let Ex = 0, Ey = 0;
      for (const c of chargesAsList()) {
        const dxPx = (ux - c.x) * w;
        const dyPx = (uy - c.y) * h;
        const r_m = Math.max(Math.hypot(dxPx, dyPx) / PX_PER_M, 1e-3);
        const r2 = r_m * r_m;
        const ux_v = (dxPx / PX_PER_M) / r_m;
        const uy_v = (dyPx / PX_PER_M) / r_m;
        const E = (PHYS.k * c.q) / r2;
        Ex += E * ux_v;
        Ey += E * uy_v;
      }
      Ex /= er; Ey /= er;
      return { Ex, Ey, mag: Math.hypot(Ex, Ey) };
    }

    function draw() {
      const st = stateRef.current;
      ctx.fillStyle = '#0d0d10';
      ctx.fillRect(0, 0, w, h);

      // Equipotential heatmap (subtle)
      const cellSize = 8;
      for (let py = 0; py < h; py += cellSize) {
        for (let px = 0; px < w; px += cellSize) {
          const v = potentialAt(px / w, py / h);
          if (Math.abs(v) < 1) continue;
          const t = Math.tanh(v / 200);
          if (t > 0) ctx.fillStyle = `rgba(255,59,110,${Math.abs(t) * 0.10})`;
          else        ctx.fillStyle = `rgba(91,174,248,${Math.abs(t) * 0.10})`;
          ctx.fillRect(px, py, cellSize, cellSize);
        }
      }

      // Equipotential contour bands
      const levels = [-1000, -500, -200, -100, -50, -20, 20, 50, 100, 200, 500, 1000];
      const step = 5;
      for (let py = 0; py < h; py += step) {
        for (let px = 0; px < w; px += step) {
          const v = potentialAt(px / w, py / h);
          for (const L of levels) {
            if (Math.abs(v - L) < Math.abs(L) * 0.04 + 1.5) {
              ctx.fillStyle = 'rgba(108,197,194,0.18)';
              ctx.fillRect(px, py, 2, 2);
            }
          }
        }
      }

      // Streaming field lines from each charge
      phase += 0.6;
      for (const src of [st.q1, st.q2]) {
        const srcQ = src === st.q1 ? st.q1NC : st.q2NC;
        const lines = 18;
        for (let i = 0; i < lines; i++) {
          const a = (i / lines) * Math.PI * 2;
          let x = src.x + Math.cos(a) * 0.03;
          let y = src.y + Math.sin(a) * 0.03;
          const path: Array<[number, number]> = [];
          const sign = srcQ > 0 ? +1 : -1;
          for (let s = 0; s < 350; s++) {
            const { Ex, Ey, mag } = fieldAt(x, y);
            if (mag < 1e-3) break;
            const stepDX = (Ex / mag) * 0.004 * sign;
            const stepDY = (Ey / mag) * 0.004 * sign;
            x += stepDX; y += stepDY;
            if (x < 0 || x > 1 || y < 0 || y > 1) break;
            let hit = false;
            for (const c of chargesAsList()) {
              const dd = Math.hypot((x - c.x) * w, (y - c.y) * h);
              if (dd < 12) { hit = true; break; }
            }
            path.push([x, y]);
            if (hit) break;
          }
          if (path.length > 2) {
            ctx.strokeStyle = 'rgba(255,107,42,0.16)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(path[0][0] * w, path[0][1] * h);
            for (const [px, py] of path) ctx.lineTo(px * w, py * h);
            ctx.stroke();
            const tIdx = Math.floor((phase + i * 17 + (src === st.q1 ? 0 : 50)) % path.length);
            const t = path[tIdx];
            if (t) {
              ctx.beginPath();
              ctx.arc(t[0] * w, t[1] * h, 1.6, 0, Math.PI * 2);
              ctx.fillStyle = 'rgba(255,107,42,0.95)';
              ctx.shadowColor = 'rgba(255,107,42,.6)';
              ctx.shadowBlur = 5;
              ctx.fill();
              ctx.shadowBlur = 0;
            }
          }
        }
      }

      // A → B integration path
      const ax = st.pA.x * w, ay = st.pA.y * h;
      const bx = st.pB.x * w, by = st.pB.y * h;
      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(ax, ay); ctx.lineTo(bx, by);
      ctx.stroke();
      ctx.setLineDash([]);
      const angle = Math.atan2(by - ay, bx - ax);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx - 8 * Math.cos(angle - 0.4), by - 8 * Math.sin(angle - 0.4));
      ctx.lineTo(bx - 8 * Math.cos(angle + 0.4), by - 8 * Math.sin(angle + 0.4));
      ctx.fill();

      // Charges
      drawCharge(ctx, st.q1.x * w, st.q1.y * h, '#ff3b6e', st.q1NC >= 0 ? '+' : '−', 'Q₁', Math.abs(st.q1NC));
      drawCharge(ctx, st.q2.x * w, st.q2.y * h, '#5baef8', st.q2NC >= 0 ? '+' : '−', 'Q₂', Math.abs(st.q2NC));

      // Probes
      drawProbe(ctx, ax, ay, 'A');
      drawProbe(ctx, bx, by, 'B');

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  const labContent = (
    <LabGrid
      canvas={<AutoResizeCanvas height={520} setup={setupCanvas} />}
      legend={
        <>
          <LegendItem swatchColor="var(--pink)" dot>Charge Q₁</LegendItem>
          <LegendItem swatchColor="var(--blue)" dot>Charge Q₂</LegendItem>
          <LegendItem swatchColor="var(--accent)" dot>Probe A / B</LegendItem>
          <LegendItem swatchColor="var(--accent)">E field lines</LegendItem>
          <LegendItem swatchColor="var(--teal)" style={{ opacity: 0.7 }}>Equipotentials</LegendItem>
          <LegendItem style={{ marginLeft: 'auto', color: 'var(--accent)' }}>↳ Drag charges &amp; probes</LegendItem>
        </>
      }
      inputs={
        <>
          <Slider
            sym="Q₁" label="Charge 1"
            value={q1NC} min={-10} max={10} step={0.1}
            format={v => (v >= 0 ? '+' : '') + v.toFixed(1) + ' nC'}
            metaLeft="−10 nC" metaRight="+10 nC"
            onChange={setQ1NC}
          />
          <Slider
            sym="Q₂" label="Charge 2"
            value={q2NC} min={-10} max={10} step={0.1}
            format={v => (v >= 0 ? '+' : '') + v.toFixed(1) + ' nC'}
            metaLeft="−10 nC" metaRight="+10 nC"
            onChange={setQ2NC}
          />
          <Slider
            sym="ε<sub>r</sub>" label="Rel. permittivity"
            value={er} min={1} max={80} step={0.1}
            format={v => v.toFixed(1)}
            metaLeft="1 (vacuum)" metaRight="80 (water)"
            onChange={setEr}
          />
        </>
      }
      outputs={
        <>
          <Readout
            sym={<>V<sub>A</sub></>} label="Potential at A"
            valueHTML={pretty(computed.VA)}
            unit="V"
          />
          <Readout
            sym={<>V<sub>B</sub></>} label="Potential at B"
            valueHTML={pretty(computed.VB)}
            unit="V"
          />
          <Readout
            sym="ΔV" label="Voltage A → B"
            valueHTML={pretty(computed.dV)}
            unit="V"
            highlight
          />
          <Readout
            sym={<>|E|<sub>A</sub></>} label="Field strength at A"
            valueHTML={pretty(computed.EmagA)}
            unit="V/m"
          />
          <Readout
            sym="d" label="Distance A → B"
            value={computed.distance_m.toFixed(3)}
            unit="m"
          />
          <Readout
            sym="W" label="Work to move +1 C, A → B"
            valueHTML={pretty(computed.work)}
            unit="J"
          />
        </>
      }
    />
  );

  const prose = (
    <>
      <h3>Context</h3>
      <p>
        Electric potential <strong>V</strong> is the scalar field whose negative gradient is <strong>E</strong>, and whose line integral
        between two points is the work per unit charge that the field does on a positive charge moved between them. It exists because
        electrostatic <strong>E</strong> is curl-free — and so can be written as the gradient of a single scalar function<Cite id="feynman-II-2" in={SOURCES} />.
      </p>
      <p>
        It applies wherever the field is static (or quasi-static). In dynamic situations — radiation, time-varying B fields inducing E by
        Faraday's law — the curl of E is nonzero, and a single-valued scalar potential alone is no longer enough; you need both V and the
        vector potential A. The formula <strong>V = kQ/r</strong> in particular assumes a point source in vacuum (or isotropic linear medium),
        and the convention that V → 0 as r → ∞<Cite id="griffiths-2017" in={SOURCES} />.
      </p>

      <h3>Formula</h3>
      <MathBlock>V<sub>ab</sub> = V<sub>b</sub> − V<sub>a</sub> = −∫<sub>a</sub><sup>b</sup> E · dℓ</MathBlock>
      <MathBlock>V(r) = k Q / (ε<sub>r</sub> r)   (single point charge)</MathBlock>
      <p>
        Variable glossary:
      </p>
      <ul>
        <li><strong>V</strong> — electric potential at a point, in volts. A volt is one joule per coulomb. By convention, V → 0 at infinity for an isolated finite charge distribution.</li>
        <li><strong>V<sub>ab</sub></strong> — the potential difference (voltage) between two specific points b and a, in volts. This is what a voltmeter reads.</li>
        <li><strong>E</strong> — electric field along the integration path, in V/m.</li>
        <li><strong>dℓ</strong> — directed length element along whatever path you take from a to b, in meters.</li>
        <li><strong>Q</strong> — source point charge, in coulombs (signed).</li>
        <li><strong>r</strong> — distance from the source to the field point, in meters.</li>
        <li><strong>k = 1/(4π ε₀) ≈ 8.99×10⁹ N·m²/C²</strong> — Coulomb's constant.</li>
        <li><strong>ε<sub>r</sub></strong> — relative permittivity of the surrounding medium.</li>
      </ul>

      <h3>Intuition</h3>
      <p>
        Forget wires for a second. Imagine standing on a hillside. Pick two points. The <strong>height difference</strong> between them tells you
        how much energy gravity will give you if you walk from the high one to the low one, or take from you if you walk uphill. That's the
        whole idea of potential.
      </p>
      <p>
        Voltage is the same thing for charge. Pick two points. The voltage between them is the energy the electric field will hand to a unit
        of positive charge as it moves from one to the other. <strong>A volt is a joule per coulomb.</strong> Move one coulomb between two points
        that differ by one volt and you've traded one joule of energy with the field<Cite id="libretexts-univ-physics" in={SOURCES} />.
      </p>
      <Pullout>
        Voltage is not a property of a place. It is a property of the <em>path between two places</em> in a field.
      </Pullout>

      <h3>Reasoning</h3>
      <p>
        Why the minus sign? Because V is defined to be high where positive charges <em>want to leave</em>. A positive charge gains kinetic
        energy moving from high V to low V. The field does positive work on it; V drops along E. The minus sign keeps the bookkeeping
        straight<Cite id="griffiths-2017" in={SOURCES} />.
      </p>
      <p>
        Why is the path irrelevant? Because the electrostatic E is conservative — its curl vanishes. The line integral of a curl-free field
        between two endpoints depends only on the endpoints. The hillside analogy holds literally: elevation change between two cities is
        independent of the route<Cite id="feynman-II-2" in={SOURCES} />.
      </p>
      <p>
        Why is V from a point charge <strong>kQ/r</strong> and not <strong>kQ/r²</strong>? Because V is the integral of E, and integrating
        1/r² gives −1/r. The factor of r in V vs r² in E is what makes V much easier to compute for multi-charge configurations: it adds as a
        scalar, while E adds as a vector.
      </p>
      <p>
        Limits. At a point coincident with a point charge (r → 0), V → ∞ — the same idealization-induced singularity as E. At r → ∞, V → 0 (the
        chosen zero of potential). Doubling Q doubles V everywhere. Reversing the sign of Q reverses V everywhere. For two equal opposite
        charges (a dipole), V is positive on the + side, negative on the − side, and exactly zero on the perpendicular bisecting plane — even
        though E is not zero there. A clean illustration that V and E carry different information.
      </p>

      <h3>Derivation</h3>
      <p>
        Start with the electric field <strong>E</strong>. It points in the direction a positive test charge would accelerate — in newtons per
        coulomb. If you walk a tiny distance <strong>dℓ</strong> in the direction of the field, the force on a unit positive charge does work
        equal to <strong>E · dℓ</strong>. The dot product is the right object here: only the component of <strong>E</strong> along your direction
        of motion counts<Cite id="griffiths-2017" in={SOURCES} />.
      </p>
      <p>
        Walk from point a to point b and add up E·dℓ along every step. That line integral is the total work the field does on a unit positive
        charge. The voltage from a to b is defined to be the negative of that:
      </p>
      <MathBlock>V<sub>ab</sub> = −∫<sub>a</sub><sup>b</sup> E · dℓ</MathBlock>
      <p>
        Path-independence follows from <strong>∇ × E = 0</strong>: by Stokes's theorem the integral of a curl-free field around any closed loop
        is zero, so the integral between any two points depends only on the endpoints. This lets us define a single-valued function V(r) by
        anchoring V(∞) = 0:
      </p>
      <MathBlock>V(r) = −∫<sub>∞</sub><sup>r</sup> E · dℓ</MathBlock>
      <p>
        For a point charge Q at the origin, E = kQ/r² r̂. Take a radial path from infinity inward; dℓ = dr r̂:
      </p>
      <MathBlock>V(r) = −∫<sub>∞</sub><sup>r</sup> (kQ/r'²) dr' = kQ / r</MathBlock>
      <p>
        For many charges, superposition: E is the vector sum, so V is the scalar sum<Cite id="griffiths-2017" in={SOURCES} />:
      </p>
      <MathBlock>V(r) = Σ<sub>i</sub> k Q<sub>i</sub> / |r − r<sub>i</sub>|</MathBlock>
      <p>
        That is the formula running under the canvas above. V at any point is the algebraic sum of <strong>kQ₁/r₁</strong> and
        <strong> kQ₂/r₂</strong>; the coloured bands are loci of constant V.
      </p>
      <p>
        The inverse relation — recovering E from V — is the gradient:
      </p>
      <MathBlock>E = −∇V</MathBlock>
      <p>
        The field points "downhill" on the V landscape, steepest where V changes fastest.
      </p>

      <h3>Worked problems</h3>

      <TryIt
        tag="Problem 1.4.1"
        question={<>What is the electric potential <strong>1 cm</strong> from a <strong>+1 nC</strong> point charge in vacuum, taking V = 0 at infinity?</>}
        answer={
          <>
            <p>Direct application of V = kQ/r:</p>
            <Formula>V = (8.99×10⁹)(10⁻⁹) / (0.01) = 899 V</Formula>
            <p>About <strong>900 V</strong>. Positive — the potential of a positive charge is positive everywhere (with V → 0 at infinity).</p>
          </>
        }
      />

      <TryIt
        tag="Problem 1.4.2"
        question={<>How much work must you do to bring a <strong>+1 nC</strong> charge from infinity to a point <strong>1 cm</strong> away from a fixed <strong>+5 nC</strong> charge?</>}
        answer={
          <>
            <p>Work done against the field is W = q·V, where V is the potential at the destination (since V is defined with V(∞) = 0):</p>
            <Formula>V<sub>destination</sub> = k Q / r = (8.99×10⁹)(5×10⁻⁹) / (0.01) = 4495 V</Formula>
            <Formula>W = q V = (10⁻⁹)(4495) ≈ 4.5×10⁻⁶ J</Formula>
            <p>About <strong>4.5 µJ</strong>. Both charges are positive, so they repel — you have to push against the field to assemble the configuration. That energy is stored in the system; release the charge and it flies back out, converting V into kinetic energy<Cite id="griffiths-2017" in={SOURCES} />.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 1.4.3"
        question={<>Two charges, <strong>+Q</strong> at <strong>x = +d/2</strong> and <strong>−Q</strong> at <strong>x = −d/2</strong>. What is V at the origin, and on the y-axis?</>}
        answer={
          <>
            <p>At the origin, both charges are at distance d/2. V is the scalar sum:</p>
            <Formula>V<sub>origin</sub> = kQ/(d/2) + k(−Q)/(d/2) = 0</Formula>
            <p>Identically zero. On the y-axis at height y, both charges are at distance r = √((d/2)² + y²) — equal magnitudes, opposite signs:</p>
            <Formula>V(y) = kQ/r + k(−Q)/r = 0</Formula>
            <p>The <strong>entire perpendicular bisecting plane is at V = 0</strong>. But the field there is <em>not</em> zero — it points from + toward −, parallel to the dipole axis. This is the cleanest demonstration that V and E carry different information: a place can be at zero potential and still have a large field, and vice versa<Cite id="griffiths-2017" in={SOURCES} />.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 1.4.4"
        question={<>What is the geometric shape of the equipotential surfaces for an isolated point charge?</>}
        answer={
          <>
            <p>For V = kQ/r, level surfaces are sets where r is constant — that is, <strong>concentric spheres centred on the charge</strong>. Equipotentials never cross, and they are perpendicular to E everywhere (E = −∇V always points along the steepest-descent direction of V, which is perpendicular to level surfaces).</p>
            <p>In the lab's 2D rendering, equipotential surfaces appear as concentric circles around each charge — at least until two charges' fields interact, at which point the equipotentials warp into more complex shapes that still tile space without intersecting.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 1.4.5"
        question={<>What is the potential difference between two points at <strong>r₁ = 1 cm</strong> and <strong>r₂ = 2 cm</strong> from a <strong>+1 nC</strong> point charge?</>}
        answer={
          <>
            <p>Compute V at each radius and subtract:</p>
            <Formula>V(1 cm) = (8.99×10⁹)(10⁻⁹)/(0.01) = 899 V</Formula>
            <Formula>V(2 cm) = (8.99×10⁹)(10⁻⁹)/(0.02) = 449.5 V</Formula>
            <Formula>ΔV = V(2 cm) − V(1 cm) = 449.5 − 899 = −449.5 V</Formula>
            <p>About <strong>−450 V</strong>. Negative, because moving outward in the field of a positive source means going to lower potential. A positive test charge released from r₁ would fall to r₂, gaining 450 J/C of kinetic energy<Cite id="libretexts-univ-physics" in={SOURCES} />.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 1.4.6"
        question={<>A conducting sphere of radius <strong>1 cm</strong> holds <strong>+10 nC</strong> uniformly on its surface. What is V at the surface? What is V inside, at the centre?</>}
        answer={
          <>
            <p>Outside (and at the surface), the sphere acts like a point charge at its centre (shell theorem):</p>
            <Formula>V<sub>surface</sub> = k Q / R = (8.99×10⁹)(10⁻⁸) / (0.01) = 8990 V</Formula>
            <p>About <strong>9000 V</strong>. Inside the conductor, E = 0 in electrostatic equilibrium. Since V is the integral of E, V is constant throughout the conductor — equal to its surface value:</p>
            <Formula>V<sub>centre</sub> = V<sub>surface</sub> ≈ 8990 V</Formula>
            <p>A conductor is an equipotential body. This is why we can speak of "the voltage of" a wire without specifying where on the wire<Cite id="griffiths-2017" in={SOURCES} />.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 1.4.7"
        question={<>Why does the dipole's perpendicular bisecting plane have V = 0 but nonzero E? Explain in terms of how V and E relate geometrically.</>}
        answer={
          <>
            <p>V is a <em>scalar</em>; contributions from + and − charges algebraically cancel when their distances are equal. E is a <em>vector</em>; the two charges' field contributions point in similar directions on the bisecting plane (away from +, toward −, which point the same way) and so they <em>add</em>, not cancel.</p>
            <p>Quantitatively, E = −∇V is the gradient of V. On the bisector, V = 0 along the plane, but ∇V need not lie in the plane — and indeed ∇V points <em>perpendicular</em> to the plane, along the dipole axis. The field is the rate of change of V <em>across</em> the plane, not the value of V <em>on</em> it<Cite id="feynman-II-2" in={SOURCES} />.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 1.4.8"
        question={<>An electron is accelerated from rest through a potential difference of <strong>100 V</strong>. What is its final kinetic energy in joules and in electron-volts? What is its final speed?</>}
        answer={
          <>
            <p>Energy gained by a charge q falling through potential ΔV is W = q·ΔV. The electron has charge e = 1.602×10⁻¹⁹ C and gains kinetic energy:</p>
            <Formula>KE = e ΔV = (1.602×10⁻¹⁹)(100) = 1.602×10⁻¹⁷ J</Formula>
            <p>By the definition of the eV: <strong>KE = 100 eV</strong>. (One electron-volt is the energy an electron acquires falling through 1 V.) Final speed from KE = ½ m v²:</p>
            <Formula>v = √(2 KE / m<sub>e</sub>) = √(2(1.602×10⁻¹⁷) / (9.109×10⁻³¹))</Formula>
            <Formula>v ≈ √(3.52×10¹³) ≈ 5.93×10⁶ m/s</Formula>
            <p>About <strong>6,000 km/s</strong>, or 2% of the speed of light. Non-relativistic, but only just — at 1 MV, relativistic corrections become important.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 1.4.9"
        question={<>A <strong>+1 nC</strong> charge is held fixed at the origin. A second charge <strong>+1 nC</strong> is released from rest at <strong>r = 1 cm</strong>. What is its kinetic energy when it has flown outward to <strong>r = 10 cm</strong>?</>}
        answer={
          <>
            <p>Energy conservation: KE gained = drop in potential energy. The potential energy of two charges at separation r is U = kQ₁Q₂/r:</p>
            <Formula>U(1 cm) = (8.99×10⁹)(10⁻⁹)² / (0.01) = 8.99×10⁻⁷ J</Formula>
            <Formula>U(10 cm) = (8.99×10⁹)(10⁻⁹)² / (0.1) = 8.99×10⁻⁸ J</Formula>
            <Formula>KE = U(1 cm) − U(10 cm) ≈ 8.09×10⁻⁷ J</Formula>
            <p>About <strong>0.8 µJ</strong> of kinetic energy. Almost all of the initial potential energy converts — at infinity, KE would reach the full 8.99×10⁻⁷ J<Cite id="griffiths-2017" in={SOURCES} />.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 1.4.10"
        question={<>Find the potential on the axis of a thin uniformly charged ring of radius <strong>R</strong> holding total charge <strong>Q</strong>, at axial distance <strong>z</strong> from the centre.</>}
        answer={
          <>
            <p>Every element of charge dQ on the ring sits at the same distance r = √(R² + z²) from the axial point. V adds as a scalar; every dQ contributes equally:</p>
            <Formula>V(z) = ∫ k dQ / r = k Q / √(R² + z²)</Formula>
            <p>This is the textbook ring-on-axis result. Sanity checks: at z = 0 (centre of the ring), V = kQ/R, finite and nonzero — even though E vanishes there by symmetry. At z ≫ R, V → kQ/z, the point-charge limit. Differentiate to recover the axial field: E<sub>z</sub> = −dV/dz = kQz/(R² + z²)^(3/2)<Cite id="griffiths-2017" in={SOURCES} />.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 1.4.11"
        question={<>In a circuit, a wall outlet reads <strong>120 V</strong>. What does that mean operationally, in terms of moving a test charge through space?</>}
        answer={
          <>
            <p>It means that the electric field between the two outlet terminals is configured such that a positive test charge moved from one terminal (the lower-potential one, the "return") to the other (the higher-potential one, the "hot") would have <strong>120 J</strong> of work done against it per coulomb of charge moved. Equivalently, the field hands 120 J per coulomb to charges flowing from hot to return.</p>
            <p>That field doesn't live <em>inside</em> the wires; the chemistry of the generator (or, here, the AC grid) maintains a charge separation, and the resulting field fills the space around and within the conductors. A voltmeter integrates E along its leads electronically — the physical content is exactly the line integral the lab draws between probes A and B<Cite id="libretexts-univ-physics" in={SOURCES} />.</p>
          </>
        }
      />

      <h3>What ε<sub>r</sub> does</h3>
      <p>
        In a dielectric (water, glass, plastic), the molecules polarize in the presence of an external field. Their dipoles align and produce
        a counter-field that reduces the net field everywhere. Both <strong>E</strong> and <strong>V</strong> get divided by
        <strong> ε<sub>r</sub></strong>, the relative permittivity<Cite id="griffiths-2017" in={SOURCES} />. Slide the permittivity up and watch
        the voltage between A and B drop by the same factor.
      </p>
    </>
  );

  return (
    <LabShell
      slug={SLUG}
      labSubtitle="Two-Charge Potential Field"
      labId="potential-1.4 / V = −∫ E·dℓ"
      labContent={labContent}
      prose={prose}
    />
  );
}

function drawCharge(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, color: string,
  sign: string, label: string, magnitude: number,
) {
  const radius = 12 + Math.min(8, magnitude * 0.8);
  const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 3);
  grd.addColorStop(0, color);
  grd.addColorStop(1, color + '00');
  ctx.fillStyle = grd;
  ctx.beginPath(); ctx.arc(cx, cy, radius * 3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#0a0a0b';
  ctx.font = `bold ${radius}px JetBrains Mono`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(sign, cx, cy);
  ctx.fillStyle = color;
  ctx.font = '10px JetBrains Mono';
  ctx.fillText(label, cx, cy + radius + 14);
}

function drawProbe(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, label: string,
) {
  ctx.strokeStyle = '#ff6b2a';
  ctx.lineWidth = 2;
  ctx.fillStyle = 'rgba(10,10,11,.9)';
  ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#ff6b2a';
  ctx.font = 'bold 11px JetBrains Mono';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, cx, cy);
}
