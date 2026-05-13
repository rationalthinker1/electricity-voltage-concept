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
import { TryIt } from '@/components/TryIt';
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
      <h3>Context</h3>
      <p>
        Joule heating — also called ohmic or resistive dissipation — is the conversion of electrical energy into thermal energy as current
        flows through a resistor. The same physics powers space heaters, toaster ribbons, incandescent filaments, fuses, motor I²R losses,
        transmission-line losses, and the unintentional heat that has to be removed from every CPU. Joule measured the equivalence between
        electrical work and heat in 1841 with a calorimeter, establishing the unit named for him<Cite id="joule-1841" in={SOURCES} />. The
        formulas <strong>P = VI = I²R = V²/R</strong> are exact for an ideal ohmic resistor at constant temperature, in steady state, on DC or
        at frequencies low compared to inverses of the device's reactive time constants. They break down when <em>R</em> itself depends on
        temperature (incandescent inrush), when reactive elements store and return energy each cycle (you have to use RMS values and add
        capacitive/inductive terms), and at the quantum-scale extreme of ballistic conductors where there are no scattering events to
        dissipate energy<Cite id="griffiths-2017" in={SOURCES} />.
      </p>

      <h3>Formula</h3>
      <MathBlock>P = V I = I² R = V² / R</MathBlock>
      <p>
        Where <strong>P</strong> is power in watts (W), <strong>V</strong> is the voltage across the resistor in volts (V),
        <strong> I</strong> is the current through it in amperes (A), and <strong>R</strong> is the resistance in ohms (Ω). Energy delivered
        over a time interval Δt is <strong>E = P · Δt</strong> in joules (J), or in practical-unit kilowatt-hours (kWh) for billing
        (1 kWh = 3.6×10⁶ J). The microscopic version is <strong>p<sub>v</sub> = J · E = σE²</strong> (power per unit volume, W/m³).
      </p>

      <h3>Intuition</h3>
      <p>
        Move one coulomb of charge across a voltage drop of <em>V</em> volts and you've delivered <em>V</em> joules of electrical energy. Move
        one coulomb per second — that's an ampere — and you've delivered <em>V</em> joules per second, i.e. <em>V</em> watts. Power is simply
        the rate at which charges fall through the potential drop, multiplied by the size of that drop. In a resistor, none of that energy
        ends up as kinetic energy of the charges (they exit at the same drift speed they entered) or as raised electrical PE (the field
        <em> lowered</em> their potential). It all goes into the lattice, as heat.
      </p>
      <Pullout>
        The wire doesn't store the energy. The wire intercepts it.
      </Pullout>

      <h3>Reasoning</h3>
      <p>
        Why three equivalent forms? Because two of three variables (V, I, R) fully determine the third by Ohm's law, so any algebraic
        combination can be re-expressed in terms of any pair. P = VI is the most fundamental: it follows from the <em>definition</em> of
        voltage as energy-per-charge and current as charge-per-time. The other two are convenient algebraic specializations: P = I²R is the
        right form in a series chain (same I, different R's); P = V²/R is the right form in parallel (same V, different R's).
      </p>
      <p>
        Why the <em>quadratic</em> dependence on V or I? Because doubling V doubles I (Ohm's law), and power is their product. The intuition
        from this is consequential: line losses scale as I², which is why long-distance transmission uses high voltage (smaller I for the
        same delivered power means much smaller resistive loss along the line).
      </p>
      <p>
        Why is the sign of P always positive in a resistor? Because <strong>J · E ≥ 0</strong> everywhere inside an ohmic conductor: the field
        and the current point the same way. A capacitor or inductor can have negative instantaneous power (returning stored energy). A pure
        resistor can't<Cite id="griffiths-2017" in={SOURCES} />.
      </p>

      <h3>Derivation</h3>
      <p>
        <em>Macroscopic, from definitions.</em> Work to move charge dq across a potential difference V is dW = V dq. Differentiate with
        respect to time:
      </p>
      <MathBlock>dW/dt = V · dq/dt = V · I   ⇒   P = V I</MathBlock>
      <p>
        Substitute V = IR or I = V/R using Ohm's law:
      </p>
      <MathBlock>P = (IR) · I = I² R   and   P = V · (V/R) = V² / R</MathBlock>
      <p>
        <em>Microscopic, from field × current density.</em> Power per unit volume delivered to charges by the field is the dot product
        of <strong>E</strong> and the current density <strong>J</strong>:
      </p>
      <MathBlock>p<sub>v</sub> = J · E = σ E² = J² / σ</MathBlock>
      <p>
        For a uniform wire of length L and cross-section A, with E = V/L and total volume V<sub>vol</sub> = LA:
      </p>
      <MathBlock>P = p<sub>v</sub> · V<sub>vol</sub> = σ (V/L)² · LA = σ A V² / L = V² / R</MathBlock>
      <p>
        Macroscopic and microscopic accounts agree exactly — they describe the same flow of energy, viewed at two zoom
        levels<Cite id="griffiths-2017" in={SOURCES} />.
      </p>
      <p>
        <em>Where the energy actually comes from.</em> In the Poynting picture, the energy enters the wire as electromagnetic flux <strong>S = E × H</strong>
        through the wire's cylindrical surface — flowing in from the surrounding field, not down the wire's length. The wire's job is to
        absorb that flux and convert it to heat at the lattice<Cite id="griffiths-2017" in={SOURCES} />. Joule dissipation is the closing of an
        energy-bookkeeping loop, not the depletion of any reservoir inside the wire.
      </p>

      <h3>Worked problems</h3>

      <TryIt
        tag="Problem 3.4.1"
        question={<>A 1 kΩ resistor is placed across a 9 V battery. What power does it dissipate?</>}
        answer={
          <>
            <MathBlock>P = V² / R = 81 / 1000 = 0.081 W = 81 mW</MathBlock>
            <p>
              Answer: <strong>81 mW</strong>. A standard ¼ W resistor handles this with comfortable margin; an ⅛ W part would also be fine but
              with less headroom.
            </p>
          </>
        }
      />

      <TryIt
        tag="Problem 3.4.2"
        question={<>A 60 W incandescent bulb operates at 120 V (US line voltage). What is the operating current?</>}
        answer={
          <>
            <MathBlock>I = P / V = 60 / 120 = 0.5 A</MathBlock>
            <p>
              Answer: <strong>0.5 A</strong>. A typical 15 A residential branch circuit can run thirty such bulbs in parallel before tripping
              the breaker.
            </p>
          </>
        }
      />

      <TryIt
        tag="Problem 3.4.3"
        question={<>Same 60 W bulb on 120 V. What is its <em>hot</em> (operating) resistance?</>}
        answer={
          <>
            <MathBlock>R<sub>hot</sub> = V² / P = 120² / 60 = 240 Ω</MathBlock>
            <p>
              Answer: <strong>240 Ω</strong>. The <em>cold</em> resistance of the same filament is about ten times less (~24 Ω) because tungsten's
              ρ rises sharply with temperature<Cite id="crc-resistivity" in={SOURCES} />. That's why bulbs draw a brief ~5 A inrush at switch-on
              and often fail at that moment.
            </p>
          </>
        }
      />

      <TryIt
        tag="Problem 3.4.4"
        question={<>A 1500 W resistive space heater on 120 V mains. Compute its operating current and resistance.</>}
        answer={
          <>
            <MathBlock>I = P / V = 1500 / 120 = 12.5 A</MathBlock>
            <MathBlock>R = V² / P = 120² / 1500 = 9.6 Ω</MathBlock>
            <p>
              Answer: <strong>12.5 A</strong> and <strong>9.6 Ω</strong>. The 12.5 A draw is close to the typical 15 A branch limit — which is
              why running a heater and a hair dryer on the same circuit trips the breaker. The 9.6 Ω is set by choosing nichrome ribbon of
              appropriate length and width<Cite id="kanthal" in={SOURCES} />.
            </p>
          </>
        }
      />

      <TryIt
        tag="Problem 3.4.5"
        question={<>A 1 GW transmission line has fixed line resistance R<sub>line</sub> = 5 Ω end-to-end. Compute the resistive line loss at (a) 500 kV and (b) at 120 V. What's the ratio?</>}
        hint={<>P<sub>loss</sub> = I² R<sub>line</sub>, where I = P<sub>delivered</sub>/V<sub>line</sub>.</>}
        answer={
          <>
            <p>(a) At 500 kV:</p>
            <MathBlock>I = 10⁹ / (5×10⁵) = 2000 A   ⇒   P<sub>loss</sub> = 2000² · 5 = 2×10⁷ W = 20 MW</MathBlock>
            <p>Loss is 2% of the 1 GW delivered — manageable.</p>
            <p>(b) At 120 V, the same 1 GW would require:</p>
            <MathBlock>I = 10⁹ / 120 ≈ 8.33×10⁶ A   ⇒   P<sub>loss</sub> = (8.33×10⁶)² · 5 ≈ 3.47×10¹⁴ W</MathBlock>
            <p>
              The "loss" is hundreds of <em>terawatts</em> — vastly more than the 1 GW we wanted to deliver. The line just melts. The ratio of
              losses is <strong>(500 000 / 120)² ≈ 1.7×10⁷</strong>: high-voltage transmission is seventeen million times more efficient per
              line. <em>This</em> is why the grid runs at hundreds of kilovolts.
            </p>
          </>
        }
      />

      <TryIt
        tag="Problem 3.4.6"
        question={<>A 12 V car battery is rated 100 A·hr. What is its total stored energy in joules and in kilowatt-hours?</>}
        answer={
          <>
            <MathBlock>Q<sub>total</sub> = 100 A·hr = 100 · 3600 s = 3.6×10⁵ C</MathBlock>
            <MathBlock>E = V · Q = 12 · 3.6×10⁵ = 4.32×10⁶ J</MathBlock>
            <MathBlock>E = 4.32×10⁶ J / 3.6×10⁶ J/kWh = 1.2 kWh</MathBlock>
            <p>
              Answer: <strong>4.32 MJ</strong> or <strong>1.2 kWh</strong>. Roughly the energy in 100 grams of TNT, or 30 seconds of an average
              U.S. household's power consumption. (Note: this is the maximum theoretical energy; real batteries deliver capacity that depends
              on discharge rate and temperature.)
            </p>
          </>
        }
      />

      <TryIt
        tag="Problem 3.4.7"
        question={<>A 100 W lamp is left on continuously for one month. Compute the energy used in kWh and the cost at $0.15/kWh.</>}
        answer={
          <>
            <MathBlock>t = 30 days · 24 hr/day = 720 hr</MathBlock>
            <MathBlock>E = 100 W · 720 hr = 72 000 Wh = 72 kWh</MathBlock>
            <MathBlock>cost = 72 · 0.15 = $10.80</MathBlock>
            <p>
              Answer: <strong>72 kWh</strong>, costing <strong>~$10.80</strong>. The kWh-meter on a building literally integrates P over time
              and reports it in this unit.
            </p>
          </>
        }
      />

      <TryIt
        tag="Problem 3.4.8"
        question={<>A 10 A automotive fuse is sized so that the wire link melts at 100 K above ambient. Estimate the wire's heat capacity if the fuse must trip after roughly 1 s of overload at 20 A.</>}
        hint={<>Approximate the overload as raising the wire by 100 K in 1 s with no heat loss. The fuse's <em>own</em> resistance is small (~10 mΩ for an automotive fuse), giving P ≈ I²·R.</>}
        answer={
          <>
            <MathBlock>P = I² R = 20² · 0.01 = 4 W</MathBlock>
            <MathBlock>E = P · t = 4 J</MathBlock>
            <MathBlock>C = E / ΔT = 4 / 100 = 0.04 J/K</MathBlock>
            <p>
              Answer: heat capacity <strong>~0.04 J/K</strong>. For a Zn/Cu fuse element with c ≈ 0.4 J/(g·K), that's roughly 100 mg of metal —
              consistent with a real automotive blade fuse. The actual design has to also account for heat conduction through the terminals;
              the rule of thumb is that I²·t (sometimes written <em>I²t</em>, called the "let-through") determines fuse blow.
            </p>
          </>
        }
      />

      <TryIt
        tag="Problem 3.4.9"
        question={<>A 100 W heater is used to warm a 1 kg block of copper from 20 °C to 100 °C. Specific heat of copper is c ≈ 385 J/(kg·K). How long does it take?</>}
        answer={
          <>
            <MathBlock>Q = m c ΔT = 1 · 385 · 80 = 3.08×10⁴ J</MathBlock>
            <MathBlock>t = Q / P = 30 800 / 100 = 308 s</MathBlock>
            <p>
              Answer: about <strong>5 minutes</strong>. Real heat transfer is slower because of losses to the environment, but the order of
              magnitude is right.
            </p>
          </>
        }
      />

      <TryIt
        tag="Problem 3.4.10"
        question={<>Two 1 kΩ resistors are placed in parallel across a 9 V battery. What is the power dissipated in each, and the total?</>}
        answer={
          <>
            <p>Same voltage across each:</p>
            <MathBlock>P<sub>each</sub> = V² / R = 81 / 1000 = 81 mW</MathBlock>
            <MathBlock>P<sub>total</sub> = 2 · 81 mW = 162 mW</MathBlock>
            <p>
              Answer: <strong>81 mW each</strong>, <strong>162 mW total</strong>. Putting resistors in parallel <em>doubles</em> the total
              dissipated power because the supply drives twice as much current through the same voltage drop. A useful safety check on
              parallel circuit design: total P scales with the number of branches at fixed V.
            </p>
          </>
        }
      />

      <TryIt
        tag="Problem 3.4.11"
        question={<>A USB-PD charger delivers 100 W at 20 V (so I = 5 A). If the cable plus connectors have R ≈ 0.1 Ω end-to-end, what fraction of the power is wasted in the cable?</>}
        answer={
          <>
            <MathBlock>P<sub>cable</sub> = I² R = 25 · 0.1 = 2.5 W</MathBlock>
            <MathBlock>fraction = 2.5 / 100 = 2.5%</MathBlock>
            <p>
              Answer: about <strong>2.5%</strong>. That 2.5 W heats the cable and the connectors — which is why USB-PD cables for the 100 W
              tier use thicker conductors (smaller R) and certified contacts, and why budget cables can run hot enough to feel warm and even
              fail under load. Doubling the cable resistance to 0.2 Ω would bring the loss to 5%, on the edge of acceptable.
            </p>
          </>
        }
      />
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
