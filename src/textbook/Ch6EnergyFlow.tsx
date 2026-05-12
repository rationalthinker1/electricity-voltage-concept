/**
 * Chapter 6 — Where the energy actually flows
 *
 * The capstone. Five embedded demos:
 *   6.1 Old picture vs real picture (battery + bulb)
 *   6.2 Axial E inside a resistive wire
 *   6.3 B circulating around a wire
 *   6.4 Poynting inflow — the punchline ∮S·dA = VI
 *   6.5 Superconductor limit — the energy passes parallel, no absorption
 *
 * The whole textbook lands here: charge → field → voltage → current →
 * resistance → magnetism → induction → and finally, the wire wasn't the
 * thing all along. The field was.
 */
import { ChapterShell } from '@/components/ChapterShell';
import { Cite } from '@/components/SourcesList';
import { BCirculationDemo } from './demos/BCirculation';
import { EAxialFieldDemo } from './demos/EAxialField';
import { PoyntingInflowDemo } from './demos/PoyntingInflow';
import { SuperconductorLimitDemo } from './demos/SuperconductorLimit';
import { WhereDoesEnergyFlowDemo } from './demos/WhereDoesEnergyFlow';
import { getChapter } from './data/chapters';

export default function Ch6EnergyFlow() {
  const chapter = getChapter('energy-flow')!;
  const SOURCES = chapter.sources;

  return (
    <ChapterShell chapter={chapter}>
      <p>
        We've spent five chapters building toward a single question, and never asking it. A battery sits on the workbench. A
        bulb sits a meter away. They're connected by a length of copper wire. You close the switch, the bulb glows, and the
        battery loses chemical energy at exactly the rate the bulb gains heat and light. <em>Where, exactly, does that energy
        go?</em> What path does it take from one to the other?
      </p>
      <p>
        The obvious answer — that it travels through the copper, carried by the moving electrons — turns out to be wrong in a
        way that takes some staring at to accept. The energy never enters the wire. It travels through the empty space
        <em> around</em> the wire, in the form of the electromagnetic field, and pours inward into the resistive parts on every
        side at once. The wire isn't the medium. The wire is the destination. Maxwell wrote it down in 1865<Cite id="maxwell-1865" in={SOURCES} />,
        Poynting finished it in 1884<Cite id="poynting-1884" in={SOURCES} />, and Feynman called it "crazy" before teaching it
        anyway<Cite id="feynman-II-27" in={SOURCES} />. This last chapter is the proof.
      </p>

      <h2>The question almost <em>nobody</em> asks</h2>

      <p>
        Most of physics education waves at this question and walks past. "Current carries energy from the battery to the
        bulb." That sentence sounds fine, the way "the sun comes up in the east" sounds fine — true enough at the bookkeeping
        level, false underneath. Current is a flow of charge. It is not a flow of <em>energy</em>. The two happen to share a
        name in everyday speech ("electricity") but they are different physical things, and in this case they don't even
        travel along the same path.
      </p>
      <p>
        Look at it bluntly. In Chapter&nbsp;2 we calculated the drift speed of an electron in 12-gauge copper at modest
        current: about 0.03 mm/s. Yet the bulb turns on essentially the moment you flip the switch. If energy rode in on the
        backs of the drifting electrons, you would wait several hours after closing the circuit before the first energy-laden
        electrons made it from one end of the wire to the other. They don't carry the energy. Something else does — and that
        something else moves at about ⅔ the speed of light, which is the speed of an electromagnetic disturbance through the
        material surrounding a copper wire.
      </p>

      <WhereDoesEnergyFlowDemo />

      <p>
        The contrast in the demo above is a cartoon, but the cartoon is the entire chapter in miniature. The "old picture" on
        the left is what most people carry around in their head. The "real picture" on the right is what the math actually
        gives you. The rest of this chapter is the derivation.
      </p>

      <h2>Two fields are <em>present</em></h2>

      <p>
        Inside a current-carrying resistive wire there are two electromagnetic fields, both demanded by the equations we've
        already met. Look at them one at a time.
      </p>
      <p>
        First, an electric field along the wire's axis. It has to be there: from Chapter&nbsp;3, microscopic Ohm's law says
        <strong> J = σ E</strong>, so a steady current density implies a non-zero <strong>E</strong> inside the conductor. In a uniform
        wire of length <strong>L</strong> with voltage drop <strong>V</strong> across its ends, the integral of <strong>E·dℓ</strong> along the
        axis must equal <strong>V</strong>, and by symmetry <strong>E</strong> is uniform along the way<Cite id="feynman-II-27" in={SOURCES} />:
      </p>
      <p className="math">E = V / L</p>
      <p>
        This is a point that surprises people. In the electrostatic case, the field inside a conductor is zero — the free
        charges rearrange until it is. In a <em>current-carrying resistive</em> conductor, the field inside is decidedly not
        zero. The non-zero field is exactly what's needed to keep pushing the drifting charge against the friction of the
        lattice. Drop the field, the current stops.
      </p>

      <EAxialFieldDemo />

      <p>
        Second, a magnetic field circling the wire. From Chapter&nbsp;4, Ampère's law tells you that any line integral of
        <strong> B·dℓ</strong> around a closed loop equals μ<sub>0</sub> times the enclosed current. Wrap that loop around the wire at radius
        <strong> a</strong> and you get
      </p>
      <p className="math">B = μ<sub>0</sub> I / (2π a)</p>
      <p>
        at the surface, with the direction set by the right-hand rule: thumb along the current, fingers curl with the field.
        It's a circumferential field. Perpendicular at every point to the axial <strong>E</strong> we just identified.
      </p>

      <BCirculationDemo />

      <p>
        Two fields, perpendicular to each other, present everywhere along a current-carrying wire. That perpendicularity is
        about to do an enormous amount of work.
      </p>

      <h2>Cross product → <em>radial</em> inflow</h2>

      <p>
        Maxwell, in the same 1865 paper that gave the world his complete equations, identified a quantity that bookkept where
        electromagnetic energy lives and how it moves<Cite id="maxwell-1865" in={SOURCES} />. The full derivation was tidied
        up nineteen years later by John Henry Poynting, who showed in a single elegant paper that the energy flux per unit
        area at any point in space is given by the cross product of <strong>E</strong> and <strong>B</strong>, scaled by the
        permeability of free space<Cite id="poynting-1884" in={SOURCES} />:
      </p>
      <p className="math">S = (1/μ<sub>0</sub>) E × B</p>
      <p>
        <strong>S</strong> has units of watts per square meter — energy per unit time, per unit cross-sectional area, in the direction
        the energy is moving. It is a real, local field defined at every point in space where electric and magnetic fields are
        both present<Cite id="griffiths-2017" in={SOURCES} />.
      </p>
      <p>
        Now turn the right-hand rule on the situation we built in the last section. <strong>E</strong> points along the wire's axis;
        <strong> B</strong> circles the wire. Their cross product points <em>radially inward</em>, perpendicular to both, on every side of
        the wire at once. Energy is flowing into the wire. It comes from the surrounding space — from <em>everywhere</em> in
        the surrounding space — and gets absorbed at the surface.
      </p>
      <p>
        This is the picture Feynman puts in the bluntest possible terms in Volume II of the Lectures<Cite id="feynman-II-27" in={SOURCES} />:
      </p>
      <p className="pullout">
        "Since the wire has resistance, there is an electric field along it, driving the current… the <strong>E</strong> and
        <strong> B</strong> are at right angles; therefore there is a Poynting vector directed radially inward… <em>there is a
        flow of energy into the wire all around.</em>"
      </p>

      <h2>The integral that <em>closes</em> the loop</h2>

      <p>
        It's one thing to wave at the radial direction; it's another to count the joules. Do the algebra. At the wire's
        surface,
      </p>
      <p className="math">|S|<sub>surf</sub> = E B / μ<sub>0</sub> = V I / (2π a L)</p>
      <p>
        where the second equality just substitutes <em>E = V/L</em> and <em>B = μ<sub>0</sub>I/(2πa)</em> from above. The
        wire's lateral surface area is <strong>2πaL</strong>. So the total energy flowing inward through that surface, per
        second, is the surface integral
      </p>
      <p className="math">∮ S · dA = |S|<sub>surf</sub> · 2π a L = V I</p>
      <p>
        Exactly <strong>VI</strong>. The Poynting flux through the wire's surface equals the dissipated power, identically, by
        construction. No approximation. No "in the limit of." It is the same quantity, written in two different ways<Cite id="jackson-1999" in={SOURCES} />.
      </p>

      <PoyntingInflowDemo />

      <p>
        The "P_surf / P_VI = 1.000" readout in the demo above is the entire chapter compressed into one number. Move any
        slider you like — the ratio doesn't budge. It can't. The integral and the algebra are the same statement.
      </p>

      <p className="pullout">
        The wire is not the medium. The wire is the destination.
      </p>

      <h2>Davis &amp; Kaplan and the <em>real</em> circuit</h2>

      <p>
        The setup we just walked through is a 2D toy: an infinitely long, perfectly straight wire of uniform resistivity. Real
        circuits are curvier than that. They loop. They have batteries with internal structure. They have wires of different
        thicknesses and resistances. Does the picture survive contact with a realistic geometry, or is it an artifact of
        idealization?
      </p>
      <p>
        Basil Davis and Lev Kaplan answered the question carefully in 2011<Cite id="davis-kaplan-2011" in={SOURCES} />. They
        computed the full three-dimensional Poynting field around a circular loop containing a battery and a resistive arc,
        evaluating <strong>E</strong> and <strong>B</strong> at every point in the surrounding space and integrating <strong>S</strong> in
        and out of the various conductors. The result is exactly what energy conservation requires: field lines of <strong>S</strong>
        thread through every point in the space surrounding the circuit, the net flux entering the resistive segment equals
        the power dissipated there, and the same flux <em>leaves</em> the battery, which acts as a source of field-energy.
        Morris and Styer have visualized the 2D version explicitly, plotting the Poynting flow along equipotentials in a
        simple parallel-rail geometry<Cite id="morris-styer-2012" in={SOURCES} />.
      </p>
      <p>
        The picture is robust. With conductors only at the boundaries, the energy lives in the field that fills the rest of
        space, and the wire is just where the field gives it up.
      </p>

      <h2>The <em>superconductor</em> limit</h2>

      <p>
        One last sanity check, and it's a beautiful one. Push the conductivity to infinity. What happens?
      </p>
      <p>
        From microscopic Ohm's law, <strong>E = J/σ</strong>. As σ → ∞ at fixed current density, the axial field inside the
        conductor must go to zero. (You cannot sustain a non-zero <strong>E</strong> in a perfect conductor at equilibrium —
        the free charges would rearrange instantly.) So <strong>E</strong> inside the wire vanishes, and so does <strong>S</strong>
        inside. The energy doesn't enter at all. It keeps streaming, parallel to the wire, in the surrounding space, and slides
        on past untouched<Cite id="griffiths-2017" in={SOURCES} /><Cite id="jackson-1999" in={SOURCES} />.
      </p>

      <SuperconductorLimitDemo />

      <p>
        Resistance, then, is what couples the field to the lattice. It is the mechanism by which the surrounding electromagnetic
        energy actually finds its way into the metal as heat. Without resistance, the field is a perfectly good guide — the
        wire constrains where the current flows, which constrains where <strong>B</strong> is, which constrains where the
        energy goes — but no joules are lost from the field along the way. In a circuit with one resistor and superconducting
        leads, the entire energy budget happens at the resistor. The leads are just rails for the field.
      </p>

      <h2>What the textbook was <em>for</em></h2>

      <p>
        Look back at where we started. Chapter&nbsp;1 opened with a balloon stuck to a wall and asked what charge actually is.
        We built up a field that fills space (Ch.&nbsp;1), figured out the language of potential and current (Ch.&nbsp;2), the
        atomic-scale choreography of resistance and dissipation (Ch.&nbsp;3), the magnetism that any moving charge produces
        (Ch.&nbsp;4), and the way changing fields give birth to other fields (Ch.&nbsp;5). At every stage the wire kept
        showing up, and at every stage we were tempted to think of the wire as the protagonist — the thing energy was traveling
        through.
      </p>
      <p>
        It wasn't. The field was. The wire was the boundary condition that told the field what shape to take, and a place
        for the field to deposit its energy when there was friction to absorb it. Everything else — voltage, current,
        resistance, induction — is bookkeeping for the field's behavior in the space around the conductor. The conductor was
        never the protagonist. The space outside it was.
      </p>
      <p>
        That is what electricity actually is.
      </p>
    </ChapterShell>
  );
}
