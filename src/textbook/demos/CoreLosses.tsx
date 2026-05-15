/**
 * Demo D18.5 — Core losses: hysteresis loop and eddy currents
 *
 * Left half: animated B-H trajectory tracing out a hysteresis loop on
 * each cycle. The enclosed area is the energy dissipated per cycle per
 * unit volume of core material.
 *
 * Right half: eddy current visualization. Toggle "laminated vs solid"
 * core cross-section; solid core has one big loop, laminated core has
 * many small loops. Eddy current loss scales as 1/N² where N is the
 * number of laminations (for the same total cross-section).
 *
 * Slider: drive amplitude (effectively peak B). Toggle: laminated vs solid.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniReadout, MiniSlider, MiniToggle } from '@/components/Demo';
import { Num } from '@/components/Num';

interface Props { figure?: string }

export function CoreLossesDemo({ figure }: Props) {
  const [drive, setDrive] = useState(1.0);          // peak H drive, arbitrary units
  const [laminated, setLaminated] = useState(true);

  const stateRef = useRef({ drive, laminated });
  useEffect(() => { stateRef.current = { drive, laminated }; }, [drive, laminated]);

  // Loss estimate: hysteresis loss scales with area ~ drive (Steinmetz: ~B^1.6).
  // Eddy-current loss scales as 1 (laminated) vs ~50 (solid) at the same drive.
  const N_LAMINATIONS = 50;
  const hystLoss = Math.pow(drive, 1.6);
  const eddyLoss = laminated ? 0.05 * drive * drive : 0.05 * drive * drive * N_LAMINATIONS;
  const totalLoss = hystLoss + eddyLoss;

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h, colors } = info;
    let raf = 0;
    let simT = 0;
    let lastT = performance.now();

    function draw() {
      const { drive, laminated } = stateRef.current;
      const now = performance.now();
      let dt = (now - lastT) / 1000;
      lastT = now;
      if (dt > 0.1) dt = 0.1;
      simT += dt;

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, w, h);

      const splitX = w * 0.5;

      // LEFT: B-H curve
      ctx.save();
      ctx.beginPath(); ctx.rect(0, 0, splitX, h); ctx.clip();
      const pad = 30;
      const cxL = splitX / 2;
      const cyL = h / 2;
      const plotW = splitX - 2 * pad;
      const plotH = h - 2 * pad;
      ctx.strokeStyle = colors.border;
      ctx.strokeRect(pad, pad, plotW, plotH);
      // axes
      ctx.strokeStyle = colors.borderStrong;
      ctx.beginPath();
      ctx.moveTo(pad, cyL); ctx.lineTo(pad + plotW, cyL);
      ctx.moveTo(cxL, pad); ctx.lineTo(cxL, pad + plotH);
      ctx.stroke();
      ctx.fillStyle = colors.textDim;
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText('B', cxL + 4, pad + 2);
      ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
      ctx.fillText('H', pad + plotW - 4, cyL - 4);

      // Loop trajectory. Parametric: H = drive·sin(ωt). B follows a
      // hysteresis-shaped lag using a phase-shifted saturating sigmoid.
      const omega = 2.0;
      const Hmax = drive;
      const Bmax = 1.0;
      const Hscale = plotW * 0.4;
      const Bscale = plotH * 0.4;
      const PHASE = 0.55;  // lag angle in radians (hysteresis)
      // Draw the full closed loop as a trace
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      const steps = 240;
      for (let i = 0; i <= steps; i++) {
        const tau = (i / steps) * 2 * Math.PI;
        const H = Hmax * Math.sin(tau);
        // Approximation: B saturates softly with H but with PHASE lag.
        const Bsat = Math.tanh((Hmax * Math.sin(tau - PHASE)) * 2);
        const B = Bmax * Bsat;
        const x = cxL + (H / Math.max(1, Hmax)) * Hscale * Hmax;
        const y = cyL - B * Bscale;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      // Loop fill — area = energy lost per cycle
      ctx.save();
      ctx.globalAlpha = 0.10;
      ctx.fillStyle = colors.accent;
      ctx.fill();
      ctx.restore();

      // Moving dot at current phase
      const tau = (omega * simT) % (2 * Math.PI);
      const H = Hmax * Math.sin(tau);
      const Bsat = Math.tanh((Hmax * Math.sin(tau - PHASE)) * 2);
      const B = Bmax * Bsat;
      const dx = cxL + (H / Math.max(1, Hmax)) * Hscale * Hmax;
      const dy = cyL - B * Bscale;
      ctx.fillStyle = colors.pink;
      ctx.beginPath(); ctx.arc(dx, dy, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = colors.textDim;
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText('B-H hysteresis loop', pad + 4, pad + 4);
      ctx.fillText('area = energy/cycle/m³', pad + 4, pad + 18);
      ctx.restore();

      // Divider
      ctx.strokeStyle = colors.border;
      ctx.beginPath(); ctx.moveTo(splitX, 0); ctx.lineTo(splitX, h); ctx.stroke();

      // RIGHT: eddy currents
      ctx.save();
      ctx.beginPath(); ctx.rect(splitX, 0, w - splitX, h); ctx.clip();
      const rpad = 30;
      const rx = splitX + rpad;
      const ry = rpad;
      const rw = (w - splitX) - 2 * rpad;
      const rh = h - 2 * rpad;
      ctx.save();
      ctx.globalAlpha = 0.45;
      ctx.strokeStyle = colors.textDim;
      ctx.lineWidth = 1.4;
      ctx.strokeRect(rx, ry, rw, rh);
      ctx.restore();

      // Flux into the page (centre dots)
      ctx.fillStyle = colors.teal;
      for (let i = 0; i < 16; i++) {
        const px = rx + (i % 4 + 1) * rw / 5;
        const py = ry + Math.floor(i / 4 + 1) * rh / 5;
        ctx.beginPath(); ctx.arc(px, py, 1.5, 0, Math.PI * 2); ctx.fill();
      }

      // Eddy current loops
      const tt = simT * 1.5;
      const animPhase = (Math.sin(tt) + 1) / 2;
      if (laminated) {
        // Many thin laminations stacked vertically; each has its own small loop
        const nLam = 8;
        for (let i = 0; i < nLam; i++) {
          const y0 = ry + (i + 0.5) * rh / nLam;
          ctx.save();
          ctx.globalAlpha = 0.25 + 0.5 * animPhase;
          ctx.strokeStyle = colors.accent;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.rect(rx + 8, y0 - rh / (nLam * 2) + 3, rw - 16, rh / nLam - 6);
          ctx.stroke();
          ctx.restore();
        }
        // Lamination divider lines
        ctx.strokeStyle = colors.borderStrong;
        ctx.setLineDash([2, 3]);
        for (let i = 1; i < nLam; i++) {
          const y0 = ry + i * rh / nLam;
          ctx.beginPath();
          ctx.moveTo(rx, y0); ctx.lineTo(rx + rw, y0);
          ctx.stroke();
        }
        ctx.setLineDash([]);
        ctx.fillStyle = colors.teal;
      } else {
        // One big loop spanning the whole cross-section
        ctx.save();
        ctx.globalAlpha = 0.45 + 0.5 * animPhase;
        ctx.strokeStyle = colors.pink;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.rect(rx + 6, ry + 6, rw - 12, rh - 12);
        ctx.stroke();
        ctx.restore();
        ctx.fillStyle = colors.pink;
      }
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText(laminated ? 'LAMINATED (50 thin layers)' : 'SOLID CORE', rx + 4, ry - 16);
      ctx.fillStyle = colors.textDim;
      ctx.fillText('eddy-current loops in cross-section', rx + 4, h - 18);
      ctx.restore();

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 18.5'}
      title="Core losses — why transformer cores are laminated"
      question="Solid iron or thin sheets? What changes?"
      caption={<>
        Two loss mechanisms run inside every transformer core. <strong>Hysteresis</strong> (left): the B-H curve
        encloses a finite area each AC cycle; that area is energy dissipated as heat per unit volume per cycle.
        <strong>Eddy currents</strong> (right): the changing flux drives circulating currents in the iron itself,
        which dump I²R into the core. Slicing the core into thin laminations cuts the eddy-current loop area and
        knocks eddy losses down by orders of magnitude — that's why every power transformer core is built from
        thousands of 0.3-mm sheets of grain-oriented silicon steel.
      </>}
      deeperLab={{ slug: 'inductance', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={260} setup={setup} />
      <DemoControls>
        <MiniSlider
          label="drive"
          value={drive} min={0.2} max={1.5} step={0.05}
          format={v => v.toFixed(2)}
          onChange={setDrive}
        />
        <MiniToggle label={laminated ? 'laminated' : 'solid'} checked={laminated} onChange={setLaminated} />
        <MiniReadout label="hysteresis (rel.)" value={<Num value={hystLoss} digits={2} />} />
        <MiniReadout label="eddy (rel.)" value={<Num value={eddyLoss} digits={2} />} />
        <MiniReadout label="total (rel.)" value={<Num value={totalLoss} digits={2} />} />
      </DemoControls>
    </Demo>
  );
}
