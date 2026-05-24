/**
 * Lab E1.1 — Verifying Coulomb's Inverse Square (PhET).
 *
 * A university-style experimental lab. The student drives PhET's
 * Coulomb's-Law simulation through two controlled experiments:
 *
 *   (A) F vs r at fixed Q₁, Q₂   → log-log fit gives the exponent of r
 *   (B) F vs Q₁ at fixed r, Q₂   → linear fit + algebra gives k
 *
 * The data tables ship with the first two rows pre-filled as worked
 * examples (so the student sees the units and rounding conventions). The
 * remaining rows are blank slots for the student to populate.
 */

import { M } from '@/components/Formula';
import { LabShell } from '@/components/LabShell';
import { Pullout } from '@/components/Prose';
import { Cite } from '@/components/SourcesList';
import { DataTable, Prompt, Section, Stretch } from '@/components/ExperimentalLab';
import { BASE_LAB_SOURCES } from '@/labs/data/manifest';

const SLUG = 'coulomb-phet';
const SOURCES = BASE_LAB_SOURCES[SLUG]!;

export default function CoulombPhetLab() {
  const labContent = (
    <>
      <Section tag="01" title="Open the sim">
        <p className="mb-prose-2">
          Open{' '}
          <a
            href="https://phet.colorado.edu/en/simulations/coulombs-law"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline decoration-dotted underline-offset-4"
          >
            PhET's Coulomb's Law simulator
          </a>{' '}
          and click <strong className="text-text font-medium">Macro Scale</strong>. You'll see two
          coloured spheres on a ruler, each with a draggable charge slider in microcoulombs (μC) and
          a live force readout in newtons.
        </p>
        <p className="mb-prose-2">
          Before touching anything, predict: if you double the distance between the charges, what
          happens to the force? Write your prediction in your notebook — a number, with a unit, with
          a sign. We'll come back to it.
        </p>
      </Section>

      <Section tag="02" title="Experiment A — vary r, hold charges fixed">
        <p className="mb-prose-2">
          Set both charges to <strong className="text-text font-medium">+4 μC</strong>. Drag the
          second sphere so the centre-to-centre separation reads exactly{' '}
          <strong className="text-text font-medium">2.0 cm</strong> on the ruler. Record the force
          PhET displays. Then move the sphere to 3, 4, 5, 6, and 8 cm in turn, recording each.
        </p>

        <DataTable
          headers={[
            <>r (cm)</>,
            <>r (m)</>,
            <>F (N) from PhET</>,
            <>log₁₀(r/m)</>,
            <>log₁₀(F/N)</>,
          ]}
          rows={[
            ['2.0', '0.020', '359.4', '−1.699', '2.555'],
            ['3.0', '0.030', '159.7', '−1.523', '2.203'],
            ['4.0', '__', '__', '__', '__'],
            ['5.0', '__', '__', '__', '__'],
            ['6.0', '__', '__', '__', '__'],
            ['8.0', '__', '__', '__', '__'],
          ]}
          caption={
            <>
              Two rows are pre-filled as worked examples — confirm them yourself before continuing.
              The PhET reading for 2.0 cm at Q₁=Q₂=+4 μC should be ~359 N; if you see something an
              order of magnitude off, check that both spheres really read +4 μC and not +4 mC.
            </>
          }
        />

        <Prompt label="A1">
          Plot <M tex="\log_{10} F" /> on the vertical axis vs <M tex="\log_{10} r" /> on the
          horizontal axis. Six points. Draw the best-fit straight line by eye, or use the{' '}
          <code className="font-3 text-3">SLOPE()</code> function in your spreadsheet.
        </Prompt>
        <Prompt label="A2">
          Report the slope of your line, with a one-decimal uncertainty estimate. The expected
          theoretical value is <M tex="-2" /> (because Coulomb's law has <M tex="r^{2}" /> in the
          denominator). How close did you get?
        </Prompt>
      </Section>

      <Section tag="03" title="Experiment B — vary Q₁, hold r fixed">
        <p className="mb-prose-2">
          Reset both spheres. Set the separation to exactly{' '}
          <strong className="text-text font-medium">5.0 cm</strong> and hold it there. Fix{' '}
          <M tex="Q_2 = +4\ \mu\text{C}" />. Sweep <M tex="Q_1" /> through{' '}
          <strong className="text-text font-medium">+1, +2, +4, +6, +8, +10 μC</strong>, recording F
          at each step.
        </p>

        <DataTable
          headers={[
            <>
              Q<sub>1</sub> (μC)
            </>,
            <>
              Q<sub>1</sub> (C)
            </>,
            <>F (N)</>,
            <>F / Q₁ (N/C)</>,
          ]}
          rows={[
            ['+1', '1×10⁻⁶', '14.4', '14.4×10⁶'],
            ['+2', '2×10⁻⁶', '28.8', '14.4×10⁶'],
            ['+4', '__', '__', '__'],
            ['+6', '__', '__', '__'],
            ['+8', '__', '__', '__'],
            ['+10', '__', '__', '__'],
          ]}
        />

        <Prompt label="B1">
          The ratio in the last column should be roughly constant. Why? Write the answer in one
          sentence using <M tex="F = k\, Q_1 Q_2 / r^2" />.
        </Prompt>
        <Prompt label="B2">
          Take the mean of your six <M tex="F / Q_1" /> values and use it to back-solve for
          Coulomb's constant <M tex="k" />. You have <M tex="Q_2" /> and <M tex="r" /> from the
          setup; solve <M tex="k = (F/Q_1) \cdot r^2 / Q_2" />.
        </Prompt>
        <Prompt label="B3">
          The accepted CODATA value is{' '}
          <strong className="text-text font-medium">k = 8.9875517873681764 × 10⁹ N·m²/C²</strong>
          <Cite id="codata-2018" in={SOURCES} />. Compute the percent error of your result. Anything
          under 1% should be considered an excellent agreement; PhET uses the exact value
          internally, so the residual is purely from your reading precision and arithmetic.
        </Prompt>
      </Section>

      <Section tag="04" title="The bigger picture">
        <p className="mb-prose-2">
          You have now done — at undergraduate fidelity — what Coulomb did in 1785 with a torsion
          balance so delicate it could resolve the twist of a silk thread
          <Cite id="coulomb-1785" in={SOURCES} />. The exponent <M tex="-2" /> you extracted in part
          A is the same exponent that Williams, Faller and Hill confirmed in 1971 to one part in{' '}
          <M tex="10^{16}" /> using a charged concentric-shell experiment
          <Cite id="williams-faller-hill-1971" in={SOURCES} />.
        </p>
        <Pullout>
          A two-microcoulomb sphere is not a thing you'll ever hold. Two of them at 5 cm pull on
          each other with the weight of a small adult cat.
        </Pullout>
      </Section>

      <Section tag="05" title="Writeup">
        <p className="mb-prose-2">Submit a one-page writeup containing:</p>
        <ul className="text-6 text-text-dim ml-md space-y-1 leading-3">
          <li>— Both completed data tables (printed or screenshot).</li>
          <li>— Both plots, with axis labels, units, and a best-fit line.</li>
          <li>
            — Your extracted exponent of <M tex="r" /> with uncertainty.
          </li>
          <li>
            — Your extracted value of <M tex="k" /> with percent error vs CODATA.
          </li>
          <li>
            — A one-paragraph reflection: where did the largest source of error come from, given
            that PhET is computing the exact equation internally?
          </li>
        </ul>
      </Section>

      <Stretch title="Going further">
        <p>
          Run Experiment A a second time at a different fixed charge product — say{' '}
          <M tex="Q_1 = +2\ \mu\text{C}" />, <M tex="Q_2 = +8\ \mu\text{C}" /> — and confirm your
          fitted slope is unchanged. Does the <em className="italic">intercept</em> shift, and by
          how much? Predict the shift algebraically before measuring it.
        </p>
      </Stretch>
    </>
  );

  const prose = (
    <>
      <h3 className="lab-section-h3">Why this lab exists</h3>
      <p className="mb-prose-3">
        Every physics textbook tells you that <M tex="F = k\, Q_1 Q_2 / r^2" /> is the foundational
        law of electrostatics. Very few ask the student to{' '}
        <em className="text-text italic">prove it</em>. In a real torsion-balance lab the equipment
        is delicate, the data is noisy, and the result is a slope-fit on a log-log plot — the same
        workflow you just walked through here, but compressed from days to minutes by a
        peer-reviewed simulation hosted at the University of Colorado
        <Cite id="phet-coulombs-law" in={SOURCES} />.
      </p>

      <h3 className="lab-section-h3">What you learned</h3>
      <p className="mb-prose-3">
        The empirical content of Coulomb's law is two facts. <strong>One:</strong> the force scales
        as <M tex="1/r^2" />, which you confirmed by fitting a slope of −2 on your log-log plot.{' '}
        <strong>Two:</strong> the force is proportional to the product of charges, which you
        confirmed by holding <M tex="Q_2" /> and <M tex="r" /> fixed and reading off a constant{' '}
        <M tex="F/Q_1" />. Combine those two facts and the form of the equation is fully fixed; the
        only thing left to measure is the constant <M tex="k" />, which you did in part B
        <Cite id="griffiths-2017" in={SOURCES} />.
      </p>

      <h3 className="lab-section-h3">Where the −2 comes from</h3>
      <p className="mb-prose-3">
        The reason the exponent is exactly −2 (and not −1.998 or −2.0001) is{' '}
        <em className="text-text italic">geometric</em>. The surface area of a sphere at radius{' '}
        <M tex="r" /> scales as <M tex="4\pi r^2" />. The "amount of influence" a point source
        spreads through space is conserved as it spreads outward; if it's diluted over an
        ever-growing sphere of area <M tex="\propto r^2" />, then the field strength at any one
        point on that sphere must fall as <M tex="1/r^2" />. The inverse-square law is, at bottom, a
        statement that we live in three spatial dimensions
        <Cite id="feynman-II-2" in={SOURCES} />.
      </p>

      <h3 className="lab-section-h3">Caveats and where this fails</h3>
      <p className="mb-prose-3">
        Coulomb's law applies to <em className="text-text italic">point charges at rest</em>.
        Extended charge distributions only obey it to the extent you treat them as collections of
        point charges and superpose. Accelerating charges radiate, and the instantaneous-action form
        of the law breaks down in favour of the retarded fields of full electrodynamics. PhET's
        simulation is an idealisation — the spheres in the sim are point charges with a graphical
        skin, not the conducting balls of a real torsion balance, which would induce charge in each
        other at close separation and bend the curve <Cite id="griffiths-2017" in={SOURCES} />.
      </p>

      <h3 className="lab-section-h3">Reading further</h3>
      <p>
        For the historical experiment, see Coulomb 1785
        <Cite id="coulomb-1785" in={SOURCES} />. For the precision test of the exponent, see
        Williams, Faller, and Hill 1971
        <Cite id="williams-faller-hill-1971" in={SOURCES} />. For the canonical derivation and the
        connection to Gauss's law, see Griffiths chapter 2
        <Cite id="griffiths-2017" in={SOURCES} />. For an open-access worked treatment of this same
        equation, see the OpenStax University Physics chapter on Coulomb's law
        <Cite id="libretexts-univ-physics" in={SOURCES} />.
      </p>
    </>
  );

  return (
    <LabShell
      slug={SLUG}
      labSubtitle="Procedure"
      labId="E1.1"
      labContent={labContent}
      prose={prose}
    />
  );
}
