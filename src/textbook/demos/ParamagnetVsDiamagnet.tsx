/**
 * Demo D11.3 — Paramagnet vs diamagnet
 *
 * Two side-by-side boxes of "molecules". Each is drawn as a small arrow
 * (magnetic moment). Slider sets the external B (rightward).
 *   Left box (paramagnet):  moments are permanent. They weakly align with B,
 *     but thermal noise keeps them mostly disordered. M parallel to B.
 *   Right box (diamagnet):  moments are induced by changing flux through each
 *     molecule's electron orbit; by Lenz's law they oppose B. M antiparallel.
 *
 * Live readouts: net magnetization (in arbitrary units) for each box.
 */
import { useState } from 'react';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';
import { drawLabel } from '@/lib/canvasLayout';
import { withAlpha } from '@/lib/canvasTheme';
import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, EquationStrip, MiniReadout, MiniSlider } from '@/components/Demo';
import { M } from '@/components/Formula';

interface Props {
  figure: string;
}

interface Moment {
  x: number;
  y: number;
  theta: number;
  omega: number;
}

interface SimCtx {
  para: Moment[];
  dia: Moment[];
  lastSet: number;
}

export function ParamagnetVsDiamagnetDemo({ figure }: Props) {
  const [B, setB] = useState(2); // 0..10 in arbitrary units
  const stateRef = useSimState({ B });
  const [Mpara, setMpara] = useState(0);
  const [Mdia, setMdia] = useState(0);

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, colors }, state, _dt, _simTime, ctx0: SimCtx) => {
      const { B } = state;

      const pad = 30;
      const boxW = (w - 3 * pad) / 2;
      const boxH = h - 60;
      const boxes = [
        { x0: pad, y0: 40, w: boxW, h: boxH, kind: 'para' as const },
        { x0: pad * 2 + boxW, y0: 40, w: boxW, h: boxH, kind: 'dia' as const },
      ];

      function update(
        moments: Moment[],
        targetAngle: number,
        B: number,
        noise: number,
        strength: number,
      ) {
        let cos_sum = 0;
        for (const m of moments) {
          const deviation = m.theta - targetAngle;
          const torque = -B * Math.sin(deviation) * strength + (Math.random() - 0.5) * noise;
          m.omega = (m.omega + torque) * 0.85;
          m.theta += m.omega;
          cos_sum += Math.cos(m.theta);
        }
        return cos_sum / moments.length;
      }

      function arrow(cx: number, cy: number, theta: number, len: number, color: string) {
        const tx = Math.cos(theta) * len;
        const ty = Math.sin(theta) * len;
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(cx - tx / 2, cy - ty / 2);
        ctx.lineTo(cx + tx / 2, cy + ty / 2);
        ctx.stroke();
        const headX = cx + tx / 2;
        const headY = cy + ty / 2;
        const ux = Math.cos(theta),
          uy = Math.sin(theta);
        ctx.beginPath();
        ctx.moveTo(headX, headY);
        ctx.lineTo(headX - ux * 5 - uy * 3, headY - uy * 5 + ux * 3);
        ctx.lineTo(headX - ux * 5 + uy * 3, headY - uy * 5 - ux * 3);
        ctx.closePath();
        ctx.fill();
      }

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      // Update — paramagnet aligns to angle 0 (with B); diamagnet to π (against B)
      const mPara = update(ctx0.para, 0, B, 0.32, 0.025);
      const mDia = update(ctx0.dia, Math.PI, B, 0.04, 0.06);

      // Draw boxes
      for (const box of boxes) {
        ctx.strokeStyle = colors.borderStrong;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.strokeRect(box.x0, box.y0, box.w, box.h);
        ctx.setLineDash([]);
        drawLabel(ctx, {
          x: box.x0 + 8,
          y: box.y0 - 8,
          text:
            box.kind === 'para' ? 'PARAMAGNET (permanent moments)' : 'DIAMAGNET (induced moments)',
          color:
            box.kind === 'para' ? withAlpha(colors.accent, 0.85) : withAlpha(colors.teal, 0.85),
          size: 11,
        });
      }

      // Draw moments
      for (const m of ctx0.para) {
        arrow(m.x, m.y, m.theta, 16, withAlpha(colors.accent, 0.85));
      }
      for (const m of ctx0.dia) {
        arrow(m.x, m.y, m.theta, 11, withAlpha(colors.teal, 0.85));
      }

      // Big external-B arrow at top
      ctx.save();
      ctx.globalAlpha = 0.65;
      drawLabel(ctx, {
        text: `B (external) →`,
        x: 16,
        y: 22,
        color: colors.text,
        font: '10px "JetBrains Mono", monospace',
      });
      const Bw = Math.min(140, 30 + B * 11);
      ctx.restore();
      ctx.strokeStyle = colors.textDim;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(110, 18);
      ctx.lineTo(110 + Bw, 18);
      ctx.stroke();
      ctx.save();
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = colors.text;
      ctx.beginPath();
      ctx.moveTo(110 + Bw, 18);
      ctx.lineTo(110 + Bw - 7, 13);
      ctx.lineTo(110 + Bw - 7, 23);
      ctx.closePath();
      ctx.fill();

      // Labels showing net M magnitude on each box
      ctx.restore();
      drawLabel(ctx, {
        text: `M = ${mPara.toFixed(2)}`,
        x: boxes[0].x0 + boxes[0].w - 8,
        y: h - 12,
        color: colors.accent,
        align: 'right',
      });
      drawLabel(ctx, {
        text: `M = ${mDia.toFixed(2)}`,
        x: boxes[1].x0 + boxes[1].w - 8,
        y: h - 12,
        color: colors.teal,
        align: 'right',
      });

      // Throttle React state updates
      const now = performance.now();
      if (now - ctx0.lastSet > 250) {
        ctx0.lastSet = now;
        setMpara(mPara);
        setMdia(mDia);
      }
    },
    [],
    (info) => {
      const { w, h } = info;
      const pad = 30;
      const boxW = (w - 3 * pad) / 2;
      const boxH = h - 60;
      const boxes = [
        { x0: pad, y0: 40, w: boxW, h: boxH, kind: 'para' as const },
        { x0: pad * 2 + boxW, y0: 40, w: boxW, h: boxH, kind: 'dia' as const },
      ];

      const cols = 6,
        rows = 5;
      function build(box: (typeof boxes)[number], kind: 'para' | 'dia'): Moment[] {
        const arr: Moment[] = [];
        const dx = box.w / (cols + 1);
        const dy = box.h / (rows + 1);
        for (let i = 0; i < cols; i++) {
          for (let j = 0; j < rows; j++) {
            arr.push({
              x: box.x0 + dx * (i + 1),
              y: box.y0 + dy * (j + 1),
              theta: kind === 'para' ? Math.random() * Math.PI * 2 : Math.PI,
              omega: 0,
            });
          }
        }
        return arr;
      }
      return {
        context: {
          para: build(boxes[0], 'para'),
          dia: build(boxes[1], 'dia'),
          lastSet: 0,
        },
      };
    },
  );

  return (
    <Demo
      figure={figure}
      title="Paramagnet vs diamagnet"
      question="Two boxes, same external field — why do they magnetize in opposite directions?"
      caption={
        <>
          On the left, each molecule has a permanent magnetic moment (one unpaired electron, say).
          The external <strong>B</strong> torques each one toward alignment; thermal noise scrambles
          them right back. The net <strong>M</strong> aligns weakly with <strong>B</strong> —
          paramagnetism. On the right, no permanent moment exists; what little moment appears is the
          orbital current induced by the applied field, and Lenz's law forces it to oppose{' '}
          <strong>B</strong>. Hence the antiparallel arrows. Every material has some diamagnetic
          response; paramagnetic response only appears in atoms or molecules with unpaired
          electrons.
        </>
      }
      deeperLab={{ slug: 'polarization-susceptibility', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="B"
          value={B}
          min={0}
          max={10}
          step={0.1}
          format={(v) => v.toFixed(1)}
          onChange={setB}
        />
        <MiniReadout label="M (para)" value={Mpara.toFixed(2)} />
        <MiniReadout label="M (dia)" value={Mdia.toFixed(2)} />
      </DemoControls>
      <EquationStrip
        leftLabel="Magnetic susceptibility"
        left={
          <M
            tex={`M = \\chi_m H;\\quad \\chi_m > 0\\text{ (para)},\\quad \\chi_m < 0\\text{ (dia)}`}
          />
        }
        rightLabel={`B = ${B.toFixed(1)}`}
        right={
          <M
            tex={`M_{\\text{para}} = +${Mpara.toFixed(2)},\\quad M_{\\text{dia}} = ${Mdia.toFixed(2)}`}
          />
        }
      />
    </Demo>
  );
}
