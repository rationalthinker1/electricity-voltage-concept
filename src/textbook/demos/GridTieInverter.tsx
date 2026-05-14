/**
 * Demo D19.6 — Grid-tie inverter: real and reactive power
 *
 * The grid is a stiff sinusoidal voltage source: V_grid(t) = V cos(2πft).
 * The inverter injects a current I_inj(t) = I cos(2πft − θ). The
 * time-average powers are:
 *
 *   P (real)     = ½ V I cos(θ)        — Watts delivered to grid
 *   Q (reactive) = ½ V I sin(θ)        — VAR sloshing back and forth
 *   S (apparent) = ½ V I                — total VA the inverter handles
 *
 * (Factor of ½ because V and I are peak; in RMS the ½ disappears.)
 *
 * The reader varies I (driven by available DC power) and θ (the
 * inverter's chosen current-phase angle, set by the firmware).
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';

interface Props { figure?: string }

const F_GRID = 60;
const V_PK = 339.4;     // 240 V_rms × √2

export function GridTieInverterDemo({ figure }: Props) {
  const [Ipk, setIpk] = useState(20);          // A peak
  const [thetaDeg, setThetaDeg] = useState(0); // degrees, current phase

  const theta = (thetaDeg * Math.PI) / 180;
  // RMS values: V_rms = V_PK / √2, I_rms = Ipk / √2
  const Vrms = V_PK / Math.sqrt(2);
  const Irms = Ipk / Math.sqrt(2);
  const P = Vrms * Irms * Math.cos(theta);
  const Q = Vrms * Irms * Math.sin(theta);
  const S = Vrms * Irms;
  const pf = Math.cos(theta);

  const stateRef = useRef({ Ipk, thetaDeg, P, Q });
  useEffect(() => { stateRef.current = { Ipk, thetaDeg, P, Q }; }, [Ipk, thetaDeg, P, Q]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, colors } = info;
    let raf = 0;
    let phase = 0;

    function draw() {
      const { Ipk, thetaDeg } = stateRef.current;
      const theta = (thetaDeg * Math.PI) / 180;
      phase += 0.012;

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      const padL = 50, padR = 80, padT = 18, padB = 28;
      const plotW = w - padL - padR;
      const plotH = h - padT - padB;
      const cy = padT + plotH / 2;

      ctx.strokeStyle = colors.border;
      ctx.strokeRect(padL, padT, plotW, plotH);
      ctx.beginPath();
      ctx.moveTo(padL, cy); ctx.lineTo(padL + plotW, cy);
      ctx.stroke();

      const tWindow = 2 / F_GRID;
      const samples = 600;
      const vScale = (plotH / 2 - 8) / V_PK;
      const iScale = (plotH / 2 - 8) / Math.max(Ipk, 1);
      const pScale = (plotH / 2 - 8) / (V_PK * Math.max(Ipk, 1));

      // Grid V(t): white
      ctx.strokeStyle = 'rgba(236,235,229,0.80)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i <= samples; i++) {
        const t = (i / samples) * tWindow;
        const v = V_PK * Math.cos(2 * Math.PI * F_GRID * t + phase);
        const x = padL + (i / samples) * plotW;
        const y = cy - v * vScale;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Inverter current I(t): amber
      ctx.strokeStyle = 'rgba(255,107,42,1.0)';
      ctx.lineWidth = 1.7;
      ctx.beginPath();
      for (let i = 0; i <= samples; i++) {
        const t = (i / samples) * tWindow;
        const ii = Ipk * Math.cos(2 * Math.PI * F_GRID * t + phase - theta);
        const x = padL + (i / samples) * plotW;
        const y = cy - ii * iScale;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Instantaneous power p(t) = V(t) · I(t) — teal, filled.
      ctx.fillStyle = 'rgba(108,197,194,0.18)';
      ctx.beginPath();
      ctx.moveTo(padL, cy);
      for (let i = 0; i <= samples; i++) {
        const t = (i / samples) * tWindow;
        const v = V_PK * Math.cos(2 * Math.PI * F_GRID * t + phase);
        const ii = Ipk * Math.cos(2 * Math.PI * F_GRID * t + phase - theta);
        const p = v * ii;
        const x = padL + (i / samples) * plotW;
        const y = cy - p * pScale;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(padL + plotW, cy);
      ctx.closePath();
      ctx.fill();

      // Legend
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      const lx = padL + plotW + 8;
      ctx.fillStyle = colors.text;
      ctx.fillRect(lx, padT + 8 - 1, 10, 2); ctx.fillText('V_grid',   lx + 14, padT + 8);
      ctx.fillStyle = 'rgba(255,107,42,1.0)';
      ctx.fillRect(lx, padT + 24 - 1, 10, 2); ctx.fillText('I_inj',   lx + 14, padT + 24);
      ctx.fillStyle = 'rgba(108,197,194,0.6)';
      ctx.fillRect(lx, padT + 40 - 2, 10, 4); ctx.fillText('p(t)',    lx + 14, padT + 40);

      // Phase / power readout
      ctx.fillStyle = colors.textDim;
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText(
        `θ = ${thetaDeg.toFixed(0)}°   ·   cos θ = ${Math.cos(theta).toFixed(2)}`,
        padL + plotW / 2, padT + plotH + 6
      );

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 19.6'}
      title="Grid-tie inverter: P, Q, and the current phase"
      question="The grid voltage is fixed. The inverter chooses how much current to inject and at what phase. What does each knob do?"
      caption={<>
        Inject current in phase with the grid voltage (θ = 0) and you deliver pure real power
        — every joule your panels make ends up on the line. Push the current 90° out of phase
        and you deliver pure reactive power — useful for stabilising sagging grid voltage but
        no real energy transferred. Real grid-tie inverters track the grid's phase continuously
        and can be commanded to mix the two.
      </>}
    >
      <AutoResizeCanvas height={280} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="I peak"
          value={Ipk} min={0.5} max={40} step={0.5}
          format={v => v.toFixed(1) + ' A'}
          onChange={setIpk}
        />
        <MiniSlider
          label="phase θ"
          value={thetaDeg} min={-90} max={90} step={1}
          format={v => v.toFixed(0) + '°'}
          onChange={setThetaDeg}
        />
        <MiniReadout label="P (real)"      value={<Num value={P} />} unit="W" />
        <MiniReadout label="Q (reactive)"  value={<Num value={Q} />} unit="VAR" />
        <MiniReadout label="S (apparent)"  value={<Num value={S} />} unit="VA" />
        <MiniReadout label="power factor"  value={pf.toFixed(3)} />
      </DemoControls>
    </Demo>
  );
}
