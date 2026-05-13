/**
 * Chapter 7 — Electromagnetic waves
 *
 * Sequel to Ch.6: take the Poynting picture, remove the absorbing conductor,
 * and ask what the field does in empty space. Maxwell's prediction → plane
 * waves → polarization → radiation from accelerating charges → energy and
 * momentum → the spectrum.
 *
 * Five embedded demos:
 *   7.1 SpeedOfLight       — v = 1/√(εᵣ μᵣ ε₀ μ₀); slider for the medium
 *   7.2 PlaneWave          — E ⊥ B ⊥ k, in phase, |B| = |E|/c
 *   7.3 Polarization       — linear / circular / elliptical, looking down k̂
 *   7.4 OscillatingDipole  — sin²θ pattern; ω slider; λ = c/f
 *   7.5 RadiationPressure  — P = I/c; solar-constant default
 */
import { CaseStudies, CaseStudy } from '@/components/CaseStudy';
import { ChapterShell } from '@/components/ChapterShell';
import { FAQ, FAQItem } from '@/components/FAQ';
import { Cite } from '@/components/SourcesList';
import { Formula, InlineMath } from '@/components/Formula';
import { Term } from '@/components/Term';
import { TryIt } from '@/components/TryIt';
import { OscillatingDipoleDemo } from './demos/OscillatingDipole';
import { PlaneWaveDemo } from './demos/PlaneWave';
import { PolarizationDemo } from './demos/Polarization';
import { RadiationPressureDemo } from './demos/RadiationPressure';
import { SpeedOfLightDemo } from './demos/SpeedOfLight';
import { getChapter } from './data/chapters';

