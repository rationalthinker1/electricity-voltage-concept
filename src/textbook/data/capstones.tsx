/**
 * Capstone integration projects.
 *
 * Three end-of-textbook design / analysis challenges. Each capstone
 * integrates concepts from 4–8 chapters and is presented as a guided
 * walkthrough: a problem statement, a sequence of sub-tasks each with
 * a TryIt-style hidden-then-revealed worked solution, and a closing
 * stretch challenge that pushes beyond the chapter content.
 *
 * Authoring notes:
 *  - All numbers in worked solutions are computed inline — these are
 *    real engineering examples, not arithmetic decoration.
 *  - Sources cited via <Cite id="…" in={SOURCES}/> all live in the
 *    central src/lib/sources.ts registry. The `sources` array on each
 *    capstone is the union used for SOURCES lookup.
 *  - Schema lives in this file (the .tsx extension is necessary because
 *    problem/solution/intro fields hold JSX nodes; the schema is
 *    otherwise identical to plain-TS).
 */

import type { ReactNode } from 'react';
import type { ChapterSlug } from './chapters';
import type { SourceKey } from '@/lib/sources';

import { Formula, InlineMath } from '@/components/Formula';
import { Cite } from '@/components/SourcesList';
import { Num } from '@/components/Num';

export interface CapstoneStep {
  id: string;
  title: string;
  problem: ReactNode;
  solution: ReactNode;
  hint?: ReactNode;
}

export interface CapstoneStretch {
  title: string;
  problem: ReactNode;
  solution: ReactNode;
}

export interface Capstone {
  id: string;
  number: 1 | 2 | 3;
  title: string;
  subtitle: string;
  intro: ReactNode;
  requiredChapters: ChapterSlug[];
  /** Source keys cited anywhere in this capstone. */
  sources: SourceKey[];
  steps: CapstoneStep[];
  stretch: CapstoneStretch;
  estimatedMinutes: number;
}

/* ─────────────────────────────────────────────────────────────────────
 * Capstone 1 — Design a 5 V / 2 A USB-C wall-wart
 *
 * Topology: discontinuous-mode flyback. Spec: 100–240 V AC input,
 * 5 V at 2 A output (10 W), expected efficiency ~80%.
 * Integrates: induction (Ch.7), mutual inductance (Ch.22),
 * transformers (Ch.23), rectifiers/inverters (Ch.24), plug-to-chip
 * (Ch.34), and a touch of motors (Ch.20) for the back-EMF concept.
 * ────────────────────────────────────────────────────────────────── */

const USBC_SOURCES: SourceKey[] = [
  'erickson-maksimovic-2020',
  'mohan-undeland-robbins-2003',
  'horowitz-hill-2015',
  'usb-pd-r3',
  'sedra-smith-2014',
];

