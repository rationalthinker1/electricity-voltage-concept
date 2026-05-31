/**
 * Demo D16.5 — Stepper motor
 *
 * A 200-step (1.8°/step) hybrid stepper. Each pulse advances the rotor by
 * exactly one step. Reader presses "Step" to advance once, or enables
 * "auto" to step continuously at the slider rate. Readouts: total angle,
 * step count, steps per revolution.
 */
import { useEffect, useState } from 'react';
import { drawLabel } from '@/lib/canvasLayout';
import { withAlpha } from '@/lib/canvasTheme';
import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import {
  Demo,
  DemoControls,
  EquationStrip,
  MiniReadout,
  MiniSlider,
  MiniToggle,
} from '@/components/Demo';
import { M } from '@/components/Formula';
import { Num } from '@/components/Num';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

interface Props {
  figure: string;
}

const STEPS_PER_REV = 200;
const STEP_DEG = 360 / STEPS_PER_REV; // 1.8°

export function StepperMotorDemo({ figure }: Props) {
  const [steps, setSteps] = useState(0);
  const [auto, setAuto] = useState(false);
  const [rateHz, setRateHz] = useState(8);

  const stateRef = useSimState({ steps, auto, rateHz });
  // Auto-stepping loop
  useEffect(() => {
    if (!auto) return;
    const id = window.setInterval(() => {
      setSteps((s) => s + 1);
    }, 1000 / rateHz);
    return () => window.clearInterval(id);
  }, [auto, rateHz]);

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, colors }, _state, _dt, _simTime, ctx0) => {
      let curAng = ctx0.curAng;
      const { steps } = stateRef.current;
      const target = (steps * STEP_DEG * Math.PI) / 180;
      const diff = target - curAng;
      curAng += diff * 0.4;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;
      const R = Math.min(w, h) * 0.36;
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(cx, cy, R + 14, 0, Math.PI * 2);
      ctx.stroke();
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const px = cx + Math.cos(a) * R;
        const py = cy + Math.sin(a) * R;
        // Which pair is energized depends on phase = steps mod 4
        const phase = ((stateRef.current.steps % 4) + 4) % 4;
        const energized = i % 4 === phase;
        ctx.fillStyle = energized ? withAlpha(colors.accent, 0.5) : withAlpha(colors.text, 0.1);
        ctx.strokeStyle = energized ? withAlpha(colors.accent, 0.9) : withAlpha(colors.text, 0.3);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(px, py, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      ctx.strokeStyle = colors.borderStrong;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 0.6, 0, Math.PI * 2);
      ctx.stroke();
      const teeth = 50;
      for (let i = 0; i < teeth; i++) {
        const a = curAng + (i / teeth) * Math.PI * 2;
        const x1 = cx + Math.cos(a) * R * 0.6;
        const y1 = cy + Math.sin(a) * R * 0.6;
        const x2 = cx + Math.cos(a) * R * 0.66;
        const y2 = cy + Math.sin(a) * R * 0.66;
        ctx.strokeStyle = withAlpha(colors.text, 0.4);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      const mkA = curAng;
      const mkX = cx + Math.cos(mkA) * R * 0.66;
      const mkY = cy + Math.sin(mkA) * R * 0.66;
      ctx.fillStyle = colors.pink;
      ctx.beginPath();
      ctx.arc(mkX, mkY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = withAlpha(colors.text, 0.1);
      ctx.beginPath();
      ctx.arc(cx, cy, 8, 0, Math.PI * 2);
      ctx.fill();
      drawLabel(ctx, {
        x: 12,
        y: 12,
        text: 'hybrid stepper · 200 steps/rev (1.8°/step)',
        color: withAlpha(colors.textDim, 0.75),
        baseline: 'top',
      });
      ctx0.curAng = curAng;
    },
    [],
    () => ({ context: { curAng: 0 } }),
  );

  const totalDeg = steps * STEP_DEG;
  const revs = steps / STEPS_PER_REV;

  return (
    <Demo
      figure={figure}
      title="Stepper motor — one pulse, one step"
      question="What if you just want to command position, not torque?"
      caption={
        <>
          Each input pulse advances the rotor by exactly one step — typically 1.8° on a NEMA-17. No
          feedback needed: position is the integral of the pulse count. The trade-off is torque
          ripple and a hard limit on top speed. Used everywhere you need open-loop positioning: 3D
          printers, CNC tables, optical-rig stages, dome telescopes.
        </>
      }
      deeperLab={{ slug: 'motor-torque-speed', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={320} setup={setup} />
      <DemoControls>
        <MiniToggle label="step + 1" checked={false} onChange={() => setSteps((s) => s + 1)} />
        <MiniToggle label="reset" checked={false} onChange={() => setSteps(0)} />
        <MiniToggle label={auto ? 'auto on' : 'auto off'} checked={auto} onChange={setAuto} />
        <MiniSlider
          label="auto rate"
          value={rateHz}
          min={1}
          max={50}
          step={1}
          format={(v) => v.toFixed(0) + ' steps/s'}
          onChange={setRateHz}
        />
        <MiniReadout label="step count" value={<Num value={steps} digits={0} />} />
        <MiniReadout label="angle" value={totalDeg.toFixed(1)} unit="°" />
        <MiniReadout label="revolutions" value={revs.toFixed(2)} />
      </DemoControls>
      <EquationStrip
        leftLabel="angle"
        left={
          <M tex={`\\theta = N_{\\text{steps}}\\,360^\\circ/200 = ${totalDeg.toFixed(1)}^\\circ`} />
        }
        rightLabel="turns"
        right={<M tex={`\\text{rev} = N_{\\text{steps}}/200 = ${revs.toFixed(2)}`} />}
      />
    </Demo>
  );
}
