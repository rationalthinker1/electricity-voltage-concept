/**
 * Lab E3.1 — Ohm's Law, Resistance, and Power in a Virtual Circuit (Falstad).
 *
 * A software-based experimental lab. The student builds four DC circuits in
 * Paul Falstad's free browser simulator and records voltage, current, and
 * power readings from the live probes.
 *
 *   (A) Single resistor — verify V = IR by sweeping source voltage
 *   (B) Series pair — verify the voltage-divider rule
 *   (C) Parallel pair — verify the current-divider rule
 *   (D) Power dissipation — verify P = VI = I²R with a heating resistor
 *
 * All four experiments connect directly to the Chapter 3 themes: Ohm's law,
 * geometric resistance, series/parallel combinations, and Joule heating.
 */

import { M } from '@/components/Formula';
import { LabShell } from '@/components/LabShell';
import { Pullout } from '@/components/Prose';
import { Cite } from '@/components/SourcesList';
import { DataTable, Procedure, Prompt, Section, Step, Stretch } from '@/components/ExperimentalLab';
import { BASE_LAB_SOURCES } from '@/labs/data/manifest';

const SLUG = 'falstad-ohms-law';
const SOURCES = BASE_LAB_SOURCES[SLUG]!;

export default function FalstadOhmsLawLab() {
  const labContent = (
    <>
      <Section tag="01" title="Open the simulator">
        <p className="mb-prose-2">
          Open{' '}
          <a
            href="https://www.falstad.com/circuit/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline decoration-dotted underline-offset-4"
          >
            Falstad Circuit Simulator
          </a>{' '}
          in a new tab. The page opens with a default RLC circuit — delete everything (Ctrl+A then
          Delete) so you start with a blank canvas.
        </p>
        <Procedure>
          <Step>
            <strong className="text-text font-medium">Place a resistor.</strong> Choose{' '}
            <em className="italic">Draw → Resistor</em> and click twice on the canvas to set its
            endpoints. Right-click the resistor and set its value to{' '}
            <strong className="text-text font-medium">100 Ω</strong>.
          </Step>
          <Step>
            <strong className="text-text font-medium">Place a battery.</strong> Choose{' '}
            <em className="italic">Draw → Voltage Source (2-terminal)</em> and click to place it in
            series with the resistor. Right-click the source and set it to{' '}
            <strong className="text-text font-medium">10 V</strong>.
          </Step>
          <Step>
            <strong className="text-text font-medium">Ground the circuit.</strong> Choose{' '}
            <em className="italic">Draw → Ground</em> and connect it to the negative terminal of the
            battery.
          </Step>
          <Step>
            <strong className="text-text font-medium">Run the sim.</strong> Press the spacebar (or
            click <em className="italic">Run/Stop</em>). A small current arrow should appear.
          </Step>
        </Procedure>
        <p className="mb-prose-2">
          Hover over any wire to read its voltage relative to ground; hover over any component to
          read the current through it. These are your probes — no separate meter needed.
        </p>
      </Section>

      <Section tag="02" title="Experiment A — verify Ohm's law">
        <p className="mb-prose-2">
          Keep the 100 Ω resistor fixed. Sweep the battery voltage through{' '}
          <strong className="text-text font-medium">2, 4, 6, 8, 10 V</strong>. At each step, hover
          over the resistor and record the current shown. Then compute <M tex="V/I" /> and compare
          it to the resistor value.
        </p>

        <DataTable
          headers={[<>V (V)</>, <>I (mA)</>, <>V/I (Ω)</>, <>% diff from 100 Ω</>]}
          rows={[
            ['2.0', '20.0', '100', '0'],
            ['4.0', '__', '__', '__'],
            ['6.0', '__', '__', '__'],
            ['8.0', '__', '__', '__'],
            ['10.0', '__', '__', '__'],
          ]}
          caption={
            <>
              First row is a worked example: 2 V across 100 Ω gives 20 mA by Ohm's law. Falstad will
              report the same value to three significant figures.
            </>
          }
        />

        <Prompt label="A1">
          Plot <M tex="I" /> (vertical, in mA) vs <M tex="V" /> (horizontal, in V). Draw the
          best-fit straight line. What is its slope, and what physical quantity does the slope
          represent?
        </Prompt>
        <Prompt label="A2">
          Ohm's law claims <M tex="V = IR" />, which rearranges to <M tex="I = (1/R) V" />. The
          slope of your graph should therefore be <M tex="1/R" />. Compute <M tex="1/R" /> from the
          nominal resistor value and compare it to your fitted slope. Report percent difference.
        </Prompt>
      </Section>

      <Section tag="03" title="Experiment B — resistors in series">
        <p className="mb-prose-2">
          Clear the canvas. Build a series circuit:{' '}
          <strong className="text-text font-medium">12 V battery → 100 Ω → 200 Ω → ground</strong>.
          Run the sim, then hover over each resistor to read the current through it. Hover over the
          wire between the two resistors to read the voltage at that node (call it <M tex="V_1" />,
          the voltage across the 100 Ω resistor).
        </p>

        <DataTable
          headers={[
            <>R₁ (Ω)</>,
            <>R₂ (Ω)</>,
            <>
              V<sub>total</sub> (V)
            </>,
            <>I (mA)</>,
            <>V₁ (V)</>,
            <>V₂ (V)</>,
            <>V₁ + V₂ (V)</>,
          ]}
          rows={[
            ['100', '200', '12', '40.0', '4.00', '8.00', '12.00'],
            ['150', '300', '12', '__', '__', '__', '__'],
            ['220', '470', '12', '__', '__', '__', '__'],
            ['100', '100', '12', '__', '__', '__', '__'],
          ]}
          caption={
            <>
              First row is a worked example. The total resistance is 300 Ω, so the current is 12 V /
              300 Ω = 40 mA. The voltage drops are <M tex="V_1 = IR_1 = 4.00" /> V and{' '}
              <M tex="V_2 = IR_2 = 8.00" /> V.
            </>
          }
        />

        <Prompt label="B1">
          For each row, compute the theoretical current{' '}
          <M tex="I = V_{\text{total}} / (R_1 + R_2)" /> and the theoretical voltage drops{' '}
          <M tex="V_1 = IR_1" /> and <M tex="V_2 = IR_2" />. How well do your Falstad readings
          agree?
        </Prompt>
        <Prompt label="B2">
          The voltage-divider rule says <M tex="V_1 / V_{\text{total}} = R_1 / (R_1 + R_2)" />. Use
          your first row to verify this ratio both from the resistor values and from the measured
          voltages. Does it hold?
        </Prompt>
      </Section>

      <Section tag="04" title="Experiment C — resistors in parallel">
        <p className="mb-prose-2">
          Clear the canvas. Build a parallel circuit: a{' '}
          <strong className="text-text font-medium">12 V battery</strong> connected across two
          resistors in parallel — <strong className="text-text font-medium">300 Ω</strong> and{' '}
          <strong className="text-text font-medium">600 Ω</strong> — then to ground. Hover over each
          resistor to read its branch current; hover over the battery lead to read the total
          current.
        </p>

        <DataTable
          headers={[
            <>
              R<sub>1</sub> (Ω)
            </>,
            <>
              R<sub>2</sub> (Ω)
            </>,
            <>
              V<sub>total</sub> (V)
            </>,
            <>I₁ (mA)</>,
            <>I₂ (mA)</>,
            <>
              I<sub>total</sub> (mA)
            </>,
            <>1/R₁ + 1/R₂ (mS)</>,
            <>
              R<sub>eq</sub> (Ω)
            </>,
          ]}
          rows={[
            ['300', '600', '12', '40.0', '20.0', '60.0', '5.00', '200'],
            ['200', '200', '12', '__', '__', '__', '__', '__'],
            ['100', '300', '12', '__', '__', '__', '__', '__'],
            ['470', '220', '12', '__', '__', '__', '__', '__'],
          ]}
          caption={
            <>
              First row is a worked example. Both branches see 12 V, so{' '}
              <M tex="I_1 = 12/300 = 40.0" /> mA and <M tex="I_2 = 12/600 = 20.0" /> mA. The total
              current is the sum, 60.0 mA. The equivalent resistance is{' '}
              <M tex="R_{\text{eq}} = (R_1 R_2)/(R_1 + R_2) = 200" /> Ω.
            </>
          }
        />

        <Prompt label="C1">
          For each row, verify that <M tex="I_{\text{total}} = I_1 + I_2" /> from your Falstad
          readings. Does Kirchhoff's current law hold at the junction?
        </Prompt>
        <Prompt label="C2">
          Compute <M tex="R_{\text{eq}} = V_{\text{total}} / I_{\text{total}}" />
          from your measured total current. Compare it to the theoretical{' '}
          <M tex="R_{\text{eq}} = 1/(1/R_1 + 1/R_2)" />. Report percent error.
        </Prompt>
      </Section>

      <Section tag="05" title="Experiment D — power and Joule heating">
        <p className="mb-prose-2">
          Clear the canvas. Build a single-resistor circuit with a{' '}
          <strong className="text-text font-medium">50 Ω</strong> resistor and a variable battery.
          Falstad shows power directly: hover over the resistor and look for the power readout (in
          watts). Record it, then verify the number yourself from <M tex="P = VI" /> and{' '}
          <M tex="P = I^2 R" />.
        </p>

        <DataTable
          headers={[
            <>V (V)</>,
            <>I (mA)</>,
            <>P = VI (W)</>,
            <>P = I²R (W)</>,
            <>P from Falstad (W)</>,
          ]}
          rows={[
            ['5.0', '100.0', '0.500', '0.500', '0.500'],
            ['8.0', '__', '__', '__', '__'],
            ['10.0', '__', '__', '__', '__'],
            ['12.0', '__', '__', '__', '__'],
          ]}
          caption={
            <>
              First row is a worked example. At 5 V across 50 Ω the current is 100 mA; power is{' '}
              <M tex="P = VI = 0.500" /> W, which equals{' '}
              <M tex="I^2 R = (0.100)^2 \times 50 = 0.500" /> W.
            </>
          }
        />

        <Prompt label="D1">
          When you double the voltage from 5 V to 10 V, by what factor does the power increase? Is
          it 2×, 4×, or something else? Explain using <M tex="P = V^2 / R" />.
        </Prompt>
        <Prompt label="D2">
          A typical 1/4-watt through-hole resistor would overheat and fail at the 12 V point in this
          table. Look up the colour-code power rating for a standard carbon-film resistor and state
          whether each row in your table is safe for that component.
        </Prompt>
      </Section>

      <Section tag="06" title="The bigger picture">
        <p className="mb-prose-2">
          You have just verified, with a simulator that computes the underlying differential
          equations in real time, the four operational rules that every electrical engineer carries
          in working memory: Ohm's law <M tex="V = IR" />, series addition{' '}
          <M tex="R_{\text{series}} = R_1 + R_2" />, parallel combination{' '}
          <M tex="1/R_{\text{parallel}} = 1/R_1 + 1/R_2" />, and Joule heating{' '}
          <M tex="P = I^2 R = V^2/R" />
          <Cite id="griffiths-2017" in={SOURCES} />
          <Cite id="joule-1841" in={SOURCES} />.
        </p>
        <Pullout>
          A simulator doesn't replace the physical world, but it does remove the multimeter-probe
          contact resistance, the breadboard parasitics, and the burned fingers. What remains is the
          algebra, verified to machine precision.
        </Pullout>
        <p className="mb-prose-2">
          The microscopic story behind these macroscopic rules is the same Drude collision picture
          from Chapter 2: electrons accelerate under the field, scatter into lattice vibrations, and
          the average drift is proportional to <M tex="E" />. Wrap that up over a wire of length{' '}
          <M tex="L" /> and cross-section <M tex="A" /> and you get <M tex="R = \rho L/A" />. Add
          resistances in series and you are effectively adding lengths; combine them in parallel and
          you are effectively adding cross-sections. The simulator knows none of this physics — it
          just solves Kirchhoff's laws node by node — but the result is identical
          <Cite id="drude-1900" in={SOURCES} />
          <Cite id="ashcroft-mermin-1976" in={SOURCES} />.
        </p>
      </Section>

      <Section tag="07" title="Writeup">
        <p className="mb-prose-2">Submit a one-page writeup containing:</p>
        <ul className="text-6 text-text-dim ml-md space-y-1 leading-3">
          <li>— All four completed data tables (screenshot or typed).</li>
          <li>— Your I-vs-V plot from Experiment A with the best-fit line and slope.</li>
          <li>— Written answers to prompts A1–A2, B1–B2, C1–C2, and D1–D2.</li>
          <li>
            — A one-paragraph reflection: in which experiment did your measured values deviate most
            from theory, and what is the most likely source of that deviation in a simulator that
            computes exact algebra?
          </li>
        </ul>
      </Section>

      <Stretch title="Going further">
        <p className="mb-prose-2">
          Build a <strong className="text-text font-medium">voltage-divider bias</strong> circuit:
          12 V → 1 kΩ → 2 kΩ → ground. Tap the node between the two resistors and connect it to the
          base of an NPN transistor (choose <em className="italic">Draw → Transistor → NPN</em>).
          Connect the emitter through a 100 Ω resistor to ground, and the collector through a 470 Ω
          resistor to 12 V. Measure the base voltage, emitter voltage, and collector voltage. Do
          they satisfy <M tex="V_E = V_B - 0.7" /> V (the silicon diode drop)? How does the emitter
          current compare to <M tex="I_E = V_E / R_E" />?
        </p>
      </Stretch>
    </>
  );

  const prose = (
    <>
      <h3 className="lab-section-h3">Why this lab exists</h3>
      <p className="mb-prose-3">
        Every textbook states Ohm's law, but very few students actually{' '}
        <em className="italic">build</em> a circuit, vary a voltage, and watch the current respond
        linearly. Falstad's simulator fills that gap: it is free, runs in any browser, and lets you
        place components, edit values, and read live voltages and currents with nothing more than a
        mouse hover
        <Cite id="falstad-circuit-simulator" in={SOURCES} />.
      </p>

      <h3 className="lab-section-h3">What you learned</h3>
      <p className="mb-prose-3">
        Four empirical facts, each verified to machine precision. <strong>One:</strong> current
        through a fixed resistor is directly proportional to the applied voltage — the graph is a
        straight line through the origin with slope <M tex="1/R" />. <strong>Two:</strong> resistors
        in series add, and the voltage divides in proportion to resistance. <strong>Three:</strong>{' '}
        resistors in parallel combine reciprocally, and the current divides in proportion to
        conductance. <strong>Four:</strong> the power dissipated in a resistor scales as the{' '}
        <em className="italic">square</em> of the voltage, not linearly — a fact that determines
        whether a component lives or smokes
        <Cite id="griffiths-2017" in={SOURCES} />.
      </p>

      <h3 className="lab-section-h3">From simulator to bench</h3>
      <p className="mb-prose-3">
        Falstad is an idealisation: it assumes zero wire resistance, perfect voltage sources, and
        components that obey Ohm's law exactly at all temperatures. A real breadboard introduces
        contact resistance (~0.1 Ω per clip), a real power supply has output impedance, and a real
        resistor heats up, changing its resistance by roughly 0.4 % per kelvin for carbon film. The
        simulator gives you the algebra; the bench gives you the parasitics. Both are necessary
        skills
        <Cite id="crc-resistivity" in={SOURCES} />.
      </p>

      <h3 className="lab-section-h3">Open-source cross-reference</h3>
      <p>
        For a worked treatment of DC circuit analysis in the same notation, see the OpenStax
        University Physics chapter on direct-current circuits
        <Cite id="libretexts-univ-physics" in={SOURCES} />. For the microscopic origin of resistance
        and the Drude model, see Ashcroft and Mermin Chapter 1
        <Cite id="ashcroft-mermin-1976" in={SOURCES} />. For the historical experiment that
        established <M tex="P = I^2 R" />, see Joule 1841
        <Cite id="joule-1841" in={SOURCES} />.
      </p>
    </>
  );

  return (
    <LabShell
      slug={SLUG}
      labSubtitle="Procedure"
      labId="E3.1"
      labContent={labContent}
      prose={prose}
    />
  );
}
