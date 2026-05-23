/**
 * Demo 18.1 — Volta's pile (1800)
 *
 * Stack alternating Zn / Cu discs separated by brine-soaked cardboard.
 * Add or remove disc pairs; each pair contributes ~1.1 V open-circuit
 * (Cu²⁺/Cu at +0.34 V vs Zn²⁺/Zn at -0.76 V → 1.10 V per cell, ignoring
 * the small acid-side correction). A stick figure at the terminals lights
 * up when V crosses comfortable shock thresholds.
 */
import { useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { drawLabel } from '@/lib/canvasLayout';
import { Demo, DemoControls, EquationStrip, MiniReadout, MiniSlider } from '@/components/Demo';
import { InlineMath } from '@/components/Formula';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

interface Props {
  figure: string;
}

const V_PER_PAIR = 1.1; // V open-circuit per Zn-Cu pair (Daniell-type cell)

export function VoltaicPileDemo({ figure }: Props) {
  const [pairs, setPairs] = useState(6);

  const V = pairs * V_PER_PAIR;

  const stateRef = useSimState({ pairs, V });
  const setup = useSimLoop(
    stateRef,
    ({ ctx, w: W, h: H, colors }, _state, _dt, _simTime, ctx0) => {
      let phase = ctx0.phase;
      const s = stateRef.current;
      phase += 0.05;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, W, H);
      const splitX = Math.min(W * 0.55, W - 220);
      const baseY = H - 30;
      const padTop = 24;
      const usableH = baseY - padTop;
      const N = s.pairs;
      const layers = N * 3;
      const layerH = Math.max(3, Math.min(14, usableH / Math.max(layers, 1)));
      const pileW = Math.min(120, splitX - 80);
      const cx = splitX / 2;
      for (let i = 0; i < N; i++) {
        const yBase = baseY - i * 3 * layerH;
        // Cardboard separator (brown)
        ctx.fillStyle = '#6b5538';
        ctx.fillRect(cx - pileW / 2, yBase - layerH, pileW, layerH);
        // Copper disc (orange-amber)
        ctx.fillStyle = '#b87333';
        ctx.fillRect(cx - pileW / 2, yBase - 2 * layerH, pileW, layerH);
        // Zinc disc (grey-silver)
        ctx.fillStyle = '#c4c8cc';
        ctx.fillRect(cx - pileW / 2, yBase - 3 * layerH, pileW, layerH);
      }
      if (N > 0) {
        ctx.fillStyle = colors.textDim;
        drawLabel(ctx, { text: 'Cu (bottom)', x: cx - pileW / 2 - 8, y: baseY - layerH * 1.5, font: '10px "JetBrains Mono", monospace', align: 'right', baseline: 'middle' });
        drawLabel(ctx, { text: 'Zn (top)', x: cx - pileW / 2 - 8, y: baseY - layers * layerH + layerH * 1.5, font: '10px "JetBrains Mono", monospace', align: 'right', baseline: 'middle' });
      }
      const topY = baseY - layers * layerH;
      const wireRightX = splitX + 30;
      ctx.strokeStyle = '#c4c8cc';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx + pileW / 2, topY + layerH / 2);
      ctx.lineTo(wireRightX, topY + layerH / 2);
      ctx.lineTo(wireRightX, H / 2 - 26);
      ctx.stroke();
      ctx.strokeStyle = '#b87333';
      ctx.beginPath();
      ctx.moveTo(cx + pileW / 2, baseY - layerH / 2);
      ctx.lineTo(wireRightX + 16, baseY - layerH / 2);
      ctx.lineTo(wireRightX + 16, H / 2 + 26);
      ctx.stroke();
      const fx = wireRightX + 60;
      const fy = H / 2;
      ctx.strokeStyle = colors.text;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(fx, fy - 30, 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(fx, fy - 22);
      ctx.lineTo(fx, fy + 10);
      ctx.moveTo(fx, fy - 10);
      ctx.lineTo(wireRightX, fy - 26);
      ctx.moveTo(fx, fy - 10);
      ctx.lineTo(wireRightX + 16, fy + 26);
      ctx.moveTo(fx, fy + 10);
      ctx.lineTo(fx - 8, fy + 26);
      ctx.moveTo(fx, fy + 10);
      ctx.lineTo(fx + 8, fy + 26);
      ctx.stroke();
      if (s.V > 8) {
        const intensity = Math.min(1, (s.V - 8) / 40);
        ctx.strokeStyle = `rgba(255,235,80,${0.4 + 0.5 * Math.abs(Math.sin(phase * 5))})`;
        ctx.lineWidth = 1 + intensity * 2;
        for (let j = 0; j < 3; j++) {
          ctx.beginPath();
          const sx = fx - 12 + Math.random() * 24;
          const sy = fy - 40 + Math.random() * 6;
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx + (Math.random() - 0.5) * 14, sy - 8);
          ctx.lineTo(sx + (Math.random() - 0.5) * 14, sy - 16);
          ctx.stroke();
        }
        drawLabel(ctx, {
          x: fx,
          y: fy - 50,
          text: 'ZAP',
          color: 'rgba(255,235,80,0.85)',
          align: 'center',
        });
      }
      ctx.fillStyle = colors.textDim;
      drawLabel(ctx, { text: `${N} Zn-Cu pairs`, x: 12, y: 10, font: '10px "JetBrains Mono", monospace', baseline: 'top' });
      drawLabel(ctx, { text: `open-circuit V ≈ ${s.V.toFixed(2)} V`, x: 12, y: 24, font: '10px "JetBrains Mono", monospace', baseline: 'top' });
      ctx0.phase = phase;
    },
    [],
    () => ({ context: { phase: 0 } }),
  );

  return (
    <Demo
      figure={figure}
      title="Volta's pile, 1800"
      question="How does a stack of Zn and Cu produce sustained current?"
      caption={
        <>
          Each Zn / Cu pair, separated by brine-soaked cardboard, contributes about
          <strong> 1.1 V</strong> open-circuit. Stack N pairs and the terminal voltages add. Volta's
          original Royal-Society pile reached roughly 30 V — enough to electrolyse water and to give
          the experimenter a memorable shock.
        </>
      }
    >
      <AutoResizeCanvas height={320} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="N pairs"
          value={pairs}
          min={1}
          max={40}
          step={1}
          format={(v) => v.toFixed(0)}
          onChange={(v) => setPairs(Math.round(v))}
        />
        <MiniReadout label="per-pair V" value={V_PER_PAIR.toFixed(2)} unit="V" />
        <MiniReadout label="V_total" value={V.toFixed(2)} unit="V" />
      </DemoControls>
      <EquationStrip
        leftLabel="Series cells add voltages"
        left={<InlineMath tex="V_{\text{total}} = N \cdot V_{\text{cell}}" />}
        rightLabel={`At N = ${pairs}`}
        right={<InlineMath tex={`${pairs} \\times 1.10\\,\\text{V} = ${V.toFixed(2)}\\,\\text{V}`} />}
      />
    </Demo>
  );
}
