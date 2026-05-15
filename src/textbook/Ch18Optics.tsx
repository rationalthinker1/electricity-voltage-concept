/**
 * Chapter 14 — Optics from electromagnetism
 *
 * Drop Ch.9's plane wave onto a sheet of glass and let the four boundary
 * conditions on E and B do their work. Snell's law, Fresnel coefficients,
 * Brewster's angle, total internal reflection, thin-film interference,
 * Young's double-slit, the laser. All of optics is what classical EM looks
 * like at 10¹⁴ Hz.
 *
 * Demos:
 *   14.1 Snell's law           (interface, draggable θ, TIR at the critical angle)
 *   14.2 Dispersion            (white-light prism with n(λ) ≈ A + B/λ²)
 *   14.3 Brewster's angle      (Fresnel R_s vs R_p, polariser sunglasses)
 *   14.4 Thin film             (soap-bubble interference, 2 n t = m λ)
 *   14.5 Fiber optic           (TIR keeps the ray bouncing along the core)
 *   14.6 Young's double slit   (the wave-nature proof, fringes at sin θ = m λ/d)
 *   14.7 Laser cavity          (mirrors + gain medium + stimulated emission)
 */
import { CaseStudies, CaseStudy } from '@/components/CaseStudy';
import { ChapterShell } from '@/components/ChapterShell';
import { FAQ, FAQItem } from '@/components/FAQ';
import { Cite } from '@/components/SourcesList';
import { Formula } from '@/components/Formula';
import { Pullout } from '@/components/Prose';
import { Term } from '@/components/Term';
import { TryIt } from '@/components/TryIt';
import { BrewsterAngleDemo } from './demos/BrewsterAngle';
import { DiffractionGratingDemo } from './demos/DiffractionGrating';
import { DispersionDemo } from './demos/Dispersion';
import { DoubleSlitDemo } from './demos/DoubleSlit';
import { FiberOpticDemo } from './demos/FiberOptic';
import { LaserCavityDemo } from './demos/LaserCavity';
import { LensFocusingDemo } from './demos/LensFocusing';
import { PolarizationMalusLawDemo } from './demos/PolarizationMalusLaw';
import { SnellLaw3DDemo } from './demos/SnellLaw3D';
import { SnellsLawDemo } from './demos/SnellsLaw';
import { ThinFilmDemo } from './demos/ThinFilm';
import { getChapter } from './data/chapters';

