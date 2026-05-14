/**
 * Lab 2.2 — Ampère's Law
 *
 *   ∮ B · dℓ = μ₀ I_enc
 *
 * Concentric B-field circles around a bundle of straight wires. A moving
 * dℓ dot traces the Amperian loop while the line integral accumulates.
 * The integral always equals μ₀ I_enc — exactly, by construction.
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

const SLUG = 'ampere';
const SOURCES = BASE_LAB_SOURCES[SLUG]!;

export default function AmpereLab() {
  const [I, setI] = useState(10);          // A
  const [r_mm, setR_mm] = useState(100);   // mm — Amperian loop radius
  const [nWires, setNWires] = useState(1); // count

  const stateRef = useRef({ I, r_mm, nWires });
  useEffect(() => { stateRef.current = { I, r_mm, nWires }; }, [I, r_mm, nWires]);

  const computed = useMemo(() => {
    const Ienc = I * nWires;
    const r_m = r_mm * 1e-3;
    const Bcirc = (PHYS.mu_0 * Ienc) / (2 * Math.PI * r_m);
    const Lcirc = 2 * Math.PI * r_m;
    const circ = Bcirc * Lcirc;          // ∮ B·dℓ
    const mu0Ienc = PHYS.mu_0 * Ienc;     // μ₀ I_enc
    return { Ienc, Bcirc, circ, mu0Ienc, Lcirc };
  }, [I, r_mm, nWires]);

  const setupCanvas = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, colors } = info;
    let raf = 0;
    let phase = 0;

    function draw() {
      const { I, r_mm, nWires } = stateRef.current;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      phase += 0.018;
      const cx = w / 2;
      const cy = h / 2;
      const maxLoopPx = Math.min(w, h) * 0.42;
      const t = Math.min(1, Math.max(0.05, r_mm / 500));
      const loopPx = 30 + t * (maxLoopPx - 30);

      // Concentric B-field circles
      const fieldRadii: number[] = [];
      for (let k = 0.25; k < 2.4; k += 0.18) fieldRadii.push(loopPx * k);
      ctx.lineWidth = 1;
      for (const fr of fieldRadii) {
        const op = Math.max(0.05, Math.min(0.35, 0.42 * (loopPx / fr)));
        ctx.strokeStyle = `rgba(255,107,42,${op})`;
        ctx.beginPath(); ctx.arc(cx, cy, fr, 0, Math.PI * 2); ctx.stroke();
        // Tangent arrows
        const nArrows = 8;
        for (let i = 0; i < nArrows; i++) {
          const a = (i / nArrows) * Math.PI * 2 + phase * 0.5;
          const ax = cx + Math.cos(a) * fr;
          const ay = cy + Math.sin(a) * fr;
          const tx = Math.sin(a);
          const ty = -Math.cos(a);
          const sz = 4;
          ctx.fillStyle = `rgba(255,107,42,${op * 1.6})`;
          ctx.beginPath();
          ctx.moveTo(ax + tx * sz, ay + ty * sz);
          ctx.lineTo(ax + tx * (-sz / 2) + (-ty) * sz / 2, ay + ty * (-sz / 2) + (tx) * sz / 2);
          ctx.lineTo(ax + tx * (-sz / 2) - (-ty) * sz / 2, ay + ty * (-sz / 2) - (tx) * sz / 2);
          ctx.closePath();
          ctx.fill();
        }
      }

      // Amperian loop
      ctx.strokeStyle = colors.teal;
      ctx.lineWidth = 2.2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath(); ctx.arc(cx, cy, loopPx, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(108,197,194,0.04)';
      ctx.beginPath(); ctx.arc(cx, cy, loopPx, 0, Math.PI * 2); ctx.fill();

      // Moving dℓ dot
      const dlAngle = (phase * 1.4) % (Math.PI * 2);
      const dlx = cx + Math.cos(dlAngle) * loopPx;
      const dly = cy + Math.sin(dlAngle) * loopPx;
      ctx.strokeStyle = 'rgba(255,107,42,0.55)';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(cx, cy, loopPx, 0, dlAngle); ctx.stroke();
      ctx.fillStyle = colors.accent;
      ctx.shadowColor = 'rgba(255,107,42,0.7)';
      ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.arc(dlx, dly, 5, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;

      // B vector at dℓ
      const tx = Math.sin(dlAngle);
      const ty = -Math.cos(dlAngle);
      const vlen = 26;
      ctx.strokeStyle = 'rgba(255,107,42,1)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(dlx, dly);
      ctx.lineTo(dlx + tx * vlen, dly + ty * vlen);
      ctx.stroke();
      const aang = Math.atan2(ty, tx);
      ctx.fillStyle = 'rgba(255,107,42,1)';
      ctx.beginPath();
      ctx.moveTo(dlx + tx * vlen, dly + ty * vlen);
      ctx.lineTo(dlx + tx * vlen - 7 * Math.cos(aang - 0.4), dly + ty * vlen - 7 * Math.sin(aang - 0.4));
      ctx.lineTo(dlx + tx * vlen - 7 * Math.cos(aang + 0.4), dly + ty * vlen - 7 * Math.sin(aang + 0.4));
      ctx.closePath(); ctx.fill();

      // Wires ⊗ (into page)
      const wireR = 10;
      const spacing = 26;
      const cols = nWires;
      const startX = cx - (cols - 1) * spacing / 2;
      for (let i = 0; i < nWires; i++) {
        const wx = startX + i * spacing;
        const wy = cy;
        ctx.fillStyle = 'rgba(255,59,110,0.18)';
        ctx.beginPath(); ctx.arc(wx, wy, wireR, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(255,59,110,0.95)';
        ctx.lineWidth = 1.4;
        ctx.stroke();
        const cs = wireR * 0.55;
        ctx.beginPath();
        ctx.moveTo(wx - cs, wy - cs); ctx.lineTo(wx + cs, wy + cs);
        ctx.moveTo(wx + cs, wy - cs); ctx.lineTo(wx - cs, wy + cs);
        ctx.stroke();
      }

      // Loop radius indicator
      ctx.strokeStyle = 'rgba(108,197,194,0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.moveTo(cx, cy); ctx.lineTo(cx + loopPx, cy);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = colors.teal;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`r = ${r_mm} mm`, cx + loopPx / 2, cy - 4);

      // Numerical overlay
      const mu0Ienc = PHYS.mu_0 * I * nWires;
      const r_m = r_mm * 1e-3;
      const Bcirc = (PHYS.mu_0 * I * nWires) / (2 * Math.PI * r_m);
      const circ = Bcirc * 2 * Math.PI * r_m;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = colors.accent;
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillText(`∮ B·dℓ = ${pretty(circ)} T·m`, 24, 28);
      ctx.fillStyle = colors.teal;
      ctx.fillText(`μ₀ I_enc = ${pretty(mu0Ienc)} T·m`, 24, 48);
      ctx.fillStyle = colors.textDim;
      ctx.fillText(`|B| on loop = ${pretty(Bcirc)} T`, 24, 68);
      ctx.textAlign = 'right';
      ctx.fillStyle = 'rgba(255,59,110,0.95)';
      ctx.fillText(`I_enc = ${(I * nWires).toFixed(1)} A   (${nWires} × ${I.toFixed(1)} A)`, w - 24, 28);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); };
  }, []);

  const labContent = (
    <LabGrid
      canvas={<AutoResizeCanvas height={500} setup={setupCanvas} />}
      legend={
        <>
          <LegendItem swatchColor="var(--pink)" dot>Wire (current ⊗ into page)</LegendItem>
          <LegendItem swatchColor="var(--teal)">Amperian loop</LegendItem>
          <LegendItem swatchColor="var(--accent)">B-field circles</LegendItem>
          <LegendItem swatchColor="var(--accent)" dot>dℓ (moving)</LegendItem>
          <LegendItem style={{ marginLeft: 'auto', color: 'var(--accent)' }}>↳ Watch ∮B·dℓ accumulate</LegendItem>
        </>
      }
      inputs={
        <>
          <Slider sym="I" label="Current per wire" value={I} min={0.1} max={200} step={0.1}
            format={v => v.toFixed(1) + ' A'} metaLeft="0.1 A" metaRight="200 A" onChange={setI} />
          <Slider sym="r" label="Loop radius" value={r_mm} min={1} max={500} step={1}
            format={v => Math.round(v) + ' mm'} metaLeft="1 mm" metaRight="500 mm" onChange={setR_mm} />
          <Slider sym="n" label="Wires enclosed" value={nWires} min={1} max={5} step={1}
            format={v => Math.round(v).toString()} metaLeft="1" metaRight="5"
            onChange={v => setNWires(Math.round(v))} />
        </>
      }
      outputs={
        <>
          <Readout sym={<>I<sub>enc</sub></>} label="Enclosed current" valueHTML={pretty(computed.Ienc)} unit="A" />
          <Readout sym="B" label="|B| on loop" valueHTML={pretty(computed.Bcirc)} unit="T" />
          <Readout sym="∮" label="B·dℓ around loop" valueHTML={pretty(computed.circ)} unit="T·m" highlight />
          <Readout sym={<>μ<sub>0</sub>I</>} label="Predicted by Ampère" valueHTML={pretty(computed.mu0Ienc)} unit="T·m" />
          <Readout sym="L" label="Loop circumference" valueHTML={pretty(computed.Lcirc)} unit="m" />
        </>
      }
    />
  );

  const prose = (
    <>
      <h3>Context</h3>
      <p>
        Ampère's law is the magnetic analog of Gauss's law<Cite id="ampere-1826" in={SOURCES} />. Instead of summing flux through a closed
        <em> surface</em>, you integrate <strong>B</strong> along a closed <em>loop</em>; instead of total enclosed charge, the right-hand side
        counts net current piercing any surface bounded by that loop. The statement holds for any steady current and any closed path — bent,
        squashed, or symmetric.
      </p>
      <p>
        It's most useful when the geometry has enough symmetry that <strong>B</strong> can be pulled out of the integral. Long straight wires
        (circular Amperian loops), infinite solenoids (rectangular loops), and toroids (circles inside the donut) are the canonical cases.
        For asymmetric geometries the law is still exact but yields a non-trivial line integral; Biot–Savart is usually easier there. The
        magnetostatic form below assumes steady currents — Maxwell's displacement-current correction (below) handles the general case<Cite id="maxwell-1865" in={SOURCES} />.
      </p>

      <h3>Formula</h3>
      <MathBlock>∮ B · dℓ = μ<sub>0</sub> I<sub>enc</sub></MathBlock>
      <p>Variable glossary:</p>
      <ul>
        <li><strong>∮</strong> — line integral around a closed Amperian loop.</li>
        <li><strong>B</strong> — magnetic field, in tesla (T).</li>
        <li><strong>dℓ</strong> — infinitesimal vector segment along the loop, in m.</li>
        <li><strong>μ<sub>0</sub></strong> — permeability of free space, ≈ 4π × 10<sup>−7</sup> T·m/A.</li>
        <li><strong>I<sub>enc</sub></strong> — net current piercing any surface bounded by the loop, in A. Current parallel to the loop's right-hand-rule normal counts as positive.</li>
      </ul>
      <p>The full Maxwell–Ampère law adds Maxwell's displacement-current term:</p>
      <MathBlock>∮ B · dℓ = μ<sub>0</sub> I<sub>enc</sub> + μ<sub>0</sub> ε<sub>0</sub> dΦ<sub>E</sub> / dt</MathBlock>

      <h3>Intuition</h3>
      <p>
        Think of B as winding around its source current. If you walk once around a closed loop measuring how much <strong>B</strong> points
        along your steps and adding it up, you collect a sum that depends only on how much current threads through the doughnut hole you just
        traced. The shape of your walk doesn't matter — bend the loop, push it sideways, deform it — as long as the same wires still pierce
        the surface it bounds.
      </p>
      <Pullout>
        There is no magnetic charge. There is only <em>enclosed current</em> — and the geometry it forces on the field.
      </Pullout>

      <h3>Reasoning</h3>
      <p>
        The right-hand side counts net current. Same-sign currents add; opposing currents subtract; pairs of equal-and-opposite currents
        threading the same loop cancel. Push the bounding surface around like a soap bubble across stationary currents; the integer
        count is invariant. The <strong>μ<sub>0</sub></strong> on the right is fixed by the SI definition of the ampere<Cite id="griffiths-2017" in={SOURCES} />.
      </p>
      <p>
        Why the line integral on the left? Because magnetic field lines never end — they form closed loops around currents. A line integral
        around any closed path captures that "circulation" exactly. The mathematical statement equivalent to Ampère in differential form is
        Stokes' theorem: <strong>∮ B · dℓ = ∫∫ (∇ × B) · dA = μ<sub>0</sub> ∫∫ J · dA = μ<sub>0</sub> I<sub>enc</sub></strong>, giving
        <strong> ∇ × B = μ<sub>0</sub> J</strong> locally<Cite id="feynman-II-13" in={SOURCES} />.
      </p>

      <h3>Derivation</h3>
      <p>
        Direct from Biot–Savart for a long straight wire. We showed there that <strong>|B| = μ<sub>0</sub>I/(2πr)</strong>, tangent to circles
        centred on the wire. Choose an Amperian circle of radius <strong>r</strong>. On every point of that circle, <strong>B · dℓ = |B| dℓ</strong>
        (parallel), and <strong>|B|</strong> is constant. So
      </p>
      <MathBlock>∮ B · dℓ = |B| · 2πr = (μ<sub>0</sub> I / 2π r) · 2π r = μ<sub>0</sub> I</MathBlock>
      <p>
        — the Ampère relation, derived from the Biot–Savart field of a straight wire. The general statement (any geometry, any loop) follows
        from the differential form <strong>∇ × B = μ<sub>0</sub> J</strong>, which is in turn implied by Biot–Savart for any steady current
        distribution<Cite id="griffiths-2017" in={SOURCES} />.
      </p>

      <h3>Worked problems</h3>

      <TryIt
        tag="Problem 2.2.1"
        question={<>Use Ampère's law to find <strong>B</strong> outside an infinite straight wire carrying current <strong>I = 10 A</strong> at perpendicular distance <strong>r = 5 cm</strong>.</>}
        hint="Take a circular Amperian loop of radius r centred on the wire. By symmetry B is tangent and constant on the loop."
        answer={
          <>
            <p>By cylindrical symmetry, B is tangent to a circle of radius r and has the same magnitude everywhere on it. So</p>
            <Formula>∮ B · dℓ = |B| · 2π r = μ₀ I<sub>enc</sub> = μ₀ I</Formula>
            <Formula>|B| = μ₀ I / (2π r) = (4π×10⁻⁷)(10) / (2π × 0.05) = 4 × 10⁻⁵ T</Formula>
            <p>Answer: <strong>40 µT</strong>.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 2.2.2"
        question={<>Use Ampère's law to derive the field inside a long solenoid with <strong>n</strong> turns per metre carrying current <strong>I</strong>.</>}
        hint="Use a rectangular Amperian loop that straddles the solenoid wall. B is axial inside, zero outside."
        answer={
          <>
            <p>Take a rectangle of length L with one long side inside (parallel to the axis) and the other outside (where B = 0). The two short sides cross between in/out at right angles to B — contributing zero. Inside contributes <strong>BL</strong>. The enclosed current is <strong>I × (nL) = nIL</strong>:</p>
            <Formula>B L = μ₀ n I L  ⇒  B = μ₀ n I</Formula>
            <p>Done — uniform field inside, axial, independent of position. The classic result, in one Ampère application.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 2.2.3"
        question={<>A toroid with <strong>N = 500</strong> turns and mean radius <strong>R = 8 cm</strong> carries <strong>I = 2 A</strong>. Find <strong>B</strong> inside, at the mean radius.</>}
        hint="Take an Amperian circle of radius R along the toroid's centre line. Each turn is enclosed once."
        answer={
          <>
            <p>By azimuthal symmetry, B is azimuthal and uniform on a circle of radius R inside the toroid. Each of N turns pierces the surface bounded by that circle once:</p>
            <Formula>∮ B · dℓ = |B| · 2π R = μ₀ N I</Formula>
            <Formula>|B| = μ₀ N I / (2π R) = (4π×10⁻⁷)(500)(2) / (2π × 0.08) ≈ 2.50 × 10⁻³ T</Formula>
            <p>Answer: <strong>~2.5 mT</strong>.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 2.2.4"
        question={<>Two infinite parallel sheets carry surface currents <strong>K = 100 A/m</strong> in opposite directions, separated by gap <strong>d</strong>. Find <strong>B</strong> in the region between them and outside.</>}
        hint="A single sheet produces B = (μ₀K/2) on each side, parallel to the sheet and perpendicular to K. Use superposition."
        answer={
          <>
            <p>From Ampère applied to a single sheet (rectangular loop straddling it), one sheet gives <strong>B = μ₀K/2</strong> on each side, in opposite directions on the two sides. Two opposing sheets superpose:</p>
            <Formula>B<sub>between</sub> = μ₀K/2 + μ₀K/2 = μ₀ K</Formula>
            <Formula>B<sub>outside</sub> = μ₀K/2 − μ₀K/2 = 0</Formula>
            <Formula>|B|<sub>between</sub> = (4π×10⁻⁷)(100) = 1.26 × 10⁻⁴ T</Formula>
            <p>Answer: <strong>~126 µT</strong> between the sheets, <strong>0</strong> outside. This is how superconducting solenoids approximate a uniform field — the surface currents on the inside walls of the can.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 2.2.5"
        question={<>A coaxial cable has central conductor radius <strong>a</strong> carrying <strong>+I</strong> (uniform), an outer braid at radius <strong>b &gt; a</strong> carrying <strong>−I</strong> (uniform sheath). Find <strong>B(r)</strong> for r &lt; a, a &lt; r &lt; b, and r &gt; b.</>}
        hint="Three regions; circular Amperian loops. Compute I_enc in each region."
        answer={
          <>
            <p>For uniform current density J in the central conductor, the fraction of I enclosed by radius r &lt; a is (r²/a²).</p>
            <Formula>r &lt; a:   I<sub>enc</sub> = I (r/a)²,    |B| = μ₀ I r / (2π a²)</Formula>
            <Formula>a &lt; r &lt; b:   I<sub>enc</sub> = I,    |B| = μ₀ I / (2π r)</Formula>
            <Formula>r &gt; b:   I<sub>enc</sub> = I − I = 0,    |B| = 0</Formula>
            <p>The field vanishes outside — the reason coax doesn't radiate at DC. Inside the central conductor B grows linearly with r; in the gap it falls as 1/r; outside the shield, nothing.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 2.2.6"
        question={<>Conceptual: why is the field <em>outside</em> a long solenoid essentially zero?</>}
        hint="Apply Ampère to a rectangular loop that lies entirely outside, and use the fact that magnetic field lines must close."
        answer={
          <>
            <p>Any rectangular Amperian loop outside the solenoid encloses zero current (all the wire turns are inside). So ∮B·dℓ = 0 around any such loop. By symmetry, outside the solenoid B must be axial (or zero); if it were a uniform axial field at infinity, the field lines wouldn't close. The only consistent solution is B<sub>outside</sub> ≈ 0 in the limit of an infinite ideal solenoid. For real, finite solenoids, a small fringe field exists but is much weaker than the ~μ₀nI inside.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 2.2.7"
        question={<>Maxwell's correction: what term is added to Ampère's law for a parallel-plate capacitor charging at <strong>dV/dt = 10⁶ V/s</strong> with plate area <strong>A = 1 cm²</strong> separated by <strong>d = 0.5 mm</strong> of vacuum? Compute the displacement current.</>}
        hint="Displacement current I_D = ε₀ dΦ_E/dt = ε₀ A dE/dt; and E = V/d."
        answer={
          <>
            <p>The displacement current is:</p>
            <Formula>I<sub>D</sub> = ε₀ A dE/dt = ε₀ A (1/d) dV/dt = ε₀ (A/d) dV/dt = C dV/dt</Formula>
            <p>That's just the standard capacitor current — the conduction current that flows in the wires <em>equals</em> the displacement current through the gap, so the Maxwell–Ampère law is consistent for any Amperian loop, whether the bounding surface passes through the wire or the gap. Plug in numbers:</p>
            <Formula>C = ε₀ A/d = (8.85×10⁻¹²)(10⁻⁴) / (5×10⁻⁴) = 1.77 × 10⁻¹² F</Formula>
            <Formula>I<sub>D</sub> = C dV/dt = (1.77×10⁻¹²)(10⁶) = 1.77 × 10⁻⁶ A</Formula>
            <p>Answer: <strong>~1.8 µA</strong> — the displacement current matches the wire current.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 2.2.8"
        question={<>A toroid with <strong>N = 800</strong> turns and mean radius <strong>R = 12 cm</strong> carries <strong>I = 0.75 A</strong>. Find <strong>B</strong> inside on the mean line.</>}
        hint="Same Ampère-on-a-circle argument as Problem 2.2.3."
        answer={
          <>
            <Formula>|B| = μ₀ N I / (2π R) = (4π×10⁻⁷)(800)(0.75) / (2π × 0.12) ≈ 1.00 × 10⁻³ T</Formula>
            <p>Answer: <strong>~1.0 mT</strong>.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 2.2.9"
        question={<>A long cylindrical wire of radius <strong>R = 2 mm</strong> carries a uniform current density and total current <strong>I = 5 A</strong>. Find <strong>B</strong> at <strong>r = 1 mm</strong> (inside).</>}
        hint="For r < R, the enclosed current scales as (r/R)²."
        answer={
          <>
            <p>Fraction enclosed: I<sub>enc</sub> = I (r/R)² = 5 · (0.001/0.002)² = 1.25 A.</p>
            <Formula>|B| = μ₀ I<sub>enc</sub> / (2π r) = (4π×10⁻⁷)(1.25) / (2π × 0.001) = 2.5 × 10⁻⁴ T</Formula>
            <p>Equivalently, |B| = μ₀Ir/(2πR²) = (4π×10⁻⁷)(5)(0.001)/(2π × 4×10⁻⁶) ≈ 2.5 × 10⁻⁴ T.</p>
            <p>Answer: <strong>~0.25 mT</strong>. Inside the wire, B grows linearly with r from zero at the centre to μ₀I/(2πR) at the surface.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 2.2.10"
        question={<>Derive <strong>|B| = μ<sub>0</sub>I/(2πr)</strong> for an infinite straight wire from Ampère's law, with all the symmetry arguments spelled out.</>}
        hint="Three claims: B is azimuthal; B depends only on r; choose a coaxial circular loop."
        answer={
          <>
            <p><strong>Symmetry 1 (axial):</strong> the system is invariant under rotation about the wire and translation along it. So B can only depend on r (the perpendicular distance), not on z or φ.</p>
            <p><strong>Symmetry 2 (mirror):</strong> reflecting the geometry across any plane containing the wire reverses the sense of current flow and reverses any radial or axial B component. The only B component preserved is azimuthal. So <strong>B = B(r) φ̂</strong>.</p>
            <p><strong>Apply Ampère</strong> to a circular Amperian loop of radius r coaxial with the wire. B is parallel to dℓ everywhere, |B| is constant:</p>
            <Formula>∮ B · dℓ = |B| · 2π r = μ₀ I</Formula>
            <Formula>|B| = μ₀ I / (2π r)</Formula>
            <p>That's the full chain: symmetry → field structure → Ampère → answer.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 2.2.11"
        question={<>Conceptual: the slider above lets you stack up to five parallel wires. If three carry +I and two carry −I, all threading the Amperian loop, what does <strong>∮ B · dℓ</strong> equal?</>}
        hint="The right-hand side is the net current, with sign."
        answer={
          <>
            <p>Net enclosed current is <strong>+3I − 2I = +I</strong>. So <strong>∮ B · dℓ = μ₀ I</strong>. Five wires worth of magnetic complexity collapse to one wire's worth as far as the line integral is concerned. The field itself is more complicated (not symmetric anywhere), but the integral around any loop enclosing all five still equals μ₀I.</p>
          </>
        }
      />
    </>
  );

  return (
    <LabShell
      slug={SLUG}
      labSubtitle="Amperian Loop Around a Bundle of Wires"
      labId="ampere-2.2 / ∮B·dℓ = μ₀I_enc"
      labContent={labContent}
      prose={prose}
    />
  );
}
