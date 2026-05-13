/**
 * Chapter 2 — Voltage and current
 *
 * The first floor up from charge and field. Built around four embedded demos:
 *   2.1 Voltage as height — gravity analogy for ΔV
 *   2.2 Drift velocity — electrons crawling through copper
 *   2.3 Two speeds — drift vs signal in the same wire
 *   2.4 Switch and bulb — what actually lights the bulb
 *
 * Every numerical claim is cited inline against chapter.sources.
 */
import { ChapterShell } from '@/components/ChapterShell';
import { FAQ, FAQItem } from '@/components/FAQ';
import { Cite } from '@/components/SourcesList';
import { Formula } from '@/components/Formula';
import { DriftVelocityDemo } from './demos/DriftVelocity';
import { SwitchAndBulbDemo } from './demos/SwitchAndBulb';
import { TwoSpeedsDemo } from './demos/TwoSpeeds';
import { VoltageAsHeightDemo } from './demos/VoltageAsHeight';
import { getChapter } from './data/chapters';

export default function Ch2VoltageAndCurrent() {
  const chapter = getChapter('voltage-and-current')!;
  const SOURCES = chapter.sources;

  return (
    <ChapterShell chapter={chapter}>
      <p>
        Touch the two terminals of a 9-volt battery to your tongue. There is a sour metallic sting and a faint shock — the
        only direct, sensory measurement of voltage that most people ever make. What you felt was not 9 volts arriving from
        somewhere. It was 9 volts of <em>difference</em> between the two contacts in your saliva, and current flowing
        between them as a result. Voltage is always between two things. Always.
      </p>
      <p>
        This chapter is about the two quantities every electrician and every wall-outlet label talks about constantly:
        voltage and current. Both have intuitive analogies that get the algebra right and the picture wrong. We're going
        to do the algebra and then, more importantly, take the wrong pictures away.
      </p>

      <h2>Voltage isn't pressure. It's a <em>difference</em>.</h2>

      <p>
        The standard plumbing analogy says voltage is like water pressure: a battery pushes electrons through a wire the
        way a pump pushes water through a pipe. The analogy is appealing and gets you about a third of the way before it
        breaks down. The first thing to fix is the idea that voltage is a property of a single point. It isn't. <strong>Voltage is
        a property of a path between two points.</strong> A point in space can be assigned a potential, but only after you've
        chosen, somewhere off in the distance, a reference. Move the reference and every "voltage" shifts by the same
        amount. The differences are unchanged.
      </p>
      <p>
        Formally, the potential at a point is defined as a line integral of the electric field from a reference point to
        that point, with a minus sign:
      </p>
      <Formula>V<sub>ab</sub> = V<sub>b</sub> − V<sub>a</sub> = − ∫<sub>a</sub><sup>b</sup> E · dℓ</Formula>
      <p>
        The minus sign is convention: walking <em>against</em> the field gains you potential, the way climbing
        <em>against</em> gravity gains you altitude. For static charges the integral is path-independent <Cite id="feynman-II-2" in={SOURCES} />
        — the field is conservative, ∇×<strong>E</strong> = 0 — which is what lets you talk about the voltage at a point
        at all. Drop that property (we will, in Chapter 5) and "voltage" stops meaning what you think it means
        <Cite id="griffiths-2017" in={SOURCES} />.
      </p>

      <VoltageAsHeightDemo />

      <p>
        The gravitational analogy is exact in all the parts that matter. A ball at the top of a hill has gravitational
        potential energy <em>mgh</em>; let it roll and that energy converts to kinetic. A positive test charge at the high
        end of a voltage drop has electrical potential energy <em>qV</em>; let it move and that energy goes into
        kinetic energy of the charge — which, in a wire full of fixed obstacles, almost immediately becomes heat. The
        battery is the climber lifting the ball back up. Voltage is the height it lifted to.
      </p>
      <p className="pullout">
        Voltage is not a property of a place. It is a property of the path between two places.
      </p>

      <h2>What current actually <em>is</em></h2>

      <p>
        Current is the flow of charge — coulombs per second, with units called amperes. One amp is one coulomb per
        second, which works out to about <strong>6.24×10¹⁸ elementary charges per second</strong> moving past a fixed
        cross-section. That is an absurd number of electrons. It will get more absurd in two paragraphs.
      </p>
      <Formula>I = dQ / dt</Formula>
      <p>
        Current has a direction. By the convention Benjamin Franklin set in 1747 — long before anyone knew electrons
        existed — current points the direction <em>positive</em> charge would move. In an ordinary copper wire the actual
        carriers are electrons, which are negative, and they drift the opposite way from the conventional current
        arrow <Cite id="griffiths-2017" in={SOURCES} />. Every diagram in every electronics textbook silently asks you to
        carry that inversion in your head. Most people learn to do it without noticing.
      </p>
      <p>
        With voltage and current in hand, you have the two quantities meters measure. You also have the setup for what
        is, on reflection, one of the strangest facts in classical physics — and the heart of this chapter. The
        electrons in a wire really do move when current flows. They just move much, much more slowly than you'd guess.
      </p>

      <h2>The astonishing slowness of <em>electrons</em></h2>

      <p>
        In a copper wire, roughly one of each atom's electrons is loose — not bound to any particular nucleus, free to
        wander. That gives a free-electron density of about <strong>n ≈ 8.5×10²⁸ /m³</strong> <Cite id="ashcroft-mermin-1976" in={SOURCES} />.
        These electrons are not at rest. They scream around at the Fermi velocity, roughly <strong>1.6×10⁶ m/s</strong>,
        bouncing off lattice ions every <strong>τ ≈ 2×10⁻¹⁴ s</strong> <Cite id="kittel-2005" in={SOURCES} /><Cite id="libretexts-conduction" in={SOURCES} />.
        Apply a field and on top of all that random motion they pick up a tiny <em>average</em> drift in the direction
        opposite the field. That average drift is what current is made of.
      </p>
      <p>
        In two equations <Cite id="drude-1900" in={SOURCES} />:
      </p>
      <Formula>v<sub>d</sub> = I / (n q A)</Formula>
      <p>
        Plug in numbers. One amp through a 2.5 mm² copper wire:
      </p>
      <Formula>v<sub>d</sub> = 1 / (8.5×10²⁸ · 1.6×10⁻¹⁹ · 2.5×10⁻⁶) ≈ 2.9×10⁻⁵ m/s</Formula>
      <p>
        Three hundredths of a millimeter per second. A 12-gauge wire carrying 20 A — the kind feeding your kitchen
        outlet — has a drift velocity of about <strong>0.02 mm/s</strong> <Cite id="libretexts-conduction" in={SOURCES} />.
        A garden snail moves roughly fifty times faster. To traverse a one-meter wire, a single electron needs about
        ten hours. For a forty-foot extension cord at the same current, more than a hundred.
      </p>

      <DriftVelocityDemo />

      <p>
        And yet the lamp at the far end of that extension cord turns on the instant you flip the switch. Whatever is
        getting from the switch to the bulb to make it glow, it is not the electrons that were sitting near the switch.
        They will not arrive for hours.
      </p>

      <h2>The two speeds in the same wire</h2>

      <p>
        Inside a copper wire two completely different things can be said to "move," and they move at speeds that differ
        by thirteen orders of magnitude. The electrons themselves drift at millimeters per second. The
        <em> electromagnetic signal</em> — the disturbance in the field that tells charges everywhere along the wire to
        start drifting — propagates at roughly two-thirds the speed of light, around <strong>2×10⁸ m/s</strong> in
        typical copper wiring <Cite id="libretexts-conduction" in={SOURCES} />. That ratio is the central
        you-thought-you-understood-this-but-you-didn't moment.
      </p>
      <Formula>v<sub>signal</sub> / v<sub>drift</sub>  ≈  2×10⁸ / 3×10⁻⁵  ≈  10¹³</Formula>

      <TwoSpeedsDemo />

      <p>
        The signal is not made of electrons. It is the electromagnetic field reconfiguring itself, and that
        reconfiguration travels at near-c through the space around the wire. The electrons respond to the field locally,
        wherever they happen to be sitting. They start drifting in place; nothing has to travel from one end to the
        other. This is the picture that, properly developed, becomes Chapter 6.
      </p>

      <h2>What actually lights the <em>bulb</em></h2>

      <p>
        Here is the sequence, in order, when you flip a wall switch and a bulb on the far side of the room comes on:
      </p>
      <p>
        (1) The switch closes. (2) The electric field that was already present in the wires — held in place by the
        battery or the line voltage — reconfigures around the new geometry, and that reconfiguration propagates outward
        at near the speed of light. (3) Within nanoseconds the field has reached every electron in the bulb's
        filament. (4) Those electrons, which were already there, begin to drift. (5) The drifting electrons collide
        with tungsten ions, dumping kinetic energy as heat. (6) The filament heats to ~2800 K and glows.
      </p>

      <SwitchAndBulbDemo />

      <p>
        Notice what is not in that list. No electron travels from the switch to the bulb. No charge "flows through" the
        wire in any sense that resembles water through a pipe. The electrons in the filament were always there. The
        thing that propagated was the field, which is not made of charges at all — it is a structure in space that
        Maxwell taught us to take seriously as a physical thing in its own right <Cite id="feynman-II-27" in={SOURCES} />.
        And the energy that becomes heat in the filament: it didn't travel down the inside of the wire either. We'll
        get to that one in Chapter 6.
      </p>

      <h2>What we have so far</h2>

      <p>
        Voltage is a difference between two points — the line integral of E along any path between them, with a sign.
        Current is the rate of charge flow past a cross-section, by convention pointing the way positive charges would
        move. The actual carriers in a metal wire are electrons drifting in the opposite direction at a few hundredths
        of a millimeter per second. The signal that closes the loop and lights the lamp is electromagnetic — it travels
        at a fraction of the speed of light through the field, not through the metal — and it arrives essentially
        instantly while the electrons themselves are still settling in for a long, slow walk.
      </p>
      <p>
        Three quantities are still missing from this picture: how hard a wire pushes back against current, how that
        pushback turns into heat, and why a long thin wire pushes back more than a short fat one. Those are the
        subject of Chapter 3.
      </p>

      <FAQ intro="Questions readers ask after this chapter — the misconception-busters, the order-of-magnitude sanity checks, and the things nobody quite explains in school.">
        <FAQItem q="If voltage is between two points, what does it mean to say a wire is at 'ground' or 'zero volts'?">
          <p>
            "Ground" is just the agreed-upon <strong>reference point</strong> from which other voltages are measured. In a
            household circuit it is literally a rod driven into the soil; in a portable circuit it is the battery's
            negative terminal; in a spacecraft it is the chassis. Calling a point "zero volts" is no different from
            calling sea level "zero altitude" — the choice is human, the differences are physical. Reassign ground and
            every node's voltage shifts by the same number, but the <em>differences</em>, which are what move charges,
            never change <Cite id="griffiths-2017" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why is a 9-volt battery exactly 9 volts — what sets that number?">
          <p>
            Chemistry. Each electrochemical cell has a characteristic voltage set by the energy released per electron
            when its two half-reactions run: about 1.5 V for an alkaline zinc–manganese-dioxide cell, 2.0 V for lead-acid,
            3.7 V for lithium-ion. A 9 V battery is six 1.5 V alkaline cells stacked in series, summing to nine.
            <strong>The number is fundamentally a count of joules per coulomb</strong> the chemistry can deliver — no
            more, no less — and that ratio is fixed by the molecular orbitals of the reactants, not by anything the
            engineer chose.
          </p>
        </FAQItem>

        <FAQItem q="In plain words, what's the actual difference between voltage and current?">
          <p>
            Voltage is <em>how badly</em> the charges want to move from one point to another — the energy each coulomb
            would release if it got there. Current is <em>how many</em> of them actually are moving per second past a
            given cross-section. A high voltage with no path is like a held breath; a high current is the breath
            already out. The two are linked through whatever is in between them, which in Chapter 3 will turn out to be
            resistance.
          </p>
        </FAQItem>

        <FAQItem q="One ampere is one coulomb per second — but how many electrons is that, really?">
          <p>
            A coulomb is about <strong>6.24×10¹⁸ elementary charges</strong>, so one ampere is roughly six quintillion
            electrons crossing a fixed plane every second. The number feels impossible until you remember that a single
            cubic millimeter of copper already contains around 8.5×10¹⁹ free electrons <Cite id="ashcroft-mermin-1976" in={SOURCES} />.
            Compared to the supply, an ampere of flow is a trickle from a reservoir — which is precisely why drift
            velocities come out in millimeters per second.
          </p>
        </FAQItem>

        <FAQItem q="Why does flipping a switch light a bulb instantly if electrons drift at fractions of a millimeter per second?">
          <p>
            Because the bulb does not wait for any particular electron to arrive. The instant the switch closes, the
            <strong> electric field</strong> in the wire reconfigures and that reconfiguration travels at roughly
            two-thirds the speed of light <Cite id="libretexts-conduction" in={SOURCES} />. The electrons already
            sitting in the filament feel the new field within nanoseconds and begin drifting in place. The energy that
            heats the tungsten comes from those local electrons colliding with the lattice, not from anything that
            traveled the length of the cord.
          </p>
        </FAQItem>

        <FAQItem q="Are the electrons in a battery the same ones that arrive at the bulb?">
          <p>
            Almost certainly not. The electrons in the filament were already in the filament when you screwed the bulb
            in. The electrons in the battery's negative terminal will, in a 20 A circuit, drift at about
            <strong> 0.02 mm/s</strong> <Cite id="libretexts-conduction" in={SOURCES} /> — over a meter of wire, that's a
            ten-hour walk. The picture of a charge leaving the battery, traveling down the wire, and arriving at the
            load is wrong in nearly every literal sense. Charges everywhere along the loop drift simultaneously the
            moment the field reaches them.
          </p>
        </FAQItem>

        <FAQItem q="Does AC mean the electrons go forward and back? How far?">
          <p>
            Yes, and barely at all. In a 60 Hz household line carrying a few amps through ordinary house wiring, each
            electron's drift reverses direction 120 times a second, and during each half-cycle it travels on the order of
            <strong> a few hundred nanometers</strong> — far less than the diameter of a human hair. The same electron
            you started with stays essentially in place, jittering. The energy delivered to your toaster has nothing to
            do with that jitter; it comes through the surrounding electromagnetic field, which we'll meet properly in
            Chapter 6.
          </p>
        </FAQItem>

        <FAQItem q="Then what actually carries the energy from the battery to the bulb?">
          <p>
            The <strong>electromagnetic field in the space around the wire</strong>. Inside a resistive wire the
            electric field points along its length and the magnetic field circles it; their cross product, the
            Poynting vector, points radially <em>inward</em> through the wire's surface and integrates exactly to
            <em> VI</em>, the dissipated power <Cite id="feynman-II-2" in={SOURCES} />. The wire is the destination,
            not the conduit. This sounds like a parlor trick the first time you hear it; Chapter 6 makes it
            rigorous.
          </p>
        </FAQItem>

        <FAQItem q="If voltage is energy per charge, why doesn't a 1 V capacitor 'run out' after one charge passes through?">
          <p>
            Because the capacitor is doing work on <em>every</em> charge that crosses, not on the first one and then
            quitting. Voltage is an intensive quantity — it describes the energy <em>per</em> coulomb, available to as
            many coulombs as care to come through. What runs out is whatever maintains the voltage: the chemical
            reservoir in a battery, the stored field in a capacitor, the rotating magnet in a generator. As long as
            those keep the potential difference up, every passing charge gets its share.
          </p>
        </FAQItem>

        <FAQItem q="Does current require a closed loop? Why?">
          <p>
            For <em>steady</em> current, yes. Charge is conserved, so any charge piling up at the end of an open wire
            quickly raises a counter-field that cancels the driving field — the current stops almost immediately. A
            closed loop lets the charges that leave one point be replaced by charges arriving from another, and the
            process continues indefinitely. The exception is briefly: in a capacitor or an antenna, you can have a
            transient current that is part of a larger loop closed not by wire but by a <em>displacement current</em>,
            i.e. a changing electric field — Maxwell's contribution, also waiting in Chapter 6.
          </p>
        </FAQItem>

        <FAQItem q="Why do we use AC for the power grid and DC for electronics?">
          <p>
            Two different optimization targets. AC is trivial to transform up and down in voltage with a passive iron
            transformer, which lets the grid push a few hundred kilovolts cross-country (low current, low resistive
            loss) and step it down to 120 V at your wall. DC transformers don't exist passively — they require active
            switching electronics, which only became cheap recently. <strong>Inside</strong> a device, almost every
            transistor, sensor, and chip wants a steady, unidirectional voltage; AC would just confuse it. So we ship
            power as AC and convert at the endpoint.
          </p>
        </FAQItem>

        <FAQItem q="What is 'grounding' actually doing safety-wise?">
          <p>
            It is giving fault current somewhere to go that isn't <em>you</em>. If a hot wire inside a metal appliance
            chassis frays and touches the case, the ground wire offers a near-zero-resistance path back to the panel,
            which sinks enough current to trip the breaker in milliseconds. Without that ground path, the chassis
            would simply sit at line voltage, waiting for the first person to touch it and the floor at the same time
            to complete the circuit through their body. The earth itself is not magical; what matters is that the
            appliance and your feet are tied to the <em>same</em> reference.
          </p>
        </FAQItem>

        <FAQItem q="Why doesn't touching only one terminal of a battery shock you?">
          <p>
            Because there's no closed loop. A 9 V battery's two terminals differ by 9 V, but the terminal you touch and
            the air around your other hand do not — they are at essentially the same potential. No potential difference
            across you means no current through you. The wall outlet is a different story only because one of its
            terminals is bonded to ground, and you are too: standing barefoot on a damp floor, your body completes the
            loop from hot to ground without needing to touch neutral.
          </p>
        </FAQItem>

        <FAQItem q="Does the signal in an AC line travel faster than in a DC line?">
          <p>
            No — the propagation speed depends on the wire's geometry and the surrounding dielectric, not on whether
            the source is steady or oscillating. In ordinary insulated copper it's around <strong>2×10⁸ m/s</strong>
            either way <Cite id="libretexts-conduction" in={SOURCES} />, roughly two-thirds the speed of light in
            vacuum. What AC does change is the <em>direction</em> the signal carries energy: it reverses every
            half-cycle, so the time-averaged Poynting flow into a resistor is what matters, not the instantaneous one.
          </p>
        </FAQItem>

        <FAQItem q="If electrons are everywhere in the copper, where does the 'new' current come from when you connect a battery?">
          <p>
            It doesn't come from anywhere — it was already there as random thermal motion. Before you connect the
            battery, copper's free electrons are zipping around at the Fermi velocity, about <strong>1.6×10⁶ m/s</strong>
            <Cite id="kittel-2005" in={SOURCES} />, in every direction at once, so their average velocity is zero and no
            net current flows. The battery's field adds a tiny systematic bias on top of that chaos — a <em>drift</em>
            of order millimeters per second — and that bias, multiplied across 10²⁸ electrons per cubic meter, is what we
            measure as amps <Cite id="drude-1900" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why does conventional current point from + to − when actual electrons go the other way?">
          <p>
            Historical accident. Benjamin Franklin chose the sign of charge in 1747, more than a century before anyone
            knew electrons existed, and he guessed wrong about which carrier was moving. By the time J. J. Thomson
            identified the electron in 1897 and pinned down its negative charge, every textbook, every circuit diagram,
            and every right-hand rule had baked the older convention in. Rather than rewrite all of electromagnetism,
            physicists kept "conventional current" pointing the way a positive charge would go and silently inverted
            the picture for actual electrons <Cite id="griffiths-2017" in={SOURCES} />.
          </p>
        </FAQItem>
      </FAQ>
    </ChapterShell>
  );
}
