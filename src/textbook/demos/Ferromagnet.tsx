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
import { useState } from 'react';
import { drawLabel } from '@/lib/canvasLayout';
import { withAlpha } from '@/lib/canvasTheme';
import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

interface Props {
  figure: string;
}

interface SimCtx {
  dir: number[];
  Bhistory: number[];
  Mhistory: number[];
  cols: number;
  rows: number;
  top: number;
  panelH: number;
  bottomTop: number;
  bottomH: number;
  cellW: number;
  cellH: number;
  lastFlipB: number;
  lastUpdate: number;
  lastSet: number;
}

export function FerromagnetDemo({ figure }: Props) {
  // External B, -1..+1 (normalized to saturation)
  const [B, setB] = useState(0);
  const stateRef = useSimState({ B });
  const [M, setM] = useState(0);

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, colors }, state, _dt, _simTime, c: SimCtx) => {
      const { B } = state;
      const { dir, Bhistory, Mhistory, cols, rows, top, panelH, bottomTop, bottomH, cellW, cellH } = c;

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      // Domain evolution: at intervals, flip a few cells toward B
      const now = performance.now();
      if (now - c.lastUpdate > 80) {
        c.lastUpdate = now;
        // Coercivity: domain walls only move when B moves past a threshold
        if (Math.abs(B - c.lastFlipB) > 0.06 || Math.abs(B) > 0.85) {
          c.lastFlipB = B;
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
      const Mnow = sum / (cols * rows);

      // Push history
      if (Bhistory.length === 0 || Math.abs(Bhistory[Bhistory.length - 1] - B) > 0.01) {
        Bhistory.push(B);
        Mhistory.push(Mnow);
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
          const color = d > 0 ? withAlpha(colors.accent, 0.8) : withAlpha(colors.blue, 0.8);
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
      drawLabel(ctx, { text: 'Domain map (pink = +M, blue = −M)', x: 8, y: top - 8, font: '10px "JetBrains Mono", monospace' });

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
      ctx.moveTo(px0, cy_ax);
      ctx.lineTo(px1, cy_ax);
      ctx.moveTo(cx_ax, py0);
      ctx.lineTo(cx_ax, py1);
      ctx.stroke();

      ctx.fillStyle = colors.textDim;
      drawLabel(ctx, { text: 'M', x: cx_ax + 4, y: py0 + 10, font: '10px "JetBrains Mono", monospace' });
      drawLabel(ctx, { text: 'B', x: px1 - 14, y: cy_ax - 4, font: '10px "JetBrains Mono", monospace' });
      drawLabel(ctx, { text: '+1', x: cx_ax + 4, y: py0 + 12, font: '10px "JetBrains Mono", monospace' });
      drawLabel(ctx, { text: '−1', x: cx_ax + 4, y: py1 - 2, font: '10px "JetBrains Mono", monospace' });
      drawLabel(ctx, { text: '−1', x: px0 - 2, y: cy_ax + 12, font: '10px "JetBrains Mono", monospace' });
      drawLabel(ctx, { text: '+1', x: px1 - 14, y: cy_ax + 12, font: '10px "JetBrains Mono", monospace' });

      function xOf(b: number) {
        return cx_ax + ((b * (px1 - px0)) / 2) * 0.92;
      }
      function yOf(m: number) {
        return cy_ax - ((m * (py1 - py0)) / 2) * 0.92;
      }

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
          if (k === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();
      }

      // Current operating point
      const opX = xOf(B);
      const opY = yOf(Mnow);
      ctx.fillStyle = colors.accent;
      ctx.beginPath();
      ctx.arc(opX, opY, 5, 0, Math.PI * 2);
      ctx.fill();
      drawLabel(ctx, {
        x: px0,
        y: py1 - 4,
        text: `(B, M) = (${B.toFixed(2)}, ${Mnow.toFixed(2)})`,
        color: colors.teal,
        size: 11,
      });

      const nowSet = performance.now();
      if (nowSet - c.lastSet > 250) {
        c.lastSet = nowSet;
        setM(Mnow);
      }
    },
    [],
    (info) => {
      const { w, h } = info;

      // Grid of domain cells. Each holds a direction angle.
      const cols = 18,
        rows = 6;
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

      return {
        context: {
          dir,
          Bhistory,
          Mhistory,
          lastFlipB: 0,
          lastUpdate: 0,
          lastSet: 0,
          cols,
          rows,
          top,
          panelH,
          bottomTop,
          bottomH,
          cellW,
          cellH,
        },
      };
    },
  );

  return (
    <Demo
      figure={figure}
      title="Ferromagnetic domains and hysteresis"
      question="Why does iron stay magnetized after the field is gone?"
      caption={
        <>
          Each cell is a microscopic <em>domain</em> — a region where exchange coupling has aligned
          all the spins. Sweep B from negative through zero to positive and back: favorable domains
          grow, unfavorable ones shrink. Domain walls hang up on impurities and don't unwind cleanly
          when you reverse B — that's hysteresis, and it's why a transformer's iron core dissipates
          a little energy on every AC cycle. The leftover magnetization at B = 0 is the
          <em> remanence</em>; the reverse B needed to wipe it out is the
          <em> coercivity</em>. Both are zero in an ideal diamagnet or paramagnet.
        </>
      }
      deeperLab={{ slug: 'inductance', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={360} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="B"
          value={B}
          min={-1}
          max={1}
          step={0.01}
          format={(v) => v.toFixed(2)}
          onChange={setB}
        />
        <MiniReadout label="M" value={M.toFixed(2)} />
      </DemoControls>
    </Demo>
  );
}
