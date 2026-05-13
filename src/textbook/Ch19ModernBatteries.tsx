/**
 * Chapter 19 — Modern batteries
 *
 * From Planté lead-acid (1859) to lithium-ion (Whittingham 1976 → Goodenough
 * 1980 → Yoshino 1985 → Sony 1991) and the family that branched off it.
 * Plus the non-battery cousins: supercapacitors (Helmholtz double layer)
 * and fuel cells (continuous reactant supply).
 *
 * Demos:
 *   19.1  Lead-acid cell             (Planté, both plates → PbSO₄ on discharge)
 *   19.2  Li-ion intercalation       (Li⁺ shuttles between graphite and LiCoO₂)
 *   19.3  Chemistry comparison       (energy / cycle life / cost across families)
 *   19.4  Supercapacitor             (linear V-vs-Q ramp, not flat plateau)
 *   19.5  PEM fuel cell              (continuous H₂ + O₂ → H₂O with V(I) curve)
 */
import { CaseStudies, CaseStudy } from '@/components/CaseStudy';
import { ChapterShell } from '@/components/ChapterShell';
import { FAQ, FAQItem } from '@/components/FAQ';
import { Cite } from '@/components/SourcesList';
import { Formula, InlineMath } from '@/components/Formula';
import { Pullout } from '@/components/Prose';
import { Term } from '@/components/Term';
import { TryIt } from '@/components/TryIt';
import { ChemistryComparisonDemo } from './demos/ChemistryComparison';
import { FuelCellDemo } from './demos/FuelCell';
import { LeadAcidCellDemo } from './demos/LeadAcidCell';
import { LiIonIntercalationDemo } from './demos/LiIonIntercalation';
import { SupercapacitorDemo } from './demos/Supercapacitor';
import { getChapter } from './data/chapters';

