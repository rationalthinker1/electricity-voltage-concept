/**
 * Demo D4.5 — Variable resistors (pot + LDR)
 *
 * Left panel: a potentiometer drawn as a resistive track (A — B) with a
 * draggable wiper W. Slider 0..1 sets the wiper position.
 * Readouts: R_AW, R_WB (they always sum to R_total).
 *
 * Right panel: a CdS photoresistor with a slider for "illuminance" (lux).
 * R drops log-linearly from ~1 MΩ (dark) to ~200 Ω (bright sun).
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import {
  Demo, DemoControls, MiniReadout, MiniSlider,
} from '@/components/Demo';
import { Num } from '@/components/Num';

interface Props { figure?: string }

const R_TOTAL = 10000; // 10 kΩ pot

// CdS LDR: empirical log-log fit, R ≈ 500 kΩ at 0.1 lux, ~5 kΩ at 100 lux,
// ~200 Ω at 10000 lux. Consistent with typical GL5528 / VT900 datasheets.
function ldrR(lux: number): number {
  const x = Math.max(0.01, lux);
  // Power-law fit: R = A * lux^(-gamma), gamma ≈ 0.7, A chosen so R(10 lux) ≈ 20 kΩ.
  return 20000 * Math.pow(x / 10, -0.75);
}

export function VariableResistorsDemo({ figure }: Props) {
  const [wiper, setWiper] = useState(0.4); // 0..1 (B..A)
  const [lux, setLux] = useState(50);

  const R_AW = R_TOTAL * (1 - wiper);
  const R_WB = R_TOTAL * wiper;
  const R_LDR = ldrR(lux);

  const stateRef = useRef({ wiper, lux });
  useEffect(() => { stateRef.current = { wiper, lux }; }, [wiper, lux]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w: W, h: H, canvas } = info;
    let raf = 0;

    function draw() {
      const { wiper, lux } = stateRef.current;

      ctx.fillStyle = '#0d0d10';
      ctx.fillRect(0, 0, W, H);

      // ──────── LEFT: Potentiometer ────────
      const splitX = W * 0.55;
      const trackL = 50;
      const trackR = splitX - 30;
      const trackY = H * 0.42;
      const trackH = 18;

      // Track body
      ctx.fillStyle = 'rgba(190,160,140,0.32)';
      roundRect(ctx, trackL, trackY - trackH / 2, trackR - trackL, trackH, 4);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.18)';
      ctx.stroke();

      // Resistive material texture (faint diagonal hatches)
      ctx.save();
      ctx.beginPath();
      roundRectPath(ctx, trackL + 1, trackY - trackH / 2 + 1, trackR - trackL - 2, trackH - 2, 3);
      ctx.clip();
      ctx.strokeStyle = 'rgba(255,107,42,0.22)';
      ctx.lineWidth = 1;
      for (let x = trackL - 20; x < trackR + 20; x += 6) {
        ctx.beginPath();
        ctx.moveTo(x, trackY - trackH / 2);
        ctx.lineTo(x + trackH, trackY + trackH / 2);
        ctx.stroke();
      }
      ctx.restore();

      // Terminals A (left) and B (right)
      ctx.fillStyle = '#5baef8';
      ctx.fillRect(trackL - 14, trackY - 4, 12, 8);
      ctx.fillStyle = '#ff3b6e';
      ctx.fillRect(trackR + 2, trackY - 4, 12, 8);

      // Wire down from terminals to "leads"
      ctx.strokeStyle = 'rgba(200,200,205,0.7)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(trackL - 8, trackY + 4); ctx.lineTo(trackL - 8, H - 16);
      ctx.moveTo(trackR + 8, trackY + 4); ctx.lineTo(trackR + 8, H - 16);
      ctx.stroke();

      ctx.fillStyle = 'rgba(160,158,149,0.85)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('A', trackL - 8, H - 4);
      ctx.fillText('B', trackR + 8, H - 4);

      // Wiper
      const wiperX = trackL + wiper * (trackR - trackL);
      // Wiper arm
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(wiperX, trackY - 26);
      ctx.lineTo(wiperX, trackY - trackH / 2 - 2);
      ctx.stroke();
      // Wiper contact ball
      ctx.fillStyle = '#ff6b2a';
      ctx.beginPath();
      ctx.arc(wiperX, trackY - trackH / 2 - 2, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.lineWidth = 1;
      ctx.stroke();
      // Wiper terminal W (top)
      ctx.fillStyle = '#ffb84a';
      ctx.fillRect(wiperX - 6, trackY - 36, 12, 8);
      ctx.fillStyle = 'rgba(160,158,149,0.85)';
      ctx.fillText('W (wiper)', wiperX, trackY - 42);

      // R_AW / R_WB labels
      ctx.fillStyle = 'rgba(91,174,248,0.85)';
      ctx.textAlign = 'left';
      ctx.fillText(`R_AW`, trackL, trackY + 28);
      ctx.fillText(fmtOhms(R_TOTAL * (1 - wiper)), trackL, trackY + 42);
      ctx.fillStyle = 'rgba(255,59,110,0.85)';
      ctx.textAlign = 'right';
      ctx.fillText(`R_WB`, trackR, trackY + 28);
      ctx.fillText(fmtOhms(R_TOTAL * wiper), trackR, trackY + 42);

      // Title
      ctx.fillStyle = '#ff6b2a';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(`POTENTIOMETER — R_total = ${(R_TOTAL / 1e3).toFixed(0)} kΩ`, trackL, 8);

      // ──────── Divider ────────
      ctx.strokeStyle = 'rgba(255,255,255,0.10)';
      ctx.beginPath(); ctx.moveTo(splitX, 0); ctx.lineTo(splitX, H); ctx.stroke();

      // ──────── RIGHT: LDR ────────
      const ldrCX = (splitX + W) / 2;
      const ldrCY = H / 2;

      // LDR symbol: a rectangular package with a zig-zag CdS pattern on top
      const pW = 80, pH = 50;
      ctx.fillStyle = 'rgba(200,200,205,0.18)';
      roundRect(ctx, ldrCX - pW / 2, ldrCY - pH / 2, pW, pH, 5);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.22)';
      ctx.stroke();

      // CdS serpentine — its visual "brightness" tracks lux
      const luxNorm = Math.min(1, Math.max(0, (Math.log10(lux) + 1) / 5));
      const cdsColor = `rgba(255,180,${40 + Math.floor(luxNorm * 180)},${0.6 + luxNorm * 0.35})`;
      ctx.strokeStyle = cdsColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      const sLeft = ldrCX - pW / 2 + 8;
      const sRight = ldrCX + pW / 2 - 8;
      const sTop = ldrCY - pH / 2 + 8;
      const sBot = ldrCY + pH / 2 - 8;
      const segs = 5;
      const dx = (sRight - sLeft) / segs;
      for (let i = 0; i <= segs; i++) {
        const x = sLeft + i * dx;
        const y = (i % 2 === 0) ? sTop : sBot;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        if (i < segs) ctx.lineTo(x + dx, y);
      }
      ctx.stroke();

      // Light rays from above
      const lightAlpha = 0.15 + luxNorm * 0.7;
      ctx.strokeStyle = `rgba(255,230,160,${lightAlpha})`;
      ctx.lineWidth = 1.5;
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(ldrCX + i * 14, ldrCY - pH / 2 - 30);
        ctx.lineTo(ldrCX + i * 14 + 4, ldrCY - pH / 2 - 8);
        ctx.stroke();
        // Arrowhead
        ctx.beginPath();
        ctx.moveTo(ldrCX + i * 14 + 4, ldrCY - pH / 2 - 8);
        ctx.lineTo(ldrCX + i * 14 + 1, ldrCY - pH / 2 - 13);
        ctx.lineTo(ldrCX + i * 14 + 7, ldrCY - pH / 2 - 11);
        ctx.closePath();
        ctx.fillStyle = `rgba(255,230,160,${lightAlpha})`;
        ctx.fill();
      }

      // Leads
      ctx.strokeStyle = 'rgba(200,200,205,0.7)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(ldrCX - pW / 2 + 12, ldrCY + pH / 2); ctx.lineTo(ldrCX - pW / 2 + 12, H - 16);
      ctx.moveTo(ldrCX + pW / 2 - 12, ldrCY + pH / 2); ctx.lineTo(ldrCX + pW / 2 - 12, H - 16);
      ctx.stroke();

      // Lux label
      ctx.fillStyle = 'rgba(160,158,149,0.85)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${lux.toFixed(lux < 10 ? 1 : 0)} lux`, ldrCX, ldrCY - pH / 2 - 36);
      ctx.fillText(`R = ${fmtOhms(R_LDR)}`, ldrCX, ldrCY + pH / 2 + 22);

      // Title
      ctx.fillStyle = '#ff6b2a';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('PHOTORESISTOR (CdS)', splitX + 12, 8);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);

    // ──────── Mouse/touch dragging on the wiper ────────
    let drag = false;
    function localX(clientX: number): number {
      const r = canvas.getBoundingClientRect();
      return clientX - r.left;
    }
    function pickWiperX(x: number): number | null {
      const splitX = canvas.clientWidth * 0.55;
      const trackL = 50;
      const trackR = splitX - 30;
      if (x < trackL - 8 || x > trackR + 8) return null;
      return Math.max(0, Math.min(1, (x - trackL) / (trackR - trackL)));
    }
    function onDown(e: MouseEvent) {
      const x = localX(e.clientX);
      const v = pickWiperX(x);
      if (v !== null) { drag = true; setWiper(v); e.preventDefault(); }
    }
    function onMove(e: MouseEvent) {
      if (!drag) return;
      const v = pickWiperX(localX(e.clientX));
      if (v !== null) setWiper(v);
    }
    function onUp() { drag = false; }
    function onTouchStart(e: TouchEvent) {
      const t = e.touches[0]; if (!t) return;
      const x = localX(t.clientX);
      const v = pickWiperX(x);
      if (v !== null) { drag = true; setWiper(v); e.preventDefault(); }
    }
    function onTouchMove(e: TouchEvent) {
      if (!drag) return;
      const t = e.touches[0]; if (!t) return;
      const v = pickWiperX(localX(t.clientX));
      if (v !== null) { setWiper(v); e.preventDefault(); }
    }
    function onTouchEnd() { drag = false; }

    canvas.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 4.5'}
      title="Variable cousins"
      question="What if R isn't fixed at all?"
      caption={
        <>
          Drag the wiper on the left potentiometer (or use the slider): the resistive track has terminals A and B, and the slider
          divides it into <strong>R_AW</strong> + <strong>R_WB</strong> = <strong>R_total</strong>. On the right, a CdS photoresistor's
          resistance falls from megohms in the dark to a few hundred ohms in bright light — log-scale on illuminance.
        </>
      }
      deeperLab={{ slug: 'ohms-law', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={280} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="Wiper"
          value={wiper} min={0} max={1} step={0.005}
          format={v => `${(v * 100).toFixed(0)}%`}
          onChange={setWiper}
        />
        <MiniReadout label="R_AW" value={<Num value={R_AW} />} unit="Ω" />
        <MiniReadout label="R_WB" value={<Num value={R_WB} />} unit="Ω" />
        <MiniSlider
          label="Illuminance"
          value={Math.log10(lux)} min={-1} max={4} step={0.05}
          format={v => `${Math.pow(10, v).toFixed(Math.pow(10, v) < 10 ? 1 : 0)} lux`}
          onChange={v => setLux(Math.pow(10, v))}
        />
        <MiniReadout label="R_LDR" value={<Num value={R_LDR} />} unit="Ω" />
      </DemoControls>
    </Demo>
  );
}

function fmtOhms(R: number): string {
  if (!isFinite(R)) return '—';
  if (R >= 1e6) return (R / 1e6).toFixed(2) + ' MΩ';
  if (R >= 1e3) return (R / 1e3).toFixed(2) + ' kΩ';
  if (R >= 1) return R.toFixed(0) + ' Ω';
  return R.toFixed(2) + ' Ω';
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  roundRectPath(ctx, x, y, w, h, r);
}
function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  r = Math.min(r, h / 2, w / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
