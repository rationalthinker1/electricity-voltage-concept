/**
 * Chapter 33 — The smart meter and the bill
 *
 * Seventh chapter of the applied "house electricity" track. Picks up where
 * Ch.27 left off at the four-jaw meter socket and looks inside the meter
 * itself: the four energies it measures (kWh, kVAh, kVARh, kW peak demand),
 * the legacy induction-disk mechanical integrator that did the same job
 * with eddy currents, the modern solid-state meter with CTs and an ADC,
 * the tariff structures (flat, time-of-use, demand, power-factor penalty,
 * net metering, feed-in), and what the meter does and does not see.
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

export default function Ch33HouseSmartMeter() {
  const chapter = getChapter('house-smart-meter')!;
  const SOURCES = chapter.sources;

  return (
    <ChapterShell chapter={chapter}>
      <p className="chapter-intro">
        Look at the LCD on your smart meter for a minute. If you stand still long enough, the display cycles
        through several different readings: kilowatt-hours delivered since the meter was installed, kilowatt-hours
        received from your house back to the grid (if you have rooftop solar), the highest sustained kilowatt draw
        over any fifteen-minute window in the current billing period, and sometimes a single-decimal-place
        power-factor figure or a reactive-energy total. Four quantities measured continuously, only one or two of
        which appear on your bill — and exactly which ones depends on your tariff and whether you are a household
        or an industrial customer<Cite id="ansi-c12-1-2014" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        This chapter is about what is actually inside that small grey box and how the bill that arrives at the end
        of the month gets built from its readings. We will walk from the physics of the measurement — voltage and
        current sampled a few thousand times per second on each phase and integrated four different ways — through
        the legacy induction-disk meter that did the same job mechanically for a century, on through the modern
        solid-state architecture with its current transformers and integrated ADC, and finally through the tariff
        structures (flat-rate, time-of-use, demand, power-factor penalty, net metering, feed-in) that turn the
        meter's accumulators into a number of dollars.
      </p>

      <h2 className="chapter-h2">What the meter <em>measures</em> — four quantities, not one</h2>

      <p className="mb-prose-3">
        Every modern revenue meter sits between two pairs of wires — line voltage in, load voltage out, with the
        current passing straight through — and samples both the instantaneous voltage <strong className="text-text font-medium">V(t)</strong> across
        its terminals and the instantaneous current <strong className="text-text font-medium">I(t)</strong> through them at a rate of one to four
        thousand times per second per phase<Cite id="ansi-c12-20-2015" in={SOURCES} />. From those two sampled
        streams the firmware computes four running integrals in parallel and accumulates each into its own
        register. The first and most important is{' '}
        <Term def={<><strong className="text-text font-medium">real energy</strong> (kWh) — the time integral of the <em className="italic text-text">instantaneous</em> product V(t)·I(t). Equal to the cumulative work done by the source on the load, counted in joules and then converted to the engineering unit of kilowatt-hours (1 kWh = 3.6×10⁶ J). The only one of the four meter quantities that residential customers pay for.</>}>real energy</Term>,
        in kilowatt-hours, the time integral of instantaneous power:
      </p>
      <Formula tex="\\text{kWh} = \\int V(t)\\, I(t)\\, dt" />
      <p className="mb-prose-3">
        where the integral on the right runs over the billing period and yields joules (which the meter then
        divides by 3.6×10⁶ to display kilowatt-hours). <strong className="text-text font-medium">V(t)</strong> is the instantaneous service voltage
        in volts, <strong className="text-text font-medium">I(t)</strong> is the instantaneous current flowing through the meter in amperes (signed
        — positive when energy is flowing into the house, negative when it is being exported), and{' '}
        <strong className="text-text font-medium">t</strong> is time in seconds. The product V(t)·I(t) is the instantaneous real power in watts; its
        integral is the cumulative energy delivered<Cite id="grainger-power-systems-2003" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        The second quantity is the{' '}
        <Term def={<><strong className="text-text font-medium">apparent energy</strong> (kVAh) — the time integral of the product of RMS voltage and RMS current, with no regard to their phase relationship. Equal to the "envelope" of the VI product. Always greater than or equal to real energy; equality holds only when the load is purely resistive (PF = 1).</>}>apparent energy</Term>{' '}
        in kilovolt-ampere-hours, the integral of the product of root-mean-square voltage and current with their
        phase relationship ignored:
      </p>
      <Formula tex="\\text{kVAh} = \\int V_{\\text{rms}}\\, I_{\\text{rms}}\\, dt" />
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">V<sub>rms</sub></strong> and <strong className="text-text font-medium">I<sub>rms</sub></strong> are the running RMS values of
        the voltage and current waveforms (in volts and amperes), computed over a short averaging window. The
        product is the "envelope" of the VI product — the apparent power the supply has to deliver, regardless of
        whether that power is dissipated or merely sloshes back and forth.
      </p>
      <p className="mb-prose-3">
        The third quantity is the{' '}
        <Term def={<><strong className="text-text font-medium">reactive energy</strong> (kVARh) — the cumulative integral of V(t)·I(t-π/2): the part of the VI product that is 90° out of phase. Represents the energy that sloshes into and out of inductors and capacitors each cycle without being dissipated. Industrial customers pay penalties on it; residential ones usually do not.</>}>reactive energy</Term>{' '}
        in kilovolt-ampere-reactive-hours, the integral of voltage against the current shifted by a quarter cycle:
      </p>
      <Formula tex="\\text{kVARh} = \\int V(t)\\, I(t - \\pi/2\\omega)\\, dt" />
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">ω = 2πf</strong> is the angular frequency of the line (377 rad/s in North America), and the
        quarter-cycle delay isolates the part of the current that is 90° out of phase with the voltage — the part
        that flows into and out of inductors and capacitors each cycle without depositing any net energy. The
        three integrals together obey a Pythagorean relation that recovers the power triangle from{' '}
        <Term def={<><strong className="text-text font-medium">chapter 12's power triangle</strong> — the right-triangle identity P² + Q² = S², where P is real power, Q is reactive power, and S is apparent power. Each meter integrates each leg over time into its own register, then the triangle holds for the cumulative energies as well: kWh² + kVARh² = kVAh².</>}>chapter 12</Term>:
      </p>
      <Formula tex="\\text{kVA}^2 = \\text{kW}^2 + \\text{kVAR}^2" />
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">kVA</strong> is apparent power (in kilovolt-amperes), <strong className="text-text font-medium">kW</strong> is real power (in
        kilowatts — the work-doing component), and <strong className="text-text font-medium">kVAR</strong> is reactive power (in kilovolt-amperes
        reactive — the sloshing component). The same Pythagorean relation holds between the three energies as
        well: kVAh² = kWh² + kVARh²<Cite id="grainger-power-systems-2003" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        The fourth quantity is{' '}
        <Term def={<><strong className="text-text font-medium">peak demand</strong> (kW max) — the highest sustained real power averaged over any rolling window (typically 15 minutes) during a billing period. Drives the sizing of the utility's transformers, feeders, and generation: a customer that pulls 50 kW for 15 minutes once a month forces the utility to build infrastructure for 50 kW even though most of the time they pull a tenth of that.</>}>peak demand</Term>,
        in kilowatts, the highest sustained real power averaged over any rolling fifteen-minute window during the
        billing period<Cite id="ansi-c12-1-2014" in={SOURCES} />. Unlike the other three (which are cumulative
        integrals), demand is a maximum: the meter looks at the average power over each fifteen-minute window,
        keeps the largest, and resets it at the start of each billing cycle. Demand is what drives the utility's
        capital costs — transformers, feeders, and generation must be sized to the customer's peak, not to their
        average.
      </p>

      <TryIt
        tag="Try 33.1"
        question={
          <>
            A house averages <strong className="text-text font-medium">30 kWh per day</strong> at a flat <strong className="text-text font-medium">$0.20/kWh</strong> rate. The
            monthly (30-day) bill from the energy charge alone is what?
          </>
        }
        hint="Multiply daily energy by 30 to get monthly kWh, then by the rate."
        answer={
          <>
            <Formula tex="\\text{kWh}_{\\text{month}} = 30\\ \\text{kWh/day} \\times 30\\ \\text{days} = 900\\ \\text{kWh}" />
            <Formula tex="\\text{Bill} = 900\\ \\text{kWh} \\times \\$0.20/\\text{kWh} = \\$180" />
            <p className="mb-prose-1 last:mb-0">
              Right in the middle of the U.S. residential range. Add a small fixed monthly service charge
              ($5–$15 depending on utility) and that is the whole bill on a flat-rate plan<Cite id="ansi-c12-1-2014" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2 className="chapter-h2">The induction-disk <em>legacy</em> meter</h2>

      <p className="mb-prose-3">
        Before microcontrollers were cheap enough to put on every house, every revenue meter on every street in
        North America was the same little glass-domed cylinder with an aluminium disk visibly spinning behind the
        face: the{' '}
        <Term def={<><strong className="text-text font-medium">induction-disk meter</strong> (Ferraris / Thomson kWh meter) — the original electromechanical revenue meter, in service from the 1890s through the early 2000s. A thin aluminium disk spins between two electromagnets (a voltage coil and a current coil) whose phased fields exert a torque proportional to instantaneous real power. A brake magnet linearises the disk's rotational speed so cumulative revolutions count cumulative energy.</>}>induction-disk meter</Term>.
        The mechanism is a small marvel of nineteenth-century electromechanical thinking — a meter that integrates
        V·I·cos(φ) over time using nothing but eddy currents, geometry, and a permanent magnet for braking<Cite id="grainger-power-systems-2003" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        Two electromagnets drive the disk. The voltage coil is wound with many turns of thin wire and connects
        across the line; its flux through the disk is therefore proportional to the line voltage. The current coil
        is wound with few turns of thick wire and carries the full load current; its flux is proportional to the
        load current. The two fluxes pass through the same aluminium disk but in slightly different positions, and
        their interaction induces eddy currents in the disk. The torque on the disk from the eddy-current /
        magnetic-field interaction is exactly proportional to the time-averaged product{' '}
        <strong className="text-text font-medium">V·I·cos(φ)</strong> — that is, to the real power crossing the meter — with the cos(φ) appearing
        automatically because the two coils are designed to have a 90° phase difference in their flux
        contributions so that purely reactive current contributes zero net torque.
      </p>
      <p className="mb-prose-3">
        Without anything else, that torque would simply accelerate the disk forever. The trick that converts a
        torque-meter into an integrator is a permanent-magnet eddy-current brake: a horseshoe magnet straddles the
        edge of the disk on the opposite side from the drive coils, and as the disk spins, the magnet's field
        induces eddy currents in the disk that produce a retarding torque proportional to the disk's angular
        velocity. The disk reaches a steady angular velocity at which the drive torque equals the brake torque,
        and that velocity is therefore proportional to the real power. Cumulative revolutions are then the time
        integral of power — that is, energy<Cite id="grainger-power-systems-2003" in={SOURCES} />. A geared
        mechanical register on the front face of the meter converts disk revolutions to kilowatt-hours through a
        fixed gear ratio: typical mechanical meters spin at one revolution per 7.2 watt-hours, so 500 revolutions
        is exactly one kilowatt-hour.
      </p>
      <p className="mb-prose-3">
        The induction-disk meter has no microcontroller, no ADC, no firmware to update, and no radio to
        compromise. Its accuracy is set by geometry — the spacing of the coils, the temperature stability of the
        brake magnet, the linearity of the eddy-current torque — and is typically maintained at the 0.5 %
        accuracy class for the meter's whole multi-decade service life. Utilities ran field-calibration trucks
        with reference meters to verify a rotating sample of installed meters each year; mechanical drift was
        rare. The whole architecture is, mechanically, an analog kWh integrator — and several million of them
        are still installed and operating in North America today.
      </p>

      <h2 className="chapter-h2">The solid-state <em>smart</em> meter</h2>

      <p className="mb-prose-3">
        Since roughly 2005, almost every new and replacement meter installed in North America has been
        solid-state. Strip the housing off a modern{' '}
        <Term def={<><strong className="text-text font-medium">smart meter</strong> — a solid-state revenue meter with a microcontroller, an integrating ADC, current transformers (or shunts) on each phase, two-way digital communication (RF mesh, cellular LTE-M, or PLC), and onboard accumulators for kWh, kVAh, kVARh, and peak demand. Replaces both the mechanical Ferraris meter and the monthly meter-reader visit.</>}>smart meter</Term>{' '}
        and you find a microcontroller, an integrating multi-channel ADC, a precision voltage divider on each line
        terminal, a{' '}
        <Term def={<><strong className="text-text font-medium">current transformer (CT)</strong> — a transformer whose primary is the load conductor passing once through a toroidal core and whose secondary delivers a scaled-down replica of the primary current into a small burden resistor. Lets a meter measure hundreds of amperes without breaking the service conductor or dissipating the I²R loss that would occur in a shunt.</>}>current transformer</Term>{' '}
        (sometimes a precision shunt resistor for smaller services) on each hot leg, an EEPROM for the accumulator
        registers, an LCD driver, and a radio module — typically a sub-GHz mesh radio (the AMI mesh used by the
        utility), occasionally a cellular LTE-M modem, occasionally a ZigBee link for in-home display<Cite id="ansi-c12-20-2015" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        The signal-chain is straightforward. The{' '}
        <Term def={<><strong className="text-text font-medium">voltage divider</strong> — a pair of precision resistors that scales the line voltage down to a level the meter's ADC can sample directly without breakdown. A typical residential meter uses a divider ratio around 1000:1 so that a 240 V line appears as 240 mV at the ADC input.</>}>voltage divider</Term>{' '}
        scales the 120 V or 240 V line down to a few hundred millivolts; the CT's burden resistor scales the
        100–200 A primary down to a few hundred millivolts as well; both signals enter the ADC as a pair of
        millivolt-level waveforms; the firmware multiplies them sample-by-sample at the 1–4 kHz sampling rate to
        get an instantaneous power waveform, integrates that into the kWh register, and in parallel computes
        running RMS values and quarter-cycle-shifted products for the kVAh and kVARh registers<Cite id="ansi-c12-1-2014" in={SOURCES} />.
        Each register is written to non-volatile memory every few seconds so a power outage does not lose the
        running total.
      </p>
      <p className="mb-prose-3">
        The radio reports back to the utility — usually once every fifteen minutes, sometimes every five minutes
        in newer deployments — through the{' '}
        <Term def={<><strong className="text-text font-medium">advanced metering infrastructure</strong> (AMI) — the utility's two-way communications network connecting smart meters to the billing back-end. Typically a sub-GHz RF mesh with each meter relaying its neighbours' packets to the nearest "collector," from which packets travel by cellular or fiber to the utility data center.</>}>advanced metering infrastructure</Term>{' '}
        (AMI) mesh: each meter relays its neighbours' packets to the nearest "collector" on a pole or rooftop,
        from which the data travels over cellular or fiber back to the utility's billing data center. The mesh is
        designed for the worst-case packet-loss environment of a residential neighbourhood and typically delivers
        interval-data integrity above 99.5 %. Each meter has a unique cryptographic key burned in at the factory,
        and meter-to-collector traffic is authenticated and (in modern deployments) encrypted; the early
        deployments of the mid-2000s were not encrypted and produced a steady stream of academic-security papers
        showing how the readings could be intercepted, but the standards have since hardened<Cite id="ansi-c12-20-2015" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        ANSI C12.20 defines several{' '}
        <Term def={<><strong className="text-text font-medium">accuracy class</strong> — the meter's certified worst-case error as a percentage of full-scale reading. Class 0.5 means ±0.5 % of the reported energy under nominal operating conditions over the meter's service life. Class 0.2 is twice as accurate and reserved for industrial / sub-metering. Class 0.1 is laboratory grade.</>}>accuracy classes</Term>{' '}
        for these meters: <strong className="text-text font-medium">0.1</strong>, <strong className="text-text font-medium">0.2</strong>, and <strong className="text-text font-medium">0.5</strong>, named for the
        worst-case percentage error of the reported energy at nominal operating conditions<Cite id="ansi-c12-20-2015" in={SOURCES} />.
        Residential meters are almost always class 0.5 (±0.5 % over the life of the meter). Industrial and
        sub-metering installations use class 0.2 (±0.2 %). Reference and revenue-tie meters at substations and
        at the boundary between utility territories use class 0.1.
      </p>

      <TryIt
        tag="Try 33.2"
        question={
          <>
            A solid-state meter of accuracy class <strong className="text-text font-medium">0.5</strong> reports <strong className="text-text font-medium">850 kWh</strong> over a
            billing cycle. What is the maximum delivered energy that could correspond to (worst-case
            under-reading)?
          </>
        }
        hint="Class 0.5 means the meter's reading could be off by ±0.5 % of the true value."
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">
              If the meter is reading <em className="italic text-text">low</em> by the full 0.5 % allowance, the true energy is the reported
              value divided by 0.995:
            </p>
            <Formula tex="\\text{kWh}_{\\text{true,max}} = 850/0.995 \\approx 854.3\\ \\text{kWh}" />
            <p className="mb-prose-1 last:mb-0">
              About 4 kWh of headroom in the customer's favour at this billing total — roughly $0.50 to $1.00
              depending on the rate. Over a million meters and a year of billings, those single-percent margins
              are why the utility cares about accuracy class to two decimal places<Cite id="ansi-c12-20-2015" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2 className="chapter-h2">The bill itself — tariffs, demand, time-of-use</h2>

      <p className="mb-prose-3">
        Residential bills in North America are dominated by a single per-kilowatt-hour charge — a flat rate of
        roughly <strong className="text-text font-medium">$0.12 to $0.30</strong> per kWh depending on geography and season, plus a small fixed
        monthly "service" or "customer" charge of $5 to $15 that covers the meter, the service drop, and the
        billing-system overhead<Cite id="ansi-c12-1-2014" in={SOURCES} />. The meter's real-energy register at
        the end of the billing period minus the register at the start gives the kWh consumed; the utility
        multiplies by the per-kWh rate, adds the fixed charge, and that is the bill. Most of the country's
        residential customers have lived under this structure for a century, and many still do.
      </p>
      <p className="mb-prose-3">
        Increasingly, however, residential tariffs are{' '}
        <Term def={<><strong className="text-text font-medium">time-of-use</strong> (TOU) — a tariff structure in which the per-kWh rate varies by hour of the day (and sometimes by day of the week or season). Designed to expose customers to the underlying time-varying cost of generation: cheap off-peak nighttime power, expensive peak-evening power. Enabled by smart meters that report interval data.</>}>time-of-use</Term>{' '}
        (TOU): the per-kWh rate depends on the hour at which the energy was consumed. A typical California PG&E
        TOU schedule charges about <strong className="text-text font-medium">$0.27/kWh</strong> during peak hours (4 pm to 9 pm, when air
        conditioning demand stacks against the evening sunset-and-cooking peak) and about{' '}
        <strong className="text-text font-medium">$0.13/kWh</strong> off-peak (the rest of the day and all night). The meter's interval data is
        what makes this possible: each fifteen-minute energy reading carries a timestamp, and the billing
        back-end sums the kWh against the rate schedule one interval at a time<Cite id="ansi-c12-1-2014" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        Industrial and large-commercial customers see a structurally different bill. In addition to a per-kWh
        energy charge (often itself time-of-use), they pay a{' '}
        <Term def={<><strong className="text-text font-medium">demand charge</strong> — a per-kilowatt fee applied to the customer's peak 15-minute average real power during the billing period. Typically $10–$30 per kW per month for industrial customers. Reflects the utility's fixed capital cost of transformers, feeders, and generation sized to the customer's peak rather than their average.</>}>demand charge</Term>{' '}
        of <strong className="text-text font-medium">$10 to $30 per kW</strong> of peak fifteen-minute demand, and often a power-factor penalty:
        a surcharge if the average power factor over the billing period drops below 0.85 or 0.90. The demand
        charge is the customer's contribution to the utility's capital cost — the transformers and feeders that
        had to be built to serve their peak, even if the peak only lasts fifteen minutes a month. The
        power-factor surcharge is the customer's contribution to the I²R loss that their reactive current
        imposes on the utility's wires upstream<Cite id="grainger-power-systems-2003" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        Residential customers are usually exempted from both demand charges and power-factor penalties because
        their loads are mostly resistive (heat, lights, electronics with power-factor-corrected supplies) and
        because the residential diversity factor — peaks at different times in different houses — averages the
        burden across the neighbourhood pole-pig. The utility recovers the same capital cost from residential
        customers as an embedded component of the per-kWh rate rather than as a separate demand line item.
      </p>

      <TryIt
        tag="Try 33.3"
        question={
          <>
            A house's HVAC system draws <strong className="text-text font-medium">5 kW for 6 hours</strong> during peak (4–9 pm) and <strong className="text-text font-medium">1.5 kW
            continuous</strong> during the remaining 18 off-peak hours of the day. On a TOU schedule of{' '}
            <strong className="text-text font-medium">$0.30/kWh peak</strong> and <strong className="text-text font-medium">$0.13/kWh off-peak</strong>, what is the daily bill from
            HVAC alone?
          </>
        }
        hint="Compute kWh in each window separately, then sum the cost at each rate."
        answer={
          <>
            <Formula tex="\\text{kWh}_{\\text{peak}} = 5\\ \\text{kW} \\times 6\\ \\text{h} = 30\\ \\text{kWh}" />
            <Formula tex="\\text{kWh}_{\\text{off}} = 1.5\\ \\text{kW} \\times 18\\ \\text{h} = 27\\ \\text{kWh}" />
            <Formula tex="\\text{Cost}_{\\text{peak}} = 30 \\times \\$0.30 = \\$9.00" />
            <Formula tex="\\text{Cost}_{\\text{off}} = 27 \\times \\$0.13 = \\$3.51" />
            <Formula tex="\\text{Daily total} = \\$12.51" />
            <p className="mb-prose-1 last:mb-0">
              Roughly $375/month from HVAC alone — and notice that the peak window contributes more than twice
              the cost of the off-peak window despite only running a quarter of the hours. Shifting load out of
              the peak window (pre-cooling the house before 4 pm, raising the thermostat between 4 and 9, running
              the dishwasher after 9) is the optimisation the TOU rate is designed to incentivise<Cite id="ansi-c12-1-2014" in={SOURCES} />.
            </p>
          </>
        }
      />

      <TryIt
        tag="Try 33.4"
        question={
          <>
            A factory has a <strong className="text-text font-medium">1,000 kVA</strong> service running at <strong className="text-text font-medium">PF = 0.78</strong>, with a peak
            real-power demand of <strong className="text-text font-medium">780 kW</strong>. The utility charges <strong className="text-text font-medium">$0.10/kWh</strong> plus{' '}
            <strong className="text-text font-medium">$15/kW</strong> of peak demand plus a <strong className="text-text font-medium">$5/kVAR</strong> penalty on the kVAR drawn
            above a PF-threshold of 0.85. Installing a $50,000 power-factor-correction capacitor bank raises
            the PF to <strong className="text-text font-medium">0.95</strong>. Assume <strong className="text-text font-medium">700 operating hours/month</strong> at full load. How
            much does the factory save per month, and how long until the capacitor pays for itself?
          </>
        }
        hint="Compute kVAR before and after correction. Then compute the penalty against the 0.85 threshold for each case. Energy and demand charges don't change — only the PF penalty does."
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">
              Before correction, real power is 780 kW and apparent power is 780 / 0.78 = 1000 kVA, so:
            </p>
            <Formula tex="\\text{kVAR}_{\\text{before}} = \\sqrt{1000^2 - 780^2} = \\sqrt{1{,}000{,}000 - 608{,}400} = \\sqrt{391{,}600} \\approx 626\\ \\text{kVAR}" />
            <p className="mb-prose-1 last:mb-0">
              The penalty threshold of PF = 0.85 at 780 kW real corresponds to:
            </p>
            <Formula tex="\\text{kVAR}_{\\text{threshold}} = 780 \\times \\tan(\\arccos(0.85)) \\approx 780 \\times 0.620 \\approx 483\\ \\text{kVAR}" />
            <Formula tex="\\text{Penalty}_{\\text{before}} = (626 - 483) \\times \\$5 \\approx \\$715/\\text{month}" />
            <p className="mb-prose-1 last:mb-0">
              After correction to PF = 0.95:
            </p>
            <Formula tex="\\text{kVAR}_{\\text{after}} = 780 \\times \\tan(\\arccos(0.95)) \\approx 780 \\times 0.329 \\approx 257\\ \\text{kVAR}" />
            <p className="mb-prose-1 last:mb-0">
              257 kVAR is below the 483 kVAR threshold, so the penalty drops to zero. The capacitor saves the
              full <strong className="text-text font-medium">$715/month</strong>. The $50,000 capital cost pays back in:
            </p>
            <Formula tex="\\text{Payback} = \\$50{,}000/\\$715/\\text{month} \\approx 70\\ \\text{months} \\approx 5.8\\ \\text{years}" />
            <p className="mb-prose-1 last:mb-0">
              A typical industrial PF-correction payback period<Cite id="grainger-power-systems-2003" in={SOURCES} />.
              The energy charge (700 h × 780 kW × $0.10 = $54,600/month) and demand charge ($15 × 780 = $11,700)
              are unaffected — the capacitor only fixes the reactive draw on the wires upstream.
            </p>
          </>
        }
      />

      <Pullout>
        Real energy is the only quantity you pay for at home — but the meter dutifully measures three others, just
        in case the rules change tomorrow.
      </Pullout>

      <h2 className="chapter-h2">Net metering, feed-in, and <em>bidirectional</em> flow</h2>

      <p className="mb-prose-3">
        A rooftop PV array changes the meter's life. On a sunny weekday around noon, the panels produce more power
        than the house consumes, and the surplus flows backward through the meter and onto the service drop. The
        meter — designed from the start as a bidirectional sensor — sees current of the opposite sign and
        accumulates the negative-going energy into a separate "delivered to grid" register, leaving the
        "delivered from grid" register alone<Cite id="ansi-c12-1-2014" in={SOURCES} />. Older mechanical meters
        would simply spin backwards under the same conditions, netting the customer's import against their export
        on a single register — a system that worked perfectly well for the first generation of grid-tied solar
        but is no longer the dominant approach.
      </p>
      <p className="mb-prose-3">
        Three different tariff structures handle the bidirectional flow. The simplest, and the structure most
        common in the U.S. through the 2010s, is{' '}
        <Term def={<><strong className="text-text font-medium">net metering</strong> — a tariff in which the customer is billed for the difference between kWh imported and kWh exported, at the prevailing retail rate. Exports effectively earn the same per-kWh as imports cost. Generous to solar customers; criticised for under-pricing the utility's fixed costs.</>}>net metering</Term>{' '}
        — the customer pays the difference between energy imported and energy exported at a single retail rate:
      </p>
      <Formula tex="\\text{Bill} = R \\times (\\text{kWh}_{\\text{in}} - \\text{kWh}_{\\text{out}})" />
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">R</strong> is the per-kWh retail rate (in $/kWh), <strong className="text-text font-medium">kWh<sub>in</sub></strong> is total
        energy imported from the grid during the billing period (in kWh), and <strong className="text-text font-medium">kWh<sub>out</sub></strong>{' '}
        is total energy exported (in kWh). If the customer exports more than they import in a given month, the
        bill goes to zero (or to the fixed charge alone), and the surplus rolls forward as a credit to the next
        month.
      </p>
      <p className="mb-prose-3">
        A{' '}
        <Term def={<><strong className="text-text font-medium">feed-in tariff</strong> — a tariff structure in which exported energy is purchased by the utility at a separately set price, usually lower than (but sometimes higher than) the retail rate. Common in Europe; used in the U.S. for utility-scale renewable purchasing but rarer for residential.</>}>feed-in tariff</Term>{' '}
        separates the two streams: imports are billed at the retail rate, exports are purchased at a different
        (typically lower) wholesale rate, and the bill is computed as the difference of two independent products.
        TOU-aware{' '}
        <Term def={<><strong className="text-text font-medium">net billing</strong> — a hybrid between net metering and feed-in tariffs: import and export are tracked separately and priced at different rates that themselves vary by time of day. The successor structure to net metering in most U.S. states with high solar penetration.</>}>net billing</Term>{' '}
        structures apply yet a third pattern: the bill applies different rates to different times of day for both
        imports and exports, so the customer's incentive becomes "consume own generation when retail rates are
        high; export only when wholesale buy-back rates exceed the value of self-consumption":
      </p>
      <Formula tex="\\text{Bill} = R_{\\text{peak}} \\times \\text{kWh}_{\\text{peak,in}} + R_{\\text{off}} \\times \\text{kWh}_{\\text{off,in}} - R_{\\text{export}} \\times \\text{kWh}_{\\text{out}}" />
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">R<sub>peak</sub></strong> and <strong className="text-text font-medium">R<sub>off</sub></strong> are the peak and off-peak
        per-kWh retail rates (in $/kWh), <strong className="text-text font-medium">kWh<sub>peak,in</sub></strong> and{' '}
        <strong className="text-text font-medium">kWh<sub>off,in</sub></strong> are the imported energies during each window (in kWh),{' '}
        <strong className="text-text font-medium">R<sub>export</sub></strong> is the export buy-back rate (in $/kWh, often lower than the off-peak
        rate), and <strong className="text-text font-medium">kWh<sub>out</sub></strong> is the total exported energy (in kWh). California's
        NEM 3.0 (in effect since 2023) is essentially this structure with R<sub>export</sub> set by an
        avoided-cost calculation that pays only about <strong className="text-text font-medium">$0.05/kWh</strong> for daytime exports, dramatically
        less than the <strong className="text-text font-medium">$0.27/kWh</strong> retail rate during the evening peak<Cite id="ansi-c12-1-2014" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        Whatever the tariff, the physical interconnection between the customer's PV inverter and the utility's
        wires is governed by{' '}
        <Term def={<><strong className="text-text font-medium">IEEE 1547-2018</strong> — the IEEE standard for interconnection of distributed energy resources (DER) with the grid. Specifies anti-islanding, voltage and frequency ride-through, reactive-power capabilities, and the trip/recovery behavior of grid-tied inverters.</>}>IEEE 1547-2018</Term>{' '}
        in the U.S.<Cite id="ieee-1547-2018" in={SOURCES} />. The standard prescribes three classes of inverter
        behaviour. First,{' '}
        <Term def={<><strong className="text-text font-medium">anti-islanding</strong> — the inverter's required behaviour on loss of grid connection. The inverter must detect the loss within 2 seconds and cease energising its output terminals; this prevents a backfed PV system from energising a downed service drop that a lineworker believes is dead. Implemented by active probing of the grid's frequency stability.</>}>anti-islanding</Term>:
        the inverter must detect a grid outage within 2 seconds and stop energising its output, so a downed
        service-drop wire that a lineworker is repairing cannot be lit up by a customer's PV system. Second,
        voltage and frequency ride-through: the inverter must remain connected through small voltage and
        frequency excursions to help support the grid, rather than tripping off at the first sag and making the
        problem worse. Third, reactive-power capability: modern inverters must be able to absorb or inject kVAR on
        utility command, contributing to grid voltage regulation rather than running at unity power factor only.
      </p>

      <TryIt
        tag="Try 33.5"
        question={
          <>
            A homeowner with an <strong className="text-text font-medium">8 kW</strong> rooftop PV system generates <strong className="text-text font-medium">35 kWh</strong> on a
            sunny weekday, of which they consume <strong className="text-text font-medium">25 kWh</strong> directly (while the panels are
            producing) and export <strong className="text-text font-medium">10 kWh</strong> to the grid. Their evening consumption (after dark) is
            <strong className="text-text font-medium"> 8 kWh</strong>, all imported. Under simple net metering at <strong className="text-text font-medium">$0.15/kWh</strong>, what
            is the net charge or credit for the day?
          </>
        }
        hint="Net metering bills the difference between total imported and total exported energy at the retail rate."
        answer={
          <>
            <Formula tex="\\text{kWh}_{\\text{in}} = 8\\ \\text{kWh (evening import)}" />
            <Formula tex="\\text{kWh}_{\\text{out}} = 10\\ \\text{kWh (midday export)}" />
            <Formula tex="\\text{Net} = (8 - 10) \\times \\$0.15 = -\\$0.30" />
            <p className="mb-prose-1 last:mb-0">
              A credit of 30 cents — the homeowner exported 2 kWh more than they imported on net. Under net
              metering, that credit rolls forward against future imports. Under the NEM 3.0 export rate of about
              $0.05/kWh and an import rate of $0.27/kWh evening peak, the same day's flow yields
              −0.10 × $0.05 + 0.08 × $0.27 ≈ a 1.7 <em className="italic text-text">cent</em> charge instead — the structural change that drove
              the controversy around California's 2023 reform<Cite id="ansi-c12-1-2014" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2 className="chapter-h2">What the meter does <em>not</em> measure</h2>

      <p className="mb-prose-3">
        The meter measures true energy crossing its terminals. It does not care what happens to that energy on
        either side: not whether the load is a 100 W lamp or a 100 W laptop charger, not whether the imported
        energy comes from the coal plant or the wind farm down the road, not what the customer does with it once
        it crosses the meter base. Inside the house, every wattage of every appliance is invisible to the meter
        in the aggregate kWh count — the meter sees only the sum<Cite id="ansi-c12-1-2014" in={SOURCES} />. The
        much-publicised idea that a smart meter can tell which appliance is on at any instant is true only in the
        limited sense that the time-series of total-house power, sampled finely enough, has characteristic
        signatures for big appliances: a fridge compressor starts with an inrush spike a Hidden Markov Model can
        pick out of the 15-minute record, an EV charger steps up a constant kW that lasts hours. Most of the
        residential load — lights, electronics, small kitchen appliances — is statistically indistinguishable.
      </p>
      <p className="mb-prose-3">
        What the meter has historically <em className="italic text-text">not</em> measured, but increasingly does, is the time resolution.
        Older mechanical meters integrated continuously but were read once a month by a human, so the utility's
        only data point was a monthly total. Modern AMI meters report interval data every 5–15 minutes, which
        opens both the demand-charge business model and the load-research function the utility uses to plan
        infrastructure. Interval data also raises a privacy concern: the meter's record can in principle reveal
        when the occupants are asleep (drop in baseline load), when they are away (no fridge-compressor cycling,
        no morning HVAC ramp), and even when they cooked dinner (induction-stove kW signature)<Cite id="ansi-c12-20-2015" in={SOURCES} />.
        Utility data-handling rules in most jurisdictions restrict the sharing and retention of interval data for
        this reason.
      </p>
      <p className="mb-prose-3">
        The meter also does not measure what the meter cannot reach. Energy that bypasses the meter — by an
        illegal jumper around the meter base, by a tap upstream of the service entrance, by a current sneak path
        through a buried neutral on a corroded grounding rod — is not registered as a kWh on the customer's bill.
        Utilities run continuous reconciliation against substation-level totals to detect bulk theft (the
        substation knows how many MWh left for the feeder; the sum of the customer meters on the feeder should
        match, less a small distribution-loss factor), and the seal on the meter base remains the visible boundary
        of the legal measurement zone (Ch.27). What the meter measures, it measures to
        ±0.5 %<Cite id="ansi-c12-20-2015" in={SOURCES} />. What goes around the meter is a different problem
        altogether.
      </p>

      <h2 className="chapter-h2">What we have so <em>far</em></h2>

      <p className="mb-prose-3">
        The grey box on the side of the house — once a spinning aluminium disk behind a glass dome, now a
        microcontroller behind an LCD — samples voltage and current a few thousand times a second per phase,
        multiplies them four different ways, and accumulates four energies in parallel: real, apparent, reactive,
        and demand peak. Residential tariffs charge only on the first; industrial tariffs charge on the first
        plus the fourth and the difference between the first and the second. Time-of-use schedules unbundle the
        energy charge into hourly slots, and the meter's interval data is what makes that unbundling possible.
        Rooftop solar reverses the flow; net metering, feed-in tariffs, and net billing each translate the
        bidirectional kWh count into a different bill at the end of the month. The IEEE 1547 inverter requires
        anti-islanding, ride-through, and reactive support — three behaviours that turn the customer's PV system
        from a passive export source into an active participant in grid stability. The next chapter follows the
        energy across the threshold and inside the customer's hardware: from the wall plug through the seven
        power conversions that get it to one volt at a CPU rail.
      </p>

      <CaseStudies
        intro={
          <>
            Three customers, three meters, three completely different bills — each shaped by the same four
            accumulators inside the meter.
          </>
        }
      >
        <CaseStudy
          tag="Case 33.1"
          title="A residential TOU customer in California"
          summary={
            <em className="italic text-text">
              The same 900 kWh/month house pays $190 on a flat rate and $215 on a peak-heavy TOU schedule — or
              $150 if they shift load to off-peak.
            </em>
          }
          specs={[
            { label: 'Meter class', value: <>solid-state, ANSI C12.20 class 0.5 <Cite id="ansi-c12-20-2015" in={SOURCES} /></> },
            { label: 'Interval reporting', value: <>15-minute energy, plus daily peak-demand, via AMI mesh <Cite id="ansi-c12-1-2014" in={SOURCES} /></> },
            { label: 'Flat-rate alternative', value: <>$0.20/kWh, $0 demand, $10 customer charge — $190/month at 900 kWh</> },
            { label: 'TOU rate (peak, 4–9 pm)', value: <>$0.27/kWh, applied to ~40 % of consumption without behaviour change <Cite id="ansi-c12-1-2014" in={SOURCES} /></> },
            { label: 'TOU rate (off-peak)', value: <>$0.13/kWh, applied to the other ~60 % of consumption</> },
            { label: 'TOU bill, no load shift', value: <>$215/month — modest peak-loaded penalty</> },
            { label: 'TOU bill, with load shift', value: <>$150/month after moving laundry, dishwasher, EV to off-peak</> },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            A typical 900 kWh/month suburban California household with a smart meter reports interval data every
            fifteen minutes back to the utility. On the legacy flat-rate plan, the bill is straightforward:
            900 kWh × $0.20/kWh + $10 fixed = $190/month, and the time-of-day at which any particular kWh was
            consumed is irrelevant<Cite id="ansi-c12-1-2014" in={SOURCES} />. Switching the same usage profile to
            PG&E's TOU schedule — without changing any behaviour — produces a slightly higher bill: their
            unmodified evening consumption (cooking, AC, TV) lands in the $0.27/kWh peak window, while the rest
            of the day lands in the $0.13/kWh off-peak window, and the mix comes out to about $215/month.
          </p>
          <p className="mb-prose-2 last:mb-0">
            The customer's smart-meter app lets them see their hour-by-hour profile, and the optimisation is
            visible at a glance: peak-hour load is dominated by HVAC, cooking, and the EV charger. Pre-cooling
            the house from 2–4 pm (off-peak) so the AC can ride coast through the peak window, deferring laundry
            to 10 pm, and programming the EV charger to start at 11 pm together shift maybe 10 kWh per day out
            of the peak window. That changes the mix to about 200 kWh peak (at $0.27) and 700 kWh off-peak (at
            $0.13), for a TOU bill of about $150/month — a $40/month savings over the unshifted TOU bill, and a
            $40/month savings over the flat rate as well<Cite id="ansi-c12-1-2014" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            That savings is the entire point of the tariff design: the utility wants the customer to make the
            shift, because the same load shift that saves the customer money also relieves the utility's 5–9 pm
            peak — the most expensive hours to serve, when the cheapest generation has gone offline with the
            sun and the most expensive peakers are running. The meter is the instrument that makes the tariff
            legible, and the customer's response is the response the system was designed to elicit.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 33.2"
          title="An industrial customer paying demand and PF charges"
          summary={
            <em className="italic text-text">
              A 1 MW factory's bill is two-thirds energy, one-fifth demand, and one percent a power-factor
              penalty that a $50k capacitor bank zeroes out.
            </em>
          }
          specs={[
            { label: 'Meter class', value: <>ANSI C12.20 class 0.2, three-phase form-9S <Cite id="ansi-c12-20-2015" in={SOURCES} /></> },
            { label: 'Peak demand', value: <>800 kW (15-min rolling), at PF = 0.78 → 1025 kVA apparent <Cite id="grainger-power-systems-2003" in={SOURCES} /></> },
            { label: 'Monthly energy', value: <>~560,000 kWh (700 h × 800 kW)</> },
            { label: 'Energy charge', value: <>$0.10/kWh × 560,000 = $56,000/month <Cite id="ansi-c12-1-2014" in={SOURCES} /></> },
            { label: 'Demand charge', value: <>$15/kW × 800 kW = $12,000/month <Cite id="ansi-c12-1-2014" in={SOURCES} /></> },
            { label: 'PF penalty (before correction)', value: <>$5/kVAR × ~143 kVAR-over-threshold ≈ $715/month <Cite id="grainger-power-systems-2003" in={SOURCES} /></> },
            { label: 'Total bill before correction', value: <>~$68,715/month</> },
            { label: 'Total bill after $50k capacitor', value: <>~$68,000/month (PF penalty zeroed); payback ≈ 5–6 years</> },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            A 1 MW industrial customer — say, a metal-fabrication shop with a few large induction motors and a
            CNC line — sees a bill that is structurally different from any residential one. The energy charge
            alone (560 MWh × $0.10 = $56,000) is the largest component, but the demand charge ($15 × 800 kW peak
            = $12,000) is large enough to dominate any decision about <em className="italic text-text">when</em> to run heavy loads, and the
            power-factor penalty (a few hundred dollars to a few thousand) is large enough to justify the
            capital cost of correction equipment<Cite id="grainger-power-systems-2003" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            Before correction, the factory's PF of 0.78 means the 800 kW real load is drawing 800/0.78 ≈ 1025 kVA
            of apparent power, or about 626 kVAR of reactive current sloshing back and forth between the motor
            windings and the utility's wires. The utility's penalty applies to kVAR above the threshold
            corresponding to PF = 0.85: at 800 kW real, that threshold is about 800·tan(acos 0.85) ≈ 495 kVAR. So
            the over-threshold reactive draw is about 626 − 495 ≈ 131 kVAR, and at $5/kVAR/month the penalty is
            ~$655/month — a year's worth is approaching $8,000<Cite id="grainger-power-systems-2003" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            A $50,000 power-factor-correction capacitor bank sized to deliver about 400 kVAR of compensation
            brings the PF up to about 0.95, drops the over-threshold reactive draw to zero, and saves the full
            penalty every month — payback in roughly five to six years, well within the equipment's twenty-year
            service life. The energy and demand charges are unchanged, because the capacitor does not reduce
            real power consumption; it only corrects the apparent-power and reactive-power profile that the
            utility sees on its wires upstream<Cite id="grainger-power-systems-2003" in={SOURCES} />.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 33.3"
          title="Rooftop solar under net metering vs. net billing"
          summary={
            <em className="italic text-text">
              The same 8 kW PV array yields a credit under 2015-era net metering and a modest bill under 2023-era
              NEM 3.0 net billing — without a single kWh changing.
            </em>
          }
          specs={[
            { label: 'PV system size', value: <>8 kW DC nameplate, single-string grid-tie inverter (IEEE 1547-2018 compliant) <Cite id="ieee-1547-2018" in={SOURCES} /></> },
            { label: 'Annual generation', value: <>~12,000 kWh at California insolation</> },
            { label: 'Self-consumed (direct)', value: <>~7,000 kWh — onsite use during daylight hours</> },
            { label: 'Exported to grid', value: <>~5,000 kWh — midday surplus when generation exceeds load</> },
            { label: 'Net metering (NEM 1.0/2.0)', value: <>both flows at retail $0.22/kWh on average <Cite id="ansi-c12-1-2014" in={SOURCES} /></> },
            { label: 'Net billing (NEM 3.0)', value: <>imports at retail (often $0.27 peak / $0.13 off-peak), exports at ~$0.05 avoided-cost <Cite id="ansi-c12-1-2014" in={SOURCES} /></> },
            { label: 'Inverter trip behaviour', value: <>anti-islanding ≤ 2 s; voltage/frequency ride-through per IEEE 1547-2018 <Cite id="ieee-1547-2018" in={SOURCES} /></> },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            The same 8 kW rooftop array on the same suburban California house produces the same 12,000 kWh per
            year regardless of tariff. The customer self-consumes about 7,000 kWh of that directly (water heater,
            dishwasher, daytime EV charging) and exports the rest. Under the classic net-metering regime that
            governed most U.S. residential PV through the 2010s, both flows happen at the retail rate, the
            export credits and the import debits net against each other on a one-for-one basis, and the average
            monthly bill comes out to a small credit ($30–$60/month was a typical figure for a well-sized 8 kW
            system in California)<Cite id="ansi-c12-1-2014" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            Under California's NEM 3.0 net-billing regime (in force since April 2023), imports continue to be
            billed at the retail TOU rate (peak $0.27, off-peak $0.13) but exports are credited at an
            avoided-cost figure of about $0.05/kWh — much lower, and the bill flips. The same 12,000 kWh of
            annual generation now yields the customer roughly $1,000–$1,200 per year less than under NEM 2.0,
            and the economic optimum shifts dramatically: self-consumption is now worth far more than export,
            which is the whole reason the same period saw a surge in residential battery installations that
            store the midday surplus to use during the evening peak rather than exporting it<Cite id="ansi-c12-1-2014" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            The bidirectional smart meter is the instrument that makes either tariff possible: it accumulates
            imported energy and exported energy into separate registers, both with their own timestamps, so the
            billing back-end can apply different rates to different hours and different directions
            independently<Cite id="ansi-c12-20-2015" in={SOURCES} />. The grid-tie inverter on the customer side
            is what makes the interconnection safe: under IEEE 1547-2018 it must cease energising its output
            within two seconds of detecting grid loss, so the customer's PV cannot back-feed a downed service
            drop that a lineworker believes is dead<Cite id="ieee-1547-2018" in={SOURCES} />.
          </p>
        </CaseStudy>
      </CaseStudies>

      <FAQ
        intro={
          <>
            Questions readers ask once they realise the small grey box on the side of the house is doing more
            arithmetic than the bill suggests.
          </>
        }
      >
        <FAQItem q="Why does the meter measure four quantities when the bill only charges for one?">
          <p>
            Because residential tariffs charge only on real energy (kWh) but commercial and industrial tariffs
            charge on real energy <em className="italic text-text">plus</em> demand (kW peak) <em className="italic text-text">plus</em> reactive penalty (kVARh-derived),
            and the meter is built once for all three customer classes. Beyond that, the utility uses the apparent
            and reactive registers internally for load research, capacitor-bank placement, transformer-sizing
            studies, and demand-response programs that may or may not be exposed to the customer's
            bill<Cite id="ansi-c12-1-2014" in={SOURCES} />. The standard meter is a four-quadrant accumulator
            because the data is cheap to capture once you have a microcontroller and an ADC inside the box.
          </p>
        </FAQItem>

        <FAQItem q="What does 'anti-islanding' mean and why does IEEE 1547 require it?">
          <p>
            An "island" is a section of the grid that has been disconnected from the utility but remains
            energised by a customer's distributed generator (a PV inverter, a backup generator, a battery
            system). Anti-islanding is the inverter's required behaviour: detect the loss of the utility's
            voltage and frequency reference within 2 seconds, and stop energising its output. IEEE 1547-2018
            requires it because a lineworker repairing a service drop after a storm relies on the wire being
            dead, and a customer's PV system that kept feeding the line would be a lethal hazard<Cite id="ieee-1547-2018" in={SOURCES} />.
            Modern inverters detect the condition by actively probing the line's frequency stability — a
            disconnected island has no rotating mass to hold frequency steady, so a tiny injected phase
            perturbation runs away in milliseconds and the inverter trips.
          </p>
        </FAQItem>

        <FAQItem q="Can I really 'spin the meter backward' by exporting solar?">
          <p>
            On an old mechanical Ferraris meter, literally yes — the same eddy-current physics that drove the
            disk forward under positive load drove it backward under reverse current, and the cumulative register
            counted down. That is how the first generation of net-metering customers got billed on net flow with
            no special hardware. Modern solid-state meters do not run a single register both directions; instead
            they accumulate imported energy in one register and exported energy in a second register, and the
            billing back-end computes the net (or applies separate rates to each) at the end of the
            cycle<Cite id="ansi-c12-1-2014" in={SOURCES} />. The visible effect is similar; the underlying
            arithmetic is different.
          </p>
        </FAQItem>

        <FAQItem q="Why are residential customers not charged for reactive power but industrial customers are?">
          <p>
            Because residential loads are mostly resistive (heat, lights) or have power-factor-corrected supplies
            (PFC chargers, modern HVAC inverters), and the residual reactive draw across many houses on the same
            pole-pig averages out by diversity. The utility collects its capital cost for the reactive headroom
            through an embedded markup in the per-kWh rate. Industrial customers, in contrast, often run
            uncorrected induction motors or arc furnaces that draw heavy reactive current — and a single big
            customer cannot be diversified against itself. Charging them per kVAR makes the externality visible
            and gives them the financial incentive to install correction
            capacitors<Cite id="grainger-power-systems-2003" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What exactly makes a meter 'smart'?">
          <p>
            Three things on top of the legacy mechanical kWh meter: a microcontroller-and-ADC that computes
            multiple energy registers in parallel rather than the single real-power integral the mechanical disk
            could manage; a clock and non-volatile memory that timestamp the readings so time-of-use rates and
            demand charges become possible; and a two-way radio that reports interval data back to the utility
            on a 5–15 minute cadence instead of waiting for a monthly meter-reader visit<Cite id="ansi-c12-20-2015" in={SOURCES} />.
            The combination enables every tariff structure beyond a flat per-kWh rate — TOU, demand, net billing,
            real-time pricing — and replaces a monthly truck-roll with a packet over the AMI mesh.
          </p>
        </FAQItem>

        <FAQItem q="Can a hacker read my meter remotely?">
          <p>
            The AMI mesh's data link is the obvious attack surface, and early-deployment meters (mid-2000s)
            shipped with weak or no encryption, producing several well-known academic-security papers. Modern
            meters use authenticated, encrypted communication with per-meter cryptographic keys provisioned at
            the factory, and the utility runs anomaly detection against substation-level reconciliation to flag
            meters whose reported energy disagrees with upstream totals by more than a small loss
            margin<Cite id="ansi-c12-20-2015" in={SOURCES} />. The realistic threat model is now closer to that
            of any other networked embedded device: nation-state adversaries are within scope, but a curious
            neighbour with a software-defined radio is not.
          </p>
        </FAQItem>

        <FAQItem q="What is 'demand response' and how does the utility use it?">
          <p>
            Demand response is the utility's ability to call on customers to reduce load during a system
            emergency — a peak so high that the marginal generator is approaching its rated capacity. With
            interval data from smart meters, the utility can verify which customers actually reduced load and
            credit them on the bill, which is the basis of automated demand-response programs (the utility sends
            a signal, the customer's smart thermostat raises the AC setpoint by a few degrees for an hour, the
            customer earns a small credit)<Cite id="ansi-c12-1-2014" in={SOURCES} />. Without interval data,
            there is no way to verify participation, and the whole structure cannot exist.
          </p>
        </FAQItem>

        <FAQItem q="Why is power factor a problem for the utility rather than the customer?">
          <p>
            Because real power is what the customer's load actually consumes, and that is what they pay for; but
            reactive power flows through the utility's transformers and feeders with the same physical
            consequences as real power — I²R loss in every wire it traverses, magnetic saturation in every
            transformer it passes through. The customer sees no penalty in their load's behaviour (the motor
            still spins), but the utility sees increased loss and reduced capacity on the wires upstream. The
            power-factor penalty makes that externality visible at the meter, where the customer can decide
            whether to invest in correction equipment<Cite id="grainger-power-systems-2003" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="How does a meter measure 200 amperes without melting the current sensor?">
          <p>
            With a current transformer: a single-turn primary (the load conductor itself, passing once through a
            toroidal core) inductively couples to a many-turn secondary winding that delivers a scaled-down
            replica of the primary current into a small burden resistor. A 200 A primary with a 2000:1 CT yields
            100 mA in the secondary — small enough to develop a few hundred millivolts across a low-value burden
            resistor and feed an ADC directly, with essentially zero I²R loss in the measurement
            path<Cite id="ansi-c12-20-2015" in={SOURCES} />. For smaller services (residential 100 A and below)
            some meters use a precision shunt resistor instead — a few hundred microhms across which a few tens
            of millivolts develop at full current — but the CT approach scales better to industrial currents.
          </p>
        </FAQItem>

        <FAQItem q="What is the difference between a Class 0.5 and a Class 0.2 meter?">
          <p>
            The numeric class is the meter's worst-case error as a percentage of full-scale reading under nominal
            operating conditions, certified by the manufacturer and verified by the utility at installation and
            periodically thereafter<Cite id="ansi-c12-20-2015" in={SOURCES} />. Class 0.5 means ±0.5 % over the
            meter's service life; class 0.2 means ±0.2 %. The tighter tolerance comes from a more precise voltage
            divider, a more linear CT, and tighter ADC calibration — costs that are worth paying for an
            industrial customer's metering (where 0.3 % of $50,000/month is real money) but not for a typical
            residential service. Class 0.1 is reserved for laboratory and revenue-tie meters at substation
            boundaries.
          </p>
        </FAQItem>

        <FAQItem q="Why is my solar inverter required to disconnect within 2 seconds of grid loss?">
          <p>
            Because anything longer is a safety hazard for utility crews. When a service drop goes down in a
            storm, the utility opens the relevant fuse or recloser upstream and dispatches a crew to repair the
            line, who treats the dead wire as dead. If a customer's PV inverter kept energising the line through
            the outage, that wire would be carrying lethal voltage — and from the crew's vantage point there is
            no way to tell. The 2-second window in IEEE 1547-2018 is set just long enough to ride through brief
            faults that clear themselves (a tree branch swinging on a wire) but short enough that an actual
            sustained outage de-energises the line well before the crew arrives<Cite id="ieee-1547-2018" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What is 'load research' and why does the utility care about my 5-minute consumption profile?">
          <p>
            Load research is the utility's statistical study of how customers actually use power — when they
            peak, when they ramp, how they correlate with weather and time of day. The data is used to size new
            transformers and feeders for upcoming load (a new neighbourhood, a new EV-charging cluster), to
            structure tariffs (where is the marginal peak?), to plan demand-response programs, and to file rate
            cases with the public utility commission justifying capital
            investment<Cite id="ansi-c12-20-2015" in={SOURCES} />. Without smart-meter interval data, the utility
            had to install dedicated load-research meters on a few hundred sample customers and extrapolate; with
            the AMI rollout, every meter is a load-research point, and the planning data is far richer.
          </p>
        </FAQItem>

        <FAQItem q="Does the utility know when I am at home, asleep, or away?">
          <p>
            From 15-minute interval data alone, yes, to a coarse approximation: the baseline load drops when the
            occupants sleep (HVAC fan off, no cooking, no entertainment electronics), drops further when they
            leave (fridge cycling only, no morning HVAC ramp), and rises again when they return. With
            fine-grained 1-minute data the resolution improves to the level of "shower started at 7:15 am"
            (water-heater current spike) and "dinner cooked at 6:30 pm" (induction-stove signature). Utility
            data-handling rules in most jurisdictions therefore restrict the third-party sharing and long-term
            retention of interval data, and require explicit customer consent for any non-billing
            use<Cite id="ansi-c12-20-2015" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why does my smart meter still have a glass face and a spinning disk?">
          <p>
            It probably does not, but a few utility districts have retained the cosmetic appearance of a disk
            behind a glass dome for visual continuity with the legacy mechanical meter — the actual measurement
            is being done by the solid-state electronics behind it. The vast majority of current installations
            are obviously digital: a plain LCD readout, no glass dome, no disk. The Ferraris meter is mostly a
            historical artefact at this point, though several million of them are still in service in older
            neighbourhoods that have not yet been upgraded<Cite id="ansi-c12-20-2015" in={SOURCES} />.
          </p>
        </FAQItem>
      </FAQ>
    </ChapterShell>
  );
}
