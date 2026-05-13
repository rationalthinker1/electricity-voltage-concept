/**
 * Chapter 9 — Relativity and electromagnetism
 *
 * The redeemer of Chapter 4's promise: "magnetism is the relativistic
 * shadow of electricity." Short, punchy chapter, focused on the wire-and-
 * test-charge thought experiment, the Lorentz boost that converts it, the
 * exact numerical match, the unification into the field tensor, and what
 * the unification means for the rest of physics.
 *
 * Embedded demos:
 *   9.1 WireFromRest         — lab frame: neutral wire, motionless test charge, zero force
 *   9.2 WireFromMovingFrame  — boosted frame: charged wire, zero v_test, electric force
 *   9.3 EBTransform          — pure E_y in one frame becomes E + B in a boosted frame
 *   9.4 FieldTensor          — the 4×4 antisymmetric F^μν matrix, components mix under boost
 */
import { ChapterShell } from '@/components/ChapterShell';
import { FAQ, FAQItem } from '@/components/FAQ';
import { Cite } from '@/components/SourcesList';
import { Formula, InlineMath } from '@/components/Formula';
import { EBTransformDemo } from './demos/EBTransform';
import { FieldTensorDemo } from './demos/FieldTensor';
import { WireFromMovingFrameDemo } from './demos/WireFromMovingFrame';
import { WireFromRestDemo } from './demos/WireFromRest';
import { getChapter } from './data/chapters';

