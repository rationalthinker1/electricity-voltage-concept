/**
 * Demo D13.1b — Voltage follower (op-amp buffer)
 *
 * Compare two ways to drive a load R_L from a high-impedance source
 * (V_s in series with R_s, modelling a sensor / divider tap):
 *
 *   Direct connection (no buffer):
 *       V_load = V_s · R_L / (R_s + R_L)
 *
 *   Through a unity-gain op-amp follower:
 *       V_load = V_s   (input draws ~0 A, output drives R_L stiffly)
 *
 * Reader scrubs R_s and R_L through several decades and sees the voltage
 * collapse with no buffer; with the buffer in place V_load = V_s exactly.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import {
  Demo, DemoControls, MiniReadout, MiniSlider, MiniToggle,
} from '@/components/Demo';
import { Num } from '@/components/Num';
import { getCanvasColors } from '@/lib/canvasTheme';

interface Props { figure?: string }

export function OpAmpFollowerDemo({ figure }: Props) {
  const [Vs, setVs] = useState(2);            // V
  // Logarithmic resistance sliders (decades)
  const [logRs, setLogRs] = useState(6);      // R_s = 10^logRs Ω  → 1 MΩ
  const [logRL, setLogRL] = useState(1.7);    // R_L = 10^logRL Ω → ~50 Ω
  const [bufferOn, setBufferOn] = useState(false);

  const Rs = Math.pow(10, logRs);
  const RL = Math.pow(10, logRL);
  const VdirectLoad = Vs * RL / (Rs + RL);
  const VbufferedLoad = Vs;  // ideal follower
  const Vshown = bufferOn ? VbufferedLoad : VdirectLoad;

  const stateRef = useRef({ Vs, Rs, RL, VdirectLoad, bufferOn });
  useEffect(() => {
    stateRef.current = { Vs, Rs, RL, VdirectLoad, bufferOn };
  }, [Vs, Rs, RL, VdirectLoad, bufferOn]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, } = info;
    let raf = 0;

    function draw() {
      const { Vs, Rs, RL, VdirectLoad, bufferOn } = stateRef.current;
      ctx.fillStyle = getCanvasColors().bg;
      ctx.fillRect(0, 0, w, h);

      // Top half: schematic. Bottom half: voltage bar chart.
      const splitY = Math.floor(h * 0.62);
      drawSchematic(ctx, 0, 0, w, splitY, Vs, Rs, RL, bufferOn, VdirectLoad);
      drawBars(ctx, 0, splitY, w, h - splitY, Vs, VdirectLoad, bufferOn);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 13.1b'}
      title="Voltage follower — the op-amp's true job"
      question="A 1 MΩ source driving a 50 Ω load: where does the signal go?"
      caption={<>
        A high-impedance source (V<sub>s</sub> through R<sub>s</sub>) feeds a low-impedance
        load R<sub>L</sub>. Direct connection: the load shorts out the source — V<sub>load</sub>
        ≈ V<sub>s</sub>·R<sub>L</sub>/R<sub>s</sub>, almost nothing. Insert a unity-gain op-amp
        between them: the op-amp's huge input impedance draws no current from the source, and its
        tiny output impedance drives the load stiffly. V<sub>load</sub> = V<sub>s</sub>, exactly.
        The follower has gain 1; its <em>point</em> is impedance translation.
      </>}
    >
      <AutoResizeCanvas height={320} setup={setup} />
      <DemoControls>
        <MiniSlider label="V_s" value={Vs} min={0} max={5} step={0.1}
          format={v => v.toFixed(2) + ' V'} onChange={setVs} />
        <MiniSlider label="R_s (log)" value={logRs} min={1} max={9} step={0.1}
          format={v => fmtRLog(v)} onChange={setLogRs} />
        <MiniSlider label="R_L (log)" value={logRL} min={1} max={9} step={0.1}
          format={v => fmtRLog(v)} onChange={setLogRL} />
        <MiniToggle
          label={bufferOn ? 'Buffer: in circuit' : 'No buffer'}
          checked={bufferOn}
          onChange={setBufferOn}
        />
        <MiniReadout label="R_s" value={<Num value={Rs} />} unit="Ω" />
        <MiniReadout label="R_L" value={<Num value={RL} />} unit="Ω" />
        <MiniReadout label="V_load (direct)" value={<Num value={VdirectLoad} digits={3} />} unit="V" />
        <MiniReadout label="V_load (live)" value={<Num value={Vshown} digits={3} />} unit="V" />
      </DemoControls>
    </Demo>
  );
}

function fmtRLog(v: number): string {
  const R = Math.pow(10, v);
  if (R >= 1e6) return (R / 1e6).toFixed(2) + ' MΩ';
  if (R >= 1e3) return (R / 1e3).toFixed(2) + ' kΩ';
  return R.toFixed(0) + ' Ω';
}

/* ─── Schematic ──────────────────────────────────────────────────────── */