export default function Ch14Optics() {
  const chapter = getChapter('optics')!;
  const SOURCES = chapter.sources;

  return (
    <ChapterShell chapter={chapter}>
      <p className="mb-prose-3 first-letter:font-2 first-letter:font-light first-letter:text-[4em] first-letter:leading-none first-letter:float-left first-letter:m-[4px_12px_-4px_0] first-letter:text-accent">
        Hold a piece of window glass up to a desk lamp and three things happen at once. A faint
        reflection of the room appears on the front face. The light that makes it through emerges
        on the other side bent slightly off its original line. And if you tilt the glass at just
        the right angle, the reflection of the lamp suddenly becomes much dimmer — its glare
        polarised away. Three observations, three textbook chapters of optics, and all three are
        consequences of one fact: light is the electromagnetic wave from Chapter 9, and a slab of
        glass is a region where the wave equation has a different speed.
      </p>
      <p className="mb-prose-3">
        This chapter doesn't introduce new physics. The physics has all been there since Maxwell's
        1865 paper<Cite id="maxwell-1865" in={SOURCES} />. What changes when light hits matter is
        the local <Term def="ε_r — the dimensionless factor by which a medium's permittivity exceeds vacuum. Light's phase speed in the medium is c/√εᵣ.">relative permittivity</Term> ε<sub>r</sub>, and through it the phase velocity. Boundary conditions
        on <strong className="text-text font-medium">E</strong> and <strong className="text-text font-medium">B</strong> across an interface — already mostly written
        down in Chs. 1 and 6 — force the laws of geometric optics to fall out as straight
        consequences. Snell's law, Fresnel's reflection formulae, Brewster's angle, total
        internal reflection, the thin-film colours of a soap bubble, the way a prism splits a
        sunbeam — all of them are Maxwell at 10¹⁴ Hz<Cite id="hecht-2017" in={SOURCES} />.
      </p>

      <h2 className="font-2 font-light italic text-[clamp(28px,3.5vw,42px)] leading-1 tracking-1 text-text mt-3xl mb-2xl max-w-[28ch]">The wave hits a wall</h2>

      <p className="mb-prose-3">
        Consider a plane EM wave travelling in vacuum, polarised so that <strong className="text-text font-medium">E</strong>
        oscillates in the <em className="italic text-text">y</em>-direction while <strong className="text-text font-medium">B</strong> oscillates in <em className="italic text-text">z</em>
        and the whole package propagates in <em className="italic text-text">x</em>. Now place a flat slab of glass with its
        front face perpendicular to <em className="italic text-text">x</em>. The wave hits the boundary.
      </p>
      <p className="mb-prose-3">
        Inside the glass the same equations still apply, but with ε₀ → ε₀ε<sub>r</sub>. The phase
        speed is no longer <em className="italic text-text">c</em> but <strong className="text-text font-medium">c/n</strong>, where <strong className="text-text font-medium">n = √ε<sub>r</sub></strong>
        is the <Term def="The ratio c/v of the phase speed in vacuum to the phase speed in the medium, equal to √(εᵣμᵣ) for a non-magnetic dielectric. For water n ≈ 1.33, for crown glass ≈ 1.52, for diamond ≈ 2.42.">refractive index</Term>. At the interface itself, Maxwell's equations demand four boundary
        conditions on the fields:
      </p>
      <Formula>
        E<sub>∥</sub> continuous, &nbsp;&nbsp;
        B<sub>∥</sub>/μ continuous, &nbsp;&nbsp;
        D<sub>⊥</sub> continuous, &nbsp;&nbsp;
        B<sub>⊥</sub> continuous
      </Formula>
      <p className="mb-prose-3">
        These come straight from Gauss's laws for <strong className="text-text font-medium">E</strong> and <strong className="text-text font-medium">B</strong> and
        the Ampère/Faraday line-integral theorems applied to a thin pillbox / loop straddling the
        boundary<Cite id="griffiths-2017" in={SOURCES} /><Cite id="jackson-1999" in={SOURCES} />.
        Plug a plane-wave ansatz of the form <em className="italic text-text">e<sup>i(k·r − ωt)</sup></em> into the
        continuity conditions and the consequences write themselves: there has to be a reflected
        wave with k<sub>r</sub> · n̂ = −k<sub>i</sub> · n̂ (the angle of incidence equals the
        angle of reflection), and a transmitted wave with the tangential components of k matched
        across the interface. The matching condition on the tangential <strong className="text-text font-medium">k</strong> is
        Snell's law<Cite id="hecht-2017" in={SOURCES} />.
      </p>

      <h2 className="font-2 font-light italic text-[clamp(28px,3.5vw,42px)] leading-1 tracking-1 text-text mt-3xl mb-2xl max-w-[28ch]">Snell's law from continuity</h2>

      <p className="mb-prose-3">
        Continuity of the tangential <strong className="text-text font-medium">k</strong> across an interface means
        <strong className="text-text font-medium"> k<sub>i</sub> sin θ<sub>i</sub> = k<sub>t</sub> sin θ<sub>t</sub></strong>.
        Each <strong className="text-text font-medium">k</strong> is ω/v = ωn/c in its respective medium. ω is the same on both
        sides (the boundary doesn't shift frequency), so the <strong className="text-text font-medium">k</strong>s differ only by
        their n's<Cite id="hecht-2017" in={SOURCES} /><Cite id="fresnel-1823" in={SOURCES} />:
      </p>
      <Formula>n<sub>1</sub> sin θ<sub>1</sub> = n<sub>2</sub> sin θ<sub>2</sub></Formula>
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">n<sub>1</sub></strong> and <strong className="text-text font-medium">n<sub>2</sub></strong> are the dimensionless
        refractive indices of the two media, and <strong className="text-text font-medium">θ<sub>1</sub></strong> and
        <strong className="text-text font-medium"> θ<sub>2</sub></strong> are the angles (in radians or degrees) that the incident and
        refracted rays make with the normal to the interface.
      </p>
      <p className="mb-prose-3">
        That is Willebrord Snell's 1621 rule, in our notation. A ray entering a denser medium
        (n<sub>2</sub> &gt; n<sub>1</sub>) bends <em className="italic text-text">toward</em> the normal; exiting back into a
        rarer medium it bends away. If you push the angle far enough going from dense to rare,
        sin θ<sub>2</sub> goes to one, then nothing greater can be made: there is no transmitted
        ray, and the boundary becomes a perfect mirror. That's <Term def="When light travels from a dense medium to a rare one and exceeds the critical angle θ_c = arcsin(n₂/n₁), no light can transmit — all of it reflects. The physics of optical fibres, prisms in binoculars, and the silvery sheen on the bottom of a fish tank.">total internal reflection</Term> (TIR), and the
        critical angle is <strong className="text-text font-medium">sin θ<sub>c</sub> = n<sub>2</sub>/n<sub>1</sub></strong>.
      </p>

      <SnellsLawDemo />

      <p className="mb-prose-3">
        The 2D picture is the standard textbook diagram, but it hides a structural
        fact worth seeing: all four rays — incident, reflected, refracted, and the
        surface normal — lie in a single plane, called the <em className="italic text-text">plane of incidence</em>.
        That follows directly from matching the tangential component of <strong className="text-text font-medium">k</strong>{' '}
        across the boundary: the in-plane wavevector is preserved, so any out-of-plane
        component the reflected or refracted ray might acquire is forced to be zero
        <Cite id="griffiths-2017" in={SOURCES} />. Drag the next demo around to see
        the planarity in 3D, then tilt the camera until you're looking edge-on at the
        plane and the canonical 2D refraction triangle pops back out.
      </p>

      <SnellLaw3DDemo />

      <TryIt
        tag="Try 14.1"
        question={<>Light goes from water (n = 1.33) into air (n = 1.00). What is the critical angle?</>}
        hint="sin θ_c = n₂ / n₁."
        answer={
          <>
            <Formula>sin θ<sub>c</sub> = n<sub>2</sub>/n<sub>1</sub> = 1.00 / 1.33 ≈ 0.752</Formula>
            <Formula>θ<sub>c</sub> = arcsin(0.752) ≈ <strong className="text-text font-medium">48.8°</strong></Formula>
            <p className="mb-prose-1 last:mb-0">
              Above 48.8° the underside of the water surface is a perfect mirror — which is why,
              swimming under a pool, looking up at a steep angle returns a silvery image of the
              pool floor<Cite id="hecht-2017" in={SOURCES} />.
            </p>
          </>
        }
      />

      <p className="mb-prose-3">
        Frequency stays the same across an interface; <em className="italic text-text">wavelength</em> changes by a factor of
        1/n. A 500-nm green photon in vacuum becomes a 500/1.5 ≈ 333-nm wave inside crown glass
        — same energy ℏω, shorter spatial period because v has dropped. Engineers building
        anti-reflection coatings and optical waveguides care about this constantly.
      </p>

      <h2 className="font-2 font-light italic text-[clamp(28px,3.5vw,42px)] leading-1 tracking-1 text-text mt-3xl mb-2xl max-w-[28ch]">Lenses and image formation</h2>

      <p className="mb-prose-3">
        Curve the interface and Snell's law starts doing real work. A <Term def="A piece of transparent material with two refracting surfaces shaped so that parallel rays from one direction converge to (convex) or diverge from (concave) a common focal point. Characterised by a focal length f.">lens</Term> is a slab of glass
        ground so that incoming parallel rays — all bent by Snell's law at the front face and again
        at the back — converge to a single <em className="italic text-text">focal point</em> on the far side (a converging,
        biconvex lens) or appear to diverge from a virtual focal point on the same side (a
        diverging, biconcave lens). For thin lenses the <Term def="The thin-lens approximation 1/f = 1/d_o + 1/d_i for object distance d_o, image distance d_i, and focal length f. Sign convention: distances measured along the direction of light propagation are positive; magnification m = -d_i/d_o.">thin-lens equation</Term> ties the focal
        length f, object distance d<sub>o</sub>, and image distance d<sub>i</sub> together<Cite id="hecht-2017" in={SOURCES} />:
      </p>
      <Formula>1/f = 1/d<sub>o</sub> + 1/d<sub>i</sub></Formula>
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">f</strong> is the focal length of the lens (in metres, positive for converging
        lenses), <strong className="text-text font-medium">d<sub>o</sub></strong> is the object distance from the lens (in metres,
        positive on the incoming side), and <strong className="text-text font-medium">d<sub>i</sub></strong> is the image distance from
        the lens (in metres, positive on the outgoing side for a real image).
      </p>
      <p className="mb-prose-3">
        with magnification <strong className="text-text font-medium">m = −d<sub>i</sub>/d<sub>o</sub></strong> (a dimensionless ratio;
        negative values indicate an inverted image). A converging lens with
        the object placed beyond f forms a real, inverted image; placed inside f, a virtual,
        upright, enlarged image (the magnifying glass). The same equation runs a 50-mm camera lens,
        an eyepiece, the cornea + crystalline-lens system of the human eye, and the objective of an
        astronomical refractor. Real lenses suffer from chromatic aberration (because n depends on
        λ — different colours focus at different f) and spherical aberration (because a perfect
        sphere doesn't focus a perfect point); cancelling those is most of what a professional
        optical designer does.
      </p>

      <LensFocusingDemo />

      <TryIt
        tag="Try 14.1b"
        question={<>A 50-mm converging lens forms an image of a candle 1.00 m away. Where is the image, and what is the magnification?</>}
        hint="1/f = 1/d_o + 1/d_i."
        answer={
          <>
            <Formula>1/d<sub>i</sub> = 1/f − 1/d<sub>o</sub> = 1/0.050 − 1/1.00 = 20.0 − 1.0 = 19.0 m⁻¹</Formula>
            <Formula>d<sub>i</sub> ≈ <strong className="text-text font-medium">0.0526 m = 52.6 mm</strong></Formula>
            <Formula>m = −d<sub>i</sub>/d<sub>o</sub> = −0.0526/1.00 ≈ <strong className="text-text font-medium">−0.053</strong></Formula>
            <p className="mb-prose-1 last:mb-0">
              The image forms just past the focal plane, inverted, and about 5% the size of the
              candle — a tiny upside-down candle on a sensor. That's why a 50-mm "normal" SLR lens
              with subjects ~1 m away puts a sharply-focused image right around the back of the
              barrel<Cite id="hecht-2017" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2 className="font-2 font-light italic text-[clamp(28px,3.5vw,42px)] leading-1 tracking-1 text-text mt-3xl mb-2xl max-w-[28ch]">Why a prism splits white light</h2>

      <p className="mb-prose-3">
        The refractive index n is not a constant. It depends on frequency: n = n(λ). For
        ordinary transparent dielectrics in the visible, n decreases mildly with increasing
        wavelength — violet bends more than red. Empirically, <Term def="The empirical formula n(λ) ≈ A + B/λ² + C/λ⁴ + ... fit to refractive-index data for transparent glasses in the visible. Cauchy proposed it in 1836; the Sellmeier equation (1871) is a more physically-motivated successor.">Cauchy's formula</Term> fits most
        common glasses to four-figure accuracy<Cite id="hecht-2017" in={SOURCES} />:
      </p>
      <Formula>n(λ) ≈ A + B/λ² + C/λ⁴ + …</Formula>
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">n(λ)</strong> is the dimensionless refractive index at vacuum wavelength
        <strong className="text-text font-medium"> λ</strong> (in µm by convention for the fitted constants), and <strong className="text-text font-medium">A</strong>,
        <strong className="text-text font-medium"> B</strong>, <strong className="text-text font-medium">C</strong>, … are empirical material-specific constants
        (A dimensionless; B in µm²; C in µm⁴; etc.).
      </p>
      <p className="mb-prose-3">
        Crown glass has A ≈ 1.504, B ≈ 0.00420 µm², giving n ≈ 1.514 at 700 nm (red) and
        n ≈ 1.528 at 420 nm (violet) — a spread of about 1%. Small, but it's enough that a
        triangular prism, refracting at both faces, fans visible sunlight out into a clean
        spectrum. Newton was the first to publish a careful study of the phenomenon in his
        <em className="italic text-text"> Opticks</em> of 1704, though Marci and others had noted it earlier.
      </p>

      <DispersionDemo />

      <p className="mb-prose-3">
        The microscopic reason n depends on frequency is straightforward classical mechanics: an
        atom's bound electron behaves like a damped harmonic oscillator with a natural resonant
        frequency in the ultraviolet. When you drive it with an optical-frequency field below
        resonance, the electron oscillates with finite amplitude and partially screens the
        applied field; this is what makes <strong className="text-text font-medium">ε<sub>r</sub></strong> &gt; 1. Closer to the
        UV resonance the response is larger, so n rises. Hence <Term def="The variation of refractive index with wavelength. 'Normal' dispersion has dn/dλ < 0 (violet bends more than red), away from absorption lines; 'anomalous' dispersion reverses near a resonance.">normal dispersion</Term>: n(violet) &gt;
        n(red)<Cite id="jackson-1999" in={SOURCES} />.
      </p>

      <TryIt
        tag="Try 14.2"
        question={<>Using Cauchy's fit A = 1.504, B = 0.00420 µm² for crown glass, what is n at 589 nm (the sodium-D yellow line)?</>}
        hint="Convert λ to µm before squaring."
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">
              λ = 0.589 µm, so λ² = 0.347 µm².
            </p>
            <Formula>n = 1.504 + 0.00420 / 0.347 ≈ 1.504 + 0.0121 ≈ <strong className="text-text font-medium">1.516</strong></Formula>
            <p className="mb-prose-1 last:mb-0">
              The published BK7 catalog value at the sodium-D line is n ≈ 1.5168 — Cauchy gets
              you the third decimal essentially for free<Cite id="hecht-2017" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2 className="font-2 font-light italic text-[clamp(28px,3.5vw,42px)] leading-1 tracking-1 text-text mt-3xl mb-2xl max-w-[28ch]">Brewster, Malus, and the polarisation of reflected light</h2>

      <p className="mb-prose-3">
        Solve the boundary conditions in detail for the two independent polarisations — electric
        field perpendicular to the plane of incidence ("s") and parallel to it ("p") — and you
        get the <Term def="Augustin-Jean Fresnel's 1823 formulae giving the amplitude reflection and transmission coefficients at a dielectric interface, separately for the s (perpendicular) and p (parallel) polarisations. They follow directly from the four boundary conditions on E and B.">Fresnel equations</Term><Cite id="fresnel-1823" in={SOURCES} />:
      </p>
      <Formula>
        r<sub>s</sub> = (n<sub>1</sub> cos θ<sub>1</sub> − n<sub>2</sub> cos θ<sub>2</sub>) /
        (n<sub>1</sub> cos θ<sub>1</sub> + n<sub>2</sub> cos θ<sub>2</sub>)
      </Formula>
      <Formula>
        r<sub>p</sub> = (n<sub>2</sub> cos θ<sub>1</sub> − n<sub>1</sub> cos θ<sub>2</sub>) /
        (n<sub>2</sub> cos θ<sub>1</sub> + n<sub>1</sub> cos θ<sub>2</sub>)
      </Formula>
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">r<sub>s</sub></strong> and <strong className="text-text font-medium">r<sub>p</sub></strong> are the dimensionless
        amplitude reflection coefficients for the s- and p-polarisations (the ratio of reflected to
        incident E-field amplitude), <strong className="text-text font-medium">n<sub>1</sub></strong> and <strong className="text-text font-medium">n<sub>2</sub></strong>{' '}
        are the dimensionless refractive indices on either side of the interface, and
        <strong className="text-text font-medium"> θ<sub>1</sub></strong>, <strong className="text-text font-medium">θ<sub>2</sub></strong> are the incidence and
        refraction angles measured from the surface normal.
      </p>
      <p className="mb-prose-3">
        Reflectance is R = |r|² (the dimensionless fraction of incident intensity that reflects). At normal incidence (θ<sub>1</sub> = 0), s and p degenerate to
        the same value <strong className="text-text font-medium">R = ((n−1)/(n+1))²</strong> — about <strong className="text-text font-medium">4%</strong> for the
        glass-air interface. As θ<sub>1</sub> rises, R<sub>s</sub> climbs monotonically; R<sub>p</sub>
        first <em className="italic text-text">drops to zero</em> at the special angle
        <strong className="text-text font-medium"> θ<sub>B</sub> = arctan(n<sub>2</sub>/n<sub>1</sub>)</strong> and then climbs.
        That zero is <Term def="The incidence angle θ_B = arctan(n₂/n₁) at which the reflected wave is fully linearly polarised perpendicular to the plane of incidence — the p-component vanishes exactly. Polaroid sunglasses, optical isolators, and 3D-movie systems all exploit it.">Brewster's angle</Term> (David Brewster, 1815)<Cite id="brewster-1815" in={SOURCES} />.
      </p>

      <BrewsterAngleDemo />

      <p className="mb-prose-3">
        At Brewster's angle the reflected ray is completely <em className="italic text-text">s</em>-polarised: an unpolarised
        beam (sun, light bulb, sky) splits into a fully-polarised reflection and a partially-
        polarised transmission. This is why <em className="italic text-text">polaroid sunglasses</em> work — their absorption
        axis is set vertical, so they kill the horizontal-electric-field reflection from wet
        roads, lake surfaces, and the dashboard. The same physics underlies 3D-movie glasses,
        polarisation-by-reflection in stress-analysis optics, and the way photographers use
        circular polarisers to deepen blue skies.
      </p>

      <p className="mb-prose-3">
        Place a second polariser (the <em className="italic text-text">analyser</em>) behind the first and you get Étienne-Louis
        Malus's 1809 law: light of intensity I<sub>0</sub> linearly polarised at angle θ<sub>1</sub>
        passes through an analyser oriented at θ<sub>2</sub> with intensity
        <strong className="text-text font-medium"> I = I<sub>0</sub> cos²(θ<sub>2</sub> − θ<sub>1</sub>)</strong>. Cross the two axes
        (90° apart) and the field has no component along the analyser — nothing gets through. Add a
        <Term def="A birefringent plate whose thickness is chosen so that the two orthogonal polarisation components emerge with a 90° relative phase shift. Converts linear polarisation at ±45° to its axes into circular polarisation, and vice versa.">quarter-wave plate</Term> between the two polarisers at 45° to the first axis, and the
        linear polarisation becomes circular: now the analyser transmits a steady I<sub>0</sub>/2 ·
        ½ = I<sub>0</sub>/4 regardless of θ<sub>2</sub>, because the rotating E-vector always has a
        cosine-or-sine component along any axis<Cite id="hecht-2017" in={SOURCES} />.
      </p>

      <PolarizationMalusLawDemo />

      <TryIt
        tag="Try 14.3"
        question={<>Compute Brewster's angle for the air-glass interface (n₁ = 1.00, n₂ = 1.52).</>}
        hint="θ_B = arctan(n₂/n₁)."
        answer={
          <>
            <Formula>θ<sub>B</sub> = arctan(1.52 / 1.00) = arctan(1.52) ≈ <strong className="text-text font-medium">56.7°</strong></Formula>
            <p className="mb-prose-1 last:mb-0">
              At that angle the reflected ray is 100% s-polarised. Note: the transmitted ray and
              the reflected ray are <em className="italic text-text">perpendicular</em> at Brewster's angle — that's another
              equivalent definition<Cite id="brewster-1815" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2 className="font-2 font-light italic text-[clamp(28px,3.5vw,42px)] leading-1 tracking-1 text-text mt-3xl mb-2xl max-w-[28ch]">Thin films and total internal reflection</h2>

      <p className="mb-prose-3">
        At an interface, part of the wave reflects and part transmits. Stack two interfaces close
        together — a thin film between two media — and the two reflected waves <em className="italic text-text">interfere</em>.
        For normal incidence on a film of thickness <strong className="text-text font-medium">t</strong> and refractive index <strong className="text-text font-medium">n</strong>,
        the path-length difference between the wave that reflected off the top surface and the
        one that reflected off the bottom is <strong className="text-text font-medium">2 n t</strong>. Account for the π phase
        shift acquired at each "low → high" reflection, and the condition for constructive
        interference becomes<Cite id="hecht-2017" in={SOURCES} /><Cite id="born-wolf-1999" in={SOURCES} />:
      </p>
      <Formula>2 n t = (m + ½) λ &nbsp; (one inverting reflection)</Formula>
      <Formula>2 n t = m λ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; (zero or two inverting reflections)</Formula>
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">n</strong> is the dimensionless refractive index of the film,
        <strong className="text-text font-medium"> t</strong> is the film thickness (in metres), <strong className="text-text font-medium">λ</strong> is the vacuum
        wavelength of the light (in metres), and <strong className="text-text font-medium">m</strong> is a non-negative integer
        labelling the interference order (m = 0, 1, 2, …).
      </p>
      <p className="mb-prose-3">
        A soap bubble is mostly water (n ≈ 1.33) with air on both sides — only the top reflection
        inverts — so the constructive maxima fall at the half-integer formula. As the bubble
        drains, t decreases; the wavelength that constructively interferes sweeps from red
        through green to blue to UV, finally going dark when t &lt; 100 nm. That last "black"
        film is two soap-molecule layers thick. Newton observed and catalogued these colours in
        the 1670s; they were the strongest early evidence that light had a wave nature.
      </p>

      <ThinFilmDemo />

      <p className="mb-prose-3">
        The other consequence of Snell's law worth pulling out: <em className="italic text-text">total internal reflection</em>.
        When n<sub>1</sub> &gt; n<sub>2</sub> and θ<sub>1</sub> &gt; θ<sub>c</sub>, Snell's law
        would demand sin θ<sub>2</sub> &gt; 1 — impossible. The boundary instead acts as a perfect
        mirror, dumping 100% of the incident energy back into medium 1. There's still an evanescent
        wave on the other side that penetrates ~λ deep and carries no time-averaged Poynting flux
        — important for optical microscopy, but to first order, the boundary is silvered.
      </p>
      <p className="mb-prose-3">
        This is what lets an <Term def="A long thin cylinder of glass (the core) clad in slightly lower-index glass (the cladding). Light entering within the core's acceptance cone is trapped by total internal reflection at every wall encounter and travels long distances with minimal loss.">optical fiber</Term> work. A silica core of n ≈ 1.4682 is clad in a slightly
        lower-index sheath of n ≈ 1.4628. Any ray that enters the core within about 10° of its
        axis hits the wall above the critical angle and zigzags down the entire length, kept
        inside by repeated TIR. Single-mode fibers run telecom traffic at 1550 nm with attenuation
        of only about <strong className="text-text font-medium">0.2 dB/km</strong> — six orders of magnitude better than copper at
        comparable bit rates<Cite id="hecht-2017" in={SOURCES} />.
      </p>

      <FiberOpticDemo />

      <TryIt
        tag="Try 14.4"
        question={<>An optical fiber has n_core = 1.468, n_clad = 1.463. What is the maximum angle (measured from the fiber axis) that an input ray can make and still be guided?</>}
        hint="At the wall, the ray must satisfy θ_wall ≥ θ_c = arcsin(n_clad/n_core). The angle to the axis is the complement."
        answer={
          <>
            <Formula>sin θ<sub>c</sub> = 1.463 / 1.468 ≈ 0.99659</Formula>
            <Formula>θ<sub>c</sub> ≈ 85.25°</Formula>
            <p className="mb-prose-1 last:mb-0">
              Measured from the fiber's <em className="italic text-text">axis</em>, the maximum acceptance half-angle is
              90° − 85.25° ≈ <strong className="text-text font-medium">4.75°</strong>. The corresponding "numerical aperture"
              is NA = √(n_core² − n_clad²) ≈ <strong className="text-text font-medium">0.121</strong>, a typical single-mode fiber
              value<Cite id="hecht-2017" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2 className="font-2 font-light italic text-[clamp(28px,3.5vw,42px)] leading-1 tracking-1 text-text mt-3xl mb-2xl max-w-[28ch]">Young's experiment: the wave-nature proof</h2>

      <p className="mb-prose-3">
        By the late 1700s the dominant theory of light was Newton's corpuscular one. Thomas Young
        was a polymath physician with an unusual command of acoustics and tides, and he had a
        sound theorist's intuition for interference. In 1801–04 he showed the Royal Society a
        simple but decisive experiment: a pinhole, a card with two close slits, and a screen
        behind it. The light from the two slits added on the screen with light-and-dark stripes
        — bright where the two paths to the screen differed by an integer wavelength, dark
        where they differed by a half-integer<Cite id="young-1804" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        For slit separation <strong className="text-text font-medium">d</strong> and screen distance <strong className="text-text font-medium">L ≫ d</strong>, the
        path-length difference to a point at lateral position y on the screen is approximately
        d·sin θ ≈ d·y/L. Constructive interference happens at:
      </p>
      <Formula>sin θ = m λ / d, &nbsp; m = 0, ±1, ±2, …</Formula>
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">θ</strong> is the angle from the central axis to a bright fringe (in radians),
        <strong className="text-text font-medium"> m</strong> is the integer order of the fringe (m = 0 is the central maximum,
        ±1 the first order, etc.), <strong className="text-text font-medium">λ</strong> is the light's vacuum wavelength (in metres),
        and <strong className="text-text font-medium">d</strong> is the slit separation (in metres).
      </p>
      <p className="mb-prose-3">
        and on the screen the bright fringes sit at <strong className="text-text font-medium">y<sub>m</sub> ≈ m λ L / d</strong>,
        where <strong className="text-text font-medium">y<sub>m</sub></strong> is the lateral position of the mth fringe on the screen
        (in metres) and <strong className="text-text font-medium">L</strong> is the slit-to-screen distance (in metres).
        Fringe spacing <strong className="text-text font-medium">Δy = λ L / d</strong>. For 550-nm light, slits 50 µm apart and a
        screen 500 mm away, the fringes are about 5 mm apart and easily visible by eye. The same
        physics underlies every diffraction-pattern measurement, every grating spectrometer,
        every laser-speckle experiment, and every interferometric measurement that takes 100
        nm of mechanical motion seriously<Cite id="born-wolf-1999" in={SOURCES} />.
      </p>

      <DoubleSlitDemo />

      <TryIt
        tag="Try 14.5"
        question={<>In a double-slit experiment with d = 0.10 mm and L = 1.0 m, the first-order bright fringe sits 6.3 mm from the centre. What wavelength was used?</>}
        hint="y_m = m λ L / d."
        answer={
          <>
            <Formula>λ = y<sub>1</sub> · d / (L · 1) = (6.3×10⁻³)(1.0×10⁻⁴) / (1.0)</Formula>
            <Formula>λ ≈ <strong className="text-text font-medium">6.3×10⁻⁷ m = 630 nm</strong></Formula>
            <p className="mb-prose-1 last:mb-0">
              Red-orange — about the colour of a helium-neon laser line (632.8 nm) or a
              red-LED<Cite id="hecht-2017" in={SOURCES} />.
            </p>
          </>
        }
      />

      <p className="mb-prose-3">
        Take Young's two slits and multiply them: N equally-spaced slits with spacing d. Each pair
        contributes its own two-beam interference, and the N partial-amplitudes sum to the
        N-slit pattern <em className="italic text-text">|sin(Nβ)/(N sinβ)|²</em> where β = π d sinθ / λ. The principal maxima
        sit at the same angles as the double-slit (<strong className="text-text font-medium">sin θ = m λ / d</strong>), but every
        peak now has a full-width-at-half-maximum that scales as <strong className="text-text font-medium">1/N</strong>. That's
        what makes a <Term def="An optical element with many regularly-spaced grooves (typically 300–2400 lines/mm). Diffracts incident light into a wavelength-dependent set of orders, and is the dispersive element in nearly every modern spectrometer.">diffraction grating</Term> a precision spectroscopic tool: a 1200-line/mm grating
        illuminated by light of finite bandwidth resolves features down to λ/Δλ ≈ 10⁵ in modest
        instruments<Cite id="born-wolf-1999" in={SOURCES} />.
      </p>

      <DiffractionGratingDemo />

      <TryIt
        tag="Try 14.5b"
        question={<>A 600-line/mm diffraction grating is illuminated by 550-nm light. At what angle is the first-order (m = 1) maximum?</>}
        hint="sin θ = m λ / d. Compute d from the line density."
        answer={
          <>
            <Formula>d = 1 mm / 600 = 1.667×10⁻⁶ m = 1.667 µm</Formula>
            <Formula>sin θ<sub>1</sub> = (1)·(550×10⁻⁹) / (1.667×10⁻⁶) ≈ 0.330</Formula>
            <Formula>θ<sub>1</sub> = arcsin(0.330) ≈ <strong className="text-text font-medium">19.3°</strong></Formula>
            <p className="mb-prose-1 last:mb-0">
              Adjacent wavelengths separate by roughly dθ/dλ ≈ m / (d cos θ) ≈ 6.3×10⁵ rad/m
              ≈ 0.036°/nm at first order. A spectrometer with a 1° detector array can resolve the
              sodium-D doublet (0.6 nm split, ≈0.022°) at first order with room to spare<Cite id="born-wolf-1999" in={SOURCES} />.
            </p>
          </>
        }
      />

      <Pullout>
        If light is a wave, it should interfere with itself. Young split a beam in two and
        watched it stripe and unstripe across a screen.
      </Pullout>

      <h2 className="font-2 font-light italic text-[clamp(28px,3.5vw,42px)] leading-1 tracking-1 text-text mt-3xl mb-2xl max-w-[28ch]">Lasers: stimulated emission, coherence, and an external mirror</h2>

      <p className="mb-prose-3">
        Einstein, in 1917, derived a balance argument for atoms and photons that required, in
        addition to spontaneous emission and absorption, a third process: a photon of the right
        frequency could trigger an excited atom to drop down and emit a <em className="italic text-text">second</em> photon
        of identical wavelength, direction, phase, and polarisation. This is <Term def="The process in which an incoming photon induces an excited atom to emit a second photon of identical wavelength, direction, phase, and polarisation. Einstein predicted it in 1917; lasers are macroscopic amplifiers built on it.">stimulated emission</Term>. In thermal equilibrium it's negligible: most atoms are
        in the ground state. Invert the population — pump atoms into the excited state faster
        than they decay — and stimulated emission can dominate, leading to coherent amplification.
      </p>
      <p className="mb-prose-3">
        Theodore Maiman built the first working laser at Hughes Research Labs in May 1960. The
        device was a ruby rod (Cr³⁺ ions in Al₂O₃) about 1 cm across, end-faces silvered to act
        as a Fabry–Pérot cavity, pumped by a coiled xenon flashlamp. The output was a pulse of
        694.3-nm red light, lasting under a millisecond, with the unmistakable spectral
        narrowness and angular collimation of coherent radiation<Cite id="maiman-1960" in={SOURCES} />.
        Within months ammonia, neodymium, gas, and semiconductor lasers followed; within years,
        the technology had escaped the lab.
      </p>

      <LaserCavityDemo />

      <p className="mb-prose-3">
        Three ingredients are needed for any laser: (1) a <Term def="The amplifying material in a laser — a collection of atoms, ions, or molecules that can be excited to a metastable upper state and then triggered into stimulated emission by a passing photon of the lasing wavelength.">gain medium</Term> with a metastable upper
        state, (2) a <em className="italic text-text">pump</em> (flashlamp, electrical discharge, another laser) that drives
        a population inversion, and (3) an <em className="italic text-text">optical cavity</em> (two mirrors, one partially
        transmitting) that sends photons back through the gain medium many times before letting
        a fraction out as the beam. The cavity selects which longitudinal modes oscillate; the
        gain medium's homogeneous linewidth selects which atomic transitions amplify; the output
        coupler's reflectivity sets the steady-state intracavity power. Out the end comes a beam
        of unmatched <em className="italic text-text">coherence</em> — temporal (narrow linewidth, long phase memory) and
        spatial (a clean Gaussian wavefront)<Cite id="hecht-2017" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        The downstream consequences are enormous. CD and Blu-ray drives, fiber-optic telecom, FTL
        spectroscopy, laser cutting and welding, eye surgery, LIDAR, gravitational-wave
        interferometers, atomic-clock spectroscopy — none of them would work without coherent
        light produced exactly this way<Cite id="hecht-2017" in={SOURCES} />.
      </p>

      <h2 className="font-2 font-light italic text-[clamp(28px,3.5vw,42px)] leading-1 tracking-1 text-text mt-3xl mb-2xl max-w-[28ch]">What we have so far</h2>

      <p className="mb-prose-3">
        Light is the Chapter-9 plane wave. A slab of matter is a region where the EM wave equation
        runs slower by a factor of <em className="italic text-text">n</em>. Boundary conditions on <strong className="text-text font-medium">E</strong> and
        <strong className="text-text font-medium"> B</strong> hand you Snell's law in one line, Fresnel's reflection formulae in
        ten, Brewster's polarisation zero in a paragraph, total internal reflection from the same
        algebra you used for Snell, and thin-film colours from two-beam interference. Young's
        double slit was the experiment that turned "wave or corpuscle?" into "wave"; Maiman's
        ruby laser added a coherent source you could carry. Every optical phenomenon you meet
        in everyday life — a rainbow, a lens, a polariser, a fiber, a hologram — is somewhere on
        the line that starts here and ends in industrial photonics.
      </p>

      <CaseStudies
        intro={
          <>
            Three places where Maxwell's equations at 10¹⁴ Hz drive a working technology — the
            long-haul fibre, the lens coating, and the spectroscope.
          </>
        }
      >
        <CaseStudy
          tag="Case 14.1"
          title="Single-mode silica fibre — the spine of the global internet"
          summary="~99% of intercontinental data travels through ~9-µm glass cores at 1310/1550 nm, with attenuation around 0.2 dB/km."
          specs={[
            { label: 'Standard', value: <>ITU-T G.652.D (single-mode step-index fibre)</> },
            { label: 'Operating wavelengths', value: <>1310 nm (O-band), 1550 nm (C-band)</> },
            { label: 'Attenuation', value: <>~0.32 dB/km at 1310, ~0.20 dB/km at 1550 <Cite id="hecht-2017" in={SOURCES} /></> },
            { label: 'Core diameter', value: <>~9 µm; cladding 125 µm</> },
            { label: 'Confinement mechanism', value: <>total internal reflection (n_core − n_clad ≈ 0.005)</> },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            Modern single-mode fibre is a glass cylinder about as wide as a human hair, with the
            core (the light-guiding region) only nine micrometres across — about fifteen
            wavelengths of 1550-nm infrared light. The cladding is doped pure silica with a
            slightly lower index than the core, just enough to ensure that the propagating field
            is confined by total internal reflection at every wall encounter. At the operating
            wavelengths, silica's intrinsic absorption sits at a deep minimum: 0.2 dB/km means
            half the light is left after 15 km<Cite id="hecht-2017" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            Inside a transoceanic cable, several such fibres run alongside copper power conductors
            that feed erbium-doped fibre amplifiers (EDFAs) every 50–100 km. Each amplifier is
            itself a short piece of erbium-doped fibre pumped by a 980-nm semiconductor laser —
            stimulated emission lifting the signal back up to nearly its input level without ever
            converting to electronics. The fibre, the doped-erbium amplifier, and the
            semiconductor pump laser are all 100% Maxwell-equations devices.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 14.2"
          title="MgF₂ anti-reflection coating on a camera lens"
          summary="A quarter-wave layer of magnesium fluoride drops the reflectance of an air-glass surface from ~4% to ~1.5%."
          specs={[
            { label: 'Bare glass (n = 1.52) reflectance', value: <>R = ((n−1)/(n+1))² ≈ 4.3% at normal incidence <Cite id="hecht-2017" in={SOURCES} /></> },
            { label: 'Coating material', value: <>MgF₂, n ≈ 1.38</> },
            { label: 'Optimal thickness', value: <>t = λ/(4n) ≈ 100 nm at λ = 550 nm</> },
            { label: 'Coated reflectance', value: <>~1.4% per surface in the green</> },
            { label: 'Multi-layer broadband coatings', value: <>R &lt; 0.5% across the visible</> },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            A high-quality camera lens may have 10–15 air-glass surfaces inside it. Bare, each one
            reflects about <strong className="text-text font-medium">4%</strong> of incoming light by the Fresnel formula
            R = ((n−1)/(n+1))². After ten bare surfaces, only about (0.96)¹⁰ ≈ 66% of incident
            light reaches the sensor; the rest bounces around inside as flare and ghosting.
          </p>
          <p className="mb-prose-2 last:mb-0">
            A single layer of magnesium fluoride (n ≈ 1.38, conveniently lower than glass), of
            optical thickness λ/4 at the design wavelength, sets up two reflections — one off
            air-MgF₂, one off MgF₂-glass — that destructively interfere. The leftover
            reflectance is approximately
            ((n_MgF² − n_air · n_glass)/(n_MgF² + n_air · n_glass))² ≈ 1.4%. Stacking several
            quarter-wave layers of alternating high/low index extends the destructive
            interference across the whole visible band, getting modern multicoated optics under
            half a percent reflectance per surface<Cite id="hecht-2017" in={SOURCES} /><Cite id="born-wolf-1999" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            The point: it's the same thin-film interference physics as a soap bubble's
            iridescence — controlled, designed, baked at high temperature into a borosilicate
            element. Newton would have recognised the principle.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 14.3"
          title="Atomic absorption spectroscopy: reading a flame's chemistry"
          summary="Heat a sample, look at the colours it absorbs and emits, and the line positions and intensities tell you which elements are there and at what concentration."
          specs={[
            { label: 'Spectral resolution (typical lab Czerny–Turner)', value: <>R = λ/Δλ ≈ 10³–10⁵</> },
            { label: 'Sodium-D doublet', value: <>588.995 nm and 589.592 nm</> },
            { label: 'Mechanism', value: <>electronic transitions; line strength ∝ population × oscillator strength <Cite id="born-wolf-1999" in={SOURCES} /></> },
            { label: 'Used in', value: <>analytical chemistry, astrophysics (stellar spectra), forensics</> },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            Different elements have different electronic energy-level diagrams; the photon
            wavelengths corresponding to allowed transitions are sharp and characteristic. A
            grating spectrometer separates incoming light by wavelength using the same
            interference math as Young's double slit (with N slits instead of two — the fringe
            structure sharpens as N grows). The pattern on the detector is a "fingerprint" of the
            sample's atomic species.
          </p>
          <p className="mb-prose-2 last:mb-0">
            Sodium is the easy demo: spill a salt solution into a Bunsen flame and the orange
            colour you see is the sodium-D doublet at 588.995 and 589.592 nm, fine-structure-split
            by the 0.6-nm spin-orbit coupling of the 3p excited state. Other elements light up
            elsewhere on the spectrum — strontium red, copper green, potassium violet — and a
            decent table-top spectrometer with R ≈ 10⁴ can quantify each line to a fraction of a
            percent of the major component. Astronomers extended the same idea to starlight in
            the 1860s: every element in the periodic table has been read off the spectrum of some
            celestial body before it was found in a laboratory sample on Earth<Cite id="born-wolf-1999" in={SOURCES} />.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 14.4"
          title="3D movies and Brewster — polarisation in entertainment"
          summary="A 3D theatre projects two slightly-offset images with orthogonal polarisations; the glasses sort one to each eye."
          specs={[
            { label: 'Modern systems', value: <>circularly polarised (RealD), or linearly polarised at ±45°</> },
            { label: 'Glasses', value: <>quarter-wave plate + linear polariser per eye</> },
            { label: 'Underlying physics', value: <>each eye sees only the matching polarisation; brain fuses the two images into depth <Cite id="hecht-2017" in={SOURCES} /></> },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            A 3D cinema runs two co-projected images on the same screen: one taken from a "left
            eye" camera, one from a "right eye" camera, the two viewpoints separated by a few
            centimetres. The trick is to deliver each image to the correct eye. The modern
            answer uses polarisation. RealD systems project the two images in opposite
            <em className="italic text-text"> circular</em> polarisations (left-handed and right-handed). Each eyepiece of the
            disposable glasses is a quarter-wave plate followed by a linear polariser, configured
            so it passes only one handedness. Your left eye sees only the left-camera image; your
            right eye sees only the right; your brain does the parallax fusion.
          </p>
          <p className="mb-prose-2 last:mb-0">
            Circular polarisation has a practical advantage over linear: you can tilt your head
            and the channel separation doesn't degrade. The physics is the same Fresnel /
            wave-plate machinery as everywhere else in optics; only the application is new.
            Polarising sunglasses, Brewster windows in laser tubes, optical isolators in fibre
            amplifiers, and these throwaway 3D-movie glasses are all members of the same
            family<Cite id="hecht-2017" in={SOURCES} /><Cite id="brewster-1815" in={SOURCES} />.
          </p>
        </CaseStudy>
      </CaseStudies>

      <FAQ
        intro="Loose threads — the questions a careful reader tends to surface after this chapter."
      >
        <FAQItem q="Why does the speed of light slow down inside glass?">
          <p>
            Strictly speaking it doesn't — the <em className="italic text-text">phase</em> speed of the macroscopic E-field
            inside the glass is c/n, but every individual photon's microscopic interaction is
            still at c. What happens is that the incident wave drives the bound electrons in
            the glass into oscillation; those oscillating dipoles re-radiate, and the
            superposition of the original wave and all the scattered waves moves more slowly
            than c through the bulk material. n = √ε<sub>r</sub> bundles all of that into one
            number<Cite id="jackson-1999" in={SOURCES} /><Cite id="hecht-2017" in={SOURCES} />.
            From outside, the practical answer is "yes, light slows by a factor of n in glass."
            From inside the microphysics, it's "no individual photon ever slows; the collective
            wavefront does."
          </p>
        </FAQItem>

        <FAQItem q="Why does the frequency stay the same across a boundary while wavelength changes?">
          <p>
            Because the boundary condition on the fields holds at every instant t. The
            tangential E on each side must match second-by-second, which forces both sides to
            oscillate at the same temporal frequency ω. Wavelength is v/f, and only v changes
            across the boundary, so λ scales as 1/n. A 500-nm green vacuum photon becomes a
            333-nm wave inside crown glass (n = 1.5) but is still "green" — energy ℏω determines
            colour, not wavelength<Cite id="hecht-2017" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="If reflectance from a soap film depends on thickness, why don't ordinary windows show interference colours?">
          <p>
            Two reasons. (1) Window glass is much thicker than the coherence length of ordinary
            light — at 4 mm thickness, the path-length difference 2nt ≈ 12 mm is far longer than
            the few-µm coherence length of a sunlight or incandescent source. The two reflections
            arrive on the retina with random uncorrelated phases, so their intensities add
            instead of their amplitudes; no interference fringes. (2) Even with a laser, a slab
            thick enough that 2nt = thousands of λ would show fringes only if the thickness
            varied across the slab by an appreciable fraction of λ. Optical-quality windows are
            flat to a small fraction of a wavelength only locally; the colour effect is washed
            out by surface roughness<Cite id="hecht-2017" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why is the sky blue and the sunset red?">
          <p>
            Rayleigh scattering off the air's molecules: scattering intensity scales as 1/λ⁴, so
            short-wavelength (violet/blue) light is scattered out of the direct line from the
            sun much more strongly than long-wavelength (red) light. Looking at the sky in any
            direction other than the sun, you see scattered blue. Looking at the sun near the
            horizon (sunset), the direct path through the atmosphere is much longer; the blue
            has been scattered out and what reaches you is the residual red/orange. That goes
            back to the same atom-as-driven-oscillator picture — the ε<sub>r</sub>(ω) curve has
            a 1/λ⁴ susceptibility tail well below the UV resonances of N₂ and O₂<Cite id="jackson-1999" in={SOURCES} /><Cite id="hecht-2017" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What is a 'photon' and how does it fit into this classical-wave picture?">
          <p>
            In classical electrodynamics, light is a continuous EM wave with energy density
            (ε₀/2)|E|². Quantum electrodynamics adds that the wave's energy comes in quanta of
            <strong className="text-text font-medium"> ℏω</strong>; each quantum is a photon. For the optics of this chapter —
            reflection, refraction, polarisation, interference, thin films, lasers — the
            classical wave picture suffices, because every observable is an intensity
            (proportional to |E|²) averaged over many photons. Photons matter when individual
            quanta carry the action: photoelectric effect, single-photon detectors, quantum
            interference at very low light, atomic-line spectroscopy<Cite id="hecht-2017" in={SOURCES} />.
            Maxwell built the wave theory; Einstein's 1905 light-quantum paper added the
            quantum.
          </p>
        </FAQItem>

        <FAQItem q="Why is Brewster's angle the same as the angle where the reflected and refracted rays are perpendicular?">
          <p>
            Geometric proof: at Brewster's angle θ<sub>B</sub>, tan θ<sub>B</sub> = n<sub>2</sub>/n<sub>1</sub>.
            Snell's law gives sin θ<sub>2</sub>/sin θ<sub>B</sub> = n<sub>1</sub>/n<sub>2</sub> =
            1/tan θ<sub>B</sub> = cos θ<sub>B</sub>/sin θ<sub>B</sub>. So sin θ<sub>2</sub> =
            cos θ<sub>B</sub>, meaning θ<sub>2</sub> = 90° − θ<sub>B</sub>: the refracted ray is
            perpendicular to the would-be reflected ray. Physically, the in-medium oscillating
            dipoles excited by the p-polarised refracted wave can radiate in the direction of
            the refracted ray and perpendicular to it, but not along the dipole axis itself —
            and at this geometry "the reflected direction" coincides with "along the dipole
            axis." Hence no p-polarised reflection<Cite id="hecht-2017" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why are diamonds so bright and sparkly compared to glass?">
          <p>
            Two reasons, both refractive-index. (1) Diamond has n = 2.42 — much higher than
            glass's 1.5. Brewster's-angle reflectance grows with n; at normal incidence
            R = ((n−1)/(n+1))² gives about 17% per facet for diamond vs 4% for glass. (2)
            Diamond's critical angle for TIR with air is arcsin(1/2.42) ≈ 24.4°, much smaller
            than glass's ≈ 42°, so a much greater fraction of internal rays bounce around inside
            the stone instead of exiting the back surface. A well-cut diamond is engineered to
            return essentially all light entering the table back out through the table — the
            "brilliant" cut is a TIR machine. Dispersion (Cauchy slope) is also higher for
            diamond, giving the "fire" of colours splaying out the back facets<Cite id="hecht-2017" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="How does a lens focus light using only refraction?">
          <p>
            A convex lens has surfaces whose curvature is chosen so that incoming parallel rays
            (rays from infinity) all refract by Snell's law toward a common focal point. The
            geometry is the thin-lens equation 1/f = (n − 1)(1/R<sub>1</sub> − 1/R<sub>2</sub>),
            with R<sub>1,2</sub> the radii of the two surfaces and f the focal length
            <Cite id="hecht-2017" in={SOURCES} />. Real lenses suffer from aberrations: chromatic
            (because n depends on λ — a single lens has different f for red and blue), spherical
            (because a perfect sphere does not focus to a perfect point), coma, astigmatism,
            field curvature, distortion. Professional optics design is mostly the art of cancelling
            these aberrations among several lens elements made of different glasses.
          </p>
        </FAQItem>

        <FAQItem q="If a laser is just stimulated emission, why does it produce a tight beam?">
          <p>
            Three reinforcing effects. (1) Stimulated emission produces photons with the same
            direction, phase, and polarisation as the triggering one — so the cavity selects a
            single transverse mode. (2) The Fabry–Pérot cavity geometry only sustains
            standing-wave modes whose round-trip phase is a multiple of 2π and whose transverse
            profile is an eigenmode of the resonator (typically a Gaussian TEM₀₀ for a confocal
            cavity). (3) Diffraction in the cavity sets the smallest possible beam waist;
            outside the cavity, the beam expands by a divergence half-angle θ ≈ λ/(π w₀) — for a
            10-mW HeNe with w₀ = 0.3 mm, θ ≈ 0.7 mrad. So tight, but not infinitely tight —
            diffraction is still the limit<Cite id="hecht-2017" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why is laser light 'coherent' if every photon comes from a separate atom?">
          <p>
            Stimulated emission is a phase-locked process: the photon emitted by the atom comes
            out in phase with the photon that triggered it. In a fully-saturated laser cavity,
            essentially every emission is stimulated (spontaneous emission is several orders of
            magnitude rarer per atom), so all the photons in the beam trace back to the same
            seed and carry the same phase relationship. That's <em className="italic text-text">temporal</em> coherence —
            the field amplitude has a well-defined phase over long timescales (microseconds to
            seconds for stable lasers). Combined with the cavity's spatial-mode selection, it
            produces a beam where the field is essentially a pure sinusoid with a single
            Gaussian transverse profile<Cite id="maiman-1960" in={SOURCES} /><Cite id="hecht-2017" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why does an ordinary mirror reflect almost everything while glass reflects only 4%?">
          <p>
            Because the mirror's reflecting layer is a thin film of metal (silver, aluminium, or
            for telescope mirrors sometimes gold), not a dielectric. In a metal, the conduction
            electrons respond to the incident field by setting up a surface current that
            cancels the field inside the metal — there is almost no transmitted wave, almost all
            the incident energy goes back into the reflected one. Aluminium gives ~91% reflectance
            in the visible; silver, 95%; protected silver in optical mirrors, 98–99% across the
            visible. The Fresnel formulae still apply, but with complex n for the metal — the
            imaginary part of n is what handles the absorption<Cite id="jackson-1999" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What's the difference between a transparent and an opaque material?">
          <p>
            Transparency requires that the material have very low absorption at visible
            wavelengths — i.e., the imaginary part of n is essentially zero. That happens when
            the material has no electronic transitions in the visible band: bandgap energies in
            the UV or higher (silica, quartz, water), no free electrons (so not a metal), and
            no scattering centres on the scale of λ (so a polycrystalline ceramic with grain
            sizes ~λ scatters and looks white, while a single crystal of the same material is
            clear). Many materials are transparent in some bands and opaque in others — silica
            is transparent in the visible and near-IR but opaque below 200 nm (electronic
            absorption) and above ~3 µm (vibrational absorption)<Cite id="hecht-2017" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="How does dispersion limit fiber-optic bandwidth?">
          <p>
            Because different spectral components of a short optical pulse travel at slightly
            different speeds in the fibre (n depends on λ), the pulse spreads out as it propagates.
            For a 1550-nm DWDM channel with a 10-GHz modulation bandwidth, the dispersion is
            small but nonzero — over hundreds of kilometres, pulse-spreading would smear adjacent
            bits into each other and limit bit-rate. Modern long-haul links compensate by
            inserting fibres with deliberately opposite-sign dispersion every so often, or by
            using digital signal processing to undo the dispersion in the receiver. The
            zero-dispersion wavelength for standard silica fibre sits around 1310 nm (one of the
            reasons the telecom O-band lives there)<Cite id="hecht-2017" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why do soap films get darker just before they pop?">
          <p>
            As a vertical soap film drains, gravity pulls fluid downward and the top of the film
            thins faster than the bottom. When the thickness falls below about λ/4n ≈ 100 nm,
            the path-length difference 2nt becomes smaller than half a wavelength even for
            violet light, so there's no constructive interference left anywhere in the visible —
            destructive interference is approximate everywhere, and the film looks very dark.
            The film at that point is just a few molecular layers thick; bursting follows
            shortly. Newton documented these "black films" in the 1670s<Cite id="hecht-2017" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What is the physical difference between an LED and a laser diode?">
          <p>
            Both are forward-biased p-n junctions in a direct-bandgap semiconductor (GaAs,
            InGaN, etc.), and in both, electrons and holes recombine at the junction to emit
            photons of energy roughly the bandgap. In an LED, emission is spontaneous, so the
            output is incoherent, broad-spectrum (≈30-nm linewidth), and uncollimated. A laser
            diode adds two cleaved end-facets (the simplest possible Fabry–Pérot mirrors —
            reflectance ~30% per facet from the semiconductor's high index) and a current
            density above the lasing threshold; stimulated emission dominates, the cavity
            picks a single longitudinal mode, and the output is coherent, narrow-line, and
            collimated. The hardware is similar; the operating regime is what makes one a
            display element and the other a fibre-optic transmitter<Cite id="hecht-2017" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why is 632.8 nm a famous wavelength?">
          <p>
            It's the most prominent visible-red transition of neutral helium-neon (Ne 3s₂ → 2p₄),
            which lases easily in a low-pressure He-Ne mixture excited by a glow discharge.
            HeNe lasers were the workhorse laboratory laser from the 1960s through the 1990s,
            cheap and stable, with a coherence length of decimetres and a beautifully Gaussian
            beam. They've largely been replaced by semiconductor laser diodes for cost and
            efficiency reasons, but every optics-lab oldtimer recognises the colour instantly<Cite id="hecht-2017" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Can light go faster than c in a medium?">
          <p>
            The <em className="italic text-text">phase</em> velocity v_p = c/n can exceed c — this happens with n &lt; 1, as in
            X-rays in any material, or near a sharp absorption line at frequencies just above
            resonance. It does not transmit information faster than c. The <em className="italic text-text">group</em>
            velocity v_g = dω/dk, which carries the wave packet's centre and hence any modulation,
            stays below c in all causal media (with a subtle caveat at very strong anomalous
            dispersion, where v_g exceeds c but the front velocity — the speed at which a sharp
            wavefront can carry new information — stays bounded by c). Special relativity is
            never violated<Cite id="jackson-1999" in={SOURCES} />.
          </p>
        </FAQItem>
      </FAQ>
    </ChapterShell>
  );
}
