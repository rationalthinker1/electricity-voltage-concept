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
import { Cite } from '@/components/SourcesList';
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
      <p className="math">V<sub>ab</sub> = V<sub>b</sub> − V<sub>a</sub> = − ∫<sub>a</sub><sup>b</sup> E · dℓ</p>
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
      <p className="math">I = dQ / dt</p>
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
      <p className="math">v<sub>d</sub> = I / (n q A)</p>
      <p>
        Plug in numbers. One amp through a 2.5 mm² copper wire:
      </p>
      <p className="math">v<sub>d</sub> = 1 / (8.5×10²⁸ · 1.6×10⁻¹⁹ · 2.5×10⁻⁶) ≈ 2.9×10⁻⁵ m/s</p>
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
      <p className="math">v<sub>signal</sub> / v<sub>drift</sub>  ≈  2×10⁸ / 3×10⁻⁵  ≈  10¹³</p>

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
    </ChapterShell>
  );
}
