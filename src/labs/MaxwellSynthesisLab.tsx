import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Formula, InlineMath } from '@/components/Formula';
import { LabGrid, LegendItem } from '@/components/LabLayout';
import { LabShell } from '@/components/LabShell';
import { Pullout } from '@/components/Prose';
import { Readout } from '@/components/Readout';
import { Cite } from '@/components/SourcesList';
import { Slider } from '@/components/Slider';
import { TryIt } from '@/components/TryIt';
import { PHYS, sciJsx } from '@/lib/physics';
import { BASE_LAB_SOURCES } from '@/labs/data/manifest';

const SLUG = 'maxwell-synthesis';
const SOURCES = BASE_LAB_SOURCES[SLUG]!;

export default function MaxwellSynthesisLab() {
  const [qMicroC, setQMicroC] = useState(1);
  const [iAmp, setIAmp] = useState(2);
  const [dPhiB, setDPhiB] = useState(0.2);
  const [dPhiE, setDPhiE] = useState(5e6);

  const computed = useMemo(() => {
    const electricFlux = (qMicroC * 1e-6) / PHYS.eps_0;
    const magneticFlux = 0;
    const emf = -dPhiB;
    const bCirculation = PHYS.mu_0 * (iAmp + PHYS.eps_0 * dPhiE);
    const displacementCurrent = PHYS.eps_0 * dPhiE;
    const cFromConstants = 1 / Math.sqrt(PHYS.mu_0 * PHYS.eps_0);
    return { electricFlux, magneticFlux, emf, bCirculation, displacementCurrent, cFromConstants };
  }, [qMicroC, iAmp, dPhiB, dPhiE]);

  const stateRef = useRef({ qMicroC, iAmp, dPhiB, dPhiE, computed });
  useEffect(() => {
    stateRef.current = { qMicroC, iAmp, dPhiB, dPhiE, computed };
  }, [qMicroC, iAmp, dPhiB, dPhiE, computed]);

  const setupCanvas = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, colors } = info;
    let raf = 0;
    let phase = 0;

    function panel(x: number, y: number, width: number, height: number, label: string, color: string) {
      ctx.strokeStyle = colors.borderStrong;
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, width, height);
      ctx.fillStyle = color;
      ctx.font = '12px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(label, x + 14, y + 24);
    }

    function drawLoop(cx: number, cy: number, r: number, color: string) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, r * 1.35, r, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    function draw() {
      const { qMicroC, iAmp, dPhiB, dPhiE } = stateRef.current;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      const gap = 18;
      const pw = (w - gap * 3 - 48) / 2;
      const ph = (h - gap * 3 - 42) / 2;
      const x1 = 24;
      const x2 = x1 + pw + gap;
      const y1 = 24;
      const y2 = y1 + ph + gap;

      panel(x1, y1, pw, ph, 'Gauss E: charge sources flux', colors.pink);
      panel(x2, y1, pw, ph, 'Gauss B: no magnetic monopoles', colors.teal);
      panel(x1, y2, pw, ph, 'Faraday: changing B curls E', colors.accent);
      panel(x2, y2, pw, ph, 'Ampere-Maxwell: current + changing E curl B', colors.blue);

      ctx.fillStyle = colors.pink;
      ctx.beginPath();
      ctx.arc(x1 + pw * 0.5, y1 + ph * 0.55, 18 + Math.abs(qMicroC) * 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = colors.bg;
      ctx.textAlign = 'center';
      ctx.font = '18px "JetBrains Mono", monospace';
      ctx.fillText(qMicroC >= 0 ? '+' : '-', x1 + pw * 0.5, y1 + ph * 0.55 + 6);
      ctx.strokeStyle = colors.pink;
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
        ctx.beginPath();
        ctx.moveTo(x1 + pw * 0.5 + Math.cos(a) * 32, y1 + ph * 0.55 + Math.sin(a) * 32);
        ctx.lineTo(x1 + pw * 0.5 + Math.cos(a) * (64 + Math.abs(qMicroC) * 5), y1 + ph * 0.55 + Math.sin(a) * (64 + Math.abs(qMicroC) * 5));
        ctx.stroke();
      }

      ctx.strokeStyle = colors.teal;
      ctx.lineWidth = 2;
      for (let k = 0; k < 4; k++) drawLoop(x2 + pw * 0.5, y1 + ph * 0.56, 26 + k * 16, colors.teal);
      ctx.fillStyle = colors.textDim;
      ctx.font = '13px "JetBrains Mono", monospace';
      ctx.fillText('net flux = 0', x2 + pw * 0.5, y1 + ph - 30);

      const faradayR = 36 + Math.abs(dPhiB) * 28;
      drawLoop(x1 + pw * 0.5, y2 + ph * 0.58, faradayR, colors.accent);
      ctx.fillStyle = colors.accent;
      ctx.fillText(dPhiB >= 0 ? 'B flux increasing' : 'B flux decreasing', x1 + pw * 0.5, y2 + ph - 28);

      const cx = x2 + pw * 0.5;
      const cy = y2 + ph * 0.58;
      ctx.strokeStyle = colors.blue;
      for (let k = 0; k < 5; k++) {
        ctx.beginPath();
        ctx.arc(cx, cy, 24 + k * 13 + Math.sin(phase + k) * 2, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.fillStyle = colors.blue;
      ctx.fillText(`I + Id = ${(iAmp + PHYS.eps_0 * dPhiE).toFixed(2)} A`, cx, y2 + ph - 28);

      phase += 0.03;
      raf = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  const labContent = (
    <LabGrid
      canvas={<AutoResizeCanvas height={460} setup={setupCanvas} />}
      legend={
        <>
          <LegendItem swatchColor="var(--color-pink)">electric flux</LegendItem>
          <LegendItem swatchColor="var(--color-teal)">closed magnetic flux</LegendItem>
          <LegendItem swatchColor="var(--color-accent)">induced E circulation</LegendItem>
          <LegendItem swatchColor="var(--color-blue)">B circulation</LegendItem>
        </>
      }
      inputs={
        <>
          <Slider label="enclosed charge" sym="Q" value={qMicroC} min={-5} max={5} step={0.1} format={(v) => `${v.toFixed(1)} µC`} metaLeft="-5 µC" metaRight="+5 µC" onChange={setQMicroC} />
          <Slider label="conduction current" sym="I" value={iAmp} min={0} max={10} step={0.1} format={(v) => `${v.toFixed(1)} A`} metaLeft="0 A" metaRight="10 A" onChange={setIAmp} />
          <Slider label="magnetic flux rate" sym={<>dΦ<sub>B</sub>/dt</>} value={dPhiB} min={-1} max={1} step={0.01} format={(v) => `${v.toFixed(2)} Wb/s`} metaLeft="-1 Wb/s" metaRight="+1 Wb/s" onChange={setDPhiB} />
          <Slider label="electric flux rate" sym={<>dΦ<sub>E</sub>/dt</>} value={dPhiE} min={0} max={2e8} step={1e6} format={(v) => `${(v / 1e6).toFixed(0)} MV·m/s`} metaLeft="0" metaRight="200 MV·m/s" onChange={setDPhiE} />
        </>
      }
      outputs={
        <>
          <Readout sym="ΦE" label="electric flux" value={sciJsx(computed.electricFlux, 2)} unit="V·m" highlight />
          <Readout sym="ΦB" label="closed magnetic flux" value={computed.magneticFlux.toFixed(0)} unit="Wb" />
          <Readout sym="ℰ" label="induced EMF" value={computed.emf.toFixed(2)} unit="V" />
          <Readout sym="ID" label="displacement current" value={computed.displacementCurrent.toFixed(4)} unit="A" />
          <Readout sym="∮B·dℓ" label="B circulation" value={sciJsx(computed.bCirculation, 2)} unit="T·m" />
        </>
      }
    />
  );

  const prose = (
    <>
      <h3 className="lab-section-h3">Context</h3>
      <p className="mb-prose-3">
        Maxwell's 1865 synthesis did not discover every piece from scratch; it joined Gauss,
        Faraday, Ampere, and the displacement-current correction into one field theory
        <Cite id="maxwell-1865" in={SOURCES} />. Feynman's compact summary is still the right
        mental picture: two equations say how fields start and end, and two say how fields curl
        <Cite id="feynman-II-18" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        The integral form used here is classical, macroscopic electromagnetism in SI units. It
        holds when charges and currents can be treated as continuous sources and the fields are not
        so strong, small, or fast that quantum electrodynamics, material dispersion, or microscopic
        grain structure must replace the continuum picture <Cite id="jackson-1999" in={SOURCES} />.
      </p>

      <h3 className="lab-section-h3">Formula</h3>
      <Formula tex="\oint \vec{E}\cdot d\vec{A}=\dfrac{Q_{\text{enc}}}{\varepsilon_0},\quad \oint \vec{B}\cdot d\vec{A}=0,\quad \oint \vec{E}\cdot d\vec{\ell}=-\dfrac{d\Phi_B}{dt},\quad \oint \vec{B}\cdot d\vec{\ell}=\mu_0 I_{\text{enc}}+\mu_0\varepsilon_0\dfrac{d\Phi_E}{dt}" />
      <p className="mb-prose-2">Variable glossary:</p>
      <ul className="mb-prose-3 list-disc pl-xl text-5 text-text-dim leading-5">
        <li><InlineMath tex="\vec{E}" /> is electric field in V/m; outward electric flux is positive.</li>
        <li><InlineMath tex="\vec{B}" /> is magnetic field in teslas; net closed-surface B flux is zero.</li>
        <li><InlineMath tex="Q_{\text{enc}}" /> is enclosed charge in coulombs; sign sets outward or inward E flux.</li>
        <li><InlineMath tex="I_{\text{enc}}" /> is conduction current in amperes through the loop's spanning surface.</li>
        <li><InlineMath tex="\Phi_B" /> and <InlineMath tex="\Phi_E" /> are magnetic and electric fluxes; their time derivatives drive circulation.</li>
        <li><InlineMath tex="\varepsilon_0" /> and <InlineMath tex="\mu_0" /> are vacuum constants from CODATA <Cite id="codata-2018" in={SOURCES} />.</li>
      </ul>

      <h3 className="lab-section-h3">Intuition</h3>
      <p className="mb-prose-3">
        Maxwell's equations are less like four separate rules and more like one grammar for field
        geometry. Charge makes electric field begin or end. Magnetic field never begins or ends.
        Changing magnetic flux makes electric field circulate. Current and changing electric flux
        make magnetic field circulate.
      </p>
      <Pullout>The synthesis is the moment electricity stops being forces between objects and becomes geometry in space.</Pullout>
      <p className="mb-prose-3">
        The four panels in the canvas are the same idea seen four ways: box, loop, source, response.
        Once the displacement-current term is present, even empty space can pass the curl back and
        forth between E and B. That handoff is why the wave equation appears.
      </p>

      <h3 className="lab-section-h3">Reasoning</h3>
      <p className="mb-prose-3">
        The first two equations are divergence laws: they ask what flows out of a closed surface.
        The last two are curl laws: they ask what circulates around a closed loop. The signs are
        not decoration. The minus sign in Faraday's law is Lenz's-law opposition; the positive sign
        in Ampere-Maxwell says conduction current and displacement current create the same sense of
        magnetic circulation when their orientations match.
      </p>
      <p className="mb-prose-3">
        Dimensional checks are severe. <InlineMath tex="Q/\varepsilon_0" /> has units of electric
        flux, <InlineMath tex="d\Phi_B/dt" /> has units of volts, and
        <InlineMath tex="\mu_0 I" /> has units of T·m. The displacement-current term must be
        <InlineMath tex="\varepsilon_0 d\Phi_E/dt" /> so it can be added to real current.
      </p>
      <p className="mb-prose-3">
        Limits also expose the structure. Static charges leave only Gauss's electric law. Steady
        currents leave Ampere's old law. Remove sources but keep time dependence, and Faraday plus
        Ampere-Maxwell become a self-propagating wave.
      </p>

      <h3 className="lab-section-h3">Derivation</h3>
      <p className="mb-prose-3">
        The modern synthesis starts by accepting the four integral laws as the macroscopic field
        postulates. Applying the divergence theorem to the flux laws and Stokes' theorem to the
        circulation laws gives the differential form:
      </p>
      <Formula tex="\nabla\cdot\vec{E}=\rho/\varepsilon_0,\quad \nabla\cdot\vec{B}=0,\quad \nabla\times\vec{E}=-\partial\vec{B}/\partial t,\quad \nabla\times\vec{B}=\mu_0\vec{J}+\mu_0\varepsilon_0\,\partial\vec{E}/\partial t" />
      <p className="mb-prose-3">
        In an empty region, set <InlineMath tex="\rho=0" /> and <InlineMath tex="\vec{J}=0" />.
        Taking the curl of Faraday's law and substituting Ampere-Maxwell yields the wave equation
        <Cite id="griffiths-2017" in={SOURCES} />:
      </p>
      <Formula tex="\nabla^2\vec{E}=\mu_0\varepsilon_0\dfrac{\partial^2\vec{E}}{\partial t^2},\qquad c=\dfrac{1}{\sqrt{\mu_0\varepsilon_0}}" />

      <h3 className="lab-section-h3">Worked problems</h3>
      <TryIt tag="Problem 4.6.1" question={<p>A closed surface encloses <strong className="text-text font-medium">2.0 µC</strong>. Find the electric flux.</p>} answer={<><p>Use Gauss's law directly.</p><Formula tex="\Phi_E=Q/\varepsilon_0=(2.0\times10^{-6})/(8.854\times10^{-12})=2.26\times10^5\ \text{V·m}" /><p>The flux is <strong className="text-text font-medium">2.26×10^5 V·m outward</strong>.</p></>} />
      <TryIt tag="Problem 4.6.2" question={<p>A Gaussian sphere encloses <strong className="text-text font-medium">-3.0 nC</strong>. What is the sign of the flux?</p>} answer={<><p>Negative charge reverses the field direction through the surface.</p><Formula tex="\Phi_E=(-3.0\times10^{-9})/\varepsilon_0=-3.39\times10^2\ \text{V·m}" /><p>The flux is <strong className="text-text font-medium">inward</strong>, so it is negative with the outward-normal convention.</p></>} />
      <TryIt tag="Problem 4.6.3" question={<p>Double <strong className="text-text font-medium">Q</strong> and double the closed-surface area. What happens to total electric flux?</p>} answer={<><p>Total flux depends only on enclosed charge, not area.</p><Formula tex="\Phi'_E=\dfrac{2Q}{\varepsilon_0}=2\Phi_E" /><p>The total flux <strong className="text-text font-medium">doubles</strong>; the average field through the larger surface need not.</p></>} />
      <TryIt tag="Problem 4.6.4" question={<p>A loop sees magnetic flux increasing at <strong className="text-text font-medium">0.50 Wb/s</strong>. What EMF is induced?</p>} answer={<><p>Apply Faraday's law with the orientation convention built into the sign.</p><Formula tex="\mathcal{E}=-d\Phi_B/dt=-0.50\ \text{V}" /><p>The induced EMF is <strong className="text-text font-medium">-0.50 V</strong>, meaning it circulates opposite the chosen positive loop direction.</p></>} />
      <TryIt tag="Problem 4.6.5" question={<p>A wire carries <strong className="text-text font-medium">5.0 A</strong>. What is <InlineMath tex="\oint B\cdot d\ell" /> if displacement current is negligible?</p>} answer={<><p>Use Ampere's law as the steady-current limit.</p><Formula tex="\oint B\cdot d\ell=\mu_0 I=(1.2566\times10^{-6})(5.0)=6.28\times10^{-6}\ \text{T·m}" /><p>The circulation is <strong className="text-text font-medium">6.28 µT·m</strong>.</p></>} />
      <TryIt tag="Problem 4.6.6" question={<p>A charging capacitor has <strong className="text-text font-medium">dΦE/dt = 1.0×10¹¹ V·m/s</strong>. Find the displacement current.</p>} answer={<><p>Displacement current is the electric-flux term that joins real current.</p><Formula tex="I_D=\varepsilon_0 d\Phi_E/dt=(8.854\times10^{-12})(1.0\times10^{11})=0.885\ \text{A}" /><p>The displacement current is <strong className="text-text font-medium">0.885 A</strong>.</p></>} />
      <TryIt tag="Problem 4.6.7" question={<p>Use <strong className="text-text font-medium">ε₀ = 8.854×10⁻¹² F/m</strong> and <strong className="text-text font-medium">μ₀ = 1.2566×10⁻⁶ H/m</strong> to compute c.</p>} answer={<><p>Plug the constants into Maxwell's speed result <Cite id="codata-2018" in={SOURCES} />.</p><Formula tex="c=\dfrac{1}{\sqrt{\mu_0\varepsilon_0}}=2.998\times10^8\ \text{m/s}" /><p>The result is <strong className="text-text font-medium">the speed of light</strong>, Maxwell's central comparison.</p></>} />
      <TryIt tag="Problem 4.6.8" question={<p>Convert an electric flux of <strong className="text-text font-medium">1.13×10⁵ V·m</strong> back into enclosed charge.</p>} answer={<><p>Invert Gauss's law.</p><Formula tex="Q=\varepsilon_0\Phi_E=(8.854\times10^{-12})(1.13\times10^5)=1.00\times10^{-6}\ \text{C}" /><p>The enclosed charge is <strong className="text-text font-medium">1.00 µC</strong>.</p></>} />
      <TryIt tag="Problem 4.6.9" question={<p>What is the net magnetic flux through a closed surface around a <strong className="text-text font-medium">bar magnet</strong>?</p>} answer={<><p>Gauss's law for magnetism has no source term.</p><Formula tex="\oint\vec{B}\cdot d\vec{A}=0" /><p>The net flux is <strong className="text-text font-medium">zero</strong>; field lines that leave the surface also re-enter it.</p></>} />
      <TryIt tag="Problem 4.6.10" question={<p>Why does Ampere's original law break for a <strong className="text-text font-medium">charging capacitor</strong> if displacement current is omitted?</p>} answer={<><p>Choose one surface through the wire and another bulging through the gap. The same boundary loop would enclose different conduction current.</p><Formula tex="\oint B\cdot d\ell=\mu_0 I_{\text{cond}}\quad\text{is surface-dependent unless}\quad I_D=\varepsilon_0 d\Phi_E/dt\text{ is included}" /><p>The failure mode is <strong className="text-text font-medium">surface inconsistency</strong>; Maxwell's term restores one answer for one loop.</p></>} />

      <h3 className="lab-section-h3">Why the synthesis matters</h3>
      <p className="mb-prose-3">
        The payoff is not just elegance. The same four lines explain static charge, magnets,
        induction, capacitors, radio waves, light, and energy flow. They are the point where the
        separate stories become one field.
      </p>
    </>
  );

  return <LabShell slug={SLUG} labSubtitle="Maxwell's equations" labId="4.6" labContent={labContent} prose={prose} />;
}
