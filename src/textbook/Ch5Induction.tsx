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
    </ChapterShell>
  );
}
