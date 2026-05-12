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
import { LabGrid, LegendItem } from '@/components/LabLayout';
import { LabShell } from '@/components/LabShell';
import { MathBlock, Pullout } from '@/components/Prose';
import { Readout } from '@/components/Readout';
import { Cite } from '@/components/SourcesList';
import { Slider } from '@/components/Slider';
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
        ctx.strokeStyle = 'rgba(255,59,110,0.95)';
        ctx.shadowColor = 'rgba(255,59,110,0.5)';
        ctx.shadowBlur = 6;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        for (let i = 0; i < scope.length; i++) {
          const s = scope[i];
          const x = scopeX + ((s.t - tCut) / SCOPE_DURATION) * scopeW;
          const y = scopeCy - (s.emf / yScale) * (scopeH / 2) * 0.9;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
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
      <h3>The connection between magnetism and electricity</h3>
      <p>
        Up to this point in the chapter, all magnetic fields have been <em>static</em>. They sit in space; they push moving charges sideways; they
        do no work. Then in the early 1830s, Michael Faraday wound copper around two iron rings, connected one to a galvanometer, and pulsed a
        current through the other. The galvanometer twitched — not while the current flowed, but at the moment it switched on, and again the
        moment it switched off. <em>Changing</em> magnetic flux produces an electric field<Cite id="faraday-1832" in={SOURCES} />.
      </p>
      <p>
        Pull a bar magnet through a coil of wire and a current flows in the wire. The voltage driving that current is the induced EMF, and its size
        is set by how fast the flux is changing through the loop. Spin a coil in a uniform field and the flux oscillates sinusoidally — you have
        a generator<Cite id="feynman-II-17" in={SOURCES} />.
      </p>

      <h3>The math, in stages</h3>
      <p>The flux through a loop is the field strength projected onto the loop's normal, integrated over its area:</p>
      <MathBlock>Φ<sub>B</sub> = ∫∫ B · dA</MathBlock>
      <p>
        For a flat coil of area <strong>A</strong> in a uniform field, this reduces to <strong>Φ = BA cos θ</strong> where <strong>θ</strong>
        is the angle between <strong>B</strong> and the coil's normal. Wind <strong>N</strong> turns and the loops share a single flux path, so the
        total flux linkage is <strong>NΦ</strong>. If the coil spins at angular rate <strong>ω</strong>:
      </p>
      <MathBlock>Φ(t) = N B A cos(ω t)</MathBlock>
      <p>Faraday's law says the induced EMF is the negative time derivative of the flux:</p>
      <MathBlock>EMF = − dΦ/dt = N B A ω sin(ω t)</MathBlock>
      <p>
        Sinusoidal output whose peak is set by every input variable: <strong>N, B, A, ω</strong>. Crank any one and the amplitude of the
        scope trace above grows in proportion. The frequency you read off is <strong>f = ω/(2π)</strong><Cite id="griffiths-2017" in={SOURCES} />.
      </p>

      <h3>The minus sign — Lenz's law</h3>
      <p>
        The minus sign in <strong>EMF = −dΦ/dt</strong> looks like a sign convention; it isn't. It encodes a real physical principle: the
        induced EMF drives a current whose <em>own</em> magnetic field opposes the change in flux that produced it. Push a magnet's north pole
        toward a coil, and the induced current organizes itself to push back. Pull the magnet away, and the induced current reverses to attract it<Cite id="feynman-II-17" in={SOURCES} />.
      </p>
      <p>
        This is energy conservation in disguise. The mechanical work you do cranking the shaft against the magnetic resistance is exactly the
        electrical energy delivered to the load. If the sign were positive, you'd have a perpetual motion machine on every workbench.
      </p>
      <Pullout>
        Magnetism never <em>moves</em>; only the flux does. Move the flux and electricity falls out.
      </Pullout>

      <h3>What an AC generator is</h3>
      <p>
        A coil spinning at constant <strong>ω</strong> inside a constant magnetic field puts out a sine wave whose peak amplitude is
        <strong> NBAω</strong>. That equation is literally the design formula for an alternator. North American wall-outlet power is 60 Hz, so
        <strong> ω = 2π · 60 ≈ 377 rad/s</strong>. Set the slider near 200 rad/s to see the scope trace at a few tens of Hz.
      </p>

      <h4>Maxwell's reformulation</h4>
      <p>
        In differential form, Faraday's law reads <strong>∇ × E = −∂B/∂t</strong>: a changing magnetic field creates a curling electric field,
        even in empty space — no loop of wire required. Pair this with Maxwell's correction to Ampère's law (introduced in the previous lab) and
        you have light: oscillating <strong>E</strong> regenerates <strong>B</strong>, oscillating <strong>B</strong> regenerates <strong>E</strong>,
        and the whole disturbance propagates at <strong>c</strong><Cite id="griffiths-2017" in={SOURCES} />.
      </p>
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
