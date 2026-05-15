/**
 * Lab 2.3 — Lorentz Force
 *
 *   F = q (E + v × B)
 *
 * Cyclotron motion of a charged particle in a uniform B field. The real
 * cyclotron radius r = mv⊥/(|q|B) and period T = 2π m/(|q|B) appear in
 * the readouts; the visual orbit is sped up so any combination of
 * settings is legible on screen.
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
import {PHYS, pretty, prettyJsx } from '@/lib/physics';
import { BASE_LAB_SOURCES } from '@/labs/data/manifest';

const SLUG = 'lorentz';
const SOURCES = BASE_LAB_SOURCES[SLUG]!;

export default function LorentzLab() {
  const [qSign, setQSign] = useState(-1);    // sign in units of e
  const [v, setV] = useState(1e6);            // m/s
  const [B, setB] = useState(0.1);            // T
  const [theta, setTheta] = useState(90);     // degrees

  const stateRef = useRef({ qSign, v, B, theta });
  useEffect(() => { stateRef.current = { qSign, v, B, theta }; }, [qSign, v, B, theta]);

  const computed = useMemo(() => {
    const m = qSign < 0 ? PHYS.me : PHYS.mp;
    const qmag = Math.abs(qSign) * PHYS.e;
    const thetaRad = (theta * Math.PI) / 180;
    const vperp = v * Math.sin(thetaRad);
    const vpar = v * Math.cos(thetaRad);
    const F = qmag * v * B * Math.sin(thetaRad);
    const rcyc =
      B > 1e-9 && qmag > 0 ? (m * vperp) / (qmag * B) : Infinity;
    const T =
      B > 1e-9 && qmag > 0 ? (2 * Math.PI * m) / (qmag * B) : Infinity;
    const f = isFinite(T) && T > 0 ? 1 / T : 0;
    return { F, rcyc, T, f, vpar };
  }, [qSign, v, B, theta]);

  // Reset trigger
  const [resetTick, setResetTick] = useState(0);

  const setupCanvas = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, colors } = info;
    let raf = 0;

    // Sim state local to draw loop
    const sim: { x: number; y: number; vx: number; vy: number; trail: { x: number; y: number }[] } = {
      x: w * 0.5,
      y: h * 0.5,
      vx: 0,
      vy: -1,
      trail: [],
    };

    function step() {
      const { qSign, v, B, theta } = stateRef.current;
      const thetaRad = (theta * Math.PI) / 180;
      if (B < 1e-9 || qSign === 0 || Math.sin(thetaRad) < 1e-6) {
        const sp = 2;
        sim.x += sim.vx * sp;
        sim.y += sim.vy * sp;
        if (sim.x < 0) sim.x = w;
        if (sim.x > w) sim.x = 0;
        if (sim.y < 0) sim.y = h;
        if (sim.y > h) sim.y = 0;
      } else {
        const sign = qSign > 0 ? 1 : -1;
        const m = qSign < 0 ? PHYS.me : PHYS.mp;
        const qmag = Math.abs(qSign) * PHYS.e;
        const realR = (m * v * Math.sin(thetaRad)) / (qmag * B);
        // Visual radius: log-scaled to stay on-screen
        const targetRadiusPx = Math.min(
          Math.min(w, h) * 0.38,
          Math.max(8, 20 * Math.log10(realR * 1e6 + 1.1)),
        );
        const dtheta = sign * 0.04;
        const speedPx = targetRadiusPx * dtheta;
        const cs = Math.cos(dtheta), sn = Math.sin(dtheta);
        const nvx = sim.vx * cs - sim.vy * sn;
        const nvy = sim.vx * sn + sim.vy * cs;
        sim.vx = nvx; sim.vy = nvy;
        sim.x += sim.vx * Math.abs(speedPx);
        sim.y += sim.vy * Math.abs(speedPx);
        if (sim.x < -10) sim.x = w + 10;
        if (sim.x > w + 10) sim.x = -10;
        if (sim.y < -10) sim.y = h + 10;
        if (sim.y > h + 10) sim.y = -10;
      }
      sim.trail.push({ x: sim.x, y: sim.y });
      if (sim.trail.length > 220) sim.trail.shift();
    }

    function draw() {
      const { qSign, B, theta } = stateRef.current;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      // B field × marks (into page)
      if (B > 0.005) {
        ctx.strokeStyle = `rgba(108,197,194,${Math.min(0.55, 0.12 + B * 0.45)})`;
        ctx.lineWidth = 1;
        const sp = 56;
        const sz = 3;
        for (let x = sp / 2; x < w; x += sp) {
          for (let y = sp / 2; y < h; y += sp) {
            ctx.beginPath();
            ctx.moveTo(x - sz, y - sz); ctx.lineTo(x + sz, y + sz);
            ctx.moveTo(x + sz, y - sz); ctx.lineTo(x - sz, y + sz);
            ctx.stroke();
          }
        }
      }

      step();

      // Trail
      if (sim.trail.length > 2) {
        ctx.strokeStyle = qSign < 0 ? 'rgba(91,174,248,0.45)' : 'rgba(255,59,110,0.45)';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(sim.trail[0].x, sim.trail[0].y);
        for (let i = 1; i < sim.trail.length; i++) {
          ctx.lineTo(sim.trail[i].x, sim.trail[i].y);
        }
        ctx.stroke();
      }

      // Velocity vector
      const vlen = 38;
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sim.x, sim.y);
      ctx.lineTo(sim.x + sim.vx * vlen, sim.y + sim.vy * vlen);
      ctx.stroke();
      const va = Math.atan2(sim.vy, sim.vx);
      ctx.fillStyle = colors.accent;
      ctx.beginPath();
      ctx.moveTo(sim.x + sim.vx * vlen, sim.y + sim.vy * vlen);
      ctx.lineTo(sim.x + sim.vx * vlen - 8 * Math.cos(va - 0.4), sim.y + sim.vy * vlen - 8 * Math.sin(va - 0.4));
      ctx.lineTo(sim.x + sim.vx * vlen - 8 * Math.cos(va + 0.4), sim.y + sim.vy * vlen - 8 * Math.sin(va + 0.4));
      ctx.closePath(); ctx.fill();

      // Force vector
      if (B > 0.005 && qSign !== 0) {
        const flen = 28;
        const sign = qSign > 0 ? 1 : -1;
        const fx = sign * (-sim.vy);
        const fy = sign * (sim.vx);
        ctx.strokeStyle = 'rgba(255,59,110,0.95)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(sim.x, sim.y);
        ctx.lineTo(sim.x + fx * flen, sim.y + fy * flen);
        ctx.stroke();
        const fa = Math.atan2(fy, fx);
        ctx.fillStyle = 'rgba(255,59,110,0.95)';
        ctx.beginPath();
        ctx.moveTo(sim.x + fx * flen, sim.y + fy * flen);
        ctx.lineTo(sim.x + fx * flen - 8 * Math.cos(fa - 0.4), sim.y + fy * flen - 8 * Math.sin(fa - 0.4));
        ctx.lineTo(sim.x + fx * flen - 8 * Math.cos(fa + 0.4), sim.y + fy * flen - 8 * Math.sin(fa + 0.4));
        ctx.closePath(); ctx.fill();
      }

      // Particle
      const partColor = qSign < 0 ? '#5baef8' : qSign > 0 ? '#ff3b6e' : '#a09e95';
      ctx.fillStyle = partColor;
      ctx.shadowColor = partColor;
      ctx.shadowBlur = 14;
      ctx.beginPath(); ctx.arc(sim.x, sim.y, 7, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = colors.bg;
      ctx.font = 'bold 9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(qSign < 0 ? '−' : qSign > 0 ? '+' : '0', sim.x, sim.y);

      // Pitch-angle annotation
      if (Math.abs(theta - 90) > 5) {
        ctx.fillStyle = colors.textDim;
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText('helix — only ⊥ component shown', w / 2, h - 14);
      }

      // Numerical overlay
      const F = stateRef.current.B > 0 ? Math.abs(qSign) * PHYS.e * stateRef.current.v * stateRef.current.B * Math.sin((stateRef.current.theta * Math.PI) / 180) : 0;
      const m = qSign < 0 ? PHYS.me : PHYS.mp;
      const qmag = Math.abs(qSign) * PHYS.e;
      const r = stateRef.current.B > 1e-9 && qmag > 0
        ? (m * stateRef.current.v * Math.sin((stateRef.current.theta * Math.PI) / 180)) / (qmag * stateRef.current.B)
        : Infinity;
      const T = stateRef.current.B > 1e-9 && qmag > 0 ? (2 * Math.PI * m) / (qmag * stateRef.current.B) : Infinity;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = colors.accent;
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillText(`F = ${pretty(F)} N`, 24, 28);
      ctx.fillStyle = colors.teal;
      ctx.fillText(`r = ${isFinite(r) ? pretty(r) : '∞'} m`, 24, 48);
      ctx.fillStyle = colors.textDim;
      ctx.fillText(`T = ${isFinite(T) ? pretty(T) : '∞'} s`, 24, 68);

      ctx.textAlign = 'right';
      const partName = qSign < 0 ? 'electron' : qSign > 0 ? 'proton-mass' : 'neutral';
      ctx.fillStyle = partColor;
      ctx.fillText(`q = ${qSign}e (${partName})`, w - 24, 28);
      ctx.fillStyle = colors.teal;
      ctx.fillText(`B = ${stateRef.current.B.toFixed(2)} T  (⊗ into page)`, w - 24, 48);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); };
  // resetTick is read indirectly via stateRef effects — but we want a remount on reset.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetTick]);

  const labContent = (
    <LabGrid
      canvas={<AutoResizeCanvas height={500} setup={setupCanvas} />}
      legend={
        <>
          <LegendItem swatchColor="var(--blue)" dot>Particle (electron)</LegendItem>
          <LegendItem swatchColor="var(--accent)">Velocity v</LegendItem>
          <LegendItem swatchColor="var(--pink)">Force F</LegendItem>
          <LegendItem swatchColor="var(--teal)" dot>B field (⊗ into page)</LegendItem>
          <LegendItem style={{ marginLeft: 'auto' }}>
            <button className="btn" onClick={() => setResetTick(t => t + 1)}>Reset particle</button>
          </LegendItem>
        </>
      }
      inputs={
        <>
          <Slider sym="q" label="Charge sign" value={qSign} min={-2} max={2} step={1}
            format={v => {
              const n = Math.round(v);
              if (n === 0) return '0 (neutral)';
              return (n > 0 ? '+' : '') + n + 'e';
            }}
            metaLeft="−2e" metaRight="+2e"
            onChange={v => setQSign(Math.round(v))} />
          <Slider sym="v" label="Particle speed" value={v} min={10000} max={10000000} step={10000}
            format={vv => pretty(vv) + ' m/s'} metaLeft="10⁴ m/s" metaRight="10⁷ m/s" onChange={setV} />
          <Slider sym="B" label="B field magnitude" value={B} min={0} max={1} step={0.01}
            format={vv => vv.toFixed(2) + ' T'} metaLeft="0 T" metaRight="1 T" onChange={setB} />
          <Slider sym="θ" label="Pitch angle (v to B)" value={theta} min={0} max={180} step={1}
            format={vv => Math.round(vv) + '°'} metaLeft="0°" metaRight="180°" onChange={setTheta} />
        </>
      }
      outputs={
        <>
          <Readout sym="F" label="Magnetic force" value={prettyJsx(computed.F)} unit="N" highlight />
          <Readout sym="r" label="Cyclotron radius"
            value={isFinite(computed.rcyc) ? prettyJsx(computed.rcyc) : '∞'} unit="m" />
          <Readout sym="T" label="Cyclotron period"
            value={isFinite(computed.T) ? prettyJsx(computed.T) : '∞'} unit="s" />
          <Readout sym="f" label="Cyclotron frequency"
            value={computed.f > 0 ? prettyJsx(computed.f) : '0'} unit="Hz" />
          <Readout sym={<>v<sub>∥</sub></>} label="v parallel to B" value={prettyJsx(computed.vpar)} unit="m/s" />
        </>
      }
    />
  );

  const prose = (
    <>
      <h3 className="font-2 font-normal italic text-9 leading-1 my-4xl mb-xl text-text tracking-1">Context</h3>
      <p className="mb-prose-3">
        The Lorentz force is the operational definition of <strong className="text-text font-medium">E</strong> and <strong className="text-text font-medium">B</strong>: they are <em className="italic text-text">defined</em> by the force
        they apply to a probe charge of arbitrary velocity. Every motor, every CRT, every mass spectrometer, every cyclotron, every aurora,
        every plasma confinement device runs on this single equation<Cite id="griffiths-2017" in={SOURCES} />.
      </p>
      <p className="mb-prose-3">
        The non-relativistic form below assumes <strong className="text-text font-medium">v ≪ c</strong>. For ultra-relativistic particles you need the full four-vector form,
        which adds a γ factor on the inertial side (the force formula itself is already relativistically correct); but at the speeds in this
        lab (10⁴–10⁷ m/s), the Newtonian treatment is exact to well under 1%. The equation also assumes the field is given — it doesn't
        include the field generated <em className="italic text-text">by</em> the moving charge (radiation reaction, self-force).
      </p>

      <h3 className="font-2 font-normal italic text-9 leading-1 my-4xl mb-xl text-text tracking-1">Formula</h3>
      <MathBlock>F = q E + q v × B</MathBlock>
      <p className="mb-prose-3">Variable glossary:</p>
      <ul>
        <li><strong className="text-text font-medium">F</strong> — force on the particle, in newtons (N).</li>
        <li><strong className="text-text font-medium">q</strong> — charge of the particle, in coulombs (C); electron is −e ≈ −1.602×10⁻¹⁹ C.</li>
        <li><strong className="text-text font-medium">E</strong> — electric field at the particle's location, in V/m (or N/C).</li>
        <li><strong className="text-text font-medium">v</strong> — velocity of the particle, in m/s.</li>
        <li><strong className="text-text font-medium">B</strong> — magnetic field at the particle's location, in tesla (T).</li>
      </ul>
      <p className="mb-prose-3">For motion perpendicular to B (pitch angle 90°), Newton's second law gives circular motion with</p>
      <MathBlock>r = m v / (|q| B),    T = 2π m / (|q| B),    f = |q| B / (2π m)</MathBlock>
      <p className="mb-prose-3">The radius is the <em className="italic text-text">cyclotron radius</em>; T is the <em className="italic text-text">cyclotron period</em>; f the <em className="italic text-text">cyclotron frequency</em>.</p>

      <h3 className="font-2 font-normal italic text-9 leading-1 my-4xl mb-xl text-text tracking-1">Intuition</h3>
      <p className="mb-prose-3">
        Two pieces. The electric term <strong className="text-text font-medium">qE</strong> is the familiar push along the field. The magnetic term <strong className="text-text font-medium">qv × B</strong> is
        always perpendicular to both <strong className="text-text font-medium">v</strong> and <strong className="text-text font-medium">B</strong>. A force perpendicular to motion does no work, so kinetic
        energy is conserved — only the direction changes. The result is circular motion in the plane perpendicular to B (with any v∥ component
        unchanged: a helix).
      </p>
      <Pullout>
        Magnetism doesn't do work. It only <em className="italic text-text">steers</em>.
      </Pullout>

      <h3 className="font-2 font-normal italic text-9 leading-1 my-4xl mb-xl text-text tracking-1">Reasoning</h3>
      <p className="mb-prose-3">
        Why a cross product? Because the magnetic force must be perpendicular to <strong className="text-text font-medium">v</strong> (else it would do work and B-fields would
        change kinetic energy — which contradicts experiment); and because it must be perpendicular to <strong className="text-text font-medium">B</strong> (else moving along
        a field line would feel a sideways push, which by symmetry it cannot). The unique vector built from <strong className="text-text font-medium">v</strong> and <strong className="text-text font-medium">B</strong>
        perpendicular to both is the cross product.
      </p>
      <p className="mb-prose-3">
        Why the sign? The right-hand rule for <strong className="text-text font-medium">v × B</strong> is set by convention; multiplying by <strong className="text-text font-medium">q</strong> (signed) gives the
        force direction. Electron and proton orbit the same B in opposite senses — the lab visualization shows that explicitly. Why r ∝ v? Faster
        particles need a bigger circle to keep the centripetal acceleration constant. Why does T <em className="italic text-text">not</em> depend on v? Because both circumference
        and speed scale linearly with v, and their ratio is the period. This is the famous fact that cyclotrons exploit<Cite id="feynman-II-13" in={SOURCES} />.
      </p>

      <h3 className="font-2 font-normal italic text-9 leading-1 my-4xl mb-xl text-text tracking-1">Derivation</h3>
      <p className="mb-prose-3">
        For a particle of mass <strong className="text-text font-medium">m</strong> moving at speed <strong className="text-text font-medium">v</strong> perpendicular to <strong className="text-text font-medium">B</strong>, the magnetic force
        is <strong className="text-text font-medium">F = |q|vB</strong> and points centripetally (right-hand rule). Newton's second law for circular motion:
      </p>
      <MathBlock>|q| v B = m v² / r  ⇒  r = m v / (|q| B)</MathBlock>
      <p className="mb-prose-3">Period is circumference divided by speed:</p>
      <MathBlock>T = 2π r / v = 2π m / (|q| B)</MathBlock>
      <p className="mb-prose-3">
        Frequency <strong className="text-text font-medium">f = 1/T = |q|B/(2πm)</strong>. The electron and proton masses used here are the CODATA 2018 recommended values:
        <strong className="text-text font-medium"> m<sub>e</sub> ≈ 9.109 × 10⁻³¹ kg</strong>, <strong className="text-text font-medium">m<sub>p</sub> ≈ 1.673 × 10⁻²⁷ kg</strong><Cite id="codata-2018" in={SOURCES} />.
      </p>

      <h3 className="font-2 font-normal italic text-9 leading-1 my-4xl mb-xl text-text tracking-1">Worked problems</h3>

      <TryIt
        tag="Problem 2.3.1"
        question={<>An electron moving perpendicular to a <strong className="text-text font-medium">B = 1 T</strong> field at <strong className="text-text font-medium">v = 10⁶ m/s</strong>. Find the cyclotron radius.</>}
        hint="r = mv / (|q|B)."
        answer={
          <>
            <Formula>r = m<sub>e</sub> v / (e B) = (9.109×10⁻³¹)(10⁶) / (1.602×10⁻¹⁹ × 1)</Formula>
            <Formula>r ≈ 5.69 × 10⁻⁶ m</Formula>
            <p className="mb-prose-3">Answer: <strong className="text-text font-medium">~5.7 µm</strong>. A 1 T field is strong enough to bend an electron beam into a micrometre orbit.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 2.3.2"
        question={<>Same electron, same B = 1 T. Find the cyclotron frequency.</>}
        hint="f = eB/(2π m). Note it's independent of v."
        answer={
          <>
            <Formula>f = e B / (2π m<sub>e</sub>) = (1.602×10⁻¹⁹)(1) / (2π × 9.109×10⁻³¹)</Formula>
            <Formula>f ≈ 2.80 × 10¹⁰ Hz = 28 GHz</Formula>
            <p className="mb-prose-3">Answer: <strong className="text-text font-medium">~28 GHz</strong> — the electron cyclotron frequency in 1 T. ECR plasma sources, EPR spectrometers, and gyrotrons all run at this frequency.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 2.3.3"
        question={<>A proton moving perpendicular to a <strong className="text-text font-medium">B = 1 mT</strong> field at <strong className="text-text font-medium">v = 10⁵ m/s</strong>. Find the orbit radius.</>}
        hint="Same formula, but with proton mass and milli-tesla field."
        answer={
          <>
            <Formula>r = m<sub>p</sub> v / (e B) = (1.673×10⁻²⁷)(10⁵) / (1.602×10⁻¹⁹ × 10⁻³)</Formula>
            <Formula>r ≈ 1.04 m</Formula>
            <p className="mb-prose-3">Answer: <strong className="text-text font-medium">~1.0 m</strong>. A proton in a weak field traces a metre-scale orbit; ions in solar-wind plasmas at ~1 nT trace orbits hundreds of kilometres across.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 2.3.4"
        question={<>A mass spectrometer accelerates an ion of mass <strong className="text-text font-medium">m</strong> and charge <strong className="text-text font-medium">q</strong> through potential <strong className="text-text font-medium">V</strong>, then injects it perpendicular into a uniform <strong className="text-text font-medium">B</strong>. Show that the orbit radius is <strong className="text-text font-medium">r = √(2mV/q)/B</strong>.</>}
        hint="Energy conservation gives v; then r = mv/(qB)."
        answer={
          <>
            <p className="mb-prose-3">Energy conservation: qV = ½mv², so v = √(2qV/m).</p>
            <Formula>r = m v / (q B) = (m / q B) · √(2 q V / m) = √(2 m V / q) / B</Formula>
            <p className="mb-prose-3">So heavier isotopes trace bigger circles for the same V and B — which is exactly how a mass spectrometer separates isotopes. Reading r off a photographic plate gives m to four-figure precision.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 2.3.5"
        question={<>A Wien velocity filter: crossed <strong className="text-text font-medium">E ⊥ B</strong>. Which velocity passes through undeflected?</>}
        hint="Net force zero: qE = qvB."
        answer={
          <>
            <p className="mb-prose-3">For the electric force to cancel the magnetic force, the magnitudes must match and the directions must oppose:</p>
            <Formula>q E = q v B  ⇒  v = E / B</Formula>
            <p className="mb-prose-3">Particles slower than E/B are over-pushed by E; faster particles are over-pushed by qv × B. Only those at v = E/B make it through. With E = 10⁵ V/m and B = 0.01 T, the filtered velocity is 10⁷ m/s.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 2.3.6"
        question={<>Conceptual: why doesn't a magnetic field do work on a charged particle?</>}
        hint="Work is F · v. Look at F = qv × B."
        answer={
          <>
            <p className="mb-prose-3">Power delivered is <strong className="text-text font-medium">P = F · v = q(v × B) · v</strong>. The vector (v × B) is by construction perpendicular to v, so its dot product with v is zero. P = 0 for any time, any v, any B. No work is ever done; kinetic energy is conserved; magnetic fields can only change the direction of motion, not the speed. This is what makes cyclotron orbits perfect circles instead of spirals, and why magnetic confinement of plasmas is energetically free.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 2.3.7"
        question={<>A straight wire of length <strong className="text-text font-medium">L = 20 cm</strong> carries <strong className="text-text font-medium">I = 3 A</strong> perpendicular to a <strong className="text-text font-medium">B = 0.5 T</strong> field. Find the force on the wire.</>}
        hint="Each electron in the wire feels qv × B; the macroscopic result is F = IL × B."
        answer={
          <>
            <p className="mb-prose-3">Each carrier with drift velocity v contributes qv × B. The sum over all carriers in length L is</p>
            <Formula>F = I L × B   (magnitudes: F = I L B sin θ)</Formula>
            <Formula>|F| = (3)(0.20)(0.5) = 0.30 N</Formula>
            <p className="mb-prose-3">Answer: <strong className="text-text font-medium">0.30 N</strong>, perpendicular to both I and B. This is the engine of every electric motor: a current loop in a B field feels a torque.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 2.3.8"
        question={<>Hall effect: a thin strip of width <strong className="text-text font-medium">w</strong> carrying current <strong className="text-text font-medium">I</strong> in a perpendicular <strong className="text-text font-medium">B</strong>. Derive the Hall voltage V<sub>H</sub> in terms of I, B, w, t (strip thickness), and carrier density n.</>}
        hint="At steady state, the transverse electric field cancels the transverse Lorentz force on carriers."
        answer={
          <>
            <p className="mb-prose-3">Carrier drift velocity in terms of current density: J = nqv<sub>d</sub>, and J = I/(wt). So v<sub>d</sub> = I/(nqwt).</p>
            <p className="mb-prose-3">At steady state, charges have piled up on the edges to produce a transverse E that balances the Lorentz force:</p>
            <Formula>q E<sub>H</sub> = q v<sub>d</sub> B  ⇒  E<sub>H</sub> = v<sub>d</sub> B = I B / (n q w t)</Formula>
            <p className="mb-prose-3">The Hall voltage across width w:</p>
            <Formula>V<sub>H</sub> = E<sub>H</sub> w = I B / (n q t)</Formula>
            <p className="mb-prose-3">Notice that w cancels — V<sub>H</sub> depends only on I, B, t, and carrier density. Edwin Hall measured this in 1879 — decades before the electron was identified — to probe what kind of carrier actually moves in a metal<Cite id="hall-1879" in={SOURCES} />.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 2.3.9"
        question={<>An ion in Earth's magnetic field (<strong className="text-text font-medium">B = 50 µT</strong>) moves at <strong className="text-text font-medium">v = 1000 m/s</strong>, perpendicular to B. If the ion is a singly-ionized oxygen atom (mass ≈ 16 amu), what is the orbit radius?</>}
        hint="Same r = mv/(qB) formula; 1 amu ≈ 1.66 × 10⁻²⁷ kg."
        answer={
          <>
            <p className="mb-prose-3">m = 16 × 1.66 × 10⁻²⁷ ≈ 2.66 × 10⁻²⁶ kg.</p>
            <Formula>r = m v / (q B) = (2.66×10⁻²⁶)(10³) / (1.602×10⁻¹⁹ × 5×10⁻⁵)</Formula>
            <Formula>r ≈ 3.32 m</Formula>
            <p className="mb-prose-3">Answer: <strong className="text-text font-medium">~3.3 m</strong>. Slow ions in Earth's magnetic field trace metres-wide orbits. Solar-wind protons hitting the magnetosphere at 400 km/s have ~50 km orbits in the same field, which is why magnetosphere physics deals with such enormous structures.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 2.3.10"
        question={<>Cyclotron design: what <strong className="text-text font-medium">B</strong> is needed to keep a 5 MeV proton in a 1 m orbit?</>}
        hint="KE = ½mv² gives v; then r = mv/(qB) → B = mv/(qr)."
        answer={
          <>
            <p className="mb-prose-3">KE = 5 MeV = 5 × 10⁶ × 1.602 × 10⁻¹⁹ ≈ 8.01 × 10⁻¹³ J. (At 5 MeV the proton is still non-relativistic to ~0.5%.)</p>
            <Formula>v = √(2 · KE / m) = √(2 × 8.01×10⁻¹³ / 1.673×10⁻²⁷) ≈ 3.10 × 10⁷ m/s</Formula>
            <Formula>B = m v / (q r) = (1.673×10⁻²⁷)(3.10×10⁷) / (1.602×10⁻¹⁹ × 1) ≈ 0.324 T</Formula>
            <p className="mb-prose-3">Answer: <strong className="text-text font-medium">~0.32 T</strong>. A modest electromagnet does it. Lawrence's first cyclotron (1932) ran at ~1.3 T to push protons to 1.2 MeV in an 11-inch dee.</p>
          </>
        }
      />

      <TryIt
        tag="Problem 2.3.11"
        question={<>A horizontal conducting rod of mass <strong className="text-text font-medium">m = 50 g</strong> and length <strong className="text-text font-medium">L = 30 cm</strong> rests on parallel horizontal rails in a vertical <strong className="text-text font-medium">B = 0.4 T</strong> field. What current <strong className="text-text font-medium">I</strong> would be needed to <em className="italic text-text">lift</em> the rod against gravity?</>}
        hint="Balance F = ILB against weight mg."
        answer={
          <>
            <p className="mb-prose-3">The magnetic force on the rod is <strong className="text-text font-medium">F = ILB</strong>, directed perpendicular to both I and B — upward by right-hand rule. For lift:</p>
            <Formula>I L B = m g</Formula>
            <Formula>I = m g / (L B) = (0.050)(9.81) / (0.30)(0.4) ≈ 4.09 A</Formula>
            <p className="mb-prose-3">Answer: <strong className="text-text font-medium">~4.1 A</strong>. This is the principle of the rail gun: enough current and the rod doesn't just lift, it accelerates along the rails. The magnetic launch of payloads in the upcoming generation of mass drivers relies on the same equation.</p>
          </>
        }
      />
    </>
  );

  return (
    <LabShell
      slug={SLUG}
      labSubtitle="Cyclotron Motion in a Uniform B"
      labId="lorentz-2.3 / r = mv/(qB)"
      labContent={labContent}
      prose={prose}
    />
  );
}
