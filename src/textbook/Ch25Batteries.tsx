/**
 * Chapter 18 — How a battery works
 *
 * Chemistry that keeps a voltage on the wires. Volta's pile, the half-reaction
 * picture, the Daniell cell, standard electrode potentials and SHE, the Nernst
 * equation, and finally internal resistance and the loaded-discharge curve.
 *
 * Demos:
 *   18.1  Voltaic pile          (stacked Zn-Cu discs add to ~1.1 V each)
 *   18.2  Daniell cell          (Zn/ZnSO₄ // CuSO₄/Cu — 1.10 V at the terminals)
 *   18.3  Nernst equation       (V = V° − (RT/nF)·lnQ)
 *   18.4  Cell discharge        (V_term sags with R_int and falls as SOC ↓)
 *   18.5  Half-cell potentials  (pick anode + cathode; predict E°_cell)
 */
import { CaseStudies, CaseStudy } from '@/components/CaseStudy';
import { ChapterShell } from '@/components/ChapterShell';
import { FAQ, FAQItem } from '@/components/FAQ';
import { Cite } from '@/components/SourcesList';
import { Formula } from '@/components/Formula';
import { Pullout } from '@/components/Prose';
import { Term } from '@/components/Term';
import { TryIt } from '@/components/TryIt';
import { CellDischargeDemo } from './demos/CellDischarge';
import { DaniellCellDemo } from './demos/DaniellCell';
import { HalfCellPotentialsDemo } from './demos/HalfCellPotentials';
import { NernstEquationDemo } from './demos/NernstEquation';
import { VoltaicPileDemo } from './demos/VoltaicPile';
import { getChapter } from './data/chapters';

