/**
 * Chapter 4 — Magnetism
 *
 * The rotational half. Currents make B fields; B fields steer charges; two
 * wires talk through their fields; a coil is the simplest practical magnet;
 * and underneath it all, magnetism is just the Coulomb force seen from a
 * moving frame.
 *
 * Embedded demos:
 *   4.1 Field around a long straight wire (B = μ₀I/2πr)
 *   4.2 Two parallel wires (F/L = μ₀I₁I₂/2πd)
 *   4.3 Cyclotron motion (Lorentz force, r = mv/qB)
 *   4.4 Solenoid (B = μ₀nI)
 */
import { ChapterShell } from '@/components/ChapterShell';
import { Cite } from '@/components/SourcesList';
import { CyclotronDemo } from './demos/Cyclotron';
import { SolenoidDemo } from './demos/Solenoid';
import { TwoParallelWiresDemo } from './demos/TwoParallelWires';
import { WireBFieldDemo } from './demos/WireBField';
import { getChapter } from './data/chapters';

export default function Ch4Magnetism() {
  const chapter = getChapter('magnetism')!;
  const SOURCES = chapter.sources;

  return (
    <ChapterShell chapter={chapter}>
      <p>
        Hans Christian Ørsted was lecturing in Copenhagen in the spring of 1820 with a battery, a wire, and — by
        coincidence or instinct — a compass on the table. He closed the circuit. The needle, which had been pointing
        north, swung sideways. He uncrossed the wires. The needle swung back. He hadn't been looking for a connection
        between electricity and magnetism. Nobody in 1820 thought there was one. By that summer the pamphlet was
        circulating across Europe and the rest of the century was spent figuring out what had just happened.
      </p>
      <p>
        What had happened was this: a current in a wire produces a magnetic field. The compass needle — itself a small
        magnet — felt that field and turned to align with it. The whole edifice of magnetism, including the everyday
        magnet stuck to your fridge, would turn out to be the same phenomenon. Currents make magnetic fields. Atoms
        contain little circulating charges, which is to say little currents, which is to say little magnets. There is
        no second force here. There is just electricity, viewed from another angle.
      </p>

      <h2>A second kind of <em>force</em></h2>

      <p>
        Lodestones — naturally magnetized chunks of iron-bearing rock — were known in antiquity. Greek and Chinese
        writers describe them by the sixth century BCE; the Chinese had a working compass by the eleventh century.
        For most of recorded history magnetism and electricity were filed as two unrelated phenomena. A magnet pulls
        on iron. A rubbed amber rod pulls on lint. Different cause, different cure, different chapter.
      </p>
      <p>
        Then Ørsted's compass moved. Within months Biot and Savart had measured how the field around a wire fell off
        with distance<Cite id="biot-savart-1820" in={SOURCES} />, and Ampère was building a complete force law between
        current elements <Cite id="ampere-1826" in={SOURCES} />. The picture that emerged, and that Maxwell would later
        sharpen into its modern shape, is that <em>moving</em> charge is the source of magnetism. Static charge makes
        an electric field. Charge in motion makes <em>both</em> an electric field <em>and</em> a magnetic one. The
        force a permanent magnet exerts on a paperclip is the cumulative effect of an enormous number of atomic-scale
        electron currents that happen to be aligned <Cite id="feynman-II-13" in={SOURCES} />.
      </p>

      <h2>The field around a <em>wire</em></h2>

      <p>
        For a single, infinitely long, straight wire carrying current <strong>I</strong>, the magnetic field is one of
        the cleanest formulas in classical physics. At a perpendicular distance <strong>r</strong> from the wire, the
        magnitude is
      </p>
      <p className="math">|B| = μ₀ I / (2π r)</p>
      <p>
        and the direction is tangent to a circle around the wire — wrapping the wire like contour lines around a
        mountain. The right-hand rule fixes which way: point your thumb along the current and your fingers curl
        around the wire in the direction of <strong>B</strong>. The constant <strong>μ₀ ≈ 1.257×10⁻⁶ T·m/A</strong>
        is the permeability of free space <Cite id="codata-2018" in={SOURCES} />; it plays the same role for magnetism
        that <strong>1/(4π ε₀)</strong> plays for electricity, and the two are linked by <strong>μ₀ ε₀ = 1/c²</strong>.
      </p>
      <p>
        Biot and Savart got there empirically by hanging a compass needle near a wire and measuring deflection vs.
        distance. Ampère got there from a force law between current elements that, integrated, gives the same answer
        and a great deal more. Both papers appeared within six years of Ørsted's compass. The pace of 1820s
        electromagnetism was extraordinary.
      </p>

      <WireBFieldDemo />

      <p>
        The factor of <strong>2π</strong> is geometric, the same way the <strong>4π</strong> in Coulomb's law is
        geometric — it counts how field lines spread around a wire (cylindrically) instead of around a point
        (spherically). The fall-off here is <strong>1/r</strong>, not 1/r². A line of charge spreads its influence over
        a cylinder of area <strong>2π r L</strong>, so the per-area intensity drops as 1/r, not 1/r². Geometry, again.
      </p>

      <h2>Two wires that <em>talk</em></h2>

      <p>
        Put two parallel wires near each other. Each carries a current. Each makes its own magnetic field. Each
        therefore sits in the field of the other and feels a force. The result is one of the most surprising facts in
        elementary electromagnetism: <strong>parallel currents attract, antiparallel currents repel.</strong> The
        opposite of charges, and yet — for a deep reason — the same physics.
      </p>
      <p>
        The force per unit length on either wire works out to
      </p>
      <p className="math">F / L = μ₀ I₁ I₂ / (2π d)</p>
      <p>
        with <strong>d</strong> the wire spacing. Same sign of current → attractive (negative if you've adopted the
        sign convention that "outward" is positive). Opposite signs → repulsive. From 1948 to 2019 the SI ampere was
        defined operationally as exactly the current that, flowing in two infinitely long parallel wires one meter
        apart, produces a force of <strong>2×10⁻⁷ N/m</strong> between them <Cite id="griffiths-2017" in={SOURCES} />.
        That definition is what the <strong>μ₀ = 4π × 10⁻⁷</strong> exact value used to be; the 2019 SI redefinition
        based the ampere instead on the elementary charge <strong>e</strong>, demoting μ₀ to a measured quantity.
      </p>

      <TwoParallelWiresDemo />

      <p>
        The result is striking enough that you might wonder why we never see two power lines pulling each other
        together. The answer is the size of <strong>μ₀</strong>: between two wires carrying 100 A each, separated by
        a meter, the force is just <strong>2×10⁻³ N/m</strong> — about a fifth of a gram weight per meter. Detectable
        with a torsion balance, invisible against gravity and tension. Magnetism is, gram for gram, an extraordinarily
        weak force compared to electrostatics. (For comparison: the electrical force between one mole of electrons and
        one mole of protons separated by a meter would be enough to lift a small mountain. Bulk matter just
        cancels itself out so completely that the residual electrical force is usually zero, leaving the much weaker
        magnetic force to do most of the visible long-range work.)
      </p>

      <h2>Force on a moving <em>charge</em></h2>

      <p>
        Wires aren't the only things that feel magnetic forces — a single moving charge does too. The Lorentz force
        law, the cleanest statement in all of magnetism, is
      </p>
      <p className="math">F = q ( v × B )</p>
      <p>
        with the cross product giving a force perpendicular to <em>both</em> the velocity and the field. The two facts
        worth pausing on:
      </p>
      <p>
        First, the force is always perpendicular to the velocity, so it does no work. <em>Magnetism cannot speed a
        charge up or slow it down. It can only steer.</em> Energy in, energy out — unchanged. The kinetic energy of a
        free charge in a static magnetic field is conserved, exactly. This is structurally different from the electric
        case, where <strong>F = qE</strong> is parallel to <strong>E</strong> and does plenty of work.
      </p>
      <p className="pullout">
        Magnetism doesn't do work. It only steers.
      </p>
      <p>
        Second, "perpendicular to <strong>v</strong>" plus "constant magnitude" is the recipe for circular motion. A
        charged particle injected into a uniform magnetic field traces out a circle of radius
      </p>
      <p className="math">r = m v / (q B)</p>
      <p>
        and goes around it with period
      </p>
      <p className="math">T = 2π m / (q B)</p>
      <p>
        — which, remarkably, has no <strong>v</strong> in it. Faster particles trace bigger circles in <em>exactly</em>
        the same amount of time. That's the foundation of the cyclotron, of mass spectrometers, of every accelerator
        smaller than a kilometer across. It's also why an aurora is shaped the way it is: charged particles from the
        sun spiral down Earth's magnetic field lines, drawn toward the poles, depositing their energy into the upper
        atmosphere along the way <Cite id="feynman-II-13" in={SOURCES} />.
      </p>

      <CyclotronDemo />

      <p>
        Inside an ordinary copper wire, the moving charges are conduction electrons, and the same Lorentz force still
        applies — but now in the presence of a billion-billion other charges and a fixed positive lattice. If you put
        a current-carrying conductor in a transverse <strong>B</strong> field, the magnetic force pushes the carriers
        sideways across the slab until enough of them pile up on one face to make a transverse <em>electric</em> field
        that exactly cancels the magnetic deflection in steady state. The voltage across the slab — the
        <em> Hall voltage</em> — has a sign that tells you the sign of the carriers. Edwin Hall used it in 1879 to
        confirm experimentally that current in metals is carried by negative charges <Cite id="hall-1879" in={SOURCES} />,
        decades before anyone knew what an electron was.
      </p>

      <h2>Solenoid: a <em>controllable</em> magnet</h2>

      <p>
        Take a wire, coil it into a tight helix, run a current through it. Each turn contributes its own magnetic field,
        and inside the bundle they all reinforce each other. Outside, they mostly cancel. The result is a region of
        strong, nearly uniform magnetic field along the solenoid's axis — a permanent-magnet-like field that you can
        switch on and off, and whose strength you control with a knob.
      </p>
      <p>
        For a long solenoid (length much greater than radius), the field inside is
      </p>
      <p className="math">B = μ₀ n I</p>
      <p>
        with <strong>n = N / L</strong> the number of turns per unit length. No dependence on radius (so long as you
        stay inside), no dependence on where along the axis you measure (so long as you're not near the ends). Outside
        the solenoid the field is, in the idealized limit, exactly zero — the mathematical statement of the fact that
        all the field lines that exit one end have to come back in through the other.
      </p>

      <SolenoidDemo />

      <p>
        This is the simplest practical electromagnet. Wrap a few hundred turns of wire around a nail, hook it to a
        battery, and you have a magnet whose strength you can dial — and that you can shut off entirely by opening the
        switch. Add an iron core (whose atoms align with the field, multiplying it tenfold to a thousandfold) and you
        get the kind of magnet that lifts cars at a junkyard. The same geometry, used backwards, is the
        <em> inductor</em>: a coil that opposes any change in current through it because changing current means
        changing field, and changing field means an induced voltage. We meet that in Chapter 5.
      </p>

      <h2>Magnetism is electricity in a different <em>reference frame</em></h2>

      <p>
        Here is the deepest and most surprising thing about magnetism: it isn't actually a separate force at all. It's
        the relativistic shadow of the electrostatic Coulomb force.
      </p>
      <p>
        Consider a long wire carrying a current to the right. In the lab frame, the wire is electrically neutral —
        there are equal densities of stationary positive ions and rightward-drifting negative electrons. The net
        electric field of the wire is zero. A test charge sitting next to it feels no electric force. But it does
        feel a magnetic force, if it happens to be moving — that's the Lorentz force law from the last section.
      </p>
      <p>
        Now jump into a frame moving alongside the test charge. Special relativity tells you that lengths along the
        direction of motion contract, and the contraction depends on speed. The positive ions (originally stationary
        in the lab frame) and the electrons (originally drifting in the lab frame) now have different velocities in
        your new frame, hence different length contractions, hence different linear charge densities. The wire in
        your new frame is <em>not</em> electrically neutral. There's a net charge on it, and an honest electric field
        around it — and that field exerts an honest electric force on the test charge. <strong>The force you call
        "magnetic" in one frame is exactly the force you call "electric" in another.</strong> The numbers all match
        out, term for term, because magnetism is what the Coulomb force <em>has to look like</em> to a moving
        observer to keep relativity consistent <Cite id="feynman-II-13" in={SOURCES} /><Cite id="jackson-1999" in={SOURCES} />.
      </p>
      <p>
        This wasn't how Maxwell or Ampère thought about it. They had two coupled fields, <strong>E</strong> and
        <strong> B</strong>, with their own equations. It took Einstein in 1905 to point out that the same fields are
        just two faces of one tensor, and that Maxwell's equations, properly written, are already relativistic — no
        modifications needed. They had been the whole time. Maxwell's electromagnetism was the first relativistic
        theory in physics. Nobody at the time noticed, because there was nothing else to compare it to.
      </p>
      <p>
        So when you look at a refrigerator magnet and feel its quiet pull, you're feeling the residue of an
        electrostatic interaction whose details have been rotated, by the act of putting the source charges in motion,
        out of the "electric" column and into the "magnetic" one. There's no second force. There never was.
      </p>
    </ChapterShell>
  );
}
