/**
 * Chapter 18 — Transformers
 *
 * Two coils, one core, a different voltage on the other side. The direct
 * application of Faraday's law that built the 20th-century electric power
 * grid: step up at the plant, step down at every substation, step down
 * one more time at the pole outside your house. Same physics from
 * 1.5 GVA station transformers to the tiny SMPS ferrite in your phone
 * charger.
 */
import { CaseStudies, CaseStudy } from '@/components/CaseStudy';
import { ChapterShell } from '@/components/ChapterShell';
import { FAQ, FAQItem } from '@/components/FAQ';
import { Cite } from '@/components/SourcesList';
import { Formula, InlineMath } from '@/components/Formula';
import { Pullout } from '@/components/Prose';
import { Term } from '@/components/Term';
import { TryIt } from '@/components/TryIt';
import { TwoCoilTransformerDemo } from './demos/TwoCoilTransformer';
import { TurnsRatioDemo } from './demos/TurnsRatio';
import { StanleyDemo } from './demos/StanleyDemo';
import { ImpedanceReflectionDemo } from './demos/ImpedanceReflection';
import { CoreLossesDemo } from './demos/CoreLosses';
import { GridHierarchyDemo } from './demos/GridHierarchy';
import { AutotransformerDemo } from './demos/Autotransformer';
import { InRushCurrentDemo } from './demos/InRushCurrent';
import { HighFrequencyTransformerDemo } from './demos/HighFrequencyTransformer';
import { getChapter } from './data/chapters';

