/**
 * Lab 2.4 — Faraday's Law
 *
 *   EMF = − dΦ_B / dt = N B A ω sin(ω t)
 *
 * A rectangular coil spins in a uniform B field. Left half of the canvas
 * shows the rotating coil. Right half is an oscilloscope plot of EMF(t).
 * Real ω drives the readouts; visual ω is capped to keep the coil legible.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Formula } from '@/components/Formula';
import { LabGrid, LegendItem } from '@/components/LabLayout';
import { LabShell } from '@/components/LabShell';
import { MathBlock, Pullout } from '@/components/Prose';
import { Readout } from '@/components/Readout';
import { Cite } from '@/components/SourcesList';
import { Slider } from '@/components/Slider';
import { TryIt } from '@/components/TryIt';
import { drawGlowPath } from '@/lib/canvasPrimitives';
import { pretty } from '@/lib/physics';
import { BASE_LAB_SOURCES } from '@/labs/data/manifest';

const SLUG = 'faraday';
const SOURCES = BASE_LAB_SOURCES[SLUG]!;

export default function FaradayLab() {
  const [B, setB] = useState(0.5);          // T
  const [A_cm2, setA_cm2] = useState(100);  // cm²
  const [N, setN] = useState(100);          // turns
  const [omega, setOmega] = useState(60);   // rad/s

  const stateRef = useRef({ B, A_cm2, N, omega });
  useEffect(() => { stateRef.current = { B, A_cm2, N, omega }; }, [B, A_cm2, N, omega]);

  const computed = useMemo(() => {
    const A_m2 = A_cm2 * 1e-4;
    const peak = N * B * A_m2 * omega;
    const f = omega / (2 * Math.PI);
    const Vrms = peak / Math.sqrt(2);
    return { peak, f, Vrms };
  }, [B, A_cm2, N, omega]);

  // Live readouts for instantaneous values (Φ, EMF_now) — updated from the draw loop
  const [phiNow, setPhiNow] = useState(0);
  const [emfNow, setEmfNow] = useState(0);
  const phiRef = useRef({ phi: 0, emf: 0 });
  // Throttle React state updates to avoid render thrash (~10 Hz).
  useEffect(() => {
    const id = window.setInterval(() => {
      setPhiNow(phiRef.current.phi);
      setEmfNow(phiRef.current.emf);
    }, 100);
    return () => window.clearInterval(id);
  }, []);

  const setupCanvas = useCallback((info: CanvasInfo) => {
    const { ctx, w, h } = info;
    let raf = 0;
    let simT = 0;
    let lastRealT = performance.now();
    const scope: { t: number; emf: number }[] = [];
    const SCOPE_DURATION = 0.2;

    function draw() {
      const { B, A_cm2, N, omega } = stateRef.current;
      const A_m2 = A_cm2 * 1e-4;
      const peak = N * B * A_m2 * omega;

      const now = performance.now();
      let dt = (now - lastRealT) / 1000;
      lastRealT = now;
      if (dt > 0.1) dt = 0.1;
      const visualOmega = Math.min(omega, 3.0);
      simT += dt;

      // Update instantaneous readouts via ref
      phiRef.current.phi = N * B * A_m2 * Math.cos(omega * simT);
      phiRef.current.emf = N * B * A_m2 * omega * Math.sin(omega * simT);

      ctx.fillStyle = '#0d0d10';
      ctx.fillRect(0, 0, w, h);

      const splitX = w * 0.45;

      // LEFT: coil
      ctx.save();
      ctx.beginPath(); ctx.rect(0, 0, splitX, h); ctx.clip();

      if (B > 0.005) {
        const op = Math.min(0.45, 0.12 + B * 0.18);
        ctx.strokeStyle = `rgba(108,197,194,${op})`;
        ctx.fillStyle = `rgba(108,197,194,${op})`;
        ctx.lineWidth = 1.2;
        const rows = 7;
        for (let i = 0; i < rows; i++) {
          const y = ((i + 0.5) * h) / rows;
          ctx.beginPath();
          ctx.moveTo(20, y); ctx.lineTo(splitX - 20, y); ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(splitX - 20, y);
          ctx.lineTo(splitX - 28, y - 5);
          ctx.lineTo(splitX - 28, y + 5);
          ctx.closePath(); ctx.fill();
        }
      }

      const coilCx = splitX / 2;
      const coilCy = h / 2;
      const coilH = Math.min(h * 0.5, 220);
      const coilW = Math.min(splitX * 0.5, 200);
      const angle = visualOmega * simT;
      const visW = coilW * Math.abs(Math.sin(angle));
      const persp = coilW * Math.cos(angle) * 0.15;

      ctx.strokeStyle = 'rgba(255,255,255,0.18)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(coilCx, 30); ctx.lineTo(coilCx, h - 30); ctx.stroke();
      ctx.setLineDash([]);

      ctx.strokeStyle = `rgba(255,107,42,${0.4 + 0.4 * Math.abs(Math.sin(angle))})`;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      const xL = coilCx - visW / 2;
      const xR = coilCx + visW / 2;
      const yT = coilCy - coilH / 2;
      const yB = coilCy + coilH / 2;
      ctx.moveTo(xL - persp * 0.3, yT);
      ctx.lineTo(xR - persp * 0.3, yT);
      ctx.lineTo(xR + persp * 0.3, yB);
      ctx.lineTo(xL + persp * 0.3, yB);
      ctx.closePath();
      ctx.stroke();

      // Turn lines
      const turnsShown = Math.min(20, Math.max(3, Math.floor(N / 25)));
      ctx.strokeStyle = 'rgba(255,107,42,0.55)';
      ctx.lineWidth = 1;
      for (let i = 1; i < turnsShown; i++) {
        const t = i / turnsShown;
        const xLt = xL - persp * 0.3 + t * 4;
        const xRt = xR - persp * 0.3 - t * 4;
        ctx.beginPath();
        ctx.moveTo(xLt, yT); ctx.lineTo(xRt, yT); ctx.stroke();
      }

      // Normal arrow
      const normLen = 36;
      const projNx = Math.cos(angle) * normLen;
      const projNy = -Math.sin(angle) * normLen * 0.35;
      ctx.strokeStyle = 'rgba(255,255,255,0.55)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(coilCx, coilCy);
      ctx.lineTo(coilCx + projNx, coilCy + projNy);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('n̂', coilCx + projNx + 4, coilCy + projNy);

      ctx.fillStyle = 'rgba(108,197,194,0.95)';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(`B = ${B.toFixed(2)} T →`, 16, 16);

      ctx.restore();

      // Divider
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(splitX, 0); ctx.lineTo(splitX, h); ctx.stroke();

      // RIGHT: scope
      ctx.save();
      ctx.beginPath(); ctx.rect(splitX, 0, w - splitX, h); ctx.clip();

      const scopeX = splitX + 40;
      const scopeW = w - splitX - 60;
      const scopeCy = h / 2;
      const scopeH = h * 0.7;

      scope.push({ t: simT, emf: phiRef.current.emf });
      const tCut = simT - SCOPE_DURATION;
      while (scope.length && scope[0].t < tCut) scope.shift();

      const yScale = Math.max(peak, 0.01);

      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = scopeCy - scopeH / 2 + (i * scopeH) / 4;
        ctx.beginPath(); ctx.moveTo(scopeX, y); ctx.lineTo(scopeX + scopeW, y); ctx.stroke();
      }
      for (let i = 0; i <= 8; i++) {
        const x = scopeX + (i * scopeW) / 8;
        ctx.beginPath();
        ctx.moveTo(x, scopeCy - scopeH / 2); ctx.lineTo(x, scopeCy + scopeH / 2);
        ctx.stroke();
      }

      ctx.strokeStyle = 'rgba(255,255,255,0.18)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(scopeX, scopeCy); ctx.lineTo(scopeX + scopeW, scopeCy); ctx.stroke();

      const peakY = scopeCy - (scopeH / 2) * (peak / yScale) * 0.9;
      const peakYn = scopeCy + (scopeH / 2) * (peak / yScale) * 0.9;
      ctx.strokeStyle = 'rgba(255,107,42,0.4)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(scopeX, peakY); ctx.lineTo(scopeX + scopeW, peakY);
      ctx.moveTo(scopeX, peakYn); ctx.lineTo(scopeX + scopeW, peakYn);
      ctx.stroke();
      ctx.setLineDash([]);

      if (scope.length > 2) {
        const tracePts: { x: number; y: number }[] = [];
        for (let i = 0; i < scope.length; i++) {
          const s = scope[i];
          tracePts.push({
            x: scopeX + ((s.t - tCut) / SCOPE_DURATION) * scopeW,
            y: scopeCy - (s.emf / yScale) * (scopeH / 2) * 0.9,
          });
        }
        drawGlowPath(ctx, tracePts, {
          color: 'rgba(255,59,110,0.95)',
          lineWidth: 1.8,
          glowColor: 'rgba(255,59,110,0.4)',
          glowWidth: 7,
        });
      }

      ctx.fillStyle = 'rgba(160,158,149,0.8)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('EMF(t) — scope', scopeX, 16);
      ctx.fillStyle = 'rgba(255,107,42,0.85)';
      ctx.textAlign = 'right';
      ctx.fillText(`peak = ${pretty(peak)} V`, scopeX + scopeW, 16);

      ctx.fillStyle = 'rgba(255,59,110,0.95)';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`now = ${pretty(phiRef.current.emf)} V`, scopeX + scopeW, h - 16);
      ctx.fillStyle = 'rgba(160,158,149,0.8)';
      ctx.textAlign = 'left';
      ctx.fillText(`${SCOPE_DURATION.toFixed(2)} s window`, scopeX, h - 16);

      ctx.restore();

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); };
  }, []);

  const labContent = (
    <LabGrid
      canvas={<AutoResizeCanvas height={520} setup={setupCanvas} />}
      legend={
        <>
          <LegendItem swatchColor="var(--accent)">Coil (N turns)</LegendItem>
          <LegendItem swatchColor="var(--teal)">B field (horizontal)</LegendItem>
          <LegendItem swatchColor="var(--pink)">Induced EMF</LegendItem>
          <LegendItem style={{ marginLeft: 'auto', color: 'var(--accent)' }}>↳ Peak EMF = NBAω</LegendItem>
        </>
      }
      inputs={
        <>
          <Slider sym="B" label="B field magnitude" value={B} min={0} max={2} step={0.01}
            format={v => v.toFixed(2) + ' T'} metaLeft="0 T" metaRight="2 T" onChange={setB} />
          <Slider sym="A" label="Coil area" value={A_cm2} min={1} max={500} step={1}
            format={v => Math.round(v) + ' cm²'} metaLeft="1 cm²" metaRight="500 cm²" onChange={setA_cm2} />
          <Slider sym="N" label="Number of turns" value={N} min={1} max={500} step={1}
            format={v => Math.round(v).toString()} metaLeft="1" metaRight="500"
            onChange={v => setN(Math.round(v))} />
          <Slider sym="ω" label="Rotation rate" value={omega} min={0} max={200} step={1}
            format={v => Math.round(v) + ' rad/s'} metaLeft="0 rad/s" metaRight="200 rad/s" onChange={setOmega} />
        </>
      }
      outputs={
        <>
          <Readout sym="Φ" label="Flux now" valueHTML={pretty(phiNow)} unit="Wb" />
          <Readout sym={<>EMF<sub>pk</sub></>} label="Peak EMF = NBAω" valueHTML={pretty(computed.peak)} unit="V" highlight />
          <Readout sym="EMF" label="Instantaneous" valueHTML={pretty(emfNow)} unit="V" />
          <Readout sym="f" label="Frequency" valueHTML={pretty(computed.f)} unit="Hz" />
          <Readout sym={<>V<sub>rms</sub></>} label="RMS EMF" valueHTML={pretty(computed.Vrms)} unit="V" />
        </>
      }
    />
  );

  const prose = (
    <>
      <h3>Context</h3>
      <p>
        Faraday's law says that a <em>changing</em> magnetic flux through a closed loop induces an electromotive force (EMF) around that loop.
        Static B-fields do no work and induce nothing; only the rate of change matters. The flux can change because <strong>B</strong> changes,
        because the loop area changes, or because the loop reorients (rotates) — all three produce EMF, and all three are unified by one
        equation<Cite id="faraday-1832" in={SOURCES} />.
      </p>
      <p>
        It applies to any closed loop, any field, any reason for the flux to change. Combined with Maxwell's correction to Ampère's law, it
        is what allows light: oscillating <strong>E</strong> regenerates <strong>B</strong>, and vice versa, with the disturbance propagating
        at <strong>c</strong><Cite id="griffiths-2017" in={SOURCES} />. The differential form <strong>∇ × E = −∂B/∂t</strong> applies even in
        empty space — no loop of wire required.
      </p>

      <h3>Formula</h3>
      <MathBlock>EMF = − dΦ<sub>B</sub> / dt</MathBlock>
      <p>Variable glossary:</p>
      <ul>
        <li><strong>EMF</strong> — induced electromotive force around the loop, in volts (V). The line integral of E around the loop.</li>
        <li><strong>Φ<sub>B</sub></strong> — magnetic flux through the loop: Φ<sub>B</sub> = ∫∫ B · dA, in webers (Wb = T·m²).</li>
        <li><strong>B</strong> — magnetic field, in tesla (T).</li>
        <li><strong>A</strong> — area of the loop, in m². For a flat coil in a uniform field, Φ = BA cos θ, with θ the angle between B and the loop's normal.</li>
        <li><strong>N</strong> — number of turns. For an N-turn coil, total flux linkage is NΦ, and EMF = −N dΦ/dt.</li>
        <li><strong>The minus sign</strong> — Lenz's law: the induced current opposes the change in flux that caused it. Encodes energy conservation.</li>
      </ul>
      <p>For a flat coil of N turns, area A, in a uniform B rotating at angular rate ω:</p>
      <MathBlock>Φ(t) = N B A cos(ω t),    EMF(t) = N B A ω sin(ω t)</MathBlock>

      <h3>Intuition</h3>
      <p>
        Think of magnetic flux as a count of B-field lines piercing the loop. Faraday says: change that count and you produce a voltage around
        the rim, with magnitude equal to the rate of change. Three ways to change the count: (a) make the field stronger or weaker, (b) make
        the loop bigger or smaller, (c) tilt the loop relative to the field. All three produce the same kind of EMF.
      </p>
      <Pullout>
        Magnetism never <em>moves</em>; only the flux does. Move the flux and electricity falls out.
      </Pullout>

      <h3>Reasoning</h3>
      <p>
        Why the minus sign? Lenz's law. The induced current drives its own B that opposes the change in flux. Push a north pole toward a
        coil and the induced current creates a north pole back at you — pushing back. If the sign were positive, the induced current would
        attract the magnet, accelerating it, increasing the flux change, increasing the current, and you'd have a perpetual-motion machine
        on every workbench. The minus sign is energy conservation written in equation form<Cite id="feynman-II-17" in={SOURCES} />.
      </p>
      <p>
        Why is EMF proportional to N? Each turn experiences the same dΦ/dt, and the EMFs add in series. Why proportional to A? Bigger loop,
        more flux, larger dΦ. Why proportional to ω? Faster rotation, faster flux change. Limit checks: at ω = 0, no rotation, no flux change,
        no EMF. At θ = 0 (loop face-on to B) the flux is maximum but dΦ/dt is instantaneously zero — and indeed EMF passes through zero at that
        instant of the rotation. The peaks of EMF occur when the loop is edge-on, where Φ = 0 but dΦ/dt is maximum.
      </p>

      <h3>Derivation</h3>
      <p>
        For motional EMF (loop moving through a static B), follow the carriers. A free electron in a moving conductor feels a Lorentz force
        <strong> qv × B</strong>; integrating that force per unit charge around the loop gives the EMF directly. For a rod of length L moving
        with velocity v perpendicular to a B field:
      </p>
      <MathBlock>EMF = ∮ (v × B) · dℓ = B L v</MathBlock>
      <p>
        For the rotating-coil case in this lab, the flux is <strong>Φ(t) = NBA cos(ωt)</strong>. Differentiate:
      </p>
      <MathBlock>EMF = −dΦ/dt = +N B A ω sin(ω t)</MathBlock>
      <p>
        The peak EMF is <strong>NBAω</strong>; the RMS value is <strong>NBAω/√2</strong>. North American mains is 60 Hz, so
        <strong> ω = 2π · 60 ≈ 377 rad/s</strong> — that's the design point for every AC generator on the grid<Cite id="griffiths-2017" in={SOURCES} />.
      </p>
      <p>
        For a loop that doesn't move but sits in a changing B, you can't use the v × B trick — but you can still write
        <strong> ∮ E · dℓ = −dΦ/dt</strong>. That's the line integral of a real, induced electric field that exists in space whether or not
        the loop is there. In differential form: <strong>∇ × E = −∂B/∂t</strong>. Maxwell's elevation of this to a field equation is what
        makes light possible<Cite id="feynman-II-17" in={SOURCES} />.
      </p>

      <h3>Worked problems</h3>

      <TryIt
        tag="Problem 2.4.1"
        question={<>A <strong>100-turn coil</strong> sits in a magnetic field rising at <strong>dB/dt = 0.1 T/s</strong>. Coil area <strong>A = 100 cm²</strong>. Find the EMF.</>}
        hint="EMF = N A dB/dt; convert cm² → m²."
        answer={
          <>
            <p>A = 100 cm² = 10⁻² m².</p>
            <Formula>EMF = N A dB/dt = (100)(10⁻²)(0.1) = 0.1 V</Formula>
            <p>Answer: <strong>0.1 V = 100 mV</strong>. Easily detectable on any voltmeter.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 2.4.2"
        question={<>Same coil (100 turns, 100 cm²), now B is held constant at <strong>0.5 T</strong>, but the area is shrinking at <strong>dA/dt = −50 cm²/s</strong>. Find the EMF.</>}
        hint="EMF = N B dA/dt for constant B."
        answer={
          <>
            <p>dA/dt = −50 cm²/s = −5 × 10⁻³ m²/s.</p>
            <Formula>EMF = N B dA/dt = (100)(0.5)(−5×10⁻³) = −0.25 V</Formula>
            <p>Answer: <strong>0.25 V</strong> in magnitude. The sign tells you which way the induced current flows: it tries to maintain the original flux through the shrinking loop.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 2.4.3"
        question={<>A conducting bar of length <strong>L = 0.5 m</strong> slides on rails through a uniform <strong>B = 0.3 T</strong> at <strong>v = 4 m/s</strong>. Find the motional EMF.</>}
        hint="EMF = BLv."
        answer={
          <>
            <Formula>EMF = B L v = (0.3)(0.5)(4) = 0.6 V</Formula>
            <p>Answer: <strong>0.6 V</strong>. This is the elemental case of motional EMF — free electrons in the bar feel a Lorentz force qv × B that drives them along the bar; charge piles up at the ends; the resulting line integral of E around the rail circuit equals BLv.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 2.4.4"
        question={<>A coil with <strong>N = 200</strong>, <strong>A = 50 cm²</strong>, in a <strong>B = 0.4 T</strong> field, rotates at <strong>ω = 377 rad/s</strong> (60 Hz). Find the peak EMF and the RMS EMF.</>}
        hint="Peak = NBAω, RMS = peak/√2."
        answer={
          <>
            <p>A = 50 cm² = 5 × 10⁻³ m².</p>
            <Formula>EMF<sub>peak</sub> = N B A ω = (200)(0.4)(5×10⁻³)(377) ≈ 151 V</Formula>
            <Formula>EMF<sub>rms</sub> = 151 / √2 ≈ 107 V</Formula>
            <p>Answer: peak <strong>~151 V</strong>, RMS <strong>~107 V</strong>. Close to North American 120 V mains — a 250-turn coil of slightly larger area would land you right on it.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 2.4.5"
        question={<>A primary solenoid with <strong>N<sub>1</sub> = 1000</strong> turns has current ramping at <strong>dI/dt = 50 A/s</strong>. A secondary coil with <strong>N<sub>2</sub> = 50</strong> turns is wound coaxially around it. The primary's self-inductance is <strong>L<sub>1</sub> = 0.2 H</strong>, and the coupling is perfect. Find the EMF induced in the secondary. (Mutual inductance M = (N₂/N₁) L₁ for perfect coupling.)</>}
        hint="EMF₂ = M dI₁/dt."
        answer={
          <>
            <Formula>M = (N₂ / N₁) L₁ = (50/1000)(0.2) = 0.01 H</Formula>
            <Formula>EMF₂ = M dI₁/dt = (0.01)(50) = 0.5 V</Formula>
            <p>Answer: <strong>0.5 V</strong>. This is the basic transformer relation: an oscillating primary current induces a proportional secondary voltage, scaled by the mutual inductance.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 2.4.6"
        question={<>Lenz's law sign check: a circular metal ring lies on a table; a permanent magnet with its N-pole pointing down is brought toward it from above. Which way does the induced current flow as seen from above?</>}
        hint="The induced current must produce a B-field that opposes the increasing downward flux."
        answer={
          <>
            <p>The magnet's downward flux through the ring is increasing as it approaches. By Lenz's law, the induced current creates its own B that opposes the change — i.e., points <strong>upward</strong> at the ring's centre. By the right-hand rule, an upward-pointing B requires the current to flow <strong>counterclockwise as seen from above</strong>. The ring effectively becomes a north pole on its top face, repelling the incoming N-pole. This is exactly what eddy-current braking exploits.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 2.4.7"
        question={<>An aircraft with wingspan <strong>L = 30 m</strong> flies horizontally at <strong>v = 250 m/s</strong> through Earth's vertical magnetic field component <strong>B<sub>vert</sub> = 50 µT</strong>. Find the EMF between the wingtips.</>}
        hint="EMF = B L v."
        answer={
          <>
            <Formula>EMF = B<sub>vert</sub> L v = (5×10⁻⁵)(30)(250) = 0.375 V</Formula>
            <p>Answer: <strong>~0.38 V</strong>. Real but small. You cannot tap it — the aircraft is also a single conducting body, so any external circuit moves through the same flux and sees the same EMF, cancelling. (The "Faraday disk" trick of using a sliding contact to extract the EMF works at airframe speeds in principle, but mechanical losses overwhelm it.)</p>
          </>
        }
      />

      <TryIt
        tag="Problem 2.4.8"
        question={<>A transformer has turns ratio <strong>N<sub>1</sub> : N<sub>2</sub> = 100 : 10</strong>. The primary is driven at peak voltage <strong>V<sub>1,peak</sub> = 120 V</strong>. Assuming ideal coupling, find the secondary peak voltage.</>}
        hint="For an ideal transformer, V₂/V₁ = N₂/N₁."
        answer={
          <>
            <Formula>V<sub>2,peak</sub> = (N₂ / N₁) V<sub>1,peak</sub> = (10/100)(120) = 12 V</Formula>
            <p>Answer: <strong>12 V</strong>. The flux is shared between primary and secondary; each turn picks up the same dΦ/dt, so voltages scale with turn count. Currents scale inversely (energy conservation: V₁I₁ = V₂I₂ for an ideal transformer).</p>
          </>
        }
      />

      <TryIt
        tag="Problem 2.4.9"
        question={<>An RL circuit has <strong>L = 10 mH</strong> and <strong>R = 1 Ω</strong>. At t = 0 a battery is connected. What is the time constant τ for the current to grow toward its steady-state value?</>}
        hint="For an RL circuit, τ = L/R. The current rises as I(t) = (V/R)(1 − exp(−t/τ))."
        answer={
          <>
            <Formula>τ = L / R = 0.010 / 1 = 0.010 s = 10 ms</Formula>
            <p>Answer: <strong>10 ms</strong>. After one τ, the current has reached ~63% of its final value; after 5τ, it's within 1%. Inductance is what makes circuits "slow" — Faraday's law applied to the coil's own flux generates a back-EMF that opposes the change.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 2.4.10"
        question={<>A square loop of side <strong>a = 10 cm</strong> falls vertically out of a horizontal uniform <strong>B = 0.3 T</strong> region. When the loop is half out, it's falling at <strong>v = 2 m/s</strong>. Find the EMF at that instant.</>}
        hint="Only the horizontal edge inside B contributes motional EMF; rate of flux change is B·a·v."
        answer={
          <>
            <p>The loop's flux is decreasing as more of it leaves the field. The rate is</p>
            <Formula>dΦ/dt = B · (rate of area leaving) = B · a · v = (0.3)(0.10)(2) = 0.06 Wb/s</Formula>
            <Formula>|EMF| = 0.06 V = 60 mV</Formula>
            <p>Answer: <strong>~60 mV</strong>. The induced current circulates to maintain flux, which by Lenz's law also exerts a retarding force on the loop — the falling loop experiences "magnetic drag."</p>
          </>
        }
      />

      <TryIt
        tag="Problem 2.4.11"
        question={<>Conceptual: why does a copper-pendulum that swings between the poles of a strong magnet slow down quickly, even though copper is non-magnetic?</>}
        hint="Eddy currents."
        answer={
          <>
            <p>As the copper plate moves through the inhomogeneous field, the flux through any small region of it changes — inducing circulating "eddy" currents inside the plate. These currents dissipate energy via I²R heating in the copper, draining the pendulum's kinetic energy. By Lenz's law, the eddies also produce magnetic moments that oppose the motion through the field — a retarding force on top of the resistive loss. This is the working principle of every eddy-current brake on a roller-coaster, train, or commercial scale.</p>
          </>
        }
      />
    </>
  );

  return (
    <LabShell
      slug={SLUG}
      labSubtitle="Rotating Coil in a Uniform B Field"
      labId="faraday-2.4 / EMF = NBAω sin(ω t)"
      labContent={labContent}
      prose={prose}
    />
  );
}
