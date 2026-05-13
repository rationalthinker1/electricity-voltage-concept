/**
 * Chapter 10 — Circuits, AC, and impedance
 *
 * The practical compression: take the field machinery of Ch.1–6 and reduce it
 * to nodes, branches, components, and complex impedance. Seven sections, six
 * embedded demos, FAQ at the end.
 */
import { CaseStudies, CaseStudy } from '@/components/CaseStudy';
import { ChapterShell } from '@/components/ChapterShell';
import { FAQ, FAQItem } from '@/components/FAQ';
import { Cite } from '@/components/SourcesList';
import { Formula, InlineMath } from '@/components/Formula';
import { Term } from '@/components/Term';
import { TryIt } from '@/components/TryIt';
import { KirchhoffsLawsDemo } from './demos/KirchhoffsLaws';
import { MultimeterProbeDemo } from './demos/MultimeterProbe';
import { RCTransientDemo } from './demos/RCTransient';
import { LCOscillationDemo } from './demos/LCOscillation';
import { RLCResonanceDemo } from './demos/RLCResonance';
import { ImpedanceDemo } from './demos/Impedance';
import { ThreePhaseDemo } from './demos/ThreePhase';
import { TheveninEquivalentDemo } from './demos/TheveninEquivalent';
import { RCFilterBodeDemo } from './demos/RCFilterBode';
import { RLCBandpassDemo } from './demos/RLCBandpass';
import { OpAmpInvertingDemo } from './demos/OpAmpInverting';
import { OpAmpIntegratorDemo } from './demos/OpAmpIntegrator';
import { TransmissionLineReflectionDemo } from './demos/TransmissionLineReflection';
import { StandingWavesOnLineDemo } from './demos/StandingWavesOnLine';
import { getChapter } from './data/chapters';

