/**
 * Chapter 19 — Rectifiers and inverters
 *
 * AC↔DC conversion. Six sections, six embedded demos, FAQ at the end.
 * Builds directly on Ch.12 (AC, impedance, RC) and Ch.5 (capacitors).
 */
import { CaseStudies, CaseStudy } from '@/components/CaseStudy';
import { ChapterShell } from '@/components/ChapterShell';
import { FAQ, FAQItem } from '@/components/FAQ';
import { Cite } from '@/components/SourcesList';
import { Formula, InlineMath } from '@/components/Formula';
import { Term } from '@/components/Term';
import { TryIt } from '@/components/TryIt';
import { Pullout } from '@/components/Prose';
import { DiodeCharacteristicDemo } from './demos/DiodeCharacteristic';
import { BridgeRectifierDemo } from './demos/BridgeRectifier';
import { LinearRegulatorDemo } from './demos/LinearRegulator';
import { BuckConverterDemo } from './demos/BuckConverter';
import { HBridgeInverterDemo } from './demos/HBridgeInverter';
import { GridTieInverterDemo } from './demos/GridTieInverter';
import { BoostConverterDemo } from './demos/BoostConverter';
import { FlybackConverterDemo } from './demos/FlybackConverter';
import { PWMInverterOutputDemo } from './demos/PWMInverterOutput';
import { getChapter } from './data/chapters';

