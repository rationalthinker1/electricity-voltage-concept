/**
 * Chapter 8 — Maxwell's equations together
 *
 * Synthesis chapter. Ch.1 gave us Gauss for E; Ch.4 introduced Ampère and
 * implicitly no-monopoles; Ch.5 was Faraday; Ch.6 made Maxwell's
 * displacement-current addition load-bearing. This chapter stacks all four
 * laws on one page, then runs the famous calculation that pulls c out of
 * ε₀ and μ₀ alone.
 */
import { CaseStudies, CaseStudy } from '@/components/CaseStudy';
import { ChapterShell } from '@/components/ChapterShell';
import { FAQ, FAQItem } from '@/components/FAQ';
import { Cite } from '@/components/SourcesList';
import { Formula, InlineMath } from '@/components/Formula';
import { Term } from '@/components/Term';
import { TryIt } from '@/components/TryIt';
import { AmpereMaxwellLawDemo } from './demos/AmpereMaxwellLaw';
import { CFromMaxwellDemo } from './demos/CFromMaxwell';
import { FaradayLawDemo } from './demos/FaradayLaw';
import { GaussBLawDemo } from './demos/GaussBLaw';
import { GaussELawDemo } from './demos/GaussELaw';
import { getChapter } from './data/chapters';

export default function Ch10Maxwell() {
  const chapter = getChapter('maxwell')!;
  const SOURCES = chapter.sources;

  return (
    <ChapterShell chapter={chapter}>
      <p>
        Up to now you've met each law in its own setting. Gauss's law for the electric field appeared in Chapter&nbsp;1,
        the moment we asked how a point charge sprays its influence into a sphere of empty space. The no-monopole rule
        for the magnetic field was implicit in Chapter&nbsp;4, every time we drew B-field circles closing on themselves
        around a wire. Faraday's law was the entire subject of Chapter&nbsp;5: change a flux, get a voltage. And Ampère's
        law — promoted by Maxwell's correction — quietly made Chapter&nbsp;6's Poynting picture self-consistent, with the
        displacement-current term tying off a hole that Ampère alone could not close.
      </p>
      <p>
        Today they all stand together. Four equations. One field. The whole book up to this point is the four lines that
        follow — and the wave equation that drops out when you put them in a blender<Cite id="feynman-II-18" in={SOURCES} />.
      </p>

      <h2>Four laws on <em>one</em> page</h2>

      <p>
        Maxwell published the unified theory in 1865<Cite id="maxwell-1865" in={SOURCES} />. The modern integral form,
        which is the easiest to look at:
      </p>
      <Formula>∮ E · dA = Q<sub>enc</sub> / ε₀</Formula>
      <Formula>∮ B · dA = 0</Formula>
      <Formula>∮ E · dℓ = − dΦ<sub>B</sub>/dt</Formula>
      <Formula>∮ B · dℓ = μ₀ ( I<sub>enc</sub> + ε₀ dΦ<sub>E</sub>/dt )</Formula>
      <p>
        Two surface integrals ({' '}
        <Term def={<><strong>flux</strong> — the integral of a vector field over a surface, ∫ F · dA. For a closed surface, measures net "flow" of the field out of the enclosed volume. SI units depend on the field (V·m for E-flux, T·m² = Wb for B-flux).</>}>flux</Term> out of a closed surface) and two line integrals (circulation around a closed loop).
        The first equation says charge sources electric flux. The second says nothing sources magnetic flux. The third
        says a changing magnetic flux induces an electric circulation. The fourth says a current — or a changing electric
        flux — induces a magnetic circulation. Read them out loud and you have everything classical electromagnetism
        knows<Cite id="griffiths-2017" in={SOURCES} />.
      </p>
      <p className="pullout">
        Two <Term def={<><strong>divergence</strong> — a scalar measure of how much a vector field flows out of an infinitesimal volume. ∇·F &gt; 0 means a source, ∇·F &lt; 0 a sink, ∇·F = 0 a divergence-free field. The divergence theorem ties ∮F·dA = ∫∇·F dV.</>}>divergence</Term> laws (what flows <em>out</em> of a closed box). Two{' '}
        <Term def={<><strong>curl</strong> — a vector measure of a field's local circulation. ∇×F is nonzero where field lines loop around an axis. Stokes' theorem ties ∮F·dℓ = ∫(∇×F)·dA.</>}>curl</Term> laws (what flows <em>around</em> a closed loop).
        The pattern is too clean to be accidental.
      </p>

      <h2>Gauss's law for <em>E</em></h2>

      <p>
        The first equation — <Term def={<><strong>Gauss's law</strong> — the net electric flux through any closed surface equals the enclosed charge divided by ε₀: ∮ E · dA = Q<sub>enc</sub>/ε₀. Equivalent to Coulomb's inverse-square law plus the assumption of spherical symmetry.</>}>Gauss's law</Term> — says: the net electric flux through any closed surface is equal to the charge enclosed inside
        it, divided by ε₀. Pull a charge inside, flux goes up; push it back out, flux falls to zero. The shape of the
        surface doesn't matter — sphere, cube, ugly potato — only the total charge inside it counts<Cite id="gauss-1813" in={SOURCES} />.
      </p>

      <GaussELawDemo />

      <p>
        The physical content is straightforward: <strong>the only way for a closed surface to have net E flux out of it is if
        there's net charge inside</strong>. If no charge is enclosed, every field line that enters must exit somewhere
        else — the books balance. This is the same divergence theorem Gauss proved for gravitational fields in 1813;
        applying it to electric fields gives you the law that bears his name<Cite id="griffiths-2017" in={SOURCES} />.
        For a sphere centered on a point charge, the integral specializes to Coulomb's law (the 4π in 1/(4πε₀) is just
        the surface area of a unit sphere) — same physics, different bookkeeping.
      </p>

      <TryIt
        tag="Try 10.1"
        question={
          <>A closed surface of any shape encloses a total charge of <strong>1 μC</strong>. What is the total electric
          flux through that surface?</>
        }
        hint="Apply Gauss directly: Φ_E = Q_enc / ε₀. The shape doesn't matter."
        answer={
          <>
            <p>
              Gauss's law gives the flux from the enclosed charge alone<Cite id="gauss-1813" in={SOURCES} />:
            </p>
            <Formula>Φ<sub>E</sub> = Q<sub>enc</sub> / ε₀ = (1×10⁻⁶) / (8.854×10⁻¹²)</Formula>
            <p>
              ≈ <strong>1.13×10⁵ V·m</strong>, with <em>ε₀</em> = 8.854×10⁻¹² F/m<Cite id="codata-2018" in={SOURCES} />.
              The shape of the surface — sphere, cube, ugly potato — is irrelevant. Only the enclosed charge counts.
            </p>
          </>
        }
      />

      <h2>Gauss's law for <em>B</em></h2>

      <p>
        The second equation looks anemic next to the first — there's no source term on the right. That's the point.
      </p>
      <Formula>∮ B · dA = 0</Formula>
      <p>
        Every closed surface, anywhere in the universe, has exactly zero net magnetic flux through it. Equivalently:
        every B-field line is a closed loop. There are no isolated magnetic sources from which lines emerge or into
        which they disappear. <strong>No magnetic{' '}
        <Term def={<><strong>monopole</strong> — a hypothetical isolated north or south magnetic pole. None has ever been observed; every B-field line is a closed loop. The asymmetry with electric charge (which has free monopoles, the electron and proton) is an open puzzle of the Standard Model.</>}>monopoles</Term></strong><Cite id="jackson-1999" in={SOURCES} />.
      </p>

      <GaussBLawDemo />

      <p>
        This is an experimental fact — not a derivation. Cut a bar magnet in half and you do not get a north pole and
        a south pole; you get two smaller bar magnets, each with both poles. Decades of searches with extraordinary
        sensitivity have failed to find a single isolated magnetic charge<Cite id="griffiths-2017" in={SOURCES} />.
        If one ever does turn up, the equation gains a source term and the symmetry of the four laws becomes much
        cleaner — but until then, the right-hand side is zero, and that asymmetry is one of the open puzzles of the
        Standard Model.
      </p>

      <TryIt
        tag="Try 10.2"
        question={
          <>What is the net magnetic flux through any closed surface — say, a sphere drawn anywhere in the universe?</>
        }
        hint="Read the second equation."
        answer={
          <>
            <p>
              Exactly <strong>zero</strong>, no matter where or how big the surface is<Cite id="jackson-1999" in={SOURCES} />:
            </p>
            <Formula>∮ B · dA = 0</Formula>
            <p>
              Whatever <strong>B</strong>-flux enters one side of any closed surface, the same amount comes out somewhere
              else. Every magnetic field line is a closed loop with no beginning and no end — because there is no
              isolated north or south pole to start or stop on<Cite id="griffiths-2017" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2>Faraday's law</h2>

      <p>
        The third equation —{' '}
        <Term def={<><strong>Faraday's law</strong> — a changing magnetic flux through a loop drives an EMF around the loop: ∮ E · dℓ = − dΦ<sub>B</sub>/dt. The minus sign (Lenz's law) encodes energy conservation. Discovered experimentally by Faraday in 1831; see Ch. 7 for the full story.</>}>Faraday's law</Term>{' '}— discovered experimentally by Faraday in 1831 and published in 1832<Cite id="faraday-1832" in={SOURCES} />:
      </p>
      <Formula>∮ E · dℓ = − dΦ<sub>B</sub>/dt</Formula>
      <p>
        A magnetic flux that changes in time produces a circulating electric field. Equivalently: <strong>a time-varying
        B is itself a source of E</strong> — you don't need charges to make an electric field, only a changing magnetic
        one<Cite id="feynman-II-18" in={SOURCES} />.
      </p>

      <FaradayLawDemo />

      <p>
        The minus sign is the one piece of bookkeeping that is not optional. It encodes Lenz's law: the induced EMF
        always points in the direction whose induced current would <em>oppose</em> the change in flux. If the universe
        let the induced current reinforce the change, you would have free energy on tap. The minus sign is energy
        conservation, made visible<Cite id="griffiths-2017" in={SOURCES} />.
      </p>

      <TryIt
        tag="Try 10.3"
        question={
          <>The magnetic flux through a single-turn loop ramps linearly from <strong>0</strong> to <strong>1 mWb</strong>
          over <strong>1 ms</strong>. What is the magnitude of the induced EMF around the loop?</>
        }
        hint="EMF = |dΦ_B/dt| for a single turn."
        answer={
          <>
            <p>
              By Faraday's law<Cite id="faraday-1832" in={SOURCES} />:
            </p>
            <Formula>|EMF| = |dΦ<sub>B</sub>/dt| = (1×10⁻³ Wb) / (1×10⁻³ s) = 1 V</Formula>
            <p>
              <strong>1 V</strong> exactly, for the duration of the ramp. (The minus sign sets direction — which way the
              induced current would flow — but doesn't change the magnitude.) Multiply by <em>N</em> turns and the EMF
              scales linearly, which is the whole reason transformers work<Cite id="griffiths-2017" in={SOURCES} />.
            </p>
          </>
        }
      />
      <p>
        Faraday's law also retires, finally, the picture of E as a quantity that lives only near charges.
        Static charges make E, yes — but a magnet you wave around in empty space also makes E. The field is
        sourced by <em>two</em> things now: charge density, and changing magnetic flux.
      </p>

      <h2>Ampère–Maxwell law</h2>

      <p>
        The fourth equation — the{' '}
        <Term def={<><strong>Ampère–Maxwell law</strong> — currents and changing electric flux together source a magnetic circulation: ∮ B · dℓ = μ₀(I<sub>enc</sub> + ε₀ dΦ<sub>E</sub>/dt). Maxwell's 1865 displacement-current correction is what closes the loop and produces electromagnetic waves.</>}>Ampère–Maxwell law</Term>{' '}— is the one Maxwell rewrote. Ampère's original law, established empirically in 1826
        <Cite id="ampere-1826" in={SOURCES} />, was the magnetic counterpart of Faraday's:
      </p>
      <Formula>∮ B · dℓ = μ₀ I<sub>enc</sub></Formula>
      <p>
        Current sources circulating B. Beautiful — but, Maxwell noticed in 1865, <em>broken</em> in any situation where
        the current isn't continuous. The canonical counter-example is a parallel-plate capacitor in the middle of being
        charged. Wrap an Amperian loop around the wire feeding one plate, and the formula gives a B-field tied to the
        wire's current. Slide the same loop a few centimeters along, into the gap between the plates, and — no
        conduction current pierces it. Same loop, same circulation expected by symmetry, suddenly zero current. Ampère's
        law disagrees with itself depending on where you draw the surface<Cite id="maxwell-1865" in={SOURCES} />.
      </p>
      <p>
        Maxwell's fix was to add a second term:
      </p>
      <Formula>∮ B · dℓ = μ₀ ( I<sub>enc</sub> + ε₀ dΦ<sub>E</sub>/dt )</Formula>
      <p>
        The term <InlineMath>ε₀ dΦ<sub>E</sub>/dt</InlineMath> is the{' '}
        <Term def={<><strong>displacement current</strong> — the term <em>J<sub>D</sub> = ε₀ ∂E/∂t</em> that Maxwell added to Ampère's law in 1865. Not an actual flow of charge, but a changing electric flux that sources B exactly as a real current would. Without it, charge conservation fails in time-varying situations.</>}><em>displacement current</em></Term>. In the capacitor
        gap there's no conduction current — but the E-field between the plates is growing, the electric flux through
        the loop is growing with it, and Maxwell's term exactly fills in for the missing conduction current. The two
        contributions are equal by charge conservation (continuity equation): whatever amount of charge per second is
        flowing into the plate is exactly the rate at which the flux is growing in the gap.
      </p>

      <AmpereMaxwellLawDemo />

      <TryIt
        tag="Try 10.4"
        question={
          <>The electric field inside a charging capacitor's gap is changing at a rate of <strong>1 GV/(m·s)</strong>
          (i.e. <strong>10⁹ V/m per second</strong>). What is the displacement-current density <em>J<sub>D</sub></em> there?</>
        }
        hint="J_D = ε₀ dE/dt."
        answer={
          <>
            <p>
              Plug in <em>ε₀</em> = 8.854×10⁻¹² F/m<Cite id="codata-2018" in={SOURCES} />:
            </p>
            <Formula>J<sub>D</sub> = ε₀ dE/dt = (8.854×10⁻¹²)(10⁹) ≈ 8.85×10⁻³ A/m²</Formula>
            <p>
              About <strong>8.85 mA/m²</strong> — a modest current density, but spread over the plate area it produces
              exactly the same magnetic circulation that the conduction current in the wires does
              <Cite id="maxwell-1865" in={SOURCES} />. Without Maxwell's term, ∮B·dℓ would jump discontinuously as the
              Amperian surface crosses the plate; with it, the integral is continuous and charge is conserved
              <Cite id="feynman-II-18" in={SOURCES} />.
            </p>
          </>
        }
      />

      <p className="pullout">
        The displacement current isn't a current. It's the universe insisting that changing electric fields make magnetic ones.
      </p>
      <p>
        This was Maxwell's stroke of genius, and the moment electromagnetism became one theory. Now both curl equations
        are symmetric: a changing B sources circulating E (Faraday), and a changing E sources circulating B (Ampère–Maxwell).
        The two of them, taken together, can sustain each other in empty space — which is exactly the next paragraph
        <Cite id="feynman-II-18" in={SOURCES} />.
      </p>

      <h2>The four together → <em>light</em></h2>

      <p>
        Take the two curl equations, far from any charges or currents — pure vacuum, <InlineMath>ρ = 0, J = 0</InlineMath>:
      </p>
      <Formula>∇ × E = − ∂B/∂t</Formula>
      <Formula>∇ × B = μ₀ ε₀ ∂E/∂t</Formula>
      <p>
        Take the curl of the first equation; use the vector identity <InlineMath>∇×(∇×E) = ∇(∇·E) − ∇²E</InlineMath>;
        invoke Gauss for E (with ρ = 0, so ∇·E = 0); and substitute in the right-hand side of the second equation. After
        the dust settles:
      </p>
      <Formula>∇² E = μ₀ ε₀ ∂²E/∂t²</Formula>
      <p>
        That's a{' '}
        <Term def={<><strong>wave equation</strong> — a PDE of the form <em>∇²ψ = (1/v²) ∂²ψ/∂t²</em> whose solutions are travelling waves at speed <em>v</em>. Maxwell's equations in vacuum reduce to this with <em>v = 1/√(μ₀ε₀) = c</em>.</>}>wave equation</Term>. The same manipulation on the second equation gives the same equation for B. Waves of E
        and B, propagating together through vacuum, with phase speed
      </p>
      <Formula>v = 1 / √(μ₀ ε₀)</Formula>
      <p>
        Maxwell plugged in the experimental values of μ₀ and ε₀ — the latter measured purely from electrostatics, the
        former from forces between current-carrying wires. He got 310,740,000 m/s by his 1865 numbers. Compared to
        Fizeau's 1849 toothed-wheel measurement of the speed of light (315,000,000 m/s), the agreement was extraordinary
        for the era. Maxwell wrote, in <em>A Dynamical Theory of the Electromagnetic Field</em>, that the agreement
        "seems to show that light and magnetism are affections of the same substance, and that light is an electromagnetic
        disturbance"<Cite id="maxwell-1865" in={SOURCES} />.
      </p>

      <CFromMaxwellDemo />

      <p>
        With modern CODATA values<Cite id="codata-2018" in={SOURCES} />, the calculated speed matches the measured speed
        to within the experimental uncertainty. After the 1983 SI redefinition, the speed of light is exact by
        definition; the relation <InlineMath>c = 1/√(ε₀ μ₀)</InlineMath> is now what locks ε₀ to μ₀, not the other way around.
        Hertz produced and detected radio-frequency electromagnetic waves in 1887, confirming Maxwell directly
        <Cite id="hertz-1888" in={SOURCES} />.
      </p>

      <TryIt
        tag="Try 10.5"
        question={
          <>Compute the propagation speed <em>c = 1/√(μ₀ ε₀)</em> directly from the modern values of the two constants.</>
        }
        hint="μ₀ ≈ 1.257×10⁻⁶ T·m/A, ε₀ ≈ 8.854×10⁻¹² F/m."
        answer={
          <>
            <p>
              Use CODATA values<Cite id="codata-2018" in={SOURCES} />: <em>μ₀</em> = 1.25664×10⁻⁶ T·m/A,
              <em> ε₀</em> = 8.8542×10⁻¹² F/m. Then
            </p>
            <Formula>μ₀ ε₀ = 1.25664×10⁻⁶ × 8.8542×10⁻¹² ≈ 1.1127×10⁻¹⁷ s²/m²</Formula>
            <Formula>c = 1 / √(1.1127×10⁻¹⁷) ≈ 2.998×10⁸ m/s</Formula>
            <p>
              Exactly the speed of light — <strong>2.998×10⁸ m/s</strong> — falling out of two constants measured by
              electrostatic and magnetostatic experiments alone. The number that astonished Maxwell in 1865 is the same
              number you just got with a calculator<Cite id="maxwell-1865" in={SOURCES} />.
            </p>
          </>
        }
      />
      <p>
        Chapter&nbsp;7's electromagnetic waves are the natural sequel: they're solutions to the very wave equation we
        just derived. Everything from radio to X-rays, from photonics to wireless networks, from sunlight reaching your
        retina to the cosmic microwave background, lives in these four lines.
      </p>

      <CaseStudies
        intro="Three case studies that turn the four equations into verifiable hardware: the experiment that proved Maxwell, the demonstration that crossed an ocean, and the constellation that puts the four laws in your pocket."
      >
        <CaseStudy
          tag="Case 8.1"
          title="Hertz, 1887–1888 — the first verification"
          summary={<em>A spark gap, a resonant loop, and the laboratory production of the waves Maxwell had predicted twenty-three years earlier.</em>}
          specs={[
            { label: 'Transmitter', value: 'Ruhmkorff coil + spark-gap dipole' },
            { label: 'Wavelength range', value: 'roughly 0.6 to 6 m' },
            { label: 'Frequency range', value: '~50 MHz to ~500 MHz' },
            { label: 'Detector', value: 'Resonant copper loop with micrometer spark gap' },
            { label: 'Standing-wave measurement', value: 'Reflection from a zinc sheet ~13 m from source' },
            { label: 'Inferred propagation speed', value: 'Consistent with c, within Hertz\'s ~10% error bars' },
          ]}
        >
          <p>
            Maxwell published the unified theory in 1865<Cite id="maxwell-1865" in={SOURCES} />. He died in 1879
            without having seen it tested at radio wavelengths. The experimental verification came from the
            Karlsruhe laboratory of <strong>Heinrich Hertz</strong>, who in 1887–1888 built the first deliberate
            electromagnetic-wave transmitter and detector and showed that the waves obeyed every prediction the
            four equations made<Cite id="hertz-1888" in={SOURCES} />.
          </p>
          <p>
            The transmitter was an oscillating dipole — two metal rods with a small gap between them, charged by
            an induction coil until the gap broke down in a spark. Each spark damped-rang the rod-pair as a tuned
            LC oscillator at radio frequency, radiating a short burst of the kind of wave §5 of Chapter 7
            describes. The detector, a few metres away, was a resonant loop with its own micrometer gap; when the
            wave arrived, the induced EMF reached breakdown and a tiny secondary spark jumped<Cite id="hertz-1888" in={SOURCES} />.
          </p>
          <p>
            Hertz did three things with the apparatus, each of which was Maxwell falling out clean. He measured
            the wavelength by reflecting the wave off a metal sheet and mapping the resulting standing-wave nodes
            (a millimetre ruler, two sparks, one weekend's work). He confirmed transverse polarization by rotating
            the detector loop. And — multiplying λ by the known f of the spark oscillator — he obtained a
            propagation speed consistent with c. The four equations had just become physics, not algebra.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 8.2"
          title="Marconi, 1901 — Maxwell crosses an ocean"
          summary={<em>12 December 1901: a three-dot Morse "S" from Poldhu, Cornwall, received on a kite-flown antenna at Signal Hill, Newfoundland.</em>}
          specs={[
            { label: 'Date', value: '12 December 1901' },
            { label: 'Path', value: 'Poldhu, Cornwall → Signal Hill, Newfoundland' },
            { label: 'Great-circle distance', value: '~3500 km' },
            { label: 'Transmitter type', value: 'Spark-gap, capacitor-driven, ~20 kW input' },
            { label: 'Carrier wavelength', value: '~366 m (estimated ~820 kHz, MF band)' },
            { label: 'Receiver antenna', value: '~150 m wire on a kite' },
          ]}
        >
          <p>
            Thirteen years after Hertz, <strong>Guglielmo Marconi</strong> wagered that Maxwell's waves would
            travel over the horizon — that the curvature of the Earth would not, in fact, stop them. On
            12 December 1901 he and his assistant George Kemp received what they reported as the Morse letter
            "S" (three dots) transmitted from his station at Poldhu, Cornwall, on a kite-flown wire antenna at
            Signal Hill in St. John's, Newfoundland<Cite id="hong-2001-wireless" in={SOURCES} />.
          </p>
          <p>
            Several things had to be true for the experiment to work, and all of them ride on Maxwell. The
            propagating wave had to be a real physical object that could carry coded information across thousands
            of kilometres of empty atmosphere — guaranteed by the wave equation derived from the four laws. The
            antenna had to convert oscillating current into far-field radiation — that's §5 of Chapter 7. The
            receiving antenna had to convert the arriving <strong>E</strong>-field back into a measurable current
            — Faraday's law in its open-circuit form. None of it should have surprised anyone who had read Maxwell;
            all of it was new in 1901, because no one had thought to try the experiment at that range
            <Cite id="hong-2001-wireless" in={SOURCES} />.
          </p>
          <p>
            Marconi did not know it at the time, but his signal travelled by bouncing off the
            <em> ionosphere</em>, an upper-atmospheric plasma layer whose refractive index becomes imaginary for
            radio frequencies below ~30 MHz. The reflection is itself a Maxwell-equations boundary problem. Within
            a decade, transatlantic radio was a working commercial service. Within thirty, it had broken the
            British Admiralty's monopoly on long-range signalling and rewired every navy.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 8.3"
          title="GPS — twenty-four satellites running on Maxwell's equations"
          summary={<em>1575.42 MHz, 20,200 km altitude, position to a few metres anywhere on Earth.</em>}
          specs={[
            { label: 'L1 carrier frequency', value: '1575.42 MHz' },
            { label: 'L1 wavelength', value: '~19 cm' },
            { label: 'Constellation', value: '~24+ active satellites in 6 orbital planes' },
            { label: 'Orbital altitude', value: '~20,200 km (≈12 sidereal-hour orbit)' },
            { label: 'Broadcast EIRP per satellite', value: '~27 dBW (≈500 W effective)' },
            { label: 'Received signal level at Earth', value: '~−130 dBm (below thermal noise)' },
          ]}
        >
          <p>
            Twenty-thousand kilometres above your head, two dozen-odd satellites broadcast a continuous,
            phase-coherent <strong>1575.42 MHz</strong> carrier modulated with a pseudo-random ranging code
            <Cite id="kaplan-hegarty-2017" in={SOURCES} />. Your phone's GPS receiver listens for at least four of
            them, correlates the codes to recover travel time, and trilaterates a position. The whole edifice is
            <em> Maxwell's equations in action</em>: a transmitted plane wave, a free-space path-loss budget set
            by the wave's <InlineMath>1/r²</InlineMath> intensity fall-off, a receiver antenna obeying the
            reciprocity theorem.
          </p>
          <p>
            The numbers force respect. The received signal at the ground is around <strong>−130 dBm</strong> —
            roughly <InlineMath>10⁻¹⁶</InlineMath> watts, well below the receiver's thermal noise floor. GPS
            works only because the pseudo-random code provides ~43 dB of processing gain when correlated against
            the receiver's local replica. That a planet's worth of users can be located to within metres using a
            signal weaker than the static in their headphones is one of Maxwell's quieter triumphs.
          </p>
          <p>
            And the timing precision needed for it to work — nanoseconds per microsecond of round-trip — turns
            out to require <em>relativistic</em> corrections to the satellite clocks before launch. Chapter 9
            picks that thread up. Here it is enough to say: every "you are here" arrow on a map is, underneath,
            a confirmation that the four equations of §1 hold to twelve decimal places after they bounce off
            atmospheric refraction, orbital mechanics, and an EIRP budget that would have astonished Hertz.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 8.4"
          title="The 21 cm hydrogen line"
          summary={<em>1420.406 MHz: an atomic spin-flip transition that maps the galaxy.</em>}
          specs={[
            { label: 'Frequency', value: '1420.40575177 MHz' },
            { label: 'Wavelength', value: '21.106 cm' },
            { label: 'Transition', value: 'Hyperfine spin-flip of hydrogen 1s ground state' },
            { label: 'Predicted', value: 'H. C. van de Hulst, 1944' },
            { label: 'Detected', value: 'Ewen & Purcell, Harvard, 25 March 1951' },
            { label: 'Mean lifetime of the upper state', value: '~10⁷ years (forbidden M1 transition)' },
          ]}
        >
          <p>
            One of the most useful EM waves in all of astronomy is produced by neutral hydrogen atoms with
            essentially no help from any laboratory. In the 1s ground state of H, the electron's spin can be
            parallel or antiparallel to the proton's; the parallel configuration sits about
            <strong> 5.87 μeV</strong> higher. The forbidden magnetic-dipole transition between them has a mean
            lifetime around <strong>10⁷ years</strong>, but the interstellar medium contains so many hydrogen
            atoms — <InlineMath>~10⁶⁷</InlineMath> in the Milky Way alone — that the integrated emission is
            comfortably detectable from Earth<Cite id="ewen-purcell-1951" in={SOURCES} />.
          </p>
          <p>
            Hendrik van de Hulst predicted the line in 1944 from quantum mechanics applied to Maxwell's equations
            in the standard way — bound-state energies of a charged particle in a Coulomb potential, plus the
            hyperfine coupling to nuclear spin. <strong>Harold Ewen and Edward Purcell</strong> built a horn
            antenna on the roof of the Harvard physics building and detected it on 25 March 1951
            <Cite id="ewen-purcell-1951" in={SOURCES} />. Within a few years it was a primary mapping tool: galactic
            spiral arms, the rotation curves that pointed at dark matter, the cosmic 21-cm signal from the early
            universe.
          </p>
          <p>
            From the perspective of the four equations, the line is the cleanest possible Maxwell solution:
            an oscillating magnetic dipole moment radiating into vacuum at one fixed frequency, with the
            transverse plane-wave structure of §7. The reason it's so useful is the reason §7 emphasized: a
            wave at λ = 21 cm passes through interstellar dust that visible light cannot, so radio telescopes
            see structures hidden from optical ones.
          </p>
        </CaseStudy>
      </CaseStudies>

      <FAQ
        intro="Loose threads from the synthesis chapter — questions that tend to come up after reading the four equations side by side."
      >
        <FAQItem q="Why are there exactly four equations and not five or three?">
          <p>
            The four equations correspond to two physical fields (E and B) crossed with two ways a field can have a
            source (a divergence — flux out of a closed surface — or a curl — circulation around a closed loop). That's
            a 2×2 grid, hence four equations. The current asymmetry — only E has a charge source on the divergence side
            — is what would change if a magnetic monopole were found, but the four-equation structure itself reflects
            the structure of vector calculus on a three-dimensional manifold<Cite id="griffiths-2017" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Are Maxwell's equations linear? Why does that matter?">
          <p>
            Yes — in vacuum the equations are perfectly linear in <strong>E</strong> and <strong>B</strong>. That's why
            superposition works: shine two flashlights at each other and the beams pass through each other unaffected.
            Two charges? Add their fields. Two radio signals on the same frequency? They simply sum. Linearity is what
            makes Fourier analysis work for EM waves, why antennas can transmit multiple frequencies at once, and why
            the whole signal-processing toolkit applies to electromagnetism without modification. (In matter, response
            can be nonlinear at high intensities; "nonlinear optics" exists because the polarizability of the medium
            itself starts to depend on field amplitude.)<Cite id="jackson-1999" in={SOURCES} />
          </p>
        </FAQItem>

        <FAQItem q="Where does charge conservation fit into the four laws?">
          <p>
            It's already there — built into the structure. Take the divergence of the Ampère–Maxwell equation and use
            Gauss for E: the result is <strong>∂ρ/∂t + ∇·J = 0</strong>, the continuity equation, which is exactly the
            statement that charge is locally conserved. In fact, this is the reason Maxwell <em>had</em> to add the
            displacement-current term: without it, the divergence of Ampère's right-hand side wouldn't match the
            divergence of the left, and charge conservation would fail in any non-steady situation
            <Cite id="feynman-II-18" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why is there a μ₀ε₀ but no 'G₀' gravitational equivalent?">
          <p>
            Because gravity, in its weak-field form, doesn't have an analogous curl law: Newtonian gravity has only the
            equivalent of Gauss's law (∇·g = −4πGρ). General relativity supplies the full nonlinear structure, and the
            speed of gravitational waves does fall out of Einstein's equations — and it equals c. So the analogy works,
            but only at the level of the full field theory, not at the level of Newton's law. There's no single
            "gravitational ε₀" because the constant G plays the role of both source-strength and propagation-speed
            normalization<Cite id="jackson-1999" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What does 'displacement current' actually displace?">
          <p>
            Nothing. The name is a historical fossil from Maxwell's mechanical model of the ether, in which he
            imagined real charges being slightly displaced inside a dielectric medium that filled empty space. The
            ether is gone, the displacement is gone, but the term name survives. What's left is the operative
            mathematical fact: a time-varying electric flux contributes to the magnetic circulation, exactly like a
            conduction current does. It's a current in the bookkeeping sense — same units, same role in the equation —
            but not a flow of anything<Cite id="maxwell-1865" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Have we ever seen a magnetic monopole?">
          <p>
            No. Searches have included cosmic-ray detectors, accelerator experiments, ancient meteorites scanned with
            SQUIDs, and large-scale dedicated experiments like MoEDAL at the LHC. The result, every time: no
            confirmed monopole. The current experimental upper bound on monopole flux is small enough that they must
            be either extraordinarily rare or extraordinarily heavy<Cite id="griffiths-2017" in={SOURCES} />. Dirac
            showed in 1931 that the existence of even one monopole anywhere in the universe would explain why electric
            charge is quantized — making their absence one of physics's open puzzles.
          </p>
        </FAQItem>

        <FAQItem q="What would change if we did find one?">
          <p>
            The second equation would gain a source term: <strong>∮B·dA = μ₀ Q<sub>m,enc</sub></strong>, and Faraday's
            law would gain a "magnetic current" term symmetric to the conduction-current term in Ampère–Maxwell. The
            theory becomes perfectly symmetric under the duality E ↔ cB. Nothing else has to change. The practical
            consequence: a brand-new kind of stable, very massive particle exists, and the constraint of electric-charge
            quantization gets a deep explanation<Cite id="jackson-1999" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Is the symmetry between E and B perfect, or does the monopole asymmetry break it?">
          <p>
            In vacuum, far from any sources, the symmetry is perfect — swap E for cB and B for −E/c and the source-free
            Maxwell equations are invariant. With sources, the asymmetry shows up only in <em>which</em> sources exist:
            we have electric charges and currents, no magnetic ones. The mathematical structure could accommodate both
            symmetrically; nature just hasn't supplied the second kind. This is one of those rare situations where the
            theory is more symmetric than the universe<Cite id="griffiths-2017" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Could the four laws be wrong? How would we know?">
          <p>
            Classical Maxwell electromagnetism is wrong at very short distances (where quantum electrodynamics is
            needed) and at very strong fields (where vacuum polarization causes nonlinear corrections). Within their
            classical domain, though, the equations are checked routinely to extreme precision — GPS, particle
            accelerators, radio astronomy, semiconductor design, the whole apparatus of modern physics. If a deviation
            existed at our energy scales, it would have shown up in some experiment by now. The boundary is sharp:
            Maxwell holds beautifully until quantum effects matter, then QED takes over and Maxwell falls out as the
            classical limit<Cite id="jackson-1999" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Are Maxwell's equations true in curved spacetime, near a black hole?">
          <p>
            Yes, in their covariant form. Written using the electromagnetic field tensor <strong>F<sup>μν</sup></strong>
            and the covariant derivative, Maxwell's equations carry directly over to curved spacetime. The integral
            form we showed above is the flat-spacetime specialization; in curved spacetime the surfaces, loops, and
            derivatives all gain metric corrections, and light bends along null geodesics. The structure of "four
            equations" is preserved — in tensor notation it becomes only two<Cite id="jackson-1999" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What's the role of ε₀ and μ₀ — are they fundamental, or arbitrary unit choices?">
          <p>
            More the second than the first. In SI units, ε₀ and μ₀ are unit-conversion constants between the electrical
            quantities (charge, current) and the mechanical ones (force, length) that they happen to enter into equations
            with. In Gaussian units, both are absent — there's just <em>c</em>. The combination that's truly physical is
            the fine-structure constant <strong>α = e²/(4πε₀ ℏ c)</strong>, which is dimensionless and equals roughly
            1/137. Everything ε₀ and μ₀ tell you, dimensionally, can be repackaged into α and the speed of light
            <Cite id="codata-2018" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="After the 2019 SI redefinition, are ε₀ and μ₀ still exact?">
          <p>
            No — and this is a recent change. Before 2019, μ₀ was defined to be exactly 4π×10⁻⁷ T·m/A and ε₀ was exact
            via ε₀ = 1/(μ₀ c²). After the 2019 SI revision, the elementary charge <em>e</em>, Planck's constant
            <em> h</em>, the Boltzmann constant <em>k</em>, and the Avogadro number became the exact defining constants.
            ε₀ and μ₀ are now experimentally determined quantities, tied to the measured value of the fine-structure
            constant α. The numerical change is tiny — about 2×10⁻¹⁰ relative — but conceptually it flipped them from
            "definitions" to "measurements"<Cite id="codata-2018" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why isn't there a 'Faraday's law for B' that involves dE/dt?">
          <p>
            There is — that's the Ampère–Maxwell law. The fourth equation, with the displacement-current term, says
            exactly that a changing E sources a circulating B. It's not labelled "Faraday for B" by historical accident
            (Faraday was about induction in coils, where the changing thing is B). But mathematically, the two curl
            equations are mirror twins: changing B makes E loop; changing E makes B loop. The only difference is
            the minus sign in Faraday, which encodes Lenz / energy conservation, and the μ₀ε₀ factor on the Ampère–Maxwell
            side<Cite id="feynman-II-18" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why does the wave equation predict the speed of LIGHT — wasn't Maxwell just doing electricity?">
          <p>
            That was Maxwell's astonishment too. He was doing electricity and magnetism, derived the wave equation
            from his completed set of four laws, looked at the propagation speed, and realized it matched the
            independently-measured speed of light to within experimental error. From <em>A Dynamical Theory of the
            Electromagnetic Field</em>: the agreement of the numbers <em>"seems to show that light and magnetism are
            affections of the same substance"</em><Cite id="maxwell-1865" in={SOURCES} />. Until that moment, optics
            and electromagnetism were separate subjects. After it, they were the same subject.
          </p>
        </FAQItem>

        <FAQItem q="Can you derive Coulomb's law from Maxwell's equations?">
          <p>
            Yes — it's a direct consequence of Gauss's law for E plus the assumption of spherical symmetry around a
            point source. Draw a sphere of radius r centred on the charge; by symmetry E is radial and constant on
            the sphere; the integral <strong>∮E·dA = E·4πr²</strong> equals <strong>Q/ε₀</strong>; solve for
            <strong> E = Q/(4πε₀ r²)</strong>; multiply by a test charge q to get the force. Coulomb's 1785 inverse-square
            law falls out of the more general law without further assumption<Cite id="griffiths-2017" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Could you replace the four equations with a single one using tensors / four-vectors?">
          <p>
            With four-vectors, four becomes two; with differential forms or fully covariant tensor notation, two becomes
            one. Defining the electromagnetic field tensor <strong>F<sup>μν</sup></strong>, Maxwell's equations
            collapse to <strong>∂<sub>μ</sub>F<sup>μν</sup> = μ₀ J<sup>ν</sup></strong> (the two source equations) and
            <strong> ∂<sub>[α</sub>F<sub>βγ]</sub> = 0</strong> (the two source-free equations, an algebraic Bianchi
            identity). In the language of differential forms, the second pair becomes <strong>dF = 0</strong> and the
            first <strong>d⋆F = J</strong>. None of this changes the physics, but it makes the relativistic structure
            of electromagnetism manifest — and it's the form that generalizes cleanly to curved spacetime
            <Cite id="jackson-1999" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="How does QED relate to these — is QED just Maxwell + quantization?">
          <p>
            Close, but with a twist. Quantum electrodynamics promotes the classical field <strong>F<sup>μν</sup></strong>
            to a quantum operator, treats the photon as the quantum of the field, and replaces classical charged sources
            with quantized matter fields (electrons, positrons). The result is one of the most precisely-tested theories
            in all of science — the electron's anomalous magnetic moment is predicted by QED to twelve decimal places
            of accuracy. In the classical limit, where field quanta are numerous enough that you can ignore individual
            photons, QED reduces to Maxwell. So Maxwell's equations are the classical limit of QED, not its opposite
            <Cite id="feynman-II-18" in={SOURCES} />.
          </p>
        </FAQItem>
      </FAQ>
    </ChapterShell>
  );
}
