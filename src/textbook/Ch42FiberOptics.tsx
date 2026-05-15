/**
 * Chapter 42 — Fiber-optic communication
 *
 * From Snell's law to the ITU DWDM grid. Builds on Ch.9 (EM waves),
 * Ch.17 (materials/refractive index), and Ch.18 (optics). The chapter
 * follows light from a single ray bouncing down a glass cylinder to a
 * fully populated 96-channel DWDM submarine system.
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
import { FiberOpticDemo } from './demos/FiberOptic';
import { FiberAttenuationDemo } from './demos/FiberAttenuation';
import { FiberLinkBudgetDemo } from './demos/FiberLinkBudget';

export default function Ch42FiberOptics() {
  const chapter = getChapter('fiber-optics')!;
  const SOURCES = chapter.sources;

  return (
    <ChapterShell chapter={chapter}>
      <p className="chapter-intro">
        Pull the cover off any internet backbone and you find a tube the diameter of a
        human hair. Inside the tube is glass — fused silica, doped to the parts-per-billion
        level, drawn from a preform like taffy. The whole global internet rides on light
        pulses bouncing down strands like this one. A single fiber pair across the floor
        of the Atlantic carries the entire data load of millions of households at once,
        and it does it by trapping infrared light through one trick of geometry: the angle
        the light strikes the glass wall is too shallow to escape.
      </p>
      <p className="mb-prose-3">
        This chapter walks the physics from that one trick — <Term def={<><strong className="text-text font-medium">total internal reflection</strong> — when light strikes the boundary between a denser and a less dense medium at a shallow enough angle, it reflects back into the denser medium with no transmitted ray at all. Discovered by Kepler 1611; quantified by Snell.</>}>total internal reflection</Term> — up to the engineering scale: why <strong className="text-text font-medium">1550 nm</strong> beat every other wavelength as the telecom standard, why a fiber the width of a hair carries more bits per second than a 10,000-pair copper trunk, and what a single erbium-doped glass section a few metres long does to keep an undersea cable lit for 8,000 km without a single electronic repeater.
      </p>

      <h2 className="chapter-h2">The one trick: total internal reflection</h2>
      <p className="mb-prose-3">
        Light slows down when it enters glass. The ratio between the speed of light in
        vacuum and the speed in the medium is the medium's <Term def={<><strong className="text-text font-medium">refractive index</strong> <em className="italic text-text">n</em> — the ratio <em className="italic text-text">c / v</em>, where <em className="italic text-text">v</em> is the phase velocity of light in the medium. Pure silica at 1550 nm has <em className="italic text-text">n</em> ≈ 1.444. Higher index means slower light, more bending at an interface.</>}>refractive index</Term> <InlineMath>n</InlineMath>. At an interface between two media, Snell's law links the angles on either side<Cite id="hecht-2017" in={SOURCES} />:
      </p>
      <Formula>n₁ sin θ₁ = n₂ sin θ₂</Formula>
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">n₁</strong> and <strong className="text-text font-medium">n₂</strong> are the refractive indices of the
        two media, <strong className="text-text font-medium">θ₁</strong> is the angle of the incoming ray to the surface
        normal (in radians or degrees), and <strong className="text-text font-medium">θ₂</strong> is the angle of the
        refracted ray on the other side. When the ray is travelling from a denser medium
        into a less dense one (n₁ &gt; n₂), the refracted angle grows faster than the
        incident angle. At a special incident angle — the <Term def={<><strong className="text-text font-medium">critical angle</strong> θ_c — the incident angle at which the refracted ray would travel parallel to the interface (sin θ₂ = 1). Beyond it, no refracted ray exists and all the light reflects back into the denser medium.</>}>critical angle</Term> — the refracted ray would be parallel to the surface, and beyond it no refracted ray exists at all. Setting θ₂ = 90° in Snell's law gives<Cite id="born-wolf-1999" in={SOURCES} />:
      </p>
      <Formula>sin θ_c = n₂ / n₁</Formula>
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">θ_c</strong> is the critical angle measured from the surface normal,
        <strong className="text-text font-medium"> n₁</strong> is the refractive index of the denser medium the light is
        travelling in, and <strong className="text-text font-medium">n₂</strong> is the index of the lighter medium beyond.
        For a typical single-mode fiber with <InlineMath>n_core = 1.448</InlineMath> and{' '}
        <InlineMath>n_clad = 1.444</InlineMath>, that critical angle (from the normal) is
        about <strong className="text-text font-medium">85.2°</strong>. Equivalently, the ray's angle measured{' '}
        <em className="italic text-text">from the fiber axis</em> must stay below <strong className="text-text font-medium">4.8°</strong>. Steeper than
        that and the light leaks out of the cladding within a few millimetres; shallower
        and it bounces along the core forever.
      </p>

      <FiberOpticDemo />

      <p className="mb-prose-3">
        Drag the angle slider in the demo. Below the critical angle, the ray zig-zags down
        the fiber by total internal reflection; above it, the ray refracts into the
        cladding and is lost within microseconds. The whole modern telecom industry rests
        on staying on the right side of that threshold.
      </p>

      <Pullout>
        A telecom fiber is a transparent rod whose only job is to keep light bouncing
        inside it — and the entire global internet rides on getting the bouncing angle
        right to within a tenth of a degree.
      </Pullout>

      <h2 className="chapter-h2">Numerical aperture and the acceptance cone</h2>
      <p className="mb-prose-3">
        A fiber doesn't accept light from every angle. Only rays entering the front face
        within a narrow cone get bent enough at the air–core interface to subsequently
        satisfy the TIR condition at the core–cladding wall. That cone's half-angle is
        the fiber's <Term def={<><strong className="text-text font-medium">numerical aperture</strong> NA — the sine of the maximum half-angle of the entry cone in air. Determined by the index step between core and cladding: NA = √(n_core² − n_clad²). A single-mode fiber typically has NA ≈ 0.14, accepting rays within ±8° of the axis.</>}>numerical aperture</Term> NA, and it's set entirely by the index step<Cite id="agrawal-2010" in={SOURCES} />:
      </p>
      <Formula>NA = √(n_core² − n_clad²)</Formula>
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">NA</strong> is dimensionless, <strong className="text-text font-medium">n_core</strong> and{' '}
        <strong className="text-text font-medium">n_clad</strong> are the refractive indices of the core and the surrounding
        cladding. The half-angle of the acceptance cone in air is then{' '}
        <InlineMath>θ_max = arcsin(NA)</InlineMath>. Standard single-mode fiber has{' '}
        <InlineMath>NA ≈ 0.14</InlineMath> (8° half-angle); multimode fiber pumps the
        index difference up to <InlineMath>NA ≈ 0.20</InlineMath> (12° half-angle)
        to make alignment with cheap LED or VCSEL sources easier<Cite id="saleh-teich-2007" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        The tradeoff is severe. A larger NA admits more rays — easier coupling — but those
        extra rays travel at different angles to the axis, so they cover different
        path lengths to the receiver. A ray bouncing at the maximum NA-allowed angle
        traverses a longer zig-zag than a ray travelling straight down the axis, and the
        spread of arrival times is called <Term def={<><strong className="text-text font-medium">modal dispersion</strong> — the pulse broadening caused by different transverse modes (or equivalently, different ray paths) reaching the receiver at slightly different times. The dominant bandwidth limit of multimode fiber.</>}>modal dispersion</Term>. In multimode fiber it's typically a few ns per km, capping data rates at ~10 Gb/s over short reaches. Single-mode fiber sidesteps the problem by making the core small enough that only one transverse mode propagates at all.
      </p>

      <TryIt
        tag="Try 42.1"
        question={<>A step-index fiber has <strong className="text-text font-medium">n_core = 1.50</strong> and <strong className="text-text font-medium">n_clad = 1.46</strong>. What is its numerical aperture and acceptance half-angle in air?</>}
        hint={<>NA = √(n_core² − n_clad²); θ_max = arcsin(NA).</>}
        answer={<>
          <p className="mb-prose-1 last:mb-0">Plug in:</p>
          <Formula>NA = √(1.50² − 1.46²) = √(2.25 − 2.1316) = √0.1184 ≈ 0.344</Formula>
          <Formula>θ_max = arcsin(0.344) ≈ 20.1°</Formula>
          <p className="mb-prose-1 last:mb-0">Acceptance half-angle: <strong className="text-text font-medium">≈ 20°</strong>. The 4% index step here is much larger than telecom SMF (~0.3%); this is closer to a graded-index multimode datacom fiber.</p>
        </>}
      />

      <h2 className="chapter-h2">Single-mode versus multimode: the V parameter</h2>
      <p className="mb-prose-3">
        How small does the core need to be to admit only one transverse mode? The cutoff
        is governed by a single dimensionless number, the <Term def={<><strong className="text-text font-medium">V parameter</strong> — also called the normalized frequency. Combines core radius, wavelength, and NA into one number that controls how many transverse modes a step-index fiber supports. V &lt; 2.405 ⇒ single-mode.</>}>V parameter</Term><Cite id="saleh-teich-2007" in={SOURCES} />:
      </p>
      <Formula>V = (2π a / λ) · NA</Formula>
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">a</strong> is the core radius (metres), <strong className="text-text font-medium">λ</strong> the
        free-space wavelength (metres), and <strong className="text-text font-medium">NA</strong> the numerical aperture.
        For a step-index fiber, only the lowest-order LP₀₁ mode propagates when{' '}
        <InlineMath>V &lt; 2.405</InlineMath> (the first zero of the Bessel function J₀).
        Standard single-mode fiber (ITU-T G.652) has a core radius of about 4.1 μm and an
        NA of 0.14<Cite id="itu-t-g652" in={SOURCES} />. At λ = 1310 nm,{' '}
        <InlineMath>V = 2π(4.1×10⁻⁶)(0.14)/(1.31×10⁻⁶) ≈ 2.75</InlineMath> — just into
        the multimode regime, but at 1550 nm V drops to 2.32 and the fiber is solidly
        single-mode. The 1310 nm cutoff is deliberate: it makes the same physical fiber
        usable at both standard telecom windows.
      </p>

      <TryIt
        tag="Try 42.2"
        question={<>You're designing a multimode fiber with core radius <strong className="text-text font-medium">a = 25 μm</strong> and <strong className="text-text font-medium">NA = 0.20</strong> for an 850 nm datacom link. How many transverse modes does it support? (For step-index fibers, the mode count is roughly <em className="italic text-text">V²/2</em>.)</>}
        hint={<>Compute V at λ = 850 nm, then divide V²/2.</>}
        answer={<>
          <p className="mb-prose-1 last:mb-0">V parameter:</p>
          <Formula>V = (2π × 25×10⁻⁶ / 850×10⁻⁹) × 0.20 ≈ 36.9</Formula>
          <p className="mb-prose-1 last:mb-0">Number of supported modes:</p>
          <Formula>N ≈ V²/2 ≈ 36.9² / 2 ≈ 681</Formula>
          <p className="mb-prose-1 last:mb-0">About <strong className="text-text font-medium">680 modes</strong> — heavily multimode, which is why this fiber is bandwidth-limited by modal dispersion and runs at 850 nm where a cheap VCSEL is enough.</p>
        </>}
      />

      <h2 className="chapter-h2">Loss: why 1550 nm won</h2>
      <p className="mb-prose-3">
        The other dimension of the problem is attenuation. A real fiber doesn't carry
        light losslessly — it has <Term def={<><strong className="text-text font-medium">attenuation</strong> α — the exponential decay rate of optical power along the fiber, measured in dB/km. Comes from Rayleigh scattering off molecular-scale density fluctuations frozen into the glass when it solidified, plus a small infrared absorption tail from the SiO₂ lattice. Modern single-mode silica at 1550 nm reaches ~0.18 dB/km.</>}>attenuation</Term> from two physical sources: <Term def={<><strong className="text-text font-medium">Rayleigh scattering</strong> — elastic scattering of light off density variations smaller than its wavelength. Scales as 1/λ⁴, so it dominates at short wavelengths and falls dramatically at longer ones. The fundamental floor for fiber loss.</>}>Rayleigh scattering</Term> from molecular-scale density fluctuations frozen into the glass, plus infrared absorption from the SiO₂ lattice. Rayleigh scaling goes as 1/λ⁴, so longer wavelengths bleed less; lattice absorption rises sharply past 1.6 μm. The sweet spot is at <strong className="text-text font-medium">1550 nm</strong>, where modern silica reaches roughly <strong className="text-text font-medium">0.18–0.20 dB/km</strong>. That figure was first demonstrated by NTT in 1979 and remains within a factor of two of the theoretical Rayleigh floor<Cite id="miya-1979" in={SOURCES} />.
      </p>

      <FiberAttenuationDemo />

      <p className="mb-prose-3">
        The story before 1979 was very different. Bulk silica in 1960 had attenuation of
        about <strong className="text-text font-medium">1000 dB/km</strong> — roughly a doubling every 3 metres — and was
        useless for communication. In 1966, Charles Kao at Standard Telecommunication
        Laboratories argued that the loss wasn't fundamental to silica; it came from
        metal-ion contamination at the parts-per-million level<Cite id="kao-hockham-1966" in={SOURCES} />. Strip the iron, copper, and hydroxyl down to parts per billion, he said, and silica should reach below 20 dB/km — the threshold that makes long-haul telecom economical. Four years later, Maurer, Keck, and Schultz at Corning demonstrated exactly that<Cite id="kapron-keck-maurer-1970" in={SOURCES} />. Kao got the 2009 Nobel Prize.
      </p>

      <h3 className="chapter-h3">The two standard windows</h3>
      <p className="mb-prose-3">
        Two operating wavelengths dominate practical deployments<Cite id="agrawal-2010" in={SOURCES} />:
      </p>
      <ul>
        <li>
          <strong className="text-text font-medium">1310 nm</strong> — the "zero-dispersion" window of standard SMF.
          Chromatic dispersion changes sign near 1310 nm, so a pulse made of multiple
          wavelengths near this point doesn't spread out as it propagates. Loss is
          higher (~0.35 dB/km), but for short links the dispersion advantage wins.
          Used in <strong className="text-text font-medium">FTTH</strong> (fiber-to-the-home), passive optical networks,
          and most datacenter interconnects up to 10 km.
        </li>
        <li>
          <strong className="text-text font-medium">1550 nm</strong> — the minimum-loss window. Standard single-mode
          fiber has nonzero dispersion here (~17 ps/nm·km), but dispersion can be
          managed with optical filters or electronic equalisation. The big advantage:
          1550 nm sits in the gain band of the erbium-doped fiber amplifier
          (1525–1565 nm, the <strong className="text-text font-medium">C-band</strong>). One EDFA every 80 km on a
          submarine cable replaces an entire room full of electronic repeaters.
          Used in essentially every long-haul terrestrial trunk and submarine cable.
        </li>
      </ul>

      <h2 className="chapter-h2">The link budget</h2>
      <p className="mb-prose-3">
        Once you know the launch power, the fiber loss per kilometre, and the receiver
        sensitivity, the reach of a fiber link reduces to one subtraction.
        Powers in fiber optics are quoted in <Term def={<><strong className="text-text font-medium">dBm</strong> — decibels relative to 1 milliwatt: P(dBm) = 10·log₁₀(P/1 mW). +0 dBm = 1 mW; +10 dBm = 10 mW; −30 dBm = 1 μW. Convenient because cascading losses add instead of multiplying.</>}>dBm</Term> precisely so that this subtraction is the natural arithmetic:
      </p>
      <Formula>P_rx = P_tx − L_connectors − α · L</Formula>
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">P_rx</strong> is the power arriving at the receiver (dBm),{' '}
        <strong className="text-text font-medium">P_tx</strong> is the power launched by the transmitter (dBm),{' '}
        <strong className="text-text font-medium">L_connectors</strong> is the total connector + splice loss in the link
        (dB), <strong className="text-text font-medium">α</strong> is the fiber attenuation (dB/km), and <strong className="text-text font-medium">L</strong>{' '}
        is the fiber length (km). The receiver locks as long as <InlineMath>P_rx</InlineMath>{' '}
        exceeds the receiver's sensitivity (typically −28 dBm for a modern coherent
        100 G receiver). The difference between launched power and sensitivity is the{' '}
        <Term def={<><strong className="text-text font-medium">link budget</strong> — the total optical loss the link can tolerate while still maintaining a working receiver, expressed as the dB margin between launched power and receiver sensitivity after subtracting fixed insertion losses.</>}>link budget</Term>; divide by α and you have the reach.
      </p>

      <FiberLinkBudgetDemo />

      <TryIt
        tag="Try 42.3"
        question={<>A 1550 nm DFB laser launches <strong className="text-text font-medium">+3 dBm</strong> into a span of ITU-T G.652 fiber at <strong className="text-text font-medium">0.22 dB/km</strong>. The receiver sensitivity is <strong className="text-text font-medium">−27 dBm</strong> and accumulated splice loss is <strong className="text-text font-medium">3 dB</strong>. What's the maximum reach without an amplifier?</>}
        hint={<>Link budget = launch − splice − sensitivity. Divide by α.</>}
        answer={<>
          <p className="mb-prose-1 last:mb-0">Budget available for fiber loss:</p>
          <Formula>Budget = 3 − 3 − (−27) = 27 dB</Formula>
          <p className="mb-prose-1 last:mb-0">Reach at 0.22 dB/km:</p>
          <Formula>L = 27 / 0.22 ≈ 123 km</Formula>
          <p className="mb-prose-1 last:mb-0">Answer: <strong className="text-text font-medium">~123 km</strong>. That's typical of a modern metro span; long-haul backbones place an EDFA every 60–100 km to extend reach to thousands of km.</p>
        </>}
      />

      <h2 className="chapter-h2">Dispersion: the bandwidth limit</h2>
      <p className="mb-prose-3">
        Loss caps the <em className="italic text-text">reach</em> of a link; <Term def={<><strong className="text-text font-medium">dispersion</strong> — the pulse-broadening that occurs when different components of a pulse (different transverse modes, or different wavelengths within a pulse) travel at slightly different group velocities and arrive smeared in time. Limits the <em className="italic text-text">bit rate × distance</em> product of a link.</>}>dispersion</Term> caps its <em className="italic text-text">data rate × distance product</em>. There are two dominant kinds in modern fiber<Cite id="agrawal-2010" in={SOURCES} />:
      </p>
      <ul>
        <li>
          <strong className="text-text font-medium">Modal dispersion</strong> — present only in multimode fiber. Different
          transverse modes travel at different group velocities, so a sharp launch pulse
          becomes a smeared arrival pulse. Typical 50 μm OM4 multimode fiber:
          ~0.1 ns/km of pulse spread, capping 10 G links to ~400 m.
        </li>
        <li>
          <strong className="text-text font-medium">Chromatic dispersion</strong> — present in every fiber. Comes from the
          wavelength-dependence of the refractive index <em className="italic text-text">n(λ)</em>: a laser pulse with
          some spectral width Δλ has its different wavelength components arrive at slightly
          different times. Quantified by the dispersion coefficient <em className="italic text-text">D</em> in
          ps/nm·km. For standard SMF, D ≈ +17 ps/nm·km at 1550 nm.
        </li>
      </ul>
      <p className="mb-prose-3">
        The pulse broadening from chromatic dispersion is{' '}
        <InlineMath>Δt = D · Δλ · L</InlineMath>, where{' '}
        <strong className="text-text font-medium">Δt</strong> is the pulse-spread in picoseconds, <strong className="text-text font-medium">D</strong> the
        dispersion coefficient (ps/nm·km), <strong className="text-text font-medium">Δλ</strong> the spectral width of the
        source (nm), and <strong className="text-text font-medium">L</strong> the fiber length (km). For coherent 100 G
        QPSK at 28 GBaud over 1000 km of standard SMF, raw chromatic dispersion would
        smear pulses by ~30 ps — comparable to the symbol period itself — so coherent
        receivers compensate it digitally in DSP, after the photodetector.
      </p>

      <h2 className="chapter-h2">WDM, EDFAs, and the petabit pipe</h2>
      <p className="mb-prose-3">
        A single 100 G channel running at 1550 nm uses about 50 GHz of optical bandwidth.
        The C-band (1530–1565 nm) is about 4 THz wide — enough room for{' '}
        <strong className="text-text font-medium">80–96 channels</strong> on the ITU-T G.694.1 grid<Cite id="itu-t-g694-1" in={SOURCES} />. <Term def={<><strong className="text-text font-medium">DWDM</strong> — Dense Wavelength Division Multiplexing. Combines multiple optical wavelengths onto a single fiber by sending each channel on a distinct ITU-grid wavelength and separating them at the receive end with a thin-film optical filter or a planar lightwave circuit. The reason a single submarine fiber pair can carry tens of Tb/s.</>}>DWDM</Term> stacks all 96 channels into one fiber pair; an array of <Term def={<><strong className="text-text font-medium">EDFA</strong> — Erbium-Doped Fiber Amplifier. A meter of silica fiber doped with erbium ions, pumped by a 980 nm or 1480 nm laser. The pumped erbium amplifies any wavelength in 1525–1565 nm by stimulated emission — all channels at once. Replaced electronic repeaters in long-haul systems starting in the early 1990s.</>}>erbium-doped fiber amplifiers</Term> every 80 km lifts the whole comb back to launch power without ever converting to electronics<Cite id="desurvire-1987" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        Multiply: 96 channels × 100 Gb/s = <strong className="text-text font-medium">9.6 Tb/s</strong> per fiber. A typical
        submarine cable contains 8–24 fibers, so a single cable carries <strong className="text-text font-medium">~100 Tb/s
        to ~250 Tb/s</strong>. Modern record-setting links push to <strong className="text-text font-medium">~25 Tb/s per fiber pair</strong>{' '}
        using probabilistic-shaping coherent modulation in a single span<Cite id="agrawal-2010" in={SOURCES} />. That number doubles roughly every 4 years — the optical analogue of Moore's law, set by digital signal processing in the coherent transponders rather than by the fiber itself.
      </p>

      <CaseStudies intro="Where this physics shows up in working systems.">
        <CaseStudy
          tag="Case 42.1"
          title="The MAREA transatlantic cable"
          summary="Microsoft + Facebook's 6,600 km, 8-fiber-pair, 200 Tb/s submarine cable from Virginia Beach to Bilbao."
          specs={[
            { label: 'Length', value: '6,605 km' },
            { label: 'Fibers', value: '8 pairs (G.654.C)' },
            { label: 'Channels / fiber', value: '~120 DWDM' },
            { label: 'Capacity', value: '200 Tb/s aggregate' },
            { label: 'Wavelength', value: 'C-band 1550 nm' },
            { label: 'EDFA spacing', value: '~90 km' },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            MAREA is one of the highest-capacity submarine systems ever deployed.
            It uses ITU-T G.654.C "cutoff-shifted" fiber rather than standard G.652
            to push the cutoff wavelength below 1530 nm and minimise nonlinear
            penalties at the high launch powers needed for trans-Atlantic spans.
            The fiber loss is about <strong className="text-text font-medium">0.155 dB/km</strong> — only ~10% above
            the Rayleigh-scattering theoretical limit<Cite id="agrawal-2010" in={SOURCES} />.
            EDFAs sit roughly every 90 km along the route, powered by a high-voltage
            DC line co-running with the optical fibers inside the same armoured
            cable, fed from shore-side converter stations at either end.
          </p>
        </CaseStudy>
        <CaseStudy
          tag="Case 42.2"
          title="A datacenter SR4 transceiver"
          summary="A 100GBASE-SR4 QSFP28 module on the front panel of a top-of-rack switch."
          specs={[
            { label: 'Reach', value: '70 m on OM3 / 100 m on OM4' },
            { label: 'Wavelength', value: '850 nm (VCSEL × 4)' },
            { label: 'Fiber type', value: 'OM4 multimode, 50 μm core' },
            { label: 'Data rate', value: '4 × 25 Gb/s NRZ' },
            { label: 'Launch power', value: '−1 dBm per lane' },
            { label: 'Cost', value: '~$50' },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            The opposite end of the fiber-optic ecosystem from MAREA. Inside an
            SR4 module sits a 4-lane <strong className="text-text font-medium">VCSEL</strong> array (Vertical
            Cavity Surface Emitting Lasers), driving four parallel multimode
            fibers at 850 nm. Each fiber carries one 25 G NRZ lane. Multimode
            fiber + cheap VCSELs is dramatically cheaper than single-mode +
            DFB lasers, and the modal dispersion is tolerable over the 100 m
            reach datacenter racks actually need. The whole module dissipates{' '}
            ~3.5 W and uses about 0.04 dollars of glass<Cite id="agrawal-2010" in={SOURCES} />.
          </p>
        </CaseStudy>
      </CaseStudies>

      <FAQ>
        <FAQItem q="If light bounces off the cladding, where exactly does the energy go?">
          Below the critical angle, the boundary is essentially a perfect mirror — the
          power coefficient of total internal reflection is exactly 1 in the ray-optics
          limit. A thin <strong className="text-text font-medium">evanescent wave</strong> does extend into the cladding by
          roughly one wavelength, but it carries no net power on average. This is what
          makes TIR so loss-free: there's no metallic mirror with finite conductivity to
          dissipate energy. The only attenuation in a well-aligned fiber is from Rayleigh
          scattering and lattice absorption in the bulk silica<Cite id="hecht-2017" in={SOURCES} />.
        </FAQItem>
        <FAQItem q="How small is the core of a single-mode fiber, really?">
          About <strong className="text-text font-medium">8–10 μm</strong> in diameter (4–5 μm radius), surrounded by
          a 125 μm cladding. That's roughly one-tenth the diameter of a human hair for
          the core, with the whole strand the width of a hair. A "fiber pair" in a
          submarine cable is two of these strands, each 125 μm in diameter and bundled
          inside a steel-armoured cable about the diameter of a garden hose<Cite id="itu-t-g652" in={SOURCES} />.
        </FAQItem>
        <FAQItem q="Why is the core just barely a higher refractive index than the cladding?">
          A bigger index contrast would let more rays enter (higher NA) and bounce at
          steeper angles, but the resulting modal dispersion would smear bits faster
          than the modulation rate. The 0.3% index step in standard SMF
          (1.448 core / 1.444 cladding) is engineered to make the V parameter sit
          right at the single-mode cutoff: small enough that only one transverse mode
          propagates, large enough that the mode is well-confined and doesn't leak in
          tight bends<Cite id="agrawal-2010" in={SOURCES} />.
        </FAQItem>
        <FAQItem q="What's the physical limit on fiber loss?">
          The Rayleigh-scattering floor for fused silica at 1550 nm is roughly{' '}
          <strong className="text-text font-medium">0.14 dB/km</strong>, set by molecular-scale density fluctuations
          frozen in when the glass cooled below its glass-transition temperature.
          Current best commercial fibers reach about 0.15–0.17 dB/km. The infrared
          absorption tail of the SiO₂ lattice cuts in past 1.6 μm and makes wavelengths
          beyond ~1650 nm impractical despite the lower Rayleigh contribution<Cite id="miya-1979" in={SOURCES} />.
        </FAQItem>
        <FAQItem q="Why doesn't the fiber leak light at a bend?">
          It can, if the bend is too sharp. The TIR condition assumes a straight wall;
          at a tight curve, rays near the inside of the bend can hit the wall at angles
          shallower than the critical angle and refract into the cladding. Standard SMF
          has a minimum bend radius of about <strong className="text-text font-medium">30 mm</strong> for negligible loss;
          purpose-built <em className="italic text-text">bend-insensitive</em> fibers (ITU-T G.657) drop that to ~10 mm
          by adding a depressed trench in the index profile to better confine the mode.
        </FAQItem>
        <FAQItem q="What actually goes wrong if you connect two fibers with a 1 μm misalignment?">
          A single-mode fiber's mode-field diameter is about 9 μm. A 1 μm transverse
          offset costs roughly <strong className="text-text font-medium">0.2 dB</strong> of coupling loss; a 5 μm offset
          drops the coupling to about 3 dB (half the power). Good fusion splices stay
          under 0.05 dB per joint by precisely aligning both cores before melting the
          glass; mechanical splices and field-installable connectors typically run
          0.3–0.7 dB per joint<Cite id="agrawal-2010" in={SOURCES} />.
        </FAQItem>
        <FAQItem q="Could you build a fiber out of plastic instead of glass?">
          Yes — plastic optical fiber (POF) exists, typically PMMA with a fluoropolymer
          cladding, 1 mm core diameter. Loss is much worse (~150 dB/km at 650 nm),
          so reach is limited to ~100 m, but it's vastly more bend-tolerant and easier
          to terminate by hand. POF is used in automotive infotainment buses and short
          industrial links. Modern long-haul telecom is entirely silica because nothing
          else comes close on the loss spec.
        </FAQItem>
        <FAQItem q="What is an EDFA actually doing physically?">
          An erbium-doped fiber amplifier is about a metre of silica fiber doped with
          erbium ions. A 980 nm or 1480 nm pump laser excites the erbium to a metastable
          state. A signal photon at 1550 nm passing through stimulates the excited erbium
          to drop back down, emitting a second 1550 nm photon coherent with the first —
          stimulated emission, the same physics as a laser. The gain is typically
          20–30 dB over the C-band, applied to every DWDM channel at once because the
          erbium gain spectrum is broad<Cite id="desurvire-1987" in={SOURCES} />.
        </FAQItem>
        <FAQItem q="How does the receiver decode the bits if dispersion smears them?">
          A modern <strong className="text-text font-medium">coherent receiver</strong> mixes the incoming light with a
          local-oscillator laser at the same wavelength, downconverts to baseband
          electrical signals (both I and Q quadratures, both polarizations), digitises
          at ~64 GSa/s, and applies digital signal processing to undo chromatic
          dispersion, polarization-mode dispersion, and even some nonlinear penalties
          before extracting the bits. The DSP block is the heaviest part of a modern
          400 G transponder — far more transistors than the rest of the module
          combined<Cite id="agrawal-2010" in={SOURCES} />.
        </FAQItem>
        <FAQItem q="Why don't we use even longer wavelengths than 1550 nm?">
          The infrared absorption tail of fused silica rises sharply past about 1.6 μm,
          adding hundreds of dB/km of loss by 1.7 μm. Alternative materials like
          fluoride glass have lower IR absorption and could in principle support
          ~2 μm operation with sub-dB/km loss, but they're mechanically fragile and
          haven't displaced silica commercially. The 1260–1625 nm range — the silica
          "telecom window" — covers essentially everything that's economic today.
        </FAQItem>
        <FAQItem q="What's the relationship between fiber dispersion and Maxwell's equations?">
          Chromatic dispersion is just the wavelength-dependence of the refractive index{' '}
          <em className="italic text-text">n(λ)</em> propagating through a wavepacket: the group velocity{' '}
          <em className="italic text-text">v_g = c / (n + ω · dn/dω)</em> depends on frequency, so a pulse made of
          multiple frequencies spreads as it travels. The <em className="italic text-text">n(λ)</em> dispersion of
          silica itself comes from the polarizability of the SiO₂ unit cell — an
          ε(ω) story (Ch.17) — modified slightly by the fiber waveguide geometry. Maxwell
          + a material's ε(ω) gives you everything<Cite id="born-wolf-1999" in={SOURCES} />.
        </FAQItem>
        <FAQItem q="Could a fiber carry an analog signal instead of digital pulses?">
          Yes, and analog-over-fiber is used in cable-TV distribution networks (CATV)
          and in radio-over-fiber links to remote cell-tower antennas. The fiber itself
          is wavelength-linear and bandwidth-flat over the channel of interest; the
          analog signal just modulates the laser intensity. Digital modulation dominates
          telecom because it's robust to fiber loss and dispersion in a way that no
          analog scheme can match at the same reach<Cite id="agrawal-2010" in={SOURCES} />.
        </FAQItem>
      </FAQ>
    </ChapterShell>
  );
}
