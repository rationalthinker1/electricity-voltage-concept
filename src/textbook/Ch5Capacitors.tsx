/**
 * Chapter 4 — Capacitors
 *
 * Two plates, a gap, and a stored field. Built around six embedded demos:
 *   4.1 Build-a-capacitor  (centerpiece — click charges on, watch V and U rise)
 *   4.2 Why each charge is harder than the last
 *   4.3 Plate geometry  (C = ε₀A/d)
 *   4.4 Energy in the gap  (u_E = ½ε₀E²)
 *   4.5 RC charging curve
 *   4.6 Leyden jar replay  (historical flavour)
 *
 * Every numerical and historical claim is cited inline via <Cite/> against
 * the chapter's `sources` array (defined in src/textbook/data/chapters.ts).
 */
import { CaseStudies, CaseStudy } from '@/components/CaseStudy';
import { ChapterShell } from '@/components/ChapterShell';
import { FAQ, FAQItem } from '@/components/FAQ';
import { Cite } from '@/components/SourcesList';
import { Formula, InlineMath } from '@/components/Formula';
import { Pullout } from '@/components/Prose';
import { Term } from '@/components/Term';
import { TryIt } from '@/components/TryIt';
import { BuildACapacitorDemo } from './demos/BuildACapacitor';
import { ChargingCurveDemo } from './demos/ChargingCurve';
import { EnergyInTheGapDemo } from './demos/EnergyInTheGap';
import { LeydenJarReplayDemo } from './demos/LeydenJarReplay';
import { ParallelPlate3DDemo } from './demos/ParallelPlate3D';
import { PlateGeometryDemo } from './demos/PlateGeometry';
import { WhyHarderEachChargeDemo } from './demos/WhyHarderEachCharge';
import { getChapter } from './data/chapters';

