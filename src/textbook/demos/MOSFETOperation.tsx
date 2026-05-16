/**
 * Demo D14.4 — n-channel MOSFET in operation
 *
 * Two views in one canvas:
 *   - Left: device cross-section (source / drain / gate / substrate /
 *     oxide / channel) with the inversion-layer channel forming when
 *     V_GS > V_T.
 *   - Right: I_D vs V_DS curves at three values of V_GS, the
 *     standard square-law model.
 *
 *   Triode:    I_D = k_n · ((V_GS − V_T) V_DS − V_DS² / 2)
 *   Saturation: I_D = (k_n / 2) (V_GS − V_T)²
 *
 * k_n is the transconductance parameter (= µ_n C_ox W/L); taken here as
 * 2 mA/V² to give numbers that map onto a generic small-signal device.
 * V_T = 1 V (n-channel enhancement). See Sedra & Smith §5.2.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';

interface Props {
  figure?: string;
}

const V_T = 1.0; // V — threshold voltage
const k_n = 2e-3; // A/V² — transconductance parameter

function ID(V_GS: number, V_DS: number): number {
  const Vov = V_GS - V_T;
  if (Vov <= 0) return 0;
  if (V_DS < Vov) {
    // triode region
    return k_n * (Vov * V_DS - (V_DS * V_DS) / 2);
  }
  // saturation
  return (k_n / 2) * Vov * Vov;
}

export function MOSFETOperationDemo({ figure }: Props) {
  const [V_GS, setVGS] = useState(2);
  const [V_DS, setVDS] = useState(3);

  const I_D = ID(V_GS, V_DS);
  const Vov = Math.max(0, V_GS - V_T);
  const inSat = V_DS >= Vov && Vov > 0;

  const stateRef = useRef({ V_GS, V_DS });
  useEffect(() => {
    stateRef.current = { V_GS, V_DS };
  }, [V_GS, V_DS]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, colors } = info;
    let raf = 0;

    function draw() {
      const { V_GS, V_DS } = stateRef.current;
      const Vov = Math.max(0, V_GS - V_T);

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      // split: left half = device, right half = I-V plot
      const split = Math.floor(w * 0.5);

      // ====== LEFT: device cross-section ======
      const dL = 18,
        dR = split - 12,
        dT = 30,
        dB = h - 26;
      const dW = dR - dL,
        dH = dB - dT;

      // substrate (p-type, blue tint)
      ctx.save();
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = colors.blue;
      ctx.fillRect(dL, dT + dH * 0.4, dW, dH * 0.6);
      ctx.restore();
      ctx.strokeStyle = colors.border;
      ctx.strokeRect(dL, dT + dH * 0.4, dW, dH * 0.6);

      // source and drain (n+ regions, pink tint)
      const srcL = dL + 6,
        srcR = dL + dW * 0.28;
      const drnL = dL + dW * 0.72,
        drnR = dR - 6;
      const ndT = dT + dH * 0.4;
      const ndB = ndT + dH * 0.35;
      ctx.fillStyle = colors.pink;
      ctx.fillRect(srcL, ndT, srcR - srcL, ndB - ndT);
      ctx.fillRect(drnL, ndT, drnR - drnL, ndB - ndT);
      ctx.strokeStyle = colors.border;
      ctx.strokeRect(srcL, ndT, srcR - srcL, ndB - ndT);
      ctx.strokeRect(drnL, ndT, drnR - drnL, ndB - ndT);

      // oxide (thin pale band above substrate, between source and drain)
      const oxL = srcR + 2,
        oxR = drnL - 2;
      const oxT = ndT - 8,
        oxB = ndT;
      ctx.save();
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = colors.text;
      ctx.fillRect(oxL, oxT, oxR - oxL, oxB - oxT);

      // gate (above oxide)
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = 0.22;
      ctx.fillStyle = colors.accent;
      ctx.fillRect(oxL, dT + 14, oxR - oxL, oxT - (dT + 14));
      ctx.restore();
      ctx.strokeStyle = colors.accent;
      ctx.strokeRect(oxL, dT + 14, oxR - oxL, oxT - (dT + 14));

      // labels
      ctx.fillStyle = colors.textDim;
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('S', (srcL + srcR) / 2, (ndT + ndB) / 2);
      ctx.fillText('D', (drnL + drnR) / 2, (ndT + ndB) / 2);
      ctx.fillText('G', (oxL + oxR) / 2, dT + 22);
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.save();
      ctx.globalAlpha = 0.65;
      ctx.fillStyle = colors.textDim;
      ctx.textBaseline = 'top';
      ctx.fillText('oxide', (oxL + oxR) / 2, oxT - 1);
      ctx.fillText('p-substrate (body)', (dL + dR) / 2, dT + dH * 0.85);
      ctx.fillText('n+', (srcL + srcR) / 2, ndB - 12);
      ctx.fillText('n+', (drnL + drnR) / 2, ndB - 12);

      // inversion-layer channel — appears if V_GS > V_T.
      if (Vov > 0) {
        // density ∝ Vov
        const channelAlpha = Math.min(0.85, 0.15 + 0.7 * (Vov / 4));
        // for V_DS < Vov, channel is uniform; for V_DS > Vov, channel
        // is pinched off at the drain end.
        const pinched = V_DS > Vov;
        ctx.fillStyle = `rgba(255,107,42,${channelAlpha})`;
        ctx.beginPath();
        ctx.moveTo(oxL, ndT - 1);
        ctx.lineTo(oxR, ndT - 1);
        if (pinched) {
          // taper to a point at the drain side
          ctx.lineTo(oxR - 4, ndT + 4);
          ctx.lineTo(oxL, ndT + 5);
        } else {
          ctx.lineTo(oxR, ndT + 5);
          ctx.lineTo(oxL, ndT + 5);
        }
        ctx.closePath();
        ctx.fill();
      }

      // arrow from D to S inside the channel if conducting
      if (Vov > 0 && V_DS > 0) {
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(oxR - 4, ndT + 2);
        ctx.lineTo(oxL + 8, ndT + 2);
        ctx.stroke();
        ctx.fillStyle = colors.accent;
        ctx.beginPath();
        ctx.moveTo(oxL + 4, ndT + 2);
        ctx.lineTo(oxL + 10, ndT - 1);
        ctx.lineTo(oxL + 10, ndT + 5);
        ctx.closePath();
        ctx.fill();
      } else if (Vov === 0) {
        ctx.fillStyle = colors.textDim;
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('no channel', (oxL + oxR) / 2, ndT + 2);
      }

      // header on left
      ctx.restore();
      ctx.fillStyle = colors.textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(`n-MOSFET (V_T = ${V_T.toFixed(1)} V)`, dL, 8);

      // ====== RIGHT: I-V plot ======
      const pL = split + 50,
        pR = w - 12,
        pT = 30,
        pB = h - 26;
      const pW = pR - pL,
        pH = pB - pT;

      const Vmin = 0,
        Vmax = 5;
      const Imax = (k_n / 2) * 16; // I_D at Vov = 4 V — full-scale headroom

      const xOf = (v: number) => pL + ((v - Vmin) / (Vmax - Vmin)) * pW;
      const yOf = (i: number) => pT + pH - (i / Imax) * pH;

      // frame
      ctx.strokeStyle = colors.border;
      ctx.strokeRect(pL, pT, pW, pH);

      // gridlines
      ctx.strokeStyle = colors.border;
      ctx.beginPath();
      for (let v = 0; v <= Vmax; v++) {
        ctx.moveTo(xOf(v), pT);
        ctx.lineTo(xOf(v), pT + pH);
      }
      ctx.stroke();

      // ticks
      ctx.save();
      ctx.globalAlpha = 0.65;
      ctx.fillStyle = colors.textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      for (let v = 0; v <= Vmax; v++) {
        ctx.fillText(v.toFixed(0), xOf(v), pT + pH + 4);
      }
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${(Imax * 1000).toFixed(0)} mA`, pL - 4, yOf(Imax));
      ctx.fillText('0', pL - 4, yOf(0));

      ctx.restore();
      ctx.fillStyle = colors.textDim;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('V_DS (volts)', pL + pW / 2, pT + pH + 18);

      // family of curves at V_GS = 1.5, 2.0, 2.5, 3.0 V
      const traces = [1.5, 2.0, 2.5, 3.0];
      traces.forEach((Vgs, k) => {
        const t = k / (traces.length - 1);
        const col = `rgba(${Math.round(255 - 100 * t)},${Math.round(107 + 30 * t)},${Math.round(42 + 80 * t)},0.95)`;
        const lit = Math.abs(Vgs - V_GS) < 0.26;
        ctx.strokeStyle = col;
        ctx.lineWidth = lit ? 2.2 : 1.3;
        ctx.beginPath();
        const N = 200;
        for (let j = 0; j <= N; j++) {
          const v = Vmin + (j / N) * (Vmax - Vmin);
          const i = ID(Vgs, v);
          const x = xOf(v);
          const y = yOf(Math.min(Imax, i));
          if (j === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        const yEnd = yOf(Math.min(Imax, ID(Vgs, Vmax)));
        ctx.fillStyle = col;
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(`V_GS = ${Vgs.toFixed(1)} V`, pL + pW - 6, yEnd - 8);
      });

      // operating point
      const I_op = ID(V_GS, V_DS);
      const opX = xOf(V_DS);
      const opY = yOf(Math.min(Imax, I_op));
      ctx.save();
      ctx.globalAlpha = 0.45;
      ctx.strokeStyle = colors.text;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(opX, pT);
      ctx.lineTo(opX, pT + pH);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      ctx.fillStyle = colors.text;
      ctx.beginPath();
      ctx.arc(opX, opY, 4, 0, Math.PI * 2);
      ctx.fill();

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 14.4'}
      title="The MOSFET — a gate controls the channel"
      question="What is the gate doing — and what's the difference between triode and saturation?"
      caption={
        <>
          Left: device cross-section. Below V_T no channel exists; above V_T an inversion layer
          forms under the oxide. Right: the resulting I_D-V_DS curves. At small V_DS the device is a
          voltage-controlled resistor (triode); past V_DS = V_GS − V_T the channel pinches off and
          I_D saturates at (k<sub>n</sub>/2)(V_GS − V_T)².
        </>
      }
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="V_GS"
          value={V_GS}
          min={0}
          max={4}
          step={0.02}
          format={(v) => v.toFixed(2) + ' V'}
          onChange={setVGS}
        />
        <MiniSlider
          label="V_DS"
          value={V_DS}
          min={0}
          max={5}
          step={0.02}
          format={(v) => v.toFixed(2) + ' V'}
          onChange={setVDS}
        />
        <MiniReadout label="V_OV" value={Vov.toFixed(2)} unit="V" />
        <MiniReadout label="I_D" value={<Num value={I_D} />} unit="A" />
        <MiniReadout
          label="region"
          value={Vov <= 0 ? 'cut-off' : inSat ? 'saturation' : 'triode'}
        />
      </DemoControls>
    </Demo>
  );
}
