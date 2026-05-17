/**
 * Chapter 2 — Voltage and current
 *
 * The first floor up from charge and field. Built around four embedded demos:
 *   2.1 Voltage as height — gravity analogy for ΔV
 *   2.2 Drift velocity — electrons crawling through copper
 *   2.3 Two speeds — drift vs signal in the same wire
 *   2.4 Switch and bulb — what actually lights the bulb
 *
 * Every numerical claim is cited inline against chapter.sources.
 */
import { CaseStudies, CaseStudy } from '@/components/CaseStudy';
import { ChapterShell } from '@/components/ChapterShell';
import { FAQ, FAQItem } from '@/components/FAQ';
import { Cite } from '@/components/SourcesList';
import { Formula, InlineMath } from '@/components/Formula';
import { Term } from '@/components/Term';
import { TryIt } from '@/components/TryIt';
import { PredictThenObserve } from '@/components/PredictThenObserve';
import { CursorEFieldOnWireDemo } from './demos/CursorEFieldOnWire';
import { DriftVelocityDemo } from './demos/DriftVelocity';
import { SwitchAndBulbDemo } from './demos/SwitchAndBulb';
import { TwoSpeedsDemo } from './demos/TwoSpeeds';
import { VoltageAsHeightDemo } from './demos/VoltageAsHeight';
import { VoltageDrivesFlowDemo } from './demos/VoltageDrivesFlow';
import { getChapter } from './data/chapters';

