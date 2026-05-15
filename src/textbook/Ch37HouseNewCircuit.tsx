/**
 * Chapter 37 — Adding a new branch circuit
 *
 * The third DIY-with-theory chapter in the practical track. The reader has
 * read Ch.28 (inside the panel), Ch.29 (branch circuits) and Ch.31 (big
 * loads) and now wants to actually run one: panel knockout to wall plate.
 * The chapter is structured as the twelve-step working procedure a licensed
 * electrician would follow, with each step pinned to the NEC clause that
 * dictates it and the underlying physics that explains why the clause says
 * what it says.
 *
 * The driving scenario is a dedicated 20 A circuit for a 1500 W shop vac
 * in an attached garage — a small, common, code-driven job that touches
 * every part of the new-circuit checklist (220.82 demand, 210.19 conductor
 * sizing, 240.4 ampacity / breaker pairing, 300.4 mechanical protection,
 * 334 NM-B install rules, 314.16 box fill, 408 panel landing, 250 grounding,
 * 210.8/210.12 GFCI/AFCI). Eight H2 sections (Step 0 through Step 7),
 * five TryIt exercises, three case studies, fifteen FAQ items, and a heavy
 * pass of <Term> popovers on the working vocabulary.
 *
 * No new demo components — the chapter is procedural prose with arithmetic.
 */
import { CaseStudies, CaseStudy } from '@/components/CaseStudy';
import { ChapterShell } from '@/components/ChapterShell';
import { FAQ, FAQItem } from '@/components/FAQ';
import { Formula, InlineMath } from '@/components/Formula';
import { Pullout } from '@/components/Prose';
import { Cite } from '@/components/SourcesList';
import { Term } from '@/components/Term';
import { TryIt } from '@/components/TryIt';
import { getChapter } from './data/chapters';

