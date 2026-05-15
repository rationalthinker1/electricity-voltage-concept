/**
 * Chapter 35 — Replacing outlets, switches, and fixtures
 *
 * The first chapter of the practical DIY-with-theory track. By this point
 * the reader has the panel (Ch.28), the branch circuit (Ch.29), the
 * receptacle anatomy (Ch.30), and the body-resistance / let-go picture
 * from earlier chapters. This chapter walks them through the most common
 * residential repair — pulling a worn or browned device out of a box and
 * installing a fresh one — without inventing any new physics. The
 * argument: most DIY electrical failures are not the new device; they
 * are the verification step skipped and the old terminations the reader
 * left in place because they "looked fine."
 *
 * Sources available in chapter.sources:
 *   nec-2023, nfpa-70e-2024, ul-498, nema-wd-6,
 *   lutron-dimmer-app-note, iec-60479-2018, codata-2018
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

export default function Ch35HouseReplacingFixtures() {
  const chapter = getChapter('house-replacing-fixtures')!;
  const SOURCES = chapter.sources;

  return (
    <ChapterShell chapter={chapter}>
      <p className="chapter-intro">
        A bedroom outlet has gone loose. Last winter the kid plugged a 1 500 W space heater into it and ran the
        heater on max all February; this winter the plug wobbles when you push a charger in, and on the side of the
        wall plate nearest the slot the cream paint has gone the colour of weak tea. The reader is standing in front
        of it with a screwdriver, a new tamper-resistant receptacle still in its blister pack, and an honest belief
        that the job is two screws on the cover, two screws on the device, and a pair of wire transfers. They are
        wrong about one of those steps, and the step they are wrong about is the one that determines whether the
        new device lasts ten years or six months. The cream-tea discolouration is not paint failure; it is a
        thermal-degradation pattern left by a joint inside the wall that has been quietly running hot for half a year.
      </p>
      <p className="mb-prose-3">
        This is the most common home electrical repair in North America, and it is also the most commonly botched.
        Three failure modes account for almost all of them. The first is not verifying the circuit is actually dead
        before the screw comes loose — the breaker labelled "BR-2" on the panel directory turns out to control the
        next bedroom over, not this one, and the reader finds out by becoming the let-go-current test load. The
        second is re-using the existing
        {' '}<Term def={<><strong className="text-text font-medium">backstab</strong> — the push-in wire termination on the back of a residential receptacle or switch, where a small leaf-spring brass clip grabs a stripped solid conductor without a screw. Cheap to assemble at the factory; mechanically unreliable over heat cycles. Allowed by listing only on 14 AWG devices.</>}>backstab</Term>{' '}
        terminations — the same browned ones that drove the failure in the first place — because the new device has
        the same back-of-the-box holes and it is faster to reuse them than to cut a pigtail. The third is leaving the
        metal box ungrounded because the only thing landed on the ground bar was the old device's mounting screw, and
        nobody noticed there was no green wire in the box at all. The chapter is structured around those three
        failures: verify dead, never trust the old termination, ground the box.
      </p>

      <h2 className="chapter-h2">Verify dead. Then verify dead again.</h2>

      <p className="mb-prose-3">
        The single most-skipped step in residential DIY is the second half of a two-step verification ritual that
        every working electrician performs without thinking, because the cost of skipping it is paid in milliamps
        through the chest. NFPA 70E, the workplace electrical-safety standard that sits alongside the NEC, codifies
        the ritual in Article 110: before working on any conductor presumed to be de-energised, the worker must
        verify the absence of voltage with a test instrument, and must verify the test instrument itself before and
        after the measurement on a known live source<Cite id="nfpa-70e-2024" in={SOURCES} />. Three steps, not one,
        and the order matters.
      </p>
      <p className="mb-prose-3">
        Step one: identify the breaker. With the device still in place and energised, a
        {' '}<Term def={<><strong className="text-text font-medium">non-contact voltage tester (NCVT)</strong> — a handheld pen-style tester that detects the AC electric field around an energised conductor without making physical contact. Useful for locating live wires and identifying live breakers; unreliable as a final verification because it can give false negatives from low battery, indirect coupling, or shielded cable.</>}>non-contact voltage tester (NCVT)</Term>{' '}
        held near the cover plate slot lights up if the receptacle is hot. Flip the breaker the directory claims
        controls this room, return, and confirm the NCVT goes dark. The NCVT is doing one job here: confirming the
        right breaker.
      </p>
      <p className="mb-prose-3">
        Step two: remove the cover plate and unscrew the device from the box, but do not yet disconnect any wires.
        Pull the device gently forward on its existing terminations so the brass and silver screws are visible. Now
        take a {' '}<Term def={<><strong className="text-text font-medium">two-pole probe</strong> — a solenoid-type contact voltage tester with two probes that draws a small load (typically a few mA) through the circuit under test. Reads through phantom voltage because the small load collapses any high-impedance pickup. Industry-canonical example: the Fluke T5-1000 or Wiggy-style solenoid tester.</>}>two-pole probe</Term>{' '}
        — a Fluke T5-1000 or a Wiggy-style solenoid tester — and put one probe on each hot terminal. The probe lights
        up if there is any voltage at all on the conductors, and unlike the NCVT it loads the circuit with a small
        current draw that collapses any
        {' '}<Term def={<><strong className="text-text font-medium">phantom voltage</strong> — a residual AC voltage read by a high-impedance instrument (such as a 10 MΩ DMM) on a disconnected conductor that has no real source, induced by capacitive coupling from neighbouring energised conductors in the same cable. Disappears under any real load.</>}>phantom voltage</Term>{' '}
        coupled in from a parallel cable. If the probe stays dark, repeat the test between hot and neutral, hot and
        ground, and neutral and ground; all three pairs should read zero.
      </p>
      <p className="mb-prose-3">
        Step three: confirm the tester itself works. On the way to the next live receptacle, put the two-pole probe
        across a known hot pair and watch it light up. If it does not, the tester has died sometime in the last few
        minutes and the dead reading on the work was meaningless. This is the step almost everyone skips. NFPA 70E
        requires it precisely because tester failure is silent — the instrument simply reads zero on everything,
        including the conductor that is about to put 5 mA through your chest<Cite id="nfpa-70e-2024" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        Why all this for a 120 V residential circuit? Because the relevant current is the one that flows through the
        body, which is the residual voltage divided by the body's resistance:
      </p>
      <Formula tex="I_{\text{body}} = V_{\text{residual}} / R_{\text{body}}" />
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">I<sub>body</sub></strong> is the current that flows through the human standing on the circuit
        (in amperes), <strong className="text-text font-medium">V<sub>residual</sub></strong> is whatever voltage remains across the contact points
        (in volts), and <strong className="text-text font-medium">R<sub>body</sub></strong> is the total impedance of the path through the body and
        the standing surface — IEC 60479 tables this between roughly 1 kΩ (hand-to-hand, wet skin) and tens of kΩ
        (dry skin, rubber-soled shoes)<Cite id="iec-60479-2018" in={SOURCES} />. The let-go threshold — the largest
        current you can shake off — is about 10 mA for an adult man and 5–6 mA for an adult woman; above that, the
        muscle spasm clamps the hand onto the conductor<Cite id="iec-60479-2018" in={SOURCES} />. At 120 V across a
        12 kΩ body that is exactly 10 mA. The verification ritual exists because the failure mode it prevents is the
        one in which you cannot let go.
      </p>

      <TryIt
        tag="Try 35.1"
        question={
          <>
            You verify a switch is dead with an NCVT, see no light, and start unscrewing. Halfway through,
            the screwdriver feels a tingle. What just happened, and which step did you skip?
          </>
        }
        hint={<>The NCVT reads through electric-field coupling, not actual current. A two-pole probe forces the
        question.</>}
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">
              The NCVT gave a false negative — most likely because the box is plastic (no metal to couple the
              electric field to the sensor), the NCVT battery is weak, or the cable is shielded by a parallel
              dead cable that capacitively bled the field away. The actual conductor was still live, and the
              tingle was the screwdriver completing a path through your hand to ground.
            </p>
            <p className="mb-prose-1 last:mb-0">
              The skipped step is the two-pole probe directly across the conductors, which loads the circuit and
              cannot return a false negative from capacitive coupling alone. NFPA 70E requires it as the
              final verification, not the NCVT<Cite id="nfpa-70e-2024" in={SOURCES} />.
            </p>
            <p className="mb-prose-1 last:mb-0">
              Answer: <strong className="text-text font-medium">the NCVT lied; you skipped step two of the verify-dead ritual</strong>.
            </p>
          </>
        }
      />

      <h2 className="chapter-h2">The anatomy of a duplex receptacle, inside the box</h2>

      <p className="mb-prose-3">
        Chapter 30 introduced the duplex receptacle from the front: two parallel slots, a ground hole, a brass
        stamping bridging the hots, a silver stamping bridging the neutrals, a green stamping tying the ground hole
        to the mounting strap. Inside the wall box the same device has four screw terminals and two pairs of
        push-in backstab holes — two brass, two silver — plus the single green ground screw. The two brass screws
        are joined by a small scored
        {' '}<Term def={<><strong className="text-text font-medium">break-off tab</strong> — the small stamped bridge between paired terminal screws on a duplex receptacle. Twisting it off with pliers electrically isolates the top half of the device from the bottom half, allowing each outlet to be fed independently (split receptacle, switched outlet).</>}>break-off tab</Term>{' '}
        that can be twisted off with pliers, electrically splitting the device into two independent halves. The
        silver-side tab works the same way but is almost never broken in residential work. This is the geometry
        that lets a single device be wired as a switched-bottom / always-on-top outlet, or as a split-feed receptacle
        with one half on each phase of a multi-wire branch circuit.
      </p>
      <p className="mb-prose-3">
        Two ways to land a wire on the terminal screw: a
        {' '}<Term def={<><strong className="text-text font-medium">side-screw clamp</strong> — the terminal screw on the side of a receptacle or switch that compresses a hooked or pressure-plate-clamped conductor against a brass yoke. Mechanically robust; the only termination an electrician will trust for daisy-chained loads.</>}>side-screw clamp</Term>{' '}
        wraps the stripped conductor around a screw that compresses it against a flat brass yoke, and a push-in
        backstab inserts the stripped conductor into a hole behind the device where a leaf-spring brass tab grabs
        it. The two methods have very different long-term reliability, and they are the entire subject of the next
        section. The dimensions of both — slot width, contact pressure, plug retention force — are set by NEMA WD 6
        for the user-facing geometry<Cite id="nema-wd-6" in={SOURCES} /> and by UL 498 for the temperature-rise,
        contact-resistance, and dielectric-withstand performance under
        cycling<Cite id="ul-498" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        The NEMA pattern number stamped on the back of the device is worth knowing. A
        {' '}<Term def={<><strong className="text-text font-medium">NEMA 5-15R</strong> — the most common North American 125 V, 15 A grounded receptacle pattern. Two parallel vertical slots (neutral wider than hot) and a round D-shaped ground hole below. NEMA WD 6 is the dimensional standard.</>}>5-15R</Term>{' '}
        is the standard 15 A, 125 V duplex; a 5-20R has a T-shaped neutral slot so it accepts both a 5-20 plug
        (perpendicular neutral blade) and a 5-15 plug (parallel neutral blade)<Cite id="nema-wd-6" in={SOURCES} />.
        The 20 A device is required by NEC 210.21(B)(3) on 20 A branch circuits feeding more than one outlet — the
        T-slot is what distinguishes a 20 A appliance plug from a 15 A
        one<Cite id="nec-2023" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        NEC 406.4(D) governs the replacement case specifically: a receptacle being replaced must be of the same
        type unless the box now contains a grounding means it did not before, in which case the new device must be
        a grounding type, and if the box still lacks a grounding means the replacement must either be a non-grounding
        device or a GFCI-protected outlet marked "No Equipment Ground"<Cite id="nec-2023" in={SOURCES} />. The
        GFCI substitute is the legal way to put a three-prong receptacle into a two-wire box without running new
        cable; it protects the user (by tripping on residual current to ground) while honestly admitting the
        equipment ground is not present.
      </p>
      <p className="mb-prose-3">
        Two more letters often stamped on a modern device:
        {' '}<Term def={<><strong className="text-text font-medium">tamper-resistant (TR)</strong> — a receptacle with internal spring-loaded shutters that block the slots unless both blades of a plug are inserted simultaneously. Required by NEC 406.12 in dwelling units to prevent child electrocution from inserted objects.</>}>TR (tamper-resistant)</Term>,
        meaning the slots have internal spring shutters that block insertion of a single blade — required in
        dwelling units by NEC 406.12 since 2008<Cite id="nec-2023" in={SOURCES} /> — and
        {' '}<Term def={<><strong className="text-text font-medium">weather-resistant (WR)</strong> — a receptacle constructed with UV-stabilised plastics, corrosion-resistant metal, and seals against moisture. Required by NEC 406.9 in damp and wet locations such as outdoor and bathroom installations.</>}>WR (weather-resistant)</Term>,
        meaning the housing and contacts are constructed to withstand humidity and temperature swings, required for
        damp and wet locations by NEC 406.9<Cite id="nec-2023" in={SOURCES} />.
      </p>

      <h2 className="chapter-h2">Why backstabs fail</h2>

      <p className="mb-prose-3">
        Push-in backstab terminations exist because they are fast at the factory and almost-fast at the rough-in:
        strip the wire 5/8 of an inch, jam it into the hole, done. The mechanical contact is a tiny piece of
        leaf-spring brass inside the device that flexes against the stripped copper to hold it in place. Under
        UL 498 the device is tested to a specified temperature rise at rated current after a specified number of
        cycle and dielectric tests<Cite id="ul-498" in={SOURCES} />. Brand-new, the joint works. The problem is
        what happens after a few hundred heat cycles of real residential use.
      </p>
      <p className="mb-prose-3">
        Every plug-in event runs current through the joint; current heats the joint; the brass leaf-spring expands;
        the joint cools; the spring contracts. Over hundreds of cycles the spring loses some of its preload — the
        elastic modulus of yellow brass is not perfectly recoverable above about 100 °C — and the contact pressure
        drops. Contact resistance is exquisitely sensitive to pressure: at half the original load, the contact
        resistance can rise by a factor of two or three. And once contact resistance rises, the power dissipated in
        the joint at any given current is the runaway:
      </p>
      <Formula tex="P_{\text{joint}} = I^2 R_{\text{contact}}" />
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">P<sub>joint</sub></strong> is the power dissipated in the metal-to-metal contact (in watts),
        <strong className="text-text font-medium"> I</strong> is the load current passing through the joint (in amperes RMS), and
        <strong className="text-text font-medium"> R<sub>contact</sub></strong> is the contact resistance between the leaf-spring brass and the
        stripped copper conductor (in ohms). UL 498 specifies the temperature-rise test against this dissipation
        for the new device<Cite id="ul-498" in={SOURCES} />, but the standard does not — and cannot — promise the
        contact resistance will remain bounded forever. Take a continuous 12 A load through a backstab whose
        contact resistance has degraded to 0.05 Ω:
      </p>
      <Formula tex="P_{\text{joint}} = (12)^2 \times 0.05 = 7.2\ \text{W}" />
      <p className="mb-prose-3">
        Seven watts dissipated in a volume of perhaps a third of a cubic inch, surrounded by plastic, with no
        airflow. The local temperature rises, the brass softens further, the contact pressure drops further, the
        resistance rises further. This is a classic positive-feedback runaway, and it ends in either a tripped
        breaker (best case), a blackened device that smells like burning fish (typical), or an arc-fault inside the
        wall (worst case, which is why NEC has added AFCI requirements to every habitable room — Ch.28).
      </p>
      <p className="mb-prose-3">
        The fix is mechanical, not subtle. <em className="italic text-text">Never use backstabs on daisy-chained outlets.</em> Instead, cut a
        {' '}<Term def={<><strong className="text-text font-medium">pigtail</strong> — a short stub of conductor (usually 6 inches) spliced to the incoming and outgoing branch-circuit conductors with a wire nut or push-in connector, with only the free end landed on the device terminal. Removes the device from the current path of downstream loads.</>}>pigtail</Term>{' '}
        for each colour — a six-inch stub of the same gauge wire — strip 3/4 of an inch off each end, twist the
        incoming branch conductor, the outgoing branch conductor, and the pigtail together with a wire nut (or a
        Wago lever-nut push-in connector), and land only the pigtail's free end on the device's side-screw clamp.
        The {' '}<Term def={<><strong className="text-text font-medium">daisy-chain</strong> — a wiring topology where downstream receptacles or switches are fed by jumping out of the device terminals of each upstream device rather than by splicing inside the box. Common in residential rough-in; dangerous when the load current passes through every intermediate device's internal bus.</>}>daisy-chain</Term>{' '}
        of downstream load current now flows through the wire nut, not through the device's internal brass
        stamping. The receptacle carries only the current of whatever is plugged into it directly. The pigtail is
        the difference between a thirty-amp junction and a one-receptacle outlet, and it is what UL 498 quietly
        assumes when it lists the device for 15 A continuous<Cite id="ul-498" in={SOURCES} />.
      </p>

      <TryIt
        tag="Try 35.2"
        question={
          <>
            A 12 A continuous load passes through a degraded backstab with R<sub>contact</sub> = 0.06 Ω. What is the
            power dissipated in the joint? UL 498 allows a brand-new device a temperature rise of about 30 °C at
            rated current; at what dissipated power does an enclosed joint cross into fire-risk territory?
          </>
        }
        hint={<>P = I²R, then compare to the few-watt thermal budget of a backstab cavity with no airflow.</>}
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">
              Direct application of the section's formula:
            </p>
            <Formula tex="P_{\text{joint}} = I^2 R_{\text{contact}} = (12)^2 \times 0.06 = 8.64\ \text{W}" />
            <p className="mb-prose-1 last:mb-0">
              8.64 W in a one-third-cubic-inch cavity is roughly three to four times the dissipation UL 498 allows
              for a healthy device at its full rated 15 A<Cite id="ul-498" in={SOURCES} />, because a healthy
              device's contact resistance is in the milliohm range. Field experience puts the onset of visible
              insulation discolouration around 2–5 W sustained, and the onset of charring around 8–15 W. This
              joint is in the charring regime.
            </p>
            <p className="mb-prose-1 last:mb-0">
              Answer: <strong className="text-text font-medium">about 8.6 W dissipated; well past the safe envelope for an enclosed
              backstab</strong>. Pigtail it.
            </p>
          </>
        }
      />

      <h2 className="chapter-h2">Switch leg vs hot leg: diagnosing what is actually in the box</h2>

      <p className="mb-prose-3">
        Open a switch box and what you find depends on which side of the loop the switch sits on and what era the
        house was wired in. Three common arrangements account for almost every residential single-pole switch.
      </p>
      <p className="mb-prose-3">
        The first is the simple {' '}<Term def={<><strong className="text-text font-medium">hot leg</strong> — the wiring arrangement in which the branch-circuit hot conductor enters the switch box, is interrupted by the switch, and continues on to the fixture. The neutral runs parallel through the same cable. Easiest to diagnose; standard since NEC 2011 required a neutral in every switch box.</>}>hot-leg</Term>{' '}
        arrangement: a single 14-2 cable enters the box carrying hot, neutral, and ground. The hot lands on one
        terminal of the switch; the other terminal of the switch is the
        {' '}<Term def={<><strong className="text-text font-medium">switch leg</strong> — the conductor on the load side of a switch that runs to the fixture. Energised only when the switch is closed. Identified at the device by being the only conductor that goes dead when the switch is flipped off, with hot still present at the other terminal.</>}>switch leg</Term>{' '}
        that runs back through the cable to the fixture. The neutral and ground are spliced through the box
        unbroken. The reader sees two cables in the box, both with hot, neutral, and ground; flipping the switch
        opens the hot leg of the second cable.
      </p>
      <p className="mb-prose-3">
        The second is the same arrangement but with the switch at the end of the run: a single 14-2 cable enters
        the box and there is no second cable. Both wires of the cable go to the two switch terminals, and the
        fixture sees power only when the switch closes the circuit between them. In modern wiring this is rare —
        NEC 404.2(C) since 2011 requires a neutral conductor in every switch
        box<Cite id="nec-2023" in={SOURCES} /> — but in pre-2011 wiring it is common, and it is the configuration
        that makes a smart-switch retrofit hard.
      </p>
      <p className="mb-prose-3">
        The third is the classic {' '}<Term def={<><strong className="text-text font-medium">switch loop</strong> — a pre-2011 wiring practice in which the hot enters the fixture box, and only two conductors run from the fixture down to the switch box. Both conductors are part of the switched-hot loop; there is no neutral in the switch box. Banned in new construction by NEC 404.2(C) (2011 onward), which requires a neutral in every switch box.</>}>switch loop</Term>:
        the branch-circuit hot enters the fixture box first, not the switch box, and only a two-conductor cable
        runs from the fixture down to the switch. Both conductors of that cable are part of the hot loop — one
        delivers the unswitched hot to the switch, the other returns the switched hot to the fixture — and there is
        no neutral conductor in the switch box at all. Older wiring conventions allowed the white conductor in such
        a cable to carry unswitched hot, with a piece of black tape on the end to flag the colour swap. NEC
        404.2(C) banned this arrangement in new construction starting in the 2011 cycle, on the explicit grounds
        that smart switches, occupancy sensors, and dimmers all need a neutral reference to draw their standby
        power<Cite id="nec-2023" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        The diagnostic for telling the three apart, with the device removed: turn the breaker briefly back on,
        keeping fingers off all bare conductors, and probe between the cap-wrapped pairs with a two-pole probe. If
        one cap shows 120 V to ground steady, that is the unswitched hot. If a second cap shows 120 V to ground
        only when the existing switch is closed (or, more carefully, only when you complete the circuit with a
        temporary clip lead from the unswitched hot to the candidate conductor and the load draws current), that is
        the switch leg. If no cap shows 120 V to ground but there is a measurable hot-to-conductor reading between
        two caps when the upstream fixture is closing a path, you have a switch loop with no neutral. Turn the
        breaker back off, and proceed with the matching replacement procedure for what you found.
      </p>

      <TryIt
        tag="Try 35.3"
        question={
          <>
            A bedroom switch box has two 14-2 cables, both stripped, and only black and white conductors landed
            on the existing switch. The room was wired in 1992. Can you install a smart switch that requires a
            neutral? If not, what are your options?
          </>
        }
        hint={<>Pre-2011 wiring may or may not include a neutral in the switch box. Look at what is actually
        spliced inside.</>}
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">
              Two 14-2 cables in the box does <em className="italic text-text">not</em> by itself confirm a neutral is available at the switch.
              In a hot-leg arrangement both cables would have hot+neutral+ground, and the neutrals would be
              spliced through with a wire nut in the box — look for an unused neutral splice with no tail. In a
              switch-loop arrangement both white conductors are part of the hot loop and there is no neutral in
              the box even though there are two cables, because the second cable goes somewhere else (a wall
              outlet that happens to share the box, for example).
            </p>
            <p className="mb-prose-1 last:mb-0">
              If a true neutral is present in the box (spliced wire nut, untapped), a modern smart switch can be
              installed by adding a pigtail to the neutral splice. If no neutral is present, the options are
              (a) a no-neutral smart dimmer that draws its standby power as a small bleeder current through the
              load (works above about 25 W of resistive or quality-LED load)<Cite id="lutron-dimmer-app-note" in={SOURCES} />,
              (b) opening drywall to pull a neutral down to the switch box (rewire), or (c) leaving the dumb
              switch in place and installing a battery-powered Caséta Pico remote that drives an in-fixture relay
              hidden at the lamp end<Cite id="lutron-dimmer-app-note" in={SOURCES} />.
            </p>
            <p className="mb-prose-1 last:mb-0">
              Answer: <strong className="text-text font-medium">maybe, depending on whether a neutral splice is present in the box</strong> —
              and if it is not, the no-neutral dimmer or the Pico-plus-relay route is the typical fix.
            </p>
          </>
        }
      />

      <h2 className="chapter-h2">Replacing a single-pole switch, a three-way, and a smart dimmer</h2>

      <p className="mb-prose-3">
        The simplest replacement is a single-pole switch. After the verify-dead ritual, unscrew the device, note
        which screw landed which colour, transfer the conductors one at a time to the new device, and screw it back
        in. The two brass screws on a single-pole switch are electrically the same — flipping the toggle just opens
        the conductor between them — so the hot can land on either screw and the switch leg on the other; the
        device does not know which end is which. The green screw lands the ground conductor, which on a metal box
        is also bonded to the box itself by a separate pigtail from the wire-nut bundle (see the next section).
      </p>
      <p className="mb-prose-3">
        A {' '}<Term def={<><strong className="text-text font-medium">three-way switch</strong> — a single-pole double-throw (SPDT) switch wired as one of a pair so that either of two locations can interrupt the same lamp. Has three terminals: a common terminal (one screw, often labelled or marked dark) and two traveller terminals (the pair of brass screws). NEMA pattern: SPDT.</>}>three-way switch</Term>{' '}
        is the staircase classic — two switches that control one lamp, either of which can flip the lamp on or off
        regardless of the other's position. It is an SPDT in disguise: each switch has one
        {' '}<Term def={<><strong className="text-text font-medium">common terminal</strong> — the single throw terminal of a three-way switch, distinct from the two travellers. Usually identified by a dark-coloured screw, sometimes by a stamped label. On one switch of the pair the common takes the unswitched hot; on the other switch of the pair the common takes the switch leg to the fixture.</>}>common terminal</Term>{' '}
        (typically a dark screw, sometimes labelled COM) and two
        {' '}<Term def={<><strong className="text-text font-medium">traveller</strong> — one of the two conductors that runs between a pair of three-way switches. Either one delivers the hot to the fixture-side switch depending on the position of the line-side switch. The two travellers are interchangeable at each device; the common is not.</>}>traveller terminals</Term>{' '}
        (the two brass screws, electrically identical at each device). The unswitched hot from the panel lands on
        the common of the first switch; the common of the second switch lands the switch leg to the fixture; the
        two travellers run between the brass screws of the two devices. Flipping either switch toggles which
        traveller is connected to its common, and the lamp is on whenever the same traveller is selected at both
        ends.
      </p>
      <p className="mb-prose-3">
        The replacement trick: identify the common before unscrewing. On a working three-way the common is the
        screw that is always on one specific conductor — if you measure between any pair of brass screws at the
        old device with power on and the lamp off, the dark-screw conductor will be either at 120 V to ground or
        at 0 V to ground depending on switch position, and the two traveller-screw conductors will swap between
        those two values as you flip the toggle. Once you know which conductor is the common, transfer it to the
        common terminal of the new switch — never to a traveller — and transfer the two travellers to either of the
        two brass screws. Get the common wrong and the switch pair will appear to work in one direction but
        invert the action of the other switch.
      </p>
      <p className="mb-prose-3">
        A {' '}<Term def={<><strong className="text-text font-medium">smart dimmer</strong> — a wall-box dimmer with an integrated microcontroller, wireless radio, and standby power supply. Requires a neutral in the switch box per NEC 404.2(C) (2011 onward), unless it is a no-neutral model that draws its standby current as a bleeder through the load.</>}>smart dimmer</Term>{' '}
        — a Lutron Caséta, an Insteon, a Leviton Decora Smart — is functionally a triac (or MOSFET) phase dimmer
        with a microcontroller running its switching schedule and a small AC-DC supply powering both. The supply
        needs a neutral to source its standby current; that is the entire reason NEC 404.2(C) requires a neutral in
        every switch box since 2011<Cite id="nec-2023" in={SOURCES} />. The dimmer is installed exactly like a
        single-pole switch — hot to LINE, switch leg to LOAD, ground to ground — with the extra neutral pigtailed
        from the box's neutral splice to the dimmer's neutral lead.
      </p>
      <p className="mb-prose-3">
        Two configuration choices that distinguish a working dimmer from a flickering one. The first is dimming
        mode: {' '}<Term def={<><strong className="text-text font-medium">leading-edge dimming</strong> — phase-cut dimming that chops the start of each AC half-cycle. Uses a triac. Compatible with incandescent and magnetic-low-voltage loads; often poorly compatible with LED drivers.</>}>leading-edge</Term>{' '}
        (triac-based, chops the start of each half-cycle) is the original Lutron approach and works well with
        incandescent and magnetic-LV loads but often produces flicker with electronic LED drivers, while
        {' '}<Term def={<><strong className="text-text font-medium">trailing-edge dimming</strong> — phase-cut dimming that chops the tail of each AC half-cycle. Uses a MOSFET. Compatible with most LED drivers and electronic-low-voltage transformers; smoother dimming.</>}>trailing-edge</Term>{' '}
        (MOSFET, chops the tail) is gentler on LED drivers and is the modern default. Lutron's application notes
        spell out which dimmer family suits which load type<Cite id="lutron-dimmer-app-note" in={SOURCES} />. The
        second is the low-end trim: most smart dimmers expose a configurable minimum-output setting so that the
        lamp does not flicker or extinguish at the dimmest position the user can dial. Setting the trim too low
        produces a "the dimmer killed my lamp" complaint; setting it too high gives the user no real low-end
        dimming. The right value for a given LED is found by dialling the dimmer to its bottom stop with the trim
        at its maximum, then walking the trim down until the lamp just leaves the flicker regime — usually a few
        percent of full output<Cite id="lutron-dimmer-app-note" in={SOURCES} />.
      </p>

      <h2 className="chapter-h2">Replacing a fixture: paddle fan, recessed can, pendant</h2>

      <p className="mb-prose-3">
        The wiring side of replacing a ceiling fixture is the same as replacing a receptacle — verify dead, transfer
        hot to the black fixture lead, neutral to the white fixture lead, ground to the green or bare fixture lead,
        wire-nut each splice — but the mechanical side is where most fixture replacements actually fail. The
        controlling number is the
        {' '}<Term def={<><strong className="text-text font-medium">ceiling-box weight rating</strong> — the maximum dead and dynamic load a ceiling-mounted electrical box is listed to support. Standard plastic round boxes are rated for 30 lb static fixture weight; fan-rated boxes are typically rated for 50 lb of dynamic load with a brace clamped between joists; some heavy-pendant boxes are listed for 75 lb or more.</>}>ceiling-box weight rating</Term>{' '}
        stamped or moulded on the box itself, and NEC Article 314.27 is the section that governs
        it<Cite id="nec-2023" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        A standard plastic round ceiling box — the kind that comes in a builder's bag — is listed for a 30 lb
        static fixture, no fan<Cite id="nec-2023" in={SOURCES} />. That is enough for any ordinary surface-mount
        lamp, most recessed cans (which carry their own housing weight on the joist hangers, not on the box), and a
        modest pendant. Anything heavier or anything that moves needs a different box.
      </p>
      <p className="mb-prose-3">
        A {' '}<Term def={<><strong className="text-text font-medium">fan-rated box</strong> — a ceiling-mounted electrical box specifically listed under NEC 314.27(C) for supporting a paddle fan. Typically metal, attached to a steel brace that clamps between two joists. Rated for 50 lb of dynamic load (a 30 lb fan plus the dynamic moment of rotation).</>}>fan-rated box</Term>{' '}
        is listed for supporting a paddle fan: typically a metal box mounted to a steel saddle brace that wedges
        and screws between the two adjacent joists, distributing the dynamic load of a rotating fan into the
        framing rather than into the drywall ceiling. NEC 314.27(C) requires that any ceiling-suspended paddle fan
        be supported by a box (or other independent means) specifically listed for the
        purpose<Cite id="nec-2023" in={SOURCES} />. A 20 lb fan running at speed exerts well more than 20 lb of
        effective load on the box because of the bending moment created by the rotor's mass moving slightly off
        the axis of the box — fan-rated boxes are commonly tested to 50 lb dynamic at 70 rpm.
      </p>
      <p className="mb-prose-3">
        A heavy pendant chandelier — anything above 30 lb static — needs a box listed for that weight, or it needs
        to be hung from an independent support (a threaded rod into a joist or a backing plate) with the box
        serving only as the wiring chamber. NEC 314.27(A)(2) addresses the dead-weight case; the manufacturer's
        marking on the box tells you the listed limit<Cite id="nec-2023" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        Mechanical fitting parts a DIYer will encounter: the
        {' '}<Term def={<><strong className="text-text font-medium">mounting strap</strong> — the flat metal bar that screws across the front of a ceiling box and provides threaded holes for the fixture's mounting screws. Sometimes called a crossbar. Most surface-mount and pendant fixtures attach to the strap, not directly to the box.</>}>mounting strap</Term>{' '}
        (a flat metal bar screwed across the front of the box, providing two threaded holes for the fixture's
        own screws), the {' '}<Term def={<><strong className="text-text font-medium">hickey</strong> — a threaded coupling that joins a pendant's stem to a threaded nipple in the ceiling box. Allows the hanging cord and conductors to pass through. Old electrician's term, still in the catalogues.</>}>hickey</Term>{' '}
        (a threaded coupling that joins a pendant's stem to a nipple in the box and routes the hanging cord
        through), and the canopy (the decorative dome that hides all of this when the fixture is hung). For a
        paddle fan installation the strap is integral to the fan-rated box and the fan's downrod ball-joint mounts
        directly to it; for a chandelier the hickey allows the chain to be of any length without the conductors
        being load-bearing.
      </p>

      <TryIt
        tag="Try 35.4"
        question={
          <>
            A paddle fan with a stated dead weight of 22 lb is being installed where a 30 lb-rated plastic
            ceiling box currently holds a surface-mount LED light. The box is screwed to a single ceiling joist
            via two drywall screws. Is the existing box code-compliant for the new fan, and if not, where does
            the replacement brace need to sit?
          </>
        }
        hint={<>NEC 314.27(C) is explicit: a paddle fan needs a box listed for the fan. The dead weight is not the
        only number that matters.</>}
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">
              No. NEC 314.27(C) requires the fan to be supported by a box specifically listed for fan
              support<Cite id="nec-2023" in={SOURCES} />. A 30 lb static rating is for a non-moving fixture; a
              fan exerts dynamic forces — the rotor's slight off-axis mass creates a bending moment every
              revolution — that a static-rated plastic box cannot be relied on to carry.
            </p>
            <p className="mb-prose-1 last:mb-0">
              The replacement is a fan-rated metal box attached to a steel saddle brace that spans and clamps
              between the two adjacent ceiling joists, not screwed to a single joist or to drywall. The brace
              sits above the drywall, perpendicular to the joists, and is tightened until its teeth bite into
              both joists; the box hangs from the brace. Typical listings are 50 lb dynamic at 70 rpm. The
              ceiling-box screws are loaded in shear, not the drywall.
            </p>
            <p className="mb-prose-1 last:mb-0">
              Answer: <strong className="text-text font-medium">no, swap to a fan-rated box with a between-joists brace</strong>.
            </p>
          </>
        }
      />

      <h2 className="chapter-h2">GFCI replacement and the LINE vs LOAD terminals</h2>

      <p className="mb-prose-3">
        A GFCI receptacle is mechanically a duplex receptacle with extra electronics inside: a small differential
        current transformer wrapped around the hot and neutral conductors, a sense amplifier, a TRIP solenoid that
        opens the internal contacts on command, a TEST button that injects a calibrated leak, and a RESET button
        that re-closes the contacts after a trip. The trip threshold is 4–6 mA of imbalance between hot and neutral
        currents, set by the same Dalziel-curve reasoning Ch.28 walked through for GFCI breakers and
        backed in NEC 210.8 for the receptacle case<Cite id="nec-2023" in={SOURCES} />. UL 498 (and the GFCI
        specific UL 943, referenced in) covers the temperature-rise, dielectric, and endurance
        cycling<Cite id="ul-498" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        The wiring difference from a standard duplex is the pair of terminal sets. A GFCI receptacle has two pairs
        of brass-plus-silver screws, labelled on the back:
        {' '}<Term def={<><strong className="text-text font-medium">LINE (GFCI)</strong> — the input terminals of a GFCI receptacle, where the upstream branch-circuit conductors land. Power flows in at LINE; the differential sensor sits between LINE and the front-face outlets and LOAD.</>}>LINE</Term>{' '}
        and {' '}<Term def={<><strong className="text-text font-medium">LOAD (GFCI)</strong> — the output terminals of a GFCI receptacle, where downstream daisy-chained receptacles are fed. Anything wired to LOAD is GFCI-protected by the upstream device; anything wired only to LINE is not.</>}>LOAD</Term>.
        LINE is where the upstream branch enters — the power coming in from the panel. LOAD is where you feed
        downstream receptacles that you want GFCI-protected by this device. The differential transformer sits
        between LINE and (front-face outlets + LOAD), so every milliamp passing out through the device's front
        slots or through the LOAD terminals is monitored, and every milliamp returning through the front-face
        neutral or LOAD neutral is monitored. Anything that does not return is residual current and triggers the
        trip.
      </p>
      <p className="mb-prose-3">
        Get LINE and LOAD reversed and two things go wrong. First, the differential sensor sits on the wrong side
        of the front-face slots, which means the receptacle's own outlets will trip on normal plugged-in loads (any
        legitimate load on the front face appears as residual current to the sensor) — or, worse, on no loads,
        because the trip electronics are simply not powered correctly. Second, anything wired to what the installer
        thought was LOAD is actually LINE: it is powered directly, bypassing the GFCI's sensor entirely. Downstream
        receptacles that the installer believed were GFCI-protected are not. Modern GFCIs ship with a cardboard
        sticker over the LOAD terminals labelled "Do not remove until LOAD is wired" precisely to prevent this
        reversal, and most modern models include an internal end-of-life feature that refuses to RESET if wired
        backward<Cite id="ul-498" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        The TEST button creates a deliberate small residual current — typically by routing a few mA from the
        downstream hot through a calibrated resistor to the upstream neutral, around the differential sensor —
        and watches for the trip to fire. RESET re-closes the internal contacts. Both buttons exercise the
        electronics and the mechanism, not the upstream wiring, which is why the canonical "press TEST monthly"
        instruction is about the GFCI's own functional integrity, not about whether the line is live.
      </p>

      <TryIt
        tag="Try 35.5"
        question={
          <>
            A GFCI receptacle has been wired with LINE and LOAD swapped: the upstream branch hot and neutral land on
            the LOAD terminals, and a downstream daisy-chained receptacle is wired from the LINE terminals. The
            installer presses TEST. Does the breaker trip? Are the downstream receptacles GFCI-protected?
          </>
        }
        hint={<>The TEST button creates a known residual current; the differential sensor only sits between the
        LINE side and everything downstream of it.</>}
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">
              The TEST button on a reverse-wired GFCI typically does nothing visible at the device — the test
              current is created at the wrong side of the differential sensor, so the sensor sees no imbalance
              and the trip does not fire (modern devices may refuse to RESET in this state on purpose, as a
              wired-backward flag, but the older units just fail silently).
            </p>
            <p className="mb-prose-1 last:mb-0">
              The downstream receptacles are <em className="italic text-text">not</em> GFCI-protected. They are wired to the upstream side
              of the sensor (from the front-panel's perspective), which means current flows to them without
              ever being compared against its return through the sensor. The installer believed they had
              built a GFCI-protected chain; they have actually built an unprotected chain plus a
              non-functional test button.
            </p>
            <p className="mb-prose-1 last:mb-0">
              Answer: <strong className="text-text font-medium">no, the breaker does not trip; no, the downstream outlets are not
              protected</strong>. The fix is to swap the conductors so the incoming branch lands on
              LINE<Cite id="nec-2023" in={SOURCES} />.
            </p>
          </>
        }
      />

      <Pullout>
        The most common DIY electrical failure is not the new device — it is the old terminations the reader
        left in place because they looked fine. They didn't.
      </Pullout>

      <CaseStudies
        intro={
          <>
            Two real-world failures the chapter is calibrated to prevent, and one retrofit dilemma every smart-home
            DIYer hits sooner or later.
          </>
        }
      >
        <CaseStudy
          tag="Case 35.1"
          title="The kitchen receptacle that browned over one winter"
          summary="A 1 500 W space heater, a daisy-chained backstab, and a six-month positive-feedback runaway."
          specs={[
            { label: 'Continuous load', value: <>1 500 W space heater, ≈12.5 A at 120 V <Cite id="codata-2018" in={SOURCES} /></> },
            { label: 'Termination', value: <>push-in backstab, both hot and neutral feed-through <Cite id="ul-498" in={SOURCES} /></> },
            { label: 'Estimated contact resistance after one winter', value: <>~0.03–0.05 Ω <Cite id="ul-498" in={SOURCES} /></> },
            { label: 'Estimated joint dissipation', value: <>~5 W sustained, rising to ~8 W</> },
            { label: 'NEC reference', value: <>406.4(D) for replacement <Cite id="nec-2023" in={SOURCES} /></> },
            { label: 'Correct repair', value: <>pigtail with wire nut or Wago to side-screw clamp <Cite id="ul-498" in={SOURCES} /></> },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            The bedroom-outlet hook scenario, scaled up. A new-construction kitchen receptacle is daisy-chained
            from a 20 A small-appliance branch circuit using the device's own push-in backstabs as the
            feed-through path. For the first winter the homeowner plugs a 1 500 W space heater into one of the
            front slots and runs it for hours at a time; about 12.5 A flows through the device's internal brass
            bus from the backstab on one side to the front-face contact and back out through the backstab on the
            other side<Cite id="codata-2018" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            UL 498 lists the device for 15 A continuous at a small temperature rise, but the listing
            assumes the contact resistance stays in the milliohm range it had at the factory<Cite id="ul-498" in={SOURCES} />.
            Heat-cycling the backstab a few hundred times over the winter relaxes the leaf-spring brass; contact
            resistance creeps from a few milliohms to a few tens of milliohms. At 12.5 A and R<sub>contact</sub>
            ≈ 0.03 Ω the joint is dissipating about 4.7 W into a sealed plastic cavity, and at R<sub>contact</sub>
            ≈ 0.05 Ω it is dissipating about 7.8 W. The wall plate around the slot discolours from cream to weak
            tea; the homeowner notices nothing until summer.
          </p>
          <p className="mb-prose-2 last:mb-0">
            The correct repair is not to install a new device on the same backstabs. NEC 406.4(D) requires the
            replacement to be of equivalent or better type<Cite id="nec-2023" in={SOURCES} />, and the listing
            assumptions on the new device are the same. The repair is to cut the existing branch conductors back
            to clean copper, strip them fresh, cut a six-inch pigtail of the same gauge for each colour, wire-nut
            (or Wago) the incoming, outgoing, and pigtail conductors together, and land only the pigtail's free
            end on the new device's side-screw clamp. The daisy-chain load now bypasses the device entirely; the
            device carries only the current of the plug-in load on its own front face<Cite id="ul-498" in={SOURCES} />.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 35.2"
          title="The pre-2011 light switch and the smart-dimmer dilemma"
          summary="A bedroom switch box with no neutral, a homeowner who wants Caséta, and three legal paths forward."
          specs={[
            { label: 'House era', value: <>built 1992; pre-NEC 404.2(C) switch-box neutral requirement</> },
            { label: 'Existing wiring', value: <>switch-loop arrangement; two-conductor cable; no neutral in box <Cite id="nec-2023" in={SOURCES} /></> },
            { label: 'Desired device', value: <>Lutron Caséta in-wall smart dimmer</> },
            { label: 'Lutron app-note recommendation', value: <>no-neutral dimmer with ≥25 W LED load, or Pico-plus-relay <Cite id="lutron-dimmer-app-note" in={SOURCES} /></> },
            { label: 'NEC governing clause', value: <>404.2(C) — neutral required in new switch boxes since 2011 <Cite id="nec-2023" in={SOURCES} /></> },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            A homeowner in a 1992-vintage house wants Lutron Caséta in the bedroom. Opening the switch box reveals
            a classic switch loop: a single two-conductor cable, both conductors landed on the existing single-pole
            switch, no neutral in the box. The fixture upstream — a ceiling lamp — has the branch hot, the branch
            neutral, and the bottom of the switch loop, but the conductors needed to operate a neutral-required
            smart dimmer are not present at the switch
            location<Cite id="nec-2023" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            Three legal paths. The first is a no-neutral smart dimmer — Caséta's PD-6WCL is the canonical example
            — which draws its standby power as a bleeder current of a few milliamps through the load. This works
            cleanly with a resistive load (incandescent, halogen) or a quality LED rated above about 25 W; with
            very low-wattage LED lamps the bleeder is comparable to the LED driver's input and the lamp can
            flicker, glow at "off," or refuse to dim
            smoothly<Cite id="lutron-dimmer-app-note" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            The second is to pull a neutral conductor from the ceiling box down to the switch box — drywall work,
            usually a fish tape and a single cable swap. With a neutral now present, any neutral-required smart
            dimmer installs as a standard hot+neutral+ground device. NEC 404.2(C) explicitly permits this
            after-the-fact in any retrofit<Cite id="nec-2023" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            The third is to leave the existing dumb switch in place and mount a battery-powered Caséta Pico
            remote on a wall plate where a new "switch" appears to be; the actual lamp control is done by an
            in-fixture relay (a Caséta in-fixture module) installed at the ceiling-box end. The Pico talks to
            the relay wirelessly; the dumb switch becomes a backup. This is the path Lutron's application notes
            recommend for any switch box that genuinely cannot be re-wired for
            neutral<Cite id="lutron-dimmer-app-note" in={SOURCES} />.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 35.3"
          title="The paddle fan that fell after six months"
          summary="A 22 lb fan, a 30 lb-rated plastic ceiling box, and the long slow loosening of two drywall screws."
          specs={[
            { label: 'Fan dead weight', value: <>22 lb</> },
            { label: 'Effective dynamic load at the box', value: <>~30–35 lb during rotation</> },
            { label: 'Original box rating', value: <>30 lb static, non-fan <Cite id="nec-2023" in={SOURCES} /></> },
            { label: 'NEC governing clause', value: <>314.27(C) — fan support <Cite id="nec-2023" in={SOURCES} /></> },
            { label: 'Correct replacement', value: <>fan-rated metal box on a between-joists steel saddle brace <Cite id="nec-2023" in={SOURCES} /></> },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            A common residential failure mode: a paddle fan is installed into a ceiling box that was originally
            rated for a 30 lb static light fixture, not for the dynamic load of a rotating fan. The fan is 22 lb
            of dead weight, which the installer reads as "comfortably below the 30 lb static rating," but the
            rotor of any paddle fan has a small mass-axis offset that creates a per-revolution bending moment on
            the box — effective dynamic loads of 30–35 lb at the box's mounting screws are routine at full speed.
          </p>
          <p className="mb-prose-2 last:mb-0">
            The box is screwed to a single ceiling joist with two drywall screws. Six months of vibration at
            70 rpm — six million cycles, give or take — work the screws loose; the drywall around the screw
            shanks compresses; the box sags; one weekend in June the fan pulls the box and a circle of drywall
            down onto the bed. No injuries. NEC 314.27(C) is the clause that prevents this: a fan support box
            must be specifically listed for fan support, which in practice means a metal box on a steel saddle
            brace clamped between two joists, so the dynamic load is carried by the framing rather than by the
            drywall<Cite id="nec-2023" in={SOURCES} />.
          </p>
        </CaseStudy>
      </CaseStudies>

      <FAQ intro="Questions readers ask the first time they pull a device out of a wall.">
        <FAQItem q="Why did my breaker trip when I touched the screw with the screwdriver — I verified dead!">
          <p>
            The most likely answer is that the NCVT gave a false negative — it samples the electric field around
            a conductor, and that field can be weak or absent for any of several reasons (low battery, plastic
            box, shielded cable, capacitive pickup from a parallel dead cable that confused the tester). The
            two-pole probe loads the circuit with a small real current and cannot give a false negative from
            coupling alone; it is the step NFPA 70E mandates as the actual verification of
            absence-of-voltage<Cite id="nfpa-70e-2024" in={SOURCES} />. If the breaker tripped on the screwdriver
            contact, the circuit was still live and the NCVT-only verification missed it.
          </p>
        </FAQItem>

        <FAQItem q="What does 'phantom voltage' mean and why does my DMM read 80 V on a wire that's dead?">
          <p>
            A modern digital multimeter has an input impedance of 10 MΩ or higher. A disconnected conductor
            running parallel to an energised conductor in the same cable forms a small capacitor with it — a few
            picofarads of distributed capacitance per metre. With the DMM in voltage mode, the capacitive divider
            between the cable's parasitic capacitance and the DMM's 10 MΩ input drops a tiny pickup current onto
            a measurable AC voltage at the meter — often 20–90 V on a wire with no real source. The two-pole
            probe loads the conductor with a few milliamps of real current, which collapses the capacitive
            divider entirely and reads zero. Phantom voltage is one of the headline reasons a solenoid-type
            probe is mandatory for verify-dead work<Cite id="nfpa-70e-2024" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why are backstabs even allowed if they fail?">
          <p>
            They are listed under UL 498 because, at the time of factory assembly and the listing-cycle
            temperature-rise test, they meet the standard<Cite id="ul-498" in={SOURCES} />. The listing does not
            promise the contact resistance stays bounded over a decade of heat cycling, only that it begins
            inside spec. The 2008 cycle of UL 498 restricted backstabs to 14 AWG conductors only (no 12 AWG),
            on the grounds that the leaf-spring geometry is mechanically more reliable at the smaller wire
            gauge<Cite id="ul-498" in={SOURCES} />, and most working electricians simply do not use them for
            daisy-chained loads in the first place. The standard allows the joint; field experience says don't.
          </p>
        </FAQItem>

        <FAQItem q="Can I extend a 14 AWG circuit with 12 AWG wire?">
          <p>
            Yes — larger wire is always allowed on a circuit sized for a smaller wire, because the conductor
            is then below its ampacity limit and the breaker's trip threshold (set by the smallest wire on the
            run) still protects the entire chain. What you cannot do is the reverse: extending a 12 AWG circuit
            on a 20 A breaker with 14 AWG anywhere downstream is a code violation, because the 14 AWG section
            could overheat at currents the 20 A breaker would not trip on. NEC 240.4 spells the rule
            out<Cite id="nec-2023" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why does the hot go to the BRASS screw, not the silver?">
          <p>
            Convention, backed by NEMA WD 6's colour-coding for terminal screws<Cite id="nema-wd-6" in={SOURCES} />.
            The brass-coloured screw is electrically identical to the silver-coloured screw on a standard
            duplex receptacle — both compress a stripped conductor against a brass stamping — but the device
            internals route the brass screws to the hot blade of the outlet and the silver screws to the
            neutral blade. Reversing them puts the hot side of the load on what is supposed to be the neutral
            blade, which means a metal-cased appliance's chassis can become energised at line voltage if the
            internal switch breaks on the wrong side of the load. NEC 200.11 prohibits reversed
            polarity<Cite id="nec-2023" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What's the difference between TR and WR receptacles?">
          <p>
            Tamper-resistant (TR) and weather-resistant (WR) are independent attributes. A TR receptacle has
            internal spring-loaded shutters in front of the slots that block insertion of a single foreign
            object — required in dwelling units by NEC 406.12 since 2008<Cite id="nec-2023" in={SOURCES} />.
            A WR receptacle is built with UV-stabilised plastics, corrosion-resistant metal, and seals
            against moisture — required by NEC 406.9 in damp and wet
            locations<Cite id="nec-2023" in={SOURCES} />. An outdoor receptacle on a covered porch is required
            to be both: TR-WR.
          </p>
        </FAQItem>

        <FAQItem q="Should the ground pin be up or down on a wall outlet?">
          <p>
            The NEC does not specify an orientation; either is code-compliant. Working electricians are split:
            "ground up" advocates note that a partially-extracted plug with the ground up has a metal object
            (a falling washer, a piece of foil from a stripped wire) fall first onto the grounded pin rather
            than across the energised blades; "ground down" advocates note that almost every cord-and-plug
            appliance is moulded with ground-down ergonomics in mind. Hospital construction commonly specifies
            ground-up for the falling-object reason; most residential rough-in is ground-down by habit. UL 498
            lists the device the same way either way<Cite id="ul-498" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why does my GFCI keep tripping even with nothing plugged in?">
          <p>
            Three common reasons. The first is a wiring fault — a hot or neutral conductor downstream of the
            GFCI has a small leak to ground, and the cumulative residual current from that leak (plus any
            other small leaks on the chain) exceeds the 4–6 mA trip threshold<Cite id="nec-2023" in={SOURCES} />.
            The second is a reverse-wired GFCI: LINE and LOAD swapped, the test electronics confused; modern
            GFCIs refuse to RESET in this state on purpose. The third is end-of-life: GFCI electronics drift
            over the device's listed life (typically 15–20 years), and a worn unit may trip nuisance-style on
            ambient noise. UL 498 specifies the relevant endurance cycling<Cite id="ul-498" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Can I replace a 2-prong outlet with a 3-prong if there's no ground wire?">
          <p>
            Yes, but only as a GFCI-protected outlet marked "No Equipment Ground" — that is the explicit
            exception in NEC 406.4(D)(2)(c)<Cite id="nec-2023" in={SOURCES} />. The GFCI substitutes for the
            equipment-grounding conductor by detecting current leaking to ground and tripping, even though
            there is no metallic path back to the panel. What you cannot do is install an ordinary
            grounding-type receptacle and either leave its ground screw floating or "bootleg" it to the
            neutral; both are code violations and both create real shock and fire hazards. The GFCI replacement
            is honest about the missing ground (the required label warns of it) and provides the next-best
            user protection.
          </p>
        </FAQItem>

        <FAQItem q="Why does my smart dimmer flicker the LED at low brightness?">
          <p>
            Two interacting causes. The first is a mismatch between dimmer mode and driver: leading-edge
            (triac) dimmers chop the start of each AC half-cycle and present a discontinuous current step that
            cheap LED drivers handle poorly; trailing-edge (MOSFET) dimmers chop the tail and are
            easier on most LED
            drivers<Cite id="lutron-dimmer-app-note" in={SOURCES} />. The second is the low-end trim setting:
            below a few percent of full conduction, the LED driver receives less than its minimum holdup
            energy per half-cycle and the lamp flickers or extinguishes. Lutron's application notes recommend
            walking the trim up from minimum until the lamp leaves the flicker regime; a typical setting is
            5–15 % of full output<Cite id="lutron-dimmer-app-note" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why is my fan box rated only 35 lb when the fan weighs 20 lb?">
          <p>
            Because the fan's effective load on the box during rotation is significantly higher than its dead
            weight. The rotor has a small mass-axis offset (manufacturing tolerance) that creates a
            per-revolution bending moment, and the box has to carry both the static weight and the rotating
            moment. NEC 314.27(C) is intentionally separate from the static-fixture rule for this
            reason<Cite id="nec-2023" in={SOURCES} />, and fan-rated boxes are typically tested to about 50 lb
            dynamic at 70 rpm so they handle the worst-case rotating moment of a 30–35 lb fan with margin.
            A 35 lb-rated fan box for a 20 lb fan is the correct sizing, not over-engineering.
          </p>
        </FAQItem>

        <FAQItem q="What's a 'switch loop' and why is it banned in new construction?">
          <p>
            A switch loop is a wiring practice in which the branch hot enters the fixture box first, and only
            a two-conductor cable runs from the fixture down to the switch — meaning there is no neutral in
            the switch box at all, only the hot and the switch leg. NEC 404.2(C) since 2011 has required a
            neutral conductor in every switch box explicitly so that occupancy sensors, smart switches, and
            no-flicker dimmers have a real neutral to draw their standby power
            from<Cite id="nec-2023" in={SOURCES} />. Switch loops in pre-2011 houses are still legal under
            grandfathering; new wiring cannot create one.
          </p>
        </FAQItem>

        <FAQItem q="Why do I see 80 V at the ground pin of an old outlet?">
          <p>
            Almost always a wiring fault that needs investigation, not a meter quirk. Possibilities include a
            bootlegged ground (the previous owner jumpered the ground screw to the neutral screw, putting a
            return-path voltage on the ground), an open neutral somewhere upstream (the neutral is floating
            and the ground is now seeing it through a load), or a phantom-voltage pickup on a genuinely
            disconnected ground that nobody noticed has never been bonded to the panel. The two-pole probe
            will distinguish between a real fault (probe lights up under load) and a phantom (probe stays
            dark)<Cite id="nfpa-70e-2024" in={SOURCES} />. Either way, do not assume the building's
            equipment-grounding system is working until verified.
          </p>
        </FAQItem>

        <FAQItem q="Why is the elementary charge in CODATA cited in a DIY chapter?">
          <p>
            Because every current in this chapter — the 12 A through a degraded backstab, the 5 mA GFCI
            threshold, the 10 mA let-go current — is ultimately a count of elementary charges per second
            through a cross-section, scaled by the CODATA 2018 fixed value of <em className="italic text-text">e</em> = 1.602176634×10⁻¹⁹ C
            exactly<Cite id="codata-2018" in={SOURCES} />. The chapter is intentionally pinned to that
            constant: the milliamp values that distinguish a working GFCI from a fire and from a corpse
            are not arbitrary thresholds, they are points on a current-through-body curve that ultimately
            terminates in the count of electrons crossing the chest each second.
          </p>
        </FAQItem>
      </FAQ>
    </ChapterShell>
  );
}
