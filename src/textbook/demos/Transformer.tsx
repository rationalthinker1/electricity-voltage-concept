/**
 * Demo D5.4 — Ideal transformer
 *
 * Two coils sharing a rectangular iron core. Primary (left) has N₁ turns and
 * an AC source (V₁). Secondary (right) has N₂ turns. Output:
 *   V₂ = V₁ · N₂/N₁ (ideal-transformer limit; no losses).
 * Animated tracer dots circulate around the iron core to suggest the shared
 * flux Φ. The dots' speed and brightness scale with |V₁|.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';

interface Props { figure?: string }

export function TransformerDemo({ figure }: Props) {
  const [N1, setN1] = useState(100);
  const [N2, setN2] = useState(20);
  const [V1, setV1] = useState(120);

  const stateRef = useRef({ N1, N2, V1 });
  useEffect(() => { stateRef.current = { N1, N2, V1 }; }, [N1, N2, V1]);

  const V2 = useMemo(() => V1 * (N2 / N1), [V1, N2, N1]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h } = info;
    let raf = 0;
    let t0 = performance.now();

    function draw() {
      const { N1, N2, V1 } = stateRef.current;
      const t = (performance.now() - t0) / 1000;

      ctx.fillStyle = '#0d0d10';
      ctx.fillRect(0, 0, w, h);

      // Geometry: iron core as a rounded rectangle in the middle
      const coreLeft = w * 0.18;
      const coreRight = w * 0.82;
      const coreTop = h * 0.22;
      const coreBot = h * 0.78;
      const coreThick = 18;

      // Iron core shape
      ctx.fillStyle = 'rgba(160,158,149,0.10)';
      ctx.strokeStyle = 'rgba(160,158,149,0.45)';
      ctx.lineWidth = 1.4;
      // Outer rect
      ctx.beginPath();
      ctx.rect(coreLeft, coreTop, coreRight - coreLeft, coreBot - coreTop);
      ctx.stroke();
      // Inner cutout
      ctx.beginPath();
      ctx.rect(coreLeft + coreThick, coreTop + coreThick,
        (coreRight - coreLeft) - 2 * coreThick, (coreBot - coreTop) - 2 * coreThick);
      ctx.stroke();
      // Hatching to suggest laminated iron
      ctx.strokeStyle = 'rgba(160,158,149,0.18)';
      ctx.lineWidth = 0.6;
      for (let x = coreLeft + 4; x < coreRight - 4; x += 7) {
        // top bar
        ctx.beginPath();
        ctx.moveTo(x, coreTop + 2); ctx.lineTo(x, coreTop + coreThick - 2);
        ctx.stroke();
        // bottom bar
        ctx.beginPath();
        ctx.moveTo(x, coreBot - coreThick + 2); ctx.lineTo(x, coreBot - 2);
        ctx.stroke();
      }

      // Primary coil — wraps the LEFT vertical arm of the core
      const primX = coreLeft;
      const primCenterY = (coreTop + coreBot) / 2;
      const primHalfH = (coreBot - coreTop - 2 * coreThick) * 0.4;
      drawCoil(ctx, primX, primCenterY, coreThick, primHalfH, Math.min(18, Math.max(4, Math.round(N1 / 12))), 'left');

      // Secondary coil — wraps the RIGHT vertical arm of the core
      const secX = coreRight;
      drawCoil(ctx, secX, primCenterY, coreThick, primHalfH, Math.min(18, Math.max(4, Math.round(N2 / 12))), 'right');

      // Animated flux tracers traveling counter-clockwise around the core
      const intensity = Math.min(1, Math.abs(V1) / 240);
      const speed = 0.25 + intensity * 0.9;
      const ntracers = 14;
      // Build path lengths along the centerline of the core
      const cw = coreRight - coreLeft - coreThick;
      const ch = coreBot - coreTop - coreThick;
      const perim = 2 * (cw + ch);
      const cxL = coreLeft + coreThick / 2;
      const cxR = coreRight - coreThick / 2;
      const cyT = coreTop + coreThick / 2;
      const cyB = coreBot - coreThick / 2;
      for (let i = 0; i < ntracers; i++) {
        const u = ((i / ntracers + speed * t) % 1 + 1) % 1;
        const s = u * perim;
        let px = 0, py = 0;
        if (s < cw) {                     // top edge L→R
          px = cxL + s; py = cyT;
        } else if (s < cw + ch) {         // right edge T→B
          px = cxR; py = cyT + (s - cw);
        } else if (s < 2 * cw + ch) {     // bottom edge R→L
          px = cxR - (s - cw - ch); py = cyB;
        } else {                          // left edge B→T
          px = cxL; py = cyB - (s - 2 * cw - ch);
        }
        const a = 0.25 + intensity * 0.7;
        ctx.fillStyle = `rgba(108,197,194,${a})`;
        ctx.beginPath();
        ctx.arc(px, py, 2.6, 0, Math.PI * 2);
        ctx.fill();
      }

      // AC source — circle with sine-wave squiggle, on the far left
      const srcX = coreLeft - 50;
      const srcY = primCenterY;
      ctx.strokeStyle = 'rgba(255,107,42,0.85)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(srcX, srcY, 16, 0, Math.PI * 2);
      ctx.stroke();
      // sine inside the circle
      ctx.beginPath();
      for (let k = -10; k <= 10; k++) {
        const x = srcX + k;
        const y = srcY + Math.sin((k / 10) * Math.PI * 2 + t * 8) * 6;
        if (k === -10) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      // Wires from source to primary coil top/bottom
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
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

      // Load lamp on right
      const loadX = coreRight + 50;
      const loadY = primCenterY;
      const lampIntensity = Math.min(1, Math.abs(V2) / 240);
      const lampGlow = ctx.createRadialGradient(loadX, loadY, 0, loadX, loadY, 32);
      lampGlow.addColorStop(0, `rgba(255,107,42,${0.7 * lampIntensity})`);
      lampGlow.addColorStop(1, 'rgba(255,107,42,0)');
      ctx.fillStyle = lampGlow;
      ctx.beginPath(); ctx.arc(loadX, loadY, 32, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = `rgba(255,107,42,${0.45 + 0.5 * lampIntensity})`;
      ctx.fillStyle = `rgba(255,107,42,${0.15 + 0.55 * lampIntensity})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(loadX, loadY, 12, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
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

      // Labels
      ctx.fillStyle = 'rgba(255,107,42,0.85)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText(`N₁ = ${N1}`, primX, coreBot + 6);
      ctx.fillText(`V₁ = ${V1.toFixed(0)} V`, srcX, srcY + 26);
      ctx.fillText(`N₂ = ${N2}`, secX, coreBot + 6);
      ctx.fillText(`V₂ = ${V2.toFixed(1)} V`, loadX, loadY + 26);

      ctx.fillStyle = 'rgba(160,158,149,0.7)';
      ctx.textAlign = 'center';
      ctx.fillText('iron core · shared Φ', (coreLeft + coreRight) / 2, coreTop - 14);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 5.4'}
      title="Transformer — turns ratio sets the voltage ratio"
      question="Why does the secondary voltage track N₂/N₁?"
      caption={<>
        The two coils share the same flux Φ through the iron core. Faraday's law on each coil gives
        <strong> V₁ = N₁ dΦ/dt</strong> and <strong>V₂ = N₂ dΦ/dt</strong>; divide and the
        <strong> dΦ/dt</strong> cancels: <strong>V₂ / V₁ = N₂ / N₁</strong>. Move the sliders and the secondary lamp
        tracks instantly.
      </>}
      deeperLab={{ slug: 'inductance', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="N₁"
          value={N1} min={1} max={400} step={1}
          format={v => Math.round(v).toString()}
          onChange={v => setN1(Math.max(1, Math.round(v)))}
        />
        <MiniSlider
          label="N₂"
          value={N2} min={1} max={400} step={1}
          format={v => Math.round(v).toString()}
          onChange={v => setN2(Math.max(1, Math.round(v)))}
        />
        <MiniSlider
          label="V₁"
          value={V1} min={0} max={240} step={1}
          format={v => Math.round(v) + ' V'}
          onChange={setV1}
        />
        <MiniReadout label="V₂ = V₁·N₂/N₁" value={<Num value={V2} />} unit="V" />
        <MiniReadout label="ratio" value={(N2 / N1).toFixed(3)} unit="×" />
      </DemoControls>
    </Demo>
  );
}

/** Draw a side-view coil wrapping a vertical core arm of half-width `armHalf` at center x.
 *  `side` indicates which side of the arm the coil "winds in front of" for visual depth. */
