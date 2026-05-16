/**
 * Demo D18.1 — Two-coil transformer with a load
 *
 * Iron core in the middle, primary winding on the left, secondary on the
 * right, with a resistive load across the secondary. AC source drives the
 * primary. Visualises the shared flux Φ in the core, the primary and
 * secondary currents, and reports V_s, I_p, I_s.
 *
 * Sliders: N_p, N_s, V_p (peak), R_load.
 * Ideal-transformer math (no losses): V_s/V_p = N_s/N_p, I_p = (N_s/N_p) I_s.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';
import { getCanvasColors } from '@/lib/canvasTheme';

interface Props {
  figure?: string;
}

export function TwoCoilTransformerDemo({ figure }: Props) {
  const [Np, setNp] = useState(200);
  const [Ns, setNs] = useState(40);
  const [Vp, setVp] = useState(170); // peak primary voltage (170 V ≈ 120 V_rms)
  const [Rload, setRload] = useState(20); // ohms

  const stateRef = useRef({ Np, Ns, Vp, Rload });
  useEffect(() => {
    stateRef.current = { Np, Ns, Vp, Rload };
  }, [Np, Ns, Vp, Rload]);

  const computed = useMemo(() => {
    const ratio = Ns / Np;
    const Vs = Vp * ratio;
    const Is = Vs / Rload;
    const Ip = Is * ratio; // = Is·N_s/N_p
    const Pload = (Vs * Is) / 2; // average power (sinusoid, V_s and I_s in phase)
    return { ratio, Vs, Is, Ip, Pload };
  }, [Np, Ns, Vp, Rload]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h } = info;
    let raf = 0;
    const t0 = performance.now();

    function draw() {
      const { Np, Ns, Vp, Rload } = stateRef.current;
      const ratio = Ns / Np;
      const Vs = Vp * ratio;
      const Is = Vs / Rload;
      const t = (performance.now() - t0) / 1000;
      const omega = 2 * Math.PI * 1.4; // 1.4 Hz visual

      ctx.fillStyle = getCanvasColors().bg;
      ctx.fillRect(0, 0, w, h);

      const coreLeft = w * 0.22;
      const coreRight = w * 0.78;
      const coreTop = h * 0.22;
      const coreBot = h * 0.78;
      const coreThick = 18;

      // Iron core: rectangular toroid, hatched to suggest laminations
      ctx.strokeStyle = 'rgba(160,158,149,0.45)';
      ctx.lineWidth = 1.4;
      ctx.strokeRect(coreLeft, coreTop, coreRight - coreLeft, coreBot - coreTop);
      ctx.strokeRect(
        coreLeft + coreThick,
        coreTop + coreThick,
        coreRight - coreLeft - 2 * coreThick,
        coreBot - coreTop - 2 * coreThick,
      );
      ctx.strokeStyle = 'rgba(160,158,149,0.18)';
      ctx.lineWidth = 0.6;
      for (let x = coreLeft + 4; x < coreRight - 4; x += 7) {
        ctx.beginPath();
        ctx.moveTo(x, coreTop + 2);
        ctx.lineTo(x, coreTop + coreThick - 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, coreBot - coreThick + 2);
        ctx.lineTo(x, coreBot - 2);
        ctx.stroke();
      }

      const primX = coreLeft;
      const secX = coreRight;
      const cy = (coreTop + coreBot) / 2;
      const halfH = (coreBot - coreTop - 2 * coreThick) * 0.42;

      drawCoil(ctx, primX, cy, coreThick, halfH, Math.min(20, Math.max(4, Math.round(Np / 14))));
      drawCoil(ctx, secX, cy, coreThick, halfH, Math.min(20, Math.max(4, Math.round(Ns / 14))));

      // Flux animation — tracer dots circulating CCW around the core
      const fluxAmp = Math.abs(Vp) / Math.max(Np, 1);
      const intensity = Math.min(1, fluxAmp / 1.5);
      const cw = coreRight - coreLeft - coreThick;
      const ch = coreBot - coreTop - coreThick;
      const perim = 2 * (cw + ch);
      const cxL = coreLeft + coreThick / 2;
      const cxR = coreRight - coreThick / 2;
      const cyT = coreTop + coreThick / 2;
      const cyB = coreBot - coreThick / 2;
      const sign = Math.sin(omega * t);
      const speed = 0.25 + intensity * 0.9;
      const ntracers = 16;
      for (let i = 0; i < ntracers; i++) {
        const u = (((i / ntracers + sign * speed * t) % 1) + 1) % 1;
        const s = u * perim;
        let px = 0,
          py = 0;
        if (s < cw) {
          px = cxL + s;
          py = cyT;
        } else if (s < cw + ch) {
          px = cxR;
          py = cyT + (s - cw);
        } else if (s < 2 * cw + ch) {
          px = cxR - (s - cw - ch);
          py = cyB;
        } else {
          px = cxL;
          py = cyB - (s - 2 * cw - ch);
        }
        const a = 0.25 + intensity * 0.7;
        ctx.fillStyle = `rgba(108,197,194,${a})`;
        ctx.beginPath();
        ctx.arc(px, py, 2.6, 0, Math.PI * 2);
        ctx.fill();
      }

      // AC source on the left
      const srcX = coreLeft - 50;
      const srcY = cy;
      ctx.strokeStyle = getCanvasColors().accent;
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
      ctx.strokeStyle = getCanvasColors().borderStrong;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(srcX + 16, srcY - 8);
      ctx.lineTo(primX - 22, srcY - 8);
      ctx.lineTo(primX - 22, cy - halfH);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(srcX + 16, srcY + 8);
      ctx.lineTo(primX - 22, srcY + 8);
      ctx.lineTo(primX - 22, cy + halfH);
      ctx.stroke();

      // Load resistor on the right
      const loadX = coreRight + 50;
      const loadY = cy;
      ctx.strokeStyle = getCanvasColors().teal;
      ctx.lineWidth = 1.4;
      // Zigzag resistor symbol
      ctx.beginPath();
      const zx = loadX - 14;
      ctx.moveTo(zx, loadY - 14);
      for (let k = 0; k < 6; k++) {
        ctx.lineTo(zx + (k % 2 === 0 ? 14 : 0), loadY - 14 + ((k + 1) * 28) / 6);
      }
      ctx.lineTo(zx, loadY + 14);
      ctx.stroke();
      ctx.strokeStyle = getCanvasColors().borderStrong;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(secX + 22, cy - halfH);
      ctx.lineTo(secX + 22, loadY - 14);
      ctx.lineTo(loadX - 14, loadY - 14);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(secX + 22, cy + halfH);
      ctx.lineTo(secX + 22, loadY + 14);
      ctx.lineTo(loadX - 14, loadY + 14);
      ctx.stroke();

      // Labels
      ctx.fillStyle = getCanvasColors().accent;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(`N_p = ${Np}`, primX, coreBot + 6);
      ctx.fillText(`V_p = ${Vp.toFixed(0)} V`, srcX, srcY + 26);
      ctx.fillStyle = getCanvasColors().teal;
      ctx.fillText(`N_s = ${Ns}`, secX, coreBot + 6);
      ctx.fillText(`V_s = ${Vs.toFixed(1)} V`, loadX, loadY + 26);
      ctx.fillText(`R = ${Rload.toFixed(0)} Ω`, loadX, loadY + 40);

      ctx.fillStyle = getCanvasColors().textDim;
      ctx.textAlign = 'center';
      ctx.fillText('iron core · shared Φ(t)', (coreLeft + coreRight) / 2, coreTop - 14);

      // I_s indicator on secondary loop
      const isInt = Math.min(1, Math.abs(Is) / 8);
      const isCol = `rgba(255,107,42,${0.3 + 0.7 * isInt})`;
      ctx.strokeStyle = isCol;
      ctx.lineWidth = 1.4;
      ctx.fillStyle = isCol;
      // arrow on top secondary wire pointing right
      const arrY = cy - halfH - 6;
      const arrX = (secX + 22 + loadX - 14) / 2;
      ctx.beginPath();
      ctx.moveTo(arrX - 5, arrY);
      ctx.lineTo(arrX + 5, arrY);
      ctx.lineTo(arrX, arrY - 4);
      ctx.lineTo(arrX, arrY + 4);
      ctx.lineTo(arrX + 5, arrY);
      ctx.closePath();
      ctx.stroke();

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 18.1'}
      title="Two coils, one core, a loaded secondary"
      question="Move N_p, N_s, V_p, R_load. Watch where the power goes."
      caption={
        <>
          Both windings link the same flux Φ. Faraday's law on each coil gives
          <strong> V_p = N_p dΦ/dt</strong> and <strong>V_s = N_s dΦ/dt</strong>, so
          <strong> V_s/V_p = N_s/N_p</strong>. Power balance (lossless) makes I_p track I_s the
          other way around:
          <strong> I_p/I_s = N_s/N_p</strong>. All four sliders are independent inputs; the readouts
          are derived.
        </>
      }
      deeperLab={{ slug: 'inductance', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="N_p"
          value={Np}
          min={10}
          max={500}
          step={1}
          format={(v) => Math.round(v).toString()}
          onChange={(v) => setNp(Math.max(1, Math.round(v)))}
        />
        <MiniSlider
          label="N_s"
          value={Ns}
          min={1}
          max={500}
          step={1}
          format={(v) => Math.round(v).toString()}
          onChange={(v) => setNs(Math.max(1, Math.round(v)))}
        />
        <MiniSlider
          label="V_p,peak"
          value={Vp}
          min={0}
          max={400}
          step={1}
          format={(v) => Math.round(v) + ' V'}
          onChange={setVp}
        />
        <MiniSlider
          label="R_load"
          value={Rload}
          min={1}
          max={200}
          step={1}
          format={(v) => Math.round(v) + ' Ω'}
          onChange={setRload}
        />
        <MiniReadout label="V_s,peak" value={<Num value={computed.Vs} digits={2} />} unit="V" />
        <MiniReadout label="I_s,peak" value={<Num value={computed.Is} digits={2} />} unit="A" />
        <MiniReadout label="I_p,peak" value={<Num value={computed.Ip} digits={3} />} unit="A" />
        <MiniReadout
          label="P_load,avg"
          value={<Num value={computed.Pload} digits={2} />}
          unit="W"
        />
      </DemoControls>
    </Demo>
  );
}

function drawCoil(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  armHalf: number,
  halfH: number,
  turns: number,
) {
  const yTop = cy - halfH;
  const yBot = cy + halfH;
  const dy = (yBot - yTop) / turns;
  const r = dy * 0.42;
  for (let i = 0; i < turns; i++) {
    const y = yTop + (i + 0.5) * dy;
    ctx.strokeStyle = 'rgba(255,107,42,0.4)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(cx, y, armHalf + 3, r, 0, Math.PI, 2 * Math.PI);
    ctx.stroke();
    ctx.strokeStyle = getCanvasColors().accent;
    ctx.beginPath();
    ctx.ellipse(cx, y, armHalf + 3, r, 0, 0, Math.PI);
    ctx.stroke();
  }
}
