/**
 * Lab 3.4 — Joule Heating
 *
 *   P = V·I = I²R = V²/R
 *
 * Wire glow follows equilibrium temperature from Stefan–Boltzmann balance
 * (ε = 0.4). Heat-shimmer particles drift upward when P > threshold. Defaults
 * (tungsten, V=12 V, L=50 mm, A=0.001 mm²) put a thin filament around 50 W —
 * the order-of-magnitude of a small incandescent bulb at incandescent T.
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

const SLUG = 'joule';
const SOURCES = BASE_LAB_SOURCES[SLUG]!;

const EMISSIVITY = 0.4;

export default function JouleLab() {
  const [material, setMaterial] = useState<MaterialKey>('tungsten');
  const [V, setV] = useState(12);
  const [L, setL] = useState(0.05);     // m
  const [Amm2, setAmm2] = useState(0.001);

  const computed = useMemo(() => {
    const mat = MATERIALS[material]!;
    const A_m2 = Amm2 * 1e-6;
    const sigma = mat.sigma;
    const R = L / (sigma * A_m2);
    const I = V / R;
    const P = V * I;
    const vol = L * A_m2;
    const Edens = P / vol;
    // Time to boil 1 L (1 kg) of water 25→100 °C
    const Q_water = 1 * 4186 * 75;
    const t_water = P > 0 ? Q_water / P : Infinity;
    // Equilibrium T from radiation balance
    const r = Math.sqrt(A_m2 / Math.PI);
    const Asurf = 2 * Math.PI * r * L;
    const T_rad4 = P / (EMISSIVITY * PHYS.sigma_SB * Asurf);
    // Background 300 K floor so cold wires read room T
    const T_eq = Math.pow(Math.max(T_rad4, Math.pow(300, 4)), 0.25);
    return { R, I, P, Edens, t_water, T_eq, matName: mat.name };
  }, [material, V, L, Amm2]);

  const stateRef = useRef({ material, V, L, Amm2, computed });
  useEffect(() => {
    stateRef.current = { material, V, L, Amm2, computed };
  }, [material, V, L, Amm2, computed]);

  const setupCanvas = useCallback((info: CanvasInfo) => {
    const { ctx, w, h } = info;
    let raf = 0;

    const wireMarginX = 90;
    const N_SHIM = 60;
    type Shim = { x: number; y: number; life: number; vy: number; wob: number };
    const shimmer: Shim[] = [];

    function layout() {
      const { Amm2 } = stateRef.current;
      const wireCY = h / 2;
      const wireLeft = wireMarginX;
      const wireRight = w - wireMarginX;
      const A = Math.max(0.001, Math.min(5, Amm2));
      const tFrac = (Math.log10(A) - Math.log10(0.001)) / (Math.log10(5) - Math.log10(0.001));
      const thickness = 14 + tFrac * 106;
      return { wireLeft, wireRight, wireCY, thickness };
    }

    function seedShim() {
      const { wireLeft, wireRight, wireCY, thickness } = layout();
      shimmer.length = 0;
      for (let i = 0; i < N_SHIM; i++) {
        shimmer.push({
          x: wireLeft + Math.random() * (wireRight - wireLeft),
          y: wireCY - thickness / 2 - Math.random() * 6,
          life: Math.random(),
          vy: -0.3 - Math.random() * 0.6,
          wob: Math.random() * Math.PI * 2,
        });
      }
    }
    seedShim();

    let lastA = stateRef.current.Amm2;

    function draw() {
      const { material, V, L, Amm2, computed } = stateRef.current;
      if (Math.abs(Amm2 - lastA) > 0.0005) { lastA = Amm2; seedShim(); }

      const { wireLeft, wireRight, wireCY, thickness } = layout();
      const top = wireCY - thickness / 2;
      const bot = wireCY + thickness / 2;

      ctx.fillStyle = '#0d0d10';
      ctx.fillRect(0, 0, w, h);

      const col = tempToColor(computed.T_eq);
      const glow = col.glow;
      const visiblePower = computed.P > 0.1 && computed.T_eq > 600;

      // Outer glow halo
      if (visiblePower) {
        const haloR = 60 + glow * 100;
        const haloGrd = ctx.createRadialGradient(
          (wireLeft + wireRight) / 2, wireCY, thickness * 0.6,
          (wireLeft + wireRight) / 2, wireCY, haloR
        );
        haloGrd.addColorStop(0, `rgba(${col.r},${col.g},${col.b},${0.18 + 0.25 * glow})`);
        haloGrd.addColorStop(1, `rgba(${col.r},${col.g},${col.b},0)`);
        ctx.fillStyle = haloGrd;
        ctx.fillRect(wireLeft - 200, wireCY - haloR, (wireRight - wireLeft) + 400, haloR * 2);
      }

      // Wire body
      const grd = ctx.createLinearGradient(0, top, 0, bot);
      if (visiblePower) {
        const cr = col.r, cg = col.g, cb = col.b;
        grd.addColorStop(0,   `rgba(${cr},${cg},${cb},${0.20 + glow * 0.5})`);
        grd.addColorStop(0.5, `rgba(${Math.min(255, cr + 20)},${Math.min(255, cg + 30)},${Math.min(255, cb + 40)},${0.55 + glow * 0.45})`);
        grd.addColorStop(1,   `rgba(${cr},${cg},${cb},${0.20 + glow * 0.5})`);
      } else {
        grd.addColorStop(0, 'rgba(255,107,42,0.08)');
        grd.addColorStop(0.5, 'rgba(255,107,42,0.16)');
        grd.addColorStop(1, 'rgba(255,107,42,0.08)');
      }
      ctx.fillStyle = grd;
      const radius = Math.min(12, thickness * 0.45);
      roundRect(ctx, wireLeft, top, wireRight - wireLeft, thickness, radius);
      ctx.fill();

      if (visiblePower) {
        ctx.strokeStyle = `rgba(${col.r},${col.g},${col.b},${0.7 + 0.3 * glow})`;
        ctx.shadowColor = `rgba(${col.r},${col.g},${col.b},0.7)`;
        ctx.shadowBlur = 18 + glow * 24;
        ctx.lineWidth = 1.2;
        roundRect(ctx, wireLeft, top, wireRight - wireLeft, thickness, radius);
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else {
        ctx.strokeStyle = 'rgba(255,255,255,0.45)';
        ctx.lineWidth = 1;
        roundRect(ctx, wireLeft, top, wireRight - wireLeft, thickness, radius);
        ctx.stroke();
      }

      // Battery terminals
      ctx.fillStyle = '#ff3b6e';
      ctx.shadowColor = 'rgba(255,59,110,0.6)';
      ctx.shadowBlur = 14;
      ctx.fillRect(wireLeft - 18, top - 6, 4, thickness + 12);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ff3b6e';
      ctx.font = 'bold 18px "JetBrains Mono", monospace';
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

      // Heat shimmer
      if (visiblePower) {
        const intensity = Math.min(1, glow * 1.5);
        for (const s of shimmer) {
          s.life -= 0.008;
          s.y += s.vy;
          s.wob += 0.12;
          if (s.life <= 0 || s.y < wireCY - thickness / 2 - 90) {
            s.life = 1;
            s.x = wireLeft + Math.random() * (wireRight - wireLeft);
            s.y = wireCY - thickness / 2 - Math.random() * 4;
            s.vy = -0.3 - Math.random() * 0.6;
            s.wob = Math.random() * Math.PI * 2;
          }
          const sx = s.x + Math.sin(s.wob) * 4;
          const alpha = s.life * 0.5 * intensity;
          ctx.fillStyle = `rgba(${col.r},${col.g},${col.b},${alpha})`;
          ctx.beginPath();
          ctx.arc(sx, s.y, 1.5 + 1.5 * intensity, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Overlays
      ctx.textBaseline = 'top';
      ctx.fillStyle = '#ff6b2a';
      ctx.font = '14px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.shadowColor = 'rgba(255,107,42,0.6)';
      ctx.shadowBlur = 8;
      ctx.fillText(`P = ${pretty(computed.P).replace(/<[^>]+>/g, '')} W`, 16, 12);
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(160,158,149,0.85)';
      ctx.font = '10px "JetBrains Mono", monospace';
      const bulbs100 = computed.P / 100;
      let bulbTxt: string;
      if (bulbs100 < 0.01) bulbTxt = '— a faint LED indicator';
      else if (bulbs100 < 0.6) bulbTxt = `≈ ${(bulbs100 * 100).toFixed(0)}% of one 100 W bulb`;
      else if (bulbs100 < 1000) bulbTxt = `≈ ${bulbs100.toFixed(2)} × 100 W bulbs`;
      else bulbTxt = `≈ ${pretty(bulbs100).replace(/<[^>]+>/g, '')} × 100 W bulbs`;
      ctx.fillText(bulbTxt, 16, 36);

      ctx.fillStyle = visiblePower ? `rgb(${col.r},${col.g},${col.b})` : 'rgba(160,158,149,0.85)';
      ctx.font = '14px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`T ≈ ${pretty(computed.T_eq).replace(/<[^>]+>/g, '')} K`, w - 16, 12);
      ctx.fillStyle = 'rgba(160,158,149,0.85)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText(describeGlow(computed.T_eq, computed.P), w - 16, 36);

      // Material below
      ctx.fillStyle = '#ff6b2a';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(MATERIALS[material]!.name.toUpperCase(), wireLeft, bot + 24);
      ctx.fillStyle = 'rgba(160,158,149,0.9)';
      ctx.textAlign = 'right';
      const lLabel = L < 0.1 ? (L * 1000).toFixed(1) + ' mm' : L.toFixed(3) + ' m';
      ctx.fillText(`V = ${V.toFixed(2)} V   ·   L = ${lLabel}   ·   A = ${Amm2.toFixed(3)} mm²`, wireRight, bot + 24);

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
          <LegendItem swatchColor="var(--accent)">Wire glow scales with P</LegendItem>
          <LegendItem swatchColor="#ffcd66" dot>Heat shimmer</LegendItem>
          <LegendItem swatchColor="var(--pink)" dot>+ terminal</LegendItem>
          <LegendItem swatchColor="var(--blue)" dot>− terminal</LegendItem>
          <LegendItem style={{ marginLeft: 'auto', color: 'var(--accent)' }}>↳ Color follows equilibrium T (radiation balance)</LegendItem>
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
            value={V} min={0.01} max={240} step={0.01}
            format={v => v.toFixed(2) + ' V'}
            metaLeft="0.01 V" metaRight="240 V"
            onChange={setV}
          />
          <Slider sym="L" label="Wire length"
            value={L} min={0.001} max={10} step={0.001}
            format={v => v < 0.1 ? (v * 1000).toFixed(0) + ' mm' : v.toFixed(3) + ' m'}
            metaLeft="1 mm" metaRight="10 m"
            onChange={setL}
          />
          <Slider sym="A" label="Cross-section"
            value={Amm2} min={0.001} max={5} step={0.001}
            format={v => v.toFixed(3) + ' mm²'}
            metaLeft="0.001 mm²" metaRight="5 mm²"
            onChange={setAmm2}
          />
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--text-muted)', letterSpacing: '.1em', lineHeight: 1.6 }}>
            Equilibrium T solves<br />
            P = ε σ<sub>SB</sub> A<sub>surf</sub> T⁴ (ε = 0.4)<br />
            ρ is treated as T-independent.
          </div>
        </>
      }
      outputs={
        <>
          <Readout sym="R" label="Resistance" valueHTML={pretty(computed.R)} unit="Ω" />
          <Readout sym="I" label="Current" valueHTML={pretty(computed.I)} unit="A" />
          <Readout sym="P" label="Power dissipated" valueHTML={pretty(computed.P)} unit="W" highlight />
          <Readout sym={<>p<sub>v</sub></>} label="Power density" valueHTML={pretty(computed.Edens)} unit="W/m³" />
          <Readout sym={<>t<sub>boil</sub></>} label="Time to boil 1 L water" value={formatTime(computed.t_water)} />
          <Readout sym={<>T<sub>eq</sub></>} label="Equilibrium temperature" valueHTML={pretty(computed.T_eq)} unit="K" />
          <Readout sym="☀" label="Visual state" value={describeGlow(computed.T_eq, computed.P)} />
        </>
      }
    />
  );

  const prose = (
    <>
      <h3>The energy bookkeeping</h3>
      <p>
        Move one coulomb of charge across a voltage drop of <strong>V</strong> volts and, by definition, you've moved <strong>V joules</strong> of
        electrical energy. Where did those joules go? Not into kinetic energy of the charge — the electrons exit the wire at the same drift
        speed they entered. Not into raising the charge's potential — the field <em>lowered</em> its potential by exactly <em>V</em>. They went
        into the lattice. Every Drude collision is a tiny inelastic transfer: the electron picked up kinetic energy between collisions, then dumped
        it as vibration when it next hit an ion<Cite id="griffiths-2017" in={SOURCES} />.
      </p>
      <p>
        The wire warms. Not because it stored anything — it didn't — but because it intercepted a continuous flow of energy coming in from the
        surrounding field (the Poynting flux of an earlier chapter) and converted it irreversibly into heat.
      </p>
      <Pullout>
        The wire doesn't store the energy. The wire intercepts it.
      </Pullout>

      <h3>Three equivalent formulas</h3>
      <p>
        Power dissipated in a resistor is one number written three ways. From the energy-per-charge picture, each second <em>I</em> coulombs cross
        the resistor, each losing <em>V</em> joules:
      </p>
      <MathBlock>P = V · I</MathBlock>
      <p>Substitute <strong>V = IR</strong>:</p>
      <MathBlock>P = I² R</MathBlock>
      <p>Or substitute <strong>I = V/R</strong>:</p>
      <MathBlock>P = V² / R</MathBlock>
      <p>
        Joule measured this in 1841 with the calorimeter that bears his name, and got the unit too<Cite id="joule-1841" in={SOURCES} />. In a series chain the
        first form is convenient (same I everywhere); in parallel the second is (same V everywhere). All three are the same equation.
      </p>

      <h3>Microscopic picture</h3>
      <p>
        Pick a tiny volume inside the wire. The rate at which the field does work on the moving charge per unit volume is the dot product:
      </p>
      <MathBlock>p<sub>v</sub> = J · E = σ E² = J² / σ</MathBlock>
      <p>
        Always positive (E and J point the same way in a resistor). Every cubic meter of conductor is converting <strong>σE²</strong> watts into heat.
        Integrate over the wire's volume <strong>LA</strong>, with E = V/L throughout:
      </p>
      <MathBlock>P = σ (V/L)² · LA = σ A V² / L = V² / R</MathBlock>
      <p>
        The macroscopic and microscopic accounts agree exactly. They have to — it's the same flow of energy, viewed at two zoom levels<Cite id="griffiths-2017" in={SOURCES} />.
      </p>

      <h3>Why incandescent bulbs glow</h3>
      <p>
        The lab above starts in a tungsten-filament configuration. The filament is short (~5 cm), spectacularly thin (~0.001 mm²), and a poor
        conductor compared to copper<Cite id="crc-resistivity" in={SOURCES} />. The resistance comes out a few ohms; at 12 V it carries a few amps and dissipates tens of
        watts. Skinny wire with a lot of power dumped into it has nowhere to send the energy except by radiating. The equilibrium temperature is set
        by Stefan–Boltzmann:
      </p>
      <MathBlock>P = ε σ<sub>SB</sub> A<sub>surf</sub> T⁴</MathBlock>
      <p>
        where <strong>ε</strong> is the emissivity (tungsten in vacuum ~0.4) and <strong>A<sub>surf</sub> = 2πrL</strong> is the lateral surface area.
        Solve for <em>T</em>. With a real bulb's geometry you land near 2800 K. At that temperature, tungsten's blackbody spectrum overlaps the
        visible enough to produce useful illumination. About 5% of the input power escapes as visible light; the rest leaves as infrared.
      </p>

      <h3>Why heaters are intentional resistors</h3>
      <p>
        Switch the material dropdown to <strong>nichrome</strong>. Its conductivity is roughly seventy times lower than copper's by design — it's
        an alloy chosen because it stays solid and chemically passive in air at red-hot temperatures, where copper would have melted and oxidized
        to powder<Cite id="kanthal" in={SOURCES} />. A typical toaster element is a length of nichrome ribbon sized to dissipate around a kilowatt at 120 V:
      </p>
      <MathBlock>R ≈ V² / P = 120² / 1000 ≈ 14 Ω,   I ≈ 8.3 A</MathBlock>
      <p>
        That's the design. Pick the cross-section and length to land on a resistance that gives the right power at line voltage, and the right
        operating temperature for whatever transfer mode you want. Space heaters, hair dryers, stovetop coils — same physics, different geometry.
        The resistor isn't a parasitic loss to engineer away. It's the entire product.
      </p>

      <h4>Limits of this picture</h4>
      <p>
        The lab above assumes steady state and treats resistivity as temperature-independent. Both are approximations. In reality, ρ rises
        substantially as a metal heats — tungsten's hot resistance is around ten times its cold value<Cite id="crc-resistivity" in={SOURCES} /> — so the cold filament grabs
        a big inrush current at the moment of switch-on. The lab is also DC-only. At high frequencies, inductance, capacitance, and the skin effect
        all add terms. At 50/60 Hz line frequency these effects are tiny: a heating element really is, to excellent approximation, a pure resistor.
      </p>
    </>
  );

  return (
    <LabShell
      slug={SLUG}
      labSubtitle="Power, Heat, and Glow"
      labId="joule-3.4 / P = I²R"
      labContent={labContent}
      prose={prose}
    />
  );
}

function describeGlow(T: number, P: number) {
  if (P < 0.1) return 'cold';
  if (T < 600) return 'warm (no visible glow)';
  if (T < 900) return 'dull red';
  if (T < 1300) return 'cherry red';
  if (T < 1700) return 'orange';
  if (T < 2200) return 'yellow';
  if (T < 3000) return 'white hot';
  return 'beyond melting';
}

function tempToColor(T: number) {
  if (T < 600) return { r: 200, g: 200, b: 200, glow: 0 };
  const t = Math.max(0, Math.min(1, (T - 600) / 2900));
  let r: number, g: number, b: number;
  if (t < 0.3) {
    const k = t / 0.3;
    r = 140 + k * 115; g = 20 + k * 30;  b = 10 + k * 10;
  } else if (t < 0.6) {
    const k = (t - 0.3) / 0.3;
    r = 255;          g = 50 + k * 130; b = 20 + k * 20;
  } else if (t < 0.85) {
    const k = (t - 0.6) / 0.25;
    r = 255;          g = 180 + k * 60; b = 40 + k * 100;
  } else {
    const k = (t - 0.85) / 0.15;
    r = 255;          g = 240 + k * 15; b = 140 + k * 115;
  }
  return { r: r | 0, g: g | 0, b: b | 0, glow: t };
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