export default function Ch5Capacitors() {
  const chapter = getChapter('capacitors')!;
  const SOURCES = chapter.sources;

  return (
    <ChapterShell chapter={chapter}>
      <p>
        Hold two coins a millimeter apart and connect each to a different terminal of a battery. Charges slosh onto the metal until
        the two faces opposite the gap carry equal and opposite amounts, and the field between them matches the battery's pull.
        You have just built a <Term def="A two-terminal device that stores energy in the electric field between two conductors separated by an insulating gap (the dielectric). Defined by Q = CV.">capacitor</Term> — the simplest device in all of electronics. There are thousands of them inside the
        phone in your pocket, hundreds inside the cable that charges it, and a few thousand farads worth on the bus that the
        engineer hopes one day will replace your morning coffee with regenerative braking.
      </p>
      <p>
        This chapter is about why the capacitor works the way it does. We will build one up from scratch, one electron at a time,
        and watch three things happen in lockstep: the voltage rises linearly with charge; the energy stored climbs quadratically;
        and the energy itself lives not on the plates but in the field between them<Cite id="feynman-II-2" in={SOURCES} />.
        Along the way we will pick up the formula <InlineMath>Q = CV</InlineMath>, the geometry rule
        <InlineMath> C = ε₀A/d</InlineMath>, and the time constant <InlineMath>τ = RC</InlineMath> that governs every
        switch-on transient in every circuit ever built.
      </p>

      <h2>The simplest device in all of electronics</h2>

      <p>
        Two plates. A gap between them. Push positive charge onto one plate by any means at hand — a battery, a friction wheel,
        a chemistry textbook — and the other plate immediately rearranges its free electrons so that an equal and opposite
        charge migrates to its facing surface<Cite id="griffiths-2017" in={SOURCES} />. The gap fills with a uniform electric
        field, pointing from the positive plate to the negative one. The total charge on the device is still zero — what one
        plate gained, the other lost — but the <Term def="The configuration in which equal-and-opposite charges sit on two conductors with an insulator between them. Setting this up costs work; tearing it down releases that work back. The thing a capacitor actually 'stores.'">charge separation</Term> represents stored energy. That's it. That's a
        capacitor.
      </p>
      <p>
        Most of the capacitors in your life are wound, stacked, or printed versions of this same idea. A modern ceramic
        chip capacitor is a sandwich of dozens of metallised layers laminated together; an <Term def="A capacitor that achieves high capacitance per volume by growing a thin aluminium- or tantalum-oxide dielectric on a foil anode through electrochemistry. The oxide only insulates with the correct polarity, so these caps are polarised — reversing them destroys the oxide and the cap.">electrolytic</Term> capacitor is a long
        strip of foil rolled into a can with a wet paste in between; the touch sensor on your phone screen is a printed grid
        of tiny capacitors whose values your finger perturbs. They differ in scale, in dielectric, in geometry — not in
        principle.
      </p>

      <h2>Building one charge at a time</h2>

      <p>
        Start with two neutral plates, separated by a small gap of vacuum. Take exactly one electron from the bottom plate and
        move it to the top plate. Now the top plate carries one unit of negative charge, the bottom one unit of positive, and
        a faint field exists in the gap. The work you did was essentially zero — you were starting from a flat potential
        landscape, and the first electron didn't have to push against anything to get across.
      </p>
      <p>
        Move a second electron from bottom to top. <em>This</em> one costs work. The field set up by the first electron points
        from the bottom plate (now slightly positive) to the top plate (now slightly negative), and the second electron, which
        is itself negative, gets a push <em>toward</em> the bottom plate. You have to overcome that push to get the electron
        across. Not much — but more than zero. Move a third, and the field is stronger still. By the millionth electron the
        work per crossing is a million times larger than the cost of the first one.
      </p>

      <BuildACapacitorDemo />

      <p>
        That linear growth in the cost-per-charge is the whole story of the capacitor in one sentence. The voltage between the
        plates — the work per coulomb required to move test charge from one to the other — grows in lockstep with the amount
        of charge already there. Double the charge, double the voltage. The proportionality is geometric, set by the size and
        spacing of the plates and the stuff in between<Cite id="griffiths-2017" in={SOURCES} />.
      </p>

      <h2><em>V = Q / C</em>: a linear relationship</h2>

      <p>
        Alessandro Volta gave the device its first proper definition in 1782, in a paper to the Royal Society. He observed
        that the charge a body could hold was proportional to the potential difference applied to it, and called the
        constant of proportionality the body's <em>capacity</em><Cite id="volta-1782" in={SOURCES} />. We call the same
        quantity <Term def="The proportionality between charge stored and voltage applied: C = Q/V. SI unit is the farad. Determined by geometry and the dielectric, not by the source or the charge.">capacitance</Term> now, and write it as
      </p>
      <Formula>Q = C V</Formula>
      <p>
        where <strong>Q</strong> is the magnitude of charge on each plate (in coulombs; the two plates carry +Q and −Q),
        <strong> V</strong> is the voltage across the gap (in volts), and <strong>C</strong> is the capacitance of the
        device — its proportionality constant between charge and voltage,
        measured in <Term def="SI unit of capacitance. 1 F = 1 coulomb per volt. A huge unit — practical capacitors range from picofarads to millifarads; only supercapacitors reach whole farads.">farad</Term>s — one coulomb per volt. For an idealised pair of <Term def="The textbook capacitor geometry: two flat conductors of area A separated by a thin gap d, with C = ε₀εᵣA/d. The basis for almost every capacitance calculation.">parallel-plate</Term>s of area <strong>A</strong>
        separated by a vacuum gap of width <strong>d</strong>, Gauss's law applied to the surface of one plate gives a
        uniform field <strong>E = Q/(ε₀A)</strong> in the gap, and integrating that field across the gap yields a voltage
        <strong> V = Ed = Qd/(ε₀A)</strong>. Re-arranging<Cite id="griffiths-2017" in={SOURCES} />:
      </p>
      <Formula>C = ε₀ A / d</Formula>
      <p>
        Capacitance is geometry. More area, more capacity. Less gap, more capacity. (And no surprise: a wider plate has more
        room to spread charge thinly; a smaller gap means a given charge separation produces a smaller voltage.) Slide a
        non-conducting material — a <Term def="An insulator inserted between capacitor plates. Its molecules polarise in the applied field, partially cancelling it and lowering V for a given Q. The net effect is to multiply capacitance by the material's relative permittivity εᵣ.">dielectric</Term> — into the gap and its molecules polarise: each one sets up a tiny
        counter-field that partially cancels the applied one, dropping V for a given Q and pushing C up by a factor
        <strong> εᵣ</strong>, the material's <Term def="Dimensionless number εᵣ giving how much a dielectric reduces the field for the same charge on the plates. Vacuum is 1; air ≈ 1; water ≈ 80; specialised ceramics push past 1000.">relative permittivity</Term><Cite id="jackson-1999" in={SOURCES} />.
      </p>
      <Formula>C = ε₀ ε<sub>r</sub> A / d</Formula>

      <PlateGeometryDemo />

      <ParallelPlate3DDemo />

      <p>
        The 3D view above makes the underlying picture geometrical. The surface-charge density
        <strong> σ = Q/A</strong> sits on the inner faces of the two plates as equal and opposite sheets;
        between them, the field is the same everywhere — uniform in magnitude and direction — with
        <strong> E = σ/ε₀ = V/d</strong>. Toggle the Gauss pillbox to see the operational statement of
        Gauss's law: a closed cylinder piercing one plate has its top cap outside the conductor
        (where E = 0) and its bottom cap in the field-filled gap. The only nonzero contribution to
        <strong> ∮ D · dA</strong> comes from that bottom cap, and it equals exactly the charge
        <strong> σA</strong> on the slice of plate the pillbox encloses<Cite id="jackson-1999" in={SOURCES} />.
        Re-arrange and you get back <InlineMath>C = ε₀ A / d</InlineMath>.
      </p>

      <TryIt
        tag="Try 5.1"
        question={<>Two square plates 5 cm × 5 cm are held 0.5 mm apart in vacuum. What is their capacitance?</>}
        hint="C = ε₀ A / d. Convert everything to SI."
        answer={
          <>
            <p>
              Area: <strong>A = (0.05 m)² = 2.5×10⁻³ m²</strong>. Gap: <strong>d = 5×10⁻⁴ m</strong>.
              ε₀ = 8.854×10⁻¹² F/m<Cite id="codata-2018" in={SOURCES} />.
            </p>
            <Formula>C = ε₀ A / d = (8.854×10⁻¹²)(2.5×10⁻³) / (5×10⁻⁴)</Formula>
            <Formula>C ≈ <strong>44 pF</strong></Formula>
            <p>
              A laboratory-scale parallel-plate cap of this size lands solidly in the picofarad range. To get a microfarad
              into a millimetre cube the industry stacks dozens of thin high-εᵣ layers in parallel<Cite id="horowitz-hill-2015" in={SOURCES} />.
            </p>
          </>
        }
      />

      <p>
        The constant <strong>ε₀ ≈ 8.854×10⁻¹² F/m</strong><Cite id="codata-2018" in={SOURCES} /> is so small that real-world
        capacitors live in the picofarad-to-millifarad range. Two metal plates of 1 cm² area held 1 mm apart in vacuum give
        <strong> C ≈ 0.9 pF</strong>. A whole farad in air would need plates the size of a small lake. The reason the
        capacitor industry exists at all is the εᵣ trick: stack thin layers of high-permittivity ceramic between thin
        metallised foils and you can fit a microfarad into a millimeter cube<Cite id="horowitz-hill-2015" in={SOURCES} />.
      </p>

      <h2>Why the work to add the N<sup>th</sup> charge is q·V(N−1)</h2>

      <p>
        Imagine the capacitor at some intermediate state, with charge <strong>q</strong> already on its plates and voltage
        <strong> v = q/C</strong> across them. To move one more coulomb's worth of charge — a tiny <strong>dq</strong> —
        from the negative plate to the positive plate, you have to do work <strong>v·dq</strong> against the existing field.
        The cost per coulomb is exactly the present voltage. For a real, finite chunk of charge δq, the work is
        <strong> δq · v</strong>, which is to say <strong>δq · q / C</strong> — proportional to how full the cap already is.
      </p>
      <p>
        A worked example. Suppose you have a 10 µF capacitor that already carries 100 µC of charge, so V = Q/C = 10 V. Adding
        another 1 nC costs about <strong>10⁻⁸ J</strong>. Adding 1 nC to a completely empty cap would have cost essentially
        zero. Adding 1 nC to the same cap when it already holds 200 µC would cost <em>twice</em> as much as adding it at
        100 µC. The cost climbs linearly with how far you have already gone<Cite id="griffiths-2017" in={SOURCES} />.
      </p>

      <WhyHarderEachChargeDemo />

      <TryIt
        tag="Try 5.2"
        question={<>A 10 nF capacitor already carries 100 nC. How much work does it take to add the next 1 nC?</>}
        hint="The work to move charge δq across the existing voltage V is δq · V, with V = Q/C."
        answer={
          <>
            <p>
              Current voltage: <strong>V = Q/C = 100 nC / 10 nF = 10 V</strong>.
              Work to add the next 1 nC:
            </p>
            <Formula>W ≈ δq · V = (1×10⁻⁹ C)(10 V) = <strong>10 nJ</strong></Formula>
            <p>
              The cost rises linearly with how full the cap already is — adding 1 nC to an empty cap costs essentially zero,
              and adding 1 nC at 200 nC of charge would cost twice as much<Cite id="griffiths-2017" in={SOURCES} />.
            </p>
          </>
        }
      />

      <p>
        This is also why the capacitor is the cleanest physical model of the running-out-of-easy-wins phenomenon — the more
        you've put in, the harder the next addition. It is the single-line summary of why charging takes work, why discharging
        gives the work back, and why the total energy stored is not <em>QV</em> but half of <em>QV</em>.
      </p>

      <h2>Where the energy goes</h2>

      <p>
        Sum the work from empty to full charge: integrate <strong>v(q)·dq</strong> from 0 to Q, with v = q/C.
      </p>
      <Formula>U = ∫<sub>0</sub><sup>Q</sup> (q / C) dq = Q² / (2C) = ½ C V²</Formula>
      <p>
        where <strong>U</strong> is the total energy stored in the capacitor (in joules), <strong>Q</strong> is the final
        charge on each plate (in coulombs), <strong>V = Q/C</strong> is the final voltage across it (in volts),
        <strong> C</strong> is the capacitance (in farads), and the dummy variable <strong>q</strong> runs from 0 to <em>Q</em>
        across the integration.
        The factor of one half is doing real work in that formula. If the relationship between charge and voltage were not
        linear — if the (N+1)<sup>th</sup> charge cost the <em>same</em> as the first — the answer would be QV. Because each
        charge cost progressively more, the total averages out to half of (full Q) × (final V). The first electron crossed
        when V was zero; the last electron crossed when V was at its maximum; on average the cost per charge was V/2.
      </p>
      <p>
        Now the more interesting question: <em>where</em> is that energy? Not on the plates themselves — the plates are still
        perfect equilibrium conductors with the same total charge they always had (zero, net). The energy is in the gap, in
        the electric field, distributed throughout the volume at a density that depends only on the local field
        strength<Cite id="jackson-1999" in={SOURCES} />:
      </p>
      <Formula>u<sub>E</sub> = ½ ε₀ ε<sub>r</sub> E²</Formula>
      <p>
        where <strong>u<sub>E</sub></strong> is the electric-field energy per unit volume (in J/m³),
        <strong> ε₀ ≈ 8.854×10⁻¹² F/m</strong> is the vacuum permittivity <Cite id="codata-2018" in={SOURCES} />,
        <strong> ε<sub>r</sub></strong> is the dimensionless relative permittivity of whatever fills the gap (1 for vacuum),
        and <strong>E</strong> is the local electric-field magnitude (in V/m).
      </p>

      <EnergyInTheGapDemo />

      <p>
        Multiply this density by the gap volume <strong>A·d</strong> for an idealised parallel-plate cap and you recover
        exactly <strong>½ CV²</strong>. The two answers — the integrated work and the field-volume integral — are the same
        number, computed two different ways. That equivalence is not a coincidence; it is a special case of the more general
        statement that electromagnetic fields carry energy in their own right<Cite id="feynman-II-2" in={SOURCES} />, which
        will become the Poynting story in Chapter 7.
      </p>

      <Pullout>
        A capacitor doesn't store charge. The plates always net to zero. What it stores is the <em>separation</em> —
        and the field that fills the gap because of it.
      </Pullout>

      <TryIt
        tag="Try 5.3"
        question={<>A 100 µF capacitor is charged to 12 V. How much energy is stored? And how many electrons of net charge sit on each plate?</>}
        hint="U = ½ C V². For the count, use Q = CV and divide by e = 1.602×10⁻¹⁹ C."
        answer={
          <>
            <Formula>U = ½ C V² = ½ (1×10⁻⁴)(12)² = <strong>7.2×10⁻³ J ≈ 7.2 mJ</strong></Formula>
            <p>
              And the charge separation:
            </p>
            <Formula>Q = C V = (100×10⁻⁶)(12) = 1.2×10⁻³ C = 1.2 mC</Formula>
            <Formula>N = Q / e = 1.2×10⁻³ / 1.602×10⁻¹⁹ ≈ <strong>7.5×10¹⁵ electrons</strong></Formula>
            <p>
              About seven quadrillion electrons swapped sides — large in count, tiny in mass, and the 7 mJ they represent
              is enough to make a satisfying spark across a screwdriver if you discharge the cap directly<Cite id="codata-2018" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2>Charging through a resistor — the RC curve</h2>

      <p>
        Connect a capacitor in series with a resistor R to a battery of voltage V₀, and close the switch. The result is the canonical <Term def="A capacitor and resistor in series, the simplest first-order linear circuit. Its time response is governed by the time constant τ = RC.">RC circuit</Term>. The capacitor starts
        empty (V_C = 0) and the full battery voltage initially appears across the resistor, driving a current I = V₀/R. As
        charge accumulates on the cap, V_C rises and the voltage across the resistor — V₀ − V_C — falls. The current falls
        with it. Kirchhoff plus Q = CV gives a first-order ODE whose solution is the canonical exponential approach
        <Cite id="horowitz-hill-2015" in={SOURCES} />:
      </p>
      <Formula>V<sub>C</sub>(t) = V<sub>0</sub> (1 − e<sup>−t/RC</sup>)</Formula>
      <p>
        where <strong>V<sub>C</sub>(t)</strong> is the voltage across the capacitor as a function of time (in volts),
        <strong> V<sub>0</sub></strong> is the (constant) source/battery voltage (in volts), <strong>t</strong> is time
        elapsed since the switch closed (in seconds), <strong>R</strong> is the series resistance (in ohms), and
        <strong> C</strong> is the capacitance (in farads). The product <strong>RC</strong> has units of seconds and sets
        the timescale of the exponential approach.
      </p>

      <ChargingCurveDemo />

      <TryIt
        tag="Try 5.4"
        question={<>An RC circuit has R = 10 kΩ and C = 100 µF. What is the time constant τ? Roughly how long to charge to 99% of the supply voltage?</>}
        hint="τ = RC. 'Effectively done' is conventionally 5τ (99.3%)."
        answer={
          <>
            <Formula>τ = R C = (1×10⁴ Ω)(1×10⁻⁴ F) = <strong>1 s</strong></Formula>
            <p>
              After one time constant the cap reaches 1 − 1/e ≈ 63.2% of V₀. After 5τ it reaches 99.3%, the standard
              engineering threshold for &ldquo;fully charged&rdquo;<Cite id="horowitz-hill-2015" in={SOURCES} />.
            </p>
            <Formula>5τ = <strong>5 s</strong> &nbsp; (to reach ≈ 99% of V₀)</Formula>
          </>
        }
      />

      <p>
        The product <strong>τ = RC</strong> is the <Term def="τ = RC. The characteristic time for an RC circuit to respond — V_C reaches (1 − 1/e) ≈ 63% of its final value in one τ, and 99.3% by 5τ.">time constant</Term> — the time for V_C to reach (1 − 1/e) ≈ 63% of V₀.
        After 5τ, the capacitor is at 99.3% of V₀ and is effectively "done" charging for most engineering purposes. The
        same τ governs the discharge curve (with the sign of the exponent flipped), the response of any first-order linear
        filter, and the small-signal time response of every analog-electronics building block.
      </p>
      <p>
        Practical aside: τ doesn't care whether R or C is the "big" one — it depends only on their product. A 1 MΩ
        resistor with a 1 µF cap and a 1 kΩ resistor with a 1 mF cap both have τ = 1 second. The shape of the curve is
        invariant; only the timescale changes. That timescale is the heartbeat of every analog filter, every blinker, every
        sample-and-hold circuit on Earth.
      </p>

      <h2>From Leyden jars to your phone</h2>

      <p>
        The first capacitor — a <Term def="The first practical capacitor (1745–1746). A glass jar lined inside and outside with metal foil, the glass acting as a dielectric between two effective 'plates.' Named after Leiden, where Pieter van Musschenbroek's painful version of it was famous.">Leyden jar</Term> — was an accident. In October 1745, the German cleric Ewald Georg von Kleist tried to draw a spark
        from a nail driven into a small medicine bottle; the next year, independently, the Dutch professor Pieter van
        Musschenbroek and his student in Leiden held a glass jar of water connected to a charged friction generator and got a
        shock so violent that Musschenbroek wrote to his friend Réaumur that he "would not take a second [shock] for the
        kingdom of France"<Cite id="leyden-jar-1745" in={SOURCES} />. The glass was the dielectric; the water and the
        experimenter's hand were the two plates. It was the first practical capacitor, and the first time anyone had
        successfully stored static electricity for later release.
      </p>

      <LeydenJarReplayDemo />

      <p>
        Volta named the property in 1782<Cite id="volta-1782" in={SOURCES} />. A century of refinement turned the leaky
        glass jar into the wax-paper capacitors of the radio era, then the polyester and ceramic capacitors of the transistor
        age, then the multi-layer ceramic chip capacitors of today — which fit 1 µF into a package about 0.4 mm on a side, by
        stacking dozens of thin metallised dielectric layers in parallel<Cite id="horowitz-hill-2015" in={SOURCES} />. At the
        other extreme, electrochemical <Term def="A capacitor whose effective plates are the metal-electrolyte interfaces inside porous carbon electrodes. Effective surface area is square kilometres per gram and the effective gap is the Debye length; the device reaches thousands of farads per cell at a few volts working voltage.">supercapacitor</Term>s exploit double-layer effects at the surface of porous electrodes to
        reach hundreds of farads — at the cost of a low working voltage of a few volts per cell. We'll get to those families
        in Chapter 12.
      </p>

      <h2>What we have so far</h2>

      <p>
        A capacitor is two conductors separated by an insulator. Push charge onto one and induce an equal and opposite charge
        on the other; the gap fills with a uniform field. The voltage rises linearly with the charge; the energy stored rises
        quadratically. That energy is not on the plates — it lives in the field in the gap. Hook the cap up through a
        resistor and the charging curve is an exponential approach with time constant τ = RC. The whole device is set by
        geometry and material: <InlineMath>C = ε₀ ε<sub>r</sub> A / d</InlineMath>.
      </p>
      <p>
        Next chapter: the rotational half of the story. Currents — moving charges — make magnetic fields, and the magnetic
        field will turn out to be electricity viewed from a moving frame. The plates and the gap will reappear later when
        we ask where the energy actually <em>flows</em> as a capacitor charges (Chapter 7), and again as one of the two
        reactive ingredients in every AC circuit (Chapter 11).
      </p>

      <CaseStudies
        intro={
          <>
            Four places where the bottom-layer story of stored charge — linear V, quadratic U,
            field in the gap, time constant RC — shows up at full scale, from cardiology to the
            chip on your finger.
          </>
        }
      >
        <CaseStudy
          tag="Case 4.1"
          title="Defibrillator: a lethal amount of stored energy, on purpose"
          summary="A clinical defibrillator dumps a few hundred joules through the chest in tens of milliseconds, sourced from a single capacitor."
          specs={[
            { label: 'Typical stored energy (adult dose)', value: <>~150–360 J <Cite id="horowitz-hill-2015" in={SOURCES} /></> },
            { label: 'Typical capacitor', value: <>~100–200 µF <Cite id="horowitz-hill-2015" in={SOURCES} /></> },
            { label: 'Peak voltage', value: <>~2 kV <Cite id="horowitz-hill-2015" in={SOURCES} /></> },
            { label: 'Discharge time', value: <>~5–20 ms (transthoracic impedance ~50 Ω)</> },
          ]}
        >
          <p>
            A clinical defibrillator is a capacitor with a job. Charge a high-voltage cap of roughly
            <strong> 150 µF</strong> to roughly <strong>2 kV</strong> and you have stored
            <strong> ½ C V² ≈ 300 J</strong> of energy — the order of a joule per kilogram of patient mass, enough to
            depolarise the heart muscle and reset its rhythm<Cite id="horowitz-hill-2015" in={SOURCES} />. Connect the
            terminals through the chest, whose transthoracic impedance is around <strong>50 Ω</strong>, and the discharge
            time constant <strong>τ = RC ≈ 7 ms</strong> is short enough to deliver the energy in a single biphasic pulse.
          </p>
          <p>
            Every piece of this chapter is in that device. The energy is sourced from a step-up charging circuit and
            <em> stored in the field</em> between the capacitor's plates; the discharge is governed by an RC time constant;
            the current peak and pulse shape are first-order linear circuit theory. The clinical balance is also a clean
            illustration of why ½CV² and not CV is the relevant figure — half the energy delivered comes out of the
            shrinking field as the cap drains, not from the (already-fixed) initial charge.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 4.2"
          title="Capacitive touchscreens: counting picofarads with your fingertip"
          summary="The grid under the glass is thousands of tiny capacitors; your finger changes a few of them by a few pF."
          specs={[
            { label: 'Per-cell baseline capacitance', value: <>~1–5 pF</> },
            { label: 'Finger-induced change', value: <>~0.1–1 pF <Cite id="horowitz-hill-2015" in={SOURCES} /></> },
            { label: 'Scan rate', value: <>~60–240 Hz typical</> },
            { label: 'Underlying physics', value: <>change in fringing-field εᵣ as a conductor approaches</> },
          ]}
        >
          <p>
            Capacitive touch screens are an industrial-scale exercise in measuring tiny capacitance changes. Beneath the
            glass is a grid of transparent ITO electrodes patterned as row drivers and column receivers. The native
            capacitance between any row and column is a few picofarads, formed almost entirely by fringing fields that
            sneak through the glass and into the air just above it.
          </p>
          <p>
            A finger, which is a conductor sitting roughly at body potential, terminates some of those fringing field lines
            to ground. The mutual capacitance between the row and column under the finger drops by a fraction of a
            picofarad — small, but easily measurable with switched-capacitor circuitry running at kilohertz scan
            rates<Cite id="horowitz-hill-2015" in={SOURCES} />. The whole grid is read out tens of times per second to
            produce a coarse 2D image of "where the fingers are."
          </p>
          <p>
            The single underlying fact is the geometry rule <strong>C = ε₀ εᵣ A / d</strong>: change the geometry, change the
            capacitance. A finger near the glass is a new conductor cutting into the field's geometry. The capacitor doesn't
            care that the change came from a person; it just reports a new C.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 4.3"
          title="Supercapacitors in regenerative braking"
          summary="Banks of thousand-farad cells absorb a bus's kinetic energy in seconds and dump it back in seconds."
          specs={[
            { label: 'Per-cell capacitance', value: <>~1000–3000 F</> },
            { label: 'Per-cell working voltage', value: <>~2.5–2.7 V</> },
            { label: 'Per-cell stored energy at 2.7 V (3000 F)', value: <>~10.9 kJ  =  ½·3000·2.7²</> },
            { label: 'Charge / discharge time', value: <>seconds (vs. minutes–hours for chemistry batteries)</> },
          ]}
        >
          <p>
            Pure electrochemical supercapacitors store charge in the "electric double layer" that forms at the boundary
            between a porous electrode and a liquid electrolyte. The effective plate area is enormous — square kilometers
            per gram of activated carbon — and the effective gap d is the Debye length of the electrolyte, a nanometer or
            so. Putting both into <strong>C = ε₀ εᵣ A / d</strong> gives capacitances in the thousands of farads per
            cell<Cite id="horowitz-hill-2015" in={SOURCES} />.
          </p>
          <p>
            The penalty is voltage. The double layer breaks down at a few volts per cell, so a 750 V traction bank needs
            hundreds of cells in series. The reward is power density: a supercapacitor can absorb a bus's full braking
            energy in seconds without overheating, then dump it back into the drive motor on the next acceleration. They
            are not a battery replacement (energy density is ~10× lower than lithium-ion) but a complement — short bursts,
            high cycle count, very low ESR.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 4.4"
          title="Camera flash: slow charge, fast dump"
          summary="A small electrolytic capacitor trickles up to a few hundred volts over seconds, then unloads in a millisecond."
          specs={[
            { label: 'Typical flash cap', value: <>~100–200 µF, ~330 V electrolytic</> },
            { label: 'Stored energy (150 µF at 330 V)', value: <>~8 J  =  ½·150e-6·330²</> },
            { label: 'Charge time from 3 V battery', value: <>~3–5 s through a step-up converter</> },
            { label: 'Discharge time into xenon tube', value: <>~0.5–2 ms</> },
          ]}
        >
          <p>
            A consumer camera flash is the cleanest possible "capacitor stores energy on a long timescale, releases it on a
            short timescale" pedagogical example. A 3 V lithium cell can't directly light a xenon discharge tube — the
            tube needs a few hundred volts to break down its gas. So the camera contains a small step-up converter that
            slowly trickles charge into a <strong>~150 µF</strong> electrolytic capacitor over several seconds, building it
            up to roughly <strong>330 V</strong>. The cap then holds <strong>½ CV² ≈ 8 J</strong> in its field.
          </p>
          <p>
            When you press the shutter, a small trigger transformer ionises the xenon tube, the cap dumps its energy into
            the now-conducting plasma in about a millisecond, and the photographer sees a brief but very bright flash.
            The same energy delivered over the original five-second charge time would be a barely perceptible glow;
            compressing it into 1 ms multiplies the instantaneous power by a factor of ~5000. The capacitor is a
            timescale-converter.
          </p>
        </CaseStudy>
      </CaseStudies>

      <FAQ
        intro="Loose threads from the chapter — the questions a careful reader tends to surface."
      >
        <FAQItem q="What does it mean to “store” charge if the total charge on a capacitor is zero?">
          <p>
            The capacitor's two plates always have net charges of <strong>+Q</strong> and <strong>−Q</strong>, summing
            to zero. What's stored is the <em>separation</em>: a configuration in which positive charge sits on one
            conductor and negative on another, with a field connecting them across the gap. The energy that this
            configuration represents lives in that field, not in the charges themselves<Cite id="feynman-II-2" in={SOURCES} />.
            Saying "stored charge" is loose shorthand for "stored charge separation" — the latter is what costs work to
            assemble and yields work when undone.
          </p>
        </FAQItem>

        <FAQItem q="Why does adding the N-th charge cost more work than the first?">
          <p>
            Because by the time you add the N-th charge there are already <strong>N−1</strong> like charges on the same
            plate (and N−1 opposite charges on the other), and the field they have already established opposes the new
            charge's motion across the gap. The first charge moved through nothing; the second moved against the field of
            one; the millionth moved against the field of nine hundred and ninety-nine thousand nine hundred and ninety-nine.
            The work cost is <strong>q·V</strong>, and <strong>V</strong> grows linearly with how many charges are
            already there<Cite id="griffiths-2017" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why is the stored energy ½CV², not CV²?">
          <p>
            Because the cost-per-charge grew linearly during the build-up, not flatly. If every charge had cost the
            <em> final</em> voltage V, the total work would be QV. Because the first charges paid almost nothing and the
            last charges paid V apiece, the average cost per coulomb was V/2 and the total work is Q·V/2 = ½CV². The
            factor of one half is the price of integrating against a linearly rising load<Cite id="griffiths-2017" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why does putting a dielectric in a capacitor increase its capacitance?">
          <p>
            Dielectric molecules polarise in the applied field: their electron clouds shift slightly opposite to the
            field, and the rotated dipoles set up a small counter-field that partially cancels the applied one. The net
            field in the gap drops by a factor εᵣ — the relative permittivity — for the same charge Q on the plates,
            which means V also drops by εᵣ, which means C = Q/V is multiplied by εᵣ<Cite id="jackson-1999" in={SOURCES} />.
            Water comes in around 80; some specialist ceramics push past 1000.
          </p>
        </FAQItem>

        <FAQItem q="Why does series-connecting capacitors decrease the total capacitance?">
          <p>
            In series, the same charge Q must sit on every cap (the wire between two caps is isolated, so what comes in
            must equal what goes out). The voltages add: V_total = V₁ + V₂ + … = Q/C₁ + Q/C₂ + …. So
            <strong> 1/C_total = 1/C₁ + 1/C₂ + …</strong>. Geometrically: stacking two identical caps in series is like
            doubling the gap d while keeping A fixed, which halves C<Cite id="horowitz-hill-2015" in={SOURCES} />. Parallel is
            the reverse — voltages match, charges add, so C_total = C₁ + C₂ + ….
          </p>
        </FAQItem>

        <FAQItem q="Can you charge a capacitor with zero resistance in the loop?">
          <p>
            Not in a useful way. With R = 0, τ = RC = 0 and the charging current's mathematical peak is infinite. In
            practice the loop always has some resistance — wire resistance, internal battery resistance, the capacitor's
            own equivalent series resistance — and the energy dissipated in that resistance, integrated over the
            charging transient, is exactly <em>½ CV²</em> regardless of the value of R<Cite id="horowitz-hill-2015" in={SOURCES} />.
            So the battery puts in CV² of energy total, half ends up in the cap as ½CV² and half gets burned as heat in R,
            no matter how small R is.
          </p>
        </FAQItem>

        <FAQItem q="Why is τ = RC and not R/C or R+C?">
          <p>
            Dimensional analysis answers this. Resistance is volts per amp = volts per coulomb-per-second. Capacitance
            is coulombs per volt. Multiply them: <strong>R·C</strong> has units of (V/(C/s))·(C/V) = <strong>seconds</strong>. Neither R/C nor
            R+C has units of time. More mechanically, the ODE
            <strong> dQ/dt = (V₀ − Q/C)/R</strong> rearranges to <strong>R·C · dQ/dt = (CV₀ − Q)</strong>, in which the
            coefficient on the time derivative is RC. So τ = RC falls straight out of the differential equation as the
            only timescale in the problem<Cite id="horowitz-hill-2015" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why does a capacitor block DC but pass AC?">
          <p>
            In steady-state DC the capacitor charges up to the source voltage and then no more current flows — the cap
            looks like an open circuit. For AC, the voltage is constantly reversing, the cap is always part-way through
            charging or discharging, and current flows continuously in and out. The impedance of an ideal capacitor is
            <strong> Z = 1/(jωC)</strong>: infinite at DC (ω = 0), small at high frequency<Cite id="horowitz-hill-2015" in={SOURCES} />.
            That's why caps appear as coupling and bypass elements throughout audio and RF — they pass the AC signal
            while blocking any DC bias on top of it.
          </p>
        </FAQItem>

        <FAQItem q="What's the difference between a capacitor and a battery?">
          <p>
            A capacitor stores energy in an electric field; a battery stores energy in chemical bonds. The capacitor's
            voltage falls linearly with charge as it discharges (V = Q/C); a battery's voltage stays roughly constant
            until its chemistry is nearly exhausted. The capacitor can charge and discharge in microseconds to seconds
            and survive millions of cycles; a battery is much slower and degrades in hundreds to a few thousand cycles.
            Energy density per kilogram: lithium-ion ~250 Wh/kg, even the best supercaps ~10 Wh/kg<Cite id="horowitz-hill-2015" in={SOURCES} />.
            Power density is the reverse — capacitors win there by an order of magnitude. They are complementary, not
            interchangeable.
          </p>
        </FAQItem>

        <FAQItem q="Why are electrolytic capacitors polarized?">
          <p>
            Aluminium electrolytic capacitors achieve their high capacitance per volume by growing an ultra-thin
            aluminium-oxide dielectric layer on the anode through electrochemistry. That oxide only forms — and only
            insulates — when the anode is held positive. Reverse the polarity and the chemistry runs backwards: the oxide
            dissolves, leakage current rises, gas builds up inside the can, and eventually the can ruptures (or
            explodes). Tantalum electrolytics behave similarly. Non-polar caps (ceramic, film) have a symmetric dielectric
            and can be wired either way<Cite id="horowitz-hill-2015" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What's ESR and why does it heat a capacitor up?">
          <p>
            ESR — equivalent series resistance — lumps together every resistive loss inside a real capacitor: the bulk
            resistance of the plate foils, the contact resistance to the leads, dielectric absorption losses, and (for
            electrolytics) the resistance of the wet paste. When current I flows through the cap, I²·ESR is dissipated
            as heat inside the can<Cite id="horowitz-hill-2015" in={SOURCES} />. High-ripple-current applications
            (switching power supplies, motor drives) push enough current through their caps that ESR-driven heating is
            often the dominant failure mechanism — the cap's electrolyte dries out, ESR rises further, and the
            failure runs away.
          </p>
        </FAQItem>

        <FAQItem q="Why do high-quality audio amplifiers use so many capacitors?">
          <p>
            Three jobs. (1) Coupling caps pass the AC signal between gain stages while blocking the DC bias each stage
            sits at. (2) Bypass caps short any AC noise on the supply rails to ground so the amplifier's gain stages see
            a clean DC supply. (3) Reservoir caps in the power-supply section smooth the rectified-mains AC ripple into
            something approximating DC<Cite id="horowitz-hill-2015" in={SOURCES} />. All three jobs are versions of the
            same physical fact: a cap stores enough energy in its field to bridge brief gaps in supply or signal current
            on the time scale set by RC.
          </p>
        </FAQItem>

        <FAQItem q="What's a supercapacitor and how is it different from a regular capacitor?">
          <p>
            An electrochemical double-layer supercapacitor stores charge in the few-Ångström-wide layer of electrolyte
            ions that crowd up against a charged porous electrode. The "plates" are the metal-electrolyte interface; the
            "gap" is the Debye length of the electrolyte, a nanometer or less; and the effective area is the internal
            surface area of activated carbon, hundreds of m² per gram. The geometry rule <strong>C = ε₀ εᵣ A / d</strong> then
            gives capacitances in the thousands of farads per cell. The penalty is the breakdown voltage of the
            electrolyte (~2.7 V per cell), so high-voltage supercap banks need many cells in series<Cite id="horowitz-hill-2015" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why does a capacitor explode if you reverse-bias an electrolytic?">
          <p>
            Because the dielectric — that thin grown oxide layer — is itself maintained electrochemically by the
            correct polarity. Reverse the bias and the oxide begins to dissolve. Leakage current rises, which heats the
            electrolyte, which generates gas. The can's pressure relief vents (the X-shaped score on the top of a
            modern electrolytic) are designed to release the gas without shrapnel — but the can still ruptures and the
            cap is destroyed. Always observe the polarity marking on an electrolytic<Cite id="horowitz-hill-2015" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why do some capacitors fail just because they're old?">
          <p>
            The wet electrolyte in an aluminium electrolytic capacitor slowly evaporates through its rubber end-seal,
            and the rate of loss roughly doubles for every 10 °C rise in operating temperature. As the electrolyte
            dries out, ESR rises and capacitance drops; eventually the cap can no longer do its job in a power supply
            or audio stage, and the equipment fails — usually with a faint hum, a swollen capacitor can, or a brown
            stain on the PCB<Cite id="horowitz-hill-2015" in={SOURCES} />. Solid-electrolyte and film capacitors don't
            suffer this particular failure mode and last much longer.
          </p>
        </FAQItem>

        <FAQItem q="How does a touchscreen actually detect a finger?">
          <p>
            Underneath the glass is a grid of transparent indium-tin-oxide electrodes patterned as drive lines and sense
            lines. At each intersection, the two electrodes form a tiny mutual capacitance of a few picofarads, set
            mostly by the fringing field that bulges out above the glass. A grounded conductor (your finger) near a
            given intersection terminates some of that fringing field, reducing the mutual capacitance by a fraction of
            a pF. The touch controller sweeps the grid tens of times per second with switched-capacitor sensing, builds
            a heat-map of where the C-values dropped, and reports those locations as touch points<Cite id="horowitz-hill-2015" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What is the smallest possible capacitor? Could a single atom be one?">
          <p>
            In principle, anything with two conductors at different potentials is a capacitor — and even a single
            molecule has internal capacitance in the sense that you can write down its electric polarisability and read
            it as a tiny "self-capacitance." Practically, the smallest engineered capacitors are the gate capacitors of
            transistors on modern silicon chips: a few attofarads (10⁻¹⁸ F), with a gate oxide a couple of nanometers
            thick<Cite id="horowitz-hill-2015" in={SOURCES} />. Push much smaller and quantum effects (tunnelling
            through the oxide, single-electron charging energies) take over and the classical Q = CV picture breaks
            down. The parallel-plate idealisation has a floor, and we're already near it.
          </p>
        </FAQItem>
      </FAQ>
    </ChapterShell>
  );
}
