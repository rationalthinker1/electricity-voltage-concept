/**
 * Chapter 31 — Big loads: dryers, ranges, EVs, heat pumps
 *
 * Fifth chapter of the applied house-electricity track. Picks up from Ch.29
 * (branch circuits) and Ch.30 (switches and receptacles) and follows the
 * other branch off the panel: the 240 V double-pole circuits. The argument:
 * everything in the house that pulls more than ~1.8 kW eventually wants
 * 240 V, because P = V·I and I²R losses scale as P²/V². Recap the split-
 * phase secondary from Ch.27, distinguish pure-240 V loads (heater, water
 * heater) from 120/240 V split loads (dryer, range), walk through heat
 * pumps and FLA/LRA, then through level-1/2/3 EV charging and the J1772 /
 * CCS / NACS coupler ecosystem, and finish with NEC demand-load
 * calculations and whether a panel can absorb a new EV charger or needs
 * an upgrade. No new demos — this chapter is prose-heavy and lives off
 * the receptacle pictograms the reader already knows.
 *
 * Every numerical or historical claim cites a key from chapter.sources:
 *   nec-2023, sae-j1772, ul-2231, iec-62196, codata-2018,
 *   grainger-power-systems-2003.
 */
import { CaseStudies, CaseStudy } from '@/components/CaseStudy';
import { ChapterShell } from '@/components/ChapterShell';
import { FAQ, FAQItem } from '@/components/FAQ';
import { Formula } from '@/components/Formula';
import { Pullout } from '@/components/Prose';
import { Cite } from '@/components/SourcesList';
import { Term } from '@/components/Term';
import { TryIt } from '@/components/TryIt';
import { getChapter } from './data/chapters';

