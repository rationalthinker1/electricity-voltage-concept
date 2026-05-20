/**
 * Demo D2.2 — V_ab, W = qV, and V = ΔU/q in one picture
 *
 * Two horizontal "potential platforms" at heights V_a and V_b on a shared
 * vertical voltage axis. A signed test charge q is animated between the
 * two platforms; as it moves a → b its electrical potential energy changes
 * by ΔU = qV_ab where V_ab = V_b - V_a, and the work done on the charge
 * (by whatever agent moves it) is W = qV_ab. Three sliders (V_a, V_b, q)
 * drive everything; an EquationStrip beneath the controls shows the same
 * three identities with the current numbers substituted in.
 *
 * Pedagogical thrust: voltage is always a difference (V_ab), and that
 * single difference is the only thing the energy bookkeeping cares about.
 * Flip the sign of q and the same V_ab now represents released energy
 * (the charge slides downhill on its own) instead of work invested.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import {
  Demo,
  DemoControls,
  EquationStrip,
  MiniReadout,
  MiniSlider,
} from '@/components/Demo';
import { InlineMath } from '@/components/Formula';
import { getCanvasColors } from '@/lib/canvasTheme';

interface Props {
  figure?: string;
}

export function VabWorkEnergyDemo({ figure }: Props) {
  const [Va, setVa] = useState(2); // volts
  const [Vb, setVb] = useState(8); // volts
  const [qMicro, setQMicro] = useState(1); // µC, signed

  const stateRef = useRef({ Va, Vb, qMicro });
  useEffect(() => {
    stateRef.current = { Va, Vb, qMicro };
  }, [Va, Vb, qMicro]);

  // Real values for readouts and equation strip.
  const q = qMicro * 1e-6; // C
  const Vab = Vb - Va; // V
  const W = q * Vab; // J — work done ON the charge to move it a → b
  const dU = W; // J — equal by definition (ΔU = qV_ab)

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h } = info;
    let raf = 0;
    let last = performance.now();
    // Animated parameter t ∈ [0,1]: charge position between platform A (t=0)
    // and platform B (t=1). Bounces back and forth so the reader can watch
    // the charge make the trip in both directions.
    let t = 0;
    let dir = 1; // +1 going a→b, -1 going b→a

    function draw(now: number) {
      const colors = getCanvasColors();
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const { Va, Vb, qMicro } = stateRef.current;
      const q = qMicro * 1e-6;
      const Vab = Vb - Va;

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      // Layout. Voltage axis runs along the left, vertical, from 0 V at the
      // bottom to V_MAX at the top. Platforms A and B sit at the y matching
      // their voltages.
      const padL = 70;
      const padR = 70;
      const padT = 30;
      const padB = 40;
      const V_MAX = 12;
      const axX = padL;
      const axY0 = h - padB;
      const axY1 = padT;
      const yFromV = (V: number) => axY0 + (V / V_MAX) * (axY1 - axY0);

      // Voltage axis line.
      ctx.strokeStyle = colors.borderStrong;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(axX, axY0);
      ctx.lineTo(axX, axY1);
      ctx.stroke();
      // Tick marks every 2 V.
      ctx.fillStyle = colors.textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      for (let V = 0; V <= V_MAX; V += 2) {
        const y = yFromV(V);
        ctx.beginPath();
        ctx.moveTo(axX - 4, y);
        ctx.lineTo(axX, y);
        ctx.strokeStyle = colors.borderStrong;
        ctx.stroke();
        ctx.fillStyle = colors.textDim;
        ctx.fillText(`${V}`, axX - 8, y);
      }
      // Axis label.
      ctx.save();
      ctx.translate(20, (axY0 + axY1) / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.fillStyle = colors.text;
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillText('potential V (volts)', 0, 0);
      ctx.restore();

      // Platforms A and B.
      const platLeft = axX + 80;
      const platRight = w - padR;
      const platMidX = (platLeft + platRight) / 2;
      const yA = yFromV(Va);
      const yB = yFromV(Vb);

      const drawPlatform = (
        y: number,
        label: string,
        Vlabel: number,
        color: string,
      ) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(platLeft, y);
        ctx.lineTo(platRight, y);
        ctx.stroke();
        // Dashed extension back to the V axis so the height reads.
        ctx.setLineDash([3, 4]);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(axX, y);
        ctx.lineTo(platLeft, y);
        ctx.stroke();
        ctx.setLineDash([]);
        // Label.
        ctx.fillStyle = color;
        ctx.font = 'bold 12px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${label}: ${Vlabel.toFixed(1)} V`, platRight + 8, y);
      };
      drawPlatform(yA, 'a', Va, colors.teal);
      drawPlatform(yB, 'b', Vb, colors.accent);

      // V_ab bracket between the two platforms — drawn on the right side
      // of the canvas so it doesn't collide with the moving charge.
      const bracketX = platRight - 30;
      const yHi = Math.min(yA, yB);
      const yLo = Math.max(yA, yB);
      if (Math.abs(yA - yB) > 8) {
        ctx.strokeStyle = colors.textDim;
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 3]);
        ctx.beginPath();
        ctx.moveTo(bracketX, yHi);
        ctx.lineTo(bracketX, yLo);
        ctx.stroke();
        ctx.setLineDash([]);
        // Tiny caps.
        ctx.beginPath();
        ctx.moveTo(bracketX - 4, yHi);
        ctx.lineTo(bracketX + 4, yHi);
        ctx.moveTo(bracketX - 4, yLo);
        ctx.lineTo(bracketX + 4, yLo);
        ctx.stroke();
        // V_ab label, placed off the bracket.
        ctx.fillStyle = colors.textDim;
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          `V_ab = ${Vab >= 0 ? '+' : ''}${Vab.toFixed(1)} V`,
          bracketX - 8,
          (yHi + yLo) / 2,
        );
      }

      // Animate t in [0,1]. Faster when the charge has further to travel
      // visually so the round-trip looks roughly uniform.
      const tripSeconds = 2.4;
      t += (dir * dt) / tripSeconds;
      if (t > 1) {
        t = 1;
        dir = -1;
      } else if (t < 0) {
        t = 0;
        dir = 1;
      }

      // Charge position along a smooth arc between A and B.
      const xC = platMidX + Math.sin(t * Math.PI) * -30; // slight bow to the left
      const yC = yA + (yB - yA) * t;

      // Direction arrow from a to b (or b to a, matching current animation
      // direction).
      const arrowFromY = dir > 0 ? yA : yB;
      const arrowToY = dir > 0 ? yB : yA;
      const arrowX = platMidX + 30;
      ctx.strokeStyle = 'rgba(160,158,149,.5)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(arrowX, arrowFromY);
      ctx.lineTo(arrowX, arrowToY);
      ctx.stroke();
      ctx.setLineDash([]);
      // Arrowhead at the destination.
      const head = 5;
      const sgn = arrowToY > arrowFromY ? 1 : -1;
      ctx.fillStyle = 'rgba(160,158,149,.7)';
      ctx.beginPath();
      ctx.moveTo(arrowX, arrowToY);
      ctx.lineTo(arrowX - head, arrowToY - sgn * head * 1.6);
      ctx.lineTo(arrowX + head, arrowToY - sgn * head * 1.6);
      ctx.closePath();
      ctx.fill();

      // The charge — colour by sign, size by magnitude.
      const positive = qMicro >= 0;
      const radius = 9 + Math.min(8, Math.abs(qMicro) * 1.2);
      const fillCol = positive ? colors.pink : colors.blue;
      // Soft halo.
      const grd = ctx.createRadialGradient(xC, yC, 0, xC, yC, radius * 2.5);
      grd.addColorStop(0, positive ? 'rgba(255,59,110,.55)' : 'rgba(91,174,248,.55)');
      grd.addColorStop(1, positive ? 'rgba(255,59,110,0)' : 'rgba(91,174,248,0)');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(xC, yC, radius * 2.5, 0, Math.PI * 2);
      ctx.fill();
      // Filled body.
      ctx.fillStyle = fillCol;
      ctx.beginPath();
      ctx.arc(xC, yC, radius, 0, Math.PI * 2);
      ctx.fill();
      // Glyph.
      ctx.fillStyle = colors.bg;
      ctx.font = `bold ${Math.max(11, Math.round(radius))}px "JetBrains Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(positive ? '+' : '−', xC, yC + 1);
      // q value caption next to the charge.
      ctx.fillStyle = colors.text;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        `q = ${qMicro >= 0 ? '+' : ''}${qMicro.toFixed(2)} µC`,
        xC + radius + 6,
        yC,
      );

      // Energy ribbon along the bottom — width scales with |W|, colour
      // says whether work was done ON the charge (positive W, amber) or
      // released BY the charge (negative W, blue).
      const W_now = q * Vab;
      const W_MAX = 12 * 1e-6 * 12; // µC × V at extremes
      const Wnorm = Math.min(1, Math.abs(W_now) / W_MAX);
      const ribbonY = h - 14;
      const ribbonW = (platRight - platLeft) * Wnorm;
      const ribbonCol = W_now >= 0
        ? `rgba(255,107,42,${(0.5 + 0.4 * Wnorm).toFixed(3)})`
        : `rgba(91,174,248,${(0.5 + 0.4 * Wnorm).toFixed(3)})`;
      ctx.fillStyle = ribbonCol;
      ctx.fillRect(platLeft, ribbonY - 4, ribbonW, 8);
      ctx.strokeStyle = colors.borderStrong;
      ctx.lineWidth = 1;
      ctx.strokeRect(platLeft, ribbonY - 4, platRight - platLeft, 8);
      ctx.fillStyle = colors.textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        W_now >= 0 ? 'W done on charge' : 'energy released by charge',
        platLeft,
        ribbonY - 14,
      );

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Pretty-print the work / energy readouts in µJ when small enough.
  const fmtJ = (j: number) => {
    const aj = Math.abs(j);
    if (aj < 1e-3) return `${(j * 1e6).toFixed(2)} µJ`;
    if (aj < 1) return `${(j * 1e3).toFixed(2)} mJ`;
    return `${j.toFixed(3)} J`;
  };

  return (
    <Demo
      figure={figure ?? 'Fig. 2.2'}
      title="V_ab, W = qV, and ΔU/q — one picture"
      question="Move a charge q from point a to point b. How much work? How much energy changes hands?"
      caption={
        <>
          Set the two potentials and the test charge. The bar at the bottom shows the energy bookkeeping
          for one a → b trip: amber when work has to be invested in the charge (positive q climbing,
          or negative q falling), blue when the charge releases energy on its own. The same number,{' '}
          <em>qV<sub>ab</sub></em>, plays both roles — it is what we mean when we say voltage is
          energy per unit charge.
        </>
      }
      deeperLab={{ slug: 'potential', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="V_a"
          value={Va}
          min={0}
          max={12}
          step={0.1}
          format={(v) => v.toFixed(1) + ' V'}
          onChange={setVa}
        />
        <MiniSlider
          label="V_b"
          value={Vb}
          min={0}
          max={12}
          step={0.1}
          format={(v) => v.toFixed(1) + ' V'}
          onChange={setVb}
        />
        <MiniSlider
          label="q"
          value={qMicro}
          min={-10}
          max={10}
          step={0.1}
          format={(v) => (v >= 0 ? '+' : '') + v.toFixed(2) + ' µC'}
          onChange={setQMicro}
        />
        <MiniReadout label="V_ab = V_b − V_a" value={(Vab >= 0 ? '+' : '') + Vab.toFixed(2)} unit="V" />
        <MiniReadout label="W = q V_ab" value={fmtJ(W)} />
        <MiniReadout label="ΔU = q V_ab" value={fmtJ(dU)} />
      </DemoControls>
      <EquationStrip
        leftLabel="Voltage between the two points"
        left={
          <InlineMath
            tex={
              `V_{ab} \\;=\\; V_{b} - V_{a} \\;=\\; ` +
              `${Vb.toFixed(1)} - ${Va.toFixed(1)} \\;=\\; ` +
              `${Vab >= 0 ? '+' : ''}${Vab.toFixed(2)}\\ \\text{V}`
            }
          />
        }
        rightLabel="Work and energy across the trip"
        right={
          <InlineMath
            tex={
              `W \\;=\\; q\\,V_{ab} \\;=\\; \\Delta U \\;=\\; ` +
              `(${qMicro >= 0 ? '+' : ''}${qMicro.toFixed(2)}\\times 10^{-6})` +
              `(${Vab >= 0 ? '+' : ''}${Vab.toFixed(2)}) ` +
              `\\;\\approx\\; ${(W * 1e6).toFixed(2)}\\ \\mu\\text{J}`
            }
          />
        }
      />
    </Demo>
  );
}
