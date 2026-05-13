/**
 * Demo D4.3 — Power derating curve
 *
 * Slider for ambient temperature (25–155 °C); y-axis is the allowed
 * dissipation as a fraction of nominal rated power. For most film resistors
 * P_max = 100% up to 70 °C, then derates linearly to 0 at 155 °C.
 *
 * The reader sees: nominal rating (in W), ambient T, allowed dissipation,
 * and a current/voltage scenario that asks "is this resistor cooking?"
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import {
  Demo, DemoControls, MiniReadout, MiniSlider,
} from '@/components/Demo';
import { Num } from '@/components/Num';

interface Props { figure?: string }

// Standard film-resistor derating: 100% to 70 °C, linear to 0 at 155 °C.
// (Some power and wirewound parts hold flat to 25 °C; we use the conservative
// 70-to-155 schedule from typical thru-hole carbon-film / metal-film datasheets.)
const T_KNEE = 70;
const T_ZERO = 155;

function deratingFraction(T_C: number): number {
  if (T_C <= T_KNEE) return 1.0;
  if (T_C >= T_ZERO) return 0.0;
  return 1.0 - (T_C - T_KNEE) / (T_ZERO - T_KNEE);
}

export function PowerDeratingDemo({ figure }: Props) {
  const [T_C, setT] = useState(25);
  // Operating scenario
  const [P_nom, setPnom] = useState(0.25); // W (1/4 W default)
  const [P_actual, setPact] = useState(0.15); // W actually dissipated

  const stateRef = useRef({ T_C, P_nom, P_actual });
  useEffect(() => { stateRef.current = { T_C, P_nom, P_actual }; }, [T_C, P_nom, P_actual]);

  const frac = deratingFraction(T_C);
  const P_allow = P_nom * frac;
  const overload = P_actual > P_allow;

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w: W, h: H } = info;
    let raf = 0;

    function draw() {
      const { T_C, P_nom, P_actual } = stateRef.current;
      ctx.fillStyle = '#0d0d10';
      ctx.fillRect(0, 0, W, H);

      const padL = 50;
      const padR = 24;
      const padT = 26;
      const padB = 36;
      const gW = W - padL - padR;
      const gH = H - padT - padB;

      // Axes
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padL, padT);
      ctx.lineTo(padL, padT + gH);
      ctx.lineTo(padL + gW, padT + gH);
      ctx.stroke();

      // x: T in °C from 0 to 175
      const tMin = 0, tMax = 175;
      const xT = (t: number) => padL + ((t - tMin) / (tMax - tMin)) * gW;
      const yF = (f: number) => padT + (1 - f) * gH;

      // Gridlines / labels
      ctx.fillStyle = 'rgba(160,158,149,0.7)';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      for (let t = 0; t <= 175; t += 25) {
        const x = xT(t);
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.beginPath(); ctx.moveTo(x, padT); ctx.lineTo(x, padT + gH); ctx.stroke();
        ctx.fillText(`${t}`, x, padT + gH + 14);
      }
      ctx.fillText('Ambient T (°C)', padL + gW / 2, padT + gH + 28);

      ctx.textAlign = 'right';
      for (let f = 0; f <= 1.0001; f += 0.25) {
        const y = yF(f);
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + gW, y); ctx.stroke();
        ctx.fillText(`${(f * 100).toFixed(0)}%`, padL - 6, y + 3);
      }

      // Derating curve
      ctx.strokeStyle = '#ff6b2a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(xT(0), yF(1.0));
      ctx.lineTo(xT(T_KNEE), yF(1.0));
      ctx.lineTo(xT(T_ZERO), yF(0));
      ctx.lineTo(xT(175), yF(0));
      ctx.stroke();

      // Shaded "safe" area
      ctx.fillStyle = 'rgba(108,197,194,0.07)';
      ctx.beginPath();
      ctx.moveTo(xT(0), yF(0));
      ctx.lineTo(xT(0), yF(1.0));
      ctx.lineTo(xT(T_KNEE), yF(1.0));
      ctx.lineTo(xT(T_ZERO), yF(0));
      ctx.closePath();
      ctx.fill();

      // Current operating point: (T_C, P_actual / P_nom)
      const opFrac = P_nom > 0 ? P_actual / P_nom : 0;
      const opX = xT(T_C);
      const opY = yF(Math.min(opFrac, 1.05));
      ctx.fillStyle = overload ? '#ff3b6e' : '#6cc5c2';
      ctx.beginPath();
      ctx.arc(opX, opY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Knee marker
      ctx.strokeStyle = 'rgba(255,107,42,0.5)';
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(xT(T_KNEE), padT);
      ctx.lineTo(xT(T_KNEE), padT + gH);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(160,158,149,0.85)';
      ctx.textAlign = 'left';
      ctx.fillText(`Knee at ${T_KNEE} °C`, xT(T_KNEE) + 4, padT + 10);
      ctx.fillText(`Zero at ${T_ZERO} °C`, xT(T_ZERO) - 60, padT + 24);

      // Title
      ctx.fillStyle = '#ff6b2a';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('ALLOWED DISSIPATION  vs  AMBIENT', padL, 8);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 4.3'}
      title="Power derating"
      question="Why can't a 1/4 W resistor actually dissipate 1/4 W?"
      caption={
        <>
          The resistor's rated power is for cool surroundings only. Once the ambient passes the knee — typically <strong>70 °C</strong> for
          a film resistor — the allowed dissipation derates linearly to <strong>zero</strong> at the maximum body temperature (~155 °C). In
          a hot enclosure a 1/4 W part is really a 1/8 W part. The blue dot is the current operating point; pink means you are over the limit.
        </>
      }
      deeperLab={{ slug: 'joule', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={260} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="Ambient T"
          value={T_C} min={20} max={170} step={1}
          format={v => v.toFixed(0) + ' °C'}
          onChange={setT}
        />
        <MiniSlider
          label="P rated"
          value={P_nom} min={0.0625} max={5} step={0.0625}
          format={v => v < 1 ? `1/${Math.round(1 / v)} W` : v.toFixed(2) + ' W'}
          onChange={setPnom}
        />
        <MiniSlider
          label="P actual"
          value={P_actual} min={0} max={2} step={0.01}
          format={v => v.toFixed(2) + ' W'}
          onChange={setPact}
        />
        <MiniReadout label="Allowed" value={<Num value={P_allow} />} unit="W" />
        <MiniReadout label="Headroom" value={`${(frac * 100).toFixed(0)}%`} />
        <MiniReadout label="Status" value={overload ? 'OVERLOAD' : 'OK'} />
      </DemoControls>
    </Demo>
  );
}
