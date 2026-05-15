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
import { Formula } from '@/components/Formula';
import { LabGrid, LegendItem } from '@/components/LabLayout';
import { LabShell } from '@/components/LabShell';
import { MathBlock, Pullout } from '@/components/Prose';
import { Readout } from '@/components/Readout';
import { Cite } from '@/components/SourcesList';
import { Slider } from '@/components/Slider';
import { TryIt } from '@/components/TryIt';
import { drawCharge } from '@/lib/canvasPrimitives';
import { PHYS, prettyJsx } from '@/lib/physics';
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
    const { ctx, w, h, canvas, colors } = info;
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
      ctx.fillStyle = colors.bg;
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
      ctx.fillStyle = colors.teal;
      ctx.font = '11px JetBrains Mono';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('R = ' + R_mm + ' mm', cx + R_mm + 8, cy - R_mm + 4);

      // Charge
      drawCharge(ctx, { x: qp.x, y: qp.y }, {
        color: '#ff3b6e',
        label: 'Q',
        magnitudeLabel: `= ${Math.abs(qNC).toFixed(1)} nC`,
        radius: 11 + Math.min(10, Math.abs(qNC) * 0.4),
        sign: qNC >= 0 ? '+' : '−',
        textColor: '#0a0a0b',
      });

      // Counter overlay (top-left)
      ctx.fillStyle = 'rgba(10,10,11,0.88)';
      ctx.fillRect(16, 16, 200, 64);
      ctx.strokeStyle = colors.border;
      ctx.strokeRect(16, 16, 200, 64);
      ctx.font = '10px JetBrains Mono';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = colors.accent;
      ctx.fillText('OUTWARD CROSSINGS  ' + outCount, 26, 30);
      ctx.fillStyle = colors.blue;
      ctx.fillText('INWARD CROSSINGS   ' + inCount, 26, 46);
      ctx.fillStyle = colors.text;
      ctx.fillText('NET                ' + (outCount - inCount), 26, 62);

      // Status indicator (top-right)
      ctx.fillStyle = 'rgba(10,10,11,0.88)';
      ctx.fillRect(w - 146, 16, 130, 28);
      ctx.strokeStyle = colors.border;
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
            sym={<>x<sub>Q</sub></>} label="Charge position"
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
            value={prettyJsx(computed.Qenc)}
            unit="C"
          />
          <Readout
            sym="Φ" label="Total flux"
            value={prettyJsx(computed.flux)}
            unit="V·m"
            highlight
          />
          <Readout
            sym="|E|" label="Field at surface"
            value={
              computed.inside && Math.abs(qpos_mm) < 1
                ? prettyJsx(computed.Esurf_centered)
                : computed.inside
                  ? <span style={{ color: 'var(--text-muted)' }}>varies over surface</span>
                  : <span style={{ color: 'var(--text-muted)' }}>net flux = 0</span>
            }
            unit={computed.inside && Math.abs(qpos_mm) < 1 ? 'V/m' : undefined}
          />
          <Readout
            sym="A" label={<>Surface area (4πR²)</>}
            value={prettyJsx(computed.A)}
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
      <h3 className="font-2 font-normal italic text-9 leading-1 my-4xl mb-xl text-text tracking-1">Context</h3>
      <p className="mb-prose-3">
        Gauss's law is one of the four Maxwell equations. It relates the total electric flux through any closed surface to the total electric
        charge enclosed by that surface, with no dependence on the surface's shape, the locations of charges outside the surface, or the
        details of how the enclosed charge is distributed<Cite id="gauss-1813" in={SOURCES} /><Cite id="griffiths-2017" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        It applies universally to electric fields, dynamic or static, in vacuum or in matter (with appropriate dressing for bound charges).
        For computing <strong className="text-text font-medium">E</strong> directly, however, it is only practical when the geometry has enough symmetry to make the flux
        integral trivial: spherical symmetry around a point or a sphere, cylindrical symmetry around a line, or planar symmetry around a
        sheet. Without symmetry, Gauss's law is still <em className="italic text-text">true</em> but gives only the integrated flux, not E pointwise — for that, you fall
        back on Coulomb's law and superposition<Cite id="jackson-1999" in={SOURCES} />.
      </p>

      <h3 className="font-2 font-normal italic text-9 leading-1 my-4xl mb-xl text-text tracking-1">Formula</h3>
      <MathBlock>∮ E · dA = Q<sub>enc</sub> / ε₀</MathBlock>
      <p className="mb-prose-3">
        Variable glossary:
      </p>
      <ul>
        <li><strong className="text-text font-medium">∮ ... dA</strong> — closed-surface integral. The "Gaussian surface" is any imagined closed surface in space; it need not coincide with any physical object.</li>
        <li><strong className="text-text font-medium">E</strong> — the electric field vector at each point of that surface, in V/m.</li>
        <li><strong className="text-text font-medium">dA</strong> — outward-pointing area element of the surface, in m². The dot product picks the component of <strong className="text-text font-medium">E</strong> perpendicular to the surface.</li>
        <li><strong className="text-text font-medium">Q<sub>enc</sub></strong> — total electric charge contained inside the surface, in coulombs. Signed; positive and negative enclosed charges cancel.</li>
        <li><strong className="text-text font-medium">ε₀ = 8.854×10⁻¹² C²/(N·m²)</strong> — vacuum permittivity. The Gauss/Coulomb constant relating units of charge to units of field.</li>
      </ul>

      <h3 className="font-2 font-normal italic text-9 leading-1 my-4xl mb-xl text-text tracking-1">Intuition</h3>
      <p className="mb-prose-3">
        Coulomb's law is calculation. You hand it a charge configuration; it hands you a vector field, point by laborious point. To get the field
        from a uniformly charged sphere, an infinite line, or a finite disk, you integrate — and the answer is often ugly.
      </p>
      <p className="mb-prose-3">
        Gauss's law is bookkeeping. You don't ask "what's the field at this point." You ask: "of all the electric flux passing through this
        imagined surface I just drew in space, how much net is there?" The answer depends only on the charge enclosed by that surface, divided
        by ε₀. The shape doesn't matter. The location of charges outside the surface doesn't matter. Only what is <em className="italic text-text">enclosed</em>.
      </p>
      <Pullout>
        Coulomb is calculation. Gauss is bookkeeping. When you have symmetry, the bookkeeping is enough — and Coulomb falls right out of it.
      </Pullout>

      <h3 className="font-2 font-normal italic text-9 leading-1 my-4xl mb-xl text-text tracking-1">Reasoning</h3>
      <p className="mb-prose-3">
        Why does flux care only about enclosed charge? Picture each charge as a fountain emitting "field lines" radially. Every line leaving
        a positive charge must escape its surrounding space somehow; every line approaching a negative charge must terminate on it. If a charge
        sits inside your surface, each of its lines crosses the surface an odd number of times (it pokes out, and the geometry of a closed
        surface forces a net of one outward crossing per line). If the charge sits outside, each of its lines either misses the surface entirely
        or pokes in once and pokes out once — net zero<Cite id="feynman-II-2" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        Why does the surface's shape not matter? Because <strong className="text-text font-medium">E</strong> falls as 1/r² and the surface area through which a fixed solid
        angle is viewed grows as r². The two cancel exactly — the field-area product for any patch depends only on the solid angle subtended,
        not the radial distance. Summing over the whole sky (4π steradians) gives the full enclosed charge in the right units.
      </p>
      <p className="mb-prose-3">
        Sign convention. The outward normal is the convention; an outward-pointing E·dA contributes positive flux. A positive charge enclosed
        gives positive net flux; a negative charge gives negative flux; a neutral collection (equal + and −) gives zero net flux. The shape of
        the surface affects the flux through individual patches but not the integral.
      </p>
      <p className="mb-prose-3">
        Limits. If the surface encloses no charge, ∮E·dA = 0 — even if E is nonzero everywhere on the surface (it just enters and leaves
        symmetrically). If you double Q<sub>enc</sub>, you double the total flux. If you slide a charge past the boundary, the flux jumps
        discontinuously from Q/ε₀ to 0 the instant the charge crosses the surface. The lab's flux readout snaps to zero when you drag the
        charge out of the Gaussian sphere — see for yourself.
      </p>

      <h3 className="font-2 font-normal italic text-9 leading-1 my-4xl mb-xl text-text tracking-1">Derivation</h3>
      <p className="mb-prose-3">
        Start with the field of a single point charge: <strong className="text-text font-medium">E = kQ/r²</strong>. Wrap an imaginary sphere of radius <strong className="text-text font-medium">r</strong>
        around it, centered on the charge. The field is radial and uniform on that sphere, with magnitude <strong className="text-text font-medium">kQ/r²</strong>. The sphere
        has area <strong className="text-text font-medium">4πr²</strong>. Multiply them:
      </p>
      <MathBlock>∮ E · dA = (kQ/r²) · 4πr² = 4πk Q</MathBlock>
      <p className="mb-prose-3">
        The radius dropped out: the field falls as 1/r², the area grows as r², the product is independent of r. Define
        <strong className="text-text font-medium"> k = 1/(4π ε₀)</strong>, and the 4π tidies away<Cite id="griffiths-2017" in={SOURCES} />:
      </p>
      <MathBlock>∮ E · dA = Q / ε₀</MathBlock>
      <p className="mb-prose-3">
        The same answer holds for <em className="italic text-text">any</em> closed surface enclosing the same charge. Deform the sphere — squish one side in, stretch another out —
        and the flux through each patch changes, but the <em className="italic text-text">total</em> integrated flux is unchanged. Every field line leaving the charge has
        to escape <em className="italic text-text">somewhere</em>; it pokes out of any enclosing surface exactly once in net<Cite id="feynman-II-2" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        Equally, if the charge is <em className="italic text-text">outside</em> the surface, every field line that enters must also exit. Net flux: zero. Drag the charge
        past the sphere boundary and watch the flux readout collapse. Superposition extends the result to any number of charges: the flux from
        a collection is the sum of the fluxes from each, and only the enclosed pieces contribute.
      </p>
      <p className="mb-prose-3">
        The differential form, by the divergence theorem:
      </p>
      <MathBlock>∇ · E = ρ / ε₀</MathBlock>
      <p className="mb-prose-3">
        Charge density is the source of field divergence. In Maxwell's equations this is the foundational object; Coulomb's law falls out as a
        special case<Cite id="jackson-1999" in={SOURCES} />.
      </p>

      <h3 className="font-2 font-normal italic text-9 leading-1 my-4xl mb-xl text-text tracking-1">Worked problems</h3>

      <TryIt
        tag="Problem 1.3.1"
        question={<>A point charge of <strong className="text-text font-medium">+1 nC</strong> sits at the origin. Compute the total electric flux through a sphere of radius <strong className="text-text font-medium">5 cm</strong> centered on the charge.</>}
        answer={
          <>
            <p className="mb-prose-3">The flux through any closed surface enclosing Q is Q/ε₀ — the radius doesn't matter:</p>
            <Formula>Φ = Q / ε₀ = (10⁻⁹) / (8.854×10⁻¹²) ≈ 113 V·m</Formula>
            <p className="mb-prose-3">About <strong className="text-text font-medium">113 V·m</strong>. The same answer for a sphere of radius 1 cm, 1 m, or 1 km — what matters is what's inside.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 1.3.2"
        question={<>Repeat Problem 1.3.1 with the charge at the origin, but compute the flux through a <strong className="text-text font-medium">cubic surface</strong> of side 10 cm centred on the charge.</>}
        answer={
          <>
            <p className="mb-prose-3">Gauss's law cares only about the enclosed charge, not the surface shape. The charge is still inside, still 1 nC:</p>
            <Formula>Φ = Q / ε₀ ≈ 113 V·m</Formula>
            <p className="mb-prose-3">Identical to the spherical case. The trade-off: through a cube, <strong className="text-text font-medium">E·dA</strong> is uneven across the surface — strong through the centres of each face, weak at the corners — but the integral comes out the same<Cite id="griffiths-2017" in={SOURCES} />.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 1.3.3"
        question={<>Derive the field outside a uniformly charged solid sphere of radius <strong className="text-text font-medium">R</strong> holding total charge <strong className="text-text font-medium">Q</strong>, at distance <strong className="text-text font-medium">r &gt; R</strong>.</>}
        answer={
          <>
            <p className="mb-prose-3">Spherical symmetry: E is radial and depends only on r. Wrap a Gaussian sphere of radius r &gt; R around the source. The full charge Q is enclosed:</p>
            <Formula>∮ E · dA = E · 4πr² = Q / ε₀</Formula>
            <Formula>E = Q / (4π ε₀ r²) = k Q / r²</Formula>
            <p className="mb-prose-3">Identical to a <em className="italic text-text">point charge</em> at the centre. This is the shell theorem: outside, an extended spherically symmetric distribution looks exactly like a point<Cite id="griffiths-2017" in={SOURCES} />.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 1.3.4"
        question={<>Inside the same uniformly charged solid sphere (total charge Q, radius R), what is the field at radius <strong className="text-text font-medium">r &lt; R</strong>?</>}
        answer={
          <>
            <p className="mb-prose-3">Only the charge inside radius r contributes. For a uniform volume density ρ, the enclosed charge scales as r³/R³:</p>
            <Formula>Q<sub>enc</sub>(r) = Q · (r³ / R³)</Formula>
            <Formula>E · 4πr² = Q (r³/R³) / ε₀  ⇒  E = (kQ/R³) r</Formula>
            <p className="mb-prose-3">The interior field grows <em className="italic text-text">linearly</em> with r, from zero at the centre to its surface value <strong className="text-text font-medium">kQ/R²</strong> at r = R. This is why the inside of a uniformly charged ball is a simple harmonic potential well — a fact exploited in models of nuclear physics and self-gravitating spheres.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 1.3.5"
        question={<>Find the field a perpendicular distance <strong className="text-text font-medium">r</strong> from an infinite straight line of charge with linear density <strong className="text-text font-medium">λ</strong> (coulombs per meter).</>}
        answer={
          <>
            <p className="mb-prose-3">Cylindrical symmetry forces E to be radial and to depend only on perpendicular distance r. Wrap a cylindrical Gaussian surface of length L and radius r around the line. The end caps contribute nothing (E is parallel to them). The side wall has area 2πrL, with E uniform on it:</p>
            <Formula>E · 2πrL = (λL) / ε₀</Formula>
            <Formula>E = λ / (2π ε₀ r)</Formula>
            <p className="mb-prose-3">One line of algebra. The field falls as 1/r (not 1/r²), because the source extends infinitely in one direction — a sphere of radius r intercepts only a thin slice of it. Coulomb's law would have required integrating contributions from an infinite line; Gauss skips the integral<Cite id="jackson-1999" in={SOURCES} />.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 1.3.6"
        question={<>Find the field between two infinite parallel sheets with surface charge densities <strong className="text-text font-medium">+σ</strong> and <strong className="text-text font-medium">−σ</strong> (an idealized parallel-plate capacitor).</>}
        answer={
          <>
            <p className="mb-prose-3">Each infinite sheet alone, by Gauss with a pillbox of area A straddling it, produces field σ/(2ε₀) on each side, pointing away (for +σ) or toward (for −σ) the sheet:</p>
            <Formula>E<sub>single sheet</sub> = σ / (2ε₀)</Formula>
            <p className="mb-prose-3">Between two oppositely charged sheets, the contributions add: both fields point from the +σ sheet toward the −σ sheet. Outside the sheets, they cancel:</p>
            <Formula>E<sub>between</sub> = σ/(2ε₀) + σ/(2ε₀) = σ / ε₀</Formula>
            <Formula>E<sub>outside</sub> = σ/(2ε₀) − σ/(2ε₀) = 0</Formula>
            <p className="mb-prose-3">This is the textbook result: uniform field <strong className="text-text font-medium">σ/ε₀</strong> between the plates, zero outside. The same answer the parallel-plate capacitor lab (4.1) will need.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 1.3.7"
        question={<>A hollow conducting sphere holds total charge <strong className="text-text font-medium">Q</strong> on its outer surface. Why is the field <strong className="text-text font-medium">inside the cavity</strong> exactly zero?</>}
        answer={
          <>
            <p className="mb-prose-3">Wrap a Gaussian surface inside the cavity, anywhere in the empty interior. The enclosed charge is zero:</p>
            <Formula>∮ E · dA = 0 / ε₀ = 0</Formula>
            <p className="mb-prose-3">By spherical symmetry, E inside must be radial and uniform on any concentric Gaussian sphere. The only field satisfying both the symmetry and the zero-flux constraint is <strong className="text-text font-medium">E = 0 everywhere inside the cavity</strong>.</p>
            <p className="mb-prose-3">This is the Faraday-cage result: a hollow conductor shields its interior from external electric fields, because any external field induces surface charges that exactly cancel it inside. The result is independent of cavity shape, by similar Gauss-law arguments<Cite id="griffiths-2017" in={SOURCES} />.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 1.3.8"
        question={<>Compute the total flux through a closed surface that contains a <strong className="text-text font-medium">+1 C</strong> point charge and a <strong className="text-text font-medium">−0.7 C</strong> point charge.</>}
        answer={
          <>
            <p className="mb-prose-3">Gauss's law uses the net enclosed charge:</p>
            <Formula>Q<sub>enc</sub> = +1 − 0.7 = +0.3 C</Formula>
            <Formula>Φ = Q<sub>enc</sub> / ε₀ = 0.3 / (8.854×10⁻¹²) ≈ 3.39×10¹⁰ V·m</Formula>
            <p className="mb-prose-3">About <strong className="text-text font-medium">3.4×10¹⁰ V·m</strong>. The internal arrangement of the two charges doesn't matter; only the algebraic sum does. The field structure inside the surface is wildly nontrivial — there's a dipole-like pattern with field lines running from + to − — but the total escaping flux is fixed.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 1.3.9"
        question={<>Two concentric spherical shells: an inner shell of radius <strong className="text-text font-medium">1 cm</strong> with charge <strong className="text-text font-medium">+5 nC</strong>, and an outer shell of radius <strong className="text-text font-medium">3 cm</strong> with charge <strong className="text-text font-medium">−5 nC</strong>. What is the field at r = 2 cm (between the shells) and r = 5 cm (outside both)?</>}
        answer={
          <>
            <p className="mb-prose-3">At r = 2 cm, between the shells: a Gaussian sphere of radius 2 cm encloses only the inner shell, charge +5 nC:</p>
            <Formula>E(2 cm) = k Q<sub>enc</sub> / r² = (8.99×10⁹)(5×10⁻⁹) / (0.02)² ≈ 1.12×10⁵ V/m</Formula>
            <p className="mb-prose-3">About <strong className="text-text font-medium">112 kV/m</strong>, radially outward. At r = 5 cm, outside both shells: net enclosed charge is +5 nC + (−5 nC) = 0:</p>
            <Formula>E(5 cm) = 0</Formula>
            <p className="mb-prose-3">Zero field. This is the principle behind coaxial cables — the outer conductor shields the world from the field of the inner conductor when the two carry equal and opposite charge<Cite id="griffiths-2017" in={SOURCES} />.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 1.3.10"
        question={<>An infinite conducting cylinder of radius <strong className="text-text font-medium">R</strong> carries surface linear-charge density <strong className="text-text font-medium">λ</strong>. Compute E at a perpendicular distance <strong className="text-text font-medium">r &gt; R</strong> from the axis.</>}
        answer={
          <>
            <p className="mb-prose-3">Cylindrical symmetry: E radial, depends only on r. Wrap a Gaussian cylinder of length L, radius r. Total enclosed charge is λL (everything on the conductor's surface inside our cylinder):</p>
            <Formula>E · 2πrL = (λL) / ε₀</Formula>
            <Formula>E = λ / (2π ε₀ r)</Formula>
            <p className="mb-prose-3">Identical to the field of an infinite line! Outside the conductor, the cylinder of charge looks like a line. (Inside the conducting material, E is zero — a conductor in electrostatic equilibrium has E = 0 in its bulk.)</p>
          </>
        }
      />

      <TryIt
        tag="Problem 1.3.11"
        question={<>Pillbox derivation: from Gauss's law alone, find the field on each side of an infinite sheet of charge with surface density <strong className="text-text font-medium">σ</strong>.</>}
        answer={
          <>
            <p className="mb-prose-3">Symmetry: E points perpendicular to the sheet, with equal magnitude on each side (and opposite directions, away from the sheet for σ &gt; 0). Wrap a cylindrical "pillbox" Gaussian surface of cross-sectional area A straddling the sheet. The side wall contributes nothing (E parallel to it). Each end cap contributes E·A:</p>
            <Formula>∮ E · dA = 2 E A = (σ A) / ε₀</Formula>
            <Formula>E = σ / (2 ε₀)</Formula>
            <p className="mb-prose-3">The field is <em className="italic text-text">independent of distance</em> from the sheet — a consequence of the sheet being infinite. Real finite sheets approximate this only in the near-field regime, where the observer is much closer to the sheet than to its edges<Cite id="feynman-II-2" in={SOURCES} />.</p>
          </>
        }
      />

      <h3 className="font-2 font-normal italic text-9 leading-1 my-4xl mb-xl text-text tracking-1">What k is, really</h3>
      <p className="mb-prose-3">
        The relation <strong className="text-text font-medium">k = 1/(4π ε₀)</strong> is geometric: the 4π is the solid angle subtended by the whole sky in steradians. SI units
        expose ε₀ because the system was historically organized around magnetism; Gaussian units absorb ε₀ into the definition of charge so
        Coulomb's law becomes <strong className="text-text font-medium">F = q₁q₂/r²</strong> with no constant<Cite id="jackson-1999" in={SOURCES} />.
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
