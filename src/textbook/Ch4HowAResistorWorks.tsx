/**
 * Chapter 4 — How a resistor works
 *
 * The component, not the concept. Picks up from Ch.3 (resistance as a
 * physical quantity) and goes inside the brown hot-dog: film vs wirewound,
 * colour codes, power derating, temperature coefficients, and the variable
 * cousins (pots, thermistors, photoresistors). Closes with the
 * Wiedemann–Franz law as the deep cut: free electrons carry current and
 * heat with the same constant of proportionality.
 *
 * Demos:
 *   4.1 Build a resistor      (centerpiece — material, L, A → R + tolerance)
 *   4.2 Colour-code decoder   (IEC 60062 4-band / 5-band)
 *   4.3 Power derating curve  (P_max vs ambient T)
 *   4.4 R vs temperature      (Cu / W / nichrome / NTC / PTC)
 *   4.5 Variable resistors    (potentiometer + LDR)
 *   4.6 Wiedemann–Franz       (κ vs σ for six metals)
 */
import { CaseStudies, CaseStudy } from '@/components/CaseStudy';
import { ChapterShell } from '@/components/ChapterShell';
import { FAQ, FAQItem } from '@/components/FAQ';
import { Cite } from '@/components/SourcesList';
import { Formula, InlineMath } from '@/components/Formula';
import { Pullout } from '@/components/Prose';
import { Term } from '@/components/Term';
import { TryIt } from '@/components/TryIt';
import { BuildAResistorDemo } from './demos/BuildAResistor';
import { ColorCodeDecoderDemo } from './demos/ColorCodeDecoder';
import { PowerDeratingDemo } from './demos/PowerDerating';
import { RvsTemperatureDemo } from './demos/RvsTemperature';
import { VariableResistorsDemo } from './demos/VariableResistors';
import { WiedemannFranzDemo } from './demos/WiedemannFranz';
import { getChapter } from './data/chapters';

