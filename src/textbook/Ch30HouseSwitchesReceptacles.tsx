/**
 * Chapter 30 — Receptacles, switches, and the three-way puzzle
 *
 * The fourth chapter of the house-electricity applied track. Once the
 * branch circuit has been sized (Ch.29), the question becomes how the
 * wire actually becomes a useable outlet: brass screw vs silver screw
 * vs green screw, NEMA pattern numbers, daisy-chained receptacles,
 * single-pole vs three-way vs four-way switches, and how a triac-based
 * dimmer chops the AC waveform.
 *
 * Sources available in chapter.sources:
 *   nec-2023, nema-wd-6, ul-498, lutron-dimmer-app-note, codata-2018
 */
import { CaseStudies, CaseStudy } from '@/components/CaseStudy';
import { ChapterShell } from '@/components/ChapterShell';
import { FAQ, FAQItem } from '@/components/FAQ';
import { Cite } from '@/components/SourcesList';
import { Formula } from '@/components/Formula';
import { Pullout } from '@/components/Prose';
import { Term } from '@/components/Term';
import { TryIt } from '@/components/TryIt';
import { getChapter } from './data/chapters';
import { ThreeWaySwitchBuilderDemo } from './demos/ThreeWaySwitchBuilder';

export default function Ch30HouseSwitchesReceptacles() {
  const chapter = getChapter('house-switches-receptacles')!;
  const SOURCES = chapter.sources;

  return (
    <ChapterShell chapter={chapter}>
      <p className="chapter-intro">
        Open a standard duplex receptacle and look at the back. Brass-coloured screws line one side, silver-coloured
        screws line the other, and a single green screw sits at the bottom. Between the top pair of brass screws and
        the bottom pair, a small pre-broken metal tab joins them; the same tab exists on the silver side. Snap that tab
        with a pair of pliers and the receptacle is electrically two halves — top and bottom — that can be controlled
        independently. The whole device is twenty grams of plastic and seven screws, and yet every safety rule of
        residential wiring is encoded into the colours of those seven screws. Brass means hot. Silver means neutral.
        Green means ground. Everything else in this chapter is just where those colours meet which side of which
        device.
      </p>
      <p className="mb-prose-3">
        Chapter 29 sized a branch circuit: a length of copper from a breaker to a string of outlets, chosen so that the
        wire stays cool while carrying its rated current. This chapter is about what happens at the far end of that
        wire — the receptacles you actually plug things into, the switches that interrupt them, and the dimmers that
        chop the waveform on its way to a lamp. The two most-asked questions in residential rough-in are also the two
        we'll answer in full: <em className="italic text-text">which screw does which colour wire go on?</em> and <em className="italic text-text">how on earth does a
        staircase with two switches work?</em>
      </p>

      <h2 className="chapter-h2">The standard 5-15 duplex receptacle</h2>

      <p className="mb-prose-3">
        The workhorse of every American home is the{' '}
        <Term def={<><strong className="text-text font-medium">duplex receptacle</strong> — a single wiring device with two outlet positions, top and bottom, mounted in a single wall box. Standard residential 120 V outlets are duplex.</>}>duplex receptacle</Term>{' '}
        rated for 15 amps at 125 volts — the{' '}
        <Term def={<><strong className="text-text font-medium">NEMA pattern</strong> — a configuration code from NEMA WD 6 that specifies the geometry of a plug or receptacle. Format is X-YYR (receptacle) or X-YYP (plug), where X is the voltage/pole configuration and YY is the current rating in amps.</>}>NEMA pattern</Term>{' '}
        5-15R receptacle, which mates with the 5-15P plug on the end of every lamp cord and phone charger in the
        country<Cite id="nema-wd-6" in={SOURCES} />. The face has two parallel vertical slots — the wider one is
        neutral, the narrower one is hot — and a round hole below for the equipment ground.
      </p>
      <p className="mb-prose-3">
        Inside the body of the receptacle sits a brass-coloured stamping that bridges the two hot slots, a
        silver-coloured stamping that bridges the two neutral slots, and a green stamping that ties the ground hole to
        the mounting strap. Each stamping is brought out to screw terminals on the sides of the device. The convention
        is fixed and worth memorising once:
      </p>
      <ul>
        <li>
          The <Term def={<><strong className="text-text font-medium">brass screw</strong> — the gold/yellow-coloured terminal screw on a receptacle or switch. Always lands the hot (line) conductor — by convention the black or red wire.</>}>brass screws</Term> (two, one above the other) on one side take the{' '}
          <Term def={<><strong className="text-text font-medium">hot</strong> — the energised conductor of a circuit, normally at line voltage relative to neutral and ground. Black or red insulation by convention in North American residential wiring.</>}>hot</Term>{' '}
          conductor — black or red insulation.
        </li>
        <li>
          The <Term def={<><strong className="text-text font-medium">silver screw</strong> — the chrome/white-coloured terminal screw on a receptacle. Always lands the neutral conductor — by convention the white wire.</>}>silver screws</Term> (two, on the other side) take the{' '}
          <Term def={<><strong className="text-text font-medium">neutral</strong> — the return conductor of a 120 V branch circuit; bonded to ground at the service panel but treated as an energised conductor for current. White insulation by convention.</>}>neutral</Term>{' '}
          conductor — white insulation.
        </li>
        <li>
          The <Term def={<><strong className="text-text font-medium">green screw</strong> — the equipment-grounding terminal on a receptacle or switch. Always lands the bare or green-insulated ground conductor; never carries current except during a fault.</>}>green screw</Term> (one, at the bottom) takes the{' '}
          <Term def={<><strong className="text-text font-medium">ground</strong> — the equipment-grounding conductor; a bonded return path that carries fault current only, sized to trip the upstream breaker if a hot conductor contacts a metal enclosure.</>}>ground</Term>{' '}
          conductor — bare copper or green insulation.
        </li>
      </ul>
      <p className="mb-prose-3">
        Between the two brass screws — and between the two silver screws — sits a small stamped tab that joins them.
        It is scored so it can be twisted off with pliers. Snap the brass-side tab and the top and bottom outlets become
        independent on their hot side, so one half can be switched while the other stays always-on. That is exactly
        how a "switched outlet" controlled by a wall switch is built. The{' '}
        <Term def={<><strong className="text-text font-medium">break-off tab</strong> — the small scored metal bridge between paired terminal screws on a duplex receptacle. Snapping it converts the device into two independently-fed halves; used for switched outlets and split receptacles.</>}>break-off tab</Term>{' '}
        on the silver side is almost never broken; the neutrals stay common.
      </p>
      <p className="mb-prose-3">
        The dimensions of the slots and the body of the receptacle are defined by{' '}
        <strong className="text-text font-medium">NEMA WD 6</strong><Cite id="nema-wd-6" in={SOURCES} />, and the temperature-rise, contact-resistance,
        and dielectric-withstand performance is governed by{' '}
        <strong className="text-text font-medium">UL 498</strong><Cite id="ul-498" in={SOURCES} />. Both standards are referenced into the National
        Electrical Code by{' '}
        <strong className="text-text font-medium">NEC 110.3(B)</strong><Cite id="nec-2023" in={SOURCES} />, which simply requires that listed equipment
        be installed per its listing.
      </p>
      <p className="mb-prose-3">
        Two physical termination methods are present on almost every modern receptacle. The screw terminals on the
        sides take a stripped conductor wrapped clockwise around the screw, tightened so the wrap closes as the screw
        seats. Behind the screws sit{' '}
        <Term def={<><strong className="text-text font-medium">back-wire (push-in) holes</strong> — small spring-loaded apertures on the back of a receptacle that accept a stripped conductor pushed straight in. Faster than wrapping a screw, but on contractor-grade devices they have a reputation for working loose over time; commercial-grade devices use a clamped back-wire instead.</>}>push-in (back-wire) holes</Term>{' '}
        that grip a straight stripped conductor with a spring. Push-in holes are faster than screws but on the
        cheap-grade devices have a reputation for loosening over time; commercial-grade receptacles use a clamped
        back-wire that pinches the conductor with a screw-driven plate, combining the speed of a push-in with the
        retention of a screw terminal.
      </p>
      <p className="mb-prose-3">
        Not every receptacle in the house is a 5-15. The NEMA family covers everything from a phone charger to a
        dryer. Six patterns you will see most often:
      </p>
      <ul>
        <li><strong className="text-text font-medium">5-15</strong> — 15 A, 125 V, the standard household outlet.</li>
        <li><strong className="text-text font-medium">5-20</strong> — 20 A, 125 V; the neutral slot is T-shaped so a 5-20 plug (one blade horizontal) fits but a 5-15 plug still works.</li>
        <li><strong className="text-text font-medium">6-15</strong> — 15 A, 250 V (two hots, no neutral); window-unit air conditioners.</li>
        <li><strong className="text-text font-medium">6-20</strong> — 20 A, 250 V; some shop tools.</li>
        <li><strong className="text-text font-medium">14-30</strong> — 30 A, 125/250 V, with neutral; the standard electric-dryer outlet.</li>
        <li><strong className="text-text font-medium">14-50</strong> — 50 A, 125/250 V, with neutral; ranges, large welders, and the standard outlet for a level-2 EV charger.</li>
      </ul>
      <p className="mb-prose-3">
        The numbering looks arbitrary but is not. The next section decodes it.
      </p>

      <TryIt
        tag="Try 30.1"
        question={
          <>
            A 5-15R receptacle's brass screw measures <strong className="text-text font-medium">119 V</strong> to neutral. A space heater rated{' '}
            <strong className="text-text font-medium">800 W</strong> is plugged in. What current does the receptacle carry, and is it within its 15 A
            rating?
          </>
        }
        hint="Power, voltage, and current are related by P = VI; solve for I."
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">Rearrange the power identity from Ch.3:</p>
            <Formula>I = P / V = 800 / 119 ≈ 6.7 A</Formula>
            <p className="mb-prose-1 last:mb-0">
              Answer: <strong className="text-text font-medium">about 6.7 A</strong>, comfortably under the 15 A rating of a 5-15R<Cite id="nema-wd-6" in={SOURCES} />.
              A second similar load on the same duplex would still be fine; three would start to crowd the breaker.
            </p>
          </>
        }
      />

      <h2 className="chapter-h2">Decoding NEMA pattern numbers</h2>

      <p className="mb-prose-3">
        Every NEMA configuration is named <strong className="text-text font-medium">X-YYR</strong> for a receptacle or <strong className="text-text font-medium">X-YYP</strong> for a plug,
        where <strong className="text-text font-medium">X</strong> is the configuration code and <strong className="text-text font-medium">YY</strong> is the current rating in
        amperes<Cite id="nema-wd-6" in={SOURCES} />. The configuration code encodes the voltage and the wire count:
      </p>
      <ul>
        <li><strong className="text-text font-medium">1</strong> — 125 V, 2-pole 2-wire (no ground). The original ungrounded outlet; rare in new construction, common in pre-1962 homes.</li>
        <li><strong className="text-text font-medium">5</strong> — 125 V, 2-pole 3-wire grounded. Hot, neutral, ground. The standard household outlet.</li>
        <li><strong className="text-text font-medium">6</strong> — 250 V, 2-pole 3-wire grounded. Two hots (180° apart), ground, no neutral.</li>
        <li><strong className="text-text font-medium">14</strong> — 125/250 V, 3-pole 4-wire grounded. Two hots, neutral, ground; gives both 240 V (between hots) and 120 V (each hot to neutral).</li>
      </ul>
      <p className="mb-prose-3">
        The <Term def={<><strong className="text-text font-medium">configuration code</strong> — the first integer in a NEMA pattern number, which encodes voltage and pole/wire count. 1 = 125 V ungrounded, 5 = 125 V grounded, 6 = 250 V grounded, 14 = 125/250 V grounded.</>}>configuration code</Term>{' '}
        and the slot geometry travel together: a 6-20P plug (250 V, 20 A) physically cannot enter a 5-15R receptacle
        (125 V, 15 A), because the slot orientations differ. That is the principal safety feature of the NEMA system —
        a 240 V appliance cannot be accidentally inserted into a 120 V outlet, and a 50 A range plug cannot be jammed
        into a 15 A duplex.
      </p>
      <p className="mb-prose-3">
        The maximum continuous power a given receptacle can deliver follows directly from its voltage and current
        rating:
      </p>
      <Formula>P_max = V × I_rated</Formula>
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">P_max</strong> is the maximum steady-state power the receptacle can deliver (in watts),
        <strong className="text-text font-medium"> V</strong> is the nominal voltage at the outlet (in volts — 120 V for a 5-pattern, 240 V for a
        6-pattern, 240 V line-to-line for a 14-pattern), and <strong className="text-text font-medium">I_rated</strong> is the current rating stamped
        on the device (in amperes). Plugging in the common patterns:
      </p>
      <ul>
        <li>5-15: 120 × 15 = <strong className="text-text font-medium">1800 W</strong></li>
        <li>5-20: 120 × 20 = <strong className="text-text font-medium">2400 W</strong></li>
        <li>6-15: 240 × 15 = <strong className="text-text font-medium">3600 W</strong></li>
        <li>6-20: 240 × 20 = <strong className="text-text font-medium">4800 W</strong></li>
        <li>14-30: 240 × 30 = <strong className="text-text font-medium">7200 W</strong></li>
        <li>14-50: 240 × 50 = <strong className="text-text font-medium">12000 W</strong></li>
      </ul>
      <p className="mb-prose-3">
        These are nameplate peaks. For a continuous load — one drawing current for three or more hours, in the NEC's
        definition — only 80 % of the rating may be used in steady state<Cite id="nec-2023" in={SOURCES} />. A 50 A
        outlet's continuous rating is 40 A; a 20 A outlet's continuous rating is 16 A. We'll come back to this in
        Try 30.5.
      </p>

      <h2 className="chapter-h2">Daisy-chaining receptacles</h2>

      <p className="mb-prose-3">
        A typical bedroom branch circuit feeds a string of five or six duplex receptacles, all wired in a single run
        from the breaker. The wiring sequence is the same at every box: the incoming cable is stripped, the bare
        ground wraps clockwise around the green screw, the white neutral wraps around an upper silver screw, the black
        hot wraps around an upper brass screw. The outgoing cable to the next box does the same — onto the
        <em className="italic text-text"> other</em> brass screw, the <em className="italic text-text">other</em> silver screw, and the <em className="italic text-text">other</em> green screw (or, more
        commonly, both grounds are pigtailed together with a third short jumper to the device).
      </p>
      <p className="mb-prose-3">
        Because the brass-side break-off tab is intact, both brass screws are electrically common; the same is true on
        the silver side. The receptacle is therefore a pass-through on both conductors, and the next outlet downstream
        gets the same hot and the same neutral as this one. Topologically:
      </p>
      <Formula>V_outlet ≈ V_line − I_branch × R_run</Formula>
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">V_outlet</strong> is the voltage available at a given outlet (in volts), <strong className="text-text font-medium">V_line</strong>
        {' '}is the nominal voltage at the panel (120 V for a standard branch), <strong className="text-text font-medium">I_branch</strong> is the total
        current being drawn by everything downstream of that point on the chain (in amperes), and
        <strong className="text-text font-medium"> R_run</strong> is the round-trip resistance of the copper from the panel to that point (in ohms; see
        Ch.29 for the gauge tables). Every outlet on the string sees the same nominal 120 V minus a small
        voltage-drop term that grows with the length of wire upstream of it.
      </p>
      <p className="mb-prose-3">
        Crucially, there is no <em className="italic text-text">hierarchy</em>. The first outlet on the chain doesn't "feed" the second the way a
        master feeds a slave. Each outlet is a parallel branch off the hot–neutral pair, and the load plugged into
        outlet #3 draws its current from the panel directly, not from the receptacles upstream of it. The current at
        the very first box equals the sum of all the loads plugged in further down — and that, plus the breaker
        rating, is what the gauge of the branch wire has to survive.
      </p>

      <TryIt
        tag="Try 30.2"
        question={
          <>
            Three 5-20 duplex receptacles are daisy-chained on a single 20 A circuit. Receptacle #2 has a{' '}
            <strong className="text-text font-medium">1500 W</strong> heater plugged in; receptacle #3 has a <strong className="text-text font-medium">1000 W</strong> toaster. What
            current does the wire <em className="italic text-text">between the panel and receptacle #1</em> carry, and is the 20 A breaker happy?
          </>
        }
        hint="Sum the currents of all downstream loads. Use P = VI at 120 V."
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">Each load's current at 120 V:</p>
            <Formula>I_heater = 1500 / 120 = 12.5 A</Formula>
            <Formula>I_toaster = 1000 / 120 ≈ 8.33 A</Formula>
            <p className="mb-prose-1 last:mb-0">
              Total at receptacle #1: <strong className="text-text font-medium">≈ 20.8 A</strong>. That exceeds the 20 A breaker's instantaneous rating
              and well exceeds the 80 % continuous rating of 16 A. The breaker would either trip on a thermal-magnetic
              curve within minutes or — if the loads cycled — wear the contacts out. NEC 210.23 effectively forbids
              this combination on one 20 A circuit<Cite id="nec-2023" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2 className="chapter-h2">Single-pole switches</h2>

      <p className="mb-prose-3">
        The simplest mechanical switch in residential wiring is the{' '}
        <Term def={<><strong className="text-text font-medium">single-pole switch</strong> — a wall switch with two terminals (plus an equipment ground) that interrupts a single conductor — the hot — between a line and a load. The simplest, cheapest, most common switch in residential wiring.</>}>single-pole switch</Term>:
        two screw terminals plus a ground screw, one toggle, on or off. The two screws are both brass; one accepts the
        line (incoming hot from the panel) and the other accepts the load (outgoing hot to the lamp). The internal
        contact bridges the two when the toggle is up and breaks them when the toggle is down. There is no electrical
        difference between the two screws — the switch is symmetric and either side can take the line.
      </p>
      <p className="mb-prose-3">
        The neutral does <em className="italic text-text">not</em> pass through the switch. It runs straight from the panel to the load and back,
        bypassing the switch box entirely on its way home. A switch interrupts <em className="italic text-text">only the hot</em>; the load is
        de-energised when the switch is open because no current can leave the panel, even though the neutral side of
        the load is still electrically tied to the system neutral.
      </p>
      <p className="mb-prose-3">
        That long-standing convention has one new wrinkle in the 2023 NEC. Section 404.2(C) now requires that a
        <strong className="text-text font-medium"> grounded (neutral) conductor be present in every switch box</strong>, even when the switch itself
        does not use it<Cite id="nec-2023" in={SOURCES} />. The reason is the rising population of smart switches and
        occupancy sensors: any device that contains electronics needs a sip of standby power to keep its radio alive,
        and that standby current has to flow somewhere. Without a neutral, the only return path is through the load
        itself, which works for incandescent bulbs (a few mA dropped across a tungsten filament does nothing) but
        misbehaves with LED loads (the same mA, dropped across a switched-mode LED driver, makes the lamp flicker
        when "off"). The NEC's solution is to insist the neutral be present from day one so the future smart-switch
        retrofit doesn't require pulling new cable.
      </p>

      <h2 className="chapter-h2">Three-way switches</h2>

      <p className="mb-prose-3">
        Stand at the bottom of a staircase. Flip the switch by the front door and the upstairs hall light comes on.
        Climb the stairs. Flip the switch at the top of the landing. The same light turns off. Either switch toggles
        the lamp regardless of where the other one was last left. This is the classic two-switch staircase, and the
        device that does it is the{' '}
        <Term def={<><strong className="text-text font-medium">three-way switch</strong> — a switch with three current-carrying terminals (one common + two travellers) plus a ground, used in pairs to control one load from two locations. Not actually "three-way" in the sense of three states — it has two states, and the name is the count of conductive screws.</>}>three-way switch</Term>.
      </p>
      <p className="mb-prose-3">
        Counter-intuitively, a three-way switch is named for its terminal count, not its state count. It has three
        current-carrying screws: one{' '}
        <Term def={<><strong className="text-text font-medium">common terminal</strong> — the single screw on a three-way switch that is wired to either the line (at the line-end switch) or to the load (at the load-end switch). Always darker — typically black, sometimes copper-coloured — to distinguish it from the two traveller screws.</>}>common terminal</Term>{' '}
        (usually a darker brass or copper colour) and two{' '}
        <Term def={<><strong className="text-text font-medium">traveller</strong> — one of the two conductors that run between the two three-way switches of a pair. The state of the load is determined by whether both switches are pointing at the same traveller (load on) or different travellers (load off).</>}>travellers</Term>{' '}
        (matching brass). Internally, the switch is a single-pole double-throw (SPDT): the common is always connected
        to <em className="italic text-text">one</em> of the two travellers, and the toggle picks which one.
      </p>
      <p className="mb-prose-3">
        Wire two three-way switches with their commons at the line and the load and their travellers tied together
        between them, and the resulting circuit is a XOR. Call switch 1's state <strong className="text-text font-medium">S₁ ∈ &#123;0,1&#125;</strong>
        {' '}for which traveller it is currently pointing at, and the same for switch 2. The load is energised when the
        two switches have <em className="italic text-text">matching</em> travellers selected — both 0 or both 1 — and de-energised when they
        differ. In one line of truth-table:
      </p>
      <Formula>load_state = ¬(S₁ ⊕ S₂)</Formula>
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">S₁</strong> and <strong className="text-text font-medium">S₂</strong> are the binary states of the two switches (which traveller
        each is presently selecting; 0 or 1), <strong className="text-text font-medium">⊕</strong> is the XOR operator, and{' '}
        <strong className="text-text font-medium">load_state ∈ &#123;0,1&#125;</strong> is whether the lamp is on (1) or off (0). Flipping either
        switch alone inverts <strong className="text-text font-medium">load_state</strong>, which is the whole point.
      </p>
      <p className="mb-prose-3">
        Two physical topologies show up in the field. The first is <em className="italic text-text">line at switch 1, load at switch 2</em>: the
        hot enters the first switch's common, the two travellers run as a 3-wire cable to the second switch, and the
        second switch's common feeds the lamp. The second is <em className="italic text-text">line in the middle, switches on either side</em>: the
        feed and the load both originate at the ceiling box (where the lamp lives), and a 3-wire cable runs to each
        switch. Electrically the two topologies are identical — only the path the cables physically take through the
        wall differs.
      </p>
      <p className="mb-prose-3">
        It is much easier to <em className="italic text-text">see</em> the three-way wiring than to read about it, and easier still to misroute a
        wire yourself once and learn what goes wrong than to memorise the diagram. The demo below exposes the ten
        terminals of a minimal three-way circuit — power-hot, power-neutral, the common and two travellers of each
        switch, and the bulb's hot and neutral screws — and lets you connect them with click-to-wire. Your job is to
        produce the canonical 3-way topology: hot into the first switch's common, traveller-to-traveller between the
        two switches, second switch's common out to the bulb, neutral from the source straight to the bulb. Five wires
        total.
      </p>
      <p className="mb-prose-3">
        Once the wiring is right, the bulb lights when both switches point at the same traveller; flipping either one
        toggles the lamp. The two common beginner mistakes are flagged in red as you make them. The first is wiring both
        of switch 1's travellers to the <em className="italic text-text">same</em> screw on switch 2 — that collapses the SPDT into a single-pole
        switch and the second switch loses its half of the XOR. The second is routing the neutral through one of the
        switches — switches interrupt only the hot, and a neutral that detours through a switch leaves the lamp
        de-energised whenever the switch happens to break the wrong leg.
      </p>

      <ThreeWaySwitchBuilderDemo />

      <p className="mb-prose-3">
        For three or more switches controlling a single load — a stairwell with a switch at the top, middle, and
        bottom — the two endpoints remain three-ways and any switch in between becomes a{' '}
        <Term def={<><strong className="text-text font-medium">four-way switch</strong> — a switch with four current-carrying terminals (two pairs of travellers) plus a ground, used in the middle of a three-or-more-switch chain. Internally a DPDT swap: it cross-connects or straight-connects the two travellers passing through it.</>}>four-way switch</Term>. A four-way switch has four screws and, internally,
        is a double-pole double-throw (DPDT) switch wired as a crossover: in one state it passes the two travellers
        straight through, in the other it swaps them. Adding an N-way switch to a chain doubles the number of possible
        configurations of the chain (2<sup>N</sup> total), and exactly half of them light the lamp.
      </p>

      <TryIt
        tag="Try 30.3"
        question={
          <>
            In a two-switch staircase, switch 1 is in the "up" position (traveller A) and switch 2 is in the "down"
            position (traveller B). Is the lamp on or off? Now imagine flipping switch 2. Now flipping switch 1 from
            that new state.
          </>
        }
        hint="Map up/down to 0/1, compute S₁ ⊕ S₂, and toggle one bit at a time."
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">Encode up = 0 (traveller A) and down = 1 (traveller B). Initial state S₁ = 0, S₂ = 1, so:</p>
            <Formula>load_state = ¬(0 ⊕ 1) = ¬1 = 0</Formula>
            <p className="mb-prose-1 last:mb-0">Lamp is <strong className="text-text font-medium">off</strong>. Flip switch 2: S₂ → 0, so load_state = ¬(0 ⊕ 0) = 1. Lamp <strong className="text-text font-medium">on</strong>. Flip switch 1: S₁ → 1, so load_state = ¬(1 ⊕ 0) = 0. Lamp <strong className="text-text font-medium">off</strong> again. Every flip inverts the lamp regardless of the other switch's position — which is exactly the property a staircase wants.</p>
          </>
        }
      />

      <Pullout>
        A three-way switch isn't three-way; it's two-way with a third pin to remind you that someone has to win the XOR.
      </Pullout>

      <h2 className="chapter-h2">Dimmers, phase cutting, and LED compatibility</h2>

      <p className="mb-prose-3">
        A wall <Term def={<><strong className="text-text font-medium">dimmer</strong> — a wall switch whose internal solid-state device (typically a triac) chops the AC waveform delivered to the load, varying the load's time-averaged power by varying the fraction of each half-cycle the device conducts.</>}>dimmer</Term>{' '}
        replaces the snap-action contact of a single-pole switch with a solid-state device — almost always a{' '}
        <Term def={<><strong className="text-text font-medium">triac</strong> — a bidirectional thyristor; a solid-state AC switch that, once triggered by a gate pulse during a half-cycle, stays on for the remainder of that half-cycle then automatically turns off at the next zero-crossing. The standard switching element in low-cost AC dimmers.</>}>triac</Term>. A triac is a bidirectional thyristor: once gated on during a half-cycle, it stays conducting until
        the current next crosses zero, at which point it shuts off automatically. By delaying the gate pulse, the
        dimmer can hold the load OFF for the first portion of each half-cycle and turn it ON only for the
        remainder. The result is a chopped sine wave; the load receives less time-averaged power and dims
        accordingly<Cite id="lutron-dimmer-app-note" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        Two flavours of <Term def={<><strong className="text-text font-medium">phase-cut</strong> — a dimming technique that chops a portion of each AC half-cycle to vary the load's time-averaged power. Leading-edge cuts the front of each half-cycle (the cheap triac-based topology); trailing-edge cuts the back (a more expensive MOSFET- or IGBT-based topology, better suited to electronic loads).</>}>phase-cut</Term> dimming exist:
      </p>
      <ul>
        <li>
          <Term def={<><strong className="text-text font-medium">Leading-edge</strong> dimming — the dimmer holds the load OFF at the start of each half-cycle then turns it ON for the remainder. Built from a triac; cheap, robust, but generates a steep <em className="italic text-text">di/dt</em> at switch-on that can stress small switching power supplies.</>}>Leading-edge</Term>{' '}
          (forward phase-cut): the dimmer holds the line OFF at the start of each half-cycle and turns it ON
          partway through. Built from a triac; cheap, robust, and the historical default for incandescent and halogen
          loads. The downside is the steep <em className="italic text-text">di/dt</em> at turn-on — the load goes from zero current to whatever
          the resistive load wants in microseconds, which can stress electronic loads not designed for the
          surge<Cite id="lutron-dimmer-app-note" in={SOURCES} />.
        </li>
        <li>
          <Term def={<><strong className="text-text font-medium">Trailing-edge</strong> dimming — the dimmer turns the load ON at the zero-crossing and turns it OFF partway through the half-cycle. Built from a MOSFET or IGBT with a gate-driver capable of forced commutation. Better behaved with electronic loads; more expensive.</>}>Trailing-edge</Term>{' '}
          (reverse phase-cut): the dimmer turns the load ON at the zero-crossing and OFF partway through the
          half-cycle. Built from a MOSFET or IGBT — devices that can be forced off mid-conduction, unlike a triac.
          Much gentler on switched-mode power supplies because the turn-on occurs at zero current; correspondingly
          better suited to LED drivers and electronic low-voltage transformers.
        </li>
      </ul>
      <p className="mb-prose-3">
        For a pure resistive load (an incandescent bulb, a heater), the RMS voltage delivered as a function of the
        conduction angle of the dimmer is a clean trigonometric expression. Define{' '}
        <Term def={<><strong className="text-text font-medium">conduction angle</strong> — the fraction of an AC half-cycle (in radians) during which a dimmer's switching device is in its ON state. α = π means fully on (the dimmer is bypassed); α = 0 means fully off.</>}>α</Term>{' '}
        as the conduction angle: the portion of each half-cycle, in radians, that the triac is on. For a leading-edge
        dimmer with conduction angle α (so the device fires at phase π − α and conducts to π), the RMS voltage
        delivered to a resistive load is:
      </p>
      <Formula>V_rms = V_peak × √(α/π − sin(2α)/(2π))</Formula>
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">V_rms</strong> is the root-mean-square voltage across the load (in volts),
        <strong className="text-text font-medium"> V_peak</strong> is the peak of the AC line waveform (in volts; for a nominal 120 V_rms line,
        V_peak = 120 × √2 ≈ 170 V), and <strong className="text-text font-medium">α</strong> is the conduction angle in radians (0 ≤ α ≤ π). At
        α = π (the triac is on for the entire half-cycle), the square root reduces to √(1 − 0) = 1, and
        V_rms = V_peak, which would mean V_peak's RMS equals itself — that's the dimmer fully bypassing the load. In
        terms of the line RMS V_line = V_peak/√2, the formula is equivalently V_rms = V_line × √(2α/π − sin(2α)/π),
        which at α = π returns V_line as expected. At α = 0 (the triac never fires), V_rms = 0 and the load is off.
      </p>
      <p className="mb-prose-3">
        The average power delivered to a purely resistive load follows from the usual identity{' '}
        <strong className="text-text font-medium">P = V_rms² / R</strong>, so cutting the conduction angle by half does <em className="italic text-text">not</em> halve the
        delivered power — it removes a chunk of the part of the half-cycle nearest the peak, and the integrand is
        quadratic in voltage there, so the power drops faster than the average. That asymmetry is why incandescent
        dimmers feel "non-linear" near full bright; the lamp's brightness as a function of slider position has a
        knee.
      </p>
      <p className="mb-prose-3">
        LEDs are not a resistive load. An{' '}
        <Term def={<><strong className="text-text font-medium">LED bulb</strong> — a screw-base lamp that hides a switched-mode AC-to-DC driver in its base, feeding a string of light-emitting diodes. The driver presents a non-linear, frequency-dependent impedance to the line and only sometimes plays nicely with a phase-cut dimmer.</>}>LED bulb</Term>{' '}
        is an integrated circuit (a switched-mode driver) feeding a string of diodes. The driver's input draws current
        in narrow gulps at the peaks of the line voltage, not smoothly throughout the half-cycle. Pair a leading-edge
        triac dimmer with an LED driver and three failure modes show up regularly. <em className="italic text-text">Flicker</em>: the driver's
        input capacitor charges so quickly that the triac mis-fires or stops conducting before the half-cycle ends.
        <em className="italic text-text"> Buzzing</em>: the di/dt at triac firing excites mechanical resonances in the inductors inside the
        driver's EMI filter. <em className="italic text-text">Refusal to dim below 50 %</em>: at low conduction angle the driver's input voltage
        drops below the regulator's dropout and the LED simply stays off. The cure is either an LED bulb explicitly
        marketed as "dimmer-compatible" or a trailing-edge dimmer (or an MLV/ELV-rated dimmer) that switches at the
        zero-crossing and matches the driver's expected load
        profile<Cite id="lutron-dimmer-app-note" in={SOURCES} />.
      </p>

      <TryIt
        tag="Try 30.4"
        question={
          <>
            A 1500 W incandescent shop lamp is on a leading-edge dimmer set to a conduction angle of{' '}
            <strong className="text-text font-medium">α = π/2</strong> — the triac is conducting for exactly half of each half-cycle. The line is the
            U.S. standard 120 V_rms (V_peak ≈ 169.7 V). What is the RMS voltage delivered to the lamp, and what is the
            average power dissipated by the bulb (treating its filament as constant resistance for this estimate)?
          </>
        }
        hint={<>Plug α = π/2 into V_rms = V_peak × √(α/π − sin(2α)/(2π)); note sin(π) = 0. Then compute the bulb's cold-resistance from its 1500 W rating at 120 V_rms.</>}
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">With α = π/2 and sin(2·π/2) = sin(π) = 0:</p>
            <Formula>V_rms = 169.7 × √(0.5 − 0) = 169.7 × √0.5 ≈ 120.0 V</Formula>
            <p className="mb-prose-1 last:mb-0">
              That happens to be the nominal line RMS — at α = π/2 the leading-edge dimmer delivers exactly the full
              line's RMS. The resistance implied by the bulb's nameplate is R = V²/P = 120²/1500 = 9.6 Ω, so the average
              power is:
            </p>
            <Formula>P = V_rms² / R = 120² / 9.6 ≈ 1500 W</Formula>
            <p className="mb-prose-1 last:mb-0">
              Answer: <strong className="text-text font-medium">≈ 1500 W</strong> — full brightness. The phase-cut formula is symmetric about α = π/2 in
              its RMS value because the cut portion of the half-cycle has the same energy as the conducting portion at
              that conduction angle<Cite id="lutron-dimmer-app-note" in={SOURCES} />. Dimming below half-brightness
              requires α &lt; π/2; below α = π/3 the brightness falls off sharply.
            </p>
          </>
        }
      />

      <TryIt
        tag="Try 30.5"
        question={
          <>
            A 14-50 receptacle is being installed for a level-2 EV charger. The dedicated branch breaker is rated
            <strong className="text-text font-medium"> 50 A</strong>. NEC 625.41 treats EV charging as a continuous load, so the charger is permitted to
            draw at most 80 % of the breaker rating in steady state. What is the maximum continuous current the EVSE
            may pull, and what continuous power does that imply at the nominal 240 V?
          </>
        }
        hint="Multiply by 0.80 for the continuous-current limit, then by 240 V for the power."
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">Apply the 80 % continuous-load factor<Cite id="nec-2023" in={SOURCES} />:</p>
            <Formula>I_continuous = 0.80 × 50 A = 40 A</Formula>
            <Formula>P_continuous = V × I = 240 × 40 = 9600 W</Formula>
            <p className="mb-prose-1 last:mb-0">
              Answer: <strong className="text-text font-medium">40 A continuous, 9.6 kW</strong>. A typical level-2 EV charger sold for a 50 A circuit
              is configured to negotiate exactly that 40 A pilot signal — anything higher would either trip the
              breaker on a long charge session or violate the listing of the EVSE.
            </p>
          </>
        }
      />

      <CaseStudies
        intro={
          <>
            Two devices that show what receptacles, switches, and dimmers look like in the wild — and one retrofit that
            demonstrates why the 2023 NEC's neutral-in-every-switch-box rule exists.
          </>
        }
      >
        <CaseStudy
          tag="Case 30.1"
          title="A commercial-grade 20 A duplex receptacle"
          summary="Specification-grade hardware engineered for a thousand insertions and a 75 °C terminal."
          specs={[
            { label: 'NEMA pattern', value: <>5-20R, 125 V / 20 A <Cite id="nema-wd-6" in={SOURCES} /></> },
            { label: 'Listing standard', value: <>UL 498 <Cite id="ul-498" in={SOURCES} /></> },
            { label: 'Terminal screws', value: <>2 brass (hot), 2 silver (neutral), 1 green (ground); back-wire clamps</> },
            { label: 'Wire range', value: <>14 AWG to 10 AWG copper, per UL 498 <Cite id="ul-498" in={SOURCES} /></> },
            { label: 'NEC reference', value: <>Installed per NEC 110.3(B) listing <Cite id="nec-2023" in={SOURCES} /></> },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            A specification-grade 20 A duplex receptacle is built to take repeated insertions and remove the most
            common failure modes of contractor-grade hardware. The slot geometry is the standard 5-20R defined by NEMA
            WD 6<Cite id="nema-wd-6" in={SOURCES} /> — vertical hot, T-shaped neutral so both 5-15P and 5-20P plugs
            fit, round ground hole below. The face is over-moulded onto a one-piece steel strap that gives the device
            its mechanical rigidity, and the contact stampings inside are heavier-gauge brass than the cheap residential
            grade.
          </p>
          <p className="mb-prose-2 last:mb-0">
            What separates commercial-grade from residential-grade is mostly the termination. Instead of the
            spring-loaded push-in holes on the back of a contractor-grade device, a commercial duplex has clamped
            back-wires — the conductor pushes straight into a hole behind the side screw, and the side screw, when
            tightened, drives a pressure plate down onto the conductor. The result is a gas-tight clamp on a straight
            wire, faster than wrapping a screw and tighter than a push-in. The body is qualified to the temperature-rise
            and dielectric-withstand performance criteria of UL 498<Cite id="ul-498" in={SOURCES} />, which means it can
            be installed and forgotten for the life of the building.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 30.2"
          title="A three-switch stairwell"
          summary="Two three-ways at the endpoints, one four-way in the middle, eight configurations, four that turn the lamp on."
          specs={[
            { label: 'Devices', value: <>2× three-way switches (endpoints) + 1× four-way switch (middle landing) + 1× ceiling lamp</> },
            { label: 'Travellers in middle box', value: <>4 (two pairs running through the four-way)</> },
            { label: 'Configurations', value: <>2³ = 8 total switch positions; exactly 4 of them illuminate the lamp</> },
            { label: 'NEC reference', value: <>Box-fill calculation per NEC 314.16 <Cite id="nec-2023" in={SOURCES} /></> },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            Picture a three-story house with the staircase light controlled from the ground floor, the middle landing,
            and the upstairs hall. The standard topology runs the line into the ground-floor switch box, wires that
            switch as a three-way with its common on the line, then runs a 3-wire cable up to the middle landing. The
            middle-landing switch is a four-way: it receives two travellers from below and sends two travellers up,
            and in its two internal states either passes the travellers straight through or swaps them. The two travellers
            from the four-way then continue up to the upstairs switch, also a three-way, with its common on the load
            (the lamp).
          </p>
          <p className="mb-prose-2 last:mb-0">
            The truth table now has 2<sup>3</sup> = 8 rows — one for each combination of three switch positions — and
            exactly four of them light the lamp. The XOR of all three switch bits, inverted, gives the load state. Any
            single flip toggles the lamp regardless of which switch was flipped or what the others were doing. Adding a
            fourth landing simply inserts another four-way between the existing four-way and the upstairs three-way; the
            truth table doubles, and the property is preserved<Cite id="nec-2023" in={SOURCES} />. The box-fill
            calculation in NEC 314.16 has to account for the extra conductors the four-way introduces, which is why
            mid-loop switches sometimes need a deeper box than the endpoints.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 30.3"
          title="A smart-dimmer retrofit and the neutral-in-every-box rule"
          summary="Why pulling a new switch into the 21st century requires a wire most pre-2014 boxes don't have."
          specs={[
            { label: 'Load type', value: <>Phase-cut dimmer, leading- or trailing-edge selectable <Cite id="lutron-dimmer-app-note" in={SOURCES} /></> },
            { label: 'Standby current draw', value: <>A few milliamperes from the line for radio + microcontroller</> },
            { label: 'Required conductor', value: <>Neutral in the switch box — mandated by NEC 404.2(C) since 2011 <Cite id="nec-2023" in={SOURCES} /></> },
            { label: 'Why it matters', value: <>Without neutral, standby current flows through the load and can make LED lamps glow when "off"</> },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            A modern smart wall-dimmer is a triac (or MOSFET) phase-cut dimmer with a small microcontroller, a Wi-Fi or
            Zigbee radio, and an enclosure designed to drop into a standard switch box<Cite id="lutron-dimmer-app-note" in={SOURCES} />.
            The electronics need to be powered 24 hours a day — the radio has to hear the "turn on" command even when
            the load is off — so the device draws a steady few milliamperes from the line for its own housekeeping.
            That standby current needs a return path.
          </p>
          <p className="mb-prose-2 last:mb-0">
            A dumb single-pole switch contains no electronics and needs no return path: when the toggle is open, no
            current flows, period. A smart switch breaks that assumption. Without a neutral wire in the switch box, the
            only return available is through the lamp itself, and a few milliamperes through an incandescent filament
            does nothing. Run the same standby current through an LED driver and the driver's input capacitor charges
            enough to fire the LEDs at low brightness — the bulb glows dimly when the switch is supposedly off.
          </p>
          <p className="mb-prose-2 last:mb-0">
            The 2023 NEC, refining a rule first introduced in the 2011 cycle, requires a grounded conductor (neutral) to
            be present in every switch box installed in new construction<Cite id="nec-2023" in={SOURCES} />. The rule
            exists exactly so that future smart-switch retrofits — which the code anticipates as the dominant
            installation pattern — can land their standby current on a real neutral instead of bleeding it through the
            load.
          </p>
        </CaseStudy>
      </CaseStudies>

      <FAQ intro="Questions readers ask after this chapter — receptacles, switches, dimmers, and the quirks of the wall-box.">
        <FAQItem q="Why is the neutral slot bigger than the hot slot on a 5-15 receptacle?">
          <p>
            So a polarised two-prong plug can only enter one way. The wider blade goes into the wider slot, lining up
            the appliance's internal neutral with the building's neutral and its internal switch with the building's
            hot. That keeps the switch on the energised side of the load when the appliance is "off," so the load
            isn't sitting at line potential through an unswitched filament. The asymmetry is a defined feature of
            NEMA WD 6<Cite id="nema-wd-6" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Can I plug a 5-15 plug into a 5-20 receptacle (the one with the T-slot)?">
          <p>
            Yes. The T-slot on a 5-20R receptacle is shaped so that both a standard 5-15P plug (two parallel blades)
            and a 5-20P plug (one blade rotated 90°) physically fit<Cite id="nema-wd-6" in={SOURCES} />. The reverse is
            not allowed: a 5-20P plug will not enter a 5-15R, because the receptacle's neutral slot is a simple
            rectangle and refuses the rotated blade. That asymmetry keeps a 20 A appliance from being plugged into a
            15 A circuit.
          </p>
        </FAQItem>

        <FAQItem q="Why does an outdoor receptacle have a weatherproof cover even when nothing's plugged in?">
          <p>
            Because NEC 406.9(B)(1) requires it: outdoor receptacles must remain weatherproof "in use" — meaning with a
            cord plugged in — not just when idle<Cite id="nec-2023" in={SOURCES} />. The bubble-style "in-use cover"
            extends out from the wall enough to enclose both the receptacle and the head of the cord cap, so wind-driven
            rain doesn't find its way to the brass terminals. A flat flap cover only seals when the receptacle is empty
            and is no longer compliant for new outdoor installations.
          </p>
        </FAQItem>

        <FAQItem q="What's a 'switched outlet' and how is it wired?">
          <p>
            A switched outlet is a duplex receptacle whose top half is controlled by a wall switch and whose bottom half
            stays always-on (or vice versa). The wiring is the standard duplex installation with one twist: the
            brass-side break-off tab between the two hot screws is snapped off with pliers. That isolates the two halves
            on their hot conductor, so one half can be fed from the switched leg and the other from the always-on leg.
            The silver-side tab is left intact — the neutrals stay common.
          </p>
        </FAQItem>

        <FAQItem q="Why are some duplex receptacles 'tamper-resistant' by code now?">
          <p>
            Since the 2008 NEC, all 15 A and 20 A 125 V receptacles in dwelling-unit locations must be{' '}
            <Term def={<><strong className="text-text font-medium">tamper-resistant (TR)</strong> — a receptacle with internal shutters that block both slots until the shutters are pushed simultaneously, i.e., until a real two-bladed plug is inserted. Required by NEC 406.12 in dwelling-unit locations since 2008.</>}>tamper-resistant</Term>{' '}
            (TR), per NEC 406.12<Cite id="nec-2023" in={SOURCES} />. The receptacle contains internal shutters that
            block both slots until they are pushed simultaneously — which only happens when a two-bladed plug enters,
            not when a child pushes in a hairpin or key. The rule was driven by burn-injury statistics in young
            children; the device adds maybe a dollar to the cost.
          </p>
        </FAQItem>

        <FAQItem q="Can a three-way switch be used as a single-pole switch?">
          <p>
            Yes, by using only the common terminal and one of the two travellers and ignoring the other. The switch's
            internal SPDT then degenerates to an SPST: in one toggle position the common is connected to the wired
            traveller (load on), and in the other position it's connected to the unused traveller (load off, because
            the unused screw goes nowhere). Many electricians keep three-ways in stock as a single-pole substitute. The
            only catch is the "ON/OFF" indication is missing from the toggle, because a three-way doesn't have a
            preferred up/down orientation.
          </p>
        </FAQItem>

        <FAQItem q="Why do dimmers sometimes hum?">
          <p>
            Mechanical vibration in the load. A leading-edge phase-cut dimmer fires the triac partway through each
            half-cycle, applying a sudden voltage step to the load; the load's inductance (filament coiling, transformer
            laminations) resonates at 60 Hz and its harmonics, and the result is an audible buzz<Cite id="lutron-dimmer-app-note" in={SOURCES} />.
            Bulbs marked "rough-service" or "dimmer-compatible" have stiffer filament supports specifically to suppress
            the resonance. Magnetic low-voltage transformers (MLV) almost always hum on cheap dimmers; the cure is an
            MLV-rated dimmer that controls the inrush more gently.
          </p>
        </FAQItem>

        <FAQItem q="What's the difference between 'MLV' (magnetic low voltage) and 'ELV' (electronic low voltage) dimmers?">
          <p>
            They're both dimmers for low-voltage lighting (typically 12 V halogen or LED tape behind a transformer), but
            they assume different transformer types. MLV dimmers expect a magnetic (iron-core) step-down transformer,
            which is inductive and tolerates leading-edge phase-cut chopping. ELV dimmers expect an electronic
            (switched-mode) transformer, which is capacitive and prefers trailing-edge chopping that turns on at
            zero-current and off mid-cycle<Cite id="lutron-dimmer-app-note" in={SOURCES} />. Using the wrong type
            usually doesn't cause an immediate failure but produces buzzing, flicker, or a shortened transformer life.
          </p>
        </FAQItem>

        <FAQItem q="Can I put a GFCI receptacle on a circuit that's already protected by a GFCI breaker?">
          <p>
            You can, but it's redundant and a maintenance headache. Both devices trip on the same fault signal (5 mA
            imbalance between hot and neutral) but cannot communicate with each other; either one can trip first, and
            once one has tripped the other appears as "still working," which makes diagnosis harder. NEC 210.8 only
            requires a single layer of GFCI protection on the circuits it lists<Cite id="nec-2023" in={SOURCES} />, so
            installing both is over-design rather than a code violation.
          </p>
        </FAQItem>

        <FAQItem q="Why is the ground hole on the bottom of some receptacles and on top of others?">
          <p>
            The NEC is silent on orientation, and both are equally compliant<Cite id="nec-2023" in={SOURCES} />.
            "Ground-up" is preferred by many commercial electricians on the argument that a partially-inserted plug, if
            something metal drops past it, will hit the ground blade first instead of the hot. "Ground-down" is the
            traditional residential convention because the resulting outline vaguely resembles a face. The plug fits
            either way, so the choice is aesthetic rather than electrical.
          </p>
        </FAQItem>

        <FAQItem q="What's 'downstream protection' from a GFCI receptacle and why does it work?">
          <p>
            A GFCI receptacle has two pairs of terminals: LINE (feeding the GFCI itself) and LOAD (feeding everything
            wired downstream). Anything connected to the LOAD pair receives ground-fault protection from the same
            internal sensor that protects the GFCI's own face, because all of it shares one current-balance transformer
            inside the device<Cite id="nec-2023" in={SOURCES} />. That lets one GFCI at the head of a string protect
            three or four ordinary receptacles further along — a common bathroom or kitchen-counter wiring trick.
          </p>
        </FAQItem>

        <FAQItem q="Why does my 3-way switch sometimes work as expected and sometimes seem 'backwards' after re-wiring?">
          <p>
            Because the wiring is correct but one switch's toggle is mounted upside down. Three-ways do not have a
            preferred up = on / down = off orientation — they have two indistinguishable states and a XOR connecting
            them — so after a re-wire the toggle's "up" position may correspond to either traveller. The lamp toggles
            correctly with every flip; the visual labelling just lies about which physical position is "on." Flip the
            switch in its yoke (rotate 180°) and the labelling matches the behaviour again.
          </p>
        </FAQItem>

        <FAQItem q="Does a switched-off light fixture still have live wires in the box?">
          <p>
            Yes — the neutral side. A single-pole or three-way switch only interrupts the hot, leaving the load's
            neutral conductor tied straight back to the panel. With the switch off, the load is de-energised because no
            current can flow, but the neutral conductor is still electrically connected to the system neutral, which is
            bonded to ground at the service panel. Touching just the neutral while standing on a grounded floor is
            normally harmless (no potential difference); touching the hot conductor on the line side of an open switch
            is not — it remains at full line voltage relative to ground.
          </p>
        </FAQItem>

        <FAQItem q="Why is the elementary charge relevant when I'm just trying to wire an outlet?">
          <p>
            It mostly isn't, but the rating on the device traces all the way back to it. A 15 A receptacle's nameplate
            number is a count of coulombs per second of charge flowing through its contacts in steady state, and one
            ampere is one coulomb per second — about 6.24×10<sup>18</sup> elementary charges of e ≈ 1.602×10<sup>−19</sup> C
            each, per second<Cite id="codata-2018" in={SOURCES} />. The brass and silver labelling and the slot
            geometry are just engineering wrappers around that count.
          </p>
        </FAQItem>
      </FAQ>
    </ChapterShell>
  );
}
