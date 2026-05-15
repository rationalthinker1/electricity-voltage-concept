/**
 * Lab 2.1 — Biot–Savart Law
 *
 *   dB = (μ₀ I / 4π) (dℓ × r̂) / r²
 *
 * Top-down view of a finite horizontal current segment. Drag the probe to
 * sample the magnetic field at any point. The finite-segment closed form
 * (on the perpendicular bisector) is
 *
 *   |B| = (μ₀ I / 4π d) · 2L / √(L² + 4d²)
 *
 * which reduces to |B|∞ = μ₀ I / (2π d) when L → ∞.
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
import {PHYS, prettyJsx } from '@/lib/physics';
import { BASE_LAB_SOURCES } from '@/labs/data/manifest';

const SLUG = 'biot-savart';
const SOURCES = BASE_LAB_SOURCES[SLUG]!;

export default function BiotSavartLab() {
  // State
  const [I, setI] = useState(10);       // A
  const [L_mm, setL_mm] = useState(100); // mm
  const [d_mm, setD_mm] = useState(50);  // mm — perpendicular distance from segment midpoint

  // Probe in normalized canvas coords [0..1].
  const [probe, setProbe] = useState({ x: 0.5, y: 0.30 });

  // Refs so the draw loop sees the latest state.
  const stateRef = useRef({ I, L_mm, probe });
  useEffect(() => {
    stateRef.current = { I, L_mm, probe };
  }, [I, L_mm, probe]);

  // When d slider moves, snap probe to perpendicular bisector at distance d above segment.
  // We do this by adjusting the probe Y; the canvas's segment line is at y=0.55.
  useEffect(() => {
    // Visual length of the segment is a function of L_mm and canvas width — we
    // approximate using a typical canvas width (the draw loop scales). Use 800 as nominal.
    // The perpendicular-distance computation in compute() uses the *real* mm-per-pixel
    // ratio so the math always matches the actual rendering.
    // Snap probe to centre + d above segment, in approximate mm-units.
    const fracOfHeight = Math.min(0.5, (d_mm / 500) * 0.5);
    setProbe({ x: 0.5, y: Math.max(0.05, 0.55 - fracOfHeight) });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d_mm]);

  // Computed physics. We compute against the latest geometry every render —
  // but probe position changes via drag, so this re-runs.
  const computed = useMemo(() => {
    // The on-canvas geometry: segment is centered horizontally at y=0.55, with visual
    // length scaling with L_mm (max canvas width fraction = 0.6). The mm-per-pixel ratio
    // depends on canvas width and is unknown at compute-time without DOM read. We instead
    // express everything purely in mm using the slider d_mm directly when probe is on the
    // bisector; when the probe is dragged off-axis, we use the *probe Y normalized * (some scale)
    // for dPerp. To keep it simple and match the vanilla file's behavior, we approximate the
    // visual mapping: assume the canvas width = the typical ~1024 px. The draw loop reads
    // the same mapping.
    const W_NOMINAL = 1024;
    const maxLenPx = W_NOMINAL * 0.6;
    const lengthPx = Math.max(20, (L_mm / 500) * maxLenPx);
    const mmPerPx = L_mm / lengthPx;
    const H_NOMINAL = 460;
    const segCy = H_NOMINAL * 0.55;
    const probePx = probe.x * W_NOMINAL;
    const probePy = probe.y * H_NOMINAL;
    const segCx = W_NOMINAL / 2;

    const dxPx = probePx - segCx;
    const dyPx = probePy - segCy;
    const r_mm = Math.hypot(dxPx, dyPx) * mmPerPx;
    const dPerp_mm = Math.abs(dyPx) * mmPerPx;
    const dPerp_m = Math.max(dPerp_mm * 1e-3, 1e-6);
    const L_m = L_mm * 1e-3;

    // Finite-segment formula (probe on perpendicular bisector):
    //   |B| = (μ₀ I / 4π d) · 2L / √(L² + 4d²)
    const k = (PHYS.mu_0 * I) / (4 * Math.PI * dPerp_m);
    const Bfinite = k * (2 * L_m / Math.sqrt(L_m * L_m + 4 * dPerp_m * dPerp_m));
    const Binfty = (PHYS.mu_0 * I) / (2 * Math.PI * dPerp_m);
    const frac = Bfinite / Binfty;
    const dir = dyPx < 0 ? 'out of page (⊙)' : 'into page (⊗)';

    return { Bfinite, Binfty, frac, dir, r_mm, dPerp_mm };
  }, [I, L_mm, probe]);

  const setupCanvas = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, canvas, colors } = info;
    let raf = 0;
    let dragging = false;

    function getMouse(e: MouseEvent | TouchEvent): [number, number] {
      const r = canvas.getBoundingClientRect();
      const t = 'touches' in e ? e.touches[0] : e;
      if (!t) return [0, 0];
      return [t.clientX - r.left, t.clientY - r.top];
    }
    function nearProbe(mx: number, my: number) {
      const px = stateRef.current.probe.x * w;
      const py = stateRef.current.probe.y * h;
      return Math.hypot(mx - px, my - py) < 22;
    }
    function onMouseDown(e: MouseEvent) {
      const [mx, my] = getMouse(e);
      if (nearProbe(mx, my)) { dragging = true; canvas.style.cursor = 'grabbing'; }
    }
    function onMouseMove(e: MouseEvent) {
      const [mx, my] = getMouse(e);
      if (dragging) {
        setProbe({
          x: Math.max(0.04, Math.min(0.96, mx / w)),
          y: Math.max(0.05, Math.min(0.95, my / h)) });
      } else {
        canvas.style.cursor = nearProbe(mx, my) ? 'grab' : 'default';
      }
    }
    function onMouseUp() { dragging = false; canvas.style.cursor = 'default'; }
    function onTouchStart(e: TouchEvent) {
      e.preventDefault();
      const [mx, my] = getMouse(e);
      if (nearProbe(mx, my)) dragging = true;
    }
    function onTouchMove(e: TouchEvent) {
      e.preventDefault();
      if (!dragging) return;
      const [mx, my] = getMouse(e);
      setProbe({
        x: Math.max(0.04, Math.min(0.96, mx / w)),
        y: Math.max(0.05, Math.min(0.95, my / h)) });
    }
    function onTouchEnd() { dragging = false; }

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);

    function draw() {
      const { I, L_mm, probe } = stateRef.current;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      // Faint guide grid
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 0; y < h; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

      const maxLenPx = w * 0.6;
      const lengthPx = Math.max(20, (L_mm / 500) * maxLenPx);
      const segCx = w / 2;
      const segCy = h * 0.55;
      const segX1 = segCx - lengthPx / 2;
      const probeX = probe.x * w;
      const probeY = probe.y * h;

      // dℓ pieces + rays + contributions
      const N = 20;
      const dlPx = lengthPx / N;
      const contribs: { dlx: number; dly: number; dirX: number; dirY: number; mag: number }[] = [];
      let sumX = 0, sumY = 0;
      for (let i = 0; i < N; i++) {
        const dlx = segX1 + (i + 0.5) * dlPx;
        const dly = segCy;
        const rx = probeX - dlx;
        const ry = probeY - dly;
        const r2 = rx * rx + ry * ry;
        const r = Math.sqrt(r2);
        const mag = 1 / Math.max(r2, 100);
        const dirX = -ry / r;
        const dirY = rx / r;
        contribs.push({ dlx, dly, dirX, dirY, mag });
        sumX += dirX * mag;
        sumY += dirY * mag;
      }
      const totalMag = Math.hypot(sumX, sumY);
      const arrowScale = Math.min(80 / Math.max(totalMag, 1e-6), 8e5);

      // r̂ rays
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      for (const c of contribs) {
        ctx.beginPath();
        ctx.moveTo(c.dlx, c.dly);
        ctx.lineTo(probeX, probeY);
        ctx.stroke();
      }
      // dℓ ticks
      ctx.fillStyle = 'rgba(255,107,42,0.7)';
      for (const c of contribs) {
        ctx.beginPath(); ctx.arc(c.dlx, c.dly, 2, 0, Math.PI * 2); ctx.fill();
      }
      // dB contributions (teal fans)
      ctx.strokeStyle = 'rgba(108,197,194,0.45)';
      ctx.lineWidth = 1;
      for (const c of contribs) {
        const vx = c.dirX * c.mag * arrowScale;
        const vy = c.dirY * c.mag * arrowScale;
        ctx.beginPath(); ctx.moveTo(probeX, probeY); ctx.lineTo(probeX + vx, probeY + vy); ctx.stroke();
      }
      // Total B arrow
      const tVx = sumX * arrowScale;
      const tVy = sumY * arrowScale;
      ctx.strokeStyle = 'rgba(108,197,194,1)';
      ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.moveTo(probeX, probeY); ctx.lineTo(probeX + tVx, probeY + tVy); ctx.stroke();
      const ang = Math.atan2(tVy, tVx);
      ctx.fillStyle = 'rgba(108,197,194,1)';
      ctx.beginPath();
      ctx.moveTo(probeX + tVx, probeY + tVy);
      ctx.lineTo(probeX + tVx - 9 * Math.cos(ang - 0.4), probeY + tVy - 9 * Math.sin(ang - 0.4));
      ctx.lineTo(probeX + tVx - 9 * Math.cos(ang + 0.4), probeY + tVy - 9 * Math.sin(ang + 0.4));
      ctx.closePath(); ctx.fill();

      // Out-of-page / into-page icon
      const dotX = probeX + 28;
      const dotY = probeY - 28;
      ctx.beginPath(); ctx.arc(dotX, dotY, 12, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(108,197,194,1)';
      ctx.lineWidth = 1.6;
      ctx.stroke();
      if (probeY < segCy) {
        ctx.fillStyle = 'rgba(108,197,194,1)';
        ctx.beginPath(); ctx.arc(dotX, dotY, 3, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.strokeStyle = 'rgba(108,197,194,1)';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(dotX - 7, dotY - 7); ctx.lineTo(dotX + 7, dotY + 7);
        ctx.moveTo(dotX + 7, dotY - 7); ctx.lineTo(dotX - 7, dotY + 7);
        ctx.stroke();
      }

      // Segment body
      ctx.fillStyle = 'rgba(255,59,110,0.18)';
      ctx.fillRect(segX1, segCy - 8, lengthPx, 16);
      ctx.strokeStyle = 'rgba(255,59,110,0.95)';
      ctx.lineWidth = 1.6;
      ctx.strokeRect(segX1, segCy - 8, lengthPx, 16);
      // Arrowhead → current direction
      ctx.fillStyle = colors.pink;
      const arrowSize = 16;
      const arrowCx = segCx + 4;
      ctx.beginPath();
      ctx.moveTo(arrowCx + arrowSize, segCy);
      ctx.lineTo(arrowCx - arrowSize / 2, segCy - arrowSize / 2);
      ctx.lineTo(arrowCx - arrowSize / 2, segCy + arrowSize / 2);
      ctx.closePath(); ctx.fill();
      // Segment label
      ctx.fillStyle = colors.pink;
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(`I = ${I.toFixed(1)} A   L = ${L_mm} mm`, segCx, segCy + 16);

      // Probe
      ctx.strokeStyle = '#ff6b2a';
      ctx.lineWidth = 2;
      ctx.fillStyle = 'rgba(10,10,11,0.9)';
      ctx.beginPath(); ctx.arc(probeX, probeY, 11, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = colors.accent;
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('P', probeX, probeY);

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
      canvas={<AutoResizeCanvas height={460} setup={setupCanvas} />}
      legend={
        <>
          <LegendItem swatchColor="var(--pink)">Current segment (I →)</LegendItem>
          <LegendItem swatchColor="var(--accent)" dot>Probe (draggable)</LegendItem>
          <LegendItem swatchColor="var(--teal)">dB contributions</LegendItem>
          <LegendItem swatchColor="rgba(255,255,255,.4)">r̂ rays</LegendItem>
          <LegendItem style={{ marginLeft: 'auto', color: 'var(--accent)' }}>↳ Drag the probe</LegendItem>
        </>
      }
      inputs={
        <>
          <Slider sym="I" label="Current" value={I} min={0.1} max={100} step={0.1}
            format={v => v.toFixed(1) + ' A'} metaLeft="0.1 A" metaRight="100 A" onChange={setI} />
          <Slider sym="L" label="Segment length" value={L_mm} min={5} max={500} step={1}
            format={v => Math.round(v) + ' mm'} metaLeft="5 mm" metaRight="500 mm" onChange={setL_mm} />
          <Slider sym="d" label="Perpendicular distance" value={d_mm} min={5} max={500} step={1}
            format={v => Math.round(v) + ' mm'} metaLeft="5 mm" metaRight="500 mm" onChange={setD_mm} />
        </>
      }
      outputs={
        <>
          <Readout sym="|B|" label="Field at probe" value={prettyJsx(computed.Bfinite)} unit="T" highlight />
          <Readout sym={<>B<sub>∞</sub></>} label="Infinite-wire limit" value={prettyJsx(computed.Binfty)} unit="T" />
          <Readout sym="f" label={<>|B| / B<sub>∞</sub></>} value={computed.frac.toFixed(3)} unit="×" />
          <Readout sym="n̂" label="Direction" value={computed.dir} />
          <Readout sym="r" label="Distance to probe" value={computed.r_mm.toFixed(1)} unit="mm" />
        </>
      }
    />
  );

  const prose = (
    <>
      <h3 className="lab-section-h3">Context</h3>
      <p className="mb-prose-3">
        Biot–Savart describes the magnetic field set up by a <em className="italic text-text">steady</em> current. Pick any infinitesimal piece <strong className="text-text font-medium">dℓ</strong>
        of a wire carrying current <strong className="text-text font-medium">I</strong>; that piece contributes a tiny field <strong className="text-text font-medium">dB</strong> at every point in space.
        Sum (integrate) the contributions over the whole circuit and you have the total <strong className="text-text font-medium">B</strong>. The law is the magnetic
        analog of Coulomb's law for charges<Cite id="biot-savart-1820" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        It applies whenever the currents are steady (<strong className="text-text font-medium">∂J/∂t = 0</strong>) and the geometry is fixed. It does <em className="italic text-text">not</em> apply to
        radiating sources: an accelerating charge produces a field with retardation and a slower-falling <strong className="text-text font-medium">1/r</strong> piece that
        Biot–Savart misses. For ordinary DC and slow AC at scales much smaller than a wavelength, it is exact<Cite id="jackson-1999" in={SOURCES} />.
      </p>

      <h3 className="lab-section-h3">Formula</h3>
      <MathBlock>dB = (μ<sub>0</sub> / 4π) · I dℓ × r̂ / r²</MathBlock>
      <p className="mb-prose-3">Variable glossary:</p>
      <ul>
        <li><strong className="text-text font-medium">dB</strong> — infinitesimal magnetic field at the field point, in tesla (T).</li>
        <li><strong className="text-text font-medium">μ<sub>0</sub></strong> — permeability of free space, ≈ 4π × 10<sup>−7</sup> T·m/A<Cite id="griffiths-2017" in={SOURCES} />.</li>
        <li><strong className="text-text font-medium">I</strong> — current in the wire, in amperes (A).</li>
        <li><strong className="text-text font-medium">dℓ</strong> — vector segment of the wire pointing along conventional current flow, in m.</li>
        <li><strong className="text-text font-medium">r̂</strong> — unit vector from the segment to the field point.</li>
        <li><strong className="text-text font-medium">r</strong> — distance from the segment to the field point, in m.</li>
      </ul>
      <p className="mb-prose-3">For a finite straight segment of length L, on its perpendicular bisector at distance d:</p>
      <MathBlock>|B| = (μ<sub>0</sub> I / 4π d) · 2L / √(L² + 4d²)</MathBlock>
      <p className="mb-prose-3">And in the long-wire limit L → ∞:</p>
      <MathBlock>B<sub>∞</sub> = μ<sub>0</sub> I / (2π d)</MathBlock>

      <h3 className="lab-section-h3">Intuition</h3>
      <p className="mb-prose-3">
        Curl the fingers of your right hand from <strong className="text-text font-medium">dℓ</strong> toward <strong className="text-text font-medium">r̂</strong>; your thumb points along <strong className="text-text font-medium">dB</strong>.
        That cross product is what makes magnetic field lines wrap <em className="italic text-text">around</em> the current rather than radiating outward<Cite id="feynman-II-13" in={SOURCES} />.
        The <strong className="text-text font-medium">1/r²</strong> falloff is the same geometric dilution that gave Coulomb his exponent of two: the influence of a point
        source is spread over the surface of a sphere of area <strong className="text-text font-medium">4πr²</strong>.
      </p>
      <Pullout>
        Currents do not radiate force outward like charges. They <em className="italic text-text">circulate</em> it.
      </Pullout>

      <h3 className="lab-section-h3">Reasoning</h3>
      <p className="mb-prose-3">
        Every piece earns its place. The <strong className="text-text font-medium">I dℓ</strong> factor is the source strength — more current means more field, linearly. The
        <strong className="text-text font-medium"> 1/r²</strong> is geometric dilution in three dimensions (Coulomb's exponent, Gauss's law). The <strong className="text-text font-medium">× r̂</strong> is what
        makes the field <em className="italic text-text">perpendicular</em> to both source and line-of-sight — only the component of <strong className="text-text font-medium">dℓ</strong> normal to
        <strong className="text-text font-medium"> r̂</strong> contributes, and the resulting <strong className="text-text font-medium">dB</strong> sits in the plane perpendicular to that.
      </p>
      <p className="mb-prose-3">
        Limit checks: on the wire's own axis <strong className="text-text font-medium">dℓ ∥ r̂</strong> so the cross product vanishes — no field straight ahead of a current
        element, exactly the opposite of an electric monopole. Flip the current direction and <strong className="text-text font-medium">dℓ</strong> flips, so <strong className="text-text font-medium">B</strong>
        flips with it — Newton's third law is preserved between two parallel wires. The factor <strong className="text-text font-medium">μ<sub>0</sub>/(4π) = 10<sup>−7</sup> T·m/A</strong>
        was fixed exactly by the historical definition of the ampere<Cite id="griffiths-2017" in={SOURCES} />. The slider above lets you
        crank <strong className="text-text font-medium">d</strong> against <strong className="text-text font-medium">L</strong>: near the segment <strong className="text-text font-medium">|B|/B<sub>∞</sub></strong> hugs 1; far away
        (<strong className="text-text font-medium">d ≫ L</strong>) it falls like <strong className="text-text font-medium">1/d²</strong> because a finite stub of current looks like a magnetic dipole.
      </p>

      <h3 className="lab-section-h3">Derivation</h3>
      <p className="mb-prose-3">
        Biot and Savart (1820) measured the deflection of a compass needle at varying perpendicular distances from a long straight current
        and fit the data<Cite id="biot-savart-1820" in={SOURCES} />. The modern derivation runs in reverse. Start with a moving point charge:
        in the lab frame, a charge <strong className="text-text font-medium">q</strong> moving at velocity <strong className="text-text font-medium">v</strong> (with v ≪ c) produces approximately
      </p>
      <MathBlock>B(r) ≈ (μ<sub>0</sub> / 4π) · q v × r̂ / r²</MathBlock>
      <p className="mb-prose-3">
        A current <strong className="text-text font-medium">I</strong> in a wire is just a stream of charges, so <strong className="text-text font-medium">I dℓ</strong> plays the role of <strong className="text-text font-medium">qv</strong> for
        each segment. Substituting and summing gives Biot–Savart<Cite id="griffiths-2017" in={SOURCES} />. To get the infinite-wire result,
        place the wire along the <em className="italic text-text">x</em>-axis with the field point at <em className="italic text-text">(0, d, 0)</em>: <strong className="text-text font-medium">dℓ × r⃗ / r³</strong> reduces to
        <strong className="text-text font-medium"> ẑ · d / (x² + d²)<sup>3/2</sup> dx</strong>, and the elementary integral
        <strong className="text-text font-medium"> ∫<sub>−∞</sub><sup>∞</sup> d dx / (x² + d²)<sup>3/2</sup> = 2/d</strong> delivers <strong className="text-text font-medium">|B| = μ<sub>0</sub> I / (2π d)</strong><Cite id="jackson-1999" in={SOURCES} />.
      </p>

      <h3 className="lab-section-h3">Worked problems</h3>

      <TryIt
        tag="Problem 2.1.1"
        question={<>A circular loop of radius <strong className="text-text font-medium">R = 5 cm</strong> carries <strong className="text-text font-medium">I = 2 A</strong>. Find <strong className="text-text font-medium">B</strong> at the centre.</>}
        hint="Every dℓ is perpendicular to r̂ at the centre, and r = R for every piece."
        answer={
          <>
            <p className="mb-prose-3">At the centre, r = R and every dℓ ⊥ r̂, so each dB points along the axis (right-hand rule) and</p>
            <Formula>|B| = (μ₀ I / 4π R²) · ∮ dℓ = (μ₀ I / 4π R²) · 2πR = μ₀ I / (2R)</Formula>
            <Formula>|B| = (4π×10⁻⁷)(2) / (2 × 0.05) ≈ 2.51 × 10⁻⁵ T</Formula>
            <p className="mb-prose-3">Answer: <strong className="text-text font-medium">~25 µT</strong>, about half Earth's surface field.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 2.1.2"
        question={<>Same loop (R = 5 cm, I = 2 A). Find <strong className="text-text font-medium">B</strong> on the axis at <strong className="text-text font-medium">z = 12 cm</strong> from the centre.</>}
        hint="On-axis: B(z) = μ₀IR² / [2(R² + z²)^(3/2)]."
        answer={
          <>
            <p className="mb-prose-3">Standard on-axis result:</p>
            <Formula>|B|(z) = μ₀ I R² / [2(R² + z²)<sup>3/2</sup>]</Formula>
            <p className="mb-prose-3">With R = 0.05 m, z = 0.12 m: R² + z² = 0.0169 m², (R² + z²)<sup>3/2</sup> ≈ 0.00220 m³.</p>
            <Formula>|B| = (4π×10⁻⁷)(2)(0.0025) / (2 × 0.00220) ≈ 1.43 × 10⁻⁶ T</Formula>
            <p className="mb-prose-3">Answer: <strong className="text-text font-medium">~1.4 µT</strong>. About 18× weaker than at the centre.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 2.1.3"
        question={<>Derive <strong className="text-text font-medium">|B| = μ<sub>0</sub>I/(2πr)</strong> for an infinite straight wire by direct Biot–Savart integration.</>}
        hint="Wire along x̂; field point at (0, r, 0); integrate x from −∞ to ∞."
        answer={
          <>
            <p className="mb-prose-3">With wire along x̂ and field point at (0, r, 0), dℓ = x̂ dx, r⃗ = (−x, r, 0), |r⃗| = √(x² + r²):</p>
            <Formula>dℓ × r̂ = ẑ · r / √(x² + r²) dx</Formula>
            <Formula>dB<sub>z</sub> = (μ₀ I / 4π) · r dx / (x² + r²)<sup>3/2</sup></Formula>
            <Formula>∫<sub>−∞</sub><sup>∞</sup> r dx / (x² + r²)<sup>3/2</sup> = [x / (r√(x² + r²))]<sub>−∞</sub><sup>∞</sup> = 2/r</Formula>
            <Formula>|B| = μ₀ I / (2π r)</Formula>
            <p className="mb-prose-3">QED.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 2.1.4"
        question={<>A long solenoid with <strong className="text-text font-medium">n = 1000 turns/m</strong> carries <strong className="text-text font-medium">I = 0.5 A</strong>. Find <strong className="text-text font-medium">B</strong> inside.</>}
        hint="Stacking on-axis loop fields (or invoking Ampère): B = μ₀nI."
        answer={
          <>
            <p className="mb-prose-3">For a long solenoid the on-axis field is uniform:</p>
            <Formula>|B| = μ₀ n I = (4π×10⁻⁷)(1000)(0.5) = 6.28 × 10⁻⁴ T</Formula>
            <p className="mb-prose-3">Answer: <strong className="text-text font-medium">~0.63 mT</strong>.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 2.1.5"
        question={<>A square loop of side <strong className="text-text font-medium">L = 10 cm</strong> carries <strong className="text-text font-medium">I = 3 A</strong>. Find <strong className="text-text font-medium">B</strong> at the centre.</>}
        hint="Each side is a finite segment at perpendicular distance L/2. Add the four contributions."
        answer={
          <>
            <p className="mb-prose-3">Finite-segment formula at d = L/2: √(L² + 4(L/2)²) = √(2L²) = L√2.</p>
            <Formula>|B|<sub>side</sub> = (μ₀ I / (4π · L/2)) · 2L / (L√2) = μ₀ I √2 / (π L)</Formula>
            <p className="mb-prose-3">Four sides add:</p>
            <Formula>|B|<sub>centre</sub> = 4√2 μ₀ I / (π L) = (4√2 × 4π×10⁻⁷ × 3) / (π × 0.10) ≈ 6.79 × 10⁻⁵ T</Formula>
            <p className="mb-prose-3">Answer: <strong className="text-text font-medium">~68 µT</strong>.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 2.1.6"
        question={<>Two parallel wires <strong className="text-text font-medium">d = 2 cm</strong> apart carry <strong className="text-text font-medium">I<sub>1</sub> = 5 A</strong> and <strong className="text-text font-medium">I<sub>2</sub> = 3 A</strong> in the same direction. Find the force per unit length between them.</>}
        hint="Wire 1 sits in the field of wire 2; F/L = I₁B₂."
        answer={
          <>
            <p className="mb-prose-3">Field of wire 2 at wire 1: <strong className="text-text font-medium">B₂ = μ₀I₂/(2πd)</strong>. Force per length on wire 1:</p>
            <Formula>F/L = I₁ B₂ = μ₀ I₁ I₂ / (2π d)</Formula>
            <Formula>F/L = (4π×10⁻⁷)(5)(3) / (2π × 0.02) = 1.5 × 10⁻⁴ N/m</Formula>
            <p className="mb-prose-3">Answer: <strong className="text-text font-medium">~150 µN/m</strong>, attractive (same-direction currents pull together). This relation was the historical definition of the ampere.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 2.1.7"
        question={<>A Helmholtz pair: two coaxial loops of radius <strong className="text-text font-medium">R</strong> carrying current <strong className="text-text font-medium">I</strong> in the same sense, separated by <strong className="text-text font-medium">R</strong>. Derive <strong className="text-text font-medium">B</strong> on-axis at the midpoint and show <strong className="text-text font-medium">dB/dz = 0</strong> there.</>}
        hint="Sum two on-axis loop fields at z = ±R/2. Use symmetry."
        answer={
          <>
            <p className="mb-prose-3">On-axis field of one loop centred at z = a:</p>
            <Formula>B(z) = μ₀ I R² / [2(R² + (z − a)²)<sup>3/2</sup>]</Formula>
            <p className="mb-prose-3">Two loops at a = ±R/2:</p>
            <Formula>B<sub>tot</sub>(z) = (μ₀ I R² / 2) [(R² + (z − R/2)²)<sup>−3/2</sup> + (R² + (z + R/2)²)<sup>−3/2</sup>]</Formula>
            <p className="mb-prose-3">At z = 0 each denominator equals (5R²/4)<sup>3/2</sup>:</p>
            <Formula>B(0) = (μ₀ I R² / 2) · 2 · (4/5)<sup>3/2</sup> R<sup>−3</sup> = (4/5)<sup>3/2</sup> μ₀ I / R ≈ 0.7155 μ₀ I / R</Formula>
            <p className="mb-prose-3">By symmetry B(z) = B(−z), so dB/dz|<sub>z=0</sub> = 0. The R-spacing also forces d²B/dz²|<sub>z=0</sub> = 0 — the field is uniform to fourth order, which is why the geometry is so useful in the lab.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 2.1.8"
        question={<>A semicircular arc of radius <strong className="text-text font-medium">R = 4 cm</strong> carries <strong className="text-text font-medium">I = 6 A</strong>. Find <strong className="text-text font-medium">B</strong> at the centre.</>}
        hint="Half a full loop; straight leads (if collinear with the radius) contribute zero."
        answer={
          <>
            <p className="mb-prose-3">For a full loop, B<sub>centre</sub> = μ₀I/(2R). A semicircle is half:</p>
            <Formula>|B| = μ₀ I / (4R) = (4π×10⁻⁷)(6) / (4 × 0.04) ≈ 4.71 × 10⁻⁵ T</Formula>
            <p className="mb-prose-3">Answer: <strong className="text-text font-medium">~47 µT</strong>. Straight leads along the line of the radius have dℓ ∥ r̂ and contribute nothing.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 2.1.9"
        question={<>A solenoid 10 cm long with 1000 turns carries 0.5 A. Estimate <strong className="text-text font-medium">B</strong> at the centre, treating it as long.</>}
        hint="n = N/L. In the long-solenoid limit, B = μ₀nI."
        answer={
          <>
            <p className="mb-prose-3">Turns per metre: n = 1000/0.10 = 10⁴ turns/m.</p>
            <Formula>|B|<sub>long</sub> = μ₀ n I = (4π×10⁻⁷)(10⁴)(0.5) = 6.28 × 10⁻³ T</Formula>
            <p className="mb-prose-3">Answer: <strong className="text-text font-medium">~6.3 mT</strong> in the long-solenoid limit. If R ≈ 1 cm so L/2R = 5, the finite-length correction cos θ = 5/√26 ≈ 0.981 gives <strong className="text-text font-medium">~6.16 mT</strong> — within 2%.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 2.1.10"
        question={<>An MRI gradient coil — a Maxwell pair (two coaxial loops of radius <strong className="text-text font-medium">R = 0.3 m</strong> carrying opposite currents, separated by <strong className="text-text font-medium">√3 R</strong>) — must produce <strong className="text-text font-medium">dB/dz = 50 mT/m</strong> at the centre. Estimate the required ampere-turns NI.</>}
        hint="The Maxwell-pair geometry gives dB/dz|₀ ≈ 0.14 μ₀NI/R²."
        answer={
          <>
            <p className="mb-prose-3">The Maxwell pair (opposing currents, separation √3 R) cancels the second derivative and gives a linear gradient:</p>
            <Formula>dB/dz|<sub>0</sub> ≈ 0.140 μ₀ N I / R²</Formula>
            <Formula>NI = (dB/dz) · R² / (0.140 · μ₀) = (0.05)(0.09) / (0.140 × 4π×10⁻⁷) ≈ 2.56 × 10⁴ A-turns</Formula>
            <p className="mb-prose-3">Answer: about <strong className="text-text font-medium">26 kA-turns</strong>. A real gradient coil might run 250 turns at 100 A — the high dI/dt during MRI sequencing flexes the coil against the main field and produces the characteristic loud clicks.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 2.1.11"
        question={<>Conceptual: why is <strong className="text-text font-medium">B = 0</strong> along the line of extension of a long straight wire, far from its ends?</>}
        hint="What is dℓ × r̂ when both point along the wire?"
        answer={
          <>
            <p className="mb-prose-3">On the wire's own axis, r̂ points along the wire and so does dℓ — so dℓ × r̂ = 0 for every segment. Every contribution to B is zero. This is geometric: electric fields radiate outward from a point charge, but magnetic fields cannot exist along the line of a current. The cross-product structure forbids it.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 2.1.12"
        question={<>Conceptual: for a finite straight wire of length <strong className="text-text font-medium">L</strong>, how does <strong className="text-text font-medium">B</strong> scale at perpendicular distances <strong className="text-text font-medium">d ≫ L</strong>?</>}
        hint="Take the d ≫ L limit of the finite-segment formula."
        answer={
          <>
            <p className="mb-prose-3">In <strong className="text-text font-medium">|B| = (μ₀I/4πd)·2L/√(L² + 4d²)</strong>, when d ≫ L the square root reduces to 2d:</p>
            <Formula>|B| ≈ (μ₀ I L) / (4π d²)</Formula>
            <p className="mb-prose-3">So B ∝ 1/d², not 1/d. Far from a finite current stub, it looks like a magnetic point source — a current dipole<Cite id="jackson-1999" in={SOURCES} />. The infinite-wire 1/d behaviour only holds when the wire's length dominates the distance.</p>
          </>
        }
      />
    </>
  );

  return (
    <LabShell
      slug={SLUG}
      labSubtitle="Field of a Finite Current Segment"
      labId="biot-savart-2.1 / dB ∝ dℓ×r̂/r²"
      labContent={labContent}
      prose={prose}
    />
  );
}
