import { ChapterShell } from '@/components/ChapterShell';
import { Cite } from '@/components/SourcesList';
import { FAQ, FAQItem } from '@/components/FAQ';
import { CaseStudies, CaseStudy } from '@/components/CaseStudy';
import { Formula } from '@/components/Formula';
import { Pullout } from '@/components/Prose';
import { TryIt } from '@/components/TryIt';
import { getChapter } from './data/chapters';

export default function Ch27FiberOptics() {
  const chapter = getChapter('fiber-optics')!;
  const SOURCES = chapter.sources;

  return (
    <ChapterShell chapter={chapter}>
      <p>
        Imagine streaming a high-definition video across an ocean. The data
        travels not through copper wires, but through a thin glass strand
        thinner than a human hair, bouncing light pulses at near the speed of
        light with minimal loss. This is fiber optics: the backbone of modern
        telecommunications, where electromagnetic waves in the optical
        spectrum carry information through engineered materials.
      </p>
      <p>
        Fiber optics builds on the wave nature of light we explored in optics,
        but adds the practical engineering of guiding waves through
        dielectrics. We'll see how total internal reflection confines light,
        how material properties control attenuation, and how dispersion limits
        bandwidth—concepts that turn abstract EM theory into the cables
        powering the internet.
      </p>

      <h2>Total Internal Reflection</h2>
      <p>
        At the heart of fiber optics is total internal reflection, where light
        traveling from a high-index material (like glass) to a low-index one
        (like air) reflects entirely if the angle is shallow enough. This
        confines light to the fiber core, allowing it to propagate over
        kilometers.
      </p>
      <p>
        The critical angle θ_c is given by Snell's law at grazing incidence:
      </p>
      <Formula>θ<sub>c</sub> = arcsin(n<sub>2</sub>/n<sub>1</sub>)</Formula>
      <p>
        where <strong>n₁</strong> is the refractive index of the core and
        <strong>n₂</strong> of the cladding (both greater than 1 for glass).
        For angles θ &lt; θ_c, total internal reflection occurs, guiding the
        ray along the fiber<Cite id="griffiths-4e" in={SOURCES} />.
      </p>
      {/* TODO: Add demo for ray tracing in fiber */}

      <h2>Numerical Aperture and Acceptance</h2>
      <p>
        The numerical aperture (NA) quantifies how much light a fiber can
        accept. It's the sine of the maximum acceptance angle θ_max:
      </p>
      <Formula>NA = n<sub>1</sub> √(1 - (n<sub>2</sub>/n<sub>1</sub>)<sup>2</sup>)</Formula>
      <p>
        where the terms are as above. Higher NA means broader acceptance,
        useful for coupling light sources, but trades off with confinement
        for long-distance transmission<Cite id="jackson-3e" in={SOURCES} />.
      </p>
      {/* Demo: acceptance cone visualization */}

      <h2>Attenuation and Loss</h2>
      <p>
        Light attenuates exponentially in fibers due to absorption and
        scattering. The power loss follows:
      </p>
      <Formula>P(z) = P<sub>0</sub> e<sup>-α z</sup></Formula>
      <p>
        where <strong>α</strong> is the attenuation coefficient (in dB/km),
        typically 0.2 dB/km for modern silica fibers. Material impurities and
        Rayleigh scattering dominate at optical wavelengths<Cite id="ashcroft-mermin-1976" in={SOURCES} />.
      </p>
      {/* Demo: attenuation vs. distance */}

      <h2>Dispersion and Bandwidth</h2>
      <p>
        Different wavelengths travel at slightly different speeds, causing
        pulse broadening. Modal dispersion in multimode fibers and chromatic
        dispersion in single-mode limit bandwidth. The group velocity
        dispersion D quantifies this:
      </p>
      <Formula>D = - (λ/c) d<sup>2</sup>n/dλ<sup>2</sup></Formula>
      <p>
        where <strong>λ</strong> is wavelength and <strong>n</strong> the
        refractive index. Minimizing dispersion enables high-speed data
        transmission<Cite id="purcell-morin-2013" in={SOURCES} />.
      </p>
      {/* Demo: pulse spreading simulation */}

      <h2>Fiber Materials and Fabrication</h2>
      <p>
        Modern fibers are primarily silica glass (SiO₂), doped with germanium
        for higher refractive index cores. The low absorption window at 1.55 μm
        results from minimal vibrational modes in silica's tetrahedral bonds.
        Fabrication uses modified chemical vapor deposition (MCVD): silica
        layers are deposited inside a tube, then collapsed and drawn into
        fiber at 2000°C.
      </p>
      <p>
        The refractive index difference Δn = n₁ - n₂ is small (~0.005), achieved
        by precise doping. Graded-index fibers have parabolic profiles to
        reduce modal dispersion, while step-index fibers have uniform cores.
      </p>
      <Formula>Δn = n₁ - n₂</Formula>
      <p>
        Specialty fibers include photonic crystal fibers with air holes for
        unique dispersion properties, and polarization-maintaining fibers with
        stress-induced birefringence<Cite id="ashcroft-mermin-1976" in={SOURCES} />.
      </p>
      {/* Demo: refractive index profile visualization */}

      <h2>Optical Sources and Detectors</h2>
      <p>
        Data transmission requires sources to generate light and detectors to
        receive it. LEDs emit incoherent light via spontaneous emission,
        suitable for short distances. Laser diodes (LDs) provide coherent,
        narrow-band light via stimulated emission, enabling high-speed
        modulation up to 100 GHz.
      </p>
      <p>
        The power output P relates to current I as P = η I, where η is
        efficiency (~0.1-0.5). Wavelengths match fiber windows: 850 nm for
        multimode, 1310/1550 nm for single-mode.
      </p>
      <Formula>P = η I</Formula>
      <p>
        Detectors are photodiodes: PIN diodes for high speed, avalanche
        photodiodes (APDs) for gain via impact ionization. Responsivity R
        (A/W) depends on wavelength; quantum efficiency η_q = hc/(eλ) for
        ideal detection. Noise from thermal and shot effects limits sensitivity<Cite id="griffiths-4e" in={SOURCES} />.
      </p>
      <Formula>R = η_q e λ / h c</Formula>
      {/* Demo: LED/LD spectrum and photodiode response */}

      <h2>Optical Data Transmission</h2>
      <p>
        Fiber optics enables massive data transfer by encoding information as
        light pulses, leveraging the high frequency of electromagnetic waves.
        A single fiber can carry terabits per second, far exceeding copper or
        radio, because light's wavelength (around 1.55 μm) allows billions of
        cycles per second for modulation.
      </p>
      <p>
        Data is transmitted as on/off pulses (binary 1/0), but advanced schemes
        like quadrature amplitude modulation (QAM) encode multiple bits per
        symbol. The bit rate R relates to symbol rate S and bits per symbol b
        as R = S × b. For example, 64-QAM at 10 Gbaud achieves 60 Gbps per
        wavelength.
      </p>
      <Formula>R = S × b</Formula>
      <p>
        Pulses travel at ~2×10⁸ m/s in silica (c/n ≈ 0.67c), covering
        continents in milliseconds without "colliding" because each channel
        uses a unique wavelength via wavelength division multiplexing (WDM).
        Dense WDM (DWDM) packs 80+ channels spaced 0.8 nm apart, each carrying
        independent data streams.
      </p>
      <p>
        Data integrity is ensured through error correction codes (ECC) like
        Reed-Solomon, detecting and correcting bit errors from noise or
        dispersion. Bit error rate (BER) targets 10⁻¹² or better; forward error
        correction (FEC) adds redundancy, allowing correction of up to 25%
        corrupted bits. Optical time-domain reflectometry (OTDR) monitors
        fiber health, detecting breaks or attenuation changes.
      </p>
      <p>
        Long-distance transmission uses optical amplifiers (EDFAs) every
        50-100 km to boost signals without electrical conversion, maintaining
        digital integrity. The "magic" is precise engineering: stable lasers,
        temperature-controlled fibers, and adaptive equalization compensate
        for dispersion and nonlinearity, ensuring reliable transcontinental
        data flow<Cite id="griffiths-4e" in={SOURCES} />.
      </p>
      {/* Demo: WDM channel visualization or pulse train simulation */}

      <TryIt
        tag="Try 27.1"
        question={<>A fiber has n₁ = 1.46, n₂ = 1.45. Calculate NA.</>}
        hint="Use the formula for numerical aperture."
        answer={
          <>
            <p>Plug in: NA = 1.46 √(1 - (1.45/1.46)²) ≈ 0.24.</p>
            <Formula>NA = 1.46 √(1 - (1.45/1.46)<sup>2</sup>) = 0.24</Formula>
            <p>Answer: <strong>0.24</strong>.</p>
          </>
        }
      />

      <CaseStudies intro="Where fiber optics shows up in engineered systems.">
        <CaseStudy tag="Case 27.1" title="Transatlantic Cable" summary="Undersea fiber cables span oceans, carrying terabits of data with repeaters every 50-100 km to compensate for attenuation." specs={[{ label: 'Length', value: '~10,000 km' }, { label: 'Capacity', value: 'up to 100 Tbps' }, { label: 'Attenuation', value: '0.15 dB/km' }]}>
          <p>Transatlantic cables like TAT-14 connect continents, using wavelength division multiplexing (WDM) to send multiple signals simultaneously. The low attenuation of silica fibers enables this global network.</p>
        </CaseStudy>
        <CaseStudy tag="Case 27.2" title="Medical Endoscopy" summary="Flexible fiber bundles deliver light for imaging inside the body, with high resolution and minimal invasiveness." specs={[{ label: 'Fiber Diameter', value: '10-50 μm' }, { label: 'Resolution', value: 'high (visible light)' }, { label: 'Length', value: '1-2 m' }]}>
          <p>Endoscopes use coherent fiber bundles to transmit images from hard-to-reach areas, relying on total internal reflection to maintain image quality without electronic conversion.</p>
        </CaseStudy>
      </CaseStudies>

      <Pullout>
        Fiber optics is EM waves tamed: not radiating into space, but guided
        through matter to carry human knowledge across continents.
      </Pullout>

      <FAQ>
        <FAQItem q="Why use light instead of radio waves for data?">
          Light has much higher frequency, allowing more data per second via
          modulation, and fibers confine it without interference<Cite id="feynman-vol-ii" in={SOURCES} />.
        </FAQItem>
        <FAQItem q="What limits fiber bandwidth?">
          Dispersion causes pulses to spread, limiting how fast data can be sent without errors. Single-mode fibers minimize modal dispersion but still have chromatic dispersion<Cite id="griffiths-4e" in={SOURCES} />.
        </FAQItem>
        <FAQItem q="How do fibers handle bending?">
          Sharp bends can cause light to leak out if the angle exceeds the critical angle. Fibers are designed with cladding to prevent this, but excessive bending increases loss<Cite id="jackson-3e" in={SOURCES} />.
        </FAQItem>
        <FAQItem q="What's the difference between single-mode and multimode fibers?">
          Single-mode has a small core (8-10 μm) allowing only one mode, reducing dispersion for long distances. Multimode has larger cores (50-62.5 μm) for short distances with higher bandwidth density<Cite id="purcell-morin-2013" in={SOURCES} />.
        </FAQItem>
        <FAQItem q="Why is silica used for fibers?">
          Silica has low absorption in the infrared window around 1.55 μm, where attenuation is minimal due to reduced Rayleigh scattering and material absorption<Cite id="ashcroft-mermin-1976" in={SOURCES} />.
        </FAQItem>
        <FAQItem q="How does fiber optics compare to copper cables?">
          Fibers offer much higher bandwidth and lower attenuation over long distances, immune to electromagnetic interference. Copper is cheaper for short runs but limited by skin effect and crosstalk<Cite id="griffiths-4e" in={SOURCES} />.
        </FAQItem>
        <FAQItem q="What is wavelength division multiplexing (WDM)?">
          WDM sends multiple wavelengths simultaneously through a single fiber, multiplying capacity. Each channel operates independently, allowing terabit transmission without interference<Cite id="jackson-3e" in={SOURCES} />.
        </FAQItem>
        <FAQItem q="How are optical fibers manufactured?">
          Fibers are drawn from preforms using the modified chemical vapor deposition (MCVD) process, creating pure silica with precise refractive index profiles. The drawing tower pulls the fiber at high speeds while maintaining uniformity<Cite id="purcell-morin-2013" in={SOURCES} />.
        </FAQItem>
        <FAQItem q="What are optical amplifiers?">
          Erbium-doped fiber amplifiers (EDFAs) boost signals inline without conversion to electrical. They use stimulated emission in doped silica, enabling long-haul transmission without repeaters every few kilometers<Cite id="feynman-vol-ii" in={SOURCES} />.
        </FAQItem>
        <FAQItem q="How do fibers handle polarization?">
          Single-mode fibers maintain polarization poorly due to birefringence from imperfections. Polarization-maintaining fibers use stress rods to preserve polarization state for applications like interferometry<Cite id="ashcroft-mermin-1976" in={SOURCES} />.
        </FAQItem>
        <FAQItem q="What safety considerations exist with fiber optics?">
          Invisible infrared light can damage eyes without immediate pain. High-power lasers in fibers require proper termination and labeling. Mechanical stress can cause fiber breaks, releasing stored energy<Cite id="griffiths-4e" in={SOURCES} />.
        </FAQItem>
        <FAQItem q="What's the future of fiber optics?">
          Hollow-core fibers reduce nonlinearity for even higher speeds. Quantum communication uses fibers for secure key distribution. Integration with silicon photonics may enable chip-scale optical computing<Cite id="jackson-3e" in={SOURCES} />.
        </FAQItem>
        <FAQItem q="How do fibers connect to electronic devices?">
          Transceivers convert electrical signals to optical and vice versa. Photodiodes detect light pulses, while LEDs or lasers generate them. The interface must match impedances and wavelengths precisely<Cite id="purcell-morin-2013" in={SOURCES} />.
        </FAQItem>
        <FAQItem q="What environmental impact do fiber cables have?">
          Fibers use less material than copper for equivalent capacity and consume less energy in transmission. Undersea cables avoid terrestrial disruption but require careful burial to prevent damage<Cite id="feynman-vol-ii" in={SOURCES} />.
        </FAQItem>
        <FAQItem q="How does dispersion affect data rates?">
          Chromatic dispersion spreads pulses by ~1 ps/km/nm, limiting bit rates to ~10 Gbps over 100 km without compensation. Techniques like dispersion-shifted fibers or electronic equalization extend reach<Cite id="ashcroft-mermin-1976" in={SOURCES} />.
        </FAQItem>
        <FAQItem q="What are graded-index fibers?">
          Graded-index multimode fibers have a parabolic refractive index profile, reducing modal dispersion. Rays follow sinusoidal paths, arriving simultaneously despite different path lengths<Cite id="griffiths-4e" in={SOURCES} />.
        </FAQItem>
        {/* TODO: Add fiber optics specific sources to src/lib/sources.ts when integrating chapter */}
      </FAQ>
    </ChapterShell>
  );
}