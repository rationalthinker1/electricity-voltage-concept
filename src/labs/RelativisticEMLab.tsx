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
import { drawArrow } from '@/lib/canvasPrimitives';
import { withAlpha } from '@/lib/canvasTheme';
import { PHYS, sciJsx } from '@/lib/physics';
import { BASE_LAB_SOURCES } from '@/labs/data/manifest';

const SLUG = 'relativistic-em';
const SOURCES = BASE_LAB_SOURCES[SLUG]!;

function gamma(beta: number) {
  return 1 / Math.sqrt(1 - beta * beta);
}

export default function RelativisticEMLab() {
  const [beta, setBeta] = useState(0.6);
  const [ey, setEy] = useState(100);
  const [bzMicroT, setBzMicroT] = useState(0);
  const [wireCurrent, setWireCurrent] = useState(5);

  const computed = useMemo(() => {
    const g = gamma(beta);
    const v = beta * PHYS.c;
    const bz = bzMicroT * 1e-6;
    const eyPrime = g * (ey - v * bz);
    const bzPrime = g * (bz - (v * ey) / (PHYS.c * PHYS.c));
    const eInvariant = ey * ey - PHYS.c * PHYS.c * bz * bz;
    const eInvariantPrime = eyPrime * eyPrime - PHYS.c * PHYS.c * bzPrime * bzPrime;
    const lineB = (PHYS.mu_0 * wireCurrent) / (2 * Math.PI * 0.05);
    const magneticForcePerC = v * lineB;
    return { g, v, bz, eyPrime, bzPrime, eInvariant, eInvariantPrime, lineB, magneticForcePerC };
  }, [beta, ey, bzMicroT, wireCurrent]);

  const stateRef = useRef({ beta, ey, bzMicroT, wireCurrent, computed });
  useEffect(() => {
    stateRef.current = { beta, ey, bzMicroT, wireCurrent, computed };
  }, [beta, ey, bzMicroT, wireCurrent, computed]);

  const setupCanvas = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, colors } = info;
    let raf = 0;
    let phase = 0;

    function drawFieldSet(cx: number, cy: number, label: string, eVal: number, bVal: number) {
      ctx.fillStyle = colors.textDim;
      ctx.font = '12px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(label, cx, cy - 118);

      const eLen = Math.max(18, Math.min(105, Math.abs(eVal) * 0.55));
      const bLen = Math.max(18, Math.min(105, Math.abs(bVal) * 2.2e7));
      const eDir = eVal >= 0 ? -1 : 1;
      const bDir = bVal >= 0 ? -1 : 1;

      drawArrow(ctx, { x: cx, y: cy }, { x: cx, y: cy + eDir * eLen }, {
        color: colors.pink,
        lineWidth: 3,
      });
      drawArrow(ctx, { x: cx, y: cy }, { x: cx + bDir * bLen, y: cy + bDir * bLen * 0.35 }, {
        color: colors.teal,
        lineWidth: 3,
      });

      ctx.fillStyle = colors.pink;
      ctx.fillText('E', cx + 18, cy + eDir * eLen - 6 * eDir);
      ctx.fillStyle = colors.teal;
      ctx.fillText('B', cx + bDir * bLen + 16 * bDir, cy + bDir * bLen * 0.35);
    }

    function draw() {
      const { beta, ey, computed } = stateRef.current;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = colors.borderStrong;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(w / 2, 54);
      ctx.lineTo(w / 2, h - 54);
      ctx.stroke();

      drawFieldSet(w * 0.25, h * 0.54, 'lab frame', ey, computed.bz);
      drawFieldSet(w * 0.75, h * 0.54, 'boosted frame', computed.eyPrime, computed.bzPrime);

      const trainX = w * 0.5 + Math.sin(phase) * 12;
      ctx.fillStyle = withAlpha(colors.accent, 0.16);
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(trainX - 68, 72, 136, 48);
      ctx.fillRect(trainX - 68, 72, 136, 48);
      drawArrow(ctx, { x: trainX - 42, y: 96 }, { x: trainX + 42, y: 96 }, {
        color: colors.accent,
        lineWidth: 2,
      });
      ctx.fillStyle = colors.accent;
      ctx.font = '12px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`boost v = ${beta.toFixed(2)}c`, trainX, 142);

      ctx.fillStyle = colors.textDim;
      ctx.fillText('parallel components stay; transverse E and B mix', w / 2, h - 32);
      phase += 0.04;
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
          <LegendItem swatchColor="var(--color-pink)">electric component</LegendItem>
          <LegendItem swatchColor="var(--color-teal)">magnetic component</LegendItem>
          <LegendItem swatchColor="var(--color-accent)">boost direction</LegendItem>
        </>
      }
      inputs={
        <>
          <Slider label="boost speed" sym="β" value={beta} min={0} max={0.95} step={0.01} format={(v) => `${v.toFixed(2)} c`} metaLeft="rest" metaRight="0.95c" onChange={setBeta} />
          <Slider label="lab electric field" sym={<>E<sub>y</sub></>} value={ey} min={-200} max={200} step={1} format={(v) => `${v.toFixed(0)} V/m`} metaLeft="-200 V/m" metaRight="+200 V/m" onChange={setEy} />
          <Slider label="lab magnetic field" sym={<>B<sub>z</sub></>} value={bzMicroT} min={-5} max={5} step={0.05} format={(v) => `${v.toFixed(2)} µT`} metaLeft="-5 µT" metaRight="+5 µT" onChange={setBzMicroT} />
          <Slider label="wire current comparison" sym="I" value={wireCurrent} min={0} max={20} step={0.1} format={(v) => `${v.toFixed(1)} A`} metaLeft="0 A" metaRight="20 A" onChange={setWireCurrent} />
        </>
      }
      outputs={
        <>
          <Readout sym="γ" label="Lorentz factor" value={computed.g.toFixed(3)} highlight />
          <Readout sym="E′y" label="boosted electric field" value={sciJsx(computed.eyPrime, 2)} unit="V/m" />
          <Readout sym="B′z" label="boosted magnetic field" value={sciJsx(computed.bzPrime, 2)} unit="T" />
          <Readout sym="E²-c²B²" label="field invariant" value={sciJsx(computed.eInvariantPrime, 2)} />
          <Readout sym="vB" label="wire force per coulomb" value={sciJsx(computed.magneticForcePerC, 2)} unit="N/C" />
        </>
      }
    />
  );

  const prose = (
    <>
      <h3 className="lab-section-h3">Context</h3>
      <p className="mb-prose-3">
        Einstein's 1905 relativity paper was explicitly about electrodynamics: Maxwell's equations
        had a built-in speed, and inertial observers had to agree on the laws of physics
        <Cite id="einstein-1905" in={SOURCES} />. Once space and time transform by Lorentz boosts,
        electric and magnetic fields cannot remain separately absolute.
      </p>
      <p className="mb-prose-3">
        This lab uses the standard inertial-frame field transformations in vacuum. They hold for
        classical fields measured by observers in uniform relative motion. They are not a shortcut
        for accelerating observers, curved spacetime, microscopic quantum spin magnetism, or the
        material-response complications of real media <Cite id="jackson-1999" in={SOURCES} />.
      </p>

      <h3 className="lab-section-h3">Formula</h3>
      <Formula id="em-field-transform-perp" />
      <p className="mb-prose-2">Variable glossary:</p>
      <ul className="mb-prose-3 list-disc pl-xl text-5 text-text-dim leading-5">
        <li><InlineMath tex="\vec{v}" /> is the boost velocity from one inertial frame to another, in m/s.</li>
        <li><InlineMath tex="\gamma=1/\sqrt{1-v^2/c^2}" /> is the Lorentz factor.</li>
        <li><InlineMath tex="E_\perp" /> and <InlineMath tex="B_\perp" /> are field components perpendicular to the boost.</li>
        <li>Parallel field components transform differently: <InlineMath tex="E_\parallel'=E_\parallel" /> and <InlineMath tex="B_\parallel'=B_\parallel" />.</li>
        <li><InlineMath tex="c" /> is the exact vacuum light speed from CODATA <Cite id="codata-2018" in={SOURCES} />.</li>
      </ul>

      <h3 className="lab-section-h3">Intuition</h3>
      <p className="mb-prose-3">
        The simplest surprise is a pure electric field. If you move sideways through it, you still
        measure an electric field, but you also measure a magnetic field. Nothing physical was
        added to the room. Your slicing of spacetime changed, and the field components changed with
        it.
      </p>
      <Pullout>Magnetism is electricity seen from a moving frame.</Pullout>
      <p className="mb-prose-3">
        The current-carrying wire story is the same lesson in disguise. In the wire frame the test
        charge may feel a magnetic force. In the charge's frame the wire's positive lattice and
        drifting electrons length-contract by different factors, so the wire acquires a net charge
        density and the same force is electric <Cite id="purcell-morin-2013" in={SOURCES} />.
      </p>

      <h3 className="lab-section-h3">Reasoning</h3>
      <p className="mb-prose-3">
        The cross products in the transformation are demanded by direction. A boost along x can mix
        <InlineMath tex="E_y" /> with <InlineMath tex="B_z" />, because those are the components
        that complete a right-handed triad. Components parallel to the boost have no transverse
        area or circulation to mix into.
      </p>
      <p className="mb-prose-3">
        The equations also preserve invariants. For perpendicular fields with
        <InlineMath tex="\vec{E}\cdot\vec{B}=0" />, the quantity
        <InlineMath tex="E^2-c^2B^2" /> is the same in every inertial frame. A pure electric field
        can become E plus B, but every observer can still agree that the underlying field is
        electric-dominant.
      </p>
      <p className="mb-prose-3">
        In the low-speed limit, <InlineMath tex="\gamma\approx1" /> and a pure electric field
        produces <InlineMath tex="B'\approx -\vec{v}\times\vec{E}/c^2" />. That tiny
        <InlineMath tex="1/c^2" /> correction is why magnetism looks weak per carrier, but matter
        contains enough carriers for the sum to be macroscopic.
      </p>

      <h3 className="lab-section-h3">Derivation</h3>
      <p className="mb-prose-3">
        Start from the Lorentz force, <InlineMath tex="\vec{F}=q(\vec{E}+\vec{u}\times\vec{B})" />.
        The force law must describe the same particle trajectory when position, time, and velocity
        are transformed between inertial frames. Requiring that covariance fixes how the field
        components mix <Cite id="griffiths-2017" in={SOURCES} />.
      </p>
      <Formula tex="E_y'=\gamma(E_y-vB_z),\qquad B_z'=\gamma\left(B_z-\dfrac{vE_y}{c^2}\right)" />
      <p className="mb-prose-3">
        The compact modern derivation places E and B inside the antisymmetric field tensor
        <InlineMath tex="F^{\mu\nu}" /> and applies the Lorentz transform
        <InlineMath tex="F'=\Lambda F\Lambda^T" />. The matrix multiplication is just the
        component-mixing rule above in four-dimensional notation <Cite id="jackson-1999" in={SOURCES} />.
      </p>
      <Formula tex="F^{\mu\nu}=\begin{pmatrix}0&-E_x/c&-E_y/c&-E_z/c\\E_x/c&0&-B_z&B_y\\E_y/c&B_z&0&-B_x\\E_z/c&-B_y&B_x&0\end{pmatrix}" />

      <h3 className="lab-section-h3">Worked problems</h3>
      <TryIt tag="Problem 4.7.1" question={<p>Compute <strong className="text-text font-medium">γ</strong> for <strong className="text-text font-medium">β = 0.60</strong>.</p>} answer={<><p>Use the Lorentz-factor definition.</p><Formula tex="\gamma=\dfrac{1}{\sqrt{1-0.60^2}}=1.25" /><p>The factor is <strong className="text-text font-medium">1.25</strong>.</p></>} />
      <TryIt tag="Problem 4.7.2" question={<p>A lab frame has <strong className="text-text font-medium">E_y = 100 V/m</strong> and <strong className="text-text font-medium">B_z = 0</strong>. Boost at <strong className="text-text font-medium">0.10c</strong>. Find <InlineMath tex="B_z'" />.</p>} answer={<><p>Use the low-speed exact transform with <InlineMath tex="\gamma=1.005" />.</p><Formula tex="B_z'=-\gamma\dfrac{vE_y}{c^2}=-(1.005)\dfrac{0.10c(100)}{c^2}=-3.35\times10^{-8}\ \text{T}" /><p>The moving frame sees <strong className="text-text font-medium">-33.5 nT</strong>.</p></>} />
      <TryIt tag="Problem 4.7.3" question={<p>If boost speed doubles from <strong className="text-text font-medium">0.05c</strong> to <strong className="text-text font-medium">0.10c</strong> while γ is nearly 1, how does the induced magnetic field from a pure E field scale?</p>} answer={<><p>At low speed, <InlineMath tex="B'\approx -vE/c^2" />.</p><Formula tex="\dfrac{B_2'}{B_1'}\approx\dfrac{v_2}{v_1}=\dfrac{0.10c}{0.05c}=2" /><p>The induced magnetic field is <strong className="text-text font-medium">about twice as large</strong>.</p></>} />
      <TryIt tag="Problem 4.7.4" question={<p>At what <strong className="text-text font-medium">β</strong> does <strong className="text-text font-medium">γ = 2</strong>?</p>} answer={<><p>Invert the Lorentz-factor formula.</p><Formula tex="2=\dfrac{1}{\sqrt{1-\beta^2}}\Rightarrow \beta=\sqrt{1-\dfrac{1}{4}}=0.866" /><p>The speed is <strong className="text-text font-medium">0.866c</strong>.</p></>} />
      <TryIt tag="Problem 4.7.5" question={<p>A <strong className="text-text font-medium">5.0 A</strong> wire is observed at <strong className="text-text font-medium">5.0 cm</strong>. What is B?</p>} answer={<><p>Use the long-wire field from Ampere/Biot-Savart.</p><Formula tex="B=\dfrac{\mu_0 I}{2\pi r}=\dfrac{(1.2566\times10^{-6})(5.0)}{2\pi(0.050)}=2.0\times10^{-5}\ \text{T}" /><p>The field is <strong className="text-text font-medium">20 µT</strong>, a terrestrial-field scale.</p></>} />
      <TryIt tag="Problem 4.7.6" question={<p>A charge moves at <strong className="text-text font-medium">0.010c</strong> through that <strong className="text-text font-medium">20 µT</strong> field. Find force per coulomb.</p>} answer={<><p>Magnetic force per charge is <InlineMath tex="vB" /> for perpendicular motion.</p><Formula tex="F/q=(0.010)(2.9979\times10^8)(2.0\times10^{-5})=59.96\ \text{N/C}" /><p>The force per charge is <strong className="text-text font-medium">about 60 N/C</strong>, equal to an electric field of 60 V/m.</p></>} />
      <TryIt tag="Problem 4.7.7" question={<p>For <strong className="text-text font-medium">E = 100 V/m</strong> and <strong className="text-text font-medium">B = 0</strong>, what is <InlineMath tex="E^2-c^2B^2" />?</p>} answer={<><p>The invariant is immediate.</p><Formula tex="E^2-c^2B^2=(100)^2-0=1.00\times10^4" /><p>The value is <strong className="text-text font-medium">1.00×10⁴ (V/m)²</strong>.</p></>} />
      <TryIt tag="Problem 4.7.8" question={<p>Convert a field tensor entry <InlineMath tex="F^{02}=-E_y/c" /> for <strong className="text-text font-medium">E_y=150 V/m</strong>.</p>} answer={<><p>Divide by the exact speed of light.</p><Formula tex="F^{02}=-\dfrac{150}{2.9979\times10^8}=-5.00\times10^{-7}" /><p>The entry is <strong className="text-text font-medium">-5.00×10⁻⁷</strong> in this convention.</p></>} />
      <TryIt tag="Problem 4.7.9" question={<p>Why does a neutral current-carrying wire become charged in the test-charge frame?</p>} answer={<><p>The positive lattice and drifting electrons have different velocities in the boosted frame, so their length contractions differ.</p><Formula tex="\lambda'=\lambda_+'+\lambda_-'\neq0" /><p>The failure mode of the nonrelativistic picture is <strong className="text-text font-medium">assuming simultaneity and length are frame-independent</strong> <Cite id="purcell-morin-2013" in={SOURCES} />.</p></>} />
      <TryIt tag="Problem 4.7.10" question={<p>A pure electromagnetic plane wave has <strong className="text-text font-medium">E = cB</strong>. What is <InlineMath tex="E^2-c^2B^2" />?</p>} answer={<><p>Substitute directly.</p><Formula tex="E^2-c^2B^2=(cB)^2-c^2B^2=0" /><p>The invariant is <strong className="text-text font-medium">zero</strong>. No inertial observer can transform a plane wave into a purely electric or purely magnetic static field.</p></>} />

      <h3 className="lab-section-h3">Why the tensor matters</h3>
      <p className="mb-prose-3">
        The field tensor is not notation for its own sake. It is the compact reason every observer
        can disagree about how much field is electric or magnetic while agreeing on the physical
        electromagnetic field.
      </p>
    </>
  );

  return <LabShell slug={SLUG} labSubtitle="Relativity and EM" labId="4.7" labContent={labContent} prose={prose} />;
}
