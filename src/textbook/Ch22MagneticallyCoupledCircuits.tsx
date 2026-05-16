/**
 * Chapter 22 — Magnetically coupled circuits
 *
 * The grown-up version of induction: TWO coils, not one. Self-inductance
 * is the special case where the "other coil" is the same coil. From this
 * one promotion fall mutual inductance M, the coupling coefficient k, the
 * dot convention, series-aiding/opposing, the T-equivalent, and reflected
 * impedance — every piece of machinery transformers, wireless chargers,
 * current probes, and RFID readers depend on. We build it intuition-first:
 * for every formula, the physical picture comes before the algebra, and
 * the WHY of the equation's form comes after.
 *
 * Demos:
 *   22.1 Mutual inductance between two coils         — MutualInductanceTwoCoilsDemo
 *   22.2 Coupling coefficient k                      — CouplingCoefficientDemo
 *   22.3 Dot convention                              — DotConventionDemo
 *   22.4 Series aiding/opposing -> measure M         — SeriesCoupledMeasureMDemo
 *   22.5 Reflected impedance                         — ReflectedImpedanceDemo
 */
import { CaseStudies, CaseStudy } from '@/components/CaseStudy';
import { ChapterShell } from '@/components/ChapterShell';
import { FAQ, FAQItem } from '@/components/FAQ';
import { Cite } from '@/components/SourcesList';
import { Formula } from '@/components/Formula';
import { Pullout } from '@/components/Prose';
import { Term } from '@/components/Term';
import { TryIt } from '@/components/TryIt';
import { MutualInductanceTwoCoilsDemo } from './demos/MutualInductanceTwoCoils';
import { CouplingCoefficientDemo } from './demos/CouplingCoefficient';
import { DotConventionDemo } from './demos/DotConvention';
import { SeriesCoupledMeasureMDemo } from './demos/SeriesCoupledMeasureM';
import { ReflectedImpedanceDemo } from './demos/ReflectedImpedance';
import { getChapter } from './data/chapters';

