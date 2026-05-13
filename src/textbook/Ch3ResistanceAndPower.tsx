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
import { ChapterShell } from '@/components/ChapterShell';
import { FAQ, FAQItem } from '@/components/FAQ';
import { Cite } from '@/components/SourcesList';
import { Formula } from '@/components/Formula';
import { AreaVsResistanceDemo } from './demos/AreaVsResistance';
import { JouleHeatingDemo } from './demos/JouleHeating';
import { LengthVsResistanceDemo } from './demos/LengthVsResistance';
import { MaterialPickerDemo } from './demos/MaterialPicker';
import { SeriesVsParallelDemo } from './demos/SeriesVsParallel';
import { getChapter } from './data/chapters';

export default function Ch3ResistanceAndPower() {
  const chapter = getChapter('resistance-and-power')!;
  const SOURCES = chapter.sources;

  return (
    <ChapterShell chapter={chapter}>
      <p>
        Run a finger along an old incandescent bulb that's been on for a minute and you'll snatch it back. The glass is
        hot. The filament inside is closer to <strong>2800 K</strong> — hot enough that a sliver of its blackbody spectrum spills into the
        visible and the bulb does what it was built to do. Where did all that heat come from? Not from the wall, not directly.
        It came from the lattice of tungsten atoms inside the filament absorbing the kinetic energy of electrons that the
        electric field had been accelerating between collisions. <strong>Resistance</strong> is the macroscopic name for that
        lossy hand-off, and <strong>power</strong> is the rate at which it happens.
      </p>
      <p>
        This chapter is about the friction. Why a long wire resists more than a short one, why a thin wire resists more
        than a fat one, why some metals resist about as well as a soap bubble resists wind and others were specifically engineered to
        burn red at line voltage. The whole macroscopic story falls out of one microscopic picture — the
        Drude model from Chapter 2 — and one geometric integral.
      </p>

      <h2>What <em>resistance</em> is</h2>

      <p>
        The microscopic Ohm's law from the previous chapter said that inside a conductor, current density is proportional
        to the electric field driving it:
      </p>
      <Formula>J = σ E</Formula>
      <p>
        with <strong>σ</strong> the conductivity, a property of the material. Drude's 1900 free-electron picture gave a
        mechanical explanation<Cite id="drude-1900" in={SOURCES} />: an electron accelerates under <strong>E</strong> for an
        average time <strong>τ</strong> between collisions with ions in the lattice, picks up a small drift velocity, then
        scatters and starts over. Average it out and you get a steady drift proportional to <em>E</em> — friction with a
        clean linear law. Modern solid-state physics rewrote the inputs in quantum terms, but the linear relation between
        field and current density survives intact for ordinary metals at ordinary fields<Cite id="ashcroft-mermin-1976" in={SOURCES} />.
      </p>
      <p>
        Wrap that microscopic law up over a whole wire — a length <strong>L</strong>, a cross-section <strong>A</strong>,
        a uniform field along the axis — and you get the macroscopic version every electrical engineer carries around:
      </p>
      <Formula>V = I R</Formula>
      <p>
        Voltage drop equals current times resistance. <em>Resistance</em> is the global lump that bundles up everything
        the local conductivity does to charges as they cross the wire. It depends on the material (through σ) and it
        depends on the geometry (through L and A), and that combination is the entire content of the rest of the chapter<Cite id="griffiths-2017" in={SOURCES} />.
      </p>

      <h2>Length adds, area divides</h2>

      <p>
        Take a uniform wire of length <strong>L</strong> and cross-section <strong>A</strong>, with a voltage <strong>V</strong>
        applied end to end. The field inside is <strong>E = V/L</strong>, uniform along the axis. The current density is
        then <strong>J = σE = σV/L</strong>. The total current — which is just <em>J</em> integrated over the cross-section —
        is <strong>I = JA = σAV/L</strong>. Comparing to <strong>V = IR</strong>:
      </p>
      <Formula>R = L / (σ A) = ρ L / A</Formula>
      <p>
        where <strong>ρ = 1/σ</strong> is the resistivity. Two clean geometric facts fall out. <strong>Twice the length, twice the
        resistance</strong> — because the field has to push each electron through twice as much lattice. <strong>Twice
        the cross-section, half the resistance</strong> — because there are twice as many parallel paths for current to
        flow through<Cite id="griffiths-2017" in={SOURCES} />.
      </p>

      <LengthVsResistanceDemo />

      <p>
        The length picture is the simpler of the two. Stretch the copper wire above and the resistance climbs in lockstep:
        from a few milliohms at 10 cm to a few tens of milliohms at 10 m. Linearly, no surprises.
      </p>

      <AreaVsResistanceDemo />

      <p>
        The area picture is more dramatic because cross-section spans more decades in real engineering. A hair-thin
        0.1 mm² wire and a finger-thick 10 mm² wire — both of the same material, both the same length — differ in
        resistance by a factor of one hundred. Power-line conductors are deliberately huge; integrated-circuit traces
        are deliberately microscopic; the geometric R = ρL/A formula handles both extremes with the same arithmetic.
      </p>

      <h2>Material is destiny</h2>

      <p>
        Geometry is half the story. The other half is the prefactor — the resistivity ρ of whatever the wire is made of —
        and across ordinary materials it spans an absurd range. The CRC Handbook tabulates <em>twenty-three</em> orders
        of magnitude between the best room-temperature conductors and the best ordinary insulators<Cite id="crc-resistivity" in={SOURCES} />.
        Even confining ourselves to metals, the spread is large.
      </p>
      <p className="pullout">
        Conductivity is a single number that bundles up everything about how charges navigate a material.
      </p>
      <p>
        Silver is the king at <strong>σ ≈ 6.30×10⁷ S/m</strong>, with copper a hair behind at <strong>5.96×10⁷ S/m</strong> —
        the gap is small enough that copper wins on price every time<Cite id="crc-resistivity" in={SOURCES} />. Aluminum's
        conductivity is about <strong>3.77×10⁷ S/m</strong>, only ~63% of copper's, but aluminum is roughly a third the
        density of copper. For long-distance power lines, where the conductor's own weight is the dominant engineering
        constraint, that trade is worth making — almost every overhead transmission line in the world is aluminum.
      </p>
      <p>
        Iron drops you to about <strong>1.0×10⁷ S/m</strong>, six times worse than copper. Tungsten (<strong>1.79×10⁷ S/m</strong>)
        is worse still — but tungsten has the highest melting point of any metal, around <strong>3700 K</strong>, which
        is why every incandescent filament for the last century was made of it. And nichrome — an alloy of nickel and
        chromium — sits at <strong>σ ≈ 9.1×10⁵ S/m</strong>, roughly <em>seventy times worse</em> than copper. Nichrome was
        engineered to be a bad conductor, on purpose, that stays solid and chemically passive at red heat. It is the
        material in your toaster<Cite id="kanthal" in={SOURCES} />.
      </p>

      <MaterialPickerDemo />

      <p>
        At a fixed scenario — 12 V across a meter of 2.5 mm² wire — copper carries close to two thousand amps (a short
        circuit, basically), while nichrome carries about two orders of magnitude less for the same applied voltage.
        Same geometry, same volts; the material alone moves the current by a factor of sixty-five. Nothing else
        in this chapter is anywhere near as sensitive to a single design choice.
      </p>

      <h2>Where the heat comes from</h2>

      <p>
        Drude's collision picture is what makes resistance dissipative rather than reactive. Between collisions, the
        field does work on a free electron — the electron picks up kinetic energy at the rate <em>F</em>·<em>v</em>. At
        the next collision (every ~2×10⁻¹⁴ s in copper) the electron's drift component is randomized by interaction with
        a lattice ion, and that gained kinetic energy is dumped into the lattice as a vibrational mode. The lattice warms.
        The electron starts over<Cite id="drude-1900" in={SOURCES} /><Cite id="ashcroft-mermin-1976" in={SOURCES} />.
      </p>
      <p>
        Per unit volume, the rate of energy transfer from field to lattice is the dot product <strong>J·E</strong>:
      </p>
      <Formula>p<sub>v</sub> = J · E = σ E²</Formula>
      <p>
        Always positive in a resistor (J and E point the same way). Integrate over the wire's volume <strong>LA</strong>,
        with E = V/L throughout, and the macroscopic power drops out:
      </p>
      <Formula>P = σ A V² / L = V² / R = V I = I² R</Formula>
      <p>
        James Joule established this experimentally in 1841 with a calorimeter that became the namesake of the SI unit
        of energy<Cite id="joule-1841" in={SOURCES} />. The microscopic and macroscopic accounts agree exactly — they have
        to, since they describe the same energy flow at two zoom levels<Cite id="griffiths-2017" in={SOURCES} />.
      </p>

      <JouleHeatingDemo />

      <p>
        The wire above warms from gray to dull red around <strong>900 K</strong>, through cherry red and orange, and on to
        white-hot near <strong>3000 K</strong>. The equilibrium temperature comes from radiation balance — Stefan–Boltzmann
        says a hot surface radiates power proportional to <strong>T⁴</strong>, so a wire dissipating <em>P</em> watts over
        surface area <em>A<sub>surf</sub></em> with emissivity <em>ε</em> sits at the temperature that solves
        <em> P = ε σ<sub>SB</sub> A<sub>surf</sub> T⁴</em>. Tungsten's hostile combination of low conductivity and very high
        melting point lets a thin filament reach incandescent T without melting; nichrome's lower σ and high oxidation
        resistance let a cherry-red coil sit in open air for years without crumbling. Same physics, different design points.
      </p>

      <h2>Series and parallel</h2>

      <p>
        Two resistors in a circuit can be wired two ways. Put them in <strong>series</strong> — a single loop, everything
        the same current — and the voltage drops add: <em>V = IR₁ + IR₂ = I(R₁ + R₂)</em>. The combined resistance is the sum:
      </p>
      <Formula>R<sub>series</sub> = R₁ + R₂</Formula>
      <p>
        Put them in <strong>parallel</strong> — two branches at the same voltage <em>V</em> — and the currents add:
        <em> I = V/R₁ + V/R₂ = V(1/R₁ + 1/R₂)</em>, so the reciprocals combine:
      </p>
      <Formula>1 / R<sub>parallel</sub> = 1/R₁ + 1/R₂</Formula>
      <p>
        Two equal resistors in parallel give half their value; in general, the parallel combination is always less than
        either branch on its own<Cite id="griffiths-2017" in={SOURCES} />.
      </p>

      <SeriesVsParallelDemo />

      <p>
        These rules are not arbitrary topology axioms — they are the same geometric R = ρL/A from earlier in the chapter,
        looked at from a different angle. <em>A long wire is many short wires in series.</em> Slice a wire of length <em>L</em>
        into <em>n</em> equal segments; each segment has resistance ρ(L/n)/A, and adding <em>n</em> of them in series recovers
        ρL/A — the original formula. <em>A fat wire is many thin wires in parallel.</em> Slice a wire of cross-section <em>A</em>
        into <em>n</em> filaments of cross-section A/n; each filament has resistance ρL/(A/n) = nρL/A, and combining <em>n</em>
        of them in parallel gives ρL/A again. "Long = series" and "fat = parallel" both recover the geometric law by the rules
        in this section. The macroscopic and geometric pictures are the same picture.
      </p>

      <h2>What we have so far</h2>

      <p>
        Resistance is geometry times material. Geometry contributes a factor of L/A — long-and-thin resists more, short-and-fat
        resists less. Material contributes ρ = 1/σ, ranging from copper's 1.7×10⁻⁸ Ω·m up through tungsten and nichrome and
        out into the insulators. Power dissipated in a resistor is the rate at which the field does work on charges that
        immediately scatter that energy into lattice vibrations: <em>P = VI = I²R = V²/R</em>. Every watt of resistive
        dissipation is a watt of heat.
      </p>
      <p>
        We've now got the linear, conductive half of electricity firmly in hand: charges in fields, fields in space,
        currents through resistors, watts becoming heat. In Chapter 4 we let the currents themselves <em>do</em> something —
        because moving charge produces a second kind of field, the rotational partner of the electrostatic one, and that
        is where the rest of nineteenth-century physics opens up.
      </p>

      <FAQ
        intro={
          <>
            Resistance is a one-line formula, <em>R = ρL/A</em>, but it touches every wire in a building,
            every kettle, every transmission line, and every short-circuit fire. These are the questions
            that come up once the equation starts meeting reality.
          </>
        }
      >
        <FAQItem q="Why does a thinner wire have higher resistance, even though it's the same material?">
          <p>
            Resistance is <strong>R = ρL/A</strong>: halve the cross-section <em>A</em> and you double <em>R</em>
            <Cite id="griffiths-2017" in={SOURCES} />. The microscopic picture is even cleaner —
            think of the wire as a bundle of parallel filaments. A fat wire has many filaments carrying current
            side by side; a thin wire has fewer. With fewer parallel paths, each carrying its share of <em>I</em>,
            the current density <strong>J = I/A</strong> climbs, and the field <strong>E = J/σ</strong> needed to
            push it climbs with it. More field over the same length means more voltage drop — i.e., more resistance.
          </p>
        </FAQItem>

        <FAQItem q="Why does a longer wire have more resistance? Geometrically — what's actually doubling?">
          <p>
            Voltage drop is the work per unit charge done <em>against</em> the lattice friction. Inside a uniform
            wire the field is <strong>E = V/L</strong> and the same charge has to traverse the whole length, so
            doubling <em>L</em> doubles the integrated drop for a fixed <em>E</em>
            <Cite id="griffiths-2017" in={SOURCES} />. Equivalently, a long wire is many short wires in series: each
            segment dissipates its share of <em>I²R</em>, and the segments add. The formula <em>R = ρL/A</em>
            encodes both views at once.
          </p>
        </FAQItem>

        <FAQItem q="Why does copper's resistance go UP with temperature, while a semiconductor's goes DOWN?">
          <p>
            In a metal, the carrier density <em>n</em> is essentially fixed — every copper atom donates its one
            conduction electron whether the wire is cold or hot. Heating up just increases lattice vibrations
            (phonons), which scatter electrons more often, shortening the Drude time <em>τ</em> and pushing
            <strong> ρ</strong> up roughly linearly with <em>T</em> above the Debye temperature
            <Cite id="matthiessen-1864" in={SOURCES} /><Cite id="ashcroft-mermin-1976" in={SOURCES} />. In a
            semiconductor, <em>n</em> itself is temperature-activated: more heat liberates exponentially more
            carriers across the band gap, and that swamps the increased scattering. <em>Same equation
            σ = nq²τ/m</em>, opposite slopes — because in metals only <em>τ</em> moves and in semiconductors
            <em> n</em> dominates.
          </p>
        </FAQItem>

        <FAQItem q="What is a superconductor, and why doesn't it heat up when current flows?">
          <p>
            Kamerlingh Onnes cooled mercury to 4.2 K in 1911 and watched its resistance fall to <em>exactly</em>
            zero<Cite id="onnes-1911" in={SOURCES} />. The microscopic explanation came in 1957 from Bardeen,
            Cooper, and Schrieffer: below the critical temperature, electrons bind into <strong>Cooper pairs</strong>
            via a weak phonon-mediated attraction, and the paired condensate cannot exchange small amounts of
            energy with the lattice because of an opened energy gap<Cite id="bcs-1957" in={SOURCES} />. With no
            scattering channel, the Drude <em>τ → ∞</em>, so <strong>σ → ∞</strong> and <strong>R → 0</strong>.
            No <em>I²R</em> means no heat dissipated — the dissipation isn't being hidden, it's literally not
            happening.
          </p>
        </FAQItem>

        <FAQItem q="Why does a kettle use a thick element, while a hair-dryer or toaster uses a thin coil?">
          <p>
            Both want to dissipate ~1–2 kW at line voltage, but they tune the resistance differently. A kettle
            heats water by direct contact, so its element runs at a few hundred kelvin and can be a moderately
            thick metal sheath — modest <em>R</em>, big <em>I</em>, lots of surface area in contact with water.
            A toaster needs to <em>glow</em> red so it can radiate at ~1000 K, which means the element must reach
            equilibrium where <em>P = εσ<sub>SB</sub>A<sub>surf</sub>T⁴</em> balances <em>I²R</em>. To get there
            in open air, you go thin and use <strong>nichrome</strong>, whose ρ is ~70× copper's and which doesn't
            oxidize at red heat<Cite id="kanthal" in={SOURCES} /><Cite id="joule-1841" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="If silver is the best conductor, why is house wiring made of copper?">
          <p>
            Silver edges copper by about <strong>5%</strong> in conductivity — σ<sub>Ag</sub> ≈ 6.30×10⁷ S/m vs.
            σ<sub>Cu</sub> ≈ 5.96×10⁷ S/m<Cite id="crc-resistivity" in={SOURCES} />. But silver is roughly an
            order of magnitude more expensive per kilogram, and you'd save only a few percent of <em>R</em> by
            switching. For house wiring, copper is essentially the same conductor at a fraction of the cost,
            with the bonus of being mechanically friendlier (more ductile, easier to terminate). The 5% gain
            simply isn't worth it.
          </p>
        </FAQItem>

        <FAQItem q="Aluminum was banned for new house wiring in the 1970s — why?">
          <p>
            Solid-aluminum 15 A / 20 A branch-circuit wiring was installed in millions of U.S. homes between
            1965 and 1973, when copper prices spiked. It later became notorious for connection fires
            <Cite id="nec-2017-aluminum" in={SOURCES} />. The bulk metal was fine; the failures happened at
            terminations. Aluminum forms a hard, <em>insulating</em> oxide layer the moment it sees air, and it
            <strong> creeps</strong> under the clamping pressure of a screw terminal — so a connection that started
            tight loosens over years, the oxide grows, contact resistance climbs, and <em>I²R</em> at the joint
            heats it further in a runaway. Modern aluminum service entrances use larger gauges, antioxidant
            paste, and AL-rated devices to avoid the failure mode.
          </p>
        </FAQItem>

        <FAQItem q="Why does a long extension cord get warm, but a short one doesn't?">
          <p>
            Same current, same material, same gauge — but ten times the length is ten times the resistance.
            Power dissipated as heat is <strong>P = I²R</strong>, so the long cord dumps ten times as many watts
            into its own copper<Cite id="griffiths-2017" in={SOURCES} />. A short cord at 10 A through ~6 mΩ
            wastes ~0.6 W — undetectable. A 30-meter extension at the same current through ~600 mΩ dissipates
            ~60 W along its length, which a thin plastic sheath cannot get rid of fast enough by convection.
            The cord warms up; the load on the far end sees a slightly reduced voltage.
          </p>
        </FAQItem>

        <FAQItem q="Why is high-voltage transmission so much more efficient than low-voltage?">
          <p>
            For a fixed amount of delivered power <em>P</em>, the line current is <strong>I = P/V</strong>, and the
            line losses are <strong>P<sub>loss</sub> = I²R = (P/V)² R</strong><Cite id="grainger-power-systems-2003" in={SOURCES} />.
            Doubling the transmission voltage halves the current and <em>quarters</em> the loss — the dependence
            is quadratic. That's why long-distance lines run at hundreds of kilovolts, with transformers stepping
            down to safe domestic voltages right before the wires enter your house. The wires themselves don't
            change; only the operating point on the <em>I²R</em> curve does.
          </p>
        </FAQItem>

        <FAQItem q="If P = I²R, why doesn't a 5 V phone charger melt a thin USB cable?">
          <p>
            Because <em>I</em> is small. A 5 V × 2 A charger delivers 10 W; through a typical USB-A cable
            of ~0.2 Ω round-trip the dissipated power is <em>I²R</em> = 4 × 0.2 = 0.8 W spread over a meter of
            cable — easily shed by convection<Cite id="griffiths-2017" in={SOURCES} />. The cable does get faintly
            warm and you lose a tenth of a volt to <em>IR</em> drop. Try it with USB-PD at 100 W / 5 A and a too-thin
            wire and you genuinely can melt the insulation; this is why high-current USB-C cables include an
            <em> e-marker</em> chip that negotiates current limits with the charger.
          </p>
        </FAQItem>

        <FAQItem q="What is &quot;voltage drop&quot;? Does some voltage actually get lost?">
          <p>
            <strong>Voltage isn't conserved; energy is.</strong> When current <em>I</em> passes through a wire of
            resistance <em>R</em>, the potential at the far end is lower than at the near end by <em>IR</em> —
            that's the &quot;drop&quot;<Cite id="griffiths-2017" in={SOURCES} />. The missing potential energy didn't
            vanish; it was converted into heat at the rate <em>I²R</em> as electrons scattered against the lattice.
            A long thin extension cord shows this dramatically: plug a vacuum cleaner into a 30 m 16-gauge cord and
            its motor sees noticeably fewer volts than the outlet provides, with the difference radiating from the
            cord as warmth.
          </p>
        </FAQItem>

        <FAQItem q="Would a wire have any resistance at all if it were perfectly pure?">
          <p>
            Still yes, at any temperature above absolute zero. Even a perfectly pure, perfectly periodic crystal
            has thermal vibrations — <strong>phonons</strong> — that scatter conduction electrons. Matthiessen's
            rule writes the total resistivity as a sum: <strong>ρ = ρ<sub>residual</sub> + ρ<sub>phonon</sub>(T)</strong>
            <Cite id="matthiessen-1864" in={SOURCES} />. The first term comes from impurities, vacancies, and grain
            boundaries; the second from lattice vibrations. Ultra-pure copper near 4 K can have <em>ρ</em> a thousand
            times lower than at room temperature, but only a true superconductor reaches exactly zero
            <Cite id="onnes-1911" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="At the atomic level, what's actually causing the resistance?">
          <p>
            Two things, in parallel. Drude's mechanical picture imagines electrons accelerating under <em>E</em>,
            then colliding with lattice ions and randomizing their drift component every <em>τ</em> ≈ 2×10⁻¹⁴ s
            <Cite id="drude-1900" in={SOURCES} />. The modern Bloch picture replaces the &quot;collisions&quot; with
            <strong> scattering off deviations from a perfect crystal</strong> — phonons (lattice vibrations) plus
            impurities, defects, and grain boundaries — but the rate equation <em>σ = nq²τ/m</em> survives nearly
            intact<Cite id="ashcroft-mermin-1976" in={SOURCES} />. Resistance is the macroscopic stamp of these
            quantum scattering events; the kinetic energy gained between scatterings ends up as lattice vibration
            (heat).
          </p>
        </FAQItem>

        <FAQItem q="What's the difference between resistance and impedance?">
          <p>
            <strong>Resistance</strong> is the real, dissipative response of a circuit element to current: <em>V = IR</em>,
            and energy goes into heat at the rate <em>I²R</em>. <strong>Impedance</strong> generalizes it to AC, where
            capacitors and inductors also limit current but without dissipating — they store and return energy each
            cycle. Impedance is the complex quantity <strong>Z = R + jX</strong>, where the real part <em>R</em> is
            still dissipative and the imaginary part <em>X</em> (reactance) is energy-storing
            <Cite id="irwin-circuit-analysis-2015" in={SOURCES} />. Inside a pure resistor, <em>Z = R</em>; everywhere
            else, AC needs the full complex picture.
          </p>
        </FAQItem>

        <FAQItem q="Why does nichrome glow red but copper doesn't, at the same current?">
          <p>
            For a given current <em>I</em>, the power dissipated per meter is <strong>I²R/L = I²ρ/A</strong> —
            it scales directly with resistivity. Nichrome's <em>ρ</em> is ~70× copper's<Cite id="kanthal" in={SOURCES} />,
            so the same current dumps ~70× more watts per meter into nichrome than into copper. Copper sheds that
            modest amount easily by convection at near-ambient temperature; nichrome cannot, so its temperature climbs
            until Stefan–Boltzmann radiation balances the input — typically into the red-glow band around 1000 K
            <Cite id="joule-1841" in={SOURCES} />. Same equation, different equilibrium point.
          </p>
        </FAQItem>

        <FAQItem q="A short circuit causes a fire — but what's actually happening at the wire level?">
          <p>
            A short circuit replaces the intended load (a few ohms, a few amps) with a near-zero resistance path.
            With <em>I = V/R</em>, the current rockets to hundreds of amperes within the impedance limit of the
            supply<Cite id="griffiths-2017" in={SOURCES} />. The wire itself still has its small <em>R</em>, so the
            dissipated power <em>I²R</em> goes from watts to <em>kilowatts</em> per meter — vastly more than
            convection and conduction can carry away. Insulation reaches its decomposition temperature in
            milliseconds and ignites. Fuses and breakers exist precisely to interrupt the loop before the wire's
            <em> P = I²R</em> overruns its thermal budget.
          </p>
        </FAQItem>

        <FAQItem q="Does a wire's resistance change while it's hot?">
          <p>
            Yes, significantly. Copper's resistivity climbs roughly linearly with temperature above the Debye
            temperature, with a coefficient of <strong>~0.39%/K</strong>
            <Cite id="matthiessen-1864" in={SOURCES} /><Cite id="ashcroft-mermin-1976" in={SOURCES} />. A copper
            winding that's 20 mΩ at room temperature is closer to 28 mΩ at 100 °C. Incandescent tungsten is the
            extreme case: cold resistance is ~10× lower than operating resistance, which is why bulbs
            overwhelmingly fail at the instant they're switched on — the inrush current is enormous until the
            filament heats and <em>R</em> climbs to its steady-state value.
          </p>
        </FAQItem>
      </FAQ>
    </ChapterShell>
  );
}
