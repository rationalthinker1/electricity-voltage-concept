/**
 * Chapter 15 — Fourier and harmonic analysis
 *
 * Every periodic signal is a sum of sines. Builds from Fourier 1822 through
 * the analytic series formula, harmonic synthesis (Gibbs phenomenon),
 * Parseval's RMS, harmonics through a linear filter (links Ch.16's H(jω)),
 * harmonic distortion in real circuits (grid harmonics, THD, IEEE 519),
 * and the FFT.
 *
 * Demos:
 *   15.1 Harmonic synthesis     (square / triangle / sawtooth, Gibbs)
 *   15.2 Fourier spectrum       (bar charts for 6 canonical waves)
 *   15.3 Square through LPF     (input + |H| + output)
 *   15.4 THD and distortion     (symmetric clipping, odd harmonics, THD)
 *   15.5 RMS of a complex wave  (Parseval + form/crest factor)
 *   15.6 FFT operation count    (N² vs N log N + N=8 butterfly)
 */
import { CaseStudies, CaseStudy } from '@/components/CaseStudy';
import { ChapterShell } from '@/components/ChapterShell';
import { FAQ, FAQItem } from '@/components/FAQ';
import { Cite } from '@/components/SourcesList';
import { Formula, InlineMath } from '@/components/Formula';
import { Pullout } from '@/components/Prose';
import { Term } from '@/components/Term';
import { TryIt } from '@/components/TryIt';
import { FFTAlgorithmAnimationDemo } from './demos/FFTAlgorithmAnimation';
import { FourierSpectrumDemo } from './demos/FourierSpectrum';
import { HarmonicSynthesisDemo } from './demos/HarmonicSynthesis';
import { RMSOfComplexWaveDemo } from './demos/RMSOfComplexWave';
import { SquareThroughLPFDemo } from './demos/SquareThroughLPF';
import { THDAndDistortionDemo } from './demos/THDAndDistortion';
import { getChapter } from './data/chapters';

