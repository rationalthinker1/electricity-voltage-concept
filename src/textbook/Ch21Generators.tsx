/**
 * Chapter 17 — Generators and the grid
 *
 * The inverse of Chapter 16. Spin one of those rotating machines
 * mechanically and you get EMF on its windings. Same topology, scaled
 * up: every dam, every gas turbine, every car alternator, every wind
 * turbine is a generator of this kind. Then how 10 000 of them tie
 * together into a continental power system.
 */
import { CaseStudies, CaseStudy } from '@/components/CaseStudy';
import { ChapterShell } from '@/components/ChapterShell';
import { FAQ, FAQItem } from '@/components/FAQ';
import { Cite } from '@/components/SourcesList';
import { Formula, InlineMath } from '@/components/Formula';
import { Pullout } from '@/components/Prose';
import { Term } from '@/components/Term';
import { TryIt } from '@/components/TryIt';
import { RotatingCoilGeneratorDemo } from './demos/RotatingCoilGenerator';
import { SynchronousGeneratorDemo } from './demos/SynchronousGenerator';
import { ExcitationControlDemo } from './demos/ExcitationControl';
import { PowerAngleDeltaDemo } from './demos/PowerAngleDelta';
import { AlternatorDemo } from './demos/Alternator';
import { GridSyncDemo } from './demos/GridSync';
import { LoadFollowingDemo } from './demos/LoadFollowing';
import { InertialResponseDemo } from './demos/InertialResponse';
import { getChapter } from './data/chapters';

