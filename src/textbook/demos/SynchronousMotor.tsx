/**
 * Demo D16.4 — Synchronous motor
 *
 * Like the induction-motor diagram, but the rotor is a permanent magnet
 * (or a DC-excited wound rotor) that is locked in step with the rotating
 * stator field — no slip. Adjust the load angle δ between the rotor and
 * the stator field; torque ∝ sin(δ) (the synchronous-machine torque
 * relation). If load demands more than τ_max, the machine slips a pole
 * and stalls — demonstrate by ramping δ past 90°.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';

interface Props {
  figure?: string;
}

const POLES = 2; // 2-pole (one pole-pair): 60 Hz → 3600 RPM

export function SynchronousMotorDemo({ figure }: Props) {
  const [f, setF] = useState(60);
  const [loadAngleDeg, setLoadAngleDeg] = useState(20); // δ in degrees

  const stateRef = useRef({ f, loadAngleDeg });
  useEffect(() => {
    stateRef.current = { f, loadAngleDeg };
  }, [f, loadAngleDeg]);

  const computed = useMemo(() => {
    const n = (120 * f) / POLES;
    const tau = Math.sin((loadAngleDeg * Math.PI) / 180); // normalised: τ/τ_max
    return { n, tau };
  }, [f, loadAngleDeg]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, colors } = info;
    let raf = 0;
    let lastT = performance.now();
    let statorAng = 0;

    function draw() {
      const now = performance.now();
      let dt = (now - lastT) / 1000;
      lastT = now;
      if (dt > 0.1) dt = 0.1;

      const { f, loadAngleDeg } = stateRef.current;
      // Mechanical sync speed (rad/s) = 2π f for a 2-pole machine
      const omega = (4 * Math.PI * f) / POLES;
      const visCap = 2.0;
      const scale = omega > visCap ? visCap / omega : 1;
      statorAng += omega * scale * dt;

      const delta = (loadAngleDeg * Math.PI) / 180;
      const rotorAng = statorAng - delta; // rotor lags by load angle δ

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const R = Math.min(w, h) * 0.36;

      // Stator ring
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(cx, cy, R + 18, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, R - 4, 0, Math.PI * 2);
      ctx.stroke();

      // Stator field vector (teal, dashed)
      const sFx = cx + Math.cos(statorAng) * R * 0.95;
      const sFy = cy - Math.sin(statorAng) * R * 0.95;
      const sSx = cx - Math.cos(statorAng) * R * 0.95;
      const sSy = cy + Math.sin(statorAng) * R * 0.95;
      ctx.strokeStyle = colors.teal;
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sSx, sSy);
      ctx.lineTo(sFx, sFy);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = colors.teal;
      ctx.beginPath();
      ctx.arc(sFx, sFy, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = colors.teal;
      ctx.beginPath();
      ctx.arc(sSx, sSy, 9, 0, Math.PI * 2);
      ctx.fill();

      // Rotor — PM bar magnet at rotorAng (no slip — locked to field)
      const rotR = R * 0.62;
      const rcos = Math.cos(rotorAng);
      const rsin = Math.sin(rotorAng);
      const nx = cx + rcos * rotR;
      const ny = cy - rsin * rotR;
      const sxx = cx - rcos * rotR;
      const syy = cy + rsin * rotR;
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(sxx, syy);
      ctx.lineTo(nx, ny);
      ctx.stroke();
      ctx.fillStyle = colors.pink;
      ctx.beginPath();
      ctx.arc(nx, ny, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = colors.blue;
      ctx.beginPath();
      ctx.arc(sxx, syy, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = colors.bg;
      ctx.font = 'bold 11px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('N', nx, ny);
      ctx.fillText('S', sxx, syy);
      ctx.lineCap = 'butt';

      // Load-angle arc — between stator field and rotor N pole
      ctx.strokeStyle = 'rgba(255,107,42,0.55)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, 30, -statorAng, -rotorAng, statorAng < rotorAng);
      ctx.stroke();
      ctx.fillStyle = colors.accent;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('δ', cx + 36, cy + 4);

      // Labels
      ctx.fillStyle = 'rgba(160,158,149,0.75)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('field (dashed) = rotor (locked)', 12, 12);
      ctx.textAlign = 'right';
      const stallWarn = Math.abs(loadAngleDeg) > 80 ? '  ← near pull-out!' : '';
      ctx.fillStyle = Math.abs(loadAngleDeg) > 80 ? '#ff6b2a' : 'rgba(160,158,149,0.75)';
      ctx.fillText(`δ = ${loadAngleDeg.toFixed(0)}°${stallWarn}`, w - 12, 12);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 16.4'}
      title="Synchronous motor — locked to the line"
      question="If the rotor doesn't slip, how does it produce torque?"
      caption={
        <>
          A wound-rotor or permanent-magnet rotor is dragged around at exactly synchronous speed,
          with the rotor's N pole trailing the stator's field vector by a small{' '}
          <em>load angle δ</em>. Torque is proportional to <em>sin δ</em> — increase the load, δ
          increases to match, but if δ exceeds 90° the rotor "slips a pole" and the machine stalls.
          Used wherever you need a precise, constant speed: clocks, turntables, large industrial
          drives.
        </>
      }
    >
      <AutoResizeCanvas height={320} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="f"
          value={f}
          min={20}
          max={100}
          step={1}
          format={(v) => v.toFixed(0) + ' Hz'}
          onChange={setF}
        />
        <MiniSlider
          label="load angle δ"
          value={loadAngleDeg}
          min={0}
          max={89}
          step={1}
          format={(v) => v.toFixed(0) + '°'}
          onChange={setLoadAngleDeg}
        />
        <MiniReadout label="speed" value={<Num value={computed.n} digits={0} />} unit="rpm" />
        <MiniReadout label="τ / τ_max = sin δ" value={computed.tau.toFixed(2)} />
      </DemoControls>
    </Demo>
  );
}