export default function Ch15FourierHarmonics() {
  const chapter = getChapter('fourier-harmonics')!;
  const SOURCES = chapter.sources;

  return (
    <ChapterShell chapter={chapter}>
      <p className="mb-prose-3 first-letter:font-2 first-letter:font-light first-letter:text-[4em] first-letter:leading-none first-letter:float-left first-letter:m-[4px_12px_-4px_0] first-letter:text-accent">
        Strike middle-C on a piano. The string is tuned so that its first mode of vibration is at <strong className="text-text font-medium">261.6 Hz</strong>;
        the soundboard radiates that frequency into the room and the ear hears a single, pure note. Except the string isn't
        actually producing a single frequency. It's producing 261.6 Hz <em className="italic text-text">and</em> 523 Hz <em className="italic text-text">and</em> 785 Hz <em className="italic text-text">and</em>
        1046 Hz, and on up through dozens of integer multiples — each with its own amplitude set by the hammer's strike
        position and the soundboard's resonance. The mix is what makes a piano sound different from a violin or a flute playing
        the same note. The mix is the timbre. And the mix is exactly what the rest of this chapter is about.
      </p>
      <p className="mb-prose-3">
        Or look at a digital line on a circuit board. Probe a clock running at 100 MHz with an oscilloscope; the waveform on
        screen is a clean-ish square wave, edges climbing in a few hundred picoseconds. Now sweep a spectrum analyser across
        the same line. You don't see a single peak at 100 MHz; you see a forest of peaks at 100, 300, 500, 700 MHz, and on up
        to several gigahertz. That clean 5 V digital signal is radiating EMI at frequencies a hundred times higher than its
        nominal rate, because it is — mathematically and physically — a <em className="italic text-text">sum</em> of sines at all those frequencies. Strip
        out the high ones with a filter and the edges go from picoseconds to nanoseconds.
      </p>
      <p className="mb-prose-3">
        Joseph Fourier published the theorem behind both observations in 1822, in a book on the conduction of heat. The
        theorem says: every reasonably-well-behaved periodic function can be written as a sum of sines and cosines at integer
        multiples of one fundamental frequency. The piano string and the square wave are special cases. So is every periodic
        voltage in every circuit. The whole of signal processing rests on that one sentence.
      </p>

      <h2 className="font-2 font-light italic text-[clamp(28px,3.5vw,42px)] leading-1 tracking-1 text-text mt-3xl mb-2xl max-w-[28ch]">Fourier 1822</h2>

      <p className="mb-prose-3">
        Jean-Baptiste Joseph Fourier was a French mathematician working for Napoleon's administration in Grenoble when he
        wrote <em className="italic text-text">Théorie analytique de la chaleur</em><Cite id="fourier-1822" in={SOURCES} />. The problem he was solving
        was the conduction of heat in a solid: how does a temperature profile imposed on a metal bar relax over time? His
        method was to expand the initial temperature distribution as a series of sine and cosine terms — each of which is an
        eigenfunction of the heat equation, with its own exponentially-decaying time evolution — sum the evolved terms back
        up, and read off the answer.
      </p>
      <p className="mb-prose-3">
        The mathematical claim underneath the method was breathtaking: that <em className="italic text-text">any</em> reasonable periodic function on a
        finite interval could be written this way, no matter how spiky or how discontinuous. Lagrange, then the senior
        mathematician in France, refused to accept it; he had spent decades arguing that arbitrary functions could not be
        represented by trigonometric series. Fourier was right and Lagrange was wrong — though it took another half-century
        of careful work (Dirichlet 1829, Riemann 1854) to pin down precisely which functions qualified and in what sense the
        series converged<Cite id="bracewell-2000" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        The result became the foundation of signal processing, communications, audio engineering, image compression, optics,
        quantum mechanics, and power electronics. Every piece of working hardware in this textbook — capacitor, inductor,
        amplifier, antenna, generator, switching converter — is analysed using <Term def="The decomposition of a periodic function into an infinite sum of sines and cosines at integer multiples of a fundamental frequency. Joseph Fourier, 1822.">Fourier series</Term> at
        some point in its design.
      </p>

      <h2 className="font-2 font-light italic text-[clamp(28px,3.5vw,42px)] leading-1 tracking-1 text-text mt-3xl mb-2xl max-w-[28ch]">The series formula</h2>

      <p className="mb-prose-3">
        Let <strong className="text-text font-medium">f(t)</strong> be periodic with period <strong className="text-text font-medium">T</strong>, so f(t + T) = f(t) for all t. Define the
        fundamental angular frequency as <strong className="text-text font-medium">ω₀ = 2π/T</strong>. Fourier's theorem says that f decomposes
        as<Cite id="oppenheim-willsky-1997" in={SOURCES} />:
      </p>
      <Formula>
        f(t) = a<sub>0</sub>/2 + Σ<sub>n=1</sub><sup>∞</sup> [a<sub>n</sub> cos(nω<sub>0</sub>t) + b<sub>n</sub> sin(nω<sub>0</sub>t)]
      </Formula>
      <p className="mb-prose-3">
        Stare at that sum for a moment. It says: pick a list of sine and cosine waves whose periods <em className="italic text-text">fit evenly</em> into
        the interval T — one fits once, one twice, one three times, on up — choose the right amplitudes a<sub>n</sub> and
        b<sub>n</sub>, and you can add them up to make literally any periodic shape you like. The reason the
        frequencies have to be integer multiples of ω<sub>0</sub> is that any non-integer-multiple sine would <em className="italic text-text">not</em>
        return to its starting value after time T; it would still be in the middle of a cycle. Only sines whose period
        divides T cleanly leave the function looking the same at t and at t + T. Restricting to <Term def="An integer multiple of the fundamental: nω₀ for n = 1, 2, 3, ... Only these frequencies preserve periodicity T.">integer-multiple frequencies</Term> is
        not a choice — it is forced by the periodicity.
      </p>
      <p className="mb-prose-3">
        The <strong className="text-text font-medium">a<sub>0</sub>/2</strong> term out front is just the DC offset — the constant cosine (cos(0) = 1) that the
        sum needs in case f has a nonzero mean. The factor of 1/2 isn't a mistake; it falls out of the same projection formula
        the other coefficients use, applied to the n = 0 case. Writing it that way keeps all of the a<sub>n</sub> formulas
        below uniform.
      </p>
      <p className="mb-prose-3">
        The integer <strong className="text-text font-medium">n</strong> indexes the <Term def="A sinusoidal component of a periodic signal at an integer multiple of the fundamental frequency. The n-th harmonic is at nf₀.">harmonic</Term> of the
        <Term def="The lowest frequency in the Fourier series of a periodic signal, f₀ = 1/T. All other components sit at integer multiples of f₀.">fundamental frequency</Term>. The
        <Term def="The amplitude a_n or b_n of one term in a Fourier series, given by an integral that projects the function onto cos(nω₀t) or sin(nω₀t).">Fourier coefficients</Term> a<sub>n</sub> and b<sub>n</sub> are extracted from f by the projection integrals:
      </p>
      <Formula>
        a<sub>n</sub> = (2/T) ∫<sub>0</sub><sup>T</sup> f(t) cos(nω<sub>0</sub>t) dt
      </Formula>
      <Formula>
        b<sub>n</sub> = (2/T) ∫<sub>0</sub><sup>T</sup> f(t) sin(nω<sub>0</sub>t) dt
      </Formula>
      <p className="mb-prose-3">
        These integrals look intimidating until you recognise them as <em className="italic text-text">dot products</em>. In ordinary 3D, the x-component
        of a vector <strong className="text-text font-medium">v</strong> is <em className="italic text-text">v · x̂</em> — the dot product with the unit vector along x. The integral
        ∫f(t) cos(nω<sub>0</sub>t) dt is the same construction, just applied in an infinite-dimensional space whose
        &ldquo;axes&rdquo; are the basis functions cos(nω<sub>0</sub>t) and sin(nω<sub>0</sub>t) rather than the three
        Cartesian directions. The integral is the
        <Term def="The infinite-dimensional generalisation of the dot product: ⟨f, g⟩ = ∫f(t)g(t) dt. Two functions are 'orthogonal' if this integral is zero, the same way two vectors are perpendicular when their dot product is zero.">inner product</Term>; it measures &ldquo;how much of cos(nω<sub>0</sub>t) is in f.&rdquo;
      </p>
      <p className="mb-prose-3">
        Where does the <strong className="text-text font-medium">2/T</strong> out front come from? It is just normalisation by the length of the basis vector.
        In 3D, x̂ is a unit vector, so <em className="italic text-text">v · x̂</em> gives the x-component directly. The Fourier basis functions are
        <em className="italic text-text">not</em> unit length: ∫<sub>0</sub><sup>T</sup> cos²(nω<sub>0</sub>t) dt = T/2, because cos² averages to 1/2 over a
        full period and the interval has length T. To turn a raw inner product into a coefficient you divide by the squared
        length T/2 — which is exactly the factor 2/T. The &ldquo;2&rdquo; is geometric, not magical. The reason the
        DC term uses a<sub>0</sub>/2 (with the &frac12;) is that the constant basis function <em className="italic text-text">1</em> has squared length T,
        not T/2 — so its normaliser is 1/T, and to write it with the same 2/T formula as the other a<sub>n</sub> you carry an
        extra factor of 1/2 on the term itself.
      </p>
      <p className="mb-prose-3">
        The geometry behind these formulas is the same geometry that lets you decompose a 3D vector into its x, y, and z
        components. The sines and cosines {`{1, cos(ω₀t), sin(ω₀t), cos(2ω₀t), sin(2ω₀t), ...}`} form an orthonormal basis on
        the interval <InlineMath>[0, T]</InlineMath>: any two distinct basis functions, multiplied together and integrated
        over one period, give zero. So multiplying f(t) by the n-th basis function and integrating picks out exactly that
        function's projection onto f. The coefficient is the inner product
        <em className="italic text-text"> ⟨f, basis<sub>n</sub>⟩</em>; the series is f expanded in that basis<Cite id="bracewell-2000" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        The <strong className="text-text font-medium">a<sub>0</sub>/2</strong> term is the DC component — the mean value of f over one period. A function with
        zero average has a<sub>0</sub> = 0. If f is <Term def="A function with f(−t) = f(t). Its Fourier series contains only cosine (and DC) terms; all b_n vanish.">even</Term> (f(−t) = f(t)), only the cosine terms survive — all b<sub>n</sub> are
        zero. If f is <Term def="A function with f(−t) = −f(t). Its Fourier series contains only sine terms; the DC and all a_n vanish.">odd</Term> (f(−t) = −f(t)), only the sine terms survive. Symmetry kills half the work before
        you start.
      </p>
      <p className="mb-prose-3">
        It is worth being explicit about the orthogonality identity that the whole construction rests on. For any positive
        integers m and n:
      </p>
      <Formula>
        ∫<sub>0</sub><sup>T</sup> sin(mω<sub>0</sub>t) cos(nω<sub>0</sub>t) dt = 0 &nbsp; (for all m, n)
      </Formula>
      <p className="mb-prose-3">
        Why is this zero? The product-to-sum identity rewrites the integrand as
        <em className="italic text-text"> ½ [sin((m+n)ω<sub>0</sub>t) + sin((m−n)ω<sub>0</sub>t)]</em> — two pure sines at integer multiples of ω<sub>0</sub>.
        Every such sine completes an integer number of cycles in [0, T], and an integer number of cycles of a sine averages to
        zero. Equivalently: think of sin(ω<sub>0</sub>t) and cos(ω<sub>0</sub>t) as the y- and x-components of a unit phasor
        rotating on a circle. Sin and cos point at right angles in the complex plane; their inner product is zero by the same
        geometry that says <em className="italic text-text">x̂ · ŷ = 0</em>. The analogous identities ∫sin(mω<sub>0</sub>t) sin(nω<sub>0</sub>t) dt and
        ∫cos(mω<sub>0</sub>t) cos(nω<sub>0</sub>t) dt also vanish whenever m ≠ n, by the same trick.
      </p>
      <Pullout>
        The Fourier series isn't a clever trick. It is just the dot product, run on functions instead of arrows.
      </Pullout>

      <TryIt
        tag="Try 15.1"
        question={
          <>
            A square wave of peak amplitude V₀ has Fourier series
            <em className="italic text-text"> V(t) = (4 V₀ / π)[sin(ω₀ t) + sin(3 ω₀ t)/3 + sin(5 ω₀ t)/5 + …]</em>. What is the peak amplitude
            of the <strong className="text-text font-medium">5th harmonic</strong>?
          </>
        }
        hint="The 5th harmonic is the term with sin(5ω₀t). Read its coefficient out of the series."
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">
              The 5th-harmonic term in the series is <em className="italic text-text">(4 V₀ / π) · sin(5ω₀ t) / 5</em>. The coefficient of sin(5ω₀ t)
              is therefore:
            </p>
            <Formula>
              V<sub>5,peak</sub> = (4 V<sub>0</sub>) / (π · 5) = 4 V<sub>0</sub> / (5π) ≈ <strong className="text-text font-medium">0.255 V<sub>0</sub></strong>
            </Formula>
            <p className="mb-prose-1 last:mb-0">
              For a V<sub>0</sub> = 1 V square wave, that's about <strong className="text-text font-medium">255 mV</strong> at frequency 5f<sub>0</sub>
              <Cite id="oppenheim-willsky-1997" in={SOURCES} />. The amplitude rolls off as 1/n; the 11th harmonic is
              already down at ~115 mV, and the 21st at ~60 mV.
            </p>
          </>
        }
      />

      <h2 className="font-2 font-light italic text-[clamp(28px,3.5vw,42px)] leading-1 tracking-1 text-text mt-3xl mb-2xl max-w-[28ch]">Harmonic synthesis and the Gibbs overshoot</h2>

      <p className="mb-prose-3">
        A square wave with peak V₀ and period T has Fourier series<Cite id="oppenheim-willsky-1997" in={SOURCES} />:
      </p>
      <Formula>
        V(t) = (4 V<sub>0</sub> / π)[sin(ω<sub>0</sub> t) + sin(3 ω<sub>0</sub> t)/3 + sin(5 ω<sub>0</sub> t)/5 + …]
      </Formula>
      <p className="mb-prose-3">
        Two features of this series cry out for an explanation. First, <em className="italic text-text">why only odd harmonics?</em> A square wave shifted
        by half a period is the negative of itself: f(t + T/2) = −f(t). Plug that into a sine of frequency nω<sub>0</sub>: a
        shift of T/2 advances the phase by nπ. For even n, that phase shift is a multiple of 2π — the sine returns unchanged,
        which is incompatible with the function flipping sign. So the even-n components must vanish; the symmetry literally
        zeros them out. The same argument forces all the a<sub>n</sub> (cosines) to vanish, because the square is also odd
        about t = 0.
      </p>
      <p className="mb-prose-3">
        Second, <em className="italic text-text">why amplitudes that fall as 1/n?</em> Each b<sub>n</sub> is the projection integral
        (2/T) ∫ sq(t) sin(nω<sub>0</sub>t) dt. Because the square is constant ±V<sub>0</sub>, the integral reduces to counting
        the net area under sin(nω<sub>0</sub>t) over a half-period — which works out to <em className="italic text-text">4V<sub>0</sub>/(nπ)</em>. The
        factor of n in the denominator appears because a higher-frequency sine spends more time near zero and less near its
        peaks per half-period of the square; its average over the half-period scales inversely with how many extra wiggles it
        squeezes into the same span. The slow 1/n roll-off is also why a square is a stress test for filters: it carries
        non-negligible energy out to very high harmonics, and any system that can't keep up will show distortion long before
        the bandlimit you might have expected.
      </p>
      <p className="mb-prose-3">
        Only the odd harmonics appear — a consequence of half-wave symmetry, f(t + T/2) = −f(t), which kills every even-n
        term. The amplitudes fall as 1/n: the 3rd harmonic is one-third the height of the fundamental, the 5th one-fifth, and
        so on. Truncate the series at any finite N and you get a band-limited approximation to the square; let N go to
        infinity and the approximation converges to the square pointwise everywhere except at the discontinuities themselves.
      </p>

      <HarmonicSynthesisDemo />

      <p className="mb-prose-3">
        Watch the demo. At N = 1 you have just the fundamental — a single smooth sine. At N = 3 the 3rd harmonic is added
        and the top of the wave starts to flatten. By N = 11 you can already see square corners taking shape, and by N = 25
        the ripple between corners is small. But the corners themselves never get sharp, and there is always a small spike
        that overshoots the target by about 9% just before each transition. That spike is the
        <Term def="The persistent ~8.95% overshoot at jump discontinuities of a truncated Fourier series, named after J. Willard Gibbs (1899). The overshoot does not vanish as N → ∞; it merely narrows in time.">Gibbs phenomenon</Term>: a real, persistent
        feature of any truncated Fourier series at a jump discontinuity. The overshoot does not get smaller as you add more
        harmonics; only the width of the overshoot shrinks<Cite id="bracewell-2000" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        Here is the intuition. A perfect step discontinuity is, in some sense, &ldquo;infinitely high frequency&rdquo; — you
        change V<sub>0</sub> volts in zero time, which a real signal cannot do. Any truncated Fourier sum is band-limited (it
        contains frequencies up to Nω<sub>0</sub> and nothing higher) and a band-limited function literally cannot follow an
        infinitely fast jump. So near the discontinuity the partial sum must overshoot — and it does, by a fixed fraction of
        the jump height that turns out to be <em className="italic text-text">(1/π) · ∫<sub>0</sub><sup>π</sup> sinc(x) dx − 1/2 ≈ 0.0895</em>, exactly
        8.95% of the step. As N grows, the wave gets closer to the target everywhere <em className="italic text-text">except</em> in a thin band right at
        the jump, whose width shrinks like 1/N. The overshoot height stays at 9% forever; you can never sum your way out of
        it. This is more than a curiosity — the same effect appears as ringing artefacts in MRI images reconstructed from
        truncated k-space, as pre-echo in lossy audio codecs, and as the &ldquo;ringing&rdquo; on an oscilloscope step
        response that has been heavily filtered.
      </p>
      <p className="mb-prose-3">
        The triangle wave behaves differently. Its coefficients fall as 1/n², not 1/n, so the partial sum converges much
        faster — by N = 5 it is essentially indistinguishable from the target. Triangles, with continuous waveforms and only
        slope discontinuities, are kinder to Fourier than squares.
      </p>

      <FourierSpectrumDemo />

      <p className="mb-prose-3">
        The spectrum demo lets you compare six canonical waveforms side-by-side. A sine has one bar at the fundamental.
        Square and sawtooth have bars at all harmonics (or every odd one), falling as 1/n. Triangle's bars fall as 1/n² — a
        much &ldquo;cleaner&rdquo; spectrum. Half- and full-rectified sines, the output of a diode rectifier feeding an AC
        input, carry a DC component plus only even harmonics — the basis of every linear power supply and a useful clue when
        you scope a mystery waveform and the spectrum tells you what circuit it came out of.
      </p>

      <TryIt
        tag="Try 15.2"
        question={
          <>
            A square wave of peak V₀ and period T is, in the time domain, equal to ±V₀ everywhere. So its RMS value is
            <em className="italic text-text"> V<sub>RMS</sub> = V₀ </em>. Verify this from the Fourier coefficients using Parseval's theorem.
          </>
        }
        hint="Parseval: V_RMS² = (a₀/2)² + (1/2) Σ (a_n² + b_n²). Square wave is odd, no DC; b_n = 4V₀/(nπ) for odd n."
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">
              For a square wave, a<sub>0</sub> = 0 and a<sub>n</sub> = 0 for all n. The b<sub>n</sub> are
              <em className="italic text-text"> 4V<sub>0</sub>/(nπ)</em> for odd n, zero for even n. So:
            </p>
            <Formula>
              V<sub>RMS</sub>² = (1/2) · Σ<sub>n odd</sub> [4V<sub>0</sub>/(nπ)]² = (8 V<sub>0</sub>² / π²) · Σ<sub>n odd</sub> 1/n²
            </Formula>
            <p className="mb-prose-1 last:mb-0">
              The sum <em className="italic text-text">1 + 1/9 + 1/25 + 1/49 + …</em> over odd squares equals <em className="italic text-text">π²/8</em> (a classical Euler result).
              Substituting:
            </p>
            <Formula>
              V<sub>RMS</sub>² = (8 V<sub>0</sub>² / π²) · (π²/8) = V<sub>0</sub>² &nbsp; ⇒ &nbsp; V<sub>RMS</sub> = <strong className="text-text font-medium">V<sub>0</sub></strong>
            </Formula>
            <p className="mb-prose-1 last:mb-0">
              Which is what we knew from the time-domain picture<Cite id="bracewell-2000" in={SOURCES} />. The Fourier
              expansion has to be consistent with the obvious answer — and it is.
            </p>
          </>
        }
      />

      <h2 className="font-2 font-light italic text-[clamp(28px,3.5vw,42px)] leading-1 tracking-1 text-text mt-3xl mb-2xl max-w-[28ch]">RMS and Parseval's theorem</h2>

      <p className="mb-prose-3">
        For a pure sine of peak V<sub>peak</sub>, the <Term def="Root-mean-square. The square root of the mean of the square of a signal over one period. For a resistor, V_RMS is the DC voltage that delivers the same average power.">RMS value</Term> is V<sub>peak</sub>/√2 ≈ 0.707·V<sub>peak</sub>. That number sits in
        every power-engineering identity: a 120 V wall outlet has 120 V<sub>RMS</sub> and a 170 V peak; the &ldquo;230 V&rdquo;
        UK mains has 325 V peak; the resistor dissipates I<sub>RMS</sub>²·R independent of waveform shape, but only if you
        compute I<sub>RMS</sub> correctly.
      </p>
      <p className="mb-prose-3">
        The <em className="italic text-text">only if</em> matters. For a non-sinusoidal periodic waveform, V<sub>RMS</sub> ≠ V<sub>peak</sub>/√2 in
        general. <Term def="The statement that the total mean-square value of a periodic signal equals the sum of squares of its Fourier coefficients: ⟨f²⟩ = (a₀/2)² + (1/2)Σ(a_n² + b_n²).">Parseval's theorem</Term> gives the correct identity, summing the energies of all harmonics:
      </p>
      <Formula>
        V<sub>RMS</sub>² = (a<sub>0</sub>/2)² + (1/2) Σ<sub>n=1</sub><sup>∞</sup> [a<sub>n</sub>² + b<sub>n</sub>²]
      </Formula>
      <p className="mb-prose-3">
        This is Pythagoras in infinite dimensions. In 3D, the squared length of a vector is the sum of squared components:
        <em className="italic text-text"> ||v||² = x² + y² + z²</em>. Parseval says exactly the same thing for functions — the squared &ldquo;length&rdquo;
        of f (defined as the time-average of f²) is the sum of squared lengths of its components along each independent
        basis direction. The cross-terms <em className="italic text-text">a<sub>m</sub>a<sub>n</sub> · 2cos(mω<sub>0</sub>t)cos(nω<sub>0</sub>t)</em>
        that would otherwise show up in ⟨f, f⟩ all integrate to zero, because the basis is orthogonal. The factor of 1/2 in
        front of each squared coefficient is the same one we kept tripping over earlier: a sine of peak amplitude A has
        mean-square A²/2, because cos² averages to 1/2 over a period. Every harmonic carries half of its peak² of energy.
      </p>
      <p className="mb-prose-3">
        Equivalently, if you know the peak amplitudes V<sub>n</sub> of each harmonic and the DC offset V<sub>0</sub>:
      </p>
      <Formula>
        V<sub>RMS</sub> = √[V<sub>0</sub>² + (1/2) Σ V<sub>n</sub>²]
      </Formula>
      <p className="mb-prose-3">
        Read this as &ldquo;each harmonic is an independent source of mean-square energy.&rdquo; They add by squares —
        Pythagoras — not linearly. The fundamental and the 3rd harmonic don't constructively combine into something larger
        than √2× either of them, and they don't destructively cancel either; they sit at right angles in the function space
        and their energies simply add. The DC term is special: it has no oscillation to average down, so its full V<sub>0</sub>²
        contributes directly (with no factor of 1/2). Everything else gets the cos² half-factor.
      </p>
      <Pullout>
        Each harmonic carries its own energy. The total mean-square is just the sum — Pythagoras in a basis of sines.
      </Pullout>
      <p className="mb-prose-3">
        The geometric content is the same orthonormality that let us extract the coefficients in the first place: total
        mean-square energy is the sum of mean-square energies in each independent basis direction. The cross-terms vanish
        because the basis is orthogonal<Cite id="bracewell-2000" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        The practical implication: a non-sinusoidal voltage delivers more RMS — and therefore more <strong className="text-text font-medium">I²R</strong> heating —
        into a resistive load than its fundamental alone would suggest. A 1 V<sub>peak</sub> square wave has V<sub>RMS</sub> = 1 V,
        not 0.707 V. The extra 41% comes from the harmonic ladder above the fundamental.
      </p>

      <RMSOfComplexWaveDemo />

      <p className="mb-prose-3">
        Two more shape descriptors come up in power engineering. The <Term def="V_RMS divided by V_avg (mean of |f|). For a pure sine, form factor = π/(2√2) ≈ 1.111. Deviations measure how peaky the waveform is.">form factor</Term> V<sub>RMS</sub>/V<sub>avg</sub> compares the
        RMS to the average of |V|; for a pure sine it equals π/(2√2) ≈ 1.111. The
        <Term def="V_peak divided by V_RMS. For a pure sine, crest factor = √2 ≈ 1.414. Sharp pulses have crest factors of 3–10 or more.">crest factor</Term> V<sub>peak</sub>/V<sub>RMS</sub> = √2 ≈ 1.414 for a sine. Both numbers shift the moment you
        introduce harmonics. Pulse-shaped current draws from switch-mode supplies have crest factors of 3 to 5; lightning
        impulses can hit 10. A multimeter's true-RMS mode samples the waveform and computes the RMS directly from the samples,
        because the cheap meter's &ldquo;rectify-and-scale&rdquo; method assumes a sine-shaped waveform and silently fails on
        anything else<Cite id="horowitz-hill-2015" in={SOURCES} />.
      </p>

      <h2 className="font-2 font-light italic text-[clamp(28px,3.5vw,42px)] leading-1 tracking-1 text-text mt-3xl mb-2xl max-w-[28ch]">Harmonics through a linear filter</h2>

      <p className="mb-prose-3">
        Chapter 12 introduced impedance and chapter 16 introduces the transfer function H(jω): the complex ratio of output
        phasor to input phasor at a single frequency ω, encoding both the gain |H(jω)| and the phase shift ∠H(jω) the filter
        applies. Fourier shifts that single-frequency story into a sum-of-frequencies story. A signal with harmonics at ω<sub>0</sub>,
        2ω<sub>0</sub>, 3ω<sub>0</sub>, ... passes through a linear filter one harmonic at a time, because the filter is by
        definition linear: each harmonic is independently scaled by <em className="italic text-text">|H(jnω<sub>0</sub>)|</em> and phase-shifted by
        <em className="italic text-text"> ∠H(jnω<sub>0</sub>)</em><Cite id="oppenheim-willsky-1997" in={SOURCES} />:
      </p>
      <Formula>
        if f<sub>in</sub>(t) = Σ V<sub>n</sub> sin(nω<sub>0</sub>t + φ<sub>n</sub>), then f<sub>out</sub>(t) = Σ |H(jnω<sub>0</sub>)| V<sub>n</sub> sin(nω<sub>0</sub>t + φ<sub>n</sub> + ∠H(jnω<sub>0</sub>))
      </Formula>
      <p className="mb-prose-3">
        This formula is the entire reason filters are designable. The harmonics are orthogonal, so the filter can be analysed
        one frequency at a time: harmonic n enters at amplitude V<sub>n</sub>, gets multiplied by the complex number
        H(jnω<sub>0</sub>) — which scales its amplitude by <em className="italic text-text">|H(jnω<sub>0</sub>)|</em> and rotates its phase by
        <em className="italic text-text"> ∠H(jnω<sub>0</sub>)</em> — and exits independently of every other harmonic. The filter does not couple harmonic
        3 to harmonic 5; they don't talk to each other on the way through. That uncoupling is exactly the same orthogonality
        that made the projection integrals work in the first place.
      </p>
      <p className="mb-prose-3">
        If filters didn't have this property, designing one would require solving a system of equations that coupled all
        frequencies at once — intractable. Instead, you draw a single curve |H(jω)| versus ω (the
        <Term def="The magnitude of the transfer function as a function of frequency: |H(jω)| versus ω. A filter's design specification.">magnitude response</Term>) and another
        ∠H(jω) versus ω (the <Term def="The angle of the transfer function as a function of frequency: ∠H(jω) versus ω. Determines the time delay each harmonic experiences.">phase response</Term>), and you can read off what the filter does to any signal by sampling those two curves at the
        signal's harmonics. The whole field of filter design — Butterworth, Chebyshev, elliptic, Bessel — is built on this
        one observation.
      </p>
      <p className="mb-prose-3">
        Run a square wave through an RC low-pass with corner frequency f<sub>c</sub>. The fundamental at f<sub>0</sub> sees
        gain 1/√(1+(f<sub>0</sub>/f<sub>c</sub>)²) and phase −arctan(f<sub>0</sub>/f<sub>c</sub>). The 3rd harmonic at 3f<sub>0</sub>
        sees a smaller gain and bigger phase shift. The 5th, 7th, 9th, ... get knocked down progressively harder. Reconstruct
        the output and the square's corners round off into a slewed, droop-shaped wave whose corners take roughly RC seconds
        to settle.
      </p>

      <SquareThroughLPFDemo />

      <Pullout>
        A square wave is just a list of sine waves with the right amplitudes. The low-pass filter takes the list and throws
        away the high-frequency entries.
      </Pullout>

      <p className="mb-prose-3">
        That single observation is why every PCB designer puts a small series resistor or a ferrite bead on a fast digital
        line. The resistor and the parasitic capacitance form an inadvertent low-pass that strips off the high harmonics —
        which are the ones radiating EMI, the ones causing crosstalk, and the ones that aren't carrying any useful
        information about the bit transitions. A 100 MHz clock with edges slowed from 100 ps to 1 ns radiates 10× less above
        1 GHz<Cite id="horowitz-hill-2015" in={SOURCES} />. Same Fourier logic, applied in reverse.
      </p>

      <TryIt
        tag="Try 15.3"
        question={
          <>
            A signal is a 60 Hz fundamental at 100 V peak, plus a 3rd harmonic at 30% of fundamental amplitude (so 30 V peak at
            180 Hz). What is its total harmonic distortion, defined as <em className="italic text-text">THD = √(Σ<sub>n≥2</sub> V<sub>n</sub>²) / V<sub>1</sub></em>?
          </>
        }
        hint="Only the 3rd harmonic exists above the fundamental, so the numerator collapses to one term."
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">
              By definition,
            </p>
            <Formula>
              THD = √(V<sub>3</sub>²) / V<sub>1</sub> = V<sub>3</sub> / V<sub>1</sub> = 30 / 100 = <strong className="text-text font-medium">30%</strong>
            </Formula>
            <p className="mb-prose-1 last:mb-0">
              For a signal with only one harmonic above the fundamental, the THD is just the amplitude ratio. A real-world
              utility 3rd-harmonic injection of 30% would be enormous and well outside the IEEE 519 limits, which cap
              individual harmonics on a public grid below 5%<Cite id="horowitz-hill-2015" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2 className="font-2 font-light italic text-[clamp(28px,3.5vw,42px)] leading-1 tracking-1 text-text mt-3xl mb-2xl max-w-[28ch]">Harmonics in real circuits: the grid problem</h2>

      <p className="mb-prose-3">
        For most of the 20th century, the loads on the electricity grid were resistive (incandescent lamps, resistive heaters)
        or linear-inductive (motors). Both drew current that was, to within a few percent, a clean sine in phase or slightly
        lagged from the voltage. The grid voltage stayed sinusoidal because no one was disturbing it.
      </p>
      <p className="mb-prose-3">
        Modern loads break the assumption. A switching power supply rectifies the AC line, dumps the result into a large
        electrolytic capacitor, and draws current from the line only at the peaks of each half-cycle — sharp pulses lasting
        a millisecond or two, repeated 120 times per second on a 60 Hz line. An LED driver, a laptop charger, a server PSU,
        a variable-speed motor drive — all of them do something similar. Their drawn current looks nothing like a sine; it
        has a crest factor of 3 or more and rich harmonic content from the 3rd up through the 50th<Cite id="grainger-power-systems-2003" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        Those harmonic currents flowing through the finite source impedance of the grid (transformer leakage inductance, line
        impedance) produce harmonic <em className="italic text-text">voltages</em> on the grid that every neighbour sees. The classic symptom is the
        flat-topped voltage waveform on a heavily loaded distribution feeder: V(t) clipped at its peaks because so many SMPS
        loads are simultaneously pulling current there. Once distorted, the grid voltage drives the next generation of
        non-linear loads even harder — a positive-feedback loop that bothers utilities everywhere.
      </p>

      <THDAndDistortionDemo />

      <p className="mb-prose-3">
        The shorthand for the problem is <Term def="Total harmonic distortion. The ratio of the RMS of all harmonic components (n ≥ 2) to the RMS of the fundamental, usually expressed as a percentage.">total harmonic distortion (THD)</Term>:
      </p>
      <Formula>
        THD = √(V<sub>2</sub>² + V<sub>3</sub>² + V<sub>4</sub>² + …) / V<sub>1</sub>
      </Formula>
      <p className="mb-prose-3">
        THD is a Pythagoras ratio: the RMS &ldquo;length&rdquo; of everything above the fundamental, divided by the RMS of the
        fundamental itself. The squares-then-square-root structure is unavoidable because energies, not amplitudes, are what
        add across orthogonal harmonics — and energy goes as amplitude squared. If a signal had two harmonics at the same
        amplitude V<sub>n</sub> = V<sub>m</sub> = V, the contribution to the numerator would be √2 · V, not 2V, because the
        two are at right angles in function space. The denominator V<sub>1</sub> is the fundamental — the &ldquo;intended&rdquo;
        signal — so THD literally answers &ldquo;what fraction of my signal is junk?&rdquo;
      </p>
      <p className="mb-prose-3">
        with V<sub>n</sub> the RMS amplitude of the n-th harmonic and V<sub>1</sub> the RMS of the fundamental. Audio
        engineers quote it in percent; power engineers quote it in percent too, but reference IEEE 519 (the standard
        governing utility-side harmonic limits): individual harmonic voltages must stay below 3–5% of fundamental on a public
        bus, total under 5–8%, depending on the voltage class<Cite id="horowitz-hill-2015" in={SOURCES} />. The mitigation is
        either passive (tuned LC traps placed at the offending harmonic, on each side of an industrial drive) or active
        (power-factor-correction circuits that pre-distort the load current so the drawn waveform stays sinusoidal).
      </p>
      <p className="mb-prose-3">
        Three more places harmonics bite. In a three-phase system, the 3rd, 9th, 15th, ... &ldquo;triplen&rdquo; harmonics
        from each phase all add up in the neutral wire instead of cancelling — a neutral that is sized for the &ldquo;balanced
        load&rdquo; assumption can carry 1.5–2× its expected current and overheat<Cite id="grainger-power-systems-2003" in={SOURCES} />.
        In a transformer, harmonic currents in the windings cause extra I²R losses (because the resistance rises with skin
        depth at higher frequency) plus extra core losses; a transformer feeding non-linear load must be derated. And in
        anything with an LC resonance, a harmonic at the resonant frequency excites the resonance to dangerously high voltage
        — the basis of the &ldquo;ferro-resonance&rdquo; failure mode in unloaded distribution transformers.
      </p>

      <h2 className="font-2 font-light italic text-[clamp(28px,3.5vw,42px)] leading-1 tracking-1 text-text mt-3xl mb-2xl max-w-[28ch]">The Fast Fourier Transform</h2>

      <p className="mb-prose-3">
        Fourier's theorem is about periodic continuous functions. The
        <Term def="The Fourier transform of a finite sequence of N samples — converts N samples in time to N complex amplitudes in frequency.">discrete Fourier transform</Term> (DFT) is its
        sampled cousin: given N samples x[0], x[1], ..., x[N−1] of a signal, the DFT produces N complex amplitudes
        X[0], ..., X[N−1] — one for each frequency bin from DC up to the Nyquist frequency. The formula is direct:
      </p>
      <Formula>
        X[k] = Σ<sub>n=0</sub><sup>N−1</sup> x[n] · e<sup>−j 2π k n / N</sup>
      </Formula>
      <p className="mb-prose-3">
        Compare this with the continuous projection integral a<sub>k</sub> = (2/T) ∫ f(t) cos(kω<sub>0</sub>t) dt. The
        structure is identical — a sum that pairs each sample of x with a complex sinusoid at frequency k. The complex
        exponential <em className="italic text-text">e<sup>−j 2π k n / N</sup></em> is just cos(2π k n / N) − j sin(2π k n / N), a pair of basis functions
        bundled into one rotating phasor. The sum is again an inner product: <em className="italic text-text">X[k]</em> measures &ldquo;how much of the
        k-th complex sinusoid lives in the sample sequence x.&rdquo; The complex form is more compact than carrying separate
        a<sub>n</sub> and b<sub>n</sub>; the real and imaginary parts of X[k] hold the cosine and sine projections respectively.
      </p>
      <p className="mb-prose-3">
        Compute it naively and you have N multiplies and adds for each of the N output bins — a total of <em className="italic text-text">N²</em>
        complex operations. For N = 1024 that's about a million; for N = 65536 it's about four billion. In the 1960s — when
        computers ran at megahertz, not gigahertz — that was prohibitive for any real-time signal processing.
      </p>
      <p className="mb-prose-3">
        James Cooley (IBM) and John Tukey (Princeton) published in 1965 a recursive decomposition that brings the count down
        to <em className="italic text-text">N log<sub>2</sub> N</em><Cite id="cooley-tukey-1965" in={SOURCES} />. Their idea: split the N-point DFT into
        two N/2-point DFTs — one on the even-indexed samples, one on the odd-indexed — then combine the two with N/2 complex
        multiplies (the &ldquo;butterflies&rdquo;). Recurse the split log<sub>2</sub> N times and the total operation count
        collapses to N log<sub>2</sub> N. The algorithm came to be called the
        <Term def="Fast Fourier Transform: any of a family of O(N log N) algorithms for computing the DFT. The Cooley-Tukey radix-2 decomposition is the most famous, published in 1965.">Fast Fourier Transform</Term> (FFT).
      </p>
      <p className="mb-prose-3">
        It's worth pausing on <em className="italic text-text">why</em> this divide-and-conquer even works. The DFT depends on the complex sinusoid
        <em className="italic text-text"> ω<sub>N</sub> = e<sup>−j 2π / N</sup></em>, and these have a beautiful multiplicative structure:
        <em className="italic text-text"> ω<sub>N</sub>² = ω<sub>N/2</sub></em>. In words, the basis sinusoid for a length-N DFT, squared, is the basis
        sinusoid for a length-(N/2) DFT. So whenever you encounter a power <em className="italic text-text">ω<sub>N</sub><sup>2kn</sup></em> (which arises
        when you fold the even-indexed samples of x together), it can be rewritten as <em className="italic text-text">ω<sub>N/2</sub><sup>kn</sup></em> —
        the basis vector for a smaller DFT. That algebraic identity is what makes the recursion possible. Each level of the
        recursion costs O(N) operations to combine its sub-results; there are log<sub>2</sub> N levels; the total is N log N.
        The FFT isn't a clever shortcut <em className="italic text-text">around</em> the DFT — it is the DFT computed in the order its own algebra
        suggests.
      </p>

      <FFTAlgorithmAnimationDemo />

      <p className="mb-prose-3">
        The speed-up is enormous. For N = 1024, the FFT runs in ~10 000 operations against the naive DFT's ~1 000 000 — a
        100× speed-up. For N = 4096, the factor is 340×. For a megapoint transform, it's 26 000×. Without the FFT there
        would be no real-time digital audio processing, no MP3 encoder, no oscilloscope FFT button, no software-defined
        radio, no MRI reconstruction, no OFDM modulation in WiFi and 4G LTE, no JPEG image compression
        <Cite id="oppenheim-willsky-1997" in={SOURCES} />. The 1965 paper is, in operational impact, one of the most
        consequential pieces of computer science of the 20th century.
      </p>
      <p className="mb-prose-3">
        Carl Friedrich Gauss apparently worked out an essentially equivalent algorithm by hand in 1805, while computing the
        orbit of the asteroid Pallas, and left it unpublished in his notebooks; Cooley and Tukey re-invented it 160 years
        later and brought it into the silicon era.
      </p>

      <TryIt
        tag="Try 15.4"
        question={
          <>
            You have an 8-sample audio buffer (N = 8). How many complex multiplications does the <strong className="text-text font-medium">naive DFT</strong>
            require, and how many does the radix-2 <strong className="text-text font-medium">FFT</strong> require?
          </>
        }
        hint="Naive DFT: N² operations. FFT: N · log₂ N operations."
        answer={
          <>
            <Formula>naive DFT: N² = 8² = <strong className="text-text font-medium">64 multiplies</strong></Formula>
            <Formula>FFT: N · log<sub>2</sub> N = 8 · 3 = <strong className="text-text font-medium">24 multiplies</strong></Formula>
            <p className="mb-prose-1 last:mb-0">
              A speed-up of <em className="italic text-text">64 / 24 ≈ 2.7×</em> for N = 8. Modest. For N = 1024 the ratio is 102×; for N = 65 536 it is
              1638×<Cite id="cooley-tukey-1965" in={SOURCES} />. The advantage compounds dramatically with N because the
              FFT is N log N while the naive is N² — a polynomial-of-degree-2 versus a linearithmic curve.
            </p>
          </>
        }
      />

      <h2 className="font-2 font-light italic text-[clamp(28px,3.5vw,42px)] leading-1 tracking-1 text-text mt-3xl mb-2xl max-w-[28ch]">What we have so far</h2>

      <p className="mb-prose-3">
        Every periodic signal decomposes into a sum of sines at integer multiples of one fundamental frequency. Fourier's
        coefficient formulas extract the amplitude of each harmonic by projecting the signal onto the corresponding sine or
        cosine; Parseval's theorem says the total mean-square energy is the sum of the per-harmonic energies. A linear filter
        with transfer function H(jω) acts on the signal one harmonic at a time, scaling each by |H(jnω<sub>0</sub>)| and
        shifting its phase. The reverse — synthesising a target waveform by adding sines — converges everywhere except at
        jump discontinuities, where the Gibbs phenomenon leaves a stubborn 9% overshoot no matter how many terms you keep.
        Real circuits introduce harmonics in two ways: deliberately (the square wave on a clock line, the PWM in a motor
        drive) and accidentally (a switching power supply's pulsed line current, an over-driven amplifier's clipped output).
        Either way, harmonics propagate everywhere — onto the PCB, onto the grid, into the audible spectrum — and the only
        way to manage them is to know what's there. The FFT is the standard tool for finding out.
      </p>
      <p className="mb-prose-3">
        Next chapter takes the same H(jω) machinery and uses it to design filters and op-amp circuits on purpose, plus the
        moment a wire becomes long enough that lumped analysis breaks down.
      </p>

      <CaseStudies
        intro={
          <>
            Four working systems where Fourier analysis isn't optional — it's the whole architecture.
          </>
        }
      >
        <CaseStudy
          tag="Case 15.1"
          title="MP3 and the psychoacoustic codec"
          summary="A modified DCT of every 1152-sample audio frame, scaled by a perceptual mask, then Huffman-coded — compression of ~10× with no audible loss."
          specs={[
            { label: 'Transform', value: <>Modified Discrete Cosine Transform (MDCT) on 36-sample windows × 32 sub-bands <Cite id="oppenheim-willsky-1997" in={SOURCES} /></> },
            { label: 'Sample rate', value: <>44.1 kHz (CD) / 48 kHz (broadcast)</> },
            { label: 'Frame size', value: <>1152 samples per channel</> },
            { label: 'Bit rate', value: <>typ. 128 kbps stereo (~11× compression from 1.4 Mbps CD)</> },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            MP3 (MPEG-1 Audio Layer III, 1993) works by Fourier-transforming each short window of audio into a frequency
            spectrum, then using a psychoacoustic model to decide which frequency components are masked by louder neighbours
            and can be quantised more coarsely — or thrown away entirely. The ear cannot resolve a quiet tone within ~150 Hz
            of a loud one; it cannot hear a sound at all for ~50 ms after a loud transient. Both observations translate
            directly into &ldquo;reduce the bits assigned to those frequency bins in this frame.&rdquo; The frequency-domain
            representation is what makes the trick possible: in the time domain, the &ldquo;masked&rdquo; signal is
            inextricable from the masking one.
          </p>
          <p className="mb-prose-2 last:mb-0">
            Architecturally the encoder is a pipeline of orthogonal transforms (a 32-band polyphase filter bank followed by
            an 18-point MDCT) plus a psychoacoustic side-chain that drives the quantiser's bit allocation. The decoder runs
            the same transforms backwards. AAC, Vorbis, Opus, and FLAC variants all use the same Fourier-domain bones with
            different masking models and entropy coders<Cite id="oppenheim-willsky-1997" in={SOURCES} />. The basic principle —
            that a sine-component representation makes lossy compression possible because the ear listens in the frequency
            domain — is Fourier 1822 cashed in for 200 years of compounding interest.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 15.2"
          title="IEEE 519 grid harmonic limits"
          summary="Voltage harmonics on a public bus must stay under ~5% of fundamental; non-linear loads must inject under specified per-harmonic current limits."
          specs={[
            { label: 'V_THD at PCC (≤ 1 kV)', value: <>≤ 8.0% <Cite id="grainger-power-systems-2003" in={SOURCES} /></> },
            { label: 'V_THD at PCC (69–161 kV)', value: <>≤ 2.5% <Cite id="grainger-power-systems-2003" in={SOURCES} /></> },
            { label: 'Per-harmonic V limit', value: <>≤ 3–5%, depending on order n</> },
            { label: 'I limits', value: <>scaled by short-circuit ratio I_sc / I_L</> },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            The IEEE 519 standard (most recent revision 2022) sets the harmonic-distortion limits at the
            <em className="italic text-text"> point of common coupling</em> (PCC) — the bus where one customer's installation meets the rest of the
            grid. Voltage limits are placed on the utility: it must deliver a bus whose THD is below a few percent.
            Current limits are placed on the customer: a non-linear load may inject only specified harmonic currents,
            scaled by how strong (i.e., low-impedance) the bus at that PCC is. The compromise is what keeps the grid
            voltage close to sinusoidal even as millions of SMPS loads pull pulsed currents through it.
          </p>
          <p className="mb-prose-2 last:mb-0">
            Mitigation in practice has two flavours. Passive: install LC traps tuned to the dominant harmonic (typically
            the 5th and 7th from six-pulse rectifiers; the 11th and 13th from twelve-pulse) on the customer's bus, so the
            harmonic currents circulate locally instead of escaping onto the grid. Active: install a power-factor-correction
            (PFC) front end that draws line current proportional to the line voltage, pre-distorting the input current to
            stay sinusoidal regardless of what the downstream load looks like<Cite id="horowitz-hill-2015" in={SOURCES} />.
            Modern laptop power supplies above ~75 W are PFC-mandated in the EU; the front-end boost converter that does the
            shaping is a direct application of Fourier-domain thinking to a power-electronics problem.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 15.3"
          title="The oscilloscope FFT button"
          summary="A 1 GS/s scope captures 1 M samples, FFTs the buffer, and shows a 500 MHz spectrum with ~1 kHz resolution — pressing one button reveals the frequency content of any waveform."
          specs={[
            { label: 'Sample rate', value: <>typ. 1–10 GS/s for bench scopes</> },
            { label: 'Buffer size', value: <>10⁴–10⁷ samples</> },
            { label: 'Frequency span', value: <>0 to f_s/2 (Nyquist)</> },
            { label: 'Bin resolution', value: <>Δf = f_s / N <Cite id="oppenheim-willsky-1997" in={SOURCES} /></> },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            A modern digital oscilloscope ships with an FFT button that converts the captured time-domain record into a
            frequency-domain plot in real time. The acquisition is straightforward: sample the input at f<sub>s</sub> for a
            time window of length N/f<sub>s</sub>, apply a window function (Hann, Hamming, Blackman) to soften the
            edge-truncation artefacts, FFT the windowed buffer, and display |X[k]| versus frequency. The output spans 0 to
            f<sub>s</sub>/2 (the Nyquist frequency) with bin spacing f<sub>s</sub>/N.
          </p>
          <p className="mb-prose-2 last:mb-0">
            For practical bench debug, the FFT scope view turns &ldquo;why is my output noisy?&rdquo; from hours of guesswork
            into seconds of diagnosis. A 10 kHz peak on a power-supply ripple plot tells you which switching converter is
            misbehaving. A 60 Hz peak says your probe is picking up ground-loop hum. A peak at half the clock rate reveals
            metastability oscillation. None of this would be possible without an FFT running on a small embedded processor
            inside the scope — running at 10⁹ samples per second, the naive DFT would take ~10¹⁸ operations per buffer; with
            the FFT it takes ~10⁷, and finishes in milliseconds<Cite id="cooley-tukey-1965" in={SOURCES} />.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 15.4"
          title="Hammond organ — additive synthesis with drawbars"
          summary="Nine drawbars set the amplitudes of nine integer harmonics; the player builds any vowel-like timbre by adjusting the mix in real time."
          specs={[
            { label: 'Harmonics', value: <>9 tonewheels at f, 2f, 3f, 4f, 5f, 6f, 8f, plus sub-octave f/2 and sub-third 2f/3</> },
            { label: 'Drawbar range', value: <>0 (off) to 8 (full); each step is ~3 dB</> },
            { label: 'Tone generator', value: <>91 mechanical tonewheels rotating past pickups (Hammond, 1934)</> },
            { label: 'Synthesis class', value: <>additive — direct construction of Fourier series</> },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            Laurens Hammond's 1934 electromechanical organ is the most literal possible implementation of Fourier synthesis.
            A single shaft drives 91 small toothed metal disks (&ldquo;tonewheels&rdquo;) past inductive pickups; each
            tonewheel produces a near-sinusoidal voltage at its own integer-multiple frequency. The organist's nine
            drawbars are nine independent attenuators that select how much of each of nine harmonics — sub-octave, sub-third,
            fundamental, 2nd, 3rd, 4th, 5th, 6th, and 8th — is mixed into the output bus<Cite id="oppenheim-willsky-1997" in={SOURCES} />.
            Pull the fundamental and 3rd to full and silence the rest: that's a triangle-like tone. Pull odd harmonics in
            ratio 1, 1/3, 1/5, 1/7, ...: that's a square. The drawbar settings literally are the Fourier coefficients of
            the timbre, set by the player in real time.
          </p>
          <p className="mb-prose-2 last:mb-0">
            Modern digital additive synthesisers (Kawai's K5, the Hammond clones built into every digital workstation) do
            the same thing computationally, summing up to 256 sine partials with arbitrary time-varying amplitudes.
            Subtractive synthesisers (Moog, ARP, MS-20) take the dual approach: start with a harmonically-rich square or
            sawtooth and remove harmonics with a tunable filter. Both are Fourier in two different directions — additive
            builds the spectrum directly; subtractive shapes a pre-built spectrum through H(jω). The musician chooses based
            on which timbres are easier to reach in their preferred direction.
          </p>
        </CaseStudy>
      </CaseStudies>

      <FAQ
        intro="Loose threads — questions a careful reader tends to surface."
      >
        <FAQItem q="Why do a violin and a piano sound different on the same note?">
          <p>
            Both produce the same fundamental frequency — say 440 Hz for an A above middle C — but each adds a different
            distribution of harmonic amplitudes (and decay envelopes) on top. A piano's hammer-struck string is rich in
            harmonics for the first few hundred milliseconds, then the higher harmonics decay faster than the lower ones,
            giving a percussive attack and a sustained sine-like tail. A bowed violin string sits in a continuous
            slip-stick oscillation that maintains all harmonics for as long as the bow moves; the resulting spectrum is
            both richer and more stable, producing the more &ldquo;vocal&rdquo; sound. Neither instrument is putting out
            a pure sine — that would sound like a tuning fork or a synthesiser test tone, distinctly &ldquo;artificial&rdquo;
            <Cite id="bracewell-2000" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What's the difference between a Fourier series and a Fourier transform?">
          <p>
            The series is for periodic signals: it returns a <em className="italic text-text">discrete</em> spectrum, one amplitude at each integer
            multiple of the fundamental frequency. The transform is for finite-energy non-periodic signals: it returns a
            <em className="italic text-text"> continuous</em> spectrum, an amplitude density as a function of ω over the whole real line. The transform is
            what you get by letting the period T of the series go to infinity; the spacing between harmonic bins shrinks to
            zero and the discrete sum becomes an integral. Both are part of the same family: a signal that lives in time
            also lives, equivalently, in frequency<Cite id="oppenheim-willsky-1997" in={SOURCES} /><Cite id="bracewell-2000" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why are harmonics at integer multiples of the fundamental and not arbitrary frequencies?">
          <p>
            Because the signal is periodic with period T. To be periodic, every component must return to its starting value
            after time T, which means each component must complete an integer number of cycles in T. Frequency 1/T is the
            fundamental; frequencies 2/T, 3/T, 4/T, ... are the only other choices that fit. Any non-integer-multiple
            frequency would still have a periodicity, but not at T — it would beat against the fundamental and produce a
            longer composite period that's the least common multiple of the two<Cite id="oppenheim-willsky-1997" in={SOURCES} />.
            For a true periodic signal of period T, integer multiples are forced by the geometry.
          </p>
        </FAQItem>

        <FAQItem q="Can a non-periodic signal have a Fourier representation?">
          <p>
            Yes — the Fourier <em className="italic text-text">transform</em> handles non-periodic signals. The trade-off is that the spectrum becomes
            continuous instead of discrete: instead of one amplitude per integer harmonic, you get an amplitude density
            <em className="italic text-text"> X(ω)</em> defined for all real ω, and synthesis is by integral instead of sum. For most practical
            engineering signals (a single audio waveform of finite length, a one-shot pulse) this is exactly the right tool.
            For periodic signals (a sustained tone, an AC line voltage) the series is more natural<Cite id="bracewell-2000" in={SOURCES} />.
            A finite-length signal can be analysed by either: by transforming it directly, or by treating it as one period
            of a periodic extension and using the series.
          </p>
        </FAQItem>

        <FAQItem q="What's Nyquist's theorem and why does it matter for sampling?">
          <p>
            If you sample a continuous signal at rate f<sub>s</sub>, you can faithfully reconstruct the signal only if it
            contains no frequency components above <em className="italic text-text">f<sub>s</sub>/2</em> — the Nyquist frequency. Components above f<sub>s</sub>/2
            don't disappear; they <em className="italic text-text">alias</em> down to lower frequencies and corrupt the reconstruction. CDs sample at
            44.1 kHz to capture the audible spectrum up to ~22 kHz; a megahertz-resolution oscilloscope samples at 10⁹ Hz to
            capture up to 500 MHz; a software-defined radio at 200 MS/s captures up to 100 MHz. The lower-frequency hardware
            in front of the ADC (a low-pass &ldquo;anti-alias filter&rdquo;) is there to guarantee no energy above f<sub>s</sub>/2
            reaches the ADC in the first place<Cite id="oppenheim-willsky-1997" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why does my SMPS make my lights flicker on the same circuit?">
          <p>
            The switch-mode power supply draws current in narrow pulses around the AC peaks. Those pulses, flowing through
            the finite source impedance of the house wiring and the upstream transformer, cause a momentary voltage dip on
            the line at the same instants — flat-topping the 60 Hz waveform. Any incandescent or simple-LED lamp on the
            same circuit sees that distorted voltage and dims at the same 120 Hz rate as the SMPS's current peaks. The
            effect is invisible at small SMPS loads (one charger) but visible with several kilowatts (a server rack, a row
            of laptop chargers). The mitigation is power-factor correction on the SMPS — which shapes the input current to
            be sinusoidal — or simply spreading the loads across more circuits<Cite id="grainger-power-systems-2003" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What does Gibbs ringing look like in an MRI image?">
          <p>
            Bright and dark fringes parallel to any sharp tissue boundary — visible especially at the edge of the skull or
            at an air-tissue interface. The mechanism is the same as in the time-domain demo: an MRI image is reconstructed
            from a finite, sampled patch of the spatial frequency domain (&ldquo;k-space&rdquo;). Truncating at the highest
            sampled k introduces Gibbs overshoot at every step discontinuity in the image — a ~9% ripple that doesn't
            disappear with finer sampling. Radiologists are trained to recognise the artefact and not mistake it for a
            real anatomical structure; the cure is more k-space samples (longer scan time) or post-processing filters that
            apodise the truncation at the cost of slight spatial blurring<Cite id="bracewell-2000" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why is the FFT so important?">
          <p>
            Because it shifted spectral analysis from off-line batch processing to real-time. The naive DFT is O(N²); the
            FFT is O(N log N). For N = 1024 the speed-up is 100×; for N = 65 536 it is 1638×; for N = 16 M (a typical
            radar buffer) it is over 600 000×<Cite id="cooley-tukey-1965" in={SOURCES} />. None of MP3 encoding, JPEG
            compression, software-defined radio, real-time spectrum analysis, OFDM modulation (WiFi, 4G LTE, 5G NR), MRI
            reconstruction, X-ray CT reconstruction, or sonar beamforming would be tractable without it. The 1965 paper
            quietly enabled a generation of consumer electronics.
          </p>
        </FAQItem>

        <FAQItem q="What's the difference between DFT and FFT?">
          <p>
            The DFT is a mathematical definition: the linear map from N time-domain samples to N complex frequency-domain
            amplitudes. The FFT is a family of <em className="italic text-text">algorithms</em> for computing that map quickly. Cooley-Tukey radix-2 is
            the most famous, but mixed-radix, prime-factor (Good-Thomas, 1958), Winograd (1976), and Bluestein's chirp-z
            (1968) are all FFTs. They all return the same DFT; they just take different paths to get there. The choice
            depends on N's factorisation and on whether you want minimum multiplies or maximum cache locality
            <Cite id="oppenheim-willsky-1997" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Can I have a periodic signal with only even harmonics?">
          <p>
            Yes — any signal whose period is actually <em className="italic text-text">T/2</em>, not T, but which you choose to analyse on the interval
            [0, T]. A full-wave-rectified sine, for example, has period π/ω₀ — half the original sine's period — so when
            you write its Fourier series on the interval [0, 2π/ω₀] you find only DC and even harmonics, no odd ones. More
            generally, a signal with <em className="italic text-text">half-wave anti-symmetry</em> f(t + T/2) = −f(t) has only odd harmonics (sines and
            cosines vanish on even n); a signal with half-wave <em className="italic text-text">symmetry</em> f(t + T/2) = f(t) has only even harmonics
            (and that's just saying the &ldquo;real&rdquo; period is T/2)<Cite id="oppenheim-willsky-1997" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What is aliasing, and how do I avoid it?">
          <p>
            Aliasing is the wrong frequencies you see in a sampled signal when the signal contains components above the
            Nyquist frequency f<sub>s</sub>/2. A 30 kHz tone sampled at 44.1 kHz aliases to 14.1 kHz; a 1 GHz signal
            sampled at 1.2 GHz aliases to 200 MHz. You can't undo the aliasing after sampling — the lost information is
            gone. The standard cure is an analog low-pass &ldquo;anti-alias&rdquo; filter in front of the ADC, set with its
            corner well below f<sub>s</sub>/2 and steep enough to be effectively zero by f<sub>s</sub>/2. Modern oversampling
            ADCs use a much higher internal sample rate plus a digital filter and decimation, which relaxes the analog
            filter requirements at the cost of more silicon<Cite id="horowitz-hill-2015" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why does a square wave have only odd harmonics?">
          <p>
            Because it has <em className="italic text-text">half-wave anti-symmetry</em>: shift it by half a period and you get the negative of the
            original. In Fourier terms, the symmetry constraint f(t + T/2) = −f(t) forces a<sub>n</sub> = b<sub>n</sub> = 0
            for all even n. The 2nd, 4th, 6th, ... harmonics simply don't have the right symmetry to fit a square wave; only
            sines at f, 3f, 5f, 7f, ... do. Triangle waves and sawtooth waves with the same half-wave anti-symmetry follow
            the same rule. Asymmetric waveforms (sawtooth, half-rectified sine) have all harmonics
            <Cite id="oppenheim-willsky-1997" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why does the Gibbs overshoot stay at ~9% no matter how many harmonics I add?">
          <p>
            Because the overshoot is a feature of pointwise convergence, not uniform convergence. As N increases, the
            partial sum gets closer to the target everywhere <em className="italic text-text">except</em> in a vanishingly thin band right at the
            discontinuity, where it overshoots by a fixed ~8.95% of the jump height. The band gets narrower with each
            doubling of N — its width scales as 1/N — but the peak height of the overshoot stays the same. Mathematically
            the overshoot equals (1/π) · ∫₀^π sin(t)/t dt − 1/2 ≈ 0.0895, derived by Maxime Bôcher in 1906 and named after
            Gibbs's 1899 correspondence with <em className="italic text-text">Nature</em><Cite id="bracewell-2000" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What is a 'power spectrum' versus an 'amplitude spectrum'?">
          <p>
            The amplitude spectrum is |X(ω)|: the magnitude of each Fourier component. The power spectrum is |X(ω)|² (often
            normalised by the analysis bandwidth so it has units of power per hertz). Audio engineers usually plot the
            amplitude spectrum in dB-volts; RF engineers usually plot the power spectrum in dBm or dBW. Either captures the
            same information about a deterministic signal; the power form is convenient when you want to invoke Parseval
            (total power = integral of the power spectrum) or when you're working with random signals whose individual
            components don't have well-defined phases<Cite id="bracewell-2000" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why do 3-phase systems struggle with 3rd-harmonic loads?">
          <p>
            In a balanced three-phase system, the three line currents are sines 120° apart in phase. The fundamentals (and
            the 5th, 7th, 11th, ... harmonics) sum to zero in the neutral wire — that's the whole point of three-phase. But
            3rd, 9th, 15th, ... harmonics (the &ldquo;triplens&rdquo;) are <em className="italic text-text">in phase</em> across all three lines, because
            3 × 120° = 360° = 0°. So they add up in the neutral rather than cancelling, and a neutral sized for the
            balanced-load assumption can carry 1.5–2× its expected current, run hot, and become a fire hazard. Buildings
            with heavy SMPS loads (server farms, LED-lit offices) often oversize the neutral by 2× for this reason
            <Cite id="grainger-power-systems-2003" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why does a multimeter need a 'true RMS' mode?">
          <p>
            A cheap meter measures the average of |V|, then multiplies by 1.111 (the form factor of a pure sine) to estimate
            V<sub>RMS</sub>. Feed it a sine and the answer is correct. Feed it a square, a triangle, a clipped sine, or a
            current pulse — anything with a different form factor — and the answer is wrong, sometimes by tens of percent.
            A true-RMS meter samples the waveform at hundreds of points per cycle and computes V<sub>RMS</sub> directly from
            <em className="italic text-text"> √⟨V²⟩</em>, which is right for any shape. For measurements in modern electronics — where SMPS, PWM, and
            digital signals are everywhere — true-RMS is no longer optional<Cite id="horowitz-hill-2015" in={SOURCES} />.
          </p>
        </FAQItem>
      </FAQ>
    </ChapterShell>
  );
}
