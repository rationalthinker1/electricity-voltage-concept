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
import { Cite } from '@/components/SourcesList';
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
      <p className="math">J = σ E</p>
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
      <p className="math">V = I R</p>
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
      <p className="math">R = L / (σ A) = ρ L / A</p>
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
      <p className="math">p<sub>v</sub> = J · E = σ E²</p>
      <p>
        Always positive in a resistor (J and E point the same way). Integrate over the wire's volume <strong>LA</strong>,
        with E = V/L throughout, and the macroscopic power drops out:
      </p>
      <p className="math">P = σ A V² / L = V² / R = V I = I² R</p>
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
      <p className="math">R<sub>series</sub> = R₁ + R₂</p>
      <p>
        Put them in <strong>parallel</strong> — two branches at the same voltage <em>V</em> — and the currents add:
        <em> I = V/R₁ + V/R₂ = V(1/R₁ + 1/R₂)</em>, so the reciprocals combine:
      </p>
      <p className="math">1 / R<sub>parallel</sub> = 1/R₁ + 1/R₂</p>
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
    </ChapterShell>
  );
}
