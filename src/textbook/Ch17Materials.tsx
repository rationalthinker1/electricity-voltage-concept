/**
 * Chapter 11 — Materials
 *
 * What ε_r and μ_r actually mean. The slider you've been twisting since
 * Chapter 1, opened up. Polarization, bound charge, diamagnetism vs
 * paramagnetism vs ferromagnetism, domains, hysteresis, and the susceptibility
 * numbers that compress all of it into one constant per material per response.
 *
 * Embedded demos:
 *   11.1 DipoleInField        — torque + alignment, ⟨cos θ⟩
 *   11.2 DielectricBetweenPlates — bound surface charge, C → ε_r·C
 *   11.6 WhyWaterPolarizes    — single H₂O dipole, Langevin/Debye intuition
 *   11.3 ParamagnetVsDiamagnet— ±M response, side by side
 *   11.4 Ferromagnet          — domains and the hysteresis loop
 *   11.5 Susceptibility       — χ_e and χ_m bar chart
 */
import { CaseStudies, CaseStudy } from '@/components/CaseStudy';
import { ChapterShell } from '@/components/ChapterShell';
import { FAQ, FAQItem } from '@/components/FAQ';
import { Formula, InlineMath } from '@/components/Formula';
import { Cite } from '@/components/SourcesList';
import { Term } from '@/components/Term';
import { TryIt } from '@/components/TryIt';
import { getChapter } from './data/chapters';
import { DielectricBetweenPlatesDemo } from './demos/DielectricBetweenPlates';
import { DipoleAlignment3DDemo } from './demos/DipoleAlignment3D';
import { DipoleInFieldDemo } from './demos/DipoleInField';
import { FerromagnetDemo } from './demos/Ferromagnet';
import { ImageChargeField3DDemo } from './demos/ImageChargeField3D';
import { ParamagnetVsDiamagnetDemo } from './demos/ParamagnetVsDiamagnet';
import { SusceptibilityDemo } from './demos/Susceptibility';
import { WhyWaterPolarizesDemo } from './demos/WhyWaterPolarizes';

