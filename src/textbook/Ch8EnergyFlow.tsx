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
import { CaseStudies, CaseStudy } from '@/components/CaseStudy';
import { FAQ, FAQItem } from '@/components/FAQ';
import { Cite } from '@/components/SourcesList';
import { Formula, InlineMath } from '@/components/Formula';
import { Term } from '@/components/Term';
import { TryIt } from '@/components/TryIt';
import { PredictThenObserve } from '@/components/PredictThenObserve';
import { BatteryBulbFieldsDemo } from './demos/BatteryBulbFields';
import { BCirculationDemo } from './demos/BCirculation';
import { EAxialFieldDemo } from './demos/EAxialField';
import { PoyntingCoax3DDemo } from './demos/PoyntingCoax3D';
import { PoyntingInflowDemo } from './demos/PoyntingInflow';
import { SuperconductorLimitDemo } from './demos/SuperconductorLimit';
import { WhereDoesEnergyFlowDemo } from './demos/WhereDoesEnergyFlow';
import { getChapter } from './data/chapters';

export default function Ch8EnergyFlow() {
  const chapter = getChapter('energy-flow')!;
  const SOURCES = chapter.sources;

  return (
    <ChapterShell chapter={chapter}>
      <p className="chapter-intro">
        We've spent five chapters building toward a single question, and never asking it. A battery sits on the workbench. A
        bulb sits a meter away. They're connected by a length of copper wire. You close the switch, the bulb glows, and the
        battery loses chemical energy at exactly the rate the bulb gains heat and light. <em className="italic text-text">Where, exactly, does that energy
        go?</em> What path does it take from one to the other?
      </p>
      <p className="mb-prose-3">
        The obvious answer — that it travels through the copper, carried by the moving electrons — turns out to be wrong in a
        way that takes some staring at to accept. The energy never enters the wire. It travels through the empty space
        <em className="italic text-text"> around</em> the wire, in the form of the electromagnetic field, and pours inward into the resistive parts on every
        side at once. The wire isn't the medium. The wire is the destination. Maxwell wrote it down in 1865<Cite id="maxwell-1865" in={SOURCES} />,
        Poynting finished it in 1884<Cite id="poynting-1884" in={SOURCES} />, and Feynman called it "crazy" before teaching it
        anyway<Cite id="feynman-II-27" in={SOURCES} />. This last chapter is the proof.
      </p>

      <h2 className="chapter-h2">The question almost <em>nobody</em> asks</h2>

      <p className="mb-prose-3">
        Most of physics education waves at this question and walks past. "Current carries energy from the battery to the
        bulb." That sentence sounds fine, the way "the sun comes up in the east" sounds fine — true enough at the bookkeeping
        level, false underneath. Current is a flow of charge. It is not a flow of <em className="italic text-text">energy</em>. The two happen to share a
        name in everyday speech ("electricity") but they are different physical things, and in this case they don't even
        travel along the same path.
      </p>
      <p className="mb-prose-3">
        Look at it bluntly. In Chapter&nbsp;2 we calculated the drift speed of an electron in 12-gauge copper at modest
        current: about 0.03 mm/s. Yet the bulb turns on essentially the moment you flip the switch. If energy rode in on the
        backs of the drifting electrons, you would wait several hours after closing the circuit before the first energy-laden
        electrons made it from one end of the wire to the other. They don't carry the energy. Something else does — and that
        something else moves at about ⅔ the speed of light, which is the speed of an electromagnetic disturbance through the
        material surrounding a copper wire.
      </p>

      <BatteryBulbFieldsDemo />

      <p className="mb-prose-3">
        Three physical fields are present in the picture above, and the demo lets you toggle each one on and off. The yellow
        dots are the conduction electrons, drifting along the copper at roughly <strong className="text-text font-medium">10⁻⁴ m/s</strong>. The teal circles are
        the magnetic field <strong className="text-text font-medium">B</strong> curling around each wire segment, set by Ampère's law<Cite id="feynman-II-27" in={SOURCES} />.
        The pink arrows are the electric field <strong className="text-text font-medium">E</strong> — axial inside the conductor (Ohm's law demands it) and
        dipole-style in the surrounding air, threading from the positive terminal to the negative. The amber arrows are the
        Poynting vector <InlineMath id="poynting-vector" />, drawn at every grid point where the other two are visible.
        Look at where those amber arrows point: <em className="italic text-text">into</em> the wire near the bulb, <em className="italic text-text">out of</em> the wire near the
        battery<Cite id="poynting-1884" in={SOURCES} />. The energy is moving through the space around the copper, not along
        its interior.
      </p>

      <WhereDoesEnergyFlowDemo />

      <p className="mb-prose-3">
        The contrast in the demo above is a cartoon, but the cartoon is the entire chapter in miniature. The "old picture" on
        the left is what most people carry around in their head. The "real picture" on the right is what the math actually
        gives you. The rest of this chapter is the derivation.
      </p>

      <h2 className="chapter-h2">Two fields are <em>present</em></h2>

      <p className="mb-prose-3">
        Inside a current-carrying resistive wire there are two electromagnetic fields, both demanded by the equations we've
        already met. Look at them one at a time.
      </p>
      <p className="mb-prose-3">
        First, an electric field along the wire's axis. It has to be there: from Chapter&nbsp;3, microscopic Ohm's law says
        <strong className="text-text font-medium"> J = σ E</strong>, so a steady current density implies a non-zero <strong className="text-text font-medium">E</strong> inside the conductor. In a uniform
        wire of length <strong className="text-text font-medium">L</strong> with voltage drop <strong className="text-text font-medium">V</strong> across its ends, the integral of <strong className="text-text font-medium">E·dℓ</strong> along the
        axis must equal <strong className="text-text font-medium">V</strong>, and by symmetry <strong className="text-text font-medium">E</strong> is uniform along the way<Cite id="feynman-II-27" in={SOURCES} />:
      </p>
      <Formula tex="E = V / L" />
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">E</strong> is the magnitude of the axial electric field inside the wire (in V/m, pointing
        along the wire's axis in the direction of conventional current), <strong className="text-text font-medium">V</strong> is the voltage drop
        across the wire's ends (in volts), and <strong className="text-text font-medium">L</strong> is the wire's length (in metres).
        This is a point that surprises people. In the electrostatic case, the field inside a conductor is zero — the free
        charges rearrange until it is. In a <em className="italic text-text">current-carrying resistive</em> conductor, the field inside is decidedly not
        zero. The non-zero field is exactly what's needed to keep pushing the drifting charge against the friction of the
        lattice. Drop the field, the current stops.
      </p>

      <EAxialFieldDemo />

      <p className="mb-prose-3">
        Second, a magnetic field circling the wire. From Chapter&nbsp;4, Ampère's law tells you that any line integral of
        <strong className="text-text font-medium"> B·dℓ</strong> around a closed loop equals μ<sub>0</sub> times the enclosed current. Wrap that loop around the wire at radius
        <strong className="text-text font-medium"> a</strong> and you get
      </p>
      <Formula tex="B = \\dfrac{\\mu_0\\, I}{2\\pi a}" />
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">B</strong> is the magnitude of the magnetic field at the wire's surface (in teslas),
        <strong className="text-text font-medium"> I</strong> is the current through the wire (in amperes), <strong className="text-text font-medium">a</strong> is the wire's radius
        (in metres), and <strong className="text-text font-medium">μ₀ = 4π×10⁻⁷ T·m/A</strong> is the vacuum permeability<Cite id="codata-2018" in={SOURCES} />.
        The direction is set by the right-hand rule: thumb along the current, fingers curl with the field.
        It's a circumferential field. Perpendicular at every point to the axial <strong className="text-text font-medium">E</strong> we just identified.
      </p>

      <BCirculationDemo />

      <p className="mb-prose-3">
        Two fields, perpendicular to each other, present everywhere along a current-carrying wire. That perpendicularity is
        about to do an enormous amount of work.
      </p>

      <h2 className="chapter-h2">Cross product → <em>radial</em> inflow</h2>

      <p className="mb-prose-3">
        Maxwell, in the same 1865 paper that gave the world his complete equations, identified a quantity that bookkept where
        electromagnetic energy lives and how it moves<Cite id="maxwell-1865" in={SOURCES} />. The full derivation was tidied
        up nineteen years later by John Henry Poynting, who showed in a single elegant paper that the energy flux per unit
        area at any point in space is given by the cross product of <strong className="text-text font-medium">E</strong> and <strong className="text-text font-medium">B</strong>, scaled by the
        permeability of free space<Cite id="poynting-1884" in={SOURCES} />, a quantity now known as the{' '}
        <Term def={<><strong className="text-text font-medium">Poynting vector</strong> — the local electromagnetic energy-flux density, <em className="italic text-text">S = (1/μ₀) E × B</em>. SI units W/m². Points in the direction electromagnetic energy is flowing.</>}>Poynting vector</Term>:
      </p>
      <Formula large id="poynting-vector" />
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">S</strong> (a vector) is the local electromagnetic energy-flux density at a point in space,
        <strong className="text-text font-medium"> E</strong> is the local electric field (in V/m), <strong className="text-text font-medium">B</strong> is the local magnetic field
        (in teslas), <strong className="text-text font-medium">μ<sub>0</sub> = 4π×10⁻⁷ T·m/A</strong> is the vacuum permeability, and "<strong className="text-text font-medium">×</strong>" is
        the ordinary vector cross product (so <strong className="text-text font-medium">S</strong> is perpendicular to both <strong className="text-text font-medium">E</strong> and
        <strong className="text-text font-medium"> B</strong>). <strong className="text-text font-medium">S</strong> has units of watts per square meter — energy per unit time, per unit cross-sectional area, in the direction
        the energy is moving. It is a real, local field defined at every point in space where electric and magnetic fields are
        both present<Cite id="griffiths-2017" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        Now turn the right-hand rule on the situation we built in the last section. <strong className="text-text font-medium">E</strong> points along the wire's axis;
        <strong className="text-text font-medium"> B</strong> circles the wire. Their cross product points{' '}
        <Term def={<><strong className="text-text font-medium">radial flux</strong> — energy or field flow pointing along the cylindrical radius (toward or away from the axis). For a current-carrying wire, the Poynting vector points radially inward at the surface.</>}>radially inward</Term>, perpendicular to both, on every side of
        the wire at once. Energy is flowing into the wire. It comes from the surrounding space — from <em className="italic text-text">everywhere</em> in
        the surrounding space — and gets absorbed at the surface.
      </p>
      <p className="mb-prose-3">
        This is the picture Feynman puts in the bluntest possible terms in Volume II of the Lectures<Cite id="feynman-II-27" in={SOURCES} />:
      </p>
      <p className="pullout">
        "Since the wire has resistance, there is an electric field along it, driving the current… the <strong className="text-text font-medium">E</strong> and
        <strong className="text-text font-medium"> B</strong> are at right angles; therefore there is a Poynting vector directed radially inward… <em className="italic text-text">there is a
        flow of energy into the wire all around.</em>"
      </p>

      <h2 className="chapter-h2">The integral that <em>closes</em> the loop</h2>

      <p className="mb-prose-3">
        It's one thing to wave at the radial direction; it's another to count the joules. Do the algebra. At the wire's
        surface,
      </p>
      <Formula tex="|S|_{\\text{surf}} = \\dfrac{E B}{\\mu_0} = \\dfrac{V I}{2\\pi a L}" />
      <p className="mb-prose-3">
        where the second equality just substitutes <em className="italic text-text">E = V/L</em> and <em className="italic text-text">B = μ<sub>0</sub>I/(2πa)</em> from above. The
        wire's lateral surface area is <strong className="text-text font-medium">2πaL</strong>. So the total energy flowing inward through that surface, per
        second, is the{' '}
        <Term def={<><strong className="text-text font-medium">surface integral</strong> — the integral of a vector field's normal component over a (typically closed) surface. For the Poynting vector, ∮ S · dA gives the total electromagnetic power flowing across that surface.</>}>surface integral</Term>
      </p>
      <Formula tex="\\oint \\vec{S}\\cdot d\\vec{A} = |S|_{\\text{surf}} \\cdot 2\\pi a L = V I" />
      <p className="mb-prose-3">
        Exactly <strong className="text-text font-medium">VI</strong>. The{' '}
        <Term def={<><strong className="text-text font-medium">Poynting flux</strong> — the integral of the Poynting vector over a surface, ∮ S · dA. Gives the net electromagnetic power crossing that surface in watts.</>}>Poynting flux</Term>{' '}
        through the wire's surface equals the dissipated power, identically, by
        construction. No approximation. No "in the limit of." It is the same quantity, written in two different ways<Cite id="jackson-1999" in={SOURCES} />.
      </p>

      <PredictThenObserve
        storageKey="ch8-poynting-inflow"
        question={
          <>
            A battery powers a bulb through two copper wires. The energy that ends up lighting the bulb travels primarily through …
          </>
        }
        spec={{
          kind: 'multiple-choice',
          options: [
            { id: 'a', label: 'The copper of the wires themselves' },
            { id: 'b', label: 'The empty space (field) alongside the wires' },
            { id: 'c', label: 'The air inside the bulb' },
            { id: 'd', label: 'Inside the filament, end to end' },
          ],
          correctIds: ['b'],
        }}
        reveal={() => (
          <>
            This is the entire chapter's punchline. The Poynting vector <InlineMath id="poynting-vector" /> points <em className="italic text-text">into</em> the wire from
            the surrounding field, not along the wire's length.
          </>
        )}
      >
        <PoyntingInflowDemo />
      </PredictThenObserve>

      <p className="mb-prose-3">
        The "P_surf / P_VI = 1.000" readout in the demo above is the entire chapter compressed into one number. Move any
        slider you like — the ratio doesn't budge. It can't. The integral and the algebra are the same statement.
      </p>

      <p className="mb-prose-3">
        That demo collapses the geometry into a flat side-view, which is the right move for getting the algebra to land but
        hides the cross-product structure of <InlineMath id="poynting-vector" />. Spin the next one — a coaxial cable
        in 3D. Pink radial <strong className="text-text font-medium">E</strong> threads from the inner conductor to the outer braid, teal circumferential
        <strong className="text-text font-medium"> B</strong> wraps the inner conductor, and their cross product points <em className="italic text-text">along</em> the cable axis<Cite id="pozar-2011" in={SOURCES} />.
        Every joule the source delivers to the load streams through the empty dielectric between the two conductors, not
        through the copper itself.
      </p>
      <p className="mb-prose-3">
        The same surface-integral identity holds, with the surface now a cross-sectional disk of the dielectric:
        <InlineMath tex="\\oint \\vec{S}\\cdot d\\vec{A} = V I" /> exactly<Cite id="poynting-1884" in={SOURCES} /><Cite id="feynman-II-27" in={SOURCES} />.
      </p>

      <PoyntingCoax3DDemo />

      <TryIt
        tag="Try 8.1"
        question={
          <>A straight copper wire of radius <strong className="text-text font-medium">a = 1 mm</strong> and length <strong className="text-text font-medium">L = 1 m</strong> drops
          <strong className="text-text font-medium"> V = 12 V</strong> across its ends while carrying <strong className="text-text font-medium">I = 5 A</strong>. Compute the magnitude of the
          Poynting vector at the wire's surface.</>
        }
        hint={<>At the surface, <InlineMath tex="|S| = E\\cdot B/\\mu_0 = VI/(2\\pi a L)" />. Plug numbers directly.</>}
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">
              Use the surface formula derived in this section<Cite id="feynman-II-27" in={SOURCES} />:
            </p>
            <Formula tex="|S|_{\\text{surf}} = \\dfrac{V I}{2\\pi a L}" />
            <p className="mb-prose-1 last:mb-0">
              Plugging in: <em className="italic text-text">2π a L</em> = 2π × (10⁻³ m) × (1 m) ≈ 6.283×10⁻³ m². Then
              <em className="italic text-text"> V I</em> = 12 × 5 = 60 W, so
            </p>
            <Formula tex="|S|_{\\text{surf}} = 60 / 6.283\\times 10^{-3} \\approx 9.55\\times 10^{3}\\ \\text{W/m}^2" />
            <p className="mb-prose-1 last:mb-0">
              About <strong className="text-text font-medium">9.5 kW/m²</strong> of Poynting flux pouring radially inward at every point on the wire's
              surface — a few times the solar constant<Cite id="kopp-lean-2011" in={SOURCES} />, in the air around a
              modestly resistive bit of copper.
            </p>
          </>
        }
      />

      <TryIt
        tag="Try 8.2"
        question={
          <>For that same wire, verify directly that the total Poynting flux integrated over the lateral surface equals
          the dissipated power <strong className="text-text font-medium">VI</strong>.</>
        }
        hint={<>Multiply <InlineMath tex="|S|_{\\text{surf}}" /> by the lateral surface area <InlineMath tex="2\\pi a L" />.</>}
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">
              The lateral surface area is <strong className="text-text font-medium">2π a L</strong>. The Poynting flux is uniform on the surface
              and points inward, so<Cite id="jackson-1999" in={SOURCES} />:
            </p>
            <Formula tex="\\oint \\vec{S}\\cdot d\\vec{A} = |S|_{\\text{surf}} \\cdot 2\\pi a L = [V I / (2\\pi a L)] \\cdot (2\\pi a L) = V I" />
            <p className="mb-prose-1 last:mb-0">
              Numerically, <em className="italic text-text">9.55×10³ × 6.283×10⁻³</em> = <strong className="text-text font-medium">60 W</strong> — identical to <em className="italic text-text">VI</em> = 12 × 5 = 60 W.
              The 2π a L on top cancels the 2π a L on bottom; the geometry drops out completely. This is not coincidence —
              it is the local form of Poynting's theorem<Cite id="poynting-1884" in={SOURCES} />, in two lines.
            </p>
          </>
        }
      />

      <p className="pullout">
        The wire is not the medium. The wire is the destination.
      </p>

      <h2 className="chapter-h2">Davis &amp; Kaplan and the <em>real</em> circuit</h2>

      <p className="mb-prose-3">
        The setup we just walked through is a 2D toy: an infinitely long, perfectly straight wire of uniform resistivity. Real
        circuits are curvier than that. They loop. They have batteries with internal structure. They have wires of different
        thicknesses and resistances. Does the picture survive contact with a realistic geometry, or is it an artifact of
        idealization?
      </p>
      <p className="mb-prose-3">
        Basil Davis and Lev Kaplan answered the question carefully in 2011<Cite id="davis-kaplan-2011" in={SOURCES} />. They
        computed the full three-dimensional Poynting field around a circular loop containing a battery and a resistive arc,
        evaluating <strong className="text-text font-medium">E</strong> and <strong className="text-text font-medium">B</strong> at every point in the surrounding space and integrating <strong className="text-text font-medium">S</strong> in
        and out of the various conductors. The result is exactly what energy conservation requires: field lines of <strong className="text-text font-medium">S</strong>
        thread through every point in the space surrounding the circuit, the net flux entering the resistive segment equals
        the power dissipated there, and the same flux <em className="italic text-text">leaves</em> the battery, which acts as a source of field-energy.
        Morris and Styer have visualized the 2D version explicitly, plotting the Poynting flow along equipotentials in a
        simple parallel-rail geometry<Cite id="morris-styer-2012" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        The picture is robust. With conductors only at the boundaries, the energy lives in the field that fills the rest of
        space, and the wire is just where the field gives it up.
      </p>

      <h2 className="chapter-h2">The <em>superconductor</em> limit</h2>

      <p className="mb-prose-3">
        One last sanity check, and it's a beautiful one. Push the conductivity to infinity. What happens?
      </p>
      <p className="mb-prose-3">
        From microscopic Ohm's law, <strong className="text-text font-medium">E = J/σ</strong>. As σ → ∞ at fixed current density, the axial field inside the
        conductor must go to zero. (You cannot sustain a non-zero <strong className="text-text font-medium">E</strong> in a perfect{' '}
        <Term def={<><strong className="text-text font-medium">superconductor</strong> — a material with exactly zero DC electrical resistance below a critical temperature. Persistent currents flow with no voltage drop and no dissipation; the axial E-field inside vanishes.</>}>superconductor</Term>{' '}at equilibrium —
        the free charges would rearrange instantly.) So <strong className="text-text font-medium">E</strong> inside the wire vanishes, and so does <strong className="text-text font-medium">S</strong>
        inside. The energy doesn't enter at all. It keeps streaming, parallel to the wire, in the surrounding space, and slides
        on past untouched<Cite id="griffiths-2017" in={SOURCES} /><Cite id="jackson-1999" in={SOURCES} />.
      </p>

      <SuperconductorLimitDemo />

      <p className="mb-prose-3">
        Resistance, then, is what couples the field to the lattice. It is the mechanism by which the surrounding electromagnetic
        energy actually finds its way into the metal as heat. Without resistance, the field is a perfectly good guide — the
        wire constrains where the current flows, which constrains where <strong className="text-text font-medium">B</strong> is, which constrains where the
        energy goes — but no joules are lost from the field along the way. In a circuit with one resistor and superconducting
        leads, the entire energy budget happens at the resistor. The leads are just rails for the field.
      </p>

      <TryIt
        tag="Try 8.3"
        question={
          <>Sunlight at the top of Earth's atmosphere delivers a time-averaged Poynting flux of about
          <strong className="text-text font-medium"> 1361 W/m²</strong>. What is the corresponding peak electric-field amplitude <em className="italic text-text">E₀</em> in the wave?</>
        }
        hint={<>For a plane wave in vacuum, <InlineMath tex="\\langle|S|\\rangle = \\tfrac{1}{2} c \\varepsilon_0 E_0^2" />. Solve for <InlineMath tex="E_0" />.</>}
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">
              The time-averaged Poynting magnitude for a plane wave is<Cite id="jackson-1999" in={SOURCES} />:
            </p>
            <Formula tex="\\langle|S|\\rangle = \\tfrac{1}{2} c \\varepsilon_0 E_0^2" />
            <p className="mb-prose-1 last:mb-0">
              Solve for <em className="italic text-text">E₀</em>:
            </p>
            <Formula tex="E_0 = \\sqrt{2 \\langle|S|\\rangle / (c \\varepsilon_0)}" />
            <p className="mb-prose-1 last:mb-0">
              Plug in <em className="italic text-text">⟨|S|⟩</em> = 1361 W/m²<Cite id="kopp-lean-2011" in={SOURCES} />, <em className="italic text-text">c</em> = 2.998×10⁸ m/s, and
              <em className="italic text-text"> ε₀</em> = 8.854×10⁻¹² F/m<Cite id="codata-2018" in={SOURCES} />:
            </p>
            <Formula tex="E_0 = \\sqrt{2 \\times 1361 / (2.998\\times 10^{8} \\times 8.854\\times 10^{-12})} \\approx 1013\\ \\text{V/m}" />
            <p className="mb-prose-1 last:mb-0">
              About <strong className="text-text font-medium">1.0 kV/m</strong> of peak oscillating electric field, threading every cubic meter of space
              between here and the Sun.
            </p>
          </>
        }
      />

      <TryIt
        tag="Try 8.4"
        question={
          <>An ideal lossless capacitor is driven by a sinusoidal voltage source. Over one complete AC cycle, what is the
          net Poynting flux into the capacitor's volume?</>
        }
        hint="No resistance means no time-averaged dissipation; Poynting's theorem is then telling you something about reactive energy."
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">
              <strong className="text-text font-medium">Zero, on time-average.</strong> While the capacitor charges, <strong className="text-text font-medium">S</strong> flows radially inward from
              the surrounding space into the gap, building up field energy <em className="italic text-text">½ ε₀ E²</em> per unit volume in the dielectric.
              On discharge the flow reverses and the same energy streams back out into the external circuit
              <Cite id="griffiths-2017" in={SOURCES} />. Integrate over a full cycle and the inflow and outflow cancel
              identically<Cite id="jackson-1999" in={SOURCES} />:
            </p>
            <Formula tex="\\langle \\oint \\vec{S}\\cdot d\\vec{A} \\rangle_{\\text{cycle}} = 0" />
            <p className="mb-prose-1 last:mb-0">
              In circuit-theory language, an ideal capacitor consumes zero <em className="italic text-text">real</em> power; in field language, the
              Poynting flux is purely reactive. Energy sloshes in and out through space twice per cycle with no net transfer.
            </p>
          </>
        }
      />

      <TryIt
        tag="Try 8.5"
        question={
          <>A <strong className="text-text font-medium">100 Ω</strong> resistor has <strong className="text-text font-medium">10 V</strong> across it. Without using the
          formula <em className="italic text-text">P = V²/R</em>, show that the Poynting flow into the resistor delivers exactly the dissipated power.</>
        }
        hint={<>Compute the current first, then use <InlineMath tex="\\oint \\vec{S}\\cdot d\\vec{A} = V I" /> from this chapter's derivation.</>}
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">
              The current is <em className="italic text-text">I = V/R</em> = 10 / 100 = <strong className="text-text font-medium">0.1 A</strong>. The Poynting integral over the resistor's
              surface gives<Cite id="feynman-II-27" in={SOURCES} />:
            </p>
            <Formula tex="\\oint \\vec{S}\\cdot d\\vec{A} = V I = 10 \\times 0.1 = 1.0\\ \\text{W}" />
            <p className="mb-prose-1 last:mb-0">
              And for cross-check, <em className="italic text-text">V²/R</em> = 100 / 100 = <strong className="text-text font-medium">1.0 W</strong>. The two routes give the same answer
              because they are the same energy-conservation statement — one written as a surface integral of field flux, the
              other as a volume integral of <strong className="text-text font-medium">J·E</strong>, balanced by Poynting's theorem<Cite id="poynting-1884" in={SOURCES} />.
            </p>
          </>
        }
      />


      <h2 className="chapter-h2">What the textbook was <em>for</em></h2>

      <p className="mb-prose-3">
        Look back at where we started. Chapter&nbsp;1 opened with a balloon stuck to a wall and asked what charge actually is.
        We built up a field that fills space (Ch.&nbsp;1), figured out the language of potential and current (Ch.&nbsp;2), the
        atomic-scale choreography of resistance and dissipation (Ch.&nbsp;3), the magnetism that any moving charge produces
        (Ch.&nbsp;4), and the way changing fields give birth to other fields (Ch.&nbsp;5). At every stage the wire kept
        showing up, and at every stage we were tempted to think of the wire as the protagonist — the thing energy was traveling
        through.
      </p>
      <p className="mb-prose-3">
        It wasn't. The field was. The wire was the boundary condition that told the field what shape to take, and a place
        for the field to deposit its energy when there was friction to absorb it. Everything else — voltage, current,
        resistance, induction — is bookkeeping for the field's behavior in the space around the conductor. The conductor was
        never the protagonist. The space outside it was.
      </p>
      <p className="mb-prose-3">
        That is what electricity actually is.
      </p>

      <CaseStudies
        intro={
          <>
            Three places the Poynting picture is not a thought experiment but the standard engineering description —
            from a coaxial cable on a workbench to the entire global solar energy budget.
          </>
        }
      >
        <CaseStudy
          tag="Case 6.1"
          title="Coaxial cable"
          summary={<em className="italic text-text">The signal travels in the plastic between the conductors. The copper just guides it.</em>}
          specs={[
            { label: 'Standard impedance (RF / video)', value: '50 Ω or 75 Ω' },
            { label: 'Mode of propagation', value: 'TEM (Transverse Electromagnetic)' },
            { label: 'Velocity factor (typical)', value: '0.66–0.85 × c' },
            { label: 'Loss in inner conductor (DC, ideal SC)', value: '0' },
            { label: 'Cross-section integral of S', value: <>= <InlineMath tex="VI" /> exactly</> },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            A coaxial cable is the cleanest possible test of Chapter 6's central claim. For an ideal lossless line
            with inner radius <strong className="text-text font-medium">a</strong> and outer radius <strong className="text-text font-medium">b</strong>, the static <strong className="text-text font-medium">E</strong>
            between the conductors is purely radial, and the magnetostatic <strong className="text-text font-medium">B</strong> is purely
            circumferential. Their cross product <InlineMath id="poynting-vector" /> points axially, along the cable,
            in the direction of energy flow<Cite id="pozar-2011" in={SOURCES} />. Integrate <strong className="text-text font-medium">S</strong> over
            any cross-section of the dielectric and the answer is <strong className="text-text font-medium">VI</strong> — exactly. The conductors
            themselves carry zero energy along their interior, in the limit of perfect conductivity
            <Cite id="jackson-1999" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            The characteristic impedance, the parameter every RF engineer lives by, is set by the geometry of the
            dielectric region between the conductors: <InlineMath tex="Z_0 = (\\eta / 2\\pi) \\cdot \\ln(b/a) / \\sqrt{\\varepsilon_r}" />, with
            <InlineMath tex="\\eta \\approx 377\\ \\Omega" /> the impedance of free space<Cite id="pozar-2011" in={SOURCES} />. Standard
            RG-6 video cable comes out to <strong className="text-text font-medium">75 Ω</strong>; RG-58 instrumentation cable to <strong className="text-text font-medium">50 Ω</strong>.
            The propagation speed is <InlineMath tex="c/\\sqrt{\\varepsilon_r}" />, which for typical polyethylene dielectrics works out
            to roughly <strong className="text-text font-medium">~0.66 c</strong> — exactly the "two-thirds the speed of light" number that keeps
            appearing throughout this book.
          </p>
          <p className="mb-prose-2 last:mb-0">
            At gigahertz frequencies the skin effect pushes whatever current does flow in the metal out to the
            surface within a few micrometers. From the field's point of view, the inside of the conductor is empty
            space the signal never visits<Cite id="griffiths-2017" in={SOURCES} />. The wire is, more literally
            than the rest of the book makes it sound, just a guide for the field's boundary condition.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 6.2"
          title="A solar panel and the Sun's Poynting flux"
          summary={<em className="italic text-text">1361 watts per square meter, streaming across 150 million kilometers of vacuum.</em>}
          specs={[
            { label: 'Total solar irradiance at 1 AU', value: '1360.8 ± 0.5 W/m²' },
            { label: 'Distance traveled', value: '~1.496 × 10¹¹ m' },
            { label: 'Travel time', value: '~8.3 min' },
            { label: 'Earth\'s intercepted power', value: '~1.74 × 10¹⁷ W' },
            { label: 'Annual global energy demand (2024)', value: '~6 × 10²⁰ J' },
            { label: 'Same as Earth\'s intercept for', value: '~1 hour' },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            The solar constant — the time-averaged <strong className="text-text font-medium">|S|</strong> arriving at the top of Earth's atmosphere
            from the Sun — was measured most precisely by the SORCE/TIM space radiometer during the 2008 solar
            minimum at <strong className="text-text font-medium">1360.8 ± 0.5 W/m²</strong><Cite id="kopp-lean-2011" in={SOURCES} />. That is a
            real, local Poynting flux. Every square meter of cross-section between here and the photosphere is
            carrying that much energy per second across vacuum at the speed of light — the same vector field
            <InlineMath id="poynting-vector" /> that flows into a resistive wire in the rest of this chapter.
          </p>
          <p className="mb-prose-2 last:mb-0">
            For a propagating electromagnetic wave in vacuum, <strong className="text-text font-medium">E</strong> and <strong className="text-text font-medium">B</strong> are
            mutually perpendicular and in phase, with the time-averaged Poynting magnitude
            <InlineMath tex="\\langle|S|\\rangle = \\tfrac{1}{2} c \\varepsilon_0 E_0^2" /><Cite id="jackson-1999" in={SOURCES} />. Plugging in the solar
            constant gives a peak field amplitude near Earth of <strong className="text-text font-medium">E₀ ≈ 1000 V/m</strong>, with a
            corresponding <strong className="text-text font-medium">B₀ ≈ 3 µT</strong> — comparable in magnitude to the geomagnetic field. The Sun
            quietly streams a few microtesla of oscillating <strong className="text-text font-medium">B</strong> through every cubic meter of empty
            space inside Earth's orbit, all day, forever.
          </p>
          <p className="mb-prose-2 last:mb-0">
            A photovoltaic panel is a region where the Poynting flux from the Sun gets absorbed in a thin
            semiconductor and partly redirected into an electrical circuit. The absorption mechanism is quantum (a
            photon promoting an electron across the bandgap), but the bookkeeping is purely classical: incoming
            Poynting flux equals dissipated solar power plus delivered electrical power plus radiated thermal
            output<Cite id="poynting-1884" in={SOURCES} />. The same conservation equation that says
            <InlineMath tex="\\oint \\vec{S}\\cdot d\\vec{A} = VI" /> for a resistive wire says <InlineMath tex="\\int \\vec{S}\\cdot d\\vec{A} = P_{\\text{in}}" /> for the front
            face of a solar panel.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 6.3"
          title="The HTS power cable demonstration"
          summary={<em className="italic text-text">A superconducting transmission line in service: nearly all the energy stays in the dielectric.</em>}
          specs={[
            { label: 'Operating voltage class', value: '~66 kV' },
            { label: 'Phase current', value: '~2–3 kA' },
            { label: 'Conductor', value: 'BSCCO or YBCO tape' },
            { label: 'Operating temperature', value: '~70 K (liquid nitrogen)' },
            { label: 'Resistive loss in the SC core', value: 'essentially 0' },
            { label: 'Net AC losses', value: 'a few W/m (cooling overhead dominates)' },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            High-temperature superconducting (HTS) power cables have been operated at utility scale since the
            mid-2000s — Yokohama, Albany, Essen and others — using BSCCO- or YBCO-coated tape conductors cooled by
            forced-flow liquid nitrogen at around <strong className="text-text font-medium">70 K</strong><Cite id="green-bohn-2015" in={SOURCES} />.
            Inside the superconducting core the DC resistance is exactly zero; even at <strong className="text-text font-medium">50/60 Hz</strong>
            the residual AC loss in the tape is a few watts per meter, dwarfed by the cryogenic overhead of keeping
            the cryostat cold.
          </p>
          <p className="mb-prose-2 last:mb-0">
            In the Chapter 6 language: as <InlineMath tex="\\sigma \\to \\infty" />, the axial <strong className="text-text font-medium">E</strong> inside the
            conductor goes to zero, and so does the radial component of <strong className="text-text font-medium">S</strong> at the conductor's
            surface<Cite id="griffiths-2017" in={SOURCES} />. The Poynting flux stays in the surrounding
            dielectric and slides on past the conductor untouched. All of the dissipation moves to whatever
            normal-conducting load finally closes the circuit at the far end<Cite id="jackson-1999" in={SOURCES} />.
            The leads are rails for the field; the resistor is where the joules actually land.
          </p>
          <p className="mb-prose-2 last:mb-0">
            Conventional copper transmission cables lose a few percent of delivered power to I²R heating across
            hundreds of kilometers; HTS demonstrators have shown that, in principle, that loss can be moved off
            the conductor entirely. The reason it hasn't displaced copper in the grid is not the physics — the
            Poynting integral works exactly as Chapter 6 predicts — but the engineering of cryogenics at
            kilometer scale.
          </p>
        </CaseStudy>
      </CaseStudies>

      <FAQ
        intro="The last chapter is the one that produces the most leftover questions. These are the ones that come up when the picture has finally landed and the reader starts pressing on it."
      >
        <FAQItem q="If the energy flows through space and not the wire, why does the wire matter at all?">
          <p>
            Because the wire is what shapes the field. The Poynting vector <InlineMath id="poynting-vector" /> is
            only nonzero where <strong className="text-text font-medium">E</strong> and <strong className="text-text font-medium">B</strong> both have components transverse to one another, and
            both of those fields are sourced by the charges sitting on (and currents flowing through) the conductor
            <Cite id="poynting-1884" in={SOURCES} />. Take the wire away and the boundary condition vanishes — no surface
            charge to set up the axial <strong className="text-text font-medium">E</strong>, no enclosed current to set up the circumferential <strong className="text-text font-medium">B</strong>,
            no <strong className="text-text font-medium">S</strong>. The wire isn't carrying energy; it's <em className="italic text-text">configuring</em> the surrounding field so that
            energy has somewhere to go<Cite id="jackson-1999" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Where does the Poynting vector get its energy from in the first place?">
          <p>
            From the battery — or whatever EMF source is driving the circuit. Inside an ideal battery, chemical (or
            mechanical, or thermal) energy is converted into field energy: the source maintains a non-electrostatic force
            that does work pushing positive charge from low to high potential, and that work ends up stored in the
            electromagnetic field surrounding the whole circuit<Cite id="griffiths-2017" in={SOURCES} />. Davis and Kaplan
            verified this explicitly for a circular circuit, showing that the net Poynting flux <em className="italic text-text">leaving</em> the
            battery equals the net flux <em className="italic text-text">entering</em> the resistive arc, with both equal to <InlineMath tex="VI" />
            <Cite id="davis-kaplan-2011" in={SOURCES} />. The battery is a Poynting source. The resistor is a Poynting
            sink.
          </p>
        </FAQItem>

        <FAQItem q="Is the Poynting flow real, or is it just a bookkeeping convenience?">
          <p>
            It's as real as any local energy current can be. The differential statement
          </p>
          <Formula tex="\\partial u/\\partial t + \\nabla\\cdot\\vec{S} = -\\vec{J}\\cdot\\vec{E}" />
          <p>
            where <strong className="text-text font-medium">u</strong> is the local electromagnetic energy density (in J/m³, given by
            <InlineMath tex="\\tfrac{1}{2}\\varepsilon_0 E^2 + B^2/(2\\mu_0)" />), <InlineMath tex="\\partial u/\\partial t" /> is its partial derivative with respect to time at
            a fixed point in space, <InlineMath tex="\\nabla\\cdot\\vec{S}" /> is the divergence of the Poynting vector (in W/m³), and
            <InlineMath tex="\\vec{J}\\cdot\\vec{E}" /> is the dot product of the current density (in A/m²) and the electric field (in
            V/m), i.e., the local rate at which the field does work on charges (W/m³). The equation
            is a pointwise conservation law: field energy density <strong className="text-text font-medium">u</strong> changes at any point only by net
            <strong className="text-text font-medium"> S</strong> divergence or by mechanical work done on charge<Cite id="poynting-1884" in={SOURCES} />. You
            can't relocate that statement to "the wire" without violating local energy conservation. Strictly speaking, the
            equations only fix <strong className="text-text font-medium">S</strong> up to the curl of an arbitrary vector field, so the precise local value
            has a gauge-like ambiguity — but the <em className="italic text-text">integrated</em> flux through any closed surface is uniquely determined
            and matches experiment in every case ever tested<Cite id="jackson-1999" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="If I cut the wire mid-circuit, the bulb goes out almost instantly. What changed in the field?">
          <p>
            The boundary condition collapsed and the field reconfigured at the speed of light. The moment the gap opens,
            charge piles up on the two new ends until the axial <strong className="text-text font-medium">E</strong> inside what's left of the wire is
            cancelled — and once <strong className="text-text font-medium">E</strong> inside the conductor goes to zero, so does <InlineMath tex="\\vec{J} = \\sigma\\vec{E}" /> and
            so does the circumferential <strong className="text-text font-medium">B</strong>. With both fields gone, <InlineMath id="poynting-vector" />
            is zero everywhere near the bulb<Cite id="feynman-II-27" in={SOURCES} />. The "off" signal propagates outward
            from the cut at roughly ⅔ <em className="italic text-text">c</em> in copper, which is why "instantly" is a perfectly good first
            approximation at human scales but wrong at nanosecond ones<Cite id="griffiths-2017" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Does the Poynting picture also work in AC circuits?">
          <p>
            Yes, and it gets more interesting. The fields oscillate, so <strong className="text-text font-medium">S(t)</strong> oscillates with them — but
            the time-averaged Poynting vector still points into resistive loads at the rate of real power delivered,
          </p>
          <Formula tex="\\langle\\vec{S}\\rangle \\cdot d\\vec{A}\\ \\text{averaged over a cycle} = \\langle VI \\rangle = V_{\\text{rms}} I_{\\text{rms}} \\cos\\varphi" />
          <p>
            where <em className="italic text-text">φ</em> is the load's phase angle<Cite id="jackson-1999" in={SOURCES} />. For purely reactive
            components — ideal capacitors and inductors — <InlineMath tex="\\langle\\vec{S}\\rangle = 0" />. Energy sloshes in and out through space twice per cycle
            with no net transfer; that's exactly what "reactive power" is, written in field language
            <Cite id="griffiths-2017" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Inside an ideal battery, what direction does the Poynting flow point?">
          <p>
            Outward. Inside the source, the non-electrostatic EMF drives positive charge from low to high potential, so the
            current <strong className="text-text font-medium">J</strong> is opposite to the electrostatic <strong className="text-text font-medium">E</strong>. Their dot product <InlineMath tex="\\vec{J}\\cdot\\vec{E}" />
            is <em className="italic text-text">negative</em> — the source is doing work <em className="italic text-text">against</em> the field, i.e., creating field energy. By
            Poynting's theorem this shows up as net <strong className="text-text font-medium">S</strong> leaving the battery's volume
            <Cite id="poynting-1884" in={SOURCES} />. Davis and Kaplan plotted the streamlines explicitly: <strong className="text-text font-medium">S</strong>
            spreads from the battery in great loops through the surrounding space and converges on every resistive segment
            of the circuit<Cite id="davis-kaplan-2011" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="In a purely capacitive circuit with no resistance, where does the energy go?">
          <p>
            Into the field between the plates, and back out again. While the capacitor charges, <strong className="text-text font-medium">S</strong> points
            radially <em className="italic text-text">inward</em> from the surrounding space into the gap, depositing energy in the growing
            <strong className="text-text font-medium"> E</strong>-field there. The total stored energy works out to <InlineMath tex="\\tfrac{1}{2} C V^2" />, or equivalently
            the volume integral of <InlineMath tex="\\tfrac{1}{2} \\varepsilon_0 E^2" /> over the gap<Cite id="griffiths-2017" in={SOURCES} />.
            On discharge, the process runs backward — <strong className="text-text font-medium">S</strong> flows out of the gap into the external circuit.
            Nothing is dissipated; the time-averaged Poynting flux around any cycle is zero<Cite id="jackson-1999" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Has anyone directly measured the Poynting vector around a wire?">
          <p>
            Not pointwise — there is no "Poynting meter" you can stick in space and read off W/m². What has been done, many
            times over, is to compute <strong className="text-text font-medium">S</strong> from independent measurements of <strong className="text-text font-medium">E</strong> and
            <strong className="text-text font-medium"> B</strong> and verify that the surface integral matches the dissipated power. Davis and Kaplan
            performed the full 3D numerical version for a realistic circular circuit and showed that
            <InlineMath tex="\\oint \\vec{S}\\cdot d\\vec{A}" /> over any closed surface enclosing the resistor reproduces <InlineMath tex="VI" /> at every
            point in the parameter space<Cite id="davis-kaplan-2011" in={SOURCES} />. Morris and Styer did the equivalent
            for a 2D rail geometry and showed the flow lines lie along equipotentials<Cite id="morris-styer-2012" in={SOURCES} />.
            The fields are measurable; their cross product follows.
          </p>
        </FAQItem>

        <FAQItem q="Why does ∮S·dA over the wire's surface come out to exactly VI, with no error term?">
          <p>
            Because both quantities are the same integral, just regrouped. Start from <InlineMath tex="|S|_{\\text{surf}} = EB/\\mu_0" />,
            substitute <InlineMath tex="E = V/L" /> (axial drop along a uniform wire) and <InlineMath tex="B = \\mu_0 I/(2\\pi a)" />
            (Ampère at the surface), and the <InlineMath tex="\\mu_0" /> cancels:
          </p>
          <Formula tex="|S|_{\\text{surf}} \\cdot 2\\pi a L = (V I) / (2\\pi a L) \\cdot 2\\pi a L = V I" />
          <p>
            The lateral surface area <InlineMath tex="2\\pi a L" /> meets the field's <InlineMath tex="1/(2\\pi a L)" /> dependence and the
            geometry drops out completely<Cite id="feynman-II-27" in={SOURCES} />. The identity is exact for any uniform
            cylindrical resistor; for a non-uniform geometry the result still holds when you integrate over the whole
            conductor's surface, because Poynting's theorem is a local energy-conservation statement
            <Cite id="jackson-1999" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="In a superconductor the Poynting flow doesn't enter the wire. Where does the energy actually end up?">
          <p>
            Nowhere along the leads — it just keeps flowing. With <InlineMath tex="\\sigma \\to \\infty" />, the axial <strong className="text-text font-medium">E</strong> inside the
            superconductor vanishes, so <InlineMath tex="\\vec{S} = 0" /> inside, and so does the radial component of <strong className="text-text font-medium">S</strong>
            at the surface<Cite id="griffiths-2017" in={SOURCES} />. The flow stays in the surrounding space, parallel to
            the wire, untouched, and is absorbed only when it reaches whatever resistive element finally closes the circuit
            (a normal-conducting load, the room-temperature transition at the dewar, etc.)<Cite id="jackson-1999" in={SOURCES} />.
            In a circuit of one resistor and otherwise superconducting leads, 100% of the dissipation happens at the
            resistor, by exactly the same Poynting integral that <InlineMath tex="VI" /> gives.
          </p>
        </FAQItem>

        <FAQItem q="Is the Poynting picture compatible with quantum mechanics?">
          <p>
            Yes — it generalizes cleanly. In quantum electrodynamics the field is still there, and the operator-valued
            Poynting vector still gives the local energy flux; its expectation value in any classical-looking state
            reproduces the classical <strong className="text-text font-medium">S</strong> to extraordinary accuracy<Cite id="jackson-1999" in={SOURCES} />.
            What QED <em className="italic text-text">adds</em> is that the field comes in quanta (photons), so at sufficiently low intensity the
            classical streamline picture gives way to a probabilistic one. For the DC and 60 Hz and gigahertz cases that
            run civilization, the photon number per cubic wavelength is astronomical and the classical Poynting picture
            is exact for any practical purpose<Cite id="griffiths-2017" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Is the energy in the electric field, in the magnetic field, or both?">
          <p>
            Both, separately, additively. The local electromagnetic{' '}
            <Term def={<><strong className="text-text font-medium">energy density</strong> — energy stored per unit volume in the electromagnetic field, <em className="italic text-text">u = ½ε₀E² + B²/(2μ₀)</em>. SI units J/m³. Integrate over a region to get total field energy.</>}>energy density</Term>{' '}is
          </p>
          <Formula tex="u = \\tfrac{1}{2} \\varepsilon_0 E^2 + \\dfrac{1}{2\\mu_0} B^2" />
          <p>
            with a clean partition into electric and magnetic pieces<Cite id="griffiths-2017" in={SOURCES} />. Around a DC
            current-carrying wire, the magnetic term dominates near the surface; in the gap of a charged capacitor, the
            electric term dominates; in a propagating plane wave the two terms are equal on time-average. The Poynting
            vector <InlineMath id="poynting-vector" /> is the <em className="italic text-text">flux</em> of this combined energy and only makes
            sense when both fields are present<Cite id="jackson-1999" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why is the field energy density quadratic in the fields, rather than linear?">
          <p>
            Because the work done to <em className="italic text-text">build</em> a field from zero is the integral of force-against-itself. Charging a
            capacitor from 0 to <strong className="text-text font-medium">Q</strong> requires moving each successive <strong className="text-text font-medium">dq</strong> against the
            already-present voltage <InlineMath tex="q/C" />, so the total work is <InlineMath tex="\\int(q/C)\\,dq = Q^2/(2C) = \\tfrac{1}{2}CV^2" />,
            and the same quadratic dependence shows up locally as <InlineMath tex="\\tfrac{1}{2}\\varepsilon_0 E^2" /><Cite id="griffiths-2017" in={SOURCES} />.
            The factor of ½ is the same factor that appears in <InlineMath tex="\\tfrac{1}{2}mv^2" /> for the same reason: energy required
            to assemble a configuration from zero where the resisting force grows linearly with what's already there
            <Cite id="jackson-1999" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="If electromagnetic energy is streaming through space all the time, why don't we feel it?">
          <p>
            Because nothing in you is electromagnetically resonant at the frequencies dominating ambient fields, and the
            intensities are absurdly low. Earth's static magnetic field is ~50 μT and 60 Hz electric fields near a wall
            outlet are a few V/m, giving an ambient time-averaged <strong className="text-text font-medium">|S|</strong> on the order of microwatts per
            square meter — far below thermal noise in any biological receptor<Cite id="griffiths-2017" in={SOURCES} />. You
            <em className="italic text-text">do</em> feel Poynting flux when it gets concentrated and lossy: a microwave oven, an induction stove, sunlight
            on skin. Same physics, many orders of magnitude more intensity<Cite id="jackson-1999" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Is the Poynting picture the same as electromagnetic waves carrying energy?">
          <p>
            Yes — there is no separate theory. A propagating EM wave is precisely a configuration in which <strong className="text-text font-medium">E</strong>
            and <strong className="text-text font-medium">B</strong> are mutually perpendicular and in phase, with <InlineMath id="poynting-vector" />
            pointing in the direction of propagation and magnitude <InlineMath tex="c\\varepsilon_0 E^2" /> on time-average
            <Cite id="jackson-1999" in={SOURCES} />. The energy flow around a DC wire and the energy flow in a sunbeam are
            the same vector field doing the same job — one is steady, the other oscillates, but Maxwell's equations don't
            distinguish them<Cite id="maxwell-1865" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="In a long transmission line, where is the energy actually flowing — inside the wires or in the gap between them?">
          <p>
            Overwhelmingly in the gap. For a coaxial cable carrying DC at voltage <strong className="text-text font-medium">V</strong> and current <strong className="text-text font-medium">I</strong>,
            the Poynting flux integrated over any cross-section of the dielectric between inner and outer conductors
            equals <InlineMath tex="VI" /> exactly<Cite id="jackson-1999" in={SOURCES} />. The conductors carry essentially no
            energy along their interior — for an ideal superconducting line, zero. At AC the same statement holds with
            <strong className="text-text font-medium"> S</strong> oscillating, and at radio frequencies the skin effect pushes current to the surface,
            making it even more accurate to say that the signal travels in the surrounding dielectric while the metal
            just guides it<Cite id="griffiths-2017" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Does Maxwell's displacement current play a role in steady-state Poynting flow?">
          <p>
            Not in the strict DC limit — the displacement term <InlineMath tex="\\varepsilon_0 \\,\\partial \\vec{E}/\\partial t" /> is zero, so Ampère's
            law reduces to its pre-Maxwell form and the <strong className="text-text font-medium">B</strong>-field around the wire is given by the enclosed
            conduction current alone<Cite id="maxwell-1865" in={SOURCES} />. But the displacement current is what makes the
            Poynting picture self-consistent the moment anything time-varies: in a charging capacitor, the conduction
            current stops at the plates and the displacement current carries on through the gap, completing the loop and
            keeping <InlineMath tex="\\nabla\\cdot\\vec{J}_{\\text{total}} = 0" /> so that energy conservation closes
            <Cite id="jackson-1999" in={SOURCES} />. Steady state is the special case where you don't need that fix.
          </p>
        </FAQItem>

        <FAQItem q="Could you, in principle, build a wireless transmission line using the Poynting picture as a design guide?">
          <p>
            You already have. Every radio link, every microwave oven cavity, every laser-power-beaming demonstration is
            literally an engineered Poynting flux from source to load through space<Cite id="jackson-1999" in={SOURCES} />.
            The interesting case is the near-field one: a tightly resonant pair of coils can exchange energy with
            efficiency comparable to a wired link, because the Poynting flux is sharply concentrated between them. That's
            how wireless phone chargers, RFID, and proposed grid-scale wireless transmission all work — and from the
            field's point of view, even a normal wired circuit is "wireless" in the sense that no joules ever pass
            through the conductors<Cite id="feynman-II-27" in={SOURCES} />.
          </p>
        </FAQItem>
      </FAQ>
    </ChapterShell>
  );
}
