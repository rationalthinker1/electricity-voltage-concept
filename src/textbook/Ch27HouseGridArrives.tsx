/**
 * Chapter 27 — The grid arrives at your meter
 *
 * The first chapter of the applied "house electricity" track. We follow a
 * single phase of the medium-voltage distribution feeder down through the
 * pole-pig transformer, along the service drop, into the meter base, and
 * onward to where the homeowner takes ownership. No new demos: this
 * chapter reuses the transformer physics from Ch.22-23 and the energy
 * physics from Ch.3 / Ohms-law / Joule labs, and points readers there.
 *
 * Sections:
 *   1. The pole-pig: 7,200 V -> 240 V
 *   2. Why split-phase, not just single-phase
 *   3. The service drop and the weatherhead
 *   4. The meter base
 *   5. What the meter actually measures
 *   6. Neutral, ground, and where they are bonded
 *   7. What happens if the neutral opens
 */
import { CaseStudies, CaseStudy } from '@/components/CaseStudy';
import { ChapterShell } from '@/components/ChapterShell';
import { FAQ, FAQItem } from '@/components/FAQ';
import { Cite } from '@/components/SourcesList';
import { Formula } from '@/components/Formula';
import { Pullout } from '@/components/Prose';
import { Term } from '@/components/Term';
import { TryIt } from '@/components/TryIt';
import { getChapter } from './data/chapters';

