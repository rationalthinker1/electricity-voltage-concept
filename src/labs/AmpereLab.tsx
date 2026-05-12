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
import { LabGrid, LegendItem } from '@/components/LabLayout';
import { LabShell } from '@/components/LabShell';
import { MathBlock, Pullout } from '@/components/Prose';
import { Readout } from '@/components/Readout';
import { Cite } from '@/components/SourcesList';
import { Slider } from '@/components/Slider';
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
    const { ctx, w, h } = info;
    let raf = 0;
    let phase = 0;

    function draw() {
      const { I, r_mm, nWires } = stateRef.current;
      ctx.fillStyle = '#0d0d10';
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
      ctx.strokeStyle = 'rgba(108,197,194,0.95)';
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
      ctx.fillStyle = '#ff6b2a';
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
      ctx.fillStyle = 'rgba(108,197,194,0.95)';
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
      ctx.fillStyle = '#ff6b2a';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillText(`∮ B·dℓ = ${pretty(circ)} T·m`, 24, 28);
      ctx.fillStyle = 'rgba(108,197,194,0.95)';
      ctx.fillText(`μ₀ I_enc = ${pretty(mu0Ienc)} T·m`, 24, 48);
      ctx.fillStyle = 'rgba(160,158,149,0.85)';
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
      <h3>The magnetic Gauss</h3>
      <p>
        Gauss's law for electricity says: pick any closed surface, sum up the electric flux through it, and you get the charge inside divided
        by <strong>ε<sub>0</sub></strong>. Ampère's law is the magnetic equivalent — with one geometric twist<Cite id="ampere-1826" in={SOURCES} />.
        Instead of a closed <em>surface</em> bounding a 3D region, you draw a closed <em>loop</em> bounding a 2D surface, and instead of flux you
        sum a line integral of <strong>B</strong>. The right-hand side counts current threading the loop, scaled by <strong>μ<sub>0</sub></strong>.
      </p>
      <p>
        The statement is exact: no matter how the field bends or twists around the source, integrating it along a closed path picks out exactly
        the enclosed current<Cite id="griffiths-2017" in={SOURCES} />.
      </p>

      <h3>Why circles work</h3>
      <p>
        For a long straight wire, Biot–Savart tells you that <strong>B</strong> is tangent to circles centered on the wire and constant in
        magnitude on each circle. On the Amperian loop, then, the dot product <strong>B·dℓ</strong> is just <strong>|B| dℓ</strong>,
        and <strong>|B|</strong> comes out of the integral as a constant:
      </p>
      <MathBlock>∮ B · dℓ = |B| · 2πr = μ<sub>0</sub> I</MathBlock>
      <p>Solve for <strong>|B|</strong>:</p>
      <MathBlock>|B| = μ<sub>0</sub> I / (2πr)</MathBlock>
      <p>
        That's the entire derivation. One line, no integrals to evaluate<Cite id="feynman-II-13" in={SOURCES} />.
      </p>

      <h3>Symmetry buys you everything</h3>
      <p>
        The same trick that made Gauss easy for spheres and infinite planes makes Ampère easy for cylinders and solenoids. The list of geometries
        where you can pull <strong>B</strong> straight out of the integral is small: long straight wires (circular loops), infinite solenoids
        (rectangular loops along the axis), toroidal coils (circles inside the toroid). Each rests on a single symmetry argument that tells you
        where <strong>B</strong> points and on which surface it's uniform<Cite id="griffiths-2017" in={SOURCES} />.
      </p>
      <Pullout>
        There is no magnetic charge. There is only <em>enclosed current</em> — and the geometry it forces on the field.
      </Pullout>
      <p>
        When symmetry is broken — bent wires, finite solenoids, off-axis points — Ampère's law still holds, but you can no longer
        pull <strong>B</strong> outside the integral. You're left with a non-trivial line integral, and Biot–Savart becomes the easier tool.
      </p>

      <h3>What "enclosed" means</h3>
      <p>
        The right-hand side is the net current piercing any surface bounded by your Amperian loop. Push the surface around like a soap bubble;
        the count is invariant. A wire carrying <strong>I</strong> in one direction adds <strong>+I</strong>; a wire carrying <strong>I</strong>
        back adds <strong>−I</strong>; the pair cancels. The slider above lets you stack up to five parallel wires;
        <strong>I<sub>enc</sub></strong> rises in lockstep with the count, and so does <strong>|B|</strong> at the Amperian radius.
      </p>

      <h4>Maxwell's correction</h4>
      <p>
        The form above is the <em>static</em> Ampère's law. Maxwell discovered that it's incomplete: if the electric field itself is changing in
        time, you have to add a term <strong>μ<sub>0</sub>ε<sub>0</sub> dE/dt</strong> — the <em>displacement current</em><Cite id="maxwell-1865" in={SOURCES} />.
        With that correction in place, the equation says that magnetic field circulates around both real current <em>and</em> changing E. That single
        term is what makes electromagnetic waves possible: oscillating E and B regenerate each other, propagating outward at <strong>c</strong>.
        For everything in this lab, currents are steady and the correction vanishes — but it's lurking behind the next chapter.
      </p>
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
