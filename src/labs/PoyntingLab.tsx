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
      ctx.shadowColor = 'rgba(255,107,42,0.45)';
      ctx.shadowBlur = 18;
      ctx.strokeStyle = 'rgba(255,107,42,0.4)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(g.wireXL, g.wireCY - r);
      ctx.lineTo(g.wireXR, g.wireCY - r);
      ctx.moveTo(g.wireXL, g.wireCY + r);
      ctx.lineTo(g.wireXR, g.wireCY + r);
      ctx.stroke();
      ctx.shadowBlur = 0;

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
      <h3>The intuition</h3>
      <p>
        You have to swallow a strange fact: <strong>the energy that lights the bulb is not inside the wire.</strong> It travels through the empty
        space around it, in the form of the electromagnetic field. The wire is the <em>destination</em> for energy, not the medium through which it
        travels<Cite id="feynman-II-27" in={SOURCES} />.
      </p>
      <p>
        In Volume II of his lectures, Feynman puts it in the bluntest possible terms<Cite id="feynman-II-27" in={SOURCES} />:
      </p>
      <Pullout>
        "Since the wire has resistance, there is an electric field along it, driving the current… the <strong>E</strong> and <strong>B</strong>
        are at right angles; therefore there is a Poynting vector directed radially inward… <em>there is a flow of energy into the wire all
        around.</em>"
      </Pullout>
      <p>
        The wire's resistance is what couples energy out of the field and into heat. The energy itself was always streaming through the surrounding
        space. Every point of every wire in your house is being bathed in inward-flowing electromagnetic energy whenever current is on.
      </p>

      <h3>Building S from E × B</h3>
      <p>
        Two fields are present everywhere along a current-carrying wire. <strong>E</strong> is along the wire's axis — it has to be, because that's
        what drives the charge along the wire to make a current in the first place. <strong>B</strong> circles the wire (Ampère's law), curling
        counter-clockwise when seen from the direction the current is flowing.
      </p>
      <p>
        The Poynting vector is their cross product, divided by the permeability of free space<Cite id="poynting-1884" in={SOURCES} />:
      </p>
      <MathBlock>S = (1/μ<sub>0</sub>) E × B</MathBlock>
      <p>
        Right-hand rule: axial <strong>E</strong> crossed with circumferential <strong>B</strong> produces a vector that points <em>radially inward</em> at
        the surface of the wire. Energy is entering, not leaving. <strong>This is the visual centerpiece above.</strong>
      </p>

      <h3>The integral that closes the loop</h3>
      <p>
        Inside a uniform resistive wire of length <strong>L</strong> with voltage drop <strong>V</strong>, the axial field is just:
      </p>
      <MathBlock>E = V / L</MathBlock>
      <p>
        At the wire's surface, where the radius is <strong>a</strong>, Ampère's law gives the magnetic field:
      </p>
      <MathBlock>B = μ<sub>0</sub> I / (2π a)</MathBlock>
      <p>
        Multiply, divide by μ<sub>0</sub>, and you get the Poynting magnitude at the surface:
      </p>
      <MathBlock>|S|<sub>surf</sub> = E B / μ<sub>0</sub> = V I / (2π a L)</MathBlock>
      <p>The wire's lateral surface area is <strong>2πaL</strong>. So the total energy flowing in per second through that surface is:</p>
      <MathBlock>∮ S · dA = |S| · 2πaL = V I</MathBlock>
      <p>
        <strong>Exactly</strong> VI. The flux integral equals the dissipated power, identically, for every slider combination. The lab above is
        computing both sides and showing you their ratio — it stays at 1.000<Cite id="jackson-1999" in={SOURCES} />.
      </p>

      <h3>Davis &amp; Kaplan, 2011</h3>
      <p>
        The 2D toy model above — a long straight wire with a uniform axial field — is exact, but a real circuit is curvier than that. Davis
        and Kaplan worked out the full 3D Poynting field around a circular loop of resistive wire driven by a battery<Cite id="davis-kaplan-2011" in={SOURCES} />.
        The result is exactly what you'd expect from energy conservation: <em>field lines of S thread through every point of space surrounding the
        circuit,</em> and the net flux entering the resistive portion of the wire equals the power dissipated there. The same flux <em>leaves</em>
        the battery, which acts as a source. Morris &amp; Styer have visualized the 2D toy version explicitly, plotting Poynting flow along
        equipotentials in a simple parallel-rail geometry<Cite id="morris-styer-2012" in={SOURCES} />.
      </p>
      <p>
        The picture is robust: in vacuum, with conductors only on the boundaries, energy is in the field. The wire is just where the field gives
        it up.
      </p>

      <h4>The superconductor limit</h4>
      <p>
        What happens as σ → ∞? The wire becomes a perfect conductor. The axial <strong>E</strong> inside must drop to zero (you can't
        sustain a field in a perfect conductor at equilibrium), so <strong>S = 0</strong> inside. The energy doesn't enter at all. It keeps flowing,
        <em> parallel to the wire</em>, in the surrounding space. Nothing is lost<Cite id="feynman-II-27" in={SOURCES} />. In a circuit with one
        resistor and superconducting leads, the entire energy flow happens through the resistor's surroundings — the leads are just guides
        for the field.
      </p>

      <h4>What about AC?</h4>
      <p>
        Fields oscillate, so <strong>S</strong> oscillates with them. The time-averaged Poynting vector still points into resistive loads, delivering
        real power. For purely reactive loads — ideal capacitors and inductors — the time-averaged <strong>S</strong> is zero. Energy
        sloshes in and out each cycle, with no net transfer<Cite id="jackson-1999" in={SOURCES} />.
      </p>
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