export default function Ch9EMWaves() {
  const chapter = getChapter('em-waves')!;
  const SOURCES = chapter.sources;

  return (
    <ChapterShell chapter={chapter}>
      <p>
        Chapter&nbsp;6 left us with an unsettling picture. Energy doesn't ride down the wire; it flows through the empty space
        beside the wire, the field carrying it, the copper just absorbing it where it ends. Now take a pair of scissors to the
        last part. <em>Remove the wire.</em> What stops? Nothing, it turns out. The field still carries energy. The flow just
        has nowhere to land — so it keeps going, outward, forever, at one specific speed.
      </p>
      <p>
        That is a wave. Maxwell predicted it in 1865, from the four equations he'd just finished collecting<Cite id="maxwell-1865" in={SOURCES} />.
        Heinrich Hertz produced and detected it in his laboratory in 1887, confirming the prediction at radio
        wavelengths<Cite id="hertz-1888" in={SOURCES} />. Everything in your wireless world — radio, microwaves, infrared
        heaters, visible light, X-rays, gamma rays — is the same{' '}
        <Term def={<><strong>electromagnetic wave</strong> — a self-sustaining oscillation of <em>E</em> and <em>B</em> fields in vacuum, mutually perpendicular and in phase, propagating at the speed of light c.</>}>electromagnetic wave</Term>, the same physical object the Poynting flux was always pointing toward.
        This chapter is what it looks like once it gets to leave the wire behind.
      </p>

      <h2>Strip the <em>wire</em></h2>

      <p>
        Ch.6's punchline was that energy travels through the space around a conductor as
        <strong> S = (1/μ₀) E × B</strong>, the Poynting vector, and lands wherever there's a resistive medium to absorb it.
        The flow is a property of the field, not of the conductor. What happens, then, if the absorbing conductor isn't
        there? If the field exists in vacuum — no copper, no battery, no resistor, just <strong>E</strong> and
        <strong> B</strong> at some point in space — what's the flow doing?
      </p>
      <p>
        It's still doing what Poynting's expression says<Cite id="poynting-1884" in={SOURCES} />. <strong>S</strong> is a
        property of <strong>E</strong> and <strong>B</strong> alone, not of the medium they live in. The energy
        density of the field, also written down by Poynting and Maxwell, is
      </p>
      <Formula>u = ½ ε₀ |E|² + (1 / 2μ₀) |B|²</Formula>
      <p>
        and the local conservation law is <InlineMath>∂u/∂t + ∇·S = 0</InlineMath> in empty space — energy in a region
        either stays put or flows out through the boundary as <strong>S</strong><Cite id="jackson-1999" in={SOURCES} />.
        Take a hand-sized region of empty space and stir up a field in it. The field cannot just sit there; energy at the
        boundary has to balance. The way nature solves that constraint is to let the field propagate outward.
      </p>

      <h2>Maxwell's 1865 <em>prediction</em></h2>

      <p>
        Chapter&nbsp;8 will collect Maxwell's four equations cleanly on one page. For now we only need two of them, and
        the trick that links them. Faraday's law says a changing magnetic field produces an electric field that curls
        around it:
      </p>
      <Formula>∇ × E = − ∂B/∂t</Formula>
      <p>
        Ampère's law, with Maxwell's displacement-current correction, says the converse — a changing electric field
        produces a magnetic field that curls around it<Cite id="maxwell-1865" in={SOURCES} />:
      </p>
      <Formula>∇ × B = μ₀ ε₀ ∂E/∂t</Formula>
      <p>
        (In vacuum, with no real currents.) Take the curl of the first equation, plug in the second on the right-hand
        side, and use a standard vector identity. After a few lines of algebra what falls out is a clean second-order
        partial differential equation<Cite id="griffiths-2017" in={SOURCES} /><Cite id="jackson-1999" in={SOURCES} />:
      </p>
      <Formula>∇²E = μ₀ ε₀ ∂²E/∂t²</Formula>
      <p>
        And the identical equation for <strong>B</strong>. This is the{' '}
        <Term def={<><strong>wave equation</strong> — a second-order PDE of the form <em>∇²ψ = (1/v²) ∂²ψ/∂t²</em> whose solutions propagate at speed <em>v</em>. For EM waves in vacuum, <em>v = 1/√(μ₀ε₀) = c</em>.</>}>wave equation</Term>, and it has a
        propagation speed sitting right there in the coefficient: <InlineMath>v² = 1/(μ₀ ε₀)</InlineMath>. Plug in the
        measured values of the two constants — ε₀ = 8.854×10⁻¹² F/m and μ₀ = 1.257×10⁻⁶ T·m/A — and you get
        <strong> v = 2.998×10⁸ m/s</strong><Cite id="codata-2018" in={SOURCES} />. Which is, to six figures, the speed of light
        measured by Fizeau and Foucault decades earlier. Maxwell wrote, in 1865: <em>"We can scarcely avoid the inference that
        light consists in the transverse undulations of the same medium which is the cause of electric and magnetic
        phenomena."</em><Cite id="maxwell-1865" in={SOURCES} />
      </p>

      <SpeedOfLightDemo />

      <p>
        Drop a relative permittivity εᵣ and a relative permeability μᵣ into the same calculation — that is, put the
        wave inside a material — and the speed becomes <InlineMath>v = 1/√(εᵣ μᵣ ε₀ μ₀) = c/√(εᵣ μᵣ)</InlineMath>. The
        slowdown factor <InlineMath>n = √(εᵣ μᵣ)</InlineMath> is exactly what every introductory optics course calls
        the{' '}
        <Term def={<><strong>refractive index</strong> — the dimensionless factor by which a medium slows light, <em>n = c/v = √(εᵣμᵣ)</em>. Air ≈ 1.0003, water ≈ 1.33, glass ≈ 1.5, diamond ≈ 2.4.</>}>refractive index</Term><Cite id="griffiths-2017" in={SOURCES} />. Window glass has εᵣ ≈ 2.25 and μᵣ ≈ 1, so light in
        glass travels at c/1.5. The whole edifice of refraction — Snell's law, lenses, fibre optics — is sitting in that
        one square root.
      </p>

      <TryIt
        tag="Try 9.1"
        question={
          <>What is the speed of light inside ordinary window glass, for which <strong>n = 1.5</strong>?</>
        }
        hint="v = c/n; use c = 2.998×10⁸ m/s."
        answer={
          <>
            <p>
              From <em>v = c/n</em> with <em>c</em> = 2.998×10⁸ m/s<Cite id="codata-2018" in={SOURCES} />:
            </p>
            <Formula>v = (2.998×10⁸) / 1.5 = 1.999×10⁸ m/s</Formula>
            <p>
              About <strong>2.0×10⁸ m/s</strong>, or two-thirds the vacuum speed — the same "⅔ c" that appears in
              copper-coaxial signal propagation throughout this book<Cite id="griffiths-2017" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2>What the wave <em>looks like</em></h2>

      <p>
        The plane-wave solution to ∇²E = (1/c²) ∂²E/∂t² is the simplest possible thing: a sinusoidal disturbance
        travelling in one direction. Write it in coordinates, with the wave moving in <strong>+x</strong>:
      </p>
      <Formula>E(x, t) = E₀ sin(k x − ω t) ŷ</Formula>
      <p>
        where k is the wavenumber, ω the angular frequency, and the wave's phase speed is
        <InlineMath>v = ω/k</InlineMath>. Plug this into Maxwell's equations and three facts fall out immediately
        <Cite id="griffiths-2017" in={SOURCES} />. First, <strong>E</strong> is{' '}
        <Term def={<><strong>transverse</strong> — oscillating perpendicular to the direction of propagation. EM waves in vacuum are transverse; sound waves in air are longitudinal (oscillating along the propagation direction).</>}>transverse</Term> — perpendicular to the
        direction of travel. (In our example, the wave moves in x and E points in y.) Second, the same equations
        force <strong>B</strong> to be perpendicular to both <strong>E</strong> and <strong>k̂</strong>, so
        in our example B points in z. Third, the ratio of their amplitudes is fixed:
      </p>
      <Formula>|B| = |E| / c</Formula>
      <p>
        And they oscillate in phase — both reach their peak at the same time and the same place. The whole picture
        rolls forward together at speed c.
      </p>

      <PlaneWaveDemo />

      <p>
        <Term def={<><strong>Wavelength</strong> (λ) — the spatial period of a wave, the distance between successive crests. SI units metres.</>}>Wavelength</Term> λ and{' '}
        <Term def={<><strong>frequency</strong> (f) — the number of full oscillations per second, in hertz (1 Hz = 1 cycle/s). Related to wavelength by <em>λ f = v</em>.</>}>frequency</Term> f obey the universal <InlineMath>λ f = c</InlineMath>. A 1 GHz radio wave has
        λ = 30 cm. Yellow light at 5×10¹⁴ Hz has λ ≈ 600 nm. An X-ray at 10¹⁸ Hz has λ ≈ 0.3 nm. Same wave equation,
        same speed; different λ.
      </p>

      <TryIt
        tag="Try 9.2"
        question={
          <>Wi-Fi (and a microwave oven's magnetron) operate near <strong>2.4 GHz</strong>. What is the wavelength of that
          wave in air?</>
        }
        hint="λ = c/f, with c ≈ 3.00×10⁸ m/s."
        answer={
          <>
            <p>
              Use <em>λ = c/f</em><Cite id="codata-2018" in={SOURCES} />:
            </p>
            <Formula>λ = (2.998×10⁸ m/s) / (2.4×10⁹ Hz) ≈ 0.125 m</Formula>
            <p>
              About <strong>12.5 cm</strong> — comparable to the width of your hand, and roughly half the cavity of a
              microwave oven (which is why the standing-wave nodes are spaced a few centimetres apart and the turntable
              exists)<Cite id="buffler-1993" in={SOURCES} />.
            </p>
          </>
        }
      />

      <TryIt
        tag="Try 9.3"
        question={
          <>Green light has a wavelength of about <strong>530 nm</strong> in vacuum. What is its frequency?</>
        }
        hint="f = c/λ."
        answer={
          <>
            <p>
              Convert 530 nm to metres: 5.30×10⁻⁷ m. Then<Cite id="codata-2018" in={SOURCES} />:
            </p>
            <Formula>f = (2.998×10⁸) / (5.30×10⁻⁷) ≈ 5.66×10¹⁴ Hz</Formula>
            <p>
              About <strong>5.7×10¹⁴ Hz</strong>, or 570 terahertz — the wave equation, run at a third of a million times the
              speed of the fastest oscilloscope on Earth<Cite id="feynman-II-21" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2><em>Polarization</em></h2>

      <p>
        Once you know <strong>E</strong> is transverse to the propagation direction, the next question is which
        transverse direction it points. That direction is the wave's{' '}
        <Term def={<><strong>polarization</strong> — the direction of oscillation of the <em>E</em>-field in a transverse wave. Linear: E oscillates along a fixed line. Circular: E rotates at the wave frequency. Elliptical: anything in between.</>}>polarization</Term>. A linearly
        polarized wave has its <strong>E</strong> oscillating along one fixed line (the line might be vertical,
        horizontal, or tilted). A circularly polarized wave has its <strong>E</strong> rotating in a circle at the
        wave's frequency — produced by superposing two perpendicular linear components 90° out of phase. Anything in
        between those two limits is elliptical polarization.
      </p>

      <PolarizationDemo />

      <p>
        Polarization is what 3D glasses, polarized sunglasses, and LCD displays manipulate. A polarized sunglass lens
        is a sheet of molecules aligned along one axis that absorbs the <strong>E</strong>-component along that axis
        and lets through the perpendicular one — so glare off horizontal water, which is mostly horizontally polarized,
        gets blocked while the rest of the scene passes through. An antenna's orientation matters for the same reason:
        a half-wave dipole picks up only the <strong>E</strong>-component aligned with its long axis.
      </p>
      <p className="pullout">
        A wave is what a field does when it has nowhere to go and nothing to push on.
      </p>

      <h2><em>Radiation</em>: where waves come from</h2>

      <p>
        A static charge does not radiate — its field is the static Coulomb field, dropping off as 1/r², no waves.
        A steady current does not radiate either — its magnetic field is the static Biot–Savart field, also static,
        also no waves. What it takes to send out an electromagnetic wave is <em>acceleration</em>. A charge that
        changes velocity emits a wave; if it accelerates back and forth periodically, it emits a periodic wave
        <Cite id="feynman-II-21" in={SOURCES} />.
      </p>
      <p>
        The simplest radiating source is the{' '}
        <Term def={<><strong>oscillating dipole</strong> — two opposite charges whose separation varies sinusoidally in time, or equivalently a sinusoidal current on a short antenna. The canonical radiating source; its far-field intensity goes as <em>sin²θ / r²</em>.</>}>oscillating dipole</Term> — a pair of opposite charges whose
        separation wobbles in time, equivalently a current oscillating along a short antenna. The far-field intensity
        radiated by such a dipole follows a clean angular pattern:
      </p>
      <Formula>I(θ) ∝ sin²θ / r²</Formula>
      <p>
        where θ is measured from the dipole's axis<Cite id="feynman-II-21" in={SOURCES} /><Cite id="jackson-1999" in={SOURCES} />.
        The pattern has a maximum perpendicular to the dipole (θ = 90°, the equator) and goes to <em>exactly zero</em>
        along the dipole's own axis (θ = 0 and θ = π). An antenna does not radiate along its own length.
      </p>

      <OscillatingDipoleDemo />

      <p>
        This is what Hertz built and confirmed in 1887. A spark-gap oscillator drove a short antenna at radio
        frequencies; a resonant loop a few metres away detected the radiated wave by its own induced spark. Hertz
        measured wavelengths from standing-wave patterns between parallel reflectors and arrived at a propagation
        speed consistent with c — the first experimental verification that Maxwell's predicted waves were
        real<Cite id="hertz-1888" in={SOURCES} />. The technology that runs on this discovery, two-and-a-half
        generations later, fills your pockets.
      </p>

      <h2>Energy and <em>momentum</em> in a wave</h2>

      <p>
        The Poynting expression from Ch.6 still applies, with <strong>E</strong> and <strong>B</strong> now the
        oscillating wave fields. For a plane wave with <InlineMath>|B| = |E|/c</InlineMath>:
      </p>
      <Formula>|S| = (1/μ₀) |E × B| = (1/μ₀) E² / c = ε₀ c E²</Formula>
      <p>
        (using <InlineMath>1/(μ₀ c) = ε₀ c</InlineMath>, which follows from <InlineMath>c² = 1/(μ₀ ε₀)</InlineMath>.)
        The instantaneous flux oscillates at twice the wave frequency; the time-averaged intensity is
      </p>
      <Formula>⟨I⟩ = ½ ε₀ c E₀²</Formula>
      <p>
        where E₀ is the wave's peak amplitude<Cite id="griffiths-2017" in={SOURCES} />. Sunlight at Earth's distance
        delivers <strong>⟨I⟩ ≈ 1361 W/m²</strong> — the solar constant, the quantity every solar-panel calculation
        starts from.
      </p>
      <p>
        Maxwell's theory makes a second, sharper prediction: the wave carries not just energy but
        <strong> momentum</strong>, in the ratio <InlineMath>p = U/c</InlineMath><Cite id="jackson-1999" in={SOURCES} />.
        A wave depositing energy on an absorbing surface deposits momentum too, and that's a{' '}
        <Term def={<><strong>radiation pressure</strong> — the force per unit area exerted by an EM wave on an absorbing or reflecting surface. <em>P = I/c</em> for full absorption, <em>P = 2I/c</em> for full reflection. SI units Pa (N/m²).</>}>pressure</Term>:
      </p>
      <Formula>P = I / c   (absorbing surface)</Formula>
      <p>
        For a perfectly reflecting surface the momentum reverses, doubling the kick: P = 2I/c. Solar sunlight on a black
        absorber: 1361 / 3×10⁸ ≈ <strong>4.5×10⁻⁶ Pa</strong>. About four-and-a-half micropascals. Real, measurable,
        and — over thousands of square metres and weeks — enough to accelerate a solar sail to interplanetary speeds.
      </p>

      <RadiationPressureDemo />

      <TryIt
        tag="Try 9.4"
        question={
          <>A <strong>1 kW/m²</strong> laser beam hits a perfect absorber. What is the radiation pressure on the absorber?</>
        }
        hint="P = I/c for a perfect absorber. Use c ≈ 3.00×10⁸ m/s."
        answer={
          <>
            <p>
              For an absorbing surface, the wave's momentum flux deposits as pressure<Cite id="jackson-1999" in={SOURCES} />:
            </p>
            <Formula>P = I / c = (1000) / (2.998×10⁸) ≈ 3.34×10⁻⁶ Pa</Formula>
            <p>
              About <strong>3.3 μPa</strong> — eleven orders of magnitude below atmospheric pressure. Yet integrated over
              the 200 m² polyimide sail of JAXA's IKAROS spacecraft, the same order of pressure delivers a measurable
              ~1 mm/s/day acceleration in deep space<Cite id="tsuda-2013-ikaros" in={SOURCES} />.
            </p>
          </>
        }
      />

      <TryIt
        tag="Try 9.5"
        question={
          <>Radio signals from a lunar mission travel to Earth across roughly <strong>384,000 km</strong>. How long does
          one trip take?</>
        }
        hint="Δt = d/c."
        answer={
          <>
            <p>
              Convert the distance: <em>d</em> = 3.84×10⁸ m. Then with <em>c</em> = 2.998×10⁸ m/s<Cite id="codata-2018" in={SOURCES} />:
            </p>
            <Formula>Δt = (3.84×10⁸) / (2.998×10⁸) ≈ 1.28 s</Formula>
            <p>
              About <strong>1.28 seconds</strong> one-way, ~2.6 s round-trip. The audible delay between Mission Control
              and the Apollo astronauts in 1969 was exactly this: a wave equation, integrated across vacuum, at one
              specific speed<Cite id="hertz-1888" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2>The <em>spectrum</em></h2>

      <p>
        One wave equation, one speed, one structure: all of it is the same physics, distinguished only by wavelength. The
        electromagnetic{' '}
        <Term def={<><strong>spectrum</strong> — the full range of EM-wave wavelengths, from kilometre-scale radio down to sub-picometre gamma rays. One wave equation, one propagation speed, many λ.</>}>spectrum</Term> covers
        radio (λ from kilometres down to centimetres), microwaves (cm down to mm), infrared (mm down to ~700 nm),
        visible light (~400–700 nm), ultraviolet (~400 nm down to ~10 nm), X-rays (~10 nm down to ~0.01 nm), gamma
        rays (shorter still). The way a wave interacts with matter depends sharply on λ — radio passes through walls,
        visible light scatters off them, X-rays go through soft tissue and stop at bone, gamma rays go through almost
        anything — but the underlying object is identical<Cite id="feynman-II-21" in={SOURCES} />.
      </p>
      <p>
        That identity is the most important lesson of this chapter. Light is not a different kind of thing from radio.
        Your eye and a Wi-Fi antenna are the same kind of detector tuned to different λ. The field that lights the
        room is the field that carries your phone signal is the field that an X-ray machine uses to photograph your
        hand. Strip the wire, and what's left is everything else.
      </p>

      <CaseStudies
        intro="Four real engineering systems, all running on solutions of the same wave equation. Different λ, different hardware, identical physics."
      >
        <CaseStudy
          tag="Case 7.1"
          title="The microwave oven"
          summary={<em>A 2.45 GHz standing wave, dumped into the dielectric loss of liquid water.</em>}
          specs={[
            { label: 'Frequency f', value: '2.450 GHz (ISM band)' },
            { label: 'Wavelength in air λ = c/f', value: '~12.2 cm' },
            { label: 'Magnetron output power', value: '700–1100 W (typical home unit)' },
            { label: 'Photon energy ℏω', value: '~10⁻⁵ eV (far below any chemical bond)' },
            { label: 'εᵣ of liquid water near 2.45 GHz', value: '~78 (real), ~10 (imaginary loss)' },
          ]}
        >
          <p>
            A magnetron drives the oven's cavity at <strong>2.450 GHz</strong>, one of the
            internationally reserved <em>industrial, scientific and medical</em> (ISM) bands set aside so that
            high-power radiators won't interfere with licensed communications<Cite id="buffler-1993" in={SOURCES} />.
            The cavity is a metal box one to two wavelengths on a side, so the field inside is a three-dimensional
            standing wave with nodes and antinodes spaced a few centimetres apart — which is exactly why every
            decent oven has a turntable.
          </p>
          <p>
            The mechanism is <strong>not a resonance with a water molecule</strong>. Liquid water has rotational
            transitions in the far infrared, several orders of magnitude above 2.45 GHz. The oven heats by
            <em> dielectric loss</em>: the oscillating <strong>E</strong>-field drags the permanent dipole moments
            of H₂O molecules back and forth against viscous friction with their neighbours. The complex permittivity
            <InlineMath> εᵣ = ε' − i ε''</InlineMath> has a broad <em>ε''</em> peak in the GHz band, and the power
            absorbed per unit volume is <InlineMath>P = ω ε₀ ε'' |E|²</InlineMath><Cite id="griffiths-2017" in={SOURCES} />.
            That formula is energy conservation: the Poynting flux into the food equals the rate at which the
            dipoles do work against intermolecular drag, and all of it ends up as heat.
          </p>
          <p>
            The choice of 2.45 GHz is an engineering compromise. Higher frequencies heat the surface preferentially
            (penetration depth scales with λ); much lower ones are inefficiently absorbed by typical food volumes.
            Industrial drying ovens often use 915 MHz (another ISM band) for thicker loads — same physics, deeper soak.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 7.2"
          title="Wi-Fi and 5G — same wave equation, three orders of magnitude apart"
          summary={<em>From 2.4 GHz home routers to 28 GHz mmWave cells: a frequency choice is a propagation choice.</em>}
          specs={[
            { label: 'Wi-Fi 6 (802.11ax) bands', value: '2.4, 5, and 6 GHz' },
            { label: 'λ at 2.4 GHz / 5 GHz', value: '~12.5 cm / ~6.0 cm' },
            { label: '5G FR2 (mmWave) range', value: '24.25–52.6 GHz' },
            { label: 'λ at 28 GHz', value: '~10.7 mm' },
            { label: 'Free-space path loss penalty, 28 GHz vs 2.4 GHz', value: '~21 dB (factor ~130) at the same range' },
          ]}
        >
          <p>
            Every Wi-Fi link is a textbook plane-wave transmission, slightly degraded by walls. The
            <strong> 802.11ax</strong> standard (Wi-Fi 6) defines operation in the 2.4 GHz ISM band, the 5 GHz
            UNII bands, and — since the 2020 FCC ruling — the 6 GHz band as well<Cite id="ieee-80211" in={SOURCES} />.
            At <strong>2.4 GHz</strong>, λ ≈ 12.5 cm, which diffracts comfortably around furniture and through
            drywall. At <strong>5 GHz</strong>, λ ≈ 6 cm; throughput climbs because more spectrum is available,
            but signal punches through fewer obstacles.
          </p>
          <p>
            Push by another order of magnitude and you reach 5G <em>millimetre-wave</em>: bands from
            <strong> 24–53 GHz</strong> with λ near a centimetre<Cite id="rappaport-2013-mmwave" in={SOURCES} />.
            Free-space loss scales as <InlineMath>(4π d / λ)²</InlineMath>, so a 28 GHz link suffers about
            <strong> 21 dB</strong> more loss than a 2.4 GHz link at the same distance — and atmospheric oxygen
            adds a 60 GHz absorption peak that effectively walls off another band. The trade-off is the wave
            equation's: shorter λ buys bandwidth and tighter beam-forming (an antenna a fixed size in metres is
            many wavelengths across at mmWave, hence highly directional) at the cost of range and obstacle
            penetration.
          </p>
          <p>
            The link budget is just Maxwell's <InlineMath>⟨I⟩ = ½ ε₀ c E₀²</InlineMath> from §6, integrated over
            an aperture. The protocol stack on top of it would be unrecognisable to Hertz; the physics underneath
            is what he measured in 1887<Cite id="hertz-1888" in={SOURCES} />.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 7.3"
          title="IKAROS — the first spacecraft driven by photon pressure"
          summary={<em>JAXA, 2010: a 14 m square of polyimide film, accelerated through interplanetary space by sunlight alone.</em>}
          specs={[
            { label: 'Launch', value: '21 May 2010, H-IIA F17, Tanegashima' },
            { label: 'Sail size', value: '20 m × 20 m polyimide film' },
            { label: 'Sail thickness', value: '~7.5 μm' },
            { label: 'Demonstrated acceleration at ~1 AU', value: '~1.12 mm/s per day' },
            { label: 'Solar constant at 1 AU', value: '1360.8 W/m²' },
            { label: 'Ideal P (full reflection)', value: '2 × 1361 / 3×10⁸ ≈ 9.1 μPa' },
          ]}
        >
          <p>
            <strong>IKAROS</strong> — Interplanetary Kite-craft Accelerated by Radiation Of the Sun — was JAXA's
            June 2010 demonstration that Maxwell's <strong>P = I/c</strong> works in deep space
            <Cite id="tsuda-2013-ikaros" in={SOURCES} />. After separation from the Akatsuki Venus orbiter, IKAROS
            unfurled a 20-metre-square polyimide sail by centrifugal-spin deployment and used the resulting
            radiation pressure as its only thrust during the Venus-flyby cruise.
          </p>
          <p>
            The numbers are sobering. At 1 AU the solar constant is <strong>1361 W/m²</strong>
            <Cite id="kopp-lean-2011" in={SOURCES} />. On a perfectly reflecting sail this gives
            <InlineMath> 2 I / c ≈ 9 × 10⁻⁶ Pa</InlineMath> — under ten micropascals. IKAROS's measured
            acceleration of ~1.12 mm/s per day matches what the integrated pressure over its ~200 m² area predicts
            for the sail's non-ideal reflectivity. Maxwell's 1865 prediction that an EM wave carries momentum
            <InlineMath> p = U/c</InlineMath><Cite id="maxwell-1865" in={SOURCES} /> stopped being a curiosity and
            became a propulsion system.
          </p>
          <p>
            The implications scale: a sail of order 10⁴ m², kept thin, can in principle reach the outer planets
            without carrying reaction mass. Sunlight runs out as <InlineMath>1/r²</InlineMath>, but
            <em> any</em> thrust beats <em>no</em> thrust in a vacuum, and the integrated <InlineMath>Δv</InlineMath>
            over a few years is enough to chase Mercury or push past Pluto.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 7.4"
          title="Röntgen's hand — X-rays as the short-wavelength end of the spectrum"
          summary={<em>8 November 1895: same wave equation, λ ≈ 10⁻¹⁰ m, and suddenly bones cast shadows.</em>}
          specs={[
            { label: 'Discovery', value: '8 Nov 1895, Würzburg' },
            { label: 'First medical radiograph', value: "22 Dec 1895 (Anna Bertha Röntgen's hand)" },
            { label: 'Diagnostic X-ray wavelength', value: '~0.01–0.1 nm (10–100 pm)' },
            { label: 'Photon energy range', value: '~10–100 keV' },
            { label: 'Frequency', value: '~3×10¹⁶ to 3×10¹⁹ Hz' },
          ]}
        >
          <p>
            Röntgen reported, in late 1895, <em>"a new kind of rays"</em> emerging from a cathode-ray tube wrapped
            in black cardboard — rays that fogged a photographic plate across the room and cast shadows of the
            bones of a hand placed between the tube and the plate<Cite id="rontgen-1895" in={SOURCES} />. He did
            not know what they were; he called them <em>X-Strahlen</em> for the unknown. Within a few months,
            European hospitals were taking diagnostic radiographs.
          </p>
          <p>
            We now know: same wave equation as visible light, wavelength roughly five orders of magnitude shorter
            (10⁻¹¹–10⁻¹⁰ m), <Term def={<><strong>photon</strong> — the quantum of the electromagnetic field. A wave of frequency <em>f</em> exchanges energy with matter in discrete packets of <em>E = h f = ℏω</em>. The classical wave description and the photon description are different scales of the same field.</>}>photon</Term> energy correspondingly larger (tens of keV). The penetration through soft
            tissue and absorption by bone come from §7 of this chapter — wavelength-dependent atomic response.
            At keV energies, photoelectric absorption scales roughly as <InlineMath>Z⁴/E³</InlineMath>; calcium
            (Z = 20) in bone soaks up far more X-ray than the carbon, hydrogen, oxygen, and nitrogen of soft
            tissue<Cite id="jackson-1999" in={SOURCES} />.
          </p>
          <p>
            Production is the dipole-radiation formula run in reverse. Electrons accelerated through ~100 kV
            slam into a tungsten anode; the sudden deceleration is exactly the "charge changing velocity"
            condition for radiation from §5<Cite id="feynman-II-21" in={SOURCES} />. The resulting
            <em> Bremsstrahlung</em> spectrum, plus tungsten's characteristic Kα and Kβ lines, is what every
            dental and chest X-ray uses. Maxwell to Röntgen to a broken finger on a Tuesday afternoon — one
            equation, three decades, several Nobel Prizes.
          </p>
        </CaseStudy>
      </CaseStudies>

      <FAQ
        intro="Loose threads on EM waves — the questions that surface after the first pass through Maxwell's prediction."
      >
        <FAQItem q="Why is the speed of light specifically 1/√(ε₀μ₀)? Was that planned, or did it fall out?">
          <p>
            It fell out. Maxwell wrote down displacement current in 1861 because Ampère's original law was inconsistent
            with charge conservation in time-varying situations<Cite id="maxwell-1865" in={SOURCES} />. He had no
            intention of predicting waves; he was patching a bookkeeping problem. Once the patched equations were
            combined, a wave equation simply popped out, with the speed
            <InlineMath>1/√(μ₀ ε₀)</InlineMath> sitting in the coefficient. When he plugged in the measured values of
            those two constants and got something within experimental error of the speed of light — measured by
            completely different optical experiments — he realised what he was looking at. The match between the
            electrical constants and the optical speed of light was the discovery, not the assumption
            <Cite id="griffiths-2017" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q='What does it mean for light to be "the same thing as" radio waves?'>
          <p>
            It means they are solutions of the same equation — Maxwell's wave equation — with different wavelengths.
            The structure is identical: a transverse oscillation of <strong>E</strong> and <strong>B</strong> in phase,
            propagating at c, with |B| = |E|/c. The differences are entirely about λ and how matter responds at that λ
            (eyes can be built to detect 500 nm but not 30 cm; aluminium reflects 30 cm but mostly transmits 10 nm
            X-rays). The wave itself is one physical object<Cite id="feynman-II-21" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="If accelerating charges radiate, why don't electrons in an atom just radiate themselves to a halt?">
          <p>
            Classically they would. An orbiting electron is accelerating constantly (centripetal acceleration), and by
            the dipole-radiation formula it should spiral into the nucleus in about 10⁻¹¹ seconds, radiating away its
            kinetic energy<Cite id="feynman-II-21" in={SOURCES} />. The fact that atoms exist at all was one of the
            major clues that classical electromagnetism was incomplete; quantum mechanics fixed it by quantising the
            allowed energy levels so that an electron in its ground state has nowhere lower to fall to. Quantum
            electrodynamics inherits the classical radiation formula in the appropriate limit — accelerated free
            charges radiate exactly as Maxwell said — but bound charges in stationary quantum states do not, because
            their charge distribution is stationary.
          </p>
        </FAQItem>

        <FAQItem q="Why is there no longitudinal EM wave, the way there's longitudinal sound?">
          <p>
            Maxwell's equations forbid it in vacuum. Take the divergence of E for a vacuum plane wave: Gauss's law
            says <InlineMath>∇·E = 0</InlineMath>, and for a wave of the form
            <InlineMath> E₀ sin(k·x − ω t)</InlineMath> this forces <strong>E</strong> to be perpendicular to
            <strong> k</strong>. The same argument forces <strong>B</strong> perpendicular to <strong>k</strong>. A
            longitudinal mode would have <strong>E</strong> parallel to <strong>k</strong>, which Gauss's law won't
            allow unless there's charge density driving it — and in vacuum there isn't. Sound is different because it's
            a compression wave in a real medium with bulk modulus; longitudinal modes carry the pressure variation.
            EM has no medium and no bulk modulus, so transverse is the only option<Cite id="griffiths-2017" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What is the difference between E and B in a wave — aren't they really the same thing?">
          <p>
            For plane waves in vacuum they are tightly linked: same frequency, same phase, |B| = |E|/c, mutually
            perpendicular. They carry the same time-averaged energy density (the ½ε₀E² and B²/(2μ₀) terms come out
            equal). In a real sense the wave is one object — the electromagnetic field — with two faces. The
            distinction between "the E part" and "the B part" only matters when you ask how the wave interacts with
            matter: charges respond directly to <strong>E</strong>, currents respond to <strong>B</strong>. Chapter 9
            makes the unification explicit: <strong>E</strong> and <strong>B</strong> are different components of a
            single rank-2 tensor that mixes them under a Lorentz boost<Cite id="jackson-1999" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="If |B| = |E|/c, isn't the magnetic part of the wave basically negligible?">
          <p>
            The numerical magnitude in SI units looks tiny — a 1 V/m electric field comes paired with only ~3×10⁻⁹ T
            of magnetic field — but that's a unit artefact, not a physical statement. The energy density of the
            magnetic part, <InlineMath>B²/(2μ₀)</InlineMath>, equals the electric part <InlineMath>½ ε₀ E²</InlineMath>
            once you put the numbers in: both contribute equally to the wave's total energy. And the wave only
            satisfies Maxwell's equations if both are present. Try to set up an EM wave with only an oscillating
            <strong> E</strong> and no <strong>B</strong>, and the equations will refuse — Ampère's law immediately
            generates the missing B<Cite id="griffiths-2017" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="If light carries momentum, why don't streetlights and lamps push us around?">
          <p>
            Because P = I/c, and c is enormous. A 100 W bulb radiating roughly isotropically deposits about
            <strong> 100 / 3×10⁸ ≈ 3×10⁻⁷ N</strong> total momentum per second, spread over a sphere. The pressure on
            your hand at arm's length is something like <strong>10⁻⁹ Pa</strong> — eight orders of magnitude below
            atmospheric. Detectable in vacuum with a sensitive torsion balance (Nichols and Hull, 1903), not
            detectable in any everyday way<Cite id="jackson-1999" in={SOURCES} />. Solar sails work because they
            patiently integrate this tiny pressure over thousands of square metres and weeks of flight.
          </p>
        </FAQItem>

        <FAQItem q="How does an antenna actually emit a wave — is each electron broadcasting?">
          <p>
            Loosely, yes — every accelerating charge radiates, by the formula in §5 of this chapter
            <Cite id="feynman-II-21" in={SOURCES} />. In a real antenna, an oscillating current at frequency ω
            corresponds to electrons in the metal sloshing back and forth at ω. Each one is being accelerated, and
            each contributes a tiny radiated field. The total far field is the coherent sum of all those contributions.
            For wavelengths much larger than the antenna, the sum reduces to the oscillating-dipole formula
            <InlineMath> I(θ) ∝ sin²θ</InlineMath>; for wavelengths comparable to or smaller than the antenna, the
            interference between contributions from different parts of the antenna shapes the radiation pattern (this
            is what antenna engineers spend their lives designing).
          </p>
        </FAQItem>

        <FAQItem q='Does an EM wave need a medium ("aether")? What was 1887 about?'>
          <p>
            No — vacuum is enough. That is one of the harder lessons of nineteenth-century physics, and it took the
            Michelson–Morley experiment of 1887 to make it stick. Maxwell himself, working in the 1860s, talked
            about the equations as describing strains in a "luminiferous aether" filling space — a medium analogous to
            air for sound. Michelson and Morley looked for the Earth's motion through this medium by comparing the
            travel time of light along perpendicular paths, and found no difference at any orientation or time of year.
            Einstein's 1905 paper resolved the situation by dropping the aether entirely: <strong>E</strong> and
            <strong> B</strong> are fields in their own right, and their wave equation holds in vacuum exactly because
            their propagation speed is a fundamental constant, not a property of any underlying material
            <Cite id="jackson-1999" in={SOURCES} />. Chapter 9 is the longer version of that story.
          </p>
        </FAQItem>

        <FAQItem q="Why is light slower in glass — what's happening at the atomic level?">
          <p>
            The wave drives the electrons in each molecule into forced oscillation, and those oscillating electrons
            radiate their own wavelets. The total field at any point in the glass is the sum of the original incident
            wave and all the re-radiated wavelets, and that sum has the same frequency but a slightly retarded phase —
            equivalent to a slower wave<Cite id="feynman-II-21" in={SOURCES} />. The macroscopic statement of this
            slowdown is εᵣ {'>'} 1 (the molecules' bound electrons polarise the medium); the wave speed becomes
            <InlineMath> v = c / √(εᵣ μᵣ)</InlineMath>. No individual photon is being "slowed down"; the wave that
            emerges is the dressed superposition.
          </p>
        </FAQItem>

        <FAQItem q="Why do X-rays go through your hand but visible light doesn't?">
          <p>
            Because the response of bound electrons in matter is wavelength-dependent. At visible λ (~500 nm), photon
            energies (~2 eV) are well-matched to outer-shell electron transitions in pigments, water, skin — they
            absorb or scatter strongly. At hard-X-ray λ (~0.01 nm), photon energies (~100 keV) are far above any
            molecular bond and well below the binding energy of inner-shell electrons in heavy atoms; soft tissue is
            mostly transparent because the wave doesn't find anything in resonance with it. Bone contains calcium,
            whose K-shell electrons (~4 keV) are in the right range for some X-rays to be absorbed, so it shows up on
            the plate<Cite id="jackson-1999" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="How does a polarizing filter work?">
          <p>
            A linear polarizer is a sheet of long, aligned molecules — typically iodine-doped polyvinyl alcohol — that
            conduct along their length. The <strong>E</strong>-component of the incident wave parallel to the
            molecules drives a current along them, which dissipates that component as heat. The
            <strong> E</strong>-component perpendicular to the molecules finds nothing to drive and passes through.
            What emerges has its <strong>E</strong> oscillating along the one allowed axis only — linearly polarized
            along the filter's "transmission axis." Two such filters at 90° to each other block essentially all the
            light; at 45° they pass cos²(45°) = ½ of the polarized component (Malus's law)<Cite id="griffiths-2017" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why is the night sky dark, if the universe is full of stars?">
          <p>
            Olbers' paradox. If the universe were infinite, static, and uniformly filled with stars, then every line
            of sight would eventually intersect a stellar surface and the sky would be as bright as the surface of a
            star. It isn't, so at least one of those assumptions has to fail. The modern resolution is two-part: the
            universe is expanding (so light from very distant stars is redshifted to longer, lower-energy wavelengths)
            and finite in age (so light from beyond a horizon distance hasn't reached us yet). The visible sky picks
            up the cosmic microwave background — the redshifted glow of the early universe — at about 2.7 K, which is
            radiation but in the microwave band, not optical. The bookkeeping survives.
          </p>
        </FAQItem>

        <FAQItem q="Why is the sky blue (qualitatively)?">
          <p>
            Air molecules are much smaller than the wavelength of visible light, and small scatterers preferentially
            re-radiate shorter wavelengths. Sunlight scatters off air molecules with an efficiency that grows as
            roughly <InlineMath>1/λ⁴</InlineMath> (Rayleigh scattering), so blue light at ~450 nm scatters about ten
            times as readily as red light at ~700 nm. Looking away from the sun, you see scattered sunlight, which is
            disproportionately blue. Looking at the sun near the horizon, you see the direct light minus what's been
            scattered out of the path — disproportionately red. Same scattering mechanism, opposite sides of the
            equation<Cite id="jackson-1999" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Can you stop a wave with a mirror — where does the energy go?">
          <p>
            A mirror doesn't absorb the wave; it sends it back. The free electrons in the metal surface oscillate in
            response to the incoming <strong>E</strong>-field and re-radiate a wave with the opposite normal
            component of momentum. Energy is conserved (the reflected wave carries it away); momentum changes sign,
            and the difference shows up as a pressure on the mirror — twice as much, in fact, as on a black absorber
            of the same intensity (P = 2I/c rather than I/c), which is why solar sails prefer to reflect
            <Cite id="jackson-1999" in={SOURCES} />. A real mirror absorbs a small fraction (typically a few percent
            in the visible), which is where the residual heat in a hot spotlight reflector comes from.
          </p>
        </FAQItem>

        <FAQItem q="How is the photon picture compatible with the wave picture?">
          <p>
            They're descriptions of the same field at different scales. At low photon numbers — a single photon in a
            laser cavity, a few photons hitting a photodetector — quantisation matters and the wave description
            doesn't tell you which detector clicks. At high photon numbers — Wi-Fi signals, sunlight, anything from a
            classical antenna — the wave description is essentially exact, with photon-counting fluctuations buried far
            below the mean intensity. The wave equation governs the <em>expectation value</em> of the field in either
            regime. Energy and momentum carry the same algebraic ratio in both: U = ℏω per photon, p = ℏk = U/c,
            consistent with the classical p = U/c we derived in §6<Cite id="feynman-II-21" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why is c the same in every reference frame?">
          <p>
            Because Maxwell's equations are the same in every reference frame, and they predict a wave speed of
            <InlineMath> 1/√(μ₀ ε₀)</InlineMath> with no reference to the observer's motion. Either the equations are
            wrong (they aren't — every test agrees), or there's a preferred frame in which they hold and they get
            modified in moving frames (Michelson–Morley says no), or every inertial frame sees the same c and
            Galilean addition of velocities has to give way. Einstein took the third option in 1905
            <Cite id="jackson-1999" in={SOURCES} />. Special relativity is largely the consequence of insisting that
            Maxwell's equations hold for everyone. Chapter 9 unpacks this.
          </p>
        </FAQItem>
      </FAQ>
    </ChapterShell>
  );
}
