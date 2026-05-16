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
 *
 * Real values come from MATERIALS.copper.n (drift) and a fixed
 * c_signal ≈ 2×10⁸ m/s (≈ ⅔ c, the speed in a typical copper wire's
 * surrounding field; libretexts-conduction).
 */
import { useCallback, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout } from '@/components/Demo';
import { Num } from '@/components/Num';
import { MATERIALS, PHYS, formatTime } from '@/lib/physics';

interface Props {
  figure?: string;
}

export function TwoSpeedsDemo({ figure }: Props) {
  const startRef = useRef<number | null>(null);
  const [tick, setTick] = useState(0);
  const tickRef = useRef(0);

  // Pin scenario: 1 A through 2.5 mm² copper.
  const I = 1;
  const A_m2 = 2.5e-6;
  const n = MATERIALS.copper.n;
  const v_drift = I / (n * PHYS.e * A_m2); // ≈ 2.94×10⁻⁵ m/s
  const v_signal = 2.0e8; // ≈ ⅔ c, libretexts-conduction
  const trackLength_m = 0.2; // 20 cm physical length

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, colors } = info;
    let raf = 0;

    const padX = 60;
    const trackLeft = padX;
    const trackRight = w - padX;
    const trackPxLen = trackRight - trackLeft;

    // Drift dot starts at left
    let driftX = trackLeft;

    function draw(now: number) {
      if (startRef.current == null) startRef.current = now;
      const elapsedMs = now - startRef.current;
      tickRef.current = elapsedMs / 1000; // seconds (real wallclock)

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      const yTop = h * 0.32;
      const yBot = h * 0.74;

      // Track outlines
      function drawTrack(y: number, label: string, color: string) {
        ctx.strokeStyle = 'rgba(255,255,255,.10)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(trackLeft, y);
        ctx.lineTo(trackRight, y);
        ctx.stroke();
        // tick marks at 0 and 200 mm
        ctx.fillStyle = 'rgba(160,158,149,.8)';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText('0 mm', trackLeft, y + 18);
        ctx.textAlign = 'right';
        ctx.fillText('200 mm', trackRight, y + 18);
        ctx.fillStyle = color;
        ctx.textAlign = 'left';
        ctx.fillText(label, trackLeft, y - 10);
      }
      drawTrack(yTop, 'electron drift  (~0.03 mm/s)', '#5baef8');
      drawTrack(yBot, 'EM signal in wire  (~2×10⁸ m/s)', '#ff6b2a');

      // ── Drift dot — uses REAL v_drift, scaled by physical track length.
      // Wallclock seconds × v_drift / trackLength_m → fraction of track covered.
      const driftFrac = (tickRef.current * v_drift) / trackLength_m;
      driftX = trackLeft + Math.min(1, driftFrac) * trackPxLen;
      const dot1 = ctx.createRadialGradient(driftX, yTop, 0, driftX, yTop, 18);
      dot1.addColorStop(0, '#5baef8');
      dot1.addColorStop(1, '#5baef800');
      ctx.fillStyle = dot1;
      ctx.beginPath();
      ctx.arc(driftX, yTop, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = colors.blue;
      ctx.beginPath();
      ctx.arc(driftX, yTop, 5, 0, Math.PI * 2);
      ctx.fill();

      // ── Signal pulse — would cross 200 mm in trackLength_m / v_signal = 1 ns.
      // We can't show 1 ns visually; instead, loop the pulse once per second of
      // wallclock and label "in this same second, the signal made the trip
      // 10⁹ × (1 ns)⁻¹ × 1 s = 10⁹ times" (we round to a clean 10⁹).
      const loopT = (tickRef.current % 1) / 1; // 0 → 1 over 1 second
      const sigX = trackLeft + loopT * trackPxLen;
      // tail
      ctx.strokeStyle = 'rgba(255,107,42,.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(Math.max(trackLeft, sigX - 80), yBot);
      ctx.lineTo(sigX, yBot);
      ctx.stroke();
      // pulse
      const sigGrd = ctx.createRadialGradient(sigX, yBot, 0, sigX, yBot, 22);
      sigGrd.addColorStop(0, '#ff6b2a');
      sigGrd.addColorStop(1, '#ff6b2a00');
      ctx.fillStyle = sigGrd;
      ctx.beginPath();
      ctx.arc(sigX, yBot, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = colors.accent;
      ctx.beginPath();
      ctx.arc(sigX, yBot, 6, 0, Math.PI * 2);
      ctx.fill();

      // Re-render React-side readouts ~5×/s
      if (Math.floor(tickRef.current * 5) !== Math.floor((tickRef.current - 0.05) * 5)) {
        setTick((t) => t + 1);
      }

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Readouts. tick keeps them updating.
  void tick;
  const elapsed_s = tickRef.current;
  const driftDist_mm = elapsed_s * v_drift * 1000;
  // signal makes the trip every (trackLength_m / v_signal) seconds = 1 ns
  const signalTrips = Math.floor(elapsed_s / (trackLength_m / v_signal));

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
        <MiniReadout label="signal / drift" value="~10¹³" unit="×" />
      </DemoControls>
    </Demo>
  );
}