export default function Ch12CircuitsAndAC() {
  const chapter = getChapter('circuits-and-ac')!;
  const SOURCES = chapter.sources;

  return (
    <ChapterShell chapter={chapter}>
      <p>
        We have spent nine chapters insisting that electricity is a story about <em>fields</em>:
        E and B filling space, energy flowing through the Poynting vector, signals propagating at c,
        a current-carrying wire is just a relativistically-disguised pile of charge. All of that is
        true. None of it is how a working electrical engineer actually thinks about a circuit.
      </p>
      <p>
        When you sit down at a bench and probe an oscilloscope, you are not solving Maxwell's
        equations. You are pushing currents through wires and components, summing voltage drops
        around loops, and tracking which way the electrons happen to be moving this microsecond.
        The compression from "field theory" to "schematic" is one of the most successful
        idealizations in physics — and this chapter is about when it's allowed, and what it gives you.
      </p>

      <h2>From <em>fields</em> to schematics</h2>

      <p>
        Picture a 1-metre wire connecting a 9-V battery to a small bulb. Chapter 6 tells you
        a careful story: energy emanates from the battery as an electromagnetic disturbance,
        flows through the empty space surrounding the wire, gets absorbed at the filament where
        the field encounters resistance. Every claim is correct. Every claim is also unnecessary
        if you only want to know how bright the bulb is.
      </p>
      <p>
        The shortcut is the <strong>lumped-element model</strong>. We declare each component to
        be a perfect, dimensionless object: a resistor is just an R; a capacitor is just a C; a
        wire is a zero-resistance ideal connection<Cite id="horowitz-hill-2015" in={SOURCES} />.
        Currents and voltages have unambiguous instantaneous values at every node — no
        propagation delay, no field structure, no spatial extent at all. The whole circuit is a
        graph with components on edges and node-voltages at vertices.
      </p>
      <p>
        This works when the wavelength of any signal in the circuit is much larger than the
        circuit itself. At 60 Hz, λ = c/f ≈ 5,000 km. Your washing machine is 1 m across. The
        ratio is comfortable: 5×10⁶. So a 60 Hz appliance is an exquisitely "lumped" object — every
        point in it sees the same instantaneous voltage to within a part in a million. At 2.4 GHz,
        λ ≈ 12 cm; the lumped picture breaks down across your phone's antenna and you have to
        treat the antenna as a distributed object — a transmission line, an electromagnetic
        resonator, an <em>antenna</em>, not a wire<Cite id="griffiths-2017" in={SOURCES} />.
      </p>
      <p className="pullout">
        The schematic is not a different physics from Chapters 1–6. It is the limit those
        chapters take when wavelengths are huge compared to the wires.
      </p>
      <p>
        Inside that limit, the entire apparatus of Maxwell collapses to a handful of operational
        rules. Charge conservation becomes a rule at every node. Energy conservation becomes a
        rule around every loop. The wave equation becomes a second-order ODE in time. Resonance,
        impedance, filters, transformers — every working piece of analog electronics — falls out
        of those two conservation laws and the constitutive relations of three components.
      </p>

      <h2>Kirchhoff's <em>two laws</em></h2>

      <p>
        Gustav Kirchhoff, then a 21-year-old student at Königsberg, published the two laws in
        1845<Cite id="kirchhoff-1845" in={SOURCES} />. They are, between them, sufficient to
        solve any DC network of resistors and sources.
      </p>
      <p>
        <strong>
          <Term def={<><strong>Kirchhoff's current law (KCL)</strong> — at any node, the algebraic sum of currents in equals the sum out: <em>Σ I = 0</em>. A statement of charge conservation in the lumped-element limit.</>}>KCL — Kirchhoff's current law</Term>.
        </strong> At any node in a circuit, the sum of
        currents flowing in equals the sum flowing out. This is charge conservation. Charge
        doesn't pile up in a wire — every electron that enters a junction has to leave by some
        other branch in the same instant. Algebraically:
      </p>
      <Formula>Σ I<sub>in</sub> = Σ I<sub>out</sub></Formula>
      <p>
        <strong>
          <Term def={<><strong>Kirchhoff's voltage law (KVL)</strong> — around any closed loop, the algebraic sum of voltage rises and drops is zero: <em>Σ V = 0</em>. A statement of energy conservation in the lumped-element limit.</>}>KVL — Kirchhoff's voltage law</Term>.
        </strong> Around any closed loop, the algebraic sum
        of voltage rises and drops is zero. This is energy conservation. Voltage is potential
        energy per unit charge; if a test charge made a round trip through a loop and didn't end
        up with the same potential energy it started with, you'd have an energy source for free.
      </p>
      <Formula>Σ V<sub>loop</sub> = 0</Formula>
      <p>
        Together they generate exactly enough equations to determine every branch current. For a
        network with <InlineMath>N</InlineMath> nodes and <InlineMath>B</InlineMath> branches, KCL
        gives you <InlineMath>N − 1</InlineMath> independent equations and KVL gives you
        <InlineMath>B − N + 1</InlineMath> — a total of <InlineMath>B</InlineMath>, which is
        exactly the number of unknown branch currents<Cite id="irwin-circuit-analysis-2015" in={SOURCES} />.
      </p>

      <KirchhoffsLawsDemo />

      <p>
        Crank the sliders and the equations stay balanced to numerical precision. The deeper
        observation is that KCL and KVL are not extra physics — they are <em>consequences</em> of
        Maxwell's equations in the lumped limit. KCL is what ∇·J = −∂ρ/∂t reduces to when no
        charge can accumulate (ρ doesn't change at a node). KVL is what ∮E·dℓ = 0 reduces to when
        the time-varying flux through the loop is negligible. The schematic inherits the
        conservation laws of the underlying field theory.
      </p>

      <h2>What the <em>multimeter</em> actually reads</h2>

      <p>
        Every claim in the previous section is something a multimeter on a bench can check. A
        digital multimeter has two probes — a red one wired to its (+) input and a black one
        wired to its (−) input — and a rotary switch that picks a mode. The display shows one
        number. What that number means depends entirely on which mode is selected; the same probe
        positions can give wildly different readings under V_DC, V_AC, I_DC, or Ω.
      </p>
      <p>
        In <strong>V_DC</strong> mode, the meter measures the time-averaged potential difference
        between its probe tips. Internally the input is buffered by a high-impedance amplifier
        (1 GΩ on a modern bench DMM<Cite id="keysight-34465a-datasheet" in={SOURCES} />) so that
        almost no current is drawn from the circuit under test — the meter reads the node voltage
        without perturbing it. The displayed value is exactly V<sub>red</sub> − V<sub>black</sub>,
        which is why a "negative" reading just means you swapped the probes.
      </p>
      <p>
        In <strong>V_AC</strong> mode, the same input stage is followed by a true-RMS detector
        that computes the square-root of the time-average of the squared signal over a window of
        many line periods<Cite id="keysight-34465a-datasheet" in={SOURCES} />. For a sinusoid of
        peak V<sub>p</sub>, the answer is V<sub>p</sub>/√2; for a pure DC level, V_AC reads zero.
        That's the right answer for the bench network here — it's a DC circuit, so V_AC on any
        pair of probes is identically zero at steady state.
      </p>
      <p>
        <strong>I_DC</strong> mode is fundamentally different: the meter inserts a low-resistance
        shunt in <em>series</em> with the current path and measures the voltage across that
        shunt<Cite id="horowitz-hill-2015" in={SOURCES} />. You have to break the wire and let
        the current pass through the meter — putting the probes on two arbitrary TPs doesn't
        give a current reading, because there's no series path through the meter. In this demo
        we cheat slightly and show the steady-state current through whichever wire segment your
        probes straddle.
      </p>
      <p>
        <strong>Ω</strong> mode disconnects the live circuit entirely. The meter forces a small
        known current through the probes and measures the resulting voltage. For that to make
        sense, the device under test must be unpowered — which here we model by mentally shorting
        the battery and removing the (open at DC) capacitor. The reading is then the equivalent
        Thévenin resistance of the rest of the network seen between the two probe tips.
      </p>

      <MultimeterProbeDemo />

      <p>
        Try V_DC with red on TP1 and black on GND: you get the 8.66 V drop across the bottom
        two-resistor stack, exactly as KVL predicts. Move the red probe to TP4 and the reading
        snaps to 0 V — the right-hand branch carries no DC current, so every test point past the
        capacitor sits at ground potential. Switch to Ω mode and probe between TP1 and GND: the
        meter sees R₁ in parallel with (R₂ + R₃), about 339 Ω, exactly the value you'd compute
        by hand. The schematic is doing real predictive work.
      </p>

      <h2>The <em>RC</em> time constant</h2>

      <p>
        Add a capacitor to the mix and the circuit acquires memory. A capacitor stores charge in
        proportion to the voltage across it: Q = CV. To change the voltage across a cap, you
        must move charge onto its plates, and that takes time if the charge has to come through
        a resistor.
      </p>
      <p>
        For a battery V₀, a resistor R, and a capacitor C in series, Kirchhoff's voltage law gives
      </p>
      <Formula>V<sub>0</sub> = I R + Q/C</Formula>
      <p>
        and since I = dQ/dt, you get a first-order linear ODE whose solution is the canonical
        exponential approach:
      </p>
      <Formula>V<sub>C</sub>(t) = V<sub>0</sub> ( 1 − e<sup>−t/τ</sup> ),  τ = R C</Formula>
      <p>
        After one time constant, the cap reaches <strong>1 − 1/e ≈ 63%</strong> of the final
        voltage; after three, about 95%; after five, you've effectively arrived. Discharging
        through R follows the mirror curve, decaying as <InlineMath>e<sup>−t/τ</sup></InlineMath>.
      </p>

      <RCTransientDemo />

      <p>
        Try R = 1 kΩ and C = 220 µF: τ = 0.22 s — visibly slow on the demo plot. Drop C to 10 µF
        and τ collapses to 10 ms; raise R to 10 kΩ and you're back at 100 ms. The product RC, in
        seconds, is the only thing that matters<Cite id="horowitz-hill-2015" in={SOURCES} />. This
        is the timing element behind every digital pulse-width-modulation controller, every
        radio receiver's de-coupling stage, every camera flash. The 555 timer chip is built
        around exactly this exponential.
      </p>

      <TryIt
        tag="Try 12.1"
        question={
          <>What is the RMS voltage of a sinusoidal mains signal with peak <strong>169.7 V</strong>?</>
        }
        hint={<>For a pure sine, V<sub>rms</sub> = V<sub>p</sub>/√2.</>}
        answer={
          <>
            <Formula>V<sub>rms</sub> = 169.7 V / √2 ≈ 120.0 V</Formula>
            <p>
              That is exactly the North American nominal: <strong>120 V<sub>rms</sub></strong>, which is why
              wall outlets are rated for ≈170 V peak insulation even though "120 V" appears on the
              label<Cite id="horowitz-hill-2015" in={SOURCES} /><Cite id="ansi-c84-1-2020" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2><em>LC</em> oscillation — the electrical pendulum</h2>

      <p>
        Replace the resistor with an inductor and the circuit's character changes completely. A
        capacitor stores energy in its electric field (½ CV² = Q²/(2C)). An inductor stores energy
        in its magnetic field (½ LI²). With both present and no resistance, the two stores hand
        energy back and forth indefinitely — the electrical analog of a mass on a spring.
      </p>
      <p>
        Kirchhoff's voltage law plus Q = CV plus V<sub>L</sub> = L dI/dt gives
      </p>
      <Formula>L (d<sup>2</sup>Q/dt<sup>2</sup>) + Q/C = 0</Formula>
      <p>
        which is the harmonic-oscillator equation with angular frequency
      </p>
      <Formula>ω<sub>0</sub> = 1 / √(L C),   f<sub>0</sub> = 1 / (2π √(L C))</Formula>
      <p>
        Identical structure to a pendulum, a vibrating string, or a quantum harmonic oscillator.
        L plays the role of mass (inertia of current), 1/C plays the role of spring stiffness
        (restoring force per unit displacement). The energy alternates between the two stores;
        the total U<sub>C</sub> + U<sub>L</sub> stays constant<Cite id="griffiths-2017" in={SOURCES} />.
      </p>

      <LCOscillationDemo />

      <p>
        With L = 10 mH and C = 100 µF, f₀ ≈ 159 Hz. Scale C down to 100 pF and f₀ jumps to about
        160 kHz — AM radio territory. The same equation, six orders of magnitude apart in
        frequency.
      </p>

      <TryIt
        tag="Try 12.2"
        question={
          <>
            Find the resonant frequency f₀ of an LC tank with <em>L</em> = 10 mH and{' '}
            <em>C</em> = 10 µF.
          </>
        }
        hint={<>f₀ = 1 / (2π √(L C)).</>}
        answer={
          <>
            <Formula>√(L C) = √(10⁻² · 10⁻⁵) = √(10⁻⁷) ≈ 3.162×10⁻⁴ s</Formula>
            <Formula>f<sub>0</sub> = 1 / (2π · 3.162×10⁻⁴) ≈ 503 Hz</Formula>
            <p>
              Resonant frequency <strong>≈ 503 Hz</strong>. Drop either L or C by 100× and f₀ scales up by
              10×<Cite id="horowitz-hill-2015" in={SOURCES} /><Cite id="irwin-circuit-analysis-2015" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2><em>RLC</em> and resonance</h2>

      <p>
        Now add back the resistor and drive the network with a sinusoidal source V(t) = V₀ cos(ωt).
        Two new effects appear at once: the oscillation becomes <strong>damped</strong> (R dissipates
        energy on every cycle), and the system responds preferentially to one driving frequency —
        <strong>
          {' '}<Term def={<><strong>resonance</strong> — the frequency at which a driven oscillator stores energy most efficiently and responds with the largest amplitude. In a series RLC circuit, <em>ω₀ = 1/√(LC)</em>, where the inductive and capacitive reactances exactly cancel.</>}>resonance</Term>
        </strong>.
      </p>
      <p>
        The steady-state current amplitude as a function of driving frequency is
      </p>
      <Formula>
        |I(ω)| = V<sub>0</sub> / √(R<sup>2</sup> + (ωL − 1/ωC)<sup>2</sup>)
      </Formula>
      <p>
        which peaks when ωL = 1/(ωC) — that is, at exactly ω = ω₀ = 1/√(LC). The sharpness of the
        peak is the <strong>
          <Term def={<><strong>Q factor</strong> — quality factor: <em>Q = 2π · (energy stored) / (energy dissipated per cycle)</em>. For a series RLC, <em>Q = ω₀L/R = (1/R)√(L/C)</em>. High-Q resonators ring long and select a narrow band of frequencies.</>}>Q factor</Term>
        </strong>:
      </p>
      <Formula>Q = ω<sub>0</sub> L / R = (1/R) √(L/C)</Formula>

      <RLCResonanceDemo />

      <TryIt
        tag="Try 12.3"
        question={
          <>
            For the series RLC with <em>R</em> = 1 Ω, <em>L</em> = 10 mH, <em>C</em> = 10 µF, compute the
            quality factor Q.
          </>
        }
        hint={<>Q = (1/R) √(L/C).</>}
        answer={
          <>
            <Formula>L/C = 10⁻² / 10⁻⁵ = 10³</Formula>
            <Formula>Q = (1/1) · √(10³) ≈ 31.6</Formula>
            <p>
              Q ≈ <strong>31.6</strong> — sharp enough to ring for ~10 cycles before losing 1/e of its
              energy. Drop R to 0.1 Ω and Q jumps to 316; crystal oscillators reach 10⁶ on the same
              formula<Cite id="horowitz-hill-2015" in={SOURCES} /><Cite id="irwin-circuit-analysis-2015" in={SOURCES} />.
            </p>
          </>
        }
      />

      <p>
        A high-Q circuit (small R) responds to a narrow band of frequencies around f₀ and rejects
        everything else. This is why every analog radio is built around exactly this physics: a
        tunable RLC tank picks one carrier frequency out of a continuum of broadcast signals and
        feeds it to the demodulator. Modern silicon-tuned receivers do the same thing in
        principle — they just synthesize the LC behavior digitally.
      </p>
      <p className="pullout">
        Every radio is a tunable RLC circuit waiting for the frequency it agrees with. So is
        every quartz watch, every MRI coil, every cell tower.
      </p>

      <h2><em>Impedance</em> — AC's complex resistance</h2>

      <p>
        Beautiful as the previous section is, you do not want to solve a second-order ODE every
        time you analyze a circuit. The 19th-century engineer's response — formalized by Charles
        Steinmetz at General Electric in the 1890s — was to recast everything in the complex
        plane.
      </p>
      <p>
        Represent each sinusoid V(t) = V₀ cos(ωt + φ) by the complex{' '}
        <Term def={<><strong>phasor</strong> — a complex number <em>V₀ e<sup>jφ</sup></em> that encodes the amplitude and phase of a sinusoid at a fixed frequency. Time-derivatives <em>d/dt</em> become multiplications by <em>jω</em>, and linear differential equations turn into linear algebra in ℂ.</>}>phasor</Term>
        {' '}V₀ e<sup>jφ</sup> at
        a fixed ω. Then time-derivatives become multiplications by jω, and Ohm's law generalises
        to <strong>V = I Z</strong>, where Z is the complex{' '}
        <Term def={<><strong>impedance</strong> — the complex generalisation of resistance for sinusoidal signals: <em>Z = R + jX</em>. Real part dissipates (resistance); imaginary part stores and returns energy (reactance). SI unit: ohm.</>}>impedance</Term>:
      </p>
      <Formula>Z<sub>R</sub> = R</Formula>
      <Formula>Z<sub>L</sub> = jωL</Formula>
      <Formula>Z<sub>C</sub> = 1 / (jωC) = −j / (ωC)</Formula>
      <p>
        Resistors are real. Inductors are positive-imaginary: voltage <em>leads</em> current by
        90°, because V<sub>L</sub> = L dI/dt and the derivative of a cosine is a negative sine
        (rotated +90° in the complex plane). Capacitors are negative-imaginary: current
        <em> leads</em> voltage by 90°, because I = C dV/dt<Cite id="horowitz-hill-2015" in={SOURCES} />.
        The frequency-dependent magnitude of the imaginary part is the component's{' '}
        <Term def={<><strong>reactance</strong> — the imaginary part of impedance, the energy-storing (non-dissipative) component: <em>X<sub>L</sub> = ωL</em> for inductors, <em>X<sub>C</sub> = −1/(ωC)</em> for capacitors. SI unit: ohm.</>}>reactance</Term>:
        <em> X<sub>L</sub> = ωL</em> grows with frequency; <em>|X<sub>C</sub>| = 1/(ωC)</em> shrinks.
      </p>
      <p>
        Series impedances add. The full series RLC has impedance
      </p>
      <Formula>Z(ω) = R + j ( ωL − 1/ωC )</Formula>
      <p>
        whose magnitude tells you how much current flows for a given voltage, and whose argument
        tells you the V–I phase shift<Cite id="irwin-circuit-analysis-2015" in={SOURCES} />.
      </p>

      <ImpedanceDemo />

      <p>
        Slide ω. At low frequencies, 1/(ωC) dominates and Z lives in the lower half-plane (the
        circuit looks capacitive — current leads). At high frequencies, ωL dominates and Z swings
        into the upper half-plane (inductive — voltage leads). At exactly ω = ω₀, the L and C
        contributions cancel: Z collapses onto the real axis at value R. That is resonance — the
        same picture as the previous demo, viewed from a different angle.
      </p>

      <TryIt
        tag="Try 12.4"
        question={
          <>
            Compute the reactance of a <strong>10 µF</strong> capacitor at 60 Hz, and of a{' '}
            <strong>10 mH</strong> inductor at 60 Hz.
          </>
        }
        hint={<>X<sub>C</sub> = 1/(2π f C); X<sub>L</sub> = 2π f L.</>}
        answer={
          <>
            <Formula>
              X<sub>C</sub> = 1 / (2π · 60 · 10⁻⁵) ≈ 265.3 Ω
            </Formula>
            <Formula>
              X<sub>L</sub> = 2π · 60 · 10⁻² ≈ 3.77 Ω
            </Formula>
            <p>
              At 60 Hz, the 10 µF cap looks like <strong>≈ 265 Ω</strong> and the 10 mH inductor
              like <strong>≈ 3.77 Ω</strong>. Bump f to 60 kHz and the cap shrinks by 1000× while the
              inductor grows by 1000× — which is why coupling caps and choke inductors swap roles in
              high-frequency design<Cite id="horowitz-hill-2015" in={SOURCES} /><Cite id="irwin-circuit-analysis-2015" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2>AC <em>power</em> — and why the grid is three-phase</h2>

      <p>
        Multiply V(t) = V<sub>p</sub> cos(ωt) by I(t) = I<sub>p</sub> cos(ωt − φ) and average
        over a cycle. The instantaneous power oscillates wildly, but the time-average comes out to:
      </p>
      <Formula>⟨P⟩ = V<sub>rms</sub> I<sub>rms</sub> cos(φ)</Formula>
      <p>
        with{' '}
        <Term def={<><strong>RMS (root-mean-square)</strong> — the square root of the time-averaged square of a waveform. For a sine of peak <em>V<sub>p</sub></em>, <em>V<sub>rms</sub> = V<sub>p</sub>/√2</em>. The "DC-equivalent" voltage for power dissipation: a resistor on <em>V<sub>rms</sub></em> AC dissipates the same average power as on <em>V<sub>rms</sub></em> DC.</>}>V<sub>rms</sub></Term>
        {' '}= V<sub>p</sub>/√2 and likewise for I. The factor cos(φ) is the
        <strong>{' '}
          <Term def={<><strong>power factor</strong> — the ratio of real to apparent power, <em>cos(φ)</em>, where <em>φ</em> is the voltage–current phase shift. 1 for a purely resistive load, 0 for a purely reactive one.</>}>power factor</Term>
        </strong>. A purely resistive load has φ = 0 and cos(φ) = 1 — every
        watt of VI is real, useful, heat-generating power. A purely reactive load (pure L or pure
        C) has φ = ±90° and cos(φ) = 0 — the load draws current, but on average no energy
        actually transfers; energy sloshes in and out each half-cycle.
      </p>
      <p>
        Engineers split the three quantities apart:
      </p>
      <ul>
        <li>
          <strong>
            <Term def={<><strong>real power</strong> — the time-averaged power actually delivered to a load: <em>P = V<sub>rms</sub> I<sub>rms</sub> cos(φ)</em>. SI unit: watt (W).</>}>Real power</Term>
          </strong> P = V<sub>rms</sub> I<sub>rms</sub> cos(φ), units watts (W).
          What dissipates as heat or does mechanical work.
        </li>
        <li>
          <strong>
            <Term def={<><strong>reactive power</strong> — the part of the AC product that sloshes between source and load with no net energy transfer: <em>Q = V<sub>rms</sub> I<sub>rms</sub> sin(φ)</em>. SI unit: volt-ampere reactive (VAR).</>}>Reactive power</Term>
          </strong> Q = V<sub>rms</sub> I<sub>rms</sub> sin(φ), units VAR
          (volt-amperes reactive). Sloshes between source and load every cycle.
        </li>
        <li>
          <strong>
            <Term def={<><strong>apparent power</strong> — the product of RMS voltage and RMS current, <em>S = V<sub>rms</sub> I<sub>rms</sub></em>. The magnitude of the complex power phasor; sets the wire and transformer ratings. SI unit: volt-ampere (VA).</>}>Apparent power</Term>
          </strong> S = V<sub>rms</sub> I<sub>rms</sub>, units VA. The
          magnitude of the complex power phasor; what the wires actually carry.
        </li>
      </ul>
      <p>
        A motor with cos(φ) = 0.7 doing 700 W of real work draws 1000 VA from the line — and the
        utility has to size its conductors and transformers for the apparent power, not the real
        power. That is why industrial customers are billed for both, and why factories install
        <strong> power-factor correction capacitors</strong> to cancel the inductive lag of their
        motor banks<Cite id="grainger-power-systems-2003" in={SOURCES} />.
      </p>

      <TryIt
        tag="Try 12.5"
        question={
          <>
            A factory draws <strong>1000 VA</strong> at a power factor of <em>cos(φ)</em> = 0.7. What is the
            real power delivered, and how much reactive power is sloshing in and out?
          </>
        }
        hint={<>P = S cos(φ), Q = S sin(φ); sin(φ) = √(1 − cos²(φ)).</>}
        answer={
          <>
            <Formula>P = 1000 · 0.7 = 700 W</Formula>
            <Formula>sin(φ) = √(1 − 0.49) ≈ 0.714</Formula>
            <Formula>Q = 1000 · 0.714 ≈ 714 VAR</Formula>
            <p>
              Real power <strong>= 700 W</strong>; reactive power <strong>≈ 714 VAR</strong>. The wires
              still carry the full 1000 VA, which is why utilities bill heavy-industry customers for
              apparent power and why power-factor-correction capacitors pay for themselves so
              quickly<Cite id="grainger-power-systems-2003" in={SOURCES} />.
            </p>
          </>
        }
      />
      <p>
        The grid itself goes a step further:{' '}
        <Term def={<><strong>three-phase</strong> — a power-distribution scheme with three sinusoidal voltages of equal amplitude, 120° apart in phase. A balanced load needs no neutral return; three conductors carry <em>√3 ≈ 1.73×</em> the power of a single-phase pair of equal weight, and a three-phase motor sees an automatically-rotating magnetic field.</>}>three independent phases</Term>,
        120° apart in time. Sum
        the three voltages and you get zero at every instant, which means a balanced three-phase
        load needs no neutral return wire. Three conductors carry √3 ≈ 1.73× the power of a
        single-phase line of the same conductor weight, and a three-phase motor produces a
        rotating magnetic field automatically — no starting circuitry required.
      </p>

      <ThreePhaseDemo />

      <p>
        Almost every high-power industrial appliance in the world runs on three-phase. The
        transmission grid is universally three-phase. Your house, in most countries, takes one
        leg (or split-phase 240/120) off a local three-phase distribution transformer. The
        physics is the same Maxwell theory we started with, the schematic is the same Kirchhoff
        circuit we've been drawing — but the wiring is shaped by the geometry of
        three vectors at 120° agreeing to add to zero.
      </p>

      <h2><em>Thévenin</em> and Norton equivalents</h2>

      <p>
        The single most useful trick in circuit analysis: any linear two-terminal network — no
        matter how many sources and resistors it contains — reduces to a <strong>single voltage
        source V<sub>th</sub> in series with a single resistance R<sub>th</sub></strong>. The
        equivalence is exact for every external load you might connect to those two
        terminals<Cite id="horowitz-hill-2015" in={SOURCES} /><Cite id="irwin-circuit-analysis-2015" in={SOURCES} />.
      </p>
      <p>
        To find <strong>V<sub>th</sub></strong>, leave the network's two terminals open and measure
        (or compute) the voltage that appears between them — that <em>open-circuit voltage</em> is
        V<sub>th</sub>. To find <strong>R<sub>th</sub></strong>, mentally zero every independent
        source (short the voltage sources, open the current sources) and compute the resistance
        looking back into the network from the same two terminals. The two numbers together fully
        characterise the network's behaviour at those terminals.
      </p>
      <Formula>V<sub>th</sub> = V<sub>open-circuit</sub>,    R<sub>th</sub> = R<sub>looking-in (sources zeroed)</sub></Formula>
      <p>
        Equivalently, a current source <strong>I<sub>n</sub> = V<sub>th</sub>/R<sub>th</sub></strong>
        in parallel with the same R<sub>th</sub> produces identical terminal behaviour — that is the
        Norton form. Source-transformation is just the algebraic statement that the two are
        interchangeable: a real voltage source with internal resistance is indistinguishable, from
        outside, from a real current source with the same internal resistance.
      </p>

      <TheveninEquivalentDemo />

      <p>
        Why is this useful? Because the moment a network is reduced to (V<sub>th</sub>,
        R<sub>th</sub>), connecting a load R<sub>L</sub> is a one-line calculation:
        I<sub>load</sub> = V<sub>th</sub>/(R<sub>th</sub>+R<sub>L</sub>),
        V<sub>load</sub> = V<sub>th</sub>·R<sub>L</sub>/(R<sub>th</sub>+R<sub>L</sub>). Maximum
        power transfer happens at R<sub>L</sub> = R<sub>th</sub>, with half of V<sub>th</sub>·I
        delivered to the load and half wasted in R<sub>th</sub>. Every real source — battery,
        signal generator, op-amp output — has a Thévenin equivalent, and you cannot get more power
        out of it than its V<sub>th</sub>²/(4 R<sub>th</sub>) <Cite id="horowitz-hill-2015" in={SOURCES} />.
      </p>

      <TryIt
        tag="Try 12.6"
        question={
          <>
            A 9 V battery has an internal resistance of <strong>1 Ω</strong>. You connect a
            <strong> 8 Ω</strong> load across its terminals. What are V<sub>th</sub>, R<sub>th</sub>,
            and the voltage seen across the load?
          </>
        }
        hint={<>The battery's open-circuit voltage is V<sub>th</sub>; its internal resistance is R<sub>th</sub>. Then V<sub>load</sub> = V<sub>th</sub> R<sub>L</sub>/(R<sub>th</sub> + R<sub>L</sub>).</>}
        answer={
          <>
            <p>The battery is already in Thévenin form:</p>
            <Formula>V<sub>th</sub> = 9 V,    R<sub>th</sub> = 1 Ω</Formula>
            <Formula>V<sub>load</sub> = 9 · 8 / (1 + 8) = 8.0 V</Formula>
            <p>
              The load drops <strong>8.0 V</strong>; the remaining 1.0 V is wasted inside the
              battery. That 1 Ω is why an alkaline cell can't crank a car starter motor — the
              starter wants 100 A, which would force 100 V across the internal resistance and the
              cell collapses<Cite id="horowitz-hill-2015" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2><em>Filters</em> and the Bode plot</h2>

      <p>
        Impedance turned circuit ODEs into algebra; the next step is to ask not "what is the
        steady-state current at one frequency?" but "what does the circuit do across <em>all</em>
        frequencies at once?" That is the move from circuit analysis to <strong>signal
        processing</strong>, and the bridge is the{' '}
        <Term def={<><strong>transfer function</strong> — the complex ratio of output to input phasors as a function of frequency: <em>H(jω) = V<sub>out</sub>/V<sub>in</sub></em>. Its magnitude tells you how much amplitude survives at each ω; its argument tells you the phase shift.</>}>transfer function</Term>
        {' '}H(jω) = V<sub>out</sub>(jω) / V<sub>in</sub>(jω).
      </p>
      <p>
        For an RC low-pass filter — a resistor R driving a capacitor C with V<sub>out</sub> taken
        across the cap — the impedance divider gives
      </p>
      <Formula>
        H(jω) = (1/jωC) / (R + 1/jωC) = 1 / (1 + jωRC)
      </Formula>
      <p>
        whose magnitude is
      </p>
      <Formula>
        |H(jω)| = 1 / √(1 + (ω/ω<sub>c</sub>)<sup>2</sup>),    ω<sub>c</sub> = 1/RC
      </Formula>
      <p>
        The frequency ω<sub>c</sub> is the{' '}
        <Term def={<><strong>cutoff frequency</strong> — the frequency at which a filter's magnitude response has dropped to 1/√2 of its passband value (−3 dB). For an RC filter, <em>ω<sub>c</sub> = 1/RC</em>; <em>f<sub>c</sub> = 1/(2πRC)</em>.</>}>cutoff frequency</Term>
        : below it the filter passes the signal almost flat; above it the amplitude drops as 1/ω,
        which is exactly <strong>−20 dB per decade</strong> on a log-log plot. The output also
        lags the input by an angle that grows from 0° (DC) through −45° (at ω = ω<sub>c</sub>) to
        −90° (high ω).
      </p>
      <p>
        Plot |H| in decibels against frequency on a log axis and the asymptotic shape is two
        straight lines: a flat 0 dB passband, a downward ramp at −20 dB/decade, meeting at
        ω<sub>c</sub>. That two-line caricature is the <strong>
          <Term def={<><strong>Bode plot</strong> — a pair of plots of a transfer function on logarithmic frequency axes: <em>|H(jω)|</em> in dB versus log ω (magnitude), and arg <em>H(jω)</em> versus log ω (phase). Named after Hendrik Bode at Bell Labs (1940s).</>}>Bode plot</Term>
        </strong>: it's how every analog filter is specified and how every working circuit
        designer thinks about frequency response<Cite id="oppenheim-willsky-1997" in={SOURCES} />.
        The actual curve sags 3 dB below the corner at ω<sub>c</sub> — the cutoff is the
        <strong> −3 dB point</strong>, where output power has dropped by exactly half.
      </p>

      <RCFilterBodeDemo />

      <p>
        Swap R and C and you get the mirror filter: a high-pass with H(jω) = jωRC/(1+jωRC). Below
        ω<sub>c</sub> the response ramps up at +20 dB/decade; above ω<sub>c</sub> it flattens at
        0 dB. The phase ramps from +90° down to 0° as ω crosses the corner. Same components,
        opposite job.
      </p>
      <p>
        Add an inductor and you can shape the response further. A series RLC with the output
        taken across R has transfer function
      </p>
      <Formula>
        H(jω) = R / (R + jωL + 1/jωC) = jωRC / (1 − ω<sup>2</sup>LC + jωRC)
      </Formula>
      <p>
        which peaks at ω<sub>0</sub> = 1/√(LC) and is small everywhere else — a{' '}
        <strong>band-pass filter</strong>. Its bandwidth (the width of the −3 dB band around
        ω<sub>0</sub>) is Δω = ω<sub>0</sub>/Q, so the same Q-factor that set the sharpness of the
        resonance peak in the previous demo also sets the selectivity of this filter. AM and FM
        receivers, FM-radio IF strips, EEG bandpass front-ends — all sit on this transfer function.
      </p>

      <RLCBandpassDemo />

      <p>
        Higher-order filters are built by stacking simple sections. A Butterworth filter is
        designed for the flattest possible passband; a Chebyshev trades some passband ripple for
        a steeper roll-off; a Bessel preserves phase linearity at the cost of a softer skirt.
        Whatever the choice, they all factor into cascades of first- and second-order RLC blocks
        whose individual Bode plots add up (in dB) to the overall response<Cite id="horowitz-hill-2015" in={SOURCES} /><Cite id="oppenheim-willsky-1997" in={SOURCES} />.
      </p>

      <TryIt
        tag="Try 12.7"
        question={
          <>
            Design a low-pass RC filter with cutoff frequency <strong>1 kHz</strong> using a
            <strong> 10 nF</strong> capacitor. What value of R do you need?
          </>
        }
        hint={<>f<sub>c</sub> = 1/(2π R C). Solve for R.</>}
        answer={
          <>
            <Formula>R = 1 / (2π f<sub>c</sub> C) = 1 / (2π · 10<sup>3</sup> · 10<sup>−8</sup>)</Formula>
            <Formula>R ≈ 15.9 kΩ</Formula>
            <p>
              Pick <strong>R ≈ 16 kΩ</strong> (a standard E96 value is 16.2 kΩ, close enough). The
              same filter built from 1.6 kΩ + 100 nF or 159 kΩ + 1 nF has the same f<sub>c</sub> —
              it's the RC product, not the individual values, that sets the cutoff<Cite id="horowitz-hill-2015" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2><em>Op-amps</em>: the ideal amplifier</h2>

      <p>
        The operational amplifier is the single component that revolutionised analog electronics.
        Conceptually it is the ideal voltage-controlled voltage source: infinite open-loop gain,
        infinite input impedance, zero output impedance. Bob Widlar at Fairchild Semiconductor
        put the first widely-usable monolithic op-amps (the μA702 and μA709) into silicon in the
        mid-1960s; the LM741, descended from the same line, became the canonical undergraduate
        part and is still in production today<Cite id="widlar-1965" in={SOURCES} /><Cite id="horowitz-hill-2015" in={SOURCES} />.
      </p>
      <p>
        The trick is to wrap the device in <strong>negative feedback</strong> and exploit two
        consequences that fall straight out of "infinite gain":
      </p>
      <ul>
        <li>
          <strong>Virtual short.</strong> Because A<sub>OL</sub> → ∞, even a microvolt of
          differential input would saturate the output. So in negative feedback the loop drives the
          two inputs to the same voltage: V<sub>+</sub> = V<sub>−</sub>. Whatever the (+) input
          is doing, the (−) input is dragged along to match.
        </li>
        <li>
          <strong>
            <Term def={<><strong>virtual ground</strong> — in an op-amp inverting topology with the (+) input grounded, the negative feedback drags the (−) input to ~0 V (virtually grounded) while drawing no current. The summing-junction node where every input current must equal the feedback current.</>}>Virtual ground</Term>
          </strong> (and no input current). The inputs draw zero current — input impedance is
          infinite. In an inverting topology with V<sub>+</sub> = 0, the virtual-short condition
          forces V<sub>−</sub> = 0 too: the (−) pin sits at ground while drawing no current.
        </li>
      </ul>
      <p>
        From those two facts every op-amp circuit follows in two lines of algebra<Cite id="sedra-smith-2014" in={SOURCES} />.
        An <strong>inverting amplifier</strong> with input resistor R<sub>in</sub> and feedback
        resistor R<sub>f</sub>: the input current V<sub>in</sub>/R<sub>in</sub> must equal the
        feedback current −V<sub>out</sub>/R<sub>f</sub> (signs because both flow into the virtual
        ground), so
      </p>
      <Formula>V<sub>out</sub> = −(R<sub>f</sub> / R<sub>in</sub>) · V<sub>in</sub></Formula>
      <p>
        A <strong>non-inverting amplifier</strong> with R<sub>f</sub> from output to (−) and
        R<sub>g</sub> from (−) to ground: virtual short forces V<sub>−</sub> = V<sub>in</sub>, the
        divider then says V<sub>−</sub> = V<sub>out</sub>·R<sub>g</sub>/(R<sub>f</sub>+R<sub>g</sub>),
        so
      </p>
      <Formula>V<sub>out</sub> = (1 + R<sub>f</sub>/R<sub>g</sub>) · V<sub>in</sub></Formula>
      <p>
        A <strong>voltage follower</strong> is the special case R<sub>f</sub> = 0, R<sub>g</sub> = ∞
        — gain 1, but with the op-amp's enormous input impedance and tiny output impedance, so it
        can drive a heavy load from a source that can barely sneeze. Likewise{' '}
        <strong>summers</strong> (multiple inputs into the inverting node, each through its own R),
        <strong> integrators</strong> (R in, C feedback), <strong>differentiators</strong> (C in,
        R feedback), and <strong>current-to-voltage converters</strong> (a photodiode feeding the
        inverting node, R<sub>f</sub> setting the transimpedance gain) all follow from the same
        two rules.
      </p>

      <OpAmpInvertingDemo />

      <p>
        Push V<sub>in</sub> past the limit where R<sub>f</sub>/R<sub>in</sub> would demand more
        than the supply rails can deliver and the output clips. That's the first of the real
        device's limitations to bite: a real op-amp's output can't exceed its supply voltage
        (typically a volt or two short of it). The full list is short.{' '}
        <Term def={<><strong>slew rate</strong> — the maximum dV<sub>out</sub>/dt the op-amp can deliver, set by an internal compensation capacitor's charging current. Typical: <em>0.5 V/µs</em> for an LM741, <em>20 V/µs</em> for a modern audio op-amp, <em>2000 V/µs</em> for a fast video op-amp.</>}>Slew rate</Term>
        {' '}caps how fast the output can change (LM741: 0.5 V/µs, fast audio op-amps: ~20 V/µs).
        Gain-bandwidth product limits how high the open-loop gain stays usable (LM741: 1 MHz;
        TL081: 3 MHz; high-speed parts: hundreds of MHz). Input offset voltage adds a small
        spurious DC term at the output. Input bias current means "infinite input impedance" was a
        small lie — typically nA to fA, depending on input stage<Cite id="horowitz-hill-2015" in={SOURCES} /><Cite id="sedra-smith-2014" in={SOURCES} />.
      </p>
      <p>
        Swap the feedback resistor for a capacitor and the inverting amp becomes an
        <strong> integrator</strong>: the input current V<sub>in</sub>/R now flows onto the
        feedback cap, building voltage according to V<sub>out</sub> = −(1/RC) ∫ V<sub>in</sub> dt.
        Drive it with a square wave and the output ramps up and down linearly between the rails —
        a triangle wave. Drive it with a sine and the output is a 90°-lagging cosine attenuated by
        1/(ωRC). The integrator is the heart of every analog PID controller, every Δ-Σ ADC's first
        stage, and every analog computer ever built<Cite id="sedra-smith-2014" in={SOURCES} />.
      </p>

      <OpAmpIntegratorDemo />

      <TryIt
        tag="Try 12.8"
        question={
          <>
            An inverting op-amp has <em>R<sub>f</sub></em> = 100 kΩ, <em>R<sub>in</sub></em> = 10 kΩ,
            and supply rails of ±10 V. What is V<sub>out</sub> for V<sub>in</sub> = 0.5 V? What
            happens when V<sub>in</sub> = 2 V?
          </>
        }
        hint={<>Gain = −R<sub>f</sub>/R<sub>in</sub>. Multiply, then check against the rails.</>}
        answer={
          <>
            <Formula>Gain = −R<sub>f</sub>/R<sub>in</sub> = −100 kΩ / 10 kΩ = −10</Formula>
            <p>For V<sub>in</sub> = 0.5 V:</p>
            <Formula>V<sub>out</sub> = −10 · 0.5 = −5 V</Formula>
            <p>That sits comfortably between the rails — linear operation.</p>
            <p>For V<sub>in</sub> = 2 V the math wants V<sub>out</sub> = −20 V, but the −10 V rail
            stops it: V<sub>out</sub> clips at <strong>−10 V</strong> (in practice ~−9 V because a
            real op-amp can't quite reach its rail)<Cite id="sedra-smith-2014" in={SOURCES} />.
            The output is no longer a faithful copy of the input — it has saturated.</p>
          </>
        }
      />

      <h2><em>Transmission lines</em>: when wires get long</h2>

      <p>
        The lumped picture had a careful caveat: it works when the circuit is small compared to
        the wavelength of any signal in it. The moment that stops being true — a 30 cm trace at
        1 GHz, a 100 m cable at 10 MHz — you can no longer treat a wire as a single instantaneous
        node. The signal takes real time to get from one end to the other, and during that flight
        the wire behaves as a one-dimensional electromagnetic waveguide<Cite id="pozar-2011" in={SOURCES} />.
      </p>
      <p>
        Every pair of conductors has a per-unit-length inductance L′ and per-unit-length
        capacitance C′. Together they give the line a{' '}
        <strong>
          <Term def={<><strong>characteristic impedance</strong> — the ratio of voltage to current in a traveling wave on a lossless transmission line: <em>Z₀ = √(L′/C′)</em>, where L′ and C′ are per-unit-length inductance and capacitance. A purely real number (in ohms), but not a resistor — Z₀ describes wave propagation, not dissipation.</>}>characteristic impedance</Term>
        </strong>
      </p>
      <Formula>Z<sub>0</sub> = √(L′ / C′)</Formula>
      <p>
        and a propagation velocity v = 1/√(L′ C′) which works out to roughly two-thirds of c in a
        plastic-dielectric coax. Z<sub>0</sub> is real (in ohms) but it is not a resistor in the
        dissipative sense — it is the ratio of voltage to current in a wave travelling along the
        line. The canonical numbers are <strong>50 Ω</strong> for RF coax and most lab equipment,
        <strong> 75 Ω</strong> for TV and video cable, <strong>100 Ω</strong> differential for
        digital pairs (USB, Ethernet, PCIe), and the historical <strong>300 Ω</strong> for
        twin-lead antenna feedline<Cite id="pozar-2011" in={SOURCES} /><Cite id="johnson-graham-1993" in={SOURCES} />.
      </p>
      <p>
        Terminate the line in a load Z<sub>L</sub> = Z<sub>0</sub> and the wave is absorbed
        completely: all of the power launched into the line ends up dissipated in the load.
        Mismatch the termination and a portion bounces back, with{' '}
        <strong>
          <Term def={<><strong>reflection coefficient</strong> — the complex ratio of reflected to incident voltage at a transmission-line termination: <em>Γ = (Z<sub>L</sub> − Z₀)/(Z<sub>L</sub> + Z₀)</em>. <em>Γ = 0</em> for matched, <em>+1</em> for an open, <em>−1</em> for a short.</>}>reflection coefficient</Term>
        </strong>
      </p>
      <Formula>Γ = (Z<sub>L</sub> − Z<sub>0</sub>) / (Z<sub>L</sub> + Z<sub>0</sub>)</Formula>
      <p>
        For a matched load, Γ = 0 (no reflection). For a short (Z<sub>L</sub> = 0), Γ = −1 (full
        inverted reflection — same magnitude, opposite sign). For an open (Z<sub>L</sub> → ∞),
        Γ = +1 (full same-sign reflection). In between, the load gets a fraction (1 − |Γ|²) of
        the incident power and the rest goes back to the source<Cite id="pozar-2011" in={SOURCES} />.
      </p>

      <TransmissionLineReflectionDemo />

      <p>
        When the source drives the line continuously instead of with a single pulse, the
        incident and reflected waves interfere along the line, producing a stationary
        peak-and-null pattern in the voltage envelope. The ratio of the maximum envelope to the
        minimum is the{' '}
        <strong>
          <Term def={<><strong>VSWR</strong> — voltage standing-wave ratio: the ratio of the maximum to minimum voltage magnitude along a mismatched transmission line. <em>VSWR = (1 + |Γ|)/(1 − |Γ|)</em>. <em>1:1</em> is perfect match; <em>2:1</em> is mediocre; <em>∞:1</em> is full reflection (short or open).</>}>VSWR</Term>
        </strong>
        {' '}(voltage standing-wave ratio):
      </p>
      <Formula>VSWR = V<sub>max</sub> / V<sub>min</sub> = (1 + |Γ|) / (1 − |Γ|)</Formula>
      <p>
        A perfectly matched line shows VSWR = 1; a 2:1 mismatch is the practical limit for most
        RF work; ∞:1 (short or open) reflects all the power back to the source — which can
        damage a transmitter that wasn't designed to absorb its own reflected power.
      </p>

      <StandingWavesOnLineDemo />

      <p>
        When does a wire "become" a transmission line? The standard rule of thumb is when the
        physical length exceeds about λ/10 or — equivalently for a digital signal — when the
        round-trip propagation delay is more than a fraction of the signal's rise time. At 1 GHz
        in free space, λ ≈ 30 cm, so even a 3 cm PCB trace is firmly in transmission-line
        territory; in a PCB dielectric (ε<sub>r</sub> ≈ 4), the wavelength shrinks to ~15 cm and
        the threshold drops to ~1.5 cm<Cite id="johnson-graham-1993" in={SOURCES} />. Above that
        scale, every interconnect on a modern motherboard is engineered as a controlled-impedance
        trace, terminated to absorb its own reflections.
      </p>
      <p className="pullout">
        A wire is just a wire — until it isn't. The crossover is set by the ratio of length to
        wavelength, and modern silicon crossed it some time around 1990.
      </p>

      <h2>What we have so far</h2>
      <p>
        At wavelengths much larger than the circuit, Maxwell's equations compress to Kirchhoff's
        two laws plus three constitutive relations: V = IR for resistors, V = (1/C) ∫I dt for
        capacitors, V = L dI/dt for inductors. The RC, LC, and RLC combinations cover the entire
        zoo of first- and second-order linear behavior — exponential decay, free oscillation,
        damped driven oscillation, resonance. Recasting time-derivatives as multiplications by
        jω turns every linear-circuit problem into algebra in the complex plane: impedance,
        phase, power factor, three-phase delta. Thévenin equivalents reduce any linear two-terminal
        network to a single source and a single resistance. Bode plots compress the
        frequency-by-frequency response of a filter to two straight-line asymptotes. Op-amps,
        wrapped in negative feedback, give you a single building block whose gain is set by two
        resistors. And when a wire is finally long enough for propagation delay to matter, the
        whole lumped picture hands off to transmission-line theory. Chapters 1–6 explain
        <em> why</em> any of this is true. Chapter 12 is what you actually
        use<Cite id="horowitz-hill-2015" in={SOURCES} />.
      </p>

      <CaseStudies intro="Three places where the lumped, complex-impedance picture of this chapter does the heavy lifting in working hardware.">
        <CaseStudy
          tag="Case 10.1"
          title="The North-American power grid"
          summary={<>60 Hz three-phase, from a 120/240 V wall outlet to a 765 kV transmission line — one network, six orders of magnitude in voltage.</>}
          specs={[
            { label: 'Grid frequency (NA)', value: '60 Hz' },
            { label: 'Residential service', value: '120 V / 240 V split-phase' },
            { label: 'Commercial 3-phase', value: '208Y/120 V, 480Y/277 V' },
            { label: 'Sub-transmission', value: '34.5–138 kV' },
            { label: 'Transmission classes', value: '230, 345, 500, 765 kV' },
            { label: 'Three-phase advantage', value: <>√3 ≈ 1.73× power / conductor</> },
          ]}
        >
          <p>
            ANSI C84.1 codifies the nominal voltages every utility in North America delivers: 120 V
            line-to-neutral and 240 V line-to-line at a residential meter, 208Y/120 V or 480Y/277 V
            for commercial three-phase service, and a step-ladder of transmission classes — 69, 115,
            138, 230, 345, 500, and 765 kV — at the long-distance end<Cite id="ansi-c84-1-2020" in={SOURCES} />.
            Why so many tiers? Because transmission losses scale as
            <strong> P<sub>loss</sub> = (P<sub>load</sub>/V)² R</strong>: doubling the line voltage
            quarters the I²R loss for the same delivered power<Cite id="grainger-power-systems-2003" in={SOURCES} />.
            765 kV across a thousand kilometres loses a few percent; doing the same at 120 V would
            require conductors thicker than the towers holding them up.
          </p>
          <p>
            Three-phase is the second trick. Three voltages 120° apart, summed at a balanced load,
            cancel exactly — no neutral return current required. Three conductors then carry √3 times
            the power of a single-phase pair of the same weight, and a three-phase motor sees a
            magnetic field that rotates automatically at synchronous speed, no commutator or
            starting circuitry needed. Every transmission line in the network is three-phase; your
            house just taps one phase (plus neutral and an oppositely-phased leg) off the local
            distribution transformer<Cite id="grainger-power-systems-2003" in={SOURCES} />.
          </p>
          <p>
            The 60-Hz choice itself is mid-1890s path-dependence. Westinghouse standardised on 60 Hz
            in the United States; AEG had already picked 50 Hz in Germany; both work, both are now
            locked in by a continent's worth of installed equipment. Aircraft electrical systems,
            where transformer mass matters more than line losses, use 400 Hz instead — the
            transformer core volume scales roughly as 1/<em>f</em> for a given power
            handling<Cite id="horowitz-hill-2015" in={SOURCES} />.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 10.2"
          title="The RLC tank inside an analog radio"
          summary={<>A capacitor, an inductor, and the entire AM and FM dial — selectivity is just resonance.</>}
          specs={[
            { label: 'AM broadcast band (US)', value: '535 – 1705 kHz' },
            { label: 'FM broadcast band (US)', value: '88 – 108 MHz' },
            { label: 'AM channel spacing', value: '10 kHz' },
            { label: 'FM channel spacing', value: '200 kHz' },
            { label: 'Required Q at 1 MHz', value: '~100' },
            { label: 'Resonance formula', value: <>f<sub>0</sub> = 1 / (2π√(LC))</> },
          ]}
        >
          <p>
            An analog AM receiver tunes by changing C (a variable air capacitor) or L (a ferrite
            slug screwed into a coil) until the resonant frequency
            <InlineMath> f<sub>0</sub> = 1/(2π√(LC))</InlineMath> matches the carrier of the station
            you want. The U.S. AM band runs from 535 to 1705 kHz with 10 kHz channel spacing; to
            reject the neighbouring station only 10 kHz away while passing the audio sidebands,
            the tuned circuit needs a quality factor on the order of 100 at the carrier
            frequency<Cite id="horowitz-hill-2015" in={SOURCES} />.
          </p>
          <p>
            That Q comes directly from the formula in this chapter: <InlineMath>Q = (1/R)√(L/C)</InlineMath>.
            With a typical antenna-coil inductance of around 250 µH and the variable capacitor swept
            from roughly 30 pF to 365 pF to cover the band, choosing a coil with an effective series
            resistance in the few-ohm range lands Q comfortably above 100<Cite id="irwin-circuit-analysis-2015" in={SOURCES} />.
            FM receivers do the same trick three orders of magnitude up: at 100 MHz the inductances
            shrink to tens of nanohenries and the capacitors to tens of picofarads, but the
            mathematics is identical.
          </p>
          <p>
            Modern receivers do most of this in silicon, but the front-end is still an LC tank — a
            "preselector" filter that picks one slice of the spectrum before the rest of the chain
            digitises it. The graph in §RLC and resonance is the entire reason your phone can pick
            up a Wi-Fi packet at 2.4 GHz without drowning in everything else on the air.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 10.3"
          title="The brick on your laptop charger"
          summary={<>A switched-mode supply running at 50–500 kHz beats a 60-Hz linear regulator by an order of magnitude in size and a factor of two in efficiency.</>}
          specs={[
            { label: 'Mains input (NA)', value: <>120 V<sub>rms</sub>, 60 Hz</> },
            { label: 'Internal switching frequency', value: '50 – 500 kHz' },
            { label: 'SMPS efficiency (typical)', value: '85 – 95 %' },
            { label: 'Linear regulator efficiency', value: '~50 % (20 V → 5 V)' },
            { label: 'Transformer mass scaling', value: <>∝ 1/<em>f</em></> },
            { label: 'USB-PD EPR maximum', value: '48 V × 5 A = 240 W' },
          ]}
        >
          <p>
            A linear power supply rectifies 60 Hz mains, smooths it with a big electrolytic, and
            then burns the excess voltage as heat across a pass transistor — efficiency is roughly
            V<sub>out</sub>/V<sub>in</sub>, so stepping rectified ~170 V<sub>peak</sub> down to 5 V
            wastes about 97% of the input as heat. Worse, the 60 Hz transformer itself has to handle
            the full output power at line frequency, which makes it physically large.
          </p>
          <p>
            A switched-mode supply rearranges the problem. It rectifies the AC into ~170 V DC, then
            chops that DC with a MOSFET at 50–500 kHz into a small high-frequency transformer, and
            rectifies the secondary back into smooth DC. Transformer core volume scales roughly as
            1/<em>f</em> for a given power handling, so jumping from 60 Hz to 100 kHz shrinks the
            magnetic mass by more than three orders of magnitude<Cite id="erickson-maksimovic-2020" in={SOURCES} />.
            That's why a modern USB-C charger weighs grams instead of kilograms.
          </p>
          <p>
            Typical conversion efficiencies are 85–95% across the load range, against ~50% for the
            best linear regulators converting from rectified mains<Cite id="erickson-maksimovic-2020" in={SOURCES} />.
            The price is electromagnetic complexity: the same 100 kHz square-wave switching edge
            that miniaturises the transformer also produces broadband EMI, which is why every
            SMPS contains line filters, Y-capacitors, and a snubber circuit on the primary side. The
            schematic abstractions of this chapter — Z<sub>L</sub>, Z<sub>C</sub>, power factor —
            are the working engineer's day-to-day tools for taming all of it<Cite id="horowitz-hill-2015" in={SOURCES} />.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 12.4"
          title="Why a 50 Ω SMA cable, and not 40 or 60?"
          summary={<>The 50 Ω convention is a compromise between two competing optima — minimum loss and maximum power handling — frozen into every piece of RF lab equipment.</>}
          specs={[
            { label: 'Typical RF coax Z₀', value: '50 Ω' },
            { label: 'TV / video coax Z₀', value: '75 Ω' },
            { label: 'Differential digital Z₀', value: '~100 Ω' },
            { label: 'Twin-lead antenna feed', value: '300 Ω' },
            { label: 'Min-loss coax Z₀ (air)', value: '~77 Ω' },
            { label: 'Max-power coax Z₀ (air)', value: '~30 Ω' },
          ]}
        >
          <p>
            For an air-dielectric coaxial cable, the per-unit-length attenuation depends on the
            ratio b/a of outer to inner conductor radii through
            <InlineMath> Z<sub>0</sub> = (η<sub>0</sub>/2π) ln(b/a)</InlineMath>. Minimising
            conductor loss for a fixed outer diameter is a calculus problem with a clean answer:
            the optimum sits at <strong>Z<sub>0</sub> ≈ 77 Ω</strong>. Maximising the power the
            cable can carry before air breakdown lands at a different optimum,
            <strong> Z<sub>0</sub> ≈ 30 Ω</strong><Cite id="pozar-2011" in={SOURCES} />. Splitting
            the difference geometrically — √(77·30) ≈ 48 Ω — rounded up to the nice round
            <strong> 50 Ω</strong>, gives a single standard that's near-optimal for both.
          </p>
          <p>
            Television cable diverged because it was driven by a different optimisation. Picture
            tubes wanted maximum signal voltage rather than maximum power transfer, and the loss
            minimum for the polyethylene dielectric used in early TV coax landed near
            <strong> 75 Ω</strong>; the industry settled there and never moved<Cite id="johnson-graham-1993" in={SOURCES} />.
            Digital pairs (USB, Ethernet, HDMI, PCIe) run at <strong>~100 Ω differential</strong>
            because that impedance is achievable with practical PCB trace geometries while keeping
            the per-pin current draw in a comfortable range for CMOS drivers.
          </p>
          <p>
            The economic consequence is that an enormous installed base of lab gear — network
            analyzers, spectrum analyzers, RF signal generators, oscilloscope active probes — all
            assume a 50 Ω world. Every SMA, BNC, and N-connector is 50 Ω; every test fixture
            terminates at 50 Ω; every coupler, attenuator, and amplifier has a 50 Ω port impedance.
            The 19th-century engineer's choice of cgs versus SI shows up as a footnote in textbooks;
            the 1940s choice of 50 Ω shows up in the BOM of every piece of RF hardware ever
            shipped.
          </p>
        </CaseStudy>
      </CaseStudies>

      <FAQ
        intro="The questions a careful reader asks after meeting a soldering iron for the first time."
      >
        <FAQItem q="When does the 'lumped element' picture stop being valid?">
          <p>
            When the circuit's spatial extent <strong>ℓ</strong> is no longer small compared to
            the wavelength <strong>λ = c/f</strong> of any signal in it. A practical rule of thumb
            is ℓ ≲ λ/10. At 60 Hz, λ ≈ 5000 km, so an entire continent's power grid is borderline
            "lumped." At 1 GHz, λ ≈ 30 cm; a circuit board trace longer than 3 cm starts behaving
            like a transmission line, with propagation delay and reflections that the schematic
            doesn't capture<Cite id="horowitz-hill-2015" in={SOURCES} />. RF and microwave
            engineering is essentially the discipline of doing Maxwell-equation calculations
            without the lumped shortcut.
          </p>
        </FAQItem>

        <FAQItem q="Why is the time constant τ = RC and not, say, R/C?">
          <p>
            Dimensional analysis pins it. R is in volts per amp; C is in coulombs per volt; amps
            are coulombs per second. Multiply: [V/A][C/V] = [C/A] = [s]. R/C, in contrast, has
            units of (V/A)/(C/V) = V²/(A·C) = V·s/(A·s²·s⁻¹) — nonsensical. The product RC is the
            only combination of these two that comes out as a time, and it does for a deep
            structural reason: the ODE dQ/dt = (V − Q/C)/R has the form τ dQ/dt = constant − Q,
            and τ = RC pops out as the unique scaling constant<Cite id="irwin-circuit-analysis-2015" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What's the difference between Z, X, and R?">
          <p>
            R is the real part of impedance (resistance, dissipative). X is the imaginary part
            (reactance, energy-storing). Z is the complex combination Z = R + jX. The magnitude
            |Z| = √(R² + X²) is the AC "Ohm's-law resistance" — the ratio of voltage amplitude
            to current amplitude. R has the same value at every frequency for an ideal resistor.
            X is frequency-dependent: X<sub>L</sub> = ωL grows with ω; X<sub>C</sub> = −1/(ωC)
            shrinks in magnitude as ω grows<Cite id="horowitz-hill-2015" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why is reactive power called 'reactive' — what is it doing?">
          <p>
            Storing energy in a field that releases it back to the source half a cycle later. In
            a pure capacitor, the cap charges up over one quarter cycle (drawing real current),
            then discharges back through the source over the next quarter cycle (sourcing real
            current). The time average is zero — no energy actually leaves the source. But the
            wires still carry the current both ways, and the conductors and transformers have to
            be sized for it. "Reactive" because it doesn't do work; it just reacts to the
            applied field<Cite id="grainger-power-systems-2003" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why does the grid charge for power factor?">
          <p>
            Because the utility's transmission losses scale with the square of the current it has
            to push, regardless of whether that current does real work at the customer end. A
            factory drawing 700 kW of real power at cos(φ) = 0.7 actually demands 1000 kVA from
            the grid, with 33% extra I²R losses in the transmission lines compared to a
            unity-power-factor customer. The utility passes that cost back as a "power factor
            penalty" on the bill, which incentivizes the customer to install correction
            capacitors and bring cos(φ) back near 1<Cite id="grainger-power-systems-2003" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What is RMS voltage and why divide by √2?">
          <p>
            Root-mean-square — the square-root of the time-averaged square of the waveform. For a
            sinusoid V(t) = V<sub>p</sub> cos(ωt), the mean of cos² over a full cycle is exactly
            1/2, so V<sub>rms</sub> = V<sub>p</sub>/√2. The point of RMS is that it gives the
            "DC-equivalent" voltage for power dissipation: a resistor delivered V<sub>rms</sub>
            AC dissipates the same average power V<sub>rms</sub>²/R as it would on V<sub>rms</sub>
            of DC. North American household 120 V<sub>rms</sub> has peak voltage ≈ 170 V, which
            is why your appliance insulation has to be rated for the higher number<Cite id="horowitz-hill-2015" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why is the grid 50 or 60 Hz?">
          <p>
            Historical accident, locked in by mid-20th-century infrastructure. Higher frequencies
            mean smaller, cheaper transformers (since transformer core size scales as 1/f for a
            given power), but they also mean higher inductive losses on long transmission lines.
            Tesla and Westinghouse settled on 60 Hz in the U.S. in the 1890s; AEG in Germany
            chose 50 Hz a few years earlier. Both work fine; both became the basis for incompatible
            regional grids that no one is going to unify now. Aircraft electronics, where weight
            matters most, run on 400 Hz for exactly that transformer-shrinkage reason.
          </p>
        </FAQItem>

        <FAQItem q="Why does an inductor make current lag and a capacitor make current lead?">
          <p>
            Because their constitutive equations differ in which variable is differentiated. For
            an inductor V = L dI/dt: to change the current you need to apply a voltage <em>first</em>,
            and the current responds with a quarter-cycle delay — V leads I by 90°. For a
            capacitor I = C dV/dt: current has to flow before voltage can build up on the
            plates, so current leads V by 90°. The exactness of 90° comes from the fact that
            d/dt acting on cos(ωt) gives −ω sin(ωt), which is the same cosine rotated by exactly
            π/2<Cite id="griffiths-2017" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What is the Q factor really measuring?">
          <p>
            Energy storage divided by energy dissipation per radian. Specifically,
            Q = 2π × (energy stored in the tank) / (energy dissipated per cycle). For a series
            RLC, this evaluates to Q = ω₀L/R = (1/R)√(L/C). A high-Q resonator can ring for
            Q/π cycles before losing 1/e of its energy. Crystal oscillators reach Q ≈ 10⁶; an
            atomic clock's cesium transition has effective Q ≈ 10¹⁰<Cite id="horowitz-hill-2015" in={SOURCES} />.
            The numerical sharpness of the resonance peak in the demo is set by exactly this
            ratio.
          </p>
        </FAQItem>

        <FAQItem q="Why does a poorly-designed amplifier 'oscillate'?">
          <p>
            Because of unintended positive feedback through stray L's and C's at high frequency.
            Every wire is a tiny inductor; every adjacent pair of conductors is a tiny capacitor.
            If the gain stage couples its output back to its input through one of these parasitic
            elements with the right phase, the loop turns into a self-driven RLC oscillator at
            whatever frequency the parasitic Z's pick out. Stable amplifier design is largely the
            art of keeping that feedback loop's phase shift away from the value where positive
            feedback could sustain<Cite id="horowitz-hill-2015" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Is impedance just a complex resistance?">
          <p>
            Yes, with the bonus that it bookkeeps phase as well as magnitude. For a sinusoidal
            steady-state signal, V = IZ is exactly Ohm's law with complex numbers in place of
            reals. The real part absorbs energy; the imaginary part stores and returns it. For
            non-sinusoidal signals (square waves, transients) you'd Fourier-decompose into
            sinusoids, apply Z(ω) component by component, and inverse-Fourier the result — which
            is how every modern circuit simulator works under the hood<Cite id="irwin-circuit-analysis-2015" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why is impedance matching important?">
          <p>
            Maximum power transfer from a source of impedance Z<sub>s</sub> to a load Z<sub>L</sub>
            happens when Z<sub>L</sub> = Z<sub>s</sub>* (complex conjugate match). With a real
            source resistance R<sub>s</sub>, this reduces to R<sub>L</sub> = R<sub>s</sub> — half
            the source's open-circuit power ends up in the load, half is wasted in the source's
            own internal resistance. Mismatched loads either steal too little current (load too
            heavy in Z) or burn too much in the source (load too light). In RF design, mismatched
            transmission-line terminations produce <em>reflections</em>, which is a different
            and worse failure mode<Cite id="horowitz-hill-2015" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What's a transmission line's characteristic impedance, and how does it differ from a resistor?">
          <p>
            A long pair of conductors carrying a wave has a characteristic impedance Z₀ = √(L/C)
            where L and C are <em>per unit length</em>. Coax cable runs 50 or 75 Ω; twisted-pair
            Ethernet, 100 Ω. Unlike a resistor, Z₀ is purely real but it does not dissipate
            energy — it sets the ratio of voltage to current in a propagating wave. Terminate the
            line in a real resistor equal to Z₀ and the wave is absorbed cleanly; mismatch the
            termination and part of the wave reflects back along the line. The lumped model
            doesn't capture this; the field model does<Cite id="griffiths-2017" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why do USB chargers use AC then convert to DC?">
          <p>
            Because the power coming out of the wall is AC (so it can be transmitted long
            distances and step-transformed with simple iron-core devices), but USB devices want
            DC (so they can charge a battery and feed silicon logic that has no concept of
            polarity reversal). The charger has a rectifier (AC → pulsed DC), a filter capacitor
            (pulsed DC → smooth DC), and usually a switching regulator (smooth DC at one voltage
            → smooth DC at another). Step-down via a high-frequency transformer is much smaller
            than at 60 Hz — which is why a modern 5 V USB charger is a small brick, not a
            lunchbox-sized linear transformer.
          </p>
        </FAQItem>

        <FAQItem q="Are AC and DC fundamentally different physical phenomena?">
          <p>
            No. They are two limits of the same Maxwell equations. DC is the ω → 0 limit of AC.
            All the same field laws, charge conservation, energy flow — Chapter 6's Poynting
            picture applies identically to both, with the only difference being that the field
            and current vectors flip sign twice per AC cycle. The historical War of the Currents
            between Edison's DC and Tesla's AC was settled by transformer convenience, not by
            either being physically "more correct."
          </p>
        </FAQItem>

        <FAQItem q="Why is high-voltage AC easier to transmit than DC?">
          <p>
            Mostly because of the transformer. Stepping AC voltage up or down requires only a
            laminated iron core and two coils — a passive, robust, simple device whose efficiency
            routinely exceeds 99%. Stepping DC voltage requires switching power electronics that
            were impractical before semiconductors; even today, HVDC transmission needs huge
            converter stations at each end<Cite id="grainger-power-systems-2003" in={SOURCES} />.
            The transmission losses themselves scale as <strong>P<sub>loss</sub> = (P<sub>load</sub>/V)² R</strong>,
            so for a given delivered power, raising V cuts the current — and therefore cuts I²R
            losses — quadratically. That is exactly why the grid pushes 500 kV across the
            continent and steps it down at the substation.
          </p>
        </FAQItem>

        <FAQItem q="How does a power-factor-correction capacitor work?">
          <p>
            Industrial loads (motors, fluorescent ballasts) look inductive from the grid's
            perspective — current lags voltage by some φ &gt; 0. Putting a capacitor in parallel
            adds a current that <em>leads</em> the voltage by 90°, partially cancelling the
            inductive lag. Sized correctly, the cap brings the net φ back near zero, the apparent
            power S drops down to the real power P, and the line current shrinks accordingly.
            The energy the inductor still wants to slosh back and forth now sloshes between the
            inductor and the local capacitor instead of all the way back to the utility, so the
            transmission losses drop<Cite id="grainger-power-systems-2003" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Where does the 'missing' reactive power go each cycle?">
          <p>
            Into the field, and then back out. For an inductor, the energy that flowed in during
            the first quarter cycle was stored in the magnetic field around the coil (½LI²). In
            the next quarter cycle, as the current decays, that stored field energy converts
            back into kinetic energy of charges flowing the <em>other</em> way through the source.
            Same for a capacitor — energy parks in the electric field between the plates and
            returns half a cycle later. From the field-flow viewpoint of Chapter 6, the Poynting
            vector reverses sign and the source absorbs energy it sent out moments earlier. No
            energy is lost; it just commutes back and forth through the wires<Cite id="griffiths-2017" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why is there a 90° phase shift exactly, and not 45° or 135°?">
          <p>
            Because the constitutive equations involve a single time-derivative, not a square root
            or a fractional derivative. d/dt applied to cos(ωt) gives −ω sin(ωt), which is the
            same cosine rotated by exactly π/2 radians in the complex plane. Two derivatives (as
            in the LC equation L d²Q/dt² + Q/C = 0) rotate by π, flipping sign. Real components
            with finite losses produce mixed phase shifts — a real inductor with series
            resistance looks like jωL + r, whose phase is less than 90° — but in the ideal limit
            of a pure reactance the phase is exactly π/2<Cite id="horowitz-hill-2015" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why is the Thévenin equivalent only valid for linear networks?">
          <p>
            Because superposition is the engine of the proof. To collapse N sources and M
            resistors to a single (V<sub>th</sub>, R<sub>th</sub>) pair, you compute the response
            of the terminals one source at a time, sum the contributions, and read off the result.
            Superposition only holds when the components obey linear constitutive equations:
            V = IR, V = L dI/dt, I = C dV/dt. A diode (I = I<sub>s</sub>(e<sup>qV/kT</sup> − 1))
            or a transistor (gm = ∂I/∂V varies with bias) breaks superposition, and the network
            no longer has a single fixed Thévenin equivalent — it has a different one at every
            operating point<Cite id="irwin-circuit-analysis-2015" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why is the −3 dB point the 'cutoff' rather than, say, −6 dB or −10 dB?">
          <p>
            Convention, but a useful one. A drop of 3 dB in voltage magnitude corresponds to
            exactly half the power being delivered to the load (since P ∝ |V|², and 10
            log<sub>10</sub>(½) ≈ −3.01 dB). The cutoff frequency is therefore the boundary
            where the filter has begun to attenuate the signal noticeably — the natural watershed
            between "passband" and "stopband." Higher-order filters define cutoff differently in
            some specs (the Chebyshev "ripple band edge", for instance), but the −3 dB point
            remains the default for first-order RC and RL filters<Cite id="oppenheim-willsky-1997" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="If an ideal op-amp has infinite gain, why doesn't the output instantly saturate?">
          <p>
            Because of negative feedback. The open-loop gain is enormous (10<sup>5</sup>–10<sup>6</sup>
            at DC for a typical part), so even a microvolt of differential input would slam the
            output to a rail. But once the output is fed back to the inverting input through any
            finite impedance, the loop drives V<sub>−</sub> to whatever value makes
            V<sub>out</sub>/A<sub>OL</sub> + V<sub>+</sub> = V<sub>−</sub>. In the limit
            A<sub>OL</sub> → ∞ that pins V<sub>+</sub> ≈ V<sub>−</sub> — the virtual short. The
            output sits at whatever value the loop equation says it must, not at the rail<Cite id="sedra-smith-2014" in={SOURCES} /><Cite id="horowitz-hill-2015" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why does slew rate matter — isn't gain-bandwidth the only speed spec?">
          <p>
            Gain-bandwidth governs small-signal response: the highest frequency at which the
            closed-loop gain is still flat. Slew rate is a large-signal limit: the absolute
            maximum dV<sub>out</sub>/dt the device can produce, set by an internal compensation
            capacitor charging from a fixed current. For small swings, gain-bandwidth wins. For
            large swings — driving a 10 V<sub>p-p</sub> sine into a load, say — slew rate sets
            the highest frequency at which the output still looks like a sine: f<sub>max</sub> =
            SR/(2π V<sub>p</sub>). An LM741 (SR = 0.5 V/µs) starts distorting a 10 V peak signal
            above ~8 kHz, even though its gain-bandwidth is 1 MHz<Cite id="horowitz-hill-2015" in={SOURCES} /><Cite id="sedra-smith-2014" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why is characteristic impedance Z₀ real but not dissipative?">
          <p>
            Z<sub>0</sub> = √(L′/C′) is the ratio V/I in a wave travelling along a lossless line.
            Both L′ and C′ are real and positive (storage, not loss), so their ratio is a real
            positive number — but no power is dissipated in moving the wave along the line; the
            energy is just transported from one end to the other. Z<sub>0</sub> sets the voltage
            response to a launched current the same way a resistor does, but the energy goes into
            field momentum rather than heat. Terminate the line with a real resistor R = Z<sub>0</sub>
            and the wave arrives at a load that <em>does</em> dissipate, looking back identical to
            an infinite line — which is why the wave is fully absorbed and no reflection comes
            back<Cite id="pozar-2011" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="When should I treat a PCB trace as a transmission line?">
          <p>
            Rule of thumb: when the trace's electrical length is longer than about one-sixth of
            the signal's rise time. For a 1 ns rise-time digital edge in a typical FR-4 PCB
            dielectric (v ≈ 1.5×10<sup>8</sup> m/s), one-sixth of t<sub>r</sub> times v gives
            roughly <strong>2.5 cm</strong> — past that length, ringing and reflections become
            visible on the bench<Cite id="johnson-graham-1993" in={SOURCES} />. Modern CMOS edges
            are 50–500 ps, which drops the threshold under 1 cm and is why every motherboard's
            high-speed signal lanes (DDR, PCIe, USB 3, HDMI) are routed as carefully impedance-
            controlled differential pairs with matched lengths.
          </p>
        </FAQItem>
      </FAQ>
    </ChapterShell>
  );
}
