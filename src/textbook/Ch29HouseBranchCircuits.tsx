/**
 * Chapter 29 — Branch circuits
 *
 * The applied-track sequel to Ch.3 (resistance and power) and Ch.28 (the panel).
 * A branch circuit is just a length of wire, and every NEC rule that governs it
 * is downstream of R = ρL/A and P = I²R applied to copper in a stud bay.
 *
 * Every numerical or historical claim cites a key from chapter.sources:
 *   nec-2023, nec-2017-aluminum, codata-2018, awg-table-nec, nfpa-70e-2024.
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

export default function Ch29HouseBranchCircuits() {
  const chapter = getChapter('house-branch-circuits')!;
  const SOURCES = chapter.sources;

  return (
    <ChapterShell chapter={chapter}>
      <p>
        Imagine a single circuit in a wood-framed house: a length of{' '}
        <Term def={<><strong>14 AWG</strong> — American Wire Gauge 14, a copper conductor with cross-section ≈ 2.08 mm². The standard residential wire for 15 A lighting and general-purpose receptacle circuits.</>}>14 AWG</Term>{' '}
        copper, three duplex receptacles wired in a daisy-chain, the whole run protected by a 15 A breaker in the panel.
        Twenty-four metres of cable threaded through stud bays, jacketed in the white or yellow vinyl sheath the trades
        call{' '}
        <Term def={<><strong>NM-B (Romex)</strong> — non-metallic-sheathed cable; the standard interior wire for residential framing. Two or three insulated conductors plus a bare ground inside a PVC jacket. The &ldquo;B&rdquo; designates 90 °C-rated insulation, though NEC sizes it to the 60 °C column for residential terminations.</>}>NM-B (Romex)</Term>.
        Plug a 1200 W space heater into the third outlet. Current draw at 120 V is{' '}
        <strong>10 A</strong>. Round-trip resistance through 48 m of 14 AWG copper is about{' '}
        <strong>0.41 Ω</strong>, so the wire dissipates roughly <strong>I²R ≈ 41 W</strong> along its length —
        spread out, it warms the cable a few degrees above the wood around it. Fine.
      </p>
      <p>
        Now plug a <em>second</em> 1200 W heater into one of the other receptacles on the same circuit. Total current
        climbs to about <strong>20 A</strong>. The 15 A breaker tolerates a brief overload but heats internally and
        trips within about thirty seconds — exactly as it is supposed to<Cite id="nec-2023" in={SOURCES} />. That single
        scenario contains the whole rest of this chapter: ampacity, gauge selection, breaker coordination, voltage drop,
        derating for heat, and why your kitchen has its own circuits.
      </p>

      <h2>Ampacity: how much current a wire can carry</h2>

      <p>
        Copper has a finite resistivity. Push current through it and you dissipate <em>I²R</em> as heat along the whole
        length. The thermal limit on a wire is not melting copper — copper melts at 1085 °C, which you will never see —
        it is the <strong>insulation</strong> around the copper softening, charring, or igniting. Residential NM-B
        cable has insulation rated to 90 °C internally, with NEC requiring sizing to the 60 °C column because the
        receptacle screws and breaker lugs at each end are typically only rated to 60 or 75 °C<Cite id="nec-2023" in={SOURCES} />.
        The <em>weakest</em> rated thermal point in the whole chain sets the budget.
      </p>
      <p>
        The thermodynamic balance for a wire in still air is roughly: heat generated per unit length equals heat carried
        away from the surface per unit length. The generation side is what Ch.3 already gave us:
      </p>
      <Formula>P/L = I² ρ / A</Formula>
      <p>
        where <strong>P/L</strong> is the power dissipated per metre of wire (in W/m), <strong>I</strong> is the current
        through the conductor (in amperes), <strong>ρ</strong> is the resistivity of copper (≈ 1.68×10⁻⁸ Ω·m at 20 °C)
        <Cite id="codata-2018" in={SOURCES} />, and <strong>A</strong> is the conductor's cross-sectional area (in m²).
        For a fixed maximum-allowable wire temperature, the cooling side scales roughly with the perimeter (i.e. √A),
        so the allowed current scales roughly with √A. Doubling the cross-section does <em>not</em> double the ampacity;
        it raises it by about <strong>√2</strong> for a fixed insulation rating.
      </p>
      <p>
        NEC{' '}
        <Term def={<><strong>Table 310.16</strong> — the NEC table of allowable ampacities for insulated conductors in raceway, cable, or earth, indexed by gauge and insulation temperature rating. The 60 °C column governs residential branch circuits with standard 15/20/30 A devices.</>}>Table 310.16</Term>{' '}
        does this trade-off empirically for every gauge, insulation type, and ambient
        condition<Cite id="awg-table-nec" in={SOURCES} />. The standard residential rungs of that ladder are short:
      </p>
      <ul>
        <li>
          <strong>14 AWG</strong> copper — cross-section <strong>2.08 mm²</strong>, rated <strong>15 A</strong>. The
          default for lighting circuits and general-purpose receptacles in bedrooms, hallways, and living
          rooms<Cite id="awg-table-nec" in={SOURCES} />.
        </li>
        <li>
          <strong>12 AWG</strong> — <strong>3.31 mm²</strong>, rated <strong>20 A</strong>. The required gauge for
          kitchen small-appliance circuits, bathrooms, laundry rooms, and garage
          receptacles<Cite id="nec-2023" in={SOURCES} />.
        </li>
        <li>
          <strong>10 AWG</strong> — <strong>5.26 mm²</strong>, rated <strong>30 A</strong>. Used for electric clothes
          dryers and tankless or smaller storage water heaters<Cite id="awg-table-nec" in={SOURCES} />.
        </li>
        <li>
          <strong>8 AWG</strong> — <strong>8.37 mm²</strong>, rated <strong>40 A</strong>. Electric ranges of modest
          size and 40 A level-2 EV chargers<Cite id="awg-table-nec" in={SOURCES} />.
        </li>
        <li>
          <strong>6 AWG</strong> — <strong>13.3 mm²</strong>, rated <strong>55 A</strong> in the 75 °C column (used at
          50 A for residential ranges), and the working gauge for full-size 50 A level-2 EV chargers and small
          sub-feeds<Cite id="awg-table-nec" in={SOURCES} />.
        </li>
      </ul>
      <p>
        Each step up the ladder doubles or so the cross-section and adds 5–10 A of headroom — exactly the
        diminishing-returns shape that √A predicts. The same table extends to 500 kcmil aluminium service entrances at
        the top end; everything in a residential branch circuit lives in the bottom six rungs.
      </p>

      <TryIt
        tag="Try 29.1"
        question={
          <>
            A <strong>12 AWG</strong> copper conductor (A = 3.31 mm²) is 25 m long and carries <strong>15 A</strong>.
            Compute the round-trip voltage drop. Is it acceptable for a 120 V circuit under the 3 % guideline?
          </>
        }
        hint="Use R = ρL/A with copper at ~75 °C resistivity ≈ 2.1×10⁻⁸ Ω·m, then double the length for round-trip, then ΔV = I·R."
        answer={
          <>
            <p>
              The round-trip path is 50 m of copper at warm operating temperature
              <Cite id="codata-2018" in={SOURCES} />:
            </p>
            <Formula>R = ρ·(2L)/A = 2.1×10⁻⁸ · 50 / 3.31×10⁻⁶ ≈ 0.317 Ω</Formula>
            <Formula>ΔV = I·R = 15 · 0.317 ≈ 4.76 V</Formula>
            <p>
              That is about <strong>4.0 %</strong> of 120 V — over NEC's 3 % branch-circuit recommendation
              <Cite id="nec-2023" in={SOURCES} />. The remedy is to drop the worst-case continuous load on this run or
              upsize to 10 AWG for the long pull. The breaker is still happy at 15 A on a 20 A breaker, but the
              receptacle at the far end sees noticeably less than 120 V.
            </p>
          </>
        }
      />

      <h2>Romex, THHN, and the cable taxonomy</h2>

      <p>
        Three insulation systems dominate residential and light-commercial wiring, and they are not
        interchangeable<Cite id="nec-2023" in={SOURCES} />.
      </p>
      <p>
        <strong>NM-B</strong> (the trade name Romex covers most variants) is{' '}
        <Term def={<><strong>NM cable</strong> — non-metallic-sheathed cable, governed by NEC Article 334. Two or three insulated copper conductors plus a bare equipment grounding conductor, wrapped in a PVC outer jacket. White jacket = 14 AWG, yellow = 12 AWG, orange = 10 AWG by industry convention.</>}>non-metallic-sheathed cable</Term>:
        two or three insulated conductors plus a bare{' '}
        <Term def={<><strong>equipment grounding conductor (EGC)</strong> — the bare or green conductor in a cable, bonded to metal enclosures and equipment frames. Provides a low-impedance fault path back to the panel so that ground faults trip the breaker.</>}>equipment grounding conductor</Term>,
        all wrapped in a PVC outer jacket. The conductors inside are individually insulated in THHN-style PVC rated to
        90 °C; the &ldquo;B&rdquo; in NM-B is the 90 °C internal rating that replaced the older 60 °C NM cable in
        1984<Cite id="nec-2023" in={SOURCES} />. Article 334 of the NEC covers it. NM-B is for dry, protected
        interior locations — inside stud bays, attics, joist spaces — and is the workhorse of residential framing.
      </p>
      <p>
        <strong>UF-B</strong> is the underground-feeder cousin:{' '}
        <Term def={<><strong>UF-B cable</strong> — Underground Feeder cable, NEC Article 340. Conductors are embedded in a solid PVC matrix (not just jacketed) so the cable can survive direct burial in earth. Used for outdoor branch circuits feeding a shed, a yard light, or a pump.</>}>UF-B cable</Term>{' '}
        has the same conductor count but with each conductor moulded into a solid PVC matrix rather than just jacketed,
        so the whole cable can be buried directly in earth at the depths Article 300.5 prescribes<Cite id="nec-2023" in={SOURCES} />.
        The jacket is grey. Article 340 governs it.
      </p>
      <p>
        <strong>THHN/THWN</strong> are individual conductors, not cables — single insulated wires pulled through
        conduit, with the four-letter code spelling out their insulation properties:{' '}
        <Term def={<><strong>THHN</strong> — Thermoplastic High Heat-resistant Nylon-coated. A 90 °C-rated single-conductor wire pulled through conduit. THWN adds Water-resistance for damp locations. The default conductor type for commercial and industrial wiring.</>}>THHN</Term>{' '}
        is Thermoplastic, High Heat-resistant, Nylon-coated; THWN adds Water resistance. The 90 °C rating in dry
        locations and 75 °C in wet conditions sits above what residential NM-B exposes you to, and is what's used in
        conduit runs through garages, basements, or any exposed
        application<Cite id="nec-2023" in={SOURCES} />. Article 310 covers conductor insulation types.
      </p>
      <p>
        The colour conventions are not legal requirements at the conductor level, but they are universal in practice.
        Hot conductors are black, red, or blue;{' '}
        <Term def={<><strong>neutral conductor</strong> — the grounded current-carrying conductor that returns load current to the source. Bonded to ground only at the service entrance. Always white or grey in branch wiring. Carries current; not the same as the ground.</>}>neutral</Term>{' '}
        is white or grey; equipment grounding is bare copper or green. NM-B's outer jacket colour signals gauge:
        white sheath = 14 AWG, yellow = 12 AWG, orange = 10 AWG. Builders read a panel by glancing at the colour of
        the jackets entering it.
      </p>

      <h2>Voltage drop on long runs</h2>

      <p>
        NEC sets ampacity to keep the wire's <em>insulation</em> from cooking, but a wire can be well within its
        thermal limit and still arrive at the load with a voltage too low to make appliances happy. That second
        constraint is{' '}
        <Term def={<><strong>voltage drop</strong> — the IR voltage difference between the panel and the load, caused by the resistance of the wires themselves. NEC recommends keeping branch-circuit drop under 3 % and total drop (feeder + branch) under 5 %. Informational notes only; not strictly enforced.</>}>voltage drop</Term>,
        and Article 215 of the NEC gives an informational note (i.e. a recommendation, not a hard
        rule) that the drop on a branch circuit should be no more than 3 % of nominal, with a total of 5 % including
        the feeder<Cite id="nec-2023" in={SOURCES} />. For 120 V circuits, 3 % is 3.6 V.
      </p>
      <p>
        The drop on a single-phase branch is the IR drop along the round-trip copper path:
      </p>
      <Formula>ΔV = 2 · I · R<sub>per metre</sub> · L</Formula>
      <p>
        where <strong>ΔV</strong> is the voltage lost in the wire from panel to load (in volts), the factor of{' '}
        <strong>2</strong> accounts for the round-trip path (hot out plus neutral back), <strong>I</strong> is the
        load current (in amperes), <strong>R<sub>per metre</sub></strong> is the wire's per-unit-length resistance at
        operating temperature (in Ω/m, tabulated in NEC Chapter 9 Table 8), and <strong>L</strong> is the one-way
        run length from the panel to the load (in metres). For 14 AWG copper at 75 °C, R<sub>per metre</sub> ≈{' '}
        <strong>8.45 mΩ/m</strong>; for 12 AWG, it is ≈ 5.31 mΩ/m; for 10 AWG, ≈ 3.34
        mΩ/m<Cite id="awg-table-nec" in={SOURCES} />.
      </p>
      <p>
        A worked example: a 14 AWG circuit, 30 m one-way, carrying 10 A. The drop is{' '}
        <strong>2 · 10 · 0.00845 · 30 ≈ 5.07 V</strong>, or about <strong>4.2 %</strong> of 120 V. That is past the
        3 % guideline. Going to 12 AWG on the same run: <strong>2 · 10 · 0.00531 · 30 ≈ 3.19 V</strong>, or 2.7 % —
        within budget. On long runs, upsizing the wire is the cheapest fix; on 240 V circuits, the same current
        drops only half the percentage because the denominator doubles. That is one quiet reason every modern{' '}
        <Term def={<><strong>dedicated circuit</strong> — a branch circuit serving one and only one piece of equipment, with no other receptacles or loads on it. Required by NEC for ranges, dryers, water heaters, EV chargers, and a few other major appliances.</>}>dedicated circuit</Term>{' '}
        for a big heat-pump or EV charger is 240 V, not 120 V.
      </p>

      <Pullout>
        Sizing a branch circuit is sizing the wire first, and only then the breaker — the wire is what's expensive
        to replace inside a wall.
      </Pullout>

      <TryIt
        tag="Try 29.2"
        question={
          <>
            A bedroom has a single 15 A circuit serving 4 ceiling lights (60 W each), a TV (90 W), and a desk
            computer (300 W). Compute the total continuous load. Does it fit the 80 % continuous-load rule?
          </>
        }
        hint="Total wattage at 120 V gives the current; the 80 % rule limits a 15 A circuit to 12 A of continuous load."
        answer={
          <>
            <p>Total power: 4·60 + 90 + 300 = <strong>630 W</strong>. Current at 120 V:</p>
            <Formula>I = P/V = 630 / 120 ≈ 5.25 A</Formula>
            <p>
              That is well under the 12 A continuous limit imposed on a 15 A breaker by the 80 %
              rule<Cite id="nec-2023" in={SOURCES} />. The circuit has roughly 7 A of headroom, which is exactly the
              point — bedrooms get a 15 A circuit because their loads are small and intermittent.
            </p>
          </>
        }
      />

      <h2>The breaker/wire pairing rule</h2>

      <p>
        The most important sentence in this chapter: <strong>the breaker rating must never exceed the wire's
        ampacity.</strong> A 20 A breaker behind 14 AWG wire is a fire waiting to happen<Cite id="nec-2023" in={SOURCES} />.
        At 18 A continuous, the breaker is happy — it is sized for 20 A and the trip curve is flat there. But the
        wire is rated 15 A and is dissipating about 30 % more I²R than its insulation budget allows. The vinyl jacket
        softens; if the cable is bundled with others in a stud bay or run through insulation, the heat does not
        escape and the failure compounds. After hours or days, the insulation chars; eventually the conductor shorts
        to a staple, a nail, or the adjacent neutral, drawing real fault current. The breaker now trips, but the
        damage is done.
      </p>
      <p>
        The pairing rule goes one direction only. A 15 A breaker behind 12 AWG wire is fine — wasted copper, but
        perfectly safe; the breaker protects the wire even though the wire could carry more. A 30 A breaker behind
        12 AWG is illegal under NEC Article 240, because the wire's ampacity is 20 A and the breaker can hold 25 A
        indefinitely without tripping<Cite id="nec-2023" in={SOURCES} />.
      </p>
      <p>
        Article 240.4(D) lists the maximum breaker rating for each small gauge as a footnote, calling it{' '}
        <em>small-conductor protection</em>: 14 AWG copper is fixed to 15 A regardless of any ampacity table that
        might say otherwise, 12 AWG to 20 A, 10 AWG to 30 A<Cite id="nec-2023" in={SOURCES} />. The intent is to
        forestall exactly the failure mode just described. Article 240 in general is the section every electrician
        memorises before anything else.
      </p>
      <p>
        Wire that already <em>feels</em> warm to the touch under load is sending you a message. Receptacle screws
        that have darkened or browned around the connection have been running hot. NEC's hard limits are the floor;
        a thoughtful install adds margin.
      </p>

      <TryIt
        tag="Try 29.3"
        question={
          <>
            A homeowner finds <strong>14 AWG NM-B</strong> connected to a <strong>20 A breaker</strong> in their
            panel. What is the failure mode, and what is the fix?
          </>
        }
        hint="Look up 14 AWG's ampacity in the standard residential table and compare to the breaker rating."
        answer={
          <>
            <p>
              14 AWG copper is rated <strong>15 A</strong> by NEC Article 240.4(D)
              <Cite id="awg-table-nec" in={SOURCES} />. A 20 A breaker can hold up to ~25 A indefinitely without
              tripping, so the wire can dissipate ~I²R well past its insulation rating before the breaker
              intervenes. The insulation softens, eventually the conductor shorts.
            </p>
            <p>
              Fix: swap the 20 A breaker for a 15 A breaker (cheap and immediate), or — if the loads on the circuit
              really do need 20 A — pull new 12 AWG wire and keep the 20 A breaker. <em>Never</em> the other way
              around<Cite id="nec-2023" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2>Aluminium and the old aluminium scare</h2>

      <p>
        Copper is the default for branch circuits, but{' '}
        <Term def={<><strong>aluminium</strong> conductors — used widely for service-entrance feeders and large sub-feeds because aluminium is roughly 30 % cheaper than copper for the same ampacity. The modern AA-8000 series alloy is well-behaved when terminated with antioxidant compound and AL-rated lugs. Older solid-aluminium branch wiring (1965–1973) is the source of a still-active fire-risk advisory.</>}>aluminium</Term>{' '}
        is common at every gauge above about 6 AWG. The service-entrance feeders coming from a pole-top transformer
        into a meter base are almost always 4/0 AWG aluminium triplex; the feed from the meter base into a 200 A panel
        is often 2/0 aluminium SER. The reason is price — aluminium is roughly 30 % cheaper for the same ampacity at
        equivalent gauge<Cite id="nec-2017-aluminum" in={SOURCES} />.
      </p>
      <p>
        That sentence has a notorious asterisk. Between roughly <strong>1965 and 1973</strong>, copper prices spiked
        and millions of U.S. houses were wired with solid-aluminium 15 A and 20 A branch circuits — the small-gauge
        residential stuff, not just the big feeders. By the late 1970s, those circuits were burning down houses at a
        rate the Consumer Product Safety Commission could measure<Cite id="nec-2017-aluminum" in={SOURCES} />.
        The failure was not in the bulk metal but at the screw terminations on receptacles and switches.
      </p>
      <p>
        Three things went wrong at once. Aluminium forms a hard, electrically insulating oxide skin the instant it
        sees air; copper does too, but copper oxide is conductive enough to live with. Aluminium's coefficient of
        thermal expansion is about 23 ppm/K — almost double brass's 19 ppm/K — so a screw terminal heated and cooled
        through every load cycle worked itself looser over months and years. And aluminium <em>creeps</em>: under
        sustained compressive load it deforms plastically and the joint slowly relaxes. The result was a connection
        that started tight, loosened over time, the oxide grew across the loosened gap, the contact resistance
        climbed, the I²R at the joint heated it further, and a runaway thermal failure took the receptacle
        out — or worse, the studs behind it<Cite id="nec-2017-aluminum" in={SOURCES} />.
      </p>
      <p>
        The fix that emerged in the late 1970s was{' '}
        <Term def={<><strong>CO/ALR</strong> — Copper / Aluminium Revised, the UL-listing designation for switches and receptacles certified safe for direct connection to solid aluminium wire. The CO/ALR receptacle screw uses a specific clamping geometry and corrosion-resistant plating that holds the joint tight through thermal cycling.</>}>CO/ALR</Term>-rated
        devices: switches and receptacles with screw terminations specifically engineered for aluminium's thermal and
        creep behaviour, certified by UL with the CO/ALR mark<Cite id="nec-2017-aluminum" in={SOURCES} />. Modern
        practice for legacy aluminium branch circuits is either to replace all the devices with CO/ALR, or to pigtail
        every connection: a short copper tail spliced to the aluminium with a specifically-rated connector (typically
        an AlumiConn or Ideal Twister Al/Cu) and an antioxidant compound, with the device then landed on the copper.
      </p>
      <p>
        Modern aluminium service entrances are well-behaved precisely because the failure mode was learned. The
        present-day alloy is AA-8000 series, which is more ductile and less prone to creep than the original 1350
        utility-grade aluminium of the 1960s; lugs are antioxidant-pasted at termination; the gauge is large enough
        that the per-joint power dissipation is small. The aluminium feeder coming into your house is fine. The
        aluminium branch in an old kitchen is the thing to check.
      </p>

      <h2>Why the kitchen gets two 20 A circuits</h2>

      <p>
        NEC Article 210.11(C) requires that every dwelling kitchen be served by <em>at least two</em>{' '}
        <Term def={<><strong>small-appliance branch circuit</strong> — NEC Article 210.11(C)(1): a 20 A branch circuit dedicated to receptacles in the kitchen, dining area, pantry, and breakfast room. A dwelling unit must have at least two of these.</>}>small-appliance branch circuits</Term>,
        each a 20 A circuit on 12 AWG, dedicated to the receptacles in the kitchen, dining area, pantry, and breakfast
        room<Cite id="nec-2023" in={SOURCES} />. The countertop receptacle requirement of 210.52(C) — every wall
        space 600 mm or wider gets a receptacle within 600 mm of any point along the counter — distributes those
        circuits across the room so that no two adjacent receptacles share a single breaker.
      </p>
      <p>
        The arithmetic justifies the rule. Kitchen loads are intermittent but punishing: a typical toaster pulls
        ~1100 W, a microwave 1200 W, a coffee maker 1100 W, an electric kettle 1500 W. Any two of those run
        simultaneously on a single 15 A (1800 W) circuit will trip the breaker; even on a 20 A (2400 W) circuit, the
        margin is thin. Two 20 A circuits give the kitchen 4800 W of total budget, and the redundancy means a tripped
        breaker on one circuit does not dark out the whole room.
      </p>
      <p>
        Article 210.11(C)(2) adds a dedicated 20 A laundry-room circuit; 210.11(C)(3) adds a dedicated 20 A
        bathroom-receptacle circuit (one shared circuit can serve all bathrooms, or each bathroom can have its own
        — both are NEC-legal)<Cite id="nec-2023" in={SOURCES} />. Garages and unfinished basements similarly require
        a dedicated 20 A circuit with{' '}
        <Term def={<><strong>GFCI</strong> — Ground-Fault Circuit Interrupter; a device that trips when the current in the hot does not match the current returning on the neutral, indicating leakage to ground (often through a person). Trip threshold is 5 mA with a 25 ms response. Required at every wet-area and outdoor receptacle.</>}>GFCI</Term>{' '}
        protection per Article 210.8.
      </p>
      <p>
        The pattern across all of these is the same: zones with predictable concentrations of high-power intermittent
        loads get their own 20 A circuit, sized for plausible double-appliance use. The 80 % continuous-load rule of
        the next section then guarantees a working margin on top.
      </p>

      <TryIt
        tag="Try 29.4"
        question={
          <>
            A kitchen has a <strong>1500 W</strong> toaster oven, a <strong>1100 W</strong> microwave, and a
            <strong> 900 W</strong> coffee maker. Can all three run simultaneously on a single 20 A
            small-appliance branch?
          </>
        }
        hint="Total wattage / 120 V gives the current. Compare to 20 A and to the 80 % continuous rule, noting whether the loads are continuous."
        answer={
          <>
            <p>Total: 1500 + 1100 + 900 = <strong>3500 W</strong>. At 120 V:</p>
            <Formula>I = 3500 / 120 ≈ 29.2 A</Formula>
            <p>
              That is well over the 20 A rating of the circuit. The breaker will trip in seconds. The fix is to
              distribute the three appliances across the kitchen's two 20 A small-appliance branches — which is
              exactly why NEC requires two of them<Cite id="nec-2023" in={SOURCES} />. Even a 30 A circuit (which
              would itself violate the 80 % rule under continuous use) would be a poor solution; the receptacles
              you'd plug into wouldn't be rated for it.
            </p>
          </>
        }
      />

      <h2>Continuous loads and the 80 % rule</h2>

      <p>
        NEC Article 100 defines a{' '}
        <Term def={<><strong>continuous load</strong> — a load expected to operate at maximum current for three hours or more. EV chargers, dehumidifiers, lighting in commercial spaces, and electric baseboard heaters are typical continuous loads. NEC Article 210.20(A) requires the circuit rating to be at least 125 % of the continuous load.</>}>continuous load</Term>{' '}
        as one expected to operate at its maximum current for <strong>three hours or more</strong>. For continuous
        loads, Article 210.20(A) requires the branch-circuit overcurrent protection to be sized at no less than{' '}
        <strong>125 %</strong> of the continuous load<Cite id="nec-2023" in={SOURCES} />. Stated as a constraint on
        the load rather than the breaker: you can continuously load a circuit to no more than{' '}
        <strong>80 %</strong> of its breaker rating, because 1 / 1.25 = 0.80.
      </p>
      <p>
        The 80 % rule is what turns a 15 A breaker into a 12 A continuous budget, a 20 A breaker into 16 A, a 30 A
        into 24 A, and a 50 A into 40 A. In residential settings, this matters most for two specific loads: electric
        baseboard heaters, which can run for hours at full draw on a winter night, and EV chargers, which routinely
        charge for six or eight hours at the maximum current the EVSE has negotiated.
      </p>
      <p>
        EV chargers are the canonical residential 80 %-rule example, because the math comes out exactly to
        engineering-relevant numbers. A level-2 EVSE rated to charge at <strong>32 A continuous</strong> requires
        the circuit be rated at no less than 32 / 0.80 = <strong>40 A</strong>. A 40 A circuit on 8 AWG copper is
        the resulting install. Step up to a 48 A EVSE — the largest that fits without going to a 14-50 receptacle
        — and you need a 60 A circuit on 6 AWG. Step up again to a 50 A continuous charger (rare in residential) and
        you need a 63 A circuit, which doesn't exist as a stock size, so the answer is 80 A. Every step up the EVSE
        ladder corresponds to a step up the wire ladder, mediated by the 80 %
        rule<Cite id="nec-2023" in={SOURCES} />.
      </p>
      <p>
        Outside continuous loads, the 80 % rule does not strictly apply — a 20 A circuit handling intermittent
        appliances can be loaded to a full 20 A in short bursts. But it is a useful design margin even there.
        NFPA 70E's task-energy framework for working on energised circuits builds in similar safety
        derating throughout<Cite id="nfpa-70e-2024" in={SOURCES} />.
      </p>

      <TryIt
        tag="Try 29.5"
        question={
          <>
            A <strong>50 A continuous</strong> level-2 EV charger is to be installed at the end of a <strong>12
            m</strong> run from the panel. What gauge copper is required, and what is the actual round-trip
            voltage drop on that wire at full charge?
          </>
        }
        hint="Apply the 80 % rule to find the breaker rating, then NEC Table 310.16 to find the gauge, then ΔV = 2·I·R_per-m·L."
        answer={
          <>
            <p>
              50 A continuous / 0.80 = <strong>62.5 A</strong> minimum breaker rating; round up to the next stock
              size, <strong>70 A</strong><Cite id="nec-2023" in={SOURCES} />. The wire ampacity must be at least
              70 A; in the 75 °C column that is <strong>4 AWG</strong> copper at 85 A
              <Cite id="awg-table-nec" in={SOURCES} />.
            </p>
            <p>
              4 AWG copper has R<sub>per metre</sub> ≈ 0.83 mΩ/m at 75 °C. Round-trip drop at 50 A across 12 m:
            </p>
            <Formula>ΔV = 2 · 50 · 0.00083 · 12 ≈ 1.0 V</Formula>
            <p>
              On a 240 V circuit that is <strong>0.4 %</strong> — well inside the 3 % branch guideline. The wire
              size is set by the 80 % rule and the breaker, not by the voltage drop on this short a run.
            </p>
          </>
        }
      />

      <h2>Putting it together</h2>

      <p>
        Every branch circuit in the house is the same five decisions made together: pick the load, pick the breaker
        size that protects the wire, pick the wire gauge that the breaker permits, check the voltage drop over the
        actual run length, and check that any continuous portion of the load is within 80 % of the breaker. Each
        choice constrains the others. Choose the wire too thin and the breaker becomes a fire hazard; choose the
        breaker too small and the load nuisance-trips it; choose the run too long for the gauge and the appliances
        at the far end run slow and warm.
      </p>
      <p>
        The next chapter zooms in from the cable in the wall to the receptacle the cable lands at — switches,
        outlets, the three-way puzzle, and the NEMA configurations that distinguish a 15 A general-purpose outlet
        from a 50 A range receptacle. Same physics, smaller scale.
      </p>

      <CaseStudies
        intro={
          <>
            Three working examples that pull together the gauge / breaker / length / load coordination of a
            real residential install.
          </>
        }
      >
        <CaseStudy
          tag="Case 29.1"
          title="A 1960s 100 A panel meets a modern load profile"
          summary="100 A service designed for 1960s lights and outlets vs. today's EV plus heat pump."
          specs={[
            { label: 'Original service rating', value: <>100 A, 240 V split-phase <Cite id="nec-2023" in={SOURCES} /></> },
            { label: 'Original branch wiring', value: <>14 AWG copper throughout (15 A breakers) <Cite id="awg-table-nec" in={SOURCES} /></> },
            { label: 'Original load (1965)', value: <>~5 kW peak: lights, fridge, TV, vacuum <Cite id="nec-2023" in={SOURCES} /></> },
            { label: 'Modern load with EV + heat pump', value: <>~18 kW peak <Cite id="nec-2023" in={SOURCES} /></> },
            { label: 'Required service upgrade', value: <>200 A panel, 4/0 Al SER feed <Cite id="nec-2017-aluminum" in={SOURCES} /></> },
          ]}
        >
          <p>
            A common renovation scenario: a small post-war house with the original 100 A panel, every branch run
            in 14 AWG, and a load profile from when &ldquo;heavy appliances&rdquo; meant a vacuum cleaner. The
            homeowner now wants a level-2 EV charger (40 A continuous on a 50 A circuit) and a 3-tonne ducted heat
            pump (drawing ~20 A continuous at 240 V). Each of those alone is roughly half the panel's total
            capacity<Cite id="nec-2023" in={SOURCES} />.
          </p>
          <p>
            Doing the load calc by NEC Article 220 shows the existing 100 A service is now undersized by something
            like 20 %. The upgrade path is a 200 A meter base and panel, a new 4/0 aluminium SER service-entrance
            cable from the meter, and the two new circuits — 8 AWG copper to the EVSE, 10 AWG copper to the heat
            pump's air handler<Cite id="awg-table-nec" in={SOURCES} />. The existing 14 AWG branches stay; they
            are still correctly paired with 15 A breakers and are doing exactly the job they were sized for
            sixty years ago<Cite id="nec-2017-aluminum" in={SOURCES} />.
          </p>
          <p>
            Worth noting: the new 4/0 aluminium feeder is in the right place. Aluminium scares are about branch
            wiring in receptacle terminations, not about service feeders<Cite id="nec-2017-aluminum" in={SOURCES} />.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 29.2"
          title="The standard 2000 sq ft house circuit list"
          summary="What the NEC minimums actually look like, expressed as a panel directory."
          specs={[
            { label: 'Service', value: <>200 A, 240 V split-phase <Cite id="nec-2023" in={SOURCES} /></> },
            { label: 'Kitchen small-appliance', value: <>2 × 20 A on 12 AWG (210.11(C)(1)) <Cite id="nec-2023" in={SOURCES} /></> },
            { label: 'Laundry', value: <>1 × 20 A on 12 AWG (210.11(C)(2)) <Cite id="nec-2023" in={SOURCES} /></> },
            { label: 'Bathrooms', value: <>1 × 20 A GFCI on 12 AWG (210.11(C)(3)) <Cite id="nec-2023" in={SOURCES} /></> },
            { label: 'Bedrooms', value: <>15 A AFCI on 14 AWG (210.12) <Cite id="nec-2023" in={SOURCES} /></> },
            { label: 'Range', value: <>50 A on 6 AWG (NEMA 14-50) <Cite id="awg-table-nec" in={SOURCES} /></> },
            { label: 'Dryer', value: <>30 A on 10 AWG (NEMA 14-30) <Cite id="awg-table-nec" in={SOURCES} /></> },
            { label: 'Garage', value: <>20 A GFCI on 12 AWG <Cite id="nec-2023" in={SOURCES} /></> },
          ]}
        >
          <p>
            A modern 2000 sq ft single-family build has roughly two dozen branch circuits in a 200 A panel. The
            kitchen takes two 20 A small-appliance circuits as required, plus dedicated circuits for the
            dishwasher (15 A), the disposal (15 A), and the refrigerator (15 A or 20 A depending on the
            specifier)<Cite id="nec-2023" in={SOURCES} />. The laundry room gets one dedicated 20 A general-purpose
            and a separate 30 A on 10 AWG for the dryer.
          </p>
          <p>
            Bedrooms get 15 A circuits with{' '}
            <Term def={<><strong>AFCI</strong> — Arc-Fault Circuit Interrupter; a breaker that listens for the high-frequency current signature of an arcing fault (a staple piercing a cable, a damaged extension cord) and trips before the arc ignites surrounding combustibles. Required by NEC 210.12 in bedrooms, living rooms, hallways, and most habitable spaces of new dwellings.</>}>AFCI</Term>{' '}
            protection on the breaker, per NEC 210.12; that requirement now covers nearly all habitable rooms in a
            new dwelling<Cite id="nec-2023" in={SOURCES} />. Bathrooms, garages, outdoor receptacles, basements,
            and any wet area get GFCI protection per 210.8.
          </p>
          <p>
            The big appliances: a 50 A circuit on 6 AWG to a NEMA 14-50 range receptacle, a 30 A circuit on 10 AWG
            to a NEMA 14-30 dryer outlet, and increasingly a third 50 A circuit on 6 AWG to a NEMA 14-50 in the
            garage for level-2 EV charging<Cite id="awg-table-nec" in={SOURCES} />. HVAC is a separate fused
            disconnect; water heater, if electric, is its own 30 A or 40 A circuit. The panel directory of a
            modern house is half intermittent receptacle loads and half dedicated big appliances.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 29.3"
          title="A 30 m basement run to a 240 V welder"
          summary="When voltage drop, not ampacity, drives the wire gauge."
          specs={[
            { label: 'Welder load', value: <>25 A intermittent at 240 V <Cite id="nec-2023" in={SOURCES} /></> },
            { label: 'One-way run length', value: <>30 m (panel to far end of basement workshop) <Cite id="codata-2018" in={SOURCES} /></> },
            { label: 'Minimum gauge by ampacity', value: <>10 AWG (30 A rated, 75 °C column) <Cite id="awg-table-nec" in={SOURCES} /></> },
            { label: 'Gauge selected for &lt;3 % drop', value: <>8 AWG copper, ΔV ≈ 3.1 V (1.3 %) <Cite id="nec-2023" in={SOURCES} /></> },
          ]}
        >
          <p>
            A homeowner runs a 240 V stick welder rated 25 A intermittent at the far end of a basement workshop, 30 m
            of cable run from the panel. By ampacity alone, 10 AWG copper at 30 A is the right gauge for a 30 A
            breaker<Cite id="awg-table-nec" in={SOURCES} />. But the round-trip voltage drop check is
            sobering: 10 AWG has R<sub>per metre</sub> ≈ 3.34 mΩ/m at 75 °C, so
          </p>
          <Formula>ΔV = 2 · 25 · 0.00334 · 30 ≈ 5.0 V</Formula>
          <p>
            That is <strong>2.1 %</strong> of 240 V — within the 3 % branch guideline, just barely. On a welder
            that already pulses heavily on each strike, the additional voltage sag from the wire is enough to make
            the arc unstable. Stepping up to <strong>8 AWG</strong> (R<sub>per metre</sub> ≈ 2.10 mΩ/m) drops the
            same calculation to about <strong>3.1 V</strong>, or 1.3 % — well inside the
            guideline<Cite id="nec-2023" in={SOURCES} />. The breaker stays at 30 A; the wire is upsized
            specifically for the drop, not the ampacity. This is the canonical example of voltage drop, not
            thermal limit, driving gauge selection on a long run.
          </p>
        </CaseStudy>
      </CaseStudies>

      <FAQ
        intro={
          <>
            Branch-circuit rules are dense, but every one of them traces back to the wire's <em>I²R</em> and the
            sequence in which the breaker, the wire, and the insulation reach their respective limits. These are
            the questions that come up the first time you open a panel.
          </>
        }
      >
        <FAQItem q="Why does NEC use the 60 °C column for residential receptacles even when the wire is 90 °C insulated?">
          <p>
            The wire is rated to 90 °C internally, but the screw terminals on standard residential receptacles and
            most stock breakers are only listed to 60 °C — and a couple of bigger devices to 75 °C
            <Cite id="nec-2023" in={SOURCES} />. The weakest thermal link in the chain sets the ampacity. NEC
            110.14(C) requires that the conductor be sized at the rating of the lowest-rated termination in the
            run. If you used the wire's 90 °C ampacity, the conductor itself would be fine but the joint at the
            receptacle screw would creep into thermal trouble.
          </p>
        </FAQItem>

        <FAQItem q="Can I daisy-chain receptacles indefinitely on the same branch?">
          <p>
            NEC does not put a hard cap on receptacle count per general-purpose branch in a dwelling — Article 220
            assumes a statistical load of 180 VA per duplex for non-dwelling calcs, but in residential settings
            the load calculation is by square footage rather than receptacle count<Cite id="nec-2023" in={SOURCES} />.
            In practice, builders cap a 15 A bedroom circuit at maybe a dozen receptacles plus the lights, and a
            20 A circuit at fewer because the per-receptacle expected load is higher. The real limit is voltage
            drop on the daisy-chained loop and reliability of the wire-nut splices in each box, not the
            receptacle count itself.
          </p>
        </FAQItem>

        <FAQItem q="Why does my wire feel warm but my breaker hasn't tripped?">
          <p>
            Breakers protect against currents <em>above</em> their rating. A wire run within rating still
            dissipates I²R as heat — a 14 AWG run at 12 A continuous puts about ~1.2 W per metre into the
            insulation, more than a hand can detect at the surface. The breaker is doing its job; the wire is
            also doing its job; the warmth is the design point<Cite id="nec-2023" in={SOURCES} />. What you do
            not want is a <em>hot spot</em>: a single warm receptacle or junction box surrounded by a cool cable
            run usually means a loose connection developing contact resistance, and that is a fire risk in
            progress.
          </p>
        </FAQItem>

        <FAQItem q="What's the difference between 14 AWG stranded and 14 AWG solid for branch wiring?">
          <p>
            Inside NM-B cable, the conductors are solid copper — easier to terminate at screw terminals, slightly
            higher per-meter ampacity at the same nominal cross-section because of skin-effect considerations
            (negligible at 60 Hz, but the standard accounts for it)<Cite id="awg-table-nec" in={SOURCES} />.
            Stranded copper of the same gauge has marginally more electrical loss but vastly better flex life,
            and is used inside conduit (THHN), in flexible cords (SO/SOOW), and in any application where the
            cable will move. Solid for stud bays; stranded for raceways and cords.
          </p>
        </FAQItem>

        <FAQItem q="Why are aluminium feeders OK but aluminium branch wiring is fire-prone?">
          <p>
            The failure mode is at the terminations, not in the bulk metal. Service-entrance feeders are large
            gauge — 4/0 AWG aluminium for 200 A service — terminated in heavy lugs designed for aluminium, with
            antioxidant paste applied and torqued to spec. The per-joint power dissipation is small relative to
            the conductor's thermal mass<Cite id="nec-2017-aluminum" in={SOURCES} />. Small-gauge branch
            wiring (12/14 AWG aluminium of the 1965–1973 era) was terminated on standard brass receptacle
            screws never designed for aluminium's creep and oxide-growth behaviour, with the result that joints
            loosened over months, contact resistance grew, and I²R at the joint compounded the failure. CO/ALR
            devices and antioxidant compound retroactively fix the small-gauge case.
          </p>
        </FAQItem>

        <FAQItem q="Can I use a 12-2 cable for a 240 V circuit by using the white wire as a second hot?">
          <p>
            Conditionally yes, and the rules are strict<Cite id="nec-2023" in={SOURCES} />. NEC 200.7(C)(1)
            allows the white insulated conductor in a multi-conductor cable to be re-identified as a hot if and
            only if it is permanently marked with coloured tape or paint at every termination — typically black,
            sometimes red. The neutral function on a 240 V appliance that needs no neutral (e.g. a baseboard
            heater) is then satisfied by the equipment grounding conductor for fault clearing only. Many modern
            240 V appliances (a dryer, a range) do need a neutral for 120 V accessory loads inside the
            appliance, in which case 12-2 with ground is insufficient and you need 12-3 with ground.
          </p>
        </FAQItem>

        <FAQItem q="The neutral conductor carries current — why isn't it called the &ldquo;return&rdquo;?">
          <p>
            Historically, &ldquo;neutral&rdquo; meant the conductor at zero potential relative to ground — the
            centre-tap of the service transformer's secondary, bonded to earth at the service entrance only. It
            is electrically distinct from the equipment grounding conductor (which is not supposed to carry any
            current under normal conditions) and from the &ldquo;return&rdquo; in a DC circuit (where the
            grounded conductor and the current return are unambiguously the same)<Cite id="nec-2023" in={SOURCES} />.
            On a three-phase or split-phase AC system, the neutral can carry imbalance current between the
            phases, which is a distinct concept from the return current on a two-wire DC loop. The name is a
            holdover from the early days of grounded AC distribution.
          </p>
        </FAQItem>

        <FAQItem q="Why is the equipment grounding conductor sized smaller than the hots?">
          <p>
            The EGC's job is to carry fault current long enough for the breaker to trip — milliseconds, not hours.
            NEC Table 250.122 sizes the EGC based on the upstream overcurrent device, not the load current it
            normally
            carries (which is zero)<Cite id="nec-2023" in={SOURCES} />. For a 15 or 20 A circuit the EGC can be
            14 AWG; for a 60 A circuit the EGC must be 10 AWG. The thermal mass of a small conductor is enough
            to carry hundreds of amperes of fault current for the few milliseconds it takes the breaker to clear,
            so the gauge can be smaller than the hot conductors carrying the steady load.
          </p>
        </FAQItem>

        <FAQItem q="How is voltage drop different from impedance drop in an AC circuit?">
          <p>
            On a 60 Hz residential branch with copper at any reasonable gauge, the inductive reactance per metre is
            small compared to the resistance per metre, so the voltage drop formula ΔV = 2·I·R·L is an excellent
            approximation<Cite id="nec-2023" in={SOURCES} />. NEC Chapter 9 Table 9 gives full impedance values
            including the reactive part for raceway and cable configurations, and for short residential runs the
            correction is well under one percent. The reactive term becomes significant only for very long runs
            (commercial / industrial), for tight conduit fills where mutual inductance is large, or at higher
            frequencies (harmonic currents, motor drives).
          </p>
        </FAQItem>

        <FAQItem q="Is conduit always required, or can NM-B run exposed in a basement?">
          <p>
            NEC 334.15 allows NM-B to run exposed in dry locations, including unfinished basements, provided it
            is run through the centre of structural members or otherwise protected from physical damage on the
            face of a stud or joist<Cite id="nec-2023" in={SOURCES} />. Where it crosses below 1.4 m above the
            floor or runs along the face of a wall in a habitable space, it must be protected by a running board,
            guard strip, or conduit. Garages and accessory buildings typically require conduit because the
            mechanical-damage risk is higher. Wet locations (outdoors, in damp basements) require UF-B or THHN-in-conduit
            instead.
          </p>
        </FAQItem>

        <FAQItem q="What's the cable stapling and box-fill requirement inside a stud bay?">
          <p>
            NEC 334.30 requires NM-B to be supported within 300 mm of every box and at intervals not exceeding
            1.4 m along its run<Cite id="nec-2023" in={SOURCES} />. Cable staples must be the
            insulated-saddle kind specifically listed for NM-B; standard wire fence staples are not permitted
            because they can over-compress the jacket. Box-fill calculation, governed by Article 314.16, totals
            the volume each conductor and device occupies in a junction box and requires the box to be at least
            that
            volume<Cite id="nec-2023" in={SOURCES} />: a typical single-gang 18-cubic-inch box accommodates a
            standard receptacle plus a few 12 AWG splices.
          </p>
        </FAQItem>

        <FAQItem q="Why are tamper-resistant receptacles (TR) required in residential bedrooms?">
          <p>
            NEC 406.12 has, since 2008, required tamper-resistant receptacles in essentially all readily-accessible
            receptacles within dwelling units<Cite id="nec-2023" in={SOURCES} />. The mechanism is a pair of
            sprung shutters behind the face plate that open only when symmetric pressure is applied to both
            slots simultaneously — as a two-prong plug does — preventing a child from inserting a single object
            (a hairpin, a paperclip) into one slot. The receptacle is otherwise electrically and mechanically
            identical to a non-TR equivalent. The requirement covers bedrooms, living rooms, hallways, and
            essentially every other dwelling receptacle except a few specific exceptions (behind a permanently-installed
            appliance, more than 1.7 m above the floor).
          </p>
        </FAQItem>

        <FAQItem q="What's the difference between an arc-fault breaker and a ground-fault breaker?">
          <p>
            GFCIs (Ground-Fault Circuit Interrupters) detect leakage current to ground — typically a person
            completing a circuit between hot and earth — by comparing the current in the hot to the current
            returning on the neutral and tripping at any mismatch greater than 5 mA within roughly 25
            ms<Cite id="nec-2023" in={SOURCES} />. AFCIs (Arc-Fault Circuit Interrupters) listen for the
            high-frequency current signature of a parallel or series arc — a staple piercing a cable, a damaged
            extension cord — and trip before the arc ignites surrounding combustibles<Cite id="nfpa-70e-2024" in={SOURCES} />.
            GFCI is about people; AFCI is about fires. The two functions are sometimes combined in a dual-function
            (DFCI) breaker required by some recent NEC adoptions.
          </p>
        </FAQItem>

        <FAQItem q="If I'm putting in conduit instead of NM-B, do I size the wire differently?">
          <p>
            Yes, slightly. THHN single conductors in conduit are derated as the conduit fill increases, because
            multiple current-carrying conductors in the same raceway shed heat less efficiently. NEC 310.15(C)(1)
            adjusts the ampacity downward when more than three current-carrying conductors share a raceway: 80 %
            for 4–6 conductors, 70 % for 7–9, and so on<Cite id="awg-table-nec" in={SOURCES} />. The conduit fill
            calculation of Chapter 9 Table 1 separately limits how many conductors can mechanically fit. For a
            two-conductor residential 120 V branch in 1/2&quot; EMT, neither derating nor fill is usually the binding
            constraint — but in a feeder run with six or eight conductors in a single conduit, the adjustment can
            push you up a gauge.
          </p>
        </FAQItem>

        <FAQItem q="Can I just upsize the wire and skip worrying about the breaker?">
          <p>
            Not exactly. Upsizing the wire is always safe — a 12 AWG conductor on a 15 A breaker is wasted copper
            but never dangerous. But the breaker must still be sized to protect the <em>smallest</em> wire in the
            run, not the largest, and you cannot pair a 30 A breaker with 14 AWG wire even if there is also a
            short stretch of 6 AWG in series with it<Cite id="nec-2023" in={SOURCES} />. The breaker rating
            tracks the weakest segment of the conductor it protects. NEC 240.4 makes this explicit.
          </p>
        </FAQItem>
      </FAQ>
    </ChapterShell>
  );
}