export default function Ch9Relativity() {
  const chapter = getChapter('relativity')!;
  const SOURCES = chapter.sources;

  return (
    <ChapterShell chapter={chapter}>
      <p>
        Five chapters ago we made a promise. At the end of Chapter&nbsp;4, after teaching the Biot–Savart law, the
        right-hand rule, and the magnetic force on two parallel wires, we claimed that none of it was really a
        separate force. <em>Magnetism is what electricity looks like when you change reference frames.</em> A
        slogan, no derivation. Now we redeem it.
      </p>
      <p>
        The argument is built around one thought experiment — a wire carrying a steady current with a small test
        charge sitting next to it. We will compute what happens in two frames, get the same physical answer both
        ways, and watch the label on the force change from "magnetic" to "electric" as we jump between them. By
        the end the two fields will have collapsed into one object.
      </p>

      <h2>A promise from <em>Chapter 4</em></h2>

      <p>
        The setup. A long straight wire carrying a steady current <strong>I</strong>. Far enough from the ends
        that you can treat it as infinite. The wire is <strong>electrically neutral</strong> — the lattice of
        positive ions and the drifting electrons have equal linear charge densities in the wire's rest frame, so
        the net charge per unit length is zero.
      </p>
      <p>
        Place a small positive test charge <strong>q</strong> next to it, also at rest in the lab. What force
        does it feel? Run through the chapter-4 catalog. The wire is neutral, so <strong>E</strong> from the wire
        is zero — no electric force. The wire makes a magnetic field <strong>B</strong> that wraps around it
        according to Ampère, but the magnetic Lorentz force <InlineMath>F = q v × B</InlineMath> requires the
        test charge to be <em>moving</em>, and ours isn't. <strong>The test charge feels nothing.</strong>
      </p>

      <WireFromRestDemo />

      <p>
        So far so good. Now imagine the test charge had a small velocity along the wire — same direction as the
        current, say. Now <InlineMath>v × B</InlineMath> is nonzero and the test charge experiences a magnetic
        force pulling it toward the wire (or pushing it away — depends on sign conventions; pick one). The
        magnitude follows from chapter 4: <InlineMath>F = q v B = q v · μ₀ I / (2π d)</InlineMath>, with
        <InlineMath> d</InlineMath> the distance to the wire.
      </p>
      <p>
        Here is the question that should make you pause. The wire was electrically neutral. Where in space did
        this force come from? "It came from B" is not a satisfying answer — B is just bookkeeping for a force.
        What is the <em>mechanism</em>? Pre-relativistic physics says: there isn't one. Magnetism is just a
        primitive force, postulated, distinct from electricity. Live with it.
      </p>

      <h2>The same wire, viewed from a moving <em>train</em></h2>

      <p>
        Special relativity says: don't live with it. Same physical situation, but switch reference frames. Get
        on a small train moving along the wire at exactly the test charge's velocity. In your new frame the test
        charge is at rest. The wire is moving — that is, the ions and the electrons in it are both moving — but
        with different velocities than they had in the lab.
      </p>
      <p>
        In the lab frame the ions were stationary and the electrons drifted rightward at <InlineMath>v_d</InlineMath>.
        On the train (moving rightward at <InlineMath>v_test</InlineMath>), the ions appear to drift leftward at
        <InlineMath> -v_test</InlineMath>, and the electrons appear to drift at the relativistic difference
        <InlineMath> v_d' = (v_d - v_test) / (1 - v_d · v_test / c²)</InlineMath>. Both speeds are nonzero. The
        positive lattice is now moving and Lorentz-contracts; the electrons are moving too and contract by a
        <em> different</em> amount, because contraction depends on speed
        <Cite id="einstein-1905" in={SOURCES} /><Cite id="purcell-morin-2013" in={SOURCES} />.
      </p>
      <p>
        Two different contractions, same number of ions per ion-rest-frame meter and electrons per
        electron-rest-frame meter, give different linear charge densities of the two species in this new frame.
        <strong> The wire is no longer electrically neutral.</strong> It carries a net charge per unit length
        <em> λ'</em>, and the (now-stationary) test charge sees a perfectly ordinary electric force from a
        charged line: <InlineMath>F = q · λ' / (2π ε₀ d)</InlineMath>.
      </p>

      <WireFromMovingFrameDemo />

      <h2>The numbers work out <em>exactly</em></h2>

      <p>
        This isn't a hand-wave. Purcell &amp; Morin's textbook works through the algebra in Chapter&nbsp;5–6 and
        the result lands on the nose <Cite id="purcell-morin-2013" in={SOURCES} />. The two contraction factors
        produce a net linear charge density in the boosted frame whose magnitude, multiplied by the Coulomb
        electric force from an infinite charged line, equals — term for term — the magnetic Lorentz force the
        lab frame predicted from the Biot–Savart formula.
      </p>
      <p>
        The key identity reads
      </p>
      <Formula>F<sub>magnetic</sub> (lab) = F<sub>electric</sub> (boosted) </Formula>
      <p>
        and it holds because the entire apparatus of magnetism is the leading-order correction to the Coulomb
        force needed to make electrostatics relativistically consistent. The constant <InlineMath>μ₀</InlineMath>
        is not a new fundamental constant; it's locked to <InlineMath>ε₀</InlineMath> and <InlineMath>c</InlineMath>
        by <InlineMath>μ₀ ε₀ = 1/c²</InlineMath>, exactly the relation special relativity demands
        <Cite id="feynman-II-13" in={SOURCES} /><Cite id="jackson-1999" in={SOURCES} />.
      </p>
      <p className="pullout">
        Magnetism is not a separate force. It is the geometry of moving charge.
      </p>
      <p>
        The drift velocity in copper is on the order of a millimeter per second — vastly less than c — so
        γ&nbsp;≈&nbsp;1 to fifteen decimal places, and the relativistic correction looks ridiculously small. It
        <em> is</em> ridiculously small per electron. But there are about
        <strong> 10²³</strong> electrons per cubic centimeter of copper, and the imbalance times that number is
        what gives the wire its measurable magnetic effect. Magnetism is a colossal pile of tiny relativistic
        corrections, summed coherently <Cite id="purcell-morin-2013" in={SOURCES} />.
      </p>

      <h2>E and B <em>together</em></h2>

      <p>
        Once you accept that "electric" and "magnetic" are frame-dependent labels on a single underlying object,
        the next step writes itself. There is one object. Its components are six numbers (the three components of
        E plus the three components of B), arranged in a specific way, and a Lorentz boost mixes those six
        numbers among themselves the way an ordinary rotation mixes the three components of a vector.
      </p>
      <p>
        The clean way to write it is as a 4×4 antisymmetric matrix, the <strong>electromagnetic field tensor</strong>
        <em> F<sup>μν</sup></em> <Cite id="jackson-1999" in={SOURCES} /><Cite id="griffiths-2017" in={SOURCES} />.
        Its diagonal is zero (by antisymmetry); the top row contains the three components of E (divided by c);
        the remaining off-diagonal entries are the three components of B. Apply a Lorentz transformation
        <InlineMath> Λ<sup>μ</sup><sub>α</sub></InlineMath> to both indices and the components mix according to
        <InlineMath> F'<sup>μν</sup> = Λ<sup>μ</sup><sub>α</sub> Λ<sup>ν</sup><sub>β</sub> F<sup>αβ</sup></InlineMath>.
        Boost in the x-direction and you reproduce the transformation rules Einstein wrote down in §9 of his 1905
        paper <Cite id="einstein-1905" in={SOURCES} />.
      </p>

      <EBTransformDemo />

      <p>
        The tensor is not just a notational trick. Two Lorentz invariants live inside it —
        <InlineMath> F<sub>μν</sub>F<sup>μν</sup> ∝ B² - E²/c²</InlineMath> and the pseudo-scalar
        <InlineMath> ε<sub>μνρσ</sub>F<sup>μν</sup>F<sup>ρσ</sup> ∝ E·B</InlineMath> — which means every observer
        agrees on the sign of <InlineMath>B² - E²/c²</InlineMath> and on whether E and B are perpendicular. The
        split into "electric" and "magnetic" is frame-dependent; these two combinations are not.
      </p>

      <FieldTensorDemo />

      <h2>What this <em>means</em></h2>

      <p>
        Classical electrodynamics is the consequence of two ingredients. <strong>(1)</strong> Coulomb's law for
        charges at rest. <strong>(2)</strong> Special relativity. You do not need to "discover" magnetism
        separately and tack it on; it falls out the moment you ask what an electrostatic interaction looks like
        between observers in relative motion. Maxwell's equations are the simplest set of field equations
        compatible with both ingredients, and they were already Lorentz-invariant when Maxwell wrote them down
        in 1865 <Cite id="einstein-1905" in={SOURCES} /><Cite id="jackson-1999" in={SOURCES} />.
      </p>
      <p>
        Maxwell didn't know that. Nobody did. There was nothing else to compare his theory to: Newtonian
        mechanics was Galilean-invariant, optics was a mess, the ether hadn't yet been falsified. It took until
        1905 for Einstein to walk into the Bern patent office, notice that Maxwell's equations were the only
        Galilean-broken theory of his day, and conclude that it was <em>mechanics</em> that needed adjusting, not
        electromagnetism. The opening paragraph of "On the Electrodynamics of Moving Bodies" cites a single
        motivating problem: the asymmetry of how textbooks treated a magnet moving past a conductor versus a
        conductor moving past a magnet, even though only the relative motion is observable
        <Cite id="einstein-1905" in={SOURCES} />.
      </p>
      <p>
        Resolving that asymmetry is what produced special relativity. The whole architecture — time dilation,
        length contraction, mass-energy equivalence, the cosmic speed limit — fell out of insisting that
        electromagnetism look the same in every inertial frame. The book you've been reading has, in this sense,
        been one story all along: charges, fields, and the geometry of spacetime they live in.
      </p>

      <FAQ intro="Sixteen questions that come up if you take the relativistic-shadow picture seriously.">
        <FAQItem q='If magnetism is "relativistic," why is its strength so similar to the electric force at everyday speeds?'>
          <p>
            Because the relevant velocity isn't the drift speed of one electron — it's the collective effect of
            <strong> all</strong> the moving charges in a wire. The per-electron correction is of order
            <InlineMath> v_d / c ≈ 10⁻¹³</InlineMath>, absurdly tiny. But there are
            <InlineMath> ~10²³</InlineMath> conduction electrons per cubic centimeter of copper, all drifting in
            the same direction. The "tiny correction" multiplied by Avogadro-scale numbers is what you measure as
            an everyday magnetic force <Cite id="purcell-morin-2013" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Drift velocity in copper is millimeters per second. How does such a tiny v produce a sizeable B?">
          <p>
            Same point, said slightly differently. A 20-amp current corresponds to about
            <InlineMath> 1.2 × 10²⁰</InlineMath> electrons per second crossing a wire's cross-section. Each one
            contributes a sliver of magnetic effect; collectively they add up to fields of milli-tesla scale at
            short distances. The wire doesn't have to move; the charges inside it do, and there are enormously
            many of them <Cite id="griffiths-2017" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Doesn't this require electrons to be moving at relativistic speeds?">
          <p>
            No. The argument works at any speed — the boost just has to differ between the test charge and the
            wire's drift frame. The size of the resulting magnetic-vs-electric force depends on the relative
            velocity, and at non-relativistic speeds the magnetic effect is small per particle. But "small per
            particle" multiplied by <InlineMath>10²³</InlineMath> particles per cm³ is what makes ordinary
            electromagnets work <Cite id="purcell-morin-2013" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="In a permanent magnet there's no obvious current. What's the underlying motion?">
          <p>
            Electron spin and orbital angular momentum. Each electron carries an intrinsic magnetic moment whose
            classical analog is a tiny current loop; in iron the moments of unpaired electrons align over large
            domains, and those aligned moments produce the bulk field. The "motion" is quantum-mechanical, not
            classical, but as a source of B it behaves the same — and from the relativistic point of view, a
            spinning magnetic moment is the source of a magnetic field for the same reason a current loop is
            <Cite id="jackson-1999" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Does this picture also work for moving magnets — say a magnet flying past a wire?">
          <p>
            Yes, and Einstein's 1905 paper opens with exactly this case as its motivating example. A magnet
            moving past a stationary loop induces an EMF that drives a current; a loop moving past a stationary
            magnet induces the same EMF. Pre-relativistic textbooks treated these as two different phenomena
            (one was "induction from a changing B," the other was "the motional Lorentz force"). Relativity
            unifies them: only the relative motion matters, and the field tensor handles both at once
            <Cite id="einstein-1905" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Are there frames in which a magnetic field is purely electric?">
          <p>
            Sometimes. If you start in a frame with pure B and no E, you can boost into a frame where there's
            both E and B. Whether you can boost to a frame with pure E depends on the Lorentz invariants of the
            original field: only when <InlineMath>B² - E²/c² &lt; 0</InlineMath> (electric-dominated) and
            <InlineMath> E · B = 0</InlineMath> can you find a frame where B vanishes. Magnetic-dominated fields
            (like the one around a current-carrying wire near it) stay magnetic in every frame
            <Cite id="jackson-1999" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q={'Can you "turn off" the magnetic part everywhere by choosing the right frame?'}>
          <p>
            No — except in special cases. For a single static source at a single point, yes, you can find a
            frame where the field is purely electric or purely magnetic depending on the invariants. For a more
            complex configuration (multiple moving sources, radiation fields), no single frame makes B vanish
            everywhere. The Lorentz invariants <InlineMath>B² - E²/c²</InlineMath> and <InlineMath>E · B</InlineMath>
            are frame-independent: they constrain what configurations are reachable by boosting
            <Cite id="griffiths-2017" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why don't physicists just teach EM with the field tensor from day one?">
          <p>
            Because the tensor formalism requires special relativity, and most students learn classical
            electrostatics before they've seen four-vectors. Purcell &amp; Morin's textbook is the famous
            exception — it teaches B as the relativistic consequence of moving charge from chapter 5, and it
            works beautifully, but only after students have absorbed the Lorentz transformation. The standard
            pedagogical ordering trades structural elegance for accessibility
            <Cite id="purcell-morin-2013" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Did Maxwell know any of this? Was relativity already implicit in his equations?">
          <p>
            Implicit, yes; explicit, no. Maxwell's equations turn out to be Lorentz-invariant — they keep their
            form under boosts — but Maxwell wrote them in 1865 in component form and never noticed that special
            property. Lorentz himself, working from Maxwell's equations, was the one who derived the
            transformation rules that bear his name (motivated by the Michelson–Morley null result and the
            puzzle of electron self-energy). Einstein in 1905 turned the procedure inside out: assume relativity
            of inertial frames, and Maxwell's equations are forced
            <Cite id="einstein-1905" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why did Einstein cite the moving-magnet-vs-moving-conductor asymmetry as motivation?">
          <p>
            Because it was the most visible Galilean-symmetry violation of late-19th-century physics. Pre-1905
            textbooks gave two different explanations for the EMF induced in a loop, depending on whether the
            loop moved or the magnet moved — even though the physics is the same in either case, and even though
            Maxwell's equations themselves didn't actually need the two cases distinguished. The asymmetry was
            an artifact of the surrounding Newtonian picture. Einstein opened his paper by pointing that out
            and concluded that the surrounding picture had to give way
            <Cite id="einstein-1905" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Does this make charge conservation a relativistic theorem?">
          <p>
            Charge conservation predates relativity, but the relativistic picture clarifies why it holds: charge
            is the time component of a conserved four-current <InlineMath>J<sup>μ</sup></InlineMath>, and the
            statement <InlineMath>∂<sub>μ</sub> J<sup>μ</sup> = 0</InlineMath> is Lorentz-covariant — it means
            the same thing in every frame. In quantum field theory, charge conservation is the Noether current
            associated with the U(1) gauge symmetry of QED. Either way, it's a deep structural fact, not an
            empirical accident <Cite id="jackson-1999" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q='Are E and B "frame-independent" in any sense?'>
          <p>
            Yes — but only in combinations. The two scalar quantities <InlineMath>B² - E²/c²</InlineMath> and
            <InlineMath> E · B</InlineMath> are Lorentz invariants. Every observer agrees on those two numbers,
            even though they disagree on the values of E and B separately. Those invariants classify field
            configurations into the four families of "electric-like," "magnetic-like," "null" (radiation), and
            "mixed" — and that classification has frame-independent physical meaning
            <Cite id="griffiths-2017" in={SOURCES} /><Cite id="jackson-1999" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What's a magnetic field in QED? Is it still a field tensor?">
          <p>
            In quantum electrodynamics the classical field tensor <InlineMath>F<sup>μν</sup></InlineMath> is
            replaced by an operator-valued field built out of photon creation and annihilation operators. The
            physical content is the same: E and B are still entries in one tensor, that tensor still transforms
            under Lorentz boosts the same way, and the dynamics is still gauge-invariant. The classical chapter-9
            picture survives quantization more or less intact — the photon is the gauge boson that mediates
            interactions of <InlineMath>F<sup>μν</sup></InlineMath> with charged matter
            <Cite id="jackson-1999" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="If gravity is geometry, is EM also geometry?">
          <p>
            Yes — in the precise sense of gauge theory. The electromagnetic four-potential
            <InlineMath> A<sup>μ</sup></InlineMath> is a connection on a U(1) fiber bundle, and the field tensor
            <InlineMath> F<sup>μν</sup> = ∂<sup>μ</sup>A<sup>ν</sup> - ∂<sup>ν</sup>A<sup>μ</sup></InlineMath>
            is the curvature of that connection. The mathematical analogy to general relativity, where the
            metric is the connection and the Riemann tensor is the curvature, is exact in form. Both are
            "geometry" in the modern sense; they differ in <em>which</em> internal space is being curved
            <Cite id="jackson-1999" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why is c the only relevant speed in EM, but not in mechanics?">
          <p>
            Because c is built into Maxwell's equations in a way that any speed of a massive object isn't built
            into Newton's. The relation <InlineMath>μ₀ ε₀ = 1/c²</InlineMath> ties the speed of EM-wave
            propagation to the same constants that set the strength of the static electric and magnetic forces.
            Once you accept that EM is the same in every inertial frame (Einstein's postulate), c must be the
            same in every frame too — and that's the speed limit. Mechanics had no such tie because Newtonian
            mechanics didn't propagate disturbances at a finite speed in the first place
            <Cite id="einstein-1905" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="How does the photon's zero rest mass fit in?">
          <p>
            The photon is massless because the U(1) gauge symmetry of electromagnetism is unbroken — there is no
            "Higgs mechanism" for electromagnetism the way there is for the weak force. Equivalently, Maxwell's
            equations have an exact gauge symmetry, which forbids a photon mass term. If the photon had a tiny
            mass, Coulomb's law would acquire a Yukawa <InlineMath>e<sup>-mr/ℏc</sup>/r</InlineMath> screening,
            and the inverse-square law would fail at large distances. Experiments bound the photon mass to
            <InlineMath> &lt; 10⁻¹⁸</InlineMath> eV — consistent with zero
            <Cite id="williams-faller-hill-1971" in={SOURCES} /><Cite id="griffiths-2017" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Does general relativity change Maxwell's equations?">
          <p>
            Slightly. In curved spacetime, the partial derivatives in Maxwell's equations become covariant
            derivatives (with metric-dependent Christoffel symbols), and the field tensor's indices are raised
            and lowered with the curved-space metric instead of the flat Minkowski metric. The structural form
            <InlineMath> dF = 0</InlineMath>, <InlineMath>d★F = ★J</InlineMath> stays the same — Maxwell's
            equations are written naturally in differential-forms language, and that language is already
            covariant. The corrections show up only when spacetime curvature is non-negligible (near black
            holes, in cosmology) <Cite id="jackson-1999" in={SOURCES} />.
          </p>
        </FAQItem>
      </FAQ>
    </ChapterShell>
  );
}
