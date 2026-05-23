/**
 * Demo D5.4 — Ideal transformer
 *
 * Two coils sharing a rectangular iron core. Primary (left) has N₁ turns and
 * an AC source (V₁). Secondary (right) has N₂ turns. Output:
 *   V₂ = V₁ · N₂/N₁ (ideal-transformer limit; no losses).
 * Animated tracer dots circulate around the iron core to suggest the shared
 * flux Φ. The dots' speed and brightness scale with |V₁|.
 */
import { useMemo, useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, EquationStrip, MiniReadout, MiniSlider } from '@/components/Demo';
import { InlineMath } from '@/components/Formula';
import { Num } from '@/components/Num';
import { drawHalo } from '@/lib/canvasPrimitives';
import { withAlpha } from '@/lib/canvasTheme';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';
import { drawLabel } from "@/lib/canvasLayout";

interface Props {
  figure: string;
}

export function TransformerDemo({ figure }: Props) {
  const [N1, setN1] = useState(100);
  const [N2, setN2] = useState(20);
  const [V1, setV1] = useState(120);

  const stateRef = useSimState({ N1, N2, V1 });
  const V2 = useMemo(() => V1 * (N2 / N1), [V1, N2, N1]);

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, colors }, _state, _dt, simTime) => {
      const { N1, N2, V1 } = stateRef.current;
      const t = simTime;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);
      const coreLeft = w * 0.18;
      const coreRight = w * 0.82;
      const coreTop = h * 0.22;
      const coreBot = h * 0.78;
      const coreThick = 18;
      ctx.fillStyle = withAlpha(colors.textDim, 0.1);
      ctx.strokeStyle = withAlpha(colors.textDim, 0.45);
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.rect(coreLeft, coreTop, coreRight - coreLeft, coreBot - coreTop);
      ctx.stroke();
      ctx.beginPath();
      ctx.rect(
        coreLeft + coreThick,
        coreTop + coreThick,
        coreRight - coreLeft - 2 * coreThick,
        coreBot - coreTop - 2 * coreThick,
      );
      ctx.stroke();
      ctx.strokeStyle = withAlpha(colors.textDim, 0.18);
      ctx.lineWidth = 0.6;
      for (let x = coreLeft + 4; x < coreRight - 4; x += 7) {
        // top bar
        ctx.beginPath();
        ctx.moveTo(x, coreTop + 2);
        ctx.lineTo(x, coreTop + coreThick - 2);
        ctx.stroke();
        // bottom bar
        ctx.beginPath();
        ctx.moveTo(x, coreBot - coreThick + 2);
        ctx.lineTo(x, coreBot - 2);
        ctx.stroke();
      }
      const primX = coreLeft;
      const primCenterY = (coreTop + coreBot) / 2;
      const primHalfH = (coreBot - coreTop - 2 * coreThick) * 0.4;
      drawCoil(
        ctx,
        colors,
        primX,
        primCenterY,
        coreThick,
        primHalfH,
        Math.min(18, Math.max(4, Math.round(N1 / 12))),
        'left',
      );
      const secX = coreRight;
      drawCoil(
        ctx,
        colors,
        secX,
        primCenterY,
        coreThick,
        primHalfH,
        Math.min(18, Math.max(4, Math.round(N2 / 12))),
        'right',
      );
      const intensity = Math.min(1, Math.abs(V1) / 240);
      const speed = 0.25 + intensity * 0.9;
      const ntracers = 14;
      const cw = coreRight - coreLeft - coreThick;
      const ch = coreBot - coreTop - coreThick;
      const perim = 2 * (cw + ch);
      const cxL = coreLeft + coreThick / 2;
      const cxR = coreRight - coreThick / 2;
      const cyT = coreTop + coreThick / 2;
      const cyB = coreBot - coreThick / 2;
      for (let i = 0; i < ntracers; i++) {
        const u = (((i / ntracers + speed * t) % 1) + 1) % 1;
        const s = u * perim;
        let px = 0,
          py = 0;
        if (s < cw) {
          // top edge L→R
          px = cxL + s;
          py = cyT;
        } else if (s < cw + ch) {
          // right edge T→B
          px = cxR;
          py = cyT + (s - cw);
        } else if (s < 2 * cw + ch) {
          // bottom edge R→L
          px = cxR - (s - cw - ch);
          py = cyB;
        } else {
          // left edge B→T
          px = cxL;
          py = cyB - (s - 2 * cw - ch);
        }
        const a = 0.25 + intensity * 0.7;
        ctx.fillStyle = withAlpha(colors.teal, a);
        ctx.beginPath();
        ctx.arc(px, py, 2.6, 0, Math.PI * 2);
        ctx.fill();
      }
      const srcX = coreLeft - 50;
      const srcY = primCenterY;
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(srcX, srcY, 16, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      for (let k = -10; k <= 10; k++) {
        const x = srcX + k;
        const y = srcY + Math.sin((k / 10) * Math.PI * 2 + t * 8) * 6;
        if (k === -10) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.strokeStyle = colors.borderStrong;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(srcX + 16, srcY - 8);
      ctx.lineTo(primX - 22, srcY - 8);
      ctx.lineTo(primX - 22, primCenterY - primHalfH);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(srcX + 16, srcY + 8);
      ctx.lineTo(primX - 22, srcY + 8);
      ctx.lineTo(primX - 22, primCenterY + primHalfH);
      ctx.stroke();
      const loadX = coreRight + 50;
      const loadY = primCenterY;
      const lampIntensity = Math.min(1, Math.abs(V2) / 240);
      drawHalo(ctx, {
        x: loadX,
        y: loadY,
        radius: 32,
        color: withAlpha(colors.accent, 0.7 * lampIntensity),
        alpha: 1,
        extent: 1,
      });
      ctx.strokeStyle = withAlpha(colors.accent, 0.45 + 0.5 * lampIntensity);
      ctx.fillStyle = withAlpha(colors.accent, 0.15 + 0.55 * lampIntensity);
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(loadX, loadY, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = colors.borderStrong;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(secX + 22, primCenterY - primHalfH);
      ctx.lineTo(secX + 22, loadY - 8);
      ctx.lineTo(loadX - 14, loadY - 8);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(secX + 22, primCenterY + primHalfH);
      ctx.lineTo(secX + 22, loadY + 8);
      ctx.lineTo(loadX - 14, loadY + 8);
      ctx.stroke();
      ctx.fillStyle = colors.accent;
      drawLabel(ctx, { text: `N₁ = ${N1}`, x: primX, y: coreBot + 6, color: colors.accent, font: '10px "JetBrains Mono", monospace', align: 'center', baseline: 'top' });
      drawLabel(ctx, { text: `V₁ = ${V1.toFixed(0)} V`, x: srcX, y: srcY + 26, color: colors.accent, font: '10px "JetBrains Mono", monospace', align: 'center', baseline: 'top' });
      drawLabel(ctx, { text: `N₂ = ${N2}`, x: secX, y: coreBot + 6, color: colors.accent, font: '10px "JetBrains Mono", monospace', align: 'center', baseline: 'top' });
      drawLabel(ctx, { text: `V₂ = ${V2.toFixed(1)} V`, x: loadX, y: loadY + 26, color: colors.accent, font: '10px "JetBrains Mono", monospace', align: 'center', baseline: 'top' });
      drawLabel(ctx, { text: 'iron core · shared Φ', x: (coreLeft + coreRight) / 2, y: coreTop - 14, font: '10px "JetBrains Mono", monospace', align: 'center', baseline: 'top' });
    },
    [],
  );

  return (
    <Demo
      figure={figure}
      title="Transformer — turns ratio sets the voltage ratio"
      question="Why does the secondary voltage track N₂/N₁?"
      caption={
        <>
          The two coils share the same flux Φ through the iron core. Faraday's law on each coil
          gives
          <strong> V₁ = N₁ dΦ/dt</strong> and <strong>V₂ = N₂ dΦ/dt</strong>; divide and the
          <strong> dΦ/dt</strong> cancels: <strong>V₂ / V₁ = N₂ / N₁</strong>. Move the sliders and
          the secondary lamp tracks instantly.
        </>
      }
      deeperLab={{ slug: 'inductance', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="N₁"
          value={N1}
          min={1}
          max={400}
          step={1}
          format={(v) => Math.round(v).toString()}
          onChange={(v) => setN1(Math.max(1, Math.round(v)))}
        />
        <MiniSlider
          label="N₂"
          value={N2}
          min={1}
          max={400}
          step={1}
          format={(v) => Math.round(v).toString()}
          onChange={(v) => setN2(Math.max(1, Math.round(v)))}
        />
        <MiniSlider
          label="V₁"
          value={V1}
          min={0}
          max={240}
          step={1}
          format={(v) => Math.round(v) + ' V'}
          onChange={setV1}
        />
        <MiniReadout label="V₂ = V₁·N₂/N₁" value={<Num value={V2} />} unit="V" />
        <MiniReadout label="ratio" value={(N2 / N1).toFixed(3)} unit="×" />
      </DemoControls>
      <EquationStrip
        leftLabel="Turns-ratio identity"
        left={
          <InlineMath
            tex={
              `\\dfrac{V_{2}}{V_{1}} \\;=\\; \\dfrac{N_{2}}{N_{1}} \\;=\\; ` +
              `\\dfrac{${N2}}{${N1}} \\;\\approx\\; ${(N2 / N1).toFixed(3)}`
            }
          />
        }
        rightLabel="Substituted output"
        right={
          <InlineMath
            tex={
              `V_{2} \\;=\\; V_{1}\\,\\dfrac{N_{2}}{N_{1}} \\;=\\; ` +
              `(${V1.toFixed(0)})(${(N2 / N1).toFixed(3)}) ` +
              `\\;\\approx\\; ${V2.toFixed(1)}\\ \\text{V}`
            }
          />
        }
      />
    </Demo>
  );
}

/** Draw a side-view coil wrapping a vertical core arm of half-width `armHalf` at center x.
 *  `side` indicates which side of the arm the coil "winds in front of" for visual depth. */
function drawCoil(
  ctx: CanvasRenderingContext2D,
  colors: import('@/lib/canvasTheme').ThemeColors,
  cx: number,
  cy: number,
  armHalf: number,
  halfH: number,
  turns: number,
  side: 'left' | 'right',
) {
  const yTop = cy - halfH;
  const yBot = cy + halfH;
  const dy = (yBot - yTop) / turns;
  const r = dy * 0.42;
  const offset = side === 'left' ? -armHalf - 6 : armHalf + 6;
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = 1.6;
  for (let i = 0; i < turns; i++) {
    const y = yTop + (i + 0.5) * dy;
    // back half (behind the core arm)
    ctx.strokeStyle = withAlpha(colors.accent, 0.4);
    ctx.beginPath();
    ctx.ellipse(cx, y, armHalf + 3, r, 0, Math.PI, 2 * Math.PI);
    ctx.stroke();
    // front half (in front)
    ctx.strokeStyle = colors.accent;
    ctx.beginPath();
    ctx.ellipse(cx, y, armHalf + 3, r, 0, 0, Math.PI);
    ctx.stroke();
  }
  // outer connection line on chosen side
  ctx.strokeStyle = withAlpha(colors.accent, 0.55);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx + offset, yTop);
  ctx.lineTo(cx + offset, yBot);
  ctx.stroke();
}
