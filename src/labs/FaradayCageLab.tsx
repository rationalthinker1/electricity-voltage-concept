/**
 * Lab E1.2 — The Aluminum-Foil Faraday Cage.
 *
 * A hands-on experimental lab. The student wraps their phone in increasingly
 * complete layers of aluminum foil and measures cellular RSRP and WiFi RSSI
 * (in dBm) through each configuration. Tabulates attenuation in dB,
 * discusses why sealing the seams matters more than adding a second layer,
 * and connects it to the Ch.1 claim that the field inside a conductor is
 * zero.
 *
 * Pure physical lab — no simulator. Software is just the signal-strength
 * meter that ships on every modern phone.
 */

import { Formula, M } from '@/components/Formula';
import { LabShell } from '@/components/LabShell';
import { Pullout } from '@/components/Prose';
import { Cite } from '@/components/SourcesList';
import { DataTable, Procedure, Prompt, Section, Step, Stretch } from '@/components/ExperimentalLab';
import { BASE_LAB_SOURCES } from '@/labs/data/manifest';

const SLUG = 'faraday-cage';
const SOURCES = BASE_LAB_SOURCES[SLUG]!;

export default function FaradayCageLab() {
  const labContent = (
    <>
      <Section tag="00" title="Safety and setup">
        <p className="mb-prose-2">
          Do not put a phone (or anything else) inside a powered microwave oven. The microwave-oven
          step in §06 is run with the oven{' '}
          <strong className="text-text font-medium">unplugged</strong> — we use the metal mesh of
          its door as a Faraday cage, nothing more. If you wrap a phone in foil while it is on a
          charging cable, unplug the cable first; do not let the foil contact the USB port.
        </p>
      </Section>

      <Section tag="01" title="Install a signal-strength tool">
        <p className="mb-prose-2">
          You need a way to read your phone's <em className="text-text italic">cellular</em> signal
          in dBm (decibel-milliwatts), not the bars. Bars are a marketing graphic; dBm is a
          measurement.
        </p>
        <Procedure>
          <Step>
            <strong className="text-text font-medium">Android.</strong> Install{' '}
            <em className="text-text italic">Network Cell Info Lite</em> from the Play Store. Open
            it, give it location permission, and find the value labelled{' '}
            <strong className="text-text font-medium">RSRP</strong> (for LTE / 5G) on the main
            screen. It reads in dBm — typically between −60 (excellent) and −120 (near no service).
          </Step>
          <Step>
            <strong className="text-text font-medium">iPhone.</strong> Dial{' '}
            <code className="font-3 text-3 text-text">*3001#12345#*</code> and tap call. This opens
            <em className="text-text italic"> Field Test Mode</em>. Navigate to LTE → Serving Cell
            Meas → look for <strong className="text-text font-medium">rsrp0</strong>. Same units,
            same range.
          </Step>
        </Procedure>
        <p className="mb-prose-2">
          For WiFi, both phones (or any laptop) can read RSSI with a free WiFi-analyzer app, or with
          the built-in network diagnostics in macOS / Windows.
        </p>
      </Section>

      <Section tag="02" title="Baseline (control)">
        <p className="mb-prose-2">
          Stand in <em className="text-text italic">one fixed spot</em> for the entire experiment.
          Position matters more than you think — moving 1 m can shift RSRP by 6–10 dB. Tape a small
          floor marker if it helps.
        </p>
        <p className="mb-prose-2">
          Take five RSRP readings, 10 seconds apart, with the phone unwrapped, held in roughly the
          same orientation. Average them. Do the same for WiFi RSSI. These are your control values.
        </p>
        <DataTable
          headers={[<>Reading</>, <>Cellular RSRP (dBm)</>, <>WiFi RSSI (dBm)</>]}
          rows={[
            ['1', '−87', '−52'],
            ['2', '__', '__'],
            ['3', '__', '__'],
            ['4', '__', '__'],
            ['5', '__', '__'],
            [
              <strong key="mean" className="text-text font-medium">
                Mean
              </strong>,
              '__',
              '__',
            ],
          ]}
          caption={
            <>
              Pre-filled row is a worked example from one author's apartment — your numbers will
              differ. Anything in the −70 to −100 dBm range for cellular is typical indoors.
            </>
          }
        />
      </Section>

      <Section tag="03" title="Condition A — single layer, loose">
        <p className="mb-prose-2">
          Tear off a square of foil big enough to fully cover the phone with ~5 cm of overhang on
          every side. Wrap loosely — leave the seams open, don't crimp them. Hold the foil-wrapped
          phone in the same spot, take five readings, average.
        </p>
      </Section>

      <Section tag="04" title="Condition B — single layer, sealed">
        <p className="mb-prose-2">
          Same foil square, now sealed: fold and crimp every seam so there are no visible gaps. Use
          tape if you need to. Five readings, average.
        </p>
      </Section>

      <Section tag="05" title="Condition C — double layer, sealed">
        <p className="mb-prose-2">
          Add a second sealed foil layer over the first. Crimp the second layer's seams
          perpendicular to the first layer's seams (this matters — same orientation leaves the same
          gap line). Five readings, average.
        </p>
      </Section>

      <Section tag="06" title="Condition D — microwave oven door (optional, no power)">
        <p className="mb-prose-2">
          <strong className="text-text font-medium">Unplug the microwave first.</strong> Place the
          phone inside, close the door, take readings through the door's metal mesh — which is a
          professionally-engineered Faraday cage. The mesh holes are about 1 mm across; the
          wavelength of LTE band 1 (~2 GHz) is about 15 cm; the wavelength of WiFi 5 GHz is about 6
          cm. Both are far larger than the holes, so the mesh acts as a continuous conductor for
          those frequencies <Cite id="itu-r-p2040" in={SOURCES} />.
        </p>
      </Section>

      <Section tag="07" title="Tabulate the results">
        <p className="mb-prose-2">
          Convert each condition into an <em className="text-text italic">attenuation</em> by
          subtracting from the baseline:
        </p>
        <Formula tex="A_\text{dB} = \text{RSRP}_\text{baseline} - \text{RSRP}_\text{condition}" />
        <p className="mb-prose-2">
          (RSRP is negative; a smaller (more negative) RSRP under foil means a larger positive
          attenuation. If A comes out negative, you actually got more signal under foil — which
          happens occasionally due to multipath; mention it in your discussion.)
        </p>
        <DataTable
          headers={[
            <>Condition</>,
            <>Mean RSRP (dBm)</>,
            <>A (dB) — cellular</>,
            <>Mean WiFi (dBm)</>,
            <>A (dB) — WiFi</>,
          ]}
          rows={[
            ['Baseline', '−87.0', '0', '−52.0', '0'],
            ['A · single loose', '−93.5', '6.5', '−65.0', '13.0'],
            ['B · single sealed', '__', '__', '__', '__'],
            ['C · double sealed', '__', '__', '__', '__'],
            ['D · microwave door', '__', '__', '__', '__'],
          ]}
          caption={
            <>
              The first two rows are pre-filled as worked examples from one trial. Your A and B
              numbers should land in a similar ballpark; if condition B gives less attenuation than
              condition A, your "sealed" wrap probably isn't.
            </>
          }
        />
      </Section>

      <Section tag="08" title="Analysis">
        <Prompt label="Q1">
          By how many dB did sealing the seams (B vs A) improve attenuation? By how many dB did
          adding a second layer (C vs B) improve it? Which step gave more improvement, and explain
          why in one sentence using the words "skin depth" or "induced current" or "continuous
          surface."
        </Prompt>
        <Prompt label="Q2">
          Cellular at ~2 GHz and WiFi at 2.4 GHz (or 5 GHz) have wavelengths of order 15 cm and 6 cm
          respectively. The "holes" in a sealed foil wrap are sub-millimetre. Why does this mean the
          wrap looks like a solid conductor at these frequencies? Look up "diffraction limit" or
          "Faraday cage hole size rule" to ground your answer.
        </Prompt>
        <Prompt label="Q3">
          Inside a perfect conductor, the static electric field is exactly zero. (This is the
          content of <M tex="\nabla \cdot \mathbf{E} = \rho/\varepsilon_0" /> applied to a
          conducting interior, plus the fact that any non-zero field would drive currents until it
          went away.) The radio fields in your experiment are{' '}
          <em className="text-text italic">not</em> static — they oscillate at 2 GHz. Why does the
          conductor argument still apply, at least approximately, at these frequencies? Hint: how
          fast can the free electrons in aluminum respond?
        </Prompt>
        <Prompt label="Q4">
          ITU-R P.2040 lists a typical attenuation for 100 µm aluminum sheet at 2 GHz of well over
          60 dB <Cite id="itu-r-p2040" in={SOURCES} />. Your foil is roughly 16 µm thick, but your
          measured attenuation is much less than 60 dB. Identify the dominant{' '}
          <em className="text-text italic">non-foil</em> path the signal is taking to your phone.
        </Prompt>
      </Section>

      <Section tag="09" title="The chapter connection">
        <p className="mb-prose-2">
          The Faraday cage is the most concrete demonstration of two ideas the chapter spent five
          pages on:
        </p>
        <Pullout>
          A conductor enforces zero field in its interior by redistributing its free charges. There
          is no special "shielding material"; the electrons do it themselves, every time, faster
          than the field can change.
        </Pullout>
        <p className="mb-prose-2">
          You measured this. Foil is ~16 µm of aluminum. Its free-electron density{' '}
          <M tex="n \approx 1.8\times10^{29}\ \text{m}^{-3}" /> is so high that any incident field
          is cancelled by induced surface charges within roughly a skin depth (~2 µm at 2 GHz, well
          under the foil thickness). The interior of your foil wrap is, to excellent approximation,
          an EM-free volume. Your phone "loses signal" not because the tower stopped transmitting
          but because the field that used to reach the antenna is now terminating on aluminum
          <Cite id="griffiths-2017" in={SOURCES} />.
        </p>
      </Section>

      <Section tag="10" title="Writeup">
        <p className="mb-prose-2">Submit a one-page writeup containing:</p>
        <ul className="text-6 text-text-dim ml-md space-y-1 leading-3">
          <li>— Both completed data tables.</li>
          <li>— A bar chart of A (dB) for cellular and WiFi across conditions A–D.</li>
          <li>— Your written answers to Q1–Q4.</li>
          <li>
            — A one-paragraph reflection: was there a condition where you saw the signal{' '}
            <em className="italic">improve</em> under foil? If so, hypothesise why.
          </li>
        </ul>
      </Section>

      <Stretch title="Going further">
        <p className="mb-prose-2">
          The body of your microwave oven is solid metal, but the door has a transparent window with
          a perforated metal screen behind it. Hold the phone at varying distances{' '}
          <em className="text-text italic">behind</em> the closed (unpowered) door and map RSRP as a
          function of distance from the screen. You should see attenuation drop sharply as the phone
          moves away from the screen — the field doesn't penetrate the perforated metal, but it does
          enter through the gap around the door seal, so distance from the seal matters more than
          distance from the centre. Sketch this.
        </p>
      </Stretch>
    </>
  );

  const prose = (
    <>
      <h3 className="lab-section-h3">What this lab is actually demonstrating</h3>
      <p className="mb-prose-3">
        The chapter argument was that a conductor cannot sustain a non-zero static electric field in
        its interior: any field would push the free electrons until they piled up at the surface in
        just the right pattern to cancel it
        <Cite id="griffiths-2017" in={SOURCES} />. Faraday gave the most dramatic version of this
        demonstration in 1836 by sitting inside a 12-foot conducting cage at the Royal Institution
        while assistants showered the outside with sparks from a 14-inch electrostatic generator —
        none of which penetrated to him. He saw nothing, felt nothing, and an electroscope at his
        feet did not flicker
        <Cite id="faraday-1832" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        Your foil wrap is the same experiment, scaled to a sandwich bag. The fact that it{' '}
        <em className="text-text italic">also</em> blocks 2 GHz radio is the bonus discovery that
        the same physics — free charges in a conductor cancelling internal fields — extends from DC
        all the way through the microwave band, because the electrons in aluminum can redistribute
        themselves faster than the radio wave can change.
      </p>

      <h3 className="lab-section-h3">Why bars are a lie and dBm is the truth</h3>
      <p className="mb-prose-3">
        Cellular "bars" are an OEM-defined visualisation with no industry-standard mapping to actual
        signal strength. Two phones in the same spot can read different bars. dBm is the raw
        physics: the received power referenced to one milliwatt, on a log scale. A 6 dB drop is a
        factor-of-four reduction in delivered power; a 10 dB drop is a factor of ten. The
        attenuation values you collect in §07 are interpretable in absolute terms and can be
        compared against published shielding-effectiveness data for aluminum foil and other
        materials
        <Cite id="itu-r-p2040" in={SOURCES} />.
      </p>

      <h3 className="lab-section-h3">The seam rule (why sealing matters)</h3>
      <p className="mb-prose-3">
        A conductor with a hole in it leaks fields through that hole proportional to a power of the
        hole size relative to wavelength. The often-quoted rule is that holes much smaller than
        about <M tex="\lambda/20" /> behave as if they weren't there. At 2 GHz, λ is 15 cm, so
        anything under 7.5 mm is "fine." The seams in a sloppy foil wrap can be several millimetres
        wide; the seams in a sealed wrap are sub-millimetre. That's why Condition B usually gives a
        much larger A than Condition A — and why doubling the layer (C vs B) gives only a small
        additional improvement: you already had a continuous conductor; the second layer doesn't add
        much except by improving the seams further
        <Cite id="feynman-II-2" in={SOURCES} />.
      </p>

      <h3 className="lab-section-h3">Open-source cross-reference</h3>
      <p>
        For a worked treatment of conductors and shielding in the language of Gauss's law (rather
        than free-electron mobility), see the OpenStax University Physics chapter on conductors in
        electrostatic equilibrium
        <Cite id="libretexts-univ-physics" in={SOURCES} />. The same content lives in Griffiths §2.5
        and Feynman Vol. II §2-4
        <Cite id="griffiths-2017" in={SOURCES} />
        <Cite id="feynman-II-2" in={SOURCES} />.
      </p>
    </>
  );

  return (
    <LabShell
      slug={SLUG}
      labSubtitle="Procedure"
      labId="E1.2"
      labContent={labContent}
      prose={prose}
    />
  );
}
