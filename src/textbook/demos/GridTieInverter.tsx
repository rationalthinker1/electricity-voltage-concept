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
import { useState } from 'react';
import { drawLabel } from '@/lib/canvasLayout';
import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, EquationStrip, MiniReadout, MiniSlider } from '@/components/Demo';
import { InlineMath } from '@/components/Formula';
import { Num } from '@/components/Num';
import { drawAxes, drawHLine, drawLinePlot, makePlotMappers } from '@/lib/drawPlot';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

interface Props {
  figure: string;
}

const F_GRID = 60;
const V_PK = 339.4; // 240 V_rms × √2

export function GridTieInverterDemo({ figure }: Props) {
  const [Ipk, setIpk] = useState(20); // A peak
  const [thetaDeg, setThetaDeg] = useState(0); // degrees, current phase

  const theta = (thetaDeg * Math.PI) / 180;
  // RMS values: V_rms = V_PK / √2, I_rms = Ipk / √2
  const Vrms = V_PK / Math.sqrt(2);
  const Irms = Ipk / Math.sqrt(2);
  const P = Vrms * Irms * Math.cos(theta);
  const Q = Vrms * Irms * Math.sin(theta);
  const S = Vrms * Irms;
  const pf = Math.cos(theta);

  const stateRef = useSimState({ Ipk, thetaDeg, P, Q });
  const setup = useSimLoop(
    stateRef,
    ({ ctx, w, h, colors }, _state, _dt, _simTime, ctx0) => {
      let phase = ctx0.phase;
      const { Ipk, thetaDeg } = stateRef.current;
      const theta = (thetaDeg * Math.PI) / 180;
      phase += 0.012;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);
      const padL = 50,
        padR = 80,
        padT = 18,
        padB = 28;
      const rect = { x: padL, y: padT, w: w - padL - padR, h: h - padT - padB };
      // Original scales each trace into ±(plotH/2 - 8), an 8 px breathing
      // gap from the frame. Reproduce that by widening the data range
      // proportionally.
      const halfH = rect.h / 2;
      const yPad = 8 / halfH;
      const vRange = V_PK / (1 - yPad);
      const iRange = Math.max(Ipk, 1) / (1 - yPad);
      const pRange = (V_PK * Math.max(Ipk, 1)) / (1 - yPad);
      drawAxes(ctx, rect, {
        xMin: 0,
        xMax: 1,
        yMin: -vRange,
        yMax: vRange,
        xTicks: [],
        yTicks: [],
      });
      drawHLine(ctx, rect, 0, -vRange, vRange, {
        color: colors.border,
        alpha: 1,
        dash: undefined,
      });
      const tWindow = 2 / F_GRID;
      const samples = 600;
      const cy = padT + halfH;
      const plotW = rect.w;
      const plotH = rect.h;
      const vPts: { x: number; y: number }[] = [];
      const iPts: { x: number; y: number }[] = [];
      for (let i = 0; i <= samples; i++) {
        const u = i / samples;
        const t = u * tWindow;
        vPts.push({ x: u, y: V_PK * Math.cos(2 * Math.PI * F_GRID * t + phase) });
        iPts.push({ x: u, y: Ipk * Math.cos(2 * Math.PI * F_GRID * t + phase - theta) });
      }
      ctx.save();
      ctx.globalAlpha = 0.8;
      drawLinePlot(ctx, rect, vPts, 0, 1, -vRange, vRange, {
        color: colors.text,
        lineWidth: 1.5,
      });
      ctx.restore();
      drawLinePlot(ctx, rect, iPts, 0, 1, -iRange, iRange, {
        color: colors.accent,
        lineWidth: 1.7,
      });
      // Instantaneous power v·i — closed polygon to the centre axis. drawLinePlot
      // closes to the bottom of the rect, so the fill stays as raw ctx calls.
      const { xOf, yOf } = makePlotMappers(rect, 0, 1, -pRange, pRange);
      ctx.fillStyle = colors.tealSoft;
      ctx.beginPath();
      ctx.moveTo(padL, cy);
      for (let i = 0; i <= samples; i++) {
        const u = i / samples;
        const t = u * tWindow;
        const v = V_PK * Math.cos(2 * Math.PI * F_GRID * t + phase);
        const ii = Ipk * Math.cos(2 * Math.PI * F_GRID * t + phase - theta);
        const p = v * ii;
        ctx.lineTo(xOf(u), yOf(p));
      }
      ctx.lineTo(padL + plotW, cy);
      ctx.closePath();
      ctx.fill();
      const lx = padL + plotW + 8;
      ctx.fillRect(lx, padT + 8 - 1, 10, 2);
      drawLabel(ctx, { text: 'V_grid', x: lx + 14, y: padT + 8, color: colors.text, font: '10px "JetBrains Mono", monospace', baseline: 'middle' });
      ctx.fillRect(lx, padT + 24 - 1, 10, 2);
      drawLabel(ctx, { text: 'I_inj', x: lx + 14, y: padT + 24, color: colors.accent, font: '10px "JetBrains Mono", monospace', baseline: 'middle' });
      ctx.save();
      ctx.globalAlpha = 0.6;
      ctx.fillRect(lx, padT + 40 - 2, 10, 4);
      drawLabel(ctx, { text: 'p(t)', x: lx + 14, y: padT + 40, color: colors.teal });
      ctx.restore();
      drawLabel(ctx, {
        x: padL + plotW / 2,
        y: padT + plotH + 6,
        text: `θ = ${thetaDeg.toFixed(0)}°   ·   cos θ = ${Math.cos(theta).toFixed(2)}`,
        color: colors.textDim,
        size: 11,
        align: 'center',
        baseline: 'top',
      });
      ctx0.phase = phase;
    },
    [],
    () => ({ context: { phase: 0 } }),
  );

  return (
    <Demo
      figure={figure}
      title="Grid-tie inverter: P, Q, and the current phase"
      question="The grid voltage is fixed. The inverter chooses how much current to inject and at what phase. What does each knob do?"
      caption={
        <>
          Inject current in phase with the grid voltage (θ = 0) and you deliver pure real power —
          every joule your panels make ends up on the line. Push the current 90° out of phase and
          you deliver pure reactive power — useful for stabilising sagging grid voltage but no real
          energy transferred. Real grid-tie inverters track the grid's phase continuously and can be
          commanded to mix the two.
        </>
      }
    >
      <AutoResizeCanvas height={280} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="I peak"
          value={Ipk}
          min={0.5}
          max={40}
          step={0.5}
          format={(v) => v.toFixed(1) + ' A'}
          onChange={setIpk}
        />
        <MiniSlider
          label="phase θ"
          value={thetaDeg}
          min={-90}
          max={90}
          step={1}
          format={(v) => v.toFixed(0) + '°'}
          onChange={setThetaDeg}
        />
        <MiniReadout label="P (real)" value={<Num value={P} />} unit="W" />
        <MiniReadout label="Q (reactive)" value={<Num value={Q} />} unit="VAR" />
        <MiniReadout label="S (apparent)" value={<Num value={S} />} unit="VA" />
        <MiniReadout label="power factor" value={pf.toFixed(3)} />
      </DemoControls>
      <EquationStrip
        leftLabel="Real and reactive power"
        left={<InlineMath tex="P = V_{\text{rms}} I_{\text{rms}} \cos\theta,\quad Q = V_{\text{rms}} I_{\text{rms}} \sin\theta" />}
        rightLabel={`At θ = ${thetaDeg.toFixed(0)}°`}
        right={<InlineMath tex={`P = ${P.toFixed(0)}\\,\\text{W},\\quad Q = ${Q.toFixed(0)}\\,\\text{VAR}`} />}
      />
    </Demo>
  );
}
