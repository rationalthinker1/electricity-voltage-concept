/**
 * Chapter 14 — Semiconductors and transistors
 *
 * p-n junctions, BJTs, and FETs — what is inside the chip. Builds on
 * Ch.4 (resistivity, doping intuition) and Ch.5 (capacitance, gate oxide
 * as a parallel-plate capacitor). Forward-references Ch.16 (op-amps:
 * the BJT/FET pair is what op-amps are made of) and Ch.23 (rectifiers
 * already use diodes).
 *
 * Demos:
 *   14.1 BandStructure         (Si / Ge / GaAs / diamond bandgaps)
 *   14.2 PNJunctionFormation   (depletion region under bias)
 *   14.3 DiodeCharacteristic   (reused from Ch.23 — three diode flavours)
 *   14.4 BJTCharacteristic     (I_C-V_CE family of curves)
 *   14.5 MOSFETOperation       (cross-section + I_D-V_DS at three V_GS)
 *   14.6 LoadLineAnalysis      (load line + BJT family → Q-point)
 *   14.7 CommonEmitterAmp      (input/output waveforms, live g_m and A_v)
 */
import { CaseStudies, CaseStudy } from '@/components/CaseStudy';
import { ChapterShell } from '@/components/ChapterShell';
import { FAQ, FAQItem } from '@/components/FAQ';
import { Cite } from '@/components/SourcesList';
import { Formula, InlineMath } from '@/components/Formula';
import { Pullout } from '@/components/Prose';
import { Term } from '@/components/Term';
import { TryIt } from '@/components/TryIt';

import { BandStructureDemo } from './demos/BandStructure';
import { PNJunctionFormationDemo } from './demos/PNJunctionFormation';
import { DiodeCharacteristicDemo } from './demos/DiodeCharacteristic';
import { BJTCharacteristicDemo } from './demos/BJTCharacteristic';
import { MOSFETOperationDemo } from './demos/MOSFETOperation';
import { MOSFET3DDemo } from './demos/MOSFET3D';
import { LoadLineAnalysisDemo } from './demos/LoadLineAnalysis';
import { CommonEmitterAmpDemo } from './demos/CommonEmitterAmp';

import { getChapter } from './data/chapters';

