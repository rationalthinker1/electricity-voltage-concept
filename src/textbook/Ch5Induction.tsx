/**
 * Chapter 5 — Induction
 *
 * Six sections, four embedded demos:
 *   5.1 Faraday's discovery
 *   5.2 The law (EMF = −dΦ/dt) and its consequences
 *   5.3 Move a magnet, get a voltage   → <MagnetThroughCoilDemo/>
 *   5.4 The minus sign — Lenz's law    → <LenzsLawDemo/>
 *   5.5 Spinning a coil = AC           → <RotatingCoilDemo/>
 *   5.6 Transformers                   → <TransformerDemo/>
 *
 * Cite only from chapter.sources. Match Ch1 voice.
 */
import { ChapterShell } from '@/components/ChapterShell';
import { FAQ, FAQItem } from '@/components/FAQ';
import { Cite } from '@/components/SourcesList';
import { LenzsLawDemo } from './demos/LenzsLaw';
import { MagnetThroughCoilDemo } from './demos/MagnetThroughCoil';
import { RotatingCoilDemo } from './demos/RotatingCoil';
import { TransformerDemo } from './demos/Transformer';
import { getChapter } from './data/chapters';

export default function Ch5Induction() {
  const chapter = getChapter('induction')!;
  const SOURCES = chapter.sources;

  return (
    <ChapterShell chapter={chapter}>
      <p>
        For ten years Michael Faraday tried to make a magnet generate a current. He sat strong permanent magnets next to
        copper coils, wired the coils to galvanometers, and watched the needles do nothing. He braided the wires together,
        wound them on iron rings, swapped magnets for electromagnets — still nothing. The galvanometer needle did not move.
        Whatever the symmetry was between electricity and magnetism, a static magnet did not feed a static loop any current
        at all.
      </p>
      <p>
        Then in August 1831, while connecting one of those electromagnets to its battery, he caught the needle twitching.
        Not while the current flowed steadily, but at the <em>moment of connection</em>, and again at the moment of
        disconnection<Cite id="faraday-1832" in={SOURCES} />. The thing that mattered was not the magnetic field. It was
        the magnetic field <em>changing</em>. Once you can see that distinction, the world reorganises around it.
        Generators, transformers, induction motors, wireless chargers, the wall socket the screen you're reading this on
        is plugged into — all of them are running the same equation that Faraday wrote down in his lab notebook that
        evening.
      </p>

      <h2>Faraday's <em>discovery</em></h2>

      <p>
        The setup that finally worked was a thick iron ring with two coils of insulated copper wire wound on opposite
        sides of it. One coil — the <em>primary</em> — was connected to a bank of voltaic cells through a switch. The
        other — the <em>secondary</em> — was connected to a galvanometer, sitting many feet away to keep its own
        magnetism out of the experiment. When Faraday closed the switch, the primary's current ramped up over a fraction
        of a second, the iron ring magnetised, and the galvanometer needle on the secondary kicked. When he opened the
        switch, the primary's current collapsed, the iron demagnetised, and the needle kicked the other way. In between
        — when the primary current was steady — the secondary did nothing<Cite id="faraday-1832" in={SOURCES} />.
      </p>
      <p>
        Faraday concluded, correctly, that what the secondary was responding to was not the magnetic field but its
        <em> rate of change</em>. He spent the next year confirming this in every form he could think of: bar magnets
        plunged through coils, coils slid past stationary magnets, two coils approaching and retreating from each other
        without ever touching. The pattern held. Move the magnet, or change the current that's making the magnet, or
        change the geometry of the loop, and a voltage appears around the loop. Hold everything still, and nothing
        happens, no matter how strong the field.
      </p>

      <h2>The <em>law</em></h2>

      <p>
        Faraday's insight took its modern compact form a generation later, in Maxwell's hands. Define the magnetic flux
        through a surface bounded by the loop:
      </p>
      <p className="math">Φ<sub>B</sub> = ∫∫ B · dA</p>
      <p>
        For a flat loop in a uniform field, this is just <strong>BA cos θ</strong>, where <strong>θ</strong> is the angle
        between the field and the loop's normal. Then the EMF induced around the loop — the line integral of E around
        its perimeter, the work per unit charge that the loop's own free charges feel — is the negative time derivative
        of that flux<Cite id="feynman-II-17" in={SOURCES} />:
      </p>
      <p className="math">EMF = − dΦ<sub>B</sub> / dt</p>
      <p>
        Three things deserve to be said out loud about this equation. First, the surface in the flux integral is
        <em> any</em> surface bounded by the loop — flat, curved, weirdly shaped, doesn't matter. The integral comes out
        the same, because <strong>∇ · B = 0</strong> guarantees that flux is conserved through closed surfaces and
        therefore depends only on the boundary<Cite id="griffiths-2017" in={SOURCES} />. Second, if the loop is wound
        <strong> N</strong> times around the same flux path, every turn sees the same dΦ/dt and the EMFs add: the total
        is <strong>N · dΦ/dt</strong>. That's why coils have lots of turns. Third, the minus sign is doing real work —
        we'll come back to it.
      </p>
      <p>
        In differential form, the same statement reads <strong>∇ × E = −∂B/∂t</strong>. A magnetic field that changes in
        time produces an electric field that <em>curls</em>. Crucially, this E exists everywhere in space, not just where
        the loop happens to be. The wire is a probe; the field is what's actually there<Cite id="jackson-1999" in={SOURCES} />.
      </p>

      <h2>Move a <em>magnet</em>, get a voltage</h2>

      <p>
        Before unpacking the minus sign or the geometry, just play with it. The cleanest live demonstration is the one
        Faraday himself used: shove a bar magnet through a coil and watch a current come out.
      </p>

      <MagnetThroughCoilDemo />

      <p>
        Two things you can read off the demo immediately. First, holding the magnet still leaves the lamp dark. A
        permanent magnet is sitting right inside the coil delivering a perfectly real magnetic field, and the loop does
        absolutely nothing with it. Second, the faster you move the magnet, the brighter the lamp burns. The induced EMF
        scales with <strong>|dΦ/dt|</strong>, not with <strong>Φ</strong> itself. Drag the turn count up and the lamp
        gets brighter again, because every turn sees the same dΦ/dt and they add in series.
      </p>
      <p>
        The lamp also <em>changes color</em> when you reverse the magnet's direction. That is the minus sign in
        <strong> EMF = −dΦ/dt</strong> made visible: flip the sign of dΦ/dt, flip the sign of the EMF, flip the
        direction the current flows. The next section is what that minus sign actually means.
      </p>

      <h2>The minus sign — <em>Lenz's law</em></h2>

      <p>
        It is tempting to read the minus sign as a bookkeeping detail, an artifact of how someone defined "positive"
        around the loop. It is not. It encodes a hard constraint from energy conservation, articulated by Heinrich Lenz
        in 1834 and provably equivalent to it: <strong>the induced current always flows in the direction that opposes
        the change in flux that produced it</strong><Cite id="feynman-II-17" in={SOURCES} />.
      </p>
      <p>
        Push a magnet's north pole toward a loop and the flux through the loop (in the direction of the magnet's field)
        increases. The induced current organises itself to create its own magnetic field <em>opposing</em> that
        increase — i.e., pointing the other way through the loop. From the magnet's perspective, the loop now looks
        like another north pole pointing back at it. North repels north. You have to <em>do work</em> to push the magnet
        in. That work, against the repulsive force, is exactly the electrical energy dumped into the loop's resistance.
      </p>
      <p>
        Pull the magnet away and the flux through the loop drops. The induced current reverses, now creating a field
        that <em>maintains</em> the dying flux — a south pole facing the magnet's north. North attracts south. You have
        to do work to pull the magnet out, too. Either direction of motion, you pay; either direction of motion, the
        loop gets the energy.
      </p>

      <LenzsLawDemo />

      <p className="pullout">
        Magnetism never <em>moves</em>; only the flux does. Move the flux and electricity falls out — paid for in
        mechanical work, every joule.
      </p>
      <p>
        If the sign were the other way — if the induced current attracted the approaching magnet instead of repelling it
        — the magnet would accelerate as it approached, accelerate again as you tried to pull it back, and along the
        way deliver electrical energy to the loop for free. You'd have a perpetual motion machine on every workbench.
        The minus sign in Faraday's law is the universe quietly insisting that the books balance<Cite id="griffiths-2017" in={SOURCES} />.
      </p>

      <h2>Spinning a coil = generating <em>AC</em></h2>

      <p>
        The historically pivotal application of induction was not anything Faraday explicitly built. It was the realisation
        that you can run his discovery in reverse: instead of moving a magnet to generate a current, you can spin a coil
        in a fixed field and let the geometry do the work. The flux through a flat coil of area <strong>A</strong>
        rotating at angular rate <strong>ω</strong> in a uniform field <strong>B</strong> is
      </p>
      <p className="math">Φ(t) = N B A cos(ω t)</p>
      <p>
        and Faraday's law immediately gives
      </p>
      <p className="math">EMF(t) = − dΦ/dt = N B A ω sin(ω t)</p>
      <p>
        A pure sine wave whose peak is <strong>NBAω</strong>. Crank up <strong>N, B, A,</strong> or <strong>ω</strong>
        and the amplitude grows in proportion. The frequency you get is <strong>f = ω / (2π)</strong>. North American
        wall-outlet power is 60 Hz, which corresponds to a generator shaft turning at <strong>ω = 2π · 60 ≈ 377 rad/s</strong>
        — about 3,600 revolutions per minute. European 50 Hz is the same equation with a different pulley<Cite id="griffiths-2017" in={SOURCES} />.
      </p>

      <RotatingCoilDemo />

      <p>
        Every wall socket on Earth is the far end of a wire connected, eventually, to a coil somewhere upstream that is
        spinning past stator windings inside a steel-and-copper drum the size of a building. The shaft is being turned by
        a steam turbine (coal, gas, nuclear), a water turbine (hydro), a wind turbine, or in a few odd cases by a
        reciprocating engine. The thing that turns the shaft is the only thing that varies between the wildly different
        kinds of power plants — what comes out the electrical end is identical, because the equation governing what
        comes out the electrical end is just <strong>EMF = NBAω sin(ωt)</strong>.
      </p>

      <h2>Transformers and the long-distance <em>grid</em></h2>

      <p>
        Faraday's law has a second consequence that is just as load-bearing for modern infrastructure. Wind two coils
        around a shared iron core and the same flux <strong>Φ(t)</strong> threads both of them. Apply Faraday's law to
        each:
      </p>
      <p className="math">V₁ = N₁ · dΦ/dt &nbsp;&nbsp;&nbsp; V₂ = N₂ · dΦ/dt</p>
      <p>
        Divide and the dΦ/dt cancels exactly, leaving the transformer relation:
      </p>
      <p className="math">V₂ / V₁ = N₂ / N₁</p>
      <p>
        Whatever AC voltage you put on the primary, you get back an AC voltage on the secondary scaled by the turns
        ratio. Step up: more turns on the secondary than the primary. Step down: fewer<Cite id="griffiths-2017" in={SOURCES} />.
        Energy conservation forces a complementary relation on the currents — in the ideal lossless limit,
        <strong> I₂ / I₁ = N₁ / N₂</strong>, so power <strong>VI</strong> is preserved across the transformer. You
        trade volts for amps and back, at a cost (in a real transformer) of a few percent in core and copper losses.
      </p>

      <TransformerDemo />

      <p>
        The reason this matters at planetary scale is the <strong>I²R</strong> loss in transmission lines. The power
        delivered down a wire is <strong>P = V · I</strong>, but the heat dissipated along the way is
        <strong> I² · R<sub>line</sub></strong>. If you can carry the same power at ten times the voltage and a tenth
        the current, your transmission losses drop by a factor of <strong>100</strong>. That is why the grid runs at
        hundreds of kilovolts between the generator and your neighbourhood substation, then steps down through
        successive transformers to the 120 V or 230 V at your wall. The whole edifice exists because transformers
        exist, and transformers exist because the same flux through two coils gives two voltages in proportion to their
        turn counts.
      </p>
      <p>
        Faraday's discovery had one more thing inside it that he didn't see, and that Maxwell did. If a changing
        <strong> B</strong> produces a curling <strong>E</strong> in empty space, then by symmetry — once you add the
        <em>displacement current</em> term to Ampère's law — a changing <strong>E</strong> produces a curling
        <strong> B</strong> in empty space too<Cite id="maxwell-1865" in={SOURCES} />. Pair the two and you have a
        self-sustaining oscillation: E regenerates B, B regenerates E, and the whole disturbance walks off through the
        vacuum at the speed of light. That is electromagnetic radiation, and it is what powers Chapter 6 — where the
        field stops being a mathematical bookkeeper for forces and starts carrying actual energy across actual empty
        space.
      </p>

      <FAQ
        intro={
          <>
            Sharp questions readers keep asking about Faraday's law, Lenz's law, transformers, and where the
            energy actually comes from when a coil lights up.
          </>
        }
      >
        <FAQItem q="Why does a magnet at rest near a coil produce no current, but one in motion does?">
          <p>
            Faraday's law cares about <strong>dΦ/dt</strong>, not <em>Φ</em>. A stationary magnet pins down a perfectly
            real flux through the loop, but the time derivative of a constant is zero, so the EMF around the loop is
            zero<Cite id="feynman-II-17" in={SOURCES} />. Move the magnet and the flux through the loop changes, which
            (by <strong>∇ × E = −∂B/∂t</strong>) means a curling electric field appears in the wire and pushes the
            free electrons around<Cite id="jackson-1999" in={SOURCES} />. This is exactly what Faraday eventually saw
            in 1831, after ten years of staring at static magnets that did nothing<Cite id="faraday-1832" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What is &ldquo;flux,&rdquo; in plain words?">
          <p>
            Magnetic flux is <strong>how many field lines pierce a surface</strong>, weighted by how perpendicular
            they hit it. Formally:
          </p>
          <p className="math">Φ<sub>B</sub> = ∫∫ B · dA</p>
          <p>
            For a flat loop in a uniform field, that's just <strong>BA cos θ</strong>: field strength times area
            times the cosine of the angle between the field and the loop's normal<Cite id="griffiths-2017" in={SOURCES} />.
            Tilt the loop edge-on to the field and Φ goes to zero even though B is unchanged — which is exactly the
            move that makes a rotating generator put out a sine wave.
          </p>
        </FAQItem>

        <FAQItem q="Why is there a minus sign in EMF = −dΦ/dt? What goes wrong without it?">
          <p>
            The minus sign is <strong>Lenz's law</strong>: the induced current always flows so as to <em>oppose</em>
            the change in flux that caused it<Cite id="feynman-II-17" in={SOURCES} />. Without it, the induced
            current would <em>reinforce</em> the change, accelerating the magnet that produced it, which would
            increase the flux further, which would drive more current — a runaway feedback loop powered by nothing.
            The minus sign is the universe's bookkeeping entry that says energy has to come from somewhere: every
            joule of electrical energy in the loop is paid for by mechanical work done against a back-force on the
            magnet<Cite id="griffiths-2017" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Could you generate AC from a stationary coil if the magnetic field were changing on its own?">
          <p>
            Yes, and that's exactly how a <strong>transformer</strong> works. Neither coil moves; an alternating
            current in the primary makes the iron core's <strong>B</strong> oscillate, and the oscillating flux
            through the secondary loop induces an EMF<Cite id="feynman-II-17" in={SOURCES} />. Faraday's law makes no
            distinction between &ldquo;the loop moved&rdquo; and &ldquo;the field changed&rdquo; — only
            <strong> dΦ/dt</strong> appears in the equation<Cite id="griffiths-2017" in={SOURCES} />. The two cases
            even turn out to be the same case viewed from different reference frames, which is one of the things
            that pushed Einstein toward special relativity<Cite id="jackson-1999" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why is a transformer useless on DC?">
          <p>
            A DC current in the primary makes a steady magnetic flux through the core, so <strong>dΦ/dt = 0</strong>
            in the secondary — no induced EMF<Cite id="feynman-II-17" in={SOURCES} />. The only moment a DC primary
            does anything is the instant you <em>switch it on or off</em>, which is precisely the moment Faraday
            saw his galvanometer twitch in 1831<Cite id="faraday-1832" in={SOURCES} />. Edison's DC grid couldn't be
            transformed up and down for transmission for this exact reason; Tesla and Westinghouse won the AC
            argument because AC has a non-zero dΦ/dt by construction<Cite id="griffiths-2017" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Does Lenz's law violate Newton's third law? The magnet seems to feel a &ldquo;back force.&rdquo;">
          <p>
            The opposite, actually — it <em>enforces</em> Newton's third law. When you push a magnet into a coil,
            the induced current produces its own magnetic field that pushes <strong>back</strong> on the magnet with
            exactly the force needed to make the mechanical work you do equal the electrical energy delivered to the
            loop<Cite id="griffiths-2017" in={SOURCES} />. The magnet pushes the loop's current via
            <strong> F = qv × B</strong>, and the loop's induced current pushes the magnet via the equal-and-opposite
            field it generates. Energy conservation and momentum conservation are both intact<Cite id="feynman-II-17" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why does dropping a magnet through a copper tube fall so slowly?">
          <p>
            As the magnet moves down the tube, the flux through each circular cross-section of copper changes
            rapidly. That induces large azimuthal <strong>eddy currents</strong> in the copper, and by Lenz's law
            those currents organise themselves to <em>oppose</em> the changing flux — i.e., they create a field
            that repels the approaching pole and attracts the receding one<Cite id="feynman-II-17" in={SOURCES} />.
            The result is a magnetic drag force proportional to the magnet's velocity, so it falls at terminal
            velocity through the tube with its gravitational potential energy being dumped as I²R heat in the
            copper<Cite id="griffiths-2017" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What's the difference between EMF and voltage?">
          <p>
            <strong>Voltage</strong> is the line integral of a <em>conservative</em> electric field — the kind that
            comes from static charges, where ∮E·dℓ around any closed loop is zero. <strong>EMF</strong> is the line
            integral of <em>any</em> field that does work on charges around a loop, including the curling
            non-conservative E induced by a changing B<Cite id="jackson-1999" in={SOURCES} />. For an induced EMF,
            <strong> ∮ E · dℓ = − dΦ/dt ≠ 0</strong> — the field isn't conservative, so calling it a &ldquo;potential
            difference&rdquo; is technically wrong, even though a voltmeter on the loop reads it just fine<Cite id="feynman-II-17" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Wireless phone chargers work by induction — why are they less efficient than plugs?">
          <p>
            A Qi charger is a loose-coupled air-gap transformer: a primary coil in the pad and a secondary coil in
            the phone, with no iron core threading them<Cite id="griffiths-2017" in={SOURCES} />. Without the core,
            most of the primary's flux leaks into the surrounding air instead of threading the secondary, so the
            coupling coefficient drops well below 1 and a sizable fraction of the input power is wasted as
            resistive losses in the primary and as stray field warming nearby metal. A wall plug, by contrast,
            delivers energy through a conductor with negligible loss until you reach the device. Typical Qi
            efficiency is 60–80% versus 95%+ for a cable<Cite id="feynman-II-17" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why do generators need to be physically big to make big currents?">
          <p>
            The peak EMF from a rotating coil is <strong>NBAω</strong><Cite id="griffiths-2017" in={SOURCES} />.
            Frequency <strong>ω</strong> is fixed by the grid (377 rad/s in North America), and B is capped by the
            saturation field of iron (~1.5 T). That leaves only <strong>N</strong> (turns) and
            <strong> A</strong> (loop area) as engineering knobs, and the current you can draw from the machine is
            bounded by how much copper you can pack into those windings without melting it. Doubling power means
            roughly doubling physical size; that's why a 1-GW turbogenerator is the size of a locomotive and not the
            size of a microwave<Cite id="feynman-II-17" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What's a &ldquo;self-induced EMF&rdquo; versus a &ldquo;mutual&rdquo; one?">
          <p>
            A current in a coil makes its own magnetic flux through itself. If that current changes, its own flux
            changes, and Faraday's law produces an EMF in the same coil opposing the change. That's
            <strong> self-inductance L</strong>, defined by <em>V = −L dI/dt</em><Cite id="griffiths-2017" in={SOURCES} />.
            <strong> Mutual inductance M</strong> is the same idea but between two separate coils: a changing
            current in coil 1 produces a changing flux through coil 2, inducing EMF <em>V₂ = −M dI₁/dt</em>. A
            transformer is engineered to maximise <em>M</em>; a noise-suppression choke is engineered to maximise
            its own <em>L</em><Cite id="feynman-II-17" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Could you make a perpetual motion machine if you could just reverse Lenz's sign?">
          <p>
            That's a tidy way to see why the sign is fixed. If the induced current <em>attracted</em> an approaching
            magnet instead of repelling it, the magnet would accelerate as it entered the coil, do <em>negative</em>
            mechanical work on you, and still pump current through the loop's resistance — energy out of
            nowhere<Cite id="griffiths-2017" in={SOURCES} />. The minus sign in EMF = −dΦ/dt is not a convention; it
            is energy conservation written in field language<Cite id="feynman-II-17" in={SOURCES} />. Build a
            generator that violates it and you've also disproved the first law of thermodynamics.
          </p>
        </FAQItem>

        <FAQItem q="Why does opening a switch on an inductor cause a spark?">
          <p>
            An inductor stores energy <em>½LI²</em> in its magnetic field. When you open the switch, you're trying
            to drive <strong>I</strong> to zero in microseconds, which means <strong>dI/dt</strong> spikes to a huge
            negative number. The self-induced EMF <em>V = −L dI/dt</em> spikes to a correspondingly huge
            <em>positive</em> voltage — often hundreds or thousands of volts across a small motor coil — and that
            voltage ionises the air in the switch gap and dumps the stored magnetic energy as an arc<Cite id="feynman-II-17" in={SOURCES} />.
            It's the same physics that fires an automotive ignition coil on purpose<Cite id="griffiths-2017" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What is &ldquo;back-EMF&rdquo; in an electric motor?">
          <p>
            A motor is a generator running in reverse, and it can't help being both at once. As soon as the rotor
            spins, its windings cut through the stator's magnetic flux and Faraday's law produces a voltage
            <em> opposing</em> the applied terminal voltage<Cite id="feynman-II-17" in={SOURCES} />. That opposing
            voltage is the back-EMF, and it scales linearly with the shaft speed. The actual current through the
            motor is <em>I = (V<sub>applied</sub> − V<sub>back-EMF</sub>) / R<sub>winding</sub></em> — which is why a
            stalled motor draws huge current (no back-EMF) and a free-spinning motor draws almost none (back-EMF
            nearly cancels the supply)<Cite id="griffiths-2017" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why does the grid run at 50 or 60 Hz instead of 1 Hz or 1 kHz?">
          <p>
            It's a compromise. Too low and you'd see visible flicker on incandescent bulbs and need physically
            larger transformers and motors — the volt-seconds per turn scale as <strong>V/(Nf)</strong>, so halving
            <strong> f</strong> means doubling iron cross-section to avoid saturation<Cite id="griffiths-2017" in={SOURCES} />.
            Too high and the I²R-like <em>eddy-current</em> and <em>hysteresis</em> losses in iron cores grow,
            transmission-line inductive impedance becomes painful, and rotating machinery has to spin faster than
            steel can comfortably handle. 50–60 Hz lands in the sweet spot, which is why both standards survived
            despite being incompatible<Cite id="feynman-II-17" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="Why is a transformer made of laminated iron rather than solid iron?">
          <p>
            Iron is great for guiding flux (high permeability) but it's also a conductor. A solid iron block
            sitting in an oscillating B field is just a one-turn shorted secondary — Faraday's law induces large
            circulating <strong>eddy currents</strong> in the iron itself, which dissipate energy as I²R heat and
            warm the core to no useful end<Cite id="griffiths-2017" in={SOURCES} />. Slicing the core into thin
            insulated laminations perpendicular to the eddy paths breaks those current loops into small ones,
            shrinking the dissipation roughly as the square of the lamination thickness while leaving the magnetic
            permeability untouched<Cite id="jackson-1999" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="How fast does induction &ldquo;communicate&rdquo;? Is it instant?">
          <p>
            No — it propagates at the speed of light. Faraday's law in differential form,
            <strong> ∇ × E = −∂B/∂t</strong>, combined with Maxwell's added displacement current
            <strong> ∇ × B = μ₀ε₀ ∂E/∂t</strong>, has wave solutions travelling at exactly
            <em> c = 1/√(μ₀ε₀)</em><Cite id="maxwell-1865" in={SOURCES} />. So when you change the current in the
            primary, the secondary doesn't feel it &ldquo;instantly&rdquo; — it feels it after the EM disturbance
            crosses the gap at c, which for a benchtop transformer is roughly a nanosecond and below any timescale
            you can measure with normal lab equipment<Cite id="jackson-1999" in={SOURCES} />.
          </p>
        </FAQItem>

        <FAQItem q="What happens to the energy if the secondary of a transformer is open-circuit?">
          <p>
            Almost none flows. With no current path in the secondary, the secondary's induced EMF sits there as an
            open-circuit voltage and does no work. The primary still draws a small <em>magnetising current</em>
            (90° out of phase with the supply voltage) to set up the core flux, but in the ideal lossless limit
            this current is purely reactive — energy flows into the magnetic field for a quarter cycle and back
            out the next quarter<Cite id="feynman-II-17" in={SOURCES} />. Net power delivered is essentially zero;
            the transformer is just an inductor as far as the source is concerned<Cite id="griffiths-2017" in={SOURCES} />.
          </p>
        </FAQItem>
      </FAQ>
    </ChapterShell>
  );
}
