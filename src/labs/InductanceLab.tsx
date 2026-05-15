/**
 * Lab 4.2 — Inductance
 *
 *   V = − L dI/dt    L = μ₀ N² A / ℓ    U = ½ L I²
 *
 * Air-core solenoid. Sliders for turns, length, cross-section, dI/dt and I.
 * Visualization: helical coil with back-arcs/teal axial B-arrows/front-arcs.
 * Self-inductance L is the highlighted readout.
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

const SLUG = 'inductance';
const SOURCES = BASE_LAB_SOURCES[SLUG]!;

export default function InductanceLab() {
  const [N, setN] = useState(200);
  const [ell_cm, setEllCm] = useState(10);
  const [A_cm2, setACm2] = useState(5);
  const [dIdt, setDIdt] = useState(100);    // A/s
  const [I_inst, setIInst] = useState(1.0); // A

  const computed = useMemo(() => {
    const ell_m = ell_cm * 1e-2;
    const A_m2 = A_cm2 * 1e-4;
    const L = (PHYS.mu_0 * N * N * A_m2) / ell_m;
    const V = L * Math.abs(dIdt);
    const B = PHYS.mu_0 * (N / ell_m) * I_inst;
    const Phi = B * A_m2;
    const U = 0.5 * L * I_inst * I_inst;
    const tau = L / 1.0; // R = 1Ω
    return { L, V, B, Phi, U, tau };
  }, [N, ell_cm, A_cm2, dIdt, I_inst]);

  const stateRef = useRef({ N, ell_cm, A_cm2, dIdt, I_inst, computed });
  useEffect(() => {
    stateRef.current = { N, ell_cm, A_cm2, dIdt, I_inst, computed };
  }, [N, ell_cm, A_cm2, dIdt, I_inst, computed]);

  const setupCanvas = useCallback((info: CanvasInfo) => {
    const { ctx, w: W, h: H } = info;
    let raf = 0;
    let phase = 0;

    function draw() {
      const s = stateRef.current;
      const out = s.computed;

      ctx.fillStyle = getCanvasColors().bg;
      ctx.fillRect(0, 0, W, H);

      const margin = 110;
      const xL = margin, xR = W - margin;
      const cy = H * 0.55;
      const r_vis = Math.max(38, Math.min(95, Math.sqrt(s.A_cm2 / 5) * 60));
      const ellipseRatio = 0.32;
      const er = r_vis * ellipseRatio;
      const visibleTurns = 12;
      phase += 0.015;
      const flowSpeed = s.dIdt;
      const flowOffset = ((phase * flowSpeed * 0.04) % 1 + 1) % 1;

      // Halo proportional to B
      const halo = Math.max(0.06, Math.min(0.65, Math.log10(out.B * 1e3 + 1) * 0.13));
      const haloGrd = ctx.createLinearGradient(0, cy - r_vis * 2.5, 0, cy + r_vis * 2.5);
      haloGrd.addColorStop(0, `rgba(108,197,194,0)`);
      haloGrd.addColorStop(0.5, `rgba(108,197,194,${halo})`);
      haloGrd.addColorStop(1, `rgba(108,197,194,0)`);
      ctx.fillStyle = haloGrd;
      ctx.fillRect(xL - 30, cy - r_vis * 2.5, (xR - xL) + 60, r_vis * 5);

      // Back arcs
      for (let i = 0; i <= visibleTurns; i++) {
        const t = i / visibleTurns;
        const cx = xL + t * (xR - xL);
        ctx.save();
        ctx.globalAlpha = 0.35;
        ctx.strokeStyle = getCanvasColors().accent;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, er, r_vis, 0, Math.PI, 2 * Math.PI);
        ctx.stroke();
        ctx.restore();
      }

      // Axial B arrows
      const nB = 4;
      const Bmag = Math.log10(out.B * 1e3 + 1);
      const arrLen = 70 + Math.min(40, Bmag * 18);
      for (let i = 0; i < nB; i++) {
        const t = (i + 0.5) / nB;
        const cx = xL + t * (xR - xL) - arrLen / 2;
        ctx.strokeStyle = getCanvasColors().teal;
        ctx.fillStyle = getCanvasColors().teal;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + arrLen, cy);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + arrLen, cy);
        ctx.lineTo(cx + arrLen - 10, cy - 6);
        ctx.lineTo(cx + arrLen - 10, cy + 6);
        ctx.closePath();
        ctx.fill();
      }

      // Front arcs + current-direction dots
      for (let i = 0; i <= visibleTurns; i++) {
        const t = i / visibleTurns;
        const cx = xL + t * (xR - xL);
        ctx.strokeStyle = getCanvasColors().accent;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, er, r_vis, 0, 0, Math.PI);
        ctx.stroke();
        const dotPhase = (flowOffset + t) % 1;
        const ang = Math.PI * dotPhase;
        const dx = cx + Math.cos(ang) * er;
        const dy = cy + Math.sin(ang) * r_vis;
        ctx.fillStyle = getCanvasColors().accent;
        ctx.beginPath();
        ctx.arc(dx, dy, 2.4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Lead lines exiting each end
      ctx.strokeStyle = getCanvasColors().accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(xL, cy + r_vis);
      ctx.lineTo(xL - 40, cy + r_vis + 25);
      ctx.moveTo(xR, cy + r_vis);
      ctx.lineTo(xR + 40, cy + r_vis + 25);
      ctx.stroke();

      // Return-loop hints
      ctx.strokeStyle = getCanvasColors().tealSoft;
      ctx.lineWidth = 1;
      for (const sgn of [-1, 1] as const) {
        ctx.beginPath();
        ctx.ellipse(W / 2, cy, (xR - xL) / 2 + 50, r_vis * (1.8 + 0.3 * sgn), 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Current direction label
      ctx.fillStyle = getCanvasColors().accent;
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(s.dIdt >= 0 ? 'I ↗ rising' : 'I ↘ falling', xR + 10, cy - r_vis - 8);

      // Corner readouts
      ctx.fillStyle = getCanvasColors().teal;
      ctx.fillText(`B = ${eng(out.B, 3, 'T')} inside`, 24, 28);
      ctx.fillStyle = getCanvasColors().pink;
      ctx.fillText(`V_back = ${eng(out.V, 3, 'V')}`, 24, 48);
      ctx.fillStyle = getCanvasColors().accent;
      ctx.fillText(`L = ${eng(out.L, 3, 'H')}`, 24, 68);
      ctx.fillStyle = getCanvasColors().textDim;
      ctx.textAlign = 'right';
      ctx.fillText(
        `N = ${s.N}   ℓ = ${s.ell_cm.toFixed(1)} cm   A = ${s.A_cm2.toFixed(1)} cm²`,
        W - 24, 28,
      );
      ctx.fillText(
        `dI/dt = ${s.dIdt} A/s   I = ${s.I_inst.toFixed(2)} A`,
        W - 24, 48,
      );

      ctx.textAlign = 'center';
      ctx.save();
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = getCanvasColors().textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText(`(${s.N} turns; ${visibleTurns} shown)`, (xL + xR) / 2, cy + r_vis + 38);
      ctx.restore();

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
          <LegendItem swatchColor="var(--teal)">B field (axial inside)</LegendItem>
          <LegendItem swatchColor="var(--accent)">Current direction</LegendItem>
          <LegendItem swatchColor="var(--pink)">Induced back-EMF</LegendItem>
          <LegendItem style={{ marginLeft: 'auto', color: 'var(--accent)' }}>
            ↳ Energy lives inside the coil, in B
          </LegendItem>
        </>
      }
      inputs={
        <>
          <Slider
            sym="N" label="Turns"
            value={N} min={1} max={1000} step={1}
            format={(v) => v.toFixed(0)}
            metaLeft="1" metaRight="1000"
            onChange={setN}
          />
          <Slider
            sym="ℓ" label="Solenoid length"
            value={ell_cm} min={1} max={50} step={0.1}
            format={(v) => v.toFixed(1) + ' cm'}
            metaLeft="1 cm" metaRight="50 cm"
            onChange={setEllCm}
          />
          <Slider
            sym="A" label="Cross-section"
            value={A_cm2} min={0.1} max={100} step={0.1}
            format={(v) => v.toFixed(1) + ' cm²'}
            metaLeft="0.1 cm²" metaRight="100 cm²"
            onChange={setACm2}
          />
          <Slider
            sym="dI/dt" label="Rate of current change"
            value={dIdt} min={-1000} max={1000} step={1}
            format={(v) => (v >= 0 ? '+' : '') + v.toFixed(0) + ' A/s'}
            metaLeft="−1000 A/s" metaRight="+1000 A/s"
            onChange={setDIdt}
          />
          <Slider
            sym="I" label="Instantaneous current"
            value={I_inst} min={0} max={10} step={0.01}
            format={(v) => v.toFixed(2) + ' A'}
            metaLeft="0 A" metaRight="10 A"
            onChange={setIInst}
          />
        </>
      }
      outputs={
        <>
          <Readout sym="L" label="Self-inductance" value={engJsx(computed.L, 3, 'H')} highlight />
          <Readout sym={<>V<sub>ind</sub></>} label="Back-EMF" value={engJsx(computed.V, 3, 'V')} />
          <Readout sym="B" label="Field inside" value={engJsx(computed.B, 3, 'T')} />
          <Readout sym="Φ" label="Flux per turn" value={engJsx(computed.Phi, 3, 'Wb')} />
          <Readout sym="U" label="Stored energy" value={engJsx(computed.U, 3, 'J')} />
          <Readout sym="τ" label="L/R time const. (R = 1Ω)" value={engJsx(computed.tau, 3, 's')} />
        </>
      }
    />
  );

  const prose = (
    <>
      <h3 className="lab-section-h3">Context</h3>
      <p className="mb-prose-3">
        An inductor is the mirror of a capacitor. A capacitor stores energy in the electric field between separated charges; an inductor
        stores energy in the magnetic field around moving charges. Real inductors show up everywhere current needs to be smoothed or
        steered: choke coils in power supplies, primaries and secondaries in transformers, the kick coil in every car's ignition system,
        the loop antennas in RFID readers, the femtohenries of bond-wire inductance that limit how fast a CPU package can switch.
      </p>
      <p className="mb-prose-3">
        The solenoid formula below assumes the length is much greater than the diameter (so the field at the ends doesn't bleed off too
        soon), the turns are tightly wound (so the field is uniform inside), and ferromagnetic saturation hasn't kicked in. Push the field
        too high in an iron-cored coil and µ<sub>r</sub> drops as the domains run out of room to align — inductance falls, and the device
        stops behaving linearly<Cite id="jackson-1999" in={SOURCES} />.
      </p>

      <h3 className="lab-section-h3">Formula</h3>
      <MathBlock>L = µ<sub>0</sub> N² A / ℓ &nbsp;&emsp; V = − L dI/dt &nbsp;&emsp; U = ½ L I²</MathBlock>
      <p className="mb-prose-3">
        <strong className="text-text font-medium">L</strong> self-inductance (henries). <strong className="text-text font-medium">µ<sub>0</sub></strong> = 4π×10⁻⁷ T·m/A, the permeability of free space<Cite id="codata-2018" in={SOURCES} />.
        <strong className="text-text font-medium">N</strong> number of turns, <strong className="text-text font-medium">A</strong> cross-sectional area of the coil, <strong className="text-text font-medium">ℓ</strong> solenoid length.
        <strong className="text-text font-medium">V</strong> the induced back-EMF when current changes at rate <strong className="text-text font-medium">dI/dt</strong>. <strong className="text-text font-medium">U</strong> stored energy at current I.
      </p>

      <h3 className="lab-section-h3">Intuition</h3>
      <p className="mb-prose-3">
        An inductor is a flywheel for electricity. Once a current is flowing through it, the magnetic field surrounding the windings carries
        real, measurable energy — joules per cubic meter of field volume — and that energy can't disappear instantly when you try to interrupt
        the circuit. The coil <em className="italic text-text">fights</em> any change in its current by generating whatever voltage is needed to keep electrons flowing
        a moment longer<Cite id="feynman-II-17" in={SOURCES} />. The more turns, the more flux each loop links, the more energy stored, the
        more violent the fight.
      </p>
      <Pullout>
        An inductor is a flywheel for electricity. It hates the <em className="italic text-text">new</em> current. It loves the current you already gave it.
      </Pullout>

      <h3 className="lab-section-h3">Reasoning</h3>
      <p className="mb-prose-3">
        Why <strong className="text-text font-medium">N²</strong>, not just N? Doubling the turns does two things: it doubles the magnetic field (B = µ<sub>0</sub>nI scales
        linearly with turn density), and it doubles the number of loops that link that field. The product is N². This quadratic dependence
        is the single most important fact about real inductor design: doubling the wire used quadruples the inductance, which is why coils
        beat straight wires by enormous margins<Cite id="griffiths-2017" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        Why <strong className="text-text font-medium">A</strong> on top? Larger cross-section means more area for each loop to link, so more flux per turn.
        Why <strong className="text-text font-medium">ℓ</strong> on the bottom? A longer solenoid at fixed N has fewer turns per unit length, so the field inside is weaker.
        Why µ<sub>0</sub>? It's the fundamental constant relating current to magnetic field — the magnetic analog of ε<sub>0</sub>. Replace
        the air core with iron and you replace µ<sub>0</sub> with µ<sub>0</sub>µ<sub>r</sub>, gaining factors of hundreds to thousands until
        saturation.
      </p>

      <h3 className="lab-section-h3">Derivation</h3>
      <p className="mb-prose-3">
        Step one — the field inside. Apply Ampère's law to a rectangular loop straddling the side of an idealized infinite solenoid: one
        leg inside parallel to the axis, one leg outside (where B = 0 for an ideal solenoid), and two short cross-pieces. Only the inside
        leg contributes, and the enclosed current is <strong className="text-text font-medium">NI/ℓ × ℓ<sub>loop</sub></strong><Cite id="griffiths-2017" in={SOURCES} />:
      </p>
      <Formula>B = µ<sub>0</sub> n I = µ<sub>0</sub> (N/ℓ) I</Formula>
      <p className="mb-prose-3">Step two — the flux through one turn:</p>
      <Formula>Φ = B A = µ<sub>0</sub> (N/ℓ) I A</Formula>
      <p className="mb-prose-3">Step three — the total flux linkage. All N turns thread the same Φ:</p>
      <Formula>N Φ = µ<sub>0</sub> N² A I / ℓ</Formula>
      <p className="mb-prose-3">Step four — by definition, L is flux linkage per unit current:</p>
      <Formula>L = N Φ / I = µ<sub>0</sub> N² A / ℓ</Formula>
      <p className="mb-prose-3">
        Step five — induced EMF. By Faraday's law, dΦ/dt drives an EMF around each turn, and N turns multiply it. Substituting NΦ = LI:
      </p>
      <Formula>V = − d(NΦ)/dt = − L dI/dt</Formula>
      <p className="mb-prose-3">
        Step six — energy. To build current from 0 to I, the battery does work against this back-EMF. Power delivered at instantaneous
        current i is V·i = (L di/dt)·i. Integrate:
      </p>
      <Formula>U = ∫<sub>0</sub><sup>I</sup> L i di = ½ L I²</Formula>
      <p className="mb-prose-3">
        Equivalently, the energy density of the field is <strong className="text-text font-medium">u<sub>B</sub> = B²/(2µ<sub>0</sub>)</strong>, and multiplying by the
        interior volume Aℓ recovers ½LI² exactly. The windings don't store the energy — the magnetic field inside them does<Cite id="jackson-1999" in={SOURCES} />.
      </p>

      <h3 className="lab-section-h3">Worked problems</h3>

      <TryIt
        tag="Problem 4.2.1"
        question={<>An air-core solenoid: <strong className="text-text font-medium">ℓ = 10 cm</strong>, <strong className="text-text font-medium">N = 500</strong>, <strong className="text-text font-medium">A = 1 cm²</strong>. What is L?</>}
        answer={
          <>
            <Formula>L = µ<sub>0</sub> N² A / ℓ = (4π×10⁻⁷)(500²)(10⁻⁴) / (0.10)</Formula>
            <Formula>L = (4π×10⁻⁷)(2.5×10⁵)(10⁻³) ≈ <strong className="text-text font-medium">3.14×10⁻⁴ H</strong> ≈ 314 µH</Formula>
            <p className="mb-prose-3">A few hundred microhenries — a typical RF choke value<Cite id="griffiths-2017" in={SOURCES} />.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 4.2.2"
        question={<>Same solenoid, now wound on an iron core with <strong className="text-text font-medium">µ<sub>r</sub> ≈ 1000</strong>. New L?</>}
        hint="Iron magnifies µ. Below saturation, L scales linearly."
        answer={
          <>
            <Formula>L<sub>iron</sub> = µ<sub>r</sub> L<sub>air</sub> = 1000 × 314 µH = <strong className="text-text font-medium">0.314 H</strong></Formula>
            <p className="mb-prose-3">Three orders of magnitude bigger for the same geometry. This is why iron is in every transformer — until the core saturates
            and µ<sub>r</sub> collapses<Cite id="jackson-1999" in={SOURCES} />.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 4.2.3"
        question={<>Current through a <strong className="text-text font-medium">50 mH</strong> inductor is ramping at <strong className="text-text font-medium">10 A/s</strong>. What is the induced EMF?</>}
        answer={
          <>
            <Formula>|V| = L |dI/dt| = (50×10⁻³ H)(10 A/s) = <strong className="text-text font-medium">0.5 V</strong></Formula>
            <p className="mb-prose-3">Half a volt of back-EMF opposes the change — a steady, modest push that says "no, you don't get to ramp current any faster
            than this without paying more voltage"<Cite id="feynman-II-17" in={SOURCES} />.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 4.2.4"
        question={<>A series RL circuit with <strong className="text-text font-medium">L = 10 mH</strong> and <strong className="text-text font-medium">R = 100 Ω</strong> is suddenly connected to a battery.
          What is the time constant? What fraction of the steady-state current flows at <strong className="text-text font-medium">t = τ</strong>?</>}
        answer={
          <>
            <Formula>τ = L / R = (10×10⁻³ H) / (100 Ω) = 10⁻⁴ s = <strong className="text-text font-medium">100 µs</strong></Formula>
            <p className="mb-prose-3">At t = τ, the current has risen to (1 − e⁻¹) ≈ <strong className="text-text font-medium">63.2%</strong> of its final value.</p>
            <Formula>I(τ) = I<sub>∞</sub> · (1 − e⁻¹) ≈ 0.632 I<sub>∞</sub></Formula>
            <p className="mb-prose-3">RL circuits parallel RC in form, with the roles of voltage and current swapped<Cite id="griffiths-2017" in={SOURCES} />.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 4.2.5"
        question={<>Energy stored in a <strong className="text-text font-medium">10 mH</strong> inductor carrying <strong className="text-text font-medium">2 A</strong>?</>}
        answer={
          <>
            <Formula>U = ½ L I² = ½ (10×10⁻³)(4) = <strong className="text-text font-medium">0.02 J</strong> = 20 mJ</Formula>
            <p className="mb-prose-3">Modest energy — but try to interrupt that 2 A in a microsecond and you'll need to dissipate it somewhere. dI/dt = −2×10⁶ A/s
            implies a voltage spike of L · |dI/dt| = (10 mH)(2×10⁶) = <strong className="text-text font-medium">20,000 V</strong> across whatever opens the circuit.
            This is the spark-plug principle.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 4.2.6"
        question={<>Two coils share a common core with ideal coupling (<strong className="text-text font-medium">k = 1</strong>). Primary: N<sub>1</sub> = 100 turns, L<sub>1</sub> = 10 mH.
          Secondary: N<sub>2</sub> = 10 turns. Find L<sub>2</sub> and the mutual inductance M.</>}
        hint="L scales as N². For ideal coupling, M = √(L₁L₂)."
        answer={
          <>
            <Formula>L<sub>2</sub> = L<sub>1</sub> (N<sub>2</sub>/N<sub>1</sub>)² = 10 mH × (1/10)² = <strong className="text-text font-medium">0.1 mH</strong></Formula>
            <Formula>M = √(L<sub>1</sub> L<sub>2</sub>) = √(10⁻² · 10⁻⁴) = <strong className="text-text font-medium">10⁻³ H = 1 mH</strong></Formula>
            <p className="mb-prose-3">The mutual coupling matters more than either self-inductance for transformer action<Cite id="jackson-1999" in={SOURCES} />.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 4.2.7"
        question={<>An ideal transformer with turns ratio <strong className="text-text font-medium">1000 : 100</strong>. If primary voltage is 120 V<sub>rms</sub> at primary
          current 0.5 A<sub>rms</sub>, what are the secondary voltage and current?</>}
        hint="V and I both scale with the turns ratio — but in opposite directions. Power in = power out."
        answer={
          <>
            <Formula>V<sub>2</sub> = V<sub>1</sub> (N<sub>2</sub>/N<sub>1</sub>) = 120 (100/1000) = <strong className="text-text font-medium">12 V</strong></Formula>
            <Formula>I<sub>2</sub> = I<sub>1</sub> (N<sub>1</sub>/N<sub>2</sub>) = 0.5 × 10 = <strong className="text-text font-medium">5 A</strong></Formula>
            <p className="mb-prose-3">Power check: P<sub>1</sub> = 120 × 0.5 = 60 W, P<sub>2</sub> = 12 × 5 = 60 W. Transformers step voltage up or down at fixed
            power<Cite id="feynman-II-17" in={SOURCES} />.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 4.2.8"
        question={<>An RL circuit reaches <strong className="text-text font-medium">99%</strong> of its final current. How many time constants τ have passed?</>}
        answer={
          <>
            <p className="mb-prose-3">Set I(t) = 0.99 I<sub>∞</sub> in I(t) = I<sub>∞</sub>(1 − e<sup>−t/τ</sup>):</p>
            <Formula>0.99 = 1 − e<sup>−t/τ</sup> &nbsp;⇒&nbsp; e<sup>−t/τ</sup> = 0.01 &nbsp;⇒&nbsp; t/τ = ln 100 ≈ <strong className="text-text font-medium">4.6 τ</strong></Formula>
            <p className="mb-prose-3">Rule of thumb: five time constants is "fully settled" to within a fraction of a percent.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 4.2.9"
        question={<>A flyback transformer with primary <strong className="text-text font-medium">L = 1 mH</strong> switches at <strong className="text-text font-medium">f = 100 kHz</strong>, peak current
          <strong className="text-text font-medium"> I = 10 A</strong>. Energy stored per cycle? Average power delivered?</>}
        answer={
          <>
            <Formula>U<sub>peak</sub> = ½ L I² = ½ (10⁻³)(100) = <strong className="text-text font-medium">0.05 J = 50 mJ</strong></Formula>
            <Formula>P = U · f = (0.05)(10⁵) = <strong className="text-text font-medium">5000 W = 5 kW</strong></Formula>
            <p className="mb-prose-3">Each switching cycle, the primary builds up 50 mJ in its B field, then dumps it (through magnetic coupling) into the secondary.
            At 100 kHz, this becomes 5 kW of throughput — the operating range of switching power supplies for monitors and TVs.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 4.2.10"
        question={<>Why does an inductor "kick" hard when current is suddenly interrupted? Estimate the voltage spike if a <strong className="text-text font-medium">10 mH</strong>
          inductor's current drops at <strong className="text-text font-medium">dI/dt = −10⁶ A/s</strong>.</>}
        answer={
          <>
            <Formula>|V<sub>spike</sub>| = L |dI/dt| = (10⁻²)(10⁶) = <strong className="text-text font-medium">10,000 V = 10 kV</strong></Formula>
            <p className="mb-prose-3">Ten kilovolts. The inductor refuses to let its stored magnetic energy go to zero faster than the circuit will permit. If the
            external resistance is infinite (open switch), the voltage rises until something arcs — typically the gap across the switch
            contacts. This is the operating principle of every internal-combustion engine's spark coil<Cite id="feynman-II-17" in={SOURCES} />.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 4.2.11"
        question={<>Place a 1 µF cap and a 1 mH inductor in parallel. What is the resonant frequency? What's special about that frequency?</>}
        hint="Energy sloshes between the two stores at ω = 1/√(LC)."
        answer={
          <>
            <Formula>ω<sub>0</sub> = 1/√(LC) = 1/√(10⁻³ · 10⁻⁶) = 1/√(10⁻⁹) = 3.16×10⁴ rad/s</Formula>
            <Formula>f<sub>0</sub> = ω<sub>0</sub>/(2π) ≈ <strong className="text-text font-medium">5.0 kHz</strong></Formula>
            <p className="mb-prose-3">At this frequency, energy oscillates back and forth between the cap's electric field and the inductor's magnetic field, with
            (ideally) zero loss. Every radio tuner is selecting one such LC resonance out of the broadcast spectrum<Cite id="griffiths-2017" in={SOURCES} />.</p>
          </>
        }
      />
    </>
  );

  return (
    <LabShell
      slug={SLUG}
      labSubtitle="Air-Core Solenoid"
      labId="inductance-4.2 / L = μ₀N²A/ℓ"
      labContent={labContent}
      prose={prose}
    />
  );
}
