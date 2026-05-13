/**
 * Lab 1.2 — Field of a Point Charge
 *
 *   E = k Q / (ε_r r²)
 *
 * Single source charge + draggable test probe. The probe arrow shows
 * direction and a log-scaled magnitude of E at its location.
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
import { drawArrow, drawCharge } from '@/lib/canvasPrimitives';
import { PHYS, pretty } from '@/lib/physics';
import { BASE_LAB_SOURCES } from '@/labs/data/manifest';

const SLUG = 'e-field';
const SOURCES = BASE_LAB_SOURCES[SLUG]!;

const PX_PER_M = 1000; // 1 px = 1 mm

export default function EFieldLab() {
  const [qNC, setQNC] = useState(+10);     // source charge, nC
  const [qTestNC, setQTestNC] = useState(1.0); // test charge, nC
  const [er, setEr] = useState(1.0);

  // Normalized [0..1] canvas-coords for source and probe.
  const [src, setSrc] = useState({ x: 0.50, y: 0.50 });
  const [probe, setProbe] = useState({ x: 0.72, y: 0.42 });

  // Canvas size in CSS pixels — needed so computed values can convert pixel
  // distance to meters for the readouts.
  const [sizePx, setSizePx] = useState({ W: 800, H: 500 });

  const stateRef = useRef({ qNC, qTestNC, er, src, probe, sizePx });
  useEffect(() => {
    stateRef.current = { qNC, qTestNC, er, src, probe, sizePx };
  }, [qNC, qTestNC, er, src, probe, sizePx]);

  // Computed physics for the readouts.
  const computed = useMemo(() => {
    const dxPx = (probe.x - src.x) * sizePx.W;
    const dyPx = (probe.y - src.y) * sizePx.H;
    const r_m = Math.max(Math.hypot(dxPx, dyPx) / PX_PER_M, 1e-4);
    const q = qNC * 1e-9;
    const Emag = (PHYS.k * q) / (er * r_m * r_m); // signed
    const V = (PHYS.k * q) / (er * r_m);
    const F = (qTestNC * 1e-9) * Emag;
    return { r_m, Emag, V, F, q };
  }, [qNC, qTestNC, er, src, probe, sizePx]);

  const setupCanvas = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, canvas } = info;
    setSizePx({ W: w, H: h });
    let raf = 0;
    let dragging: 'src' | 'probe' | null = null;
    let phase = 0;

    function getMouse(e: MouseEvent | TouchEvent): [number, number] {
      const r = canvas.getBoundingClientRect();
      const t = 'touches' in e ? e.touches[0] : e;
      if (!t) return [0, 0];
      return [t.clientX - r.left, t.clientY - r.top];
    }
    function nearest(mx: number, my: number): 'src' | 'probe' | null {
      const { src, probe } = stateRef.current;
      const d1 = Math.hypot(mx - src.x * w, my - src.y * h);
      const d2 = Math.hypot(mx - probe.x * w, my - probe.y * h);
      let best: 'src' | 'probe' | null = null, bestD = 24;
      if (d1 < bestD) { bestD = d1; best = 'src'; }
      if (d2 < bestD) { best = 'probe'; }
      return best;
    }
    function clamp01(p: number) { return Math.max(0.04, Math.min(0.96, p)); }
    function clampY(p: number) { return Math.max(0.08, Math.min(0.92, p)); }

    function onMouseDown(e: MouseEvent) {
      const [mx, my] = getMouse(e);
      dragging = nearest(mx, my);
      if (dragging) canvas.style.cursor = 'grabbing';
    }
    function onMouseMove(e: MouseEvent) {
      const [mx, my] = getMouse(e);
      if (dragging) {
        const p = { x: clamp01(mx / w), y: clampY(my / h) };
        if (dragging === 'src') setSrc(p); else setProbe(p);
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
      const p = { x: clamp01(mx / w), y: clampY(my / h) };
      if (dragging === 'src') setSrc(p); else setProbe(p);
    }
    function onTouchEnd() { dragging = null; }

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);

    function draw() {
      const { qNC, er, src, probe } = stateRef.current;
      ctx.fillStyle = '#0d0d10';
      ctx.fillRect(0, 0, w, h);

      const sx = src.x * w, sy = src.y * h;
      const q = qNC * 1e-9;
      const sgn = q >= 0 ? +1 : -1;

      // Equipotential heatmap
      const cellSize = 8;
      for (let py = 0; py < h; py += cellSize) {
        for (let px = 0; px < w; px += cellSize) {
          const dx = px - sx, dy = py - sy;
          const r_m = Math.max(Math.hypot(dx, dy) / PX_PER_M, 0.001);
          const v = (PHYS.k * q) / (er * r_m);
          const t = Math.tanh(v / 200);
          if (Math.abs(t) < 0.02) continue;
          ctx.fillStyle = t > 0
            ? `rgba(255,59,110,${Math.abs(t) * 0.10})`
            : `rgba(91,174,248,${Math.abs(t) * 0.10})`;
          ctx.fillRect(px, py, cellSize, cellSize);
        }
      }

      // Concentric distance rings (mm labels)
      const rings = [25, 50, 100, 200];
      for (const mm of rings) {
        ctx.setLineDash([3, 5]);
        ctx.strokeStyle = 'rgba(108,197,194,0.18)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(sx, sy, mm, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(108,197,194,0.45)';
        ctx.font = '9px JetBrains Mono';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(mm + ' mm', sx + mm + 4, sy);
      }

      // Radial field lines streaming from source
      phase += 0.6;
      const lines = 18;
      for (let i = 0; i < lines; i++) {
        const a = (i / lines) * Math.PI * 2;
        const path: Array<[number, number]> = [];
        for (let s = 4; s < 600; s += 6) {
          const x = sx + Math.cos(a) * s * sgn;
          const y = sy + Math.sin(a) * s * sgn;
          if (x < 0 || x > w || y < 0 || y > h) break;
          path.push([x, y]);
        }
        if (sgn < 0) path.reverse();
        if (path.length > 2) {
          ctx.strokeStyle = 'rgba(255,107,42,0.16)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(path[0][0], path[0][1]);
          for (const [x, y] of path) ctx.lineTo(x, y);
          ctx.stroke();
          const tIdx = Math.floor((phase + i * 13) % path.length);
          const t = path[tIdx];
          if (t) {
            ctx.beginPath();
            ctx.arc(t[0], t[1], 1.6, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,107,42,0.95)';
            ctx.shadowColor = 'rgba(255,107,42,.6)';
            ctx.shadowBlur = 5;
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      }

      // Probe arrow showing E direction and (log-scaled) magnitude.
      const px = probe.x * w, py = probe.y * h;
      const dxPx = px - sx, dyPx = py - sy;
      const r_m = Math.max(Math.hypot(dxPx, dyPx) / PX_PER_M, 1e-4);
      const Emag = (PHYS.k * q) / (er * r_m * r_m);
      const absE = Math.abs(Emag);
      if (absE > 0) {
        // Direction: outward from + source, inward toward - source
        const d = Math.hypot(dxPx, dyPx) || 1;
        const ux = (dxPx / d) * Math.sign(Emag);
        const uy = (dyPx / d) * Math.sign(Emag);
        const len = 22 + Math.min(140, Math.log10(absE + 1) * 22);
        drawArrow(ctx, { x: px, y: py }, { x: px + ux * len, y: py + uy * len }, {
          color: '#ff6b2a',
          lineWidth: 2.2,
          headLength: 9,
        });
      }

      // Source charge
      drawCharge(ctx, { x: sx, y: sy }, {
        color: '#ff3b6e',
        label: 'Q',
        magnitudeLabel: `= ${Math.abs(qNC).toFixed(1)} nC`,
        radius: 12 + Math.min(12, Math.abs(qNC) * 0.4),
        sign: qNC >= 0 ? '+' : '−',
        textColor: '#0a0a0b',
      });
      // Probe
      drawProbe(ctx, px, py, 'P');

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

  const dirLabel =
    computed.q > 0 ? 'radially outward' :
    computed.q < 0 ? 'radially inward' :
    '—';
  const dirColor =
    computed.q > 0 ? 'var(--pink)' :
    computed.q < 0 ? 'var(--blue)' :
    'var(--text-muted)';

  const labContent = (
    <LabGrid
      canvas={<AutoResizeCanvas height={500} setup={setupCanvas} />}
      legend={
        <>
          <LegendItem swatchColor="var(--pink)" dot>Source charge Q</LegendItem>
          <LegendItem swatchColor="var(--accent)" dot>Probe (test charge)</LegendItem>
          <LegendItem swatchColor="var(--accent)">E field lines</LegendItem>
          <LegendItem swatchColor="var(--teal)" style={{ opacity: 0.7 }}>Equipotential rings</LegendItem>
          <LegendItem style={{ marginLeft: 'auto', color: 'var(--accent)' }}>↳ Drag source or probe</LegendItem>
        </>
      }
      inputs={
        <>
          <Slider
            sym="Q" label="Source charge"
            value={qNC} min={-50} max={50} step={0.1}
            format={v => (v >= 0 ? '+' : '') + v.toFixed(1) + ' nC'}
            metaLeft="−50 nC" metaRight="+50 nC"
            onChange={setQNC}
          />
          <Slider
            sym="q<sub>t</sub>" label="Test charge"
            value={qTestNC} min={0.1} max={5} step={0.1}
            format={v => v.toFixed(1) + ' nC'}
            metaLeft="0.1 nC" metaRight="5 nC"
            onChange={setQTestNC}
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
            sym="|E|" label="Field at probe"
            valueHTML={pretty(Math.abs(computed.Emag))}
            unit="V/m"
            highlight
          />
          <Readout
            sym="Ê" label="Direction"
            value={<span style={{ color: dirColor }}>{dirLabel}</span>}
          />
          <Readout
            sym="F" label="Force on test charge"
            valueHTML={pretty(Math.abs(computed.F))}
            unit="N"
          />
          <Readout
            sym="V" label="Potential at probe"
            valueHTML={pretty(computed.V)}
            unit="V"
          />
          <Readout
            sym="r" label="Distance from source"
            value={computed.r_m.toFixed(3)}
            unit="m"
          />
        </>
      }
    />
  );

  const prose = (
    <>
      <h3>Context</h3>
      <p>
        Coulomb's law tells you what happens when two charges meet. That works fine for two charges. But what about ten? Or 10<sup>23</sup>?
        Worse: how does charge 1 even "know" where charge 2 is in order to push on it? Faraday's answer was to invent a new object — the
        <strong> electric field</strong> — and have charges talk only to the field at their own location<Cite id="feynman-II-2" in={SOURCES} />.
      </p>
      <p>
        The field formulation applies whenever there are charges in space. The simple form <strong>E = kQ/r²</strong> for a point charge
        applies under three conditions: the source is point-like (or distant enough that its extent doesn't matter); the source is static (or
        moving slowly compared to c so retardation can be ignored); and the surrounding medium is linear and isotropic (so the only correction
        is to divide by ε<sub>r</sub>). In dynamic situations — jiggling charges, antennas, radiation fields — the field still exists, but
        its form is more complex and it carries momentum and energy of its own<Cite id="griffiths-2017" in={SOURCES} />.
      </p>

      <h3>Formula</h3>
      <MathBlock>E = F / q<sub>test</sub>  &nbsp;&nbsp;and&nbsp;&nbsp;  E = k Q / (ε<sub>r</sub> r²)</MathBlock>
      <p>
        Variable glossary:
      </p>
      <ul>
        <li><strong>E</strong> — electric field magnitude at the probe location, in volts per meter (equivalently, newtons per coulomb). A vector pointing along the direction a positive test charge would feel a force.</li>
        <li><strong>F</strong> — force on a test charge placed at that point, in newtons.</li>
        <li><strong>q<sub>test</sub></strong> — the test charge, in coulombs. Taken in the limit q<sub>test</sub> → 0 to avoid disturbing the very field being measured.</li>
        <li><strong>Q</strong> — the source charge, in coulombs. Signed.</li>
        <li><strong>r</strong> — distance from the source charge to the probe, in meters.</li>
        <li><strong>k = 1/(4π ε₀) ≈ 8.99×10⁹ N·m²/C²</strong> — Coulomb's constant<Cite id="codata-2018" in={SOURCES} />.</li>
        <li><strong>ε<sub>r</sub></strong> — relative permittivity of the medium (dimensionless). 1 in vacuum.</li>
      </ul>

      <h3>Intuition</h3>
      <p>
        A charge <em>fills space with field</em>. Pick any point near a +5 nC speck of charge and ask "if I dropped a tiny positive probe
        here, which way would it fly and how hard?" That arrow, divided by the probe's charge, is <strong>E</strong>. The arrow gets weaker
        with distance, like the brightness of a star — and for exactly the same geometric reason: a sphere of radius <strong>r</strong> has
        area <strong>4πr²</strong>, so an isotropic outflow dilutes as 1/r².
      </p>
      <Pullout>
        A field assigns a force-per-unit-charge to every point in empty space. The "empty" is wrong; the space is full
        of <em>possibilities</em> — a force that would appear the moment any test charge arrived.
      </Pullout>
      <p>
        For a positive source charge, <strong>E</strong> points radially outward; for a negative source, radially inward. A positive test
        charge feels a force along <strong>E</strong>; a negative test charge feels a force opposite to it.
      </p>

      <h3>Reasoning</h3>
      <p>
        Why "force per unit charge"? Because Coulomb's law is linear in the test charge: doubling q<sub>test</sub> doubles F. Defining
        <strong> E = F/q<sub>test</sub></strong> isolates the part of the situation that <em>doesn't depend on the test charge</em> — i.e. the
        part attributable to the source and the geometry. The field is the source-and-space's contribution to the force; the test charge is what
        the field acts on.
      </p>
      <p>
        Why 1/r² and not some other power? Because the source charge has no preferred direction (spherical symmetry around an isolated point
        charge), and three-dimensional space dilutes "amount of influence" across spherical shells whose area grows as r². Any other exponent
        would violate Gauss's law<Cite id="griffiths-2017" in={SOURCES} />.
      </p>
      <p>
        Sign and direction. The vector form is <strong>E = kQ r̂ / r²</strong>, where <strong>r̂</strong> is the unit vector pointing from
        source to probe. If Q is positive, <strong>E</strong> points along <strong>r̂</strong> (outward); if negative, opposite to it (inward).
      </p>
      <p>
        Units check. N/C = (J/m)/C = (V·C/m)/C = V/m<Cite id="hyperphysics-emag" in={SOURCES} />. The duality between "field strength" (N/C)
        and "potential per length" (V/m) is built into the SI definitions, not coincidence.
      </p>
      <p>
        Limits. As r → ∞, E → 0. As r → 0, E → ∞ (the singularity is a hallmark of the point-charge idealization). Q → 0 ⇒ E → 0. The
        formula is symmetric in nothing — Q is a property of the source alone, and reversing it reverses the field everywhere.
      </p>

      <h3>Derivation</h3>
      <p>
        Start from Coulomb's law for the force on a test charge q<sub>t</sub> placed at distance r from a source charge Q:
      </p>
      <MathBlock>F = k Q q<sub>t</sub> / r²</MathBlock>
      <p>
        Define the field as the force per unit test charge in the limit q<sub>t</sub> → 0 (so the test probe doesn't reorganise the source
        distribution):
      </p>
      <MathBlock>E ≡ lim<sub>q<sub>t</sub> → 0</sub> F / q<sub>t</sub> = k Q / r²</MathBlock>
      <p>
        The factor q<sub>t</sub> divides out cleanly because Coulomb's law is linear in it. The vector form follows by carrying along the
        direction <strong>r̂</strong> from source to probe:
      </p>
      <MathBlock>E(r) = k Q r̂ / r²</MathBlock>
      <p>
        For many sources, Coulomb's law is linear in the source charges as well, so the total field is the vector sum:
      </p>
      <MathBlock>E<sub>total</sub>(r) = Σ<sub>i</sub> k Q<sub>i</sub> (r − r<sub>i</sub>) / |r − r<sub>i</sub>|³</MathBlock>
      <p>
        Superposition is the entire content of classical electrostatics: pick any charge distribution, sum (or integrate) the per-source
        contributions, get the field at every point<Cite id="griffiths-2017" in={SOURCES} />.
      </p>
      <p>
        In a dielectric medium, the source charge polarizes the surrounding molecules, whose induced dipoles produce a counter-field. The
        net macroscopic field is the original divided by ε<sub>r</sub>:
      </p>
      <MathBlock>E<sub>medium</sub> = k Q / (ε<sub>r</sub> r²)</MathBlock>

      <h3>Worked problems</h3>

      <TryIt
        tag="Problem 1.2.1"
        question={<>What is the field <strong>1 cm</strong> from an isolated <strong>+1 nC</strong> point charge in vacuum?</>}
        answer={
          <>
            <p>Plug into E = kQ/r² with Q = 10⁻⁹ C, r = 0.01 m:</p>
            <Formula>E = (8.99×10⁹)(10⁻⁹) / (0.01)² = 8.99 / 10⁻⁴ = 8.99×10⁴ V/m</Formula>
            <p>About <strong>90 kV/m</strong>, pointing radially outward. For comparison, fair-weather atmospheric field is ~100 V/m and dielectric breakdown of dry air is around 3 MV/m, so this is a real field but not yet enough to ionize the gap.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 1.2.2"
        question={<>A <strong>+2 µC</strong> test charge is placed at the location from Problem 1.2.1. What is the force on it?</>}
        answer={
          <>
            <p>Force on a charge in a field is F = qE, with the test charge feeling the source's field at its location:</p>
            <Formula>F = q<sub>test</sub> E = (2×10⁻⁶)(8.99×10⁴) ≈ 0.180 N</Formula>
            <p>About <strong>180 mN</strong>, directed outward (positive test charge in a radially-outward field). Notice we treat E as an existing property of the point in space, then ask what force any subsequent charge would feel there — this is the point of the field formalism.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 1.2.3"
        question={<>A small pith ball, modelled as a point, carries <strong>+1 nC</strong>. The ball has radius <strong>1 mm</strong>. What is the field <em>at its surface</em> (just outside)?</>}
        answer={
          <>
            <p>By the shell theorem, the field outside a uniformly charged sphere is the same as if all the charge sat at the centre. So at the surface, r = 1 mm:</p>
            <Formula>E = (8.99×10⁹)(10⁻⁹) / (10⁻³)² = 8.99×10⁶ V/m</Formula>
            <p>About <strong>9 MV/m</strong>. This <em>exceeds</em> the dielectric breakdown threshold of air (~3 MV/m) — a real 1 nC pith ball at this size would actively leak charge to the surrounding air via corona discharge<Cite id="griffiths-2017" in={SOURCES} />.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 1.2.4"
        question={<>Two equal <strong>+1 nC</strong> charges sit on the x-axis at <strong>x = ±1 cm</strong>. What is the field at the midpoint (the origin)?</>}
        answer={
          <>
            <p>By symmetry, the field from the left charge points right (+x) at the origin, and the field from the right charge points left (−x). Equal magnitudes, opposite directions — they cancel:</p>
            <Formula>E<sub>left → origin</sub> = +(8.99×10⁹)(10⁻⁹) / (0.01)² = +8.99×10⁴ V/m (along +x)</Formula>
            <Formula>E<sub>right → origin</sub> = −8.99×10⁴ V/m (along −x)</Formula>
            <p>Net field at the midpoint: <strong>E = 0</strong>. The potential V there is <em>not</em> zero, however — both charges contribute positively to V, which adds rather than cancels. This is the cleanest example of the difference between V and E we will revisit in Lab 1.4.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 1.2.5"
        question={<>A dipole: <strong>+1 nC</strong> at <strong>x = +0.5 mm</strong> and <strong>−1 nC</strong> at <strong>x = −0.5 mm</strong>. What is the field at <strong>x = 1 cm</strong> on the axis?</>}
        answer={
          <>
            <p>The +1 nC sits at distance r₊ = 1 cm − 0.5 mm = 9.5 mm from the field point; the −1 nC at r₋ = 1 cm + 0.5 mm = 10.5 mm. Both contributions lie along the +x direction (positive source pushes outward, negative source pulls toward itself):</p>
            <Formula>E<sub>+</sub> = (8.99×10⁹)(10⁻⁹) / (9.5×10⁻³)² ≈ 9.96×10⁴ V/m</Formula>
            <Formula>E<sub>−</sub> = −(8.99×10⁹)(10⁻⁹) / (10.5×10⁻³)² ≈ −8.15×10⁴ V/m</Formula>
            <Formula>E<sub>total</sub> ≈ 1.81×10⁴ V/m, along +x</Formula>
            <p>About <strong>18 kV/m</strong>. The far-field axial dipole approximation 2kp/r³ (with p = qd = 10⁻¹² C·m) gives 1.80×10⁴ V/m — excellent agreement, since 1 cm ≫ 1 mm.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 1.2.6"
        question={<>Earth's fair-weather atmospheric field is roughly <strong>100 V/m</strong> pointing downward. What is the force on a <strong>1 µC</strong> dust particle, and in which direction?</>}
        answer={
          <>
            <p>F = qE:</p>
            <Formula>F = (10⁻⁶ C)(100 V/m) = 10⁻⁴ N = 0.1 mN</Formula>
            <p>Directed <strong>downward</strong> if the dust is positively charged (force parallel to E). For a 1 µg dust grain, the gravitational force is mg ≈ (10⁻⁹ kg)(9.8) ≈ 10⁻⁸ N — the electric force is 10,000× larger. This is why fair-weather electricity easily transports charged aerosols.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 1.2.7"
        question={<>Why is the electric field <strong>inside a conductor</strong> exactly zero in electrostatic equilibrium?</>}
        answer={
          <>
            <p>A conductor has mobile charges. If there were a nonzero E inside, those charges would feel forces and move. By definition of "electrostatic equilibrium," nothing is moving. Therefore E must equal zero in the bulk<Cite id="griffiths-2017" in={SOURCES} />.</p>
            <p>The mechanism: any externally-applied field induces surface charges that rearrange until their counter-field exactly cancels the applied one inside. This is the principle behind Faraday cages and is independent of the conductor's shape — only the boundary needs to be conducting.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 1.2.8"
        question={<>Show that <strong>1 V/m</strong> and <strong>1 N/C</strong> are the same unit. What does this tell you about the relationship between field and potential?</>}
        answer={
          <>
            <p>Energy: 1 J = 1 N·m. Voltage: 1 V = 1 J/C = 1 N·m/C. Divide by length:</p>
            <Formula>1 V/m = (1 N·m/C) / m = 1 N/C</Formula>
            <p>The identity reflects that the field is the spatial derivative of the potential: <strong>E = −∇V</strong>. If V drops by 1 V across 1 m, the field strength is 1 V/m — exactly the force per unit charge that would do the work of moving the charge across that potential drop<Cite id="hyperphysics-emag" in={SOURCES} />.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 1.2.9"
        question={<>A parallel-plate capacitor with 1 cm² plates holds <strong>+1 nC</strong> on one plate and <strong>−1 nC</strong> on the other. The plates are 1 mm apart. Estimate the field between the plates, using σ/ε₀ where σ is surface charge density.</>}
        answer={
          <>
            <p>Surface charge density σ = Q/A = 10⁻⁹ C / (10⁻⁴ m²) = 10⁻⁵ C/m². For an ideal parallel-plate capacitor, the field between the plates is uniform:</p>
            <Formula>E = σ / ε₀ = (10⁻⁵) / (8.854×10⁻¹²) ≈ 1.13×10⁶ V/m</Formula>
            <p>About <strong>1.1 MV/m</strong>. The voltage across the gap is V = E·d = (1.13×10⁶)(10⁻³) ≈ 1130 V — a substantial potential for very little charge, because the plates are close together. This is the lesson of capacitance, which Lab 4.1 takes up.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 1.2.10"
        question={<>Compare the field from a <strong>−5 nC</strong> charge at 3 cm with the field from a <strong>+10 nC</strong> charge at 6 cm. Same point in space, both contributions. Are they parallel? What is the net?</>}
        answer={
          <>
            <p>Magnitude from the −5 nC at 3 cm:</p>
            <Formula>|E₁| = (8.99×10⁹)(5×10⁻⁹) / (0.03)² ≈ 4.99×10⁴ V/m</Formula>
            <p>Direction: toward the −5 nC source (radially inward, since the source is negative). Magnitude from the +10 nC at 6 cm:</p>
            <Formula>|E₂| = (8.99×10⁹)(10×10⁻⁹) / (0.06)² ≈ 2.50×10⁴ V/m</Formula>
            <p>Direction: away from the +10 nC source (radially outward). Whether they are parallel depends on the geometry of where the field point sits relative to the two sources. In the special case where the field point and both sources are colinear with the sources on the same side — say, both at +x — the two field contributions point in <em>opposite</em> directions, since toward-the-negative and away-from-the-positive are opposite. They partly cancel: net E ≈ 4.99×10⁴ − 2.50×10⁴ ≈ 2.49×10⁴ V/m, toward the −5 nC.</p>
            <p>The point of the exercise: <strong>fields add as vectors</strong>. You can't blindly sum magnitudes<Cite id="griffiths-2017" in={SOURCES} />.</p>
          </>
        }
      />

      <h3>Field lines are a visualization</h3>
      <p>
        The streaming orange lines in the visualization above are a representation, not a physical entity. Faraday drew them this way because the
        geometry was clear: density of lines indicates field strength; direction of lines indicates field direction. They begin on positive
        charges and end on negative charges (or run off to infinity), and they never cross — two distinct directions for <strong>E</strong> at
        one point would be meaningless<Cite id="feynman-II-2" in={SOURCES} />. The real field is a continuous vector at every point.
      </p>
    </>
  );

  return (
    <LabShell
      slug={SLUG}
      labSubtitle="Single-Charge Field Map"
      labId="efield-1.2 / E = kQ/r²"
      labContent={labContent}
      prose={prose}
    />
  );
}

function drawProbe(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, label: string,
) {
  ctx.strokeStyle = '#ff6b2a';
  ctx.lineWidth = 2;
  ctx.fillStyle = 'rgba(10,10,11,.92)';
  ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#ff6b2a';
  ctx.font = 'bold 11px JetBrains Mono';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, cx, cy);
}
