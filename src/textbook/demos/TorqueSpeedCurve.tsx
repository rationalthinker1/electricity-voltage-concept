/**
 * Demo D16.6 — Torque-vs-speed curves for four motor families.
 *
 *   • DC brushed:    τ(n) = τ_0 (1 − n/n_0)        linear droop
 *   • Induction:     τ(n) classic Kloss curve, peaks just below n_s
 *   • Synchronous:   vertical line at n_s          constant speed
 *   • Stepper:       roughly hyperbolic — flat then sharp drop
 *
 * Toggle which curves are shown; static plot otherwise. Reading is the
 * canonical "match the motor to your load" diagram.
 */
import { useState } from 'react';
import { drawLabel } from '@/lib/canvasLayout';
import { withAlpha } from '@/lib/canvasTheme';
import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniToggle } from '@/components/Demo';
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';


interface Props {
  figure?: string;
}

export function TorqueSpeedCurveDemo({ figure }: Props) {
  const [showDC, setShowDC] = useState(true);
  const [showInd, setShowInd] = useState(true);
  const [showSync, setShowSync] = useState(true);
  const [showStep, setShowStep] = useState(true);

  const stateRef = useSimState({ showDC, showInd, showSync, showStep });
  const setup = useSimLoop(
      stateRef,
      ({ ctx, w, h, colors }, _state, _dt, _simTime) => {
        const { showDC, showInd, showSync, showStep } = stateRef.current;
        ctx.fillStyle = colors.bg;
        ctx.fillRect(0, 0, w, h);
        const padL = 60,
                padR = 30,
                padT = 24,
                padB = 50;
        const plotW = w - padL - padR;
        const plotH = h - padT - padB;
        const plotX = padL;
        const plotY = padT;
        ctx.strokeStyle = colors.borderStrong;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(plotX, plotY);
        ctx.lineTo(plotX, plotY + plotH);
        ctx.lineTo(plotX + plotW, plotY + plotH);
        ctx.stroke();
        ctx.strokeStyle = colors.border;
        for (let i = 1; i <= 4; i++) {
                const x = plotX + (i / 5) * plotW;
                ctx.beginPath();
                ctx.moveTo(x, plotY);
                ctx.lineTo(x, plotY + plotH);
                ctx.stroke();
                const y = plotY + (i / 5) * plotH;
                ctx.beginPath();
                ctx.moveTo(plotX, y);
                ctx.lineTo(plotX + plotW, y);
                ctx.stroke();
              }
        ctx.fillStyle = colors.textDim;
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText('speed →', plotX + plotW / 2, plotY + plotH + 18);
        ctx.save();
        ctx.translate(20, plotY + plotH / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textBaseline = 'middle';
        ctx.fillText('torque →', 0, 0);
        ctx.restore();
        const nsX = plotX + 0.85 * plotW;
        ctx.strokeStyle = withAlpha(colors.teal, 0.25);
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(nsX, plotY);
        ctx.lineTo(nsX, plotY + plotH);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = colors.teal;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText('n_s', nsX, plotY - 4);
        const mapX = (nFrac: number) => plotX + nFrac * plotW;
        const mapY = (tFrac: number) => plotY + plotH - tFrac * plotH;
        let legendY = plotY + 8;
        const legendX = plotX + plotW - 130;
        function legendLine(color: string, label: string) {
                ctx.fillStyle = color;
                ctx.fillRect(legendX, legendY + 4, 18, 2);
                drawLabel(ctx, {
                  x: legendX + 24,
                  y: legendY + 5,
                  text: label,
                  color: colors.text,
                  baseline: 'middle',
                });
                legendY += 16;
              }
        if (showDC) {
                const color = '#ff6b2a';
                ctx.strokeStyle = color;
                ctx.lineWidth = 2;
                ctx.beginPath();
                const tau0 = 0.95;
                const n0 = 0.95;
                for (let i = 0; i <= 60; i++) {
                  const n = (i / 60) * n0;
                  const tau = tau0 * (1 - n / n0);
                  const x = mapX(n);
                  const y = mapY(tau);
                  if (i === 0) ctx.moveTo(x, y);
                  else ctx.lineTo(x, y);
                }
                ctx.stroke();
                legendLine(color, 'DC brushed');
              }
        if (showInd) {
                const color = '#5baef8';
                ctx.strokeStyle = color;
                ctx.lineWidth = 2;
                ctx.beginPath();
                const sM = 0.15;
                const tauMax = 0.9;
                const n_s = 0.85;
                for (let i = 0; i <= 80; i++) {
                  const n = (i / 80) * n_s;
                  const s = (n_s - n) / n_s;
                  const eps = 1e-3;
                  const tau = (2 * tauMax) / (s / sM + sM / Math.max(s, eps));
                  const x = mapX(n);
                  const y = mapY(tau);
                  if (i === 0) ctx.moveTo(x, y);
                  else ctx.lineTo(x, y);
                }
                ctx.stroke();
                legendLine(color, 'induction');
              }
        if (showSync) {
                const color = '#6cc5c2';
                ctx.strokeStyle = color;
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.moveTo(nsX, mapY(0));
                ctx.lineTo(nsX, mapY(0.9));
                ctx.stroke();
                legendLine(color, 'synchronous');
              }
        if (showStep) {
                const color = '#ff3b6e';
                ctx.strokeStyle = color;
                ctx.lineWidth = 2;
                ctx.beginPath();
                const tau0 = 0.85;
                const nP = 0.35;
                const k = 3.5;
                for (let i = 0; i <= 60; i++) {
                  const n = (i / 60) * 0.9;
                  const tau = tau0 / (1 + Math.pow(n / nP, k));
                  const x = mapX(n);
                  const y = mapY(tau);
                  if (i === 0) ctx.moveTo(x, y);
                  else ctx.lineTo(x, y);
                }
                ctx.stroke();
                legendLine(color, 'stepper');
              }
      },
      [],
    );

  return (
    <Demo
      figure={figure ?? 'Fig. 16.6'}
      title="Torque–speed: four different shapes"
      question="The right motor is the one whose curve crosses your load's curve where you want it to."
      caption={
        <>
          DC brushed motors: torque falls linearly with speed (stalls hardest at zero, free-runs at
          no load). Induction: peak near synchronous speed, sharp roll-off below it. Synchronous: a
          vertical line at{' '}
          <em>
            n<sub>s</sub>
          </em>
          ; speed doesn't change with load, period. Stepper: a roughly flat region followed by a
          sharp drop above the pull-out frequency. Pick the curve that intersects your load's
          mechanical impedance at the operating point you want.
        </>
      }
    >
      <AutoResizeCanvas height={320} setup={setup} />
      <DemoControls>
        <MiniToggle label="DC brushed" checked={showDC} onChange={setShowDC} />
        <MiniToggle label="induction" checked={showInd} onChange={setShowInd} />
        <MiniToggle label="synchronous" checked={showSync} onChange={setShowSync} />
        <MiniToggle label="stepper" checked={showStep} onChange={setShowStep} />
      </DemoControls>
    </Demo>
  );
}