export default function Ch19ModernBatteries() {
  const chapter = getChapter('modern-batteries')!;
  const SOURCES = chapter.sources;

  return (
    <ChapterShell chapter={chapter}>
      <p>
        Open the hood of a gasoline car built any time in the last hundred and sixty years and you find the same
        chemistry: lead plates in dilute sulphuric acid, six cells stacked to twelve volts, a thick cable to the
        starter motor. Open the back of the phone in your pocket and you find an entirely different chemistry:
        lithium ions shuttling between graphite and a lithium-cobalt-oxide host lattice through a flammable organic
        solvent. Open the fuel-cell stack on a Toyota Mirai and the chemistry has dispensed with stored reactants
        altogether: hydrogen comes from a 700-bar tank, oxygen comes from the air, the only product is water.
      </p>
      <p>
        Three radically different working systems, all heirs to Volta's pile. This chapter is a tour through the
        actual chemistries powering modern life: lead-acid (Planté 1859), nickel-based cells, the Whittingham–
        Goodenough–Yoshino lithium-ion revolution (Nobel 2019), and the non-battery cousins — supercapacitors and
        fuel cells — that share the same two-electrode architecture but lean differently on the trade-offs of
        energy, power, and refuelling.
      </p>

      <h2>Beyond Volta: the first rechargeable cell</h2>

      <p>
        Volta's pile and its descendants (Daniell, Leclanché, Weston) all had one limitation: once the chemistry ran
        forward, the cell was finished. The Frenchman Gaston Planté changed that in 1859 by building a cell whose
        reaction could be run backwards with an external power source. His apparatus was a strip of lead foil rolled
        into a spiral with a strip of cloth as separator, immersed in dilute sulphuric acid<Cite id="plante-1859" in={SOURCES} />. Run current through it one way and a layer of lead oxide grew on one plate; run it the other way
        and the layer was consumed back into the electrolyte while a fresh layer grew on the opposite plate. The
        cell could be repeatedly cycled — what we now call a <Term def="A battery whose chemistry is reversible, so applying an external voltage drives the discharge reaction backwards and restores the original reactants. Lead-acid (Planté 1859) was the first; NiMH, Li-ion, and most modern chemistries follow.">secondary</Term> (rechargeable) cell.
      </p>
      <p>
        Planté presented his apparatus to the Académie des Sciences in 1860 and the design diffused slowly through
        the next decades. By the 1880s, the &quot;lead-acid accumulator&quot; was a standard piece of laboratory
        equipment; by the 1890s, it was the energy buffer for the new arc-lamp street-lighting circuits and the early
        electric cars; by the 1920s, every gasoline car coming off Ford's assembly line carried one to spin its
        electric starter motor. Fifteen decades later, lead-acid is <em>still</em> the chemistry under the hood of
        every internal-combustion car on Earth — about a billion vehicles, hundreds of millions of cells produced
        per year. It is not the most energy-dense or the longest-cycle chemistry; it is the cheapest and most rugged
        for the specific job of cranking an engine and buffering an alternator<Cite id="bard-faulkner-2001" in={SOURCES} />.
      </p>

      <h2>Lead-acid</h2>

      <p>
        The lead-acid cell is unusual among rechargeables in that <em>both</em> electrodes are made of lead in
        different oxidation states, and <em>both</em> produce the same discharge product. The anode is metallic lead
        (oxidation state 0), the cathode is lead dioxide PbO₂ (oxidation state +4), and the electrolyte is dilute
        H₂SO₄. On discharge, both plates pick up sulphate ions to form lead sulphate PbSO₄ (oxidation state +2)
        <Cite id="bard-faulkner-2001" in={SOURCES} />:
      </p>
      <Formula>Pb + HSO₄⁻ → PbSO₄ + H⁺ + 2e⁻   (anode)</Formula>
      <Formula>PbO₂ + 3H⁺ + HSO₄⁻ + 2e⁻ → PbSO₄ + 2H₂O   (cathode)</Formula>
      <p>
        Summed: <strong>Pb + PbO₂ + 2 H₂SO₄ → 2 PbSO₄ + 2 H₂O</strong>. The acid gets diluted as discharge progresses
        — its specific gravity drops from about 1.27 (fully charged) to 1.10 (fully discharged). For decades, mechanics
        measured the state of charge of a lead-acid cell by drawing a sample of electrolyte into a hydrometer and
        reading the SG directly. Modern sealed batteries seal the electrolyte in glass-mat or gel form, so the
        hydrometer trick is obsolete, but the underlying chemistry is unchanged<Cite id="plante-1859" in={SOURCES} />.
      </p>

      <LeadAcidCellDemo />

      <p>
        Cell voltage is set by the standard reduction potentials of the two Pb couples: E°(Pb/PbSO₄) = −0.36 V and
        E°(PbO₂/PbSO₄) = +1.69 V, giving an open-circuit voltage of <strong>~2.05 V per cell</strong> — the highest
        of any aqueous chemistry (above this, water starts to electrolyse). Six cells in series make a nominal 12.6 V
        car battery<Cite id="bard-faulkner-2001" in={SOURCES} />. Energy density is poor (~35 Wh/kg) because the lead is
        heavy and the active material in each plate has limited utilization, but specific power is excellent: a
        properly built lead-acid cell can deliver hundreds of amps for the few-second cranking job, then sit on a
        trickle charge for years.
      </p>

      <TryIt
        tag="Try 19.1"
        question={<>A car starter battery rated 60 Ah at 12 V delivers what total stored energy in kilowatt-hours?</>}
        hint="E = V · Q where Q is in Ah and V is in volts; convert."
        answer={
          <>
            <Formula>E = V · Q = 12 V · 60 Ah = 720 Wh = <strong>0.72 kWh</strong></Formula>
            <p>
              About the energy content of <strong>60 g of gasoline</strong> — but that gasoline is in a tank you drain
              once and refill, while the battery is good for ~500 cycles of cranking the engine. The lead-acid is
              built for the brief, high-current job, not for energy storage at scale<Cite id="bard-faulkner-2001" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2>The lithium-ion revolution</h2>

      <p>
        The breakthrough came from three people working in three different decades. Stanley Whittingham, at Exxon
        Research in 1976, built the first rechargeable lithium cell: metallic lithium anode, titanium-disulphide
        (TiS₂) cathode, lithium-perchlorate-in-dioxolane electrolyte<Cite id="whittingham-1976" in={SOURCES} />. The
        cell ran at ~2.4 V, much higher than aqueous chemistries, because lithium metal sits at −3.04 V vs SHE and
        TiS₂ is a strong oxidizer. But the lithium anode was a problem: on repeated cycling, lithium plated back not
        as a smooth metal film but as branching dendrites that eventually pierced the separator and shorted the cell —
        often catastrophically. Exxon shelved the project after several lab fires.
      </p>
      <p>
        John Goodenough, at Oxford in 1980, identified a fundamentally better cathode: lithium-cobalt oxide LiCoO₂,
        which could reversibly release and reabsorb Li⁺ ions while maintaining its layered crystal structure
        <Cite id="goodenough-1980-licoo2" in={SOURCES} />. With LiCoO₂ paired against a lithium-metal anode, cell
        voltage jumped to ~4.0 V and energy density to about <strong>eight times</strong> Whittingham's TiS₂ design.
        But the dendrite problem with the lithium anode was still there; commercial deployment remained out of reach.
      </p>
      <p>
        Akira Yoshino, at Asahi Kasei in 1985, made the final critical move: he replaced the metallic lithium anode
        with a <Term def="A graphite or graphite-like carbon host that can reversibly accept Li⁺ ions between its layers. Replacing the dendrite-prone metallic-lithium anode with a carbon intercalation anode (Yoshino 1985) was the breakthrough that made Li-ion safe enough to commercialise.">carbon intercalation anode</Term> — initially petroleum coke, later graphite — that could absorb Li⁺ ions
        into the spaces between its layered planes without ever forming free lithium metal<Cite id="yoshino-1985" in={SOURCES} />. The dendrite problem evaporated. Sony commercialized the design in 1991 as the first lithium-ion
        cell; within a decade it dominated portable electronics; within three decades it had driven the cost from
        ~$1100/kWh to ~$140/kWh and made the electric vehicle commercially viable. Whittingham, Goodenough, and
        Yoshino shared the 2019 Nobel Prize in Chemistry for the chain of inventions.
      </p>

      <LiIonIntercalationDemo />

      <p>
        The trick is intercalation. Both electrodes are host lattices — graphite on the anode, LiCoO₂ on the cathode —
        and the Li⁺ ion is the &quot;rocking-chair&quot; species that shuttles between them through the electrolyte.
        Neither host dissolves; the chemistry simply moves ions across the gap without destroying either lattice. That
        is why Li-ion can survive 500–2000 cycles, in contrast to most precursor chemistries that begin to fade after
        100–300<Cite id="bard-faulkner-2001" in={SOURCES} />. The half-reactions are unusual-looking, since neither
        electrode species is &quot;oxidized&quot; or &quot;reduced&quot; in the usual sense — the ion-host system
        accepts or releases electrons as the Li⁺ goes in or out, balancing charge:
      </p>
      <Formula>LiC<sub>6</sub> ⇌ Li<sub>1−x</sub>C<sub>6</sub> + xLi⁺ + xe⁻   (anode, graphite host)</Formula>
      <Formula>Li<sub>1−x</sub>CoO<sub>2</sub> + xLi⁺ + xe⁻ ⇌ LiCoO<sub>2</sub>   (cathode, layered oxide host)</Formula>

      <Pullout>
        Lithium-ion isn't a chemistry. It's a delivery mechanism — a single mobile ion that slides between two
        unchanging hosts.
      </Pullout>

      <TryIt
        tag="Try 19.2"
        question={<>A modern Li-ion 18650 cell stores about 12 Wh in a 47 g package. What is its gravimetric energy density in Wh/kg?</>}
        hint="Wh/kg = energy ÷ mass in kg"
        answer={
          <>
            <Formula>ρ<sub>E</sub> = 12 Wh / 0.047 kg ≈ <strong>255 Wh/kg</strong></Formula>
            <p>
              For comparison: lead-acid is ~35 Wh/kg, NiMH ~80 Wh/kg, alkaline primary ~150 Wh/kg.
              Gasoline holds ~12 000 Wh/kg of chemical energy, of which only ~3000 Wh/kg comes out as useful work
              through an internal-combustion engine. Li-ion has closed about an order of magnitude of the
              battery-vs-fuel gap since Sony's 1991 launch<Cite id="bard-faulkner-2001" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2>The Li-ion chemistry tree</h2>

      <p>
        Goodenough's LiCoO₂ was the original Li-ion cathode and is still found in consumer electronics (your phone is
        almost certainly an LCO derivative). But the LCO recipe is expensive (cobalt is scarce and ethically fraught
        to source) and thermally unstable above ~150 °C, where it can release oxygen and feed a thermal runaway. So
        the industry branched into a family of related cathode chemistries, each trading one property against another
        <Cite id="bard-faulkner-2001" in={SOURCES} />:
      </p>
      <ul>
        <li>
          <strong>LFP</strong> (LiFePO<sub>4</sub>, ~3.2 V) — phosphate framework instead of layered oxide, much more
          thermally stable, longer cycle life (2000+ cycles), lower energy density. Goodenough et al. 1996. Now the
          dominant chemistry for grid-scale storage and many EVs.
        </li>
        <li>
          <strong>NMC</strong> (Li(Ni,Mn,Co)O<sub>2</sub>, ~3.7 V) — substitute nickel and manganese for some of the
          cobalt; higher energy density than LCO at lower cost. The current EV workhorse, from Chevy Bolt to most
          Volkswagen ID models.
        </li>
        <li>
          <strong>NCA</strong> (LiNi<sub>0.8</sub>Co<sub>0.15</sub>Al<sub>0.05</sub>O<sub>2</sub>, ~3.6 V) — high
          nickel, trace aluminium for structural stability. Tesla's chemistry of choice in many models. Slightly
          higher energy density than NMC, slightly less robust.
        </li>
        <li>
          <strong>LMO</strong> (LiMn<sub>2</sub>O<sub>4</sub>, ~3.7 V) — spinel manganese oxide, cheap, but shorter
          cycle life and prone to manganese dissolution. Used in cost-sensitive applications and as a blending
          component.
        </li>
      </ul>

      <ChemistryComparisonDemo />

      <p>
        All four share the intercalation principle: Li⁺ ions move in and out of a host lattice, no dissolution of
        electrode material, reversible over many cycles. They differ in the cathode crystal structure, which sets
        the cell voltage (~3.2–3.7 V), the practical capacity per gram, the thermal stability, and the cycle life.
        The choice between them is the central battery-engineering decision in modern EVs and grid storage: LFP is
        the safer, longer-living, lower-energy option; NMC and NCA are the higher-energy, shorter-living options.
        Vehicle range vs. cycle life vs. cost vs. supply-chain risk — there is no universal winner<Cite id="bard-faulkner-2001" in={SOURCES} />.
      </p>

      <h2>Supercapacitors</h2>

      <p>
        Step sideways from chemistry for a moment. A supercapacitor — also called an EDLC (electric double-layer
        capacitor) or ultracapacitor — looks like a battery from the outside but isn't one. There is no chemical
        reaction. Inside is a sandwich of two porous-carbon electrodes (specific surface area ~1000 m²/g, courtesy of
        activated charcoal) in an electrolyte, with a separator membrane. Apply a voltage and the ions in the
        electrolyte crowd up against each charged carbon surface, forming a <Term def="The Helmholtz double layer at a metal-electrolyte interface — a sheet of charge in the metal balanced by an opposite sheet of crowded ions in the electrolyte, separated by just a few angstroms. The basis of supercapacitor energy storage.">Helmholtz double layer</Term> just a few
        angstroms thick. The energy is stored in the electric field across that double layer<Cite id="bard-faulkner-2001" in={SOURCES} />, exactly like a regular capacitor — only the gap is angstroms and the surface area is enormous, so
        the capacitance per cell reaches thousands of farads.
      </p>
      <p>
        The dominant difference from a battery shows up in the discharge curve. A battery sits on a roughly flat
        voltage plateau set by its half-reaction thermodynamics. A capacitor's voltage falls linearly with charge —
        V = Q/C — because there is no chemistry, only field. For a constant-current discharge:
      </p>
      <Formula>V(t) = V<sub>0</sub> − (I / C) · t</Formula>

      <SupercapacitorDemo />

      <Pullout>
        A battery stores chemistry. A supercapacitor just stores field. The reactions cap the rate; the field doesn't.
      </Pullout>

      <p>
        Two practical consequences. First, supercapacitors charge and discharge at speeds limited only by their ESR
        — milliseconds to seconds, not hours — and survive hundreds of thousands of cycles (no chemistry to wear
        out). Second, their energy density is an order of magnitude below Li-ion (~5–10 Wh/kg vs ~250 Wh/kg) because
        the double layer, however clever, just doesn't store as much energy per kilogram as a chemical reaction does.
        Supercapacitors are the right device for short, high-power bursts: regenerative braking on a city bus, ride-through
        on a UPS, smoothing the load on the photovoltaic input to a grid-tied inverter<Cite id="bard-faulkner-2001" in={SOURCES} />. They complement batteries; they don't replace them.
      </p>

      <TryIt
        tag="Try 19.3"
        question={<>A 3000 F supercapacitor cell rated 2.7 V holds how much energy? Compare to a 18650 Li-ion cell (~12 Wh).</>}
        hint="U = ½ C V². 1 Wh = 3600 J."
        answer={
          <>
            <Formula>U = ½ C V² = ½ (3000)(2.7)² = <strong>10 935 J ≈ 3.0 Wh</strong></Formula>
            <p>
              The supercap cell is much larger and heavier (~500 g vs 47 g) but holds about <strong>25%</strong> the
              energy of a single 18650 — so its volumetric and gravimetric energy densities are roughly 10× worse than
              Li-ion. The trade-off is in the time domain: it can deliver that 3 Wh in a second or two, whereas the
              Li-ion needs at minimum a few minutes of fast-charge to recover<Cite id="bard-faulkner-2001" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2>Fuel cells: a battery you keep refilling</h2>

      <p>
        Step sideways again. A fuel cell has the same two-electrode architecture as a battery, but the reactants are
        stored externally and fed to the electrodes continuously instead of being sealed inside from the factory. The
        canonical version is the <Term def="Proton exchange membrane fuel cell. H₂ at the anode, O₂ at the cathode, a solid polymer electrolyte (Nafion) that conducts H⁺ ions but blocks electrons. Operates at ~80 °C and 0.7 V/cell at typical loads; stacked in series for higher voltage.">PEM (proton exchange membrane)</Term> fuel cell, invented in the 1960s at General
        Electric for the Gemini space program<Cite id="larminie-dicks-2003-fuel-cells" in={SOURCES} />. Hydrogen feeds
        the anode; oxygen (usually from air) feeds the cathode; a thin sheet of Nafion polymer between them conducts
        protons but blocks electrons. The reactions:
      </p>
      <Formula>H<sub>2</sub> → 2H⁺ + 2e⁻   (anode)</Formula>
      <Formula>½O<sub>2</sub> + 2H⁺ + 2e⁻ → H<sub>2</sub>O   (cathode)</Formula>
      <p>
        Net: <strong>H₂ + ½O₂ → H₂O + electricity + heat</strong>. The protons cross the Nafion membrane to balance
        charge; the electrons travel through the external circuit (this is the current). The only product is water.
        The thermodynamic open-circuit voltage at 25 °C is <strong>1.23 V</strong>; real cells start around 1.0 V
        because of inevitable kinetic <em>overpotentials</em> at both electrodes, then drop further with current draw
        <Cite id="larminie-dicks-2003-fuel-cells" in={SOURCES} />.
      </p>

      <FuelCellDemo />

      <p>
        The current-voltage relationship — the <Term def="The plot of cell voltage vs current density for an electrochemical cell (fuel cell, battery, electrolyzer). Three regions: activation loss at low current (logarithmic), ohmic loss in the middle (linear), mass-transport loss at high current (sharply curving down toward a limiting current). Tells you the cell's efficiency vs power-density trade-off.">polarization curve</Term> — has three regimes. At
        low current, activation overpotentials dominate; you lose ~0.3 V getting any reaction at all going.
        In the middle, ohmic resistance (mainly the membrane's proton-conducting resistance plus electrode contact)
        drops voltage linearly with current. At high current, mass transport limits set in: you simply can't get
        oxygen to the cathode fast enough, and the voltage falls off a cliff approaching a limiting current
        <Cite id="larminie-dicks-2003-fuel-cells" in={SOURCES} />. Typical operating points sit at 0.6–0.7 V per
        cell — meaning thermodynamic efficiency of ~60% (relative to the H₂ heating value), better than any heat
        engine, with water as the only emission.
      </p>
      <p>
        Stack hundreds of cells in series for higher voltage. A Toyota Mirai's fuel-cell stack has ~370 cells in
        series, delivering ~250 V at peak power and ~114 kW peak. Compressed hydrogen (~5 kg in two 700-bar tanks)
        gives roughly 650 km of range. The catch is the fuel: green hydrogen production at scale is hard, and the
        distribution infrastructure is sparse. Fuel cells make sense where battery weight is prohibitive (long-haul
        trucks, marine, aerospace) and where there's a captive refuelling location; for cars they're competing with
        a Li-ion industry that has already won the cost curve<Cite id="larminie-dicks-2003-fuel-cells" in={SOURCES} />.
      </p>

      <TryIt
        tag="Try 19.4"
        question={<>A fuel-cell stack has 100 cells in series, each running at 0.65 V at 200 A. What's the stack output power?</>}
        hint="V_stack = N · V_cell; P = V · I."
        answer={
          <>
            <Formula>V<sub>stack</sub> = 100 · 0.65 = 65 V</Formula>
            <Formula>P = V<sub>stack</sub> · I = 65 V · 200 A = <strong>13 kW</strong></Formula>
            <p>
              Enough to run a small car at cruise. Hydrogen consumption at this operating point is roughly
              <em> N · I / (2F)</em> mol/s ≈ 0.10 mol/s ≈ 200 g/min — the fuel cell drinks H₂ at a few hundred grams
              per minute under load, which is why the on-board tank is the size of a small carry-on suitcase
              <Cite id="larminie-dicks-2003-fuel-cells" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2>What we have so far</h2>

      <p>
        Lead-acid: 1859 chemistry, two lead-based plates in dilute H₂SO₄, ~2 V per cell, low energy density but
        excellent specific power, still the universal car starter. Lithium-ion: three sequential breakthroughs
        (Whittingham 1976, Goodenough 1980, Yoshino 1985), Li⁺ shuttling between two host lattices, 3.0–4.2 V per
        cell, 150–250 Wh/kg, the dominant chemistry of modern portable electronics and electric vehicles. Four major
        Li-ion cathode families (LCO, NMC, NCA, LFP) trading energy density, cost, cycle life, and safety against
        each other. Supercapacitors: not a battery, just an enormous double-layer capacitor — fast and durable but
        modest energy density. Fuel cells: same architecture as a battery but with external fuel supply, enabling
        long-range applications where battery mass becomes the limit. All five descend from Volta's two-electrode
        pile; the chemistry has changed beyond recognition, but the architecture hasn't.
      </p>
      <p>
        That ends the materials thread of the textbook. We have gone from <InlineMath>F = kQ_1Q_2/r²</InlineMath> in
        Chapter 1 through capacitors, magnetism, induction, Maxwell, special relativity, circuits, motors, generators,
        and now the chemistry that powers them. The whole edifice rests on the same field that filled the gap in
        Chapter 1's two charges. The wire is, as the very first page promised, almost beside the point.
      </p>

      <CaseStudies
        intro="Four working systems built on the chemistries above, with the numbers that determine whether they work."
      >
        <CaseStudy
          tag="Case 19.1"
          title="Tesla Model 3 long-range battery pack"
          summary="~75 kWh of energy in roughly 4400 cylindrical cells, depending on year and trim. Pack-level energy density around 165 Wh/kg."
          specs={[
            { label: 'Pack energy', value: <>~75 kWh</> },
            { label: 'Pack voltage', value: <>~360 V nominal</> },
            { label: 'Cell chemistry', value: <>NCA (Panasonic 2170) or LFP (CATL) depending on market <Cite id="bard-faulkner-2001" in={SOURCES} /></> },
            { label: 'Pack energy density', value: <>~165 Wh/kg</> },
            { label: 'Cycle life', value: <>~1500 cycles to 80% capacity</> },
          ]}
        >
          <p>
            A Tesla Model 3 Long Range pack contains roughly <strong>4400 cylindrical 2170-format cells</strong>
            (21 mm diameter, 70 mm tall) wired in a series-parallel topology that yields ~360 V nominal and ~75 kWh
            stored. Each cell is an NCA or LFP Li-ion (Tesla switched the standard-range Model 3 to LFP in 2021 for
            non-North-American markets), held in a structural pack with active liquid cooling and a battery-management
            system that monitors per-string voltage, temperature, and impedance several times per second.
          </p>
          <p>
            Pack-level energy density of ~165 Wh/kg corresponds to about <strong>455 kg</strong> of pack for 75 kWh —
            roughly a third of the vehicle's curb weight. That mass is what fundamentally limits how far &quot;more
            range&quot; can go on Li-ion: every kilowatt-hour you add adds another few kilograms to roll around at
            highway speed. The industry's pursuit of solid-state and lithium-metal anodes is partly a chase for higher
            energy density (~400 Wh/kg theoretical) that would lighten the pack by a factor of two<Cite id="bard-faulkner-2001" in={SOURCES} />.
          </p>
          <p>
            Cycle life is a careful balance. Tesla limits the &quot;daily&quot; charge level to 80–90% to avoid the
            high-voltage degradation regime, and warns against repeated full charges. The cycle-life budget of
            ~1500 cycles to 80% capacity, combined with that daily ceiling, is what gives the 8-year / 240 000 km
            pack warranty. Beyond that the pack still works, just at reduced capacity.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 19.2"
          title="iPhone battery"
          summary="A single ~3.85 V Li-polymer cell, ~13 Wh capacity, rated ~500 cycles to 80%. Volume- and shape-optimized to fill the case interior."
          specs={[
            { label: 'Cell voltage', value: <>3.85 V nominal (LCO derivative)</> },
            { label: 'Capacity', value: <>~12–13 Wh (varies by model)</> },
            { label: 'Form factor', value: <>Li-polymer pouch, custom shape</> },
            { label: 'Cycle life', value: <>~500 cycles to 80% rated capacity</> },
          ]}
        >
          <p>
            An iPhone runs on a single Li-ion cell — not a pack, just one — in a flat polymer pouch shaped to fit the
            available volume inside the case. The chemistry is an LCO (or NCA-like high-Ni variant), the voltage is
            3.85 V nominal, the capacity is around 12 Wh. A small dedicated chip (the gas gauge) integrates the
            current in and out to track state of charge to better than 1%, while the battery-management circuit on
            the same chip limits charge/discharge current and trips an emergency disconnect if cell voltage or
            temperature ever leaves its safe envelope<Cite id="bard-faulkner-2001" in={SOURCES} />.
          </p>
          <p>
            Apple's rated 500-cycle service life is a result of careful chemistry choices in the cell and software
            choices in iOS. The phone learns your charging pattern and slow-charges from 80% to 100% only when it
            thinks you're about to unplug it, because sitting fully charged at 4.2 V accelerates capacity fade. By
            the time the cell has cycled 500 times to 80% — about two and a half years of typical use — it has lost
            ~20% of nameplate capacity, and the phone starts reporting &quot;battery service&quot; in its diagnostics.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 19.3"
          title="Hornsdale Power Reserve — Tesla Megapack grid storage"
          summary="100 MW / 150 MWh of Li-ion cells in a single grid-connected installation. Frequency response in under 100 ms."
          specs={[
            { label: 'Power rating', value: <>100 MW (charge or discharge)</> },
            { label: 'Energy capacity', value: <>150 MWh</> },
            { label: 'Cell chemistry', value: <>NMC Li-ion (Tesla Megapack)</> },
            { label: 'Response time', value: <>&lt; 100 ms <Cite id="bard-faulkner-2001" in={SOURCES} /></> },
          ]}
        >
          <p>
            The Hornsdale Power Reserve in South Australia, commissioned in 2017, was the first utility-scale Li-ion
            grid battery and became the model for hundreds that followed. It is a paddock of refrigerator-sized Tesla
            Megapack units holding 150 MWh of NMC Li-ion cells, connected to the grid through bidirectional inverters
            capable of 100 MW in or out. The job is not bulk energy storage (it would discharge in 90 minutes flat at
            full power) but <em>frequency response</em>: when a coal plant trips offline somewhere on the network and
            grid frequency starts to dip, Hornsdale dumps tens of megawatts onto the bus within 100 ms — faster than
            any spinning machine can react<Cite id="bard-faulkner-2001" in={SOURCES} />.
          </p>
          <p>
            Within its first two years of operation, Hornsdale recovered its capital cost from grid-services revenue
            alone, demonstrating that batteries weren't just an environmental hedge but a competitive grid asset.
            Hundreds of similar installations followed worldwide. The Li-ion chemistry here is identical to the one
            in your phone, just multiplied by a factor of about ten million cells.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 19.4"
          title="Toyota Mirai PEM fuel-cell stack"
          summary="~370 series cells, 114 kW peak, fed by 5 kg of compressed H₂ at 700 bar; ~650 km range from a single fill."
          specs={[
            { label: 'Cells in series', value: <>~370</> },
            { label: 'Peak power', value: <>114 kW <Cite id="larminie-dicks-2003-fuel-cells" in={SOURCES} /></> },
            { label: 'H₂ storage', value: <>5 kg at 700 bar (two carbon-fibre tanks)</> },
            { label: 'Range', value: <>~650 km (WLTP)</> },
            { label: 'Refuelling time', value: <>~5 min</> },
          ]}
        >
          <p>
            The Toyota Mirai (Japanese for &quot;future&quot;) is the most commercially successful fuel-cell passenger
            car. Its stack is ~370 cells in series at peak operating point ~0.65 V per cell, delivering ~240 V and up
            to 114 kW peak. Hydrogen is stored in two carbon-fibre-wrapped tanks at 700 bar — about 5 kg total, which
            corresponds to <strong>~166 kWh</strong> of chemical energy if all were converted at 100% efficiency. At
            real-world fuel-cell efficiency (~55%) that's <strong>~92 kWh</strong> of usable electric energy — about
            <em> 30% more</em> than the largest Li-ion EV packs, in a fuel mass of just 5 kg<Cite id="larminie-dicks-2003-fuel-cells" in={SOURCES} />.
          </p>
          <p>
            Refuelling takes ~5 minutes (vs. ~30 minutes for a Tesla Supercharger), and range is 650 km on the WLTP
            cycle. The remaining problems are infrastructure (a handful of H₂ stations exist worldwide outside
            California, Japan, and Germany), and the cost and carbon footprint of producing &quot;green&quot;
            hydrogen at scale — most commercial H₂ today is steam-reformed from natural gas, which defeats most of
            the environmental case. Fuel-cell passenger cars are a niche; fuel-cell long-haul trucks, where battery
            mass is genuinely prohibitive, are the more likely path to growth.
          </p>
        </CaseStudy>
      </CaseStudies>

      <FAQ intro="Loose threads from the chapter — the questions a careful reader tends to surface.">
        <FAQItem q="Why does lead-acid persist for car starters when better chemistries exist?">
          <p>
            Cost and ruggedness. A 60 Ah lead-acid car battery costs ~$100 to manufacture at scale; an equivalent
            Li-ion replacement is 3–5× more. Lead-acid tolerates a wide temperature range (−30 to +60 °C in service),
            survives mechanical abuse, recycles cleanly (almost 99% of automotive lead is reclaimed and re-used), and
            handles the brief 400 A cranking pulse easily. The application doesn't need energy density; it needs
            specific power, robustness, and cheapness. Lead-acid wins on all three<Cite id="bard-faulkner-2001" in={SOURCES} />.
            When the application is energy density (range), Li-ion wins.
          </p>
        </FAQItem>

        <FAQItem q="Why is lithium so special among the elements for battery anodes?">
          <p>
            Three reasons. (1) Most negative standard reduction potential of any element (Li⁺/Li at −3.04 V vs SHE),
            so pairing lithium with almost any cathode gives a high cell voltage. (2) Lowest atomic mass of any solid
            element (lithium is 6.94 amu); high-voltage cells made from light atoms have high energy density per
            kilogram. (3) Small ionic radius (Li⁺ is ~76 pm), letting Li⁺ slide between the layers of host lattices
            like graphite and LiCoO₂ without disrupting them — the intercalation trick<Cite id="bard-faulkner-2001" in={SOURCES} />.
            No other element checks all three boxes. Sodium (next column down in the periodic table) has been studied
            extensively but has higher mass and bigger ionic radius, so sodium-ion cells trail Li-ion in energy density
            by a factor of ~1.5.
          </p>
        </FAQItem>

        <FAQItem q="What is 'thermal runaway' and why is it specifically a Li-ion problem?">
          <p>
            Thermal runaway is a feedback loop: a Li-ion cell that has been damaged (mechanical penetration), overcharged,
            or internally shorted heats up. Above about 80 °C the SEI layer (the solid-electrolyte interphase film on
            the anode) starts to break down, exposing fresh lithium to the electrolyte and producing more heat. Above
            150 °C the cathode can release oxygen, which oxidizes the electrolyte (the organic carbonate solvents are
            flammable). Above 200 °C the reactions accelerate and the cell vents flames and electrolyte vapour. In a
            multi-cell pack the heat propagates to neighbouring cells and the entire pack ignites<Cite id="bard-faulkner-2001" in={SOURCES} />.
            Lead-acid and NiMH don't run away because their electrolytes are aqueous (water doesn't burn) and their
            cathodes don't release oxygen.
          </p>
        </FAQItem>

        <FAQItem q="Why does an LFP cell last 3000+ cycles when an NMC cell typically lasts 1500?">
          <p>
            The olivine LiFePO<sub>4</sub> structure is mechanically more stable through lithium insertion and
            extraction than layered LiCoO<sub>2</sub> or Li(NiMnCo)O<sub>2</sub>. Olivine LFP expands and contracts
            very little as Li⁺ comes and goes (about 6% volume change), so the crystal lattice doesn't accumulate
            micro-cracks. Layered oxides expand more (~7–10%) and develop crack networks over thousands of cycles
            that gradually disconnect active material from the current collector. The trade-off is voltage: LFP's
            phosphate framework gives only 3.2 V vs NMC's 3.7 V, so LFP cells store proportionally less energy per
            kilogram<Cite id="bard-faulkner-2001" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why was the lithium-metal anode such a problem, and why has it now come back?">
          <p>
            Lithium metal plated from solution doesn't form a smooth film: it grows as branching dendrites that
            eventually reach the opposite electrode through the separator, shorting the cell and igniting the
            flammable electrolyte. This is why Yoshino's carbon anode was such a critical move in 1985 — graphite
            could store lithium without ever forming free metal. But carbon stores only ~370 mAh/g vs lithium's
            ~3860 mAh/g, leaving a 10× theoretical energy-density gap unclaimed. Modern solid-state-electrolyte
            research aims to suppress dendrite formation mechanically (with ceramic electrolytes too rigid for
            dendrites to penetrate), enabling a return to lithium-metal anodes at much higher cell energy
            density<Cite id="bard-faulkner-2001" in={SOURCES} />. Several companies (QuantumScape, Solid Power) have
            built laboratory demonstrators; commercial deployment is expected by the late 2020s.
          </p>
        </FAQItem>

        <FAQItem q="What's the difference between a 'Li-ion' battery and a 'Li-polymer' battery?">
          <p>
            Mostly the packaging. Both are intercalation-based lithium-ion chemistries with essentially the same
            electrode materials; the difference is in the electrolyte. Conventional Li-ion uses a liquid carbonate
            electrolyte in a sealed metal can (the cylindrical 18650 or 21700 cells, the prismatic blocks). Li-polymer
            (LiPo) uses a gelled or polymer electrolyte in a soft pouch, allowing the cell to be shaped to fit the
            host device. Phones and tablets use LiPo because of the form-factor flexibility; power tools and EVs use
            cylindrical Li-ion because the rigid can handles thermal cycling better<Cite id="bard-faulkner-2001" in={SOURCES} />.
            The chemistry inside is the same family.
          </p>
        </FAQItem>

        <FAQItem q="Why does Li-ion energy density seem to be levelling off?">
          <p>
            Because we're approaching the theoretical limits of intercalation chemistry. The cell voltage is set by the
            Li⁺/host reduction potentials and can't be pushed past ~4.3 V without the electrolyte breaking down. The
            capacity is set by how many Li⁺ ions you can stuff between graphite layers and back out without
            destabilising the cathode — about one lithium per six carbons in graphite, sets the practical limit.
            Together these give a ceiling of ~300 Wh/kg at the cell level for layered-oxide chemistries
            <Cite id="bard-faulkner-2001" in={SOURCES} />. Going higher requires moving to lithium-metal anodes
            (solid-state, see above) or to entirely new chemistries (Li-S, Li-O₂) where the theoretical limits are
            higher but the engineering is harder.
          </p>
        </FAQItem>

        <FAQItem q="Why does a fuel cell's open-circuit voltage drop below the thermodynamic 1.23 V?">
          <p>
            Because of mixed potentials and crossover losses. Trace amounts of H₂ migrate across the Nafion membrane
            and react at the cathode without doing external work; trace amounts of O₂ migrate the other way and react
            at the anode. Both shift the equilibrium potentials of the electrodes away from their ideal values by tens
            to hundreds of millivolts. Plus, even at zero current, there is an activation overpotential associated
            with starting any electrochemical reaction. Net effect: real PEM fuel cells start at ~0.95–1.0 V open-circuit
            instead of the thermodynamic 1.23 V<Cite id="larminie-dicks-2003-fuel-cells" in={SOURCES} />, and drop
            further with current.
          </p>
        </FAQItem>

        <FAQItem q="Why do supercapacitors have such low voltage per cell?">
          <p>
            Because their voltage is limited by the electrochemical stability window of the electrolyte. Above about
            ~2.7 V for aqueous electrolytes (well, 1.2 V for pure water — they use carbon-based aqueous compounds), or
            ~2.7–3.0 V for typical organic electrolytes, the solvent starts to break down. The double layer can't
            help: it isn't doing chemistry, but the supporting electrolyte still has to be physically stable at the
            applied voltage. To make a 12 V or 48 V supercapacitor system you stack 5–20 cells in series with
            balancing circuits to keep individual cell voltages from drifting<Cite id="bard-faulkner-2001" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why was the 2019 Chemistry Nobel awarded jointly to three people from different decades?">
          <p>
            Because each made one essential, distinct contribution that the next built on. Whittingham (Exxon, 1976)
            invented the intercalation electrode concept and showed it worked with TiS₂ and metallic Li. Goodenough
            (Oxford, 1980) replaced TiS₂ with LiCoO₂, jumping to ~4 V and 8× the energy density. Yoshino (Asahi Kasei,
            1985) replaced the dendrite-prone Li metal anode with a carbon-host intercalation anode, solving the
            safety issue and enabling Sony's 1991 commercial launch. Take any one of those three steps away and modern
            Li-ion doesn't exist<Cite id="whittingham-1976" in={SOURCES} /><Cite id="goodenough-1980-licoo2" in={SOURCES} /><Cite id="yoshino-1985" in={SOURCES} />.
            Goodenough was 97 at the time of the award, the oldest Nobel laureate in any category in history.
          </p>
        </FAQItem>

        <FAQItem q="What is a redox flow battery and where does it fit in the family?">
          <p>
            A redox flow battery stores its reactants in two external tanks of dissolved redox species — usually
            vanadium compounds at different oxidation states — and pumps them through a cell with an ion-exchange
            membrane. The energy capacity is set by how big the tanks are; the power is set by how big the cell stack
            is. The two are independently scalable, which is the key feature: you can quadruple the storage capacity
            of an installation by enlarging the tanks without changing the cell. Energy density is poor (~20 Wh/kg
            including the electrolyte), so flow batteries don't go in cars; they're built for grid-scale storage
            where footprint is cheap and cycle life (~10 000+ cycles) matters<Cite id="bard-faulkner-2001" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why is graphene not the anode of every Li-ion cell yet?">
          <p>
            Graphene has been studied extensively as a high-surface-area variant of graphite and offers ~2× the
            theoretical capacity (~744 mAh/g vs 372 mAh/g) for lithium intercalation. The problem is irreversible
            capacity loss: graphene's enormous surface area reacts heavily with the electrolyte to form a thick SEI
            layer on first cycle, consuming a large fraction of the lithium budget before the cell is even
            useful<Cite id="bard-faulkner-2001" in={SOURCES} />. Composite anodes that blend graphite with silicon
            nanoparticles (silicon stores Li at ~3580 mAh/g) are the current commercial path forward — silicon is
            already in many modern Li-ion cells at 5–10% blend levels.
          </p>
        </FAQItem>

        <FAQItem q="Why does fast charging degrade a Li-ion battery more than slow charging?">
          <p>
            Because at high charge currents, the lithium plating reaction at the anode competes with the lithium
            intercalation reaction. Intercalation needs the Li⁺ ion to actually move <em>into</em> a graphite layer,
            which has a finite kinetic timescale; if Li⁺ arrives faster than it can intercalate, some of it instead
            plates out as metallic lithium on the graphite surface — and metallic lithium grows dendrites, as in
            Whittingham's original lithium-metal cell. Repeated fast-charging accumulates lithium plating, gradually
            consuming the cyclable lithium inventory and growing dendrites that eventually short the cell<Cite id="bard-faulkner-2001" in={SOURCES} />.
            EV battery-management systems specifically taper charge current near full capacity for exactly this reason.
          </p>
        </FAQItem>

        <FAQItem q="What is C-rate, and why do batteries have one?">
          <p>
            C-rate is the charge or discharge current normalized to capacity. A &quot;1C&quot; rate on a 60 Ah cell is
            60 A — enough to discharge it in 1 hour. A &quot;0.5C&quot; rate is 30 A, taking 2 hours. A &quot;3C&quot;
            rate is 180 A, taking 20 minutes. Cells are specified for a maximum sustained C-rate (set by the heat the
            internal resistance can dissipate without runaway) and a maximum peak C-rate (a brief burst the cell can
            handle without permanent damage). Power tool cells routinely run at 10–20C; EV cells run 1–3C; grid storage
            often runs much lower. The C-rate framing is convenient because it scales: a property quoted at 1C is the
            same fraction of capacity per hour whether the cell is 1 Ah or 1000 Ah<Cite id="bard-faulkner-2001" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why do older Li-ion phones swell up?">
          <p>
            Because internal side reactions over years of use produce small amounts of gas — typically CO₂ and CO from
            slow electrolyte decomposition at the cathode — and the soft pouch packaging gradually balloons. In
            cylindrical Li-ion cells the gas vents out a pressure-relief disc; in pouch cells it just inflates the
            pouch. A swollen battery is a serious safety issue and shouldn't be charged or used; the swelling means
            the SEI layer has degraded, the cell's internal resistance has climbed, and the next failure step is
            often thermal runaway<Cite id="bard-faulkner-2001" in={SOURCES} />. Replace it promptly; modern recycling
            programs accept swollen cells in fire-rated containers.
          </p>
        </FAQItem>

        <FAQItem q="If a fuel cell's only emission is water, why isn't it the universal future of energy?">
          <p>
            Because the &quot;water-only&quot; emission profile depends entirely on where the hydrogen came from.
            Today, about 95% of industrial hydrogen is produced by steam-methane reforming (CH₄ + 2H₂O → CO₂ + 4H₂),
            which emits CO₂ at a rate roughly comparable to burning the methane directly — so a &quot;hydrogen
            economy&quot; built on this kind of H₂ would be no greener than a gas-powered grid. Green hydrogen, produced
            by electrolysing water using renewable electricity, is technically straightforward but currently 3–5× more
            expensive than reformed H₂. Whether fuel cells become a major energy carrier depends on whether green H₂
            production scales down in cost the way Li-ion did over the last 30 years<Cite id="larminie-dicks-2003-fuel-cells" in={SOURCES} />.
          </p>
        </FAQItem>
      </FAQ>
    </ChapterShell>
  );
}
