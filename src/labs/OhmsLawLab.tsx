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
import { MATERIALS, PHYS, pretty, type MaterialKey } from '@/lib/physics';
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
    const { ctx, w, h } = info;
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
          vy: (Math.random() - 0.5) * 0.5,
        });
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

      // Battery terminals
      ctx.fillStyle = '#ff3b6e';
      ctx.shadowColor = 'rgba(255,59,110,0.6)';
      ctx.shadowBlur = 14;
      ctx.fillRect(wireLeft - 18, top - 6, 4, thickness + 12);
      ctx.shadowBlur = 0;
      ctx.font = 'bold 18px "JetBrains Mono", monospace';
      ctx.fillStyle = '#ff3b6e';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('+', wireLeft - 32, wireCY);

      ctx.fillStyle = '#5baef8';
      ctx.shadowColor = 'rgba(91,174,248,0.6)';
      ctx.shadowBlur = 14;
      ctx.fillRect(wireRight + 14, top - 6, 4, thickness + 12);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#5baef8';
      ctx.fillText('−', wireRight + 32, wireCY);

      // E-field arrows along centerline (L → R: conventional current direction)
      const nArrows = 7;
      const arrowLen = 28 + Math.min(1, Math.log10(computed.E + 1) / 4) * 16;
      ctx.strokeStyle = 'rgba(255,107,42,0.95)';
      ctx.fillStyle = 'rgba(255,107,42,0.95)';
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
      ctx.fillStyle = '#5baef8';
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
      ctx.fillStyle = '#ff6b2a';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(MATERIALS[material]!.name.toUpperCase(), w / 2, top - 18);

      ctx.fillStyle = 'rgba(160,158,149,0.9)';
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
          <Readout sym="σ" label="Conductivity" valueHTML={pretty(computed.sigma)} unit="S/m" />
          <Readout sym="E" label="Field in conductor" valueHTML={pretty(computed.E)} unit="V/m" />
          <Readout sym="J" label="Current density" valueHTML={pretty(computed.J)} unit="A/m²" />
          <Readout sym="I" label="Total current" valueHTML={pretty(computed.I)} unit="A" highlight />
          <Readout sym="R" label="Resistance" valueHTML={pretty(computed.R)} unit="Ω" />
          <Readout sym="P" label="Power dissipated" valueHTML={pretty(computed.P)} unit="W" />
          <Readout sym={<>v<sub>d</sub></>} label="Electron drift speed" valueHTML={pretty(computed.vd)} unit="m/s" />
        </>
      }
    />
  );

  const prose = (
    <>
      <h3>The intuition</h3>
      <p>
        Picture a sled being pushed across snow. Push harder and it goes faster — but it doesn't keep accelerating forever, because friction
        bleeds off the gain. After a short startup the sled settles at a steady speed proportional to the push. <strong>That is Ohm's law.</strong>
        The push is the electric field. The sled is an electron. The snow is the metal lattice it keeps colliding with<Cite id="drude-1900" in={SOURCES} />.
      </p>
      <p>
        Conductivity <strong>σ</strong> is how slick the snow is. Silver and copper are practically ice. Iron is gravelly slush. Nichrome is sand —
        designed to be barely conductive so that pushing current through it forces a lot of friction-heat into the wire. That's a toaster<Cite id="kanthal" in={SOURCES} />.
      </p>
      <Pullout>
        Conductivity is a single number that bundles up <em>everything</em> about how charges navigate a particular material —
        how many free charges there are, how heavy they are, how often they crash.
      </Pullout>

      <h3>The math, in stages</h3>
      <p>
        A voltage <strong>V</strong> applied across a wire of length <strong>L</strong> sets up a roughly uniform electric field inside it. By
        definition, volts per meter:
      </p>
      <MathBlock>E = V / L</MathBlock>
      <p>
        That field accelerates charges. The microscopic Ohm's law says the resulting <em>current density</em> — current per unit cross-section —
        is just the field times the conductivity:
      </p>
      <MathBlock>J = σ E</MathBlock>
      <p>
        Integrate over the cross-section <strong>A</strong> and you get the total current:
      </p>
      <MathBlock>I = J A</MathBlock>
      <p>
        Put it together: <strong>I = σA · V/L</strong>. Re-arrange and the familiar macroscopic Ohm's law falls out:
      </p>
      <MathBlock>V = I R,   R = L / (σ A)</MathBlock>
      <p>
        Try the defaults — copper, V = 12 V, L = 1 m, A = 2.5 mm². Resistance comes out around 7 mΩ; current crosses 1700 A.
        That's not a wire, that's a short circuit. Real household-scale numbers come from much longer wires or much smaller cross-sections;
        the slider lets you walk into that regime.
      </p>

      <h3>Why does this linear relationship even hold?</h3>
      <p>
        The Drude model (1900) gives the cleanest classical picture<Cite id="drude-1900" in={SOURCES} />. Treat the free electrons in a metal as a gas
        between collisions with the lattice ions — a mean time <strong>τ ≈ 2×10<sup>−14</sup> s</strong> in copper at room temperature<Cite id="libretexts-conduction" in={SOURCES} />.
        Between collisions the applied field accelerates them with <strong>a = qE/m</strong>. Each collision randomizes direction, so on average the
        velocity gained from the field is <em>kept</em> for a time τ before being scrambled. The drift velocity is therefore:
      </p>
      <MathBlock>v<sub>d</sub> = (q τ / m) E</MathBlock>
      <p>
        And since current density is <strong>J = n q v<sub>d</sub></strong> (charge density times drift speed), we get the microscopic identity<Cite id="ashcroft-mermin-1976" in={SOURCES} />:
      </p>
      <MathBlock>σ = n q² τ / m</MathBlock>
      <p>
        Every term is a property of the material. <strong>n</strong> is how many free charges are around, <strong>τ</strong> is how long they survive between
        crashes, <strong>m</strong> is how hard they are to push. Bundle them up, get one number, call it σ. The classical Drude picture is an
        approximation — the actual speeds involved are quantum (Fermi-level), not thermal — but for steady-current behavior it is essentially right<Cite id="ashcroft-mermin-1976" in={SOURCES} />.
      </p>

      <h3>The hard part: power, not energy, is the right thing to track</h3>
      <p>
        Every collision dumps the kinetic energy the electron picked up from the field as heat into the lattice. The <em>rate</em> at which this
        happens per unit volume is the dot product <strong>J · E = σE²</strong>. Integrate over the wire volume and you get the total power dissipated.
        The same number falls out as:
      </p>
      <MathBlock>P = V I = V² / R = I² R</MathBlock>
      <p>
        That's Joule heating. Doubling <strong>V</strong> doubles <strong>I</strong> but <em>quadruples</em> <strong>P</strong>. Tungsten filament
        bulbs glow because tungsten's σ is low, so any given current needs a substantial E along the wire, and all that I²R becomes thermal
        radiation hot enough to be visible<Cite id="crc-resistivity" in={SOURCES} />.
      </p>

      <h4>About the material dropdown</h4>
      <p>
        <strong>Silver</strong> and <strong>copper</strong> are the kings of room-temperature conductivity (σ ≈ 6×10<sup>7</sup> S/m). Silver is
        marginally better but orders of magnitude more expensive, so all building wire is copper. <strong>Aluminum</strong> is about 60% as
        conductive but a third as dense, which is why long-distance power lines are aluminum. <strong>Iron</strong> is roughly 6× worse than copper.
        <strong> Tungsten</strong> is worse still but stays solid at incandescent temperatures, so it makes filaments. <strong>Nichrome</strong> is
        intentionally bad — designed for heating elements, where you <em>want</em> high resistance per length<Cite id="crc-resistivity" in={SOURCES} /><Cite id="kanthal" in={SOURCES} />.
      </p>
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
