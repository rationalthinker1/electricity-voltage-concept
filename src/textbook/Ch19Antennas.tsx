/**
 * Chapter 15 — Antennas and radiation
 *
 * From an oscillating dipole to a phased-array radar. The chapter builds
 * the radiation pattern of a short dipole, derives the impedance of the
 * half-wave dipole, multiplies element patterns into array patterns, lays
 * out the Friis link-budget formula, and explains the near-field vs
 * far-field transition.
 *
 * Demos:
 *   15.1 Dipole pattern         (sin²θ polar plot)
 *   15.2 Half-wave resonance    (|Z(f)|, 73 Ω at f₀ = c/(2L))
 *   15.3 Yagi array factor      (driven + reflector + N directors)
 *   15.4 Friis link budget      (P_r vs P_t, gains, distance, frequency)
 *   15.5 Near/far field         (transition around r ~ λ/(2π))
 */
import { CaseStudies, CaseStudy } from '@/components/CaseStudy';
import { ChapterShell } from '@/components/ChapterShell';
import { FAQ, FAQItem } from '@/components/FAQ';
import { Cite } from '@/components/SourcesList';
import { Formula } from '@/components/Formula';
import { Pullout } from '@/components/Prose';
import { Term } from '@/components/Term';
import { TryIt } from '@/components/TryIt';
import { DipoleRadiation3DDemo } from './demos/DipoleRadiation3D';
import { DipoleRadiationPatternDemo } from './demos/DipoleRadiationPattern';
import { FriisLinkBudgetDemo } from './demos/FriisLinkBudget';
import { HalfWaveDipoleResonanceDemo } from './demos/HalfWaveDipoleResonance';
import { NearFarFieldTransitionDemo } from './demos/NearFarFieldTransition';
import { PatchAntennaDemo } from './demos/PatchAntenna';
import { PhasedArraySteeringDemo } from './demos/PhasedArraySteering';
import { PolarizationLossPenaltyDemo } from './demos/PolarizationLossPenalty';
import { YagiArrayFactorDemo } from './demos/YagiArrayFactor';
import { getChapter } from './data/chapters';

