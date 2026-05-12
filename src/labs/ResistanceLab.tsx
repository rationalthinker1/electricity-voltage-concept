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
import { MATERIALS, pretty, type MaterialKey } from '@/lib/physics';
import { BASE_LAB_SOURCES } from '@/labs/data/manifest';

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
    const { ctx, w, h } = info;
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

      ctx.fillStyle = '#0d0d10';
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
      ctx.fillStyle = 'rgba(160,158,149,0.85)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      const lLabel = L < 0.1 ? (L * 1000).toFixed(1) + ' mm'
                  : L < 1   ? (L * 100).toFixed(1) + ' cm'
                  : L.toFixed(2) + ' m';
      ctx.fillText(`L = ${lLabel}`, (wireLeft + wireRight) / 2, tickY - 8);

      // Schematic resistor symbol above the length ruler
      drawResistorSymbol(ctx, w / 2 - 60, tickY - 56, 120, 22);

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
      ctx.fillStyle = '#5baef8';
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
      ctx.fillStyle = '#ff6b2a';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(MATERIALS[material]!.name.toUpperCase(), 16, 12);
      ctx.fillStyle = 'rgba(160,158,149,0.85)';
      ctx.fillText(`ρ = ${pretty(computed.rho).replace(/<[^>]+>/g, '')} Ω·m`, 16, 28);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#ff6b2a';
      ctx.fillText(`R = ${pretty(computed.R).replace(/<[^>]+>/g, '')} Ω`, w - 16, 12);
      ctx.fillStyle = 'rgba(160,158,149,0.85)';
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
          <Readout sym="ρ" label="Resistivity" valueHTML={pretty(computed.rho)} unit="Ω·m" />
          <Readout sym="R" label="Resistance" valueHTML={pretty(computed.R)} unit="Ω" highlight />
          <Readout sym="G" label="Conductance" valueHTML={pretty(computed.G)} unit="S" />
          <Readout sym={<>V<sub>1A</sub></>} label="Voltage @ 1 A" valueHTML={pretty(computed.R)} unit="V" />
          <Readout sym={<>P<sub>1A</sub></>} label="Power @ 1 A" valueHTML={pretty(computed.R)} unit="W" />
          <Readout sym="≈" label="For scale" valueHTML={comp} />
        </>
      }
    />
  );

  const prose = (
    <>
      <h3>From microscopic to macroscopic</h3>
      <p>
        A previous lab gave the local law: <strong>J = σE</strong>. At every point inside a conductor, the current density is the conductivity
        times the field, full stop. That's a statement about <em>points</em>. To wire up a circuit, you need a statement about <em>wires</em>: how
        much current flows when you connect a real, finite piece of metal to a real voltage source. That statement is <strong>V = IR</strong>, and
        the lump constant <strong>R</strong> is what the field-level law looks like after you integrate it over the geometry of the wire<Cite id="griffiths-2017" in={SOURCES} />.
      </p>
      <p>
        Resistance is the rendezvous of material and shape. The material brings its <strong>σ</strong> (or equivalently its resistivity
        <strong> ρ = 1/σ</strong>). The shape brings its length and its cross-section. Multiply them together the way the integrals demand,
        and you get a single number with units of ohms.
      </p>
      <Pullout>
        Resistance is what conductivity looks like after geometry has had its say.
      </Pullout>

      <h3>Derivation, in stages</h3>
      <p>
        Imagine a straight wire of length <strong>L</strong> and uniform cross-section <strong>A</strong> connected to a battery of voltage
        <strong> V</strong>. Inside the wire, the field is roughly uniform along the axis (in steady state, surface charges redistribute to make this so):
      </p>
      <MathBlock>E = V / L</MathBlock>
      <p>Microscopic Ohm's law converts that field into a current density:</p>
      <MathBlock>J = σ E = σ V / L</MathBlock>
      <p>
        Total current is current density integrated over the cross-section. For uniform J, that's just <strong>I = JA</strong>:
      </p>
      <MathBlock>I = σ A V / L</MathBlock>
      <p>Rearrange to put <strong>V</strong> on one side:</p>
      <MathBlock>V = (L / σA) · I = R · I</MathBlock>
      <p>
        The bracketed term is the resistance. Substitute <strong>ρ = 1/σ</strong> (the resistivity is the inverse of conductivity, units
        of Ω·m) and you have the textbook form:
      </p>
      <MathBlock>R = ρ L / A</MathBlock>
      <p>Three numbers. A property of the material times a property of the shape.</p>

      <h3>Why this geometry</h3>
      <p>
        Why does <strong>L</strong> live in the numerator? Length is the path the field drives the charges over. Double the length and you double
        the distance every coulomb has to travel under the same drag. For a fixed current, that means twice the voltage to push them along — resistance has doubled.
      </p>
      <p>
        Why does <strong>A</strong> live in the denominator? Area is the number of parallel paths. Doubling the cross-section means twice as
        many electrons can flow side-by-side, sharing the load. For the same current you only need half the current density, and so half the
        field, and so half the voltage. Resistance has halved.
      </p>
      <p>
        The asymmetry between length and area is the whole reason wires are wires — long, thin, and made of copper. Power transmission engineers
        live on the area side of the equation. Heater designers live on the length side<Cite id="kanthal" in={SOURCES} />.
      </p>

      <h3>Series and parallel</h3>
      <p>
        Two resistors in <em>series</em> share the same current; the voltages add. So:
      </p>
      <MathBlock>R<sub>series</sub> = R<sub>1</sub> + R<sub>2</sub></MathBlock>
      <p>That's the formula for a single longer wire, written for two pieces in a row. A long wire <em>is</em> many short wires in series.</p>
      <p>Two resistors in <em>parallel</em> share the same voltage; the currents add:</p>
      <MathBlock>1 / R<sub>parallel</sub> = 1 / R<sub>1</sub> + 1 / R<sub>2</sub></MathBlock>
      <p>
        That's the formula for a single fatter wire, written for two pieces side-by-side. Series and parallel rules aren't separate from
        <strong> R = ρL/A</strong> — they <em>are</em> that formula, applied twice and rearranged<Cite id="griffiths-2017" in={SOURCES} />.
      </p>

      <h3>Material is destiny</h3>
      <p>
        Try every entry in the material dropdown. Copper, the workhorse, has <strong>ρ ≈ 1.7×10<sup>−8</sup> Ω·m</strong>.
        Silver edges it out by a few percent. <strong>Aluminum</strong> is about 60% as conductive but a third of the density — the reason long-distance
        power lines are aluminum-cored rather than copper<Cite id="crc-resistivity" in={SOURCES} />.
      </p>
      <p>
        <strong>Tungsten</strong> is roughly six times worse than copper at room temperature, but the property that matters is that it stays solid
        above 3000 K. That's what lets it become a filament<Cite id="crc-resistivity" in={SOURCES} />. <strong>Nichrome</strong> is intentionally,
        deliberately bad — about seventy times worse than copper — and that's <em>why</em> it ends up in toasters and space heaters<Cite id="kanthal" in={SOURCES} />.
        Resistance is the design variable, not the side effect.
      </p>
      <p>
        Past the metals, the dynamic range opens up. Semiconductors, insulators, and superconductors span more than twenty orders of magnitude
        in resistivity. No other material parameter varies so violently<Cite id="ashcroft-mermin-1976" in={SOURCES} />.
      </p>

      <h4>Temperature dependence (mentioned, not modelled)</h4>
      <p>
        The numbers in the lab above are room-temperature. Real <strong>ρ</strong> is a function of temperature, and the sign of the dependence
        flips between conductors and insulators. In metals, lattice ions vibrate harder as <em>T</em> rises, so electrons scatter more, τ falls,
        σ falls, ρ rises<Cite id="ashcroft-mermin-1976" in={SOURCES} />. A glowing tungsten filament carries roughly ten times its cold resistance —
        which is also why incandescent bulbs draw a brief inrush current and tend to burn out at the moment of switch-on. The sign of dρ/dT is one
        of the tidiest experimental distinctions between a metal and an insulator.
      </p>
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

function drawResistorSymbol(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.strokeStyle = 'rgba(108,197,194,0.7)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(x, y + h / 2);
  ctx.lineTo(x + w * 0.10, y + h / 2);
  const peaks = [0.18, 0.30, 0.42, 0.54, 0.66, 0.78];
  let up = true;
  for (const p of peaks) {
    ctx.lineTo(x + w * p, up ? y : y + h);
    up = !up;
  }
  ctx.lineTo(x + w * 0.90, y + h / 2);
  ctx.lineTo(x + w, y + h / 2);
  ctx.stroke();
  ctx.fillStyle = 'rgba(108,197,194,0.85)';
  ctx.font = '9px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('R', x + w / 2, y + h + 4);
}

function drawAreaGauge(ctx: CanvasRenderingContext2D, cx: number, cy: number, Amm2: number) {
  const A = Math.max(0.01, Math.min(100, Amm2));
  const tFrac = (Math.log10(A) - Math.log10(0.01)) / (Math.log10(100) - Math.log10(0.01));
  const r = 6 + tFrac * 28;
  ctx.strokeStyle = 'rgba(108,197,194,0.85)';
  ctx.fillStyle = 'rgba(108,197,194,0.12)';
  ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = 'rgba(108,197,194,0.5)';
  ctx.beginPath();
  ctx.moveTo(cx - r - 4, cy); ctx.lineTo(cx + r + 4, cy);
  ctx.moveTo(cx, cy - r - 4); ctx.lineTo(cx, cy + r + 4);
  ctx.stroke();
  ctx.fillStyle = 'rgba(108,197,194,0.95)';
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(`A = ${Amm2.toFixed(2)} mm²`, cx + r + 12, cy);
}
