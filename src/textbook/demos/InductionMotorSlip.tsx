/**
 * Demo D16.3 — Three-phase induction motor (slip)
 *
 * Three-phase stator currents produce a rotating magnetic field at
 * synchronous speed n_s = 120 f / p RPM (p poles). A squirrel-cage rotor
 * lags behind by the slip fraction s = (n_s − n) / n_s. The lag induces
 * currents in the rotor bars, which interact with the stator field to
 * produce torque. The model:
 *   τ ∝ s (linear region — operating near synchronous speed)
 *   load_torque set by slider → solve for s in steady state
 *
 * Sliders: line frequency f, load torque (arbitrary units).
 * Readouts: synchronous RPM, rotor RPM, slip%, torque.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';

interface Props { figure?: string }

const POLES = 4; // 4-pole machine — synchronous speed at 60 Hz = 1800 RPM

export function InductionMotorSlipDemo({ figure }: Props) {
  const [f, setF] = useState(60);
  // Load as fraction of max stable torque (0..1). Operating region is the
  // linear part of the torque/slip curve before pull-out.
  const [load, setLoad] = useState(0.5);

  const stateRef = useRef({ f, load });
  useEffect(() => { stateRef.current = { f, load }; }, [f, load]);

  const computed = useMemo(() => {
    // Synchronous speed (RPM): n_s = 120 f / p
    const n_s = (120 * f) / POLES;
    // Linear regime: slip is proportional to load (up to pull-out at s≈0.15)
    // Take torque = (s / s_max) * τ_max; here τ_max chosen so load=1 → s=0.05.
    const s_at_full_load = 0.05;
    const s = load * s_at_full_load;       // dimensionless slip
    const n = n_s * (1 - s);               // rotor RPM
    return { n_s, n, s };
  }, [f, load]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h } = info;
    let raf = 0;
    let lastT = performance.now();
    let statorAng = 0;     // rotating-field angle
    let rotorAng = 0;

    function draw() {
      const now = performance.now();
      let dt = (now - lastT) / 1000;
      lastT = now;
      if (dt > 0.1) dt = 0.1;

      const { f, load } = stateRef.current;
      // Synchronous angular speed of the field. For pole-pair count p/2,
      // mechanical synchronous ω_s = 2π f / (p/2) = 4π f / p.
      const omega_s = (4 * Math.PI * f) / POLES;
      const slip = load * 0.05;
      const omega_rotor = omega_s * (1 - slip);

      // Cap the visualised speed so it doesn't blur.
      const visCap = 3.0;
      const scale = omega_s > visCap ? visCap / omega_s : 1;
      statorAng += omega_s * scale * dt;
      rotorAng += omega_rotor * scale * dt;

      ctx.fillStyle = '#0d0d10';
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const R = Math.min(w, h) * 0.36;

      // Stator: ring with N and S poles indicated by the rotating field.
      ctx.strokeStyle = 'rgba(255,255,255,0.10)';
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(cx, cy, R + 18, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, R - 4, 0, Math.PI * 2); ctx.stroke();

      // Rotating stator-field vector (the "ghost magnet")
      const sFx = cx + Math.cos(statorAng) * R * 0.95;
      const sFy = cy - Math.sin(statorAng) * R * 0.95;
      const sSx = cx - Math.cos(statorAng) * R * 0.95;
      const sSy = cy + Math.sin(statorAng) * R * 0.95;
      ctx.strokeStyle = 'rgba(108,197,194,0.45)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sSx, sSy); ctx.lineTo(sFx, sFy); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(108,197,194,0.7)';
      ctx.beginPath(); ctx.arc(sFx, sFy, 9, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(108,197,194,0.4)';
      ctx.beginPath(); ctx.arc(sSx, sSy, 9, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#0a0a0b';
      ctx.font = 'bold 10px JetBrains Mono';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('N', sFx, sFy);
      ctx.fillText('S', sSx, sSy);

      // Squirrel-cage rotor: 12 vertical conductive bars on a cylinder
      const bars = 12;
      const rBar = R * 0.55;
      for (let i = 0; i < bars; i++) {
        const a = rotorAng + (i / bars) * Math.PI * 2;
        const bx = cx + Math.cos(a) * rBar;
        const by = cy - Math.sin(a) * rBar;
        // Induced current strength depends on slip — brighter at higher slip
        const intensity = Math.min(1, slip * 25 + 0.15);
        ctx.fillStyle = `rgba(255,107,42,${0.4 + 0.5 * intensity})`;
        ctx.beginPath(); ctx.arc(bx, by, 5, 0, Math.PI * 2); ctx.fill();
      }
      // End ring (the shorting ring of the squirrel cage)
      ctx.strokeStyle = 'rgba(255,107,42,0.45)';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(cx, cy, rBar, 0, Math.PI * 2); ctx.stroke();
      // Rotor body hint
      ctx.strokeStyle = 'rgba(255,255,255,0.10)';
      ctx.beginPath(); ctx.arc(cx, cy, rBar - 16, 0, Math.PI * 2); ctx.stroke();

      // Rotor reference marker (so the user sees rotor speed vs stator)
      const refA = rotorAng;
      const rmx = cx + Math.cos(refA) * (rBar - 10);
      const rmy = cy - Math.sin(refA) * (rBar - 10);
      ctx.fillStyle = '#ff6b2a';
      ctx.beginPath(); ctx.arc(rmx, rmy, 4, 0, Math.PI * 2); ctx.fill();

      // Labels
      ctx.fillStyle = 'rgba(160,158,149,0.75)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText('rotating stator field (dashed)', 12, 12);
      ctx.fillText('squirrel-cage rotor', 12, 26);
      ctx.textAlign = 'right';
      ctx.fillText(`load = ${(load * 100).toFixed(0)}%`, w - 12, 12);
      ctx.fillText(`slip = ${(slip * 100).toFixed(2)}%`, w - 12, 26);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 16.3'}
      title="The induction motor — slip is the signal"
      question="The rotor never catches up with the stator's field. Why is that a feature, not a bug?"
      caption={<>
        A balanced three-phase stator current creates a rotating magnetic field at synchronous
        speed <em>n<sub>s</sub> = 120 f / p</em>. The rotor — a squirrel cage of shorted bars on
        a steel core — lags behind by the slip <em>s</em>. That lag changes the flux linking each
        bar, induces currents in the bars, and those currents react with the stator field to
        produce torque. No connection to the rotor; no commutator. Tesla, 1888.
      </>}
    >
      <AutoResizeCanvas height={320} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="line f"
          value={f} min={20} max={100} step={1}
          format={v => v.toFixed(0) + ' Hz'}
          onChange={setF}
        />
        <MiniSlider
          label="load"
          value={load} min={0} max={1} step={0.01}
          format={v => (v * 100).toFixed(0) + '%'}
          onChange={setLoad}
        />
        <MiniReadout label="n_synchronous" value={<Num value={computed.n_s} digits={0} />} unit="rpm" />
        <MiniReadout label="n_rotor" value={<Num value={computed.n} digits={0} />} unit="rpm" />
        <MiniReadout label="slip" value={(computed.s * 100).toFixed(2) + '%'} />
      </DemoControls>
    </Demo>
  );
}