export default function Ch14Semiconductors() {
  const chapter = getChapter('semiconductors')!;
  const SOURCES = chapter.sources;

  return (
    <ChapterShell chapter={chapter}>
      <p className="chapter-intro">
        Pull the top off a cheap white LED bulb and the entire light source is
        a fleck of silicon a millimetre across, sitting on a copper slug, with
        a smear of yellow phosphor on top. Look closer at any current
        processor — the A17 Pro in a recent iPhone, say — and that same fleck
        of silicon, scaled up to a fingernail-sized die, holds <strong className="text-text font-medium">around 19 billion</strong>
        transistors <Cite id="razavi-2021" in={SOURCES} />. Every one of them is
        a direct descendant of a single device John Bardeen and Walter Brattain
        built at Bell Labs in December 1947<Cite id="bardeen-brattain-1948" in={SOURCES} />, with
        a flat-topped germanium crystal and two gold-foil contacts a hair's width apart.
        Three months earlier, no one had a working solid-state amplifier; eighteen years
        later, integrated circuits were stacking thousands of them on a chip; today, a
        single 3-nanometre fabrication step lays down a transistor whose gate is twelve atoms wide.
      </p>
      <p className="mb-prose-3">
        This chapter is about the physics that turns a passive lump of crystal into the
        active device that makes that scaling possible. The story arrives in three pieces:
        the doped semiconductor (a piece of silicon that conducts only because of the
        deliberate impurity in it); the <strong className="text-text font-medium">p-n junction</strong> (two doped pieces back to
        back — already a one-way valve, a Zener, an LED, a solar cell); and the transistor,
        in its two great families, bipolar and field-effect. By the end we will have a
        single-stage amplifier on the page with a voltage gain of −400 and a clear story
        for where the extra energy comes from.
      </p>

      <h2 className="chapter-h2">From conductor to semiconductor</h2>

      <p className="mb-prose-3">
        Chapter 4 split the world into conductors (a lot of mobile electrons) and insulators
        (almost none). Between them sits a class of materials in which the number of mobile
        electrons depends, sharply, on temperature and on the deliberate impurity content of
        the crystal. The cleanest way to see why is through the language of <Term def={<><strong className="text-text font-medium">energy bands</strong> — in a crystal, the discrete atomic energy levels broaden into continuous bands of allowed energies separated by forbidden gaps. The pattern of filled and empty bands determines whether the material conducts.</>}>energy bands</Term>.
      </p>
      <p className="mb-prose-3">
        A single silicon atom has four valence electrons in discrete orbital
        levels. Bring 10²³ of them together in a crystal and the Pauli exclusion
        principle forces those levels to broaden into continuous <em className="italic text-text">bands</em> of
        allowed energy, separated by forbidden gaps. The highest fully-occupied band at
        T = 0 is the <Term def={<><strong className="text-text font-medium">valence band</strong> — the highest fully-occupied energy band at zero temperature. Electrons in this band participate in covalent bonds; they cannot conduct because every quantum state is already full.</>}>valence band</Term>; the lowest empty band above
        it is the <Term def={<><strong className="text-text font-medium">conduction band</strong> — the band of energy states above the bandgap, empty at T = 0. An electron promoted into this band is free to move under an applied field and carries current.</>}>conduction band</Term>. The width of the gap between
        them — the <Term def={<><strong className="text-text font-medium">bandgap</strong> E<sub>g</sub> — the forbidden energy interval between the top of the valence band and the bottom of the conduction band. For silicon, 1.12 eV.</>}>bandgap</Term> E<sub>g</sub> — sets the whole story
        <Cite id="streetman-banerjee-2015" in={SOURCES} /><Cite id="griffiths-2017" in={SOURCES} />.
      </p>

      <BandStructureDemo />

      <p className="mb-prose-3">
        For silicon, E<sub>g</sub> = 1.12 eV. For germanium, 0.67 eV. For gallium arsenide,
        1.42 eV. For diamond, 5.5 eV. At room temperature kT ≈ 0.026 eV: small compared to
        any of these gaps, but not negligibly so for silicon. The probability that a valence
        electron picks up enough thermal energy to be promoted into the conduction band
        scales as <InlineMath tex="\exp(-E_g / 2kT)" /> — Boltzmann's exponential, with the factor of two
        coming out of the intrinsic-semiconductor carrier-statistics derivation
        <Cite id="streetman-banerjee-2015" in={SOURCES} />. Plug in silicon's numbers and you get
        ~10⁻¹⁰: ten billion-to-one odds, but the crystal has 5×10²² atoms per cubic centimetre,
        so the resulting <em className="italic text-text">intrinsic carrier density</em> is around 10¹⁰ cm⁻³ at 300 K. Pure
        silicon is, accordingly, a poor conductor — many orders of magnitude worse than copper,
        many orders of magnitude better than glass.
      </p>
      <p className="mb-prose-3">
        The exponential is the whole point. Suppose the gap were half as large — 0.56 eV instead
        of 1.12. The carrier density would not double; it would rise by a factor of
        <InlineMath tex="\exp(0.28/0.026) \approx 50{,}000" />. The same factor explains why a 30 °C summer day in a hot
        sealed engine bay can change a transistor's leakage by a factor of 100, why germanium
        (E<sub>g</sub> = 0.67 eV) runs hot and leaky, and why diamond (E<sub>g</sub> = 5.5 eV) is
        an essentially perfect insulator. The picture: thermal energy kT is the
        currency, the bandgap is the price; the carrier density is the receipt, and it is the
        exponential of the negative of the price-to-currency ratio. Make the gap small enough
        relative to kT and the crystal floods with carriers (a metal-like situation, in the
        limit). Make it large and the crystal is empty.
      </p>
      <p className="mb-prose-3">
        The factor of 2 in <InlineMath tex="\exp(-E_g/2kT)" /> — rather than the bare <InlineMath tex="\exp(-E_g/kT)" /> —
        comes from the fact that the Fermi level sits roughly in the middle of the gap in an
        intrinsic semiconductor, so a typical valence electron only has to be lifted by <InlineMath tex="E_g/2" />
        in energy to reach the most-populated states in the conduction band
        <Cite id="streetman-banerjee-2015" in={SOURCES} />. Doping shortcuts this: a donor level
        only 0.045 eV below the conduction-band edge takes essentially no thermal energy to
        ionise. <em className="italic text-text">Effective</em> bandgap, from the standpoint of getting carriers into the
        band, has been cut from 1.12 eV to a few hundredths of an eV.
      </p>

      <TryIt
        tag="Try 14.1"
        question={<>At room temperature (T = 300 K, so kT ≈ 0.0259 eV), what is the Boltzmann factor <InlineMath tex="\exp(-E_g/2kT)" /> for silicon (E<sub>g</sub> = 1.12 eV)? For diamond (E<sub>g</sub> = 5.5 eV)?</>}
        hint="Just plug in. The factor of 2 in the denominator is standard for intrinsic semiconductors."
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">Silicon:</p>
            <Formula tex="\exp(-1.12 / (2 \times 0.0259)) = \exp(-21.6) \approx 4\times 10^{-10}" />
            <p className="mb-prose-1 last:mb-0">Diamond:</p>
            <Formula tex="\exp(-5.5 / (2 \times 0.0259)) = \exp(-106) \approx 10^{-46}" />
            <p className="mb-prose-1 last:mb-0">
              Silicon at room temperature has a thermally-excited carrier population of
              ~10⁻¹⁰ of its atoms — small but measurable. Diamond has ~10⁻⁴⁶ — for a
              cubic-centimetre crystal that is essentially zero excited carriers in
              the lifetime of the universe<Cite id="streetman-banerjee-2015" in={SOURCES} />.
              That is why silicon is a useful semiconductor and diamond is a near-perfect
              insulator.
            </p>
          </>
        }
      />

      <p className="mb-prose-3">
        The trick that makes silicon technologically useful is <Term def={<><strong className="text-text font-medium">doping</strong> — the deliberate addition of impurity atoms (typically a few parts per million) to a semiconductor to control its carrier population. Group V dopants donate electrons (n-type); Group III dopants donate holes (p-type).</>}>doping</Term>.
        Substitute one silicon atom in every ten million with a phosphorus atom (Group V — five
        valence electrons instead of four) and the extra electron sits in a shallow donor level
        about 0.045 eV below the conduction-band edge. kT at room temperature is enough to lift
        essentially all of those donor electrons into the conduction band. A doping density of
        10¹⁶ cm⁻³ — one phosphorus per ten million silicons — gives 10¹⁶ free electrons per
        cm³, a million times the intrinsic level. The crystal is now <Term def={<><strong className="text-text font-medium">n-type</strong> — a semiconductor doped with donor impurities (Group V: P, As, Sb) so that the dominant mobile carriers are electrons.</>}>n-type</Term>.
      </p>
      <p className="mb-prose-3">
        Substitute boron (Group III — three valence electrons) instead, and the missing electron
        leaves a vacancy in the valence band: a <em className="italic text-text">hole</em>, which behaves as a positively-charged
        mobile carrier. Doping with boron makes the silicon <Term def={<><strong className="text-text font-medium">p-type</strong> — a semiconductor doped with acceptor impurities (Group III: B, Ga, In) so that the dominant mobile carriers are holes (missing electrons in the valence band, which behave as positive charges).</>}>p-type</Term>, with holes
        as the majority carrier instead of electrons<Cite id="streetman-banerjee-2015" in={SOURCES} />.
      </p>

      <Pullout>
        Pure silicon is a poor conductor; what makes silicon useful is the tiny amount of something else you put in it.
      </Pullout>

      <h2 className="chapter-h2">The p-n junction</h2>

      <p className="mb-prose-3">
        Take a piece of n-type silicon and a piece of p-type silicon and bring them into
        atomic contact along a single plane. Electrons on the n-side find themselves next to
        a region with very few electrons, so they diffuse across the boundary; holes on the
        p-side do the mirror image. Each carrier that crosses leaves behind an <em className="italic text-text">ionised
        dopant</em> — a fixed positive phosphorus ion on the n-side, a fixed negative boron ion
        on the p-side — and the resulting space-charge sets up an electric field across the
        boundary that opposes further diffusion. Equilibrium is reached when the field's drift
        current exactly cancels the diffusion current. The thin strip of crystal between the
        two bulks — empty of mobile carriers, populated only by ionised dopants — is the
        <Term def={<><strong className="text-text font-medium">depletion region</strong> — the thin slab straddling a p-n junction in which mobile carriers have been swept away, leaving only ionised dopants. The built-in field across it opposes further diffusion.</>}>depletion region</Term>
        <Cite id="streetman-banerjee-2015" in={SOURCES} /><Cite id="shockley-1949" in={SOURCES} />.
      </p>

      <PNJunctionFormationDemo />

      <p className="mb-prose-3">
        At equilibrium, the voltage across the depletion region is the <Term def={<><strong className="text-text font-medium">built-in potential</strong> V<sub>bi</sub> — the equilibrium voltage across a p-n junction, set by the doping levels. ≈ 0.6–0.7 V for typical Si junctions; this is the &ldquo;0.7 V drop&rdquo; engineers expect from a forward-biased silicon diode.</>}>built-in potential</Term>
        V<sub>bi</sub>, set by the doping levels through
      </p>
      <Formula tex="V_{bi} = (kT/q)\, \ln\!\left( \dfrac{N_A N_D}{n_i^2} \right)" />
      <p className="mb-prose-3">
        The formula reads like a thermodynamic statement, because that is exactly what it is.
        On the n-side the electron density is N<sub>D</sub>; on the p-side it is <InlineMath tex="n_i^2/N_A" />
        (mass-action). The ratio of those two — the "concentration gradient" electrons would like
        to flatten out by diffusing — is <InlineMath tex="N_A N_D / n_i^2" />. At equilibrium the
        built-in electric field has built up to exactly the height needed to stop that diffusion:
        the Boltzmann factor of the energy hill, <InlineMath tex="\exp(qV_{bi}/kT)" />, must equal the
        concentration ratio. Take the logarithm and divide by q/kT and there is the formula. It is
        the Einstein relation between mobility and diffusion, written in disguise: drift cancels
        diffusion when the voltage across the region is <InlineMath tex="V_T \cdot \ln(\text{concentration ratio})" />
        <Cite id="streetman-banerjee-2015" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        Plug in numbers. For typical silicon doping (N<sub>A</sub> = N<sub>D</sub> = 10¹⁶ cm⁻³,
        n<sub>i</sub> = 10¹⁰ cm⁻³ at 300 K), the ratio is 10¹². With V<sub>T</sub> ≈ 25.85 mV and
        <InlineMath tex="\ln(10^{12}) \approx 27.6" />, V<sub>bi</sub> ≈ 0.72 V. That number — the equilibrium voltage your
        crystal sets up <em className="italic text-text">by itself</em>, with no external bias — is also the height of the
        energy barrier any electron must climb to cross the junction. Forward bias reduces it;
        reverse bias raises it. For typical silicon doping V<sub>bi</sub> is ~0.7 V — the same
        ~0.7 V you measure as the forward drop, because to push current you have to flatten almost
        the entire built-in barrier.
      </p>
      <p className="mb-prose-3">
        Apply an external voltage in
        the <em className="italic text-text">forward</em> direction (p-side positive) and you reduce the net field across the
        depletion region; carriers can now diffuse across in large numbers and current flows.
        Apply it in the <em className="italic text-text">reverse</em> direction and you increase the field; mobile carriers
        are pulled further away, the depletion region widens, and the only current that flows
        is the tiny saturation current from thermally-generated minority carriers — nanoamps for
        a silicon junction at room temperature.
      </p>
      <p className="mb-prose-3">
        William Shockley wrote the closed-form I-V relation in 1949
        <Cite id="shockley-1949" in={SOURCES} /> — the <Term def={<><strong className="text-text font-medium">Shockley equation</strong> — the closed-form I-V relation for an ideal p-n junction: I = I<sub>s</sub>(exp(qV/nkT) − 1). The exponential covers fifteen orders of magnitude across a ~0.5 V swing.</>}>Shockley diode equation</Term>:
      </p>
      <Formula tex="I = I_s\, \left( \exp(qV / nkT) - 1 \right)" />
      <p className="mb-prose-3">
        Stare at the shape of the formula until it stops looking like algebra. Forward bias lowers
        the energy hill that electrons on the n-side have to climb to reach the p-side, from
        <InlineMath tex="qV_{bi}" /> down to <InlineMath tex="q(V_{bi} - V)" />. The number of electrons with enough thermal
        energy to surmount a barrier of height ΔE is Boltzmann's <InlineMath tex="\exp(-\Delta E/kT)" />; that is
        statistical mechanics, not transistor physics. So the population that crosses scales as
        <InlineMath tex="\exp(qV/kT)" />. The pre-factor I<sub>s</sub> is what the same exponential gives at V = 0 — the
        tiny thermal back-flow of minority carriers across the junction in either direction.
      </p>
      <p className="mb-prose-3">
        The "−1" is a bookkeeping demand of equilibrium. At V = 0, the forward Boltzmann flux and
        the reverse minority-carrier flux must be equal and opposite — no net current can flow
        across a junction at thermal equilibrium. The forward term is <InlineMath tex="I_s \cdot \exp(qV/kT)" />,
        which at V = 0 is just I<sub>s</sub>; subtracting I<sub>s</sub> gives the net flow, and
        forces I = 0 at V = 0 as required. In strong reverse bias the exponential collapses to
        zero and <InlineMath tex="I \to -I_s" />: that is the saturation current, the maximum reverse current
        the device can supply by sweeping out spontaneously-generated minority carriers.
      </p>
      <p className="mb-prose-3">
        The <Term def={<><strong className="text-text font-medium">thermal voltage</strong> V<sub>T</sub> = kT/q — the natural voltage scale of semiconductor physics. At 300 K, V<sub>T</sub> ≈ 25.85 mV. Every junction's I-V curve changes by a factor of <em className="italic text-text">e</em> per V<sub>T</sub> of bias change.</>}>thermal voltage</Term> V<sub>T</sub> = kT/q ≈ 25.85 mV at 300 K is the natural unit
        <Cite id="codata-2018" in={SOURCES} />: it is the voltage scale over which the Boltzmann
        factor changes by a factor of <em className="italic text-text">e</em>, and the voltage scale over which any junction
        physics changes meaningfully. Every "60 mV per decade" rule of thumb in this chapter
        comes from <InlineMath tex="V_T \cdot \ln(10) \approx 60\ \text{mV}" />.
      </p>
      <p className="mb-prose-3">
        Here I<sub>s</sub> is the reverse-saturation current (~10⁻⁹ A for silicon, ~10⁻⁵ A for
        Schottky), n is an ideality factor (≈1 for an ideal junction, 1.5–2 for a real diode at
        low current), q is the elementary charge, k is Boltzmann's constant, and T is absolute
        temperature. The exponential covers fifteen orders of magnitude across a 0.5 V swing.
        At V = 0 the current is zero; at V = 0.6 V the device is already conducting a few
        milliamps; at V = 0.7 V it is conducting tens of milliamps. That is what an engineer
        means when they say "a silicon diode drops 0.7 V"<Cite id="sedra-smith-2014" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        The much-quoted "0.7 V" is therefore not a fundamental constant of silicon, but a
        consequence of two engineering choices: typical operating currents in the
        milliamp range, and a typical I<sub>s</sub> in the femto- to nanoamp range. With
        <InlineMath tex="V_T \cdot \ln(10) \approx 60\ \text{mV}" /> per decade, getting from femtoamps to milliamps takes about
        twelve decades, or ~720 mV. Push a diode to microamps instead and V<sub>F</sub> sits
        around 0.5 V; push it to amps and V<sub>F</sub> rises to ~0.9 V. Same equation, different
        operating point.
      </p>

      <Pullout>
        Every junction in a circuit is doing the same thing: counting how many electrons in a Boltzmann tail have enough energy to climb a barrier.
      </Pullout>

      <TryIt
        tag="Try 14.2"
        question={<>A silicon diode with forward voltage V<sub>F</sub> = 0.7 V sits in series with a 1 kΩ resistor across a 5 V supply. What is the current?</>}
        hint="The diode drop is fixed; the resistor takes the rest."
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">
              KVL around the loop: <InlineMath tex="V_{\text{supply}} - V_R - V_F = 0" />.
              The resistor drops 5 − 0.7 = 4.3 V. Ohm's law gives the current:
            </p>
            <Formula tex="I = V_R / R = 4.3\ \text{V} / 1000\ \Omega = 4.3\ \text{mA}" />
            <p className="mb-prose-1 last:mb-0">
              This is the standard back-of-envelope for any LED current-limit calculation, with
              V<sub>F</sub> swapped for the LED's forward voltage (~2 V red, ~3.2 V blue)
              <Cite id="horowitz-hill-2015" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2 className="chapter-h2">Diodes — and their many flavours</h2>

      <p className="mb-prose-3">
        A p-n junction is already a diode: a two-terminal device that conducts in one direction
        and blocks in the other. But "diode" is a family, not a single part. The doping
        profile, the materials, and even the geometry (a metal-semiconductor contact rather
        than a p-n junction) tune the V<sub>F</sub>, the speed, and the breakdown behaviour for
        different jobs.
      </p>

      <DiodeCharacteristicDemo />

      <p className="mb-prose-3">
        A <em className="italic text-text">standard silicon p-n diode</em> like the 1N4148 has V<sub>F</sub> ≈ 0.7 V and a
        peak inverse voltage of 100 V; perfectly suited to mains-frequency rectification and
        small-signal switching. A <em className="italic text-text"><Term def={<><strong className="text-text font-medium">Schottky diode</strong> — a metal-semiconductor junction (typically Pt or PtSi on n-Si) used as a diode. Lower V<sub>F</sub> (~0.3 V) and majority-carrier conduction (picosecond switching).</>}>Schottky diode</Term></em> replaces one of the p-n
        layers with a metal contact (typically platinum silicide on n-silicon); the resulting
        junction conducts via majority carriers only, so it has no minority-carrier storage and
        switches in picoseconds, at the cost of a higher reverse leakage. V<sub>F</sub> ≈ 0.3 V
        — useful in any switching power supply where the rectifier loss matters
        <Cite id="horowitz-hill-2015" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        A <em className="italic text-text"><Term def={<><strong className="text-text font-medium">Zener diode</strong> — a heavily-doped p-n diode designed to break down sharply in reverse at a specific voltage V<sub>Z</sub> (2.4 V to 200 V); the breakdown voltage is remarkably stable, making it the workhorse reference for low-cost regulators and over-voltage clamps.</>}>Zener breakdown</Term></em> diode is doped much more heavily on both sides
        so that in reverse, at a specific voltage V<sub>Z</sub>, the field across the depletion
        region is large enough to tunnel valence electrons directly into the conduction band
        (or — for V<sub>Z</sub> &gt; ~5 V — to trigger avalanche multiplication). Past V<sub>Z</sub> the
        diode clamps; the voltage stays glued to V<sub>Z</sub> as the current rises. A cheap, stable
        voltage reference. An <em className="italic text-text"><Term def={<><strong className="text-text font-medium">LED</strong> — light-emitting diode. A forward-biased p-n junction in a direct-gap semiconductor (GaAs, GaN, InGaN); recombining electron-hole pairs emit photons whose energy matches the bandgap.</>}>LED</Term></em>
        is the same junction in a direct-gap semiconductor — most commonly an InGaN heterostructure
        for blue, InGaAlP for red, GaAs for infrared. Electron-hole pairs recombining at the
        junction release a photon whose energy ≈ E<sub>g</sub>. A varactor uses the depletion
        region's voltage-dependent capacitance to make a tuning element for VCOs and PLLs; a
        photodiode runs reverse-biased and reads the current generated by photons absorbed in
        its depletion region.
      </p>

      <h2 className="chapter-h2">The bipolar junction transistor</h2>

      <p className="mb-prose-3">
        Stack two p-n junctions back-to-back, sharing a thin middle layer, and you have a
        three-terminal device with a wildly nonlinear input-output relation. In an <em className="italic text-text">npn</em>
        transistor, the layers are: a heavily-doped n-type <Term def={<><strong className="text-text font-medium">emitter</strong> — the heavily-doped terminal of a BJT that injects minority carriers into the base.</>}>emitter</Term>, a thin lightly-doped
        p-type <Term def={<><strong className="text-text font-medium">base</strong> — the thin lightly-doped middle layer of a BJT. The base-emitter junction's forward voltage controls the much larger collector current.</>}>base</Term>, and a moderately-doped n-type <Term def={<><strong className="text-text font-medium">collector</strong> — the third terminal of a BJT, biased in reverse with respect to the base; it collects most of the carriers injected by the emitter.</>}>collector</Term>. The base-emitter junction is forward-biased
        (V<sub>BE</sub> ≈ 0.7 V) so the emitter injects a flood of electrons into the base. The
        base is so thin (~1 µm) that almost all of those electrons reach the base-collector
        depletion region before recombining; once there, the collector's reverse-bias field
        sweeps them across. The result: a small base current I<sub>B</sub> controls a much larger
        collector current
      </p>
      <Formula tex="I_C = \beta \cdot I_B" />
      <p className="mb-prose-3">
        The asymmetry between the two currents is geometric, not mysterious. The emitter
        injects, say, a hundred million electrons per second into the base. Those electrons must
        cross a base region only about a micron thick — much thinner than their typical
        recombination distance — before they reach the collector depletion field, which sweeps
        them out. Almost all of them make it. The few that don't recombine with a hole, and
        every recombined hole has to be replaced by one entering through the base lead. So
        I<sub>B</sub> is the trickle of replacement holes; I<sub>C</sub> is the flood of electrons
        that survived the crossing. β is the survival ratio. Make the base thinner or more
        lightly doped (fewer holes to recombine with) and β rises<Cite id="streetman-banerjee-2015" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        β is therefore a number that emerges from a manufacturing process, not a physical
        constant. Two devices off the same wafer can differ by 50%; β rises with temperature
        (more carriers diffuse before recombining) and falls at very low or very high I<sub>C</sub>.
        A good amplifier design either uses negative feedback to make the gain independent of β,
        or deliberately operates the transistor at a point where the β-spread is acceptable.
        The Bardeen-Brattain point-contact transistor of 1947 had β ≈ 30; a modern small-signal
        BJT routinely hits β = 300<Cite id="razavi-2021" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        with the <Term def={<><strong className="text-text font-medium">current gain</strong> β (also h<sub>FE</sub>) — the ratio I<sub>C</sub>/I<sub>B</sub> for a BJT in the active region. Typically 50–500 for a small-signal device; varies with operating current, temperature, and from part to part.</>}>current gain β</Term> typically 50–500 for a small-signal device
        <Cite id="bardeen-brattain-1948" in={SOURCES} /><Cite id="sedra-smith-2014" in={SOURCES} />.
        Bardeen, Brattain, and Shockley shared the 1956 Nobel for this
        device<Cite id="shockley-1956-nobel" in={SOURCES} />.
      </p>

      <BJTCharacteristicDemo />

      <p className="mb-prose-3">
        The output characteristic — I<sub>C</sub> as a function of V<sub>CE</sub> at fixed I<sub>B</sub> —
        breaks into three regions. Below V<sub>CE</sub> ≈ 0.2 V the device is in <em className="italic text-text">saturation</em>:
        the collector junction is no longer reverse-biased and the device acts roughly as a
        small voltage source. Above that, the <em className="italic text-text">active region</em>, I<sub>C</sub> is nearly flat,
        independent of V<sub>CE</sub> — a remarkable property — and equal to <InlineMath tex="\beta \cdot I_B" />. The
        residual slope across the active region is the <Term def={<><strong className="text-text font-medium">Early effect</strong> — the slight rise of I<sub>C</sub> with V<sub>CE</sub> in the BJT active region, caused by collector-base depletion widening into the base. Parameterised by the Early voltage V<sub>A</sub>; sets the device's output resistance r<sub>o</sub> = V<sub>A</sub>/I<sub>C</sub>.</>}>Early effect</Term>: as V<sub>CE</sub>
        rises, the collector depletion region widens slightly into the base, narrowing the
        effective base width and increasing β. A clean small-signal BJT has an Early voltage
        V<sub>A</sub> ≈ 50 V<Cite id="sedra-smith-2014" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        There are three ways to wire the device into a circuit. <Term def={<><strong className="text-text font-medium">Common-emitter</strong> — the standard amplifier configuration: input drives the base, output is taken from the collector, emitter is grounded (or grounded for AC through a bypass cap). Both voltage and current gain are large; the output is inverted.</>}>Common-emitter</Term>
        (input at base, output at collector, emitter grounded) gives both voltage and current
        gain, with the output inverted; it is the workhorse amplifier topology. <em className="italic text-text">Common-base</em>
        (input at emitter, output at collector) has low input impedance and gives only voltage
        gain — useful at very high frequencies. <em className="italic text-text">Common-collector</em> (input at base, output
        at emitter — the "emitter follower") has voltage gain ≈ 1 but high input impedance and
        low output impedance, making it the standard buffer.
      </p>

      <TryIt
        tag="Try 14.3"
        question={<>An npn BJT has β = 100 and a base current I<sub>B</sub> = 10 µA. What are I<sub>C</sub> and I<sub>E</sub> in the active region?</>}
        hint="I_C = β·I_B; KCL gives I_E = I_C + I_B."
        answer={
          <>
            <Formula tex="I_C = \beta \cdot I_B = 100 \cdot 10\ \mu\text{A} = 1.0\ \text{mA}" />
            <Formula tex="I_E = I_C + I_B = 1.0\ \text{mA} + 0.01\ \text{mA} = 1.01\ \text{mA}" />
            <p className="mb-prose-1 last:mb-0">
              I<sub>E</sub> ≈ I<sub>C</sub> within 1% — a useful approximation for any β &gt; 50, and
              the basis of the standard "ignore I<sub>B</sub>" shortcut in bias analysis
              <Cite id="sedra-smith-2014" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2 className="chapter-h2">The field-effect transistor</h2>

      <p className="mb-prose-3">
        The BJT works by injecting carriers across a forward-biased junction. The <Term def={<><strong className="text-text font-medium">field-effect transistor</strong> (FET) — a transistor whose channel conductance between source and drain is modulated by the voltage on an electrically-isolated gate. No current (ideally) flows into the gate.</>}>field-effect transistor</Term>
        works by a different mechanism: a voltage on an insulated third terminal — the gate —
        modulates the conductance of a channel between two other terminals (source and drain).
        No current flows into the gate (idealised), which makes the FET's input impedance
        essentially infinite at DC. Dawon Kahng and Martin Atalla, also at Bell Labs, built the
        first working <Term def={<><strong className="text-text font-medium">MOSFET</strong> — metal-oxide-semiconductor field-effect transistor. The dominant transistor of the integrated-circuit era: gate is metal (or polysilicon) above a thin SiO₂ layer above a doped silicon channel. Kahng and Atalla, Bell Labs 1959.</>}>MOSFET</Term> in 1959 — a flat silicon wafer with a thermally-grown
        SiO<sub>2</sub> layer as the gate dielectric<Cite id="kahng-atalla-1960" in={SOURCES} />.
      </p>

      <MOSFETOperationDemo />

      <p className="mb-prose-3">
        The 2D cross-section makes the I-V curves quantitative; the 3D rendering
        below makes the geometry visceral. Drag to orbit the device, push V<sub>GS</sub>
        past V<sub>T</sub>, and watch the inversion layer light up directly under the
        oxide as a thin channel of electron dots connecting source to drain. Add a
        V<sub>DS</sub> and the same dots stream toward the drain.
      </p>

      <MOSFET3DDemo />

      <p className="mb-prose-3">
        In an n-channel enhancement MOSFET the substrate is p-type, with two heavily-doped
        n-type regions (the source and the drain) separated by a few hundred nanometres. The
        gate is a slab of metal (or, since the 1970s, doped polysilicon) sitting on top of a
        2–10 nm layer of SiO<sub>2</sub>. Below threshold — the <Term def={<><strong className="text-text font-medium">threshold voltage</strong> V<sub>T</sub> — the gate-source voltage at which an inversion layer of mobile carriers just begins to form under the gate. Typically 0.3–1 V for modern process nodes.</>}>threshold voltage</Term> V<sub>T</sub> —
        the surface under the gate stays p-type and no current flows between source and drain.
        Push V<sub>GS</sub> past V<sub>T</sub> and the gate field is strong enough to invert the
        surface into a thin n-type channel; source and drain are now connected by a conducting
        path. Apply V<sub>DS</sub> and electrons flow.
      </p>
      <p className="mb-prose-3">
        The square-law model captures the device behaviour in two regimes
        <Cite id="sedra-smith-2014" in={SOURCES} />. In <em className="italic text-text">triode</em> (V<sub>DS</sub> &lt; V<sub>GS</sub> − V<sub>T</sub>):
      </p>
      <Formula tex="I_D = k_n\, \left[ (V_{GS} - V_T)\, V_{DS} - V_{DS}^2/2 \right]" />
      <p className="mb-prose-3">
        Unpack the formula one factor at a time. The gate-oxide capacitance per unit area is
        C<sub>ox</sub>; the voltage above threshold is <InlineMath tex="(V_{GS} - V_T)" />; so the
        sheet charge density of mobile carriers in the inversion layer is
        <InlineMath tex="Q_s = C_{ox}(V_{GS} - V_T)" /> — exactly the parallel-plate
        capacitor result from Ch.5, except one of the "plates" is now a thin sheet of induced
        electrons. The width W (perpendicular to current flow) and length L (along current flow)
        set the channel's aspect ratio. A field <InlineMath tex="E \approx V_{DS}/L" /> drives the carriers at drift
        velocity <InlineMath tex="v = \mu_n \cdot E" />. Current is charge per length × velocity × width:
        <InlineMath tex="I_D \approx (C_{ox} \cdot W \cdot V_{OV}) \cdot (\mu_n \cdot V_{DS}/L)" />, which is
        the first term. The −V<sub>DS</sub>²/2 correction accounts for the fact that the channel
        is being squeezed thinner toward the drain end as V<sub>DS</sub> rises — the charge
        density isn't uniform, it tapers.
      </p>
      <p className="mb-prose-3">
        which is approximately linear in V<sub>DS</sub> for small V<sub>DS</sub> — a
        voltage-controlled resistor. In <em className="italic text-text">saturation</em> (V<sub>DS</sub> &gt; V<sub>GS</sub> − V<sub>T</sub>),
        the channel <Term def={<><strong className="text-text font-medium">pinches off</strong> — at the drain end of a saturated MOSFET channel, the local gate-to-channel voltage drops below V<sub>T</sub> and the inversion layer disappears. Carriers crossing the pinch-off point are swept by the drain depletion field; further increase in V<sub>DS</sub> falls across the depletion region rather than across the channel, so I<sub>D</sub> stops growing.</>}>pinches off</Term> at the drain end and the current becomes independent of V<sub>DS</sub>:
      </p>
      <Formula tex="I_D = (k_n/2)(V_{GS} - V_T)^2" />
      <p className="mb-prose-3">
        Why a square law? Picture two things multiplying. The inversion-layer charge density is
        proportional to the overdrive <InlineMath tex="V_{OV} = V_{GS} - V_T" /> (more gate
        voltage above threshold piles up more electrons). The average longitudinal field that
        moves them along the channel is also proportional to V<sub>OV</sub> at pinch-off (because
        in saturation V<sub>DS</sub> at the pinch point equals V<sub>OV</sub>, and the field is
        <InlineMath tex="V_{OV}/L" />). Current = charge × velocity, and both factors carry one power of
        V<sub>OV</sub>. Multiply them: <InlineMath tex="V_{OV}^2" />. The factor of ½ is the geometric average,
        accounting for the channel tapering from full thickness at the source to zero at the
        drain<Cite id="sedra-smith-2014" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        with <InlineMath tex="k_n = \mu_n C_{ox} W/L" /> the transconductance parameter.
        For a small-signal n-MOSFET, k<sub>n</sub> is in the milliamp-per-volt-squared range; for a
        power MOSFET, several amps per volt squared.
      </p>
      <p className="mb-prose-3">
        Below threshold, V<sub>OV</sub> is negative, the square law would give a nonsensical
        answer, and the right description is the subthreshold-diffusion regime (touched on in the
        FAQ). The threshold itself is the precise voltage at which the surface flips from p-type
        to inverted n-type — i.e. the gate field has finally pulled enough electrons up out of
        the conduction band of the bulk and into the surface to outnumber the local holes. Below
        V<sub>T</sub>, no channel. Above V<sub>T</sub>, the channel exists and the square law
        starts<Cite id="streetman-banerjee-2015" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        <Term def={<><strong className="text-text font-medium">JFET</strong> — junction FET. Gate is a reverse-biased p-n junction whose depletion region pinches the channel from the side, rather than an oxide-isolated metal electrode. Higher input impedance than a BJT, lower than a MOSFET; the standard low-noise high-impedance front-end before MOSFETs got cheap.</>}>JFETs</Term> (junction FETs) and the p-channel mirror image (pMOS) round out the family. In
        a JFET, the gate is itself a reverse-biased p-n junction rather than an oxide-insulated
        electrode; the depletion region pinches the channel from the side. In a pMOS, swap
        every doping type and every polarity — current is carried by holes, V<sub>T</sub> and V<sub>DS</sub>
        are negative. <Term def={<><strong className="text-text font-medium">CMOS</strong> — complementary metal-oxide-semiconductor: a logic family that uses matched n-MOSFET and p-MOSFET pairs so that, in steady state, exactly one transistor of each pair is off — drawing zero DC current. The substrate of all modern digital electronics.</>}>CMOS</Term> logic — the substrate of every modern processor — pairs an n-MOSFET
        and a p-MOSFET so that, in steady state, exactly one of them is off; the pair draws
        essentially zero current except during a switching transition. That property is the
        single reason MOSFETs displaced BJTs in digital design: every CMOS gate burns power
        only when it switches, which lets you put 19 billion of them on one die without it
        melting<Cite id="razavi-2021" in={SOURCES} />.
      </p>

      <Pullout>
        The MOSFET is a parallel-plate capacitor with a current of mobile charge underneath, controlled by the voltage across the plates.
      </Pullout>

      <TryIt
        tag="Try 14.4"
        question={<>An n-channel MOSFET has V<sub>T</sub> = 1 V and k<sub>n</sub> = 1 mA/V². It is biased in saturation with V<sub>GS</sub> = 3 V. Find I<sub>D</sub>.</>}
        hint="In saturation, I_D = (k_n/2)(V_GS − V_T)²."
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">The overdrive voltage is <InlineMath tex="V_{OV} = V_{GS} - V_T = 2\ \text{V}" />.</p>
            <Formula tex="I_D = (k_n/2)\, V_{OV}^2 = (1\ \text{mA/V}^2 / 2)(2\ \text{V})^2 = 2\ \text{mA}" />
            <p className="mb-prose-1 last:mb-0">
              The square-law in saturation is the workhorse of every analog-MOS designer's
              back-of-envelope: pick V<sub>OV</sub>, pick k<sub>n</sub>, get I<sub>D</sub>
              <Cite id="sedra-smith-2014" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2 className="chapter-h2">Small-signal model and load lines</h2>

      <p className="mb-prose-3">
        Real amplifiers operate around a fixed DC bias point — the <Term def={<><strong className="text-text font-medium">operating point</strong> (Q-point) — the DC values of voltages and currents in a circuit when no signal is present. Sets where on the device's nonlinear I-V curve the small-signal swing happens.</>}>operating point</Term>, or Q-point —
        with a small AC signal superimposed on top. The trick is that any smooth nonlinear
        function looks linear if you zoom in enough. Around the Q-point, the BJT's response
        to a small base-emitter perturbation is captured by a single number: the <Term def={<><strong className="text-text font-medium">transconductance</strong> g<sub>m</sub> = ∂I<sub>C</sub>/∂V<sub>BE</sub>. The slope of the device's I-V curve at the operating point; for a BJT, g<sub>m</sub> = I<sub>C</sub>/V<sub>T</sub>. Sets the small-signal gain of any amplifier built from the device.</>}>transconductance</Term>
        g<sub>m</sub>, which is the slope of the I<sub>C</sub>-V<sub>BE</sub> curve at the Q-point:
      </p>
      <Formula tex="g_m = \dfrac{\partial I_C}{\partial V_{BE}} = \dfrac{I_C}{V_T}" />
      <p className="mb-prose-3">
        Differentiate the Shockley equation and the result almost writes itself. I<sub>C</sub> is
        proportional to <InlineMath tex="\exp(V_{BE}/V_T)" />, so dI/dV brings down a factor of <InlineMath tex="1/V_T" />
        and reproduces the same I<sub>C</sub> in front. The slope of an exponential is the
        exponential itself divided by its scale. Numerically: at I<sub>C</sub> = 1 mA and V<sub>T</sub>
        = 25.85 mV, g<sub>m</sub> = 38.7 mS — a 1 mV wiggle on V<sub>BE</sub> shifts I<sub>C</sub> by
        38.7 µA. A remarkably clean formula: the transconductance of any BJT depends only on the
        bias current and (weakly) on temperature, <em className="italic text-text">not</em> on β, not on geometry, not on
        process<Cite id="razavi-2021" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        where <InlineMath tex="V_T = kT/q \approx 25.85\ \text{mV}" /> at room temperature<Cite id="codata-2018" in={SOURCES} />.
        For an MOSFET in saturation,
        <InlineMath tex="g_m = k_n (V_{GS} - V_T) = \sqrt{2 k_n I_D}" />.
        The <Term def={<><strong className="text-text font-medium">small-signal model</strong> — a linearised equivalent circuit valid for perturbations small compared to V<sub>T</sub> or V<sub>OV</sub>. Replaces the nonlinear device with a transconductance source g<sub>m</sub>·v<sub>be</sub>, an input resistance r<sub>π</sub>, and an output resistance r<sub>o</sub>.</>}>small-signal model</Term> replaces the whole nonlinear device with a linear
        equivalent: a voltage-controlled current source <InlineMath tex="g_m \cdot v_\pi" /> in parallel with
        the Early-effect resistance r<sub>o</sub>, plus an input resistance <InlineMath tex="r_\pi = \beta/g_m" />
        <Cite id="razavi-2021" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        The MOSFET expression <InlineMath tex="g_m = k_n \cdot V_{OV} = \sqrt{2 k_n I_D}" />
        tells a different story. Differentiate the square law: <InlineMath tex="dI_D/dV_{GS} = k_n(V_{GS} - V_T)" />.
        For the <em className="italic text-text">same</em> bias current, the BJT's
        <InlineMath tex="g_m = I/V_T = I/(0.026\ \text{V})" /> is much larger than the MOSFET's <InlineMath tex="I/(V_{OV}/2)" />
        with V<sub>OV</sub> typically 0.2–0.5 V. That is the small price you pay for the MOSFET's
        infinite gate input impedance: less transconductance per amp of bias. Modern analog
        designers spend a lot of effort recovering it — wide channels (large W/L), short-channel
        process nodes (small L) — to make MOSFET amplifiers competitive with bipolar ones.
      </p>
      <p className="mb-prose-3">
        The other half of the picture is the <Term def={<><strong className="text-text font-medium">load line</strong> — the locus of (I<sub>C</sub>, V<sub>CE</sub>) points satisfying V<sub>CE</sub> = V<sub>CC</sub> − I<sub>C</sub> R<sub>C</sub>. A straight line on the I<sub>C</sub>-V<sub>CE</sub> plane whose intersection with the device's I-V curve sets the Q-point.</>}>load line</Term>. Whatever the transistor does, the
        external circuit (a supply V<sub>CC</sub> and a collector resistor R<sub>C</sub>) imposes its own
        constraint: KVL around the output loop gives
      </p>
      <Formula tex="V_{CE} = V_{CC} - I_C \cdot R_C" />
      <p className="mb-prose-3">
        That is Kirchhoff's voltage law applied to a single loop — nothing more. The supply
        V<sub>CC</sub> is fixed; whatever current flows through R<sub>C</sub> drops some voltage
        across it; whatever is left appears across the transistor as V<sub>CE</sub>. Solve for
        I<sub>C</sub> and you get a line of slope <InlineMath tex="-1/R_C" /> with two end-points: at
        V<sub>CE</sub> = V<sub>CC</sub> the current is zero (cut-off), and at V<sub>CE</sub> = 0 the
        current is <InlineMath tex="V_{CC}/R_C" /> (saturation, the maximum the resistor can pass).
        Every (I<sub>C</sub>, V<sub>CE</sub>) point the circuit can <em className="italic text-text">possibly</em> occupy lies on
        this line, regardless of what the transistor is doing.
      </p>
      <p className="mb-prose-3">
        The transistor, separately, has its own family of I-V curves: one curve per value of
        I<sub>B</sub>, all of them nearly flat in the active region. The actual operating point
        — the one place where both constraints can be satisfied at once — is the intersection.
        Slide I<sub>B</sub> up by a small AC perturbation and the active-region curve moves up
        bodily; the intersection slides along the fixed load line to a new (I<sub>C</sub>,
        V<sub>CE</sub>). That sliding-along-the-load-line motion <em className="italic text-text">is</em> the amplified signal,
        and the geometry tells you everything about the swing.
      </p>
      <p className="mb-prose-3">
        Plotted on the I<sub>C</sub>-V<sub>CE</sub> plane, that line runs from <InlineMath tex="(V_{CC}, 0)" />
        to <InlineMath tex="(0, V_{CC}/R_C)" />. The Q-point is where the load line crosses the
        transistor's I<sub>B</sub>-trace. Move I<sub>B</sub> a little — by injecting a small AC signal at
        the base — and Q slides up and down the load line, producing a swing in V<sub>CE</sub>.
      </p>

      <LoadLineAnalysisDemo />

      <p className="mb-prose-3">
        Two graphical observations follow. (1) The maximum swing is constrained at one end by
        V<sub>CE</sub> = V<sub>CE(sat)</sub> ≈ 0.2 V (the transistor saturates) and at the other end by
        V<sub>CE</sub> = V<sub>CC</sub> (the transistor cuts off). For symmetrical swing,
        Q is placed in the middle. (2) The slope of the load line is <InlineMath tex="-1/R_C" />, so the
        voltage swing per unit current swing is exactly R<sub>C</sub>. Combined with g<sub>m</sub>,
        which gives current swing per unit base-voltage swing, the small-signal voltage gain is
        the product:
      </p>
      <Formula tex="A_v = \dfrac{\Delta V_{CE}}{\Delta v_{be}} = -g_m \cdot R_C" />
      <p className="mb-prose-3">
        Read it as a chain rule. A small input wiggle Δv<sub>be</sub> changes the collector current
        by <InlineMath tex="\Delta I_C = g_m \cdot \Delta v_{be}" /> (the device's transconductance, doing its
        one job). That current wiggle, forced through R<sub>C</sub> by Ohm's law, produces a
        voltage swing <InlineMath tex="\Delta V_{RC} = R_C \cdot \Delta I_C" /> across the resistor. Since
        V<sub>CC</sub> is held constant by the supply, every millivolt that appears across the
        resistor disappears from V<sub>CE</sub> — hence the minus sign. Multiply: <InlineMath tex="dV_{out}/dV_{in} = -g_m \cdot R_C" />.
        The transistor converts voltage to current; the resistor
        converts current back to voltage; their product is the voltage gain.
      </p>
      <p className="mb-prose-3">
        The product also reveals where amplification gets its leverage. Substitute <InlineMath tex="g_m = I_C/V_T" />
        and the gain becomes <InlineMath tex="A_v = -(I_C \cdot R_C)/V_T" />.
        <InlineMath tex="I_C \cdot R_C" /> is just the DC voltage dropped across the load resistor at the
        quiescent point — call it V<sub>RC</sub> — and V<sub>T</sub> is fixed at ~26 mV.
        Gain <InlineMath tex="\approx V_{RC}/V_T" />. Drop a few volts across R<sub>C</sub> and you get a few
        hundred-fold voltage gain, automatically. That is the whole secret of the common-emitter
        amplifier: it converts headroom (DC voltage across the load) into gain (AC voltage at the
        output) at a fixed conversion ratio of <InlineMath tex="1/V_T" />.
      </p>

      <h2 className="chapter-h2">The common-emitter amplifier</h2>

      <p className="mb-prose-3">
        Bringing it together: a single BJT, a base bias network, a collector resistor, an
        emitter resistor for stability, and an input coupling cap to block DC give you a
        working <em className="italic text-text">common-emitter amplifier</em>. The bias divider R<sub>1</sub>/R<sub>2</sub>
        sets V<sub>BB</sub> (the Thévenin equivalent of the divider with respect to ground); the
        emitter resistor R<sub>E</sub> provides negative feedback that stabilises the operating point
        against β-variation; R<sub>C</sub> converts the transistor's current swing back into a voltage
        swing. With R<sub>E</sub> bypassed by a large capacitor (so it disappears at signal
        frequencies), the small-signal gain is the one we just wrote down.
      </p>

      <CommonEmitterAmpDemo />

      <p className="mb-prose-3">
        Real numbers. Take I<sub>C</sub> = 1 mA (a reasonable Q-point for a small-signal stage),
        V<sub>T</sub> = 25.85 mV. Then g<sub>m</sub> = 1 mA / 25.85 mV ≈ 38.7 mS. With R<sub>C</sub> = 10 kΩ:
      </p>
      <Formula tex="A_v = -g_m R_C = -(0.0387\ \text{S})(10000\ \Omega) \approx -387" />
      <p className="mb-prose-3">
        The energy ledger is worth pausing on, because it is the source of every working amplifier
        in the world. The 1 mA bias current flowing from the V<sub>CC</sub> rail through R<sub>C</sub>
        and the transistor to ground costs 12 mW of continuous DC power. The input signal — a
        millivolt of AC, drawing on the order of a microamp from the source — contributes at most
        nanowatts. Yet the output across R<sub>C</sub> swings by hundreds of millivolts and can
        drive milliamps. Where does the difference come from? The supply. The signal does not
        add energy; it modulates how much of the supply's energy is steered through the load
        resistor at each instant. The transistor is a controlled valve; the supply is the
        reservoir; the signal opens and closes the valve. "Amplification" is a misnomer for what
        is really gated power<Cite id="razavi-2021" in={SOURCES} />.
      </p>

      <Pullout>
        A transistor does not amplify. It gates. The energy comes from the supply; the signal only decides how much of it gets through.
      </Pullout>

      <p className="mb-prose-3">
        A factor of 387 — call it 51 dB — from one transistor and one resistor. In practice
        the gain is lower because R<sub>E</sub> is rarely fully bypassed, and the collector
        resistance r<sub>o</sub> sits in parallel with R<sub>C</sub>; a careful design ends up around
        ×100 to ×200. Cascade two of them and you have a microphone preamplifier; cascade
        three and you have a guitar amp's input stage; cascade many of them with the right
        DC level-shifting and feedback paths and you have an op-amp — exactly the device the
        next chapter assumes you can buy off the shelf.
      </p>

      <TryIt
        tag="Try 14.5"
        question={<>A common-emitter amplifier biases I<sub>C</sub> = 2 mA and has R<sub>C</sub> = 5 kΩ (R<sub>E</sub> fully bypassed). At room temperature, find g<sub>m</sub> and the small-signal voltage gain A<sub>v</sub>.</>}
        hint="g_m = I_C / V_T with V_T = 25.85 mV. Then A_v = −g_m · R_C."
        answer={
          <>
            <Formula tex="g_m = I_C / V_T = 2\ \text{mA} / 25.85\ \text{mV} \approx 77.4\ \text{mS}" />
            <Formula tex="A_v = -g_m \cdot R_C = -(0.0774\ \text{S})(5000\ \Omega) \approx -387" />
            <p className="mb-prose-1 last:mb-0">
              Same answer as the worked example, by no accident — g<sub>m</sub>·R<sub>C</sub> only
              depends on the product I<sub>C</sub>·R<sub>C</sub>, which is the voltage drop across the
              collector resistor at the Q-point. Double the current and halve the resistor;
              gain stays the same<Cite id="razavi-2021" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2 className="chapter-h2">What we have so far</h2>

      <p className="mb-prose-3">
        A semiconductor is a crystal whose conductivity sits between metal and insulator, set
        by a bandgap small enough to permit a useful population of thermally-excited or
        deliberately-doped carriers. Doping splits silicon into n-type and p-type pieces; joining
        them at a single plane gives the p-n junction, the foundation of every diode, every
        solar cell, every LED. Stacking junctions gives the bipolar transistor; insulating a
        gate over a substrate gives the MOSFET. Either device, biased into its active region,
        responds linearly to small input perturbations — the small-signal model — with a
        transconductance g<sub>m</sub> that sets the gain of every amplifier built around it. The
        load line ties the device's I-V curve to the external supply and load resistor; the
        intersection is the Q-point. A common-emitter stage with I<sub>C</sub> = 1 mA and R<sub>C</sub> = 10 kΩ
        delivers a voltage gain of about −400.
      </p>
      <p className="mb-prose-3">
        The next two chapters cash that in. Ch.15 picks up the frequency domain we need to
        make sense of any time-varying signal; Ch.16 builds the op-amp — a packaged stack of
        transistors with so much gain that, inside a negative-feedback loop, every gain block
        becomes a two-resistor problem.
      </p>

      <CaseStudies
        intro={<>
          Four places the silicon of this chapter ends up doing the work in a real system.
        </>}
      >
        <CaseStudy
          tag="Case 14.1"
          title="Apple A17 Pro — 19 billion FinFETs on one die"
          summary="TSMC N3 process node, ~19 billion transistors on ~103 mm², every one of them a FinFET-MOSFET descendant of Kahng-Atalla 1959."
          specs={[
            { label: 'Process node', value: <>TSMC N3 (3 nm class) <Cite id="razavi-2021" in={SOURCES} /></> },
            { label: 'Transistor count', value: <>≈ 19 × 10⁹ <Cite id="razavi-2021" in={SOURCES} /></> },
            { label: 'Die area', value: <>≈ 103 mm²</> },
            { label: 'Density', value: <>~180 million transistors / mm²</> },
            { label: 'Architecture', value: <>FinFET — three-sided gate wrap around a fin-shaped channel</> },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            The A17 Pro is a fingernail-sized piece of silicon containing roughly nineteen
            billion transistors. Every one of them is a MOSFET — specifically a FinFET, a
            variant of the planar MOSFET in which the channel is a thin vertical fin and the
            gate wraps around three sides for better electrostatic control of the channel.
            FinFETs replaced planar MOSFETs at the 22 nm node (Intel, 2011) because at smaller
            geometries the planar gate could no longer hold the channel off when V<sub>GS</sub> = 0,
            and the resulting leakage was eating the device's power budget alive
            <Cite id="razavi-2021" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            The physics is still Kahng and Atalla's MOSFET from 1959
            <Cite id="kahng-atalla-1960" in={SOURCES} /> — gate over thin oxide over channel
            between source and drain — with sixty years of engineering refinement in materials
            (high-κ hafnium oxide replacing SiO₂ at 45 nm), geometry (the FinFET wrap, and
            now the gate-all-around nanosheet at 2 nm), and process (extreme-ultraviolet
            lithography, atomic-layer deposition, plasma etching to atomic precision). The
            equations from this chapter — square-law I<sub>D</sub>, g<sub>m</sub> from
            (V<sub>GS</sub> − V<sub>T</sub>), CMOS pairing — are still the analog-design starting point
            on the chip, alongside enormous additional machinery for short-channel effects,
            quantum tunnelling through the gate oxide, and statistical dopant fluctuations.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 14.2"
          title="Infrared remote-control LED"
          summary="A GaAs diode at 940 nm emits when its forward current crosses ~5 mA; same physics as a visible LED, different bandgap."
          specs={[
            { label: 'Material', value: <>GaAs (E<sub>g</sub> = 1.42 eV at 300 K) <Cite id="streetman-banerjee-2015" in={SOURCES} /></> },
            { label: 'Wavelength', value: <>~940 nm (near-infrared)</> },
            { label: 'Forward voltage', value: <>~1.3 V at 20 mA</> },
            { label: 'Modulation', value: <>38 kHz carrier, ~600 µs symbol time (NEC protocol)</> },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            Every TV remote has a tiny clear plastic dome on the front. Underneath it is a
            GaAs LED — chosen for its 1.42 eV direct bandgap, which makes the recombination
            photon energy hf = E<sub>g</sub>, giving a wavelength λ ≈ 940 nm
            <Cite id="streetman-banerjee-2015" in={SOURCES} />. Near-infrared rather than
            visible: the human eye sees nothing, but a silicon-based phototransistor in the
            target device (with its 1.12 eV bandgap, lower than the photon energy) reads the
            pulses easily.
          </p>
          <p className="mb-prose-2 last:mb-0">
            The protocol on every infrared remote — NEC, RC5, RC6, Sony SIRC — modulates the
            LED current on and off in bursts at a 36–40 kHz carrier, then encodes the actual
            command in the durations of those bursts. The receiver IC inside the TV is built
            around a phototransistor (a transistor whose base is replaced by a light-sensitive
            region) and a bandpass filter centred on the carrier; the bandpass rejects ambient
            sunlight and incandescent flicker. The same LED-and-phototransistor physics also
            sits inside every optoisolator: an LED and a phototransistor in a single epoxy
            package, separated by an air gap good for several thousand volts of galvanic
            isolation — used in every grid-tied inverter and every USB power-delivery
            controller to keep the line-voltage side electrically separate from the
            microcontroller<Cite id="horowitz-hill-2015" in={SOURCES} />.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 14.3"
          title="Vintage 12AX7 vs. JFET guitar preamp"
          summary="A triode vacuum tube and a J-FET solve the same problem — high-impedance, low-noise voltage amplification — with different distortion fingerprints."
          specs={[
            { label: 'Tube', value: <>12AX7 (ECC83) dual triode, µ ≈ 100</> },
            { label: 'FET', value: <>2N5457 JFET, g<sub>m</sub> ≈ 1.5 mS at I<sub>D</sub> = 1 mA</> },
            { label: 'Input impedance', value: <>~1 MΩ (either, set by grid/gate-bias resistor)</> },
            { label: 'Distortion at clip', value: <>tube: rich 2nd-harmonic / FET: rich 2nd-harmonic <Cite id="horowitz-hill-2015" in={SOURCES} /></> },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            A 1960 Fender Bassman and a 2020 boutique pedal are solving the same
            small-signal problem — take a 100 mV pickup signal off a guitar and amplify it
            without loading the pickup — with very different active devices. The Bassman uses
            a 12AX7 dual triode (a glass envelope, a heated cathode boiling off electrons, an
            anode in vacuum, a control grid in between). The pedal uses a 2N5457 JFET. Both
            present roughly 1 MΩ input impedance and both can swing the output rail to rail.
          </p>
          <p className="mb-prose-2 last:mb-0">
            What differs is the soft-clipping behaviour at large signal. Vacuum-tube triodes
            compress asymmetrically — the upper half of a sine wave rounds before the lower
            half — which produces a Fourier spectrum dominated by even-order harmonics
            (especially the 2nd), perceived as warmth. A JFET, biased near pinch-off, produces
            a similarly even-harmonic-rich soft clip; bipolar transistors and most op-amps
            clip hard and symmetrically, producing odd harmonics (especially the 3rd) that
            sound harsh<Cite id="horowitz-hill-2015" in={SOURCES} />. That is why high-end
            solid-state guitar amps still use JFETs (or FET-modeling DSP) in the early stages
            even when the power amp is bipolar. Same physics — a control voltage modulating
            a current — but the device's exact I-V curve, especially as it leaves the linear
            region, is the timbre.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 14.4"
          title="An optoisolator in a USB-PD charger"
          summary="An LED and a phototransistor in one package transfer a control signal across a 2.5 kV galvanic barrier."
          specs={[
            { label: 'LED', value: <>GaAs IR emitter at 940 nm</> },
            { label: 'Phototransistor', value: <>npn Si, β-driven by photogenerated base current</> },
            { label: 'Isolation', value: <>2.5–5 kV RMS, set by package creepage</> },
            { label: 'Bandwidth', value: <>10 kHz–10 MHz, depending on device</> },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            Inside a USB-C wall-wart, the high-voltage primary side runs at rectified mains
            (170 V DC after the input bridge) while the secondary side delivers 5–20 V at
            up to 5 A. The two sides must be galvanically isolated so a fault on the primary
            cannot leak to whatever phone you have plugged in. The transformer handles the
            power transfer; an <em className="italic text-text">optoisolator</em> handles the feedback signal that tells
            the primary-side controller to adjust the duty cycle to maintain the secondary
            voltage<Cite id="horowitz-hill-2015" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            Mechanically it is one infrared LED facing one phototransistor, separated by a
            ~0.5 mm transparent epoxy gap inside a single eight-pin package. Drive ~5 mA into
            the LED on the secondary side; the LED emits ~1 mW of 940 nm light; the
            phototransistor absorbs it, photogenerating a base current that produces a
            collector current of ~5 mA on the primary side. Information has crossed the
            isolation barrier without a single electron — purely as photons in the gap. The
            same trick appears in every grid-tied inverter, every industrial PLC, and every
            high-voltage power-supply control loop: a tiny LED-phototransistor pair carrying
            the feedback, the rest of the system happily floating at whatever potential it
            needs to.
          </p>
        </CaseStudy>
      </CaseStudies>

      <FAQ
        intro="Loose threads — the questions a careful reader tends to ask after a first pass through semiconductors."
      >
        <FAQItem q="Why does silicon dominate over germanium for modern devices?">
          <p>
            Three reasons, layered. (1) Silicon's bandgap (1.12 eV) is wider than germanium's
            (0.67 eV); the intrinsic carrier density is much smaller, so silicon devices have
            much lower reverse leakage and operate to higher temperatures (~175 °C junction
            vs. ~80 °C for Ge). (2) Silicon's native oxide, SiO<sub>2</sub>, is thermally
            stable, electrically insulating, and grows beautifully on a clean Si surface — Ge's
            native oxide (GeO<sub>2</sub>) is water-soluble and useless as a dielectric. The
            MOSFET, the integrated circuit, and the entire planar process depend on having a
            good native oxide<Cite id="streetman-banerjee-2015" in={SOURCES} />. (3) Silicon is
            cheap and abundant. Germanium was the first transistor material (Bardeen-Brattain
            1947) but silicon overtook it by 1960 and never gave the lead back.
          </p>
        </FAQItem>

        <FAQItem q="Why is V_F about 0.7 V for silicon diodes specifically?">
          <p>
            Because of the shape of the Shockley exponential. The reverse-saturation current
            of a silicon p-n junction at room temperature is ~10⁻⁹ A. To get a "normal" forward
            current of a few mA, you need
            <InlineMath tex="\exp(qV/kT) \approx 10^6" /> — i.e. <InlineMath tex="V \approx 6 \cdot V_T \cdot \ln(10) \approx 6 \cdot 0.0259 \cdot 2.30 \approx 0.36\ \text{V}" />;
            doubling the desired current adds only one <InlineMath tex="V_T \cdot \ln(2) \approx 18\ \text{mV}" />. So the practical
            "knee" of a silicon diode lands around 0.6–0.7 V for typical operating currents.
            Schottky diodes have I<sub>s</sub> ~10⁻⁵ A and the same logic gives V<sub>F</sub> ≈ 0.3 V
            <Cite id="sedra-smith-2014" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q={'What does "saturation" mean for a BJT vs. for a MOSFET? They seem opposite.'}>
          <p>
            They are opposite. For a <em className="italic text-text">BJT</em>, "saturation" is the low-V<sub>CE</sub>, fully-on
            regime where both junctions are forward-biased and the device acts almost as a
            closed switch; the active region is above V<sub>CE(sat)</sub>. For a <em className="italic text-text">MOSFET</em>,
            "saturation" is the high-V<sub>DS</sub>, channel-pinched-off regime where I<sub>D</sub>
            is independent of V<sub>DS</sub> — the analogue of the BJT's active region. The
            naming clash is a historical accident: BJT "saturation" came from saturating the
            base (driving I<sub>B</sub> well above I<sub>C</sub>/β), MOSFET "saturation" came from
            saturating the channel current at pinch-off. Both terms predate any attempt at
            cross-device consistency<Cite id="sedra-smith-2014" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q={"What's the difference between a Zener diode and an ordinary diode used in reverse?"}>
          <p>
            Doping. A standard small-signal silicon diode is lightly doped on both sides;
            reverse-biasing it past its peak-inverse-voltage rating drives avalanche breakdown
            in an uncontrolled, destructive way. A Zener diode is heavily doped on both sides;
            the depletion region is so thin that, at a specific reverse voltage V<sub>Z</sub>,
            either band-to-band tunnelling (for V<sub>Z</sub> &lt; ~5 V) or controlled avalanche
            (for V<sub>Z</sub> &gt; ~5 V) sets in and the voltage clamps. The Zener's V<sub>Z</sub>
            is engineered to be sharp, stable, and survivable — usually to several watts of
            reverse-power dissipation. Run an ordinary diode at the same operating point and
            it dies<Cite id="horowitz-hill-2015" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="How does a transistor 'amplify' — where does the extra energy come from?">
          <p>
            From the power supply. A transistor is not an energy source — it is a
            <em className="italic text-text"> controlled valve</em>. A small input signal modulates how much current the
            transistor lets through from the V<sub>CC</sub> rail to ground; the output signal,
            which is much larger, is paid for entirely by the supply. The "gain" is the ratio
            of output power to input power, but the energy bookkeeping ends at the supply,
            not at the transistor. A common-emitter stage with A<sub>v</sub> = −400 and
            V<sub>CC</sub> = 12 V at 1 mA draws 12 mW from the supply continuously, even with no
            signal; that quiescent power is what gets converted into the output signal
            <Cite id="razavi-2021" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why are LEDs so much more efficient than incandescent bulbs?">
          <p>
            An incandescent bulb is a blackbody radiator at ~2700 K; the Planck spectrum at
            that temperature peaks in the near-infrared (Wien's law: λ<sub>max</sub> ≈ 1070 nm),
            so only ~5% of the radiated power falls in the visible band. The other 95% is
            wasted as heat. An LED converts essentially every recombining electron-hole pair
            into a photon whose energy is set by E<sub>g</sub> — for a blue-pumped white LED,
            ~2.7 eV, right in the visible. Modern white LEDs hit wall-plug efficiencies of
            40–50%, with the remaining loss in the phosphor down-conversion and electrical
            ohmic drops. Order-of-magnitude better luminous efficacy than incandescents, and
            running at room temperature instead of 2700 K<Cite id="horowitz-hill-2015" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q={"What's the Early effect / channel-length modulation?"}>
          <p>
            They are the BJT and MOSFET versions of the same nuisance. In a BJT, raising
            V<sub>CE</sub> widens the collector-base depletion region; it eats into the base,
            shortening its effective width and increasing β. The result: I<sub>C</sub> has a
            small positive slope vs. V<sub>CE</sub> in the active region, parameterised by the
            Early voltage V<sub>A</sub>. In a MOSFET in saturation, raising V<sub>DS</sub> moves
            the pinch-off point slightly toward the source, shortening the effective channel
            length and increasing I<sub>D</sub>; parameterised by <InlineMath tex="\lambda \approx 1/V_A" />. Both
            limit the achievable small-signal gain — the output resistance <InlineMath tex="r_o = V_A/I_C" />
            sits in parallel with R<sub>C</sub> and drags the gain down
            <Cite id="sedra-smith-2014" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why do MOSFETs replace BJTs in digital logic?">
          <p>
            Two reasons. First, MOSFETs draw essentially no DC gate current, so a logic gate's
            input does not load the previous gate's output — fan-out is large and free. Second,
            and decisively, CMOS pairs an n-MOSFET and a p-MOSFET so that in any steady state
            exactly one of them is off and the gate draws zero current. A BJT, biased on, draws
            a constant collector current; multiplying that by a billion transistors melts the
            chip. The whole modern processor industry is built around CMOS's near-zero static
            power<Cite id="razavi-2021" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What is subthreshold swing and why does it matter for low-power chips?">
          <p>
            Subthreshold swing S is the gate-source voltage you need to apply to a MOSFET to
            change the drain current by one decade in the subthreshold (V<sub>GS</sub> &lt; V<sub>T</sub>)
            regime. The diffusion-limited theoretical minimum is
            <InlineMath tex="S = (kT/q) \ln(10) \approx 60\ \text{mV/decade}" /> at room temperature. Real MOSFETs achieve
            70–90 mV/decade. That number sets the lowest practical supply voltage of a digital
            chip: you need at least ~6–7 S worth of V<sub>GS</sub> headroom to get the I<sub>on</sub>/I<sub>off</sub>
            ratio that defines a "1" vs. a "0." Below that, leakage swamps signal. The
            inability to push S below 60 mV/decade with conventional MOSFETs is the reason
            CMOS supply voltages plateaued at ~0.7 V around 2010 and have barely moved since
            <Cite id="razavi-2021" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q={"What's the difference between enhancement and depletion MOSFETs?"}>
          <p>
            Whether the channel exists at V<sub>GS</sub> = 0. An <em className="italic text-text">enhancement</em> n-MOSFET
            has V<sub>T</sub> &gt; 0; the channel does not exist at zero gate voltage, and you
            have to "enhance" it by raising V<sub>GS</sub> above V<sub>T</sub>. A <em className="italic text-text">depletion</em>
            n-MOSFET has V<sub>T</sub> &lt; 0; the channel is built in at the factory (by light
            n-doping under the gate), and you have to apply a negative V<sub>GS</sub> to
            "deplete" it and turn the device off. Enhancement is the dominant flavour because
            it gives a clean off-state at V<sub>GS</sub> = 0 — necessary for CMOS — but
            depletion MOSFETs appear as current sources in some analog designs and as
            self-starting elements in low-voltage regulators<Cite id="sedra-smith-2014" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q={"Why aren't tube amps obsolete?"}>
          <p>
            On any rational figure of merit they are: a 12AX7 dissipates 1.5 W of heater power
            per channel, has microphonic glass, and ages out in a few thousand hours; a $0.30
            op-amp matches its small-signal performance and runs for fifty years. But tubes
            clip differently: a triode rounds the top of a sine wave gracefully and adds
            even-order harmonics that the ear perceives as "warm." Solid-state amps can
            replicate that with careful soft-clipping design (or DSP modelling), but a
            non-trivial fraction of guitarists prefer the original device, and the market for
            new-old-stock tubes and current-production reissues (Tung-Sol, JJ, Mullard) keeps
            the technology alive in a niche that is not going away. Everywhere else — radio,
            hi-fi, instrumentation, audio recording — the transistor won decisively by 1970
            <Cite id="horowitz-hill-2015" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q={"What's a FinFET / GAAFET and how does it differ from a planar MOSFET?"}>
          <p>
            A planar MOSFET has the gate sitting flat on top of the channel. As the gate length
            shrinks below ~30 nm, the source and drain depletion regions reach into the channel
            from the sides and the gate loses control — the device leaks. A <em className="italic text-text">FinFET</em>
            (Intel, 22 nm node, 2011) raises the channel into a thin vertical fin and wraps the
            gate around three sides, restoring electrostatic control. At ~3 nm we go further:
            the <em className="italic text-text">gate-all-around</em> FET (GAAFET, also called nanosheet FET, Samsung and
            TSMC 2022+) replaces the fin with stacked horizontal sheets of channel, with the
            gate completely surrounding each sheet. Same MOSFET physics — gate field modulates
            channel conductance — wrapped around the channel in three or four dimensions
            instead of one<Cite id="razavi-2021" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why does an LED need a current-limiting resistor?">
          <p>
            Because the diode's I-V curve is exponential: a tiny change in voltage produces an
            enormous change in current. Drive an LED from a fixed voltage and any
            manufacturing variation or temperature shift in V<sub>F</sub> sends the current
            either to near-zero (dim) or to several amps (dead). A series resistor converts
            "fixed voltage" into "fixed current": <InlineMath tex="R = (V_{\text{supply}} - V_F)/I_{\text{target}}" />.
            For a 5 V supply, a red LED at V<sub>F</sub> ≈ 2 V, and a 20 mA target,
            R = 150 Ω. The resistor dissipates <InlineMath tex="I^2 R = 60\ \text{mW}" /> — small compared to the
            LED's ~40 mW of light — but it stabilises the operating point. Higher-end LED
            drivers use a switching regulator with a current sense to do the same job
            efficiently<Cite id="horowitz-hill-2015" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What's a 'transistor amplifier's input impedance' and why does it matter?">
          <p>
            It is the impedance the previous stage sees when looking into the amplifier's
            input. For a common-emitter BJT, <InlineMath tex="r_\pi = \beta/g_m" />; for I<sub>C</sub> = 1 mA
            and β = 100, <InlineMath tex="r_\pi = 100 / 38.7\ \text{mS} \approx 2.6\ \text{k}\Omega" /> — modest. For a MOSFET
            common-source stage, the gate input impedance is essentially infinite at DC and
            megohms at audio. It matters because a low input impedance loads the source: a
            high-impedance signal source (a guitar pickup at ~250 kΩ, a piezo at ~10 MΩ) feeding
            a low-impedance amplifier suffers a huge voltage divider and most of the signal
            disappears. That's why FET-input op-amps and JFET preamps dominate
            high-impedance sensor electronics<Cite id="razavi-2021" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Can a single transistor act as a switch as well as an amplifier?">
          <p>
            Yes — they are the same operation in different regions of the I-V plane. As an
            amplifier the device is biased into its active region and small perturbations
            produce proportional (but larger) output swings. As a switch the device sits either
            in cut-off (input below threshold; output at V<sub>CC</sub>) or in saturation (input
            well above threshold; output near 0 V). A digital logic gate is just a transistor
            in switch mode; an analog amplifier is the same transistor in linear mode. The
            device does not know which mode it is in; the surrounding circuit (and the input
            signal levels) decides<Cite id="sedra-smith-2014" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="How is silicon refined to the purity transistors need?">
          <p>
            Two stages. (1) Metallurgical-grade silicon (~98% pure, reduced from sand in an arc
            furnace) is reacted with HCl to form trichlorosilane, distilled to ultra-purity, and
            decomposed back into electronic-grade polysilicon (less than one part per billion
            of unwanted impurities). (2) The polysilicon is melted and a single seed crystal is
            slowly pulled out, growing the giant single-crystal "boule" by the Czochralski
            process. The boule — 200 to 300 mm in diameter — is sliced into the wafers on
            which every transistor in the world starts its life. The doping step that turns the
            wafer into useful semiconductor happens later, by ion implantation or thermal
            diffusion at concentrations of parts per million — so the wafer must start cleaner
            than the dopants you intend to add<Cite id="streetman-banerjee-2015" in={SOURCES} />.
          </p>
        </FAQItem>
      </FAQ>
    </ChapterShell>
  );
}
