/**
 * Chapter 3 — Resistance and power
 *
 * The macroscopic story of friction in a wire and the heat it produces.
 * Five embedded demos:
 *   3.1 Length vs. resistance — R linear in L
 *   3.2 Area vs. resistance — R inverse in A
 *   3.3 Material picker — σ ranges over orders of magnitude
 *   3.4 Joule heating — P = I²R, equilibrium T from Stefan–Boltzmann
 *   3.5 Series vs. parallel — R_series and R_parallel
 *
 * Every numerical or historical claim cites a key from chapter.sources.
 */
import { CaseStudies, CaseStudy } from '@/components/CaseStudy';
import { ChapterShell } from '@/components/ChapterShell';
import { FAQ, FAQItem } from '@/components/FAQ';
import { Cite } from '@/components/SourcesList';
import { Formula, InlineMath } from '@/components/Formula';
import { Pullout } from '@/components/Prose';
import { Term } from '@/components/Term';
import { TryIt } from '@/components/TryIt';
import { AreaVsResistanceDemo } from './demos/AreaVsResistance';
import { DriftInCopper3DDemo } from './demos/DriftInCopper3D';
import { JouleHeatingDemo } from './demos/JouleHeating';
import { LengthVsResistanceDemo } from './demos/LengthVsResistance';
import { MaterialPickerDemo } from './demos/MaterialPicker';
import { MicroscopicOhm3DDemo } from './demos/MicroscopicOhm3D';
import { OhmsLawTwoViewsDemo } from './demos/OhmsLawTwoViews';
import { SeriesParallelMixDemo } from './demos/SeriesParallelMix';
import { SeriesVsParallelDemo } from './demos/SeriesVsParallel';
import { WireVoltageDropDemo } from './demos/WireVoltageDrop';
import { getChapter } from './data/chapters';

