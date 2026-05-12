/**
 * Chapter 1 — Charge and field
 *
 * The bottom layer. Built around five embedded demos:
 *   1.1 Two point charges — sign toggle, attraction/repulsion
 *   1.2 Field arrows around a single charge with a draggable probe
 *   1.3 Inverse-square plot — log-log slope of −2
 *   1.4 Equipotentials of a dipole / like-pair
 *   1.5 Conductor vs insulator — charge redistribution
 *
 * Every numerical or historical claim is cited inline via <Cite/> against
 * the chapter's `sources` array (defined in src/textbook/data/chapters.ts).
 */
import { ChapterShell } from '@/components/ChapterShell';
import { FAQ, FAQItem } from '@/components/FAQ';
import { Cite } from '@/components/SourcesList';
import { ConductorRedistributionDemo } from './demos/ConductorRedistribution';
import { EquipotentialsDemo } from './demos/Equipotentials';
import { FieldArrowsDemo } from './demos/FieldArrows';
import { InverseSquareDemo } from './demos/InverseSquare';
import { TwoChargesDemo } from './demos/TwoCharges';
import { getChapter } from './data/chapters';

export default function Ch1WhatIsElectricity() {
  const chapter = getChapter('what-is-electricity')!;
  const SOURCES = chapter.sources;

  return (
    <ChapterShell chapter={chapter}>
      <p>
        Rub a balloon on your hair and stick it to a wall. The balloon stays — through paint, through gravity, through your
        fingers tugging at it — held there by something that doesn't touch anything. <strong>That</strong> is electricity in
        its rawest form. Not the neat 60 Hz alternating current in your wall outlet, not the bright sparks of a thundercloud.
        Just two surfaces full of opposite charges, and a force between them.
      </p>
      <p>
        This chapter is about the bottom layer: what charge actually is, why it produces a force that drops off as the inverse
        square of distance, and why physicists in the 19th century stopped thinking about that force as a ghostly attraction
        and started thinking about it as a <em>field</em> — a property of empty space itself. Voltage and current and
        resistance all live one floor up. We'll get there. First the floor.
      </p>

      <h2>Two kinds of <em>charge</em></h2>

      <p>
        The simplest experimental fact in all of electricity: there are two kinds of charge, and they push on each other
        in opposite ways. Same kind: repel. Different kind: attract. We label one positive and one negative — but
        nothing in nature insists on which gets which name. Benjamin Franklin made the call in 1747 and we've been stuck
        with it. (It is occasionally annoying. Conventional current flows in the direction <em>positive</em> charge would
        move, but the actual carriers in a metal wire are electrons, which are negative. Every textbook diagram has to
        carry the inversion in your head.)
      </p>

      <TwoChargesDemo />

      <p>
        The force between two point charges is given by Coulomb's law <Cite id="coulomb-1785" in={SOURCES} />:
      </p>
      <p className="math">F = k Q₁ Q₂ / r²</p>
      <p>
        with <strong>k = 8.99×10⁹ N·m²/C²</strong> in SI units <Cite id="codata-2018" in={SOURCES} />. Sign convention: if
        Q₁ and Q₂ have the same sign, F is positive (push apart); opposite signs, F is negative (pull together).
        The constant is <em>enormous</em>. Two coulombs of free charge separated by one meter would push each other
        apart with about <strong>9 billion newtons</strong> — roughly the weight of three Eiffel Towers.
      </p>
      <p>
        The reason daily life is full of static and not constant electrocution is that ordinary matter is exquisitely
        charge-neutral. The fractional excess of free charge needed to make a noticeable force is tiny.
        Drag a balloon across your hair and you transfer maybe <strong>10⁻⁸ coulombs</strong> — a few hundred billion
        excess electrons, sitting on a balloon that contains roughly <strong>10²³</strong> of them. Almost nothing.
        Enough to fight gravity for a few minutes.
      </p>

      <h2>Why exactly the <em>square</em>?</h2>

      <p>
        Coulomb established the inverse-square form in 1785 by hanging a charged ball from a fine quartz fiber
        and measuring the angle of twist as he brought another charged ball nearer<Cite id="coulomb-1785" in={SOURCES} />. But the
        form is not an arbitrary fit. It's a direct consequence of the geometry of three-dimensional space.
      </p>
      <p>
        Imagine the charge as a point spraying its "influence" outward equally in every direction. After traveling a
        distance <strong>r</strong>, that influence is spread over the surface of a sphere of radius <strong>r</strong>. The area of that sphere is
        <strong> 4πr²</strong>. The intensity per unit area must therefore drop as <strong>1/r²</strong>. The exponent
        comes from the dimensionality of space, not from anything special about charge.
      </p>
      <p className="pullout">
        The inverse-square law is not a fact about charge. It is a fact about space being three-dimensional.
      </p>
      <p>
        Cavendish bounded the deviation from <em>exactly</em> 2 to within ±1/50 with a clever null-cavity experiment in
        1773, decades before Coulomb's published result <Cite id="cavendish-1773" in={SOURCES} />. Modern measurements
        have pushed the bound to roughly <strong>±3×10⁻¹⁶</strong> — the exponent is 2 to sixteen decimal places<Cite id="williams-faller-hill-1971" in={SOURCES} />. There are very few power laws in physics tested this precisely.
      </p>

      <InverseSquareDemo />

      <h2>From <em>force</em> to <em>field</em></h2>

      <p>
        Newton hated the way his own gravitational law worked — instantaneous attraction across empty space, with no mechanism.
        "Action at a distance" he called it, and he didn't believe it. For two centuries everyone made do anyway, including
        with Coulomb's electrical version of the same algebra.
      </p>
      <p>
        Michael Faraday, who had less mathematics than any of his peers and more imagination than most of them combined,
        proposed in the 1830s that the empty space around a charge is not, in fact, empty. It contains a <em>field</em>: a
        physical thing, defined at every point, that tells whatever charge happens to be there what force to feel. The
        symbol is <strong>E</strong>, and its definition is direct:
      </p>
      <p className="math">E = F / q<sub>test</sub></p>
      <p>
        Force per unit positive charge. SI units: newtons per coulomb, or equivalently volts per meter. The two are
        identical — you can derive it in one line<Cite id="hyperphysics-emag" in={SOURCES} />.
      </p>
      <p>
        With the field framework in hand, Coulomb's law takes a slightly different shape. A point charge <strong>Q</strong>
        produces a field whose magnitude at distance <strong>r</strong> is
      </p>
      <p className="math">|E| = k Q / r²</p>
      <p>
        and whose direction is radially outward from <strong>Q</strong> (if Q is positive) or inward (if Q is negative). Bring any
        other charge into that field and the force on it is <strong>F = qE</strong>. The new charge doesn't talk to the
        old one — it talks only to the field at its own location <Cite id="feynman-II-2" in={SOURCES} />.
      </p>

      <FieldArrowsDemo />

      <p>
        The field framework looks like bookkeeping at first — relabel the same algebra. But it pays off in two enormous
        ways. First, when there are <em>many</em> charges, the field is the vector sum of each one's contribution. You
        compute one field, then any charge that wanders in instantly knows what to do. Second, when charges
        <em> change</em>, the news travels at finite speed (the speed of light, as Maxwell would discover). Faraday's
        field gives you a place to put that news while it propagates. Action at a distance becomes local action on a
        field that obeys its own dynamics.
      </p>

      <h2>Two charges, two patterns</h2>

      <p>
        Once you have a field, you can ask what the field <em>looks like</em>. For one isolated charge it's just radial
        arrows, getting weaker by 1/r². For two charges, the patterns are more interesting. Two opposite charges nearby
        produce a <strong>dipole</strong> field — field lines bowing from the positive to the negative. Two like charges
        produce a field with a "saddle" between them where everything cancels.
      </p>

      <EquipotentialsDemo />

      <p>
        The teal dotted contours in the demo above are <em>equipotential lines</em> — sets of points all at the same
        electrostatic potential <strong>V</strong>. They're the contour lines of an invisible mountain whose height is
        the potential. The electric field always points "downhill," perpendicular to the equipotentials. We'll spend
        Chapter&nbsp;2 on what V means and why it's the variable everyone actually measures.
      </p>

      <h2>Conductors, insulators, and why your hair does that</h2>

      <p>
        Materials come in two extreme types from the standpoint of charge mobility, with everything else on a sliding
        scale between them. In a <strong>conductor</strong> — copper, silver, salt water, your skin to a small degree —
        some of the electrons in each atom are not bound to any particular nucleus. They drift through the material, free
        to be pushed around by any applied field. In an <strong>insulator</strong> — glass, dry plastic, dry air — every
        electron is locked into a chemical bond and cannot move more than the diameter of an atom.
      </p>
      <p>
        Put extra charge on a conductor and the free electrons rearrange themselves until the field inside the
        conductor is exactly zero. (If it weren't zero, the free charges would feel a force, accelerate, and keep
        rearranging until it was. So in equilibrium it must be.) The excess charge ends up <em>on the surface</em>, as far apart as
        geometry allows<Cite id="griffiths-2017" in={SOURCES} />.
      </p>

      <ConductorRedistributionDemo />

      <p>
        This is why a metal cage shields its interior from electric fields (a Faraday cage), why your car keeps you
        relatively safe in a thunderstorm, and why the electrons inside a copper wire — which you'll meet in
        Chapter&nbsp;2 — sit there happily until something connects the wire to a battery and breaks the equilibrium.
      </p>

      <h2>What we have so far</h2>

      <p>
        Charge is a property of matter. There are two kinds. Same kinds repel; opposites attract. The force between two
        point charges falls off as the square of the distance — for a geometric reason, not a numerological one. Around
        every charged object is a field that fills space and tells any other charge what to do. In a conductor, charges
        are free to move and rearrange themselves until the inside of the conductor has no field at all.
      </p>
      <p>
        That is electrostatics — electricity standing still. In Chapter 2 we let it move.
      </p>

      <FAQ
        intro="Loose threads from the chapter — the questions a careful reader tends to surface after the first pass."
      >
        <FAQItem q="Is charge a substance — a sort of electric fluid — or just a property of matter?">
          <p>
            A property, not a substance. An electron <em>has</em> charge in the same way it has mass; you can't pour
            charge out of a bottle. Franklin's 18th-century picture of a single electrical fluid was wrong in detail
            but not in spirit: what we now call charge is a conserved scalar attached to particles, and the bookkeeping
            of pluses and minuses he invented still works. Each elementary charge is exactly
            <strong> e = 1.602176634×10⁻¹⁹ C</strong> — an exact value since the 2019 SI redefinition
            <Cite id="codata-2018" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why are there exactly two kinds of charge and not three, or seven?">
          <p>
            Nobody knows a deeper reason. Empirically, every charged particle ever observed carries an integer
            multiple of <strong>e</strong>, and the sign comes in two flavors. The two-sign structure falls out of the
            mathematics of U(1) gauge symmetry in the Standard Model, but that just restates the fact at a higher level
            — it doesn't explain <em>why</em> the universe chose U(1). For everything in this chapter, the relevant
            statement is the experimental one: like repels, unlike attracts, and the algebra of opposites lets ordinary
            matter be neutral to staggering precision<Cite id="griffiths-2017" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="If electrons are negative, why do textbooks draw current flowing from + to −?">
          <p>
            Historical accident. Franklin labeled the kind of charge that accumulates on glass rubbed with silk
            "positive," guessed it was the thing that flowed, and the convention stuck. A century later it turned out
            that in metals the actual carriers — electrons — are negative and drift the <em>other</em> way. By then
            every diagram, every right-hand rule, every formula sign convention had been written in terms of
            conventional current. Rewriting all of it for accuracy was not worth the gain, so we live with the inversion.
            In an electrolyte or a plasma both signs really do flow at once, so the convention isn't even wrong there.
          </p>
        </FAQItem>

        <FAQItem q="What is the constant k in Coulomb's law, and why is it so absurdly large?">
          <p>
            In SI units <strong>k = 1/(4πε₀) ≈ 8.99×10⁹ N·m²/C²</strong>, where <strong>ε₀</strong> is the permittivity
            of free space<Cite id="codata-2018" in={SOURCES} />. It looks huge because the coulomb is a wildly
            oversized unit — one coulomb is the charge of about <strong>6.24×10¹⁸</strong> electrons. Real laboratory
            charges sit at the nanocoulomb to microcoulomb level, and at those scales the forces become ordinary. The
            numerical bigness of <em>k</em> is really a statement about how absurdly small a single electron's charge is
            on the scale we chose to measure it.
          </p>
        </FAQItem>

        <FAQItem q="Why exactly 4π in 1/(4πε₀), and not just π or 2π?">
          <p>
            The <strong>4π</strong> is the surface area of a unit sphere — it's the geometry of three-dimensional space
            leaking into the equations. Gauss's law in its clean form reads ∮E·dA = Q/ε₀, with no π anywhere
            <Cite id="gauss-1813" in={SOURCES} />. When you specialize that to a point charge and integrate over a
            sphere of radius r, the sphere's area <strong>4πr²</strong> appears in the denominator, leaving Coulomb's
            law looking like F = Q₁Q₂/(4πε₀r²). The 4π is where you choose to hide the geometry: in Coulomb's law, or in
            Gauss's law, but not both.
          </p>
        </FAQItem>

        <FAQItem q="Coulomb's law is written for point charges. What about real, extended objects?">
          <p>
            You integrate. Slice the object into infinitesimal pieces, treat each as a point charge dq, and sum the
            contributions vectorially. For continuous distributions this is a volume, surface, or line integral over the
            charge density. The field framework makes this almost mechanical: every dq contributes
            <strong> dE = k dq r̂ / r²</strong>, and superposition guarantees the total field is the integral. The full
            machinery — including the shortcut of Gauss's law for symmetric distributions — is the bread and butter of
            any electrostatics course<Cite id="griffiths-2017" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Is the electric field a real thing, or just bookkeeping?">
          <p>
            Real. You can't see it or touch it directly, but the field carries energy, carries momentum, and propagates
            information at the speed of light. When you wiggle a charge here, a charge a meter away doesn't feel
            anything for about three nanoseconds — and during those nanoseconds the energy is somewhere, and the
            "somewhere" is the field. Treating it as mere bookkeeping works for static problems and fails the moment
            anything moves<Cite id="feynman-II-2" in={SOURCES} />. The Poynting story in Chapter 6 makes this concrete.
          </p>
        </FAQItem>

        <FAQItem q="Why exactly inverse-square? Could the exponent secretly be 1.999 or 2.001?">
          <p>
            It has been checked to extraordinary precision. Cavendish in 1773 used a charged hollow sphere and showed
            that no charge appears on an inner sphere placed inside it — a result that requires the exponent to be 2 to
            within about <strong>1/50</strong> by his analysis<Cite id="cavendish-1773" in={SOURCES} />. Williams,
            Faller, and Hill in 1971 sharpened the technique with concentric icosahedra and bounded any deviation
            <strong> q</strong> in the form 1/r^(2+q) to <strong>q = (2.7 ± 3.1)×10⁻¹⁶</strong>
            <Cite id="williams-faller-hill-1971" in={SOURCES} />. If the photon has a rest mass at all, it is fantastically
            small; the inverse-square law is one of the most precisely confirmed statements in physics.
          </p>
        </FAQItem>

        <FAQItem q="What's the difference between the electric field E and the potential V?">
          <p>
            <strong>E</strong> is a vector at every point: it tells you the force per unit charge and which way that
            force points. <strong>V</strong> is a scalar at every point: it tells you the potential energy per unit
            charge that a test charge would have if it sat there. They carry the same information for a static field —
            E is the negative gradient of V — but V is easier to add up (no vectors) and is what voltmeters actually
            measure. Equipotentials are level sets of V, and E always points perpendicular to them, downhill
            <Cite id="feynman-II-2" in={SOURCES} />. We unpack V in Chapter 2.
          </p>
        </FAQItem>

        <FAQItem q="What is an equipotential, geometrically?">
          <p>
            A surface — or in 2D cross-section, a curve — along which the potential V has the same value everywhere.
            You can walk along an equipotential without doing any work against the field, the same way you can walk
            along a contour line on a topographic map without changing elevation. Around an isolated point charge,
            equipotentials are concentric spheres. Around a dipole, they bend into nested ovals on each side and a flat
            plane down the middle. The field lines are the gradient flow — always perpendicular to the equipotentials,
            always pointing toward lower V<Cite id="griffiths-2017" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why does the field inside a hollow metal box vanish? (The Faraday-cage question.)">
          <p>
            Because the free electrons in the metal will rearrange until it does. If any field remained inside the
            conductor, the mobile charges would feel a force, accelerate, and keep rearranging until that interior field
            cancelled. In equilibrium the interior field must be zero — and a beautiful theorem says this implies the
            <em> cavity</em> inside is also field-free, provided there are no charges inside it
            <Cite id="griffiths-2017" in={SOURCES} />. This is exactly what Cavendish exploited in his 1773 null
            experiment to test the inverse-square law<Cite id="cavendish-1773" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Is the electric field a kind of substance, like air? Could you compress it?">
          <p>
            No — it isn't made of anything; it's a vector quantity defined at every point in space. You can't compress
            it, but you <em>can</em> superpose fields (add them) and you can store energy in them. The energy density
            of an electrostatic field is <strong>u = ½ ε₀ |E|²</strong>, in joules per cubic meter
            <Cite id="griffiths-2017" in={SOURCES} />. So in a real sense the field is a fuel tank distributed across
            space, even though it is not a material in the everyday sense.
          </p>
        </FAQItem>

        <FAQItem q="Why does your hair stand up when you pull off a wool sweater?">
          <p>
            Triboelectric charging — rubbing two dissimilar insulators transfers a small population of electrons from
            one to the other, leaving each surface slightly charged. The strands of hair end up with the same sign and
            repel each other; with their roots anchored, they fan outward to maximize separation, exactly like the
            charges on a conductor heading for the surface<Cite id="griffiths-2017" in={SOURCES} />. The total charge
            transferred is tiny — typically nanocoulombs over the whole head — but with k around <strong>10¹⁰</strong>
            and gravity weak, it's enough to win<Cite id="codata-2018" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Does Coulomb's law work for moving charges too?">
          <p>
            Only approximately, and only at speeds far below c. The full story for moving charges involves the magnetic
            field as well — and the two are linked by special relativity. A charge moving past you produces a magnetic
            field that an observer riding alongside it would not see; what looks like a magnetic force in one frame
            looks like an extra electric force in another. We get to all of that in Chapter 4. For now, "Coulomb's law"
            means the electrostatic limit: charges sitting still, or moving slowly enough that retardation effects can
            be ignored.
          </p>
        </FAQItem>

        <FAQItem q="Can charge be created or destroyed?">
          <p>
            No — total electric charge is conserved, locally and globally. You can pair-create a positron and an
            electron from a high-energy photon, but the photon was neutral and the pair sums to zero charge; the books
            still balance. Charge conservation is the symmetry partner, via Noether's theorem, of the gauge invariance
            that underlies electromagnetism. In everyday rubbing-balloons-on-hair experiments, you are not creating
            charge, only moving it from one surface to the other.
          </p>
        </FAQItem>

        <FAQItem q="What does 1 coulomb actually look like in everyday terms?">
          <p>
            Roughly the charge that flows through a 100-watt incandescent bulb in about a second, since a typical
            household bulb draws on the order of 1 amp. As a static charge it is enormous: two 1-C charges separated by
            1 meter would repel each other with <strong>~9×10⁹ N</strong>, more than the weight of a fully loaded
            aircraft carrier. That is why static-electricity demonstrations use nanocoulombs and microcoulombs — a
            <em> whole</em> coulomb of free charge isolated in one place is essentially impossible to assemble.
          </p>
        </FAQItem>

        <FAQItem q="Is the speed of an electrical signal in a wire the same as the speed of light?">
          <p>
            Close, but not identical, and — crucially — it has very little to do with the speed of the electrons. The
            signal that flips a switch is a disturbance in the electromagnetic field surrounding the wire, propagating
            at a fraction (often ~⅔) of the vacuum speed of light <strong>c = 299,792,458 m/s</strong>
            <Cite id="codata-2018" in={SOURCES} />. The electrons themselves drift along at fractions of a millimeter
            per second. We pull that apart properly in Chapter 2, and the field-flow picture lands in Chapter 6.
          </p>
        </FAQItem>
      </FAQ>
    </ChapterShell>
  );
}
