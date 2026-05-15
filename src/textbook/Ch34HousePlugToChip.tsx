/**
 * Chapter 34 — From plug to chip
 *
 * The capstone of the entire textbook and the final chapter of the
 * house-electricity applied track. Walks the energy from the wall socket to
 * the M3 die through the seven distinct power conversions inside a laptop
 * charger and the laptop itself. Each section pulls explicitly on the
 * physics developed earlier in the book — Ch.5 (capacitors), Ch.12 (AC and
 * impedance), Ch.14 (semiconductors), Ch.16 (filters and op-amps),
 * Ch.22 and Ch.23 (transformers, coupled circuits), Ch.24 (rectifiers,
 * inverters, switch-mode topologies).
 */
import { CaseStudies, CaseStudy } from '@/components/CaseStudy';
import { ChapterShell } from '@/components/ChapterShell';
import { FAQ, FAQItem } from '@/components/FAQ';
import { Cite } from '@/components/SourcesList';
import { Formula, InlineMath } from '@/components/Formula';
import { Pullout } from '@/components/Prose';
import { Term } from '@/components/Term';
import { TryIt } from '@/components/TryIt';
import { getChapter } from './data/chapters';

export default function Ch34HousePlugToChip() {
  const chapter = getChapter('house-plug-to-chip')!;
  const SOURCES = chapter.sources;

  return (
    <ChapterShell chapter={chapter}>
      <p className="chapter-intro">
        A MacBook Pro M3 sits on the desk, drawing roughly thirty watts on average while the
        browser scrolls and the editor compiles. The wall socket it is plugged into delivers
        120 V AC at 60 Hz<Cite id="codata-2018" in={SOURCES} />. Between those two endpoints,
        seven separate power conversions hand off through six intermediate voltages — and
        every one of them is a chapter of this textbook compressed into a few square
        centimetres of silicon, ferrite, and aluminium electrolyte. The wall's 120 V AC is
        rectified into a pulsating 170 V DC; smoothed by a bulk capacitor into a flat 170 V
        bus; chopped by a MOSFET at roughly 100 kHz into a square wave across a flyback
        transformer's primary; stepped down and isolated through that transformer to a 20 V
        AC secondary; rectified again into 20 V DC at the USB-C cable; negotiated by digital
        protocol with the laptop; and finally walked down through a cascade of on-board buck
        converters and on-die regulators to the 0.8 V rail that powers the M3's
        core<Cite id="erickson-maksimovic-2020" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        This is the textbook integrating itself on a single device. Every other chapter has
        introduced one piece of the chain — the diode (Ch.14), the MOSFET (Ch.14), the
        transformer (Ch.23), the bulk capacitor (Ch.5), the buck converter (Ch.24), the
        rectifier (Ch.24), the linear regulator (Ch.16). This chapter walks the energy from
        the plug to the chip, naming each stage, writing down the formula that governs it,
        and pointing back to the chapter where its physics was developed. Seven conversions,
        six intermediate buses, one electron arriving at a gate.
      </p>

      <h2 className="chapter-h2">Stage 1: AC mains to a <em>bridge-rectified pulse train</em></h2>

      <p className="mb-prose-3">
        The first thing inside the charger is a{' '}
        <Term def={<><strong className="text-text font-medium">bridge rectifier</strong> — four diodes arranged in a square so that whichever AC terminal is positive, current always leaves the bridge through the same DC output terminal. Folds both halves of the AC cycle into the same polarity at the output, producing a pulsating DC at twice the line frequency.</>}>bridge rectifier</Term>:
        four diodes wired in a square between the two AC mains conductors and the two DC bus
        terminals. The argument was developed in Ch.24. Whichever AC pin happens to be
        positive at a given instant, two of the four diodes are forward-biased and the other
        two are reverse-biased, and the geometry of the connections guarantees that current
        always leaves the bridge through the same output terminal as positive. The negative
        half of the line cycle gets flipped right-side-up; both halves now drive the load in
        the same direction<Cite id="erickson-maksimovic-2020" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        On the time-domain output, the bridge produces a sequence of positive half-sinusoid
        humps at <strong className="text-text font-medium">twice</strong> the line frequency — 120 Hz from a 60 Hz mains, 100 Hz
        from a 50 Hz mains. The peak of each hump is not 120 V but the peak of the sine
        wave whose RMS is 120 V:
      </p>
      <Formula>V<sub>peak</sub> = √2 · V<sub>rms</sub></Formula>
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">V<sub>peak</sub></strong> is the instantaneous peak voltage of the
        rectified pulse train (in volts), and <strong className="text-text font-medium">V<sub>rms</sub></strong> is the
        root-mean-square value of the AC mains — the standard 120 V (US) or 230 V (EU)
        quoted on the outlet (also in volts). The factor √2 ≈ 1.414 is geometric, falling
        out of the time-integral of sin²(ωt) over one cycle<Cite id="horowitz-hill-2015" in={SOURCES} />.
        For 120 V<sub>rms</sub> mains, V<sub>peak</sub> ≈ 170 V; for 230 V<sub>rms</sub>
        European mains, V<sub>peak</sub> ≈ 325 V. Every component on the DC side of the
        bridge has to be rated to survive that peak, not the RMS.
      </p>
      <p className="mb-prose-3">
        At this stage the output is correctly polarised but utterly unfit for a digital load:
        the voltage swings from 0 V to 170 V and back twice every line cycle. Stage 2 fixes that.
      </p>

      <h2 className="chapter-h2">Stage 2: Pulse train to <em>bulk DC</em></h2>

      <p className="mb-prose-3">
        Strap a big capacitor across the bridge's output terminals and the picture changes.
        The capacitor charges to the peak of each hump on the way up and then holds the
        voltage near the peak while the next hump climbs back. The argument is exactly the
        RC discharge from Ch.5 and the smoothing analysis from Ch.24, applied to a load
        that draws a roughly constant DC current. The capacitor — typically a{' '}
        <Term def={<><strong className="text-text font-medium">bulk capacitor</strong> — the large electrolytic capacitor sitting on the DC bus of an AC-DC supply, sized to ride out the gap between bridge-rectifier peaks. Typical values: 100–470 µF rated for 400 V or more in a 120 V mains charger.</>}>bulk electrolytic capacitor</Term>{' '}
        of 100 to 220 µF, rated for 400 V — sees the bridge top it up to V<sub>peak</sub> on
        every half-cycle and watches its charge bleed into the load between
        peaks<Cite id="horowitz-hill-2015" in={SOURCES} />.
      </p>
      <Formula>ΔV<sub>ripple</sub> ≈ I<sub>load</sub> / (2 · f<sub>line</sub> · C)</Formula>
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">ΔV<sub>ripple</sub></strong> is the peak-to-peak ripple voltage left on
        top of the DC bus (in volts), <strong className="text-text font-medium">I<sub>load</sub></strong> is the steady DC
        current drawn from the bus (in amperes), <strong className="text-text font-medium">f<sub>line</sub></strong> is the line
        frequency (60 Hz in the US, 50 Hz in Europe; in hertz), and <strong className="text-text font-medium">C</strong> is the
        bulk-capacitor value (in farads). The factor of two in the denominator comes from
        full-wave rectification: there are <em className="italic text-text">two</em> peaks per line cycle, so the cap only
        has to hold up the load for half a cycle between recharges<Cite id="erickson-maksimovic-2020" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        For a 30 W laptop being charged through a flyback-side draw of roughly 0.2 A on the
        170 V bus, a 220 µF bulk cap gives ΔV<sub>ripple</sub> ≈ 0.2 / (2 · 60 · 220×10⁻⁶) ≈
        7.6 V — small enough on top of a 170 V baseline that the downstream stage barely
        notices. (Push the load up to half an amp and the ripple climbs to ~19 V, which is
        still acceptable for a flyback's input but starts to matter for power-factor
        correction — see the FAQ.) The output of stage 2 is now what the engineer's
        schematic labels <strong className="text-text font-medium">V<sub>bulk</sub></strong>: a roughly flat 170 V DC bus with
        a small triangular wobble on top at 120 Hz.
      </p>

      <TryIt
        tag="Try 34.1"
        question={
          <>
            A bulk capacitor of <strong className="text-text font-medium">220 µF</strong> sits on the DC bus of a 60 Hz US
            charger. The downstream flyback draws an average of <strong className="text-text font-medium">1 A</strong> from this
            bus. What is the peak-to-peak ripple voltage on V<sub>bulk</sub>?
          </>
        }
        hint={<>ΔV ≈ I / (2 · f<sub>line</sub> · C).</>}
        answer={
          <>
            <Formula>ΔV<sub>ripple</sub> = 1 / (2 · 60 · 220×10⁻⁶) ≈ 37.9 V</Formula>
            <p className="mb-prose-1 last:mb-0">
              About <strong className="text-text font-medium">38 V peak-to-peak</strong> on top of a 170 V baseline — large
              enough that the flyback's controller has to compensate for the input swing,
              which is one reason higher-power chargers add an active power-factor-correction
              pre-regulator between the bridge and the bulk cap<Cite id="erickson-maksimovic-2020" in={SOURCES} />.
              Drop I to 0.2 A and the ripple collapses to 7.6 V — comfortably small.
            </p>
          </>
        }
      />

      <h2 className="chapter-h2">Stage 3: <em>Chopping</em> the bulk DC at 100 kHz</h2>

      <p className="mb-prose-3">
        Now comes the move that made modern chargers small. The flat 170 V bus from stage 2
        is chopped on and off by a high-side{' '}
        <Term def={<><strong className="text-text font-medium">MOSFET switch</strong> — the metal-oxide-semiconductor field-effect transistor described in Ch.14, used here as a voltage-controlled switch. The gate sees the controller IC's PWM signal; the drain-source channel conducts when the gate is above threshold and blocks when it is below.</>}>MOSFET</Term>{' '}
        at a{' '}
        <Term def={<><strong className="text-text font-medium">switching frequency</strong> — the rate at which the SMPS controller toggles its main switch. Determines the size of the magnetic and capacitive energy stores: at higher frequency, less energy needs to be stored per cycle, so the transformer and output cap shrink.</>}>switching frequency</Term>{' '}
        f<sub>sw</sub> of typically 65 to 130 kHz, producing a square wave that swings between
        0 V and the bulk-bus voltage. The MOSFET itself is straight out of Ch.14: a four-terminal
        voltage-controlled switch with picosecond-scale turn-on. The reason for chopping at
        this frequency rather than passing the DC straight to the transformer is structural,
        not electrical, and it justifies the entire architecture of every modern AC-DC
        supply<Cite id="erickson-maksimovic-2020" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        The next stage, stage 4, is a transformer. The volume of magnetic core a transformer
        needs to handle a given power scales as <em className="italic text-text">1/f</em> for the operating frequency.
        Run the transformer at 60 Hz — the mains frequency — and you need a brick-sized lump
        of laminated iron, the kind of brick that sat on the floor between a 1990s laptop and
        its wall plug. Run the transformer at 100 kHz — three orders of magnitude faster —
        and the same power goes through a thimble-sized chunk of ferrite. The switching MOSFET
        and its controller exist solely to make that frequency
        shift possible<Cite id="horowitz-hill-2015" in={SOURCES} />. The architecture is the
        <em className="italic text-text"> flyback converter</em> from Ch.24, here with all the parts named:
      </p>
      <Formula>P<sub>avg</sub> = (1/2) · L<sub>p</sub> · I<sub>peak</sub>² · f<sub>switching</sub></Formula>
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">P<sub>avg</sub></strong> is the average power transferred through the
        flyback transformer (in watts), <strong className="text-text font-medium">L<sub>p</sub></strong> is the primary-side
        inductance of the transformer (in henries; typically 0.5 to 2 mH for a 100 W charger),
        <strong className="text-text font-medium"> I<sub>peak</sub></strong> is the peak primary current at the moment the
        MOSFET turns off (in amperes; typically 1 to 3 A), and
        <strong className="text-text font-medium"> f<sub>switching</sub></strong> is the chopping frequency (in hertz). This is
        just the energy stored in the primary's inductance, <InlineMath>(1/2) L I²</InlineMath>,
        delivered once per switching cycle<Cite id="erickson-maksimovic-2020" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        Plug in numbers: L<sub>p</sub> = 1 mH, I<sub>peak</sub> = 2 A, f<sub>switching</sub> =
        100 kHz, and P<sub>avg</sub> = 0.5 · 10⁻³ · 4 · 10⁵ = 200 W maximum. A 30 W charger
        uses roughly 15 % of this headroom; an 100 W laptop brick uses half of it. The
        engineering art is choosing L<sub>p</sub>, I<sub>peak</sub>, and f<sub>switching</sub>
        so that the transformer core does not saturate, the MOSFET's switching losses stay
        manageable, and the output ripple is small enough for the downstream stages to clean
        up.
      </p>

      <h2 className="chapter-h2">Stage 4: <em>Transformer step-down</em> with galvanic isolation</h2>

      <p className="mb-prose-3">
        Stage 4 is where the chopped primary current crosses over to the safe side of the
        charger. The flyback transformer — two coils wound on the same ferrite core, sharing
        no electrical connection — is the topic of Ch.22 (mutual inductance and the dot
        convention) and Ch.23 (the transformer as a power-grid component), now operating at
        100 kHz instead of 60 Hz but with the same physics. The primary stores energy in the
        core's magnetic field during the MOSFET's on-time; during the off-time, that energy
        crosses the air gap inside the core and exits through the secondary
        winding<Cite id="erickson-maksimovic-2020" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        The voltage and current ratios are the ideal-transformer pair from Ch.23, restated:
      </p>
      <Formula>V<sub>s</sub> = V<sub>p</sub> · (N<sub>s</sub> / N<sub>p</sub>)</Formula>
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">V<sub>p</sub></strong> is the primary-side voltage (here, the bulk-bus
        voltage chopped against ground; in volts), <strong className="text-text font-medium">V<sub>s</sub></strong> is the
        secondary-side voltage that appears across the secondary winding (in volts), and
        <strong className="text-text font-medium"> N<sub>p</sub></strong>, <strong className="text-text font-medium">N<sub>s</sub></strong> are the number of
        turns on the primary and secondary windings respectively (dimensionless integers).
      </p>
      <Formula>I<sub>s</sub> = I<sub>p</sub> · (N<sub>p</sub> / N<sub>s</sub>)</Formula>
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">I<sub>p</sub></strong> is the primary winding current (in amperes),
        <strong className="text-text font-medium"> I<sub>s</sub></strong> is the secondary winding current (in amperes), and
        the turns counts are as defined above. The two ratios are inverse: voltage scales by
        N<sub>s</sub>/N<sub>p</sub>, current by the reciprocal, and the product
        V<sub>p</sub>I<sub>p</sub> = V<sub>s</sub>I<sub>s</sub> holds (ideal
        case)<Cite id="erickson-maksimovic-2020" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        For a 170 V bulk bus and a desired 20 V output, a turns ratio of
        N<sub>p</sub>/N<sub>s</sub> ≈ 8 puts the secondary peak at roughly 21 V — close
        enough that the downstream feedback loop can pull it to exactly 20 V by trimming
        the duty cycle. The current ratio runs the other way: 1 A out on the secondary
        means 0.125 A in on the primary. The numbers are nicely matched to the diode and
        MOSFET ratings.
      </p>
      <p className="mb-prose-3">
        The second job of the transformer is more important than the voltage step-down:{' '}
        <Term def={<><strong className="text-text font-medium">galvanic isolation</strong> — the absence of any DC-conductive path between two circuits. Inside a flyback transformer there are two separate windings with no wire connecting them; energy crosses only as magnetic flux. UL safety standards for an AC-DC supply require a 4 kV<sub>rms</sub> withstand between primary and secondary.</>}>galvanic isolation</Term>.
        There is no wire connecting the primary side (which sits at lethal mains potential)
        to the secondary side (which has to be safe for a human to touch through a USB-C
        cable). Energy crosses the gap as magnetic flux only. The UL safety standard
        requires a 4 kV<sub>rms</sub> withstand between primary and secondary windings — about
        twice the worst lightning-surge any house wiring is likely to see<Cite id="horowitz-hill-2015" in={SOURCES} />.

      </p>

      <TryIt
        tag="Try 34.2"
        question={
          <>
            A flyback transformer has <strong className="text-text font-medium">N<sub>p</sub> = 100</strong> primary turns and{' '}
            <strong className="text-text font-medium">N<sub>s</sub> = 10</strong> secondary turns. The primary sees a peak voltage of
            <strong className="text-text font-medium"> 170 V</strong> (the bulk bus). What is the peak secondary voltage before the
            output rectifier?
          </>
        }
        hint={<>V<sub>s</sub> = V<sub>p</sub> · (N<sub>s</sub>/N<sub>p</sub>).</>}
        answer={
          <>
            <Formula>V<sub>s</sub> = 170 · (10/100) = 17 V</Formula>
            <p className="mb-prose-1 last:mb-0">
              About <strong className="text-text font-medium">17 V peak</strong> on the secondary winding. The downstream
              rectifier drops a Schottky diode's V<sub>F</sub> ≈ 0.3 V, leaving roughly
              16.7 V on the output capacitor — close enough to 20 V that the flyback's
              feedback loop will push the primary duty cycle up by 20 % to lift the
              secondary the rest of the way<Cite id="erickson-maksimovic-2020" in={SOURCES} />.
            </p>
          </>
        }
      />

      <Pullout>
        From the substation transformer to the M3 core, the same electrons get shoved through
        ten different voltage levels by ten different mechanisms. The textbook is the user
        manual for those mechanisms.
      </Pullout>

      <h2 className="chapter-h2">Stage 5: Secondary AC to a <em>20 V DC bus</em></h2>

      <p className="mb-prose-3">
        The secondary winding hands off a sequence of high-current, low-voltage pulses at the
        switching frequency. Stage 5 turns those pulses into clean 20 V DC at the charger's
        USB-C cable. The pieces are the same two from stages 1 and 2 — a rectifier and a
        smoothing capacitor — but the choices change because the operating frequency has
        moved from 60 Hz up to 100 kHz<Cite id="erickson-maksimovic-2020" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        First, the rectifier. A standard silicon p-n diode (Ch.14) drops about 0.7 V and
        has a reverse-recovery tail of tens of nanoseconds — long enough to be a substantial
        fraction of a 10 µs switching cycle and to waste real energy on every transition.
        The fix is the{' '}
        <Term def={<><strong className="text-text font-medium">Schottky diode</strong> — a metal-semiconductor junction rather than the p-n junction of a standard diode. Forward voltage V<sub>F</sub> ≈ 0.3 V (vs ≈ 0.7 V for silicon p-n), majority-carrier conduction with no minority-carrier storage tail, recovery time in picoseconds. The standard output rectifier in every modern switching supply.</>}>Schottky diode</Term>:
        a metal-semiconductor junction with V<sub>F</sub> ≈ 0.3 V and majority-carrier
        conduction. There is no minority-carrier storage to clear at turn-off, so the diode
        recovers in picoseconds<Cite id="horowitz-hill-2015" in={SOURCES} />. On a 20 V output
        the 0.3 V Schottky drop costs 1.5 % efficiency; a 0.7 V silicon drop would cost 3.5 %.
      </p>
      <p className="mb-prose-3">
        Second, the output capacitor — typically a few hundred microfarads of low-ESR polymer
        or ceramic — smooths the rectified pulses into flat DC. Because the rectifier fires
        at 100 kHz rather than 120 Hz, the ripple equation from stage 2 says the required
        capacitance for a given ripple is smaller by a factor of (100 kHz)/(120 Hz) ≈ 800.
        The same ripple voltage that wanted a 220 µF electrolytic on the bulk side needs
        less than 0.3 µF on the output side. That collapse is the second part of why modern
        chargers are small.
      </p>
      <p className="mb-prose-3">
        End-to-end charger efficiency is the ratio of the useful output power to the line
        input power:
      </p>
      <Formula>η<sub>charger</sub> = V<sub>s</sub> · I<sub>s</sub> / (V<sub>in</sub> · I<sub>in</sub>)</Formula>
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">V<sub>s</sub>, I<sub>s</sub></strong> are the output voltage and current
        delivered at the USB-C cable (in volts and amperes; for a 100 W charger, 20 V and 5 A),
        and <strong className="text-text font-medium">V<sub>in</sub>, I<sub>in</sub></strong> are the line input voltage and
        current drawn from the wall (in volts and amperes). Modern{' '}
        <Term def={<><strong className="text-text font-medium">GaN charger</strong> — a switching charger built around gallium-nitride power FETs instead of silicon ones. GaN devices have lower on-resistance and lower switching losses than silicon, allowing higher switching frequency (200 kHz and up) and tighter integration. The reason 2024-era 100 W chargers fit in a thumb-sized brick.</>}>GaN-FET chargers</Term>{' '}
        hit η ≈ 0.92 to 0.95 end-to-end (wall to cable), an efficiency that was
        unreachable with 1990s silicon at 60 Hz<Cite id="erickson-maksimovic-2020" in={SOURCES} />.
        The remaining 5 to 8 % is shed as heat from the bridge diodes, the MOSFET's switching
        loss, the transformer's copper and core losses, and the Schottky output rectifier.
      </p>

      <TryIt
        tag="Try 34.3"
        question={
          <>
            A laptop charger is rated <strong className="text-text font-medium">65 W</strong> output at <strong className="text-text font-medium">92 %</strong>
            {' '}efficiency. What is the input power drawn from the wall, and how much heat is
            shed inside the charger at full load?
          </>
        }
        hint={<>P<sub>in</sub> = P<sub>out</sub>/η; P<sub>heat</sub> = P<sub>in</sub> − P<sub>out</sub>.</>}
        answer={
          <>
            <Formula>P<sub>in</sub> = 65 / 0.92 ≈ 70.7 W</Formula>
            <Formula>P<sub>heat</sub> = 70.7 − 65 = 5.7 W</Formula>
            <p className="mb-prose-1 last:mb-0">
              The charger draws about <strong className="text-text font-medium">71 W</strong> from the wall and dissipates
              about <strong className="text-text font-medium">5.7 W</strong> as heat through its case. That number sets the
              charger's thermal design: the case has to lose ~6 W of heat at full
              load without exceeding the UL touch-temperature limit of 70 °C on any
              user-accessible surface<Cite id="horowitz-hill-2015" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2 className="chapter-h2">Stage 6: <em>USB-PD negotiation</em> on the cable</h2>

      <p className="mb-prose-3">
        Stage 6 is not a power conversion at all. It is a digital negotiation. Between the
        charger and the laptop runs a USB-C cable with twenty-four conductors, two of which
        — the{' '}
        <Term def={<><strong className="text-text font-medium">CC pin</strong> — the configuration-channel pin on a USB-C connector. Used both to detect cable orientation and as the physical layer for the USB Power Delivery (USB-PD) protocol. Carries a biphasic mark code at 300 kHz, full-duplex but half-symmetric between source and sink.</>}>CC1 and CC2 pins</Term>{' '}
        — carry the{' '}
        <Term def={<><strong className="text-text font-medium">USB-PD</strong> — USB Power Delivery, a digital protocol spoken between a source (charger) and a sink (laptop) over the CC pin of the USB-C connector. Negotiates an operating voltage and current limit from a discrete list of <em className="italic text-text">power profiles</em>. Defined in the USB-IF's Revision 3.1 specification.</>}>USB Power Delivery</Term>{' '}
        protocol<Cite id="usb-pd-r3" in={SOURCES} />. Before the charger applies any voltage
        beyond 5 V, the laptop and the charger talk: the laptop advertises what input voltages
        it can accept; the charger responds with the discrete list of{' '}
        <Term def={<><strong className="text-text font-medium">power profile</strong> — one of the discrete operating points a USB-PD source advertises. Standard profiles: 5 V, 9 V, 15 V, 20 V at currents up to 5 A. Extended-power-range (EPR) profiles add 28 V, 36 V, and 48 V for sinks up to 240 W.</>}>power profiles</Term>{' '}
        it can deliver; the two sides settle on one and the charger's secondary-side
        regulator slides to that voltage.
      </p>
      <p className="mb-prose-3">
        The standard profiles below 100 W are 5 V, 9 V, 12 V, 15 V, and 20 V, each at currents
        up to 5 A. The extended-power-range (EPR) profiles add 28 V, 36 V, and 48 V — and at
        48 V × 5 A = 240 W the protocol reaches its current upper bound<Cite id="usb-pd-r3" in={SOURCES} />.
        The negotiation completes in less than 100 ms from the moment the cable is plugged
        in. There is no formula here: the entire stage is a sequence of digital messages over
        a single wire, encoded as a biphasic mark code at 300 kHz, with cyclic-redundancy
        checks and explicit acknowledgements at every step. (For full details, the USB-IF
        specification runs to roughly seven hundred
        pages<Cite id="usb-pd-r3" in={SOURCES} />.)
      </p>
      <p className="mb-prose-3">
        The practical consequence: by the time the laptop pulls real current through the
        cable, the charger's output has slewed from its default 5 V up to the negotiated
        20 V, and the laptop's input-side circuitry knows exactly what to expect. Without
        USB-PD, the charger would either deliver only 5 V (slow) or potentially apply too
        much voltage and damage the sink. The protocol is what lets one charger safely feed
        a phone, a tablet, and a laptop from the same connector.
      </p>

      <TryIt
        tag="Try 34.4"
        question={
          <>
            A laptop requests a <strong className="text-text font-medium">20 V at 5 A</strong> USB-PD profile from a charger
            that advertises only a maximum of <strong className="text-text font-medium">20 V at 3 A</strong>. What does the
            charger do, and what total output power can the link carry?
          </>
        }
        hint={<>USB-PD lets the source refuse profiles it cannot deliver; the sink must accept the highest profile the source advertises.</>}
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">
              The charger rejects the 20 V / 5 A request and offers its own list — capped at
              20 V / 3 A<Cite id="usb-pd-r3" in={SOURCES} />. The sink accepts that profile
              and the link operates at:
            </p>
            <Formula>P = V · I = 20 · 3 = 60 W</Formula>
            <p className="mb-prose-1 last:mb-0">
              <strong className="text-text font-medium">60 W</strong> instead of the 100 W the laptop asked for. The laptop
              continues to operate but at reduced charging current; on the M3, this typically
              means the battery charges more slowly while CPU performance is unaffected.
            </p>
          </>
        }
      />

      <h2 className="chapter-h2">Stage 7: <em>20 V to the chip rails</em></h2>

      <p className="mb-prose-3">
        Stage 7 is the longest and most layered. The 20 V DC that arrived through the USB-C
        cable has to be walked down to a sequence of progressively lower voltages: 5 V for
        the USB peripherals and the Wi-Fi radio; 3.3 V for the SSD and the legacy logic
        islands; 1.8 V for the DRAM chips; 1.1 V or 1.2 V for the on-die SRAM; and finally
        ≈ 0.8 V for the M3's CPU core. Each step is a separate{' '}
        <Term def={<><strong className="text-text font-medium">buck converter</strong> — a step-down DC-DC converter consisting of a high-side switch, a low-side switch or diode, an inductor, and an output capacitor. Output voltage equals the duty cycle times the input voltage. Modern on-board bucks switch at MHz and routinely hit 95 % efficiency.</>}>buck converter</Term>{' '}
        running at megahertz frequencies, each with its own feedback loop, each working from
        the volt-second-balance formula developed in Ch.24:
      </p>
      <Formula>V<sub>out</sub> = D · V<sub>in</sub></Formula>
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">V<sub>out</sub></strong> is the regulated output rail (in volts),
        <strong className="text-text font-medium"> V<sub>in</sub></strong> is the buck's input voltage (in volts; for the
        first stage of stage 7, V<sub>in</sub> = 20 V), and <strong className="text-text font-medium">D</strong> is the buck's{' '}
        <Term def={<><strong className="text-text font-medium">duty cycle</strong> — the fraction of each switching period during which the high-side switch is closed. D = t<sub>on</sub>/T<sub>sw</sub>; a dimensionless number between 0 and 1. Controlled in real time by the buck's feedback loop to hold V<sub>out</sub> constant against load changes.</>}>duty cycle</Term>{' '}
        — the fraction of each switching period the high-side MOSFET is closed (dimensionless,
        between 0 and 1)<Cite id="erickson-maksimovic-2020" in={SOURCES} />. To produce
        V<sub>out</sub> = 0.8 V from V<sub>in</sub> = 20 V, the buck has to run at
        D = 0.8/20 = 0.04 — a 4 % duty cycle. In practice, the conversion is broken into
        two stages (20 V → 5 V → 0.8 V) so neither buck has to switch with extreme
        precision.
      </p>
      <p className="mb-prose-3">
        The very last drop, from the buck's nominal 1.1 V down to the CPU core's actual
        0.8 V, is usually handled by an on-die{' '}
        <Term def={<><strong className="text-text font-medium">LDO (low-dropout regulator)</strong> — a linear regulator with a small dropout voltage (V<sub>in</sub> − V<sub>out</sub>) of only a few hundred millivolts. Cannot step down by large ratios efficiently, but produces an extremely clean output with no switching noise. Used inside chips to feed analog blocks and sensitive digital cores.</>}>LDO (low-dropout regulator)</Term>{' '}
        and a digitally-controlled{' '}
        <Term def={<><strong className="text-text font-medium">VRM (voltage regulator module)</strong> — a power-delivery network co-packaged with or embedded in a CPU/SoC die. Combines fast switchers, output caps, and on-die LDOs to deliver clean, regulated rails to specific functional blocks of the chip.</>}>VRM (voltage regulator module)</Term>.
        On Apple Silicon, the core voltage does not even sit at a fixed value: it is slewed
        up and down by the firmware in response to the workload —{' '}
        <Term def={<><strong className="text-text font-medium">DVFS (dynamic voltage and frequency scaling)</strong> — the technique of varying both a CPU's core voltage and clock frequency at runtime to match the current workload. Lower voltage saves dynamic power (P ∝ V²), at the cost of lower maximum clock frequency. Applied at millisecond or microsecond timescales on modern SoCs.</>}>DVFS, dynamic voltage and frequency scaling</Term>.
        Heavier workload, higher clock, higher voltage; idle workload, lower clock, lower
        voltage. Dynamic power scales as <em className="italic text-text">V²f</em>, so a 10 % voltage drop saves roughly
        20 % of dynamic power at the same
        frequency<Cite id="sedra-smith-2014" in={SOURCES} /><Cite id="horowitz-hill-2015" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        The M3 die — about <strong className="text-text font-medium">146 mm²</strong> of TSMC 3 nm silicon — carries around{' '}
        <strong className="text-text font-medium">twenty-five billion transistors</strong>, organised into power islands that
        each have their own regulated rail. At peak load, the core rail can sink twenty
        amperes or more at 0.8 V; the routing of that 20 A current through the package and
        across the die is itself an engineering subspecialty, with on-die capacitance
        deliberately placed near every flip-flop block to absorb the di/dt of a clock edge.
        Stage 7 is the chapter where the textbook hands its physics off to the chip
        designer.
      </p>

      <TryIt
        tag="Try 34.5"
        question={
          <>
            A buck converter steps <strong className="text-text font-medium">20 V</strong> down to a <strong className="text-text font-medium">1.1 V</strong>
            {' '}rail delivering <strong className="text-text font-medium">5 A</strong> to the on-die SRAM. Assuming ideal
            (lossless) conversion, what input current does the buck draw? At a realistic
            <strong className="text-text font-medium"> 90 %</strong> efficiency, what is the input current instead?
          </>
        }
        hint={<>Ideal: V<sub>in</sub> · I<sub>in</sub> = V<sub>out</sub> · I<sub>out</sub>. Real: V<sub>in</sub> · I<sub>in</sub> = V<sub>out</sub> · I<sub>out</sub> / η.</>}
        answer={
          <>
            <Formula>I<sub>in,ideal</sub> = V<sub>out</sub> · I<sub>out</sub> / V<sub>in</sub> = 1.1 · 5 / 20 = 0.275 A</Formula>
            <Formula>I<sub>in,real</sub> = (1.1 · 5) / (20 · 0.9) = 0.306 A</Formula>
            <p className="mb-prose-1 last:mb-0">
              About <strong className="text-text font-medium">275 mA ideal</strong> and <strong className="text-text font-medium">306 mA at 90 % efficiency</strong>.
              The current scales by V<sub>out</sub>/V<sub>in</sub> the same way a transformer's
              current scales by N<sub>s</sub>/N<sub>p</sub> — a buck is a DC-domain analogue of
              a transformer, exactly as developed in Ch.24<Cite id="erickson-maksimovic-2020" in={SOURCES} />.
              The missing 31 mA × 20 V = 0.62 W is dissipated as heat in the buck's switching
              losses and the inductor's copper resistance.
            </p>
          </>
        }
      />

      <h2 className="chapter-h2">What we have built</h2>
      <p className="mb-prose-3">
        Seven stages, six intermediate voltages, and every component you can name from this
        textbook. Stage 1 is four diodes from Ch.14 in the rectifier topology of Ch.24.
        Stage 2 is the capacitor of Ch.5 used as the RC smoother of Ch.12 and the bulk
        reservoir of Ch.24. Stage 3 is the MOSFET of Ch.14 driven by the duty-cycle logic
        of Ch.16's op-amp feedback, applied to the flyback topology of Ch.24. Stage 4 is
        the transformer of Ch.22 and Ch.23, miniaturised by raising f<sub>sw</sub> by three
        orders of magnitude. Stage 5 is another rectifier and another smoothing cap, with
        the diode upgraded to Schottky. Stage 6 is a digital protocol carrying no power at
        all. Stage 7 is a cascade of buck converters from Ch.24, each running the
        volt-second-balance law of an inductor (Ch.7) at a megahertz instead of a kilohertz,
        ending in an on-die LDO (Ch.16) and the dynamic-voltage logic of modern processor
        design<Cite id="erickson-maksimovic-2020" in={SOURCES} /><Cite id="sedra-smith-2014" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        That is the textbook. Twenty-six chapters of physics and seven chapters of applied
        practice fold themselves up into a cable between a wall socket and a laptop. Every
        equation you learned from charge and field through Maxwell through impedance through
        rectifiers is doing real work inside that cable, at this moment, on this desk. The
        electrons that left the substation transformer half an hour ago are arriving at the
        gate of a transistor on the M3 die — and the path they took through the seven
        conversions is the path the textbook took through its argument.
      </p>

      <CaseStudies intro="Three working objects in which every page of this book is in use right now.">
        <CaseStudy
          tag="Case 34.1"
          title="A modern 65 W GaN USB-C charger"
          summary={<>A thumb-sized brick that does in 80 grams what a 1990s laptop charger did in 600 grams — by switching at 200 kHz instead of 60 Hz, with gallium-nitride power transistors.</>}
          specs={[
            { label: 'Output power', value: '65 W (20 V × 3.25 A)' },
            { label: 'Mass', value: '~80 g' },
            { label: 'End-to-end efficiency', value: '~94 % at full load' },
            { label: 'Switching frequency', value: '~200 kHz (GaN flyback)' },
            { label: 'USB-PD profiles', value: '5 V, 9 V, 15 V, 20 V at up to 3.25 A' },
            { label: 'Isolation rating', value: '4 kV<sub>rms</sub> primary-to-secondary' },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            Pop the case open and you see all seven stages in roughly six square centimetres
            of board. The bridge rectifier and PFC stage are at the top, where the AC pins
            enter. A single bulk capacitor — a tall electrolytic, about 100 µF / 400 V —
            stands next to the GaN power MOSFET. The flyback transformer is a thumbnail-sized
            ferrite assembly with copper windings on a plastic bobbin. A Schottky diode
            (often a synchronous-rectification MOSFET on the very latest chargers) and a
            polymer output capacitor sit on the secondary side, beside the USB-PD controller
            IC. Across all of it, opto-isolators carry the feedback signal across the
            galvanic barrier<Cite id="erickson-maksimovic-2020" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            The same job was being done in 1995 by a brick that weighed roughly 600 g, ran
            at 50 to 60 % efficiency, and used a 60 Hz iron-core transformer the size of a
            shot glass. The technology shift between then and now is exactly the substitution
            of a high-frequency switching architecture for a line-frequency one — every
            gram saved is a consequence of moving the transformer's operating frequency from
            60 Hz to 200 kHz. Gallium-nitride power transistors with sub-nanosecond switching
            times let the design push f<sub>sw</sub> that high without melting the switch on
            every transition<Cite id="horowitz-hill-2015" in={SOURCES} />.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 34.2"
          title="The Apple M3 power distribution"
          summary={<>Twenty-five billion transistors on a 146 mm² die, fed from a 20 V cable, regulated down to 0.8 V at the core through a cascade of bucks and on-die LDOs.</>}
          specs={[
            { label: 'Die area', value: '~146 mm² (M3 base)' },
            { label: 'Process node', value: 'TSMC N3 (3 nm)' },
            { label: 'Transistor count', value: '~25 billion' },
            { label: 'Core voltage', value: '~0.7 to 1.0 V (DVFS-controlled)' },
            { label: 'Peak core current', value: '20+ A on the CPU rail' },
            { label: 'Power islands', value: 'Separate rails for P-cores, E-cores, GPU, NPU, SRAM, I/O' },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            The M3 takes its power from the laptop's main board on a sequence of dedicated
            rails. The CPU core rail is the lowest-voltage and highest-current of the bunch:
            roughly 0.8 V at peak workload, sinking on the order of 20 A continuous and
            substantially more in brief transient bursts. Each of these rails is delivered
            by a board-level synchronous buck converter running at 1 to 3 MHz, with the very
            last drop into the chip's analog and mixed-signal islands handled by on-die LDOs
            for noise rejection<Cite id="sedra-smith-2014" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            The dynamic side of the story is more interesting than the static topology. The
            firmware adjusts the core voltage and the core clock frequency together on a
            millisecond timescale — DVFS — so that the chip is always running at the lowest
            voltage that supports the current clock. The relationship between voltage and
            maximum frequency is set by the transistor I-V curves of Ch.14: lower V<sub>DD</sub>
            means a smaller gate overdrive, slower switching, and a lower achievable clock
            rate. Push the voltage down too far and the longest combinational paths on the
            die start failing setup time; push it up too high and dynamic power (P ∝ V²f)
            soars<Cite id="horowitz-hill-2015" in={SOURCES} />. The on-die LDO sits at the
            very last micrometre of this story: it cleans the buck's output, holds the
            local rail steady against transient di/dt, and feeds a few power-sensitive
            blocks (PLLs, analog references, SRAM bit-lines) with a voltage cleaner than the
            board can directly provide.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 34.3"
          title="A USB-PD negotiation, traced on the CC pin"
          summary={<>From plug-in to negotiated 20 V in under 100 ms — a sequence of digital messages over a single wire that turns one charger into a universal one.</>}
          specs={[
            { label: 'CC-pin bit rate', value: '300 kHz biphasic mark code' },
            { label: 'Time from plug-in to default 5 V', value: '~5 ms (Type-C attach)' },
            { label: 'Time to negotiate full profile', value: '~50 to 100 ms' },
            { label: 'Message protocol', value: 'USB-PD R3.1 (EPR-capable)' },
            { label: 'Power profile granularity', value: '5/9/12/15/20/28/36/48 V' },
            { label: 'CRC and ACK at every step', value: 'Yes (32-bit CRC-32 on every frame)' },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            The moment a USB-C cable is plugged in, the source and sink begin a conversation
            on the CC pin. First, the Type-C attach: a pull-up on the source's CC line and a
            pull-down on the sink's CC line establish that the cable is the right way up and
            that both ends recognise each other. Default 5 V comes up within milliseconds.
            Then the USB-PD protocol takes over. The source sends a <em className="italic text-text">Source_Capabilities</em>{' '}
            message listing every power profile it can deliver — typically 5 V at 3 A, 9 V at
            3 A, 15 V at 3 A, and 20 V at 5 A for a 100 W charger. The sink picks one, replies
            with a <em className="italic text-text">Request</em> message, and the source's feedback loop slews its output
            voltage to match within tens of milliseconds<Cite id="usb-pd-r3" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            The robustness of the negotiation comes from explicit acknowledgements at every
            step. Every USB-PD message is wrapped in a 32-bit cyclic-redundancy check; every
            message gets a <em className="italic text-text">GoodCRC</em> reply from the receiver. If a message is lost or
            corrupted, the sender retransmits. The biphasic mark coding at 300 kHz is
            tolerant of cable-length jitter and ground bounce — by design, since the CC pin
            sits next to high-current power lines in the same cable. The whole sequence —
            attach, capability advertisement, request, acknowledgement, voltage slew — is
            done in under 100 ms, before the laptop's operating system has even noticed
            the new charger<Cite id="usb-pd-r3" in={SOURCES} />.
          </p>
        </CaseStudy>
      </CaseStudies>

      <FAQ intro="The questions a careful reader asks about the cable between the wall and the laptop.">
        <FAQItem q="Why does the charger need to negotiate the voltage? Can't it just guess from the cable type?">
          <p>
            The cable does not know what is on the other end. The same USB-C connector can
            feed a phone (5 V, 1 A is plenty), a tablet (9 V or 15 V), or a laptop
            (20 V at 5 A) — and applying 20 V to a phone would destroy it instantly. The
            USB-PD protocol exists precisely so the charger can ask the sink what it wants
            and the sink can refuse anything dangerous<Cite id="usb-pd-r3" in={SOURCES} />.
            Without negotiation, the connector would have to default to its safest level
            (5 V), which would mean a several-hour charge for any laptop.
          </p>
        </FAQItem>

        <FAQItem q="Why is the laptop charger so much smaller than it was 10 years ago?">
          <p>
            Two reasons. First, the switching frequency has climbed from ~65 kHz in older
            silicon designs to ~200 kHz in GaN designs, which shrinks the flyback
            transformer's core volume by a factor of about three. Second, the GaN power
            transistors themselves have lower switching losses than their silicon
            equivalents, which means less waste heat, which means a smaller heat sink and
            tighter packaging<Cite id="erickson-maksimovic-2020" in={SOURCES} />. A 100 W
            charger that used to weigh 400 g now weighs about 150 g, and the next generation
            will halve that again.
          </p>
        </FAQItem>

        <FAQItem q="Why does the charger have a transformer at all? Why not just use resistors to drop the voltage?">
          <p>
            Two reasons. The first is efficiency: dropping 170 V to 20 V across a resistor
            chain at 1 A would dissipate 150 W as heat — five times the output power. The
            second is galvanic isolation. Mains voltage is lethal; the laptop's case has to
            be safe to touch. A transformer crosses the energy from one side to the other
            as magnetic flux, with no conductive path between the two
            windings<Cite id="horowitz-hill-2015" in={SOURCES} />. UL safety standards require
            a 4 kV<sub>rms</sub> withstand between the primary and secondary, which no
            resistive divider can provide.
          </p>
        </FAQItem>

        <FAQItem q="What does 'galvanic isolation' mean and why is it required?">
          <p>
            Galvanic isolation means there is no DC-conductive path between two circuits;
            energy crosses only as magnetic flux (through a transformer) or as light
            (through an opto-isolator). In a charger, the primary side sits at lethal
            mains potential — 170 V peak in the US, 325 V in Europe. If a fault inside the
            charger shorted the primary to the secondary, the laptop's case would suddenly
            be live at line voltage. UL safety standards require enough isolation between
            the two sides to survive a 4 kV<sub>rms</sub> withstand test, comparable to a
            modest lightning surge<Cite id="erickson-maksimovic-2020" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why is the bulk capacitor rated for 400 V when the bridge output is only 170 V?">
          <p>
            Two reasons. First, US mains voltage is allowed to swing up to 132 V<sub>rms</sub>
            under ANSI C84.1, giving a peak of nearly 187 V. Second, the charger also has to
            work on 230 V European mains, which has a peak of 325 V. A single 400 V bulk cap
            lets the same charger plug into either grid without
            modification<Cite id="erickson-maksimovic-2020" in={SOURCES} />. The 25 % design
            margin above the European peak is there to survive line surges and the inrush
            current that hits the cap the moment the charger is first plugged in.
          </p>
        </FAQItem>

        <FAQItem q="Why is the switching frequency 100 kHz and not 10 MHz?">
          <p>
            Higher f<sub>sw</sub> shrinks the magnetics but increases the switching losses
            in the MOSFET — the transistor dissipates a fixed energy on every on-off cycle,
            so total switching loss scales linearly with f<sub>sw</sub>. Silicon MOSFETs run
            out of headroom around 200 kHz; GaN devices push to 500 kHz. Above that, the
            losses dominate and the charger gets hotter, not smaller. There are research
            converters running at 30 MHz, but they require resonant topologies and exotic
            packaging that are not yet cost-effective for consumer products<Cite id="erickson-maksimovic-2020" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What's the difference between a flyback and a forward converter?">
          <p>
            A flyback stores energy in the transformer's primary inductance during the
            MOSFET's on-time, and releases that energy to the secondary during the off-time.
            A forward converter passes power through the transformer continuously during the
            on-time, with no intermediate storage — the transformer is acting as a real
            transformer, not as a coupled inductor. Flybacks are simpler and cheaper for
            low-to-medium power (up to ~150 W); forwards are more efficient at higher power
            because their core does not have to store a full cycle's worth of energy as
            magnetic flux<Cite id="erickson-maksimovic-2020" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why are GaN chargers more efficient than silicon ones?">
          <p>
            Gallium-nitride power FETs have about a third of the gate charge and a third of
            the on-resistance of a comparable silicon MOSFET at the same voltage rating. Both
            numbers reduce switching losses: lower gate charge means the gate driver has less
            energy to dump on every transition, and lower on-resistance means less I²R loss
            during the conduction phase. The net result is a ~3 percentage-point efficiency
            improvement at typical operating conditions — and, more importantly, the ability
            to run at higher f<sub>sw</sub> without overheating, which is what lets the
            charger be physically smaller<Cite id="horowitz-hill-2015" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What happens if I plug my laptop into a charger that doesn't support USB-PD?">
          <p>
            The laptop defaults to 5 V, which is the safe-start voltage that every USB-C
            source must provide. At 5 V and the standard 3 A current limit of a non-PD
            charger, the laptop receives 15 W — enough to keep its battery from draining
            quickly under light load, but not enough to actually charge it under typical
            use. The operating system usually displays a "low-power charger" warning. There
            is no danger; the link just runs at a small fraction of its intended
            capacity<Cite id="usb-pd-r3" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why does my CPU need 0.8 V when 20 V is right there on the cable?">
          <p>
            Transistor dimensions on a 3 nm process are so small that 20 V across a gate
            oxide would destroy it instantly — the oxide layer is only a few atomic layers
            thick. The CPU's nominal operating voltage is set by the process node: smaller
            transistors require lower voltage to avoid breakdown, and dynamic power scales
            as V², so lower voltage also means lower power and less heat. The whole point of
            stage 7 is to walk the voltage down to a value the transistors can actually
            survive<Cite id="sedra-smith-2014" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What's the role of the LDO when there's already a buck converter feeding the same rail?">
          <p>
            The buck is efficient but noisy — it produces switching ripple at megahertz
            frequencies, and its feedback loop has a finite bandwidth, so it cannot react
            instantly to load transients. The LDO sits downstream of the buck and acts as a
            noise filter: it has very high power-supply rejection at the buck's switching
            frequency, and its feedback loop is fast enough to absorb microsecond-scale
            load steps. The cost is a few hundred millivolts of dropout, which is shed as
            heat. The combination — a buck for efficiency followed by an LDO for cleanliness
            — is standard practice for any rail feeding analog blocks or sensitive
            digital cores<Cite id="horowitz-hill-2015" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why does the laptop's core voltage fluctuate during use?">
          <p>
            DVFS — dynamic voltage and frequency scaling. The firmware adjusts the core
            voltage and clock frequency together on a millisecond timescale to match the
            workload. Idle: low clock, low voltage. Heavy compile: high clock, high voltage.
            Dynamic power scales as V²f, so dropping V from 1.0 V to 0.8 V at the same
            frequency saves ~36 % of dynamic power. The on-die VRM is rearchitecting itself
            in real time as the workload changes<Cite id="sedra-smith-2014" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What is 'ripple rejection' and why does it matter for the GPU rail?">
          <p>
            Ripple rejection (formally, power-supply rejection ratio, PSRR) is the ratio of
            ripple on the regulator's input to ripple appearing on its output. A good LDO
            attenuates input ripple by 60 dB or more at audio frequencies — meaning 100 mV
            of buck-frequency ripple at the input becomes 0.1 mV at the output. For a GPU
            rail switching hundreds of amperes at megahertz rates, even small voltage
            transients on the supply can show up as visual artefacts in rendered frames or
            as timing failures in the long combinational paths of the shader cores. The
            LDO's job is to make those transients
            invisible<Cite id="horowitz-hill-2015" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Does any of this still apply if my laptop is running from its own battery?">
          <p>
            Stages 1 through 6 disappear — the wall, the bridge rectifier, the bulk cap, the
            flyback, the secondary rectifier, the cable, the USB-PD negotiation. Stage 7
            stays: the laptop's battery is at around 11 V (a 3-cell lithium-ion stack), and
            the same cascade of buck converters and on-die LDOs walks 11 V down to 5 V,
            3.3 V, 1.8 V, 1.1 V, and 0.8 V exactly as before. The chip never knows whether
            the energy came from the wall or the battery; only the input voltage to stage 7
            has changed<Cite id="erickson-maksimovic-2020" in={SOURCES} />.
          </p>
        </FAQItem>
      </FAQ>
    </ChapterShell>
  );
}