export default function Ch22MagneticallyCoupledCircuits() {
  const chapter = getChapter('magnetically-coupled-circuits')!;
  const SOURCES = chapter.sources;

  return (
    <ChapterShell chapter={chapter}>
      <p className="chapter-intro">
        Lay a phone face-down on a Qi charging pad and the battery icon ticks upward. Nothing
        touches electrically. No spring contact, no exposed pin, no plug. Between the bottom of the
        phone and the surface of the pad sits about three millimetres of plastic, air, and the
        back-cover glass, and across that gap energy flows at a rate of fifteen watts. Slide the
        phone an inch sideways and the charging stops. Tilt the phone on edge and it stops more.
        Stack a coin on the pad and the coin heats up while the phone gets nothing. Somewhere
        beneath the plastic, two coils of copper wire are doing exactly what Joseph Henry and
        Michael Faraday were doing on a workbench in 1831 — and exactly what the pole-pig outside
        your house has been doing every second since it was hung from its cross-arm
        <Cite id="henry-1832" in={SOURCES} />
        <Cite id="faraday-1832" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        Chapter 7 dealt with a single coil and the back-EMF it produces against its own changing
        current — that's self-inductance L, one of the three passive components you can hold in your
        hand. The grown-up version of induction is two coils, side by side, with neither one
        touching the other. A changing current in the first coil produces a changing magnetic field;
        that field threads the second coil; the second coil sees an induced EMF. The coupling
        between them — the bookkeeping that connects what happens on one side to what happens on the
        other — is the subject of this chapter. We will build it up slowly: mutual inductance M, the
        coupling coefficient k, the dot convention that keeps the signs honest, series-aiding and
        series-opposing combinations, and the reflected-impedance trick that lets a primary "see" a
        load it isn't connected to. By the end, transformers (Ch.23), wireless charging, clamp-on
        current probes, and 13.56 MHz RFID readers will all be the same equation with different
        numbers.
      </p>

      <h2 className="chapter-h2">
        Self-inductance, from the right <em>angle</em>
      </h2>

      <p className="mb-prose-3">
        A quick refresher, framed so the rest of the chapter slots cleanly on top of it. Take a coil
        of
        <strong className="text-text font-medium"> N</strong> turns. Push a current{' '}
        <strong className="text-text font-medium">I</strong> through it. The current produces a
        magnetic field; that field, threaded back through each turn of the same coil, yields a total{' '}
        <Term
          def={
            <>
              <strong className="text-text font-medium">flux linkage</strong> — the total magnetic
              flux times the number of turns it threads in a single coil. λ = N · Φ. SI unit: webers
              (or volt-seconds). Self-inductance is just λ/I.
            </>
          }
        >
          flux linkage
        </Term>{' '}
        <strong className="text-text font-medium">λ = N Φ</strong>. The whole construction is
        linear: double <strong className="text-text font-medium">I</strong> and λ doubles, because
        every step (B from Biot–Savart, Φ from a surface integral over B) is linear in the current
        that produced it. That linearity is exactly what lets us pull out a single proportionality
        constant
        <Cite id="griffiths-2017" in={SOURCES} />:
      </p>
      <Formula>L = λ / I = N Φ / I</Formula>
      <p className="mb-prose-3">
        Three things to notice about this definition. First, L is{' '}
        <em className="text-text italic">purely geometric</em>: every term involving I has divided
        out of the ratio, leaving only the coil's size, shape, and winding density. Second, L has
        units of{' '}
        <Term
          def={
            <>
              <strong className="text-text font-medium">henry</strong> — SI unit of inductance. 1 H
              = 1 V·s/A. A one-henry coil produces a one-volt back-EMF when its current changes at
              one ampere per second. Named after Joseph Henry, who discovered self-induction in 1832
              a few months ahead of Faraday's separate work on mutual induction.
            </>
          }
        >
          henry
        </Term>
        s (volt-seconds per amp), and a "few millihenries on a finger-sized form" is typical for an
        air-core inductor at audio frequency
        <Cite id="henry-1832" in={SOURCES} />. Third, the energy stored in the coil's magnetic field
        is
        <strong className="text-text font-medium"> ½LI²</strong> — quadratic in I, because doubling
        I doubles every field line everywhere and the energy density scales as B², not B.
      </p>
      <p className="mb-prose-3">
        Differentiate the linkage with respect to time, and Faraday's law (Ch.7) returns the induced
        EMF
        <Cite id="faraday-1832" in={SOURCES} />
        <Cite id="feynman-II-17" in={SOURCES} />:
      </p>
      <Formula>ε = − dλ/dt = − L dI/dt</Formula>
      <p className="mb-prose-3">
        Why the minus sign? Because the universe doesn't like flux changing. If you connect the
        coil's induced EMF through a resistor, the current it drives sets up its{' '}
        <em className="text-text italic">own</em> flux pointing the opposite way — the system has
        organised itself to oppose the change that produced the EMF. That's{' '}
        <Term
          def={
            <>
              <strong className="text-text font-medium">Lenz's law</strong> — the induced current
              always flows in the direction that opposes the change in flux that produced it. The
              minus sign in Faraday's law made operational; demanded by energy conservation.
            </>
          }
        >
          Lenz's law
        </Term>
        , and the minus sign is its accountant. Strip the minus sign and you have a perpetual-motion
        machine; keep it and the books balance to the joule
        <Cite id="griffiths-2017" in={SOURCES} />.
      </p>

      <h2 className="chapter-h2">
        Mutual inductance: when a <em>second</em> coil enters the picture
      </h2>

      <p className="mb-prose-3">
        Place a second coil near the first. Coil 1 still carries some current{' '}
        <strong className="text-text font-medium">I₁</strong>; the field it produces fills the
        surrounding space. Some of that field threads coil 2 — call this share the{' '}
        <Term
          def={
            <>
              <strong className="text-text font-medium">linking flux</strong> Φ₂₁ — the portion of
              coil 1's magnetic flux that actually passes through coil 2's loop area. Less than or
              equal to the total flux coil 1 produces; the rest "leaks" out the sides.
            </>
          }
        >
          linking flux
        </Term>{' '}
        <strong className="text-text font-medium">Φ₂₁</strong>. The rest leaks out the sides of coil
        1 without ever touching coil 2 — those are the{' '}
        <Term
          def={
            <>
              <strong className="text-text font-medium">leakage flux</strong> — the portion of one
              coil's flux that does NOT thread the other coil. Energy stored in leakage flux appears
              as series leakage inductance from outside; it's what limits transformer efficiency and
              is the price you pay for non-perfect coupling.
            </>
          }
        >
          leakage
        </Term>{' '}
        field lines, and the existence of leakage flux is the entire reason k &lt; 1 in any
        practical coil pair
        <Cite id="griffiths-2017" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        Coil 2 has N₂ turns. Each turn sees Φ₂₁; the total flux linkage in coil 2 produced by I₁ is
        therefore N₂ Φ₂₁. The same linearity argument that gave us self-inductance gives us the
        analogous proportionality constant for the cross-coupling — divide by I₁ and define
      </p>
      <Formula>M = N₂ Φ₂₁ / I₁</Formula>
      <p className="mb-prose-3">
        Three intuitive things fall out immediately. First, like L, the{' '}
        <Term
          def={
            <>
              <strong className="text-text font-medium">mutual inductance</strong> M — the
              proportionality between a current in coil 1 and the flux linkage it produces in coil 2
              (or vice versa). Purely geometric; SI unit is the henry, same as self-inductance.
            </>
          }
        >
          mutual inductance
        </Term>{' '}
        M is <em className="text-text italic">purely geometric</em>: I₁ has divided out, leaving
        only coil shapes, sizes, separations, and orientations. M depends on how the two coils sit
        relative to each other, full stop. Second, M has units of henries, the same as
        self-inductance — only the <em className="text-text italic">role</em> is different. L
        describes a coil's reaction to its own current; M describes a coil's reaction to the
        partner's current. Third — and this is the non-obvious one — M is{' '}
        <strong className="text-text font-medium">symmetric</strong>: drive I₂ instead of I₁,
        measure the flux linkage that appears in coil 1, divide by I₂, and you get the{' '}
        <em className="text-text italic">same</em> M back
        <Cite id="griffiths-2017" in={SOURCES} />
        <Cite id="jackson-1999" in={SOURCES} />.
      </p>
      <Formula>M₁₂ = M₂₁ ≡ M</Formula>
      <p className="mb-prose-3">
        The symmetry is not obvious from the definition. It comes from energy conservation: the
        total magnetic energy stored in the joint field — computed as the volume integral of
        B²/(2µ₀) — can be expanded in two equivalent ways, one starting with "build up I₁ first,
        then I₂", the other reversing the order. The two bookkeeping orders have to give the same
        total energy, and the cross-term that survives ties M₁₂ to M₂₁ in one step
        <Cite id="feynman-II-17" in={SOURCES} />. It's the most elegant proof in two-coil magnetics,
        and it's also why you don't have to worry which coil you "call" coil 1: M is M either way.
      </p>

      <MutualInductanceTwoCoilsDemo />

      <p className="mb-prose-3">
        From outside the magnetics, the operational definition is simpler still: drive a known
        dI₁/dt in coil 1, measure the open-circuit voltage on coil 2, and the ratio is M:
      </p>
      <Formula>v₂(t) = M dI₁/dt &nbsp;(open-circuit on coil 2)</Formula>
      <p className="mb-prose-3">
        That equation is the entire physical reason the demo at the top of the chapter works. The Qi
        charger oscillates a current at ~150 kHz in its primary; the phone's secondary, sitting a
        few millimetres above the pad, sees a voltage{' '}
        <strong className="text-text font-medium">M dI₁/dt</strong> that the phone rectifies and
        feeds to the battery. The constant of proportionality is just M, and M depends entirely on
        how the two coils are aligned.
      </p>

      <TryIt
        tag="Try 22.1"
        question={
          <>
            Two coils have <strong className="text-text font-medium">L₁ = 4 mH</strong>,{' '}
            <strong className="text-text font-medium">L₂ = 9 mH</strong>, and a coupling coefficient{' '}
            <strong className="text-text font-medium">k = 0.5</strong>. Find M.
          </>
        }
        hint="M = k · √(L₁ L₂)."
        answer={
          <>
            <Formula>M = k · √(L₁ L₂) = 0.5 · √(4 mH · 9 mH) = 0.5 · 6 mH</Formula>
            <Formula>
              M = <strong className="text-text font-medium">3 mH</strong>
            </Formula>
            <p className="mb-prose-1 last:mb-0">
              k is the geometric coupling fraction, capped at 1;{' '}
              <em className="text-text italic">√(L₁L₂)</em> is the upper bound on M set by the
              self-inductances. Multiply the two and you get the actual mutual inductance
              <Cite id="hayt-kemmerly-durbin-2018" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2 className="chapter-h2">
        The coupling <em>coefficient</em> k
      </h2>

      <p className="mb-prose-3">
        Not every line of flux that coil 1 produces reaches coil 2. Some escape out the sides of
        coil 1 and return through the air without ever touching the second coil; some thread coil 2
        but then "leak" back out before completing the circuit; some never made it through the first
        coil at all. The fraction of coil 1's flux that actually links coil 2 is captured in a
        single dimensionless number — the{' '}
        <Term
          def={
            <>
              <strong className="text-text font-medium">coupling coefficient</strong> k — the
              dimensionless fraction of one coil's flux that threads the other. Between 0 (no
              coupling) and 1 (every flux line shared). k = M / √(L₁L₂).
            </>
          }
        >
          coupling coefficient
        </Term>{' '}
        <strong className="text-text font-medium">k</strong> — defined so that M sits as a fraction
        of its largest possible value:
      </p>
      <Formula>k = M / √(L₁ L₂)</Formula>
      <p className="mb-prose-3">
        Two questions immediately deserve an answer. Why the geometric mean √(L₁L₂) in the
        denominator? And why is 0 ≤ k ≤ 1 a hard bound?
      </p>
      <p className="mb-prose-3">
        Both come from energy. The total magnetic energy stored when both coils carry currents (with
        sign chosen so the mutual term is positive) is
      </p>
      <Formula>W = ½ L₁ I₁² + ½ L₂ I₂² + M I₁ I₂</Formula>
      <p className="mb-prose-3">
        That energy must be non-negative for <em className="text-text italic">any</em> choice of I₁
        and I₂, because magnetic energy is the volume integral of B²/2µ₀ and B² ≥ 0 everywhere.
        Treat the right-hand side as a quadratic form in (I₁, I₂) and demand it stays non-negative:
        the algebraic condition is exactly M² ≤ L₁L₂, i.e., k² ≤ 1. That bound is Cauchy–Schwarz
        dressed up in magnetic-field clothes
        <Cite id="griffiths-2017" in={SOURCES} />
        <Cite id="jackson-1999" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        The{' '}
        <Term
          def={
            <>
              <strong className="text-text font-medium">perfect coupling</strong> — the k = 1 limit,
              where every line of flux that one coil produces threads the other coil exactly once.
              Achievable in the limit only; even a tight ferrite-core transformer is around k =
              0.99.
            </>
          }
        >
          perfect-coupling
        </Term>{' '}
        limit k = 1 corresponds to <em className="text-text italic">every</em> line of flux from one
        coil threading the other — geometrically, the two coils occupying exactly the same flux
        region. A tight ferrite-core transformer reaches k ≈ 0.99; an iron-core line-frequency
        transformer about 0.95–0.99; a typical air-core RF coil sits at 0.1–0.5; and a Qi charging
        pair, in normal use, runs in the 0.2–0.3 range
        <Cite id="hayt-kemmerly-durbin-2018" in={SOURCES} />. 13.56 MHz RFID is even looser — k can
        be below 0.05 — and the only reason such weak coupling delivers any usable power at all is
        that both sides are tuned to resonance, multiplying the effective coupling by the circuit's
        quality factor Q.
      </p>

      <CouplingCoefficientDemo />

      <Pullout>
        Every coil pair lives somewhere on a single one-dimensional axis from k = 0 (nothing shared)
        to k = 1 (everything shared). All of transformers, wireless charging, RFID, and current
        probes is figuring out where on that axis you are — and what to do about it.
      </Pullout>

      <TryIt
        tag="Try 22.2"
        question={
          <>
            Two coils have <strong className="text-text font-medium">L₁ = 1 mH</strong> and{' '}
            <strong className="text-text font-medium">L₂ = 4 mH</strong>, wound so that k = 1
            (perfectly coupled — a hypothetical ideal). What is M?
          </>
        }
        hint="M = k · √(L₁L₂); set k = 1."
        answer={
          <>
            <Formula>
              M<sub>max</sub> = √(L₁L₂) = √(1 mH · 4 mH) = √4 mH
            </Formula>
            <Formula>
              M<sub>max</sub> = <strong className="text-text font-medium">2 mH</strong>
            </Formula>
            <p className="mb-prose-1 last:mb-0">
              No real pair of coils achieves k = 1 exactly — there is always some leakage. But this
              is the upper bound any pair with these self-inductances{' '}
              <em className="text-text italic">could</em> have, and ferrite-cored RF transformers
              get within 1 % of it
              <Cite id="hayt-kemmerly-durbin-2018" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2 className="chapter-h2">
        Two-coil circuit <em>equations</em>
      </h2>

      <p className="mb-prose-3">
        Now both coils are alive, both carrying currents I₁(t) and I₂(t) that can vary independently
        in time. What voltage appears across each coil's terminals? Each coil sees two sources of
        changing flux at once: its own current's contribution (the self-inductance term) and the
        partner's contribution (the mutual term). By superposition — Maxwell's equations are linear,
        so flux superposes whenever currents do — the total flux linkage in coil 1 is L₁ I₁ + M I₂,
        and the total in coil 2 is L₂ I₂ + M I₁. Differentiate and (taking the passive-sign
        convention where v = +L dI/dt across an inductor):
      </p>
      <Formula>v₁ = L₁ dI₁/dt ± M dI₂/dt</Formula>
      <Formula>v₂ = L₂ dI₂/dt ± M dI₁/dt</Formula>
      <p className="mb-prose-3">
        The ± is doing real work. Each coil sees its own self-term (always positive in this sign
        convention) plus a mutual term whose sign depends on how the coils are wound relative to
        each other. If the two windings encircle the shared flux in the{' '}
        <em className="text-text italic">same</em> direction, an increase in I₂ adds flux through
        coil 1 in the
        <em className="text-text italic"> same</em> sense as I₁'s own contribution; mutual term
        takes the plus sign. If the windings encircle the shared flux in{' '}
        <em className="text-text italic">opposite</em> directions, increasing I₂ subtracts flux from
        coil 1's self-flux; mutual term takes the minus sign
        <Cite id="hayt-kemmerly-durbin-2018" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        The sign of M is not a physical degree of freedom — M is defined by convention as a positive
        number. What flips is the sign of the{' '}
        <em className="text-text italic">mutual contribution</em> in each coil's KVL equation. To
        resolve it without drawing the helix of each winding, engineers use a one-symbol shortcut:
        the dot.
      </p>

      <h2 className="chapter-h2">
        The dot <em>convention</em>
      </h2>

      <p className="mb-prose-3">
        Mark one terminal of each coil with a small filled dot. The{' '}
        <Term
          def={
            <>
              <strong className="text-text font-medium">dot convention</strong> — a schematic
              notation where each coil has a dotted terminal. Currents entering BOTH coils at their
              dotted terminals give fluxes that add. Lets engineers encode winding direction on a
              flat schematic without drawing the helix.
            </>
          }
        >
          dot convention
        </Term>{' '}
        rule is simple
        <Cite id="hayt-kemmerly-durbin-2018" in={SOURCES} />
        <Cite id="irwin-circuit-analysis-2015" in={SOURCES} />:
      </p>
      <ul>
        <li>
          If the reference currents enter <em className="text-text italic">both</em> coils at their
          dotted terminals, the mutual flux <strong className="text-text font-medium">adds</strong>{' '}
          to the self-flux: the mutual term is <em className="text-text italic">+M dI/dt</em>.
        </li>
        <li>
          If one reference current enters at its dot and the other enters at its non-dotted
          terminal, the mutual flux <strong className="text-text font-medium">opposes</strong>: the
          mutual term is <em className="text-text italic">−M dI/dt</em>.
        </li>
      </ul>
      <p className="mb-prose-3">
        Intuitively, the dot tells you which way the coil is wound. Two coils wound the same way
        (think: both clockwise as seen from above) and carrying currents in the same direction
        produce magnetic fields in the same direction — the fluxes add. Two coils wound oppositely
        (one clockwise, one counter-clockwise) carrying currents in the same direction produce
        fields pointing opposite ways — the fluxes subtract. The dot is a compact way to encode
        "wound this way vs. that way" on a flat schematic, without redrawing the helix every time
        <Cite id="irwin-circuit-analysis-2015" in={SOURCES} />.
      </p>

      <DotConventionDemo />

      <p className="mb-prose-3">
        Practical wiring note: in a real transformer or coupled-inductor part, the{' '}
        <Term
          def={
            <>
              <strong className="text-text font-medium">aiding/opposing</strong> — the two ways two
              coupled coils can be wired in a circuit. "Aiding": currents enter at both dots; fluxes
              add; series inductance = L₁ + L₂ + 2M. "Opposing": currents enter on opposite sides;
              fluxes subtract; series inductance = L₁ + L₂ − 2M.
            </>
          }
        >
          aiding
        </Term>{' '}
        configuration corresponds to crossing zero windings between the two coils; the opposing
        configuration corresponds to crossing one winding. "Dot reversal" in field-work language
        just means swapping the leads of one coil — physically a tiny change, but it flips the sign
        of every mutual term in the circuit, and with it the direction of every reflected voltage
        and current. Lots of debugging time has been spent on installed transformers that ended up
        with their secondary wired backwards, producing 0 V on a load that expected 240 V
        <Cite id="horowitz-hill-2015" in={SOURCES} />.
      </p>

      <h2 className="chapter-h2">
        Series and parallel <em>coupled</em> coils
      </h2>

      <p className="mb-prose-3">
        Connect the two coils in series. Now the same current{' '}
        <strong className="text-text font-medium">I</strong> flows through both — so I₁ = I₂ = I.
        Stack the two coil equations together and you get the equivalent inductance:
      </p>
      <Formula>
        L<sub>eq</sub> = L₁ + L₂ + 2M &nbsp;(series aiding)
      </Formula>
      <Formula>
        L<sub>eq</sub> = L₁ + L₂ − 2M &nbsp;(series opposing)
      </Formula>
      <p className="mb-prose-3">
        Where does the factor of 2 come from? It's the same place the cross-term in (a + b)² comes
        from. The energy stored in the joint field is ½ L<sub>eq</sub> I², and that has to equal the
        sum of self-energies plus the mutual cross-energy:
      </p>
      <Formula>
        ½ L<sub>eq</sub> I² = ½ L₁ I² + ½ L₂ I² + M I·I
      </Formula>
      <p className="mb-prose-3">
        Cancel the common I² and the L₁ + L₂ + 2M form just falls out. The "2" comes from coil 1
        doing work on coil 2's flux <em className="text-text italic">and</em> coil 2 doing work on
        coil 1's flux — same energy, counted twice over because both contributions are physically
        present. Reverse one winding (opposing configuration) and the cross-term flips sign, giving
        the minus version
        <Cite id="hayt-kemmerly-durbin-2018" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        This pair of formulas has a working-engineer bonus:{' '}
        <strong className="text-text font-medium">they let you measure M directly</strong>. Wire the
        two coils in series, measure L<sub>aid</sub> with an LCR meter; reverse one coil's leads,
        measure L<sub>opp</sub>; subtract
        <Cite id="irwin-circuit-analysis-2015" in={SOURCES} />:
      </p>
      <Formula>
        M = ( L<sub>aid</sub> − L<sub>opp</sub> ) / 4
      </Formula>
      <p className="mb-prose-3">
        Two measurements, one subtraction, no flux integral. It's the standard bench technique, and
        it's the cleanest way to characterise an unknown coupled-inductor part.
      </p>

      <SeriesCoupledMeasureMDemo />

      <TryIt
        tag="Try 22.3"
        question={
          <>
            Two coils with <strong className="text-text font-medium">L₁ = 4 mH</strong>,{' '}
            <strong className="text-text font-medium">L₂ = 9 mH</strong>,{' '}
            <strong className="text-text font-medium">M = 3 mH</strong> are connected in series.
            Find L<sub>eq</sub> in both the aiding and opposing configurations, then verify that M =
            (L<sub>aid</sub> − L<sub>opp</sub>) / 4.
          </>
        }
        hint="Aiding: L₁ + L₂ + 2M. Opposing: L₁ + L₂ − 2M."
        answer={
          <>
            <Formula>
              L<sub>aid</sub> = 4 + 9 + 2·3 ={' '}
              <strong className="text-text font-medium">19 mH</strong>
            </Formula>
            <Formula>
              L<sub>opp</sub> = 4 + 9 − 2·3 ={' '}
              <strong className="text-text font-medium">7 mH</strong>
            </Formula>
            <Formula>
              (L<sub>aid</sub> − L<sub>opp</sub>) / 4 = (19 − 7) / 4 = 3 mH ✓
            </Formula>
            <p className="mb-prose-1 last:mb-0">
              Exactly the M we started with. This identity is the basis for every bench measurement
              of mutual inductance taught in undergraduate circuits labs
              <Cite id="hayt-kemmerly-durbin-2018" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2 className="chapter-h2">
        Reflected impedance and the T-<em>equivalent</em>
      </h2>

      <p className="mb-prose-3">
        Now wire it up like a transformer: AC source on the primary at angular frequency ω,
        secondary closed by a load impedance Z<sub>L</sub>. Working entirely in the phasor
        (frequency-domain) picture from Ch.12, the two coil equations become
      </p>
      <Formula>V₁ = jωL₁ I₁ + jωM I₂</Formula>
      <Formula>
        V₂ = jωL₂ I₂ + jωM I₁ = − Z<sub>L</sub> I₂
      </Formula>
      <p className="mb-prose-3">
        (The second equation's last form uses the passive-sign convention on the load: V₂ across the
        secondary drives a current −I₂ through Z<sub>L</sub>.) Solve the second equation for I₂ in
        terms of I₁:
      </p>
      <Formula>
        I₂ = − jωM I₁ / ( jωL₂ + Z<sub>L</sub> )
      </Formula>
      <p className="mb-prose-3">
        Substitute back into the first equation and divide by I₁. What survives is the{' '}
        <Term
          def={
            <>
              <strong className="text-text font-medium">reflected impedance</strong> — the impedance
              that the secondary's load appears to add to the primary side. Z_refl = (ωM)² / Z₂,
              where Z₂ is the secondary's total impedance. Lets you analyse the primary side without
              solving the secondary explicitly.
            </>
          }
        >
          reflected impedance
        </Term>{' '}
        — the load Z<sub>L</sub> as seen from the primary terminals
        <Cite id="hayt-kemmerly-durbin-2018" in={SOURCES} />:
      </p>
      <Formula>
        Z<sub>in</sub> = V₁ / I₁ = jωL₁ + (ωM)² / ( jωL₂ + Z<sub>L</sub> )
      </Formula>
      <p className="mb-prose-3">
        Two pieces, both physical. The first piece,{' '}
        <strong className="text-text font-medium">jωL₁</strong>, is the primary's own
        self-inductance — what the source would see if the secondary were open-circuit (no I₂ to
        oppose). The second piece,
        <strong className="text-text font-medium"> (ωM)² / Z₂</strong>, is what the secondary's load
        "shows up as" on the primary side. Two things to notice about its form. First, the numerator
        is (ωM)² — squared, because the coupling acts <em className="text-text italic">twice</em>:
        once when I₁'s changing flux induces V₂, and once again when the resulting I₂ induces a
        back-voltage in coil 1. Each pass picks up a factor of ωM, and the two passes multiply.
        Second, the denominator is the secondary's <em className="text-text italic">total</em>{' '}
        impedance jωL₂ + Z<sub>L</sub>, not just Z<sub>L</sub> — because I₂ has to flow through L₂
        as well as Z<sub>L</sub> on its way around the secondary loop
        <Cite id="irwin-circuit-analysis-2015" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        The shape of this equation explains a tonne of practical behaviour. Short the secondary (Z
        <sub>L</sub> → 0): the denominator shrinks toward jωL₂, the reflected piece grows large, and
        the primary draws a large current — which is exactly what makes a shorted transformer
        dangerous. Open the secondary (Z<sub>L</sub> → ∞): the denominator blows up, the reflected
        piece vanishes, and the primary degenerates back to just jωL₁ — only the small magnetising
        current flows. The whole range of transformer behaviour lives between these two limits.
      </p>

      <ReflectedImpedanceDemo />

      <TryIt
        tag="Try 22.4"
        question={
          <>
            A coupled pair runs at <strong className="text-text font-medium">ω = 10⁶ rad/s</strong>{' '}
            with <strong className="text-text font-medium">M = 1 mH</strong>. The secondary is
            closed by a pure resistive load{' '}
            <strong className="text-text font-medium">
              Z<sub>L</sub> = 50 Ω
            </strong>
            , and L₂ is small enough that ωL₂ ≪ 50 Ω. Estimate the reflected impedance seen at the
            primary.
          </>
        }
        hint="Z_reflected ≈ (ωM)² / Z_L when ωL₂ is negligible."
        answer={
          <>
            <Formula>ωM = 10⁶ · 10⁻³ = 1000 Ω</Formula>
            <Formula>
              Z<sub>refl</sub> ≈ (ωM)² / Z<sub>L</sub> = (1000)² / 50
            </Formula>
            <Formula>
              Z<sub>refl</sub> ≈ <strong className="text-text font-medium">20 kΩ</strong>
            </Formula>
            <p className="mb-prose-1 last:mb-0">
              From the source's perspective, the 50 Ω secondary load looks like a 20 kΩ load on the
              primary side — the (ωM)² in the numerator multiplies the apparent impedance by a
              factor of 400. Transformer-based impedance matching is exactly this trick used
              deliberately
              <Cite id="horowitz-hill-2015" in={SOURCES} />.
            </p>
          </>
        }
      />

      <p className="mb-prose-3">
        There's a second tool worth knowing: any two coupled coils can be redrawn as three{' '}
        <em className="text-text italic">uncoupled</em>
        inductors arranged in a "T" shape — L₁ − M on the left arm, L₂ − M on the right arm, and M
        as the vertical stem joining them at the centre node. The same external V–I behaviour at
        both ports; no dots, no mutual terms, just three plain inductors. Once you have the T-model,
        every linear circuit method from Chapter 13 (mesh, nodal, superposition, Thévenin) works
        directly on it
        <Cite id="hayt-kemmerly-durbin-2018" in={SOURCES} />. Two coupled coils with five free
        variables (L₁, L₂, M, plus the two port voltages) collapse to three uncoupled inductors and
        the same KVL/KCL you've been writing since Chapter 12.
      </p>
      <p className="mb-prose-3">
        The T-equivalent has one practical wrinkle: one of the arm inductances (L₁ − M or L₂ − M)
        can come out
        <em className="text-text italic"> negative</em> if k is large enough. That's fine on paper —
        the algebra works — but it means the T-model is a mathematical equivalent, not a physical
        circuit you could build with three off-the-shelf inductors. For most analysis purposes the
        algebraic equivalence is what you need; for fabrication, you'd actually wind a coupled
        inductor.
      </p>

      <h2 className="chapter-h2">
        What we have so <em>far</em>
      </h2>

      <p className="mb-prose-3">
        Self-inductance L is one coil reacting to its own current. Mutual inductance M is one coil
        reacting to another coil's current — same units, same equation, different role. The fraction
        of one coil's flux that actually links the other is the coupling coefficient k = M /
        √(L₁L₂), bounded between 0 and 1 by energy conservation. The dot convention puts a sign on
        the mutual term without redrawing the windings. Series aiding gives L₁ + L₂ + 2M; opposing
        gives L₁ + L₂ − 2M; subtracting the two and dividing by four is the cleanest way to measure
        M. From the primary's terminals, a load on the secondary looks like a reflected impedance
        (ωM)² / Z₂ in series with the primary's own jωL₁.
      </p>
      <p className="mb-prose-3">
        Three doors open from here. The first is Chapter 23, transformers, where we send k toward 1
        by wrapping both coils on a shared iron or ferrite core — and the awkward (ωM)² / Z₂
        reflected-impedance form collapses to the clean (N₁/N₂)² Z<sub>L</sub> "turns-ratio"
        relation. The second is wireless power: live with k well below 1, but compensate with high-Q
        resonant tuning on both sides so the effective coupling-times-quality product k²Q₁Q₂ ≫ 1 and
        the link still delivers useful power. The third is loose-coupled signal transfer (current
        probes, RFID, signal isolation transformers) where the magnitude of M is not the figure of
        merit — its <em className="text-text italic">linearity</em> and bandwidth are. We follow
        door 1 in the next chapter.
      </p>

      <CaseStudies
        intro={
          <>
            Four engineered systems, four very different values of k, all running the same
            coupled-circuit equations.
          </>
        }
      >
        <CaseStudy
          tag="Case 22.1"
          title="The Qi wireless charging coil pair"
          summary={
            <em className="text-text italic">
              Two flat spiral coils, three millimetres of air, a resonant compensation network on
              each side, fifteen watts across the gap.
            </em>
          }
          specs={[
            {
              label: 'Operating frequency',
              value: (
                <>
                  110–205 kHz (Qi 1.3 BPP/EPP) <Cite id="hayt-kemmerly-durbin-2018" in={SOURCES} />
                </>
              ),
            },
            { label: 'Coil-to-coil spacing', value: <>~3–8 mm</> },
            { label: 'Coupling coefficient k', value: <>~0.2–0.3 typical, lower if misaligned</> },
            { label: 'Resonant Q (each side)', value: <>~50–200</> },
            { label: 'Wall-to-battery efficiency', value: <>~60–80 %</> },
            { label: 'Delivered power (EPP)', value: <>up to 15 W</> },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            A Qi charger is a two-coil coupled link operating well below k = 1 and relying on
            resonance to make up the difference. Beneath the pad's surface sits a flat, multi-turn
            primary coil driven by power electronics at a frequency around 150 kHz; embedded in the
            back of the phone is a matched secondary coil tuned to the same frequency. The coupling
            coefficient between them, in normal use, sits in the 0.2–0.3 range — the rest of the
            primary's flux leaks into the surrounding air
            <Cite id="hayt-kemmerly-durbin-2018" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            What keeps the link viable at such a low k is high-Q resonant tuning on both sides: each
            coil is paired with a series or parallel compensation capacitor that pushes the loop
            impedance through zero at the operating frequency, and the effective
            coupling-times-quality product k²Q₁Q₂ ends up well above unity. Slide the phone an inch
            sideways and k drops by an order of magnitude; the same equation now predicts a sharp
            efficiency drop, which is what you see on the charger's "alignment indicator" LED. The
            whole user-visible behaviour of the charger is the equation
            <strong className="text-text font-medium">
              {' '}
              η = k²Q₁Q₂ / (1 + √(1 + k²Q₁Q₂))²
            </strong>{' '}
            made tangible
            <Cite id="irwin-circuit-analysis-2015" in={SOURCES} />.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 22.2"
          title="The clamp-on AC current probe"
          summary={
            <em className="text-text italic">
              The wire under test is a single-turn primary; the current you measure is what shows up
              on a many-turn secondary.
            </em>
          }
          specs={[
            { label: 'Primary', value: <>the wire under test (one turn through a ferrite ring)</> },
            { label: 'Secondary', value: <>typically 100–1000 turns wound on the ring</> },
            { label: 'Turns ratio', value: <>1:N (primary 1 turn; secondary N turns)</> },
            { label: 'Burden resistor', value: <>~0.1–10 Ω across the secondary</> },
            {
              label: 'Bandwidth',
              value: <>DC to MHz (with electronics); 50 Hz to kHz for passive types</>,
            },
            { label: 'Typical sensitivity', value: <>1 mV per A on the secondary side</> },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            A clamp-on current probe is a transformer in disguise. The current-carrying wire you
            snap the clamp around is the primary — a single-turn primary, threaded once through a
            split ferrite ring that normally surrounds it. Wound on the ferrite is a many-turn
            secondary closed by a small burden resistor. By the same flux-linkage argument that gave
            us M earlier in the chapter, the changing current in the single-turn primary induces a
            voltage in the secondary equal to{' '}
            <strong className="text-text font-medium">M dI₁/dt</strong>; the burden resistor
            converts that to a measurable signal proportional to dI₁/dt, which an integrating
            amplifier converts back to I₁
            <Cite id="horowitz-hill-2015" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            The probe never breaks the primary circuit; you never have to cut a wire. The price of
            that convenience is a coupling coefficient much less than 1 — the ferrite ring is
            closing only a fraction of the primary's flux path through the secondary turns — but
            that's irrelevant for a measurement instrument, where the figure of merit is linearity
            and bandwidth, not power transfer. A typical AC clamp meter can read kiloamp-scale
            primary currents while only ever exposing the user to a few volts on the secondary; this
            is the canonical example of using the equation{' '}
            <em className="text-text italic">v₂ = M dI₁/dt</em> backwards, as a non-contact sensor
            rather than a power conduit
            <Cite id="hayt-kemmerly-durbin-2018" in={SOURCES} />.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 22.3"
          title="13.56 MHz RFID — coupling with k ≪ 1"
          summary={
            <em className="text-text italic">
              A reader antenna and a tag antenna a few centimetres apart, exchanging digital data on
              a near-field carrier.
            </em>
          }
          specs={[
            { label: 'Carrier frequency', value: <>13.56 MHz (ISO/IEC 14443, 15693, NFC)</> },
            { label: 'Reader–tag separation', value: <>~0.5–10 cm</> },
            { label: 'Coupling coefficient k', value: <>~0.001–0.05</> },
            { label: 'Tag-side Q', value: <>30–60</> },
            { label: 'Delivered DC power to tag', value: <>~10 µW – a few mW</> },
            { label: 'Wavelength at 13.56 MHz', value: <>~22 m (near-field operation)</> },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            A passive RFID tag has no battery; everything it does — receive an interrogation, run
            its tiny logic block, modulate a reply — is powered by the magnetic field the reader
            puts up. The link is a coupled coil pair with k somewhere between 0.001 and 0.05
            depending on geometry, which sounds hopeless until you realise both coils are tuned to
            resonance at 13.56 MHz with Q ≈ 30–60. The effective coupling that matters for power
            transfer is k²Q₁Q₂, which can reach 0.5 or higher even at k = 0.05 — enough to deliver a
            few microwatts to the tag's rectifier and run a few thousand gates of logic on it
            <Cite id="hayt-kemmerly-durbin-2018" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            Note that the link is genuinely near-field: 13.56 MHz has a free-space wavelength of
            about 22 metres, and the coils sit a few centimetres apart — comfortably inside the
            reactive near-field region where the coupling is dominated by mutual inductance rather
            than radiated power. This is exactly the regime where the two-coil equations of this
            chapter are the right description, and where the propagation-language of Chapter 9
            (Poynting vector, far-field dipole pattern) would be the wrong one. The same physics
            drives every contactless transit card, every passport chip, and every smart-card payment
            terminal in commercial use today
            <Cite id="irwin-circuit-analysis-2015" in={SOURCES} />.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 22.4"
          title="The induction cooktop — your saucepan is the secondary"
          summary={
            <em className="text-text italic">
              A flat spiral coil under glass; the ferromagnetic base of the cookware completes the
              loop.
            </em>
          }
          specs={[
            { label: 'Drive frequency', value: <>20–100 kHz</> },
            { label: 'Per-burner power', value: <>1.5–3.7 kW</> },
            { label: 'Air gap (glass + base)', value: <>~5–8 mm</> },
            { label: 'Coupling coefficient', value: <>~0.4–0.7 when a steel pan is present</> },
            { label: 'End-to-end efficiency', value: <>~85–90 %</> },
            {
              label: 'Cookware requirement',
              value: <>ferromagnetic base (Fe or magnetic stainless)</>,
            },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            An induction hob is a coupled-coil system whose secondary is the pan sitting on top of
            it. Beneath the glass-ceramic surface, a flat spiral coil is driven at 20–100 kHz; the
            oscillating magnetic field passes through the (non-magnetic, non-conductive) glass and
            enters the iron base of the cookware. From the cooktop's electronics' point of view, the
            pan acts as a short-circuited secondary: a single-turn loop of high-permeability,
            finite-resistivity iron that draws large eddy currents from the changing flux
            <Cite id="hayt-kemmerly-durbin-2018" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            Those eddy currents are exactly the I₂ in our two-coil equations, except here I₂ flows
            in a bulk conductor rather than a wound coil; they dissipate as I²R heat inside the pan,
            which is the entire cooking mechanism. Lifting the pan off the burner removes the
            secondary; M plummets and the cooktop's primary draws almost no current (the reflected
            impedance vanishes), so the burner safely shuts down. Put an aluminium pan on the burner
            and you also lose almost all of the heating: aluminium is non-magnetic and lower in
            resistivity, so the coupling is weaker and the I²R dissipated in the pan is too small to
            cook. This is the same physics that makes "induction-compatible" the most important word
            on a cookware label
            <Cite id="irwin-circuit-analysis-2015" in={SOURCES} />.
          </p>
        </CaseStudy>
      </CaseStudies>

      <FAQ
        intro={
          <>
            Sharp questions readers keep asking about mutual inductance, the dot convention, the
            coupling coefficient, and the reflected-impedance machinery.
          </>
        }
      >
        <FAQItem q="Why is mutual inductance symmetric — i.e., M₁₂ = M₂₁?">
          <p>
            From energy conservation. The total magnetic energy stored when both coils carry
            currents I₁ and I₂ is
            <strong className="text-text font-medium"> W = ½ L₁ I₁² + ½ L₂ I₂² + M I₁ I₂</strong>,
            and this energy can be built up by ramping I₁ from zero to its final value first then
            ramping I₂, or by ramping I₂ first then I₁. The final stored energy has to be the same
            either way (energy is a state function), and the cross-term that survives the
            bookkeeping ties M₁₂ to M₂₁ in one step
            <Cite id="griffiths-2017" in={SOURCES} />
            <Cite id="feynman-II-17" in={SOURCES} />. It's the cleanest proof in two-coil magnetics
            — and it's why no engineer ever distinguishes M₁₂ from M₂₁ in practice.
          </p>
        </FAQItem>

        <FAQItem q="Why does the coupling coefficient k have an upper bound of 1?">
          <p>
            Because the total magnetic energy stored in the joint field is a non-negative quadratic
            form in (I₁, I₂):{' '}
            <strong className="text-text font-medium">W = ½ L₁ I₁² + ½ L₂ I₂² + M I₁ I₂ ≥ 0</strong>
            . The condition for that quadratic form to be non-negative for every choice of currents
            is exactly <strong className="text-text font-medium">M² ≤ L₁ L₂</strong>, i.e., k² ≤ 1.
            This is the Cauchy–Schwarz inequality in magnetic-field clothing: M is the geometric
            "inner product" between the two coils' fields, and the geometric mean of their
            self-coupling caps it from above
            <Cite id="jackson-1999" in={SOURCES} />. k = 1 corresponds to every flux line shared
            between the two coils — an idealised limit that no physical pair quite reaches.
          </p>
        </FAQItem>

        <FAQItem q="Can M be negative?">
          <p>
            By convention, no — M is defined as a non-negative number, the unsigned proportionality
            between flux linkage and current. What <em className="text-text italic">can</em> be
            negative is the mutual <em className="text-text italic">term</em> in a circuit equation:
            depending on dot convention (which way each coil is wound relative to the other), the
            mutual contribution to a coil's voltage can be either +M dI/dt or −M dI/dt. The "sign"
            lives in the wiring geometry, not in M itself. Old engineering texts occasionally write
            a signed "M" when they want to shortcut the dot, but the modern convention keeps M
            positive and lets the dot do the signing
            <Cite id="hayt-kemmerly-durbin-2018" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What is leakage inductance, and why does it matter?">
          <p>
            Leakage inductance is the portion of each coil's self-inductance that{' '}
            <em className="text-text italic">doesn't</em> couple to the other coil — concretely, the
            (1 − k) fraction of each L<sub>i</sub> whose flux lines never link the partner. From
            outside, leakage looks like a small inductance in series with each port of an
            ideal-transformer model
            <Cite id="hayt-kemmerly-durbin-2018" in={SOURCES} />. In a transformer it causes
            secondary voltage droop under load (a few percent in a well-built distribution unit) and
            limits the rate at which fault current can flow during a short — which is sometimes
            useful as built-in short-circuit protection
            <Cite id="horowitz-hill-2015" in={SOURCES} />. In a switching power supply, leakage
            inductance is the source of the high-voltage "leakage spike" that gets snubbed by an RCD
            network across the primary switch.
          </p>
        </FAQItem>

        <FAQItem q="How does a current transformer measure 1000s of amps without melting?">
          <p>
            By using a very large turns ratio. The current-carrying wire under test is the primary —
            usually a single pass through a toroidal ferrite core — and the secondary is many
            hundreds or thousands of turns wound on the same core. By the current-ratio relation{' '}
            <strong className="text-text font-medium">I₂/I₁ ≈ N₁/N₂</strong>, a 1000 A primary
            current at N₁ = 1 turn produces only 1 A on a secondary with N₂ = 1000 turns. That 1 A
            flowing through a small burden resistor (a few ohms) is what the meter reads
            <Cite id="hayt-kemmerly-durbin-2018" in={SOURCES} />. Crucially, the secondary must{' '}
            <em className="text-text italic">never</em> be left open-circuit while primary current
            flows — with no I₂ to oppose the primary's flux, the core saturates and the secondary
            develops hundreds or thousands of volts, which is genuinely dangerous
            <Cite id="horowitz-hill-2015" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why does my wireless charger get warm even when nothing is on it?">
          <p>
            Because the primary side has to keep running to wait for a phone to land on it — a
            low-power "ping" mode where the primary periodically energises the coil and looks for a
            tag-back signature from a compatible secondary
            <Cite id="hayt-kemmerly-durbin-2018" in={SOURCES} />. Even at low duty cycle, the
            switching losses in the primary FETs and the core losses in the ferrite shield add up to
            a few hundred milliwatts of standby dissipation. Stack a coin on the pad and you turn
            that "wait" state into a "loaded with eddy-current secondary" state — the coin warms up
            and the pad warms up faster, because the coin is now a (very lossy) secondary. The same
            physics as the induction-cooktop case study above, just with the wrong workpiece.
          </p>
        </FAQItem>

        <FAQItem q="What is the difference between &ldquo;coupled inductors&rdquo; and a &ldquo;transformer&rdquo;?">
          <p>
            Mostly nomenclature, and partly the design intent. A transformer is the large-L, near-k
            = 1 limit of coupled inductors: built to maximise mutual coupling, with both coils wound
            on a shared high-permeability core, and operating in the regime where the (N₁/N₂)²
            turns-ratio approximation is accurate to better than a percent
            <Cite id="horowitz-hill-2015" in={SOURCES} />. "Coupled inductors" is the catch-all term
            for the same physical object when k is intentionally lower and the self-inductance terms
            still matter: common-mode chokes in EMI filters, flyback transformers in switching
            supplies (which are technically coupled inductors storing energy in their air gap), and
            tightly coupled inductors in coupled-buck converters all live under this label. The
            equations are the same; only the design priorities differ.
          </p>
        </FAQItem>

        <FAQItem q="What physics forbids k = 1 exactly?">
          <p>
            Pure geometry. To have k = 1, every line of flux that one coil produces would have to
            pass through the other coil exactly once, with none leaking out the sides. For two
            physical coils with non-zero size, there is always{' '}
            <em className="text-text italic">some</em> flux escaping out the ends of the first
            coil's winding region before ever reaching the second's, so a small fraction of
            self-flux fails to link — and that's already enough to push k below 1
            <Cite id="griffiths-2017" in={SOURCES} />. Even an idealised toroid with both coils
            wound on the same core has a tiny stray field outside the toroid, and so still has k
            strictly less than 1. The best engineered ferrite-cored transformers come within 1 % of
            k = 1; the limit is approached but never reached.
          </p>
        </FAQItem>

        <FAQItem q="How does the T-equivalent help me analyse a coupled-coil circuit?">
          <p>
            It replaces the two-port coupled inductor with three{' '}
            <em className="text-text italic">uncoupled</em> inductors arranged in a T — L₁ − M on
            the left arm, L₂ − M on the right arm, M as the centre stem — and the same external V–I
            relationships at both ports
            <Cite id="hayt-kemmerly-durbin-2018" in={SOURCES} />. Once it's drawn in T form there
            are no dots, no mutual terms, no sign ambiguity; you just apply mesh or nodal analysis
            (Ch.13) directly. One catch: the algebra can make one of the arm inductances come out
            negative if k is large — that's mathematically fine but means the T-model is a paper
            equivalent, not a literal three-inductor circuit you could build in hardware
            <Cite id="irwin-circuit-analysis-2015" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Can I just stack two coils on top of each other and call it a transformer?">
          <p>
            For small signal, yes — that's an "air-core transformer", common in RF work and in
            vintage radio sets
            <Cite id="horowitz-hill-2015" in={SOURCES} />. But coupling will be loose (k typically
            below 0.3), leakage inductance will dominate, and there will be no soft-iron path to
            concentrate the flux into the secondary. The volt-second capacity per turn at line
            frequency will be small, so air-core transformers don't work for power conversion at
            50/60 Hz. Move to RF frequencies where ωL is large even for small L, or accept the
            inefficiency and add resonant compensation (as in a Tesla coil or a Qi pad), and
            air-core coupled coils become genuinely useful. For 60 Hz power transformers, the iron
            core is non-optional.
          </p>
        </FAQItem>

        <FAQItem q="What does &ldquo;dot reversal&rdquo; mean in practical wiring?">
          <p>
            It means swapping the two leads of one coil — physically a tiny change, schematically
            the same as moving the dot from one end to the other. It flips the sign of every mutual
            term in the circuit equations, which can be the difference between a transformer's
            secondary outputting +V and its secondary outputting −V, or between two cascaded
            transformers adding their voltages and subtracting them
            <Cite id="hayt-kemmerly-durbin-2018" in={SOURCES} />. In three-phase wiring it can take
            a balanced system to a violently unbalanced one. Many installation manuals call out
            winding polarity explicitly with labelled bushings (H1, H2 on the HV side; X1, X2 on the
            LV side) just so dot reversal is hard to commit by accident.
          </p>
        </FAQItem>

        <FAQItem q="Why does a transformer get hot when I short its secondary?">
          <p>
            Because the reflected impedance into the primary goes to (very nearly) zero. From the
            chapter's reflected-impedance result{' '}
            <strong className="text-text font-medium">
              Z<sub>in</sub> = jωL₁ + (ωM)²/(jωL₂ + Z<sub>L</sub>)
            </strong>
            , setting Z<sub>L</sub> → 0 leaves Z<sub>in</sub> = jωL₁ + (ωM)²/(jωL₂), which
            simplifies (in the high-k limit) to jωL₁(1 − k²) = jωL<sub>leak,1</sub> — only the small
            leakage inductance on the primary side limits the current
            <Cite id="hayt-kemmerly-durbin-2018" in={SOURCES} />. The primary draws huge current,
            the windings heat by I²R, and (if nothing trips) the insulation eventually fails
            <Cite id="horowitz-hill-2015" in={SOURCES} />. This is why every utility transformer has
            a short-circuit fault-current rating, and why every wall outlet sits behind a breaker
            that trips on tens of amps long before the upstream transformer notices anything.
          </p>
        </FAQItem>

        <FAQItem q="If M is symmetric, does that mean the two coils are interchangeable?">
          <p>
            For computing flux linkages, yes: M₁₂ = M₂₁, so it does not matter which coil you call
            "primary". For everything <em className="text-text italic">else</em> about a real
            transformer, no — the two coils may have very different self-inductances, very different
            turn counts, very different copper cross-sections, and very different voltage and
            current ratings. M describes only the cross-coupling between the two, not the
            asymmetries in their construction
            <Cite id="griffiths-2017" in={SOURCES} />. In a 240 V to 12 V step-down transformer, L₁
            and L₂ differ by a factor of 400 (the turns ratio squared); M sits between them.
          </p>
        </FAQItem>

        <FAQItem q="What is the &ldquo;magnetising current&rdquo;, and why does an open-circuit transformer still draw some primary current?">
          <p>
            Even with no secondary load, the primary has to push{' '}
            <em className="text-text italic">some</em> current to establish the alternating flux in
            the core. By Faraday's law, the applied primary voltage equals N₁ dΦ/dt, so the flux has
            to swing — and a real core has finite permeability, so a small current is required to
            set up that flux
            <Cite id="feynman-II-17" in={SOURCES} />. That current is the{' '}
            <Term
              def={
                <>
                  <strong className="text-text font-medium">magnetising current</strong> — the small
                  primary current required to establish the core flux even with no load on the
                  secondary. Sets the no-load draw of a real transformer; ideally would be zero.
                </>
              }
            >
              magnetising current
            </Term>
            , and it's roughly 1–5 % of rated full-load current for a well-built power transformer.
            It's mostly reactive (90° behind the applied voltage), so it dissipates little real
            power — most of the no-load loss comes from core hysteresis and eddy currents, not from
            I²R in the magnetising current itself
            <Cite id="horowitz-hill-2015" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Is the T-equivalent unique?">
          <p>
            No — there are several network equivalents for a pair of coupled coils. The T-equivalent
            (L₁ − M and L₂ − M on the arms, M on the stem) is the most common because it shows the
            coupling as a single shared inductor, which matches the physical intuition that the
            mutual term is what links the two circuits
            <Cite id="hayt-kemmerly-durbin-2018" in={SOURCES} />. A Π (pi) equivalent and an
            ideal-transformer-plus-leakage-and-magnetising form are also in common use; the
            ideal-transformer form is the right model for explaining the (N₁/N₂)² turns-ratio
            behaviour of Chapter 23. All three give identical external V–I behaviour; they just
            package the same physics in different shapes.
          </p>
        </FAQItem>

        <FAQItem q="What's the practical upper frequency for two-coil coupling?">
          <p>
            Coupled-inductor designs work cleanly up to tens of MHz with air or ferrite cores;
            specialty parts extend to a few hundred MHz
            <Cite id="horowitz-hill-2015" in={SOURCES} />. Above that, stray capacitance between
            turns and between windings starts to dominate the response, the coil self-resonates with
            its own parasitic C, and the simple inductive picture from this chapter breaks down —
            you end up doing distributed-element analysis (transmission-line transformers, Chapter
            16) instead of lumped coupled inductors. The very fact that the breakdown happens is
            also why the Qi pad runs at ~150 kHz and the RFID reader at 13.56 MHz: comfortably below
            the self-resonant frequency of the coils, where the two-coil equations of this chapter
            still describe everything to engineering accuracy
            <Cite id="hayt-kemmerly-durbin-2018" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="How fast does coupling &ldquo;communicate&rdquo;? Is the secondary's response instantaneous?">
          <p>
            No — it propagates at the speed of light. The chapter's mutual-inductance picture is a
            quasi-static approximation that's accurate when the physical size of the coupled system
            is much smaller than the wavelength c/f at the operating frequency
            <Cite id="maxwell-1865" in={SOURCES} />. For a Qi pad at 150 kHz, the wavelength is 2 km
            and the coils are centimetres apart — quasi-static is exact to astronomical precision.
            For 13.56 MHz RFID, λ = 22 m and gaps are centimetres — still safely near-field. Only
            when the coil pair starts to approach a wavelength in size do the displacement-current
            terms of Chapter 9 (Maxwell's correction to Ampère) become important, and the device
            transitions from "coupled inductor" to "antenna pair"
            <Cite id="maxwell-1873" in={SOURCES} />. Most of practical coupled-circuit engineering
            lives comfortably in the quasi-static regime.
          </p>
        </FAQItem>
      </FAQ>
    </ChapterShell>
  );
}
