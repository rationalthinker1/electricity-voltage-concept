/**
 * Demo 15.3 — Square wave through a first-order RC low-pass
 *
 * A unit-amplitude square wave at frequency f₀ feeds into a 1st-order RC
 * LPF with cut-off f_c. Each harmonic gets scaled by |H| = 1/√(1 + (f/f_c)²)
 * and shifted by −arctan(f/f_c). Reader drags f_c (relative to f₀); the
 * time-domain output rounds off as f_c drops, and the output spectrum loses
 * its high-frequency bars.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';

const N_HARMONICS = 25;
const f0 = 1; // fundamental (arbitrary units)

export function SquareThroughLPFDemo() {
  const [fcRatio, setFcRatio] = useState(3); // f_c in units of f0

  const stateRef = useRef({ fcRatio });
  useEffect(() => {
    stateRef.current = { fcRatio };
  }, [fcRatio]);

  // Harmonic table — odd n only, amp_n = 4/(π n)
  const harms: Array<{ n: number; amp: number }> = [];
  for (let n = 1; n <= N_HARMONICS; n += 2) harms.push({ n, amp: 4 / (Math.PI * n) });

  // Compute output amplitude attenuation at fundamental (for readout)
  const Hfund = 1 / Math.sqrt(1 + (1 / fcRatio) ** 2);

  const setup = useCallback(
    (info: CanvasInfo) => {
      const { ctx, w, h, colors } = info;
      let raf = 0;
      function draw() {
        const { fcRatio } = stateRef.current;

        ctx.fillStyle = colors.bg;
        ctx.fillRect(0, 0, w, h);

        const padX = 32;
        const padY = 16;
        // Three sub-panels stacked
        const panelH = (h - 2 * padY) / 3;
        const samples = 500;
        const cycles = 2;

        function panel(
          idx: number,
          plot: (mx: number, my: number, ph: number) => void,
          label: string,
        ) {
          const top = padY + idx * panelH;
          const mid = top + panelH / 2;
          ctx.strokeStyle = colors.border;
          ctx.beginPath();
          ctx.moveTo(padX, mid);
          ctx.lineTo(w - padX, mid);
          ctx.stroke();
          plot(padX, mid, panelH / 2);
          ctx.fillStyle = colors.textDim;
          ctx.font = '9px "JetBrains Mono", monospace';
          ctx.textAlign = 'left';
          ctx.fillText(label, padX, top + 10);
        }

        // Input: square wave (sum of odd harmonics)
        panel(
          0,
          (mx, my, half) => {
            ctx.strokeStyle = colors.blue;
            ctx.lineWidth = 2;
            ctx.beginPath();
            for (let i = 0; i <= samples; i++) {
              const x = mx + (i / samples) * (w - 2 * padX);
              const phase = (i / samples) * cycles * 2 * Math.PI;
              let s = 0;
              for (const h of harms) s += h.amp * Math.sin(h.n * phase);
              const y = my - s * half * 0.7;
              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.stroke();
          },
          'input — square wave',
        );

        // |H(f)| curve — log-x style mapped linearly to harmonic index
        panel(
          1,
          (mx, my, half) => {
            // Plot the gain curve from 0..N_HARMONICS f0
            ctx.strokeStyle = 'rgba(108,197,194,0.8)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            for (let i = 0; i <= samples; i++) {
              const f = (i / samples) * N_HARMONICS * f0;
              const Hm = 1 / Math.sqrt(1 + (f / fcRatio) ** 2);
              const x = mx + (i / samples) * (w - 2 * padX);
              const y = my + half - Hm * 2 * half * 0.85;
              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.stroke();
            // f_c marker
            const xc = mx + (fcRatio / N_HARMONICS) * (w - 2 * padX);
            ctx.setLineDash([3, 4]);
            ctx.strokeStyle = colors.accent;
            ctx.beginPath();
            ctx.moveTo(xc, my - half);
            ctx.lineTo(xc, my + half);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = colors.accent;
            ctx.font = '9px "JetBrains Mono", monospace';
            ctx.textAlign = 'left';
            ctx.fillText(`f_c = ${fcRatio.toFixed(1)}·f₀`, xc + 4, my - half + 12);
            ctx.fillStyle = colors.textDim;
            ctx.textAlign = 'right';
            ctx.fillText('|H(f)|', w - padX - 2, my + half - 4);
          },
          'filter |H(f)|',
        );

        // Output: filtered square wave
        panel(
          2,
          (mx, my, half) => {
            ctx.strokeStyle = '#ff6b2a';
            ctx.lineWidth = 2;
            ctx.beginPath();
            for (let i = 0; i <= samples; i++) {
              const x = mx + (i / samples) * (w - 2 * padX);
              const phase = (i / samples) * cycles * 2 * Math.PI;
              let s = 0;
              for (const h of harms) {
                const Hm = 1 / Math.sqrt(1 + (h.n / fcRatio) ** 2);
                const phi = -Math.atan2(h.n, fcRatio); // phase shift
                s += h.amp * Hm * Math.sin(h.n * phase + phi);
              }
              const y = my - s * half * 0.7;
              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.stroke();
          },
          'output — after LPF',
        );

        raf = requestAnimationFrame(draw);
      }
      raf = requestAnimationFrame(draw);
      return () => cancelAnimationFrame(raf);
    },
    [harms],
  );

  return (
    <Demo
      figure="Fig. 15.3"
      title="Square wave through a low-pass filter"
      question="What does the corner-frequency slider do to the output shape?"
      caption={
        <>
          Each harmonic is scaled by 1/√(1 + (f/f_c)²) and phase-shifted by −arctan(f/f_c). As f_c
          drops below f₀ the fundamental survives, but every odd harmonic above it is cut hard — the
          square turns into a softened, slewed waveform. Drag f_c past 10·f₀ and you recover the
          corners; drop below 1 and you see roughly a sine at the fundamental.
        </>
      }
    >
      <AutoResizeCanvas height={360} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="f_c / f₀"
          value={fcRatio}
          min={0.3}
          max={20}
          step={0.1}
          format={(v) => v.toFixed(1)}
          onChange={setFcRatio}
        />
        <MiniReadout label="|H| at fundamental" value={Hfund.toFixed(3)} />
        <MiniReadout
          label="20·log|H| at fund."
          value={(20 * Math.log10(Hfund)).toFixed(1)}
          unit="dB"
        />
      </DemoControls>
    </Demo>
  );
}
