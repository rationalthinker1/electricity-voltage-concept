/**
 * Demo D6.1 — Where does the energy flow?
 *
 * A schematic battery + bulb circuit. The reader toggles between two
 * pictures of where the energy goes from the battery to the bulb:
 *
 *   "Old picture" — electrons stream along the wire from + terminal
 *     to bulb to − terminal, carrying energy with them. (Wrong.)
 *   "Real picture" — energy lives in the field outside the wire and
 *     flows in radially through the bulb's surrounding space. The
 *     wire just guides the field. (Right.)
 *
 * No sliders; this is a contrast viz. The whole point is the side-by-side
 * mental flip when you switch the toggle.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { AutoResizeCanvas, type CanvasInfo } from '@/components/AutoResizeCanvas';
import { Demo, DemoControls, MiniToggle } from '@/components/Demo';

interface Props { figure?: string }

interface Carrier {
  // path parameter 0..1 along the polyline
  s: number;
  // small jitter offset perpendicular to path
  jitter: number;
}
interface Inflow {
  // angle around the bulb in radians
  theta: number;
  // radial fraction 1 → far, 0 → at bulb surface
  r: number;
}

export function WhereDoesEnergyFlowDemo({ figure }: Props) {
  const [realPicture, setRealPicture] = useState(false);

  const stateRef = useRef({ realPicture });
  useEffect(() => { stateRef.current = { realPicture }; }, [realPicture]);

  const setup = useCallback((info: CanvasInfo) => {
    const { ctx, w, h } = info;
    let raf = 0;

    // Battery on the left, bulb on the right; wires form a loop.
    const batteryX = 90;
    const bulbX = w - 100;
    const cyTop = h * 0.32;
    const cyBot = h * 0.78;
    const bulbR = 30;

    // Polyline path of the conventional current loop, used by the
    // "old picture" carriers. Goes + terminal → top wire → bulb top →
    // through bulb → bulb bottom → bottom wire → − terminal.
    const path: Array<[number, number]> = [
      [batteryX + 18, cyTop],         // top of + terminal
      [bulbX - bulbR, cyTop],         // top wire
      [bulbX, cyTop],                 // up to bulb top
      [bulbX, cyBot],                 // through the filament
      [bulbX - bulbR, cyBot],         // out the bulb bottom
      [batteryX + 18, cyBot],         // bottom wire back
    ];
    // Cumulative arc lengths
    const segLen: number[] = [];
    let totalLen = 0;
    for (let i = 0; i < path.length - 1; i++) {
      const a = path[i]!; const b = path[i + 1]!;
      const d = Math.hypot(b[0] - a[0], b[1] - a[1]);
      segLen.push(d); totalLen += d;
    }
    function pointAt(s: number): [number, number] {
      // s in [0,1]
      let dist = s * totalLen;
      for (let i = 0; i < segLen.length; i++) {
        if (dist <= segLen[i]!) {
          const a = path[i]!; const b = path[i + 1]!;
          const f = dist / segLen[i]!;
          return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
        }
        dist -= segLen[i]!;
      }
      const last = path[path.length - 1]!;
      return [last[0], last[1]];
    }

    // 60 carriers spaced evenly along the loop, drift slowly.
    const carriers: Carrier[] = [];
    for (let i = 0; i < 60; i++) {
      carriers.push({ s: i / 60, jitter: (Math.random() - 0.5) * 4 });
    }
    // Field inflow particles for the real picture.
    const inflow: Inflow[] = [];
    const MAX_INFLOW = 90;

    function spawnInflow() {
      while (inflow.length < MAX_INFLOW) {
        inflow.push({
          theta: Math.random() * Math.PI * 2,
          r: 1.0 + Math.random() * 0.4,
        });
      }
    }

    function drawWire(yPath: Array<[number, number]>) {
      ctx.strokeStyle = 'rgba(255,107,42,0.55)';
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(yPath[0]![0], yPath[0]![1]);
      for (let i = 1; i < yPath.length; i++) ctx.lineTo(yPath[i]![0], yPath[i]![1]);
      ctx.stroke();
    }

    function drawBattery() {
      // Two parallel plates: long (positive) on top, short (negative) on bottom.
      const x = batteryX;
      ctx.strokeStyle = '#ecebe5';
      ctx.lineWidth = 3;
      // long plate (top, +)
      ctx.beginPath();
      ctx.moveTo(x - 18, cyTop); ctx.lineTo(x + 18, cyTop);
      ctx.stroke();
      // short plate (bottom, −)
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x - 10, cyBot); ctx.lineTo(x + 10, cyBot);
      ctx.stroke();
      // labels
      ctx.fillStyle = '#ff3b6e';
      ctx.font = 'bold 16px "JetBrains Mono", monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('+', x - 30, cyTop);
      ctx.fillStyle = '#5baef8';
      ctx.fillText('−', x - 30, cyBot);
      ctx.fillStyle = 'rgba(160,158,149,.85)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText('battery', x, (cyTop + cyBot) / 2);
    }

    function drawBulb() {
      // Filament + glass bulb circle around the right-side run.
      const cy = (cyTop + cyBot) / 2;
      // Glow halo when "on"
      const glow = ctx.createRadialGradient(bulbX, cy, 0, bulbX, cy, bulbR * 2.6);
      glow.addColorStop(0, 'rgba(255,200,120,0.35)');
      glow.addColorStop(1, 'rgba(255,200,120,0)');
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(bulbX, cy, bulbR * 2.6, 0, Math.PI * 2); ctx.fill();
      // Glass envelope
      ctx.strokeStyle = 'rgba(255,200,120,0.85)';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(bulbX, cy, bulbR, 0, Math.PI * 2); ctx.stroke();
      // Filament squiggle (across the vertical run)
      ctx.strokeStyle = 'rgba(255,200,120,0.95)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      const turns = 6;
      for (let i = 0; i <= 60; i++) {
        const f = i / 60;
        const yy = cyTop + 8 + (cyBot - cyTop - 16) * f;
        const xx = bulbX + Math.sin(f * turns * Math.PI) * 8;
        if (i === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
      }
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,200,120,0.85)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText('bulb', bulbX, cy + bulbR + 8);
    }

    function draw() {
      const { realPicture } = stateRef.current;
      ctx.fillStyle = '#0d0d10';
      ctx.fillRect(0, 0, w, h);

      // Header label, top-left
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillStyle = realPicture ? '#ff6b2a' : '#a09e95';
      ctx.fillText(realPicture
        ? 'Real picture — energy flows through the field, into the bulb from outside'
        : 'Old picture — electrons stream along the wire, carrying energy', 18, 14);

      drawWire(path);
      drawBattery();

      if (!realPicture) {
        // Old picture: carriers drifting along the loop.
        ctx.fillStyle = '#5baef8';
        for (const c of carriers) {
          c.s += 0.0025;
          if (c.s > 1) c.s -= 1;
          const [px, py] = pointAt(c.s);
          // perp jitter using path tangent
          const [px2, py2] = pointAt((c.s + 0.001) % 1);
          const tx = px2 - px, ty = py2 - py;
          const len = Math.hypot(tx, ty) || 1;
          const nx = -ty / len, ny = tx / len;
          const x = px + nx * c.jitter;
          const y = py + ny * c.jitter;
          ctx.beginPath(); ctx.arc(x, y, 2.6, 0, Math.PI * 2); ctx.fill();
        }
      } else {
        // Real picture: field arrows streaming inward toward the bulb.
        const cy = (cyTop + cyBot) / 2;
        spawnInflow();
        for (let i = inflow.length - 1; i >= 0; i--) {
          const p = inflow[i]!;
          p.r -= 0.012;
          if (p.r <= 0.0) { inflow.splice(i, 1); continue; }
          const distFar = bulbR + p.r * bulbR * 5;
          const distNear = bulbR + Math.max(0, (p.r - 0.05)) * bulbR * 5;
          const fx = bulbX + Math.cos(p.theta) * distFar;
          const fy = cy + Math.sin(p.theta) * distFar;
          const tx = bulbX + Math.cos(p.theta) * distNear;
          const ty = cy + Math.sin(p.theta) * distNear;
          const alpha = 0.9 * (1 - p.r * 0.4);
          ctx.strokeStyle = `rgba(255,107,42,${alpha.toFixed(3)})`;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(fx, fy);
          ctx.lineTo(tx, ty);
          ctx.stroke();
          ctx.fillStyle = `rgba(255,107,42,${alpha.toFixed(3)})`;
          ctx.beginPath(); ctx.arc(tx, ty, 1.8, 0, Math.PI * 2); ctx.fill();
        }
      }

      drawBulb();

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Demo
      figure={figure ?? 'Fig. 6.1'}
      title="Where does the energy go?"
      question="From battery to bulb — does the energy travel through the wire, or through the space around it?"
      caption={<>
        Toggle the picture. In the <strong>old</strong> view, energy hitches a ride on the drifting electrons and rides along
        the copper. In the <strong>real</strong> view, energy lives in the electromagnetic field that fills the surrounding space, and pours
        radially inward into the resistive parts (here, the bulb's filament) on every side at once. The rest of the chapter is the proof.
      </>}
      deeperLab={{ slug: 'poynting', label: 'See full lab' }}
    >
      <AutoResizeCanvas height={300} setup={setup} />
      <DemoControls>
        <MiniToggle
          label={realPicture ? 'Real picture (field inflow)' : 'Old picture (electrons carry it)'}
          checked={realPicture}
          onChange={setRealPicture}
        />
      </DemoControls>
    </Demo>
  );
}