export default function Ch17Generators() {
  const chapter = getChapter('generators')!;
  const SOURCES = chapter.sources;

  return (
    <ChapterShell chapter={chapter}>
      <p className="chapter-intro">
        Stand at the base of Hoover Dam and look up. The concrete face holds back 35 cubic kilometres of Lake Mead;
        the water falls 220 metres through penstocks the diameter of a city bus into the bottom of the canyon, where
        seventeen rotating machines — each about the size of a two-storey house — turn that gravitational potential
        energy into roughly two gigawatts of electrical output. The same year you visit, that current will light a
        kitchen in Los Angeles 400 km away. Every one of those seventeen machines is the same device you met in
        Chapter 16 (the brushed DC motor, the synchronous AC motor), reversed: instead of consuming current to make
        torque, you supply torque to make current. Run a motor backwards and you have a generator.
      </p>
      <p className="mb-prose-3">
        Michael Faraday discovered this in 1831 by sliding a bar magnet through a coil of wire and watching a
        galvanometer needle twitch<Cite id="faraday-1832" in={SOURCES} />. That experiment was published the year
        Lincoln was 22. From it descends the entire global electric-power industry: every dam, every wind turbine,
        every gas turbine, every nuclear plant, every car alternator, every emergency genset, every wireless-phone
        charging pad. This chapter walks up that ladder, starting from a single rotating coil and ending at the
        continental grid that keeps your refrigerator running.
      </p>

      <h2 className="chapter-h2">Run a motor backwards</h2>

      <p className="mb-prose-3">
        We left Chapter 16 with the synchronous motor: a rotor with its own field, locked to a rotating stator field,
        spinning at exactly <InlineMath tex="n_s = 120\, f / p" />. The rotor's field induces a sinusoidal flux through
        each stator coil, but a moment of thought reveals that the cause-and-effect relationship was a matter of
        choice. The stator's rotating field drives the rotor; equivalently, the rotor's rotating field induces
        voltage in the stator. Drive the rotor by some external mechanical means (a water turbine, a steam turbine, a
        gasoline engine, a wind blade) instead of letting the stator do it, and the same machine produces voltage on
        its stator leads instead of consuming voltage from them<Cite id="feynman-II-17" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        The bedrock physics is <Term def="A time-changing magnetic flux through a closed loop induces an EMF around that loop equal to −dΦ/dt. The minus sign — Lenz's law — ensures that the induced current opposes the change that created it. Source of all electric power generation.">Faraday's law of induction</Term>:
      </p>
      <Formula id="faraday-law" />
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">ℰ</strong> is the EMF induced around the closed loop (in volts),
        <strong className="text-text font-medium"> Φ</strong> is the magnetic flux through the loop (in webers, equivalently T·m²),
        and <strong className="text-text font-medium">t</strong> is time (in seconds). The minus sign — Lenz's law — gives the
        direction: the induced current opposes the change in flux.
      </p>
      <p className="mb-prose-3">
        For a coil of <em className="italic text-text">N</em> turns linking flux <em className="italic text-text">Φ</em>, the EMF is <InlineMath tex="-N\, d\Phi/dt" />. The minus sign — Lenz's
        law — says the induced current flows in the direction that opposes the change in flux that created it. In a
        generator, that opposition is exactly what produces the mechanical resistance you have to push against to keep
        the rotor turning. Energy in, work in, work out — strict conservation across the air gap<Cite id="griffiths-2017" in={SOURCES} />.
      </p>

      <h2 className="chapter-h2">The simple alternator</h2>

      <p className="mb-prose-3">
        Take a single rectangular coil of <em className="italic text-text">N</em> turns and area <em className="italic text-text">A</em>. Rotate it in a uniform magnetic field
        of magnitude <em className="italic text-text">B</em> at angular speed <em className="italic text-text">ω</em>. The flux through the coil at angle <InlineMath tex="\theta = \omega t" /> is
        <InlineMath tex="\Phi(t) = BA \cos(\omega t)" />. The induced EMF is the time derivative<Cite id="griffiths-2017" in={SOURCES} />:
      </p>
      <Formula tex="\varepsilon(t) = -N \cdot d\Phi/dt = N B A \omega \sin(\omega t)" />
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">ℰ(t)</strong> is the instantaneous EMF at the coil's terminals (in volts),
        <strong className="text-text font-medium"> N</strong> is the number of turns in the coil (dimensionless integer),
        <strong className="text-text font-medium"> B</strong> is the uniform magnetic field magnitude (in tesla), <strong className="text-text font-medium">A</strong>{' '}
        is the area enclosed by one turn (in m²), <strong className="text-text font-medium">ω = 2πf</strong> is the angular speed of
        rotation (in rad/s), and <strong className="text-text font-medium">t</strong> is time (in seconds).
      </p>
      <p className="mb-prose-3">
        A clean sinusoid. Peak amplitude is <InlineMath tex="NBA\omega" />; frequency is <InlineMath tex="\omega / 2\pi" />. Scale up <em className="italic text-text">N</em>,
        <em className="italic text-text"> B</em>, <em className="italic text-text">A</em>, or <em className="italic text-text">ω</em> and the output voltage goes up linearly with each. The simplest
        possible generator — sometimes called a single-phase <Term def="A generator whose output is alternating current; the rotor's field is taken out through slip rings (continuous rings, not the split commutator of a DC machine). The car-alternator usage is historical; modern automotive alternators are 3-phase machines.">alternator</Term>
        — is exactly this picture, with two slip rings carrying the coil's two leads out to the external load.
      </p>

      <RotatingCoilGeneratorDemo />

      <p className="mb-prose-3">
        Connect a resistive load across the coil's leads and current flows: <InlineMath tex="I = \varepsilon/R" />. Now the current-carrying
        coil sits in the same field <strong className="text-text font-medium">B</strong>, so the wire experiences <InlineMath id="force-on-wire" />: a force on each
        long side, opposing the rotation. The mechanical torque you must apply to keep the rotor spinning is exactly
        <InlineMath tex="P_{\text{elec}} / \omega" />, where <InlineMath tex="P_{\text{elec}}" /> is the electrical power being delivered to the
        load. No load → no current → no back-torque → the rotor spins essentially freely (against bearing friction and
        windage). Full load → maximum current → maximum back-torque. Energy conservation is automatic; you can't extract
        electrical energy without burning mechanical energy at the same rate.
      </p>

      <TryIt
        tag="Try 17.1"
        question={<>A coil with <strong className="text-text font-medium">N = 100</strong> turns and area <strong className="text-text font-medium">A = 200 cm²</strong> rotates at <strong className="text-text font-medium">3600 RPM</strong> in a <strong className="text-text font-medium">0.5 T</strong> field. What is the peak EMF?</>}
        hint={<>Convert RPM to <InlineMath tex="\omega" /> in rad/s, then plug into <InlineMath tex="NBA\omega" />.</>}
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">
              First convert: <InlineMath tex="\omega = 2\pi \cdot (3600/60) = 2\pi \cdot 60 = 120\pi \approx 377\ \text{rad/s}" />.
              A = 200 cm² = 0.02 m².
            </p>
            <Formula tex="\varepsilon_{\text{peak}} = N B A \omega = (100)(0.5)(0.02)(377)" />
            <Formula tex="\varepsilon_{\text{peak}} \approx 377\ \text{V}" />
            <p className="mb-prose-1 last:mb-0">
              In RMS that's about 267 V — within a factor of two of standard line voltage. The 3600 RPM happens to be
              the synchronous speed for a 2-pole machine on a 60 Hz grid, which is why utility-scale generators on
              steam turbines are usually 2-pole or 4-pole<Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2 className="chapter-h2">The 3-phase synchronous generator — workhorse of the grid</h2>

      <p className="mb-prose-3">
        Now scale up. Instead of one stator coil, wind three coils 120° apart around the bore. Each coil sees the
        same rotating rotor flux, but offset by 120° of mechanical (or electrical) angle from its neighbours. The
        three terminal voltages are three sinusoids 120° apart in phase — exactly the three-phase AC that we met in
        Chapter 16 and that every utility transmission line carries<Cite id="kundur-1994-power-stability" in={SOURCES} />.
      </p>

      <SynchronousGeneratorDemo />

      <p className="mb-prose-3">
        This is the <Term def="A generator in which the rotor produces a steady magnetic field (from DC excitation or permanent magnets) and the stator carries the AC output. Rotor and stator field rotate at exactly the same speed — they're 'in synchronism.' The dominant topology for utility generation.">synchronous generator</Term>, and every utility-scale generator on Earth is one. The
        rotor's field is established either by feeding DC current to a wound rotor through slip rings (the classical
        large-machine setup) or by permanent magnets on the rotor (small machines and increasingly mid-size wind
        turbines). The stator's three windings carry the AC output. The frequency of that output is rigidly tied to
        the rotor's mechanical rotation speed:
      </p>
      <Formula tex="f = (n \cdot p) / 120 \quad (n\ \text{in RPM},\ p = \text{pole count})" />
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">f</strong> is the electrical output frequency (in Hz), <strong className="text-text font-medium">n</strong> is
        the rotor's mechanical rotation speed (in revolutions per minute), and <strong className="text-text font-medium">p</strong>{' '}
        is the machine's total pole count (a dimensionless even integer). This is the inverse of
        the synchronous-speed formula from Chapter 16.
      </p>
      <p className="mb-prose-3">
        At 3600 RPM with 2 poles, <InlineMath tex="f = 60\ \text{Hz}" /> — the North American grid frequency. At 3000 RPM with 2 poles,
        <InlineMath tex="f = 50\ \text{Hz}" /> — Europe, Asia, Africa. A nuclear or large coal turbine, geared so that its turbine wheel
        runs at exactly synchronous speed, spins forever within a few parts per million of nominal because the grid
        frequency itself is regulated that precisely<Cite id="kundur-1994-power-stability" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        Capacities range over four orders of magnitude in the same basic topology. A pole-mounted diesel genset for a
        construction trailer might be 30 kW. A gas-turbine peaker, 50 MW. A coal or gas combined-cycle unit, 500 MW
        to 1 GW. A large nuclear unit, 1.0–1.6 GW. The continental grid stitches together roughly 10 000 of these
        machines, each at its own physical site, all turning at exactly the same electrical
        frequency<Cite id="grainger-power-systems-2003" in={SOURCES} />.
      </p>

      <TryIt
        tag="Try 17.2"
        question={<>A hydroelectric generator at Hoover Dam has <strong className="text-text font-medium">40 poles</strong> and is connected to a 60 Hz grid. At what RPM does its shaft turn?</>}
        hint={<>The shaft must turn at synchronous speed: <InlineMath tex="n_s = 120\, f / p" />.</>}
        answer={
          <>
            <Formula tex="n_s = 120 \cdot 60 / 40 = 180\ \text{RPM}" />
            <p className="mb-prose-1 last:mb-0">
              Slow! That's the right pace for a low-head hydro turbine — Francis or Kaplan runners want low RPM to keep
              their tip speeds reasonable and cavitation in check. Wind-turbine direct-drive generators use even higher
              pole counts (~100 poles or more) to run at 10–20 RPM without a gearbox<Cite id="grainger-power-systems-2003" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2 className="chapter-h2">Excitation, the power angle, and pull-out</h2>

      <p className="mb-prose-3">
        A synchronous generator has two control knobs and one mechanical input. The mechanical input is whatever the
        prime mover is delivering — water through a turbine, steam through a blade row, the rotational torque of a
        diesel engine. The two electrical knobs are the rotor's <em className="italic text-text">field current</em> <InlineMath tex="I_f" />, which
        sets the rotor's magnetic flux and therefore the induced-EMF magnitude <InlineMath tex="|E_f|" />, and the
        rotor's <em className="italic text-text">load angle δ</em>, which is the steady-state phase lead of the rotor's flux axis ahead of the
        grid voltage phasor<Cite id="kundur-1994-power-stability" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        At no load, <InlineMath tex="|E_f|" /> is just the open-circuit terminal voltage: more field current produces
        more flux, more flux produces more EMF, full stop. Connect that generator to a stiff grid and the story
        changes. The grid clamps the terminal voltage at <InlineMath tex="|V_{\text{grid}}|" />; the real power transferred is
      </p>
      <Formula tex="P = \dfrac{|V_{\text{grid}}| \cdot |E_f|}{X_s} \cdot \sin\delta" />
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">P</strong> is the real (active) power delivered to the grid (in watts, or in
        per-unit on the machine's MVA base), <strong className="text-text font-medium">|V<sub>grid</sub>|</strong> is the magnitude of
        the grid voltage phasor at the terminals (in volts, or per-unit),
        <strong className="text-text font-medium"> |E<sub>f</sub>|</strong> is the magnitude of the internal EMF set by the rotor's
        field current (in volts, or per-unit), <strong className="text-text font-medium">X<sub>s</sub></strong> is the synchronous
        reactance (in ohms, or per-unit; typically 1–2 pu), and <strong className="text-text font-medium">δ</strong> is the load
        angle — the steady-state phase lead of the rotor flux ahead of the grid voltage phasor (in
        radians).
      </p>
      <p className="mb-prose-3">
        The reactive power at the terminal is
      </p>
      <Formula tex="Q = \dfrac{|V_{\text{grid}}| \cdot |E_f|}{X_s} \cdot \cos\delta - \dfrac{|V_{\text{grid}}|^2}{X_s}" />
      <p className="mb-prose-3">
        where <strong className="text-text font-medium">Q</strong> is the reactive power delivered by the generator (in VAR, or
        per-unit; positive means the machine sources VARs to the grid), and the remaining symbols
        carry the same meanings as in the real-power equation above.
      </p>
      <p className="mb-prose-3">
        Increase mechanical input and the rotor pulls ahead of the grid — <InlineMath tex="\delta" /> grows until <em className="italic text-text">P</em> matches.
        Increase field current and <em className="italic text-text">Q</em> grows: an over-excited generator supplies reactive power to the grid
        (acts like a capacitor); under-excited, it absorbs reactive power (acts like an inductor). The "V curves"
        familiar to power engineers — armature current vs field current at constant real power — fall out of these
        two equations<Cite id="grainger-power-systems-2003" in={SOURCES} />.
      </p>

      <ExcitationControlDemo />

      <p className="mb-prose-3">
        The power-angle relation <InlineMath tex="P \propto \sin\delta" /> has a sharp limit built into it. Real power peaks at <InlineMath tex="\delta = 90°" /> at a value <InlineMath tex="P_{\max} = |V \cdot E_f|/X_s" />, and past that point the rotor
        cannot transmit any more power no matter how hard the turbine pushes. The excess mechanical torque accelerates
        the rotor beyond synchronism — the unit <Term def="The condition in which a synchronous generator's rotor advances by a full electrical pole past the grid phasor. The terminal currents swing through a fault-level transient and the protection relay trips the machine offline.">slips a pole</Term>, the stator currents swing through a fault-level
        transient as <InlineMath tex="\delta" /> wraps from 90° back through 270°, and the protection relay trips the generator off
        the bus to save it. Stable steady-state operation requires <InlineMath tex="\delta" /> well below 90°, typically 20°–45° at
        rated output, with the remaining margin reserved for fault-ride-through<Cite id="kundur-1994-power-stability" in={SOURCES} />.
      </p>

      <PowerAngleDeltaDemo />

      <TryIt
        tag="Try 17.3"
        question={<>A <strong className="text-text font-medium">600 MW</strong> synchronous generator has <strong className="text-text font-medium">X<sub>s</sub> = 1.5 pu</strong>, <strong className="text-text font-medium">|V<sub>grid</sub>| = 1 pu</strong>, <strong className="text-text font-medium">|E<sub>f</sub>| = 1.4 pu</strong>. What is the steady-state power angle <em className="italic text-text">δ</em> when it delivers <strong className="text-text font-medium">500 MW</strong> at rated voltage?</>}
        hint={<>Per-unit P = 500/600. Then <InlineMath tex="\sin\delta = P \cdot X_s / (|V_{\text{grid}}| \cdot |E_f|)" />.</>}
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">Per-unit real power on the machine's own MW base:</p>
            <Formula tex="P = 500 / 600 = 0.833\ \text{pu}" />
            <Formula tex="\sin\delta = P \cdot X_s / (|V_{\text{grid}}| \cdot |E_f|) = 0.833 \cdot 1.5 / (1.0 \cdot 1.4) \approx 0.893" />
            <Formula tex="\delta = \arcsin(0.893) \approx 63°" />
            <p className="mb-prose-1 last:mb-0">
              That's a high power angle by utility-operations standards — the rotor is well up the curve, with
              <InlineMath tex="P_{\max} = |V \cdot E_f|/X_s \approx 0.93\ \text{pu}" /> (about 560 MW on the machine's
              base). Stability margin is thin; in practice the operator would dispatch additional reactive support
              (raise <InlineMath tex="|E_f|" />) to bring <InlineMath tex="\delta" /> back down before approving steady operation at
              this point<Cite id="kundur-1994-power-stability" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2 className="chapter-h2">The alternator under your car hood</h2>

      <p className="mb-prose-3">
        Shrink the synchronous generator by four orders of magnitude and you get the alternator on every internal-
        combustion engine. The rotor is a <Term def="A multi-pole rotor with interlocking 'claws' from each end, formed from pressed steel and energised by a single DC field coil in the centre. Cheap to mass-produce; standard in automotive alternators.">claw-pole</Term> design — typically 6 pole-pairs of interlocking sheet-steel
        fingers, energised by a single DC field coil running between them. The stator carries three windings.
        Mechanical speed is set by the engine via a belt: idle ≈ 750 RPM crank → ~1900 RPM alternator (2.5:1 pulley
        ratio); highway cruise ≈ 2000 RPM crank → ~5000 RPM alternator. With 6 pole-pairs that's 300 Hz electrical
        at idle, 500 Hz at cruise<Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        Three-phase AC at hundreds of Hz isn't useful to a car, which runs all its electrical loads off a 14 V DC
        bus. So the alternator's three phases feed a <em className="italic text-text">three-phase full-wave bridge</em> — six diodes — that
        rectifies the AC to nearly-DC. A voltage regulator continuously trims the rotor's field current to hold the
        DC output near 14.0 V regardless of engine speed and load.
      </p>

      <AlternatorDemo />

      <p className="mb-prose-3">
        The rectified output is the <em className="italic text-text">maximum</em> of the three phases' rectified envelopes at each instant — six
        humps per electrical cycle. Ripple is naturally small (peak-to-valley ~14 % of average for a 3-phase bridge),
        and the lead-acid battery sitting across the bus filters whatever remains. The whole assembly — generator,
        rectifier bridge, regulator, brushes on the rotor's two slip rings — fits in a package the size of a
        pineapple and lives bolted to the side of the engine block for the life of the car<Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />.
      </p>

      <TryIt
        tag="Try 17.4"
        question={<>A car alternator has <strong className="text-text font-medium">6 pole-pairs</strong>. The engine spins at <strong className="text-text font-medium">3000 RPM</strong> with a <strong className="text-text font-medium">2.5:1</strong> pulley ratio. What is the alternator's electrical frequency?</>}
        hint="Alternator RPM = engine RPM × ratio. Then f_elec = (alt RPM / 60) × pole-pairs."
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">Alternator shaft RPM:</p>
            <Formula>n<sub>alt</sub> = 3000 × 2.5 = 7500 RPM</Formula>
            <p className="mb-prose-1 last:mb-0">Electrical frequency:</p>
            <Formula>f = (7500 / 60) × 6 = <strong className="text-text font-medium">750 Hz</strong></Formula>
            <p className="mb-prose-1 last:mb-0">
              Much higher than grid frequency — which is fine, because the 6-diode bridge doesn't care: it rectifies
              cleanly at any frequency. Higher frequency actually helps, because the ripple period shrinks and battery
              filtering improves<Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2 className="chapter-h2">Synchronising to the grid</h2>

      <p className="mb-prose-3">
        A generator can't just be plugged into a live grid. The grid is a stiff bus held at exactly 60.000 Hz by ten
        thousand other generators all spinning in lock-step; any new generator joining the party must already be
        turning at the right speed, with its phase aligned, before its breaker closes — or transient circulating
        currents proportional to the voltage mismatch will flow through its windings and possibly destroy
        them<Cite id="kundur-1994-power-stability" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        Three things must match within tight tolerances at the instant of breaker close<Cite id="grainger-power-systems-2003" in={SOURCES} />:
      </p>
      <ul>
        <li><strong className="text-text font-medium">Frequency:</strong> |Δf| &lt; ~0.2 Hz. The incoming generator must already be turning at the right speed.</li>
        <li><strong className="text-text font-medium">Phase:</strong> |Δφ| &lt; ~10°. The voltage waveforms must be aligned in time.</li>
        <li><strong className="text-text font-medium">Voltage magnitude:</strong> |ΔV| &lt; ~5 %. The terminal voltages must match.</li>
      </ul>
      <p className="mb-prose-3">
        Larger machines also try to match the phase rotation (A-B-C vs A-C-B). Get all four right and the breaker
        closes silently with essentially no transient. Get one of them seriously wrong and the windings see a fault-
        level circulating current — at large machines this can mechanically deform the stator iron or rupture the
        rotor coupling.
      </p>

      <GridSyncDemo />

      <p className="mb-prose-3">
        Manual synchronisation traditionally uses a <Term def="A small lamp wired across the breaker contacts; its brightness shows the instantaneous voltage difference between the incoming generator and the live bus. Brightens at out-of-phase, goes dark at in-phase. Industrial sync panels still use modern versions of this.">synchroscope</Term>
        — a lamp that goes dark when the two are in phase and bright when they're 180° out. The operator adjusts the
        generator's speed governor until the synchroscope rotates slowly (Δf small) and then closes the breaker as the
        lamp goes dark (Δφ small). Modern systems use a digital sync-check relay that closes the breaker
        automatically when all conditions are met. Wind farms and inverter-based renewables synchronise through
        power electronics rather than mechanically — the inverter generates a current waveform aligned with the
        grid's voltage, so there's never a hard mechanical lock-up to worry about<Cite id="kundur-1994-power-stability" in={SOURCES} />.
      </p>

      <h2 className="chapter-h2">Load following: the grid as a real-time market</h2>

      <p className="mb-prose-3">
        Once a generator is on the bus, it has to do its share of the load. And here the grid's defining property
        becomes the controlling constraint: <em className="italic text-text">electric energy cannot, at grid scale, be stored.</em> (Pumped hydro
        stores a few hours' worth at a steep round-trip efficiency hit. Battery storage is growing but is still &lt;0.1 %
        of installed grid capacity globally.) Generation must match load second-by-second, all the way down to the
        microsecond at which a kitchen toaster engages somewhere<Cite id="kundur-1994-power-stability" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        The way that's done is to operate the grid as a layered dispatch stack. At the bottom, <em className="italic text-text">baseload</em>
        generators (nuclear, large coal units) run flat at near-rated output around the clock. Their fuel cost per
        kWh is the lowest, their thermal cycling cost is high (you don't want to ramp a 1 GW nuclear unit up and
        down on demand), and their startup time is hours. They cover the minimum demand the grid sees in the
        24-hour cycle.
      </p>
      <p className="mb-prose-3">
        Above baseload sit the <em className="italic text-text">mid-merit</em> and <em className="italic text-text">peaking</em> generators — combined-cycle gas plants, simple-
        cycle gas turbines, hydroelectric units with reservoir capacity. These can ramp up and down on minute-to-hour
        timescales, and they're dispatched to follow the load curve as it swings from the night-time minimum to the
        morning and evening peaks. Above the peakers sits <em className="italic text-text">spinning reserve</em>: typically 5–10 % of system
        capacity, kept synchronised to the bus but loaded below its rating, available to ramp up in seconds when an
        unscheduled outage drops a major generator<Cite id="grainger-power-systems-2003" in={SOURCES} />.
      </p>

      <LoadFollowingDemo />

      <p className="mb-prose-3">
        Renewables don't fit cleanly into this stack. Wind and solar are dispatched first whenever they're available
        (their marginal fuel cost is zero) but their availability isn't under the operator's control — it follows
        weather, not load. As renewables grow as a fraction of capacity, the residual demand that the dispatchable
        generators must cover becomes <em className="italic text-text">more</em> variable than the original load, not less, with steep evening
        ramps as solar drops out and demand peaks. The grid's regulation requirement — fast-acting reserves, ramping
        capability, frequency response — therefore grows more demanding even as fuel use falls<Cite id="kundur-1994-power-stability" in={SOURCES} />.
      </p>

      <Pullout>
        Every time you flip a switch, somewhere a turbine speeds up by a fraction of a microsecond.
      </Pullout>

      <p className="mb-prose-3">
        That's literally how the grid balances load and generation in real time. When demand exceeds generation, all
        synchronous machines on the bus slow down imperceptibly — they're decelerated by the extra electrical torque
        on their stators. The grid frequency dips a few millihertz. <Term def="Generators automatically reduce output when frequency rises and increase output when frequency falls, with a slope (typically ~5%) set by their governors. The grid-wide cumulative governor response is what stabilises frequency in the first second after a load change.">Governor droop</Term> at every generator
        senses the frequency drop and opens its fuel/water/steam valve a notch, which accelerates the rotor back
        toward 60 Hz. The whole feedback loop closes in seconds. Slower outer loops dispatch additional reserves
        over minutes; load forecasting commits new generation hours ahead.
      </p>

      <TryIt
        tag="Try 17.5"
        question={<>A grid loses a <strong className="text-text font-medium">1 GW</strong> generator instantaneously. The system has <strong className="text-text font-medium">200 GW</strong> of total spinning inertia equivalent to <strong className="text-text font-medium">8 GW·s/Hz</strong>. By how much does frequency initially fall in the first second, before any governor response?</>}
        hint="Inertia equation: Δf/Δt ≈ ΔP / (2H), where H is the system inertia constant. Or directly: df/dt = −ΔP / (system inertia in GW·s/Hz)."
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">
              The 8 GW·s/Hz inertia coefficient means: every 1 GW of power imbalance produces df/dt = 1/8 Hz/s of
              frequency decline, before any governor opens its valve.
            </p>
            <Formula>df/dt = −ΔP / H<sub>sys</sub> = −1 GW / (8 GW·s/Hz) = <strong className="text-text font-medium">−0.125 Hz/s</strong></Formula>
            <p className="mb-prose-1 last:mb-0">
              After one second the frequency would have fallen to ~59.875 Hz. Governor droop typically arrests the
              fall around 59.7 Hz before reserves bring it back. Below ~59.3 Hz the grid would start dropping load to
              avoid cascading collapse<Cite id="kundur-1994-power-stability" in={SOURCES} />.
            </p>
          </>
        }
      />

      <p className="mb-prose-3">
        How fast that initial frequency excursion proceeds depends entirely on how much rotational kinetic energy is
        actually spinning on the grid. The aggregate dynamics are captured by the <em className="italic text-text">swing equation</em>: 2H · df/dt
        = ΔP/P<sub>base</sub>, where <em className="italic text-text">H</em> is the system inertia constant (the kinetic energy stored in all
        synchronous machines, divided by the system MVA base, with units of seconds). A grid dominated by large
        synchronous machines (coal, hydro, nuclear) has <em className="italic text-text">H</em> in the 4–6 s range; a grid dominated by inverter-
        based renewables can drop below 2 s, and the same disturbance produces a frequency excursion two or three
        times as steep<Cite id="kundur-1994-power-stability" in={SOURCES} />.
      </p>

      <InertialResponseDemo />

      <p className="mb-prose-3">
        This is the live debate of the 2020s. As coal retires and inverter-based wind, solar, and battery storage
        replace it, the grid loses inertia. <Term def="Algorithms in grid-following or grid-forming inverters that emulate the kinetic-energy release of a spinning rotor by injecting power in proportion to df/dt. Lets battery storage and renewables contribute to inertial response without literal rotating mass.">Synthetic inertia</Term> in batteries and grid-forming inverters can replace some of the
        lost response, but the regulatory and engineering frameworks for verifying that replacement under fault
        conditions are still catching up<Cite id="kundur-1994-power-stability" in={SOURCES} />.
      </p>

      <TryIt
        tag="Try 17.6"
        question={<>A grid with total rotational inertia <strong className="text-text font-medium">H = 4 s</strong> instantly loses <strong className="text-text font-medium">500 MW</strong> of generation out of a <strong className="text-text font-medium">10 GW</strong> total load. What is the initial rate of frequency decline <em className="italic text-text">df/dt</em>?</>}
        hint="Swing equation: 2H · (df/dt)/f_nom = −ΔP/P_base. Solve for df/dt at f_nom = 60 Hz."
        answer={
          <>
            <p className="mb-prose-1 last:mb-0">Per-unit power imbalance:</p>
            <Formula>ΔP / P<sub>base</sub> = 500 MW / 10 000 MW = 0.05 pu</Formula>
            <p className="mb-prose-1 last:mb-0">Swing equation:</p>
            <Formula>df/dt = − (ΔP / P<sub>base</sub>) · f<sub>nom</sub> / (2H) = − 0.05 · 60 / (2 · 4)</Formula>
            <Formula>df/dt = <strong className="text-text font-medium">−0.375 Hz/s</strong></Formula>
            <p className="mb-prose-1 last:mb-0">
              That's a steep but recoverable RoCoF for a typical Western Interconnection — governors begin responding
              within a second and arrest the fall well before any under-frequency load-shedding scheme kicks in. Halve
              <em className="italic text-text"> H</em> to 2 s (an inverter-heavy grid) and the same outage produces −0.75 Hz/s — at the edge of
              what conventional protection relays can ride through<Cite id="kundur-1994-power-stability" in={SOURCES} />.
            </p>
          </>
        }
      />

      <h2 className="chapter-h2">What we have so far</h2>

      <p className="mb-prose-3">
        Faraday's <em className="italic text-text">ℰ = − dΦ/dt</em> says that a moving magnet in a coil makes voltage. Wrap that into the
        rotational geometry of Chapter 16, drive the rotor mechanically instead of electrically, and you get a
        generator — the inverse of every machine in the last chapter. Three stator windings 120° apart give you the
        three-phase AC that the whole continental grid runs on. Shrink the same topology, add a 6-diode bridge, and
        you have the alternator on every car. Synchronising any of these to a live grid requires matching frequency,
        phase, and voltage; once on the bus, every generator does its share of a real-time load-following dispatch
        because energy can't be stored. The grid frequency itself is the universal control signal: when load exceeds
        generation, the machines slow down; when generation exceeds load, they speed up. Ten thousand machines
        scattered across a continent, all spinning at exactly the same electrical rate, indefinitely.
      </p>
      <p className="mb-prose-3">
        Next chapter: the chemistry of the battery, which sits across the grid as a buffer (and across your phone as
        the whole power supply).
      </p>

      <CaseStudies
        intro={
          <>
            Four generators spanning seven orders of magnitude in output, from a 700 MW dam unit to a 2 MW backup diesel.
          </>
        }
      >
        <CaseStudy
          tag="Case 17.1"
          title="Three Gorges Dam — 22.5 GW of synchronous generators"
          summary="32 main turbine-generators, 700 MW each, in two powerhouses on the Yangtze; the largest hydroelectric installation ever built."
          specs={[
            { label: 'Total installed capacity', value: <>22.5 GW (32 × 700 MW main units + 2 × 50 MW station-service)</> },
            { label: 'Generator type', value: <>3-phase synchronous, water-cooled stator <Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} /></> },
            { label: 'Pole count', value: <>typically 80 poles per machine (large hydro)</> },
            { label: 'Frequency', value: <>50 Hz (Chinese national grid)</> },
            { label: 'Rotational speed', value: <>~75 RPM (n_s = 120·50/80 = 75)</> },
            { label: 'Annual generation', value: <>~95–112 TWh/year, depending on water availability</> },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            Three Gorges is the largest hydroelectric facility ever constructed. The thirty-two main 700 MW units sit in
            two underground powerhouses inside the dam, each unit consisting of a vertical-shaft Francis turbine
            coupled to a 3-phase synchronous generator with around 80 poles. At 50 Hz that gives a synchronous shaft
            speed of about 75 RPM — appropriately slow for the Francis runner's 80 m hydraulic head, which would
            cavitate at higher tip speeds. The generator rotor is a wound construction with DC field excitation
            supplied through slip rings<Cite id="kundur-1994-power-stability" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            The stator is water-cooled — necessary at 700 MW output because copper-loss density becomes too large for
            forced-air cooling to handle within a reasonable physical envelope. Insulated hollow copper conductors
            carry both the AC current and the cooling water; the design isolates the cooling-water loop electrically
            from the high-voltage stator winding through long sections of insulating hose. Output is at the
            generator terminals at typically 20 kV, then stepped up by adjacent transformer banks to 500 kV for
            transmission across China's UHV grid<Cite id="grainger-power-systems-2003" in={SOURCES} />.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 17.2"
          title="Hoover Dam — 17 generators, ~2 GW, 60 Hz"
          summary="Mid-century American hydro: vertical-shaft Francis turbines driving 80–135 MW synchronous generators each."
          specs={[
            { label: 'Total installed capacity', value: <>~2.08 GW (after 1986–93 uprate); originally 1.34 GW (1936)</> },
            { label: 'Number of generators', value: <>17 (currently 13 large + 4 smaller)</> },
            { label: 'Generator type', value: <>3-phase synchronous, vertical shaft <Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} /></> },
            { label: 'Hydraulic head', value: <>~180 m (Lake Mead full pool)</> },
            { label: 'Frequency', value: <>60 Hz (Western Interconnection)</> },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            Hoover Dam, completed in 1936, anchors the Western Interconnection. Its 17 generators have been uprated
            twice — original 1936 stators in many cases, replaced rotors and windings — and now produce roughly
            2 GW peak. Each unit has a Francis turbine spinning at 180 RPM and an alternator with 40 poles producing
            60 Hz at the synchronous speed <em className="italic text-text">n<sub>s</sub> = 120·60/40 = 180 RPM</em>. The slow rotation accommodates
            the high static head from Lake Mead without cavitating the runner<Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            Hoover's role on the WECC grid is partly baseload (the run-of-river share) and partly peaking and
            ancillary services — it can ramp from 0 to full output in roughly 10 minutes and provides voltage support
            and spinning reserve to the Phoenix, Las Vegas, and Los Angeles load centres. The whole installation
            illustrates a property of hydro that thermal plants lack: nearly the entire kinetic energy of the water
            converts to electricity, with synchronous-generator efficiencies above 0.97 and overall water-to-wire
            efficiency around 0.90<Cite id="grainger-power-systems-2003" in={SOURCES} />.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 17.3"
          title="A 3 MW wind turbine"
          summary="A direct-drive permanent-magnet synchronous generator, output frequency varying with wind speed, connected to the grid through a back-to-back inverter."
          specs={[
            { label: 'Generator type', value: <>direct-drive PMSG, ~100+ poles <Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} /></> },
            { label: 'Mechanical speed', value: <>~10–18 RPM (variable with wind)</> },
            { label: 'Electrical frequency at generator', value: <>~10–30 Hz (variable)</> },
            { label: 'Grid interface', value: <>full-power back-to-back inverter</> },
            { label: 'Typical rating', value: <>2–4 MW for on-shore; 8–15 MW for current off-shore designs</> },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            Modern utility wind turbines decouple themselves from the grid frequency through power electronics. The
            generator is a permanent-magnet synchronous machine with around a hundred poles on the rotor, sitting
            directly on the slow-turning hub shaft (10–18 RPM). At those speeds with that many poles, the electrical
            output frequency lands somewhere in the 10–30 Hz range, varying with wind speed. A full-power back-to-back
            inverter rectifies the variable-frequency AC to a DC link, then re-inverts it as a 50 or 60 Hz grid-
            synchronous output<Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            This decoupling is what makes variable-speed wind operation possible. The turbine blades can run at the
            speed that extracts the most power from the wind at any given moment (the maximum-power-point), while the
            grid interface delivers a clean 60 Hz current independent of shaft speed. The trade-off is that the
            inverter must handle the full machine rating — a 3 MW turbine needs a 3 MW power-electronics stack —
            rather than just a small slip-control fraction (as in older doubly-fed induction-generator turbines).
            The grid-side inverter also has to provide synthetic inertia: faking the frequency-supporting behaviour
            of a synchronous machine, because there's no physical rotating mass on the grid side<Cite id="kundur-1994-power-stability" in={SOURCES} />.
          </p>
        </CaseStudy>

        <CaseStudy
          tag="Case 17.4"
          title="2 MW diesel-generator at a data center"
          summary="A 16-cylinder diesel engine coupled to a 3-phase synchronous generator with an automatic transfer switch; ready in under 10 seconds when grid power drops."
          specs={[
            { label: 'Engine', value: <>~16-cylinder 4-stroke V-configuration turbocharged diesel</> },
            { label: 'Output', value: <>2 MW continuous, 2.2 MW standby <Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} /></> },
            { label: 'Generator', value: <>4-pole 3-phase synchronous, ~1800 RPM at 60 Hz</> },
            { label: 'Voltage', value: <>typically 480 V line-to-line for data center bus</> },
            { label: 'Time to full load', value: <>~10 s from cold start (engine + voltage regulator)</> },
            { label: 'Fuel storage', value: <>typically 24–72 hours of run-time on-site</> },
          ]}
        >
          <p className="mb-prose-2 last:mb-0">
            Every Tier-III or higher data center has multiple of these — typically <em className="italic text-text">N+1</em> or <em className="italic text-text">2N</em>
            redundancy on the standby generation. The unit is a turbocharged V16 diesel engine direct-coupled to a
            4-pole synchronous generator. At 60 Hz the rotor turns at 1800 RPM, well within the diesel's optimal
            torque range. The engine is constantly trickle-warmed (block heater + glow plugs) so it can start under
            load within a few seconds; the voltage regulator brings the output up to nominal in a few cycles after
            crank-start<Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />.
          </p>
          <p className="mb-prose-2 last:mb-0">
            An automatic transfer switch monitors the utility bus continuously. When grid voltage falls outside
            tolerance (typically ±10 %, sustained for ~50 ms), the ATS opens the utility-side breaker, signals the
            generator to start, waits for the generator to reach nominal voltage and frequency, and then closes the
            generator-side breaker. Total elapsed time: 5–10 seconds, during which the data center runs off battery
            UPS. When utility power returns, the ATS reverses the process: synchronises the generator to the bus,
            closes the utility breaker, opens the generator breaker, and lets the generator wind down. The grid is
            the primary; the generator is a fall-back. Some facilities also run the generator periodically as part
            of a demand-response program, exporting power to the grid during peak hours<Cite id="grainger-power-systems-2003" in={SOURCES} />.
          </p>
        </CaseStudy>
      </CaseStudies>

      <FAQ
        intro="Loose threads — the questions a careful reader tends to surface after going through this chapter."
      >
        <FAQItem q="Why is the grid frequency exactly 60 Hz in North America and 50 Hz in Europe?">
          <p>
            Historical accident. Early generators were limited by mechanical and thermal considerations in their
            iron and copper, and a "high-frequency" design (the early Westinghouse 60 Hz standard from the 1890s)
            won out in North America while AEG's 50 Hz standard won in Germany and from there spread across Europe.
            Both are workable: 60 Hz gives slightly smaller transformers; 50 Hz gives slightly easier insulation. The
            two systems have been frozen in place for over a century because changing one country's frequency means
            replacing every motor, transformer, and clock in the country<Cite id="grainger-power-systems-2003" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why is grid frequency held so precisely at the nominal value?">
          <p>
            For two reasons. First, every synchronous machine on the grid is mechanically locked to it — change the
            frequency by 1 % and you're changing the rotational speed of ten thousand machines simultaneously,
            with mechanical and operational consequences. Second, synchronous clocks (utility-grade wall clocks,
            older microwave-oven displays, every "60 Hz clock chip" in old electronics) count grid cycles directly,
            and a long-term frequency drift accumulates as time-of-day error. North American grid operators historically
            held the long-term time error within ±10 s using deliberate frequency adjustments; modern practice has
            relaxed this<Cite id="kundur-1994-power-stability" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why do generators produce AC instead of DC at the source?">
          <p>
            Geometry. A coil rotating in a fixed field naturally produces a sinusoidal voltage — the time derivative
            of a cosine flux is a sine EMF. To get steady DC out of the same machine you have to either commutate
            mechanically (brushes + commutator, with all the wear problems of Chapter 16's brushed motor) or
            commutate electronically with a diode rectifier downstream. For utility transmission, AC has the
            additional huge advantage that it can be transformed up to high voltage for transmission and back down
            to safe-handling voltage for delivery — something that's only become practical for DC in the last few
            decades with high-power semiconductor inverters<Cite id="grainger-power-systems-2003" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why does spinning a generator faster make more voltage but the same frequency relationship?">
          <p>
            Both go up together — that's the point. EMF peak ∝ ω (Faraday's law as <em className="italic text-text">NBAω</em>), and frequency ∝ ω
            (the same rotation produces the sinusoid). So a generator at twice the shaft speed produces twice the
            voltage at twice the frequency. To stay synchronised to a fixed-frequency grid, the shaft speed must be
            fixed at synchronous speed — you can't trade off shaft speed against voltage. To make more voltage, you
            increase the rotor's field current (in a wound-rotor machine) or you wind more stator turns at design
            time<Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What is reactive power and why does the grid worry about it?">
          <p>
            Real power is V·I·cos(φ) — the part of the current that's in phase with the voltage and actually delivers
            energy to the load. Reactive power is V·I·sin(φ) — the part 90° out of phase, which sloshes back and forth
            between source and load each cycle without net energy transfer. Inductive loads (motors, transformers)
            absorb reactive power; capacitive loads (long lines, certain rectifier loads) produce it. The grid has to
            supply both, because inductive currents still flow through the transmission system and contribute to I²R
            heating in the wires. Synchronous generators control their reactive output by adjusting field current —
            over-excited gives capacitive (leading) VARs; under-excited gives inductive (lagging) VARs<Cite id="kundur-1994-power-stability" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why do inverter-based renewables 'lack inertia,' and why does the grid care?">
          <p>
            Synchronous generators store kinetic energy in their rotors — a 600 MW unit at 1800 RPM stores tens of
            megajoules in its spinning mass. When grid load suddenly exceeds generation, that stored kinetic energy
            converts to electrical output for the first second or two, smoothing the frequency dip while governors
            respond. Inverter-based renewables (wind, solar) have no equivalent stored kinetic energy on the grid
            side — the inverter just synthesises whatever waveform the controller asks for. Modern grid-forming
            inverters provide <em className="italic text-text">synthetic inertia</em> by mimicking the kinetic-energy release in firmware, but
            doing it well at scale is still a current research and standards-development area<Cite id="kundur-1994-power-stability" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Can a motor really run as a generator just by spinning its shaft?">
          <p>
            Yes — that's literally how regenerative braking works in every EV. Spin a PMSM faster than synchronous and
            its back-EMF exceeds the inverter's DC-link voltage; current flows the other way, charging the battery and
            producing a braking torque on the rotor. An induction motor can also generate: drive its shaft above
            synchronous speed and slip goes <em className="italic text-text">negative</em>; bar currents reverse; the machine delivers power to
            the grid. Wind turbines with squirrel-cage induction generators worked exactly this way until the rise
            of doubly-fed and full-converter topologies in the 2000s<Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What happens if a generator's breaker closes when it's 180° out of phase with the grid?">
          <p>
            The terminal-voltage difference is twice the peak phase voltage (roughly 2√2 × V_rms). The only impedance
            limiting the resulting circulating current is the sum of the generator's transient reactance and the
            grid's source impedance — typically a few percent of rated impedance. So the transient current is
            roughly 20–50 times rated, and it lasts long enough (cycles to seconds) to mechanically deform the
            stator winding's end-turns and to jerk the rotor's shaft hard enough to potentially shear the coupling.
            This is why every modern synchronisation system has a hardwired sync-check relay that vetoes any breaker
            close attempt that fails its window<Cite id="kundur-1994-power-stability" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why do hydro and large thermal plants use 4-pole or 2-pole machines but wind turbines use 100+?">
          <p>
            Because the prime mover's optimal shaft speed differs by two orders of magnitude. A steam or gas turbine
            wants to spin at 3000–3600 RPM for thermodynamic efficiency, matching the 2-pole synchronous speed at
            50/60 Hz. A Francis hydro turbine wants 100–200 RPM for cavitation-free operation, matching 40–80 poles.
            A wind turbine's blades are limited to ~80 m/s tip speed before erosion and noise become problems, which
            on a 60 m-radius blade is about 13 RPM — calling for ~100 poles to get to 60 Hz without a gearbox. The
            pole count is set by matching the mechanical optimum to the grid frequency<Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="How does a car alternator regulate its DC output voltage to ~14 V regardless of engine speed?">
          <p>
            Through the rotor's field current. The alternator's three-phase output is rectified by the diode bridge
            and fed to the battery and the car's bus. A separate <em className="italic text-text">regulator</em> circuit (now invariably a small
            IC inside the alternator housing) senses the DC bus voltage, compares it to a 14.0 V reference, and
            controls a switch in series with the rotor's field winding. Bus voltage low → close the switch longer →
            more field current → larger rotor flux → larger stator EMF → higher rectified output. The feedback
            handles arbitrary changes in engine speed and load with bandwidth in the kHz range<Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What is the difference between an alternator and a generator?">
          <p>
            In modern usage, "alternator" means an AC machine specifically. "Generator" is the umbrella term covering
            both AC alternators and DC generators (the latter mostly historical — DC generators with brushes and
            commutators are essentially obsolete, replaced by AC alternators plus rectification). In automotive
            usage, "generator" before about 1960 meant a brushed DC machine, while "alternator" was the new 3-phase-
            with-rectifier replacement; the words still carry that historical association. Utility usage just says
            "generator" and means the synchronous AC machine described in this chapter<Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why is the North American grid divided into three asynchronous interconnections?">
          <p>
            Three big AC grids — Eastern Interconnection, Western Interconnection, ERCOT (most of Texas) — run
            internally synchronous but are not synchronised with each other. They tie together only through DC links
            (back-to-back HVDC stations), which decouple the frequencies. The historical reason is that each grew
            from independent regional utilities and was easier to keep separate than to synchronise; the current
            engineering rationale is that a fault in one interconnection cannot cascade into the others. Europe is
            largely one synchronous grid (ENTSO-E Continental Europe), much of the former Soviet space is another,
            and the UK has historically been a third — connected to Europe by HVDC for the same reason<Cite id="grainger-power-systems-2003" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What is the role of pumped-storage hydro?">
          <p>
            Energy time-shifting. At off-peak times (say 3 AM) when generation exceeds demand, surplus electrical
            energy runs the hydro units in reverse — pumping water from a lower reservoir up to a higher one.
            At peak times the water runs back down through the same units now operated as generators. Round-trip
            efficiency is about 75–85 %, which sounds poor compared to a battery (~90–95 %), but pumped hydro is
            the only storage technology that scales economically into the gigawatt-hour range. It's effectively the
            only large-scale grid-storage technology in service today, providing a few hours of peak-shaving for
            many continental grids<Cite id="grainger-power-systems-2003" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Could you in principle build a grid with no synchronous generators at all?">
          <p>
            That's the active question of the 2020s. As renewables grow and inverters replace synchronous machines,
            the grid's combined rotational inertia drops, frequency excursions get faster, and the traditional
            governor-based response can't keep up. Solutions in research and deployment: grid-forming inverters
            (which actively set the local frequency rather than passively following it), synthetic-inertia algorithms
            in wind turbines and battery storage, faster protection relays, and large grid-scale battery installations
            providing primary frequency response. Several smaller island grids (Hawaii, Tasmania) already operate
            at &gt;50 % instantaneous inverter share regularly; the techniques scale, but the regulatory and standards
            framework is still catching up<Cite id="kundur-1994-power-stability" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why are large synchronous generators hydrogen-cooled?">
          <p>
            Because hydrogen has the lowest gas-phase viscosity and the highest thermal conductivity (and specific
            heat per unit mass) of any practical fluid. Windage losses inside the machine's gas-filled cavity
            scale with gas density × velocity²; switching from air to hydrogen at 1–3 bar cuts windage by an order of
            magnitude, freeing thermal and mechanical headroom for higher current density in the stator. The
            fire-safety penalty is handled by sealing the housing and continuously monitoring hydrogen purity.
            Essentially every utility generator above ~150 MW is hydrogen-cooled<Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What's the absolute upper limit on synchronous-generator size, and what sets it?">
          <p>
            Current state of the art is roughly 1.6–1.75 GW for a single 4-pole machine running at 1500 or 1800 RPM
            (large nuclear or gas-turbine combined-cycle units). The limit is mechanical: the rotor's
            <em className="italic text-text"> retaining ring</em> at the end of the rotor body must withstand the centrifugal stress of holding
            the end-winding copper in place against forces of order 10⁵ g at the surface. Stator-iron and copper
            losses set a thermal limit too. Doubling the rating in one machine doubles the diameter at constant
            length and constant speed — moving the stress field into uncharted territory for forged-steel rotor
            material<Cite id="fitzgerald-kingsley-umans-2014" in={SOURCES} />.
          </p>
        </FAQItem>
      </FAQ>
    </ChapterShell>
  );
}
