/**
 * Chapter 41 — The electric vehicle powertrain
 *
 * An applied integration chapter. Walks the energy from a 240 V wall outlet
 * to wheel torque through the seven distinct power-electronics stages of a
 * modern EV. Each stage is pinned to a prerequisite chapter:
 *   1. The pack          → Ch.25, Ch.26 (batteries, modern batteries)
 *   2. BMS + contactor   → Ch.14, Ch.26
 *   3. DC-DC for 12 V    → Ch.24 (buck converter), Ch.34 (plug to chip)
 *   4. Traction inverter → Ch.24 (inverters)
 *   5. Traction motor    → Ch.20 (motors)
 *   6. Gearbox           → mechanical reducer
 *   7. The road          → rolling friction + aero drag
 *
 * The chapter closes with a back-of-envelope range calculation that ties
 * pack capacity, drivetrain efficiency, and steady-state P_wheel into the
 * 500 km WLTP figure quoted by car-makers.
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

export default function Ch41EVPowertrain() {
  const chapter = getChapter('ev-powertrain')!;
  const SOURCES = chapter.sources;

  return (
    <ChapterShell chapter={chapter}>
      <p className="chapter-intro">
        A Model 3 noses into the driveway with 38% on the dashboard at the end of a 120 km
        commute. The driver plugs in the J1772 connector at the side of the
        garage — 240 V single-phase, 48 A from the breaker, an{' '}
        <Term def={<><strong className="text-text font-medium">EVSE</strong> — Electric Vehicle Supply Equipment. The "charger" mounted on the wall is really just a smart switch with a ground-fault interrupter, a current-rating pilot line, and a contactor; the actual AC-to-DC conversion happens inside the car.</>}>EVSE</Term>{' '}
        that is really just a contactor and a 1 kHz pilot signal telling the car how much
        current it is allowed to draw<Cite id="sae-j1772" in={SOURCES} />. Eight hours later
        the dashboard reads 84%. Forty-six percent of a 75 kWh pack — about 35 kWh —
        has moved from a residential 240 V line into a chemical phase change in
        roughly 4400 lithium-ion cells.
      </p>
      <p className="mb-prose-3">
        Between the cell and the wall, there are seven distinct power-electronics stages.
        Each one was introduced in a previous chapter. An{' '}
        <Term def={<><strong className="text-text font-medium">onboard charger (OBC)</strong> — the AC-to-DC converter built into the car that turns the EVSE&rsquo;s 240 V AC into the 250–400 V DC that the battery actually consumes. Typical Level-2 rating: 7.7 kW or 11.5 kW. Galvanically isolated from the chassis through a high-frequency transformer.</>}>onboard charger</Term>{' '}
        rectifies and steps up the wall AC to pack voltage. A high-voltage{' '}
        <Term def={<><strong className="text-text font-medium">contactor</strong> — a high-current electromechanical relay sitting between the pack and everything else. Opens within milliseconds on any fault detected by the BMS — overcurrent, overvoltage, undertemperature, crash. The pack has zero voltage at its external terminals until the contactors close.</>}>contactor</Term>{' '}
        gates the pack onto the high-voltage bus. A{' '}
        <Term def={<><strong className="text-text font-medium">BMS</strong> — Battery Management System. The microcontroller-plus-analog-front-end that measures every cell&rsquo;s voltage and temperature, sums the pack current, balances cell state-of-charge, and commands the contactor.</>}>BMS</Term>{' '}
        watches every cell. A{' '}
        <Term def={<><strong className="text-text font-medium">DC-DC converter</strong> — here, an isolated buck that steps the 350 V high-voltage bus down to the car&rsquo;s 12 V auxiliary rail at roughly 2 kW. Same buck-converter topology as in a laptop charger (Ch.24, Ch.34), just scaled up and with a high-frequency transformer to provide isolation.</>}>DC-DC converter</Term>{' '}
        supplies the 12 V auxiliary rail. A{' '}
        <Term def={<><strong className="text-text font-medium">traction inverter</strong> — the three-phase H-bridge that converts the high-voltage DC bus into a balanced three-phase AC drive for the motor stator. Field-oriented control modulates the inverter switches to set torque-producing and flux-producing current components independently.</>}>traction inverter</Term>{' '}
        chops the DC bus into three-phase AC for the motor. A{' '}
        <Term def={<><strong className="text-text font-medium">PMSM</strong> — Permanent Magnet Synchronous Motor. A three-phase synchronous motor whose rotor carries rare-earth permanent magnets rather than a wound field. Dominant traction motor today: high torque density, no rotor copper losses, but expensive and politically sensitive magnets.</>}>permanent-magnet synchronous motor</Term>{' '}
        turns that AC into mechanical torque. A fixed-ratio gearbox multiplies torque, divides
        speed, and hands shaft power to the wheels. The wheels push against the road
        through rolling friction and aerodynamic drag. Seven stages, one electron
        starting in the wall and ending as the car&rsquo;s kinetic energy.
      </p>
      <p className="mb-prose-3">
        This chapter walks each stage in order. The physics of every one of them has
        already been developed earlier in the textbook — the goal here is to integrate.
        Where Ch.20 derived the back-EMF of a synchronous motor and Ch.24 derived the
        three-phase inverter waveform, this chapter wires them together into the
        machine sitting under the floor of the car.
      </p>

      <h2 className="chapter-h2">Stage 1 — The battery pack (Ch.25, Ch.26)</h2>

      <p className="mb-prose-3">
        A modern EV pack is a brick of cylindrical or pouch cells wired in a series-parallel
        grid. The Model 3 long-range pack uses{' '}
        <Term def={<><strong className="text-text font-medium">21700 cells</strong> — a cylindrical Li-ion form factor 21 mm in diameter and 70 mm tall, introduced by Tesla and Panasonic in 2017 to replace the earlier 18650 (18 mm × 65 mm) format. About 4.5 Ah per cell at 3.6 V nominal, ~17 Wh per cell.</>}>21700 cylindrical cells</Term>{' '}
        in a 96-series × 46-parallel arrangement: 4416 cells in total, roughly 75 kWh
        nominal capacity, 350 V nominal pack voltage<Cite id="erickson-maksimovic-2020" in={SOURCES} />.
        Each cell is{' '}
        <Term def={<><strong className="text-text font-medium">NMC</strong> — Lithium Nickel-Manganese-Cobalt oxide. The dominant cathode chemistry for energy-dense EV cells: high specific energy (~250 Wh/kg at the cell), moderate cycle life, sensitive to over-temperature. NMC competes with LFP (Lithium Iron Phosphate, safer and cheaper but less dense) and NCA (Nickel-Cobalt-Aluminium, used by Tesla, similar to NMC).</>}>NMC chemistry</Term>{' '}
        — lithium nickel-manganese-cobalt oxide on the cathode, graphite on the anode,
        the standard EV recipe developed through the 1990s and 2000s and discussed in
        depth in Ch.26<Cite id="horowitz-hill-2015" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        The pack-level energy budget is straightforward. Total energy stored is the
        product of cell count, cell voltage, and cell capacity:
      </p>
      <Formula tex="E_{\text{pack}} = n_s \times n_p \times V_{\text{cell}} \times Q_{\text{cell}}" />
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">E<sub>pack</sub></strong> is the pack energy in watt-hours,{' '}
        <strong className="text-text font-medium">n<sub>s</sub></strong> is the number of cells in series (dimensionless),{' '}
        <strong className="text-text font-medium">n<sub>p</sub></strong> is the number of parallel strings (dimensionless),{' '}
        <strong className="text-text font-medium">V<sub>cell</sub></strong> is the nominal cell voltage in volts (about
        3.6 V for NMC), and <strong className="text-text font-medium">Q<sub>cell</sub></strong> is the cell ampere-hour
        capacity (about 4.8 Ah for a 21700). For the Model 3:{' '}
        <InlineMath tex="96 \times 46 \times 3.6\ \text{V} \times 4.8\ \text{Ah} \approx 76.3\ \text{kWh}" />, matching the
        advertised number once you subtract the small reserve at the top and bottom of
        the state-of-charge window<Cite id="erickson-maksimovic-2020" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        The energy density story tells you most of what you need to know about why
        EVs look the way they do. Modern 21700 cells run about 250 Wh/kg at the cell.
        After structural packaging — busbars, cooling plates, cell holders, fuses,
        contactors, BMS modules — pack-level density drops to roughly 150 Wh/kg. A
        75 kWh pack therefore weighs around 500 kg. That mass is structural: it sits
        in the floor of the vehicle, lowering the centre of gravity but adding half a
        tonne to the curb weight every EV designer has to plan around.
      </p>
      <p className="mb-prose-3">
        Peak power is set by the cells&rsquo;{' '}
        <Term def={<><strong className="text-text font-medium">C-rate</strong> — the discharge (or charge) current expressed as a multiple of the cell&rsquo;s ampere-hour capacity. A 4.8 Ah cell discharging at 1 C delivers 4.8 A; at 5 C, 24 A. Cell chemistry sets a maximum sustained C-rate before overheating or accelerated aging.</>}>C-rate</Term>{' '}
        limit. A 21700 NMC cell will reliably deliver about 3 C sustained and bursts
        of 5 C; below those rates the internal resistance and electrolyte chemistry
        stay in the safe envelope. Peak pack power scales as:
      </p>
      <Formula tex="P_{\text{max}} = E_{\text{pack}} \times \text{(C-rate)}" />
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">P<sub>max</sub></strong> is the peak deliverable pack power in
        watts, <strong className="text-text font-medium">E<sub>pack</sub></strong> is the pack energy in watt-hours, and{' '}
        <strong className="text-text font-medium">C-rate</strong> is the per-hour discharge multiplier (in 1/h). A
        75 kWh pack at 3 C sustained delivers <InlineMath tex="75 \times 3 = 225\ \text{kW}" /> —
        and indeed that is about the rated peak output of a Model 3 long-range single
        motor. The dual-motor Performance variant pulls harder by parallelling more
        cells per string and by burst-running cells past 4 C for short
        bursts<Cite id="erickson-maksimovic-2020" in={SOURCES} />.
      </p>

      <TryIt
        tag="Try 41.1"
        question={<>A 75 kWh pack at 350 V nominal is delivering 80 kW continuously into the inverter. What is the average pack current?</>}
        hint="Power equals voltage times current; rearrange."
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">Pack current is power divided by bus voltage:</p>
            <Formula tex="I_{\text{pack}} = P / V_{\text{pack}} = 80{,}000\ \text{W} / 350\ \text{V} \approx 229\ \text{A}" />
            <p className="mb-prose-1 last:mb-0">
              Answer: about <strong className="text-text font-medium">230 A</strong>. The high-voltage busbars in the
              pack are rated for this kind of continuous current and double it briefly
              under peak acceleration; that is why they are aluminium or copper strips
              tens of millimetres wide rather than wires.
            </p>
          </>
        }
      />

      <h2 className="chapter-h2">Stage 2 — The BMS and the contactor</h2>

      <p className="mb-prose-3">
        The 4416 cells are not equal. Even cells from the same production lot drift
        apart on the order of 10–50 mV over a few hundred cycles, and a few percent on
        capacity. The pack&rsquo;s usable energy is set by the <em className="italic text-text">weakest</em> cell — the
        one that hits the lower voltage cutoff first on discharge, or the upper voltage
        cutoff first on charge. The job of the{' '}
        <Term def={<><strong className="text-text font-medium">battery management system</strong> — the microcontroller-plus-analog-front-end that polices the pack. Per-cell voltage and temperature sensing, pack-current integration for coulomb counting, cell balancing, contactor command, fault detection, and CAN-bus reporting to the vehicle controller.</>}>battery management system</Term>{' '}
        is to monitor every cell in real time and arrange the charge/discharge currents
        so that no single cell goes outside its safe window<Cite id="sedra-smith-2014" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        Inside a typical pack the BMS distributes the work. A central controller talks
        over CAN to roughly a dozen{' '}
        <Term def={<><strong className="text-text font-medium">cell sense board</strong> — a small daughterboard mounted directly above each module of cells. Carries 12–16 analog inputs to a multiplexed ADC measuring each series tap to ±5 mV, plus a small balancing resistor per cell that can be switched in to bleed off charge from a high cell.</>}>cell sense boards</Term>,
        each measuring 8–16 cells in series with a multiplexed analog front end. Each
        ADC reading is accurate to about ±5 mV — enough to resolve a cell&rsquo;s
        state-of-charge to roughly 1%. The boards also each carry a small balancing
        resistor per cell: when a cell is high during a charge, the resistor is
        switched in to bleed off a few hundred milliamps of current and let the slower
        cells catch up. This is{' '}
        <Term def={<><strong className="text-text font-medium">passive balancing</strong> — wasting energy from high cells through bleed resistors to let low cells catch up. Simple and reliable, but throws away energy. Active balancing schemes (DC-DC shuttling charge between cells) preserve the energy but cost more silicon and rarely pay back in a passenger car.</>}>passive balancing</Term>;
        an active scheme would shuttle the extra charge between cells through a tiny
        DC-DC converter, but most production EVs settle for the simpler passive
        approach<Cite id="horowitz-hill-2015" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        Pack-level current is measured by a{' '}
        <Term def={<><strong className="text-text font-medium">Hall-effect current sensor</strong> — a magnetic sensor placed around the high-voltage busbar that reads the field produced by the pack current and converts it to a voltage signal. Galvanically isolated (no electrical contact with the bus), accurate to a few percent, with a bandwidth of a few kHz.</>}>Hall-effect sensor</Term>{' '}
        or a precision shunt resistor in series with the negative terminal. Integrating
        that current over time gives the coulomb count — the running state of charge.
        Voltage and coulomb counting cross-check each other: at the boundaries of the
        SOC window (high and low) voltage rises steeply with SOC, but in the flat middle
        only the coulomb count is trustworthy. The BMS fuses both estimates with a
        Kalman filter and reports a single SOC number to the dashboard.
      </p>
      <p className="mb-prose-3">
        Between the pack&rsquo;s positive terminal and the high-voltage bus sit two
        contactors (one positive, one negative) and a precharge resistor. At ignition,
        the BMS first closes the negative contactor and the precharge contactor, which
        is in series with a 100 Ω resistor. That gently bleeds the bus capacitance up to
        pack voltage over a few hundred milliseconds. When the bus is within 10 V of
        the pack, the BMS closes the main positive contactor and opens the precharge
        path. Without the precharge resistor, the inrush current charging the bus
        capacitors would weld the contactor tips together within microseconds.
      </p>
      <p className="mb-prose-3">
        The contactors also handle the fault story. Overcurrent, overvoltage on any
        cell, undervoltage on any cell, over-temperature on any cell, ground fault
        between the high-voltage bus and the chassis — any of these trips the BMS,
        which opens both contactors within milliseconds. With both contactors open,
        the pack&rsquo;s external terminals are at 0 V relative to the chassis. The
        car is, electrically, safe to work on.
      </p>

      <h2 className="chapter-h2">Stage 3 — DC-DC for the 12 V rail</h2>

      <p className="mb-prose-3">
        An EV still has a 12 V battery and a 12 V auxiliary rail. The headlights, the
        infotainment system, the BMS itself, the brake-by-wire, the traction-control
        ECU, the door locks, the dashboard, every CAN node in the car — all of it
        runs on 12 V. The reason is historical: every automotive part supplier on
        Earth has fifty years of 12 V silicon and 12 V lamp designs in their catalogue,
        and rebuilding that ecosystem at 350 V is more expensive than just adding a
        DC-DC converter<Cite id="erickson-maksimovic-2020" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        The{' '}
        <Term def={<><strong className="text-text font-medium">DC-DC for 12 V auxiliary rail</strong> — the isolated buck converter inside an EV that steps the 350 V high-voltage bus down to 14 V to charge the small lead-acid (or small Li-ion) battery and power the car&rsquo;s 12 V loads. Typical rating 2–3 kW. The galvanic isolation is mandatory: a chassis ground fault on the 12 V side must not put 350 V on the body of the car.</>}>auxiliary DC-DC converter</Term>{' '}
        is exactly the same topology as the one inside the laptop charger of Ch.34 — a
        forward or LLC converter with a high-frequency transformer providing galvanic
        isolation between the high-voltage bus and the 12 V rail — just scaled up to
        about 2 kW. A MOSFET chops the 350 V DC into a 100 kHz square wave on the
        primary of a small ferrite-core transformer. The secondary is rectified and
        filtered down to 14 V (the float voltage for a small lead-acid auxiliary
        battery) and supplies the car&rsquo;s 12 V loads<Cite id="sedra-smith-2014" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        Galvanic isolation is mandatory here. A chassis ground fault on the 12 V side
        is a routine event in any car — a wire chafing on a body panel, a corroded
        connector, an aftermarket accessory shorted to ground. In an ICE car nothing
        spectacular happens; the 12 V system tolerates ground faults. In an EV, if
        the 12 V rail shared a ground reference with the 350 V pack, a chassis fault
        on either side would put 350 V on the body of the car. The transformer in the
        DC-DC converter breaks that path: the 12 V rail floats with respect to the
        high-voltage bus, and the chassis is only ever the 12 V system&rsquo;s
        reference.
      </p>
      <p className="mb-prose-3">
        Energy balance is simple. Input power equals output power divided by efficiency:
      </p>
      <Formula tex="P_{\text{HV}} = P_{\text{aux}} / \eta_{\text{DCDC}}" />
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">P<sub>HV</sub></strong> is the power drawn from the high-voltage
        bus in watts, <strong className="text-text font-medium">P<sub>aux</sub></strong> is the power delivered to the
        12 V rail in watts, and <strong className="text-text font-medium">η<sub>DCDC</sub></strong> is the converter
        efficiency (dimensionless, typically 0.92 in a modern automotive DC-DC). A
        worked example: at <InlineMath tex="I_{\text{aux}} = 50\ \text{A}" /> drawn at
        12 V, <InlineMath tex="P_{\text{aux}} = 600\ \text{W}" />. At η = 0.92, the
        high-voltage bus delivers <InlineMath tex="P_{\text{HV}} \approx 650\ \text{W}" />,
        which at 350 V is about 1.9 A from the pack. The 50 A flowing on the 12 V
        side becomes 1.9 A on the 350 V side — exactly the ratio you would predict
        from the transformer turns ratio in the converter.
      </p>

      <h2 className="chapter-h2">Stage 4 — The traction inverter</h2>

      <p className="mb-prose-3">
        Here is the big one. The{' '}
        <Term def={<><strong className="text-text font-medium">traction inverter</strong> — the three-phase H-bridge that converts the high-voltage DC bus into balanced three-phase AC drive currents for the motor. Six switches (two per phase, top and bottom), pulse-width modulated at 8–20 kHz, current-feedback closed-loop. Field-oriented control commands i_d and i_q independently. Modern designs use SiC MOSFETs; older designs use silicon IGBTs.</>}>traction inverter</Term>{' '}
        is a three-phase H-bridge: six transistors arranged as three half-bridge legs,
        each leg feeding one motor phase, all three legs sharing the high-voltage bus
        as their DC supply<Cite id="erickson-maksimovic-2020" in={SOURCES} />. The same
        topology was introduced in Ch.24 for grid-scale solar inverters and AC drives;
        an EV inverter is the same circuit miniaturised, ruggedised, and tuned for the
        peculiar load that is a permanent-magnet motor.
      </p>
      <p className="mb-prose-3">
        Modern EV inverters increasingly use{' '}
        <Term def={<><strong className="text-text font-medium">SiC MOSFETs</strong> — Silicon Carbide power MOSFETs. A wide-bandgap semiconductor switch that conducts less loss than a silicon IGBT at the same voltage class, switches faster (50–100 ns vs. 500 ns), and tolerates higher junction temperatures (200 °C vs. 150 °C). Tesla&rsquo;s Model 3 was the first volume EV to ship SiC traction inverters in 2017.</>}>silicon-carbide MOSFETs</Term>{' '}
        rather than silicon IGBTs as the six switches. SiC parts switch faster, conduct
        with lower on-resistance, and tolerate higher die temperatures than silicon —
        the practical effect is that an SiC inverter at the same kW rating is about a
        third the volume and runs three to four percentage points more efficient. Modern
        SiC traction inverters hit 98–99% peak efficiency; IGBT designs sit at
        95–97%<Cite id="sedra-smith-2014" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        Each half-bridge leg of the inverter is pulse-width-modulated at 8–20 kHz. The
        controller — a single high-performance microcontroller or FPGA — runs a closed
        current loop on each phase, sampling phase current with a Hall sensor or shunt
        and adjusting the duty cycle each PWM period. The aggregate effect, averaged
        over a few PWM cycles, is a sinusoidal current in each phase at the motor&rsquo;s
        electrical frequency — typically 10 Hz at a creeping start and up to 500 Hz at
        highway speeds (8 poles × 0.5 of rotor RPS &rarr; large numbers fast).
      </p>
      <p className="mb-prose-3">
        The control law that ties the inverter to the motor is{' '}
        <Term def={<><strong className="text-text font-medium">field-oriented control (FOC)</strong> — the control scheme that decomposes the three-phase stator currents into two orthogonal components in the rotor reference frame: i_d (aligned with the rotor flux, "flux-producing") and i_q (orthogonal to the rotor flux, "torque-producing"). Inverter modulates each independently. The result is a synchronous motor that behaves like a DC motor from the controller&rsquo;s point of view.</>}>field-oriented control</Term>.
        The three phase currents are transformed (Clarke + Park) into two orthogonal
        components in the rotor&rsquo;s reference frame: i<sub>d</sub> aligned with the
        rotor flux and i<sub>q</sub> perpendicular to it. In a PMSM the rotor flux is
        fixed by the permanent magnets, so torque is purely the cross product of the
        magnet flux and the current orthogonal to it. The simple form of the torque
        equation is:
      </p>
      <Formula tex="\tau_{\text{motor}} = \tfrac{3}{2} \times p \times \psi_{\text{PM}} \times i_q" />
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">τ<sub>motor</sub></strong> is the electromagnetic torque produced
        at the rotor in newton-metres, <strong className="text-text font-medium">p</strong> is the number of pole pairs
        (dimensionless, typically 4 for a Tesla motor — so 8 magnetic poles around the
        rotor), <strong className="text-text font-medium">ψ<sub>PM</sub></strong> is the permanent-magnet flux linkage
        per phase in weber-turns (a fixed property of the rotor geometry and magnet
        grade), and <strong className="text-text font-medium">i<sub>q</sub></strong> is the torque-producing current
        component in amperes. The factor of 3/2 falls out of the three-phase-to-d-q
        transformation. The crucial feature: <strong className="text-text font-medium">τ is linear in i<sub>q</sub></strong>,
        so to double the torque you double i<sub>q</sub>; to zero the torque you zero
        i<sub>q</sub>. Cite Ch.20 for the synchronous-machine derivation.
      </p>
      <p className="mb-prose-3">
        Meanwhile i<sub>d</sub> — the flux-producing component — is held at zero in the
        normal operating region. The permanent magnets already supply the flux; injecting
        more current along that axis would just heat the stator without producing
        torque. Above a certain speed, however, i<sub>d</sub> is driven <em className="italic text-text">negative</em>
        to suppress the magnet flux and let the motor spin faster than its natural
        no-load limit. That is field weakening, treated in §Stage 5.
      </p>
      <p className="mb-prose-3">
        Inverter efficiency is the ratio of mechanical-equivalent output power to
        DC-bus input power:
      </p>
      <Formula tex="\eta_{\text{inv}} = P_{\text{AC,out}} / P_{\text{DC,in}}" />
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">η<sub>inv</sub></strong> is the dimensionless inverter
        efficiency, <strong className="text-text font-medium">P<sub>AC,out</sub></strong> is the real (in-phase) power
        delivered to the motor stator in watts, and <strong className="text-text font-medium">P<sub>DC,in</sub></strong>{' '}
        is the power drawn from the high-voltage bus in watts. The losses are
        switching losses in the six transistors (which scale with the PWM frequency
        and the bus voltage) and conduction losses (which scale with the square of
        the phase current). At part-throttle highway cruise an SiC inverter hits
        99%; at peak acceleration when phase current is near 1 kA the efficiency
        drops to about 96%<Cite id="erickson-maksimovic-2020" in={SOURCES} />.
      </p>

      <TryIt
        tag="Try 41.2"
        question={<>A PMSM has pole-pair count <strong className="text-text font-medium">p = 4</strong>, permanent-magnet flux linkage <strong className="text-text font-medium">ψ<sub>PM</sub> = 0.08 Wb</strong>, and the inverter is commanding <strong className="text-text font-medium">i<sub>q</sub> = 200 A</strong>. What torque does the motor produce?</>}
        hint="Use τ = (3/2) · p · ψ_PM · i_q."
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">Plug into the FOC torque equation:</p>
            <Formula tex="\tau = \tfrac{3}{2} \times 4 \times 0.08\ \text{Wb} \times 200\ \text{A} = 96\ \text{N·m}" />
            <p className="mb-prose-1 last:mb-0">
              Answer: about <strong className="text-text font-medium">96 N·m</strong> at the motor shaft. After a 9:1
              gearbox reduction (Stage 6), that becomes <strong className="text-text font-medium">~860 N·m</strong> at
              the wheels — which, divided by a 0.34 m tire radius, is 2.5 kN of
              tractive force. On a 2-tonne car: about 1.3 m/s² acceleration, or
              0–100 km/h in roughly 21 seconds at this modest current. Real EVs
              push i<sub>q</sub> well above 1000 A on launch to deliver the 3-second
              0–100 figures.
            </p>
          </>
        }
      />

      <h2 className="chapter-h2">Stage 5 — The traction motor (Ch.20)</h2>

      <p className="mb-prose-3">
        The motor itself is a three-phase synchronous machine with permanent magnets in
        the rotor. The stator is a conventional wound three-phase winding, identical in
        principle to the AC machines of Ch.20 and Ch.23. What sets the PMSM apart is
        the rotor: instead of a wound field that has to be excited by sliprings, the
        rotor carries strong rare-earth permanent magnets — typically NdFeB grade — that
        provide a fixed flux<Cite id="erickson-maksimovic-2020" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        The advantages are decisive for traction. No rotor current means no rotor
        copper losses, which means the only place the rotor dissipates heat is in its
        eddy losses and bearing friction. Torque density is high because the magnet
        flux is fixed without spending electrical power to make it. The motor maps a
        very flat efficiency curve across the typical EV operating envelope. The
        disadvantage is cost and supply-chain risk: NdFeB magnets contain neodymium
        and small amounts of dysprosium, both of which come predominantly from China.
        Inducing motors avoid the magnets entirely (the rotor is a squirrel cage of
        aluminium bars) at the price of higher rotor losses and slightly lower
        torque density.
      </p>
      <p className="mb-prose-3">
        As the rotor spins, the magnet flux linking the stator coils changes, and by
        Faraday&rsquo;s law (Ch.7) it induces an EMF in each stator phase. This{' '}
        <Term def={<><strong className="text-text font-medium">back-EMF</strong> — the voltage induced in the motor&rsquo;s stator windings by the rotation of the rotor magnets. Linear in mechanical speed: V_BEMF = ψ_PM · ω. At zero speed the back-EMF is zero; at the motor&rsquo;s base speed the back-EMF approaches the bus voltage and the inverter saturates.</>}>back-EMF</Term>{' '}
        is the central feature that determines what the motor can and cannot do at a
        given speed:
      </p>
      <Formula tex="V_{\text{BEMF}} = \psi_{\text{PM}} \times \omega_e" />
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">V<sub>BEMF</sub></strong> is the line-to-neutral peak back-EMF
        in volts, <strong className="text-text font-medium">ψ<sub>PM</sub></strong> is the permanent-magnet flux linkage
        in weber-turns (the same constant from the torque equation in Stage 4), and{' '}
        <strong className="text-text font-medium">ω<sub>e</sub></strong> is the <em className="italic text-text">electrical</em> angular frequency
        in rad/s. Electrical frequency is mechanical frequency times the pole-pair
        count: <InlineMath tex="\omega_e = p \times \omega_m" />. As the
        car accelerates, ω<sub>m</sub> climbs and V<sub>BEMF</sub> climbs linearly with
        it<Cite id="erickson-maksimovic-2020" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        For the inverter to push current into the stator, the bus voltage has to be
        higher than the back-EMF. As long as <InlineMath tex="V_{\text{DC}}/\sqrt{3} > V_{\text{BEMF}}" />{' '}
        (the inverter can synthesise a sinusoid whose peak exceeds the back-EMF peak),
        the controller can pump full i<sub>q</sub> and the motor produces its rated
        torque. The speed at which the back-EMF just equals the bus voltage limit is
        the motor&rsquo;s{' '}
        <Term def={<><strong className="text-text font-medium">base speed</strong> — the motor speed at which back-EMF first equals the bus-voltage limit. Below base speed, the motor runs in constant-torque mode (limited by current). Above base speed, it runs in constant-power / field-weakening mode (limited by voltage).</>}>base speed</Term>{' '}
        — typically about 4000–6000 RPM for a passenger EV traction motor.
      </p>
      <p className="mb-prose-3">
        Above base speed, something clever has to happen. The bus voltage cannot grow,
        so the only way to push current through a winding whose back-EMF already equals
        the bus is to reduce the net flux that the stator sees. The inverter injects a
        negative i<sub>d</sub> — a stator current along the rotor-flux axis but in the
        opposite direction — that partially cancels the magnet flux as seen by the
        stator. This is{' '}
        <Term def={<><strong className="text-text font-medium">field weakening</strong> — the technique of injecting negative i_d current to suppress the rotor&rsquo;s effective magnet flux above base speed. Lets a PMSM operate at speeds where back-EMF would otherwise exceed the bus voltage. The cost is wasted current with no torque benefit, so the constant-power region of the motor map is less efficient than the constant-torque region.</>}>field weakening</Term>,
        and it is the reason a PMSM has a "constant-power" region above base speed
        rather than running into a hard speed limit. The price is that the field-weakening
        current produces no torque but does produce copper losses, so the constant-power
        region is less efficient than the constant-torque region below base
        speed<Cite id="erickson-maksimovic-2020" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        Tesla, uniquely among major EV makers, ships both PMSMs and{' '}
        <Term def={<><strong className="text-text font-medium">induction motor</strong> — a three-phase AC motor whose rotor is a squirrel cage of aluminium or copper bars rather than wound or permanent-magnet. The rotor field is induced by the stator&rsquo;s rotating field at a small "slip" frequency. No rare-earth magnets, simpler and cheaper rotor, but lower torque density and higher rotor losses than a PMSM.</>}>induction motors</Term>{' '}
        in different cars. The rear motor on a Model 3 is a PMSM; the front motor on
        the same car&rsquo;s Long Range AWD variant is an induction motor. The rationale
        is that an induction motor has near-zero spin-down losses when not commanded
        (the rotor produces no field of its own), so at cruise Tesla can shut down
        the front motor entirely and let it freewheel. A PMSM with permanent magnets
        produces back-EMF continuously and therefore drags continuously unless the
        inverter actively cancels it, which costs energy. The asymmetric setup is
        cheaper to engineer than two PMSMs and slightly more efficient at constant
        cruise.
      </p>

      <TryIt
        tag="Try 41.3"
        question={<>A traction motor has back-EMF constant <strong className="text-text font-medium">ψ<sub>PM</sub> = 0.08 Wb</strong> and <strong className="text-text font-medium">p = 4</strong> pole pairs. From a <strong className="text-text font-medium">350 V</strong> DC bus, at what mechanical speed does the inverter first saturate (i.e., what is the base speed)?</>}
        hint="The inverter can produce a phase peak of V_DC / √3 ≈ V_DC × 0.577. Set that equal to the back-EMF peak."
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">The inverter&rsquo;s peak line-to-neutral output sinusoid is about V<sub>DC</sub>/√3:</p>
            <Formula tex="V_{\text{BEMF,peak}} = V_{\text{DC}} / \sqrt{3} \approx 350 / 1.732 \approx 202\ \text{V}" />
            <p className="mb-prose-1 last:mb-0">Solve V<sub>BEMF</sub> = ψ<sub>PM</sub> · ω<sub>e</sub> for electrical angular speed:</p>
            <Formula tex="\omega_e = 202 / 0.08 \approx 2525\ \text{rad/s}" />
            <p className="mb-prose-1 last:mb-0">Convert to mechanical RPM: <InlineMath tex="\omega_m = \omega_e / p" />, then <InlineMath tex="\text{RPM} = \omega_m \cdot 60/(2\pi)" />.</p>
            <Formula tex="\omega_m = 2525 / 4 \approx 631\ \text{rad/s} \to \approx 6030\ \text{RPM}" />
            <p className="mb-prose-1 last:mb-0">
              Answer: about <strong className="text-text font-medium">6000 RPM</strong> mechanical. Above that, the
              inverter saturates and the controller switches into field-weakening to
              push the motor up to its mechanical redline near 18 000 RPM.
            </p>
          </>
        }
      />

      <h2 className="chapter-h2">Stage 6 — The gearbox</h2>

      <p className="mb-prose-3">
        Coming off the motor shaft, the next element is a{' '}
        <Term def={<><strong className="text-text font-medium">single-speed transmission</strong> — a fixed-ratio gear reducer with no clutch and no shifting. Possible because an electric motor delivers full torque from 0 RPM and constant power above base speed; there is no narrow torque band that would force a multi-speed gearbox. Typical ratio 7:1 to 10:1, efficiency 97–98%.</>}>single-speed transmission</Term>,
        a fixed-ratio gear reducer typically of about 9:1. The motor turns 9 revolutions
        for every wheel revolution; torque at the wheel is 9 times motor torque (minus
        gear losses); angular speed at the wheel is motor speed divided by 9. There is
        no clutch, no torque converter, no shift; the gearbox is the simplest mechanical
        element in the whole drivetrain.
      </p>
      <p className="mb-prose-3">
        The reason an EV does not need a multi-speed gearbox traces directly to the
        motor&rsquo;s torque-speed curve. Below base speed the motor delivers constant
        torque (limited by current, hence by inverter and cell C-rate); above base speed
        it delivers constant power (limited by voltage, hence by field weakening). The
        product τ × ω is therefore roughly flat over a wide speed range — exactly the
        shape that lets a single gear ratio do the job that a 7- or 8-speed automatic
        does in an ICE car. The internal-combustion engine, by contrast, only produces
        useful torque in a narrow 2000–4500 RPM band; everything outside that band
        requires gear-ratio gymnastics to keep the engine on song.
      </p>
      <p className="mb-prose-3">
        Gear-mesh efficiency is high — about 98% for a well-designed single-stage
        helical reduction — and that is the only number to remember here. The other
        2% becomes oil heating in the gearcase and a tiny contribution to the cabin
        whine you can hear under hard acceleration.
      </p>

      <h2 className="chapter-h2">Stage 7 — The road</h2>

      <p className="mb-prose-3">
        At the wheel, the mechanical chain ends and the physics changes to mechanics
        and aerodynamics. Wheel torque divided by wheel radius is the tractive force
        the tire applies to the road; tractive force times vehicle speed is the
        instantaneous power leaving the drivetrain and entering the world as kinetic
        energy, heat in the tires, sound, and disturbed air<Cite id="codata-2018" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        There are four dominant resistive forces the wheels have to overcome. The
        first is{' '}
        <Term def={<><strong className="text-text font-medium">rolling friction</strong> — the deformation losses of the tire as it rolls over the road. Roughly speaking, the contact patch is continuously squashed and un-squashed and the hysteresis in the rubber dissipates energy. Proportional to vehicle weight, mostly independent of speed. Quantified by the dimensionless coefficient C_rr (about 0.008 for a passenger EV on dry pavement).</>}>rolling friction</Term>{' '}
        from the tire deformation. The contact patch is a small flattening of the tire
        against the road; as the tire rolls, the rubber on the leading edge is
        compressed and the rubber on the trailing edge un-compresses, and the
        hysteresis in the rubber dissipates a small fraction of the elastic energy as
        heat. The force is proportional to vehicle weight, almost independent of
        speed:
      </p>
      <Formula tex="F_{\text{roll}} = m \times g \times C_{rr}" />
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">F<sub>roll</sub></strong> is the rolling-resistance force in
        newtons, <strong className="text-text font-medium">m</strong> is the vehicle mass in kilograms,{' '}
        <strong className="text-text font-medium">g = 9.81 m/s²</strong> is gravitational acceleration, and{' '}
        <strong className="text-text font-medium">C<sub>rr</sub></strong> is the dimensionless{' '}
        <Term def={<><strong className="text-text font-medium">rolling friction coefficient (C_rr)</strong> — the dimensionless ratio of rolling-friction force to vehicle weight. About 0.008 for a modern low-rolling-resistance passenger-car tire on dry pavement; 0.005 for a premium EV tire; 0.015 for a worn or under-inflated tire.</>}>rolling friction coefficient</Term>{' '}
        (about 0.008 for a passenger EV on a modern low-rolling-resistance tire). For
        a 2000 kg car this gives <InlineMath tex="F_{\text{roll}} \approx 2000 \times 9.81 \times 0.008 \approx 160\ \text{N}" /> —
        constant whether the car is creeping or cruising.
      </p>
      <p className="mb-prose-3">
        The second is{' '}
        <Term def={<><strong className="text-text font-medium">aerodynamic drag</strong> — the force resisting motion through air. Proportional to air density, drag coefficient (C_d), frontal area (A), and the square of speed. The dominant resistive force above 80–90 km/h for a modern passenger car.</>}>aerodynamic drag</Term>{' '}
        from pushing the car through air:
      </p>
      <Formula tex="F_{\text{drag}} = \tfrac{1}{2} \times \rho_{\text{air}} \times C_d \times A \times v^2" />
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">F<sub>drag</sub></strong> is the drag force in newtons,{' '}
        <strong className="text-text font-medium">ρ<sub>air</sub></strong> is air density (about 1.225 kg/m³ at sea
        level and 15 °C), <strong className="text-text font-medium">C<sub>d</sub></strong> is the dimensionless{' '}
        <Term def={<><strong className="text-text font-medium">drag coefficient (C_d)</strong> — the dimensionless shape factor in the drag equation. About 0.23 for a Model 3, 0.27 for a typical EV sedan, 0.30 for a Tesla Model Y, 0.40+ for a typical SUV. Independent of size; folded into C_d · A (the "drag area") when comparing different vehicles.</>}>drag coefficient</Term>{' '}
        (about 0.23 for a Model 3, the lowest in production), <strong className="text-text font-medium">A</strong> is
        the frontal area in square metres (about 2.2 m² for a sedan), and{' '}
        <strong className="text-text font-medium">v</strong> is vehicle speed in m/s. Together C<sub>d</sub> × A is the{' '}
        <Term def={<><strong className="text-text font-medium">drag area (CdA)</strong> — the product of drag coefficient and frontal area. A single number that captures the aerodynamic-resistance "size" of a vehicle: Model 3 has CdA ≈ 0.51 m², a Hummer EV is about 1.3 m².</>}>drag area (CdA)</Term>{' '}
        — a single number that captures the aerodynamic resistance of the vehicle.
        At 30 m/s (108 km/h) for the Model 3:{' '}
        <InlineMath tex="F_{\text{drag}} \approx 0.5 \times 1.225 \times 0.51 \times 30^2 \approx 280\ \text{N}" />.
        The drag scales as v², so doubling the speed quadruples the drag force and
        cubes the power required to overcome it.
      </p>
      <p className="mb-prose-3">
        The third is the climbing force on a grade:
      </p>
      <Formula tex="F_{\text{climb}} = m \times g \times \sin(\theta)" />
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">F<sub>climb</sub></strong> is the climbing component of weight
        along the road surface in newtons, <strong className="text-text font-medium">m</strong> and <strong className="text-text font-medium">g</strong>{' '}
        are as before, and <strong className="text-text font-medium">θ</strong> is the road grade angle (in radians or
        degrees). On a 6% grade (θ ≈ 3.4°), sin θ ≈ 0.06, so a 2000 kg car has
        <InlineMath tex="F_{\text{climb}} \approx 1180\ \text{N}" /> — about seven times the
        rolling friction and four times the highway aero drag. Hills dominate flat-road
        physics quickly.
      </p>
      <p className="mb-prose-3">
        The fourth is inertia during acceleration:
      </p>
      <Formula tex="F_a = m \times a" />
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">F<sub>a</sub></strong> is the inertial force in newtons,{' '}
        <strong className="text-text font-medium">m</strong> is vehicle mass in kilograms, and <strong className="text-text font-medium">a</strong> is
        instantaneous acceleration in m/s². A 0.5g launch on a 2000 kg car needs
        <InlineMath tex="2000 \times 4.9 = 9800\ \text{N}" /> of tractive force — about 35
        times the highway aero drag. That is why peak-acceleration current is the
        sizing constraint on every component upstream of the wheels, not steady-state
        cruise.
      </p>
      <p className="mb-prose-3">
        Total instantaneous wheel power is the sum times the speed:
      </p>
      <Formula tex="P_{\text{wheel}} = (F_{\text{roll}} + F_{\text{drag}} + F_{\text{climb}} + F_a) \times v" />
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">P<sub>wheel</sub></strong> is mechanical power delivered at the
        contact patch in watts, the four F terms are the resistive forces in newtons,
        and <strong className="text-text font-medium">v</strong> is vehicle speed in m/s. For a Model 3 cruising flat
        at 110 km/h (30.6 m/s), F<sub>roll</sub> + F<sub>drag</sub> ≈ 160 + 290 ≈ 450 N,
        and <InlineMath tex="P_{\text{wheel}} \approx 450 \times 30.6 \approx 13.8\ \text{kW}" />. That
        is the entire steady-state mechanical demand of an EV at freeway speed —
        comfortably less than a hairdryer per wheel<Cite id="codata-2018" in={SOURCES} />.
      </p>

      <TryIt
        tag="Try 41.4"
        question={<>For a passenger EV with rolling-resistance coefficient <strong className="text-text font-medium">C<sub>rr</sub> = 0.008</strong>, drag area <strong className="text-text font-medium">C<sub>d</sub>·A = 0.6 m²</strong>, mass <strong className="text-text font-medium">m = 2000 kg</strong>, at what speed does aerodynamic drag equal rolling friction?</>}
        hint="Set ½ · ρ · C_d · A · v² = m · g · C_rr and solve for v."
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">Setting the two forces equal and solving for v:</p>
            <Formula tex="v^2 = \dfrac{2 \times m \times g \times C_{rr}}{\rho \times C_d \times A}" />
            <Formula tex="v^2 = \dfrac{2 \times 2000 \times 9.81 \times 0.008}{1.225 \times 0.6} \approx 427" />
            <Formula tex="v \approx 20.7\ \text{m/s} \approx 75\ \text{km/h}" />
            <p className="mb-prose-1 last:mb-0">
              Answer: about <strong className="text-text font-medium">75 km/h</strong>. Below that, rolling friction
              dominates the energy budget (so soft tires and weight-reduction matter
              most); above it, aerodynamic drag dominates (so the body shape and
              CdA matter most). Highway range and city range are limited by
              different physics, and the cross-over is right around suburban arterial
              speed.
            </p>
          </>
        }
      />

      <Pullout>
        An EV is the most tightly-integrated piece of consumer electronics ever sold.
        Every other appliance in your house does one thing; the car at the end of your
        driveway does the work of a power grid in miniature.
      </Pullout>

      <h2 className="chapter-h2">Why charging is billed in kWh, not litres, not amps, not minutes</h2>

      <p className="mb-prose-3">
        The single most-confused unit in the EV world is the kilowatt-hour. Drivers
        used to gasoline ask: "Why doesn't the charger sell me a litre of charge, or
        a kilometre, or an amp?" The answer is that <em className="italic text-text">energy</em> is the conserved
        quantity that ultimately moves the car — and energy is what the battery
        stores, what the grid delivers, and what the utility meters. Every other
        candidate unit (volts, amps, time, distance) is a derived measurement that
        depends on context the charger can't control.
      </p>

      <h3 className="chapter-h3">Energy is conserved; nothing else is</h3>

      <p className="mb-prose-3">
        Watts measure the <em className="italic text-text">rate</em> at which energy moves. Joules and watt-hours
        measure the <em className="italic text-text">total</em> amount. Both are valid; engineers prefer the joule
        for physics derivations and the watt-hour for billing because 1 J = 1 W·s is
        an awkward size for household quantities — a 60 W lightbulb running for an
        hour consumes 216,000 J, which is just 0.06 kWh. Scaling up to the kWh
        bracket makes the numbers human-readable: a kitchen kettle uses about 0.1
        kWh per boil, an EV uses 15–25 kWh per 100 km, a typical home uses 30 kWh
        per day.
      </p>
      <Formula tex="1\ \text{kWh} = 3.6 \times 10^{6}\ \text{J} = 3.6\ \text{MJ}" />
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">kWh</strong> is one kilowatt-hour (a kilowatt held for an
        hour), <strong className="text-text font-medium">J</strong> is one joule (one watt-second), and the factor
        <strong className="text-text font-medium"> 3.6 × 10⁶</strong> comes from 1000 W × 3600 s. The unit is large
        enough that household bills land in two- and three-digit ranges instead of
        seven- and eight-digit ones. Cite <Cite id="codata-2018" in={SOURCES} /> for
        the underlying SI definitions.
      </p>

      <h3 className="chapter-h3">Why the other candidates lose</h3>

      <p className="mb-prose-3">
        <strong className="text-text font-medium">Volts.</strong> Volts measure potential difference, not energy. A
        battery that reads 350 V tells you nothing about how far you can drive — a
        full pack and an empty pack both read approximately 350 V open-circuit
        because the OCV-vs-SOC curve is mostly flat through the middle 80% of state
        of charge.
      </p>
      <p className="mb-prose-3">
        <strong className="text-text font-medium">Amps.</strong> Amps measure flow rate, not the total flow. "I drew
        100 A at the wall" answers a different question — selling amps alone would
        let an unscrupulous charger run you at 100 A × 100 V instead of 100 A ×
        240 V and deliver less than half the energy for the same amperage.
      </p>
      <p className="mb-prose-3">
        <strong className="text-text font-medium">Time.</strong> Selling charging by the minute is what some
        third-party DCFC operators do, and it has a perverse incentive: the network
        is happiest if your car charges slowly, since each minute pays the same. A
        Porsche Taycan that can absorb 270 kW pays the same per minute as a Nissan
        Leaf throttling at 50 kW. Most operators have moved to per-kWh pricing
        precisely because per-minute pricing punishes cars with faster charge
        acceptance.
      </p>
      <p className="mb-prose-3">
        <strong className="text-text font-medium">Distance.</strong> "Sell me 200 km of range" sounds intuitive but
        runs into the fundamental problem that range depends on the car, the
        driver, the weather, and the terrain. A kWh into a 75 kWh Model 3 returns
        ~5.5 km at flat 110 km/h; that same kWh into a 200 kWh Hummer EV returns
        ~3 km. The utility cannot sell what depends on what the customer does with
        it after the cable disconnects.
      </p>
      <p className="mb-prose-3">
        <strong className="text-text font-medium">Litres / gallons.</strong> The gasoline analogy fails for a deeper
        reason: liquid fuel is sold by volume because the energy density per litre
        is approximately constant (gasoline: ~33 MJ/L; diesel: ~36 MJ/L). The
        retailer doesn't sell you joules because the conversion to litres is fixed
        by the chemistry. Battery chemistries don't share that consistency — a
        21700 NMC cell holds ~17 Wh; a 21700 LFP cell holds ~13 Wh — so a "1 L
        equivalent" volume measure for charge would change with every chemistry
        revision. Energy is the chemistry-invariant currency.
      </p>

      <h3 className="chapter-h3">What charging-station displays actually measure</h3>

      <p className="mb-prose-3">
        A DC-fast charger samples DC bus voltage and DC bus current many times per
        second, multiplies them to get instantaneous power in watts, integrates
        that over the session in seconds to produce delivered energy in joules,
        and divides by 3.6 × 10⁶ to display kilowatt-hours. The session
        accumulates the integral
      </p>
      <Formula tex="E_{\text{delivered}} = \int_0^T V_{\text{dc}}(t) \times I_{\text{dc}}(t)\, dt" />
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">E<sub>delivered</sub></strong> is the energy that flowed
        across the coupler during the session (in joules; divide by 3.6×10⁶ for
        kWh), <strong className="text-text font-medium">V<sub>dc</sub>(t)</strong> is the instantaneous DC bus
        voltage (volts), <strong className="text-text font-medium">I<sub>dc</sub>(t)</strong> is the instantaneous
        DC bus current (amperes), and <strong className="text-text font-medium">T</strong> is the session duration
        (seconds). The integration is done in real time by the charger's metering
        circuit — typically certified to ±0.5% per accuracy class 0.5 of OIML R
        46, the same class used for residential utility meters.
      </p>
      <p className="mb-prose-3">
        For AC charging on a Level 2 EVSE, the relevant integral is on the AC
        side (V<sub>rms</sub>(t) × I<sub>rms</sub>(t) × cos φ(t)), but the
        on-board charger's losses mean only ~88-92% of that integral makes it to
        the pack. Some networks bill you for what flowed through the meter
        (closer to "wall energy"); others bill for what reached the pack
        ("delivered energy"). Read the fine print.
      </p>

      <p className="caption-1">
        The takeaway: kWh wins because it is the chemistry-invariant, vehicle-
        invariant, driver-invariant unit of the actual conserved quantity changing
        hands. It is the same unit your utility uses on your home bill, which
        lets the EV slot into the same accounting framework as your refrigerator.
      </p>

      <h2 className="chapter-h2">Range and the back-of-envelope</h2>

      <p className="mb-prose-3">
        With the seven stages in hand, you can do the entire range calculation on a
        napkin. Steady-state highway range is pack energy times drivetrain efficiency
        divided by wheel power demand:
      </p>
      <Formula tex="t_{\text{cruise}} = E_{\text{pack}} \times \eta_{\text{drive}} / P_{\text{wheel}}" />
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">t<sub>cruise</sub></strong> is the cruise time at constant speed
        in hours, <strong className="text-text font-medium">E<sub>pack</sub></strong> is pack energy in kWh,{' '}
        <strong className="text-text font-medium">η<sub>drive</sub></strong> is the dimensionless overall plug-to-wheel
        efficiency (cell out × inverter × motor × gearbox, about 0.88 for a modern
        PMSM-driven EV at constant cruise), and <strong className="text-text font-medium">P<sub>wheel</sub></strong>{' '}
        is mechanical power demand at the wheels in kW. Plugging in the Model 3
        numbers from §Stage 7:
      </p>
      <Formula tex="t_{\text{cruise}} = 75 \times 0.88 / 13.8 \approx 4.8\ \text{h} \to 530\ \text{km at 110 km/h}" />
      <p className="mb-prose-3">
        That is the entire range calculation. Tesla&rsquo;s EPA-rated 530–560 km on
        the Long Range trim, and the equivalent WLTP number of about 600 km, are
        within 10% of this back-of-envelope estimate. The remaining 10% goes to
        accessory loads (cabin heating in winter is the dominant variable here),
        driving cycle (city cycles include lots of accelerate-and-decelerate that
        is partially recovered by regenerative braking but not perfectly), and
        battery aging over the life of the car<Cite id="erickson-maksimovic-2020" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        The same back-of-envelope tells you the charging time. A Level-2 EVSE
        delivering 11.5 kW at 92% onboard-charger efficiency delivers 10.6 kW of
        actual chemical energy into the pack. To add 60% of a 75 kWh pack — 45 kWh —
        takes <InlineMath tex="45/10.6 \approx 4.2\ \text{hours}" />. A 250 kW DC fast
        charger bypasses the onboard charger entirely, dumps DC straight onto the
        bus through a thicker connector, and adds the same 45 kWh in 12 minutes —
        if the cells will accept it at that C-rate, which they will only over the
        20–60% SOC band where the cell voltage curve is flat and far from any
        plating-prone regime<Cite id="iec-62196" in={SOURCES} />.
      </p>

      <TryIt
        tag="Try 41.5"
        question={<>A Level-2 EVSE delivers <strong className="text-text font-medium">11.5 kW</strong> AC to the car. The onboard charger is <strong className="text-text font-medium">η<sub>OBC</sub> = 92%</strong>. How long does it take to charge a 75 kWh pack from 20% to 80%?</>}
        hint="Charging delivers η · P into the pack; the energy needed is the SOC delta times the pack capacity."
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">Energy delivered to the pack per unit wall time:</p>
            <Formula tex="P_{\text{pack}} = \eta_{\text{OBC}} \times P_{\text{EVSE}} = 0.92 \times 11.5 \approx 10.6\ \text{kW}" />
            <p className="mb-prose-1 last:mb-0">Energy needed to go from 20% to 80% of 75 kWh:</p>
            <Formula tex="\Delta E = 0.6 \times 75 = 45\ \text{kWh}" />
            <p className="mb-prose-1 last:mb-0">Time required:</p>
            <Formula tex="t = \Delta E / P_{\text{pack}} = 45 / 10.6 \approx 4.25\ \text{hours}" />
            <p className="mb-prose-1 last:mb-0">
              Answer: about <strong className="text-text font-medium">4.25 hours</strong>. Real-world chargers taper the
              current as the pack approaches 80% (the CC-CV transition discussed in
              Ch.26), so the final 10% of that range takes a disproportionate fraction
              of the time. Plan for about 4.5–5 hours total to hit 80% from 20% on a
              well-sized Level-2 install.
            </p>
          </>
        }
      />

      <TryIt
        tag="Try 41.6"
        question={<>An EV decelerates from <strong className="text-text font-medium">100 km/h to 50 km/h</strong> using regenerative braking that recaptures <strong className="text-text font-medium">70%</strong> of the kinetic-energy change. Vehicle mass <strong className="text-text font-medium">m = 2000 kg</strong>. How many watt-hours go back into the pack?</>}
        hint="Compute kinetic energy at each speed, take the difference, and multiply by 0.7."
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">Kinetic energy at each speed (converting km/h to m/s):</p>
            <Formula tex="v_1 = 100/3.6 \approx 27.8\ \text{m/s}; \quad v_2 = 50/3.6 \approx 13.9\ \text{m/s}" />
            <Formula tex="\Delta KE = \tfrac{1}{2} \times 2000 \times (27.8^2 - 13.9^2) \approx 1000 \times (773 - 193) = 580{,}000\ \text{J}" />
            <p className="mb-prose-1 last:mb-0">Multiply by the regen efficiency to get the recovered energy:</p>
            <Formula tex="E_{\text{regen}} = 0.7 \times 580{,}000\ \text{J} \approx 406{,}000\ \text{J} \approx 113\ \text{Wh}" />
            <p className="mb-prose-1 last:mb-0">
              Answer: about <strong className="text-text font-medium">110 Wh</strong> back into the pack. In a city
              cycle with frequent slowdowns, regen routinely contributes 15–25% of
              the consumed energy back — which is why EV city efficiency is
              typically <em className="italic text-text">better</em> than highway efficiency, the exact opposite
              of an internal-combustion vehicle.
            </p>
          </>
        }
      />

      <CaseStudies intro="The same seven-stage chain plays out across every modern EV; specifications change but the architecture is fixed.">
        <CaseStudy
          tag="Case 41.1"
          title="The Tesla Model 3 Long Range — the canonical implementation"
          summary={<>4416 cells, 350 V nominal pack, dual-motor with one PMSM and one induction motor, SiC traction inverter, 11.5 kW onboard charger, 250 kW DC-fast capability.</>}
          specs={[
            { label: 'Cell format', value: '21700 NMC cylindrical' },
            { label: 'Series × parallel', value: '96 × 46 = 4416 cells' },
            { label: 'Pack nominal voltage', value: '350 V' },
            { label: 'Pack nominal capacity', value: '~75 kWh' },
            { label: 'Rear motor', value: 'PMSM, ~211 kW peak' },
            { label: 'Front motor (AWD)', value: 'Induction, ~108 kW peak' },
            { label: 'Inverter switches', value: 'SiC MOSFETs (24 dies total in main inverter)' },
            { label: 'Single-speed reduction', value: '9.04:1' },
            { label: 'Onboard charger', value: '11.5 kW Level-2, 250 kW DCFC' },
            { label: 'EPA range', value: '~560 km combined' },
            { label: 'Drag coefficient', value: 'C_d = 0.23' },
            { label: 'Curb weight', value: '~1850 kg' },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            The Model 3 was the first volume EV to ship silicon-carbide traction
            inverters, in 2017. That single design choice — replacing IGBT silicon
            with SiC MOSFETs in the main inverter — pushed peak inverter efficiency
            from about 96% to about 98% across the operating envelope, which directly
            buys about 4% range at constant cruise. The 96-series-cell pack landed
            at 350 V nominal, which is on the low side of modern EV architectures
            (Hyundai E-GMP, Porsche Taycan, and Lucid Air all use 800 V) — the
            tradeoff is that a 350 V pack can use lower-voltage SiC dies (650 V class)
            that are cheaper than the 1200 V dies an 800 V pack requires, at the
            cost of doubling the conductor cross-section everywhere current flows.
          </p>
          <p className="mb-prose-2 last:mb-0">
            The asymmetric motor choice is unusual. The rear motor is a permanent-magnet
            synchronous motor with NdFeB magnets, optimised for high torque density
            and quick response. The front motor is an induction machine — no magnets,
            squirrel-cage rotor, slightly heavier per kW. At highway cruise the
            controller can de-energise the induction front motor entirely and let it
            freewheel, recovering about 1–2% range relative to using a PMSM in both
            positions (because a PMSM&rsquo;s spinning magnets continually generate
            back-EMF that the inverter has to actively suppress, costing a small but
            measurable amount of current).
          </p>
          <p className="mb-prose-2 last:mb-0">
            Walking the seven-stage chain top-to-bottom on this car: 4416 NMC cells →
            BMS with twelve cell-sense boards → main contactors with a 100 Ω precharge
            → ~2 kW isolated DC-DC down to a 12 V lead-acid auxiliary → 350 V to the
            three-phase SiC inverter at 10 kHz PWM → 4-pole-pair PMSM (or induction)
            stator → 9:1 single-speed reducer → 660 mm tire to the road. Every spec
            in the dashboard rolls up from the per-cell numbers and the seven
            transformations that link them.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 41.2"
          title="400 V vs 800 V — Nissan Leaf vs Hyundai Ioniq 5"
          summary={<>The same DC-fast-charging connector at different pack voltages charges at radically different rates because P = V · I and the connector caps I.</>}
          specs={[
            { label: 'Nissan Leaf (e+) pack', value: '400 V nominal, 62 kWh' },
            { label: 'Leaf DCFC peak', value: '~50 kW (CHAdeMO)' },
            { label: 'Hyundai Ioniq 5 pack', value: '800 V nominal, 77 kWh' },
            { label: 'Ioniq 5 DCFC peak', value: '~230 kW (CCS Combo)' },
            { label: 'DC connector current limit', value: '~500 A typical' },
            { label: '20→80% time (Leaf)', value: '~45 minutes' },
            { label: '20→80% time (Ioniq 5)', value: '~18 minutes' },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            DC fast charging is bandwidth-limited by the connector. The IEC 62196
            Combo 2 (CCS) coupler is rated for around 500 A continuous, set by the
            thermal limit on the contacts and the cable conductors (active liquid
            cooling on the cable pushes that higher, but commodity stations stay near
            500 A)<Cite id="iec-62196" in={SOURCES} />. The transferred power is
            simply <InlineMath tex="P = V_{\text{pack}} \times I_{\text{connector}}" />.
            A 400 V pack drawing 500 A from the connector gets 200 kW. An 800 V
            pack drawing the same 500 A gets 400 kW. Doubling the architecture
            voltage roughly doubles the achievable DC-fast charging rate without
            changing the connector at all.
          </p>
          <p className="mb-prose-2 last:mb-0">
            The Nissan Leaf, designed in the early 2010s, has a 400 V architecture
            and historically a CHAdeMO connector (also IEC 62196 family) limited to
            about 50 kW in practice. Hyundai&rsquo;s E-GMP platform, designed for the
            Ioniq 5 and the Kia EV6, jumped to 800 V — the first non-luxury EV
            platform to do so — specifically to break the DC-fast-charging ceiling.
            At a 350 kW DC fast charger, the Ioniq 5 hits its 230 kW peak rate for
            the first half of its 20→80% window and finishes the charge in about
            18 minutes; the Leaf at the same station takes the full 45 minutes of
            its CHAdeMO limit.
          </p>
          <p className="mb-prose-2 last:mb-0">
            The cost is that every component on the 800 V bus has to be rated for
            twice the voltage. The SiC dies in the inverter jump from 650 V to
            1200 V class. The bus capacitors double their voltage rating. The
            traction motor windings need thicker insulation. The DC-DC for the 12 V
            rail has a different transformer ratio. Every part is more expensive,
            but the consumer-facing benefit (a coffee stop instead of a meal stop)
            is large enough that the entire industry has been migrating to 800 V
            since 2021.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 41.3"
          title="The induction-motor exception — why Tesla still uses both"
          summary={<>PMSMs win on torque density and efficiency at load; induction motors win on freewheeling drag. Tesla uses both in the same car to harvest each advantage.</>}
          specs={[
            { label: 'PMSM rotor', value: 'NdFeB permanent magnets, embedded in rotor steel' },
            { label: 'Induction motor rotor', value: 'Aluminium / copper squirrel cage, no magnets' },
            { label: 'PMSM no-load drag', value: 'Significant (back-EMF must be actively cancelled)' },
            { label: 'Induction no-load drag', value: 'Near zero (rotor produces no field unless excited)' },
            { label: 'Tesla Model 3 LR config', value: 'Rear PMSM + front induction' },
            { label: 'Hyundai Ioniq 5 AWD config', value: 'Rear PMSM + front PMSM' },
            { label: 'Rare-earth content', value: 'PMSM: ~1 kg NdFeB / motor; induction: 0 kg' },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            A PMSM&rsquo;s magnets do not turn off. When the rotor spins, the
            magnets induce a back-EMF in the stator windings whether the inverter
            is commanding torque or not. If the windings are left open the rotor
            free-wheels, but the inverter is rarely left fully open — it actively
            holds i<sub>q</sub> at zero, which on a PMSM still requires injecting
            small i<sub>d</sub> currents to oppose the magnet flux and keep the
            phase currents bounded. The result is that a freewheeling PMSM drags
            slightly even at zero commanded torque.
          </p>
          <p className="mb-prose-2 last:mb-0">
            An induction motor with no commanded current does not drag at all.
            The squirrel-cage rotor produces no field of its own, and with the
            stator currents at zero there is nothing to react against. The rotor
            spins freely. This is the only meaningful efficiency advantage induction
            has over PMSM, and at highway cruise on a dual-motor AWD car it is
            enough to matter — about 1–2% range on a US EPA cycle.
          </p>
          <p className="mb-prose-2 last:mb-0">
            Tesla&rsquo;s solution: put a PMSM on the axle that does most of the
            work (the rear), put an induction motor on the axle that is asleep
            most of the time (the front). At cruise the front motor is de-energised
            and freewheels, contributing zero drag; on hard acceleration both
            motors are engaged and the induction motor adds its torque to the
            rear PMSM. The cost is engineering complexity — two different motor
            controllers, two different sets of spares — but the practical efficiency
            win is real, and the lower rare-earth content (no NdFeB in the front
            motor) hedges against supply-chain risk.
          </p>
        </CaseStudy>
      </CaseStudies>

      <FAQ
        intro="The seven-stage architecture is the same in every EV on the market, but readers ask the same questions about it again and again."
      >
        <FAQItem q="Why doesn&rsquo;t an EV need a multi-speed gearbox?">
          <p>
            An internal-combustion engine produces useful torque only in a narrow
            2000–4500 RPM band, so a 5- to 8-speed gearbox is required to keep the
            engine on song across the vehicle&rsquo;s speed range. An electric motor
            produces full torque from 0 RPM (Ch.20) and constant power above its base
            speed (Stage 5 above). The torque–speed envelope is therefore flat across
            roughly a 10:1 speed range, which is the same range a single fixed gear
            ratio of about 9:1 spans between idle and the motor&rsquo;s redline near
            18 000 RPM<Cite id="erickson-maksimovic-2020" in={SOURCES} />. The
            machinery saved — clutch, torque converter, shift solenoids — saves cost,
            weight, and a half-dozen failure modes that ICE cars have to engineer
            around.
          </p>
        </FAQItem>

        <FAQItem q="Why is regenerative braking less than 100% efficient?">
          <p>
            Regen runs the entire drivetrain backwards: kinetic energy at the wheels
            drives the gearbox, the gearbox drives the rotor, the rotor&rsquo;s magnets
            induce back-EMF in the stator, the inverter rectifies that AC into DC and
            pushes it onto the high-voltage bus, the BMS arbitrates how much current
            the cells will accept, and the cells finally store it chemically. Each
            of those stages has the same losses going backwards as forwards: gearbox
            ~2%, motor ~5%, inverter ~3%, BMS + cell ~5%. Multiplying through gives
            about <InlineMath tex="0.98 \times 0.95 \times 0.97 \times 0.95 \approx 0.86" />, which
            matches the 70–85% round-trip efficiency that real cars achieve at
            moderate decelerations. Hard decelerations are limited by the cells&rsquo;
            charge-acceptance C-rate, which is lower than their discharge C-rate, so
            the inverter has to dump the excess into the friction brakes — the regen
            ratio drops below 50% on a full ABS stop.
          </p>
        </FAQItem>

        <FAQItem q="What is &lsquo;torque-producing current&rsquo; (i_q) vs &lsquo;flux-producing current&rsquo; (i_d)?">
          <p>
            Field-oriented control transforms the three stator currents into two
            orthogonal components in a frame that rotates with the rotor. The
            component aligned with the rotor flux axis is{' '}
            <InlineMath tex="i_d" /> ("direct-axis"); the component
            perpendicular to it is <InlineMath tex="i_q" />
            ("quadrature-axis"). The cross product of rotor flux and stator current
            gives torque, which in this frame becomes τ ∝ ψ × i<sub>q</sub> — only
            the quadrature component does work. In a PMSM the rotor flux is fixed
            by the magnets, so under normal operation i<sub>d</sub> is held at zero
            and only i<sub>q</sub> is modulated to control torque. Above base
            speed, i<sub>d</sub> is driven negative to weaken the magnet flux and
            extend the speed range — at the cost of carrying current that produces
            no torque<Cite id="erickson-maksimovic-2020" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why are SiC MOSFETs replacing silicon IGBTs in modern EV inverters?">
          <p>
            Silicon carbide is a wide-bandgap semiconductor: roughly 3× the bandgap
            of silicon, which directly translates into lower on-state losses (the
            SiC MOSFET is a true MOSFET with R<sub>DS(on)</sub>·A about 5× lower
            than a comparable IGBT at the same blocking voltage), faster switching
            (50–100 ns vs. 500 ns for the IGBT), and higher operating temperature
            (200 °C vs. 150 °C junction limit). The net effect at the inverter
            level is 2–4 percentage points of efficiency improvement across the
            operating envelope and a substantial reduction in heat-sink mass. At
            EV traction-inverter scale that translates directly into 3–5% more
            driving range from the same pack<Cite id="sedra-smith-2014" in={SOURCES} />.
            The cost is silicon: SiC wafer prices are higher than silicon and the
            material is harder to fabricate, but high-volume production through
            the 2020s has narrowed the cost gap to within 1.5× silicon, which the
            efficiency gain pays back over the first year of car use.
          </p>
        </FAQItem>

        <FAQItem q="Why does a 400 V pack charge slower at a DC-fast station than an 800 V pack?">
          <p>
            DC fast charging delivers power as P = V × I. The connector caps the
            current (about 500 A on the common CCS Combo 2 coupler before resorting
            to active liquid cooling)<Cite id="iec-62196" in={SOURCES} />. Pack
            voltage sets the multiplier. A 400 V pack at 500 A is 200 kW; an 800 V
            pack at the same 500 A is 400 kW. Without doing anything to the
            connector or the cable, doubling the pack voltage doubles the
            charging rate. The cost is that every part on the bus has to be rated
            for twice the voltage — silicon dies, capacitors, motor insulation,
            DC-DC transformer ratios — but the consumer-facing benefit of cutting
            DC-fast time in half drove the entire industry to migrate to 800 V
            architectures starting around 2020.
          </p>
        </FAQItem>

        <FAQItem q="Can an EV charge from a household 120 V outlet? How long does that take?">
          <p>
            Yes — Level-1 charging is exactly that. A standard 120 V / 15 A outlet
            delivers about 1.4 kW continuous (limited to 12 A by the J1772 standard
            for safety derating)<Cite id="sae-j1772" in={SOURCES} />. After the
            onboard charger&rsquo;s 92% efficiency, about 1.3 kW reaches the pack.
            On a 75 kWh battery, going from 20% to 80% (45 kWh) takes{' '}
            <InlineMath tex="45/1.3 \approx 35\ \text{hours}" />. That is too slow for a
            primary charging solution but adequate for an overnight top-up of a
            commuter&rsquo;s daily 50 km — about 8 hours plugged in adds back roughly
            the energy used. Level-1 is the everyday default for plug-in hybrids and
            for EV drivers whose daily mileage is well below their range.
          </p>
        </FAQItem>

        <FAQItem q="Why does the BMS need active or passive cell balancing instead of just monitoring?">
          <p>
            Even cells from the same production lot drift apart by a few percent in
            capacity over a few hundred cycles, and by 10–50 mV in voltage at any
            given state of charge. The pack&rsquo;s usable energy is set by the
            weakest cell — the one that hits the lower voltage cutoff first on
            discharge or the upper cutoff first on charge. Without balancing, the
            spread grows monotonically and the pack&rsquo;s usable energy decays
            faster than the average cell&rsquo;s capacity does. Balancing — bleeding
            charge off high cells (passive) or shuttling it from high to low
            (active) — keeps the spread bounded and preserves capacity for the
            life of the pack<Cite id="horowitz-hill-2015" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why is the 12 V auxiliary rail still 12 V — couldn&rsquo;t we just run everything at 350 V?">
          <p>
            Mostly inertia. The automotive supplier ecosystem has fifty years of
            12 V silicon, 12 V lamps, 12 V audio amplifiers, 12 V door-lock
            actuators, 12 V infotainment chipsets, and 12 V starter-battery
            charging algorithms. Building all of that fresh at 350 V is a much
            bigger problem than adding a 2 kW isolated DC-DC converter to the EV.
            There is also a safety case: 12 V is a touch-safe voltage class, so
            the wiring harness, connectors, fuses, and switches do not need the
            insulation, creepage, and isolation requirements that a 350 V harness
            would. The DC-DC converter pays for itself in supplier-cost terms
            many times over. A small camp of EV designers is now pushing 48 V
            auxiliary rails to handle higher-power accessories like electric
            superchargers, but the move is incremental rather than wholesale.
          </p>
        </FAQItem>

        <FAQItem q="Why does cold weather hurt EV range so dramatically?">
          <p>
            Three reasons stack. First, lithium-ion cell internal resistance rises
            roughly threefold from +20 °C to −10 °C, which directly increases
            ohmic losses in the pack during both discharge and charge. Second,
            cabin heating is electrical: an ICE car heats the cabin with waste
            heat from the engine (essentially free), while an EV runs a 3–5 kW
            resistive or heat-pump heater that comes straight off the pack —
            5 kW on a 13 kW cruise demand is a 40% range hit by itself. Third,
            the BMS limits the cell&rsquo;s charge and discharge C-rate in cold
            conditions to avoid lithium plating, so peak regen and peak DCFC
            rates both drop. A 20% range reduction in winter is typical; 40% in
            extreme cold with the heater running flat-out is not unusual<Cite id="horowitz-hill-2015" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What&rsquo;s &lsquo;preconditioning the battery&rsquo; and why does navigation trigger it before a DC fast charge?">
          <p>
            DC fast charging at the cell&rsquo;s allowed C-rate requires the cell
            to be near its optimal operating temperature, typically 25–40 °C. A
            cold pack — say 5 °C in winter — can only accept about 30% of the
            station&rsquo;s rated power without risking lithium plating on the
            anode (which permanently degrades capacity). When the driver routes
            to a DC fast charger, the car turns on the pack heater 15–30 minutes
            before arrival, warming the cells to their target window so they can
            accept full charging current the moment the connector latches. Without
            preconditioning, the same charging session takes two to three times
            as long. Preconditioning costs some of the pack&rsquo;s energy as
            heat, but the time saved at the charger more than compensates on a
            long road-trip.
          </p>
        </FAQItem>

        <FAQItem q="Why is the inverter water-cooled?">
          <p>
            Peak inverter losses at full acceleration are 2–4% of about 250 kW —
            5 to 10 kW dissipated in the six silicon-carbide dies and the
            associated DC bus capacitors. That heat density is well beyond what
            forced-air cooling can handle in the limited volume of a traction
            inverter, so modern EVs route a 50/50 glycol-water mix through cold
            plates directly bonded to the inverter substrate, the motor stator,
            and the onboard charger. The same coolant loop typically connects to
            the pack&rsquo;s thermal-management plates so the cells, motor, and
            inverter share one cooling circuit. Heat is rejected to ambient at
            the front radiator and, in heat-pump-equipped cars, can be repurposed
            to warm the cabin instead of wasting it.
          </p>
        </FAQItem>

        <FAQItem q="Will solid-state batteries change any of this?">
          <p>
            Probably not the architecture, but a lot of the parameters. A solid-state
            cell with a lithium-metal anode promises about 2× the energy density of
            a current NMC liquid-electrolyte cell (~500 Wh/kg at the cell level vs.
            ~250 Wh/kg today) and a wider safe-operating temperature window<Cite id="horowitz-hill-2015" in={SOURCES} />.
            The seven-stage chain stays the same — there is still a pack, a BMS, a
            contactor, a DC-DC, an inverter, a motor, a gearbox — but the pack
            shrinks by half for the same range, or the range doubles for the same
            pack volume. Solid-state cells also tolerate higher charge C-rates
            without plating, so DC fast charging at 350+ kW becomes routine.
            Commercial production at automotive volume has slipped repeatedly
            (originally promised for 2020, currently expected somewhere in
            2026–2030 depending on the chemistry), so for now the chapter you just
            read describes the production state of the art.
          </p>
        </FAQItem>

        <FAQItem q="How does the BMS estimate state of charge when the cell voltage curve is flat?">
          <p>
            LFP cells in particular have a voltage curve that is nearly flat
            between 20% and 90% SOC — a few millivolts of discrimination across
            a 70% energy range. Voltage-only SOC estimation is hopeless there.
            The BMS combines several signals: integrated pack current (coulomb
            counting), open-circuit voltage at rest (refines the estimate when
            the car has been parked for long enough), temperature-corrected cell
            impedance, and the voltage curve&rsquo;s steeper endpoints. A Kalman
            filter or recursive least-squares estimator fuses these into a single
            SOC number with about 2–3% accuracy on a well-instrumented pack.
            Long-term drift is recalibrated whenever the pack reaches a known
            anchor point (full charge to 100% or a deep discharge to 5%).
          </p>
        </FAQItem>

        <FAQItem q="Why does the EV community talk about &lsquo;Wh/km&rsquo; instead of MPG?">
          <p>
            EV efficiency is a chemical-energy-per-distance number; ICE efficiency
            is a chemical-energy-per-volume number. Watt-hours per kilometre is
            the direct measurement: a Model 3 averages about 150 Wh/km on the
            EPA cycle, which means a 75 kWh pack will go{' '}
            <InlineMath tex="75{,}000/150 = 500\ \text{km}" /> on a charge. Translating
            that into MPG-equivalent ("MPGe") requires assuming a conversion
            factor between electricity and gasoline (33.7 kWh per US gallon by
            EPA convention), which depends on whether you measure at the pump or
            at the wall socket or at the power plant — different choices give
            different numbers. Wh/km cuts through that and is what you actually
            need to plan a road trip.
          </p>
        </FAQItem>

        <FAQItem q="What kills an EV battery first — calendar time, cycle count, or both?">
          <p>
            Both, but on different schedules. Calendar aging — slow SEI growth
            on the anode while the cell sits at rest — depends mostly on
            temperature and average state of charge: hot and full is the worst
            storage condition; cool and at 50% SOC is the best. A typical EV
            cell loses about 2% capacity per year on calendar terms alone, even
            if the car never moves. Cycle aging adds another loss proportional to
            energy throughput, weighted by depth of discharge (a 100% cycle is
            roughly 4× as damaging as four 25% cycles to the same total energy)
            and by C-rate (DC fast charging is worse than Level-2 by about 10–20%
            on long-term capacity)<Cite id="horowitz-hill-2015" in={SOURCES} />.
            For a typical commuter who DC-fast-charges occasionally and stays in
            the 20–80% window, calendar aging dominates and the pack reaches its
            warranty 70% capacity threshold somewhere between year 8 and year 12.
          </p>
        </FAQItem>

        <FAQItem q="Why is the EV charging cable so much thicker than the plug on my laptop?">
          <p>
            A Level-2 EVSE delivers 11.5 kW continuous at 240 V — that is 48 A
            continuous flowing for hours. A laptop power brick delivers maybe
            65 W at 20 V — 3 A and an intermittent duty cycle. Conductor
            cross-section scales with the square of the current (because the
            limit is I² R heating), so the EV cable needs roughly 250× the
            copper of a laptop cable. The pilot-and-proximity wires inside the
            J1772 connector add another conductor pair carrying a 1 kHz square
            wave that tells the car what current the station allows, plus a
            ground-fault detector that opens the contactor within milliseconds
            if anything goes wrong<Cite id="ul-2231" in={SOURCES} />.
          </p>
        </FAQItem>
      </FAQ>
    </ChapterShell>
  );
}