export default function Ch2VoltageAndCurrent() {
  const chapter = getChapter('voltage-and-current')!;
  const SOURCES = chapter.sources;

  return (
    <ChapterShell chapter={chapter}>
      <p className="chapter-intro">
        Touch the two terminals of a 9-volt battery to your tongue. There is a sour metallic sting
        and a faint shock — the only direct, sensory measurement of voltage that most people ever
        make. What you felt was not 9 volts arriving from somewhere. It was 9 volts of{' '}
        <em className="text-text italic">difference</em> between the two contacts in your saliva,
        and current flowing between them as a result. Voltage is always between two things. Always.
      </p>
      <p className="mb-prose-3">
        This chapter is about the two quantities every electrician and every wall-outlet label talks
        about constantly: voltage and current. Both have intuitive analogies that get the algebra
        right and the picture wrong. We're going to do the algebra and then, more importantly, take
        the wrong pictures away.
      </p>

      <h2 className="chapter-h2">
        Voltage isn't pressure. It's a <em>difference</em>.
      </h2>

      <p className="mb-prose-3">
        The standard plumbing analogy says{' '}
        <Term
          def={
            <>
              <strong className="text-text font-medium">voltage</strong> (potential difference) —
              the work done per unit positive charge to move it between two points:{' '}
              <InlineMath id="voltage-line-integral" />. SI unit: volt (1 V = 1 J/C). Always defined
              between two points.
            </>
          }
        >
          voltage
        </Term>{' '}
        is like water pressure: a battery pushes electrons through a wire the way a pump pushes
        water through a pipe. The analogy is appealing and gets you about a third of the way before
        it breaks down. The first thing to fix is the idea that voltage is a property of a single
        point. It isn't.{' '}
        <strong className="text-text font-medium">
          Voltage is a property of a path between two points.
        </strong>{' '}
        A point in space can be assigned a potential, but only after you've chosen, somewhere off in
        the distance, a reference. Move the reference and every "voltage" shifts by the same amount.
        The differences are unchanged.
      </p>
      <p className="mb-prose-3">
        The gravitational analogy is exact in all the parts that matter. A ball at the top of a hill
        has gravitational potential energy <em className="text-text italic">mgh</em>; let it roll
        and that energy converts to kinetic. A positive test charge at the high end of a voltage
        drop has electrical potential energy <em className="text-text italic">qV</em>; let it move
        and that energy goes into kinetic energy of the charge — which, in a wire full of fixed
        obstacles, almost immediately becomes heat. The battery is the climber lifting the ball back
        up. Voltage is the height it lifted to.
      </p>

      <VoltageAsHeightDemo />

      <h3 className="chapter-h3">The formal definition: a line integral of the field</h3>

      <p className="mb-prose-3">
        The picture is one thing. To do anything with voltage — predict it from a charge
        distribution, compute the work a charge will gain crossing a gap, design a battery or a
        capacitor — you need a definition with sharper edges. The "height" in the analogy is the
        line integral of the electric field: add up the field's component along any path from{' '}
        <em className="text-text italic">a</em> to <em className="text-text italic">b</em>, with a
        minus sign, and you get the potential difference between them.
      </p>
      <Formula size="lg" tex="V_{ab} = V_b - V_a = -\int_a^b \vec{E}\cdot d\vec{\ell}" />
      <p className="mb-prose-3">
        where{' '}
        <strong className="text-text font-medium">
          V<sub>a</sub>
        </strong>{' '}
        and{' '}
        <strong className="text-text font-medium">
          V<sub>b</sub>
        </strong>{' '}
        are the potentials (in volts, J/C) at the two endpoints,{' '}
        <strong className="text-text font-medium">
          V<sub>ab</sub>
        </strong>{' '}
        is the potential difference between them,
        <strong className="text-text font-medium"> E</strong> is the electric field vector (in V/m,
        equivalently N/C),
        <strong className="text-text font-medium"> dℓ</strong> is the infinitesimal vector element
        of any path from <em className="text-text italic">a</em> to{' '}
        <em className="text-text italic">b</em> (in metres), and the integral runs along that path.
      </p>
      <p className="mb-prose-3">
        The minus sign is convention: walking <em className="text-text italic">against</em> the
        field gains you potential, the way climbing
        <em className="text-text italic">against</em> gravity gains you altitude. For static charges
        the integral is path-independent <Cite id="feynman-II-2" in={SOURCES} />
        — the field is conservative, <InlineMath tex="\nabla\times\vec{E} = 0" /> — which is what
        lets you talk about the voltage at a point at all. Drop that property (we will, in Chapter
        5) and "voltage" stops meaning what you think it means
        <Cite id="griffiths-2017" in={SOURCES} />.
      </p>

      <h3 className="chapter-h3">Voltage as energy per unit charge</h3>

      <p className="mb-prose-3">
        The line integral is exact, but you'll rarely evaluate one. The way every working engineer
        holds voltage in their head — and the way every multimeter measures it — is operationally:
        as the energy it takes (or releases) per coulomb of charge moved from one point to the
        other. Move a charge <strong className="text-text font-medium">q</strong> against a
        potential difference <strong className="text-text font-medium">V</strong> and you do work
      </p>
      <Formula size="lg" id="work-charge-voltage" />
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">W</strong> is the work done on the charge
        (in joules), <strong className="text-text font-medium">q</strong> is the charge being moved
        (in coulombs, signed), and <strong className="text-text font-medium">V</strong> is the
        potential difference between the start and end points (in volts). Equivalently, rearrange to
        read voltage off as work-per-charge:
      </p>
      <Formula size="lg" tex="V = \dfrac{W}{q} = \dfrac{\Delta U}{q}" />
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">ΔU</strong> is the change in electrical
        potential energy of the charge (in joules). One volt is one joule per coulomb. That single
        identity is why "1.5 V" on a battery is a statement about energy: it says the cell can
        deposit 1.5 joules of energy onto every coulomb of charge that flows out one terminal and
        back into the other
        <Cite id="feynman-II-2" in={SOURCES} />. It is also the same statement as the line integral
        — just integrated and divided through by the charge.
      </p>

      <VoltageDrivesFlowDemo />

      <p className="mb-prose-3">
        That operational picture has a knob the reader can already turn. Hook a battery of voltage{' '}
        <em className="text-text italic">V</em> across a fixed resistive load and a fixed current
        flows: in the demo above, <InlineMath tex="I = V/R" /> for{' '}
        <em className="text-text italic">R</em> = 10 Ω. Doubling{' '}
        <em className="text-text italic">V</em> doubles the current — and, via{' '}
        <InlineMath tex="v_d = I/(nqA)" />, doubles the drift speed of the electrons inside the
        copper. But the drift stays microscopic across the whole slider range, never breaking out of
        tens of micrometres per second. What lifts dramatically is the power{' '}
        <InlineMath tex="P = V\cdot I = V^2/R" />: a quadratic, not a linear, function of voltage.
        That is the reason the load gets so much brighter when you crank{' '}
        <em className="text-text italic">V</em>, and the reason the grid pushes power cross-country
        at hundreds of kilovolts. Chapter 3 makes Ohm's law and power rigorous; Chapter 8 will show
        that the energy isn't actually flowing through the copper at all.
      </p>

      <h3 className="chapter-h3">The cleanest case: a uniform field between two plates</h3>

      <p className="mb-prose-3">
        The line integral and the W/q view are the same statement; the easiest place to see that is
        when the field is uniform, because the integral collapses to a single product. Inside a
        parallel-plate capacitor with the plates a distance{' '}
        <strong className="text-text font-medium">d</strong> apart, the electric field has the same
        magnitude and direction at every point in the gap. The voltage between the plates is then
      </p>
      <Formula size="lg" id="voltage-uniform-field" />
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">V</strong> is the potential difference
        between the two plates (in volts),
        <strong className="text-text font-medium"> E</strong> is the magnitude of the uniform
        electric field in the gap (in V/m), and
        <strong className="text-text font-medium"> d</strong> is the gap distance (in metres).
        Voltage and field, in this geometry, are two ways of saying the same thing. The work to push
        a charge <strong className="text-text font-medium">q</strong> from one plate to the other is
        then
      </p>
      <Formula size="lg" tex="W = qV = qEd" />
      <p className="mb-prose-3">
        the product of charge, field, and distance — exactly Newton's{' '}
        <em className="text-text italic">work = force × distance</em> with
        <InlineMath tex="F = qE" /> from Ch.1. And for any intermediate height{' '}
        <em className="text-text italic">h</em> off the bottom plate, the voltage relative to the
        bottom is just <InlineMath tex="V(h) = Eh" />: a perfect linear ramp from 0 at the bottom to
        <em className="text-text italic">
          {' '}
          V<sub>plate</sub>
        </em>{' '}
        at the top. The "electrical landscape" inside a parallel-plate cap is a perfectly sloped ski
        hill, and any charge dropped in slides down it
        <Cite id="feynman-II-2" in={SOURCES} />
        <Cite id="griffiths-2017" in={SOURCES} />.
      </p>

      <p className="pullout">
        Voltage is not a property of a place. It is a property of the path between two places.
      </p>

      <TryIt
        tag="Try 2.1"
        question={
          <>
            A battery transfers <strong className="text-text font-medium">1 J</strong> of energy to{' '}
            <strong className="text-text font-medium">1 mC</strong> of charge as it moves from one
            terminal to the other. What is the potential difference between the terminals?
          </>
        }
        hint={
          <>
            Voltage is energy per unit charge: <InlineMath tex="V = W/Q" />.
          </>
        }
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">
              By definition, the voltage between two points is the work per unit charge:
            </p>
            <Formula tex="V = \dfrac{W}{Q} = \dfrac{1\ \text{J}}{1\times 10^{-3}\ \text{C}} = 1000\ \text{V}" />
            <p className="mb-prose-1 last:mb-0">
              Answer: <strong className="text-text font-medium">1000 V (1 kV)</strong>.
            </p>
          </>
        }
      />

      <h2 className="chapter-h2">
        What current actually <em>is</em>
      </h2>

      <p className="mb-prose-3">
        <Term
          def={
            <>
              <strong className="text-text font-medium">Current</strong> — the rate at which charge
              crosses a surface, <InlineMath id="current-def" />. SI unit: ampere (1 A = 1 C/s). A
              signed scalar pointing the way conventional positive charge would move.
            </>
          }
        >
          Current
        </Term>{' '}
        is the flow of charge — coulombs per second, with units called{' '}
        <Term
          def={
            <>
              <strong className="text-text font-medium">ampere</strong> — the SI unit of current; 1
              A = 1 coulomb per second ≈ 6.24×10¹⁸ elementary charges per second. Defined since 2019
              by fixing the value of <em className="text-text italic">e</em>.
            </>
          }
        >
          amperes
        </Term>
        . One amp is one coulomb per second, which works out to about{' '}
        <strong className="text-text font-medium">6.24×10¹⁸ elementary charges per second</strong>{' '}
        moving past a fixed cross-section. That is an absurd number of electrons. It will get more
        absurd in two paragraphs.
      </p>
      <Formula size="lg" id="current-def" />
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">I</strong> is the current (in amperes, A =
        C/s), <strong className="text-text font-medium">Q</strong> is the net charge that has
        crossed a chosen fixed cross-section (in coulombs), and{' '}
        <strong className="text-text font-medium">t</strong> is time (in seconds). The sign of
        <strong className="text-text font-medium"> I</strong> follows the direction of conventional
        positive-charge flow across that surface.
      </p>
      <p className="mb-prose-3">
        Current has a direction. By the convention Benjamin Franklin set in 1747 — long before
        anyone knew electrons existed — current points the direction{' '}
        <em className="text-text italic">positive</em> charge would move. In an ordinary copper wire
        the actual carriers are electrons, which are negative, and they drift the opposite way from
        the{' '}
        <Term
          def={
            <>
              <strong className="text-text font-medium">conventional current</strong> — the
              direction positive charge would move, by Franklin's 1747 sign choice. In metals the
              actual carriers (electrons) drift the opposite way; the convention is universal
              anyway.
            </>
          }
        >
          conventional current
        </Term>{' '}
        arrow <Cite id="griffiths-2017" in={SOURCES} />. Every diagram in every electronics textbook
        silently asks you to carry that inversion in your head. Most people learn to do it without
        noticing.
      </p>
      <p className="mb-prose-3">
        With voltage and current in hand, you have the two quantities meters measure. You also have
        the setup for what is, on reflection, one of the strangest facts in classical physics — and
        the heart of this chapter. The electrons in a wire really do move when current flows. They
        just move much, much more slowly than you'd guess.
      </p>

      <TryIt
        tag="Try 2.2"
        question={
          <>
            A current of <strong className="text-text font-medium">1 A</strong> flows past a fixed
            cross-section. How many electrons cross that section per second?
          </>
        }
        hint={
          <>
            One ampere = one coulomb per second; each electron carries{' '}
            <InlineMath tex="e = 1.602\times 10^{-19}\ \text{C}" />.
          </>
        }
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">
              The number per second is just the current divided by the elementary charge{' '}
              <Cite id="codata-2018" in={SOURCES} />:
            </p>
            <Formula
              size="lg"
              tex="N = I/e = 1 / (1.602\times 10^{-19}) \approx 6.24\times 10^{18}\ \text{electrons/s}"
            />
            <p className="mb-prose-1 last:mb-0">
              Answer:{' '}
              <strong className="text-text font-medium">~6.24×10¹⁸ electrons per second</strong> —
              six quintillion, every second, for every amp.
            </p>
          </>
        }
      />

      <h2 className="chapter-h2">
        The astonishing slowness of <em>electrons</em>
      </h2>

      <p className="mb-prose-3">
        In a copper wire, roughly one of each atom's electrons is loose — not bound to any
        particular nucleus, free to wander. That gives a free-electron density of about{' '}
        <strong className="text-text font-medium">n ≈ 8.5×10²⁸ /m³</strong>{' '}
        <Cite id="ashcroft-mermin-1976" in={SOURCES} />. These electrons are not at rest. They
        scream around at the{' '}
        <Term
          def={
            <>
              <strong className="text-text font-medium">Fermi velocity</strong> — the speed of
              electrons at the Fermi surface of a metal, set by quantum degeneracy. For copper,{' '}
              <em className="text-text italic">
                v<sub>F</sub>
              </em>{' '}
              ≈ 1.6×10⁶ m/s — about 0.5% of <em className="text-text italic">c</em>.
            </>
          }
        >
          Fermi velocity
        </Term>
        , roughly <strong className="text-text font-medium">1.6×10⁶ m/s</strong>, bouncing off
        lattice ions every <strong className="text-text font-medium">τ ≈ 2×10⁻¹⁴ s</strong>{' '}
        <Cite id="kittel-2005" in={SOURCES} />
        <Cite id="libretexts-conduction" in={SOURCES} />. Apply a field and on top of all that
        random motion they pick up a tiny <em className="text-text italic">average</em>{' '}
        <Term
          def={
            <>
              <strong className="text-text font-medium">drift velocity</strong> — the small average
              velocity of charge carriers superimposed on their random thermal motion when an
              electric field is applied. <InlineMath tex="v_d = I/(nqA)" />. Typically millimeters
              per second in household wiring.
            </>
          }
        >
          drift
        </Term>{' '}
        in the direction opposite the field. That average drift is what current is made of.
      </p>
      <p className="mb-prose-3">
        In two equations (the{' '}
        <Term
          def={
            <>
              <strong className="text-text font-medium">Drude model</strong> — Paul Drude's 1900
              picture of electrons as a classical gas inside a metal, accelerated by{' '}
              <em className="text-text italic">E</em> between collisions with lattice ions every{' '}
              <em className="text-text italic">τ</em>. Predicts{' '}
              <InlineMath tex="\sigma = nq^2\tau/m" />.
            </>
          }
        >
          Drude model
        </Term>
        ) <Cite id="drude-1900" in={SOURCES} />:
      </p>
      <Formula size="lg" tex="v_d = \dfrac{I}{n\, q\, A}" />
      <p className="mb-prose-3">
        where{' '}
        <strong className="text-text font-medium">
          v<sub>d</sub>
        </strong>{' '}
        is the average drift speed of the carriers (in m/s),
        <strong className="text-text font-medium"> I</strong> is the current (in amperes),{' '}
        <strong className="text-text font-medium">n</strong> is the free-carrier number density (in
        carriers per m³; ≈ 8.5×10²⁸/m³ for copper <Cite id="ashcroft-mermin-1976" in={SOURCES} />
        ),
        <strong className="text-text font-medium"> q</strong> is the charge per carrier (in
        coulombs; for electrons, the elementary charge
        <em className="text-text italic">e</em> ≈ 1.602×10⁻¹⁹ C), and{' '}
        <strong className="text-text font-medium">A</strong> is the wire's cross-sectional area (in
        m²).
      </p>
      <p className="mb-prose-3">Plug in numbers. One amp through a 2.5 mm² copper wire:</p>
      <Formula tex="v_d = \dfrac{1}{(8.5\times 10^{28})(1.6\times 10^{-19})(2.5\times 10^{-6})} \approx 2.9\times 10^{-5}\ \text{m/s}" />
      <p className="mb-prose-3">
        Three hundredths of a millimeter per second. A 12-gauge wire carrying 20 A — the kind
        feeding your kitchen outlet — has a drift velocity of about{' '}
        <strong className="text-text font-medium">0.02 mm/s</strong>{' '}
        <Cite id="libretexts-conduction" in={SOURCES} />. A garden snail moves roughly fifty times
        faster. To traverse a one-meter wire, a single electron needs about ten hours. For a
        forty-foot extension cord at the same current, more than a hundred.
      </p>

      <PredictThenObserve
        storageKey="ch2-drift-velocity"
        question={
          <>
            An individual electron inside a typical 1-amp copper wire is drifting along at roughly
            what speed?
          </>
        }
        spec={{
          kind: 'multiple-choice',
          options: [
            { id: 'a', label: '100 m/s (about a fast car)' },
            { id: 'b', label: '1 m/s (a slow walk)' },
            { id: 'c', label: '1 mm/s (almost imperceptible)' },
            { id: 'd', label: '0.03 mm/s (slower than a snail)' },
          ],
          correctIds: ['d'],
        }}
      >
        <DriftVelocityDemo />
      </PredictThenObserve>

      <p className="mb-prose-3">
        And yet the lamp at the far end of that extension cord turns on the instant you flip the
        switch. Whatever is getting from the switch to the bulb to make it glow, it is not the
        electrons that were sitting near the switch. They will not arrive for hours.
      </p>

      <p className="mb-prose-3">
        Before moving on, one demonstration of how directly those drifting electrons respond to{' '}
        <em className="text-text italic">any</em> electric field — not just the battery's. Bring an
        external charge near the wire and the free electrons inside feel it immediately. They pile
        up, recoil, and redistribute over the conductor's surface until their own field cancels the
        intruder's everywhere in the bulk. That cancellation happens in picoseconds and is the
        reason an electrostatic conductor has <InlineMath tex="E = 0" /> inside{' '}
        <Cite id="griffiths-2017" in={SOURCES} />. The transient — the electrons actually doing the
        rearranging — is what the next demo lets you watch.
      </p>

      <CursorEFieldOnWireDemo />

      <TryIt
        tag="Try 2.3"
        question={
          <>
            A <strong className="text-text font-medium">1.5 mm²</strong> copper wire carries{' '}
            <strong className="text-text font-medium">5 A</strong>. Compute the drift velocity,
            using
            <em className="text-text italic"> n</em> ≈ 8.5×10²⁸ /m³ for copper.
          </>
        }
        hint={
          <>
            Plug into <InlineMath tex="v_d = I/(nqA)" />, using{' '}
            <InlineMath tex="q = e = 1.602\times 10^{-19}\ \text{C}" /> and converting mm² to m².
          </>
        }
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">
              With <em className="text-text italic">A</em> = 1.5×10⁻⁶ m², and{' '}
              <em className="text-text italic">n</em> from Ashcroft &amp; Mermin{' '}
              <Cite id="ashcroft-mermin-1976" in={SOURCES} />:
            </p>
            <Formula tex="v_d = \dfrac{I}{nqA} = \dfrac{5}{(8.5\times 10^{28})(1.602\times 10^{-19})(1.5\times 10^{-6})} \approx 2.4\times 10^{-4}\ \text{m/s}" />
            <p className="mb-prose-1 last:mb-0">
              Answer: about <strong className="text-text font-medium">0.24 mm/s</strong>. At that
              crawl, a single electron takes roughly 70 minutes to traverse a one-meter wire.
            </p>
          </>
        }
      />

      <h2 className="chapter-h2">The two speeds in the same wire</h2>

      <p className="mb-prose-3">
        Inside a copper wire two completely different things can be said to "move," and they move at
        speeds that differ by thirteen orders of magnitude. The electrons themselves drift at
        millimeters per second. The
        <em className="text-text italic">
          {' '}
          electromagnetic{' '}
          <Term
            def={
              <>
                <strong className="text-text font-medium">signal propagation</strong> — the speed at
                which a disturbance in the electromagnetic field around a conductor travels. Set by
                the wire's geometry and surrounding dielectric, typically ~⅔{' '}
                <em className="text-text italic">c</em> in insulated copper, not by the speed of any
                electron.
              </>
            }
          >
            signal
          </Term>
        </em>{' '}
        — the disturbance in the field that tells charges everywhere along the wire to start
        drifting — propagates at roughly two-thirds the speed of light, around{' '}
        <strong className="text-text font-medium">2×10⁸ m/s</strong> in typical copper wiring{' '}
        <Cite id="libretexts-conduction" in={SOURCES} />. That ratio is the central
        you-thought-you-understood-this-but-you-didn't moment.
      </p>
      <Formula tex="v_{\text{signal}} / v_{\text{drift}} \approx 2\times 10^{8} / 3\times 10^{-5} \approx 10^{13}" />

      <TwoSpeedsDemo />

      <TryIt
        tag="Try 2.4"
        question={
          <>
            Take the drift velocity from Try 2.3 (≈ 0.24 mm/s) and the typical signal speed in
            copper (≈ 2×10⁸ m/s). What is the ratio{' '}
            <InlineMath tex="v_{\text{signal}}/v_{\text{drift}}" />, and how long would the signal
            take to travel 30 cm compared to the electron?
          </>
        }
        hint="Just divide the two speeds, then divide 0.30 m by each."
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">
              The ratio of speeds <Cite id="libretexts-conduction" in={SOURCES} />:
            </p>
            <Formula
              size="lg"
              tex="v_{\text{signal}}/v_{\text{drift}} \approx 2\times 10^{8} / 2.4\times 10^{-4} \approx 8\times 10^{11}"
            />
            <p className="mb-prose-1 last:mb-0">
              Time for the signal to cross 30 cm: 0.30 / (2×10⁸) ={' '}
              <strong className="text-text font-medium">1.5 ns</strong>. Time for a single drifting
              electron: 0.30 / (2.4×10⁻⁴) ≈{' '}
              <strong className="text-text font-medium">1250 s ≈ 21 minutes</strong>. Nearly twelve
              orders of magnitude separate the two.
            </p>
          </>
        }
      />

      <p className="mb-prose-3">
        The signal is not made of electrons. It is the electromagnetic field reconfiguring itself,
        and that reconfiguration travels at near-c through the space around the wire. The electrons
        respond to the field locally, wherever they happen to be sitting. They start drifting in
        place; nothing has to travel from one end to the other. This is the picture that, properly
        developed, becomes Chapter 6.
      </p>

      <h2 className="chapter-h2">
        What actually lights the <em>bulb</em>
      </h2>

      <p className="mb-prose-3">
        Here is the sequence, in order, when you flip a wall switch and a bulb on the far side of
        the room comes on:
      </p>
      <p className="mb-prose-3">
        (1) The switch closes. (2) The electric field that was already present in the wires — held
        in place by the battery or the line voltage — reconfigures around the new geometry, and that
        reconfiguration propagates outward at near the speed of light. (3) Within nanoseconds the
        field has reached every electron in the bulb's filament. (4) Those electrons, which were
        already there, begin to drift. (5) The drifting electrons collide with tungsten ions,
        dumping kinetic energy as heat. (6) The filament heats to ~2800 K and glows.
      </p>

      <PredictThenObserve
        storageKey="ch2-switch-bulb"
        question={
          <>
            You close the switch on a circuit with a long wire and a bulb at the far end. How long
            until the bulb lights?
          </>
        }
        spec={{
          kind: 'multiple-choice',
          options: [
            { id: 'a', label: 'Essentially instantly (~5 nanoseconds per metre of wire)' },
            { id: 'b', label: 'A fraction of a second (perceptible delay)' },
            { id: 'c', label: 'Several seconds, while the electrons travel from switch to bulb' },
            { id: 'd', label: 'It depends entirely on the bulb resistance' },
          ],
          correctIds: ['a'],
        }}
      >
        <SwitchAndBulbDemo />
      </PredictThenObserve>

      <p className="mb-prose-3">
        Notice what is not in that list. No electron travels from the switch to the bulb. No charge
        "flows through" the wire in any sense that resembles water through a pipe. The electrons in
        the filament were always there. The thing that propagated was the field, which is not made
        of charges at all — it is a structure in space that Maxwell taught us to take seriously as a
        physical thing in its own right <Cite id="feynman-II-27" in={SOURCES} />. And the energy
        that becomes heat in the filament: it didn't travel down the inside of the wire either.
        We'll get to that one in Chapter 6.
      </p>

      <h2 className="chapter-h2">What we have so far</h2>

      <p className="mb-prose-3">
        Voltage is a difference between two points — the line integral of E along any path between
        them, with a sign. Current is the rate of charge flow past a cross-section, by convention
        pointing the way positive charges would move. The actual carriers in a metal wire are
        electrons drifting in the opposite direction at a few hundredths of a millimeter per second.
        The signal that closes the loop and lights the lamp is electromagnetic — it travels at a
        fraction of the speed of light through the field, not through the metal — and it arrives
        essentially instantly while the electrons themselves are still settling in for a long, slow
        walk.
      </p>
      <p className="mb-prose-3">
        Three quantities are still missing from this picture: how hard a wire pushes back against
        current, how that pushback turns into heat, and why a long thin wire pushes back more than a
        short fat one. Those are the subject of Chapter 3.
      </p>

      <CaseStudies
        intro={
          <>
            Two places this chapter's split between drift and signal — and its insistence that
            voltage is always a difference — surfaces in objects you use or hear about every day.
          </>
        }
      >
        <CaseStudy
          tag="Case 2.1"
          title="USB-C Power Delivery: 240 watts down a hair-thin cable"
          summary="Lifting the voltage so the current — and the drift it implies — stays civilized."
          specs={[
            {
              label: 'Maximum EPR voltage / current',
              value: (
                <>
                  48 V at 5 A <Cite id="usb-pd-r3" in={SOURCES} />
                </>
              ),
            },
            {
              label: 'Maximum negotiated power (EPR)',
              value: (
                <>
                  240 W <Cite id="usb-pd-r3" in={SOURCES} />
                </>
              ),
            },
            {
              label: 'E-marker chip required for',
              value: (
                <>
                  ≥5 A cables <Cite id="usb-pd-r3" in={SOURCES} />
                </>
              ),
            },
            {
              label: 'Free-electron density in copper conductors',
              value: (
                <>
                  ~8.5×10<sup>28</sup> /m<sup>3</sup>{' '}
                  <Cite id="ashcroft-mermin-1976" in={SOURCES} />
                </>
              ),
            },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            The original USB spec delivered 2.5 W at a fixed 5 V — enough to spin a flash drive, not
            enough to do anything else. Modern USB-C Power Delivery, in its Extended Power Range
            mode, negotiates up to <strong className="text-text font-medium">48 V at 5 A</strong>{' '}
            for a total of
            <strong className="text-text font-medium"> 240 W</strong> through a cable not much
            thicker than a shoelace
            <Cite id="usb-pd-r3" in={SOURCES} />. That is enough to charge a gaming laptop or run a
            small monitor.
          </p>
          <p className="mb-prose-2 last:mb-0">
            The trick is the choice of variable. Power is <InlineMath tex="P = VI" />; double the
            voltage and you can deliver the same power at half the current. With{' '}
            <InlineMath tex="n \approx 8.5\times 10^{28}\ /\text{m}^3" />
            free electrons in copper
            <Cite id="ashcroft-mermin-1976" in={SOURCES} />, the drift speed{' '}
            <InlineMath tex="v_d = I/(nqA)" /> stays in the millimeters-per-second range — the same
            crawl this chapter just described — even as the conductor moves real power. The cable
            carries the energy through the surrounding field at near-c, while the actual electrons
            in the copper sit there jittering with a vanishingly small bias on top
            <Cite id="libretexts-conduction" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            That same logic forces a piece of hardware: cables rated for ≥5 A must carry an
            <em className="text-text italic"> e-marker</em> chip that tells the source what current
            the conductor and connector can survive
            <Cite id="usb-pd-r3" in={SOURCES} />. Without it the source refuses to negotiate above 3
            A. Voltage is still always a difference — between the cable's two data pins — but the
            difference is now used to decide how many amperes the engineering on either end is
            willing to commit to.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 2.2"
          title="The electric eel: a stack of biological batteries"
          summary="Several thousand cells in series, briefly producing the voltage of a Tesla pack."
          specs={[
            {
              label: 'Peak discharge voltage',
              value: (
                <>
                  ~600 V <Cite id="catania-2015" in={SOURCES} />
                </>
              ),
            },
            {
              label: 'Peak discharge current',
              value: (
                <>
                  ~1 A <Cite id="catania-2015" in={SOURCES} />
                </>
              ),
            },
            {
              label: 'Discharge duration',
              value: (
                <>
                  ~2 ms pulses, ~400 pulses/s in a high-frequency volley{' '}
                  <Cite id="catania-2015" in={SOURCES} />
                </>
              ),
            },
            {
              label: 'Mechanism',
              value: (
                <>
                  electrocytes stacked in series; each contributes ~150 mV{' '}
                  <Cite id="catania-2015" in={SOURCES} />
                </>
              ),
            },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            <em className="text-text italic">Electrophorus electricus</em> spends most of its life
            in murky Amazonian water and does most of its hunting with electricity. Lining each side
            of its body are thousands of flattened cells called{' '}
            <strong className="text-text font-medium">electrocytes</strong>, each of which uses ion
            pumps to maintain a small potential difference across its membrane. Stacked in series
            like a battery pack, the small potentials add. A direct probe measurement reports peak
            discharges of about <strong className="text-text font-medium">600 V at ~1 A</strong>{' '}
            during predatory strikes
            <Cite id="catania-2015" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            The relevant physics is the chapter's first lesson: voltage is a sum of differences
            along a path. One electrocyte across an ion gradient produces maybe a hundred and fifty
            millivolts; thousands in series produce hundreds of volts. The fish doesn't generate
            more <em className="text-text italic">charge</em> than any other animal — it generates a
            longer
            <em className="text-text italic"> stack</em>, summing identical small ΔV terms along the
            path from head to tail.
          </p>
          <p className="mb-prose-2 last:mb-0">
            On the current side, the eel's brief peak of about an ampere into the surrounding water
            is unremarkable as raw current — your house wiring sees twenty times that — but it is
            delivered at hundreds of volts and is enough to stun a fish a body-length away. The
            pulses last only a couple of milliseconds and recur in high-frequency volleys during a
            strike
            <Cite id="catania-2015" in={SOURCES} />, exploiting the same voltage-times-current
            product that, indoors, runs your toaster.
          </p>
        </CaseStudy>
      </CaseStudies>

      <FAQ intro="Questions readers ask after this chapter — the misconception-busters, the order-of-magnitude sanity checks, and the things nobody quite explains in school.">
        <FAQItem q="If voltage is between two points, what does it mean to say a wire is at 'ground' or 'zero volts'?">
          <p>
            "Ground" is just the agreed-upon{' '}
            <strong className="text-text font-medium">reference point</strong> from which other
            voltages are measured. In a household circuit it is literally a rod driven into the
            soil; in a portable circuit it is the battery's negative terminal; in a spacecraft it is
            the chassis. Calling a point "zero volts" is no different from calling sea level "zero
            altitude" — the choice is human, the differences are physical. Reassign ground and every
            node's voltage shifts by the same number, but the{' '}
            <em className="text-text italic">differences</em>, which are what move charges, never
            change <Cite id="griffiths-2017" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why is a 9-volt battery exactly 9 volts — what sets that number?">
          <p>
            Chemistry. Each electrochemical cell has a characteristic voltage set by the energy
            released per electron when its two half-reactions run: about 1.5 V for an alkaline
            zinc–manganese-dioxide cell, 2.0 V for lead-acid, 3.7 V for lithium-ion. A 9 V battery
            is six 1.5 V alkaline cells stacked in series, summing to nine.
            <strong className="text-text font-medium">
              The number is fundamentally a count of joules per coulomb
            </strong>{' '}
            the chemistry can deliver — no more, no less — and that ratio is fixed by the molecular
            orbitals of the reactants, not by anything the engineer chose.
          </p>
        </FAQItem>

        <FAQItem q="In plain words, what's the actual difference between voltage and current?">
          <p>
            Voltage is <em className="text-text italic">how badly</em> the charges want to move from
            one point to another — the energy each coulomb would release if it got there. Current is{' '}
            <em className="text-text italic">how many</em> of them actually are moving per second
            past a given cross-section. A high voltage with no path is like a held breath; a high
            current is the breath already out. The two are linked through whatever is in between
            them, which in Chapter 3 will turn out to be resistance.
          </p>
        </FAQItem>

        <FAQItem q="One ampere is one coulomb per second — but how many electrons is that, really?">
          <p>
            A coulomb is about{' '}
            <strong className="text-text font-medium">6.24×10¹⁸ elementary charges</strong>, so one
            ampere is roughly six quintillion electrons crossing a fixed plane every second. The
            number feels impossible until you remember that a single cubic millimeter of copper
            already contains around 8.5×10¹⁹ free electrons{' '}
            <Cite id="ashcroft-mermin-1976" in={SOURCES} />. Compared to the supply, an ampere of
            flow is a trickle from a reservoir — which is precisely why drift velocities come out in
            millimeters per second.
          </p>
        </FAQItem>

        <FAQItem q="Why does flipping a switch light a bulb instantly if electrons drift at fractions of a millimeter per second?">
          <p>
            Because the bulb does not wait for any particular electron to arrive. The instant the
            switch closes, the
            <strong className="text-text font-medium"> electric field</strong> in the wire
            reconfigures and that reconfiguration travels at roughly two-thirds the speed of light{' '}
            <Cite id="libretexts-conduction" in={SOURCES} />. The electrons already sitting in the
            filament feel the new field within nanoseconds and begin drifting in place. The energy
            that heats the tungsten comes from those local electrons colliding with the lattice, not
            from anything that traveled the length of the cord.
          </p>
        </FAQItem>

        <FAQItem q="Are the electrons in a battery the same ones that arrive at the bulb?">
          <p>
            Almost certainly not. The electrons in the filament were already in the filament when
            you screwed the bulb in. The electrons in the battery's negative terminal will, in a 20
            A circuit, drift at about
            <strong className="text-text font-medium"> 0.02 mm/s</strong>{' '}
            <Cite id="libretexts-conduction" in={SOURCES} /> — over a meter of wire, that's a
            ten-hour walk. The picture of a charge leaving the battery, traveling down the wire, and
            arriving at the load is wrong in nearly every literal sense. Charges everywhere along
            the loop drift simultaneously the moment the field reaches them.
          </p>
        </FAQItem>

        <FAQItem q="Does AC mean the electrons go forward and back? How far?">
          <p>
            Yes, and barely at all. In a 60 Hz household line carrying a few amps through ordinary
            house wiring, each electron's drift reverses direction 120 times a second, and during
            each half-cycle it travels on the order of
            <strong className="text-text font-medium"> a few hundred nanometers</strong> — far less
            than the diameter of a human hair. The same electron you started with stays essentially
            in place, jittering. The energy delivered to your toaster has nothing to do with that
            jitter; it comes through the surrounding electromagnetic field, which we'll meet
            properly in Chapter 6.
          </p>
        </FAQItem>

        <FAQItem q="Then what actually carries the energy from the battery to the bulb?">
          <p>
            The{' '}
            <strong className="text-text font-medium">
              electromagnetic field in the space around the wire
            </strong>
            . Inside a resistive wire the electric field points along its length and the magnetic
            field circles it; their cross product, the Poynting vector, points radially{' '}
            <em className="text-text italic">inward</em> through the wire's surface and integrates
            exactly to
            <InlineMath tex="VI" />, the dissipated power <Cite id="feynman-II-2" in={SOURCES} />.
            The wire is the destination, not the conduit. This sounds like a parlor trick the first
            time you hear it; Chapter 6 makes it rigorous.
          </p>
        </FAQItem>

        <FAQItem q="If voltage is energy per charge, why doesn't a 1 V capacitor 'run out' after one charge passes through?">
          <p>
            Because the capacitor is doing work on <em className="text-text italic">every</em>{' '}
            charge that crosses, not on the first one and then quitting. Voltage is an intensive
            quantity — it describes the energy <em className="text-text italic">per</em> coulomb,
            available to as many coulombs as care to come through. What runs out is whatever
            maintains the voltage: the chemical reservoir in a battery, the stored field in a
            capacitor, the rotating magnet in a generator. As long as those keep the potential
            difference up, every passing charge gets its share.
          </p>
        </FAQItem>

        <FAQItem q="Does current require a closed loop? Why?">
          <p>
            For <em className="text-text italic">steady</em> current, yes. Charge is conserved, so
            any charge piling up at the end of an open wire quickly raises a counter-field that
            cancels the driving field — the current stops almost immediately. A closed loop lets the
            charges that leave one point be replaced by charges arriving from another, and the
            process continues indefinitely. The exception is briefly: in a capacitor or an antenna,
            you can have a transient current that is part of a larger loop closed not by wire but by
            a <em className="text-text italic">displacement current</em>, i.e. a changing electric
            field — Maxwell's contribution, also waiting in Chapter 6.
          </p>
        </FAQItem>

        <FAQItem q="Why do we use AC for the power grid and DC for electronics?">
          <p>
            Two different optimization targets. AC is trivial to transform up and down in voltage
            with a passive iron transformer, which lets the grid push a few hundred kilovolts
            cross-country (low current, low resistive loss) and step it down to 120 V at your wall.
            DC transformers don't exist passively — they require active switching electronics, which
            only became cheap recently. <strong className="text-text font-medium">Inside</strong> a
            device, almost every transistor, sensor, and chip wants a steady, unidirectional
            voltage; AC would just confuse it. So we ship power as AC and convert at the endpoint.
          </p>
        </FAQItem>

        <FAQItem q="What is 'grounding' actually doing safety-wise?">
          <p>
            It is giving fault current somewhere to go that isn't{' '}
            <em className="text-text italic">you</em>. If a hot wire inside a metal appliance
            chassis frays and touches the case, the ground wire offers a near-zero-resistance path
            back to the panel, which sinks enough current to trip the breaker in milliseconds.
            Without that ground path, the chassis would simply sit at line voltage, waiting for the
            first person to touch it and the floor at the same time to complete the circuit through
            their body. The earth itself is not magical; what matters is that the appliance and your
            feet are tied to the <em className="text-text italic">same</em> reference.
          </p>
        </FAQItem>

        <FAQItem q="Why doesn't touching only one terminal of a battery shock you?">
          <p>
            Because there's no closed loop. A 9 V battery's two terminals differ by 9 V, but the
            terminal you touch and the air around your other hand do not — they are at essentially
            the same potential. No potential difference across you means no current through you. The
            wall outlet is a different story only because one of its terminals is bonded to ground,
            and you are too: standing barefoot on a damp floor, your body completes the loop from
            hot to ground without needing to touch neutral.
          </p>
        </FAQItem>

        <FAQItem q="Does the signal in an AC line travel faster than in a DC line?">
          <p>
            No — the propagation speed depends on the wire's geometry and the surrounding
            dielectric, not on whether the source is steady or oscillating. In ordinary insulated
            copper it's around <strong className="text-text font-medium">2×10⁸ m/s</strong>
            either way <Cite id="libretexts-conduction" in={SOURCES} />, roughly two-thirds the
            speed of light in vacuum. What AC does change is the{' '}
            <em className="text-text italic">direction</em> the signal carries energy: it reverses
            every half-cycle, so the time-averaged Poynting flow into a resistor is what matters,
            not the instantaneous one.
          </p>
        </FAQItem>

        <FAQItem q="If electrons are everywhere in the copper, where does the 'new' current come from when you connect a battery?">
          <p>
            It doesn't come from anywhere — it was already there as random thermal motion. Before
            you connect the battery, copper's free electrons are zipping around at the Fermi
            velocity, about <strong className="text-text font-medium">1.6×10⁶ m/s</strong>
            <Cite id="kittel-2005" in={SOURCES} />, in every direction at once, so their average
            velocity is zero and no net current flows. The battery's field adds a tiny systematic
            bias on top of that chaos — a <em className="text-text italic">drift</em>
            of order millimeters per second — and that bias, multiplied across 10²⁸ electrons per
            cubic meter, is what we measure as amps <Cite id="drude-1900" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why does conventional current point from + to − when actual electrons go the other way?">
          <p>
            Historical accident. Benjamin Franklin chose the sign of charge in 1747, more than a
            century before anyone knew electrons existed, and he guessed wrong about which carrier
            was moving. By the time J. J. Thomson identified the electron in 1897 and pinned down
            its negative charge, every textbook, every circuit diagram, and every right-hand rule
            had baked the older convention in. Rather than rewrite all of electromagnetism,
            physicists kept "conventional current" pointing the way a positive charge would go and
            silently inverted the picture for actual electrons{' '}
            <Cite id="griffiths-2017" in={SOURCES} />.
          </p>
        </FAQItem>
      </FAQ>
    </ChapterShell>
  );
}
