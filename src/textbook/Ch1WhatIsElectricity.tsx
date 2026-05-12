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
    </ChapterShell>
  );
}
