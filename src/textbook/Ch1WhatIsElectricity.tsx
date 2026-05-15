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
import { CaseStudies, CaseStudy } from '@/components/CaseStudy';
import { ChapterShell } from '@/components/ChapterShell';
import { FAQ, FAQItem } from '@/components/FAQ';
import { Cite } from '@/components/SourcesList';
import { Formula } from '@/components/Formula';
import { Term } from '@/components/Term';
import { TryIt } from '@/components/TryIt';
import { PredictThenObserve } from '@/components/PredictThenObserve';
import { ConductorRedistributionDemo } from './demos/ConductorRedistribution';
import { EquipotentialsDemo } from './demos/Equipotentials';
import { FieldArrowsDemo } from './demos/FieldArrows';
import { InverseSquareDemo } from './demos/InverseSquare';
import { PointCharge3DDemo } from './demos/PointCharge3D';
import { TwoChargesDemo } from './demos/TwoCharges';
import { getChapter } from './data/chapters';

export default function Ch1WhatIsElectricity() {
  const chapter = getChapter('what-is-electricity')!;
  const SOURCES = chapter.sources;

  return (
    <ChapterShell chapter={chapter}>
      <p className="mb-prose-3 first-letter:font-2 first-letter:font-light first-letter:text-[4em] first-letter:leading-none first-letter:float-left first-letter:m-[4px_12px_-4px_0] first-letter:text-accent">
        Rub a balloon on your hair and stick it to a wall. The balloon stays — through paint, through gravity, through your
        fingers tugging at it — held there by something that doesn't touch anything. <strong className="text-text font-medium">That</strong> is electricity in
        its rawest form. Not the neat 60 Hz alternating current in your wall outlet, not the bright sparks of a thundercloud.
        Just two surfaces full of opposite{' '}
        <Term def={<><strong className="text-text font-medium">charge</strong> — a conserved scalar property of matter that produces and responds to electromagnetic fields. Comes in two signs; the elementary unit is <em className="italic text-text">e</em> = 1.602176634×10⁻¹⁹ C (exact).</>}>charges</Term>, and a force between them.
      </p>
      <p className="mb-prose-3">
        This chapter is about the bottom layer: what charge actually is, why it produces a force that drops off as the inverse
        square of distance, and why physicists in the 19th century stopped thinking about that force as a ghostly attraction
        and started thinking about it as a <em className="italic text-text">field</em> — a property of empty space itself. Voltage and current and
        resistance all live one floor up. We'll get there. First the floor.
      </p>

      <h2 className="font-2 font-light italic text-[clamp(28px,3.5vw,42px)] leading-1 tracking-1 text-text mt-3xl mb-2xl max-w-[28ch]">Two kinds of <em className="italic text-accent font-normal">charge</em></h2>

      <p className="mb-prose-3">
        The simplest experimental fact in all of electricity: there are two kinds of charge, and they push on each other
        in opposite ways. Same kind: repel. Different kind: attract. We label one positive and one negative — but
        nothing in nature insists on which gets which name. Benjamin Franklin made the call in 1747 and we've been stuck
        with it. (It is occasionally annoying. Conventional current flows in the direction <em className="italic text-text">positive</em> charge would
        move, but the actual carriers in a metal wire are electrons, which are negative. Every textbook diagram has to
        carry the inversion in your head.)
      </p>

      <PredictThenObserve
        storageKey="ch1-two-charges"
        question={
          <>
            Two positive point charges of <strong className="text-text font-medium">1 nC</strong> each sit <strong className="text-text font-medium">1 cm</strong> apart in air. The force
            between them is closest to:
          </>
        }
        spec={{
          kind: 'multiple-choice',
          options: [
            { id: 'a', label: '9 µN (micronewtons)' },
            { id: 'b', label: '9 mN (millinewtons)' },
            { id: 'c', label: '9 N (newtons)' },
            { id: 'd', label: '9 kN (kilonewtons)' },
          ],
          correctIds: ['a'],
        }}
      >
        <TwoChargesDemo />
      </PredictThenObserve>

      <p className="mb-prose-3">
        The force between two{' '}
        <Term def={<><strong className="text-text font-medium">point charge</strong> — an idealised charge with no spatial extent, used as a building block. Real charged objects are integrated as sums of point charges.</>}>point charges</Term>{' '}
        is given by{' '}
        <Term def={<><strong className="text-text font-medium">Coulomb's law</strong> — the force between two point charges falls off as the inverse square of their separation: <em className="italic text-text">F = k Q₁Q₂/r²</em>. Like signs repel, unlike attract.</>}>Coulomb's law</Term>{' '}
        <Cite id="coulomb-1785" in={SOURCES} />:
      </p>
      <Formula>F = k Q₁ Q₂ / r²</Formula>
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">F</strong> is the magnitude of the force each charge exerts on the other (in newtons),
        <strong className="text-text font-medium"> Q₁</strong> and <strong className="text-text font-medium">Q₂</strong> are the two charges (in coulombs, signed),
        <strong className="text-text font-medium"> r</strong> is the distance between them (in metres), and
        <strong className="text-text font-medium"> k = 8.99×10⁹ N·m²/C²</strong> is Coulomb's constant in SI units<Cite id="codata-2018" in={SOURCES} />.
        Sign convention: if Q₁ and Q₂ have the same sign, F is positive (push apart); opposite signs, F is negative (pull together).
      </p>
      <p className="mb-prose-3">
        The constant is <em className="italic text-text">enormous</em>. Two coulombs of free charge separated by one meter would push each other
        apart with about <strong className="text-text font-medium">9 billion newtons</strong> — roughly the weight of three Eiffel Towers.
      </p>
      <p className="mb-prose-3">
        The reason daily life is full of static and not constant electrocution is that ordinary matter is exquisitely
        charge-neutral. The fractional excess of free charge needed to make a noticeable force is tiny.
        Drag a balloon across your hair and you transfer maybe <strong className="text-text font-medium">10⁻⁸ coulombs</strong> — a few hundred billion
        excess electrons, sitting on a balloon that contains roughly <strong className="text-text font-medium">10²³</strong> of them. Almost nothing.
        Enough to fight gravity for a few minutes.
      </p>

      <TryIt
        tag="Try 1.1"
        question={
          <>Two small spheres sit 10 cm apart in air, carrying <strong className="text-text font-medium">+5 nC</strong> and <strong className="text-text font-medium">−3 nC</strong>.
          What is the magnitude of the Coulomb force between them, and is it attractive or repulsive?</>
        }
        hint="Use F = k Q₁Q₂/r² with k = 8.99×10⁹ N·m²/C² and convert nC and cm to SI."
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">
              Plug directly into Coulomb's law with <em className="italic text-text">k</em> = 8.99×10⁹ N·m²/C² <Cite id="codata-2018" in={SOURCES} />:
            </p>
            <Formula>F = (8.99×10⁹)(5×10⁻⁹)(3×10⁻⁹) / (0.10)² = 1.35×10⁻⁵ N</Formula>
            <p className="mb-prose-1 last:mb-0">
              The signs are opposite, so the force is attractive. Magnitude: <strong className="text-text font-medium">1.35×10⁻⁵ N (~13.5 µN)</strong>, attractive.
            </p>
          </>
        }
      />

      <h2 className="font-2 font-light italic text-[clamp(28px,3.5vw,42px)] leading-1 tracking-1 text-text mt-3xl mb-2xl max-w-[28ch]">Why exactly the <em className="italic text-accent font-normal">square</em>?</h2>

      <p className="mb-prose-3">
        Coulomb established the inverse-square form in 1785 by hanging a charged ball from a fine quartz fiber
        and measuring the angle of twist as he brought another charged ball nearer<Cite id="coulomb-1785" in={SOURCES} />. But the
        form is not an arbitrary fit. It's a direct consequence of the geometry of three-dimensional space.
      </p>
      <p className="mb-prose-3">
        Imagine the charge as a point spraying its "influence" outward equally in every direction. After traveling a
        distance <strong className="text-text font-medium">r</strong>, that influence is spread over the surface of a sphere of radius <strong className="text-text font-medium">r</strong>. The area of that sphere is
        <strong className="text-text font-medium"> 4πr²</strong>. The intensity per unit area must therefore drop as <strong className="text-text font-medium">1/r²</strong>. The exponent
        comes from the dimensionality of space, not from anything special about charge.
      </p>
      <p className="pullout">
        The inverse-square law is not a fact about charge. It is a fact about space being three-dimensional.
      </p>
      <p className="mb-prose-3">
        Cavendish bounded the deviation from <em className="italic text-text">exactly</em> 2 to within ±1/50 with a clever null-cavity experiment in
        1773, decades before Coulomb's published result <Cite id="cavendish-1773" in={SOURCES} />. Modern measurements
        have pushed the bound to roughly <strong className="text-text font-medium">±3×10⁻¹⁶</strong> — the exponent is 2 to sixteen decimal places<Cite id="williams-faller-hill-1971" in={SOURCES} />. There are very few{' '}
        <Term def={<><strong className="text-text font-medium">inverse-square law</strong> — any force law where magnitude falls as 1/r². Coulomb's electrostatic force and Newton's gravitational force are the canonical examples; both reflect the surface area of a sphere growing as 4πr².</>}>power laws</Term>{' '}
        in physics tested this precisely.
      </p>

      <PredictThenObserve
        storageKey="ch1-inverse-square"
        question={
          <>
            If you <strong className="text-text font-medium">double</strong> the distance between two point charges, the force between them …
          </>
        }
        spec={{
          kind: 'multiple-choice',
          options: [
            { id: 'a', label: 'Doubles' },
            { id: 'b', label: 'Halves' },
            { id: 'c', label: 'Drops to one quarter' },
            { id: 'd', label: 'Drops to one eighth' },
          ],
          correctIds: ['c'],
        }}
      >
        <InverseSquareDemo />
      </PredictThenObserve>

      <TryIt
        tag="Try 1.2"
        question={
          <>Two protons sit 1 fm (10⁻¹⁵ m) apart — roughly a nuclear separation. Compute the ratio of the electric repulsion to the gravitational attraction between them.</>
        }
        hint={<>Use F<sub>e</sub> = kQ²/r² and F<sub>g</sub> = Gm²/r². The <em className="italic text-text">r</em>² cancels.</>}
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">
              Both forces scale as 1/r², so the ratio is independent of distance — pure constants.
              With <em className="italic text-text">e</em> = 1.602×10⁻¹⁹ C, <em className="italic text-text">m<sub>p</sub></em> = 1.673×10⁻²⁷ kg,
              <em className="italic text-text"> k</em> = 8.99×10⁹ N·m²/C², and <em className="italic text-text">G</em> = 6.674×10⁻¹¹ N·m²/kg² <Cite id="codata-2018" in={SOURCES} />:
            </p>
            <Formula>F<sub>e</sub>/F<sub>g</sub> = k e² / (G m<sub>p</sub>²) ≈ 1.24×10³⁶</Formula>
            <p className="mb-prose-1 last:mb-0">
              The electric force between two protons is about <strong className="text-text font-medium">10³⁶ times</strong> stronger than the
              gravitational force. Gravity is utterly negligible at atomic scales.
            </p>
          </>
        }
      />

      <h2 className="font-2 font-light italic text-[clamp(28px,3.5vw,42px)] leading-1 tracking-1 text-text mt-3xl mb-2xl max-w-[28ch]">From <em className="italic text-accent font-normal">force</em> to <em className="italic text-accent font-normal">field</em></h2>

      <p className="mb-prose-3">
        Newton hated the way his own gravitational law worked — instantaneous attraction across empty space, with no mechanism.
        "Action at a distance" he called it, and he didn't believe it. For two centuries everyone made do anyway, including
        with Coulomb's electrical version of the same algebra.
      </p>
      <p className="mb-prose-3">
        Michael Faraday, who had less mathematics than any of his peers and more imagination than most of them combined,
        proposed in the 1830s that the empty space around a charge is not, in fact, empty. It contains a{' '}
        <Term def={<><strong className="text-text font-medium">electric field</strong> — a vector quantity <em className="italic text-text">E</em> defined at every point in space; the force on a small test charge <em className="italic text-text">q</em> at that point is <em className="italic text-text">F = qE</em>. Units: N/C, equivalently V/m.</>}>field</Term>: a
        physical thing, defined at every point, that tells whatever charge happens to be there what force to feel. The
        symbol is <strong className="text-text font-medium">E</strong>, and its definition is direct:
      </p>
      <Formula>E = F / q<sub>test</sub></Formula>
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">E</strong> is the electric-field vector at the point of interest (units: N/C, equivalently V/m),
        <strong className="text-text font-medium"> F</strong> is the force the field exerts on a small <em className="italic text-text">test charge</em> placed at that point, and
        <strong className="text-text font-medium"> q<sub>test</sub></strong> is the value of that test charge (in coulombs). Force per unit positive
        charge. The N/C-versus-V/m identity falls out in one line<Cite id="hyperphysics-emag" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        With the field framework in hand, Coulomb's law takes a slightly different shape. A point charge
        <strong className="text-text font-medium"> Q</strong> produces a field whose magnitude at distance <strong className="text-text font-medium">r</strong> from it is
      </p>
      <Formula>|E| = k Q / r²</Formula>
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">|E|</strong> is the magnitude of the field (N/C), <strong className="text-text font-medium">k</strong> is Coulomb's constant,
        <strong className="text-text font-medium"> Q</strong> is the source charge (signed, in coulombs), and <strong className="text-text font-medium">r</strong> is the distance from
        the source charge to the point where the field is being evaluated (in metres). The direction is radially
        outward from <strong className="text-text font-medium">Q</strong> (if Q is positive) or inward (if Q is negative). Bring any other charge
        <strong className="text-text font-medium"> q</strong> into that field and the force on it is <strong className="text-text font-medium">F = qE</strong> — the new charge doesn't
        talk to the old one, it talks only to the field at its own location<Cite id="feynman-II-2" in={SOURCES} />.
      </p>

      <FieldArrowsDemo />

      <p className="mb-prose-3">
        The 2D arrows above slice through the radial pattern in one plane.
        Rotate around the same point charge in 3D below: ~80 sample arrows on
        an invisible sphere of radius r let you confirm directly that
        doubling r quarters the field magnitude. The ratio readout locks at
        exactly 4.0× — the inverse-square law made geometric.
      </p>

      <PointCharge3DDemo />

      <p className="mb-prose-3">
        The field framework looks like bookkeeping at first — relabel the same algebra. But it pays off in two enormous
        ways. First, when there are <em className="italic text-text">many</em> charges, the field is the vector sum of each one's contribution. You
        compute one field, then any charge that wanders in instantly knows what to do. Second, when charges
        <em className="italic text-text"> change</em>, the news travels at finite speed (the speed of light, as Maxwell would discover). Faraday's
        field gives you a place to put that news while it propagates. Action at a distance becomes local action on a
        field that obeys its own dynamics.
      </p>

      <TryIt
        tag="Try 1.3"
        question={
          <>A <strong className="text-text font-medium">+10 nC</strong> point charge sits at the origin. What is the magnitude of <strong className="text-text font-medium">E</strong> at a
          point 5 cm away, and what force would an electron feel there?</>
        }
        hint="|E| = kQ/r²; then F = qE with q = e = 1.602×10⁻¹⁹ C."
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">The field magnitude from a point charge <Cite id="feynman-II-2" in={SOURCES} />:</p>
            <Formula>|E| = kQ/r² = (8.99×10⁹)(10×10⁻⁹) / (0.05)² = 3.60×10⁴ N/C</Formula>
            <p className="mb-prose-1 last:mb-0">
              An electron carries charge −<em className="italic text-text">e</em>, so the force has magnitude
            </p>
            <Formula>F = eE = (1.602×10⁻¹⁹)(3.60×10⁴) ≈ 5.76×10⁻¹⁵ N</Formula>
            <p className="mb-prose-1 last:mb-0">
              directed toward the positive source charge. Field: <strong className="text-text font-medium">3.6×10⁴ N/C</strong>; force on the electron:
              <strong className="text-text font-medium"> 5.8×10⁻¹⁵ N</strong> attractive.
            </p>
          </>
        }
      />

      <h2 className="font-2 font-light italic text-[clamp(28px,3.5vw,42px)] leading-1 tracking-1 text-text mt-3xl mb-2xl max-w-[28ch]">Two charges, two patterns</h2>

      <p className="mb-prose-3">
        Once you have a field, you can ask what the field <em className="italic text-text">looks like</em>. For one isolated charge it's just radial
        arrows, getting weaker by 1/r². For two charges, the patterns are more interesting. Two opposite charges nearby
        produce a <strong className="text-text font-medium">dipole</strong> field — field lines bowing from the positive to the negative. Two like charges
        produce a field with a "saddle" between them where everything cancels.
      </p>

      <EquipotentialsDemo />

      <p className="mb-prose-3">
        The teal dotted contours in the demo above are{' '}
        <Term def={<><strong className="text-text font-medium">equipotential</strong> — a surface (or curve in 2D) on which the electrostatic potential <em className="italic text-text">V</em> has a single value. The electric field is everywhere perpendicular to equipotentials and points toward lower <em className="italic text-text">V</em>.</>}>equipotential lines</Term>{' '}
        — sets of points all at the same
        electrostatic potential <strong className="text-text font-medium">V</strong>. They're the contour lines of an invisible mountain whose height is
        the potential. The electric field always points "downhill," perpendicular to the equipotentials. We'll spend
        Chapter&nbsp;2 on what V means and why it's the variable everyone actually measures.
      </p>

      <TryIt
        tag="Try 1.4"
        question={
          <>A <strong className="text-text font-medium">+1 µC</strong> point charge sits in vacuum. What is the electrostatic potential
          at a point 1 m away, taking infinity as the reference (V → 0 at r → ∞)?</>
        }
        hint="For a point charge, V(r) = kQ/r."
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">The potential of a single point charge, with V(∞) = 0, is <Cite id="griffiths-2017" in={SOURCES} />:</p>
            <Formula>V = kQ/r = (8.99×10⁹)(1×10⁻⁶) / 1 = 8.99×10³ V</Formula>
            <p className="mb-prose-1 last:mb-0">Answer: <strong className="text-text font-medium">~9000 V (9 kV)</strong> at 1 m. A single microcoulomb is already a kilovolt-class source.</p>
          </>
        }
      />

      <h2 className="font-2 font-light italic text-[clamp(28px,3.5vw,42px)] leading-1 tracking-1 text-text mt-3xl mb-2xl max-w-[28ch]">Conductors, insulators, and why your hair does that</h2>

      <p className="mb-prose-3">
        Materials come in two extreme types from the standpoint of charge mobility, with everything else on a sliding
        scale between them. In a{' '}
        <Term def={<><strong className="text-text font-medium">conductor</strong> — a material with mobile charge carriers (usually electrons) free to drift under an applied field. Metals and electrolytes are the canonical examples.</>}><strong className="text-text font-medium">conductor</strong></Term>{' '}
        — copper, silver, salt water, your skin to a small degree —
        some of the electrons in each atom are not bound to any particular nucleus. They drift through the material, free
        to be pushed around by any applied field. In an{' '}
        <Term def={<><strong className="text-text font-medium">insulator</strong> (dielectric) — a material in which all electrons are bound; charges can polarise but not flow. Glass, dry air, plastics.</>}><strong className="text-text font-medium">insulator</strong></Term>{' '}
        — glass, dry plastic, dry air — every
        electron is locked into a chemical bond and cannot move more than the diameter of an atom.
      </p>
      <p className="mb-prose-3">
        Put extra charge on a conductor and the free electrons rearrange themselves until the field inside the
        conductor is exactly zero. (If it weren't zero, the free charges would feel a force, accelerate, and keep
        rearranging until it was. So in equilibrium it must be.) The excess charge ends up <em className="italic text-text">on the surface</em>, as far apart as
        geometry allows<Cite id="griffiths-2017" in={SOURCES} />.
      </p>

      <ConductorRedistributionDemo />

      <p className="mb-prose-3">
        This is why a metal cage shields its interior from electric fields (a Faraday cage), why your car keeps you
        relatively safe in a thunderstorm, and why the electrons inside a copper wire — which you'll meet in
        Chapter&nbsp;2 — sit there happily until something connects the wire to a battery and breaks the equilibrium.
      </p>

      <h2 className="font-2 font-light italic text-[clamp(28px,3.5vw,42px)] leading-1 tracking-1 text-text mt-3xl mb-2xl max-w-[28ch]">What we have so far</h2>

      <p className="mb-prose-3">
        Charge is a property of matter. There are two kinds. Same kinds repel; opposites attract. The force between two
        point charges falls off as the square of the distance — for a geometric reason, not a numerological one. Around
        every charged object is a field that fills space and tells any other charge what to do. In a conductor, charges
        are free to move and rearrange themselves until the inside of the conductor has no field at all.
      </p>
      <p className="mb-prose-3">
        That is electrostatics — electricity standing still. In Chapter 2 we let it move.
      </p>

      <CaseStudies
        intro={
          <>
            Three places the bottom-layer physics of this chapter — charged surfaces, inverse-square
            forces, and conductors that redistribute their free electrons — shows up in the world at
            full scale.
          </>
        }
      >
        <CaseStudy
          tag="Case 1.1"
          title="Lightning: the largest electrostatics demo on Earth"
          summary="Atmospheric convection lifts charge until the field across a kilometers-thick capacitor breaks down all at once."
          specs={[
            { label: 'Cloud-to-ground potential', value: <>~10<sup>8</sup>–10<sup>9</sup> V <Cite id="rakov-uman-2003" in={SOURCES} /></> },
            { label: 'Median peak return-stroke current', value: <>~30 kA <Cite id="rakov-uman-2003" in={SOURCES} /></> },
            { label: 'Median charge transferred per flash', value: <>~5 C <Cite id="rakov-uman-2003" in={SOURCES} /></> },
            { label: 'Channel breakdown field in air', value: <>~3 MV/m <Cite id="uman-2001" in={SOURCES} /></> },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            A thundercloud is a slow electrostatic generator. Updrafts and ice–graupel collisions
            sort charge by mass, lifting positive charge to the anvil and dumping negative charge
            into a layer a few kilometers above ground. The cloud and the ground become the two
            plates of a stupendously large, leaky capacitor. The intervening air is an insulator —
            until the field between the plates reaches roughly the dielectric strength of air,
            around <strong className="text-text font-medium">3 MV/m</strong> at the channel scale, at which point the air ionizes
            and a conductive path punches through<Cite id="uman-2001" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            What follows is Coulomb's law cashing its check. Cloud-base-to-ground voltages of
            <strong className="text-text font-medium"> 10⁸–10⁹ V</strong> drive median return-stroke currents around <strong className="text-text font-medium">30 kA</strong>
            through a channel a few centimeters wide<Cite id="rakov-uman-2003" in={SOURCES} />. The
            total charge transferred is modest — about <strong className="text-text font-medium">5 C</strong> for a median negative
            cloud-to-ground flash — but that quantity multiplied by hundreds of millions of volts
            is a gigajoule of electrostatic energy dumped in milliseconds.
          </p>
          <p className="mb-prose-2 last:mb-0">
            Every piece of the picture lives in this chapter. Two kinds of charge, separated by an
            insulator. A field that grows until it reaches the breakdown threshold of the
            intervening medium. A conductive path that then carries the discharge between the two
            stores. Nothing essentially different from a balloon stuck to a wall — only the
            numbers are different by twenty orders of magnitude.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 1.2"
          title="The car in a thunderstorm: a Faraday cage on wheels"
          summary="Why a metal shell at unknown potential keeps the inside electrically quiet."
          specs={[
            { label: 'Equilibrium E-field inside a closed conductor', value: <>0 V/m <Cite id="griffiths-2017" in={SOURCES} /></> },
            { label: 'Excess charge location', value: <>on the outer surface <Cite id="griffiths-2017" in={SOURCES} /></> },
            { label: 'Inverse-square exponent bound from null-cavity tests', value: <>2 to within ~3×10<sup>−16</sup> <Cite id="williams-faller-hill-1971" in={SOURCES} /></> },
            { label: "Cavendish's 1773 bound on the same exponent", value: <>2 to within ~1/50 <Cite id="cavendish-1773" in={SOURCES} /></> },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            A common piece of folklore says a car protects you from lightning because of its
            rubber tires. The rubber is essentially irrelevant — the steel shell is doing all the
            work. Any closed conductor, charged or uncharged, holds the field inside its cavity at
            exactly zero in equilibrium. Free electrons in the metal redistribute themselves on the
            <em className="italic text-text"> outer</em> surface until any field they produce inside the cavity cancels every
            external field that tries to penetrate<Cite id="griffiths-2017" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            This is the Faraday-cage theorem, and it is the same theorem Cavendish exploited
            backwards in 1773. He charged a hollow conducting sphere and looked for any charge
            induced on a second sphere placed inside it. He found none, and the absence let him
            bound the inverse-square exponent to within about <strong className="text-text font-medium">1/50</strong> of exactly 2
            <Cite id="cavendish-1773" in={SOURCES} />. Williams, Faller, and Hill repeated the
            experiment with concentric icosahedra in 1971 and sharpened the bound to
            <strong className="text-text font-medium"> ~3×10⁻¹⁶</strong><Cite id="williams-faller-hill-1971" in={SOURCES} />. If the
            exponent weren't exactly 2, the field inside a closed conductor wouldn't exactly cancel,
            and the car-in-storm story would not be as clean as it is.
          </p>
          <p className="mb-prose-2 last:mb-0">
            For a real lightning strike, an enormous transient current flows through the body
            shell on its way to ground — paint flashes, antennas vaporize, electronics often die.
            But the cavity stays an equipotential, so the occupants inside do not see a potential
            difference across themselves. Tires don't matter; geometry does.
          </p>
        </CaseStudy>
      </CaseStudies>

      <FAQ
        intro="Loose threads from the chapter — the questions a careful reader tends to surface after the first pass."
      >
        <FAQItem q="Is charge a substance — a sort of electric fluid — or just a property of matter?">
          <p>
            A property, not a substance. An electron <em className="italic text-text">has</em> charge in the same way it has mass; you can't pour
            charge out of a bottle. Franklin's 18th-century picture of a single electrical fluid was wrong in detail
            but not in spirit: what we now call charge is a conserved scalar attached to particles, and the bookkeeping
            of pluses and minuses he invented still works. Each elementary charge is exactly
            <strong className="text-text font-medium"> e = 1.602176634×10⁻¹⁹ C</strong> — an exact value since the 2019 SI redefinition
            <Cite id="codata-2018" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why are there exactly two kinds of charge and not three, or seven?">
          <p>
            Nobody knows a deeper reason. Empirically, every charged particle ever observed carries an integer
            multiple of <strong className="text-text font-medium">e</strong>, and the sign comes in two flavors. The two-sign structure falls out of the
            mathematics of U(1) gauge symmetry in the Standard Model, but that just restates the fact at a higher level
            — it doesn't explain <em className="italic text-text">why</em> the universe chose U(1). For everything in this chapter, the relevant
            statement is the experimental one: like repels, unlike attracts, and the algebra of opposites lets ordinary
            matter be neutral to staggering precision<Cite id="griffiths-2017" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="If electrons are negative, why do textbooks draw current flowing from + to −?">
          <p>
            Historical accident. Franklin labeled the kind of charge that accumulates on glass rubbed with silk
            "positive," guessed it was the thing that flowed, and the convention stuck. A century later it turned out
            that in metals the actual carriers — electrons — are negative and drift the <em className="italic text-text">other</em> way. By then
            every diagram, every right-hand rule, every formula sign convention had been written in terms of
            conventional current. Rewriting all of it for accuracy was not worth the gain, so we live with the inversion.
            In an electrolyte or a plasma both signs really do flow at once, so the convention isn't even wrong there.
          </p>
        </FAQItem>

        <FAQItem q="What is the constant k in Coulomb's law, and why is it so absurdly large?">
          <p>
            In SI units <strong className="text-text font-medium">k = 1/(4πε₀) ≈ 8.99×10⁹ N·m²/C²</strong>, where <strong className="text-text font-medium">ε₀</strong> is the{' '}
            <Term def={<><strong className="text-text font-medium">permittivity</strong> of free space — the SI constant ε₀ ≈ 8.854×10⁻¹² F/m that sets the strength of the electrostatic interaction in vacuum.</>}>permittivity</Term>{' '}
            of free space<Cite id="codata-2018" in={SOURCES} />. It looks huge because the coulomb is a wildly
            oversized unit — one coulomb is the charge of about <strong className="text-text font-medium">6.24×10¹⁸</strong> electrons. Real laboratory
            charges sit at the nanocoulomb to microcoulomb level, and at those scales the forces become ordinary. The
            numerical bigness of <em className="italic text-text">k</em> is really a statement about how absurdly small a single electron's charge is
            on the scale we chose to measure it.
          </p>
        </FAQItem>

        <FAQItem q="Why exactly 4π in 1/(4πε₀), and not just π or 2π?">
          <p>
            The <strong className="text-text font-medium">4π</strong> is the surface area of a unit sphere — it's the geometry of three-dimensional space
            leaking into the equations.{' '}
            <Term def={<><strong className="text-text font-medium">Gauss's law</strong> — the electric flux through any closed surface equals the enclosed charge divided by ε₀: ∮<em className="italic text-text">E·dA</em> = <em className="italic text-text">Q</em><sub>enc</sub>/ε₀. One of Maxwell's four equations.</>}>Gauss's law</Term>{' '}
            in its clean form reads ∮E·dA = Q/ε₀, with no π anywhere
            <Cite id="gauss-1813" in={SOURCES} />. When you specialize that to a point charge and integrate over a
            sphere of radius r, the sphere's area <strong className="text-text font-medium">4πr²</strong> appears in the denominator, leaving Coulomb's
            law looking like F = Q₁Q₂/(4πε₀r²). The 4π is where you choose to hide the geometry: in Coulomb's law, or in
            Gauss's law, but not both.
          </p>
        </FAQItem>

        <FAQItem q="Coulomb's law is written for point charges. What about real, extended objects?">
          <p>
            You integrate. Slice the object into infinitesimal pieces, treat each as a point charge dq, and sum the
            contributions vectorially. For continuous distributions this is a volume, surface, or line integral over the
            charge density. The field framework makes this almost mechanical: every dq contributes
            <strong className="text-text font-medium"> dE = k dq r̂ / r²</strong>, and superposition guarantees the total field is the integral. The full
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
            within about <strong className="text-text font-medium">1/50</strong> by his analysis<Cite id="cavendish-1773" in={SOURCES} />. Williams,
            Faller, and Hill in 1971 sharpened the technique with concentric icosahedra and bounded any deviation
            <strong className="text-text font-medium"> q</strong> in the form 1/r^(2+q) to <strong className="text-text font-medium">q = (2.7 ± 3.1)×10⁻¹⁶</strong>
            <Cite id="williams-faller-hill-1971" in={SOURCES} />. If the photon has a rest mass at all, it is fantastically
            small; the inverse-square law is one of the most precisely confirmed statements in physics.
          </p>
        </FAQItem>

        <FAQItem q="What's the difference between the electric field E and the potential V?">
          <p>
            <strong className="text-text font-medium">E</strong> is a vector at every point: it tells you the force per unit charge and which way that
            force points. <strong className="text-text font-medium">V</strong> is a scalar at every point: it tells you the potential energy per unit
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
            <em className="italic text-text"> cavity</em> inside is also field-free, provided there are no charges inside it
            <Cite id="griffiths-2017" in={SOURCES} />. This is exactly what Cavendish exploited in his 1773 null
            experiment to test the inverse-square law<Cite id="cavendish-1773" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Is the electric field a kind of substance, like air? Could you compress it?">
          <p>
            No — it isn't made of anything; it's a vector quantity defined at every point in space. You can't compress
            it, but you <em className="italic text-text">can</em> superpose fields (add them) and you can store energy in them. The energy density
            of an electrostatic field is <strong className="text-text font-medium">u = ½ ε₀ |E|²</strong>, in joules per cubic meter
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
            transferred is tiny — typically nanocoulombs over the whole head — but with k around <strong className="text-text font-medium">10¹⁰</strong>
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
            1 meter would repel each other with <strong className="text-text font-medium">~9×10⁹ N</strong>, more than the weight of a fully loaded
            aircraft carrier. That is why static-electricity demonstrations use nanocoulombs and microcoulombs — a
            <em className="italic text-text"> whole</em> coulomb of free charge isolated in one place is essentially impossible to assemble.
          </p>
        </FAQItem>

        <FAQItem q="Is the speed of an electrical signal in a wire the same as the speed of light?">
          <p>
            Close, but not identical, and — crucially — it has very little to do with the speed of the electrons. The
            signal that flips a switch is a disturbance in the electromagnetic field surrounding the wire, propagating
            at a fraction (often ~⅔) of the vacuum speed of light <strong className="text-text font-medium">c = 299,792,458 m/s</strong>
            <Cite id="codata-2018" in={SOURCES} />. The electrons themselves drift along at fractions of a millimeter
            per second. We pull that apart properly in Chapter 2, and the field-flow picture lands in Chapter 6.
          </p>
        </FAQItem>
      </FAQ>
    </ChapterShell>
  );
}
