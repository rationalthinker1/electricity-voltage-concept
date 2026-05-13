/**
 * Demo D14.7 — Laser cavity
 *
 * Two parallel mirrors with a gain medium between (excited atoms shown as
 * dots that switch from "ground" to "excited" and back). Photons bouncing
 * back and forth between the mirrors stimulate emission of identical
 * photons, building up a coherent beam that exits through the partially-
 * silvered output mirror.
 *
 * Light-touch — the simulation conveys the picture rather than the kinetics.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniSlider, MiniToggle } from '@/components/Demo';

interface Props { figure?: string }

export function LaserCavityDemo({ figure }: Props) {
  const [pumpOn, setPumpOn] = useState(true);
  const [photonCount, setPhotonCount] = useState(8);

  const stateRef = useRef({ pumpOn, photonCount });
  useEffect(() => { stateRef.current = { pumpOn, photonCount }; }, [pumpOn, photonCount]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w: W, h: H } = info;
    let raf = 0;

    // Photons inside the cavity: each has an x position and a velocity (left/right)
    const photons: Array<{ x: number; vx: number; y: number }> = [];
    // Atoms in the gain medium: each is at (x, y) and has an excited boolean
    const NA = 30;
    const atoms: Array<{ x: number; y: number; excited: boolean; flashT: number }> = [];
    for (let i = 0; i < NA; i++) {
      atoms.push({
        x: 70 + Math.random() * (W - 140),
        y: 50 + Math.random() * (H - 100),
        excited: Math.random() < 0.5,
        flashT: 0,
      });
    }

    const tStart = performance.now() / 1000;
    let lastT = tStart;
    function draw() {
      const t = performance.now() / 1000;
      const dt = Math.min(0.06, t - lastT);
      lastT = t;
      const { pumpOn, photonCount } = stateRef.current;

      ctx.fillStyle = '#0d0d10';
      ctx.fillRect(0, 0, W, H);

      // Cavity mirrors at x = mirrorL and x = mirrorR
      const mirrorL = 50;
      const mirrorR = W - 50;
      const cy = H / 2;

      // Gain-medium tube (faint amber tint)
      ctx.fillStyle = 'rgba(255,107,42,0.06)';
      ctx.fillRect(mirrorL, 40, mirrorR - mirrorL, H - 80);

      // Left mirror — solid
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.fillRect(mirrorL - 6, 35, 6, H - 70);
      // Right mirror — partially transparent (output coupler)
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.fillRect(mirrorR, 35, 6, H - 70);

      // Atom positions + state
      for (const a of atoms) {
        // Pump excites atoms over time
        if (pumpOn && !a.excited && Math.random() < 0.005) a.excited = true;
        // Spontaneous decay
        if (a.excited && Math.random() < 0.001) {
          a.excited = false;
          a.flashT = t;
        }
        const radius = 3;
        const col = a.excited ? '#ff6b2a' : 'rgba(160,158,149,0.6)';
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.arc(a.x, a.y, radius, 0, Math.PI * 2); ctx.fill();
        if (t - a.flashT < 0.3) {
          ctx.strokeStyle = `rgba(255,107,42,${0.6 - (t - a.flashT) * 2})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.arc(a.x, a.y, radius + 6, 0, Math.PI * 2); ctx.stroke();
        }
      }

      // Maintain photon population
      while (photons.length < photonCount) {
        photons.push({
          x: mirrorL + 5 + Math.random() * (mirrorR - mirrorL - 10),
          vx: Math.random() < 0.5 ? -260 : 260,
          y: cy + (Math.random() - 0.5) * (H - 100),
        });
      }
      while (photons.length > photonCount) photons.pop();

      // Update photons
      for (const ph of photons) {
        ph.x += ph.vx * dt;
        if (ph.x <= mirrorL) { ph.x = mirrorL; ph.vx = Math.abs(ph.vx); }
        if (ph.x >= mirrorR) {
          // 90% reflect, 10% escape (output beam)
          if (Math.random() < 0.10) {
            // Emit out the right side
            ctx.strokeStyle = 'rgba(255,107,42,0.9)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(mirrorR + 6, ph.y);
            ctx.lineTo(W - 6, ph.y);
            ctx.stroke();
            ph.x = mirrorL + 5;
          } else {
            ph.x = mirrorR; ph.vx = -Math.abs(ph.vx);
          }
        }
        // Stimulated emission: find a nearby excited atom and de-excite it, adding a parallel photon
        if (Math.random() < 0.05) {
          for (const a of atoms) {
            if (!a.excited) continue;
            if (Math.abs(a.x - ph.x) < 14 && Math.abs(a.y - ph.y) < 14) {
              a.excited = false;
              a.flashT = t;
              break;
            }
          }
        }
        // Draw the photon as a small bright streak
        ctx.strokeStyle = 'rgba(255,107,42,0.85)';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(ph.x, ph.y);
        ctx.lineTo(ph.x - 0.04 * ph.vx, ph.y);
        ctx.stroke();
      }

      // Output beam exiting right mirror — composite glow
      ctx.fillStyle = 'rgba(255,107,42,0.15)';
      ctx.fillRect(mirrorR + 6, cy - 10, W - mirrorR - 12, 20);

      // Labels
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(160,158,149,0.85)';
      ctx.textAlign = 'center';
      ctx.fillText('100% mirror', mirrorL, 28);
      ctx.fillText('output coupler', mirrorR, 28);
      ctx.textAlign = 'left';
      ctx.fillText('gain medium', mirrorL + 8, H - 8);
      ctx.fillStyle = 'rgba(255,107,42,0.9)';
      ctx.textAlign = 'right';
      ctx.fillText('coherent output →', W - 8, cy - 14);

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 14.7'}
      title="Inside a laser cavity"
      question="What makes laser light coherent?"
      caption={<>
        Two parallel mirrors trap photons in a long round trip; in between, a gain medium of
        excited atoms (amber dots) gets pumped by an external energy source. A passing photon
        of the right wavelength <em>stimulates</em> the atom to emit a second photon in the same
        direction, phase, and polarisation — coherent amplification. One mirror is partially
        transmitting; the small leakage out that side is the laser beam.
      </>}
    >
      <AutoResizeCanvas height={260} setup={setup} />
      <DemoControls>
        <MiniToggle label={pumpOn ? 'pump · ON' : 'pump · OFF'} checked={pumpOn} onChange={setPumpOn} />
        <MiniSlider label="photons in cavity" value={photonCount} min={1} max={30} step={1}
          format={v => v.toFixed(0)} onChange={v => setPhotonCount(Math.round(v))} />
      </DemoControls>
    </Demo>
  );
}
