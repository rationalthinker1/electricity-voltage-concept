/**
 * Demo D2.3 — Two speeds in one wire
 *
 * Side-by-side comparison of (a) electron drift at ~0.03 mm/s and
 * (b) signal propagation in copper at ~2×10⁸ m/s. Both as horizontal
 * tracks of the same physical length (200 mm = 20 cm equivalent).
 *
 * The drift dot creeps so slowly that in any reasonable session it
 * barely moves. The signal pulse traverses the same length in 1 ns
 * of physical time and visually loops several times per second.
 */
import { useRef, useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, EquationStrip, MiniReadout } from '@/components/Demo';
import { InlineMath } from '@/components/Formula';
import { Num } from '@/components/Num';
import { withAlpha } from '@/lib/canvasTheme';
import { MATERIALS, PHYS, formatTime } from '@/lib/physics';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

interface Props {
  figure?: string;
}

export function TwoSpeedsDemo({ figure }: Props) {
  const [tick, setTick] = useState(0);
  const tickRef = useRef(0);

  // Pin scenario: 1 A through 2.5 mm² copper.
  const I = 1;
  const A_m2 = 2.5e-6;
  const n = MATERIALS.copper.n;
  const v_drift = I / (n * PHYS.e * A_m2);
  const v_signal = 2.0e8;
  const trackLength_m = 0.2;

  const stateRef = useSimState({});

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, colors }, _state, _dt, simTime) => {
      const padX = 60;
      const trackLeft = padX;
      const trackRight = w - padX;
      const trackPxLen = trackRight - trackLeft;

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      const yTop = h * 0.32;
      const yBot = h * 0.74;

      // Track outlines
      function drawTrack(y: number, label: string, color: string) {
        ctx.strokeStyle = withAlpha(colors.text, 0.1);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(trackLeft, y);
        ctx.lineTo(trackRight, y);
        ctx.stroke();
        ctx.fillStyle = withAlpha(colors.textDim, 0.8);
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText('0 mm', trackLeft, y + 18);
        ctx.textAlign = 'right';
        ctx.fillText('200 mm', trackRight, y + 18);
        ctx.fillStyle = color;
        ctx.textAlign = 'left';
        ctx.fillText(label, trackLeft, y - 10);
      }
      drawTrack(yTop, 'electron drift  (~0.03 mm/s)', colors.blue);
      drawTrack(yBot, 'EM signal in wire  (~2×10⁸ m/s)', colors.accent);

      // Drift dot — uses REAL v_drift, scaled by physical track length
      const driftFrac = (simTime * v_drift) / trackLength_m;
      const driftX = trackLeft + Math.min(1, driftFrac) * trackPxLen;
      const dot1 = ctx.createRadialGradient(driftX, yTop, 0, driftX, yTop, 18);
      dot1.addColorStop(0, colors.blue);
      dot1.addColorStop(1, withAlpha(colors.blue, 0));
      ctx.fillStyle = dot1;
      ctx.beginPath();
      ctx.arc(driftX, yTop, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = colors.blue;
      ctx.beginPath();
      ctx.arc(driftX, yTop, 5, 0, Math.PI * 2);
      ctx.fill();

      // Signal pulse — loops once per second of wallclock
      const loopT = simTime % 1;
      const sigX = trackLeft + loopT * trackPxLen;
      ctx.strokeStyle = withAlpha(colors.accent, 0.4);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(Math.max(trackLeft, sigX - 80), yBot);
      ctx.lineTo(sigX, yBot);
      ctx.stroke();
      const sigGrd = ctx.createRadialGradient(sigX, yBot, 0, sigX, yBot, 22);
      sigGrd.addColorStop(0, colors.accent);
      sigGrd.addColorStop(1, withAlpha(colors.accent, 0));
      ctx.fillStyle = sigGrd;
      ctx.beginPath();
      ctx.arc(sigX, yBot, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = colors.accent;
      ctx.beginPath();
      ctx.arc(sigX, yBot, 6, 0, Math.PI * 2);
      ctx.fill();

      // Re-render React-side readouts ~5×/s
      tickRef.current = simTime;
      if (Math.floor(simTime * 5) !== Math.floor((simTime - 0.05) * 5)) {
        setTick((t) => t + 1);
      }
    },
    [],
  );

  // Readouts. tick keeps them updating.
  void tick;
  const elapsed_s = tickRef.current;
  const driftDist_mm = elapsed_s * v_drift * 1000;
  const signalTrips = Math.floor(elapsed_s / (trackLength_m / v_signal));
  const speedRatio = v_signal / v_drift;
  const ratioExp = Math.floor(Math.log10(speedRatio));
  const ratioMantissa = speedRatio / 10 ** ratioExp;

  return (
    <Demo
      figure={figure ?? 'Fig. 2.3'}
      title="Two speeds, one wire"
      question="The signal arrives at light-speed. The electrons crawl. How can both be true?"
      caption={
        <>
          Two tracks the same physical length (20 cm). The blue dot is one electron drifting at the
          actual <em>v_d</em> for 1 A through 2.5 mm² of copper. The amber pulse is the
          electromagnetic signal in the wire, looping once per second on screen because in real time
          it makes that trip in about one nanosecond. The ratio of speeds is roughly{' '}
          <strong>10¹³</strong>.
        </>
      }
      deeperLab={{ slug: 'drift', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={240} setup={setup} />
      <DemoControls>
        <MiniReadout label="elapsed" value={formatTime(elapsed_s)} />
        <MiniReadout
          label="drift moved"
          value={driftDist_mm < 0.001 ? '<0.001' : driftDist_mm.toFixed(3)}
          unit="mm"
        />
        <MiniReadout label="signal trips" value={<Num value={signalTrips} />} unit="× 20 cm" />
        <MiniReadout
          label="signal / drift"
          value={<Num value={speedRatio} />}
          unit="×"
        />
      </DemoControls>
      <EquationStrip
        leftLabel="The two speeds"
        left={
          <InlineMath
            tex={
              `v_{\\text{signal}} \\approx 2\\times 10^{8}\\ \\text{m/s}` +
              `\\quad\\;\\; v_{\\text{drift}} = \\tfrac{I}{nqA} \\approx ` +
              `${v_drift.toExponential(1)}\\ \\text{m/s}`
            }
          />
        }
        rightLabel="Ratio (1 A / 2.5 mm² Cu)"
        right={
          <InlineMath
            tex={
              `\\dfrac{v_{\\text{signal}}}{v_{\\text{drift}}} = ` +
              `\\dfrac{2\\times 10^{8}}{${v_drift.toExponential(1)}} \\approx ` +
              `${ratioMantissa.toFixed(1)}\\times 10^{${ratioExp}}`
            }
          />
        }
      />
    </Demo>
  );
}
