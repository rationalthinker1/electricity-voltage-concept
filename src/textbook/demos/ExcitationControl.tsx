/**
 * Demo D17.6 — Excitation control and V curves
 *
 * Synchronous generator: more rotor field current I_f → more rotor flux →
 * larger induced EMF |E_f| = k_f · I_f. At no load, terminal voltage equals
 * E_f and scales linearly with I_f. Connect to a stiff grid (constant
 * |V_grid|, constant real power P) and the operating point becomes:
 *   P  = (V·E_f / X_s) · sin δ      (real)
 *   Q  = (V·E_f / X_s) · cos δ − V² / X_s   (reactive, at the generator
 *                                            terminal)
 * Reader varies I_f; for fixed P the armature current |I_a| has a
 * V-shaped minimum at the field current that produces unity power factor.
 * Below that → underexcited, draws lagging Q; above → overexcited,
 * supplies lagging Q.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider, MiniToggle } from '@/components/Demo';
import { Num } from '@/components/Num';

interface Props { figure?: string }

const X_S = 1.0;       // pu synchronous reactance
const V_GRID = 1.0;    // pu grid voltage
const K_F = 1.0;       // |E_f| per pu field current

export function ExcitationControlDemo({ figure }: Props) {
  const [iField, setIField] = useState(1.2);  // pu rotor field current
  const [loaded, setLoaded] = useState(true);
  const [pRef, setPRef] = useState(0.6);      // pu real power (when loaded)

  const stateRef = useRef({ iField, loaded, pRef });
  useEffect(() => { stateRef.current = { iField, loaded, pRef }; }, [iField, loaded, pRef]);

  // No-load and loaded cases.
  const computed = useMemo(() => {
    const Ef = K_F * iField;
    if (!loaded) {
      // Open-terminal: V_t = E_f.
      return { Ef, Vt: Ef, P: 0, Q: 0, Ia: 0, deltaDeg: 0, mode: 'no-load' as const };
    }
    // Loaded: V_grid constant; P fixed. Solve δ from P = (V·E_f/X_s) sin δ.
    const sinDelta = (pRef * X_S) / (V_GRID * Ef);
    if (Math.abs(sinDelta) > 1) {
      // Cannot deliver the demanded P with this much excitation — pull out.
      return { Ef, Vt: V_GRID, P: pRef, Q: 0, Ia: NaN, deltaDeg: 90, mode: 'pullout' as const };
    }
    const delta = Math.asin(sinDelta);
    const Q = (V_GRID * Ef / X_S) * Math.cos(delta) - (V_GRID * V_GRID) / X_S;
    const S = Math.sqrt(pRef * pRef + Q * Q);
    const Ia = S / V_GRID;
    return { Ef, Vt: V_GRID, P: pRef, Q, Ia, deltaDeg: (delta * 180) / Math.PI, mode: Q > 0 ? 'over-excited' as const : 'under-excited' as const };
  }, [iField, loaded, pRef]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h } = info;
    let raf = 0;

    function draw() {
      const { iField, loaded, pRef } = stateRef.current;

      ctx.fillStyle = '#0d0d10';
      ctx.fillRect(0, 0, w, h);

      const padL = 56, padR = 24, padT = 22, padB = 38;
      const plotW = w - padL - padR;
      const plotH = h - padT - padB;

      // Frame
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.strokeRect(padL, padT, plotW, plotH);

      // Gridlines
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      for (let i = 1; i < 5; i++) {
        const x = padL + (i / 5) * plotW;
        ctx.beginPath(); ctx.moveTo(x, padT); ctx.lineTo(x, padT + plotH); ctx.stroke();
        const y = padT + (i / 5) * plotH;
        ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + plotW, y); ctx.stroke();
      }

      const ifMin = 0.4, ifMax = 2.5;
      const xAt = (iF: number) => padL + ((iF - ifMin) / (ifMax - ifMin)) * plotW;

      if (!loaded) {
        // No-load: V_t = E_f = K_F·i_F (linear). Plot V_t vs i_F.
        const yMax = K_F * ifMax;
        const yAt = (v: number) => padT + plotH - (v / yMax) * plotH;
        ctx.strokeStyle = '#ff6b2a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i <= 60; i++) {
          const iF = ifMin + (i / 60) * (ifMax - ifMin);
          const Vt = K_F * iF;
          const x = xAt(iF);
          const y = yAt(Vt);
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        // Marker
        ctx.fillStyle = '#ff6b2a';
        ctx.beginPath();
        ctx.arc(xAt(iField), yAt(K_F * iField), 6, 0, Math.PI * 2);
        ctx.fill();
        // Y axis label
        ctx.fillStyle = 'rgba(160,158,149,0.85)';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
        ctx.fillText('|V_t| (pu)', padL - 6, padT + plotH / 2);
        // Title
        ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        ctx.fillText('no-load: |V_t| = |E_f| = k_f · I_field', padL + 6, padT + 4);
      } else {
        // Loaded: V curve — |I_a| vs i_F, for fixed P.
        const yMax = 2.0;
        const yAt = (v: number) => padT + plotH - (v / yMax) * plotH;
        // V curve
        ctx.strokeStyle = '#ff6b2a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        let started = false;
        for (let i = 0; i <= 200; i++) {
          const iF = ifMin + (i / 200) * (ifMax - ifMin);
          const Ef = K_F * iF;
          const sinD = (pRef * X_S) / (V_GRID * Ef);
          if (Math.abs(sinD) > 1) continue;
          const d = Math.asin(sinD);
          const Q = (V_GRID * Ef / X_S) * Math.cos(d) - (V_GRID * V_GRID) / X_S;
          const Ia = Math.sqrt(pRef * pRef + Q * Q) / V_GRID;
          const x = xAt(iF);
          const y = yAt(Math.min(Ia, yMax));
          if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Q = 0 reference (unity power-factor) - dashed horizontal
        // Find min of curve by sampling.
        ctx.strokeStyle = 'rgba(108,197,194,0.5)';
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padL, yAt(pRef)); ctx.lineTo(padL + plotW, yAt(pRef));
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(108,197,194,0.8)';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
        ctx.fillText('|I_a| = P at unity PF', padL + 6, yAt(pRef) - 2);

        // Marker
        const Ef = K_F * iField;
        const sinD = (pRef * X_S) / (V_GRID * Ef);
        if (Math.abs(sinD) <= 1) {
          const d = Math.asin(sinD);
          const Q = (V_GRID * Ef / X_S) * Math.cos(d) - (V_GRID * V_GRID) / X_S;
          const Ia = Math.sqrt(pRef * pRef + Q * Q) / V_GRID;
          ctx.fillStyle = Q > 0 ? '#ff3b6e' : '#5baef8';
          ctx.beginPath();
          ctx.arc(xAt(iField), yAt(Math.min(Ia, yMax)), 6, 0, Math.PI * 2);
          ctx.fill();
        }

        // Y axis label
        ctx.fillStyle = 'rgba(160,158,149,0.85)';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
        ctx.fillText('|I_a| (pu)', padL - 6, padT + plotH / 2);
        // Title
        ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        ctx.fillText(`loaded V-curve: |I_a| vs I_field at P = ${pRef.toFixed(2)} pu`, padL + 6, padT + 4);

        // Region labels
        ctx.fillStyle = 'rgba(91,174,248,0.75)';
        ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
        ctx.fillText('under-excited (Q < 0)', padL + 8, padT + plotH - 6);
        ctx.fillStyle = 'rgba(255,59,110,0.75)';
        ctx.textAlign = 'right';
        ctx.fillText('over-excited (Q > 0)', padL + plotW - 8, padT + plotH - 6);
      }

      // X axis ticks
      ctx.fillStyle = 'rgba(160,158,149,0.85)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      for (let iF = 0.5; iF <= 2.5; iF += 0.5) {
        ctx.fillText(iF.toFixed(1), xAt(iF), padT + plotH + 4);
      }
      ctx.fillText('I_field (pu) →', padL + plotW / 2, padT + plotH + 20);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 17.6'}
      title="Excitation control: how a generator chooses VARs"
      question="Field current sets terminal voltage at no load — and reactive power at a stiff bus. Why the V?"
      caption={<>
        At no load, output voltage scales linearly with rotor field current (the open-circuit characteristic).
        On the grid, real power is fixed by the prime mover; varying field current swings reactive power instead.
        Underexcited → generator absorbs Q (lagging). Overexcited → supplies Q (leading). The V curve is armature
        current at fixed P; its minimum sits at unity power factor.
      </>}
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        <MiniToggle label={loaded ? 'on grid' : 'no load'} checked={loaded} onChange={setLoaded} />
        <MiniSlider
          label="I_field"
          value={iField} min={0.4} max={2.4} step={0.02}
          format={v => v.toFixed(2) + ' pu'}
          onChange={setIField}
        />
        {loaded && (
          <MiniSlider
            label="P real"
            value={pRef} min={0} max={1.0} step={0.05}
            format={v => v.toFixed(2) + ' pu'}
            onChange={setPRef}
          />
        )}
        <MiniReadout label="|E_f|" value={<Num value={computed.Ef} digits={2} />} unit="pu" />
        <MiniReadout label="|V_t|" value={<Num value={computed.Vt} digits={2} />} unit="pu" />
        {loaded && (
          <>
            <MiniReadout label="δ" value={<Num value={computed.deltaDeg} digits={1} />} unit="°" />
            <MiniReadout label="Q" value={<Num value={computed.Q} digits={2} />} unit="pu" />
            <MiniReadout
              label="|I_a|"
              value={Number.isFinite(computed.Ia) ? <Num value={computed.Ia} digits={2} /> : <span>pull-out</span>}
              unit={Number.isFinite(computed.Ia) ? 'pu' : undefined}
            />
          </>
        )}
      </DemoControls>
    </Demo>
  );
}
