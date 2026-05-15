/**
 * Lab 3.2 — Resistance
 *
 *   R = ρ L / A = L / (σ A)
 *
 * Macroscopic Ohm's law variable, falling out of the microscopic J = σE after
 * integration over the wire's geometry. Length and cross-section sliders are
 * log-mapped on the canvas so the visualization stays readable across five
 * decades. A schematic resistor symbol sits above the length-ruler; a teal
 * cross-section gauge below shows the area as a circle.
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
import { drawResistor } from '@/lib/canvasPrimitives';
import {MATERIALS, pretty, type MaterialKey, prettyJsx } from '@/lib/physics';
import { BASE_LAB_SOURCES } from '@/labs/data/manifest';
import { getCanvasColors } from '@/lib/canvasTheme';

const SLUG = 'resistance';
const SOURCES = BASE_LAB_SOURCES[SLUG]!;

export default function ResistanceLab() {
  const [material, setMaterial] = useState<MaterialKey>('copper');
  const [L, setL] = useState(1.0);     // m
  const [Amm2, setAmm2] = useState(1.0); // mm²

  const computed = useMemo(() => {
    const mat = MATERIALS[material]!;
    const A_m2 = Amm2 * 1e-6;
    const sigma = mat.sigma;
    const rho = 1 / sigma;
    const R = (rho * L) / A_m2;
    const G = 1 / R;
    return { rho, R, G, matName: mat.name };
  }, [material, L, Amm2]);

  const stateRef = useRef({ material, L, Amm2, computed });
  useEffect(() => {
    stateRef.current = { material, L, Amm2, computed };
  }, [material, L, Amm2, computed]);

  const setupCanvas = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, } = info;
    let raf = 0;

    const wireMarginX = 90;
    const N_ELEC = 140;
    type Electron = { x: number; y: number; vx: number; vy: number };
    const electrons: Electron[] = [];

    function layout() {
      const wireCY = h / 2;
      const maxSpan = w - 2 * wireMarginX;
      const { L, Amm2 } = stateRef.current;
      const Lclamp = Math.max(0.01, Math.min(100, L));
      const logFrac = (Math.log10(Lclamp) - Math.log10(0.01)) / (Math.log10(100) - Math.log10(0.01));
      const span = 80 + logFrac * (maxSpan - 80);
      const wireLeft = (w - span) / 2;
      const wireRight = wireLeft + span;
      const Aclamp = Math.max(0.01, Math.min(100, Amm2));
      const tFrac = (Math.log10(Aclamp) - Math.log10(0.01)) / (Math.log10(100) - Math.log10(0.01));
      const thickness = 12 + tFrac * 140;
      return { wireLeft, wireRight, wireCY, thickness };
    }

    function seed() {
      const { wireLeft, wireRight, wireCY, thickness } = layout();
      electrons.length = 0;
      const top = wireCY - thickness / 2 + 3;
      const bot = wireCY + thickness / 2 - 3;
      const yMin = Math.min(top, bot - 2);
      const yMax = Math.max(bot, top + 2);
      for (let i = 0; i < N_ELEC; i++) {
        electrons.push({
          x: wireLeft + Math.random() * (wireRight - wireLeft),
          y: yMin + Math.random() * (yMax - yMin),
          vx: (Math.random() - 0.5) * 0.6,
          vy: (Math.random() - 0.5) * 0.6,
        });
      }
    }
    seed();

    let lastL = stateRef.current.L;
    let lastA = stateRef.current.Amm2;

    function draw() {
      const { L, Amm2, material, computed } = stateRef.current;
      if (Math.abs(L - lastL) > 0.001 || Math.abs(Amm2 - lastA) > 0.01) {
        lastL = L; lastA = Amm2; seed();
      }
      const { wireLeft, wireRight, wireCY, thickness } = layout();
      const top = wireCY - thickness / 2;
      const bot = wireCY + thickness / 2;

      ctx.fillStyle = getCanvasColors().bg;
      ctx.fillRect(0, 0, w, h);

      // Length tick scale above wire
      ctx.strokeStyle = 'rgba(160,158,149,0.35)';
      ctx.lineWidth = 1;
      const tickY = top - 32;
      ctx.beginPath();
      ctx.moveTo(wireLeft, tickY); ctx.lineTo(wireRight, tickY); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(wireLeft, tickY - 5); ctx.lineTo(wireLeft, tickY + 5);
      ctx.moveTo(wireRight, tickY - 5); ctx.lineTo(wireRight, tickY + 5);
      ctx.stroke();
      ctx.fillStyle = getCanvasColors().textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      const lLabel = L < 0.1 ? (L * 1000).toFixed(1) + ' mm'
                  : L < 1   ? (L * 100).toFixed(1) + ' cm'
                  : L.toFixed(2) + ' m';
      ctx.fillText(`L = ${lLabel}`, (wireLeft + wireRight) / 2, tickY - 8);

      // Schematic resistor symbol above the length ruler
      drawResistor(ctx, { x: w / 2 - 60, y: tickY - 45 }, { x: w / 2 + 60, y: tickY - 45 }, {
        color: 'rgba(108,197,194,0.7)',
        label: 'R',
        labelColor: 'rgba(108,197,194,0.85)',
        amplitude: 11,
        labelOffset: { x: 0, y: 24 },
      });

      // Wire body
      const grd = ctx.createLinearGradient(0, top, 0, bot);
      grd.addColorStop(0, 'rgba(255,107,42,0.08)');
      grd.addColorStop(0.5, 'rgba(255,107,42,0.16)');
      grd.addColorStop(1, 'rgba(255,107,42,0.08)');
      ctx.fillStyle = grd;
      const radius = Math.min(14, thickness * 0.45);
      roundRect(ctx, wireLeft, top, wireRight - wireLeft, thickness, radius);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.45)';
      ctx.lineWidth = 1;
      roundRect(ctx, wireLeft, top, wireRight - wireLeft, thickness, radius);
      ctx.stroke();

      // Electrons. Visual drift bias hints at "ease of flow" (log G), not real v_d
      const driftBias = -Math.max(0.05, Math.min(1.8, Math.log10(computed.G + 1) * 0.4 + 0.2));
      ctx.fillStyle = getCanvasColors().blue;
      for (const e of electrons) {
        e.vx += (Math.random() - 0.5) * 1.2;
        e.vy += (Math.random() - 0.5) * 1.2;
        e.vx *= 0.85; e.vy *= 0.85;
        e.vx += driftBias;
        e.x += e.vx; e.y += e.vy;
        if (e.x < wireLeft + 3) e.x = wireRight - 3;
        if (e.x > wireRight - 3) e.x = wireLeft + 3;
        if (e.y < top + 3) { e.y = top + 3; e.vy = Math.abs(e.vy); }
        if (e.y > bot - 3) { e.y = bot - 3; e.vy = -Math.abs(e.vy); }
        ctx.beginPath(); ctx.arc(e.x, e.y, 1.5, 0, Math.PI * 2); ctx.fill();
      }

      // Area gauge below wire
      drawAreaGauge(ctx, w / 2, bot + 56, Amm2);

      // Overlays
      ctx.fillStyle = getCanvasColors().accent;
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(MATERIALS[material]!.name.toUpperCase(), 16, 12);
      ctx.fillStyle = getCanvasColors().textDim;
      ctx.fillText(`ρ = ${pretty(computed.rho).replace(/<[^>]+>/g, '')} Ω·m`, 16, 28);

      ctx.textAlign = 'right';
      ctx.fillStyle = getCanvasColors().accent;
      ctx.fillText(`R = ${pretty(computed.R).replace(/<[^>]+>/g, '')} Ω`, w - 16, 12);
      ctx.fillStyle = getCanvasColors().textDim;
      ctx.fillText(`A = ${Amm2.toFixed(2)} mm²`, w - 16, 28);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);

    return () => { cancelAnimationFrame(raf); };
  }, []);

  // Plain-text comparison strings for the "for scale" readout
  const comp = useMemo(() => {
    const A = Amm2;
    let aTxt;
    if (A < 0.05)      aTxt = 'thinner than a human hair';
    else if (A < 0.5)  aTxt = 'a thin guitar string';
    else if (A < 2.5)  aTxt = 'household lamp cord';
    else if (A < 10)   aTxt = 'heavy appliance cable';
    else if (A < 50)   aTxt = 'a pencil cross-section';
    else               aTxt = 'thicker than a tree branch';
    let lTxt;
    if (L < 0.05)       lTxt = 'a fingernail';
    else if (L < 0.3)   lTxt = 'a postage stamp lined up';
    else if (L < 2)     lTxt = 'an arm';
    else if (L < 10)    lTxt = 'a room';
    else if (L < 50)    lTxt = 'a house';
    else                lTxt = 'a city block';
    return `<span style="color:var(--text-dim)">A like</span> ${aTxt} <span style="color:var(--text-muted)">·</span> <span style="color:var(--text-dim)">L like</span> ${lTxt}`;
  }, [L, Amm2]);

  const labContent = (
    <LabGrid
      canvas={<AutoResizeCanvas height={380} setup={setupCanvas} />}
      legend={
        <>
          <LegendItem swatchColor="var(--blue)" dot>Free electrons</LegendItem>
          <LegendItem swatchColor="var(--accent)">Wire body</LegendItem>
          <LegendItem swatchColor="var(--teal)" dot>Cross-section gauge</LegendItem>
          <LegendItem style={{ marginLeft: 'auto', color: 'var(--accent)' }}>↳ Wire shape responds live to L and A</LegendItem>
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
          <Slider sym="L" label="Wire length"
            value={L} min={0.01} max={100} step={0.01}
            format={v => v < 0.1 ? (v * 1000).toFixed(1) + ' mm' : v < 1 ? (v * 100).toFixed(1) + ' cm' : v.toFixed(2) + ' m'}
            metaLeft="0.01 m" metaRight="100 m"
            onChange={setL}
          />
          <Slider sym="A" label="Cross-section"
            value={Amm2} min={0.01} max={100} step={0.01}
            format={v => v.toFixed(2) + ' mm²'}
            metaLeft="0.01 mm²" metaRight="100 mm²"
            onChange={setAmm2}
          />
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--text-muted)', letterSpacing: '.1em', lineHeight: 1.6 }}>
            R is geometry × material.<br />
            Length stretches series, area parallels.
          </div>
        </>
      }
      outputs={
        <>
          <Readout sym="ρ" label="Resistivity" value={prettyJsx(computed.rho)} unit="Ω·m" />
          <Readout sym="R" label="Resistance" value={prettyJsx(computed.R)} unit="Ω" highlight />
          <Readout sym="G" label="Conductance" value={prettyJsx(computed.G)} unit="S" />
          <Readout sym={<>V<sub>1A</sub></>} label="Voltage @ 1 A" value={prettyJsx(computed.R)} unit="V" />
          <Readout sym={<>P<sub>1A</sub></>} label="Power @ 1 A" value={prettyJsx(computed.R)} unit="W" />
          <Readout sym="≈" label="For scale" value={comp} />
        </>
      }
    />
  );

  const prose = (
    <>
      <h3 className="lab-section-h3">Context</h3>
      <p className="mb-prose-3">
        Every wire has a resistance. The microscopic law <strong className="text-text font-medium">J = σE</strong> is local — it tells you the current density at a single point.
        But circuits are built from finite, shaped pieces of conductor, and an engineer needs a single number characterizing each piece. That
        number is the resistance, and for a uniform straight wire it's set entirely by three quantities: the resistivity <strong className="text-text font-medium">ρ</strong> of
        the material, the length <strong className="text-text font-medium">L</strong>, and the cross-sectional area <strong className="text-text font-medium">A</strong>. The relation <strong className="text-text font-medium">R = ρL/A</strong>
        holds for steady DC current in a uniform, isotropic, ohmic conductor at constant temperature<Cite id="griffiths-2017" in={SOURCES} />.
        It breaks down for non-uniform geometries (use an integral), for anisotropic materials (resistivity is a tensor), at high frequencies
        (the skin effect concentrates current near the surface, effectively shrinking A), and once heating makes <em className="italic text-text">ρ</em> a moving
        target<Cite id="ashcroft-mermin-1976" in={SOURCES} />.
      </p>

      <h3 className="lab-section-h3">Formula</h3>
      <MathBlock>R = ρ L / A</MathBlock>
      <p className="mb-prose-3">
        Where <strong className="text-text font-medium">R</strong> is resistance in ohms (Ω), <strong className="text-text font-medium">ρ</strong> is the bulk resistivity of the material in Ω·m,
        <strong className="text-text font-medium"> L</strong> is the length of the conductor in meters, and <strong className="text-text font-medium">A</strong> is its cross-sectional area in m². Equivalent form
        with conductivity <strong className="text-text font-medium">σ = 1/ρ</strong> (units S/m): <strong className="text-text font-medium">R = L / (σA)</strong>. Reciprocally, <strong className="text-text font-medium">conductance G = 1/R</strong>
        in siemens (S).
      </p>

      <h3 className="lab-section-h3">Intuition</h3>
      <p className="mb-prose-3">
        Resistance is the rendezvous of material and shape. Material brings how slick the medium is (σ, ρ). Geometry brings how many obstacles
        sit in series (L) and how many parallel lanes are available (A). The asymmetry between length and area is the whole reason wires are
        wires: long, thin, and made of copper. Power transmission engineers live on the area side. Heater designers live on the length
        side<Cite id="kanthal" in={SOURCES} />.
      </p>
      <Pullout>
        Resistance is what conductivity looks like after geometry has had its say.
      </Pullout>

      <h3 className="lab-section-h3">Reasoning</h3>
      <p className="mb-prose-3">
        Why does <strong className="text-text font-medium">L</strong> sit on top? Length is the path the field drives charges over. Double the length and every coulomb travels
        twice as far under the same per-unit-length drag. For a fixed current, that means twice the voltage to push them through — R doubles.
        A long wire <em className="italic text-text">is</em> two short wires in series.
      </p>
      <p className="mb-prose-3">
        Why does <strong className="text-text font-medium">A</strong> sit on the bottom? Area is the number of parallel lanes. Double the cross-section and twice as many
        electrons flow side-by-side, sharing the load. For the same total current, you only need half the current density, and so half the
        field, and so half the voltage — R halves. A fat wire <em className="italic text-text">is</em> two thin wires in parallel.
      </p>
      <p className="mb-prose-3">
        Why the exact power of 1 in both? Because <strong className="text-text font-medium">R</strong> sums linearly in series (length doubles ⇒ R doubles) and combines by
        reciprocal sum in parallel (two equal areas in parallel ⇒ R halves). Any other exponent would violate Kirchhoff's circuit
        laws<Cite id="griffiths-2017" in={SOURCES} />.
      </p>

      <h3 className="lab-section-h3">Derivation</h3>
      <p className="mb-prose-3">
        Start with a uniform wire of length L, cross-section A, with a battery of voltage V at the ends. In steady state, surface charges
        redistribute so the field inside is uniform and axial:
      </p>
      <MathBlock>E = V / L</MathBlock>
      <p className="mb-prose-3">Microscopic Ohm's law gives current density:</p>
      <MathBlock>J = σ E = σ V / L</MathBlock>
      <p className="mb-prose-3">Total current is J integrated over the cross-section. For uniform J, that's just JA:</p>
      <MathBlock>I = J A = σ A V / L</MathBlock>
      <p className="mb-prose-3">Rearrange for V:</p>
      <MathBlock>V = (L / σA) · I = R · I</MathBlock>
      <p className="mb-prose-3">Substitute ρ = 1/σ:</p>
      <MathBlock>R = ρ L / A</MathBlock>
      <p className="mb-prose-3">
        Series and parallel rules fall out of the same derivation. For two segments end-to-end with the same current, voltages add:
        <strong className="text-text font-medium"> R<sub>series</sub> = R<sub>1</sub> + R<sub>2</sub></strong> — exactly what you'd get by doubling L. For two side-by-side wires
        with the same voltage, currents add: <strong className="text-text font-medium">1/R<sub>parallel</sub> = 1/R<sub>1</sub> + 1/R<sub>2</sub></strong> — exactly what you'd
        get by adding the areas.
      </p>
      <p className="mb-prose-3">
        For temperature dependence (not modelled in the lab), a linear approximation works over modest ranges:
      </p>
      <MathBlock>ρ(T) ≈ ρ<sub>0</sub> · [1 + α (T − T<sub>0</sub>)]</MathBlock>
      <p className="mb-prose-3">
        with α ≈ 3.9×10⁻³ /K for copper at room temperature<Cite id="crc-resistivity" in={SOURCES} />. In metals α &gt; 0 (more lattice
        vibrations, more scattering); in intrinsic semiconductors α &lt; 0 (thermal activation generates more carriers). The sign of dρ/dT is one
        of the tidiest experimental distinctions between a metal and an insulator<Cite id="ashcroft-mermin-1976" in={SOURCES} />.
      </p>

      <h3 className="lab-section-h3">Worked problems</h3>

      <p className="mb-prose-3">
        Reference numbers (CRC, room-temperature)<Cite id="crc-resistivity" in={SOURCES} />: ρ<sub>Cu</sub> ≈ 1.68×10⁻⁸ Ω·m,
        ρ<sub>Al</sub> ≈ 2.65×10⁻⁸ Ω·m, ρ<sub>Fe</sub> ≈ 1.0×10⁻⁷ Ω·m, ρ<sub>W</sub> ≈ 5.6×10⁻⁸ Ω·m, ρ<sub>nichrome</sub> ≈ 1.1×10⁻⁶ Ω·m.
        Temperature coefficient α<sub>Cu</sub> ≈ 3.9×10⁻³ /K.
      </p>

      <TryIt
        tag="Problem 3.2.1"
        question={<>A copper wire 1 mm² in cross-section and 1 m long, at 20 °C. What is its resistance?</>}
        answer={
          <>
            <MathBlock>R = ρ L / A = (1.68×10⁻⁸) · 1 / (1×10⁻⁶) = 1.68×10⁻² Ω</MathBlock>
            <p className="mb-prose-3">Answer: <strong className="text-text font-medium">≈ 17 mΩ</strong>. That's about a tenth of an ohm per six meters of millimeter-thick copper.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 3.2.2"
        question={<>Same geometry, aluminum instead of copper. How does R compare?</>}
        answer={
          <>
            <MathBlock>R<sub>Al</sub> = (2.65×10⁻⁸) · 1 / (1×10⁻⁶) ≈ 26.5 mΩ</MathBlock>
            <p className="mb-prose-3">
              Answer: about <strong className="text-text font-medium">26.5 mΩ</strong> — roughly 58% more resistance than copper. But aluminum is one-third the density. Per
              kilogram, aluminum conducts about twice as well as copper, which is why long-distance overhead transmission lines are
              aluminum-cored — they sag less under their own weight.
            </p>
          </>
        }
      />

      <TryIt
        tag="Problem 3.2.3"
        question={<>The same copper wire (1 mm² × 1 m), but heated to 100 °C. What is its resistance now?</>}
        hint={<>Use ρ(T) = ρ<sub>0</sub> · [1 + α ΔT] with α ≈ 3.9×10⁻³/K.</>}
        answer={
          <>
            <MathBlock>ΔT = 100 − 20 = 80 K</MathBlock>
            <MathBlock>ρ(100°C) ≈ ρ<sub>0</sub> · (1 + 0.0039 · 80) = ρ<sub>0</sub> · 1.31</MathBlock>
            <MathBlock>R ≈ 17 mΩ · 1.31 ≈ 22 mΩ</MathBlock>
            <p className="mb-prose-3">
              Answer: about <strong className="text-text font-medium">22 mΩ</strong>, a 31% increase. Motor windings and transformer copper run hot enough that this matters for
              efficiency calculations.
            </p>
          </>
        }
      />

      <TryIt
        tag="Problem 3.2.4"
        question={<>AWG 14 copper wire has a cross-section of about 2.08 mm². You run 30 m of it from a panel to a far outlet. What is the round-trip resistance (out and back)?</>}
        answer={
          <>
            <p className="mb-prose-3">Total wire length is 2 × 30 = 60 m:</p>
            <MathBlock>R = (1.68×10⁻⁸) · 60 / (2.08×10⁻⁶) ≈ 0.485 Ω</MathBlock>
            <p className="mb-prose-3">
              Answer: about <strong className="text-text font-medium">0.49 Ω</strong> round-trip. At 15 A this drops V = I R ≈ 7.3 V — about 6% of 120 V, near the U.S. National
              Electrical Code's recommended 3% per branch / 5% total ceiling. That's why long runs go up a gauge.
            </p>
          </>
        }
      />

      <TryIt
        tag="Problem 3.2.5"
        question={<>You double the length of a wire and halve its cross-sectional area. By what factor does R change?</>}
        answer={
          <>
            <MathBlock>R<sub>new</sub>/R<sub>old</sub> = (L<sub>new</sub>/L<sub>old</sub>) · (A<sub>old</sub>/A<sub>new</sub>) = 2 · 2 = 4</MathBlock>
            <p className="mb-prose-3">Answer: R increases by a factor of <strong className="text-text font-medium">4</strong>. The geometric effects compound multiplicatively, not additively.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 3.2.6"
        question={<>Seawater has ρ ≈ 0.2 Ω·m. Compute the resistance of a 1 m cube of seawater, measured face-to-face.</>}
        answer={
          <>
            <p className="mb-prose-3">L = 1 m, A = 1 m²:</p>
            <MathBlock>R = (0.2) · 1 / 1 = 0.2 Ω</MathBlock>
            <p className="mb-prose-3">
              Answer: <strong className="text-text font-medium">0.2 Ω</strong> per meter-cube — about ten million times more resistive than a copper cube of the same size, but
              still vastly less than freshwater (which is ~10⁴ Ω·m or more, depending on impurities). Salt ions carry the current; the salinity
              and temperature set ρ.
            </p>
          </>
        }
      />

      <TryIt
        tag="Problem 3.2.7"
        question={<>A 14 AWG copper branch circuit carries 15 A over a 30 m one-way run. What voltage drops along the round-trip wiring?</>}
        answer={
          <>
            <p className="mb-prose-3">Using the 0.49 Ω round-trip from Problem 3.2.4:</p>
            <MathBlock>V<sub>drop</sub> = I R = 15 A · 0.49 Ω ≈ 7.3 V</MathBlock>
            <p className="mb-prose-3">
              Answer: <strong className="text-text font-medium">≈ 7.3 V</strong>, about 6% of the 120 V supply. Lights at the far end will be visibly dimmer; resistive heaters
              will run noticeably below rated power (since P ∝ V²). Code says to go to 12 AWG.
            </p>
          </>
        }
      />

      <TryIt
        tag="Problem 3.2.8"
        question={<>In one sentence: why is resistance directly proportional to L?</>}
        answer={
          <>
            <p className="mb-prose-3">
              Because doubling the length stacks two identical pieces of wire in series, and resistors in series add — equivalently, each
              electron has to push past twice as many lattice ions on its trip from one end to the other, so for the same drift speed (same
              current) you need twice the voltage.
            </p>
          </>
        }
      />

      <TryIt
        tag="Problem 3.2.9"
        question={<>A thin metal film 100 nm thick is patterned into a square 10 mm on a side. If the bulk resistivity of the film is ρ ≈ 2×10⁻⁸ Ω·m, what is the resistance measured edge-to-edge across the square?</>}
        hint={<>L = 10 mm, A = thickness · width.</>}
        answer={
          <>
            <p className="mb-prose-3">A = (100×10⁻⁹ m) · (10×10⁻³ m) = 1×10⁻⁹ m²</p>
            <MathBlock>R = ρ L / A = (2×10⁻⁸) · (10×10⁻³) / (1×10⁻⁹) = 0.2 Ω</MathBlock>
            <p className="mb-prose-3">
              Answer: <strong className="text-text font-medium">≈ 0.2 Ω per square</strong>. Notice that the width <em className="italic text-text">cancels the length</em> for a square (L/A both scale with
              the side, but A includes thickness). That cancellation is why thin-film designers quote <em className="italic text-text">sheet resistance</em>
              <strong className="text-text font-medium"> R<sub>s</sub> = ρ/t</strong> in Ω/□ (ohms per square): the resistance of any square patch of film, regardless of size, is
              just R<sub>s</sub>, and total R for a strip of N squares is N · R<sub>s</sub>.
            </p>
          </>
        }
      />

      <TryIt
        tag="Problem 3.2.10"
        question={<>Why do precision lab measurements use a four-wire (Kelvin) connection to a resistor, not a two-wire one?</>}
        answer={
          <>
            <p className="mb-prose-3">
              The wires leading from the meter to the device-under-test are themselves resistors. In a two-wire measurement, the current source
              and the voltmeter share those leads — so the meter reads <em className="italic text-text">R<sub>device</sub> + R<sub>leads</sub></em>. The lead resistance can
              be 0.1 Ω or more, which is fatal when measuring milliohm devices.
            </p>
            <p className="mb-prose-3">
              In a four-wire measurement, current is forced down a dedicated pair of leads, while a separate pair of voltage-sense leads taps
              directly across the device. The voltage-sense leads carry essentially zero current (a high-impedance meter), so their resistance
              drops no voltage, so the reading <em className="italic text-text">V<sub>sense</sub>/I<sub>force</sub></em> sees only R<sub>device</sub>. Lead resistance is
              cancelled by construction.
            </p>
          </>
        }
      />

      <TryIt
        tag="Problem 3.2.11"
        question={<>AWG 16 aluminum wire has cross-section about 1.31 mm². Compute the resistance of 1 km of it, and the current that flows if you connect such a wire across a 12 V battery (zero internal resistance, no other load).</>}
        answer={
          <>
            <MathBlock>R = (2.65×10⁻⁸) · 1000 / (1.31×10⁻⁶) ≈ 20.2 Ω</MathBlock>
            <MathBlock>I = V / R = 12 / 20.2 ≈ 0.59 A</MathBlock>
            <p className="mb-prose-3">
              Answer: about <strong className="text-text font-medium">20 Ω</strong> and <strong className="text-text font-medium">~0.6 A</strong>. The full 12 V drops along the wire itself — useful as an extended
              heating element, useless as a transmission line. Real telecom and power lines run at kilovolts precisely so that the I·R drop is
              a small fraction of the line voltage.
            </p>
          </>
        }
      />
    </>
  );

  return (
    <LabShell
      slug={SLUG}
      labSubtitle="Geometry & Material"
      labId="resistance-3.2 / R = ρL/A"
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

function drawAreaGauge(ctx: CanvasRenderingContext2D, cx: number, cy: number, Amm2: number) {
  const A = Math.max(0.01, Math.min(100, Amm2));
  const tFrac = (Math.log10(A) - Math.log10(0.01)) / (Math.log10(100) - Math.log10(0.01));
  const r = 6 + tFrac * 28;
  ctx.strokeStyle = getCanvasColors().teal;
  ctx.fillStyle = 'rgba(108,197,194,0.12)';
  ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = getCanvasColors().teal;
  ctx.beginPath();
  ctx.moveTo(cx - r - 4, cy); ctx.lineTo(cx + r + 4, cy);
  ctx.moveTo(cx, cy - r - 4); ctx.lineTo(cx, cy + r + 4);
  ctx.stroke();
  ctx.fillStyle = getCanvasColors().teal;
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(`A = ${Amm2.toFixed(2)} mm²`, cx + r + 12, cy);
}
