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
import { LabGrid, LegendItem } from '@/components/LabLayout';
import { LabShell } from '@/components/LabShell';
import { MathBlock, Pullout } from '@/components/Prose';
import { Readout } from '@/components/Readout';
import { Cite } from '@/components/SourcesList';
import { Slider } from '@/components/Slider';
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
      <h3>The intuition first</h3>
      <p>
        Two static charges. Same sign repel; opposite attract. The strength falls off as the square of distance:
        double <strong>r</strong>, force quarters. Why squared and not linear or cubed? Geometric.
        The surface area of a sphere scales as <strong>r²</strong>; the "amount of influence" gets diluted across that area.
      </p>
      <Pullout>
        The inverse-square law is not a fact about charge. It is a fact about space being three-dimensional.
      </Pullout>

      <h3>The math, in stages</h3>
      <p>
        Coulomb measured this in 1785 with a torsion balance so delicate it could resolve the twist of a silk thread<Cite id="coulomb-1785" in={SOURCES} />.
        The modern form is
      </p>
      <MathBlock>F = k Q₁ Q₂ / r²</MathBlock>
      <p>
        with <strong>k = 1/(4π ε₀) ≈ 8.99×10⁹ N·m²/C²</strong>. That constant is large. Two coulombs of charge separated by one meter would push
        each other apart with <strong>~9×10⁹ N</strong> — roughly a billion kilograms' weight. Nothing in daily life shows this because
        ordinary matter is exquisitely charge-neutral: the fractional excess of free charge needed to make a noticeable force is tiny.
      </p>

      <h3>Why this form</h3>
      <p>
        Reciprocity (Newton's third law) demands the formula be symmetric in <strong>Q₁</strong> and <strong>Q₂</strong>.
        That the exponent is exactly <strong>2</strong> is empirical — and tested to extraordinary precision. Cavendish's 1773
        experiment bounded the exponent to within ±0.02<Cite id="cavendish-1773" in={SOURCES} />. A century-and-a-half later, Williams,
        Faller, and Hill (1971) pushed that bound to roughly <strong>2 ± 2×10⁻¹⁶</strong> — one of the most precisely confirmed power laws
        in all of physics<Cite id="williams-faller-hill-1971" in={SOURCES} />.
      </p>
      <p>
        The connection to <em>Gauss's law</em> (Lab 1.3) is closer than the algebra suggests. Demanding that the
        integrated flux of <strong>E</strong> through any closed surface depends only on enclosed charge forces the field
        of a point charge to fall as <strong>1/r²</strong>. The two laws are equivalent for static charges<Cite id="griffiths-2017" in={SOURCES} />.
      </p>

      <h3>Compared to gravity</h3>
      <p>
        Same algebraic shape, vastly different scale. For two electrons separated by any distance the ratio of electric to gravitational force is
      </p>
      <MathBlock>F<sub>e</sub> / F<sub>g</sub> = k e² / (G m<sub>e</sub>²) ≈ 4.17×10⁴²</MathBlock>
      <p>
        Four hundred trillion trillion trillion. The reason structures hold together at all — chairs, planets, you — is the exact charge neutrality of matter,
        not the weakness of electromagnetism<Cite id="griffiths-2017" in={SOURCES} />.
      </p>

      <h4>What ε<sub>r</sub> does</h4>
      <p>
        In a polarizable medium, bound charges align with the field and produce a counter-field that reduces the net E. The result is to divide
        Coulomb's force by the medium's relative permittivity <strong>ε<sub>r</sub></strong>. Water at room temperature has ε<sub>r</sub> ≈ 80, which is why dissolved
        ions move freely in solution: they barely repel each other compared to in air. Crank the slider up and watch <strong>F</strong> collapse.
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
