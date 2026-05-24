import { useMemo, useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, EquationStrip, MiniReadout, MiniSlider } from '@/components/Demo';
import { M } from '@/components/Formula';
import { Num } from '@/components/Num';
import { drawLabel } from '@/lib/canvasLayout';
import { withAlpha } from '@/lib/canvasTheme';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

interface Props {
  figure: string;
}

export function DimmerWaveformDemo({ figure }: Props) {
  const [alpha, setAlpha] = useState(Math.PI / 2);
  const stateRef = useSimState({ alpha });

  const computed = useMemo(() => {
    const line = 120;
    const peak = line * Math.SQRT2;
    const rms = peak * Math.sqrt(alpha / (2 * Math.PI) - Math.sin(2 * alpha) / (4 * Math.PI));
    const rLamp = (line * line) / 1500;
    const power = (rms * rms) / rLamp;
    return { line, peak, rms, power, rLamp };
  }, [alpha]);

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, colors }) => {
      const { alpha } = stateRef.current;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      const left = 36;
      const right = w - 20;
      const mid = h * 0.5;
      const amp = h * 0.34;
      const cycles = 2;
      const fire = Math.PI - alpha;

      ctx.strokeStyle = withAlpha(colors.textDim, 0.45);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(left, mid);
      ctx.lineTo(right, mid);
      ctx.stroke();

      ctx.strokeStyle = withAlpha(colors.textDim, 0.32);
      ctx.setLineDash([4, 6]);
      for (let k = 0; k <= cycles * 2; k++) {
        const x = left + ((right - left) * k) / (cycles * 2);
        ctx.beginPath();
        ctx.moveTo(x, mid - amp - 8);
        ctx.lineTo(x, mid + amp + 8);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      ctx.strokeStyle = withAlpha(colors.textDim, 0.45);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let i = 0; i <= 320; i++) {
        const theta = (i / 320) * cycles * 2 * Math.PI;
        const x = left + ((right - left) * i) / 320;
        const y = mid - Math.sin(theta) * amp;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      let drawing = false;
      for (let i = 0; i <= 640; i++) {
        const theta = (i / 640) * cycles * 2 * Math.PI;
        const halfPhase = theta % Math.PI;
        const conducts = halfPhase >= fire;
        const x = left + ((right - left) * i) / 640;
        const y = mid - Math.sin(theta) * amp;
        if (conducts) {
          if (!drawing) {
            ctx.moveTo(x, y);
            drawing = true;
          } else {
            ctx.lineTo(x, y);
          }
        } else if (drawing) {
          ctx.stroke();
          ctx.beginPath();
          drawing = false;
        }
      }
      if (drawing) ctx.stroke();

      const fireX = left + ((right - left) * fire) / (cycles * 2 * Math.PI);
      ctx.strokeStyle = withAlpha(colors.pink, 0.8);
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.moveTo(fireX, mid - amp - 14);
      ctx.lineTo(fireX, mid + amp + 14);
      ctx.stroke();
      ctx.setLineDash([]);
      drawLabel(ctx, {
        text: `fires after ${(fire / Math.PI).toFixed(2)}π`,
        x: fireX + 6,
        y: mid - amp - 8,
        color: colors.pink,
        font: '10px "JetBrains Mono", monospace',
      });

      drawLabel(ctx, {
        text: 'grey = source sine · amber = delivered chunks',
        x: left,
        y: h - 12,
        color: withAlpha(colors.textDim, 0.85),
        font: '10px "JetBrains Mono", monospace',
      });
    },
    [],
  );

  return (
    <Demo
      figure={figure}
      title="The dimmer cuts away part of every half-cycle"
      question="Half conduction angle is not half RMS voltage."
      caption={
        <>
          A leading-edge dimmer waits after each zero crossing, then conducts for the final
          <strong> α </strong> radians of the half-cycle. The RMS voltage follows the energy under
          the squared waveform, so the power curve is nonlinear.
        </>
      }
      deeperLab={{ slug: 'ac-impedance', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={260} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="conduction angle α"
          value={alpha}
          min={0}
          max={Math.PI}
          step={Math.PI / 60}
          format={(v) => `${(v / Math.PI).toFixed(2)}π`}
          onChange={setAlpha}
        />
        <MiniReadout label="rms voltage" value={<Num value={computed.rms} />} unit="V" />
        <MiniReadout label="lamp power" value={<Num value={computed.power} />} unit="W" />
      </DemoControls>
      <EquationStrip
        leftLabel="Leading-edge RMS"
        left={
          <M tex="V_{\\text{rms}}=V_{\\text{peak}}\\sqrt{\\alpha/(2\\pi)-\\sin(2\\alpha)/(4\\pi)}" />
        }
        rightLabel="Current setting"
        right={
          <M
            tex={`V_{\\text{rms}} = ${computed.peak.toFixed(1)}\\sqrt{${(alpha / (2 * Math.PI)).toFixed(3)} - ${(Math.sin(2 * alpha) / (4 * Math.PI)).toFixed(3)}} = ${computed.rms.toFixed(1)}\\,\\text{V}`}
          />
        }
      />
    </Demo>
  );
}
