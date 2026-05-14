/**
 * Demo D19.8 — Flyback converter
 *
 * The canonical isolated SMPS topology. A single magnetic component is
 * both a transformer (for galvanic isolation) and a coupled inductor
 * (for energy storage):
 *
 *   On-time:   primary switch closed → V_in across primary
 *              → primary current ramps up, storing energy in the
 *                magnetising inductance. The secondary diode is reverse-
 *                biased (note the dot convention), so the secondary winding
 *                carries no current.
 *   Off-time:  primary switch opens. The primary current can't change
 *              instantly, so the magnetic energy flips polarity, the
 *              secondary diode conducts, and the stored energy is
 *              transferred to the output cap.
 *
 * Animated: arrows on each side during on/off phase. Bar chart of stored
 * energy in the core's magnetising inductance.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';

interface Props { figure?: string }

const F_SW = 100e3;       // 100 kHz typical flyback frequency
const Lp   = 200e-6;      // 200 µH primary magnetising inductance
const ETA  = 0.88;        // typical flyback efficiency

export function FlybackConverterDemo({ figure }: Props) {
  const [Vin, setVin]   = useState(325);    // 325 V = peak of rectified 230 V mains
  const [duty, setDuty] = useState(0.45);
  const [turnsN, setTurnsN] = useState(10); // primary:secondary turns ratio n = Np/Ns

  const computed = useMemo(() => {
    // Discontinuous-conduction-mode flyback output voltage:
    // V_out (DCM) = V_in · D · sqrt(T_sw / (2 · L_p · I_out / V_in))   — depends on load
    // For the demo, use the simpler CCM result:
    //   V_out = (D / (1 − D)) · (V_in / n)
    const Vout = (duty / Math.max(1 - duty, 0.01)) * (Vin / turnsN);
    const Tsw = 1 / F_SW;
    const tOn = duty * Tsw;
    const Ipk = Vin * tOn / Lp;
    const E_stored = 0.5 * Lp * Ipk * Ipk;     // energy per cycle stored in core
    const Pout = E_stored * F_SW * ETA;        // average output power
    const Iout = Pout / Math.max(Vout, 0.1);
    return { Vout, Iout, Ipk, E_stored, Pout, Tsw, tOn };
  }, [Vin, duty, turnsN]);

  const stateRef = useRef({ ...computed, duty });
  useEffect(() => { stateRef.current = { ...computed, duty }; }, [computed, duty]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, colors } = info;
    let raf = 0;
    let t0 = performance.now();

    function draw() {
      const { Vout, Ipk, E_stored, duty } = stateRef.current;
      const t = (performance.now() - t0) / 1000;
      // Visual cycle ~1 Hz (the real one is 100 kHz; this is purely
      // for animation).
      const phi = (t * 1.0) % 1;
      const onPhase = phi < duty;
      // Linear ramp of stored energy during on; linear release during off
      let storedFrac: number;
      if (onPhase) storedFrac = phi / duty;
      else storedFrac = 1 - (phi - duty) / Math.max(1 - duty, 0.01);

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      // Transformer in the middle
      const coreCX = w * 0.5;
      const coreTop = h * 0.22;
      const coreBot = h * 0.78;
      const pX = coreCX - 30;
      const sX = coreCX + 30;

      // Iron/ferrite core
      ctx.strokeStyle = 'rgba(160,158,149,0.50)';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(pX, coreTop); ctx.lineTo(pX, coreBot);
      ctx.moveTo(sX, coreTop); ctx.lineTo(sX, coreBot);
      ctx.moveTo(pX, coreTop); ctx.lineTo(sX, coreTop);
      ctx.moveTo(pX, coreBot); ctx.lineTo(sX, coreBot);
      ctx.stroke();
      // Gap (typical of a flyback)
      ctx.strokeStyle = '#0d0d10';
      ctx.beginPath();
      ctx.moveTo(pX - 3, (coreTop + coreBot) / 2);
      ctx.lineTo(pX + 3, (coreTop + coreBot) / 2);
      ctx.stroke();

      // Primary winding (left of left leg)
      drawWinding(ctx, pX - 6, coreTop + 10, coreBot - 10, 12, 'rgba(255,107,42,0.95)', 'left');
      drawWinding(ctx, sX + 6, coreTop + 10, coreBot - 10, 6,  'rgba(108,197,194,0.95)', 'right');

      // Primary side: switch + V_in below
      const pCX = pX - 60;
      ctx.strokeStyle = colors.borderStrong;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pX - 6, coreTop + 10); ctx.lineTo(pCX, coreTop + 10);
      ctx.moveTo(pX - 6, coreBot - 10); ctx.lineTo(pCX, coreBot - 10);
      ctx.stroke();

      // V_in label
      ctx.fillStyle = colors.accent;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillText('V_in', pCX - 2, (coreTop + coreBot) / 2);

      // SW indicator on primary line
      ctx.fillStyle = onPhase ? 'rgba(255,107,42,0.95)' : 'rgba(160,158,149,0.45)';
      ctx.fillRect(pCX + 4, coreBot - 16, 14, 12);
      ctx.fillStyle = colors.bg;
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(onPhase ? 'ON' : 'off', pCX + 11, coreBot - 10);

      // Secondary side: diode + cap + load
      const sCX = sX + 60;
      ctx.strokeStyle = colors.borderStrong;
      ctx.beginPath();
      ctx.moveTo(sX + 6, coreTop + 10); ctx.lineTo(sCX, coreTop + 10);
      ctx.moveTo(sX + 6, coreBot - 10); ctx.lineTo(sCX, coreBot - 10);
      ctx.stroke();

      // Diode (triangle + bar)
      const dY = coreTop + 10;
      const dCol = onPhase ? 'rgba(160,158,149,0.35)' : 'rgba(108,197,194,0.95)';
      ctx.fillStyle = dCol;
      ctx.beginPath();
      ctx.moveTo(sCX - 8, dY - 5);
      ctx.lineTo(sCX - 8, dY + 5);
      ctx.lineTo(sCX,     dY);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = dCol;
      ctx.beginPath();
      ctx.moveTo(sCX, dY - 5); ctx.lineTo(sCX, dY + 5);
      ctx.stroke();

      // V_out label
      ctx.fillStyle = colors.teal;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(`V_out = ${Vout.toFixed(1)} V`, sCX + 6, (coreTop + coreBot) / 2);

      // Arrows showing energy flow direction
      ctx.fillStyle = onPhase ? 'rgba(255,107,42,0.95)' : 'rgba(255,255,255,0.10)';
      // Primary arrow (downward — energy in)
      drawArrowDown(ctx, pX - 18, coreTop + 30, 14);
      ctx.fillStyle = !onPhase ? 'rgba(108,197,194,0.95)' : 'rgba(255,255,255,0.10)';
      // Secondary arrow (upward — energy out)
      drawArrowUp(ctx, sX + 18, coreBot - 30, 14);

      // Phase label
      ctx.fillStyle = colors.textDim;
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText(onPhase ? 'ON  —  storing energy in L_p' : 'OFF  —  dumping into C_out', w / 2, 6);

      // Stored energy bar (right side)
      const barX = w - 28;
      const barH = h * 0.6;
      const barTop = (h - barH) / 2;
      ctx.strokeStyle = 'rgba(160,158,149,0.30)';
      ctx.lineWidth = 1;
      ctx.strokeRect(barX, barTop, 14, barH);
      ctx.fillStyle = 'rgba(255,107,42,0.65)';
      const fillH = barH * Math.max(0, Math.min(1, storedFrac));
      ctx.fillRect(barX, barTop + barH - fillH, 14, fillH);
      ctx.fillStyle = 'rgba(160,158,149,0.75)';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      ctx.fillText('½L·I²', barX + 7, barTop - 2);

      // n:1 ratio label
      ctx.fillStyle = 'rgba(160,158,149,0.70)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText(`turns ratio n = N_p/N_s`, w / 2, h - 18);

      // Isolation barrier (dashed vertical line through the core)
      ctx.strokeStyle = colors.borderStrong;
      ctx.setLineDash([3, 4]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(coreCX, 22); ctx.lineTo(coreCX, h - 26);
      ctx.stroke();
      ctx.setLineDash([]);

      // I_pk readout above
      ctx.fillStyle = 'rgba(160,158,149,0.65)';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText(`I_pk = ${Ipk.toFixed(2)} A,  E/cycle = ${(E_stored * 1e6).toFixed(1)} µJ`,
        6, h - 16);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 19.8'}
      title="Flyback: one magnet, two phases"
      question="Watch the energy bar. The primary fills the core; the secondary empties it. The transformer never carries both sides at once."
      caption={<>
        A flyback uses a coupled inductor as both energy store and isolation barrier. On-time: primary
        switch closed, current ramps as V<sub>in</sub>/L<sub>p</sub>, energy accumulates as ½ L<sub>p</sub> I². Off-time: switch opens, the
        magnetic field collapses, the secondary diode conducts, and the stored energy is delivered into
        the output cap through the isolated secondary winding. Output voltage (CCM, ideal):
        <strong> V<sub>out</sub> = (D / (1 − D)) · V<sub>in</sub> / n</strong>, where n = N<sub>p</sub>/N<sub>s</sub>. This is the
        topology inside almost every USB charger above ~5 W.
      </>}
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="V_in (rect.)"
          value={Vin} min={50} max={400} step={5}
          format={v => Math.round(v) + ' V'}
          onChange={setVin}
        />
        <MiniSlider
          label="duty D"
          value={duty} min={0.10} max={0.80} step={0.01}
          format={v => (v * 100).toFixed(0) + ' %'}
          onChange={setDuty}
        />
        <MiniSlider
          label="n = N_p/N_s"
          value={turnsN} min={2} max={30} step={1}
          format={v => `${Math.round(v)} : 1`}
          onChange={v => setTurnsN(Math.round(v))}
        />
        <MiniReadout label="V_out"        value={<Num value={computed.Vout} digits={1} />}    unit="V" />
        <MiniReadout label="I_out (avg)"  value={<Num value={computed.Iout} digits={2} />}    unit="A" />
        <MiniReadout label="I_pk primary" value={<Num value={computed.Ipk} digits={2} />}     unit="A" />
        <MiniReadout label="P_out"        value={<Num value={computed.Pout} digits={2} />}    unit="W" />
      </DemoControls>
    </Demo>
  );
}

function drawWinding(
  ctx: CanvasRenderingContext2D,
  cx: number, yTop: number, yBot: number, turns: number, color: string,
  side: 'left' | 'right',
) {
  const dy = (yBot - yTop) / turns;
  for (let i = 0; i < turns; i++) {
    const y = yTop + (i + 0.5) * dy;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    if (side === 'left') {
      ctx.ellipse(cx, y, 10, dy * 0.45, 0, Math.PI / 2, 3 * Math.PI / 2);
    } else {
      ctx.ellipse(cx, y, 10, dy * 0.45, 0, -Math.PI / 2, Math.PI / 2);
    }
    ctx.stroke();
  }
}

function drawArrowDown(ctx: CanvasRenderingContext2D, x: number, y: number, h: number) {
  ctx.beginPath();
  ctx.moveTo(x - 4, y);
  ctx.lineTo(x + 4, y);
  ctx.lineTo(x + 4, y + h - 6);
  ctx.lineTo(x + 8, y + h - 6);
  ctx.lineTo(x,     y + h);
  ctx.lineTo(x - 8, y + h - 6);
  ctx.lineTo(x - 4, y + h - 6);
  ctx.closePath();
  ctx.fill();
}
function drawArrowUp(ctx: CanvasRenderingContext2D, x: number, y: number, h: number) {
  ctx.beginPath();
  ctx.moveTo(x - 4, y);
  ctx.lineTo(x + 4, y);
  ctx.lineTo(x + 4, y - h + 6);
  ctx.lineTo(x + 8, y - h + 6);
  ctx.lineTo(x,     y - h);
  ctx.lineTo(x - 8, y - h + 6);
  ctx.lineTo(x - 4, y - h + 6);
  ctx.closePath();
  ctx.fill();
}