export default function Ch19RectifiersAndInverters() {
  const chapter = getChapter('rectifiers-and-inverters')!;
  const SOURCES = chapter.sources;

  return (
    <ChapterShell chapter={chapter}>
      <p>
        Pick up the brick on the cord of your laptop charger. It is heavier than it has any right
        to be — a hundred grams or so of plastic and silicon, taking 120 V at 60 Hz from the wall
        and producing 20 V of clean DC at five amps. Cut it open and you find one of the most
        complex circuits in your immediate vicinity: a bridge rectifier on the line side, a
        power-factor-correction pre-regulator, a high-frequency transformer driven by a 100 kHz
        MOSFET, a secondary rectifier, a smoothing capacitor, an opto-isolator,
        and a USB Power Delivery controller IC negotiating
        the voltage with whatever you plugged in<Cite id="mohan-undeland-robbins-2003" in={SOURCES} />.
      </p>
      <p>
        Or, if you prefer the other direction: walk around the side of a house with solar panels
        on the roof. The panels produce something like 400 V DC. The grid wants 240 V at 60 Hz, in
        phase, with the right amount of reactive support, and with the legal obligation to
        disconnect cleanly inside two seconds if the line ever goes
        dead<Cite id="mohan-undeland-robbins-2003" in={SOURCES} />. The box on the wall that takes
        one and produces the other is doing essentially the inverse of the laptop brick. Both
        problems — AC to DC, DC to AC — are the territory of power electronics, and the silicon
        that makes them work is the subject of this chapter.
      </p>

      <h2>The <em>diode</em> — a one-way valve</h2>

      <p>
        Every rectifier in the world is built around one component: the{' '}
        <Term def={<><strong>diode</strong> — a two-terminal device that conducts current readily in one direction (forward) and blocks it in the other (reverse). Implemented as a vacuum tube (Fleming 1904) or a doped semiconductor junction (Shockley 1949).</>}>diode</Term>.
        Connect it one way and current flows; flip it around and almost nothing happens. John
        Ambrose Fleming patented the first electronic diode — a thermionic vacuum tube he called
        the "oscillation valve" — in 1904<Cite id="fleming-1904" in={SOURCES} />. Heating a
        cathode boiled electrons off into vacuum; an anode at positive potential collected them;
        reverse the polarity and the cold anode emitted nothing. The trick survived almost
        unchanged for fifty years, then got replaced wholesale by a piece of doped silicon.
      </p>
      <p>
        William Shockley wrote down the underlying physics of the semiconductor diode in
        1949<Cite id="shockley-1949" in={SOURCES} />. Joining a p-type slab (excess holes) to an
        n-type slab (excess electrons) creates a depletion region across the junction; an applied
        voltage either narrows or widens it. The current that flows is the famous
        <strong> Shockley diode equation</strong>:
      </p>
      <Formula>I = I<sub>s</sub> ( exp(V / (n V<sub>T</sub>)) − 1 )</Formula>
      <p>
        where I<sub>s</sub> is a tiny saturation current (nanoamps for silicon, microamps for
        Schottky), n is the ideality factor (≈ 1 for an ideal junction), and{' '}
        <Term def={<><strong>thermal voltage</strong> — <em>V<sub>T</sub> = kT/q</em> ≈ 25.85 mV at T = 300 K. The natural voltage scale of any thermally-populated semiconductor.</>}>V<sub>T</sub> = kT/q</Term>
        {' '}is the thermal voltage, about 25.85 mV at room temperature<Cite id="codata-2018" in={SOURCES} />.
        The exponential is the whole story: at V = 0 the current is zero; at V = 0.6 V it is
        already roughly a million times I<sub>s</sub>; at V = 0.7 V it is conducting tens of
        milliamps. That is what an engineer means when they write "the diode drops 0.7 V."
      </p>
      <p>
        Three flavours matter for power conversion. A standard silicon diode has{' '}
        <Term def={<><strong>forward voltage</strong> — the V across a forward-biased diode at its typical operating current; the practical "knee" of the I–V curve. ≈ 0.7 V for silicon p-n, ≈ 0.3 V for Schottky, ≈ 0.2 V for low-V<sub>F</sub> germanium.</>}>V<sub>F</sub></Term>
        {' '}≈ 0.7 V and reverse blocking up to its rated peak inverse voltage. A{' '}
        <Term def={<><strong>Schottky diode</strong> — a metal-semiconductor junction rather than p-n. Lower V<sub>F</sub> (≈ 0.3 V) and majority-carrier conduction (no slow minority-carrier storage), so it switches in picoseconds. Standard rectifier in the output of every switching power supply.</>}>Schottky</Term>
        {' '}diode uses a metal-semiconductor junction instead of a p-n junction;
        it has V<sub>F</sub> ≈ 0.3 V and switches in picoseconds, which is why it is the standard
        output rectifier in fast switching supplies<Cite id="horowitz-hill-2015" in={SOURCES} />.
        A{' '}
        <Term def={<><strong>Zener diode</strong> — a heavily-doped p-n diode designed to operate in reverse breakdown at a specific clamp voltage (typically 2.4 V to 200 V). The "Zener voltage" V<sub>Z</sub> is set by the doping profile and is remarkably stable; used as a voltage reference and as an over-voltage clamp.</>}>Zener</Term>
        {' '}diode is doped to break down sharply at a specific reverse voltage (5.1 V, 12 V,
        whatever you order); past that, it clamps. Pull current through a 5.1 V Zener and the
        voltage across it stays glued to 5.1 V — which makes it a cheap voltage
        reference<Cite id="horowitz-hill-2015" in={SOURCES} />.
      </p>

      <DiodeCharacteristicDemo />

      <p>
        Sweep V on the plot. The Si curve barely conducts until ~0.6 V, then climbs almost
        vertically. The Schottky's knee is a quarter-volt lower. The Zener is identical to the Si
        diode forward but adds a second knee at −5.1 V reverse — past that, current can flow
        backwards without destroying the device. Heat the diode (slide T up) and V<sub>F</sub>
        falls about 2 mV per kelvin — a fact worth knowing because it is how every silicon-based
        thermometer works.
      </p>
      <p className="pullout">
        Every rectifier in the world is a diode and a clever idea about which way to point it.
      </p>

      <h2><em>Half-wave, full-wave, bridge</em></h2>

      <p>
        Put a single diode in series with an AC source and a load. On the positive half-cycle the
        diode conducts and current flows; on the negative half it blocks. The output is a series
        of positive half-sinusoids with gaps in between — pulsating, ugly, but unambiguously
        positive. This is the{' '}
        <Term def={<><strong>half-wave rectifier</strong> — one diode in series with the AC source; conducts on one polarity only. The negative half of every cycle is thrown away, so the output averages only <em>V<sub>p</sub>/π</em>.</>}>half-wave rectifier</Term>,
        and it is wasteful: half the energy goes nowhere. The average DC output is only{' '}
        <InlineMath>V<sub>p</sub>/π ≈ 0.318 V<sub>p</sub></InlineMath>.
      </p>
      <p>
        The{' '}
        <Term def={<><strong>full-wave centre-tap rectifier</strong> — two diodes plus a centre-tapped transformer. Each diode handles one half-cycle; both halves drive the load with the same polarity. Doubles the average output to <em>2 V<sub>p</sub>/π</em>.</>}>full-wave centre-tap rectifier</Term>
        {' '}does better. Two diodes plus a centre-tapped transformer let each
        diode handle one half-cycle, with the two halves arranged to drive the load in the same
        direction. The output average doubles to <InlineMath>2 V<sub>p</sub>/π ≈ 0.636 V<sub>p</sub></InlineMath>,
        and the ripple frequency doubles too (because there are no gaps any more) — easier to
        filter<Cite id="mohan-undeland-robbins-2003" in={SOURCES} />.
      </p>
      <p>
        The{' '}
        <Term def={<><strong>bridge rectifier</strong> — four diodes arranged in a bridge between the AC input and the DC output. Routes each half-cycle through a different diode pair, producing a full-wave rectified output without needing a centre-tapped transformer. The universal rectifier of low-cost power supplies.</>}>bridge rectifier</Term>
        {' '}does it without the transformer centre-tap. Four diodes are
        arranged so that whichever AC terminal is positive, current always reaches the load by the
        same polarity. Two diodes are always in the path, so the DC output is{' '}
        <InlineMath>V<sub>p</sub> − 2 V<sub>F</sub></InlineMath>. The bridge is the workhorse
        topology of cheap power supplies: four-diode "Graetz cells" are sold for pennies and
        appear in every wall-wart, every car alternator output, every USB charger.
      </p>
      <p>
        On its own, the bridge still produces a pulsating output — full-wave-rectified sine
        humps at twice the line frequency. To turn that into smooth DC, you parallel the output
        with a large{' '}
        <Term def={<><strong>ripple</strong> — the AC component remaining on top of an imperfectly-smoothed DC supply. For a bridge rectifier feeding a capacitor C through load current <em>I</em>, the peak-to-peak ripple is <em>ΔV ≈ I / (2 f<sub>line</sub> C)</em>.</>}>smoothing capacitor</Term>.
        Each peak of the rectified waveform charges the cap up to{' '}
        V<sub>p</sub> − 2 V<sub>F</sub>; between peaks, the cap discharges into the load through
        R<sub>load</sub>. If R<sub>load</sub> · C is much longer than half a line cycle, the
        output sags only slightly between peaks — the ripple voltage is{' '}
        <InlineMath>ΔV ≈ I<sub>load</sub> / (2 f<sub>line</sub> C)</InlineMath>,
        a direct consequence of Q = CV applied during the discharge
        interval<Cite id="horowitz-hill-2015" in={SOURCES} />.
      </p>

      <BridgeRectifierDemo />

      <p>
        Crank up C and the orange trace flattens out. Drop R<sub>load</sub> (more current) and
        ripple grows. The ripple frequency is 120 Hz (twice the 60 Hz line), as expected — every
        half-cycle gets used.
      </p>

      <TryIt
        tag="Try 19.1"
        question={
          <>
            A bridge rectifier feeds a <strong>1000 µF</strong> capacitor with a steady
            <strong> 1 A</strong> load current from 60 Hz mains. Estimate the peak-to-peak ripple.
          </>
        }
        hint={<>ΔV ≈ I · T / C, where T = 1/(2 f<sub>line</sub>) = 8.33 ms (half-cycle between peaks).</>}
        answer={
          <>
            <p>
              The cap discharges into the load for one half-cycle between recharges:
            </p>
            <Formula>ΔV ≈ I · T / C = 1 A · 8.33×10⁻³ s / 10⁻³ F = 8.3 V</Formula>
            <p>
              About <strong>8.3 V peak-to-peak</strong> — enormous on a 5 V rail. That is why bulk
              caps in linear supplies are huge: to drag the ripple under 1 V at 1 A, you need
              ≈ 10 mF<Cite id="horowitz-hill-2015" in={SOURCES} />.
            </p>
          </>
        }
      />

      <TryIt
        tag="Try 19.7"
        question={
          <>
            The same <strong>1000 µF</strong> smoothing cap, but now the load draws only{' '}
            <strong>100 mA</strong> from 60 Hz mains. What is the peak-to-peak ripple? Use
            T = 1/(2 · 60) = 8.33 ms because both half-cycles top the cap up.
          </>
        }
        hint={<>Same ΔV ≈ I · T / C, just with I = 0.1 A.</>}
        answer={
          <>
            <Formula>ΔV ≈ 0.1 A · 8.33×10⁻³ s / 10⁻³ F = <strong>0.83 V</strong></Formula>
            <p>
              About <strong>830 mV peak-to-peak</strong> — ten times less, exactly as the linear ΔV ∝ I
              law predicts. The bridge fires twice per line cycle (full-wave), so the cap only has to
              hold up the load for 8.3 ms between recharges, not 16.7 ms<Cite id="horowitz-hill-2015" in={SOURCES} />.
            </p>
          </>
        }
      />

      <p className="pullout">
        Four diodes and a capacitor: the most ubiquitous circuit on Earth.
      </p>

      <h2>Regulating the <em>rough DC</em></h2>

      <p>
        The output of a bridge rectifier is "DC" the way a bumpy dirt road is "flat." Its average
        voltage drifts with the load. Its ripple modulates every signal connected to it. Its
        absolute level depends on the mains voltage, which itself wanders ±5 % around its
        nominal. Most digital chips will not tolerate a power rail that does any of this.
      </p>
      <p>
        The simplest fix is a{' '}
        <Term def={<><strong>linear regulator</strong> — a circuit that holds its output voltage constant by adjusting a pass transistor in series with the load, dropping the difference between V<sub>in</sub> and V<sub>out</sub> as heat. Efficiency = V<sub>out</sub>/V<sub>in</sub>.</>}>linear regulator</Term>.
        Inside a three-terminal device like the LM7805 sits a pass transistor whose gate
        (or base) is controlled by a feedback loop. The loop measures V<sub>out</sub>, compares it
        to an internal Zener-or-bandgap reference, and adjusts the transistor's resistance to
        keep V<sub>out</sub> = 5.000 V regardless of input voltage or output
        current<Cite id="horowitz-hill-2015" in={SOURCES} />. The difference between V<sub>in</sub>
        and V<sub>out</sub> — and the full load current — show up as heat:
      </p>
      <Formula>P<sub>diss</sub> = (V<sub>in</sub> − V<sub>out</sub>) · I<sub>load</sub></Formula>
      <p>
        The efficiency is just η = V<sub>out</sub>/V<sub>in</sub>. Stepping 12 V down to 5 V wastes
        58% of every input watt. Stepping 24 V down to 3.3 V wastes 86%. There is also a minimum
        operating margin: a standard LM7805 needs at least about <strong>2 V of headroom</strong>
        (its{' '}
        <Term def={<><strong>dropout voltage</strong> — the minimum V<sub>in</sub> − V<sub>out</sub> required for a linear regulator to maintain regulation. Standard NPN-pass regulators need ≈ 2 V; low-drop-out (LDO) PMOS-pass regulators need only a few hundred millivolts.</>}>dropout voltage</Term>)
        between input and output, or it slides out of regulation and the output simply tracks
        V<sub>in</sub> − 2 V. Low-drop-out (LDO) variants use a PMOS pass element instead and can
        regulate with only a few hundred millivolts of headroom — at the cost of slightly worse
        transient response<Cite id="horowitz-hill-2015" in={SOURCES} />.
      </p>

      <LinearRegulatorDemo />

      <TryIt
        tag="Try 19.2"
        question={
          <>
            An LM7805 takes <strong>12 V</strong> in and supplies <strong>500 mA</strong> at 5 V.
            How much power does it dissipate? How hot does it get without a heatsink (use
            θ<sub>JA</sub> ≈ 65 °C/W in still air)?
          </>
        }
        hint={<>P<sub>diss</sub> = (V<sub>in</sub> − V<sub>out</sub>) · I; ΔT = P · θ<sub>JA</sub>.</>}
        answer={
          <>
            <Formula>P<sub>diss</sub> = (12 − 5) · 0.5 = 3.5 W</Formula>
            <Formula>ΔT = 3.5 W · 65 °C/W ≈ 228 °C</Formula>
            <p>
              The junction would sit ~<strong>228 °C above ambient</strong> — far above the 150 °C
              maximum<Cite id="horowitz-hill-2015" in={SOURCES} />. Add a heatsink (θ<sub>JA</sub>
              {' '}≈ 10 °C/W) and you drop ΔT to a survivable 35 °C; or use a switcher and burn 0.3 W
              instead of 3.5 W.
            </p>
          </>
        }
      />

      <p>
        Linear regulators still win where switching noise is unacceptable: precision analog
        front-ends, audio amplifiers, low-jitter clock generators, photodetectors near the noise
        floor. But for any task that puts a watt or more through a large step-down ratio, they
        are an embarrassment. The fix is to stop burning the voltage difference and start
        chopping it.
      </p>

      <h2><em>Switch-mode</em>: buck, boost, flyback</h2>

      <p>
        Instead of dropping the excess voltage continuously, switch it on and off. A
        <strong> high-side switch</strong> (a MOSFET) opens and closes at tens or hundreds of
        kilohertz; the result is a square-wave version of V<sub>in</sub>. An inductor and a
        capacitor smooth that chopped waveform into a clean DC output. The fundamental insight,
        formalised by Erickson and Maksimović, is{' '}
        <Term def={<><strong>volt-second balance</strong> — in steady state, the average voltage across an ideal inductor over one switching period must be zero (otherwise the current would grow without bound). Setting <em>∫ V<sub>L</sub> dt = 0</em> across the on-time and off-time gives the conversion ratio of every basic SMPS topology.</>}>volt-second balance on the inductor</Term>:
        the integral of V<sub>L</sub> over one switching cycle must be zero in steady state,
        otherwise the inductor current would grow without
        bound<Cite id="erickson-maksimovic-2020" in={SOURCES} />.
      </p>
      <p>
        Apply that to the canonical{' '}
        <Term def={<><strong>buck converter</strong> — a step-down DC-DC topology consisting of a high-side switch, a low-side diode (or synchronous switch), an inductor, and an output capacitor. <em>V<sub>out</sub> = D · V<sub>in</sub></em> in continuous-conduction mode.</>}>buck (step-down) converter</Term>
        {' '}with{' '}
        <Term def={<><strong>duty cycle</strong> — the fraction of each switching period during which the switch is ON. <em>D = t<sub>on</sub> / T<sub>sw</sub></em>. Continuous from 0 to 1.</>}>duty cycle</Term>
        {' '}D = t<sub>on</sub>/T<sub>sw</sub>: when the switch is on the inductor sees
        V<sub>in</sub> − V<sub>out</sub>; when it is off it sees −V<sub>out</sub>. Volt-second
        balance gives
      </p>
      <Formula>(V<sub>in</sub> − V<sub>out</sub>) · D = V<sub>out</sub> · (1 − D)</Formula>
      <Formula>V<sub>out</sub> = D · V<sub>in</sub></Formula>
      <p>
        The output is just the input scaled by the duty cycle. No power is dissipated by the
        switching action itself (in the limit of an ideal switch with zero on-resistance), so the
        whole conversion is almost lossless<Cite id="mohan-undeland-robbins-2003" in={SOURCES} />.
        Modern synchronous bucks routinely hit <strong>92–98 % efficiency</strong> — an order of
        magnitude better than a linear regulator at the same step-down ratio.
      </p>

      <BuckConverterDemo />

      <TryIt
        tag="Try 19.3"
        question={
          <>
            A buck converter takes <strong>12 V</strong> in and runs at <strong>50 %</strong> duty cycle. What
            is the output voltage in steady state, assuming ideal switches and inductors?
          </>
        }
        hint={<>V<sub>out</sub> = D · V<sub>in</sub>.</>}
        answer={
          <>
            <Formula>V<sub>out</sub> = 0.5 · 12 = 6.0 V</Formula>
            <p>
              <strong>6.0 V</strong>. The output is just the input multiplied by the on-fraction; the
              inductor averages the chopped switch-node waveform<Cite id="erickson-maksimovic-2020" in={SOURCES} />.
            </p>
          </>
        }
      />

      <p>
        Flip the topology around and the same physics gives you a{' '}
        <Term def={<><strong>boost converter</strong> — a step-up DC-DC topology: inductor on the input side, switch to ground, output diode, output capacitor. <em>V<sub>out</sub> = V<sub>in</sub> / (1 − D)</em>.</>}>boost converter</Term>:
        the switch shorts the inductor to ground for time t<sub>on</sub>, building up current;
        when the switch opens, the inductor's stored energy is forced into the output capacitor
        through a diode. Volt-second balance now gives <strong>V<sub>out</sub> = V<sub>in</sub> / (1 − D)</strong>,
        which can be made arbitrarily large in principle (though parasitic resistance kills you
        at very high duty cycles)<Cite id="erickson-maksimovic-2020" in={SOURCES} />. The boost is
        why a 3.7 V Li-ion cell can power a 60 V LED string in your camera flash.
      </p>

      <TryIt
        tag="Try 19.4"
        question={
          <>
            A boost converter runs at <strong>75 %</strong> duty cycle from a <strong>12 V</strong> input.
            What is the ideal output voltage?
          </>
        }
        hint={<>V<sub>out</sub> = V<sub>in</sub> / (1 − D).</>}
        answer={
          <>
            <Formula>V<sub>out</sub> = 12 / (1 − 0.75) = 48 V</Formula>
            <p>
              <strong>48 V</strong>, an exact 4× step-up. Push D toward 1 and the equation blows up;
              real boost converters cap out at D ≈ 0.85 once switch and diode losses
              dominate<Cite id="erickson-maksimovic-2020" in={SOURCES} />.
            </p>
          </>
        }
      />

      <BoostConverterDemo />

      <TryIt
        tag="Try 19.6"
        question={
          <>
            A buck converter takes <strong>V<sub>in</sub> = 24 V</strong> at duty cycle <strong>D = 0.3</strong>.
            What is the ideal output voltage? If the load draws <strong>5 A</strong>, what input current does
            the ideal converter pull?
          </>
        }
        hint={<>V<sub>out</sub> = D · V<sub>in</sub>; ideal power balance V<sub>in</sub> · I<sub>in</sub> = V<sub>out</sub> · I<sub>out</sub>.</>}
        answer={
          <>
            <Formula>V<sub>out</sub> = 0.3 · 24 = 7.2 V</Formula>
            <Formula>I<sub>in</sub> = V<sub>out</sub> · I<sub>out</sub> / V<sub>in</sub> = 7.2 · 5 / 24 = 1.5 A</Formula>
            <p>
              <strong>7.2 V at 1.5 A in / 5 A out</strong>. The current step-up is exactly the inverse of the
              voltage step-down — same 36 W on both sides, identical in structure to the transformer power
              balance from Ch.19. The buck is a "DC transformer" with continuously-adjustable
              ratio<Cite id="erickson-maksimovic-2020" in={SOURCES} />.
            </p>
          </>
        }
      />

      <p>
        The{' '}
        <Term def={<><strong>flyback converter</strong> — an isolated SMPS topology using a coupled inductor (transformer) as its energy store. During the switch on-time, energy accumulates in the primary's magnetic field; during the off-time, it transfers to the secondary through the rectifier. Provides galvanic isolation and arbitrary step ratio in one stage.</>}>flyback converter</Term>
        {' '}wraps a transformer around the same idea. The primary inductance stores energy
        while the switch is on; when the switch opens, the secondary winding releases that energy
        into a separate, galvanically-isolated output circuit. This is the cornerstone of every
        isolated low-power AC-DC supply — your laptop brick, your phone charger, your TV's standby
        rail — because the transformer breaks the conductive link between the lethal mains side
        and the safe-to-touch output<Cite id="mohan-undeland-robbins-2003" in={SOURCES} />.
      </p>

      <FlybackConverterDemo />

      <p>
        High-power AC chopping is the territory of one more device family. In 1956 a Bell Labs
        team (Moll, Tanenbaum, Goldey, Holonyak) published the analysis of the four-layer PNPN
        switch<Cite id="moll-tanenbaum-goldey-holonyak-1956" in={SOURCES} />; General Electric
        commercialised it as the{' '}
        <Term def={<><strong>SCR / thyristor</strong> — a four-layer p-n-p-n device that latches ON when a gate pulse fires it and stays ON until the principal current crosses zero. Designed for high voltage and current; the workhorse switch of HVDC valves, phase-controlled rectifiers, and large industrial motor drives.</>}>silicon controlled rectifier (SCR)</Term>
        {' '}in 1957 and the four-layer{' '}
        <Term def={<><strong>thyristor</strong> — the broader family of four-layer regenerative switches that includes the SCR, the gate-turn-off thyristor (GTO), and the integrated-gate commutated thyristor (IGCT). Used wherever multi-kilovolt, multi-kiloamp switching is required.</>}>thyristor</Term>
        {' '}became the workhorse of every megawatt-class converter for the next half-century.
        Today's high-power tools — the{' '}
        <Term def={<><strong>IGBT</strong> — insulated-gate bipolar transistor. A MOS-gated input drives a bipolar-output high-current device. Combines the easy drive of a MOSFET with the low conduction loss of a BJT. Standard switch in 1–3 kV traction drives and industrial inverters.</>}>IGBT</Term>
        {' '}(insulated-gate bipolar transistor) and the silicon-carbide{' '}
        <Term def={<><strong>MOSFET</strong> — metal-oxide-semiconductor field-effect transistor. Voltage-controlled four-terminal switch with gigaohm gate impedance. Modern power MOSFETs (silicon and SiC) switch tens of amps at hundreds of volts in tens of nanoseconds.</>}>MOSFET</Term>
        {' '}— extend the same picture into ranges Shockley would have called impossible.
      </p>

      <h2>DC back to AC — the <em>inverter</em></h2>

      <p>
        Run the trick backwards. Take a DC source, chop it into a square wave at line frequency,
        and you get rough AC. Chop it at a much higher frequency and modulate the duty cycle with
        a sinusoidal reference, and the average — after a small LC filter — is a clean sine
        wave. That is an{' '}
        <Term def={<><strong>inverter</strong> — a circuit that converts DC to AC. The "inverse" of a rectifier. Implemented as an H-bridge of MOSFETs or IGBTs switched by sinusoidal pulse-width modulation, followed by an LC filter.</>}>inverter</Term>:
        the inverse of a rectifier, the device on the side of every solar installation, every
        uninterruptible-power supply, every variable-frequency motor drive, every electric
        vehicle's traction system.
      </p>
      <p>
        The standard topology is the{' '}
        <Term def={<><strong>H-bridge</strong> — four switches (MOSFETs or IGBTs) arranged in two legs across a DC bus, with the load connected between the leg midpoints. Driving the four switches in complementary pairs lets you apply +V<sub>DC</sub>, −V<sub>DC</sub>, or zero across the load — the basic building block of every single-phase inverter and every brushed-DC drive.</>}>H-bridge</Term>:
        four switches, two per leg, across a DC bus, with the load wired between the two midpoints.
        Close S1 and S4 and the load sees +V<sub>DC</sub>. Close S2 and S3 and it sees
        −V<sub>DC</sub>. Switch between the two states fast, with a duty cycle modulated by a sine
        reference, and you produce{' '}
        <Term def={<><strong>PWM (pulse-width modulation)</strong> — encoding an analog control signal as the duty cycle of a high-frequency square wave. After low-pass filtering, the average reconstructs the control signal. Standard control technique for motor drives, inverters, class-D audio, and switching regulators.</>}>sinusoidal PWM</Term>
        {' '}— a stream of pulses whose moving average traces a sine
        wave<Cite id="mohan-undeland-robbins-2003" in={SOURCES} />.
      </p>
      <p>
        After LC filtering, the output is a sinusoid of peak{' '}
        <strong>m · V<sub>DC</sub></strong>, where m ∈ [0, 1] is the modulation index. Setting
        the reference frequency to 60 Hz gives you grid-compatible AC; setting it to a variable
        rate gives you a motor drive. The hard part is mostly in software: the firmware must
        compute the PWM duty cycle in real time, dead-band the two switches in each leg so they
        never short the bus, and current-limit the output during faults.
      </p>

      <HBridgeInverterDemo />

      <PWMInverterOutputDemo />

      <p>
        The two sliders in the spectrum view tell the engineering story. Raise the carrier frequency and
        the harmonic cluster slides rightward — further from the 60 Hz fundamental — so the LC output
        filter that has to attenuate it can be smaller and lighter for the same residual ripple. Drop the
        modulation index and the fundamental shrinks proportionally while the carrier sidelobes barely
        move; the inverter is now producing the same waveform shape at a lower output amplitude. Modern
        SiC and GaN inverters push f<sub>sw</sub> up by an order of magnitude over the IGBT generation
        precisely for this reason — every kilogram of output choke saved is a kilogram off an EV's
        weight<Cite id="erickson-maksimovic-2020" in={SOURCES} />.
      </p>

      <TryIt
        tag="Try 19.5"
        question={
          <>
            An H-bridge inverter delivers a <strong>100 V peak</strong>, 60 Hz sine across a pure
            inductive load of <strong>1 mH</strong>. What is the peak current?
          </>
        }
        hint={<>For an inductor, V = L dI/dt; for sinusoidal steady state, |I| = V/(ωL).</>}
        answer={
          <>
            <Formula>ω = 2π · 60 ≈ 377 rad/s</Formula>
            <Formula>X<sub>L</sub> = ωL = 377 · 10⁻³ = 0.377 Ω</Formula>
            <Formula>I<sub>peak</sub> = 100 / 0.377 ≈ 265 A</Formula>
            <p>
              About <strong>265 A peak</strong> — large, because a 1 mH choke at 60 Hz is essentially
              a short circuit. That is why inverter output filters never use bare inductances
              that small without a current-limiting resistor or series capacitor in the
              filter<Cite id="erickson-maksimovic-2020" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2>Grid-tie inverters and <em>HVDC</em></h2>

      <p>
        A standalone inverter (a UPS, say) drives its own load and sets its own voltage. A
        grid-tie inverter is in a different game: the grid is already there, already at 240 V
        and 60 Hz, and the inverter has to push current onto a stiff voltage source it does not
        control. That makes the inverter into a controlled-current device, not a controlled-voltage
        one — its job is to inject a sinusoidal current whose amplitude is set by the available
        DC power (from the panels or the battery) and whose phase is set by the firmware.
      </p>
      <p>
        Multiply V<sub>grid</sub>(t) by I<sub>inj</sub>(t) and average over a cycle and you get
        two terms: a real-power term proportional to <strong>cos(θ)</strong> and a
        reactive-power term proportional to <strong>sin(θ)</strong>, where θ is the phase shift
        between the injected current and the grid voltage. Inject current in phase (θ = 0) and
        you deliver pure real power to the grid; inject it 90° lagging and you deliver pure
        reactive power; somewhere in between you do both<Cite id="mohan-undeland-robbins-2003" in={SOURCES} />.
        Modern grid-tie inverters can be commanded to mix the two, supporting grid voltage during
        sags or absorbing it during over-voltage events — the "smart inverter" functionality
        required by IEEE 1547-2018.
      </p>

      <GridTieInverterDemo />

      <p>
        Two non-obvious requirements come bundled with grid-tie operation. The first is{' '}
        <Term def={<><strong>anti-islanding</strong> — the requirement that a grid-tie inverter must rapidly detect an outage of the local grid feed and disconnect within ~2 seconds, so that line workers downstream are not exposed to power from rooftop solar. Detection is typically active (small disturbance probes) plus passive (over/under frequency and voltage).</>}>anti-islanding</Term>:
        if the utility's grid feed goes dead (a tree on a wire, a transformer failure), the
        inverter must detect the outage and stop pushing current within about two seconds, so
        that line workers downstream are not electrocuted by power from your roof. The detection
        is harder than it sounds — a small island of solar inverters tied to a balanced local
        load can run for several seconds before any voltage or frequency excursion gives the
        outage away — so every grid-tie inverter ships with active disturbance probes that
        deliberately push the local frequency slightly until it either pulls back (grid present)
        or runs away (grid absent)<Cite id="mohan-undeland-robbins-2003" in={SOURCES} />.
      </p>
      <p>
        The second is{' '}
        <Term def={<><strong>phase-locked loop (PLL)</strong> — a control loop that estimates the phase and frequency of the grid voltage in real time and produces a synchronised reference for the inverter's PWM. Without it the inverter cannot know when to fire the next current pulse.</>}>phase synchronisation</Term>:
        the inverter must know, at every microsecond, exactly where it is on the grid's 60 Hz
        sine wave. A phase-locked loop (PLL) tracks the grid voltage's zero-crossings and
        produces a continuously-updated phase reference; the PWM firmware uses that reference to
        time every switching pulse. Lose lock and the injected current goes out of phase, real
        power swings wildly, and the inverter trips.
      </p>
      <p>
        At the very top of the power scale, the same physics shows up as{' '}
        <Term def={<><strong>HVDC</strong> — high-voltage direct-current transmission. A converter station at each end of a long DC link converts AC to DC (rectifier) or DC to AC (inverter) using line-commutated thyristor valves (older) or voltage-source-converter IGBTs (newer). Lower line losses than AC over long distances; allows two non-synchronous grids to be linked.</>}>HVDC</Term>
        {' '}(high-voltage direct current). For very long lines, the reactive losses of AC
        transmission (charging current of the line capacitance) eventually dominate; converting
        to DC at one end, sending DC, and converting back to AC at the other end becomes
        cheaper. The Pacific DC Intertie runs from Celilo, Oregon to Sylmar, near Los Angeles —
        <strong> 846 miles at ±500 kV</strong>, carrying up to 3.1 GW, with converter halls full
        of stacked thyristors at each end<Cite id="kundur-1994-power-stability" in={SOURCES} />.
        The principle is the same as the laptop brick: rectify on one side, invert on the
        other. Only the silicon is bigger.
      </p>

      <h2>What we have so far</h2>
      <p>
        Every diode is a one-way valve. Four of them in a bridge, plus a capacitor, give you
        cheap pulsating DC. A linear regulator turns that into clean DC by burning the excess as
        heat; a switch-mode regulator does the same job by chopping at high frequency and using
        an inductor's volt-second balance. Run the chopping backwards, with sinusoidal PWM, and
        you get an inverter — DC into AC, lossless in principle and 95% efficient in practice.
        Synchronise the inverter to a stiff grid voltage and you can push real or reactive power
        onto the line. Bigger silicon — thyristors, IGBTs — and you can do the same trick at
        gigawatt scale across half a continent. The physics is the diode equation; the engineering
        is everything else<Cite id="mohan-undeland-robbins-2003" in={SOURCES} /><Cite id="erickson-maksimovic-2020" in={SOURCES} />.
      </p>

      <Pullout>
        Every box that takes power from one form and gives it back as another — phone charger,
        EV inverter, HVDC valve hall — is the same physics with different silicon.
      </Pullout>

      <CaseStudies intro="Four working systems where this chapter's physics is the entire architecture.">
        <CaseStudy
          tag="Case 19.1"
          title="The brick on your laptop cord"
          summary={<>A 100-watt flyback running at 100 kHz, primary PFC, secondary rectifier, USB-PD controller — the densest circuit you carry around.</>}
          specs={[
            { label: 'Mains input', value: <>120 V<sub>rms</sub> / 60 Hz or 230 V<sub>rms</sub> / 50 Hz</> },
            { label: 'DC output', value: '20 V × 5 A (100 W) via USB-PD' },
            { label: 'Switching frequency', value: '65 – 130 kHz (flyback)' },
            { label: 'Conversion efficiency', value: '~92 % typical' },
            { label: 'Isolation', value: '4 kV transformer barrier' },
            { label: 'Holdup capacitor', value: '~100 µF / 400 V electrolytic' },
          ]}
        >
          <p>
            Pop the case and you see four distinct stages. First, a bridge rectifier on the line
            input plus a bulk electrolytic capacitor stores rough DC at roughly 170 V (peak of 120 V
            rms) or 325 V (peak of 230 V rms). Second, a{' '}
            <Term def={<><strong>power-factor correction (PFC)</strong> — a pre-regulator that forces the input current of an AC-DC supply to track the input voltage sinusoidally, presenting a near-resistive load to the line. Required by IEC 61000-3-2 for supplies above 75 W.</>}>PFC pre-regulator</Term>
            {' '}— typically a boost converter — shapes the input current to be sinusoidal in
            phase with the line voltage, instead of the spiky pulses a bare bridge-and-cap front
            end would draw. Without PFC, large numbers of supplies on one circuit would distort
            the line and overload the neutral<Cite id="mohan-undeland-robbins-2003" in={SOURCES} />.
          </p>
          <p>
            Third, the flyback. A primary-side MOSFET switches at 65–130 kHz across the primary
            of a small ferrite-core transformer, storing energy in its primary inductance and
            transferring it to the secondary through a Schottky output rectifier each cycle.
            Fourth, the USB-PD controller — a small microcontroller that talks to whatever device
            you plugged in, negotiates the output voltage (5 V, 9 V, 15 V, 20 V, or higher), and
            commands the flyback's feedback loop to track that
            setpoint<Cite id="erickson-maksimovic-2020" in={SOURCES} />.
          </p>
          <p>
            The same brick contains four diode rectifiers, two switching converters, a transformer,
            two microcontrollers, an opto-isolator straddling the safety barrier, and ten or more
            ceramic capacitors carefully rated to survive line surges. Sixty years of silicon
            evolution let it weigh two hundred grams; in 1965 it would have weighed five kilos and
            run at 50% efficiency<Cite id="horowitz-hill-2015" in={SOURCES} />.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 19.2"
          title="The Tesla Model S traction inverter"
          summary={<>A 3-phase IGBT bridge between a 375 V battery pack and a 320 kW induction motor — and a regenerative brake too.</>}
          specs={[
            { label: 'DC bus voltage', value: '~375 V (85 kWh pack)' },
            { label: 'Peak motor power', value: '~320 kW' },
            { label: 'Switching device', value: 'IGBT, ~15 kHz PWM' },
            { label: 'Motor type', value: '3-phase induction, copper rotor' },
            { label: 'Regen braking', value: 'Up to ~60 kW into pack' },
            { label: 'Topology', value: '3-phase 6-IGBT bridge' },
          ]}
        >
          <p>
            The Tesla traction inverter is a three-phase H-bridge with two extra legs — six IGBTs
            instead of four. The DC bus comes from the lithium-ion battery pack at roughly 375 V;
            the three output midpoints drive the three windings of an induction motor 120° apart
            in phase. The firmware computes the right sinusoidal PWM at the right frequency
            (variable, from 0 Hz at standstill up to several hundred Hz at top speed) to make the
            motor's rotating magnetic field produce the commanded
            torque<Cite id="mohan-undeland-robbins-2003" in={SOURCES} />.
          </p>
          <p>
            The clever part is that the same six switches run in reverse during regenerative
            braking. With the motor spinning and the inverter commanding a voltage slightly less
            than the back-EMF, current flows from the motor into the DC bus — through the IGBTs'
            anti-parallel diodes — and recharges the battery. The "rectifier" half of this chapter
            and the "inverter" half are not two different circuits; they are the same six
            switches operated under different firmware. About <strong>~60 kW</strong> of recovered
            kinetic energy goes back into the pack during a hard deceleration on a Model S, and
            roughly 30% of urban driving energy is recovered this
            way<Cite id="erickson-maksimovic-2020" in={SOURCES} />.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 19.3"
          title="A 5 kW residential solar string inverter"
          summary={<>Roof-mounted panels at 400 V DC, an H-bridge, an LC filter, a phase-locked loop, and the legal duty to disappear if the grid goes dark.</>}
          specs={[
            { label: 'DC input (MPPT)', value: '150 – 500 V from panel string' },
            { label: 'AC output', value: '240 V × ~20.8 A = 5 kW' },
            { label: 'Switching frequency', value: '16 – 20 kHz' },
            { label: 'Peak efficiency', value: '~97 %' },
            { label: 'Anti-islanding', value: '< 2 s disconnect (IEEE 1547)' },
            { label: 'Compliance', value: 'IEEE 1547-2018, UL 1741-SA' },
          ]}
        >
          <p>
            A string inverter sits between a series-parallel matrix of photovoltaic panels and the
            240 V utility service. Three control loops run continuously. The first is{' '}
            <Term def={<><strong>maximum power point tracking (MPPT)</strong> — a control loop that perturbs the DC input voltage of a PV array and measures the change in power, climbing the I–V curve to the point of maximum extracted power. Re-runs continuously because the optimum drifts with temperature and illumination.</>}>MPPT</Term>
            : the inverter perturbs the input voltage, measures the resulting change in extracted
            power, and climbs the panel's I–V curve to the maximum-power point. The second is a
            phase-locked loop that tracks the grid's 60 Hz phase. The third is the actual current
            controller that drives the H-bridge's PWM to push the commanded amount of in-phase
            (real) current onto the line<Cite id="mohan-undeland-robbins-2003" in={SOURCES} />.
          </p>
          <p>
            The legal-and-safety layer is anti-islanding. If the local utility feed goes dead
            (someone hits a pole; a transformer blows), the inverter must detect that within ~2
            seconds and stop injecting current — otherwise rooftop solar would silently energise
            the dead line and electrocute line workers. Detection uses passive over/under
            frequency and voltage windows, plus active "Sandia" frequency-shift probes that
            deliberately destabilise the local frequency if the grid is not strong enough to pull
            it back<Cite id="mohan-undeland-robbins-2003" in={SOURCES} />.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 19.4"
          title="The Pacific DC Intertie"
          summary={<>The longest HVDC link in the western United States: 846 miles, ±500 kV, 3.1 GW, four converter halls full of thyristors.</>}
          specs={[
            { label: 'Length', value: '846 miles (1361 km)' },
            { label: 'DC voltage', value: '±500 kV bipolar' },
            { label: 'Capacity', value: '3,100 MW (post-upgrade)' },
            { label: 'Converter technology', value: 'Line-commutated thyristor valves' },
            { label: 'Endpoints', value: 'Celilo, OR ↔ Sylmar, near Los Angeles' },
            { label: 'In service since', value: '1970' },
          ]}
        >
          <p>
            The Pacific DC Intertie is a point-to-point HVDC link sending up to 3.1 GW of
            hydropower from the Columbia River south to the Los Angeles basin. At each end sits a
            converter station: stacks of thyristor "valves" — series-parallel arrays of SCRs that
            block half a megavolt and pass several thousand amps. On the Celilo end, the station
            rectifies the local AC into ±500 kV DC; at the Sylmar end, the same physics in
            reverse inverts it back to 60 Hz AC for the Los Angeles
            grid<Cite id="kundur-1994-power-stability" in={SOURCES} />.
          </p>
          <p>
            HVDC pays off at very long distances because an AC line's distributed capacitance
            draws "charging current" along its whole length — current that delivers no real power
            but heats the conductors. DC has no reactive component, so it can run closer to its
            thermal limit. HVDC also lets two non-synchronous grids be tied together (the
            Western Interconnection and Baja California, in this case, although both happen to run
            at 60 Hz here)<Cite id="kundur-1994-power-stability" in={SOURCES} />. Modern HVDC links
            increasingly use voltage-source IGBT converters instead of thyristor valves; the
            silicon is different but the topology is the same six-switch H-bridge as the laptop
            charger, scaled by six orders of magnitude.
          </p>
        </CaseStudy>
      </CaseStudies>

      <FAQ intro="The questions a careful reader asks after looking at the back of any power supply.">
        <FAQItem q="Why does my laptop charger get warm even when nothing's plugged in?">
          <p>
            Two reasons. First, the bulk capacitor on the line side is constantly being topped up
            from the grid through the input bridge, and that current has to come through some
            small standing losses in the bridge and the PFC stage. Second, the switching
            controller IC is running its housekeeping loop even when no output current is drawn,
            which costs a few hundred milliwatts. Modern Energy Star supplies trim this "no-load"
            power below 0.1 W by entering a burst-mode where the switcher only fires once every
            few milliseconds<Cite id="erickson-maksimovic-2020" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why use a bridge of four diodes instead of just one?">
          <p>
            One diode (half-wave rectifier) throws away the negative half of every cycle. The
            output averages only V<sub>p</sub>/π ≈ 0.318 V<sub>p</sub>, the ripple frequency is
            the same as the line (60 Hz, harder to filter), and the transformer secondary
            carries DC bias which can saturate its core. A bridge uses both halves, doubles the
            DC output to 2V<sub>p</sub>/π ≈ 0.636 V<sub>p</sub>, doubles the ripple frequency to
            120 Hz (easier to filter), and presents a balanced load to the
            transformer<Cite id="mohan-undeland-robbins-2003" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="How is my modern switching brick so much smaller than the wall-warts I had in the 1990s?">
          <p>
            The old wall-wart used a 60 Hz iron-core transformer to step the mains down to a few
            volts AC, then a bridge rectifier and a linear regulator. Transformer core volume
            scales roughly as 1/f for a given power handling. Switching at 100 kHz instead of 60 Hz
            shrinks the magnetic core by more than three orders of magnitude, and the rest of
            the supply — input bridge, output rectifier, control IC — is comparatively
            tiny<Cite id="erickson-maksimovic-2020" in={SOURCES} />. Same job, a thousandth of the iron.
          </p>
        </FAQItem>

        <FAQItem q="What is 'power-factor correction' and why do they put it in chargers above 75 W?">
          <p>
            A bare bridge-rectifier-plus-capacitor draws current from the line only at the top of
            each line cycle — narrow spikes of current near the voltage peaks. The fundamental of
            that current is large, but it is heavily distorted, and the apparent power (V × I)
            is well above the real power. PFC is a pre-regulator (usually a boost converter) that
            forces the input current to track the line voltage sinusoidally, making the supply
            look like a near-resistive load. Above 75 W, IEC 61000-3-2 requires it; below, it's
            optional<Cite id="mohan-undeland-robbins-2003" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why does my UPS sometimes produce a 'modified sine wave' instead of a real sine?">
          <p>
            Cheap UPSes use a simpler inverter that outputs three voltage levels (+V<sub>DC</sub>,
            0, −V<sub>DC</sub>) in a stepped quasi-square waveform, sized to match the RMS of a
            real sine but with hideous harmonic content. It's cheaper because no filter and no
            high-frequency PWM are required. Resistive loads (lamps, heaters) don't care; motor
            loads heat up because the harmonics dump extra current into the windings; switch-mode
            supplies usually cope but with extra input-current spikes; some sensitive electronics
            refuse to recognise it as AC at all<Cite id="mohan-undeland-robbins-2003" in={SOURCES} />.
            "Pure sine wave" UPSes use full sinusoidal PWM and cost two-to-three times more.
          </p>
        </FAQItem>

        <FAQItem q="Why does my solar inverter have to disconnect during a grid outage?">
          <p>
            Anti-islanding. If the utility feed drops (a tree on a wire, a transformer fault) and
            your inverter kept pushing 240 V onto the local wires, a line worker repairing the
            outage downstream would assume the line is dead, touch it, and be electrocuted.
            IEEE 1547 requires every grid-tie inverter to detect the absence of the utility within
            ~2 seconds and stop injecting current. The detection mixes passive (voltage/frequency
            window) and active (small frequency-shift probes) methods because a balanced local
            island can hide passive faults for surprisingly long<Cite id="mohan-undeland-robbins-2003" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="How does a grid-tie inverter sync to the grid before it closes the contactor?">
          <p>
            A phase-locked loop tracks the grid voltage's zero crossings and produces a
            continuously-updated reference for the inverter's PWM. Before the inverter's output
            contactor closes, the firmware checks that the grid voltage and the inverter's
            internal reference are within tight bounds on frequency (~0.5 Hz), phase (~10°), and
            magnitude (~5 %)<Cite id="mohan-undeland-robbins-2003" in={SOURCES} />. Closing with
            larger errors would dump a transient current proportional to the mismatch into the
            inverter's output inductors — exactly the same physics as synchronising a rotating
            generator to the grid (Ch.17).
          </p>
        </FAQItem>

        <FAQItem q="Why is HVDC preferred over HVAC for very long transmission lines?">
          <p>
            An AC line has distributed capacitance along its length, which draws a 90°-leading
            charging current independent of the load. Past a few hundred kilometres, that charging
            current is comparable to the line's thermal rating; you can't deliver any real power
            because the conductors are already full of reactive current. A DC line has no
            charging current. Above ~600 km overhead or ~50 km submarine, HVDC becomes the
            cheaper option<Cite id="kundur-1994-power-stability" in={SOURCES} />. The price you
            pay is the converter station at each end — a substantial building full of thyristor
            or IGBT valves.
          </p>
        </FAQItem>

        <FAQItem q="What's the difference between a rectifier and a diode?">
          <p>
            A diode is a component — a single semiconductor junction (or four, for a bridge) — that
            conducts in one direction. A rectifier is a circuit that uses one or more diodes to
            turn AC into pulsating DC. Every rectifier contains diodes; not every diode is in a
            rectifier (signal diodes do logic, Zeners regulate, photodiodes detect light, LEDs
            radiate). The language is loose: a "diode rectifier" usually means the whole
            assembly, while "rectifier diode" usually means a single high-current
            part<Cite id="horowitz-hill-2015" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why are Schottky diodes used as the output rectifier in switching supplies?">
          <p>
            Two reasons. First, V<sub>F</sub> ≈ 0.3 V vs ≈ 0.7 V for a p-n diode — a substantial
            efficiency win for low-voltage output rails (a 5 V supply gives back 8% of its losses
            just by switching). Second, Schottkies are majority-carrier devices, with no slow
            minority-carrier-storage tail; they recover from forward conduction in picoseconds
            instead of the tens of nanoseconds a fast-recovery p-n diode needs. At 100 kHz
            switching, that tail would otherwise be a substantial chunk of every
            cycle<Cite id="horowitz-hill-2015" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why does my LED bulb sometimes flicker on a dimmer?">
          <p>
            Most household dimmers are{' '}
            <strong>phase-controlled triacs</strong> (the AC version of an SCR): they conduct only
            during a programmed fraction of each half-cycle. An incandescent bulb's filament is
            slow enough to average the chopped waveform into smooth light. An LED bulb has a
            switching power supply inside; if the dimmer's chopping confuses the supply's
            controller — or chops so late in the cycle that the supply's hold-up cap can't keep up
            — you get flicker or buzz<Cite id="horowitz-hill-2015" in={SOURCES} />. "Dimmable" LED
            bulbs include extra firmware to deal with this.
          </p>
        </FAQItem>

        <FAQItem q="Can I run my desk fan from a car battery?">
          <p>
            Only with an inverter. A 12 V car battery is DC; a desk fan with an AC motor (most
            cheap ones) expects 120 V or 230 V rms AC at line frequency. A small inverter — an
            H-bridge of MOSFETs with sinusoidal PWM and a small LC filter — takes 12 V DC in and
            produces ~120 V AC out at typically 80–90 % efficiency<Cite id="mohan-undeland-robbins-2003" in={SOURCES} />.
            A DC brushless desk fan, by contrast, accepts 12 V DC directly because its
            commutation electronics already chop the DC into rotating-stator drive currents — no
            inverter needed.
          </p>
        </FAQItem>

        <FAQItem q="What does 'soft-switching' mean and why does it matter?">
          <p>
            Hard-switching means the MOSFET turns on while there is still voltage across it and
            current through it — that overlap is dissipated as a switching loss every cycle.
            Soft-switching arranges the surrounding L and C so that the switch turns on at
            <em> zero voltage</em> (ZVS) or off at <em>zero current</em> (ZCS), driving the overlap
            loss toward zero and letting the converter run faster without melting. Resonant LLC
            converters and phase-shift full-bridges are the canonical examples; they are why USB-PD
            bricks above ~65 W can hit 95% efficiency at 100+ kHz without
            fans<Cite id="erickson-maksimovic-2020" in={SOURCES} />.
          </p>
        </FAQItem>
      </FAQ>
    </ChapterShell>
  );
}
