/**
 * Chapter 16 — Motors
 *
 * F = q v × B applied to the conduction electrons of a current-carrying
 * coil gives a force on the coil; F·r is torque. Build that into a
 * brushed DC motor, a brushless one, an AC induction (Tesla 1888) machine,
 * a synchronous motor, a stepper. Same physics; six different commutation
 * strategies.
 */
import { CaseStudies, CaseStudy } from '@/components/CaseStudy';
import { ChapterShell } from '@/components/ChapterShell';
import { FAQ, FAQItem } from '@/components/FAQ';
import { Cite } from '@/components/SourcesList';
import { Formula, InlineMath } from '@/components/Formula';
import { Pullout } from '@/components/Prose';
import { Term } from '@/components/Term';
import { TryIt } from '@/components/TryIt';
import { BrushedDCMotorDemo } from './demos/BrushedDCMotor';
import { BackEMFInRunningMotorDemo } from './demos/BackEMFInRunningMotor';
import { BLDCCommutationDemo } from './demos/BLDCCommutation';
import { FieldOrientedControlDemo } from './demos/FieldOrientedControl';
import { InductionMotorSlipDemo } from './demos/InductionMotorSlip';
import { RotatingMagField3DDemo } from './demos/RotatingMagField3D';
import { SynchronousMotorDemo } from './demos/SynchronousMotor';
import { StepperMotorDemo } from './demos/StepperMotor';
import { TorqueSpeedCurveDemo } from './demos/TorqueSpeedCurve';
import { MotorEfficiencyMapDemo } from './demos/MotorEfficiencyMap';
import { getChapter } from './data/chapters';