function drawCoil(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, armHalf: number, halfH: number,
  turns: number, side: 'left' | 'right',
) {
  const yTop = cy - halfH;
  const yBot = cy + halfH;
  const dy = (yBot - yTop) / turns;
  const r = dy * 0.42;
  const offset = side === 'left' ? -armHalf - 6 : armHalf + 6;
  ctx.strokeStyle = 'rgba(255,107,42,0.85)';
  ctx.lineWidth = 1.6;
  for (let i = 0; i < turns; i++) {
    const y = yTop + (i + 0.5) * dy;
    // back half (behind the core arm)
    ctx.strokeStyle = 'rgba(255,107,42,0.4)';
    ctx.beginPath();
    ctx.ellipse(cx, y, armHalf + 3, r, 0, Math.PI, 2 * Math.PI);
    ctx.stroke();
    // front half (in front)
    ctx.strokeStyle = 'rgba(255,107,42,0.95)';
    ctx.beginPath();
    ctx.ellipse(cx, y, armHalf + 3, r, 0, 0, Math.PI);
    ctx.stroke();
  }
  // outer connection line on chosen side
  ctx.strokeStyle = 'rgba(255,107,42,0.55)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx + offset, yTop);
  ctx.lineTo(cx + offset, yBot);
  ctx.stroke();
}
