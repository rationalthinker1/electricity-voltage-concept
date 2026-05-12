/**
 * Lab 4.2 — Inductance
 *
 *   V = − L dI/dt    L = μ₀ N² A / ℓ    U = ½ L I²
 *
 * Air-core solenoid. Sliders for turns, length, cross-section, dI/dt and I.
 * Visualization: helical coil with back-arcs/teal axial B-arrows/front-arcs.
 * Self-inductance L is the highlighted readout.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { LabGrid, LegendItem } from '@/components/LabLayout';
import { LabShell } from '@/components/LabShell';
import { MathBlock, Pullout } from '@/components/Prose';
import { Readout } from '@/components/Readout';
import { Cite } from '@/components/SourcesList';
import { Slider } from '@/components/Slider';
import { PHYS, eng } from '@/lib/physics';
import { BASE_LAB_SOURCES } from '@/labs/data/manifest';

const SLUG = 'inductance';
const SOURCES = BASE_LAB_SOURCES[SLUG]!;

export default function InductanceLab() {
  const [N, setN] = useState(200);
  const [ell_cm, setEllCm] = useState(10);
  const [A_cm2, setACm2] = useState(5);
  const [dIdt, setDIdt] = useState(100);    // A/s
  const [I_inst, setIInst] = useState(1.0); // A

  const computed = useMemo(() => {
    const ell_m = ell_cm * 1e-2;
    const A_m2 = A_cm2 * 1e-4;
    const L = (PHYS.mu_0 * N * N * A_m2) / ell_m;
    const V = L * Math.abs(dIdt);
    const B = PHYS.mu_0 * (N / ell_m) * I_inst;
    const Phi = B * A_m2;
    const U = 0.5 * L * I_inst * I_inst;
    const tau = L / 1.0; // R = 1Ω
    return { L, V, B, Phi, U, tau };
  }, [N, ell_cm, A_cm2, dIdt, I_inst]);

  const stateRef = useRef({ N, ell_cm, A_cm2, dIdt, I_inst, computed });
  useEffect(() => {
    stateRef.current = { N, ell_cm, A_cm2, dIdt, I_inst, computed };
  }, [N, ell_cm, A_cm2, dIdt, I_inst, computed]);

  const setupCanvas = useCallback((info: CanvasInfo) => {
    const { ctx, w: W, h: H } = info;
    let raf = 0;
    let phase = 0;

    function draw() {
      const s = stateRef.current;
      const out = s.computed;

      ctx.fillStyle = '#0d0d10';
      ctx.fillRect(0, 0, W, H);

      const margin = 110;
      const xL = margin, xR = W - margin;
      const cy = H * 0.55;
      const r_vis = Math.max(38, Math.min(95, Math.sqrt(s.A_cm2 / 5) * 60));
      const ellipseRatio = 0.32;
      const er = r_vis * ellipseRatio;
      const visibleTurns = 12;
      phase += 0.015;
      const flowSpeed = s.dIdt;
      const flowOffset = ((phase * flowSpeed * 0.04) % 1 + 1) % 1;

      // Halo proportional to B
      const halo = Math.max(0.06, Math.min(0.65, Math.log10(out.B * 1e3 + 1) * 0.13));
      const haloGrd = ctx.createLinearGradient(0, cy - r_vis * 2.5, 0, cy + r_vis * 2.5);
      haloGrd.addColorStop(0, `rgba(108,197,194,0)`);
      haloGrd.addColorStop(0.5, `rgba(108,197,194,${halo})`);
      haloGrd.addColorStop(1, `rgba(108,197,194,0)`);
      ctx.fillStyle = haloGrd;
      ctx.fillRect(xL - 30, cy - r_vis * 2.5, (xR - xL) + 60, r_vis * 5);

      // Back arcs
      for (let i = 0; i <= visibleTurns; i++) {
        const t = i / visibleTurns;
        const cx = xL + t * (xR - xL);
        ctx.strokeStyle = 'rgba(255,107,42,0.35)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, er, r_vis, 0, Math.PI, 2 * Math.PI);
        ctx.stroke();
      }

      // Axial B arrows
      const nB = 4;
      const Bmag = Math.log10(out.B * 1e3 + 1);
      const arrLen = 70 + Math.min(40, Bmag * 18);
      for (let i = 0; i < nB; i++) {
        const t = (i + 0.5) / nB;
        const cx = xL + t * (xR - xL) - arrLen / 2;
        ctx.strokeStyle = 'rgba(108,197,194,0.9)';
        ctx.fillStyle = 'rgba(108,197,194,0.95)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + arrLen, cy);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + arrLen, cy);
        ctx.lineTo(cx + arrLen - 10, cy - 6);
        ctx.lineTo(cx + arrLen - 10, cy + 6);
        ctx.closePath();
        ctx.fill();
      }

      // Front arcs + current-direction dots
      for (let i = 0; i <= visibleTurns; i++) {
        const t = i / visibleTurns;
        const cx = xL + t * (xR - xL);
        ctx.strokeStyle = 'rgba(255,107,42,0.95)';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, er, r_vis, 0, 0, Math.PI);
        ctx.stroke();
        const dotPhase = (flowOffset + t) % 1;
        const ang = Math.PI * dotPhase;
        const dx = cx + Math.cos(ang) * er;
        const dy = cy + Math.sin(ang) * r_vis;
        ctx.fillStyle = '#ff6b2a';
        ctx.beginPath();
        ctx.arc(dx, dy, 2.4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Lead lines exiting each end
      ctx.strokeStyle = 'rgba(255,107,42,0.85)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(xL, cy + r_vis);
      ctx.lineTo(xL - 40, cy + r_vis + 25);
      ctx.moveTo(xR, cy + r_vis);
      ctx.lineTo(xR + 40, cy + r_vis + 25);
      ctx.stroke();

      // Return-loop hints
      ctx.strokeStyle = 'rgba(108,197,194,0.18)';
      ctx.lineWidth = 1;
      for (const sgn of [-1, 1] as const) {
        ctx.beginPath();
        ctx.ellipse(W / 2, cy, (xR - xL) / 2 + 50, r_vis * (1.8 + 0.3 * sgn), 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Current direction label
      ctx.fillStyle = '#ff6b2a';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(s.dIdt >= 0 ? 'I ↗ rising' : 'I ↘ falling', xR + 10, cy - r_vis - 8);

      // Corner readouts
      ctx.fillStyle = '#6cc5c2';
      ctx.fillText(`B = ${eng(out.B, 3, 'T')} inside`, 24, 28);
      ctx.fillStyle = '#ff3b6e';
      ctx.fillText(`V_back = ${eng(out.V, 3, 'V')}`, 24, 48);
      ctx.fillStyle = '#ff6b2a';
      ctx.fillText(`L = ${eng(out.L, 3, 'H')}`, 24, 68);
      ctx.fillStyle = 'rgba(160,158,149,0.85)';
      ctx.textAlign = 'right';
      ctx.fillText(
        `N = ${s.N}   ℓ = ${s.ell_cm.toFixed(1)} cm   A = ${s.A_cm2.toFixed(1)} cm²`,
        W - 24, 28,
      );
      ctx.fillText(
        `dI/dt = ${s.dIdt} A/s   I = ${s.I_inst.toFixed(2)} A`,
        W - 24, 48,
      );

      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(160,158,149,0.6)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText(`(${s.N} turns; ${visibleTurns} shown)`, (xL + xR) / 2, cy + r_vis + 38);

      raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  const labContent = (
    <LabGrid
      canvas={<AutoResizeCanvas height={460} setup={setupCanvas} />}
      legend={
        <>
          <LegendItem swatchColor="var(--teal)">B field (axial inside)</LegendItem>
          <LegendItem swatchColor="var(--accent)">Current direction</LegendItem>
          <LegendItem swatchColor="var(--pink)">Induced back-EMF</LegendItem>
          <LegendItem style={{ marginLeft: 'auto', color: 'var(--accent)' }}>
            ↳ Energy lives inside the coil, in B
          </LegendItem>
        </>
      }
      inputs={
        <>
          <Slider
            sym="N" label="Turns"
            value={N} min={1} max={1000} step={1}
            format={(v) => v.toFixed(0)}
            metaLeft="1" metaRight="1000"
            onChange={setN}
          />
          <Slider
            sym="ℓ" label="Solenoid length"
            value={ell_cm} min={1} max={50} step={0.1}
            format={(v) => v.toFixed(1) + ' cm'}
            metaLeft="1 cm" metaRight="50 cm"
            onChange={setEllCm}
          />
          <Slider
            sym="A" label="Cross-section"
            value={A_cm2} min={0.1} max={100} step={0.1}
            format={(v) => v.toFixed(1) + ' cm²'}
            metaLeft="0.1 cm²" metaRight="100 cm²"
            onChange={setACm2}
          />
          <Slider
            sym="dI/dt" label="Rate of current change"
            value={dIdt} min={-1000} max={1000} step={1}
            format={(v) => (v >= 0 ? '+' : '') + v.toFixed(0) + ' A/s'}
            metaLeft="−1000 A/s" metaRight="+1000 A/s"
            onChange={setDIdt}
          />
          <Slider
            sym="I" label="Instantaneous current"
            value={I_inst} min={0} max={10} step={0.01}
            format={(v) => v.toFixed(2) + ' A'}
            metaLeft="0 A" metaRight="10 A"
            onChange={setIInst}
          />
        </>
      }
      outputs={
        <>
          <Readout sym="L" label="Self-inductance" valueHTML={eng(computed.L, 3, 'H')} highlight />
          <Readout sym={<>V<sub>ind</sub></>} label="Back-EMF" valueHTML={eng(computed.V, 3, 'V')} />
          <Readout sym="B" label="Field inside" valueHTML={eng(computed.B, 3, 'T')} />
          <Readout sym="Φ" label="Flux per turn" valueHTML={eng(computed.Phi, 3, 'Wb')} />
          <Readout sym="U" label="Stored energy" valueHTML={eng(computed.U, 3, 'J')} />
          <Readout sym="τ" label="L/R time const. (R = 1Ω)" valueHTML={eng(computed.tau, 3, 's')} />
        </>
      }
    />
  );

  const prose = (
    <>
      <h3>The mirror of capacitance</h3>
      <p>
        An inductor is the dual of a capacitor. A capacitor stores energy in an <em>electric</em> field between separated charges; an inductor
        stores energy in a <em>magnetic</em> field around moving charges. Where capacitance is the proportionality between charge and voltage,
        inductance is the proportionality between current and magnetic flux linkage<Cite id="griffiths-2017" in={SOURCES} />. The two devices are so
        symmetric that even their differential equations swap:
      </p>
      <MathBlock>I<sub>C</sub> = C dV/dt &nbsp;&emsp; V<sub>L</sub> = L dI/dt</MathBlock>
      <p>
        Energy: ½CV² for the cap, ½LI² for the inductor. Voltage across one mirrors current through the other.
      </p>

      <h3>Solenoid formula derivation</h3>
      <p>
        Take a long solenoid: <strong>N</strong> turns wound over a length <strong>ℓ</strong>, with cross-sectional area <strong>A</strong>,
        carrying current <strong>I</strong>. Define the turn density <strong>n = N/ℓ</strong>. Apply Ampère's law on a rectangular loop
        threaded through the coil — the field outside is negligible, the field inside is uniform and axial<Cite id="griffiths-2017" in={SOURCES} />:
      </p>
      <MathBlock>B = μ<sub>0</sub> n I = μ<sub>0</sub> (N/ℓ) I</MathBlock>
      <p>
        The flux through one turn is <strong>Φ = B·A</strong>. Each of the <strong>N</strong> turns links that flux, so the total
        flux linkage is <strong>NΦ</strong>:
      </p>
      <MathBlock>NΦ = N · μ<sub>0</sub> (N/ℓ) I · A = μ<sub>0</sub> N² A I / ℓ</MathBlock>
      <p>Self-inductance is defined as the proportionality between current and flux linkage:</p>
      <MathBlock>L = NΦ / I = μ<sub>0</sub> N² A / ℓ</MathBlock>
      <p>
        The <strong>N²</strong> is the magic. Doubling the turns doubles the field <em>and</em> doubles the linkages, so the inductance
        quadruples<Cite id="jackson-1999" in={SOURCES} />.
      </p>

      <h3>Why current can't change instantly</h3>
      <p>
        Faraday's law: any change in flux through a loop induces an EMF that opposes the change (Lenz's law)<Cite id="faraday-1832" in={SOURCES} />.
        For a self-inductor, the changing flux is caused by changing current in its own coil. The induced voltage that fights this
        is<Cite id="feynman-II-17" in={SOURCES} />:
      </p>
      <MathBlock>V<sub>ind</sub> = − L dI/dt</MathBlock>
      <p>
        Try to interrupt current instantly — <strong>dI/dt → −∞</strong> — and the inductor produces whatever voltage it takes to keep the
        current flowing for a moment longer. In practice, that voltage will arc across the open switch. This isn't a quirk; it's the basis of
        spark plugs, flyback converters, and ignition coils.
      </p>

      <Pullout>
        An inductor is a flywheel for electricity. It hates the new current. It loves the current you already gave it.
      </Pullout>

      <h3>Energy in the magnetic field</h3>
      <p>
        Build the current up from 0 to I. At intermediate current <strong>i</strong>, the rate is <strong>di/dt</strong> and the back-EMF
        opposing your battery is <strong>L di/dt</strong>. Power going into the inductor is <strong>P = V·i = (L di/dt)·i</strong>.
        Integrate over the ramp:
      </p>
      <MathBlock>U = ∫<sub>0</sub><sup>I</sup> L i di = ½ L I²</MathBlock>
      <p>
        Where does it live? Inside the solenoid, where the B field is. The energy density is<Cite id="jackson-1999" in={SOURCES} />:
      </p>
      <MathBlock>u<sub>B</sub> = B² / (2μ<sub>0</sub>)</MathBlock>
      <p>
        Multiply by the interior volume <strong>Aℓ</strong>, plug in B = μ<sub>0</sub>nI, and out pops ½LI² again —
        the same energy, written two different ways. As with the capacitor: <em>the windings don't store the energy. The field inside them does.</em>
      </p>

      <h3>The capacitor / inductor table</h3>
      <p>Side by side, every formula reflects across the diagonal:</p>
      <MathBlock>
        Capacitor: V = Q/C,&nbsp; I = C dV/dt,&nbsp; U = ½CV² <br />
        Inductor:&nbsp; I = Φ/L,&nbsp; V = L dI/dt,&nbsp; U = ½LI²
      </MathBlock>
      <p>
        Couple one of each across the same wires and you get an LC oscillator: energy sloshes between the cap's E field and the inductor's B
        field at angular frequency <strong>ω = 1/√(LC)</strong><Cite id="griffiths-2017" in={SOURCES} />.
      </p>

      <h4>RL time constant</h4>
      <p>
        Hook a series RL across a battery <strong>V</strong>. Current doesn't jump — it climbs:
      </p>
      <MathBlock>I(t) = (V/R) · (1 − e<sup>−t R/L</sup>)</MathBlock>
      <p>
        The time constant is <strong>τ = L/R</strong>. Big L means a sluggish current rise; the inductor "remembers" the previous current
        for roughly <strong>τ</strong>. The lab's last readout shows what τ would be through a 1Ω resistor.
      </p>
    </>
  );

  return (
    <LabShell
      slug={SLUG}
      labSubtitle="Air-Core Solenoid"
      labId="inductance-4.2 / L = μ₀N²A/ℓ"
      labContent={labContent}
      prose={prose}
    />
  );
}
