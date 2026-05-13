/**
 * Chapter 13 — Filters, op-amps, and transmission lines
 *
 * The frequency-domain and active-circuit sequel to Ch.12. Take the impedance
 * machinery and ask the next three questions: what does a circuit do across
 * all frequencies (filters), how do you build an arbitrary linear gain block
 * (op-amps), and when do you stop pretending a wire is a single node
 * (transmission lines).
 */
import { CaseStudies, CaseStudy } from '@/components/CaseStudy';
import { ChapterShell } from '@/components/ChapterShell';
import { FAQ, FAQItem } from '@/components/FAQ';
import { Cite } from '@/components/SourcesList';
import { Formula, InlineMath } from '@/components/Formula';
import { Term } from '@/components/Term';
import { TryIt } from '@/components/TryIt';
import { RCFilterBodeDemo } from './demos/RCFilterBode';
import { RLCBandpassDemo } from './demos/RLCBandpass';
import { OpAmpInvertingDemo } from './demos/OpAmpInverting';
import { OpAmpIntegratorDemo } from './demos/OpAmpIntegrator';
import { TransmissionLineReflectionDemo } from './demos/TransmissionLineReflection';
import { StandingWavesOnLineDemo } from './demos/StandingWavesOnLine';
import { SallenKeyFilterDemo } from './demos/SallenKeyFilter';
import { OpAmpFollowerDemo } from './demos/OpAmpFollower';
import { SmithChartBasicsDemo } from './demos/SmithChartBasics';
import { getChapter } from './data/chapters';

