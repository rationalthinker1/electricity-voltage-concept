/**
 * Chapter 28 — Inside the panel
 *
 * The second chapter of the applied house-electricity track. Picks up where
 * Ch.27 leaves off — 240 V split-phase has just arrived at the meter base —
 * and opens the cover on the main service panel. The argument: the panel
 * is just two bus bars, two phases, a neutral bar, a ground bar, and a stack
 * of breakers, but those six pieces of metal encode every safety rule in the
 * dwelling-unit chapter of the NEC. Six H2 sections walk through anatomy,
 * the alternating-phase bus geometry, the three breaker species
 * (thermal-magnetic, GFCI, AFCI), interrupting ratings and arc-flash energy,
 * the bonding-and-grounding logic, and the no-bond rule at every sub-panel.
 *
 * No new demo components — the previous chapter's circuit-builder demo
 * is the natural place to wire one of these breakers up; this chapter
 * is prose-heavy and diagram-light by design.
 */
import { CaseStudies, CaseStudy } from '@/components/CaseStudy';
import { ChapterShell } from '@/components/ChapterShell';
import { FAQ, FAQItem } from '@/components/FAQ';
import { Cite } from '@/components/SourcesList';
import { Formula, InlineMath } from '@/components/Formula';
import { Pullout } from '@/components/Prose';
import { Term } from '@/components/Term';
import { TryIt } from '@/components/TryIt';
import { PanelBus3DDemo } from './demos/PanelBus3D';
import { getChapter } from './data/chapters';