export default function Ch18Batteries() {
  const chapter = getChapter('batteries')!;
  const SOURCES = chapter.sources;

  return (
    <ChapterShell chapter={chapter}>
      <p>
        In the spring of 1800, a Pavia physics professor named Alessandro Volta packed a wooden crate, paid a courier,
        and shipped to Sir Joseph Banks at the Royal Society in London a description of an apparatus he had built on
        his lab bench. A short stack of discs: zinc, brine-soaked cardboard, copper, repeat, repeat, repeat. Touch the
        two ends with damp fingers and you got a tingling, sustained shock that lasted as long as you stayed in
        contact. Touch them with a pair of wires connected to a water bath and the water began to fizz with bubbles of
        hydrogen and oxygen<Cite id="volta-1800-pile" in={SOURCES} />.
      </p>
      <p>
        Friction generators and Leyden jars (Chapter 5) had already given Europe its electric circus tricks, but Volta's
        pile was different: it produced sustained current, not a one-time discharge. Within months experimentalists
        across the continent were splitting water, plating metals, and discovering chemical effects nobody had ever
        seen. The entire science of electrochemistry came out of that wooden crate. This chapter is about why the pile
        worked, what's actually going on inside any modern cell, and the small set of formulas — half-cell potentials,
        the Nernst equation, internal resistance — that predict how many volts a battery will sit at and how that
        voltage sags under load.
      </p>

      <h2>Volta's pile, 1800</h2>

      <p>
        The pile is the simplest battery anyone ever built. Take a disc of zinc, lay a piece of cardboard or felt
        soaked in salt water (the <Term def="The ion-conducting medium between the two electrodes. It must conduct ions (to complete the internal circuit) but not electrons (or the cell would short itself). Brine in Volta's pile; sulphuric acid in lead-acid; an organic carbonate solution in Li-ion.">electrolyte</Term>) on top of it, lay a disc of copper on top of that, and repeat the
        sequence twenty or thirty times. The top and bottom of the stack become the two electrical terminals. Between
        each adjacent Zn-Cu pair, a chemical reaction at the metal surfaces creates a small voltage difference; stacked
        in series, twenty pairs add to about <strong>22 V</strong> open-circuit<Cite id="volta-1800-pile" in={SOURCES} />.
        Connect a wire between top and bottom and current flows until either the zinc is consumed or the brine dries out.
      </p>

      <VoltaicPileDemo />

      <p>
        What was new was not the spark — friction generators had been giving people shocks for a century — but
        the <em>persistence</em>. The pile didn't have to be re-cranked between every shot. Whatever was happening
        inside it kept replenishing the voltage on the terminals as fast as a circuit drained it. Volta interpreted
        this as a "contact" property of dissimilar metals, and got the chemistry wrong on the details. But the device
        worked, and within a year of his letter to Banks, William Nicholson and Anthony Carlisle in London had used a
        pile to <Term def="The splitting of water (or any ionic compound) into its elements by passing a current through it. Demonstrated by Nicholson and Carlisle in 1800 using Volta's pile — the first chemical effect of sustained current ever observed.">electrolyse</Term> water — the first time anyone had used electricity to do chemistry on
        purpose<Cite id="bard-faulkner-2001" in={SOURCES} />.
      </p>

      <TryIt
        tag="Try 18.1"
        question={<>Volta's original pile had about 30 Zn–Cu pairs. What was its approximate open-circuit voltage?</>}
        hint="Each Zn-Cu pair gives roughly 1.1 V. Pairs in series add."
        answer={
          <>
            <Formula>V<sub>total</sub> = N · V<sub>pair</sub> = 30 · 1.10 V ≈ <strong>33 V</strong></Formula>
            <p>
              Enough to give you a memorable shock; enough to electrolyse water; enough that contemporary
              experimentalists kept blowing themselves backwards across the lab when they touched the terminals
              with damp hands<Cite id="volta-1800-pile" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2>The half-reaction story</h2>

      <p>
        Volta's contact theory was wrong: the voltage doesn't come from the metals touching each other, it comes from
        the metals touching the electrolyte. At each metal–electrolyte interface, a chemical reaction tries to run,
        and the reaction either deposits electrons on the metal (driving it negative) or pulls them off it (driving it
        positive). When the reaction at one electrode is paired with a different reaction at the other, the two
        electrodes sit at different potentials, and a battery exists<Cite id="bard-faulkner-2001" in={SOURCES} />.
      </p>
      <p>
        For Volta's Zn / brine / Cu cell the two reactions are:
      </p>
      <Formula>Zn → Zn²⁺ + 2e⁻  (at the zinc surface; <Term def="The electrode where oxidation happens — the metal gives up electrons. In a galvanic (battery) cell, this is the negative terminal. In an electrolytic cell, this is the positive terminal.">anode</Term>)</Formula>
      <Formula>2H⁺ + 2e⁻ → H₂  (at the copper surface; <Term def="The electrode where reduction happens — electrons are consumed. In a galvanic cell, this is the positive terminal. In an electrolytic cell, this is the negative terminal.">cathode</Term>)</Formula>
      <p>
        The zinc dissolves; it gives up its electrons to the wire and its Zn²⁺ cation to the brine. The electrons travel
        through the external wire (this is the current) and arrive at the copper electrode, where they reduce H⁺ ions
        coming out of the brine into bubbles of hydrogen gas. Net result: the wire passes current, the zinc shrinks,
        and hydrogen fizzes off the copper. The current can keep going as long as there is zinc left to dissolve and
        H⁺ in the electrolyte to reduce<Cite id="bard-faulkner-2001" in={SOURCES} />.
      </p>
      <p>
        The voltage that appears between the two electrodes is set entirely by the energy released per electron in
        going through the combined reaction. Different metal-electrolyte pairs release different amounts and sit at
        different voltages. We will tabulate them in a moment. The crucial point now: a battery is two reactions, not
        one — and they have to be reactions that <em>want</em> to swap electrons with each other through an external
        wire<Cite id="griffiths-2017" in={SOURCES} />.
      </p>

      <Pullout>
        A battery is two chemical reactions that happen to need each other's electrons.
      </Pullout>

      <h2>The Daniell cell</h2>

      <p>
        Volta's pile worked but was messy. The brine evaporated. The hydrogen bubbles at the copper surface formed an
        insulating film that raised internal resistance — a problem called <Term def="The build-up of a non-conducting layer (often hydrogen bubbles) at an electrode surface, raising internal resistance and dropping cell voltage. Plagued early voltaic cells until Daniell separated the two half-reactions.">polarization</Term>. The voltage drooped under
        load and the cell ran down within hours. Three decades later, in 1836, the British meteorologist John Frederic
        Daniell solved both problems by separating the two half-reactions into their own compartments<Cite id="daniell-1836" in={SOURCES} />.
      </p>
      <p>
        Daniell's idea: put the zinc anode in a solution of zinc sulphate (ZnSO₄), put a copper cathode in a solution
        of copper sulphate (CuSO₄), and connect the two solutions with a porous separator that lets sulphate ions
        through but resists bulk mixing. The reactions at each electrode are now:
      </p>
      <Formula>Zn → Zn²⁺ + 2e⁻  (anode)</Formula>
      <Formula>Cu²⁺ + 2e⁻ → Cu  (cathode)</Formula>
      <p>
        No more hydrogen bubbles. Instead, copper plates out as a solid metal onto the cathode while the anode zinc
        dissolves. The cell holds a remarkably stable <strong>≈ 1.10 V</strong> across the terminals for as long as
        either rod has material left, and was the workhorse battery of 19th-century telegraphy<Cite id="daniell-1836" in={SOURCES} />.
      </p>

      <DaniellCellDemo />

      <p>
        Notice what just happened. The Volta pile was a single integrated mess; the Daniell cell is a
        <em> two-compartment</em> design where each electrode sits in its own electrolyte and only ions cross between
        them. That separation is the architecture of every battery that came after. Lead-acid (next chapter) shares
        an electrolyte but separates the anode and cathode plates spatially; alkaline cells use a paste rather than a
        liquid; Li-ion (also next chapter) uses an organic liquid plus a permeable polymer membrane. They are all
        Daniell's cell with the chemistry swapped.
      </p>

      <TryIt
        tag="Try 18.2"
        question={<>A Daniell cell holds 1.10 V open-circuit and has internal resistance about 1 Ω. What's the short-circuit current?</>}
        hint="Short-circuit means R_load = 0, so I = V_OC / R_int."
        answer={
          <>
            <Formula>I<sub>sc</sub> = V<sub>OC</sub> / R<sub>int</sub> = 1.10 V / 1 Ω = <strong>1.10 A</strong></Formula>
            <p>
              Not enormous — which is exactly why telegraph circuits, which needed only milliamps to flick a relay,
              were perfectly happy with Daniell cells. Cranking a car engine would need cells with R_int of a few
              milliohms, not ohms; we'll get to lead-acid in Chapter 19<Cite id="bard-faulkner-2001" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2>Standard electrode potentials</h2>

      <p>
        Every half-reaction has an intrinsic "reaction tendency" that you can measure. By convention, chemists assign
        each reduction half-reaction a number called its <Term def="The voltage of a half-reaction measured against the standard hydrogen electrode (SHE = 0.00 V), with all species at 1 M concentration, 1 atm, 298 K. Tabulated for every common couple — the universal lookup table for battery chemistry.">standard reduction potential</Term> E°, expressed in volts
        relative to a universal reference called the <Term def="The reference electrode against which all other half-cell potentials are measured. Defined as 2H⁺ + 2e⁻ → H₂ with H⁺ at unit activity and H₂ at 1 atm, T = 298 K. Assigned E° = 0.00 V by convention.">standard hydrogen electrode (SHE)</Term>, which is itself assigned E° = 0.00 V<Cite id="bard-faulkner-2001" in={SOURCES} />.
        Anything with a positive E° relative to SHE is a stronger oxidizer than H⁺; anything negative is a stronger
        reducer than H₂.
      </p>
      <p>
        For our Cu/Zn cell:
      </p>
      <Formula>E°(Cu²⁺/Cu) = +0.34 V,   E°(Zn²⁺/Zn) = −0.76 V</Formula>
      <p>
        The cell voltage is the difference: <em>E°_cell = E°(cathode) − E°(anode)</em>. For Daniell:
        <strong> E°_cell = +0.34 − (−0.76) = +1.10 V</strong>, exactly what the voltmeter reads<Cite id="bard-faulkner-2001" in={SOURCES} />. This subtraction is how chemists predict whether a battery design will work and what voltage it will sit at,
        without doing any experiments. Pick any two half-cells from the table, subtract their E°s, and if the result is
        positive the cell runs spontaneously in that direction.
      </p>

      <HalfCellPotentialsDemo />

      <p>
        At the extremes: lithium metal has the most negative E° of any element in the periodic table (Li⁺ + e⁻ → Li
        sits at <strong>−3.04 V</strong>), making it the strongest practical reducing agent. Fluorine sits at
        <strong> +2.87 V</strong>, making F₂ the strongest practical oxidizer. A theoretical Li / F₂ cell would deliver
        about <strong>5.91 V</strong> per cell — about five times the voltage of Daniell. Nobody builds Li/F₂
        batteries because fluorine reacts with everything else in the cell and the engineering is impossible; but the
        thermodynamic prediction is what it is, and gives a hint why Li-based chemistries dominate modern energy
        storage (Chapter 19).
      </p>

      <TryIt
        tag="Try 18.3"
        question={<>What is the open-circuit voltage of a silver-zinc cell, given E°(Ag⁺/Ag) = +0.80 V and E°(Zn²⁺/Zn) = −0.76 V?</>}
        answer={
          <>
            <Formula>E°<sub>cell</sub> = E°<sub>cathode</sub> − E°<sub>anode</sub> = +0.80 − (−0.76) = <strong>+1.56 V</strong></Formula>
            <p>
              Silver-zinc cells were used in early hearing aids, watches, and some military applications because of
              their high voltage per cell and excellent energy density. They are still made for specialized photo and
              instrument batteries despite the cost of silver<Cite id="bard-faulkner-2001" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2>The Nernst equation</h2>

      <p>
        Standard electrode potentials assume "standard conditions" — every dissolved species at 1 mol/L concentration,
        every gas at 1 atm, temperature at 298 K. Real batteries don't operate at standard conditions. The concentrations
        of the active ions change as the cell discharges (Zn²⁺ builds up around the anode, Cu²⁺ depletes around the
        cathode), and the cell can be at any temperature from below freezing to above boiling. The Nernst equation
        gives the open-circuit voltage as a function of those conditions<Cite id="nernst-1889" in={SOURCES} />:
      </p>
      <Formula>V = V° − (RT / nF) · ln Q</Formula>
      <p>
        where <strong>V</strong> is the open-circuit cell voltage at the actual operating conditions (in volts),
        <strong> V°</strong> is the standard cell potential at 1 M concentrations, 1 atm, 298 K (in volts),
        <strong> R</strong> is the universal gas constant 8.314 J/(mol·K),
        <strong> T</strong> is the absolute temperature (in kelvins),
        <strong> n</strong> is the number of electrons transferred per reaction event (dimensionless integer),
        <strong> F</strong> is the Faraday constant ≈ 96 485 C/mol (the charge of one mole of electrons), and
        <strong> Q</strong> is the dimensionless reaction quotient — the ratio of product activities to reactant
        activities at the moment of measurement<Cite id="codata-2018" in={SOURCES} />.
      </p>
      <p>
        The log is not arbitrary. The chemical potential of a dilute species scales as <em>kT ln c</em> — a direct
        consequence of the Boltzmann factor governing how molecules populate energy levels at temperature T. Halve a
        reactant's concentration and its free energy per particle drops by <em>kT ln 2</em>; the cell voltage, which is
        free energy divided by the charge per electron, shifts by the same amount divided by <em>nF</em>. So a tenfold
        concentration change moves V by exactly <em>(RT/nF) ln 10</em>, the famous 59 mV per decade at room temperature
        for a one-electron reaction. The <em>nF</em> in the denominator is just the unit-conversion: <em>n</em>
        electrons transferred per reaction event, <em>F</em> coulombs per mole of electrons<Cite id="nernst-1889" in={SOURCES} />.
      </p>
      <p>
        Here R is the gas constant (8.314 J/mol·K), T is absolute temperature, n is the number of electrons transferred
        per reaction event, F is the <Term def="The total charge of one mole of electrons: F = N_A · e ≈ 96 485 C/mol. The unit-conversion constant that takes you from chemistry's 'moles of electrons' to physics's 'coulombs of charge.'">Faraday constant</Term> (the charge per mole of electrons, ≈ 96 485 C/mol)<Cite id="codata-2018" in={SOURCES} />, and <strong>Q</strong> is the <em>reaction quotient</em> — the ratio of product concentrations to reactant
        concentrations. For the Daniell cell:
      </p>
      <Formula>Q = [Zn²⁺] / [Cu²⁺]</Formula>
      <p>
        At T = 298 K and n = 2, the prefactor RT/nF works out to about <strong>12.8 mV</strong> per natural-log unit
        of Q, or <strong>29.6 mV</strong> per factor of 10 change in concentration ratio. So pump the Zn²⁺ side ten
        times more concentrated than the Cu²⁺ side and the cell loses about 30 mV; reverse it and you gain 30 mV.
        Small but real, and crucial for high-precision applications like pH probes and chemistry-lab reference
        electrodes<Cite id="bard-faulkner-2001" in={SOURCES} />.
      </p>

      <NernstEquationDemo />

      <p>
        Walther Nernst published this equation in 1889; it earned him the 1920 Nobel Prize in Chemistry. It is the
        single most useful equation in practical electrochemistry. The Nernst equation tells you why a fresh alkaline
        cell reads 1.6 V open-circuit while a "dead" one still reads 1.2 V — the chemistry isn't gone, just
        non-standard. It tells you how a pH meter works: a pH-sensitive membrane sits between a sample of unknown H⁺
        concentration and a reference of known concentration, and the Nernst equation converts the voltage difference
        directly into a pH reading. It tells you why batteries that have been sitting on the shelf for years still
        give close to nameplate voltage at light loads.
      </p>

      <TryIt
        tag="Try 18.4"
        question={<>A Daniell cell has [Zn²⁺] = 0.01 M and [Cu²⁺] = 1 M, T = 298 K. What is its open-circuit voltage?</>}
        hint="V = V° − (RT/nF) ln Q with Q = [Zn²⁺]/[Cu²⁺]."
        answer={
          <>
            <p>
              Q = 0.01 / 1 = 0.01, so ln Q = −4.605.
              RT/nF at 298 K with n = 2 is (8.314 · 298) / (2 · 96485) ≈ <strong>0.01285 V</strong>.
            </p>
            <Formula>V = 1.10 − (0.01285)(−4.605) ≈ 1.10 + 0.059 ≈ <strong>1.16 V</strong></Formula>
            <p>
              Diluting the Zn²⁺ side adds about 60 mV — the cell hasn't done any work, the ion ratio has just been
              shifted in its favour<Cite id="nernst-1889" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2>Internal resistance and the discharge curve</h2>

      <p>
        No real battery is an ideal voltage source. Connect a load and the voltage at the terminals drops below the
        open-circuit value. The drop is the <Term def="The IR drop inside a battery that subtracts from the open-circuit voltage when current flows. Combines the bulk electrolyte resistance, the electrode kinetic overpotential, and the contact resistance at the terminals. Rises as the cell ages or discharges.">internal resistance</Term> at work: the cell behaves like an
        ideal source V_OC in series with a resistor R_int, and the loaded terminal voltage is
      </p>
      <Formula>V<sub>term</sub> = V<sub>OC</sub> · R<sub>L</sub> / (R<sub>int</sub> + R<sub>L</sub>)</Formula>
      <p>
        where <strong>V<sub>term</sub></strong> is the loaded terminal voltage at the battery's posts (in volts),
        <strong> V<sub>OC</sub></strong> is the open-circuit (no-load) voltage set by the cell chemistry (in volts),
        <strong> R<sub>int</sub></strong> is the cell's effective internal resistance (in ohms), and
        <strong> R<sub>L</sub></strong> is the external load resistance (in ohms). The expression is just a voltage
        divider between R<sub>int</sub> and R<sub>L</sub>.
      </p>
      <p>
        R_int comes from three places: the bulk resistance of the electrolyte (limited ion mobility), the kinetic
        <Term def="The 'extra' voltage you need to apply beyond E° to make a reaction run at a useful rate. Governed by the Butler–Volmer equation; falls logarithmically with current density. The reason a fuel cell at open-circuit reads 1.0 V instead of the thermodynamic 1.23 V."> overpotential</Term> needed to drive the electrode reactions at a useful rate (Butler–Volmer kinetics), and the
        physical contact resistance at the terminals<Cite id="bard-faulkner-2001" in={SOURCES} />. A fresh AA alkaline
        cell has R_int around 100–300 mΩ; a car starter battery is a few milliohms (so it can deliver 400 A at 12 V);
        a small coin cell can be tens of ohms.
      </p>

      <CellDischargeDemo />

      <p>
        As the cell discharges, two things happen at once. The <Term def="The fraction of the battery's full charge remaining, usually expressed as 0–100% or 0–1. Read indirectly from terminal voltage (with corrections for load), coulomb-counting (integrate current), or impedance spectroscopy.">state of charge (SOC)</Term> falls, which means V_OC itself drifts down — Nernst predicts this: products build up, reactants deplete, Q rises, V drops. And the
        internal resistance climbs as electrolyte gets depleted of carriers near the electrodes and as discharge
        products accumulate on the plates (PbSO₄ on a lead-acid plate, for example, partially insulates the metal
        underneath). Both effects compound: the loaded terminal voltage falls faster than V_OC alone would predict.
        That's the classic <Term def="The plot of terminal voltage vs charge drawn (or vs time at constant current). For most cells: a flat plateau at the working voltage, then a sharp 'knee' at end of life where the chemistry collapses.">discharge curve</Term> — flat-ish plateau, then a sharp knee at end of life
        <Cite id="bard-faulkner-2001" in={SOURCES} />.
      </p>
      <p>
        Internal resistance is also what limits how much current you can draw. At short-circuit, I = V_OC / R_int. For
        a 9 V transistor battery (V_OC ≈ 9 V, R_int ≈ 35 Ω), that's about 0.25 A — enough to make a wire warm. For a
        car starter battery (V_OC ≈ 12.6 V, R_int ≈ 4 mΩ), it's about 3000 A — enough to weld through a dropped
        wrench. The chemistry sets the voltage; the geometry and the kinetics set the current<Cite id="bard-faulkner-2001" in={SOURCES} />.
      </p>

      <TryIt
        tag="Try 18.5"
        question={<>A AA alkaline cell has V_OC = 1.5 V and R_int = 200 mΩ. What terminal voltage does it produce driving a 1 Ω load?</>}
        hint="V_term = V_OC · R_L / (R_int + R_L)"
        answer={
          <>
            <Formula>V<sub>term</sub> = 1.5 · 1 / (0.2 + 1) = 1.5 · 0.833 ≈ <strong>1.25 V</strong></Formula>
            <Formula>I = V<sub>OC</sub> / (R<sub>int</sub> + R<sub>L</sub>) = 1.5 / 1.2 ≈ <strong>1.25 A</strong></Formula>
            <p>
              The 250 mV droop is the IR drop across the internal resistance; it dissipates inside the cell as heat —
              which is why a heavily loaded alkaline cell gets warm to the touch. Push the current too hard and the
              cell wastes more of its energy as internal heating than it delivers to the load<Cite id="bard-faulkner-2001" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2>What we have so far</h2>

      <p>
        Inside any battery: two electrodes, an electrolyte that conducts ions but not electrons, and two half-reactions
        whose energy difference shows up as a voltage between the terminals. Standard reduction potentials, tabulated
        against the hydrogen electrode, predict that voltage to within tens of millivolts before you build the cell.
        The Nernst equation corrects for non-standard concentrations and temperatures. Internal resistance (electrolyte
        conductivity + electrode kinetics + contact) drops the terminal voltage under load and limits the maximum
        current. The Daniell cell from 1836 is the canonical pattern; every modern chemistry is a variation on it.
      </p>
      <p>
        Next chapter: the modern chemistries themselves. Planté's lead-acid (still in every gasoline car), Whittingham–
        Goodenough–Yoshino's lithium-ion (in your phone, your laptop, and increasingly your car), supercapacitors,
        flow cells, and fuel cells. Same Daniell architecture, six radically different materials choices.
      </p>

      <CaseStudies
        intro="Four places where the half-reaction picture, the Nernst equation, and internal resistance show up in real-world batteries."
      >
        <CaseStudy
          tag="Case 18.1"
          title="9 V transistor radio battery (six 1.5 V cells in series)"
          summary="The classic. Six stacked alkaline Zn / MnO₂ cells in one rectangular package; ~500 mAh capacity, R_int around 35 Ω."
          specs={[
            { label: 'Open-circuit voltage', value: <>~9.0 V (six cells × 1.5 V) <Cite id="bard-faulkner-2001" in={SOURCES} /></> },
            { label: 'Capacity', value: <>~500 mAh <Cite id="bard-faulkner-2001" in={SOURCES} /></> },
            { label: 'Internal resistance', value: <>~35 Ω (sum of six cells)</> },
            { label: 'Chemistry', value: <>Zn anode / MnO₂ cathode in KOH electrolyte</> },
          ]}
        >
          <p>
            A 9 V transistor battery is just six alkaline cells stacked in series inside a steel can. Each cell is a
            zinc-powder anode and a manganese-dioxide cathode separated by a paper saturated with potassium hydroxide.
            The half-reactions:
          </p>
          <Formula>Zn + 2OH⁻ → Zn(OH)₂ + 2e⁻   (anode)</Formula>
          <Formula>2MnO₂ + 2H₂O + 2e⁻ → 2MnOOH + 2OH⁻   (cathode)</Formula>
          <p>
            Open-circuit voltage per cell is 1.5–1.65 V; six in series give the nominal 9 V the radio expects. The
            stack-in-series trick is the same as Volta's pile: an N-cell battery is N times the voltage of one cell.
          </p>
          <p>
            R_int is the limiting practical parameter. Each alkaline cell has R_int ~ 5–6 Ω, so six in series gives ~35 Ω.
            Short the terminals and you get about <strong>9 / 35 ≈ 0.26 A</strong>, dissipating ≈ 2.3 W inside the
            battery — enough to warm the casing but not enough to start a fire. The high R_int is why 9 V batteries
            are happy in low-current circuits (smoke detectors, small radios) but useless for anything that wants amps
            <Cite id="bard-faulkner-2001" in={SOURCES} />.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 18.2"
          title="AA alkaline cell (Zn / MnO₂)"
          summary="The workhorse single cell. 1.5 V open, ~2500 mAh capacity, 23 g mass. Powers most remote controls and toys on Earth."
          specs={[
            { label: 'Open-circuit voltage', value: <>~1.55 V (fresh)</> },
            { label: 'Capacity', value: <>~2500 mAh at 20 mA discharge <Cite id="bard-faulkner-2001" in={SOURCES} /></> },
            { label: 'Mass', value: <>~23 g</> },
            { label: 'Energy density', value: <>~150 Wh/kg <Cite id="bard-faulkner-2001" in={SOURCES} /></> },
            { label: 'R_int', value: <>~150–300 mΩ (fresh)</> },
          ]}
        >
          <p>
            A single AA cell is the modern descendant of the Daniell cell, with the chemistry swapped for what
            optimizes mass production: a zinc-powder anode (high surface area for low R_int), a manganese-dioxide
            cathode mixed with graphite for conductivity, and a potassium-hydroxide electrolyte gelled with starch so
            it can't leak out of the can. The chemistry was patented by Lewis Urry in 1957 at Eveready and has been
            the de-facto standard for primary cells ever since.
          </p>
          <p>
            The Nernst equation explains the voltage curve. A "fresh" cell reads 1.55–1.65 V open-circuit; a "dead" cell
            still reads 1.0–1.2 V because the reactants aren't quite gone, they're just at unfavourable concentrations.
            Battery testers don't measure capacity — they measure terminal voltage under a calibrated load, which probes
            both V_OC and R_int. As the cell ages, R_int climbs (zinc gets passivated by reaction products), so a
            heavily-loaded reading sags more than a lightly-loaded one. That's why "fresh" vs "weak" is a richer
            distinction than just "voltage"<Cite id="bard-faulkner-2001" in={SOURCES} />.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 18.3"
          title="Car starter battery (12 V lead-acid)"
          summary="Six 2 V cells in series; 50–100 Ah capacity; R_int of a few milliohms. Delivers ~400 A cranking current to a starter motor for a couple of seconds."
          specs={[
            { label: 'Terminal voltage', value: <>12.6 V (six 2.10 V cells)</> },
            { label: 'Cold cranking amps (CCA)', value: <>~400–800 A at −18 °C</> },
            { label: 'Capacity', value: <>50–100 Ah</> },
            { label: 'R_int', value: <>~3–8 mΩ (cold cranking)</> },
            { label: 'Energy density', value: <>~30–40 Wh/kg <Cite id="bard-faulkner-2001" in={SOURCES} /></> },
          ]}
        >
          <p>
            The starter battery in a gasoline car is six lead-acid cells in series. Each cell has Pb anode, PbO₂
            cathode, and dilute sulphuric acid as electrolyte. The half-reaction story is intricate (we'll do it in
            Chapter 19) but the cell voltage of <strong>~2.10 V</strong> is set by the standard potentials of the
            Pb/PbSO₄ and PbO₂/PbSO₄ couples.
          </p>
          <p>
            What distinguishes a starter battery is not its voltage or its capacity — both modest by modern standards —
            but its absurdly low internal resistance. Cranking a cold engine demands several hundred amps for one or
            two seconds. At I = 400 A and R_int = 5 mΩ, the IR drop inside the battery is <strong>2 V</strong>, so the
            terminal voltage during cranking sags from 12.6 V to ~10.6 V — exactly the &quot;voltage dip&quot; you can
            see on a car's voltmeter as the starter engages. The heat dissipated inside the battery during that
            cranking is <strong>I²R = 400² · 0.005 = 800 W</strong>, but only for a second or two, so the cell never
            gets dangerously hot<Cite id="bard-faulkner-2001" in={SOURCES} />. This is what lead-acid is built for: big
            current, briefly, then rest while the alternator recharges.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 18.4"
          title="Reference half-cell in an analytical chemistry lab"
          summary="A silver / silver-chloride electrode held at +0.197 V vs SHE is the bench-standard reference for measuring unknown half-cell potentials and ion concentrations via the Nernst equation."
          specs={[
            { label: 'Half-reaction', value: <>AgCl + e⁻ → Ag + Cl⁻</> },
            { label: 'E° vs SHE', value: <>+0.222 V at 25 °C (1 M Cl⁻) <Cite id="bard-faulkner-2001" in={SOURCES} /></> },
            { label: 'Practical V (sat. KCl)', value: <>+0.197 V vs SHE</> },
            { label: 'Drift', value: <>&lt; 1 mV / month with good handling</> },
          ]}
        >
          <p>
            The standard hydrogen electrode is universally agreed to be 0.00 V — but it is a pain to actually build (you
            need a constantly bubbling stream of pure hydrogen over a platinum-black-coated electrode in 1 M H⁺). For
            day-to-day work, every analytical chemist uses a more convenient secondary reference: most commonly an
            Ag/AgCl electrode, which is a silver wire coated in silver chloride, immersed in a saturated KCl
            solution. The cell potential is set by the well-characterized AgCl/Ag couple plus the (known, saturated)
            chloride activity, giving a stable <strong>+0.197 V</strong> vs SHE that holds for years if the electrode
            is kept moist<Cite id="bard-faulkner-2001" in={SOURCES} />.
          </p>
          <p>
            To measure an unknown's half-cell potential, you build a cell with the unknown on one side and the Ag/AgCl
            reference on the other, read the voltage on a high-impedance voltmeter, and add or subtract +0.197 V to
            convert to the SHE scale. The Nernst equation then converts that voltage into an ion concentration: every
            pH meter, every ion-selective electrode, every electrochemical sensor in a wastewater plant works exactly
            this way. The half-reaction picture isn't just textbook material — it is the operational principle of an
            entire industry of analytical instruments.
          </p>
        </CaseStudy>
      </CaseStudies>

      <FAQ intro="Loose threads from the chapter — the questions a careful reader tends to surface.">
        <FAQItem q="Why does the electrolyte conduct ions but not electrons?">
          <p>
            Because the charge carriers in solution are <em>ions</em> — atoms or molecules that have gained or lost
            one or more electrons and are surrounded by hydration shells. They move in response to electric fields but
            slowly: a few mm/s under a volt-per-cm field. There are essentially no free electrons in a salt solution
            at room temperature; the energy needed to liberate one is too high. So the electrolyte happily passes
            current via ion drift while completely blocking the electron flow that would short-circuit the cell
            internally<Cite id="bard-faulkner-2001" in={SOURCES} />. The two electrodes are the only places where
            charge crosses between the electron-conducting world (metal wires) and the ion-conducting world (the
            electrolyte) — that's why all the chemistry happens there.
          </p>
        </FAQItem>

        <FAQItem q="Why does a battery's voltage stay roughly constant during discharge, instead of falling linearly like a capacitor?">
          <p>
            Because a capacitor's voltage is V = Q/C — directly proportional to how much charge is left on the
            plates — while a battery's voltage is set by the thermodynamics of the half-reactions, which barely change
            as long as both reactants are still present in macroscopic amounts. The Nernst equation gives the
            concentration dependence, and ln Q is a very slow function: even a 10× depletion of reactant only shifts
            V by ~30 mV<Cite id="nernst-1889" in={SOURCES} />. So most of a battery's discharge curve is a nearly flat
            plateau, with a sharp knee at the end when one of the reactants finally runs out.
          </p>
        </FAQItem>

        <FAQItem q="What is a 'primary' battery vs a 'secondary' battery?">
          <p>
            A primary battery is single-use: once the chemistry runs forward, you can't run it back. Alkaline AA cells,
            lithium coin cells, the 9 V transistor radio battery — all primary. A secondary battery is rechargeable —
            applying a reverse voltage drives the discharge reaction backwards, restoring the reactants. Lead-acid,
            NiMH, and Li-ion are all secondary. The chemistry has to be reversible — both half-reactions must run
            cleanly in both directions without producing unwanted side products that block the electrodes
            <Cite id="bard-faulkner-2001" in={SOURCES} />. That reversibility constraint rules out most chemistries
            that would otherwise give very high cell voltages.
          </p>
        </FAQItem>

        <FAQItem q="Why is the standard hydrogen electrode chosen as the reference (and not something more convenient)?">
          <p>
            Convention. When 19th-century chemists started tabulating half-cell potentials, they needed a reference
            that everybody could reproduce in their own lab, was conceptually clean, and didn't depend on any other
            arbitrary choice. The reaction <em>2H⁺ + 2e⁻ → H₂</em> with all species at unit activity met those
            criteria: just platinum-coated platinum in 1 M strong acid, with hydrogen bubbled over it at 1 atm. SHE
            potentials are independent of any acid identity (HCl vs H₂SO₄ etc.) because the only relevant species is
            H⁺ at unit activity<Cite id="bard-faulkner-2001" in={SOURCES} />. It is awkward to actually build, which is
            why working labs use secondary references like Ag/AgCl — but the SHE remains the official zero of the
            potential scale by international agreement.
          </p>
        </FAQItem>

        <FAQItem q="Why is the Daniell cell historically important?">
          <p>
            Three reasons. (1) It was the first battery with a stable, predictable voltage — Daniell separated the two
            half-reactions and stopped the hydrogen polarization that plagued Volta's pile. (2) It made long-distance
            telegraphy practical; for decades, every telegraph office in Britain ran on Daniell cells
            <Cite id="daniell-1836" in={SOURCES} />. (3) It is the conceptual template for every battery since — two
            separated half-reactions connected through an ion-permeable barrier and an external wire. The Daniell
            cell is the textbook battery; everything else, from lead-acid to Li-ion to fuel cells, is the Daniell
            cell with different materials.
          </p>
        </FAQItem>

        <FAQItem q="What does the Faraday constant mean physically?">
          <p>
            F = 96 485 C/mol is the total electric charge of one mole of electrons. Avogadro's number of electrons,
            each carrying the elementary charge e = 1.602×10⁻¹⁹ C, multiplied out:
            <strong> F = N_A · e ≈ 6.022×10²³ · 1.602×10⁻¹⁹ ≈ 96 485 C/mol</strong><Cite id="codata-2018" in={SOURCES} />.
            It is the unit-conversion constant that takes chemistry's natural unit (moles of electrons in a reaction)
            into physics's natural unit (coulombs of charge through a wire). Every time you compute the capacity of a
            battery from its chemistry, F is what bridges the two pictures.
          </p>
        </FAQItem>

        <FAQItem q="Why does cold weather make car batteries weak?">
          <p>
            Two reasons. (1) The chemistry slows down: ion mobility in the sulphuric-acid electrolyte drops sharply
            with temperature, and the electrode kinetics (overpotentials) get worse, both of which raise R_int.
            A starter battery's R_int at −20 °C can be 2–3× its room-temperature value. (2) The available capacity also
            drops, because the rate of the discharge reaction at the plate surfaces is temperature-limited and you
            can't extract energy as fast as you can at room temperature. The combination means a battery that easily
            cranks an engine at 20 °C may not at −30 °C<Cite id="bard-faulkner-2001" in={SOURCES} />. That's why
            cold-cranking amp (CCA) ratings on starter batteries are specified at a defined low temperature.
          </p>
        </FAQItem>

        <FAQItem q="Can you build a battery without a metal electrode?">
          <p>
            Yes — and many modern batteries do exactly that. The Li-ion graphite anode, for example, is not lithium
            metal; it is a carbon host into which Li⁺ ions slide between the graphite layers. The active species
            (lithium) participates in the reaction without ever being a freestanding metal at the anode. Fuel cells
            (Ch. 19) use porous platinum-on-carbon electrodes where the platinum is just a catalyst — the actual
            half-reaction is H₂ → 2H⁺ + 2e⁻ on the surface, with the platinum providing the kinetics. So &quot;metal
            anode&quot; is a useful first picture but not a fundamental requirement<Cite id="bard-faulkner-2001" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why is energy density so much smaller for batteries than for fuels like gasoline?">
          <p>
            Because a battery has to carry both the reactants <em>and</em> the products of its reaction, while a fuel
            (gasoline, propane) gets one reactant — oxygen — for free out of the atmosphere. Worse, the cell needs
            inactive supporting material: current collectors, separators, electrolyte, case, terminals. Even the best
            Li-ion cells store ~250 Wh/kg; gasoline holds ~12 000 Wh/kg of chemical energy, of which ~3000 Wh/kg comes
            out as useful work after engine inefficiency. Batteries close the gap somewhat at vehicle-system level
            (electric drivetrains are ~3× more efficient than internal combustion), but the underlying
            energy-density gap is enormous and physical, not just engineering<Cite id="bard-faulkner-2001" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What is electrode polarization and why is it a problem?">
          <p>
            Polarization is the build-up of reaction products (or bubbles, or depleted reactant zones) at an electrode
            surface that raises its effective overpotential and the cell's internal resistance. Volta's original pile
            polarized severely because hydrogen bubbles accumulated on the copper cathode and partly insulated it from
            the electrolyte — every dozen seconds you had to mechanically wipe the bubbles off to restore the
            voltage<Cite id="bard-faulkner-2001" in={SOURCES} />. Daniell's cell defeated polarization by using a
            separate copper-sulphate compartment so the cathode reaction deposited copper (a metal that doesn't
            insulate) rather than producing gas. Modern cells use porous electrodes, electrolyte additives, and stirring
            (or convection) to avoid polarization build-up.
          </p>
        </FAQItem>

        <FAQItem q="Why does my multimeter only show open-circuit voltage on a fresh battery?">
          <p>
            Because a multimeter's voltage probe has very high input impedance — typically 10 MΩ — so the current it
            draws is microamps at most. The IR drop across the battery's internal resistance is negligible at that
            current (<em>I · R_int ≈ 1 µA · 1 Ω = 1 µV</em>), and the meter reads essentially V_OC. To distinguish a
            fresh from a tired battery you have to apply a real load (50–500 mA depending on cell type) and read the
            terminal voltage under load — that's what a proper battery tester does<Cite id="bard-faulkner-2001" in={SOURCES} />.
            A tired battery still shows close to full V_OC; it just has a much higher R_int and sags hard under load.
          </p>
        </FAQItem>

        <FAQItem q="What sets the maximum theoretical voltage of a chemical cell?">
          <p>
            The most negative half-cell potential (lithium metal, at −3.04 V vs SHE) paired with the most positive
            (fluorine gas, at +2.87 V vs SHE) gives a thermodynamic <strong>5.91 V</strong> per cell. Nobody builds Li/F₂
            batteries because fluorine reacts with literally every solvent and container material you might pick. The
            practical ceiling is set by what materials can coexist long enough to assemble a cell. Modern Li-ion
            chemistries reach 3.0–4.2 V; specialised primary lithium cells (Li/SOCl₂) push 3.6 V; the upper bound for
            stable aqueous chemistries is ~2 V (above which water electrolyses)<Cite id="bard-faulkner-2001" in={SOURCES} />.
            Beyond that, you're in the world of organic non-aqueous electrolytes and the engineering gets hard.
          </p>
        </FAQItem>

        <FAQItem q="Why does a battery have a positive and negative terminal even before you hook anything up?">
          <p>
            Because the two half-reactions inside the cell, given the choice, run spontaneously in one direction —
            metal A wants to give up electrons to the wire, metal B wants to absorb them. The terminals sit at whatever
            potential difference makes that exchange thermodynamically null at the open-circuit condition. The
            difference is V_OC, with the (+) terminal more positive because its electrode is the one that wants
            electrons<Cite id="bard-faulkner-2001" in={SOURCES} />. Open the circuit and no current flows, but the
            potential difference remains because the chemistry is still &quot;trying&quot; to react and the equilibrium it
            settles into pins the voltage.
          </p>
        </FAQItem>

        <FAQItem q="Why do batteries explode if you charge them backward?">
          <p>
            Because the reverse reaction isn't the same as the forward reaction. In a primary cell (alkaline, zinc-carbon,
            most lithium primaries) the chemistry was never designed to run backward; forcing it produces gas (hydrogen,
            oxygen, or worse), heat, and unstable intermediates. Pressure builds inside the can, the can ruptures, the
            electrolyte sprays. In a properly designed secondary cell (lead-acid, Li-ion) the chemistry is reversible
            so charging works — but charging too fast, or beyond the safe voltage, similarly produces gas or
            unstable intermediates and the same failure mode<Cite id="bard-faulkner-2001" in={SOURCES} />. Modern Li-ion
            packs have integrated protection circuits specifically because the failure modes are so energetic.
          </p>
        </FAQItem>

        <FAQItem q="How does a fuel cell differ from a battery?">
          <p>
            A fuel cell is a battery whose reactants are stored externally and supplied continuously, instead of being
            sealed inside the cell from the factory. A hydrogen-oxygen PEM fuel cell consumes H₂ from a tank and O₂
            from the air, and produces water; it has the same two-half-reaction architecture as a battery, but its
            capacity is set by the size of the fuel tank rather than the size of the electrodes. We'll dig into the
            physics next chapter; for now, the point is just that &quot;battery&quot; and &quot;fuel cell&quot; are
            two specializations of the same Daniell-cell idea, differing in whether the reactants live inside the cell
            or are fed in from outside<Cite id="bard-faulkner-2001" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why do batteries self-discharge even when nothing is connected?">
          <p>
            Because no electrolyte is perfectly insulating to electrons, no electrode reaction is perfectly clean, and
            no separator is perfectly impermeable. Slow side reactions consume reactants over time: dissolved metals
            migrate across the separator and short-circuit themselves internally, electrolyte additives slowly oxidize
            the anode, parasitic reactions at the cathode use up small amounts of capacity, and gas evolution
            occasionally pressurises the cell. Alkaline cells lose a few percent per year. NiMH cells lose 20–30% per
            month (a major reason for the &quot;low self-discharge&quot; NiMH variants). Li-ion cells lose ~3% per
            month<Cite id="bard-faulkner-2001" in={SOURCES} />. The chemistry determines the rate.
          </p>
        </FAQItem>
      </FAQ>
    </ChapterShell>
  );
}