export default function Ch13FiltersOpAmpsTLines() {
  const chapter = getChapter('filters-op-amps-tlines')!;
  const SOURCES = chapter.sources;

  return (
    <ChapterShell chapter={chapter}>
      <p>
        Chapter 12 reduced Maxwell's equations to a netlist: voltages, currents, impedances, and
        Kirchhoff's two laws. That's enough to analyse a circuit at one frequency, or one moment
        in time. But three more questions follow immediately, and the working analog engineer
        spends most of their career inside the answers. What does the circuit do across <em>every</em>
        frequency, not just one (filters and the Bode plot)? How do you build a single component
        whose gain is whatever you want it to be (the op-amp)? And what happens when a wire is
        finally long enough that the signal takes real time to get from one end to the other
        (transmission lines)?
      </p>
      <p>
        This chapter is three sections, six demos, and the bridge from undergraduate
        circuit theory to the practice of real analog and RF design. The math is the same complex
        impedance machinery as Ch.12 — but now we let frequency be a variable, gain be programmable,
        and length be comparable to a wavelength.
      </p>

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
        where <strong>H(jω)</strong> is the complex transfer function (dimensionless ratio
        of output phasor to input phasor) at angular frequency <strong>ω</strong> (in
        radians per second), <strong>R</strong> is the series resistance (in ohms),
        <strong> C</strong> is the shunt capacitance (in farads), and
        <strong> j = √−1</strong> is the imaginary unit.
      </p>
      <p>
        whose magnitude is
      </p>
      <Formula>
        |H(jω)| = 1 / √(1 + (ω/ω<sub>c</sub>)<sup>2</sup>),    ω<sub>c</sub> = 1/RC
      </Formula>
      <p>
        where <strong>|H(jω)|</strong> is the dimensionless magnitude of the transfer
        function at angular frequency <strong>ω</strong> (in radians per second), and
        <strong> ω<sub>c</sub> = 1/RC</strong> is the cutoff angular frequency (also in
        radians per second), set by the resistance <strong>R</strong> (in ohms) and the
        capacitance <strong>C</strong> (in farads).
      </p>
      <p>
        Why does the corner land at exactly ω<sub>c</sub> = 1/RC? It is the frequency where the
        capacitor's impedance |1/jωC| = 1/(ωC) crosses through R — below that crossover the cap
        looks like an open circuit and the divider passes the signal nearly unchanged; above it,
        the cap is the smaller impedance and shorts the output toward ground. Same crossover, same
        intuition, for the RL low-pass and every first-order filter: the corner is wherever the
        frequency-dependent impedance equals the frequency-independent one. At ω<sub>c</sub> the
        two are equal, so |H| = 1/√2 (the output divider sees a complex equal-magnitude divider),
        which is exactly the −3 dB power-half point<Cite id="horowitz-hill-2015" in={SOURCES} />.
      </p>
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
        where <strong>H(jω)</strong> is the complex (dimensionless) transfer function at
        angular frequency <strong>ω</strong> (in radians per second), <strong>R</strong> is
        the series resistance (in ohms), <strong>L</strong> is the inductance (in henries),
        <strong> C</strong> is the capacitance (in farads), and <strong>j = √−1</strong>.
      </p>
      <p>
        which peaks at ω<sub>0</sub> = 1/√(LC) and is small everywhere else — a{' '}
        <strong>band-pass filter</strong>. Its bandwidth (the width of the −3 dB band around
        ω<sub>0</sub>) is Δω = ω<sub>0</sub>/Q, so the same Q-factor that set the sharpness of the
        resonance peak in Ch.12 also sets the selectivity of this filter. AM and FM
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

      <h3>Active filter topologies</h3>

      <p>
        Passive RLC sections do the job up to a point, but inductors are physically big, hard to
        integrate on silicon, and tend to pick up stray magnetic coupling. The standard
        alternative replaces the inductor with an op-amp and a couple of capacitors. The simplest
        and most-used result is the <strong>Sallen-Key</strong> stage: one op-amp wired as a
        non-inverting amplifier with two RC sections feeding its (+) input, producing a 2nd-order
        transfer function whose cutoff and quality factor can be chosen independently<Cite id="horowitz-hill-2015" in={SOURCES} /><Cite id="sedra-smith-2014" in={SOURCES} />.
      </p>
      <p>
        For an equal-component design with R<sub>1</sub> = R<sub>2</sub> = R, C<sub>1</sub> =
        C<sub>2</sub> = C, and a non-inverting gain K = 1 + R<sub>f</sub>/R<sub>g</sub>, the
        transfer function works out to
      </p>
      <Formula>
        H(jω) = K / (1 − (ω/ω<sub>0</sub>)<sup>2</sup> + j(ω/ω<sub>0</sub>)(3 − K))
      </Formula>
      <p>
        where <strong>H(jω)</strong> is the (dimensionless) complex transfer function at
        angular frequency <strong>ω</strong> (in radians per second),
        <strong> K = 1 + R<sub>f</sub>/R<sub>g</sub></strong> is the dimensionless
        non-inverting DC gain set by the feedback divider, <strong>ω<sub>0</sub> =
        1/(RC)</strong> is the cutoff angular frequency (in radians per second) for equal
        components <strong>R</strong> (in ohms) and <strong>C</strong> (in farads), and
        <strong> j = √−1</strong>.
      </p>
      <p>
        with corner ω<sub>0</sub> = 1/(RC) and Q = 1/(3 − K). The stopband slope is
        <strong> −40 dB/decade</strong>, twice as steep as a passive first-order RC; K controls
        the peaking at f<sub>0</sub>. Cascading two such stages with Q = 0.54 and Q = 1.31
        produces a 4th-order Butterworth (maximally flat passband, −80 dB/decade roll-off). Other
        Q pairs give Chebyshev, Bessel, or elliptic responses<Cite id="oppenheim-willsky-1997" in={SOURCES} />.
      </p>

      <SallenKeyFilterDemo />

      <p>
        K = 1 (R<sub>f</sub> = 0, a unity-gain follower) gives Q = 1/2, almost a Butterworth
        single stage. K = 1.586 gives the canonical Butterworth Q = 1/√2. Past K = 3 the
        denominator's imaginary part flips sign and the circuit oscillates — the textbook
        Sallen-Key instability. Sit just shy of that boundary and you get an extremely sharp
        peak useful for narrow-band detection.
      </p>

      <TryIt
        tag="Try 13.1b"
        question={
          <>
            A Sallen-Key low-pass uses equal components R = 10 kΩ, C = 10 nF. What is the cutoff
            frequency f<sub>0</sub>?
          </>
        }
        hint={<>f<sub>0</sub> = 1/(2π R C) for the equal-component Sallen-Key, exactly as for a passive RC.</>}
        answer={
          <>
            <Formula>R · C = 10<sup>4</sup> · 10<sup>−8</sup> = 10<sup>−4</sup> s</Formula>
            <Formula>f<sub>0</sub> = 1/(2π · 10<sup>−4</sup>) ≈ <strong>1.59 kHz</strong></Formula>
            <p>
              Cutoff frequency <strong>≈ 1.59 kHz</strong> — the same RC time constant as a
              passive low-pass with those components, but the second-order stage rolls off at
              −40 dB/decade past it instead of −20<Cite id="horowitz-hill-2015" in={SOURCES} /><Cite id="sedra-smith-2014" in={SOURCES} />.
            </p>
          </>
        }
      />

      <TryIt
        tag="Try 13.1"
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

      <p>
        The single most undersold topology, though, is the one with no gain at all: the
        <strong> voltage follower</strong>. R<sub>f</sub> = 0, R<sub>g</sub> = ∞; the output is
        wired straight back to the inverting input. Closed-loop gain is exactly 1. The whole
        point is the impedance translation: the (+) input draws picoamps from the source, while
        the output drives whatever load you hand it with the op-amp's tiny open-loop output
        resistance. A 1 MΩ sensor that would collapse under a 50 Ω load drives a 50 Ω load with
        zero attenuation once a follower sits between them<Cite id="horowitz-hill-2015" in={SOURCES} />.
      </p>

      <OpAmpFollowerDemo />

      <p>
        Every well-designed measurement front-end has a follower (or its differential-input
        sibling, the instrumentation amplifier) as the very first stage after the sensor — that
        is what the divider sag in §Voltage dividers and loading was anticipating.
      </p>


      <TryIt
        tag="Try 13.2"
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
        where <strong>Z<sub>0</sub></strong> is the characteristic impedance of the line
        (in ohms), <strong>L′</strong> is the inductance per unit length (in henries per
        metre), and <strong>C′</strong> is the capacitance per unit length (in farads per
        metre). Z<sub>0</sub> is purely real for a lossless line but does not dissipate
        energy — it sets the ratio of voltage to current in a wave traveling along the
        line.
      </p>
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
        where <strong>Γ</strong> is the dimensionless (in general complex) reflection
        coefficient — the ratio of the reflected to the incident voltage phasor at the
        termination — <strong>Z<sub>L</sub></strong> is the load impedance at the end of
        the line (in ohms, in general complex), and <strong>Z<sub>0</sub></strong> is the
        line's characteristic impedance (in ohms, real for a lossless line).
      </p>
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
        where <strong>VSWR</strong> is the dimensionless voltage standing-wave ratio,
        <strong> V<sub>max</sub></strong> and <strong>V<sub>min</sub></strong> are the
        maximum and minimum voltage envelope magnitudes along the line (in volts), and
        <strong> |Γ|</strong> is the magnitude of the reflection coefficient (dimensionless,
        between 0 and 1 for a passive load).
      </p>
      <p>
        A perfectly matched line shows VSWR = 1; a 2:1 mismatch is the practical limit for most
        RF work; ∞:1 (short or open) reflects all the power back to the source — which can
        damage a transmitter that wasn't designed to absorb its own reflected power.
      </p>

      <StandingWavesOnLineDemo />

      <h3>The Smith chart</h3>

      <p>
        Sliding Z<sub>L</sub> around and tracking Γ, |Γ|, and the phase by hand gets old fast.
        Philip Smith, working at Bell Labs in 1939, found that the right way to visualise it is
        to plot Γ directly on the unit disk of the complex plane — and to overlay the disk with
        the conformal images of the constant-resistance and constant-reactance lines under the
        bilinear map Γ = (z − 1)/(z + 1), where z = Z<sub>L</sub>/Z<sub>0</sub><Cite id="pozar-2011" in={SOURCES} />.
        Constant-r becomes a family of circles; constant-x becomes a family of arcs. Every passive
        load lies inside the unit disk; the centre is the matched load (Γ = 0, VSWR = 1); the rim
        is total reflection.
      </p>

      <SmithChartBasicsDemo />

      <p>
        The Smith chart's killer feature is that moving along the line corresponds to rotating
        around the origin. Drop the load Z<sub>L</sub> at the right end of a piece of cable and
        the impedance the generator sees at the left end is the original marker, rotated
        clockwise by 2βℓ = 4π · (ℓ/λ) on the chart. A quarter-wave section
        (ℓ = λ/4) rotates exactly 180° — turning a short into an open, an open into a short, and a
        load Z<sub>L</sub> into Z<sub>in</sub> = Z<sub>0</sub><sup>2</sup>/Z<sub>L</sub>. That
        last identity is the basis of the <strong>quarter-wave transformer</strong>, the
        single most popular impedance-matching trick in RF and microwave design<Cite id="pozar-2011" in={SOURCES} />.
      </p>

      <TryIt
        tag="Try 13.3b"
        question={
          <>
            A 50 Ω load needs to be matched to a generator that wants to see a 200 Ω input
            impedance, using a single quarter-wave transmission line between them. What
            characteristic impedance Z<sub>0</sub> must the line have?
          </>
        }
        hint={<>For a quarter-wave line, Z<sub>in</sub> = Z<sub>0</sub><sup>2</sup> / Z<sub>L</sub>. Solve for Z<sub>0</sub>.</>}
        answer={
          <>
            <Formula>Z<sub>0</sub> = √(Z<sub>in</sub> · Z<sub>L</sub>) = √(200 · 50)</Formula>
            <Formula>Z<sub>0</sub> = √(10 000) = <strong>100 Ω</strong></Formula>
            <p>
              A <strong>100 Ω</strong> quarter-wave line transforms a 50 Ω load into a 200 Ω
              input. The same arithmetic appears in every antenna feed, every microstrip filter,
              and every monolithic microwave integrated circuit — the geometric mean of the two
              impedances you need to bridge<Cite id="pozar-2011" in={SOURCES} />.
            </p>
          </>
        }
      />

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

      <TryIt
        tag="Try 13.3"
        question={
          <>
            A 50 Ω cable is terminated with a 100 Ω resistor. What is the reflection coefficient,
            and what fraction of the incident power reaches the load?
          </>
        }
        hint={<>Γ = (Z<sub>L</sub> − Z<sub>0</sub>) / (Z<sub>L</sub> + Z<sub>0</sub>); transmitted-power fraction is 1 − |Γ|².</>}
        answer={
          <>
            <Formula>Γ = (100 − 50)/(100 + 50) = 50/150 = 1/3</Formula>
            <p>
              The reflected voltage is +1/3 of the incident; |Γ|² = 1/9 of the power bounces back,
              so the load receives <strong>8/9 ≈ 89%</strong> of the incident power. The standing
              wave ratio is VSWR = (1 + 1/3)/(1 − 1/3) = <strong>2:1</strong> — borderline
              acceptable for most RF work<Cite id="pozar-2011" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2>What we have so far</h2>
      <p>
        Three sequels to Ch.12. Transfer functions and Bode plots compress a circuit's
        frequency-by-frequency behaviour to two straight-line asymptotes — passband flat, stopband
        rolling off at a slope set by the order of the filter. Op-amps in negative feedback turn
        every linear gain block into a two-resistor problem: gain, integrator, summer,
        transimpedance, all from the same virtual-short rule. And transmission lines hand off
        from lumped-element analysis when the wire's length exceeds about λ/10 — once that
        threshold is crossed, every interconnect is engineered as a controlled-impedance
        waveguide. Together these are the working analog engineer's toolkit; together with Ch.12
        they cover every circuit on every PCB in your room<Cite id="horowitz-hill-2015" in={SOURCES} />.
      </p>

      <CaseStudies intro="Three places where this chapter's machinery is the entire design.">
        <CaseStudy
          tag="Case 13.1"
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

        <CaseStudy
          tag="Case 13.2"
          title="The transimpedance amp in your phone's selfie camera"
          summary={<>A photodiode delivers a few nanoamps of photocurrent; an op-amp with a 1 MΩ feedback resistor turns it into volts.</>}
          specs={[
            { label: 'Photodiode current (typical)', value: '~10 nA / lux' },
            { label: 'Feedback resistor', value: '~1 MΩ' },
            { label: 'Output (1000 lux scene)', value: '~10 V (rail-clipped to ~3 V)' },
            { label: 'Op-amp input bias current', value: 'pA range (FET input)' },
            { label: 'Bandwidth', value: '~1 MHz' },
            { label: 'Topology', value: 'transimpedance (I-to-V)' },
          ]}
        >
          <p>
            A reverse-biased photodiode produces a current proportional to the light falling on it
            — a few nanoamps to a few microamps in indoor lighting. To convert that current into
            a voltage a downstream ADC can sample, you tie it to the inverting input of an op-amp
            with a single feedback resistor R<sub>f</sub>. Virtual ground forces V<sub>−</sub> = 0,
            so the diode sees zero bias (the ideal condition for fast, low-noise operation) while
            its photocurrent flows entirely through R<sub>f</sub><Cite id="horowitz-hill-2015" in={SOURCES} />.
            The output is V<sub>out</sub> = −I<sub>photo</sub> · R<sub>f</sub>.
          </p>
          <p>
            Pick R<sub>f</sub> = 1 MΩ and 1 nA of photocurrent gives 1 mV — perfectly within an
            ADC's resolution. The op-amp must be a JFET- or CMOS-input type so that the input bias
            current (picoamps, not nanoamps) doesn't drown out the signal<Cite id="sedra-smith-2014" in={SOURCES} />.
            A small capacitor in parallel with R<sub>f</sub> tames the high-frequency peaking that
            otherwise arises from the photodiode's junction capacitance combined with the feedback
            network — a textbook frequency-compensation problem solved with one passive part.
          </p>
          <p>
            Every CMOS image sensor in every smartphone is millions of such pixels, each with a
            tiny photodiode and a single-transistor source follower (a near-relative of the
            voltage-follower op-amp). The same transimpedance topology, scaled up, drives every
            fibre-optic receiver in every data centre on Earth.
          </p>
        </CaseStudy>
      </CaseStudies>

      <FAQ
        intro="Questions that come up the first time you reach for a function generator and an oscilloscope."
      >
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

        <FAQItem q="What's the difference between a Butterworth, Chebyshev, and Bessel filter?">
          <p>
            Three different optimisations of the same RLC-cascade architecture. A Butterworth
            filter is designed for the flattest possible passband magnitude — its response is
            monotonic from DC to the cutoff with no ripples. A Chebyshev filter accepts some
            equal-amplitude ripple in the passband in exchange for a steeper roll-off in the
            stopband. A Bessel filter sacrifices stopband sharpness to preserve linear phase
            (constant group delay), which matters for pulse-shaped signals like digital data
            and audio transients<Cite id="oppenheim-willsky-1997" in={SOURCES} /><Cite id="horowitz-hill-2015" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why is the LM741 still in production after 50+ years?">
          <p>
            Inertia and pedagogy. The LM741 (1968) was a workhorse general-purpose op-amp — bipolar
            input, internally compensated, easy to use, single supply — and it became <em>the</em>{' '}
            textbook example. Modern parts (TL081, OPA2134, LT1115, ADA4898) outperform it on
            every spec: lower noise, faster slew rate, higher gain-bandwidth, lower offset, lower
            bias current. But existing equipment that just needs "any old op-amp" still spec-calls
            for the 741 in countless service manuals; replacing it with a "better" part can
            actually break circuits that relied on its sluggishness for stability<Cite id="horowitz-hill-2015" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why do high-speed digital boards use differential pairs?">
          <p>
            Common-mode rejection. A single-ended signal radiates and picks up noise relative
            to ground; two complementary signals routed close together cancel out — both
            radiated and incoming common-mode noise affect both wires equally, and the receiver
            looks only at the difference. Differential pairs are typically 100 Ω characteristic
            impedance and routed with carefully matched length, spacing, and reference plane so
            that the two halves stay balanced<Cite id="johnson-graham-1993" in={SOURCES} />.
            USB, Ethernet, HDMI, DisplayPort, PCIe, and DDR all use them.
          </p>
        </FAQItem>

        <FAQItem q="Can you stabilize a circuit just by adding a capacitor in the feedback loop?">
          <p>
            Sometimes — that's called dominant-pole compensation, and the LM741's famous 30 pF
            internal cap does exactly this. It deliberately rolls off the open-loop gain at
            ~10 Hz to ensure the gain crosses unity at ~1 MHz with a comfortable phase margin
            (~60°). The trade-off is that the closed-loop bandwidth at unity gain is just 1 MHz.
            More aggressive compensation techniques (lead-lag, pole-zero cancellation) preserve
            more bandwidth but require more design effort and more parts<Cite id="sedra-smith-2014" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What's the 'gain-bandwidth product' and why is it constant?">
          <p>
            A dominant-pole-compensated op-amp's open-loop gain falls at −20 dB/decade above a
            very low corner (~10 Hz for an LM741). On a log-log plot that's a straight line of
            slope −1, which means the product of gain and frequency is constant. If you set the
            closed-loop gain to 10 by external resistors, the bandwidth is 10× lower than the
            unity-gain bandwidth. For the LM741: GBW = 1 MHz, so a ×100 amp has 10 kHz of
            bandwidth<Cite id="horowitz-hill-2015" in={SOURCES} />. The trade-off is exact, by
            construction.
          </p>
        </FAQItem>

        <FAQItem q="What happens if I forget to terminate a transmission line?">
          <p>
            The wave reflects off the open end with Γ = +1 and bounces back to the source. If the
            source impedance also isn't matched (often the case for a CMOS gate), it re-reflects.
            Each round trip the signal rings; on a 'scope you see overshoot, undershoot, and a
            decaying oscillation at f = c/(2L · √ε<sub>r</sub>). Past a certain length the
            overshoot exceeds the gate's input threshold and the receiver registers extra
            edges — false clocks, double-counted bits<Cite id="johnson-graham-1993" in={SOURCES} />.
            Termination eliminates this completely.
          </p>
        </FAQItem>

        <FAQItem q="Are op-amps ever used without feedback?">
          <p>
            Yes — as comparators. A comparator looks at two inputs and slams the output to one
            rail or the other depending on which is bigger. With no feedback, the infinite
            open-loop gain is exactly the desired behaviour: any V<sub>+</sub> − V<sub>−</sub>{' '}
            ≠ 0 saturates the output. Dedicated comparator parts (LM393, LM339) are faster than
            general-purpose op-amps in this mode because they're designed to recover quickly from
            saturation. Op-amps in comparator mode are slower but work in a pinch<Cite id="horowitz-hill-2015" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why isn't there an 'ideal current amplifier' the way there's an ideal voltage amp?">
          <p>
            There is — it's just less popular. A current-mode amplifier (current conveyor, OTA,
            CFA) takes a current at its input and produces a current at its output, with the gain
            set by a resistor ratio rather than R<sub>f</sub>/R<sub>in</sub>. They have higher
            bandwidth than voltage-feedback op-amps at high gains because they aren't constrained
            by a single gain-bandwidth product. Most analog designers stick with voltage-mode
            op-amps because the design idiom is more familiar, but RF and high-speed video parts
            often use current-mode internally<Cite id="sedra-smith-2014" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Can a filter be designed to have arbitrary frequency response?">
          <p>
            Almost. Any rational transfer function (a ratio of two polynomials in s = jω) can be
            realised as a cascade of first- and second-order RLC sections; the design problem is
            choosing the pole and zero locations to match a desired magnitude or phase response.
            Active filters (op-amp + RC, no inductor) extend the range further. The fundamental
            limits are causality (the impulse response must be zero before t = 0) and stability
            (poles must lie in the left half of the s-plane). Beyond those, the catalogue is
            essentially open-ended<Cite id="oppenheim-willsky-1997" in={SOURCES} />.
          </p>
        </FAQItem>
      </FAQ>
    </ChapterShell>
  );
}
