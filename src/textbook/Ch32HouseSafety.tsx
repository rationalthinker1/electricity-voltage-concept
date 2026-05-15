/**
 * Chapter 32 — Safety and what kills you
 *
 * The sixth chapter of the applied house-electricity track. Builds directly on
 * Ch.28's GFCI / AFCI discussion and Ch.29's branch-circuit prose. The thesis
 * is bleak and concrete: voltage gets the headlines, but current through the
 * chest is what kills. The IEC 60479 and Dalziel current-vs-time curves are
 * the actual safety standards; every other number in residential wiring
 * (the GFCI's 5 mA / 25 ms threshold, the AFCI's arc signature, NFPA 70E's
 * arc-flash categories) is calibrated against those curves.
 *
 * Six H2 sections: the body-current threshold ladder, the 60 Hz worst-case
 * frequency window, the GFCI's 5 mA / 25 ms standard, the AFCI's arc detection,
 * the bird-on-a-wire / equipotential principle, and arc-flash PPE.
 *
 * No new demo components — like Ch.28 and Ch.29 this is prose-heavy and
 * diagram-light by design. Safety chapters should not invite the reader to
 * play with sliders that map onto "how dead would you be."
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

export default function Ch32HouseSafety() {
  const chapter = getChapter('house-safety')!;
  const SOURCES = chapter.sources;

  return (
    <ChapterShell chapter={chapter}>
      <p className="mb-prose-3 first-letter:font-2 first-letter:font-light first-letter:text-[4em] first-letter:leading-none first-letter:float-left first-letter:m-[4px_12px_-4px_0] first-letter:text-accent">
        Put a 9 V battery on your tongue and you feel a sharp metallic tingle. Brush a 120 V wall outlet with a dry
        fingertip and you get a slap — painful, sometimes a small burn, almost never fatal. Grip the same 120 V wire
        with a wet hand while standing barefoot on a concrete basement floor and holding a metal pipe with the other
        hand, and you have a very real chance of dying inside one second. Three voltage levels we have already met in
        this book; three completely different outcomes. The variable that decides which of those things happens is
        not the voltage on the label.
      </p>
      <p className="mb-prose-3">
        What kills you is current — specifically, milliamperes flowing through the trunk of your body and across the
        electrical pacing of the heart, for some number of milliseconds. Voltage matters only as the thing that
        drives that current through whatever resistance your skin and tissue happen to present at the moment of
        contact. Two empirical bodies of work, Charles Dalziel's 1956 study on shock thresholds and the
        IEC 60479-1 standard that codifies the modern revision, are the actual safety references behind every
        residential breaker and every utility approach-distance rule in the book<Cite id="dalziel-1956" in={SOURCES} /><Cite id="iec-60479-2018" in={SOURCES} />.
        This chapter walks through those curves, then through the four pieces of hardware that are calibrated against
        them: the GFCI, the AFCI, the equipotential bond, and the arc-rated suit.
      </p>

      <h2 className="font-2 font-light italic text-[clamp(28px,3.5vw,42px)] leading-1 tracking-1 text-text mt-3xl mb-2xl max-w-[28ch]">Current is what hurts</h2>

      <p className="mb-prose-3">
        Take a 60 Hz sinusoidal current and pass it hand-to-hand through a healthy adult human. As you turn the
        current up from zero, the body passes through a series of physiological thresholds that are surprisingly
        sharp and surprisingly reproducible across the population. IEC 60479-1 collects them into a small ladder of
        zones; the version below tracks the standard's classification for AC at 50/60 Hz<Cite id="iec-60479-2018" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        <strong className="text-text font-medium">Below about 1 mA</strong> the current is imperceptible. The nerves carrying touch and pain do not
        fire; you have to be told the current is on. This is
        {' '}<Term def={<><strong className="text-text font-medium">zone AC-1</strong> — IEC 60479-1's lowest-current band for 50/60 Hz AC through the trunk. Up to roughly 0.5 mA; perception not normally felt; no harmful physiological effects.</>}>zone AC-1</Term>{' '}
        in the IEC notation.
      </p>
      <p className="mb-prose-3">
        <strong className="text-text font-medium">1–5 mA</strong> is the perception band. You feel a tingle in the skin under each contact point. It
        is uncomfortable but you can still let go of the conductor without difficulty. Children, who have smaller
        body mass and proportionally lower contact resistance, sit at the low end of this band; large adults at the
        high end. IEC calls this region
        {' '}<Term def={<><strong className="text-text font-medium">zone AC-2</strong> — the IEC 60479-1 band for AC currents that are perceptible and possibly painful but produce no harmful physiological effects. Roughly 0.5 mA to the let-go threshold.</>}>zone AC-2</Term>.
      </p>
      <p className="mb-prose-3">
        <strong className="text-text font-medium">5–10 mA</strong> is the painful-but-survivable band that ends at the let-go threshold. The
        {' '}<Term def={<><strong className="text-text font-medium">let-go threshold</strong> — the maximum current at which a person gripping a conductor can still voluntarily release it. Roughly 10 mA for an average woman, 16 mA for an average man at 60 Hz; the curve was measured directly by Dalziel.</>}>let-go threshold</Term>{' '}
        is the largest current at which the muscles of the hand can still overpower the involuntary flexor
        contraction that the current itself induces. Dalziel measured this directly on volunteers in the 1950s by
        increasing current until the subject could no longer release a grip on the test electrodes, finding values
        of approximately 10 mA for an average woman and 16 mA for an average man at 60 Hz<Cite id="dalziel-1956" in={SOURCES} />.
        Above that, the involuntary contraction wins.
      </p>
      <p className="mb-prose-3">
        <strong className="text-text font-medium">10–25 mA</strong> is the
        {' '}<Term def={<><strong className="text-text font-medium">tetany</strong> — sustained involuntary contraction of skeletal muscle caused by repetitive electrical stimulation. At 60 Hz the AC waveform stimulates the motor nerves on every half-cycle (120 times a second), faster than the muscle can relax between pulses; the result is a continuous cramp.</>}>tetany</Term>{' '}
        zone. The muscle of the gripping hand locks in a sustained spasm; you cannot release the conductor by an act
        of will. The diaphragm and intercostal muscles can lock similarly if the current path crosses the chest,
        producing
        {' '}<Term def={<><strong className="text-text font-medium">respiratory paralysis</strong> — sustained tetanic contraction of the diaphragm and intercostal muscles that prevents breathing while current is flowing. Onset around 20–25 mA at 60 Hz through the chest; reverses on its own when the current is removed unless the exposure has been long enough to cause anoxia.</>}>respiratory paralysis</Term>{' '}
        — the person cannot breathe until the current stops. If the contact persists for tens of seconds, the
        cumulative anoxia alone can be fatal even without any direct effect on the heart<Cite id="iec-60479-2018" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        <strong className="text-text font-medium">50–100 mA</strong> is the region where, at exposures of about one second or longer, the heart's
        electrical pacing desynchronises into
        {' '}<Term def={<><strong className="text-text font-medium">ventricular fibrillation</strong> — uncoordinated contraction of the ventricular muscle fibres in which the heart twitches rapidly and incoherently rather than pumping. Cardiac output drops to zero; brain anoxia follows within seconds. Reversible only by external defibrillation.</>}>ventricular fibrillation</Term>:
        the ventricular muscle fibres lose their coordinated beat and twitch independently at 200–400 Hz. Cardiac
        output drops effectively to zero; consciousness is lost within seconds and brain death follows within
        minutes unless an external defibrillator can restore the rhythm<Cite id="iec-60479-2018" in={SOURCES} />.
        This is the canonical region the safety literature is most worried about, and the one the 100 mA / 1 s
        rule of thumb refers to<Cite id="dalziel-1956" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        <strong className="text-text font-medium">100 mA – 1 A</strong>, sustained for a second or longer, makes ventricular fibrillation essentially
        certain in a healthy adult. Surface and internal burns become significant; if the contact involves a small
        conductor area the local current density is enough to vaporise tissue at the point of contact<Cite id="iec-60479-2018" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        <strong className="text-text font-medium">1–5 A</strong> moves out of the fibrillation regime into outright
        {' '}<Term def={<><strong className="text-text font-medium">cardiac arrest</strong> — complete cessation of the heart's mechanical activity, as distinct from ventricular fibrillation (which is electrical disorganisation). Counter-intuitively, at very large currents the heart is more likely to stop cleanly than to fibrillate; the arrested heart can often be restarted once the current is removed.</>}>cardiac arrest</Term>:
        currents this large flood the cardiac muscle so thoroughly that, paradoxically, the heart often stops cleanly
        in a single sustained contraction rather than fibrillating. The arrested heart can sometimes restart on its
        own once the current ceases — the same principle by which a defibrillator deliberately stops a fibrillating
        heart so it can resume in rhythm — but the surrounding tissue burns from this exposure are severe.
      </p>
      <p className="mb-prose-3">
        <strong className="text-text font-medium">Above 5 A</strong> tissue heating dominates the picture. Deep thermal burns along the current path,
        including the cooked-meat appearance of muscle around bone where the cross-section is narrowest, are the
        principal injury. Death, if it follows, is usually from the resulting trauma and not from any specific
        electrical effect on the heart<Cite id="iec-60479-2018" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        Plot all of that on log-log axes of current versus exposure time and you have the IEC 60479-1 chart that
        every electrical-safety committee in the world uses to set its thresholds. The chart is the actual safety
        standard. Every other number in this chapter — the GFCI's 5 mA, the AFCI's nuisance-rejection band, the
        approach-distance tables for utility linemen — is a calibration point against it.
      </p>

      <TryIt
        tag="Try 32.1"
        question={
          <>A person grabs a 120 V hot wire with one hand while standing barefoot on wet concrete. Total hand-to-foot
          body resistance is roughly <strong className="text-text font-medium">2 kΩ</strong>. Estimate the current through them and place it on the
          IEC 60479-1 ladder above. Is this likely fatal at one second of exposure?</>
        }
        hint={<>Ohm's law sets the current; the threshold ladder tells you what zone you land in.</>}
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">Direct division:</p>
            <Formula>I = V / R = 120 V / 2 000 Ω = 60 mA</Formula>
            <p className="mb-prose-1 last:mb-0">
              Sixty milliamperes hand-to-foot for one second sits squarely in the ventricular-fibrillation band
              (50–100 mA, one-second exposure). The IEC zone is AC-4.1, and the outcome is a real risk of fibrillation
              in a healthy adult and near-certainty in an elderly or cardiac-compromised one<Cite id="iec-60479-2018" in={SOURCES} />.
              Answer: <strong className="text-text font-medium">~60 mA</strong>, <strong className="text-text font-medium">plausibly fatal</strong> if the contact persists.
            </p>
          </>
        }
      />

      <TryIt
        tag="Try 32.2"
        question={
          <>The same person, same 120 V contact, but now wearing dry rubber-soled shoes on a dry wooden floor:
          hand-to-foot resistance is <strong className="text-text font-medium">100 kΩ</strong>. What is the current, and which zone of the
          IEC 60479-1 ladder?</>
        }
        hint={<>Same V, much larger R.</>}
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">Same arithmetic, fifty times the resistance:</p>
            <Formula>I = V / R = 120 V / 100 000 Ω = 1.2 mA</Formula>
            <p className="mb-prose-1 last:mb-0">
              That is below the let-go threshold and barely above the perception threshold — a noticeable but
              harmless tingle, IEC zone AC-1/AC-2 boundary<Cite id="iec-60479-2018" in={SOURCES} />. The lesson is
              not that 120 V is sometimes safe; it is that the same voltage straddles "tingle" and "fatal"
              depending on a single decade of variation in the body's resistance to ground. <strong className="text-text font-medium">1.2 mA</strong>,
              not deadly.
            </p>
          </>
        }
      />

      <h2 className="font-2 font-light italic text-[clamp(28px,3.5vw,42px)] leading-1 tracking-1 text-text mt-3xl mb-2xl max-w-[28ch]">Why the 60 Hz threshold is the lowest</h2>

      <p className="mb-prose-3">
        The current-vs-time ladder above is specific to 50/60 Hz alternating current. That is not a coincidence —
        and it is not because the worldwide power grid happened to standardise on those frequencies. The pacing
        cells of the heart's sinoatrial node fire at roughly 1 Hz at rest, driving each ventricular contraction
        through a coordinated wave of depolarisation that takes a few hundred milliseconds to propagate. An
        externally imposed alternating current that delivers a stimulus pulse on every half-cycle — 100 or 120
        times per second — falls squarely in the worst possible band for desynchronising that propagation. The
        external pulses come faster than the muscle can relax between them, every cell is repeatedly forced into
        a refractory state out of step with its neighbours, and the coherent ventricular contraction breaks down
        into fibrillation<Cite id="iec-60479-2018" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        Direct current is roughly four times safer for fibrillation thresholds at comparable exposures: IEC 60479-1
        places the DC fibrillation threshold for one-second exposure at several hundred milliamperes rather than
        the 50–100 mA range of 60 Hz AC<Cite id="iec-60479-2018" in={SOURCES} />. DC tetanises the muscles only at
        make and break — the start and end of the exposure — rather than 120 times a second throughout. It still
        burns at higher levels, and it can still arrest the heart, but it is far harder to desynchronise the
        ventricles with a steady current than with one that hammers them rhythmically.
      </p>
      <p className="mb-prose-3">
        Frequencies well above 60 Hz are also progressively safer, for a different reason. As frequency climbs into
        the kilohertz range, the
        {' '}<Term def={<><strong className="text-text font-medium">skin effect</strong> — the tendency for AC current to concentrate near the surface of a conductor as frequency rises. In a human body it confines high-frequency currents to the skin and superficial tissue rather than the chest cavity, sparing the heart.</>}>skin effect</Term>{' '}
        confines current to a thinner shell at the surface of the body, and at the same time the period of each
        AC cycle becomes shorter than the cardiac muscle's chronaxie — the minimum stimulus duration required to
        trigger a contraction. By the time you reach 10 kHz the heart cannot follow individual cycles at all,
        and the dominant injury mode shifts from fibrillation to tissue heating. Surgical electrocautery, which
        operates at hundreds of kilohertz, exploits exactly this: a current that would kill at 60 Hz becomes a
        useful scalpel at 500 kHz<Cite id="iec-60479-2018" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        The North-American 60 Hz residential supply, in other words, happens to sit in the most dangerous
        physiologically-accessible band on the spectrum. The grid was chosen for engineering reasons — transformer
        size, lamp flicker, motor design — and the cardiac vulnerability was an unwelcome accident of biology that
        the safety hardware has been working around ever since.
      </p>

      <h2 className="font-2 font-light italic text-[clamp(28px,3.5vw,42px)] leading-1 tracking-1 text-text mt-3xl mb-2xl max-w-[28ch]">GFCI and the 5 mA / 25 ms standard</h2>

      <p className="mb-prose-3">
        Ch.28 introduced the
        {' '}<Term def={<><strong className="text-text font-medium">GFCI</strong> (ground-fault circuit interrupter) — a device that compares the current leaving the panel on hot with the current returning on neutral and trips when the difference exceeds about 5 mA. The standard residential personnel-protection device since NEC 1971.</>}>GFCI</Term>{' '}
        as the differential-current breaker that compares hot and neutral and trips on the imbalance. The threshold
        — 5 mA, with a clearing time of roughly 25 ms — is not a round number chosen by committee. It is a direct
        readout of where the IEC 60479-1 chart sits at that exposure time.
      </p>
      <p className="mb-prose-3">
        Locate 5 mA on the current axis and 25 ms on the time axis of the IEC curve. The intersection lies inside
        zone AC-1: imperceptible, no reaction, certainly no fibrillation risk<Cite id="iec-60479-2018" in={SOURCES} />.
        Move the operating point to 30 mA × 25 ms — the threshold of a European 30 mA RCD, the same device under
        a different name — and you are in zone AC-2, perceptible but with no harmful physiological effects. Even
        a hand-to-hand fault at 100 mA, if cleared within about 100 ms, stays inside zone AC-3 (some respiratory
        and cardiac effects, but no fibrillation in a healthy adult)<Cite id="iec-60479-2018" in={SOURCES} />. The
        whole product specification — 5 mA, 25 ms — is a deliberate calibration that keeps the contact in zone AC-1
        even with worst-case body resistance.
      </p>
      <p className="mb-prose-3">
        The current driving that test is fixed by Ohm's law applied to the body itself,
      </p>
      <Formula>I<sub>body</sub> = V<sub>fault</sub> / R<sub>body</sub></Formula>
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">I<sub>body</sub></strong> is the current diverted from the normal hot-neutral loop into the
        body (in amperes), <strong className="text-text font-medium">V<sub>fault</sub></strong> is the voltage that appears across the body when it
        becomes part of the fault path (in volts; typically the full line voltage, 120 V or 240 V), and
        <strong className="text-text font-medium"> R<sub>body</sub></strong> is the
        {' '}<Term def={<><strong className="text-text font-medium">body resistance</strong> — the total electrical resistance from one contact point to another through a human body, including skin contact resistance at each end and internal tissue resistance through the trunk. Skin resistance dominates for dry contact (10–100 kΩ); internal resistance dominates for wet or large-area contact (around 500–1 000 Ω).</>}>body resistance</Term>,
        the sum of the two
        {' '}<Term def={<><strong className="text-text font-medium">contact resistance</strong> — the resistance localised in the few square millimetres of skin under each electrode or grasped conductor. Drops by one to two orders of magnitude when the skin is wet, abraded, or punctured.</>}>contact resistances</Term>{' '}
        at the entry and exit points plus the internal trunk resistance (in ohms). IEC 60479-1 publishes
        distributions for these terms<Cite id="iec-60479-2018" in={SOURCES} />: a hand-to-hand R<sub>body</sub>
        runs from about 1 kΩ (wet, large-area, with broken skin) to over 100 kΩ (dry, fingertip touch, intact
        callused skin). At 120 V wet that is 120 mA — squarely lethal — and at 120 V dry it is 1 mA — barely
        perceptible. The two-decade variation in R is the variation between "shock" and "death."
      </p>
      <p className="mb-prose-3">
        The GFCI does not measure R<sub>body</sub>. It does not need to. It measures the residual current — the
        amount that has left through the hot wire but is not coming back on the neutral — and trips when that
        amount exceeds 5 mA regardless of why. Anything diverting more than that much current out of the normal
        loop is by definition either a person, a wet appliance, or an insulation breakdown to ground, and the
        device opens the circuit in roughly one and a half AC cycles<Cite id="nec-2023" in={SOURCES} />.
      </p>

      <TryIt
        tag="Try 32.3"
        question={
          <>A 5 mA leakage to ground through a person's body persists for <strong className="text-text font-medium">25 ms</strong> before a GFCI clears
          it. Where on the IEC 60479-1 chart does that operating point land, and what physiological response do you
          expect?</>
        }
        hint={<>Locate (5 mA, 25 ms) on the current-vs-time grid; read off the zone.</>}
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">
              The point (5 mA, 25 ms) sits inside <strong className="text-text font-medium">zone AC-1</strong> on the IEC 60479-1 chart. AC-1 is the
              imperceptible region: the person is unlikely even to feel the shock, let alone suffer any harm
              <Cite id="iec-60479-2018" in={SOURCES} />.
            </p>
            <p className="mb-prose-1 last:mb-0">
              Answer: <strong className="text-text font-medium">zone AC-1</strong>, no reaction expected. The GFCI's specification is calibrated
              precisely so that a worst-case fault is cleared before the operating point can drift out of AC-1
              into any harmful zone.
            </p>
          </>
        }
      />

      <h2 className="font-2 font-light italic text-[clamp(28px,3.5vw,42px)] leading-1 tracking-1 text-text mt-3xl mb-2xl max-w-[28ch]">AFCI and why arcs start fires</h2>

      <p className="mb-prose-3">
        The
        {' '}<Term def={<><strong className="text-text font-medium">AFCI</strong> (arc-fault circuit interrupter) — a breaker that listens for the high-frequency, irregular signature of an electrical arc on the branch and trips when it detects one. Required in most dwelling-unit rooms since NEC 2014.</>}>AFCI</Term>{' '}
        addresses a different failure mode. A standard thermal-magnetic breaker watches for sustained overcurrent
        or a sudden dead short; it cannot see a low-energy arc that hides inside an ordinary load current. Yet
        electrical arcs inside walls and behind appliances are the leading cause of residential electrical fires,
        and the NEC has progressively expanded AFCI requirements since NEC 1999 to address them<Cite id="nec-2023" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        Two distinct arc topologies show up in damaged residential wiring. A
        {' '}<Term def={<><strong className="text-text font-medium">series arc</strong> — an arc that forms across a break in a single conductor (a partially severed wire, a loose terminal). The current still flows through the arc on its way to the load, so the magnitude is limited by the load's normal impedance and stays well below the breaker's trip threshold.</>}>series arc</Term>{' '}
        forms across a break in a single conductor — a cord nicked under a chair leg, a staple driven into the
        insulation, a loose wire-nut working free behind a wall. The arc carries the load current on its way to
        the appliance, so the RMS magnitude is limited by the load's normal impedance and may sit at only 5–10 A,
        comfortably below a 15 A breaker's trip curve. A
        {' '}<Term def={<><strong className="text-text font-medium">parallel arc</strong> — an arc that forms between two conductors (hot to neutral, or hot to ground) through degraded insulation. Current is limited only by the source impedance and can spike to tens of amperes, but the arc gap impedance still keeps it below a dead-short value.</>}>parallel arc</Term>{' '}
        forms between two conductors through degraded insulation, between hot and neutral or hot and ground;
        the current is larger but the gap impedance keeps it well short of the magnetic trip threshold of an
        ordinary thermal-magnetic breaker.
      </p>
      <p className="mb-prose-3">
        Either kind of arc looks irregular on an oscilloscope: peaks of perhaps 30–80 A lasting fractions of a
        millisecond, separated by extinctions where the arc loses ionisation, with broadband noise riding on top
        of the 60 Hz fundamental. The instantaneous power dissipated in the arc gap is well-approximated by
      </p>
      <Formula>P<sub>arc</sub> ≈ V<sub>arc</sub> × I<sub>arc</sub> × δ</Formula>
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">P<sub>arc</sub></strong> is the time-averaged power dissipated in the arc gap (in watts),
        <strong className="text-text font-medium"> V<sub>arc</sub></strong> is the voltage drop across the arc itself (in volts; for low-current
        residential arcs typically 30–50 V, set by the physics of the air-gap plasma rather than by the supply
        voltage), <strong className="text-text font-medium">I<sub>arc</sub></strong> is the current through the arc while it is conducting (in
        amperes), and <strong className="text-text font-medium">δ</strong> is the
        {' '}<Term def={<><strong className="text-text font-medium">duty cycle</strong> — the fraction of the AC half-cycle during which the arc is actively conducting, as opposed to extinguished. A series arc that re-strikes once per half-cycle and burns for about half of each half-cycle has δ ≈ 0.5.</>}>duty cycle</Term>{' '}
        — the fraction of the AC half-cycle that the arc is actually conducting. For V<sub>arc</sub> = 50 V,
        I<sub>arc</sub> = 10 A, δ = 0.5, P<sub>arc</sub> ≈ 250 W of heat concentrated in a few cubic millimetres
        of charred insulation. The arc plasma itself sits at a few thousand kelvin, hot enough to ignite the
        cord jacket immediately and, after that, anything else in the cavity — curtain fabric, blown-in
        cellulose, lath-and-plaster, framing lumber.
      </p>
      <p className="mb-prose-3">
        Per the National Fire Protection Association's annual fire-loss statistics, electrical-distribution and
        lighting-equipment fires kill several hundred people a year in U.S. homes and cost on the order of a
        billion dollars in direct property loss — a magnitude that NFPA cites as the rationale behind the NEC's
        progressively widening AFCI requirement<Cite id="nec-2023" in={SOURCES} /><Cite id="nfpa-70e-2024" in={SOURCES} />.
        NEC Article 210.12 in the 2023 edition extends AFCI protection to nearly every 120 V branch in a
        dwelling unit, with limited exceptions for outdoor and bathroom circuits that are already covered by
        GFCI<Cite id="nec-2023" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        The AFCI's microcontroller samples the branch current many thousand times per second and runs a
        signature classifier on the waveform: looking for the irregular pulse trains and broadband spectral
        noise of an arc, while rejecting the legitimate switching noise of dimmers, vacuum-cleaner brushes,
        compact-fluorescent ballasts, and laser-printer fusers. The classifier is the entire engineering
        challenge — the trip mechanism itself is a conventional solid-state release — and the listing standard
        (UL 1699) defines a long set of test waveforms that the device must trip on and a longer set of
        nuisance waveforms it must not<Cite id="nec-2023" in={SOURCES} />.
      </p>

      <TryIt
        tag="Try 32.4"
        question={
          <>An arc fault in a damaged extension cord draws an average of <strong className="text-text font-medium">8 A</strong> through an arc gap
          with a measured drop of <strong className="text-text font-medium">40 V</strong>, with the arc conducting for half of each AC half-cycle
          (δ = 0.5). What is the time-averaged power dissipated in the arc, and is that enough to ignite cellulose
          insulation, whose autoignition threshold is roughly <strong className="text-text font-medium">50 W/cm²</strong> of contact area for paper-like
          materials at piloted ignition?</>
        }
        hint={<>P<sub>arc</sub> = V<sub>arc</sub> × I<sub>arc</sub> × δ. Then compare the resulting power to the
        ignition threshold per square centimetre, given an arc footprint of roughly a few square millimetres.</>}
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">Plug in:</p>
            <Formula>P<sub>arc</sub> = 40 V × 8 A × 0.5 = 160 W</Formula>
            <p className="mb-prose-1 last:mb-0">
              That 160 W is concentrated in the arc footprint, an area of order 0.05 cm² (a few square millimetres).
              The power density at the cord jacket is therefore
            </p>
            <Formula>P<sub>arc</sub> / A ≈ 160 W / 0.05 cm² = 3 200 W/cm²</Formula>
            <p className="mb-prose-1 last:mb-0">
              — roughly sixty times the piloted-ignition threshold for paper-like cellulose. Answer: <strong className="text-text font-medium">160 W
              total, far above ignition threshold</strong>. This is why an AFCI is worth the price even though
              the total branch current never crossed the breaker's nominal 15 A trip.
            </p>
          </>
        }
      />

      <h2 className="font-2 font-light italic text-[clamp(28px,3.5vw,42px)] leading-1 tracking-1 text-text mt-3xl mb-2xl max-w-[28ch]">Why a bird on a single wire is fine, and a squirrel between two wires isn't</h2>

      <p className="mb-prose-3">
        A pigeon perches on a 138 kV transmission line, unharmed, while a squirrel that bridges the same line to
        a grounded crossarm is killed instantly. Both animals touched a conductor at thousands of volts above
        earth potential; only one of them died. The reason is the most useful idea in electrical safety and the
        one most often forgotten: voltage is a difference, not an absolute quantity.
      </p>
      <p className="mb-prose-3">
        The pigeon sits on a single conductor with both feet. Its entire body floats to whatever potential that
        conductor happens to carry — perhaps eighty thousand volts above local soil at that instant — but every
        cell in its body floats to the same potential. The potential difference between any two points on the
        bird is essentially zero (driven only by the small voltage gradient along the few centimetres of wire
        between its two feet). With no potential difference, Ohm's law gives no current. Nothing happens.
      </p>
      <p className="mb-prose-3">
        The squirrel that climbs the pole and reaches one paw to the energised conductor while another paw is on
        a grounded steel crossarm has bridged the full 80 kV across its body. With an internal body resistance
        of a few hundred ohms wet — high-voltage exposure always involves wet contact, because the skin breaks
        down dielectrically at a few kilovolts — the current through the body is hundreds of amperes, the
        exposure ends in tissue vaporisation within a small fraction of a second, and the breaker upstream
        clears the resulting fault. The whole "hot" / "ground" / "neutral" vocabulary of household wiring is a
        bookkeeping convenience that the reader should mentally translate, every time, into "this point of metal
        sits at a different potential from that point of metal." Current only flows when two such points are
        bridged by something conductive.
      </p>
      <p className="mb-prose-3">
        The same logic is what lets utility linemen work
        {' '}<Term def={<><strong className="text-text font-medium">barehand work</strong> — the practice of bonding a worker to an energised conductor so that the worker sits at line potential and can touch the conductor without current flow. Used on transmission voltages up to 500 kV; the worker is delivered to the line in an insulated bucket truck or helicopter.</>}>barehand</Term>{' '}
        on energised transmission lines. The lineman approaches the conductor in an insulated bucket truck or
        on an insulated helicopter platform, then explicitly bonds the bucket (and themselves) to the live wire
        through a conductive strap before making contact. From the instant the bond is made, the worker and the
        line are at the same potential; touching the conductor is no different from a bird touching it. The
        truck below them, isolated by the boom's insulator, stays at earth potential — and the
        {' '}<Term def={<><strong className="text-text font-medium">approach boundary</strong> — the regulatory minimum separation between a worker and an energised conductor, set by line voltage and the dielectric strength of air with a margin. Tabulated in OSHA 29 CFR 1910.269 and in NFPA 70E for transmission, distribution, and substation voltages.</>}>approach-distance</Term>{' '}
        tables in OSHA 29 CFR 1910.269 specify exactly how much air gap is required between the worker and any
        other point at a different potential during the operation<Cite id="osha-1910-269" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        Inside a house, the same principle drives the
        {' '}<Term def={<><strong className="text-text font-medium">equipotential bonding</strong> — the deliberate electrical connection of all exposed metal surfaces in a region (around a swimming pool, in a hospital operating room, on a substation grid mat) so that they all sit at the same potential. A person touching two such surfaces sees no voltage difference and no current.</>}>equipotential bonding</Term>{' '}
        of every exposed metal part in a swimming-pool deck: the ladder, the diving-board frame, the pump motor
        housing, the pool's reinforcing steel, and the deck drains are all tied together with a continuous copper
        conductor. If any one of them becomes accidentally energised, all of them rise together — and a swimmer
        touching two of them at once sees the same potential on both hands and no current<Cite id="nec-2023" in={SOURCES} />.
        The pool's grid mat is, in miniature, the same trick as the lineman's bonded bucket.
      </p>

      <h2 className="font-2 font-light italic text-[clamp(28px,3.5vw,42px)] leading-1 tracking-1 text-text mt-3xl mb-2xl max-w-[28ch]">PPE and arc-flash energy</h2>

      <p className="mb-prose-3">
        Everything up to this point has been about shock — current crossing a body that has become part of a circuit.
        There is a second hazard inside a panel that does not require contact at all. When a bolted short happens
        on a low-impedance bus, the resulting fault arc dumps enormous power into a small volume of air in a few
        milliseconds. The plasma expands explosively (an
        {' '}<Term def={<><strong className="text-text font-medium">arc blast</strong> — the explosive pressure wave produced by the rapid expansion of vaporised metal and ionised air during a high-current arc fault. Distinct from arc flash, which is the radiative thermal energy of the same event.</>}>arc blast</Term>),
        radiates a fireball of incandescent gas at several thousand kelvin (the
        {' '}<Term def={<><strong className="text-text font-medium">arc flash</strong> — the radiative thermal hazard of a high-current fault arc, distinct from arc blast (pressure) and from shock (current through a body). Energy is quantified by NFPA 70E in cal/cm² at a working distance.</>}>arc flash</Term>{' '}
        itself), and sprays droplets of molten copper and aluminium for a metre or more. A panel-mounted electrician
        standing in front of an open panel during a fault event can suffer third-degree burns through clothing,
        ruptured eardrums, and inhalation injury — without any direct contact with the bus<Cite id="nfpa-70e-2024" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        The radiative-energy hazard is quantified as
        {' '}<Term def={<><strong className="text-text font-medium">arc-flash incident energy</strong> — the radiant thermal energy per unit area delivered to an observer at a stated working distance during an arc-fault event. Measured in calories per square centimetre (cal/cm²); 1 cal/cm² is the threshold for the onset of a second-degree skin burn.</>}>incident energy</Term>{' '}
        at a stated
        {' '}<Term def={<><strong className="text-text font-medium">working distance</strong> — the assumed distance from a worker's face and chest to the source of the arc, used to compute incident energy. NFPA 70E defaults to 18 inches (450 mm) for low-voltage panel work.</>}>working distance</Term>,
        the same energy units used in food chemistry (1 cal = 4.184 J). For a low-voltage three-phase arc in an
        enclosed panel the simplified Ralph Lee model — the original 1982 calculation — approximates the radiative
        energy at distance d as
      </p>
      <Formula>E<sub>arc</sub> ≈ (V × I<sub>bolted</sub> × t<sub>clear</sub>) / (4π d²)</Formula>
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">E<sub>arc</sub></strong> is the incident energy delivered to a surface at distance d during
        the arc (in joules per square metre; convert by 1 cal/cm² = 41 840 J/m² to compare with NFPA 70E's
        tabulated cal/cm²), <strong className="text-text font-medium">V</strong> is the operating voltage across the arc (in volts), <strong className="text-text font-medium">
        I<sub>bolted</sub></strong> is the available
        {' '}<Term def={<><strong className="text-text font-medium">bolted short-circuit current</strong> — the current that would flow in the fault if the fault path were a zero-impedance bolt connecting the conductors. Set by the upstream transformer and service impedance; upper-bounds the actual arcing current.</>}>bolted short-circuit current</Term>{' '}
        the upstream transformer can deliver into a zero-impedance fault (in amperes), <strong className="text-text font-medium">t<sub>clear</sub>
        </strong> is the time the upstream breaker takes to interrupt the arc (in seconds), <strong className="text-text font-medium">d</strong> is
        the working distance from the arc to the worker's face and torso (in metres; NFPA 70E's default for
        low-voltage panel work is 450 mm), and <strong className="text-text font-medium">4π d²</strong> is the area of a sphere of radius d at the
        worker's position over which the radiated energy is assumed to spread. The model is conservative — it
        ignores the directionality of an enclosed panel and the spectral content of the arc — but it captures the
        scaling: incident energy goes linearly with voltage, current, and clearing time, and falls as the inverse
        square of working distance<Cite id="nfpa-70e-2024" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        NFPA 70E sorts that energy into
        {' '}<Term def={<><strong className="text-text font-medium">PPE category</strong> — one of four arc-rated personal-protective-equipment levels in NFPA 70E (CAT 1 through CAT 4), each calibrated to a maximum incident energy. PPE selection is based on the calculated incident energy at the working distance for the task.</>}>PPE categories</Term>:
        CAT 1 (rated to 4 cal/cm² — long-sleeve arc-rated cotton shirt and trousers, hard hat, safety glasses,
        leather gloves), CAT 2 (8 cal/cm² — adds an arc-rated face-shield and balaclava), CAT 3 (25 cal/cm² — a
        full arc-flash suit with hood), CAT 4 (40 cal/cm² — heavier multi-layer arc suit with a higher-rated
        hood)<Cite id="nfpa-70e-2024" in={SOURCES} />. For a residential 200 A panel the calculated incident
        energy at 450 mm is typically well below 1.2 cal/cm² (NFPA 70E's "no special PPE" threshold for
        category 0); for an industrial 1 200 A switchgear feeding a 1 500 kVA transformer it can climb into
        CAT 3 or CAT 4 territory even with modern fast breakers. The energy is dominated by t<sub>clear</sub>;
        every halving of breaker clearing time halves the arc-flash energy at the same fault current<Cite id="nfpa-70e-2024" in={SOURCES} />.
      </p>

      <Pullout>
        Voltage is a proxy. The thing that actually decides whether you walk away is how many milliamps cross your
        heart and for how many milliseconds.
      </Pullout>

      <TryIt
        tag="Try 32.5"
        question={
          <>A residential panel has an available bolted fault current of <strong className="text-text font-medium">I<sub>bolted</sub> = 8 000 A</strong>{' '}
          at <strong className="text-text font-medium">V = 240 V</strong>. The upstream main breaker clears in <strong className="text-text font-medium">t<sub>clear</sub> = 0.05 s</strong>.
          At a working distance of <strong className="text-text font-medium">d = 450 mm</strong>, what is the incident energy in cal/cm², and what
          NFPA 70E PPE category does it correspond to? (Recall 1 cal/cm² = 41 840 J/m².)</>
        }
        hint={<>Plug into the Ralph Lee formula above; convert J/m² to cal/cm².</>}
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">The numerator and the spherical-spreading denominator:</p>
            <Formula>V × I<sub>bolted</sub> × t<sub>clear</sub> = 240 × 8 000 × 0.05 = 96 000 J</Formula>
            <Formula>4π d² = 4π × (0.45)² ≈ 2.54 m²</Formula>
            <p className="mb-prose-1 last:mb-0">So the incident energy per unit area is</p>
            <Formula>E ≈ 96 000 / 2.54 ≈ 3.78×10⁴ J/m² ≈ 0.90 cal/cm²</Formula>
            <p className="mb-prose-1 last:mb-0">
              That sits below NFPA 70E's 1.2 cal/cm² threshold for CAT 1 PPE: in the language of the standard, it
              is below the "no-special-PPE" boundary. Long-sleeve natural-fibre clothing, safety glasses, and
              insulated tools are required, but a full arc-flash suit is not<Cite id="nfpa-70e-2024" in={SOURCES} />.
              Answer: <strong className="text-text font-medium">≈ 0.9 cal/cm²</strong>, <strong className="text-text font-medium">below CAT 1</strong>. Doubling the clearing time
              would push it into CAT 1; quadrupling the fault current would push it into CAT 2.
            </p>
          </>
        }
      />

      <CaseStudies
        intro={
          <>
            Three episodes — one prevented fatality, one survived high-voltage encounter, and one fire — that show the
            shock and arc hazards in action.
          </>
        }
      >
        <CaseStudy
          tag="Case 32.1"
          title="The hairdryer in the bathtub"
          summary="The canonical GFCI save."
          specs={[
            { label: 'Source voltage', value: <>120 V RMS at 60 Hz <Cite id="nec-2023" in={SOURCES} /></> },
            { label: 'Body resistance in bath water', value: <>~5 kΩ hand-to-foot, wet <Cite id="iec-60479-2018" in={SOURCES} /></> },
            { label: 'Resulting body current without GFCI', value: <>~24 mA <Cite id="iec-60479-2018" in={SOURCES} /></> },
            { label: 'IEC zone without GFCI', value: <>AC-3 / AC-4 boundary at 1 s exposure <Cite id="iec-60479-2018" in={SOURCES} /></> },
            { label: 'GFCI trip threshold', value: <>5 mA, ~25 ms <Cite id="nec-2023" in={SOURCES} /></> },
            { label: 'IEC zone with GFCI', value: <>AC-1 (no reaction) <Cite id="iec-60479-2018" in={SOURCES} /></> },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            The scenario every American electrical-safety pamphlet still uses, because the physics is so clean. A
            line-powered hairdryer falls into a filled bathtub with a person in it. The 120 V hot conductor inside
            the dryer's chassis is now bonded through bath-water — a salt-and-mineral electrolyte conductive enough
            to act as a continuous bus — to the body of the person, and from the body through the tub's drain (or
            the standing puddle on the bathroom floor) back to the building's plumbing and so to earth.
          </p>
          <p className="mb-prose-2 last:mb-0">
            Body resistance under those wet, large-contact-area conditions drops to roughly 5 kΩ hand-to-foot — high
            for the body alone, low for any realistic dry contact<Cite id="iec-60479-2018" in={SOURCES} />. At
            120 V across 5 kΩ the body current is 24 mA, which on the IEC 60479-1 chart at exposures of one second
            or longer sits at the AC-3/AC-4 boundary — respiratory tetany certain, ventricular fibrillation probable
            for an elderly or weakened heart<Cite id="iec-60479-2018" in={SOURCES} />. Pre-GFCI, this is the failure
            mode that the U.S. NEC was reacting to when it required GFCI protection in bathrooms starting in 1975.
          </p>
          <p className="mb-prose-2 last:mb-0">
            With a GFCI on the bathroom branch, the same fault diverts 24 mA out of the hot-neutral loop into the
            person's body — but the imbalance is detected within one and a half AC cycles and the breaker clears
            in roughly 25 ms<Cite id="nec-2023" in={SOURCES} />. The operating point on the IEC chart is then
            (24 mA, 25 ms), which sits inside zone AC-2 — perceptible, possibly uncomfortable, but with no harmful
            physiological effects<Cite id="iec-60479-2018" in={SOURCES} />. The person feels a sharp pulse and
            climbs out of the tub. The dryer is wrecked. Nobody dies.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 32.2"
          title="Lineman barehand work on a 138 kV transmission line"
          summary="Equipotential bonding at distribution-voltage scale."
          specs={[
            { label: 'Line voltage to ground', value: <>~80 kV (138 kV three-phase, line-to-neutral) <Cite id="osha-1910-269" in={SOURCES} /></> },
            { label: 'Procedure', value: <>insulated bucket-truck approach with conductive bonding strap <Cite id="osha-1910-269" in={SOURCES} /></> },
            { label: 'Worker-to-line potential after bonding', value: <>0 V (by construction)</> },
            { label: 'Minimum approach distance to unbonded ground', value: <>per OSHA 29 CFR 1910.269 Table R-6 <Cite id="osha-1910-269" in={SOURCES} /></> },
            { label: 'PPE while bonded', value: <>arc-rated clothing, hard hat, insulating gloves <Cite id="nfpa-70e-2024" in={SOURCES} /></> },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            A utility transmission line carries 138 kV three-phase, or about 80 kV from each conductor to local
            earth. Replacing an insulator string or a damper on such a line, the bird-on-a-wire principle taken to
            its industrial conclusion, is done by a lineman wearing a conductive
            {' '}<Term def={<><strong className="text-text font-medium">conductive suit</strong> — a Faraday-cage garment of metallised cloth that distributes induced currents around the body's surface during barehand work on energised transmission lines. The suit is bonded to the line conductor so the wearer sits at line potential.</>}>conductive suit</Term>{' '}
            of metallised cloth, riding an insulated boom-arm bucket truck or an insulated platform suspended from
            a helicopter, and explicitly bonding the bucket and themselves to the energised conductor with a
            short flexible strap before reaching out to touch the wire<Cite id="osha-1910-269" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            From the moment of bonding, the worker and the conductor sit at exactly the same potential. Current
            through the worker's body is zero. The arrangement holds as long as no part of the worker comes within
            the minimum approach distance of any other point at a different potential — the steel structure
            holding the insulator, the second phase conductor a few metres away, or the truck below the boom
            insulator. OSHA 29 CFR 1910.269 publishes those distances in tables indexed by line voltage and altitude
            (corrected for the lower dielectric strength of thinner air at altitude)<Cite id="osha-1910-269" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            The technique is used routinely on lines up to 765 kV. Workers have measured the leakage current
            through their conductive suits to the line during transitions — capacitive coupling during the
            approach, before the bonding strap is connected — at a few hundred microamperes, well inside IEC
            zone AC-1<Cite id="iec-60479-2018" in={SOURCES} />. The instant the strap is on, even that disappears.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 32.3"
          title="A series-arc fault in a damaged ceiling cord"
          summary="The kind of failure AFCIs were created to catch."
          specs={[
            { label: 'Fault mechanism', value: <>cord insulation pinched against a sharp metal corner in an attic</> },
            { label: 'Arc current (RMS)', value: <>~8 A intermittent</> },
            { label: 'Standard thermal-magnetic breaker response', value: <>no trip (well below 15 A nominal) <Cite id="nec-2023" in={SOURCES} /></> },
            { label: 'Time to ignite cellulose insulation', value: <>minutes to tens of minutes</> },
            { label: 'AFCI response', value: <>trip on arc-signature within seconds <Cite id="nec-2023" in={SOURCES} /></> },
            { label: 'NEC 2023 reference', value: <>Article 210.12 (AFCI for dwelling-unit circuits) <Cite id="nec-2023" in={SOURCES} /></> },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            An older home's attic light fixture is fed by a non-metallic-sheathed cable run over the top edge of a
            joist. A roofer's foot, twenty years after the cable was installed, pinches the cable just hard enough
            to crush one conductor's insulation against the wood. The conductor itself does not break and the
            circuit continues to operate normally for months — the damage is invisible from below and the lamp
            still lights.
          </p>
          <p className="mb-prose-2 last:mb-0">
            Eventually a small whisker of metal-fatigue cracking creates an intermittent series gap in the
            conductor. The current still flows on its way to the lamp, but now through a small arc that strikes
            and extinguishes many times per AC cycle, each strike depositing a milliJoule or two of heat into the
            charred cellulose of the cable jacket and the surrounding insulation. RMS current stays at the lamp's
            nominal value — perhaps 0.5 A for a 60 W incandescent — well below the 15 A branch breaker's trip
            threshold. The thermal-magnetic breaker sees a normal load<Cite id="nec-2023" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            The local heating accumulates and eventually ignites the blown-in cellulose insulation. NFPA fire-loss
            statistics consistently identify electrical-distribution and lighting-equipment as the leading
            cause of fatal residential fires<Cite id="nfpa-70e-2024" in={SOURCES} />, and the failure modes
            grouped under that heading are exactly this kind of series arc inside a damaged or aged cable. An AFCI
            on the same circuit would have observed the spectral signature of the intermittent arc and tripped
            within seconds — before the cellulose reached its ignition temperature. The progressive expansion of
            AFCI requirements through successive NEC cycles (1999 bedrooms, 2014 most rooms, 2023 essentially all
            120 V branches in a dwelling) is calibrated against this failure mode<Cite id="nec-2023" in={SOURCES} />.
          </p>
        </CaseStudy>
      </CaseStudies>

      <FAQ intro="Questions readers ask after reading the threshold ladder.">
        <FAQItem q="Why does grabbing a 9 V battery do nothing, but a 120 V outlet hurt?">
          <p>
            Because the current through your body is set by V divided by R, and R is huge across dry skin —
            typically tens of kilohms. At 9 V across, say, 50 kΩ of dry-tongue-and-fingertip contact, the current
            is roughly 0.2 mA: well below the 1 mA perception threshold for skin, just above it for the much more
            sensitive tongue, hence the metallic tingle<Cite id="iec-60479-2018" in={SOURCES} />. The same 50 kΩ
            across 120 V is 2.4 mA — into the perception band, sharp and unpleasant. The voltage matters only as
            the divisor's partner.
          </p>
        </FAQItem>

        <FAQItem q="Is DC or AC more dangerous at the same voltage?">
          <p>
            AC at 50/60 Hz is more dangerous for ventricular fibrillation, by a factor of roughly four to five at
            comparable exposure times. The reason is biological: the 100–120 stimulus pulses per second of 60 Hz
            AC fall in the worst possible band for desynchronising the heart's pacing, while DC delivers a single
            make-and-break stimulus and otherwise just heats the tissue<Cite id="iec-60479-2018" in={SOURCES} />.
            DC is not safe — at high currents it still burns and at sustained exposure it still arrests the heart
            — but the AC fibrillation threshold is the lower one.
          </p>
        </FAQItem>

        <FAQItem q="Why can a person touch a transformer's metal case even though the secondary inside is at hundreds of volts?">
          <p>
            Because the case is bonded to the building's equipment-grounding system and the case-to-soil potential
            is therefore near zero. The energised secondary winding inside is electrically isolated from the case
            by the transformer's internal insulation; an internal fault between the winding and the case would
            energise the case briefly, but the bonded ground path would carry the fault current back to the
            source and trip the upstream breaker before the case had time to rise more than a few volts above
            ground<Cite id="nec-2023" in={SOURCES} />. The case is safe to touch because, in normal operation and
            in any properly-cleared fault, every point on it is at the same potential as the floor you are
            standing on.
          </p>
        </FAQItem>

        <FAQItem q="What is the difference between a 'shock' and 'electrocution'?">
          <p>
            "Shock" is the general term for any current passing through the body that the person feels. "Electrocution"
            is specifically a death by electric current — derived from "electro-execution" and applied historically
            to judicial execution by electric chair. Every electrocution is a shock; almost no shock is an
            electrocution. The IEC 60479-1 zones provide the precise dividing line: zones AC-1 and AC-2 are shock
            without injury, AC-3 is shock with non-fatal effects, AC-4 is the region where fibrillation and
            death become possible<Cite id="iec-60479-2018" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why is the GFCI threshold a hard 5 mA, but the AFCI does not have a fixed current threshold?">
          <p>
            Because the GFCI and AFCI are detecting different kinds of fault. A GFCI is calibrated against a human
            body in the current path — the relevant quantity is total leakage current, and the IEC 60479-1 curve
            tells you that 5 mA at 25 ms is on the boundary of the no-reaction zone<Cite id="iec-60479-2018" in={SOURCES} /><Cite id="nec-2023" in={SOURCES} />.
            An AFCI is calibrated against an arc fault in a damaged conductor — the relevant quantity is the
            high-frequency irregular signature of the current waveform, not its amplitude. A 5 A arc can be
            dangerous and a 5 A motor current can be perfectly normal, so the AFCI looks at the shape of the
            waveform rather than its magnitude<Cite id="nec-2023" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Can a GFCI replace a fuse or a regular breaker?">
          <p>
            No — they protect against different things. A GFCI protects people against ground-fault shock by
            tripping at 5 mA imbalance; a regular thermal-magnetic breaker protects wiring against overload and
            short-circuit by tripping at 1.5× to many times rated current. A GFCI breaker contains both functions
            in one device (GFCI sensing plus a conventional thermal-magnetic trip) so it can replace a regular
            breaker — but a GFCI receptacle by itself protects only against ground faults and still relies on the
            upstream breaker for overload protection<Cite id="nec-2023" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why doesn't a bird on a power line need a return path through the neutral?">
          <p>
            Because there is no current through the bird, with or without a return path. The bird's two feet sit
            on the same conductor; the voltage difference between any two points on the bird is essentially zero;
            Ohm's law then gives zero current regardless of the body's resistance. A "return path" is irrelevant
            in the absence of a driving potential difference<Cite id="iec-60479-2018" in={SOURCES} />. The bird
            sits at line potential — perhaps 80 kV above earth — but everything in the bird's body is at that
            same potential, and the bird never knows.
          </p>
        </FAQItem>

        <FAQItem q="Can I touch only one wire and still get shocked?">
          <p>
            Yes, if your body has a second path to a point at a different potential. Touching only the hot wire of
            a residential outlet while standing on a wet concrete floor or holding a grounded metal pipe routes
            current from the hot wire through your body to earth, and from there back through the building's
            grounding-electrode system to the bonded neutral at the main panel. The "second wire" of the loop
            is, in that case, the planet. The bird is safe on one wire because both of its feet are on the
            <em className="italic text-text"> same</em> wire and it is not in contact with anything else<Cite id="iec-60479-2018" in={SOURCES} /><Cite id="nec-2023" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What does CPR do for someone in ventricular fibrillation?">
          <p>
            CPR — chest compressions and rescue breathing — does not stop the fibrillation. Only a defibrillator
            (or the rare spontaneous reversion) can do that. What CPR does is keep some fraction of normal cardiac
            output going manually while the heart twitches incoherently, perfusing the brain enough to delay
            irreversible anoxic injury until a defibrillator arrives. Recovery from shock-induced fibrillation
            depends critically on how soon defibrillation occurs after the contact ends — the longer the
            uncoordinated rhythm persists, the lower the chance of restoring a normal beat<Cite id="iec-60479-2018" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why are taser pulses high voltage but not lethal?">
          <p>
            Because the pulses are short, the current per pulse is small, and the duty cycle is low. A typical
            conducted-energy weapon discharges 50 kV across the air gap to ionise it, then settles to about 1–2 kV
            across the body at perhaps a few milliamperes for each microsecond-scale pulse, repeated at 19 Hz.
            The cumulative charge per second delivered to the target is a few milli-coulombs — orders of magnitude
            below the level needed to drive a fibrillation-class current through the heart over the relevant
            duration<Cite id="iec-60479-2018" in={SOURCES} />. The pulse train is calibrated to cause neuromuscular
            incapacitation (tetany) without crossing the IEC 60479-1 fibrillation threshold for the integrated
            exposure.
          </p>
        </FAQItem>

        <FAQItem q="Why is the body's resistance so wildly variable?">
          <p>
            Because the largest single component, skin contact resistance, varies by two orders of magnitude with
            moisture, contact area, contact pressure, and integrity of the outer keratin layer. Internal tissue
            (muscle and blood) sits at a few hundred ohms hand-to-hand and is the same for everyone; intact dry
            skin can present 100 kΩ of additional series resistance at a fingertip, but breaks down dielectrically
            at a few hundred volts and drops to a few hundred ohms once it does. IEC 60479-1 publishes the entire
            distribution as a function of voltage, surface area, and skin condition<Cite id="iec-60479-2018" in={SOURCES} />.
            The two-decade variation is real and is the difference between a 120 V mishap that tingles and the
            same 120 V mishap that kills.
          </p>
        </FAQItem>

        <FAQItem q="What is 'step potential' and why are utility ground rods spaced apart from each other?">
          <p>
            When fault current pours into the soil at a single grounding electrode, the voltage in the surrounding
            earth falls off radially according to the spreading resistance of the rod-to-soil interface. A person
            standing nearby with one foot a metre from the rod and the other foot two metres away has the
            difference of those two soil potentials across their feet — the
            {' '}<Term def={<><strong className="text-text font-medium">step potential</strong> — the voltage difference between the two feet of a person standing on energised soil during a fault. Set by the spreading resistance of the soil around the grounding electrode and the magnitude of the fault current. Can reach hundreds of volts a metre during a substation fault.</>}>step potential</Term>{' '}
            — and a current path through the legs. Substation grounding is engineered with grid mats and multiple
            rods to keep step potentials below safe limits even during the largest possible fault. The same
            principle is why you should shuffle, not run, away from a downed power line in your yard<Cite id="osha-1910-269" in={SOURCES} /><Cite id="nec-2023" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What is equipotential bonding around a swimming pool, and why is it required?">
          <p>
            NEC Article 680 requires every exposed metal part within five feet of a residential pool — the ladder,
            the diving-board mount, the pump-motor housing, the underwater light niche, the deck drains, and the
            reinforcing steel of the deck slab — to be bonded together with a continuous No. 8 AWG copper
            conductor<Cite id="nec-2023" in={SOURCES} />. The point is not to ground all those parts to earth
            (though they are also grounded); it is to make sure every one of them sits at the same potential as
            every other. If a fault energises one of them, all of them rise together. A swimmer reaching from
            the ladder to the diving board across that span sees both surfaces at the same voltage and no
            potential difference across their body. The bonded grid is, in effect, the swimming pool's
            equivalent of a lineman's barehand bond.
          </p>
        </FAQItem>

        <FAQItem q="If a 200 A panel can deliver 8 kA into a bolted short, why doesn't the breaker just trip first?">
          <p>
            It does — but not instantly. A thermal-magnetic main breaker takes one to a few AC cycles (roughly
            20–50 ms) to clear a bolted short circuit; during that interval the full 8 kA of fault current flows
            through the arc and feeds the arc-flash energy<Cite id="nfpa-70e-2024" in={SOURCES} />. The arc-flash
            energy is the product V × I × t<sub>clear</sub>; the breaker minimises t<sub>clear</sub>, but cannot
            drive it to zero. Faster-acting current-limiting fuses and electronic-trip breakers cut t<sub>clear</sub>{' '}
            into the single-millisecond range and correspondingly cut arc-flash energy, which is why industrial
            switchgear that protects high-fault-current buses is often fused rather than relying on thermal-magnetic
            breakers alone<Cite id="nfpa-70e-2024" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why is the elementary charge in CODATA cited in a chapter about safety?">
          <p>
            Only obliquely: every milliampere threshold on the IEC 60479-1 chart — 1 mA, 5 mA, 10 mA, 100 mA —
            is a count of elementary charges per second crossing a section of body tissue, scaled by the
            CODATA 2018 value of the elementary charge, e = 1.602176634×10⁻¹⁹ C exactly<Cite id="codata-2018" in={SOURCES} />.
            A 5 mA GFCI threshold is, in fundamental units, 5×10⁻³ / 1.602×10⁻¹⁹ ≈ 3×10¹⁶ charges per second
            crossing the cardiac muscle. The numbers in the safety chart and the numbers on the breaker label
            ultimately reduce to the same constant.
          </p>
        </FAQItem>
      </FAQ>
    </ChapterShell>
  );
}