export default function Ch3ResistanceAndPower() {
  const chapter = getChapter('resistance-and-power')!;
  const SOURCES = chapter.sources;

  return (
    <ChapterShell chapter={chapter}>
      <p className="chapter-intro">
        Run a finger along an old incandescent bulb that's been on for a minute and you'll snatch it
        back. The glass is hot. The filament inside is closer to <InlineMath tex="2800\ \text{K}" />{' '}
        <Cite id="coaton-marsden-1997" in={SOURCES} /> — hot enough that a sliver of its blackbody
        spectrum spills into the visible and the bulb does what it was built to do. Where did all
        that heat come from? Not from the wall, not directly. It came from the lattice of tungsten
        atoms inside the filament absorbing the kinetic energy of electrons that the electric field
        had been accelerating between collisions.{' '}
        <Term
          def={
            <>
              <strong className="text-text font-medium">Resistance</strong> — the proportionality
              between voltage drop and current in a conductor, <InlineMath id="ohms-law" />. SI
              unit: ohm (Ω = V/A). Encodes both geometry and material.
            </>
          }
        >
          <strong className="text-text font-medium">Resistance</strong>
        </Term>{' '}
        is the macroscopic name for that lossy hand-off, and{' '}
        <Term
          def={
            <>
              <strong className="text-text font-medium">power</strong> — the rate at which energy is
              transferred or converted, <InlineMath tex="P = dE/dt" />. SI unit: watt (W = J/s). For
              a resistor, <InlineMath tex="P = VI = I^2 R = V^2/R" />.
            </>
          }
        >
          <strong className="text-text font-medium">power</strong>
        </Term>{' '}
        is the rate at which it happens.
      </p>
      <p className="mb-prose-3">
        This chapter is about the friction. Why a long wire resists more than a short one, why a
        thin wire resists more than a fat one, why some metals resist about as well as a soap bubble
        resists wind and others were specifically engineered to burn red at line voltage. The whole
        macroscopic story falls out of one microscopic picture — the Drude model from Chapter 2 —
        and one geometric integral.
      </p>

      <h2 className="chapter-h2">
        What <em>resistance</em> is
      </h2>

      <p className="mb-prose-3">
        The microscopic{' '}
        <Term
          def={
            <>
              <strong className="text-text font-medium">Ohm's law</strong> — the empirical linear
              relation between current and voltage in an ordinary conductor:{' '}
              <InlineMath id="ohms-law" /> (macroscopic) or{' '}
              <InlineMath tex="\vec{J} = \sigma\vec{E}" /> (microscopic). Holds for metals at
              ordinary fields; fails for diodes, plasmas, etc.
            </>
          }
        >
          Ohm's law
        </Term>{' '}
        from the previous chapter said that inside a conductor, current density is proportional to
        the electric field driving it:
      </p>
      <Formula size="lg" tex="\vec{J} = \sigma\vec{E}" />
      <p className="mb-prose-3">
        where <InlineMath tex="J" /> is the current density vector
        (current per unit cross-sectional area, in A/m²),
        <InlineMath tex="E" /> is the local electric field driving
        the carriers (in V/m), and <InlineMath tex="\sigma" /> is the{' '}
        <Term
          def={
            <>
              <strong className="text-text font-medium">conductivity</strong> (σ) — a material
              property relating current density to applied field,{' '}
              <InlineMath tex="\vec{J} = \sigma\vec{E}" />. SI unit: S/m. Reciprocal of resistivity
              ρ. Copper ≈ 5.96×10⁷ S/m.
            </>
          }
        >
          conductivity
        </Term>
        , a property of the material. Drude's 1900 free-electron picture gave a mechanical
        explanation
        <Cite id="drude-1900" in={SOURCES} />: an electron accelerates under{' '}
        <InlineMath tex="E" /> for an average time{' '}
        <InlineMath tex="\tau" /> between collisions with ions in the
        lattice, picks up a small drift velocity, then scatters and starts over. Average it out and
        you get a steady drift proportional to <InlineMath tex="\vec{E}" /> — friction with a clean
        linear law. Modern solid-state physics rewrote the inputs in quantum terms, but the linear
        relation between field and current density survives intact for ordinary metals at ordinary
        fields
        <Cite id="ashcroft-mermin-1976" in={SOURCES} />.
      </p>

      <MicroscopicOhm3DDemo />

      <p className="mb-prose-3">
        The picture above is what <InlineMath tex="\vec{J} = \sigma\vec{E}" /> looks like inside the
        wire. The orange arrow is the applied field; the pink arrow is the current density that the
        field drives, parallel to <InlineMath tex="\vec{E}" /> and longer or shorter depending on
        the material's σ. The cyan electrons drift opposite to the field — that's the sign
        convention catching us out, because conventional current points with{' '}
        <InlineMath tex="\vec{E}" />. And the teal rings around the wire are the magnetic field{' '}
        <InlineMath tex="\vec{B}" /> that any current carries with it, perpendicular to the axis and
        curling by the right-hand rule. Swap nichrome for copper and the same{' '}
        <InlineMath tex="\vec{E}" /> produces ~65× more <InlineMath tex="\vec{J}" /> — same
        equation, different conductor.
      </p>

      <p className="mb-prose-3">
        Wrap that microscopic law up over a whole wire — a length{' '}
        <InlineMath tex="L" />, a cross-section{' '}
        <InlineMath tex="A" />, a uniform field along the axis — and
        you get the macroscopic version every electrical engineer carries around:
      </p>
      <Formula size="lg" tex="R = \dfrac{L}{\sigma A}" />
      <p className="mb-prose-3">
        where <InlineMath tex="R" /> is the wire's resistance (in ohms, Ω = V/A),{' '}
        <InlineMath tex="L" /> is the length of the wire along the current direction (in metres),{' '}
        <InlineMath tex="A" /> is the cross-sectional area (in m²), and <InlineMath tex="\sigma" />{' '}
        is the material's conductivity (in S/m = (Ω·m)⁻¹). The macroscopic statement that pairs with
        it is Ohm's law <InlineMath tex="V = IR" /> — voltage drop end-to-end equals current times
        resistance, with <InlineMath tex="V" /> in volts and <InlineMath tex="I" /> in amperes.{' '}
        <em className="text-text italic">Resistance</em> is the global lump that bundles up
        everything the local conductivity does to charges as they cross the wire. It depends on the
        material (through σ) and it depends on the geometry (through L and A), and that combination
        is the entire content of the rest of the chapter
        <Cite id="griffiths-2017" in={SOURCES} />.
      </p>
      <Formula size="lg" tex="V = IR" />
      <p className="mb-prose-3">
        where <InlineMath tex="V" /> is the potential difference across the resistor (in volts),{' '}
        <InlineMath tex="I" /> is the current through it (in amperes), and <InlineMath tex="R" /> is
        the resistance (in ohms). This is the operational form an engineer reaches for. Set any two
        and the third is fixed.
      </p>

      <OhmsLawTwoViewsDemo />

      <p className="mb-prose-3">
        The two panels above pull the same equation in opposite directions. On the left, the
        resistor sits at a fixed 5 Ω and you choose the current — voltage tracks linearly with slope
        equal to <InlineMath tex="R" />, the cleanest possible statement of{' '}
        <InlineMath tex="V = IR" />. On the right, the source sits at a fixed 20 V and you choose
        the resistance — current falls along the hyperbola <InlineMath tex="I = V/R" />. Same law,
        two intuitions: voltage drives the current upward, resistance restricts it downward.
      </p>

      <p className="mb-prose-3">
        The expression <InlineMath tex="V = IR" /> is a statement about endpoints — total potential
        drop equals current times total resistance. But the drop doesn't happen at the endpoints.
        Inside a uniform wire the potential falls smoothly along the length, linearly, from the
        source value at one terminal to zero at the other. Drag a probe along the wire and the
        reading walks down that linear ramp.
      </p>

      <WireVoltageDropDemo />

      <h2 className="chapter-h2">Length adds, area divides</h2>

      <p className="mb-prose-3">
        Take a uniform wire of length <InlineMath tex="L" /> and cross-section{' '}
        <InlineMath tex="A" />, with a voltage <InlineMath tex="V" /> applied end to end. The field
        inside is <InlineMath tex="E = V/L" />, uniform along the axis. The current density is then{' '}
        <InlineMath tex="J = \sigma E = \sigma V/L" />. The total current — which is just{' '}
        <InlineMath tex="J" /> integrated over the cross-section — is{' '}
        <InlineMath tex="I = JA = \sigma AV/L" />. Comparing to <InlineMath tex="V = IR" />:
      </p>
      <Formula size="lg" tex="R = \dfrac{L}{\sigma A} = \dfrac{\rho L}{A}" />
      <p className="mb-prose-3">
        where <InlineMath tex="R" /> is the resistance (in ohms), <InlineMath tex="L" /> is the
        wire's length (in metres), <InlineMath tex="A" /> is its cross-sectional area (in m²),{' '}
        <InlineMath tex="\sigma" /> is the conductivity (in S/m), and{' '}
        <InlineMath tex="\rho = 1/\sigma" /> is the{' '}
        <Term
          def={
            <>
              <strong className="text-text font-medium">resistivity</strong> (ρ) — a material's
              intrinsic resistance per unit length per unit cross-section:{' '}
              <InlineMath id="resistance-resistivity" />. SI unit: Ω·m. Reciprocal of conductivity.
              Copper ≈ 1.7×10⁻⁸ Ω·m.
            </>
          }
        >
          resistivity
        </Term>{' '}
        (in Ω·m). Two clean geometric facts fall out.{' '}
        <strong className="text-text font-medium">Twice the length, twice the resistance</strong> —
        because the field has to push each electron through twice as much lattice.{' '}
        <strong className="text-text font-medium">
          Twice the cross-section, half the resistance
        </strong>{' '}
        — because there are twice as many parallel paths for current to flow through
        <Cite id="griffiths-2017" in={SOURCES} />.
      </p>

      <LengthVsResistanceDemo />

      <p className="mb-prose-3">
        The length picture is the simpler of the two. Stretch the copper wire above and the
        resistance climbs in lockstep: from a few milliohms at 10 cm to a few tens of milliohms at
        10 m. Linearly, no surprises.
      </p>

      <AreaVsResistanceDemo />

      <p className="mb-prose-3">
        The area picture is more dramatic because cross-section spans more decades in real
        engineering. A hair-thin 0.1 mm² wire and a finger-thick 10 mm² wire — both of the same
        material, both the same length — differ in resistance by a factor of one hundred. Power-line
        conductors are deliberately huge; integrated-circuit traces are deliberately microscopic;
        the geometric R = ρL/A formula handles both extremes with the same arithmetic.
      </p>

      <TryIt
        tag="Try 3.1"
        question={
          <>
            What is the resistance of a <strong className="text-text font-medium">10 m</strong>{' '}
            length of copper wire with a <strong className="text-text font-medium">2 mm²</strong>
            cross-section, using σ<sub>Cu</sub> ≈ 5.96×10⁷ S/m?
          </>
        }
        hint={
          <>
            <InlineMath tex="R = L/(\sigma A)" />. Convert mm² to m².
          </>
        }
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">
              With <InlineMath tex="A = 2\times 10^{-6}\ \text{m}^{2}" /> and{' '}
              <InlineMath tex="\sigma_{\text{Cu}} = 5.96\times 10^{7}\ \text{S/m}" />{' '}
              <Cite id="crc-resistivity" in={SOURCES} />:
            </p>
            <Formula tex="R = \dfrac{L}{\sigma A} = \dfrac{10}{(5.96\times 10^{7})(2\times 10^{-6})} \approx 0.0839\ \Omega" />
            <p className="mb-prose-1 last:mb-0">
              Answer: about <strong className="text-text font-medium">84 mΩ</strong> — a 10 A
              current through this wire dissipates ~8 W.
            </p>
          </>
        }
      />

      <h2 className="chapter-h2">Material is destiny</h2>

      <p className="mb-prose-3">
        Geometry is half the story. The other half is the prefactor — the resistivity ρ of whatever
        the wire is made of — and across ordinary materials it spans an absurd range. The CRC
        Handbook tabulates <em className="text-text italic">twenty-three</em> orders of magnitude
        between the best room-temperature conductors and the best ordinary insulators
        <Cite id="crc-resistivity" in={SOURCES} />. Even confining ourselves to metals, the spread
        is large.
      </p>
      <Pullout>
        Conductivity is a single number that bundles up everything about how charges navigate a
        material.
      </Pullout>
      <p className="mb-prose-3">
        Silver is the king at <InlineMath tex="\sigma \approx 6.30\times 10^{7}\ \text{S/m}" />,
        with copper a hair behind at <InlineMath tex="5.96\times 10^{7}\ \text{S/m}" /> — the gap is
        small enough that copper wins on price every time
        <Cite id="crc-resistivity" in={SOURCES} />. Aluminum's conductivity is about{' '}
        <InlineMath tex="3.77\times 10^{7}\ \text{S/m}" />, only ~63% of copper's
        <Cite id="crc-resistivity" in={SOURCES} />, but aluminum is roughly a third the density of
        copper. For long-distance power lines, where the conductor's own weight is the dominant
        engineering constraint, that trade is worth making — almost every overhead transmission line
        in the world is aluminum.
      </p>
      <p className="mb-prose-3">
        Tungsten drops you to <InlineMath tex="1.79\times 10^{7}\ \text{S/m}" />, about a third as
        conductive as copper — but tungsten has the highest melting point of any metal, around{' '}
        <InlineMath tex="3700\ \text{K}" />, which is why every incandescent filament for the last
        century was made of it. Iron is worse, at <InlineMath tex="1.0\times 10^{7}\ \text{S/m}" />{' '}
        — six times worse than copper <Cite id="crc-resistivity" in={SOURCES} />. And nichrome — an
        alloy of nickel and chromium — sits at{' '}
        <InlineMath tex="\sigma \approx 9.1\times 10^{5}\ \text{S/m}" />, more than{' '}
        <em className="text-text italic">sixty times worse</em> than copper. Nichrome was engineered
        to be a bad conductor, on purpose, that stays solid and chemically passive at red heat. It
        is the material in your toaster
        <Cite id="kanthal" in={SOURCES} />.
      </p>

      <MaterialPickerDemo />

      <p className="mb-prose-3">
        At a fixed scenario — 12 V across a meter of 2.5 mm² wire — copper carries close to two
        thousand amps (a short circuit, basically), while nichrome carries about two orders of
        magnitude less for the same applied voltage. Same geometry, same volts; the material alone
        moves the current by a factor of sixty-five. Nothing else in this chapter is anywhere near
        as sensitive to a single design choice.
      </p>

      <h2 className="chapter-h2">Where the heat comes from</h2>

      <p className="mb-prose-3">
        Before chasing the heat into the lattice, do the bookkeeping. Power is the rate at which
        work is done, <InlineMath tex="P = dW/dt" />. Chapter 2 established the two pieces this
        rests on: voltage is the work done per coulomb moved through a potential difference,{' '}
        <InlineMath tex="V = dW/dq" />, and current is the coulombs moved per second,{' '}
        <InlineMath tex="I = dq/dt" />. The chain rule fuses them:
      </p>
      <Formula size="lg" tex="P = \dfrac{dW}{dt} = \dfrac{dW}{dq}\cdot\dfrac{dq}{dt} = V\cdot I" />
      <p className="mb-prose-3">
        where <InlineMath tex="P" /> is the instantaneous electrical
        power delivered to the element (in watts, W = J/s),{' '}
        <InlineMath tex="V" /> is the potential difference across it
        (V), and <InlineMath tex="I" /> is the current through it (A).
        The units confirm it: joules per coulomb times coulombs per second is joules per second{' '}
        <Cite id="griffiths-2017" in={SOURCES} />. This identity makes no assumption about what the
        element is — battery, resistor, motor, capacitor, antenna. Whenever charge moves through a
        potential difference, energy is transferred at the rate <InlineMath tex="VI" />. The rest of
        this section is about <em>where that energy goes</em> in the specific case of a resistor.
      </p>

      <p className="mb-prose-3">
        Drude's collision picture is what makes resistance dissipative rather than reactive. Between
        collisions, the field does work on a free electron — the electron picks up kinetic energy at
        the rate <InlineMath tex="\vec{F}\cdot\vec{v}" />. At the next collision (every ~2×10⁻¹⁴ s
        in copper) the electron's drift component is randomized by interaction with a lattice ion,
        and that gained kinetic energy is dumped into the lattice as a vibrational mode. The lattice
        warms. The electron starts over
        <Cite id="drude-1900" in={SOURCES} />
        <Cite id="ashcroft-mermin-1976" in={SOURCES} />.
      </p>

      <DriftInCopper3DDemo />

      <p className="mb-prose-3">
        The 3D view above puts numbers on the picture. The cyan electrons inside the copper bounce
        at{' '}
        <Term
          def={
            <>
              <strong className="text-text font-medium">Fermi velocity</strong> — the speed of
              electrons at the Fermi surface of a metal, set by quantum degeneracy rather than
              temperature. For copper, <InlineMath tex="v_F \approx 1.6\times 10^{6}\ \text{m/s}" />{' '}
              — about 0.5% of <InlineMath tex="c" />.
            </>
          }
        >
          Fermi speeds
        </Term>{' '}
        of order <InlineMath tex="10^{6}\ \text{m/s}" /> — every direction, mostly cancelling —
        while the average <em className="text-text italic">drift</em> toward +x is of order{' '}
        <InlineMath tex="10^{-4}\ \text{m/s}" /> at a few amps. The ratio{' '}
        <InlineMath tex="v_F/v_d" /> is around <InlineMath tex="10^{10}" />: a hurricane of
        quantum-degenerate motion with the faintest steady breeze threaded through it. Yet that
        breeze is the entire macroscopic current, and the energy each electron loses to the lattice
        on every collision is the entire macroscopic heat
        <Cite id="ashcroft-mermin-1976" in={SOURCES} />.
      </p>

      <p className="mb-prose-3">
        Per unit volume, the rate of energy transfer from field to lattice is the dot product{' '}
        <InlineMath tex="\vec{J}\cdot\vec{E}" />:
      </p>
      <Formula size="lg" tex="p_v = \vec{J}\cdot\vec{E} = \sigma E^2" />
      <p className="mb-prose-3">
        where <InlineMath tex="p_v" /> is the power dissipated per unit volume of conductor (in
        W/m³), <InlineMath tex="\vec{J}" /> is the current density vector (A/m²),{' '}
        <InlineMath tex="\vec{E}" /> is the local electric field (V/m), and{' '}
        <InlineMath tex="\sigma" /> the conductivity (S/m). The dot product is the rate of work done
        by the field on the drifting charges. Always positive in a resistor ({' '}
        <InlineMath tex="\vec{J}" /> and <InlineMath tex="\vec{E}" /> point the same way). Integrate
        over the wire's volume <InlineMath tex="LA" />, with <InlineMath tex="E = V/L" />{' '}
        throughout, and the macroscopic power drops out:
      </p>
      <Formula size="lg" tex="P = \dfrac{\sigma A V^2}{L} = \dfrac{V^2}{R} = VI = I^2 R" />
      <p className="mb-prose-3">
        where <InlineMath tex="P" /> is the total power dissipated by the resistor (in watts, W =
        J/s), <InlineMath tex="V" /> is the voltage across it (in volts), <InlineMath tex="I" /> is
        the current through it (in amperes), <InlineMath tex="R" /> is its resistance (in ohms), and{' '}
        <InlineMath tex="L" />, <InlineMath tex="A" />, <InlineMath tex="\sigma" /> are the
        geometric and material quantities from above. The four expressions are algebraically
        identical once <InlineMath tex="V = IR" /> is substituted. James Joule established this
        experimentally in 1841 with a calorimeter that became the namesake of the SI unit of energy
        <Cite id="joule-1841" in={SOURCES} />. The phenomenon is called{' '}
        <Term
          def={
            <>
              <strong className="text-text font-medium">Joule heating</strong> (ohmic / resistive
              heating) — the conversion of electrical energy to heat in a resistor at the rate{' '}
              <InlineMath id="power-i2r" />. The dissipated power equals the work the field does on
              charges, which scatter into lattice vibrations.
            </>
          }
        >
          Joule heating
        </Term>
        , and the SI unit of power — one joule per second — is the{' '}
        <Term
          def={
            <>
              <strong className="text-text font-medium">watt</strong> — the SI unit of power,{' '}
              <InlineMath tex="1\,\text{W} = 1\,\text{J/s}" />. Named after James Watt;{' '}
              <InlineMath id="power-vi" /> in watts when <InlineMath tex="V" /> is in volts and{' '}
              <InlineMath tex="I" /> in amperes.
            </>
          }
        >
          watt
        </Term>
        . The microscopic and macroscopic accounts agree exactly — they have to, since they describe
        the same energy flow at two zoom levels
        <Cite id="griffiths-2017" in={SOURCES} />.
      </p>

      <JouleHeatingDemo />

      <p className="mb-prose-3">
        The wire above warms from gray to dull red around{' '}
        <strong className="text-text font-medium">900 K</strong>, through cherry red and orange, and
        on to white-hot near <strong className="text-text font-medium">3000 K</strong>. The
        equilibrium temperature comes from radiation balance — Stefan–Boltzmann says a hot surface
        radiates power proportional to <InlineMath tex="T^{4}" />, so a
        wire dissipating <InlineMath tex="P" /> watts over surface area{' '}
        <InlineMath tex="A_{\text{surf}}" /> with emissivity <InlineMath tex="\varepsilon" /> sits
        at the temperature that solves{' '}
        <InlineMath tex="P = \varepsilon\sigma_{\text{SB}} A_{\text{surf}} T^4" />. Tungsten's
        hostile combination of low conductivity and very high melting point lets a thin filament
        reach incandescent T without melting; nichrome's lower σ and high oxidation resistance let a
        cherry-red coil sit in open air for years without crumbling. Same physics, different design
        points.
      </p>

      <TryIt
        tag="Try 3.2"
        question={
          <>
            A toaster element has a hot resistance of{' '}
            <strong className="text-text font-medium">6 Ω</strong> and runs on a{' '}
            <strong className="text-text font-medium">120 V</strong>
            mains line. What current does it draw, and how much power does it dissipate?
          </>
        }
        hint={
          <>
            Use <InlineMath tex="I = V/R" />, then <InlineMath tex="P = VI" /> (or{' '}
            <InlineMath tex="P = V^2/R" />
            ).
          </>
        }
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">
              Ohm's law gives the current; the power follows from <InlineMath tex="P = VI" />{' '}
              <Cite id="griffiths-2017" in={SOURCES} />:
            </p>
            <Formula tex="I = V/R = 120/6 = 20\ \text{A}" />
            <Formula tex="P = V^2/R = 120^2/6 = 2400\ \text{W}" />
            <p className="mb-prose-1 last:mb-0">
              Answer: <strong className="text-text font-medium">20 A</strong> and{' '}
              <strong className="text-text font-medium">2.4 kW</strong> — typical for a vigorous
              countertop toaster.
            </p>
          </>
        }
      />

      <TryIt
        tag="Try 3.3"
        question={
          <>
            How long would a perfectly efficient{' '}
            <strong className="text-text font-medium">1 kW</strong> kettle take to raise{' '}
            <strong className="text-text font-medium">0.5 L</strong>
            of water by <strong className="text-text font-medium">80 K</strong>? (Take{' '}
            <InlineMath tex="c_{\text{water}} = 4186\ \text{J/(kg·K)}" />
            .)
          </>
        }
        hint={
          <>
            Energy in = energy out: <InlineMath tex="P\cdot t = mc\Delta T" />. 0.5 L of water has
            mass 0.5 kg.
          </>
        }
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">Energy required:</p>
            <Formula tex="E = mc\Delta T = (0.5)(4186)(80) \approx 1.67\times 10^{5}\ \text{J}" />
            <p className="mb-prose-1 last:mb-0">Time at 1000 W:</p>
            <Formula tex="t = E/P = 1.67\times 10^{5} / 1000 \approx 167\ \text{s}" />
            <p className="mb-prose-1 last:mb-0">
              Answer: about <strong className="text-text font-medium">2 min 47 s</strong>. Real
              kettles take a bit longer because some heat leaks to the jug and steam, but this is
              the lower bound.
            </p>
          </>
        }
      />

      <h2 className="chapter-h2">Series and parallel</h2>

      <p className="mb-prose-3">
        Two resistors in a circuit can be wired two ways. Put them in{' '}
        <Term
          def={
            <>
              <strong className="text-text font-medium">series</strong> — components connected
              end-to-end so the same current flows through each; their resistances add:{' '}
              <InlineMath tex="R = R_1 + R_2 + \ldots" />
            </>
          }
        >
          <strong className="text-text font-medium">series</strong>
        </Term>{' '}
        — a single loop, everything the same current — and the voltage drops add:{' '}
        <InlineMath tex="V = IR_1 + IR_2 = I(R_1 + R_2)" />. The combined resistance is the sum:
      </p>
      <Formula size="lg" tex="R_{\text{series}} = R_1 + R_2" />
      <p className="mb-prose-3">
        where <InlineMath tex="R_{\text{series}}" /> is the equivalent resistance seen by the source
        (in ohms), and <InlineMath tex="R_1" /> and <InlineMath tex="R_2" /> are the individual
        resistances on the loop (in ohms). The same current <InlineMath tex="I" /> passes through
        both, so their voltage drops simply stack.
      </p>
      <p className="mb-prose-3">
        Put them in{' '}
        <Term
          def={
            <>
              <strong className="text-text font-medium">parallel</strong> — components connected
              across the same two nodes so each sees the same voltage; their conductances add
              (reciprocal resistances): <InlineMath tex="1/R = 1/R_1 + 1/R_2 + \ldots" />
            </>
          }
        >
          <strong className="text-text font-medium">parallel</strong>
        </Term>{' '}
        — two branches at the same voltage <InlineMath tex="V" /> — and the currents add:{' '}
        <InlineMath tex="I = V/R_1 + V/R_2 = V(1/R_1 + 1/R_2)" />, so the reciprocals combine:
      </p>
      <Formula size="lg" tex="1 / R_{\text{parallel}} = 1/R_1 + 1/R_2" />
      <p className="mb-prose-3">
        where <InlineMath tex="R_{\text{parallel}}" /> is the equivalent resistance of the two
        branches taken together (in ohms), and <InlineMath tex="R_1" />, <InlineMath tex="R_2" />{' '}
        are the individual branch resistances (in ohms). Conductances <InlineMath tex="1/R" /> (in
        siemens, S = 1/Ω) are what add. Two equal resistors in parallel give half their value; in
        general, the parallel combination is always less than either branch on its own
        <Cite id="griffiths-2017" in={SOURCES} />.
      </p>

      <SeriesVsParallelDemo />

      <p className="mb-prose-3">
        Real circuits rarely live at one extreme. A mixed network already wants both rules at once —
        a trunk in series with a parallel block, a parallel pair feeding a series load, or several
        branches running in parallel. The demo below lets you pick the topology and watch the
        voltage drops and branch currents re-balance themselves.
      </p>

      <SeriesParallelMixDemo />

      <p className="mb-prose-3">
        These rules are not arbitrary topology axioms — they are the same geometric{' '}
        <InlineMath tex="R = \rho L/A" /> from earlier in the chapter, looked at from a different
        angle. <em className="text-text italic">A long wire is many short wires in series.</em>{' '}
        Slice a wire of length <InlineMath tex="L" /> into <InlineMath tex="n" /> equal segments;
        each segment has resistance <InlineMath tex="\rho(L/n)/A" />, and adding{' '}
        <InlineMath tex="n" /> of them in series recovers <InlineMath tex="\rho L/A" /> — the
        original formula.{' '}
        <em className="text-text italic">A fat wire is many thin wires in parallel.</em> Slice a
        wire of cross-section <InlineMath tex="A" /> into <InlineMath tex="n" /> filaments of
        cross-section <InlineMath tex="A/n" />; each filament has resistance{' '}
        <InlineMath tex="\rho L/(A/n) = n\rho L/A" />, and combining <InlineMath tex="n" /> of them
        in parallel gives <InlineMath tex="\rho L/A" /> again. "Long = series" and "fat = parallel"
        both recover the geometric law by the rules in this section. The macroscopic and geometric
        pictures are the same picture.
      </p>

      <TryIt
        tag="Try 3.4"
        question={
          <>
            A <strong className="text-text font-medium">5 Ω</strong> resistor sits in series with
            the parallel combination of <strong className="text-text font-medium">10 Ω</strong> and
            <strong className="text-text font-medium"> 15 Ω</strong>. What is the total resistance
            across the network?
          </>
        }
        hint="Combine the parallel pair first, then add the series 5 Ω."
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">
              The parallel combination of 10 Ω and 15 Ω <Cite id="griffiths-2017" in={SOURCES} />:
            </p>
            <Formula tex="R_p = \dfrac{(10)(15)}{10 + 15} = \dfrac{150}{25} = 6\ \Omega" />
            <p className="mb-prose-1 last:mb-0">Adding the 5 Ω in series:</p>
            <Formula tex="R_{\text{tot}} = 5 + 6 = 11\ \Omega" />
            <p className="mb-prose-1 last:mb-0">
              Answer: <strong className="text-text font-medium">11 Ω</strong>.
            </p>
          </>
        }
      />

      <h2 className="chapter-h2">What we have so far</h2>

      <p className="mb-prose-3">
        Resistance is geometry times material. Geometry contributes a factor of{' '}
        <InlineMath tex="L/A" /> — long-and-thin resists more, short-and-fat resists less. Material
        contributes <InlineMath tex="\rho = 1/\sigma" />, ranging from copper's{' '}
        <InlineMath tex="1.7\times 10^{-8}\ \Omega\cdot\text{m}" /> up through tungsten and nichrome
        and out into the insulators. Power dissipated in a resistor is the rate at which the field
        does work on charges that immediately scatter that energy into lattice vibrations:{' '}
        <InlineMath tex="P = VI = I^2 R = V^2/R" />. Every watt of resistive dissipation is a watt
        of heat.
      </p>
      <p className="mb-prose-3">
        Chapter 4 zooms in from resistance as a physical quantity to the resistor as a physical
        component — color codes, power ratings, tolerances, and the engineering choices that go into
        actually building one. Magnetism, the rotational partner of the electrostatic field we've
        been working with so far, opens up in Chapter 6.
      </p>

      <CaseStudies
        intro={
          <>
            Three places this chapter's physics shows up in objects you use or read about every day.
            The same <InlineMath tex="P = I^2 R" /> equation gets exploited at radically different
            design points — once to make heat the product, once to suppress it as waste, and once to
            push it all the way to zero.
          </>
        }
      >
        <CaseStudy
          tag="Case 3.1"
          title="The incandescent bulb: engineered for inefficiency"
          summary="A century of indoor light by deliberately picking the worst point on the radiation curve."
          specs={[
            {
              label: 'Filament material',
              value: (
                <>
                  tungsten <Cite id="coaton-marsden-1997" in={SOURCES} />
                </>
              ),
            },
            {
              label: 'Operating temperature',
              value: (
                <>
                  ~2700–3000 K <Cite id="coaton-marsden-1997" in={SOURCES} />
                </>
              ),
            },
            {
              label: 'Tungsten conductivity',
              value: (
                <>
                  ~1.79×10<sup>7</sup> S/m at 20 °C <Cite id="crc-resistivity" in={SOURCES} />
                </>
              ),
            },
            {
              label: 'Cold-to-hot resistance ratio',
              value: (
                <>
                  ~10× <Cite id="coaton-marsden-1997" in={SOURCES} />
                </>
              ),
            },
            {
              label: 'Luminous efficacy',
              value: (
                <>
                  ~10–15 lm/W (≲ 10% radiated as visible){' '}
                  <Cite id="coaton-marsden-1997" in={SOURCES} />
                </>
              ),
            },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            An incandescent lamp is a deliberately bad conductor placed in series with an otherwise
            excellent one. Tungsten's room-temperature σ of about
            <InlineMath tex="1.79\times 10^{7}\ \text{S/m}" />
            <Cite id="crc-resistivity" in={SOURCES} /> is six times worse than copper's, and at its
            operating temperature near{' '}
            <strong className="text-text font-medium">2700–3000 K</strong>
            its resistivity climbs by another factor of about ten
            <Cite id="coaton-marsden-1997" in={SOURCES} />. That hot resistance is what limits the
            current to a few hundred milliamps, dissipating something like 60 W as Joule heat inside
            a hair-thin coil
            <Cite id="joule-1841" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            The cold-resistance ratio is also why bulbs die specifically the instant they are
            switched on. At room temperature, <InlineMath tex="R" /> is roughly a tenth of its
            operating value, so the inrush current is roughly ten times the steady-state operating
            current until the filament heats up
            <Cite id="coaton-marsden-1997" in={SOURCES} />. The already-thinnest spot melts a hair
            sooner than the rest of the coil, and the lamp opens.
          </p>
          <p className="mb-prose-2 last:mb-0">
            The bulb's central design irony is that it works by being terrible. Stefan–Boltzmann
            radiation goes as <em className="text-text italic">T⁴</em>, but the fraction of that
            radiation falling in the visible band is small at any temperature a metal can survive.
            Only about
            <strong className="text-text font-medium"> 10–15 lumens per watt</strong> emerges as
            visible light from a typical household incandescent
            <Cite id="coaton-marsden-1997" in={SOURCES} /> — under ten percent of the electrical
            input. The rest is infrared, which is to say, heat. Modern LED lamps reach 100+ lm/W by
            abandoning the thermal-radiation route entirely.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 3.2"
          title="Long-distance transmission: why the grid runs at hundreds of kilovolts"
          summary="Quartering the line current quarters the loss; the obvious lever, applied at planetary scale."
          specs={[
            {
              label: 'Typical high-voltage transmission',
              value: (
                <>
                  ~115 kV to 765 kV <Cite id="grainger-power-systems-2003" in={SOURCES} />
                </>
              ),
            },
            {
              label: 'Loss scaling for fixed delivered power',
              value: (
                <>
                  <InlineMath tex="P_{\text{loss}} = (P/V)^2 R" />{' '}
                  <Cite id="grainger-power-systems-2003" in={SOURCES} />
                </>
              ),
            },
            {
              label: 'Aluminum conductor conductivity',
              value: (
                <>
                  ~3.77×10<sup>7</sup> S/m (~63% of Cu) <Cite id="crc-resistivity" in={SOURCES} />
                </>
              ),
            },
            {
              label: 'Reason aluminum wins outdoors',
              value: (
                <>
                  roughly one-third the density of copper <Cite id="crc-resistivity" in={SOURCES} />
                </>
              ),
            },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            A transmission line is just a long resistor. Take a 1 GW load fed at 11 kV: the line
            current is about <strong className="text-text font-medium">91 kA</strong>, and the
            per-meter <InlineMath tex="I^2 R" /> dissipation in any realistic conductor is
            catastrophic. Push the same gigawatt at 500 kV and the current drops to{' '}
            <strong className="text-text font-medium">2 kA</strong>; the loss along the same
            conductor drops by a factor of <InlineMath tex="(500/11)^2 \approx 2000" />
            <Cite id="grainger-power-systems-2003" in={SOURCES} />. That quadratic in{' '}
            <InlineMath tex="V" /> is the single biggest reason the grid exists in its current form.
          </p>
          <p className="mb-prose-2 last:mb-0">
            The conductor choice is the second lever. Outdoor transmission lines are almost always{' '}
            <em className="text-text italic">aluminum</em>, not copper, even though aluminum's
            conductivity is only about <InlineMath tex="3.77\times 10^{7}\ \text{S/m}" /> — roughly
            63% of copper's
            <Cite id="crc-resistivity" in={SOURCES} />. For a long span suspended in air, the
            dominant constraint is the conductor's own weight pulling on the towers, and aluminum is
            roughly one-third the density of copper. The extra cross-section needed to hit the same{' '}
            <InlineMath tex="R" /> still comes out lighter and cheaper. Inside your walls, where
            copper's mechanical and termination properties win, the calculus flips back
            <Cite id="nec-2017-aluminum" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            Every transformer in the chain — generator step-up, regional substation, neighborhood
            pole-top — exists for the same reason. The actual current the wall outlet hands you is
            set by what your appliance asks of it; everything upstream is the grid choosing voltages
            so that the line current at each stage is sane against the local <InlineMath tex="R" />.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 3.3"
          title="Superconducting cables: the resistor that isn't"
          summary="Onnes 1911 to grid-scale prototypes: what happens when ρ is literally zero."
          specs={[
            {
              label: 'Discovery of zero resistance in mercury',
              value: (
                <>
                  1911, at T = 4.2 K <Cite id="onnes-1911" in={SOURCES} />
                </>
              ),
            },
            {
              label: 'Mechanism',
              value: (
                <>
                  Cooper-paired electron condensate <Cite id="bcs-1957" in={SOURCES} />
                </>
              ),
            },
            {
              label: 'DC resistivity below T_c',
              value: (
                <>
                  ~0 (no upper bound from experiment) <Cite id="onnes-1911" in={SOURCES} />
                </>
              ),
            },
            {
              label: 'Joule heating in the conductor itself',
              value: (
                <>
                  0, because <InlineMath tex="I^2 R = 0" /> <Cite id="joule-1841" in={SOURCES} />
                </>
              ),
            },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            Heike Kamerlingh Onnes cooled mercury to{' '}
            <strong className="text-text font-medium">4.2 K</strong> in his Leiden cryogenics lab in
            1911 and watched its DC resistance drop, abruptly, to zero
            <Cite id="onnes-1911" in={SOURCES} />. Half a century later Bardeen, Cooper, and
            Schrieffer explained why: below a critical temperature, electrons in certain metals bind
            into <strong className="text-text font-medium">Cooper pairs</strong> through a
            phonon-mediated interaction, and the paired condensate cannot exchange small amounts of
            momentum with the lattice because of an opened energy gap
            <Cite id="bcs-1957" in={SOURCES} />. With no available scattering channel, the Drude
            time effectively diverges, the conductivity diverges with it, and the resistance is
            genuinely zero
            <Cite id="drude-1900" in={SOURCES} />
            <Cite id="ashcroft-mermin-1976" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            For a transmission cable the consequence is direct: <InlineMath tex="I^2 R" /> drops to
            literally zero in the cable itself. There is no in-conductor heat dissipation, no
            temperature rise, no current-limited derating. The catch is the cryogenic plant required
            to keep the conductor below its critical temperature — and the much subtler caveat that
            superconductors carry AC <em className="text-text italic">imperfectly</em>, since
            alternating fields still drive the unpaired electrons present at non-zero T into normal
            scattering and produce modest losses
            <Cite id="bcs-1957" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            The clean implication for this chapter is that everything we've said about
            <InlineMath tex="P = I^2 R" /> assumes an ordinary metallic conductor with a finite ρ.
            Strip the ρ and the entire dissipation argument vanishes — exactly as the formula
            promises. The fact that we use copper instead is a thermodynamic cost calculation, not a
            physical necessity.
          </p>
        </CaseStudy>
      </CaseStudies>

      <FAQ
        intro={
          <>
            Resistance is a one-line formula, <InlineMath id="resistance-resistivity" />, but it
            touches every wire in a building, every kettle, every transmission line, and every
            short-circuit fire. These are the questions that come up once the equation starts
            meeting reality.
          </>
        }
      >
        <FAQItem q="Why does a thinner wire have higher resistance, even though it's the same material?">
          <p>
            Resistance is <InlineMath id="resistance-resistivity" />: halve the cross-section{' '}
            <InlineMath tex="A" /> and you double <InlineMath tex="R" />
            <Cite id="griffiths-2017" in={SOURCES} />. The microscopic picture is even cleaner —
            think of the wire as a bundle of parallel filaments. A fat wire has many filaments
            carrying current side by side; a thin wire has fewer. With fewer parallel paths, each
            carrying its share of <InlineMath tex="I" />, the current density{' '}
            <InlineMath tex="J = I/A" /> climbs, and the field <InlineMath tex="E = J/\sigma" />{' '}
            needed to push it climbs with it. More field over the same length means more voltage
            drop — i.e., more resistance.
          </p>
        </FAQItem>

        <FAQItem q="Why does a longer wire have more resistance? Geometrically — what's actually doubling?">
          <p>
            Voltage drop is the work per unit charge done{' '}
            <em className="text-text italic">against</em> the lattice friction. Inside a uniform
            wire the field is <InlineMath tex="E = V/L" /> and the same charge has to traverse the
            whole length, so doubling <InlineMath tex="L" /> doubles the integrated drop for a fixed{' '}
            <InlineMath tex="E" />
            <Cite id="griffiths-2017" in={SOURCES} />. Equivalently, a long wire is many short wires
            in series: each segment dissipates its share of <InlineMath tex="I^2 R" />, and the
            segments add. The formula <InlineMath id="resistance-resistivity" /> encodes both views
            at once.
          </p>
        </FAQItem>

        <FAQItem q="Why does copper's resistance go UP with temperature, while a semiconductor's goes DOWN?">
          <p>
            In a metal, the carrier density <InlineMath tex="n" /> is essentially fixed — every
            copper atom donates its one conduction electron whether the wire is cold or hot. Heating
            up just increases lattice vibrations (phonons), which scatter electrons more often,
            shortening the Drude time <InlineMath tex="\tau" /> and pushing{' '}
            <InlineMath tex="\rho" /> up roughly linearly with <InlineMath tex="T" /> above the
            Debye temperature — a slope quantified by the metal's{' '}
            <Term
              def={
                <>
                  <strong className="text-text font-medium">
                    temperature coefficient of resistance
                  </strong>{' '}
                  (α) — the fractional change in resistance per kelvin:{' '}
                  <InlineMath tex="R(T) \approx R_0 [1 + \alpha(T - T_0)]" />. For copper near room
                  temperature, α ≈ 0.00393 /K.
                </>
              }
            >
              temperature coefficient
            </Term>
            <Cite id="matthiessen-1864" in={SOURCES} />
            <Cite id="ashcroft-mermin-1976" in={SOURCES} />. In a semiconductor,{' '}
            <InlineMath tex="n" /> itself is temperature-activated: more heat liberates
            exponentially more carriers across the band gap, and that swamps the increased
            scattering. <em className="text-text italic">Same equation</em>{' '}
            <InlineMath tex="\sigma = nq^2\tau/m" />, opposite slopes — because in metals only{' '}
            <InlineMath tex="\tau" /> moves and in semiconductors <InlineMath tex="n" /> dominates.
          </p>
        </FAQItem>

        <FAQItem q="What is a superconductor, and why doesn't it heat up when current flows?">
          <p>
            A{' '}
            <Term
              def={
                <>
                  <strong className="text-text font-medium">superconductor</strong> — a material
                  whose DC resistance drops to exactly zero below a critical temperature T
                  <sub>c</sub>. Cooper pairs of electrons condense into a gapped state that cannot
                  scatter off the lattice. Discovered by Onnes (1911); explained by BCS theory
                  (1957).
                </>
              }
            >
              superconductor
            </Term>{' '}
            is a material whose DC resistance vanishes below a critical temperature. Kamerlingh
            Onnes cooled mercury to 4.2 K in 1911 and watched its resistance fall to{' '}
            <em className="text-text italic">exactly</em> zero
            <Cite id="onnes-1911" in={SOURCES} />. The microscopic explanation came in 1957 from
            Bardeen, Cooper, and Schrieffer: below the critical temperature, electrons bind into{' '}
            <strong className="text-text font-medium">Cooper pairs</strong>
            via a weak phonon-mediated attraction, and the paired condensate cannot exchange small
            amounts of energy with the lattice because of an opened energy gap
            <Cite id="bcs-1957" in={SOURCES} />. With no scattering channel, the Drude{' '}
            <InlineMath tex="\tau \to \infty" />, so <InlineMath tex="\sigma \to \infty" /> and{' '}
            <InlineMath tex="R \to 0" />. No <InlineMath tex="I^2 R" /> means no heat dissipated —
            the dissipation isn't being hidden, it's literally not happening.
          </p>
        </FAQItem>

        <FAQItem q="Why does a kettle use a thick element, while a hair-dryer or toaster uses a thin coil?">
          <p>
            Both want to dissipate ~1–2 kW at line voltage, but they tune the resistance
            differently. A kettle heats water by direct contact, so its element runs at a few
            hundred kelvin and can be a moderately thick metal sheath — modest{' '}
            <InlineMath tex="R" />, big <InlineMath tex="I" />, lots of surface area in contact with
            water. A toaster needs to <em className="text-text italic">glow</em> red so it can
            radiate at ~1000 K, which means the element must reach equilibrium where{' '}
            <InlineMath tex="P = \varepsilon\sigma_{\text{SB}} A_{\text{surf}} T^4" /> balances{' '}
            <InlineMath tex="I^2 R" />. To get there in open air, you go thin and use{' '}
            <strong className="text-text font-medium">nichrome</strong>, whose ρ is ~70× copper's
            and which doesn't oxidize at red heat
            <Cite id="kanthal" in={SOURCES} />
            <Cite id="joule-1841" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="If silver is the best conductor, why is house wiring made of copper?">
          <p>
            Silver edges copper by about <strong className="text-text font-medium">5%</strong> in
            conductivity —{' '}
            <InlineMath tex="\sigma_{\text{Ag}} \approx 6.30\times 10^{7}\ \text{S/m}" /> vs.
            <InlineMath tex="\sigma_{\text{Cu}} \approx 5.96\times 10^{7}\ \text{S/m}" />
            <Cite id="crc-resistivity" in={SOURCES} />. But silver is roughly an order of magnitude
            more expensive per kilogram, and you'd save only a few percent of <InlineMath tex="R" />{' '}
            by switching. For house wiring, copper is essentially the same conductor at a fraction
            of the cost, with the bonus of being mechanically friendlier (more ductile, easier to
            terminate). The 5% gain simply isn't worth it.
          </p>
        </FAQItem>

        <FAQItem q="Aluminum was banned for new house wiring in the 1970s — why?">
          <p>
            Solid-aluminum 15 A / 20 A branch-circuit wiring was installed in millions of U.S. homes
            between 1965 and 1973, when copper prices spiked. It later became notorious for
            connection fires
            <Cite id="nec-2017-aluminum" in={SOURCES} />. The bulk metal was fine; the failures
            happened at terminations. Aluminum forms a hard,{' '}
            <em className="text-text italic">insulating</em> oxide layer the moment it sees air, and
            it
            <strong className="text-text font-medium"> creeps</strong> under the clamping pressure
            of a screw terminal — so a connection that started tight loosens over years, the oxide
            grows, contact resistance climbs, and <InlineMath tex="I^2 R" /> at the joint heats it
            further in a runaway. Modern aluminum service entrances use larger gauges, antioxidant
            paste, and AL-rated devices to avoid the failure mode.
          </p>
        </FAQItem>

        <FAQItem q="Why does a long extension cord get warm, but a short one doesn't?">
          <p>
            Same current, same material, same gauge — but ten times the length is ten times the
            resistance. Power dissipated as heat is <InlineMath id="power-i2r" />, so the long cord
            dumps ten times as many watts into its own copper
            <Cite id="griffiths-2017" in={SOURCES} />. A short cord at 10 A through ~6 mΩ wastes
            ~0.6 W — undetectable. A 30-meter extension at the same current through ~600 mΩ
            dissipates ~60 W along its length, which a thin plastic sheath cannot get rid of fast
            enough by convection. The cord warms up; the load on the far end sees a slightly reduced
            voltage.
          </p>
        </FAQItem>

        <FAQItem q="Why is high-voltage transmission so much more efficient than low-voltage?">
          <p>
            For a fixed amount of delivered power <InlineMath tex="P" />, the line current is{' '}
            <InlineMath tex="I = P/V" />, and the line losses are{' '}
            <InlineMath tex="P_{\text{loss}} = I^2 R = (P/V)^2 R" />
            <Cite id="grainger-power-systems-2003" in={SOURCES} />. Doubling the transmission
            voltage halves the current and <em className="text-text italic">quarters</em> the loss —
            the dependence is quadratic. That's why long-distance lines run at hundreds of
            kilovolts, with transformers stepping down to safe domestic voltages right before the
            wires enter your house. The wires themselves don't change; only the operating point on
            the <InlineMath tex="I^2 R" /> curve does.
          </p>
        </FAQItem>

        <FAQItem q="If P = I²R, why doesn't a 5 V phone charger melt a thin USB cable?">
          <p>
            Because <InlineMath tex="I" /> is small. A 5 V × 2 A charger delivers 10 W; through a
            typical USB-A cable of ~0.2 Ω round-trip the dissipated power is{' '}
            <InlineMath tex="I^2 R = 4 \times 0.2 = 0.8\ \text{W}" /> spread over a meter of cable —
            easily shed by convection
            <Cite id="griffiths-2017" in={SOURCES} />. The cable does get faintly warm and you lose
            a tenth of a volt to <InlineMath tex="IR" /> drop. Try it with USB-PD at 100 W / 5 A and
            a too-thin wire and you genuinely can melt the insulation; this is why high-current
            USB-C cables include an
            <em className="text-text italic"> e-marker</em> chip that negotiates current limits with
            the charger.
          </p>
        </FAQItem>

        <FAQItem q='What is "voltage drop"? Does some voltage actually get lost?'>
          <p>
            <strong className="text-text font-medium">Voltage isn't conserved; energy is.</strong>{' '}
            When current <InlineMath tex="I" /> passes through a wire of resistance{' '}
            <InlineMath tex="R" />, the potential at the far end is lower than at the near end by{' '}
            <InlineMath tex="IR" /> — that's the &quot;drop&quot;
            <Cite id="griffiths-2017" in={SOURCES} />. The missing potential energy didn't vanish;
            it was converted into heat at the rate <InlineMath tex="I^2 R" /> as electrons scattered
            against the lattice. A long thin extension cord shows this dramatically: plug a vacuum
            cleaner into a 30 m 16-gauge cord and its motor sees noticeably fewer volts than the
            outlet provides, with the difference radiating from the cord as warmth.
          </p>
        </FAQItem>

        <FAQItem q="Would a wire have any resistance at all if it were perfectly pure?">
          <p>
            Still yes, at any temperature above absolute zero. Even a perfectly pure, perfectly
            periodic crystal has thermal vibrations —{' '}
            <strong className="text-text font-medium">phonons</strong> — that scatter conduction
            electrons.{' '}
            <Term
              def={
                <>
                  <strong className="text-text font-medium">Matthiessen's rule</strong> — the total
                  resistivity of a metal is the sum of independent scattering contributions:{' '}
                  <InlineMath tex="\rho = \rho_{\text{impurity}} + \rho_{\text{phonon}}(T) + \ldots" />
                  . Independent because the scattering rates add.
                </>
              }
            >
              Matthiessen's rule
            </Term>{' '}
            writes the total resistivity as a sum:{' '}
            <InlineMath tex="\rho = \rho_{\text{residual}} + \rho_{\text{phonon}}(T)" />
            <Cite id="matthiessen-1864" in={SOURCES} />. The first term comes from impurities,
            vacancies, and grain boundaries; the second from lattice vibrations. Ultra-pure copper
            near 4 K can have <InlineMath tex="\rho" /> a thousand times lower than at room
            temperature, but only a true superconductor reaches exactly zero
            <Cite id="onnes-1911" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="At the atomic level, what's actually causing the resistance?">
          <p>
            Two things, in parallel. Drude's mechanical picture imagines electrons accelerating
            under <InlineMath tex="\vec{E}" />, then colliding with lattice ions and randomizing
            their drift component every <InlineMath tex="\tau \approx 2\times 10^{-14}\ \text{s}" />
            <Cite id="drude-1900" in={SOURCES} />. The modern Bloch picture replaces the
            &quot;collisions&quot; with{' '}
            <strong className="text-text font-medium">
              scattering off deviations from a perfect crystal
            </strong>{' '}
            — phonons (lattice vibrations) plus impurities, defects, and grain boundaries — but the
            rate equation <InlineMath tex="\sigma = nq^2\tau/m" /> survives nearly intact
            <Cite id="ashcroft-mermin-1976" in={SOURCES} />. Resistance is the macroscopic stamp of
            these quantum scattering events; the kinetic energy gained between scatterings ends up
            as lattice vibration (heat).
          </p>
        </FAQItem>

        <FAQItem q="What's the difference between resistance and impedance?">
          <p>
            <strong className="text-text font-medium">Resistance</strong> is the real, dissipative
            response of a circuit element to current: <InlineMath tex="V = IR" />, and energy goes
            into heat at the rate <InlineMath tex="I^2 R" />.{' '}
            <strong className="text-text font-medium">Impedance</strong> generalizes it to AC, where
            capacitors and inductors also limit current but without dissipating — they store and
            return energy each cycle. Impedance is the complex quantity{' '}
            <InlineMath tex="Z = R + jX" />, where the real part <InlineMath tex="R" /> is still
            dissipative and the imaginary part <InlineMath tex="X" /> (reactance) is energy-storing
            <Cite id="irwin-circuit-analysis-2015" in={SOURCES} />. Inside a pure resistor,{' '}
            <InlineMath tex="Z = R" />; everywhere else, AC needs the full complex picture.
          </p>
        </FAQItem>

        <FAQItem q="Why does nichrome glow red but copper doesn't, at the same current?">
          <p>
            For a given current <InlineMath tex="I" />, the power dissipated per meter is{' '}
            <InlineMath tex="I^2 R / L = I^2 \rho / A" /> — it scales directly with resistivity.
            Nichrome's <InlineMath tex="\rho" /> is more than 60× copper's
            <Cite id="kanthal" in={SOURCES} />, so the same current dumps more than sixty times as
            many watts per meter into nichrome than into copper. Copper sheds that modest amount
            easily by convection at near-ambient temperature; nichrome cannot, so its temperature
            climbs until Stefan–Boltzmann radiation balances the input — typically into the red-glow
            band around 1000 K
            <Cite id="joule-1841" in={SOURCES} />. Same equation, different equilibrium point.
          </p>
        </FAQItem>

        <FAQItem q="A short circuit causes a fire — but what's actually happening at the wire level?">
          <p>
            A short circuit replaces the intended load (a few ohms, a few amps) with a near-zero
            resistance path. With <InlineMath tex="I = V/R" />, the current rockets to hundreds of
            amperes within the impedance limit of the supply
            <Cite id="griffiths-2017" in={SOURCES} />. The wire itself still has its small{' '}
            <InlineMath tex="R" />, so the dissipated power <InlineMath tex="I^2 R" /> goes from
            watts to <em className="text-text italic">kilowatts</em> per meter — vastly more than
            convection and conduction can carry away. Insulation reaches its decomposition
            temperature in milliseconds and ignites. Fuses and breakers exist precisely to interrupt
            the loop before the wire's <InlineMath tex="P = I^2 R" /> overruns its thermal budget.
          </p>
        </FAQItem>

        <FAQItem q="Does a wire's resistance change while it's hot?">
          <p>
            Yes, significantly. Copper's resistivity climbs roughly linearly with temperature above
            the Debye temperature, with a coefficient of{' '}
            <strong className="text-text font-medium">~0.39%/K</strong>
            <Cite id="matthiessen-1864" in={SOURCES} />
            <Cite id="ashcroft-mermin-1976" in={SOURCES} />. A copper winding that's 20 mΩ at room
            temperature is closer to 26 mΩ at 100 °C. Incandescent tungsten is the extreme case:
            cold resistance is ~10× lower than operating resistance, which is why bulbs
            overwhelmingly fail at the instant they're switched on — the inrush current is enormous
            until the filament heats and <InlineMath tex="R" /> climbs to its steady-state value.
          </p>
        </FAQItem>
      </FAQ>
    </ChapterShell>
  );
}
