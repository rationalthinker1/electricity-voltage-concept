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
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';

interface Props { figure?: string }

interface Moment {
  x: number;
  y: number;
  theta: number;
  omega: number;
}

export function ParamagnetVsDiamagnetDemo({ figure }: Props) {
  const [B, setB] = useState(2);     // 0..10 in arbitrary units
  const stateRef = useRef({ B });
  useEffect(() => { stateRef.current = { B }; }, [B]);
  const [Mpara, setMpara] = useState(0);
  const [Mdia, setMdia] = useState(0);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, colors } = info;
    let raf = 0;

    // Two boxes side by side
    const pad = 30;
    const boxW = (w - 3 * pad) / 2;
    const boxH = h - 60;
    const boxes = [
      { x0: pad,                 y0: 40, w: boxW, h: boxH, kind: 'para' as const },
      { x0: pad * 2 + boxW,      y0: 40, w: boxW, h: boxH, kind: 'dia'  as const },
    ];

    // Populate each box with a grid of moments
    const cols = 6, rows = 5;
    function build(box: typeof boxes[number], kind: 'para' | 'dia'): Moment[] {
      const arr: Moment[] = [];
      const dx = box.w / (cols + 1);
      const dy = box.h / (rows + 1);
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          arr.push({
            x: box.x0 + dx * (i + 1),
            y: box.y0 + dy * (j + 1),
            theta: kind === 'para' ? Math.random() * Math.PI * 2 : Math.PI, // dia starts opposite
            omega: 0,
          });
        }
      }
      return arr;
    }
    const para = build(boxes[0], 'para');
    const dia = build(boxes[1], 'dia');

    function update(moments: Moment[], targetAngle: number, B: number, noise: number, strength: number) {
      let cos_sum = 0;
      for (const m of moments) {
        // torque toward targetAngle scales with sin of the deviation
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
      // head
      const headX = cx + tx / 2;
      const headY = cy + ty / 2;
      const ux = Math.cos(theta), uy = Math.sin(theta);
      ctx.beginPath();
      ctx.moveTo(headX, headY);
      ctx.lineTo(headX - ux * 5 - uy * 3, headY - uy * 5 + ux * 3);
      ctx.lineTo(headX - ux * 5 + uy * 3, headY - uy * 5 - ux * 3);
      ctx.closePath();
      ctx.fill();
    }

    let lastSet = 0;

    function draw() {
      const { B } = stateRef.current;

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      // Update — paramagnet aligns to angle 0 (with B); diamagnet to π (against B)
      // Paramagnet: weaker coupling, strong thermal noise
      const mPara = update(para, 0, B, 0.32, 0.025);
      // Diamagnet: induced — coupling proportional to B but small; very low noise (induced moments don't fluctuate thermally the same way)
      const mDia = update(dia, Math.PI, B, 0.04, 0.06);

      // Draw boxes
      for (const box of boxes) {
        ctx.strokeStyle = colors.borderStrong;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.strokeRect(box.x0, box.y0, box.w, box.h);
        ctx.setLineDash([]);
        ctx.fillStyle = box.kind === 'para' ? 'rgba(255,107,42,0.85)' : 'rgba(108,197,194,0.85)';
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(
          box.kind === 'para' ? 'PARAMAGNET (permanent moments)' : 'DIAMAGNET (induced moments)',
          box.x0 + 8, box.y0 - 8,
        );
      }

      // Draw moments
      for (const m of para) {
        arrow(m.x, m.y, m.theta, 16, 'rgba(255,107,42,0.85)');
      }
      for (const m of dia) {
        arrow(m.x, m.y, m.theta, 11, 'rgba(108,197,194,0.85)');
      }

      // Big external-B arrow at top
      ctx.fillStyle = 'rgba(255,255,255,0.65)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`B (external) →`, 16, 22);
      const Bw = Math.min(140, 30 + B * 11);
      ctx.strokeStyle = colors.textDim;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(110, 18);
      ctx.lineTo(110 + Bw, 18);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.beginPath();
      ctx.moveTo(110 + Bw, 18);
      ctx.lineTo(110 + Bw - 7, 13);
      ctx.lineTo(110 + Bw - 7, 23);
      ctx.closePath();
      ctx.fill();

      // Labels showing net M magnitude on each box
      ctx.fillStyle = colors.accent;
      ctx.textAlign = 'right';
      ctx.fillText(`M = ${(mPara).toFixed(2)}`, boxes[0].x0 + boxes[0].w - 8, h - 12);
      ctx.fillStyle = colors.teal;
      ctx.fillText(`M = ${(mDia).toFixed(2)}`, boxes[1].x0 + boxes[1].w - 8, h - 12);

      // Throttle React state updates
      const now = performance.now();
      if (now - lastSet > 250) {
        lastSet = now;
        setMpara(mPara);
        setMdia(mDia);
      }

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 11.3'}
      title="Paramagnet vs diamagnet"
      question="Two boxes, same external field — why do they magnetize in opposite directions?"
      caption={<>
        On the left, each molecule has a permanent magnetic moment (one unpaired electron, say). The
        external <strong>B</strong> torques each one toward alignment; thermal noise scrambles them right
        back. The net <strong>M</strong> aligns weakly with <strong>B</strong> — paramagnetism. On the right, no
        permanent moment exists; what little moment appears is the orbital current induced by the
        applied field, and Lenz's law forces it to oppose <strong>B</strong>. Hence the antiparallel arrows.
        Every material has some diamagnetic response; paramagnetic response only appears in atoms or
        molecules with unpaired electrons.
      </>}
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="B"
          value={B} min={0} max={10} step={0.1}
          format={v => v.toFixed(1)}
          onChange={setB}
        />
        <MiniReadout label="M (para)" value={Mpara.toFixed(2)} />
        <MiniReadout label="M (dia)" value={Mdia.toFixed(2)} />
      </DemoControls>
    </Demo>
  );
}