export default function Ch18Transformers() {
  const chapter = getChapter('transformers')!;
  const SOURCES = chapter.sources;

  return (
    <ChapterShell chapter={chapter}>
      <p>
        On a wooden pole at the end of every suburban street in North America hangs a grey cylindrical can about the
        size of a beer keg. Inside it: two coils of enamelled copper wire, a stack of thin sheets of silicon steel,
        and roughly thirty litres of mineral oil. A single high-voltage tap line enters from the cross-arm at the
        top, carrying alternating current at 12.47 kV. Three insulated conductors leave from the bottom: two hot
        legs at 120 V each and a grounded neutral between them. That can — the utility calls it a "pole-pig" — does
        exactly one thing: it takes 12,470 volts going in and produces 240 volts coming out. No moving parts, no
        electronics, no feedback control. Just Faraday's law, running for forty years on the same physics that
        Michael Faraday demonstrated to the Royal Society in 1831<Cite id="faraday-1832" in={SOURCES} />.
      </p>
      <p>
        A transformer is the simplest application of induction. Two coils share a magnetic core; alternating current
        in one drives an alternating flux through both; the second coil sees a voltage proportional to its turns
        count. That single fact — written in one line of high-school algebra — is what makes electric power
        distribution possible. Step a generator's 25 kV output up to 500 kV for cross-country transmission, step it
        down at the substation to 12 kV for the neighbourhood, step it down again at the pole to 240 V for the
        wall outlet, step it down a fifth time inside your laptop charger to 20 V for the lithium-ion cells. Every
        one of those conversions is a transformer. This chapter walks through what one of them actually does.
      </p>

      <h2>Two coils, one core</h2>

      <p>
        Wind a coil of <em>N<sub>p</sub></em> turns around one leg of a ring-shaped iron core, and a second coil of
        <em> N<sub>s</sub></em> turns around another leg of the same ring. Drive the first coil — the
        <Term def={<><strong>primary</strong> — the winding connected to the source. It accepts power from the supply and produces the changing flux in the core.</>}>primary</Term> —
        with an AC voltage source <em>V<sub>p</sub>(t)</em>. Current flows in the primary; that current creates an
        alternating magnetic field; the iron core funnels essentially all of that magnetic flux into the
        <em> secondary</em> leg, where it threads the second coil. By Faraday's law of induction, each turn of the
        secondary sees an EMF equal to <em>−dΦ/dt</em>, the time rate of change of flux through it. Add the EMFs of
        all <em>N<sub>s</sub></em> turns and you get the
        <Term def={<><strong>secondary</strong> — the winding connected to the load. Its terminal voltage is set by the ratio of turn counts to the primary.</>}>secondary's</Term>
        terminal voltage<Cite id="faraday-1832" in={SOURCES} /><Cite id="feynman-II-17" in={SOURCES} />.
      </p>
      <Formula>V<sub>s</sub>(t) = − N<sub>s</sub> dΦ / dt</Formula>
      <p>
        Apply the same logic to the primary. If the core's magnetic resistance (reluctance) is small enough that we
        can ignore the small magnetizing current — the ideal-transformer approximation — the primary's terminal
        voltage is also balanced by its own induced EMF<Cite id="griffiths-2017" in={SOURCES} />:
      </p>
      <Formula>V<sub>p</sub>(t) = − N<sub>p</sub> dΦ / dt</Formula>
      <p>
        Divide the two equations and the <em>dΦ/dt</em> cancels. What survives is the most famous one-liner in
        electrical engineering:
      </p>
      <Formula>V<sub>s</sub> / V<sub>p</sub> = N<sub>s</sub> / N<sub>p</sub></Formula>
      <p>
        The voltage ratio between the two coils equals the ratio of their turn counts. Wind 200 turns on the primary
        and 20 turns on the secondary, drive the primary at 240 V, and the secondary sits at 24 V — independent of
        frequency, independent of the actual flux waveform, independent of the load on the secondary (within the
        ideal limit). All four of those independences are real, and they are what makes a transformer such a clean
        engineering primitive.
      </p>

      <TurnsRatioDemo />

      <p>
        Notice what the picture says about <em>energy</em>. The flux in the core is set entirely by the primary's
        applied voltage divided by its turn count: <InlineMath>dΦ/dt = V<sub>p</sub>/N<sub>p</sub></InlineMath>.
        That same flux runs through the secondary regardless of what's connected on the other side. If nothing is
        connected — open-circuit secondary — no current flows; no power crosses the air gap; only a small
        <Term def={<><strong>magnetizing current</strong> — the small primary current required to establish the core flux even with no load. Sets the no-load draw of a transformer; ideally would be zero.</>}>magnetizing current</Term>
        flows in the primary to maintain the flux against the core's finite permeability<Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />.
      </p>

      <h2>The ideal transformer and the current ratio</h2>

      <p>
        Connect a resistive load <em>R</em> to the secondary. The secondary now carries a current
        <em> I<sub>s</sub> = V<sub>s</sub>/R</em>. That current also creates magnetic flux in the core — and by
        Lenz's law it opposes the primary's flux. To maintain the same core flux (which the primary's applied
        voltage demands), the primary must draw additional current to cancel the secondary's contribution. In the
        <Term def={<><strong>ideal transformer</strong> — the lossless, infinitely-permeable, no-leakage limit. Used as the conceptual starting point; every real transformer is a perturbation of this model.</>}>ideal transformer</Term>
        limit (no losses, infinite core permeability, no leakage flux), the result is a strict
        power balance<Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />:
      </p>
      <Formula>V<sub>p</sub> I<sub>p</sub> = V<sub>s</sub> I<sub>s</sub></Formula>
      <p>
        Combine that with <em>V<sub>s</sub>/V<sub>p</sub> = N<sub>s</sub>/N<sub>p</sub></em> and the current ratio
        falls out as the <em>inverse</em> of the turns ratio:
      </p>
      <Formula>I<sub>s</sub> / I<sub>p</sub> = N<sub>p</sub> / N<sub>s</sub></Formula>
      <p>
        A 10:1 <Term def={<><strong>step-down</strong> — the secondary turn count is smaller than the primary; voltage decreases, current increases. The pole transformer outside your house is step-down.</>}>step-down</Term>
        transformer takes 1000 V at 1 A on the primary and delivers 100 V at 10 A on the secondary. Same kilowatt.
        A 1:50 <Term def={<><strong>step-up</strong> — secondary turn count larger than primary; voltage rises, current falls. The transformer at every generating station is step-up.</>}>step-up</Term>
        transformer takes 480 V at 200 A on the primary side of a generating station and delivers 24 kV at 4 A onto
        the transmission bus. Same 96 kW. Voltage and current trade off against each other through the turns ratio;
        the product — power — is conserved.
      </p>

      <TwoCoilTransformerDemo />

      <p>
        Real transformers approach this ideal closely. A large utility power transformer runs at 99–99.5 % efficiency
        under nameplate load — the remaining 0.5–1 % shows up as heat in the core and copper and is dumped into the
        mineral-oil bath surrounding the windings<Cite id="mclyman-2004" in={SOURCES} />. A small consumer-grade unit
        (laptop charger, microwave-oven HV transformer) runs in the 90–97 % range. None of them moves; none of them
        wears in the mechanical sense. Half the transformers in your local substation were installed before you were
        born and will outlive you in service.
      </p>

      <TryIt
        tag="Try 18.1"
        question={<>A pole-mounted distribution transformer steps <strong>12,470 V</strong> down to <strong>240 V</strong> for residential service. What is the turns ratio?</>}
        hint="N_p / N_s = V_p / V_s."
        answer={
          <>
            <Formula>N<sub>p</sub> / N<sub>s</sub> = 12,470 / 240 ≈ <strong>52 : 1</strong></Formula>
            <p>
              Typical for a single-phase pole transformer feeding 240/120 V split-phase residential service.
              The pole-pig outside your house is built around exactly this ratio<Cite id="grainger-power-systems-2003" in={SOURCES} />.
            </p>
          </>
        }
      />

      <TryIt
        tag="Try 18.2"
        question={<>A <strong>60 W</strong> halogen lamp runs on the <strong>12 V</strong> secondary of a small transformer. The primary is fed from a <strong>120 V</strong> outlet. What is the turns ratio, and what current does the primary draw?</>}
        hint="Voltage ratio gives the turns ratio. Power balance (ideal) gives the primary current."
        answer={
          <>
            <Formula>N<sub>p</sub> / N<sub>s</sub> = 120 / 12 = <strong>10 : 1</strong></Formula>
            <p>The secondary current is <em>I<sub>s</sub> = 60 W / 12 V = 5 A</em>. By power balance:</p>
            <Formula>I<sub>p</sub> = 60 W / 120 V = <strong>0.5 A</strong></Formula>
            <p>
              The primary draws one-tenth the current at ten times the voltage. The 10:1 turns ratio appears once in
              voltage (down) and once in current (up); the product — 60 W — is unchanged across the
              transformer<Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />.
            </p>
          </>
        }
      />

      <TryIt
        tag="Try 18.5"
        question={<>A step-up transformer raises <strong>12 V</strong> to <strong>240 V</strong> for a small inverter's high-voltage rail. If the primary draws <strong>5 A</strong>, what current does an ideal secondary deliver?</>}
        hint="Power balance: V_p · I_p = V_s · I_s."
        answer={
          <>
            <Formula>I<sub>s</sub> = V<sub>p</sub> · I<sub>p</sub> / V<sub>s</sub> = 12 · 5 / 240 = <strong>0.25 A</strong></Formula>
            <p>
              The turns ratio is 1 : 20 (voltage up), so current goes down by exactly the same factor.
              Same 60 W on both sides<Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2>Stanley 1886 and the rise of AC distribution</h2>

      <p>
        On 20 March 1886, in the village of Great Barrington, Massachusetts, William Stanley Jr. switched on the first
        practical alternating-current distribution system in the world. A steam-driven Siemens generator produced
        500 V AC at a small powerhouse. The current ran 1.2 km on overhead wires into the centre of town, where
        Stanley's <em>induction coils</em> — purpose-built step-down transformers of his own design — dropped it to
        100 V for incandescent lights in two dozen stores and offices along Main Street<Cite id="stanley-1886" in={SOURCES} />.
        It worked. It was efficient. And it settled, in one demonstration, the most important engineering question
        of the late 19th century: how do you move electric power more than a kilometre at a time?
      </p>
      <p>
        The answer Stanley proved in the field, and Westinghouse (employing Tesla on the motor side) commercialised
        in the years that followed, was: use AC, transform up to high voltage for the transmission line, transform
        back down at the load. Edison's competing DC system couldn't transform — DC produces no <em>dΦ/dt</em>, so
        no induced secondary voltage — and was therefore limited to whatever voltage the end-user's bulbs could
        tolerate. At 110 V, Edison needed a generating station every mile or so just to keep wire losses
        manageable<Cite id="grainger-power-systems-2003" in={SOURCES} />. Stanley's AC could span a state.
      </p>

      <Pullout>
        Edison's DC needed a power station every mile. Stanley's AC could span a continent.
      </Pullout>

      <p>
        The reason is brutal arithmetic. The power dissipated in a transmission line of resistance <em>R</em>
        carrying current <em>I</em> is <em>P<sub>loss</sub> = I²R</em>. To deliver power <em>P</em> at voltage
        <em> V</em>, the line carries current <em>I = P/V</em>. So the loss is:
      </p>
      <Formula>P<sub>loss</sub> = (P / V)² · R = P² R / V²</Formula>
      <p>
        Quadratic in 1/V. Double the line voltage and the loss falls by a factor of four. Raise it tenfold and the
        loss drops a hundredfold. That is why the wires running the length of a continent operate at 230, 345, 500,
        or even 765 kV — the higher the better, until the air around the conductor itself starts to ionise (corona
        discharge). The same arithmetic in reverse is why your wall outlet is 120 V (or 230 V in Europe) and not
        12 kV: at high enough voltage, every kitchen accident becomes a fatality<Cite id="grainger-power-systems-2003" in={SOURCES} />.
      </p>

      <StanleyDemo />

      <TryIt
        tag="Try 18.3"
        question={<>Deliver <strong>1 MW</strong> over a <strong>100 km</strong> transmission line whose total resistance is <strong>R = 10 Ω</strong>. Compare the I²R loss at <strong>V = 4 kV</strong> (Stanley's era) to that at <strong>V = 400 kV</strong> (modern HV transmission).</>}
        hint="Compute I = P/V for each case, then I²R."
        answer={
          <>
            <p>At 4 kV:</p>
            <Formula>I = 10⁶ / 4×10³ = 250 A; &nbsp; P<sub>loss</sub> = (250)² · 10 = <strong>625 kW</strong></Formula>
            <p>62.5 % of the input is lost as heat in the wires before the energy ever reaches the town. Useless.</p>
            <p>At 400 kV:</p>
            <Formula>I = 10⁶ / 4×10⁵ = 2.5 A; &nbsp; P<sub>loss</sub> = (2.5)² · 10 = <strong>62.5 W</strong></Formula>
            <p>
              A ten-thousand-fold reduction in loss for a hundred-fold increase in voltage — exactly the <em>V²</em>
              scaling. This is the single most important fact in long-distance electric power
              engineering<Cite id="grainger-power-systems-2003" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2>Impedance transformation</h2>

      <p>
        The voltage and current ratios combine into a useful third law about
        <Term def={<><strong>impedance transformation</strong> — the relationship Z_p = (N_p/N_s)² · Z_s by which a transformer makes a load on its secondary look like a different impedance to the source on its primary. The basis of all transformer-based matching networks.</>}>impedance</Term>.
        Put a load <em>Z<sub>L</sub></em> on the secondary. From the primary's point of view, the transformer plus
        load together draw a current <em>I<sub>p</sub> = (N<sub>s</sub>/N<sub>p</sub>) · I<sub>s</sub></em> at a
        voltage <em>V<sub>p</sub> = (N<sub>p</sub>/N<sub>s</sub>) · V<sub>s</sub></em>. The ratio
        <em> V<sub>p</sub>/I<sub>p</sub></em> — the impedance seen looking into the primary — is therefore:
      </p>
      <Formula>Z<sub>p</sub> = (N<sub>p</sub> / N<sub>s</sub>)² · Z<sub>L</sub></Formula>
      <p>
        The square comes from the fact that the turns ratio appears once in voltage and once (inversely) in current.
        A 20:1 step-down transformer makes an 8 Ω speaker look like 8 · 400 = 3.2 kΩ when seen from the primary.
        That is exactly why audio output transformers exist: a vacuum-tube power stage wants to drive a load in the
        kilohm range to extract maximum power from the tube's high plate impedance, but a real loudspeaker is around
        8 Ω. A transformer in between, with turns ratio chosen to bridge those two values, performs the
        match<Cite id="mclyman-2004" in={SOURCES} /><Cite id="horowitz-hill-2015" in={SOURCES} />.
      </p>

      <ImpedanceReflectionDemo />

      <p>
        The same principle drives every RF matching network, every switching-supply transformer (whose winding ratio
        is dictated by both the input/output voltage ratio and the desired source impedance the controller sees),
        and every push-pull audio amplifier. In all of these contexts a transformer is acting not as a
        voltage-conversion device but as an impedance-conversion device — turning the load that's actually there
        into the load that the source wants to see<Cite id="horowitz-hill-2015" in={SOURCES} />.
      </p>

      <TryIt
        tag="Try 18.4"
        question={<>An <strong>8 Ω</strong> speaker is connected to a transformer with turns ratio <strong>N_p/N_s = 20</strong>. What impedance does the primary side see?</>}
        hint="Z_p = (N_p/N_s)² · Z_s."
        answer={
          <>
            <Formula>Z<sub>p</sub> = 20² · 8 Ω = 400 · 8 = <strong>3.2 kΩ</strong></Formula>
            <p>
              Right in the middle of the optimal load range for a typical single-ended pentode (e.g., EL84) at
              moderate plate voltage. A 20:1 transformer is therefore a sensible output-transformer choice for a
              small guitar amp<Cite id="horowitz-hill-2015" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2>Autotransformers: one winding instead of two</h2>

      <p>
        Everything so far has assumed two electrically separate windings sharing one core. Rewire the
        same iron: a single continuous winding with a <em>tap</em> brought out at a fraction <em>k</em> of
        the way down. Feed the full winding from the source; take the load off the portion between the
        tap and the bottom. The voltage ratio is still the turns ratio — <em>V<sub>s</sub>/V<sub>p</sub> = k</em> —
        but now the bottom section of the winding is shared between the two circuits.
        That sharing is the
        <Term def={<><strong>autotransformer</strong> — a transformer with a single tapped winding instead of two galvanically isolated windings. The shared section between primary and secondary terminals carries only the difference current I<sub>s</sub> − I<sub>p</sub>, allowing it to be wound from lighter wire — for a 2:1 step, autotransformer copper and iron are roughly half that of an isolated two-winding design of the same rating.</>}>autotransformer</Term>'s
        whole point: the shared portion carries only the <em>difference</em> current
        <em> I<sub>s</sub> − I<sub>p</sub> = (1 − k) I<sub>s</sub></em>, so it can be wound from much
        lighter wire. The total copper required falls by a factor of (1 − k) relative to a two-winding
        design of the same rating<Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />.
      </p>

      <AutotransformerDemo />

      <p>
        For small voltage steps the saving is dramatic: a 2:1 (k = 0.5) autotransformer uses about half the
        copper and iron of an equivalent two-winding transformer; a 10 % step (k = 0.9) uses a tenth. Grid
        operators take advantage of this routinely — the 345/138 kV interconnect transformers on the bulk
        power system, the 138/69 kV transformers in older substations, and the <em>variac</em> on a lab
        bench are all autotransformers<Cite id="grainger-power-systems-2003" in={SOURCES} />. The price is
        the loss of <em>galvanic isolation</em>: primary and secondary share metal, so a winding short
        between the upper and lower sections puts the full primary voltage on the load. That is why utility
        autotransformers are never used to step down to a voltage humans might touch.
      </p>

      <h2>Real transformer non-idealities</h2>

      <p>
        The ideal-transformer story above is exact in a fictional universe where the core has infinite permeability,
        zero electrical conductivity, and zero hysteresis; the windings have zero resistance; and every line of
        magnetic flux generated by one coil threads every turn of the other. Real cores and real wire have none of
        those properties. The deviations are bundled into four named loss/limitation mechanisms<Cite id="mclyman-2004" in={SOURCES} />.
      </p>
      <p>
        <strong>Copper losses</strong> are the simplest: each winding has a finite resistance R<sub>cu</sub>, and
        the current flowing through it dissipates <em>I²R</em> as heat. This is the dominant loss in a transformer
        operating near its rated load; sizing the wire (and therefore the window area in the core) trades against
        material cost.
      </p>
      <p>
        <strong><Term def={<><strong>Core lamination</strong> — assembling the magnetic core from many thin insulated sheets rather than as a solid block. Breaks up eddy-current paths and reduces eddy losses by orders of magnitude.</>}>Core losses</Term></strong> are
        what flows in the iron itself, and split into two:
      </p>
      <ul>
        <li>
          <strong><Term def={<><strong>Hysteresis loss</strong> — energy dissipated each AC cycle as the core's magnetic domains realign with the changing applied field. Proportional to the enclosed area of the B-H loop and to the operating frequency.</>}>Hysteresis loss</Term></strong>:
          the B-H curve of a ferromagnetic material encloses a finite area; each AC cycle, an energy proportional
          to that area is dissipated per unit volume of core as the magnetic domains rearrange themselves. Steinmetz
          characterised this experimentally in 1893 as <em>P<sub>h</sub> ∝ f · B<sub>peak</sub><sup>1.6</sup></em>
          for typical electrical steels<Cite id="steinmetz-1893" in={SOURCES} />.
        </li>
        <li>
          <strong><Term def={<><strong>Eddy current</strong> — a current loop induced inside a conductor by a time-changing magnetic flux passing through it. In transformer cores, eddy currents waste energy as I²R heat; laminating the core breaks the loops up and suppresses the loss.</>}>Eddy-current loss</Term></strong>:
          the changing flux drives circulating currents in the iron itself, and those eddy currents dump I²R into
          the core. The standard fix is to slice the core into thin laminations of grain-oriented silicon steel,
          each electrically insulated from its neighbours, so the eddy loops can't span the whole cross-section.
          Eddy-current loss scales as the square of lamination thickness, so 0.3 mm laminations dissipate ~10⁴ times
          less per unit volume than a 30 mm solid block at the same flux density and frequency<Cite id="mclyman-2004" in={SOURCES} />.
        </li>
      </ul>

      <CoreLossesDemo />

      <p>
        Adjacent to saturation lives one more practical non-ideality: <em>inrush</em>. Because the core
        flux is the time-integral of the applied primary voltage, the instant at which a transformer is
        first energised sets the DC offset of the flux waveform. Close the breaker at the voltage
        <em> peak</em> and the integral starts at its natural average; flux swings symmetrically about
        zero and the core never saturates. Close it at a voltage <em>zero-crossing</em> and the integral
        has a full half-cycle to climb before the next reversal — pushing the flux to roughly twice its
        normal peak, deep into the saturation region, before any reverse swing pulls it back. The
        magnetising current spikes accordingly, by a factor of 10–30× the steady-state value for the
        first few cycles<Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />.
      </p>

      <InRushCurrentDemo />

      <p>
        That spike is why the breaker upstream of a large transformer has an <em>inverse-time</em>
        trip curve rather than an instantaneous one: the inrush is brief, decaying within ten or twenty
        line cycles as the asymmetry damps out, and would nuisance-trip an instantaneous breaker every
        time the transformer was switched on. Modern controlled-switching gear measures the line phase
        and closes each pole near the optimal instant on purpose, suppressing the inrush by a factor of
        ten or more<Cite id="kundur-1994-power-stability" in={SOURCES} />.
      </p>

      <TryIt
        tag="Try 18.6"
        question={<>A 4 kVA transformer at <strong>60 Hz</strong> is wound with <strong>N<sub>p</sub> = 200</strong> turns and runs at <strong>B<sub>max</sub> = 1.5 T</strong> for a primary V<sub>rms</sub> = 240 V. What core cross-section A<sub>core</sub> does it need? (Use V = 4.44 · f · N · B · A.)</>}
        hint="Solve V = 4.44 · f · N · B · A for A."
        answer={
          <>
            <Formula>A<sub>core</sub> = V / (4.44 · f · N · B<sub>max</sub>)</Formula>
            <Formula>= 240 / (4.44 · 60 · 200 · 1.5) ≈ <strong>3.0 × 10⁻³ m²</strong></Formula>
            <p>
              About <strong>30 cm²</strong>, or a roughly 5.5 × 5.5 cm core leg. Doubling the frequency
              halves the required core area; this is the single most important equation in transformer
              sizing<Cite id="mclyman-2004" in={SOURCES} />.
            </p>
          </>
        }
      />

      <p>
        <strong><Term def={<><strong>Leakage inductance</strong> — flux generated by one winding that fails to thread the other winding. Behaves like a series inductance in the transformer's equivalent circuit and contributes to voltage regulation droop under load.</>}>Leakage inductance</Term></strong>
        is the share of each winding's flux that escapes the core and closes back on itself through air rather than
        threading the other winding. From outside, it looks like a small inductance in series with each winding. It
        causes the secondary terminal voltage to droop slightly under load (a few percent at full load for a
        well-built distribution unit) and limits the rate at which fault current can flow through the
        transformer — which is actually useful as a short-circuit protection mechanism on the grid.
      </p>
      <p>
        Finally there is the <em>magnetizing current</em> — the small current the primary must draw, even at
        no-load, to establish the core flux against the core's finite permeability. In a power-grid transformer
        it's typically 1–5 % of rated current. In a small consumer unit (wall-wart) it can be a much larger
        fraction, which is why a linear transformer-based wall-wart stays warm even when no load is plugged in.
      </p>
      <p>
        All four effects together drag practical transformer efficiency down from the ideal 100 % to typical values
        of 95–99.5 % for large units and 85–97 % for smaller ones<Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />.
        Charles Proteus Steinmetz introduced the use of complex-number (phasor) analysis to AC circuits in 1893,
        specifically to make the equivalent-circuit description of a real transformer tractable
        instead of impossible<Cite id="steinmetz-1893" in={SOURCES} />. That mathematical machinery is now the
        first chapter of every undergraduate power-electronics text.
      </p>

      <h2>The grid as a transformer hierarchy</h2>

      <p>
        Zoom out to the continent. Electric power leaves the stator terminals of a 1 GW nuclear or thermal generator
        at around 25 kV — limited by what the stator insulation can withstand. A
        <em> generator step-up transformer</em>, sitting on a concrete pad just outside the powerhouse, raises that
        to 230, 345, 500, or 765 kV for entry onto the transmission grid<Cite id="kundur-1994-power-stability" in={SOURCES} />.
        Hundreds of kilometres of overhead aluminium-conductor steel-reinforced (ACSR) cable carry the energy at
        those voltages with a few percent total I²R loss along the way.
      </p>
      <p>
        At a regional <em>bulk substation</em>, a second transformer steps the voltage down to roughly 138 kV for
        sub-transmission to the city. A third step at a <em>distribution substation</em> drops the voltage further
        to ~12.47 kV three-phase for the neighbourhood feeder. A fourth and final step, at the pole or pad
        transformer outside individual homes, drops one of the three phases to the 240 V centre-tapped split-phase
        that powers North American houses. Five conversion stages, four of them transformers (the fifth is the
        SMPS inside your laptop) — and the same physics at every one of them<Cite id="grainger-power-systems-2003" in={SOURCES} />.
      </p>

      <GridHierarchyDemo />

      <p>
        Across this whole hierarchy the total transmission and distribution losses run around 5–8 % of the energy
        generated. That number is what makes large-scale electrification economically viable: 95 % of the kilowatts
        leaving the plant actually reach a useful load on the other end. Take away the transformer at any of the
        five layers and the number collapses.
      </p>

      <h2>The frequency lever — and why your charger is small</h2>

      <p>
        The same one-line transformer equation — <em>V = 4.44 · f · N · B · A</em> — has a property that the
        designers of every power supply since the 1970s have exploited mercilessly. Hold the voltage, the turn
        count, and the peak flux density fixed and the required core cross-section <em>A</em> falls inversely with
        frequency. Run a 100 W transformer at 60 Hz and it needs roughly 120 cm³ of silicon steel. Run the same
        100 W transformer at 100 kHz and the equivalent ferrite core is about 1700 times smaller — a few cubic
        centimetres, weighing five grams instead of six hundred<Cite id="mclyman-2004" in={SOURCES} />.
      </p>

      <HighFrequencyTransformerDemo />

      <p>
        This is the single trick behind the gram-scale phone charger in your bag, the 400 Hz electrical system on
        any commercial aircraft (six times lighter than a 60 Hz system of the same rating), and every modern
        electric-vehicle traction inverter. The trade-offs do not vanish: at higher frequency, hysteresis loss grows
        roughly linearly (Steinmetz), eddy-current loss grows quadratically, the windings start to suffer from skin
        effect, and the silicon doing the switching has its own per-cycle loss — so the practical sweet spot for
        consumer SMPS is 65–500 kHz<Cite id="erickson-maksimovic-2020" in={SOURCES} />. Push higher than that and
        you need wide-bandgap semiconductors (SiC, GaN) and very careful magnetics design to stay ahead.
      </p>

      <h2>What we have so far</h2>

      <p>
        A transformer is two coils sharing one magnetic core. Faraday's law applied independently to each coil gives
        a voltage ratio equal to the turns ratio: <em>V<sub>s</sub>/V<sub>p</sub> = N<sub>s</sub>/N<sub>p</sub></em>.
        Power balance (in the ideal limit) gives the inverse current ratio. Combine and an impedance on one side
        looks like the same impedance times the squared turns ratio on the other. Real cores add hysteresis, eddy
        currents, leakage inductance, magnetizing current, and copper losses — bundled into a few-percent efficiency
        hit. Five layers of these devices, in series, take 25 kV from a generator and deliver 120 V to your wall
        outlet at 92–95 % overall efficiency. The entire 20th-century electric power grid is built on those four
        equations and the iron sheets that make them work.
      </p>
      <p>
        Next chapter: the silicon at the bottom of the chain — the rectifiers and inverters that swap between AC
        and DC, which is what every chip in your laptop ultimately wants.
      </p>

      <CaseStudies
        intro={
          <>
            Four transformers spanning ten orders of magnitude in power and four in operating frequency, all running
            on the same one-line equation.
          </>
        }
      >
        <CaseStudy
          tag="Case 18.1"
          title="The pole-pig outside your house"
          summary="Single-phase 25 kVA pole-mounted distribution transformer; the last step before your wall outlet."
          specs={[
            { label: 'Type', value: <>single-phase oil-filled pole-mount</> },
            { label: 'Primary', value: <>~12.47 kV (line-to-neutral on a 12.47/7.2 kV system) <Cite id="grainger-power-systems-2003" in={SOURCES} /></> },
            { label: 'Secondary', value: <>240 V centre-tapped; ±120 V to the neutral</> },
            { label: 'Turns ratio', value: <>~52:1</> },
            { label: 'Rating', value: <>25 kVA typical for one home; 50–100 kVA on shared poles</> },
            { label: 'Efficiency', value: <>~98 % at rated load <Cite id="mclyman-2004" in={SOURCES} /></> },
            { label: 'Service life', value: <>30–40 years; mineral-oil cooling and insulation</> },
          ]}
        >
          <p>
            The grey can on the pole at the end of the block is a single-phase distribution transformer. One leg of
            the local 3-phase 12.47 kV feeder taps into its high-voltage bushing; the secondary leaves as three
            insulated conductors — two 120 V hots out of phase with each other and a centre-tap neutral — that drop
            down to the service drop wire and into your meter. Inside the can, a stack of laminated grain-oriented
            silicon steel forms a rectangular core; copper or aluminium windings wrap two of its legs; and roughly
            30 litres of mineral oil fill the rest of the volume, both insulating and convectively cooling the
            windings.
          </p>
          <p>
            The unit is utterly passive. It has no controls, no fans, no electronics. It is sized so that under the
            worst summer-evening load (everybody running air conditioning at once) the oil temperature stays under
            ~95 °C; the rest of the time it runs cool. A typical pole-pig is rated 25 kVA, which is just enough to
            simultaneously power a 5-ton air conditioner, an electric range, and a couple of refrigerators in a
            single suburban home. When the rating is too small for the load, the transformer overheats, the oil
            degrades, and eventually the windings fail to ground — which is the rare cause of the loud transformer
            "boom" sometimes heard during a heat wave<Cite id="grainger-power-systems-2003" in={SOURCES} />.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 18.2"
          title="The flyback inside your USB-C charger"
          summary="A high-frequency ferrite-core SMPS transformer barely larger than a postage stamp, switching at ~100 kHz."
          specs={[
            { label: 'Topology', value: <>flyback converter, primary-side regulated</> },
            { label: 'Core', value: <>ferrite (MnZn ~3F35 or similar), EE-13 or EE-19 size</> },
            { label: 'Switching frequency', value: <>65–150 kHz <Cite id="mclyman-2004" in={SOURCES} /></> },
            { label: 'Primary', value: <>~50 turns; ~325 V DC bus (rectified 230 V AC line)</> },
            { label: 'Secondary', value: <>~5 turns; 20 V (USB-PD) or 5 V (legacy)</> },
            { label: 'Mass', value: <>~5 g for a 30 W unit; <strong>1000×</strong> lighter than a linear 60 Hz equivalent</> },
          ]}
        >
          <p>
            The brick at the end of your phone cable contains a transformer, but it doesn't look like the pole-pig.
            It's a tiny ferrite core wound with a handful of turns of magnet wire, switching at 100 kHz instead of
            60 Hz. Both ends of that frequency ratio matter. Higher frequency means smaller required flux per
            volt-second across each winding, which means smaller core area to avoid saturation; smaller core area
            means a physically tiny transformer. The trade-off is hysteresis loss (which scales with frequency) and
            switching loss in the controlling silicon — both kept manageable by using ferrite (not silicon steel)
            for the core and by using soft-switching control schemes that minimise dissipation during the transistor's
            transitions<Cite id="mclyman-2004" in={SOURCES} />.
          </p>
          <p>
            The economic and ecological story is striking. A 30 W linear 50 Hz transformer used to weigh roughly 1 kg
            and ran at 80–85 % efficiency. The 30 W flyback that replaced it weighs about 5 grams and runs above
            90 %. The aggregate copper, iron, and assembly labour saved by the switching-supply transition
            (commercial since the 1970s; universal in consumer electronics since the early 2000s) is on the order of
            millions of tonnes per year worldwide<Cite id="mclyman-2004" in={SOURCES} />.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 18.3"
          title="Substation step-down: 138 kV → 12.47 kV"
          summary="A typical distribution substation transformer, ~25 MVA, oil-filled, with on-load tap changer."
          specs={[
            { label: 'Type', value: <>three-phase oil-filled, Y-Y or delta-Y connected</> },
            { label: 'Primary', value: <>138 kV (sub-transmission)</> },
            { label: 'Secondary', value: <>12.47/7.2 kV (distribution feeder)</> },
            { label: 'Rating', value: <>10–50 MVA typical <Cite id="grainger-power-systems-2003" in={SOURCES} /></> },
            { label: 'Efficiency at full load', value: <>~99.5 % <Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} /></> },
            { label: 'Cooling', value: <>ONAN/ONAF — oil natural / oil forced with radiators and fans</> },
            { label: 'Mass', value: <>40–100 tonnes; non-trivial to truck in</> },
          ]}
        >
          <p>
            The fenced installation off the highway between the freeway and your neighbourhood is a distribution
            substation, and the squat olive-drab thing in the middle of it — about the size of a cargo container —
            is the substation transformer. Three-phase, with both windings of all three phases sharing one large
            laminated steel core inside an oil-filled tank. It receives 138 kV from the sub-transmission lines that
            arrive at the top of the substation yard and produces 12.47 kV on the bus that fans out as feeders to
            the surrounding streets<Cite id="grainger-power-systems-2003" in={SOURCES} />.
          </p>
          <p>
            Beyond the basic step-down ratio, the unit has an <em>on-load tap changer</em>: a motor-driven switch
            that selects among taps brought out from the high-voltage winding, allowing the effective turns ratio to
            be adjusted by ±10 % in small steps without interrupting service. This keeps the distribution feeder
            voltage within statutory tolerance (typically ±5 %) as upstream voltage and downstream load vary through
            the day. The tap changer is the only moving part in an otherwise static device; it is also the part most
            likely to fail, and most substation transformer outages trace to tap-changer mechanical
            issues<Cite id="kundur-1994-power-stability" in={SOURCES} />.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 18.4"
          title="Audio output transformer in a tube amp"
          summary="The matching transformer between a vacuum-tube power stage and an 8 Ω speaker — and the reason tube amps sound the way they sound."
          specs={[
            { label: 'Primary', value: <>~3.5–8 kΩ plate-to-plate (push-pull) <Cite id="horowitz-hill-2015" in={SOURCES} /></> },
            { label: 'Secondary', value: <>4, 8, or 16 Ω speaker taps</> },
            { label: 'Turns ratio', value: <>typically 20:1 to 30:1 step-down</> },
            { label: 'Core', value: <>grain-oriented silicon steel, ~0.35 mm laminations</> },
            { label: 'Bandwidth', value: <>~30 Hz – 20 kHz at low distortion <Cite id="mclyman-2004" in={SOURCES} /></> },
            { label: 'Rating', value: <>5–100 W audio depending on amp size</> },
          ]}
        >
          <p>
            A vacuum-tube power stage wants to drive a load in the kilohm range to extract usable power from the
            tube's high plate impedance. A loudspeaker is 4–16 Ω. The output transformer between them performs the
            impedance match: <em>Z<sub>p</sub> = (N<sub>p</sub>/N<sub>s</sub>)² Z<sub>s</sub></em>, so a 25:1
            transformer turns an 8 Ω speaker into a 5 kΩ load as seen at the tube's plate. Without it, the speaker
            would draw essentially no power from the tube — almost all of the available energy would dissipate in
            the tube's own internal resistance<Cite id="horowitz-hill-2015" in={SOURCES} />.
          </p>
          <p>
            The audio-output transformer is also where most of the tube amp's "character" comes from. Its core
            saturates softly at high signal levels, adding even-order harmonic distortion; its leakage inductance
            rolls off the top end; its primary inductance limits the bottom. A well-built output transformer with
            generous core area and interleaved windings holds a flat 30 Hz – 20 kHz response and contributes less
            than a percent total harmonic distortion; a cheap one is what makes a budget guitar amp sound the way it
            does. Iconic units from companies like Mercury Magnetics, Hammond, and Partridge are sold on this
            reputation alone<Cite id="mclyman-2004" in={SOURCES} />.
          </p>
        </CaseStudy>
      </CaseStudies>

      <FAQ
        intro="Loose threads — questions a careful reader tends to surface about a device that looks deceptively simple."
      >
        <FAQItem q="Why does a transformer have an iron core at all?">
          <p>
            Because iron's relative magnetic permeability is typically 1,000–10,000 — the iron concentrates the flux
            from the primary into a tight path that the secondary can capture, instead of letting it spread out into
            free air. Without the iron, the leakage inductance would be enormous (most of the primary's flux would
            never reach the secondary), the magnetizing current would be huge, and the device would barely couple
            the two coils. The trade-off is that iron also brings hysteresis and eddy-current losses; the engineering
            balance has favoured iron (and at high frequencies, ferrite) for the entire history of the
            technology<Cite id="mclyman-2004" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why are transformer cores built from thin laminations and not a solid block?">
          <p>
            To suppress eddy-current loss. A time-changing magnetic flux passing through a conductor (and iron is a
            decent conductor) induces circulating currents in the conductor by Faraday's law — those eddy currents
            dump I²R as heat. Slicing the core into thin sheets insulated from each other breaks the eddy-current
            loops; each lamination supports its own small loop instead of one giant loop spanning the whole
            cross-section. Eddy-current loss falls as the square of lamination thickness, so 0.3 mm sheets dissipate
            about a thousand times less than a 10 mm solid would at the same flux<Cite id="mclyman-2004" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why doesn't a transformer work on DC?">
          <p>
            Because the secondary's induced EMF is <em>−N<sub>s</sub> dΦ/dt</em>. Steady DC produces a steady flux,
            so <em>dΦ/dt = 0</em> and the secondary EMF is zero. Worse, with no induced EMF on the primary to
            balance the applied voltage, the primary draws whatever current its DC resistance allows — usually large
            enough to burn the winding out. The transformer is a strictly-AC device; DC distribution (Edison's loss
            in 1886) had to wait a century for HVDC inverter technology to bridge it back to AC at the
            far end<Cite id="faraday-1832" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why are large utility transformers oil-filled?">
          <p>
            Two reasons. First, mineral oil is a far better electrical insulator than air, so the windings can be
            packed closer together and run at higher voltage per metre. Second, oil is a much better convective
            coolant than air — natural circulation alone carries multi-megawatt loss densities away from the windings
            and out to radiator fins on the outside of the tank. The downside is fire risk (mineral oil is
            flammable) and environmental hazard if the tank leaks; modern installations use either fire-retardant
            ester fluids or sealed-tank configurations to manage both<Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="How does an autotransformer differ from a normal two-winding transformer?">
          <p>
            An autotransformer has a single tapped winding rather than two separate windings: a portion of the
            winding is shared between primary and secondary circuits. For small step ratios (say 2:1 or less), this
            uses much less copper and iron than a two-winding design of the same rating, because most of the power
            is transferred conductively rather than magnetically. The trade-off is that primary and secondary are
            not galvanically isolated — a failure or insulation breakdown puts full primary voltage on the secondary.
            Autotransformers are common on the grid for small step changes (e.g., 138 kV → 69 kV) and in voltage
            regulators<Cite id="grainger-power-systems-2003" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What is transformer 'regulation'?">
          <p>
            The percentage drop in secondary voltage from no-load to full-load, expressed as a fraction of the
            nameplate secondary voltage. A "5 % regulation" transformer's secondary drops from 100 % at no load to
            95 % at full rated load. The drop comes from copper losses (I²R) and leakage inductance (XI), which act
            like small series impedances in the equivalent circuit. Distribution transformers run 2–5 % regulation;
            higher numbers indicate more leakage inductance, which is intentional in some
            short-circuit-protection contexts<Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why is the power grid 50 or 60 Hz and not, say, 400 Hz?">
          <p>
            History and core sizing. Late-19th-century mechanical generators couldn't easily spin much faster than
            50 or 60 Hz electrical, and the standards calcified once a critical mass of equipment was built around
            them. Higher frequencies would actually allow smaller transformer cores (for the same volt-second
            capacity), which is exactly why aircraft electrical systems run at 400 Hz — but at high frequency the
            transmission-line characteristics change (skin effect, radiation, reactive losses on long lines) and the
            grid would have to be rebuilt entirely. The status quo is stable<Cite id="grainger-power-systems-2003" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why do aircraft electrical systems use 400 Hz?">
          <p>
            For the same reason your laptop charger uses 100 kHz: the required transformer cross-section scales
            inversely with frequency, so 400 Hz transformers are roughly six times lighter than 60 Hz transformers
            of the same rating. On an aircraft, every kilogram saved on power-distribution iron is a kilogram of
            payload capacity. The trade-off is that 400 Hz wiring suffers more from skin-effect and radiation
            losses than 60 Hz wiring, which is fine over the short distances inside an airframe and unworkable over
            a continental transmission grid<Cite id="mclyman-2004" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What is an isolation transformer, and why would I want one?">
          <p>
            An isolation transformer is a 1:1 transformer whose only function is to galvanically separate primary
            and secondary circuits — break the conductive path between line and load. The secondary "floats" with
            respect to ground, so touching one secondary lead to ground produces no shock; only touching both
            simultaneously closes the circuit. Used in hospitals (around patients connected to monitoring
            equipment), in service-bench equipment for working on live circuits, and as a safety measure on any
            instrument where common-mode current paths through ground would be dangerous<Cite id="horowitz-hill-2015" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Can a transformer step up DC pulses?">
          <p>
            Yes — that's exactly how a flyback converter works, and how the high-voltage transformer in an old CRT
            television produced 25 kV from a 100 V switching pulse. The primary is fed a square-wave or pulse
            voltage; <em>dΦ/dt</em> is large during each transition, so the secondary delivers proportionally large
            voltage spikes. The catch is that the average flux can't grow without bound, so the core must reset
            between pulses (either by alternating polarity, as in a push-pull driver, or by a dedicated reset
            winding, or by a resonant capacitor). The flyback configuration uses the magnetising current itself
            as the energy-storage mechanism<Cite id="erickson-maksimovic-2020" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What's a current transformer and how is it different from a voltage transformer?">
          <p>
            A current transformer (CT) is a transformer whose primary is the existing power conductor — typically a
            single pass of the busbar through the core — and whose secondary is a many-turn winding feeding a low-
            impedance measurement load (often an ammeter or protection relay). The turns ratio is large (~ 1:1000),
            so a 1000 A primary current produces a clean 1 A secondary that's safely meterable. CTs and the more
            usual voltage-transformer (VT) instruments together let utility metering and protection equipment
            sample bus voltage and current cleanly without being exposed to bus
            potential<Cite id="grainger-power-systems-2003" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What's a 'wall wart,' and why does it sometimes hum or buzz?">
          <p>
            A wall-wart is the squat power adapter that plugs into the wall: either an old-style 50/60 Hz linear
            transformer + rectifier + capacitor (heavy, warm even at no-load) or a modern flyback switching supply
            (light, cool, with a small ferrite transformer inside). The hum on the old style is mechanical: AC flux
            in the laminations causes magnetostrictive vibration at 100/120 Hz (twice line frequency, because the
            force is proportional to B²). The buzz on the new style is usually the switching frequency partially
            modulated by load — audible because something inside has gone slightly resonant<Cite id="mclyman-2004" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why are large transformers so heavy?">
          <p>
            Because their cores and copper windings are sized for the volt-second capacity they have to handle at
            60 Hz. The required core cross-section scales as <em>V<sub>p</sub>/(N<sub>p</sub> · f · B<sub>sat</sub>)</em>;
            at 60 Hz with a few-hundred-turn primary at distribution voltage and a saturation field around 1.5 T for
            silicon steel, you end up with a core of tens to hundreds of cubic decimetres. Add the copper to carry
            tens to thousands of amps, the oil to insulate and cool it, and the steel tank to hold all that, and a
            substation transformer easily reaches 50–100 tonnes. A flyback running 1000× faster shrinks all of those
            numbers proportionally — hence the gram-scale phone-charger transformer<Cite id="mclyman-2004" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What's the difference between a transformer and an inductor?">
          <p>
            An inductor is a single coil storing energy in the magnetic field of its own current. A transformer is
            two (or more) coils coupling energy <em>between</em> circuits via a shared flux. The primary of a
            transformer at no load behaves almost exactly like a (large) inductor; what distinguishes the
            transformer is the second coil and the engineered coupling between them. Some power-electronics
            topologies — notably the flyback — use a single magnetic component that is simultaneously a coupled
            inductor (storing energy in the gap during the on-time) and a transformer (transferring it to the
            secondary during the off-time)<Cite id="erickson-maksimovic-2020" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Is a Tesla coil really a transformer?">
          <p>
            Yes, but an unusual one. A Tesla coil is a resonant air-core transformer: primary and secondary are
            tuned to the same resonant frequency (kHz to MHz, much higher than line frequency), and energy
            transfer happens via the magnetic-field coupling between them, amplified by the secondary's high Q. The
            turns ratio is large (1:100 to 1:1000), and the secondary develops hundreds of kilovolts as an open-
            circuit display arc. No iron core; the magnetic coupling is much weaker than in a power transformer,
            but the resonance buys back the coupling efficiency. The same architecture, less the spark, is the basis
            of every wireless-charging system in commercial use today<Cite id="mclyman-2004" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="If transformer cores work better at higher flux, why don't designers push the flux to the maximum?">
          <p>
            Because iron saturates. Above roughly 1.5–1.8 T (for grain-oriented silicon steel), the differential
            permeability of the core collapses toward that of air; the magnetising current spikes up, hysteresis
            losses balloon (Steinmetz's <em>B<sup>1.6</sup></em> exponent compounds), and the transformer becomes a
            nuisance. Designers pick the operating peak flux density at ~1.5 T as a sweet spot between core volume
            (smaller is better) and core loss + magnetising current (lower is better). High-frequency ferrite cores
            saturate even lower (~0.4 T), so SMPS transformers run at proportionally lower peak flux but at much
            higher frequency<Cite id="mclyman-2004" in={SOURCES} /><Cite id="steinmetz-1893" in={SOURCES} />.
          </p>
        </FAQItem>
      </FAQ>
    </ChapterShell>
  );
}