export default function Ch16Motors() {
  const chapter = getChapter('motors')!;
  const SOURCES = chapter.sources;

  return (
    <ChapterShell chapter={chapter}>
      <p className="chapter-intro">
        Pry open a cheap cordless drill and you find a brick of copper and steel about the size of a
        deck of cards. Apply 18 volts of lithium-ion DC across two contact strips and it converts{' '}
        <strong className="text-text font-medium">600 W of electrical power</strong>
        into mechanical torque well enough to drive a four-inch lag screw into oak. There are no
        fluids inside, no combustion, no moving valves — just one rotating bit of iron wound with
        copper wire, two stationary magnets, and a pair of carbon brushes the size of pencil
        erasers. That brick is, in essence, the same machine that turns every Tesla wheel, every CNC
        spindle, every washing-machine drum, every Roomba caster, and every electric toothbrush on
        the planet.
      </p>
      <p className="mb-prose-3">
        This chapter is about how it works. The bottom line is a single equation we already met in
        Chapter 6: a current in a magnetic field feels a force, and a current loop in a field feels
        a torque. Wrap that into a rotating bundle and you get a motor. The challenge — and the
        entire reason there are half a dozen distinct motor families rather than just one — is what
        to do at the moment the loop has rotated 180° and the torque, left to itself, would reverse
        and oscillate forever. Brushes, electronic switches, three-phase fields, and tooth counts
        are five different answers to the same question.
      </p>

      <h2 className="chapter-h2">Force on a wire = torque on a coil</h2>

      <p className="mb-prose-3">
        Chapter 6 wrote down the{' '}
        <Term def="The total electromagnetic force on a point charge: F = q(E + v × B). For currents — many charges moving together — the magnetic piece becomes a force per length on the wire.">
          Lorentz force
        </Term>
        on a moving charge: <InlineMath id="lorentz-force" />. A current is moving charge — many of
        them, at the same drift velocity. Sum the per-charge force over a length{' '}
        <em className="text-text italic">L</em> of wire carrying current{' '}
        <em className="text-text italic">I</em> in a uniform field{' '}
        <strong className="text-text font-medium">B</strong> and the wire itself feels
        <Cite id="feynman-II-13" in={SOURCES} />:
      </p>
      <Formula size="lg" id="force-on-wire" />
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">F</strong> is the force on the wire segment
        (in newtons), <strong className="text-text font-medium">I</strong> is the current flowing
        through it (in amperes), <strong className="text-text font-medium">L</strong> is a vector
        along the wire of length equal to the segment (in metres) pointing in the direction of
        conventional current, and <strong className="text-text font-medium">B</strong> is the
        magnetic field at the wire's location (in tesla).
      </p>
      <p className="mb-prose-3">
        Bend the wire into a closed rectangular loop of <em className="text-text italic">N</em>{' '}
        turns and area <em className="text-text italic">A</em>, place it in{' '}
        <strong className="text-text font-medium">B</strong>, and the two long sides experience
        equal-and-opposite forces displaced from the loop's central axis. Those forces don't cancel
        — they form a couple. The resulting{' '}
        <Term def="The rotational analog of force. Torque about an axis is force times the perpendicular distance from the axis. SI unit: N·m.">
          torque
        </Term>{' '}
        on the loop is
        <Cite id="griffiths-2017" in={SOURCES} />:
      </p>
      <Formula tex="\tau = N I A B \sin\theta" />
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">τ</strong> is the magnitude of the torque on
        the loop (in N·m),
        <strong className="text-text font-medium"> N</strong> is the number of turns in the coil
        (dimensionless integer),
        <strong className="text-text font-medium"> I</strong> is the current in the coil (in
        amperes), <strong className="text-text font-medium">A</strong> is the area enclosed by one
        turn (in m²), <strong className="text-text font-medium">B</strong> is the magnetic field
        magnitude (in tesla), and <strong className="text-text font-medium">θ</strong> is the angle
        between the loop's surface normal and the field (in radians). Maximum torque when the loop's
        plane is parallel to <strong className="text-text font-medium">B</strong> (θ = 90°); zero
        when the plane is perpendicular (θ = 0). That single formula is every electric motor in one
        line. Everything that follows is engineering: how to keep θ in the region where{' '}
        <em className="text-text italic">sin(θ)</em> is positive, so the torque drives the rotor
        forward instead of bouncing back and forth across one position.
      </p>

      <TryIt
        tag="Try 16.1"
        question={
          <>
            A rectangular coil has <strong className="text-text font-medium">N = 100</strong> turns,
            area <strong className="text-text font-medium">A = 30 cm²</strong>, sits in a field of{' '}
            <strong className="text-text font-medium">B = 0.3 T</strong>, and carries{' '}
            <strong className="text-text font-medium">I = 2 A</strong>. What is the maximum torque?
          </>
        }
        hint={
          <>
            Use <InlineMath tex="\tau = N I A B \sin\theta" />, with{' '}
            <InlineMath tex="\sin\theta = 1" /> at maximum.
          </>
        }
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">
              Convert A = 30 cm² = 3×10⁻³ m². Maximum torque is at{' '}
              <InlineMath tex="\sin\theta = 1" />:
            </p>
            <Formula tex="\tau_{\max} = N I A B = (100)(2)(3\times 10^{-3})(0.3)" />
            <Formula tex="\tau_{\max} = 0.18\ \text{N·m}" />
            <p className="mb-prose-1 last:mb-0">
              About the torque you'd feel holding a 180 g mass on a 10 cm lever — modest, but enough
              to drive a small cooling fan or position a camera lens
              <Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2 className="chapter-h2">The brushed DC motor</h2>

      <p className="mb-prose-3">
        The first practical motor solves the sign-of-sin(θ) problem mechanically. Take the
        single-loop machine above and connect each end of the coil to a half-ring of conductor on
        the rotating shaft — a two-segment
        <em className="text-text italic">
          {' '}
          <Term def="A pair of half-rings on the rotor shaft, with stationary brushes rubbing on them, that mechanically reverses the polarity of the rotor current every half-turn. Converts external DC into the alternating coil current a motor needs.">
            commutator
          </Term>
        </em>
        . Press two stationary carbon{' '}
        <Term def="A graphite or carbon-composite block, spring-loaded against the commutator, that conducts current into the rotating coil. Wears out gradually; the major reason brushed motors need periodic maintenance.">
          brushes
        </Term>
        against the rings from outside the spinning rotor. Every half-rotation, the brushes break
        contact with one segment and make contact with the other, reversing the direction of current
        in the coil. The trigonometry flips with it: <em className="text-text italic">sin(θ)</em>{' '}
        reverses sign, the current reverses sign, the product stays positive. Net torque always
        drives the rotor forward
        <Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />.
      </p>

      <BrushedDCMotorDemo />

      <p className="mb-prose-3">
        That's the brushed DC motor in one paragraph. It runs directly off a DC supply, the rotor
        naturally spins up until its{' '}
        <Term def="The voltage a spinning motor produces as a generator (E = NBAω in a coil rotating in B). Subtracts from the supply voltage; at rated speed it equals the supply minus an IR drop.">
          back-EMF
        </Term>{' '}
        nearly equals the supply voltage, and the steady-state current is set by whatever residual
        the winding resistance absorbs. Cheap to build. Speed control by varying the duty cycle of a
        PWM switch. No special drive electronics required.
      </p>
      <p className="mb-prose-3">
        The brushes are also where it goes wrong. They wear out — typically tens to hundreds of
        hours of cumulative running time. They spark (commutation across a small inductive gap
        produces an arc), which is both an EMI source and a wear accelerator. In high-altitude or
        dusty environments the wear rate jumps. Vacuum and oxygen- free atmospheres are particularly
        hostile because graphite needs a thin moisture film to lubricate the ring-on-brush
        interface; without it, brush wear becomes catastrophic. Most modern applications that can
        tolerate the extra cost have moved on.
      </p>

      <p className="mb-prose-3">
        That back-EMF is worth a closer look, because it is the single equation governing how a
        brushed DC motor behaves between the moment you connect it and the moment it reaches a
        steady running speed. In a frozen rotor (<InlineMath tex="\omega = 0" />
        ), the back-EMF is zero, so the full supply voltage drops across the winding resistance and
        <InlineMath tex="I = V/R" /> — an inrush current commonly 10× the rated running value. As
        the rotor spins up, back-EMF rises in proportion to speed (
        <InlineMath tex="E_{\text{back}} = k_e\, \omega" />
        ), the net voltage across <em className="text-text italic">R</em>
        falls, and the current drops to whatever value is required to balance the load torque. The
        settling time is set by the mechanical inertia, not the electrical time constant: that is
        why inrush current is brief but ferocious
        <Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />.
      </p>

      <BackEMFInRunningMotorDemo />

      <TryIt
        tag="Try 16.2"
        question={
          <>
            A <strong className="text-text font-medium">12 V</strong> brushed DC motor has winding
            resistance <strong className="text-text font-medium">R = 1 Ω</strong> and back-EMF
            constant{' '}
            <strong className="text-text font-medium">
              k<sub>e</sub> = 0.1 V·s/rad
            </strong>
            . What is the starting current at stall? What is the steady-state current at{' '}
            <InlineMath tex="\omega = 100\ \text{rad/s}" /> with negligible load?
          </>
        }
        hint={
          <>
            At stall <InlineMath tex="E_{\text{back}} = 0" /> so <InlineMath tex="I = V/R" />. At{' '}
            <InlineMath tex="\omega = 100\ \text{rad/s}" />,{' '}
            <InlineMath tex="E_{\text{back}} = k_e\, \omega" />, and{' '}
            <InlineMath tex="I = (V - E_{\text{back}})/R" />.
          </>
        }
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">
              At stall (<InlineMath tex="\omega = 0" />
              ):
            </p>
            <Formula tex="I_{\text{stall}} = V/R = 12/1 = 12\ \text{A}" />
            <p className="mb-prose-1 last:mb-0">
              At <InlineMath tex="\omega = 100\ \text{rad/s}" />:
            </p>
            <Formula tex="E_{\text{back}} = k_e\, \omega = (0.1)(100) = 10\ \text{V}" />
            <Formula tex="I = (V - E_{\text{back}}) / R = (12 - 10) / 1 = 2\ \text{A}" />
            <p className="mb-prose-1 last:mb-0">
              The starting current is 6× the running current — a typical ratio. This is why every
              motor controller needs either a soft-start, a series inrush limiter, or a power stage
              rated for the worst-case stall current
              <Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2 className="chapter-h2">Brushless DC and PMSM</h2>

      <p className="mb-prose-3">
        Invert the topology. Put the permanent magnets on the rotor — typically two, four, or eight
        pole-pairs of sintered{' '}
        <Term def="A class of high-energy permanent magnets composed of neodymium, iron, and boron. Energy product ~280–440 kJ/m³; the workhorse magnet of every modern BLDC/PMSM motor.">
          neodymium-iron-boron
        </Term>{' '}
        — and put the windings on the outer stator. Now no current has to enter or leave the
        spinning part, so there's no mechanical commutator and no brushes. The price is that the
        commutation now has to be done <em className="text-text italic">electronically</em>: an
        external controller has to know roughly where the rotor is and energize the right pair of
        stator coils at the right time
        <Cite id="krishnan-2010-bldc" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        The simplest scheme — and the source of the name{' '}
        <em className="text-text italic">brushless DC</em> — uses three stator phases and a six-step
        commutation table. The controller drives one phase HIGH and one phase LOW (third phase
        floats) for 60° of rotation, then advances to the next pair. The stator field jumps 60°
        around the bore six times per electrical cycle, and the permanent-magnet rotor chases it
        with a fixed lead angle.
        <Term def="Hall-effect sensor: a semiconductor element whose output voltage tracks the magnetic field through it. Three of them spaced 120° around the rotor give the controller an absolute rotor-position signal.">
          Hall sensors
        </Term>{' '}
        on the stator provide rotor position; some controllers infer position from the unenergised
        phase's back-EMF instead, a technique called{' '}
        <Term def="Determining rotor position by measuring the back-EMF of the unenergised phase, rather than using a dedicated rotor-position sensor. Cheaper, but fails at very low speeds where back-EMF is too small.">
          sensorless commutation
        </Term>
        .
      </p>

      <BLDCCommutationDemo />

      <p className="mb-prose-3">
        The full-fat version is called the{' '}
        <Term def="Permanent-Magnet Synchronous Machine. Like a BLDC but driven with smooth sinusoidal currents (not the 6-step trapezoidal pulses) for lower torque ripple. The motor in every modern EV traction drive.">
          PMSM
        </Term>
        (permanent-magnet synchronous machine). Drive the three phases with smooth sinusoidal
        currents 120° apart in phase instead of the trapezoidal 6-step pulses, do{' '}
        <Term def="A coordinate transform (Park / Clarke) that converts three-phase stator currents into a 2-axis rotor-aligned frame, then runs PI loops on the d/q components to control torque and flux independently. The control method of choice for modern PMSM drives.">
          field-oriented control
        </Term>{' '}
        on the rotor-aligned current components, and you get an essentially ripple-free torque from
        zero speed up through the field-weakening region. Every modern EV traction motor — Tesla
        after 2017, all the European and Korean EVs — is a PMSM
        <Cite id="krishnan-2010-bldc" in={SOURCES} />.
      </p>

      <p className="mb-prose-3">
        Field-oriented control deserves a closer look, because it is the single algorithmic trick
        that turns three wiggling AC phases into the two clean control knobs an engineer wants. Two
        coordinate transforms — Clarke (3-phase to a stationary 2-axis frame) and Park (2-axis
        stationary to 2-axis rotor-aligned) — convert the three stator currents into an{' '}
        <InlineMath tex="i_d" /> component aligned with the rotor's flux axis and an
        <InlineMath tex="i_q" /> component perpendicular to it. Torque is proportional to{' '}
        <InlineMath tex="i_q" /> alone (for a surface PMSM with <InlineMath tex="i_d" /> held at
        zero), so a single PI loop on <InlineMath tex="i_q" />
        gives smooth torque control identical to a brushed DC motor — but with no brushes
        <Cite id="krishnan-2010-bldc" in={SOURCES} />.
      </p>

      <FieldOrientedControlDemo />

      <TryIt
        tag="Try 16.3"
        question={
          <>
            A BLDC motor has 4 pole-pairs. The electrical commutation runs at{' '}
            <strong className="text-text font-medium">200 Hz</strong>. What is the mechanical RPM?
          </>
        }
        hint={
          <>
            One mechanical revolution per pole-pair set of electrical cycles. So{' '}
            <InlineMath tex="f_{\text{mech}} = f_{\text{elec}} / p_{\text{pairs}}" />.
          </>
        }
        answer={
          <>
            <Formula tex="f_{\text{mech}} = f_{\text{elec}} / p_{\text{pairs}} = 200 / 4 = 50\ \text{Hz}" />
            <Formula tex="\text{RPM} = 60 \cdot f_{\text{mech}} = 3000\ \text{rpm}" />
            <p className="mb-prose-1 last:mb-0">
              That's a typical e-bike hub motor speed. A 14-pole-pair drone motor at the same
              electrical 200 Hz would only spin at about 850 rpm — high pole count buys you torque
              at the price of speed
              <Cite id="krishnan-2010-bldc" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2 className="chapter-h2">The induction motor — Tesla 1888</h2>

      <p className="mb-prose-3">
        Now eliminate the connection to the rotor entirely. No brushes, no permanent magnets, no
        slip rings — just a steel rotor with a cage of shorted copper or aluminium bars embedded
        near its surface. This is the
        <em className="text-text italic">
          {' '}
          <Term def="An AC motor in which the rotor is a passive shorted cage (no external connection). Currents are induced in the rotor by the rotating stator field; those currents react with the field to produce torque. Tesla 1888.">
            induction motor
          </Term>
        </em>
        , patented by Nikola Tesla in 1888 and arguably the single most important machine of the
        twentieth century
        <Cite id="tesla-1888" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        Three-phase stator currents — three coils 120° apart in space, fed three sinusoidal currents
        120° apart in time — produce a magnetic field that rotates around the bore at the
        <em className="text-text italic">
          {' '}
          <Term def="The speed at which the rotating magnetic field produced by a polyphase stator turns. n_s = 120 f / p RPM, where f is line frequency and p the pole count. At 60 Hz a 2-pole machine has n_s = 3600 rpm.">
            synchronous speed
          </Term>
        </em>
        :
      </p>
      <Formula tex="n_s = 120\, f / p \quad (\text{RPM})" />
      <p className="mb-prose-3">
        where{' '}
        <strong className="text-text font-medium">
          n<sub>s</sub>
        </strong>{' '}
        is the synchronous (stator-field) rotational speed in revolutions per minute,{' '}
        <strong className="text-text font-medium">f</strong> is the AC line frequency (in Hz), and
        <strong className="text-text font-medium"> p</strong> is the total pole count of the machine
        (a dimensionless even integer: 2, 4, 6, …). The factor of 120 packages the 60 s/min
        conversion with the two-poles-per-pole-pair convention. At 60 Hz a 4-pole machine spins its
        stator field at 1800 RPM; an 8-pole machine at 900 RPM. The rotor, sitting inside this
        rotating field, sees a time-varying flux through every bar of its cage. By Faraday's law
        each bar develops an EMF; because the cage is shorted, large currents flow in the bars;
        those currents in the bars sit inside the stator field; the bars feel{' '}
        <InlineMath id="force-on-wire" />; and the rotor begins to spin in the same direction as the
        field
        <Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />.
      </p>

      <RotatingMagField3DDemo />

      <p className="mb-prose-3">
        It is worth pausing on the algebraic miracle that makes the three-phase trick work. Each
        coil's contribution to the field at the bore centre is its instantaneous current times a
        unit vector pointing along its own radial axis. Sum the three contributions for the standard
        sequence
        <InlineMath tex="I_x(t) = I_0 \cos(\omega t + \varphi_x)" /> with{' '}
        <InlineMath tex="\varphi = 0,\ -120°,\ -240°" />, and the three time-varying scalars combine
        with the three fixed spatial vectors to give a single vector
        <InlineMath tex="\vec{B}(t)" /> of constant magnitude <InlineMath tex="(3/2)\, B_0" />{' '}
        rotating about the bore axis at angular speed <InlineMath tex="\omega" />. Constant
        magnitude — no pulsation. Pure rotation. That is the property Tesla discovered in 1888 and
        the reason three is the smallest phase count that builds a usable induction or synchronous
        machine
        <Cite id="tesla-1888" in={SOURCES} />.
      </p>

      <InductionMotorSlipDemo />

      <p className="mb-prose-3">
        Here is the subtle point. If the rotor ever caught up exactly to synchronous speed, the
        relative motion of bar through field would drop to zero, the induced EMF would vanish, the
        bar currents would die, the torque would collapse, and the rotor would coast. So the rotor{' '}
        <em className="text-text italic">can never reach</em> synchronous speed under load — it
        always slips behind. The fractional difference is the{' '}
        <em className="text-text italic">
          <Term def="The fractional difference between synchronous speed and actual rotor speed: s = (n_s − n)/n_s. At full rated load, a typical induction motor runs at s ≈ 2–5%. Slip is the signal that produces torque.">
            slip
          </Term>
        </em>
        :
      </p>
      <Formula tex="s = (n_s - n) / n_s" />
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">s</strong> is the dimensionless slip (a pure
        ratio, often quoted as a percentage),{' '}
        <strong className="text-text font-medium">
          n<sub>s</sub>
        </strong>{' '}
        is the synchronous speed of the rotating stator field (in RPM, from the formula above), and{' '}
        <strong className="text-text font-medium">n</strong> is the actual mechanical rotation speed
        of the rotor (in RPM).
      </p>
      <p className="mb-prose-3">
        Typical full-load slip is 2–5 %. At no load, slip drops toward 0.1 % (just enough to
        overcome bearing friction and windage). Load it up and slip rises; the bar EMF rises with
        it; the bar currents rise; the torque rises. The machine self-regulates. There is no
        controller, no rotor-position sensor, no feedback loop — the slip itself{' '}
        <em className="text-text italic">is</em> the feedback. Plug it directly into the grid,
        mechanically couple it to a load, and it starts. This is why three-quarters of all
        industrial motor-load on the global grid is induction machinery
        <Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />.
      </p>

      <Pullout>
        The induction motor doesn't need to know the position of its own rotor. The slip tells it.
      </Pullout>

      <TryIt
        tag="Try 16.4"
        question={
          <>
            A 4-pole induction motor runs from a 60 Hz line and turns at{' '}
            <strong className="text-text font-medium">1740 RPM</strong> under load. What is the
            slip?
          </>
        }
        hint={
          <>
            Compute synchronous speed first: <InlineMath tex="n_s = 120\, f / p" />.
          </>
        }
        answer={
          <>
            <Formula tex="n_s = 120 \cdot 60 / 4 = 1800\ \text{RPM}" />
            <Formula tex="s = (1800 - 1740) / 1800 = 3.33\%" />
            <p className="mb-prose-1 last:mb-0">
              Right in the middle of the typical full-load range. A 1.5 % slip would mean the motor
              is only lightly loaded; 6 % would mean it's at or near rated full load
              <Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />.
            </p>
          </>
        }
      />

      <TryIt
        tag="Try 16.5"
        question={
          <>
            A 4-pole 60 Hz induction motor runs at{' '}
            <strong className="text-text font-medium">4 %</strong> slip at rated load. What is the
            rotor RPM?
          </>
        }
        hint={
          <>
            <InlineMath tex="n_s = 120\, f / p" />, then <InlineMath tex="n = n_s \cdot (1 - s)" />.
          </>
        }
        answer={
          <>
            <Formula tex="n_s = 120 \cdot 60 / 4 = 1800\ \text{RPM}" />
            <Formula tex="n = n_s \cdot (1 - s) = 1800 \cdot 0.96 = 1728\ \text{RPM}" />
            <p className="mb-prose-1 last:mb-0">
              That 72 RPM gap below synchronous is what produces the torque: the cage bars slip
              through the rotating field at <InlineMath tex="s \cdot n_s" />, and the resulting
              induced bar currents react with the field to pull the rotor along
              <Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2 className="chapter-h2">Synchronous and stepper motors</h2>

      <p className="mb-prose-3">
        Two more variants round out the family. The{' '}
        <Term def="An AC motor whose rotor turns exactly at the line-synchronous speed n_s = 120 f / p. Achieves zero slip by giving the rotor its own magnetic field (DC excitation or permanent magnets). Used where precision speed matters.">
          synchronous motor
        </Term>{' '}
        looks like an induction motor from the outside but the rotor has its own field — a DC-fed
        wound rotor or a set of permanent magnets. The rotor's own field locks onto the rotating
        stator field and follows it at exactly synchronous speed, with no slip. Torque comes from a
        small lag angle <InlineMath tex="\delta" /> between the rotor and stator-field positions;{' '}
        <InlineMath tex="\tau \propto \sin\delta" />. Past <InlineMath tex="\delta = 90°" /> the
        rotor "pulls out of step" — slips a pole — and the machine stalls
        <Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />.
      </p>

      <SynchronousMotorDemo />

      <p className="mb-prose-3">
        Synchronous motors are where you need precise speed: the spindle in a hard drive, the
        platter in a vinyl turntable, the rolling mill in a steel plant, the propeller shaft in an
        icebreaker. A clock running on a synchronous motor keeps grid time to within a part in 10⁷
        because the grid frequency itself is regulated that precisely. The trade-off is that a
        synchronous motor doesn't start on its own — it has to be brought up to near-synchronous
        speed by some other means (a starting cage, a variable-frequency drive, or a small pony
        motor) before the rotor can lock onto the field.
      </p>
      <p className="mb-prose-3">
        The other branch is the{' '}
        <Term def="A motor that advances its rotor by a fixed angular increment per input pulse — typically 1.8° for a 200-step hybrid. Used for open-loop positioning in 3D printers, CNC tables, and dome telescopes.">
          stepper motor
        </Term>
        . Geometrically it's a many-pole synchronous machine — a 200-step hybrid has 50 rotor teeth
        and 4-phase commutation, giving 1.8° per step. The controller pulses each phase in sequence;
        each pulse pulls the rotor's nearest tooth to align with the energized stator pole. Position
        is the integral of the pulse count. No feedback needed.{' '}
        <Term def="A drive technique that subdivides each full step into many smaller positions by varying the relative current in two adjacent phases. A 200-step stepper at 1/256 microstepping has 51 200 effective positions per revolution.">
          Microstepping
        </Term>{' '}
        drives the two adjacent phases with sinusoidally varying currents, smoothing the motion and
        subdividing each step by factors of 16 to 256.
      </p>

      <StepperMotorDemo />

      <TryIt
        tag="Try 16.6"
        question={
          <>
            A NEMA-17 stepper has 200 steps per revolution. You drive it at{' '}
            <strong className="text-text font-medium">1/16 microstepping</strong>, and your
            controller sends <strong className="text-text font-medium">3200</strong> pulses. How far
            does the shaft rotate?
          </>
        }
        hint="3200 microsteps / 16 microsteps per step = 200 full steps. 200 full steps = one full revolution at this resolution."
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">
              At 1/16 microstepping there are 200 × 16 = 3200 microsteps per revolution.
            </p>
            <Formula tex="\theta = 3200\ \text{microsteps} \times (360°/3200) = 360° = 1\ \text{revolution}" />
            <p className="mb-prose-1 last:mb-0">
              Or equivalently 0.1125° per microstep. A 3D printer driving its X-axis through a
              20-tooth GT2 pulley (2 mm pitch) moves 40 mm per revolution, so each microstep is 40 /
              3200 = 12.5 µm of head travel
              <Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2 className="chapter-h2">Torque, speed, and matching to a load</h2>

      <p className="mb-prose-3">
        A motor's headline rating is its <em className="text-text italic">torque-speed curve</em>:
        how much torque it produces as a function of how fast the shaft is turning. Each motor
        family has a distinctive shape, and an engineer picks a motor by finding the curve whose
        intersection with the load's mechanical impedance lies at the operating point they want.
      </p>

      <TorqueSpeedCurveDemo />

      <p className="mb-prose-3">
        The DC brushed motor has a roughly linear curve: maximum torque at stall (zero speed, full
        current), torque falling linearly to zero at the no-load speed where back-EMF nearly equals
        supply voltage. The induction motor has a quasi-flat region just below synchronous speed,
        then a sharply peaked
        <em className="text-text italic"> pull-out torque</em> at ~10–15 % slip, then a steep
        collapse below that. The synchronous motor has a vertical line at <InlineMath tex="n_s" />:
        speed is fixed by line frequency until torque exceeds the pull-out value, at which point the
        machine stalls instantly. The stepper has a roughly flat low-speed region followed by a
        sharp drop above the <em className="text-text italic">pull-out frequency</em>
        <Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        Pumping water through a hydraulic load (torque <InlineMath tex="\propto \omega^2" />, the
        fan-law curve) wants a different motor than driving a positive-displacement compressor
        (constant torque vs <InlineMath tex="\omega" />
        ). Hoisting a constant weight wants different again. The motor is chosen — and often the
        gearing too — to put the steady-state intersection of motor curve and load curve at the
        design operating point.
      </p>

      <p className="mb-prose-3">
        Choosing the curve is only half the job; the other half is choosing the{' '}
        <em className="text-text italic">operating point on it</em>. A motor is not equally
        efficient everywhere on its torque–speed plane. Copper losses scale as{' '}
        <InlineMath tex="I^2 R" /> — and therefore as torque squared. Iron losses (eddy + hysteresis
        in the laminations) scale roughly with frequency to the 1.5 power. Bearing and windage
        losses scale with speed. The combination produces a "sweet spot" of peak efficiency near
        rated torque and rated speed, with efficiency falling off at low loads (where the
        speed-dependent losses dominate the small useful output) and at high speeds (where iron and
        PM eddy losses run away). A premium PMSM peaks near 96 % efficiency; a good induction motor
        near 93 %; a brushed DC motor rarely above 85 %
        <Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />.
      </p>

      <MotorEfficiencyMapDemo />

      <p className="mb-prose-3">
        For an EV, the practical consequence is that the gearbox ratio is chosen to put the motor's
        operating point inside its bright sweet spot for the typical cruise condition. A
        single-speed reduction (about 9:1 in a Tesla Model 3) is enough because the PMSM's sweet
        spot is broad and the inverter can field-weaken to extend constant-power operation toward
        top speed. Industrial inverter-driven pumps and fans get the same benefit:
        variable-frequency operation keeps the motor near rated torque at every speed the
        application demands
        <Cite id="krishnan-2010-bldc" in={SOURCES} />.
      </p>

      <TryIt
        tag="Try 16.7"
        question={
          <>
            A brushed DC motor has stall torque{' '}
            <strong className="text-text font-medium">0.8 N·m</strong> and no-load speed{' '}
            <strong className="text-text font-medium">4000 rpm</strong>. Assuming a linear curve,
            what torque does it produce at{' '}
            <strong className="text-text font-medium">2000 rpm</strong>?
          </>
        }
        hint="Linear interpolation between stall and no-load. At half no-load speed, what fraction of stall torque?"
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">
              The curve is <InlineMath tex="\tau(n) = \tau_{\text{stall}}\, (1 - n/n_0)" />. At n =
              2000 rpm with <InlineMath tex="n_0 = 4000\ \text{rpm}" />:
            </p>
            <Formula tex="\tau = 0.8 \cdot (1 - 2000/4000) = 0.8 \cdot 0.5 = 0.4\ \text{N·m}" />
            <p className="mb-prose-1 last:mb-0">
              Maximum mechanical power is reached at exactly half the no-load speed (the curve's
              midpoint), which is a property of every linear torque–speed characteristic
              <Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2 className="chapter-h2">What we have so far</h2>

      <p className="mb-prose-3">
        Force on a current-carrying wire in a magnetic field gives torque on a coil. Brushes
        mechanically reverse the coil current every half-turn so the torque always pushes forward —
        that's the brushed DC motor. Move the magnets to the rotor and put the commutation in
        silicon: the brushless DC and PMSM. Replace the rotor's magnets with a passive shorted cage,
        drive three stator phases 120° apart, let the rotating field induce currents in the cage:
        the Tesla induction motor, which self-regulates via slip and powers most of industry. Give
        the rotor its own DC field and it locks to synchronous speed for precise control; cut the
        rotor into many fine teeth and pulse the phases, and you have a stepper, where position is
        the integral of pulse count. Same underlying physics —{' '}
        <InlineMath tex="\tau = NIAB \sin\theta" /> — six different ways to keep that{' '}
        <em className="text-text italic">sin</em> from going the wrong way.
      </p>
      <p className="mb-prose-3">
        Next chapter: spin one of these machines mechanically instead of electrically, and you get a
        generator. The rest of the global power infrastructure is built on the inverse of this
        chapter.
      </p>

      <CaseStudies
        intro={
          <>
            Four motors in working systems, from a 310 kW EV traction motor down to a 3 W hard-drive
            spindle.
          </>
        }
      >
        <CaseStudy
          tag="Case 16.1"
          title="EV traction motor (Tesla Model S rear)"
          summary="A 3-phase AC induction motor with copper rotor bars; ~310 kW peak, ~16 000 rpm max, 0.94 efficiency at cruise."
          specs={[
            {
              label: 'Topology',
              value: (
                <>
                  3-phase squirrel-cage induction{' '}
                  <Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />
                </>
              ),
            },
            { label: 'Peak output', value: <>~310 kW (rear motor)</> },
            {
              label: 'Maximum speed',
              value: (
                <>
                  ~16 000 rpm at full battery voltage{' '}
                  <Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />
                </>
              ),
            },
            {
              label: 'Cooling',
              value: <>liquid (ethylene-glycol jacket around the stator iron)</>,
            },
            {
              label: 'Drive',
              value: (
                <>
                  variable-frequency inverter, field-oriented control{' '}
                  <Cite id="krishnan-2010-bldc" in={SOURCES} />
                </>
              ),
            },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            The original Tesla Model S (2012 onward) used a 3-phase AC induction motor with a
            copper-bar rotor cage, scaled up to provide the peak output that defined the early
            EV-performance era. The choice of induction over PMSM was practical: induction avoids
            any neodymium-iron-boron content (eliminating exposure to rare-earth supply chains),
            provides better behaviour at very high speeds (no permanent-magnet field-weakening
            requirement), and tolerates moderate rotor heating well. Tesla switched to PMSM machines
            starting with the Model 3 in 2017 for lower-power, higher-efficiency cruise operation;
            the higher-output trims still pair a PMSM front motor with an induction rear motor
            <Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            The drive is a 3-phase inverter generating variable-frequency, variable-amplitude PWM,
            controlled by a field-oriented control loop running at ~10 kHz. At any operating point,
            the controller measures rotor position (or estimates it from back-EMF), transforms the
            three-phase stator currents into the rotor-aligned
            <InlineMath tex="d\text{-}q" /> frame, and runs PI loops on the d-axis (flux) and q-axis
            (torque) components independently. That decoupling is what lets the same machine deliver
            flat torque from zero rpm up through the field- weakening region near top speed
            <Cite id="krishnan-2010-bldc" in={SOURCES} />.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 16.2"
          title="HDD spindle motor"
          summary="A BLDC at 7200 rpm spins three platters in a sealed helium-filled enclosure. ~3 W of electrical input keeps the read/write heads flying."
          specs={[
            {
              label: 'Topology',
              value: (
                <>
                  3-phase BLDC, sensorless back-EMF commutation{' '}
                  <Cite id="krishnan-2010-bldc" in={SOURCES} />
                </>
              ),
            },
            { label: 'Speed', value: <>5400, 7200, 10 000, or 15 000 rpm (datasheet-fixed)</> },
            {
              label: 'Speed regulation',
              value: <>±0.1 % of nominal — controlled by a PLL locking to a quartz reference</>,
            },
            { label: 'Power', value: <>~2–3 W steady-state at 7200 rpm</> },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            Every spinning hard drive built since the late 1990s uses a 3-phase brushless DC motor
            as the spindle. The three stator coils are formed into a thin disc that sits flat under
            the platter stack; the rotor is a ring of permanent magnets glued to the inside of the
            rotating hub. The controller IC drives the three phases with trapezoidal currents and
            infers rotor position by sensing the back-EMF on the unenergised phase — true sensorless
            commutation, because adding Hall sensors would consume space that the platter assembly
            needs
            <Cite id="krishnan-2010-bldc" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            Speed regulation is via a phase-locked loop against the drive's quartz oscillator: a
            7200 rpm spindle holds 120.000 ± 0.12 Hz of rotational frequency, indefinitely. That
            precision is necessary because the read-channel signal processing depends on the
            bit-cell timing being constant; jitter in spindle speed shows up directly as media-noise
            margin. Sealed helium-filled drives (where the lower viscosity reduces windage losses
            and platter flutter) extend the practical platter count from five to nine while keeping
            the same ~3 W motor power
            <Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 16.3"
          title="The brushed motor in an 18 V cordless drill"
          summary="A two-pole brushed DC motor with a 7-segment commutator, fed PWM from the battery; speed scales with duty cycle."
          specs={[
            {
              label: 'Topology',
              value: (
                <>
                  2-pole permanent-magnet stator, 7-segment commutator{' '}
                  <Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />
                </>
              ),
            },
            { label: 'Supply', value: <>18 V or 20 V Li-ion battery</> },
            { label: 'Peak power', value: <>~600 W (drilling stall)</> },
            {
              label: 'Speed control',
              value: <>variable-duty PWM via trigger (FET in series with motor)</>,
            },
            { label: 'Brush life', value: <>~150–300 hours of cumulative running time</> },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            The classic brushed motor still dominates handheld power tools at the budget tier. The
            cost calculus is stark: a 600 W brushed motor with PWM control comes in for $5–8 in
            parts, while a brushless equivalent with its 3-phase inverter and Hall sensors costs
            $25–40. The brushed version trades that against shorter brush life, more EMI, and a few
            percent lower efficiency. For a drill that sees a few hours of duty per week, that's an
            acceptable trade. Premium tool lines (and any high-duty industrial tool) have moved to
            brushless because the lifetime cost flips at maybe 400 hours of cumulative running
            <Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            Speed control is dead simple. A power MOSFET in series with the motor is gated by a
            10–20 kHz PWM signal whose duty cycle is set by the trigger position. At 50 % duty, the
            average voltage across the motor is ~9 V; the rotor's mechanical inertia time-constant
            is hundreds of milliseconds, vastly longer than the switching period, so the motor
            responds as if it were running on 9 V DC. The brushed-DC torque-speed characteristic is
            linear in V, so duty cycle linearly maps to no-load speed
            <Cite id="krishnan-2010-bldc" in={SOURCES} />.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 16.4"
          title="NEMA-17 stepper in a 3D printer"
          summary="A 200-step hybrid driven at 1/16 microstepping gives 3200 microsteps/rev. On a 40 mm/rev belt drive, that's 12.5 µm of head travel per microstep."
          specs={[
            {
              label: 'Topology',
              value: (
                <>
                  2-phase hybrid PM-rotor stepper, 50 rotor teeth{' '}
                  <Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />
                </>
              ),
            },
            { label: 'Step angle', value: <>1.8° (200 steps/rev)</> },
            {
              label: 'Microstepping',
              value: <>typically 1/16 or 1/32 in driver IC (TMC2209, A4988, etc.)</>,
            },
            { label: 'Holding torque', value: <>~0.4–0.6 N·m typical NEMA-17 size</> },
            {
              label: 'Driver',
              value: <>chopper-mode constant-current driver; rated 1.5–2 A per phase</>,
            },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            A NEMA-17 (1.7 in × 1.7 in front face) stepper is the canonical 3D-printer axis motor.
            The standard part is a 200-step hybrid: a permanent-magnet rotor with 50 teeth on each
            of two end-discs, offset by half a tooth pitch, surrounded by an 8-pole stator with two
            phases. Energise phase A and the rotor settles to the nearest A-aligned tooth position;
            switch to phase B and it advances 1.8°; phase ¬A, another 1.8°; and so on through the
            4-step cycle. A full electrical cycle (4 steps) moves the rotor exactly one tooth pitch
            (200/50 = 4 steps per tooth)
            <Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            Microstepping subdivides each full step. At 1/16 microstepping the driver feeds the two
            phases sinusoidal currents 90° apart in electrical phase, with their relative amplitude
            stepped through 16 finely-spaced ratios per full-step interval. The rotor then settles
            at intermediate angles whose precision is limited by detent torque (residual reluctance
            variation) rather than by driver resolution. On a 3D printer's belt- driven X-axis
            (20-tooth GT2 pulley, 2 mm pitch = 40 mm/rev), 1/16 microstepping gives 12.5 µm of
            resolution — comfortably finer than the 0.4 mm nozzle and the 0.2 mm layer height, with
            margin for printer-frame flex
            <Cite id="krishnan-2010-bldc" in={SOURCES} />.
          </p>
        </CaseStudy>
      </CaseStudies>

      <FAQ intro="Loose threads — the questions a careful reader tends to surface after going through this chapter.">
        <FAQItem q="If τ = NIAB sin(θ) is the same formula for every motor, why are there so many different motor designs?">
          <p>
            Because the formula doesn't tell you how to keep <InlineMath tex="\sin\theta" /> in the
            part of its range where the torque is positive and useful. Every motor family is a
            different answer to that question. Brushed DC uses a mechanical commutator. BLDC and
            PMSM use electronic commutation against rotor-position feedback. Induction uses a
            rotating stator field with no rotor-side connection, and accepts slip as the price.
            Synchronous locks the rotor's own field to the stator field. Stepper indexes through
            discrete commutated positions on command. Same one-line physics, six different
            commutation strategies
            <Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why do brushes wear out, and what determines their lifetime?">
          <p>
            Two parallel mechanisms. Mechanical: graphite-on-copper sliding contact abrades the
            brush at a rate that depends on contact pressure, slip speed, and lubrication (the
            graphite needs a few-monolayer film of adsorbed moisture or hydrocarbon to slide
            cleanly; in dry or vacuum environments it can fail in hours instead of hundreds of
            hours). Electrical: each commutator-segment transition breaks a small inductive circuit,
            producing an arc that erodes both brush and commutator surface. Premium tools fit harder
            metal-graphite or carbon-copper composite brushes and dampen arcing with snubber
            capacitors across the brush leads
            <Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What is back-EMF, and why does it matter?">
          <p>
            A motor is also a generator. As the rotor spins it produces a voltage proportional to
            its speed:
            <InlineMath tex="E_{\text{back}} = K_e\, \omega" />. This back-EMF opposes the supply
            voltage, so the net voltage across the winding resistance is{' '}
            <InlineMath tex="V - E_{\text{back}}" />, and the current is
            <InlineMath tex="I = (V - E_{\text{back}})/R" />. At stall,{' '}
            <InlineMath tex="E_{\text{back}} = 0" /> and <InlineMath tex="I = V/R" /> is large —
            that's why a stalled motor pulls a huge current. As the rotor accelerates, back-EMF
            rises, current falls, and the steady-state speed is the one at which the residual{' '}
            <InlineMath tex="(V - E_{\text{back}})/R" /> current produces just enough torque to
            balance load and losses
            <Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why do induction motors specifically need three phases, and why not two or four?">
          <p>
            Three is the minimum number of phases that produces a steadily rotating field with
            constant magnitude in both two-dimensional axes — a key property for smooth torque.
            Tesla's original 1888 patent actually used two phases 90° apart, which works but
            requires four wires (no current cancellation) and gives a slightly pulsating field.
            Three-phase systems have the mathematically clean property that{' '}
            <InlineMath tex="\cos(\omega t) + \cos(\omega t - 120°) + \cos(\omega t - 240°) = 0" />{' '}
            at every instant, so three wires carry all the power with no neutral return current.
            Higher phase counts (6, 9, 12) appear in specialty high-power drives but offer
            diminishing returns past three
            <Cite id="tesla-1888" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What's a 'pole pair' and why does it appear in the speed formula?">
          <p>
            A pole pair is one north–south set of magnetic poles arranged around the rotor. A 2-pole
            machine has one pole pair (one N and one S, on opposite sides); a 4-pole has two pairs
            alternating around the circumference; an 8-pole has four. For the stator field to make
            one complete spatial revolution around the bore, the electrical phase has to advance
            through <InlineMath tex="p/2" /> full cycles, so the mechanical synchronous speed in RPM
            is <InlineMath tex="120\, f / p" />. Higher pole count means slower rotation for the
            same line frequency, traded against larger physical size for a given output torque
            <Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why can't a synchronous motor start by itself when plugged into the grid?">
          <p>
            Because at rest, the stator field is rotating at the full synchronous speed (1800 RPM
            for a 4-pole machine at 60 Hz) while the rotor is stationary. The rotor's own magnetic
            field gets pushed alternately one way then the other at 60 Hz — net torque averages to
            zero. The rotor never gets a chance to accelerate in the same direction as the stator
            field. Industrial synchronous motors solve this by including a starting cage
            (effectively an induction-motor cage embedded in the rotor pole faces), which
            accelerates the rotor up to near-synchronous speed; then the DC field is energised and
            the rotor pulls into lock. Modern installations often skip the cage and use a
            variable-frequency drive to ramp up from zero
            <Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why is microstepping not the same as a true higher-resolution motor?">
          <p>
            Microstepping subdivides the angular position between full steps by varying the relative
            current in two adjacent phases. In principle, 1/256 microstepping gives 51 200
            positions/rev on a 200-step motor. In practice, the rotor's position at each microstep
            is held there by torque proportional to its angular offset from the nominal microstep
            position — and that holding torque collapses to a fraction of full-step torque between
            detent positions. The advertised micro-resolution is real for smoothness (the motor
            moves more sinusoidally and emits less acoustic noise), but the positional accuracy is
            limited by detent torque and load to roughly 1/16 of a full step in most practical
            setups
            <Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why is the induction motor sometimes called 'the most important machine of the 20th century'?">
          <p>
            Because three-quarters of industrial electric energy globally is consumed by induction
            motors — pumps, fans, compressors, conveyors, elevators, machine tools. They're rugged
            (no brushes, no sliding electrical contacts), self-starting and self-regulating from a
            fixed-frequency grid, scale from 100 W to 10 MW in essentially the same topology, and
            are cheap to build because the rotor is a single piece of cast aluminium. Without
            Tesla's 1888 invention of the polyphase induction motor, the entire AC-power
            distribution architecture that won the "war of the currents" against Edison's DC system
            would have lacked its killer industrial application
            <Cite id="tesla-1888" in={SOURCES} />
            <Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why do EVs use 3-phase AC motors instead of DC motors?">
          <p>
            Early EVs (GM EV1, 1996; Toyota RAV4 EV, 1997) actually did use DC motors. Modern EVs
            moved to 3-phase AC (PMSM or induction) for three reasons. First, they're brushless —
            critical for the 100 000+ km lifetime requirement. Second, they integrate cleanly with
            the inverter architecture that the battery already needs anyway (a battery feeds a
            3-phase inverter that drives a 3-phase motor). Third, the field-oriented control scheme
            that runs on top of a 3-phase inverter gives precise torque control across the full
            speed range, including regenerative braking down to zero speed — something a brushed DC
            motor handles much less gracefully
            <Cite id="krishnan-2010-bldc" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What is field-oriented control and why is it the standard for PMSM/induction drives?">
          <p>
            Field-oriented control (FOC), also called vector control, is a coordinate-transform
            trick from the 1970s that converts the three-phase stator currents into a 2-axis
            rotating frame aligned with the rotor's flux. In that frame, the torque-producing
            current and the flux-producing current decouple — you can control them with two
            independent PI loops, exactly as if the machine were a brushed DC motor. The result is
            ripple-free smooth torque from zero speed up through field-weakening, plus efficient
            operation across the full envelope. Every modern EV traction drive, every CNC
            servomotor, and most industrial variable-frequency drives over a few hundred watts run
            FOC
            <Cite id="krishnan-2010-bldc" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why don't induction motors use permanent magnets like BLDC/PMSM do?">
          <p>
            They could — and that's what a PMSM is. The induction motor's rotor is deliberately
            passive: its currents are induced by the rotating stator field. The advantages are that
            you don't need any rare-earth content (no neodymium-iron-boron supply chain), the rotor
            tolerates very high temperatures (PM motors can irreversibly demagnetise above ~150 °C),
            and the construction is essentially indestructible (a single piece of cast aluminium
            plus a stack of laminated steel). The disadvantage is slightly lower efficiency, because
            some of the energy that flows across the air gap is dissipated in{' '}
            <InlineMath tex="I^2 R" /> losses in the rotor bars. For very large machines (over 100
            kW) the efficiency gap is small enough that induction usually wins on ruggedness and
            cost
            <Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why are stepper motors so loud at certain speeds?">
          <p>
            Mid-band resonance. A stepper's rotor sits at each microstep in a potential well that
            behaves like a torsional spring. Combine that spring with the rotor's rotational inertia
            and you get a mechanical resonance — typically in the 100–300 Hz range — that, when
            excited by step pulses at a matching rate, produces an audible whine and even physical
            loss of steps. Modern stepper drivers (TMC2209, TMC5160) implement{' '}
            <em className="text-text italic">StealthChop</em> and{' '}
            <em className="text-text italic">SpreadCycle</em> chopper modes that damp this resonance
            and shape the phase currents to keep emitted acoustic noise below the human hearing
            threshold for typical 3D-printer duty
            <Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Is a fan an induction motor?">
          <p>
            A ceiling fan or a desk fan typically is, yes — usually a single-phase induction motor
            with a starting capacitor that creates an artificial second phase to give the rotating
            field the necessary asymmetry to self-start. Computer cooling fans, on the other hand,
            are almost always small 3-phase BLDCs running off 12 V DC, with a built-in commutation
            IC, because PC chassis don't have a 60 Hz mains connection available and BLDC scales
            gracefully down to single-digit watts. Bathroom exhaust fans, range-hood blowers, and
            forced-air HVAC fans are usually capacitor-start induction; HVAC variable-speed blower
            upgrades replace those with brushless 3-phase electronically commutated motors (ECMs)
            for the efficiency gain
            <Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What is the difference between a BLDC and a PMSM?">
          <p>
            Construction-wise, none. Both have a permanent-magnet rotor inside a 3-phase stator. The
            distinction is in the drive waveform and the back-EMF profile. A BLDC has trapezoidal
            back-EMF and is driven with quasi-square-wave (6-step) currents — simple controller, but
            each commutation produces a 14 % torque ripple. A PMSM has sinusoidal back-EMF and is
            driven with smooth sinusoidal currents under field-oriented control — more complex
            controller, but essentially zero torque ripple. The terminology is partly historical;
            many machines straddle the boundary, and most modern drives can run either control mode
            on any 3-phase PM motor
            <Cite id="krishnan-2010-bldc" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why do high-performance motors use laminated iron in the stator?">
          <p>
            Because the stator iron sees a rotating (and therefore time-varying) magnetic field,
            which induces eddy currents in the iron itself by Faraday's law. Those eddy currents
            flow in closed loops in the cross-section of the iron and dissipate as{' '}
            <InlineMath tex="I^2 R" /> heat. Laminating the iron into thin sheets (typically
            0.35–0.5 mm thick), insulated from each other, breaks the eddy-current paths into
            smaller, higher-resistance loops, cutting the losses by roughly the square of the
            lamination thickness. Without lamination, a 1 kW stator would self-heat to destruction
            within seconds. The same trick is used in transformers, for the same reason
            <Cite id="griffiths-2017" in={SOURCES} />.
          </p>
        </FAQItem>
      </FAQ>
    </ChapterShell>
  );
}
