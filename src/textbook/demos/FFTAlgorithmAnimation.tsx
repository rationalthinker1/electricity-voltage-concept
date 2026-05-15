/**
 * Demo 15.6 — FFT operation count
 *
 * Visualises the operation count of the naive DFT (N²) versus the
 * Cooley-Tukey FFT (N log₂ N), and shows the butterfly diagram for a small
 * N = 8 DFT. Reader picks N up to 4096 and sees the speed-up factor.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import {
  Demo, DemoControls, MiniReadout, MiniSlider,
} from '@/components/Demo';

export function FFTAlgorithmAnimationDemo() {
  // Power-of-two N from 8 to 4096
  const [logN, setLogN] = useState(7); // N = 128 by default
  const N = 1 << logN;

  const naive = N * N;
  const fft = N * logN;
  const speedup = naive / fft;

  const stateRef = useRef({ logN });
  useEffect(() => { stateRef.current = { logN }; }, [logN]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, colors } = info;
    let raf = 0;
    function draw() {
      const { logN } = stateRef.current;

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      // Left half: log-log style operation count plot for N = 8..4096
      const splitX = w * 0.45;
      const padL = 38, padR = 14, padT = 18, padB = 28;
      const plotW = splitX - padL - padR;
      const plotH = h - padT - padB;

      // Axes
      ctx.save();
      ctx.globalAlpha = 0.1;
      ctx.strokeStyle = colors.text;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padL, padT); ctx.lineTo(padL, padT + plotH);
      ctx.lineTo(padL + plotW, padT + plotH);
      ctx.stroke();

      // x: logN from 3..12, y: log10(ops)
      const xMin = 3, xMax = 12;
      const maxOps = Math.log10(4096 * 4096);
      const xOf = (lN: number) => padL + ((lN - xMin) / (xMax - xMin)) * plotW;
      const yOf = (ops: number) => padT + plotH - (Math.log10(Math.max(ops, 1)) / maxOps) * plotH;

      // Curves
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = 0.85;
      ctx.strokeStyle = colors.blue;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let lN = xMin; lN <= xMax; lN++) {
        const M = 1 << lN;
        const x = xOf(lN), y = yOf(M * M);
        if (lN === xMin) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();
      ctx.strokeStyle = colors.accent;
      ctx.beginPath();
      for (let lN = xMin; lN <= xMax; lN++) {
        const M = 1 << lN;
        const x = xOf(lN), y = yOf(M * lN);
        if (lN === xMin) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Selected N marker
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.strokeStyle = colors.text;
      ctx.setLineDash([3, 4]);
      const xN = xOf(logN);
      ctx.beginPath();
      ctx.moveTo(xN, padT); ctx.lineTo(xN, padT + plotH);
      ctx.stroke();
      ctx.setLineDash([]);

      // Tick labels
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
      ctx.fillText('10⁰', padL - 3, padT + plotH + 3);
      ctx.fillText('10⁷', padL - 3, padT + 8);

      // Legend
      ctx.restore();
      ctx.fillStyle = colors.blue;
      ctx.textAlign = 'left';
      ctx.fillText('naive DFT — N²', padL + 4, padT + 10);
      ctx.fillStyle = colors.accent;
      ctx.fillText('FFT — N log₂ N', padL + 4, padT + 22);

      // Right half: butterfly diagram for N = 8
      const bx0 = splitX + 30, by0 = padT + 8;
      const bw = w - bx0 - 16;
      const bh = h - by0 - padB;
      const stages = 3; // log2(8)
      const Nbf = 8;
      const colW = bw / (stages + 1);
      const rowH = bh / Nbf;

      ctx.fillStyle = colors.textDim;
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('Cooley-Tukey butterfly (N = 8)', bx0, by0 - 2);

      // Draw nodes per stage
      const nodes: Array<Array<{ x: number; y: number }>> = [];
      for (let s = 0; s <= stages; s++) {
        const col: Array<{ x: number; y: number }> = [];
        for (let i = 0; i < Nbf; i++) {
          col.push({ x: bx0 + s * colW, y: by0 + rowH * (i + 0.5) });
        }
        nodes.push(col);
      }

      // Edges: for stage s (1..3), pair index i with i XOR (1 << (stages - s))
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
      // Dots
      for (let s = 0; s <= stages; s++) {
        for (let i = 0; i < Nbf; i++) {
          ctx.fillStyle = (s === 0 || s === stages) ? '#ff6b2a' : 'rgba(236,235,229,0.9)';
          ctx.beginPath();
          ctx.arc(nodes[s][i].x, nodes[s][i].y, 3.5, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
      // Input / output index labels
      ctx.restore();
      ctx.fillStyle = colors.textDim;
      ctx.textAlign = 'right';
      for (let i = 0; i < Nbf; i++) {
        ctx.fillText('x[' + i + ']', bx0 - 4, by0 + rowH * (i + 0.5) + 3);
      }
      ctx.textAlign = 'left';
      // bit-reversed output order
      const bitRev = (v: number) => {
        let r = 0;
        for (let b = 0; b < stages; b++) r = (r << 1) | ((v >> b) & 1);
        return r;
      };
      for (let i = 0; i < Nbf; i++) {
        ctx.fillText('X[' + bitRev(i) + ']', nodes[stages][i].x + 6, nodes[stages][i].y + 3);
      }

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure="Fig. 15.6"
      title="FFT — N log N versus N²"
      question="What does Cooley-Tukey buy you in operations?"
      caption={
        <>
          The naive discrete Fourier transform multiplies an N-vector by an N×N matrix — N² complex multiplies. Cooley
          and Tukey's recursive decomposition reuses partial sums via the butterfly structure on the right, taking
          N log₂ N operations instead. For an N = 1024 audio buffer, that's 10 240 multiplies versus 1 048 576 — a
          factor of ~100. At N = 4096 the speed-up is 340×. Without it, real-time spectral processing would not exist.
        </>
      }
    >
      <AutoResizeCanvas height={320} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="log₂ N"
          value={logN} min={3} max={12} step={1}
          format={v => v.toFixed(0) + ` (N=${1 << v})`}
          onChange={v => setLogN(Math.round(v))}
        />
        <MiniReadout label="naive N²" value={naive.toLocaleString()} />
        <MiniReadout label="FFT N log₂ N" value={fft.toLocaleString()} />
        <MiniReadout label="speed-up" value={speedup.toFixed(1) + '×'} />
      </DemoControls>
    </Demo>
  );
}
