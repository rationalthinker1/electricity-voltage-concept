/**
 * Lab 3.3 — Drift Velocity
 *
 *   v_d = I / (n q A)
 *
 * Single tracked electron uses the REAL v_d (with a time-acceleration factor
 * so that motion is visible within a few seconds of wall-clock). The blue
 * cloud uses a separate visually-scaled bias — explicitly NOT the physics.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { LabGrid, LegendItem } from '@/components/LabLayout';
import { LabShell } from '@/components/LabShell';
import { MaterialSelect } from '@/components/MaterialSelect';
import { MathBlock, Pullout } from '@/components/Prose';
import { Readout } from '@/components/Readout';
import { Cite } from '@/components/SourcesList';
import { Slider } from '@/components/Slider';
import { TryIt } from '@/components/TryIt';
import { MATERIALS, PHYS, pretty, formatTime, type MaterialKey } from '@/lib/physics';
import { BASE_LAB_SOURCES } from '@/labs/data/manifest';

const SLUG = 'drift';
const SOURCES = BASE_LAB_SOURCES[SLUG]!;

// Reference speeds
const VT = 1.57e6;  // Fermi velocity in Cu, m/s (Kittel 2005)
const VS = 2.0e8;   // signal speed in copper, ~⅔ c (LibreTexts §9.3)

export default function DriftLab() {
  const [material, setMaterial] = useState<MaterialKey>('copper');
  const [I, setI] = useState(1.0);
  const [Amm2, setAmm2] = useState(1.0);
  const [resetCount, setResetCount] = useState(0);

  const computed = useMemo(() => {
    const mat = MATERIALS[material]!;
    const A_m2 = Amm2 * 1e-6;
    const n = mat.n;
    const vd = I / (n * PHYS.e * A_m2);
    const t1m = 1 / vd;
    const ratio_t = VT / vd;
    const ratio_s = VS / vd;
    return { n, vd, t1m, ratio_t, ratio_s, matName: mat.name };
  }, [material, I, Amm2]);

  const stateRef = useRef({ material, I, Amm2, computed, resetCount });
  useEffect(() => {
    stateRef.current = { material, I, Amm2, computed, resetCount };
  }, [material, I, Amm2, computed, resetCount]);

  const [trackerDisplay, setTrackerDisplay] = useState({ elapsed: 0, distance_mm: 0 });

  const setupCanvas = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, colors } = info;
    let raf = 0;

    const wireMarginX = 60;
    const N_ELEC = 150;
    type Electron = { x: number; y: number; vx: number; vy: number };
    const electrons: Electron[] = [];

    function layout() {
      const wireLeft = wireMarginX;
      const wireRight = w - wireMarginX;
      const wireCY = h / 2;
      const thickness = Math.max(40, Math.min(160, Math.sqrt(stateRef.current.Amm2 / 1.0) * 80));
      return { wireLeft, wireRight, wireCY, thickness };
    }
    function seed() {
      const { wireLeft, wireRight, wireCY, thickness } = layout();
      electrons.length = 0;
      const top = wireCY - thickness / 2 + 4;
      const bot = wireCY + thickness / 2 - 4;
      for (let i = 0; i < N_ELEC; i++) {
        electrons.push({
          x: wireLeft + Math.random() * (wireRight - wireLeft),
          y: top + Math.random() * (bot - top),
          vx: (Math.random() - 0.5) * 1,
          vy: (Math.random() - 0.5) * 1,
        });
      }
    }
    seed();

    // Tracker: real-physics drift, with time acceleration so motion is visible.
    const tracker = { realDistance_m: 0, elapsed_s: 0 };
    let lastT = performance.now();
    let lastReset = stateRef.current.resetCount;
    let lastA = stateRef.current.Amm2;

    function draw(now: number) {
      const { Amm2, I, material, computed, resetCount } = stateRef.current;
      const dt_ms = Math.min(60, now - lastT);
      lastT = now;
      if (resetCount !== lastReset) {
        lastReset = resetCount;
        tracker.realDistance_m = 0;
        tracker.elapsed_s = 0;
      }
      if (Math.abs(Amm2 - lastA) > 0.01) { lastA = Amm2; seed(); }

      const { wireLeft, wireRight, wireCY, thickness } = layout();
      const top = wireCY - thickness / 2;
      const bot = wireCY + thickness / 2;

      // Time acceleration: aim to make tracker traverse the canvas in ~tens of wall seconds
      const wallSec = dt_ms / 1000;
      const physPerWall = Math.max(1, Math.min(1e12, 0.02 / Math.max(computed.vd, 1e-20)));
      const dt_phys = wallSec * physPerWall;
      tracker.elapsed_s += dt_phys;
      tracker.realDistance_m += computed.vd * dt_phys;

      // Map tracker position: 1 m drift => one canvas span (so it visually traverses in ~50 s)
      let trackerX = wireLeft + (wireRight - wireLeft) * 0.15 + tracker.realDistance_m * (wireRight - wireLeft);
      if (trackerX > wireRight - 8) {
        tracker.realDistance_m = 0;
        tracker.elapsed_s = 0;
        trackerX = wireLeft + (wireRight - wireLeft) * 0.15;
      }

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      // Wire body
      const grd = ctx.createLinearGradient(0, top, 0, bot);
      grd.addColorStop(0, 'rgba(255,107,42,0.08)');
      grd.addColorStop(0.5, 'rgba(255,107,42,0.16)');
      grd.addColorStop(1, 'rgba(255,107,42,0.08)');
      ctx.fillStyle = grd;
      roundRect(ctx, wireLeft, top, wireRight - wireLeft, thickness, 14); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.45)';
      ctx.lineWidth = 1;
      roundRect(ctx, wireLeft, top, wireRight - wireLeft, thickness, 14); ctx.stroke();

      // Scale bars at top-left
      ctx.fillStyle = colors.textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(`physical time: ${formatTime(tracker.elapsed_s)}`, 16, 12);
      ctx.fillText(`drift distance: ${(tracker.realDistance_m * 1000).toFixed(3)} mm`, 16, 28);

      // E field arrow
      ctx.strokeStyle = 'rgba(255,59,110,0.9)';
      ctx.fillStyle = colors.pink;
      ctx.lineWidth = 2;
      const arrLen = 50;
      const arrY = top - 18;
      const arrX = (wireLeft + wireRight) / 2 - arrLen / 2;
      ctx.beginPath(); ctx.moveTo(arrX, arrY); ctx.lineTo(arrX + arrLen, arrY); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(arrX + arrLen, arrY);
      ctx.lineTo(arrX + arrLen - 8, arrY - 5);
      ctx.lineTo(arrX + arrLen - 8, arrY + 5);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,59,110,0.95)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('E', arrX + arrLen + 14, arrY + 4);

      // Electron cloud — VISUAL ONLY drift bias (not the same as the tracker)
      const driftBias = -Math.max(0.02, Math.min(2.0, computed.vd * 1e3));
      ctx.fillStyle = colors.blue;
      for (const e of electrons) {
        e.vx += (Math.random() - 0.5) * 1.8;
        e.vy += (Math.random() - 0.5) * 1.8;
        e.vx *= 0.85; e.vy *= 0.85;
        e.vx += driftBias;
        e.x += e.vx; e.y += e.vy;
        if (e.x < wireLeft + 4) e.x = wireRight - 4;
        if (e.x > wireRight - 4) e.x = wireLeft + 4;
        if (e.y < top + 4) { e.y = top + 4; e.vy = Math.abs(e.vy); }
        if (e.y > bot - 4) { e.y = bot - 4; e.vy = -Math.abs(e.vy); }
        ctx.beginPath(); ctx.arc(e.x, e.y, 1.6, 0, Math.PI * 2); ctx.fill();
      }

      // Tracker dot — uses REAL v_d
      ctx.fillStyle = colors.accent;
      ctx.shadowColor = 'rgba(255,107,42,0.7)';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(trackerX, wireCY, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      // Trail
      ctx.strokeStyle = 'rgba(255,107,42,0.45)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(wireLeft + (wireRight - wireLeft) * 0.15, wireCY);
      ctx.lineTo(trackerX, wireCY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Punchline annotation
      ctx.fillStyle = colors.accent;
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'top';
      ctx.fillText(`An electron's commute: ${formatTime(computed.t1m)} per meter`, w - 16, 12);
      ctx.fillStyle = colors.textDim;
      ctx.fillText(`v_d = ${pretty(computed.vd).replace(/<[^>]+>/g, '')} m/s`, w - 16, 28);

      // Material label below
      ctx.fillStyle = colors.accent;
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(MATERIALS[material]!.name.toUpperCase(), wireLeft, bot + 24);
      ctx.fillStyle = colors.textDim;
      ctx.textAlign = 'right';
      const iLabel = I < 1 ? (I * 1000).toFixed(1) + ' mA' : I.toFixed(2) + ' A';
      ctx.fillText(`I = ${iLabel}   ·   A = ${Amm2.toFixed(2)} mm²`, wireRight, bot + 24);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);

    // Also publish tracker state to React occasionally (not strictly necessary).
    const t = setInterval(() => {
      setTrackerDisplay({
        elapsed: tracker.elapsed_s,
        distance_mm: tracker.realDistance_m * 1000,
      });
    }, 250);

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(t);
    };
  }, []);

  // Currently we don't render trackerDisplay anywhere; keep it for future use.
  void trackerDisplay;

  const labContent = (
    <LabGrid
      canvas={<AutoResizeCanvas height={380} setup={setupCanvas} />}
      legend={
        <>
          <LegendItem swatchColor="var(--blue)" dot>Free electron cloud</LegendItem>
          <LegendItem swatchColor="var(--accent)" dot>Tracked electron</LegendItem>
          <LegendItem swatchColor="var(--pink)">E field direction</LegendItem>
          <LegendItem style={{ marginLeft: 'auto', color: 'var(--accent)' }}>↳ Visual drift scaled; tracker uses real v<sub>d</sub></LegendItem>
        </>
      }
      inputs={
        <>
          <div className="slider-group">
            <div className="slider-head">
              <span className="slider-label"><span className="sym">m</span>Material</span>
              <span className="slider-value">{MATERIALS[material]!.name.toUpperCase()}</span>
            </div>
            <MaterialSelect value={material} onChange={(v) => { setMaterial(v); setResetCount(c => c + 1); }} />
          </div>
          <Slider sym="I" label="Current"
            value={I} min={0.001} max={100} step={0.001}
            format={v => v < 1 ? (v * 1000).toFixed(1) + ' mA' : v.toFixed(3) + ' A'}
            metaLeft="1 mA" metaRight="100 A"
            onChange={(v) => { setI(v); setResetCount(c => c + 1); }}
          />
          <Slider sym="A" label="Cross-section"
            value={Amm2} min={0.1} max={10} step={0.05}
            format={v => v.toFixed(2) + ' mm²'}
            metaLeft="0.1 mm²" metaRight="10 mm²"
            onChange={(v) => { setAmm2(v); setResetCount(c => c + 1); }}
          />
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--text-muted)', letterSpacing: '.1em', lineHeight: 1.6 }}>
            The orange dot's position uses real v<sub>d</sub>.<br />
            Visual drift speed is scaled for visibility.
          </div>
          <button
            type="button"
            className="btn"
            style={{ marginTop: 14, width: '100%' }}
            onClick={() => setResetCount(c => c + 1)}
          >
            Reset tracker
          </button>
        </>
      }
      outputs={
        <>
          <Readout sym="n" label="Free electron density" valueHTML={pretty(computed.n)} unit="1/m³" />
          <Readout sym={<>v<sub>d</sub></>} label="Drift speed" valueHTML={pretty(computed.vd)} unit="m/s" highlight />
          <Readout sym={<>v<sub>d</sub></>} label="Drift speed" valueHTML={pretty(computed.vd * 1000)} unit="mm/s" />
          <Readout sym={<>t<sub>1m</sub></>} label="Time to walk 1 m" value={formatTime(computed.t1m)} />
          <Readout sym={<>v<sub>F</sub></>} label="Thermal/Fermi velocity" valueHTML={pretty(VT)} unit="m/s" />
          <Readout sym={<>r<sub>F/d</sub></>} label="Thermal / drift ratio" valueHTML={pretty(computed.ratio_t)} unit="×" />
          <Readout sym={<>v<sub>s</sub></>} label="Signal speed (~⅔ c)" valueHTML={pretty(VS)} unit="m/s" />
          <Readout sym={<>r<sub>s/d</sub></>} label="Signal / drift ratio" valueHTML={pretty(computed.ratio_s)} unit="×" />
        </>
      }
    />
  );

  const prose = (
    <>
      <h3>Context</h3>
      <p>
        Drift velocity is the average speed at which free charge carriers move through a conductor when a field is applied. It is not the same
        as the thermal speed (the random motion the carriers always have) and it is wildly different from the signal speed (how fast the
        electromagnetic disturbance propagates). In a household copper wire carrying an ampere or two, drift is on the order of <em>tens of
        micrometers per second</em><Cite id="libretexts-conduction" in={SOURCES} /> — so slow that an individual electron takes hours to traverse
        a single meter of wire. The same formula <strong>v<sub>d</sub> = I/(nqA)</strong> applies to electrons in metals, holes in p-type
        semiconductors, ions in electrolytes, and Cooper pairs in superconductors (where it's still defined even though scattering vanishes).
        It breaks down only when the carrier population is itself time-dependent (transients) or when <em>n</em> is field-dependent (high-injection
        semiconductors).
      </p>

      <h3>Formula</h3>
      <MathBlock>J = n q v<sub>d</sub>,   v<sub>d</sub> = I / (n q A)</MathBlock>
      <MathBlock>v<sub>d</sub> = μ<sub>e</sub> E,   μ<sub>e</sub> = q τ / m</MathBlock>
      <p>
        Where <strong>J</strong> is current density (A/m²), <strong>n</strong> is free-carrier density (1/m³), <strong>q</strong> is the charge
        per carrier (C; for electrons 1.6×10⁻¹⁹ C), <strong>v<sub>d</sub></strong> is the drift speed (m/s), <strong>I</strong> is the total
        current (A), <strong>A</strong> is the cross-section (m²), <strong>μ<sub>e</sub></strong> is the carrier mobility (m²/(V·s)),
        <strong> E</strong> is the field driving the drift (V/m), <strong>τ</strong> is the mean time between collisions (s), and
        <strong> m</strong> is the carrier's effective mass.
      </p>

      <h3>Intuition</h3>
      <p>
        Picture a marching crowd of <em>n</em> people per square meter, each carrying a fixed bag of cargo <em>q</em>, all walking through a
        cross-section <em>A</em> at average speed <em>v<sub>d</sub></em>. The rate at which cargo crosses the area is
        <strong> (people per volume) × (cargo each) × (area) × (speed)</strong> = <strong>n q A v<sub>d</sub></strong>. That's the current.
        Rearranged: to deliver a given current, you can either speed everyone up, widen the corridor, or use more people. In copper, <em>n</em>
        is so vast (about 8.5×10²⁸ per m³<Cite id="ashcroft-mermin-1976" in={SOURCES} />) that even a glacial drift carries a hefty current.
      </p>
      <Pullout>
        Three speeds live inside the same wire at once: <em>drift</em> (millimeters per second), <em>thermal/Fermi</em> (a million meters per second),
        and <em>signal</em> (a hundred million meters per second). They are spread across <strong>fourteen orders of magnitude</strong>.
      </Pullout>

      <h3>Reasoning</h3>
      <p>
        Why is the formula <strong>multiplicative</strong> rather than additive? Because all four factors contribute independently to how much
        charge crosses a plane per second. Doubling any one of them doubles the current — and the units fall out: (1/m³)·(C)·(m/s)·(m²) = C/s = A.
      </p>
      <p>
        Why is drift proportional to E (not to E² or to √E)? Because the Drude picture has a single time constant τ between scattering events.
        An electron accelerates from rest for an average time τ, gaining velocity qE τ / m, then loses its drift component to a collision and
        restarts. The mean steady-state drift is therefore <strong>v<sub>d</sub> = qτE/m</strong>: linear in E because both the acceleration and
        the gain time are linear in their own variables<Cite id="drude-1900" in={SOURCES} />. Mobility μ = qτ/m is the constant of proportionality
        and a pure material property.
      </p>
      <p>
        Why is drift so much slower than thermal? Because thermal/Fermi motion is isotropic — equal in every direction, summing to zero — while
        drift is a tiny bias on top of that swarm. The same electrons that are moving at a million m/s in random directions also have a uniform
        downstream nudge of a fraction of a millimeter per second<Cite id="kittel-2005" in={SOURCES} />.
      </p>

      <h3>Derivation</h3>
      <p>
        <em>Geometric step (current from carriers).</em> Consider a slab of conductor with cross-section A perpendicular to the current. In a
        time dt, every carrier within a distance v<sub>d</sub>·dt of the slab crosses it. That swept volume is A·v<sub>d</sub>·dt, containing
        n·A·v<sub>d</sub>·dt carriers. Each carries charge q, so:
      </p>
      <MathBlock>dQ = n q A v<sub>d</sub> dt   ⇒   I = dQ/dt = n q v<sub>d</sub> A</MathBlock>
      <p>Divide by A to get current density:</p>
      <MathBlock>J = n q v<sub>d</sub></MathBlock>
      <p>
        <em>Dynamical step (drift from E).</em> In the Drude picture, between collisions an electron obeys F = ma:
      </p>
      <MathBlock>m dv/dt = q E   ⇒   v(t) = (qE/m) t  (for t &lt; τ)</MathBlock>
      <p>
        Each collision randomizes the velocity, erasing the field-acquired component. Averaged over a collision interval τ:
      </p>
      <MathBlock>⟨v⟩ = v<sub>d</sub> = (q τ / m) E = μ<sub>e</sub> E</MathBlock>
      <p>
        <em>Combining the two.</em> Substitute v<sub>d</sub> back into J:
      </p>
      <MathBlock>J = n q v<sub>d</sub> = (n q² τ / m) E ≡ σ E</MathBlock>
      <p>
        Conductivity is read off as σ = nq²τ/m — and equivalently σ = nqμ<sub>e</sub><Cite id="ashcroft-mermin-1976" in={SOURCES} />. The
        ridiculously short τ (~2×10⁻¹⁴ s in copper at room temperature<Cite id="libretexts-conduction" in={SOURCES} />) is exactly why electrons
        forget their field-acquired velocity ~50 trillion times per second — and exactly why Ohm's law is linear: drift is the equilibrium
        between "getting pushed" and "forgetting you were pushed."
      </p>

      <h3>Worked problems</h3>

      <p>
        Reference numbers for copper: n ≈ 8.5×10²⁸ /m³<Cite id="ashcroft-mermin-1976" in={SOURCES} />, q = 1.6×10⁻¹⁹ C, Fermi velocity v<sub>F</sub>
        ≈ 1.57×10⁶ m/s<Cite id="kittel-2005" in={SOURCES} />, mean free time τ ≈ 2×10⁻¹⁴ s<Cite id="libretexts-conduction" in={SOURCES} />.
      </p>

      <TryIt
        tag="Problem 3.3.1"
        question={<>A copper wire of cross-section 1 mm² carries 1 A. Compute the drift velocity.</>}
        answer={
          <>
            <MathBlock>v<sub>d</sub> = I / (n q A) = 1 / (8.5×10²⁸ · 1.6×10⁻¹⁹ · 1×10⁻⁶)</MathBlock>
            <MathBlock>v<sub>d</sub> ≈ 7.4×10⁻⁵ m/s ≈ 0.074 mm/s</MathBlock>
            <p>
              Answer: about <strong>74 µm/s</strong>. A snail beats this by an order of magnitude. The huge n is what forces the speed to be so
              small for a respectable current.
            </p>
          </>
        }
      />

      <TryIt
        tag="Problem 3.3.2"
        question={<>The same copper wire from Problem 3.3.1. What electric field exists inside it during the 1 A flow?</>}
        hint={<>Use J = σE with σ<sub>Cu</sub> ≈ 5.96×10⁷ S/m<Cite id="crc-resistivity" in={SOURCES} />.</>}
        answer={
          <>
            <MathBlock>J = I / A = 1 / 1×10⁻⁶ = 10⁶ A/m²</MathBlock>
            <MathBlock>E = J / σ = 10⁶ / 5.96×10⁷ ≈ 1.68×10⁻² V/m</MathBlock>
            <p>
              Answer: about <strong>17 mV/m</strong> — milivolts per meter. Across 1 m of wire that's 17 mV total drop. Now check consistency
              with mobility: v<sub>d</sub> = μ<sub>e</sub> E. Copper's electron mobility μ<sub>e</sub> ≈ 4.4×10⁻³ m²/(V·s), giving
              v<sub>d</sub> ≈ 4.4×10⁻³ · 1.68×10⁻² ≈ 7.4×10⁻⁵ m/s — matches Problem 3.3.1 exactly.
            </p>
          </>
        }
      />

      <TryIt
        tag="Problem 3.3.3"
        question={<>How long does a single electron take to drift from one end of a 1 m copper wire to the other, at the conditions of Problem 3.3.1?</>}
        answer={
          <>
            <MathBlock>t = L / v<sub>d</sub> = 1 / 7.4×10⁻⁵ ≈ 1.35×10⁴ s</MathBlock>
            <p>
              Answer: about <strong>3.75 hours</strong>. The bulb doesn't wait for any specific electron to make this trip. The signal — the
              field — arrives in nanoseconds, and the electrons that are <em>already there</em> in the filament begin drifting in place.
            </p>
          </>
        }
      />

      <TryIt
        tag="Problem 3.3.4"
        question={<>If μ<sub>e</sub> ≈ 4.4×10⁻³ m²/(V·s) for copper and the typical Fermi velocity is v<sub>F</sub> ≈ 1.57×10⁶ m/s, estimate the mean free path between collisions.</>}
        hint={<>τ = μ<sub>e</sub> m / q; λ = v<sub>F</sub> τ.</>}
        answer={
          <>
            <MathBlock>τ = μ<sub>e</sub> m<sub>e</sub> / q = (4.4×10⁻³ · 9.11×10⁻³¹) / 1.6×10⁻¹⁹ ≈ 2.5×10⁻¹⁴ s</MathBlock>
            <MathBlock>λ = v<sub>F</sub> τ ≈ 1.57×10⁶ · 2.5×10⁻¹⁴ ≈ 39 nm</MathBlock>
            <p>
              Answer: <strong>λ ≈ 40 nm</strong>. About 150 lattice spacings — electrons travel for roughly 150 atoms before scattering. That's
              why metals look transparent to charge transport at these length scales, and why nanowires thinner than λ have anomalously large
              resistance (surface scattering dominates).
            </p>
          </>
        }
      />

      <TryIt
        tag="Problem 3.3.5"
        question={<>Why doesn't a light bulb wait for electrons to "arrive" at the speed v<sub>d</sub>?</>}
        answer={
          <>
            <p>
              Because the signal that turns on the bulb is the <em>electromagnetic field</em>, not any specific electron. When you close the
              switch, the field propagates through the space around the wire at roughly two-thirds the speed of light — about 2×10⁸ m/s in
              copper-insulated geometries<Cite id="libretexts-conduction" in={SOURCES} />. That's <strong>~10¹³</strong> times faster than drift.
              When the field reaches a given segment of filament, the electrons that were <em>already in place there</em> start drifting and
              colliding with the lattice, heating it and making it glow. Nothing had to traverse the wire end-to-end.
            </p>
          </>
        }
      />

      <TryIt
        tag="Problem 3.3.6"
        question={<>A semiconductor has n = 10¹⁷ /m³ free carriers. The same 1 A through 1 mm² cross-section. What is v<sub>d</sub>?</>}
        answer={
          <>
            <MathBlock>v<sub>d</sub> = 1 / (10¹⁷ · 1.6×10⁻¹⁹ · 10⁻⁶) ≈ 6.25×10⁷ m/s</MathBlock>
            <p>
              Answer: <strong>≈ 6×10⁷ m/s</strong> — a fifth of the speed of light, which is impossible. The semiconductor would saturate (its
              mobility caps out) and break down (avalanche) long before. Real lightly-doped semiconductors simply can't carry 1 A through
              1 mm² in steady state. Carrier density and current density are bound together — that's why heavily-doped contacts and
              high-mobility channels are how modern transistors get their current.
            </p>
          </>
        }
      />

      <TryIt
        tag="Problem 3.3.7"
        question={<>From σ = nq²τ/m, derive the scattering time τ for copper given σ = 5.96×10⁷ S/m and n = 8.5×10²⁸/m³.</>}
        answer={
          <>
            <MathBlock>τ = σ m<sub>e</sub> / (n q²) = (5.96×10⁷ · 9.11×10⁻³¹) / (8.5×10²⁸ · (1.6×10⁻¹⁹)²)</MathBlock>
            <MathBlock>τ ≈ 2.5×10⁻¹⁴ s</MathBlock>
            <p>
              Answer: about <strong>25 femtoseconds</strong>. Matches the canonical Drude number<Cite id="libretexts-conduction" in={SOURCES} />.
              Free electrons in copper randomize their direction roughly 4×10¹³ times per second; the lattice is the source of that
              randomization.
            </p>
          </>
        }
      />

      <TryIt
        tag="Problem 3.3.8"
        question={<>Why is J = nqv<sub>d</sub> and not some other power of v<sub>d</sub>? Justify geometrically.</>}
        answer={
          <>
            <p>
              Because <em>flux equals density times velocity</em> — a universal geometric statement for any transported quantity. In a time
              <em> dt</em>, the slab of carriers within distance v<sub>d</sub>·dt of a cross-section sweeps through it. That slab has volume
              A·v<sub>d</sub>·dt and contains n·A·v<sub>d</sub>·dt carriers. Each carries charge q. Charge crossing per unit area per unit time
              is therefore nq·v<sub>d</sub>. No higher power of v<sub>d</sub> appears because the relationship is purely kinematic — a
              counting argument.
            </p>
          </>
        }
      />

      <TryIt
        tag="Problem 3.3.9"
        question={<>Derive resistivity ρ from n, q, and μ<sub>e</sub>.</>}
        answer={
          <>
            <MathBlock>σ = n q μ<sub>e</sub>   ⇒   ρ = 1/σ = 1 / (n q μ<sub>e</sub>)</MathBlock>
            <p>
              Resistivity falls when either the carrier density or the mobility rises. Doping a semiconductor raises n; cleaning up scattering
              centers (purer crystal, lower temperature) raises μ<sub>e</sub>. Both knobs are in play in real device engineering<Cite id="ashcroft-mermin-1976" in={SOURCES} />.
            </p>
          </>
        }
      />

      <TryIt
        tag="Problem 3.3.10"
        question={<>The Hall effect: a current I flows along x in a slab of thickness t, in a magnetic field B along z. A transverse voltage V<sub>H</sub> appears along y. Show that V<sub>H</sub> = IB/(nqt), and explain how this is used to measure n.</>}
        answer={
          <>
            <p>
              At steady state the Lorentz force on each carrier (qv<sub>d</sub>×B) is balanced by an electric force qE<sub>y</sub>:
            </p>
            <MathBlock>q v<sub>d</sub> B = q E<sub>y</sub>   ⇒   E<sub>y</sub> = v<sub>d</sub> B</MathBlock>
            <p>The Hall voltage across width w is V<sub>H</sub> = E<sub>y</sub>·w. With v<sub>d</sub> = I/(nq·t·w):</p>
            <MathBlock>V<sub>H</sub> = (I / (n q t w)) · B · w = I B / (n q t)</MathBlock>
            <p>
              Answer: <strong>V<sub>H</sub> = IB/(nqt)</strong>. Measure V<sub>H</sub> at known I, B, t, and solve for n. This is how
              semiconductor carrier densities are routinely measured, and also how the sign of the carrier (electron vs. hole) is determined
              from the sign of V<sub>H</sub>.
            </p>
          </>
        }
      />

      <TryIt
        tag="Problem 3.3.11"
        question={<>AWG 16 copper wire has a cross-section ~1.31 mm². It carries 1 A. How many electrons cross any cross-section per second?</>}
        answer={
          <>
            <MathBlock>I = 1 A = 1 C/s</MathBlock>
            <MathBlock>N = I / q = 1 / 1.6×10⁻¹⁹ ≈ 6.25×10¹⁸ electrons/s</MathBlock>
            <p>
              Answer: about <strong>6.25 billion billion electrons per second</strong>. Each one moving glacially slowly — the count is what
              makes the ampere a respectable unit. (And note: this answer doesn't depend on the wire size, the material, or anything else.
              It's purely the definition of the ampere.)
            </p>
          </>
        }
      />
    </>
  );

  return (
    <LabShell
      slug={SLUG}
      labSubtitle="Tracking a Single Electron"
      labId="drift-3.3 / v_d = I/(nqA)"
      labContent={labContent}
      prose={prose}
    />
  );
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  r = Math.min(r, h / 2, w / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
