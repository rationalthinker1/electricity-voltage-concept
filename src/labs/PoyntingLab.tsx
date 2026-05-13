/**
 * Lab 4.4 — Poynting Vector  (capstone)
 *
 *   S = (1/μ₀) E × B
 *
 * Around a current-carrying resistive wire, E lies along the axis and B
 * circulates. Their cross product points radially inward — energy enters
 * the wire from every direction at once. Integrated over the lateral surface,
 * ∮ S·dA = VI identically. The lab shows that ratio explicitly: it stays
 * at 1.000 across every slider combination, by construction.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { LabGrid, LegendItem } from '@/components/LabLayout';
import { LabShell } from '@/components/LabShell';
import { MathBlock, Pullout } from '@/components/Prose';
import { Readout } from '@/components/Readout';
import { Cite } from '@/components/SourcesList';
import { Slider } from '@/components/Slider';
import { TryIt } from '@/components/TryIt';
import { Formula } from '@/components/Formula';
import { drawGlowPath } from '@/lib/canvasPrimitives';
import { PHYS, pretty } from '@/lib/physics';
import { BASE_LAB_SOURCES } from '@/labs/data/manifest';

const SLUG = 'poynting';
const SOURCES = BASE_LAB_SOURCES[SLUG]!;

interface InflowParticle {
  theta: number;
  t: number;
  r: number;
  life: number;
}

export default function PoyntingLab() {
  const [I, setI] = useState(5);
  const [V, setV] = useState(12);
  const [a_mm, setAMm] = useState(1.5);
  const [L, setL] = useState(1.0);

  const computed = useMemo(() => {
    const a_m = a_mm * 1e-3;
    const R = V / I;
    const E = V / L;
    const B = (PHYS.mu_0 * I) / (2 * Math.PI * a_m);
    const S = (E * B) / PHYS.mu_0;
    const Asurf = 2 * Math.PI * a_m * L;
    const P_surf = S * Asurf;
    const P_vi = V * I;
    const match = P_surf / P_vi; // identically 1 by construction
    return { R, E, B, S, Asurf, P_surf, P_vi, match };
  }, [I, V, a_mm, L]);

  const stateRef = useRef({ I, V, a_mm, L, computed });
  useEffect(() => {
    stateRef.current = { I, V, a_mm, L, computed };
  }, [I, V, a_mm, L, computed]);

  const setupCanvas = useCallback((info: CanvasInfo) => {
    const { ctx, w: W, h: H } = info;
    let raf = 0;
    const inflow: InflowParticle[] = [];
    const MAX_INFLOW = 240;

    function getWireGeom() {
      const margin = 100;
      const wireXL = margin;
      const wireXR = W - margin;
      const wireCY = H * 0.55;
      const r_px = Math.min(W, H) * 0.10 * (stateRef.current.a_mm / 1.5);
      const r_px_clamped = Math.max(28, Math.min(70, r_px));
      return { wireXL, wireXR, wireCY, r: r_px_clamped };
    }

    function spawnInflow(S: number) {
      const rate = Math.min(8, Math.max(0.5, Math.log10(S + 10) - 1));
      for (let k = 0; k < rate; k++) {
        if (inflow.length >= MAX_INFLOW) break;
        inflow.push({
          theta: Math.random() * Math.PI * 2,
          t: Math.random(),
          r: 1.0,
          life: 0,
        });
      }
    }

    function draw() {
      const s = stateRef.current;
      const out = s.computed;
      ctx.fillStyle = '#0d0d10';
      ctx.fillRect(0, 0, W, H);

      const g = getWireGeom();
      const r = g.r;
      const ellipseRatio = 0.35;
      const er = r * ellipseRatio;

      // --- BACK half of B-field ellipses (behind wire) ---
      ctx.strokeStyle = 'rgba(108,197,194,0.35)';
      ctx.lineWidth = 1.2;
      const nB = 8;
      for (let i = 0; i < nB; i++) {
        const t = (i + 0.5) / nB;
        const cx = g.wireXL + t * (g.wireXR - g.wireXL);
        ctx.beginPath();
        ctx.ellipse(cx, g.wireCY, er * 1.6, r * 1.6, 0, Math.PI, 2 * Math.PI);
        ctx.stroke();
      }

      // --- Inflow particles (drift radially inward) ---
      spawnInflow(out.S);
      for (let i = inflow.length - 1; i >= 0; i--) {
        const p = inflow[i]!;
        p.r -= 0.008 + Math.min(0.04, Math.log10(out.S + 10) * 0.005);
        p.life += 1;
        if (p.r <= 0.02) { inflow.splice(i, 1); continue; }

        const cx = g.wireXL + p.t * (g.wireXR - g.wireXL);
        const distFromAxis = r + p.r * r * 4;
        const xOff = Math.sin(p.theta) * distFromAxis * ellipseRatio;
        const yOff = -Math.cos(p.theta) * distFromAxis;
        const px = cx + xOff;
        const py = g.wireCY + yOff;

        const back = p.theta > Math.PI;
        const alpha = (back ? 0.4 : 0.95) * (1 - p.r * 0.3);

        const innerR = r + (p.r - 0.05) * r * 4;
        const tx = cx + Math.sin(p.theta) * innerR * ellipseRatio;
        const ty = g.wireCY - Math.cos(p.theta) * innerR;

        ctx.strokeStyle = `rgba(255,107,42,${alpha})`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(tx, ty);
        ctx.stroke();

        ctx.fillStyle = `rgba(255,107,42,${alpha})`;
        ctx.beginPath();
        ctx.arc(tx, ty, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // --- Wire cylinder body ---
      const sideGrd = ctx.createLinearGradient(0, g.wireCY - r, 0, g.wireCY + r);
      sideGrd.addColorStop(0, 'rgba(255,107,42,0.14)');
      sideGrd.addColorStop(0.5, 'rgba(255,107,42,0.32)');
      sideGrd.addColorStop(1, 'rgba(255,107,42,0.14)');
      ctx.fillStyle = sideGrd;
      ctx.beginPath();
      ctx.moveTo(g.wireXL, g.wireCY - r);
      ctx.lineTo(g.wireXR, g.wireCY - r);
      ctx.ellipse(g.wireXR, g.wireCY, er, r, 0, -Math.PI / 2, Math.PI / 2);
      ctx.lineTo(g.wireXL, g.wireCY + r);
      ctx.ellipse(g.wireXL, g.wireCY, er, r, 0, Math.PI / 2, -Math.PI / 2);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = 'rgba(255,107,42,0.6)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(g.wireXL, g.wireCY - r);
      ctx.lineTo(g.wireXR, g.wireCY - r);
      ctx.moveTo(g.wireXL, g.wireCY + r);
      ctx.lineTo(g.wireXR, g.wireCY + r);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255,107,42,0.55)';
      ctx.beginPath();
      ctx.ellipse(g.wireXL, g.wireCY, er, r, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(g.wireXR, g.wireCY, er, r, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Surface glow (energy absorbed)
      drawGlowPath(ctx,
        [{ x: g.wireXL, y: g.wireCY - r }, { x: g.wireXR, y: g.wireCY - r }],
        { color: 'rgba(255,107,42,0.4)', lineWidth: 0.5,
          glowColor: 'rgba(255,107,42,0.35)', glowWidth: 12 });
      drawGlowPath(ctx,
        [{ x: g.wireXL, y: g.wireCY + r }, { x: g.wireXR, y: g.wireCY + r }],
        { color: 'rgba(255,107,42,0.4)', lineWidth: 0.5,
          glowColor: 'rgba(255,107,42,0.35)', glowWidth: 12 });

      // E field arrows (axial)
      const nE = 5;
      ctx.strokeStyle = 'rgba(255,59,110,0.95)';
      ctx.fillStyle = 'rgba(255,59,110,0.95)';
      ctx.lineWidth = 2;
      const arrLen = 60;
      for (let i = 0; i < nE; i++) {
        const t = (i + 0.5) / nE;
        const cx = g.wireXL + t * (g.wireXR - g.wireXL) - arrLen / 2;
        const cy = g.wireCY;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + arrLen, cy);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + arrLen, cy);
        ctx.lineTo(cx + arrLen - 8, cy - 5);
        ctx.lineTo(cx + arrLen - 8, cy + 5);
        ctx.closePath();
        ctx.fill();
      }

      // FRONT half of B-field ellipses
      ctx.strokeStyle = 'rgba(108,197,194,0.85)';
      ctx.lineWidth = 1.4;
      for (let i = 0; i < nB; i++) {
        const t = (i + 0.5) / nB;
        const cx = g.wireXL + t * (g.wireXR - g.wireXL);
        ctx.beginPath();
        ctx.ellipse(cx, g.wireCY, er * 1.6, r * 1.6, 0, 0, Math.PI);
        ctx.stroke();
        const ax = cx + er * 1.6;
        const ay = g.wireCY;
        ctx.fillStyle = 'rgba(108,197,194,0.95)';
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(ax - 6, ay - 4);
        ctx.lineTo(ax - 6, ay + 4);
        ctx.closePath();
        ctx.fill();
      }

      // Terminals
      ctx.fillStyle = '#ff3b6e';
      ctx.shadowColor = 'rgba(255,59,110,0.6)';
      ctx.shadowBlur = 14;
      ctx.fillRect(g.wireXL - 26, g.wireCY - r - 6, 4, 2 * r + 12);
      ctx.shadowBlur = 0;
      ctx.font = 'bold 18px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ff3b6e';
      ctx.fillText('+', g.wireXL - 40, g.wireCY);
      ctx.fillStyle = '#5baef8';
      ctx.shadowColor = 'rgba(91,174,248,0.6)';
      ctx.shadowBlur = 14;
      ctx.fillRect(g.wireXR + 22, g.wireCY - r - 6, 4, 2 * r + 12);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#5baef8';
      ctx.fillText('−', g.wireXR + 40, g.wireCY);

      // Overlay numerics
      ctx.fillStyle = '#ff6b2a';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(`|S| = ${pretty(out.S)} W/m²`, 24, 30);
      ctx.fillStyle = '#ff3b6e';
      ctx.fillText(`E = ${pretty(out.E)} V/m`, 24, 50);
      ctx.fillStyle = '#6cc5c2';
      ctx.fillText(`B = ${pretty(out.B)} T`, 24, 70);

      ctx.fillStyle = 'rgba(160,158,149,0.8)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(
        `I = ${s.I.toFixed(1)} A   V = ${s.V.toFixed(1)} V   a = ${s.a_mm.toFixed(2)} mm   L = ${s.L.toFixed(2)} m`,
        W - 24, 30,
      );

      raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  const labContent = (
    <LabGrid
      canvas={<AutoResizeCanvas height={520} setup={setupCanvas} />}
      legend={
        <>
          <LegendItem swatchColor="var(--pink)">E field (axial)</LegendItem>
          <LegendItem swatchColor="var(--teal)">B field (circulates)</LegendItem>
          <LegendItem swatchColor="var(--accent)">S field (radially inward)</LegendItem>
          <LegendItem style={{ marginLeft: 'auto', color: 'var(--accent)' }}>
            ↳ All energy flowing into the wire comes from outside
          </LegendItem>
        </>
      }
      inputs={
        <>
          <Slider
            sym="I" label="Current"
            value={I} min={0.1} max={100} step={0.1}
            format={(v) => v.toFixed(1) + ' A'}
            metaLeft="0.1 A" metaRight="100 A"
            onChange={setI}
          />
          <Slider
            sym="V" label="Voltage drop"
            value={V} min={0.1} max={48} step={0.1}
            format={(v) => v.toFixed(1) + ' V'}
            metaLeft="0.1 V" metaRight="48 V"
            onChange={setV}
          />
          <Slider
            sym="a" label="Wire radius"
            value={a_mm} min={0.5} max={5} step={0.05}
            format={(v) => v.toFixed(2) + ' mm'}
            metaLeft="0.5 mm" metaRight="5 mm"
            onChange={setAMm}
          />
          <Slider
            sym="L" label="Wire length"
            value={L} min={0.1} max={10} step={0.1}
            format={(v) => v.toFixed(2) + ' m'}
            metaLeft="0.1 m" metaRight="10 m"
            onChange={setL}
          />
        </>
      }
      outputs={
        <>
          <Readout sym="R" label="Implied resistance" valueHTML={pretty(computed.R)} unit="Ω" />
          <Readout sym="E" label="E along axis" valueHTML={pretty(computed.E)} unit="V/m" />
          <Readout sym="B" label="B at wire surface" valueHTML={pretty(computed.B)} unit="T" />
          <Readout sym="|S|" label="Flux at surface" valueHTML={pretty(computed.S)} unit="W/m²" highlight />
          <Readout sym={<>A<sub>surf</sub></>} label="Lateral surface area" valueHTML={pretty(computed.Asurf)} unit="m²" />
          <Readout sym={<>P<sub>surf</sub></>} label="∮S·dA over wire" valueHTML={pretty(computed.P_surf)} unit="W" />
          <Readout sym={<>P<sub>VI</sub></>} label="Power V·I (check)" valueHTML={pretty(computed.P_vi)} unit="W" />
          <Readout
            sym={<>P<sub>surf</sub>/P<sub>VI</sub></>}
            label="Match ratio"
            value={computed.match.toFixed(3)}
            unit="×"
            highlight
          />
        </>
      }
    />
  );

  const prose = (
    <>
      <h3>Context</h3>
      <p>
        Around every current-carrying wire, around every radiating antenna, around every electromagnetic wave moving through any medium,
        the fields carry energy from place to place. The Poynting vector names that flow. It applies anywhere E and B exist — across
        circuit boards, through coaxial cables, out the front of laser cavities, across interstellar space from the Sun to your face.
        Its time-average gives the irradiance of any light beam, the power coupled into any antenna, the heat dumped into any resistor.
      </p>
      <p>
        The formula below holds for any electromagnetic field in vacuum or linear medium. Its physical interpretation as an
        <em> energy flux density</em> rests on Poynting's theorem (1884), which derives the local energy conservation law directly from
        Maxwell's equations<Cite id="poynting-1884" in={SOURCES} />. It breaks down only at the level of the gauge ambiguity (you can add
        a curl to S without changing any measurable energy flux); for any closed surface, the integral ∮S·dA is unambiguous and equals the
        net power crossing that surface<Cite id="jackson-1999" in={SOURCES} />.
      </p>

      <h3>Formula</h3>
      <MathBlock>S = (1/µ<sub>0</sub>) E × B</MathBlock>
      <p>
        <strong>S</strong> Poynting vector: a vector field of energy flux density (W/m²). Its direction is the direction energy flows;
        its magnitude is the power per unit area through a surface perpendicular to that direction. <strong>E</strong> the local electric
        field (V/m). <strong>B</strong> the local magnetic field (T). <strong>µ<sub>0</sub></strong> the permeability of free space.
        For a closed surface, ∮S·dA is the net power flowing out of the enclosed volume.
      </p>

      <h3>Intuition</h3>
      <p>
        Here's the strange fact: <strong>the energy that lights a bulb is not inside the copper wire.</strong> It travels through the
        space surrounding the wire, in the form of the electromagnetic field. The wire is the destination for energy, not the medium of
        transit<Cite id="feynman-II-27" in={SOURCES} />.
      </p>
      <Pullout>
        "Since the wire has resistance, there is an electric field along it, driving the current… the <strong>E</strong> and <strong>B</strong>
        are at right angles; therefore there is a Poynting vector directed radially inward… <em>there is a flow of energy into the wire all
        around.</em>" — Feynman, <em>Lectures II</em><Cite id="feynman-II-27" in={SOURCES} />
      </Pullout>
      <p>
        Two fields are always present around a current-carrying wire. <strong>E</strong> points along the wire's axis — that's what drives
        the charge to move. <strong>B</strong> circles the wire (Ampère's law), counter-clockwise as viewed along the current direction.
        Their cross product points <em>radially inward</em> at the wire's surface: axial × circumferential, by the right-hand rule, equals
        inward. Energy enters the wire from every direction at once. The wire's resistance is just where the field hands off its energy
        to thermal motion of the lattice.
      </p>

      <h3>Reasoning</h3>
      <p>
        Why E × B and not E + B or E · B? Because it has to be a vector (energy flows in a direction), it has to vanish when either E or B
        vanishes (no flow without both fields present), and it has to be perpendicular to both (the only direction picked out by the two
        fields alone). E × B is the unique such combination, up to a constant.
      </p>
      <p>
        Why 1/µ<sub>0</sub> as the constant? Because Poynting's theorem — the rigorous version, derived from Maxwell's equations and
        energy conservation — fixes it. The combination (1/µ<sub>0</sub>)E × B, integrated over any closed surface, equals the rate of
        change of stored field energy (½ε<sub>0</sub>E² + B²/2µ<sub>0</sub>) inside, plus the power dissipated by J·E inside. No other
        choice satisfies energy conservation<Cite id="jackson-1999" in={SOURCES} />.
      </p>
      <p>
        Limits. For a perfect conductor (σ → ∞), the axial E inside drops to zero — no field, no Poynting flow into the wire. The energy
        keeps flowing parallel to the wire in the surrounding space, never entering. In an ideal capacitor or inductor (purely reactive
        load), the time-averaged S is zero: energy sloshes in and out each cycle with no net transfer<Cite id="feynman-II-27" in={SOURCES} />.
      </p>

      <h3>Derivation</h3>
      <p>
        Step one — start from Maxwell. Take the dot product of Ampère's law (∇×B − µ<sub>0</sub>ε<sub>0</sub>∂E/∂t = µ<sub>0</sub>J)
        with E, and Faraday's law (∇×E = −∂B/∂t) with B/µ<sub>0</sub>. Subtract:
      </p>
      <Formula>E · (∇×B)/µ<sub>0</sub> − B · (∇×E)/µ<sub>0</sub> = ε<sub>0</sub> E · ∂E/∂t + (1/µ<sub>0</sub>) B · ∂B/∂t + J · E</Formula>
      <p>Step two — the left side is a vector identity: −∇·(E × B)/µ<sub>0</sub>. The right side groups into energy density rates:</p>
      <Formula>−∇ · S = ∂u/∂t + J · E, &nbsp; where S = (1/µ<sub>0</sub>) E × B</Formula>
      <p>
        Step three — read it. The divergence of S accounts for the change in stored field energy density (∂u/∂t) plus the rate at which the
        field does work on currents (J·E). This is local energy conservation. S is therefore the rate at which energy flows through unit
        area<Cite id="poynting-1884" in={SOURCES} />.
      </p>
      <p>
        Step four — sanity check on a resistive wire. Inside a wire of length L with voltage drop V and current I:
      </p>
      <Formula>E = V/L &nbsp;&emsp; B<sub>surface</sub> = µ<sub>0</sub>I/(2πa)</Formula>
      <Formula>|S|<sub>surface</sub> = EB/µ<sub>0</sub> = VI / (2πaL)</Formula>
      <Formula>∮ S · dA = |S| · 2πaL = <strong>VI</strong></Formula>
      <p>
        Exactly the dissipated power. Davis &amp; Kaplan (2011) extended this to circular loops, getting the full 3D field map<Cite id="davis-kaplan-2011" in={SOURCES} />;
        Morris &amp; Styer (2012) visualized the parallel-rail toy version explicitly<Cite id="morris-styer-2012" in={SOURCES} />. Same conclusion:
        S threads through every point of space, and the net flux into a resistive region matches the heat dissipated there.
      </p>

      <h3>Worked problems</h3>

      <TryIt
        tag="Problem 4.4.1"
        question={<>A <strong>100 W</strong> lightbulb radiates isotropically. What is |S| at <strong>r = 1 m</strong>?</>}
        answer={
          <>
            <Formula>|S| = P / (4π r²) = 100 / (4π · 1²) ≈ <strong>7.96 W/m²</strong></Formula>
            <p>About 8 W/m² at one meter. The 1/r² fall-off is just geometry: the same power spread over a sphere whose area grows as r².</p>
          </>
        }
      />

      <TryIt
        tag="Problem 4.4.2"
        question={<>Solar irradiance at Earth: <strong>S = 1361 W/m²</strong> (the solar constant). For the plane EM wave model, what are
          E<sub>rms</sub> and B<sub>rms</sub>?</>}
        hint="For a plane wave in vacuum, S = ε₀cE². And B = E/c."
        answer={
          <>
            <Formula>E<sub>rms</sub> = √(S / (ε<sub>0</sub> c)) = √(1361 / (8.854×10⁻¹² · 3×10⁸))</Formula>
            <Formula>E<sub>rms</sub> ≈ √(5.12×10⁵) ≈ <strong>716 V/m</strong></Formula>
            <Formula>B<sub>rms</sub> = E<sub>rms</sub>/c ≈ 716 / (3×10⁸) ≈ <strong>2.4 µT</strong></Formula>
            <p>Two micro-tesla of magnetic field, oscillating at hundreds of terahertz, washes over Earth in broad daylight<Cite id="jackson-1999" in={SOURCES} />.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 4.4.3"
        question={<>A laser pointer: <strong>5 mW</strong> into a <strong>1 mm²</strong> spot. What is |S| in the beam?</>}
        answer={
          <>
            <Formula>|S| = P / A = (5×10⁻³ W) / (10⁻⁶ m²) = <strong>5000 W/m² = 5 kW/m²</strong></Formula>
            <p>Three to four times the solar irradiance — but only over a square millimeter, so the total power is small. Energy density is
            high; integrated power is harmless. Don't look into it anyway.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 4.4.4"
        question={<>A <strong>10 kW</strong> radio transmitter broadcasts isotropically. What is |S| at 1 km?</>}
        answer={
          <>
            <Formula>|S| = 10⁴ / (4π · 10⁶) ≈ <strong>8×10⁻⁴ W/m² = 0.8 mW/m²</strong></Formula>
            <p>Below a milliwatt per square meter at a kilometer. A half-wave dipole of effective area ~λ² (a few square meters at AM
            frequencies) captures milliwatts of signal — orders of magnitude above thermal noise floor, which is why AM radio works.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 4.4.5"
        question={<>A DC coaxial cable carrying steady current: <em>where</em> does the energy flow?</>}
        answer={
          <>
            <p>In the dielectric, between the inner conductor and the shield. The radial E in the dielectric (set by the voltage across the
            inner/outer conductors) crosses with the azimuthal B around the inner conductor to give an axial S pointing along the cable.
            Integrated over the cross-section between the conductors, ∮S·dA equals the power VI<Cite id="feynman-II-27" in={SOURCES} />.
            <strong>None of the energy flows in the copper itself.</strong> The conductors only steer the field; the field carries the energy.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 4.4.6"
        question={<>A current-carrying resistor: what direction does S point near its outer surface? Confirm the sign of the energy flow.</>}
        answer={
          <>
            <p>Axial E (driving the current) crossed with circumferential B (Ampère's law around the wire). By the right-hand rule, E × B
            points radially <em>inward</em>: energy enters the resistor from every direction. The integral ∮S·dA over the wire's surface
            is negative (flux into the enclosed volume), and matches the rate of heating I²R inside<Cite id="davis-kaplan-2011" in={SOURCES} />.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 4.4.7"
        question={<>For a plane EM wave in vacuum, derive |S| in terms of E alone, using <strong>B = E/c</strong>.</>}
        answer={
          <>
            <Formula>|S| = EB/µ<sub>0</sub> = E · (E/c) / µ<sub>0</sub> = E² / (µ<sub>0</sub> c)</Formula>
            <p>Using c² = 1/(µ<sub>0</sub>ε<sub>0</sub>), this can be rewritten:</p>
            <Formula>|S| = ε<sub>0</sub> c E²</Formula>
            <p>Both forms are equivalent and common in textbook calculations of EM-wave irradiance<Cite id="jackson-1999" in={SOURCES} />.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 4.4.8"
        question={<>Radiation pressure on a perfect absorber: <strong>P<sub>rad</sub> = S/c</strong>. For a 1 W laser hitting a 1 cm²
          perpendicular surface, what is the force?</>}
        answer={
          <>
            <Formula>S = 1 W / 10⁻⁴ m² = 10⁴ W/m²</Formula>
            <Formula>P<sub>rad</sub> = S/c = 10⁴ / (3×10⁸) ≈ 3.3×10⁻⁵ Pa</Formula>
            <Formula>F = P<sub>rad</sub> · A = (3.3×10⁻⁵)(10⁻⁴) ≈ <strong>3.3×10⁻⁹ N</strong></Formula>
            <p>About three nano-newtons. The weight of a 300-ng dust speck. Real, measurable with a torsion balance — and the basis of every
            solar sail proposal<Cite id="jackson-1999" in={SOURCES} />.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 4.4.9"
        question={<>Solar irradiance at Earth is 1361 W/m². How much total solar power is incident on Earth's day side
          (R<sub>Earth</sub> = 6.37×10⁶ m)?</>}
        hint="Earth intercepts a cross-section, not a hemisphere."
        answer={
          <>
            <Formula>A<sub>cross</sub> = π R<sub>E</sub>² = π (6.37×10⁶)² ≈ 1.27×10¹⁴ m²</Formula>
            <Formula>P = S · A = 1361 · 1.27×10¹⁴ ≈ <strong>1.7×10¹⁷ W = 170 PW</strong></Formula>
            <p>About <strong>10,000× total human energy use</strong>. The Sun delivers a year of human civilization's energy to Earth every
            hour. The roof of an average house at noon receives 10 kW — more than a typical EV charger.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 4.4.10"
        question={<>A <strong>1 kW</strong> microwave oven into a cavity of volume <strong>~0.05 m³</strong>. Estimate the average
          electromagnetic energy density inside (assume the energy stays for ~10 cycles before being absorbed by the food).</>}
        hint="At 2.45 GHz, 10 cycles ≈ 4 ns of dwell time. u ≈ P · τ / V."
        answer={
          <>
            <Formula>τ ≈ 10 / (2.45×10⁹) ≈ 4 ns</Formula>
            <Formula>U<sub>stored</sub> ≈ P · τ ≈ 10³ · 4×10⁻⁹ ≈ 4×10⁻⁶ J</Formula>
            <Formula>u<sub>avg</sub> ≈ U/V = 4×10⁻⁶ / 0.05 ≈ <strong>8×10⁻⁵ J/m³</strong></Formula>
            <p>Peak intensity inside the cavity is roughly P/A<sub>wall</sub> ~ 1 kW/m² — comparable to direct sunlight, but at 2.45 GHz
            instead of 500 THz. Same Poynting flow, vastly different frequency.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 4.4.11"
        question={<>A WiFi router transmits <strong>~100 mW EIRP</strong> at 2.4 GHz, roughly isotropically. What is |S| at 5 m?
          Compare to typical thermal-noise floor at the receiver.</>}
        answer={
          <>
            <Formula>|S| = 0.1 / (4π · 25) ≈ <strong>3.2×10⁻⁴ W/m²</strong></Formula>
            <p>About a third of a mW/m². For a half-wave 2.4 GHz dipole, effective aperture is ~λ²/8 ≈ (0.125)²/8 ≈ 2×10⁻³ m², so received
            power is ~600 nW. Receiver noise floor is roughly kTB ≈ 10⁻¹⁵ W at 20 MHz bandwidth — eight orders of magnitude below received signal,
            plenty of margin<Cite id="morris-styer-2012" in={SOURCES} />.</p>
          </>
        }
      />
    </>
  );

  return (
    <LabShell
      slug={SLUG}
      labSubtitle="Energy Flowing Into a Resistive Wire"
      labId="poynting-4.4 / ∮S·dA = VI"
      labContent={labContent}
      prose={prose}
    />
  );
}
