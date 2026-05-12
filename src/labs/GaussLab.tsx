/**
 * Lab 1.3 — Gauss's Law
 *
 *   ∮ E · dA = Q_enc / ε₀
 *
 * Drag a point charge in/out of a fixed Gaussian sphere; the line-counter
 * tallies outward and inward field-line crossings. Net crossings collapse
 * to zero when the charge moves outside.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { LabGrid, LegendItem } from '@/components/LabLayout';
import { LabShell } from '@/components/LabShell';
import { MathBlock, Pullout } from '@/components/Prose';
import { Readout } from '@/components/Readout';
import { Cite } from '@/components/SourcesList';
import { Slider } from '@/components/Slider';
import { PHYS, pretty } from '@/lib/physics';
import { BASE_LAB_SOURCES } from '@/labs/data/manifest';

const SLUG = 'gauss';
const SOURCES = BASE_LAB_SOURCES[SLUG]!;

export default function GaussLab() {
  const [qNC, setQNC] = useState(+5);
  const [R_mm, setR_mm] = useState(80);
  const [qpos_mm, setQpos_mm] = useState(0);

  const stateRef = useRef({ qNC, R_mm, qpos_mm });
  useEffect(() => { stateRef.current = { qNC, R_mm, qpos_mm }; }, [qNC, R_mm, qpos_mm]);

  // Physics readouts. flux = Q_enc / ε₀ when inside, 0 otherwise.
  const computed = useMemo(() => {
    const inside = Math.abs(qpos_mm) < R_mm;
    const Qenc = inside ? qNC * 1e-9 : 0;
    const flux = inside ? (qNC * 1e-9) / PHYS.eps_0 : 0;
    const R_m = R_mm * 1e-3;
    const A = 4 * Math.PI * R_m * R_m;
    const Esurf_centered = (PHYS.k * Math.abs(qNC) * 1e-9) / (R_m * R_m);
    return { inside, Qenc, flux, A, Esurf_centered };
  }, [qNC, R_mm, qpos_mm]);

  const setupCanvas = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, canvas } = info;
    let raf = 0;
    let dragging: 'charge' | 'edge' | null = null;
    let phase = 0;

    function center() { return { cx: w / 2, cy: h / 2 }; }
    function chargePx() {
      const { cx, cy } = center();
      return { x: cx + stateRef.current.qpos_mm, y: cy };
    }

    function getMouse(e: MouseEvent | TouchEvent): [number, number] {
      const r = canvas.getBoundingClientRect();
      const t = 'touches' in e ? e.touches[0] : e;
      if (!t) return [0, 0];
      return [t.clientX - r.left, t.clientY - r.top];
    }
    function hitTest(mx: number, my: number): 'charge' | 'edge' | null {
      const { cx, cy } = center();
      const qp = chargePx();
      if (Math.hypot(mx - qp.x, my - qp.y) < 24) return 'charge';
      const d = Math.hypot(mx - cx, my - cy);
      if (Math.abs(d - stateRef.current.R_mm) < 12) return 'edge';
      return null;
    }
    function onMouseDown(e: MouseEvent) {
      const [mx, my] = getMouse(e);
      dragging = hitTest(mx, my);
      if (dragging) canvas.style.cursor = 'grabbing';
    }
    function onMouseMove(e: MouseEvent) {
      const [mx, my] = getMouse(e);
      if (dragging === 'charge') {
        const { cx } = center();
        setQpos_mm(Math.max(-200, Math.min(200, Math.round(mx - cx))));
      } else if (dragging === 'edge') {
        const { cx, cy } = center();
        const d = Math.hypot(mx - cx, my - cy);
        setR_mm(Math.max(10, Math.min(250, Math.round(d))));
      } else {
        canvas.style.cursor = hitTest(mx, my) ? 'grab' : 'default';
      }
    }
    function onMouseUp() { dragging = null; canvas.style.cursor = 'default'; }
    function onTouchStart(e: TouchEvent) {
      e.preventDefault();
      const [mx, my] = getMouse(e);
      dragging = hitTest(mx, my);
    }
    function onTouchMove(e: TouchEvent) {
      e.preventDefault();
      if (!dragging) return;
      const [mx, my] = getMouse(e);
      if (dragging === 'charge') {
        const { cx } = center();
        setQpos_mm(Math.max(-200, Math.min(200, Math.round(mx - cx))));
      } else if (dragging === 'edge') {
        const { cx, cy } = center();
        const d = Math.hypot(mx - cx, my - cy);
        setR_mm(Math.max(10, Math.min(250, Math.round(d))));
      }
    }
    function onTouchEnd() { dragging = null; }

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);

    function draw() {
      const { qNC, R_mm, qpos_mm } = stateRef.current;
      ctx.fillStyle = '#0d0d10';
      ctx.fillRect(0, 0, w, h);

      // Faint grid
      ctx.strokeStyle = 'rgba(255,255,255,0.025)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y < h; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }

      const { cx, cy } = center();
      const qp = chargePx();
      const inside = Math.abs(qpos_mm) < R_mm;
      const sgn = qNC > 0 ? +1 : qNC < 0 ? -1 : 0;

      // Build the radial rays from the charge
      phase += 0.5;
      const nLines = 28;
      type Ray = { a: number; dirX: number; dirY: number; path: Array<[number, number, number]> };
      const lineRays: Ray[] = [];
      for (let i = 0; i < nLines; i++) {
        const a = (i / nLines) * Math.PI * 2;
        const dirX = Math.cos(a) * sgn;
        const dirY = Math.sin(a) * sgn;
        const path: Array<[number, number, number]> = [];
        for (let s = 6; s < 700; s += 5) {
          const x = qp.x + dirX * s;
          const y = qp.y + dirY * s;
          if (x < -20 || x > w + 20 || y < -20 || y > h + 20) break;
          path.push([x, y, s]);
        }
        if (sgn < 0) path.reverse();
        lineRays.push({ a, dirX, dirY, path });
      }

      // Geometric flux counter: count where each ray crosses the sphere boundary.
      let outCount = 0, inCount = 0;
      for (const ray of lineRays) {
        const fx = qp.x - cx, fy = qp.y - cy;
        const A = ray.dirX * ray.dirX + ray.dirY * ray.dirY;
        const B = 2 * (fx * ray.dirX + fy * ray.dirY);
        const C = fx * fx + fy * fy - R_mm * R_mm;
        const disc = B * B - 4 * A * C;
        if (disc < 0) continue;
        const sq = Math.sqrt(disc);
        const s1 = (-B - sq) / (2 * A);
        const s2 = (-B + sq) / (2 * A);
        const sOut = qNC >= 0 ? +1 : -1;
        const counts: number[] = [];
        if (s1 > 0) counts.push(s1);
        if (s2 > 0) counts.push(s2);
        for (const sCross of counts) {
          const xp = qp.x + ray.dirX * sCross;
          const yp = qp.y + ray.dirY * sCross;
          const outwardDot = ray.dirX * (xp - cx) + ray.dirY * (yp - cy);
          if (sOut > 0) {
            if (outwardDot > 0) outCount++; else inCount++;
          } else {
            if (outwardDot > 0) inCount++; else outCount++;
          }
        }
      }

      // Draw the rays with tracers
      for (const ray of lineRays) {
        if (ray.path.length < 2) continue;
        ctx.strokeStyle = 'rgba(255,107,42,0.13)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(ray.path[0][0], ray.path[0][1]);
        for (const [x, y] of ray.path) ctx.lineTo(x, y);
        ctx.stroke();
        const tIdx = Math.floor((phase + ray.a * 30) % ray.path.length);
        const t = ray.path[tIdx];
        if (t) {
          const [tx, ty] = t;
          const dCenter = Math.hypot(tx - cx, ty - cy);
          const stillInSphere = dCenter < R_mm;
          ctx.beginPath();
          ctx.arc(tx, ty, 1.8, 0, Math.PI * 2);
          ctx.fillStyle = stillInSphere
            ? 'rgba(91,174,248,0.85)'
            : 'rgba(255,107,42,0.95)';
          ctx.shadowColor = 'rgba(255,107,42,.55)';
          ctx.shadowBlur = 5;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      // Gaussian sphere
      ctx.strokeStyle = inside ? 'rgba(108,197,194,0.85)' : 'rgba(108,197,194,0.55)';
      ctx.lineWidth = inside ? 2.2 : 1.6;
      ctx.setLineDash([6, 5]);
      ctx.beginPath(); ctx.arc(cx, cy, R_mm, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = inside ? 'rgba(108,197,194,0.04)' : 'rgba(108,197,194,0.02)';
      ctx.beginPath(); ctx.arc(cx, cy, R_mm, 0, Math.PI * 2); ctx.fill();

      // Center crosshair
      ctx.strokeStyle = 'rgba(108,197,194,0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx - 6, cy); ctx.lineTo(cx + 6, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy - 6); ctx.lineTo(cx, cy + 6); ctx.stroke();

      // Radius label
      ctx.fillStyle = 'rgba(108,197,194,0.7)';
      ctx.font = '11px JetBrains Mono';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('R = ' + R_mm + ' mm', cx + R_mm + 8, cy - R_mm + 4);

      // Charge
      drawCharge(ctx, qp.x, qp.y, '#ff3b6e', qNC >= 0 ? '+' : '−', 'Q', Math.abs(qNC));

      // Counter overlay (top-left)
      ctx.fillStyle = 'rgba(10,10,11,0.88)';
      ctx.fillRect(16, 16, 200, 64);
      ctx.strokeStyle = 'rgba(255,255,255,0.10)';
      ctx.strokeRect(16, 16, 200, 64);
      ctx.font = '10px JetBrains Mono';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(255,107,42,0.95)';
      ctx.fillText('OUTWARD CROSSINGS  ' + outCount, 26, 30);
      ctx.fillStyle = 'rgba(91,174,248,0.95)';
      ctx.fillText('INWARD CROSSINGS   ' + inCount, 26, 46);
      ctx.fillStyle = 'rgba(236,235,229,0.85)';
      ctx.fillText('NET                ' + (outCount - inCount), 26, 62);

      // Status indicator (top-right)
      ctx.fillStyle = 'rgba(10,10,11,0.88)';
      ctx.fillRect(w - 146, 16, 130, 28);
      ctx.strokeStyle = 'rgba(255,255,255,0.10)';
      ctx.strokeRect(w - 146, 16, 130, 28);
      ctx.fillStyle = inside ? 'rgba(255,107,42,0.95)' : 'rgba(160,158,149,0.85)';
      ctx.font = '11px JetBrains Mono';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(inside ? 'CHARGE INSIDE' : 'CHARGE OUTSIDE', w - 26, 30);

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
          <LegendItem swatchColor="var(--pink)" dot>Charge Q</LegendItem>
          <LegendItem swatchColor="var(--teal)">Gaussian surface</LegendItem>
          <LegendItem swatchColor="var(--accent)">Outward flux</LegendItem>
          <LegendItem swatchColor="var(--blue)">Inward flux</LegendItem>
          <LegendItem style={{ marginLeft: 'auto', color: 'var(--accent)' }}>↳ Drag charge or sphere edge</LegendItem>
        </>
      }
      inputs={
        <>
          <Slider
            sym="Q" label="Charge"
            value={qNC} min={-20} max={20} step={0.1}
            format={v => (v >= 0 ? '+' : '') + v.toFixed(1) + ' nC'}
            metaLeft="−20 nC" metaRight="+20 nC"
            onChange={setQNC}
          />
          <Slider
            sym="R" label="Sphere radius"
            value={R_mm} min={10} max={250} step={1}
            format={v => v.toFixed(0) + ' mm'}
            metaLeft="10 mm" metaRight="250 mm"
            onChange={setR_mm}
          />
          <Slider
            sym="x<sub>Q</sub>" label="Charge position"
            value={qpos_mm} min={-200} max={200} step={1}
            format={v => (v > 0 ? '+' : '') + v.toFixed(0) + ' mm'}
            metaLeft="−200 mm" metaRight="+200 mm"
            onChange={setQpos_mm}
          />
        </>
      }
      outputs={
        <>
          <Readout
            sym={<>Q<sub>enc</sub></>} label="Enclosed charge"
            valueHTML={pretty(computed.Qenc)}
            unit="C"
          />
          <Readout
            sym="Φ" label="Total flux"
            valueHTML={pretty(computed.flux)}
            unit="V·m"
            highlight
          />
          <Readout
            sym="|E|" label="Field at surface"
            value={
              computed.inside && Math.abs(qpos_mm) < 1
                ? <span dangerouslySetInnerHTML={{ __html: pretty(computed.Esurf_centered) }} />
                : computed.inside
                  ? <span style={{ color: 'var(--text-muted)' }}>varies over surface</span>
                  : <span style={{ color: 'var(--text-muted)' }}>net flux = 0</span>
            }
            unit={computed.inside && Math.abs(qpos_mm) < 1 ? 'V/m' : undefined}
          />
          <Readout
            sym="A" label={<>Surface area (4πR²)</>}
            valueHTML={pretty(computed.A)}
            unit="m²"
          />
          <Readout
            sym="○" label="Charge location"
            value={
              <span style={{ color: computed.inside ? 'var(--accent)' : 'var(--text-muted)' }}>
                {computed.inside ? 'Inside' : 'Outside'}
              </span>
            }
          />
        </>
      }
    />
  );

  const prose = (
    <>
      <h3>The trick</h3>
      <p>
        Coulomb's law is calculation. You hand it a charge configuration; it hands you a vector field, point by laborious point. To get the field
        from a uniformly charged sphere, an infinite line, or a finite disk, you integrate — and the answer is often ugly.
      </p>
      <p>
        Gauss's law is bookkeeping. You don't ask "what's the field at this point." You ask: "Of all the electric flux passing
        through this imagined surface I just drew in space, how much net is there?" The answer depends only on the charge enclosed
        by that surface, divided by ε₀<Cite id="gauss-1813" in={SOURCES} /><Cite id="griffiths-2017" in={SOURCES} />. The shape
        doesn't matter. The location of charges outside the surface doesn't matter. Only what is <em>enclosed</em>.
      </p>
      <Pullout>
        Coulomb is calculation. Gauss is bookkeeping. When you have symmetry, the bookkeeping is enough — and Coulomb falls right out of it.
      </Pullout>

      <h3>Why it works</h3>
      <p>
        Start with the field of a single point charge: <strong>E = kQ/r²</strong>. Wrap an imaginary sphere of radius <strong>r</strong>
        around it, centered on the charge. The field is radial and uniform on that sphere, with magnitude <strong>kQ/r²</strong>. The sphere
        has area <strong>4πr²</strong>. Multiply them:
      </p>
      <MathBlock>∮ E · dA = (kQ/r²) · 4πr² = 4πk Q</MathBlock>
      <p>
        The radius dropped out: the field falls as 1/r², the area grows as r², the product is independent of r. Define
        <strong> k = 1/(4π ε₀)</strong>, and the 4π tidies away<Cite id="griffiths-2017" in={SOURCES} />:
      </p>
      <MathBlock>∮ E · dA = Q / ε₀</MathBlock>
      <p>
        The same answer holds for <em>any</em> closed surface enclosing the same charge. Deform the sphere — squish one side in, stretch another out —
        and the flux through each patch changes, but the <em>total</em> integrated flux is unchanged. Every field line leaving the charge
        has to escape <em>somewhere</em>; it pokes out of any enclosing surface exactly once in net<Cite id="feynman-II-2" in={SOURCES} />.
      </p>
      <p>
        Equally, if the charge is <em>outside</em> the surface, every field line that enters must also exit. Net flux: zero. Drag the
        charge past the sphere boundary and watch the flux readout collapse.
      </p>

      <h3>Symmetry buys you the field</h3>
      <p>
        Gauss's law alone gives only the integral of <strong>E</strong> over a surface. But if symmetry forces <strong>E</strong> to be
        uniform and perpendicular on a well-chosen surface, you can pull it out of the integral and solve for it<Cite id="griffiths-2017" in={SOURCES} />.
        Worked example: an infinite straight line with uniform charge per length <strong>λ</strong>.
      </p>
      <p>
        Cylindrical symmetry forces <strong>E</strong> to be radial and to depend only on perpendicular distance <strong>r</strong>. Wrap a
        cylindrical Gaussian surface of length <strong>L</strong> and radius <strong>r</strong> around the line. The end caps contribute nothing
        (E is parallel to them). The side wall has area <strong>2πrL</strong>, with <strong>E</strong> uniform on it:
      </p>
      <MathBlock>E · 2πrL = (λL) / ε₀ &nbsp;⇒&nbsp; E = λ / (2π ε₀ r)</MathBlock>
      <p>
        One line of algebra. Coulomb's law would have required integrating contributions from an infinite line — doable, but tedious<Cite id="jackson-1999" in={SOURCES} />.
      </p>

      <h3>A four-line derivation of Coulomb's law from Gauss</h3>
      <p>
        Take a point charge <strong>Q</strong> at the origin. By spherical symmetry, <strong>E</strong> is radial and depends only on r. Wrap a sphere
        of radius r:
      </p>
      <MathBlock>E · 4πr² = Q / ε₀</MathBlock>
      <MathBlock>E = Q / (4π ε₀ r²) = k Q / r²</MathBlock>
      <p>
        Coulomb's inverse-square law is forced by Gauss's law combined with spherical symmetry. In Maxwell's equations the foundational
        object is the divergence of <strong>E</strong>, and Coulomb falls out as a special case<Cite id="jackson-1999" in={SOURCES} />.
      </p>

      <h4>What k is, really</h4>
      <p>
        The relation <strong>k = 1/(4π ε₀)</strong> is geometric: the 4π is the solid angle subtended by the whole sky in steradians.
        SI units expose ε₀ because the system was historically organized around magnetism; Gaussian units absorb ε₀ into the definition
        of charge so Coulomb's law becomes <strong>F = q₁q₂/r²</strong> with no constant<Cite id="jackson-1999" in={SOURCES} />.
      </p>

      <h4>Why this matters for the rest of the textbook</h4>
      <p>
        Gauss's law is one of the four Maxwell equations. The other three concern magnetism (no magnetic monopoles), induction (changing B
        makes E), and Ampère–Maxwell (currents and changing E make B). Each is a statement about flux or circulation. The differential
        form <strong>∇ · E = ρ/ε₀</strong> says charge density is the source of field divergence<Cite id="griffiths-2017" in={SOURCES} />.
      </p>
    </>
  );

  return (
    <LabShell
      slug={SLUG}
      labSubtitle="Flux Through a Sphere"
      labId="gauss-1.3 / ∮ E·dA = Q_enc/ε₀"
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
  const radius = 11 + Math.min(10, magnitude * 0.4);
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
  ctx.fillText(label + ' = ' + magnitude.toFixed(1) + ' nC', cx, cy + radius + 14);
}
