/**
 * Demo 25.5 — Cell discharge curve
 *
 * Model: a battery has open-circuit voltage V_OC and internal resistance R_int.
 * The terminal voltage under load R_L is V_term = V_OC · R_L / (R_int + R_L).
 * As the cell discharges (charge q drawn), V_OC drops, slowly at first then
 * sharply near the end. The reader watches V_term fall on the live trace.
 */
import { useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import {
  Demo,
  DemoControls,
  EquationStrip,
  MiniReadout,
  MiniSlider,
  MiniToggle,
} from '@/components/Demo';
import { M } from '@/components/Formula';
import { Num } from '@/components/Num';
import { drawAxes, drawLinePlot, makePlotMappers } from '@/lib/drawPlot';
import { getCanvasColors } from '@/lib/canvasTheme';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';
import { drawLabel } from '@/lib/canvasLayout';

interface Props {
  figure: string;
}

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
  const V_full = 1.55; // V open-circuit at full charge (alkaline-cell flavour)
  const V_empty = 0.9; // V open-circuit at empty
  const [R_int, setR_int] = useState(0.3); // Ω
  const [R_L, setR_L] = useState(5); // Ω
  const [running, setRunning] = useState(false);
  const [soc, setSoc] = useState(1.0); // state of charge

  const V_OC = V_OC_of_state(soc, V_full, V_empty);
  const I = V_OC / (R_int + R_L);
  const V_term = (V_OC * R_L) / (R_int + R_L);

  // Integrate charge drawn over time when running
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setSoc((prev) => {
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

  const stateRef = useSimState({ V_term, V_OC, soc, R_int, R_L });

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w: W, h: H }) => {
      const colors = getCanvasColors();
      const s = stateRef.current;

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, W, H);

      const pX = 36,
        pY = 22;
      const pW = W - 60,
        pH = H - 50;
      const rect = { x: pX, y: pY, w: pW, h: pH };

      // V axis 0 .. V_full + 0.1
      const vMax = V_full + 0.1;
      const { xOf, yOf } = makePlotMappers(rect, 0, 1, 0, vMax);

      drawAxes(ctx, rect, {
        xMin: 0,
        xMax: 1,
        yMin: 0,
        yMax: vMax,
        xTicks: [0, 0.25, 0.5, 0.75, 1],
        yTicks: [0, 0.5, 1.0, 1.5],
      });

      // Theoretical V_OC curve
      const ocPts: Array<{ x: number; y: number }> = [];
      for (let i = 0; i <= 80; i++) {
        const sc = 1 - i / 80;
        ocPts.push({ x: 1 - sc, y: V_OC_of_state(sc, V_full, V_empty) });
      }
      drawLinePlot(ctx, rect, ocPts, 0, 1, 0, vMax, {
        color: colors.teal,
        lineWidth: 1.4,
      });

      // Theoretical V_term under current load
      const termPts: Array<{ x: number; y: number }> = [];
      for (let i = 0; i <= 80; i++) {
        const sc = 1 - i / 80;
        const v_oc = V_OC_of_state(sc, V_full, V_empty);
        const v_term = (v_oc * s.R_L) / (s.R_int + s.R_L);
        termPts.push({ x: 1 - sc, y: v_term });
      }
      drawLinePlot(ctx, rect, termPts, 0, 1, 0, vMax, {
        color: colors.accent,
        lineWidth: 1.8,
      });

      // Marker
      const mx = xOf(1 - s.soc);
      const my = yOf(s.V_term);
      ctx.fillStyle = colors.pink;
      ctx.beginPath();
      ctx.arc(mx, my, 5, 0, Math.PI * 2);
      ctx.fill();

      // Labels
      ctx.fillStyle = colors.textDim;
      drawLabel(ctx, {
        text: 'V',
        x: pX,
        y: 6,
        font: '10px "JetBrains Mono", monospace',
        baseline: 'top',
      });
      drawLabel(ctx, {
        text: 'full',
        x: pX,
        y: pY + pH + 4,
        font: '10px "JetBrains Mono", monospace',
        baseline: 'top',
      });
      drawLabel(ctx, {
        text: 'empty',
        x: pX + pW,
        y: pY + pH + 4,
        font: '10px "JetBrains Mono", monospace',
        align: 'right',
        baseline: 'top',
      });
      drawLabel(ctx, {
        text: 'V_OC (open)',
        x: pX + pW - 4,
        y: pY + 4,
        color: colors.teal,
        font: '10px "JetBrains Mono", monospace',
        align: 'right',
        baseline: 'top',
      });
      drawLabel(ctx, {
        text: 'V_term (loaded)',
        x: pX + pW - 4,
        y: pY + 18,
        color: colors.accent,
        font: '10px "JetBrains Mono", monospace',
        align: 'right',
        baseline: 'top',
      });
    },
    [],
  );

  return (
    <Demo
      figure={figure}
      title="Discharge: V drops as the cell empties"
      question="Why does a fresh battery 'feel' stronger than an old one?"
      caption={
        <>
          A real cell is an open-circuit voltage <strong>V_OC</strong> in series with an internal
          resistance
          <strong> R_int</strong>. Under a load R_L the terminal voltage{' '}
          <em>V_term = V_OC · R_L / (R_int + R_L)</em>
          sags below V_OC by the IR drop across the internal resistance. As the chemistry depletes,
          V_OC itself falls (slowly through the plateau, then sharply near the knee), and the loaded
          voltage follows.
        </>
      }
      deeperLab={{ slug: 'cell-emf', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={240} setup={setup} />
      <DemoControls>
        <MiniToggle
          label={running ? 'Discharging…' : 'Start discharge'}
          checked={running}
          onChange={setRunning}
        />
        <button
          type="button"
          className="mini-toggle"
          onClick={() => {
            setSoc(1.0);
            setRunning(false);
            traceRef.current = [];
          }}
        >
          Reset
        </button>
        <MiniSlider
          label="R_int"
          value={R_int}
          min={0.05}
          max={3}
          step={0.05}
          format={(v) => v.toFixed(2) + ' Ω'}
          onChange={setR_int}
        />
        <MiniSlider
          label="R_L"
          value={R_L}
          min={1}
          max={50}
          step={0.5}
          format={(v) => v.toFixed(1) + ' Ω'}
          onChange={setR_L}
        />
        <MiniReadout label="V_OC" value={<Num value={V_OC} digits={2} />} unit="V" />
        <MiniReadout label="V_term" value={<Num value={V_term} digits={2} />} unit="V" />
        <MiniReadout label="I" value={<Num value={I} digits={3} />} unit="A" />
      </DemoControls>
      <EquationStrip
        leftLabel="Terminal voltage under load"
        left={
          <M tex={`V_{\\text{term}} = \\frac{V_{\\text{OC}} \\cdot R_L}{R_{\\text{int}} + R_L}`} />
        }
        rightLabel="At this operating point"
        right={
          <M
            tex={`\\frac{${V_OC.toFixed(2)} \\times ${R_L.toFixed(1)}}{${R_int.toFixed(2)} + ${R_L.toFixed(1)}} = ${V_term.toFixed(2)}\\,\\text{V}`}
          />
        }
      />
    </Demo>
  );
}