export default function Ch27HouseGridArrives() {
  const chapter = getChapter('house-grid-arrives')!;
  const SOURCES = chapter.sources;

  return (
    <ChapterShell chapter={chapter}>
      <p>
        Walk down a residential street in almost any North-American suburb and look up. At the top of every wooden
        pole runs a small set of bare conductors — usually three of them, sometimes one or two, strung between
        ceramic insulators that hold them a metre or so off the cross-arm. Those are the medium-voltage{' '}
        <Term def={<><strong>distribution</strong> — the segment of the power grid between the substation and the customer's meter, typically operating at 4 kV to 35 kV line-to-line. Distinct from "transmission" (kV–hundreds of kV across regions) upstream and "service" (240/120 V) downstream.</>}>distribution</Term>{' '}
        feeders. In a typical 13.8 kV three-phase{' '}
        <Term def={<><strong>wye (Y)</strong> — a three-phase configuration in which the three phase conductors meet at a common centre point (the neutral), which is then grounded. Line-to-neutral voltage is the line-to-line voltage divided by √3. The standard form for North-American distribution feeders.</>}>wye</Term>{' '}
        feeder, each of those wires sits at roughly <strong>7,200 V</strong> with respect to a grounded neutral — the
        13,800 V is the difference between any two of them, and 7,200 ≈ 13,800/√3<Cite id="ansi-c84-1-2020" in={SOURCES} />.
        Halfway down the pole, one of those wires elbows down through a barrel-shaped, oil-filled can. Out of the
        bottom of the can come three new wires — two of them insulated, the third bare — and those three wires
        twist together into a single cable that arcs across the street, droops gently under its own weight, and
        terminates at the eave of a house.
      </p>
      <p>
        That barrel is the last piece of utility hardware between the grid and you. The three wires leaving it are
        a <strong>240 V split-phase service</strong>: two hot legs and a neutral. They enter your house through a
        weatherhead, drop down inside a conduit, pass through a meter, and land at the main breaker of your service
        panel. Everything upstream of the meter is the utility's; everything downstream is yours. The abstract grid
        we built in Chapter 21 — generators, transmission, substations, distribution — makes its last step-down
        right at your eaves, and the engineering choices that govern that last metre of cable are the subject of
        this chapter.
      </p>

      <h2>The <em>pole-pig</em>: 7,200 V down to 240 V</h2>

      <p>
        The barrel on the pole is a{' '}
        <Term def={<><strong>distribution transformer</strong> ("pole-pig") — the final step-down transformer on a power-grid feeder. One primary winding fed by a single medium-voltage phase; one centre-tapped secondary winding that delivers 240 V across the ends and 120 V from either end to the centre tap. Sizes for residential service typically 10–100 kVA.</>}>distribution transformer</Term>,
        almost universally nicknamed the "pole-pig" because of its shape. Inside is an iron core and two windings,
        immersed in mineral oil that doubles as electrical insulation and convection coolant<Cite id="grainger-power-systems-2003" in={SOURCES} />.
        The primary winding has many turns and connects between one medium-voltage phase and the grounded neutral
        of the feeder — for a 13.8 kV wye feeder, that's <strong>7,200 V</strong> across the primary<Cite id="ansi-c84-1-2020" in={SOURCES} />.
        The secondary winding has far fewer turns and is wound with much thicker copper. Its two ends emerge from
        the can as the two "hot" service conductors. Critically, the secondary winding is{' '}
        <Term def={<><strong>centre-tapped</strong> — a secondary winding with a third wire brought out at the electrical midpoint of the winding. The voltage from either end to the centre tap is half the end-to-end voltage. For residential service the end-to-end is 240 V; the centre tap, becoming neutral, sits at 120 V from each end.</>}>centre-tapped</Term>:
        a third wire is brought out at the electrical midpoint of the coil, and that wire becomes the neutral of
        the customer's service.
      </p>
      <p>
        Geometry does the work. The two ends of the secondary winding are wound in the same sense around the core,
        so the voltages at the two ends — measured against the centre tap — are <em>equal in magnitude</em> but
        <em> 180° out of phase</em> at every instant. When one end is at +170 V relative to centre, the other is at
        −170 V; the difference between the two ends is therefore <strong>240 V</strong> peak-to-peak in RMS terms,
        not 0. This is what "split-phase" means: one phase from the utility, split into two equal halves about a
        grounded midpoint<Cite id="ansi-c84-1-2020" in={SOURCES} />.
      </p>
      <p>
        The transformer itself is just a Chapter-23 transformer with k near 1 and a turns ratio chosen to land the
        secondary at the right voltage. The primary-to-half-secondary ratio is roughly{' '}
        <strong>7,200/120 = 60:1</strong>, and the full-secondary ratio is <strong>7,200/240 = 30:1</strong>. Pick
        the ratio and the physics is fixed; everything else (KVA rating, oil volume, bushing geometry) is
        downstream engineering choice. Common residential-feeder sizes are <strong>10, 15, 25, 37.5, 50, 75, and
        100 kVA</strong>, with a single pole-pig typically serving two to six houses in a North-American suburb
        depending on local load density<Cite id="grainger-power-systems-2003" in={SOURCES} /><Cite id="ieee-std-3001-2-2017" in={SOURCES} />.
      </p>
      <Pullout>
        Everything between the pole-pig and your meter belongs to the utility. Everything between the meter and
        your laptop is on you.
      </Pullout>
      <p>
        The deeper physics of how the iron core, the flux linkage, and the turns ratio actually work is the whole
        of Chapter 23 — the pole-pig is a single transformer with k ≈ 0.98 and the cleanest possible split-phase
        wiring on its secondary. The rest of this chapter takes the existence of that 240/120 V three-wire output
        as given and follows where the three wires go.
      </p>

      <h2>Why split-<em>phase</em>, not just single-phase?</h2>

      <p>
        Edison's 1882 New York system delivered direct current at 110 V, and the choice of "around 110" was set by
        the working voltage of the carbon-filament incandescent lamps he was selling at the time. A century of
        inertia later, the United States, Canada, and Mexico still call their nominal residential voltage either
        120 V or 240 V — but the original 110 V choice was a bargain with the bulb, not with the
        physics<Cite id="ansi-c84-1-2020" in={SOURCES} />. The problem appeared as soon as electric heating
        appliances did. A toaster, an electric kettle, an oven, a clothes dryer — all of these pull a kilowatt or
        more, and at 120 V that means tens of amps of current. Power, current, and voltage are tied by the same
        identity every engineering student learns in the second week:
      </p>
      <Formula>P = V I</Formula>
      <p>
        where <strong>P</strong> is the real power delivered to the load (in watts), <strong>V</strong> is the RMS
        voltage across the load (in volts), and <strong>I</strong> is the RMS current through it (in amperes), for
        a purely resistive load. Rearrange to read off the current required to deliver a given power at a given
        voltage:
      </p>
      <Formula>I = P / V</Formula>
      <p>
        same symbols, same meaning. The implication is direct: <em>double the voltage and you halve the current
        required to deliver the same power</em>. A 4,800 W electric dryer at 240 V draws 20 A; the same dryer
        across 120 V would draw 40 A. Halving the current quarters the I²R loss in the supply wires (Chapter 3),
        which is the entire reason the grid pushes hundreds of kilovolts cross-country rather than tens<Cite id="grainger-power-systems-2003" in={SOURCES} />.
        Inside the house, the same logic justifies the existence of 240 V at all: every appliance that pulls a
        few kilowatts wants the higher voltage so its supply wire can stay sane in gauge.
      </p>
      <p>
        Stanley and Westinghouse — pushing AC against Edison's DC in the 1890s — settled on the compromise that
        survived: pull <em>both</em> voltages out of the same transformer secondary. The two ends of the
        centre-tapped winding give 240 V for big resistive loads (range, dryer, water heater, central AC); either
        end against the centre tap gives 120 V for everything else (lighting, outlets, electronics). One
        transformer, two voltages, one neutral wire shared between them. The North-American{' '}
        <Term def={<><strong>split-phase</strong> service — the standard 120/240 V residential supply in North America: two hot conductors 180° out of phase with each other across a grounded centre-tap neutral. Allows 120 V appliances to run from either hot-to-neutral and 240 V appliances to run hot-to-hot.</>}>split-phase</Term>{' '}
        service nominal voltages — 120 V (±5 %) to neutral and 240 V (±5 %) end-to-end — are codified in ANSI
        C84.1<Cite id="ansi-c84-1-2020" in={SOURCES} />. Europe took the other branch: a single 230 V phase to a
        common neutral, no centre tap, and no 120 V option in the kitchen. Both work; neither is wrong; the
        Edison-era equipment they each inherited set the choice.
      </p>

      <TryIt
        tag="Try 27.1"
        question={
          <>
            A <strong>1,500 W</strong> portable space heater can be wired either at 120 V (plugged into a wall
            outlet) or at 240 V (hard-wired in a workshop). Compute the steady-state current it draws in each
            case, and the I²R loss in 30 m of <strong>1.5 Ω total round-trip</strong> supply wire.
          </>
        }
        hint="Use I = P/V for each case, then loss = I² × R_wire."
        answer={
          <>
            <p>At 120 V:</p>
            <Formula>I = P / V = 1500 / 120 = 12.5 A</Formula>
            <Formula>P<sub>loss</sub> = I² R = (12.5)² · 1.5 ≈ <strong>234 W</strong></Formula>
            <p>At 240 V:</p>
            <Formula>I = P / V = 1500 / 240 = 6.25 A</Formula>
            <Formula>P<sub>loss</sub> = I² R = (6.25)² · 1.5 ≈ <strong>59 W</strong></Formula>
            <p>
              Doubling the voltage cuts the current in half and the wire loss by a factor of four — the same
              quadratic-in-voltage savings that makes the entire grid run on high-voltage transmission<Cite id="grainger-power-systems-2003" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2>The service drop and the <em>weatherhead</em></h2>

      <p>
        From the bottom of the pole-pig, three conductors leave together and arc across the street: two insulated
        hot legs and one bare neutral. They are usually bundled as{' '}
        <Term def={<><strong>triplex aerial cable</strong> — a three-conductor service-drop cable used for overhead residential service. Two insulated aluminium hot conductors are spiralled around a bare aluminium neutral, which also serves as the mechanical "messenger" supporting the assembly's weight between pole and house.</>}>triplex</Term>{' '}
        — two insulated aluminium hots spiralled around a bare aluminium neutral, which doubles as a mechanical
        "messenger" supporting the cable's weight. The bare strand is the neutral because the neutral is grounded
        at both ends (at the transformer and at the service entrance), so it can safely be exposed; the two hot
        strands carry the line voltage and must stay insulated. The whole assembly is called the{' '}
        <Term def={<><strong>service drop</strong> — the overhead span of conductors from the utility pole to the customer's building. Where it lands at the house — typically at a "weatherhead" fitting on the conduit — is the demarcation between utility-owned and customer-owned wiring. Underground equivalent is the URD (underground residential distribution) service lateral.</>}>service drop</Term>{' '}
        if it comes overhead, or a "service lateral" if it runs underground<Cite id="nec-2023" in={SOURCES} />.
      </p>
      <p>
        Where the cable lands on the house is the demarcation point in both senses — physical and legal. A goose-neck
        of conduit, called the{' '}
        <Term def={<><strong>weatherhead</strong> (service head) — the inverted-U fitting at the top of the service entrance conduit. Its downward-facing opening prevents rain from entering the conduit while letting the service-drop conductors enter from the side; the cable enters via "drip loops" that ensure water cannot run along the wire into the meter.</>}>weatherhead</Term>,
        rises above the eave. Its mouth faces downward so rain cannot fall in; the service-drop wires enter from
        the side after looping below the mouth (the "drip loops") so any water on the cable's surface drips off
        before reaching the conduit. From the weatherhead the conductors run down a length of conduit, through the
        outer wall, and into the back of the meter base<Cite id="nec-2023" in={SOURCES} />.
      </p>
      <p>
        Aluminium has supplanted copper in service-drop conductors over the last several decades for cost and
        weight reasons. Aluminium's higher resistivity (about 1.6× copper's) is compensated by using a larger gauge
        — typically <strong>#2 AWG aluminium triplex</strong> for a 100 A service, <strong>#1/0</strong> or larger
        for 200 A. The voltage drop across a service drop of 30–50 m at full load is normally held to a few
        percent, which is why a 200 A panel doesn't need #1/0 copper to feed it<Cite id="grainger-power-systems-2003" in={SOURCES} />.
      </p>

      <TryIt
        tag="Try 27.2"
        question={
          <>
            A 50 m service drop uses #2 AWG aluminium triplex with a one-way resistance of
            <strong> 0.85 mΩ/m</strong> per conductor. At a load of <strong>100 A</strong> on one of the two
            hots, what is the voltage drop along that leg, hot-to-neutral, at the house?
          </>
        }
        hint="The current goes out on the hot and returns on the neutral — count both legs of the loop."
        answer={
          <>
            <Formula>R<sub>loop</sub> = 2 · (50 m · 0.85 mΩ/m) = 85 mΩ</Formula>
            <Formula>ΔV = I · R<sub>loop</sub> = 100 · 0.085 ≈ 8.5 V</Formula>
            <p>
              That's about <strong>7 %</strong> of the nominal 120 V at the house — high enough to be felt as
              "dim lights when the AC kicks on" and tight against the ANSI C84.1 utilization band, which is
              part of why service drops are sized generously and why utilities reroute long ones<Cite id="ansi-c84-1-2020" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2>The meter <em>base</em></h2>

      <p>
        The three service-drop wires enter the back of a square or rectangular metal enclosure mounted on the
        outside wall of the house: the{' '}
        <Term def={<><strong>meter base</strong> (meter socket) — the weatherproof enclosure mounted on the outside of a building that physically holds the utility's revenue meter. Owned by the customer; the meter inside is owned by the utility. Contains four jaw contacts that grip the meter's blades and a passthrough lug for the neutral.</>}>meter base</Term>.
        The base belongs to the homeowner; the meter inside it belongs to the utility. Inside the base are four
        spring-loaded jaws arranged in a rectangle. The utility's revenue meter is a glass-domed cylinder with
        four flat blades on its back; the blades slot into the jaws as the meter is plugged in, and the act of
        pulling the meter physically disconnects both hots from everything downstream<Cite id="nec-2023" in={SOURCES} />.
        The neutral does not go through the jaws — it passes through on its own lug at the side or bottom of the
        socket, uninterrupted.
      </p>
      <p>
        The standard residential single-phase 240/120 V meter format is{' '}
        <Term def={<><strong>form-2S</strong> — the standard ANSI meter form for residential single-phase 240/120 V three-wire service. Four blade contacts (two hots in / two hots out) and a continuous-pass neutral, in a cylindrical housing about 10 cm across. Plugs into a four-jaw meter socket.</>}>form-2S</Term>,
        a four-blade cylindrical meter about 10 cm across that has been the dominant form factor in North America
        for a century. Other forms (3S, 4S, 12S, 16S) are used for commercial or three-phase services. The
        physical interchangeability matters: a utility lineworker can swap a meter in 60 seconds without touching
        a single screw on the homeowner's panel<Cite id="ieee-std-3001-2-2017" in={SOURCES} />.
      </p>
      <p>
        A metal ring — the{' '}
        <Term def={<><strong>anti-tampering ring</strong> (sealing ring, locking ring) — the steel band that clamps the revenue meter into its socket, typically secured by a wire-and-lead utility seal. Cutting the seal without authorization is a criminal offense (electricity theft); the ring is the visible legal boundary between utility-owned and customer-owned hardware.</>}>anti-tampering ring</Term>{' '}
        — clamps around the meter where it meets the socket. The ring is closed with a lead-and-wire utility seal,
        usually stamped with a serial number tied to the meter installation. Cutting that seal is a chargeable
        offense in most jurisdictions, because pulling the meter is also the easiest way to bypass it. Once the
        seal is intact and the meter is plugged in, the path from the pole-pig to the panel runs straight through
        the meter and every coulomb that crosses it is counted.
      </p>

      <h2>What the meter actually <em>measures</em></h2>

      <p>
        Older revenue meters — and most meters installed before about 2005 — are <strong>Ferraris induction
        meters</strong>: a rotating aluminium disc spinning between two electromagnets, one driven by the service
        voltage and one driven by the service current. The two fields produce a torque on the disc proportional to
        their product, and an aluminium-disc eddy-current brake holds the disc's rotational speed proportional to
        instantaneous power<Cite id="grainger-power-systems-2003" in={SOURCES} />. A geared mechanical register
        accumulates total disc revolutions, and so total energy delivered. The disc's spin rate at any moment is
        proportional to <em>V · I</em> integrated through the meter's measuring fields; the cumulative count is
        the integral.
      </p>
      <p>
        Modern meters use the same physics differently. Voltage is sensed through a high-impedance divider, current
        through{' '}
        <Term def={<><strong>current transformer (CT)</strong> — a transformer wound so its primary is the conductor under test (a single pass through a toroidal core) and its secondary delivers a scaled-down replica of the primary current into a small burden resistor. Lets a meter measure hundreds of amps without breaking the service conductor.</>}>current transformers</Term>{' '}
        on each hot leg (chapter 22's clamp-on probe, miniaturised and built into the socket), and a microcontroller
        multiplies the two waveforms in real time. Both architectures compute the same integral. For a single
        instant the power delivered is the product of voltage and current; energy is power integrated through
        time:
      </p>
      <Formula>W = ∫ P dt = ∫ V(t) I(t) dt</Formula>
      <p>
        where <strong>W</strong> is the accumulated energy delivered to the customer (in joules — or, the utility's
        unit of choice, kilowatt-hours), <strong>P</strong> is the instantaneous real power (in watts, W = V · A),
        <strong> V(t)</strong> and <strong>I(t)</strong> are the instantaneous service voltage and the
        instantaneous current crossing the meter (in volts and amperes), and <strong>t</strong> is time (in
        seconds). The integral runs from the moment the meter was installed (or last read).
      </p>
      <p>
        For the special case of a constant load — a 1,500 W heater on a steady 120 V supply, say — the integral
        collapses to a product:
      </p>
      <Formula>W = P × t</Formula>
      <p>
        where <strong>W</strong>, <strong>P</strong>, and <strong>t</strong> mean the same things as above. The
        practical unit is the{' '}
        <Term def={<><strong>kilowatt-hour</strong> (kWh) — the unit of energy used on every electric bill in the world. 1 kWh = 1,000 W × 3,600 s = 3.6 × 10⁶ J. A 100 W bulb running for 10 hours uses exactly one kilowatt-hour.</>}>kilowatt-hour</Term>:
        one kWh is 1,000 W delivered for one hour, equal to <strong>3.6 × 10⁶ J</strong>. North-American
        residential rates run roughly $0.10–$0.40 per kWh depending on jurisdiction and time of day<Cite id="ieee-std-3001-2-2017" in={SOURCES} />.
      </p>
      <p>
        Modern{' '}
        <Term def={<><strong>smart meter</strong> — a solid-state revenue meter with a microcontroller, two-way communication (RF mesh, cellular, or PLC), and the ability to report interval data (typically every 15 minutes) back to the utility. Replaces the monthly meter-reader visit; enables time-of-use rates and demand-response programs.</>}>smart meters</Term>{' '}
        report more than total energy. They log interval data (energy used every 15 minutes), peak{' '}
        <Term def={<><strong>demand</strong> — the highest sustained power draw over a short interval (typically 15 minutes) within a billing cycle. Commercial customers are often billed separately on demand because peak demand drives the utility's generation, transmission, and transformer sizing — not just total energy.</>}>demand</Term>{' '}
        in the billing cycle, and reactive energy (∫ V · I · sin(φ) dt, in kVARh). Reactive energy is what flows
        into and out of motors, fluorescent ballasts, and other reactive loads without ever being dissipated.
        Residential customers are not usually billed on it, but it is the input that lets the utility decide where
        to put capacitor banks — and the input that lets a smart meter tell you the power factor of your overall
        load<Cite id="grainger-power-systems-2003" in={SOURCES} />.
      </p>

      <TryIt
        tag="Try 27.3"
        question={
          <>
            A 1,500 W space heater runs <strong>8 hours per day for 30 days</strong>. Compute the total energy
            in kWh, and the monthly cost at <strong>$0.18/kWh</strong>.
          </>
        }
        hint="W = P · t. Convert 1,500 W to kW first to land directly in kWh."
        answer={
          <>
            <Formula>W = P × t = 1.5 kW × (8 h/day × 30 days) = 1.5 × 240 h</Formula>
            <Formula>W = <strong>360 kWh</strong></Formula>
            <Formula>Cost = 360 kWh × $0.18/kWh = <strong>$64.80</strong></Formula>
            <p>
              Roughly two-thirds of the bill on a single space heater. Time-of-use rates can swing that monthly
              total by 2–3× depending on whether the heater runs in peak hours, which is the whole reason
              smart-meter interval data matters to a customer's wallet<Cite id="ieee-std-3001-2-2017" in={SOURCES} />.
            </p>
          </>
        }
      />

      <TryIt
        tag="Try 27.4"
        question={
          <>
            A smart meter reports <strong>14.2 kWh</strong> of real energy and <strong>0.3 kVARh</strong> of
            reactive energy delivered in a billing interval. What is the time-averaged power factor of the load?
          </>
        }
        hint="PF = real / apparent = kWh / √(kWh² + kVARh²)."
        answer={
          <>
            <Formula>S = √(W² + Q²) = √(14.2² + 0.3²) ≈ √(201.6 + 0.09)</Formula>
            <Formula>S ≈ 14.203 kVAh</Formula>
            <Formula>PF = W / S = 14.2 / 14.203 ≈ <strong>0.9998</strong></Formula>
            <p>
              Essentially unity — what you'd expect from a residential load that is mostly resistive (heat,
              lights, electronics with power-factor-corrected supplies). A commercial site with large induction
              motors might come in at 0.7–0.85 and would pay a penalty for the difference<Cite id="grainger-power-systems-2003" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2>Neutral, ground, and the <em>bonding</em> jumper</h2>

      <p>
        Inside the service-entrance equipment — typically at the main breaker of the service panel, sometimes at
        a separate service-entrance disconnect — two wires that have been kept carefully apart everywhere else in
        the house are bolted together. Those two wires are{' '}
        <Term def={<><strong>neutral</strong> — the grounded current-carrying conductor of a single- or split-phase service. Carries the unbalanced return current between the two hot legs and is at (nominally) zero volts with respect to earth at the service entrance. Distinct from "ground," which is the safety-bond conductor and is not supposed to carry current under normal operation.</>}>neutral</Term>{' '}
        and{' '}
        <Term def={<><strong>ground</strong> (equipment grounding conductor / "earth") — the safety-bond conductor that ties all exposed metal in a building to the earth and to the service-entrance neutral. Under normal operation it carries no current; under a fault it provides a low-impedance return that lets the breaker see a high enough current to trip.</>}>ground</Term>.
        The single bolt that ties them is the{' '}
        <Term def={<><strong>main bonding jumper</strong> — the conductor (often just a green-painted screw or strap) at the service entrance that connects the neutral bar to the ground bar / panel enclosure. NEC requires this connection at the service disconnect and forbids it anywhere downstream. Establishes the single point at which neutral and ground are tied to earth.</>}>main bonding jumper</Term>,
        and the rule about it is one of the cleanest in the entire code book: bond exactly once, at the service
        entrance, and never again<Cite id="nec-2023" in={SOURCES} />.
      </p>
      <p>
        Why bond at all? Because the neutral coming down from the pole has to be tied to local earth somewhere, or
        nothing in the house has a meaningful zero reference and there is no path for fault current to return to
        the transformer through the soil. Bonding ties the service neutral, the panel enclosure, every metal box
        in the house, and a deep copper ground rod outside all to the same potential — call it "zero." A fault in
        an appliance that shorts hot to its metal case dumps current into the ground wire of that branch circuit,
        through the ground bus of the panel, across the main bonding jumper to the neutral bus, and back up the
        service neutral to the transformer. The current that flows through that loop is large because the bonded
        path is low-impedance, and large current trips the breaker in milliseconds<Cite id="nec-2023" in={SOURCES} />.
      </p>
      <p>
        Why bond <em>only once</em>? Because if neutral and ground are tied together at multiple points downstream
        of the main, normal load current — which is supposed to return entirely on the neutral — instead splits
        and runs partly on the ground wire, the conduit, the water pipes, and any other metal that happens to
        connect two of those bonded points<Cite id="nec-2023" in={SOURCES} />. The result is "stray current" on
        objects that are supposed to be safe to touch, RF noise into sensitive electronics, and corrosion on any
        pipework that ends up carrying DC offset. The single-point-bond rule is what keeps the ground wire idle
        under normal operation and energized only during faults.
      </p>

      <h2>What if the neutral <em>opens</em>?</h2>

      <p>
        The split-phase architecture has one Achilles' heel, and homeowners discover it the hard way every winter
        when a corroded service-entrance lug or a wind-snapped triplex strand finally lets go. With the two hots
        intact but the <strong>neutral severed</strong>, the centre tap of the secondary winding loses its
        connection to the house's loads. The two 120 V branches no longer have a common reference point — they
        are now in <em>series</em> across the full 240 V, with each branch's load acting as one leg of a voltage
        divider<Cite id="nec-2023" in={SOURCES} />.
      </p>
      <p>
        Let Z₁ be the total impedance of every load on the L1 leg (lumped together — bulbs, electronics, a partly
        running fridge) and Z₂ the same on the L2 leg. With neutral open, the voltage at the centre point (the
        former neutral bus) is set entirely by the divider ratio between Z₁ and Z₂ across the 240 V supply:
      </p>
      <Formula>V<sub>centre</sub> = V<sub>240</sub> · Z₁ / (Z₁ + Z₂)</Formula>
      <p>
        where <strong>V<sub>centre</sub></strong> is the voltage of the floating centre node relative to L2 (in
        volts), <strong>V<sub>240</sub></strong> is the end-to-end supply voltage (≈ 240 V RMS for a healthy
        service), and <strong>Z₁</strong> and <strong>Z₂</strong> are the total load impedances (in ohms) on the
        L1 and L2 legs respectively, lumped at their parallel equivalent. The voltages individually seen by L1 and
        L2 are:
      </p>
      <Formula>V<sub>L1</sub> = 240 · Z₁ / (Z₁ + Z₂),  V<sub>L2</sub> = 240 · Z₂ / (Z₁ + Z₂)</Formula>
      <p>
        The two add to 240 V as required, but they need not split evenly. If one leg is heavily loaded (low Z) and
        the other lightly loaded (high Z), nearly all 240 V appears across the lightly loaded leg — and every
        device on that leg sees double its rated voltage. Incandescent lamps burst, motor windings fry, and
        anything plugged into the lightly-loaded leg dies in seconds. The heavily loaded leg, meanwhile, sees a
        starved voltage of perhaps 30–60 V — too low for half its devices to run, but not low enough to be safely
        zero<Cite id="grainger-power-systems-2003" in={SOURCES} />.
      </p>
      <p>
        Modern{' '}
        <Term def={<><strong>open-neutral</strong> condition — a service-side break in the neutral conductor that floats the centre tap of the split-phase secondary. Loads on the two hot legs are then in series across 240 V, dividing the voltage by their relative impedances. Most common cause of single-event whole-house electronics damage on a North-American service.</>}>open-neutral</Term>{' '}
        whole-house surge protectors and certain smart panels detect this condition by watching for the L1–L2
        voltage to wander outside symmetric bounds — but the proper fix is the upstream connection, which is
        almost always a corroded lug at the weatherhead, the meter base, or the transformer secondary. The NEC
        treats the service neutral as the single most important wire in the building<Cite id="nec-2023" in={SOURCES} />.
      </p>

      <TryIt
        tag="Try 27.5"
        question={
          <>
            Your half of the house (L1 leg) is currently pulling <strong>4 kW</strong>; your neighbour's half
            (L2 leg, sharing the same pole-pig with their own meter base but not the same neutral here — pretend
            they're on the same service as a thought experiment) is pulling <strong>1 kW</strong>. The shared
            neutral opens. Assuming each load is a fixed resistance set by its rated 120 V operating point,
            what voltage does each leg see?
          </>
        }
        hint="Compute each load's resistance from R = V²/P at 120 V, then divide 240 V across them as a series voltage divider."
        answer={
          <>
            <Formula>R₁ = V² / P₁ = 120² / 4000 = 3.6 Ω</Formula>
            <Formula>R₂ = V² / P₂ = 120² / 1000 = 14.4 Ω</Formula>
            <Formula>V<sub>L1</sub> = 240 · R₁ / (R₁ + R₂) = 240 · 3.6 / 18 = <strong>48 V</strong></Formula>
            <Formula>V<sub>L2</sub> = 240 · R₂ / (R₁ + R₂) = 240 · 14.4 / 18 = <strong>192 V</strong></Formula>
            <p>
              The heavily loaded leg (yours) starves at 48 V — bulbs go dim, motors stall. The lightly loaded
              leg (your neighbour's) sees 192 V — 60 % over rated voltage, enough to destroy nearly anything
              plugged into it within seconds. This is exactly the failure mode that the single-point bond and
              the neutral-integrity rules in NEC Article 230 exist to prevent<Cite id="nec-2023" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2>What we have so <em>far</em></h2>

      <p>
        A single phase of the medium-voltage distribution feeder drops down through a pole-pig transformer, which
        delivers a 240 V centre-tapped secondary as a three-wire split-phase service. Triplex aerial cable arcs
        across to the house, enters a weatherhead, and runs down through conduit to a meter base, where the
        utility's revenue meter clamps into four jaws under a sealed anti-tampering ring. The meter integrates
        V · I through time to count kilowatt-hours. Just downstream of the meter, at the main service disconnect,
        the neutral and ground are bonded together at exactly one point — and never again anywhere in the
        building. Break that neutral anywhere upstream and the two 120 V legs become an unequal series divider
        across 240 V; break it downstream and you have created the multi-point bond the code is designed to
        forbid. Every household electrical safety rule that follows in the next several chapters is in some sense
        a corollary of the geometry we have just walked.
      </p>
      <p>
        Chapter 28 picks up where the meter base ends: behind the wall it backs into sits the main service panel,
        and inside that panel two bus bars, a neutral bar, a ground bar, and a stack of breakers encode every
        downstream safety rule the building will ever rely on. We follow the wires the rest of the way in.
      </p>

      <CaseStudies
        intro={
          <>
            Two services on the same street — and one failure mode that has fried more residential electronics
            than every lightning strike combined.
          </>
        }
      >
        <CaseStudy
          tag="Case 27.1"
          title="A typical 200 A single-family service"
          summary={<em>Four houses sharing one pole-pig; 50 m of triplex per drop; a sealed form-2S meter; 200 A behind the main breaker.</em>}
          specs={[
            { label: 'Distribution feeder', value: <>13.8 kV three-phase wye, 7.97 kV line-to-neutral <Cite id="ansi-c84-1-2020" in={SOURCES} /></> },
            { label: 'Pole-pig rating', value: <>25 kVA single-phase, oil-filled, serving 4 houses <Cite id="grainger-power-systems-2003" in={SOURCES} /></> },
            { label: 'Secondary voltage', value: <>240/120 V split-phase, ±5 % per ANSI C84.1 <Cite id="ansi-c84-1-2020" in={SOURCES} /></> },
            { label: 'Service drop', value: <>~50 m of #2 AWG aluminium triplex aerial cable <Cite id="nec-2023" in={SOURCES} /></> },
            { label: 'Service ampacity', value: <>200 A continuous; main breaker sized to match <Cite id="nec-2023" in={SOURCES} /></> },
            { label: 'Meter', value: <>ANSI form-2S, four-blade socket, smart-meter with 15-min interval data <Cite id="ieee-std-3001-2-2017" in={SOURCES} /></> },
          ]}
        >
          <p>
            The numbers above describe a service that is at the median of new North-American suburban construction
            in the 2020s: 200 A panel, 25 kVA shared transformer, smart meter, aluminium triplex drop. At its rated
            current of 200 A on each hot, the service can deliver up to 48 kVA — already nearly twice the
            transformer's continuous rating, which is normal because the four houses on the same pole-pig do not
            all run at rated load simultaneously. Utility planners size pole-pigs by{' '}
            <Term def={<><strong>diversity factor</strong> — the ratio of the maximum sum of individual load demands to the actual coincident peak demand. Residential customers' peaks are spread through the day (cooking, laundry, HVAC) so a transformer can serve more than its nameplate kVA in summed-customer terms while staying within thermal limits.</>}>diversity factor</Term>:
            the assumption that customers' peaks don't coincide<Cite id="ieee-std-3001-2-2017" in={SOURCES} />.
          </p>
          <p>
            The same transformer can briefly handle 30–50 kVA on a hot evening when four ovens, two clothes
            dryers, and a window AC all kick on within the same minute, because its oil-and-iron mass takes
            minutes to climb in temperature. The IEEE service-sizing standard codifies the loading curves<Cite id="ieee-std-3001-2-2017" in={SOURCES} />,
            and the practical effect is that a "25 kVA" pole-pig is sized for an integrated daily load profile,
            not for an instantaneous worst-case sum.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 27.2"
          title="The neighbourhood substation that feeds the street"
          summary={<em>One step upstream from the pole-pig: the medium-voltage substation that gets the feeders going.</em>}
          specs={[
            { label: 'Transmission input', value: <>typically 69–138 kV line-to-line <Cite id="ansi-c84-1-2020" in={SOURCES} /></> },
            { label: 'Distribution output', value: <>13.8 kV three-phase wye, neutral grounded at the substation <Cite id="grainger-power-systems-2003" in={SOURCES} /></> },
            { label: 'Substation transformer rating', value: <>10–50 MVA depending on serving area <Cite id="grainger-power-systems-2003" in={SOURCES} /></> },
            { label: 'Feeders out of substation', value: <>typically 4–8 radial feeders, each serving up to a few thousand customers <Cite id="ieee-std-3001-2-2017" in={SOURCES} /></> },
            { label: 'Recloser strategy', value: <>auto-reclose after 1–2 s for transient faults; lockout after 3 attempts <Cite id="grainger-power-systems-2003" in={SOURCES} /></> },
          ]}
        >
          <p>
            One step upstream from the pole-pig on the corner is the distribution substation that energises the
            entire feeder. Substations sit at the boundary between the high-voltage transmission grid and the
            medium-voltage distribution system: a 69 kV or 138 kV transmission line comes in on one side, three
            big oil-filled step-down transformers reduce that to 13.8 kV (or 25 kV, or 34.5 kV depending on the
            utility), and four to eight radial feeders leave the other side to serve neighbourhoods<Cite id="grainger-power-systems-2003" in={SOURCES} />.
          </p>
          <p>
            The substation's distribution-side neutral is the one that's grounded — the very same neutral that
            wanders down the cross-arm of every pole on the feeder, hangs through the pole-pig's primary-side
            return path, and ultimately ties to the same earth your house's main bonding jumper ties to. The
            "ground" you have at your panel is in this sense the same ground the substation has, four miles
            upstream<Cite id="nec-2023" in={SOURCES} />.
          </p>
          <p>
            Reclosers along the feeder are the reason a tree branch hitting a wire usually causes a 2-second
            blink rather than a sustained outage: the recloser senses a fault, opens its breaker for one second
            to let the arc deionise, closes back in, and if the fault has cleared the lights come back<Cite id="grainger-power-systems-2003" in={SOURCES} />.
            Three failed attempts and the feeder locks out — that's when the truck rolls.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 27.3"
          title="The corroded service-entrance lug"
          summary={<em>One bad connection at the meter base burns out half the electronics in a house.</em>}
          specs={[
            { label: 'Failure mode', value: <>open neutral at service entrance (corroded lug or broken triplex strand)</> },
            { label: 'Resulting voltage on lightly loaded leg', value: <>up to ~200 V (60 % over nominal) <Cite id="ansi-c84-1-2020" in={SOURCES} /></> },
            { label: 'Resulting voltage on heavily loaded leg', value: <>as low as ~40 V (one-third nominal)</> },
            { label: 'Time to damage 120 V electronics', value: <>seconds to minutes; many devices fail near-instantly</> },
            { label: 'Detection at the panel', value: <>L1-L2 still reads ~240 V; only L1-N and L2-N reveal the asymmetry <Cite id="nec-2023" in={SOURCES} /></> },
          ]}
        >
          <p>
            A homeowner returns from a weekend trip to find every lamp on one side of the house bulged or
            shattered, the refrigerator dead, the microwave's display flickering, and the side of the house
            with the home office's electronics utterly dark. A meter reading shows L1–L2 at the expected 240 V
            — so the service looks healthy from end to end — but L1-to-neutral reads 195 V and L2-to-neutral
            reads 45 V. The neutral, somewhere between the pole-pig and the meter base, has lost continuity<Cite id="nec-2023" in={SOURCES} />.
          </p>
          <p>
            Diagnosing it is the easy part; preventing it is harder. The most common location is a corroded
            aluminium-to-bronze lug at the bottom of the meter base, where moisture and dissimilar-metal
            contact slowly form an oxide film of rising resistance. The connection appears intact visually but
            cannot carry the full neutral return current; eventually the contact opens entirely under load and
            the voltage divider above takes over. NEC Article 230 prescribes the use of anti-oxidant compound,
            torque-controlled connections, and periodic infrared inspection of service entrances for exactly
            this reason<Cite id="nec-2023" in={SOURCES} />.
          </p>
          <p>
            The legal and insurance fallout matters too: because the failure was on utility-owned hardware
            upstream of the meter, repair and electronics replacement are usually the utility's responsibility
            in the United States, but the homeowner has to detect and report the symptoms quickly enough to
            stop the damage from continuing. Whole-house surge protectors with open-neutral detection are now
            sold specifically to interrupt the panel before the lightly-loaded leg's voltage damages anything
            further<Cite id="grainger-power-systems-2003" in={SOURCES} />.
          </p>
        </CaseStudy>
      </CaseStudies>

      <FAQ
        intro={
          <>
            Questions readers ask after their first walk-through of the service entrance — the things that don't
            quite add up until someone explains why the geometry is the way it is.
          </>
        }
      >
        <FAQItem q="Why is North-American residential service 240/120 V while Europe runs 230/400 V?">
          <p>
            Edison's 1882 New York DC system delivered roughly 110 V — set by the working voltage of the carbon-filament
            bulbs of the era — and every subsequent piece of North-American hardware inherited the choice. By the time
            AC took over, "120 V to the wall, 240 V end-to-end on a centre-tapped secondary" was already baked in.
            Europe rebuilt later (partly post-war) and standardised on a single-phase 230 V to neutral, three-phase
            400 V line-to-line; the result is thinner wiring inside the wall and no need for a second voltage to be
            split out for big appliances. Both work — neither is wrong — and ANSI C84.1 codifies the U.S. nominal
            voltages today<Cite id="ansi-c84-1-2020" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="If there are two hot wires entering my house, what does 'single-phase' even mean?">
          <p>
            "Single-phase" refers to the upstream side of the pole-pig: only <em>one</em> of the three medium-voltage
            phases on the feeder is feeding your transformer's primary winding. The transformer's secondary has a
            centre tap that splits the resulting 240 V into two halves, 180° out of phase with each other about the
            centre. Strictly speaking that's still "one phase, split into two halves," not two independent phases.
            "Two-phase" historically refers to a different and now-extinct system where two independent phases were
            shifted by 90° rather than 180° — the term is reserved and not what residential service
            does<Cite id="ansi-c84-1-2020" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why is neutral bonded to ground only at the service entrance and nowhere else in the house?">
          <p>
            Because bonding at one point keeps the ground wire idle under normal operation: load current returns
            entirely on neutral and only the fault path uses ground. Bond again downstream — say, at a subpanel —
            and ordinary load current splits, with some returning on the ground conductor, the conduit, the water
            pipes, and any other metal that connects the two bond points. The result is stray voltage on objects
            that are supposed to be safe to touch, RF noise on electronics, and corrosion on bonded plumbing. NEC
            §250.24 prescribes the single-point bond at the service disconnect and forbids the second one
            downstream<Cite id="nec-2023" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Is the meter itself fused? Can it overload?">
          <p>
            No — the revenue meter is not a protective device. The service-entrance wiring upstream of the meter
            is sized to handle the rated continuous current of the service (100, 200, or 400 A), and the main
            breaker just inside the panel does the protecting. A meter rated for 200 A can carry several hundred
            amps briefly without melting, which is intentional: the meter must not be the bottleneck during a
            severe fault, because pulling a meter under load can draw an arc that destroys the meter base or
            injures the lineworker. The NEC service-entrance rules in Article 230 size everything upstream of
            the main breaker to survive the maximum available fault current the utility can deliver<Cite id="nec-2023" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What happens if a falling tree limb knocks down only one of the two hot wires?">
          <p>
            Everything on the surviving leg keeps working at its rated 120 V; everything on the lost leg goes
            dark; and any 240 V appliance loses power because it depends on both hots being present. The neutral
            is still intact, so the voltage divider failure mode of the open-neutral case does not apply — each
            surviving leg still has its proper reference to ground. This is the comparatively benign single-hot
            failure, and it is usually announced by half the house going dark while the other half stays normal.
            The utility's reclosers may try to clear the fault, and if the fallen conductor is still on the ground
            the recloser eventually locks out the feeder<Cite id="grainger-power-systems-2003" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why does the utility own the meter but I own the meter base?">
          <p>
            Because the meter is the utility's revenue-grade measurement instrument — calibrated, sealed, owned
            and maintained by the utility — while the meter base is part of the building's electrical system,
            permanently attached to the wall, and inspected as part of the homeowner's service installation. The
            jurisdictional line runs through the four jaws of the socket itself: customer-side of the jaws is
            yours, utility-side of the jaws (and the meter that plugs in) is theirs<Cite id="ieee-std-3001-2-2017" in={SOURCES} />.
            The anti-tampering seal on the ring is the visible legal boundary; cutting it without authorization
            is electricity theft.
          </p>
        </FAQItem>

        <FAQItem q="Can a smart meter be hacked or fooled to read low?">
          <p>
            In principle yes — the meter is a microcontroller with firmware and a radio, and any networked
            embedded device has an attack surface — but utilities have layered defenses: signed firmware, mutual
            authentication on the AMI mesh, server-side anomaly detection that flags any meter whose reported
            energy disagrees with substation-level totals by more than a few percent. Physical tampering
            (pulling the meter, bypassing it with a jumper) is much easier than firmware tampering but is
            detected by the anti-tampering seal and by the meter's own pulse log of power interruptions. Most
            real-world electricity theft is still physical-bypass, not cyber<Cite id="ieee-std-3001-2-2017" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why is the pole-pig oil-filled, and how does it stay cool?">
          <p>
            Mineral oil does two things at once: it insulates the high-voltage windings from each other and from
            the grounded tank, and it convects heat from the windings to the outer skin of the tank, where it
            radiates and convects to the ambient air. The oil's electrical breakdown strength is roughly 30 kV
            per millimetre, far higher than air — which is why the windings can be spaced very tightly inside the
            tank and the whole package can be made small. There is no fan and no pump: thermosiphon convection
            does all the cooling, which is why pole-pigs can sit on a pole exposed to the weather for fifty years
            with no maintenance and almost no moving parts<Cite id="grainger-power-systems-2003" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="How does a hurricane outage propagate from substation to my street?">
          <p>
            Outage propagation is roughly: a downed tree somewhere along a feeder causes a fault current to flow,
            the nearest fuse or recloser opens, and every customer downstream of that protective device goes dark
            simultaneously. The substation's breaker may or may not also trip depending on how the protective
            coordination is set; if the fault is large enough or the recloser fails, the substation itself can
            lock out and an entire feeder of thousands of customers loses power<Cite id="grainger-power-systems-2003" in={SOURCES} />.
            Restoration runs in the opposite direction: line crews patrol from the substation outward, clearing
            faulted segments, replacing fuses, re-energising one branch at a time. This is why distant outages
            often come back in steps over hours.
          </p>
        </FAQItem>

        <FAQItem q="What's a 'transfer switch' and why do generator owners need one?">
          <p>
            A transfer switch is a mechanically interlocked switch that selects between two power sources — the
            utility service and the generator — and physically prevents both from feeding the panel
            simultaneously. The interlock matters because back-feeding utility lines from an unsynchronised
            generator can energise a "dead" service-drop wire that a lineworker is repairing, with potentially
            fatal results. NEC Article 702 and 705 require that any standby or interconnected generator be wired
            through a listed transfer switch (or an equivalent interlock kit on the main panel) so that the
            generator side cannot back-feed when the utility is the live source, and vice versa<Cite id="nec-2023" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why does my voltage briefly drop when the neighbour's AC kicks on?">
          <p>
            Because you share a pole-pig and a service drop. When their compressor motor starts, it draws an
            inrush current of perhaps 5–7× its running current for a fraction of a second, and that current flows
            through the shared transformer impedance and the shared upstream conductors. The voltage at the
            shared bus dips by I·Z, where Z is the Thévenin impedance of the upstream supply seen from the
            transformer secondary. A few percent dip is normal; more than that suggests the transformer or the
            drop is undersized for the diversity factor the utility planners assumed<Cite id="grainger-power-systems-2003" in={SOURCES} /><Cite id="ieee-std-3001-2-2017" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What does the lock-ring on the meter base actually do, mechanically?">
          <p>
            It's a steel band that wraps the rim where the cylindrical meter meets the socket; tightening the
            ring's screw clamps the meter into the four jaws of the socket and prevents it from being pulled
            out by hand. A small hole on the ring's screw head accepts a lead-and-wire utility seal stamped with
            a serial number tied to the meter installation. Cutting that seal is a criminal offense in nearly
            every U.S. jurisdiction (electricity theft), and the seal also provides forensic evidence after the
            fact: if a fire investigator finds a cut or missing seal, the resulting damage may not be covered by
            the customer's insurance<Cite id="ieee-std-3001-2-2017" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="If my service is rated 200 A, can I actually pull 200 A continuously?">
          <p>
            Yes, but only because every component upstream — wiring, breaker, meter, transformer share — has been
            sized to the same continuous rating with appropriate derating. The NEC 80 % continuous-load rule
            (§210.20) requires that a circuit's <em>continuous</em> load not exceed 80 % of the breaker's
            ampacity, so a 200 A main is good for 160 A continuous and 200 A non-continuous. In practice few
            houses ever come close to 200 A continuous; the rating sets the worst-case design envelope, and the
            diversity factor that the utility used to size the upstream transformer assumes you don't sit at the
            envelope<Cite id="nec-2023" in={SOURCES} /><Cite id="ieee-std-3001-2-2017" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="How is the meter's measurement accurate to a fraction of a percent over decades?">
          <p>
            Mechanical Ferraris meters relied on geometry alone — the disc's torque was exactly proportional to
            V · I by construction, and the only thing that could drift was the eddy-current brake's calibration,
            which utilities checked on a rotating sample. Solid-state meters use a precision voltage divider, a
            CT or shunt-resistor current sensor, and an integrating ADC that multiplies the two channels every
            millisecond and accumulates; the multiplier circuit is calibrated at the factory and the meter's
            firmware logs deviations from its self-test reference. Both architectures hit accuracy classes of
            0.2–0.5 % over their service lifetimes<Cite id="ieee-std-3001-2-2017" in={SOURCES} /><Cite id="grainger-power-systems-2003" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why does the utility insist the service entrance be on the outside of the building?">
          <p>
            For three reasons in roughly equal weight. First, exterior-mounted meters let the utility read and
            replace them without entering the customer's house — a logistics win that justified the entire
            transition from interior to exterior bases in the 1950s. Second, an exterior meter base provides a
            single accessible point where the utility can disconnect the service (by pulling the meter) without
            cutting any wires, which is critical in emergencies. Third, the NEC requires the service-entrance
            disconnect to be "readily accessible" and "nearest the point of entrance of the service conductors"
            (§230.70), which the exterior position satisfies most cleanly<Cite id="nec-2023" in={SOURCES} />.
          </p>
        </FAQItem>
      </FAQ>
    </ChapterShell>
  );
}
