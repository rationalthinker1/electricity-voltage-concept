/**
 * Lab E2.1 — Faraday's Law in a Rotating Coil (PhET).
 *
 * A university-style experimental lab. The student drives PhET's Generator
 * simulation through three controlled experiments, computing the theoretical
 * peak EMF from Faraday's law beforehand and comparing it to the sim's
 * voltmeter reading.
 *
 *   (A) ε vs ω at fixed N, B, A   → linear fit gives the NBA product
 *   (B) ε vs N at fixed ω, B, A   → linear fit verifies proportionality to turns
 *   (C) ε vs B at fixed ω, N, A   → linear fit verifies proportionality to field
 *
 * The data tables ship with the first two rows pre-filled as worked
 * examples (theoretical + representative PhET reading).
 */

import { InlineMath } from '@/components/Formula';
import { LabShell } from '@/components/LabShell';
import { Pullout } from '@/components/Prose';
import { Cite } from '@/components/SourcesList';
import { DataTable, Prompt, Section, Stretch } from '@/components/ExperimentalLab';
import { BASE_LAB_SOURCES } from '@/labs/data/manifest';

const SLUG = 'faraday-generator';
const SOURCES = BASE_LAB_SOURCES[SLUG]!;

export default function FaradayGeneratorLab() {
  const labContent = (
    <>
      <Section tag="01" title="Open the sim">
        <p className="mb-prose-2">
          Open{' '}
          <a
            href="https://phet.colorado.edu/en/simulations/generator"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline decoration-dotted underline-offset-4"
          >
            PhET's Generator simulation
          </a>{' '}
          and select <strong className="text-text font-medium">Voltmeter</strong> as the
          indicator. You will see a bar magnet on a turbine wheel, a pickup coil, and a
          faucet that controls the water flow — which sets the rotation speed.
        </p>
        <p className="mb-prose-2">
          Before touching anything, predict: if you double the rotation speed of the
          magnet, what happens to the peak voltage displayed on the voltmeter? Write your
          prediction as a sentence, not just a number — include the word{' '}
          <em className="text-text italic">because</em>.
        </p>
      </Section>

      <Section tag="02" title="Experiment A — vary rotation speed, hold everything else fixed">
        <p className="mb-prose-2">
          Set the coil to <strong className="text-text font-medium">N = 2 turns</strong>,{' '}
          <strong className="text-text font-medium">loop area = 100%</strong>, and{' '}
          <strong className="text-text font-medium">bar magnet strength = 100%</strong>.
          For each faucet setting, record the rotation speed (the sim displays RPM) and
          the <em className="text-text italic">peak</em> voltmeter reading. The theoretical
          peak EMF for a rotating coil in a uniform field is
        </p>
        <p className="mb-prose-2">
          <InlineMath tex="\varepsilon_{\text{peak}} = N B A \omega" />
        </p>
        <p className="mb-prose-2">
          where <InlineMath tex="\omega = 2\pi f" /> (in rad/s). Use the parameters above
          to compute the theoretical peak for each row <em>before</em> you run the sim.
          The worked examples show you the format.
        </p>

        <DataTable
          headers={[
            <>f (Hz)</>,
            <>
              <InlineMath tex="\omega" /> (rad/s)
            </>,
            <>
              N (turns)
            </>,
            <>
              B (T)
            </>,
            <>
              A (m<sup>2</sup>)
            </>,
            <>
              Theoretical <InlineMath tex="\varepsilon_{\text{peak}}" /> (V)
            </>,
            <>PhET peak reading (V)</>,
          ]}
          rows={[
            ['1.0', '6.28', '2', '0.50', '5.0×10⁻³', '0.031', '~0.03'],
            ['2.0', '12.57', '2', '0.50', '5.0×10⁻³', '0.063', '~0.06'],
            ['3.0', '__', '2', '0.50', '5.0×10⁻³', '__', '__'],
            ['4.0', '__', '2', '0.50', '5.0×10⁻³', '__', '__'],
            ['5.0', '__', '2', '0.50', '5.0×10⁻³', '__', '__'],
          ]}
          caption={
            <>
              The first two rows are worked examples. The theoretical values are computed
              from <InlineMath tex="\varepsilon_{\text{peak}} = NBA\omega" /> using the
              representative parameters shown; your PhET readings should agree to within
              about 10% depending on how steadily the magnet rotates.
            </>
          }
        />

        <Prompt label="A1">
          Plot PhET peak reading (vertical) vs <InlineMath tex="\omega" /> (horizontal).
          Five points. Draw the best-fit straight line. Is the line consistent with passing
          through the origin? If it misses, explain in one sentence why a real generator
          might have a small offset even at zero speed.
        </Prompt>
        <Prompt label="A2">
          Compute the slope of your best-fit line (in units of V·s/rad). Using{' '}
          <InlineMath tex="\varepsilon_{\text{peak}} = (NBA)\,\omega" />, the slope should
          equal the product <InlineMath tex="NBA" />. With <InlineMath tex="N = 2" /> and{' '}
          <InlineMath tex="B = 0.50\ \text{T}" />, back-calculate the effective coil area{' '}
          <InlineMath tex="A" />. Compare your result to the 100% area setting in the sim.
        </Prompt>
      </Section>

      <Section tag="03" title="Experiment B — vary number of turns, hold speed fixed">
        <p className="mb-prose-2">
          Fix the faucet at <strong className="text-text font-medium">2 Hz</strong> and
          keep magnet strength and loop area at 100%. Sweep the number of turns through{' '}
          <strong className="text-text font-medium">1, 2, 3, 4</strong>. For each setting,
          compute the theoretical peak EMF and record the PhET voltmeter peak.
        </p>

        <DataTable
          headers={[
            <>N (turns)</>,
            <>
              <InlineMath tex="\omega" /> (rad/s)
            </>,
            <>
              B (T)
            </>,
            <>
              A (m<sup>2</sup>)
            </>,
            <>
              Theoretical <InlineMath tex="\varepsilon_{\text{peak}}" /> (V)
            </>,
            <>PhET peak reading (V)</>,
          ]}
          rows={[
            ['1', '12.57', '0.50', '5.0×10⁻³', '0.031', '~0.03'],
            ['2', '12.57', '0.50', '5.0×10⁻³', '0.063', '~0.06'],
            ['3', '12.57', '0.50', '5.0×10⁻³', '__', '__'],
            ['4', '12.57', '0.50', '5.0×10⁻³', '__', '__'],
          ]}
          caption={
            <>
              Two rows pre-filled as worked examples. The theoretical peak doubles when
              the turns double — Faraday's law says the induced EMF in each turn adds in
              series.
            </>
          }
        />

        <Prompt label="B1">
          Plot PhET peak reading vs <InlineMath tex="N" />. Is the slope consistent with
          the value of <InlineMath tex="BA\omega" /> you used above? If your slope differs
          by more than 15%, identify the most likely source of discrepancy (hint: does the
          PhET sim keep the area exactly constant when you change the turn count?).
        </Prompt>
        <Prompt label="B2">
          Write one sentence explaining why{' '}
          <InlineMath tex="\varepsilon_{\text{peak}} \propto N" /> using the words{' '}
          <em className="italic">flux</em> and <em className="italic">series</em>.
        </Prompt>
      </Section>

      <Section tag="04" title="Experiment C — vary magnet strength, hold turns and speed fixed">
        <p className="mb-prose-2">
          Fix <strong className="text-text font-medium">N = 2</strong> and{' '}
          <strong className="text-text font-medium">2 Hz</strong>. Sweep the magnet
          strength through <strong className="text-text font-medium">50%, 100%, 150%, 200%</strong>{' '}
          of maximum. Treat the 100% setting as <InlineMath tex="B = 0.50\ \text{T}" />;
          the others scale proportionally.
        </p>

        <DataTable
          headers={[
            <>Magnet strength (%)</>,
            <>
              B (T)
            </>,
            <>
              N (turns)
            </>,
            <>
              <InlineMath tex="\omega" /> (rad/s)
            </>,
            <>
              Theoretical <InlineMath tex="\varepsilon_{\text{peak}}" /> (V)
            </>,
            <>PhET peak reading (V)</>,
          ]}
          rows={[
            ['50', '0.25', '2', '12.57', '0.031', '~0.03'],
            ['100', '0.50', '2', '12.57', '0.063', '~0.06'],
            ['150', '0.75', '2', '12.57', '__', '__'],
            ['200', '1.00', '2', '12.57', '__', '__'],
          ]}
          caption={
            <>
              Worked examples for 50% and 100% strength. The magnetic field in the sim is
              proportional to the strength slider; we calibrate 100% to{' '}
              <InlineMath tex="0.50\ \text{T}" /> for this worksheet.
            </>
          }
        />

        <Prompt label="C1">
          Plot PhET peak reading vs <InlineMath tex="B" />. The slope should equal{' '}
          <InlineMath tex="NA\omega" />. Compute the slope from your graph and compare it
          to the theoretical value. Report the percent difference.
        </Prompt>
        <Prompt label="C2">
          Faraday's law is usually written{' '}
          <InlineMath tex="\varepsilon = -N\, d\Phi_B/dt" />. For a coil rotating at
          constant angular velocity <InlineMath tex="\omega" /> in a uniform field, the
          flux is <InlineMath tex="\Phi_B = BA\cos(\omega t)" />. Show, by taking the
          derivative, that the peak magnitude is exactly{' '}
          <InlineMath tex="NBA\omega" />.
        </Prompt>
      </Section>

      <Section tag="05" title="The bigger picture">
        <p className="mb-prose-2">
          You have now done — at undergraduate fidelity — what every power plant on Earth
          does. A magnet spins past a coil; the changing flux induces an EMF; that EMF
          drives a current. Faraday discovered this in 1831 using a hand-cranked copper
          disk and a permanent magnet, producing what he called "magneto-electric
          induction" <Cite id="faraday-1832" in={SOURCES} />. The PhET simulation is the
          same physics, stripped to its essentials: rotating magnet, stationary coil, and
          a voltmeter.
        </p>
        <Pullout>
          The peak voltage is not a property of the magnet, or the coil, or the speed
          alone. It is the product of all three — flux, turns, and rate of change.
        </Pullout>
        <p className="mb-prose-2">
          The sign of the EMF alternates because the flux derivative oscillates between
          positive and negative as the coil rotates. That is why the voltmeter needle
          swings back and forth — and why the generator is called an{' '}
          <em className="text-text italic">alternating-current</em> generator. The
          frequency of the voltage waveform is exactly the rotation frequency of the magnet
          <Cite id="feynman-II-17" in={SOURCES} />.
        </p>
      </Section>

      <Section tag="06" title="Writeup">
        <p className="mb-prose-2">Submit a one-page writeup containing:</p>
        <ul className="text-6 text-text-dim space-y-1 leading-3 ml-md">
          <li>— All three completed data tables (printed or screenshot).</li>
          <li>— All three plots, with axis labels, units, and a best-fit line.</li>
          <li>— Your extracted value of NBA from Experiment A (with units).</li>
          <li>— Your answers to prompts A2, B1, B2, C1, and C2.</li>
          <li>
            — A one-paragraph reflection: what was the largest source of disagreement
            between your theoretical predictions and the PhET readings, and why does it
            not invalidate Faraday's law?
          </li>
        </ul>
      </Section>

      <Stretch title="Going further">
        <p>
          Set the magnet strength to 100%, the loop area to 100%, and the turn count to 2.
          Crank the faucet to its maximum and measure the peak voltage. Now switch the
          indicator from <em className="text-text italic">Voltmeter</em> to{' '}
          <em className="text-text italic">Light Bulb</em>. The bulb glows only when the
          voltage is large enough to drive a current through its resistance. At what
          rotation speed does the bulb first flicker? Compute the threshold peak EMF from
          your data in Experiment A and compare it to the speed at which the bulb lights.
          What does this tell you about the relationship between EMF, current, and power
          dissipation in a resistive load?
        </p>
      </Stretch>
    </>
  );

  const prose = (
    <>
      <h3 className="lab-section-h3">Why this lab exists</h3>
      <p className="mb-prose-3">
        Every physics textbook writes <InlineMath tex="\varepsilon = -N\, d\Phi_B/dt" />{' '}
        and moves on. Very few ask the student to <em className="text-text italic">build</em>{' '}
        the equation from controlled measurements. In this lab you treat Faraday's law as
        an empirical statement with three independent variables — flux (through{' '}
        <InlineMath tex="B" /> and <InlineMath tex="A" />), turns <InlineMath tex="N" />,
        and rate of change <InlineMath tex="\omega" /> — and you isolate each one in turn.
        The result is not a memorised formula but a verified proportional relationship
        <Cite id="griffiths-2017" in={SOURCES} />.
      </p>

      <h3 className="lab-section-h3">What you learned</h3>
      <p className="mb-prose-3">
        The empirical content of Faraday's law is three facts. <strong>One:</strong> the
        induced voltage is proportional to the number of turns, which you confirmed in
        Experiment B. <strong>Two:</strong> the voltage is proportional to the magnetic
        field strength, which you confirmed in Experiment C.{' '}
        <strong>Three:</strong> the voltage is proportional to the angular frequency, which
        you confirmed in Experiment A. Combine those three proportionalities and the form
        of the equation is fully fixed; the only thing left to determine is the geometric
        constant <InlineMath tex="A" />, which you extracted from the slope in part A
        <Cite id="feynman-II-17" in={SOURCES} />.
      </p>

      <h3 className="lab-section-h3">Where the sine wave comes from</h3>
      <p className="mb-prose-3">
        The flux through a flat coil rotating in a uniform field is{' '}
        <InlineMath tex="\Phi_B(t) = BA\cos(\omega t)" />. The EMF is the negative time
        derivative: <InlineMath tex="\varepsilon(t) = NBA\omega\sin(\omega t)" />. The
        sine wave on the PhET voltmeter is not an artefact of the simulation — it is the
        direct mathematical consequence of a cosine flux passing through a linear
        derivative. The peak occurs when the flux is zero (the coil face is parallel to the
        field) because that is where the cosine changes fastest
        <Cite id="griffiths-2017" in={SOURCES} />.
      </p>

      <h3 className="lab-section-h3">Caveats and where this fails</h3>
      <p className="mb-prose-3">
        Real generators have resistance in their windings, eddy-current losses in their
        iron cores, and mechanical friction in their bearings. The PhET simulation ignores
        all of these. A real hydroelectric generator the size of a house may produce
        20 kV at 50 Hz, but its peak EMF is reduced by internal resistance once you close
        the circuit and draw current. The simulation shows the open-circuit voltage — the
        EMF itself — which is the correct quantity to test against Faraday's law
        <Cite id="libretexts-univ-physics" in={SOURCES} />.
      </p>

      <h3 className="lab-section-h3">Reading further</h3>
      <p>
        For the historical experiment, see Faraday 1832
        <Cite id="faraday-1832" in={SOURCES} />. For the canonical derivation and the
        connection to Lenz's law, see Feynman Vol. II, Ch. 17
        <Cite id="feynman-II-17" in={SOURCES} /> and Griffiths §7.2
        <Cite id="griffiths-2017" in={SOURCES} />. For an open-access worked treatment of
        rotating-coil generators, see OpenStax University Physics §23.5
        <Cite id="libretexts-univ-physics" in={SOURCES} />.
      </p>
    </>
  );

  return (
    <LabShell
      slug={SLUG}
      labSubtitle="Procedure"
      labId="E2.1"
      labContent={labContent}
      prose={prose}
    />
  );
}