export default function Ch31HouseBigLoads() {
  const chapter = getChapter('house-big-loads')!;
  const SOURCES = chapter.sources;

  return (
    <ChapterShell chapter={chapter}>
      <p className="chapter-intro">
        Open the door of the laundry-room cabinet on a recently-built house and the receptacle behind the dryer
        has four prongs, not three: two angled blades for L1 and L2, a straight blade for the neutral, and a
        round pin for ground. Walk a few metres across the basement to the workshop and the baseboard heater
        has been hard-wired to a junction box with only three wires entering it — two hots and a ground, no
        neutral. Look at the back of the wall-mounted heat-pump air handler in the utility room and you see
        four wires again: two hots, neutral, ground. Step outside, peek behind the EV charger bolted to the
        garage wall, and depending on the model it might be three wires (no neutral) or four.
      </p>
      <p className="mb-prose-3">
        Every one of these is a 240 V appliance taking advantage of the same fact about the service
        transformer's centre-tapped secondary that Chapter 27 made concrete: the two hots arriving at the panel
        are 180° out of phase, so the voltage <em className="italic text-text">between</em> them is twice the voltage of either one to
        neutral. A 240 V appliance taps both of them at once. Whether it also taps the neutral depends on
        whether some small subsystem inside the appliance — a control board, a clock, a blower motor — needs
        120 V for itself. The dryer's tumble motor and electronics do; its heating element does not. That
        single distinction explains the four-wire versus three-wire cable choice for every big load in the
        building, and it is the through-line of this chapter.
      </p>

      <h2 className="chapter-h2">Why 240 V at all</h2>

      <p className="mb-prose-3">
        Chapter 27 derived the split-phase secondary and Chapter 29 sized 14, 12, and 10 AWG branch wiring for
        thermal limits. The remaining piece is the economics that justified two voltages in the first place:
        for any fixed load power, doubling the supply voltage halves the current and quarters the wire's
        resistive loss. The relationships are the same Ohm's-law identities that have appeared in every
        chapter since Chapter 3 — combined here in a single argument.
      </p>
      <Formula>P = V × I</Formula>
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">P</strong> is the real power delivered to a resistive load (in watts), <strong className="text-text font-medium">V</strong>{' '}
        is the RMS supply voltage at the appliance terminals (in volts), and <strong className="text-text font-medium">I</strong> is the RMS
        current through the load (in amperes). The same power can be moved at any voltage you like as long as
        the current scales inversely. Rearranged for the current required to deliver a given power:
      </p>
      <Formula>I = P / V</Formula>
      <p className="mb-prose-3">
        with all three symbols defined as above. A <strong className="text-text font-medium">5 000 W</strong> resistive dryer on 120 V draws
        41.7 A; the same dryer on 240 V draws 20.8 A. The breaker, the receptacle, and the wire are all sized
        to the current, not the power, so halving the current is a direct halving of every component cost
        downstream of the panel<Cite id="nec-2023" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        The wire-loss case is stronger still. The power dissipated as heat in the supply wires of a branch
        circuit is, by Ohm's law applied to the wire itself:
      </p>
      <Formula>P_loss = I² × R_wire</Formula>
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">P_loss</strong> is the resistive heat dissipated along the round-trip length of the
        branch wire (in watts), <strong className="text-text font-medium">I</strong> is the current through the wire (in amperes), and{' '}
        <strong className="text-text font-medium">R_wire</strong> is the total round-trip resistance of the conductor (in ohms; for residential
        copper at warm operating temperature, on the order of a few tens of milliohms over a typical 25 m
        run<Cite id="codata-2018" in={SOURCES} />). Substitute I = P/V into the loss expression and the loss
        scales as the square of the load power divided by the square of the supply voltage:
      </p>
      <Formula>P_loss = (P / V)² × R_wire = P² R_wire / V²</Formula>
      <p className="mb-prose-3">
        where the symbols have their previous meanings. Doubling V at fixed P quarters the wire loss. A
        5 000 W resistive dryer over 25 m of 8 AWG copper (round-trip ≈ 100 mΩ) loses about 174 W on 120 V; on
        240 V it loses about 43 W. That four-to-one ratio of wire loss is the entire reason every appliance
        pulling more than a couple of kilowatts in a North-American house lives on a 240 V
        circuit<Cite id="grainger-power-systems-2003" in={SOURCES} />. The same argument, scaled up, is what
        keeps the transmission grid running at hundreds of kilovolts rather than at tens<Cite id="grainger-power-systems-2003" in={SOURCES} />.
      </p>

      <TryIt
        tag="Try 31.1"
        question={
          <>
            A <strong className="text-text font-medium">1 500 W</strong> kettle heating element is wired once at 120 V and again, by switching its
            internal jumper, at 240 V. The supply wire from the panel to the kettle is the same in both cases:
            <strong className="text-text font-medium"> 20 m</strong> of copper with a round-trip resistance of <strong className="text-text font-medium">0.40 Ω</strong>. Compute
            the current and the wire loss in each case.
          </>
        }
        hint="Use I = P/V for each supply voltage, then P_loss = I² R for the same wire."
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">On 120 V:</p>
            <Formula>I = 1500 / 120 = 12.5 A</Formula>
            <Formula>P_loss = (12.5)² × 0.40 = <strong className="text-text font-medium">62.5 W</strong></Formula>
            <p className="mb-prose-1 last:mb-0">On 240 V:</p>
            <Formula>I = 1500 / 240 = 6.25 A</Formula>
            <Formula>P_loss = (6.25)² × 0.40 = <strong className="text-text font-medium">15.6 W</strong></Formula>
            <p className="mb-prose-1 last:mb-0">
              Doubling the supply voltage halves the current and quarters the wire loss — exactly the
              quadratic-in-voltage savings that justifies a 240 V circuit for every big resistive load in the
              house<Cite id="grainger-power-systems-2003" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2 className="chapter-h2">L1 and L2 — same source, opposite phase</h2>

      <p className="mb-prose-3">
        The two hot conductors arriving at the main panel are not two separate phases. They are the two ends of
        one centre-tapped secondary winding inside the pole-pig transformer, and they oscillate in lockstep
        about the grounded centre tap (Chapter 27). The instantaneous voltage at L1 with respect to neutral is
        a 60 Hz sinusoid with peak ~170 V; the instantaneous voltage at L2 is the same sinusoid <em className="italic text-text">negated</em>
        — when L1 is at +170 V, L2 is at −170 V<Cite id="nec-2023" in={SOURCES} />. The voltage between L1 and
        L2 is therefore not zero (as it would be for two in-phase wires) and not √3 times 120 V (as for two
        legs of a three-phase service); it is the algebraic difference of two equal and opposite sinusoids:
      </p>
      <Formula>V_LL(t) = V_L1(t) − V_L2(t) = V_peak cos(ωt) − V_peak cos(ωt + π) = 2 V_peak cos(ωt)</Formula>
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">V_LL(t)</strong> is the instantaneous{' '}
        <Term def={<><strong className="text-text font-medium">line-to-line voltage</strong> — the instantaneous voltage measured between two ungrounded service conductors. On a North-American split-phase service this is 240 V RMS (≈ 339 V peak), 180° larger than either hot-to-neutral voltage because the two hots are themselves 180° out of phase about the grounded centre-tap neutral.</>}>line-to-line voltage</Term>{' '}
        between L1 and L2 (in volts), <strong className="text-text font-medium">V_L1(t)</strong> and <strong className="text-text font-medium">V_L2(t)</strong> are the
        instantaneous voltages of bus L1 and bus L2 with respect to the centre-tap neutral (in volts),{' '}
        <strong className="text-text font-medium">V_peak</strong> is the peak amplitude of each leg's sinusoid (in volts; for a nominal 120 V RMS
        service, V_peak ≈ 170 V), and <strong className="text-text font-medium">ω = 2π · 60 rad/s ≈ 377 rad/s</strong> is the angular frequency
        of the North-American grid<Cite id="codata-2018" in={SOURCES} />. The algebra is just the
        cosine-difference identity: cos(ωt + π) = −cos(ωt), so the difference adds rather than cancels and the
        envelope is 2 V_peak ≈ 340 V peak, or 240 V RMS.
      </p>
      <p className="mb-prose-3">
        Compare to a North-American three-phase commercial 208Y/120 V service, where L1, L2, and L3 are 120°
        apart on the unit circle rather than 180°. The line-to-line voltage there is the magnitude of the
        vector difference of two unit-magnitude phasors separated by 120°, which is{' '}
        <strong className="text-text font-medium">√3 ≈ 1.732</strong> times the line-to-neutral voltage — about 208 V across each pair of hots,
        not the 240 V of a residential service<Cite id="grainger-power-systems-2003" in={SOURCES} />. A 240 V
        appliance plugged into a 208 V commercial service runs about 25% under-powered (because power scales as
        V²/R for a resistive load), which is why three-phase commercial buildings often have a separate
        single-phase 240 V transformer in the electrical room for appliances designed against the residential
        spec. The geometry of the supply matters; the appliance is built for one of two
        topologies<Cite id="grainger-power-systems-2003" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        The practical upshot inside a residential panel: a two-pole breaker spans two adjacent vertical slots,
        the bus stamping puts L1 on one slot and L2 on the adjacent one (Ch.28's alternating-phase bus), and
        the breaker automatically grabs one of each. Pull the breaker out and you have two terminal screws
        that sit at 240 V RMS apart at all times. Wire the appliance to those two screws and the rest is just
        Ohm's law<Cite id="nec-2023" in={SOURCES} />.
      </p>

      <h2 className="chapter-h2">Pure 240 V loads (no neutral)</h2>

      <p className="mb-prose-3">
        A resistive heating element does not care about which hot is which. Connect it between L1 and L2 and
        it sees 240 V RMS continuously — twice the voltage of either hot to neutral, with no zero crossings of
        the line-to-line waveform any different from a single 240 V phase. There is nothing inside the
        appliance that wants 120 V; there is no clock, no LED display, no auxiliary motor. The cable feeding
        it carries two hots and one bare ground for fault clearing, and that is it. NEC calls this a{' '}
        <Term def={<><strong className="text-text font-medium">three-wire</strong> 240 V branch — a 240 V circuit fed by two ungrounded conductors and one equipment-grounding conductor only. Used for appliances whose entire load is between L1 and L2 with no internal 120 V subsystem: baseboard heaters, resistive water heaters, well pumps with no controls in the can.</>}>three-wire</Term>{' '}
        configuration: two ungrounded conductors plus the equipment-grounding conductor, no neutral<Cite id="nec-2023" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        The classic examples are residential and well-understood. An electric baseboard heater is a long thin
        resistive coil running the length of the unit; it pulls perhaps 1 500 to 2 500 W at 240 V on a 15 A or
        20 A breaker. A tankless water heater is several large resistive coils in series with the inlet pipe
        and a flow switch; it pulls anywhere from 10 kW to 36 kW (a 36 kW unit on a 200 A service is at the
        edge of what residential infrastructure can carry, drawing 150 A continuously across two hots). A
        deep-well submersible pump's induction motor sits between L1 and L2 with its centrifugal start switch
        and run capacitor entirely powered from the 240 V terminals; no 120 V control circuit is needed
        because the well's pressure switch is its own self-contained 240 V mechanical contactor. The American
        receptacle pattern for a portable 240 V three-wire device is{' '}
        <Term def={<><strong className="text-text font-medium">NEMA 6-15 / 6-20 / 6-30 / 6-50</strong> — the family of three-prong 240 V receptacles: two angled hot blades, one round ground pin, no neutral. The number after the dash is the breaker ampacity. NEMA 6-20 is common for portable 240 V air conditioners and welders; NEMA 6-50 is the same form factor scaled up for larger loads.</>}>NEMA 6-15 / 6-20 / 6-30 / 6-50</Term>:
        three prongs, the two flat blades for L1 and L2 plus a round ground pin, no neutral
        blade<Cite id="nec-2023" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        The wire that feeds a three-wire 240 V appliance is two-conductor cable plus a ground — that is, what
        the trade calls <em className="italic text-text">12-2 with ground</em> or <em className="italic text-text">10-2 with ground</em> Romex<Cite id="nec-2023" in={SOURCES} />.
        The white conductor in the cable is, under NEC 200.7(C)(1), permitted to be re-identified as a hot by
        wrapping it with black tape at every termination, so a 12-2 cable's white wire becomes the second hot
        rather than a neutral. There is no separate neutral run because the appliance does not have a 120 V
        subsystem to feed. The bare conductor in the cable is the equipment-grounding conductor and lands on
        the ground bar in the panel just like every other ground wire in the building.
      </p>

      <h2 className="chapter-h2">120/240 V split loads (with neutral)</h2>

      <p className="mb-prose-3">
        Most modern major appliances are not pure-resistive. They have a heating element that lives between L1
        and L2 at 240 V, and they also have a control board, a tumble motor, an LED display, an internal
        blower, an electronic ignitor, or some combination of these — and all of those small subsystems run
        from one of the two hots to neutral at 120 V. The cable now needs four conductors: L1, L2, neutral,
        and ground. NEC calls this a{' '}
        <Term def={<><strong className="text-text font-medium">four-wire</strong> 120/240 V branch — a circuit with two ungrounded conductors (L1 and L2), a grounded neutral, and an equipment-grounding conductor. Allows the appliance to draw 240 V between L1 and L2 for its heating element and 120 V between either hot and neutral for control electronics or small motors. Mandatory since NEC 1996 for new dryer and range installations.</>}>four-wire</Term>{' '}
        configuration<Cite id="nec-2023" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        An electric clothes dryer is the canonical example. The heating element is a coiled nichrome resistor
        roughly 11 Ω that pulls about 22 A on 240 V (≈ 5.3 kW of heating). The drum-tumble motor is a 1/4 HP
        capacitor-start induction motor running from L1 to neutral at 120 V, drawing maybe 5 to 7 A. The
        electronic control board with its LED display draws a fraction of an amp at 120 V from the same
        neutral. The cable that feeds it is 10-3 with ground: three current-carrying conductors (two hots, one
        neutral) at 10 AWG plus a bare 10 AWG equipment ground, all on a 30 A double-pole
        breaker<Cite id="nec-2023" in={SOURCES} />. The receptacle is a{' '}
        <Term def={<><strong className="text-text font-medium">NEMA 14-30</strong> — the standard four-prong 30 A 120/240 V dryer receptacle in current North-American residential construction. Two angled hot blades, one L-shaped neutral blade, one round ground pin. Mandatory for new dryer installations since NEC 1996 (replacing the obsolete three-prong NEMA 10-30).</>}>NEMA 14-30</Term>:
        two flat hot blades, one L-shaped neutral, one round ground.
      </p>
      <p className="mb-prose-3">
        An electric range is the same architecture scaled up. The bake and broil elements are 240 V resistive
        coils pulling tens of amps; the surface burners (in a non-induction range) are 240 V coils with
        infinite-switch controllers. The oven light, clock, electronic ignitor on a dual-fuel model, and the
        cooling fan are all 120 V from one hot to neutral. The cable is 6-3 with ground feeding a{' '}
        <Term def={<><strong className="text-text font-medium">NEMA 14-50</strong> — the standard four-prong 50 A 120/240 V range receptacle. Same prong layout as the 14-30 but rated for 50 A on 6 AWG copper. Also the dominant receptacle for residential level-2 EV charging when the EVSE is plug-in rather than hardwired.</>}>NEMA 14-50</Term>{' '}
        on a 50 A double-pole breaker<Cite id="nec-2023" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        Older homes — built before 1996 in most jurisdictions — used a three-wire 120/240 V receptacle for
        dryers and ranges: L1, L2, and a single grounded conductor that doubled as both neutral and equipment
        ground. The receptacle was a{' '}
        <Term def={<><strong className="text-text font-medium">NEMA 10-30 / 10-50</strong> — the obsolete three-prong 120/240 V dryer (30 A) and range (50 A) receptacles. Used in U.S. residential construction prior to NEC 1996. Two flat hot blades and one L-shaped grounded conductor that served as both neutral and equipment ground; the dryer or range cabinet was bonded to this combined conductor. Banned for new installations because a broken neutral / ground would energise the appliance frame.</>}>NEMA 10-30 (dryer) or 10-50 (range)</Term>:
        three prongs only, no separate ground pin. The reasoning at the time was that the dryer or range
        cabinet was bonded internally to the grounded conductor, so a short from a heating element to the
        cabinet would return on the grounded conductor and trip the breaker. The failure mode that killed the
        design was simpler: if the grounded conductor broke (a corroded connection at the receptacle, a
        rodent-chewed cable, an old worn-out cord) anywhere upstream of the appliance, the cabinet was no
        longer bonded to anything — and any 120 V leakage from the internal control board's hot conductor to
        the cabinet would float the entire chassis up toward 120 V, electrocuting whoever next touched the
        dryer with damp hands. NEC 250.140 banned the three-wire 10-30 / 10-50 for new installations starting
        with the 1996 cycle and required four-wire 14-30 / 14-50 thereafter<Cite id="nec-2023" in={SOURCES} />.
        Existing three-wire installations in occupied homes remain grandfathered, and certain mobile-home and
        recreational-vehicle applications still use legacy three-wire connections under specific exceptions.
      </p>

      <Pullout>
        A 240 V outlet isn't a different kind of electricity. It's the same single phase, picked up from both
        ends of the secondary winding instead of from one end and the centre tap.
      </Pullout>

      <TryIt
        tag="Try 31.2"
        question={
          <>
            A modern dryer's 4-wire <strong className="text-text font-medium">NEMA 14-30</strong> receptacle is wired with L1, L2, neutral, and
            ground. The drum-tumble motor draws <strong className="text-text font-medium">6 A</strong> at 120 V from L1 to neutral; the heating
            element draws <strong className="text-text font-medium">22 A</strong> at 240 V between L1 and L2. Compute the current flowing in
            each of the four conductors at the receptacle.
          </>
        }
        hint="L1 carries the motor current plus the element current. L2 carries the element current only. Neutral carries the motor's return current; ground carries zero."
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">The element current flows out L1 and back through L2 (or vice versa each half-cycle); the motor
            current flows out L1 and back through neutral. Sum on each conductor:</p>
            <Formula>I_L1 = I_motor + I_element = 6 + 22 = <strong className="text-text font-medium">28 A</strong></Formula>
            <Formula>I_L2 = I_element = <strong className="text-text font-medium">22 A</strong></Formula>
            <Formula>I_neutral = I_motor = <strong className="text-text font-medium">6 A</strong></Formula>
            <Formula>I_ground = <strong className="text-text font-medium">0 A</strong></Formula>
            <p className="mb-prose-1 last:mb-0">
              L1 is the busiest conductor — it carries both the 120 V motor current and one direction of the
              240 V element current. The neutral carries only the 120 V imbalance, which is why 14-30 cable's
              neutral conductor is the same gauge as the hots even though it carries less current. The bare
              ground sits idle under normal operation and exists only for fault clearing, exactly as Ch.28's
              bonding-and-grounding chapter spelled out<Cite id="nec-2023" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2 className="chapter-h2">The heat pump</h2>

      <p className="mb-prose-3">
        The biggest mechanical load in most new houses is no longer the dryer or the range — it is the heat
        pump. A 3-tonne residential air-source heat pump (one tonne ≈ 3.5 kW of heating capacity) pulls roughly
        <strong className="text-text font-medium"> 5 kW</strong> of electrical input under nominal operating conditions, drawing about 21 A
        continuous at 240 V split-phase. A 5-tonne unit for a colder climate pulls closer to 8 kW (33 A
        continuous). The compressor sits between L1 and L2 at 240 V; the reversing valve (which swaps the
        refrigerant flow direction between heating and cooling modes) is a 240 V solenoid; the outdoor
        condenser fan motor is usually 240 V; the indoor air handler's blower motor and control board live on
        a separate 120 V branch with its own neutral and ground<Cite id="nec-2023" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        Two terms govern the breaker sizing of any motor-driven appliance, and they are what distinguish a
        heat-pump circuit from a resistive load:
      </p>
      <Formula>FLA = P_rated / V_supply</Formula>
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">FLA</strong> is the{' '}
        <Term def={<><strong className="text-text font-medium">full-load amperage</strong> (FLA) — the steady-state current a motor draws under its rated mechanical load. Stamped on the equipment nameplate. The current the wire and the running thermal-protection device are sized against.</>}>full-load amperage</Term>{' '}
        of the motor (in amperes), <strong className="text-text font-medium">P_rated</strong> is the electrical input power at the rated
        operating point (in watts), and <strong className="text-text font-medium">V_supply</strong> is the supply voltage (in volts; 240 V for
        a residential heat pump on a split-phase service). FLA is the steady-state current the compressor draws
        once it is up to speed and pumping refrigerant at its design conditions. For a 5 kW input at 240 V,
        FLA ≈ 5 000 / 240 ≈ <strong className="text-text font-medium">21 A</strong><Cite id="grainger-power-systems-2003" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        But induction motors do not start at their running current. When power is first applied and the rotor
        is stationary, the motor's impedance is much lower than at running speed (because the slip is 1 — the
        rotor is fully out of sync with the rotating stator field), and the inrush current can be five to seven
        times the FLA for the few seconds it takes the rotor to come up to speed:
      </p>
      <Formula>LRA = (5 to 7) × FLA</Formula>
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">LRA</strong> is the{' '}
        <Term def={<><strong className="text-text font-medium">locked-rotor amperage</strong> (LRA) — the current a motor draws at the instant of starting, when the rotor has not yet begun to turn (slip = 1). For a residential induction-motor compressor LRA is typically 5–7 times FLA. The current the breaker must briefly tolerate without tripping.</>}>locked-rotor amperage</Term>{' '}
        of the motor (in amperes; the current the motor draws at the instant of energising, when its rotor is
        not yet spinning), <strong className="text-text font-medium">FLA</strong> is the full-load amperage as defined above, and the multiplier
        depends on the motor's NEMA code letter (typically code-G through code-K for residential
        compressors)<Cite id="grainger-power-systems-2003" in={SOURCES} />. For the 5 kW heat pump above, LRA
        is typically 100 to 150 A — five to seven times the running 21 A — for half a second to two seconds.
      </p>
      <p className="mb-prose-3">
        A standard thermal-magnetic breaker rated 25 A or 30 A would trip every time the compressor started,
        because its magnetic element would see the 100 A inrush and yank the latch open before the rotor came
        up to speed. NEC Article 440 (HVAC equipment) handles this by permitting the breaker for a hermetically
        sealed compressor to be sized up to <strong className="text-text font-medium">175 % to 225 %</strong> of the motor's FLA when it is
        listed as an{' '}
        <Term def={<><strong className="text-text font-medium">HACR breaker</strong> — Heating-Air-Conditioning-Refrigeration; a UL 489 breaker specifically listed for use with HVAC compressors. Its time-current curve is shaped to tolerate the brief locked-rotor inrush of an induction motor without tripping while still protecting the wire against sustained overload. Required by NEC Article 440 for HVAC branch circuits.</>}>HACR-rated</Term>{' '}
        type (Heating-Air-Conditioning-Refrigeration listing under UL 489)<Cite id="nec-2023" in={SOURCES} />.
        The HACR breaker's time-current curve has the thermal element shifted to higher currents and the
        magnetic element timed to ignore the brief inrush, so it tolerates LRA for the few seconds the motor
        needs but still protects the wire against a true overload. The 5 kW heat pump above (FLA 21 A) would
        run on a 40 A HACR-rated 2-pole breaker — not the 25 A breaker you would size by FLA × 1.25 alone.
      </p>
      <p className="mb-prose-3">
        Modulating inverter heat pumps (the dominant architecture in new installations since around 2015) avoid
        most of this problem by running the compressor through a variable-frequency drive that soft-starts the
        motor from zero speed. The inverter ramps the stator frequency from 0 Hz up to the running point over
        a few seconds, the rotor follows it smoothly, and the peak inrush current never exceeds about 1.5×
        FLA. The breaker can be sized closer to the FLA × 1.25 continuous-load multiplier and the cable does
        not need the same headroom. But fixed-speed compressors — still the majority of installed equipment in
        older buildings — operate exactly as the LRA equation describes, and Article 440 was written for
        them<Cite id="nec-2023" in={SOURCES} />.
      </p>

      <TryIt
        tag="Try 31.3"
        question={
          <>
            A 3-tonne residential heat pump is rated at <strong className="text-text font-medium">5 kW</strong> running, on a 240 V split-phase
            service. The nameplate lists <strong className="text-text font-medium">LRA = 95 A</strong>. What size breaker should it use, and
            what listing must the breaker carry?
          </>
        }
        hint="Compute FLA from P_rated / V_supply, then apply NEC Article 440's 175–225 % multiplier for an HACR breaker."
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">Full-load amperage from the nameplate:</p>
            <Formula>FLA = 5000 / 240 ≈ 20.8 A</Formula>
            <p className="mb-prose-1 last:mb-0">
              At the maximum multiplier of 225 % (NEC Article 440's upper bound for an HACR breaker on a
              hermetically sealed compressor)<Cite id="nec-2023" in={SOURCES} />:
            </p>
            <Formula>I_breaker_max = 2.25 × 20.8 ≈ 46.8 A</Formula>
            <p className="mb-prose-1 last:mb-0">
              Round down to the next stock size: a <strong className="text-text font-medium">40 A</strong> HACR-rated 2-pole breaker on 8 AWG
              copper wire. The breaker must be HACR-listed so its time-current curve tolerates the 95 A LRA
              inrush for the second or two of starting without
              tripping<Cite id="grainger-power-systems-2003" in={SOURCES} />. A standard non-HACR thermal-magnetic
              breaker at the same 40 A rating would nuisance-trip every time the compressor started.
            </p>
          </>
        }
      />

      <h2 className="chapter-h2">EV charging — level 1, level 2, level 3</h2>

      <p className="mb-prose-3">
        Electric-vehicle charging is the residential big-load story of the last decade, and it is the one place
        where the engineering of the receptacle on the wall has been redesigned essentially from scratch rather
        than inherited from a 1950s dryer outlet. The industry settled on three tiers of charging speed, each
        corresponding to a different supply voltage and a different protocol for negotiating safe energy flow
        between the vehicle and the building<Cite id="sae-j1772" in={SOURCES} />.
      </p>

      <h3 className="chapter-h3">Level 1: 120 V from a standard outlet</h3>

      <p className="mb-prose-3">
        The slowest tier and the universal fallback. A{' '}
        <Term def={<><strong className="text-text font-medium">level 1 charging</strong> — the slowest EV charging tier, using a standard 120 V North-American NEMA 5-15 or 5-20 receptacle. Typical continuous current 12 A on a 15 A circuit; charging power ~1.4 kW; range gained ~5 km per hour of charging. Universal because every house already has a 120 V outlet, but too slow for a daily commuter.</>}>level 1</Term>{' '}
        EV-charging cordset plugs into a standard 120 V NEMA 5-15 (15 A) or 5-20 (20 A) residential receptacle
        and pulls about <strong className="text-text font-medium">12 A continuous</strong> (the 80 % continuous-load limit of a 15 A circuit; see
        Chapter 29). That works out to roughly <strong className="text-text font-medium">1.4 kW</strong> of charging power and adds about
        <strong className="text-text font-medium"> 5 km of range per hour</strong> of charging — enough for an overnight top-up on a short
        commute, far too slow for a daily-driver EV with a depleted battery<Cite id="sae-j1772" in={SOURCES} />.
        The cordset is provided with the car; no permanent installation is needed.
      </p>

      <h3 className="chapter-h3">Level 2: 240 V dedicated branch</h3>

      <p className="mb-prose-3">
        The standard residential installation. A{' '}
        <Term def={<><strong className="text-text font-medium">level 2 charging</strong> — the standard residential and commercial EV charging tier, using a 240 V dedicated branch circuit. Typical continuous current 30 to 48 A; charging power 7.2 to 11.5 kW; range gained 30 to 60 km per hour. Connector is the SAE J1772 coupler in North America (or Tesla's NACS variant). Either plug-in via NEMA 14-50 or hardwired.</>}>level 2</Term>{' '}
        circuit is a 240 V dedicated branch — either a hardwired EVSE (Electric Vehicle Supply Equipment) or a
        plug-in EVSE on a NEMA 14-50 receptacle. The most common residential install is a 40 A breaker on 8 AWG
        copper feeding a 32 A continuous EVSE, giving <strong className="text-text font-medium">7.7 kW</strong> of charging power and adding
        roughly <strong className="text-text font-medium">30 km of range per hour</strong>. The high end of residential is a 60 A breaker on
        6 AWG feeding a 48 A continuous EVSE, giving 11.5 kW and 50 to 60 km per hour — fast enough that a
        100 kWh vehicle goes from empty to full overnight<Cite id="sae-j1772" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        The connector is the{' '}
        <Term def={<><strong className="text-text font-medium">SAE J1772</strong> — the SAE-standard AC charging coupler for North American electric vehicles. Five contacts: L1, L2 (for 240 V level 2; only L1 used for 120 V level 1), proximity detect, control pilot, and equipment ground. The control pilot is a PWM signal that lets the EVSE and the car negotiate available current before any high-voltage contacts close.</>}>SAE J1772</Term>{' '}
        coupler, a five-contact plug standardised in 2009: two AC line contacts (L1 and L2), one equipment-ground
        contact, one "proximity detect" pin that lets the car know the connector is fully seated, and one
        "control pilot" pin that carries a 1 kHz PWM signal from the EVSE to the car<Cite id="sae-j1772" in={SOURCES} />.
        The PWM duty cycle encodes the maximum current the EVSE is willing to deliver; the car reads the duty
        cycle, decides what fraction of that maximum it wants to draw, and only after the negotiation completes
        does the EVSE close its internal contactor to energise L1 and L2. The result is that no high-voltage
        contact ever sees a live conductor presented to open air — the contactor closes only when the plug is
        seated and the handshake has succeeded.
      </p>
      <p className="mb-prose-3">
        Safety on the EVSE side is double-belted. The EVSE includes its own internal ground-fault protection
        beyond whatever GFCI breaker is upstream — the relevant standard is{' '}
        <Term def={<><strong className="text-text font-medium">UL 2231</strong> — the Underwriters Laboratories safety standard for personnel-protection systems in electric-vehicle charging circuits. Requires the EVSE itself to incorporate a charge-circuit-interrupting device (CCID) that detects ground faults of 20 mA or more within 100 ms, in addition to any upstream GFCI breaker.</>}>UL 2231</Term>{' '}
        for the EV-side charge-circuit interrupting device (CCID)<Cite id="ul-2231" in={SOURCES} />. The CCID
        senses the EVSE's own residual current and trips internally at <strong className="text-text font-medium">20 mA in 100 ms</strong>, which
        is a different threshold from the 5 mA / 25 ms residential GFCI of Chapter 28; the EV-charging case
        has a higher trip threshold because the vehicle itself includes high-quality ground impedances and
        false trips from upstream GFCIs were once a common problem. NEC 625.22 has, since the 2017 cycle,
        required either a UL 2231-listed EVSE or a separate Class A GFCI breaker upstream — and increasingly
        both, depending on the jurisdiction's adoption cycle<Cite id="nec-2023" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        The energy that ends up in the battery on a level-2 charge is the supply power times the efficiency of
        the on-board charger inside the car:
      </p>
      <Formula>P_charge = V × I × η</Formula>
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">P_charge</strong> is the DC power delivered to the battery pack (in watts),{' '}
        <strong className="text-text font-medium">V</strong> is the AC supply voltage at the EVSE terminals (in volts; 240 V on level 2),{' '}
        <strong className="text-text font-medium">I</strong> is the RMS AC current the EVSE delivers (in amperes; up to 48 A continuous on a
        residential 60 A branch), and <strong className="text-text font-medium">η</strong> is the efficiency of the car's onboard AC-to-DC
        charger (typically <strong className="text-text font-medium">~0.90 to 0.92</strong> for a residential AC/DC charger; the difference is
        lost as heat in the charger's MOSFETs, transformer, and rectifier diodes)<Cite id="sae-j1772" in={SOURCES} />.
        For a 240 V × 48 A × 0.92 install, P_charge ≈ <strong className="text-text font-medium">10.6 kW</strong> ending up in the battery —
        roughly 0.9 kW lost as heat in the charger over a multi-hour session, dissipated through the car's
        cooling loop.
      </p>

      <h3 className="chapter-h3">Level 3: DC fast charging</h3>

      <p className="mb-prose-3">
        The level-3 tier is not residential and is mentioned here only because the receptacle and the connector
        on the car are different from level 2 — the architecture is fundamentally different.{' '}
        <Term def={<><strong className="text-text font-medium">Level 3 (DC fast) charging</strong> — high-power DC charging that bypasses the vehicle's onboard AC/DC charger entirely. Supply voltage 400 to 800 V DC, current up to several hundred amps, total power 50 to 350 kW or more. Connectors include CCS (Combined Charging System) in Europe and North America, CHAdeMO (legacy Japan), and Tesla's NACS. Not residential — requires a three-phase utility service and a substantial transformer.</>}>Level 3</Term>{' '}
        chargers bypass the car's internal charger entirely. They deliver high-voltage DC (typically 400 V or
        800 V) directly to the battery pack at currents up to several hundred amperes, for total power levels
        of <strong className="text-text font-medium">50 kW to 350 kW</strong><Cite id="iec-62196" in={SOURCES} />. The connector and protocol
        come in several families. The dominant standard in Europe and North America is{' '}
        <Term def={<><strong className="text-text font-medium">CCS</strong> (Combined Charging System) — the dominant DC fast-charging standard in Europe and North America. The connector combines the J1772 AC coupler (or its European Type-2 equivalent) with two additional high-power DC pins below, allowing one socket on the car to accept both AC level-2 and DC level-3. Standardised under IEC 62196.</>}>CCS (Combined Charging System)</Term>,
        a coupler that physically combines a J1772 (or its European Type-2 equivalent) with two additional
        DC-only pins, standardised under IEC 62196<Cite id="iec-62196" in={SOURCES} />. CHAdeMO is the legacy
        Japanese standard, on its way out in North America. Tesla's{' '}
        <Term def={<><strong className="text-text font-medium">NACS</strong> (North American Charging Standard) — Tesla's proprietary EV connector, opened and standardised as SAE J3400 in 2023. Combines AC and DC charging in a single smaller coupler. Adopted by Ford, GM, Rivian, and most other major North American manufacturers for 2025+ models.</>}>NACS (North American Charging Standard)</Term>{' '}
        connector, originally proprietary and opened to the industry in 2022, has been adopted by most major
        North-American manufacturers for 2025-and-later vehicles<Cite id="iec-62196" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        DC fast chargers are commercial installations: a three-phase utility service feeds a dedicated
        transformer, then a high-power AC-to-DC rectifier sized for 50 to 350 kW continuous, then the DC
        connector to the car. The footprint is the size of a small refrigerator at minimum and larger for
        higher-power units. A residential install at this power level is not practical — the panel and
        service-entrance cable required would exceed what most utility-side feeders can deliver to a single
        house — and even the largest residential EV charger today (an 80 A level-2 install on a 100 A
        feeder-fed dedicated subpanel, delivering 19.2 kW) is an order of magnitude below the lowest level-3
        commercial unit<Cite id="iec-62196" in={SOURCES} />.
      </p>

      <TryIt
        tag="Try 31.4"
        question={
          <>
            A level-2 EVSE delivers <strong className="text-text font-medium">11.5 kW</strong> of AC power to a car on a 240 V circuit. If the
            car's onboard charger is <strong className="text-text font-medium">92 % efficient</strong>, what AC current does the EVSE supply,
            and what DC power ends up in the battery?
          </>
        }
        hint="Compute supply current from P_AC = V × I; then DC power into the battery is P_charge = V × I × η."
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">The AC current the EVSE delivers comes directly from the AC supply power:</p>
            <Formula>I = P_AC / V = 11 500 / 240 ≈ <strong className="text-text font-medium">48 A</strong></Formula>
            <p className="mb-prose-1 last:mb-0">That is the continuous current on a 60 A branch circuit (the 80 % continuous-load rule of
            Ch.29). DC power into the battery:</p>
            <Formula>P_charge = V × I × η = 240 × 48 × 0.92 ≈ <strong className="text-text font-medium">10.6 kW</strong></Formula>
            <p className="mb-prose-1 last:mb-0">
              Roughly <strong className="text-text font-medium">0.9 kW</strong> is lost as heat inside the car's onboard AC/DC charger over the
              charging session, dissipated through the car's cooling loop<Cite id="sae-j1772" in={SOURCES} />.
              For a 100 kWh battery starting at 10 % and charging to 90 %, that adds about 7 kWh of waste heat
              over the full 7.5-hour charge — modest, but not zero.
            </p>
          </>
        }
      />

      <h2 className="chapter-h2">Demand-load calculations and panel sizing</h2>

      <p className="mb-prose-3">
        Add a new heat pump or a new EV charger to an existing house and the question is whether the existing
        service can absorb the new load or whether the whole service entrance needs an upgrade. NEC's answer
        is the{' '}
        <Term def={<><strong className="text-text font-medium">demand-load calculation</strong> — the NEC procedure (Article 220) for computing the total demand a building presents to its service, applying diversity factors that reflect the fact that not all loads run at peak simultaneously. The result is compared to the service rating to decide whether a panel can host a new load or needs an upgrade.</>}>demand-load calculation</Term>{' '}
        of Article 220, which sums all fixed and discretionary loads in the dwelling, applies{' '}
        <Term def={<><strong className="text-text font-medium">demand factor</strong> — a multiplier less than 1 applied to a portion of a building's connected load to reflect the statistical reality that not all loads operate at peak simultaneously. NEC tabulates demand factors for ranges (Table 220.55), dryers (220.54), and general lighting/receptacle load. Without demand factors a panel would have to be sized to the sum of every nameplate rating, which would dwarf the actual peak demand.</>}>demand factors</Term>{' '}
        (multipliers less than 1 reflecting the fact that not every load runs at peak simultaneously), and
        compares the result to the service rating<Cite id="nec-2023" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        Two methods exist for an existing dwelling. NEC 220.83 (the "existing-dwelling method") is the most
        commonly used: sum the dwelling's general lighting and receptacle load at <strong className="text-text font-medium">3 VA per square
        foot</strong>, add small-appliance and laundry branches at <strong className="text-text font-medium">1 500 VA each</strong>, add the
        nameplate of every fixed appliance, and apply a flat demand factor of <strong className="text-text font-medium">100 %</strong> on the
        first 8 kVA and <strong className="text-text font-medium">40 %</strong> on the remainder when no additional heating or cooling load is
        being added<Cite id="nec-2023" in={SOURCES} />. When new heating or cooling load is part of the
        calculation, the demand factor on the existing load shifts and additional rules in 220.82 (the
        "optional method") may apply. The result is a single load number in kVA, divided by the supply voltage
        to give the demand current in amperes, which is then compared to the service ampacity.
      </p>
      <p className="mb-prose-3">
        For a typical 200 A service the math usually works out generously: a 200 A panel at 240 V supports
        48 kVA of demand, and a fully-loaded 2 000 sq ft dwelling with a heat pump and an EV charger lands
        somewhere around 30 to 40 kVA on the demand calculation — comfortably under the limit. A 100 A panel
        at 240 V supports only 24 kVA of demand, and the same loaded dwelling fits much more
        tightly — sometimes within margin, sometimes not. The line at which a 100 A service starts to need
        upgrading is empirically around the addition of a level-2 EV charger plus electric resistance heat or
        a large heat pump<Cite id="nec-2023" in={SOURCES} />. Two simultaneous EV chargers on a 100 A service
        almost always require an upgrade; on a 200 A service they can usually be added with{' '}
        <Term def={<><strong className="text-text font-medium">EVEMS</strong> (electric-vehicle energy management system) — NEC 625.42 terminology for a load-management controller that limits one EV charger's output when another draw on the panel exceeds a threshold. Lets two chargers share a circuit (or share a panel) without requiring a service upgrade. Listed under UL 916.</>}>EVEMS</Term>{' '}
        load-management circuitry that limits one charger when the other is drawing<Cite id="nec-2023" in={SOURCES} />.
      </p>

      <TryIt
        tag="Try 31.5"
        question={
          <>
            A 200 A panel at 240 V has an existing demand-load calculation showing <strong className="text-text font-medium">130 A</strong> peak
            (typical for a fully-equipped house with a heat pump). The homeowner wants to add a 40 A circuit
            for a level-2 EV charger that draws <strong className="text-text font-medium">32 A continuous</strong> while charging. Does the
            panel have headroom under NEC 220.83?
          </>
        }
        hint="Continuous EV-charging load is treated at 125 % of the continuous current per NEC 625.42; compare the result added to the existing demand to the 200 A service rating."
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">NEC 625.42 treats the EV charger as a continuous load, sized at 125 % of nameplate
            continuous:</p>
            <Formula>I_EVSE = 1.25 × 32 = <strong className="text-text font-medium">40 A</strong></Formula>
            <p className="mb-prose-1 last:mb-0">Adding to the existing demand:</p>
            <Formula>I_total = 130 + 40 = <strong className="text-text font-medium">170 A</strong></Formula>
            <p className="mb-prose-1 last:mb-0">
              That is well under the 200 A service rating, so the panel can absorb the new circuit without an
              upgrade<Cite id="nec-2023" in={SOURCES} />. A second EV charger of the same size would land the
              total at 210 A, over the rating — at which point the choice is between a service upgrade and an
              EVEMS load-management installation that limits the two chargers' combined draw to under the
              panel's headroom.
            </p>
          </>
        }
      />

      <h2 className="chapter-h2">Putting it together</h2>

      <p className="mb-prose-3">
        The chapter's argument in three sentences. Every appliance in the house that pulls more than a couple
        of kilowatts wants the 240 V side of the panel, because doubling the supply voltage halves the supply
        current and quarters the wire loss. The supply for those appliances comes from both ends of the same
        centre-tapped secondary winding — the two hots are 180° apart, not separate phases — and the cable
        feeding the appliance carries either three or four conductors depending on whether the appliance has
        a 120 V subsystem inside it. The panel can host one or two of these big loads on a 100 A service or
        many on a 200 A service, with the demand-load calculation of NEC Article 220 telling you at the design
        stage whether the math works.
      </p>
      <p className="mb-prose-3">
        Next chapter turns from the big-load side of the panel to the safety side: GFCIs, AFCIs, arc-flash
        energy, the Dalziel current-through-heart curves, and the millisecond timing that distinguishes a
        startled jolt from cardiac arrest. The physics that protected the wire becomes the physics that
        protects the person.
      </p>

      <CaseStudies
        intro={
          <>
            Three working examples of big residential loads added to existing services. Each one runs the
            chapter's logic end-to-end: pick the load, pick the receptacle, do the demand-load calculation,
            decide whether the panel needs an upgrade.
          </>
        }
      >
        <CaseStudy
          tag="Case 31.1"
          title="A 1990s 100 A service hosts a new level-2 EV charger"
          summary="The canonical 'will my panel fit it' question for a small post-war or early-90s home."
          specs={[
            { label: 'Existing service', value: <>100 A, 240 V split-phase <Cite id="nec-2023" in={SOURCES} /></> },
            { label: 'Existing demand load (per NEC 220.83)', value: <>~78 A: lights, fridge, dishwasher, gas range, electric dryer, gas furnace <Cite id="nec-2023" in={SOURCES} /></> },
            { label: 'New EVSE', value: <>40 A continuous on a 50 A breaker, NEMA 14-50 plug-in <Cite id="sae-j1772" in={SOURCES} /></> },
            { label: 'New EVSE demand contribution (125 % of continuous)', value: <>50 A <Cite id="nec-2023" in={SOURCES} /></> },
            { label: 'Total demand with EVSE', value: <>128 A — over 100 A service rating <Cite id="nec-2023" in={SOURCES} /></> },
            { label: 'Required upgrade', value: <>service upsize to 200 A, or EVEMS limiting EVSE to ~22 A continuous <Cite id="nec-2023" in={SOURCES} /></> },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            A common 2020s renovation scenario: a 1990s single-family house with a 100 A panel, a gas-fired
            furnace, a gas range, and a gas dryer — light electrical loads by modern standards. The homeowner
            buys an electric vehicle and wants a level-2 EVSE in the garage at the largest residential rating
            the car supports: 40 A continuous on a 50 A circuit, NEMA 14-50 plug-in<Cite id="sae-j1772" in={SOURCES} />.
            Running the NEC 220.83 demand calculation on the existing house gives roughly 78 A; adding the
            EVSE at 125 % of 40 A (= 50 A) brings the total to 128 A — clearly over the 100 A service
            rating<Cite id="nec-2023" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            The homeowner has two options. Option one is a service upgrade: replace the meter base, the
            service-entrance cable, and the main panel with 200 A-rated equipment. The cost is in the
            neighbourhood of US $3 000 to $6 000 in most jurisdictions depending on whether the underground
            service drop needs to be re-pulled and whether the panel can be relocated in
            place<Cite id="nec-2023" in={SOURCES} />. Option two is to install an{' '}
            EVEMS (an electric-vehicle energy-management system, NEC 625.42 terminology) that monitors the
            panel's total demand and automatically throttles the EVSE down whenever the rest of the house is
            pulling heavily<Cite id="nec-2023" in={SOURCES} />. Set the EVEMS limit to 22 A continuous and the
            total demand peaks at 78 + 1.25 × 22 ≈ 105 A, just at the service rating. The car charges more
            slowly when the dishwasher and the dryer are both running, faster overnight when they aren't.
          </p>
          <p className="mb-prose-2 last:mb-0">
            The EVEMS path costs roughly one-tenth of the service upgrade and is increasingly the recommended
            approach for older 100 A services where the homeowner doesn't otherwise want to upgrade. NEC 625
            specifically permits it as an alternative to oversizing the
            service<Cite id="nec-2023" in={SOURCES} />.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 31.2"
          title="A cold-climate geothermal heat pump on a 200 A panel"
          summary="The biggest single residential mechanical load — a ground-source heat pump with auxiliary resistance heat."
          specs={[
            { label: 'Compressor', value: <>4-tonne ground-source heat pump, 6 kW running, FLA 25 A at 240 V <Cite id="grainger-power-systems-2003" in={SOURCES} /></> },
            { label: 'Auxiliary resistance', value: <>two 5 kW resistance-heat stages, 240 V, controlled by outdoor temperature <Cite id="nec-2023" in={SOURCES} /></> },
            { label: 'Air handler blower', value: <>~5 A continuous at 240 V <Cite id="nec-2023" in={SOURCES} /></> },
            { label: 'Total HVAC peak draw', value: <>~16 kW (67 A at 240 V) when both aux stages are active <Cite id="nec-2023" in={SOURCES} /></> },
            { label: 'Service rating', value: <>200 A, 240 V split-phase <Cite id="nec-2023" in={SOURCES} /></> },
            { label: 'Compressor breaker', value: <>50 A HACR-rated 2-pole on 8 AWG copper, sized to 2× FLA <Cite id="nec-2023" in={SOURCES} /></> },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            Cold-climate heat-pump installs are the biggest single mechanical load in a modern residential
            panel because the system carries both a compressor and electric-resistance auxiliary heat for the
            coldest days when the heat pump's capacity drops off. A 4-tonne ground-source unit with a 6 kW
            compressor input pulls 25 A continuous on a 240 V split-phase service at design heating
            conditions<Cite id="grainger-power-systems-2003" in={SOURCES} />. Add two 5 kW resistance stages
            (10 kW combined, drawing 42 A at 240 V) for backup, plus a 5 A air-handler blower, and the worst-case
            simultaneous draw is roughly 16 kW or 67 A on the HVAC side alone — a third of a 200 A service's
            entire capacity.
          </p>
          <p className="mb-prose-2 last:mb-0">
            The compressor breaker is sized by NEC Article 440: at 2× FLA (the typical HACR
            multiplier) the math works out to 50 A on 8 AWG copper, with a 50 A HACR-rated 2-pole
            breaker<Cite id="nec-2023" in={SOURCES} />. Each 5 kW resistance stage gets its own dedicated 30 A
            breaker on 10 AWG (because the resistive heater is a continuous load and the 125 % continuous-load
            rule applies — 5 000 W / 240 V × 1.25 ≈ 26 A, rounded up to 30 A). The air handler is a separate
            15 A or 20 A circuit at 240 V for the blower motor's FLA plus its own control board.
          </p>
          <p className="mb-prose-2 last:mb-0">
            Total demand-load calculation on a 2 200 sq ft home with this HVAC suite, plus the standard
            kitchen, laundry, dryer, range, and water heater, lands at roughly 140 A peak under NEC 220.82's
            optional method — well inside the 200 A service<Cite id="nec-2023" in={SOURCES} />. Add a level-2
            EV charger at 32 A continuous (40 A on the breaker, 40 A demand contribution) and the total climbs
            to 180 A, still inside the envelope. The 200 A service is the modern standard precisely because
            this load profile is the modern norm.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 31.3"
          title="Two EV chargers on a 200 A panel with load management"
          summary="Two-EV households are common in 2020s suburbs; the demand-load math is the constraint."
          specs={[
            { label: 'Service rating', value: <>200 A, 240 V split-phase <Cite id="nec-2023" in={SOURCES} /></> },
            { label: 'Existing demand (no EVs)', value: <>~120 A peak: heat pump, kitchen, electric water heater <Cite id="nec-2023" in={SOURCES} /></> },
            { label: 'EVSE A', value: <>48 A continuous on a 60 A breaker, hardwired <Cite id="sae-j1772" in={SOURCES} /></> },
            { label: 'EVSE B', value: <>48 A continuous on a 60 A breaker, hardwired <Cite id="sae-j1772" in={SOURCES} /></> },
            { label: 'Combined raw demand without EVEMS', value: <>120 + 1.25×48 + 1.25×48 = 240 A — over service <Cite id="nec-2023" in={SOURCES} /></> },
            { label: 'EVEMS strategy', value: <>combined EVSE limited to 48 A total when both plugged in; NEC 625.42 <Cite id="nec-2023" in={SOURCES} /></> },
            { label: 'EVEMS-limited total demand', value: <>120 + 1.25×48 = 180 A — inside service <Cite id="nec-2023" in={SOURCES} /></> },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            A two-EV household with two cars charging overnight is now the typical late-2020s suburban
            scenario, and the demand calculation gets tight even on a 200 A service. Two 48 A continuous
            EVSEs at full draw would each contribute 60 A to the demand (1.25 × 48), and combined with a
            typical 120 A existing residential demand the total reaches 240 A — over the service
            rating<Cite id="nec-2023" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            The solution under NEC 625.42 is an EVEMS controller wired across both EVSEs. When only one car
            is plugged in, that EVSE runs at its full 48 A and adds 60 A to the demand. When both are plugged
            in, the controller signals both EVSEs to throttle so their combined draw is capped at 48 A — half
            for each, in a simple 50/50 split, or biased dynamically based on each car's reported state of
            charge. The combined demand contribution drops to 1.25 × 48 = 60 A regardless of how many cars are
            plugged in, and the 200 A service has headroom for the rest of the
            house<Cite id="nec-2023" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            The trade-off is charging speed: each car takes twice as long to charge when both are plugged in
            simultaneously, but the household never plugs in two empty batteries at the same time — the cars'
            usage patterns are staggered, and most nights at least one of them is already mostly charged. The
            EVEMS strategy avoids a service upgrade while still delivering the full 11.5 kW charging rate
            whenever only one car is connected. Several vendors (Wallbox, ChargePoint, Tesla Wall Connector
            in pair mode) offer this as a stock feature; the listing requirement is UL 916 for the
            controller<Cite id="ul-2231" in={SOURCES} />.
          </p>
        </CaseStudy>
      </CaseStudies>

      <FAQ
        intro={
          <>
            Big-load circuits raise their own crop of questions, most of which come down to "why does this
            one need a neutral and that one doesn't?" The split between three-wire and four-wire feeds is the
            single source of most of the confusion.
          </>
        }
      >
        <FAQItem q="Why does a 240 V tankless water heater not need a neutral, but a 240 V dryer does?">
          <p>
            Because the tankless water heater is purely resistive — its entire load is a set of nichrome coils
            between L1 and L2, with no internal 120 V subsystem. The only auxiliary in the unit is a flow
            switch (a self-contained 240 V mechanical contactor) and there is no clock, no display, no
            tumble motor. A dryer, by contrast, has a 240 V heating element plus a 120 V drum-tumble motor
            and a 120 V control board, both of which run from one hot to neutral. Four wires versus
            three<Cite id="nec-2023" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Can I run a 240 V circuit using two separate 14-2 cables, one for each hot, with a shared neutral?">
          <p>
            That is a different configuration — a multi-wire branch circuit — and is regulated separately by
            NEC 210.4. Sharing a neutral across two breakers requires that both breakers be on{' '}
            <em className="italic text-text">opposite phases</em> (L1 and L2) and that they be handle-tied so they trip together. The
            shared neutral then carries only the imbalance current between the two hots, which on a 240 V
            symmetric load is zero. The cabling for a multi-wire branch is 12-3 or 14-3 with ground, not two
            separate 14-2s — the NEC requires the conductors to share a common
            jacket<Cite id="nec-2023" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What's a multi-wire branch circuit, and why is it dangerous to share a neutral across two unrelated 120 V circuits?">
          <p>
            A{' '}
            <Term def={<><strong className="text-text font-medium">multi-wire branch circuit</strong> — NEC 210.4 terminology for a circuit that uses one shared neutral between two ungrounded conductors of opposite phase. Reduces conductor count and neutral current, but the two breakers must be handle-tied so a maintenance worker cannot leave one hot energised while servicing the other.</>}>multi-wire branch circuit</Term>{' '}
            is a cable that carries two hots of opposite phase plus one shared neutral plus a ground. The
            neutral carries the imbalance current between the two hots — which is less than either hot's
            individual current — saving copper. The danger is the maintenance case: if the two breakers
            aren't handle-tied (NEC 210.4(B)) and the maintenance worker turns off only one breaker, the
            shared neutral is still carrying the other breaker's current; touching that neutral while
            working on the supposedly-dead leg connects the worker in series with the live
            load<Cite id="nec-2023" in={SOURCES} />. NEC requires the two breakers to trip together
            specifically to forestall this.
          </p>
        </FAQItem>

        <FAQItem q="Why is the NEMA 10-30 receptacle banned for new installations?">
          <p>
            The 10-30 used a single combined neutral / ground conductor — three prongs total instead of four —
            and the dryer cabinet was bonded internally to that combined conductor. If the conductor broke
            anywhere upstream (a corroded connection, a chewed cable), the cabinet was no longer bonded to
            anything; any 120 V leakage from the internal control circuit could then float the entire chassis
            up toward 120 V relative to a grounded floor. The 1996 NEC cycle required a separate ground pin
            (NEMA 14-30) for new installations specifically to prevent this failure
            mode<Cite id="nec-2023" in={SOURCES} />. Existing 10-30 installations in occupied homes are
            grandfathered.
          </p>
        </FAQItem>

        <FAQItem q="What does an 'HACR' rated breaker mean, and why do HVAC compressors need it?">
          <p>
            HACR stands for Heating-Air-Conditioning-Refrigeration, and it is a UL 489 listing designation
            indicating the breaker's time-current curve has been specifically tested and listed for use with
            HVAC induction-motor compressors<Cite id="nec-2023" in={SOURCES} />. The reason matters: an
            induction motor draws locked-rotor amperage (5 to 7× its full-load amperage) for the brief
            second it takes the rotor to come up to speed, and a standard thermal-magnetic breaker would
            trip on the magnetic-element side of its curve every time the compressor started. The HACR
            breaker's curve is shaped so the magnetic element ignores brief inrush currents up to the LRA
            level while still protecting the wire against sustained overload — exactly the trade-off motor
            circuits demand. NEC Article 440 requires HACR listing for hermetic compressor branch circuits.
          </p>
        </FAQItem>

        <FAQItem q="Why can't I plug a level-2 EV charger into a regular 120 V outlet?">
          <p>
            Two reasons. First, the level-2 EVSE is built to operate from 240 V and draws 30 to 48 A continuous
            — a 120 V circuit at 15 A simply does not have the current or voltage rating. Second, the SAE
            J1772 protocol communicates available current via a PWM signal on the control pilot pin, and the
            EVSE will refuse to close its contactor if the cable type and rated current don't match what its
            firmware expects<Cite id="sae-j1772" in={SOURCES} />. A level-1 charging cordset is the 120 V
            equivalent and is a separate piece of equipment, designed against the 12 A / 1.4 kW spec rather
            than the 32-48 A / 7-11 kW level-2 spec.
          </p>
        </FAQItem>

        <FAQItem q="Is the 'EVSE' the charger, or is the charger inside the car?">
          <p>
            The charger — the AC-to-DC converter that actually puts current into the battery — is inside the
            car. The{' '}
            <Term def={<><strong className="text-text font-medium">EVSE</strong> (electric-vehicle supply equipment) — the wall-mounted or portable device that delivers AC power to the vehicle through the J1772 (or NACS) coupler. Despite the colloquial name 'charger', the EVSE is just a protected high-current AC switch and a control-pilot signal generator; the actual AC-to-DC charger lives inside the car.</>}>EVSE</Term>{' '}
            (electric-vehicle supply equipment) is just a protected, monitored AC switch: it gates power from
            the wall to the car, monitors ground continuity and residual current, and sends the PWM
            control-pilot signal that tells the car how much current is available. The colloquial name
            "charger" sticks because it is the user-visible piece of hardware, but the actual charger is the
            AC-to-DC converter inside the car<Cite id="sae-j1772" in={SOURCES} />. Level-3 DC fast chargers
            invert the architecture: the high-power AC-to-DC conversion happens outside the car in the
            charging station, and the car receives raw DC.
          </p>
        </FAQItem>

        <FAQItem q="Why does the J1772 connector have a 'pilot signal' pin?">
          <p>
            The control-pilot pin carries a low-voltage 1 kHz PWM signal from the EVSE to the car
            whenever the connector is seated. The PWM duty cycle encodes the maximum current the EVSE is
            willing to deliver — for example, a 53 % duty cycle means "I can deliver up to 32 A; let me know
            how much you want." The car reads the duty cycle, pulls the pilot voltage down through a
            specific resistor to indicate "I am here and I want to charge," and only after the two-way
            handshake does the EVSE close its internal contactor to energise L1 and L2<Cite id="sae-j1772" in={SOURCES} />.
            The handshake protects against unplugging while energised and against connecting a
            non-EV load. There is no analogous protocol on a NEMA 14-50 dryer outlet — the J1772 control
            pilot is what makes EV charging a different category of receptacle.
          </p>
        </FAQItem>

        <FAQItem q="What's CCS, and how is it different from J1772?">
          <p>
            J1772 is the AC charging coupler for level 1 and level 2: five pins (two AC, one ground, two
            signalling) and a maximum power around 19 kW at residential ratings. CCS (Combined Charging
            System) physically extends J1772 with two additional high-power DC pins below the original five,
            allowing one socket on the car to accept both AC level-2 charging on the upper pins and DC
            level-3 charging on the lower pins<Cite id="iec-62196" in={SOURCES} />. CCS is standardised under
            IEC 62196 and SAE J1772 (the DC extension shares the J1772 numbering for historical reasons).
            Tesla's NACS connector achieves the same combined-AC-and-DC capability in a smaller single
            coupler.
          </p>
        </FAQItem>

        <FAQItem q="Why does NEC require an EV-charging EVSE to have its own ground-fault protection (UL 2231) even when the branch breaker is GFCI?">
          <p>
            Because the trip thresholds and trip times are different by design. A residential GFCI breaker
            trips at 5 mA in 25 ms (personnel protection, calibrated against the Dalziel current-through-heart
            curve). The UL 2231 charge-circuit interrupting device inside the EVSE trips at 20 mA in 100 ms
            — a more permissive threshold suited to the EV-charging case, where the car's onboard chassis
            grounds and high-quality earth-return paths legitimately produce a few mA of standing leakage
            current that would nuisance-trip a 5 mA personnel-protection
            GFCI<Cite id="ul-2231" in={SOURCES} />. NEC 625.22 reconciles the two: the EVSE must have its own
            UL 2231 CCID, and the upstream breaker may also be GFCI depending on jurisdiction and
            installation type<Cite id="nec-2023" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Can I run a heat pump on a 100 A panel?">
          <p>
            Usually yes, if the rest of the house's load profile is light. A 3-tonne air-source heat pump
            pulls about 21 A continuous at 240 V; with the 125 % continuous-load multiplier that contributes
            26 A to the demand-load calculation<Cite id="nec-2023" in={SOURCES} />. A 100 A service supports
            roughly 24 kVA of demand (100 A × 240 V); subtract the heat pump and there is 70-something A of
            headroom for everything else. The tight cases are 100 A services with both a heat pump and a
            level-2 EV charger, or with both a heat pump and electric resistance auxiliary heat — those
            usually require either an EVEMS load-management installation or a service upgrade to 200 A.
          </p>
        </FAQItem>

        <FAQItem q="What's the difference between a 'service' rating and a 'demand' calculation?">
          <p>
            The service rating is the continuous current the service-entrance equipment (cable, meter, main
            breaker) is mechanically and thermally sized for — 100 A, 150 A, or 200 A in residential
            settings<Cite id="nec-2023" in={SOURCES} />. The demand calculation is the NEC Article 220
            procedure for computing what the building's actual load is, applying diversity factors that
            reflect statistical non-coincidence of peak loads. The demand calculation result must be less
            than or equal to the service rating; if it isn't, the service must be upgraded. The service is
            the supply-side limit; the demand is the load-side request.
          </p>
        </FAQItem>

        <FAQItem q="How does a heat-pump dryer get away with a 120 V outlet when a resistive dryer needs 240 V?">
          <p>
            A{' '}
            <Term def={<><strong className="text-text font-medium">heat-pump dryer</strong> — a clothes dryer that uses a closed-loop refrigerant cycle (compressor, condenser, evaporator) to remove humidity from the drum air rather than discarding heated humid air through a vent. Total electrical input is roughly 1 kW versus 5 kW for a resistive dryer; many models run on a standard 120 V receptacle.</>}>heat-pump dryer</Term>{' '}
            uses a closed refrigerant loop and a small compressor to remove moisture from the drum air rather
            than dumping all that water vapour outside through a vent. The electrical input is about 1 kW
            (versus 5 kW for a resistive dryer) because most of the heat is being moved rather than generated,
            and a 1 kW continuous load fits comfortably on a standard 120 V NEMA 5-15 receptacle. The trade-off
            is cycle time — heat-pump dryers run an hour or more for a load that a resistive dryer finishes
            in 45 minutes — and the electrical-install simplicity is the major selling point, particularly
            in apartments without a NEMA 14-30 outlet available<Cite id="nec-2023" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why is the line-to-line voltage on a residential service 240 V instead of √3 × 120 ≈ 208 V?">
          <p>
            Because residential service is split-phase, not three-phase. The two hots come from opposite ends
            of a single centre-tapped secondary winding and are 180° apart, so their difference is twice
            either one's RMS value — 240 V. Commercial three-phase services do produce 208 V line-to-line
            from 120 V line-to-neutral, because there the three hots are 120° apart on the unit circle and
            the phasor difference is √3 × 120 ≈ 208 V<Cite id="grainger-power-systems-2003" in={SOURCES} />.
            A 240 V appliance plugged into a 208 V commercial service runs about 25 % under-powered (power
            scales as V²/R for a resistive load), which is why three-phase commercial buildings often have a
            separate single-phase 240 V transformer in the electrical room for appliances designed against
            the residential spec.
          </p>
        </FAQItem>

        <FAQItem q="Are the two breakers in a 'two-pole' 240 V breaker independent, or do they trip together?">
          <p>
            They are mechanically tied together by an internal crossbar so that a trip on either pole opens
            both. This is required by NEC and is the entire reason a two-pole breaker exists as a single
            device rather than as two adjacent single-pole breakers with a handle tie<Cite id="nec-2023" in={SOURCES} />.
            If only one pole opened on a fault, the appliance would still have one of its two hots energised
            — half the appliance's heating element would still be powered through the internal neutral
            connection, and the supposed-disconnect would be incomplete. The mechanical link guarantees that
            both L1 and L2 disconnect together on a fault, on a manual switch-off, or on any external trip
            signal.
          </p>
        </FAQItem>

        <FAQItem q="Why is every current and voltage on every label in this chapter ultimately a CODATA constant?">
          <p>
            Because every ampere is a count of elementary charges per second crossing a cross-section: a
            20 A current is 20 × (1 / 1.602176634×10⁻¹⁹) ≈ 1.25×10²⁰ electrons per second through the
            conductor<Cite id="codata-2018" in={SOURCES} />. Every voltage is, equivalently, joules of work
            per coulomb of charge moved. The 240 V on a NEMA 14-30 receptacle, the 32 A on a level-2 EVSE,
            the 95 A locked-rotor current on a heat pump: every one of these numbers ultimately reduces to
            a count of CODATA-defined elementary charges and a CODATA-defined energy per charge. The chapter
            could be written without ever mentioning the constants, but every label in the panel ultimately
            traces back to them.
          </p>
        </FAQItem>
      </FAQ>
    </ChapterShell>
  );
}
