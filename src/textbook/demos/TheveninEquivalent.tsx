/**
 * Demo D12.8 — Thévenin equivalent
 *
 * A small two-source network on the left:
 *   V_s in series with R_1, then a node that joins R_2 to ground, with
 *   a parallel current source I_s also injected at the load node. The
 *   network's two output terminals connect to a load R_L.
 *
 * Open-circuit voltage and short-circuit current of this network give
 *   V_th = V_s · (R_2 / (R_1 + R_2)) + I_s · (R_1·R_2 / (R_1 + R_2))
 *   R_th = R_1 ∥ R_2  =  R_1·R_2 / (R_1 + R_2)
 *
 * Both circuits driven onto the same load R_L produce identical V_load
 * and I_load — the entire point of the equivalence.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { Num } from '@/components/Num';
import {
  drawBattery,
  drawCurrentSource,
  drawResistor,
  drawWire,
} from '@/lib/canvasPrimitives';

interface Props { figure?: string }

export function TheveninEquivalentDemo({ figure }: Props) {
  const [Vs, setVs] = useState(12);          // V
  const [R1, setR1] = useState(100);         // Ω
  const [R2, setR2] = useState(200);         // Ω
  const [Is_mA, setIs_mA] = useState(20);    // mA
  const [RL, setRL] = useState(300);         // Ω

  const Is = Is_mA * 1e-3; // A
  const parallel = (R1 * R2) / (R1 + R2);
  const Vth = Vs * (R2 / (R1 + R2)) + Is * parallel;
  const Rth = parallel;
  // Load voltage and current via Thévenin (or original, equivalent)
  const Iload = Vth / (Rth + RL);
  const Vload = Iload * RL;

  const stateRef = useRef({ Vs, R1, R2, Is, RL, Vth, Rth, Vload, Iload });
  useEffect(() => {
    stateRef.current = { Vs, R1, R2, Is, RL, Vth, Rth, Vload, Iload };
  }, [Vs, R1, R2, Is, RL, Vth, Rth, Vload, Iload]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h } = info;
    let raf = 0;

    function draw() {
      const st = stateRef.current;

      ctx.fillStyle = '#0d0d10';
      ctx.fillRect(0, 0, w, h);

      const splitX = w / 2;

      // Divider
      ctx.strokeStyle = 'rgba(255,255,255,0.10)';
      ctx.beginPath(); ctx.moveTo(splitX, 14); ctx.lineTo(splitX, h - 14); ctx.stroke();

      // Labels
      ctx.fillStyle = 'rgba(160,158,149,0.85)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('Original network', splitX / 2, 6);
      ctx.fillText('Thévenin equivalent', splitX + splitX / 2, 6);

      // ── LEFT: Original network ──────────────────────────────
      drawOriginal(ctx, 0, 22, splitX, h - 22, st);

      // ── RIGHT: Thévenin equivalent ──────────────────────────
      drawThevenin(ctx, splitX, 22, splitX, h - 22, st);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 12.6'}
      title="Thévenin equivalent of a two-source network"
      question="The two circuits load the same R_L. Do they ever disagree?"
      caption={<>
        Left: a voltage source V<sub>s</sub> and a current source I<sub>s</sub> wrapped around two
        resistors, feeding a load R<sub>L</sub>. Right: the same network compressed to a single
        Thévenin source V<sub>th</sub> in series with R<sub>th</sub>. Slide any parameter — the
        two circuits always show the same V<sub>load</sub> and I<sub>load</sub>. Any linear
        two-terminal network reduces to this pair of numbers.
      </>}
    >
      <AutoResizeCanvas height={280} setup={setup} />
      <DemoControls>
        <MiniSlider label="V_s" value={Vs} min={0} max={24} step={0.5}
          format={v => v.toFixed(1) + ' V'} onChange={setVs} />
        <MiniSlider label="I_s" value={Is_mA} min={0} max={100} step={1}
          format={v => v.toFixed(0) + ' mA'} onChange={setIs_mA} />
        <MiniSlider label="R₁" value={R1} min={10} max={1000} step={10}
          format={v => v.toFixed(0) + ' Ω'} onChange={setR1} />
        <MiniSlider label="R₂" value={R2} min={10} max={1000} step={10}
          format={v => v.toFixed(0) + ' Ω'} onChange={setR2} />
        <MiniSlider label="R_L" value={RL} min={10} max={2000} step={10}
          format={v => v.toFixed(0) + ' Ω'} onChange={setRL} />
        <MiniReadout label="V_th" value={<Num value={Vth} />} unit="V" />
        <MiniReadout label="R_th" value={<Num value={Rth} />} unit="Ω" />
        <MiniReadout label="V_load" value={<Num value={Vload} />} unit="V" />
        <MiniReadout label="I_load" value={<Num value={Iload * 1000} />} unit="mA" />
      </DemoControls>
    </Demo>
  );
}

interface ST {
  Vs: number; R1: number; R2: number; Is: number; RL: number;
  Vth: number; Rth: number; Vload: number; Iload: number;
}

function drawOriginal(
  ctx: CanvasRenderingContext2D,
  x0: number, y0: number, w: number, h: number, st: ST,
) {
  const cy = y0 + h / 2;
  const xBat = x0 + 40;
  const xR1 = x0 + w * 0.40;
  const xMid = x0 + w * 0.58;
  const xLoad = x0 + w - 40;
  const yTop = cy - 50;
  const yBot = cy + 50;

  // Top wire: battery+ → R1 → node
  drawWire(ctx, [{ x: xBat, y: yTop }, { x: xR1 - 22, y: yTop }]);
  drawResistor(ctx, { x: xR1 - 20, y: yTop }, { x: xR1 + 20, y: yTop }, {
    color: '#ff6b2a',
    label: `R₁ ${fmtR(st.R1)}`,
    labelOffset: { x: 0, y: -10 },
  });
  drawWire(ctx, [{ x: xR1 + 22, y: yTop }, { x: xLoad, y: yTop }]);

  // Battery on left
  drawBattery(ctx, { x: xBat, y: cy }, {
    label: `V_s=${st.Vs.toFixed(1)}V`,
    leadLength: 50,
  });

  // Bottom wire
  drawWire(ctx, [{ x: xBat, y: yBot }, { x: xLoad, y: yBot }]);

  // R2 from node-down to ground (vertical) at xMid
  drawResistor(ctx, { x: xMid, y: cy - 18 }, { x: xMid, y: cy + 18 }, {
    color: '#ff6b2a',
    label: `R₂ ${fmtR(st.R2)}`,
    labelOffset: { x: 12, y: 0 },
  });
  drawWire(ctx, [{ x: xMid, y: yTop }, { x: xMid, y: cy - 18 }]);
  drawWire(ctx, [{ x: xMid, y: cy + 18 }, { x: xMid, y: yBot }]);

  // Current source between top and bottom rails at x just before R_L
  const xIs = x0 + w * 0.78;
  drawCurrentSource(ctx, { x: xIs, y: cy }, {
    label: `I_s=${(st.Is * 1000).toFixed(0)}mA`,
    labelOffset: { x: 0, y: -32 },
  });
  drawWire(ctx, [{ x: xIs, y: yTop }, { x: xIs, y: cy - 14 }]);
  drawWire(ctx, [{ x: xIs, y: cy + 14 }, { x: xIs, y: yBot }]);

  // Load resistor (vertical) at xLoad
  drawResistor(ctx, { x: xLoad, y: cy - 18 }, { x: xLoad, y: cy + 18 }, {
    color: '#6cc5c2',
    label: `R_L ${fmtR(st.RL)}`,
    labelOffset: { x: 12, y: 0 },
  });
  drawWire(ctx, [{ x: xLoad, y: yTop }, { x: xLoad, y: cy - 18 }]);
  drawWire(ctx, [{ x: xLoad, y: cy + 18 }, { x: xLoad, y: yBot }]);

  // Readout near the load
  ctx.fillStyle = 'rgba(108,197,194,0.95)';
  ctx.font = 'bold 10px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(`V_L = ${st.Vload.toFixed(2)} V`, xLoad + 12, cy - 8);
  ctx.fillStyle = 'rgba(91,174,248,0.95)';
  ctx.fillText(`I_L = ${(st.Iload * 1000).toFixed(1)} mA`, xLoad + 12, cy + 8);
}

function drawThevenin(
  ctx: CanvasRenderingContext2D,
  x0: number, y0: number, w: number, h: number, st: ST,
) {
  const cy = y0 + h / 2;
  const xBat = x0 + 50;
  const xR = x0 + w * 0.45;
  const xLoad = x0 + w - 40;
  const yTop = cy - 50;
  const yBot = cy + 50;

  // Top wire: V_th + → R_th → load
  drawWire(ctx, [{ x: xBat, y: yTop }, { x: xR - 22, y: yTop }]);
  drawResistor(ctx, { x: xR - 20, y: yTop }, { x: xR + 20, y: yTop }, {
    color: '#ff6b2a',
    label: `R_th ${fmtR(st.Rth)}`,
    labelOffset: { x: 0, y: -10 },
  });
  drawWire(ctx, [{ x: xR + 22, y: yTop }, { x: xLoad, y: yTop }]);

  drawBattery(ctx, { x: xBat, y: cy }, {
    label: `V_th=${st.Vth.toFixed(1)}V`,
    leadLength: 50,
  });

  drawWire(ctx, [{ x: xBat, y: yBot }, { x: xLoad, y: yBot }]);

  drawResistor(ctx, { x: xLoad, y: cy - 18 }, { x: xLoad, y: cy + 18 }, {
    color: '#6cc5c2',
    label: `R_L ${fmtR(st.RL)}`,
    labelOffset: { x: 12, y: 0 },
  });
  drawWire(ctx, [{ x: xLoad, y: yTop }, { x: xLoad, y: cy - 18 }]);
  drawWire(ctx, [{ x: xLoad, y: cy + 18 }, { x: xLoad, y: yBot }]);

  ctx.fillStyle = 'rgba(108,197,194,0.95)';
  ctx.font = 'bold 10px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(`V_L = ${st.Vload.toFixed(2)} V`, xLoad + 12, cy - 8);
  ctx.fillStyle = 'rgba(91,174,248,0.95)';
  ctx.fillText(`I_L = ${(st.Iload * 1000).toFixed(1)} mA`, xLoad + 12, cy + 8);
}

function fmtR(R: number): string {
  if (R >= 1e6) return (R / 1e6).toFixed(1) + ' MΩ';
  if (R >= 1e3) return (R / 1e3).toFixed(1) + ' kΩ';
  return R.toFixed(0) + ' Ω';
}
