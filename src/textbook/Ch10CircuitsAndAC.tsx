/**
 * Chapter 10 — Circuits, AC, and impedance
 *
 * The practical compression: take the field machinery of Ch.1–6 and reduce it
 * to nodes, branches, components, and complex impedance. Seven sections, six
 * embedded demos, FAQ at the end.
 */
import { ChapterShell } from '@/components/ChapterShell';
import { FAQ, FAQItem } from '@/components/FAQ';
import { Cite } from '@/components/SourcesList';
import { Formula, InlineMath } from '@/components/Formula';
import { KirchhoffsLawsDemo } from './demos/KirchhoffsLaws';
import { RCTransientDemo } from './demos/RCTransient';
import { LCOscillationDemo } from './demos/LCOscillation';
import { RLCResonanceDemo } from './demos/RLCResonance';
import { ImpedanceDemo } from './demos/Impedance';
import { ThreePhaseDemo } from './demos/ThreePhase';
import { getChapter } from './data/chapters';

export default function Ch10CircuitsAndAC() {
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
        <strong>KCL — Kirchhoff's current law.</strong> At any node in a circuit, the sum of
        currents flowing in equals the sum flowing out. This is charge conservation. Charge
        doesn't pile up in a wire — every electron that enters a junction has to leave by some
        other branch in the same instant. Algebraically:
      </p>
      <Formula>Σ I<sub>in</sub> = Σ I<sub>out</sub></Formula>
      <p>
        <strong>KVL — Kirchhoff's voltage law.</strong> Around any closed loop, the algebraic sum
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

      <h2><em>RLC</em> and resonance</h2>

      <p>
        Now add back the resistor and drive the network with a sinusoidal source V(t) = V₀ cos(ωt).
        Two new effects appear at once: the oscillation becomes <strong>damped</strong> (R dissipates
        energy on every cycle), and the system responds preferentially to one driving frequency —
        <strong> resonance</strong>.
      </p>
      <p>
        The steady-state current amplitude as a function of driving frequency is
      </p>
      <Formula>
        |I(ω)| = V<sub>0</sub> / √(R<sup>2</sup> + (ωL − 1/ωC)<sup>2</sup>)
      </Formula>
      <p>
        which peaks when ωL = 1/(ωC) — that is, at exactly ω = ω₀ = 1/√(LC). The sharpness of the
        peak is the <strong>Q factor</strong>:
      </p>
      <Formula>Q = ω<sub>0</sub> L / R = (1/R) √(L/C)</Formula>

      <RLCResonanceDemo />

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
        Represent each sinusoid V(t) = V₀ cos(ωt + φ) by the complex number V₀ e<sup>jφ</sup> at
        a fixed ω. Then time-derivatives become multiplications by jω, and Ohm's law generalises
        to <strong>V = I Z</strong>, where Z is the complex <em>impedance</em>:
      </p>
      <Formula>Z<sub>R</sub> = R</Formula>
      <Formula>Z<sub>L</sub> = jωL</Formula>
      <Formula>Z<sub>C</sub> = 1 / (jωC) = −j / (ωC)</Formula>
      <p>
        Resistors are real. Inductors are positive-imaginary: voltage <em>leads</em> current by
        90°, because V<sub>L</sub> = L dI/dt and the derivative of a cosine is a negative sine
        (rotated +90° in the complex plane). Capacitors are negative-imaginary: current
        <em> leads</em> voltage by 90°, because I = C dV/dt<Cite id="horowitz-hill-2015" in={SOURCES} />.
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

      <h2>AC <em>power</em> — and why the grid is three-phase</h2>

      <p>
        Multiply V(t) = V<sub>p</sub> cos(ωt) by I(t) = I<sub>p</sub> cos(ωt − φ) and average
        over a cycle. The instantaneous power oscillates wildly, but the time-average comes out to:
      </p>
      <Formula>⟨P⟩ = V<sub>rms</sub> I<sub>rms</sub> cos(φ)</Formula>
      <p>
        with V<sub>rms</sub> = V<sub>p</sub>/√2 and likewise for I. The factor cos(φ) is the
        <strong> power factor</strong>. A purely resistive load has φ = 0 and cos(φ) = 1 — every
        watt of VI is real, useful, heat-generating power. A purely reactive load (pure L or pure
        C) has φ = ±90° and cos(φ) = 0 — the load draws current, but on average no energy
        actually transfers; energy sloshes in and out each half-cycle.
      </p>
      <p>
        Engineers split the three quantities apart:
      </p>
      <ul>
        <li><strong>Real power</strong> P = V<sub>rms</sub> I<sub>rms</sub> cos(φ), units watts (W).
          What dissipates as heat or does mechanical work.</li>
        <li><strong>Reactive power</strong> Q = V<sub>rms</sub> I<sub>rms</sub> sin(φ), units VAR
          (volt-amperes reactive). Sloshes between source and load every cycle.</li>
        <li><strong>Apparent power</strong> S = V<sub>rms</sub> I<sub>rms</sub>, units VA. The
          magnitude of the complex power phasor; what the wires actually carry.</li>
      </ul>
      <p>
        A motor with cos(φ) = 0.7 doing 700 W of real work draws 1000 VA from the line — and the
        utility has to size its conductors and transformers for the apparent power, not the real
        power. That is why industrial customers are billed for both, and why factories install
        <strong> power-factor correction capacitors</strong> to cancel the inductive lag of their
        motor banks<Cite id="grainger-power-systems-2003" in={SOURCES} />.
      </p>
      <p>
        The grid itself goes a step further: three independent phases, 120° apart in time. Sum
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

      <h2>What we have so far</h2>
      <p>
        At wavelengths much larger than the circuit, Maxwell's equations compress to Kirchhoff's
        two laws plus three constitutive relations: V = IR for resistors, V = (1/C) ∫I dt for
        capacitors, V = L dI/dt for inductors. The RC, LC, and RLC combinations cover the entire
        zoo of first- and second-order linear behavior — exponential decay, free oscillation,
        damped driven oscillation, resonance. Recasting time-derivatives as multiplications by
        jω turns every linear-circuit problem into algebra in the complex plane: impedance,
        phase, power factor, three-phase delta. Chapters 1–6 explain <em>why</em> any of this is
        true. Chapter 10 is what you actually use<Cite id="horowitz-hill-2015" in={SOURCES} />.
      </p>

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
      </FAQ>
    </ChapterShell>
  );
}
