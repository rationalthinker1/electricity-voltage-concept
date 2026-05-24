/**
 * Demo D18.7 — Laser cavity
 *
 * Two parallel mirrors with a gain medium between (excited atoms shown as
 * dots that switch from "ground" to "excited" and back). Photons bouncing
 * back and forth between the mirrors stimulate emission of identical
 * photons, building up a coherent beam that exits through the partially-
 * silvered output mirror.
 *
 * Light-touch — the simulation conveys the picture rather than the kinetics.
 */
import { useState } from 'react';

import { AutoResizeCanvas } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniSlider, MiniToggle } from '@/components/Demo';
import { withAlpha } from '@/lib/canvasTheme';
import { drawLabel } from "@/lib/canvasLayout";
import { useSimLoop } from '@/lib/useSimLoop';
import { useSimState } from '@/lib/useSimState';

interface Props {
  figure: string;
}

interface LaserCtx {
  photons: Array<{ x: number; vx: number; y: number }>;
  atoms: Array<{ x: number; y: number; excited: boolean; flashT: number }>;
}

export function LaserCavityDemo({ figure }: Props) {
  const [pumpOn, setPumpOn] = useState(true);
  const [photonCount, setPhotonCount] = useState(8);

  const stateRef = useSimState({ pumpOn, photonCount });

  const setup = useSimLoop(
    stateRef,
    ({ ctx, w: W, h: H, colors }, state, dt, simTime, c: LaserCtx) => {
      const { pumpOn, photonCount } = state;
      const safeDt = Math.min(0.06, dt);
      const t = simTime;

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, W, H);

      // Cavity mirrors at x = mirrorL and x = mirrorR
      const mirrorL = 50;
      const mirrorR = W - 50;
      const cy = H / 2;

      // Gain-medium tube (faint amber tint)
      ctx.save();
      ctx.globalAlpha = 0.06;
      ctx.fillStyle = colors.accent;
      ctx.fillRect(mirrorL, 40, mirrorR - mirrorL, H - 80);

      // Left mirror — solid
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = 0.75;
      ctx.fillStyle = colors.text;
      ctx.fillRect(mirrorL - 6, 35, 6, H - 70);
      // Right mirror — partially transparent (output coupler)
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = 0.45;
      ctx.fillStyle = colors.text;
      ctx.fillRect(mirrorR, 35, 6, H - 70);

      // Atom positions + state
      for (const a of c.atoms) {
        // Pump excites atoms over time
        if (pumpOn && !a.excited && Math.random() < 0.005) a.excited = true;
        // Spontaneous decay
        if (a.excited && Math.random() < 0.001) {
          a.excited = false;
          a.flashT = t;
        }
        const radius = 3;
        const col = a.excited ? colors.accent : withAlpha(colors.textDim, 0.6);
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(a.x, a.y, radius, 0, Math.PI * 2);
        ctx.fill();
        if (t - a.flashT < 0.3) {
          ctx.strokeStyle = withAlpha(colors.accent, 0.6 - (t - a.flashT) * 2);
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(a.x, a.y, radius + 6, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Maintain photon population
      while (c.photons.length < photonCount) {
        c.photons.push({
          x: mirrorL + 5 + Math.random() * (mirrorR - mirrorL - 10),
          vx: Math.random() < 0.5 ? -260 : 260,
          y: cy + (Math.random() - 0.5) * (H - 100),
        });
      }
      while (c.photons.length > photonCount) c.photons.pop();

      // Update photons
      for (const ph of c.photons) {
        ph.x += ph.vx * safeDt;
        if (ph.x <= mirrorL) {
          ph.x = mirrorL;
          ph.vx = Math.abs(ph.vx);
        }
        if (ph.x >= mirrorR) {
          // 90% reflect, 10% escape (output beam)
          if (Math.random() < 0.1) {
            // Emit out the right side
            ctx.strokeStyle = colors.accent;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(mirrorR + 6, ph.y);
            ctx.lineTo(W - 6, ph.y);
            ctx.stroke();
            ph.x = mirrorL + 5;
          } else {
            ph.x = mirrorR;
            ph.vx = -Math.abs(ph.vx);
          }
        }
        // Stimulated emission: find a nearby excited atom and de-excite it, adding a parallel photon
        if (Math.random() < 0.05) {
          for (const a of c.atoms) {
            if (!a.excited) continue;
            if (Math.abs(a.x - ph.x) < 14 && Math.abs(a.y - ph.y) < 14) {
              a.excited = false;
              a.flashT = t;
              break;
            }
          }
        }
        // Draw the photon as a small bright streak
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(ph.x, ph.y);
        ctx.lineTo(ph.x - 0.04 * ph.vx, ph.y);
        ctx.stroke();
      }

      // Output beam exiting right mirror — composite glow
      ctx.restore();
      ctx.fillStyle = colors.accentSoft;
      ctx.fillRect(mirrorR + 6, cy - 10, W - mirrorR - 12, 20);

      // Labels
      ctx.fillStyle = colors.textDim;
      drawLabel(ctx, { text: '100% mirror', x: mirrorL, y: 28, font: '10px "JetBrains Mono", monospace', align: 'center' });
      drawLabel(ctx, { text: 'output coupler', x: mirrorR, y: 28, font: '10px "JetBrains Mono", monospace', align: 'center' });
      drawLabel(ctx, { text: 'gain medium', x: mirrorL + 8, y: H - 8, font: '10px "JetBrains Mono", monospace' });
      ctx.fillStyle = colors.accent;
      drawLabel(ctx, { text: 'coherent output →', x: W - 8, y: cy - 14, font: '10px "JetBrains Mono", monospace', align: 'right' });
    },
    [],
    ({ w: W, h: H }) => {
      // Atoms in the gain medium: each is at (x, y) and has an excited boolean
      const NA = 30;
      const atoms: LaserCtx['atoms'] = [];
      for (let i = 0; i < NA; i++) {
        atoms.push({
          x: 70 + Math.random() * (W - 140),
          y: 50 + Math.random() * (H - 100),
          excited: Math.random() < 0.5,
          flashT: 0,
        });
      }
      return { context: { photons: [], atoms } as LaserCtx };
    },
  );

  return (
    <Demo
      figure={figure}
      title="Inside a laser cavity"
      question="What makes laser light coherent?"
      caption={
        <>
          Two parallel mirrors trap photons in a long round trip; in between, a gain medium of
          excited atoms (amber dots) gets pumped by an external energy source. A passing photon of
          the right wavelength <em>stimulates</em> the atom to emit a second photon in the same
          direction, phase, and polarisation — coherent amplification. One mirror is partially
          transmitting; the small leakage out that side is the laser beam.
        </>
      }
      deeperLab={{ slug: 'diffraction-interference', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={260} setup={setup} />
      <DemoControls>
        <MiniToggle
          label={pumpOn ? 'pump · ON' : 'pump · OFF'}
          checked={pumpOn}
          onChange={setPumpOn}
        />
        <MiniSlider
          label="photons in cavity"
          value={photonCount}
          min={1}
          max={30}
          step={1}
          format={(v) => v.toFixed(0)}
          onChange={(v) => setPhotonCount(Math.round(v))}
        />
      </DemoControls>
    </Demo>
  );
}