export default function Ch37HouseNewCircuit() {
  const chapter = getChapter('house-new-circuit')!;
  const SOURCES = chapter.sources;

  return (
    <ChapterShell chapter={chapter}>
      <p className="chapter-intro">
        Imagine a 1500 W shop vac in an attached garage. The owner has been plugging it into the nearest existing
        receptacle, but that receptacle is on the same 20 A circuit as the chest freezer, and every time the freezer's
        compressor kicks on while the vac is running the breaker trips. The fix is not a heavier extension cord and not
        a different vac. The fix is a new dedicated 20 A circuit, run from the panel through the garage wall to a new
        receptacle within a metre of where the vac actually gets used. One breaker. One conductor pair. One outlet.
        Nothing else on it.
      </p>
      <p className="mb-prose-3">
        That is the job this chapter walks through. It is the single most common piece of after-hours residential work
        a licensed electrician does, and it is also the smallest job that touches almost every section of the dwelling-unit
        chapter of the NEC. There are twelve discrete steps from the panel knockout to the wall plate, and each one is
        pinned to a specific code clause. The clauses are not arbitrary — every rule in the next eight sections is the
        compressed-into-legalese version of a physics result from earlier in the book. Demand factors come out of
        statistical load aggregation; the 125% continuous-load multiplier comes from breaker time-current curves;
        ampacity tables come from conductor heating; voltage drop comes from <em className="italic text-text">I·R</em>; the bond-once-only rule comes
        from the fault-clearing geometry of Ch.28. The chapter assumes the reader has already read Ch.28 (the panel),
        Ch.29 (branch circuits), and Ch.31 (big 240 V loads); it builds on the vocabulary without re-deriving it.
      </p>

      <h2 className="chapter-h2">Step 0: confirm the panel has headroom</h2>

      <p className="mb-prose-3">
        Before anything is ordered or drilled, the first question is whether the existing service can carry the new
        load at all. The NEC's
        {' '}<Term def={<><strong className="text-text font-medium">NEC 220.82 Optional Method</strong> — a simplified residential demand calculation that diversifies the connected load using the rule "first 10 kVA at 100%, remainder at 40%," plus separate rules for the largest of the heating or cooling load. Faster and almost always more permissive than the Standard Method of 220.42.</>}>Optional Method 220.82</Term>{' '}
        is the simplified residential demand calculation that handles this in three lines instead of the dozen pages of
        the Standard Method<Cite id="nec-2023" in={SOURCES} />. Sum every fixed and general-lighting load in the
        dwelling (in volt-amperes, not watts; the difference matters for motors and electronics but not for resistive
        loads), then apply the 220.82 rule of thumb:
      </p>
      <Formula tex="I_{\text{demand}} = \dfrac{3 \times W_{\text{first10k}}/1000 + 0.40 \times W_{\text{remainder}}/1000}{V}" />
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">I_demand</strong> is the calculated service demand current (in amperes RMS) that the panel needs
        to be able to carry, <strong className="text-text font-medium">W_first10k</strong> is the first 10 000 VA of summed connected load (taken at
        100%), <strong className="text-text font-medium">W_remainder</strong> is everything above 10 000 VA (taken at 40% to account for
        {' '}<Term def={<><strong className="text-text font-medium">demand factor</strong> — the empirical fraction of nameplate load that a household will actually draw simultaneously. The dryer is on or the oven is on but rarely both at full tilt at the same moment as the air conditioner. Codified in NEC Article 220 as the diversity multipliers in 220.42 (Standard) and 220.82 (Optional).</>}>diversity</Term>{' '}
        — almost no household actually runs the dryer, the oven, the heat pump and the dishwasher all at full power
        simultaneously), and <strong className="text-text font-medium">V</strong> is the service voltage (240 V for a standard split-phase residential
        service). The factor of 3 on the first chunk and 0.40 on the remainder are the two empirical numbers the NEC
        committee chose to make the formula match observed peak loads on real residential services<Cite id="nec-2023" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        Run it once for the existing house and once with the new load included. A 200 A panel running ~120 A demand
        has plenty of room for a new 16 A continuous circuit; a 100 A panel running 85 A demand does not, and the new
        circuit either has to wait for a service upgrade or has to be load-shed against an existing circuit that the
        owner can give up. The
        {' '}<Term def={<><strong className="text-text font-medium">branch circuit</strong> — the wiring from the final overcurrent device (the breaker) to the outlet or device. NEC 100 defines it precisely; it is the leaf of the wiring tree, distinct from feeders (between two panels) and service conductors (between the utility transformer and the main).</>}>branch circuit</Term>{' '}
        about to be added is what 220.82 calls "general lighting and receptacle," and it counts as 1500 VA per
        receptacle for cord-and-plug loads — the same accounting used for every other 20 A circuit in the
        house<Cite id="nec-2023" in={SOURCES} />.
      </p>

      <TryIt
        tag="Try 37.1"
        question={
          <>A 200 A service currently runs <strong className="text-text font-medium">95 A demand</strong> under the 220.82 Optional Method. The owner
          wants to add a hardwired <strong className="text-text font-medium">50 A, 240 V</strong> Level-2 EV charger as a continuous load. Does the
          existing panel have headroom under 220.82, and what is the new total demand?</>
        }
        hint={<>A 50 A continuous load is counted at 125% per 210.19(A)(1)(a); the EV charger then adds to the existing
        demand current.</>}
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">
              A continuous load is counted at 125%: a 50 A continuous EV charger contributes 50 × 1.25 = 62.5 A to the
              demand calculation. Add to the existing 95 A:
            </p>
            <Formula tex="I_{\text{total}} = 95 + 62.5 = 157.5\ \text{A} < 200\ \text{A}" />
            <p className="mb-prose-1 last:mb-0">
              Answer: <strong className="text-text font-medium">yes, there is headroom</strong>. The new total demand is roughly 158 A on a 200 A
              service, comfortably under the main breaker but with less than 50 A of remaining headroom — adding
              another large load later (a heat-pump dryer, a second EV) would push the calc over and require a service
              upgrade<Cite id="nec-2023" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2 className="chapter-h2">Step 1: pick the device, the device picks the wire</h2>

      <p className="mb-prose-3">
        With the panel cleared as having headroom, the chain of choices begins at the load and works backward to the
        panel. The shop vac is a 1500 W nominal motor load on 120 V. The owner has decided on a single
        {' '}<Term def={<><strong className="text-text font-medium">NEMA 5-20R</strong> — the 20 A, 125 V receptacle (one slot horizontal, one slot vertical with a T shape, plus the round ground). Will also accept a NEMA 5-15P plug. The standard 20 A receptacle for kitchen, garage, and dedicated-appliance branches.</>}>NEMA 5-20R</Term>{' '}
        receptacle at the end of the run, dedicated to the vac<Cite id="nema-wd-6" in={SOURCES} />. That implies a 20 A
        circuit. The first physics question is whether the vac is a
        {' '}<Term def={<><strong className="text-text font-medium">continuous load</strong> — a load that runs for three hours or more at a stretch. NEC 210.19(A)(1)(a) requires the branch-circuit conductor to be sized at 125% of the continuous-load current — effectively a derating factor that accounts for the heating from a sustained current that the time-current curve was never designed to handle.</>}>continuous load</Term>{' '}
        (three hours or more at a stretch). A homeowner's shop vac in normal use is non-continuous: a few minutes of
        cleanup, off for an hour, on again. So the conductor only has to handle the nameplate current itself, not the
        125% continuous multiplier<Cite id="nec-2023" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        That is not always true. A 50 A EV charger, by contrast, is by NEC definition a continuous load — a vehicle
        will pull near-rated current for the full duration of a charging session, often four to eight hours straight.
        Same for an electric tankless water heater, a commercial-grade space heater, or a long-running pool pump.
        NEC 210.19(A)(1)(a) requires that for continuous loads the branch-circuit conductor be sized to:
      </p>
      <Formula tex="I_{\text{conductor}} \geq 1.25 \times I_{\text{continuous}} + 1.0 \times I_{\text{noncontinuous}}" />
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">I_conductor</strong> is the minimum allowable conductor ampacity (in amperes), <strong className="text-text font-medium">I_continuous</strong>
        is the portion of the branch's load that is continuous (in amperes), and <strong className="text-text font-medium">I_noncontinuous</strong> is
        any non-continuous portion sharing the same conductor. The 1.25 factor is a derating multiplier that takes the
        breaker out of the steepest part of its
        {' '}<Term def={<><strong className="text-text font-medium">time-current curve</strong> — the log-log plot of trip time versus current for a breaker (Ch.28). A continuous load held at the rated value sits on the part of the curve where minor temperature drift starts to threaten a thermal trip. The 125% multiplier of 210.19 keeps the breaker comfortably below that knee.</>}>time-current curve</Term>{' '}
        — running a 20 A breaker continuously at 19 A would sit right on the thermal-trip knee where ambient temperature
        and panel-internal heating start to matter<Cite id="nec-2023" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        With the load identified and the continuous-load question settled, the conductor is picked next. For a 20 A
        residential branch at the standard 60 °C termination column of NEC Table 310.16, the answer is
        {' '}<strong className="text-text font-medium">12 AWG copper</strong>: a single solid copper conductor 2.05 mm in diameter, rated for 20 A under
        normal residential conditions<Cite id="nec-2023" in={SOURCES} />. 14 AWG copper is rated only for 15 A in the
        same column and cannot legally feed a 20 A circuit; 10 AWG is rated for 30 A and would be wasted unless voltage
        drop demanded the upsize.
      </p>
      <p className="mb-prose-3">
        Voltage drop is the second physics question. The
        {' '}<Term def={<><strong className="text-text font-medium">ampacity</strong> — the current a conductor can carry continuously under defined conditions of installation without exceeding its insulation's temperature rating. Tabulated in NEC Table 310.16 by gauge, insulation type, and ambient temperature.</>}>ampacity</Term>{' '}
        of 12 AWG is set by how hot the conductor gets at the rated current. But long runs have a second problem: even
        well below the thermal limit, the I·R drop along the conductor pair lowers the voltage delivered to the load.
        NEC 210.19 Informational Note 4 (not a hard requirement, just a strong recommendation) suggests keeping
        branch-circuit voltage drop under 3% and combined feeder-plus-branch drop under 5%<Cite id="nec-2023" in={SOURCES} />.
        The arithmetic is straightforward:
      </p>
      <Formula tex="V_{\text{drop}} = 2 \times I \times R_{\text{per\_ft}} \times L_{\text{oneway}}" />
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">V_drop</strong> is the total round-trip voltage drop seen by the load (in volts),
        <strong className="text-text font-medium"> I</strong> is the operating current (in amperes), <strong className="text-text font-medium">R_per_ft</strong> is the conductor's
        resistance per foot (in ohms per foot; the table value for 12 AWG copper at 75 °C is approximately
        1.59 mΩ/ft, or about 0.00159 Ω/ft), <strong className="text-text font-medium">L_oneway</strong> is the one-way length of the run from panel to
        load (in feet), and the leading factor of 2 accounts for the round trip — current flows out on the hot and
        returns on the neutral, dropping voltage on both conductors<Cite id="nec-2023" in={SOURCES} />. For a 16 A
        operating current and a 100 ft one-way run, the drop is 2 × 16 × 0.00159 × 100 ≈ 5.1 V, or about 4.2% of 120 V
        — slightly over the 3% recommendation, which means a 100 ft run would prefer 10 AWG even though 12 AWG
        satisfies ampacity.
      </p>

      <TryIt
        tag="Try 37.2"
        question={
          <>You are planning a <strong className="text-text font-medium">75 ft</strong> (one-way) 12 AWG copper run from the panel to a
          <strong className="text-text font-medium"> 14 A continuous load</strong>. R per foot for 12 AWG copper is about <strong className="text-text font-medium">1.59 mΩ/ft</strong>.
          Compute the round-trip voltage drop. Is it within NEC's informational 3% recommendation on a 120 V branch?
          If not, what conductor gauge fixes it?</>
        }
        hint={<>V_drop = 2 × I × R_per_ft × L_oneway. The continuous-load 125% factor sizes the conductor by ampacity,
        but voltage drop uses the actual operating current.</>}
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">
              Round-trip voltage drop at 14 A and 75 ft:
            </p>
            <Formula tex="V_{\text{drop}} = 2 \times 14 \times 0.00159 \times 75 = 3.34\ \text{V}" />
            <p className="mb-prose-1 last:mb-0">
              On a 120 V branch that is 3.34 / 120 = 2.8%, which sneaks in just under the 3% informational
              note<Cite id="nec-2023" in={SOURCES} />.
            </p>
            <p className="mb-prose-1 last:mb-0">
              Answer: <strong className="text-text font-medium">compliant, but at the limit</strong>. If the run length crept up by even ten feet (or if
              the load were nudged from 14 A to 16 A), the upsize is 10 AWG copper — R/ft ≈ 1.00 mΩ/ft — which roughly
              halves the drop. The 20 A breaker stays the same; only the wire gets fatter.
            </p>
          </>
        }
      />

      <h2 className="chapter-h2">Step 2: pick the breaker</h2>

      <p className="mb-prose-3">
        Here is the subtle inversion that surprises most first-time DIY installers. The breaker is not picked to match
        the load; it is picked to match the <em className="italic text-text">wire</em>. NEC 240.4 ties the maximum overcurrent device rating to the
        conductor's ampacity, and Table 240.4(D) gives the small-conductor cap directly: 14 AWG copper → 15 A
        maximum breaker, 12 AWG copper → 20 A maximum, 10 AWG copper → 30 A maximum<Cite id="nec-2023" in={SOURCES} />.
        The load on the end of the circuit can be anything that draws less than the breaker rating; the breaker's job
        is to interrupt the current before the wire itself overheats and ignites the surrounding lumber.
      </p>
      <p className="mb-prose-3">
        The Ch.28 picture is the right one to hold: the breaker is a thermal-magnetic protective device whose
        time-current curve is calibrated so that any current above its rating will trip it before the wire it protects
        gets hot enough to break down its insulation. A 12 AWG conductor's insulation begins to degrade at sustained
        currents above roughly 25 A; the 20 A breaker keeps it comfortably below that. If you put a 30 A breaker on a
        12 AWG run, the wire will quietly cook inside the wall for twenty minutes before anything detects the problem,
        and the failure mode is a structure fire.
      </p>
      <Pullout>
        The breaker doesn't protect the load. It protects the wire.
      </Pullout>
      <p className="mb-prose-3">
        For the garage receptacle there is one more layer. NEC 210.8 has progressively expanded the list of locations
        where {' '}<Term def={<><strong className="text-text font-medium">GFCI</strong> (ground-fault circuit interrupter) — a protective device that compares hot-leg current with neutral-leg current and trips at about 5 mA residual. Required by NEC 210.8 in bathrooms, kitchens, garages, basements, outdoor receptacles, laundry, dishwasher branches, and anywhere within 6 ft of a sink. The trip threshold is calibrated against human electrocution physiology.</>}>GFCI</Term>{' '}
        protection is mandatory: bathrooms (since 1975), kitchens (1996), garages (1978), outdoors (1973), unfinished
        basements (1990), laundry rooms (2014), dishwasher branches (2014)<Cite id="nec-2023" in={SOURCES} />. The
        garage receptacle is squarely in the list. And NEC 210.12 requires
        {' '}<Term def={<><strong className="text-text font-medium">AFCI</strong> (arc-fault circuit interrupter) — a protective device that monitors the current waveform for the high-frequency signature of an electrical arc and trips on it. Required in most dwelling-unit living spaces by NEC 210.12 since 2014. Listed under UL 1699.</>}>AFCI</Term>{' '}
        protection in essentially every dwelling-unit living area. The simplest way to satisfy both in one breaker is a
        {' '}<Term def={<><strong className="text-text font-medium">dual-function breaker</strong> — a breaker that combines AFCI and GFCI protection in a single device. NEC 2023 increasingly defaults to dual-function on any circuit that triggers either requirement, since the two functions are now standard on the same silicon module.</>}>dual-function breaker</Term>{' '}
        (AFCI + GFCI in one body), available in every major panel family<Cite id="nec-2023" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        The breaker also has to match the panel manufacturer. As Ch.28 explained, a Square D QO breaker physically does
        not seat on an Eaton BR bus and vice versa — the stab geometries are listed for use only with the manufacturer's
        own load centre under UL 489, with a small handful of "classified" cross-listings as the exception. The new
        breaker is whatever stocks the existing panel.
      </p>

      <h2 className="chapter-h2">Step 3: pick a path</h2>

      <p className="mb-prose-3">
        With the device, the wire, and the breaker selected, the next question is purely mechanical: how does the
        cable get from the panel to the new receptacle? The answer depends on what the building is made of — open
        framing in a basement ceiling is a different problem from finished drywall on the upper floor — but the rules
        all live in NEC 300.4 and the chapters of Article 334 that govern non-metallic-sheathed (NM) cable.
      </p>
      <p className="mb-prose-3">
        Drilling through studs is the most common interior path. NEC 300.4(A) is precise: the hole must be centred in
        the stud, or far enough from each face that there is at least 1.25 inches of wood between the cable and the
        nearest stud face. If the hole is closer than that, a steel
        {' '}<Term def={<><strong className="text-text font-medium">nail plate</strong> — a steel plate at least 1/16 inch thick that is nailed over a hole or notch in a stud or joist to protect the cable inside from a nail or screw driven through the wall from the room side. Required by NEC 300.4(A) and (D) wherever wood-to-cable clearance is less than 1.25 inches.</>}>nail plate</Term>{' '}
        at least 1/16 inch thick must be installed over the hole on each side that is too close to the stud face. The
        rule is calibrated to stop a typical drywall screw or 16d framing nail from reaching the cable<Cite id="nec-2023" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        Notches in the front edge of a stud — useful when a hole is impossible because of a steel plate already in
        place — are allowed only with a steel plate covering the notch. Running cable parallel to a stud face is
        allowed if the cable is set back at least 1.25 inches from the front face; running it through cabling holes
        in joists in an attic falls under NEC 334.23, which references 320.23 — held at least 1.25 inches back from
        joist edges or protected by a running board within 6 feet of the attic access<Cite id="nec-2023" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        Drilling order matters in practice. The path planner walks from receptacle to panel marking each hole, drills
        from the receptacle end backward, fishes the cable as a single continuous run, and reserves the panel-end
        knockout for the very last step. Cable splices inside the wall are forbidden — every connection has to be in
        an accessible box (NEC 300.15)<Cite id="nec-2023" in={SOURCES} />, so the path has to be feasible as one
        unbroken cable from panel to box.
      </p>

      <h2 className="chapter-h2">Step 4: pick the cable</h2>

      <p className="mb-prose-3">
        Three cable types dominate residential interior work, and the choice between them is regional, occupancy-driven,
        and partly cosmetic.
      </p>
      <p className="mb-prose-3">
        {' '}<Term def={<><strong className="text-text font-medium">NM-B</strong> (non-metallic sheathed cable, the "B" rating denotes 90 °C insulation) — the colour-coded plastic-jacketed bundle of two or three insulated conductors plus a bare ground that is the default residential interior wiring. Commonly called "Romex" (a Southwire trademark). Governed by NEC Article 334.</>}>NM-B</Term>{' '}
        — the everyday "Romex" — is the default for dry, indoor, in-wall runs in single-family dwellings. The cable is
        colour-coded to its gauge: white outer jacket for 14 AWG, yellow for 12 AWG, orange for 10 AWG, black for 8 and
        6 AWG. Inside the jacket are two or three insulated conductors plus a bare copper grounding conductor.
        NEC Article 334 allows it in dry locations of single- and two-family dwellings and most multi-family
        construction up to three storeys, but bars it from commercial occupancies and from any location subject to
        physical damage<Cite id="nec-2023" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        {' '}<Term def={<><strong className="text-text font-medium">MC cable</strong> — metal-clad cable: a bundle of insulated conductors plus a separate equipment-grounding conductor (or bonding strip) inside a continuous interlocked aluminium or steel armour. The armour itself counts as part of the grounding path under specific listings. Allowed under NEC Article 330 in essentially every occupancy NM-B is not.</>}>MC cable</Term>{' '}
        is the metal-clad equivalent: the same conductors inside a continuous interlocked aluminium or steel armour.
        Some jurisdictions (Chicago is the canonical example) mandate MC in multi-family construction, where the
        armour both provides physical protection and acts as an additional bonding path. MC terminates with
        manufacturer-specific antishort bushings — the cable cannot legally enter a box without one.
      </p>
      <p className="mb-prose-3">
        {' '}<Term def={<><strong className="text-text font-medium">EMT</strong> (electrical metallic tubing) — a thin-walled steel conduit that conductors are pulled through after installation. The standard for surface-mounted runs in garages, workshops, unfinished basements, and any commercial occupancy.</>}>EMT</Term>{' '}
        is rigid steel conduit pulled with separate THHN/THWN conductors. Surface-mounted runs in garages and
        workshops use EMT for its physical durability and the ability to add or remove conductors after the install
        without opening any drywall. NEC Article 358 governs bending radii, support spacing, and conductor fill within
        the conduit.
      </p>
      <p className="mb-prose-3">
        Once the cable type is chosen, NEC 334.30 (for NM) and NEC 314.17 (for box entry) take over. The cable's outer
        jacket has to extend at least 1/4 inch into the box, and the individual conductors must extend a minimum of
        6 inches free of the box opening so there is enough length to make up the splice or land the device. NM-B has
        to be supported within 12 inches of every box and every 4-1/2 feet along its run thereafter, with stainless or
        plastic staples (no bare metal staples digging into the jacket)<Cite id="nec-2023" in={SOURCES} />.
      </p>

      <h2 className="chapter-h2">Step 5: pick the boxes</h2>

      <p className="mb-prose-3">
        Every connection has to live in a box; every box has to be large enough to hold its contents without crushing
        the conductors. NEC 314.16 is the rule and its arithmetic is exact. The
        {' '}<Term def={<><strong className="text-text font-medium">box fill</strong> — the volumetric accounting required by NEC 314.16 to confirm a junction or device box is large enough to safely contain its conductors, devices, clamps, and grounds. Each item counts as a fixed number of "conductor equivalents" multiplied by the per-conductor volume from Table 314.16(B).</>}>box-fill</Term>{' '}
        calculation walks the box contents item by item, multiplies each by a per-conductor volume from
        Table 314.16(B), and totals the result:
      </p>
      <Formula tex="V_{\text{box}} \geq \sum(n_{\text{cond}} \times v_{\text{cond}}) + V_{\text{devices}} + V_{\text{grounds}} + V_{\text{clamps}}" />
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">V_box</strong> is the labelled internal volume of the box (in cubic inches),
        <strong className="text-text font-medium"> n_cond</strong> is the number of insulated current-carrying conductors entering and remaining in the
        box (in count), <strong className="text-text font-medium">v_cond</strong> is the volume allowance per conductor for that conductor's gauge from
        NEC Table 314.16(B) (in cubic inches; 2.00 for 14 AWG, 2.25 for 12 AWG, 2.50 for 10 AWG),
        <strong className="text-text font-medium"> V_devices</strong> is two conductor-volumes per yoke or strap that holds a device (receptacle or
        switch), <strong className="text-text font-medium">V_grounds</strong> is one conductor-volume total for the entire bundle of grounding
        conductors regardless of how many there are, and <strong className="text-text font-medium">V_clamps</strong> is one conductor-volume total if
        any internal cable clamps are present (zero for boxes that use only external clamps)<Cite id="nec-2023" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        For the garage receptacle the box is a single 4-square steel device box rated for 21.0 cubic inches, with a
        single 12-2 NM-B cable entering through an external clamp. Three insulated conductors (hot, neutral; the bare
        ground is counted separately as a single bundle), one receptacle on a yoke, one ground bundle:
      </p>
      <Formula tex="V_{\text{required}} = (2 \times 2.25) + (2 \times 2.25) + (1 \times 2.25) = 11.25\ \text{in}^3" />
      <p className="mb-prose-3">
        That fits inside the 21 in³ box with margin. If the same box were a feed-through point with two cables (one in,
        one out, daisy-chained), there would be four insulated conductors (two hot, two neutral) plus the grounds:
      </p>
      <Formula tex="V_{\text{required}} = (4 \times 2.25) + (2 \times 2.25) + (1 \times 2.25) = 15.75\ \text{in}^3" />
      <p className="mb-prose-3">
        Still inside 21 in³. The point of the calculation is not that small boxes fail dramatically — they fail
        quietly, by making the conductors hard to dress and the wirenuts hard to seat properly. An overfilled box is
        where backstabbed receptacles, half-twisted splices, and overheating wirenuts get born.
      </p>

      <TryIt
        tag="Try 37.3"
        question={
          <>A 4-square steel box rated <strong className="text-text font-medium">21 in³</strong> has 1 receptacle, four 14 AWG insulated conductors
          (two cables, one in and one out), and two ground wires. Compute the required box fill. Is the box
          conforming?</>
        }
        hint={<>14 AWG counts as 2.00 in³ per conductor; the device yoke counts as 2× the per-conductor volume; all
        grounds combined count as a single conductor-volume.</>}
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">
              Item-by-item per NEC 314.16(B):
            </p>
            <Formula tex="V_{\text{required}} = (4 \times 2.00) + (2 \times 2.00) + (1 \times 2.00) = 14.00\ \text{in}^3" />
            <p className="mb-prose-1 last:mb-0">
              Four insulated conductors at 2.00, one device yoke worth 2× the per-conductor volume, and one ground
              bundle worth a single 2.00. Total 14.0 in³, well inside the 21 in³ box.
            </p>
            <p className="mb-prose-1 last:mb-0">
              Answer: <strong className="text-text font-medium">conforming with 7 in³ of margin</strong>. Adding a second receptacle on a duplex strap
              would push the requirement to 18 in³ — still fits, but tighter; a third device would not<Cite id="nec-2023" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2 className="chapter-h2">Step 6: make up the connections</h2>

      <p className="mb-prose-3">
        The cable is pulled, the boxes are mounted, the conductors are inside their respective boxes. Now the splices.
        Three rules govern every connection.
      </p>
      <p className="mb-prose-3">
        First, strip exactly the right length of insulation off each conductor — about 3/4 inch for a screw terminal
        and roughly 5/8 inch for a wirenut splice. Strip too little and the bare copper does not seat past the screw
        threads; strip too much and there is exposed copper outside the wirenut or beyond the screw plate, which is a
        violation of UL 498's listing for the device<Cite id="ul-498" in={SOURCES} />. The strip length is what the
        listing actually tests for.
      </p>
      <p className="mb-prose-3">
        Second, side-screw the receptacle. Every NEMA 5-20R receptacle has two ways to attach a conductor: a screw
        terminal on the side of the device, where the bare end wraps clockwise three-quarters around the screw and the
        screw is torqued to spec; and a
        {' '}<Term def={<><strong className="text-text font-medium">backstab</strong> — a spring-loaded push-in connector on the back of a residential receptacle that accepts a straight conductor without a screw. Allowed under UL 498 only for 14 AWG and only with the specific listed devices. The connector relies on a single phosphor-bronze spring for contact pressure; field failure rate is significantly higher than the side-screw alternative.</>}>backstab</Term>{' '}
        push-in connector on the back of the device, which is faster but mechanically weaker. UL 498 lists the
        backstab connection only for 14 AWG, and electricians with a fire-investigation case load tend to avoid the
        backstab entirely<Cite id="ul-498" in={SOURCES} />. Side-screw is the long-life connection.
      </p>
      <p className="mb-prose-3">
        Third, pigtail. If the receptacle is in the middle of a daisy chain — one cable in from the panel, one cable
        out to the next receptacle — the temptation is to use the device's own pair of screws as the splice point
        (line cable on one pair, load cable on the other pair, the device strap completes the path between them). The
        problem is that if the device is ever removed or fails open, the downstream half of the chain goes dark too.
        The right way is to wirenut the two incoming hots together with a short
        {' '}<Term def={<><strong className="text-text font-medium">pigtail</strong> — a short 6 inch piece of conductor wirenutted to a daisy-chain splice and run to the device. Keeps the daisy chain electrically continuous if the device is removed or fails open, and concentrates the splice geometry inside the box rather than across the device's mechanical strap.</>}>pigtail</Term>{' '}
        and run a single 6 inch pigtail to the device. Same on the neutrals. Same on the grounds. The device is now a
        leaf, not a node — pull it out and the rest of the circuit stays live<Cite id="ul-498" in={SOURCES} />.
      </p>

      <h2 className="chapter-h2">Step 7: land at the panel</h2>

      <p className="mb-prose-3">
        The cable is fished, the receptacle is wired, the box is dressed. The last operation is the panel landing —
        the most dangerous step of the job and the one with the strictest sequencing rules.
      </p>
      <p className="mb-prose-3">
        Kill the main. The two ungrounded service conductors entering the top of the panel are upstream of the main
        breaker and remain live even with the main off — but the bus bars and every branch breaker go dead the instant
        the main handle flips down. NFPA 70E sets the
        {' '}<Term def={<><strong className="text-text font-medium">approach boundary</strong> — the distance from energised parts inside which only qualified electrical workers may operate, defined in NFPA 70E. The "Limited Approach Boundary" for 250 V residential service is roughly 1.5 m; inside the "Restricted Approach Boundary" energised work requires explicit PPE and an energised-work permit.</>}>approach boundary</Term>{' '}
        and PPE expectations for working in a residential panel cover-off; for a 240 V service the limited approach
        boundary is roughly 1.5 m, well outside any practical reach of the bus bars themselves<Cite id="nfpa-70e-2024" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        Remove the
        {' '}<Term def={<><strong className="text-text font-medium">dead-front</strong> — the metal cover with breaker windows that sits between the panel interior and the room. Lifting it exposes the bus bars and the line-side lugs of the main breaker. NEC 408 requires it to be properly secured at every interior access.</>}>dead-front</Term>{' '}
        — the metal cover with the breaker windows — and the new breaker slot is visible. Snap the new dual-function
        breaker onto the next available
        {' '}<Term def={<><strong className="text-text font-medium">bus stab</strong> — one of the slotted copper fingers projecting laterally from a bus bar that a breaker clip grabs to make contact. Adjacent stabs alternate between L1 and L2 (Ch.28).</>}>bus stab</Term>;
        for a single-pole 120 V circuit any open slot will do, and the slot's L1/L2 assignment does not matter for a
        single-pole branch. Route the new cable into the panel through the closest knockout, secure it with a cable
        clamp, and strip the outer jacket back to leave six inches of free conductor inside the
        enclosure<Cite id="nec-2023" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        Land the hot on the breaker's load-side screw. Land the neutral on the
        {' '}<Term def={<><strong className="text-text font-medium">neutral bar</strong> — the terminal strip in a panel that receives every white (grounded) conductor from every branch circuit. In the main panel it is bonded to the panel can through the main bonding jumper; in any sub-panel it floats relative to the can (Ch.28).</>}>neutral bar</Term>{' '}
        — the terminal strip along the side of the can with white wires landed on it. Land the bare ground on the
        {' '}<Term def={<><strong className="text-text font-medium">ground bar</strong> — the terminal strip in a panel that receives every bare or green equipment-grounding conductor from every branch circuit. Always bonded to the panel can. At the main panel it shares a connection with the neutral through the main bonding jumper; at every sub-panel the two bars are kept separate (Ch.28).</>}>ground bar</Term>{' '}
        — the terminal strip with bare and green wires landed on it. Each conductor gets one terminal screw of its
        own; never two conductors under a single screw unless the terminal is specifically listed to accept two (most
        residential neutral bar terminals are listed for one only)<Cite id="nec-2023" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        At a main panel, the neutral bar and ground bar are connected by the main bonding jumper — the green-painted
        screw or strap that NEC 250 requires at the service entrance and nowhere else (Ch.28). So in practice the
        electrician at the main panel just lands each conductor on its respective bar without thinking about the
        bonding geometry. At a sub-panel the rule reverses: the
        {' '}<Term def={<><strong className="text-text font-medium">main bonding jumper</strong> — the connection between the neutral bar and the ground bar / panel can. NEC 250.24 requires exactly one in the entire premises wiring system, at the first means of disconnect. At every sub-panel the jumper is explicitly removed.</>}>main bonding jumper</Term>{' '}
        has to be removed and neutral and ground stay rigorously separate. The cable's neutral is white and the cable's
        ground is bare; if they are reversed at the panel even briefly under load, the bare wire energises every metal
        box on the circuit at line voltage.
      </p>
      <p className="mb-prose-3">
        Replace the dead-front. Tighten its retaining screws. Re-energise the main. With the new breaker still in the
        OFF position, clamp a meter on the new branch's hot conductor inside the panel and switch the breaker on; the
        clamp should read a few milliamperes of leakage and nothing else with the receptacle unloaded. Plug the shop
        vac into the new receptacle and the clamp jumps to about 12 A — within the breaker's nominal rating, with
        plenty of headroom. The circuit is live and the job is done.
      </p>

      <TryIt
        tag="Try 37.4"
        question={
          <>You are running a <strong className="text-text font-medium">100 ft</strong> (one-way) branch of 14 AWG NM-B to a hardwired
          <strong className="text-text font-medium"> 1200 W</strong> garage door opener that runs continuously (NEC's three-hour rule does not actually
          apply here, but assume worst-case for the calculation). R per foot for 14 AWG copper is approximately
          <strong className="text-text font-medium"> 2.52 mΩ/ft</strong>. What is the round-trip voltage drop at full load? Is 14 AWG sufficient by
          NEC's 3% recommendation, or do you upsize?</>
        }
        hint={<>Operating current at 120 V is I = P/V. Then V_drop = 2 × I × R/ft × L.</>}
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">
              The operating current and resulting drop:
            </p>
            <Formula tex="I = 1200\ \text{W} / 120\ \text{V} = 10\ \text{A}" />
            <Formula tex="V_{\text{drop}} = 2 \times 10 \times 0.00252 \times 100 = 5.04\ \text{V}" />
            <p className="mb-prose-1 last:mb-0">
              On a 120 V branch that is 5.04 / 120 = 4.2%, well over the 3% informational recommendation. Upsizing to
              12 AWG (R/ft ≈ 1.59 mΩ/ft) gives:
            </p>
            <Formula tex="V_{\text{drop,12AWG}} = 2 \times 10 \times 0.00159 \times 100 = 3.18\ \text{V} \to 2.65\%" />
            <p className="mb-prose-1 last:mb-0">
              Answer: <strong className="text-text font-medium">14 AWG fails the 3% recommendation; upsize to 12 AWG</strong>. The 15 A breaker that
              would have gone with 14 AWG can be kept at 15 A with the bigger conductor, or upgraded to 20 A if other
              loads will share the circuit later<Cite id="nec-2023" in={SOURCES} />.
            </p>
          </>
        }
      />

      <TryIt
        tag="Try 37.5"
        question={
          <>A NEMA 5-20 receptacle is installed at the end of a <strong className="text-text font-medium">30 ft</strong> 12 AWG branch from the panel,
          on a 20 A dual-function breaker. The owner plans to run a worm-drive table saw drawing <strong className="text-text font-medium">24 A
          continuous</strong> on it. Is the installation code-compliant? What needs to change?</>
        }
        hint={<>The breaker protects the wire. Compare the continuous-load multiplied current to the breaker's rating
        and the conductor's ampacity.</>}
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">
              A 24 A continuous load requires a conductor rated for at least 24 × 1.25 = 30 A and a matched breaker:
            </p>
            <Formula tex="I_{\text{min,conductor}} = 1.25 \times 24 = 30\ \text{A}" />
            <p className="mb-prose-1 last:mb-0">
              That is a 10 AWG conductor on a 30 A breaker, not a 12 AWG on a 20 A. The 20 A breaker would trip on the
              first long cut; if it failed to trip (which is the AFCI/GFCI worry), the 12 AWG wire would overheat
              inside the wall<Cite id="nec-2023" in={SOURCES} />.
            </p>
            <p className="mb-prose-1 last:mb-0">
              Answer: <strong className="text-text font-medium">not compliant</strong>. The fix is a full rebuild — replace the conductor with 10 AWG,
              the breaker with a 30 A dual-function, and the receptacle with a NEMA 5-30 (different blade pattern, will
              not accept the table saw's plug if it ships with a 5-20)<Cite id="nema-wd-6" in={SOURCES} />. The table
              saw's plug determines the receptacle; that determines everything upstream.
            </p>
          </>
        }
      />

      <CaseStudies
        intro={
          <>
            Three real new-circuit installations of increasing scope: a dedicated 20 A general-purpose receptacle, a
            30 A 240 V appliance circuit, and a 60 A subpanel feeding a detached workshop.
          </>
        }
      >
        <CaseStudy
          tag="Case 37.1"
          title="A 20 A circuit for a 1500 W garage shop vac"
          summary="The chapter's driving scenario, end to end."
          specs={[
            { label: 'Existing panel', value: <>200 A main, 25 of 40 slots used, ~120 A demand under 220.82 <Cite id="nec-2023" in={SOURCES} /></> },
            { label: 'New load', value: <>1500 W shop vac, 120 V, non-continuous (homeowner cleanup use)</> },
            { label: 'Operating current', value: <>1500 / 120 = 12.5 A</> },
            { label: 'Conductor', value: <>12-2 NM-B with bare ground, ~35 ft one-way <Cite id="nec-2023" in={SOURCES} /></> },
            { label: 'Voltage drop at 12.5 A', value: <><InlineMath tex="2 \times 12.5 \times 0.00159 \times 35 \approx 1.4\ \text{V} \to 1.2\%" /></> },
            { label: 'Breaker', value: <>20 A dual-function (AFCI + GFCI) per 210.8 and 210.12 <Cite id="nec-2023" in={SOURCES} /></> },
            { label: 'Receptacle', value: <>single-gang NEMA 5-20R in 21 in³ steel box <Cite id="nema-wd-6" in={SOURCES} /></> },
            { label: 'Path', value: <>panel knockout → ceiling joist run → drop into stud bay → garage receptacle</> },
            { label: 'Materials', value: <>40 ft 12-2 NM-B, 1 dual-function breaker, 1 5-20R, 1 deep box, 8 staples, 1 nail plate</> },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            This is the install the chapter has been describing piece by piece. The 220.82 demand calc has 80 A of
            headroom on the existing 200 A service, so the new 12.5 A non-continuous load adds essentially nothing to
            the demand picture. The conductor is sized to 12 AWG by NEC 240.4(D)'s small-conductor cap, not by the
            actual operating current (which would tolerate 14 AWG comfortably) — because the choice of a 20 A receptacle
            at the end fixes the breaker at 20 A, and that fixes the wire at 12 AWG<Cite id="nec-2023" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            The voltage drop calculation is reassuring: 1.4 V on a 35 ft run is 1.2% — well inside the 3% recommendation
            and with enough margin that adding a second receptacle on the same circuit later would still pass. The
            cable enters the panel through a 1/2 inch knockout fitted with a plastic cable connector, the outer jacket
            is stripped back about seven inches inside the box, the hot lands on the new dual-function breaker's load
            screw, the white on the neutral bar, the bare on the ground bar.
          </p>
          <p className="mb-prose-2 last:mb-0">
            At the receptacle end the conductor enters a single-gang 21 in³ steel box. Box-fill checks out at
            11.25 in³ (three insulated conductors plus one ground bundle plus one receptacle yoke), well inside the
            21 in³ capacity. The receptacle is side-screwed (not backstabbed) and torqued to the manufacturer's spec.
            The path is straightforward: the cable runs along a basement ceiling joist, threads up through a 3/4 inch
            hole drilled in the centre of a garage wall stud, drops down to the receptacle box. A single nail plate
            protects the only hole that was less than 1.25 inches from the stud face.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 37.2"
          title="A 30 A circuit for a tankless water heater retrofit"
          summary="240 V, continuous, hardwired — the small-pour version of an EV charger."
          specs={[
            { label: 'Load', value: <>240 V, 24 A continuous (5.76 kW; mid-range residential point-of-use unit)</> },
            { label: 'Required conductor ampacity', value: <>1.25 × 24 = 30 A → 10 AWG copper <Cite id="nec-2023" in={SOURCES} /></> },
            { label: 'Cable', value: <>10-2 NM-B with bare ground (no neutral required for pure 240 V load)</> },
            { label: 'Breaker', value: <>30 A two-pole thermal-magnetic <Cite id="nec-2023" in={SOURCES} /></> },
            { label: 'Connection method', value: <>hardwired into the appliance's terminal block (no NEMA receptacle)</> },
            { label: 'GFCI requirement', value: <>typically not required for hardwired 240 V water heaters <Cite id="nec-2023" in={SOURCES} /></> },
            { label: 'Run length', value: <>~25 ft one-way</> },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            Tankless electric water heaters are the small case of the same physics as an EV charger: a continuous
            240 V load that runs near rated current for the full duration of use. NEC 210.19(A)(1)(a) applies — the
            conductor is sized at 125% of the 24 A continuous current, giving 30 A, which is the ampacity of 10 AWG
            copper at the 60 °C column of Table 310.16<Cite id="nec-2023" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            Two hot conductors and a bare ground are pulled from the panel; no neutral, because the appliance is a
            pure 240 V load with no internal 120 V sub-circuit. At the panel the two hots land on the two poles of a
            30 A two-pole thermal-magnetic breaker (which automatically grabs one L1 stab and one L2 stab from the
            alternating-phase bus); at the water heater end the two hots and the ground enter the appliance's wiring
            compartment through a strain-relief bushing.
          </p>
          <p className="mb-prose-2 last:mb-0">
            The wire-strip and wirenut sequence at the heater is the textbook one. Strip 5/8 inch of insulation off
            each of the two appliance leads and each of the two cable conductors, twist each pair together clockwise
            with linesman's pliers, screw a yellow wirenut over each twisted pair until the wirenut bottoms out and
            the assembly is mechanically tight. The bare cable ground is screwed to the green grounding lug inside the
            heater chassis. Replace the appliance cover; energise the breaker; bleed the air out of the heater's
            water side; turn the kitchen tap to hot.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 37.3"
          title="A 60 A subpanel feeding a detached workshop"
          summary="Where the no-bond rule and the four-wire feeder both bite."
          specs={[
            { label: 'Feeder rating', value: <>60 A, 240 V split-phase, with neutral and ground</> },
            { label: 'Feeder conductors', value: <>6 AWG copper (two hots + neutral) + 10 AWG bare ground <Cite id="nec-2023" in={SOURCES} /></> },
            { label: 'Subpanel', value: <>Eaton BR-style, 6 slots, 100 A main lugs, factory bonding screw REMOVED</> },
            { label: 'Branch circuits on the sub', value: <>two 20 A 120 V outlet branches + one 30 A 240 V lathe branch</> },
            { label: 'Grounding electrode at sub', value: <>two 8 ft copper-clad rods driven 6 ft apart, #6 GEC <Cite id="nec-2023" in={SOURCES} /></> },
            { label: 'PPE during energising', value: <>arc-rated face shield, leather over rubber gloves, fire-resistant shirt <Cite id="nfpa-70e-2024" in={SOURCES} /></> },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            A detached workshop 80 ft from the house gets a 60 A subpanel fed from a 60 A two-pole breaker in the main
            panel. The feeder is a four-conductor run (two hots, neutral, ground) buried in a PVC conduit between the
            two buildings, sized at 6 AWG copper for the current-carrying conductors and 10 AWG bare for the equipment
            ground per NEC Table 250.122<Cite id="nec-2023" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            The single most important detail is what happens inside the subpanel. The enclosure ships from Eaton with
            a green bonding screw factory-installed between the neutral bar and the steel can; at a subpanel install
            that screw is <em className="italic text-text">removed</em>, leaving the neutral bar electrically floating relative to the can. The
            ground bar remains bonded to the can; the four wires of the feeder land on their respective bars; and the
            no-bond rule of Ch.28 is enforced at this end of the run<Cite id="nec-2023" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            NEC 250.32 then requires a separate grounding electrode at the subpanel itself: two 8 ft copper-clad rods
            driven 6 ft apart in the soil outside the workshop, bonded together with a #6 grounding-electrode
            conductor running back to the subpanel's ground bar. The two rods do not act as a fault-clearing path
            (their resistance to dirt is far too high to trip the 60 A feeder breaker); they act as a reference-stabilising
            surge path, holding the workshop's local ground reference to within a few volts of the soil potential
            during lightning or utility transients<Cite id="grainger-power-systems-2003" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            Energising follows the NFPA 70E sequence: arc-rated face shield, leather-over-rubber gloves, fire-resistant
            shirt, the worker outside the limited approach boundary of the main panel while a second person flips the
            new 60 A two-pole breaker on<Cite id="nfpa-70e-2024" in={SOURCES} />. Clamp meter on the feeder neutral
            reads near zero with the subpanel unloaded; on the equipment ground it reads <em className="italic text-text">exactly</em> zero, which
            is the test for whether the no-bond rule has actually been honoured at the subpanel end.
          </p>
        </CaseStudy>
      </CaseStudies>

      <FAQ intro="Common questions on how the rules of this chapter line up against the physics of earlier ones.">
        <FAQItem q="Why does 12 AWG go with 20 A breakers, not 30 A?">
          <p>
            Because the breaker exists to protect the conductor, and 12 AWG copper begins to overheat at sustained
            currents above roughly 25 A. NEC 240.4(D) caps the overcurrent device for 12 AWG at 20 A as a
            small-conductor rule: it is not the conductor's absolute ampacity (which Table 310.16 puts at 25 A at
            75 °C) but a deliberate buffer that keeps the wire well below its insulation's failure
            point<Cite id="nec-2023" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Can I daisy-chain receptacles or do I need a junction box at each one?">
          <p>
            Daisy-chaining is allowed and is the normal residential pattern. Each receptacle's own metal yoke can act
            as the splice point between the line-side and load-side cables — but the better practice (and the longer-lived
            installation) is to pigtail at every box. The line and load cables are wirenutted together inside the box
            and a single short pigtail runs to the device, so that removing the device for replacement does not break
            the daisy chain. NEC does not require pigtailing on its own (except where shared neutrals are involved),
            but UL 498's listing for the receptacle device is shorter-lived when used as a through-splice than as a
            terminus<Cite id="ul-498" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why does NEC require AFCI in bedrooms but not in kitchens?">
          <p>
            AFCI is now required almost everywhere in dwelling-unit living spaces (NEC 210.12), including bedrooms,
            living rooms, halls, closets, and laundry. Kitchens get the AFCI requirement as well in NEC 2014 and later
            editions — the older "bedrooms only" rule (NEC 2002) was widened progressively as the underlying UL 1699
            firmware got better at distinguishing legitimate switching noise from real arc signatures. The reason
            arc-fault protection started in bedrooms was statistical: residential fire-investigation data through the
            1990s found the highest concentration of arc-initiated fires originated from cord damage and loose
            connections in sleeping areas, where occupants were less likely to notice early
            warning signs<Cite id="nec-2023" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What's the difference between an MWBC (multi-wire branch circuit) and two separate circuits?">
          <p>
            A {' '}<Term def={<><strong className="text-text font-medium">MWBC</strong> (multi-wire branch circuit) — two ungrounded conductors on opposite phases (one on L1, one on L2) sharing a single neutral conductor. The two hot currents are 180° out of phase, so the neutral carries the difference rather than the sum, allowing a single 3-conductor cable to power two 120 V branches. NEC 210.4 requires handle-tied breakers and pigtailed neutrals.</>}>MWBC</Term>{' '}
            puts two hot conductors (one on L1, one on L2) and one shared neutral conductor in a single cable, feeding
            two 120 V branches that happen to share the neutral. Because L1 and L2 are 180° out of phase, the neutral
            carries the difference of the two branch currents rather than the sum — which lets one cable do the work
            of two. NEC 210.4 then layers in the safety requirements: the two hot breakers must be
            handle-tied so that working on either branch de-energises both, and every neutral splice must be pigtailed
            (never daisy-chained through a device) so that a single device replacement does not break the shared neutral
            and leave one branch's neutral floating at line voltage<Cite id="nec-2023" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Can I share a neutral between two 120 V circuits?">
          <p>
            Only as an MWBC, with the constraints above: opposite phases for the two hots, handle-tied breakers, and
            pigtailed neutrals at every device. You cannot share a neutral between two circuits that happen to land on
            the same phase — their currents would add in the neutral instead of subtracting, overloading a single 14
            or 12 AWG conductor with the sum of two 15 or 20 A loads<Cite id="nec-2023" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why is the breaker rated by the wire's ampacity instead of the load's amp draw?">
          <p>
            Because the load can change. A 20 A circuit might feed a 5 A lamp today and a 18 A space heater tomorrow;
            the wire in the wall is the same wire either way. The breaker has one job — protect that wire from
            sustained overcurrent — and the breaker rating tracks the wire's worst-case allowable current, not the
            transient demand of whatever happens to be plugged in. This is the inversion that surprises first-time
            installers, but it is the only consistent rule: every fixed piece of the installation (wire, breaker, box)
            is sized by ampacity; only the load at the end is sized by demand.
          </p>
        </FAQItem>

        <FAQItem q="Why is voltage drop a 'recommendation' instead of a code requirement?">
          <p>
            NEC 210.19 calls voltage drop an "Informational Note" rather than a binding rule because the cost of
            enforcing it varies wildly with the building's geometry, and the safety case is weak — excessive voltage
            drop is a performance issue (dim lights, slow motor starts, brownout-stressed electronics) rather than a
            fire-or-shock issue. The 3% recommendation has the force of best practice and most jurisdictions enforce
            it locally, but the national code stops at recommending<Cite id="nec-2023" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What's the difference between NEC 60 °C, 75 °C, and 90 °C column ampacities?">
          <p>
            NEC Table 310.16 tabulates conductor ampacity at three insulation temperature ratings. A 75 °C-rated
            insulation will safely tolerate a higher steady-state current than a 60 °C insulation because the
            conductor itself can run hotter without the surrounding insulation breaking down. Residential terminations
            (the screws inside breakers and receptacles) are listed at 60 °C for any conductor 100 A or less, so the
            60 °C column is the binding limit regardless of what column the wire's insulation actually supports —
            the joint is only as hot-tolerant as its weakest link<Cite id="nec-2023" in={SOURCES} />. 90 °C
            column ampacity is used for the derating arithmetic only (the conductor can be derated for ambient
            temperature and conduit fill from the 90 °C value), not for direct sizing against terminations.
          </p>
        </FAQItem>

        <FAQItem q="Can I run NM-B in a basement workshop?">
          <p>
            Yes, provided the basement is a dry location and the workshop activity does not subject the cable to
            physical damage. NEC 334.10 allows NM-B in single-family and two-family dwellings without restriction, and
            in multi-family construction up to three storeys above grade. The places where NM-B is barred are
            commercial occupancies, locations subject to physical damage (where it would need to be inside conduit or
            replaced with MC), and damp or wet locations (where it would need to be UF-B instead, the underground-rated
            variant)<Cite id="nec-2023" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why is the panel ground bar separate from the neutral bar in a subpanel?">
          <p>
            Because of the no-bond rule of Ch.28: neutral and ground are bonded together in exactly one place per
            premises, at the main disconnect, and never again. At a subpanel, bonding them again would put steady-state
            return current on the equipment-grounding conductor between the two panels, energising every metal box
            and conduit run on the way. The no-bond rule keeps return current on the conductor it was assigned to and
            reserves the bare ground conductor for actual faults<Cite id="nec-2023" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What if I use 14 AWG by mistake on a 20 A breaker?">
          <p>
            The circuit will work fine until it doesn't. 14 AWG copper is rated for 15 A; under a sustained 18 A load
            (which is well within a 20 A breaker's trip curve) the wire will run hotter than its 60 °C insulation was
            designed for, the insulation slowly degrades, and eventually the conductor either shorts to ground inside
            the wall (best case — the breaker trips) or ignites the surrounding lumber (worst case). The error is
            invisible to anyone reading from the panel side because the breaker label says 20 A and the receptacle
            looks normal. This is exactly the failure mode NEC 240.4(D) is written to prevent, and a competent home
            inspection will catch it<Cite id="nec-2023" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Do I need a permit to add an outlet?">
          <p>
            In almost every U.S. jurisdiction, yes — adding a new branch circuit (including a new outlet on a new
            run) requires an electrical permit and at least one inspection by the local authority having jurisdiction.
            Replacing an existing outlet in place generally does not. Permit fees vary widely; the inspection is the
            useful part, because it forces a fresh set of eyes onto the box-fill arithmetic, the cable support
            spacing, and the panel landing. The NEC itself does not impose permit requirements — those are layered in
            by state and local building codes that adopt the NEC by reference.
          </p>
        </FAQItem>

        <FAQItem q="What is a 'continuous load' exactly, and when does the 125% multiplier apply?">
          <p>
            NEC 100 defines a continuous load as one expected to be on at maximum current for three hours or more. The
            classic examples are EV chargers, electric tankless water heaters, commercial lighting, and continuous
            commercial space heating. NEC 210.19(A)(1)(a) requires the branch-circuit conductor (and the breaker) to
            be sized to 125% of the continuous-load current. A 24 A continuous load therefore needs a 30 A conductor
            and a 30 A breaker, not a 25 A breaker that "just barely" covers it<Cite id="nec-2023" in={SOURCES} />.
            Residential receptacles for cord-and-plug appliances are almost never counted as continuous because the
            occupant cycles them; hardwired appliances often are.
          </p>
        </FAQItem>

        <FAQItem q="What does the panel slot's L1/L2 stamping matter for a single-pole 120 V breaker?">
          <p>
            For a single-pole 120 V branch it does not matter — both L1 and L2 are at 120 V to neutral and either bus
            stab will feed the breaker correctly. The L1/L2 alternation matters for two-pole 240 V breakers (which
            must straddle one stab from each bus, automatically getting 240 V line-to-line) and for MWBCs (whose two
            hots must land on opposite phases so the shared neutral carries the difference rather than the sum). For
            an ordinary single-pole branch the only choice is which open slot is mechanically convenient<Cite id="nec-2023" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="How is the 125% continuous-load multiplier related to the breaker's time-current curve?">
          <p>
            A thermal-magnetic breaker's time-current curve (Ch.28) is asymptotic to its rated current — a 20 A
            breaker held at 20 A continuously sits right at the knee where insulation breakdown of the conductor and
            mechanical fatigue of the bimetallic strip both become real. NEC's 125% multiplier (so a continuous load
            of 16 A or less uses a 20 A breaker, but a continuous 17 A load needs a 25 A or 30 A) backs the working
            point off that knee — by sizing the breaker 25% higher than the sustained load, the breaker sits comfortably
            on the flat portion of its curve where nothing fatigues<Cite id="nec-2023" in={SOURCES} />. The same
            multiplier is why every commercial-lighting load is sized at 1.25× and why EV chargers always get oversized
            breakers relative to their nameplate current<Cite id="grainger-power-systems-2003" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why is every current on every label in this chapter still a count of CODATA elementary charges?">
          <p>
            Because amperes are by definition a count of charges per second, and the elementary charge is set by
            CODATA at <em className="italic text-text">e</em> = 1.602176634×10⁻¹⁹ C exactly<Cite id="codata-2018" in={SOURCES} />. A 20 A branch
            therefore carries 20 / 1.602×10⁻¹⁹ ≈ 1.25×10²⁰ electrons through its cross section every second. The 220.82
            demand calc, the 125% continuous multiplier, the 5 mA GFCI threshold, and the 14 V drop at the end of a long
            run all reduce to counts of that constant. Every other unit in the NEC is layered on top of it.
          </p>
        </FAQItem>
      </FAQ>
    </ChapterShell>
  );
}