const CAPSTONE_USBC: Capstone = {
  id: 'usbc-wallwart',
  number: 1,
  title: 'Design a 5 V / 2 A USB-C wall-wart',
  subtitle: 'From 120 V AC wall to 10 W of regulated DC, on the back of an envelope.',
  intro: (
    <>
      <p className="m-0 mb-lg">
        Your phone charger is a 10-watt power-electronics design with about
        twenty parts inside. The same envelope-sized brick has to accept
        anywhere from 90 V to 264 V of AC at 50 or 60 Hz, deliver 5 V at up
        to 2 A through a USB-C cable, weigh less than fifty grams, and pass
        a thermal test that says nothing inside exceeds about 105 °C. Eighty
        percent of those bricks use the same topology: a{' '}
        <strong>flyback converter</strong> switching at around 65 kHz.
      </p>
      <p className="m-0 mb-lg">
        In this capstone you size every major part of one. By the end you
        will have picked a switching frequency, computed a transformer
        turns ratio, sized the primary inductance, chosen the output
        capacitor for ripple, estimated efficiency, and identified the
        three most likely failure modes. The stretch goal adds USB-PD
        negotiation so the brick can also serve 9 V, 15 V, or 20 V to a
        modern phone or laptop.
      </p>
    </>
  ),
  requiredChapters: [
    'induction',
    'magnetically-coupled-circuits',
    'transformers',
    'rectifiers-and-inverters',
    'semiconductors',
    'filters-op-amps-tlines',
    'motors',
    'house-plug-to-chip',
  ],
  sources: USBC_SOURCES,
  estimatedMinutes: 90,
  steps: [
    {
      id: 'specs',
      title: 'Lock down the specification',
      problem: (
        <>
          <p className="m-0 mb-lg">
            Before you can size anything you need a numeric spec. Write
            down: the input voltage range, the output voltage, the output
            current, the maximum output power, the efficiency target, and
            the corresponding input power at full load.
          </p>
          <p className="m-0 mb-lg">
            Use universal-input limits (<strong>90–264 V AC RMS</strong>),
            a USB Power Delivery 5 V profile, and assume <strong>η = 80%</strong>
            {' '}for a small flyback at this power level.
          </p>
        </>
      ),
      hint: 'Apparent input power = output power / efficiency. Pick the worst-case low-line input voltage for sizing — that is where peak currents are largest.',
      solution: (
        <>
          <p className="m-0 mb-lg">The numeric box you will keep on the desk for the rest of the design:</p>
          <ul className="my-md mb-lg pl-xl">
            <li className="my-sm"><strong>V<sub>in,ac</sub></strong> = 90 V–264 V RMS, 50/60 Hz</li>
            <li className="my-sm"><strong>V<sub>in,dc,min</sub></strong> ≈ 90 × √2 − ripple ≈ 110 V (after the bridge + bulk cap, low line)</li>
            <li className="my-sm"><strong>V<sub>in,dc,max</sub></strong> ≈ 264 × √2 ≈ 374 V (peak, high line, no load)</li>
            <li className="my-sm"><strong>V<sub>out</sub></strong> = 5.0 V ± 5% — the USB-PD 5 V profile<Cite id="usb-pd-r3" in={USBC_SOURCES}/></li>
            <li className="my-sm"><strong>I<sub>out,max</sub></strong> = 2.0 A → <strong>P<sub>out</sub></strong> = 10 W</li>
            <li className="my-sm"><strong>η</strong> = 0.80 → <strong>P<sub>in</sub></strong> = 10 / 0.80 = <strong>12.5 W</strong> at full load</li>
            <li className="my-sm">Input current at low line: <InlineMath>I<sub>in,rms</sub> ≈ 12.5 W / (90 V × PF)</InlineMath>. With a typical bridge-rectifier power factor of 0.5, that is roughly <strong>0.28 A RMS</strong> — but the peak current into the bulk cap is several amps because conduction happens only near the AC peak<Cite id="erickson-maksimovic-2020" in={USBC_SOURCES}/>.</li>
          </ul>
          <p className="m-0 mb-lg">
            Two design decisions are already implicit in this list: the
            input stage will be a bridge rectifier + bulk capacitor (the
            classic peak-detect front end from Ch.24), and the bulk cap
            has to be rated for at least 400 V because the peak DC bus
            sits around 374 V at high line.
          </p>
        </>
      ),
    },
    {
      id: 'topology',
      title: 'Pick a topology',
      problem: (
        <>
          <p className="m-0 mb-lg">
            Three reasonable choices exist for an isolated 10 W converter:
            forward, flyback, or LLC half-bridge. For each, give one reason
            it might be chosen and one reason it would be wrong here, then
            justify why a discontinuous-mode flyback is the right answer.
          </p>
        </>
      ),
      hint: 'Forward converters need a reset winding and waste board area on a separate output inductor; LLC is overkill below ~50 W; flyback uses the transformer itself as the storage inductor.',
      solution: (
        <>
          <p className="m-0 mb-lg">The trade table for a 10 W universal-input brick:</p>
          <ul className="my-md mb-lg pl-xl">
            <li className="my-sm">
              <strong>Forward converter</strong> — fine efficiency, but
              needs a separate output choke and a magnetizing-current
              reset winding, which costs board area and a transistor
              count you can't afford at this price point<Cite id="mohan-undeland-robbins-2003" in={USBC_SOURCES}/>.
            </li>
            <li className="my-sm">
              <strong>LLC half-bridge resonant</strong> — best efficiency
              and lowest EMI but needs two switches, complex control,
              and falls apart below about 50 W of load because its
              resonant tank is sized for a specific power range.
            </li>
            <li className="my-sm">
              <strong>Flyback (DCM)</strong> — single switch, single
              magnetic, ideal galvanic isolation, output regulated by
              just sensing the secondary voltage. The transformer
              <em> is</em> the energy-storage inductor — when the
              switch is on, energy goes into the primary magnetizing
              field; when it opens, the field collapses through the
              secondary into the output<Cite id="erickson-maksimovic-2020" in={USBC_SOURCES}/>.
            </li>
          </ul>
          <p className="m-0 mb-lg">
            For 10 W universal input, flyback wins on parts count,
            cost, and footprint. Choose discontinuous-mode (DCM) over
            CCM because DCM is easier to compensate (single right-half-plane
            zero is suppressed) and at this power level the slightly
            higher peak currents are tolerable. We will run with{' '}
            <strong>DCM flyback at f<sub>sw</sub> = 65 kHz</strong>{' '}
            — high enough to keep magnetics small, low enough to keep
            switching losses tame on a cheap MOSFET<Cite id="mohan-undeland-robbins-2003" in={USBC_SOURCES}/>.
          </p>
        </>
      ),
    },
    {
      id: 'turns-ratio',
      title: 'Choose a turns ratio',
      problem: (
        <>
          <p className="m-0 mb-lg">
            For an isolated flyback, the reflected output voltage on the
            primary side (call it <InlineMath>V<sub>or</sub></InlineMath>)
            should sit somewhere between roughly 80 V and 120 V so that:
          </p>
          <ul className="my-md mb-lg pl-xl">
            <li className="my-sm">The MOSFET drain stress stays below 700 V (about half the safe margin on a common 800 V part).</li>
            <li className="my-sm">The duty cycle at low line stays below ~50% (above that, current-mode control gets nasty).</li>
          </ul>
          <p className="m-0 mb-lg">
            Pick <InlineMath>V<sub>or</sub> = 100 V</InlineMath> and
            compute the primary-to-secondary turns ratio{' '}
            <InlineMath>n = N<sub>p</sub>/N<sub>s</sub></InlineMath>.
            Then compute the MOSFET peak drain voltage at high-line.
            Use a forward diode drop of <strong>V<sub>F</sub> = 0.4 V</strong>{' '}
            for a Schottky output rectifier.
          </p>
        </>
      ),
      hint: 'During the off-time the primary sees V_in,dc + V_or. The MOSFET drain swings to V_in,dc plus the reflected output plus a leakage-spike margin of ~150 V.',
      solution: (
        <>
          <p className="m-0 mb-lg">The reflected voltage relates secondary to primary by the turns ratio:</p>
          <Formula>V<sub>or</sub> = n · (V<sub>out</sub> + V<sub>F</sub>)</Formula>
          <p className="m-0 mb-lg">
            where <strong>V<sub>or</sub></strong> is the voltage the
            primary winding shows during the off-time, <strong>V<sub>out</sub></strong>{' '}
            is the regulated output, <strong>V<sub>F</sub></strong> is the
            secondary rectifier forward drop, and <strong>n</strong> is
            the primary-to-secondary turns ratio (dimensionless).
          </p>
          <p className="m-0 mb-lg">Solve for n:</p>
          <Formula>n = V<sub>or</sub> / (V<sub>out</sub> + V<sub>F</sub>) = 100 / (5 + 0.4) ≈ <strong>18.5</strong></Formula>
          <p className="m-0 mb-lg">
            Round to the nearest practical integer ratio. <strong>N<sub>p</sub>/N<sub>s</sub> = 18:1</strong>{' '}
            is a clean choice (e.g., 54 primary turns to 3 secondary
            turns on an EFD20 core). With n = 18 and V<sub>F</sub> = 0.4 V,
            V<sub>or</sub> = 18 × 5.4 = 97 V, close enough.
          </p>
          <p className="m-0 mb-lg">The MOSFET drain at high-line, in the worst-case off-state:</p>
          <Formula>V<sub>ds,peak</sub> = V<sub>in,dc,max</sub> + V<sub>or</sub> + V<sub>spike</sub></Formula>
          <p className="m-0 mb-lg">where <strong>V<sub>spike</sub></strong> is the ringing produced by leakage inductance discharging into the snubber (typically clamped to ~150 V by an RCD snubber).</p>
          <Formula>V<sub>ds,peak</sub> ≈ 374 + 97 + 150 ≈ <strong>620 V</strong></Formula>
          <p className="m-0 mb-lg">
            That fits comfortably under an 800 V MOSFET rating with
            ~22% headroom. Picking a part rated 700 V would be cutting
            it close at the high end of input range<Cite id="erickson-maksimovic-2020" in={USBC_SOURCES}/>.
          </p>
        </>
      ),
    },
    {
      id: 'inductance',
      title: 'Size the primary magnetizing inductance',
      problem: (
        <>
          <p className="m-0 mb-lg">
            In DCM the primary current ramps from zero to a peak
            <InlineMath> I<sub>pk</sub></InlineMath> each switching cycle,
            then discharges entirely through the secondary before the
            next cycle starts. The peak primary current and the magnetizing
            inductance are linked by the energy balance:
          </p>
          <Formula>P<sub>in</sub> = ½ · L<sub>p</sub> · I<sub>pk</sub>² · f<sub>sw</sub></Formula>
          <p className="m-0 mb-lg">
            With f<sub>sw</sub> = 65 kHz, P<sub>in</sub> = 12.5 W, and a
            target peak primary current of <strong>I<sub>pk</sub> = 1.2 A</strong>{' '}
            (low enough to use a cheap 4 A MOSFET with margin), solve for
            the primary inductance L<sub>p</sub>.
          </p>
          <p className="m-0 mb-lg">
            Then verify the maximum duty cycle at low line stays below 0.5
            using <InlineMath>D = I<sub>pk</sub> · L<sub>p</sub> / (V<sub>in,dc,min</sub> · T<sub>sw</sub>)</InlineMath>.
          </p>
        </>
      ),
      hint: 'Solve the energy equation for L_p first. Then T_sw = 1/f_sw = 15.4 µs.',
      solution: (
        <>
          <p className="m-0 mb-lg">Rearrange the energy equation:</p>
          <Formula>L<sub>p</sub> = 2 · P<sub>in</sub> / (I<sub>pk</sub>² · f<sub>sw</sub>)</Formula>
          <p className="m-0 mb-lg">
            where <strong>L<sub>p</sub></strong> is the primary magnetizing
            inductance (henries), <strong>P<sub>in</sub></strong> is the
            input power drawn from the bulk cap (watts),
            <strong> I<sub>pk</sub></strong> is the target peak primary
            current (amperes), and <strong>f<sub>sw</sub></strong> is the
            switching frequency (Hz).
          </p>
          <Formula>L<sub>p</sub> = 2 · 12.5 / (1.2² · 65 000) ≈ <strong>267 µH</strong></Formula>
          <p className="m-0 mb-lg">Round to a stocking value: <strong>L<sub>p</sub> = 270 µH</strong>.</p>
          <p className="m-0 mb-lg">Duty cycle at low line:</p>
          <Formula>D<sub>max</sub> = I<sub>pk</sub> · L<sub>p</sub> · f<sub>sw</sub> / V<sub>in,dc,min</sub></Formula>
          <Formula>D<sub>max</sub> = 1.2 × 270×10⁻⁶ × 65 000 / 110 ≈ <strong>0.19</strong></Formula>
          <p className="m-0 mb-lg">
            That is well below the 0.5 ceiling — plenty of margin. The
            full DCM cycle: switch closes for D·T<sub>sw</sub> ≈ 2.9 µs
            (primary ramp), opens for ~9 µs (secondary discharge), and
            sits idle for the remaining ~3.5 µs before the next cycle.
            The idle window is what makes DCM "discontinuous"<Cite id="erickson-maksimovic-2020" in={USBC_SOURCES}/>.
          </p>
          <p className="m-0 mb-lg">
            The peak secondary current is{' '}
            <InlineMath>I<sub>sec,pk</sub> = n · I<sub>pk</sub> = 18 × 1.2 = 21.6 A</InlineMath>{' '}
            — looks alarming, but it only flows for ~9 µs each cycle and
            averages out to the 2 A output. The Schottky rectifier has
            to handle that peak instantaneously.
          </p>
        </>
      ),
    },
    {
      id: 'output-cap',
      title: 'Size the output filter capacitor',
      problem: (
        <>
          <p className="m-0 mb-lg">
            The output capacitor smooths the pulse train coming out of
            the secondary rectifier into the 5 V DC the USB-C cable
            sees. Two constraints set its size:
          </p>
          <ol className="my-md mb-lg pl-xl">
            <li className="my-sm">
              <strong>Capacitive ripple</strong> — at switching frequency,
              the charge dumped per cycle is{' '}
              <InlineMath>ΔQ = I<sub>out</sub>/f<sub>sw</sub></InlineMath>.
              Keep capacitive ripple below 50 mV<sub>pp</sub>.
            </li>
            <li className="my-sm">
              <strong>ESR ripple</strong> — the cap's equivalent series
              resistance turns the secondary's peak current into a
              voltage spike <InlineMath>ΔV = ESR · I<sub>sec,pk</sub></InlineMath>.
              With a typical low-ESR electrolytic ESR ≈ 50 mΩ, this is
              about 1 V at I<sub>sec,pk</sub> = 21.6 A — unacceptable.
            </li>
          </ol>
          <p className="m-0 mb-lg">
            Size the cap for the first constraint, then describe the
            two-stage strategy that fixes the second.
          </p>
        </>
      ),
      hint: 'C = ΔQ / ΔV. The standard fix for ESR ripple is a small post-LC filter (a 1 µH inductor and a low-ESR ceramic).',
      solution: (
        <>
          <p className="m-0 mb-lg">The capacitive part:</p>
          <Formula>C<sub>out</sub> = I<sub>out</sub> / (f<sub>sw</sub> · ΔV<sub>ripple</sub>)</Formula>
          <p className="m-0 mb-lg">where <strong>C<sub>out</sub></strong> is the reservoir capacitance (F), <strong>I<sub>out</sub></strong> = 2 A is the average output current, <strong>f<sub>sw</sub></strong> = 65 kHz is the switching frequency, and <strong>ΔV<sub>ripple</sub></strong> = 50 mV is the allowed capacitive ripple.</p>
          <Formula>C<sub>out</sub> = 2 / (65 000 × 0.050) ≈ <strong>615 µF</strong></Formula>
          <p className="m-0 mb-lg">Round up to a standard value: <strong>2 × 470 µF in parallel</strong> (low-ESR aluminum electrolytic, 10 V rating). Parallel-ing halves the ESR and the ripple-current stress per cap.</p>
          <p className="m-0 mb-lg">The ESR ripple is still ugly — even at ESR ≈ 25 mΩ (two caps in parallel) the spike is about 540 mV. The standard fix is a <strong>post-LC filter</strong>:</p>
          <ul className="my-md mb-lg pl-xl">
            <li className="my-sm">1 µH bead inductor between the bulk caps and the connector.</li>
            <li className="my-sm">22 µF X5R ceramic on the connector side.</li>
          </ul>
          <p className="m-0 mb-lg">The 1 µH × 22 µF LC has a corner frequency around 34 kHz, attenuating the 65 kHz switching ripple by another ~12 dB and reducing the output noise to under 100 mV<sub>pp</sub> — well within USB-PD spec<Cite id="usb-pd-r3" in={USBC_SOURCES}/>.</p>
        </>
      ),
    },
    {
      id: 'efficiency',
      title: 'Tally the losses',
      problem: (
        <>
          <p className="m-0 mb-lg">
            We assumed η = 80%. Verify the budget by listing the major loss buckets and adding them up.
          </p>
          <p className="m-0 mb-lg">Assume:</p>
          <ul className="my-md mb-lg pl-xl">
            <li className="my-sm">MOSFET R<sub>ds(on)</sub> = 2 Ω cold, 3 Ω hot; turn-on/turn-off energy 4 µJ per cycle (datasheet at V<sub>ds</sub> = 400 V, I = 1 A).</li>
            <li className="my-sm">Schottky V<sub>F</sub> = 0.4 V at I<sub>out</sub> = 2 A.</li>
            <li className="my-sm">Transformer copper loss 0.5 W, core loss 0.3 W at this drive level.</li>
            <li className="my-sm">Snubber dissipates 5% of input power.</li>
            <li className="my-sm">Standby controller draws 50 mW; sensing/feedback another 50 mW.</li>
          </ul>
        </>
      ),
      hint: 'Conduction loss = I_rms² · R; rectifier loss = V_F · I_avg; switching loss = E_sw · f_sw.',
      solution: (
        <>
          <p className="m-0 mb-lg">For a DCM flyback, the primary RMS current is:</p>
          <Formula>I<sub>p,rms</sub> = I<sub>pk</sub> · √(D / 3)</Formula>
          <Formula>I<sub>p,rms</sub> = 1.2 · √(0.19/3) ≈ <strong>0.30 A</strong></Formula>
          <p className="m-0 mb-lg">The buckets:</p>
          <ul className="my-md mb-lg pl-xl">
            <li className="my-sm"><strong>MOSFET conduction</strong>: 0.30² × 3 Ω = <strong>0.27 W</strong></li>
            <li className="my-sm"><strong>MOSFET switching</strong>: 4 µJ × 65 kHz = <strong>0.26 W</strong></li>
            <li className="my-sm"><strong>Secondary diode</strong>: 0.4 V × 2 A = <strong>0.80 W</strong></li>
            <li className="my-sm"><strong>Snubber</strong>: 5% × 12.5 W = <strong>0.63 W</strong></li>
            <li className="my-sm"><strong>Transformer copper + core</strong>: 0.5 + 0.3 = <strong>0.80 W</strong></li>
            <li className="my-sm"><strong>Bulk cap + bridge</strong> (estimated): <strong>0.25 W</strong></li>
            <li className="my-sm"><strong>Controller + sensing</strong>: <strong>0.10 W</strong></li>
            <li className="my-sm"><strong>Total losses</strong>: ≈ <strong>3.1 W</strong></li>
          </ul>
          <Formula>η<sub>actual</sub> = P<sub>out</sub> / (P<sub>out</sub> + P<sub>loss</sub>) = 10 / 13.1 ≈ <strong>76.3%</strong></Formula>
          <p className="m-0 mb-lg">Slightly below the 80% target. Two cheap wins recover that headroom:</p>
          <ul className="my-md mb-lg pl-xl">
            <li className="my-sm">Replace the Schottky with a <strong>synchronous-rectifier MOSFET</strong> (R<sub>ds(on)</sub> ≈ 8 mΩ at this current). Loss drops from 0.80 W to about 0.13 W — recover 0.7 W, which is the entire efficiency miss<Cite id="erickson-maksimovic-2020" in={USBC_SOURCES}/>.</li>
            <li className="my-sm">Use a more aggressive RCD snubber tuned to the leakage inductance, dropping that 5% to about 3%.</li>
          </ul>
          <p className="m-0 mb-lg">With both, η rises to about 82%, comfortably meeting Energy Star "Level VI" external power supply standards<Cite id="usb-pd-r3" in={USBC_SOURCES}/>.</p>
        </>
      ),
    },
    {
      id: 'feedback',
      title: 'Close the regulation loop',
      problem: (
        <>
          <p className="m-0 mb-lg">
            The secondary output is isolated from the primary by the
            transformer — so how does the controller on the primary
            side know what V<sub>out</sub> is? Sketch the two common
            options and pick one. Explain how the chosen scheme uses
            ideas from Ch.16 (op-amps in feedback) and Ch.7 (back-EMF
            on a winding).
          </p>
        </>
      ),
      hint: 'The two options are an optoisolator + secondary-side error amp, or primary-side regulation using the auxiliary winding voltage as a proxy for V_out.',
      solution: (
        <>
          <p className="m-0 mb-lg">Option A — <strong>opto-isolated feedback</strong> (the standard for tight regulation):</p>
          <ul className="my-md mb-lg pl-xl">
            <li className="my-sm">A <strong>TL431 shunt regulator</strong> on the secondary acts as a precision op-amp. Its 2.5 V reference compares against a resistor divider from V<sub>out</sub>.</li>
            <li className="my-sm">The TL431 modulates current through an <strong>optocoupler LED</strong>; the photo-transistor on the primary side pulls the controller's FB pin.</li>
            <li className="my-sm">This is the exact same negative-feedback architecture as the Ch.16 inverting op-amp gain stage: a high-gain error amplifier compares output to reference and drives the actuator (here, the duty cycle) until the error is nulled<Cite id="horowitz-hill-2015" in={USBC_SOURCES}/>.</li>
          </ul>
          <p className="m-0 mb-lg">Option B — <strong>primary-side regulation (PSR)</strong> (cheaper, looser regulation, used in 5 V phone chargers):</p>
          <ul className="my-md mb-lg pl-xl">
            <li className="my-sm">An <strong>auxiliary winding</strong> on the transformer (typically 8–10 turns) sits in the same flux as the secondary. During the off-time, it sees the secondary voltage scaled by N<sub>aux</sub>/N<sub>sec</sub>.</li>
            <li className="my-sm">The controller samples the auxiliary winding voltage at the moment the secondary current reaches zero (the "knee" of the flyback waveform) — that snapshot equals V<sub>out</sub> + V<sub>F</sub> reflected onto the aux winding.</li>
            <li className="my-sm">This is precisely the Ch.7 / Ch.22 picture: a third coil sharing the same flux gets the same dΦ/dt-driven voltage, and the controller treats that as a noiseless image of the regulated output.</li>
          </ul>
          <p className="m-0 mb-lg">
            For a USB-C 5 V brick, pick <strong>opto-isolated feedback</strong> if you need ±2% regulation and PSR if you can live with ±5%. Most modern designs use opto + TL431 because the optocoupler is now cheaper than the extra winding<Cite id="erickson-maksimovic-2020" in={USBC_SOURCES}/>.
          </p>
        </>
      ),
    },
    {
      id: 'failure-modes',
      title: 'Identify the three most likely failure modes',
      problem: (
        <>
          <p className="m-0 mb-lg">
            Wall-warts fail. Predict the three most likely failure modes,
            in priority order, and the design choice that mitigates each.
          </p>
        </>
      ),
      hint: 'Think thermal aging, transient overstress, and unsupervised semiconductor failure.',
      solution: (
        <>
          <ol className="my-md mb-lg pl-xl">
            <li className="my-sm">
              <strong>Bulk capacitor dries out from heat.</strong> The
              400 V electrolytic on the input bus runs at ~70 °C in a
              hot environment; the manufacturer's L<sub>10</sub> is
              ~2000 hours at 105 °C, halving every 10 °C of cooling. A
              105 °C-rated long-life cap (Nichicon UCC or similar) at
              the recommended derating extends life to ~10 years.
              <strong> Mitigation</strong>: pick a 105 °C cap with at
              least 25% voltage derating and place it away from the
              transformer.
            </li>
            <li className="my-sm">
              <strong>MOSFET dies on a line transient.</strong> A
              lightning-induced surge can drive V<sub>ds</sub> past
              700 V even with the RCD snubber. <strong>Mitigation</strong>:
              a 275 V MOV across the AC input clamps surges before they
              reach the bridge; an extra TVS across the FET clamps
              residual ringing<Cite id="mohan-undeland-robbins-2003" in={USBC_SOURCES}/>.
            </li>
            <li className="my-sm">
              <strong>Output short-circuit melts the secondary winding.</strong>{' '}
              If the USB-C cable is shorted, the controller's
              cycle-by-cycle current limit ought to fold back. If the
              current sense fails, primary current ramps unchecked.
              <strong> Mitigation</strong>: a thermal fuse soldered to
              the transformer bobbin (rated 130 °C) opens permanently
              if the magnetics overheat — the standard last-line-of-defense
              against a stuck-on MOSFET.
            </li>
          </ol>
        </>
      ),
    },
  ],
  stretch: {
    title: 'Add USB-PD negotiation for 9 V / 15 V / 20 V profiles',
    problem: (
      <>
        <p className="m-0 mb-lg">
          The USB Power Delivery 3.0 specification<Cite id="usb-pd-r3" in={USBC_SOURCES}/>{' '}
          lets a source advertise multiple voltage profiles (5 V, 9 V,
          15 V, 20 V, plus PPS variable). A laptop charger negotiates
          20 V at 3 A; a phone wakes up at 5 V then asks for 9 V to
          fast-charge. Extend the 5 V flyback above into a 20 W brick
          that supports 5 V / 9 V / 15 V profiles.
        </p>
        <p className="m-0 mb-lg">
          (1) What changes at the transformer? (2) What changes at the
          regulation loop? (3) How does the PD negotiation work
          electrically?
        </p>
      </>
    ),
    solution: (
      <>
        <p className="m-0 mb-lg">
          <strong>(1) Transformer:</strong> The reflected output voltage
          V<sub>or</sub> = n(V<sub>out</sub>+V<sub>F</sub>) now has to
          work at three different V<sub>out</sub> values. Two options:
        </p>
        <ul className="my-md mb-lg pl-xl">
          <li className="my-sm">
            <strong>Single turns ratio, variable duty</strong>. Keep
            n = 4 and let the controller increase D as V<sub>out</sub>{' '}
            climbs. At 20 V output, V<sub>or</sub> = 4 × 20.4 = 82 V
            — same primary stress, much higher secondary stress.
          </li>
          <li className="my-sm">
            <strong>Two-output flyback</strong> with a tapped secondary
            and a switch selecting which tap is rectified. Higher cost,
            but each tap can be optimised independently.
          </li>
        </ul>
        <p className="m-0 mb-lg">
          Most modern PD bricks use the first option with a single n ≈ 4
          to 6, accepting that 5 V operation has slightly worse efficiency
          because the duty cycle is small and the conduction window short.
        </p>
        <p className="m-0 mb-lg">
          <strong>(2) Regulation loop:</strong> The TL431 reference must
          become adjustable. Standard trick: a digital potentiometer (or
          a microcontroller DAC) drives an extra resistor in the
          TL431's divider so the regulation setpoint can be
          re-programmed in software. The PD controller (e.g., a CYPD3174
          or equivalent) holds the digipot setting.
        </p>
        <p className="m-0 mb-lg">
          <strong>(3) The PD negotiation:</strong> The USB-C connector
          has two extra pins called <strong>CC1</strong> and{' '}
          <strong>CC2</strong>. When a sink plugs in, the source pulls
          one CC line up through a resistor (R<sub>p</sub>) and the sink
          pulls it down (R<sub>d</sub>). The voltage on that line tells
          both sides who is the source. Then they speak <strong>BMC-encoded
          packets at 300 kbit/s</strong> on the same line: the source
          sends a <em>Source_Capabilities</em> message listing its
          profiles ([5V/3A, 9V/3A, 15V/3A, 20V/2.25A]); the sink
          replies with a <em>Request</em> selecting one; the source
          ramps up to the new voltage in &lt; 275 ms; both sides ack.
          The complete handshake is over in under half a second<Cite id="usb-pd-r3" in={USBC_SOURCES}/>.
        </p>
        <p className="m-0 mb-lg">
          Note what is being added: nothing on the analog power path
          changes fundamentally. The Ch.7-through-Ch.24 design is the
          same flyback you already built. PD only adds (a) a digital
          comm channel on the CC line, (b) a programmable reference
          on the secondary, and (c) firmware that translates a
          PD profile request into a new digipot setting. That is
          a four-chapter design adding a Ch.16-style microcontroller
          plus a Ch.14-style digipot to a Ch.7/22/23/24-style power
          converter — all the textbook adds up in one envelope-sized
          brick<Cite id="sedra-smith-2014" in={USBC_SOURCES}/>.
        </p>
      </>
    ),
  },
};

