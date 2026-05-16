/**
 * Demo 42.3 — Fiber link budget calculator
 *
 * Visualises a long-haul optical link as a horizontal power-vs-distance plot.
 * Reader sets launch power, fiber loss (dB/km), connector + splice loss, and
 * the receiver sensitivity. The plot shows P(km) sliding down at -α dB/km
 * and the link reach where the curve crosses the receiver threshold.
 *
 * The same physics governs every fiber link — datacenter MM at 850 nm, FTTH
 * at 1310 nm, submarine at 1550 nm. The only knobs that change are launch
 * power, fiber loss coefficient, and receiver sensitivity (modulation
 * format + symbol rate).
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider } from '@/components/Demo';
import { getCanvasColors } from '@/lib/canvasTheme';

export function FiberLinkBudgetDemo() {
  const [launchDbm, setLaunchDbm] = useState(0); // dBm launched at TX
  const [alpha, setAlpha] = useState(0.22); // dB/km fiber loss
  const [extraLoss, setExtraLoss] = useState(2); // dB connectors + splices total
  const [rxSens, setRxSens] = useState(-28); // dBm receiver sensitivity

  const stateRef = useRef({ launchDbm, alpha, extraLoss, rxSens });
  useEffect(() => {
    stateRef.current = { launchDbm, alpha, extraLoss, rxSens };
  }, [launchDbm, alpha, extraLoss, rxSens]);

  // Maximum reach: launchDbm − extraLoss − α·L = rxSens
  // ⇒ L = (launchDbm − extraLoss − rxSens) / α
  const budget = launchDbm - extraLoss - rxSens;
  const reachKm = budget > 0 && alpha > 0 ? budget / alpha : 0;

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w: W, h: H } = info;
    let raf = 0;

    function draw() {
      const { launchDbm, alpha, extraLoss, rxSens } = stateRef.current;
      const colors = getCanvasColors();
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, W, H);

      const padL = 50,
        padR = 18,
        padT = 18,
        padB = 30;
      const plotW = W - padL - padR;
      const plotH = H - padT - padB;
      const kmMax = 250;
      const dBmMax = 5,
        dBmMin = -35;

      const xOfKm = (km: number) => padL + (km / kmMax) * plotW;
      const yOfDbm = (db: number) => padT + ((dBmMax - db) / (dBmMax - dBmMin)) * plotH;

      // Axis frame
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = 1;
      ctx.strokeRect(padL, padT, plotW, plotH);

      // Horizontal RX sensitivity threshold — theme-aware pink token.
      ctx.strokeStyle = colors.pink;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      const yRx = yOfDbm(rxSens);
      ctx.moveTo(padL, yRx);
      ctx.lineTo(padL + plotW, yRx);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = colors.pink;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`Rx sens ${rxSens.toFixed(0)} dBm`, padL + 6, yRx - 4);

      // Power curve: start at launchDbm − extraLoss at km=0 (insertion loss before launch)
      // then drop at -α per km
      const pAtZero = launchDbm - extraLoss;
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      // Draw the connector loss step at the very left
      ctx.moveTo(padL, yOfDbm(launchDbm));
      ctx.lineTo(padL + 2, yOfDbm(launchDbm));
      ctx.lineTo(padL + 2, yOfDbm(pAtZero));
      // Fiber slope
      for (let km = 0; km <= kmMax; km += 1) {
        const p = pAtZero - alpha * km;
        ctx.lineTo(xOfKm(km), yOfDbm(p));
      }
      ctx.stroke();

      // Reach marker — drop dotted vertical from intersection
      const reach = (pAtZero - rxSens) / Math.max(alpha, 0.0001);
      if (reach > 0 && reach <= kmMax) {
        const xR = xOfKm(reach);
        ctx.strokeStyle = colors.teal;
        ctx.setLineDash([2, 3]);
        ctx.beginPath();
        ctx.moveTo(xR, padT);
        ctx.lineTo(xR, padT + plotH);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = colors.teal;
        ctx.textAlign = 'center';
        ctx.fillText(`reach ${reach.toFixed(0)} km`, xR, padT + 12);
      }

      // X ticks
      ctx.fillStyle = colors.textMuted;
      ctx.textAlign = 'center';
      for (const km of [0, 50, 100, 150, 200, 250]) {
        ctx.fillText(`${km}`, xOfKm(km), padT + plotH + 14);
      }
      // Y ticks
      ctx.textAlign = 'right';
      for (const db of [0, -10, -20, -30]) {
        ctx.fillText(`${db}`, padL - 6, yOfDbm(db) + 3);
      }
      ctx.fillStyle = colors.textDim;
      ctx.textAlign = 'left';
      ctx.fillText('distance (km)', padL, H - 6);
      ctx.save();
      ctx.translate(12, padT + plotH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.fillText('power (dBm)', 0, 0);
      ctx.restore();

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure="Fig. 42.3"
      title="The fiber-optic link budget, end to end"
      question="How far can a 1 mW laser drive a fiber before the receiver loses lock?"
      caption={
        <>
          The plot is a one-equation argument: <strong>P_rx = P_tx − L_conn − α·L</strong>. Drag the
          sliders to see how launch power, fiber loss, and connector loss trade against receiver
          sensitivity. A typical metro link at 1550 nm puts +0 dBm of DFB-laser power into G.652
          fiber at 0.22 dB/km with 2 dB of accumulated splice loss; a coherent receiver sits at
          roughly −28 dBm. That budget reaches ~120 km of fiber without amplification — the spacing
          between EDFAs on a long-haul span.
        </>
      }
    >
      <AutoResizeCanvas height={240} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="launch P"
          value={launchDbm}
          min={-5}
          max={5}
          step={0.5}
          format={(v) => `${v.toFixed(1)} dBm`}
          onChange={setLaunchDbm}
        />
        <MiniSlider
          label="α"
          value={alpha}
          min={0.15}
          max={3}
          step={0.01}
          format={(v) => `${v.toFixed(2)} dB/km`}
          onChange={setAlpha}
        />
        <MiniSlider
          label="connector + splice loss"
          value={extraLoss}
          min={0}
          max={10}
          step={0.5}
          format={(v) => `${v.toFixed(1)} dB`}
          onChange={setExtraLoss}
        />
        <MiniSlider
          label="Rx sens"
          value={rxSens}
          min={-40}
          max={-15}
          step={1}
          format={(v) => `${v.toFixed(0)} dBm`}
          onChange={setRxSens}
        />
        <MiniReadout label="link budget" value={budget.toFixed(1)} unit="dB" />
        <MiniReadout label="reach" value={reachKm.toFixed(0)} unit="km" />
      </DemoControls>
    </Demo>
  );
}
