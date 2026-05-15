/**
 * Chapter 39 — Outdoor, wet locations, and EV chargers
 *
 * Fifth chapter of the DIY-with-theory arc. Builds on Ch.31's big-load
 * primer (EVSE, NEMA 14-50, P = VI) and Ch.32's body-current threshold
 * ladder + equipotential argument. Thesis: outdoors and underwater the
 * NEC stops trusting the human at the end of the cord, and every wet-
 * location rule — WR/TR receptacles, in-use covers, the 1.5 m bonded
 * grid around a pool, the within-sight disconnect on a hot tub, the
 * 20 mA UL 2231 GFI inside an EVSE — is calibrated to keep current
 * below 5 mA even with worst-case body resistance.
 *
 * Seven H2 sections, one Pullout, ~14 Term tags, 5 TryIt exercises,
 * 3 CaseStudy cards, 13 FAQ items. Citations restricted to the chapter
 * whitelist: nec-2023, sae-j1772, ul-2231, iec-62196, iec-60479-2018,
 * codata-2018.
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

export default function Ch39HouseOutdoorWet() {
  const chapter = getChapter('house-outdoor-wet')!;
  const SOURCES = chapter.sources;

  return (
    <ChapterShell chapter={chapter}>
      <p className="chapter-intro">
        A swimming-pool installer kneels on the deck slab with a spool of #8 solid copper, a crimper, and a list of
        every metal object within a metre and a half of the water: the aluminum ladder, the chrome handrail, the
        diving-board mount, the underwater light's brass forming shell, the steel rebar in the deck slab, the metal
        skimmer baskets, the pump-motor housing twenty feet away in the equipment shed, and — because the property
        line runs close — a section of chain-link fence on the south side. Every single one will be tied together by
        the time the day is out. The bonds will not loop back to the service panel's ground bus or to a driven ground
        rod. They are not connected to earth at all in the literal sense. They are connected to <em className="italic text-text">each other</em>,
        and only to each other, forming a single conductive island around the pool.
      </p>
      <p className="mb-prose-3">
        The reason this looks like sloppy redundancy and is not has nothing to do with shorting the pool to ground in
        case of a fault. It has everything to do with Ch.32's threshold ladder. If a sealed underwater light's gasket
        fails next summer and the 12 V secondary (or, in older installations, a leaking 120 V niche) energises the
        water at, say, +50 V relative to local soil, a swimmer climbing out reaches one wet hand to the ladder. With
        the ladder bonded to the same island as the water, both surfaces are at +50 V; the swimmer's body sees zero
        volts across it and zero current through it. With the ladder bonded only to a remote earth electrode at 0 V,
        the swimmer's hand-on-ladder + foot-in-water bridges 50 V across their body, which at wet contact resistance
        of ~1.5 kΩ is over 30 mA hand-to-foot for as long as it takes them to let go — squarely in IEC 60479-1 zone
        AC-3<Cite id="iec-60479-2018" in={SOURCES} />. The bonded grid is Ch.32's equipotential principle taken
        literally and applied to one cubic metre of wet skin.
      </p>
      <p className="mb-prose-3">
        Outdoors, in pools, on hot tubs, and at the end of an EV charging cord, the NEC stops trusting humans
        entirely. The rules in NEC Articles 406, 411, 590, 625, and 680 — and the listing standards UL 2231 for EVSE
        personnel protection and IEC 62196 / SAE J1772 for the coupler that connects an EV to the wall — are all
        downstream of one observation: a person standing barefoot on damp soil with a wet cord in their hand has
        roughly 1 kΩ of body resistance, and at 120 V that is 120 mA, which at one second of exposure is fatal in a
        healthy adult<Cite id="iec-60479-2018" in={SOURCES} />. Every rule in this chapter is a calibration against
        that one number.
      </p>

      <h2 className="chapter-h2">WR and TR receptacles, and the in-use cover</h2>

      <p className="mb-prose-3">
        A receptacle mounted on the exterior wall of a house lives in a fundamentally different environment from
        one in a bedroom. Direct sun cycles the face plate's surface temperature from −20°C in January to +60°C in
        July; ultraviolet flux degrades the plastic; horizontal driving rain pushes water across the face; and an
        appliance cord left plugged in (a holiday-light string, a pond pump, an EV trickle charger) keeps the cover
        propped open for months at a time. The receptacle that the NEC permits at this location is a specific
        listed device with two extra letters stamped on the face: <em className="italic text-text">WR</em> and <em className="italic text-text">TR</em>.
      </p>
      <p className="mb-prose-3">
        A
        {' '}<Term def={<><strong className="text-text font-medium">WR receptacle</strong> — a weather-resistant receptacle whose body plastic, face plastic, and brass contacts are formulated and finished to resist UV, temperature cycling, and corrosion. Required by NEC 406.9 for all damp- and wet-location receptacles installed outdoors.</>}>WR receptacle</Term>{' '}
        (weather-resistant) is built from UV-stabilised thermoplastic for the face and a corrosion-resistant
        plating on the brass strap and contacts. Its internal materials test to a UL temperature-and-humidity cycle
        that an ordinary indoor receptacle would not survive. A
        {' '}<Term def={<><strong className="text-text font-medium">TR receptacle</strong> — a tamper-resistant receptacle with internal shutters that block single-prong insertion. Required by NEC 406.12 in dwelling-unit receptacles; the shutters open only when both prongs of a plug push simultaneously.</>}>TR receptacle</Term>{' '}
        (tamper-resistant) has internal sprung shutters behind each blade slot that only retract when both blades
        of a plug push simultaneously; a single-prong intrusion — a paper clip, a fork tine, a curious toddler's
        finger — slides off the shutter without opening it. NEC 406.9 requires receptacles installed outdoors in
        damp or wet locations to carry both labels; the same article requires that <em className="italic text-text">every</em> 15 A and 20 A,
        125 V and 250 V receptacle in a dwelling unit be tamper-resistant unless specifically
        exempted<Cite id="nec-2023" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        Above the receptacle the second decision is the
        {' '}<Term def={<><strong className="text-text font-medium">in-use cover</strong> — a bell-shaped weatherproof cover that closes around an installed plug and cord, sealing the receptacle face whether or not something is plugged in. Required by NEC 406.9(B) where a cord-and-plug-connected load is expected to remain in place. Sometimes called a "while-in-use" or bubble cover.</>}>in-use cover</Term>.
        A flat weatherproof cover (the older listing) seals the receptacle only when nothing is plugged in; the
        moment a cord is inserted the cover swings open and the receptacle face is exposed to weather while in use.
        NEC 406.9(B) requires that receptacles in wet locations be enclosed by a cover that is weatherproof
        <em className="italic text-text"> whether or not the attachment plug cap is inserted</em>, which in practice means the bell-shaped or
        bubble-shaped in-use cover that closes around the plug body with an opening at the bottom for the
        cord<Cite id="nec-2023" in={SOURCES} />. Wet location is defined in NEC Article 100 by NEMA's enclosure
        rating system: roughly, anywhere subject to saturation with water or unprotected from weather is wet;
        anywhere subject to moderate moisture but protected from direct rain is damp.
      </p>
      <p className="mb-prose-3">
        The numbers behind the rule are blunt. A receptacle without an in-use cover, left propped open with a cord
        in service through a thunderstorm, can ingest enough water across the face to track between hot and neutral
        through the contaminated surface film. At 120 V across a wet surface track of even a few hundred kilohms,
        the leakage current is hundreds of microamperes — below the 5 mA GFCI trip — but cumulatively destructive
        to the device, and the next time a wet hand operates the plug the body becomes part of the leakage path.
        The in-use cover does not eliminate the failure mode; it pushes the probability of saturation low enough
        that the upstream GFCI required by NEC 210.8 has the headroom to do its job.
      </p>

      <TryIt
        tag="Try 39.1"
        question={
          <>
            An outdoor 120 V receptacle on the back porch is fitted with a flat (non-in-use) weatherproof cover and
            powers a holiday-light string for six weeks. During a wind-driven rainstorm the cover is propped open;
            water bridges hot to ground through a contaminated surface film with a measured resistance of{' '}
            <strong className="text-text font-medium">250 kΩ</strong>. What is the leakage current, and will the upstream GFCI trip?
          </>
        }
        hint={<>Apply I = V/R from Ch.32, then compare to the 5 mA GFCI threshold.</>}
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">Ohm's law across the wet surface track:</p>
            <Formula>I = V / R = 120 V / 250 000 Ω = 0.48 mA</Formula>
            <p className="mb-prose-1 last:mb-0">
              Below the 5 mA / 25 ms GFCI threshold by an order of magnitude<Cite id="nec-2023" in={SOURCES} />.
              The breaker does not trip; the leakage continues. Over weeks the surface film carbonises and the
              track resistance falls — and eventually either the GFCI does trip (good) or the track flashes over
              and the panel breaker clears a parallel arc (bad). The in-use cover would have prevented the wet
              track from forming in the first place. Answer: <strong className="text-text font-medium">0.48 mA</strong>, <strong className="text-text font-medium">no trip</strong>;
              this is exactly the failure mode the NEC 406.9(B) cover rule prevents.
            </p>
          </>
        }
      />

      <h2 className="chapter-h2">The 1.5 m equipotential bonding grid</h2>

      <p className="mb-prose-3">
        NEC Article 680 governs swimming pools, spas, hot tubs, fountains, and similar installations, and its
        single most important provision is 680.26 — the equipotential bonding requirement. The article defines a
        {' '}<Term def={<><strong className="text-text font-medium">perimeter surface</strong> — the area within 1 metre (NEC 680.26 uses 3 ft, which is essentially the same) of the inside walls of a pool, measured horizontally; the requirement extends in every direction including vertically. All conductive parts within this surface must be bonded together.</>}>perimeter surface</Term>{' '}
        that extends three feet (roughly 1 m; the chapter's "1.5 m" rule of thumb captures spas and the slightly
        larger Article 680 commercial-pool perimeter) outward from the pool wall in every direction, including
        upward, and requires that
        {' '}<em className="italic text-text">every</em> conductive surface inside that volume be bonded together with a continuous No. 8 AWG
        solid copper conductor<Cite id="nec-2023" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        The bonded set, per NEC 680.26(B), is comprehensive: the pool's reinforcing steel (rebar in cast concrete,
        the bonded wire mesh of a vinyl-liner pool); metal forming shells of underwater luminaires; perimeter
        handrails, ladders, and diving-board mounts; metal fittings of any kind in or on the pool structure; pump
        motors and other electrical equipment associated with the pool; the
        {' '}<Term def={<><strong className="text-text font-medium">equipotential bonding grid</strong> — the network of bonded conductive surfaces around a pool, mandated by NEC 680.26 to eliminate voltage differences within reach of a swimmer. Bonded by a continuous No. 8 AWG solid copper conductor; the grid is bonded to each pool fitting and to the rebar mat, but is not itself grounded to earth — that is deliberate.</>}>equipotential bonding grid</Term>{' '}
        of the deck slab (a wire mesh or the rebar mat itself); conductive deck cladding within the perimeter; and
        any other conductive surface (metal awning posts, fence sections, drain covers) within reach of a person
        standing in or at the edge of the pool<Cite id="nec-2023" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        The argument behind the rule is exactly the argument from Ch.32. Consider what happens when a faulted
        component — a pump motor whose winding has shorted to its housing, or a pool light whose niche has filled
        with water — energises the water at some potential V<sub>fault</sub> relative to local soil. The
        {' '}<Term def={<><strong className="text-text font-medium">step potential</strong> — the voltage difference between two contact points on a body (most commonly between two feet on energised soil, or between a hand on one bonded surface and a foot on another). The hazard a bonded grid eliminates is the touch-and-step potential between a swimmer's hand on a fitting and a foot on the bottom or on the deck.</>}>step (or touch) potential</Term>{' '}
        across a swimmer who has one hand on an unbonded ladder and one foot on the pool floor is the difference
        of those two surface potentials, which without bonding can be a large fraction of V<sub>fault</sub>. The
        current through the swimmer is then
      </p>
      <Formula>I<sub>body</sub> = (V<sub>water</sub> − V<sub>ladder</sub>) / R<sub>body</sub></Formula>
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">I<sub>body</sub></strong> is the current through the swimmer (in amperes), <strong className="text-text font-medium">
        V<sub>water</sub></strong> is the potential the fault has imposed on the pool water (in volts),
        <strong className="text-text font-medium"> V<sub>ladder</sub></strong> is the potential of the metal the swimmer is gripping (in volts), and
        <strong className="text-text font-medium"> R<sub>body</sub></strong> is the
        {' '}<Term def={<><strong className="text-text font-medium">body resistance</strong> — the total resistance from one contact point to another through a human body. Wet hand-to-foot contact in pool water with broken skin and large contact area drops to roughly 1 kΩ; the value Ch.32 used for worst-case dry contact was 100 kΩ. The two-decade range is the gap between "tingle" and "fatal."</>}>body resistance</Term>{' '}
        with both contacts wet and one of them in pool water (in ohms; per IEC 60479-1, around 1.0 to 1.5 kΩ for
        large-area wet contact)<Cite id="iec-60479-2018" in={SOURCES} />. With the ladder bonded to the water
        through the perimeter grid, V<sub>water</sub> = V<sub>ladder</sub> by construction, and I<sub>body</sub>
        is zero regardless of how large V<sub>fault</sub> is. Without the bond, even a 50 V fault is fatal.
      </p>
      <p className="mb-prose-3">
        The same calculation appears in a more familiar context as the soil
        {' '}<Term def={<><strong className="text-text font-medium">step potential (soil)</strong> — the voltage drop across the metre of damp earth between a person's two feet when fault current spreads radially from a grounding electrode. Different from the touch potential inside a bonded pool grid, but the same physics.</>}>step-potential</Term>{' '}
        formula for someone walking near a faulted ground rod or downed conductor:
      </p>
      <Formula>V<sub>step</sub> = E × Δd<sub>step</sub></Formula>
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">V<sub>step</sub></strong> is the voltage difference across the gait between the two feet
        (in volts), <strong className="text-text font-medium">E</strong> is the local potential gradient in the soil surface around the fault (in
        volts per metre), and <strong className="text-text font-medium">Δd<sub>step</sub></strong> is the distance between the two feet (in metres;
        roughly 0.7 m for a normal walking gait). For a 10 kA ground-fault depositing into damp soil through a
        single rod, the spreading resistance can produce E ≈ 1 kV/m within a metre of the rod, giving
        V<sub>step</sub> ≈ 700 V across the gait — orders of magnitude above the let-go threshold and fatal at
        practically any contact resistance<Cite id="iec-60479-2018" in={SOURCES} />. The whole purpose of the
        680.26 grid is to drive E to zero inside the volume the swimmer can occupy. No gradient, no step
        potential, no current.
      </p>
      <p className="mb-prose-3">
        Two construction details worth noting. The bond is #8 <em className="italic text-text">solid</em> copper, not stranded — solid wire
        resists pull-out from the brass split-bolts and grounding lugs used at each fitting, and resists damage
        from the abrasion of being buried in deck-slab concrete<Cite id="nec-2023" in={SOURCES} />. And the bond
        is <em className="italic text-text">not</em> the same as a grounding conductor: it does not need to return to the service-panel
        ground bus. The fittings inside the pool are still grounded through their branch-circuit equipment
        grounding conductors (separate copper, often a green-insulated #12 inside the same conduit run as the
        light's hot and neutral), but the 680.26 bond is a separate parallel network whose only job is to
        force every metal surface inside the perimeter to the same potential.
      </p>

      <TryIt
        tag="Try 39.2"
        question={
          <>
            A faulted pool light energises the pool water at <strong className="text-text font-medium">+20 V</strong> relative to local soil. The
            aluminum ladder, which should have been bonded to the perimeter grid, has lost continuity at one #8
            split-bolt that corroded through over five winters; the ladder is now connected only to the deck
            slab's rebar mat via its mounting bolts and sits at roughly <strong className="text-text font-medium">+2 V</strong>. A swimmer's
            hand-on-ladder and foot-on-the-bottom-step bridges the gap. Wet hand-to-foot body resistance is{' '}
            <strong className="text-text font-medium">2 kΩ</strong>. Compute the current and identify the IEC 60479-1 zone at one second of exposure.
          </>
        }
        hint={<>Use the I_body formula above; check Ch.32's zone ladder.</>}
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">Voltage across the swimmer is the difference between the two surface potentials:</p>
            <Formula>ΔV = 20 V − 2 V = 18 V</Formula>
            <Formula>I = ΔV / R = 18 / 2 000 = 9 mA</Formula>
            <p className="mb-prose-1 last:mb-0">
              Nine milliamperes hand-to-foot at one second sits inside IEC 60479-1 zone AC-2 — the let-go threshold
              region<Cite id="iec-60479-2018" in={SOURCES} />. The swimmer can probably release the ladder, but
              not certainly; a smaller swimmer (lower body mass, lower let-go threshold) might not. With the bond
              intact, ΔV would have been zero and I would have been zero. Answer: <strong className="text-text font-medium">9 mA</strong>,{' '}
              <strong className="text-text font-medium">zone AC-2</strong>. The corroded split-bolt converted a code-compliant installation into
              a let-go-threshold hazard. This is why the bond is solid copper and why every pool inspection
              continuity-tests the grid.
            </p>
          </>
        }
      />

      <h2 className="chapter-h2">NEC 210.8 — GFCI required where</h2>

      <p className="mb-prose-3">
        NEC Article 210.8 is the comprehensive list of locations where the 125 V receptacles must be
        {' '}<Term def={<><strong className="text-text font-medium">GFCI-protected</strong> — protected by a ground-fault circuit interrupter that trips at roughly 5 mA imbalance within about 25 ms. The list of required locations has expanded with nearly every NEC cycle since 1971 (bathrooms in 1975, kitchens in 1987, outdoors in 1996, basements and garages in 2008, the laundry receptacle in 2014, the dishwasher in 2017, all of the kitchen in 2020, the garage-floor receptacle without exception in 2023).</>}>GFCI-protected</Term>.
        The 2023 edition's list, in summary: bathrooms; kitchens (now <em className="italic text-text">all</em> 125 V receptacles in the
        kitchen, not only countertop); garages and accessory buildings; outdoors; crawl spaces at or below grade;
        unfinished basements; laundry areas; areas within 6 ft of a sink, bathtub, or shower outside the kitchen;
        dishwashers; boathouses; and indoor or outdoor pools, spas, hot tubs, and fountains under NEC Article 680
        cross-references<Cite id="nec-2023" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        Each entry on the list is a threat model. The bathroom is wet hands plus a grounded plumbing fixture
        within reach. The kitchen is wet hands plus a grounded metal sink and metal-cased appliances. The garage
        adds damp concrete and a hand-held power tool. The outdoor receptacle adds wind-driven rain and standing
        water. The laundry adds water leaks and a metal washer cabinet. The dishwasher's own receptacle
        (typically under the sink, factory cord-and-plug-connected) sees direct splash. Every one of these
        environments takes the body's contact resistance down by one or two orders of magnitude relative to the
        clean dry living-room baseline, and the upstream GFCI is the device that keeps the IEC 60479-1 operating
        point inside zone AC-1 regardless<Cite id="iec-60479-2018" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        The threshold itself — 5 mA imbalance, ~25 ms clearing — was derived in Ch.32 by locating that point on
        the IEC 60479-1 chart and reading off zone AC-1<Cite id="iec-60479-2018" in={SOURCES} />. Worth restating
        for this chapter's context: a GFCI installed in a wet location is not a different device from one
        installed in a kitchen. It is exactly the same listed product, doing exactly the same job, against
        exactly the same physiological calibration point. Outdoors, the in-use cover and the WR receptacle keep
        the front of the device dry enough that the GFCI's 5 mA differential threshold is not consumed by
        cumulative leakage; in a kitchen, the location away from the sink does the same. The threshold does not
        care where you are.
      </p>
      <p className="mb-prose-3">
        Two practical points. First, NEC 210.8(F) (added in 2020 and tightened in 2023) extends GFCI protection
        beyond receptacles to certain outdoor outlets serving hardwired equipment — air-conditioning condensers,
        heat-pump outdoor units, irrigation controllers — recognising that the threat model (wet, accessible
        metal cases) is the same whether a cord is involved or not<Cite id="nec-2023" in={SOURCES} />. Second,
        GFCI protection can be provided at the receptacle itself (a GFCI receptacle), at the breaker (a GFCI
        breaker, the only option when downstream receptacles must also be protected through the same circuit), or
        upstream and feed-through (a single GFCI receptacle near the panel protecting all downstream non-GFCI
        receptacles wired to its LOAD terminals). The protection physics is identical; the cost and the failure-mode
        diagnostics differ.
      </p>

      <h2 className="chapter-h2">Low-voltage landscape lighting</h2>

      <p className="mb-prose-3">
        Path lights, deck-step lights, pond-edge accents, and tree uplights in residential landscapes almost never
        run at 120 V. They run on a 12 V or 24 V secondary fed from a transformer mounted on an exterior wall
        beside a 120 V supply receptacle. The transformer is a listed Class 2 device whose output meets the
        {' '}<Term def={<><strong className="text-text font-medium">NEC 411</strong> — the National Electrical Code article governing low-voltage lighting systems (60 V or less). Specifies the listed-transformer requirement, the maximum secondary current, the permitted wiring methods, and the prohibition on installations within 3 m of a pool perimeter without supplemental protection.</>}>NEC 411</Term>{' '}
        criteria: nominally 30 V or less for wet locations (12 V is the universal choice), with the secondary
        current limited to a level the article's tables specify as inherently non-hazardous<Cite id="nec-2023" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        The reason this works as a safety strategy is the same reason a 9 V battery on your tongue tingles and a
        120 V outlet does not. Body current is V / R<sub>body</sub>, and at 12 V across the worst-case wet-skin
        resistance of about 1 kΩ the current is 12 mA — perceptible (zone AC-2) but below the fibrillation
        threshold of zone AC-3<Cite id="iec-60479-2018" in={SOURCES} />. At 12 V across realistic outdoor contact
        with intact skin (say 5 kΩ on a damp finger), the current is 2.4 mA — barely perceptible. The
        low-voltage transformer reduces hazard not by reducing total power (a path light running at 12 V × 3 A
        is moving the same 36 W as a 120 V × 0.3 A circuit) but by reducing the voltage available to drive
        current through a human, while the same total power is still delivered through proportionally
        higher cable current.
      </p>
      <p className="mb-prose-3">
        The wiring rules are correspondingly relaxed. NEC 411 allows the 12 V cable to be direct-buried at 6
        inches rather than the 24 inches required for 120 V residential branch circuits, provided the cable is
        listed for direct burial (typically a
        {' '}<Term def={<><strong className="text-text font-medium">UF-B cable</strong> — Underground Feeder cable, type B, with a sunlight-resistant outer jacket and listed for direct burial without conduit. The NEC's standard residential cable for buried branch circuits up to 600 V; in landscape-lighting installations it is sometimes replaced with manufacturer-specific 12 V landscape-lighting cable that is listed under NEC 411.</>}>UF-B cable</Term>{' '}
        or the manufacturer's purpose-listed landscape-lighting cable)<Cite id="nec-2023" in={SOURCES} />. The
        connection from the 120 V supply receptacle to the transformer is, of course, still 120 V wiring on a
        GFCI-protected outdoor outlet, with everything Article 210.8 requires for any outdoor receptacle. The
        relaxations apply only on the secondary side.
      </p>
      <p className="mb-prose-3">
        Two pitfalls. First, NEC 411.4(A) prohibits installing the 12 V luminaires within 3 m (10 ft) of the
        inside wall of a pool or fountain unless they are listed for direct submersion and bonded into the
        680.26 grid — the low-voltage relaxation does not paper over the equipotential physics of the previous
        section<Cite id="nec-2023" in={SOURCES} />. Second, voltage drop on the 12 V side matters enormously:
        a 200 W run on 50 m of 12 AWG landscape cable drops several volts over the run, dimming the far
        luminaires noticeably. The math is the same I²R loss from Ch.31, but the fractional drop relative to
        12 V is large in a way that the same drop relative to 120 V was not.
      </p>

      <h2 className="chapter-h2">Hot tubs and spas: NEC 680 Part IV</h2>

      <p className="mb-prose-3">
        A residential hot tub is electrically a small pool. NEC 680 Part IV (Articles 680.40–680.43) applies all
        the same 1.5 m equipotential bonding logic — metal cabinet, motor housing, gas-fitting metal, perimeter
        rebar in the slab if any — and layers on three additional rules that reflect the geometry of a tub rather
        than a pool: a within-sight disconnect, a 50 A 240 V branch circuit, and a four-wire connection method.
      </p>
      <p className="mb-prose-3">
        The
        {' '}<Term def={<><strong className="text-text font-medium">NEC 680.42 within-sight disconnect</strong> — a single means of disconnection (a non-fused safety switch or a panel breaker) installed within sight and at least 1.5 m (5 ft) from the inside wall of a spa, so that an emergency responder or maintenance technician can de-energise the tub from a point that does not require reaching across the water. NEC 680.42(B) gives the exact distances and constraints.</>}>within-sight disconnect</Term>{' '}
        rule of NEC 680.42(B) requires a means of disconnection that is visible from the tub and located at
        least 1.5 m (5 ft) from the inside wall of the tub, so that a maintenance technician working on the
        equipment or a bystander reacting to an emergency can open the circuit without reaching across the
        water<Cite id="nec-2023" in={SOURCES} />. In practice this is a small weatherproof safety switch (a
        non-fused disconnect) bolted to the wall a few feet from the tub. The switch can also serve as the
        load-side GFCI device — there are listed GFCI-equipped spa disconnects that combine both functions in
        one box.
      </p>
      <p className="mb-prose-3">
        The current draw of a typical residential hot tub — heater, two pumps, sometimes a blower — runs 40 to
        50 A continuous on 240 V, which sets the branch-circuit ampacity at the NEC's 125% continuous-load
        adjustment from Ch.29 and Ch.31<Cite id="nec-2023" in={SOURCES} />. A 50 A breaker on 6 AWG copper
        (NEC Table 310.16 at 75°C termination, 55 A ampacity) is the canonical configuration. The connection is
        four-wire — L1, L2, neutral, ground — because the tub's control electronics, pump capacitors, and any
        light run from 120 V derived between either hot and neutral, even though the heater itself sits across
        the full 240 V. (Some pure-heater tubs without 120 V loads can be wired three-wire, no neutral, but the
        modern microcontroller-based control board is universal and the four-wire configuration is standard.)
      </p>
      <p className="mb-prose-3">
        And critically: hot tubs are
        {' '}<em className="italic text-text">hardwired</em>, not cord-and-plug-connected, with the wiring entering the tub's equipment
        compartment through a listed liquid-tight conduit (LFNC or LFMC) and terminating on the manufacturer's
        terminal block. A cord-and-plug connection is not permitted by NEC 680.42(A)(2) for permanently-installed
        spas; the few "plug-in" tubs on the market are listed Self-Contained Spas under a different sub-article
        with their own integrated cord and GFCI, and they are not the residential-installation default<Cite id="nec-2023" in={SOURCES} />.
      </p>

      <TryIt
        tag="Try 39.3"
        question={
          <>
            A residential hot tub draws <strong className="text-text font-medium">35 A continuous</strong> at 240 V. Size the branch-circuit breaker
            (apply NEC's 125% continuous-load rule), the copper conductor at 75°C termination, and identify
            whether the connection is three-wire or four-wire.
          </>
        }
        hint={<>Multiply continuous current by 1.25 and round up to a standard breaker size; consult Ch.29's NEC
        Table 310.16 ampacity for 75°C copper.</>}
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">Apply the continuous-load multiplier:</p>
            <Formula>I_breaker_min = 1.25 × 35 = 43.75 A</Formula>
            <p className="mb-prose-1 last:mb-0">
              Round up to the next standard size, which is <strong className="text-text font-medium">50 A</strong>. The conductor must have
              ampacity at least 43.75 A at the 75°C termination; per NEC Table 310.16, <strong className="text-text font-medium">8 AWG copper
              </strong> at 75°C is rated 50 A and satisfies both the breaker and the 125% rule<Cite id="nec-2023" in={SOURCES} />.
              Tubs with integrated 120 V control electronics need <strong className="text-text font-medium">four-wire</strong> (L1, L2, neutral,
              ground); the connection enters the tub through liquid-tight conduit and terminates on the
              manufacturer's block. Plus a 50 A 240 V GFCI breaker or load-side GFCI disconnect within sight per
              NEC 680.42(B)<Cite id="nec-2023" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2 className="chapter-h2">EV chargers: Level 2 in detail</h2>

      <p className="mb-prose-3">
        Ch.31 introduced the three charging levels and the J1772 / CCS / NACS coupler ecosystem. This section
        digs into the installation-grade decisions a homeowner makes when adding a Level 2
        {' '}<Term def={<><strong className="text-text font-medium">EVSE</strong> (Electric Vehicle Supply Equipment) — the wall-mounted unit that provides AC power, a J1772 or NACS coupler, ground-fault detection, and a control-pilot signal to the vehicle. The actual battery charger lives inside the car; the EVSE is a smart contactor with safety interlocks.</>}>EVSE</Term>{' '}
        to a garage or carport: hardwired versus plug-in, dedicated breaker size, four-wire versus three-wire,
        and the layered ground-fault protection peculiar to UL 2231 EVSEs.
      </p>
      <p className="mb-prose-3">
        A Level 2 EVSE is fundamentally a smart contactor. It does not transform voltage or rectify to DC (the
        actual charger is inside the vehicle's high-voltage battery system). It does three things: it switches
        L1 and L2 onto the cable when the vehicle requests power; it modulates a 1 kHz square-wave
        {' '}<Term def={<><strong className="text-text font-medium">control pilot</strong> — the 1 kHz square-wave signal on the J1772 connector's pilot pin, modulated by the EVSE's duty cycle to advertise the maximum current the supply can deliver. SAE J1772 specifies the encoding: 6% = 6 A, 50% = 30 A, with two breakpoints; the vehicle reads the duty cycle and limits its onboard charger accordingly.</>}>control pilot</Term>{' '}
        signal on the J1772 coupler's pilot pin to advertise the available current to the vehicle (per SAE
        J1772's duty-cycle encoding: 50% duty cycle ≡ 30 A; 25% ≡ 15 A; etc.)<Cite id="sae-j1772" in={SOURCES} />;
        and it interrupts power on detection of a ground fault, lost pilot, or open
        {' '}<Term def={<><strong className="text-text font-medium">proximity pilot</strong> — the J1772 connector's separate pin that signals to the vehicle that the connector is fully seated, and to the EVSE that it has been physically grasped (some cables include a release-button microswitch on the proximity line so that grabbing the handle initiates a clean ramp-down before unlatching).</>}>proximity pilot</Term>{' '}
        connection<Cite id="sae-j1772" in={SOURCES} /><Cite id="iec-62196" in={SOURCES} />. The international
        equivalent IEC 62196 (Type 2 in Europe, Type 1 / J1772 in North America) defines the same control-pilot
        encoding at the standard level<Cite id="iec-62196" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        Power delivered to the vehicle's onboard charger is the standard split-phase product from Ch.31, modified
        by the small efficiency of the EVSE's contactor and pilot circuitry:
      </p>
      <Formula>P<sub>charge</sub> = V × I × η</Formula>
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">P<sub>charge</sub></strong> is the AC power delivered to the vehicle's onboard charger (in
        watts), <strong className="text-text font-medium">V</strong> is the line-to-line supply voltage at the EVSE (in volts, nominally 240 V on
        a North-American split-phase service), <strong className="text-text font-medium">I</strong> is the RMS current the EVSE has authorised the
        vehicle to draw via the control-pilot duty cycle (in amperes), and <strong className="text-text font-medium">η</strong> is the
        {' '}<Term def={<><strong className="text-text font-medium">EVSE efficiency</strong> — the ratio of AC power delivered to the vehicle's onboard charger to AC power drawn from the panel. For a Level 2 EVSE this is dominated by I²R loss in the contactor and the cable, plus a small overhead for the control electronics; values run from 0.92 to 0.97 depending on model and cable length.</>}>EVSE efficiency</Term>{' '}
        (dimensionless, typically 0.92–0.97 — the EVSE itself loses a few percent to contactor I²R drop, cable
        resistance, and standby electronics; the much larger AC-to-DC conversion loss happens downstream inside
        the car's onboard charger and does not appear in this expression). For 240 V × 40 A × 0.92 the EVSE
        delivers 8.83 kW of AC into the vehicle's onboard charger, which then loses another 5–10% converting
        to DC before reaching the battery cells<Cite id="sae-j1772" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        The branch-circuit sizing follows Ch.31's 125% continuous-load rule. The NEC defines EV charging as a
        continuous load by default<Cite id="nec-2023" in={SOURCES} />, so a 40 A EVSE requires a 50 A branch
        circuit (40 × 1.25 = 50). A 48 A EVSE requires a 60 A branch (48 × 1.25 = 60). The standard hardwired
        installations end up at 40 A on 6 AWG copper with a 50 A breaker, or 48 A on 6 AWG copper at 90°C
        terminations with a 60 A breaker — both fed from a dedicated double-pole position in the panel.
      </p>
      <p className="mb-prose-3">
        The
        {' '}<Term def={<><strong className="text-text font-medium">NEMA 14-50</strong> — a 50 A 125/250 V receptacle with two angled hot blades, a straight neutral, and a round ground. Required by NEC to be on a 50 A branch with 6 AWG copper. The de-facto standard for plug-in Level 2 EVSEs and for RV park pedestals; the same receptacle is found behind many electric ranges.</>}>NEMA 14-50</Term>{' '}
        receptacle on a 50 A 240 V circuit is the canonical
        {' '}<Term def={<><strong className="text-text font-medium">plug-in EVSE</strong> — a Level 2 EVSE terminated in a cord cap (NEMA 14-50, 14-30, or 6-50) rather than hardwired into a junction box. The cord cap allows the EVSE to be moved between locations — a second house, an RV park, a friend's garage — but the cord-and-plug connection is a code-recognised location to limit the EVSE to the receptacle's rating.</>}>plug-in EVSE</Term>{' '}
        installation. The EVSE plugs into the wall like a dryer, the receptacle and circuit are sized for 50 A
        continuous (so the EVSE is limited to 40 A draw per the 125% rule applied in reverse), and the EVSE is
        portable to any location with a matching receptacle — a campsite, an RV park, a second residence. The
        {' '}<Term def={<><strong className="text-text font-medium">hardwired EVSE</strong> — an EVSE permanently connected to the branch circuit by direct conduit-and-conductor termination on its internal terminal block. Cleaner, more reliable, supports higher continuous currents (up to 80 A in some models) without the heat dissipation of a plug-and-receptacle, but not portable.</>}>hardwired EVSE</Term>,
        in contrast, runs conduit directly into the unit's terminal block; it cannot be unplugged, but it
        supports higher continuous currents (some hardwired residential EVSEs are 48 A, 60 A, or even 80 A) and
        avoids the small but real failure mode of receptacle-to-plug heating at 40 A continuous over years of
        cycling. NEC 625.46 requires the hardwired connection to have a means of disconnection in sight of the
        EVSE for units over 60 A or over 150 V to ground<Cite id="nec-2023" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        The fourth wire is, again, about 120 V control loads. An EVSE with a Wi-Fi radio, a colour LCD, and a
        contactor coil rated for 120 V will draw a small standby current from L1-to-neutral; that EVSE is a
        four-wire (L1, L2, N, G) connection. An EVSE whose internal electronics are designed to run from
        L1-to-L2 across a small step-down transformer can be three-wire (L1, L2, G with no neutral); the
        manufacturer's installation instructions state which configuration the model requires.
      </p>
      <p className="mb-prose-3">
        Layered on top of all of this is the EVSE's own internal ground-fault detector, listed under
        {' '}<Term def={<><strong className="text-text font-medium">UL 2231</strong> — the U.S. listing standard for personnel protection systems on EV charging equipment. Mandates an integrated ground-fault detector inside the EVSE that trips at roughly 20 mA on the AC side (looser than the 5 mA residential GFCI because the EVSE's vehicle-side circuit is permanently bonded and self-monitoring), with a clearing time on the order of 100 ms. Coexists with, and does not replace, an upstream 5 mA GFCI if one is required.</>}>UL 2231</Term>.
        UL 2231 mandates a personnel-protection ground-fault detector integral to the EVSE that monitors the
        vehicle-side AC circuit and trips when imbalance exceeds approximately 20 mA, in addition to the
        upstream residential GFCI on the supply<Cite id="ul-2231" in={SOURCES} />. The threshold is looser than
        the 5 mA residential GFCI because the EVSE's downstream loop is permanently bonded to the EVSE's
        ground reference and the vehicle's internal isolation monitor independently watches for HV-DC faults;
        the 20 mA threshold is calibrated to detect a real ground fault while rejecting the cumulative capacitive
        leakage of an electric vehicle's substantial Y-capacitor filter on its HV-DC bus<Cite id="ul-2231" in={SOURCES} /><Cite id="iec-62196" in={SOURCES} />.
        On a NEMA 14-50 plug-in installation, the upstream 50 A breaker is also required to be GFCI by NEC 625.54
        on the residential branch — and that breaker's 5 mA threshold is the one that protects against the
        person grasping a wet plug<Cite id="nec-2023" in={SOURCES} />.
      </p>

      <TryIt
        tag="Try 39.4"
        question={
          <>
            A new Level 2 EVSE is rated <strong className="text-text font-medium">40 A continuous</strong> and terminates in a NEMA 14-50 cord cap.
            What size breaker and what conductor does NEC require for the branch circuit? Why is the EVSE
            programmed to draw 32 A rather than 40 A on a 40 A unit's pilot signal?
          </>
        }
        hint={<>Apply 125% continuous-load to 40 A; then consider what the EVSE's pilot is advertising versus
        what NEC permits a 40 A unit to draw on the same circuit.</>}
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">
              The 40 A rating is the breaker the unit's <em className="italic text-text">own</em> NEMA 14-50 input circuit is sized for, by
              the same 125% rule:
            </p>
            <Formula>I_breaker = 1.25 × I_continuous</Formula>
            <p className="mb-prose-1 last:mb-0">
              A 40 A breaker permits a 32 A continuous draw (40 / 1.25 = 32). A 50 A breaker permits 40 A
              continuous. A NEMA 14-50 cord cap is sized for 50 A, so the branch is 50 A on 6 AWG copper, the
              EVSE pulls 40 A continuous, and its pilot duty cycle advertises 40 A to the vehicle. Models
              labelled "40 A" by the manufacturer are sometimes 32 A units pulled at the 80% factor — read the
              nameplate. Answer: <strong className="text-text font-medium">50 A breaker, 6 AWG copper</strong> for a true 40 A draw EVSE; some
              "40 A" units only draw 32 A and use a 40 A breaker with 8 AWG copper<Cite id="nec-2023" in={SOURCES} />.
            </p>
          </>
        }
      />

      <Pullout>
        Outdoors and underwater, NEC stops trusting the human at the end of the cord — every wet-location rule
        is calibrated to keep current under 5 mA even if the cord is severed and the human is barefoot.
      </Pullout>

      <TryIt
        tag="Try 39.5"
        question={
          <>
            An outdoor receptacle is mounted on the back of a house, <strong className="text-text font-medium">14 ft</strong> horizontally from the
            inside wall of an in-ground swimming pool. Is it required by NEC 210.8 to be GFCI-protected? Is an
            in-use cover required? And per NEC 680.22, can it stay at 14 ft or must it be moved?
          </>
        }
        hint={<>NEC 210.8 sets the GFCI requirement for outdoor receptacles; NEC 406.9 sets the in-use cover
        requirement; NEC 680.22 sets the minimum distance from the pool's inside wall.</>}
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">
              All three rules apply to outdoor pool-adjacent receptacles. NEC 210.8 requires GFCI for any 125 V
              receptacle installed outdoors regardless of proximity to a pool<Cite id="nec-2023" in={SOURCES} />.
              NEC 406.9(B) requires an in-use (bubble) cover whenever a cord-connected load is expected to remain
              in place, which is the default outdoor case<Cite id="nec-2023" in={SOURCES} />. NEC 680.22(A)(3)
              requires that a general-purpose receptacle for a pool dwelling be at least 6 ft (1.8 m) from the
              inside wall of the pool; 14 ft is well outside that minimum and the location is permitted. Note
              that NEC 680.22(A)(1) also <em className="italic text-text">requires</em> at least one receptacle on the property between 6 ft
              and 20 ft of the pool — the convenience-receptacle rule — and it must itself be GFCI-protected.
              Answer: <strong className="text-text font-medium">yes</strong> to GFCI, <strong className="text-text font-medium">yes</strong> to in-use cover, <strong className="text-text font-medium">14 ft is
              permitted</strong> per NEC 680.22(A)(3)<Cite id="nec-2023" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2 className="chapter-h2">The 200-to-225 A service upgrade</h2>

      <p className="mb-prose-3">
        The cumulative effect of electrification — adding a Level 2 EVSE, a heat pump, an induction range, a
        heat-pump water heater, sometimes a hot tub or a workshop — is that the existing 100 A or 125 A panel that
        sufficed for a gas-heated 1970s house runs out of dedicated breaker positions and runs out of demand-load
        headroom long before it runs out of physical space. The remedy is a service upgrade to 200 A or 225 A,
        and it is the cleanest dividing line between owner-permitted DIY and electrician-required work in the
        residential code.
      </p>
      <p className="mb-prose-3">
        NEC 230.42 sets the service-conductor ampacity for the calculated load per Article 220's demand
        calculation<Cite id="nec-2023" in={SOURCES} />. An all-electric house with an EVSE, heat pump, range,
        water heater, and dryer typically calculates to a demand load of 150–180 A even after Article 220's
        diversity factors, which puts it solidly above what a 100 A service can deliver. The path from there is:
        utility-coordinated shutoff at the meter base, removal of the old meter base and panel, installation of a
        new 200 A service-entrance conductor set (typically 4/0 aluminum or 2/0 copper from the drop or lateral),
        a new meter base, a new 200 A main breaker panel, sometimes a new mast and weatherhead if the existing
        mast is undersized, and re-termination of every branch circuit on new breakers in the new panel.
      </p>
      <p className="mb-prose-3">
        Costs in 2024–2026 dollars run $4 000–$8 000 for a residential service upgrade depending on whether the
        utility's drop conductors also need upsizing, whether the mast and meter base are replaced, and whether
        the panel relocation triggers any other code work (smoke detector additions in an unfinished basement,
        AFCI/GFCI breaker requirements that did not exist at the original install). The economics of the
        electrification arc — EVSE plus heat pump plus induction plus heat-pump water heater — typically justify
        the upgrade against the alternative of constant load-shedding management, but the labour is licensed-
        electrician and utility-coordinated work, not a weekend project.
      </p>
      <p className="mb-prose-3">
        A partial alternative for a borderline case is an
        {' '}<Term def={<><strong className="text-text font-medium">EVEMS</strong> (Electric Vehicle Energy Management System) — a load-management controller, listed under UL 916, that monitors the panel's total demand current and dynamically throttles the EVSE's pilot duty cycle to prevent the panel total from exceeding the service rating. Permits a 40 A EVSE on a panel that does not have 50 A of spare demand headroom, at the cost of slower or interrupted charging during peak household load.</>}>EVEMS</Term>{' '}
        — an Electric Vehicle Energy Management System that monitors the panel's total demand current and
        throttles the EVSE down (via the J1772 pilot duty cycle) when the rest of the household draw is high.
        NEC 625.42(A) recognises EVEMS as a permitted means of avoiding a service upgrade when the calculated
        load would otherwise exceed the service rating<Cite id="nec-2023" in={SOURCES} />. An EVEMS does not
        add capacity — it preserves the existing service by trading off some charging speed during peak
        household load — but it is the difference between needing a service upgrade and not, and at $300–600
        of additional EVSE-side hardware it is cheaper than the upgrade by an order of magnitude.
      </p>

      <CaseStudies
        intro={
          <>
            Three episodes — a missed bond around a pool, the hardwired-versus-plug-in EVSE decision for a typical
            garage, and a full service upgrade for an all-electric house — that show the wet-location and EV
            rules in action.
          </>
        }
      >
        <CaseStudy
          tag="Case 39.1"
          title="The DIY swimming-pool ladder bond"
          summary="The single corroded #8 split-bolt that converts a code-compliant pool into a let-go-threshold hazard."
          specs={[
            { label: 'Pool light secondary', value: <>12 V, sealed niche, factory-bonded fitting <Cite id="nec-2023" in={SOURCES} /></> },
            { label: 'Bond requirement', value: <>continuous No. 8 AWG solid copper around perimeter <Cite id="nec-2023" in={SOURCES} /></> },
            { label: 'Failure point', value: <>ladder split-bolt corroded through after five winters</> },
            { label: 'Fault scenario', value: <>seal failure energises water at +60 V relative to soil</> },
            { label: 'Swimmer body current', value: <>~30 mA hand-to-foot wet (zone AC-3 at 1 s) <Cite id="iec-60479-2018" in={SOURCES} /></> },
            { label: 'Remedy', value: <>continuity-test every bond annually; replace any corroded fitting</> },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            A homeowner installs a new aluminum ladder in their in-ground pool after the old galvanised one
            corroded out. The ladder comes with a brass grounding lug on its base, intended for the #8 perimeter
            bond per NEC 680.26. The homeowner — knowing the pool's pump motor and light niche are already
            grounded through their branch-circuit equipment grounding conductors — concludes that "the ladder is
            already grounded through the deck" and does not run #8 to the lug. The installation passes a casual
            look-over because the bonded grid was poured into the deck slab years before; the new ladder is
            simply not on it.
          </p>
          <p className="mb-prose-2 last:mb-0">
            Eighteen months later the pool light's gasket fails during winter freeze-thaw. The light's
            transformer (a Class 2 12 V supply, NEC 411 territory) energises the now-flooded niche, which puts
            12 V on the water. That is well below any threshold of concern — except that the transformer's case
            has a separate fault to its own 120 V primary that adds another 50 V of common-mode shift between the
            water and remote soil. The water sits at roughly +60 V. The ladder, bonded only to the deck slab
            (which is itself bonded to the rest of the perimeter grid <em className="italic text-text">except</em> for the omitted ladder
            link), sits at +60 V on its mounting bolts but at perhaps +5 V at the top rail because of a corroded
            joint at the bolt.
          </p>
          <p className="mb-prose-2 last:mb-0">
            The first swimmer of the season grabs the ladder's top rail with a wet hand while standing on the
            bottom step in 60 V water. ΔV is about 55 V across the body; at wet hand-to-foot resistance of
            ~1.5 kΩ, that is ~37 mA through the trunk for as long as it takes to let go — zone AC-3 at one second
            of exposure<Cite id="iec-60479-2018" in={SOURCES} />. The swimmer feels the let-go threshold lock
            their grip on the rail; another swimmer pulls them off; nobody dies. The pool inspector who comes out
            after the incident finds the missing #8 bond at the ladder lug and the failed light, and the homeowner
            installs the missing run with a brass split-bolt and crimped lug terminal. The remediation cost is
            $40 of wire and one hour of labour. The original omission saved 30 minutes of installation time.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 39.2"
          title="Hardwired vs plug-in Level-2 EVSE for a two-car garage"
          summary="The economics and code-compliance of the two installation paths."
          specs={[
            { label: 'EVSE option A', value: <>plug-in 40 A on NEMA 14-50, 50 A breaker, 6 AWG <Cite id="nec-2023" in={SOURCES} /></> },
            { label: 'EVSE option B', value: <>hardwired 48 A, 60 A breaker, 6 AWG at 75°C term <Cite id="nec-2023" in={SOURCES} /></> },
            { label: 'EVSE option C', value: <>hardwired 40 A with EVEMS, 50 A breaker, EVEMS on panel-current sensor <Cite id="nec-2023" in={SOURCES} /></> },
            { label: 'J1772 pilot duty cycle', value: <>40 A → 67% duty; 48 A → 80% duty <Cite id="sae-j1772" in={SOURCES} /></> },
            { label: 'UL 2231 internal GFI', value: <>20 mA trip on AC side, ~100 ms clearing <Cite id="ul-2231" in={SOURCES} /></> },
            { label: 'NEC 625.54 upstream GFCI', value: <>required for plug-in EVSEs at the supply receptacle <Cite id="nec-2023" in={SOURCES} /></> },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            A homeowner with a two-car garage and an existing 200 A panel is deciding between three Level 2 EVSE
            installations. Option A is a plug-in 40 A unit on a NEMA 14-50 receptacle, fed by a new 50 A double-pole
            breaker on 6 AWG copper in conduit from the panel to a wall-mounted receptacle. The EVSE bolts to the
            wall above and plugs in. NEC 625.54 requires the supply receptacle to be GFCI-protected — so the 50 A
            breaker in the panel is a GFCI breaker, not an ordinary thermal-magnetic<Cite id="nec-2023" in={SOURCES} />.
            Cost of materials around $400 for the breaker, conduit, conductor, receptacle, and box; labour another
            $300–500 if the panel is close to the garage wall.
          </p>
          <p className="mb-prose-2 last:mb-0">
            Option B is a hardwired 48 A unit (the next standard step up) on a 60 A breaker with the same 6 AWG
            run, but terminated directly into the EVSE's internal terminal block via liquid-tight flexible
            conduit. No receptacle. The 60 A breaker does not need to be GFCI — the UL 2231 detector inside the
            EVSE provides the personnel-protection function on the load side, and NEC 625.22 accepts the listed
            EVSE's internal protection in lieu of an upstream GFCI for hardwired
            installations<Cite id="nec-2023" in={SOURCES} /><Cite id="ul-2231" in={SOURCES} />. The hardwired
            unit delivers 11.5 kW (240 × 48 × 0.92 ≈ 10.6 kW into the onboard charger), about 20% more than the
            plug-in 40 A unit's 8.8 kW. For a 75 kWh EV the difference is roughly 30 minutes per 0–80% charge
            cycle. Cost is comparable to option A.
          </p>
          <p className="mb-prose-2 last:mb-0">
            Option C is for a borderline panel: a hardwired 40 A unit with an EVEMS load-management module on
            the panel's main-feeder CT. The EVEMS watches household demand current; when the dryer and electric
            oven and the dishwasher are running concurrently, it dynamically reduces the EVSE's J1772 pilot duty
            cycle to throttle the charger down from 40 A to as low as 6 A, preventing the panel total from
            crossing the 200 A main breaker's trip. Charging finishes overnight regardless; the maximum power
            simply does not all flow during peak household draw. NEC 625.42(A) explicitly permits this approach
            in lieu of a service upgrade<Cite id="nec-2023" in={SOURCES} />. The EVEMS module costs $300–600;
            the avoided service upgrade is $4 000–8 000. For most existing 200 A panels, option C is the
            obviously correct economic choice.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 39.3"
          title="A 200 A service upgrade for an all-electric retrofit"
          summary="What gets replaced, what coordinates with the utility, what the permit covers."
          specs={[
            { label: 'Old service', value: <>100 A, 1970s-era residential, gas heat / gas water / gas range</> },
            { label: 'New demand load', value: <>~170 A calculated per NEC 220.83 (heat pump + EVSE + induction range + HPWH) <Cite id="nec-2023" in={SOURCES} /></> },
            { label: 'New service', value: <>200 A, 4/0 aluminum SE conductors, new meter base, new mast</> },
            { label: 'Permit and inspection', value: <>building permit + electrical permit + utility coordination</> },
            { label: 'Approximate cost', value: <>$4 000–$8 000 2024–2026 USD</> },
            { label: 'Total downtime', value: <>4–8 hours for the cutover</> },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            A homeowner electrifies a 1973 gas-heated colonial: heat-pump replacement for the old gas furnace
            (8 kW backup electric resistance), heat-pump water heater (5 kW), induction range (10 kW peak),
            Level 2 EVSE (10 kW), and the existing dryer (5 kW). The Article 220.83 demand calculation for an
            existing dwelling unit comes out to roughly 170 A continuous, well above the 100 A
            service<Cite id="nec-2023" in={SOURCES} />. A service upgrade to 200 A is required before the heat
            pump can be installed.
          </p>
          <p className="mb-prose-2 last:mb-0">
            The electrician pulls the permit, the homeowner schedules a utility cutover, and on the appointed
            day the utility crew opens the drop at the pole at 8 AM. The electrician removes the old meter base,
            removes the old 100 A panel and saves every branch circuit's wires for re-termination, installs a
            new mast and weatherhead (the old galvanised steel mast was 2-inch and corroded at the cap; the new
            mast is 2.5-inch rigid aluminum), installs a new 200 A meter base, runs new 4/0 aluminum SE
            conductors from the meter base through the structure to the new panel location, installs a 200 A
            main-breaker panel, and re-terminates each branch circuit on a new breaker (most existing breakers
            cannot be re-used; the panel is a different manufacturer and the existing breakers' AFCI/GFCI
            statuses may not meet the 2023 code applied to the new
            installation)<Cite id="nec-2023" in={SOURCES} />. The utility re-energises at 4 PM and the inspector
            arrives the following morning for the final.
          </p>
          <p className="mb-prose-2 last:mb-0">
            Total cost in this case: $5 800. The homeowner now has 30 A of spare breaker capacity for future
            additions, a code-current panel with all-current AFCI and GFCI protection, and the headroom to add
            the heat pump and EVSE without an EVEMS retrofit. The break-even against EVEMS-plus-keep-old-panel
            is roughly the difference in projected EVSE downtime over the EVSE's 10-year service life — for a
            commuter who would otherwise charge overnight without ever hitting EVEMS throttling, the upgrade is
            pure overkill; for a household that runs three EVs and a hot tub, the upgrade pays for itself in
            convenience and avoided service calls.
          </p>
        </CaseStudy>
      </CaseStudies>

      <FAQ intro="Questions readers ask after the wet-location and EVSE sections.">
        <FAQItem q="Why does NEC require both GFCI AND a 1.5 m bond around a pool — isn't GFCI enough?">
          <p>
            They protect against different things. The upstream GFCI trips when current leaks out of the
            hot-neutral loop through a person or a wet fault path; the 1.5 m bond ensures that even when a fault
            persists for the 25 ms before the GFCI clears, no voltage difference appears across a swimmer's
            body<Cite id="nec-2023" in={SOURCES} /><Cite id="iec-60479-2018" in={SOURCES} />. The bond is also
            insurance against a fault the GFCI cannot see (a fault that does not exceed 5 mA but is on the same
            grid as the water, such as cumulative leakage from corroded fittings), and against the brief window
            during a GFCI's own self-test cycle when the device is briefly insensitive. Belt and suspenders is
            the right model for the perimeter of a pool.
          </p>
        </FAQItem>

        <FAQItem q="Can I run an extension cord from inside the house to an outdoor outlet?">
          <p>
            For temporary use, yes — NEC Article 590 governs temporary wiring including holiday lighting and
            short-duration tool use. For permanent power to anything, no: extension cords are not a substitute
            for permanent wiring, and an extension cord crossing a threshold or a doorway is a tripping hazard,
            a chafe hazard at the threshold seal, and a violation of NEC 400.12 if it is treated as permanent
            (NEC 400.12 prohibits flexible cord as a substitute for fixed wiring of a structure)<Cite id="nec-2023" in={SOURCES} />.
            If you need permanent power outdoors, the right answer is to add a properly wired outdoor receptacle
            with WR/TR/in-use cover and a GFCI per NEC 210.8.
          </p>
        </FAQItem>

        <FAQItem q="What's the difference between IP44 and IP67?">
          <p>
            The IEC 60529 IP (Ingress Protection) code has two digits: the first rates protection against solid
            objects (and dust), the second against liquids. IP44 means protection against solids ≥1 mm and
            splashing water from any direction. IP67 means dust-tight (no ingress at all) and protection against
            temporary immersion in water (typically 1 m for 30 minutes). For an outdoor receptacle face, IP44 is
            roughly equivalent to a flat weatherproof cover that seals against splash but not immersion; an in-use
            (bubble) cover serving an outdoor receptacle bumps the assembly toward IP55 or IP65 territory. The
            NEC does not use IP ratings directly but defers to UL listings and NEMA enclosure types, which
            cross-walk to IP codes with comparable but not identical criteria<Cite id="nec-2023" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why is the EVSE called a 'charger' when the charger is actually inside the car?">
          <p>
            Historical inertia plus marketing convenience. The actual rectifier-and-buck-converter that turns AC
            into the DC the battery cells require is inside the vehicle's onboard charger (Level 1 / Level 2) or
            inside an off-board DC fast charger (Level 3). The wall unit a homeowner installs is, formally,
            Electric Vehicle Supply Equipment — a smart contactor with control-pilot signalling, ground-fault
            detection, and a J1772 or NACS coupler. SAE J1772 uses the term "EVSE" throughout; consumer marketing
            uses "Level 2 charger" because nobody outside the engineering literature wants to say
            "EVSE"<Cite id="sae-j1772" in={SOURCES} />. The terminology will continue to drift.
          </p>
        </FAQItem>

        <FAQItem q="Can I plug a Level-2 EVSE into a NEMA 14-50 on the same circuit my dryer uses?">
          <p>
            Not legally and not safely. NEC 625.40 requires that an EVSE branch circuit supply only EV charging
            equipment — no other loads on the same circuit<Cite id="nec-2023" in={SOURCES} />. The reason is the
            125% continuous-load rule: a 40 A EVSE on a 50 A breaker uses 80% of the breaker's rating, and the
            dryer's intermittent 25–30 A would routinely trip the breaker on a simultaneous draw. Mechanically,
            the NEMA 14-50 receptacle also wears under repeated cord cycling, and sharing it with a dryer that
            is also cord-and-plug-connected wears the receptacle out at twice the rate. The right path is a
            second dedicated 50 A circuit for the EVSE.
          </p>
        </FAQItem>

        <FAQItem q="Why does NEC require a disconnect 'within sight' of a hot tub?">
          <p>
            So that a maintenance technician or an emergency responder can open the circuit from a point that
            does not require reaching across the water. NEC 680.42(B) requires the disconnect to be readily
            accessible, located at least 1.5 m (5 ft) from the inside wall of the tub, and visible from the tub
            location<Cite id="nec-2023" in={SOURCES} />. The principle is the same as the disconnect required
            within sight of a rooftop HVAC unit: a person working on the device should be able to confirm
            visually that the circuit is open without trusting a label or radioing a colleague to verify a
            breaker position.
          </p>
        </FAQItem>

        <FAQItem q="Can I bury NM-B cable underground if I run it in conduit?">
          <p>
            No. NM-B cable's listing prohibits installation in wet or damp locations, and the inside of a
            buried conduit is a wet location per NEC Article 100 regardless of whether water is currently
            present (condensation across temperature cycling is enough)<Cite id="nec-2023" in={SOURCES} />. The
            correct underground residential cable is either UF-B (Underground Feeder, type B, listed for direct
            burial without conduit) or THWN-2 conductors pulled inside buried conduit. UF-B can be direct-buried
            at the depths required by NEC 300.5 (typically 24 inches for 120 V branch circuits, less for 30 V
            landscape cable). Conduit alone does not convert a dry-rated cable into a wet-location one.
          </p>
        </FAQItem>

        <FAQItem q="What's the GFCI threshold for an industrial / 240 V circuit (vs the 5 mA residential)?">
          <p>
            For personnel protection (PP-GFCI) the threshold is the same 5 mA / 25 ms regardless of supply
            voltage, because the IEC 60479-1 calibration is set by the body, not by the supply<Cite id="iec-60479-2018" in={SOURCES} />.
            For equipment-protection ground-fault circuit interrupters (EPGFCI) — a separate device class used
            on hardwired industrial loads to protect cabling, not people — the threshold can be 20 mA, 30 mA, or
            higher depending on the equipment manufacturer's recommendations and the listing standard
            (UL 943B for higher-threshold class A devices). The 20 mA threshold inside an EVSE per UL 2231 is in
            the same category: it protects the vehicle-supply path against fault but is not the personnel-
            protection device<Cite id="ul-2231" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why is landscape lighting always 12 V — couldn't they just use 120 V?">
          <p>
            They could, and a few commercial landscape installations do (especially for high-output fixtures
            that draw too much current at 12 V to run long cables without voltage drop). For residential, 12 V
            is universal because NEC 411's relaxed wiring rules (shallow burial, no GFCI requirement on the
            secondary, no requirement for an in-use cover at each fixture) only apply at 30 V or less, and
            because the safety margin from Ch.32's body-current ladder is enormous at 12 V — even a wet
            hand-to-hand contact is barely perceptible<Cite id="nec-2023" in={SOURCES} /><Cite id="iec-60479-2018" in={SOURCES} />.
            The trade-off is voltage drop: a long 12 V run loses several volts to I²R, where the same wattage at
            120 V would lose a small fraction of a volt.
          </p>
        </FAQItem>

        <FAQItem q="Can I install a GFCI receptacle BEHIND a wet location instead of in it?">
          <p>
            Yes, in many cases — that is the feed-through configuration. A single GFCI receptacle installed in
            a dry indoor location can protect downstream receptacles in a wet outdoor location through its LOAD
            terminals, and NEC 210.8 accepts this as valid protection<Cite id="nec-2023" in={SOURCES} />. The
            downstream receptacles need only be WR/TR with the in-use cover; the GFCI logic is upstream and dry.
            The configuration is common in older retrofits where the wall thickness and box depth at the
            outdoor location does not accommodate a full GFCI receptacle but does accept a standard WR receptacle.
            The downside is that resetting requires walking back inside the house, which is sometimes a
            nuisance — but the protection physics is identical.
          </p>
        </FAQItem>

        <FAQItem q="Why does NEC 2023 change garage receptacle GFCI rules?">
          <p>
            Prior NEC cycles had narrow exceptions for receptacles serving a single dedicated appliance (a
            refrigerator in the garage, a freezer in the basement) where the wet-environment threat model was
            judged less acute than the false-trip nuisance. NEC 2023 removed most of those exceptions: <em className="italic text-text">all
            </em> 125 V garage and accessory-building receptacles must now be GFCI-protected without
            exception<Cite id="nec-2023" in={SOURCES} />. The rationale was that modern GFCI technology has
            essentially eliminated the false-trip problem (the early-1980s GFCIs had real nuisance trips on
            refrigerator inrush; the 2020s GFCIs do not), and the small remaining risk of a freezer being shut
            off by a tripped GFCI is more than offset by the elimination of the carve-out's cumulative
            ground-fault risk over the population of garages.
          </p>
        </FAQItem>

        <FAQItem q="Can I install an EV charger on a 100 A panel without an upgrade?">
          <p>
            Often yes, with one of two strategies. First, run the Article 220.83 demand calculation: an
            existing 100 A panel with a gas range and gas dryer often has 30–40 A of demand headroom that a 32 A
            EVSE on a 40 A breaker can occupy without violating NEC 230.42<Cite id="nec-2023" in={SOURCES} />.
            Second, install an EVEMS (Electric Vehicle Energy Management System) per NEC 625.42(A) that throttles
            the EVSE dynamically against measured panel current<Cite id="nec-2023" in={SOURCES} />. The EVEMS
            approach lets you install a 40 A or 48 A EVSE on a 100 A panel and depend on the EVEMS to keep the
            panel total below its rating during peak household draw. Slower charging during peak, full-speed
            charging overnight; for most commuters the difference is invisible.
          </p>
        </FAQItem>

        <FAQItem q="Why are pool perimeter bonds specifically #8 solid copper rather than something larger?">
          <p>
            Because the bond's job is to equalise potential, not to carry sustained fault current to a remote
            ground. NEC 680.26 specifies #8 solid copper as the minimum because solid wire resists pull-out
            from the split-bolts and lugs used at each fitting, because #8 has enough cross-section to survive
            decades of corrosion at outdoor joints, and because the bond is in parallel with the much lower
            impedance of the bonded pool water itself — once a fault energises the water, the water IS the bond
            conductor across the swimmer's body, and the #8 grid simply has to ensure that every metal
            surface stays at the same potential as the water<Cite id="nec-2023" in={SOURCES} />. Larger
            copper would not improve the equipotential function; it would simply cost more. The "more is more"
            instinct from grounding conductors does not apply to equipotential bonds.
          </p>
        </FAQItem>

        <FAQItem q="Why are the IEC 60479-1 threshold currents the same in every chapter of this book?">
          <p>
            Because they are a property of the human body, not of any particular electrical environment. The
            5 mA GFCI threshold from Ch.32 is the same 5 mA threshold the wet-location GFCIs in this chapter
            are calibrated to; the 1.5 kΩ wet body resistance from Ch.32 is the same value used to compute the
            pool-light fault current in this chapter; the 60 Hz fibrillation band from Ch.32 is what the
            within-sight hot-tub disconnect in this chapter is trying to keep current out of. The elementary
            charge in CODATA defines the count of charges per second that constitutes a milliampere; the
            IEC 60479 zones define which counts are tolerable<Cite id="codata-2018" in={SOURCES} /><Cite id="iec-60479-2018" in={SOURCES} />.
            Every wet-location and EV rule reduces to a calibration against those two references.
          </p>
        </FAQItem>
      </FAQ>
    </ChapterShell>
  );
}
