/**
 * Chapter 36 — Troubleshooting: the meter and the flowchart
 *
 * The second DIY-with-theory chapter. The argument: most residential
 * electrical "mysteries" resolve in five minutes with the right meter
 * and a four-branch decision tree. The chapter surveys the four common
 * meters (NCVT, two-pole probe, DMM, clamp), explains the phantom-voltage
 * trap with the input-impedance math, walks the dead-outlet flowchart,
 * categorises the three breaker trip modes, and shows how a clamp meter
 * locates parasitic loads. No new demo components; this is a prose-and-
 * formula chapter that the reader is expected to apply with hardware in
 * hand.
 *
 * Whitelisted sources for this chapter:
 *   nec-2023, ul-498, horowitz-hill-2015,
 *   keysight-34465a-datasheet, iec-60479-2018, codata-2018.
 *
 * The chapter cites only those six keys.
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

export default function Ch36HouseTroubleshooting() {
  const chapter = getChapter('house-troubleshooting')!;
  const SOURCES = chapter.sources;

  return (
    <ChapterShell chapter={chapter}>
      <p className="mb-prose-3 first-letter:font-2 first-letter:font-light first-letter:text-[4em] first-letter:leading-none first-letter:float-left first-letter:m-[4px_12px_-4px_0] first-letter:text-accent">
        You plug the toaster in and nothing happens. The element doesn't glow, the timer dial doesn't tick, the
        little red pilot light stays dark. You glance at the microwave on the next counter and the clock face is
        dark too. You walk down to the basement, open the panel, and stare at forty identical black handles. None
        of them obviously sits in the middle position that flags a tripped breaker. You are about to flip them off
        and on one at a time — twenty minutes of running back upstairs to test the toaster — and hope something
        works.
      </p>
      <p className="mb-prose-3">
        There is a faster way, and it begins with the observation that a circuit's failure leaves a fingerprint.
        Hot-to-neutral reads one number; hot-to-ground reads another; neutral-to-ground reads a third. Those three
        numbers — twelve seconds of probing at the dead outlet — narrow the fault to one of four branches of a
        diagnostic tree, and each branch has a single next move. The right starting tool is a meter, not a finger
        on a breaker. This chapter is about which meter, which probes, which sequence, and which mental model of
        the failure modes makes the readings legible.
      </p>

      <h2 className="font-2 font-light italic text-[clamp(28px,3.5vw,42px)] leading-1 tracking-1 text-text mt-3xl mb-2xl max-w-[28ch]">Four meters, four jobs</h2>

      <p className="mb-prose-3">
        The electrical aisle of a hardware store stocks four broad families of voltage-and-current instrument, and
        every one of them is the right tool for some questions and the wrong tool for others. Knowing which is
        which is half the troubleshooting skill.
      </p>

      <h3 className="font-2 font-medium text-4 uppercase tracking-4 text-accent mt-xl mb-[0.875rem]">The non-contact voltage tester</h3>
      <p className="mb-prose-3">
        A {' '}
        <Term def={<><strong className="text-text font-medium">NCVT</strong> (non-contact voltage tester) — a pen-shaped tool that senses the AC electric field around a live conductor through its insulation. Yes/no presence test only; reads on capacitive coupling, not on conduction.</>}>NCVT</Term>{' '}
        is a plastic pen with a battery, a tip antenna, and a beeper. Hold the tip near an energised conductor —
        even through the insulation — and the AC electric field that leaks out of the wire couples capacitively
        into the antenna, drives a small displacement current through the input op-amp, and lights an LED. It does
        not touch the copper; it does not measure a number; it tells you live or dead, nothing else. The good
        ones (Fluke 1AC II, Klein NCVT-3) are calibrated to ignore the field a few centimetres away and respond
        only when the tip is within a finger's width of the conductor<Cite id="horowitz-hill-2015" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        The trap with an NCVT is that it has four failure modes and you can never quite be sure which one is in
        play. The battery dies silently and the tool just stops beeping. Adjacent live conductors in the same box
        couple to the tested conductor and make a dead wire read live. AFCI and GFCI breakers inject small
        high-frequency test pulses that some NCVTs mistake for line voltage. And the tip antenna is directional —
        rotate the pen ninety degrees and a wire that beeped a moment ago may not beep now. Use an NCVT for the
        first ten seconds of any job, then verify with a contact-based tool. Never trust it alone.
      </p>

      <h3 className="font-2 font-medium text-4 uppercase tracking-4 text-accent mt-xl mb-[0.875rem]">The two-pole probe</h3>
      <p className="mb-prose-3">
        A {' '}
        <Term def={<><strong className="text-text font-medium">two-pole probe</strong> — a contact voltage tester with two metal tips, internal solenoid or filament load, and a backlit display or LED bar. Examples: Fluke T5, Fluke T6, Wiggy. Loads the circuit enough (mA, not µA) to swamp capacitive leakage; the verify-dead standard.</>}>two-pole probe</Term>{' '}
        — Fluke's T5 and T6, Klein's ET250, or the original 1920s-era solenoid-based "Wiggy" — looks like a fat
        screwdriver with a second probe on a short lead. You press one tip against each conductor and a backlit
        display or a column of LEDs tells you the voltage. There is no range selector; the tool autoranges from
        12 V to 600 V AC. There is often no battery at all (the original Wiggy is powered by the circuit under
        test).
      </p>
      <p className="mb-prose-3">
        The crucial property of a two-pole probe is its load impedance. Where a DMM presents 10 MΩ to the signal,
        a two-pole tester presents a few hundred ohms to a few kilo-ohms — enough to draw milliamps from the
        conductor under test, which is enough to collapse any capacitively-coupled phantom voltage to nearly
        zero. If a two-pole probe reads zero on a wire you intend to cut, the wire is dead — that is the
        NFPA-70E-aligned verify-dead procedure that every working electrician follows<Cite id="horowitz-hill-2015" in={SOURCES} />.
      </p>

      <h3 className="font-2 font-medium text-4 uppercase tracking-4 text-accent mt-xl mb-[0.875rem]">The digital multimeter</h3>
      <p className="mb-prose-3">
        A {' '}
        <Term def={<><strong className="text-text font-medium">DMM</strong> (digital multimeter) — the general-purpose voltmeter / ammeter / ohmmeter / continuity tester. Typical residential-grade units present 10 MΩ input impedance on the volts ranges. Reads anything but is fooled by phantom voltage on floating conductors.</>}>DMM</Term>{' '}
        is the general-purpose instrument: AC and DC volts, AC and DC current (small, through internal shunts),
        resistance, continuity, capacitance, frequency, sometimes temperature. A typical residential DMM presents
        a 10 MΩ input impedance on its volts ranges; bench instruments like the Keysight 34465A reach 10 GΩ on
        the low-volts ranges to minimise circuit loading<Cite id="keysight-34465a-datasheet" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        That high input impedance is what makes a DMM useful — it lets you measure the open-circuit voltage of a
        sensor or a high-impedance node without changing what you're measuring — and it is also what makes a DMM
        lie about phantom voltages on a floating wire. The voltage the DMM reports is the line voltage scaled
        down by the voltage divider formed between the leakage path's impedance and the meter's input impedance:
      </p>
      <Formula>V<sub>dmm</sub> = V<sub>source</sub> × Z<sub>dmm</sub> / (Z<sub>dmm</sub> + Z<sub>leak</sub>)</Formula>
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">V<sub>dmm</sub></strong> is the voltage the meter displays (in volts AC),
        <strong className="text-text font-medium"> V<sub>source</sub></strong> is the actual line voltage somewhere upstream in the building (in
        volts AC, typically 120 V at a North-American outlet), <strong className="text-text font-medium">Z<sub>dmm</sub></strong> is the input
        impedance of the meter on its volts range (in ohms; typically 10 MΩ for a handheld
        DMM)<Cite id="keysight-34465a-datasheet" in={SOURCES} />, and <strong className="text-text font-medium">Z<sub>leak</sub></strong> is the
        impedance of whatever capacitive or resistive path is letting line voltage leak onto the wire the meter
        is sitting on (in ohms). When Z<sub>leak</sub> is comparable to or smaller than Z<sub>dmm</sub>, the
        reading approaches V<sub>source</sub> even though no useful current is available behind that voltage.
      </p>

      <h3 className="font-2 font-medium text-4 uppercase tracking-4 text-accent mt-xl mb-[0.875rem]">The clamp meter</h3>
      <p className="mb-prose-3">
        A {' '}
        <Term def={<><strong className="text-text font-medium">clamp meter</strong> — a current meter with a hinged ferromagnetic (or Hall-effect) jaw that closes around a single conductor. Reads AC current (and on Hall-effect units, DC current) without breaking the circuit. Resolution typically 0.1 A; range 0–600 A AC.</>}>clamp meter</Term>{' '}
        is the only one of the four meters that reads <em className="italic text-text">current</em> directly. Its hinged jaw closes around a
        single conductor — never around both hot and neutral together — and the magnetic field circling that
        conductor is sensed either by a current-transformer winding in the jaw (AC only) or by a Hall-effect
        device (AC plus DC). The display reads amperes. Modern residential clamp meters resolve 0.1 A reliably
        in the 0–60 A range and 1 A in the 60–600 A range<Cite id="horowitz-hill-2015" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        A clamp meter is the right tool for "is this circuit drawing what I think it is?" — the question that
        comes up every time you suspect a parasitic load, an undersized branch, or a stuck heating element. It
        is also the only one of the four meters that can measure current without breaking the circuit, which
        means it is the only one safe to use on a live, energised conductor without de-energising the building
        first.
      </p>

      <TryIt
        tag="Try 36.1"
        question={
          <>A DMM reads <strong className="text-text font-medium">87 V</strong> on a wire that should be dead. The meter's input impedance is
          10 MΩ. The wire runs parallel to a live 120 V conductor for about a foot inside a box, giving a
          coupling capacitance of about <strong className="text-text font-medium">30 pF</strong>. Verify the phantom-voltage prediction using the
          voltage-divider formula above. (Recall the impedance of a capacitor at 60 Hz is
          1 / (2πfC).)</>
        }
        hint={<>Compute the capacitor's impedance at 60 Hz, then plug into the voltage divider.</>}
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">The impedance of a 30 pF capacitor at 60 Hz:</p>
            <Formula>Z<sub>leak</sub> = 1 / (2π × 60 × 30×10⁻¹²) ≈ 88 MΩ</Formula>
            <p className="mb-prose-1 last:mb-0">The voltage divider with a 10 MΩ DMM input:</p>
            <Formula>V<sub>dmm</sub> = 120 × 10 / (10 + 88) ≈ 12 V</Formula>
            <p className="mb-prose-1 last:mb-0">
              That's not 87 V — it's closer to 12 V. The 87 V reading you started with implies either a much
              larger coupling capacitance (run the wires parallel for many feet and 200–500 pF is realistic, which
              gives Z<sub>leak</sub> ≈ 5–13 MΩ and V<sub>dmm</sub> ≈ 50–80 V) or a resistive leakage path through
              damp insulation. Either way the cure is the same: <strong className="text-text font-medium">switch to a two-pole probe</strong>. Its
              ~3 kΩ load impedance reduces V<sub>dmm</sub> to V<sub>source</sub> × 3 kΩ / (3 kΩ + 88 MΩ) ≈
              <strong className="text-text font-medium"> 4 mV</strong>, indistinguishable from zero. The wire is dead.
            </p>
          </>
        }
      />

      <h2 className="font-2 font-light italic text-[clamp(28px,3.5vw,42px)] leading-1 tracking-1 text-text mt-3xl mb-2xl max-w-[28ch]">The phantom-voltage trap, deeply</h2>

      <p className="mb-prose-3">
        It is worth pausing on the phantom-voltage problem because it is the single most common cause of an
        electrician's "this doesn't make sense" moment, and the physics is unambiguous once you write the
        currents down. Imagine two wires running parallel inside a metal junction box for six inches. One wire
        — the hot, call it H — sits at 120 V<sub>RMS</sub> with respect to the panel's grounded neutral. The
        other — the wire under test, call it U — is connected to no source at all: a switched-off light fixture,
        an abandoned cable, a receptacle that has been removed and capped. U is electrically floating.
      </p>
      <p className="mb-prose-3">
        Two conductors separated by air-and-insulation form a parallel-plate capacitor. The capacitance is small —
        for two 12-AWG conductors lying alongside each other for six inches inside a steel box, C<sub>coupling</sub>
        is on the order of 30–80 pF — but it is not zero. The hot wire's oscillating voltage drives an oscillating
        displacement current through that capacitor into U. With the DMM connected from U to ground, U has a
        path to ground (through the meter) and the displacement current finds it.
      </p>
      <Formula>I<sub>leak</sub> = ω × C<sub>coupling</sub> × V<sub>hot</sub></Formula>
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">I<sub>leak</sub></strong> is the displacement current the coupling capacitor injects into
        the floating wire U (in amperes, AC), <strong className="text-text font-medium">ω = 2πf</strong> is the angular frequency of the line
        (in rad/s; ω ≈ 377 rad/s at 60 Hz), <strong className="text-text font-medium">C<sub>coupling</sub></strong> is the capacitance between H
        and U (in farads), and <strong className="text-text font-medium">V<sub>hot</sub></strong> is the RMS voltage of the hot wire with respect
        to ground (in volts). For C<sub>coupling</sub> = 50 pF and V<sub>hot</sub> = 120 V:
      </p>
      <Formula>I<sub>leak</sub> = 377 × 50×10⁻¹² × 120 ≈ 2.3 µA</Formula>
      <p className="mb-prose-3">
        That is the entire current the DMM is being asked to measure — 2.3 microamperes — and the meter
        cheerfully reports it as a voltage by multiplying it by its own 10 MΩ input impedance: 2.3 µA × 10 MΩ ≈
        23 V. With slightly larger coupling (a longer parallel run, a tighter spacing) the number climbs to 50,
        80, 110 V. The DMM is not broken; it is reporting exactly what its input stage sees. The reading is
        meaningless not because the volts aren't there, but because the available current behind them is
        microamperes — not enough to light an LED, not enough to shock you, certainly not enough to power
        anything you would call a load.
      </p>
      <p className="mb-prose-3">
        Two cures, both standard practice. First, use a two-pole probe instead. Its load impedance — perhaps
        3 kΩ from an internal solenoid or filament — pulls the voltage divider hard toward zero: V<sub>dmm</sub>
        = 120 × 3 kΩ / (3 kΩ + 1/jωC) ≈ a few millivolts. The phantom collapses. Second, some Fluke and Klein
        DMMs have a {' '}
        <Term def={<><strong className="text-text font-medium">low-Z mode</strong> — a DMM range that switches an internal ~3 kΩ load across the input terminals during the voltage measurement. Collapses phantom voltages on floating conductors to a few millivolts. Found on Fluke 117, 87V, T6, and equivalents.</>}>low-Z mode</Term>{' '}
        button (Fluke calls it LoZ) that applies an internal ~3 kΩ load only during the measurement, replicating
        the two-pole probe's behaviour without giving up the DMM's other functions. On the Keysight 34465A bench
        meter the equivalent is the auto-impedance setting on the AC volts range, which switches between 1 MΩ
        and 10 MΩ depending on the source impedance the meter
        infers<Cite id="keysight-34465a-datasheet" in={SOURCES} />.
      </p>

      <Pullout>
        A DMM tells you what its input impedance lets through. A two-pole probe tells you what 5 milliamps
        would do. Use the second one to make decisions.
      </Pullout>

      <TryIt
        tag="Try 36.2"
        question={
          <>An outlet probe is sitting on a known-dead duplex receptacle in a box that also contains a hot
          conductor for a different branch circuit. The DMM reads <strong className="text-text font-medium">62 V</strong> from the dead hot screw
          to ground. Switching the same meter to its <strong className="text-text font-medium">low-Z mode</strong>, the reading drops to
          <strong className="text-text font-medium"> 0.4 V</strong>. Is the receptacle truly dead, and what was the meter doing in the first
          reading?</>
        }
        hint={<>Low-Z mode adds an internal ~3 kΩ load across the meter inputs.</>}
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">
              Yes — the receptacle is dead. The 62 V reading was phantom voltage from capacitive coupling to the
              other branch's hot wire in the shared box. The high-impedance DMM input let microamperes of
              displacement current charge its input stage up to most of line voltage. Switching to low-Z mode
              dropped a 3 kΩ shunt across the input; the same microamperes now develop only 3 kΩ × 2 µA ≈ 6 mV
              across the load, and the meter rounds to 0.4 V. <strong className="text-text font-medium">The 0.4 V is the real reading.</strong>
            </p>
            <p className="mb-prose-1 last:mb-0">
              Practical rule: a voltage reading on a supposedly-dead wire that drops more than 10× when you
              engage low-Z is a phantom, not a fault. A reading that <em className="italic text-text">doesn't</em> drop is a real source —
              find it before you touch the wire.
            </p>
          </>
        }
      />

      <h2 className="font-2 font-light italic text-[clamp(28px,3.5vw,42px)] leading-1 tracking-1 text-text mt-3xl mb-2xl max-w-[28ch]">The dead-outlet diagnostic flowchart</h2>

      <p className="mb-prose-3">
        With a two-pole probe (or a DMM with low-Z) in hand and the cover plate off a dead receptacle, the
        diagnostic question reduces to three measurements and a decision. The three probes are line-to-neutral
        (L-N), line-to-ground (L-G), and neutral-to-ground (N-G), and each pair tells you about a different
        conductor in the run back to the panel. The decision tree below assumes a standard North-American
        single-phase 120 V receptacle with hot on the brass screw, neutral on the silver screw, and ground on
        the green screw<Cite id="ul-498" in={SOURCES} />.
      </p>

      <h3 className="font-2 font-medium text-4 uppercase tracking-4 text-accent mt-xl mb-[0.875rem]">Branch A — L-N reads 120 V</h3>
      <p className="mb-prose-3">
        The outlet is live. Both hot and neutral are intact all the way to the panel and bonded to the
        transformer secondary. The reason your appliance didn't work is on the appliance's side of the contacts —
        a blown fuse inside the toaster, a tripped internal thermal cutout, a worn plug with one prong not
        actually touching the slot. Pull the plug, plug something else in, confirm the outlet is functional, and
        the diagnosis is "user side" or "appliance side", not the wiring.
      </p>

      <h3 className="font-2 font-medium text-4 uppercase tracking-4 text-accent mt-xl mb-[0.875rem]">Branch B — L-N reads 0 V, L-G reads 120 V</h3>
      <p className="mb-prose-3">
        Hot is live, but the neutral has gone {' '}
        <Term def={<><strong className="text-text font-medium">open neutral</strong> — a break in the grounded conductor between the receptacle and the panel's neutral bar. The hot conductor remains energised; loads see no voltage because there is no return path. Distinguished from a dead branch by a live L-G reading.</>}>open</Term>{' '}
        somewhere between this outlet and the panel's neutral bar. Likely failure modes, in roughly the order
        they appear in real houses: a backstabbed neutral wire that vibrated loose at an upstream outlet (Ch.30's
        backstab failure mode), a wire-nut on the neutral pigtail in a junction box that was finger-tight rather
        than torqued, or — the rare and serious case — an open neutral at the service entrance itself, which is
        a utility problem and will affect every 120 V circuit in the house. To localise: take the cover off the
        upstream outlets one by one (the nearest one electrically to the panel first), looking for a loose
        white-wire connection.
      </p>

      <h3 className="font-2 font-medium text-4 uppercase tracking-4 text-accent mt-xl mb-[0.875rem]">Branch C — L-N reads 120 V but N-G reads 5–20 V instead of ≈ 0 V</h3>
      <p className="mb-prose-3">
        The outlet is live but the neutral has gained appreciable series resistance back to its bond point at
        the main panel. Normal load current — even a few amps — pushes the neutral wire's local potential up
        above ground by I × R<sub>neutral</sub>. Five to twenty volts of N-G under load is the signature of a
        partially-failed neutral connection: a backstab oxidising, a wire-nut working loose, a corroded splice
        in a box. It is also the signature of a {' '}
        <Term def={<><strong className="text-text font-medium">bootleg neutral</strong> — an incorrect wiring where the neutral conductor is jumpered to ground at a receptacle (instead of being returned to the panel neutral bar). Gives an outlet the appearance of being correctly wired to a three-prong tester while putting load current onto the equipment-grounding system.</>}>bootleg neutral</Term>,
        a particularly dangerous wiring error where someone has jumpered N to G at a receptacle to make a
        ground-less branch pass a three-prong tester. Either way, the outlet wants attention before something
        downstream starts to heat.
      </p>

      <h3 className="font-2 font-medium text-4 uppercase tracking-4 text-accent mt-xl mb-[0.875rem]">Branch D — all three probes read 0 V</h3>
      <p className="mb-prose-3">
        The branch is dead — no hot voltage at the outlet. The fault is upstream, in this order of likelihood:
      </p>
      <ol>
        <li>
          <strong className="text-text font-medium">The breaker.</strong> Walk to the panel. Look for a breaker whose handle sits between full-ON
          and full-OFF — the {' '}
          <Term def={<><strong className="text-text font-medium">half-trip</strong> — the resting position of a tripped breaker handle, partway between ON and OFF. To reset, push fully to OFF first (this re-cocks the internal latch), then back to ON. Flipping straight from half-trip to ON usually does nothing.</>}>half-trip</Term>{' '}
          position. To reset, push the handle hard to OFF (this re-cocks the internal latch) and then back to ON.
          If it trips again immediately, you have a hard fault on the branch — stop and investigate before resetting again.
        </li>
        <li>
          <strong className="text-text font-medium">An upstream GFCI.</strong> The GFCI receptacle controlling this branch may be in a different
          room — frequently a bathroom or the kitchen island — and may have tripped silently weeks ago when
          someone unplugged a damp appliance. Press its RESET button and listen for the click.
        </li>
        <li>
          <strong className="text-text font-medium">A loose connection in an upstream box.</strong> Backstab failures, loose wire-nuts, and burnt
          terminal screws cut the hot path the same way. Open the boxes between this outlet and the panel, in
          electrical order, looking for discoloration on the insulation around the terminals.
        </li>
        <li>
          <strong className="text-text font-medium">The breaker's bus connection.</strong> Rare but real: the breaker reads ON, but its clip on
          the bus stab has oxidised and lost contact. A clamp meter on the load wire shows zero amperes even
          when a known load is switched on. See the "dead breaker" section below.
        </li>
      </ol>

      <p className="mb-prose-3">
        That is the whole tree. Three probes, four branches, one next move. Every dead-outlet call an
        electrician takes resolves to one of these branches in under five minutes of measurement<Cite id="nec-2023" in={SOURCES} />.
        The reason readers spend two hours on the problem instead is that they skip the measurements and start
        flipping breakers — a search through a space that the meter would have narrowed to a single
        point<Cite id="iec-60479-2018" in={SOURCES} />.
      </p>

      <TryIt
        tag="Try 36.3"
        question={
          <>An outlet probe shows: <strong className="text-text font-medium">L-N = 0 V, L-G = 121 V, N-G = 121 V</strong>. What's broken, and where
          is the most likely physical fault?</>
        }
        hint={<>Hot is live (L-G shows 121 V). Neutral is energised relative to ground (N-G shows 121 V). What
        does that imply about the neutral conductor?</>}
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">
              L-G = 121 V confirms hot is live and ground is intact. N-G = 121 V means the neutral terminal at
              this outlet is sitting at line voltage — the same potential as hot. The only way that happens is
              if the neutral conductor is <strong className="text-text font-medium">open</strong> upstream and is being capacitively-or-resistively
              pulled up toward hot through any small load that bridges hot and neutral at the outlet (an LED,
              a clock, a meter's own input impedance).
            </p>
            <p className="mb-prose-1 last:mb-0">
              This is Branch B of the flowchart with a vengeance. The fault is an open neutral, almost
              certainly at a backstab or wire-nut between this outlet and the panel's neutral bar. Do not plug
              anything in — with the neutral floating, any load you connect will see the neutral terminal
              swing toward whatever voltage the load's own impedance establishes against the leakage paths,
              and you can get destructive voltages across appliances designed for 120 V.
            </p>
          </>
        }
      />

      <h2 className="font-2 font-light italic text-[clamp(28px,3.5vw,42px)] leading-1 tracking-1 text-text mt-3xl mb-2xl max-w-[28ch]">Tripped breakers and what tripped them</h2>

      <p className="mb-prose-3">
        Once the flowchart points back to the panel, the next question is <em className="italic text-text">why</em> the breaker tripped.
        A residential thermal-magnetic breaker has two independent trip elements (Ch.28 introduced both), and
        an AFCI or GFCI breaker adds a third electronic one. The three failure modes look identical from the
        outside — handle in the half-trip position — but the underlying cause and the right response are
        completely different.
      </p>

      <h3 className="font-2 font-medium text-4 uppercase tracking-4 text-accent mt-xl mb-[0.875rem]">Thermal trip</h3>
      <p className="mb-prose-3">
        A {' '}
        <Term def={<><strong className="text-text font-medium">thermal trip</strong> — a breaker trip caused by sustained overload heating a bimetallic strip past its release setpoint. Time to trip ranges from seconds at moderate overload to minutes near the rated current. Resets only after the bimetal cools.</>}>thermal trip</Term>{' '}
        happens when the current through the breaker has exceeded its rating, by a modest factor, for long
        enough to warm the internal
        {' '}
        <Term def={<><strong className="text-text font-medium">bimetal</strong> — a strip of two metals with different thermal expansion coefficients welded together. Bends predictably with temperature; used as the slow-trip element inside thermal-magnetic breakers.</>}>bimetal</Term>{' '}
        past its release setpoint. The setpoint corresponds to the wire downstream reaching the temperature
        at which its insulation begins to degrade — typically 60 °C for residential NM-B cable. The
        {' '}
        <Term def={<><strong className="text-text font-medium">time-current curve</strong> — the log-log plot of trip time versus current for a circuit breaker. Steeply downward-sloping in the thermal region (1.1–8× rated current) and near-vertical in the magnetic region (8× and above).</>}>time-current curve</Term>{' '}
        printed on every breaker datasheet plots the relationship; a useful analytical approximation in the
        thermal region is the inverse-square form
      </p>
      <Formula>t<sub>trip</sub> = K × (I / I<sub>rating</sub>)<sup>−2</sup></Formula>
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">t<sub>trip</sub></strong> is the time from current onset to mechanical release (in
        seconds), <strong className="text-text font-medium">I</strong> is the actual current through the breaker (in amperes RMS),
        <strong className="text-text font-medium"> I<sub>rating</sub></strong> is the breaker's nameplate rating (in amperes; 15 A and 20 A are
        the common residential branch ratings), and <strong className="text-text font-medium">K</strong> is a calibration constant set by the
        breaker design, typically in the range of a few hundred seconds for a residential branch breaker. At
        1.5× rated current, t<sub>trip</sub> ≈ K / 2.25 — minutes. At 5× rated current, t<sub>trip</sub> ≈
        K / 25 — seconds. The curve is steep on purpose: it tolerates motor starts and brief inrush but punishes
        sustained overload<Cite id="horowitz-hill-2015" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        A thermal-tripped breaker resets fine once the bimetal cools — ten to thirty seconds of waiting — but it
        will trip again if the load that caused the overload is still on. The diagnostic is: take the load off,
        reset the breaker, add loads back one at a time with a clamp meter on the branch hot, and find the load
        that pushes the running current past 80% of rating.
      </p>

      <h3 className="font-2 font-medium text-4 uppercase tracking-4 text-accent mt-xl mb-[0.875rem]">Magnetic trip</h3>
      <p className="mb-prose-3">
        A {' '}
        <Term def={<><strong className="text-text font-medium">magnetic trip</strong> — a breaker trip caused by a short-circuit-magnitude current generating enough flux in the breaker's solenoid coil to slam the trip lever open within milliseconds. Resets immediately because the bimetal never warmed.</>}>magnetic trip</Term>{' '}
        happens on a dead short. The same current that the thermal element sees flows through a small solenoid
        coil wound around (or in series with) the breaker's main conductor; when the current exceeds about 8×
        the breaker's rating, the coil's magnetic field is strong enough to physically slam the trip lever open
        within a fraction of a 60 Hz cycle — single-digit milliseconds, faster than any thermal element could
        respond. The classic causes are a hot wire bridged to neutral or ground (a screw driven through a cable,
        a damaged extension cord crushed under a chair leg, a tool dropped across two terminals inside a panel).
      </p>
      <p className="mb-prose-3">
        A magnetic-tripped breaker resets immediately because nothing has warmed up — but if you reset it without
        finding the short, it will trip again in a millisecond and dump another pulse of fault energy into
        whatever was already arcing. Two unrecovered magnetic trips in a row is a stop-and-investigate event,
        not a try-again event.
      </p>

      <h3 className="font-2 font-medium text-4 uppercase tracking-4 text-accent mt-xl mb-[0.875rem]">AFCI or GFCI electronic trip</h3>
      <p className="mb-prose-3">
        An {' '}
        <Term def={<><strong className="text-text font-medium">AFCI</strong> (arc-fault circuit interrupter) — a breaker (or receptacle) with a microcontroller that monitors the current waveform for the broadband-noise signature of an arc and trips when it detects one. Listed under UL 1699.</>}>AFCI</Term>{' '}
        breaker monitors the current waveform for the broadband-noise signature of a parallel or series arc;
        a GFCI breaker monitors the difference between hot and neutral currents and trips on residual current
        above about 5 mA (Ch.28). Both reset by pressing the small TEST/RESET button on the breaker face — a
        distinctly different gesture from the off-on cycle of a thermal-magnetic reset. If the breaker handle
        is in half-trip and the LED on its face is lit or blinking, the trip was electronic; if no LED, the
        trip was thermal or magnetic. The IEC's 60479 series defines the body-current thresholds that justify
        the 5 mA setpoint<Cite id="iec-60479-2018" in={SOURCES} />.
      </p>

      <TryIt
        tag="Try 36.4"
        question={
          <>A <strong className="text-text font-medium">15 A breaker</strong> trips every 8 minutes when a <strong className="text-text font-medium">1500 W heater</strong> on a
          120 V branch is on. Compute the steady-state current draw. Is this a thermal or magnetic trip? Should
          you replace the breaker, or move the heater?</>
        }
        hint={<>Current is power divided by voltage. Compare to 100% and 125% of breaker rating.</>}
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">The heater's running current:</p>
            <Formula>I = P / V = 1500 / 120 = 12.5 A</Formula>
            <p className="mb-prose-1 last:mb-0">
              12.5 A is <strong className="text-text font-medium">83% of the 15 A rating</strong> — over the NEC 80% continuous-load limit but
              not a hard overload. At I / I<sub>rating</sub> = 0.833 the breaker is below the thermal trip
              region of an idealised curve, but real bimetals respond to ambient temperature too: a hot
              August panel, a southern-exposure garage, or a stack of other warm breakers above this one can
              bias the bimetal warm enough that 12.5 A trips after 8–10 minutes. This is a
              <strong className="text-text font-medium"> thermal trip</strong> driven by ambient heating, not a magnetic trip.
            </p>
            <p className="mb-prose-1 last:mb-0">
              Do not replace the breaker with a 20 A — that would let the wire (likely 14 AWG, rated 15 A
              continuous) overheat without protection. The right fix is to move the heater to a 20 A branch on
              12 AWG, or to a dedicated branch. The breaker is doing its job<Cite id="horowitz-hill-2015" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2 className="font-2 font-light italic text-[clamp(28px,3.5vw,42px)] leading-1 tracking-1 text-text mt-3xl mb-2xl max-w-[28ch]">The clamp meter and what's drawing what</h2>

      <p className="mb-prose-3">
        Once a circuit's running again, the next question is usually whether it's drawing what you'd expect.
        A clamp meter is the only tool that answers that question on a live, energised circuit without breaking
        anything to insert an ammeter. The technique is the walk-down: clamp the meter around the main
        service-entrance conductor at the head of the panel (one of the two hots, not both — clamping both
        cancels the field to zero and the meter reads about zero amps no matter the load), read the steady-state
        current, and then start removing loads one at a time and watching the delta.
      </p>
      <p className="mb-prose-3">
        A 1500 W heater drops the reading by 12.5 A. A 100 W incandescent bulb drops it by 0.83 A. A 60 W LED
        bulb drops it by 0.5 A but with a power factor near 0.5, so the apparent VA drop is about 1 A. A
        refrigerator compressor on a 20-minute duty cycle drops the reading by 2–4 A when it cycles off. A
        1 A differential is reliably distinguishable on any modern clamp meter, which means you can identify
        roughly any load from a 100 W lamp upward in this way<Cite id="horowitz-hill-2015" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        Inside the panel, the technique generalises. Clamp the load conductor coming out of a single branch
        breaker and you read that branch's instantaneous current. Walk all the way down the panel one breaker
        at a time and you have a snapshot of the building's load distribution at the moment. Run it once at
        2 a.m. and again at 9 p.m. and the difference is the always-on baseline of the house. That baseline
        is, in practice, where most parasitic-load surprises live.
      </p>

      <TryIt
        tag="Try 36.5"
        question={
          <>A clamp meter on the L1 service-entrance conductor of a 240 V split-phase service reads
          <strong className="text-text font-medium"> 23 A</strong>. You switch off the central air conditioner and the reading drops to
          <strong className="text-text font-medium"> 8 A</strong>. The AC nameplate says <strong className="text-text font-medium">240 V, 14 SEER</strong>. What is the AC's
          running current, its instantaneous electrical power draw, and its instantaneous cooling output in
          BTU/hr?</>
        }
        hint={<>The AC is a 240 V load fed from both L1 and L2; its current shows up on each leg equally.
        SEER is the seasonal ratio of cooling BTU per watt-hour of input — for an instantaneous estimate use
        the SEER value as the BTU/Wh ratio.</>}
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">The AC's running current and electrical power:</p>
            <Formula>I<sub>AC</sub> = 23 − 8 = 15 A on L1 (same on L2 for a 240 V load)</Formula>
            <Formula>P<sub>elec</sub> = 240 × 15 = 3 600 W</Formula>
            <p className="mb-prose-1 last:mb-0">SEER 14 means about 14 BTU of cooling per Wh of electrical input, so:</p>
            <Formula>Q<sub>cool</sub> ≈ 14 BTU/Wh × 3 600 W = 50 400 BTU/hr</Formula>
            <p className="mb-prose-1 last:mb-0">
              Answer: <strong className="text-text font-medium">15 A, ~3.6 kW electrical, ~50 000 BTU/hr cooling</strong>. That matches a
              4-ton residential central AC, which is what you'd expect for a typical 2 000 ft² North-American
              single-family house. If the cooling number had come out at 20 000 BTU/hr with a 3.6 kW draw,
              the unit would need a service call — its actual SEER under those conditions is closer to 5,
              and something (low refrigerant, dirty condenser coil, failing capacitor) is dragging the
              efficiency down.
            </p>
          </>
        }
      />

      <h2 className="font-2 font-light italic text-[clamp(28px,3.5vw,42px)] leading-1 tracking-1 text-text mt-3xl mb-2xl max-w-[28ch]">The "dead breaker" failure mode</h2>

      <p className="mb-prose-3">
        Sometimes the breaker handle reads ON, no LED is blinking, the panel directory says the right circuit,
        and the outlets are still dead. There is a failure mode of the breaker itself — uncommon but real — where
        the internal mechanism has lost continuity even though the external handle is in the closed position.
        Causes include a worn-out bimetal that no longer makes contact when latched, an oxidised contact face
        between the breaker's clip and the bus stab, or a microscopic crack in the pressure-cast aluminium
        connection at the load lug. The handle is mechanical; it does not directly close the contacts, and a
        breaker that has been thermally cycled tens of thousands of times across decades can develop this
        failure silently.
      </p>
      <p className="mb-prose-3">
        Diagnosis takes two measurements with the panel cover off (which is itself a job that requires PPE and a
        verify-dead step on the parts you don't intend to touch — every working electrician treats the inside of
        a live panel as a Category III environment). First, with the breaker in the ON position and a known
        load energised downstream, clamp a clamp meter around the wire coming off the breaker's load lug. A
        properly-functioning breaker reads the load's current; a dead breaker reads zero. Second, with the same
        clamp setup unable to find current, take a two-pole probe and measure from the breaker's load lug to
        the panel neutral bar. A live breaker reads 120 V (or 240 V on a two-pole breaker); a dead breaker
        reads 0 V even though the line-side lug reads 120 V to neutral.
      </p>
      <p className="mb-prose-3">
        Replacement is straightforward: kill the main, verify dead with the two-pole probe at the line side of
        the breaker in question, snap the old breaker off the bus stab, and snap a new one of the same
        manufacturer and same listing into its place — manufacturer test standards require that breakers be
        listed for the panel they're installed in, and mixing brands is a code violation under all but a
        handful of specifically-classified
        cross-listings<Cite id="nec-2023" in={SOURCES} />. The reason this fault sits at the bottom of the
        diagnostic flowchart rather than the top is that its symptoms (dead outlet, ON-position handle, no
        obvious smell or sign) mimic so many other faults that nine times out of ten the actual cause is one
        of the upstream ones the flowchart catches first.
      </p>

      <CaseStudies
        intro={
          <>
            Three diagnostic stories from real residential work, each illustrating one branch of the flowchart
            and the time penalty of skipping it.
          </>
        }
      >
        <CaseStudy
          tag="Case 36.1"
          title="The dishwasher that wouldn't run"
          summary="A silently-tripped GFCI two rooms away."
          specs={[
            { label: 'Symptom', value: <>dishwasher dark, breaker handle ON</> },
            { label: 'Branch-tested at the dishwasher receptacle', value: <>L-N = 0 V, L-G = 0 V, N-G = 0 V</> },
            { label: 'Actual fault', value: <>kitchen-island GFCI receptacle tripped, controlling the dishwasher's branch via its LOAD terminals</> },
            { label: 'Code reference for upstream GFCI protection', value: <>NEC 210.8 <Cite id="nec-2023" in={SOURCES} /></> },
            { label: 'Time wasted before checking the GFCI', value: <>~ 2 hours</> },
            { label: 'Time the right diagnosis would have taken', value: <>~ 5 minutes</> },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            The homeowner ran the dishwasher Sunday night, came down Monday morning, and the kitchen-side
            controls were dark. The dishwasher breaker (a dedicated 20 A in the panel) sat fully in the ON
            position with no visible half-trip. The homeowner reset it anyway — no change. Two hours of poking
            at the dishwasher's control board followed, then a service call.
          </p>
          <p className="mb-prose-2 last:mb-0">
            The right diagnosis takes the meter out first. Pop the dishwasher's junction box, probe the
            incoming three wires: L-N = 0, L-G = 0, N-G = 0. That is Branch D of the flowchart — the branch is
            dead. The breaker is ON, so the next move is to look for an upstream GFCI. NEC 210.8 has required
            GFCI protection on kitchen receptacles since 1987 and on dishwasher branches since 2014; in
            kitchens the GFCI is almost always a receptacle (not a breaker) located at the island or counter,
            and its LOAD terminals daisy-chain to every downstream receptacle on the same branch — including,
            in many house plans, the dishwasher<Cite id="nec-2023" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            On Sunday morning the homeowner's child had unplugged a damp blender from the island GFCI; the
            leakage on the blender's cord had tripped it, and nobody noticed because the island countertop
            outlet wasn't in use the rest of the day. The GFCI's RESET button was hidden by a fruit bowl. One
            press, four hours' worth of diagnosis collapsed to a click. The lesson is the flowchart: read
            three probes first, walk the panel and known-GFCI-locations second, take the appliance apart
            never until everything else has been ruled out.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 36.2"
          title="The microwave clock that died"
          summary="A scored break-off tab that opened over a year."
          specs={[
            { label: 'Symptom', value: <>top half of a kitchen duplex receptacle dead; bottom half fine</> },
            { label: 'Probe at the dead half', value: <>L-N = 0 V, L-G = 0 V, N-G = 0 V</> },
            { label: 'Probe at the working half', value: <>L-N = 120 V, L-G = 120 V, N-G ≈ 0 V</> },
            { label: 'Root cause', value: <>scored but not removed break-off tab between brass screws; loose terminal screw on the dead half</> },
            { label: 'Receptacle listing standard', value: <>UL 498 <Cite id="ul-498" in={SOURCES} /></> },
            { label: 'Repair', value: <>replace receptacle; torque terminal screws to 12 in-lb per manufacturer spec</> },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            A 1990s-vintage duplex receptacle in a kitchen had been wired with the microwave (high-draw,
            counter-top, near-continuous duty over years of use) on the top half and a phone charger on the
            bottom. During the original install the electrician had touched a screwdriver to the break-off tab
            between the two brass screws — scoring it, but not snapping it off — and then had backed off the
            top-half terminal screw without fully torquing it. The receptacle worked. UL 498 tests every
            production receptacle for terminal-screw torque at the factory, but the test does not catch a
            factory-good device that an installer subsequently
            loosens<Cite id="ul-498" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            Over the next year, every microwave start-up pulse warmed the partially-tightened terminal screw.
            Resistance climbed; heating climbed faster (P = I²R); the brass terminal oxidised; the scored
            tab between the two halves of the receptacle finally fatigued through. The top half went dead.
            The bottom half — on the other side of the now-broken tab, on a separate brass stamping wired
            through its own terminal — kept working.
          </p>
          <p className="mb-prose-2 last:mb-0">
            The diagnostic probe sequence is exactly the L-N / L-G / N-G triad. The dead top half reads 0/0/0;
            the working bottom half reads 120/120/0; the working half tells you hot, neutral, and ground are
            all live at the box. The fault is therefore on the receptacle's own internal path between the
            terminals and the slot — which means the receptacle is the problem, not the wiring. Replace it,
            torque to the manufacturer's specified 12 in-lb, and check the panel directory note for any other
            receptacles installed on the same day with the same tab-scoring habit.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 36.3"
          title="The clamp-meter parasitic-load hunt"
          summary="A nighttime baseline of 9 A that should have been 2 A."
          specs={[
            { label: 'Symptom', value: <>monthly electric bill creep of $25–40; no obvious new appliance</> },
            { label: 'Measured 2 a.m. baseline current on L1', value: <>9.2 A — about 1.1 kW continuous</> },
            { label: 'Expected baseline', value: <>2 A — fridge, modem, smoke alarms, a few clocks</> },
            { label: 'Diagnostic tool', value: <>clamp meter on each branch breaker's load lug, one at a time</> },
            { label: 'Culprit', value: <>1 000 W electric towel warmer in a basement bathroom, left switched on for three months</> },
            { label: 'Recovery', value: <>turn off; $480/yr saved at $0.18/kWh</> },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            The homeowner's monthly bill had been creeping up by about $30 for three months running, with no
            change in occupancy or visible appliance use. Daytime current on the main was reasonable; the
            mystery was the nighttime baseline. A clamp meter on the L1 service conductor at 2 a.m. read
            <strong className="text-text font-medium"> 9.2 A</strong>, against an expected 2 A for the always-on load (refrigerator compressor,
            modem, smoke alarms, a few clocks). 7 A of mystery current at 120 V is 840 W continuous — about
            7 200 kWh/yr, or roughly $1 300 at typical
            tariffs<Cite id="horowitz-hill-2015" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            The diagnostic moves inside the panel. With everyone asleep upstairs, clamp the load wire on one
            breaker at a time — twenty seconds per breaker — and write down the steady-state current. Most
            branches read essentially zero. The fridge branch reads 1.5 A on duty, zero off. The mystery is
            on a single branch: a 20 A breaker labelled "basement bath" pulling 8 A continuously. That branch
            feeds one receptacle, one light, and an after-the-fact-added 1 000 W electric towel warmer that
            the previous owner's renovation team had wired in three months ago and that the current homeowner
            had never noticed switched on behind a towel.
          </p>
          <p className="mb-prose-2 last:mb-0">
            Switch the towel warmer off; the baseline drops to 2.0 A. The clamp-meter walk-down took ten
            minutes; the savings at $0.18/kWh come to roughly $480 over the next year. Parasitic loads are
            everywhere — heated mirrors, electric kettles left in the "warm" mode, aquarium heaters, garage
            de-humidifiers — and a clamp meter finds them faster than any other instrument in the toolbox.
          </p>
        </CaseStudy>
      </CaseStudies>

      <FAQ intro="Questions readers ask after their first dead-outlet diagnosis.">
        <FAQItem q="Why doesn't my NCVT light up on a known-hot wire?">
          <p>
            Four likely reasons, all of them common. First, the battery is weak — NCVTs draw microamperes but
            depend on a stable supply to bias their high-gain front end, and a half-dead AAA puts the threshold
            below line-voltage sensing. Second, the conductor under test is shielded — running through a metal
            conduit or behind a grounded foil-faced insulation can reduce the external field by more than
            10×. Third, the antenna is oriented wrong; rotating the pen 90° around its axis sometimes lights
            it up. Fourth, the conductor really is dead. Always validate the NCVT against a known-hot
            conductor (the brass screw of a working outlet) before and after each
            session<Cite id="horowitz-hill-2015" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Can I trust a tic-tracer that costs $8?">
          <p>
            For yes/no presence detection, the cheap ones work — they are all built around the same handful of
            CMOS proximity sensors. What you give up by going cheap is calibration tolerance (the trip
            threshold may drift by ±30% over temperature), case ruggedness, and the visible-and-audible
            redundancy that better units have. The $40 Fluke or Klein versions are worth the difference
            because the failure mode you care about is a dead battery you didn't notice, and a self-test on
            power-up plus a low-battery indicator are how those tools tell you.
          </p>
        </FAQItem>

        <FAQItem q="What's 'true RMS' and do I need it on a home DMM?">
          <p>
            A true-RMS DMM computes the actual root-mean-square value of the input waveform across one or
            more periods, regardless of shape. A non-true-RMS meter assumes the waveform is a pure sine and
            scales the rectified average by the constant 1.111 (the RMS-to-average ratio of a sine). On a
            clean utility sine the two agree to about 1%; on a chopped or non-sinusoidal current — a triac
            dimmer load, a switch-mode power supply, an LED driver — the non-true-RMS meter can read 20–40%
            low. For residential branch-voltage and resistance measurements either will do; for current
            measurements on modern loads, true-RMS is worth the marginal cost. The Keysight 34465A bench
            meter is true-RMS by construction<Cite id="keysight-34465a-datasheet" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why does the breaker feel hot to the touch but hasn't tripped?">
          <p>
            Two possibilities. First, the breaker is carrying close to its rated current continuously — a
            15 A breaker running at 12 A for an hour will rise 20–30 °C above ambient simply because it
            dissipates I²R losses in its internal contacts and bimetal. That is within spec. Second, a
            poor connection at the bus stab or the load lug is dissipating real power as a contact
            resistance; what should be a few milli-ohms has climbed into the tens of milliohms, and you have
            a brewing failure. The way to tell them apart is a clamp meter: if the current is well under
            rating but the breaker is still hot, the heat is from a bad connection, not from load.
          </p>
        </FAQItem>

        <FAQItem q="Why does my GFCI test button work but a real fault doesn't trip it?">
          <p>
            The TEST button on a GFCI connects a small calibrated resistor between hot downstream of the
            differential transformer and neutral upstream of it — about 8 mA of imposed residual. That tests
            the trip mechanism but not the integrity of the device's connection to the actual branch
            circuit. If the GFCI is mis-wired — LINE and LOAD terminals swapped, or the protected branch
            connected to the LINE side instead of the LOAD side — TEST still trips the device but the
            downstream branch isn't actually protected. A receptacle-tester with a GFCI-trip button (Klein
            RT250, Ideal SureTest) sources real residual current through the third prong and confirms
            end-to-end protection<Cite id="nec-2023" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Can a clamp meter measure DC current too?">
          <p>
            Only if the jaw uses a Hall-effect sensor instead of a passive current-transformer winding. A
            current-transformer clamp produces output by transformer action — a changing magnetic flux
            induces a current in the sensing winding — and DC by definition has no flux change, so the
            output is zero. A Hall-effect clamp uses a tiny semiconductor element in the air gap of the
            jaw that produces a voltage proportional to instantaneous B-field; it reads DC just fine.
            Multi-thousand-amp DC measurements at solar-inverter buses or battery banks are made this way.
          </p>
        </FAQItem>

        <FAQItem q="What's a 'Wiggy' and why do some old electricians still carry one?">
          <p>
            The Wiggy is the original two-pole voltage tester, patented in the 1920s by George Wigginton.
            Inside it is a solenoid coil that pulls a plunger against a calibrated spring; the AC current
            through the coil pulses the plunger up a scale, and a small mechanical vibration plus an audible
            buzz confirm voltage. No battery, no electronics, no LCD to die in the cold. It is rugged,
            unambiguous, and load-presenting (its coil draws perhaps 30 mA at 120 V), which means it cannot
            be fooled by phantom voltage. The drawback is precision — a Wiggy resolves perhaps ±10% — and
            the modern Fluke T5 / T6 family replaces it for most working
            electricians<Cite id="horowitz-hill-2015" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why does my outlet probe show 'open ground' when there IS a ground wire?">
          <p>
            Three possibilities, in order of likelihood. First, the ground wire in the box is not actually
            terminated under the green screw of the receptacle — it is folded back and tucked behind the
            device, where it touches nothing. Second, the ground wire is terminated but the connection has
            corroded or loosened. Third, the branch was wired in a building old enough that two-conductor
            (ungrounded) cable is in the walls, and the box's ground prong is connected only to the metal
            box itself — which may or may not have its own ground path back to the panel depending on the
            era of the conduit or armored cable. The probe can't distinguish "no ground wire" from "ground
            wire present but disconnected"; you have to open the box.
          </p>
        </FAQItem>

        <FAQItem q="Can I check for a short with a continuity tester at the panel?">
          <p>
            Yes, with two important provisos. First, the branch must be de-energised — kill the breaker,
            verify dead with a two-pole probe at the receptacle. Second, every load and every device on
            the branch must be disconnected (unplug appliances; turn switches to OFF and open enough boxes
            to confirm the switch leg is really open), because each device has its own resistance and the
            continuity test will see all of them in parallel. With the branch clean, touch the meter probes
            between hot and neutral at the breaker's load lug and at the neutral bar: open or kilo-ohms
            means the wire is OK; a few ohms or zero means a hard short
            somewhere<Cite id="horowitz-hill-2015" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What's the difference between a 100 mA GFCI and a 5 mA one?">
          <p>
            The 5 mA setpoint is the residential personnel-protection threshold — calibrated against the
            IEC 60479 body-current curves to keep an accidental shock below the let-go threshold and well
            below the threshold for ventricular fibrillation<Cite id="iec-60479-2018" in={SOURCES} />. The
            100 mA (or 300 mA) setpoints are industrial equipment-protection thresholds: too high to save a
            person but low enough to detect insulation-degradation faults on three-phase motors before they
            destroy the motor or start a fire. Residential branches must use 5 mA GFCIs throughout; the
            higher-threshold devices belong in industrial-control panels and motor-control
            centres<Cite id="nec-2023" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why is my clamp meter reading 6 A when the breaker is rated 15 A and the toaster is on?">
          <p>
            Because the toaster is drawing 6 A, not 12.5 A — likely a 700 W toaster, not a 1500 W one, or a
            1500 W toaster with one element burnt out. The breaker's rating is the ceiling, not the
            operating point; loads draw whatever their resistance dictates at the line voltage, and a
            healthy 15 A branch normally runs at 30–80% of rating. A 6 A reading on a "1500 W" toaster says
            the toaster is the problem — open it up and look for a broken Nichrome element. The breaker
            isn't going to tell you that; only the clamp will.
          </p>
        </FAQItem>

        <FAQItem q="What does 'branch-circuit voltage drop' look like on a meter?">
          <p>
            Measure L-N at the receptacle furthest from the panel with no load on the branch (expect ≈
            120 V), then again with the full design load running (a 1500 W heater, say). The difference is
            the branch's voltage drop under load. NEC informational note 210.19 recommends keeping branch
            drop under 3% — 3.6 V on a 120 V branch — and total feeder + branch drop under
            5%<Cite id="nec-2023" in={SOURCES} />. A larger drop signals an undersized conductor, a long
            run, or a series-resistance fault on the branch (loose screw, bad backstab, corroded splice). If
            the drop exceeds 5 V under nominal load, walk the boxes and look for the warm one.
          </p>
        </FAQItem>

        <FAQItem q="My DMM measures 120.4 V on a good outlet, but the panel says 240 V should be there. Which is right?">
          <p>
            Both. A North-American split-phase service delivers 240 V <em className="italic text-text">line-to-line</em> (between L1 and
            L2) and 120 V <em className="italic text-text">line-to-neutral</em> (between either hot bus and the centre-tapped grounded
            conductor). A 120 V receptacle is wired between one hot and neutral, so its measurement is 120 V.
            A 240 V receptacle (for an electric range or dryer) is wired between L1 and L2 and reads 240 V.
            Both numbers describe the same service; you just have to know which two points the meter is
            measuring between.
          </p>
        </FAQItem>

        <FAQItem q="Why does every current value in this chapter ultimately reduce to the elementary charge?">
          <p>
            Because the ampere is, since the 2019 SI revision, defined exactly as the flow rate of
            1 / 1.602176634×10⁻¹⁹ elementary charges per second — the CODATA-recommended fixed value of the
            electron charge <em className="italic text-text">e</em><Cite id="codata-2018" in={SOURCES} />. Every 5 mA GFCI threshold,
            every 15 A breaker rating, every clamp-meter reading on the bench is, at its base, a count of
            electrons per second through a cross-section, scaled by a constant the SI now treats as exact.
            The instruments hide that translation, but the unit definition does not.
          </p>
        </FAQItem>
      </FAQ>
    </ChapterShell>
  );
}
