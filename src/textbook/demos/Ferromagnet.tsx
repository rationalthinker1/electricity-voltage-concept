/**
 * Demo D11.4 — Ferromagnetic domains and the hysteresis loop
 *
 * Top panel: a grid of small magnetic-moment arrows organised into domains.
 * Each cell is in one of four orientations (right, up, left, down). Apply
 * external B (slider, signed) — favorable domains (aligned with B) grow,
 * unfavorable ones shrink. Domain walls don't reverse perfectly, so the
 * M(B) trace plots a hysteresis loop.
 *
 * Bottom panel: M vs B curve. The current operating point is marked.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';

interface Props { figure?: string }

export function FerromagnetDemo({ figure }: Props) {
  // External B, -1..+1 (normalized to saturation)
  const [B, setB] = useState(0);
  const stateRef = useRef({ B });
  useEffect(() => { stateRef.current = { B }; }, [B]);
  const [M, setM] = useState(0);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, colors } = info;
    let raf = 0;

    // Grid of domain cells. Each holds a direction angle.
    const cols = 18, rows = 6;
    const top = 30;
    const panelH = Math.floor(h * 0.55);
    const bottomTop = top + panelH + 18;
    const bottomH = h - bottomTop - 14;
    const cellW = w / cols;
    const cellH = panelH / rows;

    // Initial domain pattern: random ±1 (left or right) blocks of ~3 wide
    const dir: number[] = new Array(cols * rows);
    function blockInit() {
      for (let j = 0; j < rows; j++) {
        let sign = Math.random() > 0.5 ? 1 : -1;
        let run = Math.floor(2 + Math.random() * 4);
        for (let i = 0; i < cols; i++) {
          dir[j * cols + i] = sign;
          run--;
          if (run <= 0) {
            sign = -sign;
            run = Math.floor(2 + Math.random() * 4);
          }
        }
      }
    }
    blockInit();

    // Hysteresis tracking: remember M trajectory; loop traces it as B is slid back and forth
    const Bhistory: number[] = [];
    const Mhistory: number[] = [];

    // State of magnetization (continuous; flips toward B but lags behind)
    // We compute the "fraction aligned with +x" as the macroscopic M.
    // To simulate hysteresis, transitions only happen when |B - lastFlipB| > coercivity threshold.
    let lastFlipB = 0;

    let lastUpdate = 0;
    let lastSet = 0;

    function draw() {
      const { B } = stateRef.current;

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      // Domain evolution: at intervals, flip a few cells toward B
      const now = performance.now();
      if (now - lastUpdate > 80) {
        lastUpdate = now;
        // Coercivity: domain walls only move when B moves past a threshold
        if (Math.abs(B - lastFlipB) > 0.06 || Math.abs(B) > 0.85) {
          lastFlipB = B;
          // Number of cells to flip: scales with |B|
          const k = Math.floor(2 + Math.abs(B) * 24);
          for (let n = 0; n < k; n++) {
            const i = Math.floor(Math.random() * cols);
            const j = Math.floor(Math.random() * rows);
            const idx = j * cols + i;
            // Strong field — flip toward B; small field — random walk
            if (Math.abs(B) > 0.1) {
              // Probability to flip toward B grows with |B|
              if (Math.random() < 0.55 + Math.abs(B) * 0.35) {
                dir[idx] = B > 0 ? 1 : -1;
              }
            }
          }
        }
      }

      // Compute net magnetization
      let sum = 0;
      for (const d of dir) sum += d;
      const M = sum / (cols * rows);

      // Push history
      if (Bhistory.length === 0 || Math.abs(Bhistory[Bhistory.length - 1] - B) > 0.01) {
        Bhistory.push(B);
        Mhistory.push(M);
        if (Bhistory.length > 500) {
          Bhistory.shift();
          Mhistory.shift();
        }
      }

      // Draw domain grid
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const d = dir[j * cols + i];
          const cx = i * cellW + cellW / 2;
          const cy = top + j * cellH + cellH / 2;
          const color = d > 0 ? 'rgba(255,107,42,0.80)' : 'rgba(91,174,248,0.80)';
          const len = Math.min(cellW, cellH) * 0.36;
          ctx.strokeStyle = color;
          ctx.fillStyle = color;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(cx - d * len, cy);
          ctx.lineTo(cx + d * len, cy);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(cx + d * len, cy);
          ctx.lineTo(cx + d * len - d * 5, cy - 3);
          ctx.lineTo(cx + d * len - d * 5, cy + 3);
          ctx.closePath();
          ctx.fill();
        }
      }
      // Domain boundary outline
      ctx.strokeStyle = colors.borderStrong;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.strokeRect(0, top, w, panelH);
      ctx.setLineDash([]);

      // Label
      ctx.fillStyle = colors.textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('Domain map (pink = +M, blue = −M)', 8, top - 8);

      // B-M plot
      const px0 = 50;
      const px1 = w - 16;
      const py0 = bottomTop;
      const py1 = bottomTop + bottomH;
      const cx_ax = (px0 + px1) / 2;
      const cy_ax = (py0 + py1) / 2;

      // axes
      ctx.strokeStyle = colors.borderStrong;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px0, cy_ax); ctx.lineTo(px1, cy_ax);
      ctx.moveTo(cx_ax, py0); ctx.lineTo(cx_ax, py1);
      ctx.stroke();

      ctx.fillStyle = colors.textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText('M', cx_ax + 4, py0 + 10);
      ctx.fillText('B', px1 - 14, cy_ax - 4);
      ctx.fillText('+1', cx_ax + 4, py0 + 12);
      ctx.fillText('−1', cx_ax + 4, py1 - 2);
      ctx.fillText('−1', px0 - 2, cy_ax + 12);
      ctx.fillText('+1', px1 - 14, cy_ax + 12);

      function xOf(b: number) { return cx_ax + b * (px1 - px0) / 2 * 0.92; }
      function yOf(m: number) { return cy_ax - m * (py1 - py0) / 2 * 0.92; }

      // Hysteresis trace
      if (Bhistory.length > 1) {
        ctx.save();
        ctx.globalAlpha = 0.55;
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        for (let k = 0; k < Bhistory.length; k++) {
          const x = xOf(Bhistory[k]);
          const y = yOf(Mhistory[k]);
          if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();
      }

      // Current operating point
      const opX = xOf(B);
      const opY = yOf(M);
      ctx.fillStyle = colors.accent;
      ctx.beginPath();
      ctx.arc(opX, opY, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = colors.teal;
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`(B, M) = (${B.toFixed(2)}, ${M.toFixed(2)})`, px0, py1 - 4);

      const nowSet = performance.now();
      if (nowSet - lastSet > 250) {
        lastSet = nowSet;
        setM(M);
      }

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 11.4'}
      title="Ferromagnetic domains and hysteresis"
      question="Why does iron stay magnetized after the field is gone?"
      caption={<>
        Each cell is a microscopic <em>domain</em> — a region where exchange coupling
        has aligned all the spins. Sweep B from negative through zero to positive
        and back: favorable domains grow, unfavorable ones shrink. Domain walls hang
        up on impurities and don't unwind cleanly when you reverse B — that's
        hysteresis, and it's why a transformer's iron core dissipates a little
        energy on every AC cycle. The leftover magnetization at B = 0 is the
        <em> remanence</em>; the reverse B needed to wipe it out is the
        <em> coercivity</em>. Both are zero in an ideal diamagnet or paramagnet.
      </>}
      deeperLab={{ slug: 'inductance', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={360} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="B"
          value={B} min={-1} max={1} step={0.01}
          format={v => v.toFixed(2)}
          onChange={setB}
        />
        <MiniReadout label="M" value={M.toFixed(2)} />
      </DemoControls>
    </Demo>
  );
}
