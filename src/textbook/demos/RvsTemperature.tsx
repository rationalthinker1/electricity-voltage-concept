/**
 * Demo D4.4 — R vs temperature for several materials
 *
 * Plots R(T)/R(T₀) for: copper (α≈+3.9e-3/K), nichrome (~+1e-4/K, nearly
 * flat), tungsten (steep positive, ~+4.5e-3/K), NTC thermistor (exponential
 * drop with T), and a PTC polyswitch (sharp rise at trip). Toggle which
 * curves to show; a vertical T cursor reads off each curve.
 */
import { useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { drawLabel } from '@/lib/canvasLayout';
import type { ThemeColors } from '@/lib/canvasTheme';
import { Demo, DemoControls, EquationStrip, MiniReadout, MiniSlider, MiniToggle } from '@/components/Demo';
import { InlineMath } from '@/components/Formula';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';
import { fmtRatio } from '@/lib/formatters';

interface Props {
  figure: string;
}

type CurveColorKey = 'accent' | 'tungsten' | 'teal' | 'blue' | 'pink';

interface Curve {
  key: string;
  label: string;
  /** Resolved at draw time so light/dark theme toggles repaint correctly. */
  colorKey: CurveColorKey;
  /** R(T) / R(T_ref) where T is in °C. T_ref = 20 °C. */
  ratio: (T_C: number) => number;
}

// Tungsten has no theme token (warm amber distinct from the brand orange),
// so it stays a literal and is resolved alongside the tokens below.
const TUNGSTEN_HEX = '#ffb84a';

function resolveCurveColor(key: CurveColorKey, colors: ThemeColors): string {
  if (key === 'tungsten') return TUNGSTEN_HEX;
  return colors[key];
}

const T_REF = 20;

// Copper: linear with α = 3.9e-3 /K, valid roughly -50 .. 200 °C
const cuRatio = (T_C: number) => 1 + 3.9e-3 * (T_C - T_REF);
// Tungsten: large positive α ~ 4.5e-3 /K (room-to-incandescent factor ~10 by
// 2700 °C, consistent with handbook tables; we use the linear-ish low-T form
// here, which over-extrapolates at 2700 K but is fine in our 0–200 °C window).
const wRatio = (T_C: number) => 1 + 4.5e-3 * (T_C - T_REF);
// Nichrome: nearly flat, α ~ 1e-4 /K
const nicrRatio = (T_C: number) => 1 + 1.0e-4 * (T_C - T_REF);
// NTC thermistor: R(T) = R_ref * exp(B (1/T - 1/T_ref)), B = 3950 K (typical),
// T in K.
const NTC_B = 3950;
const ntcRatio = (T_C: number) => {
  const T = T_C + 273.15;
  const Tr = T_REF + 273.15;
  return Math.exp(NTC_B * (1 / T - 1 / Tr));
};
// PTC polyswitch: ~1 below trip (~80–125 °C), sharp rise of ~×1000 above.
const ptcRatio = (T_C: number) => {
  const T_trip = 100;
  if (T_C < T_trip - 5) return 1.0;
  if (T_C > T_trip + 20) return 1000;
  // sigmoid-ish between
  const u = (T_C - (T_trip - 5)) / 25;
  return Math.pow(1000, u);
};

const CURVES: Curve[] = [
  { key: 'copper', label: 'Copper', colorKey: 'accent', ratio: cuRatio },
  { key: 'tungsten', label: 'Tungsten', colorKey: 'tungsten', ratio: wRatio },
  { key: 'nichrome', label: 'Nichrome', colorKey: 'teal', ratio: nicrRatio },
  { key: 'ntc', label: 'NTC therm.', colorKey: 'blue', ratio: ntcRatio },
  { key: 'ptc', label: 'PTC polyswitch', colorKey: 'pink', ratio: ptcRatio },
];

export function RvsTemperatureDemo({ figure }: Props) {
  const [shown, setShown] = useState<Record<string, boolean>>({
    copper: true,
    tungsten: true,
    nichrome: true,
    ntc: true,
    ptc: false,
  });
  const [T_C, setT] = useState(60);

  const stateRef = useSimState({ shown, T_C });
  const setup = useSimLoop(
    stateRef,
    ({ ctx, w: W, h: H, colors }, _state, _dt, _simTime) => {
      const { shown, T_C } = stateRef.current;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, W, H);
      const padL = 56,
        padR = 18,
        padT = 26,
        padB = 32;
      const gW = W - padL - padR;
      const gH = H - padT - padB;
      const tMin = -20,
        tMax = 200;
      const yMin = 0.05,
        yMax = 50;
      const logYmin = Math.log10(yMin),
        logYmax = Math.log10(yMax);
      const xT = (t: number) => padL + ((t - tMin) / (tMax - tMin)) * gW;
      const yR = (r: number) => {
        const lr = Math.log10(Math.max(yMin * 0.5, Math.min(yMax * 2, r)));
        return padT + (1 - (lr - logYmin) / (logYmax - logYmin)) * gH;
      };
      ctx.strokeStyle = colors.borderStrong;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padL, padT);
      ctx.lineTo(padL, padT + gH);
      ctx.lineTo(padL + gW, padT + gH);
      ctx.stroke();
      ctx.fillStyle = colors.textDim;
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      for (let t = -20; t <= 200; t += 40) {
        const x = xT(t);
        ctx.strokeStyle = colors.border;
        ctx.beginPath();
        ctx.moveTo(x, padT);
        ctx.lineTo(x, padT + gH);
        ctx.stroke();
        ctx.fillText(`${t}`, x, padT + gH + 14);
      }
      drawLabel(ctx, { text: 'Temperature (°C)', x: padL + gW / 2, y: padT + gH + 26 });
      ctx.textAlign = 'right';
      for (let lp = -1; lp <= 1; lp++) {
        const v = Math.pow(10, lp);
        const y = yR(v);
        ctx.strokeStyle = colors.border;
        ctx.beginPath();
        ctx.moveTo(padL, y);
        ctx.lineTo(padL + gW, y);
        ctx.stroke();
        ctx.fillText(`${v < 1 ? v.toFixed(1) : v.toFixed(0)}×`, padL - 6, y + 3);
      }
      ctx.strokeStyle = colors.borderStrong;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(xT(T_REF), padT);
      ctx.lineTo(xT(T_REF), padT + gH);
      ctx.stroke();
      ctx.setLineDash([]);
      drawLabel(ctx, { text: '20 °C ref', x: xT(T_REF) + 4, y: padT + 10 });
      for (const c of CURVES) {
        if (!shown[c.key]) continue;
        ctx.strokeStyle = resolveCurveColor(c.colorKey, colors);
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i <= 220; i++) {
          const t = tMin + (i / 220) * (tMax - tMin);
          const r = c.ratio(t);
          if (i === 0) ctx.moveTo(xT(t), yR(r));
          else ctx.lineTo(xT(t), yR(r));
        }
        ctx.stroke();
      }
      const cx = xT(T_C);
      ctx.save();
      ctx.globalAlpha = 0.65;
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx, padT);
      ctx.lineTo(cx, padT + gH);
      ctx.stroke();
      for (const c of CURVES) {
        if (!shown[c.key]) continue;
        const r = c.ratio(T_C);
        const y = yR(r);
        ctx.fillStyle = resolveCurveColor(c.colorKey, colors);
        ctx.beginPath();
        ctx.arc(cx, y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      drawLabel(ctx, {
        x: padL,
        y: 8,
        text: 'R(T) / R(20 °C)   — log scale',
        color: colors.accent,
        baseline: 'top',
      });
    },
    [],
  );

  return (
    <Demo
      figure={figure}
      title="R is not constant"
      question="How does each material's resistance change with temperature?"
      caption={
        <>
          Pure metals (Cu, W) climb with T — phonon scattering rises with thermal vibration
          amplitude. Nichrome is engineered to be nearly flat. NTC thermistors drop exponentially
          with T (used as temperature sensors). PTC polyswitches sit near 1× until their trip
          temperature, then jump by ~1000× — that's the self-protecting current limit.
        </>
      }
      deeperLab={{ slug: 'resistance', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={280} setup={setup} />
      <DemoControls>
        {CURVES.map((c) => (
          <MiniToggle
            key={c.key}
            label={c.label}
            checked={!!shown[c.key]}
            onChange={(v) => setShown((s) => ({ ...s, [c.key]: v }))}
          />
        ))}
        <MiniSlider
          label="T"
          value={T_C}
          min={-20}
          max={200}
          step={1}
          format={(v) => v.toFixed(0) + ' °C'}
          onChange={setT}
        />
        {CURVES.filter((c) => shown[c.key]).map((c) => (
          <MiniReadout key={c.key} label={c.label} value={fmtRatio(c.ratio(T_C))} unit="× R₂₀" />
        ))}
      </DemoControls>
      <EquationStrip
        leftLabel="Metal (linear, Cu)"
        left={
          <InlineMath
            tex={`R/R_0 = 1 + \\alpha(T - T_0) = ${cuRatio(T_C).toFixed(3)}\\times`}
          />
        }
        rightLabel="NTC thermistor"
        right={
          <InlineMath
            tex={`R/R_0 = e^{B(1/T - 1/T_0)} = ${ntcRatio(T_C).toFixed(3)}\\times`}
          />
        }
      />
    </Demo>
  );
}