export default function Ch15Antennas() {
  const chapter = getChapter('antennas')!;
  const SOURCES = chapter.sources;

  return (
    <ChapterShell chapter={chapter}>
      <p className="chapter-intro">
        Stand a vertical wire in your back yard and feed it a sinusoidal current at a few megahertz.
        Nothing visible happens. But across town, anyone with a matching wire and a sensitive
        receiver can hear a faint copy of whatever modulation you put on the current. Your wire is
        an antenna. Between your wire and theirs, no copper, no fiber, no intervening medium — just
        the electromagnetic field, the same field that Chapter 9 made into a plane wave, propagating
        outward at c and carrying away energy, momentum, and information.
      </p>
      <p className="mb-prose-3">
        This chapter is about how to design that wire — how to choose its length, its shape, its
        feedpoint, its supporting structure — so it radiates the way you want, and how to compute
        what gets to the other end. Everything in modern wireless, from Wi-Fi to GPS to the 70-metre
        dish at Goldstone that talks to Voyager 24 billion kilometres away, runs on the physics of
        this one chapter. Maxwell predicted the radiation in 1865
        <Cite id="maxwell-1865" in={SOURCES} />; Hertz demonstrated it in 1888
        <Cite id="hertz-1888" in={SOURCES} />; the rest is engineering.
      </p>

      <h2 className="chapter-h2">A wire that talks</h2>

      <p className="mb-prose-3">
        Chapter 7 covered induction: change the current in a coil, and the magnetic field everywhere
        around it changes too. What we glossed over there was that the change
        <em className="text-text italic"> propagates</em>. Maxwell's displacement-current correction
        to Ampère's law means that a time-varying field at one point reaches a distant point only
        after a delay of r/c. Beyond a few wavelengths, the time-varying field detaches from the
        source and becomes a self-sustaining plane wave heading out to infinity
        <Cite id="griffiths-2017" in={SOURCES} />
        <Cite id="jackson-1999" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        That radiation carries energy. By Poynting (Chapter 8), the time-averaged outward flux from
        an accelerating charge is{' '}
        <strong className="text-text font-medium">⟨S⟩ = (1/2) ε₀ c |E|²</strong>. Integrate over a
        sphere far from the source and you get the total radiated power, which (for a non-
        relativistic charge) is the Larmor formula:
      </p>
      <Formula>
        P<sub>rad</sub> = (q² a²) / (6π ε₀ c³)
      </Formula>
      <p className="mb-prose-3">
        where{' '}
        <strong className="text-text font-medium">
          P<sub>rad</sub>
        </strong>{' '}
        is the total time-averaged radiated power (in watts),
        <strong className="text-text font-medium"> q</strong> is the charge (in coulombs),{' '}
        <strong className="text-text font-medium">a</strong> is the magnitude of the charge's
        acceleration (in m/s²),{' '}
        <strong className="text-text font-medium">ε₀ ≈ 8.854×10⁻¹² F/m</strong> is the permittivity
        of free space, and <strong className="text-text font-medium">c ≈ 2.998×10⁸ m/s</strong> is
        the speed of light.
      </p>
      <p className="mb-prose-3">
        Three features of that formula are worth pausing on. The{' '}
        <em className="text-text italic">a²</em> says everything: a charge moving at constant
        velocity does not radiate (uniform translation is just a Lorentz boost of a Coulomb field),
        but the moment it accelerates, the field has to "kink" to propagate the news outward and
        that kink carries away a flux proportional to <em className="text-text italic">|a|²</em>.
        The <em className="text-text italic">q²</em> is the same square-of-source you see in every
        two-step radiation argument — the field scales as q, the intensity as |field|². The factor
        of <em className="text-text italic">1/c³</em> is the smoking gun for non-relativistic
        radiation: two powers of c come from the retarded transverse-field amplitude (which scales
        as a/c²), and another power emerges when Poynting flux{' '}
        <em className="text-text italic">εcE²</em> is integrated over the radiation sphere; the net
        result is that radiation is an intrinsically feeble effect at speeds well below c
        <Cite id="jackson-1999" in={SOURCES} />
        <Cite id="griffiths-2017" in={SOURCES} />. That is why an electron in a steady
        current-carrying wire does not radiate, but a single shaken charge — or, equivalently, an
        oscillating dipole — eventually fills space with measurable energy density.
      </p>
      <p className="mb-prose-3">
        An{' '}
        <Term def="A piece of conducting material designed to radiate (transmit) or capture (receive) electromagnetic waves at a particular range of frequencies. The receiving and transmitting properties are tied by reciprocity — the same physical structure works either way.">
          antenna
        </Term>{' '}
        is any structure designed to convert circulating current at its feedpoint into radiated EM
        waves (or, by reciprocity, vice versa). The simplest case to analyse, and the building block
        for most others, is the <em className="text-text italic">infinitesimal electric dipole</em>:
        a short straight wire carrying a uniform sinusoidal current I₀ cos(ωt). Even though no real
        antenna is infinitesimal, the dipole's far-field pattern shows up as a factor in nearly
        every more complicated geometry
        <Cite id="balanis-2016" in={SOURCES} />
        <Cite id="feynman-II-21" in={SOURCES} />.
      </p>

      <h2 className="chapter-h2">The dipole pattern</h2>

      <p className="mb-prose-3">
        Solve Maxwell's equations for an infinitesimal vertical dipole of length L and peak current
        I₀ oscillating at frequency ω. In the{' '}
        <Term def="The region r >> λ/(2π) where the radial 1/r³ near-zone terms are negligible and the field is locally a transverse plane wave with magnitude ∝ 1/r. All radiative properties (gain, beamwidth, directivity, etc.) are defined here.">
          far field
        </Term>{' '}
        (more on what that means in a moment), the result is a purely transverse outgoing spherical
        wave with electric field magnitude
        <Cite id="balanis-2016" in={SOURCES} />
        <Cite id="griffiths-2017" in={SOURCES} />:
      </p>
      <Formula>
        E(r, θ) ∝ (I<sub>0</sub> L ω / c) · sin θ · cos(kr − ωt) / r
      </Formula>
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">E(r, θ)</strong> is the magnitude of the
        radiated electric field (in V/m) at radial distance{' '}
        <strong className="text-text font-medium">r</strong> (in metres) and polar angle{' '}
        <strong className="text-text font-medium">θ</strong> measured from the dipole axis (in
        radians),{' '}
        <strong className="text-text font-medium">
          I<sub>0</sub>
        </strong>{' '}
        is the peak current in the wire (in amperes),{' '}
        <strong className="text-text font-medium">L</strong> is the dipole length (in metres),
        <strong className="text-text font-medium"> ω = 2πf</strong> is the angular frequency (in
        rad/s), <strong className="text-text font-medium">k = ω/c</strong> is the free-space
        wavenumber (in m⁻¹), and{' '}
        <strong className="text-text font-medium">c ≈ 2.998×10⁸ m/s</strong> is the speed of light.
      </p>
      <p className="mb-prose-3">
        Two important features of that formula. (1) The 1/r dependence — far enough away, the field
        falls off as one over the distance, and intensity ∝ |E|² falls off as 1/r². This is the
        inverse-square law for radiation. (2) The sin θ angular dependence, with θ measured from the
        dipole axis. Squared, this gives the intensity pattern:
      </p>
      <Formula>|E|² ∝ sin²θ</Formula>
      <p className="mb-prose-3">
        Strongest perpendicular to the dipole axis (θ = 90°), zero along the axis (θ = 0 or π). In
        3D, the radiated power has the shape of a fat donut centred on the dipole, with the wire
        piercing the donut's hole. That sin²θ factor — once you've seen it — turns up in every
        short-dipole, short-magnetic-loop, and even (with modifications) every more complicated
        radiating structure as the <em className="text-text italic">element pattern</em>
        <Cite id="kraus-marhefka-2002" in={SOURCES} />.
      </p>

      <DipoleRadiationPatternDemo />

      <p className="mb-prose-3">
        That polar plot is a slice through the dipole. The full radiation pattern lives in 3D — and
        because the geometry is rotationally symmetric about the wire, you get the 2D lobe by
        spinning it once around the axis. The result is a torus: a fat donut, with the antenna
        threaded vertically through the hole. The donut is widest at the equator (perpendicular to
        the wire, where sinθ = 1) and pinched to zero at the two poles (along the wire, where sinθ =
        0)
        <Cite id="balanis-2016" in={SOURCES} />
        <Cite id="kraus-marhefka-2002" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        Drag the figure below to orbit the camera. The exponent slider lets you sharpen the pattern
        beyond the short-dipole's sin²θ: n=2 is the canonical short-electric dipole, while
        increasing n shrinks the half-power beamwidth — what happens, qualitatively, when you stack
        more elements or move to a longer end-fire antenna
        <Cite id="balanis-2016" in={SOURCES} />.
      </p>

      <DipoleRadiation3DDemo />

      <TryIt
        tag="Try 15.1"
        question={
          <>
            For a short dipole, what is the ratio of radiated intensity at θ = 30° to its peak (θ =
            90°) value?
          </>
        }
        hint="Intensity ∝ sin²θ. Take the ratio."
        answer={
          <>
            <Formula>
              I(30°) / I(90°) = sin²(30°) / sin²(90°) = (0.5)² / 1² ={' '}
              <strong className="text-text font-medium">0.25</strong>
            </Formula>
            <p className="mb-prose-1 last:mb-0">
              So a dipole's lobe is down 6 dB at 30° off-broadside relative to its peak. Useful when
              planning broadcast coverage — a vertically-polarised tower puts essentially no power
              straight up and steadily less power toward the zenith as you climb
              <Cite id="balanis-2016" in={SOURCES} />.
            </p>
          </>
        }
      />

      <p className="mb-prose-3">
        The total power radiated comes from integrating the Poynting flux over a large sphere. For a
        short dipole of length L ≪ λ carrying peak current I₀:
      </p>
      <Formula>
        P<sub>rad</sub> = (π η<sub>0</sub> / 3) · (L/λ)² · I<sub>0</sub>²
      </Formula>
      <p className="mb-prose-3">
        where{' '}
        <strong className="text-text font-medium">
          P<sub>rad</sub>
        </strong>{' '}
        is the total time-averaged radiated power (in watts),
        <strong className="text-text font-medium"> η₀</strong> is the impedance of free space (in
        ohms; defined below),
        <strong className="text-text font-medium"> L</strong> is the dipole's physical length (in
        metres), <strong className="text-text font-medium">λ</strong> is the free-space wavelength
        of the radiation (in metres), and{' '}
        <strong className="text-text font-medium">
          I<sub>0</sub>
        </strong>{' '}
        is the peak current at the feedpoint (in amperes).
      </p>
      <p className="mb-prose-3">
        with <strong className="text-text font-medium">η₀ = √(μ₀/ε₀) ≈ 377 Ω</strong> the{' '}
        <Term def="η₀ = √(μ₀/ε₀) ≈ 377 Ω. The ratio |E|/|H| in a plane EM wave travelling in vacuum, with units of impedance. Sets the link between radiation pressure, Poynting flux, and antenna impedances.">
          impedance of free space
        </Term>
        . Pull out the I₀² and you have{' '}
        <strong className="text-text font-medium">
          P = ½ R<sub>rad</sub> I₀²
        </strong>{' '}
        with{' '}
        <strong className="text-text font-medium">
          R<sub>rad</sub> = (2π η₀/3)(L/λ)²
        </strong>
        .{' '}
        <Term def="The fictitious resistance that, in series with the antenna's reactance, accounts for the energy lost to radiation. Not heat — just energy converted to outgoing EM waves. For a short dipole R_rad = (2π η₀/3)(L/λ)²; for a half-wave dipole, ≈73 Ω.">
          Radiation resistance
        </Term>{' '}
        — a real, ohmic-looking number that eats power as if it were a resistor, but the "loss" is
        really energy converted to outgoing field
        <Cite id="balanis-2016" in={SOURCES} />
        <Cite id="jackson-1999" in={SOURCES} />.
      </p>

      <h2 className="chapter-h2">The half-wave dipole</h2>

      <p className="mb-prose-3">
        A "short" dipole (L ≪ λ) has tiny radiation resistance: an L/λ = 0.05 dipole has only R
        <sub>rad</sub> ≈ 2 Ω, miserable for impedance-matching. Push L up to λ/2 and the radiation
        resistance climbs to a useful <strong className="text-text font-medium">~73 Ω</strong> at
        resonance, and the antenna becomes purely real (no reactance) — easy to drive directly from
        a 75-Ω coaxial cable
        <Cite id="balanis-2016" in={SOURCES} />
        <Cite id="kraus-marhefka-2002" in={SOURCES} />.
      </p>
      <Formula>
        f<sub>0</sub> = c / (2 L)
      </Formula>
      <p className="mb-prose-3">
        where{' '}
        <strong className="text-text font-medium">
          f<sub>0</sub>
        </strong>{' '}
        is the fundamental resonant frequency of the dipole (in Hz),{' '}
        <strong className="text-text font-medium">c ≈ 2.998×10⁸ m/s</strong> is the speed of light,
        and <strong className="text-text font-medium">L</strong> is the total physical length of the
        dipole wire (in metres) — half a wavelength at resonance.
      </p>
      <p className="mb-prose-3">
        A 1.5-m dipole resonates at 100 MHz; a 50-mm dipole resonates at 3 GHz; a 0.5-µm dipole —
        should you ever build one — would resonate at 300 THz, well into the infrared. (Nano-
        antennas at exactly this scale are an active area of research.) At resonance, the current
        distribution along the wire is approximately sinusoidal with a maximum at the feedpoint
        (centre) and zeros at the ends. The radiation pattern is similar to the short- dipole sin²θ
        but slightly sharper — and the on-axis gain works out to
        <strong className="text-text font-medium"> ~2.15 dBi</strong>, the canonical reference
        number every antenna engineer memorises
        <Cite id="balanis-2016" in={SOURCES} />.
      </p>

      <HalfWaveDipoleResonanceDemo />

      <TryIt
        tag="Try 15.2"
        question={
          <>
            You need a half-wave dipole for the Wi-Fi 2.4 GHz band. What length wire do you cut?
            Take c = 3×10⁸ m/s.
          </>
        }
        hint="L = c/(2f). Then maybe trim 5% for end-effect."
        answer={
          <>
            <Formula>λ = c/f = (3×10⁸) / (2.4×10⁹) = 0.125 m = 12.5 cm</Formula>
            <Formula>
              L = λ/2 = <strong className="text-text font-medium">6.25 cm</strong>
            </Formula>
            <p className="mb-prose-1 last:mb-0">
              In practice the wire is trimmed slightly shorter than this (often ~95% of λ/2) to
              account for the capacitive end-effect: the wire's effective electrical length is
              slightly longer than its physical length, so you shorten it for true resonance
              <Cite id="balanis-2016" in={SOURCES} />. That's why the rubber-duck antenna on a 2.4
              GHz Wi-Fi adapter is around 6 cm tall.
            </p>
          </>
        }
      />

      <p className="mb-prose-3">
        Off resonance the impedance climbs rapidly: at 0.7 f₀ or 1.3 f₀ it's already several hundred
        ohms reactive, mostly capacitive below resonance and inductive above. That's why antennas
        are <em className="text-text italic">narrow-band</em> devices in their natural form — a
        Wi-Fi dipole tuned to 2.4 GHz works terribly at 5 GHz. Broadband antennas (log-periodic,
        biconical, discone) achieve their bandwidth by being deliberately self-similar so that some
        part of the structure is at resonance for any frequency in the design band.
      </p>

      <h2 className="chapter-h2">Arrays and Yagis: multiplying patterns</h2>

      <p className="mb-prose-3">
        Put two driven dipoles next to each other, fed in phase and a distance d apart, and the
        field pattern at any far observation angle is the sum of the two dipole fields. The
        magnitudes are roughly equal, but the path-length difference between the two introduces a
        phase delay 2π(d sinφ)/λ. The result has the structure of an "element pattern" (the dipole's
        sin²θ) times an "array factor" (the interference of N equal sources). This is the{' '}
        <Term def="The factorisation of an antenna-array's far-field pattern into the element pattern (the single-element radiation) times the array factor (the geometric interference of N elements). Lets you design beam-shaping by choosing element placement and feed phases.">
          pattern-multiplication theorem
        </Term>
        <Cite id="balanis-2016" in={SOURCES} />
        <Cite id="kraus-marhefka-2002" in={SOURCES} />:
      </p>
      <Formula>
        F<sub>total</sub>(θ, φ) = F<sub>element</sub>(θ, φ) × F<sub>array</sub>(θ, φ)
      </Formula>
      <p className="mb-prose-3">
        where{' '}
        <strong className="text-text font-medium">
          F<sub>total</sub>(θ, φ)
        </strong>{' '}
        is the dimensionless total radiation pattern of the array at polar angle{' '}
        <strong className="text-text font-medium">θ</strong> and azimuthal angle{' '}
        <strong className="text-text font-medium">φ</strong> (both in radians),{' '}
        <strong className="text-text font-medium">
          F<sub>element</sub>
        </strong>{' '}
        is the pattern of a single radiating element in isolation, and{' '}
        <strong className="text-text font-medium">
          F<sub>array</sub>
        </strong>{' '}
        is the array factor — the geometric interference pattern that the array of N elements would
        produce if every element were an isotropic point source.
      </p>
      <p className="mb-prose-3">
        Pattern multiplication is the entire game of{' '}
        <Term def="An array of multiple antenna elements arranged in a geometric pattern, fed with controlled relative phases and amplitudes, so that constructive interference produces a directional beam. Phased arrays use electronic phase shifters to steer the beam without moving mechanical parts.">
          phased-array antenna
        </Term>{' '}
        design. Place elements at the right spacings, drive them with the right relative phases, and
        the array factor focuses the radiation into a tight beam pointing where you want — without
        moving any mechanical parts.
      </p>
      <p className="mb-prose-3">
        The simplest non-trivial real array is the Yagi-Uda, invented in 1928 by Hidetsugu Yagi and
        Shintaro Uda at Tohoku University
        <Cite id="yagi-1928" in={SOURCES} />. One driven element (a half-wave dipole), one
        slightly-longer <em className="text-text italic">reflector</em> placed about λ/4 behind it,
        and one or more slightly-shorter <em className="text-text italic">directors</em> placed in
        front. The reflector and directors are not connected to the feed line — they are{' '}
        <em className="text-text italic">parasitic</em>, excited only by the field from the driven
        element. Their reradiated fields, with appropriate phase shifts set by the spacings and
        lengths, combine constructively in the forward direction and destructively backward.
      </p>

      <YagiArrayFactorDemo />

      <Pullout>Antenna engineering is the art of multiplying patterns.</Pullout>

      <p className="mb-prose-3">
        Adding directors sharpens the forward lobe and raises the on-axis gain by roughly 1 dB per
        director, with diminishing returns past about ten. A ten-element Yagi for the FM broadcast
        band achieves ~13 dBi forward gain, beamwidth ~30°, and 20+ dB front-to-back ratio — quite
        enough to pick up a distant station while rejecting the local one. Larger Yagis with 20+
        elements are common in radio-astronomy front ends and amateur VHF/UHF
        <Cite id="balanis-2016" in={SOURCES} />
        <Cite id="kraus-marhefka-2002" in={SOURCES} />.
      </p>

      <p className="mb-prose-3">
        Pull the parasitic elements off the Yagi and replace them with a row of{' '}
        <em className="text-text italic">actively driven</em>
        elements, each fed through its own phase shifter, and you have a{' '}
        <em className="text-text italic">phased array</em>. With N elements at spacing d and a
        progressive phase shift Δφ between neighbours, the array factor's main lobe steers off
        broadside by an angle satisfying
        <Cite id="balanis-2016" in={SOURCES} />
        <Cite id="kraus-marhefka-2002" in={SOURCES} />:
      </p>
      <Formula>
        sin θ<sub>steer</sub> = (Δφ · λ) / (2π d)
      </Formula>
      <p className="mb-prose-3">
        where{' '}
        <strong className="text-text font-medium">
          θ<sub>steer</sub>
        </strong>{' '}
        is the angle the main beam makes with broadside (in radians),{' '}
        <strong className="text-text font-medium">Δφ</strong> is the progressive phase shift applied
        between adjacent elements (in radians), <strong className="text-text font-medium">λ</strong>{' '}
        is the free-space wavelength (in metres), and
        <strong className="text-text font-medium"> d</strong> is the spacing between adjacent
        elements (in metres).
      </p>
      <p className="mb-prose-3">
        No moving parts: change Δφ electronically and the beam swings. With d = λ/2 the array can
        steer the full ±90° hemisphere. Push d much above λ/2 and unwanted "grating lobes" appear on
        the other side of broadside — uninvited copies of the main beam at angles where the
        path-difference comes out an integer wavelength. AESA radars and 5G mmWave base stations
        live exactly on this edge: λ/2 spacing for the steering range they want, electronic phase
        shifters in every element to point the beam wherever needed in microseconds.
      </p>

      <PhasedArraySteeringDemo />

      <TryIt
        tag="Try 15.3b"
        question={
          <>
            A 4-element phased array at 10 GHz with d = λ/2 spacing. What phase shift Δφ between
            adjacent elements steers the main beam to 30° off broadside?
          </>
        }
        hint="sin θ_steer = Δφ · λ / (2π d). With d = λ/2 the formula simplifies."
        answer={
          <>
            <Formula>
              Δφ = (2π d / λ) · sin θ<sub>steer</sub> = (2π · 0.5) · sin 30° = π · 0.5 = π/2 rad
            </Formula>
            <Formula>
              Δφ = π/2 = <strong className="text-text font-medium">90° per element</strong>
            </Formula>
            <p className="mb-prose-1 last:mb-0">
              So a 4-element array is fed 0°, 90°, 180°, 270° to steer to 30°. Real phased arrays
              use 6- or 8-bit digital phase shifters per element (5.6° or 1.4° resolution),
              quantised so the beam pointing remains accurate to a fraction of a beamwidth across
              the whole steering range
              <Cite id="balanis-2016" in={SOURCES} />.
            </p>
          </>
        }
      />

      <TryIt
        tag="Try 15.3"
        question={
          <>
            An antenna is rated 12 dBi gain. By what factor does it concentrate the power, relative
            to an isotropic radiator (one that emits equally in all directions)?
          </>
        }
        hint="dBi is the gain in dB referenced to isotropic. Convert dB to a linear ratio: G = 10^(dBi/10)."
        answer={
          <>
            <Formula>
              G = 10^(12/10) = 10^1.2 ≈ <strong className="text-text font-medium">15.8 ×</strong>
            </Formula>
            <p className="mb-prose-1 last:mb-0">
              The antenna's peak intensity is about 15.8 times higher than an isotropic radiator's
              would be for the same total radiated power. Equivalently, you can send the same signal
              with 15.8× less transmit power if you have this antenna instead of a hypothetical
              isotropic one
              <Cite id="balanis-2016" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2 className="chapter-h2">The Friis equation</h2>

      <p className="mb-prose-3">
        At the receiver end of a wireless link, the question is:{' '}
        <em className="text-text italic">how much power arrives?</em>
        For two antennas separated by a distance d ≫ λ in free space (no reflections, no
        obstructions), with transmit gain G<sub>t</sub> and receive gain G<sub>r</sub> at wavelength
        λ, the{' '}
        <Term def="P_r/P_t = G_t·G_r·(λ/4πd)². The fundamental link-budget formula for a free-space radio link, derived by Harald Friis at Bell Labs in 1946 from the definition of an effective area A_eff = G λ²/(4π) for the receiving antenna.">
          Friis transmission equation
        </Term>{' '}
        says
        <Cite id="friis-1946" in={SOURCES} />:
      </p>
      <Formula>
        P<sub>r</sub> = P<sub>t</sub> · G<sub>t</sub> · G<sub>r</sub> · (λ / 4πd)²
      </Formula>
      <p className="mb-prose-3">
        where{' '}
        <strong className="text-text font-medium">
          P<sub>r</sub>
        </strong>{' '}
        is the power delivered to the matched receive antenna (in watts),{' '}
        <strong className="text-text font-medium">
          P<sub>t</sub>
        </strong>{' '}
        is the transmitted power (in watts),
        <strong className="text-text font-medium">
          {' '}
          G<sub>t</sub>
        </strong>{' '}
        and{' '}
        <strong className="text-text font-medium">
          G<sub>r</sub>
        </strong>{' '}
        are the dimensionless transmit and receive antenna gains relative to isotropic (often quoted
        in dBi),
        <strong className="text-text font-medium"> λ</strong> is the operating wavelength (in
        metres), and <strong className="text-text font-medium">d</strong> is the line-of-sight
        distance between the antennas (in metres).
      </p>
      <p className="mb-prose-3">
        The (λ/4πd)² factor is the <em className="text-text italic">free-space path loss</em> — the
        fraction of radiated power that an isotropic receiver of effective area λ²/(4π) would
        intercept at distance d. Every doubling of d adds{' '}
        <strong className="text-text font-medium">6 dB</strong> of path loss; every doubling of
        frequency adds another 6 dB. The gains G<sub>t</sub> and G<sub>r</sub> push back against the
        loss by focusing the transmitted and received power into narrower angular cones.
      </p>

      <FriisLinkBudgetDemo />

      <p className="mb-prose-3">
        Plug in some numbers for a typical home Wi-Fi link: P<sub>t</sub> = 100 mW = +20 dBm, G
        <sub>t</sub> = G<sub>r</sub> = +5 dBi, f = 5 GHz so λ = 6 cm, d = 10 m. Compute:
      </p>
      <Formula>
        P<sub>r</sub> = 0.1 W · 3.16 · 3.16 · (0.06 / (4π · 10))² ≈{' '}
        <strong className="text-text font-medium">2.3 × 10⁻⁸ W</strong>
      </Formula>
      <p className="mb-prose-3">
        About 23 nanowatts — equivalent to −46 dBm. Sensitivity of a commodity Wi-Fi receiver is
        about −90 dBm at the lowest MCS, so we have 44 dB of fade margin. Plenty for a clean link;
        some of that vanishes through walls and multipath, but the math is roughly right. The same
        equation applies to a deep-space link at 8 GHz and 25 billion km — only the numbers and the
        receiver are different
        <Cite id="friis-1946" in={SOURCES} />.
      </p>

      <p className="mb-prose-3">
        Friis assumes the polarisations at the two ends are matched. If they aren't, multiply by a
        <Term def="The factor cos²α by which received power drops when transmitter and receiver linear polarisations are misaligned by angle α. The antenna analogue of Malus's law in optics — a dipole only couples to the E-field component along its axis.">
          polarisation-loss factor
        </Term>{' '}
        of <strong className="text-text font-medium">cos²α</strong>, where α is the angle between
        the two linear polarisation axes. Same Malus's law as optics: an antenna is a polarisation
        filter that only couples to the E-field component along its own axis. A 45° mismatch costs 3
        dB; a 90° mismatch is a full null on paper and 20–40 dB of suppression in practice
        <Cite id="balanis-2016" in={SOURCES} />.
      </p>

      <PolarizationLossPenaltyDemo />

      <TryIt
        tag="Try 15.4"
        question={
          <>
            A spacecraft transmits 20 W at 8.4 GHz (deep-space X-band). The Earth station has a 70-m
            parabolic dish with G_r = +73 dBi. Spacecraft antenna gain G_t = +30 dBi. Distance: 1.5
            × 10⁹ km (Saturn). What is the received signal power?
          </>
        }
        hint="Convert everything to consistent units, plug into Friis. dB form is cleaner."
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">
              P<sub>t</sub> = 20 W = +43 dBm. λ = c/f = 3×10⁸ / 8.4×10⁹ = 0.0357 m. FSPL = 20 log
              <sub>10</sub>(4πd/λ) = 20 log<sub>10</sub>(4π · 1.5×10¹² / 0.0357) ≈{' '}
              <strong className="text-text font-medium">294 dB</strong>.
            </p>
            <Formula>
              P<sub>r</sub> (dBm) = +43 + 30 + 73 − 294 ={' '}
              <strong className="text-text font-medium">−148 dBm</strong>
            </Formula>
            <p className="mb-prose-1 last:mb-0">
              That's about <strong className="text-text font-medium">1.6 × 10⁻¹⁹ W</strong>, roughly
              one photon per millisecond at X-band. The DSN's cryogenically-cooled low-noise
              amplifiers and long-integration receivers can pull a bit stream out of that, but
              barely
              <Cite id="friis-1946" in={SOURCES} />
              <Cite id="balanis-2016" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2 className="chapter-h2">Near field vs far field</h2>

      <p className="mb-prose-3">
        Friis assumes <strong className="text-text font-medium">d ≫ λ</strong>. Closer to an antenna
        than that, the simple 1/r far-field picture doesn't apply. The radiation field of any
        oscillating source has three components: a 1/r³ "near zone" piece that looks essentially
        like a quasi-static dipole, a 1/r² intermediate piece, and a 1/r "radiation zone" piece. The
        first two carry no net time-averaged Poynting flux to infinity; they store reactive energy
        that sloshes back and forth between electric and magnetic forms. Only the 1/r piece radiates
        <Cite id="balanis-2016" in={SOURCES} />
        <Cite id="jackson-1999" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        The boundary between these regions is at{' '}
        <strong className="text-text font-medium">r ≈ λ/(2π)</strong>. Inside that radius, the field
        structure is dominated by the reactive near-zone terms. Outside, the radiation zone takes
        over and the field looks locally like a plane EM wave with |E|/|H| = η₀.
      </p>

      <NearFarFieldTransitionDemo />

      <p className="mb-prose-3">
        For large aperture antennas (a parabolic dish, a phased array), there's an additional
        "Fraunhofer / Fresnel" distance set by the antenna's physical size:
        <strong className="text-text font-medium">
          {' '}
          r<sub>far</sub> ≈ 2 D²/λ
        </strong>
        , where D is the largest aperture dimension. For a 70-m DSN dish at 8.4 GHz this works out
        to ≈ 2.7 km — meaning the diffraction pattern over which the dish's gain pattern is properly
        defined doesn't start until you're several kilometres downstream of the antenna. For nearby
        satellites or aircraft, the antenna is effectively in its own near field
        <Cite id="balanis-2016" in={SOURCES} />.
      </p>

      <TryIt
        tag="Try 15.5"
        question={
          <>
            A short dipole oscillates at 100 MHz. At what radial distance does the field cross from
            "near" to "far"?
          </>
        }
        hint="Use the boundary r ≈ λ/(2π)."
        answer={
          <>
            <Formula>λ = c/f = 3×10⁸ / 10⁸ = 3 m</Formula>
            <Formula>
              r<sub>NF</sub> ≈ λ/(2π) = 3 / 6.28 ≈{' '}
              <strong className="text-text font-medium">0.48 m</strong>
            </Formula>
            <p className="mb-prose-1 last:mb-0">
              Within about half a metre of the dipole the field is dominated by reactive 1/r³ terms;
              beyond, the 1/r radiation field dominates and Friis applies
              <Cite id="balanis-2016" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2 className="chapter-h2">Patch antennas and the printed-circuit radiator</h2>

      <p className="mb-prose-3">
        A{' '}
        <Term def="A flat rectangular metal patch on a dielectric substrate over a ground plane, fed from below. Resonates as a half-wave standing wave inside the dielectric: L ≈ λ/(2√εᵣ). Radiation is broadside, gain ~6 dBi.">
          microstrip patch antenna
        </Term>{' '}
        is the workhorse of everything printed on a circuit board. It's a flat rectangle of copper
        sitting on a dielectric substrate (FR-4, Rogers RO4003, etc.) over a continuous ground
        plane. The fundamental resonance is a half-wave standing wave between the two radiating
        edges — but the wave lives inside the dielectric, so the physical length is set by the
        in-medium wavelength
        <Cite id="balanis-2016" in={SOURCES} />:
      </p>
      <Formula>
        L ≈ λ / (2 √ε<sub>r</sub>) &nbsp;⇔&nbsp; f<sub>0</sub> ≈ c / (2 L √ε<sub>r</sub>)
      </Formula>
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">L</strong> is the physical length of the
        patch in the resonant direction (in metres),{' '}
        <strong className="text-text font-medium">
          λ = c/f<sub>0</sub>
        </strong>{' '}
        is the free-space wavelength at the resonant frequency (in metres),{' '}
        <strong className="text-text font-medium">
          f<sub>0</sub>
        </strong>{' '}
        is the design resonant frequency (in Hz),{' '}
        <strong className="text-text font-medium">c ≈ 2.998×10⁸ m/s</strong> is the speed of light,
        and
        <strong className="text-text font-medium">
          {' '}
          ε<sub>r</sub>
        </strong>{' '}
        is the dimensionless relative permittivity of the dielectric substrate beneath the patch.
      </p>
      <p className="mb-prose-3">
        The radiation pattern is broadside (perpendicular to the patch plane), with typical gain
        around <strong className="text-text font-medium">6 dBi</strong> and a half-power beamwidth
        around 80°. The ground plane sits underneath like a mirror, so essentially nothing radiates
        downward — exactly what you want in a phone (radiate into the user's environment, not into
        the battery). Add a second resonance by tweaking the patch into an L or T shape, or stack
        two patches at different heights, and you have multi-band antennas covering Wi-Fi 2.4 / 5 /
        6 GHz from a single few-cm² footprint
        <Cite id="kraus-marhefka-2002" in={SOURCES} />.
      </p>

      <PatchAntennaDemo />

      <TryIt
        tag="Try 15.6"
        question={
          <>
            An FR-4 patch antenna (εᵣ = 4.4) is to resonate at 2.45 GHz (the centre of the Wi-Fi
            2.4-GHz band). Estimate L.
          </>
        }
        hint="L ≈ c / (2 f₀ √εᵣ)."
        answer={
          <>
            <Formula>
              λ<sub>0</sub> = c/f = 3×10⁸ / 2.45×10⁹ ≈ 0.1224 m = 12.24 cm
            </Formula>
            <Formula>
              L ≈ λ<sub>0</sub> / (2 √εᵣ) = 0.1224 / (2·√4.4) ≈ 0.1224 / 4.20
            </Formula>
            <Formula>
              L ≈ <strong className="text-text font-medium">0.0292 m ≈ 29 mm</strong>
            </Formula>
            <p className="mb-prose-1 last:mb-0">
              That's about 1.1 inches per side — exactly the kind of square copper patch you can
              find printed on the corner of a Wi-Fi access-point PCB. Real designs trim L by a few
              percent for fringing-field correction, and the patch width W tunes the input impedance
              separately
              <Cite id="balanis-2016" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2 className="chapter-h2">What we have so far</h2>

      <p className="mb-prose-3">
        Push a sinusoidal current onto a wire and the wire radiates. A short electric dipole has the
        canonical sin²θ pattern, with strength perpendicular to its axis and a null along it. Cut
        the wire to a half wavelength and feed it in the centre, and the input impedance becomes
        real and ~73 Ω at resonance — a number engineering practice has lived on for a century.
        Stacking several driven and parasitic elements multiplies patterns: a Yagi focuses forward,
        a phased array points anywhere. The Friis equation tells you how much of the radiated power
        survives the trip to a receiver:{' '}
        <em className="text-text italic">
          P<sub>r</sub>/P<sub>t</sub>= G<sub>t</sub> G<sub>r</sub> (λ/4πd)²
        </em>
        . And the field around an antenna divides into a reactive near zone (r ≲ λ/2π), where energy
        sloshes back and forth and nothing escapes, and a radiation zone (r ≫ λ/2π), where the 1/r
        outgoing wave carries it away to infinity. The rest of antenna engineering — phased arrays,
        parabolic reflectors, log-periodics, helical antennas, microstrip patches, conformal arrays
        — is downstream applications of these five ideas.
      </p>

      <CaseStudies
        intro={
          <>
            Four working antenna systems, from the small (a phone) to the large (a 70-m dish talking
            to Voyager).
          </>
        }
      >
        <CaseStudy
          tag="Case 15.1"
          title="DSN-70 m at Goldstone — talking to Voyager"
          summary="A 70-m parabolic dish at +73 dBi gain pulls a 20-W signal out of 24 billion km of free space."
          specs={[
            { label: 'Antenna diameter', value: <>70 m</> },
            {
              label: 'Frequency band',
              value: <>X-band, 8.4 GHz (downlink); S-band, 2.3 GHz (uplink/legacy)</>,
            },
            { label: 'Peak gain (X-band)', value: <>~73 dBi</> },
            { label: 'Beamwidth (X-band)', value: <>~0.04° (~0.7 mrad)</> },
            {
              label: 'Spacecraft transmit power',
              value: (
                <>
                  ~20 W (Voyager TWTA) at +30 dBi <Cite id="friis-1946" in={SOURCES} />
                </>
              ),
            },
            { label: 'Path loss at 24 billion km', value: <>~308 dB at X-band</> },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            The Deep Space Network's three 70-m antennas (Goldstone CA, Madrid, Canberra) are the
            working class of NASA's interplanetary communications. Each is a parabolic reflector
            with focal-point feed, mounted on a hydrostatic bearing the size of a small swimming
            pool that floats the rotating dish on a film of pressurised oil. Pointing accuracy is
            better than 0.005°, beamwidth at X-band is 0.04°, and peak gain is +73 dBi — meaning the
            dish concentrates received signals by a factor of 2 × 10⁷ over an isotropic reference.
          </p>
          <p className="mb-prose-2 last:mb-0">
            Voyager 1 at its current distance (≈24 billion km) transmits at 20 W; Friis says the
            free-space path loss at 8.4 GHz is 308 dB. After spacecraft antenna gain (+30 dBi) and
            Earth-station gain (+73 dBi) and the various pointing/atmospheric/cable losses, the
            received signal is about <strong className="text-text font-medium">−165 dBm</strong>, or
            3 × 10⁻¹⁹ W. The cryogenic ruby maser front end on the DSN dish has a noise temperature
            of ~15 K, and a 160 bit/s downlink can be received with bit-error rate &lt;10⁻⁵ via
            long-baseline forward-error-correction codes
            <Cite id="friis-1946" in={SOURCES} />
            <Cite id="balanis-2016" in={SOURCES} />.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 15.2"
          title="Wi-Fi 6 / 6E phone antenna"
          summary="A printed-circuit antenna a few cm across handles 2.4, 5, and 6 GHz at <100 mW transmit, plus 802.11 MIMO."
          specs={[
            {
              label: 'Operating bands',
              value: <>2.4 GHz, 5 GHz UNII, 6 GHz UNII-5 through UNII-8</>,
            },
            {
              label: 'Transmit power',
              value: (
                <>
                  FCC limit 100 mW in 2.4 GHz; 1 W EIRP in 5 GHz UNII-3{' '}
                  <Cite id="balanis-2016" in={SOURCES} />
                </>
              ),
            },
            {
              label: 'Antenna style',
              value: <>PIFA or inverted-F printed on the phone PCB / chassis</>,
            },
            {
              label: 'MIMO',
              value: <>2×2 or 4×4 typical; spatially-diverse antennas exploit multipath</>,
            },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            A modern smartphone hosts a half-dozen radios sharing two or three antenna structures:
            Wi-Fi (multiple bands), Bluetooth (2.4 GHz), cellular (700 MHz to ~5 GHz for sub-6 GHz,
            24–40 GHz for 5G mmWave), GNSS (~1.5 GHz). Each gets its own narrow band carved out of
            the antenna's frequency response, often by an LC matching network at the antenna port.
            The antennas themselves are usually printed metal traces on the PCB — variations on the
            inverted-F antenna (PIFA) — sized so that their resonance lines up with the band of
            interest. λ/4 at 2.4 GHz is 31 mm; at 5 GHz, 15 mm — comparable to the phone's edge.
          </p>
          <p className="mb-prose-2 last:mb-0">
            For Wi-Fi 6 the link budget is dominated by indoor multipath: the signal arrives at the
            receiver as a sum of dozens of reflections off walls, floor, ceiling, furniture.
            <strong className="text-text font-medium"> MIMO</strong> (multiple-input
            multiple-output) explicitly exploits the multipath: with N antennas at each end, the
            receiver can solve for N independent spatial streams, multiplying link capacity by N at
            no extra spectrum cost. A high-end Wi-Fi 6 router has 4×4 or 8×8 MIMO; the phone has
            2×2. The phased-array picture from this chapter is doing the heavy lifting
            <Cite id="balanis-2016" in={SOURCES} />
            <Cite id="kraus-marhefka-2002" in={SOURCES} />.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 15.3"
          title="Rooftop UHF TV Yagi"
          summary="An 8- to 12-element Yagi-Uda picks up channel 4 from 60 miles away with the front-to-back ratio to reject co-channel interference."
          specs={[
            { label: 'Frequency', value: <>UHF TV band, 470–700 MHz (channels 14–51)</> },
            { label: 'Gain', value: <>~10–14 dBi forward</> },
            {
              label: 'Front-to-back ratio',
              value: (
                <>
                  ~18–25 dB <Cite id="yagi-1928" in={SOURCES} />
                </>
              ),
            },
            { label: 'Beamwidth', value: <>~30–40° at half-power</> },
            {
              label: 'Construction',
              value: <>aluminum dipole, reflector, 5–10 directors on a horizontal boom</>,
            },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            The Yagi-Uda antenna, invented in 1928 by Yagi and Uda at Tohoku University, is the
            workhorse rooftop antenna of the broadcast era
            <Cite id="yagi-1928" in={SOURCES} />. Driven element is a folded half-wave dipole (≈300
            Ω feed impedance, conveniently matched to old-fashioned twin-lead transmission line);
            reflector behind it is ~5% longer; each of 5–10 directors in front is ~5% shorter than
            the last. The whole assembly sits on a horizontal boom 1–2 m long, perpendicular to the
            desired propagation direction.
          </p>
          <p className="mb-prose-2 last:mb-0">
            Pattern multiplication explains the design entirely: the array factor (set by element
            positions and the relative phases the parasitic elements naturally adopt) multiplies the
            dipole's sin²θ pattern into a forward-pointing lobe ≈30° wide. The 18+ dB front-to-back
            ratio is what lets a viewer reject the co-channel interference from a transmitter 200 km
            away while pulling in the local station 50 km away. The Yagi is also why "antenna"
            became a verb in mid-20th-century slang: aiming the rooftop Yagi was a household ritual
            <Cite id="kraus-marhefka-2002" in={SOURCES} />.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 15.4"
          title="AESA radar — phased-array beam steering"
          summary="An active electronically scanned array on a fighter aircraft points its beam in microseconds by adjusting phase shifters, not gimbals."
          specs={[
            { label: 'Frequency', value: <>typically X-band, 8–12 GHz</> },
            {
              label: 'Number of T/R modules',
              value: (
                <>
                  ~1500–2500 in a 1-m² aperture <Cite id="balanis-2016" in={SOURCES} />
                </>
              ),
            },
            { label: 'Beam-steering time', value: <>~µs (electronic) vs ~ms (mechanical)</> },
            { label: 'Beamwidth', value: <>~3° at X-band for a 1-m aperture</> },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            An active electronically scanned array (AESA) radar — the kind on a modern fighter
            aircraft's nose — replaces the single steered antenna of a traditional radar with a flat
            array of thousands of small transmit-receive (T/R) modules. Each module has its own
            miniature solid-state amplifier and electronic phase shifter. By controlling the
            relative phases of the modules, the array's{' '}
            <em className="text-text italic">array factor</em> (in this chapter's language) can be
            made to point in any direction within a 60° forward hemisphere, switching point-to-point
            in microseconds
            <Cite id="balanis-2016" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            The advantages over a mechanically-steered antenna are enormous. There is no inertia, so
            the beam can hop instantaneously between targets to track multiple things
            simultaneously. The pattern can be reshaped on-the-fly (narrow for high-resolution
            tracking, broad for search; multiple simultaneous beams for different functions). And
            module failures degrade gracefully — losing 10% of the modules costs 1 dB of gain but
            doesn't take the radar offline. Pattern multiplication, taken seriously and packaged as
            a million-dollar piece of hardware
            <Cite id="kraus-marhefka-2002" in={SOURCES} />.
          </p>
        </CaseStudy>
      </CaseStudies>

      <FAQ intro="Loose threads — the questions a careful reader tends to ask after this chapter.">
        <FAQItem q="Why does a half-wave dipole have an input impedance of 73 Ω specifically?">
          <p>
            Integrate the Poynting flux for the assumed sinusoidal current distribution I(z) = I₀
            cos(πz/L) on a wire of length L = λ/2. The far-field intensity pattern is sin²θ times a
            small correction factor; integrating |E|²/(2η₀) over a large sphere and dividing by ½I₀²
            gives the radiation resistance. The integral comes out to R<sub>rad</sub> = (η₀/2π) ·
            ∫(cos²(π/2 cos θ)/sin θ) dθ over 0 to π, which evaluates numerically to ≈73.13 Ω
            <Cite id="balanis-2016" in={SOURCES} />
            <Cite id="jackson-1999" in={SOURCES} />. It's a definite integral, not a free parameter,
            and at resonance the reactance is zero, so the input impedance is purely real and equal
            to that 73 Ω. Why exactly 73 and not some other number? It's a consequence of η₀ ≈ 377 Ω
            and the specific sin²θ pattern integrated over the sphere — geometry plus the impedance
            of free space.
          </p>
        </FAQItem>

        <FAQItem q="What's the difference between dBi and dBd?">
          <p>
            dBi is decibel gain referenced to an{' '}
            <em className="text-text italic">isotropic radiator</em> (a hypothetical antenna that
            emits equally in all directions, total solid angle 4π steradians). dBd is gain
            referenced to a <em className="text-text italic">half-wave dipole</em>. Since the
            half-wave dipole itself has gain ≈2.15 dBi over isotropic, the conversion is simply
            <strong className="text-text font-medium"> dBi = dBd + 2.15</strong>
            <Cite id="balanis-2016" in={SOURCES} />. A "10 dBi" antenna and a "7.85 dBd" antenna are
            the same thing. Manufacturers' marketing prefers dBi (the larger number), engineering
            practice often uses dBd (the smaller, more intuitive number for hams). Always check
            which reference is in use.
          </p>
        </FAQItem>

        <FAQItem q="If radiation resistance is 73 Ω, where does the 73 Ω of power go — heat?">
          <p>
            No. The "resistance" is just the rate of energy flow out of the antenna's circuit and
            into the EM field — it has the same circuit-equation behaviour as a real resistor (drops
            voltage, dissipates power), but the energy goes to outgoing radiation rather than to
            heat. A real antenna also has a small <em className="text-text italic">ohmic</em>
            resistance (the wire's own copper resistivity), which dissipates as heat; that's why
            antenna efficiency is η = R<sub>rad</sub>/(R<sub>rad</sub> + R<sub>ohmic</sub>), usually
            &gt;90% for an HF dipole but possibly much lower for an electrically-short one where R
            <sub>rad</sub> can be a small fraction of an ohm
            <Cite id="balanis-2016" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why are real antennas usually longer or shorter than their nominal λ/2?">
          <p>
            Two corrections. (1) End-effect capacitance: the antenna's electrical length is slightly
            longer than its physical length because of the capacitance between the wire tips and
            free space; trimming the wire to about 95% of λ/2 brings the physical length into
            resonance. (2) Velocity factor: in a dielectric (insulated wire, plastic substrate),
            waves propagate at c/n, not c, shortening the physical length further. For a bare-copper
            half-wave dipole in free space the rule of thumb is L = 0.95 λ/2; for an antenna inside
            plastic, somewhat less
            <Cite id="balanis-2016" in={SOURCES} />
            <Cite id="kraus-marhefka-2002" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What does 'horizontal' or 'vertical' polarisation mean for an antenna?">
          <p>
            The polarisation of a radiated EM wave is the direction of its electric field. A
            vertical dipole radiates a vertically-polarised wave; a horizontal dipole, a
            horizontally-polarised one. Receiving antennas have polarisation responses too: a
            vertical wire is most sensitive to vertically-polarised signals, almost blind to
            horizontal. A mismatch of 90° between transmitter and receiver polarisation (a
            "cross-pol" link) costs about 20–40 dB of signal — much more than typical link margins.
            AM broadcast is conventionally vertical; FM and analog TV are conventionally horizontal;
            satellite uplinks often use circular polarisation to avoid the geometry problem
            <Cite id="balanis-2016" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why does GPS use circular polarisation?">
          <p>
            Because the spacecraft is at any orientation relative to your receiver, and you don't
            want the link to break when its antenna happens to be at 90° to yours. Both uplink and
            downlink use right-hand circular polarisation (RHCP). The spacecraft transmit antenna
            and your receiver antenna are each helical or crossed-dipole structures driven 90° out
            of phase so the E-vector rotates in time, matching the other end's rotation. Mismatch in
            handedness is what kills a circular-polarised link — right-hand to left-hand is 20+ dB
            of cross-pol loss
            <Cite id="balanis-2016" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="How does a parabolic dish work?">
          <p>
            A parabolic reflector with a feed antenna at its focal point converts incoming plane
            waves into a converging beam at the focus — by geometric optics, every parallel ray
            reflects to the focal point with equal path length. The reverse also works: a feed at
            the focus produces an outgoing plane wave when illuminated. The antenna's gain scales as
            G = 4π A<sub>eff</sub>/λ², where A<sub>eff</sub> ≈ 0.55 · (physical area) accounts for
            the feed's spillover and taper. A 1-m dish at 10 GHz has A<sub>eff</sub> ≈ 0.43 m² and
            gain ≈ +37 dBi
            <Cite id="balanis-2016" in={SOURCES} />
            <Cite id="kraus-marhefka-2002" in={SOURCES} />. The 70-m DSN dish at 8.4 GHz: A
            <sub>eff</sub> ≈ 2100 m², gain ≈ +73 dBi.
          </p>
        </FAQItem>

        <FAQItem q="Why are mobile-phone antennas printed-circuit rectangles rather than wires?">
          <p>
            Three reasons. (1) Size — at sub-3-GHz cellular bands the λ/4 length is a few
            centimetres, which fits easily inside a phone if you fold the wire into a planar
            inverted-F or meander structure printed on the PCB. (2) Manufacturing — printing
            antennas as PCB copper traces costs nothing extra and is dimensionally tightly
            controlled, far better than soldering a piece of wire. (3) Multi-band — adding extra
            "branches" to a PIFA creates additional resonances for cellular, Wi-Fi, GNSS
            simultaneously, with each frequency carving its own active region of the same metal.
            Performance is somewhat below an ideal external dipole but well within adequate for the
            use case
            <Cite id="balanis-2016" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What's the difference between gain and directivity?">
          <p>
            Directivity D is a purely geometric measure: the peak intensity in the most radiated
            direction, divided by the average intensity over all directions. Gain G = η · D, where η
            is the antenna's radiation efficiency (radiated power / input power). A perfectly
            lossless antenna has G = D; a real antenna with ohmic losses has G &lt; D. Both are
            typically quoted in dBi, with G being what link-budget calculations actually care about
            (it accounts for power that never makes it out of the antenna)
            <Cite id="balanis-2016" in={SOURCES} />
            <Cite id="kraus-marhefka-2002" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why does the Friis formula have a (λ/4πd)² instead of just 1/d²?">
          <p>
            Two factors that look like they're "of d" combine into the (λ/4πd)². The transmitter's
            radiated intensity at distance d falls as{' '}
            <strong className="text-text font-medium">
              I = P<sub>t</sub>G<sub>t</sub>/(4πd²)
            </strong>
            (power per unit area on the sphere). The receiver's{' '}
            <em className="text-text italic">effective aperture</em> — the area-equivalent of its
            sensitivity — is A<sub>eff</sub> = G<sub>r</sub> λ²/(4π). Power captured is P
            <sub>r</sub> = I · A<sub>eff</sub> = P<sub>t</sub>G<sub>t</sub>G<sub>r</sub>
            (λ²/(16π²d²)) = P<sub>t</sub>G<sub>t</sub>G<sub>r</sub>(λ/4πd)². The wavelength enters
            because the effective aperture of an isotropic antenna is exactly λ²/(4π) — a
            consequence of reciprocity and free-space-impedance arithmetic
            <Cite id="friis-1946" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Can an antenna be both a transmitter and a receiver?">
          <p>
            Yes — <em className="text-text italic">reciprocity</em> says that the radiation pattern,
            gain, polarisation, and input impedance of any passive antenna are identical for
            transmit and receive operation. A Yagi pointed at the broadcast tower receives well; the
            same Yagi fed with 100 W transmits equally well in the same direction. In practice the
            same antenna often serves both functions via a duplexer (a circulator or T/R switch)
            that routes signals between transmit amplifier, receive amplifier, and antenna port. The
            DSN dishes simultaneously transmit at S-band uplink and receive at X-band downlink using
            exactly this principle
            <Cite id="balanis-2016" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why is the radiation resistance of an electrically-short antenna so low?">
          <p>
            Because radiation resistance scales as (L/λ)² for a short electric dipole. A 1-m wire at
            1 MHz (λ = 300 m) has L/λ ≈ 0.0033, so R<sub>rad</sub> ≈ (2π η₀/3)·(0.0033)² ≈
            <strong className="text-text font-medium"> 0.0086 Ω</strong> — far smaller than the
            wire's own ohmic resistance. Most of the input power dissipates as heat in the wire
            rather than radiating away. That's why AM broadcast stations need 100-m+ tower antennas
            (to get up to λ/4 or more at kHz frequencies), and why a "rubber duck" handheld VHF
            antenna is a compromise that sacrifices radiation efficiency for portability
            <Cite id="balanis-2016" in={SOURCES} />
            <Cite id="kraus-marhefka-2002" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="How fast does information propagate from a transmitter to a receiver?">
          <p>
            At the speed of light c. The phase velocity of a plane wave in vacuum is c (exactly, by
            definition since 1983); modulated signals on a wireless link propagate at the group
            velocity, which equals c for non-dispersive vacuum. In an atmosphere the refractive
            index is slightly above 1 (n ≈ 1.0003 at sea level), reducing the propagation speed by
            ~0.03%, negligible for most uses. In an optical fibre or coaxial cable, signals travel
            at c/n where n is the dielectric's index — typically ~0.66 c in coax (PE dielectric)
            <Cite id="friis-1946" in={SOURCES} />. GPS depends on millisecond-level propagation-time
            accuracy to compute positions to metres, and the atmospheric corrections to "exactly c"
            are part of the receiver's job.
          </p>
        </FAQItem>

        <FAQItem q="Why doesn't a Yagi work well below its design frequency?">
          <p>
            Because at frequencies below the design frequency, the elements are all slightly shorter
            than λ/2 — the driven element no longer resonates (large capacitive reactance, hard to
            match), the reflector no longer reflects (it's not long enough to be inductive), and the
            directors no longer direct (they're not short enough to be capacitive). Pattern
            multiplication requires the parasitic elements to be slightly off-resonance in specific
            senses; below the design frequency, they're all off in the wrong direction. Above the
            design frequency, the pattern degrades less gracefully but still suffers. A typical
            Yagi's usable bandwidth is ±5–10% of the design frequency
            <Cite id="balanis-2016" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What is an electrically-small antenna, and what limits it?">
          <p>
            An electrically-small antenna has dimensions much less than λ (ka ≪ 1, where k is the
            wavenumber and a is the smallest sphere enclosing the antenna). The fundamental limit on
            it is the <em className="text-text italic">Chu-Harrington limit</em>: the minimum Q (and
            hence the maximum bandwidth, since Q ≈ f/Δf) of any radiator confined to a sphere of
            radius a is approximately Q<sub>min</sub> ≈ 1/(ka)³. Push k·a too small and the antenna
            becomes infinitely narrowband, infinitely high-Q, and impossible to match. This is why a
            1-m wire at 100 kHz is a bad antenna and why AM broadcast towers are big: you can't
            shrink an HF antenna below ~λ/8 without giving up most of the usable radiation
            resistance and bandwidth
            <Cite id="balanis-2016" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why does adding a director sometimes hurt a Yagi instead of helping?">
          <p>
            Because the optimal director length and spacing change as more directors are added —
            each additional director sees a different combined field from the others, and shifting
            its length even slightly can throw off the pattern. A 5-element Yagi designed by
            trial-and-error in the 1930s gets ~10 dBi; a modern optimised 5-element Yagi
            (computer-designed) gets ~11 dBi. The gain difference is real and comes from getting
            every director-length and -spacing tuned to its locally-optimal value. Adding a sixth
            director without re-optimising the first five generally produces
            <em className="text-text italic"> less</em> gain than removing it. Modern antenna design
            uses electromagnetic simulation (Method of Moments, FDTD) to find the global optimum
            <Cite id="balanis-2016" in={SOURCES} />
            <Cite id="kraus-marhefka-2002" in={SOURCES} />.
          </p>
        </FAQItem>
      </FAQ>
    </ChapterShell>
  );
}
