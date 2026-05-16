/**
 * Demo D19.1 — Diode I–V characteristic
 *
 * Plot the Shockley diode equation I = I_s (exp(V / (n V_T)) − 1) for three
 * device families: silicon (V_F ≈ 0.7 V), Schottky (V_F ≈ 0.3 V), Zener
 * (with reverse breakdown). Slider for temperature changes V_T = kT/q.
 *
 * Visualisation:
 *   x-axis: V from −7 V to +1.2 V
 *   y-axis: I clipped to ±100 mA (so the exponential's blow-up stays
 *           visible without losing scale)
 *
 * The reader sweeps an external V; a vertical bar marks the operating
 * point and the readout shows the live current.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';

interface Props {
  figure?: string;
}

type DiodeKind = 'si' | 'schottky' | 'zener';

// Saturation current (A) and ideality factor for each kind, chosen to
// reproduce the canonical knee voltages quoted in Horowitz & Hill 2015
// (3rd ed., Appendix G) and Sedra & Smith.
const FAMILIES: Record<
  DiodeKind,
  {
    label: string;
    Is: number;
    n: number;
    Vz: number; // Zener reverse-breakdown magnitude (V), large for non-Zeners
    color: string;
  }
> = {
  si: { label: 'Silicon (1N4148)', Is: 1e-9, n: 1.0, Vz: 50, color: 'rgba(255,107,42,0.95)' },
  schottky: {
    label: 'Schottky (1N5817)',
    Is: 1e-5,
    n: 1.0,
    Vz: 20,
    color: 'rgba(108,197,194,0.95)',
  },
  zener: {
    label: 'Zener (1N4733A, 5.1 V)',
    Is: 1e-9,
    n: 1.0,
    Vz: 5.1,
    color: 'rgba(91,174,248,0.95)',
  },
};

const Q = 1.602176634e-19; // C — CODATA 2018
const KB = 1.380649e-23; // J/K — CODATA 2018

function diodeCurrent(V: number, kind: DiodeKind, T: number): number {
  const { Is, n, Vz } = FAMILIES[kind];
  const VT = (KB * T) / Q; // thermal voltage
  if (V > -Vz) {
    // Forward + low reverse: Shockley
    return Is * (Math.exp(V / (n * VT)) - 1);
  }
  // Reverse breakdown: model as steep exponential past −Vz.
  // Slope ~ 0.05 V per decade (typical Zener), so I scales sharply.
  return -Is - 0.001 * Math.exp((-V - Vz) / 0.05);
}

export function DiodeCharacteristicDemo({ figure }: Props) {
  const [V, setV] = useState(0.6);
  const [T, setT] = useState(300); // K

  // Live currents at the operating point V
  const Isi = diodeCurrent(V, 'si', T);
  const Ish = diodeCurrent(V, 'schottky', T);
  const Iz = diodeCurrent(V, 'zener', T);

  const stateRef = useRef({ V, T });
  useEffect(() => {
    stateRef.current = { V, T };
  }, [V, T]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, colors } = info;
    let raf = 0;

    function draw() {
      const { V, T } = stateRef.current;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      const padL = 50,
        padR = 20,
        padT = 18,
        padB = 36;
      const plotW = w - padL - padR;
      const plotH = h - padT - padB;

      // axes ranges
      const Vmin = -7,
        Vmax = 1.2;
      const Imin = -0.05,
        Imax = 0.1; // A (so ±50 mA reverse, +100 mA forward)

      const xOf = (v: number) => padL + ((v - Vmin) / (Vmax - Vmin)) * plotW;
      const yOf = (i: number) => padT + plotH - ((i - Imin) / (Imax - Imin)) * plotH;

      // frame + axes
      ctx.strokeStyle = colors.border;
      ctx.strokeRect(padL, padT, plotW, plotH);
      ctx.beginPath();
      ctx.moveTo(padL, yOf(0));
      ctx.lineTo(padL + plotW, yOf(0));
      ctx.moveTo(xOf(0), padT);
      ctx.lineTo(xOf(0), padT + plotH);
      ctx.stroke();

      // axis labels
      ctx.save();
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = colors.textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('V (volts)', padL + plotW / 2, padT + plotH + 18);
      ctx.restore();
      ctx.save();
      ctx.translate(14, padT + plotH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.textBaseline = 'middle';
      ctx.fillText('I (amps)', 0, 0);
      ctx.restore();

      // gridlines (V every 1 V, I every 50 mA)
      ctx.strokeStyle = colors.border;
      ctx.beginPath();
      for (let v = Math.ceil(Vmin); v <= Math.floor(Vmax); v++) {
        const x = xOf(v);
        ctx.moveTo(x, padT);
        ctx.lineTo(x, padT + plotH);
      }
      for (let i = -0.05; i <= 0.1 + 1e-9; i += 0.05) {
        const y = yOf(i);
        ctx.moveTo(padL, y);
        ctx.lineTo(padL + plotW, y);
      }
      ctx.stroke();

      // tick labels
      ctx.save();
      ctx.globalAlpha = 0.65;
      ctx.fillStyle = colors.textDim;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      for (let v = Math.ceil(Vmin); v <= Math.floor(Vmax); v++) {
        ctx.fillText(v.toFixed(0), xOf(v), yOf(0) + 4);
        ctx.restore();
      }
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText('+100 mA', padL - 4, yOf(0.1));
      ctx.fillText('+50 mA', padL - 4, yOf(0.05));
      ctx.fillText('−50 mA', padL - 4, yOf(-0.05));

      // plot three I-V curves
      (Object.keys(FAMILIES) as DiodeKind[]).forEach((kind) => {
        const { color } = FAMILIES[kind];
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        const N = 600;
        let started = false;
        for (let k = 0; k <= N; k++) {
          const v = Vmin + (k / N) * (Vmax - Vmin);
          let i = diodeCurrent(v, kind, T);
          // clip to plot bounds
          if (i > Imax) i = Imax;
          if (i < Imin) i = Imin;
          const x = xOf(v);
          const y = yOf(i);
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      // operating-point bar
      ctx.save();
      ctx.globalAlpha = 0.45;
      ctx.strokeStyle = colors.text;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(xOf(V), padT);
      ctx.lineTo(xOf(V), padT + plotH);
      ctx.stroke();
      ctx.restore();
      ctx.setLineDash([]);

      // legend
      const legendX = padL + plotW - 165;
      let lY = padT + 6;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      (Object.keys(FAMILIES) as DiodeKind[]).forEach((kind) => {
        const { color, label } = FAMILIES[kind];
        ctx.fillStyle = color;
        ctx.fillRect(legendX, lY + 3, 10, 2);
        ctx.fillStyle = colors.text;
        ctx.fillText(label, legendX + 16, lY);
        lY += 14;
      });

      // header
      ctx.save();
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = colors.textDim;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(
        `I = Iₛ (exp(V/V_T) − 1)   ·   V_T = kT/q = ${(((KB * T) / Q) * 1000).toFixed(1)} mV at ${T.toFixed(0)} K`,
        padL,
        4,
      );
      ctx.restore();

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 19.1'}
      title="Diode I–V curves — silicon, Schottky, Zener"
      question="Three diodes, one slider. Where does each start conducting — and why does the Zener have a second knee at the back?"
      caption={
        <>
          Forward of V<sub>F</sub>, current grows exponentially with V (Shockley equation). Reverse,
          all three diodes leak only nanoamps — until the Zener hits its avalanche breakdown at −5.1
          V and clamps. Slide T: V<sub>T</sub> = kT/q is only 25.85 mV at room temperature, which is
          why the diode's forward voltage drifts ~−2 mV/K with heat.
        </>
      }
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="V applied"
          value={V}
          min={-6}
          max={1.0}
          step={0.01}
          format={(v) => v.toFixed(2) + ' V'}
          onChange={setV}
        />
        <MiniSlider
          label="T"
          value={T}
          min={200}
          max={400}
          step={1}
          format={(v) => v.toFixed(0) + ' K'}
          onChange={setT}
        />
        <MiniReadout label="I (Si)" value={<Num value={Isi} />} unit="A" />
        <MiniReadout label="I (Schottky)" value={<Num value={Ish} />} unit="A" />
        <MiniReadout label="I (Zener)" value={<Num value={Iz} />} unit="A" />
      </DemoControls>
    </Demo>
  );
}
