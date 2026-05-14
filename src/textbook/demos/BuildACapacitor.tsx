/**
 * Demo D4.1 — Build-a-capacitor (centerpiece)
 *
 * Two horizontal plates with two big buttons: "Add + to top" / "Add − to top".
 * Each click moves one unit of charge between the plates. The bottom plate
 * automatically carries the equal-and-opposite charge (induced — the system
 * stays globally neutral). As charge accumulates:
 *   • Pink + dots populate the top plate, blue − dots the bottom (or flipped
 *     if the reader pushes − up).
 *   • The E-field arrows in the gap get denser.
 *   • V = Q/C climbs linearly with N.
 *   • U = ½CV² climbs quadratically with N.
 *   • A small inset graph traces V vs N (line) and U vs N (curve).
 *   • A "work to add the Nth charge" bar fills, then resets at each click —
 *     each new charge is harder.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import {
  Demo, DemoControls, MiniReadout, MiniSlider,
} from '@/components/Demo';
import { Num } from '@/components/Num';
import { PHYS } from '@/lib/physics';
import { getCanvasColors } from '@/lib/canvasTheme';

interface Props { figure?: string }

// One "click" deposits this much charge. Picked so V/U live in friendly ranges.
const Q_PER_CLICK = 1e-9; // 1 nC

export function BuildACapacitorDemo({ figure }: Props) {
  // Geometry sliders
  const [A_cm2, setACm2] = useState(100);
  const [d_mm, setDMm] = useState(1.0);

  // Net charge on the top plate (signed). Bottom plate is always −Q_top.
  const [Q, setQ] = useState(0); // coulombs
  const [clicks, setClicks] = useState(0); // # of clicks for the V-vs-N graph

  const A_m2 = A_cm2 * 1e-4;
  const d_m = d_mm * 1e-3;
  const C = (PHYS.eps_0 * A_m2) / d_m;
  const V = Q / C;
  const U = 0.5 * C * V * V;

  // The work to add the *next* click of charge: ~ q * V_now (the reader is
  // pushing q against the existing potential difference).
  const workForNext = Math.abs(Q_PER_CLICK * V);
  // Visual: animate a bar that scales with how big the "next" work is, relative
  // to the max work seen so far in this run.
  const workMaxRef = useRef(1e-18);
  if (workForNext > workMaxRef.current) workMaxRef.current = workForNext;

  // History for the inset graph
  const historyRef = useRef<Array<{ n: number; V: number; U: number }>>([
    { n: 0, V: 0, U: 0 },
  ]);

  function pushHistory(nextN: number, nextQ: number) {
    const nextV = nextQ / C;
    const nextU = 0.5 * C * nextV * nextV;
    historyRef.current.push({ n: nextN, V: nextV, U: nextU });
    if (historyRef.current.length > 600) historyRef.current.shift();
  }

  const addPos = () => {
    const next = Q + Q_PER_CLICK;
    setQ(next);
    setClicks(c => c + 1);
    pushHistory(clicks + 1, next);
  };
  const addNeg = () => {
    const next = Q - Q_PER_CLICK;
    setQ(next);
    setClicks(c => c + 1);
    pushHistory(clicks + 1, next);
  };
  const reset = () => {
    setQ(0);
    setClicks(0);
    workMaxRef.current = 1e-18;
    historyRef.current = [{ n: 0, V: 0, U: 0 }];
  };

  // Recompute C if geometry changes — keep the history visualisation in V/U
  // consistent. Don't touch Q (the charges you put on the plate are still
  // there); but reset the V-vs-N curve so the reader doesn't compare apples
  // to oranges.
  useEffect(() => {
    historyRef.current = [{ n: 0, V: 0, U: 0 }];
    setClicks(0);
  }, [A_cm2, d_mm]); // eslint-disable-line react-hooks/exhaustive-deps

  const stateRef = useRef({ Q, A_m2, d_m, C, V, U, workForNext });
  useEffect(() => {
    stateRef.current = { Q, A_m2, d_m, C, V, U, workForNext };
  }, [Q, A_m2, d_m, C, V, U, workForNext]);

  // For visual purposes: how many dots to draw on each plate. Each click adds
  // one dot, regardless of sign, up to a cap.
  const drawDotsCount = useMemo(() => Math.min(60, Math.abs(clicks)), [clicks]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w: W, h: H } = info;
    let raf = 0;
    let phase = 0;

    function draw() {
      const s = stateRef.current;
      phase += 0.02;

      ctx.fillStyle = getCanvasColors().bg;
      ctx.fillRect(0, 0, W, H);

      // Layout: capacitor on the left ~62%, inset graph + work bar on right.
      const splitX = Math.min(W * 0.62, Math.max(W - 220, W * 0.55));

      // ── LEFT: capacitor
      ctx.save();
      ctx.beginPath(); ctx.rect(0, 0, splitX, H); ctx.clip();

      const padX = 40;
      // Plate width scales (gently) with A
      const wScale = Math.sqrt(A_cm2 / 200);
      const plateW = Math.max(140, Math.min(splitX - 2 * padX, 360 * wScale));
      // Gap scales (log) with d
      const dNorm = (Math.log10(d_mm) - Math.log10(0.1)) / (Math.log10(10) - Math.log10(0.1));
      const gapPx = 22 + Math.max(0, Math.min(1, dNorm)) * (H * 0.45);
      const plateThick = 7;
      const cx = splitX / 2;
      const cy = H / 2;
      const xL = cx - plateW / 2;
      const topY = cy - gapPx / 2 - plateThick / 2;
      const botY = cy + gapPx / 2 + plateThick / 2;

      // Sign of charge on top plate
      const topPos = s.Q > 0;
      const colTop = topPos ? '#ff3b6e' : '#5baef8';
      const colBot = topPos ? '#5baef8' : '#ff3b6e';
      const symTop = topPos ? '+' : '−';
      const symBot = topPos ? '−' : '+';

      // Energy haze in the gap
      if (Math.abs(s.Q) > 0) {
        const E = Math.abs(s.V) / s.d_m;
        const uE = 0.5 * PHYS.eps_0 * E * E;
        const haze = Math.max(0.05, Math.min(0.5, Math.log10(uE + 1) * 0.10 + 0.10));
        const grd = ctx.createLinearGradient(0, topY + plateThick, 0, botY - plateThick);
        grd.addColorStop(0, `rgba(255,107,42,${haze * 0.4})`);
        grd.addColorStop(0.5, `rgba(255,107,42,${haze})`);
        grd.addColorStop(1, `rgba(255,107,42,${haze * 0.4})`);
        ctx.fillStyle = grd;
        ctx.fillRect(xL, topY + plateThick, plateW, botY - topY - plateThick * 2);
      }

      // E-field arrows in the gap (count grows with |Q|)
      const usable = botY - topY - plateThick * 2 - 14;
      if (Math.abs(s.Q) > 0 && usable > 8) {
        const Nfield = Math.max(3, Math.min(22, Math.round(Math.log10(Math.abs(s.Q) / Q_PER_CLICK + 1) * 9)));
        const arrLen = Math.min(20, usable * 0.45);
        const dirDown = topPos; // E points + → −; if top is +, E points down
        for (let i = 0; i < Nfield; i++) {
          const fx = xL + 18 + ((plateW - 36) * (i + 0.5)) / Nfield;
          const cycle = (phase * 60 + i * 9) % usable;
          const y1 = (dirDown ? topY + plateThick + 6 + cycle : botY - plateThick - 6 - cycle);
          const y0 = dirDown ? y1 - arrLen : y1 + arrLen;
          ctx.strokeStyle = getCanvasColors().pink;
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          ctx.moveTo(fx, y0);
          ctx.lineTo(fx, y1);
          ctx.stroke();
          ctx.fillStyle = getCanvasColors().pink;
          ctx.beginPath();
          ctx.moveTo(fx, y1);
          ctx.lineTo(fx - 3.5, y1 + (dirDown ? -6 : 6));
          ctx.lineTo(fx + 3.5, y1 + (dirDown ? -6 : 6));
          ctx.closePath();
          ctx.fill();
        }
      }

      // Plates (gradient bars)
      drawPlate(ctx, xL, topY, plateW, plateThick, colTop);
      drawPlate(ctx, xL, botY - plateThick, plateW, plateThick, colBot);

      // ± charge dots on the plates (count = drawDotsCount)
      drawChargeDots(ctx, xL, topY - 9, plateW, drawDotsCount, symTop, colTop);
      drawChargeDots(ctx, xL, botY + plateThick + 9, plateW, drawDotsCount, symBot, colBot);

      // Labels
      ctx.fillStyle = getCanvasColors().textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(`N = ${clicks}`, 12, 10);
      ctx.fillText(`Q_top = ${(s.Q * 1e9).toFixed(1)} nC`, 12, 24);

      ctx.restore();

      // Divider
      ctx.strokeStyle = getCanvasColors().border;
      ctx.beginPath(); ctx.moveTo(splitX, 0); ctx.lineTo(splitX, H); ctx.stroke();

      // ── RIGHT: inset graph (top half) + work-bar (bottom)
      ctx.save();
      ctx.beginPath(); ctx.rect(splitX, 0, W - splitX, H); ctx.clip();

      const pX = splitX + 18;
      const pW = W - splitX - 30;
      const gH = Math.max(80, H * 0.55);
      const gY = 24;

      // Frame
      ctx.strokeStyle = getCanvasColors().border;
      ctx.lineWidth = 1;
      ctx.strokeRect(pX, gY, pW, gH);

      // Title
      ctx.fillStyle = getCanvasColors().textDim;
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText('V (line)  ·  U (curve)  vs  N', pX, gY - 4);

      const hist = historyRef.current;
      if (hist.length > 1) {
        let maxV = 1e-12, maxU = 1e-24;
        for (const p of hist) {
          if (Math.abs(p.V) > maxV) maxV = Math.abs(p.V);
          if (Math.abs(p.U) > maxU) maxU = Math.abs(p.U);
        }
        const lastN = hist[hist.length - 1]!.n;
        const xN = (n: number) => pX + (n / Math.max(lastN, 1)) * pW;
        const yV = (v: number) => gY + gH - (Math.abs(v) / maxV) * (gH * 0.92);
        const yU = (u: number) => gY + gH - (Math.abs(u) / maxU) * (gH * 0.92);

        // V line (pink)
        ctx.strokeStyle = getCanvasColors().pink;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        for (let i = 0; i < hist.length; i++) {
          const p = hist[i]!;
          const x = xN(p.n);
          const y = yV(p.V);
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // U curve (amber)
        ctx.strokeStyle = getCanvasColors().accent;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        for (let i = 0; i < hist.length; i++) {
          const p = hist[i]!;
          const x = xN(p.n);
          const y = yU(p.U);
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // ── Work bar (bottom of right pane)
      const barY = gY + gH + 24;
      const barH = 12;
      ctx.fillStyle = getCanvasColors().textDim;
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText('Work to add the next charge  ∝  V', pX, barY - 4);

      // The bar fills proportional to V / Vmax (visual gauge of "how hard")
      const histMaxV = (() => {
        let mv = 1e-12;
        for (const p of historyRef.current) if (Math.abs(p.V) > mv) mv = Math.abs(p.V);
        return mv;
      })();
      const fill = Math.max(0, Math.min(1, Math.abs(s.V) / Math.max(histMaxV, 1e-12)));
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.fillRect(pX, barY, pW, barH);
      ctx.fillStyle = getCanvasColors().accent;
      ctx.fillRect(pX, barY, pW * fill, barH);

      ctx.fillStyle = getCanvasColors().text;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'top';
      ctx.fillText(`${(s.workForNext * 1e9).toFixed(3)} nJ`, pX + pW, barY + barH + 4);
      ctx.textAlign = 'left';
      ctx.fillText('next click', pX, barY + barH + 4);

      ctx.restore();

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [A_cm2, d_mm, clicks, drawDotsCount]);

  return (
    <Demo
      figure={figure ?? 'Fig. 4.1'}
      title="Build a capacitor, one charge at a time"
      question="Why does each new charge cost more work than the last?"
      caption={
        <>
          Each click moves <strong>1 nC</strong> from the bottom plate to the top (the bottom is left with an equal-and-opposite induced charge).
          Watch the voltage rise <em>linearly</em> with the number of charges and the stored energy rise <em>quadratically</em>. The bar on
          the right shows the work the next click costs — it grows because each new charge has to push against the field of all the charges
          already there.
        </>
      }
      deeperLab={{ slug: 'capacitance', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={340} setup={setup} />
      <DemoControls>
        <button type="button" className="mini-toggle on" onClick={addPos}>+ to top</button>
        <button type="button" className="mini-toggle on" onClick={addNeg}>− to top</button>
        <button type="button" className="mini-toggle" onClick={reset}>Reset</button>
        <MiniSlider
          label="A"
          value={A_cm2} min={10} max={500} step={5}
          format={v => v.toFixed(0) + ' cm²'}
          onChange={setACm2}
        />
        <MiniSlider
          label="d"
          value={d_mm} min={0.1} max={5} step={0.05}
          format={v => v.toFixed(2) + ' mm'}
          onChange={setDMm}
        />
        <MiniReadout label="C = ε₀A/d" value={<Num value={C} />} unit="F" />
        <MiniReadout label="V = Q/C" value={<Num value={V} />} unit="V" />
        <MiniReadout label="U = ½CV²" value={<Num value={U} />} unit="J" />
      </DemoControls>
    </Demo>
  );
}

function drawPlate(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, color: string,
) {
  const grd = ctx.createLinearGradient(x, y, x, y + h);
  grd.addColorStop(0, color);
  grd.addColorStop(1, color + '99');
  ctx.fillStyle = grd;
  ctx.shadowColor = color + 'a0';
  ctx.shadowBlur = 10;
  ctx.fillRect(x, y, w, h);
  ctx.shadowBlur = 0;
}

function drawChargeDots(
  ctx: CanvasRenderingContext2D,
  xL: number, y: number, plateW: number, count: number,
  sym: string, color: string,
) {
  if (count <= 0) return;
  ctx.fillStyle = color;
  ctx.font = 'bold 11px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const usable = plateW - 24;
  for (let i = 0; i < count; i++) {
    const x = xL + 12 + (usable * (i + 0.5)) / count;
    ctx.fillText(sym, x, y);
  }
}