export default function Ch13Materials() {
  const chapter = getChapter('materials')!;
  const SOURCES = chapter.sources;

  return (
    <ChapterShell chapter={chapter}>
      <p className="chapter-intro">
        Every demo in this textbook has had a quiet little slider labeled <strong className="text-text font-medium">ε<sub>r</sub></strong> or
        <strong className="text-text font-medium"> μ<sub>r</sub></strong>. Drag one and the field inside the dielectric drops; drag the other and
        the inductance of a coil skyrockets. We have been borrowing those numbers for ten chapters without
        ever saying where they come from. This chapter opens the box.
      </p>
      <p className="mb-prose-3">
        The story is microscopic. A material is not a homogeneous slab of stuff — it's a dense lattice of
        atoms and molecules, each with its own electrons in orbit, its own little magnetic moment, its own
        capacity to be twisted around by an applied field. The "constants" ε<sub>r</sub> and μ<sub>r</sub>
        are macroscopic averages over those microscopic responses. By the end of the chapter you'll be able
        to look at a number like ε<sub>r</sub>(water) ≈ 80 and tell, by eye, that water must have a permanent
        molecular dipole — there's no other way to get a number that big.
      </p>

      <h2 className="chapter-h2">A <em>slider</em> you've been using all along</h2>

      <p className="mb-prose-3">
        In vacuum, Maxwell's equations are written in terms of two universal constants:
        <strong className="text-text font-medium"> ε₀</strong> (the{' '}
        <Term def={<><strong className="text-text font-medium">permittivity</strong> — the proportionality between electric displacement and field, <em className="italic text-text">D = εE</em>. Vacuum value <em className="italic text-text">ε₀</em> ≈ 8.854×10⁻¹² F/m; absolute permittivity <em className="italic text-text">ε = ε₀ε<sub>r</sub></em>, with <em className="italic text-text">ε<sub>r</sub></em> the dimensionless relative permittivity (dielectric constant).</>}>permittivity</Term>
        {' '}of free space) and <strong className="text-text font-medium">μ₀</strong> (the{' '}
        <Term def={<><strong className="text-text font-medium">permeability</strong> — the proportionality between magnetic field and auxiliary field, <em className="italic text-text">B = μH</em>. Vacuum value <em className="italic text-text">μ₀ = 4π×10⁻⁷ H/m</em> (CODATA, post-2019 redefinition); absolute permeability <em className="italic text-text">μ = μ₀μ<sub>r</sub></em>, with <em className="italic text-text">μ<sub>r</sub></em> the dimensionless relative permeability.</>}>permeability</Term>).
        Together they fix the speed of light: <InlineMath>c = 1/√(ε₀ μ₀)</InlineMath>
        <Cite id="codata-2018" in={SOURCES} />. Once you put matter into the picture, every formula that
        contained ε₀ keeps working if you just replace ε₀ with <strong className="text-text font-medium">ε = ε₀ ε<sub>r</sub></strong>, and
        every formula that contained μ₀ keeps working if you replace μ₀ with <strong className="text-text font-medium">μ = μ₀ μ<sub>r</sub></strong>.
      </p>
      <p className="mb-prose-3">
        That sounds suspiciously convenient. Why does the same shape of equation describe a capacitor in
        vacuum and a capacitor full of glass, with only a numerical rescaling between them? The answer is
        that ε<sub>r</sub> and μ<sub>r</sub> are doing an enormous amount of bookkeeping behind your back —
        every bound charge, every aligned dipole, every induced orbital current. Bundle all that
        microscopic response into one number, and Maxwell's equations stay the same shape
        <Cite id="griffiths-2017" in={SOURCES} /><Cite id="jackson-1999" in={SOURCES} />. That's the deal.
      </p>

      <h2 className="chapter-h2">Polarization: how a material <em>lowers the field</em></h2>

      <p className="mb-prose-3">
        Take an insulator — glass, plastic, dry wood — and apply an electric field. The free electrons are
        locked in their bonds; they can't drift. But each atom or molecule is not a rigid point. Inside it,
        the electron cloud and the nucleus respond to the applied field by shifting in opposite directions,
        by an angstrom or so. The atom develops a tiny induced dipole moment — and if the molecule had a
        permanent dipole moment already (like water), it rotates toward alignment with the field.
      </p>

      <DipoleInFieldDemo />

      <p className="mb-prose-3">
        That field of tilted dipoles is the material's <strong className="text-text font-medium">
          <Term def={<><strong className="text-text font-medium">polarization (P)</strong> — the volume density of electric dipole moment in a dielectric. SI unit: C/m². Linked to bound charge by <em className="italic text-text">ρ<sub>b</sub> = −∇·P</em>, and to the applied field by <em className="italic text-text">P = ε₀ χ<sub>e</sub> E</em> for linear dielectrics.</>}>polarization</Term>
        </strong>, written
        <strong className="text-text font-medium"> P</strong>. Per unit volume, it's the number density of dipoles times the average dipole
        moment per molecule. Inside the body of the material, neighboring dipoles cancel each other's bound
        charges — each "+" end of one molecule sits next to the "−" end of the next. What survives is a thin
        layer of <strong className="text-text font-medium">bound surface charge</strong> at the boundaries
        <Cite id="griffiths-2017" in={SOURCES} />.
      </p>

      <p className="mb-prose-3">
        Those bound surface charges are negative on the side facing the applied <strong className="text-text font-medium">E</strong> and
        positive on the far side — precisely the orientation needed to set up an internal field that
        <em className="italic text-text"> opposes</em> the applied one. The net field inside the material is the applied field minus the
        polarization's contribution:
      </p>
      <Formula>E<sub>inside</sub> = E<sub>applied</sub> − P/ε₀ = E<sub>applied</sub> / ε<sub>r</sub></Formula>
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">E<sub>inside</sub></strong> is the macroscopic electric field within the dielectric
        (in V/m), <strong className="text-text font-medium">E<sub>applied</sub></strong> is the external field that would be present
        without the material (in V/m), <strong className="text-text font-medium">P</strong> is the polarization — the volume density of
        dipole moment (in C/m²), <strong className="text-text font-medium">ε₀ ≈ 8.854×10⁻¹² F/m</strong> is the permittivity of free
        space, and <strong className="text-text font-medium">ε<sub>r</sub></strong> is the dimensionless relative permittivity of the
        material.
      </p>
      <p className="mb-prose-3">
        with <strong className="text-text font-medium">ε<sub>r</sub> = 1 + χ<sub>e</sub></strong>, where <strong className="text-text font-medium">χ<sub>e</sub></strong>{' '}
        is the dimensionless electric susceptibility (linking <em className="italic text-text">P = ε₀ χ<sub>e</sub> E</em>). The electric{' '}
        <Term def={<><strong className="text-text font-medium">susceptibility (χ<sub>e</sub>, χ<sub>m</sub>)</strong> — the dimensionless ratio relating a material's response to an applied field. Electric: <em className="italic text-text">P = ε₀ χ<sub>e</sub> E</em>, so <em className="italic text-text">ε<sub>r</sub> = 1 + χ<sub>e</sub></em>. Magnetic: <em className="italic text-text">M = χ<sub>m</sub> H</em>, so <em className="italic text-text">μ<sub>r</sub> = 1 + χ<sub>m</sub></em>.</>}>susceptibility</Term>
        {' '}χ<sub>e</sub> tells you how vigorously a material polarizes per unit applied field. For air it's
        about 5×10⁻⁴; for glass, a handful; for water, ∼79 <Cite id="griffiths-2017" in={SOURCES} />. The
        Clausius–Mossotti relation links χ<sub>e</sub> to the molecular polarizability α and the number
        density N — derived independently by Mossotti in 1846 and Clausius in 1850
        <Cite id="clausius-1850" in={SOURCES} />.
      </p>

      <DipoleAlignment3DDemo />

      <p className="mb-prose-3">
        Drag the block to rotate it. At <strong className="text-text font-medium">E<sub>ext</sub> = 0</strong> the dipoles tumble
        isotropically — the mean of <em className="italic text-text">cos θ</em> over the population is zero, and so is the bulk{' '}
        <strong className="text-text font-medium">P</strong>. Crank up the field and the deterministic torque begins to outrun the thermal
        kick; the equilibrium alignment is the Langevin function <em className="italic text-text">L(pE/kT) = coth(pE/kT) − kT/pE</em>,
        linear at small drive and saturating to 1 at large drive
        <Cite id="langevin-1905" in={SOURCES} /><Cite id="griffiths-2017" in={SOURCES} />. Raise the
        temperature and the same field buys you less alignment — the steady-state ⟨cos θ⟩ scales as
        1/T at small fields, which is Curie's law for dielectrics<Cite id="debye-1929" in={SOURCES} />.
        The dipole tails pile up on the left face and the heads on the right: those are the bound
        surface charges, and their net field <em className="italic text-text">opposes</em> the applied one. That cancellation is
        where ε<sub>r</sub> comes from — read it directly off the readout as the alignment grows.
      </p>

      <h2 className="chapter-h2">Bound charge, free charge, and the dielectric in a capacitor</h2>

      <p className="mb-prose-3">
        Here is the cleanest demonstration: put a slab of insulator between the plates of a charged
        capacitor and watch what changes.
      </p>

      <DielectricBetweenPlatesDemo />

      <p className="mb-prose-3">
        Two things happen at once. The bound charge that appears on the dielectric's faces partially
        cancels the free charge on the plates — so the field inside the gap drops by exactly ε<sub>r</sub>.
        And because the voltage across the capacitor is the integral of <strong className="text-text font-medium">E</strong> across the gap,
        the voltage drops too — meaning the same plate charge now corresponds to a <em className="italic text-text">lower</em> voltage.
        Same definition <strong className="text-text font-medium">C = Q/V</strong>, smaller V, so C goes up by the factor ε<sub>r</sub>:
      </p>
      <Formula>C = ε<sub>r</sub> · C<sub>vacuum</sub></Formula>
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">C</strong> is the capacitance with the dielectric in place (in farads),
        <strong className="text-text font-medium"> C<sub>vacuum</sub></strong> is the capacitance of the same geometry with a vacuum
        gap (in farads), and <strong className="text-text font-medium">ε<sub>r</sub></strong> is the dimensionless relative
        permittivity of the dielectric filling the gap.
      </p>

      <p className="pullout">
        ε<sub>r</sub> is the price of admission for a field into a material — the bigger the number, the
        more of the field gets bought off by bound charge before it reaches the other side.
      </p>

      <TryIt
        tag="Try 13.1"
        question={
          <>
            A parallel-plate capacitor has capacitance <strong className="text-text font-medium">C₀ = 100 pF</strong> with a vacuum gap.
            Fill the gap with mica (<em className="italic text-text">ε<sub>r</sub></em> ≈ 6.7), same geometry. What is the new capacitance?
          </>
        }
        hint={<>C = ε<sub>r</sub> · C<sub>vacuum</sub>.</>}
        answer={
          <>
            <Formula>C = ε<sub>r</sub> · C<sub>0</sub> = 6.7 · 100 pF = 670 pF</Formula>
            <p className="mb-prose-1 last:mb-0">
              Capacitance rises by a factor of <strong className="text-text font-medium">6.7 → 670 pF</strong>. Mica's <em className="italic text-text">ε<sub>r</sub></em>{' '}
              ≈ 6.7 plus its high breakdown field is why early radio circuits used mica capacitors for
              tuned stages<Cite id="griffiths-2017" in={SOURCES} />.
            </p>
          </>
        }
      />

      <TryIt
        tag="Try 13.2"
        question={
          <>
            For two identical capacitors charged to the same voltage <em className="italic text-text">V</em>, one with a vacuum gap and one
            with a water dielectric (<em className="italic text-text">ε<sub>r</sub></em> ≈ 80), compare the stored energies.
          </>
        }
        hint={<>U = ½CV²; C scales with ε<sub>r</sub> when V is held fixed.</>}
        answer={
          <>
            <Formula>
              U<sub>water</sub> / U<sub>vacuum</sub> = C<sub>water</sub> / C<sub>vacuum</sub> = ε<sub>r</sub> = 80
            </Formula>
            <p className="mb-prose-1 last:mb-0">
              The water-filled cap stores <strong className="text-text font-medium">80×</strong> the energy for the same V — at the cost of
              water's high conductivity and dielectric loss above kHz, which is why nobody actually builds
              capacitors with liquid-water dielectrics in practice<Cite id="griffiths-2017" in={SOURCES} /><Cite id="debye-1929" in={SOURCES} />.
            </p>
          </>
        }
      />

      <p className="mb-prose-3">
        Why is ε<sub>r</sub>(water) ≈ 80 — twenty times bigger than glass and a hundred and fifty thousand
        times bigger than air? Because water has a permanent dipole moment, built into its asymmetric
        molecular geometry. Apply a field and you don't have to stretch the electron cloud at all — the
        molecule just rotates.
      </p>

      <WhyWaterPolarizesDemo />

      <p className="mb-prose-3">
        Debye worked out the full theory in 1929 <Cite id="debye-1929" in={SOURCES} />. At zero field the
        molecules tumble randomly and the bulk polarization is zero. Apply a field and the equilibrium
        distribution shifts: the Boltzmann factor <InlineMath>exp(p·E / kT)</InlineMath> favors orientations
        with <strong className="text-text font-medium">p</strong> along <strong className="text-text font-medium">E</strong>. Integrate over the angular distribution and you
        recover the <em className="italic text-text">{' '}
          <Term def={<><strong className="text-text font-medium">Langevin function</strong> — the function <em className="italic text-text">L(x) = coth(x) − 1/x</em>, which gives the mean alignment <em className="italic text-text">⟨cos θ⟩</em> of independent classical dipoles in a field at thermal equilibrium with <em className="italic text-text">x = pE/kT</em> (or <em className="italic text-text">μB/kT</em>). Linear in <em className="italic text-text">x</em> at low field, saturating to 1 at high field.</>}>Langevin function</Term>
        </em>, which at small fields gives a polarization linear in E with
        a 1/T temperature dependence (Curie's law for dielectrics). Heat water up and ε<sub>r</sub>
        drops; cool it down and it rises. Same molecule; different thermal scramble.
      </p>

      <h2 className="chapter-h2">The conductor as the <em>limiting case</em>: image charges</h2>

      <p className="mb-prose-3">
        Push ε<sub>r</sub> to infinity and the dielectric becomes a conductor. The bound charges that
        used to merely tilt now slide freely, and they slide exactly far enough to cancel the field
        inside the material to zero. What was a thin layer of bound surface charge on a dielectric
        becomes a layer of free surface charge on a conductor — and at the conductor's surface, the
        electric field must be perpendicular, because any tangential component would push the still-free
        electrons until it wasn't.
      </p>
      <p className="mb-prose-3">
        That boundary condition has a beautiful consequence for the field of a point charge sitting
        above a grounded metal plane. The induced surface charge on the plane redistributes itself in
        exactly the pattern that, above the plane, the total field looks identical to two point charges
        in vacuum: the real <strong className="text-text font-medium">+q</strong> at height <em className="italic text-text">d</em>, plus a fictitious mirror{' '}
        <strong className="text-text font-medium">−q</strong> at depth <em className="italic text-text">d</em> below the plane. The mirror is not a real charge — it
        is a mathematical stand-in for the induced surface charge — but the field it produces above the
        plane is the right one, because both configurations satisfy the same boundary condition
        (potential = 0 on the plane) and the same source equation (∇·E = ρ/ε₀ from the real charge alone
        above the plane)<Cite id="griffiths-2017" in={SOURCES} /><Cite id="jackson-1999" in={SOURCES} />.
      </p>

      <ImageChargeField3DDemo />

      <p className="mb-prose-3">
        Drag the scene to orbit. Every field line leaving <strong className="text-text font-medium">+q</strong> terminates somewhere on
        the plane, hitting it perpendicularly — and the induced surface-charge density σ peaks directly
        beneath the charge and falls off as <InlineMath>σ(r) = −qd/(2π(r²+d²)^(3/2))</InlineMath>.
        Integrate σ over the whole plane and you recover exactly −q: every field line that started on
        the real charge ends on a piece of induced surface charge, and the total adds up to a perfect
        mirror's worth<Cite id="griffiths-2017" in={SOURCES} />.
      </p>

      <h2 className="chapter-h2">Three kinds of <em>magnetic response</em></h2>

      <p className="mb-prose-3">
        Magnetism in matter is messier than electric polarization, because there are three different
        microscopic mechanisms and they live in completely different regimes of strength.
      </p>

      <p className="mb-prose-3">
        <strong className="text-text font-medium">
          <Term def={<><strong className="text-text font-medium">diamagnetism</strong> — the universal, feeble negative magnetic response of any material due to Lenz's-law currents induced in atomic electron orbits when <em className="italic text-text">B</em> is applied. <em className="italic text-text">χ<sub>m</sub></em> on the order of <em className="italic text-text">−10⁻⁵</em>; present in every substance but masked by stronger para- or ferromagnetism if those exist.</>}>Diamagnetism</Term>.
        </strong> Apply <strong className="text-text font-medium">B</strong> to any material — water, glass, copper, your
        own body. The change in flux through every electron orbit induces a tiny circulating current, and
        by Lenz's law that current opposes the applied <strong className="text-text font-medium">B</strong>. The result is a feeble negative
        magnetization. Every material has this; it's a property of the electrons' orbital response, not of
        any permanent moment <Cite id="griffiths-2017" in={SOURCES} />. χ<sub>m</sub> is on the order of
        −10⁻⁵ — small enough that you only notice it in clean laboratory measurements.
      </p>

      <p className="mb-prose-3">
        <strong className="text-text font-medium">
          <Term def={<><strong className="text-text font-medium">paramagnetism</strong> — weak positive magnetic response from independent permanent atomic moments aligning with an applied <em className="italic text-text">B</em> against thermal noise. <em className="italic text-text">χ<sub>m</sub></em> typically <em className="italic text-text">+10⁻⁵</em> to <em className="italic text-text">+10⁻³</em>; follows Curie's law <em className="italic text-text">χ ∝ 1/T</em> at room temperature.</>}>Paramagnetism</Term>.
        </strong> Atoms or molecules with an unpaired electron carry a permanent
        magnetic moment. In zero field they tumble randomly; in an applied field they weakly align with
        <strong className="text-text font-medium"> B</strong>, fighting thermal noise. Langevin worked out the equilibrium theory in 1905 —
        the magnetization follows the same Langevin function as for electric dipoles
        <Cite id="langevin-1905" in={SOURCES} />, and in the weak-field, room-temperature limit it gives
        Curie's law: χ<sub>m</sub> ∝ 1/T. Aluminum, oxygen, and most transition-metal salts are
        paramagnetic, with χ<sub>m</sub> of order +10⁻⁵ to +10⁻³.
      </p>

      <p className="mb-prose-3">
        <strong className="text-text font-medium">
          <Term def={<><strong className="text-text font-medium">ferromagnetism</strong> — the strong cooperative ordering of atomic spins below a Curie temperature <em className="italic text-text">T<sub>C</sub></em>, driven by quantum-mechanical exchange coupling. Spontaneous magnetization, domain structure, and <em className="italic text-text">χ<sub>m</sub></em> up to <em className="italic text-text">10⁶</em>. Iron, cobalt, nickel, gadolinium and their alloys.</>}>Ferromagnetism</Term>.
        </strong> In iron, cobalt, nickel, and a handful of their alloys and oxides,
        a quantum-mechanical exchange interaction between neighboring spins is so strong it overwhelms
        thermal noise — entire macroscopic regions ("domains") align spontaneously, even with no applied
        field <Cite id="weiss-1907" in={SOURCES} /><Cite id="kittel-2005" in={SOURCES} />. Apply a weak
        external <strong className="text-text font-medium">B</strong> and the favorably-aligned domains grow at the expense of others.
        χ<sub>m</sub> can reach 5000 in soft iron and 10⁶ in mu-metal. This is the regime where you can
        feel the force with your fingers.
      </p>

      <ParamagnetVsDiamagnetDemo />

      <TryIt
        tag="Try 13.3"
        question={
          <>
            A paramagnetic sample has <em className="italic text-text">χ<sub>m</sub></em> = 1×10⁻⁴ and sits in a 1 T external field.
            Estimate its magnetization <strong className="text-text font-medium">M</strong>.
          </>
        }
        hint={<>For small χ<sub>m</sub>: H ≈ B/μ₀, so M = χ<sub>m</sub> H ≈ χ<sub>m</sub> B/μ₀.</>}
        answer={
          <>
            <Formula>
              M = χ<sub>m</sub> B / μ<sub>0</sub> = (1×10⁻⁴ · 1) / (4π×10⁻⁷) ≈ 79.6 A/m
            </Formula>
            <p className="mb-prose-1 last:mb-0">
              <strong className="text-text font-medium">M ≈ 80 A/m</strong> — five orders of magnitude below iron's saturation
              <em className="italic text-text"> M<sub>s</sub></em> ≈ 1.7×10⁶ A/m. That gap is why paramagnetic levitation in a 1 T
              lab magnet barely lifts an O₂ droplet, while a kitchen magnet sticks to a fridge
              door<Cite id="kittel-2005" in={SOURCES} /><Cite id="codata-2018" in={SOURCES} />.
            </p>
          </>
        }
      />

      <p className="mb-prose-3">
        The two boxes look superficially similar — both are bags of magnetic moments responding to the
        same external field. But the paramagnet's arrows weakly tilt with <strong className="text-text font-medium">B</strong> (and the
        thermal noise scrambles them right back), while the diamagnet's induced arrows point
        <em className="italic text-text"> against</em> <strong className="text-text font-medium">B</strong>. One has permanent moments; the other has only the orbital
        response. In numbers, the difference comes out to maybe an order of magnitude or two — both are
        still tiny compared to ferromagnets.
      </p>

      <h2 className="chapter-h2">Ferromagnets and the <em>hysteresis loop</em></h2>

      <p className="mb-prose-3">
        Pierre Weiss in 1907 proposed that ferromagnets aren't uniformly magnetized at all — they break up
        into microscopic <strong className="text-text font-medium">
          <Term def={<><strong className="text-text font-medium">magnetic domain</strong> — a region of a ferromagnet inside which the spontaneous magnetization is uniform and aligned along one easy axis. Domains are separated by thin walls (Bloch or Néel walls) across which the moment rotates; their pattern minimises the total magnetostatic energy.</>}>domains</Term>
        </strong>, regions of uniform magnetization separated by thin walls
        across which the magnetization rotates from one direction to another
        <Cite id="weiss-1907" in={SOURCES} />. In an unmagnetized lump of iron the domains point every which
        way, cancelling on average. The lump as a whole has zero <strong className="text-text font-medium">M</strong>.
      </p>
      <p className="mb-prose-3">
        Apply a field and the domains aligned with <strong className="text-text font-medium">B</strong> grow at the expense of the others —
        the walls move. Crank <strong className="text-text font-medium">B</strong> hard enough and every domain is aligned; the iron is
        <em className="italic text-text"> saturated</em>, with magnetization M<sub>s</sub>. Now ramp <strong className="text-text font-medium">B</strong> back to zero.
        The walls don't unwind cleanly. They get pinned on lattice imperfections, on grain boundaries, on
        crystal defects. Some of the alignment survives <strong className="text-text font-medium">B = 0</strong> — that's the
        <em className="italic text-text"> remanence</em>, the magnetization a permanent magnet has when nothing is pushing on it
        <Cite id="kittel-2005" in={SOURCES} /><Cite id="jackson-1999" in={SOURCES} />.
      </p>

      <FerromagnetDemo />

      <p className="mb-prose-3">
        Trace one full B sweep and the M-vs-B curve closes a loop — the <strong className="text-text font-medium">
          <Term def={<><strong className="text-text font-medium">hysteresis loop</strong> — the closed <em className="italic text-text">M</em>–<em className="italic text-text">H</em> (or <em className="italic text-text">M</em>–<em className="italic text-text">B</em>) curve traced by a ferromagnet as the applied field is cycled. The enclosed area equals the energy dissipated per cycle per unit volume; remanence is the <em className="italic text-text">M</em>-intercept and coercivity the <em className="italic text-text">H</em>-intercept.</>}>hysteresis loop</Term>
        </strong>.
        The area enclosed is the energy dissipated per cycle (per unit volume) as domain walls click past
        their pinning sites. For a transformer iron core you want this area as small as possible; for a
        permanent magnet you want it as large as possible. Two ends of the same physics, two completely
        different alloy recipes.
      </p>
      <p className="mb-prose-3">
        Heat a ferromagnet past its <strong className="text-text font-medium">
          <Term def={<><strong className="text-text font-medium">Curie temperature (T<sub>C</sub>)</strong> — the temperature above which thermal energy overwhelms the exchange coupling that orders neighbouring spins. Below <em className="italic text-text">T<sub>C</sub></em> a ferromagnet has spontaneous magnetization; above it, the material is paramagnetic with <em className="italic text-text">χ<sub>m</sub> ∝ 1/(T − T<sub>C</sub>)</em> (Curie–Weiss law).</>}>Curie temperature</Term>
        </strong> (770 °C for iron, 1115 °C for
        cobalt) and the exchange coupling loses to thermal noise — the domains evaporate and the material
        becomes an ordinary paramagnet. This is why dropping a magnet in a campfire wipes it.
      </p>

      <TryIt
        tag="Try 13.4"
        question={
          <>
            A 1000-turn air-core solenoid has inductance <strong className="text-text font-medium">L₀ = 2 mH</strong>. Insert a soft-iron core
            with <em className="italic text-text">μ<sub>r</sub></em> ≈ 5000, same geometry. What is the new inductance?
          </>
        }
        hint={<>L = μ<sub>r</sub> · L<sub>air</sub> for a tightly-coupled solenoid.</>}
        answer={
          <>
            <Formula>L = μ<sub>r</sub> · L<sub>0</sub> = 5000 · 2 mH = 10 H</Formula>
            <p className="mb-prose-1 last:mb-0">
              The iron core jumps the inductance by a factor of <strong className="text-text font-medium">5000 → 10 H</strong>. That is
              the whole reason every audio transformer, mains transformer, and switched-mode-supply
              transformer is wound on iron (or, at higher frequencies, on a ferrite) rather than on
              air<Cite id="kittel-2005" in={SOURCES} /><Cite id="griffiths-2017" in={SOURCES} />.
            </p>
          </>
        }
      />

      <TryIt
        tag="Try 13.5"
        question={
          <>
            Iron's Curie temperature is <em className="italic text-text">T<sub>C</sub></em> ≈ 1043 K. Using the rough power-law{' '}
            <em className="italic text-text">M(T) ≈ M₀ (1 − T/T<sub>C</sub>)<sup>β</sup></em> with critical exponent <em className="italic text-text">β</em> ≈ 0.37,
            estimate the fraction of saturation magnetization remaining 100 K below the Curie point.
          </>
        }
        hint={<>Set T = T<sub>C</sub> − 100 K, so 1 − T/T<sub>C</sub> = 100/1043.</>}
        answer={
          <>
            <Formula>1 − T/T<sub>C</sub> = 100 / 1043 ≈ 0.0959</Formula>
            <Formula>M/M<sub>0</sub> ≈ (0.0959)<sup>0.37</sup> ≈ 0.42</Formula>
            <p className="mb-prose-1 last:mb-0">
              At 100 K below the transition, only <strong className="text-text font-medium">~42 %</strong> of saturation magnetization
              survives. Within 10 K of <em className="italic text-text">T<sub>C</sub></em>, M drops below 20 %. That steep decline is
              why permanent-magnet datasheets quote a maximum operating temperature well below the
              Curie point — and why magnetocaloric refrigeration with gadolinium (<em className="italic text-text">T<sub>C</sub></em>{' '}
              ≈ 292 K) lands in the right temperature window for kitchen-scale
              cooling<Cite id="kittel-2005" in={SOURCES} /><Cite id="weiss-1907" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2 className="chapter-h2">The <em>big picture</em>: one number per material per response</h2>

      <p className="mb-prose-3">
        Every microscopic mechanism we've talked about — induced electronic polarization, permanent dipole
        alignment, orbital diamagnetism, paramagnetic Curie response, ferromagnetic domain alignment —
        ends up bundled into just two scalar numbers per material:
      </p>
      <Formula>ε<sub>r</sub> = 1 + χ<sub>e</sub>,    μ<sub>r</sub> = 1 + χ<sub>m</sub></Formula>
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">ε<sub>r</sub></strong> is the dimensionless relative permittivity (electric
        response), <strong className="text-text font-medium">μ<sub>r</sub></strong> is the dimensionless relative permeability
        (magnetic response), <strong className="text-text font-medium">χ<sub>e</sub></strong> is the dimensionless electric
        susceptibility (<em className="italic text-text">P = ε₀ χ<sub>e</sub> E</em>), and <strong className="text-text font-medium">χ<sub>m</sub></strong> is the
        dimensionless magnetic susceptibility (<em className="italic text-text">M = χ<sub>m</sub> H</em>). All four numbers are
        unitless ratios of the material's response to the applied field.
      </p>

      <SusceptibilityDemo />

      <p className="mb-prose-3">
        Three or four orders of magnitude separate "air, basically vacuum" from "water, surprisingly
        responsive" from "ferroelectric, almost a different state of matter." On the magnetic side, copper
        and aluminum sit within parts-per-million of vacuum — that's why we draw a copper coil as if μ
        inside is just μ₀. Iron, by contrast, makes the coil's inductance jump by thousands. A real-world
        inductor without an iron core is a different category of device than one with an iron core; that's
        the entire physics of why you wind transformers on iron laminations.
      </p>

      <p className="mb-prose-3">
        With ε<sub>r</sub> and μ<sub>r</sub> in hand, every equation in this book still applies inside
        matter — just rescale ε₀ → ε₀ ε<sub>r</sub> and μ₀ → μ₀ μ<sub>r</sub>. The wave equation now gives
      </p>
      <Formula>v = 1 / √(ε ε<sub>r</sub> μ μ<sub>r</sub>) · √(ε₀ μ₀)... actually,  v = c / √(ε<sub>r</sub> μ<sub>r</sub>) = c/n</Formula>
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">v</strong> is the phase speed of the EM wave inside the material (in m/s),
        <strong className="text-text font-medium"> c ≈ 2.998×10⁸ m/s</strong> is the speed of light in vacuum, <strong className="text-text font-medium">ε<sub>r</sub></strong>{' '}
        and <strong className="text-text font-medium">μ<sub>r</sub></strong> are the dimensionless relative permittivity and
        permeability of the material, and <strong className="text-text font-medium">n = √(ε<sub>r</sub> μ<sub>r</sub>)</strong> is the
        dimensionless refractive index. For non-magnetic materials, μ<sub>r</sub> ≈ 1 and
        n ≈ √ε<sub>r</sub>.
      </p>
      <p className="mb-prose-3">
        with <strong className="text-text font-medium">n</strong> the <em className="italic text-text">refractive index</em> of the material. Light slowing in glass is
        not the photons taking a leisurely path — it's the electromagnetic wave coupling to the bound
        electrons, the same dipoles you saw rotating in the polarization demo, and the resulting
        composite mode propagating slower than c. The whole world of optics — refraction, dispersion,
        absorption, total internal reflection — is just what happens when materials enter Maxwell's
        equations <Cite id="jackson-1999" in={SOURCES} /><Cite id="griffiths-2017" in={SOURCES} />.
      </p>

      <p className="mb-prose-3">
        That's where this textbook leaves you: not with electricity as a separate subject but as the wide
        gateway into electromagnetism, and electromagnetism in matter as the wide gateway into optics,
        condensed-matter physics, and chemistry. Two sliders. Eleven chapters. One field.
      </p>

      <CaseStudies intro="Three places where the susceptibility numbers of this chapter become the working tolerances of an industry.">
        <CaseStudy
          tag="Case 11.1"
          title="Giant magnetoresistance in hard-drive read heads"
          summary={<>A Nobel-winning bilayer effect that read a generation of hard drives — engineered ferromagnet/non-magnet sandwiches whose resistance flips with a few-gauss field.</>}
          specs={[
            { label: 'Discovery (independent)', value: 'Fert (Orsay) & Grünberg (Jülich), 1988–89' },
            { label: 'Original ΔR/R (Fe/Cr, 4.2 K)', value: '~50 %' },
            { label: 'Original applied field', value: '~2 T' },
            { label: 'First commercial GMR HDD head', value: 'IBM, 1997' },
            { label: 'Nobel Prize in Physics', value: '2007 (Fert & Grünberg)' },
            { label: 'Magnetic mechanism', value: 'spin-dependent electron scattering' },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            Baibich and collaborators in Fert's group at Orsay reported a ~50% resistance change in
            Fe/Cr superlattices at 4.2 K under an applied field of a few tesla — far larger than any
            previously known magnetoresistive effect<Cite id="baibich-1988" in={SOURCES} />. A
            parallel discovery at Jülich on Fe/Cr/Fe trilayers by Grünberg's group appeared shortly
            after<Cite id="binasch-grunberg-1989" in={SOURCES} />. The two papers shared the 2007
            Nobel Prize in Physics.
          </p>
          <p className="mb-prose-2 last:mb-0">
            The mechanism is the chapter's ferromagnetism story, sharpened by a quantum
            spin-dependent scattering rule: in a thin non-magnetic spacer between two magnetic
            layers, conduction electrons whose spin is parallel to the local magnetization scatter
            weakly, while antiparallel-spin electrons scatter strongly. When the two ferromagnetic
            layers are antiparallel (zero field), every electron is "wrong" in one of the layers
            and the resistance is high. A small applied field flips both layers parallel, and
            electrons of one spin now travel relatively freely through the whole stack — resistance
            drops abruptly<Cite id="kittel-2005" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            By 1997, IBM had engineered GMR-based "spin valves" into the read head of every new
            hard drive on the market. The areal density of magnetic storage went from a few hundred
            megabits per square inch in the early 1990s to tens of gigabits per square inch by the
            mid-2000s, and the new sensor was a major reason. The ferromagnetic domain physics of
            §"Ferromagnets and the hysteresis loop" wasn't a curiosity any more; it was reading
            every email you sent for a decade.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 11.2"
          title="The ceramic capacitor on every PCB"
          summary={<>Barium titanate ferroelectrics push εᵣ into the thousands and pack farads of capacitance into millimetres of board space.</>}
          specs={[
            { label: 'Air-gap dielectric εᵣ', value: '~1.0006' },
            { label: 'Glass εᵣ', value: '4 – 10' },
            { label: 'BaTiO₃ εᵣ (near T_C)', value: '1000 – 10 000' },
            { label: 'BaTiO₃ Curie temperature', value: '~120 °C (393 K)' },
            { label: 'X7R tolerance', value: '±15 % from −55 to +125 °C' },
            { label: 'MLCC internal electrodes', value: '50 – 1000 layers' },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            Barium titanate (BaTiO₃) is a{' '}
            <Term def={<><strong className="text-text font-medium">ferroelectric</strong> — a material with a spontaneous, switchable electric polarization below a Curie temperature, in direct analogy to a ferromagnet. Unit cells distort along one axis, giving each cell a permanent dipole; cells cooperate over macroscopic domains. <em className="italic text-text">ε<sub>r</sub></em> in the thousands and electric hysteresis loops.</>}>ferroelectric</Term>
            {' '}— a material with a <em className="italic text-text">spontaneous</em>
            electric polarization below its Curie temperature of about 120 °C, in direct analogy to
            ferromagnetism in iron<Cite id="kittel-2005" in={SOURCES} />. Its relative permittivity
            peaks at the ferroelectric transition and stays in the thousands across normal
            operating temperatures; Moulson and Herbert tabulate room-temperature values from about
            1000 in coarse-grained pure BaTiO₃ up to 10000 in carefully-doped formulations
            <Cite id="moulson-herbert-2003" in={SOURCES} />. That is three to four orders of
            magnitude above the εᵣ ≈ 4–10 of glass.
          </p>
          <p className="mb-prose-2 last:mb-0">
            A multilayer ceramic capacitor (MLCC) stacks dozens to thousands of thin BaTiO₃ layers
            with interleaved nickel or palladium electrodes; the capacitances add in parallel.
            That's how a 1 µF capacitor fits in a 1 mm × 0.5 mm package. The price is non-linearity:
            BaTiO₃'s εᵣ depends on temperature, applied DC bias, frequency, and age. The industry
            classifies the trade-offs with codes like X7R (capacitance held within ±15% from −55 °C
            to +125 °C) and Y5V (much looser temperature spec, but higher capacitance density)
            <Cite id="moulson-herbert-2003" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            Every smartphone, every laptop motherboard, every USB charger contains hundreds of
            MLCCs. The whole technology rides on one fact from this chapter: a material with a
            permanent dipole can have a permittivity orders of magnitude above vacuum — and if you
            can make that material ferroelectric and stable, you can store a useful charge in a
            volume the size of a sesame seed.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 11.3"
          title="Curie temperatures: iron versus gadolinium"
          summary={<>Two ferromagnets, two Curie points 750 K apart — and the reason gadolinium can be a refrigerant near room temperature while iron cannot.</>}
          specs={[
            { label: 'T_C (iron)', value: '~1043 K (770 °C)' },
            { label: 'T_C (cobalt)', value: '~1394 K (1121 °C)' },
            { label: 'T_C (nickel)', value: '~627 K (354 °C)' },
            { label: 'T_C (gadolinium)', value: '~292 K (19 °C)' },
            { label: 'M_s (iron, 0 K)', value: '~1.7×10⁶ A/m' },
            { label: 'Atomic moment, Fe', value: '~2.22 μ_B' },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            Kittel tabulates Curie temperatures of the elemental ferromagnets: iron at 1043 K,
            cobalt at 1394 K, nickel at 627 K, gadolinium at about 292 K<Cite id="kittel-2005" in={SOURCES} />.
            The vast separation is set by the exchange-coupling energy between neighbouring spins;
            in 3d transition metals it is large (tens of meV per pair), while in 4f rare earths the
            relevant exchange runs indirectly through the conduction electrons and is much weaker
            — hence gadolinium's barely-above-ice-point T<sub>C</sub>.
          </p>
          <p className="mb-prose-2 last:mb-0">
            Above T<sub>C</sub> the spontaneous alignment evaporates and the material becomes an
            ordinary paramagnet with susceptibility falling as 1/(T − T<sub>C</sub>) — the
            Curie–Weiss law<Cite id="weiss-1907" in={SOURCES} />. At T<sub>C</sub> itself, the
            magnetic specific heat develops a sharp peak. Because gadolinium's transition sits
            within reach of a domestic compressor, it is the working substance of the
            <strong className="text-text font-medium"> magnetocaloric refrigerator</strong>: cycle Gd through a strong magnetic field
            on and off, and the entropy associated with its spin order shows up as a temperature
            change of a few kelvin per cycle<Cite id="kittel-2005" in={SOURCES} />. Iron's
            T<sub>C</sub> of 770 °C makes the same trick irrelevant for everyday cooling.
          </p>
          <p className="mb-prose-2 last:mb-0">
            The Curie point also sets a hard ceiling for any permanent magnet. Drop a neodymium
            magnet (T<sub>C</sub> for Nd₂Fe₁₄B ≈ 585 K) into a campfire and it cools back into a
            random domain pattern — the magnetisation does not survive. Operating temperature
            limits in datasheets for motor magnets and read-head magnets are set well below
            T<sub>C</sub>, because the remanence drops continuously as you approach the
            transition<Cite id="weiss-1907" in={SOURCES} /><Cite id="kittel-2005" in={SOURCES} />.
          </p>
        </CaseStudy>
      </CaseStudies>

      <FAQ
        intro="The microscopic story raises a lot of questions a quick read won't answer. Here are the ones a careful reader tends to surface."
      >
        <FAQItem q="Why is water's ε_r so much larger than glass's?">
          <p>
            Water has a permanent molecular dipole — the H–O–H bond angle is bent (∼104.5°) and oxygen
            is much more electronegative than hydrogen, so the molecule has a built-in dipole moment of
            about 1.85 debye. In an applied field these dipoles just rotate; no electron stretching is
            needed. Glass is a covalent network with no comparable permanent dipoles — only the much
            weaker induced electronic response, which gives ε<sub>r</sub> ≈ 4–10. Debye worked out the
            theory of polar liquids and got the right scaling for water in 1929
            <Cite id="debye-1929" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Is there a material with ε_r < 1?">
          <p>
            Not in the static (DC) limit, for an ordinary linear, passive dielectric — that would imply
            negative bound charge density per unit field, which violates energy considerations. At
            <em className="italic text-text"> finite frequencies</em>, however, ε(ω) can have a real part below 1 (or even negative)
            near resonances — this is what gives metals their characteristic optical reflectivity. So
            "static ε<sub>r</sub> &lt; 1" no, "ε<sub>r</sub>(ω) &lt; 1 at optical frequencies" yes, and it's
            exactly why a silver mirror reflects visible light <Cite id="jackson-1999" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What's the difference between bound and free charge?">
          <p>
            <strong className="text-text font-medium">Free charge</strong> is mobile — the conduction electrons in a metal, the ions in a
            solution. You can put it on a capacitor plate, drive it through a wire, count it with an
            ammeter. <strong className="text-text font-medium">Bound charge</strong> is the slight displacement of electrons relative to
            nuclei within neutral atoms, or the orientation of permanent molecular dipoles. It is not
            mobile in the usual sense — when you remove the applied field, it relaxes back. Both kinds
            produce real <strong className="text-text font-medium">E</strong> fields; the distinction is purely about whether the charge can
            move freely on macroscopic scales <Cite id="griffiths-2017" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why does putting a dielectric in a capacitor increase its capacitance?">
          <p>
            Capacitance is <strong className="text-text font-medium">C = Q/V</strong>. With a dielectric in place, the bound surface
            charge partially cancels the free plate charge, dropping the field in the gap by ε<sub>r</sub>.
            The voltage <strong className="text-text font-medium">V = E · d</strong> drops by the same factor, while the free charge Q on
            the plates is unchanged. C goes up by exactly ε<sub>r</sub>. A 1 µF ceramic cap with
            ε<sub>r</sub> ≈ 2500 is roughly the same plate area as a 0.4 nF air-gap cap — that's why your
            phone has room for hundreds of them.
          </p>
        </FAQItem>

        <FAQItem q="Are dielectrics also conductors at high enough field?">
          <p>
            Yes — every dielectric has a <em className="italic text-text">breakdown field</em> above which it ionizes and conducts. Air
            breaks down at about 3 MV/m (the spark in a lightning bolt). Glass breaks at 10–25 MV/m. The
            mechanism is impact ionization: a stray electron is accelerated by the strong field, kicks
            another electron free on collision, both accelerate, both kick more loose, and an avalanche
            ensues. The dielectric becomes a conductor along the breakdown channel — sometimes
            permanently, if it carbonizes <Cite id="jackson-1999" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What's a ferroelectric?">
          <p>
            A material that — in analogy to a ferromagnet — has a <em className="italic text-text">spontaneous</em> electric
            polarization, even with no applied field. Barium titanate (BaTiO₃) is the canonical example;
            its unit cell is slightly distorted along one axis, giving each cell a permanent dipole
            moment, and the cells cooperate over macroscopic domains. Ferroelectrics show electric
            hysteresis loops, have ε<sub>r</sub> in the thousands, and are the basis of ceramic capacitors
            and some non-volatile memories <Cite id="kittel-2005" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why is iron magnetic but copper isn't?">
          <p>
            Both have unpaired d-orbital electrons — iron has 4 unpaired 3d electrons, while a copper atom
            has just one. But the deciding factor is the <em className="italic text-text">exchange interaction</em>, a
            quantum-mechanical effect that lowers energy when neighboring spins are aligned. In iron the
            exchange coupling is strong enough to dominate thermal noise up to 1043 K (the Curie
            temperature). In copper it isn't — copper is a paramagnet at most, and a very weak one at that
            <Cite id="kittel-2005" in={SOURCES} />. Same one-line answer in three words: exchange is
            stronger.
          </p>
        </FAQItem>

        <FAQItem q="What's the difference between B and H — really?">
          <p>
            <strong className="text-text font-medium">B</strong> is the magnetic field itself — the thing that pushes on moving charges, the
            thing that appears in Maxwell's equations and in the Lorentz force law. <strong className="text-text font-medium">H</strong> is a
            constructed bookkeeping field defined as <InlineMath>H = B/μ₀ − M</InlineMath>, which has the
            virtue that its source is only the <em className="italic text-text">free</em> current, not the bound currents inside
            magnetized matter. In vacuum the two are proportional and the distinction is cosmetic. Inside
            magnetic material it matters, because separating free from bound current makes the boundary
            conditions much cleaner. Griffiths' description: H is to B as D is to E — a "fictitious"
            field invented to make life easier when matter is involved <Cite id="griffiths-2017" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why does a magnetic material saturate?">
          <p>
            Because the material is a finite collection of magnetic moments and once they're all aligned,
            there's nothing left to align. In a ferromagnet, the saturation magnetization M<sub>s</sub>
            equals the density of atomic moments times the moment per atom — about 1.7×10⁶ A/m for iron,
            corresponding to roughly 2.2 Bohr magnetons per atom. Push <strong className="text-text font-medium">B</strong> harder and
            magnetization can't rise any further; only the vacuum contribution increases
            <Cite id="kittel-2005" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why is permanent magnetization possible — what locks it?">
          <p>
            Two things, working together. First, exchange coupling makes a uniformly-magnetized state
            energetically favored at the microscopic scale. Second, the magnetization can be stuck in a
            particular direction by <em className="italic text-text">magnetocrystalline anisotropy</em> — certain crystal axes are
            "easier" to magnetize along than others — and by domain-wall pinning at lattice defects.
            Together these create deep local minima in the energy landscape that a small reverse field
            can't pull the system out of. That's the remanence <Cite id="weiss-1907" in={SOURCES} />
            <Cite id="kittel-2005" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why does heating a magnet kill it? (Curie temperature)">
          <p>
            Thermal energy <em className="italic text-text">kT</em> competes with the exchange-coupling energy. Below the Curie
            temperature T<sub>C</sub>, exchange wins and the spins lock into domains. Above T<sub>C</sub>,
            thermal motion overwhelms the coupling and the domains evaporate — the material becomes a
            paramagnet, with χ<sub>m</sub> falling as 1/(T−T<sub>C</sub>) by the Curie–Weiss law
            <Cite id="weiss-1907" in={SOURCES} />. For iron, T<sub>C</sub> = 1043 K (770 °C). Above this
            you can still magnetize the iron weakly while a strong field is applied, but the moment you
            cool it back down through T<sub>C</sub>, it freezes in whatever (random) domain pattern is
            present and you have to remagnetize it.
          </p>
        </FAQItem>

        <FAQItem q="What's the difference between dia-, para-, ferro-, and antiferromagnetism?">
          <p>
            <strong className="text-text font-medium">Diamagnetism</strong>: induced orbital currents oppose the applied B; every material has
            it; χ<sub>m</sub> ≈ −10⁻⁵. <strong className="text-text font-medium">Paramagnetism</strong>: independent permanent moments align
            weakly with B against thermal noise; χ<sub>m</sub> ≈ +10⁻⁵ to +10⁻³, follows Curie's law.
            <strong className="text-text font-medium"> Ferromagnetism</strong>: exchange coupling forces parallel alignment of neighboring
            spins; spontaneous magnetization below T<sub>C</sub>; χ<sub>m</sub> up to ∼10⁶.
            <strong className="text-text font-medium"> Antiferromagnetism</strong>: exchange forces <em className="italic text-text">antiparallel</em> alignment of
            neighbors; net macroscopic magnetization is zero, but the spin sublattices each carry an
            ordered moment. MnO and most chromium compounds are antiferromagnetic. There's also
            <em className="italic text-text"> ferrimagnetism</em> — antiparallel sublattices of unequal magnitude, giving a net moment;
            magnetite (Fe₃O₄) is the textbook example <Cite id="kittel-2005" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Can you make a non-conducting magnet?">
          <p>
            Yes. <em className="italic text-text">Ferrites</em> — ceramic oxides of iron — are ferrimagnetic insulators. The classic
            black-magnet refrigerator magnet and the ceramic core of an RF transformer are both ferrites.
            Because they don't conduct, eddy currents are tiny — that's why they're preferred at radio
            frequencies, where the iron-laminate cores used in 60-Hz transformers would dissipate too much
            <Cite id="kittel-2005" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Is there a 'magnetic Coulomb's law'?">
          <p>
            Sort of, and only as a pedagogical fiction. If magnetic monopoles existed, there would be a
            tidy 1/r² force law between them. They don't (no isolated magnetic charge has ever been
            observed; Maxwell's <strong className="text-text font-medium">∇·B = 0</strong> is the field-theoretic statement of that fact),
            so the closest analog is the dipole-dipole interaction between two permanent magnets, which
            falls off as 1/r⁴ along the axis. There is no fundamental magnetic Coulomb's law — magnetism
            is what you get when electric charges move <Cite id="griffiths-2017" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why do certain materials become superconductors only at low temperatures?">
          <p>
            Conventional superconductivity arises from a phonon-mediated attractive interaction between
            electrons that, below some critical temperature T<sub>c</sub>, lets them form bound "Cooper
            pairs" and condense into a coherent quantum state with zero DC resistance. The pairing energy
            (the "gap") is tiny — typically about <em className="italic text-text">kT<sub>c</sub></em>. Above T<sub>c</sub>, thermal
            energy breaks the pairs and the superconductor reverts to a normal metal. We mentioned this
            briefly in Ch. 3; the materials-side relevance is that a superconductor is also a perfect
            diamagnet (the Meissner effect): inside, χ<sub>m</sub> = −1 exactly, and external <strong className="text-text font-medium">B</strong>
            is expelled completely.
          </p>
        </FAQItem>

        <FAQItem q="Are biological tissues magnetic?">
          <p>
            Almost not at all — most soft tissues are diamagnetic with χ<sub>m</sub> ≈ −9×10⁻⁶ (very close
            to water's value), which is why MRI works on hydrogen nuclei rather than on bulk tissue
            magnetization. There are exceptions: ferritin (iron-storage protein) carries a paramagnetic
            iron core, and certain bacteria contain magnetosomes — actual nanocrystals of magnetite that
            function as biological compasses <Cite id="kittel-2005" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why do MRI machines use such large fields?">
          <p>
            Because the signal you want — the precession of proton spins — is proportional to the
            equilibrium nuclear polarization, which is proportional to <strong className="text-text font-medium">B</strong>. At room
            temperature the proton's Zeeman splitting <em className="italic text-text">μB</em> is tiny compared to <em className="italic text-text">kT</em>, so only
            a few protons per million end up net-aligned with the field. Doubling B doubles the signal;
            tripling B nearly triples it. Clinical MRI runs at 1.5 to 3 T (compared to Earth's field of
            ∼50 µT) precisely because that's where the SNR becomes workable in reasonable scan times.
          </p>
        </FAQItem>

        <FAQItem q="Why does refractive index depend on wavelength?">
          <p>
            Because the bound electrons in a material have natural resonance frequencies (typically in the
            UV for transparent solids). When the light's frequency is far below resonance, the electrons
            respond easily and the polarization tracks the field nearly in phase — ε<sub>r</sub>(ω)
            increases as ω approaches the resonance from below. That gives the characteristic
            "blue-bends-more" dispersion of glass. Right at resonance, absorption peaks and the material
            becomes opaque. Above resonance, ε<sub>r</sub>(ω) drops below 1, giving rise to all of the
            metal-like optical phenomena. The whole dispersion curve is one continuous function set by the
            material's resonance structure <Cite id="jackson-1999" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What's the Clausius–Mossotti relation, and what does it tell you?">
          <p>
            For a dilute or moderately dense collection of polarizable molecules — each with molecular
            polarizability α and number density N — the Clausius–Mossotti relation reads
          </p>
          <Formula size="small">(ε<sub>r</sub> − 1)/(ε<sub>r</sub> + 2) = N α / (3 ε₀)</Formula>
          <p>
            where <strong className="text-text font-medium">ε<sub>r</sub></strong> is the dimensionless relative permittivity of the
            bulk material, <strong className="text-text font-medium">N</strong> is the number density of polarizable molecules (in
            m⁻³), <strong className="text-text font-medium">α</strong> is the molecular polarizability (in C·m²/V), and
            <strong className="text-text font-medium"> ε₀ ≈ 8.854×10⁻¹² F/m</strong> is the permittivity of free space.
          </p>
          <p>
            It links the macroscopic permittivity ε<sub>r</sub> to the microscopic α. The factor of (ε + 2)
            in the denominator is a self-field correction: each molecule sits in not only the external
            field but also the field of all the other dipoles, and the geometry of a spherical cavity
            inside a polarized continuum gives the 1/3 factor. Mossotti derived it in 1846; Clausius
            independently in 1850 <Cite id="clausius-1850" in={SOURCES} />. The same relation appears in
            optics as the Lorentz–Lorenz formula, with ε<sub>r</sub> replaced by n².
          </p>
        </FAQItem>

        <FAQItem q="Why is the static ε_r of water 80 but its optical n is only 1.33?">
          <p>
            Because at low frequencies, the entire water molecule can rotate to align with the applied
            field — and that's where most of the polarization comes from. At optical frequencies (∼10¹⁵
            Hz), the molecule can't rotate that fast; only the electronic response remains. So at low
            frequencies ε<sub>r</sub> ≈ 80, while at optical frequencies ε<sub>r</sub> = n² ≈ 1.77.
            Between these two regimes the permittivity drops in a series of relaxation steps — the
            classic Debye-relaxation behavior <Cite id="debye-1929" in={SOURCES} />. That's why microwave
            ovens work: 2.45 GHz sits right in the middle of water's relaxation tail, where ε<sub>r</sub>
            has a large imaginary part and incident energy is efficiently absorbed.
          </p>
        </FAQItem>
      </FAQ>
    </ChapterShell>
  );
}
