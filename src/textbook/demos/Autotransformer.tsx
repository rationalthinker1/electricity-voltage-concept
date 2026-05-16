/**
 * Demo D18.7 — Autotransformer (single tapped winding)
 *
 * A single continuous winding with a tap. The full winding is the primary;
 * the portion from the tap to the bottom is the secondary. The shared
 * section carries (I_p − I_s); the rest of the secondary winding carries
 * only I_s. The "copper saving" relative to a two-winding transformer of
 * the same V_p, V_s, and load comes from the fact that only the smaller
 * current (I_p) flows in the upper section.
 *
 * Reader drags the tap fraction k = N_s/N_p; readouts show V_s, I_p, I_s,
 * the shared-winding current, and the copper savings.
 *
 * Caveat: no galvanic isolation. The same conductor carries both circuits.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';

interface Props {
  figure?: string;
}

export function AutotransformerDemo({ figure }: Props) {
  // k = N_s / N_p, the tap fraction. 1.0 = full winding to secondary (1:1);
  // smaller k = bigger step-down.
  const [k, setK] = useState(0.5);
  const [Vp, setVp] = useState(240); // primary voltage (RMS-ish, just a label)
  const [Iload, setIload] = useState(10); // secondary load current, A

  const stateRef = useRef({ k });
  useEffect(() => {
    stateRef.current = { k };
  }, [k]);

  const computed = useMemo(() => {
    const Vs = Vp * k;
    const Is = Iload;
    // Ideal: V_p I_p = V_s I_s, so I_p = k · I_s
    const Ip = k * Is;
    // Shared (lower) section carries I_s − I_p = (1 − k) I_s
    const Ishared = Is - Ip;
    // Copper requirement (proportional to ∑ N_segment · I_segment):
    //   Auto: N_top · I_p + N_bot · (I_s − I_p)
    //        = N_p(1 − k) · I_p + N_p · k · (I_s − I_p)
    // Two-winding: N_p · I_p + N_s · I_s = N_p · I_p + N_p · k · I_s
    // Ratio = 1 − k (the famous autotransformer copper saving).
    const copperRatio = 1 - k; // fraction of two-winding copper
    const copperSaving = 1 - copperRatio; // 1 − (1 − k) = k
    const P = Vs * Is;
    return { Vs, Is, Ip, Ishared, copperRatio, copperSaving, P };
  }, [k, Vp, Iload]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, canvas, colors } = info;
    let raf = 0;
    let dragging = false;

    function setKFromY(yPx: number) {
      // Map y position over the winding box to k.
      // winding box goes from coilTop to coilBot in canvas CSS px
      const coilTop = h * 0.12;
      const coilBot = h * 0.88;
      const u = (yPx - coilTop) / (coilBot - coilTop);
      const newK = Math.max(0.05, Math.min(0.95, 1 - u));
      setK(newK);
    }

    function onPointerDown(ev: PointerEvent) {
      const rect = canvas.getBoundingClientRect();
      const x = ev.clientX - rect.left;
      // Only grab if the click is in the autotransformer column (left half).
      if (x < w * 0.05 || x > w * 0.4) return;
      dragging = true;
      setKFromY(ev.clientY - rect.top);
      canvas.setPointerCapture(ev.pointerId);
    }
    function onPointerMove(ev: PointerEvent) {
      if (!dragging) return;
      const rect = canvas.getBoundingClientRect();
      setKFromY(ev.clientY - rect.top);
    }
    function onPointerUp(ev: PointerEvent) {
      dragging = false;
      if (canvas.hasPointerCapture(ev.pointerId)) {
        canvas.releasePointerCapture(ev.pointerId);
      }
    }
    canvas.style.cursor = 'ns-resize';
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);

    function draw() {
      const { k } = stateRef.current;

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      // ─────── Left side: autotransformer ───────
      const coilCX = w * 0.22;
      const coilTop = h * 0.12;
      const coilBot = h * 0.88;
      const coilH = coilBot - coilTop;
      const tapY = coilTop + (1 - k) * coilH;

      // Vertical core line behind winding
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.strokeStyle = colors.textDim;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(coilCX, coilTop - 8);
      ctx.lineTo(coilCX, coilBot + 8);
      ctx.stroke();
      ctx.restore();

      // Single winding — full primary length, helical strokes
      const turns = 16;
      const dy = coilH / turns;
      const r = 14;
      for (let i = 0; i < turns; i++) {
        const y = coilTop + (i + 0.5) * dy;
        // Color upper section (above tap) differently from lower (below tap)
        const isLower = y >= tapY;
        ctx.strokeStyle = isLower ? 'rgba(108,197,194,0.95)' : 'rgba(255,107,42,0.95)';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.ellipse(coilCX, y, r, dy * 0.45, 0, 0, Math.PI);
        ctx.stroke();
        ctx.strokeStyle = isLower ? 'rgba(108,197,194,0.40)' : 'rgba(255,107,42,0.40)';
        ctx.beginPath();
        ctx.ellipse(coilCX, y, r, dy * 0.45, 0, Math.PI, 2 * Math.PI);
        ctx.stroke();
      }

      // Tap marker — small triangle and dashed line
      ctx.fillStyle = colors.text;
      ctx.beginPath();
      ctx.moveTo(coilCX + r + 4, tapY);
      ctx.lineTo(coilCX + r + 14, tapY - 6);
      ctx.lineTo(coilCX + r + 14, tapY + 6);
      ctx.closePath();
      ctx.fill();
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = colors.text;
      ctx.setLineDash([3, 3]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(coilCX + r + 14, tapY);
      ctx.lineTo(w * 0.4, tapY);
      ctx.stroke();
      ctx.restore();
      ctx.setLineDash([]);

      // Primary lead (top)
      ctx.strokeStyle = colors.borderStrong;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(coilCX - r - 4, coilTop - 4);
      ctx.lineTo(coilCX - r - 18, coilTop - 4);
      ctx.lineTo(coilCX - r - 18, coilBot + 4);
      ctx.lineTo(coilCX - r - 4, coilBot + 4);
      ctx.stroke();

      // Labels
      ctx.fillStyle = colors.accent;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(`V_p = ${Vp.toFixed(0)} V`, coilCX + r + 18, coilTop + (tapY - coilTop) / 2);
      ctx.fillStyle = colors.teal;
      ctx.fillText(`V_s = ${(Vp * k).toFixed(0)} V`, coilCX + r + 18, tapY + (coilBot - tapY) / 2);

      ctx.fillStyle = colors.textDim;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText('autotransformer', coilCX, coilTop - 12);
      ctx.textBaseline = 'top';
      ctx.fillText(`tap k = ${k.toFixed(2)}`, coilCX, coilBot + 12);

      // Divider
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(w * 0.5, coilTop - 16);
      ctx.lineTo(w * 0.5, coilBot + 16);
      ctx.stroke();

      // ─────── Right side: two-winding transformer (same V ratio) ───────
      const pX = w * 0.66;
      const sX = w * 0.86;
      // Core
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.strokeStyle = colors.textDim;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(pX, coilTop - 8);
      ctx.lineTo(pX, coilBot + 8);
      ctx.moveTo(sX, coilTop - 8);
      ctx.lineTo(sX, coilBot + 8);
      ctx.moveTo(pX - 2, coilTop - 6);
      ctx.lineTo(sX + 2, coilTop - 6);
      ctx.moveTo(pX - 2, coilBot + 6);
      ctx.lineTo(sX + 2, coilBot + 6);
      ctx.stroke();
      ctx.restore();

      // Primary winding (full height)
      const primTurns = 14;
      const primDy = coilH / primTurns;
      for (let i = 0; i < primTurns; i++) {
        const y = coilTop + (i + 0.5) * primDy;
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.ellipse(pX, y, 11, primDy * 0.45, 0, 0, Math.PI);
        ctx.stroke();
        ctx.save();
        ctx.globalAlpha = 0.4;
        ctx.strokeStyle = colors.accent;
        ctx.beginPath();
        ctx.ellipse(pX, y, 11, primDy * 0.45, 0, Math.PI, 2 * Math.PI);
        ctx.stroke();
        ctx.restore();
      }
      // Secondary winding (shorter — k · height — but rendered as full coil
      // of fewer turns)
      const secTurns = Math.max(2, Math.round(primTurns * k));
      const secH = coilH * k;
      const secTop = coilTop + (coilH - secH) / 2;
      const secDy = secH / secTurns;
      for (let i = 0; i < secTurns; i++) {
        const y = secTop + (i + 0.5) * secDy;
        ctx.strokeStyle = colors.teal;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.ellipse(sX, y, 11, secDy * 0.45, 0, 0, Math.PI);
        ctx.stroke();
        ctx.save();
        ctx.globalAlpha = 0.4;
        ctx.strokeStyle = colors.teal;
        ctx.beginPath();
        ctx.ellipse(sX, y, 11, secDy * 0.45, 0, Math.PI, 2 * Math.PI);
        ctx.stroke();
        ctx.restore();
      }

      ctx.fillStyle = colors.textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText('isolated 2-winding', (pX + sX) / 2, coilTop - 12);
      ctx.textBaseline = 'top';
      ctx.fillText('same V ratio', (pX + sX) / 2, coilBot + 12);

      // Drag hint
      ctx.save();
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = colors.textDim;
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('drag tap ↕', 6, 6);
      ctx.restore();

      // Warning ribbon
      ctx.fillStyle = colors.accent;
      ctx.textAlign = 'center';
      ctx.fillText('no galvanic isolation', coilCX, 6);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
    };
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 18.7'}
      title="Autotransformer: one tapped winding"
      question="Drag the tap. How much copper does an autotransformer save vs an isolated two-winding transformer of the same ratio?"
      caption={
        <>
          A single winding tapped at fraction k from the bottom: the upper portion carries only I
          <sub>p</sub>; the shared lower portion carries I<sub>s</sub> − I<sub>p</sub> = (1 − k) I
          <sub>s</sub>. The total copper is reduced by a factor of (1 − k) relative to a two-winding
          design — for a 2:1 step (k = 0.5), 50 % less copper; for a 10:1 step (k = 0.1), only 10 %
          less. Trade-off: no galvanic isolation, so a winding fault puts the full primary voltage
          on the load.
        </>
      }
      deeperLab={{ slug: 'inductance', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={320} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="tap k = N_s/N_p"
          value={k}
          min={0.05}
          max={0.95}
          step={0.01}
          format={(v) => v.toFixed(2)}
          onChange={setK}
        />
        <MiniSlider
          label="V_p"
          value={Vp}
          min={60}
          max={500}
          step={1}
          format={(v) => Math.round(v) + ' V'}
          onChange={setVp}
        />
        <MiniSlider
          label="load I_s"
          value={Iload}
          min={1}
          max={50}
          step={1}
          format={(v) => Math.round(v) + ' A'}
          onChange={setIload}
        />
        <MiniReadout label="V_s" value={<Num value={computed.Vs} digits={1} />} unit="V" />
        <MiniReadout label="I_p" value={<Num value={computed.Ip} digits={2} />} unit="A" />
        <MiniReadout
          label="I_shared"
          value={<Num value={computed.Ishared} digits={2} />}
          unit="A"
        />
        <MiniReadout
          label="copper vs 2-w."
          value={<Num value={computed.copperRatio * 100} digits={1} />}
          unit="%"
        />
        <MiniReadout
          label="copper saved"
          value={<Num value={computed.copperSaving * 100} digits={1} />}
          unit="%"
        />
      </DemoControls>
    </Demo>
  );
}
