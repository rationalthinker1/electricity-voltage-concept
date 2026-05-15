/**
 * Lab 3.1 — Microscopic Ohm's Law
 *
 *   J = σ E
 *
 * Slider-controlled material, voltage, length, and cross-section. Live readouts
 * of σ, E = V/L, J = σE, I = JA, R = L/σA, P = VI, and drift speed
 * v_d = I/(nqA). Visual: horizontal wire with battery terminals, axial E-field
 * arrows, blue-electron swarm with a leftward drift bias (visually scaled).
 *
 * Default state (copper, V=12, L=1m, A=2.5 mm²) gives I ≈ 1788 A — a "short
 * circuit", flagged explicitly in the prose.
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
import {MATERIALS, PHYS, type MaterialKey, prettyJsx } from '@/lib/physics';
import { BASE_LAB_SOURCES } from '@/labs/data/manifest';

const SLUG = 'ohms-law';
const SOURCES = BASE_LAB_SOURCES[SLUG]!;

export default function OhmsLawLab() {
  const [material, setMaterial] = useState<MaterialKey>('copper');
  const [V, setV] = useState(12);       // volts
  const [L, setL] = useState(1.0);      // m
  const [Amm2, setAmm2] = useState(2.5); // mm²

  // Computed physics
  const computed = useMemo(() => {
    const mat = MATERIALS[material]!;
    const A_m2 = Amm2 * 1e-6;
    const sigma = mat.sigma;
    const E = V / L;
    const J = sigma * E;
    const I = J * A_m2;
    const R = L / (sigma * A_m2);
    const P = V * I;
    const vd = I / (mat.n * PHYS.e * A_m2);
    return { sigma, E, J, I, R, P, vd, matName: mat.name };
  }, [material, V, L, Amm2]);

  // Canvas state — refs so draw loop sees latest without re-running setup.
  const stateRef = useRef({ material, V, L, Amm2, computed });
  useEffect(() => {
    stateRef.current = { material, V, L, Amm2, computed };
  }, [material, V, L, Amm2, computed]);

  const setupCanvas = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, colors } = info;
    let raf = 0;

    const wireMarginX = 80;
    const N_ELEC = 200;
    type Electron = { x: number; y: number; vx: number; vy: number };
    const electrons: Electron[] = [];

    function layout() {
      const wireLeft = wireMarginX;
      const wireRight = w - wireMarginX;
      const wireCY = h / 2;
      const thickness = Math.max(30, Math.min(180, Math.sqrt(stateRef.current.Amm2 / 2.5) * 80));
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
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5 });
      }
    }
    seed();

    let lastA = stateRef.current.Amm2;

    function draw() {
      const { Amm2, V, L, material, computed } = stateRef.current;
      // Re-seed when cross-section changes a lot (thickness change reshapes bounds)
      if (Math.abs(Amm2 - lastA) > 0.01) { lastA = Amm2; seed(); }

      const { wireLeft, wireRight, wireCY, thickness } = layout();
      const top = wireCY - thickness / 2;
      const bot = wireCY + thickness / 2;

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      // Wire body
      const grd = ctx.createLinearGradient(0, top, 0, bot);
      grd.addColorStop(0, 'rgba(255,107,42,0.08)');
      grd.addColorStop(0.5, 'rgba(255,107,42,0.16)');
      grd.addColorStop(1, 'rgba(255,107,42,0.08)');
      ctx.fillStyle = grd;
      roundRect(ctx, wireLeft, top, wireRight - wireLeft, thickness, 14); ctx.fill();
      ctx.save();
      ctx.globalAlpha = 0.45;
      ctx.strokeStyle = colors.text;
      ctx.lineWidth = 1;
      roundRect(ctx, wireLeft, top, wireRight - wireLeft, thickness, 14); ctx.stroke();
      ctx.restore();

      // Battery terminals
      ctx.fillStyle = colors.pink;
      ctx.save();
      ctx.globalAlpha = 0.6;
      ctx.shadowColor = colors.pink;
      ctx.shadowBlur = 14;
      ctx.fillRect(wireLeft - 18, top - 6, 4, thickness + 12);
      ctx.restore();
      ctx.shadowBlur = 0;
      ctx.font = 'bold 18px "JetBrains Mono", monospace';
      ctx.fillStyle = colors.pink;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('+', wireLeft - 32, wireCY);

      ctx.fillStyle = colors.blue;
      ctx.save();
      ctx.globalAlpha = 0.6;
      ctx.shadowColor = colors.blue;
      ctx.shadowBlur = 14;
      ctx.fillRect(wireRight + 14, top - 6, 4, thickness + 12);
      ctx.restore();
      ctx.shadowBlur = 0;
      ctx.fillStyle = colors.blue;
      ctx.fillText('−', wireRight + 32, wireCY);

      // E-field arrows along centerline (L → R: conventional current direction)
      const nArrows = 7;
      const arrowLen = 28 + Math.min(1, Math.log10(computed.E + 1) / 4) * 16;
      ctx.strokeStyle = colors.accent;
      ctx.fillStyle = colors.accent;
      ctx.lineWidth = 1.5;
      for (let i = 0; i < nArrows; i++) {
        const t = (i + 0.5) / nArrows;
        const ax = wireLeft + t * (wireRight - wireLeft) - arrowLen / 2;
        const ay = wireCY;
        ctx.beginPath();
        ctx.moveTo(ax, ay); ctx.lineTo(ax + arrowLen, ay); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(ax + arrowLen, ay);
        ctx.lineTo(ax + arrowLen - 6, ay - 4);
        ctx.lineTo(ax + arrowLen - 6, ay + 4);
        ctx.closePath(); ctx.fill();
      }

      // Electrons (drift opposite to conventional current → leftward).
      // VISUAL ONLY: real v_d is fractions of a mm/s; we scale ~100× so anything is visible.
      const driftBias = -Math.max(0.02, Math.min(2.0, computed.vd * 100));
      ctx.fillStyle = colors.blue;
      for (const e of electrons) {
        e.vx += (Math.random() - 0.5) * 1.4;
        e.vy += (Math.random() - 0.5) * 1.4;
        e.vx *= 0.85; e.vy *= 0.85;
        e.vx += driftBias;
        e.x += e.vx; e.y += e.vy;
        if (e.x < wireLeft + 4) e.x = wireRight - 4;
        if (e.x > wireRight - 4) e.x = wireLeft + 4;
        if (e.y < top + 4) { e.y = top + 4; e.vy = Math.abs(e.vy); }
        if (e.y > bot - 4) { e.y = bot - 4; e.vy = -Math.abs(e.vy); }
        ctx.beginPath(); ctx.arc(e.x, e.y, 1.6, 0, Math.PI * 2); ctx.fill();
      }

      // Labels
      ctx.fillStyle = colors.accent;
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(MATERIALS[material]!.name.toUpperCase(), w / 2, top - 18);

      ctx.fillStyle = colors.textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`V = ${V.toFixed(1)} V`, wireLeft, bot + 24);
      ctx.textAlign = 'right';
      ctx.fillText(`L = ${L.toFixed(2)} m   ·   A = ${Amm2.toFixed(2)} mm²`, wireRight, bot + 24);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);

    return () => { cancelAnimationFrame(raf); };
  }, []);

  const labContent = (
    <LabGrid
      canvas={<AutoResizeCanvas height={380} setup={setupCanvas} />}
      legend={
        <>
          <LegendItem swatchColor="var(--blue)" dot>Free electrons</LegendItem>
          <LegendItem swatchColor="var(--accent)">E field (axial)</LegendItem>
          <LegendItem swatchColor="var(--pink)" dot>+ terminal</LegendItem>
          <LegendItem swatchColor="var(--blue)" dot>− terminal</LegendItem>
          <LegendItem style={{ marginLeft: 'auto', color: 'var(--accent)' }}>↳ Drift visually scaled for visibility</LegendItem>
        </>
      }
      inputs={
        <>
          <div className="slider-group">
            <div className="slider-head">
              <span className="slider-label"><span className="sym">m</span>Material</span>
              <span className="slider-value">{MATERIALS[material]!.name.toUpperCase()}</span>
            </div>
            <MaterialSelect value={material} onChange={setMaterial} />
          </div>
          <Slider sym="V" label="Applied voltage"
            value={V} min={0.1} max={120} step={0.1}
            format={v => v.toFixed(1) + ' V'}
            metaLeft="0.1 V" metaRight="120 V"
            onChange={setV}
          />
          <Slider sym="L" label="Wire length"
            value={L} min={0.1} max={50} step={0.1}
            format={v => v.toFixed(2) + ' m'}
            metaLeft="0.1 m" metaRight="50 m"
            onChange={setL}
          />
          <Slider sym="A" label="Cross-section"
            value={Amm2} min={0.1} max={10} step={0.05}
            format={v => v.toFixed(2) + ' mm²'}
            metaLeft="0.1 mm²" metaRight="10 mm²"
            onChange={setAmm2}
          />
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--text-muted)', letterSpacing: '.1em', lineHeight: 1.6 }}>
            Drift speed is real; on-canvas motion is scaled<br />
            ~100× so you can see anything at all.
          </div>
        </>
      }
      outputs={
        <>
          <Readout sym="σ" label="Conductivity" value={prettyJsx(computed.sigma)} unit="S/m" />
          <Readout sym="E" label="Field in conductor" value={prettyJsx(computed.E)} unit="V/m" />
          <Readout sym="J" label="Current density" value={prettyJsx(computed.J)} unit="A/m²" />
          <Readout sym="I" label="Total current" value={prettyJsx(computed.I)} unit="A" highlight />
          <Readout sym="R" label="Resistance" value={prettyJsx(computed.R)} unit="Ω" />
          <Readout sym="P" label="Power dissipated" value={prettyJsx(computed.P)} unit="W" />
          <Readout sym={<>v<sub>d</sub></>} label="Electron drift speed" value={prettyJsx(computed.vd)} unit="m/s" />
        </>
      }
    />
  );

  const prose = (
    <>
      <h3 className="lab-section-h3">Context</h3>
      <p className="mb-prose-3">
        Ohm's law — <strong className="text-text font-medium">V = IR</strong> — is the working equation of every battery-powered circuit, every wall outlet, every signal-carrying
        trace on every circuit board. Connect a real piece of conductor to a real voltage source, and the steady-state current that flows is
        proportional to the voltage, with a constant of proportionality called the <em className="italic text-text">resistance</em>. The law is valid for ordinary metals at
        ordinary temperatures over many orders of magnitude in current density — and breaks down at the extremes: in superconductors (R = 0 below
        a critical temperature), in semiconductors driven near breakdown, in incandescent filaments hot enough that ρ has run away from its cold
        value<Cite id="crc-resistivity" in={SOURCES} />, in lightning channels where the air's behavior is nonlinear, and at the femtosecond
        timescales where the Drude scattering time itself becomes resolvable<Cite id="drude-1900" in={SOURCES} />.
      </p>

      <h3 className="lab-section-h3">Formula</h3>
      <MathBlock>V = I R</MathBlock>
      <p className="mb-prose-3">
        Where <strong className="text-text font-medium">V</strong> is the voltage across a conductor in volts (V), <strong className="text-text font-medium">I</strong> is the current through it in amperes (A), and
        <strong className="text-text font-medium"> R</strong> is the resistance in ohms (Ω = V/A). The microscopic counterpart is <strong className="text-text font-medium">J = σE</strong>, with <strong className="text-text font-medium">J</strong>
        the current density in A/m², <strong className="text-text font-medium">E</strong> the field driving the charges in V/m, and <strong className="text-text font-medium">σ</strong> the conductivity in S/m. The
        two are related by geometry: <strong className="text-text font-medium">R = L / (σA)</strong> for a uniform wire of length <strong className="text-text font-medium">L</strong> and cross-section
        <strong className="text-text font-medium"> A</strong>.
      </p>

      <h3 className="lab-section-h3">Intuition</h3>
      <p className="mb-prose-3">
        Picture a sled being pushed across snow. Push harder and it goes faster — but it doesn't keep accelerating forever, because friction
        bleeds off the gain. After a short startup the sled settles at a steady speed proportional to the push. The push is the electric field.
        The sled is an electron. The snow is the metal lattice it keeps colliding with<Cite id="drude-1900" in={SOURCES} />. Steady current under
        constant voltage isn't a mass accelerating forever; it's a drag race in which the drag exactly cancels the drive.
      </p>
      <Pullout>
        Conductivity is a single number that bundles up <em className="italic text-text">everything</em> about how charges navigate a particular material —
        how many free charges there are, how heavy they are, how often they crash.
      </Pullout>

      <h3 className="lab-section-h3">Reasoning</h3>
      <p className="mb-prose-3">
        Why <em className="italic text-text">linear</em>? Because the steady-state drift velocity is set by a balance between two terms each linear in <strong className="text-text font-medium">E</strong>:
        the acceleration <strong className="text-text font-medium">qE/m</strong> over the mean time between collisions <strong className="text-text font-medium">τ</strong>. Double <strong className="text-text font-medium">E</strong> and you double
        both the acceleration and the gain per scattering event, giving twice the drift. Linearity is a Drude consequence, not a postulate.
      </p>
      <p className="mb-prose-3">
        Why does <strong className="text-text font-medium">R</strong> have the form <strong className="text-text font-medium">L/(σA)</strong>? Length is in the numerator because it's the path the field drives the
        charges over: more obstacles in series. Area is in the denominator because it's the number of parallel lanes available: more side-by-side
        traffic for the same current density. Material conductivity <strong className="text-text font-medium">σ</strong> bundles up <em className="italic text-text">n</em> (carrier density), <em className="italic text-text">q</em> (charge
        per carrier), <em className="italic text-text">τ</em> (mean free time), and <em className="italic text-text">m</em> (effective mass) into one number<Cite id="ashcroft-mermin-1976" in={SOURCES} />.
      </p>

      <h3 className="lab-section-h3">Derivation</h3>
      <p className="mb-prose-3">
        Apply a voltage <strong className="text-text font-medium">V</strong> across a wire of length <strong className="text-text font-medium">L</strong>. In steady state surface charges redistribute to make the
        field inside roughly uniform along the axis:
      </p>
      <MathBlock>E = V / L</MathBlock>
      <p className="mb-prose-3">
        In the Drude picture, an electron between collisions accelerates with <strong className="text-text font-medium">a = qE/m</strong>, gaining velocity for an average time
        <strong className="text-text font-medium"> τ</strong>, then losing memory of it. The mean drift velocity is:
      </p>
      <MathBlock>v<sub>d</sub> = (q τ / m) E</MathBlock>
      <p className="mb-prose-3">Current density is charge density times drift:</p>
      <MathBlock>J = n q v<sub>d</sub> = (n q² τ / m) E ≡ σ E</MathBlock>
      <p className="mb-prose-3">
        Integrate over the cross-section <strong className="text-text font-medium">A</strong>:
      </p>
      <MathBlock>I = J A = σ A V / L</MathBlock>
      <p className="mb-prose-3">
        Rearrange to put V on one side:
      </p>
      <MathBlock>V = (L / σ A) · I = I R,   R = L / (σ A)</MathBlock>
      <p className="mb-prose-3">
        Ohm's law isn't a separate postulate. It's what <strong className="text-text font-medium">J = σE</strong> looks like after geometry has had its say<Cite id="ashcroft-mermin-1976" in={SOURCES} />.
        Try the defaults — copper, V = 12 V, L = 1 m, A = 2.5 mm². Resistance comes out around 7 mΩ; current crosses 1700 A. That's not a wire,
        that's a short circuit. Real household-scale numbers come from much longer wires or much smaller cross-sections — and from voltages of
        a few volts across kilohm-scale lumped resistors, where the readout sits at milliamps not kiloamps.
      </p>
      <p className="mb-prose-3">
        The same algebra gives you power. Each second, <em className="italic text-text">I</em> coulombs cross the resistor; each loses <em className="italic text-text">V</em> joules to the lattice:
      </p>
      <MathBlock>P = V I = V² / R = I² R</MathBlock>
      <p className="mb-prose-3">
        Doubling <strong className="text-text font-medium">V</strong> doubles <strong className="text-text font-medium">I</strong> but <em className="italic text-text">quadruples</em> <strong className="text-text font-medium">P</strong>. That's why tungsten filaments
        glow<Cite id="crc-resistivity" in={SOURCES} /> and why nichrome ribbons are the entire product of a toaster<Cite id="kanthal" in={SOURCES} />.
      </p>

      <h3 className="lab-section-h3">Worked problems</h3>

      <TryIt
        tag="Problem 3.1.1"
        question={<>A 100 Ω resistor sits across a 10 V battery. What current flows?</>}
        hint={<>Direct application of V = IR.</>}
        answer={
          <>
            <MathBlock>I = V / R = 10 V / 100 Ω = 0.10 A</MathBlock>
            <p className="mb-prose-3">Answer: <strong className="text-text font-medium">0.10 A = 100 mA</strong>.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 3.1.2"
        question={<>A circuit reads 5 mA through some unknown resistor at 5 V across it. What is R?</>}
        hint={<>Rearrange V = IR.</>}
        answer={
          <>
            <MathBlock>R = V / I = 5 V / 0.005 A = 1000 Ω = 1 kΩ</MathBlock>
            <p className="mb-prose-3">Answer: <strong className="text-text font-medium">R = 1 kΩ</strong>. A very common bench-resistor value, not by accident.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 3.1.3"
        question={<>A 1 kΩ and a 2 kΩ resistor sit in series across a 9 V battery. What is the current, and what voltage drops across each?</>}
        hint={<>Same current everywhere in a series chain.</>}
        answer={
          <>
            <p className="mb-prose-3">Resistors in series add:</p>
            <MathBlock>R<sub>total</sub> = 1 kΩ + 2 kΩ = 3 kΩ</MathBlock>
            <MathBlock>I = 9 V / 3000 Ω = 3 mA</MathBlock>
            <MathBlock>V<sub>1</sub> = I R<sub>1</sub> = 3 mA · 1 kΩ = 3 V</MathBlock>
            <MathBlock>V<sub>2</sub> = I R<sub>2</sub> = 3 mA · 2 kΩ = 6 V</MathBlock>
            <p className="mb-prose-3">The drops sum to 9 V — the battery's full EMF — as Kirchhoff requires.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 3.1.4"
        question={<>Two 1 kΩ resistors are placed in parallel across a 12 V supply. What is the equivalent resistance and the total current drawn?</>}
        answer={
          <>
            <p className="mb-prose-3">Parallel resistors combine by reciprocal sum:</p>
            <MathBlock>1/R<sub>eq</sub> = 1/1000 + 1/1000 = 2/1000   ⇒   R<sub>eq</sub> = 500 Ω</MathBlock>
            <MathBlock>I = V / R<sub>eq</sub> = 12 / 500 = 24 mA</MathBlock>
            <p className="mb-prose-3">Each 1 kΩ resistor carries half the current (12 mA) — they share the load symmetrically.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 3.1.5"
        question={<>A 10 Ω and a 30 Ω resistor are in series across 12 V. What is the power dissipated in each?</>}
        answer={
          <>
            <MathBlock>I = 12 V / (10 + 30) Ω = 0.30 A</MathBlock>
            <MathBlock>P<sub>10</sub> = I² R = (0.3)² · 10 = 0.90 W</MathBlock>
            <MathBlock>P<sub>30</sub> = I² R = (0.3)² · 30 = 2.70 W</MathBlock>
            <p className="mb-prose-3">
              The bigger resistor dissipates three times more power, because the same current flows through both but the larger one drops more
              voltage. Power in a series chain is proportional to R.
            </p>
          </>
        }
      />

      <TryIt
        tag="Problem 3.1.6"
        question={<>A voltage divider has V<sub>in</sub> = 9 V, R<sub>1</sub> = 2 kΩ on top, R<sub>2</sub> = 3 kΩ on bottom, with V<sub>out</sub> taken across R<sub>2</sub>. Compute V<sub>out</sub>.</>}
        hint={<>The unloaded divider formula: V<sub>out</sub> = V<sub>in</sub> · R<sub>2</sub> / (R<sub>1</sub> + R<sub>2</sub>).</>}
        answer={
          <>
            <MathBlock>V<sub>out</sub> = 9 · 3 / (2 + 3) = 9 · 3/5 = 5.4 V</MathBlock>
            <p className="mb-prose-3">Answer: <strong className="text-text font-medium">5.4 V</strong>. Voltage divides between series resistors in proportion to their R values.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 3.1.7"
        question={<>A 10 kΩ potentiometer is wired as a voltage divider on 5 V. The wiper is set to a fraction <em className="italic text-text">x</em> of the way from the bottom (0 to 1). Express V<sub>wiper</sub> as a function of <em className="italic text-text">x</em>.</>}
        answer={
          <>
            <p className="mb-prose-3">The resistance below the wiper is <em className="italic text-text">xR</em>, the resistance above is <em className="italic text-text">(1−x)R</em>. The total is <em className="italic text-text">R</em>:</p>
            <MathBlock>V<sub>wiper</sub> = 5 · (x R) / R = 5 x V</MathBlock>
            <p className="mb-prose-3">
              Answer: a linear pot is a linear divider — <strong className="text-text font-medium">V<sub>wiper</sub> = 5x V</strong>. At <em className="italic text-text">x</em> = 0.5, the wiper sits at 2.5 V.
              The total resistance value (10 kΩ) drops out entirely; only the ratio matters when the load is light.
            </p>
          </>
        }
      />

      <TryIt
        tag="Problem 3.1.8"
        question={<>Two 1 kΩ ± 5% resistors are placed in series. What is the worst-case total resistance, and the relative tolerance of the series combination?</>}
        answer={
          <>
            <p className="mb-prose-3">Each resistor's value lies in [950, 1050] Ω. Worst-case high is 2100 Ω; worst-case low is 1900 Ω. The nominal sum is 2000 Ω.</p>
            <MathBlock>tolerance = ±100 / 2000 = ±5%</MathBlock>
            <p className="mb-prose-3">
              Answer: total <strong className="text-text font-medium">2 kΩ ± 5%</strong>. Tolerances of equal-percentage resistors don't add in series — they stay the same percentage. (They <em className="italic text-text">do</em> add in absolute Ω terms.) The percentage error of a sum is a weighted average of the individuals' percentage errors.
            </p>
          </>
        }
      />

      <TryIt
        tag="Problem 3.1.9"
        question={<>A galvanometer movement reads 1 mA full-scale with an internal resistance of 100 Ω. To turn it into a 100 mA ammeter, what shunt resistor must be placed across the movement?</>}
        hint={<>Shunt absorbs the extra 99 mA at the same 0.1 V the movement drops at full scale.</>}
        answer={
          <>
            <p className="mb-prose-3">At full scale the movement drops V = 1 mA · 100 Ω = 0.1 V. The shunt sees that same 0.1 V and must carry the remaining 99 mA:</p>
            <MathBlock>R<sub>shunt</sub> = 0.1 V / 0.099 A ≈ 1.01 Ω</MathBlock>
            <p className="mb-prose-3">
              Answer: about <strong className="text-text font-medium">1.0 Ω</strong> in parallel. The shunt's smallness — two orders of magnitude below the movement — is why
              ammeters insert almost no resistance into a circuit, and why a 1% error in the shunt becomes a 1% error in the reading.
            </p>
          </>
        }
      />

      <TryIt
        tag="Problem 3.1.10"
        question={<>A voltmeter with 10 MΩ input impedance measures across the lower leg of a 1 MΩ + 1 MΩ divider on 1 V. What does it read, and by how much does it perturb the divider?</>}
        answer={
          <>
            <p className="mb-prose-3">Unloaded, the divider sits at 0.500 V. Attaching the voltmeter puts 10 MΩ in parallel with the bottom 1 MΩ:</p>
            <MathBlock>R<sub>bot</sub><sup>′</sup> = (1 · 10) / (1 + 10) = 10/11 ≈ 0.909 MΩ</MathBlock>
            <MathBlock>V<sub>read</sub> = 1 · 0.909 / (1 + 0.909) ≈ 0.476 V</MathBlock>
            <p className="mb-prose-3">
              The reading is about <strong className="text-text font-medium">0.476 V</strong> — roughly 4.8% low. The lesson: a 10× input impedance ratio still costs a few percent.
              For precision measurements across a megohm source, you need a 10<sup>9</sup>-ohm-grade meter (an electrometer) or you have to model
              the loading.
            </p>
          </>
        }
      />

      <TryIt
        tag="Problem 3.1.11"
        question={<>A 12 V car battery with 0.01 Ω internal resistance is connected to a 100 A starter motor load. What is the terminal voltage during cranking?</>}
        hint={<>The internal resistance drops a voltage I R<sub>int</sub> that subtracts from the EMF.</>}
        answer={
          <>
            <MathBlock>V<sub>drop</sub> = I R<sub>int</sub> = 100 · 0.01 = 1.0 V</MathBlock>
            <MathBlock>V<sub>term</sub> = 12 − 1 = 11 V</MathBlock>
            <p className="mb-prose-3">
              Answer: terminal voltage falls to <strong className="text-text font-medium">~11 V</strong> during cranking. That's why headlights dim when you start the engine —
              the battery's internal R is dropping a real volt under heavy load. A weak battery with R<sub>int</sub> = 0.05 Ω would drop to
              7 V under the same load, and the starter wouldn't crank.
            </p>
          </>
        }
      />
    </>
  );

  return (
    <LabShell
      slug={SLUG}
      labSubtitle="Current in a Conductor"
      labId="ohm-3.1 / J = σE, I = JA, R = L/σA"
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
