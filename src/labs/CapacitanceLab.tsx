/**
 * Lab 4.1 — Capacitance
 *
 *   C = ε₀ εᵣ A / d     U = ½ C V²     u_E = ½ ε₀ εᵣ E²
 *
 * Parallel-plate capacitor. Sliders pick area, gap, voltage, and dielectric.
 * The canvas shows the two plates (+/-) with E-field arrows in the gap and
 * ± charge dots whose density scales with surface charge σ = Q/A. Capacitance
 * is the highlighted "punchline" readout.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { LabGrid, LegendItem } from '@/components/LabLayout';
import { LabShell } from '@/components/LabShell';
import { MathBlock, Pullout } from '@/components/Prose';
import { Readout } from '@/components/Readout';
import { Cite } from '@/components/SourcesList';
import { Slider } from '@/components/Slider';
import { TryIt } from '@/components/TryIt';
import { Formula } from '@/components/Formula';
import {PHYS, eng, engJsx } from '@/lib/physics';
import { BASE_LAB_SOURCES } from '@/labs/data/manifest';
import { getCanvasColors } from '@/lib/canvasTheme';

const SLUG = 'capacitance';
const SOURCES = BASE_LAB_SOURCES[SLUG]!;

export default function CapacitanceLab() {
  const [A_cm2, setACm2] = useState(100);
  const [d_mm, setDMm] = useState(1.0);
  const [V, setV] = useState(12);
  const [er, setEr] = useState(1.0);

  const computed = useMemo(() => {
    const A_m2 = A_cm2 * 1e-4; // cm² → m²
    const d_m = d_mm * 1e-3;   // mm → m
    const C = (PHYS.eps_0 * er * A_m2) / d_m;
    const Q = C * V;
    const E = V / d_m;
    const sigma = Q / A_m2;
    const U = 0.5 * C * V * V;
    const uE = 0.5 * PHYS.eps_0 * er * E * E;
    return { C, Q, E, sigma, U, uE };
  }, [A_cm2, d_mm, V, er]);

  const stateRef = useRef({ A_cm2, d_mm, V, er, computed });
  useEffect(() => {
    stateRef.current = { A_cm2, d_mm, V, er, computed };
  }, [A_cm2, d_mm, V, er, computed]);

  const setupCanvas = useCallback((info: CanvasInfo) => {
    const { ctx, w: W, h: H } = info;
    let raf = 0;
    let phase = 0;

    function roundRect(x: number, y: number, w: number, h: number, r: number) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    }

    function plateGrad(x: number, y: number, w: number, h: number, color: string) {
      const grd = ctx.createLinearGradient(x, y, x, y + h);
      grd.addColorStop(0, color);
      grd.addColorStop(1, color + '99');
      ctx.fillStyle = grd;
      ctx.shadowColor = color + 'a0';
      ctx.shadowBlur = 14;
      roundRect(x, y, w, h, 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    function drawCharges(xL: number, y: number, plateW: number, count: number, sym: string, color: string) {
      ctx.fillStyle = color;
      ctx.font = 'bold 12px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let i = 0; i < count; i++) {
        const x = xL + 10 + ((plateW - 20) * (i + 0.5)) / count;
        ctx.fillText(sym, x, y);
      }
    }

    function drawCapacitorBattery(x: number, y: number, topY: number, botY: number) {
      ctx.strokeStyle = 'rgba(236,235,229,0.7)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(x - 14, y - 12);
      ctx.lineTo(x + 14, y - 12);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x - 7, y + 4);
      ctx.lineTo(x + 7, y + 4);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y - 12);
      ctx.lineTo(x, topY + 3);
      ctx.lineTo(x + 38, topY + 3);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y + 4);
      ctx.lineTo(x, botY - 3);
      ctx.lineTo(x + 38, botY - 3);
      ctx.stroke();

      ctx.fillStyle = getCanvasColors().pink;
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('+', x + 22, y - 18);
      ctx.fillStyle = getCanvasColors().blue;
      ctx.fillText('−', x + 18, y + 16);
    }

    function draw() {
      const s = stateRef.current;
      const out = s.computed;
      ctx.fillStyle = getCanvasColors().bg;
      ctx.fillRect(0, 0, W, H);
      phase += 0.018;

      // Geometry
      const refW = Math.min(W * 0.62, 640);
      const wScale = Math.sqrt(s.A_cm2 / 1000);
      const plateW = Math.max(120, refW * (0.35 + 0.65 * wScale));
      const gMin = 18, gMax = H * 0.55;
      const dNorm = (Math.log10(s.d_mm) - Math.log10(0.01)) / (Math.log10(10) - Math.log10(0.01));
      const gap = gMin + (gMax - gMin) * dNorm;
      const cx = W / 2, cy = H / 2;
      const plateThick = 7;
      const topY = cy - gap / 2 - plateThick / 2;
      const botY = cy + gap / 2 + plateThick / 2;
      const xL = cx - plateW / 2;

      // Energy-density haze
      const hazeAlpha = Math.max(0.06, Math.min(0.55, Math.log10(out.uE + 1) * 0.10 + 0.10));
      const hazeGrd = ctx.createLinearGradient(0, topY + plateThick, 0, botY - plateThick);
      hazeGrd.addColorStop(0, `rgba(255,107,42,${hazeAlpha * 0.45})`);
      hazeGrd.addColorStop(0.5, `rgba(255,107,42,${hazeAlpha})`);
      hazeGrd.addColorStop(1, `rgba(255,107,42,${hazeAlpha * 0.45})`);
      ctx.fillStyle = hazeGrd;
      ctx.fillRect(xL, topY + plateThick, plateW, botY - topY - plateThick * 2);

      // E-field arrows
      const usableSpanRaw = botY - topY - plateThick * 2 - 16;
      if (usableSpanRaw > 8) {
        const nE = Math.max(4, Math.min(28, Math.round(Math.log10(out.E + 10) * 6)));
        const baseY = topY + plateThick + 8;
        const arrLen = Math.min(22, usableSpanRaw * 0.45);
        for (let i = 0; i < nE; i++) {
          const fx = xL + 18 + ((plateW - 36) * (i + 0.5)) / nE;
          const cycle = (phase * 80 + i * 7) % usableSpanRaw;
          const y1 = baseY + cycle;
          const y0 = y1 - arrLen;
          ctx.strokeStyle = 'rgba(255,59,110,0.85)';
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(fx, Math.max(baseY, y0));
          ctx.lineTo(fx, y1);
          ctx.stroke();
          ctx.fillStyle = 'rgba(255,59,110,0.95)';
          ctx.beginPath();
          ctx.moveTo(fx, y1);
          ctx.lineTo(fx - 3.5, y1 - 6);
          ctx.lineTo(fx + 3.5, y1 - 6);
          ctx.closePath();
          ctx.fill();
        }
      }

      plateGrad(xL, topY, plateW, plateThick, '#ff3b6e');
      plateGrad(xL, botY - plateThick, plateW, plateThick, '#5baef8');

      // Charge dot count scales with σ (capped)
      const target = Math.min(60, Math.max(6, Math.round(Math.log10(out.sigma * 1e8 + 1) * 12)));
      drawCharges(xL, topY - 7, plateW, target, '+', '#ff3b6e');
      drawCharges(xL, botY + plateThick + 7, plateW, target, '−', '#5baef8');

      drawCapacitorBattery(xL - 70, cy, topY, botY);

      ctx.strokeStyle = 'rgba(236,235,229,0.45)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(xL - 38, topY + plateThick / 2);
      ctx.lineTo(xL, topY + plateThick / 2);
      ctx.moveTo(xL - 38, botY - plateThick / 2);
      ctx.lineTo(xL, botY - plateThick / 2);
      ctx.stroke();

      // Labels
      ctx.fillStyle = getCanvasColors().accent;
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(`C = ${eng(out.C, 3, 'F')}`, 24, 28);
      ctx.fillStyle = getCanvasColors().pink;
      ctx.fillText(`V = ${s.V.toFixed(1)} V`, 24, 48);
      ctx.fillText(`E = ${eng(out.E, 3, 'V/m')}`, 24, 66);
      ctx.fillStyle = getCanvasColors().textDim;
      ctx.textAlign = 'right';
      ctx.fillText(
        `A = ${s.A_cm2.toFixed(0)} cm²   d = ${s.d_mm.toFixed(2)} mm   εr = ${s.er.toFixed(1)}`,
        W - 24, 28,
      );

      raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  const labContent = (
    <LabGrid
      canvas={<AutoResizeCanvas height={460} setup={setupCanvas} />}
      legend={
        <>
          <LegendItem swatchColor="var(--pink)">+ charge / E field</LegendItem>
          <LegendItem swatchColor="var(--blue)">− charge</LegendItem>
          <LegendItem swatchColor="var(--accent)">Stored energy density</LegendItem>
          <LegendItem style={{ marginLeft: 'auto', color: 'var(--accent)' }}>
            ↳ Energy lives between the plates, not on them
          </LegendItem>
        </>
      }
      inputs={
        <>
          <Slider
            sym="A" label="Plate area"
            value={A_cm2} min={1} max={1000} step={1}
            format={(v) => v.toFixed(0) + ' cm²'}
            metaLeft="1 cm²" metaRight="1000 cm²"
            onChange={setACm2}
          />
          <Slider
            sym="d" label="Plate separation"
            value={d_mm} min={0.01} max={10} step={0.01}
            format={(v) => v.toFixed(2) + ' mm'}
            metaLeft="0.01 mm" metaRight="10 mm"
            onChange={setDMm}
          />
          <Slider
            sym="V" label="Applied voltage"
            value={V} min={0.1} max={1000} step={0.1}
            format={(v) => v.toFixed(1) + ' V'}
            metaLeft="0.1 V" metaRight="1000 V"
            onChange={setV}
          />
          <Slider
            sym={<>ε<sub>r</sub></>} label="Dielectric (rel. permittivity)"
            value={er} min={1} max={100} step={0.1}
            format={(v) => v.toFixed(1)}
            metaLeft="1 (vacuum)" metaRight="100 (ceramic)"
            onChange={setEr}
          />
        </>
      }
      outputs={
        <>
          <Readout sym="C" label="Capacitance" value={engJsx(computed.C, 3, 'F')} highlight />
          <Readout sym="Q" label="Stored charge" value={engJsx(computed.Q, 3, 'C')} />
          <Readout sym="E" label="Field between plates" value={engJsx(computed.E, 3, 'V/m')} />
          <Readout sym="σ" label="Surface charge density" value={engJsx(computed.sigma, 3, 'C/m²')} />
          <Readout sym="U" label="Stored energy" value={engJsx(computed.U, 3, 'J')} />
          <Readout sym={<>u<sub>E</sub></>} label="Field energy density" value={engJsx(computed.uE, 3, 'J/m³')} />
        </>
      }
    />
  );

  const prose = (
    <>
      <h3 className="font-2 font-normal italic text-9 leading-1 my-4xl mb-xl text-text tracking-1">Context</h3>
      <p className="mb-prose-3">
        A capacitor is two conductors separated by an insulator. Push charge onto one, pull an equal charge off the other, and a voltage
        builds across the gap. The thing that makes a capacitor a <em className="italic text-text">capacitor</em> is that this voltage is exactly proportional to
        the stored charge. Real devices show up everywhere: every digital logic gate switches by charging and discharging femtofarads
        of gate capacitance; every switching power supply uses microfarads of bulk hold-up; the touchscreen on your phone reads
        position by measuring the change in capacitance when a finger gets close.
      </p>
      <p className="mb-prose-3">
        The parallel-plate formula below assumes plate area <strong className="text-text font-medium">A ≫ d²</strong>, plates much larger than the gap, so fringing fields
        at the edges are a small correction<Cite id="griffiths-2017" in={SOURCES} />. It breaks down when the field gets large enough to
        ionize the dielectric — air breaks down near <strong className="text-text font-medium">3×10⁶ V/m</strong>, and every solid dielectric has its own ceiling<Cite id="jackson-1999" in={SOURCES} />.
        Above that, the gap arcs and the capacitor is no longer a capacitor.
      </p>

      <h3 className="font-2 font-normal italic text-9 leading-1 my-4xl mb-xl text-text tracking-1">Formula</h3>
      <MathBlock>C = ε<sub>0</sub> ε<sub>r</sub> A / d &nbsp;&emsp; Q = C V &nbsp;&emsp; U = ½ C V² = Q² / (2C)</MathBlock>
      <p className="mb-prose-3">
        <strong className="text-text font-medium">C</strong> capacitance (farads). <strong className="text-text font-medium">ε<sub>0</sub></strong> = 8.854×10⁻¹² F/m, the permittivity of free space<Cite id="codata-2018" in={SOURCES} />.
        <strong className="text-text font-medium">ε<sub>r</sub></strong> relative permittivity of the dielectric in the gap (1 for vacuum, ~80 for water).
        <strong className="text-text font-medium">A</strong> plate area, <strong className="text-text font-medium">d</strong> gap. <strong className="text-text font-medium">Q</strong> charge on one plate (the other holds −Q). <strong className="text-text font-medium">V</strong> voltage
        between the plates. <strong className="text-text font-medium">U</strong> stored energy.
      </p>

      <h3 className="font-2 font-normal italic text-9 leading-1 my-4xl mb-xl text-text tracking-1">Intuition</h3>
      <p className="mb-prose-3">
        A capacitor doesn't store charge. The plates always have <em className="italic text-text">+Q on one and −Q on the other</em>, the total being zero. What's stored
        is the <em className="italic text-text">separation</em>, and the electric field that fills the gap because of it. Bigger plates hold more separated charge before
        the voltage climbs (more area means more places to put each new electron without crowding); a thinner gap means less voltage per unit
        of charge (the line integral E·d shrinks); a polarizable dielectric inside lets the molecules align against the applied field and
        cancel part of it, so more charge fits at the same voltage.
      </p>
      <Pullout>
        A capacitor doesn't store charge. It stores the <em className="italic text-text">separation</em> — and the field that fills the space because of it.
      </Pullout>

      <h3 className="font-2 font-normal italic text-9 leading-1 my-4xl mb-xl text-text tracking-1">Reasoning</h3>
      <p className="mb-prose-3">
        Why <strong className="text-text font-medium">A</strong> on top, <strong className="text-text font-medium">d</strong> on the bottom, and ε<sub>r</sub> multiplying? <strong className="text-text font-medium">A</strong> on top because
        capacitance scales with how many parallel "slots" the plates offer. <strong className="text-text font-medium">d</strong> on the bottom because a wider gap means a larger
        voltage to push charges across the same field — so the same Q produces more V, dropping Q/V. <strong className="text-text font-medium">ε<sub>r</sub></strong> on top because
        the dielectric's polarization weakens the net field, so V drops for the same Q, so Q/V (= C) rises<Cite id="jackson-1999" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        Limits. As <strong className="text-text font-medium">d → 0</strong>, C diverges — and so does the field E = V/d at any fixed V, which is the physical reason no real cap
        survives an arbitrarily thin gap. As <strong className="text-text font-medium">A → ∞</strong>, C grows linearly, but so does the device size; the more useful figure of
        merit is capacitance per unit volume <strong className="text-text font-medium">C/(Ad) = ε<sub>0</sub>ε<sub>r</sub>/d²</strong>, which is why dielectric thickness, not area,
        dominates electrolytic and ceramic designs.
      </p>

      <h3 className="font-2 font-normal italic text-9 leading-1 my-4xl mb-xl text-text tracking-1">Derivation</h3>
      <p className="mb-prose-3">
        Step one — the field. Take a Gaussian pillbox straddling the inner face of the top plate. The flux through its top is zero (E = 0 inside
        a conductor at equilibrium); the flux through its bottom is E·A pointing down into the gap. Gauss's law equates that to
        <strong className="text-text font-medium"> Q<sub>enc</sub>/ε<sub>0</sub> = σA/ε<sub>0</sub></strong>, giving<Cite id="griffiths-2017" in={SOURCES} />:
      </p>
      <Formula>E = σ / ε<sub>0</sub> = Q / (ε<sub>0</sub> A)</Formula>
      <p className="mb-prose-3">
        Step two — the voltage. The field in the gap is uniform, perpendicular to the plates. Integrating E along a straight line from one
        plate to the other:
      </p>
      <Formula>V = ∫ E · dℓ = E d = Q d / (ε<sub>0</sub> A)</Formula>
      <p className="mb-prose-3">Step three — Q/V isolates the geometry-only piece:</p>
      <Formula>C = Q / V = ε<sub>0</sub> A / d</Formula>
      <p className="mb-prose-3">
        Step four — add a dielectric. Inside a polarizable medium, bound charges produce a counter-field that scales the net field by
        <strong className="text-text font-medium"> 1/ε<sub>r</sub></strong>. The voltage scales by the same factor, so C climbs by ε<sub>r</sub><Cite id="jackson-1999" in={SOURCES} />:
      </p>
      <Formula>C = ε<sub>0</sub> ε<sub>r</sub> A / d</Formula>
      <p className="mb-prose-3">
        Step five — the energy. Build Q up from zero. At intermediate charge <strong className="text-text font-medium">q</strong>, the voltage between plates is q/C, and the work
        to move dq across that gap is dW = (q/C) dq. Integrate:
      </p>
      <Formula>U = ∫<sub>0</sub><sup>Q</sup> (q/C) dq = Q² / (2C) = ½ C V²</Formula>
      <p className="mb-prose-3">
        Equivalently, the energy density of the field in the gap is <strong className="text-text font-medium">u<sub>E</sub> = ½ε<sub>0</sub>ε<sub>r</sub>E²</strong>, and multiplying
        by the gap volume Ad recovers ½CV² exactly. The plates don't hold the energy — the field in the gap does<Cite id="feynman-II-2" in={SOURCES} />.
      </p>

      <h3 className="font-2 font-normal italic text-9 leading-1 my-4xl mb-xl text-text tracking-1">Worked problems</h3>

      <TryIt
        tag="Problem 4.1.1"
        question={<>A parallel-plate capacitor in air: <strong className="text-text font-medium">A = 10 cm²</strong>, <strong className="text-text font-medium">d = 1 mm</strong>. What is C?</>}
        hint={<>Direct plug-in. ε<sub>r</sub> ≈ 1 for air.</>}
        answer={
          <>
            <p className="mb-prose-3">Convert and substitute:</p>
            <Formula>C = ε<sub>0</sub> A / d = (8.854×10⁻¹² F/m)(10⁻³ m²) / (10⁻³ m)</Formula>
            <Formula>C = 8.854×10⁻¹² F ≈ <strong className="text-text font-medium">8.9 pF</strong></Formula>
            <p className="mb-prose-3">A few picofarads. This is why "build a one-farad cap out of two plates and an air gap" is hopeless — you'd need plate
            area the size of a small city.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 4.1.2"
        question={<>Same capacitor, but fill the gap with mylar (<strong className="text-text font-medium">ε<sub>r</sub> ≈ 3</strong>). What is C now?</>}
        answer={
          <>
            <Formula>C = ε<sub>r</sub> · C<sub>air</sub> = 3 × 8.9 pF ≈ <strong className="text-text font-medium">27 pF</strong></Formula>
            <p className="mb-prose-3">Dielectrics buy you a multiplicative factor at no geometric cost. Ceramics with ε<sub>r</sub> &gt; 1000 can push the same
            geometry up by three orders of magnitude<Cite id="jackson-1999" in={SOURCES} />.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 4.1.3"
        question={<>The mylar capacitor above (27 pF) is connected to a <strong className="text-text font-medium">9 V</strong> battery. How much charge sits on each plate?
          How much energy is stored?</>}
        answer={
          <>
            <Formula>Q = C V = (27×10⁻¹² F)(9 V) = 2.4×10⁻¹⁰ C ≈ <strong className="text-text font-medium">0.24 nC</strong></Formula>
            <Formula>U = ½ C V² = ½ (27×10⁻¹²)(81) ≈ <strong className="text-text font-medium">1.1×10⁻⁹ J</strong> ≈ 1.1 nJ</Formula>
            <p className="mb-prose-3">A nanojoule. Capacitors at this scale are timing elements, not energy reservoirs.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 4.1.4"
        question={<>A <strong className="text-text font-medium">1 µF</strong> capacitor is charged to <strong className="text-text font-medium">5 V</strong>, then connected in parallel with an
          identical uncharged 1 µF capacitor. What is the final voltage on each? How much energy is lost?</>}
        hint="Charge is conserved (it has nowhere to go). Energy is not — heat dissipates in the connecting wires."
        answer={
          <>
            <p className="mb-prose-3">Charge conservation: total Q = (1 µF)(5 V) = 5 µC, redistributed across 2 µF of combined capacitance:</p>
            <Formula>V<sub>final</sub> = Q / C<sub>total</sub> = 5 µC / 2 µF = <strong className="text-text font-medium">2.5 V</strong></Formula>
            <p className="mb-prose-3">Initial energy: U<sub>i</sub> = ½(1 µF)(5 V)² = 12.5 µJ. Final energy: U<sub>f</sub> = ½(2 µF)(2.5 V)² = 6.25 µJ.</p>
            <Formula>ΔU = 12.5 − 6.25 = <strong className="text-text font-medium">6.25 µJ lost</strong> (half!)</Formula>
            <p className="mb-prose-3">Half the energy vanishes as heat in the wires, no matter how low their resistance. The result is independent of R —
            it's a fundamental consequence of redistributing charge between two ideal caps<Cite id="griffiths-2017" in={SOURCES} />.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 4.1.5"
        question={<>Three capacitors in series: <strong className="text-text font-medium">1 µF, 2 µF, 3 µF</strong>. Equivalent capacitance?</>}
        hint="In series, reciprocals add (the gap-distances effectively stack)."
        answer={
          <>
            <Formula>1/C<sub>eq</sub> = 1/1 + 1/2 + 1/3 = 6/6 + 3/6 + 2/6 = 11/6 µF⁻¹</Formula>
            <Formula>C<sub>eq</sub> = 6/11 µF ≈ <strong className="text-text font-medium">0.545 µF</strong></Formula>
            <p className="mb-prose-3">Series caps give you <em className="italic text-text">less</em> than the smallest one. The smallest cap bottlenecks the chain.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 4.1.6"
        question={<>Same three caps in <strong className="text-text font-medium">parallel</strong>: 1 µF, 2 µF, 3 µF. Equivalent capacitance?</>}
        answer={
          <>
            <p className="mb-prose-3">In parallel, plates effectively combine — areas add:</p>
            <Formula>C<sub>eq</sub> = 1 + 2 + 3 = <strong className="text-text font-medium">6 µF</strong></Formula>
            <p className="mb-prose-3">Parallel caps are the easy case. Voltage is common; charge splits in proportion to each C.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 4.1.7"
        question={<>A <strong className="text-text font-medium">1 µF</strong> capacitor is initially at 10 V and discharges through a <strong className="text-text font-medium">1 kΩ</strong> resistor.
          What is the time constant τ? What is the voltage at <strong className="text-text font-medium">t = 1 ms</strong>?</>}
        answer={
          <>
            <Formula>τ = R C = (10³ Ω)(10⁻⁶ F) = 10⁻³ s = <strong className="text-text font-medium">1 ms</strong></Formula>
            <p className="mb-prose-3">At t = τ, the voltage has fallen to 1/e of its initial value:</p>
            <Formula>V(1 ms) = 10 · e⁻¹ ≈ 10 × 0.368 ≈ <strong className="text-text font-medium">3.7 V</strong></Formula>
            <p className="mb-prose-3">One time constant is one e-fold; five time constants and the cap is essentially fully discharged<Cite id="griffiths-2017" in={SOURCES} />.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 4.1.8"
        question={<>Derive the capacitance of a <strong className="text-text font-medium">spherical capacitor</strong>: concentric spherical shells of inner radius
          R<sub>1</sub> and outer radius R<sub>2</sub>, with vacuum between them.</>}
        hint="Use Gauss's law for the field between, then integrate E·dr from R₁ to R₂."
        answer={
          <>
            <p className="mb-prose-3">Between the shells, by Gauss with a spherical Gaussian surface:</p>
            <Formula>E(r) = Q / (4π ε<sub>0</sub> r²)</Formula>
            <p className="mb-prose-3">Voltage by line integral:</p>
            <Formula>V = ∫<sub>R₁</sub><sup>R₂</sup> E dr = (Q / 4π ε<sub>0</sub>) (1/R<sub>1</sub> − 1/R<sub>2</sub>)</Formula>
            <Formula>C = Q/V = 4π ε<sub>0</sub> R<sub>1</sub> R<sub>2</sub> / (R<sub>2</sub> − R<sub>1</sub>)</Formula>
            <p className="mb-prose-3">As R<sub>2</sub> → ∞, this reduces to <strong className="text-text font-medium">C = 4πε<sub>0</sub>R<sub>1</sub></strong>, the self-capacitance of a single
            isolated sphere<Cite id="jackson-1999" in={SOURCES} />.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 4.1.9"
        question={<>A coaxial cable (RG-58) has inner conductor radius <strong className="text-text font-medium">a = 0.5 mm</strong>, outer shield radius
          <strong className="text-text font-medium"> b = 1.5 mm</strong>, polyethylene dielectric (<strong className="text-text font-medium">ε<sub>r</sub> ≈ 2.3</strong>). Derive C per unit length.</>}
        hint="Cylindrical Gauss between the conductors gives E(r). Integrate radially."
        answer={
          <>
            <p className="mb-prose-3">Between the conductors, by Gauss on a coaxial cylinder of radius r and length L:</p>
            <Formula>E(r) = λ / (2π ε<sub>0</sub> ε<sub>r</sub> r), &nbsp; where λ = Q/L</Formula>
            <Formula>V = ∫<sub>a</sub><sup>b</sup> E dr = (λ / 2π ε<sub>0</sub> ε<sub>r</sub>) ln(b/a)</Formula>
            <Formula>C/L = λ / V = 2π ε<sub>0</sub> ε<sub>r</sub> / ln(b/a)</Formula>
            <p className="mb-prose-3">Plug in: ln(1.5/0.5) = ln 3 ≈ 1.099. C/L = 2π(8.854×10⁻¹²)(2.3) / 1.099 ≈ <strong className="text-text font-medium">116 pF/m</strong>. Datasheet RG-58:
            ~100 pF/m<Cite id="griffiths-2017" in={SOURCES} />. Match within tolerance.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 4.1.10"
        question={<>An air-gap capacitor has <strong className="text-text font-medium">d = 1 mm</strong> with <strong className="text-text font-medium">V = 100 V</strong> across it. What is the energy
          density in the gap?</>}
        answer={
          <>
            <Formula>E = V/d = 100 / 10⁻³ = 10⁵ V/m</Formula>
            <Formula>u<sub>E</sub> = ½ ε<sub>0</sub> E² = ½ (8.854×10⁻¹²)(10¹⁰) ≈ <strong className="text-text font-medium">4.4×10⁻² J/m³</strong></Formula>
            <p className="mb-prose-3">About 44 mJ per cubic meter — tiny. To compare: air breakdown (3×10⁶ V/m) reaches only ~40 J/m³. Field energy density is
            cheap until the field gets enormous<Cite id="jackson-1999" in={SOURCES} />.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 4.1.11"
        question={<>The Leyden jar, invented in 1745 — a glass jar lined inside and out with metal foil. Estimate its capacitance:
          area <strong className="text-text font-medium">A ≈ 300 cm²</strong>, glass thickness <strong className="text-text font-medium">d ≈ 2 mm</strong>, glass ε<sub>r</sub> ≈ 7. Typical operating voltage?</>}
        answer={
          <>
            <Formula>C = ε<sub>0</sub> ε<sub>r</sub> A / d = (8.854×10⁻¹²)(7)(0.03) / (2×10⁻³)</Formula>
            <Formula>C ≈ <strong className="text-text font-medium">0.93 nF</strong> ≈ 1 nF</Formula>
            <p className="mb-prose-3">Operating voltage was limited by glass breakdown — glass survives roughly 10⁷ V/m, so a 2 mm wall handles ~20 kV before
            puncturing. Eighteenth-century natural philosophers regularly ran them at several kilovolts, with energy ½ C V² of order tens
            of millijoules — enough to deliver a sharp shock to a chain of demonstrators.</p>
          </>
        }
      />
    </>
  );

  return (
    <LabShell
      slug={SLUG}
      labSubtitle="Parallel-Plate Capacitor"
      labId="capacitance-4.1 / C = εA/d"
      labContent={labContent}
      prose={prose}
    />
  );
}
