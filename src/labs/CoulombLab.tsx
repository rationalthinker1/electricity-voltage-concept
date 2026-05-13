/**
 * Lab 1.1 — Coulomb's Law
 *
 *   F = k Q₁ Q₂ / (εᵣ · r²)
 *
 * Two point charges on a 2D canvas. Drag either charge to change the
 * geometry; sliders re-anchor them at the chosen separation. Force vectors
 * on each charge update live. The historical Cavendish (1773) and
 * Williams–Faller–Hill (1971) bounds on the exponent are cited in prose.
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
import { PHYS, pretty, sci } from '@/lib/physics';
import { BASE_LAB_SOURCES } from '@/labs/data/manifest';

const SLUG = 'coulomb';
const SOURCES = BASE_LAB_SOURCES[SLUG]!;

export default function CoulombLab() {
  // State: charges in nC, separation in meters, εr unitless.
  const [q1nC, setQ1nC] = useState(+5);
  const [q2nC, setQ2nC] = useState(-5);
  const [rMeters, setRMeters] = useState(0.10);
  const [er, setEr] = useState(1.0);

  // Charge positions in normalized canvas coords [0..1].
  // They get re-anchored by the r slider but can be dragged.
  const [p1, setP1] = useState({ x: 0.30, y: 0.5 });
  const [p2, setP2] = useState({ x: 0.70, y: 0.5 });

  // Refs so the canvas draw loop sees current state without re-running setup.
  const stateRef = useRef({ q1nC, q2nC, rMeters, er, p1, p2 });
  useEffect(() => {
    stateRef.current = { q1nC, q2nC, rMeters, er, p1, p2 };
  }, [q1nC, q2nC, rMeters, er, p1, p2]);

  // Computed physics — values displayed in readouts.
  const computed = useMemo(() => {
    const q1 = q1nC * 1e-9;
    const q2 = q2nC * 1e-9;
    const F = (PHYS.k * q1 * q2) / (er * rMeters * rMeters);  // signed
    const U = (PHYS.k * q1 * q2) / (er * rMeters);
    // Magnitude ratio: |F_electric| vs |F_grav| between two electrons,
    //   F_e / F_g = k·e²/(G·m_e²) ≈ 4.17×10⁴² (Griffiths §1.1, p.4)
    const F_e_over_F_g = (PHYS.k * PHYS.e ** 2) / (PHYS.G * PHYS.me ** 2);
    const sign =
      q1 === 0 || q2 === 0 ? 'zero' :
      Math.sign(q1) === Math.sign(q2) ? 'repulsive' : 'attractive';
    return { F, U, sign, F_e_over_F_g };
  }, [q1nC, q2nC, rMeters, er]);

  // Canvas setup — runs once on mount + on resize. Reads state via stateRef.
  const setupCanvas = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, canvas } = info;
    let raf = 0;
    let dragging: 'p1' | 'p2' | null = null;

    function getMouse(e: MouseEvent | TouchEvent): [number, number] {
      const r = canvas.getBoundingClientRect();
      const t = 'touches' in e ? e.touches[0] : e;
      if (!t) return [0, 0];
      return [t.clientX - r.left, t.clientY - r.top];
    }
    function nearest(mx: number, my: number): 'p1' | 'p2' | null {
      const { p1, p2 } = stateRef.current;
      const d1 = Math.hypot(mx - p1.x * w, my - p1.y * h);
      const d2 = Math.hypot(mx - p2.x * w, my - p2.y * h);
      if (d1 < 24 && d1 < d2) return 'p1';
      if (d2 < 24) return 'p2';
      return null;
    }

    function onMouseDown(e: MouseEvent) {
      const [mx, my] = getMouse(e);
      dragging = nearest(mx, my);
      if (dragging) canvas.style.cursor = 'grabbing';
    }
    function onMouseMove(e: MouseEvent) {
      const [mx, my] = getMouse(e);
      if (dragging) {
        const newPos = {
          x: Math.max(0.06, Math.min(0.94, mx / w)),
          y: Math.max(0.10, Math.min(0.90, my / h)),
        };
        if (dragging === 'p1') setP1(newPos); else setP2(newPos);
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
      const newPos = {
        x: Math.max(0.06, Math.min(0.94, mx / w)),
        y: Math.max(0.10, Math.min(0.90, my / h)),
      };
      if (dragging === 'p1') setP1(newPos); else setP2(newPos);
    }
    function onTouchEnd() { dragging = null; }

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);

    function draw() {
      const { q1nC, q2nC, p1, p2 } = stateRef.current;
      const q1 = q1nC * 1e-9, q2 = q2nC * 1e-9;
      const x1 = p1.x * w, y1 = p1.y * h;
      const x2 = p2.x * w, y2 = p2.y * h;

      ctx.fillStyle = '#0d0d10';
      ctx.fillRect(0, 0, w, h);

      // Dashed distance line + r label
      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      ctx.setLineDash([]);

      // Force vectors
      const dx = x2 - x1, dy = y2 - y1;
      const d = Math.hypot(dx, dy) || 1;
      const ux = dx / d, uy = dy / d;
      const F = (PHYS.k * q1 * q2) / (stateRef.current.er * stateRef.current.rMeters ** 2);
      // Arrow length: log-scale so it stays readable across many orders of magnitude
      const arrowLen = Math.min(140, 26 + Math.log10(Math.abs(F) + 1) * 14);
      // Sign convention: q1 q2 > 0 → repulsive → arrow on q1 points away from q2
      const sign = q1 * q2;
      const dir1x = sign >= 0 ? -ux : ux;
      const dir1y = sign >= 0 ? -uy : uy;
      const dir2x = -dir1x, dir2y = -dir1y;

      function drawArrow(fromX: number, fromY: number, vx: number, vy: number, length: number) {
        const tipX = fromX + vx * length;
        const tipY = fromY + vy * length;
        ctx.strokeStyle = 'rgba(255,107,42,0.95)';
        ctx.fillStyle = 'rgba(255,107,42,0.95)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(fromX + vx * 18, fromY + vy * 18); // start just outside charge
        ctx.lineTo(tipX, tipY);
        ctx.stroke();
        // arrowhead
        const a = Math.atan2(vy, vx);
        ctx.beginPath();
        ctx.moveTo(tipX, tipY);
        ctx.lineTo(tipX - 8 * Math.cos(a - 0.4), tipY - 8 * Math.sin(a - 0.4));
        ctx.lineTo(tipX - 8 * Math.cos(a + 0.4), tipY - 8 * Math.sin(a + 0.4));
        ctx.closePath();
        ctx.fill();
      }

      if (Math.abs(F) > 1e-30) {
        drawArrow(x1, y1, dir1x, dir1y, arrowLen);
        drawArrow(x2, y2, dir2x, dir2y, arrowLen);
      }

      // r-label in the middle of the line
      const mxLabel = (x1 + x2) / 2;
      const myLabel = (y1 + y2) / 2 - 12;
      ctx.fillStyle = 'rgba(160,158,149,0.9)';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      const rNow = stateRef.current.rMeters;
      const rLabel = rNow >= 1 ? `${rNow.toFixed(2)} m` : `${(rNow * 1000).toFixed(0)} mm`;
      ctx.fillText(`r = ${rLabel}`, mxLabel, myLabel);

      // Draw charges
      drawCharge(ctx, x1, y1, '#ff3b6e', q1nC, 'Q₁');
      drawCharge(ctx, x2, y2, '#5baef8', q2nC, 'Q₂');

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

  // Re-anchor charges horizontally when r slider changes (preserve angle).
  useEffect(() => {
    // Keep the midpoint and angle, just scale the spread to match rMeters.
    // 1 m = 0.4 normalized half-width (so r=1m fills most of canvas at 0.5).
    const normHalfWidth = Math.max(0.04, Math.min(0.45, rMeters * 0.4));
    const mx = (p1.x + p2.x) / 2;
    const my = (p1.y + p2.y) / 2;
    const ang = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    setP1({ x: mx - Math.cos(ang) * normHalfWidth, y: my - Math.sin(ang) * normHalfWidth });
    setP2({ x: mx + Math.cos(ang) * normHalfWidth, y: my + Math.sin(ang) * normHalfWidth });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rMeters]);

  const labContent = (
    <LabGrid
      canvas={<AutoResizeCanvas height={460} setup={setupCanvas} />}
      legend={
        <>
          <LegendItem swatchColor="var(--pink)" dot>Charge Q₁</LegendItem>
          <LegendItem swatchColor="var(--blue)" dot>Charge Q₂</LegendItem>
          <LegendItem swatchColor="var(--accent)">Force vector</LegendItem>
          <LegendItem style={{ marginLeft: 'auto', color: 'var(--accent)' }}>↳ Drag either charge</LegendItem>
        </>
      }
      inputs={
        <>
          <Slider
            sym="Q₁" label="Charge 1"
            value={q1nC} min={-10} max={10} step={0.1}
            format={v => (v >= 0 ? '+' : '') + v.toFixed(1) + ' nC'}
            metaLeft="−10 nC" metaRight="+10 nC"
            onChange={setQ1nC}
          />
          <Slider
            sym="Q₂" label="Charge 2"
            value={q2nC} min={-10} max={10} step={0.1}
            format={v => (v >= 0 ? '+' : '') + v.toFixed(1) + ' nC'}
            metaLeft="−10 nC" metaRight="+10 nC"
            onChange={setQ2nC}
          />
          <Slider
            sym="r" label="Separation"
            value={rMeters} min={0.01} max={1.0} step={0.005}
            format={v => v >= 1 ? v.toFixed(3) + ' m' : (v * 1000).toFixed(0) + ' mm'}
            metaLeft="10 mm" metaRight="1.0 m"
            onChange={setRMeters}
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
            sym="F" label="Coulomb force"
            valueHTML={pretty(Math.abs(computed.F))}
            unit="N"
            highlight
          />
          <Readout sym="±" label="Sign" value={
            computed.sign === 'attractive' ? 'Attractive' :
            computed.sign === 'repulsive'  ? 'Repulsive' :
            'Zero'
          } />
          <Readout sym="U" label="Potential energy" valueHTML={pretty(computed.U)} unit="J" />
          <Readout
            sym="F<sub>e</sub>/F<sub>g</sub>"
            label="vs. gravity (two electrons)"
            valueHTML={sci(computed.F_e_over_F_g, 2)}
            unit="×"
          />
          <Readout sym="r" label="Separation" value={`${rMeters.toFixed(3)}`} unit="m" />
        </>
      }
    />
  );

  const prose = (
    <>
      <h3>Context</h3>
      <p>
        Coulomb's law is the foundational equation of electrostatics: the force between two stationary point charges, in vacuum, at
        whatever separation. Established empirically by Coulomb in 1785 with a torsion balance so delicate it could resolve the twist of a
        silk thread<Cite id="coulomb-1785" in={SOURCES} />. It holds across every length scale that has ever been tested — from interatomic
        distances of order 10⁻¹⁰ m up to the laboratory scale, with the inverse-square exponent confirmed to about <strong>2 ± 2×10⁻¹⁶</strong> by
        Williams, Faller and Hill in 1971<Cite id="williams-faller-hill-1971" in={SOURCES} />.
      </p>
      <p>
        It applies whenever the charges are <em>static</em> (or moving slowly enough that retardation effects can be ignored) and can be
        treated as <em>point-like</em>. Real charged objects of finite size that are close together violate it: the field of an extended
        distribution is only approximately <em>kQ/r²</em> near the surface. The other invalid regime is the dynamic one — accelerating
        charges radiate, and the instantaneous-action form of Coulomb's law breaks down in favour of the retarded fields of full
        electrodynamics<Cite id="griffiths-2017" in={SOURCES} />.
      </p>

      <h3>Formula</h3>
      <MathBlock>F = k Q₁ Q₂ / (ε<sub>r</sub> r²)</MathBlock>
      <p>
        Variable glossary:
      </p>
      <ul>
        <li><strong>F</strong> — magnitude of the electrostatic force on either charge, in newtons. Positive product Q₁Q₂ ⇒ repulsion; negative ⇒ attraction.</li>
        <li><strong>Q₁, Q₂</strong> — the two point charges, in coulombs. Signed.</li>
        <li><strong>r</strong> — the centre-to-centre separation between them, in meters.</li>
        <li><strong>k = 1/(4π ε₀) ≈ 8.99×10⁹ N·m²/C²</strong> — Coulomb's constant<Cite id="codata-2018" in={SOURCES} />.</li>
        <li><strong>ε<sub>r</sub></strong> — relative permittivity of the medium (dimensionless). 1 in vacuum, ≈1.0006 in air, ≈80 in water at room temperature.</li>
      </ul>

      <h3>Intuition</h3>
      <p>
        Two static charges. Same sign repel; opposite attract. The strength falls off as the square of distance: double <strong>r</strong>,
        force quarters. Why squared and not linear or cubed? Geometric. The surface area of a sphere scales as <strong>r²</strong>; the
        "amount of influence" the source charge sends outward gets diluted across that area. Three-dimensional space punishes distance
        quadratically.
      </p>
      <Pullout>
        The inverse-square law is not a fact about charge. It is a fact about space being three-dimensional.
      </Pullout>
      <p>
        The constant <strong>k</strong> is large — by everyday standards, enormous. Two coulombs of charge separated by one meter would push
        each other apart with <strong>~9×10⁹ N</strong>, roughly a billion kilograms' weight. Nothing in daily life shows this because
        ordinary matter is exquisitely charge-neutral: the fractional excess of free charge needed to make a noticeable force is tiny.
      </p>

      <h3>Reasoning</h3>
      <p>
        Reciprocity (Newton's third law) demands the formula be symmetric in <strong>Q₁</strong> and <strong>Q₂</strong>: each charge feels
        an equal and opposite force from the other. The product <strong>Q₁Q₂</strong> carries the sign convention for free — like signs make
        the product positive (repulsion), unlike signs negative (attraction).
      </p>
      <p>
        That the exponent is exactly <strong>2</strong> is empirical, but tied to the geometry of three-dimensional space: a sphere of radius
        <strong> r</strong> has area <strong>4πr²</strong>, so a quantity radiated isotropically from a point dilutes as <strong>1/r²</strong>.
        Cavendish's 1773 experiment bounded the exponent to within ±0.02<Cite id="cavendish-1773" in={SOURCES} />; Williams–Faller–Hill (1971)
        pushed that bound to <strong>2 ± 2×10⁻¹⁶</strong><Cite id="williams-faller-hill-1971" in={SOURCES} />.
      </p>
      <p>
        Limits and sanity checks: as <strong>r → ∞</strong>, <strong>F → 0</strong> — distant charges decouple. As <strong>r → 0</strong>,
        <strong> F → ∞</strong> — the singularity is a sign that point charges are an idealization; real particles either have finite
        extent or require a quantum treatment. Setting either charge to zero kills the force, as it must. Doubling either charge doubles the
        force; doubling both quadruples it.
      </p>

      <h3>Derivation</h3>
      <p>
        Coulomb worked from a torsion balance: a horizontal bar suspended by a fine wire, with a charged sphere at one end. A second charged
        sphere brought to a fixed distance produced a twist proportional to the force<Cite id="coulomb-1785" in={SOURCES} />. By varying the
        distance and reading the angle, he found the force to fall as <strong>1/r²</strong>. By varying the magnitudes (charging one sphere,
        then sharing charge with an identical uncharged one to halve it), he found the force proportional to each charge.
      </p>
      <p>
        Cavendish had used a different argument a decade earlier: a charged conducting sphere has no field inside it, and the only inverse-power
        force that produces this null result is exactly <strong>1/r²</strong><Cite id="cavendish-1773" in={SOURCES} />. Either route — direct
        measurement or the null test — converges on the same law.
      </p>
      <p>
        The modern derivation goes the other way. Postulate Gauss's law, <strong>∮ E·dA = Q/ε₀</strong>, plus the requirement that the field of an
        isolated point charge be spherically symmetric. Then for any sphere of radius <strong>r</strong> centred on the charge, the field is uniform
        on the surface and the flux integral collapses:
      </p>
      <MathBlock>E · 4πr² = Q / ε₀ &nbsp;⇒&nbsp; E = Q / (4π ε₀ r²) = k Q / r²</MathBlock>
      <p>
        The force on a second charge <strong>Q₂</strong> placed in that field is <strong>F = Q₂ E = kQ₁Q₂/r²</strong><Cite id="griffiths-2017" in={SOURCES} />.
        In a dielectric medium, bound charges polarize and partially screen the field, dividing the result by ε<sub>r</sub>.
      </p>
      <p>
        Compared to gravity: same algebraic shape, vastly different scale. For two electrons at any distance,
      </p>
      <MathBlock>F<sub>e</sub> / F<sub>g</sub> = k e² / (G m<sub>e</sub>²) ≈ 4.17×10⁴²</MathBlock>
      <p>
        Four hundred trillion trillion trillion. The reason chairs and planets and bodies hold together at all is the exact charge neutrality
        of matter, not the weakness of electromagnetism<Cite id="griffiths-2017" in={SOURCES} />.
      </p>

      <h3>Worked problems</h3>

      <TryIt
        tag="Problem 1.1.1"
        question={<>Two charges of <strong>+1 nC</strong> each sit <strong>1 mm</strong> apart in vacuum. What is the force between them?</>}
        answer={
          <>
            <p>Plug into Coulomb's law with Q₁ = Q₂ = 1×10⁻⁹ C, r = 1×10⁻³ m, ε<sub>r</sub> = 1:</p>
            <Formula>F = k Q₁ Q₂ / r² = (8.99×10⁹)(10⁻⁹)(10⁻⁹) / (10⁻³)²</Formula>
            <Formula>F = (8.99×10⁻⁹) / (10⁻⁶) = 8.99×10⁻³ N</Formula>
            <p>Roughly <strong>9 mN</strong>, repulsive. About the weight of a grain of rice — for two charges that, by everyday standards, are vanishingly small. The inverse-square geometry, plus the size of <strong>k</strong>, conspires to make even nanocoulombs noticeable when they sit a millimeter apart.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 1.1.2"
        question={<>Take the same two charges from Problem 1.1.1. By what factor does the force change if you double the separation to <strong>2 mm</strong>?</>}
        answer={
          <>
            <p>F scales as 1/r². Doubling r multiplies r² by 4, so F shrinks by a factor of 4:</p>
            <Formula>F(2 mm) / F(1 mm) = (1 mm / 2 mm)² = 1/4</Formula>
            <p>F = (8.99×10⁻³ N)/4 ≈ <strong>2.25×10⁻³ N</strong>. The inverse-square punishes distance hard: tripling r would have cut F by 9, quadrupling by 16.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 1.1.3"
        question={<>Two electrons sit <strong>1 Å</strong> (10⁻¹⁰ m) apart — roughly an interatomic spacing. Compute the electrostatic force, and the gravitational force, and their ratio.</>}
        answer={
          <>
            <p>Electron charge e = 1.602×10⁻¹⁹ C, mass mₑ = 9.109×10⁻³¹ kg, G = 6.674×10⁻¹¹ N·m²/kg²<Cite id="codata-2018" in={SOURCES} />. Electrostatic:</p>
            <Formula>F<sub>e</sub> = k e² / r² = (8.99×10⁹)(1.602×10⁻¹⁹)² / (10⁻¹⁰)²</Formula>
            <Formula>F<sub>e</sub> = (8.99×10⁹)(2.566×10⁻³⁸) / 10⁻²⁰ ≈ 2.31×10⁻⁸ N</Formula>
            <p>Gravitational:</p>
            <Formula>F<sub>g</sub> = G m<sub>e</sub>² / r² = (6.674×10⁻¹¹)(9.109×10⁻³¹)² / 10⁻²⁰ ≈ 5.54×10⁻⁵¹ N</Formula>
            <p>Ratio: <strong>F<sub>e</sub>/F<sub>g</sub> ≈ 4.17×10⁴²</strong>. The ratio is independent of r — both forces fall as 1/r² — and it is the same enormous number that the lab readout displays<Cite id="griffiths-2017" in={SOURCES} />.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 1.1.4"
        question={<>A charge of <strong>+1 µC</strong> and a charge of <strong>−2 µC</strong> sit <strong>5 cm</strong> apart in air. What is the force, and is it attractive or repulsive?</>}
        answer={
          <>
            <p>Treat air as vacuum (ε<sub>r</sub> ≈ 1.0006, negligible here). With Q₁ = 10⁻⁶ C, Q₂ = −2×10⁻⁶ C, r = 0.05 m:</p>
            <Formula>F = k Q₁ Q₂ / r² = (8.99×10⁹)(10⁻⁶)(−2×10⁻⁶) / (0.05)²</Formula>
            <Formula>F = (−1.798×10⁻²) / (2.5×10⁻³) ≈ −7.19 N</Formula>
            <p>Magnitude: <strong>~7.2 N</strong> (about the weight of a 0.7 kg apple). The negative sign confirms it is <strong>attractive</strong> — opposite signs pull together.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 1.1.5"
        question={<>Repeat Problem 1.1.4 with the same two charges and the same separation, but immerse them in <strong>water</strong> (ε<sub>r</sub> ≈ 80). What is the new force?</>}
        answer={
          <>
            <p>The medium divides Coulomb's force by ε<sub>r</sub>:</p>
            <Formula>F<sub>water</sub> = F<sub>vacuum</sub> / ε<sub>r</sub> = 7.19 N / 80 ≈ 8.99×10⁻² N</Formula>
            <p>About <strong>90 mN</strong>, still attractive. Water's bound dipoles align with the field and largely cancel it. This is exactly why ionic salts dissolve in water: the cohesive electrostatic forces between Na⁺ and Cl⁻ are reduced by a factor of 80, easily overcome by thermal motion<Cite id="griffiths-2017" in={SOURCES} />.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 1.1.6"
        question={<>You triple <strong>Q₁</strong> and halve <strong>r</strong>. By what factor does the force change?</>}
        answer={
          <>
            <p>F is linear in each charge and goes as 1/r². Tripling Q₁ multiplies F by 3; halving r multiplies r² by 1/4, so 1/r² multiplies by 4. Net:</p>
            <Formula>F<sub>new</sub> / F<sub>old</sub> = 3 × 4 = 12</Formula>
            <p>F increases by a factor of <strong>12</strong>. Sliding both knobs at once compounds quickly.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 1.1.7"
        question={<>Two charges in vacuum experience a force of <strong>100 N</strong> at <strong>1 m</strong>. At what distance would the force drop to <strong>25 N</strong>?</>}
        answer={
          <>
            <p>Hold Q₁Q₂ fixed and require F to fall by a factor of 4. Since F ∝ 1/r², r must grow by a factor of √4 = 2:</p>
            <Formula>F₁ / F₂ = r₂² / r₁²  ⇒  r₂ = r₁ √(F₁/F₂) = (1 m) √(100/25) = 2 m</Formula>
            <p>At <strong>r = 2 m</strong> the force is 25 N. Quartering F means doubling r — the inverse-square law's signature.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 1.1.8"
        question={<>A hydrogen atom: a proton and an electron <strong>0.529 Å</strong> apart (the Bohr radius). Compute the electrostatic force.</>}
        answer={
          <>
            <p>With q<sub>p</sub> = +e, q<sub>e</sub> = −e, r = 5.29×10⁻¹¹ m:</p>
            <Formula>F = k e² / r² = (8.99×10⁹)(1.602×10⁻¹⁹)² / (5.29×10⁻¹¹)²</Formula>
            <Formula>F = (2.307×10⁻²⁸) / (2.80×10⁻²¹) ≈ 8.24×10⁻⁸ N</Formula>
            <p>About <strong>82 nN</strong> of attraction. That is the binding force of a single hydrogen atom. Multiply by Avogadro's number per mole and you see why chemistry has the energy density it does<Cite id="griffiths-2017" in={SOURCES} />.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 1.1.9"
        question={<>Three charges sit on a line, equally spaced 1 cm apart: <strong>+1 nC</strong> at x = 0, <strong>+1 nC</strong> at x = 1 cm, <strong>+1 nC</strong> at x = 2 cm. What is the net force on the middle charge?</>}
        answer={
          <>
            <p>Superposition: the middle charge feels two forces, equal in magnitude (same charges, same distance) and opposite in direction (one from the left pushing right, one from the right pushing left). They cancel:</p>
            <Formula>F<sub>left → mid</sub> = +k(10⁻⁹)(10⁻⁹)/(0.01)² = +8.99×10⁻⁵ N (rightward)</Formula>
            <Formula>F<sub>right → mid</sub> = −8.99×10⁻⁵ N (leftward)</Formula>
            <p>Net force on the middle charge: <strong>zero</strong>. Note the outer two charges do <em>not</em> have zero net force — symmetry only protects the middle one.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 1.1.10"
        question={<>Write Coulomb's law in Gaussian (cgs-esu) units, where <strong>F = q₁q₂/r²</strong> with no explicit constant. What is the value of "Coulomb's constant" in this unit system, and why?</>}
        answer={
          <>
            <p>In Gaussian units, the constant is absorbed into the definition of charge itself. The unit of charge (the statcoulomb, or esu) is chosen so that two unit charges at 1 cm separation exert a force of exactly 1 dyne. Then:</p>
            <Formula>F (dyne) = q₁ q₂ (esu²) / r² (cm²),  k = 1</Formula>
            <p>So <strong>k = 1</strong> in Gaussian units, dimensionless. The price is that ε₀ disappears from Coulomb's law but reappears (as 4π) elsewhere in Maxwell's equations. Jackson covers both systems and the conversions between them<Cite id="griffiths-2017" in={SOURCES} />.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 1.1.11"
        question={<>Why doesn't <strong>F = kQ₁Q₂/r²</strong> hold for two charged metal spheres of finite radius when they are brought very close together? Be specific about what fails.</>}
        answer={
          <>
            <p>Two effects break the point-charge approximation. First, <em>induced polarization</em>: each sphere's charge redistributes in response to the other's field, so the centroids of charge no longer sit at the geometric centres — they shift toward each other (for opposite signs) or away (for same signs). Second, <em>multipole structure</em>: even a uniformly charged sphere acts like a point charge only at distances large compared to its radius; close in, higher-order moments (induced by the neighbour) contribute<Cite id="griffiths-2017" in={SOURCES} />.</p>
            <p>The shell theorem (a uniformly charged sphere produces the same external field as a point charge at its centre) is exact only for <em>fixed</em> uniform charge — i.e. on an insulator. For two conductors, the redistribution is unavoidable, and the actual force at small separations is <em>greater</em> than the naive Coulomb prediction.</p>
          </>
        }
      />

      <h3>Why ε<sub>r</sub> matters in practice</h3>
      <p>
        In a polarizable medium, bound charges align with the field and produce a counter-field that reduces the net E. The result is to divide
        Coulomb's force by the medium's relative permittivity <strong>ε<sub>r</sub></strong>. Water at room temperature has ε<sub>r</sub> ≈ 80,
        which is why dissolved ions move freely in solution: they barely repel each other compared to in air. Crank the slider up and watch
        <strong> F</strong> collapse.
      </p>
    </>
  );

  return (
    <LabShell
      slug={SLUG}
      labSubtitle="Two Point Charges"
      labId="coulomb-1.1 / F = kQ₁Q₂/r²"
      labContent={labContent}
      prose={prose}
    />
  );
}

function drawCharge(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  color: string,
  qNC: number,
  label: string,
) {
  const radius = 12 + Math.min(10, Math.abs(qNC) * 0.9);
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
  ctx.fillText(qNC >= 0 ? '+' : '−', cx, cy);
  ctx.fillStyle = color;
  ctx.font = '10px JetBrains Mono';
  ctx.fillText(label, cx, cy + radius + 14);
}
