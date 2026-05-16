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
import { CaseStudies, CaseStudy } from '@/components/CaseStudy';
import { ChapterShell } from '@/components/ChapterShell';
import { FAQ, FAQItem } from '@/components/FAQ';
import { Cite } from '@/components/SourcesList';
import { Formula, InlineMath } from '@/components/Formula';
import { Term } from '@/components/Term';
import { TryIt } from '@/components/TryIt';
import { EBTransformDemo } from './demos/EBTransform';
import { FieldTensorDemo } from './demos/FieldTensor';
import { WireFromMovingFrameDemo } from './demos/WireFromMovingFrame';
import { WireFromRestDemo } from './demos/WireFromRest';
import { getChapter } from './data/chapters';

export default function Ch11Relativity() {
  const chapter = getChapter('relativity')!;
  const SOURCES = chapter.sources;

  return (
    <ChapterShell chapter={chapter}>
      <p className="chapter-intro">
        Five chapters ago we made a promise. At the end of Chapter&nbsp;4, after teaching the
        Biot–Savart law, the right-hand rule, and the magnetic force on two parallel wires, we
        claimed that none of it was really a separate force.{' '}
        <em className="text-text italic">
          Magnetism is what electricity looks like when you change{' '}
          <Term
            def={
              <>
                <strong className="text-text font-medium">reference frame</strong> — a choice of
                observer (position + state of motion) against which positions, times, and velocities
                are measured. Inertial frames move uniformly relative to one another; physical laws
                must take the same form in all of them.
              </>
            }
          >
            reference frames
          </Term>
          .
        </em>{' '}
        A slogan, no derivation. Now we redeem it.
      </p>
      <p className="mb-prose-3">
        The argument is built around one thought experiment — a wire carrying a steady current with
        a small test charge sitting next to it. We will compute what happens in two frames, get the
        same physical answer both ways, and watch the label on the force change from "magnetic" to
        "electric" as we jump between them. By the end the two fields will have collapsed into one
        object.
      </p>

      <h2 className="chapter-h2">
        A promise from <em>Chapter 4</em>
      </h2>

      <p className="mb-prose-3">
        The setup. A long straight wire carrying a steady current{' '}
        <strong className="text-text font-medium">I</strong>. Far enough from the ends that you can
        treat it as infinite. The wire is{' '}
        <strong className="text-text font-medium">electrically neutral</strong> — the lattice of
        positive ions and the drifting electrons have equal linear charge densities in the wire's
        rest frame, so the net charge per unit length is zero.
      </p>
      <p className="mb-prose-3">
        Place a small positive test charge <strong className="text-text font-medium">q</strong> next
        to it, also at rest in the lab. What force does it feel? Run through the chapter-4 catalog.
        The wire is neutral, so <strong className="text-text font-medium">E</strong> from the wire
        is zero — no electric force. The wire makes a magnetic field{' '}
        <strong className="text-text font-medium">B</strong> that wraps around it according to
        Ampère, but the magnetic Lorentz force <InlineMath>F = q v × B</InlineMath> requires the
        test charge to be <em className="text-text italic">moving</em>, and ours isn't.{' '}
        <strong className="text-text font-medium">The test charge feels nothing.</strong>
      </p>

      <WireFromRestDemo />

      <p className="mb-prose-3">
        So far so good. Now imagine the test charge had a small velocity along the wire — same
        direction as the current, say. Now <InlineMath>v × B</InlineMath> is nonzero and the test
        charge experiences a magnetic force pulling it toward the wire (or pushing it away — depends
        on sign conventions; pick one). The magnitude follows from chapter 4:{' '}
        <InlineMath>F = q v B = q v · μ₀ I / (2π d)</InlineMath>, with
        <InlineMath> d</InlineMath> the distance to the wire.
      </p>
      <p className="mb-prose-3">
        Here is the question that should make you pause. The wire was electrically neutral. Where in
        space did this force come from? "It came from B" is not a satisfying answer — B is just
        bookkeeping for a force. What is the <em className="text-text italic">mechanism</em>?
        Pre-relativistic physics says: there isn't one. Magnetism is just a primitive force,
        postulated, distinct from electricity. Live with it.
      </p>

      <h2 className="chapter-h2">
        The same wire, viewed from a moving <em>train</em>
      </h2>

      <p className="mb-prose-3">
        Special relativity says: don't live with it. Same physical situation, but switch reference
        frames. Get on a small train moving along the wire at exactly the test charge's velocity. In
        your new frame the test charge is at rest. The wire is moving — that is, the ions and the
        electrons in it are both moving — but with different velocities than they had in the lab.
      </p>
      <p className="mb-prose-3">
        In the lab frame the ions were stationary and the electrons drifted rightward at{' '}
        <InlineMath>v_d</InlineMath>. On the train (moving rightward at{' '}
        <InlineMath>v_test</InlineMath>), the ions appear to drift leftward at
        <InlineMath> -v_test</InlineMath>, and the electrons appear to drift at the relativistic
        difference
        <InlineMath> v_d' = (v_d - v_test) / (1 - v_d · v_test / c²)</InlineMath>. Both speeds are
        nonzero. The positive lattice is now moving and{' '}
        <Term
          def={
            <>
              <strong className="text-text font-medium">length contraction</strong> — in special
              relativity, an object of proper length <em className="text-text italic">L₀</em>{' '}
              measured along its direction of motion appears shortened to{' '}
              <em className="text-text italic">L = L₀/γ</em> in any frame in which it moves at speed{' '}
              <em className="text-text italic">v</em>.
            </>
          }
        >
          Lorentz-contracts
        </Term>
        ; the electrons are moving too and contract by a
        <em className="text-text italic"> different</em> amount, because contraction depends on
        speed
        <Cite id="einstein-1905" in={SOURCES} />
        <Cite id="purcell-morin-2013" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        Two different contractions, same number of ions per ion-rest-frame meter and electrons per
        electron-rest-frame meter, give different linear charge densities of the two species in this
        new frame.
        <strong className="text-text font-medium">
          {' '}
          The wire is no longer electrically neutral.
        </strong>{' '}
        It carries a net charge per unit length
        <em className="text-text italic"> λ'</em>, and the (now-stationary) test charge sees a
        perfectly ordinary electric force from a charged line:{' '}
        <InlineMath>F = q · λ' / (2π ε₀ d)</InlineMath>.
      </p>

      <WireFromMovingFrameDemo />

      <h2 className="chapter-h2">
        The numbers work out <em>exactly</em>
      </h2>

      <p className="mb-prose-3">
        This isn't a hand-wave. Purcell &amp; Morin's textbook works through the algebra in
        Chapter&nbsp;5–6 and the result lands on the nose{' '}
        <Cite id="purcell-morin-2013" in={SOURCES} />. The two contraction factors produce a net
        linear charge density in the boosted frame whose magnitude, multiplied by the Coulomb
        electric force from an infinite charged line, equals — term for term — the magnetic Lorentz
        force the lab frame predicted from the Biot–Savart formula.
      </p>
      <p className="mb-prose-3">The key identity reads</p>
      <Formula>
        F<sub>magnetic</sub> (lab) = F<sub>electric</sub> (boosted){' '}
      </Formula>
      <p className="mb-prose-3">
        where{' '}
        <strong className="text-text font-medium">
          F<sub>magnetic</sub>(lab)
        </strong>{' '}
        is the magnetic Lorentz force the test charge feels in the wire's rest frame (in newtons,
        given by <em className="text-text italic">qv × B</em> with{' '}
        <em className="text-text italic">B</em> from Biot–Savart) and
        <strong className="text-text font-medium">
          {' '}
          F<sub>electric</sub>(boosted)
        </strong>{' '}
        is the ordinary Coulomb force the same test charge feels in the frame in which it is
        momentarily at rest (also in newtons, given by <em className="text-text italic">qE</em> from
        the residual linear charge density of the now-non-neutral wire). Both are the force on one
        and the same physical test charge; only the label changes with the choice of frame. It holds
        because the entire apparatus of magnetism is the leading-order correction to the Coulomb
        force needed to make electrostatics relativistically consistent. The constant{' '}
        <InlineMath>μ₀</InlineMath>
        is not a new fundamental constant; it's locked to <InlineMath>ε₀</InlineMath> and{' '}
        <InlineMath>c</InlineMath>
        by <InlineMath>μ₀ ε₀ = 1/c²</InlineMath>, exactly the relation special relativity demands
        <Cite id="feynman-II-13" in={SOURCES} />
        <Cite id="jackson-1999" in={SOURCES} />.
      </p>
      <p className="pullout">
        Magnetism is not a separate force. It is the geometry of moving charge.
      </p>
      <p className="mb-prose-3">
        The drift velocity in copper is on the order of a millimeter per second — vastly less than c
        — so the{' '}
        <Term
          def={
            <>
              <strong className="text-text font-medium">gamma factor (γ)</strong> — the Lorentz
              factor <em className="text-text italic">γ = 1/√(1 − v²/c²)</em>. Equal to 1 at rest,
              diverging at <em className="text-text italic">v → c</em>. Controls time dilation,
              length contraction, and relativistic mass-energy.
            </>
          }
        >
          γ
        </Term>{' '}
        ≈ 1 to fifteen decimal places, and the relativistic correction looks ridiculously small. It
        <em className="text-text italic"> is</em> ridiculously small per electron. But there are
        about
        <strong className="text-text font-medium"> 10²³</strong> electrons per cubic centimeter of
        copper, and the imbalance times that number is what gives the wire its measurable magnetic
        effect. Magnetism is a colossal pile of tiny relativistic corrections, summed coherently{' '}
        <Cite id="purcell-morin-2013" in={SOURCES} />.
      </p>

      <TryIt
        tag="Try 11.1"
        question={
          <>
            Compute the Lorentz factor γ for an object moving at{' '}
            <em className="text-text italic">v</em> = 0.1c, 0.5c, 0.9c, and 0.99c.
          </>
        }
        hint="γ = 1/√(1 − β²), where β = v/c."
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">Plug each β into the formula:</p>
            <Formula>γ(0.1c) = 1/√(1 − 0.01) ≈ 1.0050</Formula>
            <Formula>γ(0.5c) = 1/√(1 − 0.25) ≈ 1.1547</Formula>
            <Formula>γ(0.9c) = 1/√(1 − 0.81) ≈ 2.2942</Formula>
            <Formula>γ(0.99c) = 1/√(1 − 0.9801) ≈ 7.0888</Formula>
            <p className="mb-prose-1 last:mb-0">
              γ stays within a few percent of 1 until well past half the speed of light, then climbs
              steeply. At 0.99c, time dilation and length contraction are already a factor of{' '}
              <strong className="text-text font-medium">~7</strong>
              <Cite id="einstein-1905" in={SOURCES} />
              <Cite id="jackson-1999" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2 className="chapter-h2">
        E and B <em>together</em>
      </h2>

      <p className="mb-prose-3">
        Once you accept that "electric" and "magnetic" are frame-dependent labels on a single
        underlying object, the next step writes itself. There is one object. Its components are six
        numbers (the three components of E plus the three components of B), arranged in a specific
        way, and a Lorentz boost mixes those six numbers among themselves the way an ordinary
        rotation mixes the three components of a vector.
      </p>
      <p className="mb-prose-3">
        The clean way to write it is as a 4×4 antisymmetric matrix, the{' '}
        <Term
          def={
            <>
              <strong className="text-text font-medium">
                electromagnetic field tensor (F<sup>μν</sup>)
              </strong>{' '}
              — the rank-2 antisymmetric tensor whose six independent components are the three of{' '}
              <em className="text-text italic">E/c</em> and the three of{' '}
              <em className="text-text italic">B</em>. Maxwell's equations rewrite as{' '}
              <em className="text-text italic">
                ∂<sub>μ</sub>F<sup>μν</sup> = μ₀J<sup>ν</sup>
              </em>{' '}
              and{' '}
              <em className="text-text italic">
                ∂<sub>[α</sub>F<sub>μν]</sub> = 0
              </em>
              , manifestly Lorentz-covariant.
            </>
          }
        >
          electromagnetic field tensor
        </Term>{' '}
        <em className="text-text italic">
          F<sup>μν</sup>
        </em>{' '}
        <Cite id="jackson-1999" in={SOURCES} />
        <Cite id="griffiths-2017" in={SOURCES} />. Its diagonal is zero (by antisymmetry); the top
        row contains the three components of E (divided by c); the remaining off-diagonal entries
        are the three components of B. Apply a{' '}
        <Term
          def={
            <>
              <strong className="text-text font-medium">Lorentz transformation</strong> — the linear
              change of coordinates between two inertial frames in special relativity. Mixes time
              and space coordinates so that the speed of light is the same in every frame; the
              matrix{' '}
              <em className="text-text italic">
                Λ<sup>μ</sup>
                <sub>α</sub>
              </em>{' '}
              acts on four-vectors and tensors.
            </>
          }
        >
          Lorentz transformation
        </Term>{' '}
        <InlineMath>
          Λ<sup>μ</sup>
          <sub>α</sub>
        </InlineMath>{' '}
        to both indices and the components mix according to
        <InlineMath>
          {' '}
          F'<sup>μν</sup> = Λ<sup>μ</sup>
          <sub>α</sub> Λ<sup>ν</sup>
          <sub>β</sub> F<sup>αβ</sup>
        </InlineMath>
        . Boost in the x-direction and you reproduce the transformation rules Einstein wrote down in
        §9 of his 1905 paper <Cite id="einstein-1905" in={SOURCES} />.
      </p>

      <EBTransformDemo />

      <p className="mb-prose-3">
        The tensor is not just a notational trick. Two{' '}
        <Term
          def={
            <>
              <strong className="text-text font-medium">Lorentz invariant</strong> — a quantity
              built from four-vectors or tensors that takes the same value in every inertial frame.
              The spacetime <em className="text-text italic">invariant interval</em>{' '}
              <em className="text-text italic">s² = c²t² − x² − y² − z²</em> is the canonical
              example.
            </>
          }
        >
          Lorentz invariants
        </Term>{' '}
        live inside it —
        <InlineMath>
          {' '}
          F<sub>μν</sub>F<sup>μν</sup> ∝ B² - E²/c²
        </InlineMath>{' '}
        and the pseudo-scalar
        <InlineMath>
          {' '}
          ε<sub>μνρσ</sub>F<sup>μν</sup>F<sup>ρσ</sup> ∝ E·B
        </InlineMath>{' '}
        — which means every observer agrees on the sign of <InlineMath>B² - E²/c²</InlineMath> and
        on whether E and B are perpendicular. The split into "electric" and "magnetic" is
        frame-dependent; these two combinations are not.
      </p>

      <FieldTensorDemo />

      <h2 className="chapter-h2">
        What this <em>means</em>
      </h2>

      <p className="mb-prose-3">
        Classical electrodynamics is the consequence of two ingredients.{' '}
        <strong className="text-text font-medium">(1)</strong> Coulomb's law for charges at rest.{' '}
        <strong className="text-text font-medium">(2)</strong> Special relativity. You do not need
        to "discover" magnetism separately and tack it on; it falls out the moment you ask what an
        electrostatic interaction looks like between observers in relative motion. Maxwell's
        equations are the simplest set of field equations compatible with both ingredients, and they
        were already Lorentz-invariant when Maxwell wrote them down in 1865{' '}
        <Cite id="einstein-1905" in={SOURCES} />
        <Cite id="jackson-1999" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        Maxwell didn't know that. Nobody did. There was nothing else to compare his theory to:
        Newtonian mechanics was Galilean-invariant, optics was a mess, the ether hadn't yet been
        falsified. It took until 1905 for Einstein to walk into the Bern patent office, notice that
        Maxwell's equations were the only Galilean-broken theory of his day, and conclude that it
        was <em className="text-text italic">mechanics</em> that needed adjusting, not
        electromagnetism. The opening paragraph of "On the Electrodynamics of Moving Bodies" cites a
        single motivating problem: the asymmetry of how textbooks treated a magnet moving past a
        conductor versus a conductor moving past a magnet, even though only the relative motion is
        observable
        <Cite id="einstein-1905" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        Resolving that asymmetry is what produced special relativity. The whole architecture —{' '}
        <Term
          def={
            <>
              <strong className="text-text font-medium">time dilation</strong> — a clock moving at
              speed <em className="text-text italic">v</em> relative to an observer ticks slow by
              the factor γ: an interval <em className="text-text italic">Δτ</em> in the clock's rest
              frame appears as <em className="text-text italic">Δt = γ·Δτ</em> in the observer's
              frame.
            </>
          }
        >
          time dilation
        </Term>
        , length contraction, mass-energy equivalence, the cosmic speed limit — fell out of
        insisting that electromagnetism look the same in every inertial frame. The book you've been
        reading has, in this sense, been one story all along: charges, fields, and the geometry of
        spacetime they live in.
      </p>

      <TryIt
        tag="Try 11.2"
        question={
          <>
            A 1-metre rod flies past you lengthwise at <em className="text-text italic">v</em> =
            0.5c. What length do you measure?
          </>
        }
        hint="Length contraction: L = L₀/γ, in the direction of motion."
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">From Try 11.1, γ(0.5c) ≈ 1.1547.</p>
            <Formula>L = L₀/γ = 1 m / 1.1547 ≈ 0.866 m</Formula>
            <p className="mb-prose-1 last:mb-0">
              The contracted length is <strong className="text-text font-medium">≈ 0.866 m</strong>{' '}
              — about <em className="text-text italic">√(1 − 0.25)</em>. Transverse dimensions are
              unchanged
              <Cite id="einstein-1905" in={SOURCES} />
              <Cite id="purcell-morin-2013" in={SOURCES} />.
            </p>
          </>
        }
      />

      <TryIt
        tag="Try 11.3"
        question={
          <>
            GPS satellites orbit at <em className="text-text italic">v</em> ≈ 3.87 km/s with a
            gravitational potential ≈ 5.3×10⁻¹⁰ <em className="text-text italic">c²</em>
            shallower than at Earth's surface. Roughly, how much do their clocks gain or lose per
            day relative to the ground?
          </>
        }
        hint={<>SR slow-down: −½(v/c)²·day; GR speed-up: ΔΦ/c² · day.</>}
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">
              Convert each fraction to microseconds in a day of 86 400 s.
            </p>
            <Formula>SR: −½(v/c)² ≈ −8.3×10⁻¹¹ → −7.2 μs/day</Formula>
            <Formula>GR: +ΔΦ/c² ≈ +5.3×10⁻¹⁰ → +45.7 μs/day</Formula>
            <p className="mb-prose-1 last:mb-0">
              Net offset: <strong className="text-text font-medium">+38.5 μs/day</strong> (satellite
              clocks tick fast). Uncorrected, that drift would corrupt ranging by ~11.6 km per day;
              GPS engineers detune the satellite oscillators on the ground to compensate
              <Cite id="ashby-2003" in={SOURCES} />
              <Cite id="kaplan-hegarty-2017" in={SOURCES} />.
            </p>
          </>
        }
      />

      <TryIt
        tag="Try 11.4"
        question={
          <>
            At the LHC, 7 TeV protons (rest energy 938 MeV) have γ ≈ 7460. How close is their speed
            to c? Express <em className="text-text italic">v/c</em> as{' '}
            <em className="text-text italic">1 − ε</em> and estimate ε.
          </>
        }
        hint={<>For large γ, β = √(1 − 1/γ²) ≈ 1 − 1/(2γ²).</>}
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">Expand to leading order:</p>
            <Formula>1 − v/c ≈ 1/(2γ²) = 1/(2·7460²) ≈ 9 × 10⁻⁹</Formula>
            <p className="mb-prose-1 last:mb-0">
              So <strong className="text-text font-medium">v/c ≈ 1 − 9 × 10⁻⁹</strong>: a 7 TeV
              proton lags light by under three metres per second around the 26.659 km ring
              <Cite id="bruning-lhc-2004" in={SOURCES} />
              <Cite id="jackson-1999" in={SOURCES} />.
            </p>
          </>
        }
      />

      <TryIt
        tag="Try 11.5"
        question={
          <>
            A relativistic electron moves perpendicular to a uniform{' '}
            <em className="text-text italic">B</em> = 1 T at <em className="text-text italic">v</em>{' '}
            = 0.9c. What is its cyclotron radius? Use the relativistic momentum{' '}
            <em className="text-text italic">p = γmv</em>.
          </>
        }
        hint={
          <>
            r = p/(qB) with p = γmv; m<sub>e</sub> = 9.109×10⁻³¹ kg, e = 1.602×10⁻¹⁹ C.
          </>
        }
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">From Try 11.1, γ(0.9c) ≈ 2.294. Then</p>
            <Formula>
              p = γ m<sub>e</sub> v = 2.294 · 9.109×10⁻³¹ · 2.70×10⁸ ≈ 5.64×10⁻²² kg·m/s
            </Formula>
            <Formula>r = p / (eB) = 5.64×10⁻²² / (1.602×10⁻¹⁹ · 1) ≈ 3.52×10⁻³ m</Formula>
            <p className="mb-prose-1 last:mb-0">
              Cyclotron radius <strong className="text-text font-medium">≈ 3.5 mm</strong>. The
              non-relativistic estimate would have given ~1.5 mm; γ ≈ 2.3 inflates the radius by the
              same factor
              <Cite id="jackson-1999" in={SOURCES} />
              <Cite id="codata-2018" in={SOURCES} />.
            </p>
          </>
        }
      />

      <CaseStudies intro="Four places where the relativistic structure of electromagnetism stops being a thought experiment and starts being a budget item.">
        <CaseStudy
          tag="Case 9.1"
          title="GPS — the satellite clocks were tuned for relativity before launch"
          summary={
            <em className="text-text italic">
              Special relativity slows them. General relativity speeds them up more. The net offset
              is 38.6 microseconds a day, and the engineers compensated for it on the ground.
            </em>
          }
          specs={[
            { label: 'Satellite orbital velocity', value: '~3.87 km/s' },
            {
              label: 'Special-relativistic clock slowing',
              value: '~−7.2 μs/day (kinematic time dilation)',
            },
            {
              label: 'Gravitational clock speed-up',
              value: '~+45.7 μs/day (lower potential at Earth)',
            },
            { label: 'Net offset, satellite vs ground', value: '~+38.5 μs/day (satellite fast)' },
            {
              label: 'Pre-launch correction',
              value: 'Onboard frequency set to 10.22999999543 MHz vs nominal 10.23 MHz',
            },
            { label: 'Ranging error if uncorrected', value: '~11.6 km per day of drift' },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            The GPS satellites carry caesium and rubidium atomic clocks that must keep time to about
            a nanosecond against the ground network. Special relativity says the clocks should run{' '}
            <em className="text-text italic">slow</em> by
            <InlineMath> ½(v/c)² ≈ 8.3 × 10⁻¹¹</InlineMath> — roughly{' '}
            <strong className="text-text font-medium">−7.2 μs per day</strong> at orbital speeds of
            3.87 km/s. General relativity says they should run{' '}
            <em className="text-text italic">fast</em> by the gravitational-potential difference{' '}
            <InlineMath>ΔΦ/c²</InlineMath> — at 20,200 km altitude, about
            <strong className="text-text font-medium"> +45.7 μs per day</strong>. The net is{' '}
            <strong className="text-text font-medium">+38.5 μs/day</strong>
            <Cite id="ashby-2003" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            Thirty-eight microseconds a day, untreated, would corrupt ranging by about
            <InlineMath> c · Δt ≈ 11.6 km</InlineMath> per day. Within a week, GPS would be useless.
            The fix was baked into the hardware: the satellite oscillators are deliberately tuned to
            a frequency
            <strong className="text-text font-medium"> below</strong> the nominal 10.23 MHz before
            launch, so that when the spacecraft reaches orbital altitude and velocity, the combined
            SR slowing and GR speed-up bring them onto the ground value
            <Cite id="ashby-2003" in={SOURCES} />
            <Cite id="kaplan-hegarty-2017" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            That single number, 10.22999999543 MHz, is special and general relativity entering a
            consumer-electronics product specification. Every time your phone's location reads
            "accurate to within 5 m," Einstein has been quietly invoiced. The relativistic shadow of
            electricity that Chapter 9 opened with is the same one operating here — Maxwell's
            equations are the same in every inertial frame, and propagating signals must be timed in
            a way that respects that.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 9.2"
          title="The wire-and-test-charge, with actual numbers"
          summary={
            <em className="text-text italic">
              Restating §3's derivation with copper, a 1 A current, and γ−1 ≈ 10⁻²⁵. The wire really
              does look charged from a moving frame; it's just that the per-electron correction is
              ridiculously small.
            </em>
          }
          specs={[
            { label: 'Wire', value: '12-gauge copper, A ≈ 3.31 mm²' },
            { label: 'Current', value: 'I = 1 A (steady)' },
            { label: 'Drift velocity in lab frame', value: 'v_d ≈ 2.2 × 10⁻⁵ m/s' },
            { label: 'Lorentz factor', value: 'γ ≈ 1 + (v_d/c)²/2 ≈ 1 + 2.7×10⁻²⁵' },
            { label: 'Free-electron density n', value: '8.50 × 10²⁸ m⁻³ (copper)' },
            {
              label: "Net frame-induced λ' (test v = v_d)",
              value: '~−n e v_d² A / c² ≈ −5 × 10⁻²⁵ C/m per metre of wire',
            },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            The thought experiment in §1 is exact; let's run the arithmetic. In the lab frame,
            copper's electron density is{' '}
            <strong className="text-text font-medium">n = 8.50 × 10²⁸ m⁻³</strong>, and at{' '}
            <strong className="text-text font-medium">1 A</strong> through a 12-gauge cross-section
            the drift velocity is about{' '}
            <strong className="text-text font-medium">2.2 × 10⁻⁵ m/s</strong> — slower than a snail
            <Cite id="purcell-morin-2013" in={SOURCES} />. The Lorentz factor of that drift is
            <InlineMath> γ − 1 ≈ ½(v_d/c)² ≈ 2.7 × 10⁻²⁵</InlineMath>. Stupendously close to one.
          </p>
          <p className="mb-prose-2 last:mb-0">
            Boost to a frame co-moving with the electrons at <InlineMath>v_d</InlineMath>. The
            positive lattice now drifts backward at <InlineMath>v_d</InlineMath> in that frame; it
            Lorentz-contracts; its linear charge density rises by <InlineMath>γ</InlineMath>. The
            electrons, now at rest, see their own density drop by exactly the inverse factor. The
            two effects don't cancel — they leave a residual linear charge density of order{' '}
            <InlineMath>n e v_d² A / c²</InlineMath>, which works out to about
            <strong className="text-text font-medium"> 5 × 10⁻²⁵ C per metre</strong> of wire
            <Cite id="purcell-morin-2013" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            That number is ludicrous on a per-metre basis — an electron carries
            <InlineMath> e ≈ 1.6 × 10⁻¹⁹ C</InlineMath>, so we are talking about a deficit of
            <InlineMath> ~3 × 10⁻⁶</InlineMath> electrons per metre. And yet, multiplied by the
            <InlineMath> n A ≈ 2.8 × 10²³</InlineMath> conduction electrons per metre, the
            <em className="text-text italic"> charge imbalance per electron</em> is of order γ − 1,
            and the bookkeeping is exact: the Coulomb force in the boosted frame from this tiny
            residual λ' is precisely
            <InlineMath> F = q v_d (μ₀ I / 2π d)</InlineMath> — the magnetic Lorentz force you'd
            compute in the lab frame from Biot–Savart
            <Cite id="feynman-II-13" in={SOURCES} />. Magnetism: an enormous pile of γ − 1's, summed
            coherently.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 9.3"
          title="The LHC — protons close enough to c that γ matters by the gigaelectronvolt"
          summary={
            <em className="text-text italic">
              26.659 km circumference, 7 TeV per proton, γ ≈ 7460. Relativistic mass-energy isn't a
              correction — it's the budget.
            </em>
          }
          specs={[
            { label: 'Circumference', value: '26.659 km' },
            { label: 'Beam energy', value: '7 TeV per proton (design)' },
            { label: 'Proton rest energy', value: '0.938 GeV' },
            { label: 'Lorentz factor γ at 7 TeV', value: '~7460' },
            { label: 'β = v/c at 7 TeV', value: '1 − 9 × 10⁻⁹' },
            { label: 'Dipole bending field', value: '8.33 T (NbTi superconducting, 1.9 K)' },
            { label: 'Number of dipole magnets', value: '1232' },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            The Large Hadron Collider at CERN is what you get when you take γ seriously as an
            engineering parameter. The design beam energy is{' '}
            <strong className="text-text font-medium">7 TeV</strong> per proton, against a rest-mass
            energy of
            <strong className="text-text font-medium"> 938 MeV</strong>, giving{' '}
            <strong className="text-text font-medium">γ ≈ 7460</strong>
            <Cite id="bruning-lhc-2004" in={SOURCES} />. At that γ, the protons travel at{' '}
            <InlineMath>1 − 9 × 10⁻⁹</InlineMath> times c: their speed differs from light by under
            three metres per second, but their momentum is 7460 times the non-relativistic value,
            and the bending magnetic field must be sized accordingly.
          </p>
          <p className="mb-prose-2 last:mb-0">
            The relativistic momentum-radius relation is <InlineMath>p = q B ρ</InlineMath>, and at
            7 TeV / c the momentum that 1232 superconducting dipoles must steer into a 26.659 km
            ring forces
            <strong className="text-text font-medium"> B = 8.33 T</strong> — at the edge of what
            NbTi at 1.9 K will do
            <Cite id="bruning-lhc-2004" in={SOURCES} />. Drop γ to non-relativistic levels and the
            same momentum would imply a velocity above c, which doesn't exist. The four-momentum
            <InlineMath>
              {' '}
              p<sup>μ</sup> = (E/c, p)
            </InlineMath>
            , transforming as a{' '}
            <Term
              def={
                <>
                  <strong className="text-text font-medium">four-vector</strong> — an object with
                  four components (one temporal, three spatial) that transforms under Lorentz boosts
                  the way <em className="text-text italic">(ct, x, y, z)</em> does. Examples:
                  position{' '}
                  <em className="text-text italic">
                    x<sup>μ</sup>
                  </em>
                  , momentum{' '}
                  <em className="text-text italic">
                    p<sup>μ</sup> = (E/c, p)
                  </em>
                  , current{' '}
                  <em className="text-text italic">
                    J<sup>μ</sup> = (cρ, J)
                  </em>
                  , potential{' '}
                  <em className="text-text italic">
                    A<sup>μ</sup> = (V/c, A)
                  </em>
                  .
                </>
              }
            >
              four-vector
            </Term>{' '}
            under Lorentz boosts, is the bookkeeping that makes the budget work
            <Cite id="jackson-1999" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            Every magnet, every focusing quadrupole, every RF cavity is sized to handle relativistic
            protons. The beam itself, viewed from a co-moving frame, would see a 26 km ring
            Lorentz-contracted to under four metres in the direction of motion — and the dipole's
            quasi-static magnetic field would, in that frame, contain a substantial electric
            component, exactly the way Chapter 9 says. Particle physics spends most of its hardware
            budget paying for γ.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 9.4"
          title="Synchrotron radiation — γ⁴ in your photon budget"
          summary={
            <em className="text-text italic">
              Bend a relativistic electron and it radiates a pencil-beam of light, with intensity
              scaling as the fourth power of γ.
            </em>
          }
          specs={[
            { label: 'Radiation half-cone angle', value: '~1/γ (radians, in lab frame)' },
            {
              label: 'Power scaling for circular orbit',
              value: 'P ∝ γ⁴ / ρ² (Larmor in relativistic form)',
            },
            { label: 'Diamond Light Source electron energy', value: '3 GeV (γ ≈ 5870)' },
            { label: 'Diamond storage-ring circumference', value: '561.6 m' },
            {
              label: 'Critical photon energy (typical bend magnet)',
              value: '~keV range (hard X-ray)',
            },
            { label: 'First derivation', value: 'Schwinger, Phys. Rev. 75, 1912 (1949)' },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            A non-relativistic accelerating charge radiates the dipole pattern of Chapter 7 — broad,
            sin²θ around the acceleration axis. Push the charge to relativistic speed and that
            pattern, viewed in the lab frame, gets Lorentz-aberrated into a tight cone of half-angle{' '}
            <strong className="text-text font-medium">~1/γ</strong> in the forward direction. The
            total radiated power picks up an additional factor of{' '}
            <strong className="text-text font-medium">γ⁴</strong> for a circular orbit, which is why
            electron storage rings make excellent X-ray sources but proton ones mostly don't (γ at
            the same energy scales as 1/m, so protons radiate roughly
            <InlineMath> (m_e/m_p)⁴ ≈ 10⁻¹³</InlineMath> as efficiently)
            <Cite id="schwinger-1949" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            Julian Schwinger worked out the classical theory in 1949
            <Cite id="schwinger-1949" in={SOURCES} />. The angular distribution is the boosted
            dipole pattern of §5 of Chapter 7 — you can derive it by applying a Lorentz
            transformation to the rest-frame angular distribution, the same kind of transformation
            that turns "magnetic" force into "electric" force in §3 of this chapter. The radiation
            is a direct consequence of the field tensor mixing under boosts.
          </p>
          <p className="mb-prose-2 last:mb-0">
            Practically: every third-generation synchrotron light source — Diamond, the APS, ESRF,
            the ALS — is a ring of GeV-scale electrons whose orbital deflections in bend magnets and
            insertion devices produce a pencil-beam of hard X-rays a billion times brighter than a
            laboratory rotating-anode source. Without relativity those machines would not exist. The
            factor of γ⁴ in the radiated power is what makes the economics work; the factor of 1/γ
            in the cone angle is what makes the brightness work.
          </p>
        </CaseStudy>
      </CaseStudies>

      <FAQ intro="Sixteen questions that come up if you take the relativistic-shadow picture seriously.">
        <FAQItem q='If magnetism is "relativistic," why is its strength so similar to the electric force at everyday speeds?'>
          <p>
            Because the relevant velocity isn't the drift speed of one electron — it's the
            collective effect of
            <strong className="text-text font-medium"> all</strong> the moving charges in a wire.
            The per-electron correction is of order
            <InlineMath> v_d / c ≈ 10⁻¹³</InlineMath>, absurdly tiny. But there are
            <InlineMath> ~10²³</InlineMath> conduction electrons per cubic centimeter of copper, all
            drifting in the same direction. The "tiny correction" multiplied by Avogadro-scale
            numbers is what you measure as an everyday magnetic force{' '}
            <Cite id="purcell-morin-2013" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Drift velocity in copper is millimeters per second. How does such a tiny v produce a sizeable B?">
          <p>
            Same point, said slightly differently. A 20-amp current corresponds to about
            <InlineMath> 1.2 × 10²⁰</InlineMath> electrons per second crossing a wire's
            cross-section. Each one contributes a sliver of magnetic effect; collectively they add
            up to fields of milli-tesla scale at short distances. The wire doesn't have to move; the
            charges inside it do, and there are enormously many of them{' '}
            <Cite id="griffiths-2017" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Doesn't this require electrons to be moving at relativistic speeds?">
          <p>
            No. The argument works at any speed — the boost just has to differ between the test
            charge and the wire's drift frame. The size of the resulting magnetic-vs-electric force
            depends on the relative velocity, and at non-relativistic speeds the magnetic effect is
            small per particle. But "small per particle" multiplied by <InlineMath>10²³</InlineMath>{' '}
            particles per cm³ is what makes ordinary electromagnets work{' '}
            <Cite id="purcell-morin-2013" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="In a permanent magnet there's no obvious current. What's the underlying motion?">
          <p>
            Electron spin and orbital angular momentum. Each electron carries an intrinsic magnetic
            moment whose classical analog is a tiny current loop; in iron the moments of unpaired
            electrons align over large domains, and those aligned moments produce the bulk field.
            The "motion" is quantum-mechanical, not classical, but as a source of B it behaves the
            same — and from the relativistic point of view, a spinning magnetic moment is the source
            of a magnetic field for the same reason a current loop is
            <Cite id="jackson-1999" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Does this picture also work for moving magnets — say a magnet flying past a wire?">
          <p>
            Yes, and Einstein's 1905 paper opens with exactly this case as its motivating example. A
            magnet moving past a stationary loop induces an EMF that drives a current; a loop moving
            past a stationary magnet induces the same EMF. Pre-relativistic textbooks treated these
            as two different phenomena (one was "induction from a changing B," the other was "the
            motional Lorentz force"). Relativity unifies them: only the relative motion matters, and
            the field tensor handles both at once
            <Cite id="einstein-1905" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Are there frames in which a magnetic field is purely electric?">
          <p>
            Sometimes. If you start in a frame with pure B and no E, you can boost into a frame
            where there's both E and B. Whether you can boost to a frame with pure E depends on the
            Lorentz invariants of the original field: only when{' '}
            <InlineMath>B² - E²/c² &lt; 0</InlineMath> (electric-dominated) and
            <InlineMath> E · B = 0</InlineMath> can you find a frame where B vanishes.
            Magnetic-dominated fields (like the one around a current-carrying wire near it) stay
            magnetic in every frame
            <Cite id="jackson-1999" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q={'Can you "turn off" the magnetic part everywhere by choosing the right frame?'}>
          <p>
            No — except in special cases. For a single static source at a single point, yes, you can
            find a frame where the field is purely electric or purely magnetic depending on the
            invariants. For a more complex configuration (multiple moving sources, radiation
            fields), no single frame makes B vanish everywhere. The Lorentz invariants{' '}
            <InlineMath>B² - E²/c²</InlineMath> and <InlineMath>E · B</InlineMath>
            are frame-independent: they constrain what configurations are reachable by boosting
            <Cite id="griffiths-2017" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why don't physicists just teach EM with the field tensor from day one?">
          <p>
            Because the tensor formalism requires special relativity, and most students learn
            classical electrostatics before they've seen four-vectors. Purcell &amp; Morin's
            textbook is the famous exception — it teaches B as the relativistic consequence of
            moving charge from chapter 5, and it works beautifully, but only after students have
            absorbed the Lorentz transformation. The standard pedagogical ordering trades structural
            elegance for accessibility
            <Cite id="purcell-morin-2013" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Did Maxwell know any of this? Was relativity already implicit in his equations?">
          <p>
            Implicit, yes; explicit, no. Maxwell's equations turn out to be Lorentz-invariant — they
            keep their form under boosts — but Maxwell wrote them in 1865 in component form and
            never noticed that special property. Lorentz himself, working from Maxwell's equations,
            was the one who derived the transformation rules that bear his name (motivated by the
            Michelson–Morley null result and the puzzle of electron self-energy). Einstein in 1905
            turned the procedure inside out: assume relativity of inertial frames, and Maxwell's
            equations are forced
            <Cite id="einstein-1905" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why did Einstein cite the moving-magnet-vs-moving-conductor asymmetry as motivation?">
          <p>
            Because it was the most visible Galilean-symmetry violation of late-19th-century
            physics. Pre-1905 textbooks gave two different explanations for the EMF induced in a
            loop, depending on whether the loop moved or the magnet moved — even though the physics
            is the same in either case, and even though Maxwell's equations themselves didn't
            actually need the two cases distinguished. The asymmetry was an artifact of the
            surrounding Newtonian picture. Einstein opened his paper by pointing that out and
            concluded that the surrounding picture had to give way
            <Cite id="einstein-1905" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Does this make charge conservation a relativistic theorem?">
          <p>
            Charge conservation predates relativity, but the relativistic picture clarifies why it
            holds: charge is the time component of a conserved four-current{' '}
            <InlineMath>
              J<sup>μ</sup>
            </InlineMath>
            , and the statement{' '}
            <InlineMath>
              ∂<sub>μ</sub> J<sup>μ</sup> = 0
            </InlineMath>{' '}
            is Lorentz-covariant — it means the same thing in every frame. In quantum field theory,
            charge conservation is the Noether current associated with the U(1) gauge symmetry of
            QED. Either way, it's a deep structural fact, not an empirical accident{' '}
            <Cite id="jackson-1999" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q='Are E and B "frame-independent" in any sense?'>
          <p>
            Yes — but only in combinations. The two scalar quantities{' '}
            <InlineMath>B² - E²/c²</InlineMath> and
            <InlineMath> E · B</InlineMath> are Lorentz invariants. Every observer agrees on those
            two numbers, even though they disagree on the values of E and B separately. Those
            invariants classify field configurations into the four families of "electric-like,"
            "magnetic-like," "null" (radiation), and "mixed" — and that classification has
            frame-independent physical meaning
            <Cite id="griffiths-2017" in={SOURCES} />
            <Cite id="jackson-1999" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What's a magnetic field in QED? Is it still a field tensor?">
          <p>
            In quantum electrodynamics the classical field tensor{' '}
            <InlineMath>
              F<sup>μν</sup>
            </InlineMath>{' '}
            is replaced by an operator-valued field built out of photon creation and annihilation
            operators. The physical content is the same: E and B are still entries in one tensor,
            that tensor still transforms under Lorentz boosts the same way, and the dynamics is
            still gauge-invariant. The classical chapter-9 picture survives quantization more or
            less intact — the photon is the gauge boson that mediates interactions of{' '}
            <InlineMath>
              F<sup>μν</sup>
            </InlineMath>{' '}
            with charged matter
            <Cite id="jackson-1999" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="If gravity is geometry, is EM also geometry?">
          <p>
            Yes — in the precise sense of gauge theory. The electromagnetic four-potential
            <InlineMath>
              {' '}
              A<sup>μ</sup>
            </InlineMath>{' '}
            is a connection on a U(1) fiber bundle, and the field tensor
            <InlineMath>
              {' '}
              F<sup>μν</sup> = ∂<sup>μ</sup>A<sup>ν</sup> - ∂<sup>ν</sup>A<sup>μ</sup>
            </InlineMath>
            is the curvature of that connection. The mathematical analogy to general relativity,
            where the metric is the connection and the Riemann tensor is the curvature, is exact in
            form. Both are "geometry" in the modern sense; they differ in{' '}
            <em className="text-text italic">which</em> internal space is being curved
            <Cite id="jackson-1999" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why is c the only relevant speed in EM, but not in mechanics?">
          <p>
            Because c is built into Maxwell's equations in a way that any speed of a massive object
            isn't built into Newton's. The relation <InlineMath>μ₀ ε₀ = 1/c²</InlineMath> ties the
            speed of EM-wave propagation to the same constants that set the strength of the static
            electric and magnetic forces. Once you accept that EM is the same in every inertial
            frame (Einstein's postulate), c must be the same in every frame too — and that's the
            speed limit. Mechanics had no such tie because Newtonian mechanics didn't propagate
            disturbances at a finite speed in the first place
            <Cite id="einstein-1905" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="How does the photon's zero rest mass fit in?">
          <p>
            The photon is massless because the U(1) gauge symmetry of electromagnetism is unbroken —
            there is no "Higgs mechanism" for electromagnetism the way there is for the weak force.
            Equivalently, Maxwell's equations have an exact gauge symmetry, which forbids a photon
            mass term. If the photon had a tiny mass, Coulomb's law would acquire a Yukawa{' '}
            <InlineMath>
              e<sup>-mr/ℏc</sup>/r
            </InlineMath>{' '}
            screening, and the inverse-square law would fail at large distances. Experiments bound
            the photon mass to
            <InlineMath> &lt; 10⁻¹⁸</InlineMath> eV — consistent with zero
            <Cite id="williams-faller-hill-1971" in={SOURCES} />
            <Cite id="griffiths-2017" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Does general relativity change Maxwell's equations?">
          <p>
            Slightly. In curved spacetime, the partial derivatives in Maxwell's equations become
            covariant derivatives (with metric-dependent Christoffel symbols), and the field
            tensor's indices are raised and lowered with the curved-space metric instead of the flat
            Minkowski metric. The structural form
            <InlineMath> dF = 0</InlineMath>, <InlineMath>d★F = ★J</InlineMath> stays the same —
            Maxwell's equations are written naturally in differential-forms language, and that
            language is already covariant. The corrections show up only when spacetime curvature is
            non-negligible (near black holes, in cosmology) <Cite id="jackson-1999" in={SOURCES} />.
          </p>
        </FAQItem>
      </FAQ>
    </ChapterShell>
  );
}
