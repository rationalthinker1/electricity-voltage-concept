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
import { LabGrid, LegendItem } from '@/components/LabLayout';
import { LabShell } from '@/components/LabShell';
import { MathBlock, Pullout } from '@/components/Prose';
import { Readout } from '@/components/Readout';
import { Cite } from '@/components/SourcesList';
import { Slider } from '@/components/Slider';
import { PHYS, pretty } from '@/lib/physics';
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
    const { ctx, w, h } = info;
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
      ctx.fillStyle = '#0d0d10';
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
      ctx.strokeStyle = 'rgba(255,107,42,0.95)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sim.x, sim.y);
      ctx.lineTo(sim.x + sim.vx * vlen, sim.y + sim.vy * vlen);
      ctx.stroke();
      const va = Math.atan2(sim.vy, sim.vx);
      ctx.fillStyle = 'rgba(255,107,42,0.95)';
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
      ctx.fillStyle = '#0a0a0b';
      ctx.font = 'bold 9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(qSign < 0 ? '−' : qSign > 0 ? '+' : '0', sim.x, sim.y);

      // Pitch-angle annotation
      if (Math.abs(theta - 90) > 5) {
        ctx.fillStyle = 'rgba(160,158,149,0.85)';
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
      ctx.fillStyle = '#ff6b2a';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillText(`F = ${pretty(F)} N`, 24, 28);
      ctx.fillStyle = 'rgba(108,197,194,0.95)';
      ctx.fillText(`r = ${isFinite(r) ? pretty(r) : '∞'} m`, 24, 48);
      ctx.fillStyle = 'rgba(160,158,149,0.85)';
      ctx.fillText(`T = ${isFinite(T) ? pretty(T) : '∞'} s`, 24, 68);

      ctx.textAlign = 'right';
      const partName = qSign < 0 ? 'electron' : qSign > 0 ? 'proton-mass' : 'neutral';
      ctx.fillStyle = partColor;
      ctx.fillText(`q = ${qSign}e (${partName})`, w - 24, 28);
      ctx.fillStyle = 'rgba(108,197,194,0.95)';
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
          <Readout sym="F" label="Magnetic force" valueHTML={pretty(computed.F)} unit="N" highlight />
          <Readout sym="r" label="Cyclotron radius"
            valueHTML={isFinite(computed.rcyc) ? pretty(computed.rcyc) : '∞'} unit="m" />
          <Readout sym="T" label="Cyclotron period"
            valueHTML={isFinite(computed.T) ? pretty(computed.T) : '∞'} unit="s" />
          <Readout sym="f" label="Cyclotron frequency"
            valueHTML={computed.f > 0 ? pretty(computed.f) : '0'} unit="Hz" />
          <Readout sym={<>v<sub>∥</sub></>} label="v parallel to B" valueHTML={pretty(computed.vpar)} unit="m/s" />
        </>
      }
    />
  );

  const prose = (
    <>
      <h3>What the cross product does</h3>
      <p>
        Of all the equations in classical electromagnetism, the Lorentz force is the one that tells you what <strong>E</strong> and <strong>B</strong>
        <em> are for</em>. They are defined operationally by the force they apply to a probe charge moving at velocity <strong>v</strong>:
      </p>
      <MathBlock>F = q (E + v × B)</MathBlock>
      <p>
        The first term is the familiar electric push: parallel to <strong>E</strong>, scaled by <strong>q</strong>. The second is the strange one.
        The cross product <strong>v × B</strong> is perpendicular to both <strong>v</strong> and <strong>B</strong>. So the magnetic force is
        always perpendicular to motion. A perpendicular force does no work. Kinetic energy is conserved; only direction changes<Cite id="griffiths-2017" in={SOURCES} />.
      </p>
      <Pullout>
        Magnetism doesn't do work. It only <em>steers</em>.
      </Pullout>

      <h3>Cyclotron motion</h3>
      <p>
        Set the pitch angle to 90° — <strong>v</strong> perpendicular to <strong>B</strong> — and the particle traces a perfect
        circle. Newton's law in the rotating frame: <strong>qvB = mv²/r</strong>. Solve for the radius:
      </p>
      <MathBlock>r = mv / (|q|B)</MathBlock>
      <p>And the period:</p>
      <MathBlock>T = 2π m / (|q|B)</MathBlock>
      <p>
        Notice what's missing on the right side: <em>v</em>. Faster particles trace bigger circles, but they take exactly the same time to go around.
        That speed-independence is the magic behind the cyclotron — a fixed-frequency RF accelerator can keep adding energy at the right time on
        every orbit regardless of how fast the particle is going<Cite id="feynman-II-13" in={SOURCES} />.
      </p>
      <p>
        The electron rest mass <strong>m<sub>e</sub> ≈ 9.109×10⁻³¹ kg</strong> and proton mass <strong>m<sub>p</sub> ≈ 1.673×10⁻²⁷ kg</strong> used
        in this lab come from the CODATA 2018 recommended values<Cite id="codata-2018" in={SOURCES} />.
      </p>

      <h3>Add an E field</h3>
      <p>
        With both <strong>E</strong> and <strong>B</strong>, the dynamics get richer. A pure <strong>E</strong> in some direction adds a straight-line
        acceleration on top of the circular drift. Pair crossed <strong>E</strong> and <strong>B</strong> at right angles and only particles satisfying
        <strong> qE = qvB</strong> → <strong>v = E/B</strong> pass through undeflected — a Wien velocity filter. Mass spectrometers and electron-optics
        columns are variations on this geometry<Cite id="griffiths-2017" in={SOURCES} />.
      </p>

      <h3>Why charged particles spiral around magnetic field lines</h3>
      <p>
        In a non-uniform <strong>B</strong>, the particle's motion decomposes naturally: the perpendicular component traces a tight circle
        (gyromotion); the parallel component is unaffected (no force from <strong>v<sub>∥</sub> × B</strong>). The result is a helix wrapping the
        field line. Where the field strengthens, the gyroradius shrinks and the particle is repelled from regions of high <strong>|B|</strong>
        — the magnetic mirror<Cite id="feynman-II-13" in={SOURCES} />.
      </p>

      <h4>The Hall effect</h4>
      <p>
        Run a current through a flat strip of metal and place a <strong>B</strong> perpendicular to it. The moving carriers feel a Lorentz force
        sideways. Charge piles up on one edge; a transverse voltage builds — the <em>Hall voltage</em>. Its sign reveals the sign of the
        mobile carriers: positive for hole-conducting semiconductors, negative for ordinary metals. In 1879, Edwin Hall used this trick to study
        the action of a magnet on electric currents, decades before the electron itself was identified<Cite id="hall-1879" in={SOURCES} />.
      </p>
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
