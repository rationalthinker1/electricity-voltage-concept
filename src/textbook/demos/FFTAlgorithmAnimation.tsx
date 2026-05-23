/**
 * Demo 15.6 — FFT operation count
 *
 * Visualises the operation count of the naive DFT (N²) versus the
 * Cooley-Tukey FFT (N log₂ N), and shows the butterfly diagram for a small
 * N = 8 DFT. Reader picks N up to 4096 and sees the speed-up factor.
 */
import { useState } from 'react';
import { drawLabel } from '@/lib/canvasLayout';
import { withAlpha } from '@/lib/canvasTheme';
import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

interface Props {
  figure?: string;
}

export function FFTAlgorithmAnimationDemo({ figure }: Props) {
  // Power-of-two N from 8 to 4096
  const [logN, setLogN] = useState(7); // N = 128 by default
  const N = 1 << logN;

  const naive = N * N;
  const fft = N * logN;
  const speedup = naive / fft;

  const stateRef = useSimState({ logN });
  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, colors }, _state, _dt, _simTime) => {
      const { logN } = stateRef.current;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);
      const splitX = w * 0.45;
      const padL = 38,
        padR = 14,
        padT = 18,
        padB = 28;
      const plotW = splitX - padL - padR;
      const plotH = h - padT - padB;
      ctx.save();
      ctx.globalAlpha = 0.1;
      ctx.strokeStyle = colors.text;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padL, padT);
      ctx.lineTo(padL, padT + plotH);
      ctx.lineTo(padL + plotW, padT + plotH);
      ctx.stroke();
      const xMin = 3,
        xMax = 12;
      const maxOps = Math.log10(4096 * 4096);
      const xOf = (lN: number) => padL + ((lN - xMin) / (xMax - xMin)) * plotW;
      const yOf = (ops: number) => padT + plotH - (Math.log10(Math.max(ops, 1)) / maxOps) * plotH;
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = 0.85;
      ctx.strokeStyle = colors.blue;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let lN = xMin; lN <= xMax; lN++) {
        const M = 1 << lN;
        const x = xOf(lN),
          y = yOf(M * M);
        if (lN === xMin) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();
      ctx.strokeStyle = colors.accent;
      ctx.beginPath();
      for (let lN = xMin; lN <= xMax; lN++) {
        const M = 1 << lN;
        const x = xOf(lN),
          y = yOf(M * lN);
        if (lN === xMin) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.strokeStyle = colors.text;
      ctx.setLineDash([3, 4]);
      const xN = xOf(logN);
      ctx.beginPath();
      ctx.moveTo(xN, padT);
      ctx.lineTo(xN, padT + plotH);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = 0.75;
      ctx.fillStyle = colors.textDim;
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      for (let lN = xMin; lN <= xMax; lN += 2) {
        const M = 1 << lN;
        ctx.fillText('N=' + M, xOf(lN), padT + plotH + 12);
      }
      ctx.textAlign = 'right';
      drawLabel(ctx, { text: '10⁰', x: padL - 3, y: padT + plotH + 3, align: 'right' });
      drawLabel(ctx, { text: '10⁷', x: padL - 3, y: padT + 8, align: 'right' });
      ctx.restore();
      ctx.textAlign = 'left';
      drawLabel(ctx, { text: 'naive DFT — N²', x: padL + 4, y: padT + 10, color: colors.blue });
      drawLabel(ctx, { text: 'FFT — N log₂ N', x: padL + 4, y: padT + 22, color: colors.accent });
      const bx0 = splitX + 30,
        by0 = padT + 8;
      const bw = w - bx0 - 16;
      const bh = h - by0 - padB;
      const stages = 3;
      const Nbf = 8;
      const colW = bw / (stages + 1);
      const rowH = bh / Nbf;
      drawLabel(ctx, {
        x: bx0,
        y: by0 - 2,
        text: 'Cooley-Tukey butterfly (N = 8)',
        color: colors.textDim,
        size: 9,
      });
      const nodes: Array<Array<{ x: number; y: number }>> = [];
      for (let s = 0; s <= stages; s++) {
        const col: Array<{ x: number; y: number }> = [];
        for (let i = 0; i < Nbf; i++) {
          col.push({ x: bx0 + s * colW, y: by0 + rowH * (i + 0.5) });
        }
        nodes.push(col);
      }
      ctx.save();
      ctx.globalAlpha = 0.6;
      ctx.strokeStyle = colors.teal;
      ctx.lineWidth = 1;
      for (let s = 1; s <= stages; s++) {
        const step = 1 << (s - 1);
        for (let i = 0; i < Nbf; i++) {
          const partner = i ^ step;
          if (partner < i) continue;
          ctx.beginPath();
          ctx.moveTo(nodes[s - 1][i].x, nodes[s - 1][i].y);
          ctx.lineTo(nodes[s][i].x, nodes[s][i].y);
          ctx.moveTo(nodes[s - 1][i].x, nodes[s - 1][i].y);
          ctx.lineTo(nodes[s][partner].x, nodes[s][partner].y);
          ctx.moveTo(nodes[s - 1][partner].x, nodes[s - 1][partner].y);
          ctx.lineTo(nodes[s][i].x, nodes[s][i].y);
          ctx.moveTo(nodes[s - 1][partner].x, nodes[s - 1][partner].y);
          ctx.lineTo(nodes[s][partner].x, nodes[s][partner].y);
          ctx.stroke();
        }
      }
      for (let s = 0; s <= stages; s++) {
        for (let i = 0; i < Nbf; i++) {
          ctx.fillStyle = s === 0 || s === stages ? colors.accent : withAlpha(colors.text, 0.9);
          ctx.beginPath();
          ctx.arc(nodes[s][i].x, nodes[s][i].y, 3.5, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
      ctx.restore();
      ctx.fillStyle = colors.textDim;
      ctx.textAlign = 'right';
      for (let i = 0; i < Nbf; i++) {
        ctx.fillText('x[' + i + ']', bx0 - 4, by0 + rowH * (i + 0.5) + 3);
      }
      ctx.textAlign = 'left';
      const bitRev = (v: number) => {
        let r = 0;
        for (let b = 0; b < stages; b++) r = (r << 1) | ((v >> b) & 1);
        return r;
      };
      for (let i = 0; i < Nbf; i++) {
        ctx.fillText('X[' + bitRev(i) + ']', nodes[stages][i].x + 6, nodes[stages][i].y + 3);
      }
    },
    [],
  );

  return (
    <Demo
      figure={figure ?? 'Fig. 15.6'}
      title="FFT — N log N versus N²"
      question="What does Cooley-Tukey buy you in operations?"
      caption={
        <>
          The naive discrete Fourier transform multiplies an N-vector by an N×N matrix — N² complex
          multiplies. Cooley and Tukey's recursive decomposition reuses partial sums via the
          butterfly structure on the right, taking N log₂ N operations instead. For an N = 1024
          audio buffer, that's 10 240 multiplies versus 1 048 576 — a factor of ~100. At N = 4096
          the speed-up is 340×. Without it, real-time spectral processing would not exist.
        </>
      }
    >
      <AutoResizeCanvas height={320} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="log₂ N"
          value={logN}
          min={3}
          max={12}
          step={1}
          format={(v) => v.toFixed(0) + ` (N=${1 << v})`}
          onChange={(v) => setLogN(Math.round(v))}
        />
        <MiniReadout label="naive N²" value={naive.toLocaleString()} />
        <MiniReadout label="FFT N log₂ N" value={fft.toLocaleString()} />
        <MiniReadout label="speed-up" value={speedup.toFixed(1) + '×'} />
      </DemoControls>
    </Demo>
  );
}
