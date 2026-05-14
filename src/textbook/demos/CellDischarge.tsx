/**
 * Demo 18.4 — Cell discharge curve
 *
 * Model: a battery has open-circuit voltage V_OC and internal resistance R_int.
 * The terminal voltage under load R_L is V_term = V_OC · R_L / (R_int + R_L).
 * As the cell discharges (charge q drawn), V_OC drops, slowly at first then
 * sharply near the end. The reader watches V_term fall on the live trace.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import {
  Demo, DemoControls, MiniReadout, MiniSlider, MiniToggle,
} from '@/components/Demo';
import { Num } from '@/components/Num';
import { getCanvasColors } from '@/lib/canvasTheme';

interface Props { figure?: string }

const Q_CAPACITY = 1.0; // arbitrary unit; charge to "empty"

// A rough flat-then-knee discharge profile.
function V_OC_of_state(soc: number, V_full: number, V_empty: number): number {
  // soc: state of charge in [0, 1] (1 = full)
  // Slight droop, then sharp knee near empty
  const x = Math.max(0, Math.min(1, soc));
  if (x > 0.1) {
    return V_empty + (V_full - V_empty) * (0.92 + 0.08 * x) * (0.8 + 0.2 * Math.pow(x, 0.3));
  }
  return V_empty + (V_full - V_empty) * (x / 0.1) * 0.85;
}

export function CellDischargeDemo({ figure }: Props) {
  const V_full = 1.55;  // V open-circuit at full charge (alkaline-cell flavour)
  const V_empty = 0.9;  // V open-circuit at empty
  const [R_int, setR_int] = useState(0.3); // Ω
  const [R_L, setR_L] = useState(5);       // Ω
  const [running, setRunning] = useState(false);
  const [soc, setSoc] = useState(1.0); // state of charge

  const V_OC = V_OC_of_state(soc, V_full, V_empty);
  const I = V_OC / (R_int + R_L);
  const V_term = V_OC * R_L / (R_int + R_L);

  // Integrate charge drawn over time when running
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setSoc(prev => {
        const v = V_OC_of_state(prev, V_full, V_empty);
        const iNow = v / (R_int + R_L);
        const dq = iNow * 0.02; // tick = 20 ms of fast-forward time
        return Math.max(0, prev - dq / (Q_CAPACITY * 8));
      });
    }, 50);
    return () => window.clearInterval(id);
  }, [running, R_int, R_L]);

  // Trace history: (soc, V_term)
  const traceRef = useRef<Array<{ soc: number; v: number }>>([]);
  useEffect(() => {
    traceRef.current.push({ soc, v: V_term });
    if (traceRef.current.length > 400) traceRef.current.shift();
  }, [soc, V_term]);

  const stateRef = useRef({ V_term, V_OC, soc, R_int, R_L });
  useEffect(() => { stateRef.current = { V_term, V_OC, soc, R_int, R_L }; },
    [V_term, V_OC, soc, R_int, R_L]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w: W, h: H } = info;
    let raf = 0;

    function draw() {
      ctx.fillStyle = getCanvasColors().bg;
      ctx.fillRect(0, 0, W, H);

      const pX = 36, pY = 22;
      const pW = W - 60, pH = H - 50;
      ctx.strokeStyle = getCanvasColors().border;
      ctx.strokeRect(pX, pY, pW, pH);

      // V axis 0 .. V_full + 0.1
      const vMax = V_full + 0.1;
      const yV = (v: number) => pY + pH - (v / vMax) * pH;

      // x: SOC from 1 (full, left) to 0 (empty, right)
      const xSOC = (s: number) => pX + (1 - s) * pW;

      // Theoretical V_OC curve
      ctx.strokeStyle = getCanvasColors().teal;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      for (let i = 0; i <= 80; i++) {
        const s = 1 - i / 80;
        const v = V_OC_of_state(s, V_full, V_empty);
        const x = xSOC(s);
        const y = yV(v);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Theoretical V_term under current load
      ctx.strokeStyle = getCanvasColors().accent;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      const s = stateRef.current;
      for (let i = 0; i <= 80; i++) {
        const sc = 1 - i / 80;
        const v_oc = V_OC_of_state(sc, V_full, V_empty);
        const v_term = v_oc * s.R_L / (s.R_int + s.R_L);
        const x = xSOC(sc);
        const y = yV(v_term);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Marker
      const mx = xSOC(s.soc);
      const my = yV(s.V_term);
      ctx.fillStyle = 'rgba(255,59,110,1)';
      ctx.beginPath();
      ctx.arc(mx, my, 5, 0, Math.PI * 2);
      ctx.fill();

      // Axes
      ctx.fillStyle = getCanvasColors().textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('V', pX, 6);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('full', pX, pY + pH + 4);
      ctx.textAlign = 'right';
      ctx.fillText('empty', pX + pW, pY + pH + 4);

      ctx.fillStyle = getCanvasColors().teal;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'top';
      ctx.fillText('V_OC (open)', pX + pW - 4, pY + 4);
      ctx.fillStyle = getCanvasColors().accent;
      ctx.fillText('V_term (loaded)', pX + pW - 4, pY + 18);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 18.4'}
      title="Discharge: V drops as the cell empties"
      question="Why does a fresh battery 'feel' stronger than an old one?"
      caption={
        <>
          A real cell is an open-circuit voltage <strong>V_OC</strong> in series with an internal resistance
          <strong> R_int</strong>. Under a load R_L the terminal voltage <em>V_term = V_OC · R_L / (R_int + R_L)</em>
          sags below V_OC by the IR drop across the internal resistance. As the chemistry depletes, V_OC itself falls
          (slowly through the plateau, then sharply near the knee), and the loaded voltage follows.
        </>
      }
    >
      <AutoResizeCanvas height={240} setup={setup} />
      <DemoControls>
        <MiniToggle
          label={running ? 'Discharging…' : 'Start discharge'}
          checked={running}
          onChange={setRunning}
        />
        <button type="button" className="mini-toggle" onClick={() => { setSoc(1.0); setRunning(false); traceRef.current = []; }}>
          Reset
        </button>
        <MiniSlider
          label="R_int"
          value={R_int} min={0.05} max={3} step={0.05}
          format={v => v.toFixed(2) + ' Ω'}
          onChange={setR_int}
        />
        <MiniSlider
          label="R_load"
          value={R_L} min={0.5} max={50} step={0.5}
          format={v => v.toFixed(1) + ' Ω'}
          onChange={setR_L}
        />
        <MiniReadout label="V_OC" value={<Num value={V_OC} />} unit="V" />
        <MiniReadout label="V_term" value={<Num value={V_term} />} unit="V" />
        <MiniReadout label="I" value={<Num value={I} />} unit="A" />
        <MiniReadout label="SOC" value={(soc * 100).toFixed(0) + ' %'} />
      </DemoControls>
    </Demo>
  );
}
