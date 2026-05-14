/**
 * Demo D16.5 — Stepper motor
 *
 * A 200-step (1.8°/step) hybrid stepper. Each pulse advances the rotor by
 * exactly one step. Reader presses "Step" to advance once, or enables
 * "auto" to step continuously at the slider rate. Readouts: total angle,
 * step count, steps per revolution.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider, MiniToggle } from '@/components/Demo';
import { Num } from '@/components/Num';

interface Props { figure?: string }

const STEPS_PER_REV = 200;
const STEP_DEG = 360 / STEPS_PER_REV;   // 1.8°

export function StepperMotorDemo({ figure }: Props) {
  const [steps, setSteps] = useState(0);
  const [auto, setAuto] = useState(false);
  const [rateHz, setRateHz] = useState(8);

  const stateRef = useRef({ steps, auto, rateHz });
  useEffect(() => { stateRef.current = { steps, auto, rateHz }; }, [steps, auto, rateHz]);

  // Auto-stepping loop
  useEffect(() => {
    if (!auto) return;
    const id = window.setInterval(() => {
      setSteps(s => s + 1);
    }, 1000 / rateHz);
    return () => window.clearInterval(id);
  }, [auto, rateHz]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h } = info;
    let raf = 0;
    // Smoothed rotor angle (so step transitions look like a quick jump)
    let curAng = 0;

    function draw() {
      const { steps } = stateRef.current;
      const target = steps * STEP_DEG * Math.PI / 180;
      // Snap toward target quickly — discrete look
      const diff = target - curAng;
      curAng += diff * 0.4;

      ctx.fillStyle = '#0d0d10';
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const R = Math.min(w, h) * 0.36;

      // Stator: 8 evenly-spaced poles (typical hybrid stepper)
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(cx, cy, R + 14, 0, Math.PI * 2); ctx.stroke();

      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const px = cx + Math.cos(a) * R;
        const py = cy + Math.sin(a) * R;
        // Which pair is energized depends on phase = steps mod 4
        const phase = ((stateRef.current.steps % 4) + 4) % 4;
        const energized = (i % 4) === phase;
        ctx.fillStyle = energized ? 'rgba(255,107,42,0.5)' : 'rgba(255,255,255,0.10)';
        ctx.strokeStyle = energized ? 'rgba(255,107,42,0.9)' : 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(px, py, 14, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
      }

      // Rotor — toothed disc with a marker tooth
      ctx.strokeStyle = 'rgba(255,255,255,0.20)';
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(cx, cy, R * 0.6, 0, Math.PI * 2); ctx.stroke();
      // Teeth — 50 small teeth (gives 200 fine positions with 4-phase commutation)
      const teeth = 50;
      for (let i = 0; i < teeth; i++) {
        const a = curAng + (i / teeth) * Math.PI * 2;
        const x1 = cx + Math.cos(a) * R * 0.6;
        const y1 = cy + Math.sin(a) * R * 0.6;
        const x2 = cx + Math.cos(a) * R * 0.66;
        const y2 = cy + Math.sin(a) * R * 0.66;
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      }
      // Marker tooth (pink) so the reader sees rotation
      const mkA = curAng;
      const mkX = cx + Math.cos(mkA) * R * 0.66;
      const mkY = cy + Math.sin(mkA) * R * 0.66;
      ctx.fillStyle = '#ff3b6e';
      ctx.beginPath(); ctx.arc(mkX, mkY, 6, 0, Math.PI * 2); ctx.fill();

      // Center hub
      ctx.fillStyle = 'rgba(255,255,255,0.10)';
      ctx.beginPath(); ctx.arc(cx, cy, 8, 0, Math.PI * 2); ctx.fill();

      // Labels
      ctx.fillStyle = 'rgba(160,158,149,0.75)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText('hybrid stepper · 200 steps/rev (1.8°/step)', 12, 12);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  const totalDeg = steps * STEP_DEG;
  const revs = steps / STEPS_PER_REV;

  return (
    <Demo
      figure={figure ?? 'Fig. 16.5'}
      title="Stepper motor — one pulse, one step"
      question="What if you just want to command position, not torque?"
      caption={<>
        Each input pulse advances the rotor by exactly one step — typically 1.8° on a NEMA-17.
        No feedback needed: position is the integral of the pulse count. The trade-off is
        torque ripple and a hard limit on top speed. Used everywhere you need open-loop
        positioning: 3D printers, CNC tables, optical-rig stages, dome telescopes.
      </>}
    >
      <AutoResizeCanvas height={320} setup={setup} />
      <DemoControls>
        <button
          type="button"
          className="mini-toggle"
          onClick={() => setSteps(s => s + 1)}
        >
          step + 1
        </button>
        <button
          type="button"
          className="mini-toggle"
          onClick={() => setSteps(0)}
        >
          reset
        </button>
        <MiniToggle label={auto ? 'auto on' : 'auto off'} checked={auto} onChange={setAuto} />
        <MiniSlider
          label="auto rate"
          value={rateHz} min={1} max={50} step={1}
          format={v => v.toFixed(0) + ' steps/s'}
          onChange={setRateHz}
        />
        <MiniReadout label="step count" value={<Num value={steps} digits={0} />} />
        <MiniReadout label="angle" value={totalDeg.toFixed(1)} unit="°" />
        <MiniReadout label="revolutions" value={revs.toFixed(2)} />
      </DemoControls>
    </Demo>
  );
}
