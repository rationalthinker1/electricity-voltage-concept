/**
 * Demo D16.2 — Brushless DC: 6-step electronic commutation
 *
 * Three stator coils 120° apart around a permanent-magnet rotor. The
 * controller energizes two phases at a time (one source, one sink) in a
 * 6-step sequence, producing a stator field that rotates in discrete
 * 60° jumps. The PM rotor follows ~90° behind the stator's field vector
 * to give continuous torque.
 *
 * Controls: step rate (Hz). Readouts: current step index, electrical
 * frequency, RPM (for an example 4-pole rotor).
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';

interface Props { figure?: string }

// 6-step BLDC commutation table. Each entry: which of phases A/B/C is
// driven HIGH, LOW, or floating (z). Standard trapezoidal control.
type State = 1 | -1 | 0;
interface Step { a: State; b: State; c: State }
const STEPS: Step[] = [
  { a:  1, b: -1, c:  0 },  // step 0
  { a:  1, b:  0, c: -1 },  // step 1
  { a:  0, b:  1, c: -1 },  // step 2
  { a: -1, b:  1, c:  0 },  // step 3
  { a: -1, b:  0, c:  1 },  // step 4
  { a:  0, b: -1, c:  1 },  // step 5
];

export function BLDCCommutationDemo({ figure }: Props) {
  const [stepHz, setStepHz] = useState(6);   // steps per second
  const stateRef = useRef({ stepHz });
  useEffect(() => { stateRef.current.stepHz = stepHz; }, [stepHz]);

  // electrical frequency = stepHz / 6 (one full electrical cycle = 6 steps)
  const fElec = stepHz / 6;
  // mechanical RPM for a 4-pole (2 pole-pair) rotor: f_mech = f_elec / 2
  const rpm = (fElec / 2) * 60;

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h } = info;
    let raf = 0;
    let lastT = performance.now();
    let phase = 0;          // continuous step phase (0..6 then wrap)
    let rotorAng = -Math.PI / 2; // rotor visual angle, lags stator field

    function draw() {
      const now = performance.now();
      let dt = (now - lastT) / 1000;
      lastT = now;
      if (dt > 0.1) dt = 0.1;

      const { stepHz } = stateRef.current;
      phase += stepHz * dt;
      phase = ((phase % 6) + 6) % 6;
      const idx = Math.floor(phase) as 0 | 1 | 2 | 3 | 4 | 5;
      const step = STEPS[idx];

      // Stator field vector: sum of three coil-axis unit vectors, weighted by drive.
      // Coils at angles 90° (A on top), 90°-120° = -30° (B), 90°-240° = -150° (C).
      const axisA = Math.PI / 2;
      const axisB = axisA - (2 * Math.PI) / 3;
      const axisC = axisA - (4 * Math.PI) / 3;
      const fx =
        step.a * Math.cos(axisA) +
        step.b * Math.cos(axisB) +
        step.c * Math.cos(axisC);
      const fy =
        step.a * Math.sin(axisA) +
        step.b * Math.sin(axisB) +
        step.c * Math.sin(axisC);
      const statorAng = Math.atan2(fy, fx);

      // Rotor smoothly chases the stator field (its N pole leads ~ along statorAng)
      // by following statorAng with a low-pass:
      let diff = statorAng - rotorAng;
      while (diff > Math.PI) diff -= 2 * Math.PI;
      while (diff < -Math.PI) diff += 2 * Math.PI;
      rotorAng += diff * Math.min(1, dt * 12);

      ctx.fillStyle = '#0d0d10';
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const R = Math.min(w, h) * 0.38;

      // Stator ring
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(cx, cy, R + 16, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, R - 8, 0, Math.PI * 2); ctx.stroke();

      // Three stator coils — drawn as wedge-shaped pole pieces.
      const phases = [
        { ax: axisA, drive: step.a, label: 'A' },
        { ax: axisB, drive: step.b, label: 'B' },
        { ax: axisC, drive: step.c, label: 'C' },
      ];
      for (const p of phases) {
        const sx = cx + Math.cos(p.ax) * R;
        const sy = cy - Math.sin(p.ax) * R;
        let fill = 'rgba(255,255,255,0.12)';
        let stroke = 'rgba(255,255,255,0.25)';
        let glyph = '∅';
        if (p.drive === 1) {
          fill = 'rgba(255,107,42,0.45)';
          stroke = 'rgba(255,107,42,0.9)';
          glyph = '+';
        } else if (p.drive === -1) {
          fill = 'rgba(91,174,248,0.45)';
          stroke = 'rgba(91,174,248,0.9)';
          glyph = '−';
        }
        ctx.fillStyle = fill;
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(sx, sy, 22, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = 'rgba(236,235,229,0.95)';
        ctx.font = 'bold 13px JetBrains Mono';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(p.label, sx, sy - 4);
        ctx.font = 'bold 11px JetBrains Mono';
        ctx.fillText(glyph, sx, sy + 9);
      }

      // Stator field vector arrow (resultant)
      const fmag = Math.hypot(fx, fy);
      if (fmag > 0.01) {
        const ax = cx + Math.cos(statorAng) * R * 0.6;
        const ay = cy - Math.sin(statorAng) * R * 0.6;
        ctx.strokeStyle = 'rgba(255,255,255,0.35)';
        ctx.setLineDash([5, 4]);
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(cx, cy); ctx.lineTo(ax, ay); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(255,255,255,0.65)';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('B_stator', ax + 4, ay - 8);
      }

      // Rotor — a bar magnet, N (pink) / S (blue), at angle rotorAng
      const rotR = R * 0.5;
      const rcos = Math.cos(rotorAng);
      const rsin = Math.sin(rotorAng);
      const nx = cx + rcos * rotR;
      const ny = cy - rsin * rotR;
      const sxx = cx - rcos * rotR;
      const syy = cy + rsin * rotR;
      // bar
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 12;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(sxx, syy); ctx.lineTo(nx, ny); ctx.stroke();
      // N pole
      ctx.fillStyle = '#ff3b6e';
      ctx.beginPath(); ctx.arc(nx, ny, 11, 0, Math.PI * 2); ctx.fill();
      // S pole
      ctx.fillStyle = '#5baef8';
      ctx.beginPath(); ctx.arc(sxx, syy, 11, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#0a0a0b';
      ctx.font = 'bold 11px JetBrains Mono';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('N', nx, ny);
      ctx.fillText('S', sxx, syy);
      ctx.lineCap = 'butt';

      // Step indicator
      ctx.fillStyle = 'rgba(160,158,149,0.75)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText(`step ${idx + 1} / 6`, 12, 12);
      ctx.textAlign = 'right';
      ctx.fillText(`A=${step.a > 0 ? '+' : step.a < 0 ? '−' : '·'}  B=${step.b > 0 ? '+' : step.b < 0 ? '−' : '·'}  C=${step.c > 0 ? '+' : step.c < 0 ? '−' : '·'}`, w - 12, 12);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 16.2'}
      title="Brushless DC — electronic commutation"
      question="No brushes, no commutator. What replaces them?"
      caption={<>
        Three stator coils 120° apart. At each step the controller drives one phase HIGH and one
        LOW (third floats), creating a stator field vector that snaps 60° around the bore. The
        permanent-magnet rotor chases that field with a fixed lead angle — six steps per
        electrical revolution. A 4-pole rotor turns once every two electrical revolutions, so
        mechanical RPM = (electrical Hz / pole-pairs) × 60.
      </>}
    >
      <AutoResizeCanvas height={320} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="commutation rate"
          value={stepHz} min={0.5} max={60} step={0.5}
          format={v => v.toFixed(1) + ' steps/s'}
          onChange={setStepHz}
        />
        <MiniReadout label="electrical f" value={<Num value={fElec} digits={2} />} unit="Hz" />
        <MiniReadout label="RPM (4-pole rotor)" value={<Num value={rpm} digits={1} />} unit="rpm" />
      </DemoControls>
    </Demo>
  );
}