export default function Ch4HowAResistorWorks() {
  const chapter = getChapter('how-a-resistor-works')!;
  const SOURCES = chapter.sources;

  return (
    <ChapterShell chapter={chapter}>
      <p>
        Pull a 1 kΩ resistor out of a parts kit and hold it up to the light. It's a small ceramic hot-dog with two wire legs and
        four coloured stripes painted on its side. Costs less than a cent in volume. Does, in some sense, exactly nothing — its
        whole job is to <em>oppose</em> the flow of current. And yet you cannot build an electronic anything without it: not
        a flashlight, not an amplifier, not the chip in your phone. There are roughly a hundred of them in a USB charger and
        thousands inside a laptop motherboard.
      </p>
      <p>
        Chapter 3 was about resistance — the physical quantity, the <InlineMath>R = ρL/A</InlineMath> formula, the heat that
        comes out as electrons crash into the lattice. This chapter is about the physical part you can hold in your hand. What's
        inside the body. Why the stripes are coloured that way. Why a 1/4 W resistor can't actually dissipate 1/4 W in your
        attic. Why R isn't even constant — it climbs or drops with temperature, depending on what the body is made of. And the
        whole family of <em>variable</em> resistors: the volume knob, the thermistor in your thermostat, the photoresistor in the
        streetlight. Plus, at the end, a deep cut: why a piece of copper happens to be both the best electrical conductor
        <em> and</em> the best heat sink on the workbench.
      </p>

      <h2>The component, not the concept</h2>

      <p>
        In Chapter 3 we wrote down the macroscopic geometry rule<Cite id="griffiths-2017" in={SOURCES} />:
      </p>
      <Formula>R = ρ L / A</Formula>
      <p>
        Resistance is resistivity times length over cross-section. For a fixed bit of material that's a relation between three
        numbers, and you can dial any one of them by changing the geometry. A real resistor is a small, mass-produced device
        engineered to land at one specific value of <strong>R</strong>, with one specific tolerance, and to dissipate up to one
        specific amount of power before it catches fire. Everything you read in the rest of this chapter is about how
        manufacturers actually do that.
      </p>
      <p>
        There are two big families. <strong>Fixed-value</strong> resistors — what you find by the thousand in any circuit — come
        as a moulded cylinder of ceramic with a thin film of conducting material wrapped around it (carbon, metal, or metal
        oxide), or as a coil of resistance wire (nichrome, manganin) — a <Term def="A resistor built by coiling high-resistivity alloy wire (nichrome, manganin) around a ceramic former. Bulk construction lets it dissipate tens of watts.">wirewound</Term> resistor. <strong>Variable</strong> resistors — <Term def="A three-terminal resistive track with a sliding wiper contact, used as an adjustable voltage divider or rheostat.">potentiometer</Term>s, rheostats,
        trimmers, thermistors, photoresistors, strain gauges — are the same basic idea, but with one of the geometry parameters
        (or the resistivity itself) set up to change in response to something the user controls.
      </p>

      <h2>What's inside the body</h2>

      <p>
        Crack open a five-cent through-hole resistor and you find a ceramic rod about a millimetre across and a centimetre long,
        with a thin spiral of conductive film deposited on its outer surface. The film is what does the work. The ceramic just
        holds it up and conducts heat out of it. Two wire leads are crimped onto end caps that contact the film, and the whole
        assembly is dipped in a tough protective coating onto which the colour stripes are painted.
      </p>
      <p>
        The films differ in what they're made of. <em>Carbon composition</em> is the oldest type — a slug of pressed
        carbon-graphite powder mixed with binder. Cheap, but noisy and prone to drifting in value with humidity and age; mostly
        obsolete now except in pulse-power applications where its bulk construction is an advantage<Cite id="horowitz-hill-2015" in={SOURCES} />.
        <em> <Term def="A resistor made by vacuum-depositing a thin spiral of pyrolytic carbon onto a ceramic rod. Cheap, reasonably stable, ±5% typical, slightly negative TCR.">Carbon film</Term></em> replaced it in the 1960s: a vacuum-deposited carbon spiral on a ceramic rod, cheap and reasonably
        stable, ±5% <Term def="The manufacturer's guarantee on how close the actual resistance is to the nominal printed value. ±5% means the part lies inside [0.95·R, 1.05·R].">tolerance</Term>, slightly negative <Term def="Temperature coefficient of resistance. The fractional change in R per kelvin of temperature change, usually quoted in parts per million per kelvin (ppm/K).">temperature coefficient (TCR)</Term>. <em><Term def="A resistor made by sputtering a thin nickel-chromium or tantalum-nitride film onto a ceramic substrate, then laser-trimming to value. Tight tolerance (±0.1–1%), very low noise, small positive TCR.">Metal film</Term></em> took over the precision tier in
        the 1970s: a sputtered nickel-chromium or tantalum-nitride film with ±0.1–1% tolerance, very low noise, and a small
        positive TCR. If you reach into a precision analog circuit, almost every fixed resistor is a metal film
        <Cite id="horowitz-hill-2015" in={SOURCES} />.
      </p>
      <p>
        For higher power dissipation, two more families appear. <em>Metal oxide</em> resistors use a film of tin oxide on
        ceramic — rugged, high operating temperature, often rated 1–5 W. <em>Wirewound</em> resistors wind a length of nichrome
        or manganin wire around a ceramic former; the wire's bulk is much greater than a deposited film, so the package can
        dissipate tens of watts before it cooks itself. Nichrome (Ni-Cr alloy) has a usefully low temperature coefficient
        <Cite id="kanthal" in={SOURCES} />; manganin (Cu-Mn-Ni) is engineered to have <em>almost zero</em> TCR over a wide range,
        which makes it the standard alloy for precision current shunts and resistance standards.
      </p>

      <BuildAResistorDemo />

      <p>
        The trade-offs are real but mostly about tolerance, noise, temperature stability, and power. A 1 kΩ carbon film and a
        1 kΩ metal film look identical from a circuit-diagram standpoint — they obey Ohm's law equally. But the metal film will
        be within 0.5% of nominal across decades, with a tenth the noise floor; the carbon-comp version of the same value might
        drift 5% over its first year of use and contribute audible hiss to an audio stage.
      </p>

      <h2>The colour code, and why values aren't arbitrary</h2>

      <p>
        IEC 60062 defines the colour code that lets you read a fixed resistor's value without a meter<Cite id="iec-60062-2016" in={SOURCES} />.
        Four bands is the standard: two digit bands, one multiplier band, one tolerance band — say <em>brown · black · red · gold</em>
        for 1·0 × 10² Ω ±5%, i.e. a 1 kΩ ±5% resistor. Five bands gives a third significant figure: <em>brown · black · black · brown
        · brown</em> reads 1·0·0 × 10¹ Ω ±1%, i.e. a 1.00 kΩ ±1% precision part. A missing tolerance band means ±20%, a relic of the
        carbon-comp era when tolerances that loose were normal.
      </p>

      <ColorCodeDecoderDemo />

      <TryIt
        tag="Try 4.1"
        question={<>Decode the four-band resistor: <em>brown · black · red · gold</em>. What value and tolerance?</>}
        hint="Brown=1, black=0, red=×100, gold=±5%."
        answer={
          <>
            <p>
              First two digit bands read <strong>1·0</strong>; multiplier band (red) is <strong>×10²</strong>;
              tolerance band (gold) is <strong>±5%</strong>.
            </p>
            <Formula>R = 10 × 10² Ω ±5% = <strong>1 kΩ ±5%</strong></Formula>
            <p>
              So the actual resistance is guaranteed to fall in the range [950 Ω, 1050 Ω]<Cite id="iec-60062-2016" in={SOURCES} />.
            </p>
          </>
        }
      />

      <TryIt
        tag="Try 4.2"
        question={<>A resistor is marked &ldquo;10 kΩ ±5%&rdquo;. What range of actual resistance values is the manufacturer guaranteeing?</>}
        answer={
          <>
            <p>
              ±5% of 10 kΩ is ±500 Ω, so the actual R lies anywhere in the band
              <strong> [9.5 kΩ, 10.5 kΩ]</strong>. The part is guaranteed not to fall outside that band at the time of manufacture
              and (within the datasheet's stated drift) over its working life<Cite id="horowitz-hill-2015" in={SOURCES} />.
            </p>
            <p>
              <strong>Range: 9.5 kΩ to 10.5 kΩ.</strong>
            </p>
          </>
        }
      />

      <p>
        Resistor values are not arbitrary numbers. They follow a geometric series chosen so that consecutive values are spaced
        by a fixed ratio. The E12 series — used for ±10% parts — has twelve values per decade, spaced by the twelfth root of 10
        (≈1.21): 10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82. E24 doubles that for ±5% parts; E96 quadruples it again for ±1%
        metal-film parts. The spacing is logarithmic for a reason — if the manufacturing tolerance is ±10%, two adjacent values
        in the series should not overlap, and a 21% step is the smallest you can pick while guaranteeing that
        <Cite id="horowitz-hill-2015" in={SOURCES} />. That's why you can buy 47 kΩ and 56 kΩ but not 50 kΩ off the shelf.
      </p>

      <h2>Power, heat, and why ratings derate</h2>

      <p>
        When current <strong>I</strong> flows through a resistor of value <strong>R</strong>, power is dissipated at the
        rate<Cite id="griffiths-2017" in={SOURCES} />:
      </p>
      <Formula>P = I² R = V² / R</Formula>
      <p>
        That power becomes heat inside the resistor body. The body has to dump that heat into the surrounding air, mostly by
        natural convection, before its internal temperature climbs past the safe limit (around <strong>155 °C</strong> for a
        typical film resistor). A 1/4 W axial resistor running at its rated 1/4 W in 25 °C still air comes to a steady-state
        surface temperature of roughly 150 °C — uncomfortably hot, but inside the limit<Cite id="horowitz-hill-2015" in={SOURCES} />.
        Put that same resistor in a 70 °C enclosure and it has 80 °C less thermal headroom, so the manufacturer derates the
        allowed dissipation to keep the body under the limit.
      </p>

      <PowerDeratingDemo />

      <TryIt
        tag="Try 4.3"
        question={<>You connect a 1/4 W resistor directly across a 5 V supply. What is the <em>minimum</em> R that keeps the power dissipation at or below its rating?</>}
        hint="Use P = V² / R, then set P_max = 0.25 W and solve for R."
        answer={
          <>
            <Formula>P = V² / R &nbsp;⇒&nbsp; R ≥ V² / P<sub>max</sub></Formula>
            <p>
              Plug in <strong>V = 5 V</strong>, <strong>P<sub>max</sub> = 0.25 W</strong>:
            </p>
            <Formula>R ≥ (5)² / 0.25 = <strong>100 Ω</strong></Formula>
            <p>
              Any smaller R draws more than 1/4 W and the part overheats<Cite id="horowitz-hill-2015" in={SOURCES} />.
              In practice you would derate further if the resistor sits in a warm enclosure.
            </p>
          </>
        }
      />

      <TryIt
        tag="Try 4.4"
        question={<>What is the resistance of 50 cm of #30 AWG nichrome wire? (Take ρ<sub>nichrome</sub> ≈ 1.1×10⁻⁶ Ω·m; cross-section A ≈ 0.0507 mm².)</>}
        hint="R = ρL/A. Watch the unit conversions on A."
        answer={
          <>
            <Formula>R = ρ L / A</Formula>
            <p>
              Convert: <strong>L = 0.50 m</strong>, <strong>A = 0.0507 mm² = 5.07×10⁻⁸ m²</strong>,
              <strong> ρ = 1.1×10⁻⁶ Ω·m</strong><Cite id="kanthal" in={SOURCES} />.
            </p>
            <Formula>R = (1.1×10⁻⁶)(0.50) / (5.07×10⁻⁸) ≈ <strong>10.8 Ω</strong></Formula>
            <p>
              A common Joule-heating geometry: half a metre of #30 nichrome carrying a few amps from a low-voltage supply
              is roughly what you need to make a glowing wire cutter.
            </p>
          </>
        }
      />

      <p>
        The derating curve is part of every resistor datasheet. For most film resistors the allowed dissipation is 100% of
        rated up to about 70 °C ambient, then falls linearly to zero at the maximum body temperature (~155 °C). What that means
        in practice: a 1/4 W resistor inside a sealed enclosure that runs at 80 °C ambient is effectively a 1/5 W resistor.
        Ignore the derating and the brown coating chars, the colour bands go black, smoke escapes, and the part fails open. (If
        you've ever burned a resistor in a breadboard experiment, this was the cause.) The fix is either a beefier package, a
        heat sink (power resistors come with metal tabs for exactly this), or a different topology that splits the dissipation
        across several parts.
      </p>

      <h2>R is not constant: temperature coefficient</h2>

      <p>
        The resistivity ρ that goes into <em>R = ρL/A</em> is itself a function of temperature. <Term def="The empirical statement that the resistivity of a metal can be decomposed additively into a temperature-independent impurity/defect term and a temperature-dependent phonon-scattering term: ρ(T) = ρ_residual + ρ_phonon(T).">Matthiessen's rule</Term>, formulated in 1864, observed
        that for pure metals the resistivity decomposes additively<Cite id="matthiessen-1864" in={SOURCES} />:
      </p>
      <Formula>ρ(T) = ρ<sub>residual</sub> + ρ<sub>phonon</sub>(T)</Formula>
      <p>
        The first term is the temperature-independent scattering off impurities and lattice defects. The second comes from
        scattering off phonons — quantized lattice vibrations whose amplitude grows with temperature. Well above the Debye
        temperature, <strong>ρ<sub>phonon</sub></strong> is linear in T, giving the familiar straight-line plot of resistance
        versus temperature for an unalloyed metal<Cite id="ashcroft-mermin-1976" in={SOURCES} />. The slope is the
        <em> temperature coefficient of resistance</em>, or TCR, usually quoted in parts per million per kelvin.
      </p>
      <p>
        For copper, TCR ≈ +3900 ppm/K — a copper wire's resistance climbs by about 0.4% per kelvin near room temperature. For
        pure tungsten the slope is steeper, around +4500 ppm/K, and the dynamic range is enormous: a tungsten incandescent
        filament at 2700 K has roughly ten times the resistance of the same filament at room temperature. That's why an
        incandescent bulb at switch-on draws ~10× its steady-state current for the few milliseconds before the filament heats
        up — the famous <em>inrush</em>. Alloy films (nichrome, manganin) are engineered for nearly zero TCR — manganin's was
        the original reason for its existence as the alloy of the bench-standard resistor box<Cite id="kanthal" in={SOURCES} />.
      </p>
      <p>
        Carbon-film resistors go the other way: TCR is small and slightly <em>negative</em> (≈ −200 to −500 ppm/K). And at the
        extreme end of the spectrum sit thermistors and PTC polyswitches, engineered to have <em>large</em> TCRs on purpose. A
        <Term def="Negative-temperature-coefficient thermistor: a semiconducting metal-oxide bead whose resistance drops sharply (factor of ~2 per 25 °C) as temperature rises. The standard temperature sensor in CPU sockets, battery packs, and thermostats.">negative-temperature-coefficient (NTC)</Term> thermistor uses a semiconducting metal oxide whose carrier population grows
        exponentially with temperature — the resistance drops by a factor of two for every ~25 °C rise in the practical range.
        The Steinhart–Hart relation gives the engineering form<Cite id="steinhart-hart-1968" in={SOURCES} />:
      </p>
      <Formula>1 / T = A + B · ln R + C · (ln R)³</Formula>
      <p>
        with material-specific constants A, B, C. NTCs are how every electronics enclosure measures its own temperature: read
        R, plug into Steinhart–Hart, get T.
      </p>

      <RvsTemperatureDemo />

      <p>
        <Term def="Positive-temperature-coefficient device: a resistor whose R rises sharply with temperature, used as a self-resetting fuse. PTC polymer thermistors trip via a crystalline-to-amorphous transition in the polymer matrix.">Positive-temperature-coefficient (PTC)</Term> devices come in two flavours. PTC polymer thermistors (polyswitches, sold under the
        trade name PolySwitch) sit at a low fixed resistance until current heats them past a trip point, at which point a
        crystalline-to-amorphous transition in the polymer matrix sends R up by a factor of 1000 in milliseconds. Used as
        self-resetting fuses in USB ports, automotive electronics, and laptop battery packs. Ceramic PTCs based on
        barium-titanate variants do the same thing at higher voltages, with sharper trip behaviour.
      </p>

      <h2>The variable cousins</h2>

      <p>
        Every resistor we've discussed has a fixed R set at the factory. But for a great deal of everyday electronics, you want
        R to change on demand: the volume knob on a stereo, the gas pedal in a car, the joystick on a controller, the dimmer
        on a lamp. The simplest way to do it is a <em>potentiometer</em> — a resistive track with a sliding contact (the
        <em> wiper</em>) that moves along it<Cite id="horowitz-hill-2015" in={SOURCES} />.
      </p>

      <VariableResistorsDemo />

      <p>
        A pot has three terminals: the two ends of the resistive track (A and B), and the wiper (W). Treat it as two resistors
        in series, with <strong>R<sub>AW</sub> + R<sub>WB</sub> = R<sub>total</sub></strong>. Wire all three terminals as a
        voltage divider and the wiper sweeps an output voltage from 0 to V_in. Wire only two — say A and W — and you have a
        <em> rheostat</em>: a variable two-terminal resistor, useful for current limiting. A small fixed-position trimmer (or
        <em> trimpot</em>) is what calibrates the gain of a precision op-amp circuit; you set it once with a screwdriver and
        forget it.
      </p>
      <p>
        The other variable cousins change R in response to a physical input. <em>Thermistors</em> — both NTC and PTC — are
        resistors whose ρ depends strongly on temperature (above). <em><Term def="Photoresistor / light-dependent resistor. A semiconductor film (classically cadmium sulfide) whose resistance drops by orders of magnitude when illuminated, as photons promote electrons across the bandgap.">Photoresistors</Term></em>, also called LDRs, are typically a
        thin film of cadmium sulfide: in the dark CdS has very few free carriers and its resistance is in the megohms; in
        bright light photons promote electrons across the bandgap and R drops to a few hundred ohms. The dynamic range is
        about four orders of magnitude. <em>Strain gauges</em> are very thin metal foils glued to the surface whose strain you
        want to measure: stretching the foil narrows its cross-section and slightly increases its resistance via the
        <em> R = ρL/A</em> geometry, by a factor of ~2 of the strain itself. Every kitchen scale, bathroom scale, and tensile
        testing machine on Earth uses one.
      </p>

      <h2>The deep cut: Wiedemann–Franz</h2>

      <p>
        Here is a thing that turns out to be deep. The metals with the lowest electrical resistivity — copper, silver, gold,
        aluminium — are also the metals with the highest <em>thermal</em> conductivity. Choose a wire material to carry current
        and you have also, accidentally, chosen the best heat-sink. Why?
      </p>
      <p>
        Gustav Wiedemann and Rudolph Franz, in 1853, measured both κ (thermal conductivity, W/m·K) and σ (electrical
        conductivity, S/m) for a panel of metals at room temperature and observed that their ratio was the same constant for
        all of them — the <Term def="κ/σ = L₀·T. In a metal, both heat and electrical current are carried by the same gas of free electrons, so the ratio of thermal to electrical conductivity is a universal constant (the Lorenz number) times absolute temperature.">Wiedemann–Franz law</Term><Cite id="wiedemann-franz-1853" in={SOURCES} />. Ludvig Lorenz extended the result two decades later by
        showing the ratio scales as <strong>L₀·T</strong>, with L₀ called the <Term def="The universal proportionality constant in the Wiedemann–Franz law, L₀ ≈ 2.44×10⁻⁸ W·Ω·K⁻². Sommerfeld derived it from the free-electron model as L₀ = (π²/3)(k_B/e)².">Lorenz number</Term>:
      </p>
      <Formula>κ / σ = L<sub>0</sub> · T</Formula>
      <p>
        with <strong>L₀ ≈ 2.44×10⁻⁸ W·Ω·K⁻²</strong>. Sommerfeld derived L₀ exactly from the free-electron model in 1928:
        L₀ = (π²/3)(k<sub>B</sub>/e)² with k<sub>B</sub> the Boltzmann constant and e the elementary charge
        <Cite id="codata-2018" in={SOURCES} /><Cite id="ashcroft-mermin-1976" in={SOURCES} />.
      </p>

      <WiedemannFranzDemo />

      <TryIt
        tag="Try 4.5"
        question={<>Use the Wiedemann–Franz law to predict the ratio <strong>κ/σ</strong> for copper at room temperature (T = 300 K). Take L₀ = 2.44×10⁻⁸ W·Ω·K⁻².</>}
        hint="κ/σ = L₀·T. The answer has units of W·Ω/K (= V²/K)."
        answer={
          <>
            <Formula>κ / σ = L<sub>0</sub> · T = (2.44×10⁻⁸ W·Ω·K⁻²)(300 K)</Formula>
            <Formula>κ / σ ≈ <strong>7.32×10⁻⁶ W·Ω·K⁻¹</strong></Formula>
            <p>
              Plugging copper's measured σ ≈ 5.96×10⁷ S/m gives κ ≈ 436 W/m·K, within a few percent of the
              tabulated value (~400 W/m·K)<Cite id="ashcroft-mermin-1976" in={SOURCES} />. The same gas of electrons doing
              both jobs.
            </p>
          </>
        }
      />

      <p>
        The physics is one sentence. In a metal, the same gas of free electrons carries both the electrical current (drifting
        in an applied E field) and the heat current (diffusing down a temperature gradient). Both transport coefficients are
        proportional to <strong>n·τ/m</strong>, where n is the electron density, τ is the mean time between scattering events,
        and m is the electron mass. The ratio cancels the electron-system properties and leaves only fundamental constants
        times T<Cite id="ashcroft-mermin-1976" in={SOURCES} />. The same charge carriers, doing two jobs in parallel; the
        Wiedemann–Franz constant is the conversion factor between them.
      </p>

      <Pullout>
        A metal's free electrons carry the current and the heat. Same gas, two jobs.
      </Pullout>

      <p>
        Wiedemann–Franz is one of the cleanest free-electron-model results, and it holds for the simple metals (Cu, Ag, Au, Al)
        to within a few percent at room temperature. Transition metals like iron show modest deviations — additional scattering
        channels through the d-band contribute to κ and σ differently — and at very low temperatures, where impurity scattering
        dominates electrical conduction but inelastic phonon scattering still degrades thermal conduction, the relation can
        fail by larger factors. But near room temperature, for the materials you actually use in everyday wiring, the rule
        of thumb is reliable: the wire with the lowest resistivity is also the wire with the highest thermal conductivity. Copper
        bus bars carry current and remove its dissipation; the same physics is doing both.
      </p>

      <h2>What we have so far</h2>

      <p>
        A real resistor is a ceramic cylinder with a film of carbon, metal, or metal oxide wrapped around it — or, for high
        power, a coil of nichrome or manganin wire. <em>R = ρL/A</em> sets the value; the colour bands report it to two or
        three significant figures plus a tolerance. The body has a power rating, which derates above ~70 °C ambient because
        the heat has to leave the package somehow. R is itself a function of T: positive and steep for pure metals,
        near-zero for nichrome and manganin, large and negative for NTC thermistors, sharply positive at the trip point of a
        PTC polyswitch. Pots, thermistors, photoresistors, and strain gauges complete the family — each one is a fixed
        resistor with one of its parameters left adjustable. And the Wiedemann–Franz law tells you, as a side benefit, why
        every wire material that's good at current is also good at heat.
      </p>
      <p>
        Next chapter: leave the wire altogether. Two metal plates with a gap between them store charge — not in the metal, but
        in the field across the gap. The capacitor.
      </p>

      <CaseStudies
        intro={
          <>
            Four places where the resistor — film, wirewound, NTC, or LDR — does its job in a working system.
          </>
        }
      >
        <CaseStudy
          tag="Case 4.1"
          title="Kelvin-connected current shunt in a clip-on ammeter"
          summary="A 0.001 Ω, 100 A four-terminal shunt drops 0.1 V at full scale; the meter reads the millivolt across the inner pair of leads."
          specs={[
            { label: 'Shunt resistance', value: <>0.5–100 mΩ, ±1% <Cite id="vishay-csm-shunt" in={SOURCES} /></> },
            { label: 'Material', value: <>manganin or Cu-Mn-Sn metal strip <Cite id="kanthal" in={SOURCES} /></> },
            { label: 'Full-scale drop', value: <>50–100 mV typical</> },
            { label: 'Topology', value: <>four-terminal (Kelvin) connection <Cite id="vishay-csm-shunt" in={SOURCES} /></> },
          ]}
        >
          <p>
            How do you measure 100 amps in a wire without inserting a thick brick of meter into the circuit? You put a small
            precision resistor in series — say <strong>1 mΩ</strong> — and measure the voltage across it. At 100 A the
            drop is 100 mV, easily read with a precision differential amplifier and an ADC. <strong>P = I² R = 10 W</strong>
            is the heat the shunt has to dump, which is why such parts are built as thick metal strips in surface-mount
            packages with large copper tabs for heatsinking<Cite id="vishay-csm-shunt" in={SOURCES} />.
          </p>
          <p>
            The trick is the four-terminal "Kelvin" connection. The high-current path uses one pair of contacts on the outside
            of the strip; the voltage sense uses a separate pair on the inside, where the current density is uniform and the
            contact resistance is irrelevant. Without the four-wire trick, milliohms of lead and solder-joint resistance —
            comparable to the shunt itself — would corrupt the reading. With it, the measurement is essentially independent of
            the high-current connections. The same Kelvin connection appears in every benchtop digital multimeter's low-Ω
            range and in every laboratory four-wire resistance-measurement procedure<Cite id="horowitz-hill-2015" in={SOURCES} />.
          </p>
          <p>
            The alloy choice is part of the engineering too. Manganin's TCR is engineered to be near zero around room
            temperature, so a 1 mΩ shunt stays within ±0.01% of value as it heats up under load — without that, a 10 W power
            dissipation would warm the strip enough to shift the reading by a percent or more.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 4.2"
          title="NTC thermistor on a CPU package"
          summary="A 10 kΩ NTC bead drops to a few hundred ohms by 100 °C; the BIOS reads it as a voltage divider and throttles the cores."
          specs={[
            { label: 'Nominal R at 25 °C', value: <>10 kΩ ±1%</> },
            { label: 'B-constant', value: <>~3950 K <Cite id="steinhart-hart-1968" in={SOURCES} /></> },
            { label: 'R at 100 °C', value: <>~680 Ω (Steinhart–Hart)</> },
            { label: 'Use', value: <>BIOS thermal-throttle / shutdown reference</> },
          ]}
        >
          <p>
            Every modern CPU package carries at least one on-die diode temperature sensor and, often, an external NTC
            thermistor on the motherboard near the socket. The NTC is a tiny bead of sintered nickel-manganese-cobalt oxide; at
            25 °C it has a nominal resistance around 10 kΩ, with a temperature coefficient steep enough that R drops to
            ~680 Ω by 100 °C. Plug it into the Steinhart–Hart equation
            <em> 1/T = A + B·ln(R) + C·(ln R)³ </em>and you recover T to within a kelvin or so<Cite id="steinhart-hart-1968" in={SOURCES} />.
          </p>
          <p>
            Mechanically the thermistor sits in a voltage-divider with a 10 kΩ fixed resistor across a stable 3.3 V rail; the
            divider's midpoint feeds an ADC channel that the BIOS samples a few times per second. When the reading crosses
            the throttle threshold (~95 °C on a typical desktop CPU) the firmware drops the multiplier; at ~105 °C it shuts
            the system down. The same circuit, with different fixed values, runs the fans in your power supply, the
            temperature-compensated bias in your old guitar amp, and the over-temperature lockout in lithium-ion battery
            packs<Cite id="horowitz-hill-2015" in={SOURCES} />.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 4.3"
          title="Streetlight photoresistor"
          summary="A CdS cell switches a relay between dusk-on and dawn-off; resistance swings four orders of magnitude across the diurnal cycle."
          specs={[
            { label: 'R at < 1 lux (night)', value: <>~1 MΩ</> },
            { label: 'R at 10000 lux (sun)', value: <>~200 Ω</> },
            { label: 'Mechanism', value: <>CdS bandgap (~2.4 eV) photoexcitation</> },
            { label: 'Note', value: <>Cd-based LDRs are restricted under EU RoHS; modern alternatives use silicon photodiodes <Cite id="horowitz-hill-2015" in={SOURCES} /></> },
          ]}
        >
          <p>
            A streetlamp that comes on at dusk and goes off at dawn is, electrically, a relay whose coil is controlled by a
            voltage divider whose lower leg is a cadmium-sulfide photoresistor. In daylight the CdS film conducts well —
            a few hundred ohms — pulling the divider node low and keeping the relay open. As the ambient illuminance falls
            through dusk, R climbs through tens of kΩ to megohms; the divider node rises, a Schmitt-trigger comparator flips,
            the relay closes, and the lamp lights. The huge dynamic range (~four decades) is exactly what makes the LDR
            ideal for this job — no precision amplification needed, just a comparator with hysteresis to prevent flickering
            at the threshold.
          </p>
          <p>
            CdS itself works because the photon energy in visible light (1.8–3.1 eV) is greater than the CdS bandgap (~2.4 eV),
            so each absorbed photon promotes one valence electron into the conduction band, increasing the free-carrier
            density and lowering ρ. Practical CdS cells have been phased out in the EU under the RoHS directive since 2006
            because of cadmium toxicity; modern dusk-to-dawn switches use a small silicon photodiode and an op-amp instead,
            but the principle is identical<Cite id="horowitz-hill-2015" in={SOURCES} />.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 4.4"
          title="Vishay Z-foil precision reference resistor"
          summary="A bulk-metal foil resistor sits at ±0.005% tolerance and 0.05 ppm/°C TCR — the laboratory gold standard for voltage references."
          specs={[
            { label: 'Tolerance', value: <>down to ±0.005% <Cite id="vishay-z-foil" in={SOURCES} /></> },
            { label: 'TCR', value: <>≤ ±0.05 ppm/°C <Cite id="vishay-z-foil" in={SOURCES} /></> },
            { label: 'Construction', value: <>nichrome foil cemented to ceramic substrate, photo-etched to value <Cite id="vishay-z-foil" in={SOURCES} /></> },
            { label: 'Typical use', value: <>laboratory voltage references, automated test equipment, calibration standards</> },
          ]}
        >
          <p>
            The most precise resistors built today are not films or wirewound, but thick "Bulk Metal Z-Foil" parts: a
            chromium-doped nickel alloy foil cemented to a ceramic substrate and photo-etched into a serpentine pattern. The
            chromium content is tuned to balance the foil's own thermal-expansion coefficient against the ceramic substrate's,
            so that mechanical strain — which would otherwise change R through the strain-gauge effect — almost cancels out
            of the temperature coefficient. The result is a fixed resistor with TCR ≤ <strong>0.05 ppm/°C</strong> and
            absolute tolerance ≤ <strong>0.005%</strong><Cite id="vishay-z-foil" in={SOURCES} />.
          </p>
          <p>
            That is more than four orders of magnitude better than a hobby-grade carbon-film resistor and an order of magnitude
            better than ordinary thin-film precision parts. Z-foil resistors are how laboratory voltage references stay stable
            to a part-per-million over years, how automated test equipment maintains its calibration between visits to the
            standards lab, and how 8½-digit digital multimeters earn their last few digits of meaningful resolution. They
            are the modern descendants of the manganin standard-resistance boxes of the 1920s — same job, same physics
            (low-TCR alloy), refined manufacturing<Cite id="horowitz-hill-2015" in={SOURCES} />.
          </p>
        </CaseStudy>
      </CaseStudies>

      <FAQ
        intro="Loose threads — the questions a careful reader tends to surface after going through this chapter."
      >
        <FAQItem q="Why are carbon-composition resistors noisier than metal-film?">
          <p>
            A carbon-comp resistor is a slug of granular carbon-graphite pressed in binder. Current threads its way through a
            granular landscape of contact points, each one a fluctuating microscopic Schottky-like junction whose effective
            resistance jitters in time. The cumulative effect is excess "current noise" — voltage fluctuations across the
            resistor that scale with the current flowing through it. A sputtered metal film is a single continuous polycrystalline
            layer with no such granular contacts, and its noise is essentially just Johnson–Nyquist (thermal) noise at the
            <strong> √(4 k<sub>B</sub> T R Δf) </strong> floor<Cite id="horowitz-hill-2015" in={SOURCES} />. For audio and
            instrumentation circuits the difference matters; for a current-limiting resistor in an LED indicator it does not.
          </p>
        </FAQItem>

        <FAQItem q="Why does an old carbon-comp resistor drift in value after years?">
          <p>
            Three reasons. (1) Moisture absorption: the binder is mildly hygroscopic, and changes in humidity swell or shrink
            the slug enough to shift R by a percent or two. (2) Oxidation at the grain boundaries: long-term exposure to air
            slowly oxidises the carbon-graphite contacts, raising the value. (3) Thermal cycling: every time the resistor heats
            up and cools down, slight mechanical relaxations in the binder change the contact pressure between grains. All
            three are absent from a vacuum-deposited metal film, which is one reason carbon comps are obsolete except where
            their bulk lets them survive a single huge pulse better than a thin film can<Cite id="horowitz-hill-2015" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What does tolerance mean physically, and how is it measured?">
          <p>
            Tolerance is the manufacturer's guarantee on how close the part is to the nominal value printed on it. ±5% means
            the actual R is somewhere in the band [0.95·R, 1.05·R]; ±0.1% means [0.999·R, 1.001·R]. Modern resistors achieve
            their tolerance by being deliberately manufactured slightly over-value and then <em>trimmed</em> down — a laser
            or an abrasive removes material in a controlled spiral or notch until a meter on the production line reads the
            target value. The remaining error is set by the meter's precision and the smallest controllable trim step
            <Cite id="horowitz-hill-2015" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why are values like 47 kΩ and 56 kΩ, but never 50 kΩ?">
          <p>
            Because the catalogue is logarithmic. The E12 series (used for ±10% parts) has 12 values per decade, geometrically
            spaced by the twelfth root of 10 (~1.21): 10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82. E24 doubles that for
            ±5% parts. E96 quadruples it for ±1% parts. The geometric spacing is chosen so that the tolerance bands of
            adjacent values just barely meet — a logarithmic, not linear, packing of the value space. "50 kΩ" falls in the gap
            between 47 kΩ and 56 kΩ, neither of which steps on its territory at ±10%<Cite id="horowitz-hill-2015" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why does a 1/4 W resistor need to be derated above 70 °C?">
          <p>
            The rated 1/4 W is the dissipation at which the resistor's surface temperature reaches its internal limit
            (~155 °C) in a 25 °C ambient with natural convection. Drop the ambient by 25 °C and you have an extra 25 K of
            headroom; raise it by 70 °C and you have far less. At a 155 °C ambient, the part has no headroom at all — it would
            sit at its limit even with zero dissipation. Manufacturers publish a linear derating curve to capture this: 100%
            of rated power up to ~70 °C ambient, falling linearly to 0% at 155 °C<Cite id="horowitz-hill-2015" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What's the difference between a fixed resistor and a current-limiting resistor in an LED circuit?">
          <p>
            They're the same component used in two different roles. In a precision divider, a fixed resistor sets a voltage
            ratio. In an LED current-limit, the same kind of fixed resistor sits in series with the LED to drop the difference
            between the supply voltage and the LED's forward voltage, while limiting current via Ohm's law:
            <strong> R = (V<sub>supply</sub> − V<sub>LED</sub>) / I<sub>LED</sub></strong>. For a 5 V supply, a red LED at
            ~2.0 V forward, and a target 20 mA, R = 150 Ω; the resistor dissipates I²R = 60 mW, comfortable for a 1/4 W
            part<Cite id="horowitz-hill-2015" in={SOURCES} />. Nothing about the resistor itself knows it's "current limiting" —
            that's a role the circuit assigns it.
          </p>
        </FAQItem>

        <FAQItem q="Why do precision references use manganin or nichrome instead of copper?">
          <p>
            Because copper's TCR is huge for a precision part. A 100 Ω copper resistor would drift by 0.4% per kelvin near room
            temperature, which over a 30 K lab swing is 12% — useless as a reference. Manganin is an engineered alloy
            (≈86% Cu, 12% Mn, 2% Ni) tuned so its TCR is approximately zero around 20 °C; the alloy was developed in the
            1880s specifically for resistance standards and bridge work<Cite id="kanthal" in={SOURCES} />. Nichrome similarly
            has TCR ~10× smaller than copper, which is one reason it's the alloy of choice for wirewound resistors as well
            as heating elements.
          </p>
        </FAQItem>

        <FAQItem q="Why does the inrush current of an incandescent bulb light up the wire so fiercely?">
          <p>
            Tungsten's TCR is large and positive: the filament at room temperature has roughly one tenth the resistance of the
            same filament at its operating temperature (~2700 K)<Cite id="ashcroft-mermin-1976" in={SOURCES} />. So at the
            instant the switch closes, with the filament still cold, the current is roughly ten times its steady-state value —
            for a 60 W, 120 V bulb that's about 5 A peak versus 0.5 A steady. The filament heats in tens of milliseconds, R
            climbs, current falls to its operating value. The high inrush is what makes incandescent bulbs so prone to
            burning out at switch-on rather than mid-life: the cold-filament I²R pulse stresses the thinnest point.
          </p>
        </FAQItem>

        <FAQItem q="Are SMD chip resistors made of the same material as through-hole carbon film?">
          <p>
            No. Modern surface-mount chip resistors (0402, 0603, 0805, etc.) are <em>thick-film</em> or <em>thin-film</em>
            constructions on a small alumina substrate. Thick-film parts are a paste of conductive ruthenium oxide screen-printed
            onto the substrate and fired in a kiln, then laser-trimmed to value; cheap, robust, but TCR of order ±200 ppm/°C
            and tolerance only ±1% best case. Thin-film parts are a sputtered nichrome-or-similar layer, laser-trimmed; better
            tolerance (±0.05%) and lower TCR (±25 ppm/°C), at higher cost<Cite id="horowitz-hill-2015" in={SOURCES} />. Both are
            metal-based; the carbon-film cylinder is a separate, older technology that survives mostly in through-hole
            packages for hobbyists and legacy designs.
          </p>
        </FAQItem>

        <FAQItem q="Why is the ohm labeled Ω and not 'R'?">
          <p>
            Ω is the capital Greek letter omega, used since the late 19th century as the symbol for the unit ohm — chosen to
            stand for the "O" of "Ohm" without colliding with the letter O. R is the symbol for the physical quantity
            <em> resistance</em>: a property of a specific resistor. So you say "this resistor has resistance R = 47 Ω": the
            quantity is R, the unit is Ω, just like distance d = 5 m has quantity-symbol d and unit-symbol m. The SI committee
            formalised the convention in the 1960s but it had been universal in the technical literature for decades before
            that.
          </p>
        </FAQItem>

        <FAQItem q="Why does a power resistor have a heat-sink tab?">
          <p>
            Because natural convection alone can't move enough heat out of a small package once you go past about a watt of
            dissipation. The heat-sink tab brings the resistor's hot side into intimate thermal contact with a metal chassis
            or a finned aluminium block, dropping the thermal resistance from junction to ambient from tens of K/W (still air)
            to a few K/W (heatsink). That same 1/4 W resistor would survive 5–10 W if you bolted it to a sheet of aluminium —
            but only the wirewound and metal-oxide families have packages designed to permit that<Cite id="horowitz-hill-2015" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Can you put resistors in series to get a higher power rating?">
          <p>
            Yes, and the total dissipation budget is the sum of the individual budgets. Two 1/4 W resistors in series, each
            half the target R, dissipate half the power each — so the combination handles 1/2 W. The same idea works in
            parallel: two 2 kΩ at 1/4 W in parallel make a 1 kΩ at 1/2 W. The cost is board area and tolerance stack-up
            (errors don't quite cancel). For one-off prototypes it's standard practice; for mass production you specify the
            right wattage in the first place.
          </p>
        </FAQItem>

        <FAQItem q="How does a potentiometer actually divide voltage?">
          <p>
            A pot is two resistors in series whose junction is the wiper. Apply V_in across the two end terminals (A and B):
            current I = V_in / R_total flows through the whole track. The voltage from the wiper W to terminal B is
            <strong> V<sub>WB</sub> = I · R<sub>WB</sub> = V<sub>in</sub> · (R<sub>WB</sub> / R<sub>total</sub>)</strong>. As
            the wiper slides from B toward A, that ratio sweeps from 0 to 1. So a 10 kΩ pot wired as a voltage divider produces
            any output voltage between 0 and V_in continuously, with the same loading characteristics as a 10 kΩ source
            impedance<Cite id="horowitz-hill-2015" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What's a Kelvin connection and why does precision current sensing need four wires?">
          <p>
            A Kelvin connection separates the current-carrying path from the voltage-sensing path. A precision current shunt
            has four terminals: two thick ones (called force or current terminals) at the outside of the resistive strip, and
            two thinner ones (sense terminals) tapped into the strip just inside the force terminals. The high current flows
            through the force pair; the voltage drop is measured across the sense pair. Any resistance in the force-side
            wiring or in the solder joints is simply not in the voltage-measurement loop, so it drops out of the result. For a
            milliohm shunt, where the lead and joint resistance can be comparable to the shunt itself, this is the difference
            between a usable reading and total nonsense<Cite id="vishay-csm-shunt" in={SOURCES} /><Cite id="horowitz-hill-2015" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Are thermistors and RTDs the same thing?">
          <p>
            They're cousins, not twins. Both are temperature-sensitive resistors, but the mechanism differs. An <em>RTD</em>
            (resistance-temperature detector) is a pure-metal element — typically platinum, sometimes nickel — whose
            resistance climbs nearly linearly with T at a TCR of ~3850 ppm/°C (for the standard Pt100, R = 100 Ω at 0 °C).
            Excellent linearity, wide temperature range (−200 to +650 °C), low sensitivity. A <em>thermistor</em> is a
            semiconductor metal-oxide bead with much steeper, distinctly non-linear behaviour — typically 4–5% per kelvin
            negative for NTC types — over a narrower range. Use an RTD when you need accuracy and range; use an NTC thermistor
            when you need cheap, sensitive temperature sensing in the 0–125 °C range, plus the Steinhart–Hart linearisation
            in firmware<Cite id="steinhart-hart-1968" in={SOURCES} /><Cite id="horowitz-hill-2015" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What's the smallest commercially manufactured resistor?">
          <p>
            The 01005 SMD chip is currently the volume-production minimum — 0.4 mm × 0.2 mm, about half the footprint of a
            grain of salt. They are placed by pick-and-place machines too small to grip with tweezers and rework by hand.
            Below that, 008004 (0.25 mm × 0.125 mm) parts exist for specialist applications but are very rare. The internal
            architecture is the same as a 0603 chip: a thick-film or thin-film resistive layer on a tiny alumina substrate,
            laser-trimmed to value and metallised at each end for SMD assembly<Cite id="horowitz-hill-2015" in={SOURCES} />.
            Mass-wise, an 01005 resistor weighs roughly 80 micrograms.
          </p>
        </FAQItem>

        <FAQItem q="Why is a metal that conducts electricity well also a good heat conductor?">
          <p>
            Because in a metal, both currents — charge and heat — are carried by the same gas of free conduction electrons.
            Electrical conductivity σ scales as <strong>n·e²·τ/m</strong> (Drude); thermal conductivity κ scales as
            <strong> n·k<sub>B</sub>²·T·τ/m</strong> (up to a factor of π²/3 in the Sommerfeld theory). The ratio
            <strong> κ/σ</strong> cancels n and τ, leaving <strong>L<sub>0</sub>·T</strong> with
            <strong> L<sub>0</sub> = (π²/3)(k<sub>B</sub>/e)² ≈ 2.44×10⁻⁸ W·Ω·K⁻²</strong> — the Wiedemann–Franz law
            <Cite id="wiedemann-franz-1853" in={SOURCES} /><Cite id="ashcroft-mermin-1976" in={SOURCES} />. So choosing the
            best electrical conductor (copper, silver) also chooses the best thermal conductor — same electrons doing both
            jobs.
          </p>
        </FAQItem>

        <FAQItem q="Can a resistor be made too small to dissipate any meaningful power?">
          <p>
            Yes, and that's the whole story of miniaturisation. An 01005 chip resistor is rated for about 31 mW — 1/32 W —
            in a 70 °C ambient. The on-chip polysilicon resistors inside an integrated circuit dissipate microwatts at most,
            because they only see microamps of signal current. Below that, single-molecule "resistors" in molecular electronics
            handle femtowatts. None of this is a problem in modern circuit design, because the currents in modern
            low-voltage digital and signal-path electronics are themselves microamps to milliamps. A resistor only needs to
            be big enough to dump the heat its own design current produces<Cite id="horowitz-hill-2015" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why do high-power resistors get hot but a Joule heater is just a 'very hot resistor'?">
          <p>
            They are the same thing under different design constraints. A "resistor" is a component where heat is the unwanted
            by-product of an electrical task (dropping a voltage, sensing a current, fixing a divider ratio). A "Joule heater"
            is a component where heat is the entire point — toasters, ovens, electric blankets, hair dryers — and the
            element is engineered to operate red-hot or even glowing without failing. The materials overlap (nichrome is the
            workhorse alloy for both), but a 25 W wirewound resistor is rated to its limit at 25 W, while a 1.5 kW toaster
            element is rated to glow at 1.5 kW for years<Cite id="kanthal" in={SOURCES} />. The difference is geometry,
            mounting, and intended operating temperature — not the underlying physics.
          </p>
        </FAQItem>
      </FAQ>
    </ChapterShell>
  );
}