export default function Ch28HousePanel() {
  const chapter = getChapter('house-panel')!;
  const SOURCES = chapter.sources;

  return (
    <ChapterShell chapter={chapter}>
      <p className="chapter-intro">
        Open the cover of a residential service panel and the first thing you notice is how few moving parts there are.
        Two vertical copper bars run down the middle. A row of black plastic breakers snaps onto them, one above the
        next. Along each side wall a horizontal copper strip with a line of screw terminals waits to receive small
        wires; one of those strips is the neutral bar, the other the ground bar. Thick service conductors enter from
        the top and bolt to a big two-pole breaker at the head of the column — that is the main disconnect, the
        switch that turns the whole house off. Out the bottom of every other breaker, a hot wire fans into the
        building.
      </p>
      <p className="mb-prose-3">
        Three rules govern the whole geometry, and they are worth stating up front because every subsequent paragraph
        of this chapter is just a consequence of one of them. <strong className="text-text font-medium">Every breaker sits between a hot service
        conductor and one of the two bus bars.</strong> <strong className="text-text font-medium">Every white wire lands on the neutral bar; every
        green or bare wire lands on the ground bar.</strong> <strong className="text-text font-medium">The neutral bar and the ground bar are
        connected to each other in exactly one place — at the main disconnect — and never again.</strong> Get those
        right and the panel will fail safely under every fault the building is likely to see; get one of them
        wrong and the failure mode is a fire or a corpse. The NEC's Article 408 spells the rules out in legalese,
        but they are recognisably the same three sentences<Cite id="nec-2023" in={SOURCES} />.
      </p>

      <h2 className="chapter-h2">Anatomy of the panel</h2>

      <p className="mb-prose-3">
        At the top of the enclosure, two heavy aluminium or copper conductors come in from the meter base — these are
        the two ungrounded service conductors, usually called L1 and L2, each at 120 V relative to the neutral and
        180° out of phase with each other (Ch.27). They bolt to the two line-side lugs of the
        {' '}<Term def={<><strong className="text-text font-medium">main disconnect</strong> — the breaker (or fused switch) at the head of the service panel that interrupts both ungrounded conductors at once. For a 200 A residential service it is a two-pole 200 A breaker. NEC 230 requires it to be readily accessible and labelled.</>}>main disconnect</Term>,
        a two-pole breaker that, in a typical North-American single-family service, is rated for 100 A, 150 A, or
        200 A<Cite id="nec-2023" in={SOURCES} />. Pull its handle to OFF and the entire panel — every branch
        circuit, every outlet, every appliance — drops out at once. The service-entrance neutral and the bare
        grounding-electrode conductor arrive on separate terminals near the top, the first landing on the neutral
        bar, the second on the ground bar (or, equivalently, on a stud welded to the inside of the steel can).
      </p>
      <p className="mb-prose-3">
        Below the main, the load side of the disconnect feeds the two
        {' '}<Term def={<><strong className="text-text font-medium">bus bar</strong> — the long vertical copper or aluminium conductor inside a panel that distributes one phase of the service to a column of breakers. A 200 A residential panel has two bus bars (L1 and L2), each carrying up to 200 A continuous.</>}>bus bars</Term>{' '}
        that run vertically down the centre of the can. Each bus bar is a stamped piece of plated copper or
        tin-plated aluminium maybe a centimetre wide, with a row of slotted fingers — the bus stabs — projecting
        sideways at regular intervals. A breaker is just a clip that grabs one of those stabs, makes contact, and
        gives you a screw terminal on its load side to attach the branch-circuit hot wire.
      </p>
      <p className="mb-prose-3">
        Along each side wall sits a long terminal strip:
        the {' '}<Term def={<><strong className="text-text font-medium">neutral bar</strong> — the terminal strip in a panel that receives every white (grounded) conductor from every branch circuit. At the main disconnect it is bonded to the panel can by the main bonding jumper; at every sub-panel it must float relative to the can.</>}>neutral bar</Term>,
        which receives every white wire from every branch circuit, and the separate
        {' '}<Term def={<><strong className="text-text font-medium">ground bar</strong> — the terminal strip in a panel that receives every green or bare equipment-grounding conductor from every branch circuit. Always bonded to the panel can. At the main disconnect it shares a connection with the neutral bar through the main bonding jumper; at a sub-panel it does not.</>}>ground bar</Term>,
        which receives every bare or green equipment-grounding conductor. In the main panel the two bars are
        electrically tied together through a short heavy strap called the
        {' '}<Term def={<><strong className="text-text font-medium">main bonding jumper</strong> — the conductor (a green screw, a wire, or a metal strap) that connects the neutral bar to the panel enclosure and the ground bar at the service entrance. NEC 250 requires exactly one such bond in the entire premises wiring system, at the first means of disconnect.</>}>main bonding jumper</Term>{' '}
        (often just a green-painted screw threaded through the neutral bar into the steel can), and the panel can
        itself is grounded to a copper-clad rod driven into the earth<Cite id="nec-2023" in={SOURCES} />. From that
        single bonding point onward, neutral and ground are kept rigorously separate throughout the rest of the
        building.
      </p>
      <p className="mb-prose-3">
        Finally, the door of the panel has — or is supposed to have — a printed
        {' '}<Term def={<><strong className="text-text font-medium">panel directory</strong> — the printed card or label on the inside of the panel door that lists every breaker by slot number and identifies which loads it feeds. NEC 408.4 makes the directory mandatory and requires it to be legible and accurate.</>}>panel directory</Term>{' '}
        listing each breaker by slot number and the loads it feeds. NEC 408.4 makes that label
        mandatory<Cite id="nec-2023" in={SOURCES} />. An accurate directory is the single most useful piece of
        paper in the building when you need to turn off the right circuit at three in the morning.
      </p>

      <h2 className="chapter-h2">The bus bars and why phases <em>alternate</em></h2>

      <p className="mb-prose-3">
        Look at a panel from the front with the cover off. The slot stampings on the deadfront — the metal cover with
        the breaker windows — read 1, 3, 5, 7… down the left column and 2, 4, 6, 8… down the right, but the
        important pattern is the one stamped on the bus itself: L1, L2, L1, L2, L1, L2 as you read straight down a
        single column. The bus stabs are not all the same orientation. Adjacent stabs on one bus rotate 180°
        between slots so that a single-pole breaker clicked into slot 1 grabs L1, the breaker just below it in
        slot 3 grabs L2, the next one in slot 5 grabs L1 again, and so on<Cite id="nema-ab-1" in={SOURCES} />.
        Schneider's Square D QO load-centre catalog shows the geometry in fine detail: each bus is a continuous
        copper plate with offset fingers stamped along its
        length<Cite id="square-d-qo-datasheet" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        Now consider a 240 V breaker — a
        {' '}<Term def={<><strong className="text-text font-medium">two-pole breaker</strong> — a breaker that occupies two adjacent panel slots and grabs one bus stab from each bus (L1 and L2). Internally the two trip mechanisms are tied together so that a fault on either pole opens both. The standard way to feed a 240 V appliance.</>}>two-pole breaker</Term>{' '}
        with one fat handle that ties two internal trip mechanisms together. It physically spans two adjacent slots
        in the panel. Because adjacent slots see opposite phases, a two-pole breaker automatically taps L1 on one
        side and L2 on the other, giving you both phases of the split-phase service for free<Cite id="nema-ab-1" in={SOURCES} />.
        The voltage between those two stabs is the difference of the two phase voltages,
      </p>
      <Formula tex="V_{LL} = V_{L1} - V_{L2} = (+120) - (-120) = 240\\ \\text{V}" />
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">V<sub>LL</sub></strong> is the line-to-line voltage between the two ungrounded bus bars (in
        volts RMS), <strong className="text-text font-medium">V<sub>L1</sub></strong> is the instantaneous voltage of bus L1 measured with respect to
        the centre-tap neutral (peak ≈ +170 V; RMS ≈ +120 V at the positive crossing), and
        <strong className="text-text font-medium"> V<sub>L2</sub></strong> is the corresponding voltage of bus L2 referenced to the same neutral.
        L1 and L2 are exactly 180° out of phase because they come from opposite ends of the centre-tapped secondary
        winding of the utility transformer (Ch.27): when one terminal is at its positive peak the other is at its
        negative peak. The difference is therefore twice 120 V RMS, or 240 V<Cite id="nec-2023" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        This is why every two-pole 240 V load in the house — the electric range, the dryer, the heat pump, the EV
        charger — slots into the panel without any neutral required for the high-power half of the appliance.
        The two hots already give it 240 V between them. A neutral is added only if the appliance has a 120 V
        sub-circuit inside it (a clock, a control board, an LED display); pure-240 V loads like baseboard heaters
        and old-style ranges run on just the two hots and a ground.
      </p>

      <TryIt
        tag="Try 28.1"
        question={
          <>A residential panel has <strong className="text-text font-medium">30 breaker slots</strong> arranged in two columns of 15. How many 240 V
          double-pole breakers can it hold simultaneously, assuming you fill the panel entirely with two-pole breakers
          and never leave a slot pair unused?</>
        }
        hint={<>Each two-pole breaker spans two adjacent slots in one column and grabs both L1 and L2 from the
        alternating bus stamping.</>}
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">
              Each two-pole breaker occupies two adjacent vertical slots in one column. A column of 15 slots holds 7
              full pairs with one slot left over; with two columns that is 14 two-pole breakers total, plus two
              orphan slots that can take a single-pole 120 V breaker each — or a single tandem.
            </p>
            <Formula tex="N_{\\text{2-pole}} = 2\\ \\text{columns} \\times \\lfloor 15/2 \\rfloor = 2 \\times 7 = 14" />
            <p className="mb-prose-1 last:mb-0">
              Answer: <strong className="text-text font-medium">14 two-pole 240 V breakers</strong>, with two leftover slots for 120 V branch circuits.
            </p>
          </>
        }
      />

      <p className="mb-prose-3">
        The two-column / alternating-phase geometry is much easier to read in 3D
        than in prose. Drag to orbit the cutaway below: L1 (pink) and L2 (blue) bus
        bars run the full height of the enclosure, with alternating stabs poking
        out for each slot. The single-pole breakers each take one stab — one phase.
        The 2-pole 240 V breaker straddles two adjacent stabs of opposite phase.
        The neutral and ground bars sit at the bottom, joined by the main bonding
        jumper exactly once.
      </p>

      <PanelBus3DDemo />

      <h2 className="chapter-h2">The three breaker species: standard, GFCI, AFCI</h2>

      <p className="mb-prose-3">
        From the outside every breaker looks the same — a black plastic case, a single or double switch handle,
        a current rating stamped on the front. The internals are where they diverge. UL 489 is the listing
        standard that defines what counts as a breaker in North America and what it has to do under fault
        conditions<Cite id="ul-489" in={SOURCES} />, and inside that umbrella sit three families with three
        completely different trip mechanisms.
      </p>

      <h3 className="chapter-h3">Standard thermal-magnetic</h3>

      <p className="mb-prose-3">
        The everyday 15 A or 20 A branch breaker is a
        {' '}<Term def={<><strong className="text-text font-medium">thermal-magnetic breaker</strong> — a breaker that combines a bimetallic strip (slow trip under sustained overload) with an electromagnetic solenoid (fast trip under short-circuit current). The standard residential branch-circuit breaker.</>}>thermal-magnetic breaker</Term>.
        Inside it are two parallel trip elements, each protecting against a different failure mode. The thermal
        element is a bimetallic strip carrying the load current; mild overload heats the strip and bends it until
        a latch releases. This trip is deliberately slow — seconds to minutes at 1.5× rated current — because
        motor starts and brief inrush currents legitimately exceed nameplate, and a breaker that nuisance-tripped
        every time a refrigerator started would be uselessly conservative.
      </p>
      <p className="mb-prose-3">
        The magnetic element is a small solenoid wound around (or in series with) the same conductor; at perhaps
        8× rated current its field is strong enough to yank the latch open in a fraction of a cycle — milliseconds,
        not seconds. This trip handles the dead-short case where the conductor has bridged hot to neutral or hot
        to ground and the only thing limiting the current is the impedance of the wire itself. The
        {' '}<Term def={<><strong className="text-text font-medium">time-current curve</strong> — the log-log plot of trip time vs current for a breaker. The thermal region is a steep curve at 1.1–6× rated current; the magnetic region is a near-vertical line at 6–12× where the trip happens in well under one AC cycle.</>}>time-current curve</Term>{' '}
        published in every breaker datasheet plots these two regions on a log-log axis: a sloping thermal section
        on the left for sustained overload and a near-vertical magnetic cliff on the right for short
        circuits<Cite id="ul-489" in={SOURCES} />.
      </p>

      <h3 className="chapter-h3">GFCI</h3>

      <p className="mb-prose-3">
        A {' '}<Term def={<><strong className="text-text font-medium">GFCI</strong> (ground-fault circuit interrupter) — a breaker that compares the current going out on hot with the current returning on neutral and trips when the difference exceeds about 5 mA. Required since NEC 1971 in bathrooms, then progressively in kitchens, garages, outdoors, and any wet location.</>}>GFCI</Term>{' '}
        breaker wraps both the hot and the neutral of the branch circuit through a small differential current
        transformer — a toroidal core with a sensing winding. If the current flowing out on hot exactly equals
        the current returning on neutral, the two opposing magnetic contributions cancel inside the core and the
        sensing winding sees nothing. If the two currents <em className="italic text-text">differ</em> — because some of the outgoing current
        has found a path back to ground that doesn't pass through neutral — the imbalance produces a net flux
        in the core, the sensing winding picks it up, and a solid-state trip circuit opens the breaker. The
        condition that triggers the trip is just
      </p>
      <Formula tex="I_{\\text{residual}} = |I_{\\text{hot}} - I_{\\text{neutral}}| > 5\\ \\text{mA}" />
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">I<sub>hot</sub></strong> is the current leaving the panel on the ungrounded conductor (in
        amperes), <strong className="text-text font-medium">I<sub>neutral</sub></strong> is the current returning on the grounded conductor (in
        amperes), and <strong className="text-text font-medium">I<sub>residual</sub></strong> is the
        {' '}<Term def={<><strong className="text-text font-medium">residual current</strong> — the difference between current going out on hot and current returning on neutral, equal to whatever fraction has leaked to ground. The quantity a GFCI measures and trips on.</>}>residual current</Term>{' '}
        that, by Kirchhoff's current law, must be returning through some other path — typically ground, possibly
        through a person. The threshold of 5 mA and the required clearing time of about 25 ms are
        calibrated against the Dalziel current-through-heart curves that Ch.32 will lay out in detail; below
        5 mA the leakage is below the let-go threshold, and above 25 ms the cumulative charge through the
        body starts to risk fibrillation<Cite id="nec-2023" in={SOURCES} />.
      </p>

      <h3 className="chapter-h3">AFCI</h3>

      <p className="mb-prose-3">
        An {' '}<Term def={<><strong className="text-text font-medium">AFCI</strong> (arc-fault circuit interrupter) — a breaker that monitors the current waveform on a branch circuit for the high-frequency signature of an electrical arc and trips when it sees one. Listed under UL 1699. Required in most dwelling-unit rooms since NEC 2014.</>}>AFCI</Term>{' '}
        is a breaker with a microcontroller inside. It samples the current waveform on the branch many thousands
        of times per second and looks for the high-frequency signature of an electrical arc — a series arc in a
        damaged extension cord, a parallel arc across a partially shorted insulation gap, the noisy chatter of a
        loose wire-nut working itself free behind a wall. Arcing currents have a characteristic broadband
        crackle riding on top of the 60 Hz fundamental, and the AFCI's firmware is trained to recognise that
        spectrum while rejecting the legitimate switching noise of a dimmer, a vacuum-cleaner brush, or a
        compact fluorescent ballast. UL 1699 is the listing standard for the device, and NEC has progressively
        widened the AFCI requirement from bedrooms only (NEC 2002) to nearly all dwelling-unit rooms
        (NEC 2014 and after)<Cite id="nec-2023" in={SOURCES} />.
      </p>

      <TryIt
        tag="Try 28.2"
        question={
          <>A GFCI breaker trips when the residual current exceeds 5 mA. A kitchen appliance is leaking
          <strong className="text-text font-medium"> 4 mA</strong> to ground through damp insulation. Has the breaker tripped? Now a second
          appliance on the same circuit develops a leak of <strong className="text-text font-medium">3 mA</strong>. Does the breaker trip now?</>
        }
        hint={<>The GFCI sees the sum of all leakage currents on the branch — not each leak individually.</>}
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">
              The GFCI senses the difference between total current out on hot and total current back on neutral;
              that difference is the sum of every leak to ground on the branch.
            </p>
            <Formula tex="I_{\\text{residual}} = 4\\ \\text{mA} + 3\\ \\text{mA} = 7\\ \\text{mA} > 5\\ \\text{mA}" />
            <p className="mb-prose-1 last:mb-0">
              4 mA alone does not trip the breaker; with the second leak the combined residual is 7 mA and the
              breaker trips. Answer: <strong className="text-text font-medium">no, then yes</strong> — and this is exactly why "nuisance" GFCI
              trips often reveal slow accumulating insulation problems before they become serious.
            </p>
          </>
        }
      />

      <h2 className="chapter-h2">The interrupting rating: what happens when there's a dead short</h2>

      <p className="mb-prose-3">
        A 20 A breaker is not just rated for the 20 A it lets through under normal load. It is also rated for the
        much larger current it has to safely <em className="italic text-text">interrupt</em> when something goes catastrophically wrong on the
        load side — a screw driven through a cable, a rodent across two terminals, a tool dropped across the bus
        bars. The relevant spec is the
        {' '}<Term def={<><strong className="text-text font-medium">AIC (ampere interrupting capacity)</strong> — the maximum short-circuit current a breaker is rated to interrupt without welding closed, arcing externally, or destroying the enclosure. Residential branch breakers are typically 10 kAIC; main service breakers 22 kAIC or higher.</>}>AIC (ampere interrupting capacity)</Term>,
        stamped on every UL 489-listed breaker. A standard residential branch breaker is 10 kAIC; the main
        service disconnect is usually 22 kAIC or 25 kAIC depending on the manufacturer<Cite id="ul-489" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        Why so high? Because the utility transformer outside the building has a very low source impedance, and a
        bolted short circuit at the panel — hot bus bar shorted directly to neutral bar through zero impedance —
        can pull tens of kilo-amperes for the few milliseconds it takes the breaker to clear. The energy released
        in that brief interval is the
        {' '}<Term def={<><strong className="text-text font-medium">arc-flash energy</strong> — the electrical energy dissipated in the arc that forms when a breaker opens under fault conditions. Computed as voltage times fault current times clearing time. Quantified by NFPA 70E in cal/cm² at a working distance; drives PPE selection.</>}>arc-flash energy</Term>,
        which to a good approximation is just
      </p>
      <Formula tex="E_{\\text{arc}} \\approx V \\times I_{\\text{fault}} \\times t_{\\text{clear}}" />
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">E<sub>arc</sub></strong> is the energy released in the fault arc (in joules),
        <strong className="text-text font-medium"> V</strong> is the system voltage across the arc (in volts; 120 V for a single hot-to-neutral
        fault, 240 V for a hot-to-hot fault), <strong className="text-text font-medium">I<sub>fault</sub></strong> is the peak fault current the
        utility can deliver into the bolted short (in amperes), and <strong className="text-text font-medium">t<sub>clear</sub></strong> is the
        time the breaker takes to interrupt the arc (in seconds). For a numerical sense of scale, take V = 120 V,
        I<sub>fault</sub> = 10 kA, t<sub>clear</sub> = 50 ms:
      </p>
      <Formula tex="E_{\\text{arc}} \\approx 120 \\times 10{,}000 \\times 0.050 = 60{,}000\\ \\text{J} = 60\\ \\text{kJ}" />
      <p className="mb-prose-3">
        Sixty kilojoules dumped into a few cubic centimetres of air in a tenth of a second. That is enough to
        vaporise the local section of bus bar, eject molten copper, and ignite anything within arm's length. It
        is also why NFPA 70E exists as a separate standard from the NEC, why power-system electricians wear arc-rated
        face-shields and 40-cal-rated suits when racking in breakers, and why the AIC rating of the breaker has
        to be at least as large as the worst-case
        {' '}<Term def={<><strong className="text-text font-medium">available fault current</strong> — the largest short-circuit current the utility transformer and service wiring can deliver to a fault at the panel, before any device interrupts it. Set by transformer KVA, secondary voltage, and impedance. Drives breaker AIC selection.</>}>available fault current</Term>{' '}
        at the panel — otherwise the breaker itself becomes the fuel<Cite id="nec-2023" in={SOURCES} /><Cite id="ul-489" in={SOURCES} />.
      </p>

      <TryIt
        tag="Try 28.3"
        question={
          <>A standard 20 A branch breaker is rated <strong className="text-text font-medium">10 kAIC</strong>. The utility transformer at your
          property can deliver about <strong className="text-text font-medium">8 kA</strong> of fault current into a bolted short at your panel.
          Is the breaker correctly sized for its interrupting duty? What if a neighbouring building upgrades
          to a 75 kVA transformer that can deliver <strong className="text-text font-medium">14 kA</strong> at your service?</>
        }
        hint={<>The breaker's AIC rating must be greater than or equal to the available fault current at its
        terminals.</>}
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">
              Compare AIC to available fault current. At 8 kA &lt; 10 kAIC, the breaker is fine. At 14 kA &gt;
              10 kAIC, the breaker is undersized and could fail destructively trying to interrupt.
            </p>
            <p className="mb-prose-1 last:mb-0">
              Answer: <strong className="text-text font-medium">OK at 8 kA</strong>; <strong className="text-text font-medium">not OK at 14 kA</strong>. The fix is either a
              series-rated combination with an upstream higher-AIC main, or substitution of 22 kAIC branch
              breakers throughout the panel.
            </p>
          </>
        }
      />

      <TryIt
        tag="Try 28.4"
        question={
          <>An arc fault inside a wall develops <strong className="text-text font-medium">240 V</strong> across the arc gap and draws an average of
          <strong className="text-text font-medium"> 12 A</strong> until the AFCI clears it. What is the instantaneous power dissipated in the arc,
          and how does it compare to the rated dissipation of a fully-loaded <strong className="text-text font-medium">20 A, 120 V</strong> branch
          circuit?</>
        }
        hint={<>Arc power is <InlineMath tex="V \\times I" />; the branch's rated dissipation is its rated voltage × rated current.</>}
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">
              Arc power and branch rated power:
            </p>
            <Formula tex="P_{\\text{arc}} = 240\\ \\text{V} \\times 12\\ \\text{A} = 2{,}880\\ \\text{W}" />
            <Formula tex="P_{\\text{branch}} = 120\\ \\text{V} \\times 20\\ \\text{A} = 2{,}400\\ \\text{W}" />
            <p className="mb-prose-1 last:mb-0">
              The arc is dissipating <strong className="text-text font-medium">~2.88 kW in a localised hot spot</strong> — more than the entire
              branch's nameplate load, concentrated in a few square millimetres of insulation. The reason AFCIs
              exist: a 12 A arc is not large enough to trip a 20 A thermal-magnetic on overload, but it can
              start a fire inside ten minutes.
            </p>
          </>
        }
      />

      <h2 className="chapter-h2">Bonding and grounding</h2>

      <p className="mb-prose-3">
        Up to here, neutral and ground have been two different bars that happen to be tied together by one strap.
        Why two bars at all, if they share a connection? Why not a single bar that does both jobs? The answer is
        the most important rule in the NEC and the entire reason the panel is laid out the way it is.
      </p>
      <p className="mb-prose-3">
        The {' '}<Term def={<><strong className="text-text font-medium">grounding electrode</strong> — the conductor that physically connects the panel's ground bar to the earth, typically an 8-foot copper-clad rod driven into the soil outside the building. May also be the buried metallic water service or a Ufer (concrete-encased) electrode. The system reference to actual dirt.</>}>grounding electrode</Term>{' '}
        — usually a copper-clad steel rod driven eight feet into the soil outside the building, or a clamp on the
        buried metallic water service, or a concrete-encased "Ufer" electrode — is the panel's connection to actual
        dirt. The
        {' '}<Term def={<><strong className="text-text font-medium">grounding-electrode conductor</strong> — the bare or green conductor that runs from the ground rod (or other grounding electrode) into the panel and lands on the ground bar. Sized by NEC Table 250.66 based on the size of the service conductors.</>}>grounding-electrode conductor</Term>{' '}
        runs from that rod into the can and lands on the ground bar. NEC Article 250 governs every detail of
        this system<Cite id="nec-2023" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        Now imagine what happens during a fault. Say a frayed hot wire inside a metal-cased toaster touches the
        chassis. The chassis is connected by the third (green or bare) prong of the cord back to the ground bar
        of the panel. At the panel, the ground bar is bonded to the neutral bar at the main disconnect. The
        neutral bar runs back through the service conductors to the centre-tap of the utility transformer
        outside. So the fault current has a low-impedance path: from the hot bus, through the closed breaker,
        through the appliance wiring, through the frayed point, through the chassis, through the equipment-grounding
        conductor, through the ground bar, through the main bonding jumper, through the neutral bar, through
        the service neutral, back to the transformer centre-tap. That loop carries enough current — hundreds of
        amps, instantly — to trip the breaker in milliseconds and clear the fault. Critically, it does
        <em className="italic text-text"> not</em> require any current to flow through the earth or through any person<Cite id="nec-2023" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        The grounding-electrode connection to dirt is not what trips the breaker. The dirt's resistance is far too
        high — typically 25–100 Ω for a residential ground rod — to sink enough current. What clears the fault is
        the bonded metallic path back to the transformer. The rod's job is different and subtler: it pins the
        building's neutral and ground voltage to within a few volts of the local soil potential, so that lightning
        strikes and downed-utility events do not float the whole building's reference up to thousands of volts
        relative to the people standing on the ground floor. The breaker clears faults; the rod handles surges and
        keeps the reference honest.
      </p>

      <Pullout>
        The whole geometry of household electrical safety is encoded in one rule: neutral and ground are connected
        once, at the main disconnect, and never again.
      </Pullout>

      <h2 className="chapter-h2">Sub-panels and the no-bond rule</h2>

      <p className="mb-prose-3">
        Add a {' '}<Term def={<><strong className="text-text font-medium">sub-panel</strong> — a secondary panel fed from a breaker in the main service panel. Used to extend wiring to a finished basement, detached garage, or large addition. NEC 250.32 requires the neutral bar to float relative to the enclosure at every sub-panel; ground and neutral are bonded only at the main.</>}>sub-panel</Term>{' '}
        to the house — a smaller load centre in a finished basement, say, fed from a 100 A double-pole breaker in
        the main panel through a four-conductor feeder. The feeder carries two hots (L1 and L2), a neutral, and a
        ground. At the sub-panel the four wires land on their respective terminals: hots to the line side of the
        sub's main lugs, neutral to the sub's neutral bar, ground to the sub's ground bar. And here the rule shifts:
        at the sub-panel, the main bonding jumper between the neutral bar and the enclosure is
        <em className="italic text-text"> removed</em><Cite id="nec-2023" in={SOURCES} />. The sub's neutral bar floats relative to its can; only
        the ground bar is bonded to the enclosure.
      </p>
      <p className="mb-prose-3">
        Why? Imagine the alternative. If neutral and ground were bonded at both the main and the sub, the
        return current from every branch circuit on the sub would split between two parallel paths back to the
        main: the dedicated neutral feeder conductor, and the equipment-grounding feeder conductor. Some fraction
        of the normal load current would flow continuously through the ground wire — which means continuously
        through every metal enclosure between the sub and the main, since they are all bonded together. That
        current would not trip any breaker (it is by hypothesis within the breaker's nominal rating; that is what
        normal load looks like), but it would put the metal of every junction box and conduit run at a few volts
        above the building's true ground reference, and it would energise an exposed bare copper conductor that
        the NEC promises will only carry current during a fault. The whole point of the equipment-grounding system
        — that the bare wire is at zero volts unless something is broken — would quietly fail<Cite id="nec-2023" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        Floating the sub-panel's neutral keeps every milliamp of return current on the conductor it was assigned to,
        and reserves the ground conductor for the rare day when a hot wire touches a chassis. That is the entire
        reason for the no-bond rule at every sub-panel, and the reason every detached-garage feeder and
        finished-basement sub-panel installation has four wires, not three.
      </p>

      <TryIt
        tag="Try 28.5"
        question={
          <>A sub-panel sits 50 m from the main, fed by a 100 A double-pole breaker through <strong className="text-text font-medium">1 AWG
          aluminium</strong> conductors (resistance ≈ 0.524 Ω per 1000 ft, or about <strong className="text-text font-medium">1.72 mΩ/m</strong>).
          The sub is loaded at 80 A. What is the round-trip voltage drop from the main to the sub on each hot?</>
        }
        hint={<>Voltage drop on one conductor is <InlineMath tex="I \\times R" />; the load current flows out one hot and returns through
        the other hot (in a 240 V load) or through the neutral (in a 120 V load). Treat one round-trip leg.</>}
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">
              Conductor resistance for 50 m of 1 AWG aluminium:
            </p>
            <Formula tex="R = 1.72\\ \\text{m}\\Omega/\\text{m} \\times 50\\ \\text{m} = 0.086\\ \\Omega\\ \\text{per conductor}" />
            <p className="mb-prose-1 last:mb-0">
              For 240 V loads on the sub the current flows out on one hot and back on the other, so the total drop
              seen by the load is twice this:
            </p>
            <Formula tex="\\Delta V = 2 \\times I \\times R = 2 \\times 80 \\times 0.086 = 13.8\\ \\text{V}" />
            <p className="mb-prose-1 last:mb-0">
              Answer: about <strong className="text-text font-medium">14 V drop at 240 V</strong>, or roughly <strong className="text-text font-medium">5.7%</strong>. NEC informational
              note 210.19 suggests keeping branch-circuit drop under 3% and total drop (feeder plus branch) under
              5%; this feeder is already at the limit before any branch drop is added on the far side.
            </p>
          </>
        }
      />

      <CaseStudies
        intro={
          <>
            Two real residential panels and one piece of history that explains why the listing standards in this
            chapter look the way they do.
          </>
        }
      >
        <CaseStudy
          tag="Case 28.1"
          title="The Square D QO 200 A panel"
          summary="A canonical 40-slot residential load centre."
          specs={[
            { label: 'Main breaker rating', value: <>200 A, two-pole, 240 V <Cite id="square-d-qo-datasheet" in={SOURCES} /></> },
            { label: 'Main interrupting rating', value: <>22 kAIC <Cite id="square-d-qo-datasheet" in={SOURCES} /></> },
            { label: 'Branch slot count', value: <>40 single-pole (or 20 two-pole) <Cite id="square-d-qo-datasheet" in={SOURCES} /></> },
            { label: 'Bus material', value: <>tin-plated copper <Cite id="square-d-qo-datasheet" in={SOURCES} /></> },
            { label: 'Bus stab spacing', value: <>3/4-inch on-centre, alternating L1/L2 <Cite id="square-d-qo-datasheet" in={SOURCES} /></> },
            { label: 'Breaker family', value: <>QO single-pole 10 kAIC, QO-AFI/GFI dual-function variants <Cite id="square-d-qo-datasheet" in={SOURCES} /></> },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            Schneider Electric's QO load centre is the panel a North-American electrician is most likely to install
            in a new single-family house: a steel enclosure roughly 14 inches wide by 30 inches tall, hinged door,
            forty single-pole slots arranged in two columns. The main is a 200 A two-pole breaker at the head of
            the column, factory-rated at 22 kAIC; every branch breaker that snaps onto the bus is rated for
            10 kAIC<Cite id="square-d-qo-datasheet" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            The QO bus geometry is the canonical alternating-phase pattern of this chapter. Two parallel tin-plated
            copper plates run vertically down the centre; each plate has stamped fingers projecting alternately
            left and right at three-quarter-inch on-centre spacing. A breaker clip grabs one finger, putting the
            breaker on either L1 or L2 depending on which slot it occupies. A two-pole breaker is a
            single-moulding plastic body that spans two adjacent slots and grabs one finger from each
            bus<Cite id="square-d-qo-datasheet" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            The QO family also includes
            {' '}<Term def={<><strong className="text-text font-medium">dual-function breaker</strong> — a breaker that combines AFCI and GFCI protection in a single device. Square D's QO-AFI/GFI line is one example. NEC 2023 increasingly defaults to dual-function on circuits that historically required only one or the other.</>}>dual-function breakers</Term>{' '}
            (QO-DF in the catalog) that combine AFCI and GFCI in one breaker — the direction NEC has been moving
            for years as dwelling-unit AFCI and GFCI requirements have grown to overlap on most circuits.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 28.2"
          title="An Eaton BR-series 100 A sub-panel"
          summary="The smaller cousin, with a different bus geometry."
          specs={[
            { label: 'Feeder rating', value: <>100 A, two-pole, 240 V <Cite id="eaton-br-datasheet" in={SOURCES} /></> },
            { label: 'Branch slot count', value: <>20 single-pole <Cite id="eaton-br-datasheet" in={SOURCES} /></> },
            { label: 'Main bonding jumper', value: <>shipped installed; REMOVED at sub-panel install <Cite id="nec-2023" in={SOURCES} /></> },
            { label: 'Breaker family', value: <>BR single-pole 10 kAIC; CL tandem allowed in marked slots <Cite id="eaton-br-datasheet" in={SOURCES} /></> },
            { label: 'Bus stab geometry', value: <>parallel-finger, distinct from Square D QO <Cite id="eaton-br-datasheet" in={SOURCES} /></> },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            Eaton's BR series is one of the two big U.S. residential panel families (the other being Square D QO).
            A 100 A BR sub-panel is a common choice for a finished-basement or detached-garage feed: 20 single-pole
            slots, a 100 A two-pole main set of lugs (not a breaker — the upstream main panel's 100 A breaker is
            the protective device), and a separate neutral bar and ground bar inside the
            enclosure<Cite id="eaton-br-datasheet" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            The bus-stab geometry on a BR panel is mechanically different from a Square D QO — the finger shapes
            and spacings are not interchangeable, which is why a Square D QO breaker physically does not fit an
            Eaton BR bus and vice versa. Each manufacturer's breakers are listed under UL 489 only when used in
            the manufacturer's own panel, with one major exception: certain Eaton "classified" CL-series breakers
            are explicitly listed for use in Square D HOM panels<Cite id="eaton-br-datasheet" in={SOURCES} /><Cite id="ul-489" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            The installation detail that distinguishes a sub-panel from a main: the BR enclosure ships with a green
            bonding screw that ties the neutral bar to the can. At a sub-panel installation that screw is
            <em className="italic text-text"> removed</em>, leaving the neutral bar electrically floating from the enclosure. The ground bar
            remains bonded to the can; the four-wire feeder from the upstream main brings hot, hot, neutral, and
            ground separately and the no-bond rule is enforced at this end of the run<Cite id="nec-2023" in={SOURCES} />.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 28.3"
          title="The Federal Pacific Stab-Lok recall and why modern panels are tested under cycling"
          summary="A 1960s breaker family that, decades later, still scares electricians."
          specs={[
            { label: 'Manufacturer', value: <>Federal Pacific Electric (defunct) <Cite id="nec-2023" in={SOURCES} /></> },
            { label: 'Era', value: <>installed widely 1957–1984</> },
            { label: 'Failure mode', value: <>thermal trip mechanism fails to release</> },
            { label: 'Modern listing standard', value: <>UL 489 with thermal endurance cycling <Cite id="ul-489" in={SOURCES} /></> },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            Federal Pacific Electric's Stab-Lok panels were installed in millions of North-American homes between
            the late 1950s and the mid-1980s. Their breakers — single-pole and double-pole units that snapped
            onto a bus stab much like a modern QO — were nominally listed to the UL 489 of the era, but field
            reports throughout the 1980s found a disturbing failure mode: under sustained overload, a noticeable
            fraction of Stab-Lok breakers simply <em className="italic text-text">did not trip</em>. The handle stayed in the ON position,
            current kept flowing, and the wire downstream of the breaker overheated until something — insulation,
            framing lumber, the breaker housing itself — ignited.
          </p>
          <p className="mb-prose-2 last:mb-0">
            The mechanical root cause was a tolerance issue between the breaker handle, the latch, and the bus
            stab geometry: the latch could wear or shift such that the bimetallic strip flexed but failed to
            release the contacts. Modern UL 489 includes mechanical-endurance cycling tests that catch this
            failure mode at listing time<Cite id="ul-489" in={SOURCES} />, and NEC requires every overcurrent
            protective device to be listed for the panel it is installed in<Cite id="nec-2023" in={SOURCES} />.
            Stab-Lok panels remain in service today — most are not, by themselves, code violations under
            grandfathering — but they are widely recommended for replacement at any major remodel, and
            insurance underwriters frequently price-load policies on homes that still have one.
          </p>
        </CaseStudy>
      </CaseStudies>

      <FAQ intro="Questions readers ask after opening their first panel cover.">
        <FAQItem q="Why are some breakers single-slot and others double?">
          <p>
            A single-slot breaker grabs one bus stab and feeds one 120 V branch circuit. A double-slot
            (two-pole) breaker grabs two adjacent bus stabs — one on L1, one on L2 — and feeds one 240 V branch
            circuit. The double form factor is mechanically and electrically what lets a single device protect
            both hots of a 240 V appliance and trip them together: if either pole sees an overload, the internal
            crossbar opens both<Cite id="nema-ab-1" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What is a 'tandem' or 'thin' breaker, and when is it allowed?">
          <p>
            A {' '}<Term def={<><strong className="text-text font-medium">tandem breaker</strong> — a single-width breaker housing containing two independent single-pole trip mechanisms that engage the same bus stab. Allowed only in panel slots specifically labelled by the manufacturer to accept tandems.</>}>tandem breaker</Term>{' '}
            packs two single-pole trip mechanisms into one slot's worth of physical space, letting a 30-slot panel
            host effectively more circuits. They are allowed only in panel slots specifically rejected for them by
            the manufacturer's marking — typically the panel will have a stamping indicating which positions accept
            a tandem. Putting a tandem in a non-rated slot is a code violation and a common cause of nuisance
            tripping<Cite id="nec-2023" in={SOURCES} /><Cite id="ul-489" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Can I install a GFCI or AFCI receptacle to protect a circuit instead of changing the breaker?">
          <p>
            For GFCI protection, yes — a GFCI receptacle installed as the first device on the branch protects
            every downstream outlet daisy-chained off its LOAD terminals, and NEC explicitly allows this as an
            alternative to a GFCI breaker. For AFCI it depends: NEC 2023 permits "outlet-branch-circuit" AFCI
            receptacles at the first outlet only under specific extension or replacement conditions; for most new
            installations the breaker-side AFCI is still required<Cite id="nec-2023" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why is the neutral bar always isolated from the panel can in a sub-panel?">
          <p>
            To keep normal load current off the equipment-grounding system. If neutral and ground were bonded at
            both the main and the sub, the return current from every branch on the sub would split between the
            neutral feeder and the ground feeder, putting steady-state current on every bare green wire and metal
            box between the two panels. That current is by construction below the breaker's trip threshold —
            it is, after all, just normal load — so nothing would clear it. The bare conductor would silently
            float a few volts above the building's true ground reference forever. The sub-panel no-bond rule
            keeps return current on the neutral where it belongs<Cite id="nec-2023" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What's the difference between the service-entrance neutral and a branch-circuit neutral?">
          <p>
            Mechanically, none — they are both white-insulated copper conductors that land on the neutral bar.
            Functionally, the service-entrance neutral carries the imbalance current between L1 and L2 back to
            the utility transformer (Ch.27 makes this concrete), while a branch-circuit neutral carries the
            return current of one 120 V load back to the panel. The
            {' '}<Term def={<><strong className="text-text font-medium">service-entrance neutral</strong> — the grounded service conductor between the utility transformer's centre-tap and the main panel's neutral bar. Carries the difference of L1 and L2 currents. The point where the neutral and ground are bonded together for the entire building.</>}>service-entrance neutral</Term>{' '}
            is the only neutral conductor in the building that is allowed (and required) to be bonded to ground;
            every branch neutral past the main is rigorously kept separate<Cite id="nec-2023" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Can I use a two-pole breaker on the same phase — both poles on L1, say — to handle 40 A on a single hot?">
          <p>
            No. The whole reason a two-pole breaker is mechanically two slots wide is to force it to straddle one
            stab from L1 and one from L2 — that is what the alternating-phase bus stamping is for. Bridging two
            stabs of the same phase would not give you a higher current rating; it would give you two parallel
            breakers on the same line, which is not a listed configuration under UL 489 and which would not
            coordinate properly with a load expecting 240 V between its two hot terminals<Cite id="ul-489" in={SOURCES} /><Cite id="nema-ab-1" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why does the panel manufacturer matter? Can I mix Eaton breakers in a Square D panel?">
          <p>
            Each manufacturer's bus-stab geometry is mechanically distinct: a Square D QO breaker physically does
            not fit an Eaton BR bus and vice versa. Even where the physical clip would seat, the breaker is only
            listed under UL 489 for use in its manufacturer's panel — that is part of what listing
            means<Cite id="ul-489" in={SOURCES} />. The exception is a handful of "classified" breakers (Eaton's
            CL series is the classic example) that have been independently tested and listed for use in another
            manufacturer's panel; those are the only legal cross-manufacturer substitutions, and the breaker's
            label will state which panel families it is classified for<Cite id="eaton-br-datasheet" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What does 'fully-rated' versus 'series-rated' mean for AIC?">
          <p>
            A {' '}<Term def={<><strong className="text-text font-medium">fully-rated</strong> system — one in which every breaker (main and branches) is individually rated for the full available fault current at its terminals. The conservative, more expensive approach.</>}>fully-rated</Term>{' '}
            system uses branch breakers whose individual AIC equals or exceeds the worst-case available fault
            current at the panel. A
            {' '}<Term def={<><strong className="text-text font-medium">series-rated</strong> system — one in which an upstream higher-AIC breaker (typically the main) is relied on to share the interruption duty of downstream lower-AIC branches during a high-fault event. Allowed only when the specific main+branch combination is tested and listed together.</>}>series-rated</Term>{' '}
            system relies on the upstream main breaker (with a much higher AIC) to clear part of the fault current
            in coordination with the downstream branch, allowing the branches to be rated for less. Series ratings
            are only valid when the specific main+branch combination has been tested together by the manufacturer
            and listed under UL 489, and the panel's label will list the legal series-rated
            combinations<Cite id="ul-489" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="How does a 200 A panel 'know' the total load is over 200 A?">
          <p>
            It does not know in any computational sense — there is no logic in the panel reading a total. The main
            disconnect's two-pole breaker carries the full L1 and L2 currents through its own thermal-magnetic
            mechanism, exactly the same way every smaller branch breaker does. If either pole exceeds the 200 A
            time-current curve for long enough, that pole's bimetallic strip bends until the latch
            releases<Cite id="ul-489" in={SOURCES} />, and the mechanical crossbar opens both poles together.
            The "main" is just a bigger version of every other thermal-magnetic breaker in the panel.
          </p>
        </FAQItem>

        <FAQItem q="Why is the panel enclosure a metal can, not plastic?">
          <p>
            Three reasons, all of which appear in the NEC's panel-enclosure requirements. First, the can is part
            of the equipment-grounding system: it is bonded to the ground bar so that a fault from any internal
            conductor to the enclosure has a low-impedance path back to the source. Second, in the event of an
            internal arc fault — a piece of bus-bar slag, a loose breaker, a foreign object across two stabs —
            a steel enclosure contains the fireball where a plastic one would not. Third, the steel can is what
            the NEC counts as the protective barrier between live parts and the building's framing
            members<Cite id="nec-2023" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What's a panel directory and why is it mandatory?">
          <p>
            The panel directory is the printed label on the inside of the panel door listing each breaker by slot
            number and identifying which loads it feeds. NEC 408.4 makes the label mandatory and requires it to
            be legible and accurate<Cite id="nec-2023" in={SOURCES} />. The practical reason: in an emergency
            (a sparking outlet, a leak near an appliance, a tool that has just shocked someone) the very first
            action is to kill the right breaker, and that decision has to take less than ten seconds. An accurate
            directory turns "which one is it?" into a glance.
          </p>
        </FAQItem>

        <FAQItem q="How is available fault current at a residential service actually calculated?">
          <p>
            It is roughly the secondary voltage divided by the sum of the transformer's secondary impedance and
            the impedance of the service-drop conductors. A typical 25 kVA single-phase pole-pig with about 2%
            impedance feeding a 200 A house through a short service drop yields an available fault current of
            around 5–10 kA at the meter — comfortably below the 22 kAIC of a residential main breaker and the
            10 kAIC of a residential branch. Utilities will publish this number for any service on request, and
            for any commercial installation it must be calculated and stamped on the panel
            label<Cite id="nec-2023" in={SOURCES} /><Cite id="ul-489" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="If the ground rod's resistance to dirt is 25–100 Ω, how does the system trip a 20 A breaker when something faults to earth?">
          <p>
            It does not — and this is one of the most widely misunderstood points in residential electrical safety.
            A bolted fault from a hot wire to a ground rod, through 25 Ω of soil, draws only <InlineMath tex="120\\ \\text{V}/25\\ \\Omega \\approx 4.8\\ \\text{A}" />
            — well below a 20 A breaker's trip threshold. What clears a normal fault is not the dirt path; it is
            the metallic equipment-grounding path back to the transformer through the bonded neutral. Soil
            resistance to a single residential rod is too high to clear a branch fault by itself. The rod's role
            is surge bonding and reference stabilisation, not fault clearing<Cite id="nec-2023" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Are AFCI and GFCI breakers redundant? Can I just install one?">
          <p>
            They detect different fault modes. A GFCI looks at the difference between hot and neutral currents
            and trips on leakage to ground — the failure mode that electrocutes people. An AFCI looks at the
            current waveform's high-frequency spectrum and trips on the signature of an electrical arc — the
            failure mode that starts fires inside walls. A series-arc fault in a damaged extension cord (no
            ground leak, just two conductors making and breaking contact through the damaged spot) is invisible
            to a GFCI; a person standing on damp concrete and touching a live wire is invisible to an AFCI. NEC
            increasingly defaults to dual-function breakers that do both, but the two functions remain
            mechanistically separate<Cite id="nec-2023" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What does the small TEST button on a GFCI or AFCI breaker actually do?">
          <p>
            On a GFCI, the TEST button connects a small calibrated resistor (typically a few thousand ohms)
            between the hot conductor downstream of the differential transformer and the load-side neutral
            upstream of it — deliberately creating a residual current of roughly 6–8 mA that the GFCI senses and
            trips on. On an AFCI, the button injects a simulated arcing-current waveform into the microcontroller's
            input. Both tests verify the trip mechanism, not the integrity of the breaker's bus contact; UL
            and the NEC recommend monthly testing<Cite id="ul-489" in={SOURCES} /><Cite id="nec-2023" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why is the elementary charge in CODATA cited in a chapter about panels?">
          <p>
            Only obliquely: every current value in this chapter — 5 mA for a GFCI threshold, 10 kA for an
            available fault, 20 A for a kitchen branch — is a count of elementary charges per second through a
            cross-section, scaled by the CODATA 2018 value of <em className="italic text-text">e</em> = 1.602176634×10⁻¹⁹ C exactly
            <Cite id="codata-2018" in={SOURCES} />. The chapter would still be coherent without ever quoting the
            number, but every ampere on every label in the panel ultimately reduces to that constant.
          </p>
        </FAQItem>
      </FAQ>
    </ChapterShell>
  );
}
