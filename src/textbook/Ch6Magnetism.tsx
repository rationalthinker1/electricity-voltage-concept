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
import { CaseStudies, CaseStudy } from '@/components/CaseStudy';
import { FAQ, FAQItem } from '@/components/FAQ';
import { Cite } from '@/components/SourcesList';
import { Formula } from '@/components/Formula';
import { Term } from '@/components/Term';
import { TryIt } from '@/components/TryIt';
import { CyclotronDemo } from './demos/Cyclotron';
import { SolenoidDemo } from './demos/Solenoid';
import { TwoParallelWiresDemo } from './demos/TwoParallelWires';
import { WireBFieldDemo } from './demos/WireBField';
import { getChapter } from './data/chapters';

export default function Ch6Magnetism() {
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
        What had happened was this: a current in a wire produces a <Term def="The vector field B that surrounds moving charge and exerts a sideways force on other moving charge via F = qv × B. SI units are tesla.">magnetic field</Term>. The compass needle — itself a small
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
        with distance — what we now call the <Term def="The differential law giving the magnetic field dB at a point from a small current element I dℓ: dB = (μ₀/4π) I dℓ × r̂ / r². Integrate it around any current path and you get B.">Biot–Savart law</Term><Cite id="biot-savart-1820" in={SOURCES} />, and Ampère was building a complete force law between
        current elements — eventually compressed into <Term def="The integral law ∮ B · dℓ = μ₀ I_enclosed. The magnetic counterpart of Gauss's law: the circulation of B around a closed loop equals μ₀ times the total current threading the loop.">Ampère's law</Term><Cite id="ampere-1826" in={SOURCES} />. The picture that emerged, and that Maxwell would later
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
      <Formula>|B| = μ₀ I / (2π r)</Formula>
      <p>
        and the direction is tangent to a circle around the wire — wrapping the wire like contour lines around a
        mountain. The <Term def="A mnemonic for the orientation of cross products in a right-handed coordinate system. For B around a wire: point your right thumb along the current and your fingers curl in the direction of B. For F = qv × B: fingers from v to B, thumb gives F.">right-hand rule</Term> fixes which way: point your thumb along the current and your fingers curl
        around the wire in the direction of <strong>B</strong>. The constant <strong>μ₀ ≈ 1.257×10⁻⁶ T·m/A</strong>
        is the permeability of free space <Cite id="codata-2018" in={SOURCES} />; it plays the same role for magnetism
        that <strong>1/(4π ε₀)</strong> plays for electricity, and the two are linked by <strong>μ₀ ε₀ = 1/c²</strong>.
        The SI unit for B is the <Term def="SI unit of magnetic flux density. 1 T = 1 kg / (A·s²) = 1 V·s/m². Earth's field is ~50 µT, a fridge magnet ~5 mT, a clinical MRI 1.5–3 T, a neutron-star magnetar ~10¹⁰ T.">tesla</Term> (T).
      </p>
      <p>
        Biot and Savart got there empirically by hanging a compass needle near a wire and measuring deflection vs.
        distance. Ampère got there from a force law between current elements that, integrated, gives the same answer
        and a great deal more. Both papers appeared within six years of Ørsted's compass. The pace of 1820s
        electromagnetism was extraordinary.
      </p>

      <WireBFieldDemo />

      <TryIt
        tag="Try 6.1"
        question={<>A long straight wire carries <strong>I = 10 A</strong>. What is the magnitude of B at a perpendicular distance of <strong>5 cm</strong>?</>}
        hint="B = μ₀ I / (2π r), with μ₀ = 4π × 10⁻⁷ T·m/A."
        answer={
          <>
            <Formula>|B| = μ₀ I / (2π r)</Formula>
            <Formula>|B| = (4π×10⁻⁷)(10) / (2π · 0.05) = (4π×10⁻⁶) / (0.1π) = <strong>4×10⁻⁵ T = 40 µT</strong></Formula>
            <p>
              About the size of Earth's surface field<Cite id="chulliat-wmm-2020" in={SOURCES} /> — a 10 A wire at 5 cm
              produces a B comparable to the planet's own dipole. The 2π in the denominator is geometric: field lines spread
              around a cylinder, not a sphere, so the fall-off is 1/r, not 1/r²<Cite id="codata-2018" in={SOURCES} />.
            </p>
          </>
        }
      />

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
      <Formula>F / L = μ₀ I₁ I₂ / (2π d)</Formula>
      <p>
        where <strong>F</strong> is the magnitude of the force one wire exerts on a segment of the other (in newtons),
        <strong> L</strong> is the length of that segment (in metres) so <strong>F/L</strong> has units of N/m,
        <strong> I₁</strong> and <strong>I₂</strong> are the currents in the two wires (in amperes, signed by direction),
        <strong> d</strong> is the perpendicular spacing between the wires (in metres), and
        <strong> μ₀ ≈ 1.257×10⁻⁶ T·m/A</strong> is the permeability of free space <Cite id="codata-2018" in={SOURCES} />. Same sign of current → attractive (negative if you've adopted the
        sign convention that "outward" is positive). Opposite signs → repulsive. From 1948 to 2019 the SI ampere was
        defined operationally as exactly the current that, flowing in two infinitely long parallel wires one meter
        apart, produces a force of <strong>2×10⁻⁷ N/m</strong> between them <Cite id="griffiths-2017" in={SOURCES} />.
        That definition is what the <strong>μ₀ = 4π × 10⁻⁷</strong> exact value used to be; the 2019 SI redefinition
        based the ampere instead on the elementary charge <strong>e</strong>, demoting μ₀ to a measured quantity.
      </p>
      <p>
        The product structure is not mysterious — it's just <strong>F = IL × B</strong> applied twice. Each wire sits in the
        field produced by the other: wire 2 feels its partner's field <strong>B₁ = μ₀ I₁ / (2π d)</strong> (the 1/r law from
        the previous section), and the magnetic force on a length <strong>L</strong> of current <strong>I₂</strong> in that
        field is <strong>F = I₂ L B₁</strong>. Substitute and divide by L to get the force per unit length. The
        <strong> 1/d</strong> falloff is the same cylindrical geometry as a single wire; the <strong>I₁ I₂</strong> on top is
        one factor of current for the source field and one for the responding wire. Reverse either current and the cross-product
        sign flips, which is why same-sign currents attract while opposite-sign currents repel — opposite of charges, same
        underlying right-hand rule<Cite id="ampere-1826" in={SOURCES} />.
      </p>

      <TwoParallelWiresDemo />

      <TryIt
        tag="Try 6.2"
        question={<>Two long parallel wires carry <strong>100 A</strong> each in the same direction, separated by <strong>10 cm</strong>. What is the force per unit length between them, and is it attractive or repulsive?</>}
        hint="F/L = μ₀ I₁ I₂ / (2π d). Same direction of current → attractive."
        answer={
          <>
            <Formula>F / L = μ₀ I<sub>1</sub> I<sub>2</sub> / (2π d)</Formula>
            <Formula>F / L = (4π×10⁻⁷)(100)(100) / (2π · 0.10) = <strong>0.02 N/m = 20 mN/m</strong></Formula>
            <p>
              The force is <strong>attractive</strong> (parallel currents pull together)<Cite id="ampere-1826" in={SOURCES} />.
              20 mN/m is about two grams of weight per metre — detectable with a torsion balance, invisible against the
              wire's own tension.
            </p>
          </>
        }
      />

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
        Wires aren't the only things that feel magnetic forces — a single moving charge does too. The <Term def="The force on a charge q moving at velocity v through E and B fields: F = q(E + v × B). The full statement of how electromagnetic fields push charged particles around.">Lorentz force</Term> law, the cleanest statement in all of magnetism, is
      </p>
      <Formula>F = q ( v × B )</Formula>
      <p>
        where <strong>F</strong> is the force vector on the charged particle (in newtons), <strong>q</strong> is its charge
        (in coulombs, signed), <strong>v</strong> is its velocity vector (in m/s), <strong>B</strong> is the local
        magnetic flux density vector (in tesla), and <strong>×</strong> denotes the vector cross product — so the force
        comes out perpendicular to <em>both</em> the velocity and the field. The two facts
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
      <Formula>r = m v / (q B)</Formula>
      <p>
        where <strong>r</strong> is the radius of the circular orbit (in metres), <strong>m</strong> is the particle's mass
        (in kilograms), <strong>v</strong> is its speed perpendicular to <em>B</em> (in m/s), <strong>q</strong> is its
        charge magnitude (in coulombs), and <strong>B</strong> is the magnetic flux density (in tesla).
      </p>
      <p>
        It goes around it with period
      </p>
      <Formula>T = 2π m / (q B)</Formula>
      <p>
        where <strong>T</strong> is the orbital period (in seconds) and <em>m</em>, <em>q</em>, <em>B</em> are as above
        — which, remarkably, has no <strong>v</strong> in it. Faster particles trace bigger circles in <em>exactly</em>
        the same amount of time. That's the foundation of the <Term def="A particle accelerator that uses a uniform B field to bend charged particles into circular orbits and a fixed-frequency oscillating E field between two D-shaped electrodes to accelerate them. Invented by E. O. Lawrence in 1932; works because the cyclotron period T = 2πm/qB is independent of speed (non-relativistically).">cyclotron</Term>, of mass spectrometers, of every accelerator
        smaller than a kilometer across. It's also why an aurora is shaped the way it is: charged particles from the
        sun spiral down Earth's magnetic field lines, drawn toward the poles, depositing their energy into the upper
        atmosphere along the way <Cite id="feynman-II-13" in={SOURCES} />.
      </p>

      <CyclotronDemo />

      <TryIt
        tag="Try 6.3"
        question={<>A 1 m segment of wire carries <strong>5 A</strong> perpendicular to a uniform <strong>B = 0.1 T</strong> field. What is the force on the segment?</>}
        hint="For a straight wire of length L perpendicular to B, F = B I L."
        answer={
          <>
            <Formula>F = B I L = (0.1 T)(5 A)(1 m) = <strong>0.5 N</strong></Formula>
            <p>
              About a 50 g weight per metre of wire. This is the force that runs every motor on Earth: a current-carrying
              wire sitting in a magnetic field feels a sideways push, and arranging the geometry so the push turns into
              rotation is the entire idea of a DC motor<Cite id="griffiths-2017" in={SOURCES} />.
            </p>
          </>
        }
      />

      <TryIt
        tag="Try 6.4"
        question={<>A non-relativistic electron with kinetic energy 1 keV enters a <strong>B = 1 mT</strong> field perpendicular to its velocity. What is its cyclotron radius? (m<sub>e</sub> = 9.11×10⁻³¹ kg, e = 1.602×10⁻¹⁹ C.)</>}
        hint="First find v from ½mv² = KE. Then r = mv/(qB)."
        answer={
          <>
            <p>First convert: KE = 1 keV = 1.602×10⁻¹⁶ J. Solve for v:</p>
            <Formula>v = √(2 · KE / m) = √(2 · 1.602×10⁻¹⁶ / 9.11×10⁻³¹) ≈ 1.88×10⁷ m/s</Formula>
            <p>(About 6% of c, so non-relativistic is borderline but OK.) Then:</p>
            <Formula>r = m v / (q B) = (9.11×10⁻³¹)(1.88×10⁷) / (1.602×10⁻¹⁹ · 1×10⁻³)</Formula>
            <Formula>r ≈ <strong>0.107 m ≈ 11 cm</strong></Formula>
            <p>
              An order-of-magnitude consistency check: the radius scales linearly with v and inversely with B<Cite id="feynman-II-13" in={SOURCES} />.
              Higher field, tighter spiral; faster particle, broader circle.
            </p>
          </>
        }
      />

      <p>
        Inside an ordinary copper wire, the moving charges are conduction electrons, and the same Lorentz force still
        applies — but now in the presence of a billion-billion other charges and a fixed positive lattice. If you put
        a current-carrying conductor in a transverse <strong>B</strong> field, the magnetic force pushes the carriers
        sideways across the slab until enough of them pile up on one face to make a transverse <em>electric</em> field
        that exactly cancels the magnetic deflection in steady state. This is the <Term def="The transverse voltage that appears across a current-carrying slab placed in a perpendicular magnetic field. Its sign reveals the sign of the charge carriers; its magnitude reveals the carrier density. Used to confirm in 1879 that current in metals is carried by negatively-charged particles.">Hall effect</Term>: the voltage across the slab — the
        <em> Hall voltage</em> — has a sign that tells you the sign of the carriers. Edwin Hall used it in 1879 to
        confirm experimentally that current in metals is carried by negative charges <Cite id="hall-1879" in={SOURCES} />,
        decades before anyone knew what an electron was.
      </p>

      <h2>Solenoid: a <em>controllable</em> magnet</h2>

      <p>
        Take a wire, coil it into a tight helix, run a current through it — a <Term def="A long helical coil of wire. When current flows, the turns reinforce each other inside to give a strong, nearly uniform B field along the axis (B = μ₀ n I); outside the field nearly cancels. The simplest practical electromagnet.">solenoid</Term>. Each turn contributes its own magnetic field,
        and inside the bundle they all reinforce each other. Outside, they mostly cancel. The result is a region of
        strong, nearly uniform magnetic field along the solenoid's axis — a permanent-magnet-like field that you can
        switch on and off, and whose strength you control with a knob.
      </p>
      <p>
        For a long solenoid (length much greater than radius), the field inside is
      </p>
      <Formula>B = μ₀ n I</Formula>
      <p>
        where <strong>B</strong> is the magnetic flux density on the solenoid's axis (in tesla),
        <strong> μ₀ ≈ 1.257×10⁻⁶ T·m/A</strong> is the permeability of free space <Cite id="codata-2018" in={SOURCES} />,
        <strong> I</strong> is the current through the wire (in amperes), and <strong>n = N / L</strong> is the number of
        turns per unit length (in turns per metre, with <em>N</em> the total turn count over solenoid length <em>L</em>). No dependence on radius (so long as you
        stay inside), no dependence on where along the axis you measure (so long as you're not near the ends). Outside
        the solenoid the field is, in the idealized limit, exactly zero — the mathematical statement of the fact that
        all the field lines that exit one end have to come back in through the other. There are no isolated sources of B,
        no <Term def="A hypothetical isolated north or south magnetic pole — a source of B field with no opposite-pole counterpart. Has never been observed. Maxwell's equation ∇ · B = 0 encodes the experimental fact that B field lines always close on themselves.">magnetic monopole</Term>s: field lines always close on themselves.
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

      <CaseStudies
        intro={
          <>
            Four places that magnetism shows up at industrial or astrophysical scale — spanning roughly twenty orders of
            magnitude in <strong>B</strong>, all running on the same Biot–Savart and Lorentz equations from this chapter.
          </>
        }
      >
        <CaseStudy
          tag="Case 4.1"
          title="The clinical MRI scanner"
          summary={<em>A superconducting solenoid the size of a car, tuned to flip your hydrogen nuclei.</em>}
          specs={[
            { label: 'Typical clinical B₀', value: '1.5–3 T' },
            { label: 'Research / 7 T systems', value: '7–11.7 T' },
            { label: 'Earth\'s surface field, for comparison', value: '~25–65 µT' },
            { label: 'Solenoid winding', value: 'NbTi at ~4 K' },
            { label: 'Coil current', value: 'hundreds of A' },
            { label: 'Bore diameter', value: '~60 cm' },
          ]}
        >
          <p>
            Paul Lauterbur's 1973 paper in <em>Nature</em> proposed using superimposed magnetic-field gradients on top
            of a strong, uniform static <strong>B₀</strong> to spatially encode an NMR signal — the technique he called
            zeugmatography and that became magnetic resonance imaging<Cite id="lauterbur-1973" in={SOURCES} />. The
            entire scheme depends on the precession of hydrogen nuclei in <strong>B₀</strong>, with the precession
            frequency set by <strong>ω = γ B₀</strong>. A bigger <strong>B₀</strong> means a higher Larmor frequency,
            a larger population difference between spin states, and a stronger signal — which is why clinical scanners
            kept climbing from <strong>0.3 T</strong> in the early 1980s to today's <strong>1.5–3 T</strong>
            workhorses and the small but growing fleet of <strong>7 T</strong> research machines.
          </p>
          <p>
            None of this is possible with copper. To produce <strong>3 T</strong> uniformly over a meter-scale bore,
            the formula <strong>B = µ₀ n I</strong> for a solenoid demands tens of thousands of ampere-turns. A
            resistive copper coil would dissipate megawatts as I²R heat and need active water cooling. Instead,
            clinical MRI magnets are wound from niobium–titanium superconducting wire and cooled in liquid helium near
            <strong> 4 K</strong>; once energised, the coil is short-circuited on itself and the current circulates
            for years with no power input<Cite id="griffiths-2017" in={SOURCES} />.
          </p>
          <p>
            The Lorentz force on iron objects near the bore is dramatic: a steel oxygen cylinder pulled into a
            <strong> 3 T</strong> field has killed patients. The energy stored in the field, <strong>U = B²/(2µ₀)</strong>
            integrated over the bore, runs to several megajoules — comparable to the kinetic energy of a small
            car. A "quench," in which a tiny normal-conducting patch propagates through the windings and dumps that
            energy as helium boil-off, is one of the few engineering failures large enough to vent through the roof
            of a hospital.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 4.2"
          title="The Large Hadron Collider's dipole magnets"
          summary={<em>1232 superconducting magnets, each one bending a proton beam through a 2.8 km arc.</em>}
          specs={[
            { label: 'Dipole magnets in the ring', value: '1232' },
            { label: 'Peak operating field', value: '8.33 T' },
            { label: 'Coil current at peak', value: '11,850 A' },
            { label: 'Operating temperature', value: '1.9 K (superfluid He)' },
            { label: 'Ring circumference', value: '26.7 km' },
            { label: 'Design beam energy', value: '7 TeV per proton' },
          ]}
        >
          <p>
            A relativistic proton moving in a magnetic field traces out a circle of radius <strong>r = p / (qB)</strong>.
            For the LHC's design beam energy of <strong>7 TeV</strong>, that radius works out — given the available
            real estate inside the existing LEP tunnel — to demand a bending field of <strong>8.33 T</strong> in the
            dipole sections<Cite id="bruning-lhc-2004" in={SOURCES} />. To produce it, CERN built and installed
            <strong> 1232</strong> superconducting NbTi dipole magnets, each <strong>14.3 m</strong> long, each carrying
            <strong> 11,850 A</strong> through its windings at the design point.
          </p>
          <p>
            NbTi loses its superconductivity above <strong>~9 T</strong> at <strong>4.2 K</strong>; to push the field
            higher you have to push the temperature lower. The LHC's magnets sit in a bath of superfluid helium at
            <strong> 1.9 K</strong>, which buys back a few hundred millitesla of operating margin and dramatically
            improves the thermal conductivity of the cryogen<Cite id="bruning-lhc-2004" in={SOURCES} />. The whole
            <strong> 27 km</strong> ring is the largest single piece of cryogenic equipment ever built.
          </p>
          <p>
            The fundamental physics is the Lorentz force from this chapter: <strong>F = q(v × B)</strong>, with the
            cross-product geometry forcing the orbit closed. The engineering is everything that goes into producing a
            uniform <strong>8.3 T</strong> field, persistent for hours, across <strong>1232</strong> magnets in series,
            with the bore stable to <strong>~100 µm</strong> over kilometers.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 4.3"
          title="Earth's magnetic field"
          summary={<em>A weak dipole, a leaky shield, and the reason any compass needle ever points north.</em>}
          specs={[
            { label: 'Total intensity at the surface', value: '~25–65 µT' },
            { label: 'Equatorial minimum', value: '~25 µT' },
            { label: 'Polar maximum', value: '~65 µT' },
            { label: 'Source depth', value: '~3000 km (outer core)' },
            { label: 'Polarity reversal interval', value: '~10⁵–10⁶ yr (irregular)' },
          ]}
        >
          <p>
            The World Magnetic Model maintained jointly by the U.S. NCEI and the British Geological Survey gives the
            total intensity of Earth's surface field as roughly <strong>25,000 nT</strong> near the magnetic equator
            and <strong>65,000 nT</strong> near the poles — i.e., <strong>25–65 µT</strong><Cite id="chulliat-wmm-2020" in={SOURCES} />.
            That is about <strong>fifty thousand times</strong> weaker than a clinical MRI, and about a hundred million
            times weaker than the surface of a magnetar. Yet it is enough to align every compass needle on the planet
            and to deflect the solar wind into the auroral ovals.
          </p>
          <p>
            The field is generated by convection of molten iron in Earth's outer core — a self-sustaining magnetohydrodynamic
            dynamo whose current loops are essentially Ampère's law writ planetary: moving electrically conducting
            fluid carries currents, currents make <strong>B</strong>, and feedback between the fluid motion and the
            field locks the whole pattern into a quasi-stable dipole<Cite id="jackson-1999" in={SOURCES} />. The
            "north pole" of the dipole drifts at tens of kilometers per year and reverses irregularly on geological
            timescales.
          </p>
          <p>
            Charged particles streaming from the Sun get deflected by this field via the Lorentz force, spiralling
            down field lines toward the poles where they finally collide with the upper atmosphere. The same equation
            that fixes the cyclotron radius in the earlier section — <strong>r = mv/(qB)</strong> — sets the geometry
            of the magnetosphere<Cite id="feynman-II-13" in={SOURCES} />.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 4.4"
          title="A magnetar"
          summary={<em>The strongest magnets in the known universe, ten quadrillion times the Earth's field.</em>}
          specs={[
            { label: 'Surface dipole field', value: '~10¹⁰–10¹¹ T' },
            { label: 'Ratio to clinical MRI', value: '~3 × 10¹⁰' },
            { label: 'Stellar radius', value: '~10–12 km' },
            { label: 'Rotation period', value: '~2–12 s' },
            { label: 'Lifetime of activity', value: '~10⁴ yr' },
          ]}
        >
          <p>
            Robert Duncan and Christopher Thompson proposed in 1992 that a small subclass of neutron stars are born
            with magnetic fields a thousand times stronger than the typical pulsar — surface dipole fields on the
            order of <strong>10¹⁴–10¹⁵ G</strong>, or <strong>10¹⁰–10¹¹ T</strong>
            <Cite id="duncan-thompson-1992" in={SOURCES} />. They named the objects <em>magnetars</em>. About thirty
            confirmed examples are known in our galaxy.
          </p>
          <p>
            At these field strengths the energy density <strong>B²/(2µ₀)</strong> dominates over every other
            astrophysical energy density nearby, including the rest-mass energy density of ordinary matter for fields
            above <strong>~10¹⁰ T</strong>. The vacuum itself becomes birefringent, the quantum electrodynamic
            corrections to Maxwell's equations stop being small, and the atomic structure of any matter on the
            star's surface is reorganised by the field into long, anisotropic chains aligned with <strong>B</strong>
            <Cite id="jackson-1999" in={SOURCES} />.
          </p>
          <p>
            The same Ampère and Biot–Savart equations from this chapter still apply — they have to, since they're
            just consequences of how moving charge couples to itself — but in regimes where the linear approximations
            of classical electromagnetism start to require relativistic and quantum corrections. Magnetars are the
            extreme test of the equations we've been writing down on a workbench.
          </p>
        </CaseStudy>
      </CaseStudies>

      <FAQ intro="Twelve questions that come up if you take the relativistic-shadow picture seriously.">
        <FAQItem q="If magnetism is just electricity in a different reference frame, why does a stationary bar magnet stick to my fridge — nothing is moving?">
          <p>
            Something <em>is</em> moving — you just can't see it. Every iron atom in the magnet contains electrons with
            intrinsic spin and orbital angular momentum, and each of those is mathematically equivalent to a tiny
            persistent current loop. In a ferromagnet the loops are aligned over macroscopic domains, so their fields
            add instead of cancelling <Cite id="feynman-II-13" in={SOURCES} />. The "stationary" magnet is, at the
            atomic level, a frozen pattern of <strong>~10²³</strong> circulating currents per cubic centimeter.
          </p>
          <p>
            The frame-change argument still works: pick any one of those microscopic loops, hop into the frame of one
            of its electrons, and what looked like a magnetic interaction becomes the relativistic transform of a
            Coulomb interaction <Cite id="jackson-1999" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Where does a bar magnet's field actually come from at the atomic level — currents, or something else?">
          <p>
            Two contributions, and the second one is bigger. Electrons orbiting nuclei contribute a small <em>orbital</em>
            magnetic moment, much like a classical current loop. But the dominant effect in iron, nickel, and cobalt is
            <strong> electron spin</strong> — an intrinsic angular momentum with no classical analog that nonetheless
            carries a magnetic dipole moment of about one Bohr magneton per unspun electron
            <Cite id="griffiths-2017" in={SOURCES} />. When neighboring spins lock into alignment (the exchange
            interaction, a quantum-mechanical effect) you get a ferromagnet.
          </p>
        </FAQItem>

        <FAQItem q="Why doesn't a magnetic force do work on a charged particle?">
          <p>
            Because <strong>F = q(v × B)</strong> is, by construction, perpendicular to <strong>v</strong>. The rate of
            work done is <strong>F · v</strong>, and the dot product of any vector with something perpendicular to it
            is zero <Cite id="griffiths-2017" in={SOURCES} />. So a static <strong>B</strong> field can bend a
            trajectory but cannot change the speed.
          </p>
          <p>
            This is why a cyclotron alone cannot accelerate particles — the actual energy gain comes from the
            time-varying <em>electric</em> field between the dees, with the magnetic field doing nothing but holding
            the orbit closed <Cite id="jackson-1999" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Is there such a thing as a magnetic monopole — a north pole without a south?">
          <p>
            Nobody has ever found one. Cut a bar magnet in half and you get two shorter magnets, each with its own north
            and south, not a north chunk and a south chunk <Cite id="feynman-II-13" in={SOURCES} />. Maxwell's
            equations encode this as <strong>∇ · B = 0</strong>: magnetic field lines never end on a source, they only
            form closed loops <Cite id="jackson-1999" in={SOURCES} />. Grand unified theories generically predict
            monopoles should exist, but the experimental upper limits on their cosmic abundance are extraordinarily
            tight.
          </p>
        </FAQItem>

        <FAQItem q="Why is the tesla such a huge unit — most magnets seem to be in millitesla or microtesla?">
          <p>
            Because <strong>μ₀ = 4π × 10⁻⁷ T·m/A</strong> is tiny <Cite id="codata-2018" in={SOURCES} />. Plug it into
            the field of a long wire and you find that <strong>1 A</strong> at <strong>1 cm</strong> produces only
            <strong> ~2×10⁻⁵ T</strong> — twenty microtesla, comparable to the Earth's field at the ground
            <Cite id="griffiths-2017" in={SOURCES} />. A refrigerator magnet is a few millitesla. A clinical MRI is
            <strong> 1.5 to 3 T</strong>, which is why it takes a superconducting solenoid carrying hundreds of amps to
            produce one.
          </p>
        </FAQItem>

        <FAQItem q="Why do two parallel wires carrying current in the same direction attract, when same-sign charges repel?">
          <p>
            Because magnetic force is not a force between charges; it's a force between <em>currents</em>, and the
            geometry of <strong>v × B</strong> flips the sign you'd naively expect <Cite id="ampere-1826" in={SOURCES} />.
            Wire 1's field at wire 2 circles wire 1; wire 2's current crossed with that field gives a force pulling it
            toward wire 1. Run the right-hand rule both ways and the attraction is symmetric.
          </p>
          <p>
            The relativistic picture is even cleaner: in the rest frame of the drifting electrons in one wire, length
            contraction makes the <em>other</em> wire look slightly positively charged from that frame's perspective,
            and the moving electrons get pulled toward it electrostatically <Cite id="feynman-II-13" in={SOURCES} />.
            Attraction, from Coulomb.
          </p>
        </FAQItem>

        <FAQItem q="What is the right-hand rule actually doing geometrically?">
          <p>
            It's a mnemonic for the orientation of the cross product in a right-handed coordinate system. <strong>v × B</strong>
            is, by definition, perpendicular to both inputs and pointing in whichever of the two perpendicular
            directions makes <strong>{'(v, B, v × B)'}</strong> a right-handed triple <Cite id="griffiths-2017" in={SOURCES} />.
            Your right hand happens to be a right-handed coordinate system, so curling fingers from <strong>v</strong> to
            <strong> B</strong> with thumb extended encodes the orientation manually.
          </p>
          <p>
            If physics had picked the left-handed convention instead, every formula would still work — you'd just flip
            the sign of <strong>B</strong> everywhere and use your left hand. The choice is conventional; the geometry
            is not.
          </p>
        </FAQItem>

        <FAQItem q="What is the cyclotron frequency, and why is it independent of the particle's speed?">
          <p>
            From <strong>r = mv/qB</strong> and <strong>T = 2π r/v</strong>, the speed cancels:
          </p>
          <Formula>f = qB / (2π m)</Formula>
          <p>
            Faster particles trace bigger circles in <em>exactly</em> the same period <Cite id="feynman-II-13" in={SOURCES} />.
            That's the magic that made Lawrence's cyclotron work in 1932: you can drive the accelerating voltage with a
            fixed-frequency oscillator, and the particles stay in phase as their orbit radius grows
            <Cite id="jackson-1999" in={SOURCES} />. The scheme breaks down only at relativistic speeds, where
            <strong> m</strong> gets a γ-factor and the period drifts — fixed by the <em>synchrotron</em>.
          </p>
        </FAQItem>

        <FAQItem q="Why are some materials magnetic and others not?">
          <p>
            Every electron is a tiny magnetic dipole, but in most materials the spins pair up antiparallel inside each
            filled atomic shell, and the net moment is zero or negligible (this is <em>diamagnetism</em> /
            <em> paramagnetism</em>, both of order <strong>10⁻⁵</strong>) <Cite id="griffiths-2017" in={SOURCES} />.
            In iron, nickel, cobalt, and certain rare-earth compounds, an exchange interaction with no classical analog
            energetically favors <em>parallel</em> alignment of neighboring spins over a domain — millions of atoms
            locking into a common direction <Cite id="feynman-II-13" in={SOURCES} />. That's ferromagnetism; that's
            why a fridge magnet works.
          </p>
        </FAQItem>

        <FAQItem q={`What's the difference between B and H — and which one is the "real" magnetic field?`}>
          <p>
            <strong>B</strong> (the magnetic flux density, in tesla) is what shows up in the Lorentz force law and is
            what the rest of physics treats as fundamental. <strong>H</strong> (the magnetic field intensity, in A/m)
            is an engineering bookkeeping construct that separates the field from <em>free</em> currents you control
            from the field from <em>bound</em> currents inside magnetized matter
            <Cite id="jackson-1999" in={SOURCES} />. In vacuum they're proportional: <strong>B = μ₀ H</strong>. In
            iron, <strong>B = μ₀(H + M)</strong>, where <strong>M</strong> is the magnetization of the material
            <Cite id="griffiths-2017" in={SOURCES} />.
          </p>
          <p>
            If you only care about what force a charged particle feels, you only need <strong>B</strong>.
          </p>
        </FAQItem>

        <FAQItem q="Why does iron concentrate magnetic field — what is it actually doing?">
          <p>
            Iron's atomic spins align with whatever external <strong>B</strong> field you apply to it, and their
            cooperative magnetization <strong>M</strong> adds to the original field
            <Cite id="griffiths-2017" in={SOURCES} />. The relative permeability <strong>μᵣ</strong> of soft iron is a
            few thousand, meaning the <strong>B</strong> inside the iron can be a few thousand times the
            <strong> B</strong> you'd have produced in vacuum with the same solenoid current. That's why an
            iron-cored electromagnet lifts a car and an air-cored one of the same wire would barely lift a paperclip
            <Cite id="feynman-II-13" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Can a metal cage shield a region from a magnetic field, the way a Faraday cage shields it from E?">
          <p>
            Not very well, for <em>static</em> magnetic fields. A Faraday cage works because mobile charges in the
            metal rearrange until the interior electric field is zero — but there are no mobile <em>magnetic</em>
            charges to rearrange <Cite id="griffiths-2017" in={SOURCES} />. To shield a steady <strong>B</strong> you
            need a high-permeability material like mu-metal, which acts as a low-reluctance "preferred path" that field
            lines route through, leaving the interior weaker <Cite id="jackson-1999" in={SOURCES} />.
          </p>
          <p>
            For <em>time-varying</em> magnetic fields, ordinary conductors do work: the changing flux induces eddy
            currents whose own field opposes the change, attenuating the field inside (the skin effect).
          </p>
        </FAQItem>

        <FAQItem q="If I shake a charge back and forth, does its magnetic field change instantaneously everywhere?">
          <p>
            No — and this was the central insight Maxwell's equations forced on physics. Any change in the source
            propagates outward at the speed of light <strong>c</strong>, never faster
            <Cite id="jackson-1999" in={SOURCES} />. The constants of magnetism and electricity satisfy
            <strong> μ₀ ε₀ = 1/c²</strong>, which is no coincidence: it's how the wave equation falls out of
            Maxwell's equations <Cite id="codata-2018" in={SOURCES} />.
          </p>
          <p>
            An accelerating charge therefore radiates an outgoing electromagnetic wave, carrying energy away to
            infinity. That's also why "instantaneous action at a distance" is a fiction — fields are local objects
            with their own dynamics <Cite id="feynman-II-13" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why does electric current produce a magnetic field, but moving water doesn't?">
          <p>
            Water is electrically neutral — every cubic millimeter of it contains as much positive charge in the nuclei
            as negative charge in the electrons. When you move neutral matter, you move equal-and-opposite charges
            together, and their magnetic contributions cancel exactly <Cite id="griffiths-2017" in={SOURCES} />.
            What you need for a net <strong>B</strong> is for one species to move relative to the other — which is
            exactly what an electric current is: electrons drifting through a stationary positive lattice
            <Cite id="feynman-II-13" in={SOURCES} />.
          </p>
          <p>
            (If you electrified the water — say, by dissolving salt and applying a voltage so cations and anions drift
            in opposite directions — then yes, the flowing ions <em>do</em> produce a magnetic field, by Ampère's law
            <Cite id="ampere-1826" in={SOURCES} />.)
          </p>
        </FAQItem>

        <FAQItem q="Why does the Hall voltage have a sign — and what did Edwin Hall actually learn from it in 1879?">
          <p>
            The Hall voltage's sign tells you which way the carriers had to deflect in the transverse <strong>B</strong>
            field — and therefore which sign of charge is doing the carrying. Hall measured it on gold and found that
            the carriers behaved as if <em>negative</em>, two decades before J. J. Thomson identified the electron
            <Cite id="hall-1879" in={SOURCES} />. The number was right; the picture wasn't yet available.
          </p>
          <p>
            Today the Hall effect is the standard tool for measuring carrier density and sign in semiconductors — and
            the <em>quantum</em> Hall effect, where the transverse conductance becomes precisely <strong>n e²/h</strong>,
            is one of the cleanest measurements of fundamental constants we have.
          </p>
        </FAQItem>
      </FAQ>
    </ChapterShell>
  );
}
