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
import { LabGrid, LegendItem } from '@/components/LabLayout';
import { LabShell } from '@/components/LabShell';
import { MathBlock, Pullout } from '@/components/Prose';
import { Readout } from '@/components/Readout';
import { Cite } from '@/components/SourcesList';
import { Slider } from '@/components/Slider';
import { PHYS, pretty } from '@/lib/physics';
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
    setProbe(p => {
      // We just centre it and use a fraction. The draw loop will re-derive.
      // Place at y = 0.55 - (d in normalized units). 0.55 is segment y.
      // For visualization, use d_mm vs L_mm to set the offset:
      const fracOfHeight = Math.min(0.5, d_mm / 500 * 0.5);
      return { x: 0.5, y: Math.max(0.05, 0.55 - fracOfHeight) };
    });
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
    const { ctx, w, h, canvas } = info;
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
          y: Math.max(0.05, Math.min(0.95, my / h)),
        });
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
        y: Math.max(0.05, Math.min(0.95, my / h)),
      });
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
      ctx.fillStyle = '#0d0d10';
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
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
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
      ctx.fillStyle = '#ff3b6e';
      const arrowSize = 16;
      const arrowCx = segCx + 4;
      ctx.beginPath();
      ctx.moveTo(arrowCx + arrowSize, segCy);
      ctx.lineTo(arrowCx - arrowSize / 2, segCy - arrowSize / 2);
      ctx.lineTo(arrowCx - arrowSize / 2, segCy + arrowSize / 2);
      ctx.closePath(); ctx.fill();
      // Segment label
      ctx.fillStyle = '#ff3b6e';
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
      ctx.fillStyle = '#ff6b2a';
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
          <Readout sym="|B|" label="Field at probe" valueHTML={pretty(computed.Bfinite)} unit="T" highlight />
          <Readout sym={<>B<sub>∞</sub></>} label="Infinite-wire limit" valueHTML={pretty(computed.Binfty)} unit="T" />
          <Readout sym="f" label={<>|B| / B<sub>∞</sub></>} value={computed.frac.toFixed(3)} unit="×" />
          <Readout sym="n̂" label="Direction" value={computed.dir} />
          <Readout sym="r" label="Distance to probe" value={computed.r_mm.toFixed(1)} unit="mm" />
        </>
      }
    />
  );

  const prose = (
    <>
      <h3>Build a field from pieces</h3>
      <p>
        Biot–Savart is to magnetism what Coulomb's law is to electricity — but with a cross product. Every infinitesimal piece of current
        <strong> dℓ</strong> contributes a tiny field <strong>dB</strong> at every point in space, falling off like <strong>1/r²</strong>,
        and perpendicular to both the current and the line from the segment to the field point<Cite id="biot-savart-1820" in={SOURCES} />.
      </p>
      <p>
        Curl the fingers of your right hand from <strong>dℓ</strong> toward the radius vector <strong>r̂</strong>; your thumb points along
        <strong> dB</strong>. That cross product is what makes magnetic field lines wrap <em>around</em> the current rather than radiating outward<Cite id="feynman-II-13" in={SOURCES} />.
      </p>
      <Pullout>
        Currents do not radiate force outward like charges. They <em>circulate</em> it.
      </Pullout>

      <h3>The math, in stages</h3>
      <p>The full statement:</p>
      <MathBlock>dB = (μ<sub>0</sub> I / 4π) · (dℓ × r̂) / r²</MathBlock>
      <p>
        The constant out front, <strong>μ<sub>0</sub>/4π ≈ 10<sup>−7</sup> T·m/A</strong>, is the magnetic
        Coulomb constant. The cross product <strong>dℓ × r̂</strong> packages the geometry: only the component of <strong>dℓ</strong>
        perpendicular to <strong>r̂</strong> contributes, and the result is perpendicular to both. The <strong>1/r²</strong> is the same
        inverse-square fall-off you saw with point charges<Cite id="griffiths-2017" in={SOURCES} />.
      </p>
      <p>
        For a finite straight segment of length <strong>L</strong>, measured perpendicular from its midpoint at distance <strong>d</strong>, the
        integral can be done by hand. The closed form is<Cite id="jackson-1999" in={SOURCES} />:
      </p>
      <MathBlock>|B| = (μ<sub>0</sub> I / 4π d) · 2L / √(L² + 4d²)</MathBlock>
      <p>
        Take <strong>L → ∞</strong> and the second factor approaches 2, recovering the infinite-wire result:
      </p>
      <MathBlock>B<sub>∞</sub> = μ<sub>0</sub> I / (2π d)</MathBlock>

      <h3>Why a cross product?</h3>
      <p>
        The cross product isn't an arbitrary mathematical choice — it falls out of the physics. The force on a moving charge in a magnetic
        field is <strong>F = q v × B</strong>. For Newton's third law to hold between two current-carrying wires, and for the force-on-current
        law <strong>F = Iℓ × B</strong> to be consistent, <strong>B</strong> itself has to come out of a cross product of the source
        current with the radius vector<Cite id="griffiths-2017" in={SOURCES} />.
      </p>
      <p>
        Electric fields point <em>away from</em> charges; magnetic fields curl <em>around</em> currents. Two different rules for two different
        geometries.
      </p>

      <h3>When the segment is long enough to act infinite</h3>
      <p>
        The slider above lets you crank <strong>d</strong> against <strong>L</strong>. Near the segment (small <strong>d</strong>, big <strong>L</strong>),
        the geometry looks essentially like an infinite wire and <strong>|B|/B<sub>∞</sub></strong> hugs 1. Far from a finite segment, however, you
        start to see the ends: the field falls off faster than <strong>1/d</strong>, eventually like <strong>1/d²</strong> because, far enough away,
        a finite segment looks like a point dipole<Cite id="jackson-1999" in={SOURCES} />.
      </p>
      <p>
        That crossover — from "wire that goes on forever" to "tiny stub of current pointing somewhere" — is what the slider plays with.
        Most circuit calculations use the infinite-wire approximation, which is fine as long as you stay inside the segment's near zone.
      </p>

      <h4>Connection to special relativity</h4>
      <p>
        A static charge has only an electric field. A <em>moving</em> charge has both <strong>E</strong> and <strong>B</strong>. In a different inertial
        frame, the same charge may appear to move at a different speed, so the split between electric and magnetic looks different too. The total
        electromagnetic field is the invariant; <strong>B</strong> alone is frame-dependent<Cite id="feynman-II-13" in={SOURCES} />.
      </p>
      <p>
        Magnetism, in this sense, is the relativistic shadow of electricity. Biot–Savart is what that shadow looks like in the steady,
        slow-current limit — the same regime as Coulomb's law for electrostatics.
      </p>
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
