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
import { withAlpha } from '@/lib/canvasTheme';
import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';


interface Props {
  figure?: string;
}

const POLES = 2; // 2-pole (one pole-pair): 60 Hz → 3600 RPM

export function SynchronousMotorDemo({ figure }: Props) {
  const [f, setF] = useState(60);
  const [loadAngleDeg, setLoadAngleDeg] = useState(20); // δ in degrees

  const stateRef = useSimState({ f, loadAngleDeg });
  const computed = useMemo(() => {
    const n = (120 * f) / POLES;
    const tau = Math.sin((loadAngleDeg * Math.PI) / 180); // normalised: τ/τ_max
    return { n, tau };
  }, [f, loadAngleDeg]);

  const setup = useSimLoop(
      stateRef,
      ({ ctx, w, h, colors }, _state, dt, _simTime, ctx0) => {
        let statorAng = ctx0.statorAng;
        const { f, loadAngleDeg } = stateRef.current;
        const omega = (4 * Math.PI * f) / POLES;
        const visCap = 2.0;
        const scale = omega > visCap ? visCap / omega : 1;
        statorAng += omega * scale * dt;
        const delta = (loadAngleDeg * Math.PI) / 180;
        const rotorAng = statorAng - delta;
        ctx.fillStyle = colors.bg;
        ctx.fillRect(0, 0, w, h);
        const cx = w / 2;
        const cy = h / 2;
        const R = Math.min(w, h) * 0.36;
        ctx.strokeStyle = colors.border;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(cx, cy, R + 18, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, cy, R - 4, 0, Math.PI * 2);
        ctx.stroke();
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
        ctx.strokeStyle = withAlpha(colors.accent, 0.55);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, 30, -statorAng, -rotorAng, statorAng < rotorAng);
        ctx.stroke();
        ctx.fillStyle = colors.accent;
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText('δ', cx + 36, cy + 4);
        ctx.fillStyle = withAlpha(colors.textDim, 0.75);
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText('field (dashed) = rotor (locked)', 12, 12);
        ctx.textAlign = 'right';
        const stallWarn = Math.abs(loadAngleDeg) > 80 ? '  ← near pull-out!' : '';
        ctx.fillStyle = Math.abs(loadAngleDeg) > 80 ? '#ff6b2a' : withAlpha(colors.textDim, 0.75);
        ctx.fillText(`δ = ${loadAngleDeg.toFixed(0)}°${stallWarn}`, w - 12, 12);
        ctx0.statorAng = statorAng;
      },
      [],
      () => ({ context: { statorAng: 0 } }),
    );

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
