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
    const { ctx, w, h } = info;
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

      ctx.fillStyle = '#0d0d10';
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
      ctx.fillStyle = 'rgba(160,158,149,0.85)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(`physical time: ${formatTime(tracker.elapsed_s)}`, 16, 12);
      ctx.fillText(`drift distance: ${(tracker.realDistance_m * 1000).toFixed(3)} mm`, 16, 28);

      // E field arrow
      ctx.strokeStyle = 'rgba(255,59,110,0.9)';
      ctx.fillStyle = 'rgba(255,59,110,0.9)';
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
      ctx.fillStyle = '#5baef8';
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
      ctx.fillStyle = '#ff6b2a';
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
      ctx.fillStyle = '#ff6b2a';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'top';
      ctx.fillText(`An electron's commute: ${formatTime(computed.t1m)} per meter`, w - 16, 12);
      ctx.fillStyle = 'rgba(160,158,149,0.85)';
      ctx.fillText(`v_d = ${pretty(computed.vd).replace(/<[^>]+>/g, '')} m/s`, w - 16, 28);

      // Material label below
      ctx.fillStyle = '#ff6b2a';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(MATERIALS[material]!.name.toUpperCase(), wireLeft, bot + 24);
      ctx.fillStyle = 'rgba(160,158,149,0.9)';
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
      <h3>The bizarre slowness</h3>
      <p>
        A snail crawls at roughly 1 mm/s. In a 12-gauge household copper wire carrying 20 A, a typical free electron drifts at about
        <strong> 0.02 mm/s</strong> — about fifty times slower than a snail<Cite id="libretexts-conduction" in={SOURCES} />. Crank the lab above to copper, 20 A, 2.5 mm²:
        the readout confirms it.
      </p>
      <p>
        And yet, when you flip a light switch, the bulb illuminates instantly. The electrons in the filament don't have to wait for any other
        electrons to arrive. They <em>were already there.</em> The signal — the electromagnetic disturbance — propagated to them at roughly
        two-thirds the speed of light, in nanoseconds<Cite id="libretexts-conduction" in={SOURCES} />.
      </p>
      <Pullout>
        Three speeds live inside the same wire at once: <em>drift</em> (millimeters per second), <em>thermal</em> (a million meters per second),
        and <em>signal</em> (a hundred million meters per second). They are spread across <strong>fourteen orders of magnitude</strong>.
      </Pullout>

      <h3>The math, with numbers</h3>
      <p>
        If <strong>n</strong> free electrons sit in every cubic meter, each carrying charge <strong>q</strong>, all drifting with mean speed
        <strong> v<sub>d</sub></strong> through a cross-section <strong>A</strong>, then the total current is just the charge per second crossing that section:
      </p>
      <MathBlock>I = n q v<sub>d</sub> A   ⇒   v<sub>d</sub> = I / (n q A)</MathBlock>
      <p>Plug in numbers for copper at 1 A through 2.5 mm²:</p>
      <MathBlock>v<sub>d</sub> = 1 / (8.5×10<sup>28</sup> · 1.6×10<sup>−19</sup> · 2.5×10<sup>−6</sup>) ≈ 2.9×10<sup>−5</sup> m/s</MathBlock>
      <p>
        About 0.03 millimeters per second. To traverse a one-meter wire, an electron needs about <strong>9 hours</strong>. At household
        currents in heavier-gauge wire, it's closer to 14 hours per meter.
      </p>
      <p>
        The reason is in the denominator: <strong>n</strong> is colossal. Copper has roughly one free electron per atom, around
        <strong> 8.5×10<sup>28</sup></strong> of them per cubic meter<Cite id="ashcroft-mermin-1976" in={SOURCES} />. The current is the product of <em>that many</em>
        particles and the drift speed. To carry a current you don't need to push them fast — you have a vast army moving at a crawl.
      </p>

      <h3>Thermal vs. drift — the two velocities</h3>
      <p>
        Inside the same wire, those same electrons are <em>also</em> moving at roughly <strong>1.57×10<sup>6</sup> m/s</strong>. This isn't classical thermal
        motion; it's the Fermi velocity, set by quantum mechanics. The conduction electrons occupy states up to the Fermi level, which corresponds to a
        typical speed of about 1.57 million meters per second in copper<Cite id="kittel-2005" in={SOURCES} />.
      </p>
      <p>
        So picture this. A million-meter-per-second swarm in every direction at once. The applied field nudges this entire swarm with a slight
        bias of three hundredths of a millimeter per second. The bias is the current. The swarm itself doesn't go anywhere — it just leans, very
        slightly, downstream.
      </p>

      <h3>Why the bulb turns on instantly</h3>
      <p>
        Because the signal isn't any of the electrons. It's the electromagnetic disturbance — the changing E and B fields — propagating through
        the space around the conductor at near-c<Cite id="libretexts-conduction" in={SOURCES} />. When the field arrives at a given segment of the filament, the electrons
        <em> there</em> begin drifting. They were already in place. Nothing had to travel the length of the wire for the bulb to light.
      </p>

      <h4>The water-in-pipe analogy fails</h4>
      <p>
        In a water pipe, the water you turn on at the tap really did flow end-to-end through the pipe to get there. There's no equivalent for
        electrons. A better mechanical picture is an <em>incompressible</em> line of marbles preloaded into a tube: push one in at one end, one
        falls out the other end immediately, but no individual marble traveled the length of the tube.
      </p>

      <h4>Connection to Ohm's law</h4>
      <p>
        In the Drude model<Cite id="drude-1900" in={SOURCES} />, an electron between collisions accelerates under the field with <strong>a = qE/m</strong>, gains
        velocity for an average time <strong>τ</strong>, then loses memory of it on the next collision. The mean velocity that survives is:
      </p>
      <MathBlock>v<sub>d</sub> = (qτ/m) E</MathBlock>
      <p>
        Drift is <em>linear</em> in E, which is why current is linear in voltage. The reason Ohm's law works is that <strong>τ</strong> is brutally
        short — only about <strong>2×10<sup>−14</sup> s</strong> in copper at room temperature<Cite id="libretexts-conduction" in={SOURCES} />. Roughly fifty trillion
        velocity resets per second. Drift is the equilibrium between "getting pushed" and "forgetting you were pushed."
      </p>
      <p>
        So Ohm's law and the glacial drift speed are two faces of the same picture. The collisions make the response linear; the
        huge n makes the speed small. Nothing about a wire is fast except the field.
      </p>
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
