/**
 * Chapter 20 — Motors
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
import { Formula, M } from '@/components/Formula';
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

export default function Ch20Motors() {
  const chapter = getChapter('motors')!;
  const SOURCES = chapter.sources;

  return (
    <ChapterShell chapter={chapter}>
      <p className="chapter-intro">
        Pry open a small cordless drill and you find a brick of copper and steel about the size of a
        deck of cards. Apply battery DC across two contact strips and it converts electrical power
        into mechanical torque well enough to drive a screw into wood. There are no fluids inside,
        no combustion, no moving valves — just one rotating bit of iron wound with copper wire,
        stationary magnets, and a pair of carbon brushes. That brick is, in essence, the same kind
        of electromagnetic machine that turns EV wheels, CNC spindles, washing-machine drums, robot
        casters, and electric toothbrush heads.
      </p>
      <p className="mb-prose-3">
        This chapter is about how it works. The bottom line is a single equation we already met in
        the magnetism chapter: a current in a magnetic field feels a force, and a current loop in a
        field feels a torque. Wrap that into a rotating bundle and you get a motor. The challenge —
        and the entire reason there are half a dozen distinct motor families rather than just one —
        is what to do at the moment the loop has rotated 180° and the torque, left to itself, would
        reverse and oscillate forever. Brushes, electronic switches, three-phase fields, and tooth
        counts are five different answers to the same question.
      </p>

      <h2 className="chapter-h2">Force on a wire = torque on a coil</h2>

      <p className="mb-prose-3">
        The magnetism chapter wrote down the{' '}
        <Term
          def={
            <>
              The total electromagnetic force on a point charge: <M tex="F = q(E + v \times B)" />.
              For currents — many charges moving together — the magnetic piece becomes a force per
              length on the wire.
            </>
          }
        >
          Lorentz force
        </Term>
        on a moving charge: <M id="lorentz-force" />. A current is moving charge — many of them, at
        the same drift velocity. Sum the per-charge force over a length <M tex="L" /> of wire
        carrying current <M tex="I" /> in a uniform field <M tex="B" /> and the wire itself feels
        <Cite id="feynman-II-13" in={SOURCES} />:
      </p>
      <Formula size="lg" id="force-on-wire" />
      <p className="mb-prose-3">
        where <M tex="F" /> is the force on the wire segment (in newtons), <M tex="I" /> is the
        current flowing through it (in amperes), <M tex="L" /> is a vector along the wire of length
        equal to the segment (in metres) pointing in the direction of conventional current, and{' '}
        <M tex="B" /> is the magnetic field at the wire's location (in tesla).
      </p>
      <p className="mb-prose-3">
        Bend the wire into a closed rectangular loop of <M tex="N" /> turns and area <M tex="A" />,
        place it in <M tex="B" />, and the two long sides experience equal-and-opposite forces
        displaced from the loop's central axis. Those forces don't cancel — they form a couple. The
        resulting{' '}
        <Term def="The rotational analog of force. Torque about an axis is force times the perpendicular distance from the axis. SI unit: N·m.">
          torque
        </Term>{' '}
        on the loop is
        <Cite id="griffiths-2017" in={SOURCES} />:
      </p>
      <Formula tex="\tau = N I A B \sin\theta" />
      <p className="mb-prose-3">
        where <M tex="\tau" /> is the magnitude of the torque on the loop (in N·m), <M tex="N" /> is
        the number of turns in the coil (dimensionless integer), <M tex="I" /> is the current in the
        coil (in amperes), <M tex="A" /> is the area enclosed by one turn (in m²), <M tex="B" /> is
        the magnetic field magnitude (in tesla), and <M tex="\theta" /> is the angle between the
        loop's surface normal and the field (in radians). Maximum torque when the loop's plane is
        parallel to <M tex="B" /> (θ = 90°); zero when the plane is perpendicular (θ = 0). That
        single formula is every electric motor in one line. Everything that follows is engineering:
        how to keep θ in the region where <M tex="\sin(\theta)" /> is positive, so the torque drives
        the rotor forward instead of bouncing back and forth across one position.
      </p>

      <TryIt
        tag="Try 20.1"
        question={
          <>
            A rectangular coil has <M tex="N = 100" /> turns, area <M tex="A = 30\,\text{cm}^{2}" />
            , sits in a field of <M tex="B = 0.3\,\text{T}" />, and carries{' '}
            <M tex="I = 2\,\text{A}" />. What is the maximum torque?
          </>
        }
        hint={
          <>
            Use <M tex="\tau = N I A B \sin\theta" />, with <M tex="\sin\theta = 1" /> at maximum.
          </>
        }
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">
              Convert <M tex="A = 30\,\text{cm}^{2} = 3\times 10^{-3}\,\text{m}^{2}" />. Maximum
              torque is at <M tex="\sin\theta = 1" />:
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

      <BrushedDCMotorDemo figure="Fig. 20.1" />

      <h2 className="chapter-h2">The brushed DC motor</h2>

      <p className="mb-prose-3">
        The first practical motor solves the sign-of-sin(θ) problem mechanically. Take the
        single-loop machine above and connect each end of the coil to a half-ring of conductor on
        the rotating shaft — a two-segment{' '}
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
        in the coil. The trigonometry flips with it: <M tex="\sin(\theta)" /> reverses sign, the
        current reverses sign, the product stays positive. Net torque always drives the rotor
        forward
        <Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />.
      </p>

      <p className="mb-prose-3">
        That's the brushed DC motor in one paragraph. It runs directly off a DC supply, the rotor
        naturally spins up until its{' '}
        <Term
          def={
            <>
              The voltage a spinning motor produces as a generator. In a simple coil rotating in a
              field, <M tex="E = NBA\omega" />. Subtracts from the supply voltage; at rated speed it
              equals the supply minus an IR drop.
            </>
          }
        >
          back-EMF
        </Term>{' '}
        nearly equals the supply voltage, and the steady-state current is set by whatever residual
        the winding resistance absorbs. Cheap to build. Speed control by varying the duty cycle of a
        PWM switch. No special drive electronics required.
      </p>
      <p className="mb-prose-3">
        The brushes are also where it goes wrong. They are sliding electrical contacts, so they wear
        mechanically, arc during commutation, generate EMI, and demand maintenance. Dry, dusty, or
        low-pressure environments make that contact problem worse. Most modern applications that can
        tolerate the extra cost have moved on
        <Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />.
      </p>

      <p className="mb-prose-3">
        That back-EMF is worth a closer look, because it is the single equation governing how a
        brushed DC motor behaves between the moment you connect it and the moment it reaches a
        steady running speed. In a frozen rotor (<M tex="\omega = 0" />
        ), the back-EMF is zero, so the full supply voltage drops across the winding resistance and{' '}
        <M tex="I = V/R" /> — an inrush current several times the rated running value. As the rotor
        spins up, back-EMF rises in proportion to speed (
        <M tex="E_{\text{back}} = k_e\, \omega" />
        ), the net voltage across <M tex="R" />
        falls, and the current drops to whatever value is required to balance the load torque. The
        settling time is set by the mechanical inertia, not the electrical time constant: that is
        why inrush current is brief but ferocious
        <Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />.
      </p>

      <BackEMFInRunningMotorDemo figure="Fig. 20.2" />

      <TryIt
        tag="Try 20.2"
        question={
          <>
            A <M tex="12\,\text{V}" /> brushed DC motor has winding resistance{' '}
            <M tex="R = 1\,\Omega" /> and back-EMF constant <M tex="k_e = 0.1\,\text{V·s/rad}" />.
            What is the starting current at stall? What is the steady-state current at{' '}
            <M tex="\omega = 100\ \text{rad/s}" /> with negligible load?
          </>
        }
        hint={
          <>
            At stall <M tex="E_{\text{back}} = 0" /> so <M tex="I = V/R" />. At{' '}
            <M tex="\omega = 100\ \text{rad/s}" />, <M tex="E_{\text{back}} = k_e\, \omega" />, and{' '}
            <M tex="I = (V - E_{\text{back}})/R" />.
          </>
        }
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">
              At stall (<M tex="\omega = 0" />
              ):
            </p>
            <Formula tex="I_{\text{stall}} = V/R = 12/1 = 12\ \text{A}" />
            <p className="mb-prose-1 last:mb-0">
              At <M tex="\omega = 100\ \text{rad/s}" />:
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
        Invert the topology. Put the permanent magnets on the rotor — often sintered
        neodymium-iron-boron in high-performance machines — and put the windings on the outer
        stator. Now no current has to enter or leave the spinning part, so there's no mechanical
        commutator and no brushes. The price is that the commutation now has to be done{' '}
        <em className="text-text italic">electronically</em>: an external controller has to know
        roughly where the rotor is and energize the right pair of stator coils at the right time
        <Cite id="krishnan-2010-bldc" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        The simplest scheme — and the source of the name{' '}
        <em className="text-text italic">brushless DC</em> — uses three stator phases and a six-step
        commutation table. The controller drives one phase HIGH and one phase LOW (third phase
        floats) for 60° of rotation, then advances to the next pair. The stator field jumps 60°
        around the bore six times per electrical cycle, and the permanent-magnet rotor chases it
        with a fixed lead angle.{' '}
        <Term def="Hall-effect sensor: a semiconductor element whose output voltage tracks the magnetic field through it. Three of them spaced 120° around the rotor give the controller an absolute rotor-position signal.">
          Hall sensors
        </Term>{' '}
        on the stator provide rotor position; some controllers infer position from the unenergised
        phase's back-EMF instead, a technique called{' '}
        <Term def="Determining rotor position by measuring the back-EMF of the unenergised phase, rather than using a dedicated rotor-position sensor. Cheaper, but fails at very low speeds where back-EMF is too small.">
          sensorless commutation
        </Term>
        <Cite id="krishnan-2010-bldc" in={SOURCES} />.
      </p>

      <BLDCCommutationDemo figure="Fig. 20.3" />

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
        zero speed up through the field-weakening region. Most modern EV traction drives are PMSMs
        for this reason
        <Cite id="krishnan-2010-bldc" in={SOURCES} />.
      </p>

      <p className="mb-prose-3">
        Field-oriented control deserves a closer look, because it is the single algorithmic trick
        that turns three wiggling AC phases into the two clean control knobs an engineer wants. Two
        coordinate transforms — Clarke (3-phase to a stationary 2-axis frame) and Park (2-axis
        stationary to 2-axis rotor-aligned) — convert the three stator currents into an{' '}
        <M tex="i_d" /> component aligned with the rotor's flux axis and an <M tex="i_q" />{' '}
        component perpendicular to it. Torque is proportional to <M tex="i_q" /> alone (for a
        surface PMSM with <M tex="i_d" /> held at zero), so a single PI loop on <M tex="i_q" />
        gives smooth torque control identical to a brushed DC motor — but with no brushes
        <Cite id="krishnan-2010-bldc" in={SOURCES} />.
      </p>

      <FieldOrientedControlDemo figure="Fig. 20.4" />

      <TryIt
        tag="Try 20.3"
        question={
          <>
            A BLDC motor has 4 pole-pairs. The electrical commutation runs at{' '}
            <strong className="text-text font-medium">200 Hz</strong>. What is the mechanical RPM?
          </>
        }
        hint={
          <>
            One mechanical revolution per pole-pair set of electrical cycles. So{' '}
            <M tex="f_{\text{mech}} = f_{\text{elec}} / p_{\text{pairs}}" />.
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
        near its surface. This is the{' '}
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
        120° apart in time — produce a magnetic field that rotates around the bore at the{' '}
        <em className="text-text italic">
          {' '}
          <Term
            def={
              <>
                The speed at which the rotating magnetic field produced by a polyphase stator turns.
                In the conventional motor-engineering RPM form, <M tex="n_s = 120 f / p" />
                , where <M tex="f" /> is line frequency and <M tex="p" /> the pole count.
              </>
            }
          >
            synchronous speed
          </Term>
        </em>
        :
      </p>
      <Formula tex="n_s = 120\, f / p \quad (\text{RPM})" />
      <p className="mb-prose-3">
        where <M tex="n_s" /> is the synchronous (stator-field) rotational speed in revolutions per
        minute, <M tex="f" /> is the AC line frequency (in Hz), and <M tex="p" /> is the total pole
        count of the machine (a dimensionless even integer: 2, 4, 6, …). The factor of 120 packages
        the 60 s/min conversion with the two-poles-per-pole-pair convention; in SI angular units,{' '}
        <M tex="\omega_s = 4\pi f/p" /> rad/s. At 60 Hz a 4-pole machine spins its stator field at
        1800 RPM; an 8-pole machine at 900 RPM. The rotor, sitting inside this rotating field, sees
        a time-varying flux through every bar of its cage. By Faraday's law each bar develops an
        EMF; because the cage is shorted, large currents flow in the bars; those currents in the
        bars sit inside the stator field; the bars feel <M id="force-on-wire" />; and the rotor
        begins to spin in the same direction as the field
        <Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />.
      </p>

      <RotatingMagField3DDemo figure="Fig. 20.5" />

      <p className="mb-prose-3">
        It is worth pausing on the algebraic miracle that makes the three-phase trick work. Each
        coil's contribution to the field at the bore centre is its instantaneous current times a
        unit vector pointing along its own radial axis. Sum the three contributions for the standard
        sequence <M tex="I_x(t) = I_0 \cos(\omega t + \varphi_x)" /> with{' '}
        <M tex="\varphi = 0,\ -120°,\ -240°" />, and the three time-varying scalars combine with the
        three fixed spatial vectors to give a single vector <M tex="\vec{B}(t)" /> of constant
        magnitude <M tex="(3/2)\, B_0" />
        rotating about the bore axis at angular speed <M tex="\omega" />. Constant magnitude — no
        pulsation. Pure rotation. Tesla's 1888 polyphase motor showed that phased AC currents can
        create a rotating field; modern industrial systems standardized on three phases because they
        give smooth rotation while carrying balanced power efficiently on three wires
        <Cite id="tesla-1888" in={SOURCES} />.
      </p>

      <InductionMotorSlipDemo figure="Fig. 20.6" />

      <p className="mb-prose-3">
        Here is the subtle point. If the rotor ever caught up exactly to synchronous speed, the
        relative motion of bar through field would drop to zero, the induced EMF would vanish, the
        bar currents would die, the torque would collapse, and the rotor would coast. So the rotor{' '}
        <em className="text-text italic">can never reach</em> synchronous speed under load — it
        always slips behind. The fractional difference is the{' '}
        <em className="text-text italic">
          <Term
            def={
              <>
                The fractional difference between synchronous speed and actual rotor speed:{' '}
                <M tex="s = (n_s - n)/n_s" />. At full rated load, a typical induction motor runs at
                a few percent slip. Slip is the signal that produces torque.
              </>
            }
          >
            slip
          </Term>
        </em>
        :
      </p>
      <Formula tex="s = (n_s - n) / n_s" />
      <p className="mb-prose-3">
        where <M tex="s" /> is the dimensionless slip (a pure ratio, often quoted as a percentage),{' '}
        <M tex="n_s" /> is the synchronous speed of the rotating stator field (in RPM, from the
        formula above), and <M tex="n" /> is the actual mechanical rotation speed of the rotor (in
        RPM).
      </p>
      <p className="mb-prose-3">
        Typical full-load slip is 2–5 %. At no load, slip drops toward 0.1 % (just enough to
        overcome bearing friction and windage). Load it up and slip rises; the bar EMF rises with
        it; the bar currents rise; the torque rises. The machine self-regulates. There is no
        controller, no rotor-position sensor, no feedback loop — the slip itself{' '}
        <em className="text-text italic">is</em> the feedback. Plug it directly into the grid,
        mechanically couple it to a load, and it starts. That rugged self-starting behavior is why
        induction machines dominate fixed-speed industrial motor loads
        <Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />.
      </p>

      <Pullout>
        The induction motor doesn't need to know the position of its own rotor. The slip tells it.
      </Pullout>

      <TryIt
        tag="Try 20.4"
        question={
          <>
            A 4-pole induction motor runs from a 60 Hz line and turns at{' '}
            <strong className="text-text font-medium">1740 RPM</strong> under load. What is the
            slip?
          </>
        }
        hint={
          <>
            Compute synchronous speed first: <M tex="n_s = 120\, f / p" />.
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

      <h2 className="chapter-h2">Synchronous and stepper motors</h2>

      <p className="mb-prose-3">
        Two more variants round out the family. The{' '}
        <Term
          def={
            <>
              An AC motor whose rotor turns exactly at line-synchronous speed, conventionally
              written <M tex="n_s = 120 f/p" /> in RPM. Achieves zero slip by giving the rotor its
              own magnetic field.
            </>
          }
        >
          synchronous motor
        </Term>{' '}
        looks like an induction motor from the outside but the rotor has its own field — a DC-fed
        wound rotor or a set of permanent magnets. The rotor's own field locks onto the rotating
        stator field and follows it at exactly synchronous speed, with no slip. Torque comes from a
        small lag angle <M tex="\delta" /> between the rotor and stator-field positions;{' '}
        <M tex="\tau \propto \sin\delta" />. Past <M tex="\delta = 90°" /> the rotor "pulls out of
        step" — slips a pole — and the machine stalls
        <Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />.
      </p>

      <SynchronousMotorDemo figure="Fig. 20.7" />

      <p className="mb-prose-3">
        Synchronous motors are where you need precise speed: the spindle in a hard drive, the
        platter in a vinyl turntable, the rolling mill in a steel plant, the propeller shaft in an
        icebreaker. A clock running on a synchronous motor stays accurate over the long run, because
        grid operators schedule periodic frequency corrections to keep the accumulated
        cycle count aligned with civil time
        <Cite id="grainger-power-systems-2003" in={SOURCES} />. The trade-off is that a synchronous
        motor doesn't start on its own — it has to be brought up to near-synchronous speed by some
        other means (a starting cage, a variable-frequency drive, or a small pony motor) before the
        rotor can lock onto the field.
      </p>
      <p className="mb-prose-3">
        The other branch is the{' '}
        <Term def="A motor that advances its rotor by a fixed angular increment per input pulse — typically 1.8° for a 200-step hybrid. Used for open-loop positioning in 3D printers, CNC tables, and dome telescopes.">
          stepper motor
        </Term>
        . Geometrically it's a many-pole synchronous machine — a common 200-step hybrid has 50 rotor
        teeth and four full-step states, giving 1.8° per step. The controller pulses each phase in
        sequence; each pulse pulls the rotor's nearest tooth to align with the energized stator
        pole. Position is the integral of the pulse count. No feedback needed.{' '}
        <Term def="A drive technique that subdivides each full step into many smaller positions by varying the relative current in two adjacent phases. A 200-step stepper at 1/256 microstepping has 51 200 effective positions per revolution.">
          Microstepping
        </Term>{' '}
        drives the two adjacent phases with sinusoidally varying currents, smoothing the motion and
        subdividing each step by factors of 16 or more
        <Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />.
      </p>

      <StepperMotorDemo figure="Fig. 20.8" />

      <h2 className="chapter-h2">Torque, speed, and matching to a load</h2>

      <p className="mb-prose-3">
        A motor's headline rating is its <em className="text-text italic">torque-speed curve</em>:
        how much torque it produces as a function of how fast the shaft is turning. Each motor
        family has a distinctive shape, and an engineer picks a motor by finding the curve whose
        intersection with the load's mechanical impedance lies at the operating point they want.
      </p>

      <TorqueSpeedCurveDemo figure="Fig. 20.9" />

      <p className="mb-prose-3">
        The DC brushed motor has a roughly linear curve: maximum torque at stall (zero speed, full
        current), torque falling linearly to zero at the no-load speed where back-EMF nearly equals
        supply voltage. The induction motor has a quasi-flat region just below synchronous speed,
        then a sharply peaked
        <em className="text-text italic"> pull-out torque</em> at ~10–15 % slip, then a steep
        collapse below that. The synchronous motor has a vertical line at <M tex="n_s" />: speed is
        fixed by line frequency until torque exceeds the pull-out value, at which point the machine
        stalls instantly. The stepper has a roughly flat low-speed region followed by a sharp drop
        above the <em className="text-text italic">pull-out frequency</em>
        <Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        Pumping water through a hydraulic load (torque <M tex="\propto \omega^2" />, the fan-law
        curve) wants a different motor than driving a positive-displacement compressor (constant
        torque vs <M tex="\omega" />
        ). Hoisting a constant weight wants different again. The motor is chosen — and often the
        gearing too — to put the steady-state intersection of motor curve and load curve at the
        design operating point.
      </p>

      <p className="mb-prose-3">
        Choosing the curve is only half the job; the other half is choosing the{' '}
        <em className="text-text italic">operating point on it</em>. A motor is not equally
        efficient everywhere on its torque–speed plane. Copper losses scale as <M tex="I^2 R" /> —
        and therefore as torque squared. Iron losses (eddy + hysteresis in the laminations) scale
        roughly with frequency to the 1.5 power. Bearing and windage losses scale with speed. The
        combination produces a "sweet spot" of peak efficiency near rated torque and rated speed,
        with efficiency falling off at low loads (where the speed-dependent losses dominate the
        small useful output) and at high speeds (where iron and PM eddy losses run away). A premium
        PMSM peaks near 96 % efficiency; a good induction motor near 93 %; a brushed DC motor rarely
        above 85 %
        <Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />.
      </p>

      <p className="mb-prose-3">
        For an EV, the practical consequence is that the gearbox ratio is chosen to put the motor's
        operating point inside its bright sweet spot for the typical cruise condition. A
        single-speed reduction is often enough because a PMSM's sweet spot is broad and the inverter
        can field-weaken to extend constant-power operation toward top speed. Industrial
        inverter-driven pumps and fans get the same benefit: variable-frequency operation keeps the
        motor near rated torque at every speed the application demands
        <Cite id="krishnan-2010-bldc" in={SOURCES} />.
      </p>

      <TryIt
        tag="Try 20.5"
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
              The curve is <M tex="\tau(n) = \tau_{\text{stall}}\, (1 - n/n_0)" />. At{' '}
              <M tex="n = 2000\,\text{rpm}" /> with <M tex="n_0 = 4000\ \text{rpm}" />:
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
        the integral of pulse count. Same underlying physics — <M tex="\tau = NIAB \sin\theta" /> —
        six different ways to keep that <M tex="\sin" /> from going the wrong way.
      </p>
      <p className="mb-prose-3">
        Next chapter: spin one of these machines mechanically instead of electrically, and you get a
        generator. The rest of the global power infrastructure is built on the inverse of this
        chapter.
      </p>

      <MotorEfficiencyMapDemo figure="Fig. 20.10" />

      <CaseStudies
        intro={
          <>
            Four motors in working systems, from EV traction down to small precision spindle and
            positioning motors.
          </>
        }
      >
        <CaseStudy
          tag="Case 20.1"
          title="EV induction traction motor"
          summary="A 3-phase AC induction motor with conductive rotor bars, driven by a field-oriented inverter; the kind of machine that defined an early EV-performance era."
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
            {
              label: 'Peak output',
              value: (
                <>
                  high-power traction scale{' '}
                  <Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />
                </>
              ),
            },
            {
              label: 'Maximum speed',
              value: (
                <>
                  high-speed operation under inverter control{' '}
                  <Cite id="krishnan-2010-bldc" in={SOURCES} />
                </>
              ),
            },
            {
              label: 'Cooling',
              value: (
                <>
                  liquid-cooled stator and inverter in high-output designs{' '}
                  <Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />
                </>
              ),
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
            Early high-performance EVs made serious use of 3-phase AC induction traction motors:
            rugged copper or aluminium rotor cages, no permanent magnets, and a controller that
            supplies torque through a variable-frequency inverter. The choice is practical:
            induction avoids neodymium-iron-boron magnets, behaves well at high speed, and tolerates
            rotor heating; PMSM designs trade some of that ruggedness for stronger low-loss cruise
            efficiency
            <Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />
            <Cite id="krishnan-2010-bldc" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            The drive is a 3-phase inverter generating variable-frequency, variable-amplitude PWM,
            controlled by a field-oriented control loop. At any operating point, the controller
            measures rotor position (or estimates it from back-EMF), transforms the three-phase
            stator currents into the rotor-aligned <M tex="d\text{-}q" /> frame, and runs PI loops
            on the d-axis (flux) and q-axis (torque) components independently. That decoupling is
            what lets the same machine deliver flat torque from zero rpm up through the
            field-weakening region near top speed
            <Cite id="krishnan-2010-bldc" in={SOURCES} />.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 20.2"
          title="HDD spindle motor"
          summary="A compact BLDC keeps a platter stack at fixed speed while the read/write heads fly."
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
            {
              label: 'Speed',
              value: (
                <>
                  fixed-speed spindle operation <Cite id="krishnan-2010-bldc" in={SOURCES} />
                </>
              ),
            },
            {
              label: 'Speed regulation',
              value: (
                <>
                  closed-loop speed regulation from the drive electronics{' '}
                  <Cite id="krishnan-2010-bldc" in={SOURCES} />
                </>
              ),
            },
            {
              label: 'Power',
              value: (
                <>
                  low steady-state power once spun up <Cite id="krishnan-2010-bldc" in={SOURCES} />
                </>
              ),
            },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            A hard-drive spindle is a compact brushless motor optimized for quiet fixed-speed
            rotation. The stator coils sit under the platter stack; the rotor carries permanent
            magnets in the hub. The controller IC drives the phases and can infer rotor position
            from the unenergised phase's back-EMF, avoiding separate rotor-position sensors in the
            tight spindle package
            <Cite id="krishnan-2010-bldc" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            Speed regulation matters because read-channel timing assumes a stable angular velocity.
            Any spindle-speed jitter shows up as timing noise in the recovered data stream. Modern
            spindle controllers therefore close the loop electronically rather than relying on motor
            physics alone
            <Cite id="krishnan-2010-bldc" in={SOURCES} />.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 20.3"
          title="The brushed motor in a cordless drill"
          summary="A permanent-magnet brushed DC motor, fed PWM from the battery; speed scales with duty cycle."
          specs={[
            {
              label: 'Topology',
              value: (
                <>
                  2-pole permanent-magnet stator, multi-segment commutator{' '}
                  <Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />
                </>
              ),
            },
            {
              label: 'Supply',
              value: (
                <>
                  battery DC pack <Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />
                </>
              ),
            },
            {
              label: 'Peak power',
              value: (
                <>
                  high stall current and high starting torque{' '}
                  <Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />
                </>
              ),
            },
            {
              label: 'Speed control',
              value: (
                <>
                  variable-duty PWM via trigger switch{' '}
                  <Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />
                </>
              ),
            },
            {
              label: 'Brush life',
              value: (
                <>
                  maintenance item in brushed designs{' '}
                  <Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />
                </>
              ),
            },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            The classic brushed motor remains attractive when bill-of-materials cost and simplicity
            matter. The brushed version trades simple control against shorter brush life, more EMI,
            and lower efficiency. Premium and high-duty tools move to brushless because the lifetime
            cost and thermal performance eventually matter more than the cheaper motor
            <Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            Speed control is direct: a power switch in series with the motor applies pulse-width
            modulation, and the trigger sets duty cycle. Because the rotor's mechanical inertia
            averages over many switching periods, the motor approximately responds to the average
            applied voltage. The brushed-DC torque-speed characteristic is roughly linear in
            voltage, so duty cycle maps cleanly to no-load speed
            <Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 20.4"
          title="Hybrid stepper in a 3D printer"
          summary="A 200-step hybrid stepper with fractional-step current control gives open-loop positioning for printer axes."
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
            {
              label: 'Step angle',
              value: (
                <>
                  <M tex="1.8^\circ" /> (<M tex="200" /> steps/rev){' '}
                  <Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />
                </>
              ),
            },
            {
              label: 'Microstepping',
              value: (
                <>
                  commonly fractional-step current control{' '}
                  <Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />
                </>
              ),
            },
            {
              label: 'Holding torque',
              value: (
                <>
                  on the order of half a newton-metre for typical NEMA-17 sizes{' '}
                  <Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />
                </>
              ),
            },
            {
              label: 'Driver',
              value: (
                <>
                  chopper-mode constant-current driver; a couple of amps per phase{' '}
                  <Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />
                </>
              ),
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
            (<M tex="200/50 = 4" /> steps per tooth)
            <Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            Microstepping subdivides each full step. At 1/16 microstepping the driver feeds the two
            phases sinusoidal currents 90° apart in electrical phase, with their relative amplitude
            stepped through 16 finely-spaced ratios per full-step interval. The rotor then settles
            at intermediate angles whose precision is limited by detent torque (residual reluctance
            variation) rather than by driver resolution. On a belt-driven printer axis, gearing and
            pulley pitch translate each motor step into a small linear increment; the practical
            accuracy is then limited by belt stretch, frame stiffness, friction, and calibration as
            much as by the microstep command
            <Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />.
          </p>
        </CaseStudy>
      </CaseStudies>

      <FAQ intro="Loose threads — the questions a careful reader tends to surface after going through this chapter.">
        <FAQItem q="If τ = NIAB sin(θ) is the same formula for every motor, why are there so many different motor designs?">
          <p>
            Because the formula doesn't tell you how to keep <M tex="\sin\theta" /> in the part of
            its range where the torque is positive and useful. Every motor family is a different
            answer to that question. Brushed DC uses a mechanical commutator. BLDC and PMSM use
            electronic commutation against rotor-position feedback. Induction uses a rotating stator
            field with no rotor-side connection, and accepts slip as the price. Synchronous locks
            the rotor's own field to the stator field. Stepper indexes through discrete commutated
            positions on command. Same one-line physics, six different commutation strategies
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
            its speed: <M tex="E_{\text{back}} = K_e\, \omega" />. This back-EMF opposes the supply
            voltage, so the net voltage across the winding resistance is{' '}
            <M tex="V - E_{\text{back}}" />, and the current is{' '}
            <M tex="I = (V - E_{\text{back}})/R" />. At stall, <M tex="E_{\text{back}} = 0" /> and{' '}
            <M tex="I = V/R" /> is large — that's why a stalled motor pulls a huge current. As the
            rotor accelerates, back-EMF rises, current falls, and the steady-state speed is the one
            at which the residual <M tex="(V - E_{\text{back}})/R" /> current produces just enough
            torque to balance load and losses
            <Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why do induction motors specifically need three phases, and why not two or four?">
          <p>
            They do not strictly need three phases: Tesla's original 1888 system used two phases 90°
            apart to produce a rotating field. Three-phase became the industrial standard because it
            gives a smooth rotating field while also carrying balanced power economically. It has
            the clean property that{' '}
            <M tex="\cos(\omega t) + \cos(\omega t - 120°) + \cos(\omega t - 240°) = 0" />
            at every instant, so three wires carry all the power with no neutral return current.
            Higher phase counts (6, 9, 12) appear in specialty high-power drives, but three is the
            practical baseline for most grid-fed and inverter-fed industrial machines
            <Cite id="tesla-1888" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What's a 'pole pair' and why does it appear in the speed formula?">
          <p>
            A pole pair is one north–south set of magnetic poles arranged around the rotor. A 2-pole
            machine has one pole pair (one N and one S, on opposite sides); a 4-pole has two pairs
            alternating around the circumference; an 8-pole has four. For the stator field to make
            one complete spatial revolution around the bore, the electrical phase has to advance
            through <M tex="p/2" /> full cycles, so the mechanical synchronous speed in RPM is{' '}
            <M tex="120\, f / p" />. Higher pole count means slower rotation for the same line
            frequency, traded against larger physical size for a given output torque
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
            Because induction motors are rugged, self-starting, and self-regulating from a
            fixed-frequency grid. Pumps, fans, compressors, conveyors, elevators, and machine tools
            all reward a motor with no brushes, no sliding electrical contacts, and a rotor that can
            be cast as a cage inside laminated steel. Without Tesla's 1888 invention of the
            polyphase induction motor, AC power would have lacked one of its most important
            industrial loads
            <Cite id="tesla-1888" in={SOURCES} />
            <Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why do EVs use 3-phase AC motors instead of DC motors?">
          <p>
            Many early and home-converted EVs used brushed DC motors — easy to control with a
            simple chopper and forgiving of crude electronics. Modern EVs moved to 3-phase AC (PMSM
            or induction) for three reasons. First, they're brushless —
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
            smooth torque from zero speed up through field-weakening, plus efficient operation
            across the full envelope. It is the standard high-performance control approach for many
            modern PMSM and induction drives
            <Cite id="krishnan-2010-bldc" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why don't induction motors use permanent magnets like BLDC/PMSM do?">
          <p>
            They could — and that's what a PMSM is. The induction motor's rotor is deliberately
            passive: its currents are induced by the rotating stator field. The advantages are that
            you don't need any rare-earth content (no neodymium-iron-boron supply chain), the rotor
            tolerates very high temperatures (PM motors can irreversibly demagnetise at elevated
            temperatures — grade-dependent, often around 150 °C{' '}
            <Cite id="krishnan-2010-bldc" in={SOURCES} />), and the construction is essentially
            indestructible (a single piece of cast aluminium
            plus a stack of laminated steel). The disadvantage is slightly lower efficiency, because
            some of the energy that flows across the air gap is dissipated in <M tex="I^2 R" />{' '}
            losses in the rotor bars. For very large machines (over 100 kW) the efficiency gap is
            small enough that induction usually wins on ruggedness and cost
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
            distinction is in the drive waveform and the back-EMF profile. A BLDC is usually
            associated with trapezoidal back-EMF and quasi-square-wave 6-step current — simple
            controller, with torque ripple set by the motor and commutation details. A PMSM is
            associated with sinusoidal back-EMF and smooth sinusoidal currents under field-oriented
            control — more complex controller, but much smoother torque. The terminology is partly
            historical; many machines straddle the boundary, and most modern drives can run either
            control mode on any 3-phase PM motor
            <Cite id="krishnan-2010-bldc" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why do high-performance motors use laminated iron in the stator?">
          <p>
            Because the stator iron sees a rotating (and therefore time-varying) magnetic field,
            which induces eddy currents in the iron itself by Faraday's law. Those eddy currents
            flow in closed loops in the cross-section of the iron and dissipate as <M tex="I^2 R" />{' '}
            heat. Laminating the iron into thin insulated sheets breaks the eddy-current paths into
            smaller, higher-resistance loops, cutting the losses strongly as the sheet thickness
            falls. The same trick is used in transformers, for the same reason
            <Cite id="griffiths-2017" in={SOURCES} />
            <Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />.
          </p>
        </FAQItem>
      </FAQ>
    </ChapterShell>
  );
}