/* ─────────────────────────────────────────────────────────────────────
 * Capstone 2 — Trace your house's energy bill back to the generator
 *
 * Integrates Ch.21, Ch.22, Ch.23, Ch.27, Ch.28, Ch.29, Ch.31, Ch.33.
 * Steps: read a bill, decompose into loads, follow a kWh backward
 * through the panel, distribution transformer, sub-transmission,
 * transmission, generator stator. Compute I²R losses at each stage.
 * ────────────────────────────────────────────────────────────────── */

const TRACE_SOURCES: SourceKey[] = [
  'grainger-power-systems-2003',
  'kundur-1994-power-stability',
  'fitzgerald-kingsley-umans-2014',
  'ieee-1547-2018',
  'nec-2023',
];

const CAPSTONE_TRACE: Capstone = {
  id: 'trace-bill',
  number: 2,
  title: 'Trace your energy bill back to the generator',
  subtitle: 'Follow one kilowatt-hour from your panel to the turbine.',
  intro: (
    <>
      <p className="m-0 mb-lg">
        Your monthly electric bill is a single number — say <strong>820 kWh</strong>{' '}
        — multiplied by a rate. That number represents real electrons,
        moving down a real chain of wires and machines starting at a
        spinning generator hundreds of miles away. In this capstone we
        follow one kWh from the panel in your basement, back through
        each piece of the distribution and transmission system, all the
        way to the stator of a synchronous generator. At every stage we
        compute the I²R copper loss and the step-up or step-down
        transformer ratio that lets the loss stay tolerable.
      </p>
      <p className="m-0 mb-lg">
        By the end you will be able to look at any utility's grid map
        and know what the voltages on each line actually are, why
        they were chosen, and what fraction of the generator's output
        is dissipated as heat before it ever reaches a wall outlet.
      </p>
    </>
  ),
  requiredChapters: [
    'generators',
    'magnetically-coupled-circuits',
    'transformers',
    'house-grid-arrives',
    'house-panel',
    'house-branch-circuits',
    'house-big-loads',
    'house-smart-meter',
  ],
  sources: TRACE_SOURCES,
  estimatedMinutes: 75,
  steps: [
    {
      id: 'read-bill',
      title: 'Read a sample bill',
      problem: (
        <>
          <p className="m-0 mb-lg">
            A North-American single-family-home electric bill for one
            month shows:
          </p>
          <ul className="my-md mb-lg pl-xl">
            <li className="my-sm">Energy used: <strong>820 kWh</strong></li>
            <li className="my-sm">Energy rate: <strong>$0.16 / kWh</strong></li>
            <li className="my-sm">Delivery / distribution charge: <strong>$0.08 / kWh</strong></li>
            <li className="my-sm">Demand peak: <strong>5.2 kW</strong> (15-minute window)</li>
            <li className="my-sm">Time-of-use split: 60% off-peak, 40% peak</li>
          </ul>
          <p className="m-0 mb-lg">
            Compute (a) the total monthly cost, (b) the average power
            draw over the month, and (c) the ratio of peak demand to
            average power (this is the <strong>load factor</strong>'s
            inverse, and it is what makes residential rate-making hard).
          </p>
        </>
      ),
      hint: '1 month ≈ 730 hours. Average power = energy / time.',
      solution: (
        <>
          <p className="m-0 mb-lg">(a) Monthly cost:</p>
          <Formula>Cost = 820 kWh × ($0.16 + $0.08)/kWh = <strong>$196.80</strong></Formula>
          <p className="m-0 mb-lg">(b) Average power over a 30-day month (730 hours):</p>
          <Formula>P<sub>avg</sub> = 820 kWh / 730 h ≈ <strong>1.12 kW</strong></Formula>
          <p className="m-0 mb-lg">(c) Peak-to-average ratio:</p>
          <Formula>5.2 kW / 1.12 kW ≈ <strong>4.6</strong></Formula>
          <p className="m-0 mb-lg">
            A peak-to-average of 4.6 is typical for a residence with
            electric cooking and an HVAC load — when the AC starts and
            the oven and dryer overlap, the panel briefly draws several
            kW; the rest of the day it sits near baseline. The whole
            distribution network is sized for that peak, not the
            average — which is why utilities increasingly use demand
            charges and time-of-use rates to push customers off-peak<Cite id="grainger-power-systems-2003" in={TRACE_SOURCES}/>.
          </p>
        </>
      ),
    },
    {
      id: 'decompose',
      title: 'Decompose the kWh into appliance categories',
      problem: (
        <>
          <p className="m-0 mb-lg">
            Where does 820 kWh / month actually go? Allocate the energy
            across these load categories using typical North-American
            single-family-home profiles (a heat-pumped house in a mild
            climate):
          </p>
          <ul className="my-md mb-lg pl-xl">
            <li className="my-sm">HVAC (heat pump): runs 4 hours/day at 2.5 kW</li>
            <li className="my-sm">Water heater (resistance, electric): 3 kWh/day</li>
            <li className="my-sm">Refrigerator + freezer: 1.5 kWh/day</li>
            <li className="my-sm">Cooking (electric range + microwave + small): 2 kWh/day</li>
            <li className="my-sm">Lighting (LED): 0.5 kWh/day</li>
            <li className="my-sm">Plug loads (TV, laptops, charger bricks): 3 kWh/day</li>
            <li className="my-sm">EV charging (level 2, every other day, 25 kWh per session): ?</li>
            <li className="my-sm">Phantom loads (always-on): 0.8 kWh/day</li>
          </ul>
          <p className="m-0 mb-lg">
            For each load, compute monthly kWh, then add them up. Does it land at 820?
          </p>
        </>
      ),
      hint: 'Each daily kWh × 30 = monthly kWh. EV: 25 kWh × 15 sessions = 375.',
      solution: (
        <>
          <p className="m-0 mb-lg">Monthly totals:</p>
          <ul className="my-md mb-lg pl-xl">
            <li className="my-sm">HVAC: 2.5 kW × 4 h × 30 = <strong>300 kWh</strong></li>
            <li className="my-sm">Water heater: 3 × 30 = <strong>90 kWh</strong></li>
            <li className="my-sm">Refrigerator + freezer: 1.5 × 30 = <strong>45 kWh</strong></li>
            <li className="my-sm">Cooking: 2 × 30 = <strong>60 kWh</strong></li>
            <li className="my-sm">Lighting: 0.5 × 30 = <strong>15 kWh</strong></li>
            <li className="my-sm">Plug loads: 3 × 30 = <strong>90 kWh</strong></li>
            <li className="my-sm">EV (15 sessions × 25 kWh): <strong>375 kWh</strong></li>
            <li className="my-sm">Phantom: 0.8 × 30 = <strong>24 kWh</strong></li>
            <li className="my-sm"><strong>Total: 999 kWh</strong></li>
          </ul>
          <p className="m-0 mb-lg">
            That over-shoots 820. The EV is the swing — at 15 sessions of
            25 kWh, an EV alone consumes more than every other load
            combined. Dial back to 12 sessions/month (about 9 000
            miles/year) and the EV total drops to 300 kWh, bringing the
            grand total to 924 kWh. Subtract another 100 kWh for
            seasonal HVAC variation and you land near 820.
          </p>
          <p className="m-0 mb-lg">
            The lesson: in a fully-electrified house, <strong>HVAC and
            EV charging together dominate the bill</strong>. Every
            other load is rounding error<Cite id="grainger-power-systems-2003" in={TRACE_SOURCES}/>.
          </p>
        </>
      ),
    },
    {
      id: 'panel-to-pole',
      title: 'Step 1: From your panel back to the distribution transformer',
      problem: (
        <>
          <p className="m-0 mb-lg">
            The single-phase 240 V service from your panel runs back
            along an aerial or buried <strong>service drop</strong>{' '}
            (about 30 m of 1/0 AWG aluminum at 90 mΩ/km), to a
            pole-mounted or pad-mounted <strong>distribution transformer</strong>{' '}
            sized to feed a handful of houses (typically 25 kVA single-phase).
          </p>
          <p className="m-0 mb-lg">
            With your average draw at 1.12 kW (about 4.7 A at 240 V),
            compute the voltage drop along the service drop and the
            I²R loss in that conductor over a month.
          </p>
        </>
      ),
      hint: 'R = ρL/A from Ch.4, or look up the conductor table directly. Service-drop length 30 m, two conductors so R_total = 2 × R_one_way.',
      solution: (
        <>
          <p className="m-0 mb-lg">1/0 AWG aluminum: cross-section 53.5 mm², ρ ≈ 2.65×10⁻⁸ Ω·m. Per Ch.4:</p>
          <Formula>R = ρL/A = 2.65×10⁻⁸ × 30 / 53.5×10⁻⁶ ≈ <strong>14.9 mΩ</strong> (one way)</Formula>
          <p className="m-0 mb-lg">The current loop uses both conductors (hot and neutral on a 120 V loop, or two hots on a 240 V loop), so the round-trip resistance is doubled:</p>
          <Formula>R<sub>loop</sub> ≈ 29.7 mΩ</Formula>
          <p className="m-0 mb-lg">Voltage drop at average load (I = 4.7 A on a 240 V circuit):</p>
          <Formula>ΔV = IR = 4.7 × 0.0297 ≈ <strong>0.14 V</strong></Formula>
          <p className="m-0 mb-lg">I²R copper loss:</p>
          <Formula>P<sub>loss</sub> = I²R = 4.7² × 0.0297 ≈ <strong>0.66 W</strong></Formula>
          <p className="m-0 mb-lg">Over a month (730 hours):</p>
          <Formula>E<sub>loss</sub> = 0.66 W × 730 h ≈ <strong>0.48 kWh</strong></Formula>
          <p className="m-0 mb-lg">About <Num value={0.48/820*100}/>% of your monthly draw lost just in the service drop. At the peak load of 5.2 kW, the instantaneous loss climbs to (21.7)² × 0.0297 ≈ 14 W, still less than 0.3% of the delivered power<Cite id="nec-2023" in={TRACE_SOURCES}/>.</p>
        </>
      ),
    },
    {
      id: 'distribution-xfmr',
      title: 'Step 2: Distribution transformer (the pole pig)',
      problem: (
        <>
          <p className="m-0 mb-lg">
            The 25 kVA distribution transformer on your pole steps
            <strong> 7.2 kV phase-to-neutral</strong> on the primary
            (single phase of a 12.47 kV three-phase distribution line)
            down to <strong>240 V split-phase</strong> on the secondary.
          </p>
          <p className="m-0 mb-lg">
            (a) Compute the turns ratio. (b) For your 1.12 kW average
            load, compute the primary current. (c) A typical 25 kVA pole
            transformer has core loss ≈ 80 W (continuous, even at no
            load) and copper loss ≈ 350 W at full load (which scales
            as I²). What is the transformer's loss at your average
            load?
          </p>
        </>
      ),
      hint: 'Use V₁/V₂ = N₁/N₂. Copper loss at fractional load: P_cu(load) = P_cu(full) × (S/S_rated)².',
      solution: (
        <>
          <p className="m-0 mb-lg">(a) Turns ratio:</p>
          <Formula>n = N<sub>1</sub>/N<sub>2</sub> = V<sub>1</sub>/V<sub>2</sub> = 7200/240 = <strong>30</strong></Formula>
          <p className="m-0 mb-lg">
            where <strong>V<sub>1</sub></strong> is the primary phase-to-neutral
            voltage and <strong>V<sub>2</sub></strong> is the secondary
            line-to-line voltage of the centre-tapped split-phase output<Cite id="grainger-power-systems-2003" in={TRACE_SOURCES}/>.
          </p>
          <p className="m-0 mb-lg">(b) Primary current at 1.12 kW (unity power factor assumed for simplicity):</p>
          <Formula>I<sub>1</sub> = P / V<sub>1</sub> = 1120 / 7200 ≈ <strong>0.156 A</strong></Formula>
          <p className="m-0 mb-lg">(c) Copper loss scales as load², where the load fraction is S/S<sub>rated</sub>:</p>
          <Formula>S/S<sub>rated</sub> = 1.12 / 25 = 0.045</Formula>
          <Formula>P<sub>cu,avg</sub> = 350 × 0.045² ≈ <strong>0.7 W</strong></Formula>
          <p className="m-0 mb-lg">Core loss is roughly load-independent at 80 W. So at your load:</p>
          <Formula>P<sub>total,xfmr</sub> ≈ 80 + 0.7 ≈ <strong>81 W</strong></Formula>
          <p className="m-0 mb-lg">
            This is the key insight: the <strong>core loss dominates at light load</strong>.
            A pole transformer is always burning ~80 W of magnetising
            current just sitting there. Over a month, that is 80 × 730 ≈
            58 kWh — about 7% of your bill, but the cost is shared
            across several houses on the same transformer<Cite id="fitzgerald-kingsley-umans-2014" in={TRACE_SOURCES}/>.
          </p>
        </>
      ),
    },
    {
      id: 'distribution-line',
      title: 'Step 3: Primary distribution feeder',
      problem: (
        <>
          <p className="m-0 mb-lg">
            The 12.47 kV three-phase feeder runs about 5 km from your
            neighbourhood transformer back to a distribution substation.
            Conductor: <strong>336 MCM ACSR</strong> aluminum-with-steel-core
            (typical for urban primary, R ≈ 0.18 Ω/km at 50 °C).
          </p>
          <p className="m-0 mb-lg">
            Assume the feeder serves 200 homes averaging 1.12 kW each.
            Compute the I²R loss along the feeder. Express it as a
            fraction of the power delivered.
          </p>
        </>
      ),
      hint: 'Three-phase power P = √3 · V_LL · I · cos(φ). Compute total load, then I.',
      solution: (
        <>
          <p className="m-0 mb-lg">Total load on the feeder:</p>
          <Formula>P<sub>total</sub> = 200 × 1.12 kW = <strong>224 kW</strong></Formula>
          <p className="m-0 mb-lg">Line current (V<sub>LL</sub> = 12.47 kV, assume cos φ ≈ 0.95):</p>
          <Formula>I = P / (√3 · V<sub>LL</sub> · cos φ) = 224 000 / (1.732 × 12 470 × 0.95) ≈ <strong>10.9 A</strong></Formula>
          <p className="m-0 mb-lg">Per-phase resistance over 5 km:</p>
          <Formula>R = 0.18 Ω/km × 5 km = 0.9 Ω</Formula>
          <p className="m-0 mb-lg">I²R loss per phase, times three phases:</p>
          <Formula>P<sub>loss</sub> = 3 · I²R = 3 × 10.9² × 0.9 ≈ <strong>321 W</strong></Formula>
          <p className="m-0 mb-lg">As a fraction of delivered power:</p>
          <Formula>321 / 224 000 ≈ <strong>0.14%</strong></Formula>
          <p className="m-0 mb-lg">
            That's a tiny fraction — and it's why distribution runs at
            12 kV instead of 240 V. If the same 224 kW were sent at 240 V
            you would need I = 224 000 / 240 ≈ 933 A, and the I²R loss
            would scale by (933/10.9)² ≈ 7300 — completely melting the
            line. <em>Voltage is just a stand-in for fewer amps</em>;
            transformers buy you fewer amps at the cost of more wire
            insulation, and the wire wins every time at distance<Cite id="grainger-power-systems-2003" in={TRACE_SOURCES}/>.
          </p>
        </>
      ),
    },
    {
      id: 'substation',
      title: 'Step 4: Substation step-down transformer',
      problem: (
        <>
          <p className="m-0 mb-lg">
            The substation steps <strong>69 kV</strong> sub-transmission
            down to 12.47 kV distribution. A 10 MVA three-phase
            substation transformer has typical losses: core ≈ 8 kW
            continuous, copper ≈ 35 kW at full load.
          </p>
          <p className="m-0 mb-lg">
            Compute its losses at your neighbourhood's 224 kW load
            (the fraction-of-rated approach again). What is the
            efficiency of just this transformer at that load?
          </p>
        </>
      ),
      hint: 'S/S_rated for 224 kW out of 10 000 kVA. Copper scales as the square; core is constant.',
      solution: (
        <>
          <p className="m-0 mb-lg">The substation feeds many neighbourhoods, so 224 kW is a small fraction of its rating. The neighbourhood's share of the loss:</p>
          <Formula>S/S<sub>rated</sub> = 224 / 10 000 = 0.0224</Formula>
          <p className="m-0 mb-lg">Copper loss attributable to the neighbourhood (scales as load²):</p>
          <Formula>P<sub>cu</sub> = 35 000 × 0.0224² ≈ <strong>17.6 W</strong></Formula>
          <p className="m-0 mb-lg">Core loss <em>per neighbourhood</em> (shared by all loads on the substation, roughly 50 neighbourhoods at full diversified load):</p>
          <Formula>P<sub>core,share</sub> = 8000 / 50 ≈ <strong>160 W</strong></Formula>
          <p className="m-0 mb-lg">Combined substation loss attributable to this 224 kW load: ≈ <strong>178 W</strong>, or 0.08%. Cumulative loss so far from house to substation:</p>
          <ul className="my-md mb-lg pl-xl">
            <li className="my-sm">Service drop: 0.66 W per house × 200 = 132 W</li>
            <li className="my-sm">Distribution transformer (80 W × 50 pole pigs to serve 200 homes): 4 000 W</li>
            <li className="my-sm">Primary feeder: 321 W</li>
            <li className="my-sm">Substation transformer (this load's share): 178 W</li>
            <li className="my-sm"><strong>Subtotal: ~4.6 kW lost for 224 kW delivered</strong></li>
          </ul>
          <p className="m-0 mb-lg">
            ≈ <strong>2.1% loss</strong> from the substation low side to
            the customer side of every house's meter. That figure is
            consistent with EIA/IEEE published distribution-loss data of
            5–8% (the remainder being losses in the sub-transmission
            and transmission stages we still have to cover)<Cite id="kundur-1994-power-stability" in={TRACE_SOURCES}/>.
          </p>
        </>
      ),
    },
    {
      id: 'transmission',
      title: 'Step 5: The sub-transmission and transmission grid',
      problem: (
        <>
          <p className="m-0 mb-lg">
            Above the substation runs the high-voltage backbone. A typical
            chain:
          </p>
          <ul className="my-md mb-lg pl-xl">
            <li className="my-sm"><strong>69 kV sub-transmission</strong> from regional switching yard to substation (~50 km)</li>
            <li className="my-sm"><strong>230 kV bulk transmission</strong> from generating area to regional switching yard (~200 km)</li>
            <li className="my-sm">
              Optionally a <strong>500 kV or higher EHV line</strong> for
              inter-area transfers (skip for this exercise)
            </li>
          </ul>
          <p className="m-0 mb-lg">
            For the 224 kW neighbourhood load, compute the line current at
            each voltage and the I²R loss assuming the same 0.18 Ω/km
            per phase. What is the cumulative loss from the generator
            stator to your panel?
          </p>
        </>
      ),
      hint: 'Same √3·V·I·cosφ relation. Smaller current at higher voltage means quadratically smaller losses.',
      solution: (
        <>
          <p className="m-0 mb-lg">69 kV sub-transmission, 50 km, your neighbourhood's share of 224 kW:</p>
          <Formula>I = 224 000 / (1.732 × 69 000 × 0.95) ≈ <strong>1.97 A</strong></Formula>
          <Formula>P<sub>loss</sub> = 3 × 1.97² × (0.18 × 50) = 3 × 3.88 × 9 ≈ <strong>105 W</strong></Formula>
          <p className="m-0 mb-lg">230 kV bulk transmission, 200 km:</p>
          <Formula>I = 224 000 / (1.732 × 230 000 × 0.95) ≈ <strong>0.59 A</strong></Formula>
          <Formula>P<sub>loss</sub> = 3 × 0.59² × (0.18 × 200) = 3 × 0.348 × 36 ≈ <strong>37.6 W</strong></Formula>
          <p className="m-0 mb-lg">
            That is the magic of high-voltage transmission: 200 km of
            line attributable to a single 224 kW load dissipates less
            than 40 W. Step the voltage up by a factor of 10 and the
            current goes down by 10 and the losses go down by 100.
          </p>
          <p className="m-0 mb-lg">Cumulative house-to-generator loss summary, for the neighbourhood's 224 kW:</p>
          <ul className="my-md mb-lg pl-xl">
            <li className="my-sm">Aggregated service drops: 132 W</li>
            <li className="my-sm">Pole transformers: 4 000 W</li>
            <li className="my-sm">12.47 kV feeder: 321 W</li>
            <li className="my-sm">Substation transformer: 178 W</li>
            <li className="my-sm">69 kV sub-transmission: 105 W</li>
            <li className="my-sm">230 kV transmission: 38 W</li>
            <li className="my-sm">Generator step-up transformer (similar size to substation transformer, ~150 W): 150 W</li>
            <li className="my-sm"><strong>Total: ~4.9 kW</strong> out of 224 kW gross at the generator → <strong>~2.2% delivery loss</strong></li>
          </ul>
          <p className="m-0 mb-lg">
            Real-world utility delivery losses run higher (5–7%) because
            of (a) inductive imbalance and reactive flow which our cosφ = 0.95
            partially captures, (b) corona losses on the highest-voltage
            lines, and (c) transformer losses I've estimated conservatively<Cite id="kundur-1994-power-stability" in={TRACE_SOURCES}/>.
            But the architecture is right: each transformer step is what
            keeps the loss at single-digit percent over a continent.
          </p>
        </>
      ),
    },
    {
      id: 'generator',
      title: 'Step 6: The generator stator',
      problem: (
        <>
          <p className="m-0 mb-lg">
            A typical regional generator delivering this region: a 500 MW
            three-phase synchronous machine at 22 kV terminal voltage,
            spinning at 3600 RPM (60 Hz, 2-pole machine). Compute:
          </p>
          <ul className="my-md mb-lg pl-xl">
            <li className="my-sm">The stator line current at full output.</li>
            <li className="my-sm">The mechanical torque the turbine must supply (assume 98% generator efficiency).</li>
            <li className="my-sm">Where in the generator the I²R losses go and how they are removed.</li>
          </ul>
        </>
      ),
      hint: 'I = P / (√3·V_LL·cosφ). Torque τ = P / ω, where ω = 2π·f = 2π·60 rad/s for a 2-pole machine.',
      solution: (
        <>
          <p className="m-0 mb-lg">Stator line current:</p>
          <Formula>I<sub>stator</sub> = 500 000 000 / (1.732 × 22 000 × 0.95) ≈ <strong>13 800 A</strong></Formula>
          <p className="m-0 mb-lg">That's 13.8 kA flowing through each of three stator windings — through hollow water-cooled copper bars typically 100 mm × 50 mm in cross-section<Cite id="fitzgerald-kingsley-umans-2014" in={TRACE_SOURCES}/>.</p>
          <p className="m-0 mb-lg">Mechanical input power at 98% efficiency:</p>
          <Formula>P<sub>mech</sub> = 500 / 0.98 ≈ <strong>510 MW</strong></Formula>
          <p className="m-0 mb-lg">Mechanical angular velocity:</p>
          <Formula>ω = 2π · 60 = 377 rad/s</Formula>
          <p className="m-0 mb-lg">Shaft torque:</p>
          <Formula>τ = P<sub>mech</sub> / ω = 510×10⁶ / 377 ≈ <strong>1.35 MN·m</strong></Formula>
          <p className="m-0 mb-lg">
            That's 1.35 million newton-metres on a steel shaft, roughly
            the torque required to lift a fully-loaded jumbo jet on a
            1 m lever arm. The shaft itself is forged carbon steel
            about half a metre in diameter.
          </p>
          <p className="m-0 mb-lg">
            Losses inside the generator (10 MW total at 98% efficiency,
            for 500 MW output):
          </p>
          <ul className="my-md mb-lg pl-xl">
            <li className="my-sm"><strong>Stator copper I²R</strong> (the biggest): ~4 MW</li>
            <li className="my-sm"><strong>Rotor field copper I²R</strong>: ~1 MW</li>
            <li className="my-sm"><strong>Stator iron core (eddy + hysteresis)</strong>: ~3 MW</li>
            <li className="my-sm"><strong>Windage and friction</strong>: ~1 MW</li>
            <li className="my-sm"><strong>Stray load loss</strong>: ~1 MW</li>
          </ul>
          <p className="m-0 mb-lg">
            All of that is hauled away by <strong>hydrogen-cooled stator</strong>{' '}
            (H₂ at 4 bar circulates through hollow conductor bars; lower
            density means lower windage, higher heat-transfer coefficient
            than air), <strong>water-cooled stator-end ducts</strong>, and
            <strong> oil cooling on the bearings</strong>. Without that
            cooling, the stator copper would melt in seconds<Cite id="kundur-1994-power-stability" in={TRACE_SOURCES}/>.
          </p>
        </>
      ),
    },
    {
      id: 'kwh',
      title: 'Step 7: Follow one kilowatt-hour',
      problem: (
        <>
          <p className="m-0 mb-lg">
            Put it together. One kWh delivered to your panel
            <strong> required how many kWh extracted at the turbine
            shaft</strong>, and what fraction was lost at each stage?
            How long does it take that kWh to traverse the system,
            from the turbine to your wall outlet?
          </p>
        </>
      ),
      hint: 'Energy through the chain scales by the efficiency of each link. Speed of energy flow through the grid is set by the speed of light on transmission lines (~2/3 c for overhead conductors).',
      solution: (
        <>
          <p className="m-0 mb-lg">Cumulative efficiency from the chain above (each loss as fraction of generator output):</p>
          <ul className="my-md mb-lg pl-xl">
            <li className="my-sm">Generator internal (98%): 2% loss</li>
            <li className="my-sm">Step-up transformer + transmission + sub-transmission + substation: ~3% total</li>
            <li className="my-sm">Distribution (feeder + pole transformer + service drop): ~2.5%</li>
            <li className="my-sm"><strong>End-to-end efficiency ≈ 92.5%</strong></li>
          </ul>
          <p className="m-0 mb-lg">So 1 kWh at the panel required:</p>
          <Formula>E<sub>shaft</sub> = 1 / 0.925 ≈ <strong>1.08 kWh</strong> at the turbine shaft</Formula>
          <p className="m-0 mb-lg">And in terms of fuel energy (assuming a 33% efficient coal plant or 60% efficient combined-cycle gas):</p>
          <Formula>E<sub>fuel,coal</sub> = 1 / (0.925 × 0.33) ≈ <strong>3.3 kWh</strong> of coal heat per delivered kWh</Formula>
          <p className="m-0 mb-lg">
            Travel time. The energy travels as an electromagnetic wave
            on the conductor at the speed of light scaled by the line's
            geometry — roughly <strong>2×10⁸ m/s</strong> for overhead
            AC line and almost equally fast underground. For a 250 km
            grid path:
          </p>
          <Formula>t = d / v = 250 000 / 2×10⁸ ≈ <strong>1.25 ms</strong></Formula>
          <p className="m-0 mb-lg">
            Faster than the synchronous machine can change phase
            relative to the rest of the grid (one full 60 Hz cycle is
            16.7 ms). That is why the entire interconnect can stay
            phase-locked: the propagation delay across the grid is far
            less than a cycle, and the inertia of all the synchronous
            generators keeps the frequency stable to within ±0.05 Hz
            day-in, day-out<Cite id="kundur-1994-power-stability" in={TRACE_SOURCES}/>.
          </p>
          <p className="m-0 mb-lg">
            Each kWh on your bill therefore represents about <strong>3 kWh of
            fuel heat</strong>, 1.08 kWh at the turbine shaft, and just over
            a millisecond of travel time from generator stator to wall
            outlet.
          </p>
        </>
      ),
    },
  ],
  stretch: {
    title: 'Compare the carbon intensity of three generation mixes',
    problem: (
      <>
        <p className="m-0 mb-lg">
          For your 820 kWh/month, compute the CO₂ emissions if the
          electricity came from:
        </p>
        <ol className="my-md mb-lg pl-xl">
          <li className="my-sm">A subcritical coal plant (~33% thermal efficiency, ~95 g CO₂ per MJ of coal heat)</li>
          <li className="my-sm">A combined-cycle gas turbine (~60% thermal efficiency, ~56 g CO₂ per MJ of gas heat)</li>
          <li className="my-sm">A hydroelectric plant (~98% generation efficiency, 0 g CO₂ direct)</li>
        </ol>
        <p className="m-0 mb-lg">
          Then compute the equivalent home-energy efficiency improvement
          (in percent kWh reduction) needed to bring each high-carbon
          source down to the carbon footprint of the hydro case.
        </p>
      </>
    ),
    solution: (
      <>
        <p className="m-0 mb-lg">
          The chain is: delivered kWh → kWh of generator output (×1/0.925) →
          kWh of fuel heat (× 1/η<sub>thermal</sub>) → CO₂ from that
          heat. Note 1 kWh = 3.6 MJ.
        </p>
        <p className="m-0 mb-lg">
          <strong>Coal:</strong> fuel heat for 820 kWh delivered =
          820 × (3.6/0.925/0.33) ≈ <strong>9 670 MJ</strong>. CO₂ = 9670 × 95 g ≈ <strong>919 kg / month</strong>.
        </p>
        <p className="m-0 mb-lg">
          <strong>CCGT:</strong> fuel heat = 820 × (3.6/0.925/0.60) ≈ <strong>5 320 MJ</strong>. CO₂ = 5320 × 56 g ≈ <strong>298 kg / month</strong>.
        </p>
        <p className="m-0 mb-lg">
          <strong>Hydro:</strong> 0 g direct (a small embodied figure of
          ~24 g/kWh exists for dam construction over project life, giving
          ~20 kg/month, but it is order-of-magnitude smaller than the
          fossil cases).
        </p>
        <p className="m-0 mb-lg">
          So a household's electrical CO₂ footprint varies by a factor
          of ~50 depending purely on the upstream fuel mix. The two
          fossil sources differ by 3.1× — the entire post-2000 push to
          replace coal with gas in the US gave roughly that
          improvement<Cite id="ieee-1547-2018" in={TRACE_SOURCES}/>.
        </p>
        <p className="m-0 mb-lg">
          To match the hydro case via efficiency alone:
        </p>
        <ul className="my-md mb-lg pl-xl">
          <li className="my-sm">From coal: need to cut 919 → ~0 → almost <strong>100% kWh reduction</strong>. Not possible by efficiency; you have to change the generation source.</li>
          <li className="my-sm">From CCGT: need 298 → ~0 → again ~100%. Same conclusion.</li>
        </ul>
        <p className="m-0 mb-lg">
          Within a fossil-dominant grid, household conservation has a
          finite ceiling: even cutting your usage 50% only halves your
          footprint. The decarbonisation problem is not on your bill;
          it is on the generation stack 200 km upstream.
        </p>
      </>
    ),
  },
};

/* ─────────────────────────────────────────────────────────────────────
 * Capstone 3 — Build an AM radio receiver
 *
 * Integrates Ch.12 (impedance), Ch.13 (network analysis), Ch.14
 * (semiconductors), Ch.15 (Fourier), Ch.16 (filters / op-amps).
 * Steps: pick a station, design the antenna-coupled LC tank, the
 * envelope detector, the audio gain stage, the speaker driver.
 * Stretch: superheterodyne front-end.
 * ────────────────────────────────────────────────────────────────── */

const RADIO_SOURCES: SourceKey[] = [
  'horowitz-hill-2015',
  'sedra-smith-2014',
  'oppenheim-willsky-1997',
  'pozar-2011',
];

const CAPSTONE_RADIO: Capstone = {
  id: 'am-radio',
  number: 3,
  title: 'Build an AM radio receiver',
  subtitle: 'A 1 MHz carrier, an LC tank, a diode, an op-amp, and a speaker.',
  intro: (
    <>
      <p className="m-0 mb-lg">
        An AM radio is the smallest complete receiver you can build —
        the entire signal path fits on a piece of perfboard the size of
        a postcard. In this capstone we design one from scratch around
        a real broadcast station: a 1 MHz carrier (mid-band on the US
        AM dial), 5 kHz audio bandwidth on each sideband, and a few
        millivolts of received signal at the antenna. We will pick the
        antenna-coupled LC tank to select the carrier, the envelope-detector
        diode + RC to demodulate it, the op-amp audio stage to bring
        millivolts up to a level a speaker can use, and the small
        push-pull output stage that drives a 4 Ω speaker.
      </p>
      <p className="m-0 mb-lg">
        Every part of the design is an application of one chapter:
        impedance matching from Ch.12, network analysis from Ch.13,
        the diode equation from Ch.14, the Fourier decomposition of
        an AM waveform from Ch.15, and op-amps in feedback from Ch.16.
        By the end you will have a working schematic and a clear
        idea why every part is in the value it is.
      </p>
    </>
  ),
  requiredChapters: [
    'circuits-and-ac',
    'network-analysis',
    'semiconductors',
    'fourier-harmonics',
    'filters-op-amps-tlines',
  ],
  sources: RADIO_SOURCES,
  estimatedMinutes: 75,
  steps: [
    {
      id: 'spectrum',
      title: 'Decompose the AM waveform',
      problem: (
        <>
          <p className="m-0 mb-lg">
            A standard AM broadcast signal is the amplitude modulation
            of a carrier by an audio signal:
          </p>
          <Formula>v(t) = A<sub>c</sub> [1 + m · s(t)] cos(2π f<sub>c</sub> t)</Formula>
          <p className="m-0 mb-lg">
            where <strong>A<sub>c</sub></strong> is the carrier amplitude
            (volts), <strong>m</strong> ∈ [0, 1] is the modulation index
            (dimensionless), <strong>s(t)</strong> is the audio signal
            normalised to ±1, and <strong>f<sub>c</sub></strong> is the
            carrier frequency (Hz).
          </p>
          <p className="m-0 mb-lg">
            Let s(t) be a pure 1 kHz tone, s(t) = cos(2π·1000·t). Expand
            the expression for v(t) using the trig product-to-sum
            identity and identify the three spectral lines present.
            Pick the picture-correct values for an AM-band station:
            f<sub>c</sub> = 1.00 MHz, m = 0.5, A<sub>c</sub> = 1 mV
            (typical at the antenna).
          </p>
        </>
      ),
      hint: 'cos α · cos β = ½[cos(α−β) + cos(α+β)]. The carrier itself contributes one line; the modulation creates two sidebands.',
      solution: (
        <>
          <p className="m-0 mb-lg">Substitute s(t) and expand:</p>
          <Formula>v(t) = A<sub>c</sub> cos(2π f<sub>c</sub> t) + m A<sub>c</sub> cos(2π·1000·t) · cos(2π f<sub>c</sub> t)</Formula>
          <p className="m-0 mb-lg">Apply the product identity:</p>
          <Formula>cos(2π·1000·t) cos(2π f<sub>c</sub> t) = ½[cos(2π(f<sub>c</sub>−1000)t) + cos(2π(f<sub>c</sub>+1000)t)]</Formula>
          <p className="m-0 mb-lg">So:</p>
          <Formula>v(t) = A<sub>c</sub> cos(2π f<sub>c</sub> t) + (mA<sub>c</sub>/2) cos(2π·999 000·t) + (mA<sub>c</sub>/2) cos(2π·1 001 000·t)</Formula>
          <p className="m-0 mb-lg">Three spectral lines:</p>
          <ul className="my-md mb-lg pl-xl">
            <li className="my-sm"><strong>Carrier</strong> at 1.000 000 MHz, amplitude 1 mV</li>
            <li className="my-sm"><strong>Lower sideband</strong> at 0.999 000 MHz, amplitude 0.25 mV</li>
            <li className="my-sm"><strong>Upper sideband</strong> at 1.001 000 MHz, amplitude 0.25 mV</li>
          </ul>
          <p className="m-0 mb-lg">
            This is the Ch.15 Fourier picture in its simplest form: any
            modulated signal is a sum of pure sinusoids, and AM
            modulation by a single tone produces exactly three of them<Cite id="oppenheim-willsky-1997" in={RADIO_SOURCES}/>.
          </p>
          <p className="m-0 mb-lg">
            For a full music programme with 5 kHz audio bandwidth, the
            sidebands fill out into two continuous "wings" extending 5 kHz
            on either side of the carrier — a total of <strong>10 kHz
            channel bandwidth</strong>, which is exactly why AM stations
            are spaced at 10 kHz centres in North America.
          </p>
        </>
      ),
    },
    {
      id: 'tank',
      title: 'Design the antenna-coupled LC tank',
      problem: (
        <>
          <p className="m-0 mb-lg">
            Your antenna picks up <em>every</em> AM station on the dial
            simultaneously, plus noise. The first job of the receiver is
            to <strong>select</strong> the 1 MHz station with a tuned
            LC tank. The tank's resonant frequency:
          </p>
          <Formula>f<sub>0</sub> = 1 / (2π√(LC))</Formula>
          <p className="m-0 mb-lg">
            Pick a variable capacitor (standard hobby part:
            <strong> C = 365 pF max</strong>) and compute the inductance
            L needed for resonance at 1 MHz. Then pick the {' '}
            <strong>quality factor Q</strong> you'd need to reject the
            adjacent 10 kHz station and compute the parallel resistance
            equivalent.
          </p>
        </>
      ),
      hint: 'Solve for L: L = 1/(4π²f² C). For Q, recall the bandwidth Δf = f₀/Q for a parallel LC.',
      solution: (
        <>
          <p className="m-0 mb-lg">For f<sub>0</sub> = 1.00 MHz, C = 365 pF (capacitor at maximum mesh; we tune by reducing C):</p>
          <Formula>L = 1 / (4π² · (10⁶)² · 365×10⁻¹²) ≈ <strong>69.4 µH</strong></Formula>
          <p className="m-0 mb-lg">
            where <strong>L</strong> is the tank inductance (henries),
            <strong> f<sub>0</sub></strong> is the resonant frequency
            (Hz), and <strong>C</strong> is the variable capacitance (F).
          </p>
          <p className="m-0 mb-lg">
            Round to 68 µH, a stocking value. Wound on a ferrite rod
            antenna of 100 mm length × 10 mm diameter, that is roughly
            70 turns of 28 AWG enamelled wire — and that same rod
            doubles as the antenna because its high-permeability core
            concentrates the magnetic component of the incoming EM wave<Cite id="horowitz-hill-2015" in={RADIO_SOURCES}/>.
          </p>
          <p className="m-0 mb-lg">For Q — to reject the adjacent station at 1.010 MHz (10 kHz away), we want the tank's −3 dB bandwidth to be of order 10 kHz:</p>
          <Formula>Q = f<sub>0</sub> / Δf = 1 000 000 / 10 000 = <strong>100</strong></Formula>
          <p className="m-0 mb-lg">The equivalent parallel resistance (also called the dynamic resistance R<sub>D</sub>) is:</p>
          <Formula>R<sub>D</sub> = Q · ω<sub>0</sub> · L = 100 · 2π · 10⁶ · 68×10⁻⁶ ≈ <strong>42.7 kΩ</strong></Formula>
          <p className="m-0 mb-lg">
            Or equivalently R<sub>D</sub> = Q / (ω<sub>0</sub> C). Either
            way ≈ 43 kΩ. <strong>This is what the next stage must look
            into</strong> — load the tank with less than that and the Q
            drops, the selectivity gets sloppy, and adjacent stations
            start bleeding through. The Ch.13 maximum-power-transfer
            theorem is at war with the Ch.12 selectivity goal here, and
            <em> selectivity wins</em> in a radio front-end. A
            high-impedance buffer (an emitter follower or a JFET
            source follower) is the standard fix<Cite id="sedra-smith-2014" in={RADIO_SOURCES}/>.
          </p>
        </>
      ),
    },
    {
      id: 'detector',
      title: 'Design the envelope-detector diode + RC',
      problem: (
        <>
          <p className="m-0 mb-lg">
            With the AM signal selected by the tank, the next job is to
            <strong> demodulate</strong> it — recover the audio s(t) that
            is "riding" on the 1 MHz carrier as the envelope of v(t).
            The classic envelope detector is a single diode followed by
            a parallel RC load.
          </p>
          <p className="m-0 mb-lg">
            Pick a small-signal Schottky (V<sub>F</sub> ≈ 0.3 V at
            10 µA), and choose R and C so that:
          </p>
          <ul className="my-md mb-lg pl-xl">
            <li className="my-sm">The RC time constant is long compared to 1/f<sub>c</sub> (so the cap holds between carrier peaks).</li>
            <li className="my-sm">The RC time constant is short compared to 1/f<sub>audio,max</sub> = 1/5 kHz = 200 µs (so the cap can follow the audio envelope down).</li>
          </ul>
          <p className="m-0 mb-lg">
            Both constraints must hold simultaneously. Pick R = 10 kΩ
            and find C in the range that works. Then compute the time
            constant.
          </p>
        </>
      ),
      hint: 'τ_carrier = 1/f_c = 1 µs. Need τ_RC ≫ 1 µs and ≪ 200 µs. Geometric mean is around 14 µs.',
      solution: (
        <>
          <p className="m-0 mb-lg">Lower bound on τ<sub>RC</sub> (must be ≫ 1 µs, say ≥ 10 µs):</p>
          <Formula>C ≥ 10 µs / 10 kΩ = <strong>1.0 nF</strong></Formula>
          <p className="m-0 mb-lg">Upper bound (must be ≪ 200 µs, say ≤ 50 µs):</p>
          <Formula>C ≤ 50 µs / 10 kΩ = <strong>5.0 nF</strong></Formula>
          <p className="m-0 mb-lg">Pick C = <strong>3.3 nF</strong> as a stocking value in the middle:</p>
          <Formula>τ<sub>RC</sub> = R · C = 10 000 · 3.3×10⁻⁹ = <strong>33 µs</strong></Formula>
          <p className="m-0 mb-lg">That's 33× longer than the carrier period (1 µs, fine — the cap holds) and 6× shorter than the highest audio period (200 µs, fine — the cap discharges fast enough that the envelope doesn't get clipped on a fast downward swing).</p>
          <p className="m-0 mb-lg">
            With V<sub>F</sub> = 0.3 V on the diode, a 1 mV antenna
            signal won't even turn the diode on — there is a strong
            non-linear regime where small-signal AM detection is very
            inefficient. That is why all practical AM receivers put a
            high-gain RF amplifier <em>between</em> the tank and the
            detector — a JFET or BJT in common-source/common-emitter
            tuned to 1 MHz, with maybe 30–40 dB of gain, so the
            detector sees ~100 mV rather than 1 mV<Cite id="horowitz-hill-2015" in={RADIO_SOURCES}/>.
            We'll assume that amp lives between the tank and the
            detector and is itself a Ch.14 design (a single-stage
            common-emitter amplifier biased at 1 mA, R<sub>C</sub> = 4.7 kΩ,
            voltage gain g<sub>m</sub>R<sub>C</sub> ≈ 180).
          </p>
        </>
      ),
    },
    {
      id: 'audio-stage',
      title: 'Design the op-amp audio gain stage',
      problem: (
        <>
          <p className="m-0 mb-lg">
            After the envelope detector, you have a recovered audio
            signal of perhaps 50 mV<sub>pp</sub> on a DC pedestal.
            A speaker wants a couple of volts. Design a single op-amp
            non-inverting gain stage with:
          </p>
          <ul className="my-md mb-lg pl-xl">
            <li className="my-sm">Voltage gain ≈ 40 (32 dB).</li>
            <li className="my-sm">AC coupling on the input to block the DC pedestal.</li>
            <li className="my-sm">Audio bandwidth from 100 Hz to 5 kHz.</li>
          </ul>
          <p className="m-0 mb-lg">
            Use a generic op-amp (TL072, NE5532 — gain-bandwidth product
            ~10 MHz). Pick R<sub>f</sub>, R<sub>g</sub>, the input
            coupling cap, and an output low-pass to roll off above
            the audio band.
          </p>
        </>
      ),
      hint: 'Non-inverting gain = 1 + R_f/R_g. AC coupling τ = R_in · C_in sets the low-frequency corner.',
      solution: (
        <>
          <p className="m-0 mb-lg">Gain = 40 → R<sub>f</sub>/R<sub>g</sub> = 39. Pick standard values:</p>
          <Formula>R<sub>f</sub> = 39 kΩ, R<sub>g</sub> = 1 kΩ → Gain = 1 + 39 = <strong>40</strong></Formula>
          <p className="m-0 mb-lg">Input coupling cap to set the 100 Hz lower corner with the op-amp's input bias resistor R<sub>in</sub> = 100 kΩ (to ground; the standard way to bias a non-inverting op-amp's positive input):</p>
          <Formula>C<sub>in</sub> = 1 / (2π · f · R<sub>in</sub>) = 1 / (2π · 100 · 100 000) ≈ <strong>16 nF</strong></Formula>
          <p className="m-0 mb-lg">Round to <strong>22 nF</strong> for ~70 Hz corner, well below the speech range.</p>
          <p className="m-0 mb-lg">Output low-pass to roll off above 5 kHz, using a series R<sub>o</sub> = 1 kΩ and shunt C<sub>o</sub>:</p>
          <Formula>C<sub>o</sub> = 1 / (2π · 5000 · 1000) ≈ <strong>32 nF</strong> → round to 33 nF</Formula>
          <p className="m-0 mb-lg">Check the gain stays flat across the audio band. The closed-loop bandwidth of the gain-of-40 stage with a 10 MHz GBW op-amp:</p>
          <Formula>BW = GBW / Gain = 10⁷ / 40 = <strong>250 kHz</strong></Formula>
          <p className="m-0 mb-lg">Way beyond the audio band; the output LP filter, not the op-amp, sets the upper corner. The whole stage looks like:</p>
          <ul className="my-md mb-lg pl-xl">
            <li className="my-sm"><strong>Input</strong>: 22 nF AC coupling → 100 kΩ to ground → op-amp + input.</li>
            <li className="my-sm"><strong>Feedback</strong>: 1 kΩ from − input to ground; 39 kΩ from − input to output.</li>
            <li className="my-sm"><strong>Output</strong>: 1 kΩ in series, 33 nF to ground.</li>
          </ul>
          <p className="m-0 mb-lg">
            This is the canonical Ch.16 inverting-op-amp design (in its
            non-inverting variant): one ratio sets the gain, two RC
            networks set the band, and the op-amp's open-loop response
            does the rest behind the curtain<Cite id="horowitz-hill-2015" in={RADIO_SOURCES}/>.
          </p>
        </>
      ),
    },
    {
      id: 'speaker-driver',
      title: 'Drive a 4 Ω speaker',
      problem: (
        <>
          <p className="m-0 mb-lg">
            The op-amp output can drive perhaps 10 mA into a load. A 4 Ω
            speaker driven to 1 V<sub>rms</sub> needs 250 mA<sub>rms</sub>
            — 25× more current than the op-amp can produce alone. Design
            a class-AB push-pull stage to buffer the op-amp's output
            into the speaker.
          </p>
          <p className="m-0 mb-lg">
            Use a complementary NPN/PNP pair (BD139/BD140 or similar,
            β ≈ 100, V<sub>BE</sub> ≈ 0.6 V). Bias them with two diode
            drops across the bases so each transistor sits just at the
            edge of conduction at quiescent (eliminates the crossover
            notch). Place the entire push-pull <em>inside</em> the
            op-amp's feedback loop — the trick that turns Ch.16's
            "ideal" op-amp into a real audio amplifier.
          </p>
        </>
      ),
      hint: 'Two series diodes from the +rail rail through the bias resistor set 1.2 V across the two bases — exactly two V_BE drops. Put the speaker between the emitters and ground (with a DC blocking cap to prevent DC bias on the voice coil).',
      solution: (
        <>
          <p className="m-0 mb-lg">Schematic outline:</p>
          <ul className="my-md mb-lg pl-xl">
            <li className="my-sm">From the op-amp's output, drive a small <strong>bias network</strong>: a 470 Ω resistor from +V to a node A, then two 1N4148 diodes from A to a node B, then a 470 Ω from B to −V. The op-amp's signal is injected into the centre via two small (220 Ω) resistors from output to A and B respectively.</li>
            <li className="my-sm">Node A → base of NPN; Node B → base of PNP.</li>
            <li className="my-sm">NPN emitter and PNP emitter join → 220 µF series cap → speaker → ground.</li>
            <li className="my-sm">Most importantly: the speaker side of the cap is tied back to the op-amp's <strong>− input</strong> through the feedback network. The op-amp closes the loop around the whole push-pull. Output offset, crossover non-linearity, and current-gain mismatch all get suppressed by the loop gain<Cite id="sedra-smith-2014" in={RADIO_SOURCES}/>.</li>
          </ul>
          <p className="m-0 mb-lg">Current capability of the BD139/BD140 in this topology:</p>
          <Formula>I<sub>load,peak</sub> = (V<sub>cc</sub> − V<sub>CE,sat</sub> − I·R<sub>E</sub>) / R<sub>speaker</sub></Formula>
          <p className="m-0 mb-lg">With V<sub>cc</sub> = 9 V (typical battery-powered AM radio), V<sub>CE,sat</sub> ≈ 0.5 V, and a small 0.22 Ω emitter degeneration resistor:</p>
          <Formula>I<sub>load,peak</sub> ≈ (9 − 0.5)/(4 + 0.22) ≈ <strong>2 A</strong></Formula>
          <p className="m-0 mb-lg">(More than enough for a 0.5 W output at 4 Ω.)</p>
          <p className="m-0 mb-lg">Power dissipation in each transistor at maximum sine-wave drive:</p>
          <Formula>P<sub>diss</sub> = V<sub>cc</sub>² / (π² · R<sub>load</sub>) − P<sub>out</sub>/2</Formula>
          <p className="m-0 mb-lg">For V<sub>cc</sub> = 9 V into 4 Ω at full sine drive: P<sub>diss</sub> ≈ 9²/(π²·4) − 0.5 ≈ 1.55 W per transistor — well within the BD139's 12.5 W rating with a small clip-on heat sink<Cite id="horowitz-hill-2015" in={RADIO_SOURCES}/>.</p>
        </>
      ),
    },
    {
      id: 'overall',
      title: 'Sketch the full signal path',
      problem: (
        <>
          <p className="m-0 mb-lg">
            Walk the signal from the ferrite-rod antenna to the speaker
            cone, naming each block, the impedance level at each node,
            and the power gain stage-by-stage. Compute the total power
            gain in dB.
          </p>
        </>
      ),
      hint: 'Voltage gain × current gain = power gain. Compute V_in² / R_source and V_out² / R_load to get power values.',
      solution: (
        <>
          <p className="m-0 mb-lg">Block-by-block, with impedance and amplitude:</p>
          <ol className="my-md mb-lg pl-xl">
            <li className="my-sm"><strong>Ferrite-rod antenna + tank</strong>: induced EMF 1 mV at 1 MHz, source impedance ~43 kΩ at resonance (the tank's R<sub>D</sub>).</li>
            <li className="my-sm"><strong>JFET buffer (gain ≈ 1)</strong>: matches the tank's high impedance to the next stage without loading it.</li>
            <li className="my-sm"><strong>RF amplifier (BJT, gain ≈ 180)</strong>: takes 1 mV up to ~180 mV at 1 MHz.</li>
            <li className="my-sm"><strong>Envelope detector (Schottky + 10 kΩ‖3.3 nF)</strong>: 180 mV RF → ~80 mV audio (lossy: ~7 dB attenuation in the diode).</li>
            <li className="my-sm"><strong>Op-amp audio amp (gain 40)</strong>: 80 mV → 3.2 V at the op-amp output.</li>
            <li className="my-sm"><strong>Class-AB push-pull buffer (gain ≈ 1)</strong>: drives the speaker at ~1 V<sub>rms</sub> with ~250 mA — about 0.25 W into 4 Ω.</li>
          </ol>
          <p className="m-0 mb-lg">Power gain:</p>
          <Formula>P<sub>in</sub> = (1 mV)² / 50 Ω ≈ 2×10⁻¹¹ W = 20 pW</Formula>
          <Formula>P<sub>out</sub> = (1 V)² / 4 Ω = 0.25 W</Formula>
          <Formula>Gain = 10 log<sub>10</sub>(0.25 / 2×10⁻¹¹) ≈ <strong>101 dB</strong></Formula>
          <p className="m-0 mb-lg">
            One hundred decibels of total power gain in five stages.
            And every one of those stages is something the textbook
            covered: the tank (Ch.12 resonance), the buffer and RF amp
            (Ch.14 transistors + Ch.13 biasing), the detector (Ch.14
            diode equation + Ch.15 envelope demodulation), the audio
            stage (Ch.16 op-amp feedback), and the power stage (Ch.16
            class-AB). The entire device is sixteen chapters of
            textbook compressed into one perfboard<Cite id="horowitz-hill-2015" in={RADIO_SOURCES}/>.
          </p>
        </>
      ),
    },
  ],
  stretch: {
    title: 'Add a superheterodyne front end with a 455 kHz IF stage',
    problem: (
      <>
        <p className="m-0 mb-lg">
          The receiver above is a <strong>tuned radio frequency (TRF)</strong>{' '}
          design — the tank is tuned to the carrier directly, and every
          stage that follows works at 1 MHz. That has two big problems:
          (a) selectivity is set entirely by one tank's Q, so adjacent
          channels bleed through, and (b) the RF amp's bandwidth and
          stability are hard to control at 1 MHz.
        </p>
        <p className="m-0 mb-lg">
          The fix is the <strong>superheterodyne</strong> architecture
          (Armstrong 1918): mix the incoming RF with a local oscillator
          to translate every received station to a fixed
          <strong> intermediate frequency (IF)</strong>, then do the
          heavy filtering and amplifying at the IF where you can use
          a tightly-tuned ceramic filter.
        </p>
        <p className="m-0 mb-lg">
          Design the front-end:
        </p>
        <ol className="my-md mb-lg pl-xl">
          <li className="my-sm">Pick the IF (standard: 455 kHz for AM broadcast).</li>
          <li className="my-sm">Compute the local-oscillator (LO) frequency needed to receive 1 MHz.</li>
          <li className="my-sm">Identify the <strong>image frequency</strong> — a second band that the mixer also folds onto the IF — and decide how to reject it.</li>
          <li className="my-sm">Specify the IF strip: a ceramic 455 kHz filter with 6 kHz bandwidth, followed by two cascaded gain stages.</li>
        </ol>
      </>
    ),
    solution: (
      <>
        <p className="m-0 mb-lg">
          <strong>(1) IF = 455 kHz</strong>. This frequency has been the
          industry-standard AM IF since the 1930s. It is low enough for
          cheap inductors and ceramic filters, high enough that the
          image frequency falls outside the AM broadcast band when the
          LO is on the high side.
        </p>
        <p className="m-0 mb-lg">
          <strong>(2) Local oscillator</strong>. The mixer produces sum
          and difference frequencies. For a high-side LO:
        </p>
        <Formula>f<sub>LO</sub> = f<sub>RF</sub> + f<sub>IF</sub> = 1.000 + 0.455 = <strong>1.455 MHz</strong></Formula>
        <p className="m-0 mb-lg">
          The mixer's output contains f<sub>LO</sub> ± f<sub>RF</sub> =
          0.455 MHz and 2.455 MHz; the IF filter passes the lower
          term and rejects the upper. To tune across the AM band
          (530–1700 kHz), the LO tunes 985–2155 kHz; one variable
          capacitor section does it.
        </p>
        <p className="m-0 mb-lg">
          <strong>(3) Image frequency</strong>. Any signal at{' '}
          <InlineMath>f<sub>image</sub> = f<sub>LO</sub> + f<sub>IF</sub> = 1.910 MHz</InlineMath>{' '}
          also mixes down to 455 kHz and will be received <em>simultaneously</em>
          {' '}with the desired 1 MHz station — a hard failure mode. With
          AM broadcast running 530–1700 kHz, an image at 1.910 MHz is
          outside the band and is rejected by the antenna's preselector
          tank (the 69.4 µH/365 pF tank from step 2, retuned by the
          ganged variable cap to track the LO). The preselector doesn't
          need to be sharp — it only needs to attenuate signals 2 × f<sub>IF</sub>
          = 910 kHz away from the desired station, which a Q-of-100 tank
          easily does (3 dB BW = 10 kHz; 910 kHz away is 91 bandwidths
          = ~−39 dB)<Cite id="pozar-2011" in={RADIO_SOURCES}/>.
        </p>
        <p className="m-0 mb-lg">
          <strong>(4) IF strip</strong>. The signal at 455 kHz now sits
          on a fixed frequency regardless of which station was selected.
          The bulk of the receiver's selectivity comes from a
          <strong> ceramic resonator filter</strong> (Murata CFW455 or
          similar) with a 6 kHz −3 dB bandwidth — perfect for the 10 kHz
          AM channel spacing. After the filter, two cascaded common-emitter
          stages at 455 kHz add another ~60 dB of voltage gain. The
          output of the IF strip feeds the same envelope detector + audio
          chain from the TRF design.
        </p>
        <p className="m-0 mb-lg">
          Architectural payoff:
        </p>
        <ul className="my-md mb-lg pl-xl">
          <li className="my-sm"><strong>Constant-frequency amplification</strong>: all the gain happens at one fixed frequency where the bias networks and stability margins can be optimised once.</li>
          <li className="my-sm"><strong>Sharp adjacent-channel rejection</strong>: a 6 kHz ceramic filter is impossible to build directly at 1 MHz with a single LC tank but trivial at 455 kHz with off-the-shelf parts.</li>
          <li className="my-sm"><strong>Single tuning knob</strong>: a ganged variable capacitor tunes the preselector and LO together, keeping their separation at exactly the IF — the entire AM band is covered without ever changing the IF strip's tuning<Cite id="horowitz-hill-2015" in={RADIO_SOURCES}/>.</li>
        </ul>
        <p className="m-0 mb-lg">
          The cost is one extra active stage (the mixer) plus the LO,
          but every commercial AM radio since the 1930s has been a
          superhet because the selectivity gain is enormous. Modern
          software-defined radios use exactly the same logical
          architecture, except the mixer is digital and the IF is at
          baseband (DC), so the "filtering at fixed IF" becomes
          numerical FIR filtering — but the geometry is identical to
          what Armstrong patented a century ago<Cite id="pozar-2011" in={RADIO_SOURCES}/>.
        </p>
      </>
    ),
  },
};

/* ─────────────────────────────────────────────────────────────────── */

export const CAPSTONES: Capstone[] = [
  CAPSTONE_USBC,
  CAPSTONE_TRACE,
  CAPSTONE_RADIO,
];

export function getCapstone(id: string): Capstone | undefined {
  return CAPSTONES.find(c => c.id === id);
}