function drawSchematic(
  ctx: CanvasRenderingContext2D,
  x0: number, y0: number, _w: number, h: number,
  Vs: number, Rs: number, RL: number, bufferOn: boolean, VdirectLoad: number,
) {
  ctx.save();
  ctx.translate(x0, y0);

  const margin = 20;
  const yWire = h * 0.45;
  const yGnd = h - margin;

  // Source label
  const xSrc = margin + 12;
  ctx.save();
  ctx.globalAlpha = 0.55;
  ctx.strokeStyle = getCanvasColors().text;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(xSrc, yWire, 12, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
  ctx.fillStyle = getCanvasColors().accent;
  ctx.font = 'bold 10px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('V_s', xSrc, yWire);

  ctx.fillStyle = getCanvasColors().accent;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';
  ctx.fillText(`${Vs.toFixed(2)} V`, xSrc - 8, yWire - 18);

  // Wire from source through R_s
  ctx.save();
  ctx.globalAlpha = 0.55;
  ctx.strokeStyle = getCanvasColors().text;
  ctx.beginPath();
  ctx.moveTo(xSrc + 12, yWire); ctx.lineTo(xSrc + 30, yWire);
  ctx.stroke();
  const xRsLeft = xSrc + 30;
  const xRsRight = xRsLeft + 60;
  // R_s resistor (horizontal box)
  ctx.restore();
  ctx.strokeStyle = getCanvasColors().pink;
  ctx.strokeRect(xRsLeft, yWire - 7, 60, 14);
  ctx.fillStyle = getCanvasColors().pink;
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText(`R_s = ${formatR(Rs)}`, xRsLeft + 30, yWire - 10);

  ctx.save();
  ctx.globalAlpha = 0.55;
  ctx.strokeStyle = getCanvasColors().text;
  ctx.beginPath();
  ctx.moveTo(xRsRight, yWire); ctx.lineTo(xRsRight + 30, yWire);
  ctx.stroke();

  // Optional buffer triangle
  let xNodeOut = xRsRight + 30;
  if (bufferOn) {
    const xTri = xRsRight + 30;
    const triH = 38;
    ctx.strokeStyle = getCanvasColors().teal;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(xTri, yWire - triH / 2);
    ctx.lineTo(xTri, yWire + triH / 2);
    ctx.lineTo(xTri + 42, yWire);
    ctx.closePath();
    ctx.stroke();
    // + / − markings
    ctx.fillStyle = getCanvasColors().teal;
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('+', xTri + 4, yWire - 9);
    ctx.fillText('−', xTri + 4, yWire + 9);
    // Output wire and feedback
    ctx.save();
    ctx.globalAlpha = 0.55;
    ctx.strokeStyle = getCanvasColors().text;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(xTri + 42, yWire); ctx.lineTo(xTri + 70, yWire);
    // feedback loop: output back to (-) input
    ctx.moveTo(xTri + 42, yWire);
    ctx.lineTo(xTri + 52, yWire);
    ctx.lineTo(xTri + 52, yWire + 26);
    ctx.lineTo(xTri - 4, yWire + 26);
    ctx.lineTo(xTri - 4, yWire + 9);
    ctx.lineTo(xTri, yWire + 9);
    ctx.stroke();
    xNodeOut = xTri + 70;

    ctx.restore();
    ctx.fillStyle = getCanvasColors().teal;
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('unity follower', xTri + 21, yWire - triH / 2 - 4);
  }

  // R_L from node to ground
  ctx.restore();
  ctx.save();
  ctx.globalAlpha = 0.55;
  ctx.strokeStyle = getCanvasColors().text;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(xNodeOut, yWire); ctx.lineTo(xNodeOut + 20, yWire);
  ctx.stroke();
  const xRL = xNodeOut + 20;
  // Vertical R_L
  ctx.restore();
  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.strokeStyle = getCanvasColors().blue;
  ctx.strokeRect(xRL - 7, yWire + 4, 14, 60);
  ctx.restore();
  ctx.fillStyle = getCanvasColors().blue;
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(`R_L = ${formatR(RL)}`, xRL + 10, yWire + 34);

  // Probe dot at load node + V_load label
  ctx.fillStyle = getCanvasColors().accent;
  ctx.beginPath();
  ctx.arc(xNodeOut, yWire, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = 'bold 10px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText('V_load', xNodeOut, yWire - 8);

  // Ground wire connecting source-bottom to R_L bottom
  ctx.save();
  ctx.globalAlpha = 0.55;
  ctx.strokeStyle = getCanvasColors().text;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(xSrc, yWire + 12); ctx.lineTo(xSrc, yGnd);
  ctx.lineTo(xRL, yGnd); ctx.lineTo(xRL, yWire + 64);
  ctx.stroke();

  // Ground symbol
  ctx.restore();
  ctx.save();
  ctx.globalAlpha = 0.7;
  ctx.strokeStyle = getCanvasColors().textDim;
  ctx.beginPath();
  ctx.moveTo(xSrc - 6, yGnd); ctx.lineTo(xSrc + 6, yGnd);
  ctx.moveTo(xSrc - 4, yGnd + 3); ctx.lineTo(xSrc + 4, yGnd + 3);
  ctx.moveTo(xSrc - 2, yGnd + 6); ctx.lineTo(xSrc + 2, yGnd + 6);
  ctx.stroke();

  // V_load readout
  ctx.restore();
  ctx.fillStyle = getCanvasColors().accent;
  ctx.font = 'bold 11px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const vLive = bufferOn ? Vs : VdirectLoad;
  ctx.fillText(`= ${vLive.toFixed(3)} V`, xNodeOut + 12, yWire - 20);

  ctx.restore();
}

/* ─── Bar comparison ─────────────────────────────────────────────────── */

function drawBars(
  ctx: CanvasRenderingContext2D,
  x0: number, y0: number, w: number, _h: number,
  Vs: number, VdirectLoad: number, bufferOn: boolean,
) {
  ctx.save();
  ctx.translate(x0, y0);
  const padL = 60, padR = 40, padT = 14;
  const plotW = w - padL - padR;
  const plotH = 80;

  const vmax = Math.max(Vs, 1e-3);
  const yOf = (v: number) => padT + plotH - (v / vmax) * plotH;

  // Frame
  ctx.strokeStyle = getCanvasColors().border;
  ctx.strokeRect(padL, padT, plotW, plotH);

  // Three bars: V_s, V_load no-buffer, V_load with buffer
  const bars: { label: string; val: number; color: string }[] = [
    { label: 'V_s (source)', val: Vs, color: 'rgba(255,107,42,0.85)' },
    { label: 'V_load (direct)', val: VdirectLoad, color: 'rgba(255,59,110,0.85)' },
    { label: 'V_load (buffered)', val: Vs, color: 'rgba(108,197,194,0.85)' },
  ];
  const barW = Math.min(46, plotW / 5);
  for (let i = 0; i < bars.length; i++) {
    const xC = padL + ((i + 0.5) / bars.length) * plotW;
    const top = yOf(bars[i].val);
    const bot = yOf(0);
    ctx.fillStyle = bars[i].color;
    ctx.fillRect(xC - barW / 2, top, barW, bot - top);

    ctx.fillStyle = getCanvasColors().text;
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(bars[i].label, xC, padT + plotH + 2);
    ctx.textBaseline = 'bottom';
    ctx.fillText(`${bars[i].val.toFixed(3)} V`, xC, top - 2);
  }

  // Highlight which is the live case
  ctx.fillStyle = bufferOn ? 'rgba(108,197,194,0.95)' : 'rgba(255,59,110,0.95)';
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(bufferOn ? '⟵ live' : '⟵ live', padL + plotW + 4, padT + plotH * 0.5);

  ctx.save();
  ctx.globalAlpha = 0.65;
  ctx.fillStyle = getCanvasColors().textDim;
  ctx.font = '8px "JetBrains Mono", monospace';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${vmax.toFixed(2)} V`, padL - 4, yOf(vmax));
  ctx.fillText('0', padL - 4, yOf(0));

  ctx.restore();
  ctx.restore();
}

function formatR(R: number): string {
  if (R >= 1e6) return (R / 1e6).toFixed(2) + ' MΩ';
  if (R >= 1e3) return (R / 1e3).toFixed(2) + ' kΩ';
  return R.toFixed(0) + ' Ω';
}
