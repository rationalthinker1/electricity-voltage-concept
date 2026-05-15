/**
 * Chapter 13 — Network analysis methods
 *
 * Mesh-current, nodal, superposition, Norton, Y-Δ, and the maximum-power-
 * transfer theorem. Ch.12 gave Kirchhoff's two laws; this chapter gives the
 * procedural recipes that every working engineer reaches for when a circuit
 * is more complicated than a series-parallel chain.
 */
import { CaseStudies, CaseStudy } from '@/components/CaseStudy';
import { ChapterShell } from '@/components/ChapterShell';
import { FAQ, FAQItem } from '@/components/FAQ';
import { Cite } from '@/components/SourcesList';
import { Formula, InlineMath } from '@/components/Formula';
import { Pullout } from '@/components/Prose';
import { Term } from '@/components/Term';
import { TryIt } from '@/components/TryIt';
import { PredictThenObserve } from '@/components/PredictThenObserve';
import { MeshCurrentSolverDemo } from './demos/MeshCurrentSolver';
import { NodalSolverDemo } from './demos/NodalSolver';
import { WheatstoneBridgeDemo } from './demos/WheatstoneBridge';
import { YDeltaTransformDemo } from './demos/YDeltaTransform';
import { NortonTheveninDemo } from './demos/NortonThevenin';
import { MaxPowerTransferDemo } from './demos/MaxPowerTransfer';
import { getChapter } from './data/chapters';

