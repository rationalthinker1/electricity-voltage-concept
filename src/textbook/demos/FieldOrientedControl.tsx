/**
 * Demo D16.8 — Field-oriented control (Clarke + Park transforms)
 *
 * Three-phase stator currents i_a(t), i_b(t), i_c(t), 120° apart, are
 * decomposed by the controller into:
 *   • i_α, i_β   = Clarke (3-phase → 2-axis stationary frame)
 *   • i_d, i_q   = Park   (rotate by rotor angle θ_e; rotor-aligned frame)
 *
 * In the d-q frame, i_d is flux-producing and i_q is torque-producing.
 * Reader changes the demanded i_q (torque); the controller computes the
 * required i_a/i_b/i_c. Two synchronised panels: instantaneous abc on
 * the left, d-q on the right.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';

interface Props { figure?: string }

const F_ELEC = 50;   // Hz — electrical frequency of the rotor

export function FieldOrientedControlDemo({ figure }: Props) {
  const [iqRef, setIqRef] = useState(8);   // demanded torque current, A
  const [idRef, setIdRef] = useState(0);   // demanded flux current, A (0 for surface PMSM)

  const stateRef = useRef({ iqRef, idRef });
  useEffect(() => { stateRef.current = { iqRef, idRef }; }, [iqRef, idRef]);

  // Stator-current magnitude required:
  // |I_s| = sqrt(i_d² + i_q²);   torque ∝ i_q (in rotor-aligned frame)
  const computed = useMemo(() => {
    const iMag = Math.sqrt(idRef * idRef + iqRef * iqRef);
    // Normalised torque (per-unit). Torque ∝ i_q for a surface PMSM.
    const tauPU = iqRef / 10;  // 10 A → 1 pu
    return { iMag, tauPU };
  }, [iqRef, idRef]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, colors } = info;
    let raf = 0;
    let t0 = performance.now();

    function draw() {
      const now = performance.now();
      const t = (now - t0) / 1000;

      const { iqRef, idRef } = stateRef.current;

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      const padT = 18, padB = 18, padL = 16, padR = 16;
      const gap = 12;
      const colW = (w - padL - padR - gap) / 2;
      const plotH = h - padT - padB;

      // Inverse Park: given i_d, i_q and angle θ_e, compute α/β
      const omegaE = 2 * Math.PI * F_ELEC;
      const winT = 1 / F_ELEC * 2;  // 2 periods in window
      // We'll plot a small time window centred on "now":  t-winT .. t

      function abc(tau: number) {
        const theta = omegaE * tau;
        // Inverse Park
        const iAlpha = idRef * Math.cos(theta) - iqRef * Math.sin(theta);
        const iBeta  = idRef * Math.sin(theta) + iqRef * Math.cos(theta);
        // Inverse Clarke (amplitude-invariant)
        const ia = iAlpha;
        const ib = -0.5 * iAlpha + (Math.sqrt(3) / 2) * iBeta;
        const ic = -0.5 * iAlpha - (Math.sqrt(3) / 2) * iBeta;
        return { ia, ib, ic, iAlpha, iBeta };
      }

      // Y-axis ranges
      const aMax = Math.max(12, Math.sqrt(idRef * idRef + iqRef * iqRef) * 1.4);

      // ------- Left panel: i_a, i_b, i_c ----------
      const x0L = padL, y0 = padT;
      ctx.strokeStyle = colors.border;
      ctx.strokeRect(x0L, y0, colW, plotH);
      ctx.strokeStyle = colors.border;
      for (let g = 1; g < 4; g++) {
        const yg = y0 + (g / 4) * plotH;
        ctx.beginPath(); ctx.moveTo(x0L, yg); ctx.lineTo(x0L + colW, yg); ctx.stroke();
      }
      // Zero line
      ctx.strokeStyle = colors.borderStrong;
      ctx.beginPath();
      ctx.moveTo(x0L, y0 + plotH / 2); ctx.lineTo(x0L + colW, y0 + plotH / 2);
      ctx.stroke();

      const phaseColors = ['#ff6b2a', '#5baef8', '#6cc5c2'];
      const N = 160;
      for (let phase = 0; phase < 3; phase++) {
        ctx.strokeStyle = phaseColors[phase];
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        for (let i = 0; i <= N; i++) {
          const tt = t - winT + (i / N) * winT;
          const { ia, ib, ic } = abc(tt);
          const v = phase === 0 ? ia : phase === 1 ? ib : ic;
          const x = x0L + (i / N) * colW;
          const y = y0 + plotH / 2 - (v / aMax) * (plotH / 2 - 4);
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Title
      ctx.fillStyle = colors.textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText('stator: i_a, i_b, i_c   (3-phase)', x0L + 6, y0 + 4);

      // ------- Right panel: i_d, i_q ----------
      const x0R = padL + colW + gap;
      ctx.strokeStyle = colors.border;
      ctx.strokeRect(x0R, y0, colW, plotH);
      ctx.strokeStyle = colors.border;
      for (let g = 1; g < 4; g++) {
        const yg = y0 + (g / 4) * plotH;
        ctx.beginPath(); ctx.moveTo(x0R, yg); ctx.lineTo(x0R + colW, yg); ctx.stroke();
      }
      ctx.strokeStyle = colors.borderStrong;
      ctx.beginPath();
      ctx.moveTo(x0R, y0 + plotH / 2); ctx.lineTo(x0R + colW, y0 + plotH / 2);
      ctx.stroke();

      // i_d (flat) — pink
      ctx.strokeStyle = colors.pink;
      ctx.lineWidth = 2;
      ctx.beginPath();
      const yId = y0 + plotH / 2 - (idRef / aMax) * (plotH / 2 - 4);
      ctx.moveTo(x0R, yId); ctx.lineTo(x0R + colW, yId);
      ctx.stroke();
      // i_q (flat) — amber
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      const yIq = y0 + plotH / 2 - (iqRef / aMax) * (plotH / 2 - 4);
      ctx.moveTo(x0R, yIq); ctx.lineTo(x0R + colW, yIq);
      ctx.stroke();

      // Labels right panel
      ctx.fillStyle = colors.textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText('rotor-aligned: i_d, i_q   (d-q frame)', x0R + 6, y0 + 4);
      ctx.fillStyle = colors.accent;
      ctx.textAlign = 'right';
      ctx.fillText(`i_q = ${iqRef.toFixed(1)} A  (torque)`, x0R + colW - 6, yIq - 12);
      ctx.fillStyle = colors.pink;
      ctx.fillText(`i_d = ${idRef.toFixed(1)} A  (flux)`, x0R + colW - 6, yId + 4);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 16.8'}
      title="Field-oriented control: 3-phase becomes 2-axis"
      question="How does an EV inverter turn three messy AC stator currents into clean torque and flux knobs?"
      caption={<>
        Clarke (3-phase → α-β) and Park (α-β → d-q, rotated by the rotor angle θ_e) transforms decouple the stator
        current vector into <em>i_d</em> (flux-producing, kept at zero for a surface PMSM) and <em>i_q</em> (torque-
        producing). Two PI loops control them independently — exactly as if the AC machine were a brushed DC motor.
        Every modern EV traction inverter runs this control law at roughly 10 kHz.
      </>}
      deeperLab={{ slug: 'lorentz', label: 'See Lorentz lab' }}
    >
      <AutoResizeCanvas height={260} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="i_q (torque cmd)"
          value={iqRef} min={-10} max={10} step={0.5}
          format={v => v.toFixed(1) + ' A'}
          onChange={setIqRef}
        />
        <MiniSlider
          label="i_d (flux cmd)"
          value={idRef} min={-5} max={5} step={0.5}
          format={v => v.toFixed(1) + ' A'}
          onChange={setIdRef}
        />
        <MiniReadout label="|I_s|" value={<Num value={computed.iMag} digits={2} />} unit="A" />
        <MiniReadout label="τ / τ_rated" value={computed.tauPU.toFixed(2)} />
      </DemoControls>
    </Demo>
  );
}