export default function Ch13NetworkAnalysis() {
  const chapter = getChapter('network-analysis')!;
  const SOURCES = chapter.sources;

  return (
    <ChapterShell chapter={chapter}>
      <p className="chapter-intro">
        Picture a strain gauge bonded to the wing spar of a small aircraft. The gauge
        is one of four resistors in a Wheatstone bridge: deflect the wing by a
        millimetre, the gauge's resistance shifts by a few milliohms, and a tiny
        differential voltage appears across the bridge's middle arm. Try to predict
        that voltage by reducing the bridge to a series-parallel chain and you fail
        at the first step — there is no series-parallel reduction of a bridge. The
        network is irreducible, the four resistors form a non-trivial topology, and
        the only way to get a number out is to write{' '}
        <Term def={<><strong className="text-text font-medium">Kirchhoff's laws</strong> — KCL (charge conservation at every node) and KVL (energy conservation around every loop). Sufficient in principle for any DC linear network, but unwieldy without systematic methods.</>}>Kirchhoff's laws</Term>
        {' '}out as a small linear system and solve them<Cite id="hayt-kemmerly-durbin-2018" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        Ch.12 gave us the laws themselves: at every node the algebraic sum of
        currents is zero (KCL), and around every closed loop the algebraic sum of
        voltage drops is zero (KVL). Those two statements are sufficient in
        principle to solve any linear DC network of arbitrary size. They are
        not sufficient in practice. Write KVL on a ten-mesh power-supply schematic
        and you have committed yourself to manipulating a coupled system of fifteen
        equations on a notepad. What you want is a procedure that builds the smallest
        linear system possible and then hands it to a 3×3 determinant or — for
        anything bigger — a computer. This chapter is the catalogue of those
        procedures: mesh-current and nodal analysis, superposition, Norton's theorem,
        the Y-Δ transformation, and the maximum-power-transfer theorem. Every
        electrical engineer in working memory inherits this list from
        Maxwell<Cite id="maxwell-1873" in={SOURCES} />, Kennelly<Cite id="kennelly-1899" in={SOURCES} />,
        Norton<Cite id="norton-1926" in={SOURCES} />, and the army of textbook
        writers who taught the rest of us<Cite id="hayt-kemmerly-durbin-2018" in={SOURCES} /><Cite id="irwin-circuit-analysis-2015" in={SOURCES} />.
      </p>

      <h2 className="chapter-h2">Why <em>Kirchhoff</em> isn't enough on its own</h2>

      <p className="mb-prose-3">
        Consider a network of <InlineMath>B</InlineMath>{' '}
        <Term def={<><strong className="text-text font-medium">branch</strong> — a single two-terminal element (resistor, source, capacitor) joining two nodes in a network. A network with <em className="italic text-text">B</em> branches has <em className="italic text-text">B</em> unknown branch currents.</>}>branches</Term>
        {' '} and <InlineMath>N</InlineMath>{' '}
        <Term def={<><strong className="text-text font-medium">node</strong> — a junction in a network where two or more branches meet. The voltages at the nodes are an alternative set of unknowns to the branch currents.</>}>nodes</Term>.
        Every branch carries one unknown current, so there are <InlineMath>B</InlineMath>{' '}
        unknowns. KCL at the nodes gives <InlineMath>N − 1</InlineMath> independent
        equations (the <InlineMath>N</InlineMath>-th is the algebraic sum of the others
        and adds nothing). KVL around independent{' '}
        <Term def={<><strong className="text-text font-medium">loop</strong> — any closed path through the network. Independent loops correspond to the "holes" in a planar drawing of the schematic; on an N-node, B-branch network there are <em className="italic text-text">B − N + 1</em> of them.</>}>loops</Term>
        {' '}gives <InlineMath>B − N + 1</InlineMath> more. The total is exactly
        <InlineMath> B</InlineMath> — enough to pin down every branch
        current<Cite id="kirchhoff-1845" in={SOURCES} /><Cite id="hayt-kemmerly-durbin-2018" in={SOURCES} />.
      </p>
      <Formula>
        # equations = (N − 1)<sub>KCL</sub> + (B − N + 1)<sub>KVL</sub> = B
      </Formula>
      <p className="mb-prose-3">
        Why <em className="italic text-text">N − 1</em> KCL equations rather than <em className="italic text-text">N</em>? Add up the KCL
        equation at every single node and every branch current appears exactly
        twice — once entering, once leaving — so the grand total is identically
        zero. The <em className="italic text-text">N</em>-th equation is the negative sum of the other
        <InlineMath> N − 1</InlineMath>; it carries no new information. The same
        accounting trick explains <em className="italic text-text">B − N + 1</em> for KVL: write KVL on a big
        loop that encloses several smaller loops and you get the sum of the
        smaller ones' KVL equations, so only the irreducibly small "windowpane"
        loops count. The two independent counts <em className="italic text-text">N − 1</em> and
        <em className="italic text-text"> B − N + 1</em> add to exactly <em className="italic text-text">B</em> — one equation per branch
        current, no redundancy, no shortfall. The number falls out of topology
        alone<Cite id="kirchhoff-1845" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        On a six-resistor bridge — five nodes, eight branches — that's already a
        system of eight equations. Doable. On the modest analog front-end of a
        condenser microphone (dozens of components, maybe twenty nodes), the
        bare-Kirchhoff approach asks you to keep track of fifty-odd unknowns
        simultaneously. No one does this. What every engineer does instead is one of
        two manoeuvres: pick a small set of loop currents and let KVL cull the
        unknowns to the loop count, or pick a small set of node voltages and let KCL
        cull them to the node count<Cite id="irwin-circuit-analysis-2015" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        Each move yields a square linear system. With <em className="italic text-text">m</em> meshes you get an
        m × m system; with <em className="italic text-text">n</em> independent nodes (the reference node taken
        for granted) you get an n × n system. Whichever number is smaller wins, and
        modern circuit simulators internally do{' '}
        <Term def={<><strong className="text-text font-medium">modified nodal analysis (MNA)</strong> — the variant of nodal analysis SPICE uses internally: node voltages augmented with branch currents through voltage sources and inductors, giving a single sparse matrix that handles voltage sources, dependent sources, and controlled elements uniformly.</>}>modified nodal analysis</Term>{' '}
        because computers are very good at sparse matrices and they don't care which
        view of the network is conceptually cleaner<Cite id="hayt-kemmerly-durbin-2018" in={SOURCES} />.
      </p>

      <TryIt
        tag="Try 13.0"
        question={
          <>
            A planar network has <strong className="text-text font-medium">N = 7 nodes</strong> and
            <strong className="text-text font-medium"> B = 11 branches</strong>. How many independent KCL and KVL
            equations does Kirchhoff's framework give you, and how many mesh
            currents vs node voltages would each analysis method use?
          </>
        }
        hint={<>Independent KCL count is N − 1; independent KVL count (and mesh count) is B − N + 1. Non-reference node count is also N − 1.</>}
        answer={
          <>
            <Formula>KCL equations: N − 1 = 6</Formula>
            <Formula>KVL / mesh count: B − N + 1 = 11 − 7 + 1 = 5</Formula>
            <p className="mb-prose-1 last:mb-0">
              Total = 11, exactly the branch-current count. Mesh analysis would
              build a <strong className="text-text font-medium">5 × 5</strong> system; nodal analysis would build
              a <strong className="text-text font-medium">6 × 6</strong> system. Mesh wins by one unknown — but
              not by much, and either method delivers the same answer. The
              topology counts are settled before you write a single
              equation<Cite id="hayt-kemmerly-durbin-2018" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2 className="chapter-h2"><em>Mesh-current</em> analysis (Maxwell, 1873)</h2>

      <p className="mb-prose-3">
        Maxwell, in his 1873 <em className="italic text-text">Treatise on Electricity and Magnetism</em>, introduced
        the trick that bears his name: instead of giving every branch its own
        unknown current, give every closed loop in the schematic a single
        circulating "mesh" current and let the actual branch currents fall out as
        algebraic sums<Cite id="maxwell-1873" in={SOURCES} />. A branch shared between
        two loops carries the difference of their mesh currents; a branch on the
        outside of just one loop carries that loop's mesh current alone.
      </p>
      <p className="mb-prose-3">
        The recipe: orient every{' '}
        <Term def={<><strong className="text-text font-medium">mesh current</strong> — a fictitious clockwise current circulating around a single independent loop in a planar circuit diagram. Maxwell's 1873 device for replacing <em className="italic text-text">B</em> branch-current unknowns with the much smaller number of loop-current unknowns.</>}>mesh current</Term>
        {' '}clockwise. For each mesh, write KVL: the algebraic sum of voltage drops
        around the loop equals zero, with each resistor's drop computed from the net
        current through it (a shared resistor sees the mesh's own current minus
        whatever the neighbour mesh is pushing the other way). The result is a
        symmetric linear system of dimension <em className="italic text-text">m</em> = B − N + 1, the number of
        independent loops.
      </p>
      <p className="mb-prose-3">
        Take the two-mesh network below: a battery V₁ on the left driving R₁
        and the shared middle branch R₂, then R₃ and a second source V₂ on the
        right. With clockwise mesh currents I₁ (left loop) and I₂ (right loop), KVL
        on each loop gives:
      </p>
      <Formula>
        (R₁ + R₂) I₁ − R₂ I₂ = V₁
      </Formula>
      <Formula>
        −R₂ I₁ + (R₂ + R₃) I₂ = −V₂
      </Formula>
      <p className="mb-prose-3">
        Why do mesh currents work at all? Because a current that circulates
        around a closed loop enters every node along its path and leaves it
        again — so KCL at each node is satisfied automatically, for free, with
        no further algebra. The only constraint left to impose is KVL around
        each loop. That is the conceptual trade: by parametrising with
        loop-circulating quantities instead of branch currents, we have already
        cashed in the <em className="italic text-text">N − 1</em> KCL equations, leaving only the
        <em className="italic text-text"> B − N + 1</em> KVL equations to write. Look at the structure of
        the system above. The diagonal coefficient on each row is the total
        resistance the corresponding mesh current sees as it circulates; the
        off-diagonal coefficient is the <em className="italic text-text">shared</em> resistance between two
        meshes (with a minus sign because the two mesh currents push opposite
        ways through it). The right-hand side is the EMF the loop encloses.
        Every entry of the matrix has a direct physical reading.
      </p>
      <p className="mb-prose-3">
        Two equations, two unknowns — solve by Cramer's rule, substitution, or any
        2×2 inverse you like. The actual branch currents follow immediately:
        I<sub>R₁</sub> = I₁, I<sub>R₃</sub> = I₂, I<sub>R₂</sub> = I₁ − I₂. For a
        six-branch network, the bookkeeping went from six unknowns to two<Cite id="hayt-kemmerly-durbin-2018" in={SOURCES} />.
      </p>

      <MeshCurrentSolverDemo />

      <p className="mb-prose-3">
        Slide the source voltages and resistor values and the two mesh currents
        track instantly. The system has a beautifully symmetric structure: the
        diagonal entries are the total resistance around each mesh, the off-diagonal
        entries are minus the resistance shared between mesh <em className="italic text-text">i</em> and mesh{' '}
        <em className="italic text-text">j</em>, and the right-hand side is the algebraic sum of source EMFs in
        the direction of the mesh. That structure generalises: on an <em className="italic text-text">m</em>-mesh
        network, the coefficient matrix is symmetric and positive-definite (for
        passive networks), exactly the kind of matrix LU-decomposition and Gaussian
        elimination devour at machine speed.
      </p>
      <Pullout>
        A mesh current pays KCL its dues automatically, just by being a loop.
        That is the whole trick.
      </Pullout>

      <TryIt
        tag="Try 13.1"
        question={
          <>
            For the two-mesh network with V₁ = 12 V, V₂ = 6 V, R₁ = 4 Ω, R₂ = 8 Ω,
            R₃ = 6 Ω, solve for the mesh currents I₁ and I₂ and for the current
            through the shared resistor R₂.
          </>
        }
        hint={<>The system is (R₁+R₂) I₁ − R₂ I₂ = V₁ and −R₂ I₁ + (R₂+R₃) I₂ = −V₂.</>}
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">Substitute the numbers:</p>
            <Formula>12 I₁ − 8 I₂ = 12</Formula>
            <Formula>−8 I₁ + 14 I₂ = −6</Formula>
            <p className="mb-prose-1 last:mb-0">Determinant = 12·14 − (−8)(−8) = 168 − 64 = 104. By Cramer's rule:</p>
            <Formula>I₁ = (12·14 − (−8)(−6))/104 = (168 − 48)/104 = 120/104 ≈ <strong className="text-text font-medium">1.154 A</strong></Formula>
            <Formula>I₂ = (12·(−6) − (−8)·12)/104 = (−72 + 96)/104 = 24/104 ≈ <strong className="text-text font-medium">0.231 A</strong></Formula>
            <Formula>I<sub>R₂</sub> = I₁ − I₂ ≈ <strong className="text-text font-medium">0.923 A</strong></Formula>
            <p className="mb-prose-1 last:mb-0">
              Two mesh currents replace four branch unknowns; the answer falls out of
              a 2×2 determinant<Cite id="hayt-kemmerly-durbin-2018" in={SOURCES} /><Cite id="irwin-circuit-analysis-2015" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2 className="chapter-h2"><em>Nodal</em> analysis — the dual view</h2>

      <p className="mb-prose-3">
        Nodal analysis flips the conceptual axis. Instead of loop currents, pick a
        single node as reference (call it ground, declare its voltage zero), and
        write KCL at every other node. The unknowns are now the{' '}
        <Term def={<><strong className="text-text font-medium">nodal voltage</strong> — the potential at a non-reference node, measured with respect to a chosen ground. Nodal analysis writes KCL at each non-reference node, giving (N−1) equations in (N−1) unknowns.</>}>nodal voltages</Term>
        {' '}<InlineMath>V_A, V_B, …</InlineMath>; the branch currents are computed
        from those voltages by Ohm's law as you need them<Cite id="irwin-circuit-analysis-2015" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        For a single unknown node A connected to fixed voltages V₁ (through R₁), V₂
        (through R₃), and ground (through R₂), KCL says the current flowing in from
        every direction sums to zero:
      </p>
      <Formula>
        (V₁ − V_A)/R₁ + (V₂ − V_A)/R₃ − V_A/R₂ = 0
      </Formula>
      <Formula>
        V_A · (1/R₁ + 1/R₂ + 1/R₃) = V₁/R₁ + V₂/R₃
      </Formula>
      <p className="mb-prose-3">
        The same duality argument that made mesh currents satisfy KCL for free
        makes nodal voltages satisfy KVL for free. Walk around any closed loop
        adding up potential differences; you return to the node you started at,
        and the algebraic sum of the differences along the way is identically
        zero. (Sum the side-lengths of a triangle as signed differences of
        vertex altitudes and you get zero — that is just the definition of a
        potential.) So nodal analysis parametrises with quantities that have
        already cashed in the <em className="italic text-text">B − N + 1</em> KVL equations, and only the
        <em className="italic text-text"> N − 1</em> KCL equations at the non-reference nodes are left to
        write. Read the second form of the equation above as a single principle:
        the sum of all conductances connected to node A, multiplied by V<sub>A</sub>,
        equals the sum of injected currents from each neighbouring fixed voltage.
        Total-conductance times node-voltage on the left, source currents on
        the right. The matrix is symmetric for the same topological reason the
        mesh matrix is symmetric.
      </p>
      <p className="mb-prose-3">
        One equation, one unknown. Compare that to the two-equation mesh system on
        the same network: the nodal view is genuinely cheaper here. The general rule
        is that mesh analysis is preferable when the network has many independent
        loops and few nodes (a ladder of series elements), nodal when it has many
        parallel branches and few series elements (a transistor's biasing network).
        For the awkward intermediate cases, both methods work and a working engineer
        picks whichever leaves the smaller system<Cite id="hayt-kemmerly-durbin-2018" in={SOURCES} />.
      </p>

      <NodalSolverDemo />

      <p className="mb-prose-3">
        Solve the same network nodally and the branch currents drop out as
        differences of node voltages divided by resistors. They agree, to numerical
        precision, with the mesh solution — they have to, because both methods are
        algebraic rearrangements of the same KCL+KVL system; there is exactly one
        steady-state solution and any consistent method must reach it.
      </p>
      <Pullout>
        Mesh currents pre-pay KCL; node voltages pre-pay KVL. Pick whichever
        debt you'd rather not carry by hand.
      </Pullout>

      <TryIt
        tag="Try 13.2"
        question={
          <>
            Use nodal analysis on a single-node network where V₁ = 10 V drives R₁ = 5 Ω
            into node A, V₂ = 4 V drives R₃ = 2 Ω into the same node A, and R₂ = 10 Ω
            connects A to ground. Find V<sub>A</sub> and the current through R₂.
          </>
        }
        hint={<>V<sub>A</sub> · (1/R₁ + 1/R₂ + 1/R₃) = V₁/R₁ + V₂/R₃.</>}
        answer={
          <>
            <Formula>1/R₁ + 1/R₂ + 1/R₃ = 0.2 + 0.1 + 0.5 = 0.8 S</Formula>
            <Formula>V₁/R₁ + V₂/R₃ = 2.0 + 2.0 = 4.0 A</Formula>
            <Formula>V_A = 4.0 / 0.8 = <strong className="text-text font-medium">5.0 V</strong></Formula>
            <Formula>I<sub>R₂</sub> = V_A / R₂ = 0.5 A</Formula>
            <p className="mb-prose-1 last:mb-0">
              One equation, one unknown — the nodal view is at its most compact when
              the network has only a handful of independent nodes<Cite id="irwin-circuit-analysis-2015" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2 className="chapter-h2"><em>Superposition</em> — one source at a time</h2>

      <p className="mb-prose-3">
        In any linear network driven by several independent sources,{' '}
        <Term def={<><strong className="text-text font-medium">superposition</strong> — in a linear network, the response (voltage or current) to several independent sources equals the algebraic sum of the responses to each source acting alone, with the other independent sources zeroed (voltage sources shorted, current sources opened).</>}>superposition</Term>{' '}
        says the response to all of them is the algebraic sum of the responses to
        each one acting alone. To "zero" a source you do the linearly natural thing:
        replace a voltage source with a short circuit (its zero voltage), replace a
        current source with an open circuit (its zero current). Walk through the
        network N times, once per source; add the partial answers; you have the
        whole answer<Cite id="irwin-circuit-analysis-2015" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        Superposition is the engine that proves Thévenin and Norton equivalence
        exist. Any linear two-terminal network with multiple sources can be reduced
        — by superposition, one source at a time — to a single Thévenin source plus
        a single resistance; the contributions from the individual sources add at
        the output terminal exactly because superposition lets them<Cite id="hayt-kemmerly-durbin-2018" in={SOURCES} />.
        The price of admission is that every element in the network must obey a
        linear constitutive equation: <em className="italic text-text">V = I R</em>, <em className="italic text-text">V = L dI/dt</em>,
        <em className="italic text-text"> I = C dV/dt</em>. A diode breaks superposition (its <em className="italic text-text">I-V</em> is
        exponential), and so does a transistor outside its small-signal limit, and
        so does an iron-core transformer driven into saturation. Inside the linear
        zone, superposition is a precise tool. Outside it, the whole catalogue of
        this chapter collapses and the only path forward is numerical
        simulation<Cite id="hayt-kemmerly-durbin-2018" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        The Superposition demo in Ch.12 (a three-resistor bridge with two voltage
        sources) lets you toggle each source on and off and confirm that the live
        branch currents are exactly the sum of the per-source contributions. Open
        Ch.12's "Superposition" figure to play with it, then come back here for
        what superposition makes possible.
      </p>
      <p className="mb-prose-3">
        The underlying algebra is the linearity property. If a circuit's
        response <em className="italic text-text">y</em> depends on two source amplitudes
        <InlineMath> x₁</InlineMath> and <InlineMath>x₂</InlineMath> through
        <InlineMath> y = a x₁ + b x₂</InlineMath> for some network-dependent
        constants <em className="italic text-text">a</em>, <em className="italic text-text">b</em>, then setting
        <InlineMath> x₂ = 0</InlineMath> gives <em className="italic text-text">y</em><sub>1</sub>
        = <em className="italic text-text">a x₁</em>, setting <InlineMath>x₁ = 0</InlineMath> gives
        <em className="italic text-text"> y</em><sub>2</sub> = <em className="italic text-text">b x₂</em>, and the two responses add to the
        original. The whole trick is that no nonlinear term — no
        <em className="italic text-text"> x₁ x₂</em>, no <InlineMath>x₁²</InlineMath>, no <em className="italic text-text">e</em><sup><em className="italic text-text">x₁</em></sup>
        — appears anywhere in the constitutive equations. The moment one does
        (a diode's exponential <em className="italic text-text">I-V</em>, a transistor's saturation
        nonlinearity, a transformer's hysteresis loop), the cross-terms couple
        the sources and superposition fails: the network's response to two
        signals together is not the sum of its responses to each<Cite id="irwin-circuit-analysis-2015" in={SOURCES} />.
      </p>

      <TryIt
        tag="Try 13.3"
        question={
          <>
            A linear network responds to a 10 V source alone with V<sub>out</sub> = 3 V,
            and to a 4 mA current source alone with V<sub>out</sub> = 1.2 V (other
            source zeroed in each case). With both sources active simultaneously,
            what is V<sub>out</sub>? Now triple the voltage source to 30 V (keep the
            current source at 4 mA): what does V<sub>out</sub> become?
          </>
        }
        hint={<>Superposition: the responses add. Linearity: scale the source, scale its contribution by the same factor.</>}
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">Direct superposition:</p>
            <Formula>V<sub>out</sub> = 3 + 1.2 = <strong className="text-text font-medium">4.2 V</strong></Formula>
            <p className="mb-prose-1 last:mb-0">Triple the voltage source, triple its contribution; the current-source contribution is unchanged:</p>
            <Formula>V<sub>out</sub>′ = 3·3 + 1.2 = 9 + 1.2 = <strong className="text-text font-medium">10.2 V</strong></Formula>
            <p className="mb-prose-1 last:mb-0">
              The linearity buys both the additivity (sources combine) and the
              homogeneity (scale a source, scale its response)<Cite id="irwin-circuit-analysis-2015" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2 className="chapter-h2"><em>Norton's</em> theorem — the current-source twin</h2>

      <p className="mb-prose-3">
        Thévenin's theorem (Ch.12) compresses any linear two-terminal network to a
        voltage source V<sub>Th</sub> in series with a resistance R<sub>Th</sub>.
        Edward Lawry Norton, working at Bell Labs, published the dual statement in
        1926: any linear two-terminal network is also equivalent to a current
        source I<sub>N</sub> in parallel with the same resistance R<sub>N</sub> =
        R<sub>Th</sub>, where I<sub>N</sub> is the short-circuit current that flows
        through a wire shorting the terminals<Cite id="norton-1926" in={SOURCES} /><Cite id="hayt-kemmerly-durbin-2018" in={SOURCES} />.
      </p>
      <Formula>
        I<sub>N</sub> = V<sub>Th</sub> / R<sub>Th</sub>,   R<sub>N</sub> = R<sub>Th</sub>
      </Formula>
      <p className="mb-prose-3">
        The picture behind the algebra: plot the terminal voltage <em className="italic text-text">V</em>
        against the terminal current <em className="italic text-text">I</em> drawn from a linear two-terminal
        network. Because every internal element is linear, the
        <em className="italic text-text"> V – I</em> relation at the terminals must be a straight line. Two
        measurements pin it down. Leave the terminals open and the network
        delivers no current: that point is
        <em className="italic text-text"> (I = 0, V = V<sub>oc</sub>)</em>. Short the terminals together and
        the network delivers no voltage: that point is
        <em className="italic text-text"> (I = I<sub>sc</sub>, V = 0)</em>. The line through those two points
        is <em className="italic text-text">V = V<sub>oc</sub> − I · R<sub>Th</sub></em> with
        <em className="italic text-text"> R<sub>Th</sub> = V<sub>oc</sub>/I<sub>sc</sub></em>. That single
        line is the entire external behaviour of the network. Thévenin reads it
        as "<em className="italic text-text">V<sub>oc</sub></em> behind a series resistor
        <em className="italic text-text"> R<sub>Th</sub></em>"; Norton reads the same line as
        "<em className="italic text-text">I<sub>sc</sub></em> through a parallel resistor
        <em className="italic text-text"> R<sub>N</sub> = R<sub>Th</sub></em>". They are two parametrisations
        of one straight line.
      </p>
      <p className="mb-prose-3">
        Why must <em className="italic text-text">I<sub>N</sub> = V<sub>Th</sub>/R<sub>Th</sub></em>?
        Substitute <em className="italic text-text">V = 0</em> into Thévenin's relation: the short-circuit
        current is <em className="italic text-text">V<sub>Th</sub>/R<sub>Th</sub></em> — and that, by
        definition, is what Norton calls <em className="italic text-text">I<sub>N</sub></em>. The conversion
        is not a coincidence; it is the requirement that the two source forms
        deliver the same load current and load voltage for <em className="italic text-text">every</em> load
        you might hang on the terminals.
      </p>
      <p className="mb-prose-3">
        The two forms are exactly equivalent: an ideal voltage source V in series
        with R is indistinguishable, from outside the terminals, from an ideal
        current source V/R in parallel with R. This is{' '}
        <Term def={<><strong className="text-text font-medium">source transformation</strong> — the algebraic interchange of a Thévenin form (V in series with R) and a Norton form (V/R in parallel with R). The two are indistinguishable from outside the two-terminal pair.</>}>source transformation</Term>,
        and you use it casually in working analysis: a chain of voltage sources and
        series resistors becomes much easier to combine if you flip part of it into
        Norton form, collapse the parallel resistances, and flip back when you're
        done<Cite id="irwin-circuit-analysis-2015" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        The proof again rests on superposition. The Norton resistance R<sub>N</sub>
        is computed exactly the way R<sub>Th</sub> is: zero the independent sources
        inside the network and compute the equivalent resistance looking back into
        the terminals. The same number falls out — and it has to, because both
        theorems describe the same external behaviour at the same two terminals.
        The two forms differ only in which variable they parametrise the source by
        (voltage vs current); the internal resistance is a property of the network's
        topology, not of either source convention<Cite id="hayt-kemmerly-durbin-2018" in={SOURCES} />.
      </p>

      <NortonTheveninDemo />

      <p className="mb-prose-3">
        The demo's three panels — original, Thévenin, Norton — drive an identical
        load and produce identical V<sub>L</sub> and I<sub>L</sub>. This is the
        practical payoff: once you have either form of an equivalent, plugging in a
        new load is a one-line calculation, and you never have to re-solve the
        network's internal node voltages again.
      </p>

      <TryIt
        tag="Try 13.4"
        question={
          <>
            A network has open-circuit voltage V<sub>oc</sub> = 8 V at its terminals
            and short-circuit current I<sub>sc</sub> = 2 A. Find its Thévenin and
            Norton equivalents, and predict the load current into R<sub>L</sub> = 6 Ω.
          </>
        }
        hint={<>R<sub>Th</sub> = R<sub>N</sub> = V<sub>oc</sub>/I<sub>sc</sub>. Then I<sub>L</sub> = V<sub>oc</sub>/(R<sub>Th</sub>+R<sub>L</sub>).</>}
        answer={
          <>
            <Formula>R<sub>Th</sub> = V<sub>oc</sub>/I<sub>sc</sub> = 8 / 2 = 4 Ω</Formula>
            <p className="mb-prose-1 last:mb-0">Thévenin: V<sub>Th</sub> = 8 V in series with 4 Ω. Norton: I<sub>N</sub> = 2 A in parallel with 4 Ω.</p>
            <Formula>I<sub>L</sub> = 8 / (4 + 6) = <strong className="text-text font-medium">0.80 A</strong></Formula>
            <Formula>V<sub>L</sub> = 0.80 · 6 = <strong className="text-text font-medium">4.8 V</strong></Formula>
            <p className="mb-prose-1 last:mb-0">
              Two measurements at the terminals — V<sub>oc</sub> and I<sub>sc</sub> —
              pin down the entire external behaviour of the network<Cite id="norton-1926" in={SOURCES} /><Cite id="hayt-kemmerly-durbin-2018" in={SOURCES} />.
            </p>
          </>
        }
      />

      <TryIt
        tag="Try 13.4b"
        question={
          <>
            A 24 V battery in series with 8 Ω feeds the same node as a 12 V
            battery in series with 4 Ω. Convert both branches to their Norton
            forms, combine in parallel, and then convert back to a single
            Thévenin equivalent at the shared node.
          </>
        }
        hint={<>Each Thévenin branch (V in series with R) becomes a Norton branch (V/R in parallel with R). Parallel current sources add; parallel resistors combine by reciprocals.</>}
        answer={
          <>
            <Formula>I<sub>N1</sub> = 24/8 = 3 A in parallel with 8 Ω</Formula>
            <Formula>I<sub>N2</sub> = 12/4 = 3 A in parallel with 4 Ω</Formula>
            <Formula>I<sub>N,total</sub> = 3 + 3 = 6 A</Formula>
            <Formula>R<sub>parallel</sub> = (8·4)/(8+4) = 32/12 ≈ 2.67 Ω</Formula>
            <Formula>V<sub>Th,eq</sub> = I<sub>N,total</sub> · R<sub>parallel</sub> ≈ <strong className="text-text font-medium">16 V</strong></Formula>
            <p className="mb-prose-1 last:mb-0">
              A two-branch sub-network collapses to a single 16 V source behind
              2.67 Ω, ready to plug into the rest of the analysis. Source
              transformation is the working engineer's most-used algebraic
              move<Cite id="hayt-kemmerly-durbin-2018" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2 className="chapter-h2"><em>Y-Δ</em> transformations (Kennelly, 1899)</h2>

      <p className="mb-prose-3">
        Some networks resist every attempt at series-parallel reduction. The
        Wheatstone bridge is the standard pathological example: four resistors
        wired in a diamond with a galvanometer across the middle arm. There is no
        way to pull series-parallel rules through it; every branch sits on at least
        one loop that connects through every other branch.
      </p>

      <WheatstoneBridgeDemo />

      <p className="mb-prose-3">
        Push R<sub>x</sub> through the balance point and the galvanometer needle
        crosses zero exactly when R<sub>x</sub>·R₁ = R₂·R₃ — the canonical bridge
        condition. To predict the deflection on either side of balance, though, you
        need either the full mesh-or-nodal machinery or the trick Arthur Kennelly
        published in <em className="italic text-text">Electrical World</em> in 1899: the{' '}
        <Term def={<><strong className="text-text font-medium">Y-Δ transform</strong> — the equivalence between a three-terminal Y (or "star") network of three resistors and a three-terminal Δ (or "delta") network. Resistances follow Kennelly's reciprocal mapping; Wheatstone bridges and similar non-planar networks become reducible.</>}>Y-Δ (star-delta) transformation</Term>
        <Cite id="kennelly-1899" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        Take three resistors meeting at a single interior node — a{' '}
        <Term def={<><strong className="text-text font-medium">star (or Y / wye)</strong> network — three resistors that share one common interior node, with three external terminals A, B, C reached through the three legs.</>}>star (or Y)</Term>
        {' '}network with terminals A, B, C and resistors R<sub>a</sub>, R<sub>b</sub>,
        R<sub>c</sub> running from each terminal to the centre. Take three resistors
        wired directly between the terminals — a{' '}
        <Term def={<><strong className="text-text font-medium">delta (Δ)</strong> network — three resistors connected directly between three external terminals, forming a triangle, with no interior node.</>}>delta (Δ)</Term>
        {' '}network with R<sub>AB</sub>, R<sub>BC</sub>, R<sub>CA</sub>. Kennelly
        showed these two networks present identical impedance to anything connected
        at A, B, C — provided the resistor values are related by:
      </p>
      <Formula>
        R<sub>AB</sub> = (R<sub>a</sub>R<sub>b</sub> + R<sub>b</sub>R<sub>c</sub> + R<sub>c</sub>R<sub>a</sub>) / R<sub>c</sub>
      </Formula>
      <Formula>
        R<sub>BC</sub> = (R<sub>a</sub>R<sub>b</sub> + R<sub>b</sub>R<sub>c</sub> + R<sub>c</sub>R<sub>a</sub>) / R<sub>a</sub>
      </Formula>
      <Formula>
        R<sub>CA</sub> = (R<sub>a</sub>R<sub>b</sub> + R<sub>b</sub>R<sub>c</sub> + R<sub>c</sub>R<sub>a</sub>) / R<sub>b</sub>
      </Formula>
      <p className="mb-prose-3">
        Where does this peculiar product-over-sum structure come from? The
        derivation is a sober exercise in three equations and three unknowns.
        Probe the network at terminals A and B with the third terminal C left
        floating. The Y presents
        <em className="italic text-text"> R<sub>a</sub> + R<sub>b</sub></em> (a series chain through the
        interior node); the Δ presents
        <em className="italic text-text"> R<sub>AB</sub></em> in parallel with
        <em className="italic text-text"> R<sub>CA</sub> + R<sub>BC</sub></em>. For the two networks to be
        externally indistinguishable, those two impedances must be equal.
        Write the same equality for terminals B-C and for C-A — three equations
        — and solve the resulting 3×3 algebraic system for the Δ resistances in
        terms of the Y resistances. The symmetric quantity
        <em className="italic text-text"> R<sub>a</sub>R<sub>b</sub> + R<sub>b</sub>R<sub>c</sub> + R<sub>c</sub>R<sub>a</sub></em>
        in every numerator is the determinant-like combination that emerges
        from solving the system, and the single Y-leg in each denominator picks
        out which terminal-pair you're transforming for. The asymmetry between
        numerator and denominator is the algebraic price of moving from a
        single-interior-node topology to a no-interior-node one.
      </p>
      <p className="mb-prose-3">
        Or the other way around, Δ → Y, with the dual mapping
        R<sub>a</sub> = R<sub>AB</sub>R<sub>CA</sub> / (R<sub>AB</sub> + R<sub>BC</sub> + R<sub>CA</sub>),
        and cyclic permutations<Cite id="hayt-kemmerly-durbin-2018" in={SOURCES} />. The
        algebra is unilluminating; the demo below confirms the equivalence
        numerically.
      </p>

      <YDeltaTransformDemo />

      <p className="mb-prose-3">
        Slide the Y resistors and the Δ resistors track in lockstep; the test
        impedance between any two terminals (with the third left floating) comes
        out identical to numerical precision. Use the transform to convert one half
        of a Wheatstone bridge from a Δ of three resistors into a Y of three
        equivalent resistors — and suddenly the bridge becomes a series-parallel
        network you can reduce by inspection.
      </p>
      <Pullout>
        Three resistors in a triangle, three in a star — same external behaviour.
        Kennelly showed you can swap them freely.
      </Pullout>
      <p className="mb-prose-3">
        Y-Δ extends to AC: replace the real resistances with complex impedances
        Z<sub>a</sub>, Z<sub>b</sub>, Z<sub>c</sub> and the same formulas hold term
        by term<Cite id="irwin-circuit-analysis-2015" in={SOURCES} />. That makes the
        transform useful well beyond DC bridges — power-system fault analysis,
        three-phase load conversion (a Δ-connected motor and a Y-connected one with
        equivalent line behaviour), and impedance-matching networks all lean on the
        same mapping<Cite id="hayt-kemmerly-durbin-2018" in={SOURCES} />.
      </p>

      <TryIt
        tag="Try 13.5"
        question={
          <>
            A Δ network has R<sub>AB</sub> = 60 Ω, R<sub>BC</sub> = 30 Ω, R<sub>CA</sub> = 20 Ω.
            Find its equivalent Y resistances R<sub>a</sub>, R<sub>b</sub>, R<sub>c</sub>.
          </>
        }
        hint={<>R<sub>a</sub> = R<sub>AB</sub>·R<sub>CA</sub> / (R<sub>AB</sub>+R<sub>BC</sub>+R<sub>CA</sub>), and cyclic permutations.</>}
        answer={
          <>
            <Formula>R<sub>AB</sub>+R<sub>BC</sub>+R<sub>CA</sub> = 60 + 30 + 20 = 110 Ω</Formula>
            <Formula>R<sub>a</sub> = (60·20)/110 = 1200/110 ≈ <strong className="text-text font-medium">10.91 Ω</strong></Formula>
            <Formula>R<sub>b</sub> = (60·30)/110 = 1800/110 ≈ <strong className="text-text font-medium">16.36 Ω</strong></Formula>
            <Formula>R<sub>c</sub> = (30·20)/110 = 600/110 ≈ <strong className="text-text font-medium">5.45 Ω</strong></Formula>
            <p className="mb-prose-1 last:mb-0">
              The Y network presents identical impedance at A, B, C to the original Δ — and is
              now reducible by series-parallel rules when wired into a larger
              network<Cite id="kennelly-1899" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2 className="chapter-h2"><em>Maximum</em> power transfer</h2>

      <p className="mb-prose-3">
        Once any source has been compressed to its Thévenin form (V<sub>Th</sub>,
        R<sub>S</sub>), an obvious question follows: what load R<sub>L</sub> draws
        the most power from it? The power delivered to the load is
      </p>
      <Formula>
        P<sub>L</sub> = I<sup>2</sup> R<sub>L</sub> = V<sub>Th</sub><sup>2</sup> R<sub>L</sub> / (R<sub>S</sub> + R<sub>L</sub>)<sup>2</sup>
      </Formula>
      <p className="mb-prose-3">
        The two limits make the curve obvious before you do any calculus. At
        <em className="italic text-text"> R<sub>L</sub> → 0</em> (a short across the terminals) the current
        is large but the voltage across <em className="italic text-text">R<sub>L</sub></em> is zero: no
        power. At <em className="italic text-text">R<sub>L</sub> → ∞</em> (an open circuit) the voltage is
        large but the current is zero: again no power. Somewhere between those
        extremes <em className="italic text-text">P<sub>L</sub></em> peaks. The numerator is linear in
        <em className="italic text-text"> R<sub>L</sub></em> and pulls the curve up; the denominator is
        quadratic in <em className="italic text-text">R<sub>L</sub></em> and pulls it back down at large
        <em className="italic text-text"> R<sub>L</sub></em>. The peak is where these two competing forces
        balance — and balance turns out to occur exactly when the load matches
        the source.
      </p>
      <p className="mb-prose-3">
        Differentiate with respect to R<sub>L</sub>, set the derivative to zero,
        and the answer falls out in two lines: <strong className="text-text font-medium">R<sub>L</sub> = R<sub>S</sub></strong>.
        Plug that back in and the maximum power is
      </p>
      <Formula>
        P<sub>L,max</sub> = V<sub>Th</sub><sup>2</sup> / (4 R<sub>S</sub>)
      </Formula>
      <p className="mb-prose-3">
        The factor of four is the geometric mean lurking inside the algebra: at
        <em className="italic text-text"> R<sub>L</sub> = R<sub>S</sub></em> the current is
        <em className="italic text-text"> I = V<sub>Th</sub>/(2 R<sub>S</sub>)</em>, and the load voltage is
        <em className="italic text-text"> I R<sub>L</sub> = V<sub>Th</sub>/2</em> — the source has handed
        exactly half its EMF over to the load. The product
        <em className="italic text-text"> V · I = V<sub>Th</sub>²/(4 R<sub>S</sub>)</em> drops out
        immediately. The remaining half of the EMF falls across
        <em className="italic text-text"> R<sub>S</sub></em> and dissipates inside the source, which is why
        max-power transfer and max-efficiency operating points cannot coincide:
        the source has to be working as hard as the load to push the matched
        current through.
      </p>
      <p className="mb-prose-3">
        Sanity-check the formula in two limits. If <em className="italic text-text">R<sub>S</sub> → 0</em>
        (a perfect voltage source), <em className="italic text-text">P<sub>L,max</sub> → ∞</em> for any
        finite <em className="italic text-text">V<sub>Th</sub></em> — exactly what an ideal source could
        deliver into a finite load. If <em className="italic text-text">V<sub>Th</sub> → 0</em>,
        <em className="italic text-text"> P<sub>L,max</sub> → 0</em> regardless of <em className="italic text-text">R<sub>S</sub></em> —
        no EMF, no power. Both limits land where physical intuition says they
        should.
      </p>
      <p className="mb-prose-3">
        — exactly a quarter of the short-circuit power the source could deliver into
        a wire (V<sub>Th</sub>²/R<sub>S</sub>), and exactly half of the source's
        open-circuit energy budget. The other half is dissipated inside R<sub>S</sub>
        itself; the{' '}
        <Term def={<><strong className="text-text font-medium">efficiency</strong> at maximum power transfer — the ratio of load power to total power: <em className="italic text-text">η = R<sub>L</sub> / (R<sub>S</sub> + R<sub>L</sub>)</em>. At the maximum-power point <em className="italic text-text">R<sub>L</sub> = R<sub>S</sub></em>, this is exactly 1/2.</>}>efficiency</Term>
        {' '}at the max-power point is exactly 50 %<Cite id="hayt-kemmerly-durbin-2018" in={SOURCES} /><Cite id="horowitz-hill-2015" in={SOURCES} />.
      </p>

      <PredictThenObserve
        storageKey="ch13-max-power-transfer"
        question={
          <>
            Maximum power is delivered to the load when the load resistance equals the source resistance. At that exact
            operating point, the <em className="italic text-text">efficiency</em> (power-into-load divided by power-from-source) is …
          </>
        }
        spec={{
          kind: 'multiple-choice',
          options: [
            { id: 'a', label: '25%' },
            { id: 'b', label: '50%' },
            { id: 'c', label: '75%' },
            { id: 'd', label: '100%' },
          ],
          correctIds: ['b'],
        }}
        reveal={() => (
          <>
            Half the dissipated power goes into the source's own internal resistance, half into the load — which is why
            power systems are never run at the maximum-power-transfer point.
          </>
        )}
      >
        <MaxPowerTransferDemo />
      </PredictThenObserve>

      <p className="mb-prose-3">
        Slide R<sub>L</sub> through R<sub>S</sub> and the power curve peaks
        symmetrically: drop R<sub>L</sub> by a factor of two and you waste current
        in R<sub>S</sub>; raise it by a factor of two and the source can't push
        enough current to do useful work. Either way you fall off the peak. The
        efficiency curve (teal) climbs monotonically as you raise R<sub>L</sub> —
        higher load impedance always wastes less in the source — but at the cost of
        absolute power delivered. These are different design criteria: a power
        engineer's goal is usually maximum efficiency, not maximum power transfer;
        an RF engineer's goal is the opposite.
      </p>
      <Pullout>
        Maximum power is not maximum efficiency. The two goals point in
        opposite directions, and choosing the wrong one melts your output
        stage.
      </Pullout>
      <p className="mb-prose-3">
        For AC, the{' '}
        <Term def={<><strong className="text-text font-medium">maximum-power-transfer theorem</strong> — in a linear AC network, maximum average power is delivered to a load when its impedance equals the complex conjugate of the source's: <em className="italic text-text">Z<sub>L</sub> = Z<sub>S</sub><sup>*</sup></em>. The reactances cancel, the resistances match, and the average load power is <em className="italic text-text">|V<sub>Th</sub>|² / (4 R<sub>S</sub>)</em>.</>}>maximum-power-transfer theorem</Term>{' '}
        generalises to{' '}
        <Term def={<><strong className="text-text font-medium">conjugate matching</strong> — choosing <em className="italic text-text">Z<sub>L</sub> = Z<sub>S</sub><sup>*</sup></em> (R<sub>L</sub> = R<sub>S</sub>, X<sub>L</sub> = −X<sub>S</sub>) so that source and load reactances cancel and the average power delivered is maximised. The standard target for RF amplifiers driving antennas and for audio output stages.</>}>conjugate matching</Term>:
        the optimal load impedance is the complex conjugate of the source impedance,
        Z<sub>L</sub> = Z<sub>S</sub><sup>*</sup>. The reactances cancel
        (X<sub>L</sub> = −X<sub>S</sub>), the resistances match
        (R<sub>L</sub> = R<sub>S</sub>), and the same V<sub>Th</sub>²/(4 R<sub>S</sub>)
        falls out of the algebra<Cite id="horowitz-hill-2015" in={SOURCES} />. RF
        amplifiers driving antennas, audio power stages driving loudspeakers, and the
        front ends of every cellular receiver all live on this theorem; missing the
        conjugate match by a factor of two costs you a couple of dB in delivered
        power and — worse — reflects the unconverted portion back down the line as
        a standing wave.
      </p>

      <TryIt
        tag="Try 13.6"
        question={
          <>
            A source has V<sub>Th</sub> = 12 V and R<sub>S</sub> = 4 Ω. Find the
            load resistance for maximum power transfer, and the value of P<sub>L</sub>
            at that load.
          </>
        }
        hint={<>R<sub>L</sub> = R<sub>S</sub>; P<sub>L,max</sub> = V<sub>Th</sub>²/(4 R<sub>S</sub>).</>}
        answer={
          <>
            <Formula>R<sub>L</sub> = R<sub>S</sub> = <strong className="text-text font-medium">4 Ω</strong></Formula>
            <Formula>P<sub>L,max</sub> = 12² / (4·4) = 144/16 = <strong className="text-text font-medium">9.0 W</strong></Formula>
            <p className="mb-prose-1 last:mb-0">
              An equal-and-opposite 9.0 W gets dissipated inside R<sub>S</sub>, for a
              total source output of 18 W and an efficiency of 50 % at the matched
              point<Cite id="hayt-kemmerly-durbin-2018" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2 className="chapter-h2">What this chapter buys you</h2>
      <p className="mb-prose-3">
        Mesh and nodal analyses turn Kirchhoff's raw two-law statement into a
        procedural recipe whose output is a small linear system. Superposition
        decomposes multi-source linear networks one source at a time, and along
        the way proves the existence of Thévenin and Norton equivalents.
        Norton's theorem (1926) is the current-source dual of Thévenin's;
        source transformation lets you interchange them freely. Kennelly's Y-Δ
        transformation (1899) unsticks every non-planar bridge network from the
        series-parallel cul-de-sac. The maximum-power-transfer theorem tells you
        when to match impedances and what the cost of doing so will be. Together
        these five tools are the working circuits engineer's
        toolkit<Cite id="hayt-kemmerly-durbin-2018" in={SOURCES} />, and they are
        what every modern simulator — SPICE, LTspice, Cadence — does internally
        on networks too large for a human to handle by hand. Chapter 14 picks up
        where this one leaves off, opening up the active devices: diodes,
        transistors, and the silicon machinery that makes circuit analysis a
        living engineering discipline rather than a 19th-century algebra exercise.
      </p>

      <CaseStudies intro="Four places where mesh, nodal, superposition, Norton, and Y-Δ stop being homework and start running real equipment.">
        <CaseStudy
          tag="Case 13.1"
          title="Strain gauges on a Wheatstone bridge"
          summary={<>A 350 Ω gauge with a 1000 µε strain changes resistance by ≈0.7 Ω — and the bridge converts that into a millivolt-scale output.</>}
          specs={[
            { label: 'Typical gauge resistance', value: '120 Ω, 350 Ω, 1000 Ω' },
            { label: 'Gauge factor (constantan)', value: '≈ 2.0' },
            { label: 'Strain range (full-scale)', value: '±2000 µε' },
            { label: 'ΔR / R at 1000 µε', value: '0.2 %' },
            { label: 'Bridge excitation', value: '5 – 10 V' },
            { label: 'Output (full-bridge, 1000 µε)', value: '≈ 5 – 10 mV' },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            A bonded metal-foil strain gauge changes its resistance in proportion to
            the strain it experiences: ΔR/R = GF · ε, where the gauge factor GF is
            about 2.0 for constantan alloy and ε is the strain (length-change per
            unit length). A typical 350 Ω gauge stretched to 1000 µε shifts by
            about 0.7 Ω — a 0.2 % change, far too small to read accurately as an
            absolute resistance<Cite id="horowitz-hill-2015" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            Wiring the gauge as one arm of a Wheatstone bridge converts that small
            fractional change into a differential voltage at the bridge's middle arm.
            For a half-bridge driven at 5 V, a 0.2 % imbalance shows up as a 2.5 mV
            differential — well within the range of an instrumentation amplifier with
            a gain of 1000<Cite id="horowitz-hill-2015" in={SOURCES} />. Full-bridge
            configurations (four active gauges, two stretched and two compressed)
            double the sensitivity again and cancel temperature drift, because all
            four resistors share the same thermal environment.
          </p>
          <p className="mb-prose-2 last:mb-0">
            The bridge is not reducible by series/parallel rules — but it doesn't
            have to be, because the only quantity you actually want is V<sub>A</sub>
            − V<sub>B</sub>, which falls out of two voltage-divider calculations and
            a subtraction. That is the bridge's payoff: it picks one small piece of
            algebra — the difference of two divider outputs — and amplifies it into
            measurable territory<Cite id="hayt-kemmerly-durbin-2018" in={SOURCES} />.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 13.2"
          title="SPICE under the hood"
          summary={<>Every modern circuit simulator solves a sparse linear system at each timestep — modified nodal analysis, the same picture as Section 2, scaled to a million unknowns.</>}
          specs={[
            { label: 'SPICE first release', value: '1973 (UC Berkeley)' },
            { label: 'Core algorithm', value: 'Modified Nodal Analysis (MNA)' },
            { label: 'System per timestep', value: 'A x = b' },
            { label: 'Typical IC simulation', value: '10⁴ – 10⁷ nodes' },
            { label: 'Per-iteration cost', value: 'O(N^1.2) sparse LU' },
            { label: 'Time-domain integration', value: 'Trapezoidal / BDF' },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            SPICE — Simulation Program with Integrated Circuit Emphasis — was
            written in Fortran at UC Berkeley in 1973 and remains the algorithmic
            ancestor of every circuit simulator in working use. At each timestep
            (DC sweep, AC sweep, or transient point), SPICE builds a sparse linear
            system <em className="italic text-text">A x = b</em> where the unknown vector <em className="italic text-text">x</em> contains
            every node voltage plus a branch current for each voltage source or
            inductor (those elements have no direct conductance term, so they need a
            separate equation)<Cite id="hayt-kemmerly-durbin-2018" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            The augmented form is called <em className="italic text-text">modified nodal analysis</em> (MNA), and
            it's the natural generalisation of the plain nodal recipe in Section 2:
            instead of insisting that every source be a current source (which plain
            KCL prefers), MNA admits voltage sources and dependent sources
            uniformly, at the cost of a few extra unknowns. The sparse matrix that
            results is solved by a sparse LU decomposition; nonlinear elements
            (diodes, transistors) are linearised around the previous iteration's
            operating point, and Newton's method drives the residual to zero. The
            whole picture is the chapter's mesh/nodal recipe, automated and
            ferocious.
          </p>
          <p className="mb-prose-2 last:mb-0">
            The reason SPICE prevailed over loop-current alternatives is precisely
            the topology argument from §1: most integrated circuits have far more
            nodes than independent loops, and on net the node-voltage system is
            smaller. For power-grid analysis the opposite can be true, and
            specialised power-flow solvers do use loop-current formulations
            internally<Cite id="hayt-kemmerly-durbin-2018" in={SOURCES} />.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 13.3"
          title="Phantom power down a Y network"
          summary={<>48 V DC ride down both signal conductors of a balanced mic cable through a matched pair of 6.8 kΩ resistors — pure superposition keeps the audio undisturbed.</>}
          specs={[
            { label: 'P48 phantom voltage', value: '48 V ± 4 V' },
            { label: 'Feed resistors', value: '6.81 kΩ each, 0.4 % matched' },
            { label: 'Per-mic current draw', value: '≤ 10 mA' },
            { label: 'Common-mode DC at pins 2/3', value: '+48 V' },
            { label: 'Differential signal at pins 2/3', value: 'mic output, mV-scale' },
            { label: 'Standard', value: 'IEC 61938 (P48)' },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            A condenser microphone needs DC power to polarise its capsule and
            biased its internal head-amp. The trick studio engineers settled on in
            the 1960s — codified as P48 in IEC 61938 — is to send the 48 V DC down
            both signal conductors of the balanced cable simultaneously, through a
            pair of carefully matched 6.81 kΩ feed resistors. The microphone draws
            its DC from the common mode (both conductors at +48 V relative to
            ground) and returns its audio signal as a differential voltage between
            the two conductors<Cite id="horowitz-hill-2015" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            Mathematically this is pure superposition. The DC source sees a Y of
            two 6.81 kΩ feed resistors with the microphone's internal load between
            them — a balanced network that delivers a clean +48 V common mode. The
            audio source (the mic itself) sees the same Y but excited differentially,
            with the audio signal cancelling at the resistors' midpoint and
            propagating purely differentially down the cable. The two excitations
            do not interfere — because superposition guarantees they can't, so long
            as every component in the chain is linear<Cite id="hayt-kemmerly-durbin-2018" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            The matching tolerance on the feed resistors matters: a 1 % mismatch
            converts a tiny fraction of the 48 V common-mode supply into a
            differential signal that the preamp can't reject. Studio-grade
            interfaces use 0.4 % or better, and many bench preamps tighten the
            spec further on the front end before the differential amplifier stage.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 13.4"
          title="Matching a power amp to its loudspeaker"
          summary={<>Conjugate matching across an audio output stage — and why 50 % efficiency is acceptable in RF but ruinous in a power amp.</>}
          specs={[
            { label: 'Loudspeaker impedance', value: '4 Ω, 8 Ω (nominal)' },
            { label: 'RF transmission-line impedance', value: '50 Ω (coax), 75 Ω (video)' },
            { label: 'Max-power efficiency', value: '50 %' },
            { label: 'Class-AB audio amp efficiency', value: '50 – 78 %' },
            { label: 'Class-D efficiency', value: '85 – 95 %' },
            { label: 'Mismatch loss for 2:1 VSWR', value: '≈ 0.5 dB' },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            An RF power amplifier driving an antenna at 100 MHz really does want a
            conjugate match: the antenna's feedpoint impedance is engineered to be
            close to 50 Ω real, the amplifier's output impedance is brought to 50 Ω
            by a matching network, and the maximum-power-transfer condition delivers
            the most signal possible into free space. The 50 % efficiency
            corresponding to R<sub>L</sub> = R<sub>S</sub> is the textbook
            limit<Cite id="horowitz-hill-2015" in={SOURCES} /> — class-A RF amps actually
            run worse than that in practice, but the matched-impedance constraint is
            non-negotiable because any mismatch reflects energy back down the
            transmission line.
          </p>
          <p className="mb-prose-2 last:mb-0">
            An audio power amplifier driving a 4 Ω or 8 Ω loudspeaker takes a
            different view. If a class-AB amplifier with a hard 8 Ω output impedance
            "matched" its load, every watt delivered to the speaker would be matched
            by an equal watt burnt inside the amp's output transistors — and the
            amp would melt at any reasonable listening level. Audio designers
            instead build amps with extremely low output impedance (a small fraction
            of an ohm), drive the loudspeaker as a voltage source, and let the
            speaker decide how much current to draw. Efficiency rises toward the
            class-AB ceiling of about 78 %; class-D switching amps push past 90 %.
          </p>
          <p className="mb-prose-2 last:mb-0">
            The maximum-power theorem still applies — the amp is delivering less
            than V<sub>Th</sub>²/(4 R<sub>S</sub>) of theoretically available power
            into the load — but the design criterion has changed from "extract every
            watt the source could deliver" to "deliver the watts the speaker needs
            without burning the amp." The same theorem, two completely opposite
            engineering targets<Cite id="horowitz-hill-2015" in={SOURCES} />.
          </p>
        </CaseStudy>
      </CaseStudies>

      <FAQ
        intro="The questions that surface the first time a textbook problem stops fitting on a single line."
      >
        <FAQItem q="When should I pick mesh analysis over nodal, or vice versa?">
          <p>
            Pick whichever yields the smaller linear system. A network with{' '}
            <em className="italic text-text">m</em> independent meshes and <em className="italic text-text">n</em> non-reference nodes gives an
            <em className="italic text-text"> m × m</em> system from mesh analysis and an <em className="italic text-text">n × n</em> system from
            nodal analysis. Long series chains (ladders, transmission-line cascades)
            have few nodes and lots of loops — nodal wins. Wide parallel networks
            (transistor biasing webs, op-amp feedback bundles) have many parallel
            branches and few loops — mesh wins. When both are about the same size,
            pick the one whose source types map cleanest: pure voltage sources fit
            mesh naturally; pure current sources fit nodal<Cite id="hayt-kemmerly-durbin-2018" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why does superposition only work for linear circuits?">
          <p>
            Because the underlying constitutive equations have to be additive in the
            sources. Ohm's law (V = IR), the capacitor equation (I = C dV/dt), and
            the inductor equation (V = L dI/dt) are all linear in their variables:
            scale a source, scale the response by the same factor; add two sources,
            add their responses. A diode breaks all of that — its current is an
            exponential in voltage, so two sources active together produce a
            different answer than the sum of their separate responses. Transistors,
            saturating ferromagnetic cores, and anything with a nonlinear V–I
            curve fail superposition for the same reason<Cite id="irwin-circuit-analysis-2015" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why is the Norton resistance equal to the Thévenin resistance?">
          <p>
            Because both characterise the same physical network at the same two
            terminals — the only thing that changes between Thévenin and Norton is
            which variable you parametrise the source by. The internal resistance
            "looking into" the terminals (with every independent source zeroed) is a
            property of the network's topology and resistor values, not of the
            source convention. Algebraically: V<sub>Th</sub> = I<sub>N</sub>·R<sub>Th</sub>,
            so once you've measured V<sub>Th</sub> and I<sub>N</sub> = I<sub>sc</sub>
            (short-circuit current), the resistance R<sub>Th</sub> = R<sub>N</sub>
            = V<sub>Th</sub>/I<sub>N</sub> falls out automatically<Cite id="norton-1926" in={SOURCES} /><Cite id="hayt-kemmerly-durbin-2018" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Can I superpose power as well as voltage and current?">
          <p>
            No — and this is the canonical trap. Power is quadratic in voltage and
            current (P = VI = V²/R = I²R), so it does not satisfy the additivity
            superposition requires. If source 1 alone produces 4 W in a resistor and
            source 2 alone produces 9 W, the two sources together do not produce
            13 W. They produce whatever I²R works out to be at the live current —
            which depends on the algebraic sum of the per-source currents, including
            any phase relations in the AC case. Always superpose voltages and
            currents, then compute powers from the live operating
            point<Cite id="irwin-circuit-analysis-2015" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What is modified nodal analysis, and why does SPICE use it?">
          <p>
            Plain nodal analysis assumes every source is a current source — voltage
            sources don't fit the KCL bookkeeping directly, because they don't have
            a conductance term to put in the matrix. Modified nodal analysis (MNA)
            patches this by adding one extra unknown — the current through the
            voltage source — and one extra equation (KVL across the source) for each
            such element. Inductors get the same treatment, since at DC they look
            like voltage sources of value zero. The resulting matrix is no longer
            symmetric, but it handles voltage sources, controlled sources, and
            inductors uniformly, which is why every SPICE-derived simulator uses
            it<Cite id="hayt-kemmerly-durbin-2018" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why is the efficiency at maximum power transfer only 50 %?">
          <p>
            Because matching R<sub>L</sub> = R<sub>S</sub> means the same current
            flows through both, and they have equal resistance, so they dissipate
            equal power. The other half of the source's output is wasted heating
            R<sub>S</sub>. You can do better in efficiency by making R<sub>L</sub>
            larger than R<sub>S</sub> (less waste, less load current, less absolute
            power), or worse by making it smaller (more current squared, more waste
            in R<sub>S</sub>). The 50 % point is the optimum if and only if you are
            maximising load power, not efficiency<Cite id="horowitz-hill-2015" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="When is max-power-transfer the right criterion, and when is max efficiency right?">
          <p>
            Max-power-transfer is the right criterion when you are limited by the
            source — RF amplifiers driving antennas, photovoltaic modules at their
            maximum-power point, the front end of a radio receiver where signal is
            scarce. Max-efficiency is the right criterion when you are limited by
            dissipation — a 765 kV transmission line, an audio power amplifier where
            R<sub>S</sub> = R<sub>L</sub> would melt the output transistors, an
            industrial three-phase motor where 50 % efficiency would double the
            customer's electricity bill. Always identify the binding constraint
            before invoking max-power-transfer.
          </p>
        </FAQItem>

        <FAQItem q="Why is the Wheatstone bridge so sensitive at the balance point?">
          <p>
            Because the galvanometer reads V<sub>A</sub> − V<sub>B</sub>, and at
            balance both V<sub>A</sub> and V<sub>B</sub> are sitting at the same
            interior voltage. A small imbalance ΔR in one arm — say R<sub>x</sub>
            shifting by 0.1 % — produces a differential output proportional to
            (ΔR/R)·V<sub>excitation</sub>, but with no common-mode signal to drown
            it out. The bridge is the prototypical instrument for resolving small
            <em className="italic text-text"> changes</em> in resistance against a large constant background, which
            is why every strain gauge, every platinum RTD thermometer, and every
            high-precision resistance comparator is built around
            it<Cite id="horowitz-hill-2015" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Can Y-Δ transforms be done in AC?">
          <p>
            Yes. Replace the real resistances R<sub>a</sub>, R<sub>b</sub>, R<sub>c</sub>
            with complex impedances Z<sub>a</sub>, Z<sub>b</sub>, Z<sub>c</sub>, and
            the Kennelly formulas hold term-by-term (Z<sub>AB</sub> = (Z<sub>a</sub>Z<sub>b</sub>
            + Z<sub>b</sub>Z<sub>c</sub> + Z<sub>c</sub>Z<sub>a</sub>) / Z<sub>c</sub>,
            and so on)<Cite id="irwin-circuit-analysis-2015" in={SOURCES} />. The AC
            extension is heavily used in power-system fault analysis (converting
            between Δ- and Y-connected three-phase transformer banks) and in
            impedance-matching networks at RF, where T- and π-network synthesis
            techniques are direct applications of the Y-Δ duality.
          </p>
        </FAQItem>

        <FAQItem q="What if my circuit has a dependent (controlled) source?">
          <p>
            Mesh and nodal analysis still work; you just keep the controlling
            variable as a symbol and write a separate constraint equation tying it
            to the controlled source. Superposition still works for the independent
            sources — but you can <em className="italic text-text">not</em> zero the dependent sources when
            isolating an independent one; the dependent source is part of the
            network's structure, not an external excitation. Thévenin and Norton
            equivalents still exist, but R<sub>Th</sub> is now found by applying a
            test source at the open terminals and reading the resulting current,
            not by inspection of the resistors<Cite id="hayt-kemmerly-durbin-2018" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Can mesh analysis handle a current source in the middle of a loop?">
          <p>
            Not directly — a current source's voltage isn't a known constant, so
            you can't write KVL around its loop straightforwardly. The standard
            workaround is the <em className="italic text-text">supermesh</em>: combine the two meshes the current
            source bridges into a single composite loop, write KVL around the
            composite (skipping the source's branch), and add the constraint that
            the difference of the two mesh currents equals the source's
            current<Cite id="hayt-kemmerly-durbin-2018" in={SOURCES} />. Nodal analysis
            handles current sources natively, which is one reason simulators
            prefer it.
          </p>
        </FAQItem>

        <FAQItem q="Is conjugate matching the same as impedance matching in transmission lines?">
          <p>
            Closely related but not identical. A transmission line's "matched"
            termination is R = Z₀, where Z₀ is the line's real characteristic
            impedance (typically 50 Ω for coax or 75 Ω for video). That is the
            condition that prevents reflections of a propagating wave. Conjugate
            matching at the line's source or load end is the condition for maximum
            average power transfer between a lumped source and a lumped load
            (Z<sub>L</sub> = Z<sub>S</sub><sup>*</sup>). In a uniform line driven at one
            end and terminated at the other, both conditions reduce to the same
            real-impedance match — but on a line driven into a complex load, the
            distinction matters, and RF engineers track them separately<Cite id="horowitz-hill-2015" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What's the difference between an ideal voltage source and an ideal current source?">
          <p>
            An ideal voltage source maintains a fixed voltage across its terminals
            regardless of the current flowing through it (its internal resistance is
            zero); an ideal current source maintains a fixed current through itself
            regardless of the voltage across it (its internal resistance is
            infinite). Real sources are neither: a battery has a non-zero internal
            resistance and a current-source IC has finite output impedance. The
            Thévenin / Norton equivalence is the statement that, externally, any
            real source can be modelled as <em className="italic text-text">either</em> an ideal voltage source plus
            a series resistance <em className="italic text-text">or</em> an ideal current source plus a parallel
            resistance — with the same R in both cases<Cite id="norton-1926" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Is there an easy way to find R_Th without computing V_oc and I_sc?">
          <p>
            Yes, for any network with only independent sources: zero every
            independent source (short voltage sources, open current sources), then
            compute the equivalent resistance looking back into the terminals by
            series-parallel reduction or Y-Δ. That number is R<sub>Th</sub>; no
            other measurements required. For networks with dependent sources, you
            have to apply a test source instead — typically a 1 V test source at
            the open terminals — and read the current; R<sub>Th</sub> = V<sub>test</sub>/I<sub>test</sub><Cite id="hayt-kemmerly-durbin-2018" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why use Cramer's rule instead of just solving by substitution?">
          <p>
            For 2×2 and 3×3 systems by hand, either method works and substitution is
            often shorter. Cramer's rule is more systematic for larger by-hand
            systems and exposes the structure of the answer directly — each unknown
            comes out as a ratio of determinants, and the symmetry of the mesh /
            nodal coefficient matrix means many determinants are easy to evaluate by
            cofactor expansion. For anything past 4×4 you should use a computer
            (LU decomposition, Gaussian elimination), which is exactly what every
            modern simulator does internally<Cite id="hayt-kemmerly-durbin-2018" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Does the superposition theorem work for AC sources at different frequencies?">
          <p>
            Yes, in a sense, with a subtlety. Each frequency component must be
            analysed separately — at frequency ω₁, use the impedances Z(ω₁); at
            frequency ω₂, use Z(ω₂); etc. The voltages and currents at each frequency
            then superpose linearly. What you cannot do is add the steady-state
            phasors for different frequencies directly into a single phasor diagram
            — they rotate at different rates, so their "sum" at any instant is the
            actual sum of the time-domain sinusoids. This is exactly the picture
            Fourier analysis formalises: a multi-frequency signal is the time-domain
            sum of its harmonic components, each of which the network responds to
            with its own Z(ω) (Ch.15)<Cite id="irwin-circuit-analysis-2015" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why does the Y-Δ transform exist at all — is it just an algebraic trick?">
          <p>
            It is exactly the statement that a three-terminal network is fully
            characterised by three independent impedances (the impedance between
            each pair of terminals, measured with the third floating), and three
            equations are precisely the right number to switch between two
            three-resistor parametrisations. Kennelly's formulas are the unique
            mapping that makes the two networks agree at all three pairs
            simultaneously. The deeper view: any linear N-terminal network is
            characterised by an N(N−1)/2 impedance matrix; the Y-Δ duality is the
            simplest non-trivial case (N = 3, three off-diagonal entries) and
            generalises to multi-port network theorems used throughout RF and
            power-system analysis<Cite id="kennelly-1899" in={SOURCES} /><Cite id="hayt-kemmerly-durbin-2018" in={SOURCES} />.
          </p>
        </FAQItem>
      </FAQ>
    </ChapterShell>
  );
}
